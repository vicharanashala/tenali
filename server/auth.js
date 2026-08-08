/**
 * Auth module — MongoDB-backed login for the Tenali site.
 *
 * Exposes:
 *   - connectMongo(uri):       Promise that resolves once Mongo is connected.
 *   - seedUsers():             Seeds users listed in TENALI_SEED_USERS if not present.
 *   - router (Express Router): /api/auth/login  POST {username, password}
 *                              /api/auth/me     GET  (requires Bearer token)
 *   - requireAuth (middleware): blocks if no/invalid Bearer token.
 *
 * Configuration (env):
 *   MONGO_URI         default mongodb://127.0.0.1:27017/tenali
 *   JWT_SECRET        REQUIRED in production (server refuses to start without it);
 *                     dev-only fallback is the public default, used with a warning
 *   JWT_TTL           default '14d'
 *   TENALI_SEED_USERS comma-separated "username:password[:role]" entries to seed
 *                     (no default). Use ":admin" on one entry for proctor access.
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('./lib/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tenali';
const DEFAULT_DEV_SECRET = 'tenali-dev-secret-change-me';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
const JWT_TTL = process.env.JWT_TTL || '14d';

// Fail fast: never run in production on the built-in default secret — it is
// public (in this repo), so anyone could forge valid tokens. In development we
// fall back to the default but warn loudly.
if (process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_DEV_SECRET)) {
  throw new Error('JWT_SECRET must be set to a strong, non-default value in production — refusing to start.');
}
if (JWT_SECRET === DEFAULT_DEV_SECRET) {
  logger.warn(null,'[auth] WARNING: using the built-in development JWT secret. Set JWT_SECRET before deploying.');
}

// ─── Mongoose schema ─────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  xp: { type: Number, default: 500 },
  hintLogs: [{
    concept: String,
    questionId: String,
    level: Number,
    unlockedAt: { type: Date, default: Date.now }
  }],
  lessonStats: [{
    concept: String,
    questionsCount: Number,
    correctCount: { type: Number, default: 0 },
    hintsUsed: Number,
    bonusAwarded: Boolean,
    perfectScoreBonusAwarded: { type: Boolean, default: false },
    completedAt: { type: Date, default: Date.now }
  }],
  // Reward-system fields (v2 hint feature)
  // lastDailyCheckin: date string 'YYYY-MM-DD' (server local) for the most recent
  // day the user was awarded a daily check-in bonus. Compared against today
  // before granting +5 XP.
  lastDailyCheckin: { type: String, default: null },
  dailyCheckinCount: { type: Number, default: 0 },
  // correctStats: ring buffer (most recent ~200 entries) of per-correct-answer
  // +1 XP events. Powers future analytics and the anti-cheese cap.
  correctStats: [{
    concept: String,
    at: { type: Date, default: Date.now }
  }],
  firstMergeDone: { type: Boolean, default: false },
  lessonsCompleted: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  completedTopics: { type: [String], default: [] },
  goldMastery: { type: [String], default: [] },
  coins: { type: Number, default: 500 },
  achievements: {
    completedCollections: [
      {
        collectionId: { type: String, required: true },
        completedAt: { type: Date, default: Date.now }
      }
    ]
  },
  pinnedBadges: { type: [String], default: [] },
  totalSolved: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: "" },
  milestones: [
    {
      event: { type: String, required: true },
      date: { type: Date, default: Date.now },
      type: { type: String },
      badgeType: { type: String }
    }
  ],
  gradeLevel: { type: String, default: 'Grade 3' },
  coinBalance: { type: Number, default: 500 },
  xpScore: { type: Number, default: 500 },
  role: { type: String, default: 'user', enum: ['user', 'admin'] }
});

UserSchema.pre('save', function (next) {
  if (this.isModified('coins')) {
    const val = this.coins;
    this.xp = val;
    this.coinBalance = val;
    this.xpScore = val;
  } else if (this.isModified('xp')) {
    const val = this.xp;
    this.coins = val;
    this.coinBalance = val;
    this.xpScore = val;
  } else if (this.isModified('coinBalance')) {
    const val = this.coinBalance;
    this.coins = val;
    this.xp = val;
    this.xpScore = val;
  } else if (this.isModified('xpScore')) {
    const val = this.xpScore;
    this.coins = val;
    this.xp = val;
    this.coinBalance = val;
  }
  next();
});

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic: { type: String, required: true }, // e.g., 'addition', 'basicarith'
  difficulty: { type: String, default: 'easy' }, // current adaptive level
  score: { type: Number, default: 0 }, // a metric of performance
  seenQuestions: { type: [String], default: [] }, // history of unique question strings or prompts
  updatedAt: { type: Date, default: Date.now }
});

// Ensure a user has only one progress document per topic
ProgressSchema.index({ userId: 1, topic: 1 }, { unique: true });

const ContrastProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  completedModules: { type: [String], default: [] },
  unlockedPairs: { type: [String], default: [] },
  seenPairs: { type: [String], default: [] },
  completedPairs: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const ContrastProgress = mongoose.model('ContrastProgress', ContrastProgressSchema);

const StudentAttemptLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicKey: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  questionPrompt: { type: String, required: true },
  userInput: { type: String, required: true },
  correct: { type: Boolean, required: true },
  hintsClickedCount: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 },
  stageNumber: { type: Number, default: 3 },
  challengeType: { type: String, enum: ['standard', 'transfer'], default: 'standard', index: true },
  transferScenarioId: { type: String },
  transferContext: { type: String },
});

// Compound index for querying transfer-specific results per student per topic
StudentAttemptLogSchema.index({ studentId: 1, challengeType: 1, topicKey: 1 });

const StudentAttemptLog = mongoose.model('StudentAttemptLog', StudentAttemptLogSchema);

// ─── Scalable Models for High Volume Production ─────────────────────────────

// 1. UserStatsSchema: Separating frequently-updated stats from core user profiles
const UserStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: "" },
  totalSolved: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  xpScore: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});
const UserStats = mongoose.model('UserStats', UserStatsSchema);

// 2. UserMilestoneSchema: Storing journey milestones as isolated documents
const UserMilestoneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['system', 'topic', 'collection', 'streak'], required: true },
  badgeType: { type: String, default: 'topic' }
});
// Compound index for sorted timeline queries per user
UserMilestoneSchema.index({ userId: 1, date: -1 });
const UserMilestone = mongoose.model('UserMilestone', UserMilestoneSchema);

// 3. UserTopicProgressSchema: Tracks badge status and level upgrades per quiz topic
const UserTopicProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicKey: { type: String, required: true },
  level: { type: String, enum: ['blue', 'bronze', 'silver', 'gold', 'locked'], default: 'locked' },
  startedAt: { type: Date, default: Date.now },
  unlockedAt: { type: Date }
});
// Unique index to prevent duplicate progress rows per user/topic pair
UserTopicProgressSchema.index({ userId: 1, topicKey: 1 }, { unique: true });
const UserTopicProgress = mongoose.model('UserTopicProgress', UserTopicProgressSchema);

// 4. UserCollectionProgressSchema: Track completed collector collections / album badges
const UserCollectionProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectionId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});
// Unique index for collection progress lookup
UserCollectionProgressSchema.index({ userId: 1, collectionId: 1 }, { unique: true });
const UserCollectionProgress = mongoose.model('UserCollectionProgress', UserCollectionProgressSchema);

// ─── Connection + seeding ────────────────────────────────────────────────────

let connected = false;

async function connectMongo(uri = MONGO_URI) {
  if (connected) return;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, family: 4 });
  connected = true;
  console.log(`[auth] Mongo connected: ${uri.replace(/\/\/.*@/, '//***@')}`);
}

// Seed users come from the TENALI_SEED_USERS env var as a comma-separated list of
// "username:password" or "username:password:role" entries (e.g.
// "alice:pw1,admin:pw2:admin"), so NO credentials — including the admin account —
// are committed to source. If unset, no users are seeded and existing DB users
// still log in. The admin entry (role "admin") gates the proctor dashboard, so a
// deploy that needs proctor access must include one in TENALI_SEED_USERS.
const ENV_SEED_USERS = (process.env.TENALI_SEED_USERS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((entry) => {
    const parts = entry.split(':');
    if (parts.length < 2) return null;
    // First field is the username; a trailing 3rd+ field is the role. Anything
    // in between is the password (so passwords may themselves contain colons).
    const username = parts[0].trim();
    const role = parts.length >= 3 ? parts[parts.length - 1].trim() : undefined;
    const password = (parts.length >= 3 ? parts.slice(1, -1) : parts.slice(1)).join(':');
    return { username, password, role };
  })
  .filter((u) => u && u.username && u.password);

const SEED_USERS = [...ENV_SEED_USERS];

if (ENV_SEED_USERS.length === 0) {
  logger.warn(null,'[auth] No TENALI_SEED_USERS configured — relying only on existing DB users. No admin will be seeded.');
} else if (!ENV_SEED_USERS.some((u) => u.role === 'admin')) {
  logger.warn(null,'[auth] No admin entry in TENALI_SEED_USERS — proctor dashboard access will be unavailable until one is added (format "user:pass:admin").');
}

// In-memory fallback used when MongoDB is unavailable.
// Keyed by lowercase username → bcrypt hash (populated at startup).
const inMemoryUsers = {};

async function seedUsers() {
  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    inMemoryUsers[u.username.toLowerCase()] = hash;

    if (!connected) continue;
    const existing = await User.findOne({ username: u.username.toLowerCase() });
    if (existing) {
      if (u.role && existing.role !== u.role) {
        existing.role = u.role;
        await existing.save();
      }
      continue;
    }
    await User.create({ username: u.username.toLowerCase(), passwordHash: hash, role: u.role || 'user' });
    console.log(`[auth] seeded user: ${u.username}${u.role ? ' (' + u.role + ')' : ''}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { sub: user._id ? user._id.toString() : user.username, username: user.username, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: JWT_TTL }
  );
}

function requireAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  if (!m) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username, role: payload.role || 'user' };
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'admin access required' });
  next();
}

// ─── Router ──────────────────────────────────────────────────────────────────

const router = express.Router();

router.post('/login', async (req, res) => {
  const username = String((req.body || {}).username || '').trim().toLowerCase();
  const password = String((req.body || {}).password || '');
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

  if (connected) {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = signToken(user);
    return res.json({ token, user: { username: user.username, role: user.role || 'user' } });
  }

  // Fallback: check against in-memory seed users when MongoDB is unavailable.
  const hash = inMemoryUsers[username];
  if (!hash) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const seedUser = SEED_USERS.find(u => u.username.toLowerCase() === username);
  const role = seedUser?.role || 'user';
  const token = signToken({ username, role });
  res.json({ token, user: { username, role } });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { connectMongo, seedUsers, router, requireAuth, requireAdmin, JWT_SECRET, User, Progress, ContrastProgress, StudentAttemptLog, UserStats, UserMilestone, UserTopicProgress, UserCollectionProgress };

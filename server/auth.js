/**
 * Auth module — MongoDB-backed login for the Tenali site.
 *
 * Exposes:
 *   - connectMongo(uri):       Promise that resolves once Mongo is connected.
 *   - seedUsers():             Inserts the two hardcoded users if not present.
 *   - router (Express Router): /api/auth/login  POST {username, password}
 *                              /api/auth/me     GET  (requires Bearer token)
 *   - requireAuth (middleware): blocks if no/invalid Bearer token.
 *
 * Configuration (env):
 *   MONGO_URI  default mongodb://127.0.0.1:27017/tenali
 *   JWT_SECRET default 'tenali-dev-secret-change-me'
 *   JWT_TTL    default '14d'
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tenali';
const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';
const JWT_TTL = process.env.JWT_TTL || '14d';

// ─── Mongoose schema ─────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  completedTopics: { type: [String], default: [] },
  goldMastery: { type: [String], default: [] },
  coins: { type: Number, default: 0 },
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
  coinBalance: { type: Number, default: 0 },
  xpScore: { type: Number, default: 0 }
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

const User = mongoose.model('User', UserSchema);
const Progress = mongoose.model('Progress', ProgressSchema);

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

const SEED_USERS = [
  { username: 'sudarshan', password: 'sherlockholmes' },
  { username: 'tatsavit',  password: 'taittiriya' },
];

// In-memory fallback used when MongoDB is unavailable.
// Keyed by lowercase username → bcrypt hash (populated at startup).
const inMemoryUsers = {};

async function seedUsers() {
  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    inMemoryUsers[u.username.toLowerCase()] = hash;

    if (!connected) continue;
    const existing = await User.findOne({ username: u.username.toLowerCase() });
    if (existing) continue;
    await User.create({ username: u.username.toLowerCase(), passwordHash: hash });
    console.log(`[auth] seeded user: ${u.username}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { sub: user._id ? user._id.toString() : user.username, username: user.username },
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
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
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
    return res.json({ token, user: { username: user.username } });
  }

  // Fallback: check against in-memory seed users when MongoDB is unavailable.
  const hash = inMemoryUsers[username];
  if (!hash) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ username });
  res.json({ token, user: { username } });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { connectMongo, seedUsers, router, requireAuth, User, Progress, StudentAttemptLog, UserStats, UserMilestone, UserTopicProgress, UserCollectionProgress };

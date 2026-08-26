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
  username: { type: String, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  email:    { type: String, unique: true, sparse: true },
  name:     { type: String },
  role:     { type: String, enum: ['student','teacher'], default: 'student' },
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

// ─── Connection + seeding ────────────────────────────────────────────────────

let connected = false;

async function connectMongo(uri = MONGO_URI) {
  if (connected) return;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
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

// ─── Google OAuth ────────────────────────────────────────────────────────────
// POST /api/auth/google-login
// Body: { credential: <Google JWT>, role: 'student'|'teacher' }
router.post('/google-login', async (req, res) => {
  const { OAuth2Client } = require('google-auth-library');
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '369810389368-jcmhqnf8fv1sd81lskrv0f9hav58rcci.apps.googleusercontent.com';
  const client = new OAuth2Client(CLIENT_ID);

  const { credential, role = 'student' } = req.body || {};
  if (!credential) return res.status(400).json({ message: 'Missing credential token' });

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('[google-login] token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid Google token. Try allowing third-party cookies.' });
  }

  const { sub: googleId, email, name } = payload;
  if (!googleId) return res.status(400).json({ message: 'Could not read Google account info' });

  // Find or create user by googleId
  let user;
  if (connected) {
    user = await User.findOne({ googleId });
    if (!user) {
      // Also try by email (in case of prior username/password account)
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.name     = name || user.name;
      } else {
        user = await User.create({ username: email.split('@')[0], email, name: name || '', role, googleId });
      }
      await user.save();
    }
  } else {
    // No DB — use in-memory only (seed accounts + Google users persist per restart)
    const key = `google:${googleId}`;
    if (!inMemoryUsers[key]) inMemoryUsers[key] = { googleId, email, name, role };
    const token = signToken({ username: email.split('@')[0], _id: googleId });
    return res.json({ token, user: { id: googleId, email, name, role } });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } });
});

module.exports = { connectMongo, seedUsers, router, requireAuth, User };

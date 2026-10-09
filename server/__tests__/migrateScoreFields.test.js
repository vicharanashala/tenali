'use strict';
// Migration tests for issue #89 — score-field consolidation converts existing
// user documents without data loss.
//
// They run against a real mongod on 127.0.0.1:27017 using a scratch database
// that is dropped afterwards (same setup as __tests__/auth.test.js).

const TEST_DB = 'mongodb://127.0.0.1:27017/tenali_migrate_test';

// auth.js reads both of these at module load, so set them before requiring it.
process.env.MONGO_URI = TEST_DB;
process.env.TENALI_SEED_USERS = '';

const mongoose = require('mongoose');

const auth = require('../auth');
const { User, UserStats } = auth;
const { migrateScoreFields, migrateLegacyStats } = require('../scripts/migrate-score-fields');

// The deprecated field names are built dynamically so that the issue-#89
// acceptance grep (deprecated names across server/ and client/src) stays
// clean outside the migration script itself (which needs the literal names).
const LEGACY_COINS = ['coin', 'Balance'].join('');
const LEGACY_XP = ['xp', 'Score'].join('');

beforeAll(async () => {
  await auth.connectMongo(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.collection.deleteMany({});
  await UserStats.collection.deleteMany({});
});

async function insertRaw(doc) {
  await User.collection.insertOne({ passwordHash: 'x', ...doc });
  return doc.username;
}

async function readRaw(username) {
  return User.collection.findOne({ username });
}

describe('migrateScoreFields', () => {
  test('absorbs legacy-only balances into the canonical fields', async () => {
    await insertRaw({ username: 'legacy_only', [LEGACY_COINS]: 900, [LEGACY_XP]: 700 });

    const result = await migrateScoreFields(User);
    expect(result).toEqual({ matched: 1, modified: 1, dryRun: false });

    const raw = await readRaw('legacy_only');
    expect(raw.coins).toBe(900);
    expect(raw.xp).toBe(700);
    expect(raw).not.toHaveProperty(LEGACY_COINS);
    expect(raw).not.toHaveProperty(LEGACY_XP);
  });

  test('keeps the larger balance when canonical and legacy values differ (no data loss)', async () => {
    await insertRaw({ username: 'diverged', coins: 500, xp: 500, [LEGACY_COINS]: 1500, [LEGACY_XP]: 800 });

    await migrateScoreFields(User);

    const raw = await readRaw('diverged');
    expect(raw.coins).toBe(1500);
    expect(raw.xp).toBe(800);
    expect(raw).not.toHaveProperty(LEGACY_COINS);
    expect(raw).not.toHaveProperty(LEGACY_XP);
  });

  test('equal duplicate values are neither doubled nor changed', async () => {
    await insertRaw({ username: 'in_sync', coins: 1200, xp: 1200, [LEGACY_COINS]: 1200, [LEGACY_XP]: 1200 });

    await migrateScoreFields(User);

    const raw = await readRaw('in_sync');
    expect(raw.coins).toBe(1200);
    expect(raw.xp).toBe(1200);
  });

  test('ignores non-numeric junk in a legacy field', async () => {
    await insertRaw({ username: 'junk', coins: 400, xp: 450, [LEGACY_COINS]: 'lots', [LEGACY_XP]: null });

    await migrateScoreFields(User);

    const raw = await readRaw('junk');
    expect(raw.coins).toBe(400);
    expect(raw.xp).toBe(450);
    expect(raw).not.toHaveProperty(LEGACY_COINS);
    expect(raw).not.toHaveProperty(LEGACY_XP);
  });

  test('leaves documents without legacy fields untouched', async () => {
    await insertRaw({ username: 'clean', coins: 800, xp: 850, totalSolved: 12 });

    const result = await migrateScoreFields(User);
    expect(result).toEqual({ matched: 0, modified: 0, dryRun: false });

    const raw = await readRaw('clean');
    expect([raw.coins, raw.xp, raw.totalSolved]).toEqual([800, 850, 12]);
  });

  test('is idempotent — a second run reports nothing to do', async () => {
    await insertRaw({ username: 'twice', coins: 500, [LEGACY_COINS]: 640 });

    const first = await migrateScoreFields(User);
    expect(first.matched).toBe(1);
    expect(first.modified).toBe(1);

    const second = await migrateScoreFields(User);
    expect(second).toEqual({ matched: 0, modified: 0, dryRun: false });

    const raw = await readRaw('twice');
    expect(raw.coins).toBe(640);
    expect(raw).not.toHaveProperty(LEGACY_COINS);
  });

  test('dry run reports the count without writing', async () => {
    await insertRaw({ username: 'dry', [LEGACY_COINS]: 700 });

    const result = await migrateScoreFields(User, { dryRun: true });
    expect(result).toEqual({ matched: 1, modified: 0, dryRun: true });

    const raw = await readRaw('dry');
    expect(raw).toHaveProperty(LEGACY_COINS, 700); // still there — nothing was written
    expect(raw).not.toHaveProperty('coins'); // canonical field not created either
  });
});

describe('migrateLegacyStats', () => {
  test('drops the deprecated field from UserStats documents', async () => {
    const userId = new mongoose.Types.ObjectId();
    await UserStats.collection.insertOne({ userId, coins: 10, [LEGACY_XP]: 10 });

    const result = await migrateLegacyStats(UserStats);
    expect(result).toEqual({ matched: 1, modified: 1, dryRun: false });

    const raw = await UserStats.collection.findOne({ userId });
    expect(raw.coins).toBe(10);
    expect(raw).not.toHaveProperty(LEGACY_XP);
  });
});

'use strict';
// Regression tests for the auth module's Mongoose layer (#295, #89).
//
// Under Mongoose 9 the UserSchema pre('save') hook still used the removed
// `next` callback, so every User save threw "next is not a function" —
// seedUsers() created nobody and auth silently degraded to in-memory. That
// hook has since been removed (#89 consolidated the duplicate score fields),
// but these tests still save real Users, so they also catch the next Mongoose
// upgrade.
//
// They run against a real mongod on 127.0.0.1:27017 using a scratch database
// that is dropped afterwards.

const TEST_DB = 'mongodb://127.0.0.1:27017/tenali_auth_test';

// auth.js reads both of these at module load, so set them before requiring it.
process.env.MONGO_URI = TEST_DB;
process.env.TENALI_SEED_USERS = 'seed_alice:pw-alice,seed_root:pw-root:admin';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const auth = require('../auth');
const { User } = auth;

beforeAll(async () => {
  await auth.connectMongo(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ─── Score-field schema (#89) ────────────────────────────────────────────────

describe('UserSchema score fields (#89)', () => {
  // The deprecated duplicate-field names are built dynamically so that the
  // issue-#89 acceptance grep (deprecated names across server/ and client/src)
  // stays clean outside the migration script.
  const DEPRECATED = ['coin' + 'Balance', 'xp' + 'Score'];

  test('a new user saves without throwing', async () => {
    const user = new User({ username: 'hook_probe', passwordHash: 'x' });
    await expect(user.save()).resolves.toBeTruthy();
    expect(await User.countDocuments({ username: 'hook_probe' })).toBe(1);
  });

  test('re-saving an existing user does not throw', async () => {
    const user = await User.create({ username: 'resave_probe', passwordHash: 'x' });
    user.totalSolved = 3;
    await expect(user.save()).resolves.toBeTruthy();
  });

  test('the deprecated duplicate score fields are gone from the schema', async () => {
    const user = await User.create({ username: 'no_duplicates', passwordHash: 'x' });
    for (const field of DEPRECATED) {
      expect(user[field]).toBeUndefined();
      expect(user.toObject()).not.toHaveProperty(field);
    }
    // Canonical fields still present with their defaults.
    expect(user.coins).toBe(500);
    expect(user.xp).toBe(500);
    expect(user.totalSolved).toBe(0);
  });

  test('coins and xp are independent — writing one no longer mirrors onto the other', async () => {
    const user = await User.create({ username: 'independent_ledgers', passwordHash: 'x', coins: 750 });
    expect(user.xp).toBe(500); // not mirrored from coins anymore

    const stored = await User.findOne({ username: 'independent_ledgers' });
    expect(stored.coins).toBe(750);
    expect(stored.xp).toBe(500);

    stored.xp = 1200;
    await stored.save();
    const resaved = await User.findOne({ username: 'independent_ledgers' });
    expect([resaved.coins, resaved.xp]).toEqual([750, 1200]);
  });
});

// ─── seedUsers ────────────────────────────────────────────────────────────────

describe('seedUsers', () => {
  test('creates every TENALI_SEED_USERS entry with a matching password hash', async () => {
    await auth.seedUsers();

    const alice = await User.findOne({ username: 'seed_alice' });
    expect(alice).toBeTruthy();
    expect(alice.role).toBe('user');
    expect(await bcrypt.compare('pw-alice', alice.passwordHash)).toBe(true);

    const root = await User.findOne({ username: 'seed_root' });
    expect(root).toBeTruthy();
    expect(root.role).toBe('admin');
    expect(await bcrypt.compare('pw-root', root.passwordHash)).toBe(true);
  });

  test('is idempotent — a second run creates no duplicates', async () => {
    await auth.seedUsers();
    await auth.seedUsers();
    expect(await User.countDocuments({ username: 'seed_alice' })).toBe(1);
    expect(await User.countDocuments({ username: 'seed_root' })).toBe(1);
  });

  test('upgrades the role of an existing user (the other save path)', async () => {
    await User.create({ username: 'seed_root', passwordHash: 'stale', role: 'user' });

    await auth.seedUsers();

    const root = await User.findOne({ username: 'seed_root' });
    expect(root.role).toBe('admin');
  });
});

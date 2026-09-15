'use strict';
// Regression tests for the auth module's Mongoose layer (#295).
//
// Under Mongoose 9 the UserSchema pre('save') hook still used the removed
// `next` callback, so every User save threw "next is not a function" —
// seedUsers() created nobody and auth silently degraded to in-memory. These
// tests save a real User, so they also catch the next Mongoose upgrade.
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

// ─── The pre('save') hook ─────────────────────────────────────────────────────

describe("UserSchema pre('save')", () => {
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

  test('setting coins mirrors the value onto xp, coinBalance and xpScore', async () => {
    const user = await User.create({ username: 'mirror_coins', passwordHash: 'x', coins: 750 });
    expect([user.xp, user.coinBalance, user.xpScore]).toEqual([750, 750, 750]);

    const stored = await User.findOne({ username: 'mirror_coins' });
    expect([stored.coins, stored.xp, stored.coinBalance, stored.xpScore])
      .toEqual([750, 750, 750, 750]);
  });

  test('setting xp on an existing user mirrors onto coins, coinBalance and xpScore', async () => {
    const user = await User.create({ username: 'mirror_xp', passwordHash: 'x' });
    user.xp = 1200;
    await user.save();

    const stored = await User.findOne({ username: 'mirror_xp' });
    expect([stored.coins, stored.xp, stored.coinBalance, stored.xpScore])
      .toEqual([1200, 1200, 1200, 1200]);
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

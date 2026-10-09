'use strict';
// Unit tests for atomic recordEvent() ledger writer (#90).
//
// Tests event calculation, atomic MongoDB updates, and concurrent requests.

const TEST_DB = 'mongodb://127.0.0.1:27017/tenali_ledger_test';

process.env.MONGO_URI = TEST_DB;
process.env.TENALI_SEED_USERS = '';

const mongoose = require('mongoose');
const auth = require('../auth');
const { User } = auth;
const { recordEvent } = require('../lib/ledger');

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

describe('recordEvent() ledger writer (#90)', () => {
  test('applies quiz_correct rewards and increments totalSolved atomically', async () => {
    const user = await User.create({ username: 'quiz_user', passwordHash: 'x', coins: 500, xp: 500 });

    const result = await recordEvent(user._id, { type: 'quiz_correct', difficulty: 'hard' });

    expect(result.success).toBe(true);
    expect(result.coinsEarned).toBe(12);
    expect(result.xpEarned).toBe(15);
    expect(result.coins).toBe(512);
    expect(result.xp).toBe(515);
    expect(result.totalSolved).toBe(1);

    const stored = await User.findById(user._id);
    expect([stored.coins, stored.xp, stored.totalSolved]).toEqual([512, 515, 1]);
  });

  test('applies quiz_incorrect rewards without incrementing totalSolved', async () => {
    const user = await User.create({ username: 'quiz_wrong', passwordHash: 'x', coins: 500, xp: 500 });

    const result = await recordEvent(user._id, { type: 'quiz_incorrect' });

    expect(result.coinsEarned).toBe(0);
    expect(result.xpEarned).toBe(2);
    expect(result.coins).toBe(500);
    expect(result.xp).toBe(502);
    expect(result.totalSolved).toBe(0);
  });

  test('applies hint_unlock debit atomically', async () => {
    const user = await User.create({ username: 'hint_user', passwordHash: 'x', coins: 500, xp: 500 });

    const result = await recordEvent(user._id, {
      type: 'hint_unlock',
      tier: 2,
      concept: 'addition',
      questionId: 'q123',
      levelNum: 1,
    });

    expect(result.coinsEarned).toBe(-8);
    expect(result.coins).toBe(492);
    expect(result.xp).toBe(500);

    const stored = await User.findById(user._id);
    expect(stored.coins).toBe(492);
    expect(stored.hintLogs.length).toBe(1);
    expect(stored.hintLogs[0].concept).toBe('addition');
  });

  test('handles concurrent recordEvent calls without lost updates (atomicity check)', async () => {
    const user = await User.create({ username: 'concurrent_user', passwordHash: 'x', coins: 500, xp: 500 });

    // Execute 10 concurrent recordEvent calls (each adds 10 coins, 10 XP, 1 solved)
    const promises = Array.from({ length: 10 }).map(() =>
      recordEvent(user._id, { type: 'quiz_correct', difficulty: 'easy', speed: true })
    );

    await Promise.all(promises);

    const stored = await User.findById(user._id);
    // 10 events * 10 coins = +100 coins (500 -> 600)
    // 10 events * 10 XP = +100 XP (500 -> 600)
    // 10 events = 10 totalSolved
    expect(stored.coins).toBe(600);
    expect(stored.xp).toBe(600);
    expect(stored.totalSolved).toBe(10);
  });
});

'use strict';
// Integration/unit tests for server-side score accrual middleware (#91).
//
// Tests that POST /<type>-api/check endpoints trigger recordEvent for logged-in users
// and return updated coins, xp, totalSolved, and coinsEarned in the response payload.

const TEST_DB = 'mongodb://127.0.0.1:27017/tenali_accrual_test';

process.env.MONGO_URI = TEST_DB;
process.env.TENALI_SEED_USERS = '';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-accrual-tests-12345';

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const auth = require('../auth');
const { User } = auth;
const { recordEvent } = require('../lib/ledger');

describe('quiz check score accrual middleware (#91)', () => {
  let app;
  let user;
  let token;

  beforeAll(async () => {
    await auth.connectMongo(TEST_DB);
    // require index.js after setting env vars
    app = require('../index');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    user = await User.create({
      username: 'accrual_student',
      passwordHash: 'x',
      coins: 500,
      xp: 500,
      totalSolved: 0,
    });
    token = jwt.sign({ id: user._id.toString(), username: user.username }, process.env.JWT_SECRET);
  });

  test('POST /addition-api/check accrues coins and totalSolved for correct answer', async () => {
    const res = await request(app)
      .post('/addition-api/check')
      .set('Authorization', `Bearer ${token}`)
      .send({ a: 5, b: 3, answer: 8, difficulty: 'easy' });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.coinsEarned).toBe(5);
    expect(res.body.xpEarned).toBe(10);
    expect(res.body.coins).toBe(505);
    expect(res.body.xp).toBe(510);
    expect(res.body.totalSolved).toBe(1);

    const stored = await User.findById(user._id);
    expect([stored.coins, stored.xp, stored.totalSolved]).toEqual([505, 510, 1]);
  });

  test('POST /basicarith-api/check with solve=true does NOT accrue coins', async () => {
    const res = await request(app)
      .post('/basicarith-api/check')
      .set('Authorization', `Bearer ${token}`)
      .send({ a: 10, b: 2, op: '+', answer: 12, solve: true });

    expect(res.status).toBe(200);
    expect(res.body.solved).toBe(true);
    expect(res.body.coinsEarned).toBeUndefined();

    const stored = await User.findById(user._id);
    expect([stored.coins, stored.xp, stored.totalSolved]).toEqual([500, 500, 0]);
  });
});

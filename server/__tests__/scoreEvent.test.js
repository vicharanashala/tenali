'use strict';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('../auth');
const ledger = require('../lib/ledger');

describe('POST /api/score/event (#92)', () => {
  let app;
  let validToken;
  const testUserId = new mongoose.Types.ObjectId().toHexString();

  beforeAll(() => {
    app = require('../index');
    validToken = jwt.sign(
      { sub: testUserId, username: 'testeventuser', role: 'user' },
      auth.JWT_SECRET
    );
  });

  test('returns 401 if request has no token', async () => {
    const res = await request(app)
      .post('/api/score/event')
      .send({ type: 'quiz_correct', difficulty: 'easy' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('missing token');
  });

  test('returns 400 if event type is missing', async () => {
    const res = await request(app)
      .post('/api/score/event')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('event type is required');
  });

  test('records score event and returns updated totals when authenticated', async () => {
    vi.spyOn(ledger, 'recordEvent').mockResolvedValueOnce({
      success: true,
      coins: 15,
      xp: 30,
      totalSolved: 6,
      coinsEarned: 5,
      xpEarned: 10,
    });

    const res = await request(app)
      .post('/api/score/event')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ type: 'quiz_correct', difficulty: 'easy' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.coins).toBe(15);
    expect(res.body.xp).toBe(30);
    expect(res.body.totalSolved).toBe(6);
    expect(res.body.coinsEarned).toBe(5);
    expect(res.body.xpEarned).toBe(10);
    expect(ledger.recordEvent).toHaveBeenCalledWith(
      testUserId,
      expect.objectContaining({ type: 'quiz_correct', difficulty: 'easy' })
    );
  });
});

'use strict';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const auth = require('../auth');

describe('POST /api/progress score lockdown (#93)', () => {
  let app;
  let validToken;
  const username = 'testlockdownuser';

  beforeAll(() => {
    app = require('../index');
    validToken = jwt.sign(
      { sub: '507f1f77bcf86cd799439011', username, role: 'user' },
      auth.JWT_SECRET
    );
  });

  test('POST /api/progress rejects client-supplied score mutations', async () => {
    // First, verify initial progress response
    const getRes = await request(app)
      .get('/api/progress')
      .set('Authorization', `Bearer ${validToken}`);
    expect(getRes.status).toBe(200);

    const initialCoins = getRes.body.coins || 0;
    const initialTotalSolved = getRes.body.totalSolved || 0;

    // Post cheating numbers to /api/progress
    const postRes = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        coins: 999999,
        totalSolved: 999999,
        xp: 999999,
      });

    expect(postRes.status).toBe(200);
    expect(postRes.body.success).toBe(true);
    // Verified: stored coins and totalSolved were NOT altered by client payload
    expect(postRes.body.coins).toBe(initialCoins);
    expect(postRes.body.totalSolved).toBe(initialTotalSolved);

    // Fetch GET /api/progress to verify DB state was unaffected
    const checkRes = await request(app)
      .get('/api/progress')
      .set('Authorization', `Bearer ${validToken}`);
    expect(checkRes.body.coins).toBe(initialCoins);
    expect(checkRes.body.totalSolved).toBe(initialTotalSolved);
  });
});

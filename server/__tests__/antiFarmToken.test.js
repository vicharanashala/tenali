'use strict';
const request = require('supertest');
const { signQuestionToken, verifyQuestionToken } = require('../lib/questionToken');

describe('Anti-farm question token binding (#95)', () => {
  let app;

  beforeAll(() => {
    app = require('../index');
  });

  test('signQuestionToken and verifyQuestionToken create and verify valid tokens', () => {
    const payload = { topic: 'basicarith', a: 5, b: 7, op: '+' };
    const token = signQuestionToken(payload);
    expect(typeof token).toBe('string');

    const result = verifyQuestionToken(token);
    expect(result.valid).toBe(true);
    expect(result.payload.topic).toBe('basicarith');
    expect(result.payload.a).toBe(5);
  });

  test('verifyQuestionToken rejects invalid/tampered tokens', () => {
    const token = signQuestionToken({ a: 1 });
    const tampered = token.slice(0, -4) + 'abcd';
    const result = verifyQuestionToken(tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid token signature');
  });

  test('verifyQuestionToken rejects expired tokens', () => {
    const token = signQuestionToken({ a: 1 }, -10); // expired 10s ago
    const result = verifyQuestionToken(token);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token expired');
  });

  test('GET /basicarith-api/question returns a signed qToken', async () => {
    const res = await request(app).get('/basicarith-api/question?difficulty=easy');
    expect(res.status).toBe(200);
    expect(res.body.qToken).toBeDefined();
    expect(typeof res.body.qToken).toBe('string');
  });

  test('POST /basicarith-api/check rejects requests without a valid qToken', async () => {
    const res = await request(app)
      .post('/basicarith-api/check')
      .send({ a: 5, b: 7, op: '+', answer: 12 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid or missing question token');
  });

  test('POST /basicarith-api/check accepts requests with a valid qToken', async () => {
    const qRes = await request(app).get('/basicarith-api/question?difficulty=easy');
    const q = qRes.body;

    const res = await request(app)
      .post('/basicarith-api/check')
      .send({
        a: q.a,
        b: q.b,
        op: q.op,
        answer: q.op === '+' ? q.a + q.b : q.op === '-' ? q.a - q.b : q.a * q.b,
        qToken: q.qToken,
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
  });
});

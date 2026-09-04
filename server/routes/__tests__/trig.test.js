'use strict';
// Characterization + contract tests for the trig-api router.
// These tests are written BEFORE extraction and must pass against the monolith.
// After extraction they must still pass against the extracted router.
// That's the safety guarantee: if they break, the extraction introduced a bug.

const express = require('express');
const request = require('supertest');
const trigRouter = require('../trig');

function buildApp() {
  const app = express();
  app.use('/trig-api', trigRouter);
  return app;
}

const DIFFICULTIES = ['easy', 'medium', 'hard', 'extrahard'];

describe('trig-api — question shape', () => {
  const app = buildApp();

  test.each(DIFFICULTIES)('GET /question?difficulty=%s returns required fields', async (diff) => {
    const res = await request(app).get(`/trig-api/question?difficulty=${diff}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.prompt).toBe('string');
    expect(res.body.prompt.length).toBeGreaterThan(0);
    expect(typeof res.body.answer).toBe('number');
    expect(res.body.answer).not.toBeNaN();
    expect(res.body.difficulty).toBe(diff);
    expect(typeof res.body.id).toBe('number');
  });

  test('GET /question defaults to easy when difficulty omitted', async () => {
    const res = await request(app).get('/trig-api/question');
    expect(res.status).toBe(200);
    expect(res.body.difficulty).toBe('easy');
  });
});

describe('trig-api — check grading', () => {
  const app = buildApp();

  test.each(DIFFICULTIES)('POST /check with exact answer is correct (%s)', async (diff) => {
    const q = (await request(app).get(`/trig-api/question?difficulty=${diff}`)).body;
    const res = await request(app)
      .post('/trig-api/check')
      .send({ answer: q.answer, userAnswer: String(q.answer) });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(typeof res.body.message).toBe('string');
    expect(typeof res.body.display).toBe('string');
  });

  test('POST /check with wrong answer is incorrect', async () => {
    const q = (await request(app).get('/trig-api/question?difficulty=easy')).body;
    const badAnswer = q.answer + 999;
    const res = await request(app)
      .post('/trig-api/check')
      .send({ answer: q.answer, userAnswer: String(badAnswer) });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(false);
  });

  test('POST /check with non-numeric userAnswer is incorrect', async () => {
    const q = (await request(app).get('/trig-api/question')).body;
    const res = await request(app)
      .post('/trig-api/check')
      .send({ answer: q.answer, userAnswer: 'abc' });
    expect(res.body.correct).toBe(false);
  });

  test('POST /check accepts degree symbol in userAnswer', async () => {
    // The check endpoint strips ° before parsing, so "45°" should work
    const app2 = buildApp();
    // Force a known easy question by seeding: just verify the stripping logic
    const res = await request(app2)
      .post('/trig-api/check')
      .send({ answer: 45, userAnswer: '45°' });
    expect(res.body.correct).toBe(true);
  });

  test('POST /check tolerates answers within 0.5 of expected', async () => {
    const res = await request(app)
      .post('/trig-api/check')
      .send({ answer: 10.0, userAnswer: '10.4' });
    expect(res.body.correct).toBe(true);
  });

  test('POST /check rejects answers outside 0.5 tolerance', async () => {
    const res = await request(app)
      .post('/trig-api/check')
      .send({ answer: 10.0, userAnswer: '10.6' });
    expect(res.body.correct).toBe(false);
  });
});

'use strict';

// Issue #249: /concept-api was an orphan route and is removed. These check
// that it is really gone, and that its neighbours are untouched:
// /conceptual-api (the conceptual variants makeQuizApp fetches for every
// topic) and the vocabulary routes that shared the same router.

const request = require('supertest');
const banks = require('../../lib/question-banks');

let app;

beforeAll(async () => {
  app = require('../../index');
  // index.js loads the vocab bank asynchronously when required.
  for (let i = 0; i < 100 && banks.vocab.length === 0; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
});

describe('/concept-api is removed', () => {
  test('GET /concept-api/question is no longer answered by an API', async () => {
    const res = await request(app).get('/concept-api/question?difficulty=easy');
    // With client/dist built, the SPA catch-all serves index.html (text/html);
    // without it the request 404s. Either way no JSON question comes back.
    const answeredByApi = res.status === 200 && /json/.test(res.headers['content-type'] || '');
    expect(answeredByApi).toBe(false);
    expect(res.body && res.body.question).toBeUndefined();
  });

  test('POST /concept-api/check returns 404', async () => {
    const res = await request(app).post('/concept-api/check').send({ id: 10001, answerOption: 'B' });
    expect(res.status).toBe(404);
  });

  test('the question bank no longer has a concepts slot', () => {
    expect(banks.concepts).toBeUndefined();
  });
});

describe('neighbouring routes still work', () => {
  test('/conceptual-api/question still serves a conceptual question', async () => {
    const res = await request(app).get('/conceptual-api/question?topic=fractionadd');
    expect(res.status).toBe(200);
    expect(res.body.isConceptual).toBe(true);
    expect(Array.isArray(res.body.options)).toBe(true);
  });

  test('/vocab-api/question and /vocab-api/check still work', async () => {
    expect(banks.vocab.length).toBeGreaterThan(0);
    const q = await request(app).get('/vocab-api/question?difficulty=easy');
    expect(q.status).toBe(200);
    expect(q.body.id).toBeDefined();
    const check = await request(app).post('/vocab-api/check').send({ id: q.body.id, answerOption: 'A' });
    expect(check.status).toBe(200);
    expect(typeof check.body.correct).toBe('boolean');
  });
});

'use strict';
// Integration tests for #178 — verifies that:
//   TEN-MATH-015 — basic-arithmetic-lab "False" questions actually display a
//                  mathematically false statement (no false-Positive).
//   TEN-MATH-021 — the hcflcm generator never produces duplicate operands
//                  in its multi-operand questions ("LCM of 7 and 7", etc.).
//   TEN-MATH-023 — the mensuration-lab respects an `?exclude=...` history
//                  and never re-serves a question that's already been seen.
//   TEN-MATH-024 — same for the mensur entry on the geometry router.

const express = require('express');
const request = require('supertest');

const labRouter = require('../../labRoutes');
const geometryRouter = require('../../routes/geometry');

// labRoutes is mounted at /api in the real server.
function labApp() {
  const app = express();
  app.use('/api', labRouter);
  return app;
}

// The geometry router is mounted at /<topic>-api in the real server.
function geomApp(topic) {
  const app = express();
  app.use(`/${topic}-api`, geometryRouter);
  return app;
}

// ─── TEN-MATH-015 ───────────────────────────────────────────────────────────
describe('basic-arithmetic-lab true_false — no false-Positive', () => {
  const app = labApp();

  test('every "False" question displays a statement that is actually false', async () => {
    let probed = 0;
    let sawFalse = 0;

    for (let i = 0; i < 200; i++) {
      const res = await request(app)
        .get('/api/basic-arithmetic-lab/generate?difficulty=easy');
      expect(res.status).toBe(200);
      probed++;

      if (res.body.template !== 'true_false') continue;

      const match = res.body.prompt.match(
        /Is\s+(\d+)\s+([×÷])\s+(\d+)\s*=\s*(-?\d+)/
      );
      expect(match).not.toBeNull();
      const [, left, op, right, displayed] = match;
      const actual = op === '×' ? Number(left) * Number(right) : Number(left) / Number(right);

      if (res.body.answer === 'False') {
        sawFalse++;
        expect(Number(displayed)).not.toBe(actual);
      }
    }

    // Both probes and false-questions must have happened for this to be a useful
    // regression test — otherwise we'd silently pass on a degenerate case.
    expect(probed).toBeGreaterThan(0);
    expect(sawFalse).toBeGreaterThan(0);
  });
});

// ─── TEN-MATH-021 ───────────────────────────────────────────────────────────
// Spin up the monolith just enough to hit /hcflcm-api/question.
const indexApp = require('../../index');
const allTopics = require('../../routes/__tests__/apiContract.test.js'); // not used; for parity

describe('hcflcm generator — no duplicate operands', () => {
  test('the 3-operand "Find the LCM of a, b, and c" question always has a≠b≠c (hard difficulty, type 1)', async () => {
    for (let i = 0; i < 100; i++) {
      const res = await request(indexApp).get('/hcflcm-api/question?difficulty=hard');
      expect(res.status).toBe(200);
      const m = res.body.prompt.match(/Find the LCM of (\d+), (\d+), and (\d+)/);
      if (!m) continue;        // not the type-1 template; skip
      const [, a, b, c] = m.map(Number);
      expect(Number(a)).not.toBe(Number(b));
      expect(Number(a)).not.toBe(Number(c));
      expect(Number(b)).not.toBe(Number(c));
    }
  });

  test('the 2-operand "Find the LCM of a and b" question always has a≠b (medium, type 1)', async () => {
    for (let i = 0; i < 100; i++) {
      const res = await request(indexApp).get('/hcflcm-api/question?difficulty=medium');
      expect(res.status).toBe(200);
      const m = res.body.prompt.match(/Find the LCM.*?of (\d+) and (\d+)/);
      if (!m) continue;
      const [, a, b] = m.map(Number);
      expect(Number(a)).not.toBe(Number(b));
    }
  });

  test('the displayed answer matches lcm(a, b, c) for the 3-operand question', async () => {
    for (let i = 0; i < 50; i++) {
      const res = await request(indexApp).get('/hcflcm-api/question?difficulty=hard');
      const m = res.body.prompt.match(/Find the LCM of (\d+), (\d+), and (\d+)/);
      if (!m) continue;
      const gcd = (x, y) => (!y ? x : gcd(y, x % y));
      const lcm = (x, y) => (x * y) / gcd(x, y);
      const [, a, b, c] = m.map(Number);
      const expected = lcm(lcm(a, b), c);
      expect(Number(res.body.answer)).toBe(expected);
    }
  });
});

// ─── TEN-MATH-023 ───────────────────────────────────────────────────────────
describe('mensuration-lab dedup — respects ?exclude=', () => {
  const app = labApp();

  test('a question whose _key is in ?exclude is never returned', async () => {
    const first = await request(app)
      .get('/api/mensuration-lab/generate?difficulty=easy');
    expect(first.status).toBe(200);
    expect(first.body._key).toBeDefined();

    // The same request with that key excluded must produce a different key.
    const second = await request(app)
      .get(`/api/mensuration-lab/generate?difficulty=easy&exclude=${encodeURIComponent(first.body._key)}`);
    expect(second.status).toBe(200);
    expect(second.body._key).toBeDefined();
    expect(second.body._key).not.toBe(first.body._key);
  });

  test('a long exclude list still produces a valid question (capped at MAX_ATTEMPTS, never 4xx)', async () => {
    // Synthesize a long, mostly-bogus exclude list — the lab should still
    // respond 200 with some valid question rather than error out.
    const noise = Array.from({ length: 30 }, (_, i) => `bogus_${i}`).join(',');
    const res = await request(app)
      .get(`/api/mensuration-lab/generate?difficulty=easy&exclude=${encodeURIComponent(noise)}`);
    expect(res.status).toBe(200);
    expect(res.body.prompt).toBeDefined();
    expect(res.body._key).toBeDefined();
  });

  test('the response _key field is what the client should echo back next', async () => {
    const res = await request(app).get('/api/mensuration-lab/generate?difficulty=hard');
    expect(res.body._key).toMatch(/^[a-z_]+:/);     // template:params pattern
  });
});

// ─── TEN-MATH-024 ───────────────────────────────────────────────────────────
describe('mensur dedup — respects ?exclude=', () => {
  test('a question whose _key is in ?exclude is never returned', async () => {
    const app = geomApp('mensur');
    const first = await request(app).get('/mensur-api/question?difficulty=easy');
    expect(first.status).toBe(200);
    expect(first.body._key).toBeDefined();

    const second = await request(app)
      .get(`/mensur-api/question?difficulty=easy&exclude=${encodeURIComponent(first.body._key)}`);
    expect(second.status).toBe(200);
    expect(second.body._key).toBeDefined();
    expect(second.body._key).not.toBe(first.body._key);
  });

  test('every difficulty level emits a valid _key + non-empty prompt', async () => {
    const app = geomApp('mensur');
    for (const diff of ['easy', 'medium', 'hard', 'extrahard']) {
      const res = await request(app).get(`/mensur-api/question?difficulty=${diff}`);
      expect(res.status).toBe(200);
      expect(res.body.prompt).toBeDefined();
      expect(res.body._key).toBeDefined();
    }
  });
});
'use strict';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const express = require('express');

const miscRouter = require('../misc');
const geometryRouter = require('../geometry');

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a * b) / gcd(a, b);

describe('Issue #178: LCM uses every number shown, and geometry questions do not repeat', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const app = express();
    app.use('/hcflcm-api', miscRouter);
    app.use('/mensur-api', geometryRouter);
    app.use('/angles-api', geometryRouter);
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  async function expectNoRepeatInLast10(url) {
    const seen = [];
    for (let i = 0; i < 40; i++) {
      const res = await fetch(`${baseUrl}${url}`, { headers: { 'User-Agent': 'test-learner' } });
      const { id, options, ...rest } = await res.json();
      const key = JSON.stringify(rest);
      expect(seen.slice(-10), key).not.toContain(key);
      seen.push(key);
    }
  }

  test('three-number LCM answer uses all three numbers shown', async () => {
    let matches = 0;
    for (let i = 0; i < 200; i++) {
      const res = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=hard`);
      const data = await res.json();
      const m = data.prompt.match(/Find the LCM of (\d+), (\d+), and (\d+)\./);
      if (!m) continue;
      matches++;
      const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
      expect(data.answer, `LCM of ${a}, ${b}, ${c}`).toBe(lcm(lcm(a, b), c));
    }
    expect(matches).toBeGreaterThan(0);
  });

  test('Mensuration does not repeat a question within the last 10 questions', async () => {
    await expectNoRepeatInLast10('/mensur-api/question?difficulty=medium');
  });

  test('Angles does not repeat a question within the last 10 questions', async () => {
    await expectNoRepeatInLast10('/angles-api/question?difficulty=easy');
  });
});

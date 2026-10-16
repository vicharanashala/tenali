'use strict';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
const express = require('express');

const algebraRouter = require('../algebra');
const miscRouter = require('../misc');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/polyfactor-api', algebraRouter);
  app.use('/simul-api', algebraRouter);
  app.use('/lineq-api', algebraRouter);
  app.use('/bounds-api', miscRouter);
  app.use('/sdt-api', miscRouter);
  app.use('/hcflcm-api', miscRouter);
  return app;
}

describe('GitHub Issue #178 — Math Bug Fixes', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const app = buildApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('TEN-MATH-015: bounds easy mode contains no float subtraction precision artifacts', async () => {
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${baseUrl}/bounds-api/question?difficulty=easy`);
      expect(res.status).toBe(200);
      const data = await res.json();
      const { answer, display } = data;
      expect(typeof answer).toBe('number');
      expect(String(answer).includes('999999')).toBe(false);
      expect(String(answer).includes('0000001')).toBe(false);
      expect(display.includes('999999')).toBe(false);
      expect(display.includes('0000001')).toBe(false);
    }
  });

  test('TEN-MATH-015: bounds extrahard mode returns answer to 3 d.p.', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await fetch(`${baseUrl}/bounds-api/question?difficulty=extrahard`);
      expect(res.status).toBe(200);
      const data = await res.json();
      const str = String(data.answer);
      const dec = str.includes('.') ? str.split('.')[1].length : 0;
      expect(dec).toBeLessThanOrEqual(3);
    }
  });

  test('TEN-MATH-015: sdt hard and extrahard mode rounding uses half-up EPSILON', async () => {
    for (let i = 0; i < 30; i++) {
      const qHardRes = await fetch(`${baseUrl}/sdt-api/question?difficulty=hard`);
      expect(qHardRes.status).toBe(200);
      const qHard = await qHardRes.json();
      if (typeof qHard.answer === 'number') {
        const str = String(qHard.answer);
        const dec = str.includes('.') ? str.split('.')[1].length : 0;
        expect(dec).toBeLessThanOrEqual(2);
      }

      const qExtraRes = await fetch(`${baseUrl}/sdt-api/question?difficulty=extrahard`);
      expect(qExtraRes.status).toBe(200);
      const qExtra = await qExtraRes.json();
      const str = String(qExtra.answer);
      const dec = str.includes('.') ? str.split('.')[1].length : 0;
      expect(dec).toBeLessThanOrEqual(2);
    }
  });

  test('TEN-MATH-020: polyfactor MCQ options never contain duplicate algebraic quadratics', async () => {
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${baseUrl}/polyfactor-api/question?difficulty=easy&level=1`);
      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.options) {
        const opts = data.options;
        expect(opts.length).toBe(4);
        const uniqueOpts = new Set(opts);
        expect(uniqueOpts.size).toBe(4);
      }
    }
  });

  test('TEN-MATH-021: 2x2 simultaneous equations always have non-zero determinant', async () => {
    for (let i = 0; i < 200; i++) {
      const resEasy = await fetch(`${baseUrl}/simul-api/question?difficulty=easy`);
      expect(resEasy.status, `resEasy status at iteration ${i}`).toBe(200);
      const dataEasy = await resEasy.json();
      const eqsEasy = dataEasy.eqs;
      if (eqsEasy && eqsEasy.length === 2) {
        const det = eqsEasy[0].a * eqsEasy[1].b - eqsEasy[1].a * eqsEasy[0].b;
        expect(det, `Determinant should not be zero in easy iteration ${i}`).not.toBe(0);
      }

      const resMed = await fetch(`${baseUrl}/simul-api/question?difficulty=medium`);
      expect(resMed.status, `resMed status at iteration ${i}`).toBe(200);
      const dataMed = await resMed.json();
      const eqsMed = dataMed.eqs;
      if (eqsMed && eqsMed.length === 2) {
        const det = eqsMed[0].a * eqsMed[1].b - eqsMed[1].a * eqsMed[0].b;
        expect(det, `Determinant should not be zero in medium iteration ${i}`).not.toBe(0);
      }
    }
  });

  test('TEN-MATH-023: buildOptions fallback produces valid distinct options without _1, _2 suffixes', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await fetch(`${baseUrl}/lineq-api/question?difficulty=easy`);
      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.options) {
        const opts = data.options.map(o => o.text);
        expect(opts.length).toBe(4);
        for (const opt of opts) {
          expect(opt.includes('_')).toBe(false);
        }
        const unique = new Set(opts);
        expect(unique.size).toBe(4);
      }
    }
  });

  test('TEN-MATH-024: 2-operand and 3-operand HCF/LCM questions have distinct operands', async () => {
    for (let i = 0; i < 100; i++) {
      const resEasy = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=easy`);
      expect(resEasy.status).toBe(200);
      const dataEasy = await resEasy.json();
      const matchEasy = dataEasy.prompt.match(/of (\d+) and (\d+)\./);
      if (matchEasy) {
        const a = Number(matchEasy[1]);
        const b = Number(matchEasy[2]);
        expect(a).not.toBe(b);
      }

      const resMed = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=medium`);
      expect(resMed.status).toBe(200);
      const dataMed = await resMed.json();
      const matchMed = dataMed.prompt.match(/of (\d+) and (\d+)\./);
      if (matchMed) {
        const a = Number(matchMed[1]);
        const b = Number(matchMed[2]);
        expect(a).not.toBe(b);
      }
    }

    for (let i = 0; i < 50; i++) {
      const resHard = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=hard`);
      expect(resHard.status).toBe(200);
      const dataHard = await resHard.json();
      const matchHard = dataHard.prompt.match(/of (\d+), (\d+), and (\d+)\./);
      if (matchHard) {
        const a = Number(matchHard[1]);
        const b = Number(matchHard[2]);
        const c = Number(matchHard[3]);
        expect(a).not.toBe(b);
        expect(a).not.toBe(c);
        expect(b).not.toBe(c);
      }
    }
  });

});


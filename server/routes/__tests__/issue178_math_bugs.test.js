'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
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

test.describe('GitHub Issue #178 — Math Bug Fixes', () => {
  let server;
  let baseUrl;

  test.before(async () => {
    const app = buildApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  test.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('TEN-MATH-015: bounds easy mode contains no float subtraction precision artifacts', async () => {
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${baseUrl}/bounds-api/question?difficulty=easy`);
      assert.equal(res.status, 200);
      const data = await res.json();
      const { answer, display } = data;
      assert.equal(typeof answer, 'number');
      assert.ok(!String(answer).includes('999999'), `Answer ${answer} contains float artifact`);
      assert.ok(!String(answer).includes('0000001'), `Answer ${answer} contains float artifact`);
      assert.ok(!display.includes('999999'), `Display ${display} contains float artifact`);
      assert.ok(!display.includes('0000001'), `Display ${display} contains float artifact`);
    }
  });

  test('TEN-MATH-015: bounds extrahard mode returns answer to 3 d.p.', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await fetch(`${baseUrl}/bounds-api/question?difficulty=extrahard`);
      assert.equal(res.status, 200);
      const data = await res.json();
      const str = String(data.answer);
      const dec = str.includes('.') ? str.split('.')[1].length : 0;
      assert.ok(dec <= 3, `Expected at most 3 d.p., got ${str}`);
    }
  });

  test('TEN-MATH-015: sdt hard and extrahard mode rounding uses half-up EPSILON', async () => {
    for (let i = 0; i < 30; i++) {
      const qHardRes = await fetch(`${baseUrl}/sdt-api/question?difficulty=hard`);
      assert.equal(qHardRes.status, 200);
      const qHard = await qHardRes.json();
      if (typeof qHard.answer === 'number') {
        const str = String(qHard.answer);
        const dec = str.includes('.') ? str.split('.')[1].length : 0;
        assert.ok(dec <= 2, `Expected at most 2 d.p., got ${str}`);
      }

      const qExtraRes = await fetch(`${baseUrl}/sdt-api/question?difficulty=extrahard`);
      assert.equal(qExtraRes.status, 200);
      const qExtra = await qExtraRes.json();
      const str = String(qExtra.answer);
      const dec = str.includes('.') ? str.split('.')[1].length : 0;
      assert.ok(dec <= 2, `Expected at most 2 d.p., got ${str}`);
    }
  });

  test('TEN-MATH-020: polyfactor MCQ options never contain duplicate algebraic quadratics', async () => {
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${baseUrl}/polyfactor-api/question?difficulty=easy&level=1`);
      assert.equal(res.status, 200);
      const data = await res.json();
      if (data.options) {
        const opts = data.options;
        assert.equal(opts.length, 4);
        const uniqueOpts = new Set(opts);
        assert.equal(uniqueOpts.size, 4, `Found duplicates in options: ${JSON.stringify(opts)}`);
      }
    }
  });

  test('TEN-MATH-021: 2x2 simultaneous equations always have non-zero determinant', async () => {
    for (let i = 0; i < 200; i++) {
      const resEasy = await fetch(`${baseUrl}/simul-api/question?difficulty=easy`);
      assert.equal(resEasy.status, 200);
      const dataEasy = await resEasy.json();
      const eqsEasy = dataEasy.eqs;
      if (eqsEasy && eqsEasy.length === 2) {
        const det = eqsEasy[0].a * eqsEasy[1].b - eqsEasy[1].a * eqsEasy[0].b;
        assert.notEqual(det, 0, `Determinant should not be zero in iteration ${i}`);
      }

      const resMed = await fetch(`${baseUrl}/simul-api/question?difficulty=medium`);
      assert.equal(resMed.status, 200);
      const dataMed = await resMed.json();
      const eqsMed = dataMed.eqs;
      if (eqsMed && eqsMed.length === 2) {
        const det = eqsMed[0].a * eqsMed[1].b - eqsMed[1].a * eqsMed[0].b;
        assert.notEqual(det, 0, `Determinant should not be zero in iteration ${i}`);
      }
    }
  });

  test('TEN-MATH-023: buildOptions fallback produces valid distinct options without _1, _2 suffixes', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await fetch(`${baseUrl}/lineq-api/question?difficulty=easy`);
      assert.equal(res.status, 200);
      const data = await res.json();
      if (data.options) {
        const opts = data.options.map(o => o.text);
        assert.equal(opts.length, 4);
        for (const opt of opts) {
          assert.ok(!opt.includes('_'), `Numeric option "${opt}" should not contain _ suffix`);
        }
        const unique = new Set(opts);
        assert.equal(unique.size, 4);
      }
    }
  });

  test('TEN-MATH-024: 2-operand and 3-operand HCF/LCM questions have distinct operands', async () => {
    for (let i = 0; i < 100; i++) {
      const resEasy = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=easy`);
      assert.equal(resEasy.status, 200);
      const dataEasy = await resEasy.json();
      const matchEasy = dataEasy.prompt.match(/of (\d+) and (\d+)\./);
      if (matchEasy) {
        const a = Number(matchEasy[1]);
        const b = Number(matchEasy[2]);
        assert.notEqual(a, b, `Operands in easy mode should be distinct: ${a} vs ${b}`);
      }

      const resMed = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=medium`);
      assert.equal(resMed.status, 200);
      const dataMed = await resMed.json();
      const matchMed = dataMed.prompt.match(/of (\d+) and (\d+)\./);
      if (matchMed) {
        const a = Number(matchMed[1]);
        const b = Number(matchMed[2]);
        assert.notEqual(a, b, `Operands in medium mode should be distinct: ${a} vs ${b}`);
      }
    }

    for (let i = 0; i < 50; i++) {
      const resHard = await fetch(`${baseUrl}/hcflcm-api/question?difficulty=hard`);
      assert.equal(resHard.status, 200);
      const dataHard = await resHard.json();
      const matchHard = dataHard.prompt.match(/of (\d+), (\d+), and (\d+)\./);
      if (matchHard) {
        const a = Number(matchHard[1]);
        const b = Number(matchHard[2]);
        const c = Number(matchHard[3]);
        assert.notEqual(a, b);
        assert.notEqual(a, c);
        assert.notEqual(b, c);
      }
    }
  });

});


'use strict';

const express = require('express');
const request = require('supertest');
const labRouter = require('../../labRoutes');

function buildApp() {
  const app = express();
  app.use('/api', labRouter);
  return app;
}

describe('basic arithmetic lab - true/false generation', () => {
  const app = buildApp();

  test('False questions must contain a mathematically false statement', async () => {
    let falseQuestions = 0;

    for (let i = 0; i < 100; i++) {
      const res = await request(app)
        .get('/api/basic-arithmetic-lab/generate?difficulty=easy');

      expect(res.status).toBe(200);

      if (res.body.template !== 'true_false') {
        continue;
      }

      const prompt = res.body.prompt;
      const answer = res.body.answer;

      const match = prompt.match(
        /Is\s+(\d+)\s+(.+?)\s+(\d+)\s*=\s*(-?\d+)/
      );

      expect(match).not.toBeNull();

      const [, left, operator, right, displayed] = match;

      const actual = operator.includes('×')
        ? Number(left) * Number(right)
        : Number(left) / Number(right);

      if (answer === 'False') {
        falseQuestions++;
        expect(Number(displayed)).not.toBe(actual);
      }
    }

    expect(falseQuestions).toBeGreaterThan(0);
  });
});

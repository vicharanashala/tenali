'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function quadraticRange(difficulty) {
  if (difficulty === 'easy') return { min: -3, max: 3 };
  if (difficulty === 'medium') return { min: -6, max: 6 };
  if (difficulty === 'hard') return { min: -9, max: 9 };
  if (difficulty === 'extrahard') return { min: -15, max: 15 };
  return { min: -3, max: 3 };
}

function buildQuadraticPrompt(a, b, c, x, opAB = '+', opBC = '+') {
  const first = `${a}x²`;
  const second = `${Math.abs(b)}x`;
  const third = `${Math.abs(c)}`;
  const opStr = (op) => (op === '-' ? '-' : '+');
  const expression = `${first} ${opStr(opAB)} ${second} ${opStr(opBC)} ${third}`;
  return `If x = ${x}, find y for y = ${expression}`;
}

const generators = {
  quadratic: {
    question(difficulty) {
      const diff = difficulty || 'hard';
      const range = quadraticRange(diff);
      let a = 0;
      while (a === 0) a = randomInt(range.min, range.max);
      const b = randomInt(range.min, range.max);
      const c = randomInt(range.min, range.max);
      const x = randomInt(range.min, range.max);
      const answer = a * x * x + b * x + c;
      return { id: `quadratic-${Date.now()}-${Math.random()}`, a, b, c, x, prompt: buildQuadraticPrompt(a, b, c, x), answer };
    },
    check(body) {
      const { a, b, c, x, answer, opAB, opBC } = body || {};
      const A = Number(a), B = Number(b), C = Number(c), X = Number(x);
      const applyOp = (lhs, op, rhs) => op === '-' ? lhs - rhs : lhs + rhs;
      const afterMid = applyOp(A * X * X, (opAB || '+').toString(), B * X);
      const correctAnswer = applyOp(afterMid, (opBC || '+').toString(), C);
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },
};

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;

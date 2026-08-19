'use strict';
// Reference implementation: extracted trig-api router.
// Replace the inline app.get/app.post blocks in server/index.js with:
//   app.use('/trig-api', require('./routes/trig'));
//
// triRand/triPick are local aliases for the global randomInt/pick helpers.
// Until all topic routers are extracted (Phase 2), define them locally here
// so this file is self-contained and testable without importing the monolith.

const router = require('express').Router();

function rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[10,24,26],[20,21,29]];

router.get('/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    const [a, b, c] = pick(TRIPLES);
    if (pick([true, false])) {
      res.json({ id, difficulty, type: 'pythagoras',
        prompt: `Right triangle: legs = ${a} and ${b}. Find the hypotenuse.`,
        answer: c, answerDen: 1 });
    } else {
      res.json({ id, difficulty, type: 'pythagoras',
        prompt: `Right triangle: hypotenuse = ${c}, one leg = ${a}. Find the other leg.`,
        answer: b, answerDen: 1 });
    }
    return;
  }

  if (difficulty === 'medium') {
    const angle = rand(15, 75);
    const rad = angle * Math.PI / 180;
    const side = rand(5, 20);
    const fn = pick(['sin', 'cos', 'tan']);
    let prompt;
    if (fn === 'sin') {
      const opp = Math.round(side * Math.sin(rad) * 10) / 10;
      prompt = `Right triangle: opposite = ${opp}, hypotenuse = ${side}. Find the angle (degrees).`;
    } else if (fn === 'cos') {
      const adj = Math.round(side * Math.cos(rad) * 10) / 10;
      prompt = `Right triangle: adjacent = ${adj}, hypotenuse = ${side}. Find the angle (degrees).`;
    } else {
      const opp = Math.round(side * Math.tan(rad) * 10) / 10;
      prompt = `Right triangle: opposite = ${opp}, adjacent = ${side}. Find the angle (degrees).`;
    }
    res.json({ id, difficulty, type: 'find_angle', prompt, answer: angle, answerDen: 1 });
    return;
  }

  if (difficulty === 'hard') {
    const A = rand(30, 80);
    const B = rand(30, 150 - A);
    const radA = A * Math.PI / 180;
    const radB = B * Math.PI / 180;
    const a = rand(5, 20);
    const b = Math.round(a * Math.sin(radB) / Math.sin(radA) * 10) / 10;
    if (pick([true, false])) {
      res.json({ id, difficulty, type: 'sine_rule',
        prompt: `Triangle: a = ${a}, angle A = ${A}°, angle B = ${B}°. Find side b (1 d.p.).`,
        answer: b, answerDen: 1 });
    } else {
      res.json({ id, difficulty, type: 'sine_rule',
        prompt: `Triangle: a = ${a}, b = ${b}, angle A = ${A}°. Find angle B (degrees).`,
        answer: B, answerDen: 1 });
    }
    return;
  }

  // extrahard: cosine rule or area = ½ab·sinC
  const a = rand(5, 15);
  const b = rand(5, 15);
  const C = rand(30, 120);
  const radC = C * Math.PI / 180;
  if (pick([true, false])) {
    const c = Math.round(Math.sqrt(a*a + b*b - 2*a*b*Math.cos(radC)) * 10) / 10;
    res.json({ id, difficulty, type: 'cosine_rule',
      prompt: `Triangle: a = ${a}, b = ${b}, angle C = ${C}°. Find side c (1 d.p.).`,
      answer: c, answerDen: 1 });
  } else {
    const area = Math.round(0.5 * a * b * Math.sin(radC) * 10) / 10;
    res.json({ id, difficulty, type: 'area',
      prompt: `Triangle: a = ${a}, b = ${b}, angle C = ${C}°. Find the area (1 d.p.).`,
      answer: area, answerDen: 1 });
  }
});

router.post('/check', require('express').json(), (req, res) => {
  const { answer: expected } = req.body;
  const userNum = parseFloat((req.body.userAnswer || '').replace(/[°\s]/g, ''));
  const correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.5;
  res.json({ correct, display: String(expected), message: correct ? 'Correct!' : 'Incorrect' });
});

module.exports = router;

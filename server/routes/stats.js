'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function factorial(n) {
  if (n < 0) return undefined;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function pcPickPair(level, section) {
  const nMax = level === 1 ? 6 : (level === 2 ? 8 : 9);
  const nMin = level === 1 ? 3 : 4;
  const n = randomInt(nMin, nMax);
  const r = randomInt(2, Math.min(n - 1, 4));
  return { n, r };
}

function pcWorkedExample(n, r, op) {
  if (op === 'P') {
    return {
      heading: `Worked example: ${n}P${r} = n! / (n − r)!`,
      lines: [
        `${n}P${r} = ${n}! / (${n} − ${r})!`,
        `       = ${n}! / ${n - r}!`,
        `       = ${factorial(n)} / ${factorial(n - r)}`,
        `       = ${factorial(n) / factorial(n - r)}`,
      ],
    };
  }
  return {
    heading: `Worked example: ${n}C${r} = n! / (r! × (n − r)!)`,
    lines: [
      `${n}C${r} = ${n}! / (${r}! × (${n} − ${r})!)`,
      `       = ${factorial(n)} / (${factorial(r)} × ${factorial(n - r)})`,
      `       = ${factorial(n)} / ${factorial(r) * factorial(n - r)}`,
      `       = ${factorial(n) / (factorial(r) * factorial(n - r))}`,
    ],
  };
}

const PERMCOMB_WORD_BANK_P = [
  (n, r) => ({ prompt: `In how many ways can ${r} books be arranged on a shelf chosen from ${n} different books?`, op: 'P' }),
  (n, r) => ({ prompt: `Gold, silver, and bronze medals are awarded among ${n} runners. How many ways can the medals be assigned (assume r = 3)?`, op: 'P', forceR: 3 }),
  (n, r) => ({ prompt: `How many ${r}-letter sequences (no repeated letters) can be made from ${n} distinct letters?`, op: 'P' }),
  (n, r) => ({ prompt: `${n} people line up for a photo and ${r} of them stand at the front. In how many orders can those ${r} positions be filled?`, op: 'P' }),
];
const PERMCOMB_WORD_BANK_C = [
  (n, r) => ({ prompt: `From a class of ${n} students, a committee of ${r} is to be selected. In how many ways can this be done?`, op: 'C' }),
  (n, r) => ({ prompt: `A pizza shop offers ${n} toppings. How many different ${r}-topping pizzas can be ordered (each topping used at most once)?`, op: 'C' }),
  (n, r) => ({ prompt: `How many handshakes occur if ${n} people each shake hands with ${r} of the others (pairs, order doesn't matter)?`, op: 'C', forceR: 2 }),
  (n, r) => ({ prompt: `From ${n} cards, you draw ${r} at random. How many distinct hands are possible?`, op: 'C' }),
];

function buildPermCombQuestion(op, level, n, r, id, isMixed) {
  if (op === 'P') {
    const answer = factorial(n) / factorial(n - r);
    if (level === 1) {
      return { id, op, level, n, r, answer, kind: 'formula_fill',
        prompt: `${n}P${r} = ${n}! / (${n} − ${r})!`,
        formula: { op: 'P', n, r, blanks: ['n', 'n-r'] },
        expected: { 'n': n, 'n-r': n - r },
        worked: pcWorkedExample(n, r, 'P') };
    }
    if (level === 2) {
      return { id, op, level, n, r, answer, kind: 'full_calc',
        prompt: `Calculate ${n}P${r}.`, worked: pcWorkedExample(n, r, 'P') };
    }
    const tmpl = PERMCOMB_WORD_BANK_P[Math.floor(Math.random() * PERMCOMB_WORD_BANK_P.length)];
    const built = tmpl(n, r);
    const useR = built.forceR != null ? built.forceR : r;
    const ans = factorial(n) / factorial(n - useR);
    return { id, op, level, n, r: useR, answer: ans, kind: isMixed ? 'word_pc_mixed' : 'word',
      prompt: built.prompt, worked: pcWorkedExample(n, useR, 'P') };
  }
  const answerC = factorial(n) / (factorial(r) * factorial(n - r));
  if (level === 1) {
    return { id, op, level, n, r, answer: answerC, kind: 'formula_fill',
      prompt: `${n}C${r} = ${n}! / (${r}! × (${n} − ${r})!)`,
      formula: { op: 'C', n, r, blanks: ['n', 'r', 'n-r'] },
      expected: { 'n': n, 'r': r, 'n-r': n - r },
      worked: pcWorkedExample(n, r, 'C') };
  }
  if (level === 2) {
    return { id, op, level, n, r, answer: answerC, kind: 'full_calc',
      prompt: `Calculate ${n}C${r}.`, worked: pcWorkedExample(n, r, 'C') };
  }
  const tmpl = PERMCOMB_WORD_BANK_C[Math.floor(Math.random() * PERMCOMB_WORD_BANK_C.length)];
  const built = tmpl(n, r);
  const useR = built.forceR != null ? built.forceR : r;
  const ansC = factorial(n) / (factorial(useR) * factorial(n - useR));
  return { id, op, level, n, r: useR, answer: ansC, kind: isMixed ? 'word_pc_mixed' : 'word',
    prompt: built.prompt, worked: pcWorkedExample(n, useR, 'C') };
}

function generatePermCombQuestion(section, level, seen) {
  const op = section === 'mixed' ? (Math.random() < 0.5 ? 'P' : 'C') : section;
  let { n, r } = pcPickPair(level, op);
  for (let attempt = 0; attempt < 25; attempt++) {
    const id = `pc-${op}-L${level}-${n}-${r}`;
    if (!seen.includes(id)) return buildPermCombQuestion(op, level, n, r, id, section === 'mixed');
    ({ n, r } = pcPickPair(level, op));
  }
  const id = `pc-${op}-L${level}-${n}-${r}-${Math.floor(Math.random() * 1e6)}`;
  return buildPermCombQuestion(op, level, n, r, id, section === 'mixed');
}

const generators = {
  permcomb: {
    question(difficulty, opts = {}) {
      let section = (opts.section || '').toUpperCase();
      if (section !== 'P' && section !== 'C' && section !== 'MIXED') {
        if (difficulty === 'medium') section = 'C';
        else if (difficulty === 'extrahard') section = 'MIXED';
        else section = 'P';
      }
      const sectionKey = section === 'MIXED' ? 'mixed' : section;
      const level = Math.max(1, Math.min(3, parseInt(opts.level, 10) || (difficulty === 'hard' ? 3 : 2)));
      const seen = String(opts.seen || '').split(',').filter(Boolean);
      const q = generatePermCombQuestion(sectionKey, level, seen);
      q.display = String(q.answer);
      return q;
    },
    check(body) {
      const { answer, display, level, kind, expected } = body;
      if (kind === 'formula_fill' && expected && body.blanks) {
        const blanks = body.blanks || {};
        let allCorrect = true;
        for (const key of Object.keys(expected)) {
          if (parseInt(blanks[key], 10) !== expected[key]) { allCorrect = false; break; }
        }
        return { correct: allCorrect, display, message: allCorrect ? 'Correct!' : 'Check the blanks.' };
      }
      const userStr = String(body.userAnswer || '').replace(/[\s,]/g, '');
      const userNum = parseInt(userStr, 10);
      const correct = !isNaN(userNum) && userNum === answer;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },
};

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty, req.query));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;

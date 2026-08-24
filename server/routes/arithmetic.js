'use strict';
// Arithmetic topic router: addition, multiply, basicarith, squaring, rounding, decimals
// Mounted in server/index.js via:
//   app.use('/addition-api', require('./routes/arithmetic'));
//   app.use('/multiply-api', require('./routes/arithmetic')); ... etc.
// The dispatcher reads req.baseUrl to identify the topic.

const router = require('express').Router();

// ── Shared utilities ────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arithRange(difficulty) {
  if (difficulty === 'easy')      return { min: 1, max: 9 };
  if (difficulty === 'medium')    return { min: 10, max: 99 };
  if (difficulty === 'hard')      return { min: 100, max: 999 };
  if (difficulty === 'extrahard') return { min: 1000, max: 9999 };
  return { min: 1, max: 9 };
}

function roundHalfUp(value, dp = 0) {
  if (!isFinite(value) || value === 0) return value;
  const negative = value < 0;
  let s = Math.abs(value).toString();
  if (/e/i.test(s)) {
    s = Math.abs(value).toFixed(Math.max(20, dp + 5));
  }
  let [intStr, decStr = ''] = s.split('.');
  if (dp >= 0) {
    if (decStr.length <= dp) return negative ? -parseFloat(s) : parseFloat(s);
    const keep = intStr + decStr.slice(0, dp);
    const checkDigit = parseInt(decStr[dp], 10);
    let resultDigits;
    if (checkDigit >= 5) {
      const incremented = (BigInt(keep) + 1n).toString();
      resultDigits = incremented.length >= keep.length
        ? incremented : incremented.padStart(keep.length, '0');
    } else {
      resultDigits = keep;
    }
    let resInt, resDec;
    if (dp === 0) {
      resInt = resultDigits; resDec = '';
    } else {
      resInt = resultDigits.slice(0, resultDigits.length - dp);
      resDec = resultDigits.slice(resultDigits.length - dp);
      if (resInt === '') resInt = '0';
    }
    return parseFloat((negative ? '-' : '') + resInt + (resDec ? '.' + resDec : ''));
  } else {
    const removeCount = -dp;
    const padded = intStr.padStart(removeCount + 1, '0');
    const keep = padded.slice(0, padded.length - removeCount);
    const dropFirst = padded[padded.length - removeCount];
    const resultInt = parseInt(dropFirst, 10) >= 5
      ? (BigInt(keep) + 1n).toString() : keep;
    return parseFloat((negative ? '-' : '') + resultInt + '0'.repeat(removeCount));
  }
}

function roundSigFigs(value, sf) {
  if (!isFinite(value) || value === 0) return value;
  const mag = Math.floor(Math.log10(Math.abs(value)));
  return roundHalfUp(value, sf - mag - 1);
}

// ── Topic generators ────────────────────────────────────────────────────────

const generators = {

  addition: {
    question(difficulty, opts = {}) {
      const digits = [1, 2, 3, 4].includes(Number(opts.digits)) ? Number(opts.digits) : 1;
      const ranges = { 1: { min: 0, max: 9 }, 2: { min: 10, max: 99 }, 3: { min: 100, max: 999 }, 4: { min: 1000, max: 9999 } };
      const range = ranges[digits];
      const sumMax = opts.sumMax ? Number(opts.sumMax) : null;
      const effectiveMax = sumMax ? Math.min(range.max, Math.floor(sumMax / 2)) : range.max;
      const effectiveMin = Math.min(range.min, effectiveMax);
      const a = randomInt(effectiveMin, effectiveMax);
      const b = randomInt(effectiveMin, effectiveMax);
      const additionTemplates = [
        `Alice has ${a} apples and Bob gives her ${b} more. How many apples does Alice have in total?`,
        `A store sold ${a} books in the morning and ${b} books in the afternoon. What is the total number of books sold?`,
        `You have $${a} in your savings account and you deposit $${b}. What is your new balance?`,
        `A farmer planted ${a} trees in the first week and ${b} trees in the second week. How many trees were planted in total?`,
        `${a} + ${b} = ?`,
      ];
      const prompt = additionTemplates[Math.floor(Math.random() * additionTemplates.length)];
      return { id: `${digits}-${Date.now()}-${Math.random()}`, digits, a, b, prompt, answer: a + b };
    },
    check(body) {
      const { a, b, answer } = body;
      const correctAnswer = Number(a) + Number(b);
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  multiply: {
    question(difficulty, opts = {}) {
      const table = Math.max(1, Number(opts.table || 1));
      const multiplier = randomInt(1, 10);
      const answer = table * multiplier;
      return {
        id: `multiply-${Date.now()}-${Math.random()}`,
        table, multiplier,
        prompt: `${table} × ${multiplier}`,
        answer,
      };
    },
    check(body) {
      const { table, multiplier, answer } = body;
      const correctAnswer = Number(table) * Number(multiplier);
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  basicarith: {
    question(difficulty) {
      const range = arithRange(difficulty);
      const ops = ['+', '−', '×', '÷'];
      const op = ops[randomInt(0, 3)];
      let a = randomInt(range.min, range.max);
      let b = randomInt(range.min, range.max);
      if (Math.random() < 0.4) a = -a;
      if (Math.random() < 0.4) b = -b;
      let answer;
      if (op === '+') answer = a + b;
      else if (op === '−') answer = a - b;
      else if (op === '×') answer = a * b;
      else {
        if (b === 0) b = 1;
        const qMag = Math.max(1, Math.min(Math.abs(range.max), 12));
        let q = randomInt(1, qMag);
        if (Math.random() < 0.4) q = -q;
        a = b * q;
        answer = q;
      }
      let prompt;
      if (op === '×' || op === '÷') prompt = `(${a}) ${op} (${b})`;
      else if (b < 0) prompt = `${a} ${op} (${b})`;
      else prompt = `${a} ${op} ${b}`;
      return { id: `arith-${Date.now()}-${Math.random()}`, a, b, op, prompt, answer };
    },
    check(body) {
      const { a, b, op, answer } = body;
      let correctAnswer;
      if (op === '+') correctAnswer = Number(a) + Number(b);
      else if (op === '−') correctAnswer = Number(a) - Number(b);
      else if (op === '×') correctAnswer = Number(a) * Number(b);
      else if (op === '÷') correctAnswer = Number(b) === 0 ? NaN : Number(a) / Number(b);
      else correctAnswer = NaN;
      const correct = Number(answer) === correctAnswer;
      return { correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  squaring: {
    question(difficulty) {
      const id = Date.now();
      let lo, hi;
      if (difficulty === 'easy')        { lo = 11; hi = 29; }
      else if (difficulty === 'medium') { lo = 30; hi = 59; }
      else if (difficulty === 'hard')   { lo = 60; hi = 79; }
      else                              { lo = 80; hi = 99; }
      const n = randomInt(lo, hi);
      const a = Math.floor(n / 10) * 10;
      const b = n - a;
      const aSq = a * a, bSq = b * b, twoAB = 2 * a * b, answer = n * n;
      const prompt = `Find ${n}² using (${a} + ${b})²`;
      const display = `${n}² = ${a}² + 2·${a}·${b} + ${b}² = ${aSq} + ${twoAB} + ${bSq} = ${answer}`;
      return { id, difficulty, n, a, b, aSq, bSq, twoAB, answer, prompt, display };
    },
    check(body) {
      const { a, b, aSq, bSq, twoAB, answer, display } = body;
      const ua = (body.userAnswer || '').toString().replace(/\s/g, '');
      const parts = ua.split('|').map(s => parseInt(s.trim()));
      let correct = false;
      if (parts.length === 4) {
        correct = parts[0] === aSq && parts[1] === bSq && parts[2] === twoAB && parts[3] === answer;
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        correct = parts[0] === answer;
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  rounding: {
    question(difficulty) {
      let prompt, answer, display;
      if (difficulty === 'easy') {
        const dp = randomInt(1, 2);
        const num = (randomInt(100, 9999) / 1000).toFixed(4);
        answer = roundHalfUp(parseFloat(num), dp);
        display = answer.toFixed(dp);
        prompt = `Round ${num} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
      } else if (difficulty === 'medium') {
        const sf = randomInt(1, 3);
        const num = randomInt(1000, 99999) / (Math.pow(10, randomInt(0, 2)));
        const rounded = roundSigFigs(num, sf);
        answer = rounded; display = String(rounded);
        prompt = `Round ${num} to ${sf} significant figure${sf > 1 ? 's' : ''}.`;
      } else if (difficulty === 'hard') {
        const dp = randomInt(1, 3);
        const num = (randomInt(10000, 99999) / 10000).toFixed(5);
        const factor = Math.pow(10, dp);
        answer = Math.trunc(parseFloat(num) * factor) / factor;
        display = answer.toFixed(dp);
        prompt = `Truncate ${num} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
      } else {
        const a = randomInt(10, 99), b = randomInt(10, 99);
        const aRound = roundSigFigs(a, 1), bRound = roundSigFigs(b, 1);
        answer = aRound * bRound; display = String(answer);
        prompt = `Estimate ${a} × ${b} by rounding each number to 1 significant figure.`;
      }
      return { prompt, answer, display, difficulty };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/\s/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.005;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  decimals: {
    question(difficulty) {
      const id = `q-${Date.now()}-${Math.random()}`;
      if (difficulty === 'easy') {
        const a = (randomInt(1, 10) * 10 + randomInt(0, 9)) / 10;
        const b = (randomInt(1, 10) * 10 + randomInt(0, 9)) / 10;
        const answer = Math.round((a + b) * 100) / 100;
        return { id, difficulty, prompt: `${a.toFixed(1)} + ${b.toFixed(1)} = ?`, answer, display: answer.toFixed(1) };
      } else if (difficulty === 'medium') {
        let a = (randomInt(10, 100) + randomInt(0, 99) / 100);
        let b = (randomInt(10, 100) + randomInt(0, 99) / 100);
        if (a < b) [a, b] = [b, a];
        const answer = Math.round((a - b) * 100) / 100;
        return { id, difficulty, prompt: `${a.toFixed(2)} − ${b.toFixed(2)} = ?`, answer, display: answer.toFixed(2) };
      } else if (difficulty === 'hard') {
        const dec = (randomInt(10, 50) + randomInt(0, 99) / 100);
        const int = randomInt(2, 15);
        const answer = Math.round(dec * int * 100) / 100;
        return { id, difficulty, prompt: `${dec.toFixed(2)} × ${int} = ?`, answer, display: answer.toFixed(2) };
      } else {
        const a = (randomInt(20, 100) + randomInt(0, 99) / 100);
        const b = (randomInt(2, 20) + randomInt(0, 99) / 100);
        const answer = Math.round((a / b) * 100) / 100;
        return { id, difficulty, prompt: `${a.toFixed(2)} ÷ ${b.toFixed(2)} = ?`, answer, display: answer.toFixed(2) };
      }
    },
    check(body) {
      const { answer, display } = body;
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.01;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

// ── Dispatcher ──────────────────────────────────────────────────────────────

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty || 'easy', req.query));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;

'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

function triRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function triPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const PROB_VALID_CONTEXTS = ['balls', 'coins', 'dice', 'cards'];

/** Pick a "favourable" event description for a given context. */
function probSampleEvent(context) {
  if (context === 'balls') {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const counts = {};
    let total = 0;
    // 2-3 colours, each 2-6 balls
    const pickedColors = [];
    while (pickedColors.length < (Math.random() < 0.5 ? 2 : 3)) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      if (!pickedColors.includes(c)) pickedColors.push(c);
    }
    for (const c of pickedColors) {
      const n = randomInt(2, 6);
      counts[c] = n; total += n;
    }
    const ask = pickedColors[Math.floor(Math.random() * pickedColors.length)];
    return { context, counts, total, ask, askLabel: `${ask} ball` };
  }
  if (context === 'coins') {
    // 1 or 2 coin tosses
    const tosses = Math.random() < 0.5 ? 1 : 2;
    const ask = tosses === 1
      ? (Math.random() < 0.5 ? 'heads' : 'tails')
      : ['two heads', 'two tails', 'one head and one tail'][Math.floor(Math.random() * 3)];
    return { context, tosses, ask, askLabel: ask };
  }
  if (context === 'dice') {
    const dice = Math.random() < 0.5 ? 1 : 2;
    const askPool = dice === 1
      ? ['a 6', 'an even number', 'a number greater than 4', 'a 1 or 2']
      : ['a sum of 7', 'a sum of 8', 'a double', 'both odd'];
    const ask = askPool[Math.floor(Math.random() * askPool.length)];
    return { context, dice, ask, askLabel: ask };
  }
  // cards
  const askPool = [
    'a heart', 'a spade', 'a red card', 'a black card',
    'a king', 'a queen', 'an ace', 'a face card',
    'the ace of spades', 'a 7',
  ];
  const ask = askPool[Math.floor(Math.random() * askPool.length)];
  return { context, ask, askLabel: ask };
}

/** Probability (numerator, denominator) of the favourable event. */
function probEventNumDen(ev) {
  if (ev.context === 'balls') return { n: ev.counts[ev.ask], d: ev.total };
  if (ev.context === 'coins') {
    if (ev.tosses === 1) return { n: 1, d: 2 };
    if (ev.ask === 'two heads' || ev.ask === 'two tails') return { n: 1, d: 4 };
    return { n: 2, d: 4 }; // one head one tail
  }
  if (ev.context === 'dice') {
    if (ev.dice === 1) {
      if (ev.ask === 'a 6') return { n: 1, d: 6 };
      if (ev.ask === 'an even number') return { n: 3, d: 6 };
      if (ev.ask === 'a number greater than 4') return { n: 2, d: 6 };
      if (ev.ask === 'a 1 or 2') return { n: 2, d: 6 };
    }
    if (ev.dice === 2) {
      if (ev.ask === 'a sum of 7') return { n: 6, d: 36 };
      if (ev.ask === 'a sum of 8') return { n: 5, d: 36 };
      if (ev.ask === 'a double') return { n: 6, d: 36 };
      if (ev.ask === 'both odd') return { n: 9, d: 36 };
    }
  }
  // cards
  const map = {
    'a heart': [13, 52], 'a spade': [13, 52],
    'a red card': [26, 52], 'a black card': [26, 52],
    'a king': [4, 52], 'a queen': [4, 52], 'an ace': [4, 52],
    'a face card': [12, 52],
    'the ace of spades': [1, 52], 'a 7': [4, 52],
  };
  const [n, d] = map[ev.ask] || [1, 52];
  return { n, d };
}

/** Build the natural-language prompt for an event description. */
function probPromptForEvent(ev, level, probType) {
  let scenario = '';
  if (ev.context === 'balls') {
    const parts = Object.entries(ev.counts).map(([k, v]) => `${v} ${k}`).join(', ');
    scenario = `A bag contains ${parts} balls (${ev.total} balls in total). One ball is drawn at random.`;
  } else if (ev.context === 'coins') {
    scenario = ev.tosses === 1
      ? 'A fair coin is tossed once.'
      : 'A fair coin is tossed twice.';
  } else if (ev.context === 'dice') {
    scenario = ev.dice === 1
      ? 'A standard six-sided die is rolled.'
      : 'Two standard six-sided dice are rolled.';
  } else {
    scenario = 'A card is drawn at random from a standard deck of 52 cards.';
  }

  const askPlain = `What is the probability of getting ${ev.ask}?`;
  const askComplement = `What is the probability of NOT getting ${ev.ask}?`;
  const ask = (probType === 2) ? askComplement : askPlain;

  if (level === 1) {
    // Plain English only
    return scenario + ' ' + ask;
  }
  if (level === 2) {
    // Plain English with P(x) notation alongside
    const px = (probType === 2) ? `P(not ${ev.ask})` : `P(${ev.ask})`;
    return `${scenario} ${ask}\nIn notation: ${px} = ?`;
  }
  // Level 3 — P(x) notation only (deck explainer rendered by client once)
  const px = (probType === 2) ? `P(not ${ev.ask})` : `P(${ev.ask})`;
  return `${scenario} Find ${px}.`;
}

/** Simplify fraction and return {num, den}. Reuses simplifyFraction from the shared utils. */
function probAnswer(numerator, denominator) {
  return simplifyFraction(numerator, denominator);
}

/** Build a question for problem type 1 (single event). */
function probTypeSingle(context, level) {
  const ev = probSampleEvent(context);
  const { n, d } = probEventNumDen(ev);
  const ans = probAnswer(n, d);
  return {
    type: 1, context, ev,
    prompt: probPromptForEvent(ev, level, 1),
    ansNum: ans.num, ansDen: ans.den,
  };
}

/** Type 2 — complementary event: P(not X) = 1 - P(X). */
function probTypeComplement(context, level) {
  const ev = probSampleEvent(context);
  const { n, d } = probEventNumDen(ev);
  const ans = probAnswer(d - n, d);
  return {
    type: 2, context, ev,
    prompt: probPromptForEvent(ev, level, 2),
    ansNum: ans.num, ansDen: ans.den,
  };
}

/** Type 3 — multiple events with replacement: P(A then A) = P(A) × P(A). */
function probTypeMultiWithRep(context, level) {
  const ev = probSampleEvent(context);
  const { n, d } = probEventNumDen(ev);
  // Two-draw with replacement
  const ans = probAnswer(n * n, d * d);
  let prompt;
  if (ev.context === 'balls') {
    const parts = Object.entries(ev.counts).map(([k, v]) => `${v} ${k}`).join(', ');
    prompt = `A bag contains ${parts} balls. A ball is drawn, its colour noted, and it is REPLACED. Then a second ball is drawn. What is the probability that BOTH balls are ${ev.ask}?`;
  } else if (ev.context === 'dice') {
    prompt = `${ev.dice === 1 ? 'A die is' : 'Two dice are'} rolled twice. What is the probability of getting ${ev.ask} on BOTH rolls?`;
  } else if (ev.context === 'coins') {
    prompt = `A coin is tossed twice (each toss independent). What is the probability of getting ${ev.ask} both times?`;
  } else {
    prompt = `A card is drawn from a deck, REPLACED, and another is drawn. What is the probability that BOTH cards are ${ev.ask}?`;
  }
  if (level === 3) prompt += ` (Express as a simplified fraction.)`;
  return { type: 3, context, ev, prompt, ansNum: ans.num, ansDen: ans.den };
}

/** Type 4 — multiple events without replacement: requires balls or cards. */
function probTypeMultiNoRep(context, level) {
  // Only meaningful for balls / cards (countable, finite). Coerce to balls if context is coins/dice.
  let ctx = (context === 'coins' || context === 'dice') ? 'balls' : context;
  if (ctx === 'cards' && level < 3) ctx = 'balls';
  const ev = probSampleEvent(ctx);
  const { n, d } = probEventNumDen(ev);
  if (n < 2 || d < 2) {
    // Not enough to draw two; fallback
    return probTypeMultiWithRep(context, level);
  }
  const ans = probAnswer(n * (n - 1), d * (d - 1));
  let prompt;
  if (ctx === 'balls') {
    const parts = Object.entries(ev.counts).map(([k, v]) => `${v} ${k}`).join(', ');
    prompt = `A bag contains ${parts} balls. Two are drawn without replacement. What is the probability that BOTH are ${ev.ask}?`;
  } else {
    prompt = `Two cards are drawn from a deck without replacement. What is the probability that BOTH are ${ev.ask}?`;
  }
  if (level === 3) prompt += ` (Express as a simplified fraction.)`;
  return { type: 4, context: ctx, ev, prompt, ansNum: ans.num, ansDen: ans.den };
}

const PROB_TYPE_BUILDERS = {
  1: probTypeSingle,
  2: probTypeComplement,
  3: probTypeMultiWithRep,
  4: probTypeMultiNoRep,
};

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
  prob: {
    question(difficulty, query = {}) {
      let level = parseInt(query.level, 10);
      if (!level || isNaN(level)) {
        const map = { easy: 1, medium: 2, hard: 3, extrahard: 3 };
        level = map[difficulty] || 1;
      }
      level = Math.max(1, Math.min(3, level));
      let context = (query.context || '').toLowerCase();
      if (!PROB_VALID_CONTEXTS.includes(context)) context = 'balls';
      if (context === 'cards' && level < 3) context = 'balls';
      if (context === 'dice' && level < 2) context = 'balls';
      let probType = parseInt(query.probType, 10);
      if (!probType || isNaN(probType)) {
        if (difficulty === 'hard') probType = 3;
        else if (difficulty === 'extrahard') probType = 4;
        else probType = 1;
      }
      probType = Math.max(1, Math.min(4, probType));
      const seen = String(query.seen || '').split(',').filter(Boolean);
      const builder = PROB_TYPE_BUILDERS[probType] || probTypeSingle;
      let q, attempts = 0, id;
      do {
        q = builder(context, level);
        id = `prob-L${level}-T${probType}-${context}-${q.ev.ask}-${q.ansNum}/${q.ansDen}`;
        attempts++;
      } while (seen.includes(id) && attempts < 25);
      const worked = {
        heading: `Worked example: P(event) = favourable outcomes / total outcomes`,
        lines: [
          `For the event "${q.ev.askLabel}", count the favourable outcomes and divide by total.`,
          `Simplify the resulting fraction by dividing numerator and denominator by their GCD.`,
        ],
      };
      const display = q.ansDen === 1 ? String(q.ansNum) : `${q.ansNum}/${q.ansDen}`;
      return { id, level, context, probType, type: ['', 'simple', 'complement', 'multi_with_rep', 'multi_no_rep'][probType], prompt: q.prompt, ansNum: q.ansNum, ansDen: q.ansDen, display, answer: display, worked };
    },
    check(body) {
      const { ansNum, ansDen } = body;
      const userStr = String(body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let uNum, uDen;
      const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
      if (fracMatch) { uNum = parseInt(fracMatch[1], 10); uDen = parseInt(fracMatch[2], 10); }
      else { const n = parseFloat(userStr); if (!isNaN(n)) { uNum = Math.round(n * 10000); uDen = 10000; } }
      const es = simplifyFraction(ansNum, ansDen);
      let correct = false, wasUnsimplified = false;
      if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
        const us = simplifyFraction(uNum, uDen);
        correct = us.num === es.num && us.den === es.den;
        if (correct && fracMatch) wasUnsimplified = !(uNum === es.num && uDen === es.den);
      }
      const display = es.den === 1 ? String(es.num) : `${es.num}/${es.den}`;
      return { correct, display, message: correct ? (wasUnsimplified ? `Correct! In simplest form: ${display}.` : 'Correct!') : 'Incorrect', wasUnsimplified };
    },
  },
  stats: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        // Mean of a list
        const n = triRand(5, 8);
        const data = Array.from({ length: n }, () => triRand(1, 20));
        const sum = data.reduce((s, v) => s + v, 0);
        const mean = sum / n;
        const g = gcd(Math.abs(sum), n);
        const prompt = `Find the mean of: ${data.join(', ')}`;
        const meanDisplay = (n / g === 1) ? String(sum / g) : `${sum / g}/${n / g}`;
        return { id, difficulty, type: 'mean', prompt, data, ansNum: sum / g, ansDen: n / g, answer: meanDisplay };
      }
      else if (difficulty === 'medium') {
        // Median of a list
        const n = triPick([5, 7, 9, 6, 8, 10]);
        const data = Array.from({ length: n }, () => triRand(1, 30));
        const sorted = [...data].sort((a, b) => a - b);
        let median, ansNum, ansDen;
        if (n % 2 === 1) {
          median = sorted[Math.floor(n / 2)];
          ansNum = median; ansDen = 1;
        } else {
          const a = sorted[n / 2 - 1]; const b = sorted[n / 2];
          const g = gcd(Math.abs(a + b), 2);
          ansNum = (a + b) / g; ansDen = 2 / g;
        }
        const prompt = `Find the median of: ${data.join(', ')}`;
        const medDisplay = ansDen === 1 ? String(ansNum) : `${ansNum}/${ansDen}`;
        return { id, difficulty, type: 'median', prompt, data, ansNum, ansDen, answer: medDisplay };
      }
      else if (difficulty === 'hard') {
        // Mode and range
        const subtype = triPick(['mode', 'range']);
        const n = triRand(7, 12);
        let data;
        if (subtype === 'mode') {
          const modeVal = triRand(1, 20);
          data = [modeVal, modeVal, modeVal];
          while (data.length < n) {
            const v = triRand(1, 25);
            if (v !== modeVal && data.filter(x => x === v).length < 2) data.push(v);
          }
          // Shuffle
          for (let i = data.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [data[i], data[j]] = [data[j], data[i]]; }
          const prompt = `Find the mode of: ${data.join(', ')}`;
          return { id, difficulty, type: 'mode', subtype: 'mode', prompt, data, answer: modeVal, display: String(modeVal) };
        } else {
          data = Array.from({ length: n }, () => triRand(1, 50));
          const range = Math.max(...data) - Math.min(...data);
          const prompt = `Find the range of: ${data.join(', ')}`;
          return { id, difficulty, type: 'range', subtype: 'range', prompt, data, answer: range, display: String(range) };
        }
      }
      else {
        // Mean from frequency table
        const values = [1, 2, 3, 4, 5];
        const freqs = values.map(() => triRand(1, 10));
        const totalF = freqs.reduce((s, v) => s + v, 0);
        const totalFx = values.reduce((s, v, i) => s + v * freqs[i], 0);
        const g = gcd(Math.abs(totalFx), totalF);
        const table = values.map((v, i) => `${v}(×${freqs[i]})`).join(', ');
        const prompt = `Frequency table: ${table}. Find the mean.`;
        const freqDisplay = (totalF / g === 1) ? String(totalFx / g) : `${totalFx / g}/${totalF / g}`;
        return { id, difficulty, type: 'freq_mean', prompt, ansNum: totalFx / g, ansDen: totalF / g, answer: freqDisplay };
      }
    },
    check(body) {
      const { type } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;
      let display;

      if (type === 'mode' || type === 'range') {
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && userNum === body.answer;
        display = body.display;
      } else {
        const { ansNum, ansDen } = body;
        const es = simplifyFraction(ansNum, ansDen);
        const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
        let uNum, uDen;
        if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
        else { const n = parseFloat(userStr);
          if (!isNaN(n)) {
            // Convert decimal to fraction for comparison
            if (Number.isInteger(n)) { uNum = n; uDen = 1; }
            else { uNum = Math.round(n * 100); uDen = 100; }
          }
        }
        if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
          const us = simplifyFraction(uNum, uDen);
          correct = us.num === es.num && us.den === es.den;
        }
        // Also accept decimal approximation
        if (!correct && !isNaN(parseFloat(userStr))) {
          correct = Math.abs(parseFloat(userStr) - es.num / es.den) < 0.01;
        }
        display = es.den === 1 ? String(es.num) : `${es.num}/${es.den}`;
      }

      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },
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

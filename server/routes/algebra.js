'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

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
function seqRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function seqPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── polymul helpers ──
function polyCoeffRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 9 };
  if (difficulty === 'medium') return { min: 1, max: 10 };
  if (difficulty === 'hard') return { min: 1, max: 20 };
  if (difficulty === 'extrahard') return { min: 1, max: 30 };
  return { min: 1, max: 9 };
}

function randomPoly(degree, range) {
  const coeffs = [];
  for (let i = 0; i <= degree; i++) {
    let c = randomInt(range.min, range.max);
    if (Math.random() < 0.3 && i > 0) c = -c;
    coeffs.push(c);
  }
  if (coeffs[degree] === 0) coeffs[degree] = 1;
  return coeffs; // index = power: [constant, x, x², ...]
}

function multiplyPolys(a, b) {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}

function formatPoly(coeffs) {
  const parts = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0 && coeffs.length > 1) continue;
    const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
    const varPart = i === 0 ? '' : i === 1 ? 'x' : `x${sup(i)}`;
    if (parts.length === 0) {
      parts.push(c === 1 && i > 0 ? varPart : c === -1 && i > 0 ? `-${varPart}` : `${c}${varPart}`);
    } else {
      const sign = c > 0 ? '+' : '-';
      const abs = Math.abs(c);
      parts.push(`${sign} ${abs === 1 && i > 0 ? varPart : `${abs}${varPart}`}`);
    }
  }
  return parts.join(' ') || '0';
}

// ── polyfactor helpers ──
function factorCoeffRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 10 };
  if (difficulty === 'medium') return { min: 1, max: 20 };
  if (difficulty === 'hard') return { min: 1, max: 30 };
  if (difficulty === 'extrahard') return { min: 1, max: 50 };
  return { min: 1, max: 10 };
}

const POLYFACTOR_TIERS = {
  1: { aChoices: [1],          qMax: 10, qMin: 1 },
  2: { aChoices: [1],          qMax: 12, qMin: 1 },
  3: { aChoices: [2, 3],       qMax: 6,  qMin: 1 },
  4: { aChoices: [2, 3, 4, 5], qMax: 6,  qMin: 1 },
};

function polyfactorPickFactors(tier) {
  const cfg = POLYFACTOR_TIERS[tier] || POLYFACTOR_TIERS[1];
  const a = cfg.aChoices[Math.floor(Math.random() * cfg.aChoices.length)];
  let p, r;
  if (a === 1) { p = 1; r = 1; }
  else if (a === 2) { p = 2; r = 1; }
  else if (a === 3) { p = 3; r = 1; }
  else if (a === 4) { p = Math.random() < 0.5 ? 4 : 2; r = a / p; }
  else { p = a; r = 1; } // a = 5
  const sign = () => (tier === 1 ? 1 : (Math.random() < 0.6 ? 1 : -1));
  const q = sign() * randomInt(cfg.qMin, cfg.qMax);
  const s = sign() * randomInt(cfg.qMin, cfg.qMax);
  return { p, q, r, s };
}

function polyfactorExpand(p, q, r, s) {
  return { a: p * r, b: p * s + q * r, c: q * s };
}

function polyfactorFormat(p, q) {
  const left = p === 1 ? 'x' : `${p}x`;
  if (q === 0) return `(${left})`;
  const sign = q > 0 ? '+' : '−';
  return `(${left} ${sign} ${Math.abs(q)})`;
}

function polyfactorFormatBoth(p, q, r, s) {
  return polyfactorFormat(p, q) + polyfactorFormat(r, s);
}

function polyfactorMCQOptions(p, q, r, s, tier) {
  const correct = polyfactorFormatBoth(p, q, r, s);
  const seen = new Set([correct]);
  const distractors = [];

  const candidates = [
    [p, -q, r, s],
    [p, q, r, -s],
    [p, q + 1, r, s],
    [p, q, r, s + 1],
    [p, s, r, q],
    [p, -q, r, -s],
  ].map(([P, Q, R, S]) => polyfactorFormatBoth(P, Q, R, S));

  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      distractors.push(c);
      if (distractors.length === 3) break;
    }
  }
  const opts = [correct, ...distractors];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { options: opts, correct };
}

function polyfactorVerify(a, b, c, p1, q1, p2, q2) {
  const ua = p1 * p2;
  const ub = p1 * q2 + q1 * p2;
  const uc = q1 * q2;
  return ua === a && ub === b && uc === c;
}

// ── primefactor helpers ──
function primeRange(difficulty) {
  if (difficulty === 'easy') return { min: 2, max: 100 };
  if (difficulty === 'medium') return { min: 2, max: 300 };
  if (difficulty === 'hard') return { min: 2, max: 1000 };
  if (difficulty === 'extrahard') return { min: 2, max: 5000 };
  return { min: 2, max: 100 };
}

function primeFactors(n) {
  const factors = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) { factors.push(d); n /= d; }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors;
}

// ── qformula helpers ──
function qfRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 10 };
  if (difficulty === 'medium') return { min: 1, max: 20 };
  if (difficulty === 'hard') return { min: 1, max: 30 };
  if (difficulty === 'extrahard') return { min: 1, max: 50 };
  return { min: 1, max: 10 };
}

// ── simul helpers ──
function simulRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 10 };
  if (difficulty === 'medium') return { min: 1, max: 12 };
  if (difficulty === 'hard') return { min: 1, max: 15 };
  if (difficulty === 'extrahard') return { min: 1, max: 20 };
  return { min: 1, max: 10 };
}

// ── funceval / lineq helpers ──
function linearRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 5 };
  if (difficulty === 'medium') return { min: 1, max: 10 };
  if (difficulty === 'hard') return { min: 1, max: 15 };
  if (difficulty === 'extrahard') return { min: 1, max: 25 };
  return { min: 1, max: 5 };
}

// ── surds helpers ──
function simpleSurd(n) {
  let outer = 1;
  let inner = n;
  for (let f = 2; f * f <= inner; f++) {
    while (inner % (f * f) === 0) {
      outer *= f;
      inner /= (f * f);
    }
  }
  return { outer, inner };
}

const SQUARE_FREE = [2,3,5,6,7,10,11,13,14,15,17,19,21,22,23,26,29,30];

// ── indices helpers ──
function idxPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function idxRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

function sup(n) {
  const map = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const s = String(Math.abs(n));
  const digits = s.split('').map(d => map[Number(d)]).join('');
  if (n < 0) return '⁻' + digits;
  return digits;
}

function fmtFracExp(num, den) {
  if (den === 1) return String(num);
  return `${num}/${den}`;
}

// ── lineareq helper ──
function linearEqQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // ax + b = c
    const a = randomInt(2, 9);
    const b = randomInt(1, 20);
    const c = randomInt(1, 100);
    const answer = (c - b) / a;
    const prompt = `Solve for x: ${a}x + ${b} = ${c}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(2)) };
  } else if (difficulty === 'medium') {
    // ax + b = cx + d
    const a = randomInt(2, 8);
    const b = randomInt(1, 20);
    const c = randomInt(2, 8);
    if (a === c) return linearEqQuestion(difficulty);
    const d = randomInt(1, 20);
    const answer = (d - b) / (a - c);
    const prompt = `Solve for x: ${a}x + ${b} = ${c}x + ${d}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(2)) };
  } else if (difficulty === 'hard') {
    // a(bx + c) = d
    const a = randomInt(2, 5);
    const b = randomInt(2, 6);
    const c = randomInt(1, 10);
    const d = randomInt(10, 100);
    const answer = (d / a - c) / b;
    const prompt = `Solve for x: ${a}(${b}x + ${c}) = ${d}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(3)) };
  } else {
    // (ax+b)/c = d
    const a = randomInt(2, 6);
    const b = randomInt(1, 10);
    const c = randomInt(2, 5);
    const d = randomInt(2, 10);
    const answer = (d * c - b) / a;
    const prompt = `Solve for x: (${a}x + ${b})/${c} = ${d}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(3)) };
  }
}

const generators = {

  polymul: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const range = polyCoeffRange(difficulty);
      let p1, p2;

      if (difficulty === 'easy') {
        const usesX = Math.random() < 0.4; // 40% chance of ax(...) form
        if (usesX) {
          const a = randomInt(2, range.max);
          const b = randomInt(1, range.max);
          let c = randomInt(1, range.max);
          if (Math.random() < 0.3) c = -c;
          p1 = [0, a];
          p2 = [c, b];
        } else {
          const a = randomInt(2, range.max);
          const b = randomInt(1, range.max);
          let c = randomInt(1, range.max);
          if (Math.random() < 0.3) c = -c;
          p1 = [a];
          p2 = [c, b];
        }
      } else if (difficulty === 'medium') {
        p1 = randomPoly(1, range);
        p2 = randomPoly(1, range);
      } else if (difficulty === 'hard') {
        p1 = randomPoly(2, range);
        p2 = randomPoly(2, range);
      } else if (difficulty === 'extrahard') {
        p1 = randomPoly(3, range);
        p2 = randomPoly(3, range);
      } else {
        const a = randomInt(2, 9);
        const b = randomInt(1, 9);
        let c = randomInt(1, 9);
        if (Math.random() < 0.3) c = -c;
        p1 = [a];
        p2 = [c, b];
      }

      const product = multiplyPolys(p1, p2);
      return {
        id: `polymul-${Date.now()}-${Math.random()}`,
        p1, p2, product,
        p1Display: formatPoly(p1),
        p2Display: formatPoly(p2),
        productDisplay: formatPoly(product),
        resultDegree: product.length - 1,
      };
    },
    check(body) {
      const { p1, p2, userCoeffs } = body || {};
      const product = multiplyPolys(p1, p2);
      const correct = product.length === userCoeffs.length && product.every((c, i) => Number(userCoeffs[i]) === c);
      return { correct, correctCoeffs: product, correctDisplay: formatPoly(product), message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  polyfactor: {
    question(difficulty, query = {}) {
      let tier = parseInt(query.tier, 10);
      if (!tier || isNaN(tier)) {
        const map = { easy: 1, medium: 2, hard: 3, extrahard: 4 };
        tier = map[difficulty] || 1;
      }
      tier = Math.max(1, Math.min(4, tier));
      const level = Math.max(1, Math.min(3, parseInt(query.level, 10) || 1));
      const seen = String(query.seen || '').split(',').filter(Boolean);

      let attempt = 0;
      let factors;
      let id;
      do {
        factors = polyfactorPickFactors(tier);
        id = `pf-T${tier}-L${level}-${factors.p},${factors.q},${factors.r},${factors.s}`;
        attempt++;
      } while (seen.includes(id) && attempt < 25);

      const { p, q, r, s } = factors;
      const { a, b, c } = polyfactorExpand(p, q, r, s);
      const display = formatPoly([c, b, a]);

      const worked = {
        heading: `Worked example: ${display}`,
        lines: [
          `Find two numbers whose product is ${c} and that combine (with a=${a}) to give the middle term ${b}.`,
          `Those numbers correspond to factors ${polyfactorFormat(p, q)} and ${polyfactorFormat(r, s)}.`,
          `Check: ${polyfactorFormatBoth(p, q, r, s)} = ${display}.`,
        ],
      };

      if (level === 1) {
        const { options, correct } = polyfactorMCQOptions(p, q, r, s, tier);
        return {
          id, tier, level, kind: 'mcq',
          a, b, c,
          factors: { p, q, r, s },
          display, prompt: `Factorise: ${display}`,
          options, correct,
          worked,
        };
      }

      if (level === 2) {
        const variants = ['both', 'q', 's'];
        if (q !== 0 && s !== 0 && Math.random() < 0.25) variants.push('sign');
        const variant = variants[Math.floor(Math.random() * variants.length)];
        return {
          id, tier, level, kind: 'fill_blank',
          a, b, c,
          factors: { p, q, r, s },
          variant,
          display, prompt: `Factorise: ${display}`,
          worked,
        };
      }

      return {
        id, tier, level, kind: 'direct',
        a, b, c,
        factors: { p, q, r, s },
        display, prompt: `Factorise completely: ${display}`,
        worked,
      };
    },
    check(body) {
      const { a, b, c, kind, level } = body || {};

      if (kind === 'mcq') {
        const { selectedOption, correct: correctOption } = body;
        const correct = String(selectedOption) === String(correctOption);
        return { correct, message: correct ? 'Correct' : 'Incorrect', display: correctOption };
      }

      const userP = Number(body.userP);
      const userQ = Number(body.userQ);
      const userR = Number(body.userR);
      const userS = Number(body.userS);

      const correct =
        polyfactorVerify(Number(a), Number(b), Number(c), userP, userQ, userR, userS) ||
        polyfactorVerify(Number(a), Number(b), Number(c), userR, userS, userP, userQ);

      const display = body.display || (body.factors
        ? polyfactorFormatBoth(body.factors.p, body.factors.q, body.factors.r, body.factors.s)
        : '');

      return { correct, message: correct ? 'Correct' : 'Incorrect', display, level };
    },
  },

  primefactor: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const range = primeRange(difficulty);
      let n = randomInt(range.min, range.max);
      while (primeFactors(n).length < 2) n = randomInt(range.min, range.max);
      return {
        id: `prime-${Date.now()}-${Math.random()}`,
        number: n,
        factors: primeFactors(n),
      };
    },
    check(body) {
      const { number, userFactors } = body || {};
      const correct = primeFactors(Number(number));
      const userSorted = (userFactors || []).map(Number).sort((a, b) => a - b);
      const isCorrect = correct.length === userSorted.length && correct.every((f, i) => f === userSorted[i]);
      return { correct: isCorrect, correctFactors: correct, message: isCorrect ? 'Correct' : 'Incorrect' };
    },
  },

  qformula: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const range = qfRange(difficulty);
      let a, b, c, disc;
      if (difficulty === 'easy') {
        const r1 = randomInt(-range.max, range.max);
        const r2 = randomInt(-range.max, range.max);
        a = 1;
        b = -(r1 + r2);
        c = r1 * r2;
      } else {
        a = randomInt(1, Math.min(range.max, 5));
        b = randomInt(-range.max, range.max);
        if (difficulty === 'medium') {
          do {
            b = randomInt(-range.max, range.max);
            c = randomInt(-range.max, range.max);
          } while (b * b - 4 * a * c < 0);
        } else {
          c = randomInt(-range.max, range.max);
        }
      }
      disc = b * b - 4 * a * c;
      const roots = {};
      if (disc > 0) {
        roots.type = 'real_distinct';
        roots.r1 = parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(2));
        roots.r2 = parseFloat(((-b - Math.sqrt(disc)) / (2 * a)).toFixed(2));
      } else if (disc === 0) {
        roots.type = 'real_equal';
        roots.r1 = parseFloat((-b / (2 * a)).toFixed(2));
      } else {
        roots.type = 'complex';
        roots.realPart = parseFloat((-b / (2 * a)).toFixed(2));
        roots.imagPart = parseFloat((Math.sqrt(-disc) / (2 * a)).toFixed(2));
      }
      return { id: `qf-${Date.now()}-${Math.random()}`, a, b, c, disc, roots };
    },
    check(body) {
      const { a, b, c, userR1, userR2, userType } = body || {};
      const A = Number(a), B = Number(b), C = Number(c);
      const disc = B * B - 4 * A * C;
      let correct = false;
      const roots = {};
      if (disc > 0) {
        roots.type = 'real_distinct';
        roots.r1 = parseFloat(((-B + Math.sqrt(disc)) / (2 * A)).toFixed(2));
        roots.r2 = parseFloat(((-B - Math.sqrt(disc)) / (2 * A)).toFixed(2));
        const u1 = parseFloat(Number(userR1).toFixed(2));
        const u2 = parseFloat(Number(userR2).toFixed(2));
        correct = (Math.abs(u1 - roots.r1) < 0.05 && Math.abs(u2 - roots.r2) < 0.05) ||
                  (Math.abs(u1 - roots.r2) < 0.05 && Math.abs(u2 - roots.r1) < 0.05);
      } else if (disc === 0) {
        roots.type = 'real_equal';
        roots.r1 = parseFloat((-B / (2 * A)).toFixed(2));
        correct = Math.abs(parseFloat(Number(userR1).toFixed(2)) - roots.r1) < 0.05;
      } else {
        roots.type = 'complex';
        roots.realPart = parseFloat((-B / (2 * A)).toFixed(2));
        roots.imagPart = parseFloat((Math.sqrt(-disc) / (2 * A)).toFixed(2));
        correct = Math.abs(Number(userR1) - roots.realPart) < 0.05 && Math.abs(Number(userR2) - roots.imagPart) < 0.05;
      }
      return { correct, roots, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  simul: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const range = simulRange(difficulty);
      const is2x2 = difficulty === 'easy' || difficulty === 'medium';

      if (is2x2) {
        const x = randomInt(-range.max, range.max);
        const y = randomInt(-range.max, range.max);
        let a1 = randomInt(1, range.max), b1 = randomInt(1, range.max);
        let a2 = randomInt(1, range.max), b2 = randomInt(1, range.max);
        while (a1 * b2 === a2 * b1) { a2 = randomInt(1, range.max); b2 = randomInt(1, range.max); }
        if (Math.random() < 0.3) a1 = -a1;
        if (Math.random() < 0.3) b1 = -b1;
        if (Math.random() < 0.3) a2 = -a2;
        if (Math.random() < 0.3) b2 = -b2;
        const eqs = [
          { a: a1, b: b1, d: a1 * x + b1 * y },
          { a: a2, b: b2, d: a2 * x + b2 * y },
        ];
        const prompt2 = eqs.map(e => `${e.a}x + ${e.b}y = ${e.d}`).join(', ');
        return {
          id: `simul-${Date.now()}-${Math.random()}`,
          size: 2,
          eqs,
          solution: { x, y },
          prompt: `Solve: ${prompt2}`,
          answer: x,
        };
      } else if (difficulty === 'hard' || difficulty === 'extrahard') {
        const x = randomInt(-8, 8), y = randomInt(-8, 8), z = randomInt(-8, 8);
        let eqs;
        let attempts = 0;
        do {
          eqs = [];
          for (let i = 0; i < 3; i++) {
            let a = randomInt(1, Math.min(range.max, 10));
            let b = randomInt(1, Math.min(range.max, 10));
            let c = randomInt(1, Math.min(range.max, 10));
            if (Math.random() < 0.3) a = -a;
            if (Math.random() < 0.3) b = -b;
            if (Math.random() < 0.3) c = -c;
            eqs.push({ a, b, c, d: a * x + b * y + c * z });
          }
          const det = eqs[0].a * (eqs[1].b * eqs[2].c - eqs[1].c * eqs[2].b)
                    - eqs[0].b * (eqs[1].a * eqs[2].c - eqs[1].c * eqs[2].a)
                    + eqs[0].c * (eqs[1].a * eqs[2].b - eqs[1].b * eqs[2].a);
          if (det !== 0) break;
          attempts++;
        } while (attempts < 50);

        const prompt3 = eqs.map(e => `${e.a}x + ${e.b}y + ${e.c}z = ${e.d}`).join(', ');
        return {
          id: `simul-${Date.now()}-${Math.random()}`,
          size: 3,
          eqs,
          solution: { x, y, z },
          prompt: `Solve: ${prompt3}`,
          answer: x,
        };
      } else {
        const range2 = simulRange('easy');
        const x = randomInt(-range2.max, range2.max);
        const y = randomInt(-range2.max, range2.max);
        let a1 = randomInt(1, range2.max), b1 = randomInt(1, range2.max);
        let a2 = randomInt(1, range2.max), b2 = randomInt(1, range2.max);
        while (a1 * b2 === a2 * b1) { a2 = randomInt(1, range2.max); b2 = randomInt(1, range2.max); }
        if (Math.random() < 0.3) a1 = -a1;
        if (Math.random() < 0.3) b1 = -b1;
        if (Math.random() < 0.3) a2 = -a2;
        if (Math.random() < 0.3) b2 = -b2;
        const eqs = [
          { a: a1, b: b1, d: a1 * x + b1 * y },
          { a: a2, b: b2, d: a2 * x + b2 * y },
        ];
        const promptD = eqs.map(e => `${e.a}x + ${e.b}y = ${e.d}`).join(', ');
        return {
          id: `simul-${Date.now()}-${Math.random()}`,
          size: 2,
          eqs,
          solution: { x, y },
          prompt: `Solve: ${promptD}`,
          answer: x,
        };
      }
    },
    check(body) {
      const { eqs, size, userX, userY, userZ } = body || {};
      if (!eqs || !Array.isArray(eqs)) return { correct: false, solution: {}, message: 'Incorrect' };
      const ux = Number(userX), uy = Number(userY), uz = Number(userZ || 0);
      let correct;
      if (Number(size) === 2) {
        correct = eqs.every(e => Math.abs(e.a * ux + e.b * uy - e.d) < 0.1);
      } else {
        correct = eqs.every(e => Math.abs(e.a * ux + e.b * uy + e.c * uz - e.d) < 0.1);
      }
      const solution = body.solution || {};
      return { correct, solution, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  funceval: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const range = linearRange(difficulty);
      let formula, vars, answer;
      if (difficulty === 'easy') {
        const a = randomInt(1, range.max), b = randomInt(-range.max, range.max);
        const xVal = randomInt(-range.max, range.max);
        formula = `f(x) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
        vars = { x: xVal };
        answer = parseFloat((a * xVal + b).toFixed(2));
      } else if (difficulty === 'medium') {
        const a = randomInt(1, range.max), b = randomInt(1, range.max), c = randomInt(-range.max, range.max);
        const xVal = randomInt(-10, 10), yVal = randomInt(-10, 10);
        formula = `f(x,y) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}y ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`;
        vars = { x: xVal, y: yVal };
        answer = parseFloat((a * xVal + b * yVal + c).toFixed(2));
      } else if (difficulty === 'hard' || difficulty === 'extrahard') {
        const a = randomInt(1, range.max), b = randomInt(1, range.max), cc = randomInt(1, range.max), d = randomInt(-range.max, range.max);
        const xVal = randomInt(-10, 10), yVal = randomInt(-10, 10), zVal = randomInt(-10, 10);
        formula = `f(x,y,z) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}y ${cc >= 0 ? '+' : '−'} ${Math.abs(cc)}z ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`;
        vars = { x: xVal, y: yVal, z: zVal };
        answer = parseFloat((a * xVal + b * yVal + cc * zVal + d).toFixed(2));
      } else {
        const a = randomInt(1, 5), b = randomInt(-5, 5);
        const xVal = randomInt(-5, 5);
        formula = `f(x) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
        vars = { x: xVal };
        answer = parseFloat((a * xVal + b).toFixed(2));
      }
      const prompt = `Evaluate: ${formula} where ${Object.entries(vars).map(([k, v]) => `${k} = ${v}`).join(', ')}`;
      return { id: `func-${Date.now()}-${Math.random()}`, formula, vars, answer, prompt };
    },
    check(body) {
      const { answer, userAnswer } = body || {};
      const correct = Math.abs(Number(userAnswer) - Number(answer)) < 0.05;
      return { correct, correctAnswer: answer, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  lineq: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const range = linearRange(difficulty);
      let x1, y1, x2, y2, m, c;
      if (difficulty === 'easy') {
        m = randomInt(-range.max, range.max);
        c = randomInt(-range.max, range.max);
        x1 = randomInt(-5, 5);
        x2 = randomInt(-5, 5);
        while (x2 === x1) x2 = randomInt(-5, 5);
        y1 = m * x1 + c;
        y2 = m * x2 + c;
      } else if (difficulty === 'medium' || difficulty === 'hard' || difficulty === 'extrahard') {
        x1 = randomInt(-range.max, range.max);
        y1 = randomInt(-range.max, range.max);
        x2 = randomInt(-range.max, range.max);
        while (x2 === x1) x2 = randomInt(-range.max, range.max);
        y2 = randomInt(-range.max, range.max);
        m = parseFloat(((y2 - y1) / (x2 - x1)).toFixed(2));
        c = parseFloat((y1 - m * x1).toFixed(2));
      } else {
        m = randomInt(-5, 5);
        c = randomInt(-5, 5);
        x1 = randomInt(-5, 5);
        x2 = randomInt(-5, 5);
        while (x2 === x1) x2 = randomInt(-5, 5);
        y1 = m * x1 + c;
        y2 = m * x2 + c;
      }
      return {
        id: `lineq-${Date.now()}-${Math.random()}`,
        x1, y1, x2, y2, m, c,
        prompt: `Find gradient m and y-intercept c for the line through (${x1}, ${y1}) and (${x2}, ${y2})`,
        answer: m,
      };
    },
    check(body) {
      const { x1, y1, x2, y2, userM, userC } = body || {};
      if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
        return { correct: false, m: 0, c: 0, message: 'Incorrect' };
      }
      const actualM = parseFloat(((Number(y2) - Number(y1)) / (Number(x2) - Number(x1))).toFixed(2));
      const actualC = parseFloat((Number(y1) - actualM * Number(x1)).toFixed(2));
      const correct = Math.abs(Number(userM) - actualM) < 0.05 && Math.abs(Number(userC) - actualC) < 0.05;
      return { correct, m: actualM, c: actualC, message: correct ? 'Correct' : 'Incorrect' };
    },
  },

  surds: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        const b = pick(SQUARE_FREE);
        const a = randInt(2, 9);
        const n = a * a * b;
        return { id, difficulty, type: 'simplify', n };
      }
      else if (difficulty === 'medium') {
        const r = pick(SQUARE_FREE);
        const a = randInt(1, 9);
        const b = randInt(1, 9);
        const op = pick(['+', '-']);
        const realA = op === '-' ? Math.max(a, b) + 1 : a;
        const realB = op === '-' ? Math.min(a, b) : b;
        return { id, difficulty, type: 'addsub', a: realA, b: realB, r, op };
      }
      else if (difficulty === 'hard') {
        const r1 = pick(SQUARE_FREE);
        const c1 = randInt(1, 5);
        const r2 = pick(SQUARE_FREE);
        const c2 = randInt(1, 5);
        return { id, difficulty, type: 'multiply', c1, r1, c2, r2 };
      }
      else {
        const subtype = pick(['simple', 'conjugate']);
        if (subtype === 'simple') {
          const r = pick(SQUARE_FREE);
          const b = randInt(1, 4);
          const a = randInt(1, 12);
          return { id, difficulty, type: 'rationalise', subtype: 'simple', a, b, r };
        } else {
          const r = pick(SQUARE_FREE);
          const p = randInt(1, 5);
          const q = pick([1, -1, 2, -2, 1, 1]);  // keep q small
          const a = randInt(1, 10);
          return { id, difficulty, type: 'rationalise', subtype: 'conjugate', a, p, q, r };
        }
      }
    },
    check(body) {
      const { type } = body;

      function parseSurd(s) {
        if (!s || typeof s !== 'string') return null;
        s = s.replace(/\s+/g, '').replace(/−/g, '-');

        if (/^-?\d+$/.test(s)) {
          return { rational: parseInt(s), coeff: 0, radicand: 1 };
        }

        const singleMatch = s.match(/^(-?\d*)[√](\d+)$/);
        if (singleMatch) {
          const c = singleMatch[1] === '' || singleMatch[1] === '+' ? 1 : singleMatch[1] === '-' ? -1 : parseInt(singleMatch[1]);
          return { rational: 0, coeff: c, radicand: parseInt(singleMatch[2]) };
        }

        const mixedMatch = s.match(/^(-?\d+)([+-]\d*)[√](\d+)$/);
        if (mixedMatch) {
          const rat = parseInt(mixedMatch[1]);
          let cStr = mixedMatch[2];
          const c = cStr === '+' ? 1 : cStr === '-' ? -1 : parseInt(cStr);
          return { rational: rat, coeff: c, radicand: parseInt(mixedMatch[3]) };
        }

        return null;
      }

      function normalizeSurd(rational, coeff, radicand) {
        if (coeff === 0 || radicand <= 1) return { rational, coeff, radicand: radicand <= 0 ? 1 : radicand };
        const s = simpleSurd(radicand);
        return { rational, coeff: coeff * s.outer, radicand: s.inner };
      }

      let correctRational = 0, correctCoeff = 0, correctRadicand = 1;

      if (type === 'simplify') {
        const s = simpleSurd(body.n);
        correctCoeff = s.outer;
        correctRadicand = s.inner;
        if (correctRadicand === 1) { correctRational = correctCoeff; correctCoeff = 0; }
      }
      else if (type === 'addsub') {
        const { a, b, r, op } = body;
        correctCoeff = op === '+' ? a + b : a - b;
        correctRadicand = r;
        if (correctCoeff === 0) { correctRational = 0; correctCoeff = 0; correctRadicand = 1; }
      }
      else if (type === 'multiply') {
        const { c1, r1, c2, r2 } = body;
        const prodCoeff = c1 * c2;
        const prodRad = r1 * r2;
        const s = simpleSurd(prodRad);
        correctCoeff = prodCoeff * s.outer;
        correctRadicand = s.inner;
        if (correctRadicand === 1) { correctRational = correctCoeff; correctCoeff = 0; }
      }
      else if (type === 'rationalise') {
        const { subtype, a, r } = body;
        if (subtype === 'simple') {
          const b = body.b;
          const numCoeff = a;
          const den = b * r;
          const g = gcd(Math.abs(numCoeff), Math.abs(den));
          correctCoeff = numCoeff / g;
          correctRadicand = r;
          const finalDen = den / g;
          if (finalDen !== 1) {
            correctRational = 0;
            correctCoeff = numCoeff / g;
            correctRadicand = r;
            body._correctDen = finalDen;
          } else {
            correctRational = 0;
            body._correctDen = 1;
          }
        } else {
          const { p, q } = body;
          const den = p * p - q * q * r;
          const numRational = a * p;
          const numCoeff = -a * q;
          const g = gcd(gcd(Math.abs(numRational), Math.abs(numCoeff)), Math.abs(den));
          const sign = den < 0 ? -1 : 1;
          correctRational = (numRational / g) * sign;
          correctCoeff = (numCoeff / g) * sign;
          correctRadicand = r;
          body._correctDen = Math.abs(den) / g;
          if (correctCoeff === 0) correctRadicand = 1;
        }
      }

      const userParsed = parseSurd(body.answer);

      let display = '';
      const cDen = body._correctDen || 1;

      if (cDen === 1) {
        if (correctCoeff === 0) {
          display = `${correctRational}`;
        } else if (correctRational === 0) {
          if (correctCoeff === 1) display = `√${correctRadicand}`;
          else if (correctCoeff === -1) display = `-√${correctRadicand}`;
          else display = `${correctCoeff}√${correctRadicand}`;
        } else {
          const sign = correctCoeff > 0 ? '+' : '';
          const cPart = Math.abs(correctCoeff) === 1 ? (correctCoeff > 0 ? '' : '-') : `${correctCoeff}`;
          display = `${correctRational}${sign}${cPart}√${correctRadicand}`;
        }
      } else {
        if (correctCoeff === 0) {
          display = `${correctRational}/${cDen}`;
        } else if (correctRational === 0) {
          const cPart = Math.abs(correctCoeff) === 1 ? (correctCoeff > 0 ? '' : '-') : `${correctCoeff}`;
          display = `${cPart}√${correctRadicand}/${cDen}`;
        } else {
          const sign = correctCoeff > 0 ? '+' : '';
          const cPart = Math.abs(correctCoeff) === 1 ? (correctCoeff > 0 ? '' : '-') : `${correctCoeff}`;
          display = `(${correctRational}${sign}${cPart}√${correctRadicand})/${cDen}`;
        }
      }

      let correct = false;
      if (userParsed && cDen === 1) {
        const userNorm = normalizeSurd(userParsed.rational, userParsed.coeff, userParsed.radicand);
        correct = userNorm.rational === correctRational
               && userNorm.coeff === correctCoeff
               && (correctCoeff === 0 || userNorm.radicand === correctRadicand);
      } else if (userParsed && cDen !== 1) {
        const fracMatch = (body.answer || '').replace(/\s+/g, '').match(/^\(?(.+?)\)?\/(\d+)$/);
        if (fracMatch) {
          const numParsed = parseSurd(fracMatch[1]);
          const userDen = parseInt(fracMatch[2]);
          if (numParsed) {
            const numNorm = normalizeSurd(numParsed.rational, numParsed.coeff, numParsed.radicand);
            correct = numNorm.rational * cDen === correctRational * userDen
                   && numNorm.coeff * cDen === correctCoeff * userDen
                   && (correctCoeff === 0 || numNorm.radicand === correctRadicand);
          }
        }
      }

      return {
        correct,
        display,
        message: correct ? 'Correct!' : 'Incorrect'
      };
    },
  },

  indices: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();
      const bases = ['x', 'y', 'a', 'b', 'm', 'n', 'p'];

      if (difficulty === 'easy') {
        const subtype = idxPick(['multiply', 'divide', 'power']);
        const base = idxPick(bases);
        if (subtype === 'multiply') {
          const m = idxRand(2, 8);
          const n = idxRand(2, 8);
          const prompt = `${base}${sup(m)} × ${base}${sup(n)}`;
          const answerExp = m + n;
          return { id, difficulty, type: 'simplify', subtype, base, m, n, prompt, answerExp, answer: `${base}${sup(answerExp)}` };
        } else if (subtype === 'divide') {
          const m = idxRand(5, 12);
          const n = idxRand(1, m - 1);
          const prompt = `${base}${sup(m)} ÷ ${base}${sup(n)}`;
          const answerExp = m - n;
          return { id, difficulty, type: 'simplify', subtype, base, m, n, prompt, answerExp, answer: `${base}${sup(answerExp)}` };
        } else {
          const m = idxRand(2, 5);
          const n = idxRand(2, 5);
          const prompt = `(${base}${sup(m)})${sup(n)}`;
          const answerExp = m * n;
          return { id, difficulty, type: 'simplify', subtype, base, m, n, prompt, answerExp, answer: `${base}${sup(answerExp)}` };
        }
      }
      else if (difficulty === 'medium') {
        const subtype = idxPick(['zero', 'negative_eval', 'negative_simplify']);
        if (subtype === 'zero') {
          const numBase = idxRand(2, 20);
          const prompt = `${numBase}⁰`;
          return { id, difficulty, type: 'evaluate', subtype, prompt, answerNum: 1, answerDen: 1, answer: '1' };
        } else if (subtype === 'negative_eval') {
          const numBase = idxPick([2, 3, 4, 5, 10]);
          const n = idxPick([1, 2, 3]);
          const prompt = `${numBase}${sup(-n)}`;
          const answerNum = 1;
          const answerDen = Math.pow(numBase, n);
          return { id, difficulty, type: 'evaluate', subtype, numBase, n, prompt, answerNum, answerDen, answer: `1/${answerDen}` };
        } else {
          const base = idxPick(bases);
          const a = idxRand(1, 5);
          const b = idxRand(a + 1, a + 6);
          const prompt = `${base}${sup(-a)} × ${base}${sup(b)}`;
          const answerExp = b - a;
          return { id, difficulty, type: 'simplify', subtype, base, m: -a, n: b, prompt, answerExp, answer: `${base}${sup(answerExp)}` };
        }
      }
      else if (difficulty === 'hard') {
        const combos = [
          { base: 4, expNum: 1, expDen: 2 },
          { base: 9, expNum: 1, expDen: 2 },
          { base: 16, expNum: 1, expDen: 2 },
          { base: 25, expNum: 1, expDen: 2 },
          { base: 36, expNum: 1, expDen: 2 },
          { base: 49, expNum: 1, expDen: 2 },
          { base: 64, expNum: 1, expDen: 2 },
          { base: 100, expNum: 1, expDen: 2 },
          { base: 8, expNum: 1, expDen: 3 },
          { base: 27, expNum: 1, expDen: 3 },
          { base: 64, expNum: 1, expDen: 3 },
          { base: 125, expNum: 1, expDen: 3 },
          { base: 16, expNum: 1, expDen: 4 },
          { base: 81, expNum: 1, expDen: 4 },
          { base: 32, expNum: 1, expDen: 5 },
          { base: 4, expNum: 3, expDen: 2 },
          { base: 9, expNum: 3, expDen: 2 },
          { base: 8, expNum: 2, expDen: 3 },
          { base: 27, expNum: 2, expDen: 3 },
          { base: 27, expNum: 4, expDen: 3 },
          { base: 16, expNum: 3, expDen: 4 },
          { base: 16, expNum: 3, expDen: 2 },
          { base: 25, expNum: 3, expDen: 2 },
          { base: 32, expNum: 2, expDen: 5 },
          { base: 32, expNum: 3, expDen: 5 },
          { base: 64, expNum: 2, expDen: 3 },
          { base: 100, expNum: 3, expDen: 2 },
          { base: 81, expNum: 3, expDen: 4 },
        ];
        const c = idxPick(combos);
        const root = Math.round(Math.pow(c.base, 1 / c.expDen));
        const answer = Math.pow(root, c.expNum);
        const prompt = `${c.base}^(${fmtFracExp(c.expNum, c.expDen)})`;
        return { id, difficulty, type: 'evaluate', subtype: 'fractional', numBase: c.base, expNum: c.expNum, expDen: c.expDen, prompt, answerNum: answer, answerDen: 1, answer: String(answer) };
      }
      else {
        const subtype = idxPick(['neg_frac', 'frac_base']);
        if (subtype === 'neg_frac') {
          const combos = [
            { base: 4, expNum: 1, expDen: 2 },
            { base: 9, expNum: 1, expDen: 2 },
            { base: 8, expNum: 1, expDen: 3 },
            { base: 27, expNum: 1, expDen: 3 },
            { base: 27, expNum: 2, expDen: 3 },
            { base: 8, expNum: 2, expDen: 3 },
            { base: 16, expNum: 3, expDen: 4 },
            { base: 25, expNum: 3, expDen: 2 },
            { base: 32, expNum: 2, expDen: 5 },
            { base: 64, expNum: 2, expDen: 3 },
            { base: 100, expNum: 1, expDen: 2 },
            { base: 81, expNum: 3, expDen: 4 },
          ];
          const c = idxPick(combos);
          const root = Math.round(Math.pow(c.base, 1 / c.expDen));
          const val = Math.pow(root, c.expNum);
          const prompt = `${c.base}^(${fmtFracExp(-c.expNum, c.expDen)})`;
          return { id, difficulty, type: 'evaluate', subtype, numBase: c.base, expNum: -c.expNum, expDen: c.expDen, prompt, answerNum: 1, answerDen: val, answer: `1/${val}` };
        } else {
          const fracBases = [
            { a: 1, b: 2, exp: -2, ansNum: 4, ansDen: 1 },
            { a: 1, b: 3, exp: -2, ansNum: 9, ansDen: 1 },
            { a: 2, b: 3, exp: -1, ansNum: 3, ansDen: 2 },
            { a: 2, b: 5, exp: -2, ansNum: 25, ansDen: 4 },
            { a: 3, b: 4, exp: -2, ansNum: 16, ansDen: 9 },
            { a: 1, b: 5, exp: -3, ansNum: 125, ansDen: 1 },
            { a: 8, b: 27, exp: -100, ansNum: -1, ansDen: -1 },
            { a: 4, b: 9, exp: -100, ansNum: -1, ansDen: -1 },
          ];
          fracBases[6] = { a: 8, b: 27, expNum: -2, expDen: 3, ansNum: 9, ansDen: 4 };
          fracBases[7] = { a: 4, b: 9, expNum: -1, expDen: 2, ansNum: 3, ansDen: 2 };

          const c = idxPick(fracBases);
          let prompt, ansNum, ansDen;
          if (c.expNum !== undefined) {
            prompt = `(${c.a}/${c.b})^(${fmtFracExp(c.expNum, c.expDen)})`;
            ansNum = c.ansNum; ansDen = c.ansDen;
          } else {
            prompt = `(${c.a}/${c.b})${sup(c.exp)}`;
            ansNum = c.ansNum; ansDen = c.ansDen;
          }
          return { id, difficulty, type: 'evaluate', subtype, prompt, answerNum: ansNum, answerDen: ansDen, answer: ansDen === 1 ? String(ansNum) : `${ansNum}/${ansDen}` };
        }
      }
    },
    check(body) {
      const { type, answerExp, answerNum, answerDen } = body;
      const userAnswer = (body.answer || '').replace(/\s+/g, '').replace(/−/g, '-');

      let correct = false;
      let display = '';

      if (type === 'simplify') {
        const userExp = parseInt(userAnswer);
        correct = !isNaN(userExp) && userExp === answerExp;
        display = `${body.base}${sup(answerExp)}`;
      }
      else if (type === 'evaluate') {
        let uNum, uDen;
        const fracMatch = userAnswer.match(/^(-?\d+)\/(-?\d+)$/);
        if (fracMatch) {
          uNum = parseInt(fracMatch[1]);
          uDen = parseInt(fracMatch[2]);
        } else {
          const intMatch = userAnswer.match(/^(-?\d+)$/);
          if (intMatch) { uNum = parseInt(intMatch[1]); uDen = 1; }
        }

        if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
          const userSimp = simplifyFraction(uNum, uDen);
          const correctSimp = simplifyFraction(answerNum, answerDen);
          correct = userSimp.num === correctSimp.num && userSimp.den === correctSimp.den;
        }

        if (answerDen === 1) {
          display = `${answerNum}`;
        } else {
          const s = simplifyFraction(answerNum, answerDen);
          display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
        }
      }

      return {
        correct,
        display,
        message: correct ? 'Correct!' : 'Incorrect'
      };
    },
  },

  sequences: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        const a = seqRand(-10, 20);
        let d = seqRand(-8, 8);
        if (d === 0) d = seqPick([1, -1, 2, -2, 3, 5]);
        const n = seqRand(5, 20);
        const terms = [a, a + d, a + 2 * d, a + 3 * d];
        const answer = a + (n - 1) * d;
        const prompt = `${terms.join(', ')}, ... Find the ${n}th term`;
        return { id, difficulty, type: 'arith_nth', a, d, n, terms, answer, prompt };
      }
      else if (difficulty === 'medium') {
        const a = seqRand(1, 15);
        const d = seqRand(1, 8);
        const n = seqRand(5, 20);
        const terms = [a, a + d, a + 2 * d, a + 3 * d];
        const answer = Math.round(n / 2 * (2 * a + (n - 1) * d));
        const prompt = `${terms.join(', ')}, ... Find the sum of first ${n} terms`;
        return { id, difficulty, type: 'arith_sum', a, d, n, terms, answer, prompt };
      }
      else if (difficulty === 'hard') {
        const a = seqPick([1, 2, 3, 4, 5, -1, -2, -3]);
        const r = seqPick([2, 3, -2, -3, 1/2, 1/3, -1/2]);
        const n = seqRand(3, 8);
        const terms = [a, a * r, a * r * r, a * r * r * r];
        const answer = a * Math.pow(r, n - 1);
        const fmtNum = (x) => Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
        const prompt = `${terms.map(fmtNum).join(', ')}, ... Find the ${n}th term`;
        let ansNum, ansDen;
        if (Number.isInteger(answer)) {
          ansNum = answer; ansDen = 1;
        } else {
          const rFrac = r === 1/2 ? { n: 1, d: 2 } : r === 1/3 ? { n: 1, d: 3 } : r === -1/2 ? { n: -1, d: 2 } : { n: r, d: 1 };
          let num = a * Math.pow(rFrac.n, n - 1);
          let den = Math.pow(rFrac.d, n - 1);
          const g = gcd(Math.abs(num), Math.abs(den));
          ansNum = num / g; ansDen = den / g;
          if (ansDen < 0) { ansNum = -ansNum; ansDen = -ansDen; }
        }
        return { id, difficulty, type: 'geom_nth', a, r, n, terms: terms.map(fmtNum), ansNum, ansDen, prompt };
      }
      else {
        const a = seqPick([1, 2, 3, 4, 5]);
        const r = seqPick([2, 3, -2, 1/2]);
        const n = seqRand(3, 7);
        const terms = [a, a * r, a * r * r];
        const fmtNum = (x) => Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');

        let ansNum, ansDen;
        if (Number.isInteger(r)) {
          const sn = a * (Math.pow(r, n) - 1) / (r - 1);
          ansNum = Math.round(sn); ansDen = 1;
        } else {
          const rFrac = r === 1/2 ? { n: 1, d: 2 } : { n: r, d: 1 };
          const rn_num = Math.pow(rFrac.n, n);
          const rn_den = Math.pow(rFrac.d, n);
          let num = a * (rn_den - rn_num) * rFrac.d;
          let den = rn_den * (rFrac.d - rFrac.n);
          const g = gcd(Math.abs(num), Math.abs(den));
          ansNum = num / g; ansDen = den / g;
          if (ansDen < 0) { ansNum = -ansNum; ansDen = -ansDen; }
        }

        const prompt = `${terms.map(fmtNum).join(', ')}, ... Find the sum of first ${n} terms`;
        return { id, difficulty, type: 'geom_sum', a, r, n, terms: terms.map(fmtNum), ansNum, ansDen, prompt };
      }
    },
    check(body) {
      const { type, ansNum, ansDen } = body;
      // frontend sends the user's typed value in body.answer (standard makeQuizApp convention)
      const userStr = String(body.answer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;
      let display = '';

      if (type === 'arith_nth') {
        const expected = Number(body.a) + (Number(body.n) - 1) * Number(body.d);
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && !isNaN(expected) && Math.abs(userNum - expected) < 0.001;
        display = String(expected);
      }
      else if (type === 'arith_sum') {
        const expected = Math.round(Number(body.n) / 2 * (2 * Number(body.a) + (Number(body.n) - 1) * Number(body.d)));
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && !isNaN(expected) && Math.abs(userNum - expected) < 0.001;
        display = String(expected);
      }
      else {
        const { ansNum, ansDen } = body;
        const s = simplifyFraction(ansNum, ansDen);

        let uNum, uDen;
        const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
        if (fracMatch) {
          uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]);
        } else {
          const num = parseFloat(userStr);
          if (!isNaN(num) && Number.isInteger(num)) { uNum = num; uDen = 1; }
          else if (!isNaN(num)) {
            const expected = s.num / s.den;
            correct = Math.abs(num - expected) < 0.01;
            display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
            return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
          }
        }

        if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
          const us = simplifyFraction(uNum, uDen);
          correct = us.num === s.num && us.den === s.den;
        }
        display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
      }

      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  ineq: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        const a = triPick([1, 2, 3, 4, 5, -1, -2, -3]);
        const b = triRand(-10, 10);
        const c = triRand(-10, 10);
        const op = triPick(['>', '<', '>=', '<=']);
        const opDisplay = op.replace('>=', '≥').replace('<=', '≤');
        const prompt = `Solve: ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} ${opDisplay} ${c}`;
        const val = (c - b) / a;
        let resultOp = op;
        if (a < 0) resultOp = op === '>' ? '<' : op === '<' ? '>' : op === '>=' ? '<=' : '>=';
        const resultOpDisplay = resultOp.replace('>=', '≥').replace('<=', '≤');
        const g = gcd(Math.abs(c - b), Math.abs(a));
        const ansNum = (c - b) / g * (a < 0 ? -1 : 1);
        const ansDen = Math.abs(a) / g;
        const valStr = ansDen === 1 ? String(ansNum) : `${ansNum}/${ansDen}`;
        const display = `x ${resultOpDisplay} ${valStr}`;
        return { id, difficulty, type: 'linear', prompt, display, ansNum, ansDen, resultOp };
      }
      else if (difficulty === 'medium') {
        const m = triRand(1, 3);
        const c = triRand(-5, 5);
        const lo = triRand(-8, 2);
        const hi = lo + triRand(4, 10);
        const xLo = (lo - c) / m;
        const xHi = (hi - c) / m;
        const integers = [];
        for (let i = Math.ceil(xLo + 0.001); i < xHi; i++) integers.push(i);
        const prompt = `List the integers satisfying: ${lo} < ${m}x ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)} < ${hi}`;
        return { id, difficulty, type: 'list_integers', prompt, answer: integers, display: integers.join(', ') || 'none' };
      }
      else if (difficulty === 'hard') {
        const r1 = triRand(-5, 5);
        const r2 = triRand(r1 + 1, r1 + 8);
        const B = -(r1 + r2);
        const C = r1 * r2;
        const op = triPick(['<=', '>=']);
        const opDisplay = op === '<=' ? '≤' : '≥';
        const prompt = `Solve: x² ${B >= 0 ? '+ ' + B : '− ' + Math.abs(B)}x ${C >= 0 ? '+ ' + C : '− ' + Math.abs(C)} ${opDisplay} 0`;
        let display;
        if (op === '<=') {
          display = `${r1} ≤ x ≤ ${r2}`;
        } else {
          display = `x ≤ ${r1} or x ≥ ${r2}`;
        }
        return { id, difficulty, type: 'quadratic', prompt, display, r1, r2, op };
      }
      else {
        let a = triRand(-3, 3); if (a === 0) a = 1;
        const b = triRand(-5, 5);
        const lo = triRand(-10, 0);
        const hi = triRand(1, 10);
        const prompt = `How many integers satisfy: ${lo} ≤ ${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} ≤ ${hi}?`;
        const xLo = (lo - b) / a;
        const xHi = (hi - b) / a;
        const realLo = Math.min(xLo, xHi);
        const realHi = Math.max(xLo, xHi);
        let count = 0;
        for (let i = Math.ceil(realLo - 0.001); i <= Math.floor(realHi + 0.001); i++) {
          const val = a * i + b;
          if (val >= lo && val <= hi) count++;
        }
        return { id, difficulty, type: 'count_integers', prompt, answer: count, display: String(count) };
      }
    },
    check(body) {
      const { type, display } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-').replace(/>=/g, '≥').replace(/<=/g, '≤');
      let correct = false;

      if (type === 'linear') {
        const normDisplay = display.replace(/\s+/g, '');
        correct = userStr === normDisplay;
        if (!correct) {
          const altUser = userStr.replace(/≥/g, '>=').replace(/≤/g, '<=');
          const altDisplay = normDisplay.replace(/≥/g, '>=').replace(/≤/g, '<=');
          correct = altUser === altDisplay;
        }
      }
      else if (type === 'list_integers') {
        const expected = body.answer;
        const userNums = userStr === 'none' || userStr === '' ? [] :
          userStr.split(',').map(s => parseInt(s)).filter(n => !isNaN(n)).sort((a, b) => a - b);
        const expSorted = [...expected].sort((a, b) => a - b);
        correct = userNums.length === expSorted.length && userNums.every((v, i) => v === expSorted[i]);
      }
      else if (type === 'quadratic') {
        const normDisplay = display.replace(/\s+/g, '').replace(/>=/g, '≥').replace(/<=/g, '≤');
        const normUser = userStr.replace(/or/gi, 'or');
        correct = normUser === normDisplay;
        if (!correct) {
          const altD = normDisplay.replace(/≥/g, '>=').replace(/≤/g, '<=');
          const altU = normUser.replace(/≥/g, '>=').replace(/≤/g, '<=');
          correct = altU === altD;
        }
      }
      else if (type === 'count_integers') {
        const userNum = parseInt(userStr);
        correct = !isNaN(userNum) && userNum === body.answer;
      }

      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  lineareq: {
    question(difficulty) {
      return linearEqQuestion(difficulty || 'easy');
    },
    check(body) {
      const { answer, display } = body;
      const userStr = (body.userAnswer || '').trim();
      const userNum = parseFloat(userStr);
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.1;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

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
  res.json(gen.question(req.query.difficulty, req.query));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;

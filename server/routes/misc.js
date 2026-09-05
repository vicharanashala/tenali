'use strict';
const router = require('express').Router();
const banks = require('../lib/question-banks');

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;
function triPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

function toMixed(num, den) {
  const s = simplifyFraction(num, den);
  const whole = Math.trunc(s.num / s.den);
  let remainder = Math.abs(s.num % s.den);
  return { whole, num: remainder, den: s.den };
}

function buildQuadraticPrompt(a, b, c, x, opAB = '+', opBC = '+') {
  const first = `${a}${'x²'}`;
  const second = `${Math.abs(b)}${'x'}`;
  const third = `${Math.abs(c)}`;
  const opStr = (op) => (op === '-' ? '-' : '+');
  const expression = `${first} ${opStr(opAB)} ${second} ${opStr(opBC)} ${third}`;
  return `If x = ${x}, find y for y = ${expression}`;
}

// ── MCQ helpers (copied verbatim from index.js) ──
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deBiasShuffle(arr, correctIndex) {
  let shuffled = shuffleArray(arr);
  if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex >= shuffled.length || shuffled.length < 2) {
    return shuffled;
  }
  const idxOfMax = (s) => s.indexOf(s.reduce((a, b) => (b.length > a.length ? b : a), ''));
  const idxOfMin = (s) => s.indexOf(s.reduce((a, b) => (b.length < a.length ? b : a), ''));
  if (idxOfMax(shuffled) === correctIndex) {
    const others = shuffled.map((_, i) => i).filter(i => i !== correctIndex);
    if (others.length > 0) {
      const swapWith = others[Math.floor(Math.random() * others.length)];
      [shuffled[correctIndex], shuffled[swapWith]] = [shuffled[swapWith], shuffled[correctIndex]];
    }
  }
  if (idxOfMin(shuffled) === correctIndex) {
    const others = shuffled.map((_, i) => i).filter(i => i !== correctIndex);
    if (others.length > 0) {
      const swapWith = others[Math.floor(Math.random() * others.length)];
      [shuffled[correctIndex], shuffled[swapWith]] = [shuffled[swapWith], shuffled[correctIndex]];
    }
  }
  return shuffled;
}

function buildOptions(correctText, distractors) {
  const seen = new Set([String(correctText)]);
  const cleaned = [];
  for (const d of distractors) {
    const s = String(d);
    if (!seen.has(s)) { seen.add(s); cleaned.push(s); }
    if (cleaned.length >= 3) break;
  }
  let pad = 1;
  while (cleaned.length < 3) {
    const filler = `${correctText}_${pad++}`;
    if (!seen.has(filler)) { seen.add(filler); cleaned.push(filler); }
  }
  const all = shuffleArray([{ text: String(correctText), correct: true }, ...cleaned.slice(0, 3).map(t => ({ text: t, correct: false }))]);
  const labels = ['A', 'B', 'C', 'D'];
  const options = all.map((o, i) => ({ option: labels[i], text: o.text }));
  const correctOption = labels[all.findIndex(o => o.correct)];
  return { options, correctOption, correctDisplay: String(correctText) };
}

// mcCheck logic as a pure function returning a result object.
function mcCheckResult(body) {
  const b = body || {};
  const correct = !!b.selectedOption && b.selectedOption === b.correctOption;
  return {
    correct,
    correctOption: b.correctOption,
    correctDisplay: b.correctDisplay,
    message: correct ? 'Correct!' : 'Incorrect',
  };
}

// ── gymdecimals helpers ──
function formatScaledDigit(mantissa, exp) {
  const sign = mantissa < 0 ? '-' : '';
  const m = Math.abs(mantissa);
  const ms = String(m);
  let result;
  if (exp >= 0) {
    result = ms + '0'.repeat(exp);
  } else {
    const decShift = -exp;
    if (decShift < ms.length) {
      const intPart = ms.slice(0, ms.length - decShift);
      const fracPart = ms.slice(ms.length - decShift);
      result = intPart + '.' + fracPart;
    } else {
      const zeros = decShift - ms.length;
      result = '0.' + '0'.repeat(zeros) + ms;
    }
  }
  if (result.includes('.')) {
    result = result.replace(/0+$/, '').replace(/\.$/, '');
  }
  if (result === '0') return '0';
  return sign + result;
}

function gymDecimalsQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const range = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4;
  const d1 = randomInt(1, 9);
  const d2 = randomInt(1, 9);
  const s1 = Math.random() < 0.5 ? -1 : 1;
  const s2 = Math.random() < 0.5 ? -1 : 1;
  const e1 = randomInt(-range, range);
  const e2 = randomInt(-range, range);

  const aStr = formatScaledDigit(s1 * d1, e1);
  const bStr = formatScaledDigit(s2 * d2, e2);

  const prodMantissa = d1 * d2;
  const prodSign = s1 * s2;
  const prodExp = e1 + e2;
  const correctText = formatScaledDigit(prodSign * prodMantissa, prodExp);

  const answer = prodSign * prodMantissa * Math.pow(10, prodExp);

  const distractors = [
    formatScaledDigit(prodSign * prodMantissa, prodExp + 1),
    formatScaledDigit(prodSign * prodMantissa, prodExp - 1),
    formatScaledDigit(-prodSign * prodMantissa, prodExp),
    formatScaledDigit(-prodSign * prodMantissa, prodExp + 1),
  ];
  const opts = buildOptions(correctText, distractors);

  const fmtOperand = (s) => s.startsWith('-') ? `(${s})` : s;
  const prompt = `${fmtOperand(aStr)} × ${fmtOperand(bStr)} = ?`;
  return {
    id, difficulty, prompt, answer,
    a: aStr, b: bStr,
    d1, d2, s1, s2, e1, e2, prodMantissa, prodSign, prodExp,
    ...opts,
  };
}

// ── funcgym helpers ──
function fmtPoly(coeffs) {
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const parts = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;
    let term;
    const abs = Math.abs(c);
    if (i === 0) term = String(abs);
    else if (i === 1) term = (abs === 1 ? 'x' : `${abs}x`);
    else term = (abs === 1 ? `x${sup(i)}` : `${abs}x${sup(i)}`);
    if (parts.length === 0) {
      parts.push((c < 0 ? '−' : '') + term);
    } else {
      parts.push(c < 0 ? `− ${term}` : `+ ${term}`);
    }
  }
  return parts.length ? parts.join(' ') : '0';
}

function evalPoly(coeffs, x) {
  let total = 0;
  for (let i = 0; i < coeffs.length; i++) total += coeffs[i] * Math.pow(x, i);
  return total;
}

function funcgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const randDigit = () => randomInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);

  let coeffs, kind, x, prompt, answer, display;

  if (difficulty === 'easy') {
    x = randomInt(-9, 9);
    coeffs = [randomInt(-9, 9), randDigit()];
    kind = 'poly1';
    answer = evalPoly(coeffs, x);
    prompt = `Let f(x) = ${fmtPoly(coeffs)}. Find f(${x}).`;
  } else if (difficulty === 'medium') {
    x = randomInt(-3, 3);
    coeffs = [randomInt(-9, 9), randomInt(-9, 9), randDigit()];
    kind = 'poly2';
    answer = evalPoly(coeffs, x);
    prompt = `Let f(x) = ${fmtPoly(coeffs)}. Find f(${x}).`;
  } else if (difficulty === 'hard') {
    x = randomInt(-2, 2);
    coeffs = [randomInt(-9, 9), randomInt(-9, 9), randomInt(-9, 9), randDigit()];
    kind = 'poly3';
    answer = evalPoly(coeffs, x);
    prompt = `Let f(x) = ${fmtPoly(coeffs)}. Find f(${x}).`;
  } else {
    x = randomInt(-9, 9);
    const k = randomInt(2, 9);
    const num = randomInt(-9, 9);
    const target = randomInt(-9, 9);
    const b = target * k - num * x;
    coeffs = [b, num];
    kind = 'rational1';
    answer = target;
    prompt = `Let f(x) = (${fmtPoly(coeffs)}) ÷ ${k}. Find f(${x}).`;
  }

  display = String(answer);
  const distractors = [
    String(answer + 1),
    String(answer - 1),
    String(-answer),
    String(answer + 2),
    String(answer * -1 + 1),
  ];
  const opts = buildOptions(display, distractors);
  return { id, difficulty, prompt, x, coeffs, kind, answer, display, ...opts };
}

// ── fracaddgym helpers ──
function fmtFracText(num, den) {
  if (den === 1) return String(num);
  if (num === 0) return '0';
  return `${num}/${den}`;
}

function fracaddgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const nMax = 9;
  const a = randomInt(1, nMax);
  let b = randomInt(2, nMax);
  let c = randomInt(1, nMax);
  let d = randomInt(2, nMax);
  if (difficulty === 'easy') d = b;

  const sa = (difficulty === 'easy' || difficulty === 'medium') ? 1 : (Math.random() < 0.4 ? -1 : 1);
  const sc = (difficulty === 'easy' || difficulty === 'medium') ? 1 : (Math.random() < 0.4 ? -1 : 1);

  const aa = sa * a, cc = sc * c;
  const num = aa * d + cc * b;
  const den = b * d;
  const g = gcd(Math.abs(num), den);
  const sn = num / g, sd = den / g;
  const display = fmtFracText(sn, sd);

  const fmtA = `${aa < 0 ? '−' : ''}${a}/${b}`;
  const fmtC = `${cc < 0 ? '−' : ''}${c}/${d}`;
  const prompt = `${fmtA} + ${fmtC} = ?`;

  const dn1 = aa + cc, dd1 = b + d;
  const g1 = Math.max(1, gcd(Math.abs(dn1) || 1, dd1));
  const dist1 = fmtFracText(dn1 / g1, dd1 / g1);
  const dn2 = aa + cc, dd2 = d;
  const g2 = Math.max(1, gcd(Math.abs(dn2) || 1, dd2));
  const dist2 = fmtFracText(dn2 / g2, dd2 / g2);
  const dist3 = fmtFracText(-sn, sd);
  const g4 = Math.max(1, gcd(Math.abs(sn + 1) || 1, sd));
  const dist4 = fmtFracText((sn + 1) / g4, sd / g4);
  const distractors = [dist1, dist2, dist3, dist4];
  const opts = buildOptions(display, distractors);

  return { id, difficulty, prompt, a, b, c, d, sa, sc, sn, sd, display, ...opts };
}

// ── lineqgym helpers ──
function lineqgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const aMag = (difficulty === 'easy') ? randomInt(1, 5) : randomInt(1, 9);
  const aSign = Math.random() < 0.5 ? -1 : 1;
  const a = aSign * aMag;
  const xMag = (difficulty === 'easy') ? randomInt(1, 5) : randomInt(1, 9);
  const x = xMag * (Math.random() < 0.5 ? -1 : 1);

  let prompt, kind;
  if (difficulty === 'easy' || difficulty === 'medium') {
    const b = -a * x;
    const lhs = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    prompt = `Solve for x:  ${lhs} = 0`;
    kind = 'simple';
  } else if (difficulty === 'hard') {
    const c = randomInt(-9, 9);
    const b = -a * x + c;
    const lhs = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    prompt = `Solve for x:  ${lhs} = ${c}`;
    kind = 'rearrange';
  } else {
    const kMag = randomInt(1, 9);
    const kSign = Math.random() < 0.5 ? -1 : 1;
    const k = kMag * kSign;
    let c = a - k;
    if (c < -9 || c > 9 || c === 0) {
      c = a + k;
    }
    if (c < -9 || c > 9 || c === 0) {
      const b0 = -a * x;
      const lhs0 = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b0 >= 0 ? '+' : '−'} ${Math.abs(b0)}`;
      prompt = `Solve for x:  ${lhs0} = 0`;
      kind = 'simple';
      const display0 = String(x);
      const distractors0 = [String(-x), String(x + 1), String(x - 1), String(2 * x)];
      const opts0 = buildOptions(display0, distractors0);
      return { id, difficulty, prompt, a, x, kind, display: display0, ...opts0 };
    }
    const b = randomInt(-9, 9);
    const d = (a - c) * x + b;
    const lhs = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    const rhs = `${c === 1 ? '' : c === -1 ? '−' : c}x ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`;
    prompt = `Solve for x:  ${lhs} = ${rhs}`;
    kind = 'twosided';
  }

  const display = String(x);
  const distractors = [String(-x), String(x + 1), String(x - 1), String(2 * x), String(Math.round(x / 2))];
  const opts = buildOptions(display, distractors);

  return { id, difficulty, prompt, a, x, kind, display, ...opts };
}

// ── indicesgym helpers ──
function fmtPower(base, exp) {
  if (exp === 0) return '1';
  if (exp === 1) return String(base);
  const sup = (n) => {
    const s = String(n);
    return s.split('').map(ch => ch === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[ch] || ch).join('');
  };
  return `${base}${sup(exp)}`;
}

function fmtTermList(parts) {
  const filtered = parts.filter(p => p !== '1');
  if (filtered.length === 0) return '1';
  return filtered.join(' · ');
}

function indicesgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const vars = ['a', 'b', 'x', 'y', 'm', 'n'];
  const pickVar = (excl = []) => {
    const choices = vars.filter(v => !excl.includes(v));
    return choices[randomInt(0, choices.length - 1)];
  };
  const eRange = (difficulty === 'easy') ? 4 : 5;
  const rE = () => {
    let v = randomInt(1, eRange);
    if (Math.random() < 0.5) v = -v;
    return v;
  };

  const laws = (difficulty === 'easy') ? ['product', 'quotient']
              : (difficulty === 'medium') ? ['product', 'quotient', 'power']
              : (difficulty === 'hard') ? ['product', 'quotient', 'power', 'mixed', 'chain']
              : ['power', 'mixed', 'chain', 'powerchain'];
  const law = laws[randomInt(0, laws.length - 1)];

  let prompt, correctText, distractors;

  if (law === 'product') {
    const a = pickVar();
    const k = rE(), l = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} · ${fmtPower(a, l)}`;
    correctText = fmtPower(a, k + l);
    distractors = [fmtPower(a, k - l), fmtPower(a, k * l), fmtPower(a, l - k), fmtPower(a, k + l + 1)];
  } else if (law === 'quotient') {
    const a = pickVar();
    const k = rE(), l = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} ÷ ${fmtPower(a, l)}`;
    correctText = fmtPower(a, k - l);
    distractors = [fmtPower(a, k + l), fmtPower(a, l - k), fmtPower(a, k * l), fmtPower(a, k - l - 1)];
  } else if (law === 'power') {
    const a = pickVar();
    const k = randomInt(2, 5) * (Math.random() < 0.4 ? -1 : 1);
    const l = randomInt(2, 5) * (Math.random() < 0.4 ? -1 : 1);
    prompt = `Simplify:  (${fmtPower(a, k)})^${l < 0 ? `(${l})` : l}`;
    correctText = fmtPower(a, k * l);
    distractors = [fmtPower(a, k + l), fmtPower(a, k - l), fmtPower(a, k * l + 1), fmtPower(a, l - k)];
  } else if (law === 'mixed') {
    const a = pickVar();
    const b = pickVar([a]);
    const k = rE(), l = rE(), m = rE(), n = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} · ${fmtPower(b, l)} · ${fmtPower(a, m)} · ${fmtPower(b, n)}`;
    correctText = fmtTermList([fmtPower(a, k + m), fmtPower(b, l + n)]);
    distractors = [
      fmtTermList([fmtPower(a, k * m), fmtPower(b, l * n)]),
      fmtTermList([fmtPower(a, k + m), fmtPower(b, l - n)]),
      fmtTermList([fmtPower(a, k - m), fmtPower(b, l + n)]),
      fmtTermList([fmtPower(a, k + l), fmtPower(b, m + n)]),
    ];
  } else if (law === 'chain') {
    const a = pickVar();
    const k = rE(), l = rE(), m = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} · ${fmtPower(a, l)} ÷ ${fmtPower(a, m)}`;
    correctText = fmtPower(a, k + l - m);
    distractors = [
      fmtPower(a, k + l + m),
      fmtPower(a, k - l - m),
      fmtPower(a, k - l + m),
      fmtPower(a, k + l - m + 1),
    ];
  } else {
    const a = pickVar();
    const k = randomInt(2, 4) * (Math.random() < 0.4 ? -1 : 1);
    const l = randomInt(2, 4) * (Math.random() < 0.4 ? -1 : 1);
    const m = rE();
    prompt = `Simplify:  (${fmtPower(a, k)})^${l < 0 ? `(${l})` : l} · ${fmtPower(a, m)}`;
    correctText = fmtPower(a, k * l + m);
    distractors = [
      fmtPower(a, k + l + m),
      fmtPower(a, k * l - m),
      fmtPower(a, k * l * m),
      fmtPower(a, (k + l) * m),
    ];
  }

  const opts = buildOptions(correctText, distractors);
  return { id, difficulty, prompt, law, display: correctText, ...opts };
}

// ── polygym helpers ──
function fmtMono(coeff, variable, power) {
  if (coeff === 0) return '0';
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const sign = coeff < 0 ? '−' : '';
  const abs = Math.abs(coeff);
  if (!variable || power === 0) return `${sign}${abs}`;
  const coefPart = abs === 1 ? '' : String(abs);
  const varPart = power === 1 ? variable : `${variable}${sup(power)}`;
  return `${sign}${coefPart}${varPart}`;
}

function fmtBinomial(c1, v1, c2, v2) {
  if (c1 === 0 && c2 === 0) return '0';
  if (c1 === 0) return fmtMono(c2, v2, 1);
  if (c2 === 0) return fmtMono(c1, v1, 1);
  const head = fmtMono(c1, v1, 1);
  const tail = c2 < 0 ? `− ${fmtMono(-c2, v2, 1)}` : `+ ${fmtMono(c2, v2, 1)}`;
  return `${head} ${tail}`;
}

function signedParen(n) { return n < 0 ? `(${n})` : String(n); }

function polygymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const vars = ['x', 'y', 'a', 'b', 'm', 'n'];
  const pickVar = () => vars[randomInt(0, vars.length - 1)];
  const sd = () => randomInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);

  const kinds = (difficulty === 'easy')
    ? ['intMul', 'twoDigAdd', 'intMul', 'twoDigAdd']
    : (difficulty === 'medium')
    ? ['intTimesMono', 'monoAdd', 'intTimesMono', 'monoAdd', 'intMul']
    : (difficulty === 'hard')
    ? ['monoTimesMono', 'monoTimesMonoXY', 'monoBigAdd', 'monoTimesMono']
    : ['monoSquare', 'monoTimesMonoXY', 'collectLikeTerms', 'monoSquare'];
  const kind = kinds[randomInt(0, kinds.length - 1)];

  let prompt, correctText, distractors;

  if (kind === 'intMul') {
    const a = sd(), b = sd();
    const ans = a * b;
    prompt = `${signedParen(a)} × ${signedParen(b)} = ?`;
    correctText = String(ans);
    distractors = [String(-ans), String(ans + a), String(ans - b), String(a + b)];
  } else if (kind === 'twoDigAdd') {
    const a = randomInt(10, 99) * (Math.random() < 0.4 ? -1 : 1);
    const b = randomInt(10, 99) * (Math.random() < 0.5 ? -1 : 1);
    const ans = a + b;
    const opPart = b < 0 ? `− ${Math.abs(b)}` : `+ ${b}`;
    prompt = `${signedParen(a)} ${opPart} = ?`;
    correctText = String(ans);
    distractors = [String(-ans), String(ans + 1), String(ans - 1), String(a - b)];
  } else if (kind === 'intTimesMono') {
    const k = sd(), c = sd();
    const v = pickVar();
    const ans = k * c;
    prompt = `${signedParen(k)} × ${fmtMono(c, v, 1)} = ?`;
    correctText = fmtMono(ans, v, 1);
    distractors = [
      fmtMono(-ans, v, 1),
      fmtMono(ans, v, 2),
      String(ans),
      fmtMono(k + c, v, 1),
    ];
  } else if (kind === 'monoAdd') {
    const v = pickVar();
    const a = sd(), b = sd();
    const ans = a + b;
    const opPart = b < 0 ? `− ${Math.abs(b)}${v}` : `+ ${b}${v}`;
    prompt = `${fmtMono(a, v, 1)} ${opPart} = ?`;
    correctText = fmtMono(ans, v, 1);
    distractors = [
      fmtMono(a * b, v, 1),
      fmtMono(ans, v, 2),
      fmtMono(-ans, v, 1),
      String(ans),
    ];
  } else if (kind === 'monoTimesMono') {
    const v = pickVar();
    const a = sd(), b = sd();
    const ans = a * b;
    prompt = `${fmtMono(a, v, 1)} × ${fmtMono(b, v, 1)} = ?`;
    correctText = fmtMono(ans, v, 2);
    distractors = [
      fmtMono(ans, v, 1),
      fmtMono(-ans, v, 2),
      fmtMono(a + b, v, 2),
      fmtMono(ans, v, 3),
    ];
  } else if (kind === 'monoTimesMonoXY') {
    const v1 = pickVar();
    let v2 = pickVar(); while (v2 === v1) v2 = pickVar();
    const a = sd(), b = sd();
    const ans = a * b;
    const sortedVars = [v1, v2].sort().join('');
    const sign = ans < 0 ? '−' : '';
    const abs = Math.abs(ans);
    const coefStr = abs === 1 ? '' : String(abs);
    prompt = `${fmtMono(a, v1, 1)} × ${fmtMono(b, v2, 1)} = ?`;
    correctText = `${sign}${coefStr}${sortedVars}`;
    distractors = [
      `${ans < 0 ? '' : '−'}${coefStr}${sortedVars}`,
      `${sign}${coefStr}${v1}`,
      `${sign}${coefStr}${v2}`,
      fmtMono(ans, v1, 2),
    ];
  } else if (kind === 'monoBigAdd') {
    const v = pickVar();
    const a = randomInt(10, 50) * (Math.random() < 0.4 ? -1 : 1);
    const b = randomInt(10, 50) * (Math.random() < 0.5 ? -1 : 1);
    const ans = a + b;
    const opPart = b < 0 ? `− ${Math.abs(b)}${v}` : `+ ${b}${v}`;
    prompt = `${fmtMono(a, v, 1)} ${opPart} = ?`;
    correctText = fmtMono(ans, v, 1);
    distractors = [
      fmtMono(-ans, v, 1),
      fmtMono(a - b, v, 1),
      fmtMono(ans + 1, v, 1),
      fmtMono(ans, v, 2),
    ];
  } else if (kind === 'monoSquare') {
    const v = pickVar();
    const a = sd(), b = sd();
    const p1 = randomInt(1, 2), p2 = randomInt(1, 2);
    const ans = a * b;
    prompt = `${fmtMono(a, v, p1)} × ${fmtMono(b, v, p2)} = ?`;
    correctText = fmtMono(ans, v, p1 + p2);
    distractors = [
      fmtMono(ans, v, Math.max(1, p1 * p2)),
      fmtMono(-ans, v, p1 + p2),
      fmtMono(a + b, v, p1 + p2),
      fmtMono(ans, v, Math.max(p1, p2)),
    ];
  } else {
    const v1 = 'x', v2 = 'y';
    const a = sd(), b = sd(), c = sd();
    const xCoef = a - c;
    const yCoef = b;
    const part2 = b < 0 ? `− ${Math.abs(b)}${v2}` : `+ ${b}${v2}`;
    const part3 = c < 0 ? `+ ${Math.abs(c)}${v1}` : `− ${c}${v1}`;
    prompt = `${fmtMono(a, v1, 1)} ${part2} ${part3} = ?`;
    correctText = fmtBinomial(xCoef, v1, yCoef, v2);
    distractors = [
      fmtBinomial(a + c, v1, yCoef, v2),
      fmtBinomial(xCoef, v1, -yCoef, v2),
      fmtBinomial(-xCoef, v1, yCoef, v2),
      fmtBinomial(yCoef, v1, xCoef, v2),
    ];
  }

  const opts = buildOptions(correctText, distractors);
  return { id, difficulty, prompt, kind, display: correctText, ...opts };
}

// ── tatsavit helper ──
function tatsavitQuestion(difficulty, level) {
  const id = Date.now();
  let type;
  if (level !== undefined && level !== null) {
    type = Math.max(0, Math.min(8, Number(level)));
  } else {
    const pools = {
      easy:      [0, 0, 0, 1, 2, 6, 7],
      medium:    [0, 1, 1, 2, 3, 4, 6, 7],
      hard:      [1, 2, 3, 4, 5, 6, 7, 8],
      extrahard: [2, 3, 4, 5, 5, 8, 8, 8],
    };
    const pool = pools[difficulty] || pools.easy;
    type = pool[Math.floor(Math.random() * pool.length)];
  }

  const isHarder = (difficulty === 'hard' || difficulty === 'extrahard');
  const isMed = (difficulty === 'medium');

  switch (type) {
    case 0: {
      const a = randomInt(2, 9), b = randomInt(2, 9);
      const answer = a * b;
      return { id, type: 0, typeName: 'Tables (1-digit)', prompt: `${a} × ${b}`, answer, display: String(answer) };
    }
    case 1: {
      const a = randomInt(2, 20), b = randomInt(2, isHarder ? 20 : 12);
      const answer = a * b;
      return { id, type: 1, typeName: 'Tables (up to 20)', prompt: `${a} × ${b}`, answer, display: String(answer) };
    }
    case 2: {
      const n = isHarder ? randomInt(11, 30) : isMed ? randomInt(11, 20) : randomInt(2, 15);
      const answer = n * n;
      return { id, type: 2, typeName: 'Squares', prompt: `${n}² = ?`, answer, display: String(answer) };
    }
    case 3: {
      const maxVal = isHarder ? 500 : isMed ? 200 : 100;
      let q = randomInt(2, maxVal);
      const sr = Math.sqrt(q);
      if (sr === Math.floor(sr)) q += 1;
      const floorAns = Math.floor(Math.sqrt(q));
      const ceilAns = Math.ceil(Math.sqrt(q));
      return { id, type: 3, typeName: 'Square Root', prompt: `√${q} = ?`, answer: floorAns, ceilAnswer: ceilAns, display: `${floorAns} or ${ceilAns}` };
    }
    case 4: {
      if (!isHarder && !isMed) {
        const c = randomInt(2, 9), coeff = randomInt(2, 9);
        const answer = c * coeff;
        return { id, type: 4, typeName: 'Monomial ×', prompt: `${c} × ${coeff}x = ?`, answerStr: `${answer}x`, answer, answerExp: 1, display: `${answer}x`, inputHint: 'e.g. 15x^2' };
      } else if (isMed) {
        const a = randomInt(2, 9), b = randomInt(2, 9);
        const answer = a * b;
        return { id, type: 4, typeName: 'Monomial ×', prompt: `${a}x × ${b}x = ?`, answerStr: `${answer}x²`, answer, answerExp: 2, display: `${answer}x²`, inputHint: 'e.g. 15x^2' };
      } else {
        const a = randomInt(2, 7), b = randomInt(2, 7);
        const p1 = randomInt(1, 3), p2 = randomInt(1, 3);
        const coeff = a * b, exp = p1 + p2;
        const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
        const t1 = p1 === 1 ? `${a}x` : `${a}x${sup(p1)}`;
        const t2 = p2 === 1 ? `${b}x` : `${b}x${sup(p2)}`;
        return { id, type: 4, typeName: 'Monomial ×', prompt: `${t1} × ${t2} = ?`, answerStr: `${coeff}x${sup(exp)}`, answer: coeff, answerExp: exp, display: `${coeff}x${sup(exp)}`, inputHint: 'e.g. 15x^2' };
      }
    }
    case 5: {
      if (!isHarder && !isMed) {
        const pct = triPick([10, 20, 25, 50, 75]);
        const whole = randomInt(2, 20) * (pct === 25 ? 4 : pct === 75 ? 4 : pct === 50 ? 2 : 10);
        const answer = (pct / 100) * whole;
        return { id, type: 5, typeName: 'Percentage', prompt: `${pct}% of ${whole} = ?`, answer, display: String(answer) };
      } else if (isMed) {
        const pct = randomInt(1, 9) * 10;
        const whole = randomInt(10, 200);
        const answer = Math.round((pct / 100) * whole * 100) / 100;
        return { id, type: 5, typeName: 'Percentage', prompt: `${pct}% of ${whole} = ?`, answer, display: String(answer) };
      } else {
        const variant = Math.random();
        if (variant < 0.5) {
          const pct = randomInt(5, 95);
          const whole = randomInt(50, 500);
          const answer = Math.round((pct / 100) * whole * 100) / 100;
          return { id, type: 5, typeName: 'Percentage', prompt: `${pct}% of ${whole} = ?`, answer, display: String(answer) };
        } else {
          const pct = triPick([10, 20, 25, 50]);
          const original = randomInt(20, 200);
          const part = (pct / 100) * original;
          return { id, type: 5, typeName: 'Percentage', prompt: `${part} is ${pct}% of what number?`, answer: original, display: String(original) };
        }
      }
    }
    case 6: {
      const digits = isHarder ? 3 : isMed ? 2 : 1;
      const lo = digits === 1 ? 1 : Math.pow(10, digits - 1);
      const hi = Math.pow(10, digits) - 1;
      const a = randomInt(lo, hi), b = randomInt(lo, hi);
      const answer = a + b;
      return { id, type: 6, typeName: 'Addition', prompt: `${a} + ${b} = ?`, answer, display: String(answer) };
    }
    case 7: {
      const digits = isHarder ? 3 : isMed ? 2 : 1;
      const lo = digits === 1 ? 1 : Math.pow(10, digits - 1);
      const hi = Math.pow(10, digits) - 1;
      let a = randomInt(lo, hi), b = randomInt(lo, hi);
      if (a < b) [a, b] = [b, a];
      const answer = a - b;
      return { id, type: 7, typeName: 'Subtraction', prompt: `${a} − ${b} = ?`, answer, display: String(answer) };
    }
    case 8: {
      const patterns = isHarder
        ? ['sub_neg', 'neg_add_neg', 'neg_sub_neg', 'neg_sub_pos', 'neg_add_pos']
        : isMed ? ['sub_neg', 'neg_add_neg', 'neg_sub_neg']
        : ['sub_neg'];
      const pat = triPick(patterns);
      const a = randomInt(2, isHarder ? 30 : 12);
      const b = randomInt(2, isHarder ? 30 : 12);
      let prompt, answer;
      switch (pat) {
        case 'sub_neg':      prompt = `${a} − (−${b})`;   answer = a + b;  break;
        case 'neg_add_neg':  prompt = `−${a} + (−${b})`;  answer = -(a + b); break;
        case 'neg_sub_neg':  prompt = `−${a} − (−${b})`;  answer = -a + b; break;
        case 'neg_sub_pos':  prompt = `−${a} − ${b}`;     answer = -(a + b); break;
        case 'neg_add_pos':  prompt = `−${a} + ${b}`;     answer = b - a;  break;
        default:             prompt = `${a} − (−${b})`;   answer = a + b;
      }
      return { id, type: 8, typeName: 'Negative Arithmetic', prompt: `${prompt} = ?`, answer, display: String(answer) };
    }
    default:
      return tatsavitQuestion(difficulty, 0);
  }
}

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

function setPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function setRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function randomSubset(universe, k) {
  const copy = [...universe]; const result = [];
  for (let i = 0; i < Math.min(k, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
}
function setUnion(a, b) { return [...new Set([...a, ...b])].sort((x, y) => x - y); }
function setIntersect(a, b) { const s = new Set(b); return a.filter(x => s.has(x)).sort((x, y) => x - y); }
function setDiff(a, b) { const s = new Set(b); return a.filter(x => !s.has(x)).sort((x, y) => x - y); }

const generators = {

  fractionadd: {
    question(difficulty, query = {}) {
      difficulty = difficulty || 'easy';
      const id = Date.now();
      const opQuery = query.op;
      const opPool = ['+', '−', '×', '÷'];
      const op = opPool.includes(opQuery) ? opQuery : opPool[Math.floor(Math.random() * opPool.length)];

      if (difficulty === 'easy') {
        const den = Math.floor(Math.random() * 9) + 2;
        const n1 = Math.floor(Math.random() * (den - 1)) + 1;
        const n2 = Math.floor(Math.random() * (den - 1)) + 1;
        return { id, n1, d1: den, n2, d2: den, op, difficulty, mixed: false, prompt: `${n1}/${den} ${op} ${n2}/${den}`, answer: `${n1}/${den} ${op} ${n2}/${den}` };
      } else if (difficulty === 'medium') {
        const d1 = Math.floor(Math.random() * 11) + 2;
        let d2 = Math.floor(Math.random() * 11) + 2;
        while (d2 === d1) d2 = Math.floor(Math.random() * 11) + 2;
        const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
        const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
        return { id, n1, d1, n2, d2, op, difficulty, mixed: false, prompt: `${n1}/${d1} ${op} ${n2}/${d2}`, answer: `${n1}/${d1} ${op} ${n2}/${d2}` };
      } else {
        const d1 = Math.floor(Math.random() * 14) + 2;
        let d2 = Math.floor(Math.random() * 14) + 2;
        while (d2 === d1) d2 = Math.floor(Math.random() * 14) + 2;
        const w1 = Math.floor(Math.random() * 5) + 1;
        const w2 = Math.floor(Math.random() * 5) + 1;
        const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
        const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
        return { id, w1, n1, d1: d1, w2, n2, d2: d2, op, difficulty: 'hard', mixed: true, prompt: `${w1} ${n1}/${d1} ${op} ${w2} ${n2}/${d2}`, answer: `${w1} ${n1}/${d1} ${op} ${w2} ${n2}/${d2}` };
      }
    },
    check(body) {
      body = body || {};
      const op = body.op || '+';
      let totalNum, totalDen;

      let top1, bot1, top2, bot2;
      if (body.mixed) {
        top1 = body.w1 * body.d1 + body.n1; bot1 = body.d1;
        top2 = body.w2 * body.d2 + body.n2; bot2 = body.d2;
      } else {
        top1 = body.n1; bot1 = body.d1;
        top2 = body.n2; bot2 = body.d2;
      }

      if (op === '+') {
        totalNum = top1 * bot2 + top2 * bot1;
        totalDen = bot1 * bot2;
      } else if (op === '−' || op === '-') {
        totalNum = top1 * bot2 - top2 * bot1;
        totalDen = bot1 * bot2;
      } else if (op === '×' || op === '*') {
        totalNum = top1 * top2;
        totalDen = bot1 * bot2;
      } else if (op === '÷' || op === '/') {
        if (top2 === 0) { totalNum = 0; totalDen = 1; }
        else { totalNum = top1 * bot2; totalDen = bot1 * top2; }
      } else {
        totalNum = top1 * bot2 + top2 * bot1;
        totalDen = bot1 * bot2;
      }

      const simplified = simplifyFraction(totalNum, totalDen);

      let correct, display;

      if (body.mixed) {
        const mixed = toMixed(simplified.num, simplified.den);
        const whole = Number(body.ansWhole) || 0;
        const den = Number(body.ansDen) || 1;
        const num = Number(body.ansNum) || 0;
        const userTotal = whole < 0 ? (whole * den - num) : (whole * den + num);
        const userDen = Number(body.ansDen) || 1;
        const userSimp = simplifyFraction(userTotal, userDen);
        correct = userSimp.num === simplified.num && userSimp.den === simplified.den;
        if (mixed.num === 0) {
          display = `${mixed.whole}`;
        } else if (mixed.whole === 0) {
          display = `${simplified.num}/${simplified.den}`;
        } else {
          display = `${mixed.whole} ${mixed.num}/${mixed.den}`;
        }
      } else {
        const userSimp = simplifyFraction(Number(body.ansNum) || 0, Number(body.ansDen) || 1);
        correct = userSimp.num === simplified.num && userSimp.den === simplified.den;
        if (simplified.den === 1) {
          display = `${simplified.num}`;
        } else {
          display = `${simplified.num}/${simplified.den}`;
        }
      }

      return {
        correct,
        correctNum: simplified.num,
        correctDen: simplified.den,
        ...(body.mixed ? { correctWhole: toMixed(simplified.num, simplified.den).whole } : {}),
        display,
        message: correct ? 'Correct!' : 'Incorrect'
      };
    },
  },

  tatsavit: {
    question(difficulty, query = {}) {
      difficulty = difficulty || 'easy';
      const level = query.level !== undefined ? Number(query.level) : null;
      const q = tatsavitQuestion(difficulty, level);
      q.difficulty = difficulty;
      return q;
    },
    check(body) {
      const { type, answer, ceilAnswer, display, answerExp } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      const userNum = parseFloat(userStr);
      let correct = false;

      if (type === 3) {
        correct = !isNaN(userNum) && (userNum === answer || userNum === ceilAnswer);
      } else if (type === 4) {
        const exprMatch = userStr.match(/^(-?\d+(?:\.\d+)?)x(?:\^(\d+))?$/);
        if (exprMatch) {
          const userCoeff = parseFloat(exprMatch[1]);
          const userExpVal = exprMatch[2] ? parseInt(exprMatch[2]) : 1;
          const expectedExp = answerExp || (display && display.includes('x²') ? 2 : display && display.includes('x') ? 1 : 0);
          correct = Math.abs(userCoeff - answer) < 0.05 && userExpVal === expectedExp;
        } else {
          correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.05;
        }
      } else {
        correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.05;
      }

      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  gymdecimals: {
    question(difficulty) {
      return gymDecimalsQuestion(difficulty || 'easy');
    },
    check(body) {
      body = body || {};
      if (body.correctOption !== undefined) return mcCheckResult(body);
      const { display, answer } = body;
      const userStr = (body.userAnswer || '').trim();
      const normalise = (s) => {
        let v = s.replace(/^\+/, '').trim();
        if (v.startsWith('.')) v = '0' + v;
        if (v.endsWith('.')) v = v + '0';
        if (v.includes('.')) v = v.replace(/0+$/, '').replace(/\.$/, '');
        return v;
      };
      const userNum = parseFloat(userStr);

      let correct = false;
      if (userStr) {
        if (normalise(userStr) === normalise(String(display))) {
          correct = true;
        } else if (!isNaN(userNum)) {
          const tol = Math.max(Math.abs(answer) * 1e-6, 1e-12);
          correct = Math.abs(userNum - answer) <= tol;
        }
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  funcgym: {
    question(difficulty) { return funcgymQuestion(difficulty || 'easy'); },
    check(body) { return mcCheckResult(body); },
  },

  fracaddgym: {
    question(difficulty) { return fracaddgymQuestion(difficulty || 'easy'); },
    check(body) { return mcCheckResult(body); },
  },

  lineqgym: {
    question(difficulty) { return lineqgymQuestion(difficulty || 'easy'); },
    check(body) { return mcCheckResult(body); },
  },

  indicesgym: {
    question(difficulty) { return indicesgymQuestion(difficulty || 'easy'); },
    check(body) { return mcCheckResult(body); },
  },

  polygym: {
    question(difficulty) { return polygymQuestion(difficulty || 'easy'); },
    check(body) { return mcCheckResult(body); },
  },

  gk: {
    question(difficulty, query = {}) {
      const exclude = query.exclude ? query.exclude.split(',').map(Number) : [];
      if (!banks.gk.length) return null;
      let pool = banks.gk;
      const unseen = pool.filter((q) => !exclude.includes(q.id));
      if (unseen.length > 0) pool = unseen;
      const q = pool[Math.floor(Math.random() * pool.length)];
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        genre: q.genre || 'mixed',
      };
    },
    check(body) {
      const { id, answerOption } = body || {};
      const q = banks.gk.find((item) => Number(item.id) === Number(id));
      if (!q) return null;
      const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
      return {
        correct,
        correctAnswer: q.answerOption,
        correctAnswerText: q.answerText,
        message: correct ? 'Correct! 🎉' : 'Wrong ❌',
      };
    },
  },

  vocab: {
    question(difficulty, query = {}) {
      difficulty = difficulty || 'easy';
      if (difficulty === 'extrahard') difficulty = 'extra-hard';
      const exclude = query.exclude ? query.exclude.split(',').map(Number) : [];
      let pool = banks.vocab.filter((q) => q.difficulty === difficulty);
      if (!pool.length) return null;
      const unseen = pool.filter((q) => !exclude.includes(q.id));
      if (unseen.length > 0) pool = unseen;
      const q = pool[Math.floor(Math.random() * pool.length)];
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      };
    },
    check(body) {
      const { id, answerOption } = body || {};
      const q = banks.vocab.find((item) => Number(item.id) === Number(id));
      if (!q) return null;
      const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
      return {
        correct,
        correctAnswer: q.answerOption,
        correctAnswerText: q.answerText,
        message: correct ? 'Correct!' : 'Incorrect',
      };
    },
  },

  concept: {
    question(difficulty, query = {}) {
      difficulty = difficulty || 'easy';
      if (difficulty === 'extrahard') difficulty = 'extra-hard';
      const exclude = query.exclude ? query.exclude.split(',').map(Number) : [];
      let pool = banks.concepts.filter((q) => q.difficulty === difficulty);
      if (!pool.length) return null;
      const unseen = pool.filter((q) => !exclude.includes(q.id));
      if (unseen.length > 0) pool = unseen;
      const q = pool[Math.floor(Math.random() * pool.length)];
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      };
    },
    check(body) {
      const { id, answerOption } = body || {};
      const q = banks.concepts.find((item) => Number(item.id) === Number(id));
      if (!q) return null;
      const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
      return {
        correct,
        correctAnswer: q.answerOption,
        correctAnswerText: q.answerText,
        message: correct ? 'Correct!' : 'Incorrect',
      };
    },
  },

  sets: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const universe = [];
        for (let i = 1; i <= setRand(10, 15); i++) universe.push(i);
        const A = randomSubset(universe, setRand(3, 6));
        const B = randomSubset(universe, setRand(3, 6));
        const ops = [
          { op: 'A ∪ B', answer: setUnion(A, B) },
          { op: 'A ∩ B', answer: setIntersect(A, B) },
          { op: 'A − B', answer: setDiff(A, B) },
          { op: 'B − A', answer: setDiff(B, A) },
          { op: "A'", answer: setDiff(universe, A) },
        ];
        const chosen = setPick(ops);
        const prompt = `U = {${universe.join(', ')}}, A = {${A.join(', ')}}, B = {${B.join(', ')}}. Find ${chosen.op}`;
        return { id, difficulty: diff, type: 'list', prompt, answer: chosen.answer };
      } else if (diff === 'medium') {
        const nA = setRand(10, 30); const nB = setRand(10, 30);
        const nAB = setRand(2, Math.min(nA, nB) - 1);
        const nAuB = nA + nB - nAB;
        const subtype = setPick(['find_union', 'find_intersect', 'find_only_a']);
        let prompt, answer;
        if (subtype === 'find_union') {
          prompt = `n(A) = ${nA}, n(B) = ${nB}, n(A ∩ B) = ${nAB}. Find n(A ∪ B)`;
          answer = nAuB;
        } else if (subtype === 'find_intersect') {
          prompt = `n(A) = ${nA}, n(B) = ${nB}, n(A ∪ B) = ${nAuB}. Find n(A ∩ B)`;
          answer = nAB;
        } else {
          prompt = `n(A) = ${nA}, n(A ∩ B) = ${nAB}. How many elements are in A only?`;
          answer = nA - nAB;
        }
        return { id, difficulty: diff, type: 'cardinality', subtype, prompt, answer };
      } else if (diff === 'hard') {
        const onlyA = setRand(5, 20); const both = setRand(3, 15);
        const onlyB = setRand(5, 20); const neither = setRand(2, 10);
        const total = onlyA + both + onlyB + neither;
        const subtype = setPick(['find_neither', 'find_both', 'find_onlyA', 'find_total']);
        let prompt, answer;
        if (subtype === 'find_neither') {
          prompt = `In a group of ${total}: n(A only) = ${onlyA}, n(A ∩ B) = ${both}, n(B only) = ${onlyB}. How many are in neither A nor B?`;
          answer = neither;
        } else if (subtype === 'find_both') {
          prompt = `In a group of ${total}: n(A) = ${onlyA + both}, n(B) = ${onlyB + both}, n(neither) = ${neither}. Find n(A ∩ B).`;
          answer = both;
        } else if (subtype === 'find_onlyA') {
          prompt = `In a group of ${total}: n(A ∩ B) = ${both}, n(B only) = ${onlyB}, n(neither) = ${neither}. How many are in A only?`;
          answer = onlyA;
        } else {
          prompt = `n(A only) = ${onlyA}, n(A ∩ B) = ${both}, n(B only) = ${onlyB}, n(neither) = ${neither}. Find the total.`;
          answer = total;
        }
        return { id, difficulty: diff, type: 'venn2', subtype, prompt, answer };
      } else {
        const abc = setRand(1, 5); const abOnly = setRand(1, 8); const acOnly = setRand(1, 8);
        const bcOnly = setRand(1, 8); const aOnly = setRand(3, 12); const bOnly = setRand(3, 12);
        const cOnly = setRand(3, 12); const neither = setRand(2, 8);
        const nA = aOnly + abOnly + acOnly + abc; const nB = bOnly + abOnly + bcOnly + abc;
        const nC = cOnly + acOnly + bcOnly + abc; const nAB = abOnly + abc;
        const nAC = acOnly + abc; const nBC = bcOnly + abc;
        const total = aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + abc + neither;
        const subtype = setPick(['find_abc', 'find_neither', 'find_aonly', 'find_total']);
        let prompt, answer;
        if (subtype === 'find_abc') {
          prompt = `n(A) = ${nA}, n(B) = ${nB}, n(C) = ${nC}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(B∩C) = ${nBC}, total in at least one set = ${total - neither}. Find n(A ∩ B ∩ C).`;
          answer = abc;
        } else if (subtype === 'find_neither') {
          const inAtLeastOne = nA + nB + nC - nAB - nAC - nBC + abc;
          prompt = `In a group of ${total}: n(A) = ${nA}, n(B) = ${nB}, n(C) = ${nC}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(B∩C) = ${nBC}, n(A∩B∩C) = ${abc}. How many in neither?`;
          answer = total - inAtLeastOne;
        } else if (subtype === 'find_aonly') {
          prompt = `n(A) = ${nA}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(A∩B∩C) = ${abc}. How many are in A only?`;
          answer = aOnly;
        } else {
          prompt = `n(A only) = ${aOnly}, n(B only) = ${bOnly}, n(C only) = ${cOnly}, n(A∩B only) = ${abOnly}, n(A∩C only) = ${acOnly}, n(B∩C only) = ${bcOnly}, n(A∩B∩C) = ${abc}, neither = ${neither}. Find total.`;
          answer = total;
        }
        return { id, difficulty: diff, type: 'venn3', subtype, prompt, answer };
      }
    },
    check(body) {
      const { type, answer: expected } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false; let display = '';
      if (type === 'list') {
        const cleaned = userStr.replace(/[{}]/g, '');
        let userSet;
        if (cleaned === '' || cleaned.toLowerCase() === 'empty') { userSet = []; }
        else { userSet = cleaned.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b); }
        const expectedSorted = [...expected].sort((a, b) => a - b);
        correct = userSet.length === expectedSorted.length && userSet.every((v, i) => v === expectedSorted[i]);
        display = expectedSorted.length === 0 ? '{ } (empty set)' : `{${expectedSorted.join(', ')}}`;
      } else {
        const userNum = parseInt(userStr);
        correct = !isNaN(userNum) && userNum === expected;
        display = String(expected);
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  bounds: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const val = randInt(10, 99); const dp1 = randInt(1, 9);
        const num = val + dp1 / 10;
        prompt = `${num} is rounded to 1 decimal place. What is the lower bound?`;
        answer = num - 0.05; display = String(answer);
      } else if (diff === 'medium') {
        const base = randInt(3, 15) * 10;
        prompt = `A length is ${base} cm, rounded to the nearest 10 cm. What is the upper bound?`;
        answer = base + 5; display = String(answer);
      } else if (diff === 'hard') {
        const a = randInt(20, 50) / 10; const b = randInt(20, 50) / 10;
        prompt = `a = ${a} (1 d.p.) and b = ${b} (1 d.p.). Find the upper bound of a + b.`;
        answer = Math.round((a + 0.05 + b + 0.05) * 100) / 100; display = String(answer);
      } else {
        const a = randInt(30, 80) / 10; const b = randInt(20, 40) / 10;
        const upperA = a + 0.05; const lowerB = b - 0.05;
        const result = Math.round((upperA / lowerB) * 1000) / 1000;
        prompt = `a = ${a} (1 d.p.) and b = ${b} (1 d.p.). Find the upper bound of a ÷ b. Give answer to 3 d.p.`;
        answer = result; display = String(answer);
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/\s/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.005;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  sdt: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const s = randInt(20, 80); const t = randInt(2, 6);
        answer = s * t; display = answer + ' km';
        prompt = `A car travels at ${s} km/h for ${t} hours. How far does it travel (in km)?`;
      } else if (diff === 'medium') {
        const s = randInt(30, 70); const d = s * randInt(2, 5);
        answer = d / s; display = answer + ' hours';
        prompt = `A train covers ${d} km at ${s} km/h. How long does the journey take (in hours)?`;
      } else if (diff === 'hard') {
        const d1 = randInt(30, 80); const s1 = randInt(20, 60);
        const d2 = randInt(30, 80); const s2 = randInt(20, 60);
        const totalD = d1 + d2;
        const timeNum = d1 * s2 + d2 * s1; const timeDen = s1 * s2;
        const ansNum = totalD * timeDen; const ansDen = timeNum;
        const g = gcd(Math.abs(ansNum), Math.abs(ansDen));
        const rn = ansNum / g; const rd = ansDen / g;
        answer = rd === 1 ? rn : Math.round((rn / rd) * 100) / 100;
        display = answer + ' km/h';
        prompt = `A cyclist rides ${d1} km at ${s1} km/h then ${d2} km at ${s2} km/h. Find the average speed (to 2 d.p. if needed).`;
      } else {
        const ms = randInt(5, 30);
        answer = Math.round(ms * 3.6 * 100) / 100; display = answer + ' km/h';
        prompt = `Convert ${ms} m/s to km/h.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-\/]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.05;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  variation: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const k = randInt(2, 9); const x1 = randInt(2, 6); const y1 = k * x1; const x2 = randInt(3, 8);
        answer = k * x2; display = String(answer);
        prompt = `y is directly proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      } else if (diff === 'medium') {
        const x1 = randInt(2, 6); const x2 = randInt(2, 6);
        const kUse = x1 * x2 * randInt(1, 4);
        const y1 = kUse / x1;
        answer = kUse / x2; display = String(answer);
        prompt = `y is inversely proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      } else if (diff === 'hard') {
        const k = randInt(1, 5); const x1 = randInt(2, 5); const y1 = k * x1 * x1; const x2 = randInt(2, 6);
        answer = k * x2 * x2; display = String(answer);
        prompt = `y is directly proportional to x². When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      } else {
        const x1 = [4, 9, 16, 25][randInt(0, 3)];
        const sqrtX1 = Math.round(Math.sqrt(x1));
        const k = sqrtX1 * randInt(2, 6); const y1 = k / sqrtX1;
        const x2 = [4, 9, 16, 25][randInt(0, 3)];
        const sqrtX2 = Math.round(Math.sqrt(x2));
        answer = k / sqrtX2; display = String(answer);
        prompt = `y is inversely proportional to √x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/\s/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.05;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  hcflcm: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      const type = randInt(1, 4);
      if (diff === 'easy') {
        if (type === 1) {
          const g = randInt(2, 8); const a = g * randInt(2, 5); const b = g * randInt(2, 5);
          answer = gcd(a, b); display = String(answer);
          prompt = `Find the HCF (Highest Common Factor) of ${a} and ${b}.`;
        } else if (type === 2) {
          const a = [9, 14, 15, 21, 25, 27][randInt(0, 5)]; const b = [8, 11, 16, 22, 26, 29][randInt(0, 5)];
          answer = gcd(a, b); display = String(answer);
          prompt = `What is the Highest Common Factor (HCF) of ${a} and ${b}?`;
        } else if (type === 3) {
          const factors = [
            { a: 12, b: 18, g: 6, fruit1: 'apples', fruit2: 'oranges' },
            { a: 16, b: 24, g: 8, fruit1: 'stickers', fruit2: 'stamps' },
            { a: 15, b: 20, g: 5, fruit1: 'pens', fruit2: 'pencils' },
            { a: 8, b: 12, g: 4, fruit1: 'blue beads', fruit2: 'red beads' }
          ][randInt(0, 3)];
          answer = factors.g; display = String(answer);
          prompt = `A teacher has ${factors.a} ${factors.fruit1} and ${factors.b} ${factors.fruit2}. She wants to divide them equally among her students without leftovers. What is the maximum number of students who can get an equal share?`;
        } else {
          const a = randInt(3, 9); const b = a * randInt(2, 4);
          answer = a; display = String(answer);
          prompt = `Find the HCF of ${a} and ${b}.`;
        }
      } else if (diff === 'medium') {
        if (type === 1) {
          const a = randInt(4, 12); const b = randInt(4, 12);
          answer = lcm(a, b); display = String(answer);
          prompt = `Find the LCM (Lowest Common Multiple) of ${a} and ${b}.`;
        } else if (type === 2) {
          const primes = [3, 5, 7, 11];
          const a = primes[randInt(0, 3)]; let b = primes[randInt(0, 3)];
          while (a === b) { b = primes[randInt(0, 3)]; }
          answer = lcm(a, b); display = String(answer);
          prompt = `What is the Lowest Common Multiple (LCM) of ${a} and ${b}?`;
        } else if (type === 3) {
          const p = [
            { a: 6, b: 8, l: 24, thing: 'neon signs blink', unit: 'seconds' },
            { a: 10, b: 15, l: 30, thing: 'bus schedules align', unit: 'minutes' },
            { a: 4, b: 6, l: 12, thing: 'alarms beep', unit: 'minutes' }
          ][randInt(0, 2)];
          answer = p.l; display = String(answer);
          prompt = `Two ${p.thing} at intervals of ${p.a} and ${p.b} ${p.unit}. If they align now, after how many ${p.unit} will they next align?`;
        } else {
          const a = randInt(3, 8); const b = a * randInt(2, 4);
          answer = b; display = String(answer);
          prompt = `Find the LCM of ${a} and ${b}.`;
        }
      } else if (diff === 'hard') {
        if (type === 1) {
          const a = randInt(3, 8); const b = randInt(3, 8); const c = randInt(3, 8);
          answer = lcm(lcm(a, b), c); display = String(answer);
          prompt = `Find the LCM of ${a}, ${b}, and ${c}.`;
        } else if (type === 2) {
          const g = randInt(2, 6); const a = g * randInt(2, 4); const b = g * randInt(2, 4); const c = g * randInt(2, 4);
          answer = gcd(gcd(a, b), c); display = String(answer);
          prompt = `Find the Highest Common Factor (HCF) of ${a}, ${b}, and ${c}.`;
        } else if (type === 3) {
          const base = [
            { h: 4, l: 24, a: 8, b: 12 }, { h: 6, l: 36, a: 12, b: 18 },
            { h: 5, l: 30, a: 10, b: 15 }, { h: 3, l: 18, a: 6, b: 9 }
          ][randInt(0, 3)];
          answer = base.b; display = String(answer);
          prompt = `The HCF of two numbers is ${base.h} and their LCM is ${base.l}. If one of the numbers is ${base.a}, what is the other number?`;
        } else {
          const a = [3, 4, 6][randInt(0, 2)]; const b = [4, 5, 8][randInt(0, 2)]; const c = [6, 8, 12][randInt(0, 2)];
          answer = lcm(lcm(a, b), c); display = String(answer);
          prompt = `Three runners start running a lap together. Runner A completes a lap in ${a} minutes, Runner B in ${b} minutes, and Runner C in ${c} minutes. After how many minutes will they next meet at the starting point?`;
        }
      } else {
        if (type === 1) {
          const r = randInt(2, 5); const g = randInt(4, 10); const f1 = randInt(2, 4); const f2 = randInt(2, 4);
          const a = g * f1 + r; const b = g * f2 + r;
          answer = gcd(a - r, b - r); display = String(answer);
          prompt = `Find the largest number that divides ${a} and ${b} leaving a remainder of ${r} in each case.`;
        } else if (type === 2) {
          const r = randInt(2, 5); const a = randInt(5, 10); const b = randInt(5, 10);
          answer = lcm(a, b) + r; display = String(answer);
          prompt = `What is the smallest positive integer which when divided by ${a} and ${b} leaves a remainder of ${r} in each case?`;
        } else if (type === 3) {
          const lengths = [
            { a: 48, b: 72, c: 96, g: 24 }, { a: 30, b: 45, c: 75, g: 15 },
            { a: 36, b: 54, c: 90, g: 18 }, { a: 40, b: 60, c: 80, g: 20 }
          ][randInt(0, 3)];
          answer = lengths.g; display = String(answer);
          prompt = `A merchant has three pieces of ribbon of lengths ${lengths.a} cm, ${lengths.b} cm, and ${lengths.c} cm. He wants to cut them into equal pieces of the maximum possible length. What should be the length of each piece (in cm)?`;
        } else {
          const a = randInt(6, 12); const b = randInt(8, 15);
          answer = lcm(a, b); display = String(answer);
          prompt = `Two neon signs blink at different rates. Sign A blinks every ${a} seconds, and Sign B blinks every ${b} seconds. If they both blink together now, after how many seconds will they next blink together?`;
        }
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-]/g, ''));
      const correct = !isNaN(ua) && ua === body.answer;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  remfactor: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const a = randomInt(2, 5); const b = randomInt(1, 10); const c = randomInt(1, 20); const xVal = randomInt(1, 5);
        const answer = a * xVal * xVal + b * xVal + c;
        const prompt = `Find remainder when f(x) = ${a}x² + ${b}x + ${c} is divided by (x − ${xVal})`;
        return { id, difficulty: diff, prompt, answer, display: String(answer) };
      } else if (diff === 'medium') {
        const a = randomInt(2, 5); const answer_val = randomInt(1, 6);
        const b = randomInt(1, 8); const remainder = randomInt(1, 10);
        const isFactor = Math.random() < 0.5;
        const result = isFactor ? 0 : remainder;
        const prompt = `Is (x − ${answer_val}) a factor of f(x) = ${a}x² + ${b}x + ${result}? Answer yes or no`;
        const answerStr = isFactor ? 'yes' : 'no';
        return { id, difficulty: diff, prompt, answer: answerStr, display: answerStr };
      } else if (diff === 'hard') {
        const a = randomInt(1, 4); const b = randomInt(1, 6); const c = randomInt(1, 10); const d = randomInt(1, 15); const xVal = randomInt(1, 4);
        const answer = a * xVal * xVal * xVal + b * xVal * xVal + c * xVal + d;
        const prompt = `Find remainder when f(x) = ${a}x³ + ${b}x² + ${c}x + ${d} is divided by (x − ${xVal})`;
        return { id, difficulty: diff, prompt, answer, display: String(answer) };
      } else {
        const xVal = randomInt(1, 4); const b = randomInt(1, 20);
        const answer = -(xVal * xVal * xVal + b) / xVal;
        const prompt = `Find k such that (x − ${xVal}) is a factor of x³ + kx + ${b}`;
        return { id, difficulty: diff, prompt, answer, display: answer.toFixed(2) };
      }
    },
    check(body) {
      const { answer, display } = body;
      let userStr = (body.userAnswer || '').trim().toLowerCase();
      const correct = (typeof answer === 'string')
        ? userStr === answer.toLowerCase()
        : !isNaN(parseFloat(userStr)) && Math.abs(parseFloat(userStr) - answer) < 0.1;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

const { generateExplanation } = require('../explanations');

function curiosityVariation(req, res) {
  try {
    // (no-op) request received - structured ops and variation handling follow
    const { originalType, originalData, variation } = req.body || {};
    if (!originalType || !originalData || (!variation && !Array.isArray(req.body.ops))) return res.status(400).json({ error: 'originalType, originalData and variation (or ops) required' });

    let v = String(variation || '').toLowerCase().trim();

    // Helper to parse simple number from variation like 'add 10' or 'plus 7'
    const extractNumber = (str) => {
      const m = str.match(/([-+]?[0-9]+(?:\.[0-9]+)?)/);
      return m ? Number(m[1]) : null;
    };

    // Produce mutated copy of originalData depending on variation
    const mutated = JSON.parse(JSON.stringify(originalData));

    // Accept op overrides from top-level request to be robust
    if (req.body && typeof req.body.opAB === 'string') mutated.opAB = req.body.opAB;
    if (req.body && typeof req.body.opBC === 'string') mutated.opBC = req.body.opBC;

    // Normalize common unicode minus/dash characters to ASCII '-' for consistency
    const normalizeOp = (v) => {
      if (v == null) return v;
      const s = String(v).trim();
      if (s === '−' || s === '–' || s === '\u2212') return '-';
      return s;
    };
    if (mutated.opAB != null) mutated.opAB = normalizeOp(mutated.opAB);
    if (mutated.opBC != null) mutated.opBC = normalizeOp(mutated.opBC);

    // If client sent structured ops array, capture them for possible application
    const opsFromClient = Array.isArray(req.body.ops) ? req.body.ops : null;
    let appliedStructuredOps = false;
    // When structured ops are present, skip legacy free-text parsing
    const skipLegacy = opsFromClient && Array.isArray(opsFromClient) && opsFromClient.length;

    const applyToPair = (xKey, yKey) => {
      // Handle doubling/halving both or one item
      if ((/double|doubled/.test(v) || /halve|halved/.test(v)) && v.includes('both')) {
        if (/double|doubled/.test(v)) {
          mutated[xKey] = Number(mutated[xKey]) * 2;
          mutated[yKey] = Number(mutated[yKey]) * 2;
        } else {
          mutated[xKey] = Number(mutated[xKey]) / 2;
          mutated[yKey] = Number(mutated[yKey]) / 2;
        }
        return;
      }

      // Double/halve a specifically named operand
      if ((/double|doubled/.test(v) || /halve|halved/.test(v)) && v.includes('first')) {
        if (/double|doubled/.test(v)) mutated[xKey] = Number(mutated[xKey]) * 2;
        else mutated[xKey] = Number(mutated[xKey]) / 2;
        return;
      }
      if ((/double|doubled/.test(v) || /halve|halved/.test(v)) && v.includes('second')) {
        if (/double|doubled/.test(v)) mutated[yKey] = Number(mutated[yKey]) * 2;
        else mutated[yKey] = Number(mutated[yKey]) / 2;
        return;
      }

      // If phrase references "one" or "one number" without specifying which,
      // default to applying change to the first operand (xKey).
      if ((/double|doubled/.test(v) || /halve|halved/.test(v)) && /one( number)?/.test(v)) {
        if (/double|doubled/.test(v)) mutated[xKey] = Number(mutated[xKey]) * 2;
        else mutated[xKey] = Number(mutated[xKey]) / 2;
        return;
      }

      if (v.includes('swap')) {
        const tmp = mutated[xKey]; mutated[xKey] = mutated[yKey]; mutated[yKey] = tmp;
        return;
      }

      // Specific patterns that target the second operand should be checked before
      // the generic 'add'/'subtract' handlers so phrases like 'add 2 to second'
      // don't get matched by the generic rule first.
      // Handle phrases like 'add 5 to second' or 'add to second' (number may appear between 'add' and 'to')
      if (/(?:add|plus)\b[\s\S]*?to\s+(?:the\s+)?second|\badd\s+second|\badd\s+the\s+second/.test(v)) {
        const n = extractNumber(v); if (n !== null) mutated[yKey] = Number(mutated[yKey]) + n;
        return;
      }
      if (/(?:subtract|minus)\b[\s\S]*?from\s+(?:the\s+)?second|\bsubtract\s+second|\bminus\s+second/.test(v)) {
        const n = extractNumber(v); if (n !== null) mutated[yKey] = Number(mutated[yKey]) - n;
        return;
      }
      if (/add|plus/.test(v)) {
        const n = extractNumber(v);
        if (n !== null) mutated[xKey] = Number(mutated[xKey]) + n;
        return;
      }
      if (/subtract|minus/.test(v)) {
        const n = extractNumber(v);
        if (n !== null) mutated[xKey] = Number(mutated[xKey]) - n;
        return;
      }
      if (v.includes('multiply') || v.includes('times')) {
        const n = extractNumber(v);
        if (n !== null) {
          if (v.includes('both')) {
            mutated[xKey] = Number(mutated[xKey]) * n;
            mutated[yKey] = Number(mutated[yKey]) * n;
          } else if (v.includes('second')) {
            mutated[yKey] = Number(mutated[yKey]) * n;
          } else {
            // default: apply to first / xKey
            mutated[xKey] = Number(mutated[xKey]) * n;
          }
        }
        return;
      }
      if (v.includes('increment') || v.includes('increase')) {
        const n = extractNumber(v) || 1; mutated[xKey] = Number(mutated[xKey]) + n;
        return;
      }
    };

    const applyOpObject = (opObj) => {
      if (!opObj || typeof opObj !== 'object') return;
      const t = String(opObj.type || '').toLowerCase();
      const target = String(opObj.target || '').toLowerCase();
      const val = opObj.value != null ? Number(opObj.value) : null;
      if (t === 'invert') {
        if (target.includes('first')) { const tmp = mutated.n1; mutated.n1 = mutated.d1; mutated.d1 = tmp; }
        else if (target.includes('second')) { const tmp = mutated.n2; mutated.n2 = mutated.d2; mutated.d2 = tmp; }
        else if (target === 'swap') { const tmpn = mutated.n1; const tmpd = mutated.d1; mutated.n1 = mutated.n2; mutated.d1 = mutated.d2; mutated.n2 = tmpn; mutated.d2 = tmpd; }
        return;
      }
      if ((t === 'multiply' || t === 'add' || t === 'subtract') && val == null) return;
      if (target === 'firstnumerator') {
        if (t === 'multiply') mutated.n1 = Number(mutated.n1) * val;
        if (t === 'add') mutated.n1 = Number(mutated.n1) + val;
        if (t === 'subtract') mutated.n1 = Number(mutated.n1) - val;
      } else if (target === 'firstdenominator') {
        if (t === 'multiply') mutated.d1 = Number(mutated.d1) * val;
        if (t === 'add') mutated.d1 = Number(mutated.d1) + val;
        if (t === 'subtract') mutated.d1 = Number(mutated.d1) - val;
      } else if (target === 'secondnumerator') {
        if (t === 'multiply') mutated.n2 = Number(mutated.n2) * val;
        if (t === 'add') mutated.n2 = Number(mutated.n2) + val;
        if (t === 'subtract') mutated.n2 = Number(mutated.n2) - val;
      } else if (target === 'seconddenominator') {
        if (t === 'multiply') mutated.d2 = Number(mutated.d2) * val;
        if (t === 'add') mutated.d2 = Number(mutated.d2) + val;
        if (t === 'subtract') mutated.d2 = Number(mutated.d2) - val;
      } else if (target === 'a' || target === 'coef_a' || target === 'coefficient_a') {
        if (t === 'multiply') mutated.a = Number(mutated.a) * val;
        if (t === 'add') mutated.a = Number(mutated.a) + val;
        if (t === 'subtract') mutated.a = Number(mutated.a) - val;
      } else if (target === 'b' || target === 'coef_b' || target === 'coefficient_b') {
        if (t === 'multiply') mutated.b = Number(mutated.b) * val;
        if (t === 'add') mutated.b = Number(mutated.b) + val;
        if (t === 'subtract') mutated.b = Number(mutated.b) - val;
      } else if (target === 'c' || target === 'coef_c' || target === 'constant') {
        if (t === 'multiply') mutated.c = Number(mutated.c) * val;
        if (t === 'add') mutated.c = Number(mutated.c) + val;
        if (t === 'subtract') mutated.c = Number(mutated.c) - val;
      } else if (target === 'x' || target === 'value_x') {
        if (t === 'multiply') mutated.x = Number(mutated.x) * val;
        if (t === 'add') mutated.x = Number(mutated.x) + val;
        if (t === 'subtract') mutated.x = Number(mutated.x) - val;
      }
    }

    // If structured ops are present, apply them now (once) so all problem types benefit
    if (opsFromClient && Array.isArray(opsFromClient) && opsFromClient.length) {
      for (const o of opsFromClient) applyOpObject(o);
      appliedStructuredOps = true;
    }

    // Compute new problem and answer for a few supported types
    let newProblem = null;
    let newAnswer = null;
    let mappedPath = null;

    if (originalType === 'addition' || originalType === 'add') {
      // Expect { a, b }
      applyToPair('a', 'b');
      const a = Number(mutated.a); const b = Number(mutated.b);
      newProblem = { prompt: `${a} + ${b}`, a, b };
      newAnswer = a + b;
      mappedPath = '/addition-api/check';
    } else if (originalType === 'basicarith') {
      // Expect { a, b, op }
      applyToPair('a', 'b');
      const a = Number(mutated.a); const b = Number(mutated.b); const op = mutated.op || '+';
      newProblem = { prompt: `${a} ${op} ${b}`, a, b, op };
      if (op === '+' || op === '＋') newAnswer = a + b;
      else if (op === '-' || op === '−') newAnswer = a - b;
      else if (op === '×' || op === '*') newAnswer = a * b;
      else if (op === '÷' || op === '/') newAnswer = b === 0 ? null : a / b;
      mappedPath = '/basicarith-api/check';
    } else if (originalType === 'multiply' || originalType === 'times') {
      applyToPair('table', 'multiplier');
      const table = Number(mutated.table); const multiplier = Number(mutated.multiplier);
      newProblem = { prompt: `${table} × ${multiplier}`, table, multiplier };
      newAnswer = table * multiplier;
      mappedPath = '/multiply-api/check';
    } else if (originalType === 'quadratic') {
      // Expect { a, b, c, x }
      // If structured ops were NOT provided, allow legacy free-text tweaks
      if (!skipLegacy) {
        if (v.includes('double') && v.includes('a')) mutated.a = Number(mutated.a) * 2;
        if (v.includes('double') && v.includes('b')) mutated.b = Number(mutated.b) * 2;
        if (v.includes('double') && v.includes('c')) mutated.c = Number(mutated.c) * 2;
        if (v.includes('increase x') || v.includes('add to x')) {
          const n = extractNumber(v) || 1; mutated.x = Number(mutated.x) + n;
        }
        if (v.includes('decrease x') || v.includes('subtract from x')) {
          const n = extractNumber(v) || 1; mutated.x = Number(mutated.x) - n;
        }
      }
      const a = Number(mutated.a), b = Number(mutated.b), c = Number(mutated.c), x = Number(mutated.x);
      const opAB = (mutated.opAB || '+').toString();
      const opBC = (mutated.opBC || '+').toString();
      newProblem = { prompt: buildQuadraticPrompt(a, b, c, x, opAB, opBC), a, b, c, x, opAB, opBC };
      // compute answer respecting provided operators
      const left = a * x * x;
      const mid = b * x;
      const third = c;
      const applyOpLocal = (lhs, op, rhs) => op === '-' ? lhs - rhs : lhs + rhs;
      const afterMid = applyOpLocal(left, opAB, mid);
      newAnswer = applyOpLocal(afterMid, opBC, third);
      mappedPath = '/quadratic-api/check';
    } else if (originalType === 'geometry' || originalType === 'mensur' || originalType === 'mensuration') {
      // Expect { shape, measure, a, b }
      // a is the first dimension: length/base/radius. b is the second dimension: width/height.
      applyToPair('a', 'b');
      const shape = String(mutated.shape || 'rectangle').toLowerCase();
      let measure = String(mutated.measure || 'area').toLowerCase();
      let a = Number(mutated.a);
      let b = Number(mutated.b);
      const round2 = (n) => Math.round(n * 100) / 100;
      const fmt = (n) => Number.isInteger(n) ? String(n) : String(round2(n));
      const positive = (n, fallback) => Number.isFinite(n) && n > 0 ? n : fallback;
      a = positive(a, 1);
      b = positive(b, 1);

      if (shape === 'rectangle') {
        if (measure !== 'perimeter') measure = 'area';
        if (measure === 'perimeter') {
          newAnswer = round2(2 * (a + b));
          newProblem = { prompt: `Perimeter of rectangle: length = ${fmt(a)}, width = ${fmt(b)}`, shape, measure, a, b, answer: newAnswer, display: fmt(newAnswer) };
        } else {
          newAnswer = round2(a * b);
          newProblem = { prompt: `Area of rectangle: length = ${fmt(a)}, width = ${fmt(b)}`, shape, measure, a, b, answer: newAnswer, display: fmt(newAnswer) };
        }
      } else if (shape === 'triangle') {
        measure = 'area';
        newAnswer = round2(a * b / 2);
        newProblem = { prompt: `Area of triangle: base = ${fmt(a)}, height = ${fmt(b)}`, shape, measure, a, b, answer: newAnswer, display: fmt(newAnswer) };
      } else if (shape === 'parallelogram') {
        measure = 'area';
        newAnswer = round2(a * b);
        newProblem = { prompt: `Area of parallelogram: base = ${fmt(a)}, height = ${fmt(b)}`, shape, measure, a, b, answer: newAnswer, display: fmt(newAnswer) };
      } else if (shape === 'circle') {
        if (measure !== 'circumference') measure = 'area';
        if (measure === 'circumference') {
          newAnswer = round2(2 * Math.PI * a);
          newProblem = { prompt: `Circumference of circle with radius ${fmt(a)} (to 2 d.p.)`, shape, measure, r: a, answer: newAnswer, display: fmt(newAnswer) };
        } else {
          newAnswer = round2(Math.PI * a * a);
          newProblem = { prompt: `Area of circle with radius ${fmt(a)} (to 2 d.p.)`, shape, measure, r: a, answer: newAnswer, display: fmt(newAnswer) };
        }
      } else if (shape === 'cylinder') {
        if (measure !== 'surface_area') measure = 'volume';
        if (measure === 'surface_area') {
          newAnswer = round2(2 * Math.PI * a * (a + b));
          newProblem = { prompt: `Total surface area of cylinder: radius = ${fmt(a)}, height = ${fmt(b)} (2 d.p.)`, shape, measure, r: a, h: b, answer: newAnswer, display: fmt(newAnswer) };
        } else {
          newAnswer = round2(Math.PI * a * a * b);
          newProblem = { prompt: `Volume of cylinder: radius = ${fmt(a)}, height = ${fmt(b)} (2 d.p.)`, shape, measure, r: a, h: b, answer: newAnswer, display: fmt(newAnswer) };
        }
      } else if (shape === 'cone') {
        if (measure !== 'surface_area') measure = 'volume';
        if (measure === 'surface_area') {
          const slantHeight = Math.sqrt(a * a + b * b);
          newAnswer = round2(Math.PI * a * (a + slantHeight));
          newProblem = { prompt: `Total surface area of cone: radius = ${fmt(a)}, height = ${fmt(b)}, slant height = ${fmt(slantHeight)} (2 d.p.)`, shape, measure, r: a, h: b, l: slantHeight, answer: newAnswer, display: fmt(newAnswer) };
        } else {
          newAnswer = round2(Math.PI * a * a * b / 3);
          newProblem = { prompt: `Volume of cone: radius = ${fmt(a)}, height = ${fmt(b)} (2 d.p.)`, shape, measure, r: a, h: b, answer: newAnswer, display: fmt(newAnswer) };
        }
      } else if (shape === 'sphere') {
        if (measure !== 'surface_area') measure = 'volume';
        if (measure === 'surface_area') {
          newAnswer = round2(4 * Math.PI * a * a);
          newProblem = { prompt: `Surface area of sphere with radius ${fmt(a)} (2 d.p.)`, shape, measure, r: a, answer: newAnswer, display: fmt(newAnswer) };
        } else {
          newAnswer = round2(4 / 3 * Math.PI * a * a * a);
          newProblem = { prompt: `Volume of sphere with radius ${fmt(a)} (2 d.p.)`, shape, measure, r: a, answer: newAnswer, display: fmt(newAnswer) };
        }
      } else {
        return res.status(400).json({ error: `unsupported geometry shape: ${shape}` });
      }
      mappedPath = '/mensur-api/check';
    } else if (originalType === 'fraction' || originalType === 'fractionadd') {
      // Expect { n1,d1,n2,d2, op }
      // Support variations: double numerator1, double both, add N to numerator1, add N to numerator2, multiply numerator by N, swap fractions
      const n1 = Number(mutated.n1 || mutated.numerator1 || 0);
      const d1 = Number(mutated.d1 || mutated.denominator1 || mutated.d1 || 1);
      const n2 = Number(mutated.n2 || mutated.numerator2 || 0);
      const d2 = Number(mutated.d2 || mutated.denominator2 || mutated.d2 || 1);

      // helpers
      const applyToFraction = (vv) => {
        vv = String(vv || '').toLowerCase();
        const isDouble = /double|doubled/.test(vv)
        const isHalve = /halve|halved/.test(vv)
        const isMultiply = /multiply|times|\*|x|×/.test(vv)
        const isAdd = /add|plus|\+/.test(vv)
        const isSubtract = /subtract|minus|\-/.test(vv)
        
        const num = extractNumber(vv)
        const mentionsNumerator = /numerator/.test(vv)
        const mentionsDenominator = /denominator/.test(vv)
        const mentionsFirst = /\bfirst\b/.test(vv)
        const mentionsSecond = /\bsecond\b/.test(vv)
        const mentionsBoth = mentionsFirst && mentionsSecond || vv.includes('both') || /first.*second|second.*first/.test(vv)

        // detect explicit pair like '2 + 2' or '2 and 3' meaning apply 1st number to first field and 2nd to second field
        const pairNumMatch = vv.match(/([-+]?[0-9]+(?:\.[0-9]+)?)\s*(?:\+|and|,|and then|then)\s*([-+]?[0-9]+(?:\.[0-9]+)?)/i);
        if (pairNumMatch) {
          const v1 = Number(pairNumMatch[1]);
          const v2 = Number(pairNumMatch[2]);
          // default target: numerators unless denominator explicitly mentioned
          if (mentionsDenominator) {
            // apply to denominators
            if (isAdd) { mutated.d1 = Number(mutated.d1 || d1) + v1; mutated.d2 = Number(mutated.d2 || d2) + v2; return; }
            if (isSubtract) { mutated.d1 = Number(mutated.d1 || d1) - v1; mutated.d2 = Number(mutated.d2 || d2) - v2; return; }
            if (isMultiply) { mutated.d1 = Number(mutated.d1 || d1) * v1; mutated.d2 = Number(mutated.d2 || d2) * v2; return; }
          } else {
            // apply to numerators
            if (isAdd) { mutated.n1 = Number(mutated.n1 || n1) + v1; mutated.n2 = Number(mutated.n2 || n2) + v2; return; }
            if (isSubtract) { mutated.n1 = Number(mutated.n1 || n1) - v1; mutated.n2 = Number(mutated.n2 || n2) - v2; return; }
            if (isMultiply) { mutated.n1 = Number(mutated.n1 || n1) * v1; mutated.n2 = Number(mutated.n2 || n2) * v2; return; }
          }
        }

        const applyToField = (field, fn) => { mutated[field] = fn(Number(mutated[field] || 0)) }

        // Double / halve
        if ((isDouble || isHalve) && vv.includes('both')) {
          if (mentionsNumerator) { applyToField('n1', x => isDouble ? x * 2 : x / 2); applyToField('n2', x => isDouble ? x * 2 : x / 2); }
          else if (mentionsDenominator) { applyToField('d1', x => isDouble ? x * 2 : x / 2); applyToField('d2', x => isDouble ? x * 2 : x / 2); }
          else { applyToField('n1', x => isDouble ? x * 2 : x / 2); applyToField('n2', x => isDouble ? x * 2 : x / 2); applyToField('d1', x => isDouble ? x * 2 : x / 2); applyToField('d2', x => isDouble ? x * 2 : x / 2); }
          return;
        }

        if ((isDouble || isHalve) && vv.includes('first')) {
          if (mentionsNumerator) applyToField('n1', x => isDouble ? x * 2 : x / 2);
          else if (mentionsDenominator) applyToField('d1', x => isDouble ? x * 2 : x / 2);
          else applyToField('n1', x => isDouble ? x * 2 : x / 2);
          return;
        }
        if ((isDouble || isHalve) && vv.includes('second')) {
          if (mentionsNumerator) applyToField('n2', x => isDouble ? x * 2 : x / 2);
          else if (mentionsDenominator) applyToField('d2', x => isDouble ? x * 2 : x / 2);
          else applyToField('n2', x => isDouble ? x * 2 : x / 2);
          return;
        }

        // invert / flip a single fraction's numerator and denominator
        if (/(invert|flip|reciprocal)/.test(vv) && vv.includes('first')) {
          const t = mutated.n1; mutated.n1 = mutated.d1; mutated.d1 = t; return;
        }
        if (/(invert|flip|reciprocal)/.test(vv) && vv.includes('second')) {
          const t = mutated.n2; mutated.n2 = mutated.d2; mutated.d2 = t; return;
        }

        if (vv.includes('swap')) { const tmpn = mutated.n1; const tmpd = mutated.d1; mutated.n1 = mutated.n2; mutated.d1 = mutated.d2; mutated.n2 = tmpn; mutated.d2 = tmpd; return; }

        if (isAdd) {
          if (num === null) return;
          if (mentionsDenominator) {
            if (mentionsBoth) { mutated.d1 = Number(mutated.d1 || d1) + num; mutated.d2 = Number(mutated.d2 || d2) + num; }
            else if (mentionsSecond) mutated.d2 = Number(mutated.d2 || d2) + num;
            else mutated.d1 = Number(mutated.d1 || d1) + num;
          } else if (mentionsNumerator) {
            if (mentionsBoth) { mutated.n1 = Number(mutated.n1 || n1) + num; mutated.n2 = Number(mutated.n2 || n2) + num; }
            else if (mentionsSecond) mutated.n2 = Number(mutated.n2 || n2) + num;
            else mutated.n1 = Number(mutated.n1 || n1) + num;
          } else {
            // default: numerator
            if (mentionsBoth) { mutated.n1 = Number(mutated.n1 || n1) + num; mutated.n2 = Number(mutated.n2 || n2) + num; }
            else if (mentionsSecond) mutated.n2 = Number(mutated.n2 || n2) + num;
            else mutated.n1 = Number(mutated.n1 || n1) + num;
          }
          return;
        }

        if (isSubtract) {
          if (num === null) return;
          if (mentionsDenominator) {
            if (mentionsBoth) { mutated.d1 = Number(mutated.d1 || d1) - num; mutated.d2 = Number(mutated.d2 || d2) - num; }
            else if (mentionsSecond) mutated.d2 = Number(mutated.d2 || d2) - num;
            else mutated.d1 = Number(mutated.d1 || d1) - num;
          } else if (mentionsNumerator) {
            if (mentionsBoth) { mutated.n1 = Number(mutated.n1 || n1) - num; mutated.n2 = Number(mutated.n2 || n2) - num; }
            else if (mentionsSecond) mutated.n2 = Number(mutated.n2 || n2) - num;
            else mutated.n1 = Number(mutated.n1 || n1) - num;
          } else {
            if (mentionsBoth) { mutated.n1 = Number(mutated.n1 || n1) - num; mutated.n2 = Number(mutated.n2 || n2) - num; }
            else if (mentionsSecond) mutated.n2 = Number(mutated.n2 || n2) - num;
            else mutated.n1 = Number(mutated.n1 || n1) - num;
          }
          return;
        }

        if (isMultiply) {
          if (num === null) return;
          if (mentionsDenominator) {
            if (mentionsBoth) { mutated.d1 = Number(mutated.d1 || d1) * num; mutated.d2 = Number(mutated.d2 || d2) * num; }
            else if (mentionsSecond) mutated.d2 = Number(mutated.d2 || d2) * num;
            else mutated.d1 = Number(mutated.d1 || d1) * num;
          } else if (mentionsNumerator) {
            if (mentionsBoth) { mutated.n1 = Number(mutated.n1 || n1) * num; mutated.n2 = Number(mutated.n2 || n2) * num; }
            else if (mentionsSecond) mutated.n2 = Number(mutated.n2 || n2) * num;
            else mutated.n1 = Number(mutated.n1 || n1) * num;
          } else {
            if (mentionsBoth) { mutated.n1 = Number(mutated.n1 || n1) * num; mutated.n2 = Number(mutated.n2 || n2) * num; }
            else if (mentionsSecond) mutated.n2 = Number(mutated.n2 || n2) * num;
            else mutated.n1 = Number(mutated.n1 || n1) * num;
          }
          return;
        }
      };

      // allow multiple semicolon-separated operations in the variation string
      const originalV = v;
      const parts = String(v).split(/;|\n/).map(s => s.trim()).filter(Boolean);
      // Structured ops are already applied once before dispatch; only skip legacy
      // free-text parsing here so manual fraction edits are not applied twice.
      const skipLegacy = opsFromClient && Array.isArray(opsFromClient) && opsFromClient.length;
      if (!skipLegacy) {
        // Then apply any free-text parts (legacy support)
        if (parts.length > 1) {
          for (const p of parts) {
            applyToFraction(p);
          }
        } else {
          applyToFraction(v);
        }
      }
      // build simple newProblem representation
      const nn1 = Number(mutated.n1 || n1), nd1 = Number(mutated.d1 || d1), nn2 = Number(mutated.n2 || n2), nd2 = Number(mutated.d2 || d2);
      newProblem = { prompt: `${nn1}/${nd1} ${mutated.op || mutated.op || '/'} ${nn2}/${nd2}`, n1: nn1, d1: nd1, n2: nn2, d2: nd2 };
      // compute simple result for add/sub/mul/div when op present
      // Prefer the mutated op if present, otherwise fall back to the originalData.op
      const fop = (mutated.op != null && mutated.op !== '') ? mutated.op : (originalData && originalData.op) ? originalData.op : '+';
      // Ensure the newProblem advertises the operator so explanation generation uses correct operation
      if (newProblem) newProblem.op = fop;
      if (fop === '+' || fop === '＋') {
        // a/b + c/d = (ad + bc)/bd
        newAnswer = { numerator: nn1 * nd2 + nn2 * nd1, denominator: nd1 * nd2 };
      } else if (fop === '-' || fop === '−') {
        newAnswer = { numerator: nn1 * nd2 - nn2 * nd1, denominator: nd1 * nd2 };
      } else if (fop === '×' || fop === '*') {
        newAnswer = { numerator: nn1 * nn2, denominator: nd1 * nd2 };
      } else if (fop === '÷' || fop === '/') {
        newAnswer = { numerator: nn1 * nd2, denominator: nd1 * nn2 };
      }
      // simplify fraction result if present
      if (newAnswer && newAnswer.numerator != null && newAnswer.denominator != null) {
        const num = Number(newAnswer.numerator);
        const den = Number(newAnswer.denominator);
        const gcd = (a, b) => {
          a = Math.abs(a); b = Math.abs(b);
          while (b) { const t = b; b = a % b; a = t; }
          return a || 1;
        };
        const g = gcd(num, den);
        const sn = Math.trunc(num / g);
        const sd = Math.trunc(den / g);
        newAnswer.simplified = { numerator: sn, denominator: sd };
        newAnswer.display = sd === 1 ? String(sn) : `${sn}/${sd}`;
        newAnswer.decimal = den === 0 ? null : Number((num / den).toFixed(6));
      }
      mappedPath = '/fractionadd-api/check';
    } else {
      return res.status(400).json({ error: `unsupported originalType: ${originalType}` });
    }

    const displayAnswer = (ans) => {
      if (ans == null) return 'undefined';
      if (typeof ans === 'object') {
        if (ans.display != null) return String(ans.display);
        if (ans.simplified && ans.simplified.numerator != null && ans.simplified.denominator != null) {
          const n = ans.simplified.numerator;
          const d = ans.simplified.denominator;
          return d === 1 ? String(n) : `${n}/${d}`;
        }
        if (ans.numerator != null && ans.denominator != null) return `${ans.numerator}/${ans.denominator}`;
        return JSON.stringify(ans);
      }
      return String(ans);
    };

    const round2Local = (n) => Math.round(Number(n) * 100) / 100;
    const fmtLocal = (n) => Number.isInteger(Number(n)) ? String(Number(n)) : String(round2Local(n));
    const opText = (op) => op === '*' ? 'x' : op === '/' ? '/' : op;
    const applyArith = (x, operator, y) => {
      if (operator === '+') return x + y;
      if (operator === '-') return x - y;
      if (operator === '*' || operator === 'Ã—') return x * y;
      if (operator === '/' || operator === 'Ã·') return y === 0 ? null : x / y;
      return null;
    };
    const fractionDisplay = (n, d) => `${n}/${d}`;

    const buildCuriosityExplanation = () => {
      const lines = [
        `Curiosity variation: ${variation || (opsFromClient && opsFromClient.length ? 'manual edits' : 'none')}`,
        `Original: ${JSON.stringify(originalData)}`,
        `New problem: ${newProblem && newProblem.prompt ? newProblem.prompt : JSON.stringify(newProblem)}`,
        '',
      ];

      if (originalType === 'addition' || originalType === 'add') {
        lines.push(`Step 1: Apply the variation to the original numbers ${originalData.a} and ${originalData.b}.`);
        lines.push(`Step 2: The new addition is ${newProblem.a} + ${newProblem.b}.`);
        lines.push(`Step 3: ${newProblem.a} + ${newProblem.b} = ${newAnswer}.`);
      } else if (originalType === 'basicarith') {
        const oldA = Number(originalData.a), oldB = Number(originalData.b);
        const oldOp = originalData.op || '+';
        const oldAnswer = applyArith(oldA, oldOp, oldB);
        lines.push(`Step 1: Original calculation: ${oldA} ${opText(oldOp)} ${oldB} = ${oldAnswer == null ? 'undefined' : fmtLocal(oldAnswer)}.`);
        lines.push(`Step 2: Apply the variation, giving ${newProblem.a} ${opText(newProblem.op || oldOp)} ${newProblem.b}.`);
        lines.push(`Step 3: Calculate the new answer: ${newProblem.a} ${opText(newProblem.op || oldOp)} ${newProblem.b} = ${displayAnswer(newAnswer)}.`);
      } else if (originalType === 'multiply' || originalType === 'times') {
        lines.push(`Step 1: Original multiplication: ${originalData.table} x ${originalData.multiplier} = ${Number(originalData.table) * Number(originalData.multiplier)}.`);
        lines.push(`Step 2: Apply the variation, giving ${newProblem.table} x ${newProblem.multiplier}.`);
        lines.push(`Step 3: ${newProblem.table} x ${newProblem.multiplier} = ${displayAnswer(newAnswer)}.`);
      } else if (originalType === 'quadratic') {
        const oldA = Number(originalData.a), oldB = Number(originalData.b), oldC = Number(originalData.c), oldX = Number(originalData.x);
        const oldOpAB = (originalData.opAB || '+').toString();
        const oldOpBC = (originalData.opBC || '+').toString();
        const calcQuad = (qa, qb, qc, qx, firstOp, secondOp) => {
          const left = qa * qx * qx;
          const mid = qb * qx;
          const afterMid = firstOp === '-' ? left - mid : left + mid;
          const total = secondOp === '-' ? afterMid - qc : afterMid + qc;
          return { left, mid, afterMid, total };
        };
        const oldCalc = calcQuad(oldA, oldB, oldC, oldX, oldOpAB, oldOpBC);
        const newCalc = calcQuad(Number(newProblem.a), Number(newProblem.b), Number(newProblem.c), Number(newProblem.x), newProblem.opAB || '+', newProblem.opBC || '+');
        lines.push(`Step 1: Original: ${buildQuadraticPrompt(oldA, oldB, oldC, oldX, oldOpAB, oldOpBC)} = ${oldCalc.total}.`);
        lines.push(`Step 2: Apply the variation to get a=${newProblem.a}, b=${newProblem.b}, c=${newProblem.c}, x=${newProblem.x}.`);
        lines.push(`Step 3: Substitute: ${newProblem.a} x ${newProblem.x}^2 ${newProblem.opAB || '+'} ${newProblem.b} x ${newProblem.x} ${newProblem.opBC || '+'} ${newProblem.c}.`);
        lines.push(`Step 4: Compute terms: ${newProblem.a} x ${newProblem.x}^2 = ${newCalc.left}, and ${newProblem.b} x ${newProblem.x} = ${newCalc.mid}.`);
        lines.push(`Step 5: Combine: ${newCalc.left} ${newProblem.opAB || '+'} ${newCalc.mid} ${newProblem.opBC || '+'} ${newProblem.c} = ${displayAnswer(newAnswer)}.`);
      } else if (originalType === 'geometry' || originalType === 'mensur' || originalType === 'mensuration') {
        const shape = String(newProblem.shape || originalData.shape || '').toLowerCase();
        const measure = String(newProblem.measure || originalData.measure || '').toLowerCase();
        const first = newProblem.r != null ? Number(newProblem.r) : Number(newProblem.a);
        const second = newProblem.h != null ? Number(newProblem.h) : Number(newProblem.b);
        lines.push(`Step 1: Apply the variation to the dimensions.`);
        if (shape === 'rectangle') {
          lines.push(`Step 2: New dimensions: length = ${fmtLocal(newProblem.a)}, width = ${fmtLocal(newProblem.b)}.`);
          lines.push(measure === 'perimeter'
            ? `Step 3: P = 2(length + width) = 2(${fmtLocal(newProblem.a)} + ${fmtLocal(newProblem.b)}) = ${displayAnswer(newAnswer)}.`
            : `Step 3: A = length x width = ${fmtLocal(newProblem.a)} x ${fmtLocal(newProblem.b)} = ${displayAnswer(newAnswer)}.`);
        } else if (shape === 'triangle') {
          lines.push(`Step 2: New dimensions: base = ${fmtLocal(newProblem.a)}, height = ${fmtLocal(newProblem.b)}.`);
          lines.push(`Step 3: A = (base x height) / 2 = (${fmtLocal(newProblem.a)} x ${fmtLocal(newProblem.b)}) / 2 = ${displayAnswer(newAnswer)}.`);
        } else if (shape === 'parallelogram') {
          lines.push(`Step 2: New dimensions: base = ${fmtLocal(newProblem.a)}, height = ${fmtLocal(newProblem.b)}.`);
          lines.push(`Step 3: A = base x height = ${fmtLocal(newProblem.a)} x ${fmtLocal(newProblem.b)} = ${displayAnswer(newAnswer)}.`);
        } else if (shape === 'circle') {
          lines.push(`Step 2: New radius: r = ${fmtLocal(first)}.`);
          lines.push(measure === 'circumference'
            ? `Step 3: C = 2 pi r = 2 x pi x ${fmtLocal(first)} = ${displayAnswer(newAnswer)}.`
            : `Step 3: A = pi r^2 = pi x ${fmtLocal(first)}^2 = ${displayAnswer(newAnswer)}.`);
        } else if (shape === 'cylinder') {
          lines.push(`Step 2: New dimensions: radius = ${fmtLocal(first)}, height = ${fmtLocal(second)}.`);
          lines.push(measure === 'surface_area'
            ? `Step 3: SA = 2 pi r(r + h) = 2 x pi x ${fmtLocal(first)}(${fmtLocal(first)} + ${fmtLocal(second)}) = ${displayAnswer(newAnswer)}.`
            : `Step 3: V = pi r^2 h = pi x ${fmtLocal(first)}^2 x ${fmtLocal(second)} = ${displayAnswer(newAnswer)}.`);
        } else if (shape === 'cone') {
          lines.push(`Step 2: New dimensions: radius = ${fmtLocal(first)}, height = ${fmtLocal(second)}.`);
          if (measure === 'surface_area') {
            lines.push(`Step 3: Slant height l = sqrt(r^2 + h^2) = sqrt(${fmtLocal(first)}^2 + ${fmtLocal(second)}^2) = ${fmtLocal(newProblem.l)}.`);
            lines.push(`Step 4: SA = pi r(r + l) = pi x ${fmtLocal(first)}(${fmtLocal(first)} + ${fmtLocal(newProblem.l)}) = ${displayAnswer(newAnswer)}.`);
          } else {
            lines.push(`Step 3: V = (pi r^2 h) / 3 = (pi x ${fmtLocal(first)}^2 x ${fmtLocal(second)}) / 3 = ${displayAnswer(newAnswer)}.`);
          }
        } else if (shape === 'sphere') {
          lines.push(`Step 2: New radius: r = ${fmtLocal(first)}.`);
          lines.push(measure === 'surface_area'
            ? `Step 3: SA = 4 pi r^2 = 4 x pi x ${fmtLocal(first)}^2 = ${displayAnswer(newAnswer)}.`
            : `Step 3: V = (4/3) pi r^3 = (4/3) x pi x ${fmtLocal(first)}^3 = ${displayAnswer(newAnswer)}.`);
        }
      } else if (originalType === 'fraction' || originalType === 'fractionadd') {
        const oldLeft = fractionDisplay(originalData.n1, originalData.d1);
        const oldRight = fractionDisplay(originalData.n2, originalData.d2);
        const newLeft = fractionDisplay(newProblem.n1, newProblem.d1);
        const newRight = fractionDisplay(newProblem.n2, newProblem.d2);
        const fop = newProblem.op || originalData.op || '+';
        lines.push(`Step 1: Original expression: ${oldLeft} ${opText(fop)} ${oldRight}.`);
        lines.push(`Step 2: Apply the variation to get ${newLeft} ${opText(fop)} ${newRight}.`);
        if (fop === '+') lines.push(`Step 3: Add: (${newProblem.n1} x ${newProblem.d2} + ${newProblem.n2} x ${newProblem.d1}) / (${newProblem.d1} x ${newProblem.d2}).`);
        else if (fop === '-') lines.push(`Step 3: Subtract: (${newProblem.n1} x ${newProblem.d2} - ${newProblem.n2} x ${newProblem.d1}) / (${newProblem.d1} x ${newProblem.d2}).`);
        else if (fop === '*' || fop === 'Ã—') lines.push(`Step 3: Multiply numerators and denominators: (${newProblem.n1} x ${newProblem.n2}) / (${newProblem.d1} x ${newProblem.d2}).`);
        else if (fop === '/' || fop === 'Ã·') lines.push(`Step 3: Divide by multiplying by the reciprocal: (${newProblem.n1} x ${newProblem.d2}) / (${newProblem.d1} x ${newProblem.n2}).`);
        lines.push(`Step 4: Simplify the result: ${displayAnswer(newAnswer)}.`);
      }

      lines.push(`Answer: ${displayAnswer(newAnswer)}`);
      return lines.join('\n');
    };

    const curiosityExplanation = buildCuriosityExplanation();

    // Build a fake req object so we can reuse generateExplanation()
    const fakeReq = { path: mappedPath, body: Object.assign({}, newProblem, { solve: true }) };
    const fakeData = { correctAnswer: newAnswer };
    let explanation = curiosityExplanation || null;
    if (!explanation) {
      try { explanation = generateExplanation(fakeReq, fakeData); } catch (e) { explanation = null; }
    }

    // If generateExplanation left a placeholder 'undefined' for the answer, replace it
    try {
      if (explanation && newAnswer && newAnswer.display) {
        explanation = explanation.replace(/Answer:\s*undefined/gi, `Answer: ${newAnswer.display}`);
      }
    } catch (e) { /* ignore string replace errors */ }

    return res.json({ original: originalData, variation, newProblem, newAnswer, explanation });
  } catch (err) {
    console.error('[curiosity-api] error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'internal error' });
  }
}


router.post('/variation', require('express').json(), (req, res) => {
  if (req.baseUrl !== '/curiosity-api') return res.status(404).end();
  return curiosityVariation(req, res);
});

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  const result = gen.question(req.query.difficulty, req.query);
  if (result === null) return res.status(500).json({ error: 'No questions available' });
  res.json(result);
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  const result = gen.check(req.body || {});
  if (result === null) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

module.exports = router;

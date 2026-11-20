/**
 * DETECTIVE ANSWER CHECKER — shared, framework-free, pure
 *
 * Used by both the classic app flow (`detective-app.jsx`) and the board
 * engine (`detective-board-engine.js`). Keeping one implementation avoids
 * the two copies drifting apart.
 *
 * Accepted answer shapes in the detective data:
 *   - integers / decimals / negatives         24, -3, 0.675, 5.5
 *   - fractions                                '5/12', '3/100', '10/3'
 *   - coordinate pairs                        '(5, 5)', '(-3, 4)'
 *   - unordered root lists                    '-3, 5'
 *   - words / symbols                         'triangle', 'Northeast', 'DE'
 *   - one algebraic expression                '12x^2', '(4/3)x^3 + 7x + C'
 *
 * Rules:
 *   - Numeric answers keep the house tolerance (|diff| < 0.01) and accept a
 *     trailing unit ('15 cm'); arbitrary trailing letters are rejected.
 *   - Fraction answers accept any fraction with the same value and also a
 *     decimal rounded to within tolerance, but never a bare prefix ('5' for
 *     '5/12').
 *   - Coordinate pairs are order-sensitive; root lists are order-insensitive.
 *   - A whole-number answer between 1 and 12 also accepts a clock reading of
 *     that hour ('2:00', '2 o'clock').
 *   - Expressions in x are compared term by term, so '1x^3' and 'x^3' are the
 *     same, and a coefficient may be written as a fraction or a decimal
 *     ('(5/3)x^3', '1.67x^3'). A '+ C' in the stored answer must be present.
 *   - A caller can pass `{ tolerance }` for answers that the question asks the
 *     learner to round (for example 0.5 for "to the nearest metre").
 *   - Everything else is compared as normalised text (case-insensitive,
 *     whitespace-collapsed; expressions ignore spaces and '*').
 */

const NUMBER_RE = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const FRACTION_RE = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/;
const NUMBER_WITH_UNIT_RE = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*([a-zA-Z°%][a-zA-Z0-9^°%]*))?$/;
const UNIT_RE = /^(?:cm|mm|m|km|kg|g|mg|l|ml|cm2|cm\^2|m2|m\^2|hours?|hrs?|minutes?|mins?|seconds?|secs?|degrees?|°|%)$/i;
const TOLERANCE = 0.01;

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\u2212/g, '-')
    .replace(/\u00d7/g, '*')
    .replace(/\u00f7/g, '/')
    .replace(/\u00b2/g, '^2')
    .replace(/\u00b3/g, '^3')
    .replace(/\s+/g, ' ');
}

function parseFraction(text) {
  const match = text.match(FRACTION_RE);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return { num, den };
}

function parseNumberWithOptionalUnit(text) {
  const match = text.match(NUMBER_WITH_UNIT_RE);
  if (!match) return null;
  if (match[2] && !UNIT_RE.test(match[2])) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

/** Parses one list element as a number, fraction or number-with-unit. */
function parseListElement(text) {
  const fraction = parseFraction(text);
  if (fraction) return fraction.num / fraction.den;
  return parseNumberWithOptionalUnit(text);
}

function sameNumber(a, b, tolerance = TOLERANCE) {
  // The small epsilon keeps a half exactly on the edge (23.5 for 23 +/- 0.5) from
  // failing on floating point noise.
  return Math.abs(a - b) < tolerance + 1e-9;
}

const CLOCK_RE = /^(\d{1,2})\s*(?::\s*00|\.00|o'?\s*clock)$/i;

/** One signed term of an expression in x -> { power, coefficient } or the constant C. */
function parseTerm(raw) {
  const sign = raw.startsWith('-') ? -1 : 1;
  const body = raw.replace(/^[+-]/, '');
  if (body === 'c') return { constant: true };
  const match = body.match(/^(\(?[\d./]*\)?)(?:x(?:\^(\d+))?)?$/);
  if (!match || body === '') return null;
  const hasX = body.includes('x');
  const coefText = match[1].replace(/[()]/g, '');
  let coefficient;
  if (coefText === '') {
    if (!hasX) return null;
    coefficient = 1;
  } else {
    const fraction = parseFraction(coefText);
    coefficient = fraction ? fraction.num / fraction.den : NUMBER_RE.test(coefText) ? Number(coefText) : NaN;
  }
  if (!Number.isFinite(coefficient)) return null;
  const power = hasX ? (match[2] === undefined ? 1 : Number(match[2])) : 0;
  return { power, coefficient: sign * coefficient };
}

/** 'x^3 + 5x + C' -> { powers: Map(3 -> 1, 1 -> 5), hasC: true }; null when it is not such an expression. */
function parseExpression(text) {
  const t = normalizeText(text).toLowerCase().replace(/\s+/g, '').replace(/\*/g, '');
  if (t === '' || !/x/.test(t)) return null;
  const pieces = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if ((ch === '+' || ch === '-') && depth === 0 && i > start && t[i - 1] !== '^') {
      pieces.push(t.slice(start, i));
      start = i;
    }
  }
  pieces.push(t.slice(start));
  const powers = new Map();
  let hasC = false;
  for (const piece of pieces) {
    const term = parseTerm(piece);
    if (!term) return null;
    if (term.constant) { hasC = true; continue; }
    powers.set(term.power, (powers.get(term.power) || 0) + term.coefficient);
  }
  return { powers, hasC };
}

function sameExpression(a, b, tolerance) {
  if (a.hasC !== b.hasC) return false;
  const keys = new Set([...a.powers.keys(), ...b.powers.keys()]);
  for (const key of keys) {
    if (!sameNumber(a.powers.get(key) || 0, b.powers.get(key) || 0, tolerance)) return false;
  }
  return true;
}

function splitList(text) {
  const inner = text.replace(/^\((.*)\)$/, '$1');
  return inner.split(',').map(part => part.trim()).filter(part => part !== '');
}

function textKey(text) {
  const normalised = normalizeText(text).toLowerCase();
  // Expressions ("12x^2") ignore spaces and explicit multiplication signs.
  if (/[0-9^]/.test(normalised)) return normalised.replace(/\s+/g, '').replace(/\*/g, '');
  return normalised;
}

function matchesList(correctText, userText) {
  const correctParts = splitList(correctText);
  const userParts = splitList(userText);
  if (userParts.length !== correctParts.length) return false;

  const correctValues = correctParts.map(parseListElement);
  const userValues = userParts.map(parseListElement);
  if (correctValues.some(v => v === null) || userValues.some(v => v === null)) {
    return textKey(userText) === textKey(correctText);
  }

  const ordered = /^\(.*\)$/.test(correctText);
  if (!ordered) {
    const pool = [...userValues];
    for (const value of correctValues) {
      const idx = pool.findIndex(candidate => sameNumber(candidate, value));
      if (idx === -1) return false;
      pool.splice(idx, 1);
    }
    return pool.length === 0;
  }
  return correctValues.every((value, i) => sameNumber(value, userValues[i]));
}

function matchesNumber(expected, userText, tolerance) {
  const fraction = parseFraction(userText);
  if (fraction) return sameNumber(expected, fraction.num / fraction.den, tolerance);
  const value = parseNumberWithOptionalUnit(userText);
  return value !== null && sameNumber(expected, value, tolerance);
}

function matchesFraction(expected, userText, tolerance) {
  const fraction = parseFraction(userText);
  if (fraction) {
    return fraction.num * expected.den === expected.num * fraction.den;
  }
  // Accept the decimal equivalent (some prompts say "as a decimal or fraction").
  const value = parseNumberWithOptionalUnit(userText);
  return value !== null && sameNumber(expected.num / expected.den, value, tolerance);
}

/**
 * Tolerant but non-prefix answer check.
 * @param {number|string} correctAnswer  the stored answer
 * @param {unknown}       userAnswer     raw learner input
 * @param {{ tolerance?: number }} [options]  wider tolerance for rounded answers
 * @returns {boolean}
 */
export function checkDetectiveAnswer(correctAnswer, userAnswer, options = {}) {
  const tolerance = Number(options && options.tolerance) > 0 ? Number(options.tolerance) : TOLERANCE;
  if (correctAnswer === null || correctAnswer === undefined) return false;
  if (userAnswer === null || userAnswer === undefined) return false;

  const correctText = normalizeText(correctAnswer);
  const userText = normalizeText(userAnswer);
  if (userText === '') return false;
  if (userText === correctText) return true;

  const correctFraction = parseFraction(correctText);
  if (correctFraction) return matchesFraction(correctFraction, userText, tolerance);

  if (NUMBER_RE.test(correctText)) {
    const expected = Number(correctText);
    // "What time is it?" with a stored hour: '2:00' and '2 o'clock' mean 2.
    const clock = userText.match(CLOCK_RE);
    if (clock && Number.isInteger(expected) && expected >= 1 && expected <= 12) {
      return Number(clock[1]) === expected;
    }
    return matchesNumber(expected, userText, tolerance);
  }

  const correctExpression = /x/i.test(correctText) ? parseExpression(correctText) : null;
  if (correctExpression) {
    const userExpression = parseExpression(userText);
    return !!userExpression && sameExpression(correctExpression, userExpression, tolerance);
  }

  if (correctText.includes(',')) return matchesList(correctText, userText);

  return textKey(userText) === textKey(correctText);
}

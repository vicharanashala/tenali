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
 *   - one algebraic expression                '12x^2'
 *
 * Rules:
 *   - Numeric answers keep the house tolerance (|diff| < 0.01) and accept a
 *     trailing unit ('15 cm'); arbitrary trailing letters are rejected.
 *   - Fraction answers accept any fraction with the same value and also a
 *     decimal rounded to within tolerance, but never a bare prefix ('5' for
 *     '5/12').
 *   - Coordinate pairs are order-sensitive; root lists are order-insensitive.
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

function sameNumber(a, b) {
  return Math.abs(a - b) < TOLERANCE;
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

function matchesNumber(expected, userText) {
  const fraction = parseFraction(userText);
  if (fraction) return sameNumber(expected, fraction.num / fraction.den);
  const value = parseNumberWithOptionalUnit(userText);
  return value !== null && sameNumber(expected, value);
}

function matchesFraction(expected, userText) {
  const fraction = parseFraction(userText);
  if (fraction) {
    return fraction.num * expected.den === expected.num * fraction.den;
  }
  // Accept the decimal equivalent (some prompts say "as a decimal or fraction").
  const value = parseNumberWithOptionalUnit(userText);
  return value !== null && sameNumber(expected.num / expected.den, value);
}

/**
 * Tolerant but non-prefix answer check.
 * @param {number|string} correctAnswer  the stored answer
 * @param {unknown}       userAnswer     raw learner input
 * @returns {boolean}
 */
export function checkDetectiveAnswer(correctAnswer, userAnswer) {
  if (correctAnswer === null || correctAnswer === undefined) return false;
  if (userAnswer === null || userAnswer === undefined) return false;

  const correctText = normalizeText(correctAnswer);
  const userText = normalizeText(userAnswer);
  if (userText === '') return false;
  if (userText === correctText) return true;

  const correctFraction = parseFraction(correctText);
  if (correctFraction) return matchesFraction(correctFraction, userText);

  if (NUMBER_RE.test(correctText)) return matchesNumber(Number(correctText), userText);

  if (correctText.includes(',')) return matchesList(correctText, userText);

  return textKey(userText) === textKey(correctText);
}

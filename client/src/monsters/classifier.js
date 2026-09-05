/**
 * classifier.js
 *
 * Heuristic pattern matchers for the four Misconception Monsters.
 * Spec: D:\vins-phase-2\tenali-docs-backup\FEATURE_MONSTERS.md v0.2 §3, §5.4.
 *
 * Public surface:
 *   - classifyMonster({ question, userAnswer, correctAnswer, topic })
 *       -> monsterId | null   (first-match-wins, ordered)
 *   - MONSTER_IDS              (array of the four ids in match order)
 *   - MONSTERS_ENABLED         (toggle map; carry-crasher is gated off in v0.2)
 *
 * Each rule is a pure function (question, userAnswer, correctAnswer) -> bool.
 * The classifier is intentionally conservative: false negatives are fine
 * (we miss a monster trigger, no harm), false positives are bad (student
 * sees a wrong explanation, loses trust in the feature).
 *
 * Each rule has a comment block with the spec's example trigger and
 * example non-trigger pair. Update the spec first if the rule changes.
 */

export const MONSTER_IDS = [
  'bracketeer',
  'sign-swapper',
  'decimal-drifter',
  'carry-crasher',
];

// Spec §5.4: carry-crasher gated off in v0.2; turn on only after testing
// shows it fires correctly. Toggle here, not at the call site, so the
// classifier API stays stable.
export const MONSTERS_ENABLED = {
  'bracketeer': true,
  'sign-swapper': true,
  'decimal-drifter': true,
  'carry-crasher': true,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function toFiniteNumber(s) {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  if (typeof s !== 'string') return null;
  // Accept common variants: "3x + 6", "5.0", "-2", "  7  ". We only do
  // numeric checks; algebra parsing is intentionally shallow.
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function toInt(s) {
  if (typeof s === 'number') return Number.isInteger(s) ? s : null;
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!/^-?\d+$/.test(t)) return null;
  return parseInt(t, 10);
}

function normalizeForStringMatch(s) {
  if (s == null) return '';
  return String(s).replace(/\s+/g, ' ').trim();
}

// ─── Rule: Bracketeer (§3.1) ─────────────────────────────────────────────────
// Trigger: question looks like `a(b + c)` where b is a single-letter variable
// and a, c are decimal numbers. Student's answer is the "first term only"
// expansion: kept the `a·b` term but dropped or under-computed the `a·c` term.
//
// Spec example trigger:   question="3(x+2)"  correct="3x + 6"  student="3x + 2"
// Spec example non-trig:  question="3(x+2)"  correct="3x + 6"  student="9"
//
// Implementation note: we are strict about the question shape. We will miss
// questions like `3(x + 2y)` or `(x+2)*3` — those are not bracketeer slips,
// they are different misconception shapes. v2 can add broader rules.
function normalizeAlgebra(str) {
  if (str == null) return '';
  return String(str)
    .replace(/\s+/g, '')
    .replace(/[−]/g, '-')
    .replace(/[*×]/g, '')
    .replace(/[²]/g, '^2')
    .replace(/[¹]/g, '^1')
    .replace(/[⁰]/g, '^0')
    .toLowerCase();
}

function parseCoeff(s) {
  if (!s) return 1;
  if (s === '-') return -1;
  return parseInt(s, 10);
}

function isBracketeerSlip(question, userAnswer, correctAnswer) {
  if (typeof question !== 'string') return false;
  const qNorm = normalizeAlgebra(question);
  const uaNorm = normalizeAlgebra(userAnswer);
  if (!uaNorm) return false;

  // Case 1: Constant Distribution: a(x + c) or a(x - c) or (a)(x + c)
  // e.g. 3(x+2) -> 3x+2, 3x
  // e.g. (5)(x-3) -> 5x-3
  const m1 = /^\(?(-?\d+)\)?\(([a-z])([+-])(\d+)\)$/.exec(qNorm);
  if (m1) {
    const a = parseInt(m1[1], 10);
    const varName = m1[2];
    const innerOp = m1[3];
    const c = parseInt(m1[4], 10);

    const firstTerm = `${a}${varName}`;
    let firstOnlyForm1;
    let firstOnlyForm2;
    if (innerOp === '+') {
      firstOnlyForm1 = `${firstTerm}+${c}`;
      firstOnlyForm2 = firstTerm;
    } else {
      firstOnlyForm1 = `${firstTerm}-${c}`;
      firstOnlyForm2 = firstTerm;
    }
    return uaNorm === firstOnlyForm1 || uaNorm === firstOnlyForm2;
  }

  // Case 2: Linear Term Distribution: ax(bx + c) or ax(bx - c) or (ax)(bx + c)
  // e.g. 6x(x+5) -> 6x^2+5, 6x^2+30, 6x^2+5x
  // e.g. (2x)(6x+6) -> 12x^2+6x
  const m2 = /^\(?(-?\d*)([a-z])\)?\((-?\d*)([a-z])([+-])(\d+)\)$/.exec(qNorm);
  if (m2) {
    const varName1 = m2[2];
    const varName2 = m2[4];
    if (varName1 !== varName2) return false;

    const a = parseCoeff(m2[1]);
    const b = parseCoeff(m2[3]);
    const innerOp = m2[5];
    const c = parseInt(m2[6], 10);

    const ab = a * b;
    const term1 = ab === 1 ? `${varName1}^2` : ab === -1 ? `-${varName1}^2` : `${ab}${varName1}^2`;

    const sign = innerOp;
    const slipA = `${term1}${sign}${c}`;
    const slipB = `${term1}${sign}${Math.abs(a * c)}`;
    const slipC = `${term1}${sign}${c}${varName1}`;

    return uaNorm === slipA || uaNorm === slipB || uaNorm === slipC;
  }

  // Case 3: Double Bracket / FOIL Distribution: (px + a)(qx + b)
  // e.g. (x+3)(x+5) -> x^2+15
  const m3 = /^\((-?\d*)([a-z])([+-])(\d+)\)\((-?\d*)([a-z])([+-])(\d+)\)$/.exec(qNorm);
  if (m3) {
    const varName1 = m3[2];
    const varName2 = m3[6];
    if (varName1 !== varName2) return false;

    const p = parseCoeff(m3[1]);
    const a = m3[3] === '-' ? -parseInt(m3[4], 10) : parseInt(m3[4], 10);
    const q = parseCoeff(m3[5]);
    const b = m3[7] === '-' ? -parseInt(m3[8], 10) : parseInt(m3[8], 10);

    const k = p * q;
    const c = a * b;

    const term1 = k === 1 ? `${varName1}^2` : k === -1 ? `-${varName1}^2` : `${k}${varName1}^2`;
    const sign = c >= 0 ? '+' : '-';
    const slip = c === 0 ? term1 : `${term1}${sign}${Math.abs(c)}`;

    return uaNorm === slip;
  }

  return false;
}

// ─── Rule: Sign Swapper (§3.2) ──────────────────────────────────────────────
// Trigger: student's answer is exactly the negation of the correct answer.
// Spec example trigger:   question="(-3) + 5"  correct="2"  student="-2"
// Spec example non-trig:  question="(-3) + 5"  correct="2"  student="8"
function isSignSwap(question, userAnswer, correctAnswer) {
  const u = toFiniteNumber(userAnswer);
  const c = toFiniteNumber(correctAnswer);
  if (u == null || c == null) return false;
  if (u === c) return false; // not actually wrong
  return u === -c;
}

// ─── Rule: Decimal Drifter (§3.3) ────────────────────────────────────────────
// Trigger: both correct and student are decimals (or parse as decimals),
// and the ratio of |student/correct| is an exact power of 10 (10, 100, 1000, …).
// Spec example trigger:   question="0.5 + 0.3"  correct="0.8"  student="0.08"
// Spec example non-trig:  question="0.5 + 0.3"  correct="0.8"  student="0.7"
function isDecimalDrift(question, userAnswer, correctAnswer) {
  const uStr = normalizeForStringMatch(userAnswer);
  const cStr = normalizeForStringMatch(correctAnswer);
  // Both must look like decimals (contain a "."). Reject integer-typed
  // answers to avoid false-positives on whole-number carry mistakes.
  if (!uStr.includes('.') || !cStr.includes('.')) return false;

  const u = toFiniteNumber(uStr);
  const c = toFiniteNumber(cStr);
  if (u == null || c == null || c === 0) return false;
  if (u === c) return false;

  const ratio = Math.abs(u / c);
  // log10 must be a near-integer; epsilon handles 0.1+0.2-style floats.
  // No lower bound on ratio — the spec example 0.08/0.8 = 0.1 is exactly
  // at the lower edge (10^-1), so we accept any power of 10.
  if (ratio <= 0) return false;
  const lg = Math.log10(ratio);
  return Math.abs(lg - Math.round(lg)) < 1e-9;
}

// ─── Rule: Carry Crasher (§3.4) ──────────────────────────────────────────────
// Trigger: question is a multi-digit addition or subtraction (both operands
// >= 10). Student answer differs from correct by exactly one carry value:
// ±1, ±10, or ±100.
// Spec example trigger:   question="47 + 38"  correct="85"  student="75"
// Spec example non-trig:  question="47 + 38"  correct="85"  student="86"
function isCarryMistake(question, userAnswer, correctAnswer) {
  if (typeof question !== 'string') return false;
  const m = /^\s*(-?\d+)\s*([+\-−])\s*(-?\d+)\s*$/.exec(question.trim());
  if (!m) return false;
  const op1 = parseInt(m[1], 10);
  const op2 = parseInt(m[3], 10);
  if (op1 < 10 || op2 < 10) return false;

  const u = toInt(userAnswer);
  const c = toInt(correctAnswer);
  if (u == null || c == null) return false;
  if (u === c) return false;

  const diff = Math.abs(u - c);
  return diff === 1 || diff === 10 || diff === 100;
}

// ─── Public classifier ──────────────────────────────────────────────────────

const RULES = [
  { id: 'bracketeer', matches: isBracketeerSlip },
  { id: 'sign-swapper', matches: isSignSwap },
  { id: 'decimal-drifter', matches: isDecimalDrift },
  { id: 'carry-crasher', matches: isCarryMistake },
];

/**
 * Classify a wrong-answer pair into a monsterId, or null if no rule matches.
 *
 * @param {object} input
 * @param {string|undefined} input.question       question text
 * @param {string|number|undefined} input.userAnswer   what the student submitted
 * @param {string|number|undefined} input.correctAnswer  the correct value
 * @param {string|undefined} input.topic            module slug (unused for now,
 *                                                 kept in the signature for v2
 *                                                 tag-driven gating)
 * @returns {string|null}  one of MONSTER_IDS or null
 */
export function classifyMonster({ question, userAnswer, correctAnswer, topic } = {}) {
  for (const { id, matches } of RULES) {
    if (!MONSTERS_ENABLED[id]) continue;
    if (matches(question, userAnswer, correctAnswer)) return id;
  }
  return null;
}

/**
 * Diagnostic — is this monster id currently enabled?
 * Used by the fetch interceptor to short-circuit before calling classifyMonster
 * (small optimization, not strictly required).
 */
export function isMonsterEnabled(monsterId) {
  return MONSTERS_ENABLED[monsterId] === true;
}

/**
 * Arithmetic / BODMAS Problem Generator (Easy Escape — Classes 6-7 CBSE)
 * Subtypes:
 *  1. 'of-mixed'            : a + b of c − d × e
 *  2. 'four-level-brackets' : a − [b − {c + (d − e)}]
 *  3. 'negative-integers'   : (−a) + (−b) ÷ (−c) × d
 */

const MAX_ATTEMPTS = 500;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Subtype 1: BODMAS with "of" operator + mixed operations
 * Template: a + b of c − d × e
 * Guarantees answer !== naive left-to-right evaluation ((a + b) * c − d) * e.
 */
export function generateOfMixed(config = {}) {
  const [minAns, maxAns] = config.answerRange || [5, 50];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const b = randomInt(2, 8);
    const c = randomInt(2, 6);
    const d = randomInt(2, 6);
    const e = randomInt(2, 6);

    const bOfC = b * c;
    const dTimesE = d * e;
    const target = randomInt(minAns, maxAns);
    const a = target - bOfC + dTimesE;

    if (a < 2 || a > 30) continue;

    const answer = a + bOfC - dTimesE;
    const naiveLeftToRight = ((a + b) * c - d) * e;
    const naiveOfOnly = (a + b) * c - dTimesE;

    if (
      Number.isInteger(answer) &&
      answer >= minAns &&
      answer <= maxAns &&
      answer !== naiveLeftToRight &&
      answer !== naiveOfOnly
    ) {
      return {
        subtype: 'of-mixed',
        prompt: "Simplify using BODMAS (remember 'of' comes before × and ÷):",
        expression: `${a} + ${b} of ${c} − ${d} × ${e}`,
        answer,
        variables: {
          a,
          b,
          c,
          d,
          e,
          b_of_c: bOfC,
          d_times_e: dTimesE,
          answer,
        },
        steps: [
          `Evaluate 'of' first: ${b} of ${c} = ${b} × ${c} = ${bOfC}`,
          `Evaluate multiplication next: ${d} × ${e} = ${dTimesE}`,
          `Now simplify left to right: ${a} + ${bOfC} − ${dTimesE} = ${a + bOfC} − ${dTimesE} = ${answer}`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'of-mixed',
    prompt: "Simplify using BODMAS (remember 'of' comes before × and ÷):",
    expression: '12 + 5 of 4 − 3 × 6',
    answer: 14,
    variables: {
      a: 12,
      b: 5,
      c: 4,
      d: 3,
      e: 6,
      b_of_c: 20,
      d_times_e: 18,
      answer: 14,
    },
    steps: [
      "Evaluate 'of' first: 5 of 4 = 5 × 4 = 20",
      'Evaluate multiplication next: 3 × 6 = 18',
      'Now simplify left to right: 12 + 20 − 18 = 32 − 18 = 14',
    ],
  };
}

/**
 * Subtype 2: Nested brackets — a − [b − {c + (d − e)}]
 * Guarantees positive integer result and answer !== flat evaluation without brackets.
 */
export function generateFourLevelBrackets(config = {}) {
  const [minAns, maxAns] = config.answerRange || [10, 50];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const e = randomInt(2, 9);
    const d = randomInt(e + 2, e + 10);
    const inner = d - e;
    const c = randomInt(5, 18);
    const mid = c + inner;
    const b = randomInt(mid + 2, mid + 16);
    const outer = b - mid;
    const a = randomInt(outer + minAns, outer + Math.min(maxAns, 40));
    const answer = a - outer;
    const flatEval = a - b - c + d - e;

    if (
      Number.isInteger(answer) &&
      answer >= minAns &&
      answer <= maxAns &&
      answer > 0 &&
      answer !== flatEval
    ) {
      return {
        subtype: 'four-level-brackets',
        prompt: 'Evaluate by simplifying from the innermost bracket outward:',
        expression: `${a} − [${b} − {${c} + (${d} − ${e})}]`,
        answer,
        variables: {
          a,
          b,
          c,
          d,
          e,
          inner,
          mid,
          outer,
          answer,
        },
        steps: [
          `Innermost parentheses: (${d} − ${e}) = ${inner}`,
          `Curly braces: {${c} + ${inner}} = ${mid}`,
          `Square brackets: [${b} − ${mid}] = ${outer}`,
          `Final subtraction: ${a} − ${outer} = ${answer}`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'four-level-brackets',
    prompt: 'Evaluate by simplifying from the innermost bracket outward:',
    expression: '30 − [26 − {15 + (8 − 3)}]',
    answer: 24,
    variables: {
      a: 30,
      b: 26,
      c: 15,
      d: 8,
      e: 3,
      inner: 5,
      mid: 20,
      outer: 6,
      answer: 24,
    },
    steps: [
      'Innermost parentheses: (8 − 3) = 5',
      'Curly braces: {15 + 5} = 20',
      'Square brackets: [26 − 20] = 6',
      'Final subtraction: 30 − 6 = 24',
    ],
  };
}

/**
 * Subtype 3: Integer BODMAS with negative numbers
 * Template: (−a) + (−b) ÷ (−c) × d
 * Guarantees clean integer division and valid negative or positive integer answer.
 */
export function generateNegativeIntegers(config = {}) {
  const [minAns, maxAns] = config.answerRange || [-30, 30];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const c = randomInt(2, 7);
    const divResult = randomInt(2, 6);
    const b = c * divResult;
    const d = randomInt(2, 5);
    const mulResult = divResult * d;
    const a = randomInt(6, 30);
    const answer = -a + mulResult;

    // Avoid trivial 0 answer and ensure clean division
    if (
      Number.isInteger(answer) &&
      answer !== 0 &&
      answer >= minAns &&
      answer <= maxAns
    ) {
      return {
        subtype: 'negative-integers',
        prompt: 'Evaluate the expression (watch the negative sign rules):',
        expression: `(−${a}) + (−${b}) ÷ (−${c}) × ${d}`,
        answer,
        variables: {
          a,
          b,
          c,
          d,
          neg_a: -a,
          neg_b: -b,
          neg_c: -c,
          div_result: divResult,
          mul_result: mulResult,
          answer,
        },
        steps: [
          `Division first (negative ÷ negative = positive): (−${b}) ÷ (−${c}) = +${divResult}`,
          `Multiply next: ${divResult} × ${d} = ${mulResult}`,
          `Finally add: (−${a}) + ${mulResult} = ${answer}`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'negative-integers',
    prompt: 'Evaluate the expression (watch the negative sign rules):',
    expression: '(−20) + (−8) ÷ (−2) × 3',
    answer: -8,
    variables: {
      a: 20,
      b: 8,
      c: 2,
      d: 3,
      neg_a: -20,
      neg_b: -8,
      neg_c: -2,
      div_result: 4,
      mul_result: 12,
      answer: -8,
    },
    steps: [
      'Division first (negative ÷ negative = positive): (−8) ÷ (−2) = +4',
      'Multiply next: 4 × 3 = 12',
      'Finally add: (−20) + 12 = −8',
    ],
  };
}

export const ARITHMETIC_SUBTYPES = {
  'of-mixed': generateOfMixed,
  'four-level-brackets': generateFourLevelBrackets,
  'negative-integers': generateNegativeIntegers,
};

export function generateArithmeticProblem(subtype, config = {}) {
  const generator = ARITHMETIC_SUBTYPES[subtype];
  if (!generator) {
    throw new Error(`Unknown arithmetic subtype: "${subtype}"`);
  }
  return generator(config);
}

export default generateArithmeticProblem;
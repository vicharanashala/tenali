/**
 * Linear Equation Problem Generator (Medium Escape — Classes 8-9 CBSE HOTS)
 * Subtypes:
 *  1. 'brackets-both-sides' : a(x + b) = cx + d
 *  2. 'fraction-cross'      : (ax + b)/c = (dx + e)/f
 *  3. 'age-word'            : Indian student names age word problem
 *  4. 'digit-reversal'      : 2-digit number sum & reversed difference
 *  5. 'fraction-word'       : Numerator/denominator conditions (code = numerator)
 */

const MAX_ATTEMPTS = 500;

const NAME_PAIRS = [
  ['Ravi', 'Priya'],
  ['Aarav', 'Ananya'],
  ['Kabir', 'Meera'],
  ['Rohan', 'Diya'],
  ['Vikram', 'Kavya'],
  ['Aditya', 'Sneha'],
  ['Siddharth', 'Neha'],
];

const MULTIPLIER_WORDS = {
  2: 'twice',
  3: 'three times',
  4: 'four times',
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function formatLinearTerm(coeff, constant) {
  const xPart = coeff === 1 ? 'x' : `${coeff}x`;
  return `${xPart} + ${constant}`;
}

/**
 * Subtype 1: Brackets + variable on both sides
 * Template: a(x + b) = cx + d
 */
export function generateBracketsBothSides() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const x = randomInt(2, 14);
    const a = randomInt(2, 7);
    const b = randomInt(1, 9);
    const c = randomInt(1, a - 1);
    const d = a * (x + b) - c * x;

    if (d >= 1 && d <= 95 && a * (x + b) === c * x + d) {
      const ab = a * b;
      const diffCoeff = a - c;
      const rhsDiff = d - ab;
      const rhsExpr = formatLinearTerm(c, d);

      return {
        subtype: 'brackets-both-sides',
        prompt: 'Solve for x:',
        expression: `${a}(x + ${b}) = ${rhsExpr}`,
        answer: x,
        variables: {
          a,
          b,
          c,
          d,
          ab,
          diff_coeff: diffCoeff,
          rhs_diff: rhsDiff,
          answer: x,
        },
        steps: [
          `Expand the left bracket: ${a}x + ${ab} = ${rhsExpr}`,
          `Group x terms on the left and constants on the right: ${a}x − ${c === 1 ? 'x' : `${c}x`} = ${d} − ${ab}`,
          `Simplify: ${diffCoeff === 1 ? 'x' : `${diffCoeff}x`} = ${rhsDiff}`,
          `Divide to solve: x = ${x}`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'brackets-both-sides',
    prompt: 'Solve for x:',
    expression: '3(x + 4) = x + 20',
    answer: 4,
    variables: {
      a: 3,
      b: 4,
      c: 1,
      d: 20,
      ab: 12,
      diff_coeff: 2,
      rhs_diff: 8,
      answer: 4,
    },
    steps: [
      'Expand the left bracket: 3x + 12 = x + 20',
      'Group x terms on the left and constants on the right: 3x − x = 20 − 12',
      'Simplify: 2x = 8',
      'Divide to solve: x = 4',
    ],
  };
}

/**
 * Subtype 2: Fraction equation requiring cross-multiplication
 * Template: (ax + b)/c = (dx + e)/f
 */
export function generateFractionCross() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const x = randomInt(2, 15);
    const a = randomInt(1, 4);
    const b = randomInt(1, 9);
    const c = randomInt(2, 7);
    const d = randomInt(1, 4);
    const f = randomInt(2, 7);

    if (c === f || f * a === c * d) continue;

    const numeratorForE = f * (a * x + b) - c * d * x;
    if (numeratorForE % c !== 0) continue;

    const e = numeratorForE / c;
    if (!Number.isInteger(e) || e < 1 || e > 15) continue;

    const lhsNum = formatLinearTerm(a, b);
    const rhsNum = formatLinearTerm(d, e);
    const fa = f * a;
    const fb = f * b;
    const cd = c * d;
    const ce = c * e;

    return {
      subtype: 'fraction-cross',
      prompt: 'Solve for x:',
      expression: `(${lhsNum})/${c} = (${rhsNum})/${f}`,
      answer: x,
      variables: {
        a,
        b,
        c,
        d,
        e,
        f,
        lhs_num: lhsNum,
        rhs_num: rhsNum,
        fa,
        fb,
        cd,
        ce,
        answer: x,
      },
      steps: [
        `Cross-multiply to clear fractions: ${f}(${lhsNum}) = ${c}(${rhsNum})`,
        `Expand both sides: ${fa}x + ${fb} = ${cd}x + ${ce}`,
        `Group like terms: ${fa - cd}x = ${ce - fb}`,
        `Solve for x: x = ${x}`,
      ],
    };
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'fraction-cross',
    prompt: 'Solve for x:',
    expression: '(2x + 3)/5 = (x + 4)/3',
    answer: 11,
    variables: {
      a: 2,
      b: 3,
      c: 5,
      d: 1,
      e: 4,
      f: 3,
      lhs_num: '2x + 3',
      rhs_num: 'x + 4',
      fa: 6,
      fb: 9,
      cd: 5,
      ce: 20,
      answer: 11,
    },
    steps: [
      'Cross-multiply to clear fractions: 3(2x + 3) = 5(x + 4)',
      'Expand both sides: 6x + 9 = 5x + 20',
      'Group like terms: 6x − 5x = 20 − 9',
      'Solve for x: x = 11',
    ],
  };
}

/**
 * Subtype 3: Age word problem with relatable Indian student names
 * Answer = younger student's present age.
 */
export function generateAgeWord() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const youngAge = randomInt(3, 14);
    const yearsLater = randomInt(2, 8);
    const multiplier = randomInt(2, 4);
    const ageDiff = (multiplier - 1) * (youngAge + yearsLater);

    if (ageDiff < 4 || ageDiff > 28) continue;

    const oldAge = youngAge + ageDiff;
    if (oldAge + yearsLater !== multiplier * (youngAge + yearsLater)) continue;

    const [olderName, youngerName] = NAME_PAIRS[randomInt(0, NAME_PAIRS.length - 1)];
    const multWord = MULTIPLIER_WORDS[multiplier];

    return {
      subtype: 'age-word',
      prompt: `Find ${youngerName}'s present age:`,
      expression: `${olderName} is ${ageDiff} years older than ${youngerName}. In ${yearsLater} years, ${olderName} will be ${multWord} ${youngerName}'s age.`,
      answer: youngAge,
      variables: {
        older_name: olderName,
        younger_name: youngerName,
        age_diff: ageDiff,
        years_later: yearsLater,
        multiplier,
        mult_word: multWord,
        old_age: oldAge,
        answer: youngAge,
      },
      steps: [
        `Let ${youngerName}'s present age be x. Then ${olderName}'s present age is x + ${ageDiff}.`,
        `In ${yearsLater} years: (x + ${ageDiff} + ${yearsLater}) = ${multiplier}(x + ${yearsLater})`,
        `Simplify: x + ${ageDiff + yearsLater} = ${multiplier}x + ${multiplier * yearsLater}`,
        `Solve: ${multiplier - 1}x = ${ageDiff + yearsLater - multiplier * yearsLater} → x = ${youngAge}`,
      ],
    };
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'age-word',
    prompt: "Find Priya's present age:",
    expression:
      "Ravi is 6 years older than Priya. In 4 years, Ravi will be twice Priya's age.",
    answer: 2,
    variables: {
      older_name: 'Ravi',
      younger_name: 'Priya',
      age_diff: 6,
      years_later: 4,
      multiplier: 2,
      mult_word: 'twice',
      old_age: 8,
      answer: 2,
    },
    steps: [
      "Let Priya's present age be x. Then Ravi's present age is x + 6.",
      'In 4 years: (x + 6 + 4) = 2(x + 4)',
      'Simplify: x + 10 = 2x + 8',
      'Solve: x = 2',
    ],
  };
}

/**
 * Subtype 4: Two-digit number digit-reversal word problem
 * Answer = original 2-digit number (10t + u where u > t).
 */
export function generateDigitReversal() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const tens = randomInt(1, 7);
    const units = randomInt(tens + 1, 9);
    const digitSum = tens + units;
    const original = 10 * tens + units;
    const reversed = 10 * units + tens;
    const diff = reversed - original;
    const digitDiff = units - tens;

    if (diff > 0 && diff % 9 === 0 && original >= 12 && original <= 89) {
      return {
        subtype: 'digit-reversal',
        prompt: 'Find the original 2-digit number:',
        expression: `The sum of the digits of a 2-digit number is ${digitSum}. When the digits are reversed, the new number is ${diff} more than the original number.`,
        answer: original,
        variables: {
          tens,
          units,
          digit_sum: digitSum,
          diff,
          digit_diff: digitDiff,
          reversed,
          answer: original,
        },
        steps: [
          `Let tens digit = x and units digit = y, so x + y = ${digitSum} and number = 10x + y.`,
          `Reversing gives 10y + x. Condition: (10y + x) − (10x + y) = ${diff} → 9(y − x) = ${diff} → y − x = ${digitDiff}.`,
          `Add x + y = ${digitSum} and y − x = ${digitDiff}: 2y = ${digitSum + digitDiff} → y = ${units}, x = ${tens}.`,
          `Original 2-digit number = 10(${tens}) + ${units} = ${original}.`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'digit-reversal',
    prompt: 'Find the original 2-digit number:',
    expression:
      'The sum of the digits of a 2-digit number is 9. When the digits are reversed, the new number is 27 more than the original number.',
    answer: 36,
    variables: {
      tens: 3,
      units: 6,
      digit_sum: 9,
      diff: 27,
      digit_diff: 3,
      reversed: 63,
      answer: 36,
    },
    steps: [
      'Let tens digit = x and units digit = y, so x + y = 9 and number = 10x + y.',
      'Reversing gives 10y + x. Condition: 9(y − x) = 27 → y − x = 3.',
      'Solving x + y = 9 and y − x = 3 gives y = 6 and x = 3.',
      'Original 2-digit number = 36.',
    ],
  };
}

/**
 * Subtype 5: Fraction conditions word problem
 * Answer = numerator of the original irreducible proper fraction.
 */
export function generateFractionWord() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const b = randomInt(2, 4);
    const d = randomInt(b + 1, b + 3);
    const numerator = randomInt(2, 9);
    const addNum = randomInt(1, 5);
    const denominator = b * (numerator + addNum);
    const subDen = denominator - d * numerator;

    if (
      subDen >= 1 &&
      subDen <= 8 &&
      numerator < denominator &&
      gcd(numerator, denominator) === 1
    ) {
      return {
        subtype: 'fraction-word',
        prompt: 'Find the numerator of the original fraction:',
        expression: `If ${addNum} is added to the numerator of a fraction, it becomes 1/${b}. If ${subDen} is subtracted from its denominator, it becomes 1/${d}.`,
        answer: numerator,
        variables: {
          add_num: addNum,
          b,
          sub_den: subDen,
          d,
          numerator,
          denominator,
          answer: numerator,
        },
        steps: [
          `Let the fraction be n/D. Condition 1: (n + ${addNum})/D = 1/${b} → D = ${b}n + ${b * addNum}.`,
          `Condition 2: n/(D − ${subDen}) = 1/${d} → D = ${d}n + ${subDen}.`,
          `Equate both expressions for D: ${d}n + ${subDen} = ${b}n + ${b * addNum} → ${d - b}n = ${b * addNum - subDen}.`,
          `Solve: n = ${numerator} (and D = ${denominator}, so fraction is ${numerator}/${denominator}). Code = ${numerator}.`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'fraction-word',
    prompt: 'Find the numerator of the original fraction:',
    expression:
      'If 2 is added to the numerator of a fraction, it becomes 1/2. If 1 is subtracted from its denominator, it becomes 1/3.',
    answer: 3,
    variables: {
      add_num: 2,
      b: 2,
      sub_den: 1,
      d: 3,
      numerator: 3,
      denominator: 10,
      answer: 3,
    },
    steps: [
      'Let the fraction be n/D. Condition 1: (n + 2)/D = 1/2 → D = 2n + 4.',
      'Condition 2: n/(D − 1) = 1/3 → D = 3n + 1.',
      'Equate D: 3n + 1 = 2n + 4 → n = 3.',
      'Original fraction is 3/10. Lock code (numerator) = 3.',
    ],
  };
}

export const LINEAR_SUBTYPES = {
  'brackets-both-sides': generateBracketsBothSides,
  'fraction-cross': generateFractionCross,
  'age-word': generateAgeWord,
  'digit-reversal': generateDigitReversal,
  'fraction-word': generateFractionWord,
};

export function generateLinearEqProblem(subtype, config = {}) {
  const generator = LINEAR_SUBTYPES[subtype];
  if (!generator) {
    throw new Error(`Unknown linear equation subtype: "${subtype}"`);
  }
  return generator(config);
}

export default generateLinearEqProblem;
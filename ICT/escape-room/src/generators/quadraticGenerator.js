/**
 * Quadratic Equation Problem Generator (Hard Escape — Class 10 CBSE Board HOTS)
 * Subtypes:
 *  1. 'factoring-mixed-signs' : x² + bx + c = 0 (mixed-sign integer roots, find positive root)
 *  2. 'reducible-fraction'    : 1/(x + a) − 1/(x − b) = c/d (find sum of roots)
 *  3. 'find-k-equal-roots'    : (k + a)x² + (k + b)x + c = 0 has equal roots (D = 0), find positive k
 *  4. 'two-squares-word'      : Sum of areas & difference of perimeters, find smaller side
 *  5. 'speed-distance-word'   : Train covers D km, S km/h faster saves T hours, find original speed
 *  6. 'radical-extraneous'    : √(ax + b) + x = c (guaranteed 1 valid + 1 extraneous integer root)
 *  7. 'commerce-profit-word'  : Item sold for ₹P where Profit% = Cost Price, find CP
 */

const MAX_ATTEMPTS = 500;

const COMMERCE_ITEMS = [
  'a toy',
  'a wristwatch',
  'a scientific calculator',
  'a geometry kit',
  'a cricket bat',
  'a fountain pen',
  'a desk lamp',
];

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

function formatSignedTerm(value, suffix = '') {
  if (value >= 0) return `+ ${value}${suffix}`;
  return `− ${Math.abs(value)}${suffix}`;
}

function formatXCoeff(b) {
  if (b === 1) return '+ x';
  if (b === -1) return '− x';
  return b > 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
}

/**
 * Subtype 1: Middle-term splitting with mixed-sign integer roots
 * Answer = positive root.
 */
export function generateFactoringMixedSigns() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const posRoot = randomInt(4, 14);
    const negAbs = randomInt(2, 11);
    if (posRoot === negAbs) continue; // Keep b !== 0 for genuine middle-term splitting

    const negRoot = -negAbs;
    const b = -(posRoot + negRoot);
    const c = posRoot * negRoot;

    if (
      b !== 0 &&
      c < 0 &&
      posRoot * posRoot + b * posRoot + c === 0 &&
      negRoot * negRoot + b * negRoot + c === 0
    ) {
      return {
        subtype: 'factoring-mixed-signs',
        prompt: 'Solve by splitting the middle term and enter the positive root:',
        expression: `x² ${formatXCoeff(b)} ${formatSignedTerm(c)} = 0`,
        answer: posRoot,
        variables: {
          b,
          c,
          pos_root: posRoot,
          neg_root: negRoot,
          neg_abs: negAbs,
          answer: posRoot,
        },
        steps: [
          `Find two integers that multiply to ${c} and add to ${b}: −${posRoot} and +${negAbs}.`,
          `Factor: (x − ${posRoot})(x + ${negAbs}) = 0`,
          `Roots: x = ${posRoot} or x = ${negRoot}.`,
          `Positive root = ${posRoot}.`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'factoring-mixed-signs',
    prompt: 'Solve by splitting the middle term and enter the positive root:',
    expression: 'x² − 3x − 28 = 0',
    answer: 7,
    variables: {
      b: -3,
      c: -28,
      pos_root: 7,
      neg_root: -4,
      neg_abs: 4,
      answer: 7,
    },
    steps: [
      'Find two integers that multiply to −28 and add to −3: −7 and +4.',
      'Factor: (x − 7)(x + 4) = 0',
      'Roots: x = 7 or x = −4.',
      'Positive root = 7.',
    ],
  };
}

/**
 * Subtype 2: Fraction equation reducible to quadratic
 * Template: 1/(x + a) − 1/(x − b) = c/d
 * Answer = sum of the two integer roots.
 */
export function generateReducibleFraction() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const r1 = randomInt(1, 5);
    const r2 = randomInt(r1 + 1, r1 + 5);
    const sumRoots = r1 + r2;
    const prodRoots = r1 * r2;

    const a = randomInt(2, 7);
    const b = a + sumRoots; // Ensures b - a = r1 + r2 and r1, r2 lie strictly in (-a, b)
    const k = a * b + prodRoots; // Ensures (x + a)(x - b) = -k → x² - (r1+r2)x + r1*r2 = 0
    const numRaw = a + b;
    const g = gcd(numRaw, k);
    const c = numRaw / g;
    const d = k / g;

    const validR1 = d * -(a + b) === c * (r1 + a) * (r1 - b);
    const validR2 = d * -(a + b) === c * (r2 + a) * (r2 - b);

    if (validR1 && validR2 && d <= 120) {
      return {
        subtype: 'reducible-fraction',
        prompt: 'Solve the equation and enter the sum of both roots:',
        expression: `1/(x + ${a}) − 1/(x − ${b}) = ${c}/${d}`,
        answer: sumRoots,
        variables: {
          a,
          b,
          c,
          d,
          r1,
          r2,
          sum_roots: sumRoots,
          prod_roots: prodRoots,
          k,
          answer: sumRoots,
        },
        steps: [
          `Combine the left-hand fractions: [(x − ${b}) − (x + ${a})] / [(x + ${a})(x − ${b})] = ${c}/${d}`,
          `Simplify numerator to −${a + b} and cross-multiply: (x + ${a})(x − ${b}) = −${k}`,
          `Expand to quadratic form: x² − ${sumRoots}x + ${prodRoots} = 0`,
          `Factor: (x − ${r1})(x − ${r2}) = 0 → x = ${r1} or x = ${r2}. Sum = ${r1} + ${r2} = ${sumRoots}.`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'reducible-fraction',
    prompt: 'Solve the equation and enter the sum of both roots:',
    expression: '1/(x + 4) − 1/(x − 7) = 11/30',
    answer: 3,
    variables: {
      a: 4,
      b: 7,
      c: 11,
      d: 30,
      r1: 1,
      r2: 2,
      sum_roots: 3,
      prod_roots: 2,
      k: 30,
      answer: 3,
    },
    steps: [
      'Combine the left-hand fractions: [(x − 7) − (x + 4)] / [(x + 4)(x − 7)] = 11/30',
      'Simplify numerator to −11 and cross-multiply: (x + 4)(x − 7) = −30',
      'Expand to quadratic form: x² − 3x + 2 = 0',
      'Factor: (x − 1)(x − 2) = 0 → x = 1 or x = 2. Sum = 3.',
    ],
  };
}

/**
 * Subtype 3: Parametric discriminant (equal roots, D = 0)
 * Template: (k + a)x² + (k + b)x + c = 0 has equal roots.
 * Answer = unique positive integer k.
 */
export function generateFindKEqualRoots() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const c = randomInt(1, 2);
    const kPos = randomInt(2, 10);
    const kNeg = -randomInt(1, 7);

    // Ensure kPos + kNeg is even so b = 2c - (kPos + kNeg)/2 is an integer
    if ((kPos + kNeg) % 2 !== 0) continue;

    const b = 2 * c - (kPos + kNeg) / 2;
    const numeratorForA = b * b - kPos * kNeg;
    if (numeratorForA % (4 * c) !== 0) continue;

    const a = numeratorForA / (4 * c);
    if (a < 1 || a > 15 || kPos + a === 0) continue;

    const discAtPos = (kPos + b) ** 2 - 4 * (kPos + a) * c;
    const discAtNeg = (kNeg + b) ** 2 - 4 * (kNeg + a) * c;
    if (discAtPos !== 0 || discAtNeg !== 0) continue;

    const bExpr = b === 0 ? 'k' : `(k ${formatSignedTerm(b)})`;
    const kMidCoeff = 2 * b - 4 * c;
    const kConst = b * b - 4 * a * c;

    return {
      subtype: 'find-k-equal-roots',
      prompt: 'Find the positive value of k for which this quadratic has equal roots (D = 0):',
      expression: `(k + ${a})x² + ${bExpr}x + ${c} = 0`,
      answer: kPos,
      variables: {
        a,
        b,
        c,
        k_pos: kPos,
        k_neg: kNeg,
        answer: kPos,
      },
      steps: [
        'For equal roots, set the discriminant D = B² − 4AC = 0.',
        `Substitute A = k + ${a}, B = ${bExpr}, C = ${c}: ${bExpr}² − 4(k + ${a})(${c}) = 0`,
        `Expand: k² ${formatXCoeff(kMidCoeff).replace('x', 'k')} ${formatSignedTerm(kConst)} = 0`,
        `Factor: (k − ${kPos})(k + ${Math.abs(kNeg)}) = 0 → k = ${kPos} or k = ${kNeg}. Positive k = ${kPos}.`,
      ],
    };
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'find-k-equal-roots',
    prompt: 'Find the positive value of k for which this quadratic has equal roots (D = 0):',
    expression: '(k + 4)x² + (k + 1)x + 1 = 0',
    answer: 5,
    variables: {
      a: 4,
      b: 1,
      c: 1,
      k_pos: 5,
      k_neg: -3,
      answer: 5,
    },
    steps: [
      'For equal roots, set the discriminant D = B² − 4AC = 0.',
      'Substitute: (k + 1)² − 4(k + 4)(1) = 0',
      'Expand: k² − 2k − 15 = 0',
      'Factor: (k − 5)(k + 3) = 0 → k = 5 or k = −3. Positive k = 5.',
    ],
  };
}

/**
 * Subtype 4: Geometry word problem (sum of areas & difference of perimeters of two squares)
 * Answer = side length of the smaller square.
 */
export function generateTwoSquaresWord() {
  const s1 = randomInt(5, 18);
  const diff = randomInt(2, 9);
  const s2 = s1 + diff;
  const sumAreas = s1 * s1 + s2 * s2;
  const diffPerim = 4 * diff;
  const product = s1 * s2;

  return {
    subtype: 'two-squares-word',
    prompt: 'Find the side length (in m) of the smaller square:',
    expression: `The sum of the areas of two squares is ${sumAreas} m². The difference of their perimeters is ${diffPerim} m.`,
    answer: s1,
    variables: {
      s1,
      s2,
      diff,
      sum_areas: sumAreas,
      diff_perim: diffPerim,
      product,
      answer: s1,
    },
    steps: [
      `Let the smaller side be x m. Perimeter difference = ${diffPerim} m → side difference = ${diffPerim}/4 = ${diff} m, so larger side = x + ${diff}.`,
      `Sum of areas: x² + (x + ${diff})² = ${sumAreas}`,
      `Simplify and divide by 2: x² + ${diff}x − ${product} = 0`,
      `Factor: (x + ${s2})(x − ${s1}) = 0 → x = ${s1} m (reject negative side).`,
    ],
  };
}

/**
 * Subtype 5: Speed-distance train word problem
 * Template: Train covers D km; S km/h faster saves T hours.
 * Answer = original speed (km/h).
 */
export function generateSpeedDistanceWord() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const speed = 5 * randomInt(4, 13); // 20..65 km/h
    const extraSpeed = 5 * randomInt(1, 3); // 5, 10, or 15 km/h
    const timeSaved = randomInt(1, 3);

    const numerator = timeSaved * speed * (speed + extraSpeed);
    if (numerator % extraSpeed !== 0) continue;

    const distance = numerator / extraSpeed;
    if (distance < 120 || distance > 1200) continue;

    const product = speed * (speed + extraSpeed);
    const hourWord = timeSaved === 1 ? '1 hour' : `${timeSaved} hours`;

    return {
      subtype: 'speed-distance-word',
      prompt: 'Find the original speed of the train (in km/h):',
      expression: `A train covers ${distance} km at a uniform speed. If the speed had been ${extraSpeed} km/h more, it would have taken ${hourWord} less for the same journey.`,
      answer: speed,
      variables: {
        distance,
        extra_speed: extraSpeed,
        time_saved: timeSaved,
        speed,
        new_speed: speed + extraSpeed,
        product,
        answer: speed,
      },
      steps: [
        `Let original speed = x km/h. Time difference: ${distance}/x − ${distance}/(x + ${extraSpeed}) = ${timeSaved}`,
        `Combine fractions: ${distance} × ${extraSpeed} = ${timeSaved}x(x + ${extraSpeed})`,
        `Form quadratic: x² + ${extraSpeed}x − ${product} = 0`,
        `Factor: (x + ${speed + extraSpeed})(x − ${speed}) = 0 → x = ${speed} km/h (reject negative speed).`,
      ],
    };
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'speed-distance-word',
    prompt: 'Find the original speed of the train (in km/h):',
    expression:
      'A train covers 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less for the same journey.',
    answer: 40,
    variables: {
      distance: 360,
      extra_speed: 5,
      time_saved: 1,
      speed: 40,
      new_speed: 45,
      product: 1800,
      answer: 40,
    },
    steps: [
      'Let original speed = x km/h. Time difference: 360/x − 360/(x + 5) = 1',
      'Combine fractions: 360 × 5 = x(x + 5)',
      'Form quadratic: x² + 5x − 1800 = 0',
      'Factor: (x + 45)(x − 40) = 0 → x = 40 km/h (reject negative speed).',
    ],
  };
}

/**
 * Subtype 6: Radical equation with GUARANTEED 1 valid integer root AND 1 extraneous integer root
 * Template: √(ax + b) + x = c
 * Algebraic proof:
 *   Let s = √(a*xValid + b) >= 2 and c = s + xValid.
 *   Squaring yields x² − (2c + a)x + (c² − b) = 0.
 *   Second root is xExtraneous = xValid + 2s + a.
 *   Then a*xExtraneous + b = (s + a)² (perfect square), so √(a*xExtraneous + b) + xExtraneous = c + 2s + 2a ≠ c.
 */
export function generateRadicalExtraneous() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const a = randomInt(1, 3);
    const xValid = randomInt(3, 12);
    const minS = Math.ceil(Math.sqrt(a * xValid + 1));
    const s = randomInt(Math.max(3, minS), Math.max(5, minS + 4));
    const b = s * s - a * xValid;

    if (b < 1 || b > 40) continue;

    const c = s + xValid;
    const xExtraneous = xValid + 2 * s + a;
    const quadB = -(2 * c + a);
    const quadC = c * c - b;

    const validCheck = Math.sqrt(a * xValid + b) + xValid === c;
    const extraneousQuadCheck = xExtraneous * xExtraneous + quadB * xExtraneous + quadC === 0;
    const extraneousLhs = Math.sqrt(a * xExtraneous + b) + xExtraneous;
    const isTrulyExtraneous = extraneousLhs !== c;

    if (validCheck && extraneousQuadCheck && isTrulyExtraneous) {
      const innerExpr = a === 1 ? `x + ${b}` : `${a}x + ${b}`;
      return {
        subtype: 'radical-extraneous',
        prompt: 'Solve for x (check both roots in the original equation to reject extraneous roots):',
        expression: `√(${innerExpr}) + x = ${c}`,
        answer: xValid,
        variables: {
          a,
          b,
          c,
          s,
          quad_b: quadB,
          quad_c: quadC,
          x_valid: xValid,
          extraneous: xExtraneous,
          extraneous_lhs: extraneousLhs,
          answer: xValid,
        },
        steps: [
          `Isolate the square root: √(${innerExpr}) = ${c} − x`,
          `Square both sides: ${innerExpr} = (${c} − x)² → x² − ${2 * c + a}x + ${quadC} = 0`,
          `Factor: (x − ${xValid})(x − ${xExtraneous}) = 0 → x = ${xValid} or x = ${xExtraneous}`,
          `Check x = ${xExtraneous}: √(${a}×${xExtraneous} + ${b}) + ${xExtraneous} = ${extraneousLhs} ≠ ${c} → REJECTED (extraneous).`,
          `Check x = ${xValid}: √(${a}×${xValid} + ${b}) + ${xValid} = ${c} ✓. Valid answer: x = ${xValid}.`,
        ],
      };
    }
  }

  // Deterministic CBSE-verified fallback
  return {
    subtype: 'radical-extraneous',
    prompt: 'Solve for x (check both roots in the original equation to reject extraneous roots):',
    expression: '√(2x + 9) + x = 13',
    answer: 8,
    variables: {
      a: 2,
      b: 9,
      c: 13,
      s: 5,
      quad_b: -28,
      quad_c: 160,
      x_valid: 8,
      extraneous: 20,
      extraneous_lhs: 27,
      answer: 8,
    },
    steps: [
      'Isolate the square root: √(2x + 9) = 13 − x',
      'Square both sides: 2x + 9 = (13 − x)² → x² − 28x + 160 = 0',
      'Factor: (x − 8)(x − 20) = 0 → x = 8 or x = 20',
      'Check x = 20: √(49) + 20 = 27 ≠ 13 → REJECTED (extraneous).',
      'Check x = 8: √(25) + 8 = 13 ✓. Valid answer: x = 8.',
    ],
  };
}

/**
 * Subtype 7: Commerce profit% = cost price word problem
 * Template: Item sold for ₹P; Gain% equals Cost Price.
 * Answer = Cost Price (exact positive multiple of 10).
 */
export function generateCommerceProfitWord() {
  const cp = 10 * randomInt(2, 9); // 20, 30, 40, 50, 60, 70, 80, 90
  const sellingPrice = cp + (cp * cp) / 100;
  const item = COMMERCE_ITEMS[randomInt(0, COMMERCE_ITEMS.length - 1)];

  return {
    subtype: 'commerce-profit-word',
    prompt: 'Find the Cost Price (in ₹):',
    expression: `A shopkeeper sells ${item} for ₹${sellingPrice} and gains as much percent as its Cost Price (in ₹).`,
    answer: cp,
    variables: {
      item,
      selling_price: sellingPrice,
      cp,
      neg_factor: 100 + cp,
      answer: cp,
    },
    steps: [
      `Let Cost Price = ₹x. Then Profit % = x%, so Selling Price = x + (x/100) × x = ₹${sellingPrice}.`,
      `Multiply by 100: x² + 100x − ${sellingPrice * 100} = 0`,
      `Factor: (x + ${100 + cp})(x − ${cp}) = 0`,
      `Cost Price cannot be negative, so CP = ₹${cp}.`,
    ],
  };
}

export const QUADRATIC_SUBTYPES = {
  'factoring-mixed-signs': generateFactoringMixedSigns,
  'reducible-fraction': generateReducibleFraction,
  'find-k-equal-roots': generateFindKEqualRoots,
  'two-squares-word': generateTwoSquaresWord,
  'speed-distance-word': generateSpeedDistanceWord,
  'radical-extraneous': generateRadicalExtraneous,
  'commerce-profit-word': generateCommerceProfitWord,
};

export function generateQuadraticProblem(subtype, config = {}) {
  const generator = QUADRATIC_SUBTYPES[subtype];
  if (!generator) {
    throw new Error(`Unknown quadratic subtype: "${subtype}"`);
  }
  return generator(config);
}

export default generateQuadraticProblem;
import { describe, it, expect } from 'vitest';
import {
  ARITHMETIC_SUBTYPES,
  generateArithmeticProblem,
} from '../src/generators/arithmeticGenerator.js';
import {
  LINEAR_SUBTYPES,
  generateLinearEqProblem,
} from '../src/generators/linearEqGenerator.js';
import {
  QUADRATIC_SUBTYPES,
  generateQuadraticProblem,
} from '../src/generators/quadraticGenerator.js';

const ITERATIONS = 100;

function assertValidProblemShape(problem, expectedSubtype) {
  expect(problem).toBeDefined();
  expect(problem.subtype).toBe(expectedSubtype);
  expect(typeof problem.expression).toBe('string');
  expect(problem.expression.length).toBeGreaterThan(0);
  expect(typeof problem.prompt).toBe('string');
  expect(problem.prompt.length).toBeGreaterThan(0);
  expect(Number.isFinite(problem.answer)).toBe(true);
  expect(Number.isNaN(problem.answer)).toBe(false);
  expect(Number.isInteger(problem.answer)).toBe(true);
  expect(problem.variables).toBeTypeOf('object');
  expect(Array.isArray(problem.steps)).toBe(true);
  expect(problem.steps.length).toBeGreaterThanOrEqual(3);
}

describe('Arithmetic Generator (Easy — 3 CBSE Class 6-7 Subtypes)', () => {
  it('of-mixed: 100 runs produce exact integers differing from naive left-to-right eval', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateArithmeticProblem('of-mixed');
      assertValidProblemShape(p, 'of-mixed');
      const { a, b, c, d, e } = p.variables;
      const bodmas = a + b * c - d * e;
      const naive = ((a + b) * c - d) * e;
      expect(p.answer).toBe(bodmas);
      expect(p.answer).not.toBe(naive);
    }
  });

  it('four-level-brackets: 100 runs produce positive integers differing from flat eval', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateArithmeticProblem('four-level-brackets');
      assertValidProblemShape(p, 'four-level-brackets');
      const { a, b, c, d, e } = p.variables;
      const expected = a - (b - (c + (d - e)));
      const flat = a - b - c + d - e;
      expect(p.answer).toBe(expected);
      expect(p.answer).toBeGreaterThan(0);
      expect(p.answer).not.toBe(flat);
    }
  });

  it('negative-integers: 100 runs perform clean integer division and exact sign rules', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateArithmeticProblem('negative-integers');
      assertValidProblemShape(p, 'negative-integers');
      const { a, b, c, d } = p.variables;
      expect(b % c).toBe(0);
      expect(p.answer).toBe(-a + (-b / -c) * d);
    }
  });

  it('registers all 3 arithmetic subtypes', () => {
    expect(Object.keys(ARITHMETIC_SUBTYPES)).toHaveLength(3);
  });
});

describe('Linear Equation Generator (Medium — 5 CBSE Class 8-9 Subtypes)', () => {
  it('brackets-both-sides: 100 runs satisfy a(x + b) = cx + d', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateLinearEqProblem('brackets-both-sides');
      assertValidProblemShape(p, 'brackets-both-sides');
      const { a, b, c, d } = p.variables;
      expect(a * (p.answer + b)).toBe(c * p.answer + d);
    }
  });

  it('fraction-cross: 100 runs satisfy f(ax + b) = c(dx + e) with unique integer x', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateLinearEqProblem('fraction-cross');
      assertValidProblemShape(p, 'fraction-cross');
      const { a, b, c, d, e, f } = p.variables;
      expect(f * a).not.toBe(c * d);
      expect(f * (a * p.answer + b)).toBe(c * (d * p.answer + e));
    }
  });

  it('age-word: 100 runs satisfy positive age relationship', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateLinearEqProblem('age-word');
      assertValidProblemShape(p, 'age-word');
      const { age_diff: diff, years_later: yrs, multiplier } = p.variables;
      expect(p.answer).toBeGreaterThan(0);
      expect(p.answer + diff + yrs).toBe(multiplier * (p.answer + yrs));
    }
  });

  it('digit-reversal: 100 runs produce valid 2-digit numbers satisfying sum and reversal diff', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateLinearEqProblem('digit-reversal');
      assertValidProblemShape(p, 'digit-reversal');
      const { tens, units, digit_sum: sum, diff } = p.variables;
      expect(p.answer).toBeGreaterThanOrEqual(12);
      expect(p.answer).toBeLessThanOrEqual(89);
      expect(tens + units).toBe(sum);
      expect(10 * units + tens - (10 * tens + units)).toBe(diff);
      expect(p.answer).toBe(10 * tens + units);
    }
  });

  it('fraction-word: 100 runs satisfy both fraction conditions and code = numerator', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateLinearEqProblem('fraction-word');
      assertValidProblemShape(p, 'fraction-word');
      const { add_num: addNum, b, sub_den: subDen, d, numerator, denominator } = p.variables;
      expect(p.answer).toBe(numerator);
      expect(numerator).toBeLessThan(denominator);
      expect(b * (numerator + addNum)).toBe(denominator);
      expect(d * numerator).toBe(denominator - subDen);
    }
  });

  it('registers all 5 linear equation subtypes', () => {
    expect(Object.keys(LINEAR_SUBTYPES)).toHaveLength(5);
  });
});

describe('Quadratic Equation Generator (Hard — 7 CBSE Class 10 Board HOTS Subtypes)', () => {
  it('factoring-mixed-signs: 100 runs have 1 positive root and 1 negative root', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('factoring-mixed-signs');
      assertValidProblemShape(p, 'factoring-mixed-signs');
      const { b, c, pos_root: rPos, neg_root: rNeg } = p.variables;
      expect(p.answer).toBe(rPos);
      expect(rPos).toBeGreaterThan(0);
      expect(rNeg).toBeLessThan(0);
      expect(rPos * rPos + b * rPos + c).toBe(0);
      expect(rNeg * rNeg + b * rNeg + c).toBe(0);
    }
  });

  it('reducible-fraction: 100 runs satisfy fraction equation for both roots and answer = sum', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('reducible-fraction');
      assertValidProblemShape(p, 'reducible-fraction');
      const { a, b, c, d, r1, r2 } = p.variables;
      expect(p.answer).toBe(r1 + r2);
      expect(d * -(a + b)).toBe(c * (r1 + a) * (r1 - b));
      expect(d * -(a + b)).toBe(c * (r2 + a) * (r2 - b));
    }
  });

  it('find-k-equal-roots: 100 runs produce unique positive integer k with D = 0', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('find-k-equal-roots');
      assertValidProblemShape(p, 'find-k-equal-roots');
      const { a, b, c, k_pos: kPos, k_neg: kNeg } = p.variables;
      expect(p.answer).toBe(kPos);
      expect(kPos).toBeGreaterThan(0);
      expect(kNeg).toBeLessThan(0);
      expect(kPos + a).not.toBe(0);
      expect((kPos + b) ** 2 - 4 * (kPos + a) * c).toBe(0);
      expect((kNeg + b) ** 2 - 4 * (kNeg + a) * c).toBe(0);
    }
  });

  it('two-squares-word: 100 runs satisfy sum of areas and difference of perimeters', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('two-squares-word');
      assertValidProblemShape(p, 'two-squares-word');
      const { s1, s2, sum_areas: sumAreas, diff_perim: diffPerim } = p.variables;
      expect(p.answer).toBe(s1);
      expect(s1).toBeGreaterThan(0);
      expect(s2).toBeGreaterThan(s1);
      expect(s1 * s1 + s2 * s2).toBe(sumAreas);
      expect(4 * (s2 - s1)).toBe(diffPerim);
    }
  });

  it('speed-distance-word: 100 runs satisfy D/x − D/(x + S) = T with positive integer speed', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('speed-distance-word');
      assertValidProblemShape(p, 'speed-distance-word');
      const { distance, extra_speed: extra, time_saved: saved, speed } = p.variables;
      expect(p.answer).toBe(speed);
      expect(speed).toBeGreaterThan(0);
      expect(saved).toBeGreaterThan(0);
      expect(distance * extra).toBe(saved * speed * (speed + extra));
    }
  });

  it('radical-extraneous: 100 runs have 1 valid integer root AND 1 truly extraneous integer root', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('radical-extraneous');
      assertValidProblemShape(p, 'radical-extraneous');
      const { a, b, c, quad_b: qB, quad_c: qC, x_valid: xVal, extraneous: xExt } = p.variables;
      expect(p.answer).toBe(xVal);
      expect(Number.isInteger(xExt)).toBe(true);
      expect(xExt).not.toBe(xVal);
      // Valid root satisfies original radical equation
      expect(Math.sqrt(a * xVal + b) + xVal).toBe(c);
      // Extraneous root satisfies squared quadratic...
      expect(xExt * xExt + qB * xExt + qC).toBe(0);
      // ...but FAILS the original radical equation
      expect(Math.sqrt(a * xExt + b) + xExt).not.toBe(c);
    }
  });

  it('commerce-profit-word: 100 runs satisfy CP + CP²/100 = SP with positive integer CP', () => {
    for (let i = 0; i < ITERATIONS; i += 1) {
      const p = generateQuadraticProblem('commerce-profit-word');
      assertValidProblemShape(p, 'commerce-profit-word');
      const { cp, selling_price: sp } = p.variables;
      expect(p.answer).toBe(cp);
      expect(cp).toBeGreaterThan(0);
      expect(cp + (cp * cp) / 100).toBe(sp);
    }
  });

  it('registers all 7 quadratic subtypes', () => {
    expect(Object.keys(QUADRATIC_SUBTYPES)).toHaveLength(7);
  });
});
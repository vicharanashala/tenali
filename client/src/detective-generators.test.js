import { describe, test, expect, vi, afterAll } from 'vitest';
import { CASE_GENERATORS } from './detective-generators';

/**
 * Deterministic seeded generation: every assertion below is checked against
 * the actual numbers printed in the generated narrative/question, not against
 * the generator's internal variables.
 */
function mulberry32(seed) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fractionText(numerator, denominator) {
  const divisor = gcd(numerator, denominator) || 1;
  return `${numerator / divisor}/${denominator / divisor}`;
}

function fractionValue(text) {
  const match = String(text).trim().match(/^(-?\d+)\s*\/\s*(\d+)$/);
  return match ? Number(match[1]) / Number(match[2]) : Number(text);
}

function signValue(sign, digits) {
  return sign === '-' ? -Number(digits) : Number(digits);
}

const SEEDS = 80;

describe('generated mathematics', () => {
  const randomSpy = vi.spyOn(Math, 'random');
  afterAll(() => randomSpy.mockRestore());

  function eachCase(check) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      randomSpy.mockImplementation(mulberry32(seed * 2654435761));
      for (const [id, generate] of Object.entries(CASE_GENERATORS)) {
        const story = generate();
        const context = `${id} @ seed ${seed}`;
        check(id, story, context);
      }
    }
  }

  test('case-enhanced-4: both displayed equations solve to the stored answers', () => {
    eachCase((id, story, context) => {
      if (id !== 'case-enhanced-4') return;
      const [stage1, stage2] = story.stages;

      const first = stage1.question.match(/^(\d+)x \+ (\d+) = (-?\d+)\. Solve for x\.$/);
      expect(first, `${context} stage 1 question: ${stage1.question}`).not.toBeNull();
      const [, a1, b1, c1] = first.map(Number);
      expect((c1 - b1) / a1, `${context} stage 1`).toBe(stage1.answer);

      const second = stage2.question.match(
        /^(\d+)x ([+-]) (\d+) = (\d+)x ([+-]) (\d+)\. Solve for x\.$/,
      );
      expect(second, `${context} stage 2 question: ${stage2.question}`).not.toBeNull();
      const [, a2, signB, b2Digits, c2, signR, rDigits] = second;
      const b2 = signValue(signB, b2Digits);
      const rhs = signValue(signR, rDigits);
      expect(Number(a2), `${context} x terms must not cancel`).not.toBe(Number(c2));
      expect((rhs - b2) / (Number(a2) - Number(c2)), `${context} stage 2`).toBe(stage2.answer);

      for (const stage of story.stages) {
        expect(stage.question, `${context} double sign`).not.toMatch(/[+-]\s+-\d/);
        expect(stage.narrative, `${context} double sign`).not.toMatch(/[+-]\s+-\d/);
      }
    });
  });

  test('case-enhanced-5: quadratic, word-problem and discriminant answers are correct', () => {
    eachCase((id, story, context) => {
      if (id !== 'case-enhanced-5') return;
      const [stage1, stage2, stage3] = story.stages;

      const first = stage1.question.match(
        /^x\u00b2 ([+-]) (\d+)x ([+-]) (\d+) = 0\. Find both roots\.$/,
      );
      expect(first, `${context} stage 1 question: ${stage1.question}`).not.toBeNull();
      const [, signB, bDigits, signC, cDigits] = first;
      const b = signValue(signB, bDigits);
      const c = signValue(signC, cDigits);
      const discriminant = b * b - 4 * c;
      expect(discriminant, `${context} stage 1 discriminant`).toBeGreaterThan(0);
      const rootA = (-b - Math.sqrt(discriminant)) / 2;
      const rootB = (-b + Math.sqrt(discriminant)) / 2;
      expect(stage1.answer, `${context} stage 1 roots`).toBe(
        `${Math.min(rootA, rootB)}, ${Math.max(rootA, rootB)}`,
      );

      const second = stage2.question.match(
        /^Width = x\. Length = x \+ (\d+)\. Area = (\d+)\. x\u00b2 \+ (\d+)x \u2212 (\d+) = 0\. Find the positive root\.$/,
      );
      expect(second, `${context} stage 2 question: ${stage2.question}`).not.toBeNull();
      const [, spread, area, coef, constant] = second.map(Number);
      expect(spread, `${context} positive spread`).toBeGreaterThan(0);
      expect(coef, `${context} spread matches coefficient`).toBe(spread);
      expect(constant, `${context} area matches constant`).toBe(area);
      const positiveRoot = (-coef + Math.sqrt(coef * coef + 4 * area)) / 2;
      expect(positiveRoot, `${context} stage 2 root is whole`).toBe(Math.round(positiveRoot));
      expect(stage2.answer, `${context} stage 2 answer`).toBe(positiveRoot);

      const third = stage3.question.match(
        /^D = \((-?\d+)\)\u00b2 \u2212 4\((\d+)\)\((-?\d+)\) = \?$/,
      );
      expect(third, `${context} stage 3 question: ${stage3.question}`).not.toBeNull();
      const [, qb, qa, qc] = third.map(Number);
      expect(stage3.answer, `${context} stage 3`).toBe(qb * qb - 4 * qa * qc);
    });
  });

  test('case-enhanced-6: both systems are non-singular with integer solutions', () => {
    eachCase((id, story, context) => {
      if (id !== 'case-enhanced-6') return;
      const [stage1, stage2] = story.stages;

      const first = stage1.question.match(
        /^Solve: (\d+)x \+ (\d+)y = (-?\d+), (\d+)x \+ (\d+)y = (-?\d+)\. Find x\.$/,
      );
      expect(first, `${context} stage 1 question: ${stage1.question}`).not.toBeNull();
      const [, a1, b1, c1, a2, b2, c2] = first.map(Number);
      const det = a1 * b2 - a2 * b1;
      expect(det, `${context} stage 1 determinant`).not.toBe(0);
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      expect(x, `${context} stage 1 x`).toBe(Math.round(x));
      expect(y, `${context} stage 1 y`).toBe(Math.round(y));
      expect(stage1.answer, `${context} stage 1 answer`).toBe(x);

      const second = stage2.question.match(
        /^Solve by substitution: (\d+)x \+ (\d+)y = (-?\d+), (\d+)x \+ (\d+)y = (-?\d+)\. Find y\.$/,
      );
      expect(second, `${context} stage 2 question: ${stage2.question}`).not.toBeNull();
      const [, sa1, sb1, sc1, sa2, sb2, sc2] = second.map(Number);
      const sdet = sa1 * sb2 - sa2 * sb1;
      expect(sdet, `${context} stage 2 determinant`).not.toBe(0);
      const sy = (sa1 * sc2 - sa2 * sc1) / sdet;
      expect(sy, `${context} stage 2 y`).toBe(Math.round(sy));
      expect(stage2.answer, `${context} stage 2 answer`).toBe(sy);
    });
  });

  test('case-enhanced-10: die probabilities match the number of winning faces', () => {
    eachCase((id, story, context) => {
      if (id !== 'case-enhanced-10') return;
      const [stage1, stage2] = story.stages;

      const first = stage1.question.match(/^Die roll must be > (\d+)\. Favorable outcomes/);
      expect(first, `${context} stage 1 question: ${stage1.question}`).not.toBeNull();
      const called = Number(first[1]);
      expect(called, `${context} called value`).toBeGreaterThanOrEqual(3);
      expect(called, `${context} called value`).toBeLessThanOrEqual(5);
      const favorable = 6 - called;
      expect(stage1.answer, `${context} stage 1 answer`).toBe(fractionText(favorable, 6));

      const second = stage2.question.match(/^Two dice\. Sum = (\d+)\. Number of favorable/);
      expect(second, `${context} stage 2 question: ${stage2.question}`).not.toBeNull();
      const target = Number(second[1]);
      let pairs = 0;
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === target) pairs++;
      expect(fractionValue(stage2.answer), `${context} stage 2 answer`).toBeCloseTo(pairs / 36, 10);
      expect(stage2.answer, `${context} stage 2 simplified`).toBe(fractionText(pairs, 36));
    });
  });

  test('case-enhanced-15: all three limits evaluate to the stored answers', () => {
    eachCase((id, story, context) => {
      if (id !== 'case-enhanced-15') return;
      const [stage1, stage2, stage3] = story.stages;

      const first = stage1.question.match(
        /^lim\(x\u2192(\d+)\) \(2x \+ 3\) = 2\((\d+)\) \+ 3 = \?$/,
      );
      expect(first, `${context} stage 1 question: ${stage1.question}`).not.toBeNull();
      expect(Number(first[1]), `${context} stage 1 point`).toBe(Number(first[2]));
      expect(stage1.answer, `${context} stage 1`).toBe(2 * Number(first[1]) + 3);

      const second = stage2.question.match(
        /^lim\(x\u2192(\d+)\) \(x\u00b2 \u2212 (\d+)\)\/\(x \u2212 (\d+)\) = \?$/,
      );
      expect(second, `${context} stage 2 question: ${stage2.question}`).not.toBeNull();
      const [, point, square, subtracted] = second.map(Number);
      expect(square, `${context} stage 2 square`).toBe(point * point);
      expect(subtracted, `${context} stage 2 denominator`).toBe(point);
      expect(stage2.answer, `${context} stage 2`).toBe(2 * point);

      const third = stage3.question.match(
        /^lim\(x\u21920\) \(\u221a\((\d+) \+ (\d+)x\) \u2212 \u221a\((\d+)\)\) \/ x = \(after rationalising\) (\d+) \/ \(2\u221a\((\d+)\)\) = \?$/,
      );
      expect(third, `${context} stage 3 question: ${stage3.question}`).not.toBeNull();
      const [, radicand, coefficient, radicand2, numerator, radicand3] = third.map(Number);
      expect(radicand2, `${context} stage 3 radicand repeat`).toBe(radicand);
      expect(radicand3, `${context} stage 3 radicand repeat`).toBe(radicand);
      expect(fractionValue(stage3.answer), `${context} stage 3`).toBeCloseTo(
        numerator / (2 * Math.sqrt(radicand)),
        10,
      );
      expect(coefficient, `${context} stage 3 coefficient`).toBe(numerator);
    });
  });
});

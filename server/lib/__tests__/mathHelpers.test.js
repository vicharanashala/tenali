import { describe, it, expect } from 'vitest';
const { parseMathValue, compareMathValues, textMatches } = require('../mathHelpers');

describe('mathHelpers - Issue #177 Math Answer Parsing & Validation', () => {
  describe('parseMathValue', () => {
    it('TEN-MATH-011: parses simple fractions', () => {
      expect(parseMathValue('2/3')).toBeCloseTo(0.666666, 4);
      expect(parseMathValue('-5/2')).toBe(-2.5);
    });

    it('TEN-MATH-016: parses scientific notation', () => {
      expect(parseMathValue('1.5e3')).toBe(1500);
      expect(parseMathValue('2.1E-2')).toBe(0.021);
    });

    it('TEN-MATH-017: parses mixed numbers', () => {
      expect(parseMathValue('1 1/2')).toBe(1.5);
      expect(parseMathValue('-2 3/4')).toBe(-2.75);
    });

    it('TEN-MATH-B03: parses fractional coordinate tuples', () => {
      expect(parseMathValue('(1/2, 3/4)')).toEqual([0.5, 0.75]);
      expect(parseMathValue('0.5, 0.75')).toEqual([0.5, 0.75]);
    });

    it('parses standard numbers and strips whitespace / unicode minus', () => {
      expect(parseMathValue(' 43.13 ')).toBe(43.13);
      expect(parseMathValue('−5.2')).toBe(-5.2);
    });

    it('returns NaN for invalid inputs', () => {
      expect(parseMathValue('abc')).toBeNaN();
      expect(parseMathValue('1/0')).toBeNaN();
      expect(parseMathValue('')).toBeNaN();
      expect(parseMathValue(null)).toBeNaN();
    });
  });

  describe('compareMathValues', () => {
    it('TEN-MATH-011 & 018: compares fraction and decimal representations within tolerance', () => {
      expect(compareMathValues('2/3', 0.6667, 0.001)).toBe(true);
      expect(compareMathValues('1/4', '0.25')).toBe(true);
      expect(compareMathValues('-5/2', '-2.5')).toBe(true);
    });

    it('TEN-MATH-017: compares mixed number and improper fraction', () => {
      expect(compareMathValues('1 1/2', '3/2')).toBe(true);
    });

    it('TEN-MATH-B03: compares fractional coordinate pairs', () => {
      expect(compareMathValues('(1/2, 3/4)', '(0.5, 0.75)')).toBe(true);
    });
  });

  describe('textMatches', () => {
    it('TEN-MATH-012: rejects number substring matches like 145 matching 4', () => {
      expect(textMatches('145', ['4'])).toBe(false);
      expect(textMatches('4', ['4'])).toBe(true);
    });

    it('TEN-MATH-014: text keyword matching respects word boundaries', () => {
      expect(textMatches('yesterday', ['yes'])).toBe(false);
      expect(textMatches('yes', ['yes'])).toBe(true);
      expect(textMatches('Yes, it is correct', ['yes'])).toBe(true);
    });
  });
});

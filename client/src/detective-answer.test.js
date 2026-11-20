import { describe, test, expect } from 'vitest';
import { checkDetectiveAnswer } from './detective-answer';

describe('checkDetectiveAnswer - numeric answers', () => {
  test('keeps the existing unit-suffix and tolerance behaviour', () => {
    expect(checkDetectiveAnswer(15, '15 cm')).toBe(true);
    expect(checkDetectiveAnswer(15, ' 15 ')).toBe(true);
    expect(checkDetectiveAnswer(15, '15.004')).toBe(true);
    expect(checkDetectiveAnswer(15, '16')).toBe(false);
    expect(checkDetectiveAnswer('40', '40')).toBe(true);
  });

  test('accepts equivalent fractions for numeric answers', () => {
    expect(checkDetectiveAnswer(24, '48/2')).toBe(true);
    expect(checkDetectiveAnswer(24, '25/1')).toBe(false);
  });

  test('rejects trailing non-unit garbage', () => {
    expect(checkDetectiveAnswer(24, '24abc')).toBe(false);
    expect(checkDetectiveAnswer(24, '24 bottles')).toBe(false);
    expect(checkDetectiveAnswer(24, '24cm')).toBe(true);
  });

  test('rejects empty and missing input', () => {
    expect(checkDetectiveAnswer(24, '')).toBe(false);
    expect(checkDetectiveAnswer(24, '   ')).toBe(false);
    expect(checkDetectiveAnswer(24, null)).toBe(false);
    expect(checkDetectiveAnswer(24, undefined)).toBe(false);
  });

  test('supports negative and decimal answers', () => {
    expect(checkDetectiveAnswer(-14, '-14')).toBe(true);
    expect(checkDetectiveAnswer(0.675, '0.675')).toBe(true);
    expect(checkDetectiveAnswer(5.5, '5.50')).toBe(true);
    expect(checkDetectiveAnswer(0, '0')).toBe(true);
  });
});

describe('checkDetectiveAnswer - fraction answers', () => {
  test('accepts equal fractions and the flagged decimal equivalent', () => {
    expect(checkDetectiveAnswer('5/12', '5/12')).toBe(true);
    expect(checkDetectiveAnswer('5/12', '10/24')).toBe(true);
    expect(checkDetectiveAnswer('5/12', ' 5 / 12 ')).toBe(true);
    expect(checkDetectiveAnswer('10/3', '3.333')).toBe(true);
  });

  test('rejects the numerator-only prefix (the old parseFloat bug)', () => {
    expect(checkDetectiveAnswer('5/12', '5')).toBe(false);
    expect(checkDetectiveAnswer('5/12', '5/999')).toBe(false);
    expect(checkDetectiveAnswer('1/3', '1')).toBe(false);
    expect(checkDetectiveAnswer('11/12', '11')).toBe(false);
    expect(checkDetectiveAnswer('3/100', '3')).toBe(false);
  });

  test('rejects a different value with the same numerator', () => {
    expect(checkDetectiveAnswer('5/12', '5/2')).toBe(false);
    expect(checkDetectiveAnswer('3/8', '3/4')).toBe(false);
  });
});

describe('checkDetectiveAnswer - multi-value answers', () => {
  test('root lists are order-insensitive and need every root', () => {
    expect(checkDetectiveAnswer('-3, 5', '-3, 5')).toBe(true);
    expect(checkDetectiveAnswer('-3, 5', '5, -3')).toBe(true);
    expect(checkDetectiveAnswer('-3, 5', '-3,5')).toBe(true);
    expect(checkDetectiveAnswer('-3, 5', '-3')).toBe(false);
    expect(checkDetectiveAnswer('-3, 5', '-3, 5, 7')).toBe(false);
    expect(checkDetectiveAnswer('-3, 5', '5, 5')).toBe(false);
  });

  test('coordinate pairs are order-sensitive', () => {
    expect(checkDetectiveAnswer('(5, 5)', '(5,5)')).toBe(true);
    expect(checkDetectiveAnswer('(5, 5)', ' ( 5 , 5 ) ')).toBe(true);
    expect(checkDetectiveAnswer('(-3, 4)', '(-3, 4)')).toBe(true);
    expect(checkDetectiveAnswer('(-3, 4)', '(4, -3)')).toBe(false);
    expect(checkDetectiveAnswer('(-3, 4)', '-3, 4')).toBe(true);
  });
});

describe('checkDetectiveAnswer - text and expressions', () => {
  test('words compare case-insensitively', () => {
    expect(checkDetectiveAnswer('triangle', ' Triangle ')).toBe(true);
    expect(checkDetectiveAnswer('Northeast', 'northeast')).toBe(true);
    expect(checkDetectiveAnswer('small star', 'Small  Star')).toBe(true);
    expect(checkDetectiveAnswer('DE', 'de')).toBe(true);
    expect(checkDetectiveAnswer('triangle', 'tri')).toBe(false);
    expect(checkDetectiveAnswer('small star', 'small')).toBe(false);
  });

  test('expressions normalise superscripts, spaces and multiplication signs', () => {
    expect(checkDetectiveAnswer('12x^2', '12x^2')).toBe(true);
    expect(checkDetectiveAnswer('12x^2', '12x\u00b2')).toBe(true);
    expect(checkDetectiveAnswer('12x^2', '12*x^2')).toBe(true);
    expect(checkDetectiveAnswer('12x^2', '12')).toBe(false);
    expect(checkDetectiveAnswer('12x^2', '12x^3')).toBe(false);
  });
});

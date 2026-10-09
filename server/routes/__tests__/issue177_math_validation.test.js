'use strict';

const hasGlobals = typeof globalThis.describe === 'function' && typeof globalThis.test === 'function';
const { describe, test } = hasGlobals ? globalThis : require('node:test');
const assert = require('node:assert/strict');
const { parseMathValue, compareNumericAnswers } = require('../../mathParser');

describe('Issue #177 - Consistent Mathematical Answer Validation Test Suite', () => {
  test('1. Standard scientific notation parsing (TEN-MATH-016)', () => {
    const val1 = parseMathValue('5.400 x 10^7');
    const val2 = parseMathValue('5.4e7');
    assert.equal(val1, 54000000);
    assert.equal(val2, 54000000);
    assert.ok(compareNumericAnswers('5.400 x 10^7', '5.4e7'));
  });

  test('2. Equivalent improper and mixed fractions (TEN-MATH-017 & TEN-MATH-018)', () => {
    assert.ok(compareNumericAnswers('-0.05', '-1/20'));
    const mixed = parseMathValue('11 11/42');
    const improper = parseMathValue('473/42');
    assert.ok(Math.abs(mixed - improper) < 1e-9);
    assert.ok(compareNumericAnswers('11 11/42', '473/42'));
  });

  test('3. Coordinate and fractional expression parsing (TEN-MATH-B03)', () => {
    const coordX = parseMathValue('-5/2');
    const coordY = parseMathValue('-7/2');
    assert.equal(coordX, -2.5);
    assert.equal(coordY, -3.5);
    assert.ok(compareNumericAnswers('-5/2', -2.5));
    assert.ok(compareNumericAnswers('-7/2', -3.5));
  });

  test('4. Unicode symbols and superscripts normalization', () => {
    assert.equal(parseMathValue('3 × 10²'), 300);
    assert.equal(parseMathValue('−4.5'), -4.5);
    assert.ok(compareNumericAnswers('3 × 10²', 300));
    assert.ok(compareNumericAnswers('−4.5', -4.5));
  });

  test('5. Real-life application numeric tolerance and comparison (TEN-MATH-011, 012)', () => {
    assert.ok(compareNumericAnswers('0.3333', 1/3, 0.001));
    assert.ok(compareNumericAnswers('2/3', 0.6667, 0.001));
    assert.ok(!compareNumericAnswers('0.5', '0.7'));
  });

  test('6. Server compareAnswers backend validation', () => {
    const compare = (user, expected) => {
      const u = parseMathValue(String(user).replace(/[%₹$,]/g, '').replace(/−/g, '-'));
      const e = parseMathValue(String(expected).replace(/[%₹$,]/g, '').replace(/−/g, '-'));
      if (!isNaN(u) && !isNaN(e)) return Math.abs(u - e) <= 0.01;
      return String(user).trim().toLowerCase() === String(expected).trim().toLowerCase();
    };

    assert.ok(compare('5.400 x 10^7', '5.4e7'));
    assert.ok(compare('11 11/42', '473/42'));
    assert.ok(compare('25%', '25'));
    assert.ok(compare('$50', '50'));
  });

  test('7. Non-numeric input fallback and security (no eval)', () => {
    assert.ok(isNaN(parseMathValue('invalid')));
    assert.ok(isNaN(parseMathValue('alert(1)')));
    assert.ok(!compareNumericAnswers('invalid', '123'));
  });
});

'use strict';
// Unit tests for server/lib/bkt.js — the canonical BKT implementation.
// Pure-function tests: zero external dependencies, compatible with Node runner and Vitest.

const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const { bktUpdate, DEFAULT_PARAMS, clamp } = require('./bkt');

describe('canonical BKT implementation (server/lib/bkt.js)', () => {
  test('clamp: below epsilon -> epsilon', () => {
    assert.equal(clamp(0), 0.01);
  });

  test('clamp: above 1-epsilon -> 1-epsilon', () => {
    assert.equal(clamp(1), 0.99);
  });

  test('clamp: midpoint passes through', () => {
    assert.equal(clamp(0.5), 0.5);
  });

  test('clamp: negative clamped to epsilon', () => {
    assert.equal(clamp(-1), 0.01);
  });

  test('clamp: >1 clamped to 1-epsilon', () => {
    assert.equal(clamp(2), 0.99);
  });

  test('clamp: custom lo/hi, value in range', () => {
    assert.equal(clamp(0.3, 0.2, 0.8), 0.3);
  });

  test('clamp: custom lo, value below lo', () => {
    assert.equal(clamp(0.1, 0.2, 0.8), 0.2);
  });

  test('clamp: custom hi, value above hi', () => {
    assert.equal(clamp(0.9, 0.2, 0.8), 0.8);
  });

  test('validateParams: degenerate pGuess throws', () => {
    assert.throws(
      () => bktUpdate(0.5, true, { ...DEFAULT_PARAMS, pGuess: 0.5 }),
      /Degenerate/
    );
  });

  test('validateParams: degenerate pSlip throws', () => {
    assert.throws(
      () => bktUpdate(0.5, true, { ...DEFAULT_PARAMS, pSlip: 0.5 }),
      /Degenerate/
    );
  });

  test('bktUpdate: correct answer raises posterior and clamps bounds', () => {
    const { posterior, pMasteryNext } = bktUpdate(0.3, true);
    assert.ok(posterior > 0.3);
    assert.ok(pMasteryNext > posterior);
    assert.ok(pMasteryNext <= 0.99);
    assert.ok(pMasteryNext >= 0.01);
  });

  test('bktUpdate: incorrect answer lowers posterior below prior', () => {
    const { posterior, pMasteryNext } = bktUpdate(0.7, false);
    assert.ok(posterior < 0.7);
    assert.ok(pMasteryNext >= posterior);
  });

  test('Concept playground level solve (#290)', () => {
    const prior = 0.3;
    const { pMasteryNext: afterSolve } = bktUpdate(prior, true);
    const { pMasteryNext: afterWrongFlag } = bktUpdate(prior, false);
    assert.ok(afterSolve > prior);
    assert.ok(afterSolve > afterWrongFlag);
  });

  test('bktUpdate: smoothing factor caps single-answer jump', () => {
    const { pMasteryNext } = bktUpdate(0.01, true);
    assert.ok(pMasteryNext < 0.20);
  });

  test('bktUpdate: repeated correct answers raise mastery above 0.8', () => {
    let p = DEFAULT_PARAMS.pInit;
    for (let i = 0; i < 30; i++) {
      ({ pMasteryNext: p } = bktUpdate(p, true));
    }
    assert.ok(p > 0.8);
  });

  test('bktUpdate: repeated wrong answers lower high mastery below 0.7', () => {
    let p = 0.9;
    for (let i = 0; i < 20; i++) {
      ({ pMasteryNext: p } = bktUpdate(p, false));
    }
    assert.ok(p < 0.7);
  });

  test('DEFAULT_PARAMS are non-degenerate', () => {
    assert.ok(DEFAULT_PARAMS.pGuess < 0.5);
    assert.ok(DEFAULT_PARAMS.pSlip < 0.5);
  });
});

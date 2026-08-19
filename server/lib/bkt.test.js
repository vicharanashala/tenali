'use strict';
// Unit tests for server/lib/bkt.js — the canonical BKT implementation.
// These are pure-function tests: no mocks, no DB, no Express.
// Run with: node --test bkt.test.js   (Node 20+ built-in runner)
// OR:       npx vitest run lib/bkt

const assert = require('node:assert/strict');
const { bktUpdate, DEFAULT_PARAMS, clamp } = require('./bkt');

// ── clamp ────────────────────────────────────────────────────────────────────
assert.equal(clamp(0), 0.01,        'clamp: below epsilon → epsilon');
assert.equal(clamp(1), 0.99,        'clamp: above 1-epsilon → 1-epsilon');
assert.equal(clamp(0.5), 0.5,       'clamp: midpoint passes through');
assert.equal(clamp(-1), 0.01,       'clamp: negative clamped to epsilon');
assert.equal(clamp(2), 0.99,        'clamp: >1 clamped to 1-epsilon');
assert.equal(clamp(0.3, 0.2, 0.8), 0.3, 'clamp: custom lo/hi, value in range');
assert.equal(clamp(0.1, 0.2, 0.8), 0.2, 'clamp: custom lo, value below lo');
assert.equal(clamp(0.9, 0.2, 0.8), 0.8, 'clamp: custom hi, value above hi');

// ── validateParams ───────────────────────────────────────────────────────────
assert.throws(
  () => bktUpdate(0.5, true, { ...DEFAULT_PARAMS, pGuess: 0.5 }),
  /Degenerate/,
  'bktUpdate: pGuess=0.5 throws degenerate error'
);
assert.throws(
  () => bktUpdate(0.5, true, { ...DEFAULT_PARAMS, pSlip: 0.5 }),
  /Degenerate/,
  'bktUpdate: pSlip=0.5 throws degenerate error'
);

// ── bktUpdate — correct answer ───────────────────────────────────────────────
{
  const { posterior, pMasteryNext } = bktUpdate(0.3, true);
  assert.ok(posterior > 0.3, 'correct answer raises posterior above prior');
  assert.ok(pMasteryNext > posterior, 'transit step raises pMasteryNext above posterior');
  assert.ok(pMasteryNext <= 0.99, 'pMasteryNext is clamped below 1');
  assert.ok(pMasteryNext >= 0.01, 'pMasteryNext is clamped above 0');
}

// ── bktUpdate — incorrect answer ─────────────────────────────────────────────
{
  const { posterior, pMasteryNext } = bktUpdate(0.7, false);
  assert.ok(posterior < 0.7, 'incorrect answer lowers posterior below prior');
  // transit still raises pMasteryNext slightly above posterior
  assert.ok(pMasteryNext >= posterior, 'transit step never lowers pMasteryNext below posterior');
}

// ── bktUpdate — smoothing factor keeps jump small ────────────────────────────
{
  // A single correct answer from p=0.01 should not jump dramatically
  const { pMasteryNext } = bktUpdate(0.01, true);
  assert.ok(pMasteryNext < 0.20,
    'smoothing factor caps single-answer jump (SMOOTHING_FACTOR=0.11 prevents runaway)');
}

// ── bktUpdate — convergence: repeated correct answers raise mastery ───────────
{
  let p = DEFAULT_PARAMS.pInit;
  for (let i = 0; i < 30; i++) {
    ({ pMasteryNext: p } = bktUpdate(p, true));
  }
  assert.ok(p > 0.8, '30 correct answers bring mastery above 0.8 from pInit=0.3');
}

// ── bktUpdate — convergence: repeated wrong answers lower mastery ─────────────
{
  let p = 0.9;
  for (let i = 0; i < 20; i++) {
    ({ pMasteryNext: p } = bktUpdate(p, false));
  }
  assert.ok(p < 0.7, '20 wrong answers bring high mastery back below 0.7');
}

// ── DEFAULT_PARAMS are non-degenerate ─────────────────────────────────────────
assert.ok(DEFAULT_PARAMS.pGuess < 0.5, 'DEFAULT_PARAMS.pGuess < 0.5');
assert.ok(DEFAULT_PARAMS.pSlip  < 0.5, 'DEFAULT_PARAMS.pSlip < 0.5');

console.log('bkt.test.js: all assertions passed');

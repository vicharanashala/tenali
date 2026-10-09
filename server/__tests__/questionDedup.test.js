'use strict';
// Unit tests for server/lib/questionDedup.js (issue #178, TEN-MATH-023/024).
// Pure-function tests; no Express, no DB. Runs as part of `npm test`.

const { parseExcludeList, generateUnique, MAX_ATTEMPTS } = require('../lib/questionDedup');

// ── parseExcludeList ────────────────────────────────────────────────────────
describe('parseExcludeList', () => {
  test('missing query → empty set', () => {
    expect(parseExcludeList({}).size).toBe(0);
    expect(parseExcludeList(undefined).size).toBe(0);
    expect(parseExcludeList({ query: {} }).size).toBe(0);
  });

  test('parses comma-separated list', () => {
    const set = parseExcludeList({ query: { exclude: 'a,b,c' } });
    expect([...set]).toEqual(['a', 'b', 'c']);
  });

  test('trims whitespace and drops empties', () => {
    const set = parseExcludeList({ query: { exclude: ' a , , b , ' } });
    expect([...set]).toEqual(['a', 'b']);
  });

  test('falls back to body.exclude when no query param', () => {
    const set = parseExcludeList({ body: { exclude: 'x,y' } });
    expect([...set]).toEqual(['x', 'y']);
  });

  test('query takes precedence over body when both are present', () => {
    const set = parseExcludeList({ query: { exclude: 'q' }, body: { exclude: 'b' } });
    expect([...set]).toEqual(['q']);
  });

  test('non-string input collapses to empty set', () => {
    expect(parseExcludeList({ query: { exclude: 42 } }).size).toBe(0);
    expect(parseExcludeList({ query: { exclude: null } }).size).toBe(0);
    expect(parseExcludeList({ query: { exclude: undefined } }).size).toBe(0);
  });
});

// ── generateUnique ──────────────────────────────────────────────────────────
describe('generateUnique', () => {
  test('returns the first generator result when nothing is excluded', () => {
    let calls = 0;
    const { question, key, attempts } = generateUnique(
      () => { calls++; return { _key: 'k1', v: 1 }; },
      q => q._key,
      new Set()
    );
    expect(calls).toBe(1);
    expect(question).toEqual({ _key: 'k1', v: 1 });
    expect(key).toBe('k1');
    expect(attempts).toBe(1);
  });

  test('regenerates until the key is not in the exclude set', () => {
    let calls = 0;
    const keys = ['a', 'b', 'a', 'a', 'c'];
    const { question, key, attempts } = generateUnique(
      () => { calls++; return { _key: keys[calls - 1] }; },
      q => q._key,
      new Set(['a', 'b'])
    );
    // calls 1..4 hit excluded keys; call 5 ('c') is accepted.
    expect(calls).toBe(5);
    expect(question._key).toBe('c');
    expect(key).toBe('c');
    expect(attempts).toBe(5);
  });

  test('caps at maxAttempts; returns last attempt if all collide', () => {
    let calls = 0;
    const { question, key, attempts } = generateUnique(
      () => { calls++; return { _key: 'always' }; },
      q => q._key,
      new Set(['always']),
      5
    );
    expect(calls).toBe(5);
    expect(attempts).toBe(5);
    expect(key).toBe('always');
    expect(question._key).toBe('always');
  });

  test('accepts an array (not just a Set) for exclude', () => {
    const { question } = generateUnique(
      () => ({ _key: 'x' }),
      q => q._key,
      []
    );
    expect(question._key).toBe('x');
  });

  test('accepts null/undefined exclude as empty', () => {
    const { question } = generateUnique(
      () => ({ _key: 'y' }),
      q => q._key,
      null
    );
    expect(question._key).toBe('y');
  });

  test('keyExtractor is the only contract — the rest of the object is opaque', () => {
    const { question } = generateUnique(
      () => ({ _key: 'k', w: 5, h: 7, anything: true }),
      q => q._key,
      new Set()
    );
    expect(question).toEqual({ _key: 'k', w: 5, h: 7, anything: true });
  });
});

// ── integration with a small generator that always collides once ────────────
describe('generateUnique end-to-end', () => {
  test('recovers within MAX_ATTEMPTS when the first few collide', () => {
    let n = 0;
    const { question, attempts } = generateUnique(
      () => ({ _key: `k${n++}`, n }),
      q => q._key,
      new Set(['k0', 'k1', 'k2'])
    );
    expect(attempts).toBe(4);
    expect(question._key).toBe('k3');
  });

  test('MAX_ATTEMPTS exported and is positive', () => {
    expect(typeof MAX_ATTEMPTS).toBe('number');
    expect(MAX_ATTEMPTS).toBeGreaterThan(0);
  });
});
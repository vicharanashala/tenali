'use strict';
// Stateless question dedup (#178, TEN-MATH-023/024).
//
// Both the standalone Mensuration Lab (server/labRoutes.js) and the
// Mensuration entry in Geometry (server/routes/geometry.js) had small
// parameter spaces — easy difficulty is 3 templates × ~10 side values —
// so the random generator could emit the same question twice in a row even
// though the pool was not exhausted.
//
// Approach: stateless. The client passes back a comma-separated list of
// content keys in `?exclude=key1,key2,...` (or `body.exclude`). The server
// regenerates until the new key is not in the set, capped at MAX_ATTEMPTS.
// If the pool is genuinely exhausted we still return the question — never
// block the learner with a 409.

const MAX_ATTEMPTS = 10;

/**
 * Parse `?exclude=key1,key2,...` (or `body.exclude`) into a Set; missing or
 * non-string values become an empty set.
 */
function parseExcludeList(req) {
  const raw = (req && req.query && req.query.exclude) ||
              (req && req.body && req.body.exclude) ||
              '';
  if (typeof raw !== 'string') return new Set();
  return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
}

/**
 * Run `generator()` up to `maxAttempts` times. Each call's result is
 * reduced to a content key by `keyExtractor(question)`. As soon as a key is
 * not already in `exclude`, return `{ question, key }`. If every attempt
 * collides, return the last attempt's question anyway — best-effort, never
 * stalls the UI.
 *
 * @param {() => any} generator         Returns the question object.
 * @param {(q: any) => string} keyExtractor  Stable key for the question.
 * @param {Set<string>|string[]|null} exclude  Already-seen content keys.
 * @param {number} [maxAttempts=10]
 * @returns {{ question: any, key: string|null, attempts: number }}
 */
function generateUnique(generator, keyExtractor, exclude, maxAttempts = MAX_ATTEMPTS) {
  const ex = exclude instanceof Set
    ? exclude
    : new Set(Array.isArray(exclude) ? exclude : []);
  let question = null;
  let key = null;
  let attempts = 0;
  for (let i = 0; i < maxAttempts; i++) {
    attempts++;
    question = generator();
    key = keyExtractor(question);
    if (!ex.has(key)) {
      return { question, key, attempts };
    }
  }
  return { question, key, attempts };
}

module.exports = {
  MAX_ATTEMPTS,
  parseExcludeList,
  generateUnique,
};
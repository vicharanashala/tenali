/**
 * TENALI CHALLENGE MODE — AUTOMATED TEST SUITE
 * ══════════════════════════════════════════════════════════════════════
 *
 * Tests the challenge mode (You Guess) backend logic, security controls,
 * and decoupling events in challengeService.js.
 *
 * Run with:  node test_challenge.js
 */

'use strict';

const jwt = require('jsonwebtoken');
const challengeService = require('./challengeService');
const mindReaderEvents = require('./mindReaderEvents');
const { CONCEPTS, QUESTIONS } = require('./mindReaderKB');

const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${label}`);
    failed++;
  }
}

function assertEqual(a, b, label) {
  assert(a === b, `${label}  (got: ${JSON.stringify(a)}, want: ${JSON.stringify(b)})`);
}

function section(title) {
  console.log(`\n─── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`);
}

// Clear the settled JTIs cache before/after tests
challengeService._settledJtis.clear();

// ─── Test Case 1: Invalid Scope ──────────────────────────────────────────────
section('Test Case 1: Invalid Scope');
try {
  challengeService.startChallenge('subject', 'NonExistentSubject');
  assert(false, 'Should have thrown an error for invalid subject scope');
} catch (err) {
  assertEqual(err.statusCode, 400, 'Invalid subject scope throws 400 error');
  assertEqual(err.message, 'No candidate concepts found for the selected scope.', 'Error message matches expectation');
}

// ─── Test Case 2: Valid Scope ────────────────────────────────────────────────
section('Test Case 2: Valid Scope');
const startRes = challengeService.startChallenge('subject', 'Algebra', 10);
assert(startRes.token !== undefined, 'Start challenge returns a JWT token');
assert(startRes.candidates.length > 0, 'Start challenge returns candidates');
assertEqual(startRes.maxQuestions, 10, 'maxQuestions is respected');

// Verify candidate filtering
const containsNonAlgebra = startRes.candidates.some(cand => {
  const fullConcept = CONCEPTS.find(c => c.id === cand.id);
  return fullConcept.subject.toLowerCase() !== 'algebra';
});
assert(!containsNonAlgebra, 'Candidates are correctly filtered by Algebra subject scope');

// ─── Test Case 3: Invalid JWT ────────────────────────────────────────────────
section('Test Case 3: Invalid/Malformed JWT');
try {
  challengeService.askQuestion('garbage-token-xyz', 'q_geometry');
  assert(false, 'Should have thrown error for malformed token');
} catch (err) {
  assertEqual(err.statusCode, 401, 'Malformed token throws 401 error');
}

// ─── Test Case 4: Expired JWT ────────────────────────────────────────────────
section('Test Case 4: Expired JWT');
const expiredToken = jwt.sign(
  { jti: 'expired-123', conceptId: 'matrix', maxQuestions: 15 },
  JWT_SECRET,
  { expiresIn: '-1s' }
);
try {
  challengeService.askQuestion(expiredToken, 'q_geometry');
  assert(false, 'Should have thrown error for expired token');
} catch (err) {
  assertEqual(err.statusCode, 401, 'Expired token throws 401 error');
  assertEqual(err.message, 'Invalid or expired session token.', 'Correct error message for expired token');
}

// ─── Test Case 5: Ask Question ───────────────────────────────────────────────
section('Test Case 5: Ask Question');
const token = startRes.token;
const decoded = jwt.verify(token, JWT_SECRET);
const conceptId = decoded.conceptId;
const targetConcept = CONCEPTS.find(c => c.id === conceptId);

const qSample = QUESTIONS[0];
const askRes = challengeService.askQuestion(token, qSample.id);
const expectedAns = targetConcept.answers[qSample.id] === true ? 'yes' : (targetConcept.answers[qSample.id] === false ? 'no' : 'dontknow');
assertEqual(askRes.answer, expectedAns, `Asking ${qSample.id} returns correct answer: ${expectedAns}`);

// ─── Test Case 6: Correct Guess and Decoupled Event ─────────────────────────
section('Test Case 6: Correct Guess & Decoupled Rating Event');
let eventEmitted = false;
let emittedData = null;

mindReaderEvents.once('challengeCompleted', (data) => {
  eventEmitted = true;
  emittedData = data;
  // Mutate resultCollector to simulate index.js listener
  data.resultCollector.mrr = 1020;
  data.resultCollector.authenticated = true;
});

const guessRes = challengeService.guessConcept(token, conceptId, 3, false, { username: 'testuser' });
assert(guessRes.correct === true, 'Correct guess returns correct: true');
assert(guessRes.ended === true, 'Correct guess ends the game');
assertEqual(guessRes.concept.id, conceptId, 'Returns the correct concept details');
assert(guessRes.bestQuestions.length > 0, 'Returns top discriminative questions');
assertEqual(eventEmitted, true, 'challengeCompleted event was emitted decoupledly');
assertEqual(emittedData.outcome, 'win', 'Event reports outcome: win');
assertEqual(emittedData.questionsCount, 3, 'Event reports correct questions count');
assertEqual(guessRes.result.mrr, 1020, 'Event listener successfully updated resultCollector MRR');

// ─── Test Case 7: Token Replay Prevention ────────────────────────────────────
section('Test Case 7: Replay Attack Prevention');
// Since token was settled in Test Case 6, its JTI is cached
try {
  challengeService.askQuestion(token, 'q_geometry');
  assert(false, 'Replaying settled token should fail');
} catch (err) {
  assertEqual(err.statusCode, 409, 'Replay of settled token returns 409 Conflict');
  assertEqual(err.message, 'This game session has already concluded.', 'Correct replay error message');
}

try {
  challengeService.guessConcept(token, conceptId, 4, false);
  assert(false, 'Replaying guess on settled token should fail');
} catch (err) {
  assertEqual(err.statusCode, 409, 'Replay of guess on settled token returns 409 Conflict');
}

// ─── Test Case 8: Limit Enforcement ──────────────────────────────────────────
section('Test Case 8: Question Limit Enforcement');
const session2 = challengeService.startChallenge('curriculum', '', 5);
const token2 = session2.token;
const decoded2 = jwt.verify(token2, JWT_SECRET);
const wrongConcept = CONCEPTS.find(c => c.id !== decoded2.conceptId);

// Guess incorrectly before limit
const guess1 = challengeService.guessConcept(token2, wrongConcept.id, 2, false);
assertEqual(guess1.correct, false, 'Incorrect guess returns correct: false');
assertEqual(guess1.ended, false, 'Game does not end on incorrect guess before limit');

// Guess incorrectly at limit
let eventEmitted2 = false;
let emittedData2 = null;
mindReaderEvents.once('challengeCompleted', (data) => {
  eventEmitted2 = true;
  emittedData2 = data;
  data.resultCollector.mrr = 995;
});

const guess2 = challengeService.guessConcept(token2, wrongConcept.id, 5, false);
assertEqual(guess2.correct, false, 'Incorrect guess at limit returns correct: false');
assertEqual(guess2.ended, true, 'Game ends when question limit is reached');
assertEqual(guess2.concept.id, decoded2.conceptId, 'Returns correct concept details upon limit hit');
assertEqual(eventEmitted2, true, 'Emits challengeCompleted on limit hit');
assertEqual(emittedData2.outcome, 'loss', 'Outcome is logged as a loss');
assertEqual(guess2.result.mrr, 995, 'MRR deduction applied successfully');

// ─── Test Summary ────────────────────────────────────────────────────────────
section('Test Summary');
console.log(`Passed: ${passed}/${passed + failed}`);
if (failed > 0) {
  console.error('✗ Some tests failed!');
  process.exit(1);
} else {
  console.log('✓ All challenge tests passed successfully!');
}

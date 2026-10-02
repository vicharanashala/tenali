'use strict';
// Integration tests for the BKT → LIL mastery pipeline (#289).
//
// These run against a real mongod on 127.0.0.1:27017 using a scratch database
// that is dropped afterwards (same convention as conceptPlaygrounds.test.js and
// auth.test.js). MongoDB is required: if the connection cannot be established
// the suite fails rather than silently skipping the behavioural assertions.
//
// They exercise the real stack rather than mocking it:
//   masteryEngine.update() → lib/bkt.bktUpdate() → ConceptMastery persistence

const mongoose = require('mongoose');

const TEST_DB = 'mongodb://127.0.0.1:27017/tenali_lil_mastery_test';

let ConceptMastery;
let masteryEngine;
let DEFAULT_PARAMS;
let MASTERY_THRESHOLD;

beforeAll(async () => {
  await mongoose.connect(TEST_DB);

  // Require after connecting so the models bind to this connection.
  ({ ConceptMastery } = require('../lil/models'));
  masteryEngine = require('../lil/masteryEngine');
  ({ DEFAULT_PARAMS } = require('../lib/bkt'));
  ({ MASTERY_THRESHOLD } = require('../lil/constants'));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await ConceptMastery.deleteMany({});
});

// ─── 1. Correct answer raises pMastery ────────────────────────────────────────

test('correct answer raises pMastery and persists it', async () => {
  const userId = new mongoose.Types.ObjectId();
  const topicId = 'correct-raises';

  const result = await masteryEngine.update(userId, topicId, true);

  expect(result.pMastery).toBeGreaterThan(DEFAULT_PARAMS.pInit);

  const stored = await ConceptMastery.findOne({ userId, topicId });
  expect(stored).not.toBeNull();
  expect(stored.pMastery).toBe(result.pMastery);
  expect(stored.pMastery).toBeGreaterThan(DEFAULT_PARAMS.pInit);
});

// ─── 2. Wrong answer lowers pMastery ─────────────────────────────────────────

test('wrong answer lowers pMastery and persists it', async () => {
  const userId = new mongoose.Types.ObjectId();
  const topicId = 'wrong-lowers';

  await ConceptMastery.create({
    userId,
    topicId,
    isMastered: false,
    incorrectStreak: 0,
    pMastery: 0.8,
    displayedMasteryPercent: 80
  });

  const result = await masteryEngine.update(userId, topicId, false);

  expect(result.pMastery).toBeLessThan(0.8);

  const stored = await ConceptMastery.findOne({ userId, topicId });
  expect(stored.pMastery).toBeLessThan(0.8);
  expect(stored.pMastery).toBe(result.pMastery);
});

// ─── 3. isMastered is determined only by the 0.85 threshold ──────────────────

describe('threshold controls isMastered', () => {
  test('pMastery below threshold → isMastered false even if record was flagged true', async () => {
    const userId = new mongoose.Types.ObjectId();
    const topicId = 'below-threshold';

    // Stale/inconsistent flag: record says mastered, but pMastery is below 0.85.
    await ConceptMastery.create({
      userId,
      topicId,
      isMastered: true,
      incorrectStreak: 0,
      pMastery: 0.8,
      displayedMasteryPercent: 80,
      completedAt: new Date()
    });

    const result = await masteryEngine.update(userId, topicId, true);

    // 0.8 + one correct → ~0.825966, still < 0.85.
    expect(result.pMastery).toBeLessThan(MASTERY_THRESHOLD);
    expect(result.isMastered).toBe(false);

    const stored = await ConceptMastery.findOne({ userId, topicId });
    expect(stored.isMastered).toBe(false);
  });

  test('pMastery at/above threshold → isMastered true even if record was flagged false', async () => {
    const userId = new mongoose.Types.ObjectId();
    const topicId = 'above-threshold';

    // Stale/inconsistent flag: record says not mastered, but pMastery is 0.85.
    await ConceptMastery.create({
      userId,
      topicId,
      isMastered: false,
      incorrectStreak: 0,
      pMastery: 0.85,
      displayedMasteryPercent: 85
    });

    const result = await masteryEngine.update(userId, topicId, true);

    // 0.85 + one correct → ~0.869678, ≥ 0.85.
    expect(result.pMastery).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
    expect(result.isMastered).toBe(true);

    const stored = await ConceptMastery.findOne({ userId, topicId });
    expect(stored.isMastered).toBe(true);
  });
});

// ─── 4. One correct answer is not mastery ────────────────────────────────────

test('one correct answer from pInit=0.3 does not mark the concept mastered', async () => {
  const userId = new mongoose.Types.ObjectId();
  const topicId = 'one-correct';

  const result = await masteryEngine.update(userId, topicId, true);

  expect(result.isMastered).toBe(false);
  expect(result.pMastery).toBeLessThan(MASTERY_THRESHOLD);
  // Actual first-step value from lib/bkt for pInit=0.3, correct.
  expect(result.pMastery).toBeCloseTo(0.373717, 5);

  const stored = await ConceptMastery.findOne({ userId, topicId });
  expect(stored.isMastered).toBe(false);
  expect(stored.pMastery).toBeCloseTo(0.373717, 5);
});

// ─── 5. newlyMastered fires only on a false → true transition ────────────────

test('newlyMastered is true only on false → true and false on true → true', async () => {
  const userId = new mongoose.Types.ObjectId();
  const topicId = 'newly-mastered';

  await ConceptMastery.create({
    userId,
    topicId,
    isMastered: false,
    incorrectStreak: 0,
    pMastery: 0.84,
    displayedMasteryPercent: 84
  });

  // false → true: 0.84 + correct → ~0.860948, crosses 0.85.
  const first = await masteryEngine.update(userId, topicId, true);
  expect(first.pMastery).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
  expect(first.isMastered).toBe(true);
  expect(first.newlyMastered).toBe(true);

  const storedAfterFirst = await ConceptMastery.findOne({ userId, topicId });
  expect(storedAfterFirst.completedAt).toBeInstanceOf(Date);

  // true → true: already mastered, another correct must not re-fire the event.
  const second = await masteryEngine.update(userId, topicId, true);
  expect(second.isMastered).toBe(true);
  expect(second.newlyMastered).toBe(false);
});

// ─── 6. incorrectStreak is telemetry only ────────────────────────────────────

test('incorrectStreak increments/resets but never independently forces regression', async () => {
  const userId = new mongoose.Types.ObjectId();
  const topicId = 'streak-telemetry';

  await ConceptMastery.create({
    userId,
    topicId,
    isMastered: true,
    incorrectStreak: 0,
    pMastery: 0.99,
    displayedMasteryPercent: 99,
    completedAt: new Date()
  });

  // Three consecutive wrong answers: the streak reaches 3, but because BKT
  // keeps pMastery above 0.85, mastery must remain true. The old
  // `incorrectStreak >= 3 → isMastered = false` rule is gone.
  const afterOne = await masteryEngine.update(userId, topicId, false);
  expect(afterOne.incorrectStreak).toBe(1);
  expect(afterOne.pMastery).toBeLessThan(0.99);
  expect(afterOne.isMastered).toBe(afterOne.pMastery >= MASTERY_THRESHOLD);

  const afterTwo = await masteryEngine.update(userId, topicId, false);
  expect(afterTwo.incorrectStreak).toBe(2);
  expect(afterTwo.isMastered).toBe(afterTwo.pMastery >= MASTERY_THRESHOLD);

  const afterThree = await masteryEngine.update(userId, topicId, false);
  expect(afterThree.incorrectStreak).toBe(3);
  // BKT from 0.99 after three wrongs ≈ 0.963672, still ≥ 0.85.
  expect(afterThree.pMastery).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
  expect(afterThree.isMastered).toBe(true);

  const stored = await ConceptMastery.findOne({ userId, topicId });
  expect(stored.incorrectStreak).toBe(3);
  expect(stored.isMastered).toBe(true);

  // A correct answer is the only thing that resets the streak.
  const afterCorrect = await masteryEngine.update(userId, topicId, true);
  expect(afterCorrect.incorrectStreak).toBe(0);
});

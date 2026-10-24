import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEmotionalState,
  isFriendLocked,
  isDistributionEqual,
  isFairSharingComplete,
  giveChocolate,
  returnChocolate,
  deriveEquation
} from '../divisionLogic.js';

describe('Division Equal Sharing Logic', () => {
  describe('Emotional Feedback Rules (3 States: Neutral, Happy, Sad)', () => {
    test('4 candies, 2 friends: both have 2, jar is empty (0) -> both happy', () => {
      const counts = [2, 2];
      const emotions = getEmotionalState(counts, 0);
      assert.deepEqual(emotions, ['happy', 'happy']);
    });

    test('6 candies, 3 friends: all have 2, jar is empty (0) -> all happy', () => {
      const counts = [2, 2, 2];
      const emotions = getEmotionalState(counts, 0);
      assert.deepEqual(emotions, ['happy', 'happy', 'happy']);
    });

    test('5 candies, 3 friends: two have 2, one has 1 -> two neutral, one sad', () => {
      const counts = [2, 2, 1];
      const emotions = getEmotionalState(counts, 0);
      assert.deepEqual(emotions, ['neutral', 'neutral', 'sad']);
    });

    test('7 candies, 2 friends: both have 3, one leftover in jar (1 < 2) -> both happy', () => {
      const counts = [3, 3];
      const emotions = getEmotionalState(counts, 1);
      assert.deepEqual(emotions, ['happy', 'happy']);
      assert.equal(isDistributionEqual(counts), true);
      assert.equal(isFairSharingComplete(counts, 1), true);
    });

    test('8 candies, 3 friends (unequal): two have 3, one has 2 -> two neutral, one sad', () => {
      const counts = [3, 3, 2];
      const emotions = getEmotionalState(counts, 0);
      assert.deepEqual(emotions, ['neutral', 'neutral', 'sad']);
      assert.equal(isDistributionEqual(counts), false);
    });

    test('8 candies, 3 friends (fair share): all have 2, two left in jar (2 < 3) -> all happy', () => {
      const counts = [2, 2, 2];
      const emotions = getEmotionalState(counts, 2);
      assert.deepEqual(emotions, ['happy', 'happy', 'happy']);
      assert.equal(isDistributionEqual(counts), true);
      assert.equal(isFairSharingComplete(counts, 2), true);
    });

    test('Equal candies but jar still has enough to share (8 candies, 4 friends: each has 1, jar has 4) -> all neutral', () => {
      const counts = [1, 1, 1, 1];
      const emotions = getEmotionalState(counts, 4);
      assert.deepEqual(emotions, ['neutral', 'neutral', 'neutral', 'neutral']);
    });

    test('Equal candies but jar can share another round (4 candies, 2 friends: each has 1, jar has 2) -> all neutral', () => {
      const counts = [1, 1];
      const emotions = getEmotionalState(counts, 2);
      assert.deepEqual(emotions, ['neutral', 'neutral']);
    });

    test('Initial state: all 0 candies, jar has candies -> all neutral', () => {
      const counts = [0, 0, 0];
      const emotions = getEmotionalState(counts, 6);
      assert.deepEqual(emotions, ['neutral', 'neutral', 'neutral']);
    });

    test('Unequal distribution during round: one friend has 1, others have 0 -> friend with 1 is neutral, others are sad', () => {
      const counts = [1, 0, 0];
      const emotions = getEmotionalState(counts, 5);
      assert.deepEqual(emotions, ['neutral', 'sad', 'sad']);
    });
  });

  describe('One-Chocolate-at-a-Time Equal-Sharing Lock', () => {
    test('giving one chocolate locks that friend until other friends receive one', () => {
      let counts = [0, 0, 0];
      let jar = 6;

      // Friend 0 receives 1
      assert.equal(isFriendLocked(0, counts), false);
      let step1 = giveChocolate(0, counts, jar);
      assert.ok(step1);
      counts = step1.counts;
      jar = step1.jarCount;
      assert.deepEqual(counts, [1, 0, 0]);
      assert.equal(jar, 5);

      // Friend 0 is now locked!
      assert.equal(isFriendLocked(0, counts), true);
      assert.equal(isFriendLocked(1, counts), false);
      assert.equal(isFriendLocked(2, counts), false);

      // Attempting to give to Friend 0 again fails
      assert.equal(giveChocolate(0, counts, jar), null);

      // Give to Friend 1
      let step2 = giveChocolate(1, counts, jar);
      assert.ok(step2);
      counts = step2.counts;
      jar = step2.jarCount;
      assert.deepEqual(counts, [1, 1, 0]);
      assert.equal(jar, 4);

      // Friends 0 and 1 are locked; only Friend 2 is available
      assert.equal(isFriendLocked(0, counts), true);
      assert.equal(isFriendLocked(1, counts), true);
      assert.equal(isFriendLocked(2, counts), false);

      // Give to Friend 2
      let step3 = giveChocolate(2, counts, jar);
      assert.ok(step3);
      counts = step3.counts;
      jar = step3.jarCount;
      assert.deepEqual(counts, [1, 1, 1]);
      assert.equal(jar, 3);

      // Round complete: ALL FRIENDS UNLOCKED!
      assert.equal(isFriendLocked(0, counts), false);
      assert.equal(isFriendLocked(1, counts), false);
      assert.equal(isFriendLocked(2, counts), false);
      assert.equal(isDistributionEqual(counts), true);
    });

    test('cannot give chocolate if jar is empty', () => {
      const counts = [2, 2];
      const jar = 0;
      assert.equal(giveChocolate(0, counts, jar), null);
      assert.equal(giveChocolate(1, counts, jar), null);
    });

    test('returning chocolate works and updates counts and jar correctly', () => {
      let counts = [2, 1, 1];
      let jar = 0;
      let ret = returnChocolate(0, counts, jar);
      assert.ok(ret);
      assert.deepEqual(ret.counts, [1, 1, 1]);
      assert.equal(ret.jarCount, 1);
      // Now all are equal again and happy
      assert.deepEqual(getEmotionalState(ret.counts), ['happy', 'happy', 'happy']);
    });

    test('allowFree=true enables giving multiple candies to same friend for free experimentation', () => {
      let counts = [0, 0];
      let jar = 7;

      // In free mode, friend 0 can receive multiple chocolates sequentially without waiting
      let step1 = giveChocolate(0, counts, jar, true);
      assert.ok(step1);
      assert.deepEqual(step1.counts, [1, 0]);

      let step2 = giveChocolate(0, step1.counts, step1.jarCount, true);
      assert.ok(step2);
      assert.deepEqual(step2.counts, [2, 0]);

      let step3 = giveChocolate(0, step2.counts, step2.jarCount, true);
      assert.ok(step3);
      assert.deepEqual(step3.counts, [3, 0]);
    });

    test('Leftover experimentation scenario: 7 candies, 2 friends', () => {
      // 1. Student gives 4 candies to Friend 0 and 3 candies to Friend 1
      const unequalCounts = [4, 3];
      const unequalEmotions = getEmotionalState(unequalCounts, 0);
      assert.deepEqual(unequalEmotions, ['neutral', 'sad']);
      assert.equal(isDistributionEqual(unequalCounts), false);

      // 2. Student returns the 4th candy from Friend 0 back to the jar
      const corrected = returnChocolate(0, unequalCounts, 0);
      assert.ok(corrected);
      assert.deepEqual(corrected.counts, [3, 3]);
      assert.equal(corrected.jarCount, 1);

      // 3. Now both have 3 candies, 1 leftover remains in jar -> both happy!
      const finalEmotions = getEmotionalState(corrected.counts, corrected.jarCount);
      assert.deepEqual(finalEmotions, ['happy', 'happy']);
      assert.equal(isDistributionEqual(corrected.counts), true);
      assert.equal(isFairSharingComplete(corrected.counts, corrected.jarCount), true);
    });
  });

  describe('Equation & Terminology Derivation', () => {
    test('exact division: 6 ÷ 2', () => {
      const eq = deriveEquation(6, 2, 3, 0);
      assert.equal(eq.equationString, '6 = 2 × 3');
      assert.equal(eq.formalTerms.dividend, 6);
      assert.equal(eq.formalTerms.divisor, 2);
      assert.equal(eq.formalTerms.quotient, 3);
      assert.equal(eq.formalTerms.remainder, 0);
    });

    test('division with remainder: 7 ÷ 2', () => {
      const eq = deriveEquation(7, 2, 3, 1);
      assert.equal(eq.equationString, '7 = 2 × 3 + 1');
      assert.equal(eq.formalTerms.dividend, 7);
      assert.equal(eq.formalTerms.divisor, 2);
      assert.equal(eq.formalTerms.quotient, 3);
      assert.equal(eq.formalTerms.remainder, 1);
    });

    test('division with remainder: 10 ÷ 3', () => {
      const eq = deriveEquation(10, 3, 3, 1);
      assert.equal(eq.equationString, '10 = 3 × 3 + 1');
      assert.equal(eq.formalTerms.dividend, 10);
      assert.equal(eq.formalTerms.divisor, 3);
      assert.equal(eq.formalTerms.quotient, 3);
      assert.equal(eq.formalTerms.remainder, 1);
    });
  });
});

'use strict';
// Unit tests for server/lib/scoring.js — the central reward rule-book (issue #88).
// Pure-function tests: no mocks, no DB, no Express. Runs as part of `npm test`.

const {
  REWARD_RULES,
  DIFFICULTY_KEYS,
  MILESTONE_EVENTS,
  difficultyKey,
  coinsForCorrectAnswer,
  coinsForIncorrectAnswer,
  coinsForHintUnlock,
  coinsForReviewCompletion,
  coinsForTopicBadge,
  coinsForCollectionCompletion,
  coinsForTransferWin,
  coinsForDailyCheckin,
  isStreakMilestone,
  streakMilestones,
  streakMilestoneEvent,
} = require('../lib/scoring');

// ── difficultyKey ───────────────────────────────────────────────────────────
describe('difficultyKey', () => {
  test.each([0, 1, 2, 3])('number %i → matching key', (n) => {
    expect(difficultyKey(n)).toBe(DIFFICULTY_KEYS[n]);
  });
  test('clips numbers above 3', () => {
    expect(difficultyKey(99)).toBe('extrahard');
  });
  test('clamps negative numbers to easy', () => {
    expect(difficultyKey(-1)).toBe('easy');
  });
  test.each(['easy', 'medium', 'hard', 'extrahard'])(
    'passes through string %i',
    (k) => expect(difficultyKey(k)).toBe(k)
  );
  test('unknown strings collapse to easy', () => {
    expect(difficultyKey('foo')).toBe('easy');
    expect(difficultyKey(undefined)).toBe('easy');
    expect(difficultyKey(null)).toBe('easy');
  });
});

// ── coinsForCorrectAnswer ────────────────────────────────────────────────────
describe('coinsForCorrectAnswer', () => {
  test('easy/medium/hard/extrahard match the table', () => {
    expect(coinsForCorrectAnswer('easy')).toEqual({ coins: 5, xp: 10 });
    expect(coinsForCorrectAnswer('medium')).toEqual({ coins: 8, xp: 10 });
    expect(coinsForCorrectAnswer('hard')).toEqual({ coins: 12, xp: 15 });
    expect(coinsForCorrectAnswer('extrahard')).toEqual({ coins: 16, xp: 20 });
  });
  test('numeric difficulty maps to the same table', () => {
    expect(coinsForCorrectAnswer(0)).toEqual({ coins: 5, xp: 10 });
    expect(coinsForCorrectAnswer(3)).toEqual({ coins: 16, xp: 20 });
  });
  test('speed doubles coins, keeps XP identical', () => {
    const standard = coinsForCorrectAnswer('medium');
    const speedy = coinsForCorrectAnswer('medium', { speed: true });
    expect(speedy.xp).toBe(standard.xp);
    expect(speedy.coins).toBe(standard.coins * 2);
  });
  test('returns a fresh object per call (no shared references)', () => {
    const a = coinsForCorrectAnswer('easy');
    const b = coinsForCorrectAnswer('easy');
    expect(a).not.toBe(b);
    a.coins = 999;
    expect(b.coins).toBe(5);
  });
});

// ── coinsForIncorrectAnswer ──────────────────────────────────────────────────
describe('coinsForIncorrectAnswer', () => {
  test('effort XP only, zero coins', () => {
    expect(coinsForIncorrectAnswer()).toEqual({ coins: 0, xp: 2 });
  });
});

// ── coinsForHintUnlock ───────────────────────────────────────────────────────
describe('coinsForHintUnlock', () => {
  test('tier 1/2/3 cost matches hintSpecs.js#COSTS', () => {
    expect(coinsForHintUnlock(1)).toBe(5);
    expect(coinsForHintUnlock(2)).toBe(8);
    expect(coinsForHintUnlock(3)).toBe(10);
  });
  test('clamps out-of-range tiers', () => {
    expect(coinsForHintUnlock(0)).toBe(5);
    expect(coinsForHintUnlock(99)).toBe(10);
    expect(coinsForHintUnlock(-1)).toBe(5);
  });
  test('non-numeric input → tier 1', () => {
    expect(coinsForHintUnlock('loud')).toBe(5);
  });
});

// ── coinsForReviewCompletion ─────────────────────────────────────────────────
describe('coinsForReviewCompletion', () => {
  test('5 coins, 15 XP per review session', () => {
    expect(coinsForReviewCompletion()).toEqual({ coins: 5, xp: 15 });
  });
});

// ── coinsForTopicBadge ──────────────────────────────────────────────────────
describe('coinsForTopicBadge', () => {
  test('bronze/silver/gold scale up', () => {
    expect(coinsForTopicBadge('bronze')).toEqual({ coins: 25, xp: 25 });
    expect(coinsForTopicBadge('silver')).toEqual({ coins: 50, xp: 50 });
    expect(coinsForTopicBadge('gold')).toEqual({ coins: 100, xp: 100 });
  });
  test('started awards zero reward', () => {
    expect(coinsForTopicBadge('started')).toEqual({ coins: 0, xp: 0 });
  });
  test('unknown levels collapse to started', () => {
    expect(coinsForTopicBadge('platinum')).toEqual({ coins: 0, xp: 0 });
  });
});

// ── coinsForCollectionCompletion ─────────────────────────────────────────────
describe('coinsForCollectionCompletion', () => {
  test('per-collection override wins', () => {
    expect(coinsForCollectionCompletion({ coinReward: 175 }))
      .toEqual({ coins: 175, xp: 0 });
  });
  test('falls back to the rule-book default when missing', () => {
    expect(coinsForCollectionCompletion({}))
      .toEqual({ coins: REWARD_RULES.COLLECTION_DEFAULT_COIN_REWARD, xp: 0 });
    expect(coinsForCollectionCompletion(null))
      .toEqual({ coins: REWARD_RULES.COLLECTION_DEFAULT_COIN_REWARD, xp: 0 });
  });
  test('non-numeric coinReward falls back to default', () => {
    expect(coinsForCollectionCompletion({ coinReward: 'lots' }))
      .toEqual({ coins: REWARD_RULES.COLLECTION_DEFAULT_COIN_REWARD, xp: 0 });
  });
});

// ── coinsForTransferWin ─────────────────────────────────────────────────────
describe('coinsForTransferWin', () => {
  test('awards 150 coins, no XP', () => {
    expect(coinsForTransferWin()).toEqual({ coins: 150, xp: 0 });
  });
});

// ── coinsForDailyCheckin ────────────────────────────────────────────────────
describe('coinsForDailyCheckin', () => {
  test('5 XP, 0 coins', () => {
    expect(coinsForDailyCheckin()).toEqual({ coins: 0, xp: 5 });
  });
});

// ── streak milestone predicates ──────────────────────────────────────────────
describe('streak milestones', () => {
  test('STREAK_MILESTONES is the documented [3, 7, 15, 30]', () => {
    expect(streakMilestones()).toEqual([3, 7, 15, 30]);
    expect(REWARD_RULES.STREAK_MILESTONES).toEqual([3, 7, 15, 30]);
  });
  test('isStreakMilestone flags exactly the threshold values', () => {
    [0, 1, 2, 3, 6, 7, 8, 14, 15, 29, 30, 31].forEach((d) => {
      const expected = d === 3 || d === 7 || d === 15 || d === 30;
      expect(isStreakMilestone(d)).toBe(expected);
    });
  });
  test('streakMilestoneEvent formats the event string', () => {
    expect(streakMilestoneEvent(7)).toBe('Reached a 7-Day Streak!');
    expect(streakMilestoneEvent(30)).toBe('Reached a 30-Day Streak!');
  });
  test('MILESTONE_EVENTS exports stable factory functions', () => {
    expect(MILESTONE_EVENTS.JOINED).toBe('Joined Tenali');
    expect(MILESTONE_EVENTS.TOPIC_GOLD('Fractions')).toBe('Unlocked Gold in Fractions');
    expect(MILESTONE_EVENTS.COLLECTION('Multiplication Masters'))
      .toBe('Mastered Multiplication Masters');
  });
});

// ── tables are frozen (regression guard) ─────────────────────────────────────
describe('rule-book tables are immutable', () => {
  test('REWARD_RULES cannot be reassigned properties', () => {
    expect(() => { REWARD_RULES.NEW_RULE = {}; }).toThrow();
  });
  test('nested QUIZ_CORRECT entries are also frozen', () => {
    expect(() => { REWARD_RULES.QUIZ_CORRECT.easy.coins = 999; }).toThrow();
  });
});
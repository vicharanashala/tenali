'use strict';

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

describe('scoring rule-book (#88)', () => {
  describe('immutability', () => {
    test('REWARD_RULES and nested tables are frozen', () => {
      expect(Object.isFrozen(REWARD_RULES)).toBe(true);
      expect(Object.isFrozen(REWARD_RULES.QUIZ_CORRECT)).toBe(true);
      expect(Object.isFrozen(REWARD_RULES.QUIZ_CORRECT.easy)).toBe(true);
      expect(Object.isFrozen(REWARD_RULES.TOPIC_BADGE)).toBe(true);
      expect(Object.isFrozen(REWARD_RULES.HINT_UNLOCK)).toBe(true);
      expect(Object.isFrozen(REWARD_RULES.STREAK_MILESTONES)).toBe(true);
    });

    test('helpers return fresh objects so callers cannot mutate rule tables', () => {
      const first = coinsForCorrectAnswer('easy');
      first.coins = 9999;
      const second = coinsForCorrectAnswer('easy');
      expect(second.coins).toBe(5);
    });
  });

  describe('difficultyKey', () => {
    test('normalizes numeric difficulty (0..3)', () => {
      expect(difficultyKey(0)).toBe('easy');
      expect(difficultyKey(1)).toBe('medium');
      expect(difficultyKey(2)).toBe('hard');
      expect(difficultyKey(3)).toBe('extrahard');
    });

    test('clamps out-of-bounds numeric difficulty', () => {
      expect(difficultyKey(-5)).toBe('easy');
      expect(difficultyKey(99)).toBe('extrahard');
    });

    test('normalizes case-insensitive string difficulty', () => {
      expect(difficultyKey('EASY')).toBe('easy');
      expect(difficultyKey('Medium')).toBe('medium');
      expect(difficultyKey('HARD')).toBe('hard');
      expect(difficultyKey('extraHARD')).toBe('extrahard');
    });

    test('falls back to easy for unknown or null inputs', () => {
      expect(difficultyKey(null)).toBe('easy');
      expect(difficultyKey(undefined)).toBe('easy');
      expect(difficultyKey('legendary')).toBe('easy');
    });
  });

  describe('reward calculation helpers', () => {
    test('coinsForCorrectAnswer', () => {
      expect(coinsForCorrectAnswer('easy')).toEqual({ coins: 5, xp: 10 });
      expect(coinsForCorrectAnswer('medium')).toEqual({ coins: 8, xp: 10 });
      expect(coinsForCorrectAnswer('hard')).toEqual({ coins: 12, xp: 15 });
      expect(coinsForCorrectAnswer('extrahard')).toEqual({ coins: 16, xp: 20 });
    });

    test('coinsForCorrectAnswer with speed multiplier', () => {
      expect(coinsForCorrectAnswer('easy', { speed: true })).toEqual({ coins: 10, xp: 10 });
      expect(coinsForCorrectAnswer('hard', { speed: true })).toEqual({ coins: 24, xp: 15 });
    });

    test('coinsForIncorrectAnswer', () => {
      expect(coinsForIncorrectAnswer()).toEqual({ coins: 0, xp: 2 });
    });

    test('coinsForHintUnlock', () => {
      expect(coinsForHintUnlock(1)).toBe(5);
      expect(coinsForHintUnlock(2)).toBe(8);
      expect(coinsForHintUnlock(3)).toBe(10);
      expect(coinsForHintUnlock(99)).toBe(10); // clamped
      expect(coinsForHintUnlock('invalid')).toBe(5);
    });

    test('coinsForReviewCompletion', () => {
      expect(coinsForReviewCompletion()).toEqual({ coins: 5, xp: 15 });
    });

    test('coinsForTopicBadge', () => {
      expect(coinsForTopicBadge('bronze')).toEqual({ coins: 25, xp: 25 });
      expect(coinsForTopicBadge('silver')).toEqual({ coins: 50, xp: 50 });
      expect(coinsForTopicBadge('gold')).toEqual({ coins: 100, xp: 100 });
      expect(coinsForTopicBadge('unknown')).toEqual({ coins: 0, xp: 0 });
    });

    test('coinsForCollectionCompletion', () => {
      expect(coinsForCollectionCompletion(null)).toEqual({ coins: 100, xp: 0 });
      expect(coinsForCollectionCompletion({ coinReward: 200 })).toEqual({ coins: 200, xp: 0 });
      expect(coinsForCollectionCompletion({ coinReward: 'invalid' })).toEqual({ coins: 100, xp: 0 });
    });

    test('coinsForTransferWin', () => {
      expect(coinsForTransferWin()).toEqual({ coins: 150, xp: 0 });
    });

    test('coinsForDailyCheckin', () => {
      expect(coinsForDailyCheckin()).toEqual({ coins: 0, xp: 5 });
    });
  });

  describe('streak helpers', () => {
    test('isStreakMilestone', () => {
      expect(isStreakMilestone(3)).toBe(true);
      expect(isStreakMilestone(7)).toBe(true);
      expect(isStreakMilestone(15)).toBe(true);
      expect(isStreakMilestone(30)).toBe(true);
      expect(isStreakMilestone(4)).toBe(false);
      expect(isStreakMilestone(0)).toBe(false);
    });

    test('streakMilestones returns a copy', () => {
      const arr = streakMilestones();
      expect(arr).toEqual([3, 7, 15, 30]);
      arr.push(99);
      expect(streakMilestones()).toEqual([3, 7, 15, 30]);
    });

    test('streakMilestoneEvent', () => {
      expect(streakMilestoneEvent(7)).toBe('Reached a 7-Day Streak!');
    });
  });
});

import { describe, test, expect } from 'vitest';
import {
  starsForHints,
  computeCaseRewards,
  resolveCaseReward,
} from './detective-rewards';

const classicCase = { id: 'case-1', xpReward: 100 };
const enhancedCase = { id: 'case-enhanced-1', xpReward: 100 };

describe('stars and attempt rewards', () => {
  test('stars drop as more hints are used', () => {
    expect(starsForHints(0)).toBe(3);
    expect(starsForHints(1)).toBe(2);
    expect(starsForHints(2)).toBe(2);
    expect(starsForHints(3)).toBe(1);
  });

  test('classic cases use the base XP table', () => {
    expect(computeCaseRewards(classicCase, 0)).toEqual({ stars: 3, xpEarned: 100, enhanced: false });
    expect(computeCaseRewards(classicCase, 1).xpEarned).toBe(70);
    expect(computeCaseRewards(classicCase, 3).xpEarned).toBe(40);
  });

  test('enhanced cases carry the 1.5x bonus shown on the completion screen', () => {
    expect(computeCaseRewards(enhancedCase, 0)).toEqual({ stars: 3, xpEarned: 150, enhanced: true });
    expect(computeCaseRewards(enhancedCase, 1).xpEarned).toBe(105);
    expect(computeCaseRewards(enhancedCase, 3).xpEarned).toBe(60);
  });
});

describe('best-of replay accounting', () => {
  test('first completion awards the full reward', () => {
    const award = resolveCaseReward(classicCase, 0, undefined);
    expect(award.xpAwarded).toBe(100);
    expect(award.starsAwarded).toBe(3);
    expect(award.bestXp).toBe(100);
    expect(award.bestStars).toBe(3);
    expect(award.isImprovement).toBe(true);
  });

  test('repeating the same result awards nothing', () => {
    const award = resolveCaseReward(classicCase, 0, { status: 'solved', stars: 3, xpEarned: 100, hintLevel: 0 });
    expect(award.xpAwarded).toBe(0);
    expect(award.starsAwarded).toBe(0);
    expect(award.bestXp).toBe(100);
    expect(award.bestStars).toBe(3);
    expect(award.isImprovement).toBe(false);
  });

  test('a worse replay awards nothing and keeps the recorded best', () => {
    const award = resolveCaseReward(classicCase, 3, { status: 'solved', stars: 3, xpEarned: 100, hintLevel: 0 });
    expect(award.stars).toBe(1);
    expect(award.xpEarned).toBe(40);
    expect(award.xpAwarded).toBe(0);
    expect(award.starsAwarded).toBe(0);
    expect(award.bestXp).toBe(100);
    expect(award.bestStars).toBe(3);
    expect(award.bestHintLevel).toBe(0);
  });

  test('an improved replay awards only the additional XP', () => {
    const award = resolveCaseReward(classicCase, 0, { status: 'solved', stars: 2, xpEarned: 70, hintLevel: 1 });
    expect(award.xpAwarded).toBe(30);
    expect(award.starsAwarded).toBe(1);
    expect(award.bestXp).toBe(100);
    expect(award.bestStars).toBe(3);
    expect(award.bestHintLevel).toBe(0);
    expect(award.isImprovement).toBe(true);
  });

  test('legacy solved entries without reward data never duplicate XP', () => {
    const award = resolveCaseReward(classicCase, 0, { status: 'solved', completedAt: 1 });
    expect(award.xpAwarded).toBe(0);
    expect(award.starsAwarded).toBe(0);
    expect(award.isImprovement).toBe(false);
  });

  test('legacy in-progress snapshots still earn the full reward', () => {
    const award = resolveCaseReward(classicCase, 2, { status: 'in_progress', solvedClues: [0], savedCase: {} });
    expect(award.xpAwarded).toBe(70);
    expect(award.starsAwarded).toBe(2);
  });

  test('enhanced replay improvements use the 1.5x table', () => {
    const award = resolveCaseReward(enhancedCase, 0, { status: 'solved', stars: 1, xpEarned: 60, hintLevel: 4 });
    expect(award.xpEarned).toBe(150);
    expect(award.xpAwarded).toBe(90);
    expect(award.bestHintLevel).toBe(0);
  });
});

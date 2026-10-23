import { describe, it, expect, beforeEach } from 'vitest';
import {
  isStage3Completed,
  getTopicBadgeLevel,
  calculateSectionProgress,
  loadLocalProgress,
  saveLocalProgress,
  addCompletedTopic,
  reconcileProgress,
  STORAGE_KEYS,
} from './progress';

describe('progress feature utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isStage3Completed', () => {
    it('returns false when empty or null', () => {
      expect(isStage3Completed('addition', null)).toBe(false);
      expect(isStage3Completed('addition', [])).toBe(false);
    });

    it('returns true if bare topicKey is present', () => {
      expect(isStage3Completed('addition', ['addition'])).toBe(true);
    });

    it('returns false if only easy or medium is completed', () => {
      expect(isStage3Completed('addition', ['addition-easy'])).toBe(false);
      expect(isStage3Completed('addition', ['addition-easy', 'addition-medium'])).toBe(false);
    });

    it('returns true when easy, medium, and hard are all completed', () => {
      expect(
        isStage3Completed('addition', ['addition-easy', 'addition-medium', 'addition-hard'])
      ).toBe(true);
    });
  });

  describe('getTopicBadgeLevel', () => {
    it('resolves correct badge tiers in hierarchy', () => {
      expect(getTopicBadgeLevel('addition', [])).toBe('locked');
      expect(getTopicBadgeLevel('addition', ['addition-started'])).toBe('blue');
      expect(getTopicBadgeLevel('addition', ['addition-started', 'addition-easy'])).toBe('bronze');
      expect(getTopicBadgeLevel('addition', ['addition-started', 'addition-easy', 'addition-medium'])).toBe('silver');
      expect(getTopicBadgeLevel('addition', ['addition-started', 'addition-easy', 'addition-medium', 'addition-hard'])).toBe('gold');
    });
  });

  describe('calculateSectionProgress', () => {
    it('counts completed topics based on Stage 3 rule', () => {
      const tiles = [
        { key: 'addition' },
        { key: 'basicarith' },
      ];
      const completedTopics = [
        'addition-easy',
        'addition-medium',
        'basicarith-easy',
        'basicarith-medium',
        'basicarith-hard',
      ];
      const { completedCount } = calculateSectionProgress(tiles, completedTopics, []);
      // Only basicarith has all 3 tiers
      expect(completedCount).toBe(1);
    });
  });

  describe('addCompletedTopic', () => {
    it('adds targetKey and startedKey and persists to localStorage', () => {
      const result = addCompletedTopic('addition', 'medium');
      expect(result).toContain('addition-medium');
      expect(result).toContain('addition-started');

      const saved = loadLocalProgress().completedTopics;
      expect(saved).toContain('addition-medium');
      expect(saved).toContain('addition-started');
    });

    it('deduplicates existing keys', () => {
      addCompletedTopic('addition', 'medium');
      const second = addCompletedTopic('addition', 'medium');
      expect(second.filter((k) => k === 'addition-medium').length).toBe(1);
    });
  });

  describe('reconcileProgress', () => {
    it('unifies completed topics and never deletes existing progress', () => {
      saveLocalProgress({
        completedTopics: ['addition-started', 'addition-easy', 'addition-medium', 'addition-hard'],
      });

      // Simulates stale closure from tenaliIncrementSolved sending outdated array
      const staleIncoming = {
        completedTopics: ['addition-started', 'addition-easy', 'addition-medium'],
      };

      const reconciled = reconcileProgress(staleIncoming);
      // addition-hard must NOT be erased!
      expect(reconciled.completedTopics).toContain('addition-hard');

      const reloaded = loadLocalProgress().completedTopics;
      expect(reloaded).toContain('addition-hard');
    });

    it('unifies goldMastery and monotonically preserves numbers', () => {
      saveLocalProgress({
        goldMastery: ['basicarith'],
        coins: 50,
        totalSolved: 10,
        streak: 3,
      });

      const reconciled = reconcileProgress({
        goldMastery: ['addition'],
        coins: 20, // lower
        totalSolved: 15, // higher
        streak: 2, // lower
      });

      expect(reconciled.goldMastery).toEqual(expect.arrayContaining(['basicarith', 'addition']));
      expect(reconciled.coins).toBe(50);
      expect(reconciled.totalSolved).toBe(15);
      expect(reconciled.streak).toBe(3);
    });
  });
});

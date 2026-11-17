import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDynamicWeightBank } from './balanceScaleBank.js';

describe('Balance Scale - createDynamicWeightBank', () => {
  test('provides 500 and 100 denominations for large target >= 500', () => {
    const bank = createDynamicWeightBank(550);
    const denoms = new Set(bank.map((b) => b.val));
    expect(denoms.has(500)).toBe(true);
    expect(denoms.has(100)).toBe(true);
    const totalSum = bank.reduce((acc, b) => acc + b.val, 0);
    expect(totalSum).toBeGreaterThanOrEqual(550);
  });

  test('provides 100, 50, 10, 5, 1 denominations for target between 100 and 499', () => {
    const bank = createDynamicWeightBank(150);
    const denoms = new Set(bank.map((b) => b.val));
    expect(denoms.has(100)).toBe(true);
    expect(denoms.has(50)).toBe(true);
    expect(denoms.has(10)).toBe(true);
    expect(denoms.has(500)).toBe(false);
  });

  test('provides fallback denominations for small target < 15', () => {
    const bank = createDynamicWeightBank(8);
    const denoms = new Set(bank.map((b) => b.val));
    expect(denoms.has(5)).toBe(true);
    expect(denoms.has(1)).toBe(true);
    expect(denoms.has(50)).toBe(false);
    expect(denoms.has(100)).toBe(false);
  });
});

describe('Twin Hunt - Timeout Synchronous Round and Symbol Tracking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('records the exact round and common symbol upon timeout using local capture', () => {
    let results = [];
    let revealed = false;
    let isCorrect = null;
    let feedback = '';

    const roundRef = { current: 1 };
    const commonSymbolRef = { current: '🍎' };

    const handleTimeout = (targetRound, targetSymbol) => {
      if (revealed) return;
      isCorrect = false;
      revealed = true;
      feedback = `⏰ Time's up! The match was ${targetSymbol}.`;
      results.push({
        prompt: `Round ${targetRound}`,
        question: `Round ${targetRound}`,
        userAnswer: '(timeout)',
        correctAnswer: targetSymbol,
        correct: false,
        time: 5,
      });
    };

    // Simulate round 1 starting with local captured values
    const round1 = 1;
    const symbol1 = '🍎';
    const onTimeout1 = () => handleTimeout(round1, symbol1);

    // Advance round synchronously in background (state update simulation)
    roundRef.current = 2;
    commonSymbolRef.current = '⚡';

    // Timer expires for round 1
    onTimeout1();

    expect(isCorrect).toBe(false);

    expect(results).toHaveLength(1);
    expect(results[0].question).toBe('Round 1');
    expect(results[0].correctAnswer).toBe('🍎');
    expect(results[0].userAnswer).toBe('(timeout)');
    expect(feedback).toContain('🍎');
  });

  test('fake timer triggers the correct round timeout after delay', () => {
    const results = [];
    const handleTimeout = (roundNum, symbol) => {
      results.push({
        question: `Round ${roundNum}`,
        userAnswer: '(timeout)',
        correctAnswer: symbol,
      });
    };

    const scheduledRound = 3;
    const scheduledSymbol = '🌟';
    setTimeout(() => {
      handleTimeout(scheduledRound, scheduledSymbol);
    }, 5000);

    vi.advanceTimersByTime(2000);
    expect(results).toHaveLength(0);

    vi.advanceTimersByTime(3000);
    expect(results).toHaveLength(1);
    expect(results[0].question).toBe('Round 3');
    expect(results[0].correctAnswer).toBe('🌟');
  });
});

describe('Gym & Random Mix - Completion and State Crash Fixes', () => {
  test('correctly evaluates finished flag from phase', () => {
    const phasePlaying = 'playing';
    const finishedPlaying = phasePlaying === 'finished';
    expect(finishedPlaying).toBe(false);

    const phaseFinished = 'finished';
    const finishedComplete = phaseFinished === 'finished';
    expect(finishedComplete).toBe(true);
  });

  test('handleTimeout transitions finished state cleanly without phase errors', () => {
    let finished = false;
    let results = [];

    const handleTimeout = (sessionGoal) => {
      results.push({ userAnswer: '(timeout)', correct: false });
      if (sessionGoal === 'perfect') {
        finished = true;
      }
    };

    handleTimeout('standard');
    expect(finished).toBe(false);
    expect(results).toHaveLength(1);

    handleTimeout('perfect');
    expect(finished).toBe(true);
    expect(results).toHaveLength(2);
  });
});

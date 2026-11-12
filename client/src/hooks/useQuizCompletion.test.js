import { describe, it, expect, vi } from 'vitest';
import { recordQuizCompletion } from './useQuizCompletion';

describe('recordQuizCompletion', () => {
  it('calls markTopicCompleted with correct topic and difficulty when score is >= 80%', () => {
    const markMock = vi.fn();
    const result = recordQuizCompletion({
      topicKey: 'addition',
      difficulty: 'hard',
      isAdaptive: false,
      score: 8,
      totalQ: 10,
      markTopicCompleted: markMock,
    });

    expect(result).toBe(true);
    expect(markMock).toHaveBeenCalledTimes(1);
    expect(markMock).toHaveBeenCalledWith('addition', 'hard');
  });

  it('calls markTopicCompleted with adaptive when isAdaptive is true', () => {
    const markMock = vi.fn();
    const result = recordQuizCompletion({
      topicKey: 'addition',
      difficulty: 'easy',
      isAdaptive: true,
      score: 9,
      totalQ: 10,
      markTopicCompleted: markMock,
    });

    expect(result).toBe(true);
    expect(markMock).toHaveBeenCalledWith('addition', 'adaptive');
  });

  it('does not call markTopicCompleted when score is below 80%', () => {
    const markMock = vi.fn();
    const result = recordQuizCompletion({
      topicKey: 'addition',
      difficulty: 'hard',
      isAdaptive: false,
      score: 7,
      totalQ: 10,
      markTopicCompleted: markMock,
    });

    expect(result).toBe(false);
    expect(markMock).not.toHaveBeenCalled();
  });

  it('handles invalid inputs gracefully without throwing', () => {
    expect(recordQuizCompletion({})).toBe(false);
    expect(recordQuizCompletion({ topicKey: 'addition', score: 10, totalQ: 0 })).toBe(false);
    expect(recordQuizCompletion({ topicKey: 'addition', markTopicCompleted: null })).toBe(false);
  });
});

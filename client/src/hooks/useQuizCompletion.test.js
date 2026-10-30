import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { recordQuizCompletion, useQuizCompletion } from './useQuizCompletion';

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

describe('useQuizCompletion hook', () => {
  it('calls markTopicCompleted only once on completion and prevents render loops across re-renders', () => {
    const markMock = vi.fn();

    const { rerender } = renderHook(
      (props) => useQuizCompletion(props),
      {
        initialProps: {
          topicKey: 'addition',
          difficulty: 'hard',
          isAdaptive: false,
          score: 9,
          totalQ: 10,
          finished: true,
          markTopicCompleted: markMock,
        },
      }
    );

    expect(markMock).toHaveBeenCalledTimes(1);

    // Re-render multiple times with a fresh function instance (simulating App re-render)
    rerender({
      topicKey: 'addition',
      difficulty: 'hard',
      isAdaptive: false,
      score: 9,
      totalQ: 10,
      finished: true,
      markTopicCompleted: vi.fn(), // new function reference
    });

    rerender({
      topicKey: 'addition',
      difficulty: 'hard',
      isAdaptive: false,
      score: 9,
      totalQ: 10,
      finished: true,
      markTopicCompleted: vi.fn(), // another new reference
    });

    // Must NOT fire again for the same finished quiz
    expect(markMock).toHaveBeenCalledTimes(1);
  });
});

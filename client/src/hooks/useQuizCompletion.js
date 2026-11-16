import { useEffect, useRef } from 'react';

/**
 * Evaluates whether a quiz score achieves the required passing accuracy (default 80%)
 * and calls markTopicCompleted with the appropriate tier.
 *
 * @param {Object} params
 * @param {string} params.topicKey - Topic identifier (e.g. 'addition', 'basicarith')
 * @param {string} params.difficulty - Current difficulty level ('easy', 'medium', 'hard')
 * @param {boolean} [params.isAdaptive=false] - Whether adaptive mode was active
 * @param {number} params.score - Number of correct answers
 * @param {number} params.totalQ - Total number of questions
 * @param {Function} params.markTopicCompleted - Completion handler
 * @param {number} [params.passThreshold=0.8] - Required accuracy fraction (default 0.8)
 * @returns {boolean} Whether the quiz met the threshold and was recorded
 */
export function recordQuizCompletion({
  topicKey,
  difficulty,
  isAdaptive = false,
  score,
  totalQ,
  markTopicCompleted,
  passThreshold = 0.8,
}) {
  if (!topicKey || typeof markTopicCompleted !== 'function') return false;
  const total = Number(totalQ) || 0;
  if (total <= 0) return false;

  const pass = (Number(score) || 0) / total >= passThreshold;
  if (pass) {
    const tier = isAdaptive ? 'adaptive' : difficulty;
    markTopicCompleted(topicKey, tier);
    return true;
  }
  return false;
}

/**
 * Reusable React hook for quiz components to evaluate and persist topic completion.
 * Properly tracks all dependencies and uses a ref guard to ensure completion is
 * recorded exactly once per finish cycle, preventing render loops.
 *
 * @param {Object} params
 * @param {string} params.topicKey - Topic identifier (e.g. 'addition')
 * @param {string} params.difficulty - Current difficulty ('easy', 'medium', 'hard')
 * @param {boolean} [params.isAdaptive=false] - Whether adaptive mode is enabled
 * @param {number} params.score - Questions answered correctly
 * @param {number} params.totalQ - Total questions in the quiz
 * @param {boolean} params.finished - Whether the quiz is finished
 * @param {Function} params.markTopicCompleted - Completion callback
 * @param {number} [params.passThreshold=0.8] - Passing threshold (default 0.8)
 */
export function useQuizCompletion({
  topicKey,
  difficulty,
  isAdaptive = false,
  score,
  totalQ,
  finished,
  markTopicCompleted,
  passThreshold = 0.8,
}) {
  const hasReportedRef = useRef(false);

  useEffect(() => {
    if (!finished) {
      hasReportedRef.current = false;
      return;
    }
    if (hasReportedRef.current) return;

    const recorded = recordQuizCompletion({
      topicKey,
      difficulty,
      isAdaptive,
      score,
      totalQ,
      markTopicCompleted,
      passThreshold,
    });
    if (recorded) {
      hasReportedRef.current = true;
    }
  }, [finished, score, totalQ, markTopicCompleted, isAdaptive, difficulty, topicKey, passThreshold]);
}

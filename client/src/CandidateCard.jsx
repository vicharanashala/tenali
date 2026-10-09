import React from 'react';

/**
 * CandidateCard Component
 * Candidate concept button card used inside the options bubble.
 *
 * Sizing is fluid: the card fills its grid column and grows in height when a
 * long concept name wraps, so the options bubble never overflows.
 */
export default function CandidateCard({
  conceptName,
  state = 'possible',
  selectionCount = 0,
  isSingleChoice = false,
  onClick
}) {
  return (
    <button
      type="button"
      className={`candidate-quiz-card card-state-${state}`}
      onClick={onClick}
    >
      <span className="candidate-badge" aria-hidden="true">
        {state === 'selected' ? '✓' : state === 'rejected' ? '✕' : '?'}
      </span>
      <span className="candidate-label">{conceptName}</span>
      {selectionCount > 0 && !isSingleChoice && (
        <span className="candidate-count">{selectionCount}</span>
      )}
    </button>
  );
}

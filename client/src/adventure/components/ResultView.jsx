import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function ResultView() {
  const { state, setView } = useAdventure();
  const { resultData } = state;

  if (!resultData) return null;

  const isWin = resultData.correct;
  const conceptName = resultData.correctConcept?.name || '';

  return (
    <div className="adv-result-container">
      <div className="adv-card adv-result-card">

        {/* Illustration */}
        <div className="adv-result-illustration">
          {isWin ? '🏆' : '🦉'}
        </div>

        <h2 className="adv-result-title">
          {isWin ? 'You got it!' : 'Not quite!'}
        </h2>

        {/* Show the concept name on loss so the student learns immediately */}
        {!isWin && conceptName && (
          <div className="adv-result-answer-reveal">
            <span className="adv-result-answer-label">Tenali was thinking of:</span>
            <span className="adv-result-answer-name">{conceptName}</span>
          </div>
        )}

        <p className="adv-result-desc">
          {isWin
            ? 'Great job! You read Tenali\'s mind. Keep going!'
            : 'Don\'t worry! Read the review below and try again.'}
        </p>

        {/* Stars + XP on win */}
        {isWin && (
          <div className="adv-result-rewards">
            <div className="adv-result-stars">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`adv-result-star ${i < resultData.stars ? 'filled' : 'empty'}`}
                  aria-hidden="true"
                >
                  ★
                </span>
              ))}
            </div>
            <div className="adv-result-xp-badge">
              ⚡ +{resultData.xpGained} XP
            </div>
          </div>
        )}

        <button
          className="adv-btn adv-btn-primary adv-result-continue-btn"
          onClick={() => setView('REVIEW')}
          aria-label="See the educational review"
        >
          {isWin ? 'See Review →' : 'Learn About It →'}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import StarRating from '../components/StarRating.jsx';

function getDynamicEncouragement(totalStars, maxStars, storyHeadline) {
  const ratio = maxStars > 0 ? totalStars / maxStars : 0;
  if (ratio >= 0.9) {
    return `🏆 ${storyHeadline}`;
  }
  if (ratio >= 0.65) {
    return '🌟 Great problem-solving! You cracked every lock with strong accuracy.';
  }
  return '💪 You escaped! Replay to sharpen your speed and earn 3 stars in every room.';
}

/**
 * Victory / Escape Completion Screen — 2-line stacked room rows on mobile (< 600px),
 * 1-line tabular room rows on desktop (>= 600px).
 */
export default function EscapeCompletionScreen({
  activeEscape,
  roomsState = [],
  totalStars = 0,
  maxStars = 0,
  formattedTime = '00:00',
  nextDifficultyEscape = null,
  onPlayAgain,
  onTryNextDifficulty,
  onBackToSelection,
}) {
  if (!activeEscape) return null;

  const encouragement = getDynamicEncouragement(
    totalStars,
    maxStars,
    activeEscape.completionHeadline
  );

  return (
    <section className="victory-container" aria-label="Escape completion summary">
      <header className="victory-header">
        <span className="victory-emoji" aria-hidden="true">
          🎉
        </span>
        <h1 className="victory-title">You Escaped!</h1>
        <p className="victory-subtitle">
          {activeEscape.title} — <strong>{activeEscape.difficultyLabel}</strong>
        </p>
        <span className="victory-cleared-pill">
          <span aria-hidden="true">✅</span>
          <span>All {activeEscape.roomCount} Rooms Unlocked</span>
        </span>
      </header>

      <div className="victory-stats-grid">
        <div className="victory-stat-box">
          <span className="victory-stat-label">Total Stars</span>
          <span className="victory-stat-value victory-stat-value--gold">
            ⭐ {totalStars} / {maxStars}
          </span>
        </div>
        <div className="victory-stat-box">
          <span className="victory-stat-label">Time Taken</span>
          <span className="victory-stat-value">⏱️ {formattedTime}</span>
        </div>
      </div>

      <div className="victory-card">
        <div className="victory-card-header">
          <h2 className="victory-card-title">⭐ Room-by-Room Stars</h2>
          <span className="meta-chip">{activeEscape.classLevel}</span>
        </div>

        <div className="victory-breakdown-list">
          {roomsState.map((room) => {
            const { roomConfig, starsEarned, hintsRevealed, attempts } = room;
            const hintText = `${hintsRevealed} ${hintsRevealed === 1 ? 'hint' : 'hints'}`;
            const tryText = `${attempts} ${attempts === 1 ? 'try' : 'tries'}`;

            return (
              <div key={roomConfig.id} className="victory-row">
                <div className="victory-row-primary">
                  <span className="victory-row-name">
                    <span aria-hidden="true">{roomConfig.emoji}</span>
                    <span>
                      Room {roomConfig.roomNumber}: {roomConfig.name}
                    </span>
                  </span>
                  <StarRating stars={starsEarned} maxStars={3} size="sm" />
                </div>

                <div className="victory-row-meta">
                  <span>{hintText}</span>
                  {attempts === 1 ? (
                    <span className="first-try-badge">1st try</span>
                  ) : (
                    <span>{tryText}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="victory-encourage">
        <p className="victory-encourage-main">{encouragement}</p>
        <p className="victory-encourage-tip">
          {activeEscape.completionMessage} Replay anytime for fresh algorithmic problems!
        </p>
      </div>

      <div className="victory-actions">
        {nextDifficultyEscape && (
          <button
            type="button"
            className="btn-primary"
            onClick={onTryNextDifficulty}
          >
            <span>⬆️ Try {nextDifficultyEscape.difficultyLabel} Mode</span>
          </button>
        )}

        <button type="button" className="btn-secondary" onClick={onPlayAgain}>
          <span>🔄 Play Again</span>
        </button>

        <button type="button" className="btn-ghost" onClick={onBackToSelection}>
          <span>🏠 Back to Selection</span>
        </button>
      </div>
    </section>
  );
}
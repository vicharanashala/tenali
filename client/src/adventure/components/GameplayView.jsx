import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function GameplayView() {
  const { state, nextClue, getHint, dispatch } = useAdventure();
  const { session, hintText, loading } = state;

  if (!session) return null;

  console.log('[DEBUG Step 9] GameplayView rendering - session.currentClue:', session.currentClue);
  console.log('[DEBUG Step 9b] Full session:', JSON.stringify(session));

  const canRevealNextClue =
    session.hasMoreClues !== false &&
    session.clueNumber < session.totalClues;

  const hintUsed = !!hintText;

  // When the concept has child-friendly thoughts, use the Tenali-thinking voice.
  // Otherwise fall back to the standard "Knowledge Clue" label for older content.
  const useThoughts = session.useThoughts;

  const badgeLabel = session.isBoss
    ? '⚔️ Boss Challenge'
    : useThoughts
      ? "Tenali's Thought"
      : '🔮 Knowledge Clue';

  return (
    <div className="adv-gameplay-container">

      {/* Tenali Avatar */}
      <div className="adv-avatar-wrapper">
        <div className="adv-avatar-graphic" role="img" aria-label="Tenali Raman">
          🧙‍♂️
        </div>
        <div className="adv-avatar-name">Tenali Raman</div>
      </div>

      {/* Intro line — only shown for child-friendly thoughts mode */}
      {useThoughts && (
        <p className="adv-tenali-intro" aria-live="polite">
          I&apos;m thinking of something...
        </p>
      )}

      {/* Thought / Clue Card */}
      <div className="adv-card adv-clue-card" aria-live="polite" aria-atomic="true">
        <div className="adv-clue-header">
          <span className="adv-clue-badge">{badgeLabel}</span>
          <span className="adv-clue-counter">
            {session.clueNumber} / {session.totalClues}
          </span>
        </div>

        {/* Progress dots */}
        <div className="adv-clue-dots" aria-hidden="true">
          {Array.from({ length: session.totalClues }).map((_, i) => (
            <span
              key={i}
              className={`adv-clue-dot ${i < session.clueNumber ? 'revealed' : ''}`}
            />
          ))}
        </div>

        <p className="adv-clue-text">
          &ldquo;{session.currentClue || 'I am thinking of a mathematical concept...'}&rdquo;
        </p>

        {hintText && (
          <div className="adv-hint-box" role="status">
            💡 <strong>Hint:</strong> {hintText}
          </div>
        )}

        {!canRevealNextClue && !loading && (
          <p className="adv-all-clues-note">
            {useThoughts
              ? 'All my thoughts are shown — can you guess what I am thinking?'
              : 'All clues revealed — make your guess!'}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="adv-gameplay-actions">
        <button
          className="adv-btn adv-btn-accent"
          onClick={() => dispatch({ type: 'SET_GUESS_MODAL', payload: true })}
          disabled={loading}
          aria-label="Open guess dialog"
        >
          🔮 Guess
        </button>

        <button
          className="adv-btn adv-btn-secondary"
          onClick={nextClue}
          disabled={loading || !canRevealNextClue}
          aria-label={canRevealNextClue
            ? (useThoughts ? 'Show next thought' : 'Reveal next clue')
            : 'No more clues'}
        >
          {canRevealNextClue
            ? (useThoughts ? 'Next Thought →' : 'Next Clue →')
            : (useThoughts ? 'No More Thoughts' : 'No More Clues')}
        </button>

        <button
          className="adv-btn adv-btn-ghost"
          onClick={getHint}
          disabled={loading || hintUsed}
          aria-label={hintUsed ? 'Hint already used' : 'Use hint'}
          title={hintUsed ? 'You have already used your hint.' : 'Use your one hint'}
        >
          {hintUsed ? '💡 Used' : '💡 Hint'}
        </button>
      </div>

      {loading && (
        <div className="adv-inline-loading" aria-live="polite">
          <div
            className="adv-loading-spinner"
            style={{ width: 20, height: 20, borderWidth: 2 }}
          />
        </div>
      )}
    </div>
  );
}

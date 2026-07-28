import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function HomeView() {
  const { state, continueAdventure, setView } = useAdventure();
  const { progress, loading } = state;

  return (
    <div className="adv-home-container">
      <header className="adv-home-header">
        <h1 className="adv-title">Crown of Knowledge</h1>
        <p className="adv-subtitle">Can you read Tenali's mind?</p>
      </header>

      <main className="adv-card adv-story-card">
        <div className="adv-story-badge">📜 The Quest</div>
        <p className="adv-story-text">
          Tenali Raman is thinking of a secret mathematical concept.
          He will give you clues one by one.
          Read the clues carefully and guess what is on his mind!
        </p>

        <div className="adv-stats-strip">
          <div className="adv-stat-item">
            <span className="adv-stat-icon">⭐</span>
            <span className="adv-stat-val">{progress.totalStars} Stars</span>
          </div>
          <div className="adv-stat-item">
            <span className="adv-stat-icon">⚡</span>
            <span className="adv-stat-val">{progress.xp} XP</span>
          </div>
        </div>

        <div className="adv-home-actions">
          <button
            className="adv-btn adv-btn-primary"
            onClick={continueAdventure}
            disabled={loading}
            aria-label="Continue Adventure"
          >
            {loading ? 'Loading...' : 'Continue Adventure →'}
          </button>

          <button
            className="adv-btn adv-btn-secondary"
            onClick={() => setView('KINGDOM_SELECT')}
            aria-label="Choose a Kingdom"
          >
            Choose Kingdom
          </button>
        </div>
      </main>
    </div>
  );
}

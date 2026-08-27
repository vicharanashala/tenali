/**
 * TENALI ADVENTURE GAME - ROOT APPLICATION SHELL
 * ══════════════════════════════════════════════════════════════════════
 * Entry point that wires the AdventureProvider, view router, and
 * CSS import into a single self-contained module.
 */

import React from 'react';
import './adventure.css';
import { AdventureProvider, useAdventure } from './context/AdventureContext';
import HomeView from './components/HomeView';
import KingdomView from './components/KingdomView';
import LevelPathView from './components/LevelPathView';
import GameplayView from './components/GameplayView';
import GuessModal from './components/GuessModal';
import ResultView from './components/ResultView';
import ReviewView from './components/ReviewView';

// Inner router reads from AdventureContext
function AdventureRouter({ onBack }) {
  const { state } = useAdventure();
  const { view, error, loading } = state;

  return (
    <div className="adv-shell">
      {/* Sticky top nav bar */}
      <div className="adv-nav-bar">
        <button
          className="adv-nav-back"
          onClick={onBack}
          aria-label="Exit Adventure Game"
        >
          ← Exit
        </button>
        <span className="adv-nav-title">👑 Crown of Knowledge</span>
        <div className="adv-nav-stats">
          <span className="adv-nav-stat">⭐ {state.progress.totalStars}</span>
          <span className="adv-nav-stat">⚡ {state.progress.xp} XP</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="adv-content">
        {error && (
          <div className="adv-error-banner" role="alert">
            ⚠️ {error}
          </div>
        )}

        {loading && view !== 'GAMEPLAY' && (
          <div className="adv-loading-overlay" aria-live="polite">
            <div className="adv-loading-spinner" />
            <p>Loading...</p>
          </div>
        )}

        {/* View Router */}
        {view === 'HOME' && <HomeView />}
        {view === 'KINGDOM_SELECT' && <KingdomView />}
        {view === 'LEVEL_SELECT' && <LevelPathView />}
        {view === 'GAMEPLAY' && <GameplayView />}
        {view === 'RESULT' && <ResultView />}
        {view === 'REVIEW' && <ReviewView />}
      </div>

      {/* Global Guess Modal overlay */}
      <GuessModal />
    </div>
  );
}

// Public export wraps everything in the context provider
export default function AdventureApp({ onBack }) {
  return (
    <AdventureProvider>
      <AdventureRouter onBack={onBack || (() => window.history.back())} />
    </AdventureProvider>
  );
}

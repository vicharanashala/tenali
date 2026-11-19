import React, { useState, useEffect } from 'react';
import useEscapeGame from './hooks/useEscapeGame.js';
import EscapeSelectionScreen from './screens/EscapeSelectionScreen.jsx';
import EscapeGameScreen from './screens/EscapeGameScreen.jsx';
import EscapeCompletionScreen from './screens/EscapeCompletionScreen.jsx';

/**
 * Standalone Math Escape Room App Shell for tenali.fun (/ict/escape-room/).
 * Session-only state (no localStorage, no backend API) for sandboxed iframe CSP compliance.
 */
export default function App() {
  const [theme, setTheme] = useState('dark');
  const game = useEscapeGame();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="escape-app" data-theme={theme}>
      {game.screen === 'playing' ? (
        <EscapeGameScreen
          activeEscape={game.activeEscape}
          roomsState={game.roomsState}
          currentRoomIndex={game.currentRoomIndex}
          currentRoom={game.currentRoom}
          totalStars={game.totalStars}
          solvedCount={game.solvedCount}
          formattedTime={game.formattedTime}
          shakeTrigger={game.shakeTrigger}
          lastFeedback={game.lastFeedback}
          roomUnlockedModal={game.roomUnlockedModal}
          onSubmitCode={game.submitCode}
          onRevealNextHint={game.revealNextHint}
          onProceedToNextRoom={game.proceedToNextRoom}
          onExit={game.exitEscape}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <>
          <header className="escape-topbar">
            <div className="escape-topbar-inner">
              <span className="topbar-brand">
                <span aria-hidden="true">🏰</span>
                <span>Math Escape Room</span>
              </span>

              <div className="topbar-actions">
                {game.screen === 'completed' && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={game.exitEscape}
                  >
                    All Escapes
                  </button>
                )}
                <button
                  type="button"
                  className="btn-icon"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </header>

          <main className="escape-main">
            {game.screen === 'selection' && (
              <EscapeSelectionScreen
                escapes={game.escapes}
                onSelectEscape={game.startEscape}
              />
            )}

            {game.screen === 'completed' && (
              <EscapeCompletionScreen
                activeEscape={game.activeEscape}
                roomsState={game.roomsState}
                totalStars={game.totalStars}
                maxStars={game.maxStars}
                formattedTime={game.formattedTime}
                nextDifficultyEscape={game.nextDifficultyEscape}
                onPlayAgain={game.playAgain}
                onTryNextDifficulty={game.tryNextDifficulty}
                onBackToSelection={game.exitEscape}
              />
            )}
          </main>
        </>
      )}

      <footer className="escape-footer">
        <div className="escape-footer-inner">
          <span>tenali.fun • Open-Source Math Practice • IIT Ropar</span>
          <span>Designed for Classes 6–10 • CBSE / ICSE</span>
        </div>
      </footer>
    </div>
  );
}
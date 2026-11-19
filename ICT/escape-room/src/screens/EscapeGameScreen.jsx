import React from 'react';
import RoomProgress from '../components/RoomProgress.jsx';
import StoryNarrative from '../components/StoryNarrative.jsx';
import CodeLockInput from '../components/CodeLockInput.jsx';
import HintPanel from '../components/HintPanel.jsx';
import RoomUnlockedModal from '../components/RoomUnlockedModal.jsx';
import RoomIllustration from '../illustrations/RoomIllustration.jsx';

const WORD_PROBLEM_SUBTYPES = new Set([
  'age-word',
  'digit-reversal',
  'fraction-word',
  'two-squares-word',
  'speed-distance-word',
  'commerce-profit-word',
]);

/**
 * Active Gameplay Screen — 60%/40% desktop split, strict single-column mobile flow,
 * zero overlays on illustrations.
 */
export default function EscapeGameScreen({
  activeEscape,
  roomsState,
  currentRoomIndex,
  currentRoom,
  totalStars,
  solvedCount,
  formattedTime,
  shakeTrigger,
  lastFeedback,
  roomUnlockedModal,
  onSubmitCode,
  onRevealNextHint,
  onProceedToNextRoom,
  onExit,
  theme,
  onToggleTheme,
}) {
  if (!activeEscape || !currentRoom) return null;

  const { roomConfig, problem, hints, attempts, wrongAttempts, hintsRevealed, autoHintTriggered, solved } =
    currentRoom;

  const isWordProblem = WORD_PROBLEM_SUBTYPES.has(problem.subtype);
  const maxEarnedSoFar = Math.max(solvedCount * 3, 3);

  return (
    <>
      <header className="escape-topbar">
        <div className="escape-topbar-inner">
          <button
            type="button"
            className="btn-ghost"
            onClick={onExit}
            aria-label="Exit current escape and return to selection"
          >
            <span aria-hidden="true">←</span>
            <span>Exit</span>
          </button>

          <div className="game-desktop-stepper">
            <RoomProgress roomsState={roomsState} currentRoomIndex={currentRoomIndex} />
          </div>

          <div className="topbar-actions">
            <span className="stat-pill" title="Elapsed time">
              <span aria-hidden="true">⏱️</span>
              <span>{formattedTime}</span>
            </span>
            <span className="stat-pill stat-pill-stars" title="Stars earned so far">
              <span aria-hidden="true">⭐</span>
              <span>
                {totalStars}/{maxEarnedSoFar}
              </span>
            </span>
            <button
              type="button"
              className="btn-icon"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="escape-main">
        {/* Dedicated mobile room stepper prevents any 7-room header crowding at 375px */}
        <div className="game-mobile-stepper">
          <RoomProgress roomsState={roomsState} currentRoomIndex={currentRoomIndex} />
        </div>

        <div className="game-grid">
          {/* Left Column (60% Desktop): Scene Card + Story Narrative */}
          <div className="game-left-col">
            <div className="scene-card">
              <div className="scene-meta-bar">
                <span className="scene-status-pill">
                  <span className="scene-status-dot" aria-hidden="true" />
                  <span>{solved ? 'Room Unlocked' : 'Investigation Active'}</span>
                </span>
                <span className="scene-sector-text">{roomConfig.sectorLabel}</span>
              </div>

              <div className="scene-illustration-frame">
                <RoomIllustration
                  scene={roomConfig.scene}
                  solved={solved}
                  title={roomConfig.name}
                />
              </div>

              {/* Solid docked bottom bar — ZERO overlays over SVG */}
              <div className="scene-title-bar">
                <h1 className="scene-title-text">
                  <span aria-hidden="true">{roomConfig.emoji}</span>
                  <span>
                    Room {roomConfig.roomNumber} of {activeEscape.roomCount}: {roomConfig.name}
                  </span>
                </h1>
              </div>
            </div>

            <StoryNarrative
              logHeader={roomConfig.logHeader}
              clueCode={roomConfig.clueCode}
              storyText={roomConfig.storyText}
            />
          </div>

          {/* Right Column (40% Desktop): Math Puzzle + Code Lock + Progressive Hints */}
          <div className="game-right-col">
            <section className="puzzle-card" aria-label="Math puzzle and code lock">
              <div className="puzzle-header">
                <span className="puzzle-number">• Puzzle #{roomConfig.roomNumber}</span>
                <span className={`difficulty-pill difficulty-pill--${activeEscape.difficulty}`}>
                  {activeEscape.difficultyLabel} • {activeEscape.shortTopic}
                </span>
              </div>

              <p className="puzzle-prompt">{problem.prompt}</p>

              <div className="puzzle-math-box">
                <p
                  className={`puzzle-expression ${
                    isWordProblem ? 'puzzle-expression--word' : ''
                  }`}
                >
                  {problem.expression}
                </p>
                {problem.subtype === 'radical-extraneous' && (
                  <p className="puzzle-warning-note">
                    ⚠️ Watch out for extraneous roots! Verify your solution in the original
                    equation.
                  </p>
                )}
              </div>

              <CodeLockInput
                roomId={roomConfig.id}
                onSubmit={onSubmitCode}
                shakeTrigger={shakeTrigger}
                lastFeedback={lastFeedback}
                attempts={attempts}
                wrongAttempts={wrongAttempts}
                autoHintTriggered={autoHintTriggered}
                disabled={solved || Boolean(roomUnlockedModal)}
              />
            </section>

            <HintPanel
              hints={hints}
              hintsRevealed={hintsRevealed}
              autoHintTriggered={autoHintTriggered}
              onRevealNextHint={onRevealNextHint}
              disabled={solved || Boolean(roomUnlockedModal)}
            />
          </div>
        </div>
      </main>

      <RoomUnlockedModal modalData={roomUnlockedModal} onProceed={onProceedToNextRoom} />
    </>
  );
}
import React from 'react';

const DIFFICULTY_DOT = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

/**
 * Escape Selection Screen — 3-column equal-height grid on desktop (>= 900px),
 * single-column vertical cards on mobile (< 900px).
 */
export default function EscapeSelectionScreen({ escapes = [], onSelectEscape }) {
  return (
    <section aria-label="Choose your math escape">
      <header className="selection-hero">
        <div className="hero-badge">
          <span aria-hidden="true">•</span>
          <span>{escapes.length} Escapes Available</span>
        </div>
        <h1 className="hero-title">Choose Your Escape</h1>
        <p className="hero-subtitle">
          Solve math puzzles to unlock rooms and escape! Each story tests a different CBSE math
          topic with algorithmically generated problems.
        </p>
        <div className="hero-tags">
          <span>🛡️ Adaptive Rigor</span>
          <span>🔀 Infinite Replayability</span>
          <span>🎓 CBSE / State Curriculum</span>
        </div>
      </header>

      <div className="selection-grid">
        {escapes.map((story) => (
          <article key={story.id} className="story-card">
            <div className={`story-card-accent story-card-accent--${story.difficulty}`} />
            <div className="story-card-body">
              <div className="story-card-header">
                <span className={`difficulty-pill difficulty-pill--${story.difficulty}`}>
                  <span aria-hidden="true">{DIFFICULTY_DOT[story.difficulty]}</span>
                  <span>{story.difficultyLabel}</span>
                </span>
                <span className="meta-chip">{story.classLevel}</span>
              </div>

              <h2 className="story-card-title">{story.title}</h2>
              <p className="story-card-desc">{story.description}</p>

              <div className="story-focus-box">
                <span className="story-focus-label">Focus Concept</span>
                <span className="story-focus-value">{story.focusConcept}</span>
              </div>

              <div className="story-meta-row">
                <span className="meta-chip">
                  <span aria-hidden="true">{story.icon}</span>
                  <span>{story.roomCount} Rooms</span>
                </span>
                <span className="meta-chip">{story.topic}</span>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => onSelectEscape(story.id)}
              >
                <span>Start Escape</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="selection-note">
        <span className="selection-note-pill">
          <span aria-hidden="true">🎲</span>
          <span>Problems are algorithmically generated — every playthrough is unique!</span>
        </span>
      </div>
    </section>
  );
}
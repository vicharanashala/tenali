import React from 'react';

const HINT_META = [
  { level: 1, title: 'Hint 1: Conceptual Nudge' },
  { level: 2, title: 'Hint 2: Partial Solution' },
  { level: 3, title: 'Hint 3: Full Step-by-Step Solution' },
];

/**
 * Progressive 3-level hint accordion with sequential unlocking,
 * auto-hint banner on 3rd wrong attempt, and star penalty notice.
 */
export default function HintPanel({
  hints = [],
  hintsRevealed = 0,
  autoHintTriggered = false,
  onRevealNextHint,
  disabled = false,
}) {
  return (
    <section className="hint-panel" aria-label="Progressive hints">
      <div className="hint-panel-header">
        <h3 className="hint-panel-title">
          <span aria-hidden="true">💡</span>
          <span>Progressive Hints</span>
        </h3>
        <span className="hint-count-badge">{hintsRevealed}/3 used</span>
      </div>

      {autoHintTriggered && (
        <div className="hint-auto-banner" role="status">
          💡 3 wrong attempts — Hint 1 has been automatically revealed!
        </div>
      )}

      <div className="hint-list">
        {HINT_META.map((meta, index) => {
          const isRevealed = index < hintsRevealed;
          const isNextUnlockable = index === hintsRevealed;
          const hintText = hints[index] || '';

          if (isRevealed) {
            return (
              <div key={meta.level} className="hint-item-revealed">
                <div className="hint-item-top">
                  <span className="hint-item-label">• {meta.title}</span>
                  <span className="hint-status-tag">
                    {meta.level === 1 && autoHintTriggered ? 'AUTO-REVEALED' : 'REVEALED'}
                  </span>
                </div>
                <p className="hint-item-body">{hintText}</p>
              </div>
            );
          }

          if (isNextUnlockable) {
            return (
              <button
                key={meta.level}
                type="button"
                className="hint-reveal-btn"
                onClick={onRevealNextHint}
                disabled={disabled}
              >
                <span>🔑 Reveal {meta.title}</span>
                <span className="hint-status-tag">
                  {meta.level === 1 ? 'Max 2⭐' : 'Max 1⭐'}
                </span>
              </button>
            );
          }

          return (
            <div key={meta.level} className="hint-item-locked" aria-disabled="true">
              <span>🔒 {meta.title}</span>
              <span>Unlock Hint {meta.level - 1} first</span>
            </div>
          );
        })}
      </div>

      <p className="hint-penalty-note">
        ⚠️ Star rating: 3⭐ (0 hints &amp; 1st try) • 2⭐ (1 hint or 2–3 tries) • 1⭐ (2+ hints or
        4+ tries).
      </p>
    </section>
  );
}
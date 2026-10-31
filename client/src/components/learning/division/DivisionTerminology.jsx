import React from 'react';
import {
  IconCap,
  IconJar,
  IconGroup,
  IconPlate,
  IconSparkles,
  IconCelebration,
  IconQuiz
} from './DivisionIcons';

/**
 * DivisionTerminology Component
 * Final stage: maps intuitive equal sharing concepts to formal division terminology.
 * Completely emoji-free with SVG illustrations.
 */
export default function DivisionTerminology({ onFinish, onBack, hasQuiz = false }) {
  return (
    <div className="division-card fade-in">
      <div className="division-celebration-title" style={{ marginTop: 0 }}>
        <IconCap size={32} />
        <span>The Names of Division</span>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--clr-text-soft, #a89e94)', margin: '0 0 20px', fontSize: '1rem' }}>
        You already know how division works by sharing! Here is how mathematicians name each part:
      </p>

      {/* Visual Example: 10 ÷ 3 = 3 R 1 */}
      <div className="division-equation-box" style={{ background: 'var(--clr-card, #2c2622)' }}>
        <div className="division-equation-row">
          <div className="division-num-badge dividend">
            <span>10</span>
            <span className="division-badge-sublabel">Dividend</span>
          </div>
          <span style={{ fontSize: '1.5rem', color: 'var(--clr-text-soft, #a89e94)' }}>÷</span>
          <div className="division-num-badge divisor">
            <span>3</span>
            <span className="division-badge-sublabel">Divisor</span>
          </div>
          <span style={{ fontSize: '1.5rem', color: 'var(--clr-text-soft, #a89e94)' }}>=</span>
          <div className="division-num-badge quotient">
            <span>3</span>
            <span className="division-badge-sublabel">Quotient</span>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--clr-text-soft, #a89e94)' }}>R</span>
          <div className="division-num-badge remainder">
            <span>1</span>
            <span className="division-badge-sublabel">Remainder</span>
          </div>
        </div>
      </div>

      {/* Terminology Cards Grid */}
      <div className="division-terminology-grid">
        <div className="division-term-card">
          <div className="division-term-icon">
            <IconJar size={32} />
          </div>
          <div className="division-term-name" style={{ color: '#4f8dff' }}>Dividend</div>
          <div className="division-term-desc">
            The total quantity of candies in the jar you started with.
          </div>
        </div>

        <div className="division-term-card">
          <div className="division-term-icon">
            <IconGroup size={32} />
          </div>
          <div className="division-term-name" style={{ color: '#22c55e' }}>Divisor</div>
          <div className="division-term-desc">
            The number of friends sharing the candies equally.
          </div>
        </div>

        <div className="division-term-card">
          <div className="division-term-icon">
            <IconPlate size={32} />
          </div>
          <div className="division-term-name" style={{ color: '#f08c46' }}>Quotient</div>
          <div className="division-term-desc">
            How many candies each friend receives on their plate.
          </div>
        </div>

        <div className="division-term-card">
          <div className="division-term-icon">
            <IconSparkles size={32} />
          </div>
          <div className="division-term-name" style={{ color: '#f59e0b' }}>Remainder</div>
          <div className="division-term-desc">
            The leftover quantity in the jar that could not be shared equally.
          </div>
        </div>
      </div>

      <div className="division-celebration" style={{ background: 'transparent', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
          <IconCelebration size={28} />
          <span>You Mastered Division Through Fair Sharing!</span>
        </div>
        <div className="division-controls-bar">
          <button className="division-action-btn secondary" onClick={onBack}>
            <span>Explore Activities</span>
          </button>
          <button className="division-action-btn primary" onClick={onFinish}>
            {hasQuiz ? (
              <>
                <IconQuiz size={18} />
                <span>Try Column Division Quiz</span>
              </>
            ) : (
              <>
                <IconCheck size={18} />
                <span>Finish & Return to Home</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

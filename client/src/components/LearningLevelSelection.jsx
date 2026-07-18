import React from 'react';
import LearningContainer from './LearningContainer';
import { KawaiiBee } from './TryItAssessment';
import './LearningLevelSelection.css';

/**
 * LearningLevelSelection
 *
 * Lets students pick which addition level to learn.
 * Currently only "Single Digit Addition" is available.
 * Designed so future levels (2-digit, 3-digit, etc.) can be added easily.
 *
 * @param {Object} props
 * @param {Function} props.onChooseLevel - Callback fired with the selected level key
 * @param {Function} props.onBack - Callback to return to ChooseModeScreen
 */

const LEARNING_LEVELS = [
  {
    key: 'single-digit',
    title: 'Single Digit Addition',
    desc: 'Count objects, group them, and discover the + sign!',
    icon: '🍎',
    available: true,
  },
];

export default function LearningLevelSelection({ onChooseLevel, onBack }) {
  return (
    <LearningContainer>
      <div className="lls-wrapper">
        <h2 className="lls-heading">What shall we learn today?</h2>

        <div className="lls-options">
          {LEARNING_LEVELS.map((level) => (
            <div
              key={level.key}
              className={`lls-card${level.available ? ' available' : ' locked'}`}
              onClick={() => {
                if (level.available) onChooseLevel(level.key);
              }}
              role={level.available ? 'button' : undefined}
              tabIndex={level.available ? 0 : -1}
              onKeyDown={(e) => {
                if (level.available && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onChooseLevel(level.key);
                }
              }}
              aria-disabled={!level.available}
            >
              <div className="lls-card-icon">{level.icon}</div>
              <h3 className="lls-card-title">{level.title}</h3>
              <p className="lls-card-desc">{level.desc}</p>
              {!level.available && <div className="lls-lock-overlay">🔒</div>}
            </div>
          ))}
        </div>

        <button className="lls-back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    </LearningContainer>
  );
}

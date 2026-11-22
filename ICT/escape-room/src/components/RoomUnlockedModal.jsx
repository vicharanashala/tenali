import React, { useEffect, useRef } from 'react';
import StarRating from './StarRating.jsx';

/**
 * Green-accented transition modal displayed upon solving a room.
 * Shows stars earned, verified code (with extraneous root note if applicable),
 * brief step summary, and Proceed CTA.
 */
export default function RoomUnlockedModal({ modalData, onProceed }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!modalData) return undefined;
    buttonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onProceed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalData, onProceed]);

  if (!modalData) return null;

  const {
    roomNumber,
    roomName,
    nextRoomNumber,
    nextRoomName,
    starsEarned,
    hintsRevealed,
    attempts,
    answer,
    extraneous,
    steps = [],
    isLastRoom,
  } = modalData;

  const starSummary = `${starsEarned} ${starsEarned === 1 ? 'Star' : 'Stars'} Earned (${hintsRevealed} ${
    hintsRevealed === 1 ? 'hint' : 'hints'
  }, ${attempts} ${attempts === 1 ? 'try' : 'tries'})`;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-unlocked-title"
    >
      <div className="modal-card">
        <div className="modal-unlock-icon" aria-hidden="true">
          🔓
        </div>

        <h2 id="room-unlocked-title" className="modal-title">
          Door Unlocked!
        </h2>

        <p className="modal-subtitle">
          Room {roomNumber}: {roomName} Cleared
        </p>

        <StarRating stars={starsEarned} maxStars={3} size="lg" />
        <p className="modal-subtitle">{starSummary}</p>

        <div className="modal-verified-pill">
          <span>Verified Code:</span>
          <span className="modal-verified-code">{answer}</span>
          {extraneous !== null && extraneous !== undefined && (
            <span className="modal-extraneous-note">
              (x = {extraneous} rejected as extraneous)
            </span>
          )}
        </div>

        {steps.length > 0 && (
          <div className="modal-steps">
            <p className="modal-steps-heading">Verified Solution Summary</p>
            <ol className="modal-steps-list">
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <button
          ref={buttonRef}
          type="button"
          className="btn-success"
          onClick={onProceed}
        >
          {isLastRoom
            ? 'Complete Escape & View Summary 🎉'
            : `Proceed to Room ${nextRoomNumber}: ${nextRoomName} →`}
        </button>
      </div>
    </div>
  );
}
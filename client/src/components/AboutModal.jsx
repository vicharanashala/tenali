import React from 'react';
import './AboutModal.css';

/**
 * AboutModal
 * Informational modal dialog explaining Tenali's adaptive learning platform.
 */
export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="about-modal-backdrop" onClick={onClose} />
      <div className="card about-modal-dialog">
        <h2 className="about-modal-title">About Tenali</h2>
        <p className="about-modal-text">
          Tenali is an advanced, adaptive learning platform featuring interactive puzzles in Mathematics, Logic, and
          General Knowledge.
        </p>
        <p className="about-modal-text">
          Your progress is saved dynamically, allowing the platform to automatically adjust the difficulty of every
          question to match your skill level!
        </p>
        <button className="menu-card blue about-modal-btn" onClick={onClose}>
          <span className="menu-title">Got it!</span>
        </button>
      </div>
    </>
  );
}

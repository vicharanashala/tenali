import React from 'react';

/**
 * AboutModal
 * Informational modal dialog explaining Tenali's adaptive learning platform.
 */
export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 99999,
        }}
        onClick={onClose}
      />
      <div
        className="card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100000,
          width: '90%',
          maxWidth: '400px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        }}
      >
        <h2 style={{ color: 'var(--clr-accent)', marginTop: 0 }}>About Tenali</h2>
        <p style={{ lineHeight: 1.6 }}>
          Tenali is an advanced, adaptive learning platform featuring interactive puzzles in Mathematics, Logic, and
          General Knowledge.
        </p>
        <p style={{ lineHeight: 1.6 }}>
          Your progress is saved dynamically, allowing the platform to automatically adjust the difficulty of every
          question to match your skill level!
        </p>
        <button
          className="menu-card blue"
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
          onClick={onClose}
        >
          <span className="menu-title">Got it!</span>
        </button>
      </div>
    </>
  );
}

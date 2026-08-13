import React from 'react';
import { useQuizSound } from '../context/QuizSoundContext';

export function SoundToggle() {
  const { isMuted, toggleMute } = useQuizSound();

  // Match the hiding logic from AuthMenu
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const pathname = (window.location.pathname || '/').replace(/\/+$/, '').toLowerCase();
  const isVisualLearning =
    pathname.includes('geocraft') ||
    pathname.includes('visual-math-lab-redux') ||
    pathname.includes('mensuration-lab') ||
    pathname.includes('math-lab') ||
    mode === 'math-lab' ||
    mode === 'visual-math-lab-redux' ||
    mode === 'mensuration-lab' ||
    mode === 'addition' ||
    mode === 'geocraft';

  if (isVisualLearning) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      onClick={toggleMute}
      style={{
        position: 'fixed',
        top: 16,
        right: 112, // Positioned to the left of AuthMenu (which is at right: 64)
        zIndex: 101,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--clr-surface, #1c1c1f)',
        border: '1px solid var(--clr-border, #444)',
        color: 'var(--clr-text, #eee)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        padding: 0,
        fontSize: '1.2rem',
      }}
      title={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
}

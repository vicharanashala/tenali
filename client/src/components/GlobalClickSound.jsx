import React, { useEffect } from 'react';
import { useQuizSound } from '../context/QuizSoundContext';

export function GlobalClickSound() {
  const { playClick, isMuted } = useQuizSound();

  useEffect(() => {
    if (isMuted) return;

    const handleClick = (e) => {
      // Find closest button or 'a' tag
      const target = e.target.closest('button, a, [role="button"]');
      if (!target) return;

      // Don't play click sound for the mute toggle itself (it has its own visual feedback and we don't want to play sound if they just muted it)
      if (target.getAttribute('aria-label') === 'Mute sounds' || target.getAttribute('aria-label') === 'Unmute sounds') {
        return;
      }

      playClick();
    };

    document.addEventListener('click', handleClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [playClick, isMuted]);

  return null;
}

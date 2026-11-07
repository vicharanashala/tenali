/**
 * confettiHelper.js
 *
 * Reliable multi-tier confetti engine.
 * Works with canvas-confetti, window.confetti, and DOM particles fallback.
 */

export function fireConfetti(options = {}) {
  // 1. Canvas Confetti
  try {
    const fn = (typeof window !== 'undefined' && window.confetti)
      || (typeof confetti === 'function' ? confetti : null);

    if (typeof fn === 'function') {
      fn({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'],
        ...options
      });

      // Side burst cannons
      setTimeout(() => {
        try {
          fn({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 } });
          fn({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 } });
        } catch (e) {}
      }, 180);
    }
  } catch (e) {
    console.warn('[confettiHelper] canvas-confetti error:', e);
  }

  // 2. High-visibility DOM Confetti Particles (guaranteed rendering in any browser)
  if (typeof document !== 'undefined') {
    try {
      const container = document.createElement('div');
      container.className = 'confetti-dom-celebration';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999999';
      document.body.appendChild(container);

      const colors = ['#22c55e', '#4ade80', '#3b82f6', '#f59e0b', '#ec4899', '#e11d48', '#8b5cf6', '#eab308'];
      for (let i = 0; i < 90; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        const sz = Math.random() * 12 + 7;
        p.style.width = `${sz}px`;
        p.style.height = `${sz}px`;
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = `${Math.random() * 96 + 2}vw`;
        p.style.top = `${Math.random() * 25 + 35}vh`;
        p.style.borderRadius = Math.random() > 0.4 ? '50%' : '3px';
        p.style.boxShadow = `0 0 8px ${p.style.backgroundColor}`;
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        p.style.transition = 'all 1.6s cubic-bezier(0.22, 1, 0.36, 1)';
        container.appendChild(p);

        setTimeout(() => {
          p.style.top = `${Math.random() * 60 + 105}vh`;
          p.style.left = `${parseFloat(p.style.left) + (Math.random() * 28 - 14)}vw`;
          p.style.opacity = '0';
          p.style.transform = `rotate(${Math.random() * 900}deg) scale(0.4)`;
        }, 30);
      }

      setTimeout(() => {
        container.remove();
      }, 1900);
    } catch (domErr) {
      console.warn('[confettiHelper] DOM confetti error:', domErr);
    }
  }
}

export default fireConfetti;

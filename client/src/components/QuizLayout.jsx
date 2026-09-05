import React from 'react';

/**
 * QuizLayout Component
 * Wrapper layout for quiz apps (WordCreatorApp, WordSearchApp, CrosswordApp, etc.)
 * Provides consistent header with back button and title section
 */
export function QuizLayout({ title, subtitle, onBack, children, timer, sessionGoal, enhanceFinishedScreen }) {
  const isSpeed = timer && (timer.mode === 'speed' || sessionGoal === 'speed');
  const isPerfect = sessionGoal === 'perfect';

  const timerDisplay = (() => {
    if (!timer) return null;
    if (isPerfect) return null;
    if (isSpeed) {
      const left = timer.remaining ?? 0;
      const urgent = left <= 3;
      const warn = left <= 5 && !urgent;
      const color = urgent ? '#f44336' : warn ? '#ff9800' : '#4caf50';
      return (
        <div className="timer-pill" style={{
          background: urgent ? 'rgba(244,67,54,0.15)' : warn ? 'rgba(255,152,0,0.15)' : undefined,
          borderColor: color, color,
          fontWeight: 700,
          fontSize: '1rem',
          minWidth: 56,
          textAlign: 'center',
          transition: 'color 0.3s, background 0.3s',
          animation: urgent ? 'timerPulse 0.5s ease-in-out infinite alternate' : 'none',
        }}>
          ⚡ {left}s
        </div>
      );
    }
    return <div className="timer-pill">{timer.elapsed}s</div>;
  })();

  const goalBadge = (() => {
    if (!sessionGoal || sessionGoal === 'standard') return null;
    const cfg = {
      speed: { label: '⚡ Speed Run', bg: 'rgba(255,179,0,0.18)', border: '#ffb300', color: '#ffb300' },
      perfect: { label: '🎯 Perfect Solve', bg: 'rgba(244,67,54,0.18)', border: '#f44336', color: '#f44336' },
      revision: { label: '🔄 Revision', bg: 'rgba(33,150,243,0.18)', border: '#2196f3', color: '#2196f3' },
    }[sessionGoal];
    if (!cfg) return null;
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
        background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color,
      }}>
        {cfg.label}
      </div>
    );
  })();

  const sessionGoalActive = sessionGoal && sessionGoal !== 'standard';
  const processedChildren = React.Children.map(children, child => {
    if (sessionGoalActive && typeof enhanceFinishedScreen === 'function') {
      return enhanceFinishedScreen(child, sessionGoal);
    }
    return child;
  });

  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {goalBadge}
          {timerDisplay}
        </div>
      </div>
      <h1 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)' }}>{title}</h1>
      {processedChildren}
    </>
  );
}

export default QuizLayout;

/**
 * @fileoverview MasteryLevelHeader Component
 * Renders the level indicator bar inside an active exercise workspace.
 */

export default function MasteryLevelHeader({ state, maxLevel, toastMsg, onClearToast }) {
  const accuracy = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 0;
  const progressPct = Math.round((state.currentLevel / maxLevel) * 100);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Level info row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '8px'
      }}>
        <span>
          {state.mastered
            ? '🏆 Mastered'
            : `Level ${state.currentLevel} / ${maxLevel}`
          }
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          {state.correctStreak > 0 && (
            <span style={{ color: 'var(--clr-correct, #2ea043)' }}>
              🔥 Streak: {state.correctStreak}
            </span>
          )}
          {state.totalAttempts > 0 && (
            <span>📊 {accuracy}%</span>
          )}
        </div>
      </div>
      {/* Progress bar */}
      <div style={{
        width: '100%', height: '6px', borderRadius: '3px',
        background: 'var(--clr-border)', overflow: 'hidden'
      }}>
        <div style={{
          width: `${progressPct}%`, height: '100%', borderRadius: '3px',
          background: state.mastered
            ? 'linear-gradient(90deg, #f5a623, #f7c948)'
            : 'var(--clr-accent)',
          transition: 'width 0.4s ease'
        }} />
      </div>
      {/* Toast message */}
      {toastMsg && (
        <div
          onClick={onClearToast}
          style={{
            marginTop: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem',
            cursor: 'pointer', transition: 'opacity 0.3s',
            background: toastMsg.type === 'up' ? 'rgba(46,160,67,0.12)'
              : toastMsg.type === 'mastered' ? 'rgba(245,166,35,0.15)'
              : 'rgba(255,100,100,0.1)',
            border: toastMsg.type === 'up' ? '1px solid var(--clr-correct, #2ea043)'
              : toastMsg.type === 'mastered' ? '1px solid #f5a623'
              : '1px solid rgba(255,100,100,0.3)',
            color: 'var(--clr-text)'
          }}
        >
          {toastMsg.text} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>(click to dismiss)</span>
        </div>
      )}
    </div>
  );
}

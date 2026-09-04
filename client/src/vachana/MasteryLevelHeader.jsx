/**
 * @fileoverview MasteryLevelHeader Component
 * Renders the level indicator bar inside an active exercise workspace.
 */

export default function MasteryLevelHeader({ state, maxLevel, toastMsg, onClearToast, elapsedTime, hideProgressBar, hideLevelTitle }) {
  const isTutorial = state.currentLevel === 0;
  const accuracy = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 0;
  const progressPct = isTutorial ? 0 : Math.round((state.currentLevel / maxLevel) * 100);

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m === 0 ? `${s}s` : `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const shouldShowProgressBar = !hideProgressBar && !isTutorial;

  return (
    <div style={{ marginBottom: shouldShowProgressBar ? '16px' : '4px' }}>
      {/* Level and live metrics header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: shouldShowProgressBar ? '10px' : '4px',
        flexWrap: 'wrap', gap: '8px'
      }}>
        <div>
          {!isTutorial && !hideLevelTitle && (
            <span style={{ fontSize: '0.9rem', color: 'var(--clr-text)', fontWeight: 700 }}>
              {state.mastered
                ? 'Mastered'
                : `Level ${state.currentLevel} / ${maxLevel}`
              }
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {elapsedTime !== undefined && elapsedTime !== null && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.82rem',
              background: 'var(--clr-surface)', padding: '4px 12px', borderRadius: '12px',
              border: '1px solid var(--clr-border)'
            }}>
              Time: <strong style={{ color: 'var(--clr-text)' }}>{formatTime(elapsedTime)}</strong>
            </span>
          )}
          {state.points !== undefined && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              color: 'var(--clr-accent)',
              fontWeight: 700, fontSize: '0.82rem',
              background: 'var(--clr-accent-soft)',
              padding: '4px 12px', borderRadius: '12px',
              border: '1px solid var(--clr-accent)'
            }}>
              Points: <strong style={{ color: 'var(--clr-accent)' }}>{state.points || 0} pts</strong>
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            color: state.correctStreak > 0 ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
            fontWeight: 600, fontSize: '0.82rem',
            background: state.correctStreak > 0 ? 'var(--clr-accent-soft)' : 'var(--clr-surface)',
            padding: '4px 12px', borderRadius: '12px',
            border: state.correctStreak > 0 ? '1px solid var(--clr-accent)' : '1px solid var(--clr-border)'
          }}>
            Streak: <strong style={{ color: state.correctStreak > 0 ? 'var(--clr-accent)' : 'var(--clr-text)' }}>{state.correctStreak || 0}</strong>
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            color: state.totalAttempts === 0 ? 'var(--clr-text-soft)' : accuracy >= 75 ? 'var(--clr-correct)' : accuracy >= 50 ? 'var(--clr-accent)' : 'var(--clr-wrong)',
            fontWeight: 600, fontSize: '0.82rem',
            background: state.totalAttempts === 0 ? 'var(--clr-surface)' : accuracy >= 75 ? 'var(--clr-correct-bg)' : 'var(--clr-accent-soft)',
            padding: '4px 12px', borderRadius: '12px',
            border: state.totalAttempts === 0 ? '1px solid var(--clr-border)' : accuracy >= 75 ? '1px solid var(--clr-correct)' : '1px solid var(--clr-border)'
          }}>
            Accuracy: <strong style={{ color: state.totalAttempts === 0 ? 'var(--clr-text-soft)' : accuracy >= 75 ? 'var(--clr-correct)' : accuracy >= 50 ? 'var(--clr-accent)' : 'var(--clr-wrong)' }}>{state.totalAttempts > 0 ? `${accuracy}%` : '0%'}</strong>
          </span>
        </div>
      </div>
      {/* Progress bar */}
      {shouldShowProgressBar && (
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
      )}
      {/* Toast message */}
      {toastMsg && (
        <div
          onClick={onClearToast}
          style={{
            marginTop: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem',
            cursor: 'pointer', transition: 'opacity 0.3s',
            background: toastMsg.type === 'up' ? 'var(--clr-correct-bg)'
              : toastMsg.type === 'mastered' ? 'var(--clr-accent-soft)'
              : 'var(--clr-wrong-bg)',
            border: toastMsg.type === 'up' ? '1px solid var(--clr-correct)'
              : toastMsg.type === 'mastered' ? '1px solid var(--clr-accent)'
              : '1px solid var(--clr-wrong)',
            color: 'var(--clr-text)'
          }}
        >
          {toastMsg.text} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>(click to dismiss)</span>
        </div>
      )}
    </div>
  );
}

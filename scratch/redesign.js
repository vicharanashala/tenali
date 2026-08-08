const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8').replace(/\r\n/g, '\n');

const oldState = `  const [activeTab, setActiveTab] = useState(1);
  const currentXp = getLocalXp();`;
const newState = `  const currentXp = getLocalXp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUnlockTime, setLastUnlockTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (lastUnlockTime > 0) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, 60 - Math.floor((Date.now() - lastUnlockTime) / 1000));
        setCooldownRemaining(remaining);
        if (remaining === 0) clearInterval(interval);
      }, 1000);
      setCooldownRemaining(Math.max(0, 60 - Math.floor((Date.now() - lastUnlockTime) / 1000)));
      return () => clearInterval(interval);
    }
  }, [lastUnlockTime]);`;

code = code.replace(oldState, newState);

const oldReset = `  useEffect(() => {
    setUnlockedLevels({});
    setErrorMsg('');
    setLoadingLevel(null);
    setConfirmingLevel(null);
    setActiveTab(1);
  }, [questionId]);`;
const newReset = `  useEffect(() => {
    setUnlockedLevels({});
    setErrorMsg('');
    setLoadingLevel(null);
    setConfirmingLevel(null);
    setIsExpanded(false);
    setLastUnlockTime(0);
    setCooldownRemaining(0);
  }, [questionId]);`;

code = code.replace(oldReset, newReset);

const oldUnlock = `      if (data.guest) {
        changeXp(-actualCost);
      } else if (data.balance !== undefined) {
        setLocalXp(data.balance);
        try {
          window.dispatchEvent(new CustomEvent('tenali-xp-float', { detail: { diff: -actualCost } }));
        } catch {}
      }

      setUnlockedLevels(prev => ({ ...prev, [level]: data.hint }));
      setActiveTab(level);`;

const newUnlock = `      if (data.guest) {
        changeXp(-actualCost);
      } else if (data.balance !== undefined) {
        setLocalXp(data.balance);
        try {
          window.dispatchEvent(new CustomEvent('tenali-xp-float', { detail: { diff: -actualCost } }));
        } catch {}
      }

      setUnlockedLevels(prev => ({ ...prev, [level]: data.hint }));
      setLastUnlockTime(Date.now());
      setCooldownRemaining(60);
      setIsExpanded(true);`;

code = code.replace(oldUnlock, newUnlock);

const oldLevels = `  const levels = [
    { id: 1, label: 'Level 1', labelShort: 'Level 1', costHint: '5 XP', desc: 'A directional nudge — no numbers revealed, no spoilers.' },
    { id: 2, label: 'Level 2', labelShort: 'Level 2', costHint: '8 XP', desc: 'Reveals the first equation step with one concrete value.' },
    { id: 3, label: 'Level 3', labelShort: 'Level 3', costHint: '10 XP', desc: 'Step-by-step complete worked solution.' }
  ];`;

const newLevels = `  const levels = [
    { id: 1, label: 'Hint 1', labelShort: 'Hint 1', costHint: '5 XP', desc: 'A directional nudge — no numbers revealed, no spoilers.' },
    { id: 2, label: 'Hint 2', labelShort: 'Hint 2', costHint: '8 XP', desc: 'Reveals the first equation step with one concrete value.' },
    { id: 3, label: 'Hint 3', labelShort: 'Hint 3', costHint: '10 XP', desc: 'Step-by-step complete worked solution.' }
  ];`;

code = code.replace(oldLevels, newLevels);

const endIdx = code.indexOf('function useQuizHintsAndXp');
const returnIdx = code.lastIndexOf('  return (\n    <div className="progressive-hints-panel"', endIdx);

if (endIdx === -1 || returnIdx === -1) {
  console.error('FATAL: Could not find returnIdx or endIdx. endIdx:', endIdx, 'returnIdx:', returnIdx);
  process.exit(1);
}

const newReturn = `  const highestUnlocked = Math.max(0, ...Object.keys(unlockedLevels).map(Number));
  const nextLevel = highestUnlocked === 3 ? null : levels.find(l => l.id === highestUnlocked + 1);

  return (
    <div className="progressive-hints-panel" style={{ marginTop: '24px', textAlign: 'left' }}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'var(--clr-surface)',
            border: '1.5px solid var(--clr-border)',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--clr-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>💡</span> 
          {highestUnlocked > 0 ? \`View Hints (\${highestUnlocked}/3 Unlocked)\` : 'Get a Hint'}
        </button>
      ) : (
        <div style={{
          background: 'var(--clr-card)',
          border: '1.5px solid var(--clr-border)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', color: 'var(--clr-text)' }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span> Progressive Hints
            </h3>
            <button onClick={() => setIsExpanded(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6 }}>✖</button>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--clr-wrong)', fontSize: '0.85rem', marginBottom: '12px', padding: '8px 12px', borderRadius: '8px', background: 'var(--clr-wrong-bg)', border: '1px solid rgba(224, 90, 74, 0.2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {levels.filter(l => unlockedLevels[l.id] || revealed).map(lvl => (
              <div key={lvl.id} style={{ padding: '12px', background: 'var(--clr-surface)', borderRadius: '8px', borderLeft: \`4px solid \${lvl.id === 1 ? '#f5b041' : lvl.id === 2 ? '#e67e22' : '#2ecc71'}\` }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--clr-text-soft)' }}>
                  {lvl.labelShort}
                </div>
                {lvl.id === 1 ? renderNudgeHint(unlockedLevels[lvl.id] || 'Refer to solution.') : formatHintText(unlockedLevels[lvl.id] || 'Refer to solution.')}
              </div>
            ))}
          </div>

          {nextLevel && !revealed && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--clr-border)', textAlign: 'center' }}>
              {confirmingLevel === nextLevel.id ? (
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'var(--clr-input)', borderRadius: '8px', border: '1.5px solid var(--clr-accent)' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="xp-coin" style={{ width: '14px', height: '14px' }} />
                    Spend {nextLevel.costHint} to unlock {nextLevel.labelShort}?
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => { setConfirmingLevel(null); handleUnlock(nextLevel.id); }} style={{ background: 'var(--clr-accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                    <button onClick={() => setConfirmingLevel(null)} style={{ background: 'transparent', color: 'var(--clr-text-soft)', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingLevel(nextLevel.id)}
                  disabled={loadingLevel === nextLevel.id || cooldownRemaining > 0}
                  style={{
                    background: cooldownRemaining > 0 ? 'var(--clr-surface)' : 'linear-gradient(135deg, #f5b041 0%, #d35400 100%)',
                    color: cooldownRemaining > 0 ? 'var(--clr-text-soft)' : '#fff',
                    border: cooldownRemaining > 0 ? '1px solid var(--clr-border)' : 'none',
                    borderRadius: '8px', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 800, cursor: cooldownRemaining > 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    boxShadow: cooldownRemaining > 0 ? 'none' : '0 4px 10px rgba(211, 84, 0, 0.3)',
                    opacity: cooldownRemaining > 0 ? 0.7 : 1
                  }}
                >
                  {loadingLevel === nextLevel.id ? 'Unlocking...' : cooldownRemaining > 0 ? \`Wait \${cooldownRemaining}s for next hint\` : <><span className="xp-coin" style={{ width: '14px', height: '14px' }} />Unlock {nextLevel.labelShort} — {nextLevel.costHint}</>}
                </button>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', marginTop: '8px' }}>{nextLevel.desc}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;

const newCode = code.slice(0, returnIdx) + newReturn + code.slice(endIdx - 1);
fs.writeFileSync('client/src/App.jsx', newCode);
console.log('Successfully redesigned ProgressiveHintPanel!');

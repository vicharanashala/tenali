const fs = require('fs');
let code = fs.readFileSync('src/components/HintSystem/HintModal.jsx', 'utf8');

// 1. Export GlobalXpPanel
code = code + `

export function GlobalXpPanel() {
  const [xp, setXp] = useState(getLocalXp());
  useEffect(() => {
    const handleStorage = () => setXp(getLocalXp());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => {
      const current = getLocalXp();
      if (current !== xp) setXp(current);
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [xp]);
  return (
    <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10000, background: 'var(--clr-surface, #1e1e2f)', padding: '8px 16px', borderRadius: '20px', color: '#f5b041', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid var(--clr-border, #333)' }}>
      XP: {xp}
    </div>
  );
}
`;

// 2. Add isMinimized state to HintModal
code = code.replace(
  'const [cooldownRemaining, setCooldownRemaining] = useState(0);',
  'const [cooldownRemaining, setCooldownRemaining] = useState(0);\n  const [isMinimized, setIsMinimized] = useState(true);'
);

// 3. Update return statement of HintModal to handle minimize state
const mainReturn = `  return (
    <div className="progressive-hints-panel" style={{ marginTop: '24px', textAlign: 'left' }}>`;
    
const replacedReturn = `  if (isMinimized) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        <button onClick={() => setIsMinimized(false)} style={{ background: 'var(--clr-primary, #3b82f6)', color: 'white', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '1rem' }}>
          Hints
        </button>
      </div>
    );
  }

  return (
    <div className="progressive-hints-panel" style={{ position: 'fixed', bottom: '24px', right: '24px', width: '350px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--clr-surface, #1e1e2f)', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 9999, border: '1px solid var(--clr-border, #333)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--clr-text, #f8f8f2)' }}>Hints</h3>
        <button onClick={() => setIsMinimized(true)} style={{ background: 'transparent', border: 'none', color: 'var(--clr-text-soft, #a1a1aa)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
      </div>
`;

code = code.replace(mainReturn, replacedReturn);

// 4. Remove emojis
code = code.replace(/<span>📋<\/span>/g, '');
code = code.replace(/<span>⚡<\/span>/g, '');
code = code.replace(/<span>⚠️<\/span>/g, '');
code = code.replace(/<span>Hint 1 — no spoilers<\/span>/g, '<span>Hint 1</span>');
code = code.replace(/Hint 2 Revealed/g, 'Hint 2');
code = code.replace(/Hint 3 — Worked Solution/g, 'Hint 3');
code = code.replace(/<span className="xp-coin".*?><\/span>/g, '');

fs.writeFileSync('src/components/HintSystem/HintModal.jsx', code);
console.log('Updated HintModal.jsx');

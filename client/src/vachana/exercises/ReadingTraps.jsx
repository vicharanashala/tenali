import { useState } from 'react';
const TRAPS = [
  { title: 'The 6S = P Equation Trap', concept: 'Phrases like "6 times as many students as professors" lead students to write 6S = P. But substituting S = 12 gives 72 = P, meaning 72 professors! The correct relation is S = 6P.', quiz: 'For 3 times as many apples (A) as bananas (B), what is the correct relation?', options: ['3A = B', 'A = 3B'], correct: 'A = 3B' },
  { title: 'The Inclusive vs. Exclusive Boundary Trap', concept: 'Numbers from 10 to 20 "inclusive" contains 11 numbers (20 − 10 + 1). "Exclusive" contains only 9 numbers (20 − 10 − 1).', quiz: 'How many integers are between 15 and 25, inclusive?', options: ['10', '11'], correct: '11' }
];
export default function ReadingTraps() {
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (a) => { setAns(a); setMsg(a === TRAPS[idx].correct ? '✅ Correct! You avoided the reading trap.' : '❌ Not quite. Analyze the relation or boundary offset again.'); };
  return (
    <div>
      <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--clr-accent)' }}>{TRAPS[idx].title}</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{TRAPS[idx].concept}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={idx === 0} onClick={() => { setIdx(0); setAns(null); setMsg(''); }} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--clr-border)', background: 'transparent', color: 'inherit', cursor: 'pointer', opacity: idx === 0 ? 0.4 : 1 }}>◀ Previous Trap</button>
          <button disabled={idx === TRAPS.length - 1} onClick={() => { setIdx(1); setAns(null); setMsg(''); }} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--clr-border)', background: 'transparent', color: 'inherit', cursor: 'pointer', opacity: idx === TRAPS.length - 1 ? 0.4 : 1 }}>Next Trap ▶</button>
        </div>
      </div>
      <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 600 }}>{TRAPS[idx].quiz}</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {TRAPS[idx].options.map(opt => (
            <button key={opt} onClick={() => check(opt)} className="submit-btn" style={{ padding: '6px 14px', background: ans === opt ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: ans === opt ? '#fff' : 'var(--clr-accent)' }}>{opt}</button>
          ))}
        </div>
        {msg && <span style={{ fontSize: '0.9rem', color: msg.startsWith('✅') ? 'var(--clr-correct)' : 'red' }}>{msg}</span>}
      </div>
    </div>
  );
}

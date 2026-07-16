import { useState } from 'react';
const TOKENS = ['x', '+', '1', '2', '(', 'x+1', ')', 'x+2', '=', '48', '3', '*', '15'];
const CORRECT = 'x+(x+1)+(x+2)=48';
export default function TranslateEnglishMath() {
  const [assembled, setAssembled] = useState([]);
  const [msg, setMsg] = useState('');
  const check = () => {
    const code = assembled.join('').replace(/\s+/g, '');
    if (code === CORRECT || code === 'x+x+1+x+2=48' || code === '3x+3=48') {
      setMsg('✅ Correct translation! x + (x+1) + (x+2) = 48 captures the consecutive sum.');
    } else {
      setMsg('❌ That algebraic expression does not match the sentence structure. Try again!');
    }
  };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Sentence: <strong>"The sum of three consecutive integers is forty-eight."</strong></p>
      <div style={{ minHeight: '50px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        {assembled.length === 0 ? <span style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>Click blocks below to build the equation here...</span>
          : assembled.map((tok, idx) => (
            <button key={idx} onClick={() => { setAssembled(prev => prev.filter((_, i) => i !== idx)); setMsg(''); }} className="quiz-pill"
              style={{ padding: '6px 12px', fontSize: '1rem', cursor: 'pointer', background: 'var(--clr-hover-strong)', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>{tok}</button>
          ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {TOKENS.map((tok, idx) => (
          <button key={idx} onClick={() => { setAssembled(prev => [...prev, tok]); setMsg(''); }}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'inherit', cursor: 'pointer', fontSize: '0.95rem' }}>{tok}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="submit-btn" onClick={check}>Check Equation</button>
        <button onClick={() => { setAssembled([]); setMsg(''); }} style={{ background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px' }}>Clear Workspace</button>
      </div>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

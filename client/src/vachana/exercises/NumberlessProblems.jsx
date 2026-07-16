import { useState } from 'react';
const POOL = ['Time', '*', '(', 'Rate A', '+', 'Rate B', ')', '=', 'Total', 'x', '-', 'Rate C'];
const VALID = ['Time * ( Rate A + Rate B ) = Total', '( Rate A + Rate B ) * Time = Total', 'Total = Time * ( Rate A + Rate B )', 'Total = ( Rate A + Rate B ) * Time'];
export default function NumberlessProblems() {
  const [assembled, setAssembled] = useState([]);
  const [msg, setMsg] = useState('');
  const check = () => {
    if (VALID.includes(assembled.join(' '))) setMsg('✅ Correct! You successfully structured the relationship: Time multiplied by the combined rate equals the Total work.');
    else setMsg("❌ That structure doesn't represent the total production. Hint: Combine the rates first, then scale by time.");
  };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Build the algebraic structure of the relationship without numeric values: <br /><strong>"A factory produces A widgets per hour. A second factory produces B widgets per hour. If they operate together, how long does it take for both factories to produce a total of D widgets?"</strong></p>
      <div style={{ minHeight: '50px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        {assembled.length === 0 ? <span style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>Click blocks below to build the conceptual equation plan here...</span>
          : assembled.map((tok, idx) => <button key={idx} onClick={() => { setAssembled(prev => prev.filter((_, i) => i !== idx)); setMsg(''); }} className="quiz-pill" style={{ padding: '6px 12px', fontSize: '1rem', cursor: 'pointer', background: 'var(--clr-hover-strong)', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>{tok}</button>)}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {POOL.map((tok, idx) => <button key={idx} onClick={() => { setAssembled(prev => [...prev, tok]); setMsg(''); }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'inherit', cursor: 'pointer', fontSize: '0.95rem' }}>{tok}</button>)}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="submit-btn" onClick={check}>Verify Plan Structure</button>
        <button onClick={() => { setAssembled([]); setMsg(''); }} style={{ background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px' }}>Clear Plan</button>
      </div>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

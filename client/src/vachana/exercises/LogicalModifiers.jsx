import { useState } from 'react';
export default function LogicalModifiers() {
  const [answers, setAnswers] = useState({ q1: '', q2: '' });
  const [msg, setMsg] = useState('');
  const set = (k, v) => { setAnswers(prev => ({ ...prev, [k]: v })); setMsg(''); };
  const check = () => {
    if (answers.q1 === 'respectively' && answers.q2 === 'inclusive') setMsg('✅ Correct! "respectively" maps $15 to A and $30 to B in order; "inclusive" counts both boundary values.');
    else setMsg('❌ Some answers are incorrect. Review the mapping order or range definition.');
  };
  const sel = (k, v, opts) => (
    <select value={v} onChange={e => set(k, e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--clr-border)', background: 'var(--clr-card)', color: 'inherit' }}>
      <option value="">--select--</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '16px' }}>Fill in the blanks with the correct logical modifiers to make the sentence mathematically clear.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '20px', lineHeight: '1.6' }}>
        <div><span>1. Rahul and Amit have $15 and $30, </span>{sel('q1', answers.q1, ['each', 'respectively', 'equally'])}<span>.</span></div>
        <div><span>2. Sum all integers from 1 to 10, </span>{sel('q2', answers.q2, ['exclusive', 'inclusive'])}<span>. (Expected result is 55).</span></div>
      </div>
      <button className="submit-btn" onClick={check}>Submit Grammar Check</button>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

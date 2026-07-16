import { useState } from 'react';
const TOKENS = [
  { text: 'A red train', isNoise: true }, { text: 'with 4 blue stripes', isNoise: true }, { text: 'carries 120 passengers', isNoise: true },
  { text: 'at a speed of', isNoise: false }, { text: '60 km/h.', isNoise: false }, { text: 'How far', isNoise: false },
  { text: 'does it travel in', isNoise: false }, { text: '3 hours?', isNoise: false }
];
export default function NoiseFilter() {
  const [status, setStatus] = useState({});
  const [msg, setMsg] = useState('');
  const toggle = (idx, cur) => setStatus(prev => ({ ...prev, [idx]: cur === 'relevant' ? 'noise' : 'relevant' }));
  const check = () => {
    const ok = TOKENS.every((tok, idx) => (status[idx] || 'relevant') === (tok.isNoise ? 'noise' : 'relevant'));
    if (ok) setMsg('✅ Perfect! You successfully identified the speed (60 km/h) and time (3 hours) as relevant, and filtered out the train color, stripes, and passenger counts as logical noise.');
    else setMsg('❌ Mismatches found. Verify if passenger count or train styling are necessary to solve a distance problem!');
  };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '10px' }}>A train travel speed problem: Click on the phrase cards below to toggle them between <strong>Relevant</strong> (normal) and <strong>Noise</strong> (dimmed out).</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px', background: 'var(--clr-surface)', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        {TOKENS.map((tok, idx) => {
          const st = status[idx] || 'relevant';
          return <button key={idx} onClick={() => toggle(idx, st)} style={{ padding: '6px 12px', borderRadius: '6px', border: st === 'noise' ? '1px dashed red' : '1px solid var(--clr-correct, #2ea043)', opacity: st === 'noise' ? 0.35 : 1, textDecoration: st === 'noise' ? 'line-through' : 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '0.95rem' }}>{tok.text}</button>;
        })}
      </div>
      <button className="submit-btn" onClick={check}>Verify Filter</button>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

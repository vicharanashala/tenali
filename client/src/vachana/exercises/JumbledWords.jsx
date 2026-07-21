import { useState } from 'react';
export default function JumbledWords() {
  const [blocks, setBlocks] = useState(['y', 'adding', 'the sum of', 'three times', 'four to']);
  const [msg, setMsg] = useState('');
  const move = (idx, dir) => {
    const next = [...blocks]; const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]]; setBlocks(next);
  };
  const check = () => { if (blocks.join(' ') === 'three times the sum of adding four to y') setMsg('✅ Correct! The phrase correctly mirrors the algebraic expression 3(y + 4).'); else setMsg('❌ Wrong phrasing order. Remember: multiply the overall sum, so state "three times" before the sum description.'); };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Arrange the jumbled blocks below to construct the correct verbal phrase for the math expression: <strong style={{ color: 'var(--clr-accent)', fontSize: '1.1rem' }}>3(y + 4)</strong>.</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px', background: 'var(--clr-surface)', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        {blocks.map((block, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.95rem' }}>{block}</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ padding: '2px 5px', fontSize: '0.7rem', border: '1px solid var(--clr-border)', background: 'transparent', color: 'inherit', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>◀</button>
              <button onClick={() => move(idx, 1)} disabled={idx === blocks.length - 1} style={{ padding: '2px 5px', fontSize: '0.7rem', border: '1px solid var(--clr-border)', background: 'transparent', color: 'inherit', cursor: 'pointer', opacity: idx === blocks.length - 1 ? 0.3 : 1 }}>▶</button>
            </div>
          </div>
        ))}
      </div>
      <button className="submit-btn" onClick={check}>Check Word Order</button>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

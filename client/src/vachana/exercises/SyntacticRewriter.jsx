import { useState } from 'react';
export default function SyntacticRewriter() {
  const [blocks, setBlocks] = useState(['then subtract 15', 'Multiply a number', 'by 3']);
  const [msg, setMsg] = useState('');
  const move = (idx, dir) => {
    const next = [...blocks]; const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]]; setBlocks(next);
  };
  const check = () => { if (blocks.join(' ') === 'Multiply a number by 3 then subtract 15') setMsg('✅ Correct! By placing operations in chronological/active order, you clarify the algebraic sequence: 3x − 15.'); else setMsg('❌ Incorrect step sequence. Follow the order of algebraic operations: multiply first, then subtract.'); };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>The passive statement below obscures the sequence of operations. Arrange the blocks in chronological active order:<br />Passive text: <strong>"15 was subtracted from the product of a number and 3."</strong></p>
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
      <button className="submit-btn" onClick={check}>Check Sequence</button>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

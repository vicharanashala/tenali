import { useState } from 'react';
const NODES = {
  integer: { label: 'Integer', reqs: [], desc: 'Whole positive or negative numbers.' },
  division: { label: 'Division', reqs: ['integer'], desc: 'Splitting into equal parts.' },
  fraction: { label: 'Fraction', reqs: ['division'], desc: 'Part of a whole number represented as a/b.' },
  ratio: { label: 'Ratio', reqs: ['fraction'], desc: 'Linguistic comparison of two quantities.' },
  proportion: { label: 'Proportion', reqs: ['ratio'], desc: 'Equation showing two ratios are equal.' },
  percent: { label: 'Percentage', reqs: ['ratio', 'fraction'], desc: 'A ratio whose denominator is always 100.' }
};
export default function DependencyGraph() {
  const [node, setNode] = useState('ratio');
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '16px' }}>Concepts build on top of each other. Click terms in the prerequisite chain to see how vocabulary structures math learning.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {Object.keys(NODES).map(key => (
          <button key={key} onClick={() => setNode(key)} style={{ padding: '12px 10px', borderRadius: '10px', border: node === key ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)', background: node === key ? 'var(--clr-accent-bg, rgba(108,206,255,0.1))' : 'var(--clr-surface)', color: node === key ? 'var(--clr-accent)' : 'inherit', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{NODES[key].label}</span>
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--clr-accent)' }}>{NODES[node].label}</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem' }}>{NODES[node].desc}</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Prerequisites:</span>
          {NODES[node].reqs.length === 0
            ? <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--clr-text-soft)' }}>None (Foundational)</span>
            : NODES[node].reqs.map(req => (
              <button key={req} onClick={() => setNode(req)} className="quiz-pill"
                style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'var(--clr-hover-strong)', borderRadius: '6px', border: 'none', color: 'var(--clr-accent)', cursor: 'pointer' }}>{NODES[req].label}</button>
            ))}
        </div>
      </div>
    </div>
  );
}

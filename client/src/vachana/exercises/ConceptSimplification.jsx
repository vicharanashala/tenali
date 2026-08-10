import { useState } from 'react';
const OPTIONS = [
  { text: 'By division pattern: x³ / x³ = x^(3-3) = x⁰. Since any number divided by itself is 1, x⁰ must equal 1.', correct: true },
  { text: 'By axiomatic definition: it is defined as a boundary rule in mathematics so that operations do not divide by zero.', correct: false },
  { text: 'By multiplication pattern: x multiplied by itself 0 times means you do not multiply anything, leaving 0.', correct: false }
];
export default function ConceptSimplification() {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (opt) => { setSelected(opt.text); setMsg(opt.correct ? '✅ Correct! Showing that x³ / x³ is both equal to x⁰ (by subtraction of exponents rule) and equal to 1 (any number divided by itself) is the most intuitive way to explain why x⁰ = 1.' : '❌ That explanation is either confusing, incorrect, or lacks pattern-based intuition for a beginner.'); };
  return (
    <div>
      <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.98rem', fontWeight: 600 }}>Concept Challenge: How would you explain to a beginner why any non-zero number to the power of 0 is 1? (e.g., x⁰ = 1)</p>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--clr-text-soft)' }}>Select the most intuitive explanation:</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {OPTIONS.map((opt, idx) => <button key={idx} onClick={() => check(opt)} className="submit-btn" style={{ textAlign: 'left', padding: '12px 16px', background: selected === opt.text ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: selected === opt.text ? '#fff' : 'var(--clr-accent)' }}>{opt.text}</button>)}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

import { useState } from 'react';
const OPTIONS = [
  { text: 'Riya bought 2 books for x dollars each and paid $10 tax. The total bill was $50.', correct: true },
  { text: 'Riya has 2 books and 10 pencils, totaling 50 school items.', correct: false },
  { text: 'Riya has $10 and doubles it, then adds $50.', correct: false }
];
export default function EquationToStory() {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (opt) => { setSelected(opt.text); setMsg(opt.correct ? '✅ Correct! 2x (2 books at x each) plus 10 (flat tax) equals 50 (total bill) matches 2x + 10 = 50 perfectly.' : '❌ Incorrect story translation. Ensure variable multiplications and constant additions align with the algebraic equation.'); };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Select the word story that represents the algebraic equation: <strong style={{ color: 'var(--clr-accent)', fontSize: '1.1rem' }}>2x + 10 = 50</strong>.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {OPTIONS.map((opt, idx) => (
          <button key={idx} onClick={() => check(opt)} className="submit-btn" style={{ textAlign: 'left', padding: '12px 16px', background: selected === opt.text ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: selected === opt.text ? '#fff' : 'var(--clr-accent)' }}>{opt.text}</button>
        ))}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

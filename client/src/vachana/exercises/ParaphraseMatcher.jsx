import { useState } from 'react';
const OPTIONS = [
  { text: 'y is four less than three times x', correct: true },
  { text: 'y is three times four less than x', correct: false },
  { text: 'y is four minus three times x', correct: false }
];
export default function ParaphraseMatcher() {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (opt) => { setSelected(opt.text); setMsg(opt.correct ? '✅ Correct! "Four less than" translates to subtracting 4 from the term 3x: y = 3x − 4.' : '❌ Incorrect. Remember: "Four less than" implies subtraction is written at the end.'); };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Identify the correct verbal translation for the math equation: <strong style={{ color: 'var(--clr-accent)', fontSize: '1.1rem' }}>y = 3x − 4</strong>.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {OPTIONS.map((opt, idx) => (
          <button key={idx} onClick={() => check(opt)} className="submit-btn" style={{ textAlign: 'left', padding: '12px 16px', background: selected === opt.text ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: selected === opt.text ? '#fff' : 'var(--clr-accent)' }}>{opt.text}</button>
        ))}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

import { useState } from 'react';
const OPTIONS = [
  { text: 'Find the width (w)', correct: false },
  { text: 'Find the length (2w + 3)', correct: false },
  { text: 'Find the area (w * (2w + 3))', correct: true },
  { text: 'Find the perimeter (2w + 2(2w + 3))', correct: false }
];
export default function GoalStatePredictor() {
  const [answer, setAnswer] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (opt) => { setAnswer(opt.text); setMsg(opt.correct ? '✅ Correct! The question asks for the "area of the rectangle", which is Width × Length = w × (2w + 3). Many students fail by solving for w and stopping.' : '❌ Incorrect. Read the last sentence of the word problem again: "what is the area...?"'); };
  return (
    <div>
      <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.98rem', fontStyle: 'italic', lineHeight: '1.5' }}>"A rectangle's length is 3 cm more than twice its width. If the perimeter is 36 cm, what is the area of the rectangle?"</p>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--clr-text-soft)' }}>Which mathematical expression represents the ultimate goal to solve this word problem?</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {OPTIONS.map((opt, idx) => (
          <button key={idx} onClick={() => check(opt)} className="submit-btn" style={{ textAlign: 'left', padding: '12px 16px', background: answer === opt.text ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: answer === opt.text ? '#fff' : 'var(--clr-accent)' }}>{opt.text}</button>
        ))}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

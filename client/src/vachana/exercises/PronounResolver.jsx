import { useState } from 'react';
export default function PronounResolver() {
  const [answer, setAnswer] = useState(null);
  const [msg, setMsg] = useState('');
  const check = (ans) => {
    setAnswer(ans);
    if (ans === 'Ravi') setMsg('✅ Correct! "He" in the third sentence refers back to Ravi, who did the buying and sharing.');
    else setMsg('❌ Incorrect. Remember, "He then lost one" refers to the person who originally bought the books.');
  };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Text: <em>"Ravi bought 3 books. He gave them to Amit. <strong>He</strong> then lost one."</em></p>
      <p style={{ fontSize: '0.95rem', marginBottom: '16px' }}>Who does the bolded word <strong>"He"</strong> in the third sentence refer to?</p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['Ravi', 'Amit', 'The books'].map(ans => (
          <button key={ans} onClick={() => check(ans)} className="submit-btn"
            style={{ padding: '8px 16px', background: answer === ans ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: answer === ans ? '#fff' : 'var(--clr-accent)' }}>{ans}</button>
        ))}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

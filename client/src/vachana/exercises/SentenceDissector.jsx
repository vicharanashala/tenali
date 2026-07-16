import { useState } from 'react';

const SENTENCE = [
  { text: 'Rahul', type: 'subject' },
  { text: 'has', type: 'verb' },
  { text: 'seven', type: 'quantity' },
  { text: 'more apples than', type: 'relationship' },
  { text: 'Riya', type: 'target' }
];

export default function SentenceDissector() {
  const [answers, setAnswers] = useState({});
  const [activeIdx, setActiveIdx] = useState(null);
  const [msg, setMsg] = useState('');

  const handleClassify = (category) => {
    if (activeIdx === null) return;
    const word = SENTENCE[activeIdx];
    const isCorrect = word.type === category;
    setAnswers(prev => ({ ...prev, [activeIdx]: { category, isCorrect } }));
    if (isCorrect) {
      setMsg(`✅ Correct! "${word.text}" is indeed the ${category.toUpperCase()}.`);
    } else {
      setMsg(`❌ Not quite. "${word.text}" is not the ${category.toUpperCase()}. Try again!`);
    }
    setActiveIdx(null);
  };

  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>Click on a word in the sentence below, then select its mathematical role to dissect its logical structure.</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '16px', background: 'var(--clr-surface)', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        {SENTENCE.map((word, idx) => {
          const ans = answers[idx];
          let border = '1px solid var(--clr-border)';
          let bg = 'transparent';
          if (idx === activeIdx) { border = '1px solid var(--clr-accent)'; bg = 'var(--clr-accent-bg, rgba(108,206,255,0.12))'; }
          else if (ans) { border = ans.isCorrect ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red'; bg = ans.isCorrect ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)'; }
          return (
            <button key={idx} onClick={() => { setActiveIdx(idx); setMsg(''); }}
              style={{ padding: '8px 14px', borderRadius: '8px', border, background: bg, color: 'inherit', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.15s', wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'left' }}>
              {word.text}
              {ans && <span style={{ marginLeft: '6px', fontSize: '0.8rem' }}>{ans.isCorrect ? '✓' : '✗'}</span>}
            </button>
          );
        })}
      </div>
      {activeIdx !== null && (
        <div style={{ background: 'var(--clr-surface)', padding: '14px', borderRadius: '10px', border: '1px solid var(--clr-border)', marginBottom: '14px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Classify the term <strong>"{SENTENCE[activeIdx].text}"</strong>:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['subject', 'verb', 'quantity', 'relationship', 'target'].map(cat => (
              <button key={cat} onClick={() => handleClassify(cat)} className="submit-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', textTransform: 'capitalize' }}>{cat}</button>
            ))}
          </div>
        </div>
      )}
      {msg && <div style={{ fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

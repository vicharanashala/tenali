import { useState } from 'react';
const QUESTIONS = [
  { root: 'poly', origin: 'Greek', examples: 'polygon, polynomial', question: 'What does the Greek root "poly" mean in mathematics?', options: [{ text: 'One (like monomial)', correct: false }, { text: 'Equal (like equation)', correct: false }, { text: 'Many (like polynomial or polygon)', correct: true, explanation: 'Correct! "Poly" means many. A polygon has many angles/sides, and a polynomial has many algebraic terms.' }, { text: 'Around (like circumference)', correct: false }] },
  { root: 'equi', origin: 'Latin', examples: 'equation, equilateral, equivalence', question: 'What does the Latin root "equi" mean in mathematics?', options: [{ text: 'Half (like semicircle)', correct: false }, { text: 'Equal (like equation or equilateral)', correct: true, explanation: 'Correct! "Equi" means equal. An equation states that two expressions are equal, and an equilateral triangle has equal sides.' }, { text: 'Ten (like decimal)', correct: false }, { text: 'Angle (like pentagon)', correct: false }] },
  { root: 'circum', origin: 'Latin', examples: 'circumference, circumscribe', question: 'What does the Latin root "circum" mean in mathematics?', options: [{ text: 'Around / Round (like circumference)', correct: true, explanation: 'Correct! "Circum" means around. Circumference is the distance around a circle, and circumscribing is drawing a figure around another.' }, { text: 'Side (like lateral)', correct: false }, { text: 'Three (like triangle)', correct: false }, { text: 'Under (like subset)', correct: false }] }
];
export default function RootDecoder() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const nav = (dir) => { setIdx(i => i + dir); setSelected(null); setMsg(''); };
  const check = (opt) => { setSelected(opt.text); setMsg(opt.correct ? `✅ ${opt.explanation}` : '❌ That is incorrect. Think about how this root is used in common math terms (e.g. polygon, equation, circumference).'); };
  const q = QUESTIONS[idx];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', fontWeight: 500 }}>Word Root {idx + 1} of {QUESTIONS.length}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => nav(-1)} disabled={idx === 0} className="submit-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', background: 'transparent', border: '1px solid var(--clr-border)', color: idx === 0 ? 'var(--clr-text-soft)' : 'inherit', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>◀ Prev</button>
          <button onClick={() => nav(1)} disabled={idx === QUESTIONS.length - 1} className="submit-btn" style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', background: 'transparent', border: '1px solid var(--clr-border)', color: idx === QUESTIONS.length - 1 ? 'var(--clr-text-soft)' : 'inherit', cursor: idx === QUESTIONS.length - 1 ? 'not-allowed' : 'pointer' }}>Next ▶</button>
        </div>
      </div>
      <div style={{ background: 'var(--clr-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--clr-accent)' }}>"{q.root}"</span>
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>{q.origin} Origin</span>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--clr-text-soft)' }}>Examples: <strong style={{ color: 'var(--clr-text)' }}>{q.examples}</strong></p>
        <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 500, lineHeight: '1.5' }}>{q.question}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {q.options.map((opt, i) => <button key={i} onClick={() => check(opt)} className="submit-btn" style={{ textAlign: 'left', padding: '12px 16px', background: selected === opt.text ? 'var(--clr-accent)' : 'transparent', border: '1px solid var(--clr-accent)', color: selected === opt.text ? '#fff' : 'var(--clr-accent)' }}>{opt.text}</button>)}
      </div>
      {msg && <div style={{ fontSize: '0.95rem', padding: '12px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,0,0,0.08)', border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid red' }}>{msg}</div>}
    </div>
  );
}

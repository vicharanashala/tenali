import { useState } from 'react';
const PROBLEMS = [
  { id: 0, text: 'Rahul has 12 apples and Joy has 15 oranges. How many fruits do they have in total?', type: 'total' },
  { id: 1, text: 'Rahul has 12 apples. He has 3 fewer apples than Joy. How many does Joy have?', type: 'difference' },
  { id: 2, text: 'Rahul had 12 apples, then he gave 3 to Joy. How many does he have now?', type: 'change' }
];
export default function SchemaClassifier() {
  const [answers, setAnswers] = useState({});
  const [msg, setMsg] = useState('');
  const check = () => {
    if (PROBLEMS.every(p => answers[p.id] === p.type)) setMsg('✅ Correct! You accurately classified all three problems: Total (Part-Part-Whole), Difference (Compare), and Change (Join/Separate).');
    else setMsg('❌ Some classifications are incorrect. Remember: Change involves action over time; Total combines parts; Difference compares sizes.');
  };
  return (
    <div>
      <p style={{ fontSize: '0.95rem', marginBottom: '16px' }}>Classify each word problem by its arithmetic schema type:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {PROBLEMS.map(prob => (
          <div key={prob.id} style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.95rem', fontStyle: 'italic' }}>"{prob.text}"</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Schema:</span>
              <select value={answers[prob.id] || ''} onChange={e => { setAnswers(prev => ({ ...prev, [prob.id]: e.target.value })); setMsg(''); }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-card)', color: 'inherit', fontSize: '0.9rem' }}>
                <option value="">-- select schema --</option>
                <option value="total">Total (Part-Part-Whole)</option>
                <option value="difference">Difference (Compare)</option>
                <option value="change">Change (Join/Separate)</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <button className="submit-btn" onClick={check}>Verify Classifications</button>
      {msg && <div style={{ marginTop: '14px', fontSize: '0.95rem', padding: '10px', borderRadius: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>{msg}</div>}
    </div>
  );
}

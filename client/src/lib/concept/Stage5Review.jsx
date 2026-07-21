import React, { useState, useEffect } from 'react';

export default function Stage5Review({ onComplete, currentRung }) {
  const [q, setQ] = useState(null);
  
  const [userR1, setUserR1] = useState('');
  const [userR2, setUserR2] = useState('');
  
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Generate a random question. Just hardcoding a few for simplicity here.
    const pool = [
      { equation: "x² - 3x - 10 = 0", root1: 5, root2: -2 },
      { equation: "x² + 5x + 6 = 0", root1: -2, root2: -3 },
      { equation: "x² - 9 = 0", root1: 3, root2: -3 },
      { equation: "x² - 8x + 15 = 0", root1: 5, root2: 3 }
    ];
    setQ(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  const handleSubmit = () => {
    const r1 = Number(userR1);
    const r2 = Number(userR2);
    
    if ((r1 === q.root1 && r2 === q.root2) || (r1 === q.root2 && r2 === q.root1)) {
      setFeedback('Correct! Great memory.');
      setTimeout(() => {
        onComplete({ reviewPassed: true });
      }, 1500);
    } else {
      setFeedback(`Incorrect. The roots were ${q.root1} and ${q.root2}.`);
      setTimeout(() => {
        onComplete({ reviewPassed: false });
      }, 2500);
    }
  };

  if (!q) return null;

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Spaced Review</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--clr-text-soft)' }}>
        It's time for your scheduled review. Solve this quadratic equation. (Current Mastery Rung: {currentRung})
      </p>

      <div style={{ background: 'var(--clr-surface-alt)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--clr-border)', marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem', fontFamily: 'monospace' }}>
          {q.equation}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <label>Root 1 = <input type="number" value={userR1} onChange={e => setUserR1(e.target.value)} style={{ width: '80px', padding: '0.25rem' }} disabled={feedback !== null} /></label>
          <label>Root 2 = <input type="number" value={userR2} onChange={e => setUserR2(e.target.value)} style={{ width: '80px', padding: '0.25rem' }} disabled={feedback !== null} /></label>
          <button className="primary-btn" onClick={handleSubmit} disabled={feedback !== null}>Submit</button>
        </div>

        {feedback && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontWeight: 'bold', color: feedback.startsWith('Correct') ? '#4caf50' : '#f44336' }}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';

export default function Stage6Bridge({ onBack, nextReviewDue, DiffApp }) {
  const [showPractice, setShowPractice] = React.useState(false);

  if (showPractice) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <DiffApp onBack={onBack} initialAdaptScore={0.5} />
      </div>
    );
  }

  const isDue = nextReviewDue ? new Date() >= new Date(nextReviewDue) : true;
  
  return (
    <div className="welcome-box" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>Concept Mastered!</h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '2rem' }}>
        You now have the tools to solve any differentiation problem step-by-step.
        <br/><br/>
        {isDue 
          ? "You're ready for some practice."
          : `Next spaced review due on ${new Date(nextReviewDue).toLocaleDateString()} at ${new Date(nextReviewDue).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="secondary-btn" onClick={onBack}>Back to Menu</button>
        <button className="primary-btn" onClick={() => setShowPractice(true)}>Start Practice Quiz</button>
      </div>
    </div>
  );
}

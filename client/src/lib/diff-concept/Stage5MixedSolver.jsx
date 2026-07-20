import React, { useState } from 'react';

export default function Stage5MixedSolver({ onComplete }) {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  const steps = [
    {
      question: <span>To differentiate <i>y</i> = <i>e</i><sup>3x</sup> cos(<i>x</i>), which rule should you apply FIRST?</span>,
      options: ["Chain Rule", "Product Rule", "Power Rule", "Quotient Rule"],
      correct: 1,
      feedback: <span>Correct! The main structure is two functions multiplied together: <i>u</i> = <i>e</i><sup>3x</sup> and <i>v</i> = cos(<i>x</i>).</span>
    },
    {
      question: <span>Now we need <i>u'</i> and <i>v'</i>. What is <i>u'</i> (the derivative of <i>e</i><sup>3x</sup>)?</span>,
      options: [
        <span><i>e</i><sup>3x</sup></span>, 
        <span>3<i>e</i><sup>3x</sup></span>, 
        <span>3<i>x</i><i>e</i><sup>3x</sup></span>, 
        <span><i>x</i><i>e</i><sup>3x</sup></span>
      ],
      correct: 1,
      feedback: <span>Right! We used the Chain Rule on <i>e</i><sup>3x</sup>.</span>
    },
    {
      question: <span>What is the final derivative using <i>u'v + uv'</i>?</span>,
      options: [
        <span>3<i>e</i><sup>3x</sup> cos(<i>x</i>) - <i>e</i><sup>3x</sup> sin(<i>x</i>)</span>,
        <span><i>e</i><sup>3x</sup> cos(<i>x</i>) + <i>e</i><sup>3x</sup> sin(<i>x</i>)</span>,
        <span>3<i>e</i><sup>3x</sup> cos(<i>x</i>) + <i>e</i><sup>3x</sup> sin(<i>x</i>)</span>,
        <span>-3<i>e</i><sup>3x</sup> sin(<i>x</i>)</span>
      ],
      correct: 0,
      feedback: "Outstanding! You successfully combined the Product Rule and Chain Rule to solve the equation."
    }
  ];

  const handleSelect = (index) => {
    if (index === steps[step].correct) {
      setErrorMsg(null);
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        setStep(step + 1); // completion state
      }
    } else {
      // Could log incorrect attempts here
      setErrorMsg("Not quite! Try another option.");
    }
  };

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 7: Mixed Practice Solver
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        You now have all the tools to dissect any function! Let's combine the Chain Rule and the Product Rule to solve a real-world problem.
      </p>

      {step < steps.length ? (
        <div style={{ background: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{steps[step].question}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {steps[step].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleSelect(i)}
                style={{
                  padding: '1rem',
                  fontSize: '1.2rem',
                  textAlign: 'left',
                  background: 'var(--clr-bg)',
                  border: '2px solid var(--clr-border)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                className="hover-border-accent"
              >
                {opt}
              </button>
            ))}
          </div>
          {errorMsg && (
            <div style={{ color: 'var(--clr-red)', marginTop: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '2rem', borderRadius: '8px', color: 'var(--clr-green)', marginBottom: '2rem' }}>
            <h2>{steps[2].feedback}</h2>
          </div>
          <button 
            className="primary-btn pulse" 
            onClick={() => onComplete({ stage5MixedSolver: { problemsSolved: 1 } })}
          >
            Continue to Turning Points →
          </button>
        </div>
      )}
    </div>
  );
}

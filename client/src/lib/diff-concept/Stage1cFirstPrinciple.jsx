import React, { useState } from 'react';

export default function Stage1cFirstPrinciple({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      instruction: <span>How do we calculate the exact derivative <i>f'(x)</i> without just dragging a tangent line? We use the <strong>First Principle of Limits</strong> (as taught in NCERT)!</span>,
      formula: <span><i>f'(x)</i> = lim<sub><i>h</i>&rarr;0</sub> <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}><div style={{ borderBottom: '1px solid var(--clr-text)', paddingBottom: '2px' }}><i>f(x+h) - f(x)</i></div><div style={{ paddingTop: '2px' }}><i>h</i></div></span></span>,
      action: "Start Deriving f(x) = x²"
    },
    {
      instruction: <span>Let's find the derivative of <strong><i>f(x) = x²</i></strong>. First, we substitute <i>x²</i> into the formula:</span>,
      formula: <span><i>f'(x)</i> = lim<sub><i>h</i>&rarr;0</sub> <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}><div style={{ borderBottom: '1px solid var(--clr-text)', paddingBottom: '2px' }}><i>(x+h)² - x²</i></div><div style={{ paddingTop: '2px' }}><i>h</i></div></span></span>,
      action: "Expand (x+h)²"
    },
    {
      instruction: <span>Next, we expand the binomial (<i>a+b</i>)² = <i>a² + 2ab + b²</i>:</span>,
      formula: <span><i>f'(x)</i> = lim<sub><i>h</i>&rarr;0</sub> <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}><div style={{ borderBottom: '1px solid var(--clr-text)', paddingBottom: '2px' }}><i>(x² + 2xh + h²) - x²</i></div><div style={{ paddingTop: '2px' }}><i>h</i></div></span></span>,
      action: "Cancel the x² terms"
    },
    {
      instruction: <span>Notice that <i>x²</i> and <i>-x²</i> cancel each other out perfectly!</span>,
      formula: <span><i>f'(x)</i> = lim<sub><i>h</i>&rarr;0</sub> <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}><div style={{ borderBottom: '1px solid var(--clr-text)', paddingBottom: '2px' }}><i>2xh + h²</i></div><div style={{ paddingTop: '2px' }}><i>h</i></div></span></span>,
      action: "Factor out an 'h'"
    },
    {
      instruction: <span>Both terms in the numerator have an <i>h</i>. Let's factor it out so we can divide!</span>,
      formula: <span><i>f'(x)</i> = lim<sub><i>h</i>&rarr;0</sub> <span style={{ display: 'inline-block', verticalAlign: 'middle', textAlign: 'center' }}><div style={{ borderBottom: '1px solid var(--clr-text)', paddingBottom: '2px' }}><i>h(2x + h)</i></div><div style={{ paddingTop: '2px' }}><i>h</i></div></span></span>,
      action: "Cancel the 'h' on top and bottom"
    },
    {
      instruction: <span>The <i>h</i> on top cancels the <i>h</i> on the bottom. We just got rid of the division by zero problem!</span>,
      formula: <span><i>f'(x)</i> = lim<sub><i>h</i>&rarr;0</sub> (2<i>x</i> + <i>h</i>)</span>,
      action: "Apply the Limit (let h = 0)"
    },
    {
      instruction: <span>Finally, we apply the limit. As <i>h</i> shrinks to exactly 0, the <i>+ h</i> simply disappears!</span>,
      formula: <span><i>f'(x)</i> = 2<i>x</i></span>,
      action: "Finish"
    }
  ];

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 3: The First Principle
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        In math, we don't just guess patterns. We <strong>prove</strong> them using Limits!
      </p>

      <div style={{ background: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div style={{ textAlign: 'center', minHeight: '80px' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--clr-text-soft)' }}>
            {steps[step].instruction}
          </p>
        </div>

        <div style={{ 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          color: 'var(--clr-blue)',
          background: 'var(--clr-bg)',
          padding: '1.5rem 3rem',
          borderRadius: '12px',
          border: '2px solid var(--clr-border)',
          margin: '2rem 0',
          transition: 'all 0.3s ease'
        }}>
          {steps[step].formula}
        </div>

        <div>
          {step < steps.length - 1 ? (
            <button 
              className="primary-btn" 
              onClick={() => setStep(step + 1)}
            >
              {steps[step].action}
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)', marginBottom: '1rem' }}>
                <strong>Proof Complete!</strong>
                <br/><br/>
                You just proved mathematically that the derivative of <i>x²</i> is always <i>2x</i>! You don't have to do this limit every time though—we can use shortcuts.
              </div>
              <button 
                className="primary-btn pulse"
                onClick={() => onComplete({ stage1cFirstPrinciple: { success: true } })}
              >
                Continue to the Shortcuts (Power Rule) &rarr;
              </button>
            </div>
          )}
        </div>

      </div>
      
      {/* Progress indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
        {steps.map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: i <= step ? 'var(--clr-accent)' : 'var(--clr-border)',
              transition: 'background 0.3s'
            }} 
          />
        ))}
      </div>
    </div>
  );
}

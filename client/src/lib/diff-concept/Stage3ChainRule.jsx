import React, { useState } from 'react';

export default function Stage3ChainRule({ onComplete }) {
  const [inner, setInner] = useState('');
  const [outer, setOuter] = useState('');
  
  const innerCorrect = inner.replace(/\s/g, '').toLowerCase() === 'x^2';
  const outerCorrect = outer.replace(/\s/g, '').toLowerCase() === 'sin(u)' || outer.replace(/\s/g, '').toLowerCase() === 'sinu';

  const isComplete = innerCorrect && outerCorrect;

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 5: The Chain Rule Factory
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        The Power Rule is great for simple polynomials, but what if a function is trapped <i>inside</i> another function, like <i>f(x)</i> = sin(<i>x</i><sup>2</sup>)? The rate of change cascades from the outside in! This is called the <strong>Chain Rule</strong>. Let's break down the composite function: <strong style={{ fontSize: '1.2em' }}><i>f(x)</i> = sin(<i>x</i><sup>2</sup>)</strong>
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <div style={{ background: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px', flex: '1 1 300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Deconstruct the Function</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              1. What is the "inner" function <i>u</i> = <i>g(x)</i>?
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['sin(x)', 'x', 'x^2'].map(opt => (
                <button
                  key={opt}
                  onClick={() => !innerCorrect && setInner(opt)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: inner === opt ? (innerCorrect ? 'rgba(0,255,128,0.2)' : 'var(--clr-surface-alt)') : 'transparent',
                    color: inner === opt && innerCorrect ? 'var(--clr-green)' : 'var(--clr-text)',
                    border: `1px solid ${inner === opt && innerCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                    borderRadius: '8px',
                    cursor: innerCorrect ? 'default' : 'pointer'
                  }}
                >
                  {opt === 'x^2' ? <span><i>x</i><sup>2</sup></span> : <i>{opt}</i>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              2. What is the "outer" function <i>f(u)</i>?
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['u^2', 'sin(u)', 'cos(u)'].map(opt => (
                <button
                  key={opt}
                  onClick={() => !outerCorrect && setOuter(opt)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: outer === opt ? (outerCorrect ? 'rgba(0,255,128,0.2)' : 'var(--clr-surface-alt)') : 'transparent',
                    color: outer === opt && outerCorrect ? 'var(--clr-green)' : 'var(--clr-text)',
                    border: `1px solid ${outer === opt && outerCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                    borderRadius: '8px',
                    cursor: outerCorrect ? 'default' : 'pointer'
                  }}
                >
                  {opt === 'u^2' ? <span><i>u</i><sup>2</sup></span> : <i>{opt}</i>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          {isComplete ? (
            <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Perfect! Now let's see how the answer comes together:</strong>
              <br/><br/>
              The Chain Rule formula is: <strong><i>f'(x) = outer' &middot; inner'</i></strong>
              <br/><br/>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                <li>1. The derivative of the outer function sin(<i>u</i>) is <strong>cos(<i>u</i>)</strong>.</li>
                <li>2. The derivative of the inner function <i>x</i><sup>2</sup> is <strong>2<i>x</i></strong>.</li>
                <li>3. Multiply them: cos(<i>u</i>) &middot; 2<i>x</i></li>
                <li>4. Finally, plug the inner function (<i>x</i><sup>2</sup>) back into <i>u</i>.</li>
              </ul>
              <i>f'(x)</i> = <strong>cos(<i>x</i><sup>2</sup>) &middot; 2<i>x</i></strong>
            </div>
          ) : (
            <div style={{ padding: '1rem', color: 'var(--clr-text-soft)' }}>
              Identify both parts to see the derivative!
            </div>
          )}
          
          <button 
            className="primary-btn pulse" 
            disabled={!isComplete}
            onClick={() => onComplete({ stage3ChainRule: { innerOuterIdentified: true, completedFactory: true } })}
          >
            Continue to Product Rule →
          </button>
        </div>

      </div>
    </div>
  );
}

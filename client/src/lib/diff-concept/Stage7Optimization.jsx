import React, { useState } from 'react';

export default function Stage7Optimization({ onComplete }) {
  const [nature, setNature] = useState('');
  const [yVal, setYVal] = useState('');
  
  const isNatureCorrect = nature === 'minimum';
  const isYCorrect = yVal.trim() === '-1';
  const isComplete = isNatureCorrect && isYCorrect;

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 9: Optimization (Min & Max)
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        You found that the curve <i>f(x)</i> = <i>x</i><sup>2</sup> &minus; 4<i>x</i> + 3 has a turning point at <i>x</i> = 2. But is this point the highest peak (maximum) or the lowest valley (minimum)? And what is its actual value?
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>1. Determine the Nature:</strong>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                Look at the leading term <i>x</i><sup>2</sup>. Since the coefficient is positive (+1), the parabola smiles like a 'U'. Therefore, the turning point must be a:
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {['maximum', 'minimum'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => !isNatureCorrect && setNature(opt)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: nature === opt ? (isNatureCorrect ? 'rgba(0,255,128,0.2)' : 'var(--clr-surface-alt)') : 'transparent',
                      color: nature === opt && isNatureCorrect ? 'var(--clr-green)' : 'var(--clr-text)',
                      border: `1px solid ${nature === opt && isNatureCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                      borderRadius: '8px',
                      cursor: isNatureCorrect ? 'default' : 'pointer'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem', opacity: isNatureCorrect ? 1 : 0.4, transition: 'opacity 0.3s' }}>
              <strong>2. Find the Value:</strong>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                To find the actual minimum value, plug <i>x</i> = 2 back into the original function <i>f(x)</i>!
              </p>
              <div><i>f(2)</i> = (2)<sup>2</sup> &minus; 4(2) + 3</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <i>f(2)</i> = 
                <input
                  type="number"
                  value={yVal}
                  onChange={(e) => setYVal(e.target.value)}
                  placeholder="?"
                  style={{
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    width: '80px',
                    background: 'var(--clr-bg)',
                    color: 'var(--clr-text)',
                    border: `2px solid ${isYCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  disabled={!isNatureCorrect || isYCorrect}
                />
              </div>
            </div>
          </div>

          {isComplete && (
            <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Outstanding!</strong>
              <br/><br/>
              You just used calculus to prove that the absolute lowest value this function can ever reach is <strong>-1</strong>. This technique is used everywhere in the real world to minimize costs and maximize profits!
            </div>
          )}

          {isComplete && (
            <button 
              className="primary-btn pulse"
              onClick={() => onComplete({ stage7Optimization: { success: true } })}
              style={{ marginTop: '1rem' }}
            >
              Complete Concept Playground &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

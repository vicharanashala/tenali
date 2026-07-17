import React, { useState } from 'react';

export default function Stage2PowerRule({ onComplete }) {
  const [coeff, setCoeff] = useState('');
  const [exp, setExp] = useState('');
  const isCorrect = coeff.trim() === '5' && exp.trim() === '4';

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 4: Discovering the Power Rule
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        In Stage 1, you saw that calculating the exact slope of a tangent line using limits is tedious. The formula that gives you the slope at <i>any</i> point <i>x</i> is called the <strong>Derivative</strong>, written as <i>f'(x)</i>. Instead of calculating limits every time, let's find a shortcut! Notice what happens to the power when we find the derivative:
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '300px', fontSize: '1.2rem' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid var(--clr-border)', padding: '1rem' }}>Function <i>f(x)</i></th>
              <th style={{ borderBottom: '2px solid var(--clr-border)', padding: '1rem' }}>Derivative <i>f'(x)</i></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1rem', textAlign: 'center' }}><i>x</i><sup>2</sup></td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>2<i>x</i><sup>1</sup></td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', textAlign: 'center' }}><i>x</i><sup>3</sup></td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>3<i>x</i><sup>2</sup></td>
            </tr>
            <tr>
              <td style={{ padding: '1rem', textAlign: 'center' }}><i>x</i><sup>4</sup></td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>4<i>x</i><sup>3</sup></td>
            </tr>
            <tr style={{ background: 'var(--clr-surface)' }}>
              <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}><i>x</i><sup>5</sup></td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <input
                    type="number"
                    value={coeff}
                    onChange={(e) => setCoeff(e.target.value)}
                    placeholder="?"
                    style={{
                      padding: '0.5rem',
                      fontSize: '1.2rem',
                      width: '60px',
                      background: 'var(--clr-bg)',
                      color: 'var(--clr-text)',
                      textAlign: 'center',
                      border: `2px solid ${coeff.trim() === '5' ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    disabled={isCorrect}
                  />
                  <i style={{ fontSize: '1.2rem' }}>x</i>
                  <sup style={{ display: 'inline-block', transform: 'translateY(-0.5rem)' }}>
                    <input
                      type="number"
                      value={exp}
                      onChange={(e) => setExp(e.target.value)}
                      placeholder="?"
                      style={{
                        padding: '0.3rem',
                        fontSize: '1rem',
                        width: '50px',
                        background: 'var(--clr-bg)',
                        color: 'var(--clr-text)',
                        textAlign: 'center',
                        border: `2px solid ${exp.trim() === '4' ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                      disabled={isCorrect}
                    />
                  </sup>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          {isCorrect && (
            <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Exactly!</strong> You discovered the Power Rule: 
              <br/><br/>
              If <i>f(x)</i> = <i>x</i><sup>n</sup>, then <i>f'(x)</i> = n &middot; <i>x</i><sup>n-1</sup>.
            </div>
          )}
          
          <button 
            className="primary-btn" 
            disabled={!isCorrect}
            onClick={() => onComplete({ stage2PowerRule: { recognizedPattern: true, completedTable: true } })}
          >
            Continue to Chain Rule →
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function Stage4ProductQuotient({ onComplete }) {
  const [u, setU] = useState('');
  const [v, setV] = useState('');
  const [uPrime, setUPrime] = useState('');
  const [vPrime, setVPrime] = useState('');

  const clean = str => str.replace(/\s/g, '').toLowerCase();

  const isUCorrect = clean(u) === 'x^2';
  const isVCorrect = clean(v) === 'sin(x)' || clean(v) === 'sinx';
  const isUPrimeCorrect = clean(uPrime) === '2x';
  const isVPrimeCorrect = clean(vPrime) === 'cos(x)' || clean(vPrime) === 'cosx';

  const isComplete = isUCorrect && isVCorrect && isUPrimeCorrect && isVPrimeCorrect;

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 6: Product Rule
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        What if two different functions are multiplying each other, like <i>x</i><sup>2</sup> sin(<i>x</i>)? Because both parts are changing at the same time, we can't just multiply their derivatives. We have to use the <strong>Product Rule</strong> to capture how their rates of change interact!
        <br/><br/>Let's differentiate: <strong style={{ fontSize: '1.2em' }}><i>f(x)</i> = <i>x</i><sup>2</sup> sin(<i>x</i>)</strong>
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <div style={{ background: 'var(--clr-surface)', padding: '2rem', borderRadius: '12px', flex: '1 1 300px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><i>u</i></label>
              <select 
                value={u} onChange={(e) => !isUCorrect && setU(e.target.value)} 
                className="tenali-input"
                style={{ width: '100%', borderColor: isUCorrect ? 'var(--clr-green)' : '', color: 'var(--clr-text)', background: isUCorrect ? 'rgba(0,255,128,0.1)' : 'var(--clr-surface)', padding: '0.5rem', borderRadius: '4px', pointerEvents: isUCorrect ? 'none' : 'auto' }}
              >
                <option value="" disabled>?</option>
                <option value="sin(x)">sin(x)</option>
                <option value="x^2">x²</option>
                <option value="2x">2x</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><i>v</i></label>
              <select 
                value={v} onChange={(e) => !isVCorrect && setV(e.target.value)} 
                className="tenali-input"
                style={{ width: '100%', borderColor: isVCorrect ? 'var(--clr-green)' : '', color: 'var(--clr-text)', background: isVCorrect ? 'rgba(0,255,128,0.1)' : 'var(--clr-surface)', padding: '0.5rem', borderRadius: '4px', pointerEvents: isVCorrect ? 'none' : 'auto' }}
              >
                <option value="" disabled>?</option>
                <option value="x^2">x²</option>
                <option value="sin(x)">sin(x)</option>
                <option value="cos(x)">cos(x)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><i>u'</i></label>
              <select 
                value={uPrime} onChange={(e) => !isUPrimeCorrect && setUPrime(e.target.value)} 
                className="tenali-input"
                style={{ width: '100%', borderColor: isUPrimeCorrect ? 'var(--clr-green)' : '', color: 'var(--clr-text)', background: isUPrimeCorrect ? 'rgba(0,255,128,0.1)' : 'var(--clr-surface)', padding: '0.5rem', borderRadius: '4px', pointerEvents: isUPrimeCorrect ? 'none' : 'auto' }}
              >
                <option value="" disabled>?</option>
                <option value="2x">2x</option>
                <option value="x">x</option>
                <option value="cos(x)">cos(x)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}><i>v'</i></label>
              <select 
                value={vPrime} onChange={(e) => !isVPrimeCorrect && setVPrime(e.target.value)} 
                className="tenali-input"
                style={{ width: '100%', borderColor: isVPrimeCorrect ? 'var(--clr-green)' : '', color: 'var(--clr-text)', background: isVPrimeCorrect ? 'rgba(0,255,128,0.1)' : 'var(--clr-surface)', padding: '0.5rem', borderRadius: '4px', pointerEvents: isVPrimeCorrect ? 'none' : 'auto' }}
              >
                <option value="" disabled>?</option>
                <option value="-sin(x)">-sin(x)</option>
                <option value="cos(x)">cos(x)</option>
                <option value="x^2">x²</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          {isComplete ? (
            <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Great job! Now let's trace how the answer comes together:</strong>
              <br/><br/>
              The Product Rule formula is: <strong><i>(uv)' = u'v + uv'</i></strong>
              <br/><br/>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                <li>1. <i>u'v</i> &rarr; (2<i>x</i>) &middot; sin(<i>x</i>)</li>
                <li>2. <i>uv'</i> &rarr; (<i>x</i><sup>2</sup>) &middot; cos(<i>x</i>)</li>
                <li>3. Add them together!</li>
              </ul>
              <i>f'(x)</i> = <strong>2<i>x</i> sin(<i>x</i>) + <i>x</i><sup>2</sup> cos(<i>x</i>)</strong>
            </div>
          ) : (
            <div style={{ padding: '1rem', color: 'var(--clr-text-soft)' }}>
              Fill in all four boxes correctly to piece together the final derivative.
            </div>
          )}
          
          <button 
            className="primary-btn pulse" 
            disabled={!isComplete}
            onClick={() => onComplete({ stage4ProductQuotient: { uAndVMapped: true, formulaMatched: true } })}
          >
            Continue to Mixed Solver →
          </button>
        </div>

      </div>
    </div>
  );
}

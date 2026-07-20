import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme, Point } from 'mafs';

export default function Stage4Independent({ onComplete }) {
  const [step, setStep] = useState(1);
  const [userD, setUserD] = useState('');
  const [userR1, setUserR1] = useState('');
  const [userR2, setUserR2] = useState('');
  const [error, setError] = useState('');

  // Equation: x^2 - 4x - 5 = 0
  const a = 1, b = -4, c = -5;
  const eq = (x) => a * x * x + b * x + c;
  
  // D = 16 - 4(1)(-5) = 36
  const trueD = 36;
  const trueR1 = 5;
  const trueR2 = -1;

  const handleCheckD = () => {
    if (Number(userD) === trueD) {
      setError('');
      setStep(2);
    } else {
      setError(`Hint: b² - 4ac = (-4)² - 4(1)(-5). Try again!`);
    }
  };

  const handleCheckR = () => {
    const r1 = Number(userR1);
    const r2 = Number(userR2);
    if ((r1 === trueR1 && r2 === trueR2) || (r1 === trueR2 && r2 === trueR1)) {
      setError('');
      setStep(3);
    } else {
      setError("Not quite. Remember: x = (4 ± 6) / 2");
    }
  };

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 4: Bring it all together</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--clr-text-soft)' }}>
        Let's solve a real problem: <strong>x² - 4x - 5 = 0</strong>. <br/>
        We will use the formula, and watch the graph react to our math.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        
        {/* Visualization Panel */}
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [-6, 6], y: [-10, 10] }}>
            <Coordinates.Cartesian subdivisions={2} />
            
            {/* Step 1 & 2: Show the axis of symmetry / D calculation */}
            {step >= 1 && (
              <Plot.OfX y={(x) => a * x * x + b * x + c} color={Theme.blue} opacity={step === 3 ? 1 : 0.2} />
            )}

            {/* Step 2: Show the distance from axis of symmetry */}
            {step === 2 && (
              <>
                {/* Axis of symmetry x = -b/2a = 2 */}
                <Plot.OfY x={() => 2} color={Theme.orange} style="dashed" />
                <Point x={2} y={0} color={Theme.orange} />
                {/* Root previews */}
                <Point x={2 - Math.sqrt(trueD)/2} y={0} color="rgba(76, 175, 80, 0.4)" />
                <Point x={2 + Math.sqrt(trueD)/2} y={0} color="rgba(76, 175, 80, 0.4)" />
              </>
            )}

            {/* Step 3: Show the final roots highlighted */}
            {step === 3 && (
              <>
                <Point x={trueR1} y={0} color="#4caf50" />
                <Point x={trueR2} y={0} color="#4caf50" />
              </>
            )}
          </Mafs>
        </div>
        
        {/* Interactive Panel */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          
          <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'monospace' }}>
            x = <sup>-b ± √(b² - 4ac)</sup>&frasl;<sub>2a</sub>
          </div>

          {/* Step 1: Discriminant */}
          <div style={{ opacity: step >= 1 ? 1 : 0.3 }}>
            <h4 style={{ marginBottom: '0.5rem' }}>1. Find the Discriminant</h4>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>a = 1, b = -4, c = -5</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>D = </span>
              <input type="number" value={userD} onChange={e => setUserD(e.target.value)} disabled={step > 1} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'var(--clr-background)', color: 'var(--clr-text)' }} />
              {step === 1 && <button className="primary-btn" onClick={handleCheckD}>Check</button>}
            </div>
            {step === 1 && error && <div style={{ color: '#f44336', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
          </div>

          {/* Step 2: Roots */}
          {step >= 2 && (
            <div style={{ opacity: step >= 2 ? 1 : 0.3, borderTop: '1px solid var(--clr-border)', paddingTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>2. Calculate the Roots</h4>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                x = (4 ± √36) / 2 <br/>
                x = (4 ± 6) / 2
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="number" value={userR1} onChange={e => setUserR1(e.target.value)} disabled={step > 2} placeholder="Root 1" style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'var(--clr-background)', color: 'var(--clr-text)' }} />
                <input type="number" value={userR2} onChange={e => setUserR2(e.target.value)} disabled={step > 2} placeholder="Root 2" style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--clr-border)', background: 'var(--clr-background)', color: 'var(--clr-text)' }} />
                {step === 2 && <button className="primary-btn" onClick={handleCheckR}>Verify</button>}
              </div>
              {step === 2 && error && <div style={{ color: '#f44336', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
            </div>
          )}

          {/* Step 3: Success */}
          {step >= 3 && (
            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', borderRadius: '4px' }}>
              <h4 style={{ color: '#4caf50', marginBottom: '0.5rem' }}>Excellent!</h4>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                You successfully combined the geometric intuition with the algebraic formula to find the roots.
              </p>
              <button className="primary-btn" style={{ width: '100%' }} onClick={() => onComplete({})}>Complete Concept Module</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme, Point } from 'mafs';

export default function Stage3Guided({ onComplete }) {
  const [discriminant, setDiscriminant] = useState(16);
  const [prediction, setPrediction] = useState('');

  // We are graphing y = x^2 - D/4
  const eq = (x) => x * x - (discriminant / 4);

  const handleSubmit = () => {
    if (prediction.trim().length < 5) return;
    onComplete({ prediction, discriminant_experiment: true });
  };

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 3: The Discriminant (b² - 4ac)</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--clr-text-soft)' }}>
        Look closely at the Quadratic Formula: <strong>x = (-b ± √(b² - 4ac)) / 2a</strong>. <br/>
        The part inside the square root, <strong>b² - 4ac</strong>, is called the <em>Discriminant</em>. It has a special power: it tells you exactly how many solutions (roots) the equation has, without even fully solving it!
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [-5, 5], y: [-5, 5] }}>
            <Coordinates.Cartesian subdivisions={2} />
            <Plot.OfX y={eq} color={Theme.blue} />
            
            {/* Draw the roots if D >= 0 */}
            {discriminant > 0 && (
              <>
                <Point x={Math.sqrt(discriminant) / 2} y={0} color="#4caf50" />
                <Point x={-Math.sqrt(discriminant) / 2} y={0} color="#4caf50" />
              </>
            )}
            {discriminant === 0 && (
              <Point x={0} y={0} color="#ff9800" />
            )}
          </Mafs>
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Change the Discriminant</h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Drag the slider to change the value of the Discriminant (D). Notice what happens to the square root, and how many times the parabola hits the x-axis.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label><strong>D = {discriminant}</strong></label>
            </div>
            <input type="range" min="-20" max="20" step="1" value={discriminant} onChange={e => setDiscriminant(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--clr-surface)', borderRadius: '4px', textAlign: 'center', fontSize: '1.5rem', fontFamily: 'monospace' }}>
            √<span style={{ color: discriminant < 0 ? '#f44336' : discriminant === 0 ? '#ff9800' : '#4caf50' }}>{discriminant}</span>
          </div>

          <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid var(--clr-border)', marginBottom: '1.5rem' }}>
            {discriminant > 0 && <span style={{ color: '#4caf50' }}><strong>Positive:</strong> The square root is a real number. You get a + and a -, resulting in <strong>2 real roots</strong>.</span>}
            {discriminant === 0 && <span style={{ color: '#ff9800' }}><strong>Zero:</strong> The square root of 0 is 0. ±0 does nothing, resulting in <strong>1 real root</strong>.</span>}
            {discriminant < 0 && <span style={{ color: '#f44336' }}><strong>Negative:</strong> You can't take the square root of a negative number (yet!). Result: <strong>0 real roots</strong>. The parabola never touches the ground.</span>}
          </div>

          <button 
            className="primary-btn" 
            onClick={() => onComplete({ discriminant_experiment: true })}
            style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem', background: 'var(--clr-accent)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
          >
            I see the pattern! Let's Solve 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

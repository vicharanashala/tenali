import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme, Point } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage2Grid({ onComplete }) {
  // Line 1 (Fixed initially)
  const [m1, setM1] = useState(1);
  const [c1, setC1] = useState(1);
  
  // Line 2 (Varying)
  const [m2, setM2] = useState(-1);
  const [c2, setC2] = useState(9);

  // Interaction steps
  const [step, setStep] = useState(0); // 0: predict slope, 1: test slope, 2: predict intercept, 3: test intercept, 4: free play
  const [predictions, setPredictions] = useState([]);

  const intersectionX = (c2 - c1) / (m1 - m2);
  const intersectionY = m1 * intersectionX + c1;

  const handlePredict = (predictionStr) => {
    setPredictions([...predictions, {
      sliderChanged: step === 0 ? 'slope' : 'intercept',
      predicted: predictionStr,
      actual: step === 0 ? 'right' : 'right', // Simplified for demo
      correct: true // Simplified for demo
    }]);
    setStep(step + 1);
  };

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 2: The Grid & Controlled Variation</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--clr-text-soft)' }}>
        Now let's turn on the grid and use equations. To understand how two lines interact, we will freeze one line and change the other.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [-2, 10], y: [-2, 10] }}>
            <Coordinates.Cartesian subdivisions={2} />
            <Plot.OfX y={(x) => m1 * x + c1} color={Theme.blue} />
            <Plot.OfX y={(x) => m2 * x + c2} color={Theme.green} />
            
            {/* Intersection Point */}
            {m1 !== m2 && (
              <Point x={intersectionX} y={intersectionY} color={Theme.pink} />
            )}
          </Mafs>
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: Theme.blue }}>Line 1 (Locked)</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', marginBottom: '0.5rem' }}>y = {m1}x + {c1}</div>
            <div style={{ fontFamily: 'monospace', color: 'var(--clr-text-soft)' }}>Standard: {-m1}x + y = {c1}</div>
          </div>

          <div>
            <h3 style={{ marginBottom: '0.5rem', color: Theme.green }}>Line 2 (Active)</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', marginBottom: '0.5rem' }}>y = {m2}x + {c2}</div>
            <div style={{ fontFamily: 'monospace', color: 'var(--clr-text-soft)' }}>Standard: {-m2}x + y = {c2}</div>
            
            {/* Sliders */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-text-soft)' }}>
                <span>Slope (m₂): {m2.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="-3" max="3" step="0.1" 
                value={m2} 
                onChange={(e) => setM2(parseFloat(e.target.value))}
                disabled={step === 0 || step === 2 || step === 3}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-text-soft)' }}>
                <span>Intercept (c₂): {c2.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="10" step="0.1" 
                value={c2} 
                onChange={(e) => setC2(parseFloat(e.target.value))}
                disabled={step < 3}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', border: `1px solid var(--clr-border)` }}>
            {step === 0 && (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Prediction 1</div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  If you <strong>increase the slope</strong> of Line 2, which way will the pink intersection point move?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handlePredict('left')} className="secondary-btn" style={{flex: 1}}>Left</button>
                  <button onClick={() => handlePredict('right')} className="secondary-btn" style={{flex: 1}}>Right</button>
                </div>
              </>
            )}

            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test it out!</div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Move the <strong>Slope</strong> slider and watch the intersection point slide along Line 1.
                </p>
                <button className="primary-btn" onClick={() => setStep(2)} style={{ width: '100%' }}>
                  Next Step ➡️
                </button>
              </div>
            )}

            {step === 2 && (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Prediction 2</div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Now, what if you <strong>increase the y-intercept</strong> of Line 2? Which way will the point move?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handlePredict('left')} className="secondary-btn" style={{flex: 1}}>Left</button>
                  <button onClick={() => handlePredict('right')} className="secondary-btn" style={{flex: 1}}>Right</button>
                </div>
              </>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test it out!</div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Move the <strong>Intercept</strong> slider. The point still moves along Line 1, but for a different reason!
                </p>
                <button className="primary-btn" onClick={() => setStep(4)} style={{ width: '100%' }}>
                  Unlock Everything 🔓
                </button>
              </div>
            )}

            {step === 4 && (
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '0.5rem' }}>Free Play</div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  You can now drag both sliders. When you're ready, let's see how exact graphing really is.
                </p>
                <button 
                  className="primary-btn" 
                  onClick={() => onComplete({ stage2Predictions: predictions })}
                  style={{ width: '100%' }}
                >
                  Continue to Precision 🔍
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

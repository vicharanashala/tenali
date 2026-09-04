import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage4Elimination({ onComplete }) {
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (step < 6) {
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep === 6 && !completed) {
        setCompleted(true);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handlePredict = (answer) => {
    setPrediction(answer);
    setStep(2); // move to the multiply step
  };

  // Equations:
  // Eq1: 2x + y = 5   => y = -2x + 5
  // Eq2: 3x - 2y = 4  => y = 1.5x - 2
  const eq1 = (x) => -2 * x + 5;
  const eq2 = (x) => 1.5 * x - 2;
  // Multiplied Eq1: 4x + 2y = 10 => y = -2x + 5 (same line)

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 4: The Elimination Method</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--clr-text-soft)' }}>
        Let's use algebra to find the exact intersection without guessing.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        
        {/* Graph Panel to show lines don't move */}
        <div style={{ flex: '1 1 300px', height: '350px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [-1, 5], y: [-3, 6] }}>
            <Coordinates.Cartesian subdivisions={2} />
            
            <Plot.OfX y={eq1} color={Theme.blue} weight={step >= 2 ? 6 : 3} opacity={step >= 2 ? 0.7 : 1} />
            <Plot.OfX y={eq2} color={Theme.green} />
            
            {/* Show the multiplied line directly on top to prove it's the same */}
            {step >= 2 && (
              <Plot.OfX y={eq1} color={Theme.yellow} style="dashed" />
            )}
          </Mafs>
        </div>

        {/* Stepper Panel */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Step 0: Write equations */}
          <div style={{ padding: '1rem', background: 'var(--clr-surface-alt)', borderRadius: '8px', borderLeft: step >= 0 ? `4px solid ${Theme.blue}` : '4px solid transparent', opacity: step >= 0 ? 1 : 0.4 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>1. The System</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.blue }}>Eq1: 2x + y = 5</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.green }}>Eq2: 3x - 2y = 4</div>
          </div>

          {/* Step 1: Predict */}
          {step === 1 && (
            <div style={{ padding: '1rem', background: 'var(--clr-surface-alt)', borderRadius: '8px', borderLeft: `4px solid ${Theme.pink}`, animation: 'fadeIn 0.5s' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Prediction</div>
              <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem' }}>
                If we multiply the entire Eq1 by 2 (to get 4x + 2y = 10), will it change the line on the graph?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handlePredict('yes')} className="secondary-btn" style={{flex: 1}}>Yes, it moves</button>
                <button onClick={() => handlePredict('no')} className="secondary-btn" style={{flex: 1}}>No, it's the same line</button>
              </div>
            </div>
          )}

          {/* Step 2: Multiply */}
          {step >= 2 && (
            <div style={{ padding: '1rem', background: 'var(--clr-surface-alt)', borderRadius: '8px', borderLeft: step >= 2 ? `4px solid ${Theme.yellow}` : '4px solid transparent', animation: 'fadeIn 0.5s' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>2. Match Coefficients</div>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Multiply Eq1 by 2 to match the y-coefficients. <br/>
                <em>(Notice on the graph: the yellow dashed line is exactly on top of the blue line. Multiplying doesn't move the line!)</em>
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.yellow }}>Eq1×2: 4x + 2y = 10</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.green }}>Eq2: 3x - 2y = 4</div>
            </div>
          )}

          {/* Step 3: Add/Subtract */}
          {step >= 3 && (
            <div style={{ padding: '1rem', background: 'var(--clr-surface-alt)', borderRadius: '8px', borderLeft: `4px solid ${Theme.pink}`, animation: 'fadeIn 0.5s' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>3. Add the Equations</div>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Add the two equations together. The +2y and -2y eliminate each other!
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>(4x + 3x) + (2y - 2y) = 10 + 4</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.pink }}>7x = 14</div>
            </div>
          )}

          {/* Step 4: Solve one variable */}
          {step >= 4 && (
            <div style={{ padding: '1rem', background: 'var(--clr-surface-alt)', borderRadius: '8px', borderLeft: `4px solid ${Theme.pink}`, animation: 'fadeIn 0.5s' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>4. Solve for x</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.pink }}>x = 2</div>
            </div>
          )}

          {/* Step 5: Back-substitute */}
          {step >= 5 && (
            <div style={{ padding: '1rem', background: 'var(--clr-surface-alt)', borderRadius: '8px', borderLeft: `4px solid ${Theme.blue}`, animation: 'fadeIn 0.5s' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>5. Back-substitute</div>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Plug x = 2 back into the original Eq1 to find y.
              </p>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>2(2) + y = 5</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>4 + y = 5</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: Theme.blue }}>y = 1</div>
            </div>
          )}

          {/* Step 6: Completion */}
          {step >= 6 && (
            <div style={{ padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', borderLeft: `4px solid #4caf50`, animation: 'fadeIn 0.5s' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#4caf50' }}>Exact Intersection Found!</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>(2, 1)</div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="secondary-btn" onClick={handleBack} disabled={step === 0 || step === 1}>
              ← Step Back
            </button>
            
            {step !== 1 && step < 6 && (
              <button className="primary-btn" onClick={handleNext} style={{ flex: 1 }}>
                Next Step →
              </button>
            )}

            {step === 6 && (
              <button 
                className="primary-btn" 
                onClick={() => onComplete({ stage4StepperCompleted: completed })} 
                style={{ flex: 1 }}
              >
                Continue to Final Stage 🚀
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

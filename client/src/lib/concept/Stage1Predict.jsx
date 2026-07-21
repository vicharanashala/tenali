import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Theme, useMovablePoint } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage1Predict({ onComplete }) {
  const [prediction, setPrediction] = useState('');
  const [hasGivenUp, setHasGivenUp] = useState(false);

  // Cannonball equation: y = -x^2 + 2x + 8
  // Roots are x = -2, x = 4
  const a = -1, b = 2, c = 8;
  const eq = (x) => a * x * x + b * x + c;

  const landingPoint = useMovablePoint([2, 0], {
    constrain: "horizontal"
  });

  const isCorrect = Math.abs(landingPoint.x - 4) < 0.2;
  const showSuccess = isCorrect || hasGivenUp;

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 1: The Real World</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--clr-text-soft)' }}>
        Why do we care about the <strong>Quadratic Formula</strong>? Because the real world is full of curves! 
        When you throw a ball or fire a cannon, it follows a parabolic path described by a quadratic equation.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [-1, 6], y: [-2, 10] }}>
            <Coordinates.Cartesian subdivisions={2} />
            <Plot.OfX y={eq} color={Theme.blue} />
            
            {/* The cliff */}
            <Plot.OfX y={(x) => x <= 0 ? 8 : 0} color={Theme.green} style="dashed" opacity={0.5} />
            
            {/* The landing point they are guessing */}
            {landingPoint.element}
          </Mafs>
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>The Mission</h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem' }}>
              A cannon is fired from a cliff 8 meters high. Its path is modeled by the equation:
            </p>
            <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'monospace', margin: '1rem 0' }}>
              y = -x² + 2x + 8
            </div>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem' }}>
              <strong>Drag the interactive point</strong> on the graph to where you think the cannonball will hit the ground (where y = 0).
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', border: `1px solid ${showSuccess ? '#4caf50' : 'var(--clr-border)'}`, transition: 'all 0.3s ease' }}>
            Your guess for the landing spot:<br/>
            <strong>x = {hasGivenUp ? '4.0' : landingPoint.x.toFixed(1)}</strong>
            
            {!showSuccess && (
              <button 
                onClick={() => setHasGivenUp(true)}
                style={{ marginTop: '1rem', padding: '0.5rem', background: 'transparent', color: 'var(--clr-text-soft)', border: '1px dashed var(--clr-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}
              >
                I'm stuck, show me the answer!
              </button>
            )}

            {showSuccess && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '4px', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {hasGivenUp ? "Here's the landing spot!" : "BOOM! 💥 Direct Hit!"}
                </div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  The cannonball hits the ground at exactly <strong>x = 4</strong>. In math, this landing spot is called a <strong>Root</strong> of the equation.
                </p>
                <button 
                  className="primary-btn" 
                  onClick={() => onComplete({ guess: hasGivenUp ? 4 : landingPoint.x })}
                  style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                  Discover the Secret Formula 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

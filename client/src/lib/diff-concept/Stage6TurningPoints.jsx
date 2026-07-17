import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Point } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage6TurningPoints({ onComplete }) {
  const [xVal, setXVal] = useState('');
  const isCorrect = xVal.trim() === '2';

  // f(x) = x^2 - 4x + 3
  const f = (x) => x * x - 4 * x + 3;
  // f'(x) = 2x - 4
  const fPrime = (x) => 2 * x - 4;

  const currentX = isCorrect ? 2 : (parseFloat(xVal) || -1);
  const currentY = f(currentX);
  const currentSlope = fPrime(currentX);

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 8: Turning Points
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem', lineHeight: '1.6' }}>
        Now that you can calculate <i>f'(x)</i>, what can we actually use it for? The most powerful application of the derivative is finding the peaks and valleys (turning points) of a curve.
        <br/><br/>
        At a turning point, the curve flattens out completely before changing direction. What is the slope of a flat, horizontal tangent line? It's exactly <strong>0</strong>!
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Mafs viewBox={{ x: [-2, 5], y: [-2, 5] }} height={300} pan={false} zoom={false}>
            <Coordinates.Cartesian />
            <Plot.OfX y={f} color="var(--clr-blue)" />
            {(!isNaN(currentX) && currentX >= -2 && currentX <= 5) && (
              <>
                <Point x={currentX} y={currentY} color="var(--clr-green)" />
                <Plot.OfX 
                  y={(x) => currentSlope * (x - currentX) + currentY} 
                  color="var(--clr-green)" 
                  style="dashed" 
                />
              </>
            )}
          </Mafs>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>1. Take the function:</strong>
              <div><i>f(x)</i> = <i>x</i><sup>2</sup> &minus; 4<i>x</i> + 3</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>2. Find the derivative:</strong>
              <div><i>f'(x)</i> = 2<i>x</i> &minus; 4</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>3. Set the slope to zero and solve for <i>x</i>:</strong>
              <div>0 = 2<i>x</i> &minus; 4</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <i>x</i> = 
              <input
                type="number"
                value={xVal}
                onChange={(e) => setXVal(e.target.value)}
                placeholder="?"
                style={{
                  padding: '0.5rem',
                  fontSize: '1.2rem',
                  width: '80px',
                  background: 'var(--clr-bg)',
                  color: 'var(--clr-text)',
                  border: `2px solid ${isCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                  borderRadius: '8px',
                  outline: 'none'
                }}
                disabled={isCorrect}
              />
            </div>
          </div>

          {isCorrect && (
            <div style={{ background: 'rgba(0, 255, 128, 0.1)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Fantastic!</strong>
              <br/><br/>
              By setting the derivative to zero, you proved that the curve turns exactly at <strong><i>x</i> = 2</strong>. Notice how the tangent line on the graph is perfectly horizontal!
            </div>
          )}

          {isCorrect && (
            <button 
              className="primary-btn pulse"
              onClick={() => onComplete({ stage6TurningPoints: { success: true } })}
              style={{ marginTop: '1rem' }}
            >
              Continue to Optimization &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

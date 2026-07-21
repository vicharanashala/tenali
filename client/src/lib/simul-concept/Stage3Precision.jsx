import React from 'react';
import { Mafs, Coordinates, Plot, Theme, Point, Line } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage3Precision({ initialGuess, onComplete }) {
  // Lines from Stage 1
  const point1L1 = [1, 2];
  const point2L1 = [9, 8];
  
  const point1L2 = [2, 9];
  const point2L2 = [8, 1];

  // The exact algebraic intersection is exactly (5, 5)
  const exactX = 5;
  const exactY = 5;

  const guessX = initialGuess.x || 0;
  const guessY = initialGuess.y || 0;

  // Calculate the distance (Precision Gap)
  const dx = exactX - guessX;
  const dy = exactY - guessY;
  const gap = Math.sqrt(dx * dx + dy * dy);
  const isPerfect = gap < 0.1;

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 3: The Precision Gap</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--clr-text-soft)' }}>
        Let's look at your original guess from Stage 1 compared to the exact mathematical intersection.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [-1, 10], y: [-1, 10] }}>
            <Coordinates.Cartesian subdivisions={2} />
            
            <Line.Segment point1={point1L1} point2={point2L1} color={Theme.blue} opacity={0.5} />
            <Line.Segment point1={point1L2} point2={point2L2} color={Theme.green} opacity={0.5} />
            
            {/* The exact point */}
            <Point x={exactX} y={exactY} color={Theme.yellow} />
            
            {/* The guess point */}
            <Point x={guessX} y={guessY} color={Theme.pink} />
            
            {/* The gap */}
            <Line.Segment point1={[exactX, exactY]} point2={[guessX, guessY]} color={Theme.red} style="dashed" />
          </Mafs>
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Visual vs. Exact</h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Your eyes are great for estimation, but algebra gives you perfection.
            </p>
            
            <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', marginBottom: '1rem', borderLeft: `4px solid ${Theme.pink}` }}>
              <strong>Your Visual Guess:</strong><br/>
              ( {guessX.toFixed(2)}, {guessY.toFixed(2)} )
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', marginBottom: '1rem', borderLeft: `4px solid ${Theme.yellow}` }}>
              <strong>Exact Algebra:</strong><br/>
              ( {exactX.toFixed(2)}, {exactY.toFixed(2)} )
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', border: `1px solid var(--clr-border)` }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: isPerfect ? '#4caf50' : 'var(--clr-text)' }}>
              The Gap: {gap.toFixed(3)} units
            </div>
            
            {isPerfect ? (
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                Wow, you hit it exactly on the pixel! But what if the lines intersected at x = 5.1432? You'd never guess it by eye.
              </p>
            ) : (
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                You were close, but not perfectly exact. Reading a graph precisely by eye is genuinely error-prone!
              </p>
            )}
            
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              This is why mathematicians invented <strong>Algebraic Methods</strong> (like Substitution and Elimination) — to get an exact answer where a graph can only offer an approximate one.
            </p>

            <button 
              className="primary-btn" 
              onClick={() => onComplete({ stage3PrecisionGap: gap })}
              style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
            >
              Learn Elimination 🛠️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

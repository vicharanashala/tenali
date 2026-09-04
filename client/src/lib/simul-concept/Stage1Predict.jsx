import React, { useState } from 'react';
import { Mafs, Line, Theme, useMovablePoint } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';

export default function Stage1Predict({ onComplete }) {
  const [hasGuessed, setHasGuessed] = useState(false);

  // Two intersecting lines, arbitrarily chosen
  // L1: passes through (1, 2) and (9, 8)
  // L2: passes through (2, 9) and (8, 1)
  // Intersection is around (5, 5)
  const point1L1 = [1, 2];
  const point2L1 = [9, 8];
  
  const point1L2 = [2, 9];
  const point2L2 = [8, 1];

  const guessPoint = useMovablePoint([5, 5], {
    color: Theme.pink
  });

  return (
    <div className="stage-container">
      <h2 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>Stage 1: Estimation</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--clr-text-soft)' }}>
        Before we dive into the math, let's trust your eyes. Two lines cross each other somewhere in space.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-alt)' }}>
          <Mafs viewBox={{ x: [0, 10], y: [0, 10] }} pan={false} zoom={false}>
            {/* Notice: No Coordinates.Cartesian! No grid, no numbers. */}
            
            <Line.Segment point1={point1L1} point2={point2L1} color={Theme.blue} />
            <Line.Segment point1={point1L2} point2={point2L2} color={Theme.green} />
            
            {/* The guess point */}
            {guessPoint.element}
          </Mafs>
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--clr-surface-alt)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>The Mission</h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem' }}>
              <strong>Drag the pink point</strong> to roughly where you think these two lines cross.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--clr-surface)', borderRadius: '4px', border: `1px solid ${hasGuessed ? '#4caf50' : 'var(--clr-border)'}`, transition: 'all 0.3s ease' }}>
            {!hasGuessed ? (
              <>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Take your best guess based purely on spatial judgment.
                </p>
                <button 
                  className="primary-btn" 
                  onClick={() => setHasGuessed(true)}
                  style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                  Lock in my guess 🔒
                </button>
              </>
            ) : (
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Guess Locked!
                </div>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Your spatial judgment is locked in. Let's see how close you got when we reveal the grid.
                </p>
                <button 
                  className="primary-btn" 
                  onClick={() => onComplete({ stage1Guess: { x: guessPoint.x, y: guessPoint.y } })}
                  style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                  Turn on the Grid 💡
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

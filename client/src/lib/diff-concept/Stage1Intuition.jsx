import React, { useState } from 'react';

export default function Stage1Intuition({ onComplete, isSpacedReplay }) {
  const [h, setH] = useState(2);

  const f = (x) => 0.5 * x * x;
  const x1 = 1;
  const y1 = f(x1);
  const x2 = x1 + h;
  const y2 = f(x2);
  
  const m = h === 0 ? x1 : (y2 - y1) / h;
  const isTangent = h === 0;

  // SVG coordinate mapping
  // Map x from [-1, 4] to [0, 400]
  // Map y from [-1, 5] to [300, 0] (y is inverted in SVG)
  const mapX = (x) => ((x + 1) / 5) * 400;
  const mapY = (y) => 300 - ((y + 1) / 6) * 300;

  // Generate parabola path
  let pathData = `M ${mapX(-1)} ${mapY(f(-1))}`;
  for (let x = -0.9; x <= 4; x += 0.1) {
    pathData += ` L ${mapX(x)} ${mapY(f(x))}`;
  }

  // Generate line endpoints
  const lineStartY = m * (-1 - x1) + y1;
  const lineEndY = m * (4 - x1) + y1;

  return (
    <div className="welcome-box">
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '1rem' }}>
        Stage 1: Intuition (Rate of Change)
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1rem' }}>
        The derivative tells us how fast a function is changing at an exact instant. 
        Slide <span style={{ fontFamily: 'monospace' }}>h</span> to 0 to see the secant line (average change) become the tangent line (instantaneous change).
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
          
          <svg viewBox="0 0 400 300" style={{ width: '100%', height: 'auto', background: 'var(--clr-surface-alt)', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(y => (
              <line key={`hy${y}`} x1="0" y1={mapY(y)} x2="400" y2={mapY(y)} stroke="var(--clr-border)" strokeWidth="1" />
            ))}
            {[0, 1, 2, 3].map(x => (
              <line key={`vx${x}`} x1={mapX(x)} y1="0" x2={mapX(x)} y2="300" stroke="var(--clr-border)" strokeWidth="1" />
            ))}
            
            {/* Axes */}
            <line x1={mapX(-1)} y1={mapY(0)} x2={mapX(4)} y2={mapY(0)} stroke="var(--clr-text-soft)" strokeWidth="2" />
            <line x1={mapX(0)} y1={mapY(-1)} x2={mapX(0)} y2={mapY(5)} stroke="var(--clr-text-soft)" strokeWidth="2" />

            {/* Parabola */}
            <path d={pathData} fill="none" stroke="var(--clr-blue)" strokeWidth="3" />

            {/* Secant / Tangent Line */}
            <line 
              x1={mapX(-1)} y1={mapY(lineStartY)} 
              x2={mapX(4)} y2={mapY(lineEndY)} 
              stroke={isTangent ? 'var(--clr-green)' : 'var(--clr-orange)'} 
              strokeWidth="2" 
              strokeDasharray={isTangent ? "0" : "5,5"} 
            />

            {/* Points */}
            <circle cx={mapX(x1)} cy={mapY(y1)} r="5" fill="var(--clr-blue)" />
            {h !== 0 && <circle cx={mapX(x2)} cy={mapY(y2)} r="5" fill="var(--clr-orange)" />}
          </svg>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Distance (h): {h.toFixed(2)}</span>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.05" 
                value={h} 
                onChange={(e) => setH(parseFloat(e.target.value))} 
                style={{ flex: 1 }}
              />
            </label>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ 
            background: 'var(--clr-surface)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: `2px solid ${isTangent ? 'var(--clr-green)' : 'var(--clr-border)'}`,
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>{isTangent ? "Tangent Slope (Instantaneous)" : "Secant Slope (Average)"}</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Slope = {m.toFixed(2)}
            </div>
          </div>
          
          {isTangent && (
            <button 
              className="primary-btn pulse" 
              onClick={() => onComplete({ stage1Intuition: true })}
            >
              Continue to Power Rule →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

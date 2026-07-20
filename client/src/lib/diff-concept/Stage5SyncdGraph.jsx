import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stage5SyncdGraph({ onComplete }) {
  const [x, setX] = useState(0);
  
  // Math for Top Graph: f(x) = x^2
  const f = (val) => val * val;
  // Math for Bottom Graph: f'(x) = 2x
  const df = (val) => 2 * val;

  const xMin = -2.5, xMax = 2.5;
  
  // Top SVG bounds
  const yTopMin = -1, yTopMax = 6;
  const mapTopX = (val) => ((val - xMin) / (xMax - xMin)) * 800;
  const mapTopY = (val) => 250 - ((val - yTopMin) / (yTopMax - yTopMin)) * 250;

  // Bottom SVG bounds
  const yBotMin = -6, yBotMax = 6;
  const mapBotX = (val) => ((val - xMin) / (xMax - xMin)) * 800;
  const mapBotY = (val) => 250 - ((val - yBotMin) / (yBotMax - yBotMin)) * 250;

  // Generate top path
  let topPath = `M ${mapTopX(xMin)} ${mapTopY(f(xMin))}`;
  const step = (xMax - xMin) / 100;
  for (let val = xMin; val <= xMax; val += step) {
    topPath += ` L ${mapTopX(val)} ${mapTopY(f(val))}`;
  }

  // Generate bottom path (only drawn up to current X to show discovery)
  let botPath = `M ${mapBotX(xMin)} ${mapBotY(df(xMin))}`;
  for (let val = xMin; val <= xMax; val += step) {
    if (val <= x) {
      botPath += ` L ${mapBotX(val)} ${mapBotY(df(val))}`;
    }
  }
  // Full faint bottom path for context
  let fullBotPath = `M ${mapBotX(xMin)} ${mapBotY(df(xMin))}`;
  for (let val = xMin; val <= xMax; val += step) {
    fullBotPath += ` L ${mapBotX(val)} ${mapBotY(df(val))}`;
  }

  // Current positions
  const curTopX = mapTopX(x);
  const curTopY = mapTopY(f(x));
  const curBotX = mapBotX(x);
  const curBotY = mapBotY(df(x));

  // Tangent line on top graph
  const slope = df(x);
  const tanY1 = slope * (xMin - x) + f(x);
  const tanY2 = slope * (xMax - x) + f(x);

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Stage 5: The "Aha!" Moment
          </h2>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '750px' }}>
            What if we plotted the slope itself on a brand new graph? 
            <strong> Drag the slider</strong>. Watch how the steepness of the top curve magically draws a straight line on the bottom graph!
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginTop: '1.5rem',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Top Graph: Original Function */}
        <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, color: 'var(--clr-blue)', fontWeight: 'bold' }}>Original Curve: f(x) = x²</div>
          <svg viewBox="0 0 800 250" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <line x1="0" y1={mapTopY(0)} x2="800" y2={mapTopY(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            <line x1={mapTopX(0)} y1="0" x2={mapTopX(0)} y2="250" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            
            <path d={topPath} fill="none" stroke="var(--clr-blue)" strokeWidth="4" />
            
            {/* Tangent Line */}
            <line 
              x1={mapTopX(xMin)} y1={mapTopY(tanY1)} 
              x2={mapTopX(xMax)} y2={mapTopY(tanY2)} 
              stroke="var(--clr-green)" 
              strokeWidth="2" 
            />

            {/* Connecting Laser (going down) */}
            <line x1={curTopX} y1={curTopY} x2={curTopX} y2="250" stroke="var(--clr-accent)" strokeWidth="2" strokeDasharray="4,4" />

            {/* Current Point */}
            <circle cx={curTopX} cy={curTopY} r="6" fill="var(--clr-green)" />
          </svg>
        </div>

        {/* Bottom Graph: Derivative Function */}
        <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, color: 'var(--clr-orange)', fontWeight: 'bold' }}>Derivative (Slope): f'(x)</div>
          <svg viewBox="0 0 800 250" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <line x1="0" y1={mapBotY(0)} x2="800" y2={mapBotY(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            <line x1={mapBotX(0)} y1="0" x2={mapBotX(0)} y2="250" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Faint context path */}
            <path d={fullBotPath} fill="none" stroke="rgba(255,165,0,0.2)" strokeWidth="4" />
            
            {/* Drawn path */}
            <path d={botPath} fill="none" stroke="var(--clr-orange)" strokeWidth="6" strokeLinecap="round" />

            {/* Connecting Laser (coming from top) */}
            <line x1={curBotX} y1="0" x2={curBotX} y2={curBotY} stroke="var(--clr-accent)" strokeWidth="2" strokeDasharray="4,4" />

            {/* Current Point */}
            <circle cx={curBotX} cy={curBotY} r="6" fill="var(--clr-orange)" />
          </svg>

          {/* Drive Slider overlayed at the bottom of the bottom graph */}
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '50px',
            right: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0,0,0,0.6)',
            padding: '12px 20px',
            borderRadius: '100px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '1.2rem', color: '#fff' }}>Slide x:</span>
            <input 
              type="range" 
              min={xMin} 
              max={xMax} 
              step="0.05" 
              value={x}
              onChange={(e) => setX(parseFloat(e.target.value))}
              style={{ flex: 1, cursor: 'pointer', height: '8px' }}
            />
          </div>
        </div>

        {/* Dashboard / Next Button */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '16px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
              At x = <strong style={{ color: 'var(--clr-text)' }}>{x.toFixed(2)}</strong>
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--clr-text-soft)' }}>
              Slope is <strong style={{ color: 'var(--clr-green)' }}>{slope.toFixed(2)}</strong>. 
              Notice how the orange line plots exactly at y = {slope.toFixed(2)}!
            </div>
          </div>
          <button 
            className="primary-btn pulse" 
            onClick={() => onComplete({ stage5SyncdGraph: true })}
            style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
          >
            Mind blown! Next →
          </button>
        </div>

      </div>
    </div>
  );
}

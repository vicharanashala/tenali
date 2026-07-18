import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stage6TurningPoints({ onComplete }) {
  // We'll use t for time (x-axis)
  const [tVal, setTVal] = useState(0); // slider value
  const [typedVal, setTypedVal] = useState('');

  // h(t) = -t^2 + 6t + 2
  const h = (t) => -t * t + 6 * t + 2;
  // h'(t) = -2t + 6
  const dh = (t) => -2 * t + 6;

  // Peak is at t = 3, h(3) = -9 + 18 + 2 = 11
  const exactPeak = 3;
  const isCorrect = typedVal.trim() === '3';

  // For the SVG bounds
  const tMin = 0, tMax = 6.5;
  const hMin = 0, hMax = 12;

  const mapT = (t) => ((t - tMin) / (tMax - tMin)) * 800;
  const mapH = (h_val) => 400 - ((h_val - hMin) / (hMax - hMin)) * 400;

  // Generate curve path
  let path = `M ${mapT(tMin)} ${mapH(h(tMin))}`;
  const step = (tMax - tMin) / 100;
  for (let t = tMin; t <= tMax; t += step) {
    path += ` L ${mapT(t)} ${mapH(h(t))}`;
  }

  // Current ball position
  const curT = parseFloat(tVal) || 0;
  const curH = h(curT);
  const curSlope = dh(curT);

  // Tangent line on the ball
  const tanT1 = curT - 1;
  const tanH1 = curSlope * (tanT1 - curT) + curH;
  const tanT2 = curT + 1;
  const tanH2 = curSlope * (tanT2 - curT) + curH;

  // Determine slope color
  let slopeColor = 'var(--clr-green)';
  if (curSlope < -0.1) slopeColor = 'var(--clr-red)';
  else if (Math.abs(curSlope) <= 0.1) slopeColor = 'var(--clr-yellow)';

  return (
    <div className="welcome-box" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Stage 8: Turning Points (Maximum Height)
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Now that you can calculate derivatives, what can we use them for? 
        The most powerful application is finding the <strong>peaks and valleys</strong> of a curve.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Physical Visualization */}
        <div style={{ flex: '3', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: 'var(--clr-surface)', padding: '1rem', borderRadius: '12px' }}>
            <strong>Scenario:</strong> You throw a ball straight up into the air. Its height over time is given by 
            <span style={{ color: 'var(--clr-blue)', fontWeight: 'bold', marginLeft: '10px' }}>h(t) = -t² + 6t + 2</span>
          </div>

          <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
            <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Axes */}
              <line x1="0" y1={mapH(0)} x2="800" y2={mapH(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={mapT(0)} y1="0" x2={mapT(0)} y2="400" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />

              {/* The Curve */}
              <path d={path} fill="none" stroke="var(--clr-blue)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10, 10" />

              {/* Peak Marker (if found) */}
              {isCorrect && (
                <circle cx={mapT(exactPeak)} cy={mapH(h(exactPeak))} r="12" fill="none" stroke="var(--clr-green)" strokeWidth="4" />
              )}

              {/* Tangent Line */}
              <line 
                x1={mapT(tanT1)} y1={mapH(tanH1)} 
                x2={mapT(tanT2)} y2={mapH(tanH2)} 
                stroke={slopeColor} 
                strokeWidth="4" 
              />

              {/* The Ball */}
              <circle cx={mapT(curT)} cy={mapH(curH)} r="10" fill="var(--clr-accent)" />

              {/* Trajectory projection */}
              <line 
                x1={mapT(curT)} y1={mapH(curH)} 
                x2={mapT(curT)} y2={mapH(0)} 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="2" 
                strokeDasharray="4,4" 
              />
            </svg>

            {/* Time Slider Overlay */}
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
              <span style={{ fontSize: '1.2rem', color: '#fff' }}>⏱️ Time:</span>
              <input 
                type="range" 
                min="0" 
                max="6" 
                step="0.1" 
                value={tVal}
                onChange={(e) => {
                  setTVal(e.target.value);
                  if (Math.abs(e.target.value - 3) < 0.1) {
                    setTypedVal('3');
                  }
                }}
                style={{ flex: 1, cursor: 'pointer', height: '8px' }}
              />
              <span style={{ color: '#fff', fontWeight: 'bold', width: '40px' }}>{Number(tVal).toFixed(1)}s</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem' }}>
            <div>Height: <strong>{curH.toFixed(1)}m</strong></div>
            <div>Speed (Slope): <strong style={{ color: slopeColor }}>{curSlope.toFixed(1)} m/s</strong></div>
          </div>
        </div>

        {/* Algebraic Solver */}
        <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--clr-border)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Find the Peak Mathematically</h3>
            
            <p style={{ marginBottom: '1rem', color: 'var(--clr-text-soft)' }}>
              At the absolute highest point, the ball stops going up before it comes down. 
              <strong> The slope of the tangent line must be exactly 0!</strong>
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <strong>1. The Equation:</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', marginTop: '5px' }}>h(t) = -t² + 6t + 2</div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>2. The Derivative (Speed):</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', marginTop: '5px' }}>h'(t) = -2t + 6</div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>3. Set speed to 0 and solve for t:</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', marginTop: '5px' }}>0 = -2t + 6</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', background: 'var(--clr-surface-alt)', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>t =</span>
              <input
                type="text"
                value={typedVal}
                onChange={(e) => {
                  setTypedVal(e.target.value);
                  if (e.target.value === '3') setTVal(3);
                }}
                placeholder="?"
                style={{
                  padding: '0.5rem',
                  fontSize: '1.5rem',
                  width: '100px',
                  background: 'var(--clr-bg)',
                  color: 'var(--clr-text)',
                  border: `2px solid ${isCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                  borderRadius: '8px',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '1.2rem' }}>seconds</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isCorrect ? 1 : 0, height: isCorrect ? 'auto' : 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: 'var(--clr-green-soft)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Fantastic!</strong><br/><br/>
              By setting the derivative to zero, you proved mathematically that the ball reaches its peak exactly at <strong>t = 3</strong> seconds.
            </div>
            
            <button 
              className="primary-btn pulse"
              onClick={() => onComplete({ stage6TurningPoints: { success: true } })}
              style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.2rem' }}
            >
              Continue to Optimization &rarr;
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

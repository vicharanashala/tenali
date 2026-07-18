import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stage7Optimization({ onComplete }) {
  const [sliderVal, setSliderVal] = useState(0); // slider value for x
  const [typedX, setTypedX] = useState('');
  const [typedY, setTypedY] = useState('');

  // h(x) = x^2 - 6x + 10
  const h = (x) => x * x - 6 * x + 10;
  // h'(x) = 2x - 6
  const dh = (x) => 2 * x - 6;

  // Minimum is at x = 3, h(3) = 9 - 18 + 10 = 1
  const exactX = 3;
  const exactY = 1;
  const isXCorrect = typedX.trim() === '3';
  const isYCorrect = typedY.trim() === '1';
  const isComplete = isXCorrect && isYCorrect;

  // For the SVG bounds
  const xMin = 0, xMax = 6;
  const hMin = 0, hMax = 10;

  const mapX = (x_val) => ((x_val - xMin) / (xMax - xMin)) * 800;
  const mapH = (h_val) => 400 - ((h_val - hMin) / (hMax - hMin)) * 400;

  // Generate curve path (Half-pipe)
  let path = `M ${mapX(xMin)} ${mapH(h(xMin))}`;
  const step = (xMax - xMin) / 100;
  for (let x = xMin; x <= xMax; x += step) {
    path += ` L ${mapX(x)} ${mapH(h(x))}`;
  }

  // Current skater position
  // If complete, force skater to the bottom!
  const curX = isComplete ? exactX : (parseFloat(sliderVal) || 0);
  const curH = h(curX);
  const curSlope = dh(curX);

  // Tangent line (Skateboard)
  const tanX1 = curX - 0.8;
  const tanH1 = curSlope * (tanX1 - curX) + curH;
  const tanX2 = curX + 0.8;
  const tanH2 = curSlope * (tanX2 - curX) + curH;

  // Determine slope color
  let slopeColor = 'var(--clr-accent)';
  if (Math.abs(curSlope) <= 0.1) slopeColor = 'var(--clr-green)';

  return (
    <div className="welcome-box" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Stage 9: Optimization (The Lowest Point)
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        You just found a Maximum (a peak). Now let's find a Minimum (a valley). 
        Calculus helps us optimize things—like finding the absolute lowest cost, or the lowest point of a half-pipe!
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Physical Visualization */}
        <div style={{ flex: '3', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: 'var(--clr-surface)', padding: '1rem', borderRadius: '12px' }}>
            <strong>Scenario:</strong> A skater drops into a half-pipe. Their height curve is:
            <span style={{ color: 'var(--clr-orange)', fontWeight: 'bold', marginLeft: '10px' }}>h(x) = x² - 6x + 10</span>
          </div>

          <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
            <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Axes */}
              <line x1="0" y1={mapH(0)} x2="800" y2={mapH(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={mapX(0)} y1="0" x2={mapX(0)} y2="400" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />

              {/* The Curve */}
              <path d={path} fill="none" stroke="var(--clr-text-soft)" strokeWidth="6" strokeLinecap="round" />

              {/* The Skateboard (Tangent Line) */}
              <motion.line 
                x1={mapX(tanX1)} y1={mapH(tanH1)} 
                x2={mapX(tanX2)} y2={mapH(tanH2)} 
                stroke={slopeColor} 
                strokeWidth="6" 
                strokeLinecap="round"
                animate={{
                  x1: mapX(tanX1), y1: mapH(tanH1),
                  x2: mapX(tanX2), y2: mapH(tanH2)
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />

              {/* The Skater (Circle) */}
              <motion.circle 
                cx={mapX(curX)} cy={mapH(curH)} r="12" 
                fill={isComplete ? 'var(--clr-green)' : 'var(--clr-orange)'} 
                animate={{ cx: mapX(curX), cy: mapH(curH) }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />

            </svg>

            {/* Position Slider Overlay */}
            {!isComplete && (
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
                <span style={{ fontSize: '1.2rem', color: '#fff' }}>🛹 Slide x:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  step="0.1" 
                  value={sliderVal}
                  onChange={(e) => setSliderVal(e.target.value)}
                  style={{ flex: 1, cursor: 'pointer', height: '8px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Algebraic Solver */}
        <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--clr-border)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Find the Minimum</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>1. Calculate where slope is 0:</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '5px' }}>h'(x) = 2x - 6 = 0</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>x =</span>
                <input
                  type="text"
                  value={typedX}
                  onChange={(e) => setTypedX(e.target.value)}
                  placeholder="?"
                  style={{
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    width: '60px',
                    background: 'var(--clr-bg)',
                    color: 'var(--clr-text)',
                    border: `2px solid ${isXCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                    borderRadius: '8px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                  disabled={isXCorrect}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem', opacity: isXCorrect ? 1 : 0.3, transition: 'opacity 0.3s' }}>
              <strong>2. What is the actual minimum height?</strong>
              <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '10px' }}>
                Plug the x value back into the original h(x) equation!
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>h({isXCorrect ? '3' : 'x'}) = ({isXCorrect ? '3' : 'x'})² - 6({isXCorrect ? '3' : 'x'}) + 10</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Height =</span>
                <input
                  type="text"
                  value={typedY}
                  onChange={(e) => setTypedY(e.target.value)}
                  placeholder="?"
                  style={{
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    width: '80px',
                    background: 'var(--clr-bg)',
                    color: 'var(--clr-text)',
                    border: `2px solid ${isYCorrect ? 'var(--clr-green)' : 'var(--clr-border)'}`,
                    borderRadius: '8px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                  disabled={!isXCorrect || isYCorrect}
                />
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isComplete ? 1 : 0, height: isComplete ? 'auto' : 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: 'var(--clr-green-soft)', border: '1px solid var(--clr-green)', padding: '1rem', borderRadius: '8px', color: 'var(--clr-green)' }}>
              <strong>Outstanding!</strong><br/><br/>
              You just proved that the absolute lowest point the skater will reach is exactly <strong>1 meter</strong> high. Real-world companies use this exact technique to minimize costs and maximize profits!
            </div>
            
            <button 
              className="primary-btn pulse"
              onClick={() => onComplete({ stage7Optimization: { success: true } })}
              style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.2rem' }}
            >
              Complete Concept Playground &rarr;
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

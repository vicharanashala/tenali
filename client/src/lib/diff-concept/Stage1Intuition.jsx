import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Stage1Intuition({ onComplete, isSpacedReplay }) {
  const [x, setX] = useState(1.5);
  const [isMicroscope, setIsMicroscope] = useState(false);
  const [h, setH] = useState(1);

  // Math Functions
  const f = (val) => Math.sin(val);
  const df = (val) => Math.cos(val); // exact derivative

  // Coordinate Mapping for SVG (800x400)
  const minX = 0;
  const maxX = 4 * Math.PI;
  
  const mapX = (val) => 50 + (val / maxX) * 700;
  const mapY = (val) => 200 - val * 100;

  // Generate smooth sine wave path
  let hillPath = `M ${mapX(0)} ${mapY(f(0))}`;
  for (let i = 0; i <= maxX; i += 0.1) {
    hillPath += ` L ${mapX(i)} ${mapY(f(i))}`;
  }

  // Car position and rotation
  const carX = mapX(x);
  const carY = mapY(f(x));
  
  // To calculate rotation on screen, we need the screen-space derivative
  const dX = 700 / maxX;
  const dY = -100 * df(x);
  const angleRad = Math.atan2(dY, dX);
  const angleDeg = angleRad * (180 / Math.PI);

  const exactSlope = df(x);
  const isFlat = Math.abs(exactSlope) < 0.1;
  const isUphill = exactSlope >= 0.1;
  const isDownhill = exactSlope <= -0.1;

  // Secant calculations for microscope mode
  const x2 = x + h;
  const secantY = mapY(f(x2));
  const secantX = mapX(x2);
  const averageSlope = h === 0 ? exactSlope : (f(x2) - f(x)) / h;

  // Dynamic feedback text
  let feedback = "";
  let feedbackColor = "";
  if (isFlat) {
    feedback = "Peak / Valley! (Slope is ZERO)";
    feedbackColor = "var(--clr-blue)";
  } else if (isUphill) {
    feedback = "Climbing UP! (Positive Slope)";
    feedbackColor = "var(--clr-green)";
  } else {
    feedback = "Wheee! Downhill! (Negative Slope)";
    feedbackColor = "var(--clr-orange)";
  }

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Stage 1: The Intuition of Slope
          </h2>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '600px' }}>
            Instead of confusing math formulas, let's drive a car! 
            <strong> Drag the slider</strong> to drive the car along the hill. Watch how the 
            car tilts (its slope) and see the Slope Gauge react.
          </p>
        </div>
        
        {/* Toggle Microscope Mode */}
        <button 
          onClick={() => setIsMicroscope(!isMicroscope)}
          style={{
            background: isMicroscope ? 'var(--clr-accent)' : 'var(--clr-surface)',
            color: isMicroscope ? '#fff' : 'var(--clr-text)',
            border: '2px solid var(--clr-accent)',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          🔬 {isMicroscope ? "Exit Microscope" : "Microscope Mode"}
        </button>
      </div>

      {/* Main Interactive Area */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginTop: '2rem',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* The Hill SVG */}
        <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
          
          <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Grid lines */}
            <line x1="50" y1="200" x2="750" y2="200" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* The Hill */}
            <path d={hillPath} fill="none" stroke="var(--clr-text-soft)" strokeWidth="6" strokeLinecap="round" />
            <path d={`${hillPath} L 750 400 L 50 400 Z`} fill="rgba(255,255,255,0.02)" />

            {/* Secant / Tangent Visualization (Microscope Mode) */}
            {isMicroscope ? (
              <>
                {/* Secant Line */}
                <line 
                  x1={mapX(x - 2)} 
                  y1={mapY(f(x) - 2 * averageSlope)} 
                  x2={mapX(x + 2)} 
                  y2={mapY(f(x) + 2 * averageSlope)} 
                  stroke="var(--clr-orange)" 
                  strokeWidth="3"
                  strokeDasharray={h === 0 ? "0" : "8,4"}
                />
                <circle cx={secantX} cy={secantY} r="8" fill="var(--clr-orange)" />
                <text x={secantX} y={secantY - 15} fill="var(--clr-orange)" fontSize="16" textAnchor="middle" fontWeight="bold">Average</text>
              </>
            ) : (
              /* Simple Tangent Line */
              <line 
                x1={carX - Math.cos(angleRad)*60} 
                y1={carY - Math.sin(angleRad)*60} 
                x2={carX + Math.cos(angleRad)*60} 
                y2={carY + Math.sin(angleRad)*60} 
                stroke="var(--clr-green)" 
                strokeWidth="4" 
              />
            )}

            {/* The Car Point */}
            <circle cx={carX} cy={carY} r="6" fill="var(--clr-accent)" />
          </svg>

          {/* EMOJI CAR overlayed on SVG */}
          <div style={{
            position: 'absolute',
            left: 0, top: 0,
            transform: `translate(${carX - 20}px, ${carY - 24}px) rotate(${angleDeg}deg)`,
            transformOrigin: '20px 24px',
            fontSize: '40px',
            pointerEvents: 'none',
            transition: 'transform 0.1s ease-out'
          }}>
            🚗
          </div>

          {/* Drive Slider overlayed at the bottom */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50px',
            right: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0,0,0,0.4)',
            padding: '12px 20px',
            borderRadius: '100px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '1.2rem', color: '#fff' }}>🚦 Drive:</span>
            <input 
              type="range" 
              min={minX} 
              max={maxX} 
              step="0.05" 
              value={x}
              onChange={(e) => setX(parseFloat(e.target.value))}
              style={{ flex: 1, cursor: 'pointer', height: '8px' }}
            />
          </div>
        </div>

        {/* Dashboard Area */}
        <div style={{ display: 'flex', gap: '2rem', width: '100%', flexWrap: 'wrap' }}>
          
          {/* Slope Gauge */}
          <div style={{ 
            flex: '1', 
            background: 'var(--clr-surface)', 
            borderRadius: '16px', 
            padding: '1.5rem',
            border: `2px solid ${feedbackColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.3s'
          }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--clr-text-soft)', marginBottom: '10px' }}>
              Real-time Slope Gauge
            </div>
            
            {/* Simple CSS Gauge */}
            <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden', marginBottom: '10px' }}>
              {/* Gauge Background */}
              <div style={{ 
                position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                border: '20px solid var(--clr-surface-alt)', borderBottomColor: 'transparent', borderRightColor: 'transparent',
                transform: 'rotate(45deg)'
              }}></div>
              
              {/* Gauge Needle (mapping -1 to +1 to -90 to +90 degrees) */}
              <motion.div 
                animate={{ rotate: (isMicroscope ? averageSlope : exactSlope) * 90 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                  position: 'absolute', left: '98px', bottom: '0', width: '4px', height: '90px',
                  background: 'var(--clr-text)', transformOrigin: 'bottom center', borderRadius: '4px'
                }}
              />
              
              <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '0.9rem', color: 'var(--clr-orange)' }}>-ve</div>
              <div style={{ position: 'absolute', top: 0, left: '90px', fontSize: '0.9rem', color: 'var(--clr-blue)' }}>Zero</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, fontSize: '0.9rem', color: 'var(--clr-green)' }}>+ve</div>
            </div>

            <h3 style={{ fontSize: '2rem', color: feedbackColor, margin: '10px 0' }}>
              {(isMicroscope ? averageSlope : exactSlope).toFixed(2)}
            </h3>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: feedbackColor }}>
              {feedback}
            </p>
          </div>

          {/* Microscope Controls */}
          {isMicroscope ? (
            <div style={{ 
              flex: '1', 
              background: 'var(--clr-surface)', 
              borderRadius: '16px', 
              padding: '1.5rem',
              border: '2px solid var(--clr-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ marginBottom: '15px' }}>🔬 Zoomed In!</h3>
              <p style={{ color: 'var(--clr-text-soft)', marginBottom: '15px' }}>
                We are now looking at TWO points. The orange line is the <strong>Average Slope</strong> between them.
                Slide `h` to zero to squish the points together.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Distance (h):</span>
                <input 
                  type="range" min="0" max="2" step="0.05" value={h}
                  onChange={(e) => setH(parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{h.toFixed(2)}</span>
              </div>

              {h === 0 && (
                <div style={{ background: 'var(--clr-green-soft)', color: 'var(--clr-green)', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  Boom! When h=0, the Average Slope becomes the EXACT Tangent Slope!
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <button 
                className="primary-btn pulse" 
                onClick={() => onComplete({ stage1Intuition: true })}
                style={{ fontSize: '1.3rem', padding: '1rem 2rem' }}
              >
                I get it! Next Stage →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

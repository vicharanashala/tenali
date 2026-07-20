import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stage1Mountain({ onComplete }) {
  const [x, setX] = useState(1.5);
  
  // Math Functions
  // A wavy hill that generally goes upwards
  const f = (val) => Math.sin(val) + 0.3 * val;
  const df = (val) => Math.cos(val) + 0.3; // exact derivative

  // Coordinate Mapping for SVG (800x400)
  const minX = 0;
  const maxX = 4 * Math.PI;
  
  const mapX = (val) => 50 + (val / maxX) * 700;
  // Adjusted Y mapping to fit the new function
  const mapY = (val) => 250 - val * 60;

  // Generate segmented path for SLOPE HEAT MAP
  const segments = [];
  const step = 0.1;
  for (let i = 0; i < maxX; i += step) {
    const slope = df(i + step/2);
    let color = 'var(--clr-yellow)'; // flat
    if (slope > 0.1) color = 'var(--clr-green)'; // uphill
    if (slope < -0.1) color = 'var(--clr-red)'; // downhill
    
    segments.push({
      x1: mapX(i),
      y1: mapY(f(i)),
      x2: mapX(i + step),
      y2: mapY(f(i + step)),
      color
    });
  }

  // Car position and rotation
  const carX = mapX(x);
  const carY = mapY(f(x));
  
  // To calculate rotation on screen, we need the screen-space derivative
  const dX = 700 / maxX;
  const dY = -60 * df(x);
  const angleRad = Math.atan2(dY, dX);
  const angleDeg = angleRad * (180 / Math.PI);

  const exactSlope = df(x);
  const isFlat = Math.abs(exactSlope) < 0.15;
  const isUphill = exactSlope >= 0.15;
  
  // Dynamic feedback text
  let feedback = "";
  let feedbackColor = "";
  if (isFlat) {
    feedback = "Peak / Valley (Slope is ZERO)";
    feedbackColor = "var(--clr-yellow)";
  } else if (isUphill) {
    feedback = "Climbing UP! (Positive Slope)";
    feedbackColor = "var(--clr-green)";
  } else {
    feedback = "Going DOWNHILL! (Negative Slope)";
    feedbackColor = "var(--clr-red)";
  }

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Stage 1: The Mountain Walk
          </h2>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '700px' }}>
            Welcome to the Interactive Math Lab! Let's build an intuition for <strong>Slope</strong> (the Derivative).
            <br/><br/>
            <strong>Drag the slider</strong> to drive the car over the mountain. Notice the <strong>Slope Heat Map</strong>: 
            <span style={{ color: 'var(--clr-green)', fontWeight: 'bold', margin: '0 5px' }}>Green</span> is uphill (+), 
            <span style={{ color: 'var(--clr-red)', fontWeight: 'bold', margin: '0 5px' }}>Red</span> is downhill (-), and 
            <span style={{ color: 'var(--clr-yellow)', fontWeight: 'bold', margin: '0 5px' }}>Yellow</span> is flat (0).
          </p>
        </div>
      </div>

      {/* Main Interactive Area */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginTop: '1.5rem',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* The Hill SVG */}
        <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
          
          <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Grid lines */}
            <line x1="50" y1="250" x2="750" y2="250" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* The Hill Heat Map */}
            {segments.map((seg, idx) => (
              <line 
                key={idx}
                x1={seg.x1} y1={seg.y1} 
                x2={seg.x2} y2={seg.y2} 
                stroke={seg.color} 
                strokeWidth="8" 
                strokeLinecap="round" 
              />
            ))}

            {/* Tangent Line attached to car */}
            <line 
              x1={carX - Math.cos(angleRad)*60} 
              y1={carY - Math.sin(angleRad)*60} 
              x2={carX + Math.cos(angleRad)*60} 
              y2={carY + Math.sin(angleRad)*60} 
              stroke="#fff" 
              strokeWidth="3"
              strokeDasharray="4,4" 
            />

            {/* The Car Point */}
            <circle cx={carX} cy={carY} r="6" fill="#fff" />
          </svg>

          {/* EMOJI CAR overlayed on SVG */}
          <div style={{
            position: 'absolute',
            left: 0, top: 0,
            transform: `translate(${carX - 20}px, ${carY - 24}px) rotate(${angleDeg}deg)`,
            transformOrigin: '20px 24px',
            fontSize: '40px',
            pointerEvents: 'none',
            transition: 'transform 0.1s ease-out',
            filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))'
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
            background: 'rgba(0,0,0,0.6)',
            padding: '12px 20px',
            borderRadius: '100px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
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
              Real-time Slope (Derivative)
            </div>
            
            {/* Simple CSS Gauge */}
            <div style={{ position: 'relative', width: '240px', height: '120px', overflow: 'hidden', marginBottom: '10px' }}>
              {/* Gauge Background */}
              <div style={{ 
                position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
                border: '24px solid var(--clr-surface-alt)', borderBottomColor: 'transparent', borderRightColor: 'transparent',
                transform: 'rotate(45deg)'
              }}></div>
              
              {/* Gauge Needle (mapping slope -2 to +2 to -90 to +90 degrees approx) */}
              <motion.div 
                animate={{ rotate: Math.max(-90, Math.min(90, exactSlope * 45)) }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                  position: 'absolute', left: '118px', bottom: '0', width: '4px', height: '110px',
                  background: '#fff', transformOrigin: 'bottom center', borderRadius: '4px'
                }}
              />
              
              <div style={{ position: 'absolute', bottom: 0, left: 10, fontSize: '0.9rem', color: 'var(--clr-red)', fontWeight: 'bold' }}>Downhill (-)</div>
              <div style={{ position: 'absolute', top: 5, left: '105px', fontSize: '0.9rem', color: 'var(--clr-yellow)', fontWeight: 'bold' }}>Flat (0)</div>
              <div style={{ position: 'absolute', bottom: 0, right: 10, fontSize: '0.9rem', color: 'var(--clr-green)', fontWeight: 'bold' }}>Uphill (+)</div>
            </div>

            <h3 style={{ fontSize: '2.5rem', color: feedbackColor, margin: '10px 0' }}>
              {exactSlope > 0 ? '+' : ''}{exactSlope.toFixed(2)}
            </h3>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: feedbackColor }}>
              {feedback}
            </p>
          </div>

          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--clr-accent)' }}>What is changing?</h3>
            <p style={{ color: 'var(--clr-text-soft)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              The <strong>Derivative</strong> is just a fancy word for "How steep is the mountain right now?" 
              By looking at the heat map, you instantly know where the derivative is positive, negative, or zero!
            </p>
            <button 
              className="primary-btn pulse" 
              onClick={() => onComplete({ stage1Mountain: true })}
              style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
            >
              Makes perfect sense! Next →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

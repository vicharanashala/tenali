import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stage3Tangent({ onComplete }) {
  // Slider controls the user's guessed slope. 
  // Let's start it at 0 (flat horizontal line)
  const [userSlope, setUserSlope] = useState(0);
  
  // Math for the curve
  // A simple hill: f(x) = -x^2 + 4x
  // Derivative: f'(x) = -2x + 4
  const f = (x) => -x * x + 4 * x;
  
  // The specific point we want them to build a tangent for
  const targetX = 1;
  const targetY = f(targetX); // 3
  const exactSlope = -2 * targetX + 4; // 2

  // Determine if the user has found the perfect tangent
  // We'll give a small margin of error to make it feel good
  const isPerfect = Math.abs(userSlope - exactSlope) < 0.1;

  // View bounds for mapping to 800x400 SVG
  const xMin = -1, xMax = 5;
  const yMin = -1, yMax = 5;

  const mapX = (x) => ((x - xMin) / (xMax - xMin)) * 800;
  const mapY = (y) => 400 - ((y - yMin) / (yMax - yMin)) * 400;

  // Generate curve path
  let path = `M ${mapX(xMin)} ${mapY(f(xMin))}`;
  const step = (xMax - xMin) / 100;
  for (let x = xMin; x <= xMax; x += step) {
    path += ` L ${mapX(x)} ${mapY(f(x))}`;
  }

  // Generate the user's custom line
  // y = m(x - x0) + y0
  const userLineY1 = userSlope * (xMin - targetX) + targetY;
  const userLineY2 = userSlope * (xMax - targetX) + targetY;

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Stage 3: Tangent Builder
          </h2>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '700px' }}>
            Now it's your turn to be the architect!
            <strong> Rotate the line</strong> until it perfectly "kisses" the curve at the glowing dot without slicing through it.
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginTop: '2rem',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* The SVG Visualization */}
        <div style={{ position: 'relative', width: '100%', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: `2px solid ${isPerfect ? 'var(--clr-green)' : 'var(--clr-border)'}`, overflow: 'hidden', transition: 'border-color 0.3s' }}>
          
          <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Grid lines */}
            <line x1="0" y1={mapY(0)} x2="800" y2={mapY(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* The Curve */}
            <path d={path} fill="none" stroke="var(--clr-text-soft)" strokeWidth="6" strokeLinecap="round" />
            
            {/* The User's Line */}
            <line 
              x1={mapX(xMin)} y1={mapY(userLineY1)} 
              x2={mapX(xMax)} y2={mapY(userLineY2)} 
              stroke={isPerfect ? 'var(--clr-green)' : 'var(--clr-accent)'} 
              strokeWidth={isPerfect ? "6" : "4"} 
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
            />

            {/* The Target Point */}
            <circle cx={mapX(targetX)} cy={mapY(targetY)} r="8" fill="#fff" stroke={isPerfect ? 'var(--clr-green)' : 'var(--clr-accent)'} strokeWidth="4" />
          </svg>

          {/* Feedback Overlay inside SVG area */}
          {isPerfect && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'absolute',
                top: '20px', right: '20px',
                background: 'var(--clr-green-soft)',
                color: 'var(--clr-green)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                border: '1px solid var(--clr-green)',
                boxShadow: '0px 4px 12px rgba(0,255,128,0.2)'
              }}
            >
              ✅ Perfect Tangent!
            </motion.div>
          )}

        </div>

        {/* Controls and Dashboard */}
        <div style={{ display: 'flex', gap: '2rem', width: '100%', flexWrap: 'wrap' }}>
          
          <div style={{ 
            flex: '2', 
            background: 'var(--clr-surface)', 
            borderRadius: '16px', 
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{ marginBottom: '15px' }}>Line Rotation (Slope)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Slope:</span>
              <input 
                type="range" min="-5" max="5" step="0.1" 
                value={userSlope}
                onChange={(e) => setUserSlope(parseFloat(e.target.value))}
                style={{ flex: 1, height: '8px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', width: '50px', textAlign: 'right', color: isPerfect ? 'var(--clr-green)' : 'inherit' }}>
                {userSlope.toFixed(1)}
              </span>
            </div>
          </div>

          <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPerfect ? (
              <button 
                className="primary-btn pulse" 
                onClick={() => onComplete({ stage3Tangent: true })}
                style={{ fontSize: '1.2rem', padding: '1rem 2rem', width: '100%' }}
              >
                Excellent! Next →
              </button>
            ) : (
              <div style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', textAlign: 'center' }}>
                Rotate the line until it perfectly matches the curve's steepness!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Stage2Zoom({ onComplete }) {
  // zoomSlider goes from 0 to 100
  const [zoomSlider, setZoomSlider] = useState(0);
  
  // Convert slider to scale: 0 -> 1x, 100 -> 64x
  // We use an exponential curve for smooth zooming feel
  const scale = Math.pow(64, zoomSlider / 100); 

  // Target point to zoom into
  const targetX = 1;
  const targetY = 1; // f(1) = 1^2 = 1
  const exactSlope = 2; // f'(1) = 2*1 = 2

  // Base radii at 1x zoom
  const baseRadiusX = 3;
  const baseRadiusY = 3;

  // Calculate current bounds based on scale
  const xMin = targetX - baseRadiusX / scale;
  const xMax = targetX + baseRadiusX / scale;
  const yMin = targetY - baseRadiusY / scale;
  const yMax = targetY + baseRadiusY / scale;

  const f = (x) => x * x;

  // Map math coordinates to SVG 800x400
  const mapX = (x) => ((x - xMin) / (xMax - xMin)) * 800;
  const mapY = (y) => 400 - ((y - yMin) / (yMax - yMin)) * 400;

  // Generate curve path
  let path = `M ${mapX(xMin)} ${mapY(f(xMin))}`;
  const step = (xMax - xMin) / 100; // 100 segments for smoothness
  for (let x = xMin; x <= xMax; x += step) {
    path += ` L ${mapX(x)} ${mapY(f(x))}`;
  }

  // Generate tangent line for visual comparison
  const tanY1 = exactSlope * (xMin - targetX) + targetY;
  const tanY2 = exactSlope * (xMax - targetX) + targetY;

  return (
    <div className="welcome-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--clr-accent)', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Stage 2: The Zoom Technique (Local Linearity)
      </h2>
      <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem', maxWidth: '800px', marginBottom: '2rem' }}>
        A mountain looks bumpy from far away. But what if you look closely at the ground beneath your feet? 
        <strong> Drag the Zoom Slider</strong> to look closer at the point (1, 1) on the curve <i>y = x²</i>.
      </p>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* SVG Area */}
        <div style={{ flex: '2', minWidth: '400px', background: 'var(--clr-surface-alt)', borderRadius: '16px', border: '1px solid var(--clr-border)', overflow: 'hidden', position: 'relative' }}>
          <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Draw Axes if visible */}
            {yMin <= 0 && yMax >= 0 && (
              <line x1="0" y1={mapY(0)} x2="800" y2={mapY(0)} stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            )}
            {xMin <= 0 && xMax >= 0 && (
              <line x1={mapX(0)} y1="0" x2={mapX(0)} y2="400" stroke="var(--clr-border)" strokeWidth="2" strokeDasharray="5,5" />
            )}

            {/* The Curve */}
            <path d={path} fill="none" stroke="#60A5FA" strokeWidth={Math.max(4, 10 / scale)} strokeLinecap="round" />

            {/* The Target Point */}
            <circle cx={mapX(targetX)} cy={mapY(targetY)} r="8" fill="var(--clr-accent)" />
            
            {/* The Tangent Line (Fades in as you zoom) */}
            <line 
              x1={mapX(xMin)} y1={mapY(tanY1)} 
              x2={mapX(xMax)} y2={mapY(tanY2)} 
              stroke="var(--clr-green)" 
              strokeWidth="4" 
              strokeDasharray="10,10"
              style={{ opacity: zoomSlider / 100 }}
            />
          </svg>
          
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
            Zoom: {scale.toFixed(1)}x
          </div>
          
          {/* Zoom Slider Overlay */}
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
            <span style={{ fontSize: '1.2rem', color: '#fff' }}>🔍 Zoom:</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="1" 
              value={zoomSlider}
              onChange={(e) => setZoomSlider(parseFloat(e.target.value))}
              style={{ flex: 1, cursor: 'pointer', height: '8px' }}
            />
          </div>
        </div>

        {/* Controls Area */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
          
          <div style={{ background: 'var(--clr-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--clr-border)' }}>
            <h3 style={{ color: 'var(--clr-accent)', marginBottom: '10px' }}>What happens?</h3>
            <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5', minHeight: '100px' }}>
              {zoomSlider < 30 && "The curve looks like a normal parabola."}
              {zoomSlider >= 30 && zoomSlider < 80 && "The curve starts to look a bit flatter, doesn't it?"}
              {zoomSlider >= 80 && zoomSlider < 99 && "Almost entirely flat now! You can barely tell it's curved."}
              {zoomSlider >= 99 && (
                <span>
                  <strong style={{ color: 'var(--clr-green)' }}>It IS a straight line!</strong><br/><br/>
                  Every smooth curve becomes a straight line if you zoom in enough. 
                  The green dashed line perfectly overlaps our curve.<br/><br/>
                  <strong>The slope of that straight line = The Derivative.</strong>
                </span>
              )}
            </p>
          </div>

          <motion.button 
            initial={{ opacity: 0.5 }}
            animate={{ 
              opacity: zoomSlider >= 99 ? 1 : 0.5,
              scale: zoomSlider >= 99 ? 1 : 0.95
            }}
            className="primary-btn pulse"
            disabled={zoomSlider < 99}
            onClick={() => onComplete({ stage2Zoom: true })}
            style={{ 
              padding: '1rem', 
              fontSize: '1.2rem', 
              marginTop: 'auto',
              cursor: zoomSlider >= 99 ? 'pointer' : 'not-allowed',
              background: zoomSlider >= 99 ? 'var(--clr-accent)' : 'var(--clr-surface-alt)'
            }}
          >
            {zoomSlider >= 99 ? 'I see it! Next →' : 'Zoom in fully to continue'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Helper to get random even numbers
const randEven = (min, max) => {
  let r = Math.floor(Math.random() * (max - min + 1)) + min;
  if (r % 2 !== 0) r += 1;
  return r;
};

export default function CoordGeomDiscoveryApp({ onBack }) {
  // Grid config
  const GRID_SIZE = 10; // -10 to 10
  const CELL_SIZE = 40; // 40px per unit
  const WIDTH = GRID_SIZE * 2 * CELL_SIZE;
  const HEIGHT = GRID_SIZE * 2 * CELL_SIZE;
  
  // Game State
  const [rover1, setRover1] = useState({ x: -4, y: 2 });
  const [rover2, setRover2] = useState({ x: 6, y: -6 });
  const [pylon, setPylon] = useState({ x: 0, y: -8 }); // Grid units
  const [isDragging, setIsDragging] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  
  const svgRef = useRef(null);

  // Generate new mission
  const generateMission = () => {
    let r1 = { x: randEven(-8, 8), y: randEven(-8, 8) };
    let r2 = { x: randEven(-8, 8), y: randEven(-8, 8) };
    while (r1.x === r2.x && r1.y === r2.y) {
      r2 = { x: randEven(-8, 8), y: randEven(-8, 8) };
    }
    setRover1(r1);
    setRover2(r2);
    setPylon({ x: randEven(-8, 8), y: randEven(-8, 8) });
    setDiscovered(false);
  };

  useEffect(() => {
    generateMission();
  }, []);

  const midpoint = {
    x: (rover1.x + rover2.x) / 2,
    y: (rover1.y + rover2.y) / 2
  };

  const getGridCoords = (clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    // Convert to relative coordinates inside the SVG
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    // Map to grid -10 to 10
    const gridX = (svgX / CELL_SIZE) - GRID_SIZE;
    const gridY = GRID_SIZE - (svgY / CELL_SIZE);
    return { x: gridX, y: gridY };
  };

  const handlePointerDown = (e) => {
    if (discovered) return;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || discovered) return;
    const coords = getGridCoords(e.clientX, e.clientY);
    if (coords) {
      setPylon({ x: coords.x, y: coords.y });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest integer coordinate
    const snappedX = Math.round(pylon.x);
    const snappedY = Math.round(pylon.y);
    setPylon({ x: snappedX, y: snappedY });

    // Check if it's the midpoint
    if (snappedX === midpoint.x && snappedY === midpoint.y) {
      setDiscovered(true);
    }
  };

  // Convert grid coords to pixel coords for SVG
  const toPx = (gridX, gridY) => ({
    x: (gridX + GRID_SIZE) * CELL_SIZE,
    y: (GRID_SIZE - gridY) * CELL_SIZE
  });

  const p1Px = toPx(rover1.x, rover1.y);
  const p2Px = toPx(rover2.x, rover2.y);
  const pylonPx = toPx(pylon.x, pylon.y);
  const midPx = toPx(midpoint.x, midpoint.y);

  // Tension physics visually
  const dist1 = Math.hypot(pylon.x - rover1.x, pylon.y - rover1.y);
  const dist2 = Math.hypot(pylon.x - rover2.x, pylon.y - rover2.y);
  const isEqual = Math.abs(dist1 - dist2) < 0.1;
  const tetherColor = isEqual ? '#10b981' : '#f43f5e'; // Green if equal, Red if unequal

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#020617', color: 'white' }}>
      <button 
        onClick={onBack} 
        style={{ marginBottom: '20px', background: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
        ← Back
      </button>
      <div className="discovery-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0f172a', padding: '20px', borderRadius: '24px', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Story Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#e2e8f0', fontFamily: 'var(--font-primary)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span>🚀</span> Rescue the Rovers!
          </h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem' }}>
            Drag the glowing Charging Pylon so both rovers have the <strong style={{color:'#60a5fa'}}>exact same distance</strong> to connect their tethers.
          </p>
        </div>

        {/* The Coordinate Universe */}
        <div 
          style={{ 
            position: 'relative', 
            width: WIDTH, 
            height: HEIGHT, 
            background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
            border: '2px solid #334155',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 50px rgba(56,189,248,0.1)',
            touchAction: 'none'
          }}
        >
          {/* Grid Background */}
          <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            {/* Draw Grid Lines */}
            {Array.from({ length: GRID_SIZE * 2 + 1 }).map((_, i) => (
              <g key={i}>
                {/* Vertical */}
                <line x1={i * CELL_SIZE} y1={0} x2={i * CELL_SIZE} y2={HEIGHT} stroke={i === GRID_SIZE ? '#475569' : '#1e293b'} strokeWidth={i === GRID_SIZE ? 2 : 1} />
                {/* Horizontal */}
                <line x1={0} y1={i * CELL_SIZE} x2={WIDTH} y2={i * CELL_SIZE} stroke={i === GRID_SIZE ? '#475569' : '#1e293b'} strokeWidth={i === GRID_SIZE ? 2 : 1} />
              </g>
            ))}

            {/* Tethers */}
            {(!discovered || isDragging) && (
              <>
                <motion.line 
                  x1={p1Px.x} y1={p1Px.y} x2={pylonPx.x} y2={pylonPx.y} 
                  stroke={tetherColor} strokeWidth="3" strokeDasharray="6 6"
                  animate={{ stroke: tetherColor }}
                />
                <motion.line 
                  x1={p2Px.x} y1={p2Px.y} x2={pylonPx.x} y2={pylonPx.y} 
                  stroke={tetherColor} strokeWidth="3" strokeDasharray="6 6"
                  animate={{ stroke: tetherColor }}
                />
                {/* Distance Labels */}
                {!isDragging && (
                  <>
                    <text x={(p1Px.x + pylonPx.x)/2} y={(p1Px.y + pylonPx.y)/2 - 10} fill={tetherColor} fontSize="14" textAnchor="middle" fontWeight="bold">
                      {dist1.toFixed(1)}
                    </text>
                    <text x={(p2Px.x + pylonPx.x)/2} y={(p2Px.y + pylonPx.y)/2 - 10} fill={tetherColor} fontSize="14" textAnchor="middle" fontWeight="bold">
                      {dist2.toFixed(1)}
                    </text>
                  </>
                )}
              </>
            )}

            {/* Success Shockwave / Tether */}
            <AnimatePresence>
              {discovered && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.circle cx={midPx.x} cy={midPx.y} r="0" fill="none" stroke="#38bdf8" strokeWidth="4"
                    animate={{ r: 100, opacity: 0 }} transition={{ duration: 1, ease: "easeOut" }} />
                  <motion.line x1={p1Px.x} y1={p1Px.y} x2={midPx.x} y2={midPx.y} stroke="#38bdf8" strokeWidth="4" />
                  <motion.line x1={p2Px.x} y1={p2Px.y} x2={midPx.x} y2={midPx.y} stroke="#38bdf8" strokeWidth="4" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Rovers */}
            <motion.g animate={discovered ? { x: midPx.x - p1Px.x, y: midPx.y - p1Px.y, opacity: 0.5 } : { x: 0, y: 0 }} transition={{ duration: 0.8, ease: "backIn" }}>
              <circle cx={p1Px.x} cy={p1Px.y} r={18} fill="#3b82f6" />
              <text x={p1Px.x} y={p1Px.y + 5} fontSize="14" textAnchor="middle" fill="#fff">A</text>
              <text x={p1Px.x} y={p1Px.y + 35} fontSize="12" textAnchor="middle" fill="#94a3b8">({rover1.x}, {rover1.y})</text>
            </motion.g>

            <motion.g animate={discovered ? { x: midPx.x - p2Px.x, y: midPx.y - p2Px.y, opacity: 0.5 } : { x: 0, y: 0 }} transition={{ duration: 0.8, ease: "backIn" }}>
              <circle cx={p2Px.x} cy={p2Px.y} r={18} fill="#a855f7" />
              <text x={p2Px.x} y={p2Px.y + 5} fontSize="14" textAnchor="middle" fill="#fff">B</text>
              <text x={p2Px.x} y={p2Px.y + 35} fontSize="12" textAnchor="middle" fill="#94a3b8">({rover2.x}, {rover2.y})</text>
            </motion.g>

          </svg>

          {/* Interactive Pylon (HTML over SVG for easier interaction) */}
          <div 
            ref={svgRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <motion.div
              style={{
                position: 'absolute',
                left: pylonPx.x - 24,
                top: pylonPx.y - 24,
                width: 48,
                height: 48,
                background: 'radial-gradient(circle, #fcd34d 0%, #fbbf24 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDragging ? '0 0 30px #fbbf24' : '0 0 15px rgba(251,191,36,0.5)',
                cursor: discovered ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                border: '3px solid #fff',
                touchAction: 'none'
              }}
              animate={discovered ? { scale: [1, 1.5, 1], rotate: 360 } : { scale: isDragging ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
            </motion.div>
          </div>
        </div>

        {/* Discovery Feedback Panel */}
        <AnimatePresence>
          {discovered && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '24px', background: 'rgba(56,189,248,0.1)', border: '1px solid #38bdf8', padding: '16px 32px', borderRadius: '16px', textAlign: 'center' }}
            >
              <h3 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '1.5rem', fontFamily: 'var(--font-primary)' }}>Perfect Center!</h3>
              <p style={{ color: '#e2e8f0', margin: 0, fontSize: '1.1rem' }}>
                You discovered the midpoint at <strong style={{ color: '#fcd34d', fontSize: '1.3rem' }}>({midpoint.x}, {midpoint.y})</strong>
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={generateMission}
                style={{ marginTop: '16px', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Next Discovery 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}

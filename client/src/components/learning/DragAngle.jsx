import React, { useState, useRef } from 'react';
import './angles-learn.css';

const DragAngle = ({ onInteract }) => {
  const [angle, setAngle] = useState(45);
  const [hasInteracted, setHasInteracted] = useState(false);
  const svgRef = useRef(null);
  
  // Fixed origin
  const cx = 150;
  const cy = 150;
  const radius = 100;

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!e.buttons || !svgRef.current) return;
    
    if (!hasInteracted) {
      setHasInteracted(true);
      if (onInteract) onInteract();
    }

    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    // Calculate pointer position in SVG coordinates
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(CTM.inverse());
    
    // Calculate angle in degrees
    const dx = svgP.x - cx;
    const dy = svgP.y - cy;
    
    let theta = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Adjust so 0 is right, counter-clockwise is positive
    // Math.atan2 gives negative y for up, but SVG y is down
    // So positive dy means pointing down. 
    // We want a standard protractor: right = 0, up = 90, left = 180
    // In SVG: right = 0, up = -90, left = -180 or 180
    
    let calculatedAngle = -theta;
    if (calculatedAngle < 0) calculatedAngle += 360;
    
    // Snap to nice values
    if (Math.abs(calculatedAngle - 90) < 5) calculatedAngle = 90;
    else if (Math.abs(calculatedAngle - 45) < 5) calculatedAngle = 45;
    else if (Math.abs(calculatedAngle - 135) < 5) calculatedAngle = 135;
    else if (Math.abs(calculatedAngle - 180) < 5) calculatedAngle = 180;
    else if (calculatedAngle < 5 || calculatedAngle > 355) calculatedAngle = 0;
    
    // Restrict to 0-180 for this simple tool
    if (calculatedAngle > 180 && calculatedAngle < 270) calculatedAngle = 180;
    if (calculatedAngle >= 270) calculatedAngle = 0;
    
    setAngle(Math.round(calculatedAngle));
  };

  // Convert angle to SVG coordinates
  const rad = (-angle * Math.PI) / 180;
  const targetX = cx + radius * Math.cos(rad);
  const targetY = cy + radius * Math.sin(rad);

  // Arc path
  const arcRadius = 40;
  const arcX = cx + arcRadius * Math.cos(rad);
  const arcY = cy + arcRadius * Math.sin(rad);
  const largeArcFlag = angle > 180 ? 1 : 0;
  const arcPath = `M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 0 ${arcX} ${arcY}`;

  // Color logic
  let angleColor = '#FF7E67'; // Default / obtuse (orange)
  let angleType = 'Obtuse';
  if (angle < 90) {
    angleColor = '#48BB78'; // Acute (green)
    angleType = 'Acute';
  } else if (angle === 90) {
    angleColor = '#4ECDC4'; // Right (blue)
    angleType = 'Right';
  } else if (angle === 180) {
    angleColor = '#9F7AEA'; // Straight (purple)
    angleType = 'Straight';
  }
  
  if (angle === 0) angleType = 'Zero';

  return (
    <div className="interactive-container">
      <div className="instruction-badge">
        {!hasInteracted ? "🖐️ Move the blue arm!" : "✨ You made an angle!"}
      </div>
      
      <svg 
        ref={svgRef}
        viewBox="0 0 300 200" 
        className="angle-svg"
        style={{ touchAction: 'none' }} // Prevent scrolling while dragging
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="300" height="200" fill="url(#grid)" />

        {/* Base arm (fixed) */}
        <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke="#4A5568" strokeWidth="6" strokeLinecap="round" />
        
        {/* Angle Arc */}
        {angle > 0 && (
          <path d={arcPath} fill="none" stroke={angleColor} strokeWidth="6" />
        )}
        
        {/* Right angle square indicator (if 90 deg) */}
        {angle === 90 && (
          <rect x={cx} y={cy - 20} width="20" height="20" fill="none" stroke={angleColor} strokeWidth="3" />
        )}

        {/* Dynamic arm */}
        <line x1={cx} y1={cy} x2={targetX} y2={targetY} stroke="#3182CE" strokeWidth="6" strokeLinecap="round" />
        
        {/* Vertex dot */}
        <circle cx={cx} cy={cy} r="8" fill="#2D3748" />

        {/* Draggable handle */}
        <g 
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove}
          style={{ cursor: 'grab' }}
          className="draggable-handle"
        >
          <circle cx={targetX} cy={targetY} r="24" fill="transparent" /> {/* Large invisible touch target */}
          <circle cx={targetX} cy={targetY} r="12" fill="#3182CE" stroke="#fff" strokeWidth="3" />
          <circle cx={targetX} cy={targetY} r="18" fill="rgba(49, 130, 206, 0.2)" className="pulse-ring" />
        </g>
      </svg>

      <div className="angle-readout" style={{ color: angleColor }}>
        Angle: {angle}° <span className="angle-type-label">({angleType})</span>
      </div>
    </div>
  );
};

export default DragAngle;

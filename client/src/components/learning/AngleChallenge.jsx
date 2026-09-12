import React, { useState, useRef } from 'react';
import './angles-learn.css';

const AngleChallenge = ({ onComplete }) => {
  const [angle, setAngle] = useState(25);
  const [success, setSuccess] = useState(false);
  const svgRef = useRef(null);
  
  // Fixed origin
  const cx = 150;
  const cy = 150;
  const radius = 100;

  const handlePointerDown = (e) => {
    if (success) return;
    e.target.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!e.buttons || !svgRef.current || success) return;
    
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(CTM.inverse());
    
    const dx = svgP.x - cx;
    const dy = svgP.y - cy;
    
    let theta = Math.atan2(dy, dx) * (180 / Math.PI);
    let calculatedAngle = -theta;
    if (calculatedAngle < 0) calculatedAngle += 360;
    
    // Restrict to 0-180
    if (calculatedAngle > 180 && calculatedAngle < 270) calculatedAngle = 180;
    if (calculatedAngle >= 270) calculatedAngle = 0;
    
    setAngle(Math.round(calculatedAngle));

    // Check for success (87 to 93)
    if (Math.round(calculatedAngle) >= 87 && Math.round(calculatedAngle) <= 93) {
      setSuccess(true);
      setAngle(90); // Snap to exactly 90 on success
      if (onComplete) onComplete();
    }
  };

  const handleReset = () => {
    setAngle(25);
    setSuccess(false);
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

  // Message logic
  let message = "Can you make 90°?";
  let messageColor = "var(--clr-text-soft)";
  
  if (success) {
    message = "🎉 Great job! You made a right angle!";
    messageColor = "var(--clr-correct)";
  } else if (angle > 80 && angle < 100) {
    message = "Almost there!";
    messageColor = "var(--clr-accent)";
  } else if (angle > 60 && angle < 120) {
    message = "Keep going!";
    messageColor = "var(--clr-accent)";
  }

  // Progress logic
  // Max difference is 90 (0 to 90, or 180 to 90).
  const difference = Math.abs(90 - angle);
  const progressPercent = Math.max(0, 100 - (difference / 90) * 100);

  return (
    <div className={`challenge-container ${success ? 'success-pulse' : ''}`}>
      <div className="challenge-header" style={{ color: messageColor }}>
        {message}
      </div>
      
      {!success && (
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: progressPercent > 90 ? 'var(--clr-correct)' : 'var(--clr-accent)'
            }} 
          />
        </div>
      )}
      
      <svg 
        ref={svgRef}
        viewBox="0 0 300 200" 
        className="angle-svg"
        style={{ touchAction: 'none' }}
      >
        {/* Target 90deg dashed line */}
        <line x1={cx} y1={cy} x2={cx} y2={cy - radius} stroke="rgba(0,0,0,0.1)" strokeWidth="4" strokeDasharray="8 8" />

        {/* Base arm (fixed) */}
        <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke="#4A5568" strokeWidth="6" strokeLinecap="round" />
        
        {/* Angle Arc */}
        {angle > 0 && (
          <path d={arcPath} fill="none" stroke={success ? "#48BB78" : "#FF7E67"} strokeWidth="6" />
        )}
        
        {/* Right angle square indicator */}
        {angle === 90 && (
          <rect x={cx} y={cy - 20} width="20" height="20" fill="none" stroke="#48BB78" strokeWidth="3" />
        )}

        {/* Dynamic arm */}
        <line x1={cx} y1={cy} x2={targetX} y2={targetY} stroke={success ? "#48BB78" : "#3182CE"} strokeWidth="6" strokeLinecap="round" />
        
        {/* Vertex dot */}
        <circle cx={cx} cy={cy} r="8" fill="#2D3748" />

        {/* Draggable handle */}
        {!success && (
          <g 
            onPointerDown={handlePointerDown} 
            onPointerMove={handlePointerMove}
            style={{ cursor: 'grab' }}
            className="draggable-handle"
          >
            <circle cx={targetX} cy={targetY} r="24" fill="transparent" />
            <circle cx={targetX} cy={targetY} r="12" fill="#3182CE" stroke="#fff" strokeWidth="3" />
          </g>
        )}
      </svg>

      <div className="challenge-controls">
        <div className="angle-readout" style={{ color: success ? "#48BB78" : "#FF7E67", margin: 0 }}>
          {angle}°
        </div>
        {success && (
          <button className="kid-btn-secondary" onClick={handleReset} style={{ fontSize: '1rem', padding: '8px 16px' }}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default AngleChallenge;

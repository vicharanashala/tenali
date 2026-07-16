import React, { useState, useRef, useEffect } from 'react';

const CoordinateGrid = ({ 
  points = [], 
  onClick, 
  cursorType = 'default',
  userTarget = null,
  revealedTarget = null,
  connectPoints = false,
  width = 400,
  height = 400
}) => {
  const [hoverPos, setHoverPos] = useState(null);
  const svgRef = useRef(null);
  
  // The coordinate system goes from -10 to 10 on both axes.
  // We have 20 units total.
  const UNIT = width / 20;
  const cx = width / 2;
  const cy = height / 2;
  
  const toSvgX = (x) => cx + x * UNIT;
  const toSvgY = (y) => cy - y * UNIT;

  const handleMouseMove = (e) => {
    if (cursorType !== 'crosshair') {
      if (hoverPos) setHoverPos(null);
      return;
    }
    const rect = svgRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    let logicalX = (xPx - cx) / UNIT;
    let logicalY = (cy - yPx) / UNIT;
    
    // Snap to nearest 0.5
    logicalX = Math.round(logicalX * 2) / 2;
    logicalY = Math.round(logicalY * 2) / 2;
    
    // Clamp to grid
    logicalX = Math.max(-10, Math.min(10, logicalX));
    logicalY = Math.max(-10, Math.min(10, logicalY));
    
    setHoverPos({ x: logicalX, y: logicalY });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const handleSvgClick = () => {
    if (onClick && hoverPos) {
      onClick(hoverPos);
    }
  };

  // Generate grid lines
  const gridLines = [];
  for (let i = -10; i <= 10; i++) {
    const isAxis = i === 0;
    const pos = i * UNIT;
    // vertical
    gridLines.push(
      <line key={`v${i}`} x1={cx + pos} y1={0} x2={cx + pos} y2={height} 
            stroke={isAxis ? '#F08C46' : '#3A332C'} 
            strokeWidth={isAxis ? 2 : 1} />
    );
    // horizontal
    gridLines.push(
      <line key={`h${i}`} x1={0} y1={cy - pos} x2={width} y2={cy - pos} 
            stroke={isAxis ? '#64B5F6' : '#3A332C'} 
            strokeWidth={isAxis ? 2 : 1} />
    );
  }

  return (
    <div style={{ position: 'relative', width, height, margin: '0 auto', background: '#1A1614', borderRadius: '12px', overflow: 'hidden', border: '2px solid #3A332C', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleSvgClick}
        style={{ cursor: cursorType, display: 'block' }}
      >
        {gridLines}
        
        {/* Axis Labels */}
        <text x={cx + 10 * UNIT - 5} y={cy + 15} fill="#F08C46" fontSize="12" textAnchor="end" fontWeight="bold">x</text>
        <text x={cx + 10} y={15} fill="#64B5F6" fontSize="12" fontWeight="bold">y</text>
        <text x={cx - 10 * UNIT + 5} y={cy + 15} fill="#F08C46" fontSize="12" fontWeight="bold">-10</text>
        <text x={cx + 5} y={cy + 10 * UNIT - 5} fill="#64B5F6" fontSize="12" fontWeight="bold">-10</text>

        {/* Connecting line */}
        {connectPoints && points.length >= 2 && (
          <line 
            x1={toSvgX(points[0].x)} y1={toSvgY(points[0].y)}
            x2={toSvgX(points[1].x)} y2={toSvgY(points[1].y)}
            stroke="#988D84" strokeWidth="2" strokeDasharray="6 6"
          />
        )}

        {/* Given Points */}
        {points.map((pt, i) => (
          <circle key={`pt${i}`} cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r={6} fill="#F4F1ED" stroke="#2D2520" strokeWidth="2" />
        ))}

        {/* Hover / Crosshair */}
        {hoverPos && !userTarget && cursorType === 'crosshair' && (
          <g>
            <circle cx={toSvgX(hoverPos.x)} cy={toSvgY(hoverPos.y)} r={8} fill="none" stroke="rgba(240, 140, 70, 0.6)" strokeWidth="2" />
            <line x1={toSvgX(hoverPos.x) - 12} y1={toSvgY(hoverPos.y)} x2={toSvgX(hoverPos.x) + 12} y2={toSvgY(hoverPos.y)} stroke="rgba(240, 140, 70, 0.6)" strokeWidth="1" />
            <line x1={toSvgX(hoverPos.x)} y1={toSvgY(hoverPos.y) - 12} x2={toSvgX(hoverPos.x)} y2={toSvgY(hoverPos.y) + 12} stroke="rgba(240, 140, 70, 0.6)" strokeWidth="1" />
          </g>
        )}

        {/* User Target (Selected) */}
        {userTarget && (
          <g>
            <circle cx={toSvgX(userTarget.x)} cy={toSvgY(userTarget.y)} r={8} fill="rgba(240, 140, 70, 0.8)" stroke="#FFF" strokeWidth="2" />
            <circle cx={toSvgX(userTarget.x)} cy={toSvgY(userTarget.y)} r={16} fill="none" stroke="#F08C46" strokeWidth="2" opacity="0.6" strokeDasharray="4 2" />
          </g>
        )}

        {/* Revealed Correct Target */}
        {revealedTarget && (
          <g>
            <circle cx={toSvgX(revealedTarget.x)} cy={toSvgY(revealedTarget.y)} r={8} fill="rgba(100, 181, 246, 0.9)" stroke="#FFF" strokeWidth="2" />
            <circle cx={toSvgX(revealedTarget.x)} cy={toSvgY(revealedTarget.y)} r={16} fill="none" stroke="#64B5F6" strokeWidth="2" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default CoordinateGrid;

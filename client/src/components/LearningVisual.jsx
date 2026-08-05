import React from 'react';

const LearningVisual = ({ visual }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'var(--clr-card, #f9f9f9)',
    borderRadius: '12px',
    marginBottom: '1rem',
    border: '1px solid var(--clr-border, #eee)',
    width: '100%',
    overflowX: 'auto'
  };

  const svgBaseStyle = {
    overflow: 'visible',
    fontFamily: 'inherit',
    fontWeight: '600',
    fill: 'var(--clr-text, #333)'
  };

  const strokeColor = 'var(--clr-text, #333)';
  const highlightColor = 'var(--clr-accent, #2ea043)';
  const secondaryColor = '#0275d8';

  if (visual === 'angle-concept') {
    return (
      <div style={containerStyle}>
        <svg width="200" height="120" viewBox="0 0 200 120" style={svgBaseStyle}>
          {/* Base line */}
          <line x1="50" y1="100" x2="180" y2="100" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
          {/* Angled line (approx 45 deg) */}
          <line x1="50" y1="100" x2="140" y2="30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
          {/* Vertex dot */}
          <circle cx="50" cy="100" r="6" fill={highlightColor} />
          {/* Arc */}
          <path d="M 100 100 A 50 50 0 0 0 88 70" fill="none" stroke={highlightColor} strokeWidth="3" />
          {/* Labels */}
          <text x="120" y="80" fill={highlightColor} fontSize="18">Turn (Angle)</text>
          <text x="10" y="115" fontSize="14" fill={strokeColor}>Vertex</text>
        </svg>
      </div>
    );
  }

  if (visual === 'angle-types') {
    return (
      <div style={{ ...containerStyle, gap: '2rem', flexWrap: 'wrap' }}>
        {/* Acute */}
        <svg width="100" height="100" viewBox="0 0 100 100" style={svgBaseStyle}>
          <line x1="10" y1="80" x2="90" y2="80" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="10" y1="80" x2="60" y2="20" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M 40 80 A 30 30 0 0 0 35 50" fill="none" stroke={highlightColor} strokeWidth="2" />
          <text x="45" y="65" fontSize="14" fill={highlightColor}>&lt; 90°</text>
          <text x="35" y="95" fontSize="12" fill={strokeColor}>Acute</text>
        </svg>
        {/* Right */}
        <svg width="100" height="100" viewBox="0 0 100 100" style={svgBaseStyle}>
          <line x1="20" y1="80" x2="90" y2="80" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="80" x2="20" y2="10" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Square marker */}
          <polyline points="20,60 40,60 40,80" fill="none" stroke={highlightColor} strokeWidth="2" />
          <text x="45" y="45" fontSize="14" fill={highlightColor}>90°</text>
          <text x="40" y="95" fontSize="12" fill={strokeColor}>Right</text>
        </svg>
        {/* Obtuse */}
        <svg width="120" height="100" viewBox="0 0 120 100" style={svgBaseStyle}>
          <line x1="50" y1="80" x2="110" y2="80" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="80" x2="20" y2="30" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M 75 80 A 25 25 0 0 0 35 55" fill="none" stroke={highlightColor} strokeWidth="2" />
          <text x="50" y="50" fontSize="14" fill={highlightColor}>&gt; 90°</text>
          <text x="55" y="95" fontSize="12" fill={strokeColor}>Obtuse</text>
        </svg>
      </div>
    );
  }

  if (visual === 'straight-line') {
    return (
      <div style={containerStyle}>
        <svg width="250" height="120" viewBox="0 0 250 120" style={svgBaseStyle}>
          {/* Straight line */}
          <line x1="20" y1="100" x2="230" y2="100" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Intersecting line */}
          <line x1="125" y1="100" x2="185" y2="30" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="125" cy="100" r="5" fill={strokeColor} />
          
          {/* 110 deg Arc */}
          <path d="M 85 100 A 40 40 0 0 1 155 65" fill="none" stroke={secondaryColor} strokeWidth="3" />
          <text x="80" y="65" fontSize="16" fill={secondaryColor}>110°</text>
          
          {/* 70 deg Arc */}
          <path d="M 155 65 A 40 40 0 0 1 165 100" fill="none" stroke={highlightColor} strokeWidth="3" />
          <text x="175" y="80" fontSize="16" fill={highlightColor}>70°</text>

          <text x="125" y="115" fontSize="14" textAnchor="middle" fill={strokeColor}>110° + 70° = 180°</text>
        </svg>
      </div>
    );
  }

  if (visual === 'worked-example') {
    return (
      <div style={containerStyle}>
        <svg width="250" height="120" viewBox="0 0 250 120" style={svgBaseStyle}>
          {/* Straight line */}
          <line x1="20" y1="100" x2="230" y2="100" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Intersecting line */}
          <line x1="125" y1="100" x2="195" y2="30" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="125" cy="100" r="5" fill={strokeColor} />
          
          {/* 135 deg Arc */}
          <path d="M 75 100 A 50 50 0 0 1 165 60" fill="none" stroke={secondaryColor} strokeWidth="3" />
          <text x="80" y="55" fontSize="16" fill={secondaryColor}>135°</text>
          
          {/* ? / 45 deg Arc */}
          <path d="M 165 60 A 50 50 0 0 1 175 100" fill="none" stroke={highlightColor} strokeWidth="3" />
          <text x="185" y="80" fontSize="16" fill={highlightColor}>45°</text>
        </svg>
      </div>
    );
  }

  if (visual === 'pitfall') {
    return (
      <div style={{ ...containerStyle, gap: '3rem', flexWrap: 'wrap' }}>
        {/* Straight line = 180 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="120" height="80" viewBox="0 0 120 80" style={svgBaseStyle}>
            <line x1="10" y1="60" x2="110" y2="60" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="60" r="4" fill={strokeColor} />
            <path d="M 20 60 A 40 40 0 0 1 100 60" fill="none" stroke={highlightColor} strokeWidth="3" />
            <text x="60" y="30" fontSize="14" textAnchor="middle" fill={highlightColor}>180°</text>
          </svg>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Straight Line</span>
        </div>
        
        {/* Full circle = 360 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="120" height="80" viewBox="0 0 120 80" style={svgBaseStyle}>
            <line x1="10" y1="40" x2="110" y2="40" stroke={strokeColor} strokeWidth="2" strokeDasharray="4" />
            <circle cx="60" cy="40" r="4" fill={strokeColor} />
            <path d="M 60 10 A 30 30 0 1 1 59.9 10" fill="none" stroke={secondaryColor} strokeWidth="3" />
            <text x="60" y="45" fontSize="14" textAnchor="middle" fill={secondaryColor}>360°</text>
          </svg>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Full Circle</span>
        </div>
      </div>
    );
  }

  return null;
};

export default LearningVisual;

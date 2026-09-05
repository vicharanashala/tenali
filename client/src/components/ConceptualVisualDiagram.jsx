import React from 'react';

/**
 * ConceptualVisualDiagram Component
 * Renders dynamic SVG graphics for Grade 1-3 conceptual math questions.
 */
export default function ConceptualVisualDiagram({ visualType, visualData }) {
  if (!visualType || !visualData) return null;

  switch (visualType) {
    case 'fraction-pie': {
      const { numerator = 1, denominator = 4, size = 160, shadedColor = '#3B82F6', unshadedColor = '#E2E8F0' } = visualData;
      const radius = size / 2 - 10;
      const center = size / 2;
      const slices = [];

      for (let i = 0; i < denominator; i++) {
        const startAngle = (i * 2 * Math.PI) / denominator - Math.PI / 2;
        const endAngle = ((i + 1) * 2 * Math.PI) / denominator - Math.PI / 2;

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);

        const largeArcFlag = 2 * Math.PI / denominator > Math.PI ? 1 : 0;
        const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

        const isShaded = i < numerator;
        slices.push(
          <path
            key={i}
            d={pathData}
            fill={isShaded ? shadedColor : unshadedColor}
            stroke="#1E293B"
            strokeWidth="2.5"
            style={{ transition: 'fill 0.3s ease' }}
          />
        );
      }

      return (
        <div className="conceptual-diagram-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#0F172A" strokeWidth="3" />
          </svg>
        </div>
      );
    }

    case 'fraction-bar': {
      const { numerator = 3, denominator = 5, width = 240, height = 50, shadedColor = '#10B981' } = visualData;
      const segmentWidth = (width - 4) / denominator;

      return (
        <div className="conceptual-diagram-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <rect x="2" y="2" width={width - 4} height={height - 4} rx="6" fill="#F1F5F9" stroke="#1E293B" strokeWidth="3" />
            {Array.from({ length: denominator }).map((_, i) => {
              const isShaded = i < numerator;
              return (
                <g key={i}>
                  <rect
                    x={2 + i * segmentWidth}
                    y="2"
                    width={segmentWidth}
                    height={height - 4}
                    fill={isShaded ? shadedColor : 'transparent'}
                    stroke="#1E293B"
                    strokeWidth="2"
                    rx={i === 0 ? '4' : i === denominator - 1 ? '4' : '0'}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    case 'group-counting': {
      const { groups = 3, itemsPerGroup = 2, icon = '🍎', label = '' } = visualData;

      return (
        <div className="conceptual-diagram-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            {Array.from({ length: groups }).map((_, gIdx) => (
              <div
                key={gIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 14px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px dashed #3B82F6',
                  borderRadius: '12px',
                  gap: '6px',
                  fontSize: '1.8rem'
                }}
              >
                {Array.from({ length: itemsPerGroup }).map((_, iIdx) => (
                  <span key={iIdx} role="img" aria-label="count-item">{icon}</span>
                ))}
              </div>
            ))}
          </div>
          {label && <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--clr-fg-muted)' }}>{label}</div>}
        </div>
      );
    }

    case 'number-line': {
      const { start = 0, end = 10, point = 4, jump = null, width = 280, height = 70 } = visualData;
      const padding = 25;
      const lineLength = width - padding * 2;
      const step = lineLength / (end - start);

      const getX = (val) => padding + (val - start) * step;

      return (
        <div className="conceptual-diagram-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Main Axis */}
            <line x1={padding - 10} y1="45" x2={width - padding + 10} y2="45" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Ticks and Labels */}
            {Array.from({ length: end - start + 1 }).map((_, i) => {
              const val = start + i;
              const x = getX(val);
              return (
                <g key={val}>
                  <line x1={x} y1="38" x2={x} y2="52" stroke="#1E293B" strokeWidth="2.5" />
                  <text x={x} y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--clr-fg)">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Optional Jump Arc */}
            {jump && (
              <path
                d={`M ${getX(jump.from)} 38 Q ${getX((jump.from + jump.to) / 2)} 5, ${getX(jump.to)} 38`}
                fill="none"
                stroke="#EC4899"
                strokeWidth="3.5"
                strokeDasharray="4 2"
              />
            )}

            {/* Marked Point */}
            {point !== null && point !== undefined && (
              <circle cx={getX(point)} cy="45" r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            )}
          </svg>
        </div>
      );
    }

    default:
      return null;
  }
}

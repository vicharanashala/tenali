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
      const {
        groups = 3,
        itemsPerGroup = 2,
        icon = '🍎',
        label = '',
        groupColor = '#EF4444',
        highlightedGroups = 1,
        itemType = 'apple'
      } = visualData;

      return (
        <div className="conceptual-diagram-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', gap: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            {Array.from({ length: groups }).map((_, gIdx) => {
              const isHighlighted = gIdx < highlightedGroups;
              const currentIcon = isHighlighted ? (itemType === 'apple' ? '🍎' : icon) : (itemType === 'apple' ? '🍏' : icon);

              return (
                <div
                  key={gIdx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 16px',
                      background: isHighlighted ? 'rgba(239, 68, 68, 0.18)' : 'rgba(100, 116, 139, 0.08)',
                      border: isHighlighted ? `2.5px solid ${groupColor || '#EF4444'}` : '2px dashed #64748B',
                      boxShadow: isHighlighted ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none',
                      borderRadius: '12px',
                      gap: '8px',
                      fontSize: '2rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {Array.from({ length: itemsPerGroup }).map((_, iIdx) => (
                      <span key={iIdx} role="img" aria-label="count-item">{currentIcon}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {label && <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--clr-fg-muted)' }}>{label}</div>}
        </div>
      );
    }

    case 'number-line': {
      const {
        start = 0,
        end = 1,
        step = 0.25,
        mark = null,
        point = null,
        jump = null,
        width = 460,
        height = 130
      } = visualData;

      const padding = 45;
      const lineY = 88;
      const lineLength = width - padding * 2;
      const range = Math.max(0.001, end - start);
      const effectiveMark = mark !== null && mark !== undefined ? mark : point;
      const stepVal = step || (range <= 1 ? 0.25 : 1);

      const getX = (val) => padding + ((val - start) / range) * lineLength;

      // Generate tick marks for each division
      const ticks = [];
      const numSteps = Math.min(100, Math.round(range / stepVal));
      for (let i = 0; i <= numSteps; i++) {
        const val = Number((start + i * stepVal).toFixed(4));
        ticks.push(val);
      }

      // Calculate partition hop arcs up to effectiveMark
      const hopArcs = [];
      if (effectiveMark !== null && effectiveMark !== undefined && effectiveMark > start) {
        const totalHops = Math.round((effectiveMark - start) / stepVal);
        for (let h = 0; h < totalHops; h++) {
          const hStart = start + h * stepVal;
          const hEnd = start + (h + 1) * stepVal;
          const xS = getX(hStart);
          const xE = getX(hEnd);
          const xM = (xS + xE) / 2;
          const arcH = Math.min(32, (xE - xS) * 0.42);
          const arcBase = lineY - 6;
          hopArcs.push({
            id: h,
            path: `M ${xS} ${arcBase} Q ${xM} ${arcBase - arcH * 2} ${xE} ${arcBase}`,
            labelX: xM,
            labelY: arcBase - arcH - 4,
            hopNum: h + 1
          });
        }
      }

      // Remaining dashed partition arcs from star to end (showing the whole)
      const remainingArcs = [];
      if (effectiveMark !== null && effectiveMark !== undefined && effectiveMark < end) {
        const startIdx = Math.round((effectiveMark - start) / stepVal);
        const totalSteps = Math.round((end - start) / stepVal);
        for (let h = startIdx; h < totalSteps; h++) {
          const hStart = start + h * stepVal;
          const hEnd = start + (h + 1) * stepVal;
          const xS = getX(hStart);
          const xE = getX(hEnd);
          const xM = (xS + xE) / 2;
          const arcH = Math.min(26, (xE - xS) * 0.35);
          const arcBase = lineY - 6;
          remainingArcs.push({
            id: h,
            path: `M ${xS} ${arcBase} Q ${xM} ${arcBase - arcH * 2} ${xE} ${arcBase}`
          });
        }
      }

      return (
        <div className="conceptual-diagram-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '16px auto', maxWidth: '100%', overflowX: 'auto' }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
              {/* Star Glow Filter */}
              <filter id="star-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.7"/>
              </filter>
              {/* Star Gradient */}
              <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              {/* Arrow markers */}
              <marker id="arrow-right" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 1 2 L 8 5 L 1 8 z" fill="#94A3B8" />
              </marker>
              <marker id="arrow-left" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 9 2 L 2 5 L 9 8 z" fill="#94A3B8" />
              </marker>
            </defs>

            {/* Remaining Partition Arcs (Subtle Ghost Arcs to show the full unit) */}
            {remainingArcs.map(arc => (
              <path
                key={`rem-${arc.id}`}
                d={arc.path}
                fill="none"
                stroke="rgba(148, 163, 184, 0.35)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            ))}

            {/* Taken Hop Arcs (Vibrant Amber / Gold) */}
            {hopArcs.map(arc => (
              <g key={`hop-${arc.id}`}>
                <path
                  d={arc.path}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Hop Step Number Badge */}
                <circle cx={arc.labelX} cy={arc.labelY} r="9" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
                <text x={arc.labelX} y={arc.labelY + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F59E0B">
                  {arc.hopNum}
                </text>
              </g>
            ))}

            {/* Main Axis Line with high contrast */}
            <line
              x1={padding - 18}
              y1={lineY}
              x2={width - padding + 18}
              y2={lineY}
              stroke="#94A3B8"
              strokeWidth="3"
              strokeLinecap="round"
              markerEnd="url(#arrow-right)"
              markerStart="url(#arrow-left)"
            />

            {/* Ticks and Labels */}
            {ticks.map((val) => {
              const x = getX(val);
              const isMajor = Math.abs(val - start) < 0.001 || Math.abs(val - end) < 0.001;
              return (
                <g key={val}>
                  <line
                    x1={x}
                    y1={isMajor ? lineY - 12 : lineY - 7}
                    x2={x}
                    y2={isMajor ? lineY + 12 : lineY + 7}
                    stroke={isMajor ? "#F8FAFC" : "#64748B"}
                    strokeWidth={isMajor ? "3" : "2"}
                    strokeLinecap="round"
                  />
                  {isMajor && (
                    <g transform={`translate(${x}, ${lineY + 26})`}>
                      <rect x="-14" y="-12" width="28" height="22" rx="6" fill="rgba(30, 41, 59, 0.85)" stroke="#64748B" strokeWidth="1.5" />
                      <text x="0" y="3" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#F8FAFC">
                        {val}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Optional Custom Jump Arc if provided in visualData */}
            {jump && (
              <path
                d={`M ${getX(jump.from)} ${lineY - 8} Q ${getX((jump.from + jump.to) / 2)} ${lineY - 45}, ${getX(jump.to)} ${lineY - 8}`}
                fill="none"
                stroke="#EC4899"
                strokeWidth="3.5"
                strokeDasharray="5 3"
              />
            )}

            {/* Marked Star / Target Pointer */}
            {effectiveMark !== null && effectiveMark !== undefined && (
              <g transform={`translate(${getX(effectiveMark)}, ${lineY})`}>
                {/* Vertical pointer pin */}
                <line x1="0" y1="-32" x2="0" y2="0" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 2" />
                
                {/* Target Dot on Axis */}
                <circle cx="0" cy="0" r="5.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />

                {/* Big Golden Star */}
                <g transform="translate(0, -36)">
                  <path
                    d="M 0,-18 L 5.5,-5.5 L 19,-4 L 9,5.5 L 12,18 L 0,11 L -12,18 L -9,5.5 L -19,-4 L -5.5,-5.5 Z"
                    fill="url(#star-grad)"
                    stroke="#D97706"
                    strokeWidth="1.5"
                    filter="url(#star-glow)"
                  />
                </g>
              </g>
            )}
          </svg>
        </div>
      );
    }

    default:
      return null;
  }
}

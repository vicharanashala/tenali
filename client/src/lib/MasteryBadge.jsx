import React from 'react';

/**
 * MasteryBadge — displays BKT mastery as a circular progress indicator.
 *
 * @param {number} mastery  – value between 0 and 1 (e.g. 0.42 = 42%)
 * @param {string} [label]  – optional text below the percentage (default: "Mastery")
 * @param {number} [size]   – diameter in px (default: 72)
 */
export default function MasteryBadge({ mastery = 0, label = 'Mastery', size = 72 }) {
  const pct = Math.round(mastery * 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (mastery * circumference);

  // Color ramp: red → amber → green
  const hue = mastery * 120; // 0 = red, 60 = yellow, 120 = green
  const strokeColor = `hsl(${hue}, 80%, 50%)`;
  const bgStroke = 'var(--clr-border, #ddd)';

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgStroke}
            strokeWidth="5"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
          />
        </svg>
        {/* Percentage text centred over the SVG */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: size * 0.26,
          color: 'var(--clr-text, #333)',
        }}>
          {pct}%
        </div>
      </div>
      {label && (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--clr-text-soft, #888)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

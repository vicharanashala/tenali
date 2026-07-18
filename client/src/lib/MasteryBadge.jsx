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

  // Color ramp: red → amber → green
  const hue = mastery * 120; // 0 = red, 60 = yellow, 120 = green
  const barColor = `hsl(${hue}, 80%, 50%)`;
  const bgBar = 'var(--clr-border, #444)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      maxWidth: '300px',
    }}>
      <div style={{
        flexGrow: 1,
        height: '8px',
        background: bgBar,
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${pct}%`,
          background: barColor,
          transition: 'width 0.6s ease, background 0.6s ease',
          borderRadius: '4px',
        }} />
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        minWidth: '50px'
      }}>
        <span style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--clr-text, #eee)',
          lineHeight: '1.2'
        }}>
          {pct}%
        </span>
        {label && (
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--clr-text-soft, #888)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: '1.2'
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}


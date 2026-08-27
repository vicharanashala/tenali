import React from 'react';
import { getStudentImage } from './assets/avatarAssets';

/**
 * StudentAvatar Component
 * ═══════════════════════
 * The student is the *reacting* half of the pair: for every state Tenali can
 * be in, there is a counterpart here. Tenali leads (thinks, hints, writes,
 * gambles); the student responds (waits, leans in, takes notes, gets nervous).
 *
 * 14 canonical expressions, matching TenaliAvatar's 14:
 *   attentive · pondering · confident · curious · triumphant · puzzled
 *   noting · nervous · dejected · amazed · blinking · suspicious
 *   delighted · determined
 *
 * ALIASES maps Tenali-flavoured names onto the student equivalent, so passing
 * a Tenali word ('writing', 'shocked', 'closed-eyes') resolves to a sensible
 * student face rather than falling through. Anything unrecognised falls back
 * to 'attentive' — previously an unknown name rendered a blank, featureless
 * head, which is how a missing expression could go unnoticed.
 */

const ALIASES = {
  listening: 'attentive',
  watching: 'attentive',
  waiting: 'attentive',
  thinking: 'pondering',
  sure: 'confident',
  interested: 'curious',
  victorious: 'triumphant',
  celebrating: 'triumphant',
  confused: 'puzzled',
  writing: 'noting',
  jotting: 'noting',
  worried: 'nervous',
  anxious: 'nervous',
  gamble: 'nervous',
  sad: 'dejected',
  defeated: 'dejected',
  loss: 'dejected',
  shocked: 'amazed',
  surprised: 'amazed',
  'closed-eyes': 'blinking',
  idle: 'blinking',
  doubtful: 'suspicious',
  skeptical: 'suspicious',
  cheated: 'suspicious',
  proud: 'delighted',
  impressed: 'delighted',
  beaming: 'delighted',
  focused: 'determined',
  ready: 'determined'
};

const KNOWN = new Set([
  'attentive', 'pondering', 'confident', 'curious', 'triumphant', 'puzzled',
  'noting', 'nervous', 'dejected', 'amazed', 'blinking', 'suspicious',
  'delighted', 'determined'
]);

/** Resolve any incoming name to one of the 14 canonical faces. */
function resolveStudentExpression(expression) {
  const key = String(expression || '').toLowerCase();
  if (KNOWN.has(key)) return key;
  return ALIASES[key] || 'attentive';
}

const DARK = '#261b14';
const BROW = '#4a301e';
const ORANGE = '#ea580c';

export default function StudentAvatar({ expression = 'attentive', size = 110 }) {
  const expr = resolveStudentExpression(expression);

  // An illustrated portrait wins when one exists for this face; the SVG below
  // covers every face that has not been drawn yet. See avatarAssets.js.
  const artwork = getStudentImage(expr);
  if (artwork) {
    const box = size ? `${size}px` : '110px';
    return (
      <div
        className={`student-avatar-wrapper student-avatar-photo ${expr}-state`}
        style={{
          width: box,
          height: box,
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <img
          src={artwork}
          alt=""
          aria-hidden="true"
          draggable="false"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.22)',
            borderRadius: '50%',
            display: 'block'
          }}
        />
      </div>
    );
  }

  // Defaults — the 'attentive' face; each branch overrides what it changes.
  let eyes = (
    <g>
      <circle cx="50" cy="50" r="3.5" fill={DARK} />
      <circle cx="70" cy="50" r="3.5" fill={DARK} />
    </g>
  );
  let brows = null;
  let mouth = <path d="M 52 64 Q 60 70, 68 64" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
  let extras = null;

  if (expr === 'pondering') {
    eyes = (
      <g>
        <circle cx="50" cy="48" r="3.5" fill={DARK} />
        <circle cx="70" cy="48" r="3.5" fill={DARK} />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 45 42 Q 50 40, 55 44" />
        <path d="M 65 44 Q 70 40, 75 42" />
      </g>
    );
    mouth = <path d="M 54 65 L 66 63" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
    // hand resting on the chin
    extras = <circle cx="72" cy="72" r="7" fill="#fbd5b5" stroke={ORANGE} strokeWidth="1.5" />;
  } else if (expr === 'confident') {
    eyes = (
      <g fill="none" stroke={DARK} strokeWidth="3" strokeLinecap="round">
        <path d="M 45 48 Q 50 45, 55 48" />
        <path d="M 65 48 Q 70 45, 75 48" />
      </g>
    );
    mouth = <path d="M 52 62 Q 62 68, 70 60" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
  } else if (expr === 'curious') {
    eyes = (
      <g>
        <circle cx="50" cy="50" r="5" fill="#ffffff" stroke={DARK} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="2.5" fill={DARK} />
        <circle cx="70" cy="50" r="5" fill="#ffffff" stroke={DARK} strokeWidth="1.5" />
        <circle cx="70" cy="50" r="2.5" fill={DARK} />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 44 42 Q 50 38, 56 42" />
        <path d="M 64 42 Q 70 38, 76 42" />
      </g>
    );
    mouth = <ellipse cx="60" cy="65" rx="4" ry="5" fill={DARK} />;
  } else if (expr === 'triumphant') {
    eyes = (
      <g fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round">
        <path d="M 45 52 L 50 46 L 55 52" />
        <path d="M 65 52 L 70 46 L 75 52" />
      </g>
    );
    mouth = <path d="M 50 62 Q 60 74, 70 62 Z" fill={ORANGE} />;
    extras = (
      <g opacity="0.6" fill="#f87171">
        <circle cx="42" cy="56" r="4" />
        <circle cx="78" cy="56" r="4" />
      </g>
    );
  } else if (expr === 'puzzled') {
    eyes = (
      <g fill={DARK}>
        <circle cx="49" cy="50" r="4.5" />
        <circle cx="71" cy="50" r="2.5" />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 44 44 Q 50 40, 55 46" />
        <path d="M 66 42 Q 72 40, 76 44" />
      </g>
    );
    mouth = <path d="M 52 64 Q 56 67, 60 63 Q 64 59, 68 64" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
  } else if (expr === 'noting') {
    // Head down, tongue of concentration out, scribbling on a pad
    eyes = (
      <g fill="none" stroke={DARK} strokeWidth="3" strokeLinecap="round">
        <path d="M 45 53 Q 50 50, 55 53" />
        <path d="M 65 53 Q 70 50, 75 53" />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 44 45 L 56 44" />
        <path d="M 64 44 L 76 45" />
      </g>
    );
    mouth = (
      <g>
        <path d="M 53 64 Q 60 68, 67 64" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="64" cy="68" rx="3" ry="2.5" fill="#f87171" />
      </g>
    );
    extras = (
      <g>
        <rect x="86" y="74" width="18" height="22" rx="2" fill="#fcf8e3" stroke={DARK} strokeWidth="1.5" />
        <g stroke={DARK} strokeWidth="1" opacity="0.4">
          <line x1="89" y1="80" x2="101" y2="80" />
          <line x1="89" y1="85" x2="101" y2="85" />
          <line x1="89" y1="90" x2="101" y2="90" />
        </g>
        <path d="M 99 68 L 93 80 L 91 82 L 94 80 Z" fill={ORANGE} stroke={DARK} strokeWidth="1" />
      </g>
    );
  } else if (expr === 'nervous') {
    eyes = (
      <g fill={DARK}>
        <circle cx="50" cy="51" r="2.5" />
        <circle cx="70" cy="51" r="2.5" />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 44 41 Q 50 45, 56 43" />
        <path d="M 64 43 Q 70 45, 76 41" />
      </g>
    );
    mouth = <path d="M 52 65 Q 55 62, 58 65 Q 61 68, 64 65 Q 67 62, 69 65" fill="none" stroke={DARK} strokeWidth="2.2" strokeLinecap="round" />;
    extras = <path d="M 84 42 C 84 42 88 49 84 52 C 81 54 79 50 84 42" fill="#38bdf8" opacity="0.85" />;
  } else if (expr === 'dejected') {
    // Eyes cast down, brows sloping in, small frown
    eyes = (
      <g fill="none" stroke={DARK} strokeWidth="3" strokeLinecap="round">
        <path d="M 45 51 Q 50 55, 55 51" />
        <path d="M 65 51 Q 70 55, 75 51" />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 44 42 Q 50 44, 56 46" />
        <path d="M 64 46 Q 70 44, 76 42" />
      </g>
    );
    mouth = <path d="M 53 68 Q 60 62, 67 68" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
  } else if (expr === 'amazed') {
    eyes = (
      <g>
        <circle cx="50" cy="50" r="7" fill="#ffffff" stroke={DARK} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3.5" fill={DARK} />
        <circle cx="70" cy="50" r="7" fill="#ffffff" stroke={DARK} strokeWidth="1.5" />
        <circle cx="70" cy="50" r="3.5" fill={DARK} />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 43 39 Q 50 34, 57 39" />
        <path d="M 63 39 Q 70 34, 77 39" />
      </g>
    );
    mouth = <ellipse cx="60" cy="67" rx="5.5" ry="6.5" fill={DARK} />;
  } else if (expr === 'blinking') {
    eyes = (
      <g fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round">
        <path d="M 45 50 Q 50 54, 55 50" />
        <path d="M 65 50 Q 70 54, 75 50" />
      </g>
    );
    mouth = <path d="M 54 64 Q 60 68, 66 64" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
  } else if (expr === 'suspicious') {
    // Half-lidded side-eye, one brow up, flat mouth
    eyes = (
      <g>
        <path d="M 44 48 L 56 48" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 64 48 L 76 48" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="53" cy="52" r="3" fill={DARK} />
        <circle cx="73" cy="52" r="3" fill={DARK} />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 44 41 L 56 43" />
        <path d="M 64 40 Q 70 36, 76 39" />
      </g>
    );
    mouth = <path d="M 54 65 L 67 64" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />;
  } else if (expr === 'delighted') {
    // Star-struck eyes and a broad grin
    eyes = (
      <g fill="#fbbf24" stroke={DARK} strokeWidth="1">
        <path d="M 50 44 L 52.2 49 L 57 50 L 52.2 51.6 L 50 56.5 L 47.8 51.6 L 43 50 L 47.8 49 Z" />
        <path d="M 70 44 L 72.2 49 L 77 50 L 72.2 51.6 L 70 56.5 L 67.8 51.6 L 63 50 L 67.8 49 Z" />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round">
        <path d="M 43 38 Q 50 34, 57 38" />
        <path d="M 63 38 Q 70 34, 77 38" />
      </g>
    );
    mouth = <path d="M 49 62 Q 60 75, 71 62 Z" fill={ORANGE} />;
    extras = (
      <g opacity="0.6" fill="#f87171">
        <circle cx="41" cy="58" r="4.5" />
        <circle cx="79" cy="58" r="4.5" />
      </g>
    );
  } else if (expr === 'determined') {
    eyes = (
      <g fill={DARK}>
        <circle cx="50" cy="50" r="4" />
        <circle cx="70" cy="50" r="4" />
      </g>
    );
    brows = (
      <g fill="none" stroke={BROW} strokeWidth="2.4" strokeLinecap="round">
        <path d="M 44 40 L 56 45" />
        <path d="M 64 45 L 76 40" />
      </g>
    );
    mouth = <path d="M 53 65 L 67 65" fill="none" stroke={DARK} strokeWidth="2.8" strokeLinecap="round" />;
  }

  return (
    <div
      className={`student-avatar-wrapper ${expr}-state`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))' }}
      >
        {/* Background fill */}
        <circle cx="60" cy="60" r="54" fill="#241a13" />

        {/* Shoulders & Detective Coat */}
        <path d="M 28 102 C 28 85, 42 75, 60 75 C 78 75, 92 85, 92 102 Z" fill="#38271c" stroke={ORANGE} strokeWidth="2" />
        {/* Collar / Tie */}
        <path d="M 52 75 L 60 88 L 68 75 Z" fill="#f97316" />

        {/* Head */}
        <ellipse cx="60" cy="52" rx="26" ry="28" fill="#fbd5b5" />

        {/* Hair / Detective Cap */}
        <path d="M 32 46 C 32 30, 44 20, 60 20 C 76 20, 88 30, 88 46 C 82 40, 72 38, 60 38 C 48 38, 38 40, 32 46 Z" fill={BROW} />
        <path d="M 24 44 C 36 38, 84 38, 96 44 L 92 48 C 80 44, 40 44, 28 48 Z" fill={ORANGE} />

        {brows}
        {eyes}
        {mouth}
        {extras}
      </svg>
    </div>
  );
}

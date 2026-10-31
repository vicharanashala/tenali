import React from 'react';

/**
 * Clean SVG icons replacing all emojis across the Division module.
 */

export function IconCandy({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      {/* Wrapper twists */}
      <path d="M 8 16 L 2 11 C 1.5 14 1.5 18 2 21 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="0.8" />
      <path d="M 24 16 L 30 11 C 30.5 14 30.5 18 30 21 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="0.8" />
      {/* Candy sphere */}
      <circle cx="16" cy="16" r="10" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
      {/* Swirl stripes */}
      <path d="M 10 10 Q 16 13 16 16 Q 16 19 22 22" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 22 10 Q 16 13 16 16 Q 16 19 10 22" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1" fill="#ffffff" />
    </svg>
  );
}

export const IconChocolate = IconCandy;


export function IconJar({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      {/* Lid */}
      <rect x="10" y="4" width="12" height="4" rx="2" fill="#d4924b" stroke="#875122" strokeWidth="1" />
      <rect x="8" y="7" width="16" height="3" rx="1.5" fill="#f0ad65" />
      {/* Jar Body */}
      <path
        d="M 9 10 C 9 10 7 13 7 17 C 7 24 9 27 16 27 C 23 27 25 24 25 17 C 25 13 23 10 23 10 Z"
        fill="rgba(255,255,255,0.12)"
        stroke="#4f8dff"
        strokeWidth="1.6"
      />
      {/* Reflection highlight */}
      <path d="M 10 13 Q 9 18 10 23" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlate({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="16" cy="17" rx="13" ry="8" fill="#e2ded9" stroke="#9e9890" strokeWidth="1.2" />
      <ellipse cx="16" cy="17" rx="9" ry="5.2" fill="#faf7f2" stroke="#cfc9bf" strokeWidth="1" />
    </svg>
  );
}

export function IconLock({ size = 16, locked = true, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      {locked ? (
        <>
          <rect x="4" y="8" width="12" height="10" rx="2.5" fill="#f59e0b" />
          <path d="M 6.5 8 V 5.5 C 6.5 3.5 8 2 10 2 C 12 2 13.5 3.5 13.5 5.5 V 8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="12.5" r="1.2" fill="#78350f" />
          <path d="M 10 13.7 V 15.5" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="4" y="8" width="12" height="10" rx="2.5" fill="#22c55e" />
          <path d="M 6.5 8 V 5 C 6.5 3.2 8 2 10 2 C 12 2 13.5 3.2 13.5 5 V 6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="12.5" r="1.2" fill="#14532d" />
          <path d="M 10 13.7 V 15.5" stroke="#14532d" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function IconHand({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M6 14v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-3a2 2 0 0 0-4 0" />
    </svg>
  );
}

export function IconEmotion({ emotion = 'happy', size = 20, className = '' }) {
  const isHappy = emotion === 'happy';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" fill={isHappy ? '#22c55e' : '#ef4444'} />
      {/* Eyes */}
      {isHappy ? (
        <>
          <path d="M 10 13 Q 13 10 16 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M 16 13 Q 19 10 22 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          {/* Smile */}
          <path d="M 11 18 Q 16 25 21 18" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="11.5" cy="13" r="1.8" fill="#ffffff" />
          <circle cx="20.5" cy="13" r="1.8" fill="#ffffff" />
          {/* Sad Frown */}
          <path d="M 11 22 Q 16 16 21 22" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Tear */}
          <path d="M 23 15 C 23 15 24.5 17 24.5 18 C 24.5 19 23.8 19.8 23 19.8 C 22.2 19.8 21.5 19 21.5 18 C 21.5 17 23 15 23 15 Z" fill="#93c5fd" />
        </>
      )}
    </svg>
  );
}

export function IconCelebration({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      {/* Popper Cone */}
      <path d="M 6 26 L 14 14 L 20 20 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" />
      {/* Ribbons / Stars */}
      <circle cx="22" cy="10" r="2" fill="#ef4444" />
      <circle cx="17" cy="7" r="1.5" fill="#3b82f6" />
      <circle cx="25" cy="16" r="1.8" fill="#10b981" />
      <path d="M 20 12 Q 23 8 27 9" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 16 10 Q 18 5 21 6" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconReplay({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export function IconPlay({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

export function IconPause({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export function IconArrowRight({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function IconSparkles({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#f59e0b"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <path d="M12 2L14.2 8.3L20 10.5L14.2 12.7L12 19L9.8 12.7L4 10.5L9.8 8.3L12 2Z" />
      <path d="M19 18L17.5 15L14.5 13.5L17.5 12L19 9L20.5 12L23.5 13.5L20.5 15L19 18Z" opacity="0.8" />
    </svg>
  );
}

export function IconCap({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export function IconGroup({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconTarget({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconQuiz({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="9" y1="11" x2="11" y2="11" />
    </svg>
  );
}

export function IconDragHand({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      {/* Hand finger pointing/dragging */}
      <path
        d="M 12 18 L 12 6 C 12 4.5 13.5 3.5 15 3.5 C 16.5 3.5 18 4.5 18 6 L 18 14 L 19 14 C 20.2 14 21 15 21 16.2 L 21 17 C 21.8 17 22.5 17.8 22.5 18.8 L 22.5 20 C 23.3 20 24 20.8 24 21.8 L 24 23 C 24 27.5 20.5 30 16 30 C 12.5 30 9 27.5 9 24 L 9 20 C 9 18.5 10.5 17.5 12 18 Z"
        fill="#fcd34d"
        stroke="#b45309"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCheck({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`division-icon-svg ${className}`}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}


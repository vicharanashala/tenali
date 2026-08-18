/**
 * MonsterToast.jsx
 *
 * Renders a brief, top-right floating notification when a monster is
 * triggered. Subscribes to `tenali:wrongAnswer` CustomEvent on window.
 *
 * Spec: D:\vins-phase-2\tenali-docs-backup\FEATURE_MONSTERS.md v0.2 §6.
 *
 * UX:
 *   - First sighting ("introduced!") — 5s on screen, larger, has "View Hall" CTA
 *   - Repeat sighting ("strikes again!") — 2s on screen, tappable, dismisses on click
 *   - Closes on timeout or click
 *   - Multiple wrong answers in quick succession queue up (latest wins after
 *     the current toast finishes); spec §6.5.
 *
 * Layout:
 *   - Position: fixed top-right, 24px from edges
 *   - Styling: CSS blobs for the monster art (color per monster), uses CSS
 *     variables from theme if present, falls back to own colors
 *   - z-index: high (999999) so it sits above all other UI
 *   - Animation: slide-in from right, fade-out on dismiss
 *
 * No new external dependencies. Plain React + inline styles + a tiny CSS block
 * injected once via a <style> tag.
 */

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getMonsterName, getMonsterTagline } from './monsterExplanations.js';
import { isMonsterSeen, getSlipsSinceLastCure, getMonsterHealedState } from './monsterStore.js';
import MonsterAvatar from './MonsterAvatar.jsx';

const EVENT_NAME = 'tenali:wrongAnswer';
const INTRO_DURATION_MS = 5000;
const REPEAT_DURATION_MS = 2000;
const FADE_OUT_MS = 300;

// Color scheme per monster (spec §4.4 — distinctive, animatable blobs)
const MONSTER_COLORS = {
  'bracketeer':     { primary: '#5b8def', secondary: '#3a6fce', emoji: '🎯' },
  'sign-swapper':   { primary: '#ef5b5b', secondary: '#ce3a3a', emoji: '⚡' },
  'decimal-drifter':{ primary: '#f0a500', secondary: '#c78700', emoji: '🌊' },
  'carry-crasher':  { primary: '#9b59b6', secondary: '#7d3fa0', emoji: '💥' },
};

/**
 * Inject a one-time CSS block for the toast. Idempotent via data attribute.
 */
function injectToastStyles() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[data-monster-toast]')) return;

  const css = `
    .monster-toast {
      position: fixed;
      top: 24px;
      right: 24px;
      min-width: 280px;
      max-width: 360px;
      padding: 16px 18px;
      background: var(--clr-card, #2c2622);
      color: var(--clr-text, #ede8e3);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      border-left: 4px solid var(--monster-primary, #5b8def);
      z-index: 999999;
      cursor: pointer;
      user-select: none;
      animation: monster-toast-slidein 280ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: opacity ${FADE_OUT_MS}ms ease-out, transform ${FADE_OUT_MS}ms ease-out, border-color 0.2s ease;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
    }
    .monster-toast.warning {
      border-left-color: var(--clr-accent, #e8864a) !important;
      box-shadow: 0 0 14px var(--clr-accent-soft, rgba(232, 134, 74, 0.22));
    }
    .monster-toast.dismissing {
      opacity: 0;
      transform: translateX(20px);
    }
    .monster-toast-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .monster-toast-content {
      flex: 1;
      min-width: 0;
    }
    .monster-toast-title {
      font-family: var(--font-display, 'Source Serif 4', serif);
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .monster-toast.warning .monster-toast-title {
      color: var(--clr-accent, #e8864a);
    }
    .monster-toast-tagline {
      font-size: 13px;
      color: var(--clr-text-soft, #a89e94);
    }
    .monster-toast-cta {
      margin-top: 8px;
      padding: 6px 14px;
      background: var(--clr-accent, #e8864a);
      color: white;
      border: none;
      border-radius: var(--radius-sm, 10px);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: opacity var(--transition, 180ms ease), transform var(--transition, 180ms ease);
    }
    .monster-toast.warning .monster-toast-cta {
      background: var(--clr-accent, #e8864a);
    }
    .monster-toast-cta:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    @keyframes monster-toast-slidein {
      from {
        opacity: 0;
        transform: translateX(40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-monster-toast', '');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Top-level toast manager. Renders at most one toast at a time. New events
 * queue up; the latest one is shown after the current dismisses.
 *
 * Props:
 *   - onOpenHall(): optional callback when user taps the toast's "View Hall" CTA
 *   - onTap(): optional callback when user taps the toast (for any other UX)
 */
export function MonsterToast({ onOpenHall, onTap }) {
  const [active, setActive] = useState(null);     // { monsterIds: [...] }
  const [dismissing, setDismissing] = useState(false);
  const timerRef = useRef(null);

  // Inject styles once on mount
  useEffect(() => {
    injectToastStyles();
  }, []);

  // Subscribe to sessionSummary events
  useEffect(() => {
    function handle(e) {
      const detail = e.detail || {};
      if (!Array.isArray(detail.monsterIds) || detail.monsterIds.length === 0) return;

      setActive({ monsterIds: detail.monsterIds });
      setDismissing(false);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDismissing(true);
        setTimeout(() => {
          setActive(null);
          setDismissing(false);
        }, FADE_OUT_MS);
      }, 9000);
    }
    window.addEventListener('tenali:sessionSummary', handle);
    return () => window.removeEventListener('tenali:sessionSummary', handle);
  }, []);

  function dismiss() {
    if (!active) return;
    setDismissing(true);
    setTimeout(() => {
      setActive(null);
      setDismissing(false);
    }, FADE_OUT_MS);
  }

  function handleClick() {
    dismiss();
    onTap && onTap(active);
  }

  function handleCta(e) {
    e.stopPropagation();
    dismiss();
    onOpenHall && onOpenHall(active);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!active) return null;

  const count = active.monsterIds.length;

  let title = '🚨 Monsters Awoken!';
  let tagline = count === 1
    ? `1 misconception monster was triggered during this practice round.`
    : `${count} misconception monsters were triggered during this practice round.`;
  let isWarning = false;

  if (count === 1) {
    const mid = active.monsterIds[0];
    const name = getMonsterName(mid);
    const mstate = getMonsterHealedState(mid);
    if (mstate === 'warning') {
      title = `⚠️ ${name} is waking up!`;
      tagline = "Don't slip again, or the cure will break!";
      isWarning = true;
    } else {
      title = `🚨 ${name} breached!`;
      tagline = "The monster strikes again! Practice to cure it.";
    }
  }

  const toastEl = (
    <div
      className={`monster-toast ${isWarning ? 'warning' : ''} ${dismissing ? 'dismissing' : ''}`}
      style={{
        '--monster-primary': isWarning ? 'var(--clr-accent, #e8864a)' : 'var(--clr-accent, #e8864a)',
        '--monster-secondary': isWarning ? 'var(--clr-accent-soft, rgba(232, 134, 74, 0.22))' : 'var(--clr-accent-soft, rgba(232, 134, 74, 0.22))',
        minWidth: '320px',
        padding: '18px 20px',
      }}
      onClick={handleClick}
      role="status"
      aria-live="polite"
      data-session-summary-count={count}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="monster-toast-title" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: isWarning ? 'var(--clr-accent, #e8864a)' : 'var(--clr-accent, #e8864a)' }}>
          {title}
        </div>
        <div className="monster-toast-tagline" style={{ color: 'var(--clr-text-soft, #a89e94)', fontSize: '13px', lineHeight: '1.4' }}>
          {tagline}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '4px 0' }}>
          {active.monsterIds.map(mid => {
            const warningState = getMonsterHealedState(mid);
            return (
              <div key={mid} title={getMonsterName(mid)} style={{ background: 'var(--clr-surface, #362f2a)', padding: '6px', borderRadius: '12px', border: '1px solid var(--clr-border, rgba(255,245,230,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MonsterAvatar monsterId={mid} size={38} state={warningState} />
              </div>
            );
          })}
        </div>
        <button className="monster-toast-cta" onClick={handleCta} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          Go to Hall →
        </button>
      </div>
    </div>
  );

  // Portal-render into document.body so the toast sits above all
  // route-specific React trees and works in every route without needing
  // per-route wiring. Falls back to inline render in non-browser contexts.
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(toastEl, document.body);
  }
  return toastEl;
}

export default MonsterToast;

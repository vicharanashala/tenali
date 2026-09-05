/**
 * HallPanel.jsx
 *
 * The "Hall of Silly Mistakes" modal. Shows all triggered monsters with
 * breach counts, last attempt recency, and cure history. Tapping a monster
 * opens MonsterDetail.
 *
 * Spec: D:\vins-phase-2\tenali-docs-backup\FEATURE_MONSTERS.md v0.2 §6.5.
 *
 * Layout:
 *   - Full-screen overlay with semi-transparent backdrop
 *   - Centered card (max-width 720px)
 *   - Header: title + close button + monster count summary
 *   - Body: responsive grid of MonsterCard (1 col mobile, 2 col wider)
 *   - Empty state: "No monsters yet. Get a question wrong to meet one."
 *
 * Props:
 *   - open: boolean
 *   - onClose: () => void
 *   - monsterLog: result of monsterStore.load() — has { log, cures, seenMonsterIds }
 *   - onStartCure: (monsterId, topic) => void
 *
 * Placement-agnostic: takes `open` and `onClose`. Could be triggered from
 * the toast CTA, a future header icon, or anywhere.
 *
 * Closes on:
 *   - Click backdrop
 *   - Click close button
 *   - Escape key
 */

import { useEffect, useRef, useState } from 'react';
import MonsterCard from './MonsterCard.jsx';
import MonsterDetail from './MonsterDetail.jsx';
import { getCureHistory, getMonsterBreachCount, getMonsterLastAttempt } from './monsterStore.js';
import { MONSTER_EXPLANATIONS } from './monsterExplanations.js';

const KNOWN_IDS = Object.keys(MONSTER_EXPLANATIONS);

function injectHallStyles() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[data-monster-hall]')) return;

  const css = `
    .monster-hall-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999990;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: monster-hall-fadein 200ms ease-out;
    }
    .monster-hall-card {
      background: var(--clr-card, #2c2622);
      color: var(--clr-text, #ede8e3);
      border: 1px solid var(--clr-border);
      border-radius: 24px;
      width: 100%;
      max-width: 720px;
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      animation: monster-hall-slideup 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .monster-hall-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--clr-border, rgba(255,245,230,0.18));
    }
    .monster-hall-title {
      font-family: var(--font-display, 'Source Serif 4', serif);
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    .monster-hall-subtitle {
      font-size: 13px;
      color: var(--clr-text-soft, #a89e94);
      margin-top: 2px;
    }
    .monster-hall-close {
      background: transparent;
      border: 1px solid var(--clr-border, rgba(255, 245, 230, 0.18));
      color: inherit;
      font-size: 18px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .monster-hall-close:hover {
      background: var(--clr-hover-strong, rgba(255,245,230,0.08));
    }
    .monster-hall-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }
    .monster-hall-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }
    @media (min-width: 560px) {
      .monster-hall-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .monster-hall-empty {
      text-align: center;
      padding: 48px 20px;
      opacity: 0.7;
      font-size: 15px;
    }
    .monster-hall-empty-emoji {
      font-size: 48px;
      margin-bottom: 12px;
      display: block;
    }
    @keyframes monster-hall-fadein {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes monster-hall-slideup {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-monster-hall', '');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Top-level Hall modal. Renders nothing when `open` is false.
 */
export function HallPanel({ open, onClose, monsterLog, onStartCure, onOpenGuidedSolver, onCloseSolver, initialSelectedId, initialGuidedSolver }) {
  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const cardRef = useRef(null);

  // Inject styles once
  useEffect(() => {
    injectHallStyles();
  }, []);

  // Sync selection when open or initialSelectedId changes
  useEffect(() => {
    if (!open) {
      if (!initialSelectedId) setSelectedId(null);
    } else if (initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [open, initialSelectedId]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') {
        if (selectedId) setSelectedId(null);
        else onClose && onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, selectedId, onClose]);

  // Focus management: focus the card on open so Esc works without prior click
  useEffect(() => {
    if (open && cardRef.current) cardRef.current.focus();
  }, [open]);

  if (!open) return null;

  const seenIds = (monsterLog && Array.isArray(monsterLog.seenMonsterIds)) ? monsterLog.seenMonsterIds : [];
  const seenCount = seenIds.length;
  const totalCount = KNOWN_IDS.length;

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) {
      if (selectedId) setSelectedId(null);
      else onClose && onClose();
    }
  }

  function handleStartCure(monsterId, topic) {
    onStartCure && onStartCure(monsterId, topic);
  }

  // Detail view replaces the grid
  if (selectedId) {
    const detailEntry = MONSTER_EXPLANATIONS[selectedId];
    const breachCount = getMonsterBreachCount(selectedId);
    const lastAttempt = getMonsterLastAttempt(selectedId);
    const cureHistory = getCureHistory(selectedId);

    return (
      <div className="monster-hall-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Monster detail">
        <div
          ref={cardRef}
          className="monster-hall-card"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="monster-hall-body">
            <MonsterDetail
              monsterId={selectedId}
              breachCount={breachCount}
              lastAttempt={lastAttempt}
              cureHistory={cureHistory}
              onBack={() => setSelectedId(null)}
              onStartCure={handleStartCure}
              onOpenGuidedSolver={onOpenGuidedSolver}
              onCloseSolver={onCloseSolver}
              initialGuidedSolver={initialGuidedSolver}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="monster-hall-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Hall of Silly Mistakes">
      <div
        ref={cardRef}
        className="monster-hall-card"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="monster-hall-header">
          <div>
            <h2 className="monster-hall-title">Hall of Silly Mistakes</h2>
            <div className="monster-hall-subtitle">
              {seenCount === 0
                ? `No monsters yet — meet one by getting a question wrong.`
                : `${seenCount} of ${totalCount} monsters fed`}
            </div>
          </div>
          <button className="monster-hall-close" onClick={onClose} aria-label="Close Hall">×</button>
        </div>
        <div className="monster-hall-body">
          {seenIds.length === 0 ? (
            <div className="monster-hall-empty">
              <span className="monster-hall-empty-emoji" aria-hidden="true">🌱</span>
              No monsters yet. Get a question wrong to meet one.
            </div>
          ) : (
            <div className="monster-hall-grid">
              {KNOWN_IDS.map((id) => {
                const isSeen = seenIds.includes(id);
                const breachCount = isSeen ? getMonsterBreachCount(id) : 0;
                const lastAttempt = isSeen ? getMonsterLastAttempt(id) : null;
                const cureHistory = isSeen ? getCureHistory(id) : [];
                return (
                  <MonsterCard
                    key={id}
                    monsterId={id}
                    seen={isSeen}
                    breachCount={breachCount}
                    lastAttempt={lastAttempt}
                    cureHistory={cureHistory}
                    onClick={() => setSelectedId(id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HallPanel;
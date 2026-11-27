import React, { useMemo, useRef, useState } from 'react';
import elementsData from './elements118.json';
import AtomVisualizerModal from './AtomVisualizerModal';
import QuizMode from './QuizMode';

export const CATEGORY_META = {
  'alkali-metal': { label: 'Alkali Metals', color: '#ef4444' },
  'alkaline-earth-metal': { label: 'Alkaline Earth', color: '#f97316' },
  'transition-metal': { label: 'Transition Metals', color: '#eab308' },
  'post-transition-metal': { label: 'Post-Transition', color: '#84cc16' },
  metalloid: { label: 'Metalloids', color: '#14b8a6' },
  'polyatomic-nonmetal': { label: 'Polyatomic Nonmetals', color: '#06b6d4' },
  'diatomic-nonmetal': { label: 'Diatomic Nonmetals', color: '#38bdf8' },
  halogen: { label: 'Halogens', color: '#6366f1' },
  'noble-gas': { label: 'Noble Gases', color: '#a855f7' },
  lanthanide: { label: 'Lanthanides', color: '#ec4899' },
  actinide: { label: 'Actinides', color: '#f43f5e' },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_META);

const SCOPED_STYLES = `
.ptl-root {
  --ptl-bg: #0b1120;
  --ptl-surface: #111827;
  --ptl-surface-2: #1e293b;
  --ptl-border: rgba(148, 163, 184, 0.22);
  --ptl-text: #f8fafc;
  --ptl-muted: #94a3b8;
  --ptl-cyan: #06b6d4;
  min-height: 100vh;
  background: radial-gradient(circle at top right, #13233b 0%, var(--ptl-bg) 60%);
  color: var(--ptl-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 20px 16px 36px;
  box-sizing: border-box;
}
.ptl-root *, .ptl-root *::before, .ptl-root *::after {
  box-sizing: border-box;
}
.ptl-container {
  max-width: 1280px;
  margin: 0 auto;
}
.ptl-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.ptl-title {
  margin: 0;
  font-size: clamp(1.4rem, 2.5vw, 1.95rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ptl-text);
}
.ptl-title-accent {
  color: var(--ptl-cyan);
}
.ptl-tagline {
  margin: 4px 0 0;
  font-size: 0.92rem;
  color: var(--ptl-muted);
}
.ptl-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ptl-surface);
  border: 1px solid var(--ptl-border);
  border-radius: 10px;
  padding: 6px 12px;
  min-width: 260px;
  max-width: 360px;
  flex: 1 1 260px;
}
.ptl-search-wrap:focus-within {
  border-color: var(--ptl-cyan);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.22);
}
.ptl-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--ptl-text);
  font-size: 0.92rem;
  outline: none;
}
.ptl-search-input::placeholder {
  color: var(--ptl-muted);
}
.ptl-clear-btn {
  background: rgba(148, 163, 184, 0.16);
  color: var(--ptl-text);
  border: none;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  cursor: pointer;
}
.ptl-clear-btn:hover {
  background: rgba(148, 163, 184, 0.28);
}
.ptl-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 12px;
}
.ptl-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--ptl-border);
  background: var(--ptl-surface);
  color: #e2e8f0;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.12s ease, background-color 0.12s ease;
}
.ptl-filter-chip:hover {
  border-color: rgba(248, 250, 252, 0.45);
}
.ptl-filter-chip[aria-pressed="true"] {
  background: rgba(6, 182, 212, 0.18);
  border-color: var(--ptl-chip-color, var(--ptl-cyan));
  color: #ffffff;
}
.ptl-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ptl-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--ptl-muted);
  margin-bottom: 10px;
}
.ptl-grid-scroll {
  overflow-x: auto;
  padding-bottom: 10px;
}
.ptl-grid {
  display: grid;
  grid-template-columns: repeat(18, minmax(54px, 1fr));
  grid-template-rows: repeat(7, 64px) 16px repeat(2, 64px);
  gap: 4px;
  min-width: 1040px;
}
.ptl-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5px 6px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--tile-color) 50%, transparent);
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--tile-color) 18%, #111827),
    #0f172a
  );
  color: var(--ptl-text);
  cursor: pointer;
  text-align: left;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.15s ease;
}
.ptl-tile:hover, .ptl-tile:focus-visible {
  transform: translateY(-2px) scale(1.04);
  z-index: 4;
  border-color: var(--tile-color);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45), 0 0 0 2px var(--tile-color);
  outline: none;
}
.ptl-tile-dimmed {
  opacity: 0.2;
}
.ptl-tile-num {
  font-size: 0.66rem;
  font-weight: 700;
  color: #cbd5e1;
  line-height: 1;
}
.ptl-tile-symbol {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.05;
  color: #ffffff;
}
.ptl-tile-name {
  font-size: 0.58rem;
  color: #cbd5e1;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}
.ptl-series-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px dashed var(--ptl-border);
  background: rgba(30, 41, 59, 0.45);
  color: var(--ptl-muted);
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px;
}
.ptl-series-marker:hover {
  border-color: var(--ptl-cyan);
  color: var(--ptl-text);
}
.ptl-fblock-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ptl-muted);
  white-space: nowrap;
}

/* Modal Styles */
.ptl-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ptl-modal-card {
  width: 100%;
  max-width: 820px;
  max-height: 92vh;
  overflow-y: auto;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-top: 4px solid var(--ptl-accent, #06b6d4);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  padding: 20px;
  color: #f8fafc;
}
.ptl-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.ptl-modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ptl-modal-z-badge {
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.9rem;
  color: #0b1120;
  flex-shrink: 0;
}
.ptl-modal-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
}
.ptl-modal-symbol {
  color: #94a3b8;
  font-weight: 700;
}
.ptl-modal-subtitle {
  margin: 2px 0 0;
  font-size: 0.84rem;
  color: #94a3b8;
  text-transform: capitalize;
}
.ptl-icon-btn {
  background: rgba(148, 163, 184, 0.14);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ptl-icon-btn:hover, .ptl-icon-btn:focus-visible {
  background: rgba(239, 68, 68, 0.22);
  border-color: #ef4444;
  outline: none;
}
.ptl-modal-body {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 740px) {
  .ptl-modal-body {
    grid-template-columns: 1fr;
  }
}
.ptl-atom-stage-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.ptl-atom-stage {
  position: relative;
  width: 100%;
  max-width: 340px;
  aspect-ratio: 1 / 1;
  background: radial-gradient(circle, #172554 0%, #090f1e 72%);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ptl-atom-svg {
  width: 100%;
  height: 100%;
  display: block;
}
.ptl-shell-ring-label {
  fill: rgba(148, 163, 184, 0.72);
  font-size: 9px;
  font-weight: 700;
}
.ptl-nucleus-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 84px;
  height: 84px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.ptl-stage-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.ptl-step-controls {
  display: inline-flex;
  gap: 6px;
}
.ptl-control-btn {
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}
.ptl-control-btn:hover:not(:disabled) {
  border-color: #38bdf8;
}
.ptl-control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ptl-control-primary {
  background: #06b6d4;
  color: #0b1120;
  border-color: #06b6d4;
}
.ptl-control-primary:hover {
  background: #22d3ee;
}
.ptl-legend-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  font-size: 0.76rem;
  color: #cbd5e1;
}
.ptl-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.ptl-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.ptl-dot-p { background: #ef4444; }
.ptl-dot-n { background: #94a3b8; }
.ptl-dot-e { background: #38bdf8; }
.ptl-details-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ptl-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.ptl-stat-card {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ptl-stat-p { border-top: 3px solid #ef4444; }
.ptl-stat-n { border-top: 3px solid #94a3b8; }
.ptl-stat-e { border-top: 3px solid #38bdf8; }
.ptl-stat-label {
  font-size: 0.72rem;
  color: #cbd5e1;
}
.ptl-stat-val {
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.1;
}
.ptl-stat-formula {
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.ptl-info-box {
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 12px;
}
.ptl-info-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}
.ptl-info-key {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}
.ptl-info-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: #f8fafc;
}
.ptl-isotope-note {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #38bdf8;
}
.ptl-shell-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.ptl-shell-pill {
  padding: 4px 8px;
  border-radius: 6px;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.35);
  font-size: 0.78rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.ptl-config-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ptl-config-code {
  display: inline-block;
  padding: 6px 8px;
  border-radius: 6px;
  background: #0b1120;
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82rem;
  color: #e2e8f0;
  word-break: break-word;
}
.ptl-engine-note {
  font-size: 0.74rem;
  color: #94a3b8;
  text-align: right;
}

/* ---- Quiz CTA Button ---- */
@keyframes ptl-quiz-glow {
  0%, 100% { box-shadow: 0 0 12px rgba(6, 182, 212, 0.35), 0 0 32px rgba(99, 102, 241, 0.15); }
  50%      { box-shadow: 0 0 20px rgba(6, 182, 212, 0.55), 0 0 48px rgba(99, 102, 241, 0.3); }
}
@keyframes ptl-quiz-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes ptl-quiz-nudge {
  0%, 85%, 100% { transform: translateY(0); }
  90%           { transform: translateY(-3px); }
  95%           { transform: translateY(0); }
}

.ptl-quiz-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 10px 22px 10px 18px;
  border-radius: 12px;
  border: 1.5px solid rgba(6, 182, 212, 0.5);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%);
  color: #e0f2fe;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  animation: ptl-quiz-glow 2.8s ease-in-out infinite, ptl-quiz-nudge 4s ease-in-out infinite;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  overflow: hidden;
  flex-shrink: 0;
}
.ptl-quiz-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.07) 40%,
    rgba(255, 255, 255, 0.13) 50%,
    rgba(255, 255, 255, 0.07) 60%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: ptl-quiz-shimmer 3.5s linear infinite;
  pointer-events: none;
}
.ptl-quiz-cta:hover {
  transform: translateY(-2px) scale(1.04);
  border-color: #22d3ee;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(99, 102, 241, 0.28) 100%);
  animation: ptl-quiz-glow 1.4s ease-in-out infinite;
}
.ptl-quiz-cta[aria-pressed="true"] {
  background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
  color: #fff;
  border-color: transparent;
  animation: none;
}
.ptl-quiz-cta[aria-pressed="true"]:hover {
  opacity: 0.92;
}

.ptl-quiz-cta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #06b6d4, #6366f1);
  flex-shrink: 0;
}

.ptl-quiz-cta-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 2px 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}
`;

export function PeriodicTableApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const lastTriggerRef = useRef(null);

  const elementsByNumber = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < elementsData.length; i += 1) {
      map.set(elementsData[i].number, elementsData[i]);
    }
    return map;
  }, []);

  const matchingNumbers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const set = new Set();

    for (let i = 0; i < elementsData.length; i += 1) {
      const el = elementsData[i];
      const matchesCategory = activeCategory === 'all' || el.category === activeCategory;
      const matchesQuery =
        q === '' ||
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.number) === q;

      if (matchesCategory && matchesQuery) {
        set.add(el.number);
      }
    }
    return set;
  }, [searchQuery, activeCategory]);

  const selectedElement = selectedNumber !== null ? elementsByNumber.get(selectedNumber) || null : null;

  const handleOpenElement = (num, triggerEl) => {
    if (triggerEl) {
      lastTriggerRef.current = triggerEl;
    }
    setSelectedNumber(num);
  };

  const handleCloseModal = () => {
    setSelectedNumber(null);
    if (lastTriggerRef.current && typeof lastTriggerRef.current.focus === 'function') {
      lastTriggerRef.current.focus();
    }
  };

  const hasActiveFilter = searchQuery.trim() !== '' || activeCategory !== 'all';

  return (
    <section className="ptl-root" aria-label="Periodic Table Lab">
      <style>{SCOPED_STYLES}</style>

      <div className="ptl-container">
        <header className="ptl-header">
          <div>
            <h1 className="ptl-title">
              Periodic Table <span className="ptl-title-accent">Lab</span>
            </h1>
            <p className="ptl-tagline">
              Click any of the 118 elements to inspect its live 2D Bohr shells and subatomic particles.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ptl-quiz-cta"
              aria-pressed={showQuiz}
              onClick={() => setShowQuiz((prev) => !prev)}
            >
              <span className="ptl-quiz-cta-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              Practice Quiz
            </button>

            <div className="ptl-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="ptl-search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, symbol, or Z (e.g. Chlorine, Cl, 17)"
              aria-label="Search elements by name, symbol, or atomic number"
            />
            {searchQuery && (
              <button
                type="button"
                className="ptl-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          </div>
        </header>

        {showQuiz ? (
          <QuizMode onExit={() => setShowQuiz(false)} />
        ) : (
        <>
        <div className="ptl-filters" role="group" aria-label="Filter elements by chemical family">
          <button
            type="button"
            className="ptl-filter-chip"
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            All (118)
          </button>
          {CATEGORY_KEYS.map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const isPressed = activeCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                className="ptl-filter-chip"
                style={{ '--ptl-chip-color': meta.color } as React.CSSProperties}
                aria-pressed={isPressed}
                onClick={() => setActiveCategory(isPressed ? 'all' : catKey)}
              >
                <span className="ptl-chip-dot" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="ptl-status-bar" aria-live="polite">
          <span>
            Showing <strong>{matchingNumbers.size}</strong> of 118 elements
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              className="ptl-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="ptl-grid-scroll">
          <div className="ptl-grid" role="grid" aria-label="118-element periodic table">
            {/* Series placeholders at Row 6 Col 3 and Row 7 Col 3 */}
            <button
              type="button"
              className="ptl-series-marker"
              style={{ gridRow: 6, gridColumn: 3 }}
              onClick={() => setActiveCategory(activeCategory === 'lanthanide' ? 'all' : 'lanthanide')}
              aria-label="Highlight Lanthanides (elements 57 to 71)"
            >
              <span>57–71</span>
              <span>La–Lu</span>
            </button>
            <button
              type="button"
              className="ptl-series-marker"
              style={{ gridRow: 7, gridColumn: 3 }}
              onClick={() => setActiveCategory(activeCategory === 'actinide' ? 'all' : 'actinide')}
              aria-label="Highlight Actinides (elements 89 to 103)"
            >
              <span>89–103</span>
              <span>Ac–Lr</span>
            </button>

            {/* f-block row labels in columns 1-3 of rows 9 and 10 */}
            <div className="ptl-fblock-label" style={{ gridRow: 9, gridColumn: '1 / 4' }}>
              Lanthanides (57–71)
            </div>
            <div className="ptl-fblock-label" style={{ gridRow: 10, gridColumn: '1 / 4' }}>
              Actinides (89–103)
            </div>

            {elementsData.map((el) => {
              const meta = CATEGORY_META[el.category] || { label: el.category, color: '#06b6d4' };
              const isMatched = matchingNumbers.has(el.number);

              return (
                <button
                  key={el.number}
                  type="button"
                  data-testid={`element-tile-${el.symbol}`}
                  data-matched={isMatched ? 'true' : 'false'}
                  className={`ptl-tile${isMatched ? '' : ' ptl-tile-dimmed'}`}
                  style={{
                    gridRow: el.gridRow,
                    gridColumn: el.gridCol,
                    '--tile-color': meta.color,
                  } as React.CSSProperties}
                  aria-label={`${el.name}, symbol ${el.symbol}, atomic number ${el.number}, ${meta.label}`}
                  onClick={(event) => handleOpenElement(el.number, event.currentTarget)}
                >
                  <span className="ptl-tile-num">{el.number}</span>
                  <span className="ptl-tile-symbol">{el.symbol}</span>
                  <span className="ptl-tile-name">{el.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        </>
        )}
      </div>

      {selectedElement && (
        <AtomVisualizerModal
          element={selectedElement}
          totalElements={elementsData.length}
          categoryMeta={CATEGORY_META[selectedElement.category]}
          onClose={handleCloseModal}
          onSelectElement={(nextZ) => setSelectedNumber(nextZ)}
        />
      )}
    </section>
  );
}

export default PeriodicTableApp;
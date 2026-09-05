/**
 * MonsterCard.jsx
 *
 * Single monster tile rendered inside HallPanel. Visual blob + name + breach
 * count + last attempt relative time + cure count.
 *
 * Spec: §6.5 — "Grid of <MonsterCard>s, one per monster type."
 *
 * UX:
 *   - Tap → parent's onClick handler (sets selectedId in HallPanel → opens detail)
 *   - Hover: subtle scale + glow
 *   - Unseen monsters (no seenMonsterIds entry) render as silhouettes, locked.
 *     Future v1.1 unlocks them via discovery; for now they only show because
 *     seen-by-storage and rendering reveals them on next mount.
 *
 * Props:
 *   - monsterId: 'bracketeer' | 'sign-swapper' | 'decimal-drifter' | 'carry-crasher'
 *   - seen: boolean — whether the user has triggered this monster
 *   - breachCount: number
 *   - lastAttempt: number | null (ms epoch)
 *   - cureHistory: array of { startedAt, success, correctCount }
 *   - onClick: () => void
 */

import { getMonsterName } from './monsterExplanations.js';

// Color per monster (matches MonsterToast)
const MONSTER_COLORS = {
  'bracketeer':     { primary: '#5b8def', secondary: '#3a6fce', emoji: '🎯' },
  'sign-swapper':   { primary: '#ef5b5b', secondary: '#ce3a3a', emoji: '⚡' },
  'decimal-drifter':{ primary: '#f0a500', secondary: '#c78700', emoji: '🌊' },
  'carry-crasher':  { primary: '#9b59b6', secondary: '#7d3fa0', emoji: '💥' },
};

function formatRelativeTime(ms) {
  if (ms == null) return 'never';
  const delta = Date.now() - ms;
  if (delta < 60_000) return 'just now';
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} min ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} hr ago`;
  if (delta < 604_800_000) return `${Math.floor(delta / 86_400_000)} days ago`;
  return new Date(ms).toLocaleDateString();
}

function injectCardStyles() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[data-monster-card]')) return;

  const css = `
    .monster-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      background: var(--clr-hover, rgba(255,245,230,0.04));
      border: 1px solid var(--clr-border, rgba(255,245,230,0.18));
      border-radius: var(--radius-sm, 10px);
      cursor: pointer;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
      text-align: left;
      font-family: inherit;
      color: inherit;
      width: 100%;
    }
    .monster-card:hover {
      transform: translateY(-2px);
      background: var(--clr-hover-strong, rgba(255,245,230,0.08));
      border-color: var(--monster-primary, #5b8def);
    }
    .monster-card.warning {
      border-color: var(--clr-accent, #e8864a) !important;
      box-shadow: 0 0 10px var(--clr-accent-soft, rgba(232, 134, 74, 0.22)) !important;
      animation: alert-border-pulse 1.5s infinite alternate ease-in-out;
    }
    @keyframes alert-border-pulse {
      0% { box-shadow: 0 0 4px var(--clr-accent-soft); }
      100% { box-shadow: 0 0 12px var(--clr-accent-soft); }
    }
    .monster-card:focus-visible {
      outline: 2px solid var(--monster-primary, #5b8def);
      outline-offset: 2px;
    }
    .monster-card.unseen {
      opacity: 0.45;
      cursor: default;
    }
    .monster-card.unseen:hover {
      transform: none;
      border-color: var(--clr-border, rgba(255,245,230,0.18));
    }
    .monster-card-blob {
      width: 56px;
      height: 56px;
      border-radius: 50% 40% 60% 50%;
      background: var(--monster-primary, #5b8def);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      flex-shrink: 0;
      box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(0, 0, 0, 0.15);
    }
    .monster-card-body {
      flex: 1;
      min-width: 0;
    }
    .monster-card-name {
      font-family: var(--font-display, 'Source Serif 4', serif);
      font-weight: 700;
      font-size: 16px;
      margin: 0 0 2px;
    }
    .monster-card-meta {
      font-size: 13px;
      color: var(--clr-text-soft, #a89e94);
      margin: 0;
    }
    .monster-card-cure-badge {
      display: inline-block;
      padding: 2px 8px;
      background: var(--clr-accent-soft, rgba(232, 134, 74, 0.18));
      color: var(--monster-primary, #e8864a);
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 6px;
      vertical-align: middle;
    }
    .monster-card-cure-badge.none {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-monster-card', '');
  style.textContent = css;
  document.head.appendChild(style);
}

import MonsterAvatar from './MonsterAvatar.jsx';
import { getMonsterHealedState } from './monsterStore.js';

export function MonsterCard({ monsterId, seen, breachCount, lastAttempt, cureHistory, onClick }) {
  // Inject styles once on first render
  if (typeof document !== 'undefined') injectCardStyles();

  const colors = MONSTER_COLORS[monsterId] || MONSTER_COLORS['bracketeer'];
  const name = getMonsterName(monsterId);
  const curesSuccessful = Array.isArray(cureHistory) ? cureHistory.filter(c => c && c.success).length : 0;
  const healedState = seen ? getMonsterHealedState(monsterId) : 'breached';

  const meta = seen
    ? `Breached ${breachCount} time${breachCount === 1 ? '' : 's'} · last ${formatRelativeTime(lastAttempt)}`
    : 'Not yet met';

  return (
    <button
      className={`monster-card ${seen ? '' : 'unseen'} ${healedState === 'warning' ? 'warning' : ''}`}
      style={{ '--monster-primary': colors.primary, '--monster-secondary': colors.secondary }}
      onClick={seen ? onClick : undefined}
      disabled={!seen}
      aria-label={seen ? `Open details for ${name}` : `${name} not yet met`}
    >
      {seen ? (
        <MonsterAvatar monsterId={monsterId} size={56} state={healedState} />
      ) : (
        <div className="monster-card-blob" aria-hidden="true">❓</div>
      )}
      <div className="monster-card-body">
        <div className="monster-card-name">
          {name}
          {seen && curesSuccessful > 0 && (
            <span className="monster-card-cure-badge" title={`${curesSuccessful} successful cure${curesSuccessful === 1 ? '' : 's'}`}>
              ✦ {curesSuccessful}
            </span>
          )}
        </div>
        <p className="monster-card-meta">{meta}</p>
      </div>
    </button>
  );
}

export default MonsterCard;
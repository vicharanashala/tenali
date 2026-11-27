/**
 * DETECTIVE CASE MODES
 *
 * The case library groups cases into three modes:
 *   - "Classic Mystery" - the original linear cases
 *   - "Case File"       - the enhanced clue-elimination cases
 *   - "Crime Scene"     - the board-based cases
 *
 * How many cases a mode holds depends on the learner's age, because the
 * enhanced cases all target age 9+ and the board cases only cover ages 6-9.
 * A mode can therefore legitimately have no cases at all, in which case the
 * library hides its tab rather than offering a list that can never be filled.
 *
 * This lives in its own module so the rules can be unit tested without
 * pulling in the React component tree.
 */

import { isEnhancedCase } from './detective-stories';

/** True for the board-based crime-scene case type. */
export function isBoardCase(c) {
  return !!(c && c.type === 'board');
}

/** Number of cases available in each mode. */
export function getModeCounts(cases) {
  const list = cases || [];
  return {
    all: list.length,
    classic: list.filter(c => !isEnhancedCase(c) && !isBoardCase(c)).length,
    enhanced: list.filter(c => isEnhancedCase(c)).length,
    'crime-scene': list.filter(c => isBoardCase(c)).length,
  };
}

export const MODE_TABS = [
  { key: 'all', label: 'All Cases', icon: '📁' },
  { key: 'classic', label: 'Classic Mystery', icon: '🔎' },
  { key: 'enhanced', label: 'Case File', icon: '🕵️' },
  { key: 'crime-scene', label: 'Crime Scene', icon: '🗺️' },
];

/**
 * The tabs to render: "All Cases" is always offered, every other mode only
 * when it actually has cases for the current age.
 */
export function getModeTabs(counts) {
  return MODE_TABS.filter(tab => tab.key === 'all' || (counts[tab.key] || 0) > 0);
}

/**
 * The mode that is actually in effect. If the selected mode has no cases -
 * for instance because the learner changed their age - fall back to 'all' so
 * the list is never left empty with no way back.
 */
export function resolveActiveMode(modeFilter, counts) {
  if (modeFilter === 'all') return 'all';
  return (counts[modeFilter] || 0) > 0 ? modeFilter : 'all';
}

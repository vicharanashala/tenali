/**
 * Progress and Mastery Utilities
 *
 * Single source of truth for:
 * - Stage 3 topic completion evaluation
 * - Badge rank determination (locked, blue, bronze, silver, gold)
 * - Section / shelf progress calculations
 * - LocalStorage persistence (including guest offline support)
 */

export const STORAGE_KEYS = {
  COMPLETED_TOPICS: 'tenali-completed-topics',
  GOLD_MASTERY: 'tenali-gold-mastery',
  COINS: 'tenali-coins',
  TOTAL_SOLVED: 'tenali-total-solved',
  STREAK: 'tenali-streak',
};


/**
 * Checks whether a topic has achieved Stage 3 completion.
 * A topic is considered stage 3 complete if either the bare topicKey exists
 * or all three primary difficulty tiers (easy, medium, hard) have been completed.
 *
 * @param {string} topicKey
 * @param {string[]} completedTopics
 * @returns {boolean}
 */
export function isStage3Completed(topicKey, completedTopics = []) {
  if (!completedTopics || !Array.isArray(completedTopics)) return false;
  if (completedTopics.includes(topicKey)) return true;
  return (
    completedTopics.includes(`${topicKey}-easy`) &&
    completedTopics.includes(`${topicKey}-medium`) &&
    completedTopics.includes(`${topicKey}-hard`)
  );
}

/**
 * Resolves the badge tier for a topic from its completion records.
 *
 * @param {string} topicKey
 * @param {string[]} completedTopics
 * @returns {'locked' | 'blue' | 'bronze' | 'silver' | 'gold'}
 */
export function getTopicBadgeLevel(topicKey, completedTopics = []) {
  if (!completedTopics || !Array.isArray(completedTopics)) return 'locked';
  if (completedTopics.includes(`${topicKey}-hard`) || completedTopics.includes(`${topicKey}-gold`)) {
    return 'gold';
  }
  if (completedTopics.includes(`${topicKey}-medium`)) {
    return 'silver';
  }
  if (completedTopics.includes(`${topicKey}-easy`)) {
    return 'bronze';
  }
  if (completedTopics.includes(`${topicKey}-started`)) {
    return 'blue';
  }
  return 'locked';
}

/**
 * Computes completion and gold mastery counts for a group of tiles (e.g. within a category section).
 *
 * @param {Array<{ key: string }>} sectionTiles
 * @param {string[]} completedTopics
 * @param {string[]} goldMastery
 * @returns {{ completedCount: number, goldCount: number, totalCount: number }}
 */
export function calculateSectionProgress(sectionTiles = [], completedTopics = [], goldMastery = []) {
  const completedCount = sectionTiles.filter((app) =>
    isStage3Completed(app.key, completedTopics)
  ).length;
  const goldCount = sectionTiles.filter(
    (app) => goldMastery && Array.isArray(goldMastery) && goldMastery.includes(app.key)
  ).length;

  return {
    completedCount,
    goldCount,
    totalCount: sectionTiles.length,
  };
}

/**
 * Reads local progress state from localStorage.
 */
export function loadLocalProgress() {
  try {
    return {
      completedTopics: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_TOPICS) || '[]'),
      goldMastery: JSON.parse(localStorage.getItem(STORAGE_KEYS.GOLD_MASTERY) || '[]'),
      coins: parseInt(localStorage.getItem(STORAGE_KEYS.COINS) || '0', 10),
      totalSolved: parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_SOLVED) || '0', 10),
      streak: parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10),
    };
  } catch {
    return {
      completedTopics: [],
      goldMastery: [],
      coins: 0,
      totalSolved: 0,
      streak: 0,
    };
  }
}

/**
 * Persists local progress state to localStorage.
 * Ensures guest users without an auth token retain their progress across page reloads.
 *
 * @param {{
 *   completedTopics?: string[],
 *   goldMastery?: string[],
 *   coins?: number,
 *   totalSolved?: number,
 *   streak?: number
 * }} progress
 */
export function saveLocalProgress({ completedTopics, goldMastery, coins, totalSolved, streak } = {}) {
  try {
    if (completedTopics !== undefined) {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TOPICS, JSON.stringify(completedTopics));
    }
    if (goldMastery !== undefined) {
      localStorage.setItem(STORAGE_KEYS.GOLD_MASTERY, JSON.stringify(goldMastery));
    }
    if (coins !== undefined) {
      localStorage.setItem(STORAGE_KEYS.COINS, String(coins));
    }
    if (totalSolved !== undefined) {
      localStorage.setItem(STORAGE_KEYS.TOTAL_SOLVED, String(totalSolved));
    }
    if (streak !== undefined) {
      localStorage.setItem(STORAGE_KEYS.STREAK, String(streak));
    }
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
}

/**
 * Safely marks a topic/difficulty as completed in localStorage.
 * Ensures deduplicated arrays and automatically records the `${topicKey}-started` key.
 *
 * @param {string} topicKey
 * @param {string} [difficulty='']
 * @returns {string[]} The updated list of completed topic keys
 */
export function addCompletedTopic(topicKey, difficulty = '') {
  if (!topicKey) return loadLocalProgress().completedTopics;
  const local = loadLocalProgress();
  const targetKey = difficulty ? `${topicKey}-${difficulty}` : topicKey;
  const startedKey = `${topicKey}-started`;
  const set = new Set(local.completedTopics);
  set.add(targetKey);
  set.add(startedKey);
  const nextList = Array.from(set);
  saveLocalProgress({ completedTopics: nextList });
  return nextList;
}

/**
 * Merges incoming progress updates with existing local storage monotonically.
 * Completed topics and gold mastery are unified (Set union) so completed topics
 * can NEVER be overwritten, lost, or downgraded by stale closures or async syncs.
 *
 * @param {{
 *   completedTopics?: string[],
 *   goldMastery?: string[],
 *   coins?: number,
 *   totalSolved?: number,
 *   streak?: number
 * }} incoming
 * @returns {{
 *   completedTopics: string[],
 *   goldMastery: string[],
 *   coins: number,
 *   totalSolved: number,
 *   streak: number
 * }}
 */
export function reconcileProgress(incoming = {}) {
  const local = loadLocalProgress();
  const completedTopics = Array.from(
    new Set([...local.completedTopics, ...(incoming.completedTopics || [])])
  );
  const goldMastery = Array.from(
    new Set([...local.goldMastery, ...(incoming.goldMastery || [])])
  );
  const coins = incoming.coins !== undefined ? Math.max(local.coins, incoming.coins) : local.coins;
  const totalSolved = incoming.totalSolved !== undefined ? Math.max(local.totalSolved, incoming.totalSolved) : local.totalSolved;
  const streak = incoming.streak !== undefined ? Math.max(local.streak, incoming.streak) : local.streak;

  const merged = { completedTopics, goldMastery, coins, totalSolved, streak };
  saveLocalProgress(merged);
  return merged;
}

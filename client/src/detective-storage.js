/**
 * SHARED DETECTIVE PERSISTENCE
 *
 * Progress storage for the Detective Agency feature, kept in its own module so
 * that `detective-app.jsx` and `detective-board-app.jsx` can both use it
 * without importing each other. Importing each other would be a circular
 * dependency (app -> board -> app) which also breaks React Fast Refresh.
 *
 * The storage key and the persisted payload shape are unchanged from the
 * original in-app implementation, so progress saved by earlier builds still
 * loads correctly.
 */

export const DETECTIVE_STORAGE_KEY = 'tenali-detective-progress';

export function loadDetectiveProgress() {
  try {
    const raw = localStorage.getItem(DETECTIVE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Stored progress is unreadable (corrupt JSON or storage blocked) - start fresh.
  }
  return { xp: 0, casesSolved: 0, cases: {}, usedCaseIds: [], age: 8, boardMastery: {} };
}

export function saveDetectiveProgress(data) {
  try {
    localStorage.setItem(DETECTIVE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode / quota) - progress simply is not persisted.
  }
}

export function saveInProgressCase(caseId, snapshot) {
  try {
    const p = loadDetectiveProgress();
    if (!p.cases) p.cases = {};
    p.cases[caseId] = { ...snapshot, status: 'in_progress', updatedAt: Date.now() };
    saveDetectiveProgress(p);
  } catch {
    // Storage unavailable - the case still plays, it just will not be resumable.
  }
}

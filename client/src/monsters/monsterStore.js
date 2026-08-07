/**
 * monsterStore.js
 *
 * LocalStorage-backed persistence for the Misconception Monsters feature.
 * Authoritative source of "what monsters has the student triggered, and
 * which have they cured?" on this device.
 *
 * Spec: D:\vins-phase-2\tenali-docs-backup\FEATURE_MONSTERS.md v0.2 §4.
 *
 * API surface (all sync, all idempotent, all never-throw):
 *   - load()                    -> state
 *   - save(state)               -> boolean (true on persisted, false on in-memory)
 *   - append(entry)             -> boolean
 *   - isMonsterSeen(id)         -> boolean
 *   - markMonsterSeen(id)       -> boolean (true if newly marked)
 *   - getMonsterBreachCount(id) -> number
 *   - getMonsterLastAttempt(id) -> number | null (ms epoch, or null if never)
 *   - getCureHistory(id)        -> Array<{startedAt, success, correctCount}>
 *   - recordCure(id, result)    -> boolean
 *   - reset()                   -> void (clears storage; used for "Reset Hall" UI later)
 *
 * Failure handling (spec §8):
 *   - Quota exceeded: console.warn, return false, do not throw
 *   - localStorage unavailable (private mode SecurityError): use in-memory Map
 *   - JSON parse error: log warning, treat as fresh install
 *   - Schema version mismatch: log warning, treat as fresh install (v0.2 ships
 *     version 1 only; future versions add migration logic)
 *
 * In-memory fallback:
 *   When localStorage is unavailable, all reads return the same in-memory
 *   state for the session. Writes still go to the in-memory map. On reload
 *   the data is gone — by design (same as private browsing would behave).
 */

const STORAGE_KEY = 'tenali.monsterLog.v1';
const CURRENT_VERSION = 1;

const KNOWN_MONSTER_IDS = ['bracketeer', 'sign-swapper', 'decimal-drifter', 'carry-crasher'];

// ─── Module state ────────────────────────────────────────────────────────────

let _inMemoryState = null; // lazy-initialized on first load() if localStorage unavailable
let _lsAvailable = (() => {
  try {
    const k = '__monsters_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch (_e) {
    return false;
  }
})();

// ─── Internal helpers ────────────────────────────────────────────────────────

function emptyState() {
  return {
    version: CURRENT_VERSION,
    log: [],
    cures: {
      'bracketeer': [],
      'sign-swapper': [],
      'decimal-drifter': [],
      'carry-crasher': [],
    },
    seenMonsterIds: [],
  };
}

function ensureCuresShape(state) {
  // Defensive: if a saved state from another version lacks a cures key for a
  // known monster, add an empty array. Don't lose the rest of the state.
  if (!state.cures) state.cures = {};
  for (const id of KNOWN_MONSTER_IDS) {
    if (!Array.isArray(state.cures[id])) state.cures[id] = [];
  }
  return state;
}

function ensureSeenShape(state) {
  if (!Array.isArray(state.seenMonsterIds)) state.seenMonsterIds = [];
  return state;
}

function readFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null; // missing key — caller decides
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[monsters] JSON parse failed, treating as fresh install:', e.message);
    return null;
  }
}

function writeToLocalStorage(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('[monsters] localStorage write failed (quota? private mode?):', e.message);
    return false;
  }
}

function migrate(parsedState) {
  if (!parsedState || typeof parsedState !== 'object') return emptyState();
  if (parsedState.version !== CURRENT_VERSION) {
    console.warn(`[monsters] schema version ${parsedState.version} != ${CURRENT_VERSION}, treating as fresh`);
    return emptyState();
  }
  return ensureCuresShape(ensureSeenShape(parsedState));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Load the current monster log state. Never throws.
 * Returns a state object with at least { version, log, cures, seenMonsterIds }.
 */
export function load() {
  if (!_lsAvailable) {
    if (_inMemoryState == null) _inMemoryState = emptyState();
    return _inMemoryState;
  }
  const parsed = readFromLocalStorage();
  if (parsed == null) {
    const fresh = emptyState();
    // Persist the empty state so subsequent reads are fast. Best-effort.
    writeToLocalStorage(fresh);
    return fresh;
  }
  return migrate(parsed);
}

/**
 * Save the entire state object. Returns true if persisted to localStorage,
 * false if written only to in-memory fallback.
 */
export function save(state) {
  const normalized = migrate(state);
  if (!_lsAvailable) {
    _inMemoryState = normalized;
    return false;
  }
  return writeToLocalStorage(normalized);
}

/**
 * Append a single log entry. Returns true on success.
 * The entry is augmented with timestamp and monsterId/topic validation.
 */
export function append(entry) {
  if (!entry || typeof entry !== 'object') {
    console.warn('[monsters] append called with non-object entry, ignoring');
    return false;
  }
  if (!KNOWN_MONSTER_IDS.includes(entry.monsterId)) {
    console.warn(`[monsters] append called with unknown monsterId: ${entry.monsterId}`);
    return false;
  }
  if (typeof entry.topic !== 'string' || !entry.topic) {
    console.warn('[monsters] append missing topic, ignoring');
    return false;
  }
  const state = load();
  const stamped = {
    ...entry,
    timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
  };
  state.log.push(stamped);
  return save(state);
}

/**
 * Has this monster ever been triggered (regardless of cure status)?
 */
export function isMonsterSeen(monsterId) {
  const state = load();
  return state.seenMonsterIds.includes(monsterId);
}

/**
 * Mark a monster as seen. Returns true if it was newly marked.
 * Idempotent: calling twice does not duplicate the entry.
 */
export function markMonsterSeen(monsterId) {
  if (!KNOWN_MONSTER_IDS.includes(monsterId)) return false;
  const state = load();
  if (state.seenMonsterIds.includes(monsterId)) return false;
  state.seenMonsterIds.push(monsterId);
  return save(state);
}

/**
 * Count of log entries for a monster (across all topics).
 * Used by the Hall card's "Breached X times" line.
 */
export function getMonsterBreachCount(monsterId) {
  const state = load();
  return state.log.filter(e => e.monsterId === monsterId).length;
}

/**
 * Most recent log entry timestamp for a monster, or null if never triggered.
 * Used by the Hall card's "last attempt" relative time.
 */
export function getMonsterLastAttempt(monsterId) {
  const state = load();
  let latest = null;
  for (const e of state.log) {
    if (e.monsterId === monsterId && (latest == null || e.timestamp > latest)) {
      latest = e.timestamp;
    }
  }
  return latest;
}

/**
 * Cure history for a monster. Returns the array (possibly empty) — never null.
 * Caller can use array length to check "has been cured at all".
 */
export function getCureHistory(monsterId) {
  const state = load();
  return Array.isArray(state.cures[monsterId]) ? state.cures[monsterId] : [];
}

/**
 * Record the outcome of a cure attempt. Result shape:
 *   { startedAt, success: bool, correctCount: number }
 * Returns true on persistence.
 */
export function recordCure(monsterId, result) {
  if (!KNOWN_MONSTER_IDS.includes(monsterId)) {
    console.warn(`[monsters] recordCure called with unknown monsterId: ${monsterId}`);
    return false;
  }
  if (!result || typeof result !== 'object') {
    console.warn('[monsters] recordCure missing result, ignoring');
    return false;
  }
  const state = load();
  if (!Array.isArray(state.cures[monsterId])) state.cures[monsterId] = [];
  state.cures[monsterId].push({
    startedAt: typeof result.startedAt === 'number' ? result.startedAt : Date.now(),
    success: result.success === true,
    correctCount: typeof result.correctCount === 'number' ? result.correctCount : 0,
  });
  return save(state);
}

/**
 * Returns the count of slips (log entries) recorded after the most recent successful cure.
 */
export function getSlipsSinceLastCure(monsterId) {
  const state = load();
  const cures = Array.isArray(state.cures[monsterId]) ? state.cures[monsterId] : [];
  const successfulCures = cures.filter(c => c && c.success);
  if (successfulCures.length === 0) return 0;
  
  // Find the timestamp of the latest successful cure
  const latestCureTime = Math.max(...successfulCures.map(c => c.startedAt));
  
  // Count log entries since that cure time
  return state.log.filter(e => e.monsterId === monsterId && e.timestamp > latestCureTime).length;
}

/**
 * Determines the healed state of a monster: 'healed', 'warning' (1 slip), or 'breached' (2+ slips or uncured)
 */
export function getMonsterHealedState(monsterId) {
  const state = load();
  const cures = Array.isArray(state.cures[monsterId]) ? state.cures[monsterId] : [];
  const successfulCures = cures.filter(c => c && c.success);
  if (successfulCures.length === 0) return 'breached';

  const slips = getSlipsSinceLastCure(monsterId);
  if (slips === 0) return 'healed';
  if (slips === 1) return 'warning';
  return 'breached';
}


/**
 * For testing and the future "Reset Hall" admin button.
 * Clears all monster data. Returns true on success.
 */
export function reset() {
  if (!_lsAvailable) {
    _inMemoryState = emptyState();
    return false;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.warn('[monsters] reset failed:', e.message);
    return false;
  }
}

/**
 * Diagnostic — true if localStorage was reachable at module init.
 * Mostly for tests and the "feature offline for this session" UI later.
 */
export function isLocalStorageAvailable() {
  return _lsAvailable;
}

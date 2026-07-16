/**
 * Profile store — localStorage CRUD for learning profiles.
 *
 * No React. Pure functions over localStorage. The only side-effect channel
 * is the `tenali-profile-change` window CustomEvent, which mirrors the
 * `tenali-auth-change` pattern used by useAuth.
 *
 * Storage shape:
 *   localStorage[`tenali-profiles-${scope}`] = {
 *     activeProfileId: 'p_xxx',
 *     profiles: {
 *       'p_xxx': { id, name, avatarId, createdAt, lastUsedAt, adaptScore: {...} }
 *     }
 *   }
 *
 * `scope` is the auth username when available, otherwise the literal
 * 'default'. This makes the system forward-compatible if auth is removed
 * or restructured later.
 */

import { makeBlankProfile, validateName, AVATAR_BY_ID, DEFAULT_AVATAR_ID } from './profileDefaults.js'

const STORAGE_PREFIX = 'tenali-profiles-'
export const PROFILE_CHANGE_EVENT = 'tenali-profile-change'
const WRITE_DEBOUNCE_MS = 250

function storageKey(scope) {
  return STORAGE_PREFIX + (scope || 'default')
}

/**
 * Build a brand-new empty record. Profiles start with no active id; the
 * picker is responsible for picking one.
 */
function emptyRecord() {
  return { activeProfileId: null, profiles: {} }
}

function safeRead(scope) {
  try {
    const raw = localStorage.getItem(storageKey(scope))
    if (!raw) return emptyRecord()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptyRecord()
    if (!parsed.profiles || typeof parsed.profiles !== 'object') parsed.profiles = {}
    // Keep activeProfileId if present; only nullify if it points to a
    // missing profile (e.g. someone wiped the profile list manually).
    if (parsed.activeProfileId && !parsed.profiles[parsed.activeProfileId]) {
      parsed.activeProfileId = null
    }
    return parsed
  } catch (e) {
    console.warn('[profileStore] failed to read', scope, e)
    return emptyRecord()
  }
}

function emit(scope) {
  try { window.dispatchEvent(new CustomEvent(PROFILE_CHANGE_EVENT, { detail: { scope } })) } catch { /* noop */ }
}

function safeWrite(scope, record) {
  try {
    localStorage.setItem(storageKey(scope), JSON.stringify(record))
    return true
  } catch (e) {
    console.warn('[profileStore] failed to write', scope, e)
    return false
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function loadProfiles(scope) {
  return safeRead(scope)
}

// getActiveProfileId / getActiveProfile — deprecated. The active profile
// is session-only and lives in React state via useProfiles(). These are
// kept as no-ops so any stray caller does not crash during the migration.
export function getActiveProfileId() {
  return null
}

export function getActiveProfile() {
  return null
}

export function listProfiles(scope) {
  const rec = safeRead(scope)
  return Object.values(rec.profiles).sort(
    (a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt)
  )
}

/**
 * Create a new profile and return it (also persists to localStorage).
 * `name` is validated; returns { ok:false, error } on validation failure.
 * Newly created profile is auto-activated (activeProfileId set) so the
 * picker closes immediately on first create and refresh remembers it.
 */
export function createProfile(scope, name, avatarId) {
  const rec = safeRead(scope)
  const existing = Object.values(rec.profiles).map(p => p.name)
  const v = validateName(name, existing)
  if (!v.ok) return { ok: false, error: v.error }

  const profile = makeBlankProfile({ name, avatarId: avatarId || DEFAULT_AVATAR_ID })
  rec.profiles[profile.id] = profile
  rec.activeProfileId = profile.id
  if (safeWrite(scope, rec)) emit(scope)
  return { ok: true, profile }
}

/**
 * Shallow-merge a patch into a profile. Validates duplicate name against
 * other profiles (excluding the one being updated) so a rename can't
 * collide with an existing sibling's name.
 *
 * Returns:
 *   { ok: true, profile }  on success
 *   { ok: false, error }   on validation / not-found failure
 */
export function updateProfile(scope, id, patch) {
  const rec = safeRead(scope)
  const cur = rec.profiles[id]
  if (!cur) return { ok: false, error: 'Profile not found.' }
  const next = { ...cur, ...patch, id: cur.id }
  if (patch && patch.avatarId && !AVATAR_BY_ID[patch.avatarId]) {
    next.avatarId = cur.avatarId
  }
  // Validate name against others (if the name actually changed).
  if (patch && typeof patch.name === 'string' && patch.name !== cur.name) {
    const others = Object.values(rec.profiles)
      .filter((p) => p.id !== id)
      .map((p) => p.name)
    const v = validateName(patch.name, others)
    if (!v.ok) return { ok: false, error: v.error }
  }
  rec.profiles[id] = next
  if (safeWrite(scope, rec)) emit(scope)
  return { ok: true, profile: next }
}

// NOTE: Profile deletion was removed entirely. The picker has only
// "rename" (long-press) — no delete surface — because mis-tap deletion
// of a kid's progress is not worth the risk. If a future need arises
// (e.g. reset device), it can be re-added as an explicit settings menu
// with a confirm modal, not as a long-press gesture.

/**
 * Switch the active profile. Persists to localStorage so refresh and
 * other tabs (via the `storage` event) see the new selection. Returns
 * the profile on success, or null if the id is unknown.
 */
export function setActiveProfileId(scope, id) {
  const rec = safeRead(scope)
  if (!rec.profiles[id]) return null
  rec.activeProfileId = id
  if (safeWrite(scope, rec)) emit(scope)
  return rec.profiles[id]
}

/**
 * Read the adaptScore for a profile+topic. Returns `undefined` if unset.
 */
export function getAdaptScore(scope, profileId, topicKey) {
  if (!scope || !profileId || !topicKey) return undefined
  const rec = safeRead(scope)
  const p = rec.profiles[profileId]
  if (!p || !p.adaptScore) return undefined
  return p.adaptScore[topicKey]
}

/**
 * Write the adaptScore for a profile+topic. Returns the persisted value.
 * No-op (returns current value) if profile is missing.
 */
export function setAdaptScore(scope, profileId, topicKey, value) {
  if (!scope || !profileId || !topicKey) return value
  const rec = safeRead(scope)
  const p = rec.profiles[profileId]
  if (!p) return value
  if (!p.adaptScore || typeof p.adaptScore !== 'object') p.adaptScore = {}
  const v = Number(value)
  if (Number.isFinite(v)) p.adaptScore[topicKey] = v
  safeWrite(scope, rec) // best-effort; failures are logged inside safeWrite
  return p.adaptScore[topicKey]
}

/**
 * Wipe a scope entirely. Used on logout / reset.
 */
export function clearProfiles(scope) {
  try { localStorage.removeItem(storageKey(scope)) } catch { /* noop */ }
  emit(scope)
}

// ─── Scoped write debouncer ─────────────────────────────────────────────────
//
// setAdaptScore is called on every per-quiz adaptive score update. Writing
// to localStorage synchronously on every keystroke / score tick would be
// wasteful. This debouncer flushes pending writes at most once per
// WRITE_DEBOUNCE_MS per scope.

const pendingFlush = new Map()   // scope -> timer id

export function scheduleWrite(scope) {
  if (pendingFlush.has(scope)) return
  const t = setTimeout(() => {
    pendingFlush.delete(scope)
    // Re-read the latest from localStorage and write back; this catches
    // any concurrent updates that may have happened during the debounce.
    // For Day-1 usage there's only one writer per scope, so this is
    // effectively a no-op flush.
    const rec = safeRead(scope)
    safeWrite(scope, rec)
    emit(scope)
  }, WRITE_DEBOUNCE_MS)
  pendingFlush.set(scope, t)
}

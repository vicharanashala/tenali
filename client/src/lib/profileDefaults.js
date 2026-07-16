/**
 * Profile defaults — avatar palette + blank profile factory.
 *
 * No React. No localStorage. Pure constants + a helper that mints a blank
 * profile record. Loaded eagerly by profileStore.js and components.
 */

// Avatar palette — every tint derives from the existing product palette
// (warm browns, oranges, greens, restrained rose/lavender). No new color
// themes are introduced; values are picked to read clearly against both
// dark and light themes. Saturation is bumped (~15%) vs the muted v1
// palette so each animal reads with personality on the picker grid.
export const AVATARS = [
  { id: 'fox',      glyph: '🦊', tint: '#e8864a' }, // --clr-accent (dark)
  { id: 'owl',      glyph: '🦉', tint: '#7a6e62' }, // warm gray (deepened)
  { id: 'panda',    glyph: '🐼', tint: '#a48eb8' }, // warm gray-violet
  { id: 'tiger',    glyph: '🐯', tint: '#d97a2a' }, // vivid orange
  { id: 'lion',     glyph: '🦁', tint: '#e0a838' }, // gold
  { id: 'cat',      glyph: '🐱', tint: '#d96a8a' }, // rose
  { id: 'dog',      glyph: '🐶', tint: '#3da692' }, // teal
  { id: 'bear',     glyph: '🐻', tint: '#9a6e44' }, // warm brown
  { id: 'rabbit',   glyph: '🐰', tint: '#d96ab0' }, // rose variant
  { id: 'koala',    glyph: '🐨', tint: '#b298c5' }, // lavender
  { id: 'dragon',   glyph: '🐲', tint: '#5cb87a' }, // --clr-correct (dark)
  { id: 'unicorn',  glyph: '🦄', tint: '#b889e0' }, // soft purple
]

export const AVATAR_BY_ID = AVATARS.reduce((m, a) => {
  m[a.id] = a
  return m
}, {})

export const DEFAULT_AVATAR_ID = 'fox'

export const MAX_NAME_LEN = 24

/**
 * Generate a short random id like `p_8x3kq2a4`.
 * Sufficient for shared-device use; collision negligible.
 */
function genId() {
  return 'p_' + Math.random().toString(36).slice(2, 10)
}

/**
 * Build a fresh profile object. The caller is responsible for persisting
 * it via profileStore.createProfile.
 */
export function makeBlankProfile({ name, avatarId }) {
  const now = new Date().toISOString()
  return {
    id: genId(),
    name: String(name || '').trim().slice(0, MAX_NAME_LEN),
    avatarId: AVATAR_BY_ID[avatarId] ? avatarId : DEFAULT_AVATAR_ID,
    createdAt: now,
    lastUsedAt: now,
    adaptScore: {},
  }
}

/**
 * Validate a name. Returns either { ok: true } or { ok: false, error: '...' }.
 * `existingNames` is an array of strings from already-stored profiles
 * (lowercased). Comparison is case-insensitive.
 */
export function validateName(name, existingNames = []) {
  const trimmed = String(name || '').trim()
  if (!trimmed) return { ok: false, error: 'Please enter a name.' }
  if (trimmed.length > MAX_NAME_LEN) {
    return { ok: false, error: `Name must be ${MAX_NAME_LEN} characters or fewer.` }
  }
  const lower = trimmed.toLowerCase()
  if (existingNames.some(n => String(n).toLowerCase() === lower)) {
    return { ok: false, error: 'A profile with that name already exists.' }
  }
  return { ok: true }
}

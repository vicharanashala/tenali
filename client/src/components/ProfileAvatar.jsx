/**
 * ProfileAvatar — small reusable avatar circle.
 *
 * Renders a colored circle with the avatar's emoji glyph centered. Used in
 * the picker, the switcher, and (in future) the home-screen header to
 * indicate the active learner.
 *
 * Defensive: if the avatarId is unknown (data corruption, future palette
 * change), falls back to a generic neutral circle with the first letter
 * of the profile's name. Renders nothing if `profile` is null.
 */

import { AVATAR_BY_ID } from '../lib/profileDefaults.js'

const FALLBACK_TINT = '#64748b'

export default function ProfileAvatar({ profile, size = 72, active = false, onClick, className = '' }) {
  if (!profile) return null
  const a = AVATAR_BY_ID[profile.avatarId]
  const tint = a ? a.tint : FALLBACK_TINT
  const glyph = a ? a.glyph : (profile.name?.[0] || '?').toUpperCase()
  const fontSize = Math.round(size * 0.45)
  const style = {
    width: size, height: size, borderRadius: '50%',
    background: tint,
    display: 'grid', placeItems: 'center',
    fontSize, lineHeight: 1,
    userSelect: 'none',
    color: '#fff',
    boxShadow: active ? '0 0 0 3px var(--clr-accent, #f59e0b)' : 'none',
    cursor: onClick ? 'pointer' : 'default',
  }
  const cls = `profile-avatar ${active ? 'profile-avatar--active' : ''} ${className}`.trim()
  return (
    <span className={cls} style={style} onClick={onClick} aria-hidden={!onClick}>
      {glyph}
    </span>
  )
}

/**
 * ProfilePicker — full-screen "Who's Studying?" gate.
 *
 * Renders when the user is logged in (or using the default scope) and no
 * active profile exists for this session. (For a single-profile device,
 * AppGate's auto-pick handles that case so the picker is NOT shown.)
 *
 * Two modes based on profile count:
 *   - 0 profiles → welcome card with "Get started" CTA → create modal.
 *   - ≥1 profile → grid of existing profiles + "Add" card.
 *
 * Tap a profile card → switches to that profile, picker closes.
 * Tap the "Add" card → opens the create modal.
 * Long-press / right-click a profile → opens the rename modal.
 *
 * No delete surface — by design. Kids' progress is too easy to lose
 * via a mis-tap; rename covers the only realistic correction path.
 */

import { useRef, useState } from 'react'
import { useProfiles } from '../hooks/useProfiles.jsx'
import { AVATARS, MAX_NAME_LEN, validateName } from '../lib/profileDefaults.js'
import ProfileAvatar from './ProfileAvatar.jsx'

export default function ProfilePicker() {
  const { profiles, activeProfileId, createProfile, updateProfile, switchProfile } = useProfiles()
  const [userOpenedCreate, setUserOpenedCreate] = useState(false)
  const [renameTargetId, setRenameTargetId] = useState(null)
  // Refs survive across renders without triggering re-render. We use one
  // for the long-press timer and one to suppress the click that fires
  // immediately after the long-press timer fires (otherwise the user
  // would both rename AND switch in one gesture).
  const longPressTimerRef = useRef(null)
  const longPressFiredRef = useRef(false)
  const isFirstLaunch = profiles.length === 0
  // Modal opens only on explicit user action — welcome CTA on first
  // launch, "Add" card on subsequent visits. Never auto-pops.
  const showCreate = userOpenedCreate
  const renamingProfile = renameTargetId
    ? profiles.find((p) => p.id === renameTargetId) || null
    : null

  const handlePick = (id) => {
    // If a long-press just fired, swallow the trailing click so the
    // profile isn't also switched.
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false
      return
    }
    if (id !== activeProfileId) switchProfile(id)
  }

  const handleLongPress = (id) => {
    longPressFiredRef.current = true
    setRenameTargetId(id)
  }

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    // Reset the suppression flag ~100ms later so a quick subsequent
    // tap on a different card isn't accidentally swallowed.
    setTimeout(() => { longPressFiredRef.current = false }, 100)
  }

  // Long-press detector for rename: a 600ms hold (mouse, trackpad,
  // or touch) opens the rename modal. Bound to onMouseDown + onTouchStart
  // so trackpad users — who can't easily right-click — can still rename.
  const startLongPress = (id) => {
    cancelLongPress()
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null
      handleLongPress(id)
    }, 600)
    window.addEventListener('mouseup', cancelLongPress, { once: true })
    window.addEventListener('touchend', cancelLongPress, { once: true })
    window.addEventListener('mouseleave', cancelLongPress, { once: true })
    window.addEventListener('blur', cancelLongPress, { once: true })
  }

  // ─── First-launch welcome card ─────────────────────────────────────
  if (isFirstLaunch) {
    return (
      <div className="profile-picker-screen" role="dialog" aria-modal="true" aria-label="Welcome">
        <div className="profile-welcome">
          <img src="/tenali.png" alt="Tenali Logo" className="profile-welcome-logo" />
          <h1 className="profile-welcome-title">Welcome to Tenali</h1>
          <p className="profile-welcome-text">
            Pick your avatar and name to start learning.
          </p>
          <button
            type="button"
            className="profile-welcome-cta"
            onClick={() => setUserOpenedCreate(true)}
          >
            Get started
          </button>
        </div>

        {showCreate && (
          <ProfileFormModal
            // No "Cancel" available on first launch — there is nothing to
            // cancel back to. The modal closes only via Create or Esc.
            onClose={null}
            onSubmit={(name, avatarId) => {
              const res = createProfile(name, avatarId)
              if (res && res.ok) {
                setUserOpenedCreate(false)
              }
              return res
            }}
          />
        )}
      </div>
    )
  }

  // ─── Normal picker (≥1 profile exists) ─────────────────────────────
  return (
    <div className="profile-picker-screen" role="dialog" aria-modal="true" aria-label="Choose your profile">
      <h1 className="profile-picker-title">Who's Studying?</h1>
      <p className="profile-picker-subtitle">Tap your profile to start learning.</p>

      <div className="profile-grid">
        {profiles.map(p => (
          <div key={p.id}
               className={`profile-card ${p.id === activeProfileId ? 'profile-card--active' : ''}`}
               onClick={() => handlePick(p.id)}
               onContextMenu={(e) => { e.preventDefault(); handleLongPress(p.id) }}
               onMouseDown={() => startLongPress(p.id)}
               onTouchStart={() => startLongPress(p.id)}
               role="button"
               tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePick(p.id) } }}>
            <ProfileAvatar profile={p} size={96} active={p.id === activeProfileId} />
            <div className="profile-name">{p.name}</div>
          </div>
        ))}

        <div className="profile-card profile-card--add"
             onClick={() => setUserOpenedCreate(true)}
             role="button"
             tabIndex={0}
             onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setUserOpenedCreate(true) } }}>
          <span className="profile-avatar profile-avatar--placeholder profile-avatar--lg" aria-hidden="true">＋</span>
          <div className="profile-name">Add new</div>
        </div>
      </div>

      <div className="profile-picker-hint">
        Long-press or right-click a profile to rename it.
      </div>

      {showCreate && (
        <ProfileFormModal
          onClose={() => setUserOpenedCreate(false)}
          onSubmit={(name, avatarId) => createProfile(name, avatarId)}
          existingNames={profiles.map((p) => p.name)}
        />
      )}

      {renamingProfile && (
        <ProfileFormModal
          editingProfile={renamingProfile}
          onClose={() => setRenameTargetId(null)}
          onSubmit={(name, avatarId) => {
            const result = updateProfile(renamingProfile.id, { name, avatarId })
            return { ok: !!result, profile: result }
          }}
          // Exclude the current profile's own name when validating, so
          // renaming "Arjun" → "Arjun" doesn't trip the duplicate check.
          existingNames={profiles
            .filter((p) => p.id !== renamingProfile.id)
            .map((p) => p.name)}
        />
      )}
    </div>
  )
}

/**
 * ProfileFormModal — unified form for create and rename.
 *
 * - `editingProfile` (optional): when present, prefills the form and the
 *   modal acts as a rename; calls `onSubmit(name, avatarId)` which is
 *   expected to update the profile. Title becomes "Edit profile" and
 *   the primary button becomes "Save".
 * - `onSubmit(name, avatarId)`: returns { ok: boolean, error?: string }.
 * - `existingNames`: array of names to validate against (excludes the
 *   profile being renamed, if any). Duplicate check fires only for
 *   names that aren't the profile's own current name.
 * - `onClose`: when null, the Cancel button is hidden (first-launch flow).
 */
function ProfileFormModal({ onClose, onSubmit, editingProfile = null, existingNames = [] }) {
  const [name, setName] = useState(editingProfile?.name || '')
  const [avatarId, setAvatarId] = useState(editingProfile?.avatarId || AVATARS[0].id)
  const [error, setError] = useState('')

  const isEdit = !!editingProfile

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    // Client-side duplicate-name validation (server-side equivalent lives
    // in store.updateProfile as a safety net). Faster feedback + prevents
    // a rename from succeeding with a name already used by a sibling.
    const v = validateName(name, existingNames)
    if (!v.ok) {
      setError(v.error)
      return
    }
    const result = onSubmit(name, avatarId)
    if (!result || !result.ok) {
      setError(result?.error || 'Could not save profile.')
      return
    }
    setName('')
    setError('')
    onClose?.()
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose || undefined}>
      <form className="profile-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 className="profile-modal-title">{isEdit ? 'Edit profile' : 'New profile'}</h2>

        <label className="profile-modal-label">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value.slice(0, MAX_NAME_LEN)); setError('') }}
            autoFocus
            maxLength={MAX_NAME_LEN}
            placeholder="e.g. Arjun"
            className="profile-modal-input"
          />
        </label>

        <div className="profile-modal-label">{isEdit ? 'Avatar' : 'Choose an avatar'}</div>
        <div className="profile-avatar-grid">
          {AVATARS.map(a => (
            <span
              key={a.id}
              className={`profile-avatar profile-avatar--pick ${a.id === avatarId ? 'profile-avatar--selected' : ''}`}
              style={{ background: a.tint }}
              onClick={() => setAvatarId(a.id)}
              role="radio"
              aria-checked={a.id === avatarId}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAvatarId(a.id) } }}
            >
              {a.glyph}
            </span>
          ))}
        </div>

        {error && <p className="profile-modal-error">{error}</p>}

        <div className="profile-modal-actions">
          {onClose && (
            <button type="button" onClick={onClose} className="profile-modal-cancel">Cancel</button>
          )}
          <button type="submit" disabled={!name.trim()} className="profile-modal-submit">
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

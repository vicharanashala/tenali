/**
 * ProfileSwitcher — in-app modal for mid-session profile switches.
 *
 * Opened from the AuthMenu's "Switch Profile" item. Lists all profiles in
 * a horizontal row, lets the user pick a different one (or create a new
 * one), and closes on Esc / outside click. After switching, the parent
 * re-renders; because <ActiveApp> is keyed on `${activeProfileId}-${mode}`,
 * the new profile starts fresh.
 *
 * Distinct from ProfilePicker because:
 *   - ProfilePicker is a full-screen gate; ProfileSwitcher is a modal.
 *   - ProfileSwitcher is shown while another route is already mounted;
 *     ProfilePicker has its own create + rename modal but uses a tighter
 *     grid layout.
 */

import { useEffect, useState } from 'react'
import { useProfiles } from '../hooks/useProfiles.jsx'
import { AVATARS, MAX_NAME_LEN } from '../lib/profileDefaults.js'
import ProfileAvatar from './ProfileAvatar.jsx'

export default function ProfileSwitcher({ onClose }) {
  const { profiles, activeProfileId, switchProfile, createProfile } = useProfiles()
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handlePick = (id) => {
    if (id !== activeProfileId) {
      switchProfile(id)
    }
    onClose?.()
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="profile-modal-title">Switch profile</h2>
        <p className="profile-modal-hint">Tap a profile to switch. Current progress in the active quiz will reset.</p>

        <div className="profile-switcher-list">
          {profiles.map(p => (
            <button
              key={p.id}
              type="button"
              className={`profile-card profile-card--inline ${p.id === activeProfileId ? 'profile-card--active' : 'profile-card--muted'}`}
              onClick={() => handlePick(p.id)}
            >
              <ProfileAvatar profile={p} size={64} active={p.id === activeProfileId} />
              <div className="profile-name">{p.name}</div>
            </button>
          ))}
          <button
            type="button"
            className="profile-card profile-card--inline profile-card--add"
            onClick={() => setShowCreate(true)}
          >
            <span className="profile-avatar profile-avatar--placeholder profile-avatar--inline" aria-hidden="true">＋</span>
            <div className="profile-name">Add new</div>
          </button>
        </div>

        <div className="profile-modal-actions">
          <button type="button" onClick={onClose} className="profile-modal-cancel">Close</button>
        </div>

        {showCreate && (
          <MiniCreateModal
            onClose={() => setShowCreate(false)}
            onCreate={(name, avatarId) => {
              const r = createProfile(name, avatarId)
              if (!r.ok) return r
              setShowCreate(false)
              return r
            }}
          />
        )}
      </div>
    </div>
  )
}

function MiniCreateModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState(AVATARS[0].id)
  const [error, setError] = useState('')

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const result = onCreate(name, avatarId)
    if (!result || !result.ok) {
      setError(result?.error || 'Could not create profile.')
      return
    }
  }

  return (
    <div className="profile-modal-overlay profile-modal-overlay--nested" onClick={onClose}>
      <form className="profile-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 className="profile-modal-title">New profile</h2>

        <label className="profile-modal-label">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value.slice(0, MAX_NAME_LEN)); setError('') }}
            autoFocus
            maxLength={MAX_NAME_LEN}
            placeholder="e.g. Akka"
            className="profile-modal-input"
          />
        </label>

        <div className="profile-modal-label">Avatar</div>
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
          <button type="button" onClick={onClose} className="profile-modal-cancel">Cancel</button>
          <button type="submit" disabled={!name.trim()} className="profile-modal-submit">Create</button>
        </div>
      </form>
    </div>
  )
}
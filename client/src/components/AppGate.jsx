/**
 * AppGate — owns the picker gate. Renders the full-screen "Who's Studying?"
 * screen when no profile is active, otherwise renders the normal app
 * shell. Must be a child of <ProfilesProvider> (mounted in main.jsx).
 *
 * Behavior:
 *   - 0 profiles → welcome screen inside picker.
 *   - ≥1 profile, no activeProfileId yet (corrupt storage or cleared
 *     active pointer only) → picker shows.
 *   - activeProfileId set → home shell.
 *
 * `activeProfileId` is persisted in localStorage and synced across tabs
 * via the `storage` event. On every page load it is read back, so
 * refresh / new-tab / cross-tab all land on the same active learner.
 *
 * Also tracks profile-switch transitions: when activeProfileId changes
 * mid-session, fires a brief full-screen glow overlay.
 */

import { useRef, useState, useEffect } from 'react'
import { useProfiles } from '../hooks/useProfiles.jsx'
import ProfilePicker from './ProfilePicker.jsx'

export default function AppGate({ children }) {
  const { ready, activeProfileId } = useProfiles()
  const prevProfileIdRef = useRef(activeProfileId)
  const [pulseKey, setPulseKey] = useState(0)

  // Detect actual mid-session profile changes and fire the glow pulse.
  // First mount does NOT trigger glow (prevProfileIdRef.current starts
  // null and the first assignment is from null → id).
  useEffect(() => {
    if (!ready) return
    if (prevProfileIdRef.current && prevProfileIdRef.current !== activeProfileId) {
      setPulseKey((k) => k + 1)
    }
    prevProfileIdRef.current = activeProfileId
  }, [ready, activeProfileId])

  if (!ready) return null

  if (!activeProfileId) {
    return (
      <div className="app-shell app-shell--gate">
        <ProfilePicker />
      </div>
    )
  }

  return (
    <>
      {children}
      {pulseKey > 0 && <ProfileSwitchPulse key={pulseKey} />}
    </>
  )
}

/**
 * ProfileSwitchPulse — full-screen accent glow that fires on profile
 * change. Mounts → CSS keyframe runs once → unmounts. Re-mounting with
 * a new key restarts the animation.
 */
function ProfileSwitchPulse() {
  return <div className="profile-switch-overlay profile-switch-overlay--on" aria-hidden="true" />
}

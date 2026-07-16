/**
 * useProfiles — context hook for the active learner profile.
 *
 * Wraps the entire app inside <ProfilesProvider>. The hook:
 *   - reads the storage scope from useAuth().user?.username || 'default'
 *   - loads the profiles list from localStorage (per-profile data like
 *     adaptScore IS persisted; the active profile pointer is NOT)
 *   - tracks the active profile id IN REACT STATE ONLY — page refresh /
 *     tab close wipes it, picker re-opens
 *   - listens to PROFILE_CHANGE_EVENT + 'storage' for cross-component sync
 *   - clears in-memory activeProfileId on scope change (login/logout)
 *
 * useProfiles() MUST be rendered inside <ProfilesProvider>. It throws a
 * helpful error if called outside, since misuse is a programming bug.
 *
 * Note: this file exports both a component and a hook, which trips the
 * `react-refresh/only-export-components` rule in dev. The lint rule is
 * disabled file-wide because Fast Refresh for a context+hook pair is a
 * known acceptable tradeoff and we always rebuild the bundle anyway.
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as store from '../lib/profileStore.js'

const ProfilesContext = createContext(null)

export function ProfilesProvider({ authUser, children }) {
  // Scope is derived from the auth user. Falls back to 'default' so the
  // system still works if auth is removed or restructured.
  const scope = authUser?.username || 'default'

  // Track scope changes during render. When scope changes (login/logout),
  // re-read storage synchronously and clear the in-memory active profile.
  // This is the React-recommended "store the previous prop" pattern.
  const prevScopeRef = useRef(scope)
  const [record, setRecord] = useState(() => store.loadProfiles(scope))
  const [activeProfileId, setActiveProfileId] = useState(null)
  if (prevScopeRef.current !== scope) {
    prevScopeRef.current = scope
    setRecord(store.loadProfiles(scope))
    setActiveProfileId(null)
  }

  // Listen for in-process and cross-tab profile-list changes.
  useEffect(() => {
    const refresh = () => setRecord(store.loadProfiles(scope))
    window.addEventListener(store.PROFILE_CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(store.PROFILE_CHANGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [scope])

  // Profiles sorted in creation order (createdAt asc): first profile created
  // appears first in both the picker grid and the switcher modal.
  const profiles = useMemo(
    () => Object.values(record.profiles || {}).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    ),
    [record]
  )
  const activeProfile = activeProfileId
    ? record.profiles[activeProfileId] || null
    : null

  const createProfile = useCallback((name, avatarId) => {
    const result = store.createProfile(scope, name, avatarId)
    if (result.ok) {
      setRecord(store.loadProfiles(scope))
      return { ...result, profile: { ...result.profile, id: result.profile.id } }
    }
    return result
  }, [scope])

  // Update name/avatar for an existing profile. Validates against
  // duplicate names. Used by the rename modal.
  const updateProfile = useCallback((id, patch) => {
    const result = store.updateProfile(scope, id, patch)
    if (result.ok) setRecord(store.loadProfiles(scope))
    return result
  }, [scope])

  // In-memory only — no localStorage write. Page refresh wipes this.
  const switchProfile = useCallback((id) => {
    const next = id == null ? null : (record.profiles[id] || null)
    setActiveProfileId(next ? id : null)
    return next
  }, [record])

  const value = useMemo(() => ({
    scope,
    ready: true,           // storage read is synchronous during render; always ready
    profiles,
    activeProfile,
    activeProfileId,
    createProfile,
    updateProfile,
    switchProfile,
  }), [scope, profiles, activeProfile, activeProfileId, createProfile, updateProfile, switchProfile])

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext)
  if (!ctx) {
    throw new Error('useProfiles() called outside <ProfilesProvider>')
  }
  return ctx
}

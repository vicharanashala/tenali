/**
 * useAdaptiveScore — per-profile, per-topic adaptive difficulty score.
 *
 * Drop-in replacement for the existing `useState(0)` pattern that drives
 * each quiz's adaptScore. Returns the same `[score, ref, setScore]` tuple
 * used throughout the codebase:
 *
 *   const [adaptScore, adaptScoreRef, setAdaptScore] = useAdaptiveScore('trig-api', 0)
 *
 * - Initial value is seeded from the active profile's adaptScore[topicKey].
 * - setScore() updates local state AND the ref synchronously (so async
 *   fetch callbacks see the latest value, matching the existing
 *   adaptScoreRef pattern in the factory).
 * - Changes are debounced (250 ms) to localStorage to avoid hammering the
 *   storage on every keystroke / score tick.
 *
 * The hook survives scope/profile changes ONLY if its caller remounts via
 * React key. The factory adds `key={`${activeProfileId}-${mode}`}` on
 * <ActiveApp>, which remounts every quiz instance — that propagates to
 * this hook automatically.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useProfiles } from './useProfiles.jsx'
import * as store from '../lib/profileStore.js'

export function useAdaptiveScore(topicKey, initial = 0) {
  const { scope, activeProfileId } = useProfiles()

  // Seed from storage on mount / profile change. If no active profile
  // (shouldn't happen — picker gates this), fall back to initial.
  const seed = useMemo(() => {
    if (!activeProfileId || !topicKey) return initial
    const v = store.getAdaptScore(scope, activeProfileId, topicKey)
    return Number.isFinite(v) ? v : initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, activeProfileId, topicKey])

  const [score, setScoreState] = useState(seed)
  const scoreRef = useRef(seed)

  // Keep ref in sync if score is updated by other code paths (rare).
  useEffect(() => { scoreRef.current = score }, [score])

  const setScore = useCallback((valueOrFn) => {
    // Compute next value (support functional updates).
    const next = typeof valueOrFn === 'function'
      ? valueOrFn(scoreRef.current)
      : valueOrFn
    if (!Number.isFinite(next)) return
    scoreRef.current = next
    setScoreState(next)
    // Persist (debounced) to active profile. Guard for missing profile.
    if (activeProfileId && topicKey) {
      store.setAdaptScore(scope, activeProfileId, topicKey, next)
      store.scheduleWrite(scope)
    }
  }, [scope, activeProfileId, topicKey])

  return [score, scoreRef, setScore]
}

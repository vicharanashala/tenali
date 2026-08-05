/**
 * useScreenActivity — Monitors user activity on the page.
 *
 * Tracks:
 *   - Mouse movement and clicks
 *   - Keyboard presses
 *   - Idle detection (no activity for N seconds)
 *   - Focus/blur state
 *
 * Fires callback when user is idle beyond threshold.
 */

import { useEffect, useRef, useCallback } from 'react'

const IDLE_THRESHOLD_MS = 60000 // 60 seconds of no activity = idle

export default function useScreenActivity({ enabled = false, onIdle, onActivity }) {
  const lastActivityRef = useRef(0)
  const idleCheckRef = useRef(null)
  const onIdleRef = useRef(onIdle)
  const onActivityRef = useRef(onActivity)

  useEffect(() => { onIdleRef.current = onIdle })
  useEffect(() => { onActivityRef.current = onActivity })

  // Initialize activity timestamp
  useEffect(() => {
    if (enabled) lastActivityRef.current = Date.now()
  }, [enabled])

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    onActivityRef.current?.()
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = () => recordActivity()
    const handleClick = () => recordActivity()
    const handleKeyDown = () => recordActivity()
    const handleScroll = () => recordActivity()
    const handleFocus = () => recordActivity()

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('click', handleClick, { passive: true })
    window.addEventListener('keydown', handleKeyDown, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('focus', handleFocus, { passive: true })

    // Check for idle every 10 seconds
    idleCheckRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current
      if (elapsed >= IDLE_THRESHOLD_MS) {
        onIdleRef.current?.({
          type: 'idle',
          severity: 1,
          metadata: { idleMs: elapsed, idleSeconds: Math.round(elapsed / 1000) },
        })
      }
    }, 10000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('focus', handleFocus)
      clearInterval(idleCheckRef.current)
    }
  }, [enabled, recordActivity])
}

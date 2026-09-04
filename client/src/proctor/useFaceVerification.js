/**
 * useFaceVerification — Identity verification via CompreFace REST API.
 *
 * Optional server-backed layer for high-security exams.
 * Captures reference photo on quiz start, verifies identity every 30 seconds.
 *
 * Graceful degradation: if CompreFace unreachable, verification is skipped.
 * CPU-optimized: runs on CompreFace's CPU embedding server.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { captureScreenshot } from './proctorEvents'

const VERIFY_INTERVAL_MS = 30000
const GRACE_MS = 15000
const SIMILARITY_THRESHOLD = 0.88

const API = import.meta.env?.VITE_API_BASE_URL || ''

function getToken() {
  try { return localStorage.getItem('tenali-auth-token') || null } catch { return null }
}

export default function useFaceVerification({ videoRef, enabled = false, sessionId, onAnomaly }) {
  const [referenceRegistered, setReferenceRegistered] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [lastSimilarity, setLastSimilarity] = useState(null)
  const intervalRef = useRef(null)
  const graceRef = useRef(true)
  const onRef = useRef(null)

  useEffect(() => { onRef.current = onAnomaly })

  useEffect(() => {
    if (enabled) {
      graceRef.current = true
      const t = setTimeout(() => { graceRef.current = false }, GRACE_MS)
      return () => clearTimeout(t)
    }
  }, [enabled])

  // Register reference face on quiz start
  const registerReference = useCallback(async () => {
    if (!videoRef?.current) return false
    const screenshot = await captureScreenshot(videoRef.current)
    if (!screenshot) return false
    try {
      const token = getToken()
      const r = await fetch(`${API}/api/proctor/face/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId, image: screenshot }),
      })
      if (r.ok) {
        setReferenceRegistered(true)
        return true
      }
    } catch { /* CompreFace unreachable — skip */ }
    return false
  }, [videoRef, sessionId])

  // Verify identity against reference
  const verify = useCallback(async () => {
    if (!referenceRegistered || graceRef.current) return
    const screenshot = await captureScreenshot(videoRef.current)
    if (!screenshot) return
    try {
      setVerifying(true)
      const token = getToken()
      const r = await fetch(`${API}/api/proctor/face/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId, image: screenshot }),
      })
      if (r.ok) {
        const data = await r.json()
        const similarity = data.similarity || 0
        setLastSimilarity(similarity)
        if (similarity < SIMILARITY_THRESHOLD) {
          onRef.current?.({
            type: 'face_mismatch',
            severity: 3,
            metadata: { similarity: Math.round(similarity * 100) + '%', threshold: SIMILARITY_THRESHOLD * 100 + '%' },
          })
        }
      }
    } catch { /* CompreFace unreachable — skip */ }
    finally { setVerifying(false) }
  }, [referenceRegistered, videoRef, sessionId])

  // Auto-register reference when enabled
  const registeredRef = useRef(false)
  useEffect(() => {
    if (enabled && !registeredRef.current) {
      registeredRef.current = true
      void registerReference()
    }
    if (!enabled) registeredRef.current = false
  }, [enabled, registerReference])

  // Periodic verification
  useEffect(() => {
    if (!enabled || !referenceRegistered) return
    intervalRef.current = setInterval(verify, VERIFY_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, referenceRegistered, verify])

  return { referenceRegistered, verifying, lastSimilarity, registerReference }
}

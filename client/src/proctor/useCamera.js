/**
 * useCamera — Camera hook matching vibe's pattern.
 *
 * Manages getUserMedia stream and attaches to a <video> ref.
 * Requests audio alongside video so mic permission is bundled with camera.
 * Uses reasonable resolution (640x480) for clarity without overwhelming CPU.
 */

import { useRef, useCallback, useEffect, useState } from 'react'

export default function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    if (streamRef.current) return
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      })
      streamRef.current = stream
      attachStream(videoRef.current, stream)
      setIsRunning(true)
    } catch (e) {
      setError(e.message || 'Camera access denied')
      setIsRunning(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsRunning(false)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
        attachStream(videoRef.current, streamRef.current)
      }
    }, 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return { videoRef, stream: streamRef, isRunning, error, start, stop }
}

function attachStream(video, stream) {
  if (!video || !stream) return
  if (video.srcObject === stream) return
  video.srcObject = stream
  video.play().catch(() => {})
}

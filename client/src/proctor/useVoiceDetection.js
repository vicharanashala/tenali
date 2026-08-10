/**
 * useVoiceDetection — Detects voice/speech using Web Audio API.
 *
 * Uses the camera stream's audio track (shared via ProctorContext).
 * Falls back to separate getUserMedia if camera stream unavailable.
 *
 * Fixes applied:
 *   - Uses camera stream audio track (no second permission prompt)
 *   - AudioContext.resume() for browser compatibility
 *   - Frequency band filtering (85Hz-4kHz speech range only)
 *   - Raised threshold to reduce false positives
 */

import { useEffect, useRef, useCallback } from 'react'

const SPEECH_HIGH_BIN = 23

export default function useVoiceDetection({ enabled = false, onAnomaly, streamRef, threshold = 0.25 }) {
  const contextRef = useRef(null)
  const analyserRef = useRef(null)
  const activeStreamRef = useRef(null)
  const rafRef = useRef(null)
  const onRef = useRef(null)
  const graceRef = useRef(true)

  useEffect(() => { onRef.current = onAnomaly })

  useEffect(() => {
    if (enabled) {
      graceRef.current = true
      const t = setTimeout(() => { graceRef.current = false }, 10000)
      return () => clearTimeout(t)
    }
  }, [enabled])

  const stopListening = useCallback(() => {
    clearTimeout(rafRef.current)
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop())
      activeStreamRef.current = null
    }
    if (contextRef.current) {
      contextRef.current.close().catch(() => {})
      contextRef.current = null
    }
    analyserRef.current = null
    onRef.current?.(false)
  }, [])

  const startListening = useCallback(async () => {
    if (!enabled) return
    try {
      let audioStream = null

      const cameraStream = streamRef?.current
      if (cameraStream) {
        const audioTracks = cameraStream.getAudioTracks()
        if (audioTracks.length > 0) {
          audioStream = new MediaStream(audioTracks)
        }
      }

      if (!audioStream) {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        activeStreamRef.current = audioStream
      }

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      contextRef.current = ctx
      await ctx.resume()

      const source = ctx.createMediaStreamSource(audioStream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.3
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const CHECK_INTERVAL_MS = 100

      const check = () => {
        analyser.getByteFrequencyData(dataArray)

        let sum = 0
        let count = 0
        const highBin = Math.min(SPEECH_HIGH_BIN, dataArray.length)
        for (let i = 1; i < highBin; i++) {
          sum += dataArray[i]
          count++
        }
        const avg = count > 0 ? sum / count / 255 : 0

        if (!graceRef.current) {
          onRef.current?.(avg > threshold)
        }
        rafRef.current = setTimeout(check, CHECK_INTERVAL_MS)
      }
      check()
    } catch {
      onRef.current?.(false)
    }
  }, [enabled, streamRef, threshold])

  useEffect(() => {
    if (enabled) void startListening()
    else void stopListening()
    return () => { void stopListening() }
  }, [enabled, startListening, stopListening])

  return {}
}

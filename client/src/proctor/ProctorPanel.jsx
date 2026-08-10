/**
 * ProctorPanel — Left-side proctoring panel matching vibe's architecture.
 *
 * Architecture:
 *   1. Camera lifecycle managed here (with audio for voice detection)
 *   2. ALL detection hooks call reportWithScreenshot directly (no polling loop)
 *   3. isAnomalyDetected clears automatically when conditions normalize
 *   4. FloatingVideo renders the UI + toast notifications
 *   5. Screenshots captured on each anomaly for dashboard evidence
 *
 * Compulsory detections (always ON):
 *   - Webcam video
 *   - Audio/voice detection
 *   - Motion/scene detection
 *   - Tab switching
 *   - Face detection
 *   - Blur detection
 *   - Anti-cheat
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import useProctor from './useProctor'
import FloatingVideo from './FloatingVideo'
import useTabSwitch from './useTabSwitch'
import useAntiCheat from './useAntiCheat'
import useBlurDetector from './useBlurDetector'
import useVoiceDetection from './useVoiceDetection'
import useMotionDetector from './useMotionDetector'
import useFaceDetector from './useFaceDetector'
import useEmotionDetection from './useEmotionDetection'
import useScreenActivity from './useScreenActivity'
import useSpeechTranscript from './useSpeechTranscript'
import { reportProctorEvent, captureScreenshot } from './proctorEvents'

const GRACE_PERIOD_MS = 10000
const PER_TYPE_COOLDOWN_MS = 5000
const ANOMALY_CLEAR_MS = 4000

export default function ProctorPanel() {
  const {
    enabled, sessionId, penaltyScore, anomalies,
    addPenalty, addAnomaly, camera, cameraError, setCameraError,
  } = useProctor()

  const [faceCount, setFaceCount] = useState(1)
  const [penaltyType, setPenaltyType] = useState('')
  const [anomalyDetectionReady, setAnomalyDetectionReady] = useState(false)
  const [isAnomalyDetected, setIsAnomalyDetected] = useState(false)
  const readyTimeRef = useRef(0)
  const lastAnomalyTime = useRef({})
  const lastPenaltyTime = useRef({})
  const anomalyClearTimer = useRef(null)
  const prevAnomalyCountRef = useRef(0)
  const activeAnomalyTypesRef = useRef(new Set())

  const clearAnomalyAlert = useCallback(() => {
    clearTimeout(anomalyClearTimer.current)
    anomalyClearTimer.current = setTimeout(() => {
      activeAnomalyTypesRef.current = new Set()
      setIsAnomalyDetected(false)
    }, ANOMALY_CLEAR_MS)
  }, [])

  const markAnomalyActive = useCallback((type) => {
    activeAnomalyTypesRef.current.add(type)
    setIsAnomalyDetected(true)
    clearTimeout(anomalyClearTimer.current)
  }, [])

  const markAnomalyCleared = useCallback((type) => {
    activeAnomalyTypesRef.current.delete(type)
    if (activeAnomalyTypesRef.current.size === 0) {
      clearAnomalyAlert()
    }
  }, [clearAnomalyAlert])

  const reportWithScreenshot = useCallback(async (evt, severity) => {
    const screenshot = await captureScreenshot(camera.videoRef.current)
    const enriched = { ...evt, screenshot }
    addAnomaly(enriched)

    const now = Date.now()
    const key = evt.type
    if (!lastPenaltyTime.current[key] || now - lastPenaltyTime.current[key] > PER_TYPE_COOLDOWN_MS) {
      lastPenaltyTime.current[key] = now
      addPenalty(severity || evt.severity || 1)
      setPenaltyType(evt.type)
    }

    reportProctorEvent({ sessionId, type: evt.type, severity: severity || evt.severity || 1, evidence: screenshot, metadata: evt.metadata })
  }, [camera.videoRef, sessionId, addAnomaly, addPenalty])

  const throttledReport = useCallback((evt, severity) => {
    const now = Date.now()
    const key = evt.type
    if (lastAnomalyTime.current[key] && now - lastAnomalyTime.current[key] < PER_TYPE_COOLDOWN_MS) return
    lastAnomalyTime.current[key] = now
    reportWithScreenshot(evt, severity)
  }, [reportWithScreenshot])

  useEffect(() => {
    if (anomalies.length > prevAnomalyCountRef.current) {
      prevAnomalyCountRef.current = anomalies.length
    }
  }, [anomalies.length])

  useEffect(() => {
    let cancelled = false
    if (enabled) {
      camera.start()
        .then(() => { if (!cancelled) setCameraError(null) })
        .catch(e => { if (!cancelled) setCameraError(e.message || 'Camera access denied') })
    } else {
      camera.stop()
    }
    return () => { cancelled = true; camera.stop() }
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (enabled && camera.isRunning && !anomalyDetectionReady) {
      const timer = setTimeout(() => {
        readyTimeRef.current = Date.now()
        setAnomalyDetectionReady(true)
      }, GRACE_PERIOD_MS)
      return () => clearTimeout(timer)
    }
  }, [enabled, camera.isRunning, anomalyDetectionReady])

  useTabSwitch({
    onTabSwitch: useCallback((evt) => {
      if (!enabled || !anomalyDetectionReady) return
      markAnomalyActive(evt.type)
      throttledReport(evt, 1)
    }, [enabled, anomalyDetectionReady, throttledReport, markAnomalyActive]),
    onTabReturn: useCallback(() => {
      markAnomalyCleared('tab_switch')
      markAnomalyCleared('tab_blur')
    }, [markAnomalyCleared]),
    enabled,
  })

  useAntiCheat({
    enabled,
    onViolation: useCallback((evt) => {
      if (!enabled || !anomalyDetectionReady) return
      throttledReport(evt, 1)
    }, [enabled, anomalyDetectionReady, throttledReport]),
  })

  useBlurDetector({
    videoRef: camera.videoRef,
    enabled: enabled && anomalyDetectionReady,
    onAnomaly: useCallback((isBlur) => {
      if (isBlur) {
        markAnomalyActive('blur_detected')
        throttledReport({ type: 'blur_detected', severity: 2 }, 2)
      } else {
        markAnomalyCleared('blur_detected')
      }
    }, [throttledReport, markAnomalyActive, markAnomalyCleared]),
  })

  const { getTranscript, clearTranscript } = useSpeechTranscript({
    enabled: enabled && anomalyDetectionReady,
  })

  useVoiceDetection({
    enabled: enabled && anomalyDetectionReady,
    streamRef: camera.stream,
    onAnomaly: useCallback((isSpeaking) => {
      if (isSpeaking) {
        const spokenText = getTranscript()
        markAnomalyActive('voice_detected')
        throttledReport({ type: 'voice_detected', severity: 1, metadata: { transcript: spokenText || '' } }, 1)
        clearTranscript()
      } else {
        markAnomalyCleared('voice_detected')
      }
    }, [throttledReport, markAnomalyActive, markAnomalyCleared, getTranscript, clearTranscript]),
  })

  useMotionDetector({
    videoRef: camera.videoRef,
    enabled: enabled && anomalyDetectionReady,
    onAnomaly: useCallback((evt) => {
      if (!anomalyDetectionReady) return
      markAnomalyActive(evt.type)
      throttledReport(evt, evt.severity || 1)
    }, [anomalyDetectionReady, throttledReport, markAnomalyActive]),
  })

  useFaceDetector({
    videoRef: camera.videoRef,
    enabled: enabled && anomalyDetectionReady,
    onAnomaly: useCallback((evt) => {
      if (!anomalyDetectionReady) return
      markAnomalyActive(evt.type)
      throttledReport(evt, evt.severity || 2)
    }, [anomalyDetectionReady, throttledReport, markAnomalyActive]),
    onFaceCount: useCallback((count) => {
      setFaceCount(count)
      if (count === 1) {
        markAnomalyCleared('no_face')
        markAnomalyCleared('multiple_faces')
      }
    }, [markAnomalyCleared]),
  })

  // Emotion detection (Phase 1: real-time webcam emotion recognition)
  const { emotion, struggling } = useEmotionDetection({
    videoRef: camera.videoRef,
    enabled: enabled && anomalyDetectionReady,
    onEmotion: useCallback((payload) => {
      try {
        const KEY = 'tenali_emotion_timeline'
        const existing = JSON.parse(sessionStorage.getItem(KEY) || '[]')
        const last = existing[existing.length - 1]
        if (!last || payload.timestamp - last.timestamp > 2400) {
          existing.push({
            emotion: payload.emotion,
            confidence: payload.confidence,
            timestamp: payload.timestamp,
          })
          if (existing.length > 200) existing.splice(0, existing.length - 200)
          sessionStorage.setItem(KEY, JSON.stringify(existing))
        }
      } catch {
        /* sessionStorage unavailable */
      }
    }, []),
  })
  useScreenActivity({
    enabled: enabled && anomalyDetectionReady,
    onIdle: useCallback((evt) => {
      if (!anomalyDetectionReady) return
      throttledReport(evt, 1)
    }, [anomalyDetectionReady, throttledReport]),
    onActivity: useCallback(() => {
      markAnomalyCleared('idle')
    }, [markAnomalyCleared]),
  })

  if (!enabled) return null

  return (
    <FloatingVideo
      videoRef={camera.videoRef}
      isRunning={camera.isRunning}
      error={cameraError}
      penaltyScore={penaltyScore}
      anomalies={anomalies}
      isAnomalyDetected={isAnomalyDetected}
      penaltyType={penaltyType}
      faceCount={faceCount}
      emotion={emotion}
      struggling={struggling}
      onDismissStruggling={() => {
        try { sessionStorage.setItem('tenali_struggling_dismissed', String(Date.now())) } catch {}
      }}
    />
  )
}

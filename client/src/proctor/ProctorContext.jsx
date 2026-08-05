/**
 * ProctorContext — React context providing proctoring state across the app.
 *
 * Provides:
 *   - enabled: whether proctoring is active
 *   - camera: shared camera instance (videoRef, isRunning, start, stop, etc.)
 *   - All detection state, penalty, anomalies
 */

import { createContext, useState, useCallback, useRef } from 'react'
import useCamera from './useCamera'

const ProctorContext = createContext(null)

// Compulsory settings — always ON, cannot be disabled by user
const DEFAULT_SETTINGS = {
  webcam: true,
  faceDetection: true,
  blurDetection: true,
  voiceDetection: true,
  motionDetection: true,
  tabSwitch: true,
  antiCheat: true,
  virtualCamera: true,
  faceVerification: false,
  securityChallenge: false,
}

const COMPULSORY_KEYS = ['webcam', 'voiceDetection', 'motionDetection', 'tabSwitch', 'faceDetection', 'blurDetection', 'antiCheat']

export function ProctorProvider({ children }) {
  const [enabled, setEnabled] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [penaltyScore, setPenaltyScore] = useState(0)
  const [anomalies, setAnomalies] = useState([])
  const [consentGiven, setConsentGiven] = useState(false)
  const [settings, setSettingsRaw] = useState(DEFAULT_SETTINGS)
  const setSettings = useCallback((s) => {
    setSettingsRaw(prev => {
      const merged = typeof s === 'function' ? s(prev) : { ...prev, ...s }
      COMPULSORY_KEYS.forEach(k => { merged[k] = true })
      return merged
    })
  }, [])
  const [quizType, setQuizType] = useState('')
  const [showEmotion, setShowEmotion] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const penaltyRef = useRef(0)

  const camera = useCamera()

  const addPenalty = useCallback((points) => {
    penaltyRef.current += points
    setPenaltyScore(penaltyRef.current)
  }, [])

  const addAnomaly = useCallback((anomaly) => {
    setAnomalies(prev => [...prev, { ...anomaly, timestamp: Date.now(), id: Date.now() + Math.random() }])
  }, [])

  const resetSession = useCallback(() => {
    camera.stop()
    setSessionId(null)
    setPenaltyScore(0)
    penaltyRef.current = 0
    setAnomalies([])
    setConsentGiven(false)
    setEnabled(false)
    setShowEmotion(false)
    setShowReport(false)
    setCameraError(null)
  }, [camera])

  const startSession = useCallback((id, type, s) => {
    setSessionId(id)
    setQuizType(type)
    if (s) setSettings(s)
    setPenaltyScore(0)
    penaltyRef.current = 0
    setAnomalies([])
    setEnabled(true)
  }, [setSettings])

  return (
    <ProctorContext.Provider value={{
      enabled, setEnabled,
      sessionId, startSession, setSessionId,
      penaltyScore, addPenalty,
      anomalies, addAnomaly,
      consentGiven, setConsentGiven,
      settings, setSettings,
      quizType,
      showEmotion, setShowEmotion,
      showReport, setShowReport,
      camera, cameraError, setCameraError,
      resetSession,
    }}>
      {children}
    </ProctorContext.Provider>
  )
}

export default ProctorContext

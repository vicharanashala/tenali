/**
 * ProctoredQuiz — HOC that wraps quiz components with proctoring consent + report.
 *
 * Detection hooks now live in ProctorPanel (App level).
 * This component handles:
 *   - Ethics consent gate
 *   - Anomaly-based quiz restart (quiz resets when flags occur)
 *   - Ejection at high penalty
 *   - Emotion picker at end
 *   - Proctor report
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import useProctor from './useProctor'
import { startProctorSession, endProctorSession } from './proctorEvents'
import EthicsConsent from './EthicsConsent'
import EmotionPicker from './EmotionPicker'
import ProctorReport from './ProctorReport'

const PENALTY_EJECT_THRESHOLD = 50
const FLAG_RESTART_THRESHOLD = 3

export default function ProctoredQuiz({ children, quizType, onBack, autoStartConsent = false }) {
  const proctor = useProctor()
  const {
    enabled, settings, sessionId, penaltyScore, anomalies,
    addAnomaly, startSession, resetSession, setEnabled,
    setConsentGiven,
    showEmotion, setShowEmotion,
    showReport, setShowReport,
  } = proctor

  const [phase, setPhase] = useState(autoStartConsent ? 'starting' : 'consent')
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)
  const [restartKey, setRestartKey] = useState(0)
  const [emotionTimeline, setEmotionTimeline] = useState([])
  const prevAnomalyCount = useRef(0)

  // For autoStartConsent mode (/linear route), proctoring is mandatory
  // — enable the provider and skip the consent screen on mount.
  useEffect(() => {
    if (!autoStartConsent) return
    setEnabled(true)
    setConsentGiven(true)
    let cancelled = false
    ;(async () => {
      const result = await startProctorSession({ quizType, settings, consentGiven: true })
      if (cancelled) return
      if (result?.sessionId) {
        startSession(result.sessionId, quizType, settings)
      }
      setPhase('active')
    })()
    return () => { cancelled = true }
  }, [autoStartConsent]) // eslint-disable-line react-hooks/exhaustive-deps

  // Consent handlers
  const handleConsentAccept = useCallback(async () => {
    setConsentGiven(true)
    setPhase('starting')
    const result = await startProctorSession({ quizType, settings, consentGiven: true })
    if (result?.sessionId) {
      startSession(result.sessionId, quizType, settings)
    }
    setPhase('active')
  }, [settings, quizType, startSession, setConsentGiven])

  const handleConsentDecline = useCallback(() => {
    resetSession()
    onBack?.()
  }, [resetSession, onBack])

  // Quiz completion handler — child communicates via custom event
  useEffect(() => {
    const handleQuizEnd = (e) => {
      if (e.detail?.quizType === quizType) {
        setQuizFinished(true)
        setQuizScore(e.detail.score || 0)
        setQuizTotal(e.detail.total || 0)
      }
    }
    window.addEventListener('tenali-quiz-end', handleQuizEnd)
    return () => window.removeEventListener('tenali-quiz-end', handleQuizEnd)
  }, [quizType])

  // When quiz finishes, end the proctor session
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (quizFinished && phase === 'active') {
      setPhase('finished')
      if (sessionId) {
        endProctorSession(sessionId)
      }
      // Read the emotion timeline captured during the quiz
      try {
        const tl = JSON.parse(sessionStorage.getItem('tenali_emotion_timeline') || '[]')
        setEmotionTimeline(tl)
        sessionStorage.removeItem('tenali_emotion_timeline')
      } catch {}
      setShowEmotion(true)
    }
  }, [quizFinished, phase, sessionId, setShowEmotion])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Flag-based quiz restart: when new anomalies appear, restart quiz from beginning
  useEffect(() => {
    if (phase !== 'active') return
    const newCount = anomalies.length
    if (newCount > prevAnomalyCount.current) {
      prevAnomalyCount.current = newCount
      // Restart quiz from the beginning
      setRestartKey(k => k + 1)
      setQuizFinished(false)
      window.dispatchEvent(new CustomEvent('tenali-quiz-restart', { detail: { quizType } }))
    }
  }, [anomalies.length, phase, quizType])

  // Ejection check
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (penaltyScore >= PENALTY_EJECT_THRESHOLD && phase === 'active') {
      addAnomaly({ type: 'ejected', severity: 3 })
      setPhase('finished')
      setShowReport(true)
    }
  }, [penaltyScore, phase, addAnomaly, setShowReport])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Don't wrap if proctoring not enabled.
  // For autoStartConsent routes: render children directly while session boots.
  if (!enabled) {
    return children
  }

  return (
    <>
      {/* Consent phase */}
      {phase === 'consent' && (
        <EthicsConsent onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      )}

      {/* Active proctoring */}
      {(phase === 'active' || phase === 'starting') && (
        <>
          {/* Flag warning banner */}
          {anomalies.length > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '8px 16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              color: '#fca5a5',
            }}>
              <span>⚠️</span>
              <span>Flag detected — quiz has been restarted. {anomalies.length} total flag{anomalies.length > 1 ? 's' : ''}.</span>
            </div>
          )}
          {/* Floating End Quiz button */}
          <button
            className="proctor-end-quiz-btn"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('tenali-quiz-end', { detail: { quizType, score: 0, total: 0 } }))
            }}
            title="End quiz and view proctor report"
          >
            🏁 End Quiz
          </button>
        </>
      )}

      {/* Emotion picker */}
      {showEmotion && !showReport && (
        <EmotionPicker
          quizType={quizType}
          emotionTimeline={emotionTimeline}
          onSubmit={() => { setShowEmotion(false); setShowReport(true) }}
          onSkip={() => { setShowEmotion(false); setShowReport(true) }}
        />
      )}

      {/* Proctor report */}
      {showReport && (
        <ProctorReport
          anomalies={anomalies}
          penaltyScore={penaltyScore}
          quizScore={quizScore}
          totalQ={quizTotal}
          onDismiss={() => { setShowReport(false); resetSession(); onBack?.() }}
        />
      )}

      {/* Quiz content — keyed by restartKey to force remount */}
      <div key={restartKey}>
        {children}
      </div>
    </>
  )
}

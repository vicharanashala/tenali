import { useEffect, useState } from 'react'
import './equationgate.css'
import LifeHearts from './LifeHearts'

const API = import.meta.env.VITE_API_BASE_URL || ''

/**
 * EquationGate – popup shown when a non-treasure cell is tapped.
 *
 * Props:
 *   sessionId, row, col, tier, moduleName, lives,
 *   onCorrect(neighborCount, newTier, livesLeft),
 *   onWrong(livesLeft, newTier),
 *   onClose
 */
export default function EquationGate({
  sessionId, row, col, tier, moduleName, lives,
  onCorrect, onWrong, onClose,
}) {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState([])
  const [checking, setChecking] = useState(false)
  const [currentTier, setCurrentTier] = useState(tier) // from server /question response

  // Wrong-answer feedback state
  const [wrongResult, setWrongResult] = useState(null) // { correctAnswer, tip, livesLeft, newTier }

  // Heartbreak animation state
  const [breakingIndex, setBreakingIndex] = useState(null)
  const [showHeartbreakOverlay, setShowHeartbreakOverlay] = useState(false)

  // Fetch question on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError('')
    setWrongResult(null)
    setQuestionText('')
    setOptions([])
    setBreakingIndex(null)
    setShowHeartbreakOverlay(false)

    fetch(`${API}/treasurehunt-api/question?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setQuestionText(data.questionText)
        setOptions(data.options)
        if (data.tier) setCurrentTier(data.tier)
      })
      .catch((e) => {
        if (cancelled) return
        setFetchError(e.message || 'Failed to load question')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [sessionId, row, col])

  const handleOptionClick = async (selectedOption) => {
    if (checking || wrongResult) return
    setChecking(true)

    try {
      const r = await fetch(`${API}/treasurehunt-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, selectedOption, row, col }),
      })
      if (!r.ok) throw new Error(`Server returned ${r.status}`)
      const data = await r.json()

      if (data.correct) {
        onCorrect(
          data.neighborCount,
          data.newTier,
          data.livesLeft,
          data.floodCells || [],
          data.status,
          data.summary,
        )
      } else {
        // Trigger heartbreak animation on the life just lost
        const lostHeartIndex = data.livesLeft // 0-indexed: if 2 lives left, heart at index 2 is breaking
        setBreakingIndex(lostHeartIndex)
        setShowHeartbreakOverlay(true)

        // Show wrong-answer view after heartbreak animation
        setWrongResult({
          correctAnswer: data.correctAnswer,
          tip: data.tip,
          livesLeft: data.livesLeft,
          newTier: data.newTier,
          status: data.status,
          summary: data.summary,
        })

        // Clear heartbreak overlay after animation
        setTimeout(() => {
          setShowHeartbreakOverlay(false)
        }, 2000)

        // Clear breaking index after animation completes
        setTimeout(() => {
          setBreakingIndex(null)
        }, 1800)
      }
    } catch (e) {
      setFetchError(e.message || 'Failed to check answer')
    } finally {
      setChecking(false)
    }
  }

  const handleContinue = () => {
    if (wrongResult) {
      onWrong(
        wrongResult.livesLeft,
        wrongResult.newTier,
        wrongResult.status,
        wrongResult.summary,
      )
    }
  }

  const maxLives = 3
  const currentLives = wrongResult ? wrongResult.livesLeft : lives
  const isGameOver = wrongResult && wrongResult.livesLeft <= 0

  return (
    <div className="eg-overlay" onClick={onClose}>
      <div className="eg-popup" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="eg-header">
          <span className="eg-header-text">
            {moduleName} ({wrongResult ? wrongResult.newTier : currentTier})
          </span>
        </div>

        {/* Heartbreak overlay animation */}
        {showHeartbreakOverlay && (
          <div className="eg-heartbreak-overlay">
            <div className="eg-heartbreak-icon">💔</div>
            <div className="eg-heartbreak-crack eg-crack-1"></div>
            <div className="eg-heartbreak-crack eg-crack-2"></div>
            <div className="eg-heartbreak-crack eg-crack-3"></div>
            <div className="eg-heartbreak-shatter eg-shard-1">💔</div>
            <div className="eg-heartbreak-shatter eg-shard-2">♥</div>
            <div className="eg-heartbreak-shatter eg-shard-3">💔</div>
          </div>
        )}

        {/* Body */}
        <div className="eg-body">
          {loading && <p className="eg-loading">Loading question…</p>}
          {fetchError && <p className="eg-error">{fetchError}</p>}

          {!loading && !fetchError && !wrongResult && (
            <>
              <p className="eg-question">{questionText}</p>
              <div className="eg-options">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="eg-option-btn"
                    disabled={checking}
                    onClick={() => handleOptionClick(opt)}
                  >
                    {String(opt)}
                  </button>
                ))}
              </div>
            </>
          )}

          {wrongResult && !isGameOver && (
            <div className="eg-wrong-view">
              <h3 className="eg-wrong-heading">Not quite!</h3>
              <p className="eg-correct-label">
                Correct answer: <strong>{String(wrongResult.correctAnswer)}</strong>
              </p>
              <p className="eg-tip">{wrongResult.tip}</p>
              <button
                type="button"
                className="eg-continue-btn"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="eg-gameover-view">
              <div className="eg-gameover-emoji">💀</div>
              <h3 className="eg-gameover-heading">Oh shit!</h3>
              <p className="eg-gameover-message">Better luck next time</p>
              <p className="eg-correct-label">
                Correct answer: <strong>{String(wrongResult.correctAnswer)}</strong>
              </p>
              <p className="eg-tip">{wrongResult.tip}</p>
              <p className="eg-gameover-inspire">
                Every expert was once a beginner. You'll crush it next time! 💪
              </p>
              <button
                type="button"
                className="eg-gameover-btn"
                onClick={handleContinue}
              >
                See Results
              </button>
            </div>
          )}

          {/* Life hearts */}
          <div className="eg-lives">
            <LifeHearts
              lives={currentLives}
              maxLives={maxLives}
              breakingIndex={breakingIndex}
              size="lg"
            />
          </div>
        </div>

      </div>
    </div>
  )
}

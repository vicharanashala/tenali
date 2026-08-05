/**
 * SecurityChallenge — Random interactive challenge to verify student presence.
 *
 * Displays a random challenge at intervals (2-5 minutes):
 *   - "Give a thumbs up" (gesture detection)
 *   - "Type the number shown" (simple captcha)
 *   - "Click the correct shape" (visual challenge)
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const CHALLENGES = [
  { type: 'number', prompt: 'Type the number:', generate: () => Math.floor(Math.random() * 90) + 10 },
  { type: 'shape', prompt: 'Click the matching shape:', shapes: ['●', '■', '▲', '◆'], answer: null },
  { type: 'color', prompt: 'What color is this?', colors: ['#ef4444', '#22c55e', '#3b82f6', '#eab308'], answer: null },
]

const COLOR_NAMES = { '#ef4444': 'red', '#22c55e': 'green', '#3b82f6': 'blue', '#eab308': 'yellow' }
const SHAPE_NAMES = { '●': 'circle', '■': 'square', '▲': 'triangle', '◆': 'diamond' }

const INTERVAL_MS = 180000 // 3 minutes base

export default function SecurityChallenge({ enabled = false, onPass, onFail }) {
  const [active, setActive] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [result, setResult] = useState(null)
  const timeoutRef = useRef(null)

  const generateChallenge = useCallback(() => {
    const idx = Math.floor(Math.random() * CHALLENGES.length)
    const base = { ...CHALLENGES[idx] }

    if (base.type === 'shape') {
      base.answer = SHAPE_NAMES[base.shapes[Math.floor(Math.random() * base.shapes.length)]]
      base.prompt = `Click the ${base.answer}:`
      base.options = base.shapes
    } else if (base.type === 'color') {
      const color = base.colors[Math.floor(Math.random() * base.colors.length)]
      base.answer = COLOR_NAMES[color]
      base.color = color
    }

    setChallenge(base)
    setActive(true)
    setUserAnswer('')
    setResult(null)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const scheduleNext = () => {
      const delay = INTERVAL_MS + Math.random() * 120000 // 3-5 min
      timeoutRef.current = setTimeout(() => {
        generateChallenge()
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => clearTimeout(timeoutRef.current)
  }, [enabled, generateChallenge])

  const handleSubmit = () => {
    if (!challenge) return
    let correct = false
    if (challenge.type === 'number') {
      correct = userAnswer.trim() === String(challenge.answer)
    } else if (challenge.type === 'shape') {
      correct = userAnswer === challenge.answer
    } else if (challenge.type === 'color') {
      correct = userAnswer.toLowerCase() === challenge.answer
    }

    setResult(correct ? 'pass' : 'fail')
    setTimeout(() => {
      setActive(false)
      if (correct) onPass?.()
      else onFail?.()
    }, 1500)
  }

  if (!enabled || !active || !challenge) return null

  return (
    <div className="proctor-challenge-overlay">
      <div className="proctor-challenge">
        <div className="proctor-challenge-header">⚡ Security Check</div>
        <p className="proctor-challenge-prompt">{challenge.prompt}</p>

        {challenge.type === 'number' && (
          <input
            className="proctor-challenge-input"
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
            placeholder="Type here..."
          />
        )}

        {challenge.type === 'shape' && (
          <div className="proctor-challenge-options">
            {challenge.options.map((s, i) => (
              <button
                key={i}
                className={`proctor-challenge-shape ${userAnswer === SHAPE_NAMES[s] ? 'selected' : ''}`}
                onClick={() => { setUserAnswer(SHAPE_NAMES[s]); setTimeout(handleSubmit, 300) }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {challenge.type === 'color' && (
          <div className="proctor-challenge-options">
            {challenge.colors.map((c, i) => (
              <button
                key={i}
                className="proctor-challenge-color"
                style={{ background: c }}
                onClick={() => { setUserAnswer(COLOR_NAMES[c]); setTimeout(handleSubmit, 300) }}
              />
            ))}
          </div>
        )}

        {challenge.type === 'number' && (
          <button className="proctor-btn proctor-btn-accept" onClick={handleSubmit} style={{ marginTop: 12 }}>
            Verify
          </button>
        )}

        {result && (
          <div className={`proctor-challenge-result ${result}`}>
            {result === 'pass' ? '✓ Verified!' : '✗ Failed — this has been recorded'}
          </div>
        )}
      </div>
    </div>
  )
}

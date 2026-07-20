// ═══════════════════════════════════════════════════════════════════════════
// DiagnosticQuiz.js — Prerequisite Diagnostic Test (Feature 3)
//
// Shows a 5-question mini-quiz from prerequisite topics before a student
// starts a new quiz. Assesses readiness and recommends practice if needed.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { getPromptForType } from './questionFormatters'
import { getPrerequisites, getTopicLabel, getTopicApiPath } from './prerequisiteGraph'
import requestCache from './RequestCache'

const API = import.meta.env.VITE_API_BASE_URL || ''
const DIAG_CACHE_KEY = 'tenali-diag-'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours
const PASS_THRESHOLD = 3 // out of 5

// ─── localStorage cache helpers ──────────────────────────────────────────

function getCachedResult(topicKey) {
  try {
    const raw = localStorage.getItem(DIAG_CACHE_KEY + topicKey)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (Date.now() - data.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(DIAG_CACHE_KEY + topicKey)
      return null
    }
    return data
  } catch { return null }
}

function saveDiagResult(topicKey, score, total, weakTopics) {
  try {
    localStorage.setItem(DIAG_CACHE_KEY + topicKey, JSON.stringify({
      score, total, weakTopics, timestamp: Date.now()
    }))
  } catch { /* ignore quota errors */ }
}

// ─── Build diagnostic questions ──────────────────────────────────────────

async function fetchDiagnosticQuestions(topicKey) {
  const questions = []
  const apiPath = getTopicApiPath(topicKey)
  
  // Fetch 5 questions directly from the currently selected module (difficulty 0)
  for (let i = 0; i < 5; i++) {
    try {
      const data = await requestCache.getQuestion(`${API}/${apiPath}`, 0)
      if (!data) continue
      questions.push({
        prereqKey: topicKey, // Keep same object structure so UI doesn't break
        prereqLabel: getTopicLabel(topicKey),
        questionData: data,
        apiPath,
      })
    } catch {
      // If API fails, skip
    }
  }

  return questions
}

// ─── Check answer against API ────────────────────────────────────────────

async function checkAnswer(apiPath, questionData, userAnswer) {
  try {
    const body = { ...questionData, answer: userAnswer, userAnswer }
    const res = await fetch(`${API}/${apiPath}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { correct: false }
    return await res.json()
  } catch {
    return { correct: false }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DiagnosticScreen Component
// ═══════════════════════════════════════════════════════════════════════════


const Frac = ({ n, d, size }) => {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px', verticalAlign: 'middle', fontSize: size || '1em' }}>
      <span style={{ borderBottom: '1px solid var(--clr-text)', padding: '0 2px' }}>{n}</span>
      <span style={{ padding: '0 2px' }}>{d}</span>
    </span>
  )
}

const formatFraction = (n, d) => <Frac n={n} d={d} size="1.2em" />
const formatMixed = (w, n, d) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.2em' }}>
    <span style={{ marginRight: '4px' }}>{w}</span>
    <Frac n={n} d={d} size="1em" />
  </span>
)

function renderDiagnosticQuestion(type, q) {
  if (!q) return null;
  
  if (type === 'fractionadd') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
        {q.mixed ? (
          <>
            {formatMixed(q.w1, q.n1, q.d1)}
            <span style={{ margin: '0 8px' }}>{q.op || '+'}</span>
            {formatMixed(q.w2, q.n2, q.d2)}
            <span style={{ margin: '0 8px' }}>=</span>
          </>
        ) : (
          <>
            {formatFraction(q.n1, q.d1)}
            <span style={{ margin: '0 8px' }}>{q.op || '+'}</span>
            {formatFraction(q.n2, q.d2)}
            <span style={{ margin: '0 8px' }}>=</span>
          </>
        )}
      </div>
    );
  }
  
  // fallback to string formatting
  const prompt = getPromptForType(type, q);
  if (prompt && typeof prompt === 'string') return prompt;
  if (prompt && typeof prompt === 'object' && prompt.$$typeof) return prompt; // React element
  if (q.prompt) return String(q.prompt);
  if (q.question) return String(q.question);
  
  // Robust generic text extractor for unrecognized API shapes
  const textProps = Object.values(q).filter(v => typeof v === 'string' && v.length > 0 && v.length < 100);
  if (textProps.length > 0) return `Solve: ${textProps.join(' ')}`;
  
  return "Solve this problem.";
}

export default function DiagnosticScreen({ topicKey, onPass, onFail, onSkip, onNavigate }) {
  const topicLabel = getTopicLabel(topicKey)

  const [phase, setPhase] = useState('loading') // loading | quiz | result
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [results, setResults] = useState([]) // { prereqKey, correct }
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null) // null | { correct, text }

  // Check cache on mount
  useEffect(() => {
    const cached = getCachedResult(topicKey)
    if (cached) {
      if (cached.score >= PASS_THRESHOLD) {
        onPass(cached.score, cached.total)
      } else {
        // Show result screen with cached data
        setScore(cached.score)
        setResults(cached.weakTopics.map(k => ({ prereqKey: k, correct: false })))
        setPhase('result')
      }
      return
    }

    // Fetch diagnostic questions
    fetchDiagnosticQuestions(topicKey).then(qs => {
      if (qs.length === 0) {
        onPass(0, 0) // No prereqs, start fresh instead of giving 40% mastery
        return
      }
      setQuestions(qs)
      setPhase('quiz')
    })
  }, [topicKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentQ = questions[currentIdx]

  const handleSubmit = useCallback(async () => {
    if (!currentQ || submitting || !answer.trim()) return
    setSubmitting(true)

    const result = await checkAnswer(currentQ.apiPath, currentQ.questionData, answer.trim())
    const correct = !!result.correct

    if (correct) setScore(s => s + 1)

    setFeedback({
      correct,
      text: correct
        ? `✅ Correct!`
        : `❌ Incorrect. The answer was: ${result.correctAnswer || currentQ.questionData.answer || '—'}`
    })

    setResults(prev => [...prev, { prereqKey: currentQ.prereqKey, correct }])

    // Auto-advance after 1.5s
    setTimeout(() => {
      setFeedback(null)
      setAnswer('')
      setSubmitting(false)

      if (currentIdx + 1 >= questions.length) {
        // Done — compute final score
        const finalScore = correct ? score + 1 : score
        const weakTopics = [...results, { prereqKey: currentQ.prereqKey, correct }]
          .filter(r => !r.correct)
          .map(r => r.prereqKey)
        const uniqueWeak = [...new Set(weakTopics)]

        saveDiagResult(topicKey, finalScore, questions.length, uniqueWeak)

        if (finalScore >= PASS_THRESHOLD) {
          setPhase('result')
          // Small delay to show result before passing
        } else {
          setPhase('result')
        }
      } else {
        setCurrentIdx(i => i + 1)
      }
    }, 1500)
  }, [currentQ, submitting, answer, currentIdx, questions, score, results, topicKey])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !submitting) handleSubmit()
  }, [handleSubmit, submitting])

  const finalScore = phase === 'result' ? score : 0
  const passed = finalScore >= PASS_THRESHOLD
  const weakTopics = [...new Set(results.filter(r => !r.correct).map(r => r.prereqKey))]

  // ─── Render: Loading ───────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{
          width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid var(--clr-accent)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
        }} />
        <p className="subtitle">Preparing readiness check for <strong>{topicLabel}</strong>...</p>
      </div>
    )
  }

  // ─── Render: Result ────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((finalScore / questions.length) * 100)
    return (
      <>
        <div className="header-row">
          <button className="back-button" onClick={() => onNavigate(topicKey)}>← Home</button>
        </div>
        
        <h1>{passed ? '🎉' : '📚'} Readiness Check Complete</h1>
        <p className="subtitle">
          Your readiness for <strong>{topicLabel}</strong>: {finalScore}/{questions.length}
        </p>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: 120, height: 120, borderRadius: '50%',
            border: `4px solid ${passed ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`,
            margin: '0 auto 1.5rem',
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--clr-text)' }}>{pct}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: 1 }}>Readiness</span>
          </div>

          {passed ? (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--clr-correct)', fontWeight: 600, marginBottom: '1rem' }}>✅ You're ready! Let's go!</p>
              <button className="primary-btn" onClick={() => onPass(finalScore, questions.length)}>
                Start {topicLabel} Quiz →
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '1rem', color: 'var(--clr-wrong)', fontWeight: 500, marginBottom: '1rem' }}>
                ⚠️ You might want to practice these prerequisites first:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                {weakTopics.map(key => (
                  <button key={key} className="secondary-btn" onClick={() => onNavigate(key)} style={{ textAlign: 'left', width: '100%' }}>
                    📖 Practice: {getTopicLabel(key)}
                  </button>
                ))}
              </div>
              <button className="back-button" onClick={() => onFail(finalScore, questions.length, weakTopics)}>
                Continue to {topicLabel} anyway →
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  // ─── Render: Quiz ──────────────────────────────────────────────────────
  const progressPct = ((currentIdx) / questions.length) * 100

  return (
    <>
      <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-button" onClick={() => onNavigate(topicKey)}>← Home</button>
        <button className="score-pill" onClick={onSkip} style={{ cursor: 'pointer', background: 'var(--clr-surface)' }}>Skip check →</button>
      </div>

      <h1>🔍 Readiness Check</h1>
      <p className="subtitle">for <strong>{topicLabel}</strong></p>

      <div className="top-mini-row" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
        <div className="progress-pill center" style={{ background: 'var(--clr-surface)', margin: 0 }}>
          Question {currentIdx + 1} of {questions.length} • Testing: {currentQ?.prereqLabel}
        </div>
      </div>

      <div className="question-box">
        <div className="quiz-question" style={{ fontSize: '1.2rem', fontWeight: 500, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
          {renderDiagnosticQuestion(currentQ?.prereqKey, currentQ?.questionData)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', marginTop: '1rem' }}>
        <input
          type="text"
          className="answer-input"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          disabled={submitting}
          autoFocus
          style={{ flex: 1 }}
        />
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={submitting || !answer.trim()}
          style={{ opacity: submitting || !answer.trim() ? 0.5 : 1, padding: '0 24px', flexShrink: 0 }}
        >
          {submitting ? '...' : 'Submit'}
        </button>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.correct ? 'correct' : 'wrong'}`}>
          {feedback.text}
        </div>
      )}
    </>
  )
}



// ─── Utility: get cached readiness status for home screen badges ─────────

export function getDiagnosticStatus(topicKey) {
  const cached = getCachedResult(topicKey)
  if (!cached) return null // no diagnostic taken
  return cached.score >= PASS_THRESHOLD ? 'passed' : 'failed'
}

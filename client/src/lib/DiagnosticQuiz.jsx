// ═══════════════════════════════════════════════════════════════════════════
// DiagnosticQuiz.js — Prerequisite Diagnostic Test (Feature 3)
//
// Shows a 5-question mini-quiz from prerequisite topics before a student
// starts a new quiz. Assesses readiness and recommends practice if needed.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { getPromptForType } from './questionFormatters'
import { getPrerequisites, getTopicLabel, getTopicApiPath } from './prerequisiteGraph'

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
      const res = await fetch(`${API}/${apiPath}/question?difficulty=0&_t=${Date.now()}_${i}`)
      if (!res.ok) continue
      const data = await res.json()
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
  return getPromptForType(type, q) || q.prompt || q.question || JSON.stringify(q);
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
        onPass(5, 5) // No prereqs, auto-pass
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
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Preparing readiness check for <strong>{topicLabel}</strong>...</p>
        </div>
      </div>
    )
  }

  // ─── Render: Result ────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((finalScore / questions.length) * 100)
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <h2 style={styles.resultTitle}>
            {passed ? '🎉' : '📚'} Readiness Check Complete
          </h2>

          <div style={{
            ...styles.scoreCircle,
            borderColor: passed ? '#4caf50' : '#ff9800',
          }}>
            <span style={styles.scoreNumber}>{pct}%</span>
            <span style={styles.scoreLabel}>Readiness</span>
          </div>

          <p style={styles.resultSubtitle}>
            Your readiness for <strong>{topicLabel}</strong>: {finalScore}/{questions.length}
          </p>

          {passed ? (
            <div style={styles.passSection}>
              <p style={styles.passText}>✅ You're ready! Let's go!</p>
              <button style={styles.primaryBtn} onClick={() => onPass(finalScore, questions.length)}>
                Start {topicLabel} Quiz →
              </button>
            </div>
          ) : (
            <div style={styles.failSection}>
              <p style={styles.failText}>
                ⚠️ You might want to practice these prerequisites first:
              </p>
              <div style={styles.weakList}>
                {weakTopics.map(key => (
                  <button
                    key={key}
                    style={styles.weakBtn}
                    onClick={() => onNavigate(key)}
                  >
                    📖 Practice: {getTopicLabel(key)}
                  </button>
                ))}
              </div>
              <div style={styles.failActions}>
                <button style={styles.secondaryBtn} onClick={() => onFail(finalScore, questions.length, weakTopics)}>
                  Continue to {topicLabel} anyway →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Render: Quiz ──────────────────────────────────────────────────────
  const progressPct = ((currentIdx) / questions.length) * 100

  return (
    <div style={styles.container}>
      <div style={styles.quizCard}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>🔍 Readiness Check</h2>
          <p style={styles.subtitle}>for <strong>{topicLabel}</strong></p>
          <button style={styles.skipBtn} onClick={onSkip}>
            Skip check →
          </button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
          </div>
          <span style={styles.progressText}>
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {/* Prereq badge */}
        <div style={styles.prereqBadge}>
          Testing: <strong>{currentQ?.prereqLabel}</strong>
        </div>

        {/* Question */}
        <div style={styles.questionBox}>
          <p style={styles.questionText}>
            {renderDiagnosticQuestion(currentQ?.prereqKey, currentQ?.questionData)}
          </p>
        </div>

        {/* Answer input */}
        <div style={styles.inputRow}>
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            style={styles.input}
            disabled={submitting}
            autoFocus
          />
          <button
            style={{
              ...styles.submitBtn,
              opacity: submitting || !answer.trim() ? 0.5 : 1,
            }}
            onClick={handleSubmit}
            disabled={submitting || !answer.trim()}
          >
            {submitting ? '...' : 'Submit'}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            ...styles.feedback,
            background: feedback.correct
              ? 'rgba(76, 175, 80, 0.15)'
              : 'rgba(255, 152, 0, 0.15)',
            borderColor: feedback.correct ? '#4caf50' : '#ff9800',
          }}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Inline styles (no external CSS dependency) ──────────────────────────

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    padding: '2rem',
  },
  loadingCard: {
    textAlign: 'center',
    padding: '3rem',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid var(--clr-accent, #5a8fc2)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 1rem',
  },
  loadingText: {
    fontSize: '1.1rem',
    color: 'var(--clr-dim, #aaa)',
  },
  quizCard: {
    background: 'var(--clr-card, #1e1e2e)',
    borderRadius: 16,
    padding: '2rem',
    maxWidth: 560,
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    position: 'relative',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--clr-text, #eee)',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--clr-dim, #aaa)',
    marginTop: '0.25rem',
  },
  skipBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'var(--clr-dim, #aaa)',
    padding: '0.35rem 0.75rem',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #5a8fc2, #7c4dff)',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  },
  progressText: {
    fontSize: '0.8rem',
    color: 'var(--clr-dim, #aaa)',
    whiteSpace: 'nowrap',
  },
  prereqBadge: {
    display: 'inline-block',
    background: 'rgba(90, 143, 194, 0.15)',
    color: '#5a8fc2',
    padding: '0.3rem 0.75rem',
    borderRadius: 20,
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  questionBox: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.25rem',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  questionText: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: 0,
    textAlign: 'center',
    color: 'var(--clr-text, #eee)',
    lineHeight: 1.5,
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--clr-text, #eee)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #5a8fc2, #7c4dff)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  feedback: {
    padding: '0.75rem 1rem',
    borderRadius: 10,
    border: '1px solid',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  resultCard: {
    background: 'var(--clr-card, #1e1e2e)',
    borderRadius: 16,
    padding: '2.5rem',
    maxWidth: 500,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  resultTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: 'var(--clr-text, #eee)',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  scoreNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--clr-text, #eee)',
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: 'var(--clr-dim, #aaa)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultSubtitle: {
    fontSize: '1rem',
    color: 'var(--clr-dim, #aaa)',
    marginBottom: '1.5rem',
  },
  passSection: {
    marginTop: '1rem',
  },
  passText: {
    fontSize: '1.1rem',
    color: '#4caf50',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  primaryBtn: {
    padding: '0.85rem 2rem',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  failSection: {
    marginTop: '1rem',
  },
  failText: {
    fontSize: '1rem',
    color: '#ff9800',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  weakList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  weakBtn: {
    padding: '0.7rem 1rem',
    borderRadius: 10,
    border: '1px solid rgba(255, 152, 0, 0.3)',
    background: 'rgba(255, 152, 0, 0.08)',
    color: '#ffb74d',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s',
  },
  failActions: {
    marginTop: '1rem',
  },
  secondaryBtn: {
    padding: '0.7rem 1.5rem',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'var(--clr-dim, #aaa)',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}

// ─── Utility: get cached readiness status for home screen badges ─────────

export function getDiagnosticStatus(topicKey) {
  const cached = getCachedResult(topicKey)
  if (!cached) return null // no diagnostic taken
  return cached.score >= PASS_THRESHOLD ? 'passed' : 'failed'
}

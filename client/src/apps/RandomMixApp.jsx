import React, { useState, useRef, useEffect } from 'react'

import {
  API,
  authGetToken,
  useTimer,
  useAutoAdvance,
  getSpeedRunLimit,
  getPromptForType,
  ResultsTable,
  renderFeedback,
  QuizLayout,
} from '../App.jsx'

import { HintModal } from '../components/HintSystem/HintModal.jsx'
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx'
import GlossaryText from '../components/GlossaryText'
const RANDOM_MIX_TOPICS = [
  { key: 'basicarith', name: 'Origin', api: 'basicarith-api' },
  { key: 'addition', name: 'Addition', api: 'addition-api' },
  { key: 'quadratic', name: 'Quadratic', api: 'quadratic-api' },
  { key: 'multiply', name: 'Multiplication', api: 'multiply-api' },
  { key: 'sqrt', name: 'Square Root', api: 'sqrt-api' },
  { key: 'funceval', name: 'Functions', api: 'funceval-api' },
  { key: 'lineq', name: 'Line Equation', api: 'lineq-api' },
  { key: 'fractionadd', name: 'Fractions', api: 'fractionadd-api' },
  { key: 'surds', name: 'Surds', api: 'surds-api' },
  { key: 'indices', name: 'Indices', api: 'indices-api' },
  { key: 'sequences', name: 'Sequences', api: 'sequences-api' },
  { key: 'ratio', name: 'Ratio', api: 'ratio-api' },
  { key: 'percent', name: 'Percentages', api: 'percent-api' },
  { key: 'sets', name: 'Sets', api: 'sets-api' },
  { key: 'trig', name: 'Trigonometry', api: 'trig-api' },
  { key: 'ineq', name: 'Inequalities', api: 'ineq-api' },
  { key: 'coordgeom', name: 'Coord. Geometry', api: 'coordgeom-api' },
  { key: 'prob', name: 'Probability', api: 'prob-api' },
  { key: 'stats', name: 'Statistics', api: 'stats-api' },
  { key: 'matrix', name: 'Matrices', api: 'matrix-api' },
  { key: 'vectors', name: 'Vectors', api: 'vectors-api' },
  { key: 'transform', name: 'Transformations', api: 'transform-api' },
  { key: 'mensur', name: 'Mensuration', api: 'mensur-api' },
  { key: 'bearings', name: 'Bearings', api: 'bearings-api' },
  { key: 'log', name: 'Logarithms', api: 'log-api' },
  { key: 'diff', name: 'Differentiation', api: 'diff-api' },
  { key: 'bases', name: 'Number Bases', api: 'bases-api' },
  { key: 'circleth', name: 'Circle Theorems', api: 'circleth-api' },
  { key: 'integ', name: 'Integration', api: 'integ-api' },
  { key: 'stdform', name: 'Standard Form', api: 'stdform-api' },
  { key: 'bounds', name: 'Bounds', api: 'bounds-api' },
  { key: 'sdt', name: 'Speed/Distance/Time', api: 'sdt-api' },
  { key: 'variation', name: 'Variation', api: 'variation-api' },
  { key: 'hcflcm', name: 'HCF & LCM', api: 'hcflcm-api' },
  { key: 'profitloss', name: 'Profit & Loss', api: 'profitloss-api' },
  { key: 'rounding', name: 'Rounding', api: 'rounding-api' },
  { key: 'binomial', name: 'Binomial Theorem', api: 'binomial-api' },
  { key: 'complex', name: 'Complex Numbers', api: 'complex-api' },
  { key: 'angles', name: 'Angles', api: 'angles-api' },
  { key: 'triangles', name: 'Triangles', api: 'triangles-api' },
  { key: 'congruence', name: 'Congruence', api: 'congruence-api' },
  { key: 'pythag', name: "Pythagoras' Theorem", api: 'pythag-api' },
  { key: 'polygons', name: 'Polygons', api: 'polygons-api' },
  { key: 'similarity', name: 'Similarity', api: 'similarity-api' },
]

const DIFF_LEVELS = ['easy', 'medium', 'hard', 'extrahard']
const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', extrahard: 'Extra Hard' }
const DIFF_COLORS = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336', extrahard: '#9c27b0' }
export default function RandomMixApp({ onBack, isGoalMode = false }) {
  const [phase, setPhase] = useState('setup') // setup | playing | finished
  const [skippedTopics, setSkippedTopics] = useState(new Set())
  const [topicDiffMap, setTopicDiffMap] = useState({}) // { topicKey: diffIndex (0-3) }
  const [streak, setStreak] = useState(0) // positive = correct streak, negative = wrong streak
  const [question, setQuestion] = useState(null)
  const [currentTopic, setCurrentTopic] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [results, setResults] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [numQInput, setNumQInput] = useState('20')
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  const timer = useTimer()
 const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp(
  'mix',
  phase === 'finished',
  score,
  totalQuestions,
  isCorrect || false,
  results
);
  const advanceFnRef = useRef(null)
  const submittedRef = useRef(false)
  const advancedRef = useRef(false)
  // Track topic stats for the summary
  const [topicStats, setTopicStats] = useState({})
  const [reportAck, setReportAck] = useState('')

  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  const availableTopics = () => RANDOM_MIX_TOPICS.filter(t => !skippedTopics.has(t.key))

  const pickRandomTopic = () => {
    const pool = availableTopics()
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  const getTopicDiff = (topicKey) => topicDiffMap[topicKey] ?? 0
  const currentDifficulty = () => DIFF_LEVELS[Math.min(getTopicDiff(currentTopic?.key), DIFF_LEVELS.length - 1)]
  const setTopicDiff = (topicKey, fn) => setTopicDiffMap(prev => {
    const cur = prev[topicKey] ?? 0
    const next = typeof fn === 'function' ? fn(cur) : fn
    return { ...prev, [topicKey]: Math.max(0, Math.min(DIFF_LEVELS.length - 1, next)) }
  })

  const handleTimeout = () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setIsCorrect(false)
    setRevealed(true)
    setFeedback("⏱️ Time's up!")
    setResults(prev => [...prev, {
      question: `[${currentTopic?.name || '?'}] ${getPromptForType(currentTopic?.key, question) || question.prompt || '?'}`,
      userAnswer: '(timeout)',
      correctAnswer: '—',
      correct: false,
      time: getSpeedRunLimit(currentDifficulty(), true)
    }])
    if (currentTopic) setTopicDiff(currentTopic.key, d => d - 1)
  }

  const loadQuestion = async () => {
    const topic = pickRandomTopic()
    if (!topic) {
      setFeedback('No topics left! Un-skip some topics or finish.')
      return
    }
    setLoading(true)
    setCurrentTopic(topic)
    try {
      const diff = DIFF_LEVELS[Math.min(getTopicDiff(topic.key), DIFF_LEVELS.length - 1)]
      const r = await fetch(`${API}/${topic.api}/question?difficulty=${diff}&goal=${sessionGoal}`, {
        headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }
      })
      const data = await r.json()
      setQuestion(data)
      setAnswer('')
      setFeedback('')
      setIsCorrect(null)
      setRevealed(false)
      submittedRef.current = false
      advancedRef.current = false
      setQuestionNumber(n => n + 1)
      timer.reset()
      timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(diff, true))
    } catch {
      setFeedback('Failed to load question. Trying another topic...')
      // Try again with a different topic
      setTimeout(loadQuestion, 300)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!question || revealed || answer.trim() === '') return
    if (submittedRef.current) return
    submittedRef.current = true
    const elapsed = timer.stop()
    try {
      const payload = { ...question, userAnswer: answer.trim() }
      const r = await fetch(`${API}/${currentTopic.api}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : ''
        },
        body: JSON.stringify({ ...payload, sessionGoal })
      })
      const data = await r.json()
      const correct = data.correct
      setIsCorrect(correct)
      setRevealed(true)
      const coinMsg = (data.lil?.coinsEarned ?? 0) > 0 ? ` (+${data.lil.coinsEarned}🪙)` : ''

      if (!correct && sessionGoal === 'perfect') {
        setFeedback(`❌ Wrong answer — Perfect Solve ended! Correct: ${data.display || ''}`)
        timer.reset()
        setPhase('finished')
        setResults(prev => [...prev, {
          question: `[${currentTopic.name}] ${getPromptForType(currentTopic.key, question) || question.prompt || '?'}`,
          userAnswer: answer.trim(),
          correctAnswer: data.display,
          correct: false,
          time: elapsed
        }])
        return
      }

      setFeedback(correct ? `Correct!${coinMsg} ${data.display}` : `Incorrect. Answer: ${data.display}`)

      if (correct) {
        setScore(s => s + 1)
        const newStreak = streak >= 0 ? streak + 1 : 1
        setStreak(newStreak)
        // Level up this topic after 3 correct in a row
        if (newStreak >= 3) {
          setTopicDiff(currentTopic.key, d => d + 1)
          setStreak(0)
        }
      } else {
        const newStreak = streak <= 0 ? streak - 1 : -1
        setStreak(newStreak)
        // Level down this topic after 2 wrong in a row
        if (newStreak <= -2) {
          setTopicDiff(currentTopic.key, d => d - 1)
          setStreak(0)
        }
      }

      // Track per-topic stats
      setTopicStats(prev => {
        const s = prev[currentTopic.key] || { name: currentTopic.name, correct: 0, total: 0 }
        return { ...prev, [currentTopic.key]: { name: s.name, correct: s.correct + (correct ? 1 : 0), total: s.total + 1 } }
      })

      setResults(prev => [...prev, {
        question: `[${currentTopic.name}] ${getPromptForType(currentTopic.key, question) || question.prompt || '?'}`,
        userAnswer: answer.trim(),
        correctAnswer: data.display,
        correct,
        time: elapsed
      }])
    } catch {
      setFeedback('Error checking answer.')
    }
  }

  const advance = () => {
    if (advancedRef.current) return
    advancedRef.current = true
    if (questionNumber >= totalQuestions) {
      setPhase('finished')
    } else {
      loadQuestion()
    }
  }
  advanceFnRef.current = advance

  // Enter key handler for wrong answers
  useEffect(() => {
    if (!revealed || isCorrect) return
    const handler = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [revealed, isCorrect, questionNumber])

  const skipTopic = () => {
    if (!currentTopic) return
    setSkippedTopics(prev => new Set([...prev, currentTopic.key]))
    // Don't count this as a question — decrement and load next
    setQuestionNumber(n => n - 1)
    loadQuestion()
  }

  const unskipTopic = (key) => {
    setSkippedTopics(prev => {
      const s = new Set(prev)
      s.delete(key)
      return s
    })
  }

  const handleSkip = () => {
    if (!question || revealed) return
    submittedRef.current = true
    const elapsed = timer.stop()
    setIsCorrect(false); setRevealed(true); setStreak(s => Math.min(s, 0) - 1)
    if (currentTopic) setTopicDiff(currentTopic.key, d => d - 1)

    if (sessionGoal === 'perfect') {
      setFeedback('❌ Skipped — Perfect Solve ended!')
      timer.reset()
      setPhase('finished')
      setResults(prev => [...prev, {
        question: `[${currentTopic?.name || '?'}] ${getPromptForType(currentTopic?.key, question) || question.prompt || '?'}`,
        userAnswer: '(skipped)', correctAnswer: '—', correct: false, time: elapsed
      }])
      return
    }

    setFeedback('Skipped — counted as incorrect.')
    setResults(prev => [...prev, {
      question: `[${currentTopic?.name || '?'}] ${getPromptForType(currentTopic?.key, question) || question.prompt || '?'}`,
      userAnswer: '(skipped)', correctAnswer: '—', correct: false, time: 0
    }])
  }

  const reportDifficulty = (wasDifficult) => {
    if (currentTopic) {
      if (wasDifficult) {
        setTopicDiff(currentTopic.key, d => d - 1); setStreak(0)
      } else {
        setTopicDiff(currentTopic.key, d => d + 1); setStreak(0)
      }
    }
    // Both buttons skip to the next question
    if (!revealed) {
      handleSkip()
    } else {
      advance()
    }
  }

  const handleSolve = async () => {
    if (!question || revealed || !currentTopic) return
    submittedRef.current = true
    timer.stop()
    try {
      const payload = { ...question, userAnswer: '', solve: true }
      const r = await fetch(`${API}/${currentTopic.api}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : ''
        },
        body: JSON.stringify({ ...payload, sessionGoal })
      })
      const data = await r.json()
      setIsCorrect(false); setRevealed(true)
      const display = data.display || data.correctAnswer || data.answer || ''
      const explanation = data.explanation || ''
      setFeedback(`Solution: ${display}${explanation ? '\n' + explanation : ''}`)
      setResults(prev => [...prev, {
        question: `[${currentTopic.name}] ${getPromptForType(currentTopic.key, question) || question.prompt || '?'}`,
        userAnswer: '(solved)', correctAnswer: display, correct: false, time: 0
      }])
    } catch { setFeedback('Error getting solution.') }
  }

  const startQuiz = () => {
    const n = parseInt(numQInput) || 20
    setTotalQuestions(Math.max(5, Math.min(100, n)))
    setPhase('playing')
    setScore(0)
    setQuestionNumber(0)
    setResults([])
    setTopicDiffMap({})
    setStreak(0)
    setSkippedTopics(new Set())
    setTopicStats({})
    setTimeout(loadQuestion, 0)
  }

  // ─── Setup Phase ─────────────────────────────────
  if (phase === 'setup') {
    return (
      <QuizLayout title="Random Mix" subtitle="Adaptive cross-topic quiz" onBack={onBack}>
        <div className="welcome-box">
          <p className="welcome-text">
            Questions come from random topics and difficulty adjusts to your level.
            You can skip any topic you don't want to see.
          </p>
          <div className="question-count-row" style={{ marginBottom: '12px' }}>
            <label className="question-count-label">Number of questions: </label>
            <input className="answer-input question-count-input" type="text" value={numQInput} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQInput(v) }} />
          </div>

          {isGoalMode && (
        <>
          <p className="welcome-text" style={{ marginTop: '14px', fontSize: '0.92rem', fontWeight: 700, marginBottom: '6px' }}>Practice Goal:</p>
                    <div className="checkbox-group" style={{ marginBottom: '8px' }}>
                      {[
                                                { key: 'speed',    label: '⚡ Speed Run' },
                        { key: 'perfect',  label: '🎯 Perfect Solve' },
                        { key: 'revision', label: '🔄 Revision' },
                      ].map(g => (
                        <label key={g.key} className={`checkbox-pill${sessionGoal === g.key ? ' active' : ''}`}
                          style={sessionGoal === g.key ? (
                            g.key === 'speed'    ? { background: 'rgba(255,179,0,0.18)',  borderColor: '#ffb300', color: '#ffb300' } :
                            g.key === 'perfect'  ? { background: 'rgba(244,67,54,0.18)',  borderColor: '#f44336', color: '#f44336' } :
                            g.key === 'revision' ? { background: 'rgba(33,150,243,0.18)', borderColor: '#2196f3', color: '#2196f3' } : {}
                          ) : {}}>
                          <input type="radio" name="randommix-goal" checked={sessionGoal === g.key}
                            onChange={() => setSessionGoal(g.key)} />
                          {g.label}
                        </label>
                      ))}
                    </div>
                    {sessionGoal === 'speed' && (
                      <p style={{ fontSize: '0.82rem', color: '#ffb300', marginBottom: '8px' }}>
                        ⚡ Easy 5s · Medium 10s · Hard 15s · Extra Hard 20s · Adaptive 10s. Double coins for correct!
                      </p>
                    )}
                    {sessionGoal === 'perfect' && (
                      <p style={{ fontSize: '0.82rem', color: '#f44336', marginBottom: '8px' }}>
                        🎯 One wrong answer ends the quiz. No timer shown. Can you go flawless?
                      </p>
                    )}
                    {sessionGoal === 'revision' && (
                      <p style={{ fontSize: '0.82rem', color: '#2196f3', marginBottom: '8px' }}>
                        🔄 Focuses on topics you previously answered incorrectly.
                      </p>
                    )}
        </>
      )}

          <p style={{ color: 'var(--clr-dim)', fontSize: '0.82rem', marginBottom: '1rem', marginTop: '12px' }}>
            Starts at <strong style={{ color: '#4caf50' }}>Easy</strong>.
            3 correct in a row → level up.
            2 wrong in a row → level down.
            Topics drawn randomly from all {RANDOM_MIX_TOPICS.length} puzzles.
          </p>
          <div className="button-row">
            <button onClick={startQuiz}>Start Random Mix</button>
          </div>
        </div>
      <HintModal concept={'mix'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
</QuizLayout>
    )
  }

  // ─── Finished Phase ──────────────────────────────
  if (phase === 'finished') {
    const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    const topicEntries = Object.values(topicStats).sort((a, b) => b.total - a.total)
    return (
      <QuizLayout title="Random Mix" subtitle="Quiz complete!" onBack={onBack} sessionGoal={sessionGoal}>
        <div className="welcome-box">
          <p className="final-score">Final score: {score}/{totalQuestions} ({pct}%)</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="stat-pill">Ended at {DIFF_LABELS[currentDifficulty()]} level</span>
            <span className="stat-pill">{Object.keys(topicStats).length} topics covered</span>
          </div>

          {topicEntries.length > 0 && (
            <div style={{ margin: '1rem 0' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Topic Breakdown</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                {topicEntries.map(t => (
                  <span key={t.name} style={{
                    padding: '0.25rem 0.6rem', borderRadius: 12, fontSize: '0.82rem',
                    background: t.correct === t.total ? 'rgba(76, 175, 80, 0.15)' : t.correct === 0 ? 'rgba(244, 67, 54, 0.15)' : 'var(--clr-dim-alt)',
                    border: '1px solid ' + (t.correct === t.total ? '#4caf50' : t.correct === 0 ? '#f44336' : 'var(--clr-dim)'),
                    color: t.correct === t.total ? '#4caf50' : t.correct === 0 ? '#f44336' : 'var(--clr-text-soft)'
                  }}>
                    {t.name}: {t.correct}/{t.total}
                  </span>
                ))}
              </div>
            </div>
          )}
          <ResultsTable results={results} />
          <button onClick={() => setPhase('setup')} style={{ marginTop: '1rem' }}>
            Play Again
          </button>
        </div>
      </QuizLayout>
    )
  }

  // ─── Playing Phase ───────────────────────────────
  const diff = currentDifficulty()
  return (
    <QuizLayout title="Random Mix" subtitle={`Topic: ${currentTopic?.name || ''}`} onBack={onBack} timer={sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
        <div className="progress-pill center">Question {questionNumber}/{totalQuestions}</div>
        <div className="progress-pill" style={{ background: DIFF_COLORS[diff], color: '#fff' }}>{DIFF_LABELS[diff]}</div>
        <div className="progress-pill">{score} correct</div>
      </div>

      {!revealed && currentTopic && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
          <button onClick={skipTopic} style={{
            background: 'none', border: '1px solid var(--clr-dim)', borderRadius: 8,
            padding: '0.2rem 0.6rem', fontSize: '0.78rem', color: 'var(--clr-dim)',
            cursor: 'pointer'
          }}>
            Skip this topic
          </button>
        </div>
      )}

      {skippedTopics.size > 0 && (
        <div style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--clr-dim)', textAlign: 'center' }}>
          Skipped: {[...skippedTopics].map(k => {
            const t = RANDOM_MIX_TOPICS.find(x => x.key === k)
            return (
              <span key={k} onClick={() => unskipTopic(k)} style={{
                display: 'inline-block', padding: '0.1rem 0.45rem', margin: '0.1rem', borderRadius: 8,
                background: 'var(--clr-dim-alt)', cursor: 'pointer', textDecoration: 'line-through'
              }}>
                {t ? t.name : k} ✕
              </span>
            )
          })}
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', padding: '2rem 0' }}>Loading question…</p>}

      {!loading && question && (
        <>
          <div className="question-box">
            <GlossaryText text={getPromptForType(currentTopic.key, question) || question.prompt || ''} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              className="answer-input"
              type="text"
              value={answer}
              onChange={e => { if (!revealed) setAnswer(e.target.value) }}
              disabled={revealed}
              placeholder="Type your answer"
              onKeyDown={e => { if (e.key === 'Enter' && !revealed) handleSubmit() }}
              style={{ flex: 1 }}
              autoFocus
            />
          </div>
          <div className="button-row">
            {!revealed ? (
              <>
                <button onClick={handleSubmit} disabled={answer.trim() === ''}>Submit</button>
                <button onClick={handleSolve} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
                <button onClick={handleSkip} style={{ background: 'transparent', border: '1px solid var(--clr-dim)', color: 'var(--clr-dim)' }}>Skip</button>
              </>
            ) : (
              <button onClick={advance}>
                {questionNumber >= totalQuestions ? 'Finish' : 'Next'}
              </button>
            )}
          </div>

          {/* Always-visible Easy/Difficult self-report buttons */}
          <div style={{ textAlign: 'center', margin: '10px 0 4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-dim)', marginRight: '8px' }}>How are you feeling?</span>
            <button onClick={() => reportDifficulty(false)} style={{ fontSize: '0.78rem', padding: '5px 14px', borderRadius: '8px', marginRight: '6px', background: 'transparent', border: '1px solid var(--clr-correct)', color: 'var(--clr-correct)', cursor: 'pointer' }}>Too Easy</button>
            <button onClick={() => reportDifficulty(true)} style={{ fontSize: '0.78rem', padding: '5px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--clr-wrong)', color: 'var(--clr-wrong)', cursor: 'pointer' }}>Too Hard</button>
          </div>
          {reportAck && <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--clr-accent)', margin: '6px 0', fontWeight: 500 }}>{reportAck}</div>}

          {renderFeedback(feedback, isCorrect)}

          {revealed && isCorrect !== null && (
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-dim)', marginTop: '0.3rem', textAlign: 'center' }}>
              {isCorrect ? (
                streak >= 2 && getTopicDiff(currentTopic?.key) < DIFF_LEVELS.length - 1
                  ? `🔥 ${streak} in a row! Levelling up next…`
                  : `✓ Streak: ${streak}`
              ) : (
                streak <= -1 && getTopicDiff(currentTopic?.key) > 0
                  ? `Levelling down next…`
                  : ''
              )}
            </div>
          )}
        </>
      )}
      {results.length > 0 && <ResultsTable results={results} />}
    </QuizLayout>
  )
}
import React, { useState, useRef, useEffect } from 'react'
import { HintModal } from '../components/HintSystem/HintModal.jsx'
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx'
import KeyTerms from '../components/KeyTerms'

export default function FuncEvalApp({ onBack, isGoalMode = false, dependencies }) {
  const {
    API,
    authGetToken,
    DEFAULT_TOTAL,
    useTimer,
    useAutoAdvance,
    getSpeedRunLimit,
    ResultsTable,
    renderFeedback,
    QuizLayout,
    ADAPT_LABELS,
    ADAPT_COLORS,
    adaptiveLevel,
    adaptivePct,
    DifficultySlider,
    NumPad,
  } = dependencies


  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' | 'medium' | 'hard' (number of variables)
  const [difficulty, setDifficulty] = useState('easy')
  // Adaptive mode enabled?
  const [isAdaptive, setIsAdaptive] = useState(false)
  // Adaptive score (0-3)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {formula: "2x + 3y + 1", vars: {x: 2, y: 3}, answer: 10}
  const [question, setQuestion] = useState(null)
  // User's answer (the result of the function evaluation)
  const [answer, setAnswer] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()
  const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('funceval', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);
  const advanceFnRef = useRef(null)

  const effectiveDiff = () => (isAdaptive) ? adaptiveLevel(adaptScoreRef.current) : difficulty

  /**
   * loadQuestion(): Fetch next function evaluation question
   * Endpoint: /funceval-api/question?difficulty={easy|medium|hard}
   * Returns: {formula: "2x + 3", vars: {x: 5}, answer: 13}
   */

  const handleTimeout = async () => {
    if (typeof revealed !== 'undefined' && revealed) return
    if (typeof finished !== 'undefined' && finished) return
    try { if (typeof setIsCorrect !== 'undefined') setIsCorrect(false) } catch(_) {}
    try { if (typeof setRevealed !== 'undefined') setRevealed(true) } catch(_) {}
    try { if (typeof setFeedback !== 'undefined') setFeedback("⏰ Time's up!") } catch(_) {}
    const timeTaken = timer.stop ? timer.stop() : 0
    const qPrompt = question ? (question.prompt || question.question || (question.n1 !== undefined ? `${question.n1} ${question.op || '+'} ${question.n2}` : 'Question')) : 'Question'
    try {
      const r = await fetch(`${API}/funceval-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
        body: JSON.stringify({ ...(typeof question !== 'undefined' ? question : {}), userAnswer: '', answer: '', sessionGoal })
      })
      const d = await r.json()
      const corrAns = d.display || d.correctAnswer || d.answer || '—'
      if (typeof setResults === 'function') {
        setResults(prev => [...prev, { prompt: qPrompt, question: qPrompt, userAnswer: '(timeout)', correctAnswer: corrAns, correct: false, time: timeTaken }])
      }
      if (sessionGoal === 'perfect') {
        try { if (typeof setFinished === 'function') setFinished(true); timer.reset() } catch(_) {}
      }
    } catch(e) {
      console.error('handleTimeout error:', e)
      if (typeof setResults === 'function') {
        setResults(prev => [...prev, { prompt: qPrompt, question: qPrompt, userAnswer: '(timeout)', correctAnswer: '—', correct: false, time: timeTaken }])
      }
    }
  }

const loadQuestion = async () => {
    setLoading(true)
    setAnswer('')
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Fetch function evaluation question from backend based on effective difficulty
    const res = await fetch(`${API}/funceval-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`, { headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' } })
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
  }

  /**
   * startQuiz(): Initialize function evaluation quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    setAdaptScore(0); adaptScoreRef.current = 0
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit function evaluation answer
   * Validation: answer must be filled
   * API: POSTs to /funceval-api/check with correct answer and user's answer
   * Compares numerical values (allows for floating point tolerance)
   */
  const handleSubmit = async () => {
    if (!question || revealed || !answer) return
    const timeTaken = timer.stop()
    // POST to backend to validate function evaluation
    const res = await fetch(`${API}/funceval-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  answer: question.answer, userAnswer: Number(answer), sessionGoal }) })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1)
    // Format variable string for feedback (e.g., "x=2, y=3")
    const varStr = Object.entries(question.vars).map(([k, v]) => `${k}=${v}`).join(', ');
    (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! f(${varStr}) = ${data.correctAnswer}`.slice(0,-1) + _ci + `Correct! f(${varStr}) = ${data.correctAnswer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. f(${varStr}) = ${data.correctAnswer}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect. f(${varStr}) = ${data.correctAnswer}`)
        }
      })()
    // Add result to history for results table
    setResults(prev => [...prev, {
      question: `${question.formula}, ${varStr}`,
      userAnswer: answer,
      correctAnswer: String(data.correctAnswer),
      correct: data.correct,
      time: timeTaken,
    }])
    if (isAdaptive) {
      setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
    }
    setRevealed(true)
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    const timeTaken = timer.stop()
    const varStr = Object.entries(question.vars).map(([k, v]) => `${k}=${v}`).join(', ')
    setIsCorrect(false)
    setRevealed(true)
    setFeedback(`Solution: f(${varStr}) = ${question.answer}`)
  }

  /**
   * advanceFnRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  advanceFnRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceFnRef, isCorrect)
  useEffect(() => {
    if (!revealed || isCorrect) return
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); advanceFnRef.current() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [revealed, isCorrect, questionNumber])

  // Format variable string for display in question (e.g., "x = 2, y = 3")
  const varStr = question ? Object.entries(question.vars).map(([k, v]) => `${k} = ${v}`).join(', ') : ''

  const diffLabels = { easy: 'Easy — f(x)', medium: 'Medium — f(x,y)', hard: 'Hard — f(x,y,z)', extrahard: 'Extra Hard — Nested' }
  const curAdaptLevel = adaptiveLevel(adaptScore)

  return (
    <QuizLayout title="Functions" subtitle="Evaluate the function at the given values" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {!started && !finished && <div className="welcome-box">
          <p className="welcome-text">Evaluate linear functions</p>
          <KeyTerms topicKey="functions" />
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {['easy', 'medium', 'hard', 'extrahard'].map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="funceval-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {diffLabels[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="funceval-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
            Adaptive
          </label>
        </div>

        {isGoalMode && (
        <>
          <p className="welcome-text" style={{ marginTop: '14px', fontSize: '0.92rem', fontWeight: 700, marginBottom: '6px' }}>Practice Goal:</p>
                  <div className="checkbox-group" style={{ marginBottom: '12px' }}>
                    {[
                                            { key: 'speed', label: '⚡ Speed Run' },
                      { key: 'perfect', label: '🎯 Perfect Solve' },
                      { key: 'revision', label: '🔄 Revision' }
                    ].map(g => (
                      <label key={g.key} className={`checkbox-pill${sessionGoal === g.key ? ' active' : ''}`}
                        style={sessionGoal === g.key ? (
                          g.key === 'speed' ? { background: 'rgba(255,179,0,0.18)', borderColor: '#ffb300', color: '#ffb300' } :
                          g.key === 'perfect' ? { background: 'rgba(244,67,54,0.18)', borderColor: '#f44336', color: '#f44336' } :
                          g.key === 'revision' ? { background: 'rgba(33,150,243,0.18)', borderColor: '#2196f3', color: '#2196f3' } : {}
                        ) : {}}>
                        <input type="radio" name="funcevalapp-goal" checked={sessionGoal === g.key} onChange={() => {
                          setSessionGoal(g.key)

                        }} />
                        {g.label}
                      </label>
                    ))}
                  </div>
                  {isAdaptive && <p style={{ fontSize: '0.82rem', color: 'var(--clr-dim)', marginBottom: '8px' }}>Starts easy and smoothly adjusts to your level as you answer.</p>}
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
        <div className="question-count-row">
          <label className="question-count-label">How many questions? (max 100)</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
          {isAdaptive && <div className="progress-pill" style={{ background: ADAPT_COLORS[curAdaptLevel], color: '#fff' }}>{ADAPT_LABELS[curAdaptLevel]}</div>}
        </div>
        {isAdaptive && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />}
        {question && <>
          <div className="question-box">
            <div>{question.formula}</div>
            <div className="given">Given: {varStr}</div>
          </div>
          <div className="single-input-row">
            <input className="answer-input" type="text" value={answer} disabled={revealed}
              onChange={e => { const v = e.target.value; if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setAnswer(v) }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} autoFocus />
          </div>
          <NumPad value={answer} onChange={setAnswer} onSubmit={handleSubmit} disabled={revealed} />
        </>}
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed && <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>}
          <button onClick={revealed ? () => advanceFnRef.current() : handleSubmit} disabled={loading || (!revealed && !answer)}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        {isAdaptive && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)' }}>Reached level: <strong style={{ color: ADAPT_COLORS[curAdaptLevel] }}>{ADAPT_LABELS[curAdaptLevel]}</strong></p>}
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    <HintModal concept={'funceval'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
</QuizLayout>
  )
}

/* ── Line Equation App ─────────────────────────────── */
/**
 * LineEqApp Component
 * Line equation practice: Find y = mx + c from two points
 * Given points (x1, y1) and (x2, y2), find slope m and y-intercept c
 * Calculation:
 *   m = (y2 - y1) / (x2 - x1)  [slope]
 *   c = y1 - m*x1             [y-intercept]
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */

import { useState, useEffect, useRef } from 'react'
import KeyTerms from '../components/KeyTerms'
import { HintModal } from '../components/HintSystem/HintModal.jsx'
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx'

/**
 * SqrtApp Component
 * Square root estimation drill: "What is floor(√n) or ceil(√n)?"
 * Features:
 *   - Questions progress in steps (step parameter tracks progression)
 *   - Accepts both floor and ceiling values as correct
 *   - Unlimited mode: totalQ=0 means infinite questions
 *   - Shows both floor and ceiling values in feedback
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
export default function SqrtApp({
  onBack,
  isGoalMode = false,
  API,
  DEFAULT_TOTAL,
  authGetToken,
  useTimer,
  getSpeedRunLimit,
  adaptiveLevel,
  adaptivePct,
  ADAPT_COLORS,
  ADAPT_LABELS,
  renderFeedback,
  QuizLayout: quizLayout,
  DifficultySlider: difficultySlider,
  ResultsTable: resultsTable,
  NumPad: numPad
}) {
  const QuizLayout = quizLayout
  const DifficultySlider = difficultySlider
  const ResultsTable = resultsTable
  const NumPad = numPad

  // Difficulty level: 'easy' (1-5), 'medium' (6-10), 'hard' (11-20), 'extrahard' (21-50)
  const [difficulty, setDifficulty] = useState('easy')
  // Adaptive mode enabled?
  const [isAdaptive, setIsAdaptive] = useState(false)
  // Adaptive score (0-3)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  // User-entered question limit (empty string = unlimited)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag
  const [started, setStarted] = useState(false)
  // Quiz finished flag
  const [finished, setFinished] = useState(false)
  // Current question object: {q: radicand, prompt: "√n"}
  const [question, setQuestion] = useState(null)
  // User's string input for the answer
  const [answer, setAnswer] = useState('')
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Feedback string with floor/ceiling values
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress?
  const [loading, setLoading] = useState(false)
  // Answer revealed flag
  const [revealed, setRevealed] = useState(false)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  // Timer instance for tracking time per question
  const timer = useTimer()
  const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('sqrt', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);
  const advanceFnRef = useRef(null)

  const effectiveDiff = () => (isAdaptive) ? adaptiveLevel(adaptScoreRef.current) : difficulty

  /**
   * fetchQuestion(step): Fetch next square root question
   * Endpoint: /sqrt-api/question?difficulty={easy|medium|hard|extrahard}
   * Returns: {q: radicand, prompt: "√n"}
   * Backend calculates sqrtRounded, floorAnswer, ceilAnswer for validation
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
      const r = await fetch(`${API}/sqrt-api/check`, {
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

const fetchQuestion = async (step) => {
    setLoading(true)
    setAnswer('')
    setFeedback('')
    setRevealed(false)
    setIsCorrect(null)
    // Fetch question for this difficulty
    const res = await fetch(`${API}/sqrt-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`, { headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' } })
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
  }

  /**
   * startQuiz(): Initialize square root quiz
   * Fetches first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    setAdaptScore(0)
    adaptScoreRef.current = 0
    await fetchQuestion(1)
  }

  /**
   * Keyboard handler for SqrtApp: Enter key to submit/next
   * Only active when quiz is running (started && !finished)
   */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Enter' || !started || finished) return
      event.preventDefault()
      handleSubmitOrNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, finished, question, answer, revealed, questionNumber, loading, totalQ])

  /**
   * handleSubmitOrNext(): Submission and progression for SqrtApp
   * Phase 1 (not revealed):
   *   - POST to /sqrt-api/check with {q, answer}
   *   - Receive { correct, sqrtRounded, floorAnswer, ceilAnswer }
   *   - Show floor and ceiling values in feedback
   *   - Accept answers that are floor or ceiling (or both)
   * Phase 2 (revealed):
   *   - If limited and all questions answered, finish
   *   - If unlimited or questions remain, fetch next question
   */
  const handleSubmitOrNext = async () => {
    if (!question) return
    if (!revealed) {
      if (answer === '') return
      const timeTaken = timer.stop()
      // POST to backend to validate square root answer
      const res = await fetch(`${API}/sqrt-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  q: question.q, answer: Number(answer), sessionGoal }) })
      const data = await res.json()
      setIsCorrect(data.correct)
      if (data.correct) setScore((s) => s + 1)
      // Show floor and ceiling values for reference
      const reasoning = `√${question.q} = ${data.sqrtRounded}\n⌊${data.sqrtRounded}⌋ = ${data.floorAnswer}, ⌈${data.sqrtRounded}⌉ = ${data.ceilAnswer}`;
      (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct!\n${reasoning}`.slice(0,-1) + _ci + `Correct!\n${reasoning}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect.\n${reasoning}\nAcceptable answers: ${data.floorAnswer} or ${data.ceilAnswer}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect.\n${reasoning}\nAcceptable answers: ${data.floorAnswer} or ${data.ceilAnswer}`)
        }
      })()
      setResults((prev) => [...prev, {
        question: `√${question.q}`,
        userAnswer: answer,
        correctAnswer: `${data.floorAnswer} or ${data.ceilAnswer}`,
        correct: data.correct,
        time: timeTaken,
      }])
      if (isAdaptive) {
        setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
      }
      setRevealed(true)
      return
    }

    // Quiz progression: check if all questions answered
    if (questionNumber >= totalQ) {
      setFinished(true)
      setQuestion(null)
      timer.reset()
      return
    }

    // Load next question
    const next = questionNumber + 1
    setQuestionNumber(next)
    await fetchQuestion(next)
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    const timeTaken = timer.stop()
    setIsCorrect(false)
    setRevealed(true)
    setFeedback(`Solution: √${question.q} = (approximately)`)
  }

  useEffect(() => {
    if (!revealed || isCorrect) return
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitOrNext() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [revealed, isCorrect, questionNumber])

  const diffLabels = { easy: 'Easy — up to 100', medium: 'Medium — up to 1000', hard: 'Hard — up to 10000', extrahard: 'Extra Hard — up to 100000' }
  const curAdaptLevel = adaptiveLevel(adaptScore)

  return (
    <QuizLayout title="Square Root" subtitle="Floor or ceiling is accepted" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Practice square roots!</p>
        <KeyTerms topicKey="square-roots" />
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {['easy', 'medium', 'hard', 'extrahard'].map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="sqrt-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {diffLabels[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="sqrt-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
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
                        <input type="radio" name="sqrtapp-goal" checked={sessionGoal === g.key} onChange={() => {
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
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setNumQuestions(v) }} placeholder={String(DEFAULT_TOTAL)} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
          {isAdaptive && <div className="progress-pill" style={{ background: ADAPT_COLORS[curAdaptLevel], color: '#fff' }}>{ADAPT_LABELS[curAdaptLevel]}</div>}
        </div>
        {isAdaptive && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />}
        <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
        <input className="answer-input" type="text" value={answer} onChange={(e) => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" />
        <NumPad value={answer} onChange={(v) => !revealed && setAnswer(v)} disabled={revealed} />
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed && <button onClick={handleSolve} disabled={loading || answer === ''} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>}
          <button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>{revealed ? (questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete.</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        {isAdaptive && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)' }}>Reached level: <strong style={{ color: ADAPT_COLORS[curAdaptLevel] }}>{ADAPT_LABELS[curAdaptLevel]}</strong></p>}
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    <HintModal concept={'sqrt'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
</QuizLayout>
  )

}

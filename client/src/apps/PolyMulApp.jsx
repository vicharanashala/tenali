import { useEffect, useState, useRef } from 'react';
import KeyTerms from '../components/KeyTerms';

/**
 * PolyMulApp Component
 * Polynomial multiplication practice: Multiply two polynomials and enter result coefficients
 * Features:
 *   - User enters coefficients for each degree of the result polynomial
 *   - Difficulty levels: easy, medium, hard (control polynomial degrees/coefficients)
 *   - Displays polynomials in readable format with superscripts
 *   - Validates all coefficients before submission
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
export default function PolyMulApp({
  onBack,
  isGoalMode = false,
  API,
  DEFAULT_TOTAL,
  authGetToken,
  useTimer,
  useAutoAdvance,
  getSpeedRunLimit,
  adaptiveLevel,
  adaptivePct,
  ADAPT_COLORS,
  ADAPT_LABELS,
  renderFeedback,
  QuizLayout: quizLayout,
  DifficultySlider: difficultySlider,
  ResultsTable: resultsTable,
  coeffsToPolyStr,
}) {
  const QuizLayout = quizLayout;
  const DifficultySlider = difficultySlider;
  const ResultsTable = resultsTable;
  // Difficulty level: 'easy' | 'medium' | 'hard' | 'extrahard'
  const [difficulty, setDifficulty] = useState('easy')
  // Adaptive mode enabled?
  const [isAdaptive, setIsAdaptive] = useState(false)
  // Adaptive score (0-3)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  // Number of questions to answer
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag
  const [started, setStarted] = useState(false)
  // Quiz finished flag
  const [finished, setFinished] = useState(false)
  // Current question: {p1, p2, p1Display, p2Display, productDisplay, resultDegree}
  const [question, setQuestion] = useState(null)
  // Array of user-entered coefficients (strings, parallel to resultDegree length)
  const [userCoeffs, setUserCoeffs] = useState([])
  // Feedback string
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct?
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress?
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
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
  const advanceFnRef = useRef(null)

  const effectiveDiff = () => (isAdaptive) ? adaptiveLevel(adaptScoreRef.current) : difficulty

  /**
   * loadQuestion(): Fetch next polynomial multiplication question
   * Endpoint: /polymul-api/question?difficulty={easy|medium|hard|extrahard}
   * Returns: {p1, p2, p1Display, p2Display, productDisplay, resultDegree, correctCoeffs}
   * Initializes userCoeffs array with empty strings (one per degree)
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
      const r = await fetch(`${API}/polymul-api/check`, {
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
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    const res = await fetch(`${API}/polymul-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`, { headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' } })
    const data = await res.json()
    setQuestion(data)
    // Initialize empty coefficient array for this polynomial's degree
    setUserCoeffs(new Array(data.resultDegree + 1).fill(''))
    setLoading(false)
    timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
  }

  /**
   * startQuiz(): Initialize polynomial multiplication quiz
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
    setAdaptScore(0)
    adaptScoreRef.current = 0
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit all coefficients
   * Checks that all coefficient fields are filled before submission
   * POSTs to /polymul-api/check with {p1, p2, userCoeffs}
   */
  const handleSubmit = async () => {
    if (!question || revealed) return
    // Require all coefficient fields to be filled
    if (userCoeffs.some(c => c === '')) return
    const timeTaken = timer.stop()
    // Build polynomial string from user's coefficients for the monster interceptor
    // e.g. userCoeffs=['2','3'] => '3x + 2' (sent as userAnswer, read by Bracketeer classifier)
    const userAnswerStr = coeffsToPolyStr(userCoeffs)
    // POST to backend to validate polynomial multiplication result
    const res = await fetch(`${API}/polymul-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  p1: question.p1, p2: question.p2, userCoeffs: userCoeffs.map(Number), userAnswer: userAnswerStr, sessionGoal }) })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1);
    (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.productDisplay}`.slice(0,-1) + _ci + `Correct! ${question.productDisplay}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.correctDisplay}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.correctDisplay}`)
        }
      })()
    setResults(prev => [...prev, {
      question: `(${question.p1Display})(${question.p2Display})`,
      userAnswer: userCoeffs.join(', '),
      correctAnswer: data.correctCoeffs.join(', '),
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
    timer.stop()
    try {
      const r = await fetch(`${API}/polymul-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  p1: question.p1, p2: question.p2, userCoeffs: [], solve: true, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(false); setRevealed(true)
      const display = data.correctDisplay || question.productDisplay || ''
      const explanation = data.explanation || ''
      setFeedback(`Solution: ${display}${explanation ? '\n' + explanation : ''}`)
      setResults(prev => [...prev, { question: `(${question.p1Display})(${question.p2Display})`, userAnswer: '(solved)', correctAnswer: data.correctCoeffs?.join(', ') || display, correct: false, time: 0 }])
      if (isAdaptive) {
        setAdaptScore(prev => Math.max(0, prev - 0.35))
      }
    } catch (e) { console.error('Failed to solve polymul:', e) }
  }

  /**
   * Auto-advance to next question after correct answer (uses useAutoAdvance hook)
   */
  const advance = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  advanceFnRef.current = advance
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  useEffect(() => {
    if (!revealed || isCorrect) return
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); advance() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [revealed, isCorrect, questionNumber])

  /**
   * sup(n): Convert digit to superscript character
   * Maps: 0→⁰, 1→¹, ..., 9→⁹
   */
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')

  /**
   * formatCoeffLabel(i): Format label for coefficient at degree i
   * Returns: "constant" for i=0, "x" for i=1, "x²" for i=2, etc.
   */
  const formatCoeffLabel = (i) => i === 0 ? 'constant' : i === 1 ? 'x' : `x${sup(i)}`

  const diffLabels = { easy: 'Easy — Small terms', medium: 'Medium — Moderate', hard: 'Hard — Large terms', extrahard: 'Extra Hard — Higher degree' }
  const curAdaptLevel = adaptiveLevel(adaptScore)

  return (
    <QuizLayout title="Poly Multiply" subtitle="Multiply two polynomials and enter the coefficients" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Practice polynomial multiplication!</p>
        <KeyTerms topicKey="polynomial-multiplication" />
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {['easy', 'medium', 'hard', 'extrahard'].map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="polymul-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {diffLabels[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="polymul-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
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
                        <input type="radio" name="polymulapp-goal" checked={sessionGoal === g.key} onChange={() => {
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
            <span className="poly-expr">({question.p1Display})</span> × <span className="poly-expr">({question.p2Display})</span>
          </div>
          <div className="coeff-inputs">
            {userCoeffs.map((c, i) => (
              <div key={i} className="coeff-field">
                <label className="coeff-label">{formatCoeffLabel(i)}</label>
                <input className="answer-input coeff-input" type="text" value={c} disabled={revealed}
                  onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) { const nc = [...userCoeffs]; nc[i] = v; setUserCoeffs(nc) } }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
              </div>
            ))}
          </div>
        </>}
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed ? <>
            <button onClick={handleSubmit} disabled={loading || userCoeffs.some(c => c === '')}>Submit</button>
            <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
          </> : <button onClick={advance}>{questionNumber >= totalQ ? 'Finish' : 'Next'}</button>}
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
    </QuizLayout>
  )
}

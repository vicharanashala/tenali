import { useState, useEffect, useRef } from 'react'
import { HintModal } from '../components/HintSystem/HintModal.jsx'
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx'
import ConceptualVisualDiagram from '../components/ConceptualVisualDiagram'
import KeyTerms from '../components/KeyTerms'
import { cjTakeReco } from '../cjReco'
export default function FractionAddApp({ onBack, completedTopics = [], goldMastery = [], markTopicCompleted, markGoldMastery, updateCoins, setMode, setTransferTopic, isGoalMode = false, ADAPT_COLORS, ADAPT_LABELS, API, CJ_RECO_DIFFS, DEFAULT_TOTAL, DifficultySlider, Frac, QuizLayout, ResultsTable, adaptiveLevel, adaptivePct, authGetToken, getSpeedRunLimit, isStage3Completed, renderFeedback, useAutoAdvance, useTimer }) {
  // ── State variables ──────────────────────────────────────────────────
  // Difficulty: 'easy' | 'medium' | 'hard' | 'extrahard'
  const [difficulty, setDifficulty] = useState(() => cjTakeReco('fractionadd', CJ_RECO_DIFFS) || 'easy')
  // Adaptive mode enabled?
  const [isAdaptive, setIsAdaptive] = useState(false)
  // Adaptive score (0-3)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  // Number of questions (user-configurable, stored as string for input)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz phase flags
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (finished) {
      const pass = score / totalQ >= 0.8
      if (pass && markTopicCompleted) {
        markTopicCompleted('fractionadd', isAdaptive ? 'adaptive' : difficulty)
      }
    }
  }, [finished])
  // Current question object from API
  const [question, setQuestion] = useState(null)
  // User's answer as a string: "3/4" or "2 3/4" for mixed numbers
  const [answer, setAnswer] = useState('')
  // Score tracking
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Feedback after submission
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  // Loading flag for API calls
  const [loading, setLoading] = useState(false)
  // Whether answer has been revealed (submitted)
  const [revealed, setRevealed] = useState(false)
  const [revealedCorrectAnswer, setRevealedCorrectAnswer] = useState('')
  // Results log for ResultsTable
  const [results, setResults] = useState([])
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  // Timer for per-question timing
  const timer = useTimer()
  const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('fractionadd', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);

  // ── Refs for auto-advance ────────────────────────────────────────────
  const advanceFnRef = useRef(null)

  const promotionTriggeredRef = useRef(false)

  const effectiveDiff = () => isAdaptive ? adaptiveLevel(adaptScoreRef.current) : difficulty

  /**
   * loadQuestion(): Fetch a new fraction-add question from the API.
   * Updates question state and resets answer fields.
   */

  const handleTimeout = async () => {
    if (typeof revealed !== 'undefined' && revealed) return
    if (typeof finished !== 'undefined' && finished) return
    try { if (typeof setIsCorrect !== 'undefined') setIsCorrect(false) } catch(_) {}
    try { if (typeof setRevealed !== 'undefined') setRevealed(true) } catch(_) {}
    try { if (typeof setFeedback !== 'undefined') setFeedback('⏰ Time\'s up! Speed run requires a quick answer.') } catch(_) {}
    try {
      const r = await fetch(`${API}/fractionadd-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
        body: JSON.stringify({ ...(typeof question !== 'undefined' ? question : {}), userAnswer: '', answer: '', sessionGoal })
      })
      const d = await r.json()
      if (sessionGoal === 'perfect') {
        try { setFinished(true); timer.reset() } catch(_) {}
      }
    } catch(e) { console.error('handleTimeout error:', e) }
  }

const loadQuestion = async () => {
    setLoading(true)
    try {
      const diff = effectiveDiff()
      const isMilestone = (questionNumber > 0 && questionNumber % 5 === 0) || promotionTriggeredRef.current
      promotionTriggeredRef.current = false

      const headers = { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }

      let data = null
      if (isMilestone) {
        try {
          const excludeList = results.map(r => r.id || '').filter(Boolean).join(',')
          const cr = await fetch(`${API}/conceptual-api/question?topic=fractionadd&difficulty=${diff}&exclude=${excludeList}&goal=${sessionGoal}`, { headers })
          if (cr.ok) {
            data = await cr.json()
          } else {
            console.warn('Conceptual question not found or failed for topic: fractionadd. Falling back to standard question.')
          }
        } catch (err) {
          console.error('Failed to fetch conceptual question, falling back:', err)
        }
      }

      if (!data) {
        const r = await fetch(`${API}/fractionadd-api/question?difficulty=${diff}&goal=${sessionGoal}`, {
          headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }
        })
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        data = await r.json()
      }

      // Map conceptual question schema to prompt if conceptual
      if (data && data.isConceptual && data.question) {
        data.prompt = data.question
      }
      setQuestion(data)
      setAnswer('')
      setFeedback('')
      setIsCorrect(null)
      setRevealed(false)
      setRevealedCorrectAnswer('')
      timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
    } catch (e) {
      console.error('Failed to load fraction question:', e)
    }
    setLoading(false)
  }

  /**
   * startQuiz(): Initialize quiz with chosen settings.
   * Sets total questions, resets score and results, loads first question.
   */
  const startQuiz = () => {
    const t = Math.max(1, Math.min(100, Number(numQuestions) || DEFAULT_TOTAL))
    setTotalQ(t)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    setAdaptScore(0)
    adaptScoreRef.current = 0
    promotionTriggeredRef.current = false
    setStarted(true)
    setFinished(false)
  }

  // Load question when quiz starts or question number changes
  useEffect(() => {
    if (started && !finished && questionNumber > 0) loadQuestion()
  }, [started, questionNumber])

  /**
   * advance(): Move to the next question or finish the quiz.
   * Called by auto-advance (correct) or Next button (wrong).
   */
  const advance = () => {
    if (questionNumber >= totalQ) {
      setFinished(true)
    } else {
      setQuestionNumber(n => n + 1)
    }
  }

  // Keep advanceFnRef updated for useAutoAdvance hook
  advanceFnRef.current = advance

  // Auto-advance after correct answer (1500ms delay)
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  // Enter key to advance after wrong answer
  useEffect(() => {
    if (!revealed || isCorrect) return
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [revealed, isCorrect, questionNumber])

  // Keyboard listener for option selection (A, B, C, D) in conceptual mode
  useEffect(() => {
    if (!started || finished || !question || !question.isConceptual || revealed) return
    const handleKey = (e) => {
      const key = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault()
        setAnswer(key)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, finished, question, revealed])

  /**
   * parseAnswer(str): Parse user's answer string into {whole, num, den}
   * Accepts formats: "3/4", "2 3/4", "5", "2 5"
   * Returns null if invalid.
   */
  const parseAnswer = (str) => {
    const s = str.trim()
    if (!s) return null
    // Try "W N/D" (mixed number)
    const mixedMatch = s.match(/^(-?\d+)\s+(-?\d+)\/(\d+)$/)
    if (mixedMatch) return { whole: Number(mixedMatch[1]), num: Number(mixedMatch[2]), den: Number(mixedMatch[3]) }
    // Try "N/D" (simple fraction)
    const fracMatch = s.match(/^(-?\d+)\/(\d+)$/)
    if (fracMatch) return { whole: 0, num: Number(fracMatch[1]), den: Number(fracMatch[2]) }
    // Try plain number "N" (whole number, den=1)
    const numMatch = s.match(/^(-?\d+)$/)
    if (numMatch) return { whole: 0, num: Number(numMatch[1]), den: 1 }
    return null
  }

  /**
   * handleSubmit(): Validate and submit the user's answer.
   * Parses the text input (e.g., "3/4" or "2 3/4"), then POSTs to /fractionadd-api/check.
   */
  const handleSubmit = async () => {
    if (!question || revealed) return

    if (question.isConceptual) {
      if (!answer) return
      const timeTaken = timer.stop()
      try {
        const r = await fetch(`${API}/conceptual-api/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: question.id, answerOption: answer.trim() })
        })
        const data = await r.json()
        setIsCorrect(data.correct)
        setRevealed(true)
        if (data.correctAnswer) setRevealedCorrectAnswer(data.correctAnswer)
        if (data.correct) setScore(s => s + 1)

        setFeedback(data.correct ? 'Correct!' : `Incorrect. Correct answer is option ${data.correctAnswer}. ${data.explanation || ''}`)
        setResults(prev => [...prev, {
          question: question.prompt,
          userAnswer: answer.trim(),
          correctAnswer: data.correctAnswer,
          correct: data.correct,
          time: timeTaken,
          id: question.id
        }])

        if (isAdaptive) {
          const oldStage = Math.min(3, Math.max(0, Math.floor(adaptScoreRef.current)))
          setAdaptScore(prev => {
            const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35)
            adaptScoreRef.current = next
            const newStage = Math.min(3, Math.max(0, Math.floor(next)))
            if (newStage > oldStage) {
              promotionTriggeredRef.current = true
            }
            return next
          })
        }
      } catch (e) {
        console.error('Failed to check conceptual fraction answer:', e)
      }
      return
    }

    const parsed = parseAnswer(answer)
    if (!parsed || parsed.den === 0) return

    const timeTaken = timer.stop()
    // Default to '+' if the server didn't include an op (back-compat with older API)
    const op = question.op || '+'
    const payload = {
      n1: question.n1, d1: question.d1,
      n2: question.n2, d2: question.d2,
      op,
      ansNum: parsed.num,
      ansDen: parsed.den,
      mixed: question.mixed || false,
    }
    if (question.mixed) {
      payload.w1 = question.w1
      payload.w2 = question.w2
      payload.ansWhole = parsed.whole
    }

    try {
      const r = await fetch(`${API}/fractionadd-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...payload, sessionGoal }) })
      const data = await r.json()

      setIsCorrect(data.correct)
      setRevealed(true)
      if (data.correct) setScore(s => s + 1);

      const prompt = question.mixed
        ? `${question.w1} ${question.n1}/${question.d1} ${op} ${question.w2} ${question.n2}/${question.d2}`
        : `${question.n1}/${question.d1} ${op} ${question.n2}/${question.d2}`;

      (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${prompt} = ${data.display}`.slice(0,-1) + _ci + `Correct! ${prompt} = ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${prompt} = ${data.display}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect. ${prompt} = ${data.display}`)
        }
      })()

      setResults(prev => [...prev, {
        prompt,
        question: prompt,
        userAnswer: answer.trim(),
        correctAnswer: data.display,
        correct: data.correct,
        time: timeTaken
      }])
      if (isAdaptive) {
        const oldStage = Math.min(3, Math.max(0, Math.floor(adaptScoreRef.current)))
        setAdaptScore(prev => {
          const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35)
          adaptScoreRef.current = next
          const newStage = Math.min(3, Math.max(0, Math.floor(next)))
          if (newStage > oldStage) {
            promotionTriggeredRef.current = true
          }
          return next
        })
      }
    } catch (e) {
      console.error('Failed to check fraction answer:', e)
    }
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    timer.stop()

    if (question.isConceptual) {
      try {
        const r = await fetch(`${API}/conceptual-api/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: question.id, answerOption: '' })
        })
        const data = await r.json()
        setIsCorrect(false)
        setRevealed(true)
        if (data.correctAnswer) setRevealedCorrectAnswer(data.correctAnswer)
        setFeedback(`Solution: Correct option is ${data.correctAnswer}. ${data.explanation || ''}`)
        setResults(prev => [...prev, {
          question: question.prompt,
          userAnswer: '(solved)',
          correctAnswer: data.correctAnswer,
          correct: false,
          time: 0,
          id: question.id
        }])
        if (isAdaptive) {
          setAdaptScore(prev => {
            const next = Math.max(0, prev - 0.35)
            adaptScoreRef.current = next
            return next
          })
        }
      } catch (e) {
        console.error('Failed to solve conceptual question:', e)
      }
      return
    }

    const op = question.op || '+'
    const prompt = question.mixed
      ? `${question.w1} ${question.n1}/${question.d1} ${op} ${question.w2} ${question.n2}/${question.d2}`
      : `${question.n1}/${question.d1} ${op} ${question.n2}/${question.d2}`
    try {
      const r = await fetch(`${API}/fractionadd-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  ...question, ansNum: '', ansDen: '', solve: true, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(false); setRevealed(true)
      const display = data.display || data.correctAnswer || data.answer || ''
      const explanation = data.explanation || ''
      setFeedback(`Solution: ${display}${explanation ? '\n' + explanation : ''}`)
      setResults(prev => [...prev, { prompt, question: prompt, userAnswer: '(solved)', correctAnswer: display, correct: false, time: 0 }])
      if (isAdaptive) {
        setAdaptScore(prev => {
          const next = Math.max(0, prev - 0.35)
          adaptScoreRef.current = next
          return next
        })
      }
    } catch (e) { console.error('Failed to solve fraction:', e) }
  }

  /**
   * handleKeyDown(e): Handle Enter key to submit or advance.
   * Attached to the fraction input fields.
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (revealed) advance()
      else handleSubmit()
    }
  }

  /**
   * formatFraction(n, d): Render a fraction using the shared <Frac> component
   * which draws a proper horizontal bar between numerator and denominator
   * (the previous CSS-class-based implementation didn't render a visible bar
   * because some host stylesheets were missing the .frac-bar rule).
   */
  const formatFraction = (n, d) => <Frac n={n} d={d} size="1.4em" />

  /**
   * formatMixed(w, n, d): Render a mixed number as whole + fraction.
   */
  const formatMixed = (w, n, d) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontWeight: 600 }}>{w}</span>
      <Frac n={n} d={d} size="1.4em" />
    </span>
  )

  const diffLabels = { easy: 'Easy — Same denominator', medium: 'Medium — Related denominators', hard: 'Hard — Different denominators', extrahard: 'Extra Hard — Mixed & improper' }
  const curAdaptLevel = adaptiveLevel(adaptScore)

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <QuizLayout title="Fractions" subtitle="Add, subtract, multiply & divide fractions" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {/* ── Setup Phase ── */}
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Practice adding fractions!</p>
        <KeyTerms topicKey="fractions" />
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {['easy', 'medium', 'hard', 'extrahard'].map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="frac-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {diffLabels[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="frac-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
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
                        <input type="radio" name="fractionaddapp-goal" checked={sessionGoal === g.key} onChange={() => {
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
        {isStage3Completed('fractionadd', completedTopics) && (
          <div className="transfer-cta-box" style={{ marginTop: '20px', padding: '16px', background: 'var(--clr-hover, rgba(255,255,255,0.03))', borderRadius: '10px', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
              {goldMastery.includes('fractionadd') ? (
                <>🥇 You have achieved Gold Mastery for this topic!</>
              ) : (
                <>🎉 You have completed Stage 3 Practice for this topic!</>
              )}
            </p>
            <button
              className="btn-transfer-cta"
              onClick={() => {
                if (setTransferTopic) setTransferTopic('fractionadd')
                if (setMode) setMode('transfer')
              }}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {goldMastery.includes('fractionadd') ? (
                <>🔄 Revisit Transfer Challenge (Stage 4) 🥇</>
              ) : (
                <>🚀 Start Transfer Challenge (Stage 4) 🥇</>
              )}
            </button>
          </div>
        )}
      </div>}

      {/* ── Playing Phase ── */}
      {started && !finished && <>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
          {isAdaptive && <div className="progress-pill" style={{ background: ADAPT_COLORS[curAdaptLevel], color: '#fff' }}>{ADAPT_LABELS[curAdaptLevel]}</div>}
        </div>
        {isAdaptive && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />}
        {question && (
          question.isConceptual ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div className="question-prompt" style={{ fontSize: '1.3rem', margin: '20px 0', lineHeight: '1.6' }}>{question.prompt}</div>
              <ConceptualVisualDiagram visualType={question.visualType} visualData={question.visualData} />
              {question.options && (
                <div className="mcq-options-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '480px', margin: '20px auto', padding: '0 10px' }}>
                  {question.options.map((opt, idx) => {
                    const letter = ['A', 'B', 'C', 'D'][idx]
                    const isSelected = answer === letter
                    const isCorrectChoice = revealed && (letter === (revealedCorrectAnswer || question.answerOption))
                    const isWrongChoice = revealed && isSelected && !isCorrect

                    let cardClass = "mcq-option-card"
                    if (isSelected) cardClass += " selected"
                    if (isCorrectChoice) cardClass += " correct"
                    if (isWrongChoice) cardClass += " wrong"

                    return (
                      <div
                        key={letter}
                        className={cardClass}
                        onClick={() => { if (!revealed) setAnswer(letter) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          border: isSelected ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                          borderRadius: '8px',
                          cursor: revealed ? 'not-allowed' : 'pointer',
                          background: isCorrectChoice ? 'rgba(76, 175, 80, 0.15)' : isWrongChoice ? 'rgba(244, 67, 54, 0.15)' : isSelected ? 'var(--clr-bg-soft)' : 'var(--clr-bg-card)',
                          borderColor: isCorrectChoice ? 'var(--clr-correct)' : isWrongChoice ? 'var(--clr-wrong)' : isSelected ? 'var(--clr-accent)' : 'var(--clr-border)',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                      >
                        <span className="option-badge" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          marginRight: '12px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          background: isCorrectChoice ? 'var(--clr-correct)' : isWrongChoice ? 'var(--clr-wrong)' : isSelected ? 'var(--clr-accent)' : 'var(--clr-bg-soft)',
                          color: (isCorrectChoice || isWrongChoice || isSelected) ? '#fff' : 'var(--clr-fg)',
                        }}>
                          {letter}
                        </span>
                        <span className="option-text" style={{ flex: 1, fontSize: '0.95rem', fontWeight: isSelected ? '600' : 'normal', color: 'var(--clr-fg)' }}>
                          {opt}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="fraction-problem">
              {/* Render the problem: n1/d1 (op) n2/d2 or mixed numbers (op) mixed numbers.
                  The operator comes from the server (default '+' for back-compat). */}
              {question.mixed ? (
                <div className="fraction-expression">
                  {formatMixed(question.w1, question.n1, question.d1)}
                  <span className="frac-operator">{question.op || '+'}</span>
                  {formatMixed(question.w2, question.n2, question.d2)}
                  <span className="frac-operator">=</span>
                </div>
              ) : (
                <div className="fraction-expression">
                  {formatFraction(question.n1, question.d1)}
                  <span className="frac-operator">{question.op || '+'}</span>
                  {formatFraction(question.n2, question.d2)}
                  <span className="frac-operator">=</span>
                </div>
              )}

              {/* Single text input — type answer as "3/4" or "2 3/4" */}
              <input
                className="answer-input"
                type="text"
                value={answer}
                onChange={e => { if (!revealed) setAnswer(e.target.value) }}
                disabled={revealed}
                placeholder={question.mixed ? 'e.g. 2 3/4' : 'e.g. 3/4'}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )
        )}

        {renderFeedback(feedback, isCorrect)}

        <div className="button-row">
          {!revealed ? (
            <>
              <button onClick={handleSubmit} disabled={loading || !answer.trim()}>Submit</button>
              <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
            </>
          ) : (
            <button onClick={advance}>{questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question'}</button>
          )}
        </div>

        {results.length > 0 && <ResultsTable results={results} />}
      </>}

      {/* ── Finished Phase ── */}
      {finished && (
        <div className="welcome-box">
          <p className="welcome-text">Quiz complete!</p>
          <p className="final-score">Final score: {score}/{totalQ}</p>
          {isAdaptive && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)' }}>Reached level: <strong style={{ color: ADAPT_COLORS[curAdaptLevel] }}>{ADAPT_LABELS[curAdaptLevel]}</strong></p>}
          <ResultsTable results={results} />
          <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
        </div>
      )}
    <HintModal concept={'fractionadd'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
</QuizLayout>
  )
}

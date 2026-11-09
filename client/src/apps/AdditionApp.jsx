import React, { useState, useRef, useEffect, useCallback } from 'react'
import QuizLayout from '../components/QuizLayout'
import KeyTerms from '../components/KeyTerms'
import ResultsTable from '../components/ResultsTable'
import { renderFeedback } from '../components/renderFeedback'
import { useTimer } from '../hooks/useTimer'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { cjTakeReco } from '../cjReco'

const CJ_RECO_DIFFS = ['easy', 'medium', 'hard', 'extrahard']
const DEFAULT_TOTAL = 20

const API = import.meta.env.VITE_API_BASE_URL || ''

const ADAPT_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  extrahard: 'Extra Hard'
}

const ADAPT_COLORS = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#f44336',
  extrahard: '#9c27b0'
}


function getSpeedRunLimit(difficulty, isAdaptive) {
  if (isAdaptive) return 10

  const limits = {
    easy: 5,
    medium: 10,
    hard: 15,
    extrahard: 20
  }

  return limits[difficulty] ?? 10
}
function AdditionApp({ onBack, completedTopics = [], goldMastery = [], markTopicCompleted, setTransferTopic, setMode, initialMode, initialDifficulty, initialNumQuestions, initialStarted, isGoalMode = false }) {
  const [showComicAddition, setShowComicAddition] = useState(false)
  // Mode selection: 'standard' (default), 'counting' (Visual Counting), 'scale' (Balance Scale)
  const [additionMode, setAdditionMode] = useState(initialMode || 'standard')
  // Difficulty level: 'easy' (1-digit), 'medium' (2-digit), 'hard' (3-digit), 'extrahard' (4-digit)
  const [difficulty, setDifficulty] = useState(() => initialDifficulty || cjTakeReco('addition', CJ_RECO_DIFFS) || 'easy')
  // Adaptive mode enabled?
  const [isAdaptive, setIsAdaptive] = useState(false)
  // Adaptive score (0-3)
  const [adaptScore, setAdaptScore] = useState(0)

  const adaptScoreRef = useRef(0)
  // User-entered number of questions to attempt
  const [numQuestions, setNumQuestions] = useState(initialNumQuestions || String(DEFAULT_TOTAL))
  // Quiz state: has quiz started?
  const [started, setStarted] = useState(initialStarted || false)
  // Has quiz finished (all questions answered)?
  const [finished, setFinished] = useState(false)
  // Current question object: {a, b, prompt}
  const [question, setQuestion] = useState(null)
  // User's text input (numeric answer)
  const [answer, setAnswer] = useState('')
  // Number of correct answers
  const [score, setScore] = useState(0)
  // Current question number (1, 2, 3, ...)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to attempt
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Feedback message after submission
  const [feedback, setFeedback] = useState('')
  // Is answer correct?
  const [isCorrect, setIsCorrect] = useState(null)
  // Is a question being fetched?
  const [loading, setLoading] = useState(false)
  // Has answer been revealed?
  const [revealed, setRevealed] = useState(false)
  // Results array for display
  const [results, setResults] = useState([])
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  // Timer for response timing
  const timer = useTimer()
  const advanceFnRef = useRef(null)
  // Tracks the in-flight question fetch so a newer fetchQuestion() call (or
  // unmount) can cancel a still-pending older one — see makeQuizApp's
  // loadQuestion() for the same pattern and the race it prevents.
  const questionAbortRef = useRef(null)
  useEffect(() => () => questionAbortRef.current?.abort(), [])

  useQuizCompletion({
    topicKey: 'addition',
    difficulty,
    isAdaptive,
    score,
    totalQ,
    finished,
    markTopicCompleted,
  })

  // Drag & Drop Visual Counting state
  const [sourceItems, setSourceItems] = useState([])
  const [targetItems, setTargetItems] = useState([])

  // Balance Scale state
  const [rightBlocks, setRightBlocks] = useState([])
  const [bankBlocks, setBankBlocks] = useState([])

  // Enforce difficulty and adaptive mode rules when mode changes
  useEffect(() => {
    if (additionMode !== 'standard') {
      setIsAdaptive(false)
      if (difficulty === 'extrahard') {
        setDifficulty('hard')
      }
    }
  }, [additionMode, difficulty])

  const effectiveDiff = () => isAdaptive ? adaptiveLevel(adaptScoreRef.current) : difficulty
  const digitMap = { easy: 1, medium: 2, hard: 3, extrahard: 4 }

  /**
   * fetchQuestion(selectedDifficulty?): Fetch next addition question from API
   */
  
  const handleTimeout = async () => {
    if (typeof revealed !== 'undefined' && revealed) return
    if (typeof finished !== 'undefined' && finished) return
    try { if (typeof setIsCorrect !== 'undefined') setIsCorrect(false) } catch(_) {}
    try { if (typeof setRevealed !== 'undefined') setRevealed(true) } catch(_) {}
    try { if (typeof setFeedback !== 'undefined') setFeedback('⏰ Time\'s up! Speed run requires a quick answer.') } catch(_) {}
    try {
      const r = await fetch(`${API}/addition-api/check`, {
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

const fetchQuestion = async (selectedDifficulty = difficulty) => {
    questionAbortRef.current?.abort()
    const controller = new AbortController()
    questionAbortRef.current = controller

    setLoading(true)
    setFeedback('')
    setAnswer('')
    setRevealed(false)
    setIsCorrect(null)

    const diffLevel = isAdaptive ? adaptiveLevel(adaptScoreRef.current) : selectedDifficulty
    const digits = digitMap[diffLevel]

    const sumMaxMap = { easy: null, medium: 30, hard: 50 }
    const sumMax = additionMode === 'counting' ? sumMaxMap[diffLevel] : null
    const sumMaxParam = sumMax ? `&sumMax=${sumMax}` : ''

    try {
      const res = await fetch(`${API}/addition-api/question?digits=${digits}${sumMaxParam}`, { signal: controller.signal })
      const data = await res.json()
      setQuestion(data)

      const targetTotal = Number(data.a) + Number(data.b)

      if (additionMode === 'counting') {
        // Initialize apples for Visual Counting mode
        const totalApples = Math.max(15, targetTotal + 5)
        const initialItems = Array.from({ length: totalApples }, (_, i) => ({ id: `apple-${i}`, icon: '🍎' }))
        setSourceItems(initialItems)
        setTargetItems([])
      } else if (additionMode === 'scale') {
        // Initialize weights for Balance Scale mode
        let initBank = []
        if (diffLevel === 'easy') {
          if (targetTotal >= 10) {
            const numTens = Math.floor(targetTotal / 10) + 2;
            const numOnes = Math.max(12, (targetTotal % 10) + 5);
            for (let i = 0; i < numTens; i++) {
              initBank.push({ id: `bank-10-${i}-${Math.random()}`, val: 10 });
            }
            for (let i = 0; i < numOnes; i++) {
              initBank.push({ id: `bank-1-${i}-${Math.random()}`, val: 1 });
            }
          } else {
            initBank = Array.from({ length: Math.max(15, targetTotal + 2) }, (_, i) => ({ id: `bank-1-${i}-${Math.random()}`, val: 1 }));
          }
        } else {
          initBank = createDynamicWeightBank(targetTotal)
        }
        setBankBlocks(initBank)
        setRightBlocks([])
      }

      timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
    } catch (e) {
      if (e.name === 'AbortError') return
      console.error('Failed to fetch addition question:', e)
    }
    setLoading(false)
  }

  /**
   * startQuiz(): Transition to playing phase
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
    await fetchQuestion(difficulty)
  }

  // Keyboard shortcuts for Standard Mode numeric entry
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!started || finished || additionMode !== 'standard') return
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSubmitOrNext()
        return
      }
      if (revealed || loading) return
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault()
        setAnswer(prev => prev + event.key)
      } else if (event.key === '-') {
        event.preventDefault()
        setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        setAnswer(prev => prev.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, finished, question, answer, revealed, score, questionNumber, difficulty, loading, totalQ, additionMode])

  // Drag and Drop event handlers
  const handleDragStart = (e, item, sourceZone) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, sourceZone }))
    e.currentTarget.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDropCounting = (e, targetZone) => {
    e.preventDefault()
    if (revealed) return
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data.sourceZone === targetZone) return
      const { item, sourceZone } = data

      if (sourceZone === 'source' && targetZone === 'target') {
        setSourceItems(prev => prev.filter(i => i.id !== item.id))
        setTargetItems(prev => [...prev, item])
      } else if (sourceZone === 'target' && targetZone === 'source') {
        setTargetItems(prev => prev.filter(i => i.id !== item.id))
        setSourceItems(prev => [...prev, item])
      }
    } catch (err) { }
  }

  const handleDropScale = (e, targetZone) => {
    e.preventDefault()
    if (revealed) return
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data.sourceZone === targetZone) return
      const { item, sourceZone } = data

      if (sourceZone === 'bank' && targetZone === 'right') {
        setBankBlocks(prev => prev.filter(i => i.id !== item.id))
        setRightBlocks(prev => [...prev, item])
      } else if (sourceZone === 'right' && targetZone === 'bank') {
        setRightBlocks(prev => prev.filter(i => i.id !== item.id))
        setBankBlocks(prev => [...prev, item])
      }
    } catch (err) { }
  }

  const handleSubmitOrNext = async () => {
    if (!question) return

    if (!revealed) {
      let submittedAnswer = ''
      if (additionMode === 'standard') {
        if (answer === '') return
        submittedAnswer = answer
      } else if (additionMode === 'counting') {
        submittedAnswer = String(targetItems.length)
      } else if (additionMode === 'scale') {
        const rightTotal = rightBlocks.reduce((acc, b) => acc + b.val, 0)
        submittedAnswer = String(rightTotal)
      }

      const timeTaken = timer.stop()
      const res = await fetch(`${API}/addition-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: question.a, b: question.b, answer: Number(submittedAnswer) }),
      })
      const data = await res.json()
      setIsCorrect(data.correct)
      const newScore = score + (data.correct ? 1 : 0)
      setScore(newScore)

      const reasoning = `${question.a} + ${question.b} = ${data.correctAnswer}`
      let feedbackText = ''
      if (additionMode === 'standard') {
        feedbackText = data.correct ? `Correct! ${reasoning}` : `Incorrect. ${reasoning}`
      } else if (additionMode === 'counting') {
        feedbackText = data.correct ? `Correct! Great job! ${reasoning}` : `Oops! We counted ${submittedAnswer} apples, but we needed ${data.correctAnswer} (${reasoning}).`
      } else if (additionMode === 'scale') {
        feedbackText = data.correct ? `Correct! Perfect balance! ${reasoning}` : `Oops! Total weight was ${submittedAnswer}, but we needed ${data.correctAnswer} (${reasoning}).`
      }
      setFeedback(feedbackText)

      setResults((prev) => [...prev, {
        question: `${question.a} + ${question.b}`,
        userAnswer: additionMode === 'standard' ? answer : (additionMode === 'counting' ? `${submittedAnswer} apples` : `weight: ${submittedAnswer}`),
        correctAnswer: data.correctAnswer,
        correct: data.correct,
        time: timeTaken,
      }])
      if (isAdaptive) {
        setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
      }
      setRevealed(true)
      return
    }


    if (questionNumber >= totalQ) {
      setFinished(true)
      setQuestion(null)
      timer.reset()
      return
    }

    setQuestionNumber((n) => n + 1)
    await fetchQuestion(difficulty)
  }

  /**
   * handleSolve(): Get the solution without submitting an answer
   */
  const handleSolve = async () => {
    if (revealed) return
    const timeTaken = timer.stop()
    const res = await fetch(`${API}/addition-api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: question.a, b: question.b, answer: '', solve: true }),
    })
    const data = await res.json()
    setIsCorrect(false)
    const reasoning = `${question.a} + ${question.b} = ${data.correctAnswer}`
    setFeedback(`Solution: ${reasoning}`)
    setResults((prev) => [...prev, {
      question: `${question.a} + ${question.b}`,
      userAnswer: '—',
      correctAnswer: data.correctAnswer,
      correct: false,
      time: timeTaken,
    }])

    if (additionMode === 'counting') {
      const totalNeeded = Number(data.correctAnswer)
      const allApples = [...sourceItems, ...targetItems]
      setTargetItems(allApples.slice(0, totalNeeded))
      setSourceItems(allApples.slice(totalNeeded))
    } else if (additionMode === 'scale') {
      let remainder = Number(data.correctAnswer)
      let correctBlocks = []
      let blockId = 0

      const denom = difficulty === 'easy' ? [1] : (difficulty === 'medium' ? [50, 10, 5, 1] : [500, 100, 50, 10, 5, 1])
      for (const d of denom) {
        const count = Math.floor(remainder / d)
        for (let k = 0; k < count; k++) {
          correctBlocks.push({ id: `solve-block-${d}-${blockId++}`, val: d })
        }
        remainder %= d
      }
      setRightBlocks(correctBlocks)
      setBankBlocks([])
    }

    setRevealed(true)
  }

  advanceFnRef.current = handleSubmitOrNext
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  useEffect(() => {
    if (!revealed || isCorrect) return
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitOrNext() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [revealed, isCorrect, questionNumber])

  const diffLabels = { easy: 'Easy — 1 digit', medium: 'Medium — 2 digits', hard: 'Hard — 3 digits', extrahard: 'Extra Hard — 4 digits' }
  const curAdaptLevel = adaptiveLevel(adaptScore)

  if (showComicAddition) {
    return <ComicAdditionApp onBack={() => setShowComicAddition(false)} />
  }

  if (!started && !finished) {
    return (
      <div style={{ minHeight: '100vh', background: '#181512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{
          background: '#2D2520', border: '1.5px solid #4A4038', borderRadius: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%',
          textAlign: 'center', position: 'relative'
        }}>
          <button onClick={onBack} style={{
            position: 'absolute', top: '24px', left: '24px', background: 'transparent',
            border: '1px solid #5B5048', borderRadius: '6px', padding: '6px 14px',
            color: '#A89C93', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
          }}>← Home</button>

          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: '#F4F1ED', margin: '0 0 12px', lineHeight: 1.1 }}>
            Addition
          </h1>
          <p style={{ color: '#988D84', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>Practice addition!</span>
          </p>
          <KeyTerms topicKey="addition" />

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#F4F1ED', fontSize: '0.9rem', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Select Difficulty:
            </h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
              {['easy', 'medium', 'hard', ...(additionMode === 'standard' ? ['extrahard'] : [])].map(d => (
                <button key={d} onClick={() => { setDifficulty(d); setIsAdaptive(false); }} style={{
                  background: (!isAdaptive && difficulty === d) ? '#F08C46' : 'transparent',
                  border: (!isAdaptive && difficulty === d) ? '1px solid #F08C46' : '1px solid #5B5048',
                  borderRadius: '50px', padding: '8px 16px',
                  color: (!isAdaptive && difficulty === d) ? '#FFF' : '#988D84', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}>
                  {diffLabels[d]}
                </button>
              ))}
            </div>
            {additionMode === 'standard' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setIsAdaptive(true)} style={{
                  background: isAdaptive ? '#F08C46' : 'transparent',
                  border: isAdaptive ? '1px solid #F08C46' : '1px solid #5B5048',
                  borderRadius: '50px', padding: '8px 16px',
                  color: isAdaptive ? '#FFF' : '#988D84', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}>
                  Adaptive
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: '#988D84', fontSize: '0.85rem', margin: '0 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              How many questions? (max 100)
            </label>
            <input type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setNumQuestions(v) }} style={{
              background: '#463B34', border: '1px solid #5B5048', borderRadius: '6px',
              padding: '10px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              width: '100px', textAlign: 'center', outline: 'none'
            }} placeholder={String(DEFAULT_TOTAL)} />
          </div>

          <button onClick={startQuiz} style={{
            background: '#F08C46', border: 'none', borderRadius: '6px',
            padding: '10px 24px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            Start Quiz
          </button>

          <button type="button" onClick={() => setShowComicAddition(true)} style={{
            marginTop: '16px', background: 'transparent', border: '1px solid #5B5048', borderRadius: '6px',
            padding: '10px 24px', color: '#C9BFB6', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            Comic Addition — Story Mode
          </button>
        </div>
        {isStage3Completed('addition', completedTopics) && (
          <div className="transfer-cta-box" style={{ marginTop: '20px', padding: '16px', background: 'var(--clr-hover, rgba(255,255,255,0.03))', borderRadius: '10px', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
              {goldMastery.includes('addition') ? (
                <>🥇 You have achieved Gold Mastery for this topic!</>
              ) : (
                <>🎉 You have completed Stage 3 Practice for this topic!</>
              )}
            </p>
            <button
              className="btn-transfer-cta"
              onClick={() => {
                if (setTransferTopic) setTransferTopic('addition')
                if (setMode) setMode('transfer')
              }}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {goldMastery.includes('addition') ? (
                <>🔄 Revisit Transfer Challenge (Stage 4) 🥇</>
              ) : (
                <>🚀 Start Transfer Challenge (Stage 4) 🥇</>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <QuizLayout title="Addition" onBack={onBack} timer={timer}>
      {started && !finished && <>
        {/* Progress Display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
          {isAdaptive && additionMode === 'standard' && <div className="progress-pill" style={{ background: ADAPT_COLORS[curAdaptLevel], color: '#fff' }}>{ADAPT_LABELS[curAdaptLevel]}</div>}
        </div>
        {isAdaptive && additionMode === 'standard' && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />}

        {/* Standard Mode View */}
        {additionMode === 'standard' && question && (
          <>
            <div className="question-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</span>
            </div>
            <input className="answer-input" type="text" value={answer} onChange={(e) => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" />
            {!revealed && <NumPad value={answer} onChange={(v) => !revealed && setAnswer(v)} disabled={revealed} />}
          </>
        )}

        {/* Visual Counting Mode View */}
        {additionMode === 'counting' && question && (
          <div className="dnd-container" style={{ margin: '15px 0' }}>
            <h3 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>
              Put {question.a} + {question.b} apples in the basket!
            </h3>

            <div
              className="dnd-source"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropCounting(e, 'source')}
              style={{ minHeight: '100px', padding: '15px', borderRadius: '10px' }}
            >
              {sourceItems.map(item => (
                <div
                  key={item.id}
                  className="dnd-item"
                  draggable={!revealed}
                  onDragStart={(e) => handleDragStart(e, item, 'source')}
                  onDragEnd={handleDragEnd}
                  style={{ fontSize: '2.2rem', width: '44px', height: '44px' }}
                >
                  {item.icon}
                </div>
              ))}
            </div>

            <div
              className="dnd-target"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropCounting(e, 'target')}
              style={{ minHeight: '120px', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--clr-accent)', marginBottom: '8px' }}>
                🍎 Basket (Total: {targetItems.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {targetItems.map(item => (
                  <div
                    key={item.id}
                    className="dnd-item"
                    draggable={!revealed}
                    onDragStart={(e) => handleDragStart(e, item, 'target')}
                    onDragEnd={handleDragEnd}
                    style={{ fontSize: '2.2rem', width: '44px', height: '44px' }}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Balance Scale Mode View */}
        {additionMode === 'scale' && question && (() => {
          const targetTotal = Number(question.a) + Number(question.b)
          const rTotal = rightBlocks.reduce((acc, b) => acc + b.val, 0)
          const diff = rTotal - targetTotal
          const scaleFactor = difficulty === 'easy' ? 3 : (difficulty === 'medium' ? 0.3 : 0.03)
          let rotation = diff * scaleFactor
          if (rotation > 20) rotation = 20
          if (rotation < -20) rotation = -20
          const panRotation = -rotation

          return (
            <div style={{ margin: '15px 0' }}>


              {/* ── Scale (tall container so blocks never overflow upward) ── */}
              <div className="scale-container" style={{ height: '360px', overflow: 'visible' }}>
                <div className="scale-beam" style={{ transform: `rotate(${rotation}deg)` }}>

                  <div className="scale-pan left" style={{ transform: `rotate(${panRotation}deg)`, height: '140px', width: '140px', overflow: 'visible' }}>
                    <div
                      className="weight-block"
                      style={{
                        background: '#34495e',
                        borderColor: '#2c3e50',
                        width: '56px',
                        height: '56px',
                        cursor: 'default',
                        borderRadius: '10px'
                      }}
                    >
                      {targetTotal}
                    </div>
                  </div>

                  <div
                    className="scale-pan right"
                    style={{
                      transform: `rotate(${panRotation}deg)`,
                      height: '140px',
                      width: rightBlocks.length > 12 ? '170px' : (rightBlocks.length > 8 ? '150px' : '140px'),
                      overflow: 'visible',
                      gap: rightBlocks.length > 12 ? '2px' : '4px',
                      padding: rightBlocks.length > 12 ? '6px' : '12px',
                      paddingBottom: rightBlocks.length > 12 ? '14px' : '20px'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropScale(e, 'right')}
                  >
                    {rightBlocks.map(b => {
                      const blockCount = rightBlocks.length;
                      let size = '32px';
                      if (blockCount > 12) {
                        size = '22px';
                      } else if (blockCount > 8) {
                        size = '26px';
                      }
                      const fontSize = blockCount > 12 ? '0.7rem' : (blockCount > 8 ? '0.8rem' : '0.95rem');
                      return (
                        <div
                          key={b.id}
                          className={`weight-block val-${b.val}`}
                          draggable={!revealed}
                          onDragStart={(e) => handleDragStart(e, b, 'right')}
                          onDragEnd={handleDragEnd}
                          style={{
                            width: size,
                            height: size,
                            fontSize: fontSize,
                            borderRadius: blockCount > 8 ? '4px' : '8px'
                          }}
                        >
                          {b.val}
                        </div>
                      );
                    })}
                  </div>

                </div>
                <div className="scale-fulcrum" style={{ borderBottomWidth: '60px', borderLeftWidth: '35px', borderRightWidth: '35px' }}></div>
              </div>

              <div
                className="weight-bank"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropScale(e, 'bank')}
                style={{ padding: '15px', marginTop: '20px', minHeight: '80px', gap: '8px' }}
              >
                {bankBlocks.map(b => (
                  <div
                    key={b.id}
                    className={`weight-block val-${b.val}`}
                    draggable={!revealed}
                    onDragStart={(e) => handleDragStart(e, b, 'bank')}
                    onDragEnd={handleDragEnd}
                    style={{ width: b.val >= 100 ? '42px' : '32px', height: b.val >= 100 ? '42px' : '32px', fontSize: b.val >= 100 ? '0.85rem' : '0.95rem' }}
                  >
                    {b.val}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '1rem', color: 'var(--clr-text)' }}>
                Right Side Total Weight: <strong>{rTotal}</strong>
              </div>
            </div>
          )
        })()}
        {renderFeedback(feedback, isCorrect)}

        {/* Action Controls */}
        <div className="button-row">
          {!revealed ? (
            <>
              <button
                onClick={handleSubmitOrNext}
                disabled={loading || (additionMode === 'standard' && answer === '') || (additionMode === 'counting' && targetItems.length === 0) || (additionMode === 'scale' && rightBlocks.length === 0)}
              >
                Submit
              </button>
              <button onClick={handleSolve} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
            </>
          ) : (
            <button onClick={handleSubmitOrNext}>{questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question'}</button>
          )}
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}

      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete.</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        {isAdaptive && additionMode === 'standard' && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)' }}>Reached level: <strong style={{ color: ADAPT_COLORS[curAdaptLevel] }}>{ADAPT_LABELS[curAdaptLevel]}</strong></p>}
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ─── Gym puzzle infrastructure (shared by GymArithmetic, GymAlgebra, BasicGym) ─── */

// LaTeX-style stacked fraction used by the Gym puzzles. Inline-friendly: aligns
// with the surrounding text baseline. (A separate `Frac` component exists later in
// the file with a slightly different visual style — kept distinct on purpose.)

export default AdditionApp








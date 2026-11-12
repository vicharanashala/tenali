import React, { useEffect, useRef, useState } from 'react';
import { useAutoAdvance } from '../App';
function AdaptiveMixedApp({ studentName }) {
  // localStorage key for persisting adaptive state
  const storageKey = `tenali-mixed-${studentName}`

  // ── Constants ────────────────────────────────────────────────────────
  const TOTAL_QUESTIONS = 100
  const ADAPT_WINDOW = 8
  const FAST_THRESH_MS = 4000
  const SLOW_THRESH_MS = 8000
  const MAX_LEVEL = 5

  // ── Client-side GCD utility ──────────────────────────────────────────
  const clientGcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b)
    while (b) { [a, b] = [b, a % b] }
    return a
  }

  // ── Phase & Persisted State ──────────────────────────────────────────
  // No setup phase — auto-starts immediately
  const [phase, setPhase] = useState('playing') // 'playing' | 'finished'
  const [diffLevel, setDiffLevel] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey))
      if (saved && saved.diffLevel >= 1 && saved.diffLevel <= MAX_LEVEL) return saved.diffLevel
    } catch { }
    return 1
  })

  // ── Quiz Runtime State ───────────────────────────────────────────────
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [questionNum, setQuestionNum] = useState(0)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [results, setResults] = useState([])
  const [recentWindow, setRecentWindow] = useState([])
  const [statusMsg, setStatusMsg] = useState('')

  const inputRef = useRef(null)
  const advanceFnRef = useRef(null)

  /**
   * save(level): Persist difficulty level to localStorage
   */
  const save = (level) => {
    try { localStorage.setItem(storageKey, JSON.stringify({ diffLevel: level })) } catch { }
  }

  // ── Question Generators ──────────────────────────────────────────────
  // Each returns {type, prompt, correctAnswer, explanation}

  /**
   * genFractionAdd(level): Generate a fraction addition question
   * Level controls denominator range: level 1→2-5, level 5→2-20
   */
  const genFractionAdd = (level) => {
    const maxDen = 3 + level * 3 // 6, 9, 12, 15, 18
    const d1 = Math.floor(Math.random() * (maxDen - 1)) + 2
    let d2 = Math.floor(Math.random() * (maxDen - 1)) + 2
    if (level >= 2) while (d2 === d1) d2 = Math.floor(Math.random() * (maxDen - 1)) + 2
    else d2 = d1 // Easy: same denominator
    const n1 = Math.floor(Math.random() * (d1 - 1)) + 1
    const n2 = Math.floor(Math.random() * (d2 - 1)) + 1
    // Compute correct answer
    const resNum = n1 * d2 + n2 * d1
    const resDen = d1 * d2
    const g = clientGcd(resNum, resDen)
    const ansNum = resNum / g
    const ansDen = resDen / g
    const display = ansDen === 1 ? `${ansNum}` : `${ansNum}/${ansDen}`
    return {
      type: 'fraction-add',
      prompt: `${n1}/${d1} + ${n2}/${d2}`,
      correctAnswer: display,
      explanation: `${n1}/${d1} + ${n2}/${d2} = ${display}`
    }
  }

  /**
   * genFractionMul(level): Generate a fraction multiplication question
   * Level controls denominator range
   */
  const genFractionMul = (level) => {
    const maxDen = 3 + level * 3
    const d1 = Math.floor(Math.random() * (maxDen - 1)) + 2
    const d2 = Math.floor(Math.random() * (maxDen - 1)) + 2
    const n1 = Math.floor(Math.random() * (d1 - 1)) + 1
    const n2 = Math.floor(Math.random() * (d2 - 1)) + 1
    const resNum = n1 * n2
    const resDen = d1 * d2
    const g = clientGcd(resNum, resDen)
    const ansNum = resNum / g
    const ansDen = resDen / g
    const display = ansDen === 1 ? `${ansNum}` : `${ansNum}/${ansDen}`
    return {
      type: 'fraction-mul',
      prompt: `${n1}/${d1} × ${n2}/${d2}`,
      correctAnswer: display,
      explanation: `${n1}/${d1} × ${n2}/${d2} = ${display}`
    }
  }

  /**
   * genMonomialAdd(level): Generate a monomial addition question
   * e.g., 3x² + 5x² = 8x²
   * Level controls coefficient range and exponent range
   */
  const genMonomialAdd = (level) => {
    const maxCoeff = 3 + level * 3 // 6, 9, 12, 15, 18
    const maxExp = Math.min(level + 1, 5) // 2, 3, 4, 5, 5
    const exp = Math.floor(Math.random() * maxExp) + 1
    let a = Math.floor(Math.random() * maxCoeff) + 1
    let b = Math.floor(Math.random() * maxCoeff) + 1
    // At higher levels, sometimes negate a coefficient
    if (level >= 3 && Math.random() < 0.4) a = -a
    if (level >= 3 && Math.random() < 0.4) b = -b
    const sum = a + b
    const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
    const expStr = exp === 1 ? '' : sup(exp)
    const fmtTerm = (c) => {
      if (c === 1) return `x${expStr}`
      if (c === -1) return `-x${expStr}`
      if (c < 0) return `-${Math.abs(c)}x${expStr}`
      return `${c}x${expStr}`
    }
    const prompt = `${fmtTerm(a)} + ${fmtTerm(b)}`
    const ansStr = sum === 0 ? '0' : sum === 1 ? `x${expStr}` : sum === -1 ? `-x${expStr}` : `${sum}x${expStr}`
    return {
      type: 'monomial-add',
      prompt: prompt.replace(/\s+/g, ' ').trim(),
      correctAnswer: ansStr,
      explanation: `${prompt.replace(/\s+/g, ' ').trim()} = ${ansStr}`
    }
  }

  /**
   * genMonomialMul(level): Generate a monomial multiplication question
   * e.g., 3x² × 5x³ = 15x⁵
   * Level controls coefficient range and exponent range
   */
  const genMonomialMul = (level) => {
    const maxCoeff = 2 + level * 2 // 4, 6, 8, 10, 12
    const maxExp = Math.min(level + 1, 5)
    const exp1 = Math.floor(Math.random() * maxExp) + 1
    const exp2 = Math.floor(Math.random() * maxExp) + 1
    let a = Math.floor(Math.random() * maxCoeff) + 1
    let b = Math.floor(Math.random() * maxCoeff) + 1
    if (level >= 3 && Math.random() < 0.3) a = -a
    if (level >= 3 && Math.random() < 0.3) b = -b
    const product = a * b
    const expSum = exp1 + exp2
    const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
    const fmtTerm = (c, e) => {
      const eStr = e === 1 ? '' : sup(e)
      if (c === 1) return `x${eStr}`
      if (c === -1) return `-x${eStr}`
      return `${c}x${eStr}`
    }
    const prompt = `(${fmtTerm(a, exp1)}) × (${fmtTerm(b, exp2)})`
    const ansStr = product === 1 ? `x${sup(expSum)}` : product === -1 ? `-x${sup(expSum)}` : `${product}x${expSum === 1 ? '' : sup(expSum)}`
    return {
      type: 'monomial-mul',
      prompt,
      correctAnswer: ansStr,
      explanation: `${prompt} = ${ansStr}`
    }
  }

  /**
   * genSimpleAdd(level): Generate a simple addition question with +/- numbers
   * Level controls number range: level 1→1-10, level 5→1-100
   */
  const genSimpleAdd = (level) => {
    const maxNum = 5 + level * 15 // 20, 35, 50, 65, 80
    let a = Math.floor(Math.random() * maxNum) + 1
    let b = Math.floor(Math.random() * maxNum) + 1
    // Randomly negate
    if (Math.random() < 0.5) a = -a
    if (Math.random() < 0.5) b = -b
    const sum = a + b
    const prompt = b >= 0 ? `${a} + ${b}` : `${a} + (${b})`
    return {
      type: 'simple-add',
      prompt,
      correctAnswer: String(sum),
      explanation: `${prompt} = ${sum}`
    }
  }

  /**
   * generateQuestion(level): Pick a random topic and generate a question
   */
  const generateRandomQuestion = (level) => {
    const generators = [genFractionAdd, genFractionMul, genMonomialAdd, genMonomialMul, genSimpleAdd]
    const gen = generators[Math.floor(Math.random() * generators.length)]
    return gen(level)
  }

  /**
   * startSession(): Start or restart a session
   * Resets all quiz state and generates first question
   */
  const startSession = () => {
    setPhase('playing')
    setQuestionNum(0)
    setScore(0)
    setResults([])
    setRecentWindow([])
    setStatusMsg(`Level ${diffLevel} — Let's go!`)
    const q = generateRandomQuestion(diffLevel)
    setQuestion(q)
    setAnswer('')
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    setStartTime(Date.now())
    setQuestionNum(1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Auto-start on first mount: generate first question immediately
  useEffect(() => {
    if (phase === 'playing' && !question) {
      const q = generateRandomQuestion(diffLevel)
      setQuestion(q)
      setAnswer('')
      setFeedback('')
      setIsCorrect(null)
      setRevealed(false)
      setStartTime(Date.now())
      setQuestionNum(1)
      setStatusMsg(`Level ${diffLevel} — Let's go!`)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [])

  /**
   * nextQuestion(): Advance to next question or finish
   */
  const nextQuestion = () => {
    if (questionNum >= TOTAL_QUESTIONS) {
      setPhase('finished')
      return
    }
    const q = generateRandomQuestion(diffLevel)
    setQuestion(q)
    setAnswer('')
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    setStartTime(Date.now())
    setQuestionNum(n => n + 1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  advanceFnRef.current = () => nextQuestion()
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  // Enter key after wrong answer
  useEffect(() => {
    if (!revealed || isCorrect) return
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nextQuestion() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [revealed, isCorrect, questionNum])

  /**
   * normalizeAnswer(str): Normalize an answer string for comparison
   * Removes spaces, handles x^ notation, normalizes superscripts
   */
  const normalizeAnswer = (str) => {
    let s = str.trim().replace(/\s+/g, '')
    // Convert x^ notation to superscript: x^2 → x², x^10 → x¹⁰
    s = s.replace(/x\^(\d+)/g, (_, digits) => {
      const sup = digits.split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
      return `x${sup}`
    })
    return s
  }

  /**
   * handleSubmit(e): Check user's answer and adapt difficulty
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (revealed || !question) return
    if (answer.trim() === '') return

    const elapsed = Date.now() - startTime
    // Normalize both answers for comparison
    const userNorm = normalizeAnswer(answer)
    const correctNorm = normalizeAnswer(question.correctAnswer)
    const correct = userNorm === correctNorm

    setIsCorrect(correct)
    setRevealed(true)
    if (correct) setScore(s => s + 1)

    const fb = correct
      ? `Correct! ${question.explanation} (${(elapsed / 1000).toFixed(1)}s)`
      : `Incorrect. ${question.explanation}`
    setFeedback(fb)

    // Topic label for results
    const typeLabels = {
      'fraction-add': 'Frac +',
      'fraction-mul': 'Frac ×',
      'monomial-add': 'Mono +',
      'monomial-mul': 'Mono ×',
      'simple-add': 'Add ±'
    }

    setResults(r => [...r, {
      prompt: `[${typeLabels[question.type] || question.type}] ${question.prompt}`,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      correct,
      time: (elapsed / 1000).toFixed(1)
    }])

    // ── ADAPTIVE DIFFICULTY ────────────────────────────────────────────
    const newWindow = [...recentWindow, { correct, timeMs: elapsed }].slice(-ADAPT_WINDOW)
    setRecentWindow(newWindow)

    if (newWindow.length >= 4) {
      const accuracy = newWindow.filter(r => r.correct).length / newWindow.length
      const avgTime = newWindow.reduce((s, r) => s + r.timeMs, 0) / newWindow.length

      if (accuracy >= 0.9 && avgTime < FAST_THRESH_MS && diffLevel < MAX_LEVEL) {
        // Level up!
        const newLevel = diffLevel + 1
        setDiffLevel(newLevel)
        save(newLevel)
        setStatusMsg(`Level up! Now at Level ${newLevel}`)
      } else if ((accuracy < 0.6 || avgTime > SLOW_THRESH_MS) && diffLevel > 1) {
        // Level down
        const newLevel = diffLevel - 1
        setDiffLevel(newLevel)
        save(newLevel)
        setStatusMsg(`Easing down to Level ${newLevel}. Take your time!`)
      } else {
        setStatusMsg(`Level ${diffLevel} — ${Math.round(accuracy * 100)}% correct, avg ${(avgTime / 1000).toFixed(1)}s`)
      }
    }
  }

  // Keyboard input for global key events (digits, minus, backspace, slash, x, ^)
  useEffect(() => {
    if (phase !== 'playing' || revealed) return
    const handleKey = (e) => {
      // Don't interfere if focused on the input already
      if (e.target === inputRef.current) return
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault(); setAnswer(prev => prev + e.key)
      } else if (e.key === '-') {
        e.preventDefault(); setAnswer(prev => prev + '-')
      } else if (e.key === '/') {
        e.preventDefault(); setAnswer(prev => prev + '/')
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault(); setAnswer(prev => prev + 'x')
      } else if (e.key === '^') {
        e.preventDefault(); setAnswer(prev => prev + '^')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Backspace') {
        e.preventDefault(); setAnswer(prev => prev.slice(0, -1))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, revealed])

  const handleSolve = () => {
    if (!question || revealed) return
    setIsCorrect(false)
    setRevealed(true)
    setFeedback(`Solution: ${question.correctAnswer}`)
  }

  const computeAvgTime = () => {
    if (results.length === 0) return '0.0'
    const total = results.reduce((sum, r) => sum + parseFloat(r.time), 0)
    return (total / results.length).toFixed(1)
  }

  // ══════════ RENDER: FINISHED ══════════
  if (phase === 'finished') {
    return (
      <div className="app-shell">
        <div className="card">
          <h1>{studentName}'s Results</h1>
          <div className="welcome-box">
            <p className="welcome-text">Session complete!</p>
            <p className="final-score">Score: {score}/{TOTAL_QUESTIONS}</p>
            <p style={{ fontSize: '1.1rem', margin: '0.5rem 0', color: 'var(--clr-accent)' }}>
              Average time: {computeAvgTime()}s per question
            </p>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
              Final difficulty: Level {diffLevel} of {MAX_LEVEL}
            </p>
            <div className="results-table" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct</th>
                    <th>Time</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={r.correct ? 'result-correct' : 'result-wrong'}>
                      <td>{i + 1}</td>
                      <td>{r.prompt}</td>
                      <td>{r.userAnswer}</td>
                      <td>{r.correctAnswer}</td>
                      <td>{r.time}s</td>
                      <td>{r.correct ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={startSession} style={{ marginTop: '1rem' }}>Play Again</button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════ RENDER: PLAYING ══════════
  return (
    <div className="app-shell">
      <div className="card">
        <h1>{studentName}'s Practice</h1>
        <div className="top-mini-row">
          <span className="score-pill">Score {score}</span>
          <span className="progress-pill">Q {questionNum}/{TOTAL_QUESTIONS}</span>
          <span className="timer-pill">Level {diffLevel}</span>
        </div>
        {statusMsg && (
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: '4px 0 8px', fontWeight: 500 }}>
            {statusMsg}
          </p>
        )}

        <div className="tables-quiz-area">
          {question && (
            <>
              <div className="question-box" style={{ fontSize: '1.4rem' }}>
                {question.prompt}{question.prompt.trim().endsWith('?') ? '' : ' = ?'}
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', margin: '0.25rem 0' }}>
                {question.type === 'fraction-add' || question.type === 'fraction-mul' ? 'Answer as simplified fraction (e.g., 3/4)' :
                  question.type === 'monomial-add' || question.type === 'monomial-mul' ? 'Answer with x (e.g., 8x^3 or -2x^2)' :
                    'Enter a number'}
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  className="answer-input"
                  type="text"
                  value={answer}
                  onChange={e => { if (!revealed) setAnswer(e.target.value) }}
                  placeholder="Type your answer"
                  disabled={revealed}
                  autoFocus
                />
                {!revealed && (
                  <div className="button-row">
                    <button type="submit" disabled={!answer.trim()}>Check</button>
                  </div>
                )}
              </form>
              {renderFeedback(feedback, isCorrect)}
              {!revealed && (
                <div className="button-row">
                  <button onClick={handleSolve} disabled={!answer.trim()} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
                </div>
              )}
              {revealed && (
                <div className="button-row">
                  <button onClick={() => nextQuestion()}>
                    {questionNum >= TOTAL_QUESTIONS ? 'Finish' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default AdaptiveMixedApp;
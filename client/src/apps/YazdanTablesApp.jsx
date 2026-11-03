import React, { useState, useRef, useEffect } from 'react'
import { useAutoAdvance, renderFeedback } from '../App.jsx'
export default function YazdanTablesApp({ studentName }) {
  const TOTAL_LEVELS = 10
  const FAST_MS = 6000
  const FADE_DURATION = 3000 // ms for answer to fully fade

  const ROUNDS_PER_LEVEL = { 1: 7, 2: 5, 3: 10, 4: 10, 5: 5, 6: 5, 7: 10, 8: 5, 9: 5, 10: 10 }

  // ── State ────────────────────────────────────────────────────────────
  const [appPhase, setAppPhase] = useState('choosing') // choosing | playing | promotion | finished
  const [currentTable, setCurrentTable] = useState(null)
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0) // current round within level (1-based)
  const [score, setScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [results, setResults] = useState([])

  // Round-specific state
  const [cards, setCards] = useState([])        // cards shown (L1,2,6)
  const [question, setQuestion] = useState(null) // current question
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [answerOpacity, setAnswerOpacity] = useState(1)

  // MCQ state (L5, L10)
  const [mcqOptions, setMcqOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  // Match state (L9, L10)
  const [matchPairs, setMatchPairs] = useState([])
  const [matchAnswers, setMatchAnswers] = useState([])
  const [matchSelections, setMatchSelections] = useState({}) // { questionIdx: answerIdx }
  const [activeMatchQ, setActiveMatchQ] = useState(null)
  const [matchRevealed, setMatchRevealed] = useState(false)

  // L10 mixed mode
  const [mixedFormat, setMixedFormat] = useState(null) // 'standard' | 'mcq' | 'fill' | 'match'

  // Promotion
  const [promotionPrompt, setPromotionPrompt] = useState(null)

  // Celebration
  const [showCelebration, setShowCelebration] = useState(false)

  const inputRef = useRef(null)
  const advanceFnRef = useRef(null)
  const celebrationRef = useRef(null)

  // ── Helpers ──────────────────────────────────────────────────────────
  const shuffleArray = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const allMultipliers = () => Array.from({ length: 10 }, (_, i) => i + 1)

  const pickRandom = (arr, n) => shuffleArray(arr).slice(0, n)

  const generateMCQOptions = (tbl, correctAnswer) => {
    const opts = new Set([correctAnswer])
    while (opts.size < 4) {
      // Generate plausible wrong answers: nearby products or common mistakes
      const strategies = [
        () => correctAnswer + Math.floor(Math.random() * 5) + 1,
        () => correctAnswer - Math.floor(Math.random() * 5) - 1,
        () => tbl * (Math.floor(Math.random() * 10) + 1),
        () => correctAnswer + tbl,
        () => correctAnswer - tbl,
      ]
      const val = strategies[Math.floor(Math.random() * strategies.length)]()
      if (val > 0 && val !== correctAnswer) opts.add(val)
    }
    return shuffleArray([...opts])
  }

  // ── Level Setup ─────────────────────────────────────────────────────
  const setupRound = (tbl, lvl, roundNum) => {
    setRevealed(false)
    setFeedback('')
    setIsCorrect(null)
    setAnswer('')
    setSelectedOption(null)
    setStartTime(Date.now())
    setMatchRevealed(false)
    setActiveMatchQ(null)

    if (lvl === 1 || lvl === 2 || lvl === 6) {
      // Card-based levels
      const numCards = lvl === 1 ? 3 : lvl === 2 ? 5 : 10
      const mults = pickRandom(allMultipliers(), numCards)
      const cardSet = mults.map(m => ({ multiplier: m, product: tbl * m }))
      setCards(cardSet)
      const picked = cardSet[Math.floor(Math.random() * cardSet.length)]
      setQuestion({ table: tbl, multiplier: picked.multiplier, answer: picked.product, reverse: false })
    } else if (lvl === 3) {
      // Ordered questions with fading
      const m = roundNum // 1-based, so questions go 1×tbl, 2×tbl...
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m, reverse: false, fading: true })
      setAnswerOpacity(1)
    } else if (lvl === 4) {
      // Shuffled questions with fading
      const m = Math.floor(Math.random() * 10) + 1
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m, reverse: false, fading: true })
      setAnswerOpacity(1)
    } else if (lvl === 5) {
      // MCQ
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      setQuestion({ table: tbl, multiplier: m, answer: product, reverse: false })
      setMcqOptions(generateMCQOptions(tbl, product))
    } else if (lvl === 7) {
      // Reverse questions with fading
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      setQuestion({ table: tbl, multiplier: m, answer: m, product, reverse: true, fading: true })
      setAnswerOpacity(1)
    } else if (lvl === 8) {
      // Fill in the blank
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      // Randomly choose blank position
      const blankType = ['multiplier', 'product'][Math.floor(Math.random() * 2)]
      if (blankType === 'multiplier') {
        setQuestion({ table: tbl, multiplier: m, answer: m, product, blankType: 'multiplier' })
      } else {
        setQuestion({ table: tbl, multiplier: m, answer: product, product, blankType: 'product' })
      }
    } else if (lvl === 9) {
      // Match the following
      const mults = pickRandom(allMultipliers(), 5)
      const pairs = mults.map(m => ({ multiplier: m, product: tbl * m }))
      setMatchPairs(pairs)
      setMatchAnswers(shuffleArray(pairs.map(p => p.product)))
      setMatchSelections({})
      setQuestion(null) // no single question
    } else if (lvl === 10) {
      // Mixed — pick a random format
      const formats = ['standard', 'mcq', 'fill', 'match']
      const fmt = formats[Math.floor(Math.random() * formats.length)]
      setMixedFormat(fmt)
      if (fmt === 'standard') {
        const m = Math.floor(Math.random() * 10) + 1
        setQuestion({ table: tbl, multiplier: m, answer: tbl * m, reverse: false })
      } else if (fmt === 'mcq') {
        const m = Math.floor(Math.random() * 10) + 1
        const product = tbl * m
        setQuestion({ table: tbl, multiplier: m, answer: product, reverse: false })
        setMcqOptions(generateMCQOptions(tbl, product))
      } else if (fmt === 'fill') {
        const m = Math.floor(Math.random() * 10) + 1
        const product = tbl * m
        const blankType = ['multiplier', 'product'][Math.floor(Math.random() * 2)]
        if (blankType === 'multiplier') {
          setQuestion({ table: tbl, multiplier: m, answer: m, product, blankType: 'multiplier' })
        } else {
          setQuestion({ table: tbl, multiplier: m, answer: product, product, blankType: 'product' })
        }
      } else {
        // match
        const mults = pickRandom(allMultipliers(), 5)
        const pairs = mults.map(m => ({ multiplier: m, product: tbl * m }))
        setMatchPairs(pairs)
        setMatchAnswers(shuffleArray(pairs.map(p => p.product)))
        setMatchSelections({})
        setQuestion(null)
      }
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ── Table Selection ─────────────────────────────────────────────────
  const selectTable = (tbl) => {
    setCurrentTable(tbl)
    setAppPhase('playing')
    setLevel(1)
    setRound(1)
    setScore(0)
    setTotalAnswered(0)
    setResults([])
    setShowCelebration(false)
    setPromotionPrompt(null)
    setStatusMsg('Level 1: Find the answer on the cards!')
    setupRound(tbl, 1, 1)
  }

  // ── Fading Effect for L3, L4, L7 ───────────────────────────────────
  useEffect(() => {
    if (!question?.fading || revealed) return
    setAnswerOpacity(1)
    const steps = 20
    const interval = setInterval(() => {
      setAnswerOpacity(prev => {
        const next = prev - (1 / steps)
        if (next <= 0) { clearInterval(interval); return 0 }
        return next
      })
    }, FADE_DURATION / steps)
    return () => clearInterval(interval)
  }, [question, revealed])

  // ── Advance Logic ──────────────────────────────────────────────────
  const advance = () => {
    if (promotionPrompt) return
    const maxRounds = ROUNDS_PER_LEVEL[level]
    if (round >= maxRounds) {
      // Level complete — show promotion
      setPromotionPrompt({ from: level, to: level < TOTAL_LEVELS ? level + 1 : 'mastered' })
      setStatusMsg(level < TOTAL_LEVELS ? 'Ready to level up!' : 'You did it!')
    } else {
      const nextRound = round + 1
      setRound(nextRound)
      setupRound(currentTable, level, nextRound)
    }
  }

  advanceFnRef.current = advance
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  // Enter during promotion = accept
  useEffect(() => {
    if (!promotionPrompt) return
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); acceptPromotion() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [promotionPrompt])

  // Enter after wrong answer = next
  useEffect(() => {
    if (!revealed || isCorrect || promotionPrompt) return
    const isMatchLevel = level === 9 || (level === 10 && mixedFormat === 'match')
    if (isMatchLevel) return
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [revealed, isCorrect, round, promotionPrompt])

  // ── Submit (for typed answers: L3,4,7,8, L10 standard/fill) ────────
  const handleSubmit = (e) => {
    e?.preventDefault()
    if (revealed || !question) return

    const userAns = parseInt(answer, 10)
    const correct = userAns === question.answer
    const elapsed = Date.now() - startTime

    setIsCorrect(correct)
    setRevealed(true)
    if (correct) setScore(s => s + 1)
    setTotalAnswered(t => t + 1)

    const qLabel = question.reverse
      ? `${question.table} × ? = ${question.product}`
      : question.blankType === 'multiplier'
        ? `${question.table} × ___ = ${question.product}`
        : question.blankType === 'product'
          ? `${question.table} × ${question.multiplier} = ___`
          : `${question.table} × ${question.multiplier}`

    setFeedback(correct
      ? `Correct! (${(elapsed / 1000).toFixed(1)}s)`
      : `Answer: ${question.answer}`)

    setResults(r => [...r, { prompt: qLabel, userAnswer: answer || '?', correctAnswer: String(question.answer), correct, time: (elapsed / 1000).toFixed(1) }])
  }

  // ── Submit for card-based levels (L1,2,6) ──────────────────────────
  const handleCardSubmit = (e) => {
    e?.preventDefault()
    if (revealed || !question) return
    const userAns = parseInt(answer, 10)
    const correct = userAns === question.answer
    const elapsed = Date.now() - startTime

    setIsCorrect(correct)
    setRevealed(true)
    if (correct) setScore(s => s + 1)
    setTotalAnswered(t => t + 1)
    setFeedback(correct ? `Correct! (${(elapsed / 1000).toFixed(1)}s)` : `Answer: ${question.answer}`)
    setResults(r => [...r, { prompt: `${question.table} × ${question.multiplier}`, userAnswer: answer || '?', correctAnswer: String(question.answer), correct, time: (elapsed / 1000).toFixed(1) }])
  }

  // ── MCQ Selection (L5, L10 mcq) ────────────────────────────────────
  const handleMCQSelect = (opt) => {
    if (revealed) return
    setSelectedOption(opt)
    const correct = opt === question.answer
    const elapsed = Date.now() - startTime

    setIsCorrect(correct)
    setRevealed(true)
    if (correct) setScore(s => s + 1)
    setTotalAnswered(t => t + 1)
    setFeedback(correct ? `Correct! (${(elapsed / 1000).toFixed(1)}s)` : `Answer: ${question.answer}`)
    setResults(r => [...r, { prompt: `${question.table} × ${question.multiplier}`, userAnswer: String(opt), correctAnswer: String(question.answer), correct, time: (elapsed / 1000).toFixed(1) }])
  }

  // ── Match Selection (L9, L10 match) ─────────────────────────────────
  const handleMatchSelect = (qIdx, aIdx) => {
    if (matchRevealed) return
    setMatchSelections(prev => ({ ...prev, [qIdx]: aIdx }))
  }

  const handleMatchSubmit = () => {
    if (matchRevealed) return
    const elapsed = Date.now() - startTime
    setMatchRevealed(true)
    let correctCount = 0
    matchPairs.forEach((pair, i) => {
      const selectedAnsIdx = matchSelections[i]
      if (selectedAnsIdx !== undefined && matchAnswers[selectedAnsIdx] === pair.product) {
        correctCount++
      }
    })
    const allCorrect = correctCount === matchPairs.length
    setIsCorrect(allCorrect)
    setRevealed(true)
    setScore(s => s + correctCount)
    setTotalAnswered(t => t + matchPairs.length)
    setFeedback(allCorrect ? `All matched! (${(elapsed / 1000).toFixed(1)}s)` : `${correctCount}/${matchPairs.length} correct`)

    matchPairs.forEach((pair, i) => {
      const selectedAnsIdx = matchSelections[i]
      const userAns = selectedAnsIdx !== undefined ? matchAnswers[selectedAnsIdx] : '?'
      setResults(r => [...r, { prompt: `${currentTable} × ${pair.multiplier}`, userAnswer: String(userAns), correctAnswer: String(pair.product), correct: userAns === pair.product, time: (elapsed / 1000).toFixed(1) }])
    })
  }

  // ── Promotion ──────────────────────────────────────────────────────
  const levelDescriptions = {
    1: '3 Cards — Find the answer',
    2: '5 Cards — Scan and find',
    3: 'Ordered — Answer fades away',
    4: 'Shuffled — Answer fades away',
    5: 'Multiple Choice — Pick the right one',
    6: '10 Cards — Full table scan',
    7: 'Reverse — Find the multiplier',
    8: 'Fill in the Blank — No hints',
    9: 'Match the Following — Connect pairs',
    10: 'Mixed Challenge — All formats!'
  }

  const acceptPromotion = () => {
    const promo = promotionPrompt
    setPromotionPrompt(null)
    if (promo.to === 'mastered') {
      setShowCelebration(true)
      setAppPhase('finished')
    } else {
      setLevel(promo.to)
      setRound(1)
      setStatusMsg(`Level ${promo.to}: ${levelDescriptions[promo.to]}`)
      setupRound(currentTable, promo.to, 1)
    }
  }

  const declinePromotion = () => {
    const promo = promotionPrompt
    setPromotionPrompt(null)
    setRound(1)
    setStatusMsg(`Staying at Level ${promo.from}. More practice!`)
    setupRound(currentTable, promo.from, 1)
  }

  // ── Confetti ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!showCelebration || !celebrationRef.current) return
    const canvas = celebrationRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0', '#ff9f43', '#00d2d3']
    const confetti = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width, y: -Math.random() * canvas.height,
      w: Math.random() * 12 + 6, h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2,
      rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10
    }))
    let frame
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let allDone = true
      confetti.forEach(c => {
        c.x += c.vx; c.y += c.vy; c.rot += c.rotSpeed; c.vy += 0.05
        if (c.y < canvas.height + 50) allDone = false
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate((c.rot * Math.PI) / 180)
        ctx.fillStyle = c.color; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore()
      })
      if (!allDone) frame = requestAnimationFrame(animate)
    }
    animate()
    return () => { if (frame) cancelAnimationFrame(frame) }
  }, [showCelebration, appPhase])

  // ── Computed ───────────────────────────────────────────────────────
  const isMatchLevel = level === 9 || (level === 10 && mixedFormat === 'match')
  const isCardLevel = level === 1 || level === 2 || level === 6
  const isMCQLevel = level === 5 || (level === 10 && mixedFormat === 'mcq')
  const isTypedLevel = [3, 4, 7, 8].includes(level) || (level === 10 && ['standard', 'fill'].includes(mixedFormat))
  const maxRounds = ROUNDS_PER_LEVEL[level]

  // ══════════ RENDER: TABLE CHOOSER ══════════
  if (appPhase === 'choosing') {
    return (
      <div className="app-shell">
        <div className="card">
          <h1>{studentName}'s Levels (Tables)</h1>
          <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', margin: '0.5rem 0 1.5rem' }}>
            Pick a table to master:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', maxWidth: '320px', margin: '0 auto' }}>
            {Array.from({ length: 18 }, (_, i) => i + 2).map(n => (
              <button key={n} onClick={() => selectTable(n)}
                style={{ fontSize: '1.5rem', fontWeight: 700, padding: '1rem', borderRadius: '12px', border: '2px solid var(--clr-accent)', background: 'var(--clr-surface)', color: 'var(--clr-accent)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = 'var(--clr-accent)'; e.target.style.color = '#fff' }}
                onMouseLeave={e => { e.target.style.background = 'var(--clr-surface)'; e.target.style.color = 'var(--clr-accent)' }}
              >{n}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ══════════ RENDER: FINISHED ══════════
  if (appPhase === 'finished') {
    return (
      <div className="app-shell">
        {showCelebration && <canvas ref={celebrationRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }} />}
        <div className="card">
          <h1 style={{ fontSize: '2rem' }}>{studentName} MASTERED {currentTable}x!</h1>
          <div className="welcome-box">
            <p style={{ fontSize: '3rem', margin: '0.5rem 0' }}>🏆</p>
            <p className="final-score">Score: {score}/{totalAnswered}</p>
            <div className="results-table" style={{ marginTop: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
              <table><thead><tr><th>#</th><th>Question</th><th>You</th><th>Answer</th><th>Time</th><th></th></tr></thead>
                <tbody>{results.map((r, i) => (
                  <tr key={i} className={r.correct ? 'result-correct' : 'result-wrong'}>
                    <td>{i + 1}</td><td>{r.prompt}</td><td>{r.userAnswer}</td><td>{r.correctAnswer}</td><td>{r.time}s</td><td>{r.correct ? '✓' : '✗'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="button-row" style={{ marginTop: '1rem', gap: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setAppPhase('choosing')}>Pick Another Table</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════ RENDER: PLAYING ══════════
  return (
    <div className="app-shell">
      <div className="card" style={{ padding: '0.75rem', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
            {currentTable}x | R{round}/{maxRounds} | {score} correct
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: level >= 8 ? 'var(--clr-accent)' : 'var(--clr-surface)', color: level >= 8 ? '#fff' : 'var(--clr-text-soft)', border: '1px solid var(--clr-border)' }}>
            Level {level}/{TOTAL_LEVELS}
          </span>
        </div>

        {/* ── Promotion Prompt ── */}
        {promotionPrompt && (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem', margin: '0.5rem 0', borderRadius: '12px', background: 'var(--clr-surface)', border: '2px solid var(--clr-accent)' }}>
            <p style={{ fontSize: '1.5rem', margin: '0 0 0.3rem' }}>{promotionPrompt.to === 'mastered' ? '🏆' : '🎉'}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-text)', margin: '0 0 0.3rem' }}>
              {promotionPrompt.to === 'mastered' ? 'All 10 Levels Complete!' : `Ready for Level ${promotionPrompt.to}?`}
            </p>
            {promotionPrompt.to !== 'mastered' && (
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--clr-accent)', margin: '0 0 0.2rem' }}>
                {levelDescriptions[promotionPrompt.to]}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.8rem' }}>
              <button onClick={acceptPromotion} style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', fontWeight: 700 }}>
                {promotionPrompt.to === 'mastered' ? 'See Results' : 'Level Up!'}
              </button>
              <button onClick={declinePromotion} style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>
                {promotionPrompt.to === 'mastered' ? 'Keep Practicing' : 'Stay Here'}
              </button>
            </div>
          </div>
        )}

        {/* ── Card Levels (L1, L2, L6) ── */}
        {!promotionPrompt && isCardLevel && question && (
          <>
            <div style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, padding: '0.4rem 0', color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
              {question.table} × {question.multiplier} = <span style={{ color: 'var(--clr-accent)' }}>?</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '0.5rem 0' }}>
              {cards.map((c, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderRadius: '10px', background: 'var(--clr-surface)', border: '2px solid var(--clr-border)',
                  fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, textAlign: 'center', minWidth: '90px'
                }}>
                  <div style={{ color: 'var(--clr-text)' }}>{currentTable} × {c.multiplier}</div>
                  <div style={{ color: 'var(--clr-accent)', fontSize: '1.2rem' }}>= {c.product}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleCardSubmit}>
              <input ref={inputRef} className="answer-input" type="text" inputMode="numeric" value={answer}
                onChange={e => { if (/^-?\d*$/.test(e.target.value)) setAnswer(e.target.value) }}
                placeholder="?" disabled={revealed} autoFocus
                style={{ fontSize: '1.5rem', textAlign: 'center', width: '100%', padding: '0.6rem' }} />
              {!revealed && <div className="button-row" style={{ marginTop: '0.4rem' }}><button type="submit" disabled={!answer} style={{ width: '100%', padding: '0.6rem' }}>Check</button></div>}
            </form>
            {renderFeedback(feedback, isCorrect)}
            {revealed && <div className="button-row" style={{ marginTop: '0.3rem' }}><button onClick={advance} style={{ width: '100%', padding: '0.6rem' }}>{round >= maxRounds ? 'Continue' : 'Next'}</button></div>}
          </>
        )}

        {/* ── Fading / Typed Levels (L3, L4, L7, L8, L10 standard/fill) ── */}
        {!promotionPrompt && isTypedLevel && question && (
          <>
            <div style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, padding: '0.4rem 0', color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
              {question.blankType === 'multiplier' && (
                <>{question.table} × <span style={{ color: 'var(--clr-accent)' }}>___</span> = {question.product}</>
              )}
              {question.blankType === 'product' && (
                <>{question.table} × {question.multiplier} = <span style={{ color: 'var(--clr-accent)' }}>___</span></>
              )}
              {!question.blankType && question.reverse && (
                <><span style={{ color: 'var(--clr-accent)' }}>?</span> × {question.table} = {question.product}</>
              )}
              {!question.blankType && !question.reverse && (
                <>{question.table} × {question.multiplier} = <span style={{ color: 'var(--clr-accent)' }}>?</span></>
              )}
            </div>
            {/* Fading answer hint */}
            {question.fading && !revealed && answerOpacity > 0 && (
              <div style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 600, color: `rgba(150,150,150,${answerOpacity})`, transition: 'opacity 0.15s', margin: '-0.2rem 0 0.3rem' }}>
                {question.reverse ? `${question.multiplier} × ${question.table} = ${question.product}` : question.answer}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input ref={inputRef} className="answer-input" type="text" inputMode="numeric" value={answer}
                onChange={e => { if (/^-?\d*$/.test(e.target.value)) setAnswer(e.target.value) }}
                placeholder="?" disabled={revealed} autoFocus
                style={{ fontSize: '1.5rem', textAlign: 'center', width: '100%', padding: '0.6rem' }} />
              {!revealed && <div className="button-row" style={{ marginTop: '0.4rem' }}><button type="submit" disabled={!answer} style={{ width: '100%', padding: '0.6rem' }}>Check</button></div>}
            </form>
            {renderFeedback(feedback, isCorrect)}
            {revealed && <div className="button-row" style={{ marginTop: '0.3rem' }}><button onClick={advance} style={{ width: '100%', padding: '0.6rem' }}>{round >= maxRounds ? 'Continue' : 'Next'}</button></div>}
          </>
        )}

        {/* ── MCQ Level (L5, L10 mcq) ── */}
        {!promotionPrompt && isMCQLevel && question && (
          <>
            <div style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, padding: '0.4rem 0', color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
              {question.table} × {question.multiplier} = <span style={{ color: 'var(--clr-accent)' }}>?</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '0.5rem 0' }}>
              {mcqOptions.map((opt, i) => {
                const isSelected = selectedOption === opt
                const isAnswer = opt === question.answer
                let bg = 'var(--clr-surface)'
                let border = '2px solid var(--clr-border)'
                if (revealed) {
                  if (isAnswer) { bg = '#d4edda'; border = '2px solid #28a745' }
                  else if (isSelected && !isAnswer) { bg = '#f8d7da'; border = '2px solid #dc3545' }
                }
                return (
                  <button key={i} onClick={() => handleMCQSelect(opt)} disabled={revealed}
                    style={{ padding: '0.8rem', fontSize: '1.2rem', fontWeight: 700, borderRadius: '10px', background: bg, border, cursor: revealed ? 'default' : 'pointer', color: 'var(--clr-text)' }}>
                    {opt}
                  </button>
                )
              })}
            </div>
            {renderFeedback(feedback, isCorrect)}
            {revealed && <div className="button-row" style={{ marginTop: '0.3rem' }}><button onClick={advance} style={{ width: '100%', padding: '0.6rem' }}>{round >= maxRounds ? 'Continue' : 'Next'}</button></div>}
          </>
        )}

        {/* ── Match Level (L9, L10 match) ── */}
        {!promotionPrompt && isMatchLevel && matchPairs.length > 0 && (
          <>
            <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 700, padding: '0.3rem 0', color: 'var(--clr-text)' }}>
              Match each question to its answer
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '0.5rem 0' }}>
              {/* Questions column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchPairs.map((pair, qIdx) => {
                  const isActive = activeMatchQ === qIdx
                  const hasSelection = matchSelections[qIdx] !== undefined
                  let bg = 'var(--clr-surface)'
                  let border = isActive ? '2px solid var(--clr-accent)' : '2px solid var(--clr-border)'
                  if (matchRevealed) {
                    const selIdx = matchSelections[qIdx]
                    const correct = selIdx !== undefined && matchAnswers[selIdx] === pair.product
                    bg = correct ? '#d4edda' : '#f8d7da'
                    border = correct ? '2px solid #28a745' : '2px solid #dc3545'
                  }
                  return (
                    <button key={qIdx} onClick={() => !matchRevealed && setActiveMatchQ(qIdx)}
                      style={{ padding: '8px 12px', borderRadius: '8px', background: bg, border, fontSize: '0.95rem', fontWeight: 600, fontFamily: 'monospace', cursor: matchRevealed ? 'default' : 'pointer', opacity: hasSelection && !isActive ? 0.7 : 1 }}>
                      {currentTable} × {pair.multiplier}
                    </button>
                  )
                })}
              </div>
              {/* Answers column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchAnswers.map((ans, aIdx) => {
                  const isUsed = Object.values(matchSelections).includes(aIdx)
                  const isLinked = activeMatchQ !== null && matchSelections[activeMatchQ] === aIdx
                  let bg = isLinked ? 'var(--clr-accent)' : isUsed ? 'rgba(var(--clr-accent-rgb, 200,150,100), 0.15)' : 'var(--clr-surface)'
                  let color = isLinked ? '#fff' : 'var(--clr-text)'
                  if (matchRevealed) {
                    bg = 'var(--clr-surface)'
                    color = 'var(--clr-text)'
                  }
                  return (
                    <button key={aIdx} onClick={() => {
                      if (matchRevealed || activeMatchQ === null) return
                      handleMatchSelect(activeMatchQ, aIdx)
                      // Auto-advance to next unmatched question
                      const nextQ = matchPairs.findIndex((_, i) => i !== activeMatchQ && matchSelections[i] === undefined)
                      setActiveMatchQ(nextQ >= 0 ? nextQ : null)
                    }}
                      style={{ padding: '8px 12px', borderRadius: '8px', background: bg, border: '2px solid var(--clr-border)', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', cursor: matchRevealed ? 'default' : 'pointer', color }}>
                      {ans}
                    </button>
                  )
                })}
              </div>
            </div>
            {!matchRevealed && Object.keys(matchSelections).length === matchPairs.length && (
              <div className="button-row" style={{ marginTop: '0.3rem' }}>
                <button onClick={handleMatchSubmit} style={{ width: '100%', padding: '0.6rem' }}>Check Matches</button>
              </div>
            )}
            {renderFeedback(feedback, isCorrect)}
            {matchRevealed && <div className="button-row" style={{ marginTop: '0.3rem' }}><button onClick={advance} style={{ width: '100%', padding: '0.6rem' }}>{round >= maxRounds ? 'Continue' : 'Next'}</button></div>}
          </>
        )}

        {/* Status */}
        {!promotionPrompt && statusMsg && (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--clr-text-soft)', margin: '0.5rem 0 0', fontWeight: 500 }}>{statusMsg}</p>
        )}

        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <button onClick={() => setAppPhase('choosing')} style={{ background: 'transparent', border: 'none', color: 'var(--clr-text-soft)', fontSize: '0.75rem', padding: '0.3rem', cursor: 'pointer', textDecoration: 'underline' }}>Change table</button>
        </div>
      </div>
    </div>
  )
}
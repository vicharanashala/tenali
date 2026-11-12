import React, { useState, useRef, useEffect } from 'react'
import { useAutoAdvance, renderFeedback } from '../App.jsx'
export default function LakshyaTablesApp({ studentName }) {
  const TOTAL_LEVELS = 10
  const FADE_L1 = 3000
  const FADE_L2 = 2000

  const ROUNDS_PER_LEVEL = { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 10, 9: 10, 10: 10 }

  // ── State ──────────────────────────────────────────────────────
  const [appPhase, setAppPhase] = useState('choosing')
  const [currentTable, setCurrentTable] = useState(null)
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [results, setResults] = useState([])

  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [answerOpacity, setAnswerOpacity] = useState(1)

  // MCQ state (L5)
  const [mcqOptions, setMcqOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  // L6 decoy list
  const [decoyList, setDecoyList] = useState([])

  // L10 shuffled order
  const [jumbledOrder, setJumbledOrder] = useState([])

  // Promotion
  const [promotionPrompt, setPromotionPrompt] = useState(null)

  // Celebration
  const [showCelebration, setShowCelebration] = useState(false)

  const inputRef = useRef(null)
  const advanceFnRef = useRef(null)
  const celebrationRef = useRef(null)

  // ── Helpers ──────────────────────────────────────────────────────
  const shuffleArray = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const allMultipliers = () => Array.from({ length: 10 }, (_, i) => i + 1)

  const generateMCQOptions = (tbl, correctAnswer) => {
    const opts = new Set([correctAnswer])
    while (opts.size < 4) {
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

  // Generate 3 plausible wrong answers for L6 (Invisible Answer)
  const generateDecoys = (tbl, correctAnswer) => {
    const decoys = new Set()
    while (decoys.size < 3) {
      const strategies = [
        () => correctAnswer + Math.floor(Math.random() * 8) + 1,
        () => correctAnswer - Math.floor(Math.random() * 8) - 1,
        () => tbl * (Math.floor(Math.random() * 10) + 1),
        () => correctAnswer + tbl,
        () => correctAnswer - tbl,
        () => correctAnswer + Math.floor(Math.random() * 3) + 1,
      ]
      const val = strategies[Math.floor(Math.random() * strategies.length)]()
      if (val > 0 && val !== correctAnswer) decoys.add(val)
    }
    return shuffleArray([...decoys])
  }

  const pad = (n) => String(n).padStart(3, '\u2007')

  // ── Level Setup ────────────────────────────────────────────────
  const setupRound = (tbl, lvl, roundNum) => {
    setRevealed(false)
    setFeedback('')
    setIsCorrect(null)
    setAnswer('')
    setSelectedOption(null)
    setStartTime(Date.now())
    setAnswerOpacity(1)

    if (lvl === 1) {
      // Straight order with fading (3s)
      const m = roundNum
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m, fading: true, fadeDuration: FADE_L1 })
    } else if (lvl === 2) {
      // Reverse order with fading (2s)
      const m = 11 - roundNum // 10, 9, 8, ... 1
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m, fading: true, fadeDuration: FADE_L2 })
    } else if (lvl === 3) {
      // Full table straight — products shown in order, sequential questions
      const m = roundNum
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m, showProducts: 'straight' })
    } else if (lvl === 4) {
      // Full table reverse — products shown in reverse, reverse questions
      const m = 11 - roundNum
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m, showProducts: 'reverse' })
    } else if (lvl === 5) {
      // MCQ
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      setQuestion({ table: tbl, multiplier: m, answer: product })
      setMcqOptions(generateMCQOptions(tbl, product))
    } else if (lvl === 6) {
      // Invisible Answer — 3 wrong options shown, correct is missing
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      setQuestion({ table: tbl, multiplier: m, answer: product })
      setDecoyList(generateDecoys(tbl, product))
    } else if (lvl === 7) {
      // Straight quiz — no help, sequential
      const m = roundNum
      setQuestion({ table: tbl, multiplier: m, answer: tbl * m })
    } else if (lvl === 8) {
      // Solve for X: table × X = product
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      setQuestion({ table: tbl, multiplier: m, answer: m, product, solveForX: true })
    } else if (lvl === 9) {
      // Commutative switch: if A×B=C, what is B×A?
      const m = Math.floor(Math.random() * 10) + 1
      const product = tbl * m
      setQuestion({ table: tbl, multiplier: m, answer: product, product, commutative: true })
    } else if (lvl === 10) {
      // Jumbled mastery — random, no help
      if (roundNum === 1) {
        setJumbledOrder(shuffleArray(allMultipliers()))
      }
      // Use jumbled order; for subsequent rounds we read from state
      // Since state update is async, compute inline
      const order = roundNum === 1 ? null : jumbledOrder
      if (roundNum === 1) {
        // Will be set by the setJumbledOrder above; use a fresh shuffle
        const fresh = shuffleArray(allMultipliers())
        setJumbledOrder(fresh)
        const m = fresh[0]
        setQuestion({ table: tbl, multiplier: m, answer: tbl * m })
      } else {
        const m = jumbledOrder[roundNum - 1] || (Math.floor(Math.random() * 10) + 1)
        setQuestion({ table: tbl, multiplier: m, answer: tbl * m })
      }
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ── Table Selection ────────────────────────────────────────────
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
    setStatusMsg('Phase 1 — Level 1: Straight Order')
    setupRound(tbl, 1, 1)
  }

  // ── Fading Effect for L1, L2 ──────────────────────────────────
  useEffect(() => {
    if (!question?.fading || revealed) return
    setAnswerOpacity(1)
    const duration = question.fadeDuration || 3000
    const steps = 20
    const interval = setInterval(() => {
      setAnswerOpacity(prev => {
        const next = prev - (1 / steps)
        if (next <= 0) { clearInterval(interval); return 0 }
        return next
      })
    }, duration / steps)
    return () => clearInterval(interval)
  }, [question, revealed])

  // ── Advance Logic ─────────────────────────────────────────────
  const advance = () => {
    if (promotionPrompt) return
    const maxRounds = ROUNDS_PER_LEVEL[level]
    if (round >= maxRounds) {
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
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [revealed, isCorrect, round, promotionPrompt])

  // ── Submit (typed answers) ────────────────────────────────────
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

    let qLabel
    if (question.solveForX) {
      qLabel = `${question.table} × X = ${question.product}`
    } else if (question.commutative) {
      qLabel = `${question.multiplier} × ${question.table}`
    } else {
      qLabel = `${question.table} × ${question.multiplier}`
    }

    setFeedback(correct
      ? `Correct! (${(elapsed / 1000).toFixed(1)}s)`
      : `Answer: ${question.answer}`)

    setResults(r => [...r, { prompt: qLabel, userAnswer: answer || '?', correctAnswer: String(question.answer), correct, time: (elapsed / 1000).toFixed(1) }])
  }

  // ── MCQ Selection (L5) ────────────────────────────────────────
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

  // ── Promotion ─────────────────────────────────────────────────
  const levelDescriptions = {
    1: 'Straight Order — Focus & Speed',
    2: 'Reverse Order — The Memory Fade',
    3: 'Full Table Straight — Products in order',
    4: 'Full Table Reverse — Products reversed',
    5: 'The Match Maker — Pick correct answer',
    6: 'The Invisible Answer — Spot the missing one',
    7: 'Straight Quiz — No help',
    8: 'Solve for X — Find the multiplier',
    9: 'Commutative Switch — Flip and answer',
    10: 'Jumbled Mastery — Random challenge!'
  }

  const phaseForLevel = (lvl) => {
    if (lvl <= 4) return 'Phase 1 — '
    if (lvl <= 6) return 'Phase 2 — '
    return 'Phase 3 — '
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
      setStatusMsg(`${phaseForLevel(promo.to)}Level ${promo.to}: ${levelDescriptions[promo.to]}`)
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

  // ── Confetti ──────────────────────────────────────────────────
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

  // ── Computed ───────────────────────────────────────────────────
  const maxRounds = ROUNDS_PER_LEVEL[level]
  const isMCQ = level === 5

  // ══════════ RENDER: TABLE CHOOSER ══════════
  if (appPhase === 'choosing') {
    return (
      <div className="app-shell">
        <div className="card">
          <h1>{studentName}'s Mastery Multiplication Program</h1>
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
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: level >= 7 ? 'var(--clr-accent)' : 'var(--clr-surface)', color: level >= 7 ? '#fff' : 'var(--clr-text-soft)', border: '1px solid var(--clr-border)' }}>
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

        {/* ── Question Area ── */}
        {!promotionPrompt && question && (
          <>
            {/* Question text */}
            <div style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, padding: '0.4rem 0', color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
              {question.solveForX && (
                <>{question.table} × <span style={{ color: 'var(--clr-accent)' }}>X</span> = {question.product}</>
              )}
              {question.commutative && (
                <>If {question.table} × {question.multiplier} = {question.product}, <br /><span style={{ fontSize: '1.4rem' }}>{question.multiplier} × {question.table} = <span style={{ color: 'var(--clr-accent)' }}>?</span></span></>
              )}
              {!question.solveForX && !question.commutative && (
                <>{question.table} × {question.multiplier} = <span style={{ color: 'var(--clr-accent)' }}>?</span></>
              )}
            </div>

            {/* Fading answer hint for L1, L2 */}
            {question.fading && !revealed && answerOpacity > 0 && (
              <div style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, color: `rgba(150,150,150,${answerOpacity})`, transition: 'opacity 0.15s', margin: '-0.2rem 0 0.3rem' }}>
                {question.answer}
              </div>
            )}

            {/* Products strip for L3 (straight) */}
            {question.showProducts === 'straight' && (
              <div style={{
                margin: '0.4rem 0', padding: '0.5rem 0.8rem', borderRadius: '8px',
                background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)', marginBottom: '4px', fontWeight: 600 }}>
                  Products of {currentTable}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--clr-text)' }}>
                  {allMultipliers().map(m => (
                    <span key={m} style={{
                      padding: '2px 8px', borderRadius: '6px',
                      background: 'var(--clr-bg)', border: '1px solid var(--clr-border)'
                    }}>{currentTable * m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Products strip for L4 (reverse) */}
            {question.showProducts === 'reverse' && (
              <div style={{
                margin: '0.4rem 0', padding: '0.5rem 0.8rem', borderRadius: '8px',
                background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)', marginBottom: '4px', fontWeight: 600 }}>
                  Products of {currentTable} (reversed)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--clr-text)' }}>
                  {[...allMultipliers()].reverse().map(m => (
                    <span key={m} style={{
                      padding: '2px 8px', borderRadius: '6px',
                      background: 'var(--clr-bg)', border: '1px solid var(--clr-border)'
                    }}>{currentTable * m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* L6: Invisible Answer — show 3 decoys */}
            {level === 6 && (
              <div style={{
                margin: '0.4rem 0', padding: '0.5rem 0.8rem', borderRadius: '8px',
                background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)', marginBottom: '4px', fontWeight: 600 }}>
                  The correct answer is NOT in this list:
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--clr-text)' }}>
                  {decoyList.map((d, i) => (
                    <span key={i} style={{
                      padding: '4px 12px', borderRadius: '8px',
                      background: 'var(--clr-bg)', border: '1px solid var(--clr-border)',
                      textDecoration: 'line-through', opacity: 0.7
                    }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* MCQ options for L5 */}
            {isMCQ && (
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
            )}

            {/* Input for typed-answer levels (all except L5 MCQ) */}
            {!isMCQ && (
              <form onSubmit={handleSubmit}>
                <input ref={inputRef} className="answer-input" type="text" inputMode="numeric" value={answer}
                  onChange={e => { if (/^-?\d*$/.test(e.target.value)) setAnswer(e.target.value) }}
                  placeholder={question.solveForX ? 'X = ?' : '?'} disabled={revealed} autoFocus
                  style={{ fontSize: '1.5rem', textAlign: 'center', width: '100%', padding: '0.6rem' }} />
                {!revealed && <div className="button-row" style={{ marginTop: '0.4rem' }}><button type="submit" disabled={!answer} style={{ width: '100%', padding: '0.6rem' }}>Check</button></div>}
              </form>
            )}

            {renderFeedback(feedback, isCorrect)}
            {revealed && <div className="button-row" style={{ marginTop: '0.3rem' }}><button onClick={advance} style={{ width: '100%', padding: '0.6rem' }}>{round >= maxRounds ? 'Continue' : 'Next'}</button></div>}
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
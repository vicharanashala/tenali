import { useCallback, useEffect, useRef, useState } from 'react'
import useAutoAdvance from '../../hooks/useAutoAdvance'
import useTimer from '../../hooks/useTimer'
import FeedbackDisplay from '../common/FeedbackDisplay'
import Confetti from '../modals/Confetti'

const levelInfo = {
    2: { title: 'Half Table', desc: 'Only 5 rows shown — half the table to work with!' },
    3: { title: 'Shuffled Tables', desc: 'Full equations but shuffled randomly each time.' },
    4: { title: 'Reverse Challenge', desc: 'Just the products (13, 26, 39...) shown. You answer: 13 × ? = 39' },
    5: { title: 'No Table!', desc: 'No reference at all — answer from memory!' },
    mastered: { title: 'Table Mastered!', desc: 'You can see your results or keep practicing.' }
}

const shuffleArray = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/**
 * generateNewShuffledRows(mustInclude): Create shuffled multipliers 1-10,
 * guaranteeing mustInclude is in the first 5 if provided
 */
const generateNewShuffledRows = (mustInclude) => {
    const all = shuffleArray(Array.from({ length: 10 }, (_, i) => i + 1))
    if (mustInclude && !all.slice(0, 5).includes(mustInclude)) {
    // Swap mustInclude into the first 5
    const idx = all.indexOf(mustInclude)
    const swapIdx = Math.floor(Math.random() * 5)
        ;[all[swapIdx], all[idx]] = [all[idx], all[swapIdx]]
    }
    return all
}

//ScaffoldedTablesApp
function ScaffoldedTables({ studentName }) {
    // const storageKey = `tenali-scaffold-${studentName}`

    // ── Constants ────────────────────────────────────────────────────────
    const FAST_MS = 5000                 // "Fast" answer threshold (ms)
    const LEVEL_STREAK = 5              // Fast+correct streak to unlock next level
    const MASTERY_STREAK = 10           // Consecutive correct+fast in Level 5 to master table
    const TOTAL_LEVELS = 5

    // ── App State ────────────────────────────────────────────────────────
    // 'choosing' → 'playing' → 'finished'
    const [appPhase, setAppPhase] = useState('choosing')
    const [currentTable, setCurrentTable] = useState(null)

    // Stable celebration emoji — picked once when the "MASTERED" screen
    // mounts so the emoji doesn't flicker between 🎉 / 🏆 / ⭐ / 🌟 / 🎊 on
    // every unrelated re-render (timer ticks, level transitions, etc.).

    const [ random ] = useState(() => Math.random)

    const [masteryEmoji] = useState(
        () => ['🎉', '🏆', '⭐', '🌟', '🎊'][Math.floor(random * 5)]
    )

    // ── Level:
    // 1 = show answer (13×2=26, student types 26)
    // 2 = partial table (5 rows, left or right column only)
    // 3 = shuffled full table (5 rows)
    // 4 = products only (13,26,39...) + reverse Q (13×?=39)
    // 5 = no table at all
    const [level, setLevel] = useState(1)

    // ── Quiz Runtime State ───────────────────────────────────────────────
    const [question, setQuestion] = useState(null)
    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState('')
    const [isCorrect, setIsCorrect] = useState(null)
    const [revealed, setRevealed] = useState(false)
    const [questionNum, setQuestionNum] = useState(0)
    const [score, setScore] = useState(0)
    const timer = useTimer()
    const [results, setResults] = useState([])
    const [fastStreak, setFastStreak] = useState(0)
    const [statusMsg, setStatusMsg] = useState('')
    const [shuffledRows, setShuffledRows] = useState([])
    const [mastered, setMastered] = useState(false)
    // Level 1: answer opacity (dims over time, disappears on typing)
    const [answerOpacity, setAnswerOpacity] = useState(1)
    const [hasTyped, setHasTyped] = useState(false)

    // ── Promotion Prompt State ─────────────────────────────────────────────
    const [promotionPrompt, setPromotionPrompt] = useState(null)

    // ── Celebration State ──────────────────────────────────────────────────
    const [showCelebration, setShowCelebration] = useState(false)

    // ── Timing tracker for spaced repetition ─────────────────────────────
    // { [multiplier]: { totalTime: ms, count: n } }
    const timingRef = useRef({})

    const recordTiming = (multiplier, elapsed) => {
        const t = timingRef.current
        if (!t[multiplier]) t[multiplier] = { totalTime: 0, count: 0 }
        t[multiplier].totalTime += elapsed
        t[multiplier].count += 1
    }

    const getSlowMultipliers = useCallback(
        () => {
            const t = timingRef.current
            const entries = Object.entries(t).filter(([, v]) => v.count > 0)
            if (entries.length < 2) return [] // need enough data
            const totalTime = entries.reduce((s, [, v]) => s + v.totalTime, 0)
            const totalCount = entries.reduce((s, [, v]) => s + v.count, 0)
            const avgTime = totalTime / totalCount
            return entries
            .filter(([, v]) => (v.totalTime / v.count) > avgTime)
            .map(([m]) => parseInt(m, 10))
        },
        []
    )

    // ── Refs ──────────────────────────────────────────────────────────────
    const inputRef = useRef(null)
    const advanceFnRef = useRef(null)
    const celebrationRef = useRef(null)

    /**
     * shuffleArray: Fisher-Yates shuffle
     */
    /**
     * pickMultiplier(): Pick a multiplier, biased toward slow ones
     * 60% chance to pick from slow multipliers (if any), 40% fully random
     */
    const pickMultiplier = useCallback(
        () => {
            const random = Math.random()
            const slow = getSlowMultipliers()
            if (slow.length > 0 && random < 0.6) {
                return slow[Math.floor(random * slow.length)]
            }
            return Math.floor(random * 10) + 1
        },
        [getSlowMultipliers]
    )

    /**
     * generateQuestion(tbl, lvl): Create a question appropriate for the level
     * Level 1,2,3,5: normal → "13 × 3 = ?" answer = 39
     * Level 4: reverse → "13 × ? = 39" answer = 3 (student finds the multiplier)
     * Biased toward multipliers the student is slower on.
     */
    const generateQuestion = useCallback(
        (tbl, lvl) => {
            const multiplier = pickMultiplier()
            const product = tbl * multiplier
            if (lvl === 4) {
                return { table: tbl, multiplier, product, answer: multiplier, reverse: true }
            }
            return { table: tbl, multiplier, product, answer: product, reverse: false }
        },
        [pickMultiplier]
    )

    /**
     * selectTable(tbl): User picks a table from the chooser screen
     */
    const selectTable = (tbl) => {
        setCurrentTable(tbl)
        setAppPhase('playing')
        setLevel(1)
        setQuestionNum(1)
        setScore(0)
        setResults([])
        setFastStreak(0)
        setMastered(false)
        setPromotionPrompt(null)
        setHasTyped(false)
        setAnswerOpacity(1)
        timingRef.current = {} // reset timing history for new table
        setStatusMsg('Level 1: See the answer, then type it!')
        const q = generateQuestion(tbl, 1)
        setQuestion(q)
        setAnswer('')
        setFeedback('')
        setIsCorrect(null)
        setRevealed(false)
        timer.start()
        setShuffledRows(generateNewShuffledRows(q.multiplier))
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    /**
     * nextQuestion(): Advance to the next question
     */
    const nextQuestion = useCallback(
        () => {
            if (mastered) {
            setAppPhase('finished')
            return
            }
            const q = generateQuestion(currentTable, level)
            setQuestion(q)
            setAnswer('')
            setFeedback('')
            setIsCorrect(null)
            setRevealed(false)
            setHasTyped(false)
            setAnswerOpacity(1)
            timer.start()
            setQuestionNum(n => n + 1)
            // Reshuffle for levels that show partial/shuffled tables
            if (level === 2 || level === 3) {
            setShuffledRows(generateNewShuffledRows(q.multiplier))
            }
            setTimeout(() => inputRef.current?.focus(), 50)
        },
        [currentTable, level, mastered, timer, generateQuestion]
    )

    /**
     * Level descriptions for promotion prompts
     */

    const acceptPromotion = useCallback(
        () => {
            const promo = promotionPrompt
            setPromotionPrompt(null)
            if (promo.to === 'mastered') {
            setMastered(true)
            setShowCelebration(true)
            setStatusMsg(`MASTERED! ${MASTERY_STREAK} in a row!`)
            setAppPhase('finished')
            } else {
            setLevel(promo.to)
            setFastStreak(0)
            setHasTyped(false)
            setAnswerOpacity(1)
            const q = generateQuestion(currentTable, promo.to)
            setQuestion(q)
            if (promo.to === 2 || promo.to === 3) setShuffledRows(generateNewShuffledRows(q.multiplier))
            setStatusMsg(`Level ${promo.to}: ${levelInfo[promo.to].title}`)
            setAnswer('')
            setFeedback('')
            setIsCorrect(null)
            setRevealed(false)
            timer.start()
            setQuestionNum(n => n + 1)
            setTimeout(() => inputRef.current?.focus(), 50)
            }
        },
        [currentTable, generateQuestion, timer, promotionPrompt]
    )

    // Level 1: dim the answer gradually over 3 seconds
    useEffect(() => {
        if (level !== 1 || !question || revealed || hasTyped) return
        // setAnswerOpacity(1)
        const interval = setInterval(() => {
            setAnswerOpacity(
                prev => {
                    const next = prev - 0.05
                    if (next <= 0) { clearInterval(interval); return 0 }
                    return next
                }
            )
        }, 150) // 20 steps × 150ms = 3 seconds to fully dim
        return () => clearInterval(interval)
    }, [level, question, revealed, hasTyped])

    // Don't auto-advance when promotion prompt is showing
    useEffect(
        () => {
            if (advanceFnRef.current === null) {
                advanceFnRef.current = nextQuestion
            }
        }
    )
    useAutoAdvance(revealed, advanceFnRef, isCorrect, Boolean(promotionPrompt))


    // Enter key accepts promotion when prompt is showing
    useEffect(() => {
        if (!promotionPrompt) return
        const handleKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); acceptPromotion() }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [promotionPrompt, acceptPromotion])

    useEffect(() => {
        if (!revealed || isCorrect || promotionPrompt) return
        const handleKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); nextQuestion() }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [revealed, isCorrect, questionNum, promotionPrompt, nextQuestion])

    /**
     * handleSubmit(e): Process answer and level progression
     *
     * L1 → L2: After LEVEL_STREAK consecutive fast+correct
     * L2 → L3: After LEVEL_STREAK consecutive fast+correct
     * L3 → L4: After LEVEL_STREAK consecutive fast+correct
     * L4 mastery: After MASTERY_STREAK consecutive fast+correct
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        if (revealed || !question) return

        const userAns = parseInt(answer, 10)
        const correct = userAns === question.answer
        const elapsed = timer.stop()
        const fast = elapsed < FAST_MS

        // Record timing for spaced repetition (track actual multiplier regardless of question type)
        recordTiming(question.multiplier, elapsed)

        setIsCorrect(correct)
        setRevealed(true)
        if (correct) setScore(s => s + 1)

        // Build feedback string
        const qStr = question.reverse
        ? `${question.table} × ${question.answer} = ${question.product}`
        : `${question.table} × ${question.multiplier} = ${question.product}`
        const fb = correct
        ? `Correct! ${qStr} (${(elapsed / 1000).toFixed(1)}s)`
        : `${qStr} (you said ${userAns || '?'})`
        setFeedback(fb)

        const promptStr = question.reverse
        ? `${question.table} × ? = ${question.product}`
        : `${question.table} × ${question.multiplier}`
        setResults(r => [...r, {
        prompt: promptStr,
        userAnswer: answer || '?',
        correctAnswer: String(question.answer),
        correct,
        time: (elapsed / 1000).toFixed(1)
        }])

        // ── LEVEL PROGRESSION LOGIC ──────────────────────────────────────
        if (correct && fast) {
        const newStreak = fastStreak + 1
        setFastStreak(newStreak)

        if (level < 5) {
            if (newStreak >= LEVEL_STREAK) {
            setPromotionPrompt({ from: level, to: level + 1 })
            setStatusMsg('You\'re ready to level up!')
            } else {
            setStatusMsg(`Level ${level}: Streak ${newStreak}/${LEVEL_STREAK}`)
            }
        } else {
            // Level 5
            if (newStreak >= MASTERY_STREAK) {
            setPromotionPrompt({ from: 5, to: 'mastered' })
            setStatusMsg('You\'re ready to level up!')
            } else {
            setStatusMsg(`Level 5: ${newStreak}/${MASTERY_STREAK} to master!`)
            }
        }
        } else {
        setFastStreak(0)
        if (!correct) {
            setStatusMsg(`Not quite — ${level <= 4 ? 'check the reference and have another go!' : 'keep going, you\'ve got this 💪'}`)
        } else {
            // Correct, but didn't beat the fast threshold. Encourage rather than
            // tag the answer as "slow" — point at the next milestone and remind
            // the student that every attempt is making them faster.
            setStatusMsg(`Correct! ${(elapsed / 1000).toFixed(1)}s — you'll soon be under ${FAST_MS / 1000}s, keep going 🚀`)
        }
        }
    }

    const declinePromotion = () => {
        const promo = promotionPrompt
        setPromotionPrompt(null)
        setFastStreak(0)
        setStatusMsg(`Staying at Level ${promo.from}. Keep practicing!`)
        nextQuestion()
    }

    const computeAvgTime = () => {
        if (results.length === 0) return '0.0'
        const totalTime = results.reduce((sum, r) => sum + parseFloat(r.time), 0)
        return (totalTime / results.length).toFixed(1)
    }

    // ══════════ RENDER: TABLE CHOOSER ══════════
    if (appPhase === 'choosing') {
        return (
        <div className="app-shell">
            <div className="card">
            <h1>Tenali's Tables Desk</h1>
            <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', margin: '0.5rem 0 1.5rem' }}>
                Pick a table to practice:
            </p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                maxWidth: '320px',
                margin: '0 auto'
            }}>
                {Array.from({ length: 18 }, (_, i) => i + 2).map(n => (
                <button
                    key={n}
                    onClick={() => selectTable(n)}
                    style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid var(--clr-accent)',
                    background: 'var(--clr-surface)',
                    color: 'var(--clr-accent)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'var(--clr-accent)'; e.target.style.color = '#fff' }}
                    onMouseLeave={e => { e.target.style.background = 'var(--clr-surface)'; e.target.style.color = 'var(--clr-accent)' }}
                >
                    {n}
                </button>
                ))}
            </div>
            </div>
        </div>
        )
    }

    // ══════════ RENDER: FINISHED (MASTERED) ══════════
    if (appPhase === 'finished') {
        const nextTable = currentTable < 19 ? currentTable + 1 : null
        return (
        <div className="app-shell">
            {showCelebration && <Confetti />}
            <div className="card">
            <h1 style={{ fontSize: '2rem' }}>
                {studentName} MASTERED {currentTable}x!
            </h1>
            <div className="welcome-box">
                <p style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                {masteryEmoji}
                </p>
                <p className="welcome-text" style={{ fontSize: '1.3rem', color: 'var(--clr-accent)' }}>
                Fantastic work! You nailed {MASTERY_STREAK} in a row!
                </p>
                <p className="final-score">Score: {score}/{questionNum}</p>
                <p style={{ fontSize: '1.1rem', margin: '0.5rem 0', color: 'var(--clr-accent)' }}>
                Average time: {computeAvgTime()}s per question
                </p>
                {nextTable && (
                <p style={{ fontSize: '1.1rem', margin: '1rem 0 0.5rem', fontWeight: 600 }}>
                    Ready to try the {nextTable}x table next?
                </p>
                )}
                <div className="results-table" style={{ marginTop: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
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
                <div className="button-row" style={{ marginTop: '1rem', gap: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                {nextTable && (
                    <button onClick={() => { setShowCelebration(false); selectTable(nextTable) }}>
                    Start {nextTable}x Table
                    </button>
                )}
                <button
                    onClick={() => { setShowCelebration(false); setAppPhase('choosing') }}
                    style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}
                >
                    Pick Another Table
                </button>
                </div>
            </div>
            </div>
        </div>
        )
    }

    // ══════════ RENDER: PLAYING ══════════
    return (
        <div className="app-shell">
        {showCelebration && (
            <canvas
            ref={celebrationRef}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
            />
        )}
        <div className="card" style={{ padding: '0.75rem', maxWidth: '400px' }}>
            {/* Compact header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                {currentTable}x | Q{questionNum} | {score} correct
            </span>
            <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px',
                background: level === 5 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: level === 5 ? '#fff' : 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)'
            }}>
                Level {level}/{TOTAL_LEVELS}
            </span>
            </div>

            {/* Promotion prompt */}
            {promotionPrompt && (
            <div style={{
                textAlign: 'center', padding: '1.5rem 1rem', margin: '0.5rem 0',
                borderRadius: '12px', background: 'var(--clr-surface)', border: '2px solid var(--clr-accent)'
            }}>
                <p style={{ fontSize: '1.5rem', margin: '0 0 0.3rem' }}>
                {promotionPrompt.to === 'mastered' ? '🏆' : '🎉'}
                </p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-text)', margin: '0 0 0.3rem' }}>
                {promotionPrompt.to === 'mastered'
                    ? `${MASTERY_STREAK} in a row! You mastered it!`
                    : `Ready for Level ${promotionPrompt.to}?`}
                </p>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--clr-accent)', margin: '0 0 0.2rem' }}>
                {levelInfo[promotionPrompt.to]?.title}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: '0 0 1rem' }}>
                {levelInfo[promotionPrompt.to]?.desc}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button onClick={acceptPromotion} style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', fontWeight: 700 }}>
                    {promotionPrompt.to === 'mastered' ? 'See Results' : 'Level Up!'}
                </button>
                <button onClick={declinePromotion} style={{
                    padding: '0.6rem 1.2rem', fontSize: '1rem', background: 'transparent',
                    border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)'
                }}>
                    {promotionPrompt.to === 'mastered' ? 'Keep Practicing' : 'Stay Here'}
                </button>
                </div>
            </div>
            )}

            {/* Question — on top, big */}
            {!promotionPrompt && question && (
            <div style={{
                textAlign: 'center', fontSize: '2rem', fontWeight: 800, padding: '0.5rem 0',
                color: 'var(--clr-text)', fontFamily: 'var(--font-display)'
            }}>
                {level === 1
                ? <>{question.table} × {question.multiplier} = <span style={{ opacity: answerOpacity, transition: 'opacity 0.15s' }}>{question.product}</span></>
                : question.reverse
                    ? <>{question.table} × <span style={{ color: 'var(--clr-accent)' }}>?</span> = {question.product}</>
                    : <>{question.table} × {question.multiplier} = <span style={{ color: 'var(--clr-accent)' }}>?</span></>
                }
            </div>
            )}

            {/* Reference table — varies by level */}
            {!promotionPrompt && level >= 2 && level <= 4 && (() => {
            const pad = (n) => String(n).padStart(String(currentTable * 10).length, '\u2007')

            // Level 4: products only
            if (level === 4) {
                const products = Array.from({ length: 10 }, (_, i) => currentTable * (i + 1))
                return (
                <div style={{
                    margin: '0.4rem 0', padding: '0.5rem 0.8rem', borderRadius: '8px',
                    background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)', marginBottom: '4px', fontWeight: 600 }}>
                    {currentTable}x products
                    </div>
                    <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center',
                    fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--clr-text)'
                    }}>
                    {products.map((p, i) => (
                        <span key={i} style={{
                        padding: '2px 8px', borderRadius: '6px',
                        background: 'var(--clr-bg)', border: '1px solid var(--clr-border)'
                        }}>{p}</span>
                    ))}
                    </div>
                </div>
                )
            }

            // Level 2: half table — 5 complete rows in a single column
            if (level === 2) {
                const rows = shuffledRows.slice(0, 5)
                return (
                <div style={{
                    margin: '0.4rem 0', padding: '0.6rem 0.8rem', borderRadius: '8px',
                    background: 'var(--clr-surface)', border: '1px solid var(--clr-border)'
                }}>
                    <div style={{
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    fontSize: '1.05rem', fontFamily: 'monospace', fontWeight: 600,
                    alignItems: 'center'
                    }}>
                    {rows.map(m => (
                        <div key={m} style={{ display: 'flex', color: 'var(--clr-text)', whiteSpace: 'pre' }}>
                        <span style={{ minWidth: '4.5ch', textAlign: 'right' }}>{currentTable} × {String(m).padStart(2, '\u2007')}</span>
                        <span style={{ color: 'var(--clr-text)', fontWeight: 700, marginLeft: '0.4ch' }}> = {pad(currentTable * m)}</span>
                        </div>
                    ))}
                    </div>
                </div>
                )
            }

            // Level 3: shuffled full table (5 rows, both sides)
            const rows = shuffledRows.slice(0, 5)
            return (
                <div style={{
                margin: '0.4rem 0', padding: '0.6rem 0.8rem', borderRadius: '8px',
                background: 'var(--clr-surface)', border: '1px solid var(--clr-border)'
                }}>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--clr-text-soft)', marginBottom: '4px', fontWeight: 600 }}>shuffled</div>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 1.5rem',
                    fontSize: '1.05rem', fontFamily: 'monospace', fontWeight: 600
                }}>
                    {rows.map(m => (
                    <div key={m} style={{ display: 'flex', color: 'var(--clr-text)', whiteSpace: 'pre' }}>
                        <span style={{ minWidth: '4.5ch', textAlign: 'right' }}>{currentTable} × {String(m).padStart(2, '\u2007')}</span>
                        <span style={{ color: 'var(--clr-text)', fontWeight: 700, marginLeft: '0.4ch' }}> = {pad(currentTable * m)}</span>
                    </div>
                    ))}
                </div>
                </div>
            )
            })()}

            {/* Answer input */}
            {!promotionPrompt && question && (
            <div style={{ marginTop: '0.4rem' }}>
                <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    className="answer-input"
                    type="text"
                    inputMode="numeric"
                    value={answer}
                    onChange={e => {
                    if (/^-?\d*$/.test(e.target.value)) {
                        setAnswer(e.target.value)
                        if (level === 1 && !hasTyped && e.target.value) {
                        setHasTyped(true)
                        setAnswerOpacity(0)
                        }
                    }
                    }}
                    placeholder="?"
                    disabled={revealed}
                    autoFocus
                    style={{ fontSize: '1.5rem', textAlign: 'center', width: '100%', padding: '0.6rem' }}
                />
                {!revealed && (
                    <div className="button-row" style={{ marginTop: '0.4rem' }}>
                    <button type="submit" disabled={!answer} style={{ width: '100%', padding: '0.6rem' }}>Check</button>
                    </div>
                )}
                </form>
                <FeedbackDisplay feedback={feedback} isCorrect={isCorrect} />
                {revealed && !mastered && (
                <div className="button-row" style={{ marginTop: '0.3rem' }}>
                    <button onClick={() => nextQuestion()} style={{ width: '100%', padding: '0.6rem' }}>Next</button>
                </div>
                )}
                {revealed && mastered && (
                <div className="button-row" style={{ marginTop: '0.3rem' }}>
                    <button onClick={() => nextQuestion()} style={{ width: '100%', padding: '0.6rem' }}>See Results</button>
                </div>
                )}
            </div>
            )}

            {/* Status message */}
            {!promotionPrompt && statusMsg && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--clr-text-soft)', margin: '0.5rem 0 0', fontWeight: 500 }}>
                {statusMsg}
            </p>
            )}

            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <button
                onClick={() => setAppPhase('choosing')}
                style={{ background: 'transparent', border: 'none', color: 'var(--clr-text-soft)', fontSize: '0.75rem', padding: '0.3rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
                Change table
            </button>
            </div>
        </div>
        </div>
    )
}

//ScaffoldedTablesApp
export default ScaffoldedTables

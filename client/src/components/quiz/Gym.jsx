//GymApp

import { useCallback, useEffect, useRef, useState } from 'react'
import CONFIG from '../../config'
import useAutoAdvance from '../../hooks/useAutoAdvance'
import useTimer from '../../hooks/useTimer'
import FeedbackDisplay from '../common/FeedbackDisplay'
import GlossaryText from '../common/GlossaryText'
import ResultsTable from '../common/ResultsTable'
import QuizLayout from '../layout/QuizLayout'

const ADAPT_COLORS = { easy: '#4caf50', medium: '#ff9800', hard: '#f44336', extrahard: '#9c27b0' }

const GYM_OPTION_LABEL = { A: '1', B: '2', C: '3', D: '4' }

const GYM_PUZZLE_TYPES = [
    { key: 'gymdecimals', name: 'Decimals', api: 'gymdecimals-api' },
    { key: 'funcgym', name: 'Functions', api: 'funcgym-api' },
    { key: 'dotprodgym', name: 'Dot Products', api: 'dotprodgym-api' },
    { key: 'fracaddgym', name: 'Fractions', api: 'fracaddgym-api' },
    { key: 'lineqgym', name: 'Linear Eq.', api: 'lineqgym-api' },
    { key: 'indicesgym', name: 'Indices', api: 'indicesgym-api' },
    { key: 'polygym', name: 'Polynomials', api: 'polygym-api' },
]

const GYM_STATS_KEY = 'tenali-gym-stats-v1'
// Average time threshold (seconds) above which we start penalising mastery
// for being slow.
const GYM_FAST_AVG_S = 6
// Minimum sample size before mastery becomes meaningful.
const GYM_MIN_SAMPLES = 4
// Number of correct extrahard answers required to mark a skill as "done".
// Once a skill is done it is removed from the question rotation and the UI
// shows a tick mark next to it on the live mastery dashboard.
const GYM_DONE_THRESHOLD = 5
// Routing thresholds for the gym-picker. The router stays on a skill for at
// least GYM_MIN_STREAK questions, holds the student through a "remediation"
// window after a mistake (until they get GYM_REMEDIATION_RUN consecutive
// correct on the same gym), and force-rerolls past GYM_MAX_STREAK so no
// single skill can hijack the whole session.
const GYM_MIN_STREAK = 3
const GYM_MAX_STREAK = 8
const GYM_REMEDIATION_RUN = 2

/**
 * isGymDone(stat) — has the student demonstrated mastery of this skill?
 * True when they've answered GYM_DONE_THRESHOLD or more questions correctly
 * at the `extrahard` band. Done skills are skipped by pickNextGym so the
 * student keeps focusing on the skills they haven't yet conquered.
 */
function isGymDone(stat) {
    return !!(stat && (stat.extrahardCorrect || 0) >= GYM_DONE_THRESHOLD)
}

/** Load the per-gym stats blob from localStorage. */
function loadGymStats() {
    try {
        const raw = localStorage.getItem(GYM_STATS_KEY)
        if (!raw) return {}
        return JSON.parse(raw) || {}
    } catch (e) { console.error(e.stack); return {} }
}

/** Persist updated stats. Silent on storage failure. */
function saveGymStats(stats) {
    try { localStorage.setItem(GYM_STATS_KEY, JSON.stringify(stats)) } catch (e) { console.error(e.stack) }
}


function gymMastery(stat) {
    if (!stat || stat.total < GYM_MIN_SAMPLES) return 0
    const accuracy = stat.correct / stat.total
    const avgTime = stat.totalTime / stat.total
    // Speed factor: 1 if avg ≤ GYM_FAST_AVG_S, decays to 0.4 by 18s.
    const speedFactor = Math.max(0.4, Math.min(1, 1 - (avgTime - GYM_FAST_AVG_S) / 12))
    return Math.max(0, Math.min(1, accuracy * speedFactor))
}

function gymDifficultyFor(mastery) {
    if (mastery < 0.45) return 'easy'
    if (mastery < 0.70) return 'medium'
    if (mastery < 0.88) return 'hard'
    return 'extrahard'
}

function pickNextGym(stats, prevKey, streakLen, lastCorrect, consecCorrect) {
    const candidates = GYM_PUZZLE_TYPES.filter(g => !isGymDone(stats[g.key]))
    if (candidates.length === 0) return null
    const prev = prevKey ? candidates.find(g => g.key === prevKey) : null
    if (prev) {
        // Rule 1 — floor: never switch in the first MIN_STREAK questions.
        if (streakLen < GYM_MIN_STREAK) return prev
        // Rule 2 — remediation lock: a wrong answer (or insufficient recovery)
        // keeps us on the same gym so the student gets another chance.
        if (!lastCorrect || consecCorrect < GYM_REMEDIATION_RUN) return prev
        // Rule 3 — soft release with a linear-ramp probability of switching.
        if (streakLen < GYM_MAX_STREAK) {
        const t = (streakLen - GYM_MIN_STREAK) / (GYM_MAX_STREAK - GYM_MIN_STREAK)
        const pSwitch = 0.5 + 0.35 * t
        if (Math.random() > pSwitch) return prev
        }
        // Past MAX_STREAK we fall through to the weighted re-roll.
    }
    const weights = candidates.map(g => Math.max(0.1, 1 - gymMastery(stats[g.key])))
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < candidates.length; i++) {
        r -= weights[i]
        if (r <= 0) return candidates[i]
    }
    return candidates[candidates.length - 1]
}

function updateGymStat(stats, gymKey, correct, timeSec, difficulty) {
    const cur = stats[gymKey] || { correct: 0, total: 0, totalTime: 0, extrahardCorrect: 0 }
    const isExtraHardWin = correct && difficulty === 'extrahard'
    const next = {
        ...stats,
        [gymKey]: {
        correct: cur.correct + (correct ? 1 : 0),
        total: cur.total + 1,
        totalTime: cur.totalTime + timeSec,
        extrahardCorrect: (cur.extrahardCorrect || 0) + (isExtraHardWin ? 1 : 0),
        },
    }
    saveGymStats(next)
    return next
}

function getSpeedRunLimit(difficulty, isAdaptive) {
    if (isAdaptive) return 10
    const limits = { easy: 5, medium: 10, hard: 15, extrahard: 20 }
    return limits[difficulty] ?? 10
}

function Gym({ onBack }) {
    const [stats, setStats] = useState(() => loadGymStats())
    const [phase, setPhase] = useState('setup')   // 'setup' | 'quiz' | 'finished'
    const [totalQ, setTotalQ] = useState(CONFIG.DEFAULT_TOTAL)
    const [questionNumber, setQuestionNumber] = useState(0)
    const [score, setScore] = useState(0)
    const [results, setResults] = useState([])
    // Per-question state — mirrors makeMCQuizApp but tracks which gym sourced it.
    const [question, setQuestion] = useState(null)
    const [currentGym, setCurrentGym] = useState(null)
    const [currentDifficulty, setCurrentDifficulty] = useState('easy')
    const [selectedOption, setSelectedOption] = useState('')
    const [correctOption, setCorrectOption] = useState('')
    const [feedback, setFeedback] = useState('')
    const [isCorrect, setIsCorrect] = useState(null)
    const [revealed, setRevealed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState('')
    const timer = useTimer()
    // const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('gym', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);
    const sessionGoal = 'standard'
    const isAdaptive = true
    const lastCorrectRef = useRef(null)
    // Number of consecutive correct answers on the current gym. Resets to 0 on
    // any wrong answer or Solve. Drives the "remediation lock" in pickNextGym.
    const consecCorrectRef = useRef(0)
    const handleTimeout = async () => {
        if (revealed) return
        setIsCorrect(false); setRevealed(true)
        setFeedback('⏰ Time\'s up!')
        setResults(prev => [...prev, {
        question: `[${currentGym?.name || ''} · ${currentDifficulty}] ${question?.prompt || ''}`,
        userAnswer: '—', correctAnswer: '', correct: false, time: 0,
        }])
        lastCorrectRef.current = false
        consecCorrectRef.current = 0
    }
    const advanceFnRef = useRef(null)
    const submittedRef = useRef(false)
    const advancedRef = useRef(false)
    // Streak state for the gym-router. Refs (not React state) so loadNext sees
    // the latest values without depending on render timing.
    const streakRef = useRef(0)
    // Manual-override channel for the "Practice" buttons in the live mastery
    // dashboard. The ref drives loadNext (which reads it synchronously); the
    // mirror state drives the UI so the row instantly shows "up next".
    const requestedGymRef = useRef(null)
    const [requestedKey, setRequestedKey] = useState(null)
    const requestSkill = (gym) => {
        if (!gym) return
        requestedGymRef.current = gym
        setRequestedKey(gym.key)
    }

    /**
     * loadNext(): pick a gym (with streak-based stickiness, skipping any
     * skills the student has already finished), fetch a question at that gym's
     * mastery-derived difficulty, and reset per-question state. If every skill
     * is done, ends the workout early.
     */
    const loadNext = async () => {
        setLoading(true); setLoadError('')
        // Manual override takes priority — if the student clicked "Practice" on
        // a row, the next question must come from that gym (even if it's done).
        let gym
        if (requestedGymRef.current) {
        gym = requestedGymRef.current
        requestedGymRef.current = null
        setRequestedKey(null)
        } else {
        gym = pickNextGym(stats, currentGym?.key, streakRef.current,
            lastCorrectRef.current, consecCorrectRef.current)
        }
        if (!gym) {
        // All six skills are done — end the workout regardless of question count.
        setLoading(false)
        setPhase('finished')
        return
        }
        const difficulty = gymDifficultyFor(gymMastery(stats[gym.key]))
        // Update streak: reset to 1 on a switch, increment when staying. A
        // switch also resets the consecutive-correct counter for remediation.
        if (currentGym && gym.key === currentGym.key) {
        streakRef.current += 1
        } else {
        streakRef.current = 1
        consecCorrectRef.current = 0
        }
        setCurrentGym(gym)
        setCurrentDifficulty(difficulty)
        try {
        const r = await fetch(`${CONFIG.api}/${gym.api}/question?difficulty=${difficulty}`)
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        const data = await r.json()
        if (!data || !Array.isArray(data.options) || data.options.length < 2) {
            throw new Error('Question payload missing options array')
        }
        setQuestion(data)
        setSelectedOption(''); setCorrectOption('')
        setFeedback(''); setIsCorrect(null); setRevealed(false)
        submittedRef.current = false; advancedRef.current = false
        timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty, isAdaptive ?? false))
        } catch (e) {
        console.error('Failed to load Gym question:', e)
        setQuestion(null)
        setLoadError(`Couldn't load a question (${e.message || 'unknown error'}). Tap Retry to try again.`)
        }
        setLoading(false)
    }

    const startQuiz = () => {
        // No fixed question count — the workout ends when every skill is done
        // (or when the student backs out). totalQ is kept as a generous safety
        // cap so we don't loop forever in pathological cases.
        setTotalQ(500); setScore(0); setResults([]); setQuestionNumber(1)
        setPhase('quiz')
        submittedRef.current = false; advancedRef.current = false
        // Fresh routing state for the new session.
        streakRef.current = 0
        lastCorrectRef.current = null
        consecCorrectRef.current = 0
        requestedGymRef.current = null
        setRequestedKey(null)
        setCurrentGym(null)
        // Kick off the first question directly instead of reacting to the
        // questionNumber change from an effect (see advance() for the rest).
        loadNext()
    }

    /**
     * advance(): grade is already revealed, so move on. The next question is
     * fetched here, in the event that caused the move, rather than in an
     * effect watching questionNumber — that keeps the setState calls out of
     * the effect body and avoids a cascading render pass.
     */
    const advance = () => {
        if (advancedRef.current) return
        advancedRef.current = true
        if (questionNumber >= totalQ) {
            setPhase('finished')
            return
        }
        setQuestionNumber(n => n + 1)
        loadNext()
    }

    // Keep the ref pointing at the latest advance closure so the auto-advance
    // timer sees current questionNumber / stats instead of the first render's.
    useEffect(() => {
        advanceFnRef.current = advance
    })

    useAutoAdvance(revealed, advanceFnRef, isCorrect, false)

    // Enter advances after a wrong answer (no auto-advance on wrong).
    // Read advance through the ref so this listener doesn't need to be
    // re-created for every new advance closure.
    useEffect(() => {
        if (phase !== 'quiz' || !revealed || isCorrect) return
        const h = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); advanceFnRef.current?.() }
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [phase, revealed, isCorrect])

    const handleSelect = useCallback(
        async (letter) => {
            if (!question || revealed || !currentGym) return
            if (submittedRef.current) return
            submittedRef.current = true
            setSelectedOption(letter)
            const timeTaken = timer.stop()
            try {
            const r = await fetch(`${CONFIG.api}/${currentGym.api}/check`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...question, selectedOption: letter }),
            })
            const data = await r.json()
            setIsCorrect(data.correct); setRevealed(true)
            setCorrectOption(data.correctOption || '')
            if (data.correct) setScore(s => s + 1)
            const correctText = data.correctDisplay || (question.options.find(o => o.option === data.correctOption)?.text) || ''
            setFeedback(data.correct
                ? `Correct! [${currentGym.name}] ${correctText}`
                : `Incorrect. [${currentGym.name}] Answer: ${data.correctOption}. ${correctText}`)
            setResults(prev => [...prev, {
                question: `[${currentGym.name} · ${currentDifficulty}] ${question.prompt}`,
                userAnswer: letter,
                correctAnswer: data.correctOption + (correctText ? `: ${correctText}` : ''),
                correct: data.correct,
                time: timeTaken,
            }])
            // Update mastery for the gym this question came from.
            setStats(prev => updateGymStat(prev, currentGym.key, data.correct, timeTaken, currentDifficulty))
            lastCorrectRef.current = !!data.correct
            // Maintain the consecutive-correct counter that drives remediation:
            // a correct answer extends the run, a wrong answer resets it.
            consecCorrectRef.current = data.correct ? consecCorrectRef.current + 1 : 0
            } catch (e) {
            submittedRef.current = false
            console.error('Failed to check Gym answer:', e)
            }
        }, [timer,currentDifficulty, currentGym, question, revealed]
    )
    // 1-4 / a-d shortcuts to pick options.
    useEffect(() => {
        if (phase !== 'quiz') return
        const onKey = (e) => {
        if (revealed || loading || !question) return
        const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D' }
        const letter = map[e.key.toLowerCase()]
        if (letter && question.options.find(o => o.option === letter)) {
            e.preventDefault()
            handleSelect(letter)
        }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [phase, revealed, loading, question, handleSelect])


    const handleSolve = async () => {
        if (!question || revealed || !currentGym) return
        submittedRef.current = true
        timer.stop()
        try {
        const r = await fetch(`${CONFIG.api}/${currentGym.api}/check`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...question, selectedOption: '', solve: true }),
        })
        const data = await r.json()
        setIsCorrect(false); setRevealed(true)
        setCorrectOption(data.correctOption || '')
        const correctText = data.correctDisplay || (question.options.find(o => o.option === data.correctOption)?.text) || ''
        const explanation = data.explanation || ''
        setFeedback(`Solution [${currentGym.name}]: ${data.correctOption}${correctText ? ': ' + correctText : ''}${explanation ? '\n' + explanation : ''}`)
        setResults(prev => [...prev, {
            question: `[${currentGym.name} · ${currentDifficulty}] ${question.prompt}`,
            userAnswer: '(solved)',
            correctAnswer: data.correctOption + (correctText ? `: ${correctText}` : ''),
            correct: false,
            time: 0,
        }])
        // A "solve" still counts as an attempt, but credited as incorrect for mastery.
        setStats(prev => updateGymStat(prev, currentGym.key, false, 0, currentDifficulty))
        lastCorrectRef.current = false
        // Solve = the student gave up on this question, so remediation
        // restarts from zero (same as a wrong answer).
        consecCorrectRef.current = 0
        } catch (e) {
        submittedRef.current = false
        console.error('Failed to solve Gym question:', e)
        }
    }

    const resetStats = () => {
        saveGymStats({})
        setStats({})
        // Also wipe the in-flight routing state so the next question starts
        // fresh (no leftover streak, remediation lock, or queued skill).
        streakRef.current = 0
        lastCorrectRef.current = null
        consecCorrectRef.current = 0
        requestedGymRef.current = null
        setRequestedKey(null)
    }
    /**
     * confirmReset — guards resetStats() behind a confirm() so a misclick
     * during a session can't accidentally wipe accumulated mastery.
     */
    const confirmReset = () => {
        if (window.confirm('Reset all gym progress? This wipes mastery, streaks, and completed skills on this browser. It cannot be undone.')) {
        resetStats()
        }
    }

    // Helper for the mastery dashboard rows.
    const renderMasteryRow = (g) => {
        const stat = stats[g.key]
        const mastery = gymMastery(stat)
        const diff = gymDifficultyFor(mastery)
        const pct = Math.round(mastery * 100)
        const samples = stat ? stat.total : 0
        const acc = stat && stat.total ? Math.round((stat.correct / stat.total) * 100) : 0
        const avg = stat && stat.total ? (stat.totalTime / stat.total).toFixed(1) : '—'
        const colour = `hsl(${Math.round(mastery * 120)}, 60%, 45%)`
        const done = isGymDone(stat)
        const isCurrent = currentGym && currentGym.key === g.key && phase === 'quiz'
        const isQueued = requestedKey === g.key && !isCurrent && phase === 'quiz'
        // Action cell on the right end. Three mutually-exclusive states keep the
        // column visually consistent at a fixed width:
        //   • ACTIVE  — currently in play (read-only marker)
        //   • UP NEXT — student has queued this skill via the Practice button
        //   • Practice button — clickable, queues this skill as the next question
        // On the setup/finished screens the cell is an empty placeholder of the
        // same width so the rows stay perfectly aligned.
        const ACTION_COL_W = 84
        const renderActionCell = () => {
        if (phase !== 'quiz') {
            return <span style={{ minWidth: ACTION_COL_W, display: 'inline-block' }} />
        }
        if (isCurrent) {
            return (
            <span style={{
                minWidth: ACTION_COL_W, textAlign: 'center', fontSize: '0.7rem',
                fontWeight: 700, letterSpacing: '0.6px', color: 'var(--clr-accent)',
                textTransform: 'uppercase',
            }}>● Active</span>
            )
        }
        if (isQueued) {
            return (
            <span style={{
                minWidth: ACTION_COL_W, textAlign: 'center', fontSize: '0.7rem',
                fontWeight: 700, letterSpacing: '0.6px', color: '#4caf50',
                textTransform: 'uppercase',
            }}>↑ Up next</span>
            )
        }
        return (
            <button
            onClick={() => requestSkill(g)}
            title={`Queue ${g.name} as the next question`}
            style={{
                minWidth: ACTION_COL_W, padding: '4px 10px', fontSize: '0.72rem',
                fontWeight: 500, letterSpacing: '0.3px',
                background: 'transparent', color: 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--clr-accent-soft, rgba(255,165,0,0.10))'
                e.currentTarget.style.color = 'var(--clr-accent)'
                e.currentTarget.style.borderColor = 'var(--clr-accent)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--clr-text-soft)'
                e.currentTarget.style.borderColor = 'var(--clr-border)'
            }}
            >Practice</button>
        )
        }
        return (
        <div key={g.key} style={{
            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', padding: '4px 6px',
            opacity: done && !isCurrent && !isQueued ? 0.85 : 1,
            background: isCurrent
            ? 'var(--clr-accent-soft, rgba(255,165,0,0.08))'
            : isQueued ? 'rgba(76,175,80,0.08)' : 'transparent',
            borderRadius: 4,
            transition: 'background 200ms ease',
        }}>
            <span style={{ minWidth: 18, textAlign: 'center', color: done ? '#4caf50' : 'var(--clr-text-soft)', fontWeight: 700 }}>
            {done ? '✓' : (isCurrent ? '▸' : ' ')}
            </span>
            <span style={{ minWidth: 100, fontWeight: 500, textDecoration: done ? 'line-through' : 'none' }}>{g.name}</span>
            <div style={{ flex: 1, height: 8, background: 'var(--clr-bg-soft, rgba(0,0,0,0.08))', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: done ? '#4caf50' : colour, transition: 'width 250ms ease' }} />
            </div>
            <span style={{ minWidth: 38, textAlign: 'right', color: done ? '#4caf50' : colour, fontWeight: 600 }}>{pct}%</span>
            {done ? (
            <span className="progress-pill" style={{ background: '#4caf50', color: '#fff', fontSize: '0.72rem', padding: '2px 8px' }}>done</span>
            ) : (
            <span className="progress-pill" style={{ background: ADAPT_COLORS[diff], color: '#fff', fontSize: '0.72rem', padding: '2px 8px' }}>{diff}</span>
            )}
            <span style={{ minWidth: 110, color: 'var(--clr-text-soft)', fontSize: '0.78rem' }}>
            {samples ? `${acc}% · ${avg}s · n=${samples}${(stat?.extrahardCorrect || 0) ? ` · X✓ ${stat.extrahardCorrect}/${GYM_DONE_THRESHOLD}` : ''}` : '— new —'}
            </span>
            {renderActionCell()}
        </div>
        )
    }

    return (
        <QuizLayout title="Gym" subtitle="Adaptive cross-gym workout — 7 puzzles, one session" onBack={onBack} timer={phase === 'quiz' ? timer : null}>
        {phase === 'setup' && (
            <div className="welcome-box">
            <p className="welcome-text">Cross-train across all seven gyms</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-dim)', marginBottom: '8px' }}>
                One adaptive session covering Decimals, Functions, Dot Products, Fractions, Linear Equations, Indices and Polynomials.
                Each skill's difficulty rises with your mastery. The router holds a skill for at least {GYM_MIN_STREAK} questions,
                stays on it after a mistake until you get {GYM_REMEDIATION_RUN} consecutive correct (so a stumble means
                another shot, not a switch), and then leans toward switching as the streak grows. Click <strong>Practice</strong>
                on any row to override the router and queue that skill next. A skill is marked done (✓) after {GYM_DONE_THRESHOLD}
                correct extra-hard answers — the workout ends when all seven are done.
            </p>
            <div style={{ margin: '14px 0' }}>{GYM_PUZZLE_TYPES.map(renderMasteryRow)}</div>
            <div className="button-row">
                <button onClick={startQuiz}>Start Workout</button>
                <button
                onClick={confirmReset}
                title="Wipe all locally-saved gym progress on this browser"
                style={{ background: 'transparent', border: '1px solid var(--clr-text-soft)', color: 'var(--clr-text-soft)' }}
                >Reset progress</button>
            </div>
            </div>
        )}

        {phase === 'quiz' && <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <div className="progress-pill center">Question {questionNumber}</div>
            {currentGym && <div className="progress-pill" style={{ background: 'var(--clr-accent)', color: '#fff' }}>{currentGym.name}</div>}
            {currentDifficulty && <div className="progress-pill" style={{ background: ADAPT_COLORS[currentDifficulty], color: '#fff' }}>{currentDifficulty}</div>}
            <div className="progress-pill" style={{ background: '#4caf50', color: '#fff' }}>
                ✓ {GYM_PUZZLE_TYPES.filter(g => isGymDone(stats[g.key])).length}/{GYM_PUZZLE_TYPES.length}
            </div>
            </div>
            {/* Live mastery dashboard — visible throughout the quiz so the student
                can see which skills are still in play and which are done (✓).
                The header carries a Reset progress link so the student can wipe
                local progress at any time without leaving the workout. */}
            <div style={{ margin: '6px 0 14px', padding: '10px 12px', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--clr-border)',
            }}>
                <span style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.8px',
                color: 'var(--clr-text-soft)', textTransform: 'uppercase',
                }}>Skills · saved on this browser</span>
                <button
                onClick={confirmReset}
                title="Wipe all locally-saved gym progress"
                style={{
                    padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600,
                    letterSpacing: '0.4px', textTransform: 'uppercase',
                    background: 'transparent', color: 'var(--clr-text-soft)',
                    border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(244,67,54,0.10)'
                    e.currentTarget.style.color = '#f44336'
                    e.currentTarget.style.borderColor = '#f44336'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--clr-text-soft)'
                    e.currentTarget.style.borderColor = 'var(--clr-border)'
                }}
                >Reset progress</button>
            </div>
            {GYM_PUZZLE_TYPES.map(renderMasteryRow)}
            </div>
            {question && <div style={{ textAlign: 'center' }}>
            <div className="question-prompt" style={{ fontSize: '1.3rem', margin: '8px 0 4px', lineHeight: '1.4' }}><GlossaryText text={question.prompt} /></div>
            <div className="options-grid" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '40px' }}>
                {question.options.map(opt => {
                const isSelected = selectedOption === opt.option
                const isCorrectOpt = revealed && correctOption === opt.option
                const isWrongPick = revealed && isSelected && !isCorrect
                return (
                    <button key={opt.option}
                    className={`option-card ${isSelected ? 'selected' : ''} ${isCorrectOpt ? 'correct-option' : ''} ${isWrongPick ? 'wrong-option' : ''}`}
                    onClick={() => !revealed && handleSelect(opt.option)}
                    disabled={revealed}>
                    <strong>{GYM_OPTION_LABEL[opt.option] || opt.option}.</strong> {opt.text}
                    </button>
                )
                })}
            </div>
            </div>}
            {!question && loading && <div style={{ textAlign: 'center', padding: '24px', color: 'var(--clr-text-soft)' }}>Loading question…</div>}
            {!question && !loading && loadError && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--clr-wrong)', fontSize: '0.95rem' }}>
                <div style={{ marginBottom: '10px' }}>{loadError}</div>
                <button onClick={loadNext}>Retry</button>
            </div>
            )}
            <FeedbackDisplay feedback={feedback} isCorrect={isCorrect} />
            <div className="button-row">
            {!revealed ? (
                <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
            ) : (
                <button onClick={advance}>Next Question</button>
            )}
            </div>
            {results.length > 0 && <ResultsTable results={results} />}
        </>}

        {phase === 'finished' && (
            <div className="welcome-box">
            <p className="welcome-text">Workout complete!</p>
            <p className="final-score">Final score: {score} correct over {results.length} questions</p>
            <div style={{ margin: '14px 0', textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: 6 }}>Updated mastery:</div>
                {GYM_PUZZLE_TYPES.map(renderMasteryRow)}
            </div>
            <ResultsTable results={results} />
            <button onClick={() => setPhase('setup')}>Workout Again</button>
            </div>
        )}
        </QuizLayout>
    )
}

export default Gym

import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config.js'
import { useAutoAdvance, useProgressSubmit } from '../hooks/index.js'
import Feedback from './Feedback.jsx'

function AdaptiveTables({ studentName }) {
  // localStorage key for this student's progress: "tenali-tables-{studentName}"
    const storageKey = `tenali-tables-${studentName}`

    // === QUIZ FLOW STATE ===
    // Phases: 'setup' (choose starting table) → 'playing' (answering questions) → 'finished' (mastered all)
    const [phase, setPhase] = useState('setup')

    // Current multiplication table (2–20). Loaded from localStorage if student has previous progress.
    const [currentTable, setCurrentTable] = useState(() => {
        try {
        const saved = JSON.parse(localStorage.getItem(storageKey))
        if (saved && saved.currentTable >= 2) return saved.currentTable
        } catch { 
            console.warn('Failed to load saved table from localStorage')
        }
        return 2  // Default to 2× table for new students
    })

    // Starting table selected by student in setup phase (used if restarting)
    const [startTable, setStartTable] = useState(currentTable)

    // === QUIZ RUNTIME STATE ===
    // Current question object: {table, multiplier, answer}
    const [question, setQuestion] = useState(null)
    // User's text input (answer they're typing)
    const [answer, setAnswer] = useState('')
    // Feedback message shown after submission ("Correct! 3 × 4 = 12" or show correct answer)
    const [feedback, setFeedback] = useState('')
    // Boolean: is the current answer correct? (null until revealed)
    const [isCorrect, setIsCorrect] = useState(null)
    // Boolean: has the answer been revealed? (locks input, shows feedback)
    const [revealed, setRevealed] = useState(false)
    // Question counter (1, 2, 3, ...)
    const [questionNum, setQuestionNum] = useState(0)
    // Score: number of correct answers in this session
    const [score, setScore] = useState(0)
    // Timestamp when current question was generated (used to calc response time)
    const [startTime, setStartTime] = useState(null)

    // Array of results for display in results table: [{q, yourAnswer, correct, isCorrect, time, table}, ...]
    const [_, setResults] = useState([])

    // === ADAPTIVE ALGORITHM STATE ===
    // Rolling window of recent answers: [{correct: bool, timeMs: number}, ...] (max length WINDOW)
    const [recentWindow, setRecentWindow] = useState([])
    // Boolean: should the reference table (2×1, 2×2, ..., 2×10) be shown?
    const [showTable, setShowTable] = useState(true)
    // Counter: how many consecutive "mastered without table" answers? When ≥ ADVANCE_COUNT, advance.
    const [masteredWithout, setMasteredWithout] = useState(0)
    // Status message shown below header: "Learning — table shown", "Mastered! (3/5 to advance)", etc.
    const [statusMsg, setStatusMsg] = useState('')

    // Ref to the answer input field (for focus management)
    const inputRef = useRef(null)
    // Ref to the "advance to next question" function (used by useAutoAdvance)
    const advanceFnRef = useRef(null)

    /**
     * save(tbl): Persist current table progress to localStorage
     * Allows student to resume from same table if page is reloaded
     */
    const save = (tbl) => {
        try { localStorage.setItem(storageKey, JSON.stringify({ currentTable: tbl })) } catch { console.warn('Failed to save table to localStorage') }
    }

    /**
     * generateQuestion(tbl): Create a new multiplication question
     * Generates random multiplier (1-10), returns {table, multiplier, answer}
     */
    const generateQuestion = useCallback(
        (tbl) => {
            const multiplier = Math.floor(Math.random() * 10) + 1
            return { table: tbl, multiplier, answer: tbl * multiplier }
        }, []
    )

    /**
     * beginPractice(): Transition from setup → playing phase
     * Initializes all quiz state and generates first question
     * Sets phase to 'playing' with chosen startTable and resets adaptive state
     */
    const beginPractice = () => {
        const tbl = startTable
        setCurrentTable(tbl)
        save(tbl)  // Persist choice to localStorage
        setPhase('playing')  // Move to playing phase
        // Reset all quiz counters and state
        setQuestionNum(0)
        setScore(0)
        // setResults([])
        setRecentWindow([])  // Clear adaptive window
        setShowTable(true)   // Start by showing the reference table
        setMasteredWithout(0)  // Reset advancement counter
        setStatusMsg('Learning — table shown')
        // Generate and display first question
        const q = generateQuestion(tbl)
        setQuestion(q)
        setAnswer('')
        setFeedback('')
        setIsCorrect(null)
        setRevealed(false)
        setStartTime(Date.now())
        setQuestionNum(1)  // First question
        setTimeout(() => inputRef.current?.focus(), 50)  // Focus input field
    }

    /**
     * nextQuestion(tbl?): Advance to the next question
     * Generates new question for table (or currentTable if not specified)
     * Clears previous feedback and resets input state
     */
    const nextQuestion = useCallback(
        (tbl) => {
            const table = tbl || currentTable
            const q = generateQuestion(table)
            setQuestion(q)
            setAnswer('')
            setFeedback('')
            setIsCorrect(null)
            setRevealed(false)
            setStartTime(Date.now())
            setQuestionNum(n => n + 1)
            setTimeout(() => inputRef.current?.focus(), 50)
        }, [currentTable, generateQuestion]
    )


    // Update the advance function ref after render so useAutoAdvance can call it
    useEffect(() => {
        advanceFnRef.current = nextQuestion
    }, [nextQuestion])

    // Auto-advance after correct answer (after AUTO_ADVANCE_MS delay)
    useAutoAdvance(revealed, advanceFnRef, isCorrect)
    useProgressSubmit(revealed, isCorrect, 'addition', question?.id)
    useProgressSubmit(revealed, isCorrect, 'balance-scale', question?.id)

    // Keyboard shortcut: Enter key advances to next question after wrong answer
    // (Auto-advance via useAutoAdvance handles correct answers)
    useEffect(() => {
        if (!revealed || isCorrect) return  // Only listen when wrong answer is revealed
        const handleKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); nextQuestion() }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [revealed, isCorrect, currentTable, nextQuestion])

    /**
     * evaluate(window): Analyze rolling window to determine student's mastery level
     *
     * Window must have ≥3 answers to be meaningful; otherwise return default "learning"
     *
     * Calculates:
     *   - accuracy: (correct answers / total answers in window)
     *   - avgTime: average response time in milliseconds
     *
     * Returns classification object: {level, avgTime, accuracy}
     *   level: "mastered" | "comfortable" | "learning"
     *
     * Thresholds:
     *   - "mastered": avgTime < 3000ms AND accuracy ≥ 90%
     *   - "comfortable": avgTime < 6000ms AND accuracy ≥ 70%
     *   - "learning": anything else (student needs the table or more practice)
     */
    const evaluate = (window) => {
        // Not enough data yet; assume learning
        if (window.length < 3) return { level: 'learning', avgTime: Infinity, accuracy: 0 }

        // Calculate accuracy: what % of recent answers were correct?
        const accuracy = window.filter(r => r.correct).length / window.length

        // Calculate average response time in ms
        const avgTime = window.reduce((s, r) => s + r.timeMs, 0) / window.length

        // Determine mastery level based on speed and accuracy thresholds
        if (avgTime < CONFIG.FAST_THRESH && accuracy >= 0.9) return { level: 'mastered', avgTime, accuracy }
        if (avgTime < CONFIG.MEDIUM_THRESH && accuracy >= 0.7) return { level: 'comfortable', avgTime, accuracy }
        return { level: 'learning', avgTime, accuracy }
    }

    /**
     * handleSubmit(e): Process user's answer submission
     * This is the CORE ADAPTATION LOGIC where all decisions are made
     *
     * Flow:
     * 1. Validate answer (must be numeric)
     * 2. Score the answer (correct/incorrect)
     * 3. Add to rolling window
     * 4. Evaluate rolling window to determine new mastery level
     * 5. Adapt (show/hide table, advance tables, update status)
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        if (revealed || !question) return

        // Parse user's answer and compare to correct answer
        const userAns = parseInt(answer, 10)
        const correct = userAns === question.answer
        const elapsed = Date.now() - startTime  // Time taken for this question

        // Reveal the correctness
        setIsCorrect(correct)
        setRevealed(true)
        if (correct) setScore(s => s + 1)

        // Generate feedback message with an encouraging speed cue.
        // Old labels ("ok" / "slow") were too negative — students learning their
        // tables for the first time felt scolded. Replace with affirmative cues
        // that point toward the next milestone (under 5s, under 3s) and tell the
        // student to keep going.
        const speedCue = elapsed < CONFIG.FAST_THRESH
        ? 'lightning fast 🚀'
        : elapsed < CONFIG.MEDIUM_THRESH
            ? "almost there — you'll be under 3s soon!"
            : "you'll soon be under 5s, keep going!"
        const fb = correct
        ? `Correct! ${question.table} × ${question.multiplier} = ${question.answer} (${(elapsed / 1000).toFixed(1)}s — ${speedCue})`
        : `${question.table} × ${question.multiplier} = ${question.answer} (you said ${userAns || '?'})`
        setFeedback(fb)

        // Record result for later display in results table
        setResults(r => [...r, {
        q: `${question.table} × ${question.multiplier}`,
        yourAnswer: answer || '?',
        correct: question.answer,
        isCorrect: correct,
        time: (elapsed / 1000).toFixed(1),
        table: question.table
        }])

        // === ADAPTATION: UPDATE ROLLING WINDOW ===
        // Keep only the last WINDOW answers; discard older ones
        const newWindow = [...recentWindow, { correct, timeMs: elapsed }].slice(-CONFIG.WINDOW)
        setRecentWindow(newWindow)

        // === ADAPTATION: EVALUATE PERFORMANCE ===
        // Analyze the rolling window to determine mastery level
        const { level, avgTime, accuracy } = evaluate(newWindow)

        // === ADAPTATION: DECISION TREE ===
        // Different actions based on current level and whether table is shown

        if (level === 'mastered' && !showTable) {
        // CASE: Student is fast & accurate WITHOUT the table
        // Action: Count this toward advancement threshold
        const newCount = masteredWithout + 1
        setMasteredWithout(newCount)

        if (newCount >= CONFIG.ADVANCE_COUNT) {
            // THRESHOLD REACHED: Student is ready for next table!
            const nextTbl = currentTable + 1
            if (nextTbl <= 20) {
            // Advance to next table (2→3, 3→4, ..., 19→20)
            setCurrentTable(nextTbl)
            save(nextTbl)  // Persist to localStorage
            setRecentWindow([])  // Clear window for fresh evaluation on new table
            setShowTable(true)   // Show table for new level (student learns it first)
            setMasteredWithout(0)  // Reset counter
            setStatusMsg(`Great! Moving to ${nextTbl}× table`)
            // Proceed to next question with new table
            setTimeout(() => nextQuestion(nextTbl), CONFIG.AUTO_ADVANCE_MS)
            return  // Skip normal auto-advance; we're explicitly calling nextQuestion
            } else {
            // nextTbl > 20: Student has finished all tables!
            setPhase('finished')
            return
            }
        }
        // Not yet at threshold; show progress toward advancement
        setStatusMsg(`Mastered! (${newCount}/${CONFIG.ADVANCE_COUNT} to advance) — avg ${(avgTime / 1000).toFixed(1)}s`)

        } else if (level === 'mastered' && showTable) {
        // CASE: Student is fast & accurate WITH the table
        // Action: Hide the table (student doesn't need it) and challenge them to prove it without
        setShowTable(false)
        setMasteredWithout(0)  // Reset counter; next answered without table will start count-up
        setStatusMsg(`Fast & accurate — table hidden! Prove it without help.`)

        } else if (level === 'comfortable') {
        // CASE: Student is doing okay (70-90% accuracy, 3-6s avg time)
        // Action: Hide table to encourage independence, but don't push too hard yet
        if (showTable) {
            setShowTable(false)
            setStatusMsg(`Getting comfortable — table hidden. Avg ${(avgTime / 1000).toFixed(1)}s`)
        } else {
            // Table already hidden; just update status
            setStatusMsg(`Comfortable — avg ${(avgTime / 1000).toFixed(1)}s, ${Math.round(accuracy * 100)}% correct`)
        }
        setMasteredWithout(0)  // Reset advancement counter (not ready yet)

        } else {
        // CASE: Student is still building speed (< 70% accuracy or > 6s avg time).
        // Action: Make sure the table is on screen so they can lean on it; reset
        // the advancement counter. Phrasing is intentionally encouraging — early
        // learners shouldn't be told they're "slow" or "need practice".
        if (!showTable) {
            setShowTable(true)
            setStatusMsg(`No worries — bringing the table back to help. You've got this!`)
        } else {
            setStatusMsg(`Keep going — every try is making you faster 💪`)
        }
        setMasteredWithout(0)  // Reset; student's not ready to advance
        }
    }

    const handleSolve = () => {
        if (!question || revealed) return
        setIsCorrect(false)
        setRevealed(true)
        setFeedback(`Solution: ${question.table} × ${question.multiplier} = ${question.answer}`)
    }

    /**
     * renderTable(): Render the visual reference multiplication table
     * Shows all 10 multiples (e.g., "2 × 1 = 2", "2 × 2 = 4", ..., "2 × 10 = 20")
     * Only rendered when showTable === true
     */
    const renderTable = () => (
        <div className="ref-table">
        <div className="ref-table-title">{currentTable} × Table</div>
        <div className="ref-table-rows">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(m => (
            <div key={m} className="ref-table-row">
                <span>{currentTable} × {m}</span>
                <span>= {currentTable * m}</span>
            </div>
            ))}
        </div>
        </div>
    )

    // ========== RENDER: SETUP PHASE ==========
    // Allow student to choose which table to start from (2–20)
    if (phase === 'setup') {
        return (
        <div className="app-shell">
            <div className="card">
            <h1>{studentName}'s Tables</h1>
            <div className="welcome-box">
                <p className="welcome-text">Which table would you like to start from?</p>
                <div className="checkbox-group" style={{ marginBottom: '24px' }}>
                {Array.from({ length: 19 }, (_, i) => i + 2).map(n => (
                    <label key={n} className={`checkbox-pill${startTable === n ? ' active' : ''}`}>
                    <input type="radio" name="startTable" checked={startTable === n}
                        onChange={() => setStartTable(n)} />
                    {n}×
                    </label>
                ))}
                </div>
                <button onClick={beginPractice}>Start Practice</button>
            </div>
            </div>
        </div>
        )
    }

    // ========== RENDER: FINISHED PHASE ==========
    // Student has mastered all tables up to 20×
    if (phase === 'finished') {
        return (
        <div className="app-shell">
            <div className="card">
            <h1>Congratulations, {studentName}!</h1>
            <div className="welcome-box">
                <p className="welcome-text">You've mastered all tables up to 20×!</p>
                <div className="final-score">{score} correct out of {questionNum}</div>
                <button onClick={() => setPhase('setup')}>Start Over</button>
            </div>
            </div>
        </div>
        )
    }

    // ========== RENDER: PLAYING PHASE ==========
    // Main quiz interface: show current table (if applicable), question, input, and reference table (if applicable)
    return (
        <div className="app-shell">
        <div className="card">
            <div className="header-row">
            <button className="back-button" onClick={() => setPhase('setup')}>← Change Table</button>
            </div>
            <h1>{studentName}'s Tables</h1>
            <div className="top-mini-row">
            <span className="score-pill">Score {score}</span>
            <span className="progress-pill">Q {questionNum}</span>
            <span className="timer-pill">{currentTable}× table</span>
            </div>
            {statusMsg && (
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: '4px 0 8px', fontWeight: 500 }}>
                {statusMsg}
            </p>
            )}

            <div className={showTable ? 'tables-layout' : ''}>
            {showTable && renderTable()}
            <div className="tables-quiz-area">
                {question && (
                <>
                    <div className="question-box">
                    {question.table} × {question.multiplier} = ?
                    </div>
                    <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        className="answer-input"
                        type="text"
                        inputMode="numeric"
                        value={answer}
                        onChange={e => { if (/^-?\d*$/.test(e.target.value)) setAnswer(e.target.value) }}
                        placeholder="?"
                        disabled={revealed}
                        autoFocus
                    />
                    {!revealed && (
                        <div className="button-row">
                        <button type="submit" disabled={!answer}>Check</button>
                        </div>
                    )}
                    </form>
                    <Feedback feedback={feedback} isCorrect={isCorrect} />
                    {!revealed && (
                    <div className="button-row">
                        <button onClick={handleSolve} disabled={!answer} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
                    </div>
                    )}
                    {revealed && (
                    <div className="button-row">
                        <button onClick={() => nextQuestion()}>Next</button>
                    </div>
                    )}
                </>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}

export default AdaptiveTables

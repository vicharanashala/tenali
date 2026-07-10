/**
 * @fileoverview Tenali - Educational Quiz Platform (React Frontend)
 *
 * This monolithic React application serves as the main frontend for Tenali, an adaptive
 * learning system with multiple quiz types. It includes:
 *
 * - Shared utility hooks: useTimer (elapsed time tracking), useAutoAdvance (auto-progression)
 * - Shared components: NumPad (numeric input), ResultsTable (quiz results display), QuizLayout (wrapper)
 * - Adaptive multiplication tables app: AdaptiveTablesApp with rolling-window algorithm
 * - Multiple quiz apps: GKApp, AdditionApp, BasicArithApp, QuadraticApp, MultiplyApp, VocabApp,
 *   and many more (SqrtApp, PolyMulApp, PolyFactorApp, PrimeFactorApp, QFormulaApp, SimulApp,
 *   FuncEvalApp, LineEqApp, CustomApp, TwinHuntApp, IntervalSchedulingApp, ExtendedEuclidApp)
 * - Home component with search and menu cards for app discovery
 * - App shell with theme toggle (dark/light), localStorage persistence
 * - URL-based routing system for student pages and different quizzes
 *
 * The app uses a state-machine pattern: most quiz apps cycle through setup → playing → finished phases.
 * Each quiz component manages its own state and communicates with backend APIs.
 *
 * Theme persistence: Dark/light mode preference stored in localStorage[tenali-theme]
 * Progress persistence: Adaptive tables app saves current table progress in localStorage
 */

import { useEffect, useState, useRef } from 'react'
import './App.css'

// API base URL from environment variables (Vite)
const API = import.meta.env.VITE_API_BASE_URL || '';

// Default number of questions for quizzes
const DEFAULT_TOTAL = 20
// Delay before auto-advancing to next question after correct answer (ms)
const AUTO_ADVANCE_MS = 1500

/**
 * useAutoAdvance Hook
 * Auto-advances to the next question after correct answer is revealed.
 * Only triggers if revealed=true AND isCorrect=true.
 * Calls advanceFnRef.current() after AUTO_ADVANCE_MS delay.
 *
 * @param {boolean} revealed - Whether the answer feedback is shown
 * @param {React.MutableRefObject<Function>} advanceFnRef - Ref to the advance function
 * @param {boolean} isCorrect - Whether the user's answer was correct
 */
function useAutoAdvance(revealed, advanceFnRef, isCorrect) {
  useEffect(() => {
    // Only auto-advance if the answer was revealed AND is correct
    if (!revealed || !isCorrect) return
    const id = setTimeout(() => advanceFnRef.current(), AUTO_ADVANCE_MS)
    return () => clearTimeout(id)
  }, [revealed, isCorrect])
}

/**
 * useTimer Hook
 * Tracks elapsed time for a quiz question. Maintains start time and running interval.
 * Provides methods to start, stop, and reset the timer.
 *
 * @returns {{elapsed: number, start: Function, stop: Function, reset: Function}}
 *   - elapsed: Current elapsed seconds (updated every 250ms)
 *   - start(): Initialize timer and begin counting
 *   - stop(): Stop timer and return total elapsed seconds
 *   - reset(): Clear timer and set elapsed to 0
 */
function useTimer() {
  // Current elapsed time in seconds, displayed to user
  const [elapsed, setElapsed] = useState(0)
  // Reference to the timestamp when timer started (using Date.now())
  const startRef = useRef(Date.now())
  // Reference to the setInterval ID for cleanup
  const intervalRef = useRef(null)

  /**
   * start(): Initialize and begin the timer
   * Records the current time, resets elapsed to 0, and starts interval updates
   */
  const start = () => {
    startRef.current = Date.now()
    setElapsed(0)
    clearInterval(intervalRef.current)
    // Update displayed elapsed time every 250ms (4x per second for smooth UI)
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 250)
  }

  /**
   * stop(): Halt the timer and return the total elapsed time
   * Does NOT reset state; caller typically uses the returned value to record answer time
   */
  const stop = () => {
    clearInterval(intervalRef.current)
    return Math.floor((Date.now() - startRef.current) / 1000)
  }

  /**
   * reset(): Stop interval and clear elapsed time to 0
   * Used when finishing a quiz (stop timer and prepare for cleanup)
   */
  const reset = () => {
    clearInterval(intervalRef.current)
    setElapsed(0)
  }

  // Cleanup: ensure interval is cleared when component unmounts
  useEffect(() => () => clearInterval(intervalRef.current), [])

  return { elapsed, start, stop, reset }
}

/**
 * ResultsTable Component
 * Displays a summary table of all quiz answers: question, user's answer, correct answer, and time.
 * Shows row highlighting: green for correct, red for wrong.
 * Includes total time and average time per question in footer.
 *
 * @param {Object} props
 * @param {Array<{question: string, userAnswer: string, correctAnswer: string|number, correct: boolean, time: number}>} props.results
 *   Array of result objects from quiz attempts. Each has question text, user answer, correct answer, correctness flag, and time in seconds.
 * @returns {ReactElement|null} Table element or null if no results
 */
function ResultsTable({ results }) {
  // Hide table if empty or null
  if (!results || results.length === 0) return null
  // Calculate summary stats
  const totalTime = results.reduce((sum, r) => sum + r.time, 0)
  const avgTime = (totalTime / results.length).toFixed(1)
  return (
    <div className="results-table-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Your Answer</th>
            <th>Result</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            // Row is highlighted green if correct, red if wrong
            <tr key={i} className={r.correct ? 'row-correct' : 'row-wrong'}>
              <td>{i + 1}</td>
              <td>{r.question}</td>
              <td>{r.userAnswer}</td>
              {/* Show checkmark for correct, X with correct answer for wrong */}
              <td>{r.correct ? '✓' : `✗ (${r.correctAnswer})`}</td>
              <td>{r.time}s</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Summary stats at bottom */}
      <div className="results-summary">
        Total time: {totalTime}s &middot; Average: {avgTime}s per question
      </div>
    </div>
  )
}

/**
 * NumPad Component
 * Virtual numeric keypad for touch-friendly numeric input (0-9, ±, backspace).
 * Used in addition, quadratic, multiplication, and other numeric quizzes.
 *
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when user presses a key: receives new value string
 * @param {Function} props.onSubmit - (Optional) Callback when user presses submit key
 * @param {boolean} props.disabled - If true, all buttons are disabled
 */
function NumPad({ value, onChange, onSubmit, disabled }) {
  /**
   * press(key): Handle numpad key press
   * - '0'-'9': append to value
   * - '±': toggle negative sign (add or remove from start)
   * - '⌫': delete last character (backspace)
   */
  const press = (key) => {
    if (disabled) return
    if (key === '⌫') {
      // Backspace: remove last character
      onChange(value.slice(0, -1))
    } else if (key === '±') {
      // Toggle sign: add or remove leading minus
      onChange(value.startsWith('-') ? value.slice(1) : '-' + value)
    } else {
      // Digit: append to current value
      onChange(value + key)
    }
  }

  return (
    <div className="numpad">
      {/* Row 1-3 */}
      <div className="numpad-row">
        {['1', '2', '3'].map((k) => (
          <button key={k} type="button" className="numpad-key" onClick={() => press(k)} disabled={disabled}>{k}</button>
        ))}
      </div>
      {/* Row 4-6 */}
      <div className="numpad-row">
        {['4', '5', '6'].map((k) => (
          <button key={k} type="button" className="numpad-key" onClick={() => press(k)} disabled={disabled}>{k}</button>
        ))}
      </div>
      {/* Row 7-9 */}
      <div className="numpad-row">
        {['7', '8', '9'].map((k) => (
          <button key={k} type="button" className="numpad-key" onClick={() => press(k)} disabled={disabled}>{k}</button>
        ))}
      </div>
      {/* Row ±, 0, ⌫ (special keys) */}
      <div className="numpad-row">
        <button type="button" className="numpad-key numpad-special" onClick={() => press('±')} disabled={disabled}>±</button>
        <button type="button" className="numpad-key" onClick={() => press('0')} disabled={disabled}>0</button>
        <button type="button" className="numpad-key numpad-special" onClick={() => press('⌫')} disabled={disabled}>⌫</button>
      </div>
    </div>
  )
}

/**
 * AdaptiveTablesApp Component
 * Implements an adaptive multiplication tables learning system with rolling-window algorithm.
 * Dynamically hides/shows reference table based on student performance.
 * Automatically advances to next table when student demonstrates mastery.
 *
 * === ADAPTATION ALGORITHM ===
 * Uses a rolling window of the last WINDOW (8) answers to evaluate performance:
 *
 * For the current window, calculates:
 *   - accuracy: % of correct answers
 *   - avgTime: average time per question in milliseconds
 *
 * State transitions:
 *   "learning" state (bad performance):
 *     - avgTime ≥ 6000ms OR accuracy < 70%
 *     - Action: Show the reference table, reset advancement counter
 *     - Purpose: Student needs help to avoid frustration
 *
 *   "comfortable" state (medium performance):
 *     - avgTime < 6000ms AND accuracy ≥ 70%
 *     - Action: Hide the table to build confidence, but keep status visible
 *     - Purpose: Student can do it, but might need occasional reference
 *
 *   "mastered" state (excellent performance):
 *     - avgTime < 3000ms AND accuracy ≥ 90%
 *     - First time: Hide table and start advancement counter
 *     - Each subsequent mastered answer (without table): +1 to advancement counter
 *     - When counter reaches ADVANCE_COUNT (5): Advance to next table (2→3→...→20)
 *     - Purpose: Student has internalized the pattern
 *
 * === PERSISTENCE ===
 * Current table progress saved to localStorage[tenali-tables-{studentName}]
 * Allows student to resume from last table on page reload
 *
 * @param {Object} props
 * @param {string} props.studentName - Student's name (used for localStorage key and display)
 */

/**
 * ADAPTATION CONSTANTS
 * These control how aggressive the adaptive algorithm is and when advancement happens
 */
const WINDOW = 8                   // Rolling window: analyze last 8 answers for each table
const FAST_THRESH = 3000           // "Fast" speed threshold for mastery (ms)
const MEDIUM_THRESH = 6000         // "Comfortable" speed threshold (ms)
const ADVANCE_COUNT = 5            // How many consecutive "mastered without table" answers → advance to next table

function AdaptiveTablesApp({ studentName }) {
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
    } catch {}
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
  // Array of all results this session: {q, yourAnswer, correct, time, table}
  const [results, setResults] = useState([])

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
    try { localStorage.setItem(storageKey, JSON.stringify({ currentTable: tbl })) } catch {}
  }

  /**
   * generateQuestion(tbl): Create a new multiplication question
   * Generates random multiplier (1-10), returns {table, multiplier, answer}
   */
  const generateQuestion = (tbl) => {
    const multiplier = Math.floor(Math.random() * 10) + 1
    return { table: tbl, multiplier, answer: tbl * multiplier }
  }

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
    setResults([])
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
  const nextQuestion = (tbl) => {
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
  }

  // Update the advance function ref so useAutoAdvance can call it
  advanceFnRef.current = () => {
    nextQuestion()
  }

  // Auto-advance after correct answer (after AUTO_ADVANCE_MS delay)
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  // Keyboard shortcut: Enter key advances to next question after wrong answer
  // (Auto-advance via useAutoAdvance handles correct answers)
  useEffect(() => {
    if (!revealed || isCorrect) return  // Only listen when wrong answer is revealed
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nextQuestion() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [revealed, isCorrect, currentTable])

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
    if (avgTime < FAST_THRESH && accuracy >= 0.9) return { level: 'mastered', avgTime, accuracy }
    if (avgTime < MEDIUM_THRESH && accuracy >= 0.7) return { level: 'comfortable', avgTime, accuracy }
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

    // Generate feedback message with speed label
    const speedLabel = elapsed < FAST_THRESH ? 'fast' : elapsed < MEDIUM_THRESH ? 'ok' : 'slow'
    const fb = correct
      ? `Correct! ${question.table} × ${question.multiplier} = ${question.answer} (${(elapsed / 1000).toFixed(1)}s — ${speedLabel})`
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
    const newWindow = [...recentWindow, { correct, timeMs: elapsed }].slice(-WINDOW)
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

      if (newCount >= ADVANCE_COUNT) {
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
          setTimeout(() => nextQuestion(nextTbl), AUTO_ADVANCE_MS)
          return  // Skip normal auto-advance; we're explicitly calling nextQuestion
        } else {
          // nextTbl > 20: Student has finished all tables!
          setPhase('finished')
          return
        }
      }
      // Not yet at threshold; show progress toward advancement
      setStatusMsg(`Mastered! (${newCount}/${ADVANCE_COUNT} to advance) — avg ${(avgTime / 1000).toFixed(1)}s`)

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
      // CASE: Student is still learning (< 70% accuracy or > 6s avg time)
      // Action: Ensure table is shown; reset advancement counter
      if (!showTable) {
        setShowTable(true)
        setStatusMsg(`Needs practice — table shown again`)
      } else {
        setStatusMsg(`Learning — keep practicing with the table`)
      }
      setMasteredWithout(0)  // Reset; student's not ready to advance
    }
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
                {feedback && (
                  <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>
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

/**
 * App Component (Main Shell)
 * Root component that handles:
 * - Theme toggle (dark/light mode) with localStorage persistence
 * - URL-based routing for student-specific pages
 * - Mode-based routing for different quiz types (home menu → quiz app)
 *
 * Theme system:
 *   - Loads from localStorage[tenali-theme] or defaults to 'dark'
 *   - Sets data-theme attribute on document.documentElement (CSS uses this)
 *   - Persists changes immediately to localStorage
 *
 * Routing system:
 *   1. URL-based routes (specific student pages):
 *      - /taittiriya → AdaptiveTablesApp for Taittiriya
 *      - /tatsavit → AdaptiveTablesApp for Tatsavit
 *      - /intervalscheduling → IntervalSchedulingApp
 *      - /extendedeuclid → ExtendedEuclidApp
 *   2. Mode-based routes (home menu):
 *      - null (no mode selected) → Home component (menu)
 *      - 'gk' → GKApp, 'addition' → AdditionApp, etc.
 *      - App uses modeMap to find the component class
 */
function App() {
  // Currently selected quiz mode (null = home menu, or key like 'gk', 'addition', etc.)
  const [mode, setMode] = useState(null)

  // Current theme: 'dark' or 'light'
  // Initialized from localStorage with fallback to 'dark'
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('tenali-theme') || 'dark' } catch { return 'dark' }
  })

  // Sync theme to DOM and localStorage whenever it changes
  useEffect(() => {
    // Apply theme to document (CSS selectors use [data-theme="dark"] or [data-theme="light"])
    document.documentElement.setAttribute('data-theme', theme)
    // Persist to localStorage for future sessions
    try { localStorage.setItem('tenali-theme', theme) } catch {}
  }, [theme])

  /**
   * toggleTheme(): Switch between dark and light modes
   */
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // ========== ROUTING: URL-BASED (STUDENT PAGES) ==========
  // Check if current URL matches a specific student page
  const pathname = window.location.pathname.replace(/\/$/, '').toLowerCase()

  // Route: /taittiriya → Taittiriya's adaptive tables app
  if (pathname === '/taittiriya') {
    return (
      <>
        <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <AdaptiveTablesApp studentName="Taittiriya" />
      </>
    )
  }

  // Route: /tatsavit → Tatsavit's adaptive tables app
  if (pathname === '/tatsavit') {
    return (
      <>
        <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <AdaptiveTablesApp studentName="Tatsavit" />
      </>
    )
  }

  // Route: /intervalscheduling → Interval Scheduling algorithm quiz
  if (pathname === '/intervalscheduling') {
    return <IntervalSchedulingApp />
  }

  // Route: /extendedeuclid → Extended Euclidean algorithm quiz
  if (pathname === '/extendedeuclid') {
    return <ExtendedEuclidApp />
  }

  // ========== ROUTING: MODE-BASED (HOME MENU + QUIZZES) ==========
  // Map quiz mode keys to their component classes
  const modeMap = {
    gk: GKApp,                    // General Knowledge
    addition: AdditionApp,         // Basic addition
    quadratic: QuadraticApp,       // Quadratic substitution
    multiply: MultiplyApp,         // Multiplication tables
    vocab: VocabApp,               // Vocabulary
    spot: TwinHuntApp,             // Twin Hunt (visual)
    sqrt: SqrtApp,                 // Square root
    polymul: PolyMulApp,           // Polynomial multiplication
    polyfactor: PolyFactorApp,     // Polynomial factoring
    primefactor: PrimeFactorApp,   // Prime factorization
    qformula: QFormulaApp,         // Quadratic formula
    simul: SimulApp,               // Simultaneous equations
    funceval: FuncEvalApp,         // Function evaluation
    lineq: LineEqApp,              // Line equation
    basicarith: BasicArithApp,     // Basic arithmetic (+, −, ×)
    custom: CustomApp,             // Custom lesson builder
  }

  // Get the component to render (or null if mode not set)
  const ActiveApp = mode ? modeMap[mode] : null

  return (
    <div className="app-shell">
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="card">
        {!mode ? (
          <Home onSelect={setMode} />
        ) : ActiveApp ? (
          <ActiveApp onBack={() => setMode(null)} />
        ) : (
          <Home onSelect={setMode} />
        )}
      </div>
    </div>
  )
}

/**
 * Home Component
 * Main menu screen showing all available quizzes in a searchable grid.
 * Displays quiz cards with color coding and allows filtering by name/subtitle.
 *
 * @param {Object} props
 * @param {Function} props.onSelect - Callback when user selects a quiz: receives mode key (e.g., 'gk')
 */
function Home({ onSelect }) {
  // Complete list of all available quiz apps with metadata
  const allApps = [
    { key: 'gk', name: 'GK', subtitle: 'General Knowledge questions', color: 'purple' },
    { key: 'addition', name: 'Addition', subtitle: '20-question addition practice', color: 'blue' },
    { key: 'quadratic', name: 'Quadratic', subtitle: 'Find y for y = ax² + bx + c', color: 'blue' },
    { key: 'multiply', name: 'Multiplication', subtitle: 'Practice any times table (1–10)', color: 'green' },
    { key: 'vocab', name: 'Vocabulary', subtitle: 'Match words to definitions', color: 'blue' },
    { key: 'spot', name: 'Twin Hunt', subtitle: 'Find the common object', color: 'purple' },
    { key: 'sqrt', name: 'Square Root', subtitle: 'Nearest-integer square root drill', color: 'green' },
    { key: 'polymul', name: 'Poly Multiply', subtitle: 'Multiply two polynomials', color: 'blue' },
    { key: 'polyfactor', name: 'Poly Factor', subtitle: 'Factor a quadratic expression', color: 'green' },
    { key: 'primefactor', name: 'Prime Factors', subtitle: 'Break a number into primes', color: 'purple' },
    { key: 'qformula', name: 'Quadratics', subtitle: 'Find roots of ax² + bx + c = 0', color: 'blue' },
    { key: 'simul', name: 'Sim. Eq.', subtitle: '2×2 (easy) or 3×3 (hard)', color: 'purple' },
    { key: 'funceval', name: 'Functions', subtitle: 'Evaluate f(x), f(x,y), f(x,y,z)', color: 'blue' },
    { key: 'lineq', name: 'Line Equation', subtitle: 'Find m and c from two points', color: 'green' },
    { key: 'basicarith', name: 'Arithmetic', subtitle: '+, −, × with positive & negative', color: 'purple' },
    { key: 'custom', name: 'Custom Lesson', subtitle: 'Build your own mixed quiz', color: 'green' },
  ]

  // Search term for filtering apps
  const [search, setSearch] = useState('')

  // Filtered list: show matching apps, or all if search is empty
  const apps = search.trim()
    ? allApps.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.subtitle.toLowerCase().includes(search.toLowerCase())
      )
    : allApps

  // Grid layout tracking (for responsive display)
  const gridRef = useRef(null)
  // Number of columns currently displayed (responsive)
  const [cols, setCols] = useState(4)

  // Update grid dimensions on resize (for responsive grid calculation)
  useEffect(() => {
    const updateCols = () => {
      if (!gridRef.current) return
      const style = window.getComputedStyle(gridRef.current)
      const columns = style.getPropertyValue('grid-template-columns').split(' ').length
      setCols(columns)
    }
    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  // Calculate number of rows for display (for grid dimension label at bottom)
  const rows = Math.ceil(apps.length / (cols || 1))

  return (
    <>
      <h1>Tenali</h1>
      <p className="subtitle">Choose a learning game to begin</p>
      <div className="search-bar-row">
        <input
          className="search-bar"
          type="text"
          placeholder="Search puzzles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="menu-grid" ref={gridRef}>
        {apps.map((app) => (
          <button key={app.key} className={`menu-card ${app.color}`} onClick={() => onSelect(app.key)}>
            <span className="menu-title">{app.name}</span>
            <span className="menu-subtitle">{app.subtitle}</span>
          </button>
        ))}
      </div>
      <div className="grid-dimension">{rows} × {cols}</div>
    </>
  )
}

/**
 * GKApp Component (General Knowledge Quiz)
 * Multiple-choice General Knowledge questions fetched from backend API.
 * Questions are randomly selected and not repeated (excludeIds parameter).
 * Questions continue indefinitely until user chooses to go back.
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function GKApp({ onBack }) {
  // Current question object: {id, question, options: [A, B, C, D], ...}
  const [question, setQuestion] = useState(null)
  // User's selected option: 'A', 'B', 'C', or 'D'
  const [selected, setSelected] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the selected answer correct?
  const [isCorrect, setIsCorrect] = useState(null)
  // Is a question being fetched from the API?
  const [loading, setLoading] = useState(false)
  // Total correct answers so far
  const [score, setScore] = useState(0)
  // Has the answer been revealed (showing feedback)?
  const [revealed, setRevealed] = useState(false)
  // Question counter (1, 2, 3, ...)
  const [questionNumber, setQuestionNumber] = useState(0)
  // All result objects from this session
  const [results, setResults] = useState([])
  // Array of previously seen question IDs (to avoid repeats)
  const [seenIds, setSeenIds] = useState([])
  // Timer for tracking response time per question
  const timer = useTimer()

  /**
   * loadQuestion(excludeIds?): Fetch next GK question from API
   * Excludes previously seen questions to avoid repetition
   */
  const loadQuestion = async (excludeIds) => {
    setLoading(true)
    setSelected('')
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    // Build query param to exclude previously seen questions
    const ids = excludeIds || seenIds
    const excludeParam = ids.length ? `?exclude=${ids.join(',')}` : ''
    // Fetch from backend API
    const res = await fetch(`${API}/gk-api/question${excludeParam}`)
    const data = await res.json()
    setQuestion(data)
    // Track this question ID so we don't ask it again
    setSeenIds(prev => [...prev, data.id])
    setQuestionNumber((n) => n + 1)
    setLoading(false)
    timer.start()  // Start timer for this question
  }

  // Load first question on component mount
  useEffect(() => {
    loadQuestion([])
  }, [])

  /**
   * submitGK(option): Submit selected answer and check correctness with API
   * Receives the feedback (correct answer + explanation) from backend
   */
  const submitGK = async (option) => {
    if (!question || revealed) return
    const timeTaken = timer.stop()
    setSelected(option)
    // POST to backend API to check the answer
    const res = await fetch(`${API}/gk-api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: question.id, answerOption: option }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore((s) => s + 1)
    // Show feedback with explanation
    setFeedback(data.correct
      ? `Correct! The answer is ${data.correctAnswer}) ${data.correctAnswerText}`
      : `Incorrect. The correct answer is ${data.correctAnswer}) ${data.correctAnswerText}`)
    // Record result for display
    setResults((prev) => [...prev, {
      question: question.question.length > 50 ? question.question.slice(0, 50) + '…' : question.question,
      userAnswer: option,
      correctAnswer: `${data.correctAnswer}) ${data.correctAnswerText}`,
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * handleSubmitOrNext(): Toggle between submit and next question
   * If not revealed: submit the selected answer
   * If revealed: load the next question
   */
  const handleSubmitOrNext = async () => {
    if (!question) return
    if (!revealed) { if (selected) submitGK(selected); return }
    await loadQuestion()
  }

  // Auto-advance after correct answer
  const advanceRef = useRef(() => {})
  advanceRef.current = () => loadQuestion()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  // Keyboard shortcuts: 1-4 or a-d instantly select and submit answer; Enter for submit/next
  const submitGKRef = useRef(submitGK)
  submitGKRef.current = submitGK
  const handleNextRef = useRef(handleSubmitOrNext)
  handleNextRef.current = handleSubmitOrNext

  useEffect(() => {
    const onKeyDown = (event) => {
      // Enter: submit or next
      if (event.key === 'Enter') { event.preventDefault(); handleNextRef.current(); return }
      // Only allow number/letter shortcuts when not already revealed, loading, or no question
      if (revealed || loading || !question) return
      // Map 1-4 and a-d to A-D options
      const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D' }
      const letter = keyMap[event.key.toLowerCase()]
      // Only allow if this option exists for this question
      if (letter && question.options.length >= ['A','B','C','D'].indexOf(letter) + 1) {
        event.preventDefault()
        submitGKRef.current(letter)  // Instantly select and submit
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revealed, loading, question])

  return (
    <QuizLayout title="General Knowledge" subtitle="Random question picker" onBack={onBack}>
      <div className="top-mini-row">
        {!loading && question && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="question-box">{loading || !question ? 'Loading question…' : question.question}</div>
      {question && (
        <div className="options-list">
          {question.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx]
            return (
              <label key={letter} className={`option-card ${selected === letter ? 'selected' : ''}`}>
                <input type="radio" name="gk" checked={selected === letter} onChange={() => !revealed && setSelected(letter)} disabled={revealed} />
                <span><strong>{letter})</strong> {option}</span>
              </label>
            )
          })}
        </div>
      )}
      {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
      <div className="button-row">
        <button onClick={handleSubmitOrNext} disabled={loading || (!revealed && !selected)}>{revealed ? 'Next Question' : 'Submit'}</button>
      </div>
      {results.length > 0 && <ResultsTable results={results} />}
    </QuizLayout>
  )
}

/**
 * AdditionApp Component
 * Addition practice quiz with configurable difficulty (1-3 digits) and question count.
 * Phases: setup (choose difficulty) → playing (answer questions) → finished (results)
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function AdditionApp({ onBack }) {
  // Difficulty level: 1 (1-digit), 2 (2-digit), 3 (3-digit)
  const [digits, setDigits] = useState(1)
  // User-entered number of questions to attempt
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz state: has quiz started?
  const [started, setStarted] = useState(false)
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
  // Timer for response timing
  const timer = useTimer()

  /**
   * fetchQuestion(selectedDigits?): Fetch next addition question from API
   * Generates random a + b = ? with specified digit count
   */
  const fetchQuestion = async (selectedDigits = digits) => {
    setLoading(true)
    setFeedback('')
    setAnswer('')
    setRevealed(false)
    setIsCorrect(null)
    const res = await fetch(`${API}/addition-api/question?digits=${selectedDigits}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Transition to playing phase
   * Initialize quiz state and fetch first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    await fetchQuestion(digits)
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Enter' || !started || finished) return
      event.preventDefault()
      handleSubmitOrNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, finished, question, answer, revealed, score, questionNumber, digits, loading, totalQ])

  const handleSubmitOrNext = async () => {
    if (!question) return

    if (!revealed) {
      if (answer === '') return
      const timeTaken = timer.stop()
      const res = await fetch(`${API}/addition-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: question.a, b: question.b, answer: Number(answer) }),
      })
      const data = await res.json()
      setIsCorrect(data.correct)
      const newScore = score + (data.correct ? 1 : 0)
      setScore(newScore)
      const reasoning = `${question.a} + ${question.b} = ${data.correctAnswer}`
      setFeedback(data.correct
        ? `Correct! ${reasoning}`
        : `Incorrect. ${reasoning}`)
      setResults((prev) => [...prev, {
        question: `${question.a} + ${question.b}`,
        userAnswer: answer,
        correctAnswer: data.correctAnswer,
        correct: data.correct,
        time: timeTaken,
      }])
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
    await fetchQuestion(digits)
  }

  const advanceRef = useRef(() => {})
  advanceRef.current = () => handleSubmitOrNext()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  return (
    <QuizLayout title="Addition" subtitle="Choose a level and solve addition questions" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {[1, 2, 3].map((value) => (
          <label key={value} className={`radio-pill ${digits === value ? 'active' : ''}`}>
            <input type="radio" checked={digits === value} onChange={() => setDigits(value)} disabled={started && !finished} />
            {value === 1 ? 'One digit' : value === 2 ? 'Two digits' : 'Three digits'}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">The quiz is ready to begin.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} placeholder={String(DEFAULT_TOTAL)} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
        <input className="answer-input" type="text" value={answer} onChange={(e) => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" />
        <NumPad value={answer} onChange={(v) => !revealed && setAnswer(v)} disabled={revealed} />
        <div className="button-row"><button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>{revealed ? (questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button></div>
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete.</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={startQuiz}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/**
 * BasicArithApp Component
 * Basic arithmetic (+, −, ×) with positive and negative numbers.
 * Difficulty levels: easy (1-digit), medium (2-digit), hard (3-digit)
 * Supports keyboard shortcuts for faster entry (number keys, minus, backspace)
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function BasicArithApp({ onBack }) {
  // Difficulty level: 'easy', 'medium', 'hard'
  const [difficulty, setDifficulty] = useState('easy')
  // User-entered number of questions
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started?
  const [started, setStarted] = useState(false)
  // Quiz finished?
  const [finished, setFinished] = useState(false)
  // Current question: {a, b, op: '+' | '−' | '×', prompt}
  const [question, setQuestion] = useState(null)
  // User's numeric answer
  const [answer, setAnswer] = useState('')
  // Correct answer count
  const [score, setScore] = useState(0)
  // Current question number
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Feedback after submission
  const [feedback, setFeedback] = useState('')
  // Is answer correct?
  const [isCorrect, setIsCorrect] = useState(null)
  // Fetching?
  const [loading, setLoading] = useState(false)
  // Answer revealed?
  const [revealed, setRevealed] = useState(false)
  // Results array
  const [results, setResults] = useState([])
  // Timer
  const timer = useTimer()

  /**
   * fetchQuestion(): Fetch next arithmetic question
   * Generates random a op b = ? with specified difficulty and operation
   */
  const fetchQuestion = async () => {
    setLoading(true)
    setFeedback(''); setAnswer(''); setRevealed(false); setIsCorrect(null)
    const res = await fetch(`${API}/basicarith-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize quiz and fetch first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await fetchQuestion()
  }

  // Keyboard shortcuts for faster numeric entry (without needing input focus)
  // Digits 0-9: append to answer
  // Minus (-): toggle negative sign
  // Backspace: delete last character
  // Enter: submit or next
  /**
   * Keyboard shortcut handler for BasicArithmeticApp:
   * - Enter: Submit answer or advance to next question
   * - 0-9: Append digit to answer
   * - Minus (-): Toggle negative sign prefix
   * - Backspace: Delete last character
   * Only active when quiz is running (started && !finished) and not revealed
   */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!started || finished) return
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSubmitOrNext()
        return
      }
      // Only allow keyboard shortcuts when not revealed or loading
      if (revealed || loading) return
      if (/^[0-9]$/.test(event.key)) {
        // Digit pressed: append to answer
        event.preventDefault()
        setAnswer(prev => prev + event.key)
      } else if (event.key === '-') {
        // Minus pressed: toggle negative sign
        event.preventDefault()
        setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
      } else if (event.key === 'Backspace') {
        // Backspace: delete last character
        event.preventDefault()
        setAnswer(prev => prev.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, finished, question, answer, revealed, score, questionNumber, difficulty, loading, totalQ])

  /**
   * handleSubmitOrNext(): Submission and progression handler for BasicArithmeticApp
   * Phase 1 (not revealed):
   *   - Stop timer and POST user answer to /basicarith-api/check endpoint
   *   - Receive { correct, correctAnswer }
   *   - Show feedback and store result, then reveal answer
   * Phase 2 (revealed):
   *   - If all questions answered, finish quiz
   *   - Otherwise, increment questionNumber and fetch next question
   */
  const handleSubmitOrNext = async () => {
    if (!question) return
    if (!revealed) {
      if (answer === '') return
      const timeTaken = timer.stop()
      // POST to backend to validate answer for arithmetic operation: a op b
      const res = await fetch(`${API}/basicarith-api/check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: question.a, b: question.b, op: question.op, answer: Number(answer) }),
      })
      const data = await res.json()
      setIsCorrect(data.correct)
      if (data.correct) setScore(s => s + 1)
      setFeedback(data.correct ? `Correct! ${question.prompt} = ${data.correctAnswer}` : `Incorrect. ${question.prompt} = ${data.correctAnswer}`)
      // Store result with time taken
      setResults(prev => [...prev, {
        question: question.prompt,
        userAnswer: answer,
        correctAnswer: String(data.correctAnswer),
        correct: data.correct,
        time: timeTaken,
      }])
      setRevealed(true)
      return
    }
    // Quiz progression: check if quiz is finished
    if (questionNumber >= totalQ) { setFinished(true); setQuestion(null); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await fetchQuestion()
  }

  const advanceRef = useRef(() => {})
  advanceRef.current = () => handleSubmitOrNext()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  return (
    <QuizLayout title="Basic Arithmetic" subtitle="Add, subtract, and multiply positive & negative numbers" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d === 'easy' ? '1 digit' : d === 'medium' ? '2 digits' : '3 digits'}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Solve +, −, and × problems with positive and negative numbers.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
        <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" />
        <NumPad value={answer} onChange={v => !revealed && setAnswer(v)} disabled={revealed} />
        <div className="button-row"><button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>{revealed ? (questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button></div>
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete.</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/**
 * QuadraticApp Component
 * Quadratic function substitution practice: "Given x, find y = ax² + bx + c"
 * Difficulty levels: easy, medium, hard (varying coefficient magnitudes)
 * Generates random quadratic coefficients (a, b, c) and x values
 * Shows step-by-step working for each question
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function QuadraticApp({ onBack }) {
  // Difficulty level: 'easy', 'medium', or 'hard' (controls coefficient range)
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to complete in this quiz session
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag
  const [started, setStarted] = useState(false)
  // Quiz finished flag
  const [finished, setFinished] = useState(false)
  // Current question object: {a, b, c, x} where formula is y = ax² + bx + c
  const [question, setQuestion] = useState(null)
  // User's string input for the y value answer
  const [answer, setAnswer] = useState('')
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions in this quiz session
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Feedback string with step-by-step calculation working
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress?
  const [loading, setLoading] = useState(false)
  // Answer revealed (transition from submit mode to next mode)?
  const [revealed, setRevealed] = useState(false)
  // Array of {question, userAnswer, correctAnswer, correct, time} objects
  const [results, setResults] = useState([])
  // Timer instance for tracking time spent per question
  const timer = useTimer()

  /**
   * fetchQuestion(selectedDifficulty?): Fetch next quadratic substitution question from backend
   * Endpoint: /quadratic-api/question?difficulty={easy|medium|hard}
   * Returns: {a, b, c, x} with the actual answer pre-calculated server-side
   * Resets form state and starts timer for this question
   */
  const fetchQuestion = async (selectedDifficulty = difficulty) => {
    setLoading(true)
    setAnswer('')
    setFeedback('')
    setRevealed(false)
    setIsCorrect(null)
    // Fetch new question with specified difficulty
    const res = await fetch(`${API}/quadratic-api/question?difficulty=${selectedDifficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    await fetchQuestion(difficulty)
  }

  /**
   * Keyboard handler for QuadraticApp: Enter key to submit/next
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
   * handleSubmitOrNext(): Submission and progression for QuadraticApp
   * Phase 1 (not revealed):
   *   - POST to /quadratic-api/check with {a, b, c, x, answer}
   *   - Receive { correct, correctAnswer }
   *   - Generate step-by-step working showing the calculation
   *   - Display feedback and reveal answer
   * Phase 2 (revealed):
   *   - If all questions answered, finish quiz
   *   - Otherwise, increment to next question and fetch it
   */
  const handleSubmitOrNext = async () => {
    if (!question) return

    if (!revealed) {
      if (answer === '') return
      const timeTaken = timer.stop()
      // POST to backend to validate quadratic substitution answer
      const res = await fetch(`${API}/quadratic-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: question.a, b: question.b, c: question.c, x: question.x, answer: Number(answer) }),
      })
      const data = await res.json()
      setIsCorrect(data.correct)
      if (data.correct) setScore((s) => s + 1)

      // Generate step-by-step working for feedback
      const { a, b, c, x } = question
      const xSq = x * x
      const termA = a * xSq
      const termB = b * x
      const sign = (v) => v >= 0 ? `+ ${v}` : `− ${Math.abs(v)}`
      const reasoning = `y = ${a}(${x})² ${sign(b)}(${x}) ${sign(c)}\n= ${a}(${xSq}) ${sign(termB)} ${sign(c)}\n= ${termA} ${sign(termB)} ${sign(c)}\n= ${data.correctAnswer}`
      setFeedback(data.correct
        ? `Correct!\n${reasoning}`
        : `Incorrect.\n${reasoning}`)
      setResults((prev) => [...prev, {
        question: `y = ${a}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}, x=${x}`,
        userAnswer: answer,
        correctAnswer: data.correctAnswer,
        correct: data.correct,
        time: timeTaken,
      }])
      setRevealed(true)
      return
    }

    // Quiz progression: check if all questions have been answered
    if (questionNumber >= totalQ) {
      setFinished(true)
      setQuestion(null)
      timer.reset()
      return
    }

    setQuestionNumber((n) => n + 1)
    await fetchQuestion()
  }

  const advanceRef = useRef(() => {})
  advanceRef.current = () => handleSubmitOrNext()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  return (
    <QuizLayout title="Quadratic" subtitle="Given x, find y = ax² + bx + c" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map((level) => (
          <label key={level} className={`radio-pill ${difficulty === level ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === level} onChange={() => setDifficulty(level)} disabled={started && !finished} />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Quadratic substitution practice.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} placeholder={String(DEFAULT_TOTAL)} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        <div className="question-box">
          {loading || !question ? 'Loading question…' : (
            <>
              <span className="given">x = {question.x}</span>
              <span className="equation">y = {question.a === 1 ? '' : question.a === -1 ? '−' : question.a}x² {question.b >= 0 ? '+' : '−'} {Math.abs(question.b) === 1 ? '' : Math.abs(question.b)}x {question.c >= 0 ? '+' : '−'} {Math.abs(question.c)}</span>
            </>
          )}
        </div>
        <input className="answer-input" type="text" value={answer} onChange={(e) => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="y = ?" />
        <NumPad value={answer} onChange={(v) => !revealed && setAnswer(v)} disabled={revealed} />
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row"><button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>{revealed ? (questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button></div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete.</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={startQuiz}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/**
 * MultiplyApp Component
 * Multiplication tables practice with flexible table selection (2-9 times tables).
 * Key features:
 *   - User selects which multiplication tables to practice
 *   - All questions from selected tables are shuffled into a pool
 *   - Optional limit on number of questions (or use all available)
 *   - Instant local calculation (no API needed)
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function MultiplyApp({ onBack }) {
  // Array of selected multiplication table numbers (e.g., [2, 3, 5])
  const [selectedTables, setSelectedTables] = useState([])
  // User-entered question limit (empty string = use all available questions)
  const [numQuestions, setNumQuestions] = useState('')
  // Quiz started flag
  const [started, setStarted] = useState(false)
  // Quiz finished flag
  const [finished, setFinished] = useState(false)
  // Current question object: {table, multiplier, prompt: "table × multiplier"}
  const [question, setQuestion] = useState(null)
  // User's string input for the answer
  const [answer, setAnswer] = useState('')
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer in this quiz session
  const [totalQuestions, setTotalQuestions] = useState(0)
  // Feedback string showing correct/incorrect result
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // Loading state (not used locally, present for consistency)
  const [loading, setLoading] = useState(false)
  // Answer revealed flag (transition from submit mode to next mode)
  const [revealed, setRevealed] = useState(false)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Pre-shuffled pool of all questions from selected tables
  // Format: [{table: 2, multiplier: 1}, {table: 5, multiplier: 3}, ...]
  const [questionPool, setQuestionPool] = useState([])
  // Timer instance for tracking time spent per question
  const timer = useTimer()

  // Maximum possible questions (if all selected tables' 10 multipliers are included)
  // Used for displaying max limit to user
  const maxQuestions = selectedTables.length * 10

  /**
   * toggleTable(num): Add or remove multiplication table from selection
   * If table is already selected, remove it; otherwise add it
   */
  const toggleTable = (num) => {
    setSelectedTables((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    )
  }

  /**
   * buildPool(tables): Generate and shuffle complete question pool from selected tables
   * Algorithm:
   *   1. For each selected table, generate 10 questions (table × 1 through table × 10)
   *   2. Apply Fisher-Yates shuffle to randomize order
   * Returns: Shuffled array of {table, multiplier} objects
   */
  const buildPool = (tables) => {
    const pool = []
    tables.forEach((t) => {
      // Generate all 10 multiplication facts for this table
      for (let m = 1; m <= 10; m++) {
        pool.push({ table: t, multiplier: m })
      }
    })
    // Fisher-Yates shuffle algorithm for unbiased randomization
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool
  }

  /**
   * nextFromPool(pool, index): Load question at given index from shuffled pool
   * Converts pool entry to question display format and resets form/state
   * Starts timer for the question
   */
  const nextFromPool = (pool, index) => {
    const q = pool[index]
    // Create question display from table and multiplier
    setQuestion({ table: q.table, multiplier: q.multiplier, prompt: `${q.table} × ${q.multiplier}` })
    setAnswer('')
    setFeedback('')
    setRevealed(false)
    setIsCorrect(null)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize multiplication quiz
   * Process:
   *   1. Build shuffled pool from selected tables
   *   2. Limit to user-specified count (or all if field empty)
   *   3. Reset quiz state and load first question from pool
   */
  const startQuiz = () => {
    if (selectedTables.length === 0) return
    // Build pool of all possible questions from selected tables
    const pool = buildPool(selectedTables)
    // Limit to user-specified count, or use all available
    const count = numQuestions !== '' ? Math.min(Number(numQuestions), pool.length) : pool.length
    const trimmedPool = pool.slice(0, count)
    setQuestionPool(trimmedPool)
    setTotalQuestions(count)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    nextFromPool(trimmedPool, 0)
  }

  /**
   * Keyboard handler for MultiplyApp: Enter key
   * - Before quiz: Start quiz if tables are selected
   * - During quiz: Submit answer or advance to next
   */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      if (!started && selectedTables.length > 0) {
        startQuiz()
      } else if (started && !finished) {
        handleSubmitOrNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, finished, question, answer, revealed, questionNumber, loading, selectedTables, questionPool])

  /**
   * handleSubmitOrNext(): Submission and progression for MultiplyApp
   * Phase 1 (not revealed):
   *   - Calculate expected answer locally (table × multiplier)
   *   - Compare with user input
   *   - Show feedback and store result
   * Phase 2 (revealed):
   *   - If all questions answered, finish quiz
   *   - Otherwise, load next question from pool
   * Note: No API call needed; multiplication validation is local
   */
  const handleSubmitOrNext = async () => {
    if (!question) return

    if (!revealed) {
      if (answer === '') return
      const timeTaken = timer.stop()
      // Calculate expected answer locally (no API required)
      const correctAnswer = question.table * question.multiplier
      const correct = Number(answer) === correctAnswer
      setIsCorrect(correct)
      if (correct) setScore((s) => s + 1)
      const reasoning = `${question.table} × ${question.multiplier} = ${correctAnswer}`
      setFeedback(correct
        ? `Correct! ${reasoning}`
        : `Incorrect. ${reasoning}`)
      setResults((prev) => [...prev, {
        question: question.prompt,
        userAnswer: answer,
        correctAnswer,
        correct,
        time: timeTaken,
      }])
      setRevealed(true)
      return
    }

    // Quiz progression: check if all questions have been answered
    if (questionNumber >= totalQuestions) {
      setFinished(true)
      setQuestion(null)
      timer.reset()
      return
    }

    // Load next question from the pool
    const nextIdx = questionNumber
    setQuestionNumber((n) => n + 1)
    nextFromPool(questionPool, nextIdx)
  }

  const advanceRef = useRef(() => {})
  advanceRef.current = () => handleSubmitOrNext()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  const tablesLabel = selectedTables.sort((a, b) => a - b).join(', ')

  return (
    <QuizLayout title="Multiplication" subtitle="Practice your times tables" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      {!started && !finished && (
        <div className="welcome-box">
          <p className="welcome-text">Select the tables you want to practice</p>
          <div className="checkbox-group">
            {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <label key={num} className={`checkbox-pill ${selectedTables.includes(num) ? 'active' : ''}`}>
                <input type="checkbox" checked={selectedTables.includes(num)} onChange={() => toggleTable(num)} />
                {num}
              </label>
            ))}
          </div>
          {selectedTables.length > 0 && (
            <div className="question-count-row">
              <label className="question-count-label">How many questions?</label>
              <input
                className="answer-input question-count-input"
                type="text"
                value={numQuestions}
                onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }}
                placeholder={`All ${maxQuestions}`}
              />
            </div>
          )}
          <div className="button-row">
            <button onClick={startQuiz} disabled={selectedTables.length === 0}>
              Start Quiz ({numQuestions && Number(numQuestions) > 0 ? Math.min(Number(numQuestions), maxQuestions) : maxQuestions} questions)
            </button>
          </div>
        </div>
      )}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQuestions} — Tables: {tablesLabel}</div>
        <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
        <input className="answer-input" type="text" value={answer} onChange={(e) => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" />
        <NumPad value={answer} onChange={(v) => !revealed && setAnswer(v)} disabled={revealed} />
        <div className="button-row"><button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>{revealed ? (questionNumber >= totalQuestions ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button></div>
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete — Tables: {tablesLabel}</p>
        <p className="final-score">Final score: {score}/{totalQuestions}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false); setSelectedTables([]); setQuestionPool([]); setNumQuestions('') }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/**
 * VocabApp Component
 * Vocabulary definition matching quiz: "What does this word mean?"
 * Features:
 *   - Multiple-choice format: 4 definition options (A, B, C, D)
 *   - 5 difficulty levels: easy, medium, hard, extra-hard, hardest
 *   - Questions never repeat: tracks seen question IDs and excludes them
 *   - Keyboard shortcuts: 1-4 or a-d to select answer, Enter to submit
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function VocabApp({ onBack }) {
  // Difficulty level: 'easy' | 'medium' | 'hard' | 'extra-hard' | 'hardest'
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer in this session
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag
  const [started, setStarted] = useState(false)
  // Quiz finished flag
  const [finished, setFinished] = useState(false)
  // Current question object: {id, question: word, options: [def1, def2, def3, def4]}
  const [question, setQuestion] = useState(null)
  // Selected option letter: 'A' | 'B' | 'C' | 'D' (or empty)
  const [selected, setSelected] = useState('')
  // Feedback message after answer reveal
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress?
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (transition from selection mode to next mode)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions in this quiz session
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Array of previously seen question IDs (to avoid repeats via API exclude parameter)
  const [seenIds, setSeenIds] = useState([])
  // Timer instance for tracking time spent per question
  const timer = useTimer()

  /**
   * loadQuestion(excludeIds?): Fetch next vocabulary question from backend
   * Endpoint: /vocab-api/question?difficulty={easy|medium|hard|extra-hard|hardest}&exclude={id1,id2,...}
   * Features:
   *   - Passes previously seen IDs to prevent question repetition
   *   - Returns: {id, question: word, options: [def1, def2, def3, def4]}
   *   - Tracks returned ID in seenIds to exclude on future requests
   * Resets form state and starts timer for this question
   */
  const loadQuestion = async (excludeIds) => {
    setLoading(true)
    setSelected('')
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    const ids = excludeIds || seenIds
    // Build exclude parameter to prevent question repeats
    const excludeParam = ids.length ? `&exclude=${ids.join(',')}` : ''
    const res = await fetch(`${API}/vocab-api/question?difficulty=${difficulty}${excludeParam}`)
    const data = await res.json()
    setQuestion(data)
    // Add this question's ID to seen list
    setSeenIds(prev => [...prev, data.id])
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize vocabulary quiz
   * Process:
   *   1. Parse question count from user input (validate as positive number)
   *   2. Reset all quiz state
   *   3. Fetch first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    setSeenIds([])
    await loadQuestion([])
  }

  /**
   * submitVocab(option): Submit user's definition choice and validate with backend
   * Process:
   *   1. Stop timer
   *   2. POST to /vocab-api/check with {id, answerOption}
   *   3. Receive { correct, correctAnswerText }
   *   4. Show feedback and store truncated definitions in results
   *   5. Reveal answer
   * Note: Definitions are truncated to 35 chars for results table display
   */
  const submitVocab = async (option) => {
    if (!question || revealed) return
    const timeTaken = timer.stop()
    setSelected(option)
    // POST to backend to validate the selected definition
    const res = await fetch(`${API}/vocab-api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: question.id, answerOption: option }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore((s) => s + 1)
    // Show feedback with correct answer text
    setFeedback(data.correct
      ? `Correct! "${data.correctAnswerText}"`
      : `Incorrect. The right definition is: "${data.correctAnswerText}"`)
    // Extract the user's selected definition from options array
    const userDef = question.options[['A','B','C','D'].indexOf(option)]
    // Truncate long definitions to fit in results table
    const truncate = (s) => s.length > 35 ? s.slice(0, 35) + '…' : s
    setResults((prev) => [...prev, {
      question: question.question,
      userAnswer: truncate(userDef),
      correctAnswer: truncate(data.correctAnswerText),
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * handleSubmitOrNext(): Submission and progression handler
   * Phase 1 (not revealed): If user has selected an option, submit it
   * Phase 2 (revealed):
   *   - If all questions answered, finish quiz
   *   - Otherwise, increment question number and fetch next question
   */
  const handleSubmitOrNext = async () => {
    if (!question) return
    if (!revealed) { if (selected) submitVocab(selected); return }
    if (questionNumber >= totalQ) { setFinished(true); setQuestion(null); timer.reset(); return }
    setQuestionNumber((n) => n + 1)
    await loadQuestion()
  }

  /**
   * Auto-advance after correct answer (uses useAutoAdvance hook)
   * Refs are used to capture latest function state for the hook
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = () => handleSubmitOrNext()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * Keyboard shortcuts for VocabApp:
   * - 1-4 or a-d: Select and immediately submit that option
   * - Enter: Submit selected answer or advance to next question
   * Options are only selectable when not revealed, not loading, question is loaded
   * Refs are used to maintain closure over latest function state
   */
  const submitVocabRef = useRef(submitVocab)
  submitVocabRef.current = submitVocab
  const handleNextRefV = useRef(handleSubmitOrNext)
  handleNextRefV.current = handleSubmitOrNext

  useEffect(() => {
    const onKeyDown = (event) => {
      // Enter key: submit or advance
      if (event.key === 'Enter') {
        if (!started || finished) return
        event.preventDefault()
        handleNextRefV.current()
        return
      }
      // Numeric and letter shortcuts only work during question (not revealed, not loading)
      if (!started || finished || revealed || loading || !question) return
      const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D' }
      const letter = keyMap[event.key.toLowerCase()]
      // Validate that selected option exists in this question
      if (letter && question.options.length >= ['A','B','C','D'].indexOf(letter) + 1) {
        event.preventDefault()
        submitVocabRef.current(letter)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, finished, revealed, loading, question])

  const difficultyLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard', 'extra-hard': 'Extra Hard', hardest: 'Hardest' }

  return (
    <QuizLayout title="Vocab Builder" subtitle="Pick the correct definition for the word" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {Object.entries(difficultyLabels).map(([key, label]) => (
          <label key={key} className={`radio-pill ${difficulty === key ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === key} onChange={() => setDifficulty(key)} disabled={started && !finished} />
            {label}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Test your vocabulary across 5 difficulty levels.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} placeholder={String(DEFAULT_TOTAL)} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        <div className="question-box vocab-word">{loading || !question ? 'Loading question…' : question.question}</div>
        {question && (
          <div className="options-list">
            {question.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx]
              return (
                <label key={letter} className={`option-card ${selected === letter ? 'selected' : ''} ${revealed && letter === selected && !isCorrect ? 'option-wrong' : ''} ${revealed && question && letter === ['A','B','C','D'][question.options.indexOf(results[results.length-1]?.correctAnswer)] ? 'option-correct' : ''}`}>
                  <input type="radio" name="vocab" checked={selected === letter} onChange={() => !revealed && setSelected(letter)} disabled={revealed} />
                  <span><strong>{letter})</strong> {option}</span>
                </label>
              )
            })}
          </div>
        )}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={handleSubmitOrNext} disabled={loading || (!revealed && !selected)}>{revealed ? (questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Twin Hunt App ────────────────────────────────────── */
/**
 * TwinHuntApp Component
 * Spot-the-difference puzzle: Find the common emoji in both panels
 * Features:
 *   - Two side-by-side panels with randomly scattered emoji symbols
 *   - One symbol appears in both panels (the "match" to find)
 *   - User clicks the matching symbol in either panel to score
 *   - Configurable number of symbols per panel and rounds
 *   - Visual dimming and highlighting on reveal
 */

// Pool of 40 emoji symbols for twin hunt rounds
// Used to randomly select unique symbols for each round
const TWIN_SYMBOLS = [
  '🍎','🍊','🍋','🍇','🍉','🍓','🍒','🥝','🍌','🍑',
  '🌟','🌙','☀️','⚡','🔥','💧','🌈','❄️','🍀','🌸',
  '🐶','🐱','🐸','🐵','🐔','🐙','🦋','🐝','🐢','🐬',
  '⚽','🏀','🎾','🎯','🎲','🎸','🎨','📚','✏️','🔔',
]

function TwinHuntApp({ onBack }) {
  // Number of symbols per panel (default 5, configurable 3-15)
  const [count, setCount] = useState('5')
  // Game started flag
  const [started, setStarted] = useState(false)
  // Game finished flag
  const [finished, setFinished] = useState(false)
  // Current round number (1-indexed)
  const [round, setRound] = useState(0)
  // Total rounds to complete
  const [totalRounds, setTotalRounds] = useState(10)
  // User input for number of rounds (string to allow editing)
  const [numRoundsInput, setNumRoundsInput] = useState('10')
  // Number of correct matches found so far
  const [score, setScore] = useState(0)
  // Array of symbols on left panel (includes common symbol + unique ones)
  const [leftItems, setLeftItems] = useState([])
  // Array of symbols on right panel (includes common symbol + unique ones)
  const [rightItems, setRightItems] = useState([])
  // The symbol that appears in both panels (the "match" to find)
  const [commonSymbol, setCommonSymbol] = useState('')
  // Feedback message after user picks a symbol
  const [feedback, setFeedback] = useState('')
  // Is the user's pick correct? (null before pick, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // Round revealed/answered flag (disables further picks)
  const [revealed, setRevealed] = useState(false)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking time per round
  const timer = useTimer()

  /**
   * scatterPositions(n): Generate random scattered positions for n symbols in circular area
   * Algorithm:
   *   1. Place first symbol near center (50%, 50%) with small jitter
   *   2. Distribute remaining (n-1) symbols in a ring around center
   *      - Use equal angular spacing plus random jitter
   *      - Radius: 28-38% of container width from center
   *   3. Clamp all positions to 10-90% to keep in bounds
   *   4. Shuffle array so visual order doesn't reveal which is centered
   * Returns: Array of {x, y} percentages (0-100)
   */
  const scatterPositions = (n) => {
    const positions = []
    // Place first item near center with small random jitter (±6%)
    positions.push({
      x: 50 + (Math.random() - 0.5) * 12,
      y: 50 + (Math.random() - 0.5) * 12,
    })
    // Distribute remaining items in ring pattern
    const remaining = n - 1
    const baseAngleOffset = Math.random() * Math.PI * 2  // Random starting angle
    for (let i = 0; i < remaining; i++) {
      // Equal angular spacing plus small random jitter
      const angle = baseAngleOffset + (i / remaining) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      // Radius: 28-38% from center (adds visual spacing)
      const radius = 28 + Math.random() * 10
      const x = 50 + Math.cos(angle) * radius
      const y = 50 + Math.sin(angle) * radius
      // Clamp to bounds (10-90% to keep items visible in container)
      positions.push({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) })
    }
    // Fisher-Yates shuffle to obscure that first item is at center
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]]
    }
    return positions
  }

  // Cached position arrays for left and right panels
  const [leftPositions, setLeftPositions] = useState([])
  const [rightPositions, setRightPositions] = useState([])

  /**
   * generateRound(n): Generate a new round with n symbols per panel
   * Algorithm:
   *   1. Shuffle TWIN_SYMBOLS pool and select 2n-1 unique symbols
   *   2. First symbol is the "common" match (appears in both panels)
   *   3. Next n-1 symbols are unique to left panel
   *   4. Next n-1 symbols are unique to right panel
   *   5. Shuffle each panel's list independently for visual variety
   *   6. Generate random scattered positions for each panel
   * Resets feedback/reveal and starts timer for the round
   */
  const generateRound = (n) => {
    // Shuffle symbol pool and select 2n-1 unique symbols
    const pool = [...TWIN_SYMBOLS].sort(() => Math.random() - 0.5)
    const common = pool[0]  // Symbol that will appear in both panels
    const leftOthers = pool.slice(1, n)  // n-1 unique to left
    const rightOthers = pool.slice(n, 2 * n - 1)  // n-1 unique to right

    // Fisher-Yates shuffle for unbiased randomization
    const shuffle = (arr) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    // Create shuffled panels (each includes common symbol + unique ones)
    const left = shuffle([common, ...leftOthers])
    const right = shuffle([common, ...rightOthers])
    setLeftItems(left)
    setRightItems(right)
    setLeftPositions(scatterPositions(left.length))
    setRightPositions(scatterPositions(right.length))
    setCommonSymbol(common)
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    timer.start()
  }

  /**
   * startGame(): Initialize twin hunt game
   * Process:
   *   1. Validate and clamp symbols per panel (3-15 range)
   *   2. Validate and parse number of rounds (minimum 1)
   *   3. Reset game state
   *   4. Generate first round
   */
  const startGame = () => {
    // Clamp symbols per panel to 3-15 range
    const n = Math.max(3, Math.min(Number(count) || 5, 15))
    setCount(String(n))
    // Parse rounds count (default 10 if invalid)
    const rounds = numRoundsInput !== '' && Number(numRoundsInput) > 0 ? Number(numRoundsInput) : 10
    setTotalRounds(rounds)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setRound(1)
    setResults([])
    generateRound(n)
  }

  /**
   * handlePick(symbol): Process user's symbol pick
   * When user clicks a symbol:
   *   1. Check if it matches the common symbol
   *   2. Stop timer and store time
   *   3. Show feedback and store result
   *   4. Reveal answer (disable further picks this round)
   * Note: Each panel can have the match clicked, either is correct
   */
  const handlePick = (symbol) => {
    if (revealed) return  // Ignore picks after round already answered
    const timeTaken = timer.stop()
    const correct = symbol === commonSymbol
    if (correct) setScore((s) => s + 1)
    setIsCorrect(correct)
    setFeedback(correct
      ? `Correct! ${commonSymbol} was the match.`
      : `Wrong — you picked ${symbol}. The match was ${commonSymbol}.`)
    setResults((prev) => [...prev, {
      question: `Round ${round}`,
      userAnswer: symbol,
      correctAnswer: commonSymbol,
      correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * Auto-advance to next round after correct answer (uses useAutoAdvance hook)
   * Progression logic:
   *   - If current round >= total rounds: finish game
   *   - Otherwise: increment round and generate next round with same symbol count
   * Ref is used to capture latest state for the hook
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = () => {
    if (round >= totalRounds) {
      setFinished(true)
      timer.reset()
      return
    }
    setRound((r) => r + 1)
    generateRound(Number(count))
  }
  useAutoAdvance(revealed, advanceRef, isCorrect)

  return (
    <QuizLayout title="Twin Hunt" subtitle="Find the common object in both panels" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      {!started && !finished && (
        <div className="welcome-box">
          <p className="welcome-text">Two panels, one match. Tap the common object!</p>
          <div className="question-count-row">
            <label className="question-count-label">Objects per panel</label>
            <input className="answer-input question-count-input" type="text" value={count}
              onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setCount(v) }}
              placeholder="5" />
          </div>
          <div className="question-count-row">
            <label className="question-count-label">How many rounds?</label>
            <input className="answer-input question-count-input" type="text" value={numRoundsInput}
              onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumRoundsInput(v) }}
              placeholder="10" />
          </div>
          <div className="button-row">
            <button onClick={startGame}>Start Game</button>
          </div>
        </div>
      )}
      {started && !finished && <>
        <div className="progress-pill center">Round {round}/{totalRounds}</div>
        <div className="twin-panels">
          <div className="twin-panel">
            <div className="twin-circle">
              {leftItems.map((sym, i) => (
                <button key={i} type="button"
                  className={`twin-item ${revealed && sym === commonSymbol ? 'twin-match' : ''} ${revealed && sym !== commonSymbol ? 'twin-dim' : ''}`}
                  style={leftPositions[i] ? { left: `${leftPositions[i].x}%`, top: `${leftPositions[i].y}%` } : {}}
                  onClick={() => handlePick(sym)} disabled={revealed}>
                  {sym}
                </button>
              ))}
            </div>
          </div>
          <div className="twin-divider"></div>
          <div className="twin-panel">
            <div className="twin-circle">
              {rightItems.map((sym, i) => (
                <button key={i} type="button"
                  className={`twin-item ${revealed && sym === commonSymbol ? 'twin-match' : ''} ${revealed && sym !== commonSymbol ? 'twin-dim' : ''}`}
                  style={rightPositions[i] ? { left: `${rightPositions[i].x}%`, top: `${rightPositions[i].y}%` } : {}}
                  onClick={() => handlePick(sym)} disabled={revealed}>
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Game complete!</p>
        <p className="final-score">Score: {score}/{totalRounds}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
      {started && !finished && results.length > 0 && <ResultsTable results={results} />}
    </QuizLayout>
  )
}

/* ── Square Root App ─────────────────────────────────── */
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
function SqrtApp({ onBack }) {
  // User-entered question limit (empty string = unlimited)
  const [numQuestions, setNumQuestions] = useState('')
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
  // Total questions (0 = unlimited)
  const [totalQ, setTotalQ] = useState(0)
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
  // Timer instance for tracking time per question
  const timer = useTimer()

  /**
   * fetchQuestion(step): Fetch next square root question
   * Endpoint: /sqrt-api/question?step={questionNumber}
   * Returns: {q: radicand, prompt: "√n"}
   * Backend calculates sqrtRounded, floorAnswer, ceilAnswer for validation
   */
  const fetchQuestion = async (step) => {
    setLoading(true)
    setAnswer('')
    setFeedback('')
    setRevealed(false)
    setIsCorrect(null)
    // Fetch question for this step/question number
    const res = await fetch(`${API}/sqrt-api/question?step=${step}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize square root quiz
   * Sets totalQ=0 for unlimited mode (if user leaves input empty)
   * Fetches first question with step=1
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : 0
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    await fetchQuestion(1)
  }

  // unlimited mode: totalQ === 0 means no limit
  const unlimited = totalQ === 0

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
      const res = await fetch(`${API}/sqrt-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: question.q, answer: Number(answer) }),
      })
      const data = await res.json()
      setIsCorrect(data.correct)
      if (data.correct) setScore((s) => s + 1)
      // Show floor and ceiling values for reference
      const reasoning = `√${question.q} = ${data.sqrtRounded}\n⌊${data.sqrtRounded}⌋ = ${data.floorAnswer}, ⌈${data.sqrtRounded}⌉ = ${data.ceilAnswer}`
      setFeedback(data.correct
        ? `Correct!\n${reasoning}`
        : `Incorrect.\n${reasoning}\nAcceptable answers: ${data.floorAnswer} or ${data.ceilAnswer}`)
      setResults((prev) => [...prev, {
        question: `√${question.q}`,
        userAnswer: answer,
        correctAnswer: `${data.floorAnswer} or ${data.ceilAnswer}`,
        correct: data.correct,
        time: timeTaken,
      }])
      setRevealed(true)
      return
    }

    // Quiz progression: check if limited mode and all questions answered
    if (!unlimited && questionNumber >= totalQ) {
      setFinished(true)
      setQuestion(null)
      timer.reset()
      return
    }

    // Load next question (unlimited mode continues indefinitely)
    const next = questionNumber + 1
    setQuestionNumber(next)
    await fetchQuestion(next)
  }

  const advanceRef = useRef(() => {})
  advanceRef.current = () => handleSubmitOrNext()
  useAutoAdvance(revealed, advanceRef, isCorrect)

  return (
    <QuizLayout title="Square Root" subtitle="Floor or ceiling is accepted" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">The square-root drill.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} placeholder="Unlimited" />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Drill</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}{!unlimited ? `/${totalQ}` : ''}</div>
        <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
        <input className="answer-input" type="text" value={answer} onChange={(e) => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" />
        <NumPad value={answer} onChange={(v) => !revealed && setAnswer(v)} disabled={revealed} />
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row"><button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>{revealed ? (!unlimited && questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question') : 'Submit'}</button></div>
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete.</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false); setNumQuestions('') }}>Play Again</button>
      </div>}
      {!finished && results.length > 0 && <ResultsTable results={results} />}
    </QuizLayout>
  )
}

/* ── Polynomial Multiplication App ──────────────────── */
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
function PolyMulApp({ onBack }) {
  // Difficulty level: 'easy' | 'medium' | 'hard'
  const [difficulty, setDifficulty] = useState('easy')
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
  // Timer instance for tracking time per question
  const timer = useTimer()

  /**
   * loadQuestion(): Fetch next polynomial multiplication question
   * Endpoint: /polymul-api/question?difficulty={easy|medium|hard}
   * Returns: {p1, p2, p1Display, p2Display, productDisplay, resultDegree, correctCoeffs}
   * Initializes userCoeffs array with empty strings (one per degree)
   */
  const loadQuestion = async () => {
    setLoading(true)
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)
    const res = await fetch(`${API}/polymul-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    // Initialize empty coefficient array for this polynomial's degree
    setUserCoeffs(new Array(data.resultDegree + 1).fill(''))
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize polynomial multiplication quiz
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    setStarted(true)
    setFinished(false)
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
    // POST to backend to validate polynomial multiplication result
    const res = await fetch(`${API}/polymul-api/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p1: question.p1, p2: question.p2, userCoeffs: userCoeffs.map(Number) }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1)
    setFeedback(data.correct ? `Correct! ${question.productDisplay}` : `Incorrect. Answer: ${data.correctDisplay}`)
    setResults(prev => [...prev, {
      question: `(${question.p1Display})(${question.p2Display})`,
      userAnswer: userCoeffs.join(', '),
      correctAnswer: data.correctCoeffs.join(', '),
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * Auto-advance to next question after correct answer (uses useAutoAdvance hook)
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

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

  return (
    <QuizLayout title="Poly Multiply" subtitle="Multiply two polynomials and enter the coefficients" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Multiply two polynomials and fill in the resulting coefficients.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
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
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading || (!revealed && userCoeffs.some(c => c === ''))}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Polynomial Factorization App ──────────────────── */
/**
 * PolyFactorApp Component
 * Polynomial factorization practice: Factor a polynomial into two linear factors
 * Features:
 *   - Questions of form: ax² + bx + c = (px + q)(rx + s)
 *   - User enters p, q, r, s coefficients for the two factors
 *   - Difficulty levels: easy, medium, hard (control polynomial complexity)
 *   - Validates that product of factors equals original polynomial
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function PolyFactorApp({ onBack }) {
  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' | 'medium' | 'hard'
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {originalPoly, display, a, b, c, factors: {p, q, r, s}}
  const [question, setQuestion] = useState(null)
  // Coefficient p for first factor (px + q)
  const [userP, setUserP] = useState('')
  // Coefficient q for first factor
  const [userQ, setUserQ] = useState('')
  // Coefficient r for second factor (rx + s)
  const [userR, setUserR] = useState('')
  // Coefficient s for second factor
  const [userS, setUserS] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  /**
   * loadQuestion(): Fetch next polynomial factorization question
   * Endpoint: /polyfactor-api/question?difficulty={easy|medium|hard}
   * Returns: {a, b, c, display, factors: {p, q, r, s}, ...}
   * Resets all factor fields to empty and initializes timer
   */
  const loadQuestion = async () => {
    setLoading(true)
    // Reset all four factor coefficient fields and feedback
    setUserP(''); setUserQ(''); setUserR(''); setUserS('')
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Fetch polynomial question from backend based on difficulty
    const res = await fetch(`${API}/polyfactor-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    // Start timer for this question
    timer.start()
  }

  /**
   * startQuiz(): Initialize polynomial factorization quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit factor coefficients for polynomial factorization
   * Requirements:
   *   - All four coefficients (p, q, r, s) must be filled
   *   - Question must be loaded
   *   - Answer must not already be revealed
   * Validation: Checks that (userP*x + userQ)(userR*x + userS) = a*x² + b*x + c
   * API: POSTs to /polyfactor-api/check with coefficient values
   * Response: {correct: boolean}
   */
  const handleSubmit = async () => {
    if (!question || revealed) return
    // Validate: all four factor coefficients must be entered
    if (!userP || !userQ || !userR || !userS) return
    const timeTaken = timer.stop()
    // POST to backend to validate factorization
    const res = await fetch(`${API}/polyfactor-api/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: question.a, b: question.b, c: question.c, userP: Number(userP), userQ: Number(userQ), userR: Number(userR), userS: Number(userS) }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    // Increment score if correct
    if (data.correct) setScore(s => s + 1)
    // Format feedback message using correct factors (p, q, r, s from question.factors)
    const { p, q, r, s } = question.factors
    setFeedback(data.correct ? `Correct! (${p}x ${q >= 0 ? '+' : '−'} ${Math.abs(q)})(${r}x ${s >= 0 ? '+' : '−'} ${Math.abs(s)})` : `Incorrect. One factorization: (${p}x ${q >= 0 ? '+' : '−'} ${Math.abs(q)})(${r}x ${s >= 0 ? '+' : '−'} ${Math.abs(s)})`)
    // Add result to history for results table
    setResults(prev => [...prev, {
      question: question.display,
      userAnswer: `(${userP}x${Number(userQ)>=0?'+':''}${userQ})(${userR}x${Number(userS)>=0?'+':''}${userS})`,
      correctAnswer: `(${p}x${q>=0?'+':''}${q})(${r}x${s>=0?'+':''}${s})`,
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * valInput(setter): Create input change handler for factor coefficient fields
   * Validates input: empty string, minus sign, or integer format only (-?\d+)
   * Returns onChange handler that updates the given state setter
   * Usage: onChange={valInput(setUserP)}
   */
  const valInput = (setter) => (e) => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) setter(v) }

  return (
    <QuizLayout title="Poly Factor" subtitle="Factor the quadratic into (px + q)(rx + s)" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Factor ax² + bx + c into (px + q)(rx + s).</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        {question && <>
          <div className="question-box">{question.display} = 0</div>
          <div className="factor-inputs">
            <span className="factor-group">(</span>
            <input className="answer-input factor-input" type="text" value={userP} onChange={valInput(setUserP)} disabled={revealed} placeholder="p" onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            <span className="factor-group">x +</span>
            <input className="answer-input factor-input" type="text" value={userQ} onChange={valInput(setUserQ)} disabled={revealed} placeholder="q" onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            <span className="factor-group">)(</span>
            <input className="answer-input factor-input" type="text" value={userR} onChange={valInput(setUserR)} disabled={revealed} placeholder="r" onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            <span className="factor-group">x +</span>
            <input className="answer-input factor-input" type="text" value={userS} onChange={valInput(setUserS)} disabled={revealed} placeholder="s" onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            <span className="factor-group">)</span>
          </div>
        </>}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`} style={{whiteSpace:'pre-line'}}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading || (!revealed && (!userP || !userQ || !userR || !userS))}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Prime Factorization App ───────────────────────── */
/**
 * PrimeFactorApp Component
 * Prime factorization drill: "Find all prime factors of n"
 * Features:
 *   - User enters prime factors one at a time (must be valid divisors)
 *   - Tracks remaining value after each factor is entered
 *   - Auto-checks answer when remaining value reaches 1 (all factors found)
 *   - Displays factors in sorted order, allows "Give Up" option
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function PrimeFactorApp({ onBack }) {
  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' | 'medium' | 'hard' (affects size of numbers)
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {number: n, factors: [p1, p2, ...]}
  const [question, setQuestion] = useState(null)
  // Array of factors user has entered so far (e.g., [2, 3, 5])
  const [enteredFactors, setEnteredFactors] = useState([])
  // Current input field value (before "Add Factor" button is clicked)
  const [currentInput, setCurrentInput] = useState('')
  // Remaining number after dividing out all entered factors (n / product of entered)
  const [remaining, setRemaining] = useState(0)
  // Feedback message shown after all factors are found or user gives up
  const [feedback, setFeedback] = useState('')
  // Is the factorization correct/complete? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Factorization revealed/completed flag (prevents further input)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  /**
   * loadQuestion(): Fetch next prime factorization question
   * Endpoint: /primefactor-api/question?difficulty={easy|medium|hard}
   * Returns: {number: n, factors: [p1, p2, ...] (sorted)}
   * Initializes with number and sets remaining = number
   * Resets input fields and timer before starting
   */
  const loadQuestion = async () => {
    // Reset feedback and UI state
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Reset factor input fields
    setEnteredFactors([]); setCurrentInput('')
    // Fetch prime factorization question from backend based on difficulty
    const res = await fetch(`${API}/primefactor-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    // Start with full number; it gets divided as factors are found
    setRemaining(data.number)
    timer.start()
  }

  /**
   * startQuiz(): Initialize prime factorization quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await loadQuestion()
  }

  /**
   * addFactor(): Add user-entered factor to list if valid
   * Validation:
   *   - Factor must be >= 2
   *   - Must evenly divide remaining number (no remainder)
   * Action:
   *   - Add to enteredFactors array
   *   - Update remaining = remaining / factor
   *   - Clear input field
   *   - If remaining becomes 1: all factors found, auto-check answer
   * Auto-check logic:
   *   - Compare sorted user factors against question.factors
   *   - Increment score if correct
   *   - Store result and mark revealed
   */
  const addFactor = () => {
    const f = Number(currentInput)
    // Validate: factor >= 2 and divides remaining evenly
    if (!f || f < 2 || remaining % f !== 0) return
    const newFactors = [...enteredFactors, f]
    const newRemaining = remaining / f
    setEnteredFactors(newFactors)
    setRemaining(newRemaining)
    setCurrentInput('')
    // Auto-check when factorization is complete (remaining = 1)
    if (newRemaining === 1) {
      const timeTaken = timer.stop()
      // Sort user's factors and compare to correct factors
      const sorted = [...newFactors].sort((a, b) => a - b)
      const correct = question.factors.length === sorted.length && question.factors.every((v, i) => v === sorted[i])
      setIsCorrect(correct)
      if (correct) setScore(s => s + 1)
      setFeedback(correct ? `Correct! ${question.number} = ${question.factors.join(' × ')}` : `Incorrect. ${question.number} = ${question.factors.join(' × ')}`)
      // Add result to history for results table
      setResults(prev => [...prev, {
        question: String(question.number),
        userAnswer: newFactors.join(' × '),
        correctAnswer: question.factors.join(' × '),
        correct,
        time: timeTaken,
      }])
      setRevealed(true)
    }
  }

  /**
   * handleGiveUp(): Mark answer as incomplete and reveal correct factorization
   * Records incomplete attempt in results as incorrect
   * Allows user to move to next question without finishing factorization
   */
  const handleGiveUp = () => {
    const timeTaken = timer.stop()
    setIsCorrect(false)
    setFeedback(`${question.number} = ${question.factors.join(' × ')}`)
    // Record partial attempt (shows ellipsis if some factors entered)
    setResults(prev => [...prev, {
      question: String(question.number),
      userAnswer: enteredFactors.length ? enteredFactors.join(' × ') + ' ...' : '—',
      correctAnswer: question.factors.join(' × '),
      correct: false,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * buildChain(): Construct display string showing factorization progress
   * Format: "120 = 2 × 3 × 5 × 2" (shows what user has found so far)
   * If no factors entered: just shows the number "120"
   * If factorization incomplete: shows remaining unfactored portion "120 = 2 × 60"
   */
  const buildChain = () => {
    if (enteredFactors.length === 0) return String(question?.number || '')
    // Build expression: number = factor1 × factor2 × ... × remaining
    const parts = [String(question.number), '=', ...enteredFactors.flatMap((f, i) => i === 0 ? [String(f)] : ['×', String(f)])]
    // Append remaining unfactored portion if > 1
    if (remaining > 1) parts.push('×', String(remaining))
    return parts.join(' ')
  }

  return (
    <QuizLayout title="Prime Factors" subtitle="Break the number into its prime factors" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Enter prime factors one at a time. Watch the remaining number shrink!</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        {question && <>
          <div className="question-box prime-chain">{buildChain()}</div>
          {!revealed && remaining > 1 && <div className="prime-input-row">
            <input className="answer-input" type="text" value={currentInput} placeholder="Enter a prime factor"
              onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setCurrentInput(v) }}
              onKeyDown={e => { if (e.key === 'Enter') addFactor() }} autoFocus />
            <button onClick={addFactor} disabled={!currentInput}>Add</button>
            <button className="give-up-btn" onClick={handleGiveUp}>Give Up</button>
          </div>}
          <NumPad value={currentInput} onChange={setCurrentInput} onSubmit={addFactor} disabled={revealed || remaining <= 1} />
        </>}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        {revealed && <div className="button-row">
          <button onClick={() => advanceRef.current()}>{questionNumber >= totalQ ? 'Finish' : 'Next'}</button>
        </div>}
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Quadratic Formula App ─────────────────────────── */
/**
 * QFormulaApp Component
 * Quadratic formula practice: Find roots of ax² + bx + c = 0
 * Features:
 *   - Easy: real distinct integer roots
 *   - Medium: real roots (may be decimal)
 *   - Hard: may include complex roots (a ± bi)
 *   - Root type determines how many values user needs to enter
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function QFormulaApp({ onBack }) {
  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' | 'medium' | 'hard'
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {a, b, c, roots: {type: 'real_distinct'|'real_equal'|'complex', r1, r2, ...}}
  const [question, setQuestion] = useState(null)
  // User's first root value (or real part for complex)
  const [userR1, setUserR1] = useState('')
  // User's second root value (or imaginary part for complex, required for distinct roots)
  const [userR2, setUserR2] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  /**
   * loadQuestion(): Fetch next quadratic formula question
   * Endpoint: /qformula-api/question?difficulty={easy|medium|hard}
   * Returns: {a, b, c, roots: {type, r1, r2, realPart, imagPart}}
   * Type determines required fields:
   *   - real_distinct: r1, r2 (two different real roots)
   *   - real_equal: r1 (one repeated root)
   *   - complex: realPart, imagPart (roots are a ± bi)
   */
  const loadQuestion = async () => {
    setLoading(true)
    // Reset root input fields
    setUserR1(''); setUserR2('')
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Fetch quadratic formula question from backend based on difficulty
    const res = await fetch(`${API}/qformula-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize quadratic formula quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit root values for quadratic formula
   * Validation depends on root type:
   *   - real_equal: only r1 required
   *   - real_distinct: both r1 and r2 required
   *   - complex: both r1 (real) and r2 (imaginary) required
   * API: POSTs to /qformula-api/check with coefficient values and root type
   * Response: {correct: boolean, roots: {type, r1, r2, realPart, imagPart, ...}}
   */
  const handleSubmit = async () => {
    if (!question || revealed || !userR1) return
    // For real_distinct and complex, need both root values
    if (question.roots.type === 'real_distinct' && !userR2) return
    if (question.roots.type === 'complex' && !userR2) return
    const timeTaken = timer.stop()
    // POST to backend to validate roots
    const res = await fetch(`${API}/qformula-api/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: question.a, b: question.b, c: question.c, userR1: Number(userR1), userR2: Number(userR2), userType: question.roots.type }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1)
    // Format correct answer display based on root type
    let correctStr = ''
    if (data.roots.type === 'real_distinct') correctStr = `Roots: ${data.roots.r1} and ${data.roots.r2}`
    else if (data.roots.type === 'real_equal') correctStr = `Root: ${data.roots.r1} (repeated)`
    else correctStr = `Roots: ${data.roots.realPart} ± ${data.roots.imagPart}i`
    setFeedback(data.correct ? `Correct! ${correctStr}` : `Incorrect. ${correctStr}`)
    // Add result to history for results table
    setResults(prev => [...prev, {
      question: `${question.a}x² ${question.b>=0?'+':'−'} ${Math.abs(question.b)}x ${question.c>=0?'+':'−'} ${Math.abs(question.c)} = 0`,
      userAnswer: question.roots.type === 'real_equal' ? userR1 : `${userR1}, ${userR2}`,
      correctAnswer: correctStr,
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * valInput(setter): Create input change handler for root value fields
   * Validates input: empty string, minus sign, decimal point, or decimal number format (-?\d*\.?\d*)
   * Returns onChange handler that updates the given state setter
   * Usage: onChange={valInput(setUserR1)}
   */
  const valInput = (setter) => (e) => { const v = e.target.value; if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setter(v) }

  return (
    <QuizLayout title="Quadratic Formula" subtitle="Find the roots of ax² + bx + c = 0" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">{difficulty === 'easy' ? 'Integer roots only.' : difficulty === 'medium' ? 'Real roots (integer or decimal).' : 'May include complex roots.'}</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        {question && <>
          <div className="question-box">{question.a}x² {question.b >= 0 ? '+' : '−'} {Math.abs(question.b)}x {question.c >= 0 ? '+' : '−'} {Math.abs(question.c)} = 0</div>
          <div className="roots-inputs">
            {question.roots.type === 'complex' ? <>
              <div className="coeff-field"><label className="coeff-label">Real part</label>
                <input className="answer-input coeff-input" type="text" value={userR1} onChange={valInput(setUserR1)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
              <div className="coeff-field"><label className="coeff-label">Imaginary part</label>
                <input className="answer-input coeff-input" type="text" value={userR2} onChange={valInput(setUserR2)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            </> : question.roots.type === 'real_equal' ? <>
              <div className="coeff-field"><label className="coeff-label">Root (repeated)</label>
                <input className="answer-input coeff-input" type="text" value={userR1} onChange={valInput(setUserR1)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            </> : <>
              <div className="coeff-field"><label className="coeff-label">Root 1</label>
                <input className="answer-input coeff-input" type="text" value={userR1} onChange={valInput(setUserR1)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
              <div className="coeff-field"><label className="coeff-label">Root 2</label>
                <input className="answer-input coeff-input" type="text" value={userR2} onChange={valInput(setUserR2)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            </>}
          </div>
        </>}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading || (!revealed && !userR1)}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Simultaneous Equations App (2×2 easy, 3×3 hard) ── */
/**
 * SimulApp Component
 * Simultaneous equations practice: Solve 2×2 or 3×3 systems
 * Features:
 *   - Easy: 2×2 systems (solve for x and y)
 *   - Hard: 3×3 systems (solve for x, y, and z)
 *   - Validates solution against provided system of equations
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function SimulApp({ onBack }) {
  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' (2×2) | 'hard' (3×3)
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {size: 2|3, eqs: [{a, b, c, d}, ...], solution: {x, y, z}}
  const [question, setQuestion] = useState(null)
  // User's solution for x variable
  const [userX, setUserX] = useState('')
  // User's solution for y variable
  const [userY, setUserY] = useState('')
  // User's solution for z variable (only for 3×3 systems)
  const [userZ, setUserZ] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  // ─────── Derived State ──────────────────────────────────
  // Whether current question is 3×3 (determines if z field is required)
  const is3x3 = question && question.size === 3

  /**
   * loadQuestion(): Fetch next simultaneous equations question
   * Endpoint: /simul-api/question?difficulty={easy|hard}
   * Returns: {size: 2|3, eqs: [{a, b, c, d}, ...], solution: {x, y, z}}
   * Equations format:
   *   - 2×2: ax + by = d (two equations, two unknowns)
   *   - 3×3: ax + by + cz = d (three equations, three unknowns)
   */
  const loadQuestion = async () => {
    setLoading(true)
    // Reset solution input fields
    setUserX(''); setUserY(''); setUserZ('')
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Fetch simultaneous equations question from backend based on difficulty
    const res = await fetch(`${API}/simul-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize simultaneous equations quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit solution values for simultaneous equations
   * Validation:
   *   - For 2×2: x and y required
   *   - For 3×3: x, y, and z required
   * API: POSTs to /simul-api/check with equations, size, and solution values
   * Response: {correct: boolean}
   */
  const handleSubmit = async () => {
    if (!question || revealed || !userX || !userY) return
    // For 3×3 systems, z is also required
    if (is3x3 && !userZ) return
    const timeTaken = timer.stop()
    // Build request body with solution values
    const body = { eqs: question.eqs, size: question.size, solution: question.solution, userX: Number(userX), userY: Number(userY) }
    if (is3x3) body.userZ = Number(userZ)
    // POST to backend to validate solution
    const res = await fetch(`${API}/simul-api/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1)
    // Format feedback message and result based on system size
    const s = question.solution
    if (is3x3) {
      setFeedback(data.correct ? `Correct! (x, y, z) = (${s.x}, ${s.y}, ${s.z})` : `Incorrect. (x, y, z) = (${s.x}, ${s.y}, ${s.z})`)
      setResults(prev => [...prev, { question: '3×3 system', userAnswer: `(${userX}, ${userY}, ${userZ})`, correctAnswer: `(${s.x}, ${s.y}, ${s.z})`, correct: data.correct, time: timeTaken }])
    } else {
      setFeedback(data.correct ? `Correct! (x, y) = (${s.x}, ${s.y})` : `Incorrect. (x, y) = (${s.x}, ${s.y})`)
      setResults(prev => [...prev, { question: '2×2 system', userAnswer: `(${userX}, ${userY})`, correctAnswer: `(${s.x}, ${s.y})`, correct: data.correct, time: timeTaken }])
    }
    setRevealed(true)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * valInput(setter): Create input change handler for solution value fields
   * Validates input: empty string, minus sign, decimal point, or decimal number format (-?\d*\.?\d*)
   * Returns onChange handler that updates the given state setter
   * Usage: onChange={valInput(setUserX)}
   */
  const valInput = (setter) => (e) => { const v = e.target.value; if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setter(v) }
  /**
   * fmtEq2(eq): Format 2×2 equation for display
   * Input: {a, b, d} (coefficients from ax + by = d)
   * Output: "2x + 3y = 5" or "2x − 3y = 5" (uses minus sign character)
   */
  const fmtEq2 = (eq) => `${eq.a}x ${eq.b >= 0 ? '+' : '−'} ${Math.abs(eq.b)}y = ${eq.d}`
  /**
   * fmtEq3(eq): Format 3×3 equation for display
   * Input: {a, b, c, d} (coefficients from ax + by + cz = d)
   * Output: "2x + 3y − 4z = 5" (uses minus sign character for negatives)
   */
  const fmtEq3 = (eq) => `${eq.a}x ${eq.b >= 0 ? '+' : '−'} ${Math.abs(eq.b)}y ${eq.c >= 0 ? '+' : '−'} ${Math.abs(eq.c)}z = ${eq.d}`

  const subtitle = difficulty === 'easy' ? 'Solve the 2×2 system' : 'Solve the 3×3 system'
  const welcomeText = difficulty === 'easy'
    ? 'Solve for x and y in two simultaneous equations.'
    : 'Solve for x, y, and z in three simultaneous equations.'

  return (
    <QuizLayout title="Simultaneous Eq." subtitle={subtitle} onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d === 'easy' ? 'Easy (2×2)' : 'Hard (3×3)'}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">{welcomeText}</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        {question && <>
          <div className="question-box equation-system">
            {question.eqs.map((eq, i) => <div key={i}>{is3x3 ? fmtEq3(eq) : fmtEq2(eq)}</div>)}
          </div>
          <div className="roots-inputs">
            <div className="coeff-field"><label className="coeff-label">x =</label>
              <input className="answer-input coeff-input" type="text" value={userX} onChange={valInput(setUserX)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            <div className="coeff-field"><label className="coeff-label">y =</label>
              <input className="answer-input coeff-input" type="text" value={userY} onChange={valInput(setUserY)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            {is3x3 && <div className="coeff-field"><label className="coeff-label">z =</label>
              <input className="answer-input coeff-input" type="text" value={userZ} onChange={valInput(setUserZ)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>}
          </div>
        </>}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading || (!revealed && (!userX || !userY || (is3x3 && !userZ)))}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Function Evaluation App ───────────────────────── */
/**
 * FuncEvalApp Component
 * Function evaluation practice: Evaluate f(x, y, z, ...) = ax + by + cz + ...
 * Features:
 *   - Easy: 1 variable (f(x) = ax + b)
 *   - Medium: 2 variables (f(x, y) = ax + by + c)
 *   - Hard: 3 variables (f(x, y, z) = ax + by + cz + d)
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function FuncEvalApp({ onBack }) {
  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' | 'medium' | 'hard' (number of variables)
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {formula: "2x + 3y + 1", vars: {x: 2, y: 3}, answer: 10}
  const [question, setQuestion] = useState(null)
  // User's answer (the result of the function evaluation)
  const [answer, setAnswer] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  /**
   * loadQuestion(): Fetch next function evaluation question
   * Endpoint: /funceval-api/question?difficulty={easy|medium|hard}
   * Returns: {formula: "2x + 3", vars: {x: 5}, answer: 13}
   */
  const loadQuestion = async () => {
    setLoading(true)
    setAnswer('')
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Fetch function evaluation question from backend based on difficulty
    const res = await fetch(`${API}/funceval-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize function evaluation quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit function evaluation answer
   * Validation: answer must be filled
   * API: POSTs to /funceval-api/check with correct answer and user's answer
   * Compares numerical values (allows for floating point tolerance)
   */
  const handleSubmit = async () => {
    if (!question || revealed || !answer) return
    const timeTaken = timer.stop()
    // POST to backend to validate function evaluation
    const res = await fetch(`${API}/funceval-api/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: question.answer, userAnswer: Number(answer) }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1)
    // Format variable string for feedback (e.g., "x=2, y=3")
    const varStr = Object.entries(question.vars).map(([k, v]) => `${k}=${v}`).join(', ')
    setFeedback(data.correct ? `Correct! f(${varStr}) = ${data.correctAnswer}` : `Incorrect. f(${varStr}) = ${data.correctAnswer}`)
    // Add result to history for results table
    setResults(prev => [...prev, {
      question: `${question.formula}, ${varStr}`,
      userAnswer: answer,
      correctAnswer: String(data.correctAnswer),
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  // Format variable string for display in question (e.g., "x = 2, y = 3")
  const varStr = question ? Object.entries(question.vars).map(([k, v]) => `${k} = ${v}`).join(', ') : ''

  return (
    <QuizLayout title="Functions" subtitle="Evaluate the function at the given values" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {[{k:'easy',l:'1 variable'},{k:'medium',l:'2 variables'},{k:'hard',l:'3 variables'}].map(({k,l}) => (
          <label key={k} className={`radio-pill ${difficulty === k ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === k} onChange={() => setDifficulty(k)} disabled={started && !finished} />
            {l}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Evaluate linear functions of 1, 2, or 3 variables.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        {question && <>
          <div className="question-box">
            <div>{question.formula}</div>
            <div className="given">Given: {varStr}</div>
          </div>
          <div className="single-input-row">
            <label className="coeff-label">f = </label>
            <input className="answer-input" type="text" value={answer} disabled={revealed}
              onChange={e => { const v = e.target.value; if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setAnswer(v) }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} autoFocus />
          </div>
          <NumPad value={answer} onChange={setAnswer} onSubmit={handleSubmit} disabled={revealed} />
        </>}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading || (!revealed && !answer)}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Line Equation App ─────────────────────────────── */
/**
 * LineEqApp Component
 * Line equation practice: Find y = mx + c from two points
 * Given points (x1, y1) and (x2, y2), find slope m and y-intercept c
 * Calculation:
 *   m = (y2 - y1) / (x2 - x1)  [slope]
 *   c = y1 - m*x1             [y-intercept]
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function LineEqApp({ onBack }) {
  // ─────── Quiz State Management ──────────────────────────────────
  // Difficulty level: 'easy' | 'medium' | 'hard' (affects slope/intercept values)
  const [difficulty, setDifficulty] = useState('easy')
  // Number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  // Quiz started flag (controls welcome screen vs quiz content)
  const [started, setStarted] = useState(false)
  // Quiz finished flag (controls results screen)
  const [finished, setFinished] = useState(false)
  // Current question: {x1, y1, x2, y2}
  const [question, setQuestion] = useState(null)
  // User's slope value (m in y = mx + c)
  const [userM, setUserM] = useState('')
  // User's y-intercept value (c in y = mx + c)
  const [userC, setUserC] = useState('')
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // Current question number (1-indexed)
  const [questionNumber, setQuestionNumber] = useState(0)
  // Total questions to answer
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  /**
   * loadQuestion(): Fetch next line equation question
   * Endpoint: /lineq-api/question?difficulty={easy|medium|hard}
   * Returns: {x1, y1, x2, y2} - two points on the line
   */
  const loadQuestion = async () => {
    setLoading(true)
    // Reset slope and intercept input fields
    setUserM(''); setUserC('')
    setFeedback(''); setIsCorrect(null); setRevealed(false)
    // Fetch line equation question from backend based on difficulty
    const res = await fetch(`${API}/lineq-api/question?difficulty=${difficulty}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
    timer.start()
  }

  /**
   * startQuiz(): Initialize line equation quiz
   * Parse numQuestions input, reset score/results, load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : DEFAULT_TOTAL
    setTotalQ(count)
    // Reset quiz state: mark as started, not finished, score to 0, question 1
    setStarted(true); setFinished(false); setScore(0); setQuestionNumber(1); setResults([])
    await loadQuestion()
  }

  /**
   * handleSubmit(): Validate and submit m and c values for line equation
   * Validation: both m (slope) and c (intercept) must be filled
   * API: POSTs to /lineq-api/check with two points and user's slope/intercept
   * Backend validates: m = (y2-y1)/(x2-x1) and c = y1 - m*x1
   */
  const handleSubmit = async () => {
    if (!question || revealed || !userM || !userC) return
    const timeTaken = timer.stop()
    // POST to backend to validate line equation
    const res = await fetch(`${API}/lineq-api/check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x1: question.x1, y1: question.y1, x2: question.x2, y2: question.y2, userM: Number(userM), userC: Number(userC) }),
    })
    const data = await res.json()
    setIsCorrect(data.correct)
    if (data.correct) setScore(s => s + 1)
    // Format feedback message with correct m and c values
    setFeedback(data.correct ? `Correct! y = ${data.m}x ${data.c >= 0 ? '+' : '−'} ${Math.abs(data.c)}` : `Incorrect. y = ${data.m}x ${data.c >= 0 ? '+' : '−'} ${Math.abs(data.c)}`)
    // Add result to history for results table
    setResults(prev => [...prev, {
      question: `(${question.x1},${question.y1}) (${question.x2},${question.y2})`,
      userAnswer: `m=${userM}, c=${userC}`,
      correctAnswer: `m=${data.m}, c=${data.c}`,
      correct: data.correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  /**
   * advanceRef: Mutable ref to advance function for useAutoAdvance hook
   * Advances to next question or finishes quiz if all questions completed
   * Loaded asynchronously before auto-advance triggers
   */
  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (questionNumber >= totalQ) { setFinished(true); timer.reset(); return }
    setQuestionNumber(n => n + 1)
    await loadQuestion()
  }
  // Auto-advance to next question when answer is correct and revealed (uses useAutoAdvance hook)
  useAutoAdvance(revealed, advanceRef, isCorrect)

  /**
   * valInput(setter): Create input change handler for m and c fields
   * Validates input: empty string, minus sign, decimal point, or decimal number format (-?\d*\.?\d*)
   * Returns onChange handler that updates the given state setter
   * Usage: onChange={valInput(setUserM)}
   */
  const valInput = (setter) => (e) => { const v = e.target.value; if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setter(v) }

  return (
    <QuizLayout title="Line Equation" subtitle="Find m and c in y = mx + c from two points" onBack={onBack}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      <div className="radio-group">
        {['easy', 'medium', 'hard'].map(d => (
          <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
            <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} disabled={started && !finished} />
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </label>
        ))}
      </div>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Given two points, find the slope m and intercept c.</p>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}
      {started && !finished && <>
        <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
        {question && <>
          <div className="question-box">
            <div>Point A: ({question.x1}, {question.y1})</div>
            <div>Point B: ({question.x2}, {question.y2})</div>
            <div className="given">Find y = mx + c</div>
          </div>
          <div className="roots-inputs">
            <div className="coeff-field"><label className="coeff-label">m =</label>
              <input className="answer-input coeff-input" type="text" value={userM} onChange={valInput(setUserM)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            <div className="coeff-field"><label className="coeff-label">c =</label>
              <input className="answer-input coeff-input" type="text" value={userC} onChange={valInput(setUserC)} disabled={revealed} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </div>
        </>}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading || (!revealed && (!userM || !userC))}>
            {revealed ? (questionNumber >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

/* ── Quiz Layout ─────────────────────────────────────── */
/* ── Custom Lesson App ────────────────────────────────── */
/**
 * CUSTOM_PUZZLES: Static array mapping puzzle keys to display names
 * Used for puzzle selection UI in setup phase and results tracking
 * Keys must match API endpoint names and case types in CustomApp
 */
const CUSTOM_PUZZLES = [
  { key: 'basicarith', name: 'Basic Arithmetic' },
  { key: 'addition', name: 'Addition' },
  { key: 'quadratic', name: 'Quadratic' },
  { key: 'multiply', name: 'Multiplication' },
  { key: 'sqrt', name: 'Square Root' },
  { key: 'polymul', name: 'Poly Multiply' },
  { key: 'polyfactor', name: 'Poly Factor' },
  { key: 'primefactor', name: 'Prime Factors' },
  { key: 'qformula', name: 'Quadratic Formula' },
  { key: 'simul', name: 'Simultaneous Eq.' },
  { key: 'funceval', name: 'Functions' },
  { key: 'lineq', name: 'Line Equation' },
  { key: 'gk', name: 'General Knowledge' },
  { key: 'vocab', name: 'Vocab Builder' },
]

/**
 * fetchQuestionForType(type, difficulty): Fetch a question for given puzzle type
 * Maps puzzle keys to API endpoints and parameter formats
 * Different puzzle types use different API endpoints with varying parameter styles
 * Returns: Promise<question object from backend>
 */
function fetchQuestionForType(type, difficulty) {
  // Map difficulty levels to numeric step values for some puzzle types
  const diffMap = { easy: 1, medium: 2, hard: 3 }
  const urls = {
    // Math puzzles with difficulty parameters
    basicarith: `${API}/basicarith-api/question?difficulty=${difficulty}`,
    addition: `${API}/addition-api/question?digits=${diffMap[difficulty] || 1}`,
    quadratic: `${API}/quadratic-api/question?difficulty=${difficulty}`,
    // Multiply: random multiplication table (2-9)
    multiply: `${API}/multiply-api/question?table=${Math.floor(Math.random() * 8) + 2}`,
    // Square root: step parameter mapped to difficulty (easy: 1-10, medium: 11-35, hard: 36-60)
    sqrt: `${API}/sqrt-api/question?step=${difficulty === 'easy' ? Math.floor(Math.random() * 10) + 1 : difficulty === 'medium' ? Math.floor(Math.random() * 25) + 11 : Math.floor(Math.random() * 25) + 36}`,
    polymul: `${API}/polymul-api/question?difficulty=${difficulty}`,
    polyfactor: `${API}/polyfactor-api/question?difficulty=${difficulty}`,
    primefactor: `${API}/primefactor-api/question?difficulty=${difficulty}`,
    qformula: `${API}/qformula-api/question?difficulty=${difficulty}`,
    simul: `${API}/simul-api/question?difficulty=${difficulty}`,
    funceval: `${API}/funceval-api/question?difficulty=${difficulty}`,
    lineq: `${API}/lineq-api/question?difficulty=${difficulty}`,
    // Trivia puzzles without difficulty (use defaults or random)
    gk: `${API}/gk-api/question`,
    vocab: `${API}/vocab-api/question?difficulty=${difficulty}`,
  }
  return fetch(urls[type]).then(r => r.json())
}

/**
 * getPromptForType(type, q): Generate prompt text for given puzzle type and question
 * Some puzzle types (polymul, polyfactor, simul) require special rendering (return null)
 * Returns: String prompt or null if special render needed
 */
function getPromptForType(type, q) {
  if (!q) return 'Loading…'
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
  switch (type) {
    case 'basicarith': case 'addition': return `${q.prompt} = ?`
    case 'quadratic': return `${q.prompt}`
    case 'multiply': return `${q.prompt} = ?`
    case 'sqrt': return `${q.prompt} = ?`
    case 'funceval': return `${q.formula}, evaluate at ${Object.entries(q.vars).map(([k,v]) => `${k} = ${v}`).join(', ')}`
    case 'polymul': return null // special render with polynomial display
    case 'polyfactor': return null // special render with factorization display
    case 'primefactor': return `Find all prime factors of ${q.number}`
    case 'qformula': return `Find the roots of ${q.a}x² ${q.b >= 0 ? '+' : '−'} ${Math.abs(q.b)}x ${q.c >= 0 ? '+' : '−'} ${Math.abs(q.c)} = 0`
    case 'simul': return null // special render with system of equations display
    case 'lineq': return `Find slope (m) and intercept (c) for the line through (${q.x1}, ${q.y1}) and (${q.x2}, ${q.y2})`
    case 'gk': return q.question
    case 'vocab': return `What does "${q.question}" mean?`
    default: return ''
  }
}

/**
 * CustomApp Component
 * Custom lesson builder: Combine any puzzle types into a custom quiz
 * Features:
 *   - Setup phase: select puzzles, difficulty, question order, count
 *   - Quiz phase: answer mixed questions from selected puzzle types
 *   - Finished phase: view results and replay option
 *   - Keyboard shortcuts: 1-4 or a-d to select multiple choice answers
 *
 * @param {Object} props
 * @param {Function} props.onBack - Callback to return to home menu
 */
function CustomApp({ onBack }) {
  // ─────── Setup Phase State ──────────────────────────────────
  // Current phase: 'setup' | 'quiz' | 'finished'
  const [phase, setPhase] = useState('setup')
  // Array of selected puzzle keys (e.g., ['basicarith', 'multiply'])
  const [selected, setSelected] = useState([])
  // Question ordering: 'random' | 'sequential' (affects question plan generation)
  const [ordering, setOrdering] = useState('random')
  // Difficulty level applied to all selected puzzle types: 'easy' | 'medium' | 'hard'
  const [difficulty, setDifficulty] = useState('easy')
  // Total number of questions to answer (as string for input field)
  const [numQuestions, setNumQuestions] = useState('20')

  // ─────── Quiz Phase State ──────────────────────────────────
  // Array of puzzle type keys ordered for this quiz (e.g., ['multiply', 'basicarith', 'multiply'])
  const [plan, setPlan] = useState([])
  // Current question index in plan (0-indexed)
  const [qIndex, setQIndex] = useState(0)
  // Current question object returned from API
  const [question, setQuestion] = useState(null)
  // Current puzzle type (key from CUSTOM_PUZZLES)
  const [curType, setCurType] = useState(null)
  // Number of correct answers so far
  const [score, setScore] = useState(0)
  // Array of {question, userAnswer, correctAnswer, correct, time} result objects
  const [results, setResults] = useState([])
  // Feedback message shown after submission
  const [feedback, setFeedback] = useState('')
  // Is the last answer correct? (null before submission, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)
  // Answer revealed flag (prevents further input after submission)
  const [revealed, setRevealed] = useState(false)
  // API call in progress flag
  const [loading, setLoading] = useState(false)
  // Timer instance for tracking elapsed time per question
  const timer = useTimer()

  // ─────── Input State (for different puzzle types) ──────────────────────────────────
  // Single answer for most puzzle types (basicarith, addition, multiply, sqrt, funceval)
  const [answer, setAnswer] = useState('')
  // Selected option letter (A, B, C, D) for multiple choice questions (gk, vocab)
  const [selectedOption, setSelectedOption] = useState('')
  // Array of coefficient inputs for polymul puzzle
  const [userCoeffs, setUserCoeffs] = useState([])
  // Object for storing various inputs: {p, q, r, s} for polyfactor, {factors} for primefactor, {x, y, z} for simul, {m, c} for lineq, etc.
  const [inputs, setInputs] = useState({})

  // ─────── Derived State ──────────────────────────────────
  // Total number of questions in this quiz (length of plan)
  const totalQ = plan.length

  /**
   * togglePuzzle(key): Toggle selection of a puzzle type
   * Adds puzzle if not selected, removes if already selected
   * Updates selected array for UI rendering
   */
  const togglePuzzle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  /**
   * movePuzzle(idx, dir): Move a puzzle up/down in the sequential order list
   * dir: -1 for up, +1 for down
   * Bounds check: don't move if already at top (dir=-1) or bottom (dir=+1)
   * Used only when ordering === 'sequential'
   */
  const movePuzzle = (idx, dir) => {
    const arr = [...selected]
    const swap = idx + dir
    if (swap < 0 || swap >= arr.length) return
    // Swap array elements using destructuring
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    setSelected(arr)
  }

  /**
   * startQuiz(): Build question plan and start quiz
   * Parse numQuestions input
   * Generate question plan based on ordering:
   *   - 'sequential': distribute count evenly across selected puzzles, questions appear in order
   *   - 'random': pick random puzzles from selected, questions appear in random order
   * Transition to 'quiz' phase and load first question
   */
  const startQuiz = async () => {
    const count = numQuestions !== '' && Number(numQuestions) > 0 ? Number(numQuestions) : 20
    let questionPlan = []
    if (ordering === 'sequential') {
      // Distribute count evenly: if count=10, selected=['a','b','c'], then 4,3,3
      const perType = Math.floor(count / selected.length)
      const remainder = count % selected.length
      selected.forEach((key, i) => {
        // First 'remainder' types get one extra question
        const n = perType + (i < remainder ? 1 : 0)
        for (let j = 0; j < n; j++) questionPlan.push(key)
      })
    } else {
      // Random order: pick random puzzle type for each question
      for (let i = 0; i < count; i++) {
        questionPlan.push(selected[Math.floor(Math.random() * selected.length)])
      }
    }
    setPlan(questionPlan)
    setPhase('quiz')
    setScore(0)
    setResults([])
    setQIndex(0)
    // Load first question asynchronously
    await loadQuestion(questionPlan[0])
  }

  /**
   * resetInputs(): Clear all input state and feedback
   * Called before loading each new question
   */
  const resetInputs = () => {
    setAnswer(''); setSelectedOption(''); setUserCoeffs([]); setInputs({})
    setFeedback(''); setIsCorrect(null); setRevealed(false)
  }

  /**
   * loadQuestion(type): Fetch and set up question for given puzzle type
   * Fetches from appropriate API endpoint based on puzzle type and difficulty
   * Initializes type-specific input state (e.g., polymul initializes userCoeffs array)
   * Clears stale question object first to prevent render issues during type change
   * Starts timer for this question
   */
  const loadQuestion = async (type) => {
    setLoading(true)
    resetInputs()
    // Clear stale question before changing type to prevent render errors
    setQuestion(null)
    setCurType(type)
    try {
      // Fetch question from type-specific API endpoint
      const data = await fetchQuestionForType(type, difficulty)
      if (data && !data.error) {
        setQuestion(data)
        // Initialize type-specific input: polymul needs coefficient array
        if (type === 'polymul') setUserCoeffs(new Array(data.resultDegree + 1).fill(''))
      } else {
        // API returned error object; leave question null
        setQuestion(null)
      }
    } catch (err) {
      console.error('Failed to load question:', err)
      setQuestion(null)
    }
    setLoading(false)
    timer.start()
  }

  /**
   * handleSubmit(overrideOption): Validate and submit answer for current puzzle type
   * Dispatches to type-specific validation logic based on curType
   * All branches: validate user input, POST to type-specific API check endpoint,
   *   update score/feedback/results, set revealed=true
   * overrideOption: allows keyboard shortcut handlers to pass selected option letter
   */
  const handleSubmit = async (overrideOption) => {
    if (!question || revealed) return
    const timeTaken = timer.stop()
    let res, data, correct, correctDisplay, userDisplay
    const optionToUse = overrideOption || selectedOption

    // Dispatch to type-specific submission logic
    switch (curType) {
      // ─────── Basic Arithmetic Puzzle ──────────────────────────────────
      case 'basicarith': {
        if (answer === '') return
        // POST to /basicarith-api/check: validate arithmetic answer
        res = await fetch(`${API}/basicarith-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: question.a, b: question.b, op: question.op, answer: Number(answer) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer
        setFeedback(data.correct ? `Correct! ${question.prompt} = ${data.correctAnswer}` : `Incorrect. ${question.prompt} = ${data.correctAnswer}`)
        break
      }
      // ─────── Addition Puzzle ──────────────────────────────────
      case 'addition': {
        if (answer === '') return
        // POST to /addition-api/check: validate addition answer
        res = await fetch(`${API}/addition-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: question.a, b: question.b, answer: Number(answer) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer
        setFeedback(data.correct ? `Correct! ${question.a} + ${question.b} = ${data.correctAnswer}` : `Incorrect. ${question.a} + ${question.b} = ${data.correctAnswer}`)
        break
      }
      // ─────── Quadratic Evaluation Puzzle ──────────────────────────────────
      case 'quadratic': {
        if (answer === '') return
        // POST to /quadratic-api/check: evaluate quadratic ax²+bx+c at given x
        res = await fetch(`${API}/quadratic-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: question.a, b: question.b, c: question.c, x: question.x, answer: Number(answer) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer
        setFeedback(data.correct ? `Correct! y = ${data.correctAnswer}` : `Incorrect. y = ${data.correctAnswer}`)
        break
      }
      // ─────── Multiplication Table Puzzle ──────────────────────────────────
      case 'multiply': {
        if (answer === '') return
        // POST to /multiply-api/check: validate multiplication table answer
        res = await fetch(`${API}/multiply-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: question.table, multiplier: question.multiplier, answer: Number(answer) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer
        setFeedback(data.correct ? `Correct! ${question.prompt} = ${data.correctAnswer}` : `Incorrect. ${question.prompt} = ${data.correctAnswer}`)
        break
      }
      // ─────── Square Root Puzzle ──────────────────────────────────
      case 'sqrt': {
        if (answer === '') return
        // POST to /sqrt-api/check: validate square root floor/ceiling answer
        res = await fetch(`${API}/sqrt-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: question.q, answer: Number(answer) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = `⌊${data.sqrtRounded}⌋=${data.floorAnswer} or ⌈${data.sqrtRounded}⌉=${data.ceilAnswer}`; userDisplay = answer
        setFeedback(data.correct ? `Correct! √${question.q} ≈ ${data.sqrtRounded}` : `Incorrect. √${question.q} ≈ ${data.sqrtRounded} → ${data.floorAnswer} or ${data.ceilAnswer}`)
        break
      }
      // ─────── Function Evaluation Puzzle ──────────────────────────────────
      case 'funceval': {
        if (answer === '') return
        // POST to /funceval-api/check: evaluate f(x,y,z,...) at given values
        res = await fetch(`${API}/funceval-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: question.answer, userAnswer: Number(answer) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = String(data.correctAnswer); userDisplay = answer
        setFeedback(data.correct ? `Correct! = ${data.correctAnswer}` : `Incorrect. = ${data.correctAnswer}`)
        break
      }
      // ─────── Polynomial Multiply Puzzle ──────────────────────────────────
      case 'polymul': {
        if (userCoeffs.some(c => c === '')) return
        // POST to /polymul-api/check: validate polynomial multiplication result coefficients
        res = await fetch(`${API}/polymul-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p1: question.p1, p2: question.p2, userCoeffs: userCoeffs.map(Number) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.correctDisplay; userDisplay = userCoeffs.join(', ')
        setFeedback(data.correct ? `Correct! ${question.productDisplay}` : `Incorrect. Answer: ${data.correctDisplay}`)
        break
      }
      // ─────── Polynomial Factorization Puzzle ──────────────────────────────────
      case 'polyfactor': {
        const { p: up, q: uq, r: ur, s: us } = inputs
        if (!up || !uq || !ur || !us) return
        // POST to /polyfactor-api/check: validate polynomial factorization (px+q)(rx+s)
        res = await fetch(`${API}/polyfactor-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: question.a, b: question.b, c: question.c, userP: Number(up), userQ: Number(uq), userR: Number(ur), userS: Number(us) }) })
        data = await res.json()
        const f = question.factors
        correct = data.correct; correctDisplay = `(${f.p}x${f.q>=0?'+':''}${f.q})(${f.r}x${f.s>=0?'+':''}${f.s})`; userDisplay = `(${up}x${Number(uq)>=0?'+':''}${uq})(${ur}x${Number(us)>=0?'+':''}${us})`
        setFeedback(data.correct ? `Correct! ${correctDisplay}` : `Incorrect. ${correctDisplay}`)
        break
      }
      // ─────── Prime Factorization Puzzle ──────────────────────────────────
      case 'primefactor': {
        const pf = (inputs.factors || '').split(/[,\s]+/).filter(Boolean).map(Number).sort((a,b) => a - b)
        if (pf.length === 0) return
        // POST to /primefactor-api/check: validate prime factorization (sorted list)
        res = await fetch(`${API}/primefactor-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: question.number, userFactors: pf }) })
        data = await res.json()
        correct = data.correct; correctDisplay = data.correctFactors.join(' × '); userDisplay = pf.join(' × ')
        setFeedback(data.correct ? `Correct! ${question.number} = ${correctDisplay}` : `Incorrect. ${question.number} = ${correctDisplay}`)
        break
      }
      // ─────── Quadratic Formula Puzzle ──────────────────────────────────
      case 'qformula': {
        const { r1, r2 } = inputs
        if (question.roots.type === 'real_equal' && !r1) return
        if (question.roots.type !== 'real_equal' && (!r1 || !r2)) return
        // POST to /qformula-api/check: validate quadratic formula roots (type-dependent)
        res = await fetch(`${API}/qformula-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: question.a, b: question.b, c: question.c, userR1: Number(r1), userR2: Number(r2 || 0), userType: question.roots.type }) })
        data = await res.json()
        correct = data.correct
        const rt = data.roots
        // Format display based on root type (real_distinct, real_equal, or complex)
        correctDisplay = rt.type === 'real_distinct' ? `r₁ = ${rt.r1}, r₂ = ${rt.r2}` : rt.type === 'real_equal' ? `r = ${rt.r1}` : `${rt.realPart} ± ${rt.imagPart}i`
        userDisplay = question.roots.type === 'real_equal' ? r1 : `${r1}, ${r2}`
        setFeedback(data.correct ? `Correct! ${correctDisplay}` : `Incorrect. ${correctDisplay}`)
        break
      }
      // ─────── Simultaneous Equations Puzzle ──────────────────────────────────
      case 'simul': {
        const { x: ux, y: uy, z: uz } = inputs
        if (!ux || !uy) return
        if (question.size === 3 && !uz) return
        const body = { eqs: question.eqs, size: question.size, solution: question.solution, userX: Number(ux), userY: Number(uy) }
        if (question.size === 3) body.userZ = Number(uz)
        // POST to /simul-api/check: validate simultaneous equation solution (2×2 or 3×3)
        res = await fetch(`${API}/simul-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        data = await res.json()
        correct = data.correct
        const s = question.solution
        correctDisplay = question.size === 3 ? `(${s.x}, ${s.y}, ${s.z})` : `(${s.x}, ${s.y})`
        userDisplay = question.size === 3 ? `(${ux}, ${uy}, ${uz})` : `(${ux}, ${uy})`
        setFeedback(data.correct ? `Correct! ${correctDisplay}` : `Incorrect. ${correctDisplay}`)
        break
      }
      // ─────── Line Equation Puzzle ──────────────────────────────────
      case 'lineq': {
        const { m, c } = inputs
        if (!m || !c) return
        // POST to /lineq-api/check: validate line equation y=mx+c from two points
        res = await fetch(`${API}/lineq-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ x1: question.x1, y1: question.y1, x2: question.x2, y2: question.y2, userM: Number(m), userC: Number(c) }) })
        data = await res.json()
        correct = data.correct; correctDisplay = `m = ${data.m}, c = ${data.c}`; userDisplay = `m = ${m}, c = ${c}`
        setFeedback(data.correct ? `Correct! ${correctDisplay}` : `Incorrect. ${correctDisplay}`)
        break
      }
      // ─────── Multiple Choice Puzzles (GK, Vocab) ──────────────────────────────────
      case 'gk': case 'vocab': {
        if (!optionToUse) return
        setSelectedOption(optionToUse)
        const url = curType === 'gk' ? `${API}/gk-api/check` : `${API}/vocab-api/check`
        // POST to type-specific check endpoint: validate multiple choice answer
        res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: question.id, answerOption: optionToUse }) })
        data = await res.json()
        correct = data.correct; correctDisplay = `${data.correctAnswer}: ${data.correctAnswerText}`; userDisplay = optionToUse
        setFeedback(data.correct ? `Correct! ${data.correctAnswerText}` : `Incorrect. ${data.correctAnswerText}`)
        break
      }
      default: return
    }

    // Update score, feedback, and results (common for all puzzle types)
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    // Get puzzle type name for results display
    const typeName = CUSTOM_PUZZLES.find(p => p.key === curType)?.name || curType
    // Add result entry with truncated question display (max 80 chars)
    setResults(prev => [...prev, {
      question: `[${typeName}] ${getPromptForType(curType, question) || '…'}`.slice(0, 80),
      userAnswer: userDisplay,
      correctAnswer: correctDisplay,
      correct,
      time: timeTaken,
    }])
    setRevealed(true)
  }

  const advanceRef = useRef(() => {})
  advanceRef.current = async () => {
    if (qIndex + 1 >= totalQ) { setPhase('finished'); timer.reset(); return }
    const next = qIndex + 1
    setQIndex(next)
    await loadQuestion(plan[next])
  }
  useAutoAdvance(revealed, advanceRef, isCorrect)

  // Keyboard: 1-4 / a-d instantly select+submit for GK/Vocab in custom mode
  const handleSubmitRefC = useRef(handleSubmit)
  handleSubmitRefC.current = handleSubmit
  useEffect(() => {
    if (phase !== 'quiz') return
    const onKeyDown = (event) => {
      if (revealed || loading) return
      if (curType !== 'gk' && curType !== 'vocab') return
      const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D' }
      const letter = keyMap[event.key.toLowerCase()]
      if (letter && question && question.options) {
        event.preventDefault()
        handleSubmitRefC.current(letter)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, curType, question, loading, revealed])

  const valInput = (key) => (e) => {
    const v = e.target.value
    if (v === '' || v === '-' || v === '.' || /^-?\d*\.?\d*$/.test(v)) setInputs(prev => ({ ...prev, [key]: v }))
  }

  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')
  const formatCoeffLabel = (i) => i === 0 ? 'constant' : i === 1 ? 'x' : `x${sup(i)}`
  const fmtEq2 = (eq) => `${eq.a}x ${eq.b >= 0 ? '+' : '−'} ${Math.abs(eq.b)}y = ${eq.d}`
  const fmtEq3 = (eq) => `${eq.a}x ${eq.b >= 0 ? '+' : '−'} ${Math.abs(eq.b)}y ${eq.c >= 0 ? '+' : '−'} ${Math.abs(eq.c)}z = ${eq.d}`

  // Render the right input UI for current puzzle type
  const renderInputs = () => {
    if (!question || !curType) return null
    switch (curType) {
      case 'basicarith': case 'addition': case 'quadratic': case 'multiply': case 'sqrt': case 'funceval':
        return <>
          <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) { const v = e.target.value; if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) setAnswer(v) } }} disabled={revealed} placeholder="Type your answer" onKeyDown={e => { if (e.key === 'Enter') revealed ? advanceRef.current() : handleSubmit() }} />
          <NumPad value={answer} onChange={v => !revealed && setAnswer(v)} disabled={revealed} />
        </>
      case 'gk': case 'vocab':
        if (!question.options) return null
        return <div className="options-grid">
          {question.options.map((opt) => (
            <button key={opt.option} className={`option-card ${selectedOption === opt.option ? 'selected' : ''} ${revealed && opt.option === (question.answerOption || question.correctAnswer) ? 'correct-option' : ''} ${revealed && selectedOption === opt.option && !isCorrect ? 'wrong-option' : ''}`} onClick={() => !revealed && setSelectedOption(opt.option)} disabled={revealed}>
              <strong>{opt.option}.</strong> {opt.text}
            </button>
          ))}
        </div>
      case 'polymul':
        return <div className="coeff-inputs">
          {userCoeffs.map((c, i) => (
            <div key={i} className="coeff-field">
              <label className="coeff-label">{formatCoeffLabel(i)}</label>
              <input className="answer-input coeff-input" type="text" value={c} disabled={revealed}
                onChange={e => { const v = e.target.value; if (v === '' || v === '-' || /^-?\d+$/.test(v)) { const nc = [...userCoeffs]; nc[i] = v; setUserCoeffs(nc) } }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            </div>
          ))}
        </div>
      case 'polyfactor':
        return <div className="factor-inputs">
          {[['p','p'],['q','q'],['r','r'],['s','s']].map(([key, label]) => (
            <div key={key} className="coeff-field">
              <label className="coeff-label">{label}</label>
              <input className="answer-input coeff-input" type="text" value={inputs[key] || ''} disabled={revealed} onChange={valInput(key)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
            </div>
          ))}
          <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Factor as (px + q)(rx + s)</div>
        </div>
      case 'primefactor':
        return <div className="single-input-row">
          <input className="answer-input" type="text" value={inputs.factors || ''} disabled={revealed} placeholder="e.g. 2, 3, 5" onChange={e => setInputs(prev => ({ ...prev, factors: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Enter all prime factors separated by commas</div>
        </div>
      case 'qformula':
        return <div className="roots-inputs">
          {question.roots.type === 'complex' ? <>
            <div className="coeff-field"><label className="coeff-label">Real part</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r1 || ''} disabled={revealed} onChange={valInput('r1')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            <div className="coeff-field"><label className="coeff-label">Imag part</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r2 || ''} disabled={revealed} onChange={valInput('r2')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </> : question.roots.type === 'real_equal' ? <>
            <div className="coeff-field"><label className="coeff-label">Root</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r1 || ''} disabled={revealed} onChange={valInput('r1')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </> : <>
            <div className="coeff-field"><label className="coeff-label">r₁</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r1 || ''} disabled={revealed} onChange={valInput('r1')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
            <div className="coeff-field"><label className="coeff-label">r₂</label>
              <input className="answer-input coeff-input" type="text" value={inputs.r2 || ''} disabled={revealed} onChange={valInput('r2')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          </>}
        </div>
      case 'simul':
        return <div className="roots-inputs">
          <div className="coeff-field"><label className="coeff-label">x =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.x || ''} disabled={revealed} onChange={valInput('x')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          <div className="coeff-field"><label className="coeff-label">y =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.y || ''} disabled={revealed} onChange={valInput('y')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          {question.size === 3 && <div className="coeff-field"><label className="coeff-label">z =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.z || ''} disabled={revealed} onChange={valInput('z')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>}
        </div>
      case 'lineq':
        return <div className="roots-inputs">
          <div className="coeff-field"><label className="coeff-label">m =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.m || ''} disabled={revealed} onChange={valInput('m')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
          <div className="coeff-field"><label className="coeff-label">c =</label>
            <input className="answer-input coeff-input" type="text" value={inputs.c || ''} disabled={revealed} onChange={valInput('c')} onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }} /></div>
        </div>
      default: return null
    }
  }

  // Render the question display
  const renderQuestion = () => {
    if (!question || !curType) return <div className="question-box">Loading…</div>
    const typeName = CUSTOM_PUZZLES.find(p => p.key === curType)?.name || curType

    if (curType === 'polymul') {
      return <>
        <div className="custom-type-badge">{typeName}</div>
        <div className="question-box">
          <span className="poly-expr">({question.p1Display})</span> × <span className="poly-expr">({question.p2Display})</span>
        </div>
      </>
    }
    if (curType === 'polyfactor') {
      return <>
        <div className="custom-type-badge">{typeName}</div>
        <div className="question-box">Factor: {question.display}</div>
      </>
    }
    if (curType === 'simul') {
      const is3 = question.size === 3
      return <>
        <div className="custom-type-badge">{typeName}</div>
        <div className="question-box equation-system">
          {question.eqs.map((eq, i) => <div key={i}>{is3 ? fmtEq3(eq) : fmtEq2(eq)}</div>)}
        </div>
      </>
    }
    return <>
      <div className="custom-type-badge">{typeName}</div>
      <div className="question-box">{getPromptForType(curType, question)}</div>
    </>
  }

  // ─── Setup Phase ─────────────────────────────────────
  if (phase === 'setup') {
    return (
      <QuizLayout title="Custom Lesson" subtitle="Build your own quiz from any combination of puzzles" onBack={onBack}>
        <div className="radio-group">
          {['easy', 'medium', 'hard'].map(d => (
            <label key={d} className={`radio-pill ${difficulty === d ? 'active' : ''}`}>
              <input type="radio" checked={difficulty === d} onChange={() => setDifficulty(d)} />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </label>
          ))}
        </div>

        <div className="custom-section-label">Select puzzles:</div>
        <div className="custom-puzzle-grid">
          {CUSTOM_PUZZLES.map(p => (
            <label key={p.key} className={`custom-puzzle-check ${selected.includes(p.key) ? 'checked' : ''}`}>
              <input type="checkbox" checked={selected.includes(p.key)} onChange={() => togglePuzzle(p.key)} />
              {p.name}
            </label>
          ))}
        </div>

        <div className="custom-section-label">Question order:</div>
        <div className="radio-group">
          <label className={`radio-pill ${ordering === 'random' ? 'active' : ''}`}>
            <input type="radio" checked={ordering === 'random'} onChange={() => setOrdering('random')} /> Random
          </label>
          <label className={`radio-pill ${ordering === 'sequential' ? 'active' : ''}`}>
            <input type="radio" checked={ordering === 'sequential'} onChange={() => setOrdering('sequential')} /> Sequential
          </label>
        </div>

        {ordering === 'sequential' && selected.length > 1 && <>
          <div className="custom-section-label">Drag order (first → last):</div>
          <div className="custom-order-list">
            {selected.map((key, i) => {
              const p = CUSTOM_PUZZLES.find(x => x.key === key)
              return (
                <div key={key} className="custom-order-item">
                  <span className="custom-order-num">{i + 1}.</span>
                  <span className="custom-order-name">{p?.name}</span>
                  <button className="custom-order-btn" onClick={() => movePuzzle(i, -1)} disabled={i === 0}>↑</button>
                  <button className="custom-order-btn" onClick={() => movePuzzle(i, 1)} disabled={i === selected.length - 1}>↓</button>
                </div>
              )
            })}
          </div>
        </>}

        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} />
        </div>
        <div className="button-row">
          <button onClick={startQuiz} disabled={selected.length === 0}>Start Custom Quiz</button>
        </div>
      </QuizLayout>
    )
  }

  // ─── Quiz Phase ──────────────────────────────────────
  if (phase === 'quiz') {
    return (
      <QuizLayout title="Custom Lesson" subtitle={`${selected.length} puzzle types · ${difficulty}`} onBack={onBack}>
        <div className="top-mini-row">
          {!revealed && <div className="timer-pill">{timer.elapsed}s</div>}
          <div className="score-pill">Score: {score}</div>
        </div>
        <div className="progress-pill center">Question {qIndex + 1}/{totalQ}</div>
        {renderQuestion()}
        {renderInputs()}
        {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}
        <div className="button-row">
          <button onClick={revealed ? () => advanceRef.current() : handleSubmit} disabled={loading}>
            {revealed ? (qIndex + 1 >= totalQ ? 'Finish' : 'Next') : 'Submit'}
          </button>
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </QuizLayout>
    )
  }

  // ─── Finished Phase ──────────────────────────────────
  return (
    <QuizLayout title="Custom Lesson" subtitle="Quiz complete!" onBack={onBack}>
      <div className="welcome-box">
        <p className="final-score">Final score: {score}/{totalQ}</p>
        <ResultsTable results={results} />
        <button onClick={() => setPhase('setup')}>Play Again</button>
      </div>
    </QuizLayout>
  )
}

/* ── Interval Scheduling App ────────────────────────── */
function IntervalSchedulingApp() {
  const [intervals, setIntervals] = useState([])
  const [nextId, setNextId] = useState(1)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(-1) // -1 = not started, 0..n = stepping through
  const [sorted, setSorted] = useState([])
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('tenali-theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('tenali-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const TIMELINE_MAX = 24
  const COLORS = ['#e8864a', '#5cb87a', '#4a90d9', '#d94a8a', '#9b59b6', '#e6c84a', '#2ecc71', '#e74c3c', '#1abc9c', '#f39c12']

  // Drag state for creating intervals on the timeline
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const timelineRef = useRef(null)

  const getTimeFromX = (clientX) => {
    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const t = Math.round((x / rect.width) * TIMELINE_MAX)
    return Math.max(0, Math.min(TIMELINE_MAX, t))
  }

  const handleMouseDown = (e) => {
    if (result) return
    const t = getTimeFromX(e.clientX)
    setDragging(true)
    setDragStart(t)
    setDragEnd(t)
  }

  const handleMouseMove = (e) => {
    if (!dragging) return
    setDragEnd(getTimeFromX(e.clientX))
  }

  const handleMouseUp = () => {
    if (!dragging) return
    setDragging(false)
    const s = Math.min(dragStart, dragEnd)
    const e = Math.max(dragStart, dragEnd)
    if (e > s) {
      setIntervals(prev => [...prev, { id: nextId, start: s, end: e }])
      setNextId(n => n + 1)
    }
    setDragStart(null)
    setDragEnd(null)
  }

  // Touch support
  const handleTouchStart = (e) => {
    if (result) return
    const touch = e.touches[0]
    const t = getTimeFromX(touch.clientX)
    setDragging(true)
    setDragStart(t)
    setDragEnd(t)
  }

  const handleTouchMove = (e) => {
    if (!dragging) return
    const touch = e.touches[0]
    setDragEnd(getTimeFromX(touch.clientX))
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  const removeInterval = (id) => {
    if (result) return
    setIntervals(prev => prev.filter(i => i.id !== id))
  }

  const runGreedy = () => {
    const sortedByEnd = [...intervals].sort((a, b) => a.end - b.end || a.start - b.start)
    setSorted(sortedByEnd)
    setStep(0)
    setResult(null)
  }

  const stepForward = () => {
    if (step >= sorted.length) return
    setStep(s => s + 1)
  }

  const runFullAlgorithm = () => {
    setStep(sorted.length)
  }

  // Compute selected set up to current step
  const getSelectedAtStep = (upToStep) => {
    const selected = []
    let lastEnd = -Infinity
    for (let i = 0; i < Math.min(upToStep, sorted.length); i++) {
      if (sorted[i].start >= lastEnd) {
        selected.push(sorted[i])
        lastEnd = sorted[i].end
      }
    }
    return selected
  }

  const selectedIntervals = step >= 0 ? getSelectedAtStep(step) : []
  const isFinished = step >= sorted.length && step >= 0
  const currentConsidering = step >= 0 && step < sorted.length ? sorted[step] : null

  // Check if current interval would be rejected
  const wouldBeRejected = (() => {
    if (!currentConsidering) return false
    const sel = getSelectedAtStep(step)
    const lastEnd = sel.length > 0 ? sel[sel.length - 1].end : -Infinity
    return currentConsidering.start < lastEnd
  })()

  const reset = () => {
    setResult(null)
    setStep(-1)
    setSorted([])
  }

  const clearAll = () => {
    setIntervals([])
    setNextId(1)
    reset()
  }

  const loadExample = () => {
    clearAll()
    const examples = [
      { id: 1, start: 0, end: 6 },
      { id: 2, start: 1, end: 4 },
      { id: 3, start: 3, end: 5 },
      { id: 4, start: 5, end: 7 },
      { id: 5, start: 3, end: 9 },
      { id: 6, start: 5, end: 9 },
      { id: 7, start: 6, end: 10 },
      { id: 8, start: 8, end: 11 },
      { id: 9, start: 8, end: 12 },
      { id: 10, start: 2, end: 14 },
      { id: 11, start: 12, end: 16 },
    ]
    setIntervals(examples)
    setNextId(12)
  }

  const selectedSet = new Set(selectedIntervals.map(i => i.id))

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="app-shell">
        <div className="card is-wide">
          <h1>Interval Scheduling</h1>
          <p className="subtitle">
            Drag on the timeline to create intervals, then step through the greedy algorithm
          </p>

          {/* Algorithm explanation */}
          <div className="is-algo-explain">
            <strong>Greedy strategy:</strong> Sort all intervals by finish time. Then, scan left to right — accept an interval if it doesn't overlap the last accepted one, otherwise skip it. This always gives the maximum number of non-overlapping intervals.
          </div>

          {/* Timeline */}
          <div className="is-timeline-container">
            <div className="is-timeline-labels">
              {Array.from({ length: TIMELINE_MAX + 1 }, (_, i) => (
                <span key={i} className="is-timeline-label">{i}</span>
              ))}
            </div>
            <div
              className="is-timeline"
              ref={timelineRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Grid lines */}
              {Array.from({ length: TIMELINE_MAX + 1 }, (_, i) => (
                <div key={i} className="is-grid-line" style={{ left: `${(i / TIMELINE_MAX) * 100}%` }} />
              ))}

              {/* Existing intervals */}
              {intervals.map((intv, idx) => {
                const isSelected = selectedSet.has(intv.id)
                const isConsidering = currentConsidering && currentConsidering.id === intv.id
                const isRejected = isConsidering && wouldBeRejected
                const wasProcessed = step >= 0 && sorted.findIndex(s => s.id === intv.id) < step && !isSelected

                let className = 'is-interval'
                if (isConsidering && !isRejected) className += ' is-considering'
                if (isConsidering && isRejected) className += ' is-rejected'
                if (isSelected) className += ' is-selected'
                if (wasProcessed && !isSelected) className += ' is-skipped'

                return (
                  <div
                    key={intv.id}
                    className={className}
                    style={{
                      left: `${(intv.start / TIMELINE_MAX) * 100}%`,
                      width: `${((intv.end - intv.start) / TIMELINE_MAX) * 100}%`,
                      top: `${(idx % 6) * 34 + 4}px`,
                      backgroundColor: isSelected ? COLORS[idx % COLORS.length] : undefined,
                    }}
                    title={`[${intv.start}, ${intv.end})`}
                  >
                    <span className="is-interval-label">{intv.start}–{intv.end}</span>
                    {step < 0 && (
                      <button className="is-interval-remove" onClick={(e) => { e.stopPropagation(); removeInterval(intv.id) }}>×</button>
                    )}
                  </div>
                )
              })}

              {/* Drag preview */}
              {dragging && dragStart !== null && dragEnd !== null && (
                <div
                  className="is-interval is-preview"
                  style={{
                    left: `${(Math.min(dragStart, dragEnd) / TIMELINE_MAX) * 100}%`,
                    width: `${((Math.abs(dragEnd - dragStart)) / TIMELINE_MAX) * 100}%`,
                    top: `${(intervals.length % 6) * 34 + 4}px`,
                  }}
                >
                  <span className="is-interval-label">{Math.min(dragStart, dragEnd)}–{Math.max(dragStart, dragEnd)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="is-controls">
            {step < 0 ? (
              <>
                <button className="is-btn" onClick={loadExample}>Load Example</button>
                <button className="is-btn" onClick={clearAll} disabled={intervals.length === 0}>Clear All</button>
                <button className="is-btn is-btn-primary" onClick={runGreedy} disabled={intervals.length === 0}>
                  Run Greedy Algorithm
                </button>
              </>
            ) : (
              <>
                <button className="is-btn" onClick={reset}>Reset</button>
                {!isFinished && (
                  <>
                    <button className="is-btn is-btn-primary" onClick={stepForward}>
                      Next Step
                    </button>
                    <button className="is-btn" onClick={runFullAlgorithm}>Skip to End</button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Step-by-step log */}
          {step >= 0 && (
            <div className="is-log">
              <h3>Algorithm Trace</h3>
              <div className="is-log-header">
                Sorted by finish time: [{sorted.map(s => `[${s.start},${s.end})`).join(', ')}]
              </div>
              <div className="is-log-entries">
                {sorted.slice(0, step).map((intv, i) => {
                  const selUpTo = getSelectedAtStep(i + 1)
                  const wasSelected = selUpTo.some(s => s.id === intv.id) && !getSelectedAtStep(i).some(s => s.id === intv.id)
                  const lastAccepted = getSelectedAtStep(i)
                  const lastEnd = lastAccepted.length > 0 ? lastAccepted[lastAccepted.length - 1].end : 0

                  return (
                    <div key={i} className={`is-log-entry ${wasSelected ? 'is-log-accept' : 'is-log-reject'}`}>
                      <span className="is-log-step">Step {i + 1}:</span>
                      <span>Consider [{intv.start}, {intv.end})</span>
                      {wasSelected ? (
                        <span className="is-log-verdict is-accept">
                           Accept (start {intv.start} {'>'}= last end {lastEnd})
                        </span>
                      ) : (
                        <span className="is-log-verdict is-reject">
                           Reject (start {intv.start} {'<'} last end {lastEnd})
                        </span>
                      )}
                    </div>
                  )
                })}
                {currentConsidering && (
                  <div className={`is-log-entry is-log-current ${wouldBeRejected ? 'is-log-reject-pending' : 'is-log-accept-pending'}`}>
                    <span className="is-log-step">Step {step + 1}:</span>
                    <span>Considering [{currentConsidering.start}, {currentConsidering.end})…</span>
                    <span className="is-log-verdict is-pending">press Next Step</span>
                  </div>
                )}
              </div>

              {isFinished && (
                <div className="is-result">
                  <strong>Result:</strong> {selectedIntervals.length} interval{selectedIntervals.length !== 1 ? 's' : ''} selected
                  — [{selectedIntervals.map(s => `[${s.start},${s.end})`).join(', ')}]
                  <br />
                  <span className="is-result-note">This is the maximum possible set of non-overlapping intervals.</span>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="is-legend">
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-default" /> Unprocessed</div>
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-considering" /> Considering</div>
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-selected" /> Accepted</div>
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-rejected" /> Rejected</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Extended Euclid App ───────────────────────────── */
function ExtendedEuclidApp() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [steps, setSteps] = useState(null)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('tenali-theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('tenali-theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const compute = () => {
    const na = parseInt(a, 10)
    const nb = parseInt(b, 10)
    if (isNaN(na) || isNaN(nb) || (na === 0 && nb === 0)) return

    // Run extended Euclidean algorithm, recording every step
    const rows = []
    let r0 = Math.abs(na), r1 = Math.abs(nb)
    let s0 = 1, s1 = 0
    let t0 = 0, t1 = 1

    rows.push({ r: r0, s: s0, t: t0, q: null, step: 0 })
    rows.push({ r: r1, s: s1, t: t1, q: null, step: 1 })

    let i = 2
    while (r1 !== 0) {
      const q = Math.floor(r0 / r1)
      const r2 = r0 - q * r1
      const s2 = s0 - q * s1
      const t2 = t0 - q * t1

      rows.push({ r: r2, s: s2, t: t2, q, step: i })

      r0 = r1; r1 = r2
      s0 = s1; s1 = s2
      t0 = t1; t1 = t2
      i++
    }

    // Adjust signs if original inputs were negative
    const signA = na >= 0 ? 1 : -1
    const signB = nb >= 0 ? 1 : -1
    const gcd = r0
    const x = s0 * signA
    const y = t0 * signB

    setSteps({ rows, gcd, x, y, a: na, b: nb })
  }

  const loadExample = () => {
    setA('252')
    setB('198')
    setSteps(null)
  }

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="app-shell">
        <div className="card is-wide">
          <h1>Extended Euclidean Algorithm</h1>
          <p className="subtitle">
            Enter two integers to see the step-by-step computation of gcd(a, b) and coefficients x, y such that ax + by = gcd(a, b)
          </p>

          <div className="is-algo-explain">
            <strong>How it works:</strong> The algorithm repeatedly divides the larger number by the smaller and tracks coefficients.
            At each step: r_i = r_(i-2) − q_i · r_(i-1), and similarly for s_i and t_i. When the remainder reaches 0, the previous remainder is the GCD, and the coefficients give the linear combination.
          </div>

          <div className="ee-input-row">
            <div className="ee-field">
              <label className="ee-label">a</label>
              <input
                className="ee-input"
                type="number"
                value={a}
                onChange={e => { setA(e.target.value); setSteps(null) }}
                placeholder="e.g. 252"
                onKeyDown={e => e.key === 'Enter' && compute()}
              />
            </div>
            <div className="ee-field">
              <label className="ee-label">b</label>
              <input
                className="ee-input"
                type="number"
                value={b}
                onChange={e => { setB(e.target.value); setSteps(null) }}
                placeholder="e.g. 198"
                onKeyDown={e => e.key === 'Enter' && compute()}
              />
            </div>
          </div>

          <div className="is-controls">
            <button className="is-btn" onClick={loadExample}>Load Example</button>
            <button className="is-btn is-btn-primary" onClick={compute} disabled={!a || !b}>Compute</button>
            <button className="is-btn" onClick={() => { setA(''); setB(''); setSteps(null) }}>Clear</button>
          </div>

          {steps && (
            <>
              {/* Result summary */}
              <div className="is-result" style={{ marginTop: '24px' }}>
                <strong>gcd({steps.a}, {steps.b}) = {steps.gcd}</strong>
                <br />
                <span style={{ fontSize: '1.05rem' }}>
                  ({steps.x}) · {steps.a} + ({steps.y}) · {steps.b} = {steps.gcd}
                </span>
                <br />
                <span className="is-result-note">
                  Verification: {steps.x} × {steps.a} + {steps.y} × {steps.b} = {steps.x * steps.a + steps.y * steps.b}
                </span>
              </div>

              {/* Step table */}
              <div className="ee-table-wrap">
                <table className="ee-table">
                  <thead>
                    <tr>
                      <th>Step i</th>
                      <th>q_i</th>
                      <th>r_i</th>
                      <th>s_i</th>
                      <th>t_i</th>
                      <th>Equation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.rows.map((row, idx) => (
                      <tr key={idx} className={row.r === 0 ? 'ee-row-zero' : idx === steps.rows.length - 2 ? 'ee-row-gcd' : ''}>
                        <td>{row.step}</td>
                        <td>{row.q !== null ? row.q : '—'}</td>
                        <td><strong>{row.r}</strong></td>
                        <td>{row.s}</td>
                        <td>{row.t}</td>
                        <td className="ee-eq">
                          {row.r !== 0 ? (
                            <span>{row.r} = ({row.s}) · {Math.abs(steps.a)} + ({row.t}) · {Math.abs(steps.b)}</span>
                          ) : (
                            <span className="is-result-note">remainder = 0, stop</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Division steps breakdown */}
              <div className="ee-divisions">
                <h3>Division Steps</h3>
                {steps.rows.slice(2).map((row, idx) => {
                  const prev2 = steps.rows[idx]
                  const prev1 = steps.rows[idx + 1]
                  return (
                    <div key={idx} className="ee-division-step">
                      <span className="is-log-step">Step {idx + 1}:</span>
                      {prev2.r} = {row.q} × {prev1.r} + {row.r}
                      {row.r === 0 && <span className="is-result-note"> (done — gcd is {prev1.r})</span>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function QuizLayout({ title, subtitle, onBack, children }) {
  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
      </div>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      {children}
    </>
  )
}

export default App

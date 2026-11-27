import { useState, useEffect, useRef } from 'react'

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
  '🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🍒', '🥝', '🍌', '🍑',
  '🌟', '🌙', '☀️', '⚡', '🔥', '💧', '🌈', '❄️', '🍀', '🌸',
  '🐶', '🐱', '🐸', '🐵', '🐔', '🐙', '🦋', '🐝', '🐢', '🐬',
  '⚽', '🏀', '🎾', '🎯', '🎲', '🎸', '🎨', '📚', '✏️', '🔔',
]

export default function TwinHuntApp({
  onBack,
  isGoalMode = false,
  useTimer,
  useAutoAdvance,
  getSpeedRunLimit,
  renderFeedback,
  QuizLayout: quizLayout,
  ResultsTable: resultsTable
}) {
  const QuizLayout = quizLayout
  const ResultsTable = resultsTable
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
  const roundRef = useRef(0)
  const commonSymbolRef = useRef('')

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
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);

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

  const handleTimeout = (targetRound, targetSymbol) => {
    if (revealed || finished) return
    setIsCorrect(false)
    setRevealed(true)
    setFeedback(`⏰ Time's up! The match was ${targetSymbol}.`)
    const timeTaken = timer.stop ? timer.stop() : 0
    const qPrompt = `Round ${targetRound}`
    setResults(prev => [...prev, { prompt: qPrompt, question: qPrompt, userAnswer: '(timeout)', correctAnswer: targetSymbol, correct: false, time: timeTaken }])
    if (sessionGoal === 'perfect') {
      setFinished(true)
      timer.reset()
    }
  }

  const generateRound = (n, currentRoundNum) => {
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
    commonSymbolRef.current = common
    roundRef.current = currentRoundNum
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)

    // Capture round and symbol as local values for this round's timeout callback
    const roundForTimeout = currentRoundNum
    const symbolForTimeout = common
    const onTimeout = () => {
      handleTimeout(roundForTimeout, symbolForTimeout)
    }

    // TwinHuntApp has no difficulty/isAdaptive state, so use the 'easy', non-adaptive limit.
    timer.start(sessionGoal, onTimeout, getSpeedRunLimit('easy', false))
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
    roundRef.current = 1
    setResults([])
    generateRound(n, 1)
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
    const activeSymbol = commonSymbolRef.current || commonSymbol
    const activeRound = roundRef.current || round
    const correct = symbol === activeSymbol
    if (correct) setScore((s) => s + 1)
    setIsCorrect(correct)
    setFeedback(correct
      ? `Correct! ${activeSymbol} was the match.`
      : `Wrong — you picked ${symbol}. The match was ${activeSymbol}.`)
    setResults((prev) => [...prev, {
      question: `Round ${activeRound}`,
      userAnswer: symbol,
      correctAnswer: activeSymbol,
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
  const advanceRef = useRef(() => { })
  advanceRef.current = () => {
    if (round >= totalRounds) {
      setFinished(true)
      timer.reset()
      return
    }
    const nextRound = round + 1
    setRound(nextRound)
    roundRef.current = nextRound
    generateRound(Number(count), nextRound)
  }
  useAutoAdvance(revealed, advanceRef, isCorrect)

  return (
    <QuizLayout title="Twin Hunt" subtitle="Find the common object in both panels" onBack={onBack} sessionGoal={sessionGoal}>
      <div className="top-mini-row">
        {started && !finished && !revealed && <div className="timer-pill">{timer.elapsed}s</div>}
        <div className="score-pill">Score: {score}</div>
      </div>
      {!started && !finished && (
        <div className="welcome-box">
          <p className="welcome-text">Two panels, one match. Tap the common object!</p>

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
                        <input type="radio" name="twinhuntapp-goal" checked={sessionGoal === g.key} onChange={() => {
                          setSessionGoal(g.key)

                        }} />
                        {g.label}
                      </label>
                    ))}
                  </div>
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
            <label className="question-count-label">Objects per panel</label>
            <input className="answer-input question-count-input" type="text" value={count}
              onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setCount(v) }}
              placeholder="5" />
          </div>
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
        {renderFeedback(feedback, isCorrect)}
        {revealed && (
          <button onClick={() => advanceRef.current()}>
            {round >= totalRounds ? 'Finish' : 'Next Round'}
          </button>
        )}
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

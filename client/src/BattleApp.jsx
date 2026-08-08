import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import confetti from 'canvas-confetti'

const API = import.meta.env?.VITE_API_BASE_URL || ''
// socket.io must mount at the same sub-path as the app (e.g. /summership).
// Using just `window.location.origin` (no path) makes the client connect to
// the host's `/socket.io/` endpoint, which on this deployment returns the
// stale static SPA shell instead of the Socket.IO handshake → "parser error".
// VITE_SOCKET_PATH lets the build-time base drive the path; at runtime we
// fall back to deriving the path from `window.location.pathname` so the
// same build works on root, /summership, or any other sub-path.
const SOCKET_PATH = import.meta.env?.VITE_SOCKET_PATH
  || (window.location.pathname.replace(/\/[^/]*$/, '/').replace(/\/+$/, '/') + 'socket.io')
const socket = io(window.location.origin, { path: SOCKET_PATH, transports: ['websocket', 'polling'] })

// Inject keyframe styles once
if (typeof document !== 'undefined' && !document.getElementById('battle-animations')) {
  const style = document.createElement('style')
  style.id = 'battle-animations'
  style.textContent = `
    @keyframes timer-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes timer-urgent { 0%, 100% { background: var(--clr-wrong); box-shadow: 0 0 0 0 rgba(224,90,74,0.6); } 50% { background: #e05a4a; box-shadow: 0 0 0 6px rgba(224,90,74,0); } }
    @keyframes timer-warning { 0%, 100% { background: #e8b931; box-shadow: 0 0 0 0 rgba(232,185,49,0.5); } 50% { background: #e8b931; box-shadow: 0 0 0 6px rgba(232,185,49,0); } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
    @keyframes reaction-float { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(1.2); opacity: 0; } }
    @keyframes score-pop { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }
    @keyframes streak-flame { 0%, 100% { transform: scale(1) rotate(-3deg); } 50% { transform: scale(1.15) rotate(3deg); } }
    @keyframes progress-fill { from { width: 0%; } to { width: var(--progress-width); } }
    @keyframes answer-reveal { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
  `
  document.head.appendChild(style)
}

const TOPICS = [
  { key: 'arithmetic', label: 'Arithmetic', icon: '➕', desc: '+, −, ×, ÷', color: '#4a90d9' },
  { key: 'multiply', label: 'Tables', icon: '✖️', desc: 'Times tables', color: '#9b59b6' },
  { key: 'gk', label: 'GK', icon: '🧠', desc: 'General Knowledge', color: '#5cb87a' },
  { key: 'sudoku', label: 'Sudoku', icon: '🔢', desc: 'Solve the grid race', color: '#1abc9c' },
]

const ALL_MODULES = [
  { key: 'arithmetic', name: 'Arithmetic', icon: '➕', color: '#4a90d9', label: 'Arithmetic' },
  { key: 'multiply', name: 'Tables', icon: '✖️', color: '#9b59b6', label: 'Tables' },
  { key: 'gk', name: 'GK', icon: '🧠', color: '#5cb87a', label: 'GK' },
  { key: 'sudoku', name: 'Sudoku', icon: '🔢', color: '#1abc9c', label: 'Sudoku' },
  { key: 'addition', name: 'Addition', icon: '➕', color: '#4a90d9', label: 'Addition' },
  { key: 'basicarith', name: 'Arithmetic', icon: '🔢', color: '#7aa2f7', label: 'Arithmetic' },
  { key: 'hcflcm', name: 'HCF & LCM', icon: '🔄', color: '#4a90d9', label: 'HCF & LCM' },
  { key: 'primefactor', name: 'Prime Factors', icon: '💎', color: '#5cb87a', label: 'Prime Factors' },
  { key: 'squaring', name: 'Squaring', icon: '📐', color: '#9b59b6', label: 'Squaring' },
  { key: 'sqrt', name: 'Square Root', icon: '√', color: '#5cb87a', label: 'Square Root' },
  { key: 'rounding', name: 'Rounding', icon: '🎯', color: '#4a90d9', label: 'Rounding' },
  { key: 'decimals', name: 'Decimals', icon: '·', color: '#7aa2f7', label: 'Decimals' },
  { key: 'bases', name: 'Number Bases', icon: '🖥', color: '#5cb87a', label: 'Number Bases' },
  { key: 'stdform', name: 'Standard Form', icon: '🔬', color: '#9b59b6', label: 'Standard Form' },
  { key: 'sdt', name: 'Speed, Dist, Time', icon: '🏎', color: '#4a90d9', label: 'Speed, Dist, Time' },
  { key: 'fractionadd', name: 'Fractions', icon: '½', color: '#5cb87a', label: 'Fractions' },
  { key: 'ratio', name: 'Ratio', icon: '⚖️', color: '#4a90d9', label: 'Ratio' },
  { key: 'percent', name: 'Percentages', icon: '%', color: '#7aa2f7', label: 'Percentages' },
  { key: 'profitloss', name: 'Profit & Loss', icon: '💰', color: '#9b59b6', label: 'Profit & Loss' },
  { key: 'banking', name: 'Banking', icon: '🏦', color: '#4a90d9', label: 'Banking' },
  { key: 'gst', name: 'GST', icon: '🧾', color: '#5cb87a', label: 'GST' },
  { key: 'shares', name: 'Shares', icon: '📈', color: '#9b59b6', label: 'Shares' },
  { key: 'variation', name: 'Variation', icon: '↔️', color: '#7aa2f7', label: 'Variation' },
  { key: 'lineareq', name: 'Linear Equations', icon: 'x', color: '#4a90d9', label: 'Linear Equations' },
  { key: 'simul', name: 'Sim. Equations', icon: '{x}', color: '#9b59b6', label: 'Sim. Equations' },
  { key: 'quadratic', name: 'Quadratic', icon: 'x²', color: '#7aa2f7', label: 'Quadratic' },
  { key: 'qformula', name: 'Quadratic Formula', icon: '±', color: '#5cb87a', label: 'Quadratic Formula' },
  { key: 'funceval', name: 'Functions', icon: 'f(x)', color: '#4a90d9', label: 'Functions' },
  { key: 'sequences', name: 'Sequences', icon: '…', color: '#9b59b6', label: 'Sequences' },
  { key: 'indices', name: 'Indices', icon: 'ⁿ', color: '#5cb87a', label: 'Indices' },
  { key: 'surds', name: 'Surds', icon: '√n', color: '#7aa2f7', label: 'Surds' },
  { key: 'log', name: 'Logarithms', icon: 'log', color: '#9b59b6', label: 'Logarithms' },
  { key: 'binomial', name: 'Binomial', icon: 'C(n,k)', color: '#4a90d9', label: 'Binomial' },
  { key: 'complex', name: 'Complex Numbers', icon: 'i', color: '#5cb87a', label: 'Complex Numbers' },
  { key: 'remfactor', name: 'Remainder Thm', icon: 'R(x)', color: '#7aa2f7', label: 'Remainder Thm' },
  { key: 'lineq', name: 'Line Equation', icon: 'mx+c', color: '#4a90d9', label: 'Line Equation' },
  { key: 'ineq', name: 'Inequalities', icon: '<>', color: '#5cb87a', label: 'Inequalities' },
  { key: 'diff', name: 'Differentiation', icon: 'dy/dx', color: '#9b59b6', label: 'Differentiation' },
  { key: 'integ', name: 'Integration', icon: '∫', color: '#4a90d9', label: 'Integration' },
  { key: 'limits', name: 'Limits', icon: 'lim', color: '#5cb87a', label: 'Limits' },
  { key: 'angles', name: 'Angles', icon: '∠', color: '#4a90d9', label: 'Angles' },
  { key: 'triangles', name: 'Triangles', icon: '△', color: '#7aa2f7', label: 'Triangles' },
  { key: 'pythag', name: 'Pythagoras', icon: '⊥', color: '#5cb87a', label: 'Pythagoras' },
  { key: 'polygons', name: 'Polygons', icon: '⬡', color: '#9b59b6', label: 'Polygons' },
  { key: 'circleth', name: 'Circle Thms', icon: '⊙', color: '#4a90d9', label: 'Circle Thms' },
  { key: 'coordgeom', name: 'Coord. Geometry', icon: '📍', color: '#7aa2f7', label: 'Coord. Geometry' },
  { key: 'section', name: 'Section Formula', icon: '÷', color: '#5cb87a', label: 'Section Formula' },
  { key: 'bearings', name: 'Bearings', icon: '🧭', color: '#9b59b6', label: 'Bearings' },
  { key: 'mensur', name: 'Mensuration', icon: '📏', color: '#4a90d9', label: 'Mensuration' },
  { key: 'circmeasure', name: 'Circular Measure', icon: '弧', color: '#5cb87a', label: 'Circular Measure' },
  { key: 'heron', name: "Heron's Formula", icon: '△', color: '#7aa2f7', label: "Heron's Formula" },
  { key: 'similarity', name: 'Similarity', icon: '∝', color: '#9b59b6', label: 'Similarity' },
  { key: 'congruence', name: 'Congruence', icon: '≅', color: '#5cb87a', label: 'Congruence' },
  { key: 'transform', name: 'Transformations', icon: '↗', color: '#4a90d9', label: 'Transformations' },
  { key: 'prob', name: 'Probability', icon: '🎲', color: '#4a90d9', label: 'Probability' },
  { key: 'stats', name: 'Statistics', icon: '📊', color: '#7aa2f7', label: 'Statistics' },
  { key: 'permcomb', name: 'Perm & Comb', icon: 'nPr', color: '#9b59b6', label: 'Perm & Comb' },
  { key: 'matrix', name: 'Matrices', icon: '▦', color: '#4a90d9', label: 'Matrices' },
  { key: 'vectors', name: 'Vectors', icon: '→', color: '#7aa2f7', label: 'Vectors' },
  { key: 'dotprod', name: 'Dot Products', icon: '·', color: '#5cb87a', label: 'Dot Products' },
  { key: 'trig', name: 'Trigonometry', icon: '∡', color: '#5cb87a', label: 'Trigonometry' },
  { key: 'invtrig', name: 'Inverse Trig', icon: 'sin⁻¹', color: '#9b59b6', label: 'Inverse Trig' },
  { key: 'vocab', name: 'Vocabulary', icon: '📖', color: '#4a90d9', label: 'Vocabulary' },
  { key: 'linprog', name: 'Linear Prog.', icon: '📊', color: '#5cb87a', label: 'Linear Prog.' },
  { key: 'conics', name: 'Conic Sections', icon: '◯', color: '#9b59b6', label: 'Conic Sections' },
]

const MODULE_CATEGORIES = ALL_MODULES.reduce((acc, m) => {
  const cat = m.key === 'arithmetic' || m.key === 'multiply' || m.key === 'basicarith' || m.key === 'hcflcm' || m.key === 'primefactor' || m.key === 'squaring' || m.key === 'sqrt' || m.key === 'rounding' || m.key === 'decimals' || m.key === 'bases' || m.key === 'stdform' || m.key === 'sdt' || m.key === 'addition'
    ? 'Arithmetic'
    : m.key === 'fractionadd' || m.key === 'ratio' || m.key === 'percent' || m.key === 'profitloss' || m.key === 'banking' || m.key === 'gst' || m.key === 'shares'
    ? 'Fractions & Ratios'
    : m.key === 'variation' || m.key === 'lineareq' || m.key === 'simul' || m.key === 'quadratic' || m.key === 'qformula' || m.key === 'funceval' || m.key === 'sequences' || m.key === 'indices' || m.key === 'surds' || m.key === 'log' || m.key === 'binomial' || m.key === 'complex' || m.key === 'remfactor' || m.key === 'lineq' || m.key === 'ineq'
    ? 'Algebra'
    : m.key === 'diff' || m.key === 'integ' || m.key === 'limits'
    ? 'Calculus'
    : m.key === 'angles' || m.key === 'triangles' || m.key === 'pythag' || m.key === 'polygons' || m.key === 'circleth' || m.key === 'coordgeom' || m.key === 'section' || m.key === 'bearings' || m.key === 'mensur' || m.key === 'circmeasure' || m.key === 'heron' || m.key === 'similarity' || m.key === 'congruence' || m.key === 'transform' || m.key === 'conics'
    ? 'Geometry'
    : m.key === 'prob' || m.key === 'stats' || m.key === 'permcomb'
    ? 'Stats & Prob'
    : m.key === 'matrix' || m.key === 'vectors' || m.key === 'dotprod'
    ? 'Matrices & Vectors'
    : 'Trig & Misc'
  ;(acc[cat] = acc[cat] || []).push(m)
  return acc
}, {})

const QUESTION_COUNTS = [3, 5, 10, 15]

function formatTime(ms) {
  if (ms == null) return '-'
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min > 0) return `${min}m ${sec}s`
  return `${sec}s`
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('battleHistory') || '[]')
  } catch { return [] }
}

function saveHistory(data) {
  try { localStorage.setItem('battleHistory', JSON.stringify(data)) } catch {}
}

function fireConfetti() {
  try {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } })
    setTimeout(() => confetti({ particleCount: 50, spread: 90, origin: { y: 0.6 } }), 200)
  } catch {}
}

function Timer({ timeLeft, totalDuration = 15000 }) {
  const pct = Math.max(0, (timeLeft * 1000) / totalDuration)
  let color = 'var(--clr-text-soft)'
  let timerClass = ''
  let barClass = ''
  if (timeLeft <= 2) { color = 'var(--clr-wrong)'; timerClass = 'timer-shake' }
  else if (timeLeft <= 5) { color = 'var(--clr-wrong)'; timerClass = 'timer-pulse' }
  else if (timeLeft <= 10) { color = 'var(--clr-accent)' }
  if (timeLeft <= 5) barClass = 'bar-urgent'
  else if (timeLeft <= 10) barClass = 'bar-warning'

  return (
    <>
      <style jsx>{`
        .timer-wrap { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; min-width: 56px; }
        .timer-text { font-size: 0.78rem; font-weight: 700; font-variant-numeric: tabular-nums; font-family: monospace; transition: color 0.2s, transform 0.1s; }
        .timer-pulse { animation: timer-pulse 0.8s ease-in-out infinite; }
        .timer-shake { animation: timer-shake 0.15s ease-in-out 3; }
        .timer-bar { width: 56px; height: 4px; background: var(--clr-border); border-radius: 2px; overflow: hidden; }
        .timer-bar-fill { height: 100%; background: var(--clr-accent); border-radius: 2px; transition: width 0.1s linear, background 0.2s; }
        .bar-warning .timer-bar-fill { background: var(--clr-accent); }
        .bar-urgent .timer-bar-fill { background: var(--clr-wrong); animation: bar-pulse 0.5s ease-in-out infinite; }
        @keyframes timer-pulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 rgba(224,90,74,0); } 50% { transform: scale(1.1); box-shadow: 0 0 12px rgba(224,90,74,0.6); } }
        @keyframes timer-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        @keyframes bar-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes screen-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
      `}</style>
      <div className="timer-wrap">
        <span className={`timer-text ${timerClass}`} style={{ color }}>{timeLeft}s</span>
        <div className={`timer-bar ${barClass}`}>
          <div className="timer-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </>
  )
}

const REACTION_EMOJIS = ['🔥', '👏', '😂', '💀', '👀', '😮']

function ReactionBar({ onSend, disabled }) {
  const handleClick = (emoji) => {
    if (!disabled) {
      onSend(emoji)
    }
  }
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
      {REACTION_EMOJIS.map((e) => (
        <button key={e} onClick={() => handleClick(e)} disabled={disabled}
          style={{ fontSize: '1.3rem', padding: '4px 8px', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius)', background: 'var(--clr-surface)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, transition: 'transform 0.1s, background 0.1s' }}
          onMouseEnter={(ev) => { if (!disabled) ev.target.style.transform = 'scale(1.2)' }}
          onMouseLeave={(ev) => { if (!disabled) ev.target.style.transform = 'scale(1)' }}>
          {e}
        </button>
      ))}
    </div>
  )
}

function FloatingReaction({ emoji }) {
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '3.5rem', pointerEvents: 'none', zIndex: 1000, animation: 'reaction-pop 1.5s ease-out forwards', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
      {emoji}
      <style jsx>{`
        @keyframes reaction-pop { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } 50% { transform: translate(-50%, -80%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); } }
      `}</style>
    </div>
  )
}

export default function BattleApp({ onBack, initialTopic }) {
  const [phase, setPhase] = useState('lobby')
  const [view, setView] = useState('play')
  const [name, setName] = useState('')
  const [topic, setTopic] = useState(initialTopic || 'arithmetic')
  const [numQuestions, setNumQuestions] = useState(5)
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [players, setPlayers] = useState([])
  const [myId, setMyId] = useState(socket.id)
  const [round, setRound] = useState(0)
  const [totalRounds, setTotalRounds] = useState(5)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [scores, setScores] = useState([])
  const [roundWinner, setRoundWinner] = useState(null)
  const [roundPlayers, setRoundPlayers] = useState([])
  const [opponentAnswered, setOpponentAnswered] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [answeredTime, setAnsweredTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState('')
  const [moduleSearch, setModuleSearch] = useState('')
  const [matchWinner, setMatchWinner] = useState(null)
  const [finalScores, setFinalScores] = useState([])
  const [matchHistory, setMatchHistory] = useState([])
  const [matchTopic, setMatchTopic] = useState('')
  const [matchNumQ, setMatchNumQ] = useState(5)
  const [matchPlayers, setMatchPlayers] = useState([])
  const [history, setHistory] = useState(loadHistory)
  const [openRooms, setOpenRooms] = useState({})
  const timerRef = useRef(null)
  const answerRef = useRef(null)
  const screenShakeRef = useRef(false)
  const [streaks, setStreaks] = useState({})
  const [incomingReaction, setIncomingReaction] = useState(null)
  const [opponentAnsweredCount, setOpponentAnsweredCount] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(2)
  const [sudokuPuzzle, setSudokuPuzzle] = useState(null)
  const [sudokuGrid, setSudokuGrid] = useState(null)
  const [sudokuRaceActive, setSudokuRaceActive] = useState(false)
  const [sudokuOpponentFinished, setSudokuOpponentFinished] = useState(false)
  const [sudokuRaceStart, setSudokuRaceStart] = useState(0)
  const [sudokuMyTime, setSudokuMyTime] = useState(null)
  const [sudokuWrongCount, setSudokuWrongCount] = useState(0)
  const [sudokuSelectedCell, setSudokuSelectedCell] = useState(null)
  const [isSudokuTopic, setIsSudokuTopic] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      setMyId(socket.id)
      socket.emit('getOpenRooms')
    })
    socket.on('openRooms', (rooms) => setOpenRooms(rooms))
    if (socket.connected) {
      setMyId(socket.id)
      socket.emit('getOpenRooms')
    }
    return () => { socket.off('connect'); socket.off('openRooms') }
  }, [])

  useEffect(() => {
    const resetRoomState = () => {
      setPlayers([])
      setQuestion(null)
      setAnswer('')
      setScores([])
      setRoundWinner(null)
      setRoundPlayers([])
      setOpponentAnswered(false)
      setOpponentAnsweredCount(0)
      setTimeLeft(0)
      setRound(0)
      setPhase('lobby')
      clearInterval(timerRef.current)
    }

    socket.on('roomUpdate', ({ players: p, topic: t }) => {
      setPlayers(p)
      setTotalPlayers(p.length)
      if (p.length === 2) {
        const readyPlayers = p.filter(player => player.ready)
        if (readyPlayers.length === 2 && !players.every((player, idx) => player.ready === p[idx].ready)) {
          socket.emit('getOpenRooms')
        }
      }
    })

    socket.on('matchStart', ({ topic: t, rounds }) => {
      setMatchTopic(t)
      setTotalRounds(rounds)
      setPhase('playing')
      setOpponentAnsweredCount(0)
    })

    socket.on('roundStart', ({ prompt, options, type, round: r, total, duration, streaks }) => {
      setRound(r)
      setTotalRounds(total)
      if (streaks) setStreaks(streaks)
      setQuestion({ prompt, options, type })
      setAnswer('')
      setAnswered(false)
      setAnsweredTime(0)
      setOpponentAnswered(false)
      setOpponentAnsweredCount(0)
      setRoundWinner(null)
      setRoundPlayers([])
      setPhase('playing')
      clearInterval(timerRef.current)
      setTimeLeft(Math.ceil(duration / 1000))
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); return 0 }; return prev - 1 })
      }, 1000)
      setTimeout(() => answerRef.current?.focus(), 100)
    })

    socket.on('opponentAnswered', ({ answeredCount }) => {
      setOpponentAnswered(true)
      if (answeredCount !== undefined) setOpponentAnsweredCount(answeredCount)
    })

    socket.on('roundResult', ({ winner: w, scores: s, players: rp, streaks: newStreaks }) => {
      setRoundWinner(w)
      setScores(s)
      setRoundPlayers(rp || [])
      if (newStreaks) setStreaks(newStreaks)
      setPhase('roundResult')
      if (w === myId) fireConfetti()
    })

    socket.on('matchEnd', ({ winner: w, finalScores: fs, topic: t, numQuestions: nq, history: h, players: mp, streaks: finalStreaks }) => {
      setMatchWinner(w)
      setFinalScores(fs)
      setMatchTopic(t)
      setMatchNumQ(nq)
      setMatchHistory(h || [])
      setMatchPlayers(mp || [])
      if (finalStreaks) setStreaks(finalStreaks)
      setPhase('matchEnd')
      if (w === myId || w === 'draw') fireConfetti()
      const entry = {
        id: Date.now(), date: new Date().toISOString(), topic: t, numQuestions: nq,
        winner: w, myId: socket.id, myScore: fs.find(s => s.id === socket.id)?.score || 0,
        opponentScore: fs.find(s => s.id !== socket.id)?.score || 0,
        opponentName: fs.find(s => s.id !== socket.id)?.name || '?',
        myName: fs.find(s => s.id === socket.id)?.name || 'You',
        history: h || [],
      }
      const updated = [entry, ...loadHistory()].slice(0, 50)
      saveHistory(updated)
      setHistory(updated)
    })

    socket.on('opponentLeft', () => { setError('Opponent left the battle.'); resetToLobby() })
    socket.on('openRooms', (rooms) => setOpenRooms(rooms))
    socket.on('error', (msg) => setError(msg))

    socket.on('sudokuRaceStart', ({ puzzle, raceStart }) => {
      setSudokuPuzzle(puzzle)
      setSudokuGrid(puzzle.map(row => [...row]))
      setSudokuRaceActive(true)
      setSudokuRaceStart(raceStart)
      setSudokuMyTime(null)
      setSudokuWrongCount(0)
      setSudokuSelectedCell(null)
      setSudokuOpponentFinished(false)
      setPhase('sudokuRace')
    })

    socket.on('opponentFinished', ({ playerId, time }) => {
      setSudokuOpponentFinished(true)
    })

    socket.on('cellResult', ({ correct, wrongCount }) => {
      setSudokuWrongCount(wrongCount || 0)
    })

    socket.on('sudokuForcedEnd', ({ reason }) => {
      setSudokuRaceActive(false)
      if (reason === 'tooManyWrong') setError('Too many wrong answers! Race ended.')
    })

    return () => {
      socket.off('roomUpdate'); socket.off('matchStart'); socket.off('roundStart')
      socket.off('roundResult'); socket.off('matchEnd'); socket.off('opponentAnswered')
      socket.off('opponentLeft'); socket.off('openRooms'); socket.off('error')
      socket.off('sudokuRaceStart'); socket.off('opponentFinished')
      socket.off('cellResult'); socket.off('sudokuForcedEnd')
      clearInterval(timerRef.current)
    }
  }, [myId, players])

  const resetToLobby = useCallback(() => {
    setPhase('lobby')
    setRoomCode('')
    setPlayers([])
    setQuestion(null)
    setAnswer('')
    setScores([])
    setRoundWinner(null)
    setRoundPlayers([])
    setSudokuPuzzle(null)
    setSudokuGrid(null)
    setSudokuRaceActive(false)
    setSudokuWrongCount(0)
    setSudokuSelectedCell(null)
    setSudokuOpponentFinished(false)
    setSudokuMyTime(null)
    clearInterval(timerRef.current)
    setTimeout(() => socket.emit('getOpenRooms'), 100)
  }, [])

  const handleCreate = useCallback(() => {
    setError('')
    setIsSudokuTopic(topic === 'sudoku')
    socket.emit('createRoom', { name: name.trim() || 'Player', topic, numQuestions }, ({ ok, code, players: p, error: e }) => {
      if (!ok) { setError(e); return }
      setRoomCode(code); setPlayers(p); setMyId(socket.id); setPhase('waiting')
    })
  }, [name, topic, numQuestions])

  const handleJoin = useCallback(() => {
    const code = joinCode.trim().toUpperCase()
    if (!code) { setError('Enter a room code.'); return }
    setError('')
    socket.emit('joinRoom', { code, name: name.trim() || 'Player' }, ({ ok, players: p, error: e }) => {
      if (!ok) { setError(e); return }
      setRoomCode(code); setPlayers(p); setMyId(socket.id); setPhase('waiting')
    })
  }, [name, joinCode])

  const handleReady = useCallback(() => socket.emit('ready'), [])
  const handleSubmit = useCallback(() => {
    if (!answer.trim() || answered) return
    socket.emit('submitAnswer', { answer: answer.trim() })
    setAnswered(true)
    setAnsweredTime(15 - timeLeft)
    setAnswer('')
  }, [answer, answered, timeLeft])
  const handleLeave = useCallback(() => { socket.emit('leave'); resetToLobby() }, [resetToLobby])
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter' && phase === 'playing' && question) handleSubmit() }, [phase, question, handleSubmit])

  const handleSudokuCellEdit = useCallback((r, c, val) => {
    if (!sudokuPuzzle || sudokuPuzzle[r][c] !== 0) return
    const num = Number(val)
    if (isNaN(num) || num < 1 || num > 9) return
    setSudokuGrid(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = num
      return next
    })
    socket.emit('submitCell', { r, c, val: num })
  }, [sudokuPuzzle])

  const handleSudokuNumberSelect = useCallback((num) => {
    if (!sudokuSelectedCell || !sudokuRaceActive || sudokuWrongCount >= 5) return
    const { r, c } = sudokuSelectedCell
    if (sudokuPuzzle?.[r]?.[c] !== 0) return
    setSudokuGrid(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = num
      return next
    })
    socket.emit('submitCell', { r, c, val: num })
    setSudokuSelectedCell(null)
  }, [sudokuSelectedCell, sudokuPuzzle, sudokuRaceActive, sudokuWrongCount])

  const handleSudokuComplete = useCallback(() => {
    setSudokuMyTime(Date.now() - sudokuRaceStart)
    socket.emit('sudokuComplete')
  }, [sudokuRaceStart])

  const topicInfo = ALL_MODULES.find(t => t.key === topic) || TOPICS.find(t => t.key === topic) || TOPICS[0]
  const myFinalScore = finalScores.find(s => s.id === myId)?.score || 0
  const opponentFinalScore = finalScores.find(s => s.id !== myId)?.score || 0
  const myName = finalScores.find(s => s.id === myId)?.name || 'You'
  const opponentName = finalScores.find(s => s.id !== myId)?.name || 'Opponent'
  const opponentId = finalScores.find(s => s.id !== myId)?.id

  if (phase === 'lobby' && view === 'history') {
    return (
      <div className="app-shell">
        <div className="card is-wide" style={{ padding: '28px 24px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <button className="back-button" onClick={() => setView('play')}>← Back</button>
            <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.3rem' }}>Battle History</h2>
            <div style={{ width: 60 }} />
          </div>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', padding: 40 }}>No battles fought yet. Start one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map(h => {
                const t = ALL_MODULES.find(x => x.key === h.topic) || TOPICS.find(x => x.key === h.topic) || TOPICS[0]
                const isWin = h.winner === h.myId
                const isDraw = h.winner === 'draw'
                return (
                  <div key={h.id} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)' }}>{h.numQuestions}Q</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: isDraw ? 'rgba(122,162,247,0.15)' : isWin ? 'rgba(92,184,122,0.15)' : 'rgba(247,118,142,0.15)',
                        color: isDraw ? '#7aa2f7' : isWin ? '#5cb87a' : '#f7768e',
                      }}>
                        {isDraw ? 'Draw' : isWin ? 'Win' : 'Loss'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{h.myName}: {h.myScore}</span>
                      <span style={{ color: 'var(--clr-text-soft)' }}>vs {h.opponentName}: {h.opponentScore}</span>
                    </div>
                    {h.history && h.history.length > 0 && (
                      <div style={{ marginTop: 8, borderTop: '1px solid var(--clr-border)', paddingTop: 8 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Questions</div>
                        {h.history.map((r, i) => {
                          const me = r.players?.find(p => p.id === h.myId)
                          const opp = r.players?.find(p => p.id !== h.myId)
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: '0.78rem', borderBottom: i < h.history.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                              <span style={{ color: 'var(--clr-text-soft)', minWidth: 18 }}>#{i + 1}</span>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.prompt}</span>
                              <span style={{ color: 'var(--clr-text-soft)', minWidth: 50, textAlign: 'right' }}>{r.correctAnswer}</span>
                              <span style={{ color: me?.correct ? '#5cb87a' : '#f7768e', minWidth: 40, textAlign: 'right', fontWeight: 600 }}>{formatTime(me?.time)}</span>
                              <span style={{ color: opp?.correct ? '#5cb87a' : '#f7768e', minWidth: 40, textAlign: 'right' }}>{formatTime(opp?.time)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)', marginTop: 6 }}>{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString()}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'lobby') return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '28px 24px', maxWidth: 580, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <button className="back-button" onClick={onBack}>← Back</button>
          <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)' }}>⚔️ Battle Arena</h1>
          <button className="back-button" onClick={() => setView('history')} style={{ fontSize: '0.82rem' }}>History</button>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '0.85rem', marginTop: 0, marginBottom: 16 }}>
          Race to answer first — fastest finger wins!
        </p>

        {error && <div style={{ background: 'rgba(247,118,142,0.1)', border: '1px solid rgba(247,118,142,0.3)', color: '#f7768e', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>{error}</div>}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" maxLength={20}
            style={{ width: '100%', padding: '9px 12px', marginTop: 5, borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Battle Field</label>
          <input value={moduleSearch} onChange={e => setModuleSearch(e.target.value)} placeholder="Search modules..." autoFocus={false}
            style={{ width: '100%', padding: '7px 10px', marginTop: 5, borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
          <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(MODULE_CATEGORIES).map(([cat, modules]) => {
              const filtered = moduleSearch.trim()
                ? modules.filter(m => m.name.toLowerCase().includes(moduleSearch.toLowerCase()) || m.key.includes(moduleSearch.toLowerCase()))
                : modules
              if (!filtered.length) return null
              return (
                <div key={cat}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{cat}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {filtered.map(m => {
                      const roomCount = (openRooms[m.key] || []).length
                      return (
                        <button key={m.key} onClick={() => { setTopic(m.key); setModuleSearch('') }} style={{
                          padding: '5px 8px', borderRadius: 'var(--radius)', border: topic === m.key ? `2px solid ${m.color}` : '1px solid var(--clr-border)',
                          background: topic === m.key ? `${m.color}22` : 'var(--clr-surface)',
                          color: 'var(--clr-text)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                          fontSize: '0.72rem', fontWeight: topic === m.key ? 700 : 500, position: 'relative', display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{ fontSize: '0.85rem' }}>{m.icon}</span>
                          <span>{m.name}</span>
                          {roomCount > 0 && <span style={{ background: '#e8b931', color: '#000', borderRadius: 8, padding: '0 5px', fontSize: '0.6rem', fontWeight: 700 }}>{roomCount}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {topic !== 'sudoku' && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Number of Questions</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
            {QUESTION_COUNTS.map(n => (
              <button key={n} onClick={() => setNumQuestions(n)} style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius)', border: numQuestions === n ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                background: numQuestions === n ? 'rgba(122,162,247,0.12)' : 'var(--clr-surface)',
                color: 'var(--clr-text)', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.15s',
              }}>{n}</button>
            ))}
          </div>
        </div>
        )}

        <button onClick={handleCreate} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none', background: topicInfo.color || 'var(--clr-accent)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: 14 }}>
          {topic === 'sudoku' ? `Open ${topicInfo.name || topicInfo.label} Race` : `Create ${topicInfo.name || topicInfo.label} Room (${numQuestions}Q)`}
        </button>

        {(openRooms[topic] || []).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Open Rooms — {topicInfo.name || topicInfo.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(openRooms[topic] || []).map(r => (
                <button key={r.code} onClick={() => {
                  if (!name.trim()) { setError('Enter your name first.'); return }
                  socket.emit('joinRoom', { code: r.code, name: name.trim() || 'Player' }, ({ ok, code: c, players: p, error: e }) => {
                    if (!ok) { setError(e); return }
                    setRoomCode(c); setPlayers(p); setMyId(socket.id); setPhase('waiting')
                  })
                }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius)',
                  border: `1px solid ${topicInfo.color}44`, background: `${topicInfo.color}0a`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.1em', color: topicInfo.color }}>{r.code}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--clr-text)' }}>
                    <span style={{ fontWeight: 600 }}>{r.host}</span>
                    <span style={{ color: 'var(--clr-text-soft)', margin: '0 4px' }}>·</span>
                    {r.numQuestions}Q
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, background: topicInfo.color, color: '#fff', fontWeight: 700 }}>Join</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '10px 0', color: 'var(--clr-text-soft)', fontSize: '0.8rem' }}>— or join by code —</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="Room code" maxLength={4}
            style={{ flex: 1, padding: '9px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', boxSizing: 'border-box' }} />
          <button onClick={handleJoin} style={{ padding: '9px 20px', borderRadius: 'var(--radius)', border: 'none', background: '#4a90d9', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Join</button>
        </div>
      </div>
    </div>
  )

  if (phase === 'waiting') return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '28px 24px', maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem' }}>Waiting Room</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Field:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: topicInfo.color }}>{topicInfo.icon} {topicInfo.name || topicInfo.label}</span>
          <span style={{ color: 'var(--clr-text-soft)', margin: '0 4px' }}>·</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{numQuestions} Questions</span>
        </div>

        <div style={{ background: 'var(--clr-surface)', border: '2px dashed var(--clr-accent)', borderRadius: 12, padding: '16px 0', marginBottom: 16, cursor: 'pointer' }}
          onClick={() => navigator.clipboard?.writeText(roomCode)}>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.3em', color: 'var(--clr-accent)', fontFamily: 'monospace' }}>{roomCode}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>click to copy</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          {players.map((p, i) => (
            <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 5, borderRadius: 'var(--radius-sm)', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '1.1rem' }}>{p.ready ? '✅' : '⏳'}</span>
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>{p.name}{p.id === myId ? ' (you)' : ''}</span>
            </div>
          ))}
          {players.length < 2 && <div style={{ padding: '12px', color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontStyle: 'italic' }}>Waiting for opponent...</div>}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleLeave} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Leave</button>
          {players.length === 2 && (
            <button onClick={handleReady} style={{ flex: 2, padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: players.find(p => p.id === myId)?.ready ? '#5cb87a' : topicInfo.color, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {players.find(p => p.id === myId)?.ready ? 'Ready ✓' : 'Ready!'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (phase === 'playing') return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '20px 24px', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: topicInfo.color }}>{topicInfo.icon} {topicInfo.name || topicInfo.label}</span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--clr-text-soft)', background: 'var(--clr-surface)', padding: '2px 8px', borderRadius: 6 }}>{roomCode}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-text)' }}>Q{round}/{totalRounds}</span>
          <Timer timeLeft={timeLeft} totalDuration={15000} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
          {scores.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8,
              background: s.id === myId ? `${topicInfo.color}18` : 'var(--clr-surface)',
              border: `1px solid ${s.id === myId ? topicInfo.color : 'var(--clr-border)'}`,
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: s.id === myId ? topicInfo.color : 'var(--clr-text-soft)' }}>{s.name}{s.id === myId ? ' (you)' : ''}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: s.id === myId ? topicInfo.color : 'var(--clr-text)' }}>{s.score}</span>
              {streaks[s.id] >= 3 && (
                <span style={{ fontSize: '0.7rem', animation: 'streak-flame 1.5s infinite' }}>🔥{streaks[s.id] >= 5 ? `x${streaks[s.id]}` : ''}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ height: 4, background: 'var(--clr-border)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(round / totalRounds) * 100}%`, background: topicInfo.color, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>

        {question && (
          <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 12, padding: '18px 20px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: 'var(--clr-text)' }}>{question.prompt}</div>
            {question.hint && <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>{question.hint}</div>}
          </div>
        )}

        {question?.grid && question?.row != null && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 0, border: '2px solid var(--clr-text)', borderRadius: 4, overflow: 'hidden', marginBottom: 10, maxWidth: 360, margin: '0 auto 10px' }}>
            {question.grid.map((row, r) => row.map((val, c) => {
              const isTarget = r === question.row && c === question.col
              const thickR = c % 3 === 2 && c < 8
              const thickB = r % 3 === 2 && r < 8
              return (
                <div key={`${r}-${c}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  aspectRatio: '1', fontSize: 'clamp(0.6rem, 1.8vw, 0.85rem)', fontFamily: 'monospace',
                  fontWeight: isTarget ? 700 : val !== 0 ? 500 : 400,
                  background: isTarget ? `${topicInfo.color}30` : val !== 0 ? '#fff' : 'rgba(255,255,255,0.5)',
                  color: isTarget ? topicInfo.color : 'var(--clr-text)',
                  borderRight: thickR ? '2px solid var(--clr-text)' : '1px solid var(--clr-border)',
                  borderBottom: thickB ? '2px solid var(--clr-text)' : '1px solid var(--clr-border)',
                }}>{val !== 0 ? val : '?'}</div>
              )
            }))}
          </div>
        )}

        {question?.type === 'mcq' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {question.options.map((opt, i) => (
              <button key={i} onClick={() => { if (!answered) { setAnswer(String(i)); setTimeout(handleSubmit, 50) } }} style={{
                padding: '13px 10px', borderRadius: 'var(--radius)', border: answered ? '2px solid var(--clr-text-soft)' : '2px solid var(--clr-border)',
                background: answered ? 'var(--clr-surface)' : 'var(--clr-surface)', color: 'var(--clr-text)', fontWeight: 600, fontSize: '0.92rem',
                cursor: answered ? 'default' : 'pointer', transition: 'all 0.15s', textAlign: 'center', opacity: answered ? 0.6 : 1,
              }} onMouseEnter={e => { if (!answered) e.target.style.borderColor = topicInfo.color }}
                 onMouseLeave={e => { if (!answered) e.target.style.borderColor = 'var(--clr-border)' }}>
                {opt}
              </button>
            ))}
          </div>
        ) : answered ? (
          <div style={{ textAlign: 'center', padding: '14px 20px', marginBottom: 14, background: 'rgba(92,184,122,0.1)', border: '2px solid #5cb87a', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#5cb87a' }}>✓ Answered in {answeredTime}s</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: 4 }}>Waiting for opponent...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input ref={answerRef} value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Your answer" autoFocus
              style={{ flex: 1, padding: '11px 14px', borderRadius: 'var(--radius)', border: '2px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '1.05rem', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box' }} />
            <button onClick={handleSubmit} style={{ padding: '11px 24px', borderRadius: 'var(--radius)', border: 'none', background: topicInfo.color, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Submit</button>
          </div>
        )}

        {opponentAnswered && <div style={{ textAlign: 'center', fontSize: '0.76rem', color: '#5cb87a', marginTop: 6, fontWeight: 600 }}>✓ Opponent answered ({opponentAnsweredCount}/2)</div>}
        {opponentAnsweredCount === 2 && <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--clr-text-soft)', marginTop: 3 }}>Both players have answered...</div>}
      </div>
    </div>
  )

  if (phase === 'sudokuRace' && sudokuGrid) {
    return (
      <div className="app-shell">
        <div className="card is-wide" style={{ padding: '20px 24px', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1abc9c' }}>🔢 Sudoku Race</span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--clr-text-soft)', background: 'var(--clr-surface)', padding: '2px 8px', borderRadius: 6 }}>{roomCode}</span>
          </div>

          {sudokuOpponentFinished && (
            <div style={{ textAlign: 'center', padding: '8px 12px', marginBottom: 10, background: 'rgba(232,185,49,0.12)', border: '1px solid #e8b931', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#e8b931' }}>
              Opponent finished! Hurry up!
            </div>
          )}

          {sudokuWrongCount >= 5 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(247,118,142,0.1)', border: '1px solid rgba(247,118,142,0.3)', borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f7768e', marginBottom: 6 }}>Too many wrong answers!</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>You made 5+ mistakes. Race ended.</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)' }}>Wrong answers: </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: sudokuWrongCount >= 3 ? '#f7768e' : 'var(--clr-text)' }}>{sudokuWrongCount}/5</span>
                {sudokuWrongCount >= 3 && <span style={{ fontSize: '0.7rem', color: '#f7768e', marginLeft: 6 }}>⚠ Careful!</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 0, border: '2px solid var(--clr-text)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                {sudokuGrid.map((row, r) => row.map((val, c) => {
                  const isPuzzle = sudokuPuzzle?.[r]?.[c] !== 0
                  const isSelected = sudokuSelectedCell?.r === r && sudokuSelectedCell?.c === c
                  const thickR = c % 3 === 2 && c < 8
                  const thickB = r % 3 === 2 && r < 8
                  return (
                    <div key={`${r}-${c}`} onClick={() => {
                      if (!isPuzzle && val === 0 && sudokuRaceActive && sudokuWrongCount < 5) {
                        setSudokuSelectedCell(isSelected ? null : { r, c })
                      }
                    }} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      aspectRatio: '1', fontSize: 'clamp(0.6rem, 1.8vw, 0.85rem)', fontFamily: 'monospace',
                      fontWeight: isPuzzle ? 700 : 500,
                      background: isSelected ? '#1abc9c33' : isPuzzle ? 'var(--clr-surface)' : val !== 0 ? 'rgba(26,188,156,0.12)' : 'rgba(255,255,255,0.5)',
                      color: isPuzzle ? 'var(--clr-text)' : '#1abc9c',
                      borderRight: thickR ? '2px solid var(--clr-text)' : '1px solid var(--clr-border)',
                      borderBottom: thickB ? '2px solid var(--clr-text)' : '1px solid var(--clr-border)',
                      cursor: !isPuzzle && val === 0 && sudokuRaceActive && sudokuWrongCount < 5 ? 'pointer' : 'default',
                    }}>{val !== 0 ? val : ''}</div>
                  )
                }))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button key={n} onClick={() => handleSudokuNumberSelect(n)} disabled={!sudokuSelectedCell} style={{
                    padding: '8px 0', borderRadius: 6, border: '1px solid var(--clr-border)',
                    background: sudokuSelectedCell ? '#1abc9c' : 'var(--clr-surface)',
                    color: sudokuSelectedCell ? '#fff' : 'var(--clr-text-soft)',
                    fontWeight: 700, fontSize: '1rem', cursor: sudokuSelectedCell ? 'pointer' : 'default', opacity: sudokuSelectedCell ? 1 : 0.5,
                  }}>{n}</button>
                ))}
              </div>

              {sudokuSelectedCell && (
                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#1abc9c', marginBottom: 8 }}>
                  Cell selected — tap a number above to fill
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => {
                  if (window.confirm('Are you sure you want to give up?')) handleSudokuComplete()
                }} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Give Up</button>
                <button onClick={handleSudokuComplete} style={{ flex: 2, padding: '10px', borderRadius: 'var(--radius)', border: 'none', background: '#1abc9c', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>I'm Done!</button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'roundResult') {
    const me = roundPlayers.find(p => p.id === myId)
    const opp = roundPlayers.find(p => p.id !== myId)
    return (
      <div className="app-shell">
        <div className="card is-wide" style={{ padding: '24px 20px', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem' }}>
            {roundWinner === myId ? '🎉 You won the round!' : roundWinner ? 'Opponent got it first' : '⏱ Time up — draw'}
          </h2>

          <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', marginBottom: 3 }}>Question</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{question?.prompt}</div>
            <div style={{ fontSize: '0.82rem', color: '#5cb87a', fontWeight: 700, marginTop: 4 }}>Answer: {roundPlayers.length ? roundPlayers[0]?.id === myId ? '' : '' : ''}{(() => {
              const h = matchHistory[round - 1]
              return h?.correctAnswer || ''
            })()}</div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
            {roundPlayers.map(p => (
              <div key={p.id} style={{
                padding: '10px 14px', borderRadius: 10, background: 'var(--clr-surface)',
                border: p.id === roundWinner ? `2px solid ${topicInfo.color}` : '1px solid var(--clr-border)',
                textAlign: 'center', minWidth: 110,
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)' }}>{p.name}{p.id === myId ? ' (you)' : ''}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 4, color: p.correct ? '#5cb87a' : '#f7768e' }}>
                  {p.correct ? '✓ Correct' : '✗ Wrong'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: topicInfo.color, marginTop: 2 }}>
                  {formatTime(p.time)}
                </div>
                {streaks[p.id] >= 3 && (
                  <div style={{ fontSize: '0.7rem', color: '#e8b931', marginTop: 4 }}>🔥{streaks[p.id] >= 5 ? `x${streaks[p.id]}` : ''}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 4 }}>
            {scores.map(s => (
              <div key={s.id} style={{ fontSize: '0.82rem', fontWeight: 600, color: s.id === myId ? topicInfo.color : 'var(--clr-text-soft)' }}>
                {s.name}: {s.score}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: 8 }}>Next round in 3s...</p>
        </div>
      </div>
    )
  }

  if (phase === 'matchEnd') return (
    <div className="app-shell">
      <div className="card is-wide" style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem' }}>
            {matchWinner === 'draw' ? "🤝 It's a Draw!" : matchWinner === myId ? '🏆 You Won!' : 'Better luck next time!'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', color: topicInfo.color }}>{topicInfo.icon} {topicInfo.name || topicInfo.label}</span>
            <span style={{ color: 'var(--clr-text-soft)', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: '0.85rem' }}>{matchNumQ} Questions</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ padding: '12px 18px', borderRadius: 12, background: 'var(--clr-surface)', border: matchWinner === myId ? `2px solid ${topicInfo.color}` : '1px solid var(--clr-border)', textAlign: 'center', minWidth: 110 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)' }}>{myName} (you)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: topicInfo.color }}>{myFinalScore}</div>
            {streaks[myId] >= 3 && (
              <div style={{ fontSize: '0.68rem', color: '#e8b931', marginTop: 4 }}>🔥{streaks[myId] >= 5 ? `x${streaks[myId]}` : ''}</div>
            )}
          </div>
          <div style={{ padding: '12px 18px', borderRadius: 12, background: 'var(--clr-surface)', border: matchWinner !== myId && matchWinner !== 'draw' ? `2px solid ${topicInfo.color}` : '1px solid var(--clr-border)', textAlign: 'center', minWidth: 110 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)' }}>{opponentName}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--clr-text)' }}>{opponentFinalScore}</div>
            {streaks[opponentId] >= 3 && (
              <div style={{ fontSize: '0.68rem', color: '#e8b931', marginTop: 4 }}>🔥{streaks[opponentId] >= 5 ? `x${streaks[opponentId]}` : ''}</div>
            )}
          </div>
        </div>

        {matchHistory.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Question Breakdown</div>
            <div style={{ background: 'var(--clr-surface)', borderRadius: 10, border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
              {matchHistory.map((r, i) => {
                const me = r.players?.find(p => p.id === myId)
                const opp = r.players?.find(p => p.id !== myId)
                const rowBg = r.winner === myId ? 'rgba(92,184,122,0.06)' : r.winner ? 'rgba(247,118,142,0.04)' : 'transparent'
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto auto auto', alignItems: 'center', gap: 8, padding: '8px 12px', background: rowBg, borderBottom: i < matchHistory.length - 1 ? '1px solid var(--clr-border)' : 'none', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--clr-text-soft)', fontWeight: 600 }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{r.prompt}</div>
                      <div style={{ fontSize: '0.72rem', color: '#5cb87a' }}>→ {r.correctAnswer}</div>
                      {streaks[me?.id] >= 3 && (
                        <div style={{ fontSize: '0.65rem', color: '#e8b931' }}>🔥{streaks[me?.id] >= 5 ? `x${streaks[me?.id]}` : ''}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)' }}>{myName}</div>
                      <div style={{ fontWeight: 700, color: me?.correct ? '#5cb87a' : '#f7768e' }}>{me?.correct ? '✓' : '✗'} {formatTime(me?.time)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)' }}>{opponentName}</div>
                      <div style={{ fontWeight: 600, color: opp?.correct ? '#5cb87a' : '#f7768e' }}>{opp?.correct ? '✓' : '✗'} {formatTime(opp?.time)}</div>
                    </div>
                    <div style={{ minWidth: 24, textAlign: 'center' }}>
                      {r.winner === myId ? '🏅' : r.winner ? '' : '🤝'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => resetToLobby()} style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius)', border: 'none', background: topicInfo.color, color: '#fff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}>New Battle</button>
          <button onClick={() => { resetToLobby(); onBack() }} style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}>Home</button>
        </div>
      </div>
    </div>
  )

  return null
}

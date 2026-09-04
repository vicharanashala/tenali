import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, X, Calculator, CircleDot, PieChart, Percent, Scale, ArrowLeftRight,
  TrendingUp, Landmark, Receipt, LineChart, Gauge, FunctionSquare, Hash,
  Brackets, Layers, Divide, Square, SquareRadical, Binary, Equal, Sigma,
  Triangle, Infinity, Variable, BookOpen, Grid3x3, ArrowUpRight, Compass,
  Shapes, Ruler, MapPin, RotateCw, Circle, Cone, Waves, Dice5, BarChart3,
  ListOrdered, Sparkles, ChevronUp, Superscript, Activity, Box, GitBranch,
  CircleDot as DotIcon,
} from 'lucide-react'
import { getOrCreateAnonymousId } from '../anonId'
import './treasurehunt.css'
import EquationGate from './EquationGate'
import LifeHearts from './LifeHearts'

const API = import.meta.env.VITE_API_BASE_URL || ''

function emptyGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ status: 'hidden' }))
  )
}

// ─── Auth helper (reads existing Tenali auth from localStorage) ─────────────
function getUsername() {
  try {
    const raw = localStorage.getItem('tenali-auth-user')
    const user = raw ? JSON.parse(raw) : null
    return user?.username || 'guest'
  } catch { return 'guest' }
}

// ─── Persistence helpers ────────────────────────────────────────────────────
function getProgressKey() {
  return `tenali-treasurehunt-progress-${getUsername()}`
}

function loadAllProgress() {
  try {
    const raw = localStorage.getItem(getProgressKey())
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveWorldProgress(worldId, topicTiers, hasPlayed) {
  const all = loadAllProgress()
  const existing = all[worldId] || {}
  all[worldId] = {
    ...existing,
    topicTiers,
    lastPlayed: Date.now(),
    ...(hasPlayed ? { hasPlayed: true } : {}),
  }
  try {
    localStorage.setItem(getProgressKey(), JSON.stringify(all))
  } catch { }
}

function getWorldProgress(worldId) {
  const all = loadAllProgress()
  return all[worldId] || null
}

const TOPIC_LABELS = {
  addition: 'Addition',
  multiply: 'Multiplication',
  basicarith: 'Basic Arithmetic',
  decimals: 'Decimals',
  fractionadd: 'Fraction Addition',
  percent: 'Percentages',
  ratio: 'Ratio',
  rounding: 'Rounding',
  profitloss: 'Profit & Loss',
  banking: 'Banking',
  gst: 'GST',
  shares: 'Shares',
  sdt: 'Speed, Distance & Time',
  variation: 'Variation',
  stdform: 'Standard Form',
  bounds: 'Bounds',
  hcflcm: 'HCF & LCM',
  primefactor: 'Prime Factorization',
  squaring: 'Squaring',
  sqrt: 'Square Roots',
  bases: 'Number Bases',
  tatsavit: 'Tatsavit Drill',
  lineareq: 'Linear Equations',
  quadratic: 'Quadratics',
  ineq: 'Inequalities',
  indices: 'Indices',
  qformula: 'Quadratic Formula',
  funceval: 'Function Evaluation',
  surds: 'Surds',
  remfactor: 'Remainder & Factor Theorem',
  binomial: 'Binomial Expansion',
  complex: 'Complex Numbers',
  polymul: 'Polynomial Multiplication',
  polyfactor: 'Polynomial Factorization',
  log: 'Logarithms',
  integ: 'Integration',
  limits: 'Limits',
  diff: 'Differentiation',
  diffeq: 'Differential Equations',
  matrix: 'Matrices',
  vectors: 'Vectors',
  dotprod: 'Dot Product',
  linprog: 'Linear Programming',
  lineq: 'Line Equations',
  angles: 'Angles',
  triangles: 'Triangles',
  congruence: 'Congruence',
  pythag: 'Pythagoras',
  polygons: 'Polygons',
  similarity: 'Similarity',
  heron: "Heron's Formula",
  mensur: 'Mensuration',
  coordgeom: 'Coordinate Geometry',
  transform: 'Transformations',
  circmeasure: 'Circle Measure',
  conics: 'Conics',
  circleth: 'Circle Theorems',
  section: 'Section Formula',
  trig: 'Trigonometry',
  invtrig: 'Inverse Trigonometry',
  bearings: 'Bearings',
  prob: 'Probability',
  stats: 'Statistics',
  sequences: 'Sequences',
  sets: 'Sets',
  permcomb: 'Permutations & Combinations',
}

function formatTopicName(topic) {
  if (!topic) return ''
  if (TOPIC_LABELS[topic]) return TOPIC_LABELS[topic]
  return topic.charAt(0).toUpperCase() + topic.slice(1)
}

const TOPIC_ICONS = {
  addition: Plus,
  multiply: X,
  basicarith: Calculator,
  decimals: CircleDot,
  fractionadd: PieChart,
  percent: Percent,
  ratio: Scale,
  rounding: ArrowLeftRight,
  profitloss: TrendingUp,
  banking: Landmark,
  gst: Receipt,
  shares: LineChart,
  sdt: Gauge,
  variation: FunctionSquare,
  stdform: Hash,
  bounds: Brackets,
  hcflcm: Layers,
  primefactor: Divide,
  squaring: Square,
  sqrt: SquareRadical,
  bases: Binary,
  tatsavit: Sparkles,
  lineareq: Equal,
  quadratic: Sigma,
  ineq: ChevronUp,
  indices: Superscript,
  qformula: Sigma,
  funceval: FunctionSquare,
  surds: SquareRadical,
  remfactor: Variable,
  binomial: BookOpen,
  complex: Infinity,
  polymul: X,
  polyfactor: Divide,
  log: Activity,
  integ: Sigma,
  limits: TrendingUp,
  diff: GitBranch,
  diffeq: Waves,
  matrix: Grid3x3,
  vectors: ArrowUpRight,
  dotprod: DotIcon,
  linprog: Grid3x3,
  lineq: Equal,
  angles: Compass,
  triangles: Triangle,
  congruence: Shapes,
  pythag: Ruler,
  polygons: Shapes,
  similarity: Shapes,
  heron: Ruler,
  mensur: Box,
  coordgeom: MapPin,
  transform: RotateCw,
  circmeasure: Circle,
  conics: Cone,
  circleth: Circle,
  section: MapPin,
  trig: Waves,
  invtrig: RotateCw,
  bearings: Compass,
  prob: Dice5,
  stats: BarChart3,
  sequences: ListOrdered,
  sets: Layers,
  permcomb: Layers,
}

const TOPIC_TINTS = [
  'th-topic-tint-1',
  'th-topic-tint-2',
  'th-topic-tint-3',
  'th-topic-tint-4',
  'th-topic-tint-5',
  'th-topic-tint-6',
]

function getTopicIcon(topic) {
  return TOPIC_ICONS[topic] || BookOpen
}

export default function TreasureHuntApp({ onBack }) {
  // How-to-Play: show once per browser session
  const [showHowToPlay, setShowHowToPlay] = useState(() => {
    return !sessionStorage.getItem('th-how-to-play-seen')
  })

  // ── Phase machine ──────────────────────────────────────────────────────────
  // Phases: 'worldSelect' → 'confidenceSelect' → 'diagnostic' → 'playing'
  const [phase, setPhase] = useState('worldSelect')

  // World select state
  const [worlds, setWorlds] = useState([])
  const [loadError, setLoadError] = useState('')
  const [loadingWorlds, setLoadingWorlds] = useState(true)
  const [selectedWorldId, setSelectedWorldId] = useState(null)
  const [selectedWorld, setSelectedWorld] = useState(null)

  // Resume-or-fresh prompt state (Part H)
  const [resumePrompt, setResumePrompt] = useState(null)  // { worldId, worldName, savedTiers }

  // World topics preview (shown after world card click)
  const [worldPreview, setWorldPreview] = useState(null)

  // Confidence select (no extra state needed beyond selectedWorld)

  // Topic tiers (populated by confidence pick, diagnostic result, or loaded progress)
  const [topicTiers, setTopicTiers] = useState(null)

  // Diagnostic state
  const [diagnosticId, setDiagnosticId] = useState(null)
  const [diagnosticQuestions, setDiagnosticQuestions] = useState([])
  const [diagnosticIndex, setDiagnosticIndex] = useState(0)
  const [diagnosticLoading, setDiagnosticLoading] = useState(false)
  const [diagnosticSubmitting, setDiagnosticSubmitting] = useState(false)

  // Playing state
  const [startError, setStartError] = useState('')
  const [starting, setStarting] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [gridSize, setGridSize] = useState(5)
  const [lives, setLives] = useState(3)
  const [tier, setTier] = useState('easy')
  const [cells, setCells] = useState(() => emptyGrid(5))
  const [revealError, setRevealError] = useState('')
  const [revealing, setRevealing] = useState(false)
  const [activeGateCell, setActiveGateCell] = useState(null)
  const [gameEnd, setGameEnd] = useState(null)
  const [hintCell, setHintCell] = useState(null)
  const [hasTappedOnce, setHasTappedOnce] = useState(false)
  const [statusBarBreaking, setStatusBarBreaking] = useState(null)
  const prevLivesRef = useRef(3)

  const dismissHowToPlay = () => {
    sessionStorage.setItem('th-how-to-play-seen', '1')
    setShowHowToPlay(false)
  }

  // ── Part D: Fetch worlds on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoadingWorlds(true)
    setLoadError('')
    fetch(`${API}/treasurehunt-api/worlds`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setWorlds(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (cancelled) return
        setLoadError(e.message || 'Failed to load worlds')
      })
      .finally(() => {
        if (!cancelled) setLoadingWorlds(false)
      })
    return () => { cancelled = true }
  }, [])

  // ── Part D: Handle world card click ────────────────────────────────────────
  const handleWorldClick = (world) => {
    setSelectedWorldId(world.id)
    setSelectedWorld(world)
    setWorldPreview(world)
  }

  const handleWorldPreviewContinue = () => {
    const world = worldPreview
    setWorldPreview(null)
    if (!world) return
    const saved = getWorldProgress(world.id)
    if (saved && saved.topicTiers && saved.hasPlayed) {
      setResumePrompt({
        worldId: world.id,
        worldName: world.name,
        savedTiers: saved.topicTiers,
      })
    } else {
      setPhase('confidenceSelect')
    }
  }

  const handleWorldPreviewCancel = () => {
    setWorldPreview(null)
    setSelectedWorldId(null)
    setSelectedWorld(null)
  }

  // Part H: Resume with saved tiers
  const handleResume = () => {
    setTopicTiers(resumePrompt.savedTiers)
    setResumePrompt(null)
    startGame(resumePrompt.savedTiers)
  }

  // Part H: Start fresh (go to confidence)
  const handleStartFresh = () => {
    setResumePrompt(null)
    setPhase('confidenceSelect')
  }

  // ── Part E: Confidence pick ────────────────────────────────────────────────
  const handleConfidencePick = (level) => {
    const activeTopics = selectedWorld.topics.filter(t => t.status === 'active')
    if (level === 'adaptive') {
      setPhase('diagnostic')
      return
    }
    const tierValue = { beginner: 'easy', confident: 'medium', advanced: 'hard' }[level]
    const tiers = {}
    activeTopics.forEach(t => { tiers[t.topic] = tierValue })
    setTopicTiers(tiers)
    startGame(tiers)
  }

  // ── Part F: Diagnostic flow ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'diagnostic' || !selectedWorldId) return
    let cancelled = false
    setDiagnosticLoading(true)
    fetch(`${API}/treasurehunt-api/diagnostic/start?worldId=${encodeURIComponent(selectedWorldId)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        setDiagnosticId(data.diagnosticId)
        setDiagnosticQuestions(data.questions)
        setDiagnosticIndex(0)
      })
      .catch(e => {
        if (!cancelled) setLoadError(e.message || 'Failed to start diagnostic')
      })
      .finally(() => { if (!cancelled) setDiagnosticLoading(false) })
    return () => { cancelled = true }
  }, [phase, selectedWorldId])

  const handleDiagnosticAnswer = async (selectedOption) => {
    if (diagnosticSubmitting) return
    setDiagnosticSubmitting(true)
    const q = diagnosticQuestions[diagnosticIndex]
    try {
      await fetch(`${API}/treasurehunt-api/diagnostic/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId, topic: q.topic, selectedOption }),
      })

      if (diagnosticIndex < diagnosticQuestions.length - 1) {
        setDiagnosticIndex(diagnosticIndex + 1)
      } else {
        // All answered — finish diagnostic
        const r = await fetch(`${API}/treasurehunt-api/diagnostic/finish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnosticId }),
        })
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        const data = await r.json()
        setTopicTiers(data.topicTiers)
        // Part H: save diagnostic result
        saveWorldProgress(selectedWorldId, data.topicTiers)
        startGame(data.topicTiers)
      }
    } catch (e) {
      setLoadError(e.message || 'Diagnostic error')
    } finally {
      setDiagnosticSubmitting(false)
    }
  }

  // ── Start game (shared by confidence, diagnostic, and resume) ──────────────
  const startGame = async (tiers) => {
    setStarting(true)
    setStartError('')
    try {
      const r = await fetch(`${API}/treasurehunt-api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId: selectedWorldId,
          topicTiers: tiers,
          gridSize: 5,
          anonId: getOrCreateAnonymousId(),
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.error || `Server returned ${r.status}`)
      }
      const data = await r.json()
      setSessionId(data.sessionId)
      setGridSize(data.gridSize)
      setLives(data.lives)
      setTier(data.tier || 'easy')
      setCells(emptyGrid(data.gridSize))
      setHintCell(data.hintCell || null)
      setHasTappedOnce(false)
      setRevealError('')
      setGameEnd(null)
      setPhase('playing')
    } catch (e) {
      setStartError(e.message || 'Failed to start session')
    } finally {
      setStarting(false)
    }
  }

  // ── Cell tap (updated for flood-fill) ──────────────────────────────────────
  const applyFloodCells = (floodCells) => {
    if (!floodCells || floodCells.length === 0) return
    setCells(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      floodCells.forEach(({ row, col, neighborCount }) => {
        next[row][col] = { status: 'revealed', neighborCount }
      })
      return next
    })
  }

  const handleGameEnd = (status, summary) => {
    if (status && status !== 'in_progress') {
      setGameEnd({ status, summary: summary || null })
      setActiveGateCell(null)
      if (topicTiers && selectedWorldId) {
        saveWorldProgress(selectedWorldId, topicTiers, true)
      }
    }
  }

  const handleCellTap = async (row, col) => {
    if (phase !== 'playing' || !sessionId || revealing || gameEnd) return
    const cell = cells[row][col]
    if (cell.status !== 'hidden') return

    if (!hasTappedOnce) setHasTappedOnce(true)
    setRevealing(true)
    setRevealError('')
    try {
      const r = await fetch(`${API}/treasurehunt-api/cell/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, row, col }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.error || `Server returned ${r.status}`)
      }
      const data = await r.json()
      if (data.type === 'treasure') {
        setCells((prev) => {
          const next = prev.map((r) => r.map((c) => ({ ...c })))
          next[row][col] = {
            status: 'treasure',
            neighborCount: data.neighborCount,
            justRevealed: true,
          }
          return next
        })
      } else if (data.type === 'revealed') {
        // Flood-fill: zero-count cell auto-revealed without question
        applyFloodCells(data.cells)
      } else {
        // Open the EquationGate popup
        setActiveGateCell({ row, col })
      }
      handleGameEnd(data.status, data.summary)
    } catch (e) {
      setRevealError(e.message || 'Failed to reveal cell')
    } finally {
      setRevealing(false)
    }
  }

  const handleGateCorrect = (neighborCount, newTier, livesLeft, floodCells, status, summary) => {
    const { row, col } = activeGateCell
    setCells((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })))
      next[row][col] = { status: 'revealed', neighborCount }
      return next
    })
    setTier(newTier)
    setLives(livesLeft)
    setActiveGateCell(null)
    // Apply any flood-fill cells from the correct answer
    if (floodCells && floodCells.length > 0) {
      applyFloodCells(floodCells)
    }
    handleGameEnd(status, summary)
  }

  const handleGateWrong = (livesLeft, newTier, status, summary) => {
    // Trigger heartbreak on status bar heart
    const lostIndex = livesLeft // the heart at this index is the one that was lost
    setStatusBarBreaking(lostIndex)
    setTier(newTier)
    setLives(livesLeft)
    setActiveGateCell(null)
    handleGameEnd(status, summary)
    // Clear breaking state after animation
    setTimeout(() => setStatusBarBreaking(null), 2000)
  }

  const handleGateClose = () => {
    setActiveGateCell(null)
  }
  const handleBackToWorlds = () => {
    setGameEnd(null)
    setSessionId(null)
    setSelectedWorldId(null)
    setSelectedWorld(null)
    setTopicTiers(null)
    setPhase('worldSelect')
  }

  const handlePlayAgain = () => {
    if (topicTiers) {
      setGameEnd(null)
      startGame(topicTiers)
    }
  }

  const renderSessionSummary = (summary) => {
    if (!summary) return null
    const { topicBreakdown, weakestTopic, treasuresFound, totalTreasures } = summary
    return (
      <div className="th-summary">
        <p className="th-summary-heading">What you practiced</p>
        {topicBreakdown && topicBreakdown.length > 0 ? (
          <ul className="th-summary-list">
            {topicBreakdown.map((entry) => (
              <li key={entry.topic}>
                {formatTopicName(entry.topic)}: {entry.correct}/{entry.attempted} correct
              </li>
            ))}
          </ul>
        ) : (
          <p className="th-summary-empty">No questions this round — great exploring!</p>
        )}
        {weakestTopic && (
          <p className="th-summary-weakest">
            Focus next time: {formatTopicName(weakestTopic)}
          </p>
        )}
        {totalTreasures != null && (
          <p className="th-summary-treasures">
            Treasures found: {treasuresFound}/{totalTreasures}
          </p>
        )}
      </div>
    )
  }

  const renderCelebration = () => {
    const emojis = ['🎉', '🏆', '⭐', '🎊', '✨', '💎', '🥇', '🌟']
    return (
      <div className="th-celebration-container">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className="th-confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              fontSize: `${1 + Math.random() * 1.5}rem`,
            }}
          >
            {emojis[i % emojis.length]}
          </span>
        ))}
      </div>
    )
  }

  const renderEndScreen = () => {
    if (!gameEnd) return null
    const { status, summary } = gameEnd
    const isWin = status === 'won'

    return (
      <div className={`th-end-screen ${isWin ? 'th-end-win' : 'th-end-lose'}`}>
        {isWin && renderCelebration()}
        {isWin ? (
          <>
            <div className="th-win-trophy">🏆</div>
            <h2 className="th-end-title th-win-title">
              You cleared the grid!
            </h2>
            <p className="th-end-message">
              Every cell searched — the treasure hunt is complete!
            </p>
            {renderSessionSummary(summary)}
            <div className="th-end-actions">
              <button type="button" className="th-htp-btn" onClick={handlePlayAgain}>
                Play Again
              </button>
              <button
                type="button"
                className="th-htp-btn th-end-secondary-btn"
                onClick={handleBackToWorlds}
              >
                Back to Worlds
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="th-lose-emoji">😤</div>
            <h2 className="th-end-title th-lose-title">
              Oh shit! Better luck next time
            </h2>
            <p className="th-end-message">
              You found {summary?.treasuresFound ?? 0} treasure{(summary?.treasuresFound ?? 0) === 1 ? '' : 's'} before your lives ran out.
            </p>
            <div className="th-lose-hearts">
              <LifeHearts lives={0} maxLives={3} size="lg" />
            </div>
            <p className="th-lose-inspire">
              Every expert was once a beginner. Get back in there and crush it! 💪🔥
            </p>
            {renderSessionSummary(summary)}
            <div className="th-end-actions">
              <button type="button" className="th-htp-btn" onClick={handlePlayAgain}>
                Try Again
              </button>
              <button
                type="button"
                className="th-htp-btn th-end-secondary-btn"
                onClick={handleBackToWorlds}
              >
                Back to Worlds
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const handleBack = () => {
    if (phase === 'worldSelect') {
      onBack()
      return
    }
    if (phase === 'confidenceSelect') {
      setPhase('worldSelect')
      setSelectedWorldId(null)
      setSelectedWorld(null)
      return
    }
    if (phase === 'diagnostic') {
      setPhase('confidenceSelect')
      setDiagnosticId(null)
      setDiagnosticQuestions([])
      setDiagnosticIndex(0)
      setDiagnosticLoading(false)
      setDiagnosticSubmitting(false)
      return
    }
    if (phase === 'playing') {
      if (topicTiers && selectedWorldId) {
        saveWorldProgress(selectedWorldId, topicTiers, true)
      }
      setGameEnd(null)
      setSessionId(null)
      setActiveGateCell(null)
      setCells(emptyGrid(gridSize))
      setPhase('worldSelect')
      setSelectedWorldId(null)
      setSelectedWorld(null)
      setTopicTiers(null)
    }
  }

  // ── World name for display ─────────────────────────────────────────────────
  const worldDisplayName = selectedWorld?.name || ''

  return (
    <>
      {/* How to Play modal */}
      {showHowToPlay && (
        <div className="th-htp-overlay">
          <div className="th-htp-popup th-htp-popup--welcome">
            <h2 className="th-htp-title">Welcome, explorer</h2>
            <p className="th-htp-subtitle">Treasure is hidden across this grid</p>

            <div className="th-htp-steps">
              {/* Step 1 — Tap */}
              <div className="th-htp-step">
                <div className="th-htp-step-icon th-htp-icon--tap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8V2H6v6" /><path d="M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" /><line x1="12" y1="14" x2="12" y2="18" />
                  </svg>
                </div>
                <div className="th-htp-step-text">
                  <span className="th-htp-step-title">Tap any cell</span>
                  <span className="th-htp-step-body">Start your search anywhere on the grid.</span>
                </div>
              </div>

              {/* Step 2 — Treasure */}
              <div className="th-htp-step">
                <div className="th-htp-step-icon th-htp-icon--treasure">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="th-htp-step-text">
                  <span className="th-htp-step-title">Found treasure? It opens right away</span>
                  <span className="th-htp-step-body">Nearby cells reveal a number — how many more are hiding close by.</span>
                </div>
              </div>

              {/* Step 3 — Question */}
              <div className="th-htp-step">
                <div className="th-htp-step-icon th-htp-icon--question">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="th-htp-step-text">
                  <span className="th-htp-step-title">Empty cell? Solve to open it</span>
                  <span className="th-htp-step-body">A quick question stands in your way.</span>
                </div>
              </div>

              {/* Step 4 — Lives */}
              <div className="th-htp-step">
                <div className="th-htp-step-icon th-htp-icon--lives">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div className="th-htp-step-text">
                  <span className="th-htp-step-title">Wrong answer costs a life</span>
                  <span className="th-htp-step-body">You get 3 — clear the whole grid before they run out.</span>
                </div>
              </div>
            </div>

            <div className="th-htp-tip">
              Tip: use the revealed numbers as clues to find treasure faster.
            </div>

            <button type="button" className="th-htp-btn" onClick={dismissHowToPlay}>
              Let the hunt begin
            </button>
          </div>
        </div>
      )}

      {/* World topics preview modal */}
      {worldPreview && (
        <div className="th-htp-overlay">
          <div className="th-htp-popup th-world-preview-popup">
            <div className="th-world-preview-header">
              <div className="th-world-preview-badge" aria-hidden="true">
                {worldPreview.icon}
              </div>
              <div className="th-world-preview-header-text">
                <h2 className="th-htp-title th-world-preview-title">{worldPreview.name}</h2>
                <p className="th-world-topics-heading">Topics in this world</p>
              </div>
            </div>
            <div className="th-world-topics-grid">
              {worldPreview.topics.map((t, i) => {
                const Icon = getTopicIcon(t.topic)
                return (
                  <div
                    key={t.topic}
                    className={`th-topic-card ${TOPIC_TINTS[i % TOPIC_TINTS.length]}${t.status !== 'active' ? ' th-topic-soon' : ''}`}
                  >
                    <span className="th-topic-card-icon" aria-hidden="true">
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <span className="th-topic-card-name">{formatTopicName(t.topic)}</span>
                    {t.status !== 'active' && (
                      <span className="th-topic-badge">Soon</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="th-world-preview-actions">
              <button type="button" className="th-htp-btn" onClick={handleWorldPreviewContinue}>
                Continue
              </button>
              <button
                type="button"
                className="th-htp-btn th-world-preview-cancel-btn"
                onClick={handleWorldPreviewCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Part H: Resume-or-fresh prompt (overlays worldSelect) */}
      {resumePrompt && (
        <div className="th-htp-overlay">
          <div className="th-htp-popup">
            <h2 className="th-htp-title">{resumePrompt.worldName}</h2>
            <p style={{ color: 'var(--clr-text-soft)', marginBottom: '20px' }}>
              You've played this world before. Use your previous difficulty levels or recalibrate from scratch.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="button" className="th-htp-btn" onClick={handleResume}>
                Use previous difficulty levels
              </button>
              <button
                type="button"
                className="th-htp-btn"
                style={{ background: 'linear-gradient(135deg, #546e7a, #37474f)' }}
                onClick={handleStartFresh}
              >
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header-row">
        <button type="button" className="back-button" onClick={handleBack}>← Back</button>
      </div>
      <h1>Treasure Hunt</h1>
      <p className="subtitle">Solve &amp; seek on a treasure grid</p>

      {/* ═══ PHASE: worldSelect ═══ */}
      {phase === 'worldSelect' && (
        <div className="welcome-box">
          {loadingWorlds && <p className="th-loading">Loading worlds…</p>}
          {loadError && <p className="th-error">{loadError}</p>}
          {!loadingWorlds && !loadError && worlds.length === 0 && (
            <p className="th-loading">No worlds available.</p>
          )}
          {!loadingWorlds && !loadError && worlds.length > 0 && (
            <>
              <p className="welcome-text">Choose your adventure!</p>
              <div className="th-worlds-grid">
                {worlds.map((w) => {
                  const activeCount = w.topics.filter(t => t.status === 'active').length
                  const totalCount = w.topics.length
                  return (
                    <button
                      key={w.id}
                      type="button"
                      className="th-world-card"
                      onClick={() => handleWorldClick(w)}
                    >
                      <span className="th-world-icon">{w.icon}</span>
                      <span className="th-world-name">{w.name}</span>
                      <span className="th-world-meta">
                        {activeCount} of {totalCount} topics ready
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ PHASE: confidenceSelect ═══ */}
      {phase === 'confidenceSelect' && selectedWorld && (
        <div className="welcome-box">
          <h2 className="th-conf-heading">Before we begin...</h2>
          <p className="th-conf-sub">How confident are you in {selectedWorld.name}?</p>
          <div className="th-conf-grid">
            <button type="button" className="th-conf-card th-conf-beginner" onClick={() => handleConfidencePick('beginner')}>
              <span className="th-conf-icon">🟢</span>
              <span className="th-conf-label">Beginner Explorer</span>
              <span className="th-conf-desc">I know the basics.</span>
            </button>
            <button type="button" className="th-conf-card th-conf-confident" onClick={() => handleConfidencePick('confident')}>
              <span className="th-conf-icon">🔵</span>
              <span className="th-conf-label">Confident Learner</span>
              <span className="th-conf-desc">I'm comfortable with most questions.</span>
            </button>
            <button type="button" className="th-conf-card th-conf-advanced" onClick={() => handleConfidencePick('advanced')}>
              <span className="th-conf-icon">🟣</span>
              <span className="th-conf-label">Advanced Challenger</span>
              <span className="th-conf-desc">I enjoy difficult questions.</span>
            </button>
            <button type="button" className="th-conf-card th-conf-adaptive" onClick={() => handleConfidencePick('adaptive')}>
              <span className="th-conf-icon">🟠</span>
              <span className="th-conf-label">Adaptive <small>(Recommended)</small></span>
              <span className="th-conf-desc">Let the game understand my level.</span>
            </button>
          </div>
          {startError && <p className="th-error">{startError}</p>}
          {starting && <p className="th-loading">Starting…</p>}
        </div>
      )}

      {/* ═══ PHASE: diagnostic ═══ */}
      {phase === 'diagnostic' && (
        <div className="welcome-box">
          <h2 className="th-conf-heading">Quick Diagnostic</h2>
          <p className="th-conf-sub">We'll ask 5 quick questions to understand your level.</p>
          {diagnosticLoading && <p className="th-loading">Preparing questions…</p>}
          {loadError && <p className="th-error">{loadError}</p>}
          {!diagnosticLoading && diagnosticQuestions.length > 0 && (
            <div className="th-diagnostic-body">
              <p className="th-diag-progress">
                Question {diagnosticIndex + 1} of {diagnosticQuestions.length}
              </p>
              <div className="th-diag-progress-bar">
                <div
                  className="th-diag-progress-fill"
                  style={{ width: `${((diagnosticIndex) / diagnosticQuestions.length) * 100}%` }}
                />
              </div>
              <p className="th-diag-topic">
                Topic: {diagnosticQuestions[diagnosticIndex].topic}
              </p>
              <p className="eg-question">{diagnosticQuestions[diagnosticIndex].questionText}</p>
              <div className="eg-options">
                {diagnosticQuestions[diagnosticIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="eg-option-btn"
                    disabled={diagnosticSubmitting}
                    onClick={() => handleDiagnosticAnswer(opt)}
                  >
                    {String(opt)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {starting && <p className="th-loading">Starting game…</p>}
        </div>
      )}

      {/* ═══ PHASE: playing ═══ */}
      {phase === 'playing' && (
        <>
          <div className="th-status-row">
            <div className="progress-pill">{worldDisplayName}</div>
            <div className="progress-pill th-lives-pill">
              <LifeHearts lives={lives} maxLives={3} breakingIndex={statusBarBreaking} size="md" />
            </div>
          </div>
          {gameEnd ? (
            renderEndScreen()
          ) : (
            <div
              className="th-grid"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {cells.map((row, r) =>
                row.map((cell, c) => {
                  let label = '?'
                  if (cell.status === 'treasure') {
                    label = '★'
                  } else if (cell.status === 'revealed') {
                    label = cell.neighborCount > 0 ? cell.neighborCount : '·'
                  }
                  const isHint = !hasTappedOnce && hintCell &&
                    r === hintCell.row && c === hintCell.col &&
                    cell.status === 'hidden'
                  const treasureAnim = cell.status === 'treasure' && cell.justRevealed
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      className={`th-cell ${cell.status}${isHint ? ' th-hint-glow' : ''}${treasureAnim ? ' th-treasure-reveal' : ''}`}
                      disabled={cell.status !== 'hidden' || revealing || !!gameEnd}
                      onClick={() => handleCellTap(r, c)}
                      onAnimationEnd={() => {
                        if (!cell.justRevealed) return
                        setCells((prev) => {
                          const next = prev.map((rowCells) => rowCells.map((c) => ({ ...c })))
                          if (next[r][c].justRevealed) {
                            next[r][c] = { ...next[r][c], justRevealed: false }
                          }
                          return next
                        })
                      }}
                      aria-label={`Cell ${r + 1}, ${c + 1}`}
                    >
                      {cell.status === 'hidden' ? '?' : label}
                    </button>
                  )
                })
              )}
            </div>
          )}
          {revealError && <p className="th-error">{revealError}</p>}

          {activeGateCell && !gameEnd && (
            <EquationGate
              sessionId={sessionId}
              row={activeGateCell.row}
              col={activeGateCell.col}
              tier={tier}
              moduleName={worldDisplayName}
              lives={lives}
              onCorrect={handleGateCorrect}
              onWrong={handleGateWrong}
              onClose={handleGateClose}
            />
          )}
        </>
      )}
    </>
  )
}

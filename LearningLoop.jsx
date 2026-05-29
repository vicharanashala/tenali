/**
 * LearningLoop.jsx — Interactive theorem learning session
 *
 * Guides users through a multi-stage question bank for a given theorem.
 * Each stage requires `STAGE_CORRECTS_NEEDED` correct answers before
 * advancing. Correct answers earn XP (fewer with a hint used), and
 * completing all stages shows the payoff screen with the theorem's
 * formal statement, plain-English explanation, and real-world applications.
 *
 * Progress is persisted to the backend on every stage transition so
 * users can resume from where they left off.
 *
 * States: intro → playing → payoff
 *
 * All animations respect prefers-reduced-motion via MotionConfig.
 *
 * @prop theoremId  — ID matching a key in QUESTION_BANKS
 * @prop onComplete — called when user finishes and wants to return to dashboard
 * @prop onExit     — called when user exits mid-session (back to dashboard)
 * @prop userId     — authenticated user ID for progress persistence
 */

import { useState, useEffect, useRef } from 'react'

// ── Framer Motion — orchestrates all animations ──────────────────────────────
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValue,
  MotionConfig,
} from 'framer-motion'

// ── Data: theorem question banks ────────────────────────────────────────────
import theorems from '../../data/theorems.json'
import fermatsLittleData from '../../data/fermats-little.json'
import handshakeData from '../../data/handshake.json'
import chineseRemainderData from '../../data/chinese-remainder.json'
import couponCollectorData from '../../data/coupon-collector.json'
import euclideanAlgorithmData from '../../data/euclidean-algorithm.json'
import modularInverseData from '../../data/modular-inverse.json'
import binaryExponentiationData from '../../data/binary-exponentiation.json'

// ── Progress & XP constants ──────────────────────────────────────────────────
import {
  fetchProgress,
  saveProgress,
  recordAttempt,
  XP_FIRST_ATTEMPT,
  XP_AFTER_HINT,
  XP_STAGE_COMPLETE,
  XP_MASTERY,
} from '../../lib/progress'

// How many correct answers are needed to advance from one stage to the next
const STAGE_CORRECTS_NEEDED = 3

// How many wrong attempts are allowed before the stage resets
const MAX_RETRIES = 2

// ── Question bank registry ───────────────────────────────────────────────────
const QUESTION_BANKS = {
  'fermats-little':        fermatsLittleData,
  'handshake':             handshakeData,
  'chinese-remainder':    chineseRemainderData,
  'coupon-collector':      couponCollectorData,
  'euclidean-algorithm':   euclideanAlgorithmData,
  'modular-inverse':       modularInverseData,
  'binary-exponentiation': binaryExponentiationData,
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared animation variants — respect prefers-reduced-motion
// ─────────────────────────────────────────────────────────────────────────────

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// Slide direction for stage transitions:
// +1 = advancing forward (slides from right)
// -1 = going back (slides from left)
const slideVariants = (direction) => ({
  enter: { opacity: 0, x: direction > 0 ? 40 : -40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:  { opacity: 0, x: direction < 0 ? 40 : -40, transition: { duration: 0.2, ease: 'easeIn' } },
})

// Spring config for progress bar and XP counter
const springFast = { stiffness: 300, damping: 30 }
const springSlow = { stiffness: 150, damping: 20 }

// ─────────────────────────────────────────────────────────────────────────────
// XP Animated Number
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Animates a number value smoothly using a spring.
 * Renders the formatted integer at all times (no blank flash).
 */
function AnimatedXP({ value }) {
  const motionVal = useMotionValue(value)
  const display = useTransform(motionVal, (v) => Math.round(v))
  const spring = useSpring(motionVal, springFast)

  useEffect(() => {
    motionVal.set(value)
  }, [value])

  return (
    <motion.span
      className="inline-block"
      style={{ display: 'inline-block' }}
    >
      {/* Use a static number as fallback; framer-motion updates via spring */}
      {value}
    </motion.span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bar (animated fill)
// ─────────────────────────────────────────────────────────────────────────────

function ProgressBar({ value, max }) {
  const width = useTransform(useMotionValue(0), [0, max], ['0%', '100%'])
  const springVal = useSpring(useMotionValue(0), springSlow)

  useEffect(() => {
    springVal.set(value)
  }, [value])

  return (
    <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-teal-400 to-teal-300 rounded-full"
        style={{ width: useTransform(springVal, (v) => `${Math.min((v / max) * 100, 100)}%`) }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LearningLoop Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LearningLoop({ theoremId, onComplete, onExit, userId }) {
  // ── Locate this theorem's metadata in theorems.json ──────────────────────
  const theoremData = theorems.find(t => t.id === theoremId)

  // ── Game state machine: intro | playing | payoff ───────────────────────
  const [gameState, setGameState] = useState('intro')

  // Current stage index
  const [stageIndex, setStageIndex] = useState(0)

  // How many correct answers the user has given in the current stage
  const [correctCount, setCorrectCount] = useState(0)

  // Number of wrong attempts in the current stage
  const [retryCount, setRetryCount] = useState(0)

  // Hint text currently displayed
  const [currentHint, setCurrentHint] = useState('')

  // User's text/numeric input for the current question
  const [input, setInput] = useState('')

  // Feedback: null | 'correct' | 'hint'
  const [feedback, setFeedback] = useState(null)

  // Accumulated XP for this session
  const [totalXP, setTotalXP] = useState(0)

  // Tracked XP for the spring animation (separate from displayed value)
  const [displayXP, setDisplayXP] = useState(0)

  // Tracks whether the user has used a hint in the current stage
  const [hintWasUsed, setHintWasUsed] = useState(false)

  // Saved stage from a prior session
  const [savedStage, setSavedStage] = useState(0)

  // Ref to the text input field
  const inputRef = useRef(null)

  // Track slide direction: +1 = forward, -1 = backward
  const [slideDir, setSlideDir] = useState(1)

  // Animated XP value using spring
  const xpMotionVal = useMotionValue(0)
  const xpSpring = useSpring(xpMotionVal, springFast)

  // ── Question bank for this theorem ─────────────────────────────────────
  const questionBank = QUESTION_BANKS[theoremId]

  // ── Animate XP spring when totalXP changes ───────────────────────────────
  useEffect(() => {
    xpMotionVal.set(totalXP)
  }, [totalXP])

  // ── Load saved progress on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!userId || !theoremId) return
    fetchProgress(userId).then(allProgress => {
      const myProgress = allProgress.find(p => p.id === theoremId)
      if (myProgress?.progress) {
        setSavedStage(myProgress.progress.current_stage || 0)
      }
    }).catch(() => {})
  }, [userId, theoremId])

  // ── Artificial load delay ───────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  // Loading state (local to this render, not React state — controlled by effect above)
  const [isLoading, setIsLoading] = useState(true)

  // ── Auto-focus the input field whenever playing starts or stage changes ─
  useEffect(() => {
    if (gameState === 'playing') {
      inputRef.current?.focus()
    }
  }, [gameState, stageIndex])

  // ── Persist progress to backend ─────────────────────────────────────────
  const doSaveProgress = async (stageNum, status, xp, completedAt = null) => {
    if (!userId) return
    await saveProgress({
      user_id: userId,
      case_study_id: theoremId,
      stage_number: stageNum,
      status,
      xp_earned: xp,
      completed_at: completedAt,
    })
  }

  // ── Record an individual attempt ─────────────────────────────────────────
  const doRecordAttempt = async (stageNum, answer, correct, xp) => {
    if (!userId) return
    await recordAttempt({
      user_id: userId,
      case_study_id: theoremId,
      stage_number: stageNum,
      answer_given: answer,
      is_correct: correct,
      xp_earned: xp,
    })
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center">
        <div className="text-cream-300 font-mono text-sm mb-4">Loading case study…</div>
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Unknown theorem ID ───────────────────────────────────────────────────
  if (!theoremData) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Theorem has no question bank yet ─────────────────────────────────────
  if (!questionBank) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">🔧</div>
          <h2 className="font-display text-3xl text-cream-100 font-bold mb-4">{theoremData.theorem}</h2>
          <p className="text-cream-300 mb-8 leading-relaxed">
            This theorem's case study is being built. Come back soon!
          </p>
          <button
            onClick={onExit}
            className="px-8 py-3 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 transition-all shadow-lg shadow-teal-400/20"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Convenience aliases ───────────────────────────────────────────────────
  const currentStage = questionBank.stages[stageIndex]
  const stageLabel = `Stage ${stageIndex + 1} of ${questionBank.stageCount}`

  // ── Normalize user answer ─────────────────────────────────────────────────
  function normalizeAnswer(val) {
    return val.trim().toLowerCase()
  }

  // ── Handle answer submission ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e?.preventDefault()

    const raw = input.trim()
    if (!raw) return

    const words = raw.split(/\s+/)
    if (words.length > 1) {
      setFeedback('hint')
      setCurrentHint('Please enter only one word or a single number.')
      setTimeout(() => { setFeedback(null); setCurrentHint(''); setInput('') }, 1500)
      return
    }

    if (feedback === 'correct') return

    const answer = normalizeAnswer(raw)
    const accepted = currentStage.acceptedAnswers.map(a => normalizeAnswer(a))

    if (accepted.includes(answer)) {
      // ✅ CORRECT ANSWER
      setFeedback('correct')
      const xpEarned = hintWasUsed ? XP_AFTER_HINT : XP_FIRST_ATTEMPT
      setTotalXP(prev => prev + xpEarned)
      const newCorrect = correctCount + 1
      setCorrectCount(newCorrect)
      setInput('')
      setCurrentHint('')

      await doRecordAttempt(stageIndex + 1, raw, true, xpEarned)

      if (newCorrect >= STAGE_CORRECTS_NEEDED) {
        setTimeout(async () => {
          if (stageIndex + 1 >= questionBank.stageCount) {
            setGameState('payoff')
            setTotalXP(prev => prev + XP_STAGE_COMPLETE + XP_MASTERY)
            await doSaveProgress(stageIndex + 1, 'mastered', totalXP + XP_STAGE_COMPLETE + XP_MASTERY, new Date().toISOString())
          } else {
            setSlideDir(1)
            const newStage = stageIndex + 1
            setStageIndex(newStage)
            setCorrectCount(0)
            setRetryCount(0)
            setHintWasUsed(false)
            setTotalXP(prev => prev + XP_STAGE_COMPLETE)
            setFeedback(null)
            await doSaveProgress(newStage, 'in_progress', totalXP + XP_STAGE_COMPLETE)
          }
        }, 1500)
      } else {
        setTimeout(() => { setFeedback(null) }, 1500)
      }
    } else {
      // ❌ WRONG ANSWER
      await doRecordAttempt(stageIndex + 1, raw, false, 0)

      if (retryCount >= MAX_RETRIES) {
        setSlideDir(-1)
        setTimeout(() => {
          setStageIndex(prev => Math.max(0, prev - 1))
          setCorrectCount(0)
          setRetryCount(0)
          setHintWasUsed(false)
          setCurrentHint('')
          setFeedback(null)
          setInput('')
        }, 1500)
      } else {
        setCurrentHint(currentStage.hint)
        setRetryCount(prev => prev + 1)
        setHintWasUsed(true)
        setFeedback('hint')
        setTimeout(() => {
          setFeedback(null)
          setInput('')
          setCurrentHint('')
        }, 2500)
      }
    }
  }

  // ── Keyboard shortcut ─────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  // ── Start or resume the game ─────────────────────────────────────────────
  function startGame() {
    setGameState('playing')
    setStageIndex(savedStage)
    setCorrectCount(0)
    setRetryCount(0)
    setHintWasUsed(false)
    setCurrentHint('')
    setInput('')
    setFeedback(null)
    setTotalXP(0)
    setSlideDir(1)
  }

  // ── Replay from the beginning ─────────────────────────────────────────────
  function replay() {
    setSlideDir(1)
    startGame()
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INTRO SCREEN — staggered entrance animation
  // ══════════════════════════════════════════════════════════════════════════
  if (gameState === 'intro') {
    return (
      <motion.div
        className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-lg text-center">

          {/* Stage count badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8"
            variants={fadeUpVariants}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-teal-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {questionBank.stageCount} Stages
          </motion.div>

          {/* Theorem title */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl text-cream-100 font-bold mb-6"
            variants={fadeUpVariants}
          >
            {questionBank.displayName || theoremData.theorem}
          </motion.h1>

          {/* Story intro card — slides up on enter */}
          <motion.div
            className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 text-left"
            variants={fadeUpVariants}
          >
            <p className="text-cream-300 leading-relaxed text-base font-sans">
              {questionBank.story.intro}
            </p>
          </motion.div>

          {/* Stage progress dots */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-10"
            variants={fadeUpVariants}
          >
            {Array.from({ length: questionBank.stageCount }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-navy-700 border border-white/10"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.25 }}
              />
            ))}
          </motion.div>

          {/* Begin / Resume button */}
          <motion.div variants={fadeUpVariants}>
            <button
              onClick={startGame}
              className="px-12 py-4 bg-teal-400 text-navy-950 font-bold text-lg rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20"
            >
              {savedStage > 0 ? `Resume from Step ${savedStage}` : 'Begin Journey'}
            </button>
          </motion.div>

          {/* Back to dashboard */}
          <motion.button
            onClick={onExit}
            className="block mx-auto mt-6 text-cream-400 text-sm hover:text-teal-400 transition-colors"
            variants={fadeUpVariants}
          >
            ← Back to Dashboard
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYOFF SCREEN — dramatic full-screen reveal
  // ══════════════════════════════════════════════════════════════════════════
  if (gameState === 'payoff') {
    return (
      <motion.div
        className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6 py-12 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-lg text-center space-y-8 w-full">

          {/* Trophy — drops in with spring overshoot */}
          <motion.div
            className="inline-flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: -60, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-400/30">
              <span className="text-navy-950 text-4xl">🏆</span>
            </div>
            <motion.div
              className="px-5 py-2 bg-amber-400/10 border border-amber-400/30 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <span className="text-amber-400 font-bold font-display text-lg">{questionBank.story.completionBadge}</span>
            </motion.div>
          </motion.div>

          {/* Theorem Unlocked heading — scales up from 0.85 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
          >
            <h1 className="font-display text-4xl text-cream-100 font-bold mb-3">Theorem Unlocked</h1>
            <p className="text-cream-400">You've completed {questionBank.story.completionBadge}</p>
          </motion.div>

          {/* Theorem content card — slides up */}
          <motion.div
            className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-left space-y-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          >
            {/* Formal Statement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-2">Formal Statement</p>
              <p className="font-mono text-cream-100 text-lg leading-relaxed">{questionBank.story.theoremStatement}</p>
            </motion.div>

            <div className="h-px bg-white/10" />

            {/* Plain English */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-2">Plain English</p>
              <p className="text-cream-300 font-sans leading-relaxed">{questionBank.story.plainEnglish}</p>
            </motion.div>

            <div className="h-px bg-white/10" />

            {/* Applications */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-2">Real-World Applications</p>
              <ul className="space-y-2">
                {questionBank.story.applications.map((app, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-cream-300 font-sans">
                    <span className="text-teal-400 mt-0.5 flex-shrink-0">◆</span>{app}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* XP earned — scales in */}
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.85, type: 'spring', stiffness: 200 }}
          >
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
              <span className="text-amber-400 font-bold text-sm">{totalXP}</span>
            </div>
            <span className="text-cream-400 font-medium">XP Earned</span>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
          >
            <button
              onClick={replay}
              className="px-8 py-3.5 bg-navy-800 border border-white/10 text-cream-100 font-semibold rounded-xl hover:bg-navy-700 transition-all"
            >
              Play Again
            </button>
            <button
              onClick={onComplete}
              className="px-8 py-3.5 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 transition-all shadow-lg shadow-teal-400/20"
            >
              Back to Dashboard
            </button>
          </motion.div>

        </div>
      </motion.div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PLAYING SCREEN — stage transitions + micro-interactions
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      className="min-h-screen bg-navy-950 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3">

          {/* Exit button */}
          <button
            onClick={onExit}
            className="text-cream-400 hover:text-teal-400 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Exit
          </button>

          {/* Stage label + concept name */}
          <div className="text-center">
            <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">{stageLabel}</p>
            <p className="text-sm text-teal-400 font-medium">{currentStage.conceptLabel}</p>
          </div>

          {/* XP badge — spring-animated on change */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-7 h-7 bg-amber-400/20 rounded-lg flex items-center justify-center"
              animate={totalXP > 0 ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              key={totalXP}
            >
              <motion.span className="text-amber-400 font-bold text-xs font-mono">
                {totalXP}
              </motion.span>
            </motion.div>
            <span className="text-xs text-cream-400">XP</span>
          </div>
        </div>
      </div>

      {/* ── Stage progress bar (smooth spring fill) ────────────────────── */}
      <div className="px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <ProgressBar value={stageIndex} max={questionBank.stageCount} />
        </div>
      </div>

      {/* ── Question area — slides left/right between stages ─────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">

          <AnimatePresence mode="wait" custom={slideDir}>
            <motion.div
              key={stageIndex}
              custom={slideDir}
              variants={slideVariants(slideDir)}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >

              {/* Concept label tag */}
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-navy-800 border border-white/10 rounded-full text-xs text-cream-400 font-medium">
                  {currentStage.conceptLabel}
                </span>
              </div>

              {/* Question text */}
              <div className="text-center">
                <h2 className="font-display text-3xl sm:text-4xl text-cream-100 font-bold leading-tight">
                  {currentStage.question}
                </h2>
              </div>

              {/* Answer input field — glows teal on correct, coral on wrong */}
              <motion.div
                animate={
                  feedback === 'correct'
                    ? { boxShadow: ['0 0 0px rgba(45,212,191,0)', '0 0 20px rgba(45,212,191,0.4)', '0 0 8px rgba(45,212,191,0.2)'] }
                    : feedback === 'hint'
                    ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                    : {}
                }
                transition={
                  feedback === 'correct'
                    ? { duration: 0.8, ease: 'easeOut' }
                    : feedback === 'hint'
                    ? { duration: 0.5, ease: 'easeInOut' }
                    : {}
                }
              >
                <form onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type={currentStage.type === 'numeric' ? 'number' : 'text'}
                    inputMode={currentStage.type === 'numeric' ? 'numeric' : 'text'}
                    pattern={currentStage.type === 'numeric' ? '[0-9]*' : undefined}
                    value={input}
                    onChange={e => {
                      const val = currentStage.type === 'numeric'
                        ? e.target.value.replace(/[^0-9]/g, '')
                        : e.target.value
                      setInput(val)
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={feedback === 'correct'}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    placeholder={currentStage.type === 'numeric' ? 'Enter a number...' : 'Type your answer...'}
                    className={`w-full px-6 py-4 bg-navy-900/80 border-2 rounded-2xl font-mono text-2xl text-cream-100 text-center outline-none transition-all placeholder:text-cream-300/30 ${
                      feedback === 'correct'
                        ? 'border-teal-400 bg-teal-400/10 shadow-[0_0_16px_rgba(45,212,191,0.3)]'
                        : feedback === 'hint'
                        ? 'border-coral-400/60 bg-coral-400/5'
                        : 'border-navy-700 focus:border-teal-400 focus:shadow-[0_0_12px_rgba(45,212,191,0.15)]'
                    }`}
                  />

                  {/* Correct answer flash overlay */}
                  <AnimatePresence>
                    {feedback === 'correct' && (
                      <motion.div
                        className="absolute inset-0 bg-teal-400/15 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>

              {/* Correct feedback message */}
              <div className="h-12 flex items-center justify-center">
                <AnimatePresence>
                  {feedback === 'correct' && (
                    <motion.div
                      className="flex items-center gap-2 text-teal-400"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="font-semibold text-sm">Correct! Keep going...</span>
                      <span className="text-xs text-amber-400 font-mono">+{hintWasUsed ? XP_AFTER_HINT : XP_FIRST_ATTEMPT} XP</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hint panel — slides up from below */}
              <AnimatePresence>
                {currentHint && (
                  <motion.div
                    className="flex items-start gap-3 bg-coral-400/10 border border-coral-400/20 rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20, maxHeight: 0 }}
                    animate={{ opacity: 1, y: 0, maxHeight: 200 }}
                    exit={{ opacity: 0, y: -10, maxHeight: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="w-8 h-8 bg-coral-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-coral-400 text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-coral-400 font-semibold mb-1">Hint</p>
                      <p className="text-cream-300 text-sm leading-relaxed">{currentHint}</p>
                      <p className="text-xs text-coral-400/60 mt-2 font-mono">Retry {retryCount}/{MAX_RETRIES}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Concept explanation — fades in after correct */}
              <AnimatePresence>
                {feedback === 'correct' && currentStage.conceptShown && (
                  <motion.div
                    className="flex items-start gap-3 bg-teal-400/10 border border-teal-400/20 rounded-2xl p-5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                  >
                    <div className="w-8 h-8 bg-teal-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-400 text-sm">✨</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-1">Concept</p>
                      <p className="text-cream-300 text-sm leading-relaxed">{currentStage.conceptShown}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Correct answer counter dots */}
              <div className="flex items-center justify-center gap-3">
                {Array.from({ length: STAGE_CORRECTS_NEEDED }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    animate={
                      i < correctCount
                        ? { backgroundColor: '#2dd4bf', scale: [1, 1.25, 1] }
                        : { backgroundColor: '#1a3058' }
                    }
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                  />
                ))}
                <span className="text-xs text-cream-400 ml-2">{correctCount}/{STAGE_CORRECTS_NEEDED} to advance</span>
              </div>

              {/* Submit / Check Answer button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSubmit}
                  disabled={!input.trim() || feedback === 'correct'}
                  className={`px-10 py-3.5 rounded-xl font-bold text-navy-950 transition-all ${
                    input.trim() && feedback !== 'correct'
                      ? 'bg-teal-400 hover:bg-teal-300 shadow-lg shadow-teal-400/20'
                      : 'bg-teal-400/30 cursor-not-allowed'
                  }`}
                  whileTap={input.trim() && feedback !== 'correct' ? { scale: 0.97 } : {}}
                >
                  Check Answer
                </motion.button>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  )
}
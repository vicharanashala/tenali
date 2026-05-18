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
 * @prop theoremId  — ID matching a key in QUESTION_BANKS
 * @prop onComplete — called when user finishes and wants to return to dashboard
 * @prop onExit     — called when user exits mid-session (back to dashboard)
 * @prop userId     — authenticated user ID for progress persistence
 */

import { useState, useEffect, useRef } from 'react'

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
// Maps theorem ID → its question bank JSON data
const QUESTION_BANKS = {
  'fermats-little':        fermatsLittleData,
  'handshake':             handshakeData,
  'chinese-remainder':    chineseRemainderData,
  'coupon-collector':      couponCollectorData,
  'euclidean-algorithm':   euclideanAlgorithmData,
  'modular-inverse':       modularInverseData,
  'binary-exponentiation': binaryExponentiationData,
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LearningLoop({ theoremId, onComplete, onExit, userId }) {
  // ── Locate this theorem's metadata in theorems.json ──────────────────────
  const theoremData = theorems.find(t => t.id === theoremId)

  // ── Game state machine: intro | playing | payoff ───────────────────────
  const [gameState, setGameState] = useState('intro')

  // Index into questionBank.stages[] — which stage the user is currently on
  const [stageIndex, setStageIndex] = useState(0)

  // How many correct answers the user has given in the current stage
  // (resets to 0 each time a new stage begins)
  const [correctCount, setCorrectCount] = useState(0)

  // Number of wrong attempts in the current stage (resets each stage)
  const [retryCount, setRetryCount] = useState(0)

  // Hint text currently displayed (cleared between stages)
  const [currentHint, setCurrentHint] = useState('')

  // User's text/numeric input for the current question
  const [input, setInput] = useState('')

  // Feedback shown below the input: null | 'correct' | 'wrong' | 'hint'
  const [feedback, setFeedback] = useState(null)

  // Accumulated XP for this session (shown in the top bar)
  const [totalXP, setTotalXP] = useState(0)

  // When true, the XP badge pulses briefly to draw attention
  const [xpAnimating, setXpAnimating] = useState(false)

  // True while the loading skeleton is displayed (prevents flash of blank content)
  const [isLoading, setIsLoading] = useState(true)

  // Tracks whether the user has used a hint in the current stage
  // (reduces XP reward if they did)
  const [hintWasUsed, setHintWasUsed] = useState(false)

  // Stage number saved from a prior session (used to show "Resume from Step N")
  const [savedStage, setSavedStage] = useState(0)

  // Ref to the text input field, used to auto-focus it on stage change
  const inputRef = useRef(null)

  // ── Question bank for this theorem ─────────────────────────────────────
  const questionBank = QUESTION_BANKS[theoremId]

  // ── Load any previously saved progress for this user + theorem ─────────
  // On mount, fetch the user's progress from the backend and restore
  // the saved stage number so the user can resume from where they left off.
  useEffect(() => {
    if (!userId || !theoremId) return

    fetchProgress(userId).then(allProgress => {
      const myProgress = allProgress.find(p => p.id === theoremId)
      if (myProgress?.progress) {
        // Use the saved stage from the backend if available
        setSavedStage(myProgress.progress.current_stage || 0)
      }
    }).catch(() => {
      // Silently ignore fetch errors — a fresh start is fine
    })
  }, [userId, theoremId])

  // ── XP badge pulse animation ─────────────────────────────────────────────
  // When totalXP changes, briefly set xpAnimating to true so the CSS
  // animation in the top bar triggers (the animation lasts ~400ms).
  useEffect(() => {
    if (totalXP > 0) {
      setXpAnimating(true)
      const t = setTimeout(() => setXpAnimating(false), 400)
      return () => clearTimeout(t)
    }
  }, [totalXP])

  // ── Artificial load delay ───────────────────────────────────────────────
  // Displays a loading skeleton for 500ms to prevent a brief blank flash
  // that can occur when React renders the component synchronously.
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

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

  // ── Record an individual attempt (correct or wrong) ─────────────────────
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

  // ── Normalize user answer for comparison ─────────────────────────────────
  function normalizeAnswer(val) {
    return val.trim().toLowerCase()
  }

  // ── Handle answer submission ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e?.preventDefault()

    const raw = input.trim()
    if (!raw) return  // Ignore empty submissions

    // If user submits multiple words, treat as a hint request
    const words = raw.split(/\s+/)
    if (words.length > 1) {
      setFeedback('hint')
      setCurrentHint('Please enter only one word or a single number.')
      setTimeout(() => { setFeedback(null); setCurrentHint(''); setInput('') }, 1500)
      return
    }

    // Prevent double-submission while correct feedback is showing
    if (feedback === 'correct') return

    const answer = normalizeAnswer(raw)
    const accepted = currentStage.acceptedAnswers.map(a => normalizeAnswer(a))

    if (accepted.includes(answer)) {
      // ✅ CORRECT ANSWER
      setFeedback('correct')
      // XP is lower if a hint was used
      const xpEarned = hintWasUsed ? XP_AFTER_HINT : XP_FIRST_ATTEMPT
      setTotalXP(prev => prev + xpEarned)
      const newCorrect = correctCount + 1
      setCorrectCount(newCorrect)
      setInput('')
      setCurrentHint('')

      await doRecordAttempt(stageIndex + 1, raw, true, xpEarned)

      // Check if this stage is now complete (enough correct answers)
      if (newCorrect >= STAGE_CORRECTS_NEEDED) {
        setTimeout(async () => {
          if (stageIndex + 1 >= questionBank.stageCount) {
            // All stages done → show payoff screen
            setGameState('payoff')
            const finalXP = totalXP + XP_PER_STAGE_ADVANCE + XP_MASTERY
            setTotalXP(prev => prev + XP_STAGE_COMPLETE + XP_MASTERY)
            await doSaveProgress(stageIndex + 1, 'mastered', finalXP, new Date().toISOString())
          } else {
            // Advance to next stage
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
        // Stage not yet complete — clear feedback after short delay
        setTimeout(() => { setFeedback(null) }, 1500)
      }
    } else {
      // ❌ WRONG ANSWER
      await doRecordAttempt(stageIndex + 1, raw, false, 0)

      if (retryCount >= MAX_RETRIES) {
        // Too many wrong attempts → roll back one stage
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
        // Show hint and increment retry counter
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

  // ── Keyboard shortcut: Enter to submit ───────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  // ── Start or resume the game ─────────────────────────────────────────────
  function startGame() {
    setGameState('playing')
    setStageIndex(savedStage)  // Resume from saved stage, or 0 if new
    setCorrectCount(0)
    setRetryCount(0)
    setHintWasUsed(false)
    setCurrentHint('')
    setInput('')
    setFeedback(null)
    setTotalXP(0)
  }

  // ── Replay from the beginning ──────────────────────────────────────────────
  function replay() {
    startGame()
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INTRO SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6">
        <div className="max-w-lg text-center">
          {/* Stage count badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {questionBank.stageCount} Stages
          </div>

          {/* Theorem title */}
          <h1 className="font-display text-4xl sm:text-5xl text-cream-100 font-bold mb-6 animate-fade-in" style={{animationDelay: '100ms'}}>
            {questionBank.displayName || theoremData.theorem}
          </h1>

          {/* Story intro */}
          <div className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 text-left animate-fade-in" style={{animationDelay: '200ms'}}>
            <p className="text-cream-300 leading-relaxed text-base font-sans">
              {questionBank.story.intro}
            </p>
          </div>

          {/* Stage progress dots */}
          <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in" style={{animationDelay: '300ms'}}>
            {Array.from({ length: questionBank.stageCount }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-navy-700 border border-white/10" />
            ))}
          </div>

          {/* Begin / Resume button */}
          <button
            onClick={startGame}
            className="px-12 py-4 bg-teal-400 text-navy-950 font-bold text-lg rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20 animate-fade-in" style={{animationDelay: '400ms'}}
          >
            {savedStage > 0 ? `Resume from Step ${savedStage}` : 'Begin Journey'}
          </button>

          {/* Back to dashboard */}
          <button onClick={onExit} className="block mx-auto mt-6 text-cream-400 text-sm hover:text-teal-400 transition-colors animate-fade-in" style={{animationDelay: '500ms'}}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYOFF SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (gameState === 'payoff') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg text-center space-y-8">
          {/* Trophy + completion badge */}
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-400/30">
              <span className="text-navy-950 text-4xl">🏆</span>
            </div>
            <div className="px-5 py-2 bg-amber-400/10 border border-amber-400/30 rounded-full">
              <span className="text-amber-400 font-bold font-display text-lg">{questionBank.story.completionBadge}</span>
            </div>
          </div>

          {/* "Theorem Unlocked" heading */}
          <div>
            <h1 className="font-display text-4xl text-cream-100 font-bold mb-3">Theorem Unlocked</h1>
            <p className="text-cream-400">You've completed {questionBank.story.completionBadge}</p>
          </div>

          {/* Formal statement, plain English, applications */}
          <div className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-left space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-2">Formal Statement</p>
              <p className="font-mono text-cream-100 text-lg leading-relaxed">{questionBank.story.theoremStatement}</p>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-2">Plain English</p>
              <p className="text-cream-300 font-sans leading-relaxed">{questionBank.story.plainEnglish}</p>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-2">Real-World Applications</p>
              <ul className="space-y-2">
                {questionBank.story.applications.map((app, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-cream-300 font-sans">
                    <span className="text-teal-400 mt-0.5">◆</span>{app}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* XP earned display */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
              <span className="text-amber-400 font-bold text-sm">{totalXP}</span>
            </div>
            <span className="text-cream-400 font-medium">XP Earned</span>
          </div>

          {/* Action buttons: replay or return to dashboard */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PLAYING SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">

      {/* ── Sticky top bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3">
          {/* Exit button */}
          <button onClick={onExit} className="text-cream-400 hover:text-teal-400 text-sm font-medium flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Exit
          </button>

          {/* Stage label + concept name */}
          <div className="text-center">
            <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">{stageLabel}</p>
            <p className="text-sm text-teal-400 font-medium">{currentStage.conceptLabel}</p>
          </div>

          {/* XP badge (pulses on change via xpAnimating) */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-amber-400/20 rounded-lg flex items-center justify-center ${xpAnimating ? 'animate-xp-tick' : ''}`}>
              <span className="text-amber-400 font-bold text-xs font-mono">{totalXP}</span>
            </div>
            <span className="text-xs text-cream-400">XP</span>
          </div>
        </div>
      </div>

      {/* ── Stage progress dots ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-1.5">
          {Array.from({ length: questionBank.stageCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < stageIndex ? 'w-8 bg-teal-400' :
                i === stageIndex ? 'w-4 bg-teal-400' :
                'w-4 bg-navy-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Question area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8">

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

          {/* Answer input field */}
          <div className={`relative ${feedback === 'hint' ? 'animate-shake' : ''}`}>
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
                  feedback === 'correct' ? 'border-teal-400 bg-teal-400/10' :
                  feedback === 'hint' ? 'border-coral-400/60' :
                  'border-navy-700 focus:border-teal-400'
                }`}
              />

              {/* Correct answer flash overlay */}
              {feedback === 'correct' && (
                <div className="absolute inset-0 bg-teal-400/20 rounded-2xl pointer-events-none animate-flash" />
              )}
            </form>
          </div>

          {/* Correct feedback message */}
          <div className="h-12 flex items-center justify-center">
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 text-teal-400 animate-fade-in">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                <span className="font-semibold text-sm">Correct! Keep going...</span>
                <span className="text-xs text-amber-400 font-mono">+{hintWasUsed ? XP_AFTER_HINT : XP_FIRST_ATTEMPT} XP</span>
              </div>
            )}
          </div>

          {/* Hint panel (slides in when feedback === 'hint') */}
          <div className={`overflow-hidden transition-all duration-500 ${currentHint ? 'animate-hint-slide' : ''}`}>
            {currentHint && (
              <div className="flex items-start gap-3 bg-coral-400/10 border border-coral-400/20 rounded-2xl p-5 mt-2">
                <div className="w-8 h-8 bg-coral-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-coral-400 text-sm">💡</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-coral-400 font-semibold mb-1">Hint</p>
                  <p className="text-cream-300 text-sm leading-relaxed">{currentHint}</p>
                  <p className="text-xs text-coral-400/60 mt-2 font-mono">Retry {retryCount}/{MAX_RETRIES}</p>
                </div>
              </div>
            )}
          </div>

          {/* Concept explanation (shown after correct answer if available) */}
          <div className={`space-y-3 overflow-hidden transition-all duration-500 ${feedback === 'correct' && currentStage.conceptShown ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex items-start gap-3 bg-teal-400/10 border border-teal-400/20 rounded-2xl p-5">
              <div className="w-8 h-8 bg-teal-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-teal-400 text-sm">✨</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-1">Concept</p>
                <p className="text-cream-300 text-sm leading-relaxed">{currentStage.conceptShown}</p>
              </div>
            </div>
          </div>

          {/* Correct answer counter dots */}
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: STAGE_CORRECTS_NEEDED }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < correctCount ? 'bg-teal-400 scale-110' : 'bg-navy-700'
                }`}
              />
            ))}
            <span className="text-xs text-cream-400 ml-2">{correctCount}/{STAGE_CORRECTS_NEEDED} to advance</span>
          </div>

          {/* Submit / Check Answer button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || feedback === 'correct'}
              className={`px-10 py-3.5 rounded-xl font-bold text-navy-950 transition-all ${
                input.trim() && feedback !== 'correct'
                  ? 'bg-teal-400 hover:bg-teal-300 shadow-lg shadow-teal-400/20'
                  : 'bg-teal-400/30 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
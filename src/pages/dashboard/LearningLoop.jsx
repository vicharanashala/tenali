import { useState, useEffect, useRef } from 'react'
import theorems from '../../data/theorems.json'
import fermatsLastData from '../../data/fermats-last.json'
import pythagoreanData from '../../data/pythagorean.json'
import eulerFormulaData from '../../data/euler-formula.json'
import fundamentalTheoremData from '../../data/fundamental-theorem.json'
import infinitePiData from '../../data/infinite-pi.json'
import goldbachConjectureData from '../../data/goldbach-conjecture.json'
import banachTarskiData from '../../data/banach-tarski.json'
import { fetchProgress, saveProgress, recordAttempt, XP_FIRST_ATTEMPT, XP_AFTER_HINT, XP_STAGE_COMPLETE, XP_MASTERY } from '../../lib/progress'

const STAGE_CORRECTS_NEEDED = 3
const MAX_RETRIES = 2

const QUESTION_BANKS = {
  'fermats-last': fermatsLastData,
  'pythagorean': pythagoreanData,
  'euler-formula': eulerFormulaData,
  'fundamental-theorem': fundamentalTheoremData,
  'infinite-pi': infinitePiData,
  'goldbach-conjecture': goldbachConjectureData,
  'banach-tarski': banachTarskiData,
}

export default function LearningLoop({ theoremId, onComplete, onExit, userId }) {
  const theoremData = theorems.find(t => t.id === theoremId)
  const [gameState, setGameState] = useState('intro') // intro | playing | payoff
  const [stageIndex, setStageIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [currentHint, setCurrentHint] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong' | 'hint'
  const [totalXP, setTotalXP] = useState(0)
  const [xpAnimating, setXpAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hintWasUsed, setHintWasUsed] = useState(false)
  const [savedStage, setSavedStage] = useState(0)
  const inputRef = useRef(null)

  const questionBank = QUESTION_BANKS[theoremId]

  // Load saved progress on mount
  useEffect(() => {
    if (!userId || !theoremId) return
    fetchProgress(userId).then(allProgress => {
      const myProgress = allProgress.find(p => p.id === theoremId)
      if (myProgress?.progress) {
        setSavedStage(myProgress.progress.current_stage || 0)
      }
    }).catch(() => {})
  }, [userId, theoremId])

  // XP tick animation
  useEffect(() => {
    if (totalXP > 0) {
      setXpAnimating(true)
      const t = setTimeout(() => setXpAnimating(false), 400)
      return () => clearTimeout(t)
    }
  }, [totalXP])

  // Simulate async load to prevent instant blank
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  // Auto-focus input when stage changes
  useEffect(() => {
    if (gameState === 'playing') inputRef.current?.focus()
  }, [gameState, stageIndex])

  // Save progress to server
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

  // Record attempt
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center">
        <div className="text-cream-300 font-mono text-sm mb-4">Loading case study…</div>
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!theoremData) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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

  const currentStage = questionBank.stages[stageIndex]
  const stageLabel = `Stage ${stageIndex + 1} of ${questionBank.stageCount}`

  function normalizeAnswer(val) {
    return val.trim().toLowerCase()
  }

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
      // ✅ CORRECT
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
            const finalXP = totalXP + XP_PER_STAGE_ADVANCE + XP_MASTERY
            setTotalXP(prev => prev + XP_STAGE_COMPLETE + XP_MASTERY)
            await doSaveProgress(stageIndex + 1, 'mastered', finalXP, new Date().toISOString())
          } else {
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
      // ❌ WRONG
      await doRecordAttempt(stageIndex + 1, raw, false, 0)
      if (retryCount >= MAX_RETRIES) {
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

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

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
  }

  function replay() {
    startGame()
  }

  // ─── INTRO SCREEN ──────────────────────────────────
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {questionBank.stageCount} Stages
          </div>

          <h1 className="font-display text-4xl sm:text-5xl text-cream-100 font-bold mb-6 animate-fade-in" style={{animationDelay: '100ms'}}>
            {questionBank.displayName || theoremData.theorem}
          </h1>

          <div className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 text-left animate-fade-in" style={{animationDelay: '200ms'}}>
            <p className="text-cream-300 leading-relaxed text-base font-sans">
              {questionBank.story.intro}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in" style={{animationDelay: '300ms'}}>
            {Array.from({ length: questionBank.stageCount }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-navy-700 border border-white/10" />
            ))}
          </div>

          <button
            onClick={startGame}
            className="px-12 py-4 bg-teal-400 text-navy-950 font-bold text-lg rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20 animate-fade-in" style={{animationDelay: '400ms'}}
          >
            {savedStage > 0 ? `Resume from Step ${savedStage}` : 'Begin Journey'}
          </button>

          <button onClick={onExit} className="block mx-auto mt-6 text-cream-400 text-sm hover:text-teal-400 transition-colors animate-fade-in" style={{animationDelay: '500ms'}}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ─── PAYOFF SCREEN ─────────────────────────────────
  if (gameState === 'payoff') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg text-center space-y-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-400/30">
              <span className="text-navy-950 text-4xl">🏆</span>
            </div>
            <div className="px-5 py-2 bg-amber-400/10 border border-amber-400/30 rounded-full">
              <span className="text-amber-400 font-bold font-display text-lg">{questionBank.story.completionBadge}</span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-4xl text-cream-100 font-bold mb-3">Theorem Unlocked</h1>
            <p className="text-cream-400">You've completed {questionBank.story.completionBadge}</p>
          </div>

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

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
              <span className="text-amber-400 font-bold text-sm">{totalXP}</span>
            </div>
            <span className="text-cream-400 font-medium">XP Earned</span>
          </div>

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

  // ─── PLAYING SCREEN ────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3">
          <button onClick={onExit} className="text-cream-400 hover:text-teal-400 text-sm font-medium flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Exit
          </button>
          <div className="text-center">
            <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">{stageLabel}</p>
            <p className="text-sm text-teal-400 font-medium">{currentStage.conceptLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-amber-400/20 rounded-lg flex items-center justify-center ${xpAnimating ? 'animate-xp-tick' : ''}`}>
              <span className="text-amber-400 font-bold text-xs font-mono">{totalXP}</span>
            </div>
            <span className="text-xs text-cream-400">XP</span>
          </div>
        </div>
      </div>

      {/* Progress dots */}
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

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-navy-800 border border-white/10 rounded-full text-xs text-cream-400 font-medium">
              {currentStage.conceptLabel}
            </span>
          </div>

          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl text-cream-100 font-bold leading-tight">
              {currentStage.question}
            </h2>
          </div>

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

              {feedback === 'correct' && (
                <div className="absolute inset-0 bg-teal-400/20 rounded-2xl pointer-events-none animate-flash" />
              )}
            </form>
          </div>

          <div className="h-12 flex items-center justify-center">
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 text-teal-400 animate-fade-in">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                <span className="font-semibold text-sm">Correct! Keep going...</span>
                <span className="text-xs text-amber-400 font-mono">+{hintWasUsed ? XP_AFTER_HINT : XP_FIRST_ATTEMPT} XP</span>
              </div>
            )}
          </div>

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
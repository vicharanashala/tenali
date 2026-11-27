import { useState, useEffect, useRef } from 'react';
import KeyTerms from '../components/KeyTerms';
import { HintModal } from '../components/HintSystem/HintModal.jsx';
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx';

/**
 * SurdsApp Component
 * Practice simplifying, adding, multiplying, and rationalising surds.
 * Difficulty levels:
 *   Easy      — Simplify √n (e.g. √72 = 6√2)
 *   Medium    — Add/subtract like surds (e.g. 3√5 + 2√5 = 5√5)
 *   Hard      — Multiply surds and simplify (e.g. √6 × √10 = 2√15)
 *   ExtraHard — Rationalise denominators (e.g. 6/√3 = 2√3)
 *
 * User types answers using √ symbol (keyboard hint provided) or "sqrt".
 * Auto-advance on correct answers; Enter key advances after wrong answers.
 */
export default function SurdsApp({
  onBack,
  isGoalMode = false,
  API,
  DEFAULT_TOTAL,
  authGetToken,
  useTimer,
  useAutoAdvance,
  getSpeedRunLimit,
  adaptiveLevel,
  adaptivePct,
  ADAPT_COLORS,
  ADAPT_LABELS,
  renderFeedback,
  QuizLayout: quizLayout,
  DifficultySlider: difficultySlider,
  ResultsTable: resultsTable
}) {
  const QuizLayout = quizLayout;
  const DifficultySlider = difficultySlider;
  const ResultsTable = resultsTable;

  const [difficulty, setDifficulty] = useState('easy')
  const [isAdaptive, setIsAdaptive] = useState(false)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState([])
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  const timer = useTimer()
  const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('surds', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);
  const advanceFnRef = useRef(null)

  const effectiveDiff = () => (isAdaptive) ? adaptiveLevel(adaptScoreRef.current) : difficulty


  const handleTimeout = async () => {
    if (typeof revealed !== 'undefined' && revealed) return
    if (typeof finished !== 'undefined' && finished) return
    try { if (typeof setIsCorrect !== 'undefined') setIsCorrect(false) } catch(_) {}
    try { if (typeof setRevealed !== 'undefined') setRevealed(true) } catch(_) {}
    try { if (typeof setFeedback !== 'undefined') setFeedback('⏰ Time\'s up! Speed run requires a quick answer.') } catch(_) {}
    try {
      const r = await fetch(`${API}/surds-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
        body: JSON.stringify({ ...(typeof question !== 'undefined' ? question : {}), userAnswer: '', answer: '', sessionGoal })
      })
      const d = await r.json()
      if (sessionGoal === 'perfect') {
        try { setFinished(true); timer.reset() } catch(_) {}
      }
    } catch(e) { console.error('handleTimeout error:', e) }
  }

const loadQuestion = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/surds-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`, { headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' } })
      const data = await r.json()
      setQuestion(data)
      setAnswer('')
      setFeedback('')
      setIsCorrect(null)
      setRevealed(false)
      timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
    } catch (e) { console.error('Failed to load surds question:', e) }
    setLoading(false)
  }

  const startQuiz = () => {
    const t = Math.max(1, Math.min(100, Number(numQuestions) || DEFAULT_TOTAL))
    setTotalQ(t)
    setScore(0)
    setQuestionNumber(1)
    setResults([])
    setStarted(true)
    setFinished(false)
    setAdaptScore(0)
    adaptScoreRef.current = 0
  }

  useEffect(() => {
    if (started && !finished && questionNumber > 0) loadQuestion()
  }, [started, questionNumber])

  const advance = () => {
    if (questionNumber >= totalQ) setFinished(true)
    else setQuestionNumber(n => n + 1)
  }
  advanceFnRef.current = advance
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  useEffect(() => {
    if (!revealed || isCorrect) return
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); advance() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [revealed, isCorrect, questionNumber])

  /** Normalize user input: replace "sqrt" with √, strip spaces */
  const normalizeAnswer = (s) => s.replace(/sqrt/gi, '√').replace(/\s+/g, ' ').trim()

  /** Build the prompt string shown for the question */
  const getPrompt = (q) => {
    if (!q) return ''
    if (q.type === 'simplify') return `Simplify √${q.n}`
    if (q.type === 'addsub') {
      const aStr = q.a === 1 ? '√' + q.r : q.a + '√' + q.r
      const bStr = q.b === 1 ? '√' + q.r : q.b + '√' + q.r
      return `${aStr} ${q.op} ${bStr}`
    }
    if (q.type === 'multiply') {
      const p1 = q.c1 === 1 ? '√' + q.r1 : q.c1 + '√' + q.r1
      const p2 = q.c2 === 1 ? '√' + q.r2 : q.c2 + '√' + q.r2
      return `${p1} × ${p2}`
    }
    if (q.type === 'rationalise') {
      if (q.subtype === 'simple') {
        const den = q.b === 1 ? '√' + q.r : q.b + '√' + q.r
        return `${q.a} ÷ (${den})`
      } else {
        const sign = q.q > 0 ? '+' : ''
        const qStr = Math.abs(q.q) === 1 ? (q.q > 0 ? '' : '-') : String(q.q)
        return `${q.a} ÷ (${q.p}${sign}${qStr}√${q.r})`
      }
    }
    return ''
  }

  const handleSubmit = async () => {
    if (!question || revealed) return
    const normalized = normalizeAnswer(answer)
    if (!normalized) return
    const timeTaken = timer.stop()

    const payload = { ...question, answer: normalized }

    try {
      const r = await fetch(`${API}/surds-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...payload, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(data.correct)
      setRevealed(true)
      if (data.correct) setScore(s => s + 1);

      const prompt = getPrompt(question);
      (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${prompt} = ${data.display}`.slice(0,-1) + _ci + `Correct! ${prompt} = ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${prompt} = ${data.display}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect. ${prompt} = ${data.display}`)
        }
      })()

      setResults(prev => [...prev, {
        prompt,
        userAnswer: normalized,
        correctAnswer: data.display,
        correct: data.correct,
        time: timeTaken
      }])
      if (isAdaptive) {
        setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
      }
    } catch (e) { console.error('Failed to check surds answer:', e) }
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    timer.stop()
    const prompt = getPrompt(question)
    try {
      const r = await fetch(`${API}/surds-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  ...question, answer: '', solve: true, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(false); setRevealed(true)
      const display = data.display || data.correctAnswer || data.answer || ''
      const explanation = data.explanation || ''
      setFeedback(`Solution: ${display}${explanation ? '\n' + explanation : ''}`)
      setResults(prev => [...prev, { prompt, userAnswer: '(solved)', correctAnswer: display, correct: false, time: 0 }])
      if (isAdaptive) {
        setAdaptScore(prev => Math.max(0, prev - 0.35))
      }
    } catch (e) { console.error('Failed to solve surds:', e) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (revealed) advance()
      else handleSubmit()
    }
  }

  const diffLabels = { easy: 'Easy — Simplify', medium: 'Medium — Add/Sub', hard: 'Hard — Multiply', extrahard: 'Extra Hard — Rationalise' }

  const curAdaptLevel = adaptiveLevel(adaptScore)

  return (
    <QuizLayout title="Surds" subtitle="Simplify, add, multiply, rationalise" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Practice working with surds!</p>
        <KeyTerms topicKey="surds" />
        <p style={{ fontSize: '0.85rem', color: 'var(--clr-dim)', marginBottom: '8px' }}>Tip: type √ using "sqrt" or copy-paste √</p>
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {['easy', 'medium', 'hard', 'extrahard'].map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="surds-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {diffLabels[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="surds-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
            Adaptive
          </label>
        </div>

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
                        <input type="radio" name="surdsapp-goal" checked={sessionGoal === g.key} onChange={() => {
                          setSessionGoal(g.key)

                        }} />
                        {g.label}
                      </label>
                    ))}
                  </div>
                  {isAdaptive && <p style={{ fontSize: '0.82rem', color: 'var(--clr-dim)', marginBottom: '8px' }}>Starts easy and smoothly adjusts to your level as you answer.</p>}
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
          <label className="question-count-label">How many questions? (max 100)</label>
          <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setNumQuestions(v) }} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
      </div>}

      {started && !finished && <>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
          {isAdaptive && <div className="progress-pill" style={{ background: ADAPT_COLORS[curAdaptLevel], color: '#fff' }}>{ADAPT_LABELS[curAdaptLevel]}</div>}
        </div>
        {isAdaptive && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />}
        {question && (
          <div style={{ textAlign: 'center' }}>
            <div className="question-prompt" style={{ fontSize: '1.6rem', margin: '20px 0' }}>{getPrompt(question)}</div>
            <input
              className="answer-input"
              type="text"
              value={answer}
              onChange={e => { if (!revealed) setAnswer(e.target.value) }}
              disabled={revealed}
              placeholder="e.g. 6√2"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        )}
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed ? (
            <>
              <button onClick={handleSubmit} disabled={loading || !answer.trim()}>Submit</button>
              <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
            </>
          ) : (
            <button onClick={advance}>{questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question'}</button>
          )}
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}

      {finished && (
        <div className="welcome-box">
          <p className="welcome-text">Quiz complete!</p>
          <p className="final-score">Final score: {score}/{totalQ}</p>
          {isAdaptive && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)' }}>Reached level: <strong style={{ color: ADAPT_COLORS[curAdaptLevel] }}>{ADAPT_LABELS[curAdaptLevel]}</strong></p>}
          <ResultsTable results={results} />
          <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
        </div>
      )}
    <HintModal concept={'surds'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
</QuizLayout>
  )
}

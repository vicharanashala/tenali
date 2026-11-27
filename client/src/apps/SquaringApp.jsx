import { useState, useEffect, useRef } from 'react'
import KeyTerms from '../components/KeyTerms'

export default function SquaringApp({
  onBack,
  isGoalMode = false,
  API,
  DEFAULT_TOTAL,
  authGetToken,
  adaptiveLevel,
  adaptivePct,
  ADAPT_COLORS,
  ADAPT_LABELS,
  useTimer,
  useAutoAdvance,
  getSpeedRunLimit,
  renderFeedback,
  QuizLayout: quizLayout,
  DifficultySlider: difficultySlider,
  ResultsTable: resultsTable
}) {
  const QuizLayout = quizLayout
  const DifficultySlider = difficultySlider
  const ResultsTable = resultsTable
  const DIFFS = ['easy', 'medium', 'hard', 'extrahard']
  const DIFF_LABELS_SQ = { easy: 'Easy — 11-19', medium: 'Medium — 20-49', hard: 'Hard — 50-99', extrahard: 'Extra Hard — 100-999' }

  const [difficulty, setDifficulty] = useState('easy')
  const [isAdaptive, setIsAdaptive] = useState(false)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [question, setQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState([])
  const timer = useTimer()
  const advanceFnRef = useRef(null)
  const submittedRef = useRef(false)
  const advancedRef = useRef(false)

  // Four input fields: a², b², 2ab, final answer
  const [valASq, setValASq] = useState('')
  const [valBSq, setValBSq] = useState('')
  const [val2AB, setVal2AB] = useState('')
  const [valFinal, setValFinal] = useState('')
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  const refASq = useRef(null)
  const refBSq = useRef(null)
  const ref2AB = useRef(null)
  const refFinal = useRef(null)

  const effectiveDiff = () => (isAdaptive) ? adaptiveLevel(adaptScoreRef.current) : difficulty
  const curAdaptLevel = adaptiveLevel(adaptScore)


  const handleTimeout = async () => {
    if (typeof revealed !== 'undefined' && revealed) return
    if (typeof finished !== 'undefined' && finished) return
    try { if (typeof setIsCorrect !== 'undefined') setIsCorrect(false) } catch(_) {}
    try { if (typeof setRevealed !== 'undefined') setRevealed(true) } catch(_) {}
    try { if (typeof setFeedback !== 'undefined') setFeedback('⏰ Time\'s up! Speed run requires a quick answer.') } catch(_) {}
    try {
      const r = await fetch(`${API}/squaring-api/check`, {
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
      const diff = effectiveDiff()
      const r = await fetch(`${API}/squaring-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`, { headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' } })
      const data = await r.json()
      setQuestion(data)
      setValASq(''); setValBSq(''); setVal2AB(''); setValFinal('')
      setFeedback(''); setIsCorrect(null); setRevealed(false)
      submittedRef.current = false; advancedRef.current = false
      timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
      setTimeout(() => refASq.current?.focus(), 50)
    } catch (e) { console.error('Failed to load Squaring question:', e) }
    setLoading(false)
  }

  const startQuiz = () => {
    const t = Math.max(1, Math.min(100, Number(numQuestions) || DEFAULT_TOTAL))
    setTotalQ(t); setScore(0); setQuestionNumber(1); setResults([]); setStarted(true); setFinished(false)
    setAdaptScore(0); adaptScoreRef.current = 0
    submittedRef.current = false; advancedRef.current = false
  }

  useEffect(() => { if (started && !finished && questionNumber > 0) loadQuestion() }, [started, questionNumber])

  const advance = () => { if (advancedRef.current) return; advancedRef.current = true; if (questionNumber >= totalQ) setFinished(true); else setQuestionNumber(n => n + 1) }
  advanceFnRef.current = advance
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  useEffect(() => {
    if (!revealed || isCorrect) return
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); advance() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [revealed, isCorrect, questionNumber])

  const isComplete = () => valASq.trim() !== '' && valBSq.trim() !== '' && val2AB.trim() !== '' && valFinal.trim() !== ''

  const handleSubmit = async () => {
    if (!question || revealed || !isComplete()) return
    if (submittedRef.current) return
    submittedRef.current = true
    const timeTaken = timer.stop()
    const userAnswer = `${valASq.trim()}|${valBSq.trim()}|${val2AB.trim()}|${valFinal.trim()}`
    try {
      const r = await fetch(`${API}/squaring-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  ...question, userAnswer, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(data.correct); setRevealed(true)
      if (data.correct) setScore(s => s + 1);
      (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${question.n}² = ${question.answer}`.slice(0,-1) + _ci + `Correct! ${question.n}² = ${question.answer}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. ${question.display}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect. ${question.display}`)
        }
      })()
      setResults(prev => [...prev, { prompt: question.prompt, userAnswer: valFinal.trim(), correctAnswer: String(question.answer), correct: data.correct, time: timeTaken }])
      if (isAdaptive) {
        setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
      }
    } catch (e) { submittedRef.current = false; console.error('Failed to check Squaring answer:', e) }
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    submittedRef.current = true
    timer.stop()
    try {
      const r = await fetch(`${API}/squaring-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  ...question, userAnswer: '', solve: true, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(false); setRevealed(true)
      const display = data.display || data.correctAnswer || data.answer || ''
      const explanation = data.explanation || ''
      setFeedback(`Solution: ${display}${explanation ? '\n' + explanation : ''}`)
      setResults(prev => [...prev, { prompt: question.prompt, userAnswer: '(solved)', correctAnswer: display, correct: false, time: 0 }])
      if (isAdaptive) {
        setAdaptScore(prev => Math.max(0, prev - 0.35))
      }
    } catch (e) { submittedRef.current = false; console.error('Failed to solve Squaring:', e) }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!revealed) handleSubmit() } }

  // Tab between the four fields
  const handleFieldKey = (e, nextRef) => {
    if (e.key === 'Tab' && !e.shiftKey && nextRef?.current) {
      e.preventDefault()
      nextRef.current.focus()
    }
    handleKeyDown(e)
  }

  const numInput = (val, setter, ref, nextRef, label, correctVal) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <label className="matrix-label">{label}</label>
      <input
        ref={ref}
        className={`matrix-grid-cell${revealed ? (isCorrect ? ' revealed-correct' : ' revealed-wrong') : ''}`}
        style={{ width: 90, height: 44, fontSize: '1.1rem' }}
        type="text" value={val}
        onChange={e => { if (!revealed) { const v = e.target.value; if (v === '' || /^-?\d+$/.test(v)) setter(v) } }}
        onKeyDown={e => handleFieldKey(e, nextRef)}
        disabled={revealed}
        placeholder="?"
      />
      {revealed && !isCorrect && <span style={{ fontSize: '0.78rem', color: '#f44336', fontWeight: 600 }}>{correctVal}</span>}
    </div>
  )

  return (
    <QuizLayout title="Squaring" subtitle="(a + b)² = a² + 2ab + b²" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Square numbers quickly using the identity (a + b)² = a² + 2ab + b²</p>
        <KeyTerms topicKey="squaring" />
        <p style={{ fontSize: '0.85rem', color: 'var(--clr-dim)', marginBottom: '8px' }}>Split any number into a round part (a) and remainder (b), then fill in all four boxes.</p>
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {DIFFS.map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="squaring-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {DIFF_LABELS_SQ[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="squaring-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
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
                        <input type="radio" name="squaringapp-goal" checked={sessionGoal === g.key} onChange={() => {
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
        {isAdaptive && (
          <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />
        )}
        {question && <div style={{ textAlign: 'center' }}>
          <div className="question-prompt" style={{ fontSize: '1.4rem', margin: '16px 0 6px', lineHeight: '1.6' }}>
            {question.n}²
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--clr-dim)', marginBottom: 14 }}>
            Split as ({question.a} + {question.b})² &nbsp;→&nbsp; {question.a}² + 2·{question.a}·{question.b} + {question.b}²
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            {numInput(valASq, setValASq, refASq, refBSq, `${question.a}²`, question.aSq)}
            <span className="matrix-op" style={{ marginTop: 28 }}>+</span>
            {numInput(val2AB, setVal2AB, ref2AB, refBSq, `2·${question.a}·${question.b}`, question.twoAB)}
            <span className="matrix-op" style={{ marginTop: 28 }}>+</span>
            {numInput(valBSq, setValBSq, refBSq, refFinal, `${question.b}²`, question.bSq)}
            <span className="matrix-op" style={{ marginTop: 28 }}>=</span>
            {numInput(valFinal, setValFinal, refFinal, null, 'Answer', question.answer)}
          </div>
        </div>}
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed ? <>
            <button onClick={handleSubmit} disabled={loading || !question || !isComplete()}>Submit</button>
            <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>Solve</button>
          </> : <button onClick={advance}>{questionNumber >= totalQ ? 'Finish Quiz' : 'Next Question'}</button>}
        </div>
        {results.length > 0 && <ResultsTable results={results} />}
      </>}
      {finished && <div className="welcome-box">
        <p className="welcome-text">Quiz complete!</p>
        <p className="final-score">Final score: {score}/{totalQ}</p>
        {isAdaptive && <p style={{ fontSize: '0.9rem', color: 'var(--clr-dim)' }}>Reached level: <strong style={{ color: ADAPT_COLORS[curAdaptLevel] }}>{ADAPT_LABELS[curAdaptLevel]}</strong></p>}
        <ResultsTable results={results} />
        <button onClick={() => { setStarted(false); setFinished(false) }}>Play Again</button>
      </div>}
    </QuizLayout>
  )
}

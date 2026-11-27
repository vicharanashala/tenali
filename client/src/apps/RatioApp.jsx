import React, { useState, useEffect, useRef } from 'react';
import { cjTakeReco } from '../cjReco';
import KeyTerms from '../components/KeyTerms';
import GlossaryText from '../components/GlossaryText';
import { HintModal } from '../components/HintSystem/HintModal.jsx';
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx';

export default function RatioApp({
  onBack, completedTopics = [], goldMastery = [], markTopicCompleted, markGoldMastery, updateCoins, setMode, setTransferTopic, isGoalMode = false,
  API,
  DEFAULT_TOTAL,
  authGetToken,
  CJ_RECO_DIFFS,
  isStage3Completed,
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
  const QuizLayout = quizLayout;
  const DifficultySlider = difficultySlider;
  const ResultsTable = resultsTable;

  const [difficulty, setDifficulty] = useState(() => cjTakeReco('ratio', CJ_RECO_DIFFS) || 'easy')
  const [isAdaptive, setIsAdaptive] = useState(false)
  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)
  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (finished) {
      const pass = score / totalQ >= 0.8
      if (pass && markTopicCompleted) {
        markTopicCompleted('ratio', isAdaptive ? 'adaptive' : difficulty)
      }
    }
  }, [finished])

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
  const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp('ratio', finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);
  const advanceFnRef = useRef(null)
  const advancedRef = useRef(false)
  const submittedRef = useRef(false)

  const effectiveDiff = () => (isAdaptive) ? adaptiveLevel(adaptScoreRef.current) : difficulty


  const handleTimeout = async () => {
    if (typeof revealed !== 'undefined' && revealed) return
    if (typeof finished !== 'undefined' && finished) return
    try { if (typeof setIsCorrect !== 'undefined') setIsCorrect(false) } catch(_) {}
    try { if (typeof setRevealed !== 'undefined') setRevealed(true) } catch(_) {}
    try { if (typeof setFeedback !== 'undefined') setFeedback('⏰ Time\'s up! Speed run requires a quick answer.') } catch(_) {}
    try {
      const r = await fetch(`${API}/ratio-api/check`, {
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
      const r = await fetch(`${API}/ratio-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`, { headers: { 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' } })
      const data = await r.json()
      setQuestion(data)
      setAnswer('')
      setFeedback('')
      setIsCorrect(null)
      setRevealed(false)
      submittedRef.current = false
      advancedRef.current = false
      timer.start(sessionGoal, handleTimeout, getSpeedRunLimit(difficulty ?? 'easy', isAdaptive ?? false))
    } catch (e) { console.error('Failed to load ratio question:', e) }
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
    submittedRef.current = false
    advancedRef.current = false
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

  const handleSubmit = async () => {
    if (!question || revealed || !answer.trim()) return
    if (submittedRef.current) return
    submittedRef.current = true
    const timeTaken = timer.stop()
    const payload = { ...question, answer: answer.trim() }
    try {
      const r = await fetch(`${API}/ratio-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({ ...payload, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(data.correct)
      setRevealed(true)
      if (data.correct) setScore(s => s + 1);
      (() => {
        const _ci = data.lil?.coinsEarned > 0 ? ` (+${data.lil.coinsEarned} coins!)` : ''
        if (data.correct) {
          setFeedback(`Correct! ${data.display}`.slice(0,-1) + _ci + `Correct! ${data.display}`.slice(-1))
        } else if (sessionGoal === 'perfect') {
          setFeedback(`Incorrect. Answer: ${data.display}` + ' ❌ Perfect Solve ended.')
          setFinished(true); timer.reset()
        } else {
          setFeedback(`Incorrect. Answer: ${data.display}`)
        }
      })()
      setResults(prev => [...prev, { prompt: question.prompt, userAnswer: answer.trim(), correctAnswer: data.display, correct: data.correct, time: timeTaken }])
      if (isAdaptive) {
        setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
      }
    } catch (e) { console.error('Failed to check ratio answer:', e) }
  }

  const handleSolve = async () => {
    if (!question || revealed) return
    submittedRef.current = true
    timer.stop()
    try {
      const r = await fetch(`${API}/ratio-api/check`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' }, body: JSON.stringify({  ...question, answer: '', solve: true, sessionGoal }) })
      const data = await r.json()
      setIsCorrect(false); setRevealed(true)
      const display = data.display || data.correctAnswer || data.answer || ''
      const explanation = data.explanation || ''
      setFeedback(`Solution: ${display}${explanation ? '\n' + explanation : ''}`)
      setResults(prev => [...prev, { prompt: question.prompt, userAnswer: '(solved)', correctAnswer: display, correct: false, time: 0 }])
      if (isAdaptive) {
        setAdaptScore(prev => Math.max(0, prev - 0.35))
      }
    } catch (e) { submittedRef.current = false; console.error('Failed to solve ratio:', e) }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!revealed) handleSubmit() } }
  const diffLabels = { easy: 'Easy — Simplify', medium: 'Medium — Divide', hard: 'Hard — Direct', extrahard: 'Extra Hard — Inverse' }
  const placeholders = { easy: 'e.g. 3:2', medium: 'e.g. 72, 48', hard: 'e.g. 32', extrahard: 'e.g. 8 or 8/3' }

  const curAdaptLevel = adaptiveLevel(adaptScore)

  return (
    <QuizLayout title="Ratio & Proportion" subtitle="Simplify, divide, direct & inverse" onBack={onBack} timer={started && !finished && sessionGoal !== 'perfect' ? timer : null} sessionGoal={sessionGoal}>
      {!started && !finished && <div className="welcome-box">
        <p className="welcome-text">Practice ratio and proportion!</p>
        <KeyTerms topicKey="ratios" />
        <div className="checkbox-group" style={{ marginBottom: '12px' }}>
          {['easy', 'medium', 'hard', 'extrahard'].map(d => (
            <label key={d} className={`checkbox-pill${!isAdaptive && difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="ratio-diff" checked={!isAdaptive && difficulty === d} onChange={() => { setDifficulty(d); setIsAdaptive(false) }} />
              {diffLabels[d]}
            </label>
          ))}
          <label className={`checkbox-pill${isAdaptive ? ' active' : ''}`} style={isAdaptive ? { background: 'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)', color: '#fff', border: 'none' } : {}}>
            <input type="radio" name="ratio-diff" checked={isAdaptive} onChange={() => setIsAdaptive(true)} />
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
                        <input type="radio" name="ratioapp-goal" checked={sessionGoal === g.key} onChange={() => {
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
        {isStage3Completed('ratio', completedTopics) && (
          <div className="transfer-cta-box" style={{ marginTop: '20px', padding: '16px', background: 'var(--clr-hover, rgba(255,255,255,0.03))', borderRadius: '10px', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>
              {goldMastery.includes('ratio') ? (
                <>🥇 You have achieved Gold Mastery for this topic!</>
              ) : (
                <>🎉 You have completed Stage 3 Practice for this topic!</>
              )}
            </p>
            <button
              className="btn-transfer-cta"
              onClick={() => {
                if (setTransferTopic) setTransferTopic('ratio')
                if (setMode) setMode('transfer')
              }}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {goldMastery.includes('ratio') ? (
                <>🔄 Revisit Transfer Challenge (Stage 4) 🥇</>
              ) : (
                <>🚀 Start Transfer Challenge (Stage 4) 🥇</>
              )}
            </button>
          </div>
        )}
      </div>}
      {started && !finished && <>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
          {isAdaptive && <div className="progress-pill" style={{ background: ADAPT_COLORS[curAdaptLevel], color: '#fff' }}>{ADAPT_LABELS[curAdaptLevel]}</div>}
        </div>
        {isAdaptive && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }} />}
        {question && <div style={{ textAlign: 'center' }}>
          <div className="question-prompt" style={{ fontSize: '1.4rem', margin: '20px 0' }}><GlossaryText text={question.prompt} /></div>
          <input className="answer-input" type="text" value={answer} onChange={e => { if (!revealed) setAnswer(e.target.value) }} disabled={revealed} placeholder={placeholders[isAdaptive ? adaptiveLevel(adaptScore) : difficulty] || 'Type your answer'} onKeyDown={handleKeyDown} autoFocus />
        </div>}
        {renderFeedback(feedback, isCorrect)}
        <div className="button-row">
          {!revealed ? <>
            <button onClick={handleSubmit} disabled={loading || !answer.trim()}>Submit</button>
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
    <HintModal concept={'ratio'} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />
</QuizLayout>
  )

}

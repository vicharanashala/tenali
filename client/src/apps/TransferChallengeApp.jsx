import { useState, useEffect, useRef } from 'react'

export default function TransferChallengeApp({ topicKey, onBack, completedTopics, goldMastery, updateCoins, markGoldMastery, useTimer, QuizLayout, ResultsTable, API }) {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQ] = useState(2)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHintLevel, setShowHintLevel] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [transferMapping, setTransferMapping] = useState('')
  const [results, setResults] = useState([])
  const [goldMasteryEarned, setGoldMasteryEarned] = useState(false)

  const timer = useTimer()
  const submittedRef = useRef(false)
  const advancedRef = useRef(false)

  const topicTitles = {
    percent: 'Percentages',
    ratio: 'Ratio & Proportion',
    fractionadd: 'Fraction Addition'
  }

  const loadQuestion = async () => {
    setLoading(true)
    try {
      const headers = {}
      const token = localStorage.getItem('tenali-auth-token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API}/transfer-api/question?topic=${topicKey}`, { headers })
      const data = await res.json()

      setQuestion(data)
      setAnswer('')
      setFeedback('')
      setIsCorrect(null)
      setRevealed(false)
      setShowHintLevel(0)
      setHintsUsed(0)
      setExplanation('')
      setTransferMapping('')
      submittedRef.current = false
      advancedRef.current = false
      timer.start()
    } catch (e) {
      console.error('Failed to load transfer challenge question:', e)
    }
    setLoading(false)
  }

  const startChallenge = () => {
    setQuestionNumber(1)
    setResults([])
    setStarted(true)
    setFinished(false)
    setGoldMasteryEarned(false)
    submittedRef.current = false
    advancedRef.current = false
  }

  useEffect(() => {
    if (started && !finished && questionNumber > 0) {
      loadQuestion()
    }
  }, [started, questionNumber])

  const handleSubmit = async () => {
    if (!question || revealed || !answer.trim()) return
    if (submittedRef.current) return
    submittedRef.current = true
    const timeTaken = timer.stop()

    const payload = {
      topic: topicKey,
      scenarioId: question.scenarioId,
      variables: question.variables,
      userAnswer: answer.trim(),
      hintsUsed,
      timeSpentSeconds: timeTaken
    }

    try {
      const headers = { 'Content-Type': 'application/json' }
      const token = localStorage.getItem('tenali-auth-token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API}/transfer-api/check`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      setIsCorrect(data.correct)
      setRevealed(true)
      setExplanation(data.explanation || '')
      setTransferMapping(data.transferMapping || '')

      const isAllCorrect = (questionNumber === totalQ) && results.every(r => r.correct) && data.correct

      if (data.correct) {
        setFeedback(`Correct! Expected: ${data.answer}`)
      } else {
        setFeedback(`Incorrect. Expected: ${data.answer}`)
      }

      setResults(prev => [...prev, {
        prompt: question.prompt,
        userAnswer: answer.trim(),
        correctAnswer: data.answer,
        correct: data.correct,
        time: timeTaken
      }])

      if (isAllCorrect) {
        markGoldMastery(topicKey)
        updateCoins(150)
        setGoldMasteryEarned(true)
      }
    } catch (e) {
      submittedRef.current = false
      console.error('Failed to submit transfer challenge answer:', e)
    }
  }

  const advance = () => {
    if (advancedRef.current) return
    advancedRef.current = true
    if (questionNumber >= totalQ) {
      setFinished(true)
    } else {
      setQuestionNumber(n => n + 1)
    }
  }

  const getHint = () => {
    if (showHintLevel >= 3) return
    const nextLevel = showHintLevel + 1
    setShowHintLevel(nextLevel)

    if (nextLevel > 1) {
      setHintsUsed(prev => prev + 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!revealed) {
        handleSubmit()
      } else {
        advance()
      }
    }
  }

  const contextIcons = {
    shopping: '🛒',
    sports: '🏏',
    cooking: '🍕',
    travel: '🚂',
    pocketmoney: '🪙'
  }

  const getTopicTitle = () => {
    if (topicTitles[topicKey]) return topicTitles[topicKey]
    // Clean and capitalize key (e.g. hcf_lcm -> Hcf lcm, trig -> Trig)
    return topicKey.charAt(0).toUpperCase() + topicKey.slice(1).replace(/_/g, ' ')
  }

  return (
    <QuizLayout
      title={`Transfer Challenge: ${getTopicTitle()}`}
      subtitle="Apply your knowledge to real-world problems!"
      onBack={onBack}
      timer={started && !finished ? timer : null}
    >
      {!started && !finished && (
        <div className="welcome-box">
          <p className="welcome-text">
            Test whether you can apply your math skills to real-world scenarios.
            Earn your <strong>Gold Mastery Badge 🥇</strong>!
          </p>
          <div className="transfer-header" style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
            <h2>Ready to transfer?</h2>
            <p>Complete {totalQ} challenges with no time limit.</p>
          </div>
          <button className="btn-transfer-cta" onClick={startChallenge}>
            Start Challenge 🥇
          </button>
        </div>
      )}

      {started && !finished && (
        <>
          <div className="transfer-header">
            <h2>Challenge {questionNumber} of {totalQ}</h2>
            <div className="transfer-progress-bar-container">
              <div
                className="transfer-progress-bar"
                style={{ width: `${(questionNumber - 1) * 50}%` }}
              />
            </div>
          </div>

          {question && (
            <div className="transfer-card">
              <div className="transfer-context-badge">
                <span>{contextIcons[question.context] || '💡'}</span>
                <span>{question.context}</span>
              </div>
              <div className="transfer-prompt">{question.prompt}</div>

              {!revealed && (
                <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    onClick={getHint}
                    disabled={showHintLevel >= 3}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--clr-accent)',
                      color: 'var(--clr-accent)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    💡 Hint Level {showHintLevel + 1}
                  </button>
                </div>
              )}

              {showHintLevel > 0 && question.hints && (
                <div style={{
                  background: 'var(--clr-hover, rgba(255,255,255,0.03))',
                  border: '1px solid var(--clr-border)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  margin: '12px 0',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <strong style={{ color: 'var(--clr-accent)' }}>Hint Level {showHintLevel}:</strong>
                  <p style={{ margin: '6px 0 0' }}>
                    {showHintLevel === 1 && (question.hints[0] || question.hints.level1)}
                    {showHintLevel === 2 && (question.hints[1] || question.hints.level2)}
                    {showHintLevel === 3 && (question.hints[2] || question.hints.level3)}
                  </p>
                </div>
              )}

              <input
                className="answer-input"
                type="text"
                value={answer}
                onChange={e => { if (!revealed) setAnswer(e.target.value) }}
                disabled={revealed}
                placeholder="Type your answer (e.g. 1500, 3/4)"
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}

          {!question && loading && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--clr-text-soft)' }}>
              Loading scenario…
            </div>
          )}

          {revealed && (
            <div className="transfer-feedback-panel" style={{ borderLeftColor: isCorrect ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #f44336)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)' }}>
                {isCorrect ? '✅ Well done!' : "❌ Let's review this:"}
              </div>
              <div className="transfer-feedback-explanation">{explanation}</div>
              <div className="transfer-mapping-panel">
                <strong>Conceptual Link:</strong> {transferMapping}
              </div>
            </div>
          )}

          <div className="button-row">
            {!revealed ? (
              <button onClick={handleSubmit} disabled={loading || !answer.trim()}>
                Submit Answer
              </button>
            ) : (
              <button onClick={advance}>
                {questionNumber >= totalQ ? 'Complete Challenge' : 'Next Challenge'}
              </button>
            )}
          </div>
        </>
      )}

      {finished && (
        <div className="welcome-box">
          {goldMasteryEarned ? (
            <div className="gold-badge-container">
              <div className="gold-badge-shimmer">🥇</div>
              <h2 style={{ marginTop: '16px', color: '#F5A623' }}>Gold Mastery Achieved!</h2>
              <p className="welcome-text" style={{ margin: '12px 0 24px' }}>
                Awesome transfer! You successfully solved the real-world word problems and earned your Gold Mastery Badge!
              </p>
            </div>
          ) : (
            <>
              <p className="welcome-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                You are close, try again!
              </p>
              <p className="welcome-text">
                Keep practicing to unlock your Gold Mastery Badge! Review your results below.
              </p>
            </>
          )}

          <ResultsTable results={results} />

          <button className="btn-transfer-cta" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      )}
    </QuizLayout>
  )
}

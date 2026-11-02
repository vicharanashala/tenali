import { useState } from 'react'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const fetchQuestion = async (nextStep) => {
    setLoading(true)
    setAnswer('')
    setFeedback('')
    setRevealed(false)
    const res = await fetch(`/api/question?step=${nextStep}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
  }

  const startQuiz = async () => {
    setStarted(true)
    setScore(0)
    setQuestionNumber(1)
    await fetchQuestion(1)
  }

  const handleSubmitOrNext = async () => {
    if (!question) return

    if (!revealed) {
      if (answer === '') return
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: question.q, answer: Number(answer) }),
      })
      const data = await res.json()
      if (data.correct) setScore((s) => s + 1)
      setFeedback(
        data.correct
          ? `Correct ✅ √${question.q} ≈ ${data.sqrtRounded}`
          : `Incorrect. √${question.q} ≈ ${data.sqrtRounded}, so acceptable answers are ${data.floorAnswer} or ${data.ceilAnswer}.`
      )
      setRevealed(true)
      return
    }

    const nextNum = questionNumber + 1
    setQuestionNumber(nextNum)
    await fetchQuestion(nextNum)
  }

  return (
    <div className="app-shell">
      <div className="card">
        <div className="top-row">
          <div className="progress-pill">{started ? `Question ${questionNumber}` : 'Continuous quiz'}</div>
          <div className="score-pill">Score: {score}</div>
        </div>

        <h1>Aryabhata Square Root</h1>
        <p className="subtitle">Give the nearest integer answer. Floor or ceiling is accepted.</p>

        {!started && (
          <div className="welcome-box">
            <p className="welcome-text">The square-root drill will keep going until you stop.</p>
            <button onClick={startQuiz}>Start Drill</button>
          </div>
        )}

        {started && (
          <>
            <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
            <input
              className="answer-input"
              type="number"
              inputMode="numeric"
              placeholder="Type your answer"
              value={answer}
              onChange={(e) => !revealed && setAnswer(e.target.value)}
              disabled={revealed}
            />
            {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>{feedback}</div>}
            <div className="button-row">
              <button onClick={handleSubmitOrNext} disabled={loading || (!revealed && answer === '')}>
                {revealed ? 'Next Question' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App

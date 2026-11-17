import { useState } from 'react'
import './App.css'

const TOTAL_QUESTIONS = 20

function App() {
  const [digits, setDigits] = useState(1)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchQuestion = async (selectedDigits = digits) => {
    setLoading(true)
    setFeedback('')
    setAnswer('')
    const res = await fetch(`/api/question?digits=${selectedDigits}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
  }

  const startQuiz = async () => {
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    await fetchQuestion(digits)
  }

  const submitAnswer = async () => {
    if (!question || answer === '') return
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: question.a, b: question.b, answer: Number(answer) }),
    })
    const data = await res.json()
    const newScore = score + (data.correct ? 1 : 0)
    setScore(newScore)
    setFeedback(data.correct ? 'Correct' : `Incorrect. Right answer: ${data.correctAnswer}`)

    setTimeout(async () => {
      if (questionNumber >= TOTAL_QUESTIONS) {
        setFinished(true)
        setQuestion(null)
        return
      }
      setQuestionNumber((n) => n + 1)
      await fetchQuestion(digits)
    }, 700)
  }

  const playAgain = async () => {
    await startQuiz()
  }

  return (
    <div className="app-shell">
      <div className="card">
        <div className="top-row">
          <div className="progress-pill">{started && !finished ? `Question ${questionNumber}/${TOTAL_QUESTIONS}` : `Quiz: ${TOTAL_QUESTIONS} questions`}</div>
          <div className="score-pill">Score: {score}</div>
        </div>

        <h1>Aryabhata Addition</h1>
        <p className="subtitle">Choose a level and solve 20 addition questions</p>

        <div className="radio-group">
          {[1, 2, 3].map((value) => (
            <label key={value} className={`radio-pill ${digits === value ? 'active' : ''}`}>
              <input
                type="radio"
                name="digits"
                value={value}
                checked={digits === value}
                onChange={() => setDigits(value)}
                disabled={started && !finished}
              />
              {value === 1 ? 'One digit' : value === 2 ? 'Two digits' : 'Three digits'}
            </label>
          ))}
        </div>

        {!started && !finished && (
          <div className="welcome-box">
            <p className="welcome-text">The quiz is ready to begin.</p>
            <button onClick={startQuiz}>Start Quiz</button>
          </div>
        )}

        {started && !finished && (
          <>
            <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>
            <input
              className="answer-input"
              type="number"
              inputMode="numeric"
              placeholder="Type your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="button-row">
              <button onClick={submitAnswer} disabled={answer === '' || loading}>Submit</button>
            </div>
            {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>{feedback}</div>}
          </>
        )}

        {finished && (
          <div className="welcome-box">
            <p className="welcome-text">Quiz complete.</p>
            <p className="final-score">Final score: {score}/{TOTAL_QUESTIONS}</p>
            <button onClick={playAgain}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

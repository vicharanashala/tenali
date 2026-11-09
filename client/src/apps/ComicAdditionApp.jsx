import React, { useEffect, useRef, useState } from 'react'
import QuizLayout from '../components/QuizLayout'
import NumPad from '../components/NumPad'
import { useAutoAdvance } from '../hooks/useAutoAdvance'

const API = import.meta.env.VITE_API_BASE_URL || ''

function renderFeedback(feedback, isCorrect) {
  if (!feedback) return null

  const isSolve =
    isCorrect === false && feedback.startsWith('Solution:')

  if (!isSolve) {
    return (
      <div
        className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span>{feedback}</span>
      </div>
    )
  }

  const lines = feedback.split('\n')

  return (
    <div className="feedback wrong">
      {lines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  )
}


function ComicAdditionApp({ onBack }) {
  const [started, setStarted] = useState(false)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const advanceFnRef = useRef(null)

  const fetchQuestion = async () => {
    setLoading(true)
    setFeedback('')
    setAnswer('')
    setRevealed(false)
    setIsCorrect(null)
    const res = await fetch(`${API}/addition-api/question?digits=2`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
  }

  const startQuiz = async () => {
    setStarted(true)
    await fetchQuestion()
  }

  const handleSubmitOrNext = async () => {
    if (loading || !question) return
    if (revealed) {
      await fetchQuestion()
      return
    }
    if (!answer.trim()) return

    setLoading(true)
    const payload = { ...question, answer: answer.trim() }
    const res = await fetch(`${API}/addition-api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    setLoading(false)
    setIsCorrect(data.correct)
    setFeedback(data.correct ? 'Correct! Great job!' : `Oops! The correct answer was ${data.correctAnswer}.`)
    setRevealed(true)
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!started) return
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSubmitOrNext()
        return
      }
      if (revealed || loading) return
      if (/^[0-9]$/.test(event.key)) {
        setAnswer(prev => prev + event.key)
      } else if (event.key === 'Backspace') {
        setAnswer(prev => prev.slice(0, -1))
      } else if (event.key === '-') {
        setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [started, revealed, loading, answer, question])

  advanceFnRef.current = handleSubmitOrNext
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  if (!started) {
    return (
      <QuizLayout title="Comic Addition" subtitle="Math with a Story" onBack={onBack}>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn" onClick={startQuiz}>Start Reading</button>
        </div>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title="Comic Addition" subtitle="Math with a Story" onBack={onBack}>
      <div className="comic-container">
        {question && (
          <>
            <div className="comic-panel left">
              <div className="comic-avatar">
                <div className="avatar-emoji">????</div>
                <span>Mom</span>
              </div>
              <div className="comic-bubble">
                Oh! We have {question.a} oranges in this basket, and {question.b} oranges on the table.
              </div>
            </div>
            <div className="comic-panel right">
              <div className="comic-bubble">
                I wonder how many oranges we have in total? Let's add them up!
              </div>
              <div className="comic-avatar">
                <div className="avatar-emoji">????</div>
                <span>Boy</span>
              </div>
            </div>

            <div className="comic-panel left" style={{ marginTop: 20 }}>
              <div className="comic-avatar">
                <div className="avatar-emoji">????</div>
                <span>Mom</span>
              </div>
              <div className="comic-bubble">
                Can you tell me what {question.a} + {question.b} is?
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <input
            className="answer-input"
            type="text"
            inputMode="numeric"
            value={answer}
            readOnly
            placeholder="?"
            style={{ width: '100%', maxWidth: 200, margin: '0 auto', display: 'block' }}
          />
        </div>

        <div className="button-row" style={{ marginTop: 20, justifyContent: 'center' }}>
          <button className="btn" onClick={handleSubmitOrNext} disabled={loading || (!revealed && !answer)}>
            {revealed ? 'Next Question' : 'Submit'}
          </button>
        </div>

        {revealed && (
          <div style={{ marginTop: 20 }}>
            {renderFeedback(feedback, isCorrect)}
          </div>
        )}

        {!revealed && (
          <div style={{ marginTop: 20 }}>
            <NumPad value={answer} onChange={setAnswer} onSubmit={handleSubmitOrNext} disabled={loading} />
          </div>
        )}
      </div>
    </QuizLayout>
  )
}
export default ComicAdditionApp;
import React, { useRef, useState } from 'react';
import { QuizLayout, useAutoAdvance } from '../App';

function DragDropCountingApp({ onBack }) {
  const [started, setStarted] = useState(false)
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const [sourceItems, setSourceItems] = useState([])
  const [targetItems, setTargetItems] = useState([])

  const advanceFnRef = useRef(null)

  const fetchQuestion = async () => {
    setLoading(true)
    setFeedback('')
    setRevealed(false)
    setIsCorrect(null)

    const res = await fetch(`${API}/addition-api/question?digits=1`)
    const data = await res.json()
    setQuestion(data)

    const initialItems = Array.from({ length: 15 }, (_, i) => ({ id: `apple-${i}`, icon: 'ðŸŽ' }))
    setSourceItems(initialItems)
    setTargetItems([])

    setLoading(false)
  }

  const startQuiz = async () => {
    setStarted(true)
    await fetchQuestion()
  }

  const handleDragStart = (e, item, sourceZone) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, sourceZone }))
    e.currentTarget.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetZone) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data.sourceZone === targetZone) return

      const { item, sourceZone } = data

      if (sourceZone === 'source' && targetZone === 'target') {
        setSourceItems(prev => prev.filter(i => i.id !== item.id))
        setTargetItems(prev => [...prev, item])
      } else if (sourceZone === 'target' && targetZone === 'source') {
        setTargetItems(prev => prev.filter(i => i.id !== item.id))
        setSourceItems(prev => [...prev, item])
      }
    } catch (err) {
      // ignore parsing errors
    }
  }

  const handleSubmitOrNext = async () => {
    if (loading || !question) return
    if (revealed) {
      await fetchQuestion()
      return
    }

    setLoading(true)
    const actualAnswer = targetItems.length

    const payload = { ...question, answer: String(actualAnswer) }
    const res = await fetch(`${API}/addition-api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()

    setLoading(false)
    setIsCorrect(data.correct)
    setFeedback(data.correct ? 'Correct! Great job!' : `Oops! We needed ${data.correctAnswer} apples.`)
    setRevealed(true)
  }

  advanceFnRef.current = handleSubmitOrNext
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  if (!started) {
    return (
      <QuizLayout title="Visual Counting" subtitle="Drag & Drop" onBack={onBack}>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn" onClick={startQuiz}>Start Practice</button>
        </div>
      </QuizLayout>
    )
  }

  return (
    <QuizLayout title="Visual Counting" subtitle="Drag & Drop" onBack={onBack}>
      <div className="dnd-container">
        {question && (
          <h2 style={{ textAlign: 'center' }}>
            Put {question.a} + {question.b} apples in the basket!
          </h2>
        )}

        <div
          className="dnd-source"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'source')}
        >
          {sourceItems.map(item => (
            <div
              key={item.id}
              className="dnd-item"
              draggable={!revealed}
              onDragStart={(e) => handleDragStart(e, item, 'source')}
              onDragEnd={handleDragEnd}
            >
              {item.icon}
            </div>
          ))}
        </div>

        <div
          className="dnd-target"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'target')}
        >
          {targetItems.map(item => (
            <div
              key={item.id}
              className="dnd-item"
              draggable={!revealed}
              onDragStart={(e) => handleDragStart(e, item, 'target')}
              onDragEnd={handleDragEnd}
            >
              {item.icon}
            </div>
          ))}
        </div>

        <div className="button-row" style={{ marginTop: 20, justifyContent: 'center' }}>
          <button className="btn" onClick={handleSubmitOrNext} disabled={loading || (!revealed && targetItems.length === 0)}>
            {revealed ? 'Next Question' : 'Submit'}
          </button>
        </div>

        {revealed && (
          <div style={{ marginTop: 20 }}>
            {renderFeedback(feedback, isCorrect)}
          </div>
        )}
      </div>
    </QuizLayout>
  )
}


export default DragDropCountingApp;

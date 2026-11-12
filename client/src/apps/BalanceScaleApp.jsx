import React, { useEffect, useRef, useState } from 'react';
import { QuizLayout, useAutoAdvance } from '../App';

function BalanceScaleApp({ onBack }) {
  const [level, setLevel] = useState(null) // 'easy' | 'medium' | 'hard'
  const [started, setStarted] = useState(false)
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [revealed, setRevealed] = useState(false)

  // Timer state
  const [timeLeft, setTimeLeft] = useState(60)

  // Weight blocks
  const [leftBlocks, setLeftBlocks] = useState([]) // we only need the total value here
  const [rightBlocks, setRightBlocks] = useState([])
  const [bankBlocks, setBankBlocks] = useState([])

  const advanceFnRef = useRef(null)
  const targetTotal = question ? (Number(question.a) + Number(question.b)) : 0
  const rightTotal = rightBlocks.reduce((acc, b) => acc + b.val, 0)

  const createDynamicWeightBank = (target) => {
    let denominations = [];
    if (target >= 500) {
      denominations = [500, 100, 50, 10, 5, 1];
    } else if (target >= 100) {
      denominations = [100, 50, 10, 5, 1];
    } else if (target >= 15) {
      denominations = [50, 10, 5, 1];
    } else {
      denominations = [5, 1];
    }

    let bank = [];
    denominations.forEach(d => {
      let count = 4;
      if (d === 100) count = 10;
      if (d === 50) count = 6;
      if (d === 10) count = 15;
      if (d === 5) count = 8;
      if (d === 1) count = 15;

      const needed = Math.ceil(target / d) + 2;
      if (needed > count) {
        count = needed;
      }

      for (let i = 0; i < count; i++) {
        bank.push({ id: `bank-${d}-${i}-${Math.random()}`, val: d });
      }
    });
    return bank;
  };

  const fetchQuestion = async (selectedLevel) => {
    setLoading(true)
    setFeedback('')
    setRevealed(false)
    setIsCorrect(null)

    // Configure based on difficulty
    const digits = selectedLevel === 'easy' ? 1 : 2
    const initialTime = selectedLevel === 'hard' ? 45 : 60
    setTimeLeft(initialTime)

    const res = await fetch(`${API}/addition-api/question?digits=${digits}`)
    const data = await res.json()
    setQuestion(data)

    // Generate Bank Blocks
    let initBank = []
    if (selectedLevel === 'easy') {
      if (targetTotal >= 10) {
        const numTens = Math.floor(targetTotal / 10) + 2;
        const numOnes = Math.max(12, (targetTotal % 10) + 5);
        for (let i = 0; i < numTens; i++) {
          initBank.push({ id: `bank-10-${i}-${Math.random()}`, val: 10 });
        }
        for (let i = 0; i < numOnes; i++) {
          initBank.push({ id: `bank-1-${i}-${Math.random()}`, val: 1 });
        }
      } else {
        initBank = Array.from({ length: Math.max(15, targetTotal + 2) }, (_, i) => ({ id: `bank-1-${i}-${Math.random()}`, val: 1 }));
      }
    } else {
      initBank = createDynamicWeightBank(targetTotal)
    }

    setBankBlocks(initBank)
    setRightBlocks([])
    setLoading(false)
  }

  const startQuiz = async (lvl) => {
    setLevel(lvl)
    setStarted(true)
    await fetchQuestion(lvl)
  }

  // Timer Effect
  useEffect(() => {
    let timerId
    if (started && !revealed && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && !revealed) {
      handleCheck(true) // Force submit on timeout
    }
    return () => clearInterval(timerId)
  }, [started, revealed, timeLeft])

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
    if (revealed) return
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data.sourceZone === targetZone) return

      const { item, sourceZone } = data

      if (sourceZone === 'bank' && targetZone === 'right') {
        setBankBlocks(prev => prev.filter(i => i.id !== item.id))
        setRightBlocks(prev => [...prev, item])
      } else if (sourceZone === 'right' && targetZone === 'bank') {
        setRightBlocks(prev => prev.filter(i => i.id !== item.id))
        setBankBlocks(prev => [...prev, item])
      }
    } catch (err) {
      // ignore
    }
  }

  const handleCheck = async (timeExpired = false) => {
    if (loading || !question) return
    if (revealed) {
      await fetchQuestion(level)
      return
    }

    setLoading(true)
    const payload = { ...question, answer: String(rightTotal) }
    const res = await fetch(`${API}/addition-api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()

    setLoading(false)
    setIsCorrect(data.correct)

    if (timeExpired) {
      setFeedback(`Time's up! We needed a total weight of ${data.correctAnswer}.`)
    } else {
      setFeedback(data.correct ? 'Correct! Perfect balance!' : `Oops! Total weight was ${rightTotal}, but we needed ${data.correctAnswer}.`)
    }
    setRevealed(true)
  }

  advanceFnRef.current = () => handleCheck(false)
  useAutoAdvance(revealed, advanceFnRef, isCorrect)

  if (!started) {
    return (
      <QuizLayout title="Balance Scale Math" subtitle="Physics Equation Puzzle" onBack={onBack}>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <h2>Select Difficulty</h2>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
            <button className="btn" style={{ background: '#2ecc71', color: 'white' }} onClick={() => startQuiz('easy')}>
              Easy (Sums to 20, 1-unit blocks)
            </button>
            <button className="btn" style={{ background: '#f39c12', color: 'white' }} onClick={() => startQuiz('medium')}>
              Medium (Sums to 200, Multi-weights)
            </button>
            <button className="btn" style={{ background: '#e74c3c', color: 'white' }} onClick={() => startQuiz('hard')}>
              Hard (Sums to 200, Time Attack)
            </button>
          </div>
        </div>
      </QuizLayout>
    )
  }

  // Calculate tilt visually. A max tilt of 25 degrees.
  const diff = rightTotal - targetTotal
  let rotation = diff * (level === 'easy' ? 4 : 1) // Scale down tilt for large numbers
  if (rotation > 25) rotation = 25
  if (rotation < -25) rotation = -25
  const panRotation = -rotation

  return (
    <QuizLayout title={`Balance Scale Math (${level.toUpperCase()})`} subtitle="Drag weights to balance the equation!" onBack={onBack}>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div className="timer-display">⏱ {timeLeft}s</div>
      </div>

      {question && (
        <h2 style={{ textAlign: 'center', margin: '0' }}>
          Left Side: {question.a} + {question.b}
        </h2>
      )}

      <div className="scale-container">
        <div className="scale-beam" style={{ transform: `rotate(${rotation}deg)` }}>
          <div className="scale-pan left" style={{ transform: `rotate(${panRotation}deg)` }}>
            <div className="weight-block val-50" style={{ background: '#34495e', borderColor: '#2c3e50', width: '60px', height: '60px', cursor: 'default' }}>
              {targetTotal}
            </div>
          </div>
          <div
            className="scale-pan right"
            style={{ transform: `rotate(${panRotation}deg)` }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'right')}
          >
            {rightBlocks.map(b => (
              <div
                key={b.id}
                className={`weight-block val-${b.val}`}
                draggable={!revealed}
                onDragStart={(e) => handleDragStart(e, b, 'right')}
                onDragEnd={handleDragEnd}
              >{b.val}</div>
            ))}
          </div>
        </div>
        <div className="scale-fulcrum"></div>
      </div>

      <div className="weight-bank" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'bank')}>
        {bankBlocks.map(b => (
          <div
            key={b.id}
            className={`weight-block val-${b.val}`}
            draggable={!revealed}
            onDragStart={(e) => handleDragStart(e, b, 'bank')}
            onDragEnd={handleDragEnd}
          >{b.val}</div>
        ))}
      </div>

      <div className="button-row" style={{ marginTop: 20, justifyContent: 'center' }}>
        <button className="btn" onClick={() => handleCheck(false)} disabled={loading || (!revealed && rightBlocks.length === 0)}>
          {revealed ? 'Next Question' : 'Check Balance'}
        </button>
      </div>

      {revealed && (
        <div style={{ marginTop: 20 }}>
          {renderFeedback(feedback, isCorrect)}
        </div>
      )}
    </QuizLayout>
  )
}




/**
 * PercentPage — stable named wrapper so React never unmounts PercentExplanationApp
 * on theme-toggle re-renders.
 *
 * IMPORTANT: this MUST live outside function App() so its reference never
 * changes between renders.  If it were defined inside App() as an inline
 * arrow function (even as a modeMap entry), every theme-state update would
 * produce a new function reference, causing React to tear down and reinitialize
 * the entire component tree — wiping activeSection, quiz progress, XP, etc.
 */

export default BalanceScaleApp;

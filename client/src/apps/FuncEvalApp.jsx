import React, { useState, useRef, useEffect } from 'react'

import {
  API,
  authGetToken,
  DEFAULT_TOTAL,
  useTimer,
  useAutoAdvance,
  getSpeedRunLimit,
  ResultsTable,
  renderFeedback,
  QuizLayout,
  ADAPT_LABELS,
  ADAPT_COLORS,
  adaptiveLevel,
  adaptivePct,
  DifficultySlider,
  NumPad,
} from '../App.jsx'

import { HintModal } from '../components/HintSystem/HintModal.jsx'
import { useQuizHintsAndXp } from '../components/HintSystem/useHints.jsx'
import KeyTerms from '../components/KeyTerms'

function FuncEvalApp({ onBack, isGoalMode = false }) {
  // ─────── Quiz State Management ──────────────────────────────────

  const [difficulty, setDifficulty] = useState('easy')
  const [isAdaptive, setIsAdaptive] = useState(false)

  const [adaptScore, setAdaptScore] = useState(0)
  const adaptScoreRef = useRef(0)

  const [numQuestions, setNumQuestions] = useState(String(DEFAULT_TOTAL))

  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [loading, setLoading] = useState(false)

  const [score, setScore] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQ, setTotalQ] = useState(DEFAULT_TOTAL)

  const [results, setResults] = useState([])

  const [sessionGoal, setSessionGoal] = useState(
    isGoalMode ? 'speed' : 'standard'
  )

  const timer = useTimer()

  const {
    hintsUsedCount,
    xpBreakdown,
    bonusLoading,
  } = useQuizHintsAndXp(
    'funceval',
    finished,
    score,
    totalQ,
    isCorrect || false,
    results
  )

  const advanceFnRef = useRef(null)

  const effectiveDiff = () =>
    isAdaptive
      ? adaptiveLevel(adaptScoreRef.current)
      : difficulty

  // ─────── Timeout Handler ────────────────────────────────────────

  const handleTimeout = async () => {
    if (revealed || finished) return

    setIsCorrect(false)
    setRevealed(true)
    setFeedback("⏰ Time's up!")

    const timeTaken = timer.stop()

    const qPrompt = question
      ? question.prompt ||
        question.question ||
        (
          question.n1 !== undefined
            ? `${question.n1} ${question.op || '+'} ${question.n2}`
            : 'Question'
        )
      : 'Question'

    try {
      const response = await fetch(
        `${API}/funceval-api/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authGetToken()
              ? `Bearer ${authGetToken()}`
              : '',
          },
          body: JSON.stringify({
            ...(question || {}),
            userAnswer: '',
            answer: '',
            sessionGoal,
          }),
        }
      )

      const data = await response.json()

      const correctAnswer =
        data.display ||
        data.correctAnswer ||
        data.answer ||
        '—'

      setResults(prev => [
        ...prev,
        {
          prompt: qPrompt,
          question: qPrompt,
          userAnswer: '(timeout)',
          correctAnswer,
          correct: false,
          time: timeTaken,
        },
      ])

      if (sessionGoal === 'perfect') {
        setFinished(true)
        timer.reset()
      }
    } catch (error) {
      console.error('handleTimeout error:', error)

      setResults(prev => [
        ...prev,
        {
          prompt: qPrompt,
          question: qPrompt,
          userAnswer: '(timeout)',
          correctAnswer: '—',
          correct: false,
          time: timeTaken,
        },
      ])
    }
  }

  // ─────── Load Question ──────────────────────────────────────────

  const loadQuestion = async () => {
    setLoading(true)
    setAnswer('')
    setFeedback('')
    setIsCorrect(null)
    setRevealed(false)

    try {
      const response = await fetch(
        `${API}/funceval-api/question?difficulty=${effectiveDiff()}&goal=${sessionGoal}`,
        {
          headers: {
            Authorization: authGetToken()
              ? `Bearer ${authGetToken()}`
              : '',
          },
        }
      )

      const data = await response.json()

      setQuestion(data)

      timer.start(
        sessionGoal,
        handleTimeout,
        getSpeedRunLimit(
          difficulty ?? 'easy',
          isAdaptive ?? false
        )
      )
    } catch (error) {
      console.error('loadQuestion error:', error)
      setFeedback('Failed to load question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─────── Start Quiz ─────────────────────────────────────────────

  const startQuiz = async () => {
    const count =
      numQuestions !== '' && Number(numQuestions) > 0
        ? Number(numQuestions)
        : DEFAULT_TOTAL

    setTotalQ(count)

    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    setResults([])

    setAdaptScore(0)
    adaptScoreRef.current = 0

    await loadQuestion()
  }

  // ─────── Submit Answer ──────────────────────────────────────────

  const handleSubmit = async () => {
    if (!question || revealed || !answer) return

    const timeTaken = timer.stop()

    try {
      const response = await fetch(
        `${API}/funceval-api/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authGetToken()
              ? `Bearer ${authGetToken()}`
              : '',
          },
          body: JSON.stringify({
            answer: question.answer,
            userAnswer: Number(answer),
            sessionGoal,
          }),
        }
      )

      const data = await response.json()

      setIsCorrect(data.correct)

      if (data.correct) {
        setScore(previousScore => previousScore + 1)
      }

      const varStr = Object.entries(question.vars)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')

      const coinsEarned =
        data.lil?.coinsEarned > 0
          ? ` (+${data.lil.coinsEarned} coins!)`
          : ''

      if (data.correct) {
        setFeedback(
          `Correct! f(${varStr}) = ${data.correctAnswer}`
            .slice(0, -1) +
          coinsEarned +
          `Correct! f(${varStr}) = ${data.correctAnswer}`
            .slice(-1)
        )
      } else if (sessionGoal === 'perfect') {
        setFeedback(
          `Incorrect. f(${varStr}) = ${data.correctAnswer} ❌ Perfect Solve ended.`
        )

        setFinished(true)
        timer.reset()
      } else {
        setFeedback(
          `Incorrect. f(${varStr}) = ${data.correctAnswer}`
        )
      }

      setResults(prev => [
        ...prev,
        {
          question: `${question.formula}, ${varStr}`,
          userAnswer: answer,
          correctAnswer: String(data.correctAnswer),
          correct: data.correct,
          time: timeTaken,
        },
      ])

      if (isAdaptive) {
        setAdaptScore(previousScore => {
          const nextScore = data.correct
            ? Math.min(3, previousScore + 0.25)
            : Math.max(0, previousScore - 0.35)

          adaptScoreRef.current = nextScore

          return nextScore
        })
      }

      setRevealed(true)
    } catch (error) {
      console.error('handleSubmit error:', error)

      setFeedback('Failed to submit answer. Please try again.')
    }
  }

  // ─────── Show Solution ──────────────────────────────────────────

  const handleSolve = async () => {
    if (!question || revealed) return

    timer.stop()

    const varStr = Object.entries(question.vars)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')

    setIsCorrect(false)
    setRevealed(true)

    setFeedback(
      `Solution: f(${varStr}) = ${question.answer}`
    )
  }

  // ─────── Advance Question ───────────────────────────────────────

  useEffect(() => {
    advanceFnRef.current = async () => {
      if (questionNumber >= totalQ) {
        setFinished(true)
        timer.reset()
        return
      }

      setQuestionNumber(number => number + 1)
      await loadQuestion()
    }
  })

  // ─────── Auto Advance ───────────────────────────────────────────

  useAutoAdvance(
    revealed,
    advanceFnRef,
    isCorrect
  )

  useEffect(() => {
    if (!revealed || isCorrect) return undefined

    const handleKeyDown = event => {
      if (event.key === 'Enter') {
        event.preventDefault()

        advanceFnRef.current?.()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [revealed, isCorrect, questionNumber])

  // ─────── Display Values ─────────────────────────────────────────

  const varStr = question
    ? Object.entries(question.vars)
        .map(([key, value]) => `${key} = ${value}`)
        .join(', ')
    : ''

  const diffLabels = {
    easy: 'Easy — f(x)',
    medium: 'Medium — f(x,y)',
    hard: 'Hard — f(x,y,z)',
    extrahard: 'Extra Hard — Nested',
  }

  const curAdaptLevel = adaptiveLevel(adaptScore)

  return (
    <QuizLayout
      title="Functions"
      subtitle="Evaluate the function at the given values"
      onBack={onBack}
      timer={
        started &&
        !finished &&
        sessionGoal !== 'perfect'
          ? timer
          : null
      }
      sessionGoal={sessionGoal}
    >
      {!started && !finished && (
        <div className="welcome-box">
          <p className="welcome-text">
            Evaluate linear functions
          </p>

          <KeyTerms topicKey="functions" />

          <div
            className="checkbox-group"
            style={{ marginBottom: '12px' }}
          >
            {[
              'easy',
              'medium',
              'hard',
              'extrahard',
            ].map(level => (
              <label
                key={level}
                className={`checkbox-pill${
                  !isAdaptive &&
                  difficulty === level
                    ? ' active'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="funceval-diff"
                  checked={
                    !isAdaptive &&
                    difficulty === level
                  }
                  onChange={() => {
                    setDifficulty(level)
                    setIsAdaptive(false)
                  }}
                />

                {diffLabels[level]}
              </label>
            ))}

            <label
              className={`checkbox-pill${
                isAdaptive ? ' active' : ''
              }`}
              style={
                isAdaptive
                  ? {
                      background:
                        'linear-gradient(135deg, #4caf50, #ff9800, #f44336, #9c27b0)',
                      color: '#fff',
                      border: 'none',
                    }
                  : {}
              }
            >
              <input
                type="radio"
                name="funceval-diff"
                checked={isAdaptive}
                onChange={() =>
                  setIsAdaptive(true)
                }
              />

              Adaptive
            </label>
          </div>

          {isGoalMode && (
            <>
              <p
                className="welcome-text"
                style={{
                  marginTop: '14px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                }}
              >
                Practice Goal:
              </p>

              <div
                className="checkbox-group"
                style={{ marginBottom: '12px' }}
              >
                {[
                  {
                    key: 'speed',
                    label: '⚡ Speed Run',
                  },
                  {
                    key: 'perfect',
                    label: '🎯 Perfect Solve',
                  },
                  {
                    key: 'revision',
                    label: '🔄 Revision',
                  },
                ].map(goal => (
                  <label
                    key={goal.key}
                    className={`checkbox-pill${
                      sessionGoal === goal.key
                        ? ' active'
                        : ''
                    }`}
                    style={
                      sessionGoal === goal.key
                        ? goal.key === 'speed'
                          ? {
                              background:
                                'rgba(255,179,0,0.18)',
                              borderColor: '#ffb300',
                              color: '#ffb300',
                            }
                          : goal.key === 'perfect'
                            ? {
                                background:
                                  'rgba(244,67,54,0.18)',
                                borderColor: '#f44336',
                                color: '#f44336',
                              }
                            : {
                                background:
                                  'rgba(33,150,243,0.18)',
                                borderColor: '#2196f3',
                                color: '#2196f3',
                              }
                        : {}
                    }
                  >
                    <input
                      type="radio"
                      name="funcevalapp-goal"
                      checked={
                        sessionGoal === goal.key
                      }
                      onChange={() =>
                        setSessionGoal(goal.key)
                      }
                    />

                    {goal.label}
                  </label>
                ))}
              </div>

              {isAdaptive && (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--clr-dim)',
                    marginBottom: '8px',
                  }}
                >
                  Starts easy and smoothly adjusts to
                  your level as you answer.
                </p>
              )}

              {sessionGoal === 'speed' && (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#ffb300',
                    marginBottom: '8px',
                  }}
                >
                  ⚡ Easy 5s · Medium 10s · Hard 15s ·
                  Extra Hard 20s · Adaptive 10s.
                  Double coins for correct!
                </p>
              )}

              {sessionGoal === 'perfect' && (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#f44336',
                    marginBottom: '8px',
                  }}
                >
                  🎯 One wrong answer ends the quiz.
                  No timer shown. Can you go flawless?
                </p>
              )}

              {sessionGoal === 'revision' && (
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#2196f3',
                    marginBottom: '8px',
                  }}
                >
                  🔄 Focuses on topics you previously
                  answered incorrectly.
                </p>
              )}
            </>
          )}

          <div className="question-count-row">
            <label className="question-count-label">
              How many questions? (max 100)
            </label>

            <input
              className="answer-input question-count-input"
              type="text"
              value={numQuestions}
              onChange={event => {
                const value = event.target.value

                if (
                  value === '' ||
                  (
                    /^\d+$/.test(value) &&
                    Number(value) <= 100
                  )
                ) {
                  setNumQuestions(value)
                }
              }}
            />
          </div>

          <div className="button-row">
            <button onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {started && !finished && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '0.3rem',
            }}
          >
            <div className="progress-pill center">
              Question {questionNumber}/{totalQ}
            </div>

            {isAdaptive && (
              <div
                className="progress-pill"
                style={{
                  background:
                    ADAPT_COLORS[curAdaptLevel],
                  color: '#fff',
                }}
              >
                {ADAPT_LABELS[curAdaptLevel]}
              </div>
            )}
          </div>

          {isAdaptive && (
            <DifficultySlider
              pct={adaptivePct(adaptScore)}
              onChange={percentage => {
                const value =
                  (percentage / 100) * 3

                setAdaptScore(value)
                adaptScoreRef.current = value
              }}
            />
          )}

          {question && (
            <>
              <div className="question-box">
                <div>{question.formula}</div>

                <div className="given">
                  Given: {varStr}
                </div>
              </div>

              <div className="single-input-row">
                <input
                  className="answer-input"
                  type="text"
                  value={answer}
                  disabled={revealed}
                  onChange={event => {
                    const value = event.target.value

                    if (
                      value === '' ||
                      value === '-' ||
                      value === '.' ||
                      /^-?\d*\.?\d*$/.test(value)
                    ) {
                      setAnswer(value)
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      handleSubmit()
                    }
                  }}
                  autoFocus
                />
              </div>

              <NumPad
                value={answer}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                disabled={revealed}
              />
            </>
          )}

          {renderFeedback(feedback, isCorrect)}

          <div className="button-row">
            {!revealed && (
              <button
                onClick={handleSolve}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border:
                    '1px solid var(--clr-accent)',
                  color: 'var(--clr-accent)',
                }}
              >
                Solve
              </button>
            )}

            <button
              onClick={
                revealed
                  ? () => advanceFnRef.current?.()
                  : handleSubmit
              }
              disabled={
                loading ||
                (!revealed && !answer)
              }
            >
              {revealed
                ? questionNumber >= totalQ
                  ? 'Finish'
                  : 'Next'
                : 'Submit'}
            </button>
          </div>

          {results.length > 0 && (
            <ResultsTable results={results} />
          )}
        </>
      )}

      {finished && (
        <div className="welcome-box">
          <p className="welcome-text">
            Quiz complete!
          </p>

          <p className="final-score">
            Final score: {score}/{totalQ}
          </p>

          {isAdaptive && (
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--clr-dim)',
              }}
            >
              Reached level:{' '}
              <strong
                style={{
                  color:
                    ADAPT_COLORS[curAdaptLevel],
                }}
              >
                {ADAPT_LABELS[curAdaptLevel]}
              </strong>
            </p>
          )}

          <ResultsTable results={results} />

          <button
            onClick={() => {
              setStarted(false)
              setFinished(false)
            }}
          >
            Play Again
          </button>
        </div>
      )}

      <HintModal
        concept="funceval"
        questionId={question?.id || 'unknown'}
        questionData={question}
        revealed={revealed}
        hintsUsedCount={hintsUsedCount}
        xpBreakdown={xpBreakdown}
        bonusLoading={bonusLoading}
      />
    </QuizLayout>
  )
}

export default FuncEvalApp
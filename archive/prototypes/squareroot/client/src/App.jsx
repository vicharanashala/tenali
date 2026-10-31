/**
 * ARYABHATA SQUARE ROOT DRILL - REACT COMPONENT
 *
 * Main component for the Square Root drill module in the Tenali project.
 * This is a standalone/legacy version that provides continuous square root estimation practice.
 *
 * Features:
 * - Continuous drill mode: Questions keep coming until user stops
 * - Progressive difficulty: Numbers get larger as user completes more questions
 * - Flexible answers: Both floor and ceiling of square root are accepted
 * - Running score: Tracks correct answers throughout session
 * - No question limit: User controls when to stop
 *
 * State Management:
 * - started: Whether drill has begun
 * - question: Current square root problem from server
 * - answer: User's numeric input for current question
 * - score: Number of correct answers so far (no limit)
 * - questionNumber: Current question position (used for difficulty scaling)
 * - feedback: Correct/incorrect message with explanation
 * - loading: Whether fetching from server
 * - revealed: Whether answer feedback has been shown
 */

import { useState } from 'react'
import './App.css'

/**
 * Main App component for the Square Root drill
 * Manages all quiz state and orchestrates the drill flow
 */
function App() {
  // State: Drill has started flag
  const [started, setStarted] = useState(false)
  // State: Current square root problem from API (contains q, floorAnswer, ceilAnswer, etc.)
  const [question, setQuestion] = useState(null)
  // State: User's typed answer in the input field
  const [answer, setAnswer] = useState('')
  // State: Running count of correct answers (no limit, drill is continuous)
  const [score, setScore] = useState(0)
  // State: Current question number (used to determine difficulty, affects step count)
  const [questionNumber, setQuestionNumber] = useState(0)
  // State: Feedback message displayed after submitting
  const [feedback, setFeedback] = useState('')
  // State: Loading indicator while fetching from server
  const [loading, setLoading] = useState(false)
  // State: Answer feedback has been revealed (prevents changing answer)
  const [revealed, setRevealed] = useState(false)

  /**
   * Fetch a new square root problem from the server
   * Difficulty increases based on the step number (question count)
   *
   * @param {number} nextStep - Current step/question number (determines difficulty band)
   */
  const fetchQuestion = async (nextStep) => {
    setLoading(true)
    setAnswer('')      // Clear previous answer
    setFeedback('')     // Clear feedback from previous question
    setRevealed(false)  // Hide feedback
    const res = await fetch(`/api/question?step=${nextStep}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
  }

  /**
   * Initialize and start a new drill session
   * Resets score and question counter, fetches first problem
   */
  const startQuiz = async () => {
    setStarted(true)
    setScore(0)
    setQuestionNumber(1)
    await fetchQuestion(1)
  }

  /**
   * Handle both answer submission and question advancement
   * This function handles two phases:
   *
   * Phase 1 (Submit): User has entered answer, click "Submit"
   * - POST answer to /api/check endpoint
   * - Update score if correct
   * - Show feedback with the actual square root value
   * - Mark as revealed to disable further answer changes
   * - Button text changes to "Next Question"
   *
   * Phase 2 (Next): User has seen feedback, click "Next Question"
   * - Increment step (used for difficulty scaling)
   * - Fetch next question
   */
  const handleSubmitOrNext = async () => {
    if (!question) return

    // PHASE 1: Submit answer
    if (!revealed) {
      if (answer === '') return  // Guard: skip if no answer entered
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: question.q, answer: Number(answer) }),
      })
      const data = await res.json()
      // Increment score only if correct
      if (data.correct) setScore((s) => s + 1)
      // Format feedback message with the actual square root and acceptable answers
      setFeedback(
        data.correct
          ? `Correct ✅ √${question.q} ≈ ${data.sqrtRounded}`
          : `Incorrect. √${question.q} ≈ ${data.sqrtRounded}, so acceptable answers are ${data.floorAnswer} or ${data.ceilAnswer}.`
      )
      setRevealed(true)  // Prevent answer changes after submission
      return
    }

    // PHASE 2: Advance to next question
    const nextNum = questionNumber + 1
    setQuestionNumber(nextNum)
    // Fetch next question with updated step for progressive difficulty
    await fetchQuestion(nextNum)
  }

  // ========== RENDER ==========
  return (
    <div className="app-shell">
      <div className="card">
        {/* Header: Question number and running score */}
        <div className="top-row">
          {/* Shows "Question X" during drill or "Continuous quiz" before start
              Note: No total question count since this is a continuous drill */}
          <div className="progress-pill">{started ? `Question ${questionNumber}` : 'Continuous quiz'}</div>
          {/* Always shows current score (no cap, accumulates as long as user continues) */}
          <div className="score-pill">Score: {score}</div>
        </div>

        {/* Quiz title and instructions */}
        <h1>Aryabhata Square Root</h1>
        <p className="subtitle">Give the nearest integer answer. Floor or ceiling is accepted.</p>

        {/* Welcome/Start screen - shown before drill begins */}
        {!started && (
          <div className="welcome-box">
            <p className="welcome-text">The square-root drill will keep going until you stop.</p>
            <button onClick={startQuiz}>Start Drill</button>
          </div>
        )}

        {/* Active drill screen - shown while answering questions */}
        {started && (
          <>
            {/* Question display area - shows "Loading..." or the square root problem */}
            <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>

            {/* Answer input field - numeric keyboard on mobile, disabled while feedback is shown */}
            <input
              className="answer-input"
              type="number"
              inputMode="numeric"
              placeholder="Type your answer"
              value={answer}
              onChange={(e) => !revealed && setAnswer(e.target.value)}
              disabled={revealed}  // Prevent changing answer after submission
            />

            {/* Feedback message - appears after submission with explanation */}
            {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>{feedback}</div>}

            {/* Submit or Next button - changes text based on revealed state */}
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

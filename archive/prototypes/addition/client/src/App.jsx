/**
 * ARYABHATA ADDITION QUIZ - REACT COMPONENT
 *
 * Main component for the Addition quiz module in the Tenali project.
 * This is a standalone/legacy version that provides an interactive addition practice interface.
 *
 * Features:
 * - Three difficulty levels: 1-digit, 2-digit, 3-digit numbers
 * - 20-question quiz with immediate feedback
 * - Score tracking and progress display
 * - Start/restart functionality
 *
 * State Management:
 * - digits: Selected difficulty level (1, 2, or 3)
 * - started: Whether quiz has begun
 * - finished: Whether all 20 questions are complete
 * - question: Current question object from server
 * - answer: User's input for current question
 * - score: Number of correct answers so far
 * - questionNumber: Current question position (1-20)
 * - feedback: Correct/incorrect message for last question
 * - loading: Whether fetching from server
 */

import { useState } from 'react'
import './App.css'

// Quiz configuration: total number of questions before completion
const TOTAL_QUESTIONS = 20

/**
 * Main App component for the Addition quiz
 * Manages all quiz state and orchestrates the quiz flow
 */
function App() {
  // State: Selected difficulty level (1 = single-digit, 2 = double-digit, 3 = triple-digit)
  const [digits, setDigits] = useState(1)
  // State: Quiz has started flag
  const [started, setStarted] = useState(false)
  // State: All 20 questions answered flag
  const [finished, setFinished] = useState(false)
  // State: Current question object from API (contains a, b, prompt, answer, etc.)
  const [question, setQuestion] = useState(null)
  // State: User's typed answer in the input field
  const [answer, setAnswer] = useState('')
  // State: Running count of correct answers (0-20)
  const [score, setScore] = useState(0)
  // State: Current question number (1-20)
  const [questionNumber, setQuestionNumber] = useState(0)
  // State: Feedback message displayed after submitting ("Correct" or "Incorrect. Right answer: X")
  const [feedback, setFeedback] = useState('')
  // State: Loading indicator while fetching from server
  const [loading, setLoading] = useState(false)

  /**
   * Fetch a new addition question from the server
   * Clears previous feedback and resets the input field
   *
   * @param {number} selectedDigits - Difficulty level (1, 2, or 3). Defaults to current selection.
   */
  const fetchQuestion = async (selectedDigits = digits) => {
    setLoading(true)
    setFeedback('')
    setAnswer('')
    const res = await fetch(`/api/question?digits=${selectedDigits}`)
    const data = await res.json()
    setQuestion(data)
    setLoading(false)
  }

  /**
   * Initialize and start a new quiz
   * Resets all quiz state and fetches the first question
   */
  const startQuiz = async () => {
    setStarted(true)
    setFinished(false)
    setScore(0)
    setQuestionNumber(1)
    await fetchQuestion(digits)
  }

  /**
   * Submit user's answer for validation
   * Sends to server, receives feedback, and automatically loads next question after delay
   * Flow: Submit -> Feedback display -> Auto-advance to next question (or finish quiz)
   *
   * Logic:
   * 1. Guard: Skip if no question or empty answer
   * 2. POST answer to /api/check endpoint
   * 3. Update score if correct
   * 4. Display feedback message
   * 5. After 700ms delay:
   *    - If question 20 complete: mark finished
   *    - Otherwise: fetch next question
   */
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
    // Show "Correct" or "Incorrect. Right answer: X" message
    setFeedback(data.correct ? 'Correct' : `Incorrect. Right answer: ${data.correctAnswer}`)

    // 700ms delay allows user to see feedback before moving on
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

  /**
   * Restart the quiz from scratch
   * Wrapper around startQuiz for the "Play Again" button
   */
  const playAgain = async () => {
    await startQuiz()
  }

  // ========== RENDER ==========
  return (
    <div className="app-shell">
      <div className="card">
        {/* Header: Progress indicator and running score */}
        <div className="top-row">
          {/* Shows "Question X/20" during quiz or "Quiz: 20 questions" before/after */}
          <div className="progress-pill">{started && !finished ? `Question ${questionNumber}/${TOTAL_QUESTIONS}` : `Quiz: ${TOTAL_QUESTIONS} questions`}</div>
          {/* Always shows current score */}
          <div className="score-pill">Score: {score}</div>
        </div>

        {/* Quiz title and instructions */}
        <h1>Aryabhata Addition</h1>
        <p className="subtitle">Choose a level and solve 20 addition questions</p>

        {/* Difficulty level selector: Three radio buttons (1-digit, 2-digit, 3-digit)
            Disabled once quiz starts to prevent mid-quiz difficulty changes */}
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

        {/* Welcome/Start screen - shown before quiz begins */}
        {!started && !finished && (
          <div className="welcome-box">
            <p className="welcome-text">The quiz is ready to begin.</p>
            <button onClick={startQuiz}>Start Quiz</button>
          </div>
        )}

        {/* Active quiz screen - shown while questions are being answered */}
        {started && !finished && (
          <>
            {/* Question display area - shows "Loading..." or the actual problem */}
            <div className="question-box">{loading || !question ? 'Loading question…' : `${question.prompt} = ?`}</div>

            {/* Answer input field - numeric keyboard on mobile, disabled while loading */}
            <input
              className="answer-input"
              type="number"
              inputMode="numeric"
              placeholder="Type your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            {/* Submit button - disabled if no answer or still loading */}
            <div className="button-row">
              <button onClick={submitAnswer} disabled={answer === '' || loading}>Submit</button>
            </div>

            {/* Feedback message - appears after submission */}
            {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>{feedback}</div>}
          </>
        )}

        {/* Results/Finish screen - shown after all 20 questions answered */}
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

/**
 * CHITRAGUPTA QUIZ - REACT COMPONENT
 *
 * Main component for the Chitragupta (General Knowledge) quiz module in the Tenali project.
 * This is a standalone/legacy version that provides a multiple-choice quiz interface.
 *
 * Features:
 * - Random multiple-choice questions (A/B/C/D format)
 * - 10-question quiz with reveal-before-advance pattern
 * - Score tracking and progress display
 * - Question answer reveal with explanation
 *
 * Answer Flow:
 * 1. User selects an answer (question still shows, submit button enabled)
 * 2. User clicks Submit
 * 3. Feedback revealed: "Correct!" or "Wrong. Correct answer: X) ..."
 * 4. Submit button changes to "Next Question"
 * 5. Click Next to continue to next question
 *
 * State Management:
 * - started: Whether quiz has begun
 * - question: Current question object from server
 * - selected: User's selected answer option ('A'/'B'/'C'/'D')
 * - loading: Whether fetching from server
 * - score: Number of correct answers so far
 * - questionNumber: Current question position (1-10)
 * - finished: Whether all 10 questions are complete
 * - revealed: Whether answer feedback has been shown (prevents re-answering)
 * - feedback: Correct/incorrect message with explanation
 * - isCorrect: Boolean tracking correctness of last answer
 */

import { useState } from 'react'
import './App.css'

// Quiz configuration: total number of questions before completion
const TOTAL_QUESTIONS = 10

/**
 * Main App component for the Chitragupta quiz
 * Manages all quiz state and orchestrates the quiz flow
 */
function App() {
  // State: Quiz has started flag
  const [started, setStarted] = useState(false)
  // State: Current question object from API (contains question, options, id, etc.)
  const [question, setQuestion] = useState(null)
  // State: User's selected answer ('A', 'B', 'C', or 'D')
  const [selected, setSelected] = useState('')
  // State: Loading indicator while fetching from server
  const [loading, setLoading] = useState(false)
  // State: Running count of correct answers (0-10)
  const [score, setScore] = useState(0)
  // State: Current question number (1-10)
  const [questionNumber, setQuestionNumber] = useState(0)
  // State: All 10 questions answered flag
  const [finished, setFinished] = useState(false)
  // State: Answer feedback has been revealed (prevents changing answer)
  const [revealed, setRevealed] = useState(false)
  // State: Feedback message displayed after submitting (e.g., "Correct! A) ..." or "Wrong. Correct answer: B) ...")
  const [feedback, setFeedback] = useState('')
  // State: Whether the last submitted answer was correct (null before submit, true/false after)
  const [isCorrect, setIsCorrect] = useState(null)

  /**
   * Fetch a new multiple-choice question from the server
   * Resets the answer state to allow user to answer the new question
   * Questions are random and may repeat (no tracking of previously shown)
   */
  const loadQuestion = async () => {
    setLoading(true)
    setSelected('')      // Clear previous selection
    setRevealed(false)    // Hide feedback from previous question
    setFeedback('')       // Clear feedback message
    setIsCorrect(null)    // Reset correctness indicator
    const res = await fetch('/api/question')
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
    await loadQuestion()
  }

  /**
   * Handle both answer submission and question advancement
   * This function handles two phases:
   *
   * Phase 1 (Submit): User has selected answer, click "Submit"
   * - POST answer to /api/check endpoint
   * - Update score if correct
   * - Show feedback (Correct! or Wrong. Correct answer: X)
   * - Mark as revealed to disable further answer changes
   * - Button text changes to "Next Question"
   *
   * Phase 2 (Next/Finish): User has seen feedback, click "Next Question" or "Finish Quiz"
   * - If question 10 complete: mark finished
   * - Otherwise: fetch next question
   */
  const handleSubmitOrNext = async () => {
    if (!question) return

    // PHASE 1: Submit answer
    if (!revealed) {
      if (!selected) return  // Guard: skip if no answer selected
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, answerOption: selected }),
      })
      const data = await res.json()
      // Increment score if correct
      const nextScore = score + (data.correct ? 1 : 0)
      setScore(nextScore)
      setIsCorrect(data.correct)
      // Format feedback message: "Correct! A) Answer text" or "Wrong. Correct answer: B) Answer text"
      setFeedback(
        data.correct
          ? `Correct! ${data.correctAnswer}) ${data.correctAnswerText}`
          : `Wrong. Correct answer: ${data.correctAnswer}) ${data.correctAnswerText}`
      )
      setRevealed(true)  // Prevent answer changes after submission
      return
    }

    // PHASE 2: Advance to next question
    if (questionNumber >= TOTAL_QUESTIONS) {
      // All 10 questions answered
      setFinished(true)
      setQuestion(null)
      return
    }

    // Load next question
    setQuestionNumber((n) => n + 1)
    await loadQuestion()
  }

  // ========== RENDER ==========
  return (
    <div className="app-shell">
      <div className="card">
        {/* Header: Progress indicator and running score */}
        <div className="top-bar">
          {/* Shows "Question X/10" during quiz or "Quiz: 10 questions" before/after */}
          <div className="progress-pill">
            {started && !finished ? `Question ${questionNumber}/${TOTAL_QUESTIONS}` : `Quiz: ${TOTAL_QUESTIONS} questions`}
          </div>
          {/* Always shows current score */}
          <div className="score-pill">Score: {score}</div>
        </div>

        {/* Quiz title and instructions */}
        <h1>Chitragupta</h1>
        <p className="subtitle">Random question quiz</p>

        {/* Welcome/Start screen - shown before quiz begins */}
        {!started && !finished && (
          <div className="welcome-box">
            <p className="welcome-text">Welcome! The quiz is going to start.</p>
            <button onClick={startQuiz}>Start Quiz</button>
          </div>
        )}

        {/* Active quiz screen - shown while questions are being answered */}
        {started && !finished && (
          <>
            {/* Question text - shows "Loading..." or the actual question */}
            <div className="question-box">
              {loading || !question ? 'Loading question…' : question.question}
            </div>

            {/* Options: Render 4 multiple-choice answers as radio buttons */}
            {question && (
              <div className="options-list">
                {question.options.map((option, idx) => {
                  // Map array index (0-3) to option letter (A-D)
                  const optionLetter = ['A', 'B', 'C', 'D'][idx]
                  return (
                    <label
                      key={optionLetter}
                      className={`option-card ${selected === optionLetter ? 'selected' : ''} ${revealed && question && optionLetter === selected ? 'answered' : ''}`}
                    >
                      {/* Hidden radio input */}
                      <input
                        type="radio"
                        name="answer"
                        value={optionLetter}
                        checked={selected === optionLetter}
                        onChange={() => !revealed && setSelected(optionLetter)}
                        disabled={revealed}  // Prevent changing answer after submission
                      />
                      {/* Visible option text: "A) Option text" */}
                      <span><strong>{optionLetter})</strong> {option}</span>
                    </label>
                  )
                })}
              </div>
            )}

            {/* Feedback message - appears after submission */}
            {feedback && <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>{feedback}</div>}

            {/* Submit or Next button - changes text based on revealed state */}
            <div className="button-row">
              <button onClick={handleSubmitOrNext} disabled={loading || (!revealed && !selected)}>
                {revealed ? (questionNumber >= TOTAL_QUESTIONS ? 'Finish Quiz' : 'Next Question') : 'Submit'}
              </button>
            </div>
          </>
        )}

        {/* Results/Finish screen - shown after all 10 questions answered */}
        {finished && (
          <div className="welcome-box">
            <p className="welcome-text">Quiz complete.</p>
            <p className="final-score">Final score: {score}/{TOTAL_QUESTIONS}</p>
            <button onClick={startQuiz}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

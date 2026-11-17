import { useEffect } from 'react'

/**
 * useAutoAdvance Hook
 * Auto-advances to the next question after correct answer is revealed.
 * Only triggers if revealed=true AND isCorrect=true.
 * Calls advanceFnRef.current() after AUTO_ADVANCE_MS delay.
 *
 * @param {boolean} revealed - Whether the answer feedback is shown
 * @param {React.MutableRefObject<Function>} advanceFnRef - Ref to the advance function
 * @param {boolean} isCorrect - Whether the user's answer was correct
 */
export function useAutoAdvance(revealed, advanceFnRef, isCorrect) {
  useEffect(() => {
    // Disabled auto-advance so user has to click "Next Question" manually.
    return;
  }, [revealed, isCorrect])
}

/**
 * renderFeedback — Renders feedback text. For solve feedback, renders a
 * structured card with highlighted answer and formatted explanation.
 * For normal correct/wrong feedback, renders inline text.
 */
export function renderFeedback(feedback, isCorrect) {
  if (!feedback) return null
  const isSolve = isCorrect === false && feedback.startsWith('Solution:')
  if (!isSolve) {
    return (
      <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span>{feedback}</span>
      </div>
    )
  }
  // Parse solve feedback: "Solution: ANSWER\nExplanation..."
  const lines = feedback.split('\n')
  const answerLine = lines[0].replace('Solution: ', '').trim()
  const rawExplanation = lines.slice(1).filter(l => l.trim()).map(l => l.trim())

  // Group lines into steps: lines starting with a keyword or number are step headers
  const steps = []
  for (const line of rawExplanation) {
    // Detect step boundaries: numbered lines, "Step N:", "Answer:", "So,", "Therefore", etc.
    const isStepStart = /^(\d+[\.\):]|Step\s|Answer:|So[, ]|Therefore|Result:|Formula:|First|Next|Then|Finally|Multiply|Divide|Add|Subtract|Convert|Simplify|Calculate|Apply|Using|Problem:)/i.test(line)
    if (isStepStart || steps.length === 0) {
      steps.push(line)
    } else {
      // Append to previous step
      steps[steps.length - 1] += '\n' + line
    }
  }

  return (
    <div className="feedback solve">
      <div className="solve-answer-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span>{answerLine}</span>
      </div>
      {steps.length > 0 && (
        <div className="solve-timeline">
          {steps.map((step, i) => (
            <div key={i} className="solve-step">
              <div className="solve-step-marker">
                <div className="solve-step-dot" />
                {i < steps.length - 1 && <div className="solve-step-line" />}
              </div>
              <div className="solve-step-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}>
                <span>{step}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

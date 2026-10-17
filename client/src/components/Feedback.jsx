//renderFeedback
function Feedback({ feedback, isCorrect }) {
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
        const isStepStart = /^(\d+[.):]|Step\s|Answer:|So[, ]|Therefore|Result:|Formula:|First|Next|Then|Finally|Multiply|Divide|Add|Subtract|Convert|Simplify|Calculate|Apply|Using|Problem:)/i.test(line)
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
export default Feedback

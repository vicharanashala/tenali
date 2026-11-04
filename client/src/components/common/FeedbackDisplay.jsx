//renderFeedback

import { useMemo } from 'react';

const STEP_START_REGEX = /^(\d+[.):]|Step\s|Answer:|So[, ]|Therefore|Result:|Formula:|First|Next|Then|Finally|Multiply|Divide|Add|Subtract|Convert|Simplify|Calculate|Apply|Using|Problem:)/i;

export default function FeedbackDisplay({ feedback, isCorrect }) {
    const isSolve = isCorrect === false && feedback.startsWith('Solution:');

    const { answerLine, steps } = useMemo(() => {
        if (!isSolve) return { answerLine: '', steps: [] };

        const lines = feedback.split('\n');
        const answer = lines[0].replace('Solution: ', '').trim();
        const rawExplanation = lines.slice(1).filter(l => l.trim()).map(l => l.trim());

        const parsedSteps = [];
        for (const line of rawExplanation) {
            if (STEP_START_REGEX.test(line) || parsedSteps.length === 0) {
                parsedSteps.push(line);
            } else {
                parsedSteps[parsedSteps.length - 1] += '\n' + line;
            }
        }

        return { answerLine: answer, steps: parsedSteps };
        }, 
        [feedback, isSolve]
    );

    if (!feedback) return null;

    if (!isSolve) {
        return (
        <div 
            className={`feedback ${isCorrect ? 'correct' : 'wrong'}`} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
            <span>{feedback}</span>
        </div>
        );
    }

    return (
        <div className="feedback solve">
        <div 
            className="solve-answer-badge" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
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
                <div 
                    className="solve-step-content" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}
                >
                    <span>{step}</span>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
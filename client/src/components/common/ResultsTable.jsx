import { useEffect, useRef } from 'react';

function ResultsTable({ results }) {
    const processedRef = useRef(false);
    useEffect(() => {
        if (processedRef.current) return;
        if (results && results.length > 0) {
        processedRef.current = true;
        const correctCount = results.filter(r => r.correct).length;
        if (correctCount > 0 && typeof window.tenaliIncrementSolved === 'function') {
            window.tenaliIncrementSolved(correctCount);
        }
        }
    }, [results]);

    // Hide table if empty or null
    if (!results || results.length === 0) return null
    const totalTime = results.reduce((sum, r) => sum + r.time, 0)
    const avgTime = (totalTime / results.length).toFixed(1)
    const hasCarries = results.some(r => r.userCarries || r.correctCarries)
    return (
        <div className="results-table-wrapper">
        <table className="results-table">
            <thead>
            <tr>
                <th>#</th>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Result</th>
                {hasCarries && <th>Carries</th>}
                <th>Time</th>
            </tr>
            </thead>
            <tbody>
            {results.map((r, i) => (
                <tr key={i} className={r.correct ? 'row-correct' : 'row-wrong'}>
                <td>{i + 1}</td>
                <td>{r.question || r.prompt || `Question ${i + 1}`}</td>
                <td>{r.userAnswer || '-'}</td>
                <td>{r.correct ? `✓ (${r.correctAnswer || r.display || ''})` : `✗ (${r.correctAnswer || r.display || 'Ans'})`}</td>
                {hasCarries && (
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                    {r.userCarries && <span>Yours: {r.userCarries}</span>}
                    {r.userCarries && r.correctCarries && <br />}
                    {r.correctCarries && <span style={{ color: 'var(--clr-correct)' }}>Ans: {r.correctCarries}</span>}
                    </td>
                )}
                <td>{r.time}s</td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className="results-summary">
            Total time: {totalTime}s &middot; Average: {avgTime}s per question
        </div>
        </div>
    )
}

export default ResultsTable

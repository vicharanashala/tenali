import { useEffect, useState } from 'react';
import journeyFetch from '../../utils/journeyFetch';
import Confetti from '../modals/Confetti';

function LJCheckpointQuizView({ topicId, onBack }) {
    const [quiz, setQuiz] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    
    useEffect(() => {
        let isMounted = true;
        const abort = new AbortController();

        const loadQuiz = async () => {
            try {
                const res = await journeyFetch(`/api/learning-journey/checkpoint/quiz?topicId=${topicId}`, { signal: abort.signal });
                if (!isMounted) return;
                setQuiz(res);
                setError('');
                setAnswers({});
                setResult(null);
                setCurrentIdx(0);
            } catch (err) {
                if (err.name === 'AbortError') return;
                if (isMounted) {
                    setError(err.message || 'Failed to load progress');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        void loadQuiz();

        return () => {
            isMounted = false;
            abort.abort();
            
        }
    }, [reloadKey, topicId]);


    const handleSelectAnswer = (ansVal) => {
        const qId = quiz.questions[currentIdx].id;
        setAnswers(prev => ({ ...prev, [qId]: ansVal }));
    };

    const handleSubmit = async () => {
        try {
        setSubmitting(true);
        const res = await journeyFetch('/api/learning-journey/checkpoint/verify', {
            method: 'POST',
            body: JSON.stringify({ topicId, answers })
        });
        setResult(res);
        } catch (err) {
        alert(err.message || 'Verification failed');
        } finally {
        setSubmitting(false);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError('');
        setReloadKey(k => k + 1);
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}><p>Generating your checkpoint questions...</p></div>;
    if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}><p>{error}</p><button onClick={handleRetry} className="submit-btn" style={{ width: 'auto' }}>Retry</button></div>;
    if (!quiz) return null;

    const displayName = topicId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Show grading results screen
    if (result) {
        return (
        <div style={{ padding: '16px' }}>
            {result.passed && <Confetti />}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: result.passed ? 'var(--clr-correct, #26de81)' : 'var(--clr-wrong, #eb5e55)' }}>
                {result.passed ? '🎉 Checkpoint Passed!' : "Oh no, it's okay"}
            </h2>
            <h1 style={{ margin: '8px 0', fontSize: '3rem' }}>{result.scorePercent}%</h1>
            <p className="subtitle">
                Answered {result.correctCount} of {result.totalQuestions} questions correctly.
            </p>
            {!result.passed && (
                <div style={{
                marginTop: '16px',
                padding: '12px 20px',
                borderRadius: '8px',
                background: 'var(--clr-wrong-light, rgba(235, 94, 85, 0.1))',
                border: '1px solid var(--clr-wrong, #eb5e55)',
                color: 'var(--clr-text)',
                display: 'inline-block',
                fontSize: '0.95rem',
                maxWidth: '450px',
                lineHeight: '1.5'
                }}>
                💡 <strong>Revise back old concepts and try again.</strong> You need 80% (12/15) to pass.
                </div>
            )}
            {result.passed && (
                <p className="subtitle" style={{ color: 'var(--clr-correct, #26de81)', marginTop: '8px' }}>
                The next topic has been unlocked.
                </p>
            )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            {result.passed ? (
                <button onClick={onBack} className="submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
                Continue Journey
                </button>
            ) : (
                <>
                <button onClick={handleRetry} className="submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
                    Retry Checkpoint
                </button>
                <button onClick={onBack} className="submit-btn" style={{ width: 'auto', padding: '10px 24px', background: 'transparent', color: 'var(--clr-text)', border: '1px solid var(--clr-border)' }}>
                    Back to Concepts
                </button>
                </>
            )}
            </div>

            <h3 style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '8px', marginBottom: '16px' }}>Review Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.results.map((q, idx) => (
                <div
                key={q.id}
                style={{
                    background: 'var(--clr-surface, #1c1c1f)',
                    border: '1px solid ' + (q.isCorrect ? 'var(--clr-correct, #26de81)' : 'red'),
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                >
                <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--clr-accent)', fontWeight: 'bold' }}>Q{idx + 1}</span>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>{q.prompt}</p>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem', display: 'flex', gap: '20px' }}>
                    <span>Your answer: <strong style={{ color: q.isCorrect ? 'var(--clr-correct)' : 'red' }}>{q.userAnswer || '(blank)'}</strong></span>
                    {!q.isCorrect && <span>Correct answer: <strong style={{ color: 'var(--clr-correct)' }}>{q.correctAnswer}</strong></span>}
                    </div>
                </div>
                <div style={{ fontSize: '1.5rem', color: q.isCorrect ? 'var(--clr-correct)' : 'red' }}>
                    {q.isCorrect ? '✓' : '✗'}
                </div>
                </div>
            ))}
            </div>
        </div>
        );
    }

    const currentQ = quiz.questions[currentIdx];
    const currentAnswerVal = answers[currentQ.id] || '';

    return (
        <div style={{ padding: '16px' }}>
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button className="back-button" onClick={onBack}>← Quit Checkpoint</button>
            <span style={{ fontSize: '0.95rem', color: 'orange', fontWeight: 'bold' }}>🏁 {displayName} Checkpoint</span>
        </div>

        {/* Progress display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
            {quiz.questions.map((_, idx) => {
            let dotColor = 'var(--clr-border, #444)';
            if (idx === currentIdx) dotColor = 'orange';
            else if (answers[quiz.questions[idx].id] !== undefined) dotColor = 'var(--clr-accent, #feb47b)';

            return (
                <div
                key={idx}
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: dotColor,
                    transition: 'background 0.2s'
                }}
                />
            );
            })}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Question {currentIdx + 1} of 15
            </span>
            <h2 style={{ marginTop: '8px', minHeight: '60px' }}>{currentQ.prompt}</h2>
        </div>

        <div style={{ maxWidth: '360px', margin: '0 auto 32px auto' }}>
            <input
            type="text"
            value={currentAnswerVal}
            onChange={(e) => handleSelectAnswer(e.target.value)}
            placeholder="Type your answer here..."
            autoFocus
            style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1.2rem',
                textAlign: 'center',
                background: 'var(--clr-surface, #1c1c1f)',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                color: 'var(--clr-text)',
                outline: 'none',
                fontFamily: 'monospace'
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                if (currentIdx < 14) setCurrentIdx(currentIdx + 1);
                else handleSubmit();
                }
            }}
            />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '360px', margin: '0 auto' }}>
            <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="back-button"
            style={{ padding: '10px 20px', border: '1px solid var(--clr-border)', borderRadius: '6px', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
            >
            ← Prev
            </button>

            {currentIdx < 14 ? (
            <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="submit-btn"
                style={{ width: 'auto', padding: '10px 24px' }}
            >
                Next →
            </button>
            ) : (
            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="submit-btn"
                style={{ width: 'auto', padding: '10px 24px', background: 'orange', borderColor: 'orange', color: '#000', fontWeight: 'bold' }}
            >
                {submitting ? 'Submitting...' : 'Finish Checkpoint'}
            </button>
            )}
        </div>
        </div>
    );
}

export default LJCheckpointQuizView

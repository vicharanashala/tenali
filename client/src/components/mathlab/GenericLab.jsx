import { useEffect, useRef, useState } from 'react';
import CONFIG from '../../config';
import useAutoAdvance from '../../hooks/useAutoAdvance';
import useProgressSubmit from '../../hooks/useProgressSubmit';
import useTimer from '../../hooks/useTimer';
import FeedbackDisplay from '../common/FeedbackDisplay';
import ResultsTable from '../common/ResultsTable';

//GenericLabApp
function GenericLab({ title, subtitle, endpoint, onBack, renderQuestionCustom, customGenerate, initialDifficulty, initialNumQuestions, initialStarted }) {
    const [difficulty, setDifficulty] = useState(initialDifficulty || 'easy');
    const [numQuestions, setNumQuestions] = useState(initialNumQuestions || '5');
    const [started, setStarted] = useState(initialStarted || false);
    const [finished, setFinished] = useState(false);
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [totalQ, setTotalQ] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [results, setResults] = useState([]);
    const timer = useTimer();
    // Guard ref: prevents double-fetch from React StrictMode concurrent effect invocations
    const fetchingRef = useRef(false);
    // Prefetch cache: holds the next question already fetched silently in background
    const prefetchRef = useRef(null);

    const fetchQuestion = async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        if (questionNumber >= totalQ) {
        fetchingRef.current = false;
        setFinished(true);
        timer.reset();
        return;
        }
        setLoading(true);
        setFeedback('');
        setAnswer('');
        setRevealed(false);
        setIsCorrect(null);

        // Use prefetched question if available for instant load, otherwise fetch now
        let data = prefetchRef.current;
        prefetchRef.current = null;
        if (!data) {
        data = customGenerate
            ? await customGenerate()
            : await (await fetch(`${CONFIG.api}${endpoint}/generate?difficulty=${difficulty}`)).json();
        }
        setQuestion(data);
        setQuestionNumber(n => n + 1);
        setLoading(false);
        fetchingRef.current = false;
        timer.start();
        // Silently prefetch the next question in background while user answers
        const doFetch = customGenerate
        ? customGenerate
        : () => fetch(`${CONFIG.api}${endpoint}/generate?difficulty=${difficulty}`).then(r => r.json());
        doFetch().then(next => { if (next) prefetchRef.current = next; }).catch(() => { });
    };

    const startQuiz = () => {
        setTotalQ(Number(numQuestions) || 5);
        setStarted(true);
        setFinished(false);
        setScore(0);
        setQuestionNumber(0);
        setResults([]);
        fetchQuestion();
        fetchingRef.current = false;
        prefetchRef.current = null;
    };

    const submitAns = async (optAns) => {
        if (!question || revealed) return;
        const finalAns = optAns !== undefined ? optAns : answer;
        const timeTaken = timer.stop();
        setAnswer(finalAns);

        const res = await fetch(`${CONFIG.api}${endpoint}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerOption: finalAns, expected: question.answer })
        });
        const data = await res.json();

        setIsCorrect(data.correct);
        if (data.correct) setScore(s => s + 1);

        const explanationText = question.hint ? ` (${question.hint})` : '';
        setFeedback(data.correct
        ? `Correct! The answer is ${data.correctAnswer}.${explanationText}`
        : `Incorrect. The correct answer is ${data.correctAnswer}.${explanationText}`
        );

        setResults(prev => [...prev, {
        question: question.prompt,
        userAnswer: finalAns,
        correctAnswer: data.correctAnswer,
        correct: data.correct,
        time: timeTaken
        }]);
        setRevealed(true);
    };

    const handleSolve = async () => {
        if (revealed) return;
        const timeTaken = timer.stop();
        const res = await fetch(`${CONFIG.api}${endpoint}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerOption: '', expected: question.answer, solve: true })
        });
        const data = await res.json();
        setIsCorrect(false);
        const explanationText = question.hint ? ` (${question.hint})` : '';
        setFeedback(`Solution: ${data.correctAnswer}.${explanationText}`);
        setResults(prev => [...prev, {
        question: question.prompt,
        userAnswer: '—',
        correctAnswer: data.correctAnswer,
        correct: false,
        time: timeTaken
        }]);
        setRevealed(true);
    };

    const handleSubmitOrNext = () => {
        if (!revealed) {
        if (answer || question.options) submitAns();
        } else {
        fetchQuestion();
        }
    };

    const advanceRef = useRef(null);
    useEffect(
        () => {
            advanceRef.current = fetchQuestion
        }
    )
    useAutoAdvance(revealed, advanceRef, isCorrect);
    useProgressSubmit(revealed, isCorrect, endpoint.split('/')[1], question?.id);

    const C = {
        bg: '#1A1A1A',
        card: 'rgb(44, 38, 34)',
        text: '#FFFFFF',
        muted: '#A0A0A0',
        orange: '#F97316',
        orange2: '#EA580C',
        border: '#333333'
    };
    const FONT = "'Nunito', sans-serif";

    // Reusable Floating Background for the Dark Theme Start Screen
    const BG_SYMS = ['×', '÷', '+', '=', '%', 'π', '√', '∑', '3', '5', '9'];

    if (!started && !finished) {
        return (
        <div style={{ minHeight: '100vh', background: '#181512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{
            background: '#2D2520', border: '1.5px solid #4A4038', borderRadius: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%',
            textAlign: 'center', position: 'relative'
            }}>
            <button onClick={onBack} style={{
                position: 'absolute', top: '24px', left: '24px', background: 'transparent',
                border: '1px solid #5B5048', borderRadius: '6px', padding: '6px 14px',
                color: '#A89C93', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
            }}>← Home</button>

            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: '#F4F1ED', margin: '0 0 12px', lineHeight: 1.1 }}>
                {title.replace('🔷 ', '')}
            </h1>
            <p style={{ color: '#988D84', fontSize: '0.9rem', margin: '0 0 40px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                {subtitle}
            </p>
            <p style={{ color: '#988D84', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Practice {title.toLowerCase().replace('🔷 ', '')}!
            </p>

            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#F4F1ED', fontSize: '0.9rem', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                Select Difficulty:
                </h3>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[['Easy', 'easy'], ['Medium', 'medium'], ['Hard', 'hard']].map(([lbl, val]) => (
                    <button key={val} onClick={() => setDifficulty(val)} style={{
                    background: difficulty === val ? '#F08C46' : 'transparent',
                    border: difficulty === val ? '1px solid #F08C46' : '1px solid #5B5048',
                    borderRadius: '50px', padding: '8px 16px',
                    color: difficulty === val ? '#FFF' : '#988D84', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                    }}>
                    {lbl}
                    </button>
                ))}
                </div>
            </div>

            <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ color: '#988D84', fontSize: '0.85rem', margin: '0 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                How many questions?
                </label>
                <input type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} style={{
                background: '#463B34', border: '1px solid #5B5048', borderRadius: '6px',
                padding: '10px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                width: '100px', textAlign: 'center', outline: 'none'
                }} placeholder="5" />
            </div>

            <button onClick={startQuiz} style={{
                background: '#F08C46', border: 'none', borderRadius: '6px',
                padding: '10px 24px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
            }}>
                Start Quiz
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="kid-zone">
        {started && !finished && (
            <div className="kid-card">
            <div className="kid-status-row">
                <button className="kid-back-btn" onClick={onBack}>← Back</button>
                <span>Question {questionNumber} of {totalQ}</span>
                {timer && <div className="kid-timer">⏱️ {timer.elapsed}s</div>}
            </div>
            <div className="kid-progress-bar">
                <div className="kid-progress-fill" style={{ width: `${(questionNumber / totalQ) * 100}%` }}></div>
            </div>

            <div className="question-box" style={{ fontSize: '1.8rem', margin: '20px 0', textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
                {loading || !question ? 'Loading...' : question.prompt}
            </div>

            {question && !loading && renderQuestionCustom && renderQuestionCustom(question, answer, setAnswer, submitAns, revealed)}

            {question && !loading && !renderQuestionCustom && question.options && (
                <div className="emoji-container" style={{ gap: '15px' }}>
                {question.options.map(opt => (
                    <button key={opt} className={`kid-btn-choice ${answer === String(opt) ? 'selected' : ''}`} onClick={() => !revealed && setAnswer(String(opt))} disabled={revealed}>
                    {opt}
                    </button>
                ))}
                </div>
            )}

            {question && !loading && !renderQuestionCustom && !question.options && (
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <input type="text" className="fun-input"
                    value={answer} onChange={e => !revealed && setAnswer(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmitOrNext(); }}
                    placeholder="?" disabled={revealed} autoFocus />
                </div>
            )}

            <FeedbackDisplay feedback={feedback} isCorrect={isCorrect}/>
            <div className="button-row" style={{ marginTop: '30px' }}>
                {!revealed ? (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button className="kid-btn-primary" onClick={handleSolve} style={{ flex: 1, opacity: 0.75 }}>Show Answer</button>
                    <button className="kid-btn-primary" onClick={() => submitAns()} disabled={loading || (!answer && !question?.options)} style={{ flex: 1 }}>Submit</button>
                </div>
                ) : (
                <button className="kid-btn-primary" onClick={handleSubmitOrNext}>{questionNumber >= totalQ ? 'Finish Lab 🏁' : 'Next Question ➡️'}</button>
                )}
            </div>
            {results.length > 0 && <ResultsTable results={results} />}
            </div>
        )}

        {finished && (
            <div className="kid-card" style={{ marginTop: '5vh', textAlign: 'center' }}>
            <div className="bouncy-emoji" style={{ marginBottom: '20px' }}>🎉</div>
            <h1 style={{ fontSize: '3rem' }}>Lab Complete!</h1>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--kid-success)' }}>Final score: {score} / {totalQ}</p>
            <div style={{ marginTop: '30px' }}>
                <ResultsTable results={results} />
            </div>
            <div className="button-row" style={{ marginTop: '30px' }}>
                <button className="kid-btn-primary" onClick={() => { setStarted(false); setFinished(false); }}>Play Again 🔄</button>
                <button className="kid-back-btn" onClick={onBack} style={{ marginLeft: '15px' }}>← Back to Home</button>
            </div>
            </div>
        )}
        </div>
    );
}

export default GenericLab;

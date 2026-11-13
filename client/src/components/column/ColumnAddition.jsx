//ColumnAdditionApp
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../../config'
import useTimer from '../../hooks/useTimer'
import { authGetToken } from '../../utils/authHelper'
import QuizLayout from '../layout/QuizLayout'
import ResultsTable from '../common/ResultsTable'

function ColumnAddition({ onBack, initialDifficulty, initialNumQuestions, initialStarted, isGoalMode = false }) {
    const [difficulty, setDifficulty] = useState(initialDifficulty || 'easy')
    const [numQuestions, setNumQuestions] = useState(initialNumQuestions || String(CONFIG.DEFAULT_TOTAL))
    const [started, setStarted] = useState(initialStarted || false)
    const [finished, setFinished] = useState(false)
    const [question, setQuestion] = useState(null)
    const [score, setScore] = useState(0)
    const [questionNumber, setQuestionNumber] = useState(0)
    const [totalQ, setTotalQ] = useState(CONFIG.DEFAULT_TOTAL)
    const [feedback, setFeedback] = useState('')
    const [isCorrect, setIsCorrect] = useState(null)
    const [loading, setLoading] = useState(false)
    const [revealed, setRevealed] = useState(false)
    const [results, setResults] = useState([])
    const timer = useTimer()
    const sessionGoal = isGoalMode ? 'speed' : 'standard'

    const [answerInputs, setAnswerInputs] = useState([])
    const [carryInputs, setCarryInputs] = useState([])
    const [correctAnswerDigits, setCorrectAnswerDigits] = useState(null)
    const [correctCarryDigits, setCorrectCarryDigits] = useState(null)
    const answerRefs = useRef([])
    const carryRefs = useRef([])
    const advanceTimerRef = useRef(null)
    // Tracks the in-flight question fetch so a newer fetchQuestion() call (or
    // unmount) can cancel a still-pending older one — see makeQuizApp's
    // loadQuestion() for the same pattern and the race it prevents.
    const questionAbortRef = useRef(null)
    useEffect(() => () => questionAbortRef.current?.abort(), [])

    const startQuiz = async () => {
        const q = Number(numQuestions) || CONFIG.DEFAULT_TOTAL
        setTotalQ(q); setScore(0); setQuestionNumber(1); setResults([])
        setFinished(false); setStarted(true); setFeedback(''); setIsCorrect(null); setRevealed(false)
        setCorrectAnswerDigits(null); setCorrectCarryDigits(null)
        timer.reset(); timer.start()
        await fetchQuestion()
    }

    const fetchQuestion = async (diff) => {
        questionAbortRef.current?.abort()
        const controller = new AbortController()
        questionAbortRef.current = controller

        setLoading(true)
        try {
        const r = await fetch(`${CONFIG.api}/column-addition-api/question?difficulty=${diff || difficulty}`, { signal: controller.signal })
        const data = await r.json()
        setQuestion(data)
        setAnswerInputs(new Array(data.answerDigits.length).fill(''))
        setCarryInputs(new Array(data.carries.length).fill(''))
        setCorrectAnswerDigits(null); setCorrectCarryDigits(null)
        setTimeout(() => { if (answerRefs.current[data.answerDigits.length - 1]) answerRefs.current[data.answerDigits.length - 1].focus() }, 100)
        } catch (e) {
        if (e.name === 'AbortError') return
        console.error('Fetch column addition question failed:', e)
        }
        setLoading(false)
    }

    const handleInput = (idx, val, isCarry) => {
        if (revealed) return
        if (val !== '' && !/^\d$/.test(val)) return
        const setter = isCarry ? setCarryInputs : setAnswerInputs
        const arr = isCarry ? carryInputs : answerInputs
        const next = [...arr]; next[idx] = val; setter(next)

        // Paper-addition focus flow on digit entry:
        // answer[ansLen-1] -> carry[ansLen-2] -> answer[ansLen-2] -> carry[ansLen-3] -> ...
        if (!val) return
        if (!isCarry && idx > 0 && carryRefs.current[idx - 1]) {
        carryRefs.current[idx - 1].focus()
        } else if (!isCarry && idx === 0) {
        // Leftmost answer: nothing more to fill, stay
        } else if (isCarry && answerRefs.current[idx]) {
        answerRefs.current[idx].focus()
        }
    }

    const focusAnswer = (i) => { if (answerRefs.current[i]) answerRefs.current[i].focus() }
    const focusCarry = (i) => { if (carryRefs.current[i]) carryRefs.current[i].focus() }

    const handleKeyDown = (idx, e, isCarry) => {

        if (e.key === 'Backspace') {
        if (e.currentTarget.value) return
        e.preventDefault()
        // Paper-flow reverse navigation:
        //   answer[i] previous = carry[i]        (the box above, if visible)
        //   carry[i]  previous = answer[i+1]     (next-right answer digit)
        if (!isCarry) {
            if (idx < carryInputs.length - 1 && carryRefs.current[idx]) {
            carryRefs.current[idx].focus()
            }
        } else {
            if (idx < answerInputs.length - 1 && answerRefs.current[idx + 1]) {
            answerRefs.current[idx + 1].focus()
            }
        }
        return
        }

        if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isCarry && idx < carryInputs.length - 1) focusCarry(idx)
        else if (isCarry) focusAnswer(idx)
        return
        }

        if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (isCarry) focusAnswer(idx)
        else if (idx < carryInputs.length - 1) focusCarry(idx)
        return
        }

        if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (!isCarry) {
            if (idx > 0) focusAnswer(idx - 1)
        } else {
            if (idx > 0) focusCarry(idx - 1)
            else if (idx === 0) focusAnswer(0)
        }
        return
        }

        if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (!isCarry) {
            if (idx < answerInputs.length - 1) focusAnswer(idx + 1)
        } else {
            if (idx < carryInputs.length - 2) focusCarry(idx + 1)
            else if (idx === carryInputs.length - 2) focusAnswer(idx + 1)
        }
        return
        }
    }

    const handleSubmit = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        const userAnswer = answerInputs.map(v => v === '' ? null : Number(v))
        const userCarries = carryInputs.map(v => v === '' ? 0 : Number(v))
        try {
        const r = await fetch(`${CONFIG.api}/column-addition-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer, userCarries, sessionGoal })
        })
        const data = await r.json()
        setCorrectAnswerDigits(data.answerDigits)
        setCorrectCarryDigits(data.correctCarries)
        setIsCorrect(data.correct); setRevealed(true)

        let explanation = ''
        try {
            const sr = await fetch(`${CONFIG.api}/column-addition-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer: [], userCarries: [], solve: true })
            })
            const sd = await sr.json()
            explanation = sd.explanation || ''
        } catch (e) {
            console.error(e.stack)
        }

        const resultLine = data.correct ? '✓ Correct!' : `✗ ${data.message || 'Incorrect'}`
        setFeedback(explanation ? `${resultLine}\n\n— Step-by-step solution —\n${explanation}` : resultLine)
        const userCarriesStr = carryInputs.filter(v => v !== '').join(', ') || '—'
        const correctCarriesStr = (data.correctCarries || []).filter(v => v !== 0 && v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} + ${question.b}`, userAnswer: Number(userAnswer.filter(v => v !== null).join('')) || '', correct: data.correct, correctAnswer: data.correctAnswer, time: timer.elapsed, userCarries: userCarriesStr, correctCarries: correctCarriesStr }])
        if (data.correct) setScore(s => s + 1)
        } catch (e) { console.error('Check failed:', e); setFeedback('Error checking answer') }
    }

    const handleSolve = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        try {
        const r = await fetch(`${CONFIG.api}/column-addition-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer: [], userCarries: [], solve: true })
        })
        const data = await r.json()
        setCorrectAnswerDigits(data.answerDigits)
        setCorrectCarryDigits(data.correctCarries)
        setIsCorrect(false); setRevealed(true)
        setAnswerInputs(data.answerDigits ? data.answerDigits.map(String) : question.answerDigits.map(String))
        setCarryInputs(data.correctCarries ? data.correctCarries.map(String) : question.carries.map(String))
        setFeedback(data.explanation || 'Solved — study the carries above each column.')
        const correctCarriesStr = (data.correctCarries || []).filter(v => v !== 0 && v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} + ${question.b}`, userAnswer: data.correctAnswer, correct: false, correctAnswer: data.correctAnswer, time: timer.elapsed, userCarries: '—', correctCarries: correctCarriesStr }])
        } catch (e) {
        console.error('Solve failed:', e)
        setCorrectAnswerDigits(question.answerDigits)
        setCorrectCarryDigits(question.carries)
        setRevealed(true); setIsCorrect(false)
        setAnswerInputs(question.answerDigits.map(String))
        setCarryInputs(question.carries.map(String))
        setFeedback('Solved — study the carries above each column.')
        setResults(prev => [...prev, { question: `${question.a} + ${question.b}`, userAnswer: question.answer, correct: false, correctAnswer: question.answer, time: timer.elapsed }])
        }
    }

    const advanceQuestion = () => {
        if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null }
        setRevealed(false); setIsCorrect(null); setFeedback(''); setAnswerInputs([]); setCarryInputs([])
        setCorrectAnswerDigits(null); setCorrectCarryDigits(null)
        if (questionNumber >= totalQ) { setFinished(true); timer.stop() }
        else { setQuestionNumber(qn => qn + 1); timer.reset(); timer.start(); fetchQuestion() }
    }

    const diffLabels = { easy: 'Easy — 1 digit', medium: 'Medium — 2 digits', hard: 'Hard — 3 digits', extrahard: 'Extra Hard — 4 digits' }

    if (!started && !finished) {
        return (
        <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '28px', boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={onBack} style={{ position: 'absolute', top: '24px', left: '24px', background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '6px 14px', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>← Home</button>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: 'var(--clr-text)', margin: '0 0 12px', lineHeight: 1.1 }}>Column Addition</h1>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Add numbers vertically with carrying</p>
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--clr-text)', fontSize: '0.9rem', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Select Difficulty:</h3>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['easy', 'medium', 'hard', 'extrahard'].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} style={{ background: difficulty === d ? 'var(--clr-accent)' : 'transparent', border: difficulty === d ? '1px solid var(--clr-accent)' : '1px solid var(--clr-border)', borderRadius: '50px', padding: '8px 16px', color: difficulty === d ? '#FFF' : 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>{diffLabels[d]}</button>
                ))}
                </div>
            </div>
            <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', margin: '0 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>How many questions? (max 100)</label>
                <input type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setNumQuestions(v) }} style={{ background: 'var(--clr-input)', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '10px', color: 'var(--clr-text)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', width: '100px', textAlign: 'center', outline: 'none' }} placeholder={String(CONFIG.DEFAULT_TOTAL)} />
            </div>
            <button onClick={startQuiz} style={{ background: 'var(--clr-accent)', border: 'none', borderRadius: '6px', padding: '10px 24px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Start Quiz</button>
            </div>
        </div>
        )
    }

    const ansLen = question ? question.answerDigits.length : 1
    // const opLen = question ? question.digits : 1

    return (
        <QuizLayout title="Column Addition" onBack={onBack} timer={timer}>
        {started && !finished && <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
            </div>
            {loading || !question ? <div className="question-box">Loading question…</div> : (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', fontFamily: '"Courier New", monospace', fontSize: '1.8rem', fontWeight: 700 }}>
                {/* Carry row: ansLen columns, skip last (ones=always 0), show boxes at [0..ansLen-2] */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ width: '44px' }} />
                    {question.carries.map((c, i) => {
                    if (i === question.carries.length - 1) return <span key={i} style={{ width: '40px' }} />
                    const correct = revealed && correctCarryDigits ? String(correctCarryDigits[i]) : '';
                    const isRight = revealed && correct !== '' && String(carryInputs[i] || '') === correct;
                    const isWrong = revealed && correct !== '' && !isRight;
                    const shown = revealed ? correct : carryInputs[i] || '';
                    return (
                        <input key={i} ref={el => carryRefs.current[i] = el} type="text" maxLength={1}
                        value={shown}
                        onChange={e => handleInput(i, e.target.value, true)}
                        onKeyDown={e => handleKeyDown(i, e, true)}
                        disabled={revealed}
                        style={{ width: '40px', height: '36px', textAlign: 'center', fontSize: '1rem', fontWeight: 700, background: isRight ? 'var(--clr-correct-bg)' : isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)', border: `2px solid ${isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-border)'}`, borderRadius: '8px', color: isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)', fontFamily: '"Courier New", monospace', outline: 'none' }}
                        />
                    )
                    })}
                </div>
                {/* First number: right-aligned in ansLen columns */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                    <span style={{ width: '44px' }} />
                    {question.aDigits.map((d, i) => (
                    <span key={i} style={{ width: '40px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text)' }}>{d !== null ? d : ''}</span>
                    ))}
                </div>
                {/* Second number: right-aligned in ansLen columns */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ width: '44px', textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '1.4rem' }}>+</span>
                    {question.bDigits.map((d, i) => (
                    <span key={i} style={{ width: '40px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text)' }}>{d !== null ? d : ''}</span>
                    ))}
                </div>
                {/* Line separator: full width of answer */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '44px' }} />
                    <div style={{ width: `${ansLen * 44}px`, height: '3px', background: 'var(--clr-border)', borderRadius: '2px' }} />
                </div>
                {/* Answer row: ansLen input boxes */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <span style={{ width: '44px' }} />
                    {question.answerDigits.map((d, i) => {
                    const correctDigit = revealed && correctAnswerDigits ? String(correctAnswerDigits[i]) : '';
                    const isRight = revealed && correctDigit !== '' && String(answerInputs[i] || '') === correctDigit;
                    const isWrong = revealed && correctDigit !== '' && !isRight;
                    const shown = revealed ? correctDigit : answerInputs[i] || '';
                    return (
                        <input key={i} ref={el => answerRefs.current[i] = el} type="text" maxLength={1}
                        value={shown}
                        onChange={e => handleInput(i, e.target.value, false)}
                        onKeyDown={e => handleKeyDown(i, e, false)}
                        disabled={revealed}
                        style={{ width: '40px', height: '48px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, background: isRight ? 'var(--clr-correct-bg)' : isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)', border: `2px solid ${isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-border)'}`, borderRadius: '8px', color: isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)', fontFamily: '"Courier New", monospace', outline: 'none' }}
                        />
                    )
                    })}
                </div>
                </div>
                {feedback && (
                <div style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: '8px', margin: '8px 0',
                    background: isCorrect ? 'rgba(92, 184, 122, 0.25)' : 'rgba(224, 90, 74, 0.25)',
                    color: isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                    fontWeight: 600, fontSize: '0.9rem',
                    whiteSpace: 'pre-line', lineHeight: '1.6',
                    maxHeight: '300px', overflowY: 'auto',
                    border: isCorrect ? '2px solid var(--clr-correct)' : '2px solid var(--clr-wrong)'
                }}>{feedback}</div>
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                {!revealed && <button onClick={handleSubmit} disabled={loading} style={{ background: 'var(--clr-accent)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Submit</button>}
                {!revealed && <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '10px 24px', color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Solve</button>}
                {revealed && <button onClick={advanceQuestion} style={{ background: 'var(--clr-accent)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Next Question →</button>}
                </div>
            </>
            )}
            {results.length > 0 && <ResultsTable results={results} />}
        </>}
        {finished && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
            <h2 style={{ color: 'var(--clr-text)', marginBottom: '16px' }}>Score: {score}/{totalQ}</h2>
            <ResultsTable results={results} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button onClick={() => { setStarted(false); setFinished(false) }} style={{ background: 'var(--clr-accent)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Play Again</button>
            </div>
            </div>
        )}
        </QuizLayout>
    )
}

export default ColumnAddition

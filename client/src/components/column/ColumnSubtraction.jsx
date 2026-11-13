import { useEffect, useRef, useState } from "react"
import CONFIG from "../../config"
import useTimer from "../../hooks/useTimer"
import { authGetToken } from "../../utils/authHelper"
import QuizLayout from "../layout/QuizLayout"
import ResultsTable from "../common/ResultsTable"

function ColumnSubtraction({ onBack, initialDifficulty, initialNumQuestions, initialStarted, isGoalMode = false }) {
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
    const sessionGoal  = isGoalMode ? 'speed' : 'standard'
    const [showHelp, setShowHelp] = useState(false)

    const [answerInputs, setAnswerInputs] = useState([])
    const [borrowInputs, setBorrowInputs] = useState([])
    const [correctAnswerDigits, setCorrectAnswerDigits] = useState(null)
    const [correctBorrowDigits, setCorrectBorrowDigits] = useState(null)
    const [activeBorrows, setActiveBorrows] = useState(new Set())
    const answerRefs = useRef([])
    const borrowRefs = useRef([])
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
        setCorrectAnswerDigits(null); setCorrectBorrowDigits(null); setActiveBorrows(new Set())
        timer.reset(); timer.start();
        await fetchQuestion()
    }

    const fetchQuestion = async (diff) => {
        questionAbortRef.current?.abort()
        const controller = new AbortController()
        questionAbortRef.current = controller

        setLoading(true)
        try {
        const r = await fetch(`${CONFIG.api}/column-subtraction-api/question?difficulty=${diff || difficulty}`, { signal: controller.signal })
        const data = await r.json()
        setQuestion(data)
        setAnswerInputs(new Array(data.answerDigits.length).fill(''))
        setBorrowInputs(new Array(data.borrows.length).fill(''))
        setCorrectAnswerDigits(null); setCorrectBorrowDigits(null); setActiveBorrows(new Set())
        setTimeout(() => {
            const lastIdx = data.answerDigits.length - 1
            if (answerRefs.current[lastIdx]) answerRefs.current[lastIdx].focus()
        }, 100)
        } catch (e) {
        if (e.name === 'AbortError') return
        console.error('Fetch column subtraction question failed:', e)
        }
        setLoading(false)
    }

    const activateBorrow = (idx, isCurrentlyActive) => {
        if (isCurrentlyActive) {
        setActiveBorrows(prev => { const next = new Set(prev); next.delete(idx); return next })
        setBorrowInputs(prev => { const a = [...prev]; a[idx] = ''; return a })
        } else {
        setActiveBorrows(prev => { const next = new Set(prev); next.add(idx); return next })
        setTimeout(() => { if (borrowRefs.current[idx]) borrowRefs.current[idx].focus() }, 50)
        }
    }

    const handleInput = (idx, val, isBorrow) => {
        if (revealed) return
        if (val !== '' && !(isBorrow ? /^\d{1,2}$/.test(val) : /^\d$/.test(val))) return
        const setter = isBorrow ? setBorrowInputs : setAnswerInputs
        const arr = isBorrow ? borrowInputs : answerInputs
        const next = [...arr]; next[idx] = val; setter(next)
    }

    const focusAnswer = (i) => { if (answerRefs.current[i]) answerRefs.current[i].focus() }
    const focusBorrow = (i) => { if (borrowRefs.current[i]) borrowRefs.current[i].focus() }

    const handleKeyDown = (idx, e, isBorrow) => {

        if (e.key === 'Backspace') {
        if (e.currentTarget.value) return
        e.preventDefault()
        if (isBorrow) {
            focusAnswer(idx)
        } else if (idx < answerInputs.length - 1) {
            focusAnswer(idx + 1)
        }
        return
        }

        if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isBorrow && activeBorrows.has(idx) && borrowRefs.current[idx]) focusBorrow(idx)
        return
        }
        if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (isBorrow) focusAnswer(idx)
        return
        }
        if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (!isBorrow) { if (idx > 0) focusAnswer(idx - 1) }
        else { focusAnswer(idx) }
        return
        }
        if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (!isBorrow) { if (idx < answerInputs.length - 1) focusAnswer(idx + 1) }
        else { focusAnswer(idx) }
        return
        }
    }

    const handleSubmit = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        const userAnswer = answerInputs.map(v => v === '' ? null : Number(v))
        const userBorrows = borrowInputs.map(v => v === '' ? '' : v)
        try {
        const r = await fetch(`${CONFIG.api}/column-subtraction-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer, userBorrows, sessionGoal })
        })
        const data = await r.json()
        const allBorrows = new Set(activeBorrows)
        if (data.correctBorrows && question.aDigits) {
            data.correctBorrows.forEach((v, i) => { if (question.aDigits[i] != null && String(v) !== String(question.aDigits[i])) allBorrows.add(i) })
        }
        setCorrectAnswerDigits(data.answerDigits)
        setCorrectBorrowDigits(data.correctBorrows)
        setIsCorrect(data.correct); setRevealed(true); setActiveBorrows(allBorrows)
        let explanation = ''
        try {
            const sr = await fetch(`${CONFIG.api}/column-subtraction-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer: [], userBorrows: [], solve: true })
            })
            const sd = await sr.json()
            explanation = sd.explanation || ''
        } catch (e) {console.error(e.stack)}
        const resultLine = data.correct ? '✓ Correct!' : `✗ ${data.message || 'Incorrect'}`
        setFeedback(explanation ? `${resultLine}\n\n— Step-by-step solution —\n${explanation}` : resultLine)
        const userBorrowsStr = borrowInputs.filter(v => v !== '').join(', ') || '—'
        const correctBorrowsStr = (data.correctBorrows || []).filter(v => v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} − ${question.b}`, userAnswer: Number(userAnswer.filter(v => v !== null).join('')) || '', correct: data.correct, correctAnswer: data.correctAnswer, time: timer.elapsed, userCarries: userBorrowsStr, correctCarries: correctBorrowsStr }])
        if (data.correct) setScore(s => s + 1)
        } catch (e) { console.error('Check failed:', e); setFeedback('Error checking answer') }
    }

    const handleSolve = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        const allBorrows = new Set()
        try {
        const r = await fetch(`${CONFIG.api}/column-subtraction-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer: [], userBorrows: [], solve: true })
        })
        const data = await r.json()
        if (data.correctBorrows && question.aDigits) {
            data.correctBorrows.forEach((v, i) => { if (question.aDigits[i] != null && String(v) !== String(question.aDigits[i])) allBorrows.add(i) })
        }
        setCorrectAnswerDigits(data.answerDigits)
        setCorrectBorrowDigits(data.correctBorrows)
        setIsCorrect(false); setRevealed(true); setActiveBorrows(allBorrows)
        setAnswerInputs(data.answerDigits ? data.answerDigits.map(String) : question.answerDigits.map(String))
        setBorrowInputs(data.correctBorrows ? data.correctBorrows.map(String) : question.borrows.map(String))
        setFeedback(data.explanation || 'Solved — study the borrows above each column.')
        const solveBorrowStr = (data.correctBorrows || []).filter(v => v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} − ${question.b}`, userAnswer: data.correctAnswer, correct: false, correctAnswer: data.correctAnswer, time: timer.elapsed, userCarries: '—', correctCarries: solveBorrowStr }])
        } catch (e) {
        console.error('Solve failed:', e)
        if (question.borrows && question.aDigits) {
            question.borrows.forEach((v, i) => { if (question.aDigits[i] != null && String(v) !== String(question.aDigits[i])) allBorrows.add(i) })
        }
        setCorrectAnswerDigits(question.answerDigits)
        setCorrectBorrowDigits(question.borrows)
        setRevealed(true); setIsCorrect(false); setActiveBorrows(allBorrows)
        setAnswerInputs(question.answerDigits.map(String))
        setBorrowInputs(question.borrows.map(String))
        setFeedback('Solved — study the borrows above each column.')
        const fallbackBorrowStr = (question.borrows || []).filter(v => v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} − ${question.b}`, userAnswer: question.answer, correct: false, correctAnswer: question.answer, time: timer.elapsed, userCarries: '—', correctCarries: fallbackBorrowStr }])
        }
    }

    const advanceQuestion = () => {
        if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null }
        setRevealed(false); setIsCorrect(null); setFeedback(''); setCorrectAnswerDigits(null); setCorrectBorrowDigits(null); setActiveBorrows(new Set())
        if (questionNumber >= totalQ) { setFinished(true); timer.stop() }
        else { setQuestionNumber(qn => qn + 1); setAnswerInputs([]); setBorrowInputs([]); timer.reset(); timer.start(); fetchQuestion() }
    }

    const diffLabels = { easy: 'Easy — 2 digit', medium: 'Medium — 2 digit', hard: 'Hard — 3 digit', extrahard: 'Extra Hard — 4 digit' }

    if (!started && !finished) {
        return (
        <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '28px', boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={onBack} style={{ position: 'absolute', top: '24px', left: '24px', background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '6px 14px', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>← Home</button>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: 'var(--clr-text)', margin: '0 0 12px', lineHeight: 1.1 }}>Column Subtraction</h1>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Subtract vertically with borrowing</p>

            {/* Help toggle */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setShowHelp(h => !h)} style={{ background: showHelp ? 'var(--clr-input)' : 'transparent', border: '1px solid var(--clr-border)', borderRadius: '50px', padding: '6px 16px', color: 'var(--clr-accent)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{showHelp ? '✕ Close' : '? How to play'}</button>
            </div>

            {showHelp && (
                <div style={{ textAlign: 'left', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '28px 28px', marginBottom: '24px', maxWidth: '580px', margin: '0 auto 24px' }}>
                <h3 style={{ color: 'var(--clr-accent)', fontSize: '1.05rem', margin: '0 0 20px', fontFamily: 'Inter, sans-serif', fontWeight: 700, textAlign: 'center' }}>How Column Subtraction Works</h3>

                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>1</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>See the problem</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', marginBottom: '10px' }}>The problem appears vertically. Start from the <strong style={{ color: 'var(--clr-text)' }}>rightmost column</strong> and work left.</div>
                    <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 16px', fontFamily: '"Courier New", monospace', fontSize: '1.2rem', fontWeight: 700, lineHeight: '1.5', textAlign: 'center' }}>
                        <div><span style={{ color: 'var(--clr-text)' }}>2</span><span style={{ color: 'var(--clr-text)' }}>3</span></div>
                        <div><span style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>− </span><span style={{ color: 'var(--clr-text)' }}>1</span><span style={{ color: 'var(--clr-text)' }}>8</span></div>
                        <div style={{ width: '80px', height: '2px', background: 'var(--clr-border)', margin: '4px auto' }} />
                        <div><span style={{ color: 'var(--clr-text)' }}>_</span><span style={{ color: 'var(--clr-text)' }}>_</span></div>
                    </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>2</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Can't subtract? Click the top digit to borrow</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', marginBottom: '10px' }}>3 − 8 is not possible, so click the <strong style={{ color: 'var(--clr-accent)' }}>3</strong> above. It gets a <span style={{ textDecoration: 'line-through', color: 'var(--clr-accent)' }}>strikethrough</span> and a box appears above it.</div>
                    <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 16px', fontFamily: '"Courier New", monospace', fontSize: '1.2rem', fontWeight: 700, lineHeight: '1.5', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginBottom: '2px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>↑ box appears here</div>
                        <div><span style={{ color: 'var(--clr-text-soft)', opacity: 0.5, textDecoration: 'line-through' }}>2</span><span style={{ color: 'var(--clr-accent)', border: '1.5px solid var(--clr-accent)', borderRadius: '4px', padding: '0 4px' }}>3</span></div>
                        <div><span style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>− </span><span style={{ color: 'var(--clr-text)' }}>1</span><span style={{ color: 'var(--clr-text)' }}>8</span></div>
                        <div style={{ width: '80px', height: '2px', background: 'var(--clr-border)', margin: '4px auto' }} />
                        <div><span style={{ color: 'var(--clr-text)' }}>_</span><span style={{ color: 'var(--clr-text)' }}>_</span></div>
                    </div>
                    </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>3</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Type the converted value</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', marginBottom: '10px' }}>3 becomes <strong style={{ color: 'var(--clr-text)' }}>13</strong> after borrowing. Type <strong style={{ color: 'var(--clr-text)' }}>13</strong> in the box. Now 13 − 8 = <strong style={{ color: 'var(--clr-text)' }}>5</strong>.</div>
                    <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 16px', fontFamily: '"Courier New", monospace', fontSize: '1.2rem', fontWeight: 700, lineHeight: '1.5', textAlign: 'center' }}>
                        <div style={{ marginBottom: '2px' }}><span style={{ fontSize: '1.1rem', color: 'var(--clr-accent)', border: '1.5px solid var(--clr-accent)', borderRadius: '4px', padding: '2px 6px' }}>13</span></div>
                        <div><span style={{ color: 'var(--clr-text-soft)', textDecoration: 'line-through', opacity: 0.5 }}>2</span><span style={{ color: 'var(--clr-text-soft)' }}>3</span></div>
                        <div><span style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>− </span><span style={{ color: 'var(--clr-text)' }}>1</span><span style={{ color: 'var(--clr-text)' }}>8</span></div>
                        <div style={{ width: '80px', height: '2px', background: 'var(--clr-border)', margin: '4px auto' }} />
                        <div><span style={{ color: 'var(--clr-text)' }}>_</span><span style={{ color: 'var(--clr-correct)' }}>5</span></div>
                    </div>
                    </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>4</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Move left, subtract next column</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', marginBottom: '10px' }}>The 2 became <strong style={{ color: 'var(--clr-text)' }}>1</strong> after lending. Now 1 − 1 = <strong style={{ color: 'var(--clr-text)' }}>0</strong>. Answer is <strong style={{ color: 'var(--clr-correct)' }}>05</strong> = 5. Correct!</div>
                    <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 16px', fontFamily: '"Courier New", monospace', fontSize: '1.2rem', fontWeight: 700, lineHeight: '1.5', textAlign: 'center' }}>
                        <div style={{ marginBottom: '2px' }}><span style={{ fontSize: '1.1rem', color: 'var(--clr-text-soft)' }}>  </span></div>
                        <div><span style={{ color: 'var(--clr-text-soft)', textDecoration: 'line-through', opacity: 0.5 }}>2</span><span style={{ color: 'var(--clr-text-soft)', textDecoration: 'line-through', opacity: 0.5 }}>3</span></div>
                        <div><span style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>− </span><span style={{ color: 'var(--clr-text)' }}>1</span><span style={{ color: 'var(--clr-text)' }}>8</span></div>
                        <div style={{ width: '80px', height: '2px', background: 'var(--clr-border)', margin: '4px auto' }} />
                        <div><span style={{ color: 'var(--clr-correct)' }}>0</span><span style={{ color: 'var(--clr-correct)' }}>5</span></div>
                    </div>
                    </div>
                </div>

                {/* Navigation tips */}
                <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 18px', marginTop: '4px' }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>Keyboard shortcuts</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.8' }}>
                    <div><span style={{ color: 'var(--clr-accent)', fontFamily: '"Courier New", monospace', background: 'var(--clr-input)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>← →</span> Move between answer digits</div>
                    <div><span style={{ color: 'var(--clr-accent)', fontFamily: '"Courier New", monospace', background: 'var(--clr-input)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>↑ ↓</span> Jump between answer and borrow box</div>
                    <div><span style={{ color: 'var(--clr-accent)', fontFamily: '"Courier New", monospace', background: 'var(--clr-input)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>Backspace</span> Clear and move right</div>
                    </div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', marginTop: '8px', lineHeight: '1.5' }}>Click a top digit again to <strong>cancel</strong> the borrow. If a column doesn't need borrowing, just fill the answer directly.</div>
                </div>
                </div>
            )}
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

    return (
        <QuizLayout title="Column Subtraction" onBack={onBack} timer={timer}>
        {started && !finished && <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
            </div>
            {loading || !question ? <div className="question-box">Loading question…</div> : (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', fontFamily: '"Courier New", monospace', fontSize: '1.8rem', fontWeight: 700 }}>
                {/* Borrow row: only visible for activated columns */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ width: '44px' }} />
                    {question.borrows.map((_, i) => {
                    if (!activeBorrows.has(i) && !revealed) {
                        return <span key={i} style={{ width: '40px', height: '36px' }} />
                    }
                    const correct = revealed && correctBorrowDigits ? String(correctBorrowDigits[i]) : '';
                    const isOptional = question.aDigits && question.aDigits[i] != null && correct === String(question.aDigits[i]);
                    const isRight = revealed && correct !== '' && (String(borrowInputs[i] || '') === correct || (isOptional && (!borrowInputs[i] || borrowInputs[i] === '')));
                    const isWrong = revealed && correct !== '' && !isRight;
                    const shown = revealed ? (isOptional && (!borrowInputs[i] || borrowInputs[i] === '') ? '' : correct) : (borrowInputs[i] || '');
                    return (
                        <input key={i} ref={el => borrowRefs.current[i] = el} type="text" maxLength={2}
                        value={shown}
                        onChange={e => handleInput(i, e.target.value, true)}
                        onKeyDown={e => handleKeyDown(i, e, true)}
                        disabled={revealed}
                        style={{ width: '40px', height: '36px', textAlign: 'center', fontSize: '1rem', fontWeight: 700, background: revealed ? (isRight ? 'var(--clr-correct-bg)' : (isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)')) : 'var(--clr-input)', border: `2px solid ${revealed && isRight ? 'var(--clr-correct)' : (revealed && isWrong ? 'var(--clr-wrong)' : 'var(--clr-border)')}`, borderRadius: '8px', color: revealed && isRight ? 'var(--clr-correct)' : (revealed && isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)'), fontFamily: '"Courier New", monospace', outline: 'none' }}
                        />
                    );
                    })}
                </div>
                {/* Minuend (top number) — click a digit to strikethrough and reveal borrow box */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                    <span style={{ width: '44px' }} />
                    {question.aDigits.map((d, i) => {
                    const struck = activeBorrows.has(i) || (revealed && correctBorrowDigits && question.aDigits[i] != null && String(correctBorrowDigits[i]) !== String(question.aDigits[i]));
                    return (
                        <span key={i}
                        onClick={() => { if (!revealed && d != null) activateBorrow(i, activeBorrows.has(i)) }}
                        style={{
                            width: '40px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: struck ? 'var(--clr-text-soft)' : 'var(--clr-text)',
                            textDecoration: struck ? 'line-through' : 'none',
                            cursor: revealed || d == null ? 'default' : 'pointer',
                            opacity: struck ? 0.5 : 1,
                            transition: 'all 0.15s ease',
                        }}>
                        {d !== null ? d : ''}
                        </span>
                    );
                    })}
                </div>
                {/* Subtrahend */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ width: '44px', textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '1.4rem' }}>−</span>
                    {question.bDigits.map((d, i) => (
                    <span key={i} style={{ width: '40px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text)' }}>{d !== null ? d : ''}</span>
                    ))}
                </div>
                {/* Line */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '44px' }} />
                    <div style={{ width: `${ansLen * 44}px`, height: '3px', background: 'var(--clr-border)', borderRadius: '2px' }} />
                </div>
                {/* Difference row */}
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

export default ColumnSubtraction

import { useEffect, useRef, useState } from "react"
import CONFIG from "../../config"
import useTimer from "../../hooks/useTimer"
import { authGetToken } from "../../utils/authHelper"
import QuizLayout from "../layout/QuizLayout"
import ResultsTable from "../common/ResultsTable"

//ColumnDivisionApp
function ColumnDivision({ onBack, initialDifficulty, initialNumQuestions, initialStarted, isGoalMode = false }) {
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

    const [quotientInputs, setQuotientInputs] = useState([])
    const [productInputs, setProductInputs] = useState([])
    const [remainderInputs, setRemainderInputs] = useState([])
    const [solutionSteps, setSolutionSteps] = useState(null)
    const [activeBorrows, setActiveBorrows] = useState(new Set())
    const [borrowInputs, setBorrowInputs] = useState({})
    const [hoveredBorrow, setHoveredBorrow] = useState(null)
    const quotientRefs = useRef([])
    const productRefs = useRef([])
    const remainderRefs = useRef([])
    const borrowRefs = useRef({})
    const advanceTimerRef = useRef(null)
    // Tracks the in-flight question fetch so a newer fetchQuestion() call (or
    // unmount) can cancel a still-pending older one — see makeQuizApp's
    // loadQuestion() for the same pattern and the race it prevents.
    const questionAbortRef = useRef(null)
    useEffect(() => () => questionAbortRef.current?.abort(), [])

    const COL = 40
    const BRACKET = 80

    const startQuiz = async () => {
        const q = Number(numQuestions) || CONFIG.DEFAULT_TOTAL
        setTotalQ(q); setScore(0); setQuestionNumber(1); setResults([])
        setFinished(false); setStarted(true); setFeedback(''); setIsCorrect(null); setRevealed(false)
        timer.reset(); timer.start()
        await fetchQuestion()
    }

    const fetchQuestion = async (diff) => {
        questionAbortRef.current?.abort()
        const controller = new AbortController()
        questionAbortRef.current = controller

        setLoading(true)
        try {
        const r = await fetch(`${CONFIG.api}/column-division-api/question?difficulty=${diff || difficulty}`, { signal: controller.signal })
        const data = await r.json()
        setQuestion(data)
        setQuotientInputs(new Array(data.quotientDigits.length).fill(''))
        setProductInputs(data.steps.map(s => new Array(String(s.product).length).fill('')))
        setRemainderInputs(data.steps.map(s => new Array(Math.max(String(s.remainder).length, 1)).fill('')))
        setBorrowInputs({})
        setActiveBorrows(new Set())
        setTimeout(() => { if (quotientRefs.current[0]) quotientRefs.current[0].focus() }, 100)
        } catch (e) {
        if (e.name === 'AbortError') return
        console.error('Fetch column division question failed:', e)
        }
        setLoading(false)
    }

    const activateBorrow = (rowKey, col, isCurrentlyActive) => {
        const key = `${rowKey}-${col}`
        if (isCurrentlyActive) {
        setActiveBorrows(prev => { const next = new Set(prev); next.delete(key); return next })
        setBorrowInputs(prev => { const next = { ...prev }; delete next[key]; return next })
        } else {
        setActiveBorrows(prev => { const next = new Set(prev); next.add(key); return next })
        setTimeout(() => { if (borrowRefs.current[key]) borrowRefs.current[key].focus() }, 50)
        }
    }

    const hideAllBorrows = () => {
        setActiveBorrows(new Set())
    }

    const handleBorrowInput = (rowKey, col, val) => {
        if (revealed) return
        if (val !== '' && !/^\d{1,2}$/.test(val)) return
        const key = `${rowKey}-${col}`
        setBorrowInputs(prev => ({ ...prev, [key]: val }))
    }

    const handleQuotientInput = (idx, val) => {
        if (revealed) return
        if (val !== '' && !/^\d$/.test(val)) return
        const next = [...quotientInputs]; next[idx] = val; setQuotientInputs(next)
        hideAllBorrows()
        if (val && idx < quotientInputs.length - 1) {
        if (quotientRefs.current[idx + 1]) quotientRefs.current[idx + 1].focus()
        } else if (val && idx === quotientInputs.length - 1) {
        if (productRefs.current[0] && productRefs.current[0][0]) productRefs.current[0][0].focus()
        }
    }

    const handleProductInput = (stepIdx, digitIdx, val) => {
        if (revealed) return
        if (val !== '' && !/^\d$/.test(val)) return
        const next = productInputs.map(r => [...r])
        next[stepIdx] = [...next[stepIdx]]; next[stepIdx][digitIdx] = val
        setProductInputs(next)
        hideAllBorrows()
        const digits = productInputs[stepIdx]
        if (val && digitIdx < digits.length - 1) {
        if (productRefs.current[stepIdx] && productRefs.current[stepIdx][digitIdx + 1]) productRefs.current[stepIdx][digitIdx + 1].focus()
        } else if (val && digitIdx === digits.length - 1) {
        if (remainderRefs.current[stepIdx] && remainderRefs.current[stepIdx][0]) remainderRefs.current[stepIdx][0].focus()
        }
    }

    const handleRemainderInput = (stepIdx, digitIdx, val) => {
        if (revealed) return
        if (val !== '' && !/^\d$/.test(val)) return
        const next = remainderInputs.map(r => [...r])
        next[stepIdx] = [...next[stepIdx]]; next[stepIdx][digitIdx] = val
        setRemainderInputs(next)
        const digits = remainderInputs[stepIdx]
        if (val && digitIdx < digits.length - 1) {
        if (remainderRefs.current[stepIdx] && remainderRefs.current[stepIdx][digitIdx + 1]) remainderRefs.current[stepIdx][digitIdx + 1].focus()
        } else if (val && digitIdx === digits.length - 1 && stepIdx < remainderInputs.length - 1) {
        if (productRefs.current[stepIdx + 1] && productRefs.current[stepIdx + 1][0]) productRefs.current[stepIdx + 1][0].focus()
        }
    }

    const handleKeyDown = (e, type, stepIdx, digitIdx) => {
        if (e.key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) {
            if (type === 'quotient' && digitIdx > 0) quotientRefs.current[digitIdx - 1]?.focus()
            else if (type === 'product') {
            if (digitIdx > 0) productRefs.current[stepIdx]?.[digitIdx - 1]?.focus()
            else if (digitIdx === 0 && stepIdx > 0) { const lastR = remainderInputs[stepIdx - 1].length - 1; remainderRefs.current[stepIdx - 1]?.[lastR]?.focus() }
            else if (digitIdx === 0 && stepIdx === 0) quotientRefs.current[quotientInputs.length - 1]?.focus()
            }
            else if (type === 'remainder') {
            if (digitIdx > 0) remainderRefs.current[stepIdx]?.[digitIdx - 1]?.focus()
            else if (digitIdx === 0) productRefs.current[stepIdx]?.[productInputs[stepIdx].length - 1]?.focus()
            }
        } else {
            if (type === 'quotient' && digitIdx < quotientInputs.length - 1) quotientRefs.current[digitIdx + 1]?.focus()
            else if (type === 'quotient' && digitIdx === quotientInputs.length - 1) productRefs.current[0]?.[0]?.focus()
            else if (type === 'product') {
            if (digitIdx < productInputs[stepIdx].length - 1) productRefs.current[stepIdx]?.[digitIdx + 1]?.focus()
            else remainderRefs.current[stepIdx]?.[0]?.focus()
            }
            else if (type === 'remainder') {
            if (digitIdx < remainderInputs[stepIdx].length - 1) remainderRefs.current[stepIdx]?.[digitIdx + 1]?.focus()
            else if (stepIdx < remainderInputs.length - 1) productRefs.current[stepIdx + 1]?.[0]?.focus()
            }
        }
        } else if (e.key === 'Backspace') {
        if (e.currentTarget.value) return
        e.preventDefault()
        if (type === 'quotient' && digitIdx > 0 && quotientRefs.current[digitIdx - 1]) quotientRefs.current[digitIdx - 1].focus()
        else if (type === 'product') {
            if (digitIdx > 0 && productRefs.current[stepIdx] && productRefs.current[stepIdx][digitIdx - 1]) productRefs.current[stepIdx][digitIdx - 1].focus()
            else if (digitIdx === 0 && stepIdx > 0 && remainderRefs.current[stepIdx - 1]) {
            const lastR = remainderInputs[stepIdx - 1].length - 1
            if (remainderRefs.current[stepIdx - 1][lastR]) remainderRefs.current[stepIdx - 1][lastR].focus()
            } else if (digitIdx === 0 && stepIdx === 0 && quotientRefs.current[quotientInputs.length - 1]) quotientRefs.current[quotientInputs.length - 1].focus()
        }
        else if (type === 'remainder') {
            if (digitIdx > 0 && remainderRefs.current[stepIdx] && remainderRefs.current[stepIdx][digitIdx - 1]) remainderRefs.current[stepIdx][digitIdx - 1].focus()
            else if (digitIdx === 0 && productRefs.current[stepIdx] && productRefs.current[stepIdx][0]) productRefs.current[stepIdx][0].focus()
        }
        } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (type === 'quotient' && digitIdx > 0) quotientRefs.current[digitIdx - 1]?.focus()
        else if (type === 'product') {
            if (digitIdx > 0) productRefs.current[stepIdx]?.[digitIdx - 1]?.focus()
            else if (digitIdx === 0 && stepIdx > 0) { const lastR = remainderInputs[stepIdx - 1].length - 1; remainderRefs.current[stepIdx - 1]?.[lastR]?.focus() }
        }
        else if (type === 'remainder') {
            if (digitIdx > 0) remainderRefs.current[stepIdx]?.[digitIdx - 1]?.focus()
            else if (digitIdx === 0) productRefs.current[stepIdx]?.[productInputs[stepIdx].length - 1]?.focus()
        }
        } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (type === 'quotient' && digitIdx < quotientInputs.length - 1) quotientRefs.current[digitIdx + 1]?.focus()
        else if (type === 'quotient' && digitIdx === quotientInputs.length - 1) productRefs.current[0]?.[0]?.focus()
        else if (type === 'product') {
            if (digitIdx < productInputs[stepIdx].length - 1) productRefs.current[stepIdx]?.[digitIdx + 1]?.focus()
            else if (digitIdx === productInputs[stepIdx].length - 1) remainderRefs.current[stepIdx]?.[0]?.focus()
        }
        else if (type === 'remainder') {
            if (digitIdx < remainderInputs[stepIdx].length - 1) remainderRefs.current[stepIdx]?.[digitIdx + 1]?.focus()
            else if (digitIdx === remainderInputs[stepIdx].length - 1 && stepIdx < remainderInputs.length - 1) productRefs.current[stepIdx + 1]?.[0]?.focus()
        }
        }
    }

    const handleSubmit = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        const userQuotient = quotientInputs.map(v => v === '' ? null : Number(v))
        const userProducts = productInputs.map(arr => arr.length === 0 ? 0 : arr.map(v => v === '' ? null : Number(v)).reduce((a, b) => a * 10 + (b || 0), 0))
        const userRemainders = remainderInputs.map(arr => arr.length === 0 ? 0 : arr.map(v => v === '' ? null : Number(v)).reduce((a, b) => a * 10 + (b || 0), 0))
        try {
        const r = await fetch(`${CONFIG.api}/column-division-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ dividend: question.dividend, divisor: question.divisor, userQuotient, userProducts, userRemainders, sessionGoal })
        })
        const data = await r.json()
        setIsCorrect(data.correct); setRevealed(true)
        let solSteps = null
        try {
            const sr = await fetch(`${CONFIG.api}/column-division-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ dividend: question.dividend, divisor: question.divisor, solve: true })
            })
            const sd = await sr.json()
            solSteps = sd.solutionSteps || null
            if (!data.correct && sd.steps) {
            setQuotientInputs(sd.quotientDigits.map(String))
            setProductInputs(sd.steps.map(s => String(s.product).split('')))
            setRemainderInputs(sd.steps.map(s => new Array(Math.max(String(s.remainder).length, 1)).fill(String(s.remainder).padStart(Math.max(String(s.remainder).length, 1), '0'))))
            }
        } catch (e) {console.error(e.stack)}
        setSolutionSteps(solSteps)
        const resultLine = data.correct ? '\u2713 Correct!' : `\u2717 ${data.message || 'Incorrect'}`
        setFeedback(resultLine)
        setResults(prev => [...prev, { question: `${question.dividend} \u00f7 ${question.divisor}`, userAnswer: quotientInputs.filter(v => v).join('') || '\u2014', correct: data.correct, correctAnswer: data.answer, time: timer.elapsed, userCarries: quotientInputs.filter(v => v).join(''), correctCarries: question.quotientDigits.join('') }])
        if (data.correct) setScore(s => s + 1)
        } catch (e) { console.error('Check failed:', e); setFeedback('Error checking answer') }
    }

    const handleSolve = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        try {
        const sr = await fetch(`${CONFIG.api}/column-division-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ dividend: question.dividend, divisor: question.divisor, solve: true })
        })
        const sd = await sr.json()
        setQuotientInputs(sd.quotientDigits.map(String))
        setProductInputs(sd.steps.map(s => String(s.product).split('')))
        setRemainderInputs(sd.steps.map(s => new Array(Math.max(String(s.remainder).length, 1)).fill(String(s.remainder).padStart(Math.max(String(s.remainder).length, 1), '0'))))
        setIsCorrect(false); setRevealed(true)
        setSolutionSteps(sd.solutionSteps || null)
        setFeedback(sd.explanation || `Solved \u2014 ${question.dividend} \u00f7 ${question.divisor} = ${question.answer}`)
        setResults(prev => [...prev, { question: `${question.dividend} \u00f7 ${question.divisor}`, userAnswer: '\u2014', correct: false, correctAnswer: question.answer, time: timer.elapsed, userCarries: '\u2014', correctCarries: question.quotientDigits.join('') }])
        } catch (e) {
        console.error('Solve failed:', e)
        setQuotientInputs(question.quotientDigits.map(String))
        setProductInputs(question.steps.map(s => String(s.product).split('')))
        setRemainderInputs(question.steps.map(s => new Array(Math.max(String(s.remainder).length, 1)).fill(String(s.remainder).padStart(Math.max(String(s.remainder).length, 1), '0'))))
        const fallbackSteps = question.steps.map((step, i) => ({
            stepNum: i + 1, partialDividend: step.current, divisor: question.divisor,
            quotientDigit: question.quotientDigits[i], product: step.product,
            difference: step.current - step.product, remainder: step.remainder,
            isLast: step.isLast, nextDigit: step.nextDigit,
        }))
        setSolutionSteps(fallbackSteps)
        setIsCorrect(false); setRevealed(true)
        setFeedback(`Solved \u2014 ${question.dividend} \u00f7 ${question.divisor} = ${question.answer}`)
        }
    }

    const advanceQuestion = () => {
        if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null }
        setRevealed(false); setIsCorrect(null); setFeedback(''); setSolutionSteps(null); setHoveredBorrow(null)
        setActiveBorrows(new Set()); setBorrowInputs({})
        setQuotientInputs([]); setProductInputs([]); setRemainderInputs([])
        if (questionNumber >= totalQ) { setFinished(true); timer.stop() }
        else { setQuestionNumber(qn => qn + 1); timer.reset(); timer.start(); fetchQuestion() }
    }

    const diffLabels = { easy: 'Easy (3\u00f71)', medium: 'Medium (4\u00f71)', hard: 'Hard (4\u00f72)', extrahard: 'XHard (5\u00f72)' }

    if (!started && !finished) {

    return (
        <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '28px', boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={onBack} style={{ position: 'absolute', top: '24px', left: '24px', background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '6px 14px', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>{'\u2190'} Home</button>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: 'var(--clr-text)', margin: '0 0 12px', lineHeight: 1.1 }}>Column Division</h1>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Paper-style long division with step-by-step work</p>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setShowHelp(h => !h)} style={{ background: showHelp ? 'var(--clr-input)' : 'transparent', border: '1px solid var(--clr-border)', borderRadius: '50px', padding: '6px 16px', color: 'var(--clr-accent)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{showHelp ? '\u2715 Close' : '? How to play'}</button>
            </div>

            {showHelp && (
                <div style={{ textAlign: 'left', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '28px 28px', marginBottom: '24px', maxWidth: '580px', margin: '0 auto 24px' }}>
                <h3 style={{ color: 'var(--clr-accent)', fontSize: '1.05rem', margin: '0 0 20px', fontFamily: 'Inter, sans-serif', fontWeight: 700, textAlign: 'center' }}>How Paper-Style Division Works</h3>
                {[
                    { n: 1, title: 'Divide', desc: 'Find how many times the divisor goes into the current digits. Write that digit above the line.' },
                    { n: 2, title: 'Multiply', desc: 'Multiply the divisor \u00d7 quotient digit. Write the product below the current digits.' },
                    { n: 3, title: 'Subtract & bring down', desc: 'Subtract to get the remainder. Bring down the next dividend digit beside it.' },
                    { n: 4, title: 'Repeat', desc: 'Repeat until all digits are used. The final remainder is what\u2019s left.' },
                ].map(({ n, title, desc }) => (
                    <div key={n} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{n}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>{title}</div>
                        <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}>{desc}</div>
                    </div>
                    </div>
                ))}
                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '14px', marginTop: '14px' }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>Fill in each row:</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                    <strong>Quotient</strong> above the line, <strong>products</strong> below the working digits, <strong>remainders</strong> after each subtraction. Tab advances to the next field.
                    </div>
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

    const digitStyle = (isRight, isWrong, big) => ({
        width: COL, height: big ? 44 : 38, textAlign: 'center', fontSize: big ? '1.3rem' : '1.05rem', fontWeight: 700,
        background: isRight ? 'var(--clr-correct-bg)' : isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)',
        border: `2px solid ${isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-border)'}`,
        borderRadius: 8, color: isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)',
        fontFamily: '"Courier New", monospace', outline: 'none',
    })

    const renderBorrowRow = (rowKey, numCols) => {
        const hasAny = Array.from({ length: numCols }, (_, col) => activeBorrows.has(`${rowKey}-${col}`)).some(Boolean)
        const hasHover = Array.from({ length: numCols }, (_, col) => hoveredBorrow === `${rowKey}-${col}`).some(Boolean)
        if (!hasAny && !hasHover) return null
        return (
        <div style={{ display: 'flex', height: 32, alignItems: 'center' }}>
            <div style={{ width: BRACKET, flexShrink: 0 }} />
            {Array.from({ length: numCols }, (_, col) => {
            const key = `${rowKey}-${col}`
            const isActive = activeBorrows.has(key)
            const isHovered = hoveredBorrow === key
            const val = borrowInputs[key] || ''
            return (
                <div key={col} style={{ width: COL, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {(isActive || (isHovered && val)) ? (
                    <input ref={el => { borrowRefs.current[key] = el }}
                    type="text" maxLength={2} readOnly={revealed}
                    value={revealed ? val : val}
                    onChange={e => handleBorrowInput(rowKey, col, e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
                        e.preventDefault(); hideAllBorrows()
                        }
                    }}
                    style={{ width: COL - 4, height: 28, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, background: 'var(--clr-input)', border: '1.5px dashed var(--clr-accent)', borderRadius: 6, color: 'var(--clr-accent)', fontFamily: '"Courier New", monospace', outline: 'none', padding: 0 }}
                    />
                ) : null}
                </div>
            )
            })}
        </div>
        )
    }
    const numCols = question?.dividendDigits?.length || 0
    const qc = question?.firstQuotientCol ?? 0
    const steps = question?.steps || []


    return (

    <QuizLayout title="Column Division" onBack={onBack} timer={timer}>
        {started && !finished && <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
            </div>
            {loading || !question ? (
            <div className="question-box">Loading question\u2026</div>
            ) : (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '16px auto', fontFamily: '"Courier New", monospace', fontWeight: 700, maxWidth: 'fit-content' }}>

                    {/* === Quotient row === */}
                    <div style={{ display: 'flex', height: 44 }}>
                    <div style={{ width: BRACKET, flexShrink: 0 }} />
                    {Array.from({ length: numCols }, (_, col) => {
                        const qIdx = col - qc
                        if (qIdx >= 0 && qIdx < question.quotientDigits.length) {
                        const correctDigit = String(question.quotientDigits[qIdx])
                        const val = revealed ? correctDigit : (quotientInputs[qIdx] || '')
                        const isR = revealed && val === correctDigit
                        const isW = revealed && val !== correctDigit
                        return (
                            <input key={col} ref={el => quotientRefs.current[qIdx] = el} type="text" maxLength={1}
                            value={val}
                            onChange={e => handleQuotientInput(qIdx, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, 'quotient', qIdx, qIdx)}
                            disabled={revealed}
                            style={{ ...digitStyle(isR, isW, true), width: COL, flexShrink: 0 }}
                            />
                        )
                        }
                        return <span key={col} style={{ width: COL, flexShrink: 0 }} />
                    })}
                    </div>

                    {/* === Vinculum line === */}
                    <div style={{ display: 'flex', height: 6 }}>
                    <div style={{ width: BRACKET, flexShrink: 0 }} />
                    <div style={{ width: numCols * COL, height: 3, background: 'var(--clr-text)', borderRadius: 2, marginTop: 1 }} />
                    </div>

                    {/* === Borrow row above dividend === */}
                    {renderBorrowRow("d", numCols)}

                    {/* === Divisor bracket + dividend (clickable for borrow) === */}
                    <div style={{ display: 'flex', height: 44, alignItems: 'center' }}>
                    <div style={{ width: BRACKET, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, paddingRight: 4 }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--clr-text)' }}>{question.divisor}</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)', lineHeight: 1 }}>{')'}</span>
                    </div>
                    {question.dividendDigits.map((d, col) => {
                        const key = `d-${col}`
                        const struck = activeBorrows.has(key) || (revealed && borrowInputs[key])
                        return (
                        <span key={col}
                            onClick={() => { if (!revealed) activateBorrow('d', col, activeBorrows.has(key)) }}
                            onMouseEnter={() => { if (!activeBorrows.has(key) && borrowInputs[key]) setHoveredBorrow(key) }}
                            onMouseLeave={() => setHoveredBorrow(null)}
                            style={{
                            width: COL, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 700, fontFamily: '"Courier New", monospace',
                            color: struck ? 'var(--clr-text-soft)' : 'var(--clr-text)',
                            textDecoration: struck ? 'line-through' : 'none',
                            opacity: struck ? 0.5 : 1,
                            cursor: revealed ? 'default' : 'pointer',
                            transition: 'all 0.15s ease', position: 'relative',
                            }}>
                            {d}
                        </span>
                        )
                    })}
                    </div>

                    {/* === Steps: product, line, remainder === */}
                    {steps.map((step, j) => {
                    const prodStr = String(step.product)
                    const prodDigits = prodStr.split('')
                    const prodRightCol = qc + j
                    const prodLeftCol = prodRightCol - prodDigits.length + 1

                    const isLast = j === steps.length - 1
                    const remDigitCount = Math.max(String(step.remainder).length, 1)
                    const remRightCol = qc + j
                    const remStr = String(step.remainder).padStart(remDigitCount, '0')
                    const remLeftCol = remRightCol - remDigitCount + 1
                    const bdCol = isLast ? -1 : qc + j + 1

                    return (
                        <div key={j}>
                        {/* Minus + Product row (bottom number — no borrow above) */}
                        <div style={{ display: 'flex', height: 44, alignItems: 'center' }}>
                            <div style={{ width: BRACKET, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>{'\u2212'}</span>
                            </div>
                            {Array.from({ length: numCols }, (_, col) => {
                            if (col >= prodLeftCol && col <= prodRightCol) {
                                const dIdx = col - prodLeftCol
                                const correctDigit = prodDigits[dIdx]
                                const val = revealed ? correctDigit : (productInputs[j]?.[dIdx] || '')
                                const isR = revealed && val === correctDigit
                                const isW = revealed && val !== correctDigit
                                return (
                                <input key={col} ref={el => { if (!productRefs.current[j]) productRefs.current[j] = []; productRefs.current[j][dIdx] = el }}
                                    type="text" maxLength={1} value={val}
                                    onChange={e => handleProductInput(j, dIdx, e.target.value)}
                                    onKeyDown={e => handleKeyDown(e, 'product', j, dIdx)}
                                    disabled={revealed}
                                    style={{ ...digitStyle(isR, isW, false), width: COL, flexShrink: 0 }}
                                />
                                )
                            }
                            return <span key={col} style={{ width: COL, flexShrink: 0 }} />
                            })}
                        </div>

                        {/* Full-width separator line */}
                        <div style={{ display: 'flex', height: 6 }}>
                            <div style={{ width: BRACKET, flexShrink: 0 }} />
                            <div style={{ width: numCols * COL, height: 3, background: 'var(--clr-border)', borderRadius: 2, marginTop: 1 }} />
                        </div>

                        {/* Borrow row above remainder */}
                        {renderBorrowRow(`r${j}`, numCols)}

                        {/* Remainder row (user types) + brought-down digit (static) */}
                        <div style={{ display: 'flex', height: 44, alignItems: 'center' }}>
                            <div style={{ width: BRACKET, flexShrink: 0 }} />
                            {Array.from({ length: numCols }, (_, col) => {
                            if (col >= remLeftCol && col <= remRightCol) {
                                const dIdx = col - remLeftCol
                                const correctDigit = remStr[dIdx] || '0'
                                const val = revealed ? correctDigit : (remainderInputs[j]?.[dIdx] || '')
                                const isR = revealed && val === correctDigit
                                const isW = revealed && val !== correctDigit
                                return (
                                <input key={col} ref={el => { if (!remainderRefs.current[j]) remainderRefs.current[j] = []; remainderRefs.current[j][dIdx] = el }}
                                    type="text" maxLength={1} value={val}
                                    onChange={e => handleRemainderInput(j, dIdx, e.target.value)}
                                    onKeyDown={e => handleKeyDown(e, 'remainder', j, dIdx)}
                                    onDoubleClick={() => { if (!revealed) activateBorrow(`r${j}`, col, activeBorrows.has(`r${j}-${col}`)) }}
                                    disabled={revealed}
                                    style={{ ...digitStyle(isR, isW, false), width: COL, flexShrink: 0 }}
                                />
                                )
                            }
                            if (!isLast && col === bdCol) {
                                const bdDigit = question.dividendDigits[col]
                                const bdKey = `r${j}-${col}`
                                const bdStruck = activeBorrows.has(bdKey) || (revealed && borrowInputs[bdKey])
                                return <span key={col}
                                onClick={() => { if (!revealed) activateBorrow(`r${j}`, col, activeBorrows.has(bdKey)) }}
                                onMouseEnter={() => { if (!activeBorrows.has(bdKey) && borrowInputs[bdKey]) setHoveredBorrow(bdKey) }}
                                onMouseLeave={() => setHoveredBorrow(null)}
                                style={{ width: COL, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 700, fontFamily: '"Courier New", monospace', color: bdStruck ? 'var(--clr-text-soft)' : 'var(--clr-accent)', opacity: bdStruck ? 0.5 : 0.7, textDecoration: bdStruck ? 'line-through' : 'none', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s ease' }}>{bdDigit}</span>
                            }
                            return <span key={col} style={{ width: COL, flexShrink: 0 }} />
                            })}
                        </div>
                        </div>
                    )
                    })}
                </div>

                {feedback && (
                    <div style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: '8px', margin: '8px 0',
                    background: isCorrect ? 'rgba(92, 184, 122, 0.25)' : 'rgba(224, 90, 74, 0.25)',
                    color: isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                    fontWeight: 600, fontSize: '0.9rem',
                    whiteSpace: 'pre-line', lineHeight: '1.6',
                    border: isCorrect ? '2px solid var(--clr-correct)' : '2px solid var(--clr-wrong)'
                    }}>{feedback}</div>
                )}

                {/* Step-by-step solution panel */}
                {solutionSteps && solutionSteps.length > 0 && (
                    <div style={{
                    textAlign: 'left', borderRadius: '12px', margin: '8px 0',
                    background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)',
                    overflow: 'hidden'
                    }}>
                    <div style={{
                        padding: '10px 16px', fontWeight: 700, fontSize: '0.95rem',
                        color: 'var(--clr-text)', background: 'var(--clr-bg)',
                        borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>{'\ud83d\udcdd'}</span>
                        Step-by-Step Solution
                    </div>
                    <div style={{ padding: '8px 16px 12px' }}>
                        {solutionSteps.map((s, i) => (
                        <div key={i} style={{
                            padding: '10px 0',
                            borderBottom: i < solutionSteps.length - 1 ? '1px solid var(--clr-border)' : 'none'
                        }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--clr-accent)', marginBottom: 6 }}>
                            Step {s.stepNum}: {s.partialDividend} {'\u00f7'} {s.divisor}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.85rem', color: 'var(--clr-text)', fontFamily: '"Courier New", monospace', paddingLeft: 12 }}>
                            <div>
                                <span style={{ color: 'var(--clr-text-soft)' }}>{s.quotientDigit} {'\u00d7'} {s.divisor} = </span>
                                <span style={{ fontWeight: 700 }}>{s.product}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--clr-text-soft)' }}>{s.partialDividend} {'\u2212'} {s.product} = </span>
                                <span style={{ fontWeight: 700 }}>{s.difference}</span>
                            </div>
                            {!s.isLast && s.nextDigit !== null && (
                                <div style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
                                Bring down <span style={{ fontWeight: 700, color: 'var(--clr-accent)', fontStyle: 'normal' }}>{s.nextDigit}</span> {'\u2192'} {s.remainder * 10 + s.nextDigit}
                                </div>
                            )}
                            {s.isLast && (
                                <div style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
                                Remainder: <span style={{ fontWeight: 700, color: s.remainder > 0 ? 'var(--clr-accent)' : 'var(--clr-correct)', fontStyle: 'normal' }}>{s.remainder}</span>
                                </div>
                            )}
                            </div>
                        </div>
                        ))}
                        <div style={{
                        marginTop: 10, padding: '8px 12px', borderRadius: '8px',
                        background: 'var(--clr-bg)', fontWeight: 700, fontSize: '0.9rem',
                        color: 'var(--clr-text)', textAlign: 'center'
                        }}>
                        {question.dividend} {'\u00f7'} {question.divisor} = {question.answer}{question.steps[question.steps.length - 1]?.remainder > 0 ? ` R${question.steps[question.steps.length - 1].remainder}` : ''}
                        </div>
                    </div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                    {!revealed && <button onClick={handleSubmit} disabled={loading} style={{ background: 'var(--clr-accent)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Submit</button>}
                    {!revealed && <button onClick={handleSolve} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '10px 24px', color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Solve</button>}
                    {revealed && <button onClick={advanceQuestion} style={{ background: 'var(--clr-accent)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Next Question {'\u2192'}</button>}
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

export default ColumnDivision
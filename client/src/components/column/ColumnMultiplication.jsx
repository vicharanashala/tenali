//ColumnMultiplicationApp
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../../config'
import useTimer from '../../hooks/useTimer'
import { authGetToken } from '../../utils/authHelper'
import QuizLayout from '../layout/QuizLayout'
import ResultsTable from '../common/ResultsTable'


function ColumnMultiplication({ onBack, initialDifficulty, initialNumQuestions, initialStarted, isGoalMode = false }) {
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
    const [showHelp, setShowHelp] = useState(false)

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

    const [isMulti, setIsMulti] = useState(false)
    const [currentPP, setCurrentPP] = useState(0)
    const [ppInputs, setPpInputs] = useState([])
    const [ppCarryInputs, setPpCarryInputs] = useState([])
    const ppRefs = useRef([])
    const ppCarryRefs = useRef([])
    const [correctPPDigits, setCorrectPPDigits] = useState(null)
    const [correctPPCarries, setCorrectPPCarries] = useState(null)

    const COL = 36
    const GAP = 3
    const LEFT_MARGIN = 40

    const startQuiz = async () => {
        const q = Number(numQuestions) || CONFIG.DEFAULT_TOTAL
        setTotalQ(q); setScore(0); setQuestionNumber(1); setResults([])
        setFinished(false); setStarted(true); setFeedback(''); setIsCorrect(null); setRevealed(false)
        setCorrectAnswerDigits(null); setCorrectCarryDigits(null)
        setCorrectPPDigits(null); setCorrectPPCarries(null)
        setIsMulti(false); setCurrentPP(0); setPpInputs([]); setPpCarryInputs([])
        timer.reset(); timer.start()
        await fetchQuestion()
    }

    const fetchQuestion = async (diff) => {
        questionAbortRef.current?.abort()
        const controller = new AbortController()
        questionAbortRef.current = controller

        setLoading(true)
        try {
        const r = await fetch(`${CONFIG.api}/column-multiplication-api/question?difficulty=${diff || difficulty}`, { signal: controller.signal })
        const data = await r.json()
        setQuestion(data)
        const multi = !!data.multiDigitMultiplier
        setIsMulti(multi)

        setAnswerInputs(new Array(data.answerDigits.length).fill(''))
        setCorrectAnswerDigits(null); setCorrectCarryDigits(null)
        setCorrectPPDigits(null); setCorrectPPCarries(null)

        if (multi) {
            setCarryInputs([])
            setCurrentPP(0)
            setPpInputs(data.partialProducts.map(pp => pp.digits.map(d => d === null ? null : '')))
            setPpCarryInputs(data.partialProducts.map(pp => pp.carries.map(c => c === null ? null : '')))
            setTimeout(() => {
            for (let j = data.answerDigits.length - 1; j >= 0; j--) {
                if (ppCarryRefs.current[0]?.[j]) { ppCarryRefs.current[0][j].focus(); return }
            }
            }, 100)
        } else {
            setCarryInputs(new Array(data.carries.length).fill(''))
            setPpInputs([]); setPpCarryInputs([])
            setTimeout(() => {
            const lastIdx = data.answerDigits.length - 1
            if (answerRefs.current[lastIdx]) answerRefs.current[lastIdx].focus()
            }, 100)
        }
        } catch (e) {
        if (e.name === 'AbortError') return
        console.error('Fetch column multiplication question failed:', e)
        }
        setLoading(false)
    }

    const handleSingleInput = (idx, val, isCarry) => {
        if (revealed) return
        if (val !== '' && !/^\d{1,2}$/.test(val)) return
        const setter = isCarry ? setCarryInputs : setAnswerInputs
        const arr = isCarry ? carryInputs : answerInputs
        const next = [...arr]; next[idx] = val; setter(next)
        if (!val) return
        if (!isCarry && idx > 0 && carryRefs.current[idx - 1]) {
        carryRefs.current[idx - 1].focus()
        } else if (isCarry && answerRefs.current[idx]) {
        answerRefs.current[idx].focus()
        }
    }

    const handleMultiPpInput = (ppIdx, colIdx, val) => {
        if (revealed || ppIdx !== currentPP) return
        if (val !== '' && !/^\d{1,2}$/.test(val)) return
        const next = ppInputs.map(row => [...row])
        if (next[ppIdx][colIdx] === null) return
        next[ppIdx][colIdx] = val
        setPpInputs(next)
        if (!val) return
        const carries = question.partialProducts[ppIdx].carries
        const shift = question.bDigits.length - 1 - ppIdx
        const trailingCol = question.answerDigits.length - 1 - shift
        for (let j = colIdx - 1; j >= 0; j--) {
        if (carries[j] !== null && j !== trailingCol && ppCarryRefs.current[ppIdx]?.[j]) {
            ppCarryRefs.current[ppIdx][j].focus()
            return
        }
        }
        checkAndAdvancePP(next)
    }

    const checkAndAdvancePP = (updatedPPInputs) => {
        const pp = question.partialProducts
        const idx = currentPP
        const digits = pp[idx].digits
        const allFilled = digits.every((d, j) => d === null || (updatedPPInputs[idx][j] !== '' && updatedPPInputs[idx][j] !== null && updatedPPInputs[idx][j] !== undefined))
        if (!allFilled) return
        if (idx < pp.length - 1) {
        setTimeout(() => {
            setCurrentPP(idx + 1)
            setTimeout(() => {
            const ansLen = question.answerDigits.length
            for (let j = ansLen - 1; j >= 0; j--) {
                if (ppCarryRefs.current[idx + 1]?.[j]) { ppCarryRefs.current[idx + 1][j].focus(); return }
            }
            }, 50)
        }, 400)
        } else {
        setCurrentPP(pp.length)
        setTimeout(() => {
            const lastIdx = question.answerDigits.length - 1
            if (answerRefs.current[lastIdx]) answerRefs.current[lastIdx].focus()
        }, 100)
        }
    }

    const handleMultiPpCarryInput = (ppIdx, colIdx, val) => {
        if (revealed) return
        if (val !== '' && !/^\d{1,2}$/.test(val)) return
        const next = ppCarryInputs.map(row => [...row])
        if (next[ppIdx][colIdx] === null) return
        next[ppIdx][colIdx] = val
        setPpCarryInputs(next)
        if (!val) return
        const digits = question.partialProducts[ppIdx].digits
        if (digits[colIdx] !== null && ppRefs.current[ppIdx]?.[colIdx]) {
        ppRefs.current[ppIdx][colIdx].focus()
        return
        }
        const carries = question.partialProducts[ppIdx].carries
        const shift = question.bDigits.length - 1 - ppIdx
        const trailingCol = question.answerDigits.length - 1 - shift
        for (let j = colIdx - 1; j >= 0; j--) {
        if (carries[j] !== null && j !== trailingCol && ppCarryRefs.current[ppIdx]?.[j]) {
            ppCarryRefs.current[ppIdx][j].focus()
            return
        }
        }
    }

    const focusAnswer = (i) => { if (answerRefs.current[i]) answerRefs.current[i].focus() }
    const focusCarry = (i) => { if (carryRefs.current[i]) carryRefs.current[i].focus() }
    // const focusPp = (ppIdx, colIdx) => { if (ppRefs.current[ppIdx] && ppRefs.current[ppIdx][colIdx]) ppRefs.current[ppIdx][colIdx].focus() }
    // const focusPpCarry = (ppIdx, colIdx) => { if (ppCarryRefs.current[ppIdx] && ppCarryRefs.current[ppIdx][colIdx]) ppCarryRefs.current[ppIdx][colIdx].focus() }

    const handleSingleKeyDown = (idx, e, isCarry) => {
        if (e.key === 'Backspace') {
        if (e.currentTarget.value) return
        e.preventDefault()
        if (!isCarry) {
            if (idx < carryInputs.length - 1 && carryRefs.current[idx]) carryRefs.current[idx].focus()
        } else {
            if (idx < answerInputs.length - 1 && answerRefs.current[idx + 1]) answerRefs.current[idx + 1].focus()
        }
        return
        }
        if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isCarry && idx < carryInputs.length - 1 && carryRefs.current[idx]) focusCarry(idx)
        else if (isCarry) focusAnswer(idx)
        return
        }
        if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (isCarry) focusAnswer(idx)
        else if (idx < carryInputs.length - 1 && carryRefs.current[idx]) focusCarry(idx)
        return
        }
        if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (!isCarry) { if (idx > 0) focusAnswer(idx - 1) }
        else { if (idx > 0) focusCarry(idx - 1); else if (idx === 0) focusAnswer(0) }
        return
        }
        if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (!isCarry) { if (idx < answerInputs.length - 1) focusAnswer(idx + 1) }
        else { if (idx < answerInputs.length - 1) focusAnswer(idx + 1) }
        return
        }
    }

    const handleMultiKeyDown = (e, { isCarry, isPp, ppIdx, colIdx }) => {
        if (revealed) return

        if (e.key === 'Backspace') {
        if (e.currentTarget.value) return
        e.preventDefault()
        if (isCarry) {
            for (let j = colIdx - 1; j >= 0; j--) {
            if (ppCarryRefs.current[ppIdx]?.[j]) { ppCarryRefs.current[ppIdx][j].focus(); return }
            }
        } else if (isPp) {
            for (let j = colIdx - 1; j >= 0; j--) {
            if (ppRefs.current[ppIdx]?.[j]) { ppRefs.current[ppIdx][j].focus(); return }
            }
            for (let j = question.answerDigits.length - 1; j >= 0; j--) {
            if (ppCarryRefs.current[ppIdx]?.[j]) { ppCarryRefs.current[ppIdx][j].focus(); return }
            }
        }
        return
        }
        if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (isCarry) {
            for (let j = colIdx - 1; j >= 0; j--) { if (ppCarryRefs.current[ppIdx]?.[j]) { ppCarryRefs.current[ppIdx][j].focus(); return } }
        } else if (isPp) {
            for (let j = colIdx - 1; j >= 0; j--) { if (ppRefs.current[ppIdx]?.[j]) { ppRefs.current[ppIdx][j].focus(); return } }
        }
        return
        }
        if (e.key === 'ArrowRight') {
        e.preventDefault()
        const max = question.answerDigits.length
        if (isCarry) {
            for (let j = colIdx + 1; j < max; j++) { if (ppCarryRefs.current[ppIdx]?.[j]) { ppCarryRefs.current[ppIdx][j].focus(); return } }
        } else if (isPp) {
            for (let j = colIdx + 1; j < max; j++) { if (ppRefs.current[ppIdx]?.[j]) { ppRefs.current[ppIdx][j].focus(); return } }
        }
        return
        }
        if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (isCarry) {
            if (ppRefs.current[ppIdx]?.[colIdx]) { ppRefs.current[ppIdx][colIdx].focus(); return }
        } else if (isPp) {
            if (currentPP >= question.partialProducts.length) {
            const lastIdx = question.answerDigits.length - 1
            if (answerRefs.current[lastIdx]) answerRefs.current[lastIdx].focus()
            }
        }
        return
        }
        if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (isPp) {
            if (ppCarryRefs.current[ppIdx]?.[colIdx]) { ppCarryRefs.current[ppIdx][colIdx].focus(); return }
        }
        return
        }
        if (e.key === 'Tab') {
        e.preventDefault()
        if (currentPP < question.partialProducts.length - 1) {
            const nextPP = currentPP + 1
            for (let j = question.answerDigits.length - 1; j >= 0; j--) {
            if (ppCarryRefs.current[nextPP]?.[j]) { ppCarryRefs.current[nextPP][j].focus(); return }
            }
        } else {
            const lastIdx = question.answerDigits.length - 1
            if (answerRefs.current[lastIdx]) answerRefs.current[lastIdx].focus()
        }
        }
    }

    const handleAnswerKeyDown = (idx, e) => {
        const ansLen = question.answerDigits.length
        if (e.key === 'Backspace') {
        if (e.currentTarget.value) return
        e.preventDefault()
        if (idx > 0) { focusAnswer(idx - 1); return }
        if (isMulti && question.partialProducts.length > 0) {
            const lastPp = question.partialProducts.length - 1
            for (let j = question.partialProducts[lastPp].digits.length - 1; j >= 0; j--) {
            if (ppRefs.current[lastPp] && ppRefs.current[lastPp][j]) { ppRefs.current[lastPp][j].focus(); return }
            }
        }
        return
        }
        if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (idx > 0) focusAnswer(idx - 1)
        return
        }
        if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (idx < ansLen - 1) focusAnswer(idx + 1)
        return
        }
        if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (isMulti && question.partialProducts.length > 0) {
            const lastPp = question.partialProducts.length - 1
            for (let j = question.partialProducts[lastPp].digits.length - 1; j >= 0; j--) {
            if (ppRefs.current[lastPp] && ppRefs.current[lastPp][j]) { ppRefs.current[lastPp][j].focus(); return }
            }
        }
        return
        }
        if (e.key === 'ArrowDown') {
        e.preventDefault()
        return
        }
    }

    const handleAnswerInput = (idx, val) => {
        if (revealed) return
        if (val !== '' && !/^\d{1,2}$/.test(val)) return
        const next = [...answerInputs]; next[idx] = val; setAnswerInputs(next)
        if (!val) return
        if (idx > 0) focusAnswer(idx - 1)
    }

    const handleSubmit = async () => {
        if (revealed || loading || !question) return
        if (isMulti && currentPP < (question.partialProducts?.length || 0)) {
        setFeedback('Complete all partial products before submitting.')
        return
        }
        timer.stop()
        try {
        let body
        if (isMulti) {
            const userAnswer = answerInputs.map(v => v === '' ? null : Number(v))
            const userPartialProducts = ppInputs.map(row => row.map(v => v === '' || v === null ? null : Number(v)))
            const userCarries = ppCarryInputs.map(row => row.map(v => v === '' || v === null ? null : Number(v)))
            body = JSON.stringify({ a: question.a, b: question.b, userAnswer, userPartialProducts, userCarries, sessionGoal })
        } else {
            const userAnswer = answerInputs.map(v => v === '' ? null : Number(v))
            const userCarries = carryInputs.map(v => v === '' ? '' : v)
            body = JSON.stringify({ a: question.a, b: question.b, userAnswer, userCarries, sessionGoal })
        }
        const r = await fetch(`${CONFIG.api}/column-multiplication-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body
        })
        const data = await r.json()
        setCorrectAnswerDigits(data.answerDigits)
        if (isMulti) {
            setCorrectCarryDigits(null)
            setCorrectPPDigits(data.partialProducts ? data.partialProducts.map(pp => pp.digits) : null)
            setCorrectPPCarries(data.partialProducts ? data.partialProducts.map(pp => pp.carries) : null)
        } else {
            setCorrectCarryDigits(data.correctCarries)
            setCorrectPPDigits(null); setCorrectPPCarries(null)
        }
        setIsCorrect(data.correct); setRevealed(true)
        let explanation = ''
        try {
            const sr = await fetch(`${CONFIG.api}/column-multiplication-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer: [], userCarries: [], userPartialProducts: [], solve: true })
            })
            const sd = await sr.json()
            explanation = sd.explanation || ''
        } catch (e) {
            console.error(e.stack)
        }
        const resultLine = data.correct ? '✓ Correct!' : `✗ ${data.message || 'Incorrect'}`
        setFeedback(explanation ? `${resultLine}\n\n— Step-by-step solution —\n${explanation}` : resultLine)
        const ansVal = isMulti ? Number(answerInputs.filter(v => v !== '' && v !== null).join('') || '') : Number(answerInputs.filter(v => v !== null).join('')) || ''
        let userCarriesStr = '—', correctCarriesStr = '—'
        if (isMulti) {
            const uc = ppCarryInputs.flat().filter(v => v !== '' && v !== null)
            const cc = data.partialProducts ? data.partialProducts.flatMap(pp => (pp.carries || []).filter(v => v !== null && v !== 0)) : []
            userCarriesStr = uc.length ? uc.join(', ') : '—'
            correctCarriesStr = cc.length ? cc.join(', ') : '—'
        } else {
            userCarriesStr = carryInputs.filter(v => v !== '').join(', ') || '—'
            correctCarriesStr = (data.correctCarries || []).filter(v => v !== 0 && v !== null && v !== '').join(', ') || '—'
        }
        setResults(prev => [...prev, { question: `${question.a} × ${question.b}`, userAnswer: ansVal, correct: data.correct, correctAnswer: data.correctAnswer, time: timer.elapsed, userCarries: userCarriesStr, correctCarries: correctCarriesStr }])
        if (data.correct) setScore(s => s + 1)
        } catch (e) { console.error('Check failed:', e); setFeedback('Error checking answer') }
    }

    const handleSolve = async () => {
        if (revealed || loading || !question) return
        timer.stop()
        try {
        const r = await fetch(`${CONFIG.api}/column-multiplication-api/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authGetToken() ? `Bearer ${authGetToken()}` : '' },
            body: JSON.stringify({ a: question.a, b: question.b, userAnswer: [], userCarries: [], userPartialProducts: [], solve: true })
        })
        const data = await r.json()
        setCorrectAnswerDigits(data.answerDigits)
        setIsCorrect(false); setRevealed(true)
        setAnswerInputs(data.answerDigits ? data.answerDigits.map(String) : question.answerDigits.map(String))
        if (isMulti) {
            setCorrectCarryDigits(null)
            const correctPP = data.partialProducts ? data.partialProducts.map(pp => pp.digits) : (question.partialProducts || []).map(pp => pp.digits)
            const correctPC = data.partialProducts ? data.partialProducts.map(pp => pp.carries) : (question.partialProducts || []).map(pp => pp.carries)
            setCorrectPPDigits(correctPP)
            setCorrectPPCarries(correctPC)
            const filledPP = correctPP.map(row => row.map(d => d === null ? null : String(d)))
            const filledPC = correctPC.map(row => row.map(c => c === null ? null : String(c)))
            setPpInputs(filledPP)
            setPpCarryInputs(filledPC)
            setCarryInputs([])
        } else {
            setCorrectCarryDigits(data.correctCarries || question.carries)
            setCorrectPPDigits(null); setCorrectPPCarries(null)
            setCarryInputs((data.correctCarries || question.carries).map(String))
            setPpInputs([]); setPpCarryInputs([])
        }
        setFeedback(data.explanation || (isMulti ? 'Solved — study the partial products and carries.' : 'Solved — study the carries above each column.'))
        const solveCC = isMulti
            ? (data.partialProducts ? data.partialProducts.flatMap(pp => (pp.carries || []).filter(v => v !== null && v !== 0)) : []).join(', ') || '—'
            : (data.correctCarries || []).filter(v => v !== 0 && v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} × ${question.b}`, userAnswer: data.correctAnswer, correct: false, correctAnswer: data.correctAnswer, time: timer.elapsed, userCarries: '—', correctCarries: solveCC }])
        } catch (e) {
        console.error('Solve failed:', e)
        setCorrectAnswerDigits(question.answerDigits)
        setIsCorrect(false); setRevealed(true)
        setAnswerInputs(question.answerDigits.map(String))
        if (isMulti && question.partialProducts) {
            setCorrectPPDigits(question.partialProducts.map(pp => pp.digits))
            setCorrectPPCarries(question.partialProducts.map(pp => pp.carries))
            setPpInputs(question.partialProducts.map(pp => pp.digits.map(d => d === null ? null : String(d))))
            setPpCarryInputs(question.partialProducts.map(pp => pp.carries.map(c => c === null ? null : String(c))))
        } else {
            setCorrectCarryDigits(question.carries)
            setCarryInputs(question.carries.map(String))
        }
        setFeedback(isMulti ? 'Solved — study the partial products and carries.' : 'Solved — study the carries above each column.')
        const fallbackCC = isMulti
            ? (question.partialProducts || []).flatMap(pp => (pp.carries || []).filter(v => v !== null && v !== 0)).join(', ') || '—'
            : (question.carries || []).filter(v => v !== 0 && v !== null && v !== '').join(', ') || '—'
        setResults(prev => [...prev, { question: `${question.a} × ${question.b}`, userAnswer: question.answer, correct: false, correctAnswer: question.answer, time: timer.elapsed, userCarries: '—', correctCarries: fallbackCC }])
        }
    }

    const advanceQuestion = () => {
        if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null }
        setRevealed(false); setIsCorrect(null); setFeedback(''); setAnswerInputs([]); setCarryInputs([])
        setCorrectAnswerDigits(null); setCorrectCarryDigits(null)
        setCorrectPPDigits(null); setCorrectPPCarries(null)
        setIsMulti(false); setCurrentPP(0); setPpInputs([]); setPpCarryInputs([])
        if (questionNumber >= totalQ) { setFinished(true); timer.stop() }
        else { setQuestionNumber(qn => qn + 1); timer.reset(); timer.start(); fetchQuestion() }
    }

    const diffLabels = {
        easy: 'Easy — 1 × 1 digit',
        medium: 'Medium — 1 × 2 digits',
        hard: 'Hard — 2 × 2 digits',
        extrahard: 'Extra Hard — 3×3 / 4×3 digits'
    }

    const inputStyle = (isRight, isWrong) => ({
        width: `${COL}px`, height: '38px', textAlign: 'center', fontSize: '1rem', fontWeight: 700,
        background: isRight ? 'var(--clr-correct-bg)' : isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)',
        border: `2px solid ${isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-border)'}`,
        borderRadius: '8px', color: isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)',
        fontFamily: '"Courier New", monospace', outline: 'none'
    })

    if (!started && !finished) {
        return (
        <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '28px', boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={onBack} style={{ position: 'absolute', top: '24px', left: '24px', background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '6px 14px', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>← Home</button>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: 'var(--clr-text)', margin: '0 0 12px', lineHeight: 1.1 }}>Column Multiplication</h1>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Multiply vertically with carrying</p>

            {/* Help toggle */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setShowHelp(h => !h)} style={{ background: showHelp ? 'var(--clr-input)' : 'transparent', border: '1px solid var(--clr-border)', borderRadius: '50px', padding: '6px 16px', color: 'var(--clr-accent)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>{showHelp ? '✕ Close' : '? How to play'}</button>
            </div>

            {showHelp && (
                <div style={{ textAlign: 'left', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '28px 28px', marginBottom: '24px', maxWidth: '580px', margin: '0 auto 24px' }}>
                <h3 style={{ color: 'var(--clr-accent)', fontSize: '1.05rem', margin: '0 0 20px', fontFamily: 'Inter, sans-serif', fontWeight: 700, textAlign: 'center' }}>How Column Multiplication Works</h3>

                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>1</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Multiply by the rightmost digit first</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', marginBottom: '10px' }}>Take the <strong style={{ color: 'var(--clr-accent)' }}>rightmost digit</strong> of the multiplier and multiply it by each digit of the top number. Write carries above and products below the line.</div>
                    <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 16px', fontFamily: '"Courier New", monospace', fontSize: '1.1rem', fontWeight: 700, lineHeight: '1.6', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--clr-accent)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Step 1: multiply by 9</div>
                        <div>31</div>
                        <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>× <span style={{ color: 'var(--clr-accent)', border: '1.5px solid var(--clr-accent)', borderRadius: '4px', padding: '0 3px' }}>4</span>9</div>
                        <div style={{ width: '60px', height: '2px', background: 'var(--clr-border)', margin: '4px auto' }} />
                        <div style={{ color: 'var(--clr-accent)' }}>_ _</div>
                    </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>2</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Move to the next digit (shift left)</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', marginBottom: '10px' }}>Multiply by the <strong style={{ color: 'var(--clr-text)' }}>next digit</strong> to the left. The result shifts one place to the left. The app highlights which digit you're working on.</div>
                    <div style={{ background: 'var(--clr-card)', borderRadius: '10px', padding: '14px 16px', fontFamily: '"Courier New", monospace', fontSize: '1.1rem', fontWeight: 700, lineHeight: '1.6', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--clr-text)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Step 2: multiply by 4</div>
                        <div>31</div>
                        <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>× <span style={{ color: 'var(--clr-text)', border: '1.5px solid var(--clr-text)', borderRadius: '4px', padding: '0 3px' }}>4</span>9</div>
                        <div style={{ width: '60px', height: '2px', background: 'var(--clr-border)', margin: '4px auto' }} />
                        <div>2 7 9</div>
                        <div style={{ color: 'var(--clr-accent)' }}>1 2 4 _</div>
                    </div>
                    </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-accent)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>3</div>
                    <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Add all partial products for the final answer</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}>After all partial products are entered, add them up to get the final answer. Work right to left, carrying as needed.</div>
                    </div>
                </div>

                {/* Keyboard shortcuts */}
                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '14px', marginTop: '14px' }}>
                    <div style={{ color: 'var(--clr-text)', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>Keyboard shortcuts:</div>
                    <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                    <strong>↑ / ↓</strong> — move between carry and digit rows &nbsp;&nbsp;
                    <strong>← / →</strong> — move between columns &nbsp;&nbsp;
                    <strong>Tab</strong> — jump to next partial product<br />
                    <strong>Backspace</strong> — clear and move back
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

    const ansLen = question ? question.answerDigits.length : 1

    const pp = question?.partialProducts || []
    const allDone = currentPP >= pp.length
    const padCount = question ? ansLen - question.aDigits.length : 0
    const paddedADigits = question ? [...Array(Math.max(0, padCount)).fill(null), ...question.aDigits] : []
    const bPadCount = question ? ansLen - (question.bDigits ? question.bDigits.length : 0) : 0
    const paddedBDigits = question ? [...Array(Math.max(0, bPadCount)).fill(null), ...(question.bDigits || [])] : []
    const shift = allDone ? 0 : currentPP
    const trailingCol = allDone ? -1 : ansLen - 1 - shift

    const isPpRight = (ppIdx, j) => {
        if (!revealed || !correctPPDigits) return false
        const correct = correctPPDigits[ppIdx][j]
        if (correct === null || correct === undefined) return false
        const user = ppInputs[ppIdx] && ppInputs[ppIdx][j]
        return user !== null && user !== undefined && String(user) === String(correct)
    }
    const isPpWrong = (ppIdx, j) => {
        if (!revealed || !correctPPDigits) return false
        const correct = correctPPDigits[ppIdx][j]
        if (correct === null || correct === undefined) return false
        const user = ppInputs[ppIdx] && ppInputs[ppIdx][j]
        return (user !== null && user !== undefined && user !== '' && String(user) !== String(correct))
    }
    const ppCorrectVal = (ppIdx, j) => {
        if (!revealed || !correctPPDigits) return ''
        const v = correctPPDigits[ppIdx][j]
        return v !== null && v !== undefined ? String(v) : ''
    }

    const emptyCell = (key) => <div key={key} style={{ width: `${COL}px` }} />
    const rowGap = { display: 'flex', gap: `${GAP}px` }
    const labelSpan = <span style={{ width: `${LEFT_MARGIN}px` }} />
    const labelX = <span style={{ width: `${LEFT_MARGIN}px`, textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '1.4rem' }}>×</span>
    const digitDisplay = (d, i, extra) => (
        <div key={i} style={{ width: `${COL}px`, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text)', fontSize: '1.4rem', ...extra }}>
            {d !== null ? d : ''}
        </div>
    )

    return (
        <QuizLayout title="Column Multiplication" onBack={onBack} timer={timer}>
        {started && !finished && <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
            </div>
            {loading || !question ? <div className="question-box">Loading question…</div> : (
            <>
                {isMulti ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0', fontFamily: '"Courier New", monospace', fontWeight: 700 }}>
                {/* Carry row above multiplicand (currentPP only) */}
                {!allDone && (
                    <div style={{ ...rowGap, marginBottom: '2px' }}>
                        {labelSpan}
                        {paddedADigits.map((_, m) => {
                            const carryCol = m - shift
                            const carries = pp[currentPP].carries
                            if (carryCol < 0 || carryCol >= carries.length || carries[carryCol] === null || carryCol === trailingCol) {
                                return emptyCell(m)
                            }
                            const val = revealed
                                ? (correctPPCarries && correctPPCarries[currentPP] && correctPPCarries[currentPP][carryCol] != null ? String(correctPPCarries[currentPP][carryCol]) : '')
                                : (ppCarryInputs[currentPP] && ppCarryInputs[currentPP][carryCol]) || ''
                            return (
                                <div key={m} style={{ width: `${COL}px` }}>
                                    <input
                                        ref={el => { if (!ppCarryRefs.current[currentPP]) ppCarryRefs.current[currentPP] = []; ppCarryRefs.current[currentPP][carryCol] = el }}
                                        type="text" inputMode="numeric" maxLength={2}
                                        value={val}
                                        onChange={e => handleMultiPpCarryInput(currentPP, carryCol, e.target.value)}
                                        onKeyDown={e => handleMultiKeyDown(e, { isCarry: true, ppIdx: currentPP, colIdx: carryCol })}
                                        disabled={revealed}
                                        style={{ width: `${COL}px`, height: '38px', textAlign: 'center', fontSize: '1rem', fontWeight: 700,
                                            background: 'var(--clr-input)', border: '2px solid var(--clr-border)', borderRadius: '8px',
                                            color: 'var(--clr-text)', fontFamily: '"Courier New", monospace', outline: 'none' }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Multiplicand row */}
                <div style={{ ...rowGap, marginBottom: '2px' }}>
                    {labelSpan}
                    {paddedADigits.map((d, i) => digitDisplay(d, i))}
                </div>

                {/* Multiplier row */}
                <div style={{ ...rowGap, marginBottom: '4px' }}>
                    {labelX}
                    {paddedBDigits.map((d, i) => {
                        const activeMIdx = !allDone && d !== null && (paddedBDigits.length - 1 - i) === currentPP
                        return (
                            <div key={i} style={{ width: `${COL}px`, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeMIdx ? 'var(--clr-accent)' : 'var(--clr-text)', fontSize: '1.4rem', fontWeight: activeMIdx ? 900 : 700, background: activeMIdx ? 'var(--clr-accent-bg, rgba(79,140,255,0.12))' : 'transparent', borderRadius: activeMIdx ? '6px' : '0', border: activeMIdx ? '1.5px solid var(--clr-accent)' : 'none' }}>
                                {d !== null ? d : ''}
                            </div>
                        )
                    })}
                </div>

                {/* Step progress + operation hint */}
                {!allDone && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 6px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                            {pp.map((_, i) => (
                                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < currentPP ? 'var(--clr-correct)' : i === currentPP ? 'var(--clr-accent)' : 'var(--clr-border)', transition: 'background 0.3s' }} />
                            ))}
                            <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, marginLeft: '4px' }}>Step {currentPP + 1} of {pp.length}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--clr-accent)', fontFamily: '"Courier New", monospace', fontWeight: 700, background: 'var(--clr-accent-bg, rgba(79,140,255,0.08))', padding: '4px 14px', borderRadius: '8px', border: '1px solid var(--clr-accent)', opacity: 0.9 }}>
                            Now: {pp[currentPP].multiplierDigit} × {question.a} = ?
                        </div>
                    </div>
                )}

                {/* Separator line */}
                <div style={rowGap}>
                    {labelSpan}
                    <div style={{ width: `${ansLen * (COL + GAP) - GAP}px`, height: '3px', background: 'var(--clr-border)', borderRadius: '2px' }} />
                </div>

                {/* Partial products */}
                {pp.map((ppRow, idx) => {
                    if (idx > currentPP && !allDone) return null
                    const isActive = idx === currentPP && !allDone
                    const isDone = idx < currentPP

                    return (
                        <div key={idx} style={{ ...rowGap, marginTop: '6px', padding: isDone ? '2px 4px' : isActive ? '2px 4px' : '0', borderRadius: '8px', background: isDone ? 'var(--clr-correct-bg)' : 'transparent', borderLeft: isActive ? '3px solid var(--clr-accent)' : 'none' }}>
                            <span style={{ width: `${LEFT_MARGIN}px`, textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '1.4rem' }}>+</span>
                            {ppRow.digits.map((d, j) => {
                                if (d === null) return emptyCell(j)
                                if (isDone) {
                                    const val = ppInputs[idx]?.[j] ?? ''
                                    return <div key={j} style={{ width: `${COL}px`, height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--clr-correct)' }}>{val}</div>
                                }
                                const isRight = isPpRight(idx, j)
                                const isWrong = isPpWrong(idx, j)
                                const shown = revealed ? ppCorrectVal(idx, j) : (ppInputs[idx] && ppInputs[idx][j]) || ''
                                return (
                                    <div key={j} style={{ width: `${COL}px` }}>
                                        <input
                                            ref={el => { if (!ppRefs.current[idx]) ppRefs.current[idx] = []; ppRefs.current[idx][j] = el }}
                                            type="text" inputMode="numeric" maxLength={1}
                                            value={shown}
                                            onChange={e => handleMultiPpInput(idx, j, e.target.value)}
                                            onKeyDown={e => handleMultiKeyDown(e, { isPp: true, ppIdx: idx, colIdx: j })}
                                            disabled={revealed}
                                            style={{ width: `${COL}px`, height: '38px', textAlign: 'center', fontSize: '1rem', fontWeight: 700,
                                                background: isRight ? 'var(--clr-correct-bg)' : isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)',
                                                border: `2px solid ${isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-border)'}`,
                                                borderRadius: '8px', color: isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)',
                                                fontFamily: '"Courier New", monospace', outline: 'none' }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}

                {/* Separator line before answer — always visible */}
                <div style={{ ...rowGap, marginTop: '6px' }}>
                    {labelSpan}
                    <div style={{ width: `${ansLen * (COL + GAP) - GAP}px`, height: '3px', background: 'var(--clr-border)', borderRadius: '2px' }} />
                </div>

                {/* Answer row */}
                <div style={{ ...rowGap, marginTop: '8px' }}>
                    {labelSpan}
                    {question.answerDigits.map((d, i) => {
                        const correctDigit = revealed && correctAnswerDigits ? String(correctAnswerDigits[i]) : ''
                        const isRight = revealed && correctDigit !== '' && String(answerInputs[i] || '') === correctDigit
                        const isWrong = revealed && correctDigit !== '' && !isRight
                        const shown = revealed ? correctDigit : answerInputs[i] || ''
                        return (
                            <input key={i} ref={el => answerRefs.current[i] = el} type="text" maxLength={1} value={shown}
                                onChange={e => handleAnswerInput(i, e.target.value)}
                                onKeyDown={e => handleAnswerKeyDown(i, e)}
                                disabled={revealed || !allDone}
                                style={Object.assign({ width: COL + 'px', height: '42px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
                                    background: isRight ? 'var(--clr-correct-bg)' : isWrong ? 'var(--clr-wrong-bg)' : 'var(--clr-input)',
                                    borderRadius: '8px', color: isRight ? 'var(--clr-correct)' : isWrong ? 'var(--clr-wrong)' : 'var(--clr-text)',
                                    fontFamily: '"Courier New", monospace', outline: 'none', opacity: allDone ? 1 : 0.5 },
                                    isRight ? { border: '2px solid var(--clr-correct)' } : isWrong ? { border: '2px solid var(--clr-wrong)' } : { border: '2px solid var(--clr-border)' })}
                            />
                        )
                    })}
                </div>
            </div>
                ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', fontFamily: '"Courier New", monospace', fontSize: '1.8rem', fontWeight: 700 }}>
                <div style={{ display: 'flex', gap: `${GAP}px`, marginBottom: '4px' }}>
                    <span style={{ width: `${LEFT_MARGIN}px` }} />
                    {question.carries.map((c, i) => {
                        if (i === question.carries.length - 1) return <span key={i} style={{ width: `${COL}px` }} />
                        const correct = revealed && correctCarryDigits ? String(correctCarryDigits[i]) : ''
                        const isRight = revealed && correct !== '' && String(carryInputs[i] || '') === correct
                        const isWrong = revealed && correct !== '' && !isRight
                        const shown = revealed ? correct : carryInputs[i] || ''
                        return (
                            <input key={i} ref={el => carryRefs.current[i] = el} type="text" maxLength={1}
                                value={shown}
                                onChange={e => handleSingleInput(i, e.target.value, true)}
                                onKeyDown={e => handleSingleKeyDown(i, e, true)}
                                disabled={revealed}
                                style={inputStyle(isRight, isWrong)}
                            />
                        )
                    })}
                </div>
                <div style={{ display: 'flex', gap: `${GAP}px`, marginBottom: '2px' }}>
                    <span style={{ width: `${LEFT_MARGIN}px` }} />
                    {question.aDigits.map((d, i) => (
                        <span key={i} style={{ width: `${COL}px`, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text)', fontSize: '1.4rem' }}>{d !== null ? d : ''}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: `${GAP}px`, marginBottom: '4px' }}>
                    <span style={{ width: `${LEFT_MARGIN}px`, textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '1.4rem' }}>×</span>
                    {question.aDigits.map((_, i) => (
                        <span key={i} style={{ width: `${COL}px`, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === question.aDigits.length - 1 ? 'var(--clr-text)' : 'transparent', fontSize: '1.4rem' }}>{i === question.aDigits.length - 1 ? question.b : ''}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: `${GAP}px` }}>
                    <span style={{ width: `${LEFT_MARGIN}px` }} />
                    <div style={{ width: `${ansLen * (COL + GAP) - GAP}px`, height: '3px', background: 'var(--clr-border)', borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', gap: `${GAP}px`, marginTop: '8px' }}>
                    <span style={{ width: `${LEFT_MARGIN}px` }} />
                    {question.answerDigits.map((d, i) => {
                        const correctDigit = revealed && correctAnswerDigits ? String(correctAnswerDigits[i]) : ''
                        const isRight = revealed && correctDigit !== '' && String(answerInputs[i] || '') === correctDigit
                        const isWrong = revealed && correctDigit !== '' && !isRight
                        const shown = revealed ? correctDigit : answerInputs[i] || ''
                        return (
                            <input key={i} ref={el => answerRefs.current[i] = el} type="text" maxLength={1}
                                value={shown}
                                onChange={e => handleAnswerInput(i, e.target.value)}
                                onKeyDown={e => handleAnswerKeyDown(i, e)}
                                disabled={revealed}
                                style={{ ...inputStyle(isRight, isWrong), width: `${COL}px`, height: '42px', fontSize: '1.4rem' }}
                            />
                        )
                    })}
                </div>
            </div>
                )}
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

export default ColumnMultiplication

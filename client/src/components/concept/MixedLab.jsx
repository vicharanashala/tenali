import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from "../../config";
import { useAutoAdvance, useProgressSubmit, useTimer } from "../../hooks";

import Feedback from "../Feedback";
import QuizLayout from "../QuizLayout";

const endpoints = {
    'visual-math-lab-redux': `/api/visual-math-lab-redux`,
    'mensuration-lab': `/api/mensuration-lab`,
    addition: `/addition-api`,
}

//MixedLabApp
function MixedLab({ onBack, selectedActivities, initialDifficulty, initialNumQuestions }) {
    const title = 'Visual Learning Universe'
    const subtitle = 'Mixed activity quiz'
    const [ difficulty ] = useState(initialDifficulty || 'easy')
    const [numQuestions, setNumQuestions] = useState(initialNumQuestions || '5')
    const [started, setStarted] = useState(true)
    const [finished, setFinished] = useState(false)
    const [question, setQuestion] = useState(null)
    const [answer, setAnswer] = useState('')
    const [score, setScore] = useState(0)
    const [questionNumber, setQuestionNumber] = useState(0)
    const [totalQ, setTotalQ] = useState(Number(initialNumQuestions) || 5)
    const [feedback, setFeedback] = useState('')
    const [isCorrect, setIsCorrect] = useState(null)
    const [loading, setLoading] = useState(false)
    const [revealed, setRevealed] = useState(false)
    const [results, setResults] = useState([])
    const timer = useTimer()

    const [additionMode, setAdditionMode] = useState('counting') // 'counting' or 'scale'
    const [sourceItems, setSourceItems] = useState([])
    const [targetItems, setTargetItems] = useState([])
    const [rightBlocks, setRightBlocks] = useState([])
    const [bankBlocks, setBankBlocks] = useState([])

    const handleDragStart = (e, item, sourceZone) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ item, sourceZone }))
        e.currentTarget.classList.add('dragging')
    }

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging')
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDropCounting = (e, targetZone) => {
        e.preventDefault()
        if (revealed) return
        try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'))
        if (data.sourceZone === targetZone) return
        const { item, sourceZone } = data

        if (sourceZone === 'source' && targetZone === 'target') {
            setSourceItems(prev => prev.filter(i => i.id !== item.id))
            setTargetItems(prev => [...prev, item])
        } else if (sourceZone === 'target' && targetZone === 'source') {
            setTargetItems(prev => prev.filter(i => i.id !== item.id))
            setSourceItems(prev => [...prev, item])
        }
        } catch (err) { 
            console.error("MixedLab::Error in handleDropCounting:", err)
        }
    }

    const handleDropScale = (e, targetZone) => {
        e.preventDefault()
        if (revealed) return
        try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'))
        if (data.sourceZone === targetZone) return
        const { item, sourceZone } = data

        if (sourceZone === 'bank' && targetZone === 'right') {
            setBankBlocks(prev => prev.filter(i => i.id !== item.id))
            setRightBlocks(prev => [...prev, item])
        } else if (sourceZone === 'right' && targetZone === 'bank') {
            setRightBlocks(prev => prev.filter(i => i.id !== item.id))
            setBankBlocks(prev => [...prev, item])
        }
        } catch (err) { 
            console.error("MixedLab::Error in handleDropScale:", err)
        }
    }

    const seenIdsRef = useRef(new Set())
    const countsRef = useRef(selectedActivities.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
    const fetchingRef = useRef(false)
    // Prefetch cache: holds the next question already fetched in background
    const prefetchRef = useRef(null)

    // Relative paths only — the `${API}` base is applied once at each fetch site
    // (below). Including it here too caused a double `/summership` prefix under
    // subpath deploys, so requests 404'd to index.html and broke question loading.
    

    const chooseActivityKey = useCallback(() => {
        if (selectedActivities.length === 1) return selectedActivities[0]
        const keys = [...selectedActivities]
        keys.sort((a, b) => (countsRef.current[a] || 0) - (countsRef.current[b] || 0))
        const minCount = countsRef.current[keys[0]]
        const candidates = keys.filter(k => (countsRef.current[k] || 0) === minCount)
        return candidates[Math.floor(Math.random() * candidates.length)]
    }, [selectedActivities])


    const fetchQuestionFromActivity = useCallback(async (activityKey) => {
        try {
        if (activityKey === 'addition') {
            // Decide mode here so numbers can be generated with mode-correct limits
            const mode = Math.random() > 0.5 ? 'counting' : 'scale'
            let a, b
            if (mode === 'counting') {
            // Counting apples — keep sum small so it's visually manageable
            //   easy: 2–12, medium: 15–35, hard: 15–50
            const maxSum = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 35 : 12
            const minSum = difficulty === 'medium' || difficulty === 'hard' ? 15 : 2
            const total = Math.floor(Math.random() * (maxSum - minSum + 1)) + minSum
            a = Math.floor(Math.random() * (total - 1)) + 1
            b = total - a
            } else {
            // Balance scale — numbers can go up to 1499
            const maxVal = difficulty === 'hard' ? 1499 : difficulty === 'medium' ? 499 : 49
            a = Math.floor(Math.random() * maxVal) + 1
            b = Math.floor(Math.random() * maxVal) + 1
            }
            const total = a + b
            const id = `add-${a}-${b}-${Date.now()}`
            return { id, a, b, answer: String(total), activityKey, additionMode: mode }
        }
        const res = await fetch(`${CONFIG.api}${endpoints[activityKey]}/generate?difficulty=${difficulty}`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        return { ...data, activityKey }
        } catch (err) {
        console.error(`Error in fetchQuestionFromActivity for ${activityKey}:`, err)
        return null
        }
    }, [difficulty])


    const customGenerate = useCallback(async () => {
        const maxAttempts = 12
        let questionData = null

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const activityKey = chooseActivityKey()
        const candidate = await fetchQuestionFromActivity(activityKey)
        if (!candidate || !candidate.id) continue
        if (seenIdsRef.current.has(candidate.id)) continue
        seenIdsRef.current.add(candidate.id)
        countsRef.current[activityKey] = (countsRef.current[activityKey] || 0) + 1
        questionData = candidate
        break
        }

        if (!questionData) {
        const activityKey = selectedActivities[Math.floor(Math.random() * selectedActivities.length)]
        const candidate = await fetchQuestionFromActivity(activityKey)
        if (candidate && candidate.id) {
            seenIdsRef.current.add(candidate.id)
            countsRef.current[activityKey] = (countsRef.current[activityKey] || 0) + 1
            questionData = candidate
        }
        }

        return questionData
    }, [selectedActivities, seenIdsRef, countsRef, chooseActivityKey, fetchQuestionFromActivity])

    const customCheck = useCallback(async ({ question: q, finalAns, solve }) => {
        const endpoint = endpoints[q.activityKey] || '/addition-api'
        if (q.activityKey === 'addition') {
        // Check locally — answer is simply a + b
        const correct = solve ? false : Number(finalAns) === Number(q.a) + Number(q.b)
        const solution = `${q.a} + ${q.b} = ${Number(q.a) + Number(q.b)}`
        const correctAnswer = String(Number(q.a) + Number(q.b))
        return { correct, solution, correctAnswer }
        }
        const res = await fetch(`${CONFIG.api}${endpoint}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerOption: solve ? '' : finalAns, expected: q.answer, solve: solve || false })
        })
        return res.json()
    }, [])


    const startQuiz = () => {
        const count = Math.max(1, Math.min(20, Number(numQuestions) || 5))
        setTotalQ(count)
        setStarted(true)
        setFinished(false)
        setScore(0)
        setQuestionNumber(0)
        setResults([])
        seenIdsRef.current = new Set()
        countsRef.current = selectedActivities.reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
        fetchingRef.current = false
        prefetchRef.current = null
    }

    const fetchQuestion = useCallback(async () => {
        if (fetchingRef.current) return
        fetchingRef.current = true
        if (questionNumber >= totalQ) {
        fetchingRef.current = false
        setFinished(true)
        timer.reset()
        return
        }
        setLoading(true)
        setFeedback('')
        setAnswer('')
        setRevealed(false)
        setIsCorrect(null)
        try {
        // Use prefetched question if available, otherwise fetch now
        let data = prefetchRef.current
        prefetchRef.current = null
        if (!data) {
            data = await customGenerate()
        }
        
        // Fallback if no question generated
        if (!data) {
            throw new Error("No question data returned from generation");
        }
        
        setQuestion(data)
        if (data.activityKey === 'addition') {
            // Mode was decided at generation time so numbers already match it
            const mode = data.additionMode || 'counting';
            setAdditionMode(mode);
            const targetTotal = Number(data.a) + Number(data.b);
            if (mode === 'counting') {
            // Give a few extra apples beyond the exact answer (so it's not an obvious count-all)
            // but never go beyond difficulty caps
            const extra = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
            const totalApples = targetTotal + extra;
            const initialItems = Array.from({ length: totalApples }, (_, i) => ({ id: `apple-${i}`, icon: '🍎' }));
            setSourceItems(initialItems);
            setTargetItems([]);
            } else {
            let initBank = [];
            if (difficulty === 'easy') {
                if (targetTotal >= 10) {
                const numTens = Math.floor(targetTotal / 10) + 2;
                const numOnes = Math.max(12, (targetTotal % 10) + 5);
                for (let i = 0; i < numTens; i++) {
                    initBank.push({ id: `bank-10-${i}-${Math.random()}`, val: 10 });
                }
                for (let i = 0; i < numOnes; i++) {
                    initBank.push({ id: `bank-1-${i}-${Math.random()}`, val: 1 });
                }
                } else {
                initBank = Array.from({ length: Math.max(15, targetTotal + 2) }, (_, i) => ({ id: `bank-1-${i}-${Math.random()}`, val: 1 }));
                }
            } else {
                const denominations = difficulty === 'medium'
                ? [50, 10, 5, 1]
                : [500, 100, 50, 10, 5, 1];
                let remainder = targetTotal;
                denominations.forEach(denomination => {
                const needed = Math.floor(remainder / denomination);
                remainder %= denomination;
                for (let i = 0; i < needed + 2; i++) {
                    initBank.push({
                    id: `bank-${denomination}-${i}-${Math.random()}`,
                    val: denomination
                    });
                }
                });
            }
            setBankBlocks(initBank);
            setRightBlocks([]);
            }
        }
        setQuestionNumber(n => n + 1)
        } catch (err) {
        console.error("Error fetching question in MathLab:", err)
        // Fallback: Generate a local addition question so the quiz doesn't freeze
        const fallbackA = Math.floor(Math.random() * (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 15 : 8)) + 2;
        const fallbackB = Math.floor(Math.random() * (difficulty === 'hard' ? 20 : difficulty === 'medium' ? 10 : 5)) + 1;
        const total = fallbackA + fallbackB;
        const fallbackData = {
            id: `fallback-add-${fallbackA}-${fallbackB}-${Date.now()}`,
            a: fallbackA,
            b: fallbackB,
            answer: String(total),
            activityKey: 'addition',
            additionMode: 'counting',
            prompt: `What is ${fallbackA} + ${fallbackB}?`
        }
        setQuestion(fallbackData)
        setAdditionMode('counting')
        const totalApples = total + (difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6);
        setSourceItems(Array.from({ length: totalApples }, (_, i) => ({ id: `apple-${i}`, icon: '🍎' })));
        setTargetItems([]);
        setQuestionNumber(n => n + 1)
        } finally {
        setLoading(false)
        fetchingRef.current = false
        timer.start()
        }
        // Silently prefetch the next question in the background
        customGenerate().then(next => { if (next) prefetchRef.current = next }).catch(() => { })
    }, [customGenerate, questionNumber, totalQ, timer, difficulty])

    useEffect(() => {
        if (started && !finished && questionNumber === 0) {
        const timeoutId = setTimeout(() => fetchQuestion(), 0)
        return () => clearTimeout(timeoutId)
        }
    }, [started, finished, questionNumber, fetchQuestion])

    const formatMathLabAnswer = (qObj, ans) => {
        if (!qObj) return ans
        if (qObj.activityKey === 'addition') {
        return `${qObj.a} + ${qObj.b} = ${ans}`
        }
        if (qObj.activityKey === 'visual-math-lab-redux') {
        switch (qObj.template) {
            case 'plant_arrays': return `${qObj.rows} × ${qObj.cols} = ${ans}`
            case 'frog_jumps': return `${qObj.jumps} × ${qObj.step} = ${ans}`
            case 'candy_sharing': return `${qObj.total} ÷ ${qObj.boxes} = ${ans}`
            case 'equal_groups': return `${qObj.groups} × ${qObj.itemsPerGroup} = ${ans}`
            case 'picture_multi': return `${qObj.n} × ${qObj.count} = ${ans}`
            case 'math_machine': return `${qObj.input} × ${qObj.multiplier} = ${ans}`
            default: return ans
        }
        }
        if (qObj.activityKey === 'mensuration-lab') {
        if (qObj.template === 'area_grid') {
            return `${qObj.w} × ${qObj.h} = ${ans}`
        }
        if (qObj.template === 'perimeter_blocks') {
            return `2 × (${qObj.w} + ${qObj.h}) = ${ans}`
        }
        }
        return ans
    }

    const submitAns = async (optAns) => {
        if (!question || revealed) return
        let finalAns = optAns !== undefined ? optAns : answer
        if (question.activityKey === 'addition') {
        if (additionMode === 'counting') {
            finalAns = String(targetItems.length)
        } else if (additionMode === 'scale') {
            const rightTotal = rightBlocks.reduce((acc, b) => acc + b.val, 0)
            finalAns = String(rightTotal)
        }
        }
        const timeTaken = timer.stop()
        setAnswer(finalAns)
        const data = await customCheck({ question, finalAns, solve: false })
        setIsCorrect(data.correct)
        if (data.correct) setScore(s => s + 1)
        const ansString = formatMathLabAnswer(question, data.correctAnswer)
        const explanationText = question.hint ? ` (${question.hint})` : ''
        setFeedback(data.correct
        ? `Correct! The answer is ${ansString}.${explanationText}`
        : `Incorrect. The correct answer is ${ansString}.${explanationText}`
        )
        setResults(prev => [...prev, {
        question: question.activityKey === 'addition'
            ? (question.additionMode === 'counting'
            ? `🍎 What is ${question.a} + ${question.b}?`
            : `⚖️ What is ${question.a} + ${question.b}?`)
            : question.prompt,
        userAnswer: String(finalAns),
        correctAnswer: String(ansString),
        correct: data.correct,
        time: timeTaken
        }])
        setRevealed(true)
    }

    const handleSolve = async () => {
        if (revealed || !question) return
        const timeTaken = timer.stop()
        const data = await customCheck({ question, finalAns: '', solve: true })
        setIsCorrect(false)
        const ansString = formatMathLabAnswer(question, data.correctAnswer)
        setFeedback(`Solution: ${ansString}`)
        setResults(prev => [...prev, {
        question: question.activityKey === 'addition'
            ? (question.additionMode === 'counting'
            ? `🍎 What is ${question.a} + ${question.b}?`
            : `⚖️ What is ${question.a} + ${question.b}?`)
            : question.prompt,
        userAnswer: '—',
        correctAnswer: String(ansString),
        correct: false,
        time: timeTaken
        }])
        if (question.activityKey === 'addition') {
        if (additionMode === 'counting') {
            const totalNeeded = Number(data.correctAnswer)
            const allApples = [...sourceItems, ...targetItems]
            setTargetItems(allApples.slice(0, totalNeeded))
            setSourceItems(allApples.slice(totalNeeded))
        } else if (additionMode === 'scale') {
            let remainder = Number(data.correctAnswer)
            let correctBlocks = []
            let blockId = 0
            const denom = difficulty === 'easy' ? [1] : (difficulty === 'medium' ? [50, 10, 5, 1] : [500, 100, 50, 10, 5, 1])
            for (const d of denom) {
            const count = Math.floor(remainder / d)
            for (let k = 0; k < count; k++) {
                correctBlocks.push({ id: `solve-block-${d}-${blockId++}`, val: d })
            }
            remainder %= d
            }
            setRightBlocks(correctBlocks)
            setBankBlocks([])
        }
        }
        setRevealed(true)
    }

    const handleSubmitOrNext = () => {
        if (!revealed) {
        submitAns()
        } else {
        fetchQuestion()
        }
    }

    const advanceRef = useRef(null)
    useEffect(() => {
        advanceRef.current = () => fetchQuestion()
    }, [fetchQuestion])
    useAutoAdvance(revealed, advanceRef, isCorrect, false)
    useProgressSubmit(revealed, isCorrect, 'mixed-math-lab', question?.id)

    const renderMensurationCustom = (q, ans, setAns, submitAns, revealed) => {
        // ── COUNT SIDES / SHAPE NAME ──────────────────────────────────────────
        if (q.template === 'count_sides' || q.template === 'shape_name') {
        const sides = q.sides;
        const color = q.color || '#FF6B6B';
        const pts = Array.from({ length: sides }).map((_, i) => {
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
            return `${50 + 40 * Math.cos(angle)},${50 + 40 * Math.sin(angle)}`;
        }).join(' ');
        return (
            <div className="men-canvas">
            <div className="men-shape-wrapper">
                <svg viewBox="0 0 100 100" className="men-shape-svg">
                <defs>
                    <linearGradient id={`sg${sides}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <polygon points={pts} fill={`url(#sg${sides})`} stroke="white" strokeWidth="3" />
                {Array.from({ length: sides }).map((_, i) => {
                    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
                    return <circle key={i} cx={50 + 40 * Math.cos(angle)} cy={50 + 40 * Math.sin(angle)} r="3.5" fill="white" opacity="0.9" />;
                })}
                </svg>
            </div>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── AREA GRID (interactive tap-to-count) ─────────────────────────────
        if (q.template === 'area_grid') {
        const counted = (typeof ans === 'string' && ans.startsWith('[')) ? JSON.parse(ans) : []; const setCounted = (updater) => { const next = typeof updater === 'function' ? updater(counted) : updater; setAns(JSON.stringify(next)); };

        const allCount = q.w * q.h;
        const handleCellClick = (idx) => {
            if (revealed) return;
            setCounted(prev => {
            const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
            if (next.length === allCount) setTimeout(() => setAns(String(allCount)), 100);
            return next;
            });
        };
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '16px' }}>
            <p className="men-canvas-tip">👆 Tap each square to count it!</p>
            <div className="men-grid-wrap" style={{ gridTemplateColumns: `repeat(${q.w}, 1fr)` }}>
                {Array.from({ length: allCount }).map((_, i) => (
                <div key={i}
                    className={`men-grid-cell ${counted.includes(i) ? 'counted' : ''} ${revealed ? 'revealed' : ''}`}
                    onClick={() => handleCellClick(i)}>
                    {(counted.includes(i) || revealed) ? '✓' : ''}
                </div>
                ))}
            </div>
            <div className="men-cell-count-pill">
                {revealed ? `✅ Area = ${q.answer} sq units` : `${counted.length} / ${allCount} counted`}
            </div>
            </div>
        );
        }

        // ── PERIMETER BLOCKS (animated walking dot) ───────────────────────────
        if (q.template === 'perimeter_blocks') {
        const cellPx = 44;
        const svgW = (q.w + 2) * cellPx;
        const svgH = (q.h + 2) * cellPx;
        const ox = cellPx; const oy = cellPx;
        const rw = q.w * cellPx; const rh = q.h * cellPx;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '16px' }}>
            <svg width={svgW} height={svgH} style={{ maxWidth: '100%' }}>
                <defs>
                <pattern id="gridP" width={cellPx} height={cellPx} patternUnits="userSpaceOnUse">
                    <path d={`M ${cellPx} 0 L 0 0 0 ${cellPx}`} fill="none" stroke="#E2E8F0" strokeWidth="1" />
                </pattern>
                </defs>
                <rect x={ox} y={oy} width={rw} height={rh} fill="url(#gridP)" />
                <rect x={ox} y={oy} width={rw} height={rh} fill="rgba(232,134,74,0.08)" stroke="#e8864a" strokeWidth="3" rx="4" />
                <text x={ox + rw / 2} y={oy - 10} textAnchor="middle" fill="#e8864a" fontWeight="bold" fontSize="14">{q.w} units</text>
                <text x={ox + rw + 16} y={oy + rh / 2 + 5} textAnchor="middle" fill="#e8864a" fontWeight="bold" fontSize="14"
                transform={`rotate(90 ${ox + rw + 16} ${oy + rh / 2 + 5})`}>{q.h} units</text>
                {revealed
                ? <rect x={ox} y={oy} width={rw} height={rh} fill="none" stroke="#48BB78" strokeWidth="4" rx="4" strokeDasharray="10 4" />
                : <circle r="7" fill="#FF7E67">
                    <animateMotion dur={`${(q.w + q.h) * 0.4}s`} repeatCount="indefinite"
                    path={`M ${ox},${oy} L ${ox + rw},${oy} L ${ox + rw},${oy + rh} L ${ox},${oy + rh} Z`} />
                </circle>
                }
            </svg>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── COMPARE AREA ──────────────────────────────────────────────────────
        if (q.template === 'compare_area') {
        const scale = 36;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {[q.shape1, q.shape2].map((sh, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{
                    width: `${sh.w * scale}px`, height: `${sh.h * scale}px`,
                    background: sh.color || '#FF7E67', opacity: 0.85, borderRadius: '10px',
                    boxShadow: `0 8px 20px ${sh.color || '#FF7E67'}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Quicksand'
                    }}>{sh.w}×{sh.h}</div>
                    <div style={{ marginTop: '10px', fontWeight: 800, fontSize: '1.4rem', color: sh.color, fontFamily: 'Quicksand' }}>Shape {sh.label}</div>
                    <div style={{ fontSize: '0.95rem', color: '#718096', fontFamily: 'Nunito' }}>
                    {revealed ? `Area = ${sh.w * sh.h}` : `${sh.w} × ${sh.h} = ?`}
                    </div>
                </div>
                ))}
            </div>
            <div className="men-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '440px' }}>
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && opt === q.answer && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── RECT VS SQUARE ────────────────────────────────────────────────────
        if (q.template === 'rect_vs_square') {
        const isSquare = q.w === q.h;
        const scale = Math.min(45, 200 / Math.max(q.w, q.h));
        const rw = q.w * scale; const rh = q.h * scale;
        const ox = (280 - rw) / 2; const oy = (220 - rh) / 2;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width="280" height="220" style={{ overflow: 'visible' }}>
                <defs>
                <linearGradient id="rectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6D365" /><stop offset="100%" stopColor="#FDA085" />
                </linearGradient>
                </defs>
                <rect x={ox} y={oy} width={rw} height={rh} fill="url(#rectGrad)" rx="8" className="men-rect-pulse" />
                <text x={ox + rw / 2} y={oy - 12} textAnchor="middle" fill="#E2E8F0" fontWeight="bold" fontSize="18">{q.w}</text>
                <text x={ox + rw + 16} y={oy + rh / 2 + 6} textAnchor="middle" fill="#E2E8F0" fontWeight="bold" fontSize="18">{q.h}</text>
                {isSquare && [
                `M ${ox + 8} ${oy} L ${ox + 8} ${oy + 8} L ${ox} ${oy + 8}`,
                `M ${ox + rw - 8} ${oy} L ${ox + rw - 8} ${oy + 8} L ${ox + rw} ${oy + 8}`,
                `M ${ox + rw - 8} ${oy + rh} L ${ox + rw - 8} ${oy + rh - 8} L ${ox + rw} ${oy + rh - 8}`,
                `M ${ox + 8} ${oy + rh} L ${ox + 8} ${oy + rh - 8} L ${ox} ${oy + rh - 8}`
                ].map((d, i) => <path key={i} d={d} fill="none" stroke="white" strokeWidth="2" />)}
            </svg>
            <div className="men-options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '340px' }}>
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt === 'Square' ? '⬛' : '▬'} {opt}
                    {revealed && opt === q.answer && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── TRIANGLE AREA ──────────────────────────────────────────────────────
        if (q.template === 'triangle_area') {
        const scale = Math.min(45, 200 / Math.max(q.base, q.height));
        const bPx = q.base * scale; const hPx = q.height * scale;
        const svgW = bPx + 80; const svgH = hPx + 70;
        const ox = 40; const oy = 30;
        const pts = `${ox},${oy + hPx} ${ox + bPx / 2},${oy} ${ox + bPx},${oy + hPx}`;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width={svgW} height={svgH} style={{ maxWidth: '100%', overflow: 'visible' }}>
                <defs>
                <linearGradient id="triGrd" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6D365" /><stop offset="100%" stopColor="#FDA085" />
                </linearGradient>
                </defs>
                <polygon points={pts} fill="url(#triGrd)" stroke="white" strokeWidth="3" className="men-rect-pulse" />
                <line x1={ox + bPx / 2} y1={oy} x2={ox + bPx / 2} y2={oy + hPx} stroke="#2D2520" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.85" />
                <path d={`M ${ox + bPx / 2 - 7} ${oy + hPx} L ${ox + bPx / 2 - 7} ${oy + hPx - 7} L ${ox + bPx / 2} ${oy + hPx - 7}`} fill="none" stroke="#2D2520" strokeWidth="1.5" opacity="0.85" />
                {/* Height Label Pill */}
                <rect x={ox + bPx / 2 + 8} y={oy + hPx / 2 - 12} width="52" height="22" rx="6" fill="#2D2520" stroke="#4A4038" strokeWidth="1.5" />
                <text x={ox + bPx / 2 + 34} y={oy + hPx / 2 + 4} textAnchor="middle" fill="#F4F1ED" fontWeight="bold" fontSize="13">h={q.height}</text>
                {/* Base Label Pill */}
                <rect x={ox + bPx / 2 - 38} y={oy + hPx + 14} width="76" height="22" rx="6" fill="#2D2520" stroke="#4A4038" strokeWidth="1.5" />
                <text x={ox + bPx / 2} y={oy + hPx + 30} textAnchor="middle" fill="#F4F1ED" fontWeight="bold" fontSize="13">base={q.base}</text>
            </svg>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── ANGLE TYPE ─────────────────────────────────────────────────────────
        if (q.template === 'angle_type') {
        const deg = q.degrees;
        const rad = (deg * Math.PI) / 180;
        const r = 90; const cx = 110; const cy = 120;
        const x2 = cx + r * Math.cos(-rad); const y2 = cy + r * Math.sin(-rad);
        const arcR = 50;
        const ax = cx + arcR * Math.cos(-rad); const ay = cy + arcR * Math.sin(-rad);
        const largeArc = deg > 180 ? 1 : 0;
        const arcColor = deg < 90 ? '#48BB78' : deg === 90 ? '#4ECDC4' : '#FF7E67';
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width="220" height="160" style={{ overflow: 'visible' }}>
                <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#988D84" strokeWidth="4.5" strokeLinecap="round" />
                <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#F08C46" strokeWidth="4.5" strokeLinecap="round" />
                <path d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax} ${ay}`} fill="none" stroke={arcColor} strokeWidth="5" />
                <text x={cx + arcR + 20} y={cy - 16} fill={arcColor} fontWeight="bold" fontSize="28">{deg}°</text>
                {deg === 90 && <rect x={cx} y={cy - 20} width="20" height="20" fill="none" stroke="#4ECDC4" strokeWidth="3" />}
                <circle cx={cx} cy={cy} r="5" fill="#2D3748" />
            </svg>
            <div className="men-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '400px' }}>
                {q.options?.map(opt => {
                const icons = { Acute: '🔺', Right: '📐', Obtuse: '🔻' };
                return (
                    <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {icons[opt]} {opt}{revealed && opt === q.answer && <span className="men-correct-tick"> ✓</span>}
                    </button>
                );
                })}
            </div>
            </div>
        );
        }

        // ── CIRCLE ─────────────────────────────────────────────────────────────
        if (q.template === 'circle_q') {
        const r = q.radius;
        const rPx = Math.min(55, 160 / (r * 2 + 4)) * r;
        const cx = 110; const cy = 110;
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            <svg width="220" height="220" style={{ overflow: 'visible' }}>
                <defs>
                <radialGradient id="circGrd" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#ffaa7b" /><stop offset="100%" stopColor="#e8864a" />
                </radialGradient>
                </defs>
                <circle cx={cx} cy={cy} r={rPx} fill="url(#circGrd)" opacity="0.85" />
                <line x1={cx} y1={cy} x2={cx + rPx} y2={cy} stroke="white" strokeWidth="2.5" strokeDasharray="6 3" />
                <text x={cx + rPx / 2} y={cy - 8} textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">r={r}</text>
                <circle cx={cx} cy={cy} r="5" fill="white" />
                {q.subtype === 'circumference' &&
                <circle cx={cx} cy={cy} r={rPx + 8} fill="none" stroke="#FDA085" strokeWidth="3"
                    strokeDasharray="15 8" className="men-circle-spin" />}
            </svg>
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        // ── MISSING SIDE ───────────────────────────────────────────────────────
        if (q.template === 'missing_side') {
        return (
            <div className="men-canvas" style={{ flexDirection: 'column', gap: '20px' }}>
            {q.subtype === 'rect_missing' ? (
                <svg width="180" height="140" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="misGrd" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6D365" /><stop offset="100%" stopColor="#FDA085" />
                    </linearGradient>
                </defs>
                <rect x="20" y="20" width="140" height="100" fill="url(#misGrd)" rx="8" opacity="0.8" />
                <text x="90" y="75" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">Area={q.area}</text>
                <text x="90" y="12" textAnchor="middle" fill="#FF7E67" fontWeight="bold" fontSize="16">? units</text>
                {/* Rectangle Known Side Label */}
                <text x="172" y="75" textAnchor="middle" fill="#E2E8F0" fontWeight="bold" fontSize="16" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{q.knownSide}</text>
                </svg>
            ) : (
                <svg width="140" height="140" style={{ overflow: 'visible' }}>
                <rect x="20" y="20" width="100" height="100" fill="none" stroke="#e8864a" strokeWidth="3" strokeDasharray="8 4" rx="6" />
                {[['70', '12'], ['133', '75'], ['70', '133'], ['7', '75']].map(([x, y], i) => (
                    <g key={i}>
                    <circle cx={x} cy={parseInt(y) - 4} r="10" fill="#2D2520" stroke="#4A4038" strokeWidth="1" />
                    <text x={x} y={y} textAnchor="middle" fill="#FF7E67" fontWeight="bold" fontSize="13">?</text>
                    </g>
                ))}
                {/* Square Perimeter Label Pill */}
                <rect x="34" y="67" width="72" height="22" rx="6" fill="#2D2520" stroke="#4A4038" strokeWidth="1.5" />
                <text x="70" y="83" textAnchor="middle" fill="#F4F1ED" fontWeight="bold" fontSize="13">P={q.perim}</text>
                </svg>
            )}
            <div className="men-options-grid">
                {q.options?.map(opt => (
                <button key={opt} className={`men-choice-btn ${ans === opt ? 'selected' : ''}`}
                    onClick={() => !revealed && setAns(opt)} disabled={revealed}>
                    {opt}{revealed && String(opt) === String(q.answer) && <span className="men-correct-tick"> ✓</span>}
                </button>
                ))}
            </div>
            </div>
        );
        }

        return null;
    }

    const renderMixedQuestionContent = () => {
        if (!question || loading) return null;

        if (question.activityKey === 'mensuration-lab') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {renderMensurationCustom(question, answer, setAnswer, submitAns, revealed)}
            </div>
        );
        }

        if (question.activityKey === 'visual-math-lab-redux') {
        const props = { q: question, ans: answer, setAns: setAnswer, submitAns, revealed };
        let visualElement = null;
        if (question.template === 'frog_jumps') visualElement = <FrogJumpTemplate {...props} />;
        else if (question.template === 'math_machine') visualElement = <MathMachineTemplate {...props} />;
        else if (question.template === 'plant_arrays') visualElement = <PlantArrayTemplate {...props} />;
        else if (question.template === 'candy_sharing') visualElement = <CandySharingTemplate {...props} />;
        else if (question.template === 'equal_groups') visualElement = <EqualGroupsTemplate {...props} />;
        else if (question.template === 'picture_multi') visualElement = <PictureMultiTemplate {...props} />;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', padding: '15px 0' }}>
            {visualElement}
            <AnswerInput ans={answer} setAns={setAnswer} submitAns={submitAns}
                revealed={revealed} correctAnswer={formatMathLabAnswer(question, question.answer)} shake={false} options={question.options} />
            </div>
        );
        }

        if (question.activityKey === 'addition') {
        if (additionMode === 'counting') {
            return (
            <div className="dnd-container" style={{ margin: '15px 0', width: '100%' }}>
                <h3 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>
                Put {question.a} + {question.b} apples in the basket!
                </h3>

                <div
                className="dnd-source"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropCounting(e, 'source')}
                style={{ minHeight: '100px', padding: '15px', borderRadius: '10px' }}
                >
                {sourceItems.map(item => (
                    <div
                    key={item.id}
                    className="dnd-item"
                    draggable={!revealed}
                    onDragStart={(e) => handleDragStart(e, item, 'source')}
                    onDragEnd={handleDragEnd}
                    onClick={() => { if (!revealed) { setTargetItems(prev => [...prev, item]); setSourceItems(prev => prev.filter(i => i.id !== item.id)); } }}
                    style={{ fontSize: '2.2rem', width: '44px', height: '44px', cursor: revealed ? 'default' : 'pointer' }}
                    >
                    {item.icon}
                    </div>
                ))}
                </div>

                <div
                className="dnd-target"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropCounting(e, 'target')}
                style={{ minHeight: '120px', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--clr-accent)', marginBottom: '8px' }}>
                    🍎 Basket (Total: {targetItems.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {targetItems.map(item => (
                    <div
                        key={item.id}
                        className="dnd-item"
                        draggable={!revealed}
                        onDragStart={(e) => handleDragStart(e, item, 'target')}
                        onDragEnd={handleDragEnd}
                        onClick={() => !revealed && (setSourceItems(prev => [...prev, item]), setTargetItems(prev => prev.filter(i => i.id !== item.id)))}
                        style={{ fontSize: '2.2rem', width: '44px', height: '44px', cursor: revealed ? 'default' : 'pointer' }}
                    >
                        {item.icon}
                    </div>
                    ))}
                </div>
                </div>
            </div>
            );
        } else if (additionMode === 'scale') {
            const targetTotal = Number(question.a) + Number(question.b)
            const rTotal = rightBlocks.reduce((acc, b) => acc + b.val, 0)
            const diff = rTotal - targetTotal
            const scaleFactor = difficulty === 'easy' ? 3 : (difficulty === 'medium' ? 0.3 : 0.03)
            let rotation = diff * scaleFactor
            if (rotation > 20) rotation = 20
            if (rotation < -20) rotation = -20
            const panRotation = -rotation

            return (
            <div style={{ margin: '15px 0', width: '100%' }}>


                {/* ── Scale (tall container so blocks never overflow upward) ── */}
                <div className="scale-container" style={{ height: '360px', overflow: 'visible' }}>
                <div className="scale-beam" style={{ transform: `rotate(${rotation}deg)` }}>

                    <div className="scale-pan left" style={{ transform: `rotate(${panRotation}deg)`, height: '140px', width: '140px', overflow: 'visible' }}>
                    <div
                        className="weight-block"
                        style={{
                        background: '#34495e',
                        borderColor: '#2c3e50',
                        width: '56px',
                        height: '56px',
                        cursor: 'default',
                        borderRadius: '10px'
                        }}
                    >
                        {targetTotal}
                    </div>
                    </div>

                    <div
                    className="scale-pan right"
                    style={{
                        transform: `rotate(${panRotation}deg)`,
                        height: '140px',
                        width: rightBlocks.length > 12 ? '170px' : (rightBlocks.length > 8 ? '150px' : '140px'),
                        overflow: 'visible',
                        gap: rightBlocks.length > 12 ? '2px' : '4px',
                        padding: rightBlocks.length > 12 ? '6px' : '12px',
                        paddingBottom: rightBlocks.length > 12 ? '14px' : '20px'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropScale(e, 'right')}
                    >
                    {rightBlocks.map(b => {
                        const blockCount = rightBlocks.length;
                        let size = '32px';
                        if (blockCount > 12) {
                        size = '22px';
                        } else if (blockCount > 8) {
                        size = '26px';
                        }
                        const fontSize = blockCount > 12 ? '0.7rem' : (blockCount > 8 ? '0.8rem' : '0.95rem');
                        return (
                        <div
                            key={b.id}
                            className={`weight-block val-${b.val}`}
                            draggable={!revealed}
                            onDragStart={(e) => handleDragStart(e, b, 'right')}
                            onDragEnd={handleDragEnd}
                            onClick={() => !revealed && (setBankBlocks(prev => [...prev, b]), setRightBlocks(prev => prev.filter(x => x.id !== b.id)))}
                            style={{
                            width: size,
                            height: size,
                            fontSize: fontSize,
                            cursor: revealed ? 'default' : 'pointer',
                            borderRadius: blockCount > 8 ? '4px' : '8px'
                            }}
                        >
                            {b.val}
                        </div>
                        );
                    })}
                    </div>

                </div>
                <div className="scale-fulcrum" style={{ borderBottomWidth: '60px', borderLeftWidth: '35px', borderRightWidth: '35px' }}></div>
                </div>

                <div
                className="weight-bank"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropScale(e, 'bank')}
                style={{ padding: '15px', marginTop: '20px', minHeight: '80px', gap: '8px' }}
                >
                {bankBlocks.map(b => (
                    <div
                    key={b.id}
                    className={`weight-block val-${b.val}`}
                    draggable={!revealed}
                    onDragStart={(e) => handleDragStart(e, b, 'bank')}
                    onDragEnd={handleDragEnd}
                    onClick={() => !revealed && (setRightBlocks(prev => [...prev, b]), setBankBlocks(prev => prev.filter(x => x.id !== b.id)))}
                    style={{ width: b.val >= 100 ? '42px' : '32px', height: b.val >= 100 ? '42px' : '32px', fontSize: b.val >= 100 ? '0.85rem' : '0.95rem', cursor: revealed ? 'default' : 'pointer' }}
                    >
                    {b.val}
                    </div>
                ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '1rem', color: 'var(--clr-text)' }}>
                Right Side Total Weight: <strong>{rTotal}</strong>
                </div>
            </div>
            );
        }
        }

        return (
        <>
            {question.options && (
            <div className="emoji-container" style={{ gap: '15px' }}>
                {question.options.map(opt => (
                <button key={opt} className={`kid-btn-choice ${answer === String(opt) ? 'selected' : ''}`} onClick={() => !revealed && setAnswer(String(opt))} disabled={revealed}>
                    {opt}
                </button>
                ))}
            </div>
            )}
            {!question.options && (
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <input type="text" className="fun-input"
                value={answer} onChange={e => !revealed && setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmitOrNext(); }}
                placeholder="?" disabled={revealed} autoFocus />
            </div>
            )}
        </>
        );
    }

    return (
        <QuizLayout title={title} subtitle={subtitle} onBack={onBack} timer={started && !finished ? timer : null}>
        {!started && !finished && <div className="welcome-box">
            <p className="welcome-text">Start your mixed Visual Learning Universe quiz.</p>
            <div className="question-count-row">
            <label className="question-count-label">How many questions? (max 20)</label>
            <input className="answer-input question-count-input" type="text" value={numQuestions} onChange={e => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 20)) setNumQuestions(v) }} />
            </div>
            <div className="button-row"><button onClick={startQuiz}>Start Quiz</button></div>
        </div>}
        {started && !finished && <>
            <div className="progress-pill center">Question {questionNumber}/{totalQ}</div>
            <div className="question-box">{loading || !question ? 'Loading question…' : question.prompt}</div>
            {renderMixedQuestionContent()}
            <Feedback feedback={feedback} isCorrect={isCorrect} />
            <div className="button-row" style={{ marginTop: '30px' }}>
            {!revealed ? (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button className="kid-btn-primary" onClick={handleSolve} style={{ flex: 1, opacity: 0.75 }}>Show Answer</button>
                <button className="kid-btn-primary" onClick={() => submitAns()} disabled={loading || (question?.activityKey === 'addition' && additionMode === 'counting' && targetItems.length === 0) || (question?.activityKey === 'addition' && additionMode === 'scale' && rightBlocks.length === 0) || (question?.activityKey !== 'addition' && !answer && !question?.options)} style={{ flex: 1 }}>Submit</button>
                </div>
            ) : (
                <button className="kid-btn-primary" onClick={handleSubmitOrNext}>{questionNumber >= totalQ ? 'Finish Lab 🏁' : 'Next Question ➡️'}</button>
            )}
            </div>
            {results.length > 0 && <ResultsTable results={results} />}
        </>}
        {finished && <div className="welcome-box">
            <p className="welcome-text">Quiz complete.</p>
            <p className="final-score">Final score: {score}/{totalQ}</p>
            <ResultsTable results={results} />
            <button className="kid-btn-primary" style={{ marginTop: '20px' }} onClick={onBack}>Play Again</button>
        </div>}
        </QuizLayout>
    )
}

export default MixedLab;
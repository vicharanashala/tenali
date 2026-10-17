import { useCallback, useEffect, useRef, useState } from 'react';
// SuperTables1App

const MULS = [2, 3, 4, 5, 6, 7, 8, 9] // eligible multipliers in order

function SuperTables1() {
    // const shuffle = (arr) => {
    //     const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a;
    // }
    const genTable = (n) => Array.from({ length: 10 }, (_, i) => ({ multiplier: i + 1, expression: `${n} × ${i + 1}`, answer: n * (i + 1) }))

    // ── Session tracking (rolling window of last 10 correct attempts) ──
    const getStore = useCallback(() => { try { return JSON.parse(sessionStorage.getItem('st1_data') || '{}') } catch { return {} } }, [])
    const setStore = useCallback((d) => { sessionStorage.setItem('st1_data', JSON.stringify(d)) }, [])

    const recordCorrect = (tbl, mul, ms) => {
        const d = getStore(); const k = `${tbl}x${mul}`
        if (!d[k]) d[k] = { times: [], streak: 0 }
        d[k].times.push(ms)
        if (d[k].times.length > 10) d[k].times = d[k].times.slice(-10) // rolling window of 10
        d[k].streak = (d[k].streak || 0) + 1
        setStore(d)
    }
    const recordWrong = (tbl, mul) => {
        const d = getStore(); const k = `${tbl}x${mul}`
        if (!d[k]) d[k] = { times: [], streak: 0 }
        d[k].streak = 0 // reset streak on wrong
        setStore(d)
    }
    const getAvg = (tbl, mul) => {
        const d = getStore(); const k = `${tbl}x${mul}`
        const info = d[k]
        if (!info || info.times.length === 0) return null
        // trimmed mean: drop top/bottom 10%
        const sorted = [...info.times].sort((a, b) => a - b)
        if (sorted.length <= 2) return sorted.reduce((a, b) => a + b, 0) / sorted.length
        const trim = Math.max(1, Math.round(sorted.length * 0.1))
        const mid = sorted.slice(trim, sorted.length - trim)
        return mid.length > 0 ? mid.reduce((a, b) => a + b, 0) / mid.length : sorted[Math.floor(sorted.length / 2)]
    }
    const getStreak = useCallback(
        (tbl, mul) => {
            const d = getStore(); const k = `${tbl}x${mul}`
            return d[k] ? (d[k].streak || 0) : 0
        },
        [getStore]
    )
    // ── Sliding window: deterministic sequence, no randomness, no repeats possible ──
    // Window of 3 multipliers: [2,3,4] for 10 rounds, then [3,4,5], then [4,5,6]... wraps around
    
    const ROUNDS_PER_WINDOW = 10            // 10 questions per window of 3

    // Pre-build the ENTIRE sequence for a drill session
    const sequenceRef = useRef([])  // flat array of multipliers in order
    const seqIndexRef = useRef(-1)  // current position
    const [currentWindow, setCurrentWindow] = useState([]) // which 3 are active (for display)

    const buildFullSequence = useCallback(
        () => {
            const seq = []
            // const windowMeta = [] // track which window each question belongs to
            // Sliding windows: [2,3,4], [3,4,5], [4,5,6], ..., [8,9,2], [9,2,3], [2,3,4], ...
            // We'll build enough for a long session (e.g., 20 windows = 200 questions)
            for (let w = 0; w < 20; w++) {
            const startIdx = w % MULS.length
            const window = [
                MULS[startIdx % MULS.length],
                MULS[(startIdx + 1) % MULS.length],
                MULS[(startIdx + 2) % MULS.length],
            ]
            // 10 rounds cycling through the 3: a,b,c,a,b,c,a,b,c,a
            for (let r = 0; r < ROUNDS_PER_WINDOW; r++) {
                seq.push({ mul: window[r % 3], window: [...window] })
            }
            }
            return seq
        },
        [ROUNDS_PER_WINDOW]
    )

    const allStreak5 = useCallback(
        (tbl) => {
            for (let m = 1; m <= 10; m++) {
                if (getStreak(tbl, m) < 5) return false
            }
            return true
        },
        [getStreak]
    )

    // ── Styles (using Tenali CSS vars) ──
    const S = {
        page: { minHeight: '100vh', padding: '24px', fontFamily: 'var(--font-body, system-ui)', color: 'var(--clr-text)', background: 'var(--clr-bg)' },
        title: { fontSize: '2.5rem', fontWeight: 900, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--clr-text)' },
        subtitle: { fontSize: '1.1rem', color: 'var(--clr-text-soft)', marginBottom: 32 },
        card: { background: 'var(--clr-card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: '28px 24px', maxWidth: 620, margin: '0 auto', color: 'var(--clr-text)' },
        numGrid: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6, width: '100%', margin: '0 auto' },
        numBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', background: 'var(--clr-surface)', border: '2px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', transition: 'all var(--transition)', color: 'var(--clr-text)', fontFamily: 'var(--font-body)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
        btn: { border: 'none', borderRadius: 'var(--radius-sm)', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', transition: 'all var(--transition)', fontFamily: 'var(--font-body)' },
        btnPrimary: { background: 'var(--clr-accent)', color: '#fff' },
        input: { width: 120, textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, border: '2px solid var(--clr-accent)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', outline: 'none', background: 'var(--clr-input)', color: 'var(--clr-text)', fontFamily: 'var(--font-body)' },
        back: { background: 'none', border: 'none', color: 'var(--clr-accent)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', padding: 0, fontFamily: 'var(--font-body)' },
        th: { padding: '8px 6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent)', background: 'var(--clr-accent-soft)', border: '2px solid var(--clr-border)', whiteSpace: 'nowrap' },
        td: { padding: '8px 6px', textAlign: 'center', fontWeight: 800, fontSize: '1rem', border: '2px solid var(--clr-border)', background: 'var(--clr-card)', color: 'var(--clr-text)', whiteSpace: 'nowrap' },
        tdSlow: { padding: '8px 6px', textAlign: 'center', fontWeight: 800, fontSize: '1rem', border: '2px solid var(--clr-wrong)', background: 'var(--clr-wrong-bg)', color: 'var(--clr-wrong)', whiteSpace: 'nowrap' },
        thSlow: { padding: '8px 6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-wrong)', background: 'var(--clr-wrong-bg)', border: '2px solid var(--clr-wrong)', whiteSpace: 'nowrap' },
        fbOk: { marginTop: 16, padding: 16, borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'var(--clr-correct-bg)', border: '1px solid var(--clr-correct)' },
        fbNo: { marginTop: 16, padding: 16, borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'var(--clr-wrong-bg)', border: '1px solid var(--clr-wrong)' },
    }

    // ── State ──
    const [screen, setScreen] = useState('home') // home | drill | done
    const [tableNum, setTableNum] = useState(null)
    const [phase, setPhase] = useState(1) // 1 = with lookup, 2 = without
    const [currentMul, setCurrentMul] = useState(1)
    const [shuffledTable, setShuffledTable] = useState([])
    const [fb, setFb] = useState(null)
    const startTimeRef = useRef(() =>Date.now()) // ref, not state — always synchronous, no stale closures
    const [questionsAnswered, setQuestionsAnswered] = useState(0)
    const inputRef = useRef(null)

    const startDrill = (num) => {
        setTableNum(num)
        // clear previous data for this table to start fresh
        const d = getStore()
        for (let m = 1; m <= 10; m++) delete d[`${num}x${m}`]
        setStore(d)
        // Build deterministic sequence
        const fullSeq = buildFullSequence()
        sequenceRef.current = fullSeq
        seqIndexRef.current = 0
        setCurrentWindow(fullSeq[0].window)
        setPhase(1)
        setShuffledTable(genTable(num))
        setCurrentMul(fullSeq[0].mul)
        setFb(null)
        startTimeRef.current = () => Date.now()
        setQuestionsAnswered(0)
        setScreen('drill')
    }

    const goHome = () => { setScreen('home'); setTableNum(null) }

    const goPhase2 = () => {
        // Rebuild sequence for phase 2
        const fullSeq = buildFullSequence()
        sequenceRef.current = fullSeq
        seqIndexRef.current = 0
        setCurrentWindow(fullSeq[0].window)
        setPhase(2)
        setShuffledTable(genTable(tableNum))
        setFb(null)
        setCurrentMul(fullSeq[0].mul)
        startTimeRef.current = () => Date.now()
    }

    const advance = useCallback(
        () => {
            setFb(null)
            if (phase === 2 && allStreak5(tableNum)) {
            setScreen('done')
            return
            }
            // Simply advance the index — sequence is deterministic, no randomness
            let nextIdx = seqIndexRef.current + 1
            // If we've exhausted the sequence, rebuild (wraps around)
            if (nextIdx >= sequenceRef.current.length) {
            const fullSeq = buildFullSequence()
            sequenceRef.current = fullSeq
            nextIdx = 0
            }
            seqIndexRef.current = nextIdx
            const entry = sequenceRef.current[nextIdx]
            setCurrentWindow(entry.window)
            setCurrentMul(entry.mul)
            startTimeRef.current = () => Date.now()
        },
        [phase, tableNum, allStreak5, buildFullSequence]
    )

    const handleSubmit = (e) => {
        e.preventDefault()
        const val = parseInt(e.target.elements.ans.value, 10)
        if (isNaN(val)) return
        const correct = tableNum * currentMul
        const ok = val === correct
        const elapsed = Date.now() - startTimeRef.current // ref = always current, never stale
        if (ok) {
        recordCorrect(tableNum, currentMul, elapsed)
        } else {
        recordWrong(tableNum, currentMul)
        }
        setQuestionsAnswered(q => q + 1)
        setFb({ ok, correctAns: correct, elapsed })
        e.target.elements.ans.value = ''
    }

    // Focus management
    useEffect(() => { if (!fb && inputRef.current) inputRef.current.focus() }, [fb, currentMul])
    useEffect(() => {
        if (!fb || screen !== 'drill') return
        const handler = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopImmediatePropagation()
            advance()
        }
        }
        // Use capture phase so this fires FIRST and stops the button click from also firing advance
        window.addEventListener('keydown', handler, true)
        return () => window.removeEventListener('keydown', handler, true)
    }, [fb, screen, currentMul, phase, tableNum, questionsAnswered, advance])

    // ── Performance chart (same as SuperTables but using st1_data) ──
    const renderChart = () => {
        if (!tableNum) return null
        const bars = []
        let maxTime = 0
        for (let m = 1; m <= 10; m++) {
        const avg = getAvg(tableNum, m)
        const avgSec = avg !== null ? avg / 1000 : 0
        if (avgSec > maxTime) maxTime = avgSec
        bars.push({ m, avg: avgSec, streak: getStreak(tableNum, m) })
        }
        const hasData = bars.some(b => b.avg > 0)
        if (!hasData) return null
        // Fixed scale: always 10s max so bars shrink as you get faster
        maxTime = 10
        const chartH = 100
        const barW = `${100 / 10}%`
        const focused = new Set(currentWindow)
        return (
        <div style={{ marginTop: 20, padding: '12px 0 0' }}>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-soft)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Avg. Time (last 10 correct) — {phase === 1 ? 'Target: under 5s each' : 'Streak target: 5 each'}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', position: 'relative', height: chartH, margin: '0 4px', borderBottom: '2px solid var(--clr-border)', borderLeft: '2px solid var(--clr-border)' }}>
            <span style={{ position: 'absolute', left: -4, top: 0, fontSize: '0.55rem', color: 'var(--clr-text-soft)', transform: 'translateX(-100%)' }}>10s</span>
            <span style={{ position: 'absolute', left: -4, bottom: -2, fontSize: '0.55rem', color: 'var(--clr-text-soft)', transform: 'translateX(-100%)' }}>0s</span>
            {/* 5s threshold line */}
            {phase === 1 && maxTime > 5 && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(5 / maxTime) * chartH}px`, borderTop: '2px dashed var(--clr-correct)', opacity: 0.5 }}>
                <span style={{ position: 'absolute', right: 0, top: -14, fontSize: '0.55rem', color: 'var(--clr-correct)', fontWeight: 700 }}>5s</span>
                </div>
            )}
            {bars.map(b => {
                const h = b.avg > 0 ? Math.max((b.avg / maxTime) * chartH, 4) : 0
                const isSlow = focused.has(b.m)
                return (
                <div key={b.m} style={{ width: barW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', padding: '0 1px', boxSizing: 'border-box' }}>
                    {b.avg > 0 && <span style={{ fontSize: '0.5rem', color: 'var(--clr-text-soft)', marginBottom: 1, fontWeight: 600 }}>{b.avg.toFixed(1)}</span>}
                    <div style={{
                    width: '65%', height: h, minWidth: 6, borderRadius: '3px 3px 0 0',
                    background: b.avg === 0 ? 'transparent' : isSlow ? 'var(--clr-wrong)' : b.avg < 5 ? 'var(--clr-correct)' : 'var(--clr-accent)',
                    opacity: b.avg === 0 ? 0.15 : 0.85, transition: 'height 0.3s',
                    }} />
                </div>
                )
            })}
            </div>
            <div style={{ display: 'flex', margin: '3px 4px 0' }}>
            {bars.map(b => (
                <div key={b.m} style={{ width: barW, textAlign: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>
                ×{b.m}
                {phase === 2 && <div style={{ fontSize: '0.5rem', color: b.streak >= 5 ? 'var(--clr-correct)' : 'var(--clr-text-soft)' }}>{b.streak}/5</div>}
                </div>
            ))}
            </div>
        </div>
        )
    }

    // ── HOME ──
    if (screen === 'home') {
        return (
        <div style={S.page}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={S.title}>SuperTables 1</h1>
                <p style={S.subtitle}>Adaptive speed drill — master any table until it's automatic</p>
            </div>
            <div style={{ ...S.card, marginBottom: 24 }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 20px', color: 'var(--clr-text)' }}>
                Choose a multiplication table
                </h2>
                <div style={S.numGrid}>
                {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => startDrill(n)} style={S.numBtn}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--clr-accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--clr-accent)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--clr-surface)'; e.currentTarget.style.color = 'var(--clr-text)'; e.currentTarget.style.borderColor = 'var(--clr-border)' }}>
                    {n}
                    </button>
                ))}
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', margin: '0 0 4px' }}>Phase 1: Answer with lookup table until all facts &lt; 5 seconds</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', margin: 0 }}>Phase 2: No lookup — 5 consecutive correct per fact to finish</p>
            </div>
            </div>
        </div>
        )
    }

    // ── DRILL ──
    if (screen === 'drill') {
        // Current window of 3 multipliers being practiced
        const slow3 = new Set(currentWindow)
        const table = genTable(tableNum)
        // const correct = tableNum * currentMul

        return (
        <div style={S.page}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button onClick={goHome} style={S.back}>← Home</button>
                <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>Table of {tableNum}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: phase === 1 ? 'var(--clr-accent)' : 'var(--clr-correct)' }}>
                    {phase === 1 ? 'Phase 1 — With Lookup' : 'Phase 2 — From Memory'}
                </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', textAlign: 'right' }}>
                Q #{questionsAnswered + 1}
                </div>
            </div>

            {/* Phase 1: Lookup table — only the 3 facts currently being practiced */}
            {phase === 1 && (
                <div style={{ marginBottom: 20 }}>
                {(() => {
                    // Show only the 3 focused facts; fallback to current question if set is empty
                    let focused = shuffledTable.filter(e => slow3.has(e.multiplier))
                    if (focused.length === 0) {
                    focused = shuffledTable.filter(e => e.multiplier === currentMul)
                    }
                    return focused.length > 0 ? (
                    <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: 'auto', tableLayout: 'fixed' }}>
                        <thead>
                        <tr>
                            {focused.map((e, i) => (
                            <th key={i} style={S.thSlow}>{e.expression}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            {focused.map((e, i) => (
                            <td key={i} style={S.tdSlow}>{e.answer}</td>
                            ))}
                        </tr>
                        </tbody>
                    </table>
                    ) : null
                })()}
                {/* Phase 2 button — prominently below the lookup table */}
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <button onClick={goPhase2} style={{
                    padding: '10px 28px', fontSize: '1rem', fontWeight: 700,
                    borderRadius: 'var(--radius-sm)', border: '2px solid var(--clr-accent)',
                    background: 'var(--clr-card)', color: 'var(--clr-accent)',
                    cursor: 'pointer', transition: 'all var(--transition)',
                    fontFamily: 'var(--font-body)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--clr-accent)'; e.currentTarget.style.color = '#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--clr-card)'; e.currentTarget.style.color = 'var(--clr-accent)' }}
                    >
                    Ready? Go to Phase 2 →
                    </button>
                </div>
                </div>
            )}

            {/* Phase 2: Status badges */}
            {phase === 2 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                {table.map(e => {
                    const streak = getStreak(tableNum, e.multiplier)
                    const done = streak >= 5
                    const isFocused = slow3.has(e.multiplier)
                    return (
                    <div key={e.multiplier} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                        background: done ? 'var(--clr-correct-bg)' : isFocused ? 'var(--clr-wrong-bg)' : 'var(--clr-surface)',
                        color: done ? 'var(--clr-correct)' : isFocused ? 'var(--clr-wrong)' : 'var(--clr-text-soft)',
                        border: `1px solid ${done ? 'var(--clr-correct)' : isFocused ? 'var(--clr-wrong)' : 'var(--clr-border)'}`,
                    }}>
                        ×{e.multiplier}: {done ? '✓' : `${streak}/5`}
                    </div>
                    )
                })}
                </div>
            )}

            {/* Question card */}
            <div style={S.card}>
                <div style={{ fontSize: '2rem', fontWeight: 900, textAlign: 'center', marginBottom: 24, color: 'var(--clr-text)', letterSpacing: '0.5px' }}>
                {tableNum} × {currentMul} = ?
                </div>

                {fb ? (
                <div style={fb.ok ? S.fbOk : S.fbNo}>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: fb.ok ? 'var(--clr-correct)' : 'var(--clr-wrong)', margin: 0 }}>
                    {fb.ok ? '✓ Correct!' : `✗ The answer is ${fb.correctAns}`}
                    </p>
                    {fb.ok && fb.elapsed != null && <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', margin: '4px 0 0' }}>{(fb.elapsed / 1000).toFixed(1)}s</p>}
                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginTop: 12, fontWeight: 600 }}>Press Enter →</p>
                </div>
                ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <input ref={inputRef} name="ans" type="number" style={S.input} placeholder="?" autoComplete="off" />
                    <button type="submit" style={{ ...S.btn, ...S.btnPrimary }}>Submit</button>
                </form>
                )}
            </div>

            {/* Performance chart */}
            {renderChart()}
            </div>
        </div>
        )
    }

    // ── DONE ──
    if (screen === 'done') {
        return (
        <div style={S.page}>
            <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 40 }}>
            <div style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: 12 }}>🏆</div>
                <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--clr-text)' }}>
                Table of {tableNum} Mastered!
                </h2>
                <p style={{ color: 'var(--clr-text-soft)', margin: '0 0 8px' }}>
                All 10 facts answered correctly 5 times in a row — without any lookup.
                </p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', margin: '0 0 24px' }}>
                Total questions answered: {questionsAnswered}
                </p>

                {/* Final times */}
                <div style={{ marginBottom: 24 }}>
                <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        {genTable(tableNum).map((e, i) => (
                        <th key={i} style={S.th}>{e.expression}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        {genTable(tableNum).map((e, i) => {
                        const avg = getAvg(tableNum, e.multiplier)
                        return <td key={i} style={S.td}>{avg !== null ? (avg / 1000).toFixed(1) + 's' : '—'}</td>
                        })}
                    </tr>
                    </tbody>
                </table>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <button onClick={goHome} style={{ ...S.btn, ...S.btnPrimary, fontSize: '1.1rem', padding: '12px 32px' }}>Practice Another Table</button>
                </div>
            </div>
            </div>
        </div>
        )
    }

    return null
}
export default SuperTables1

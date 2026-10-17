/**
 * SuperTablesApp — 10-level progressive multiplication mastery
 *
 * Levels:
 *  1. Sequential Recall (horizontal 5+5 split, 20 questions)
 *  2. Random Recall (horizontal 5+5 split, 20 questions)
 *  3. Timed Answer Visibility (answer fades after 2s)
 *  4. Partial Shuffled Table (5 visible entries)
 *  5. Missing Digit Identification (type full answer)
 *  6. Multiple Choice Questions (4 options)
 *  7. Match the Following (3 pairs per round)
 *  8. Adaptive MCQ (tracks weak spots via sessionStorage)
 *  9. Direct Input (no assistance)
 * 10. Fill in the Blank (missing multiplier or answer)
 */
/**
 * SuperTables1App — Continuous adaptive drill with two phases:
 *
 * Phase 1 (WITH lookup): Shuffled reference table shown on top. Questions asked
 *   continuously. 3 slowest facts highlighted. Uses rolling window of last 10
 *   correct attempts per fact. Once ALL 10 facts have avg < 5s → Phase 2.
 *
 * Phase 2 (WITHOUT lookup): Same questions, no reference table. Once the student
 *   answers 5 consecutive correct for EVERY fact → done.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function SuperTables() {
  // ── helpers ───────────────────────────────────────────
    const stShuffle = useCallback((arr) => {
        const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a;
    }, [])
    const stGenTable = useCallback((n) => Array.from({ length: 10 }, (_, i) => ({ multiplier: i + 1, expression: `${n} × ${i + 1}`, answer: n * (i + 1) })), [])
    const stDistractors = useCallback((correct, tbl) => {
        const tblAns = Array.from({ length: 10 }, (_, i) => tbl * (i + 1))
        const s = new Set()
        tblAns.forEach(a => { if (a !== correct) s.add(a) });
        [correct - 1, correct + 1, correct - tbl, correct + tbl, correct - 10, correct + 10].forEach(v => { if (v > 0 && v !== correct) s.add(v) })
        const picked = stShuffle([...s]).slice(0, 3)
        while (picked.length < 3) picked.push(correct + picked.length + 1)
        return stShuffle([correct, ...picked])
    },[stShuffle])

    const [ answerLength, setAnswerLength ] = useState(0)
    const [ pos ] = useState(() => Math.floor(Math.random() * answerLength))

    const stMask = useCallback((answer) => {
        const s = String(answer);
        setAnswerLength(s.length)
        return s.slice(0, pos) + '*' + s.slice(pos + 1)
    }, [pos])
    // adaptive tracking — stores individual times for trimmed mean
    const stGetAdaptive = useCallback(() => { try { return JSON.parse(sessionStorage.getItem('st_adaptive') || '{}') } catch { return {} } }, [])
    const stSetAdaptive = (d) => { sessionStorage.setItem('st_adaptive', JSON.stringify(d)) }
    const stRecord = (tbl, mul, ok, ms) => {
        const d = stGetAdaptive(); const k = `${tbl}x${mul}`
        if (!d[k]) d[k] = { wrong: 0, attempts: 0, times: [] }
        // migrate old format (totalTime only) → new format (times array)
        if (!d[k].times) d[k].times = d[k].totalTime ? Array(d[k].attempts).fill(Math.round(d[k].totalTime / d[k].attempts)) : []
        // Only record time and count attempt for correct answers
        // Wrong answers just increment the wrong counter — not counted as an attempt
        if (ok) {
        d[k].attempts++; d[k].times.push(ms)
        if (d[k].times.length > 50) d[k].times = d[k].times.slice(-50)
        } else {
        d[k].wrong++
        }
        stSetAdaptive(d)
    }
    // Trimmed mean: discard bottom 10% and top 10%, average the middle 80%
    const stTrimmedMean = useCallback((times) => {
        if (!times || times.length === 0) return 0
        if (times.length <= 2) return times.reduce((a, b) => a + b, 0) / times.length
        const sorted = [...times].sort((a, b) => a - b)
        const trim = Math.max(1, Math.round(sorted.length * 0.1))
        const trimmed = sorted.slice(trim, sorted.length - trim)
        if (trimmed.length === 0) return sorted[Math.floor(sorted.length / 2)]
        return trimmed.reduce((a, b) => a + b, 0) / trimmed.length
    },[])
    const stWeak = useCallback((tbl) => {
        const d = stGetAdaptive(); const w = []
        for (let m = 1; m <= 10; m++) {
        const info = d[`${tbl}x${m}`]
        if (!info || info.attempts === 0) continue
        const avg = stTrimmedMean(info.times || [])
        if (info.wrong > 0 || avg > 5000) w.push({ m, sc: info.wrong * 2 + avg / 1000 })
        }
        return w.sort((a, b) => b.sc - a.sc).map(x => x.m)
    }, [stGetAdaptive, stTrimmedMean])

    // ── styles using Tenali CSS variables ─────────────────
    const S = {
        page: { minHeight: '100vh', padding: '24px', fontFamily: 'var(--font-body, system-ui)', color: 'var(--clr-text)', background: 'var(--clr-bg)' },
        center: { textAlign: 'center' },
        title: { fontSize: '2.5rem', fontWeight: 900, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--clr-text)' },
        subtitle: { fontSize: '1.1rem', color: 'var(--clr-text-soft)', marginBottom: 32 },
        card: { background: 'var(--clr-card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: '28px 24px', maxWidth: 620, margin: '0 auto', color: 'var(--clr-text)' },
        btn: { border: 'none', borderRadius: 'var(--radius-sm)', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', transition: 'all var(--transition)', fontFamily: 'var(--font-body)' },
        btnPrimary: { background: 'var(--clr-accent)', color: '#fff' },
        btnSecondary: { background: 'var(--clr-surface)', color: 'var(--clr-text)' },
        input: { width: 120, textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, border: '2px solid var(--clr-accent)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', outline: 'none', background: 'var(--clr-input)', color: 'var(--clr-text)', fontFamily: 'var(--font-body)' },
        optionBtn: { border: '2px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', padding: '14px', fontWeight: 800, fontSize: '1.3rem', cursor: 'pointer', background: 'var(--clr-surface)', transition: 'all var(--transition)', color: 'var(--clr-text)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
        tableWrap: { overflowX: 'auto', marginBottom: 24 },
        table: { margin: '0 auto', borderCollapse: 'collapse' },
        th: { padding: '10px 14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-accent)', background: 'var(--clr-accent-soft)', border: '2px solid var(--clr-border)' },
        td: { padding: '10px 14px', textAlign: 'center', fontWeight: 800, fontSize: '1.2rem', border: '2px solid var(--clr-border)', background: 'var(--clr-card)', color: 'var(--clr-text)' },
        qLabel: { fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontWeight: 600, marginBottom: 8 },
        qText: { fontSize: '2rem', fontWeight: 900, textAlign: 'center', marginBottom: 24, color: 'var(--clr-text)', letterSpacing: '0.5px' },
        fbOk: { marginTop: 16, padding: 16, borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'var(--clr-correct-bg)', border: '1px solid var(--clr-correct)' },
        fbNo: { marginTop: 16, padding: 16, borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'var(--clr-wrong-bg)', border: '1px solid var(--clr-wrong)' },
        back: { background: 'none', border: 'none', color: 'var(--clr-accent)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', padding: 0, fontFamily: 'var(--font-body)' },
        badge: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-accent)', background: 'var(--clr-accent-soft)', padding: '2px 8px', borderRadius: 99, display: 'inline-block' },
        numGrid: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6, width: '100%', margin: '0 auto' },
        numBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', background: 'var(--clr-surface)', border: '2px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', transition: 'all var(--transition)', color: 'var(--clr-text)', fontFamily: 'var(--font-body)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
        matchCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
        matchBtn: (active, matched) => ({
        padding: '14px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1.15rem', border: '2px solid', cursor: matched ? 'default' : 'pointer', opacity: matched ? 0.5 : 1, transition: 'all var(--transition)', fontFamily: 'var(--font-body)',
        borderColor: matched ? 'var(--clr-correct)' : active ? 'var(--clr-accent)' : 'var(--clr-border)',
        background: matched ? 'var(--clr-correct-bg)' : active ? 'var(--clr-accent-soft)' : 'var(--clr-card)',
        color: matched ? 'var(--clr-correct)' : active ? 'var(--clr-accent)' : 'var(--clr-text)'
        }),
        ansCol: (sel, matched) => ({
        padding: '14px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1.15rem', border: '2px solid', cursor: matched ? 'default' : sel ? 'pointer' : 'not-allowed', opacity: matched ? 0.5 : 1, transition: 'all var(--transition)', fontFamily: 'var(--font-body)',
        borderColor: matched ? 'var(--clr-correct)' : sel ? 'var(--clr-accent)' : 'var(--clr-border)',
        background: matched ? 'var(--clr-correct-bg)' : sel ? 'var(--clr-accent-soft)' : 'var(--clr-card)',
        color: matched ? 'var(--clr-correct)' : sel ? 'var(--clr-accent)' : 'var(--clr-text-soft)'
        }),
        // level progress bar
        progressBar: { display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto 24px', maxWidth: 400 },
        progressStep: (done, active) => ({
        flex: 1, height: 6, borderRadius: 3, transition: 'all var(--transition)',
        background: done ? 'var(--clr-accent)' : active ? 'var(--clr-accent-soft)' : 'var(--clr-surface)'
        }),
    }

    // ── level metadata (unchanged logic) ──────────────────
    const LEVELS = [
        { id: 1, name: 'Sequential Recall', desc: 'Answer in order with the table visible', icon: '📋' },
        { id: 2, name: 'Random Recall', desc: 'Random questions with the table visible', icon: '🔀' },
        { id: 3, name: 'Timed Visibility', desc: 'See the answer briefly, then recall it', icon: '⏱️' },
        { id: 4, name: 'Partial Table', desc: 'Only 5 entries visible', icon: '🧩' },
        { id: 5, name: 'Missing Digit', desc: 'One digit hidden — type full answer', icon: '🔍' },
        { id: 6, name: 'Multiple Choice', desc: 'Pick from 4 options', icon: '🅰️' },
        { id: 7, name: 'Match Pairs', desc: 'Match 3 questions to answers', icon: '🔗' },
        { id: 8, name: 'Adaptive MCQ', desc: 'Focuses on your weak spots', icon: '🧠' },
        { id: 9, name: 'Direct Input', desc: 'No help — type from memory', icon: '✍️' },
        { id: 10, name: 'Fill in the Blank', desc: 'Find the missing value', icon: '📝' },
    ]

    // ── state (sequential progression) ────────────────────
    const [screen, setScreen] = useState('home') // home | play | levelDone | allDone
    const [tableNum, setTableNum] = useState(null)
    const [currentLevel, setCurrentLevel] = useState(1) // 1–10, auto-progresses
    const [idx, setIdx] = useState(0)
    const [score, setScore] = useState(0)
    const [fb, setFb] = useState(null)
    const [phase, setPhase] = useState('show') // for L3
    const [selected, setSelected] = useState(null) // for L7
    const [matched, setMatched] = useState([]) // for L7
    const [wrong7, setWrong7] = useState(false)
    const startTimeRef = useRef(0)
    const [wrongAttempts, setWrongAttempts] = useState(0)
    const inputRef = useRef(null)

    // computed data
    const [questions, setQuestions] = useState([])
    const [visible, setVisible] = useState([])
    const [rounds, setRounds] = useState([])
    const [roundIdx, setRoundIdx] = useState(0)
    const [shuffledAns, setShuffledAns] = useState([])

    const lid = currentLevel
    const levelMeta = LEVELS[lid - 1] || LEVELS[0]
    const totalQ = lid <= 2 ? 20 : lid === 4 ? 5 : lid === 7 ? rounds.length * 3 : 10
    const cur = useMemo(() => questions[Math.min(idx, questions.length - 1)] || { expression: '', answer: 0, multiplier: 1 }, [questions, idx])
    const options = useMemo(
        () => (lid === 6 || lid === 8) && tableNum ? stDistractors(cur.answer, tableNum) : [],
        [lid, cur, tableNum, stDistractors]
    )

    // ── adaptive weighting helper ──────────────────────────
    // Returns a shuffled question list that includes extra copies of weak facts.
    // `base` = full 10-entry table, `count` = desired question count.
    // Weak facts (from stWeak) get duplicated so they appear ~2× more often,
    // but mixed with others so it doesn't feel overwhelming.
    const stAdaptiveList = useCallback((base, num, count) => {
        const weak = new Set(stWeak(num).slice(0, 4)) // top 4 weakest
        if (weak.size === 0) return stShuffle(base).slice(0, count)
        const pool = []
        for (const e of base) {
        pool.push(e)
        if (weak.has(e.multiplier)) pool.push({ ...e }) // extra copy for weak facts
        }
        // shuffle and trim to count
        const shuffled = stShuffle(pool)
        if (shuffled.length >= count) return shuffled.slice(0, count)
        // if we need more, repeat the pool
        while (shuffled.length < count) shuffled.push(...stShuffle(base))
        return shuffled.slice(0, count)
    }, [stShuffle, stWeak])

    // ── setup a level (called with table number + uses currentLevel) ──
    const setupLevel = useCallback((num, level) => {
        setScreen('play'); setIdx(0); setScore(0); setFb(null); setPhase('show')
        setSelected(null); setMatched([]); setWrong7(false); setRoundIdx(0); setWrongAttempts(0)
        startTimeRef.current = performance.now()
        const tbl = stGenTable(num)
        const first = tbl.slice(0, 5), second = tbl.slice(5)
        // L1 & L2: sequential/halved structure preserved, but weak facts from each half get extra reps
        if (level === 1) {
        const weak = new Set(stWeak(num).slice(0, 4))
        const firstQ = [...first]; first.forEach(e => { if (weak.has(e.multiplier)) firstQ.push(e) })
        const secondQ = [...second]; second.forEach(e => { if (weak.has(e.multiplier)) secondQ.push(e) })
        const fwd1 = firstQ.slice(0, 10), fwd2 = secondQ.slice(0, 10)
        while (fwd1.length < 10) fwd1.push(first[fwd1.length % first.length])
        while (fwd2.length < 10) fwd2.push(second[fwd2.length % second.length])
        setQuestions([...fwd1, ...fwd2]); setVisible(first)
        }
        else if (level === 2) {
        const weak = new Set(stWeak(num).slice(0, 4))
        const firstPool = [...first]; first.forEach(e => { if (weak.has(e.multiplier)) firstPool.push(e) })
        const secondPool = [...second]; second.forEach(e => { if (weak.has(e.multiplier)) secondPool.push(e) })
        const r1 = stShuffle(firstPool).slice(0, 10), r2 = stShuffle(secondPool).slice(0, 10)
        while (r1.length < 10) r1.push(first[r1.length % first.length])
        while (r2.length < 10) r2.push(second[r2.length % second.length])
        setQuestions([...stShuffle(r1), ...stShuffle(r2)]); setVisible(first)
        }
        else if (level === 3) { setQuestions(stAdaptiveList(tbl, num, 10)) }
        else if (level === 4) {
        // Prefer showing weak facts in the visible set
        const weak = new Set(stWeak(num).slice(0, 3))
        const weakEntries = tbl.filter(e => weak.has(e.multiplier))
        const others = stShuffle(tbl.filter(e => !weak.has(e.multiplier)))
        const v = stShuffle([...weakEntries, ...others].slice(0, 5))
        setVisible(v); setQuestions(stShuffle(v))
        }
        else if (level === 5) { setQuestions(stAdaptiveList(tbl, num, 10).map(e => ({ ...e, masked: stMask(e.answer) }))) }
        else if (level === 6) { const q = stAdaptiveList(tbl, num, 10); setQuestions(q) }
        else if (level === 7) {
        // Ensure weak facts appear in the rounds
        const weak = new Set(stWeak(num).slice(0, 3))
        const weakEntries = tbl.filter(e => weak.has(e.multiplier))
        const others = stShuffle(tbl.filter(e => !weak.has(e.multiplier)))
        const ordered = [...weakEntries, ...others].slice(0, 9)
        const sh = stShuffle(ordered); const r = []
        for (let i = 0; i < sh.length; i += 3) r.push(sh.slice(i, i + 3))
        if (r.length === 0) r.push(stShuffle(tbl).slice(0, 3))
        setRounds(r); setShuffledAns(stShuffle(r[0].map(e => e.answer)))
        } else if (level === 8) {
        // L8 already fully adaptive — keep as is but use stAdaptiveList
        const weak = stWeak(num); const weakE = weak.slice(0, 5).map(m => tbl.find(e => e.multiplier === m)).filter(Boolean)
        const others = stShuffle(tbl.filter(e => !weak.includes(e.multiplier)))
        const mix = [...weakE]; for (const o of others) { if (mix.length >= 10) break; if (!mix.find(m => m.multiplier === o.multiplier)) mix.push(o) }
        while (mix.length < 10) mix.push(tbl[mix.length % 10])
        const q = stShuffle(mix); setQuestions(q)
        } else if (level === 9) { setQuestions(stAdaptiveList(tbl, num, 10)) }
        else if (level === 10) { setQuestions(stAdaptiveList(tbl, num, 10).map(e => ({ ...e, blankType: Math.random() > 0.5 ? 'multiplier' : 'answer' }))) }
    }, [stAdaptiveList, stMask, stWeak, stShuffle, stGenTable])

    // Start from table selection → always Level 1
    const startFromTable = useCallback((num) => {
        setTableNum(num); setCurrentLevel(1); setupLevel(num, 1)
    }, [setupLevel])

    // Continue to next level
    const continueToNext = useCallback(() => {
        if (currentLevel < 10) {
        const next = currentLevel + 1
        setCurrentLevel(next); setupLevel(tableNum, next)
        } else {
        setScreen('allDone')
        }
    }, [currentLevel, setupLevel, tableNum])

    // Reset everything
    const goHome = useCallback(() => { setScreen('home'); setTableNum(null); setCurrentLevel(1) }, [])

    // ── effects ───────────────────────────────────────────
    // L3 timed phases
    useEffect(() => {
        if (lid !== 3 || screen !== 'play') return
        if (phase === 'show') { const t = setTimeout(() => setPhase('fading'), 2000); return () => clearTimeout(t) }
        if (phase === 'fading') { const t = setTimeout(() => setPhase('ask'), 800); return () => clearTimeout(t) }
    }, [phase, idx, lid, screen])

    // L7 auto-advance after matching all 3
    useEffect(() => {
        if (lid !== 7 || matched.length !== 3) return
        const t = setTimeout(() => {
        const next = roundIdx + 1
        if (next < rounds.length) { setRoundIdx(next); setMatched([]); setSelected(null); setWrong7(false); setShuffledAns(stShuffle(rounds[next].map(e => e.answer))) }
        else { setScreen('levelDone') }
        }, 800)
        return () => clearTimeout(t)
    }, [matched, lid, roundIdx, rounds, stShuffle])

    useEffect(() => { if (!fb && inputRef.current) inputRef.current.focus() }, [idx, fb, phase])

    // Allow Enter key to advance when feedback is showing
    const nextBtnRef = useRef(null)
    useEffect(() => {
        if (fb && nextBtnRef.current) nextBtnRef.current.focus()
    }, [fb])

    const advance = useCallback(() => {
        setFb(null)
        startTimeRef.current = performance.now()
        if (lid === 3) setPhase('show')
        if (lid <= 2 && idx < 19) {
        const tbl = stGenTable(tableNum)
        if (idx === 9) setVisible(tbl.slice(5))
        }
        // Check if this was the last question → show level completion
        const nextIdx = idx + 1
        const thisTotal = lid <= 2 ? 20 : lid === 4 ? 5 : lid === 7 ? rounds.length * 3 : 10
        if (nextIdx >= thisTotal) {
        setIdx(nextIdx)
        setScreen('levelDone')
        } else {
        setIdx(nextIdx)
        }
    }, [idx, lid, tableNum, rounds.length, stGenTable])

    useEffect(() => {
        if (!fb || screen !== 'play') return
        const handler = (e) => { if (e.key === 'Enter') { e.preventDefault(); advance() } }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [fb, screen, idx, lid, advance])

    // ── answer handlers (level logic unchanged) ───────────
    const handleInput = (e) => {
        e.preventDefault()
        const val = parseInt(e.target.elements.ans.value, 10)
        if (isNaN(val)) return
        let correctAns = cur.answer
        if (lid === 10) correctAns = cur.blankType === 'multiplier' ? cur.multiplier : cur.answer
        const ok = val === correctAns
        if (ok) setScore(s => s + 1)
        else setWrongAttempts(w => w + 1)
        stRecord(tableNum, cur.multiplier, ok, e.timeStamp - startTimeRef.current)
        setFb({ ok, correctAns })
        e.target.elements.ans.value = ''
    }
    const handlePick = (ans, e) => {
        const ok = ans === cur.answer
        if (ok) setScore(s => s + 1)
        else setWrongAttempts(w => w + 1)
        stRecord(tableNum, cur.multiplier, ok, e.timeStamp - startTimeRef.current)
        setFb({ ok, correctAns: cur.answer })
    }

    // L1/L2 visible half
    const displayHalf = lid <= 2 && tableNum ? (idx < 10 ? stGenTable(tableNum).slice(0, 5) : stGenTable(tableNum).slice(5)) : []

    const done = lid === 7 ? (roundIdx >= rounds.length) : (idx >= totalQ && fb === null)

    // ── render helpers ────────────────────────────────────
    const renderLevelProgress = () => (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--clr-text)', margin: '0 0 8px', fontWeight: 700 }}>
            Level {lid} of 10 — {levelMeta.name}
        </p>
        <div style={S.progressBar}>
            {LEVELS.map((_, i) => (
            <div key={i} style={S.progressStep(i + 1 < lid, i + 1 === lid)} />
            ))}
        </div>
        </div>
    )

    const renderTable = (entries, tblNum, hideM) => {
        const filtered = hideM != null ? entries.filter(e => e.multiplier !== hideM) : entries
        return (
        <div style={S.tableWrap}>
            <table style={S.table}>
            <thead><tr>{filtered.map((e, i) => <th key={i} style={S.th}>{tblNum} × {e.multiplier}</th>)}</tr></thead>
            <tbody><tr>{filtered.map((e, i) => <td key={i} style={S.td}>{e.answer}</td>)}</tr></tbody>
            </table>
        </div>
        )
    }

    const renderFeedback = () => (
        <div style={fb.ok ? S.fbOk : S.fbNo}>
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: fb.ok ? 'var(--clr-correct)' : 'var(--clr-wrong)', margin: 0 }}>
            {fb.ok ? '✓ Correct!' : `✗ The answer is ${fb.correctAns}`}
        </p>
        <button ref={nextBtnRef} onClick={advance} style={{ ...S.btn, ...S.btnPrimary, marginTop: 12 }}>Next →</button>
        </div>
    )

    const renderInput = () => (
        <form onSubmit={handleInput} style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <input ref={inputRef} name="ans" type="number" style={S.input} placeholder="?" autoComplete="off" />
        <button type="submit" style={{ ...S.btn, ...S.btnPrimary }}>Submit</button>
        </form>
    )

    // ── Performance chart ──────────────────────────────────
    const renderPerformanceChart = () => {
        if (!tableNum) return null
        const d = stGetAdaptive()
        const bars = []
        let maxTime = 0
        for (let m = 1; m <= 10; m++) {
        const info = d[`${tableNum}x${m}`]
        const avg = info && info.attempts > 0 ? stTrimmedMean(info.times || []) / 1000 : 0
        if (avg > maxTime) maxTime = avg
        bars.push({ m, avg, attempts: info ? info.attempts : 0, wrong: info ? info.wrong : 0 })
        }
        const hasData = bars.some(b => b.attempts > 0)
        if (!hasData) return null
        maxTime = Math.max(maxTime, 1) // at least 1s scale
        const chartH = 120
        const barW = `${100 / 10}%`
        return (
        <div style={{ marginTop: 24, padding: '16px 0 0' }}>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-text-soft)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Avg. Time per Fact (seconds)
            </p>
            {/* Y-axis + bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, position: 'relative', height: chartH, margin: '0 4px', borderBottom: '2px solid var(--clr-border)', borderLeft: '2px solid var(--clr-border)' }}>
            {/* Y-axis labels */}
            <span style={{ position: 'absolute', left: -4, top: 0, fontSize: '0.6rem', color: 'var(--clr-text-soft)', transform: 'translateX(-100%)', whiteSpace: 'nowrap' }}>{maxTime.toFixed(1)}s</span>
            <span style={{ position: 'absolute', left: -4, top: '50%', fontSize: '0.6rem', color: 'var(--clr-text-soft)', transform: 'translateX(-100%) translateY(-50%)', whiteSpace: 'nowrap' }}>{(maxTime / 2).toFixed(1)}s</span>
            <span style={{ position: 'absolute', left: -4, bottom: -2, fontSize: '0.6rem', color: 'var(--clr-text-soft)', transform: 'translateX(-100%)', whiteSpace: 'nowrap' }}>0s</span>
            {/* Grid lines */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed var(--clr-border)', opacity: 0.5 }} />
            {/* Bars */}
            {bars.map(b => {
                const h = b.avg > 0 ? Math.max((b.avg / maxTime) * chartH, 4) : 0
                const isWeak = b.wrong > 0 || b.avg > maxTime * 0.7
                return (
                <div key={b.m} style={{ width: barW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', padding: '0 2px', boxSizing: 'border-box' }}>
                    {b.avg > 0 && <span style={{ fontSize: '0.55rem', color: 'var(--clr-text-soft)', marginBottom: 2, fontWeight: 600 }}>{b.avg.toFixed(1)}</span>}
                    <div style={{
                    width: '70%', height: h, minWidth: 8,
                    borderRadius: '4px 4px 0 0',
                    background: b.attempts === 0 ? 'transparent' : isWeak ? 'var(--clr-wrong)' : 'var(--clr-accent)',
                    opacity: b.attempts === 0 ? 0.15 : 0.85,
                    transition: 'height 0.3s ease',
                    }} />
                </div>
                )
            })}
            </div>
            {/* X-axis labels */}
            <div style={{ display: 'flex', margin: '4px 4px 0' }}>
            {bars.map(b => (
                <div key={b.m} style={{ width: barW, textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>
                ×{b.m}
                </div>
            ))}
            </div>
        </div>
        )
    }

    // ── SCREENS ───────────────────────────────────────────

    // HOME — just pick a table, no level selection
    if (screen === 'home') {
        return (
        <div style={S.page}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={S.center}>
                <h1 style={S.title}>SuperTables</h1>
                <p style={S.subtitle}>Master multiplication through 10 progressive levels</p>
            </div>
            <div style={{ ...S.card, marginBottom: 24 }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 20px', color: 'var(--clr-text)' }}>
                Choose a multiplication table to begin
                </h2>
                <div style={S.numGrid}>
                {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => startFromTable(n)} style={S.numBtn}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--clr-accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--clr-accent)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--clr-surface)'; e.currentTarget.style.color = 'var(--clr-text)'; e.currentTarget.style.borderColor = 'var(--clr-border)' }}>
                    {n}
                    </button>
                ))}
                </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
                You'll progress from Level 1 → 10 automatically
            </p>
            </div>
        </div>
        )
    }

    // LEVEL DONE — show score + Continue button
    if (screen === 'levelDone') {
        const pct = Math.round((score / totalQ) * 100)
        return (
        <div style={S.page}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
            {renderLevelProgress()}
            <div style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', color: 'var(--clr-text)' }}>Level {lid} Complete!</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: '0 0 16px' }}>{levelMeta.name}</p>
                <p style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--clr-accent)', margin: '0 0 4px' }}>{score}/{totalQ}</p>
                <p style={{ color: 'var(--clr-text-soft)', marginBottom: 24 }}>{pct}% correct{wrongAttempts > 0 ? ` · ${wrongAttempts} wrong` : ''}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                {currentLevel < 10 ? (
                    <button onClick={continueToNext} style={{ ...S.btn, ...S.btnPrimary, fontSize: '1.1rem', padding: '12px 32px' }}>
                    Continue to Level {currentLevel + 1} →
                    </button>
                ) : (
                    <button onClick={() => setScreen('allDone')} style={{ ...S.btn, ...S.btnPrimary, fontSize: '1.1rem', padding: '12px 32px' }}>
                    See Final Results →
                    </button>
                )}
                <button onClick={() => setupLevel(tableNum, currentLevel)} style={{ ...S.btn, ...S.btnSecondary, fontSize: '0.85rem' }}>Retry this level</button>
                </div>
            </div>
            </div>
        </div>
        )
    }

    // ALL DONE — completed all 10 levels
    if (screen === 'allDone') {
        return (
        <div style={S.page}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: 12 }}>🎓</div>
                <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--clr-text)' }}>All 10 Levels Complete!</h2>
                <p style={{ color: 'var(--clr-text-soft)', margin: '0 0 8px' }}>Table of {tableNum}</p>
                <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 32px' }}>
                You've mastered all levels for the {tableNum} times table. Great work!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <button onClick={goHome} style={{ ...S.btn, ...S.btnPrimary, fontSize: '1.1rem', padding: '12px 32px' }}>Practice Another Table</button>
                </div>
            </div>
            </div>
        </div>
        )
    }

    // PLAY — Level 7 (match pairs) has its own layout
    if (lid === 7) {
        if (done) return null // handled by useEffect → levelDone
        const rd = rounds[Math.min(roundIdx, rounds.length - 1)]
        if (!rd) return null
        return (
        <div style={S.page}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {renderLevelProgress()}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <button onClick={goHome} style={S.back}>← Quit</button>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Table of {tableNum}</span>
            </div>
            <div style={S.card}>
                <p style={S.qLabel}>Round {roundIdx + 1} of {rounds.length}</p>
                <h2 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: 16, fontWeight: 700, color: 'var(--clr-text)' }}>Match each question to its answer</h2>
                {wrong7 && <p style={{ textAlign: 'center', color: 'var(--clr-wrong)', fontSize: '0.85rem', fontWeight: 600 }}>Not a match — try again!</p>}
                <div style={{ display: 'flex', gap: 24 }}>
                <div style={S.matchCol}>
                    {rd.map((e, i) => (
                    <button key={i} disabled={matched.includes(i)} onClick={() => { setSelected(i); setWrong7(false) }}
                        style={S.matchBtn(selected === i, matched.includes(i))}>{e.expression}</button>
                    ))}
                </div>
                <div style={S.matchCol}>
                    {shuffledAns.map((ans, i) => {
                    const isM = matched.some(mi => rd[mi].answer === ans)
                    return (
                        <button key={i} disabled={isM || selected === null} onClick={() => {
                        if (selected === null) return
                        if (rd[selected].answer === ans) { stRecord(tableNum, rd[selected].multiplier, true, performance.now() - startTimeRef.current); setMatched(m => [...m, selected]); setScore(s => s + 1); setSelected(null) }
                        else { stRecord(tableNum, rd[selected].multiplier, false, performance.now() - startTimeRef.current); setWrong7(true); setWrongAttempts(w => w + 1) }
                        }} style={S.ansCol(selected !== null, isM)}>{ans}</button>
                    )
                    })}
                </div>
                </div>
            </div>
            {renderPerformanceChart()}
            </div>
        </div>
        )
    }

    // PLAY — generic (all other levels)
    const qText = lid === 5 ? `${cur.expression} = ${cur.masked}`
        : lid === 10 ? (cur.blankType === 'multiplier' ? `${tableNum} × ___ = ${cur.answer}` : `${tableNum} × ${cur.multiplier} = ___`)
        : `${cur.expression} = ?`

    return (
        <div style={S.page}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {renderLevelProgress()}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={goHome} style={S.back}>← Quit</button>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Table of {tableNum}</span>
            <div style={{ width: 60 }} />
            </div>

            {/* Table display for L1, L2 */}
            {lid <= 2 && renderTable(displayHalf, tableNum)}

            {/* Table display for L4 */}
            {lid === 4 && renderTable(visible, tableNum)}

            <div style={S.card}>
            <p style={S.qLabel}>Question {idx + 1} of {totalQ}</p>
            <div style={S.qText}>{qText}</div>

            {/* L3: show/fade answer */}
            {lid === 3 && phase !== 'ask' && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--clr-accent)', transition: 'opacity 0.7s', opacity: phase === 'fading' ? 0 : 1 }}>{cur.answer}</span>
                </div>
            )}

            {/* L5 hint */}
            {lid === 5 && (
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <p style={{ color: 'var(--clr-accent)', fontSize: '1rem', fontWeight: 700, margin: '0 0 4px' }}>
                    Type the FULL number (e.g. if 5* → type 52)
                </p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.8rem', margin: 0 }}>
                    Not just the missing digit — enter the complete answer
                </p>
                </div>
            )}

            {/* L8 hint */}
            {lid === 8 && <p style={{ textAlign: 'center', color: 'var(--clr-text-soft)', fontSize: '0.75rem', marginBottom: 12 }}>Adaptive — focuses on your weak spots</p>}

            {/* Input or MCQ */}
            {fb ? renderFeedback() : (
                (lid === 6 || lid === 8) ? (
                <div style={S.grid2}>
                    {options.map((o, i) => (
                    <button key={i} onClick={e => handlePick(o, e)} style={S.optionBtn}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--clr-accent)'; e.currentTarget.style.background = 'var(--clr-accent-soft)' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.background = 'var(--clr-surface)' }}>
                        {o}
                    </button>
                    ))}
                </div>
                ) : (lid === 3 && phase !== 'ask') ? null : renderInput()
            )}
            </div>
            {renderPerformanceChart()}
        </div>
        </div>
    )
}

export default SuperTables
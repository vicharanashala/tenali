import { useState, useEffect } from 'react'

const VM_MODES = {
  'multiply-counting': ['array', 'groups', 'skip'],
  'multiply-scale': ['product', 'mystery'],
  'divide-counting': ['share', 'grouping'],
  'divide-scale': ['quotient', 'remainder'],
}

const VM_ROW_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#e67e22', '#1abc9c', '#f39c12', '#e91e63']
const VM_PLATE_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#e67e22']

function buildVmBank(difficulty, uid) {
  const mk = (d, i) => ({ id: `${uid}-${d}-${i}`, val: d })
  if (difficulty === 'easy') return [...Array.from({ length: 5 }, (_, i) => mk(5, i)), ...Array.from({ length: 10 }, (_, i) => mk(1, i + 50))]
  if (difficulty === 'medium') return [mk(50, 0), ...Array.from({ length: 4 }, (_, i) => mk(10, i)), ...Array.from({ length: 5 }, (_, i) => mk(5, i + 10)), ...Array.from({ length: 10 }, (_, i) => mk(1, i + 50))]
  return [mk(100, 0), ...Array.from({ length: 2 }, (_, i) => mk(50, i)), ...Array.from({ length: 4 }, (_, i) => mk(10, i + 10)), ...Array.from({ length: 5 }, (_, i) => mk(5, i + 20)), ...Array.from({ length: 10 }, (_, i) => mk(1, i + 50))]
}

export default function VisualMathApp({ onBack, API, QuizLayout }) {
  // ── Setup state ──
  const [phase, setPhase] = useState('setup')
  const [operation, setOperation] = useState('multiply')
  const [visualMode, setVMode] = useState('counting')
  const [difficulty, setDifficulty] = useState('easy')
  const [numQ, setNumQ] = useState(10)

  // ── Quiz state ──
  const [question, setQuestion] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState([])
  const [vmFB, setVmFB] = useState(null)  // { correct, correctAnswer, revealed? }
  const [loading, setLoading] = useState(false)

  // ── Mode-specific interactive state ──
  const [filledCells, setFilledCells] = useState(new Set())  // array
  const [buckets, setBuckets] = useState([])          // groups
  const [hopCount, setHopCount] = useState(0)           // skip
  const [plateItems, setPlateItems] = useState([])          // share (per-plate counts)
  const [formedGroups, setFormedGroups] = useState(0)          // grouping
  const [groupProg, setGroupProg] = useState(0)          // grouping (items in current grp)
  const [rightBlocks, setRightBlocks] = useState([])         // scale modes
  const [bankBlocks, setBankBlocks] = useState([])          // scale modes
  const [textAns, setTextAns] = useState('')          // mystery / remainder

  // Init mode-specific state when question loads
  useEffect(() => {
    if (!question) return
    if (question.mode === 'groups') setBuckets(Array(question.numGroups).fill(0))
    if (question.mode === 'share') setPlateItems(Array(question.divisor).fill(0))
    if (question.mode === 'product' || question.mode === 'quotient') {
      setBankBlocks(buildVmBank(difficulty, `q${question.id}`))
      setRightBlocks([])
    }
  }, [question?.id]) // eslint-disable-line

  const pickMode = () => {
    const arr = VM_MODES[`${operation}-${visualMode}`] || ['array']
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const resetInteractive = () => {
    setFilledCells(new Set()); setBuckets([]); setHopCount(0)
    setPlateItems([]); setFormedGroups(0); setGroupProg(0)
    setRightBlocks([]); setBankBlocks([]); setTextAns('')
    setVmFB(null)
  }

  const fetchQ = async () => {
    setLoading(true); resetInteractive()
    const mode = pickMode()
    try {
      const r = await fetch(`${API}/visual-math-api/question?type=${operation}&mode=${mode}&difficulty=${difficulty}`)
      const q = await r.json()
      setQuestion(q)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const startQuiz = () => {
    setQIndex(0); setScore(0); setResults([])
    setPhase('quiz'); fetchQ()
  }

  const getUserAnswer = () => {
    if (!question) return 0
    const m = question.mode
    if (m === 'array') return filledCells.size
    if (m === 'groups') return buckets.reduce((s, c) => s + c, 0)
    if (m === 'skip') return hopCount
    if (m === 'share') return plateItems.length > 0 ? (plateItems[0] || 0) : 0
    if (m === 'grouping') return formedGroups
    if (m === 'product' || m === 'quotient') return rightBlocks.reduce((s, b) => s + b.val, 0)
    if (m === 'mystery' || m === 'remainder') return Number(textAns) || 0
    return 0
  }

  const formatStandaloneVMAnswer = (qObj, ans) => {
    if (!qObj) return ans
    if (qObj.type === 'multiply') {
      if (qObj.mode === 'array') {
        return `${qObj.rows} × ${qObj.cols} = ${qObj.rows * qObj.cols}`
      }
      if (qObj.mode === 'groups') {
        return `${qObj.numGroups} × ${qObj.perGroup} = ${qObj.numGroups * qObj.perGroup}`
      }
      if (qObj.mode === 'skip') {
        return `${qObj.hops} × ${qObj.step} = ${qObj.hops * qObj.step}`
      }
      if (qObj.mode === 'product') {
        return `${qObj.a} × ${qObj.b} = ${qObj.a * qObj.b}`
      }
      if (qObj.mode === 'mystery') {
        return `${qObj.a} × ${qObj.b} = ${qObj.total}`
      }
    } else if (qObj.type === 'divide') {
      if (qObj.mode === 'share') {
        return `${qObj.total} ÷ ${qObj.divisor} = ${qObj.quotient}`
      }
      if (qObj.mode === 'grouping') {
        return `${qObj.total} ÷ ${qObj.groupSize} = ${qObj.numGroups}`
      }
      if (qObj.mode === 'quotient') {
        return `${qObj.total} ÷ ${qObj.divisor} = ${qObj.quotient}`
      }
      if (qObj.mode === 'remainder') {
        return `${qObj.total} ÷ ${qObj.divisor} = ${qObj.quotient} remainder ${qObj.remainder}`
      }
    }
    return ans
  }

  const handleCheck = () => {
    const ua = getUserAnswer()
    const ca = question.answer
    const correct = ua === ca
    if (correct) setScore(s => s + 1)
    const formattedCa = formatStandaloneVMAnswer(question, ca)
    setVmFB({ correct, correctAnswer: formattedCa, userAnswer: ua })
    setResults(p => [...p, { question: question.prompt, userAnswer: ua, correctAnswer: formattedCa, correct }])
  }

  const handleSolveVM = () => {
    const ca = question.answer
    const m = question.mode
    if (m === 'array') {
      const all = new Set(); for (let i = 0; i < question.rows * question.cols; i++) all.add(i)
      setFilledCells(all)
    } else if (m === 'groups') {
      setBuckets(Array(question.numGroups).fill(question.perGroup))
    } else if (m === 'skip') {
      setHopCount(question.hops)
    } else if (m === 'share') {
      setPlateItems(Array(question.divisor).fill(question.quotient))
    } else if (m === 'grouping') {
      setFormedGroups(question.numGroups); setGroupProg(0)
    } else if (m === 'product' || m === 'quotient') {
      const blks = []; let rem = ca; let bid = 0
      for (const d of [100, 50, 10, 5, 1]) { while (rem >= d) { blks.push({ id: `sv-${d}-${bid++}`, val: d }); rem -= d } }
      setRightBlocks(blks); setBankBlocks([])
    } else if (m === 'mystery' || m === 'remainder') {
      setTextAns(String(ca))
    }
    const formattedCa = formatStandaloneVMAnswer(question, ca)
    setVmFB({ correct: false, correctAnswer: formattedCa, revealed: true })
    setResults(p => [...p, { question: question.prompt, userAnswer: '—', correctAnswer: formattedCa, correct: false }])
  }

  const handleNext = () => {
    if (qIndex + 1 >= numQ) { setPhase('result'); return }
    setQIndex(i => i + 1); fetchQ()
  }

  // Scale drag handlers
  const vmDS = (e, block, zone) => { e.dataTransfer.setData('text/plain', JSON.stringify({ block, zone })); e.currentTarget.classList.add('dragging') }
  const vmDE = (e) => e.currentTarget.classList.remove('dragging')
  const vmDO = (e) => e.preventDefault()
  const vmDrop = (e, dz) => {
    e.preventDefault(); if (vmFB) return
    try {
      const { block, zone } = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (zone === dz) return
      if (zone === 'bank' && dz === 'right') { setBankBlocks(p => p.filter(b => b.id !== block.id)); setRightBlocks(p => [...p, block]) }
      else if (zone === 'right' && dz === 'bank') { setRightBlocks(p => p.filter(b => b.id !== block.id)); setBankBlocks(p => [...p, block]) }
    } catch (_) { }
  }

  /* ── 1. Array Builder ───────────────────────────────────────────────── */
  const renderArrayBuilder = () => {
    const { rows, cols, emoji } = question
    const total = rows * cols
    const cellSz = Math.min(50, Math.floor(290 / cols))
    const fsSz = Math.min(26, Math.floor(220 / cols))
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
          🟦 Tap cells to build a <strong>{rows}×{cols}</strong> array of {emoji}!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSz}px)`, gap: '5px', margin: '0 auto 12px', width: 'fit-content' }}>
          {Array.from({ length: total }, (_, i) => {
            const row = Math.floor(i / cols)
            const filled = filledCells.has(i)
            const color = VM_ROW_COLORS[row % VM_ROW_COLORS.length]
            return (
              <div key={i}
                onClick={() => !vmFB && setFilledCells(p => { const n = new Set(p); filled ? n.delete(i) : n.add(i); return n })}
                className={filled ? 'vm-cell-filled' : ''}
                style={{
                  width: cellSz, height: cellSz, borderRadius: '8px', fontSize: fsSz,
                  background: filled ? color : 'var(--clr-surface)',
                  border: `2px solid ${filled ? color : 'var(--clr-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: vmFB ? 'default' : 'pointer',
                  boxShadow: filled ? '0 3px 8px rgba(0,0,0,0.25)' : 'none',
                  transition: 'background 0.12s, box-shadow 0.12s',
                }}
              >{filled ? emoji : ''}</div>
            )
          })}
        </div>
        <p style={{ fontWeight: 700, color: 'var(--clr-accent)', fontSize: '1.1rem' }}>
          Filled: {filledCells.size} / {total}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--clr-dim)' }}>Tap to fill · tap again to unfill</p>
      </div>
    )
  }

  /* ── 2. Equal Groups ────────────────────────────────────────────────── */
  const renderEqualGroups = () => {
    if (buckets.length === 0) return null
    const { numGroups, perGroup, emoji } = question
    const total = buckets.reduce((s, c) => s + c, 0)
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>
          🧺 Put <strong>{perGroup}</strong> {emoji} into each of <strong>{numGroups}</strong> bucket{numGroups > 1 ? 's' : ''}! Total = ?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
          {buckets.map((count, i) => {
            const color = VM_ROW_COLORS[i % VM_ROW_COLORS.length]
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '78px', minHeight: '68px', background: `${color}20`, border: `2px solid ${color}`,
                  borderRadius: '12px', padding: '6px', display: 'flex', flexWrap: 'wrap',
                  alignContent: 'flex-start', justifyContent: 'center', gap: '1px', fontSize: '1.15rem'
                }}>
                  {Array.from({ length: count }).map((_, j) => <span key={j}>{emoji}</span>)}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.78rem', color }}>Bkt {i + 1} ({count})</div>
                {!vmFB && (
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button className="vm-bucket-btn" style={{ background: '#e74c3c', color: '#fff' }}
                      onClick={() => setBuckets(p => p.map((v, idx) => idx === i ? Math.max(0, v - 1) : v))}>−</button>
                    <button className="vm-bucket-btn" style={{ background: '#2ecc71', color: '#fff' }}
                      onClick={() => setBuckets(p => p.map((v, idx) => idx === i ? v + 1 : v))}>+</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p style={{ fontWeight: 700, color: 'var(--clr-accent)', fontSize: '1.1rem' }}>Total: {total}</p>
      </div>
    )
  }

  /* ── 3. Skip Counter ────────────────────────────────────────────────── */
  const renderSkipCounter = () => {
    const { step, hops: targetHops, target } = question
    const curPos = hopCount * step
    const lineVals = Array.from({ length: targetHops + 2 }, (_, i) => i * step)
    const maxVal = (targetHops + 1) * step
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
          🐸 Jump by <strong>{step}</strong>s to reach <strong style={{ color: 'var(--clr-accent)' }}>{target}</strong>!
        </p>
        <div style={{ position: 'relative', height: '88px', margin: '6px 24px 4px', userSelect: 'none' }}>
          <div style={{ position: 'absolute', bottom: '22px', left: 0, right: 0, height: '4px', background: 'var(--clr-border)', borderRadius: '2px' }} />
          {lineVals.map((val, i) => {
            const pct = (val / maxVal) * 100
            const isCur = val === curPos
            const isTgt = val === target
            return (
              <div key={i} style={{ position: 'absolute', bottom: '18px', left: `${pct}%`, transform: 'translateX(-50%)' }}>
                <div style={{ width: '3px', height: isTgt ? '20px' : '14px', background: isTgt ? '#e74c3c' : '#888', margin: '0 auto' }} />
                <div style={{ fontSize: '0.68rem', color: isTgt ? '#e74c3c' : 'var(--clr-dim)', textAlign: 'center', marginTop: '2px', fontWeight: isTgt ? 700 : 400 }}>{val}</div>
                {isCur && (
                  <div style={{
                    position: 'absolute', bottom: '16px', left: '50%', fontSize: '1.7rem',
                    animation: 'frogBounce 0.4s ease', whiteSpace: 'nowrap', pointerEvents: 'none'
                  }}>🐸</div>
                )}
              </div>
            )
          })}
        </div>
        <p style={{ fontWeight: 600, margin: '14px 0 8px' }}>
          Position: <span style={{ color: 'var(--clr-accent)' }}>{curPos}</span> &nbsp;|&nbsp; Hops: <span style={{ color: '#e67e22' }}>{hopCount}</span>
        </p>
        {!vmFB && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setHopCount(h => Math.max(0, h - 1))}
              style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: '#e74c3c', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              ← Back
            </button>
            <button onClick={() => setHopCount(h => h + 1)}
              style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: '#2ecc71', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Hop! 🐸
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ── 4. Fair Share ──────────────────────────────────────────────────── */
  const renderFairShare = () => {
    if (plateItems.length === 0) return null
    const { total, divisor, emoji } = question
    const distributed = plateItems.reduce((s, c) => s + c, 0)
    const remaining = total - distributed
    const distributeOne = () => {
      if (remaining <= 0 || vmFB) return
      const minIdx = plateItems.indexOf(Math.min(...plateItems))
      setPlateItems(p => p.map((v, i) => i === minIdx ? v + 1 : v))
    }
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>
          Share <strong style={{ color: 'var(--clr-accent)' }}>{total}</strong> {emoji} equally among <strong>{divisor}</strong> plates!
        </p>
        <div style={{ background: 'var(--clr-surface)', border: '2px dashed var(--clr-border)', borderRadius: '12px', padding: '10px', marginBottom: '12px', minHeight: '50px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-dim)', marginBottom: '4px' }}>Pool ({remaining} remaining)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center', fontSize: '1.4rem' }}>
            {Array.from({ length: Math.min(remaining, 60) }).map((_, i) => <span key={i}>{emoji}</span>)}
            {remaining > 60 && <span style={{ fontSize: '0.85rem', color: 'var(--clr-dim)', alignSelf: 'center' }}>+{remaining - 60}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
          {plateItems.map((count, i) => {
            const color = VM_PLATE_COLORS[i % VM_PLATE_COLORS.length]
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '80px', minHeight: '68px', padding: '7px', background: `${color}18`,
                  border: `3px solid ${color}`, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '1px', fontSize: '1.2rem'
                }}>
                  {Array.from({ length: count }).map((_, j) => <span key={j}>{emoji}</span>)}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.76rem', color }}>Plate {i + 1} ({count})</div>
              </div>
            )
          })}
        </div>
        {!vmFB && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={distributeOne} disabled={remaining === 0}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 600, color: '#fff',
                cursor: remaining > 0 ? 'pointer' : 'not-allowed', background: remaining > 0 ? '#3498db' : '#666'
              }}>
              Give One 🍽️
            </button>
            <button onClick={() => setPlateItems(Array(divisor).fill(0))}
              style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', background: '#e67e22', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Reset 🔄
            </button>
          </div>
        )}
        <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '10px', color: 'var(--clr-accent)' }}>
          Each plate: {plateItems[0] || 0} {emoji}
        </p>
      </div>
    )
  }

  /* ── 5. Grouping ────────────────────────────────────────────────────── */
  const renderGrouping = () => {
    const { total, groupSize, emoji } = question
    const grouped = formedGroups * groupSize
    const remaining = total - grouped - groupProg
    const addToGroup = () => {
      if (vmFB || remaining <= 0) return
      if (groupProg + 1 === groupSize) { setFormedGroups(g => g + 1); setGroupProg(0) }
      else setGroupProg(p => p + 1)
    }
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>
          Group <strong style={{ color: 'var(--clr-accent)' }}>{total}</strong> {emoji} into groups of <strong>{groupSize}</strong>! How many groups?
        </p>
        {formedGroups > 0 && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            {Array.from({ length: formedGroups }).map((_, gi) => {
              const color = VM_ROW_COLORS[gi % VM_ROW_COLORS.length]
              return (
                <div key={gi} style={{ padding: '6px 8px', background: `${color}20`, border: `2px solid ${color}`, borderRadius: '10px', fontSize: '1.15rem' }}>
                  {Array.from({ length: groupSize }).map((_, j) => <span key={j}>{emoji}</span>)}
                  <div style={{ fontSize: '0.68rem', color, fontWeight: 700 }}>Grp {gi + 1}</div>
                </div>
              )
            })}
          </div>
        )}
        {groupProg > 0 && !vmFB && (
          <div style={{ padding: '6px 10px', background: '#f39c1222', border: '2px dashed #f39c12', borderRadius: '10px', fontSize: '1.15rem', display: 'inline-block', marginBottom: '10px' }}>
            {Array.from({ length: groupProg }).map((_, j) => <span key={j}>{emoji}</span>)}
            <div style={{ fontSize: '0.68rem', color: '#f39c12' }}>{groupProg}/{groupSize}</div>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center', fontSize: '1.25rem', minHeight: '36px', marginBottom: '8px' }}>
          {Array.from({ length: Math.min(remaining, 80) }).map((_, i) => <span key={i}>{emoji}</span>)}
          {remaining > 80 && <span style={{ fontSize: '0.82rem', color: 'var(--clr-dim)', alignSelf: 'center' }}>+{remaining - 80}</span>}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--clr-dim)', marginBottom: '8px' }}>{remaining} remaining</p>
        {!vmFB && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={addToGroup} disabled={remaining === 0}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: 'none', fontWeight: 700, color: '#fff',
                cursor: remaining > 0 ? 'pointer' : 'not-allowed', background: remaining > 0 ? '#2ecc71' : '#666'
              }}>
              Add to Group ✅
            </button>
            <button onClick={() => { setFormedGroups(0); setGroupProg(0) }}
              style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Reset 🔄
            </button>
          </div>
        )}
        <p style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: '10px', color: 'var(--clr-accent)' }}>
          Groups formed: {formedGroups}
        </p>
      </div>
    )
  }

  /* ── 6. Scale Modes (product · mystery · quotient · remainder) ────── */
  const renderScaleMode = () => {
    const m = question.mode
    const isText = (m === 'mystery' || m === 'remainder')
    let leftTop = '', leftBot = '', leftNum = question.answer
    if (m === 'product') { leftTop = `${question.a} × ${question.b}`; leftBot = '= ?' }
    if (m === 'mystery') { leftTop = `? × ${question.b} = ${question.total}`; leftBot = 'Find ?' }
    if (m === 'quotient') { leftTop = `${question.total} ÷ ${question.divisor}`; leftBot = '= ?' }
    if (m === 'remainder') { leftTop = `${question.total} ÷ ${question.divisor}`; leftBot = `= ? R ${question.remainder}` }

    const rTotal = rightBlocks.reduce((s, b) => s + b.val, 0)
    const diff = isText ? 0 : rTotal - leftNum
    const sf = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 0.5 : 0.15
    const tilt = Math.min(20, Math.max(-20, diff * sf))
    const pTilt = -tilt

    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>{question.prompt}</p>
        {isText ? (
          <div style={{ margin: '16px 0' }}>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ padding: '14px 20px', background: '#34495e', color: '#fff', borderRadius: '14px', fontWeight: 700, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', minWidth: '100px' }}>
                <div style={{ fontSize: '1.6rem' }}>⚖️</div>
                <div style={{ fontSize: '1rem' }}>{leftTop}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{leftBot}</div>
              </div>
              <div style={{ fontSize: '2rem', color: 'var(--clr-dim)' }}>=</div>
              <div style={{ padding: '14px 20px', background: 'var(--clr-surface)', border: '3px solid var(--clr-accent)', borderRadius: '14px', fontWeight: 700, textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '1.6rem', color: 'var(--clr-accent)' }}>{textAns || '?'}</div>
                {m === 'remainder' && <div style={{ fontSize: '0.72rem', color: 'var(--clr-dim)' }}>R {question.remainder}</div>}
              </div>
            </div>
            <input className="answer-input" type="number" min="1"
              value={textAns} onChange={e => !vmFB && setTextAns(e.target.value)}
              placeholder="Type the answer" disabled={!!vmFB}
              style={{ maxWidth: '200px', margin: '0 auto', display: 'block', textAlign: 'center' }} />
          </div>
        ) : (
          <>
            <div className="scale-container" style={{ height: '210px', marginTop: '12px' }}>
              <div className="scale-beam" style={{ transform: `rotate(${tilt}deg)` }}>
                <div className="scale-pan left" style={{ transform: `rotate(${pTilt}deg)`, height: '105px', width: '115px' }}>
                  <div style={{ background: '#34495e', color: '#fff', padding: '6px 10px', borderRadius: '10px', fontWeight: 700, textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem' }}>{leftTop}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{leftBot}</div>
                  </div>
                </div>
                <div className="scale-pan right" style={{ transform: `rotate(${pTilt}deg)`, height: '105px', width: '115px' }}
                  onDragOver={vmDO} onDrop={e => vmDrop(e, 'right')}>
                  {rightBlocks.map(b => (
                    <div key={b.id} className={`weight-block val-${b.val}`}
                      draggable={!vmFB}
                      onDragStart={e => vmDS(e, b, 'right')} onDragEnd={vmDE}
                      style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                      {b.val}
                    </div>
                  ))}
                </div>
              </div>
              <div className="scale-fulcrum" style={{ borderBottomWidth: '60px', borderLeftWidth: '35px', borderRightWidth: '35px' }} />
            </div>
            <div className="weight-bank" onDragOver={vmDO} onDrop={e => vmDrop(e, 'bank')}
              style={{ padding: '12px', marginTop: '14px', minHeight: '70px', gap: '8px' }}>
              {bankBlocks.map(b => (
                <div key={b.id} className={`weight-block val-${b.val}`}
                  draggable={!vmFB}
                  onDragStart={e => vmDS(e, b, 'bank')} onDragEnd={vmDE}
                  style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
                  {b.val}
                </div>
              ))}
            </div>
            <p style={{ fontWeight: 600, marginTop: '6px' }}>
              Right pan: <span style={{ color: 'var(--clr-accent)' }}>{rTotal}</span>
            </p>
          </>
        )}
      </div>
    )
  }

  const renderQBody = () => {
    if (!question) return null
    const m = question.mode
    if (m === 'array') return renderArrayBuilder()
    if (m === 'groups') return renderEqualGroups()
    if (m === 'skip') return renderSkipCounter()
    if (m === 'share') return renderFairShare()
    if (m === 'grouping') return renderGrouping()
    return renderScaleMode()
  }

  /* ── Setup screen ────────────────────────────────────────────────────── */
  if (phase === 'setup') return (
    <QuizLayout title="Multiplication & division" subtitle="Explore × and ÷ with interactive visuals!" onBack={onBack}>
      <div className="welcome-box">
        <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4px' }}>🔬</div>
        <p style={{ textAlign: 'center', color: 'var(--clr-dim)', marginBottom: '20px', fontSize: '0.9rem' }}>
          6 unique question types: arrays, fair share, skip counting, balance scales and more!
        </p>
        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Operation:</p>
        <div className="checkbox-group" style={{ marginBottom: '16px' }}>
          {[['multiply', '✖️ Multiplication'], ['divide', '➗ Division']].map(([op, lbl]) => (
            <label key={op} className={`checkbox-pill${operation === op ? ' active' : ''}`}>
              <input type="radio" name="vm-op" checked={operation === op} onChange={() => setOperation(op)} />{lbl}
            </label>
          ))}
        </div>
        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Visual Mode:</p>
        <div className="checkbox-group" style={{ marginBottom: '16px' }}>
          {[['counting', '🍎 Visual Counting'], ['scale', '⚖️ Balance Scale']].map(([vm, lbl]) => (
            <label key={vm} className={`checkbox-pill${visualMode === vm ? ' active' : ''}`}>
              <input type="radio" name="vm-vis" checked={visualMode === vm} onChange={() => setVMode(vm)} />{lbl}
            </label>
          ))}
        </div>
        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Difficulty:</p>
        <div className="checkbox-group" style={{ marginBottom: '16px' }}>
          {[['easy', '⭐ Easy'], ['medium', '⭐⭐ Medium'], ['hard', '⭐⭐⭐ Hard']].map(([d, lbl]) => (
            <label key={d} className={`checkbox-pill${difficulty === d ? ' active' : ''}`}>
              <input type="radio" name="vm-diff" checked={difficulty === d} onChange={() => setDifficulty(d)} />{lbl}
            </label>
          ))}
        </div>
        <div className="question-count-row">
          <label className="question-count-label">How many questions?</label>
          <input className="answer-input question-count-input" type="number" min="1" max="30"
            value={numQ} onChange={e => setNumQ(Math.max(1, Number(e.target.value)))} />
        </div>
        <div className="button-row"><button onClick={startQuiz}>Start Lab 🚀</button></div>
      </div>
    </QuizLayout>
  )

  /* ── Results screen ──────────────────────────────────────────────────── */
  if (phase === 'result') {
    const pct = score / numQ
    return (
      <QuizLayout title="Multiplication & division" subtitle="Quiz complete!" onBack={onBack}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '3.5rem' }}>{pct >= 0.8 ? '🏆' : pct >= 0.5 ? '⭐' : '💪'}</div>
          <h2 style={{ margin: '8px 0' }}>Score: {score} / {numQ}</h2>
          <p style={{ color: 'var(--clr-dim)' }}>{pct >= 0.8 ? 'Excellent work!' : pct >= 0.5 ? 'Good effort! Keep practising.' : 'Keep going — you\'ll get there!'}</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr>{['Question', 'Your Ans', 'Correct', 'Result'].map(h => (
                <th key={h} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '2px solid var(--clr-border)', fontSize: '0.78rem' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ background: r.correct ? '#2ecc7115' : '#e74c3c15' }}>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid var(--clr-border)', fontSize: '0.72rem' }}>{r.question}</td>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid var(--clr-border)', textAlign: 'center' }}>{r.userAnswer}</td>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid var(--clr-border)', textAlign: 'center' }}>{r.correctAnswer}</td>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid var(--clr-border)', textAlign: 'center' }}>{r.correct ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="button-row">
          <button onClick={() => { setPhase('setup'); setQuestion(null) }}>Play Again 🔄</button>
        </div>
      </QuizLayout>
    )
  }

  /* ── Quiz screen ─────────────────────────────────────────────────────── */
  const fbMsg = vmFB
    ? (vmFB.correct ? `✅ Correct! Answer = ${vmFB.correctAnswer}`
      : vmFB.revealed ? `Solution: Answer = ${vmFB.correctAnswer}`
        : `❌ Incorrect. Answer = ${vmFB.correctAnswer}`)
    : ''

  return (
    <QuizLayout
      title="Multiplication & division"
      subtitle={`${operation === 'multiply' ? '✖️ Multiply' : '➗ Divide'} · ${visualMode === 'counting' ? '🍎 Counting' : '⚖️ Scale'}`}
      onBack={onBack}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div className="progress-pill center">Q {qIndex + 1}/{numQ}</div>
        <div className="progress-pill" style={{ background: '#27ae60', color: '#fff' }}>Score: {score}</div>
      </div>
      {loading
        ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-dim)' }}>Loading question…</div>
        : renderQBody()
      }
      {vmFB && (
        <div className={`feedback ${vmFB.correct ? 'correct' : 'wrong'}`} style={{ marginTop: '14px' }}>
          {fbMsg}
        </div>
      )}
      <div className="button-row" style={{ marginTop: '16px' }}>
        {!vmFB ? (
          <>
            <button onClick={handleCheck}>Submit ✅</button>
            <button onClick={handleSolveVM}
              style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>
              Solve 💡
            </button>
          </>
        ) : (
          <button onClick={handleNext}>
            {qIndex + 1 >= numQ ? 'See Results 🏆' : 'Next →'}
          </button>
        )}
      </div>
    </QuizLayout>
  )
}

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ThreeDViewer, { SHAPE_TYPES } from './components/ThreeDViewer'

const C = { bg: '#0b0e14', card: '#141820', surface: '#1c2028', accent: '#4dabf7', green: '#51cf66', red: '#ff6b6b', text: '#e8e8e8', muted: '#8b949e', border: '#2d333b' }

const DIFFICULTIES = { easy: 'Easy', medium: 'Medium', hard: 'Hard', extrahard: 'Extra Hard' }

const SHAPES = {
  easy: [
    { shape3d: 'cube', dims: { w: 1, h: 1, d: 1 }, label: 'Cube', views: { top: 'square', front: 'square', side: 'square' } },
    { shape3d: 'cuboid', dims: { w: 1.4, h: 0.8, d: 0.6 }, label: 'Cuboid A', views: { top: 'rect-wd', front: 'rect-wh', side: 'rect-dh' } },
    { shape3d: 'cuboid', dims: { w: 1.2, h: 1.2, d: 0.5 }, label: 'Cuboid B', views: { top: 'rect-wd', front: 'square-wh', side: 'rect-dh' } },
  ],
  medium: [
    { shape3d: 'cylinder', dims: { r: 0.5, height: 1.2 }, label: 'Cylinder', views: { top: 'circle', front: 'rect-cyl', side: 'rect-cyl' } },
    { shape3d: 'cone', dims: { r: 0.6, height: 1.2 }, label: 'Cone', views: { top: 'circle-dot', front: 'triangle', side: 'triangle' } },
    { shape3d: 'pyramid', dims: { r: 0.7, height: 1, sides: 4 }, label: 'Square Pyramid', views: { top: 'square-x', front: 'triangle', side: 'triangle' } },
    { shape3d: 'triangular-prism', dims: { r: 0.6, height: 1 }, label: 'Triangular Prism', views: { top: 'triangle', front: 'rect-prism', side: 'rect-prism' } },
  ],
  hard: [
    { shape3d: 'frustum', dims: { r: 0.6, height: 1 }, label: 'Frustum', views: { top: 'concentric', front: 'trapezoid', side: 'trapezoid' } },
    { shape3d: 'sphere', dims: { r: 0.6 }, label: 'Sphere', views: { top: 'circle', front: 'circle', side: 'circle' } },
    { shape3d: 'cylinder', dims: { r: 0.3, height: 1.4 }, label: 'Tall Cylinder', views: { top: 'circle', front: 'rect-tall', side: 'rect-tall' } },
  ],
  extrahard: [
    { shape3d: 'frustum', dims: { r: 0.7, height: 0.8 }, label: 'Wide Frustum', views: { top: 'concentric', front: 'trapezoid-wide', side: 'trapezoid-wide' } },
    { shape3d: 'cone', dims: { r: 0.4, height: 1.4 }, label: 'Tall Cone', views: { top: 'circle-dot', front: 'triangle-tall', side: 'triangle-tall' } },
    { shape3d: 'triangular-prism', dims: { r: 0.7, height: 1.2 }, label: 'Wide Tri Prism', views: { top: 'triangle-wide', front: 'rect-wide', side: 'rect-wide' } },
    { shape3d: 'pyramid', dims: { r: 0.5, height: 1.3, sides: 4 }, label: 'Tall Pyramid', views: { top: 'square-x', front: 'triangle-tall', side: 'triangle-tall' } },
  ]
}

function renderProjection(type, size = 100) {
  const s = size, h = s / 2, cx = s / 2, cy = s / 2
  const sw = 2
  switch (type) {
    case 'square':
      return <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rect-wd':
      return <rect x={s * 0.1} y={s * 0.25} width={s * 0.8} height={s * 0.5} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rect-wh':
      return <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rect-dh':
      return <rect x={s * 0.3} y={s * 0.15} width={s * 0.4} height={s * 0.7} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'square-wh':
      return <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'circle':
      return <circle cx={cx} cy={cy} r={s * 0.35} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'circle-dot':
      return <><circle cx={cx} cy={cy} r={s * 0.35} fill="none" stroke={C.text} strokeWidth={sw} /><circle cx={cx} cy={cy} r={3} fill={C.text} /></>
    case 'rect-cyl':
      return <rect x={s * 0.2} y={s * 0.15} width={s * 0.6} height={s * 0.7} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rect-tall':
      return <rect x={s * 0.3} y={s * 0.08} width={s * 0.4} height={s * 0.84} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'triangle':
      return <polygon points={`${cx},${s * 0.15} ${s * 0.15},${s * 0.85} ${s * 0.85},${s * 0.85}`} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'triangle-tall':
      return <polygon points={`${cx},${s * 0.08} ${s * 0.2},${s * 0.88} ${s * 0.8},${s * 0.88}`} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'square-x': {
      const a = s * 0.15, b = s * 0.85
      return <><rect x={a} y={a} width={b - a} height={b - a} fill="none" stroke={C.text} strokeWidth={sw} /><line x1={a} y1={a} x2={b} y2={b} stroke={C.text} strokeWidth={1} /><line x1={b} y1={a} x2={a} y2={b} stroke={C.text} strokeWidth={1} /></>
    }
    case 'triangle-wide':
      return <polygon points={`${cx},${s * 0.12} ${s * 0.08},${s * 0.88} ${s * 0.92},${s * 0.88}`} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rect-prism':
      return <rect x={s * 0.15} y={s * 0.2} width={s * 0.7} height={s * 0.6} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rect-wide':
      return <rect x={s * 0.1} y={s * 0.2} width={s * 0.8} height={s * 0.6} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'concentric':
      return <><circle cx={cx} cy={cy} r={s * 0.38} fill="none" stroke={C.text} strokeWidth={sw} /><circle cx={cx} cy={cy} r={s * 0.18} fill="none" stroke={C.text} strokeWidth={sw} /></>
    case 'trapezoid':
      return <polygon points={`${s * 0.25},${s * 0.2} ${s * 0.75},${s * 0.2} ${s * 0.85},${s * 0.8} ${s * 0.15},${s * 0.8}`} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'trapezoid-wide':
      return <polygon points={`${s * 0.3},${s * 0.2} ${s * 0.7},${s * 0.2} ${s * 0.9},${s * 0.8} ${s * 0.1},${s * 0.8}`} fill="none" stroke={C.text} strokeWidth={sw} />
    default:
      return <rect x={s * 0.2} y={s * 0.2} width={s * 0.6} height={s * 0.6} fill="none" stroke={C.text} strokeWidth={sw} />
  }
}

function generateQuestion(difficulty) {
  const pool = SHAPES[difficulty] || SHAPES.easy
  const shapeDef = pool[Math.floor(Math.random() * pool.length)]
  const views = ['top', 'front', 'side']
  const viewName = views[Math.floor(Math.random() * views.length)]
  const correctType = shapeDef.views[viewName]

  const wrongTypes = []
  const allTypes = new Set()
  Object.values(SHAPES).flat().forEach(s => { Object.values(s.views).forEach(v => allTypes.add(v)) })
  allTypes.forEach(t => { if (t !== correctType && wrongTypes.length < 6) wrongTypes.push(t) })
  while (wrongTypes.length < 3) wrongTypes.push('square')

  const shuffled = [...wrongTypes].sort(() => Math.random() - 0.5).slice(0, 3)
  const options = [...shuffled, correctType].sort(() => Math.random() - 0.5)

  return { shapeDef, viewName, correctType, options, correctIdx: options.indexOf(correctType) }
}

export default function SpatialReasoningMCQ({ onBack }) {
  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('easy')
  const [totalQ, setTotalQ] = useState(10)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [answers, setAnswers] = useState([])
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (phase === 'playing') {
      const iv = setInterval(() => setElapsed(Date.now() - startTime), 1000)
      return () => clearInterval(iv)
    }
  }, [phase, startTime])

  const startGame = () => {
    const qs = Array.from({ length: totalQ }, () => generateQuestion(difficulty))
    setQuestions(qs)
    setCurrentIdx(0)
    setSelected(null)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setAnswers([])
    setStartTime(Date.now())
    setElapsed(0)
    setShowResult(false)
    setPhase('playing')
  }

  const q = questions[currentIdx]

  const selectOption = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    const correct = idx === q.correctIdx
    const newScore = correct ? score + 1 : score
    const newStreak = correct ? streak + 1 : 0
    if (correct) setScore(newScore)
    setStreak(newStreak)
    setMaxStreak(Math.max(maxStreak, newStreak))
    setAnswers(prev => [...prev, { qIdx: currentIdx, selected: idx, correct }])
    setShowResult(true)
    setTimeout(() => {
      if (currentIdx + 1 < totalQ) {
        setCurrentIdx(currentIdx + 1)
        setSelected(null)
        setShowResult(false)
      } else {
        setPhase('finished')
      }
    }, 1500)
  }

  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'playing') return
      if (['1', '2', '3', '4'].includes(e.key) && selected === null) {
        selectOption(parseInt(e.key) - 1)
      }
      if (e.key === ' ' && selected !== null) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, selected, currentIdx, questions])

  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16, marginBottom: 20 }}>← Back to Home</button>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Spatial Reasoning</h1>
          <p style={{ color: C.muted, marginBottom: 32 }}>Identify 2D orthographic views of 3D shapes</p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: C.muted, fontSize: 14, display: 'block', marginBottom: 8 }}>Difficulty</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {Object.entries(DIFFICULTIES).map(([k, v]) => (
                <button key={k} onClick={() => setDifficulty(k)} style={{ padding: '8px 16px', borderRadius: 8, border: difficulty === k ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: difficulty === k ? C.accent + '22' : C.card, color: C.text, cursor: 'pointer', fontWeight: difficulty === k ? 700 : 400 }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <label style={{ color: C.muted, fontSize: 14, display: 'block', marginBottom: 8 }}>Questions</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[5, 10, 15].map(n => (
                <button key={n} onClick={() => setTotalQ(n)} style={{ padding: '8px 16px', borderRadius: 8, border: totalQ === n ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: totalQ === n ? C.accent + '22' : C.card, color: C.text, cursor: 'pointer', fontWeight: totalQ === n ? 700 : 400 }}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={startGame} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: C.accent, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Start Quiz</button>
        </div>
      </div>
    )
  }

  if (phase === 'finished') {
    const accuracy = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0
    const mins = Math.floor(elapsed / 60000)
    const secs = Math.floor((elapsed % 60000) / 1000)
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Quiz Complete!</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[{ label: 'Score', value: `${score}/${totalQ}`, color: C.green }, { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 70 ? C.green : C.red }, { label: 'Best Streak', value: maxStreak, color: C.accent }, { label: 'Time', value: `${mins}:${secs.toString().padStart(2, '0')}`, color: C.muted }].map(item => (
              <div key={item.label} style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={startGame} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>New Quiz</button>
            <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, cursor: 'pointer' }}>Back to Home</button>
          </div>
        </div>
      </div>
    )
  }

  const viewLabels = { top: 'Top', front: 'Front', side: 'Side' }
  const mins = Math.floor(elapsed / 60000)
  const secs = Math.floor((elapsed % 60000) / 1000)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, maxWidth: 900, margin: '0 auto 20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16 }}>← Back</button>
        <h2 style={{ fontSize: 18, margin: 0 }}>Spatial Reasoning</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 }}>
          <span style={{ color: C.muted }}>{currentIdx + 1}/{totalQ}</span>
          <span style={{ color: C.green, fontWeight: 700 }}>{score} pts</span>
          <span style={{ color: C.muted }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div style={{ height: 4, background: C.surface, borderRadius: 2, maxWidth: 900, margin: '0 auto 20px' }}>
        <div style={{ height: '100%', width: `${((currentIdx + 1) / totalQ) * 100}%`, background: C.accent, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      {q && (
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>3D Shape</div>
              <ThreeDViewer shapeType={q.shapeDef.shape3d} dimensions={q.shapeDef.dims} width={320} height={280} autoRotate showDimensions />
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: C.muted }}>{q.shapeDef.label}</div>
          </div>
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
              Which is the <span style={{ color: C.accent }}>{viewLabels[q.viewName]}</span> view?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {q.options.map((optType, idx) => {
                const isCorrect = idx === q.correctIdx
                const isSelected = idx === selected
                let bg = C.surface
                let border = C.border
                if (showResult && isCorrect) { bg = C.green + '22'; border = C.green }
                else if (showResult && isSelected && !isCorrect) { bg = C.red + '22'; border = C.red }
                else if (isSelected) { bg = C.accent + '22'; border = C.accent }
                return (
                  <button key={idx} onClick={() => selectOption(idx)} style={{
                    background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: 12, cursor: showResult ? 'default' : 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                  }}>
                    <svg width={120} height={120} viewBox="0 0 120 120" style={{ background: '#f0f0f0', borderRadius: 8 }}>
                      {renderProjection(optType, 120)}
                    </svg>
                    <span style={{ fontSize: 12, color: C.muted }}>{['A', 'B', 'C', 'D'][idx]}</span>
                  </button>
                )
              })}
            </div>
            {showResult && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: q.correctIdx === selected ? C.green + '22' : C.red + '22', textAlign: 'center', fontWeight: 600, color: q.correctIdx === selected ? C.green : C.red }}>
                {q.correctIdx === selected ? 'Correct!' : `Incorrect — the ${viewLabels[q.viewName]} view is a ${q.options[q.correctIdx].replace('-', ' ')}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useRef, useEffect, useCallback } from 'react'
import ThreeDViewer from './components/ThreeDViewer'
import ScribbleCanvas from './components/ScribbleCanvas'

const C = { bg: '#0b0e14', card: '#141820', surface: '#1c2028', accent: '#4dabf7', green: '#51cf66', red: '#ff6b6b', text: '#e8e8e8', muted: '#8b949e', border: '#2d333b' }

const SHAPES = {
  easy: [
    { shape3d: 'cube', dims: { w: 1, h: 1, d: 1 }, label: 'Cube', views: { top: 'square', front: 'square', side: 'square' } },
    { shape3d: 'cuboid', dims: { w: 1.4, h: 0.8, d: 0.6 }, label: 'Cuboid', views: { top: { w: 1.4, h: 0.6 }, front: { w: 1.4, h: 0.8 }, side: { w: 0.6, h: 0.8 } } },
    { shape3d: 'cylinder', dims: { r: 0.5, height: 1.2 }, label: 'Cylinder', views: { top: 'circle', front: { w: 1, h: 1.2 }, side: { w: 1, h: 1.2 } } },
  ],
  medium: [
    { shape3d: 'cone', dims: { r: 0.6, height: 1.2 }, label: 'Cone', views: { top: 'circle-dot', front: 'triangle', side: 'triangle' } },
    { shape3d: 'pyramid', dims: { r: 0.7, height: 1, sides: 4 }, label: 'Square Pyramid', views: { top: 'square-x', front: 'triangle', side: 'triangle' } },
    { shape3d: 'triangular-prism', dims: { r: 0.6, height: 1 }, label: 'Tri. Prism', views: { top: 'triangle', front: 'rectangle', side: 'rectangle' } },
  ],
  hard: [
    { shape3d: 'frustum', dims: { r: 0.6, height: 1 }, label: 'Frustum', views: { top: 'concentric', front: 'trapezoid', side: 'trapezoid' } },
    { shape3d: 'cuboid', dims: { w: 1.6, h: 0.4, d: 0.8 }, label: 'Flat Cuboid', views: { top: { w: 1.6, h: 0.8 }, front: { w: 1.6, h: 0.4 }, side: { w: 0.8, h: 0.4 } } },
  ]
}

function renderProjection2D(type, w, h, size = 110) {
  const sw = 2
  const s = size, pad = s * 0.12
  if (typeof type === 'object' && type.w) {
    const rw = (type.w / 2) * (s - 2 * pad)
    const rh = (type.h / 2) * (s - 2 * pad)
    return <rect x={(s - rw) / 2} y={(s - rh) / 2} width={rw} height={rh} fill="none" stroke={C.text} strokeWidth={sw} />
  }
  switch (type) {
    case 'square':
      return <rect x={pad} y={pad} width={s - 2 * pad} height={s - 2 * pad} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'rectangle':
      return <rect x={pad * 1.5} y={pad * 1.5} width={s - 3 * pad} height={s - 3 * pad} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'circle':
      return <circle cx={s / 2} cy={s / 2} r={(s - 2 * pad) / 2} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'circle-dot':
      return <><circle cx={s / 2} cy={s / 2} r={(s - 2 * pad) / 2} fill="none" stroke={C.text} strokeWidth={sw} /><circle cx={s / 2} cy={s / 2} r={3} fill={C.text} /></>
    case 'triangle':
      return <polygon points={`${s / 2},${pad} ${pad},${s - pad} ${s - pad},${s - pad}`} fill="none" stroke={C.text} strokeWidth={sw} />
    case 'square-x':
      return <><rect x={pad} y={pad} width={s - 2 * pad} height={s - 2 * pad} fill="none" stroke={C.text} strokeWidth={sw} /><line x1={pad} y1={pad} x2={s - pad} y2={s - pad} stroke={C.text} strokeWidth={1} /><line x1={s - pad} y1={pad} x2={pad} y2={s - pad} stroke={C.text} strokeWidth={1} /></>
    case 'concentric':
      return <><circle cx={s / 2} cy={s / 2} r={(s - 2 * pad) / 2} fill="none" stroke={C.text} strokeWidth={sw} /><circle cx={s / 2} cy={s / 2} r={(s - 2 * pad) / 4} fill="none" stroke={C.text} strokeWidth={sw} /></>
    case 'trapezoid':
      return <polygon points={`${s * 0.3},${pad * 1.5} ${s * 0.7},${pad * 1.5} ${s - pad},${s - pad * 1.5} ${pad},${s - pad * 1.5}`} fill="none" stroke={C.text} strokeWidth={sw} />
    default:
      return <rect x={pad} y={pad} width={s - 2 * pad} height={s - 2 * pad} fill="none" stroke={C.text} strokeWidth={sw} />
  }
}

function validateDrawing(elements, expectedType, expectedDims) {
  if (!elements || elements.length === 0) return { score: 0, feedback: 'Draw something first!' }
  const points = []
  elements.forEach(el => {
    if (el.points) points.push(...el.points)
    if (el.x1 !== undefined) points.push({ x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 })
  })
  if (points.length < 5) return { score: 10, feedback: 'Draw a more complete shape.' }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) })
  const dw = maxX - minX, dh = maxY - minY
  if (dw < 10 || dh < 10) return { score: 5, feedback: 'Shape is too small.' }
  const aspect = dw / Math.max(dh, 1)
  const closed = elements.some(el => el.type === 'pen' && el.points && el.points.length > 5 && Math.abs(el.points[0].x - el.points[el.points.length - 1].x) < 30 && Math.abs(el.points[0].y - el.points[el.points.length - 1].y) < 30)
  let score = 30
  if (closed) score += 20
  if (typeof expectedType === 'object' && expectedType.w) {
    const expectedAspect = expectedType.w / expectedType.h
    const aspectDiff = Math.abs(aspect - expectedAspect)
    if (aspectDiff < 0.3) score += 30
    else if (aspectDiff < 0.6) score += 15
    score += 20
  } else if (expectedType === 'square') {
    if (Math.abs(aspect - 1) < 0.2) score += 35
    else if (Math.abs(aspect - 1) < 0.4) score += 15
    score += closed ? 15 : 5
  } else if (expectedType === 'circle') {
    const cx2 = (minX + maxX) / 2, cy2 = (minY + maxY) / 2
    const rr = Math.min(dw, dh) / 2
    const variance = points.reduce((sum, p) => sum + Math.abs(Math.sqrt((p.x - cx2) ** 2 + (p.y - cy2) ** 2) - rr), 0) / points.length
    score += variance < rr * 0.15 ? 35 : variance < rr * 0.3 ? 15 : 5
    score += closed ? 15 : 5
  } else if (expectedType === 'triangle') {
    score += 25
    score += closed ? 15 : 5
  } else {
    score += 25
  }
  score = Math.min(100, score)
  const feedback = score >= 70 ? 'Great drawing!' : score >= 40 ? 'Not bad, try to be more precise.' : 'Keep practicing!'
  return { score, feedback }
}

function generateQuestion(difficulty, mode) {
  const pool = SHAPES[difficulty] || SHAPES.easy
  const shapeDef = pool[Math.floor(Math.random() * pool.length)]
  const views = ['top', 'front', 'side']
  const viewName = views[Math.floor(Math.random() * views.length)]
  const correctType = shapeDef.views[viewName]
  const viewLabels = { top: 'Top', front: 'Front', side: 'Side' }

  if (mode === '2dto3d' || (mode === 'mixed' && Math.random() > 0.5)) {
    const allShapes = Object.values(SHAPES).flat()
    const wrongShapes = allShapes.filter(s => s.label !== shapeDef.label).sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [{ ...shapeDef, correct: true }, ...wrongShapes.map(s => ({ ...s, correct: false }))].sort(() => Math.random() - 0.5)
    return { shapeDef, viewName, viewLabel: viewLabels[viewName], correctType, mode: '2dto3d', options }
  }
  return { shapeDef, viewName, viewLabel: viewLabels[viewName], correctType, mode: '3dto2d' }
}

export default function ShapeTranslatorApp({ onBack }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('easy')
  const [totalQ, setTotalQ] = useState(8)
  const [mode, setMode] = useState('mixed')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [selected3D, setSelected3D] = useState(null)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (phase === 'playing') {
      const iv = setInterval(() => setElapsed(Date.now() - startTime), 1000)
      return () => clearInterval(iv)
    }
  }, [phase, startTime])

  const startGame = () => {
    const qs = Array.from({ length: totalQ }, () => generateQuestion(difficulty, mode))
    setQuestions(qs); setCurrentIdx(0); setScore(0); setStartTime(Date.now()); setElapsed(0)
    setShowResult(false); setResultData(null); setSelected3D(null); setPhase('playing')
  }

  const q = questions[currentIdx]

  const checkAnswer = () => {
    if (!q) return
    if (q.mode === '3dto2d') {
      const data = canvasRef.current?.getElements()
      const result = validateDrawing(data, q.correctType, q.shapeDef.dims)
      setResultData(result)
      setScore(prev => prev + (result.score >= 60 ? 1 : 0))
    } else {
      if (selected3D === null) return
      const correct = q.options[selected3D].correct
      setResultData({ score: correct ? 100 : 0, feedback: correct ? 'Correct!' : 'Wrong shape!' })
      setScore(prev => prev + (correct ? 1 : 0))
    }
    setShowResult(true)
    setTimeout(() => {
      if (currentIdx + 1 < totalQ) {
        setCurrentIdx(currentIdx + 1); setShowResult(false); setResultData(null); setSelected3D(null)
        if (canvasRef.current?.clearAll) canvasRef.current.clearAll()
      } else { setPhase('finished') }
    }, 2000)
  }

  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16, marginBottom: 20 }}>← Back to Home</button>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>2D↔3D Shape Translator</h1>
          <p style={{ color: C.muted, marginBottom: 32 }}>Translate between 3D shapes and their 2D projections</p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: C.muted, fontSize: 14, display: 'block', marginBottom: 8 }}>Mode</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[['3dto2d', 'Draw 2D View'], ['2dto3d', 'Pick 3D Shape'], ['mixed', 'Mixed']].map(([k, v]) => (
                <button key={k} onClick={() => setMode(k)} style={{ padding: '8px 16px', borderRadius: 8, border: mode === k ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: mode === k ? C.accent + '22' : C.card, color: C.text, cursor: 'pointer', fontWeight: mode === k ? 700 : 400 }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: C.muted, fontSize: 14, display: 'block', marginBottom: 8 }}>Difficulty</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']].map(([k, v]) => (
                <button key={k} onClick={() => setDifficulty(k)} style={{ padding: '8px 16px', borderRadius: 8, border: difficulty === k ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: difficulty === k ? C.accent + '22' : C.card, color: C.text, cursor: 'pointer', fontWeight: difficulty === k ? 700 : 400 }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <label style={{ color: C.muted, fontSize: 14, display: 'block', marginBottom: 8 }}>Questions</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[5, 8, 12].map(n => (
                <button key={n} onClick={() => setTotalQ(n)} style={{ padding: '8px 16px', borderRadius: 8, border: totalQ === n ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: totalQ === n ? C.accent + '22' : C.card, color: C.text, cursor: 'pointer', fontWeight: totalQ === n ? 700 : 400 }}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={startGame} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: C.accent, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Start</button>
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
          <h1 style={{ fontSize: 28, marginBottom: 24 }}>Complete!</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[{ l: 'Score', v: `${score}/${totalQ}` }, { l: 'Accuracy', v: `${accuracy}%` }, { l: 'Time', v: `${mins}:${secs.toString().padStart(2, '0')}` }].map(i => (
              <div key={i.l} style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted }}>{i.l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>{i.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={startGame} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>New Quiz</button>
            <button onClick={onBack} style={{ padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, cursor: 'pointer' }}>Home</button>
          </div>
        </div>
      </div>
    )
  }

  const mins = Math.floor(elapsed / 60000)
  const secs = Math.floor((elapsed % 60000) / 1000)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1000, margin: '0 auto 20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16 }}>← Back</button>
        <h2 style={{ fontSize: 18, margin: 0 }}>2D↔3D Shape Translator</h2>
        <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <span style={{ color: C.muted }}>{currentIdx + 1}/{totalQ}</span>
          <span style={{ color: C.green, fontWeight: 700 }}>{score} pts</span>
          <span style={{ color: C.muted }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div style={{ height: 4, background: C.surface, borderRadius: 2, maxWidth: 1000, margin: '0 auto 20px' }}>
        <div style={{ height: '100%', width: `${((currentIdx + 1) / totalQ) * 100}%`, background: C.accent, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      {q && q.mode === '3dto2d' && (
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12 }}>
              <ThreeDViewer shapeType={q.shapeDef.shape3d} dimensions={q.shapeDef.dims} width={340} height={280} showDimensions autoRotate />
              <div style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 4 }}>{q.shapeDef.label}</div>
            </div>
          </div>
          <div style={{ flex: '1 1 380px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
              Draw the <span style={{ color: C.accent }}>{q.viewLabel}</span> view
            </div>
            <ScribbleCanvas ref={canvasRef} width={420} height={340} showGrid style={{ marginBottom: 12 }} />
            {!showResult ? (
              <button onClick={checkAnswer} style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Check</button>
            ) : (
              <div style={{ padding: 12, borderRadius: 8, background: resultData?.score >= 60 ? C.green + '22' : C.red + '22', textAlign: 'center', fontWeight: 600, color: resultData?.score >= 60 ? C.green : C.red }}>
                {resultData?.feedback} (Score: {resultData?.score}/100)
              </div>
            )}
          </div>
        </div>
      )}
      {q && q.mode === '2dto3d' && (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
            Which 3D shape matches these <span style={{ color: C.accent }}>{q.viewLabel}</span> views?
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            {['top', 'front', 'side'].map(v => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{v.charAt(0).toUpperCase() + v.slice(1)}</div>
                <svg width={100} height={100} viewBox="0 0 110 110" style={{ background: C.surface, borderRadius: 8 }}>
                  {renderProjection2D(q.shapeDef.views[v])}
                </svg>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 700, margin: '0 auto' }}>
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => { if (!showResult) setSelected3D(idx) }} style={{
                background: showResult && opt.correct ? C.green + '22' : showResult && idx === selected3D && !opt.correct ? C.red + '22' : idx === selected3D ? C.accent + '22' : C.card,
                border: `2px solid ${showResult && opt.correct ? C.green : showResult && idx === selected3D && !opt.correct ? C.red : idx === selected3D ? C.accent : C.border}`,
                borderRadius: 12, padding: 12, cursor: showResult ? 'default' : 'pointer', transition: 'all 0.15s'
              }}>
                <ThreeDViewer shapeType={opt.shape3d} dimensions={opt.dims} width={140} height={120} />
                <div style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>{opt.label}</div>
              </button>
            ))}
          </div>
          {!showResult ? (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={checkAnswer} disabled={selected3D === null} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: selected3D === null ? C.surface : C.accent, color: selected3D === null ? C.muted : '#fff', fontWeight: 700, fontSize: 15, cursor: selected3D === null ? 'default' : 'pointer' }}>Check</button>
            </div>
          ) : (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: resultData?.score >= 60 ? C.green + '22' : C.red + '22', textAlign: 'center', fontWeight: 600, color: resultData?.score >= 60 ? C.green : C.red, maxWidth: 500, margin: '12px auto 0' }}>
              {resultData?.feedback}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

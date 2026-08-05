import React, { useState, useRef, useEffect, useMemo } from 'react'
import ThreeDViewer from './components/ThreeDViewer'
import ScribbleCanvas from './components/ScribbleCanvas'

const C = { bg: '#0b0e14', card: '#141820', surface: '#1c2028', accent: '#4dabf7', green: '#51cf66', red: '#ff6b6b', text: '#e8e8e8', muted: '#8b949e', border: '#2d333b' }

const CUTS = {
  easy: [
    { shape3d: 'cube', dims: { w: 1, h: 1, d: 1 }, cutDesc: 'Parallel to face', cutPlane: { position: [0, 0.2, 0], normal: [0, 1, 0] }, expected: { type: 'polygon', points: [[-0.45, -0.45], [0.45, -0.45], [0.45, 0.45], [-0.45, 0.45]], name: 'Square' } },
    { shape3d: 'cylinder', dims: { r: 0.5, height: 1.2 }, cutDesc: 'Parallel to base', cutPlane: { position: [0, 0.3, 0], normal: [0, 1, 0] }, expected: { type: 'circle', radius: 0.5, name: 'Circle' } },
    { shape3d: 'sphere', dims: { r: 0.6 }, cutDesc: 'Any plane', cutPlane: { position: [0, 0.2, 0], normal: [0, 1, 0] }, expected: { type: 'circle', radius: 0.55, name: 'Circle' } },
  ],
  medium: [
    { shape3d: 'cylinder', dims: { r: 0.5, height: 1.2 }, cutDesc: 'At angle through body', cutPlane: { position: [0, 0, 0], normal: [0.3, 0.7, 0] }, expected: { type: 'ellipse', rx: 0.5, ry: 0.8, name: 'Ellipse' } },
    { shape3d: 'cone', dims: { r: 0.6, height: 1.2 }, cutDesc: 'Parallel to base (near middle)', cutPlane: { position: [0, -0.1, 0], normal: [0, 1, 0] }, expected: { type: 'circle', radius: 0.4, name: 'Circle' } },
    { shape3d: 'pyramid', dims: { r: 0.7, height: 1, sides: 4 }, cutDesc: 'Parallel to base (halfway up)', cutPlane: { position: [0, -0.15, 0], normal: [0, 1, 0] }, expected: { type: 'polygon', points: [[-0.35, -0.35], [0.35, -0.35], [0.35, 0.35], [-0.35, 0.35]], name: 'Square' } },
  ],
  hard: [
    { shape3d: 'cube', dims: { w: 1, h: 1, d: 1 }, cutDesc: 'At 45° through center', cutPlane: { position: [0, 0, 0], normal: [0.5, 0.5, 0] }, expected: { type: 'polygon', points: [[0, -0.6], [0.5, -0.3], [0.5, 0.3], [0, 0.6], [-0.5, 0.3], [-0.5, -0.3]], name: 'Hexagon' } },
    { shape3d: 'cone', dims: { r: 0.6, height: 1.2 }, cutDesc: 'Through apex, at angle', cutPlane: { position: [0, 0.2, 0], normal: [0.3, 0.7, 0] }, expected: { type: 'polygon', points: [[0, 0.5], [0.5, -0.5], [-0.5, -0.5]], name: 'Triangle' } },
    { shape3d: 'cylinder', dims: { r: 0.5, height: 1.2 }, cutDesc: 'Through axis (vertical)', cutPlane: { position: [0, 0, 0], normal: [1, 0, 0] }, expected: { type: 'polygon', points: [[-0.5, -0.6], [0.5, -0.6], [0.5, 0.6], [-0.5, 0.6]], name: 'Rectangle' } },
  ]
}

function CrossSectionSVG({ section, size = 240 }) {
  const cx = size / 2, cy = size / 2, scale = size * 0.38
  if (!section) return <svg width={size} height={size} style={{ background: C.surface, borderRadius: 8 }} />
  if (section.type === 'circle') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}>
        <circle cx={cx} cy={cy} r={section.radius * scale} fill={C.green + '44'} stroke={C.green} strokeWidth={2.5} />
      </svg>
    )
  }
  if (section.type === 'ellipse') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}>
        <ellipse cx={cx} cy={cy} rx={section.rx * scale} ry={section.ry * scale} fill={C.green + '44'} stroke={C.green} strokeWidth={2.5} />
      </svg>
    )
  }
  if (section.type === 'polygon' && section.points) {
    const d = section.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx + p[0] * scale},${cy - p[1] * scale}`).join(' ') + ' Z'
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}>
        <path d={d} fill={C.green + '44'} stroke={C.green} strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
    )
  }
  return <svg width={size} height={size} style={{ background: C.surface, borderRadius: 8 }} />
}

function validateCrossSection(elements, expected) {
  if (!elements || elements.length === 0) return { score: 0, feedback: 'Draw the cross-section!' }
  const points = []
  elements.forEach(el => {
    if (el.points) points.push(...el.points)
    if (el.x1 !== undefined) points.push({ x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 })
  })
  if (points.length < 4) return { score: 5, feedback: 'Draw a more complete shape.' }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) })
  const dw = maxX - minX, dh = maxY - minY
  if (dw < 8 || dh < 8) return { score: 5, feedback: 'Shape is too small.' }
  const aspect = dw / Math.max(dh, 1)
  const closed = elements.some(el => el.type === 'pen' && el.points && el.points.length > 4 && Math.abs(el.points[0].x - el.points[el.points.length - 1].x) < 25 && Math.abs(el.points[0].y - el.points[el.points.length - 1].y) < 25)
  let score = 20
  if (closed) score += 15
  if (expected.type === 'circle') {
    const rAvg = (dw + dh) / 4
    const roundness = Math.abs(aspect - 1)
    score += roundness < 0.15 ? 35 : roundness < 0.3 ? 20 : 5
    score += closed ? 15 : 5
  } else if (expected.type === 'ellipse') {
    const expectedAspect = expected.rx / expected.ry
    score += Math.abs(aspect - expectedAspect) < 0.3 ? 35 : 15
    score += closed ? 15 : 5
  } else if (expected.type === 'polygon') {
    const nPts = expected.points.length
    score += Math.abs(aspect - 1) < 0.3 ? 25 : 10
    score += closed ? 20 : 5
    score += nPts <= 4 ? 15 : 10
  } else {
    score += 25
  }
  score = Math.min(100, score)
  const feedback = score >= 70 ? 'Excellent cross-section!' : score >= 40 ? 'Close! Check the proportions.' : 'Keep practicing!'
  return { score, feedback }
}

function generateQuestion(difficulty) {
  const pool = CUTS[difficulty] || CUTS.easy
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function CrossSectionApp({ onBack }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('easy')
  const [totalQ, setTotalQ] = useState(6)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (phase === 'playing') {
      const iv = setInterval(() => setElapsed(Date.now() - startTime), 1000)
      return () => clearInterval(iv)
    }
  }, [phase, startTime])

  const startGame = () => {
    const qs = Array.from({ length: totalQ }, () => generateQuestion(difficulty))
    setQuestions(qs); setCurrentIdx(0); setScore(0); setStartTime(Date.now()); setElapsed(0)
    setShowResult(false); setResultData(null); setPhase('playing')
  }

  const q = questions[currentIdx]

  const checkAnswer = () => {
    if (!q) return
    const data = canvasRef.current?.getElements()
    const result = validateCrossSection(data, q.expected)
    setResultData(result)
    setScore(prev => prev + (result.score >= 60 ? 1 : 0))
    setShowResult(true)
    setTimeout(() => {
      if (currentIdx + 1 < totalQ) {
        setCurrentIdx(currentIdx + 1); setShowResult(false); setResultData(null)
        if (canvasRef.current?.clearAll) canvasRef.current.clearAll()
      } else { setPhase('finished') }
    }, 2500)
  }

  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16, marginBottom: 20 }}>← Back to Home</button>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Cross-Section Explorer</h1>
          <p style={{ color: C.muted, marginBottom: 32 }}>Draw the cross-section you get from cutting a 3D shape</p>
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
              {[4, 6, 8].map(n => (
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
    const mins = Math.floor(elapsed / 60000), secs = Math.floor((elapsed % 60000) / 1000)
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

  const mins = Math.floor(elapsed / 60000), secs = Math.floor((elapsed % 60000) / 1000)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1000, margin: '0 auto 20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16 }}>← Back</button>
        <h2 style={{ fontSize: 18, margin: 0 }}>Cross-Section Explorer</h2>
        <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <span style={{ color: C.muted }}>{currentIdx + 1}/{totalQ}</span>
          <span style={{ color: C.green, fontWeight: 700 }}>{score} pts</span>
          <span style={{ color: C.muted }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div style={{ height: 4, background: C.surface, borderRadius: 2, maxWidth: 1000, margin: '0 auto 20px' }}>
        <div style={{ height: '100%', width: `${((currentIdx + 1) / totalQ) * 100}%`, background: C.accent, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      {q && (
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, marginBottom: 12 }}>
              <ThreeDViewer shapeType={q.shape3d} dimensions={q.dims} width={360} height={280} cuttingPlane={q.cutPlane} color="#4dabf7" opacity={0.65} />
            </div>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Cut: <span style={{ color: C.accent }}>{q.cutDesc}</span></div>
              <div style={{ fontSize: 13, color: C.muted }}>Draw the 2D shape you'd see at the cut →</div>
            </div>
            {showResult && (
              <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, marginTop: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Correct answer:</div>
                <CrossSectionSVG section={q.expected} size={200} />
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: C.green, marginTop: 6 }}>{q.expected.name}</div>
              </div>
            )}
          </div>
          <div style={{ flex: '1 1 380px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Draw the cross-section</div>
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
    </div>
  )
}

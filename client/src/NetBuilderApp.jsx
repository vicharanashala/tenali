import React, { useState, useRef, useEffect } from 'react'
import ThreeDViewer from './components/ThreeDViewer'
import ScribbleCanvas from './components/ScribbleCanvas'

const C = { bg: '#0b0e14', card: '#141820', surface: '#1c2028', accent: '#4dabf7', green: '#51cf66', red: '#ff6b6b', text: '#e8e8e8', muted: '#8b949e', border: '#2d333b' }

const SHAPES = {
  easy: [
    { shape3d: 'cube', dims: { w: 1, h: 1, d: 1 }, label: 'Cube', expectedFaces: 6, faceTypes: { rectangles: 6, triangles: 0 }, desc: '6 equal squares' },
    { shape3d: 'cuboid', dims: { w: 1.4, h: 0.8, d: 0.6 }, label: 'Cuboid', expectedFaces: 6, faceTypes: { rectangles: 6, triangles: 0 }, desc: '6 rectangles (3 pairs)' },
  ],
  medium: [
    { shape3d: 'triangular-prism', dims: { r: 0.6, height: 1 }, label: 'Triangular Prism', expectedFaces: 5, faceTypes: { rectangles: 3, triangles: 2 }, desc: '3 rectangles + 2 triangles' },
    { shape3d: 'pyramid', dims: { r: 0.7, height: 1, sides: 4 }, label: 'Square Pyramid', expectedFaces: 5, faceTypes: { rectangles: 1, triangles: 4 }, desc: '1 square + 4 triangles' },
    { shape3d: 'cylinder', dims: { r: 0.5, height: 1.2 }, label: 'Cylinder', expectedFaces: 3, faceTypes: { rectangles: 1, circles: 2 }, desc: '1 rectangle + 2 circles' },
  ],
  hard: [
    { shape3d: 'cone', dims: { r: 0.6, height: 1.2 }, label: 'Cone', expectedFaces: 2, faceTypes: { sectors: 1, circles: 1 }, desc: '1 sector + 1 circle' },
    { shape3d: 'frustum', dims: { r: 0.6, height: 1 }, label: 'Frustum', expectedFaces: 4, faceTypes: { rectangles: 1, circles: 2, trapezoids: 1 }, desc: '1 rectangle + 2 circles + 1 trapezoid' },
  ]
}

const NET_SVG = {
  cube: (
    <g>
      <rect x={60} y={10} width={50} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={10} y={60} width={50} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={60} y={60} width={50} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={110} y={60} width={50} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={160} y={60} width={50} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={60} y={110} width={50} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
    </g>
  ),
  cuboid: (
    <g>
      <rect x={10} y={40} width={70} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={80} y={40} width={50} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={130} y={40} width={70} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={200} y={40} width={50} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={80} y={0} width={50} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={80} y={80} width={50} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
    </g>
  ),
  'triangular-prism': (
    <g>
      <rect x={30} y={70} width={80} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={110} y={70} width={80} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <rect x={190} y={70} width={80} height={40} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <polygon points="70,70 30,70 50,30" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <polygon points="230,70 190,70 210,30" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
    </g>
  ),
  pyramid: (
    <g>
      <rect x={70} y={70} width={70} height={70} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <polygon points="105,10 70,70 140,70" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <polygon points="30,50 70,70 70,30" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <polygon points="180,50 140,70 140,30" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <polygon points="105,140 70,70 140,70" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
    </g>
  ),
  cylinder: (
    <g>
      <rect x={40} y={50} width={130} height={70} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <ellipse cx={105} cy={35} rx={40} ry={15} fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <ellipse cx={105} cy={125} rx={40} ry={15} fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
    </g>
  ),
  cone: (
    <g>
      <path d="M60,80 Q105,10 150,80" fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <ellipse cx={105} cy={95} rx={45} ry={15} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
    </g>
  ),
  frustum: (
    <g>
      <rect x={50} y={50} width={120} height={50} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      <ellipse cx={110} cy={35} rx={25} ry={12} fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
      <ellipse cx={110} cy={115} rx={40} ry={15} fill={C.green + '33'} stroke={C.green} strokeWidth={2} />
    </g>
  )
}

function validateNet(elements, shapeDef) {
  if (!elements || elements.length === 0) return { score: 0, feedback: 'Draw the net first!' }
  const shapes = { rectangles: 0, triangles: 0, circles: 0, penPaths: 0 }
  elements.forEach(el => {
    if (el.type === 'rect') shapes.rectangles++
    else if (el.type === 'triangle') shapes.triangles++
    else if (el.type === 'circle') shapes.circles++
    else if (el.type === 'pen' && el.points && el.points.length > 3) shapes.penPaths++
  })
  const totalDrawn = shapes.rectangles + shapes.triangles + shapes.circles + shapes.penPaths
  const expected = shapeDef.expectedFaces
  let score = 0
  if (totalDrawn >= expected * 0.6) score += 40
  else if (totalDrawn >= expected * 0.3) score += 20
  if (Math.abs(totalDrawn - expected) <= 1) score += 30
  else if (Math.abs(totalDrawn - expected) <= 2) score += 15
  const allPoints = []
  elements.forEach(el => { if (el.points) allPoints.push(...el.points); if (el.x1 !== undefined) allPoints.push({ x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 }) })
  if (allPoints.length > 10) {
    const xs = allPoints.map(p => p.x), ys = allPoints.map(p => p.y)
    const spread = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys))
    if (spread > 10000) score += 30
    else if (spread > 5000) score += 15
  }
  score = Math.min(100, score)
  const feedback = score >= 70 ? 'Good net drawing!' : score >= 40 ? 'Almost there — check the number of faces.' : 'Keep trying! Count the faces carefully.'
  return { score, feedback }
}

function generateQuestion(difficulty) {
  const pool = SHAPES[difficulty] || SHAPES.easy
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function NetBuilderApp({ onBack }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('setup')
  const [difficulty, setDifficulty] = useState('easy')
  const [totalQ, setTotalQ] = useState(6)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
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
    setShowResult(false); setResultData(null); setShowAnswer(false); setPhase('playing')
  }

  const q = questions[currentIdx]

  const checkAnswer = () => {
    if (!q) return
    const data = canvasRef.current?.getElements()
    const result = validateNet(data, q)
    setResultData(result)
    setScore(prev => prev + (result.score >= 60 ? 1 : 0))
    setShowResult(true)
    setShowAnswer(true)
    setTimeout(() => {
      if (currentIdx + 1 < totalQ) {
        setCurrentIdx(currentIdx + 1); setShowResult(false); setResultData(null); setShowAnswer(false)
        if (canvasRef.current?.clearAll) canvasRef.current.clearAll()
      } else { setPhase('finished') }
    }, 3000)
  }

  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16, marginBottom: 20 }}>← Back to Home</button>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Net Builder</h1>
          <p style={{ color: C.muted, marginBottom: 32 }}>Draw the unfolded net of 3D shapes</p>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto 20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16 }}>← Back</button>
        <h2 style={{ fontSize: 18, margin: 0 }}>Net Builder</h2>
        <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <span style={{ color: C.muted }}>{currentIdx + 1}/{totalQ}</span>
          <span style={{ color: C.green, fontWeight: 700 }}>{score} pts</span>
          <span style={{ color: C.muted }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div style={{ height: 4, background: C.surface, borderRadius: 2, maxWidth: 1100, margin: '0 auto 20px' }}>
        <div style={{ height: '100%', width: `${((currentIdx + 1) / totalQ) * 100}%`, background: C.accent, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      {q && (
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, marginBottom: 12 }}>
              <ThreeDViewer shapeType={q.shape3d} dimensions={q.dims} width={300} height={260} showDimensions autoRotate />
            </div>
            <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{q.label}</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Expected faces: {q.desc}</div>
              <div style={{ fontSize: 13, color: C.accent }}>Draw the complete unfolded net on the grid →</div>
            </div>
            {showAnswer && (
              <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, marginTop: 12 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Correct net:</div>
                <svg width={260} height={160} viewBox="0 0 260 160" style={{ background: C.surface, borderRadius: 8 }}>
                  {NET_SVG[q.shape3d] || <text x={130} y={80} textAnchor="middle" fill={C.muted}>Net not available</text>}
                </svg>
              </div>
            )}
          </div>
          <div style={{ flex: '1 1 420px' }}>
            <ScribbleCanvas ref={canvasRef} width={480} height={400} showGrid style={{ marginBottom: 12 }} />
            {!showResult ? (
              <button onClick={checkAnswer} style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Check Net</button>
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

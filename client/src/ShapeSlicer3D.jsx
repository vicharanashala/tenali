import React, { useState, useMemo } from 'react'
import ThreeDViewer from './components/ThreeDViewer'

const C = { bg: '#0b0e14', card: '#141820', surface: '#1c2028', accent: '#4dabf7', green: '#51cf66', red: '#ff6b6b', text: '#e8e8e8', muted: '#8b949e', border: '#2d333b' }

const SHAPES = [
  { id: 'cube', label: 'Cube', defaults: { w: 1, h: 1, d: 1 } },
  { id: 'cylinder', label: 'Cylinder', defaults: { r: 0.5, height: 1.2 } },
  { id: 'cone', label: 'Cone', defaults: { r: 0.6, height: 1.2 } },
  { id: 'sphere', label: 'Sphere', defaults: { r: 0.6 } },
  { id: 'pyramid', label: 'Square Pyramid', defaults: { r: 0.7, height: 1, sides: 4 } },
  { id: 'triangular-prism', label: 'Triangular Prism', defaults: { r: 0.6, height: 1 } },
]

function computeCrossSection(shapeId, axis, position, angle) {
  const p = position
  const a = (angle * Math.PI) / 180
  const cos = Math.cos(a), sin = Math.sin(a)

  switch (shapeId) {
    case 'cube': {
      const half = 0.5
      if (axis === 'y') {
        const y = p * half
        if (Math.abs(y) >= half) return { points: [], name: 'No cross-section' }
        if (Math.abs(angle) < 5) {
          return { points: [[-half, -half], [half, -half], [half, half], [-half, half]], name: 'Square' }
        }
        const sz = half * Math.abs(cos) + half * Math.abs(sin)
        return { points: [[-sz, -sz], [sz, -sz], [sz, sz], [-sz, sz]], name: 'Rectangle' }
      }
      if (axis === 'x') {
        const x = p * half
        if (Math.abs(x) >= half) return { points: [], name: 'No cross-section' }
        if (Math.abs(angle) < 5) {
          return { points: [[-half, -half], [half, -half], [half, half], [-half, half]], name: 'Square' }
        }
        return { points: [[-half, -half], [half, -half], [half, half], [-half, half]], name: 'Square' }
      }
      const z = p * half
      if (Math.abs(z) >= half) return { points: [], name: 'No cross-section' }
      if (Math.abs(angle) < 5) {
        return { points: [[-half, -half], [half, -half], [half, half], [-half, half]], name: 'Square' }
      }
      const n = 6
      const pts = []
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2
        pts.push([half * 0.8 * Math.cos(t), half * 0.8 * Math.sin(t)])
      }
      return { points: pts, name: 'Hexagon' }
    }
    case 'cylinder': {
      const r = 0.5, h = 0.6
      if (axis === 'y') {
        const y = p * h
        if (Math.abs(y) >= h) return { points: [], name: 'No cross-section' }
        if (Math.abs(angle) < 5) {
          return { type: 'circle', radius: r, name: 'Circle' }
        }
        const ry = r
        const rx = r / Math.max(Math.abs(cos), 0.3)
        return { type: 'ellipse', rx: Math.min(rx, r * 1.5), ry, name: 'Ellipse' }
      }
      const x = p * r
      if (Math.abs(x) >= r) return { points: [], name: 'No cross-section' }
      if (axis === 'z') {
        return { points: [[-r, -h], [r, -h], [r, h], [-r, h]], name: 'Rectangle (through axis)' }
      }
      return { points: [[-r, -h], [r, -h], [r, h], [-r, h]], name: 'Rectangle' }
    }
    case 'cone': {
      const r = 0.6, h = 0.6
      if (axis === 'y') {
        const yNorm = (p + 1) / 2
        if (yNorm <= 0 || yNorm >= 1) return { points: [], name: 'No cross-section' }
        const radiusAtY = r * (1 - yNorm)
        if (radiusAtY < 0.02) return { points: [], name: 'Point' }
        if (Math.abs(angle) < 5) {
          return { type: 'circle', radius: radiusAtY, name: 'Circle' }
        }
        return { type: 'ellipse', rx: radiusAtY, ry: radiusAtY * 0.6, name: 'Ellipse' }
      }
      if (axis === 'x' || axis === 'z') {
        if (Math.abs(p) > 0.6) return { points: [], name: 'No cross-section' }
        const topWidth = 0.05
        const bottomWidth = r
        return { points: [[-topWidth, h], [topWidth, h], [bottomWidth, -h], [-bottomWidth, -h]], name: 'Trapezoid' }
      }
      return { points: [], name: 'No cross-section' }
    }
    case 'sphere': {
      const r = 0.6
      const d = Math.abs(p) * r
      if (d >= r) return { points: [], name: 'No cross-section' }
      const cr = Math.sqrt(r * r - d * d)
      return { type: 'circle', radius: cr, name: 'Circle' }
    }
    case 'pyramid': {
      const r = 0.7, h = 0.5
      if (axis === 'y') {
        const yNorm = (p + 1) / 2
        if (yNorm <= 0 || yNorm >= 1) return { points: [], name: 'No cross-section' }
        const sz = r * (1 - yNorm)
        if (sz < 0.02) return { points: [], name: 'Point' }
        if (Math.abs(angle) < 5) {
          return { points: [[-sz, -sz], [sz, -sz], [sz, sz], [-sz, sz]], name: 'Square' }
        }
        const d2 = sz * Math.SQRT2
        return { points: [[0, -d2], [d2, 0], [0, d2], [-d2, 0]], name: 'Square (rotated)' }
      }
      if (axis === 'x' || axis === 'z') {
        if (Math.abs(p) > r) return { points: [], name: 'No cross-section' }
        return { points: [[0, h], [r * 0.5, -h], [-r * 0.5, -h]], name: 'Triangle' }
      }
      return { points: [], name: 'No cross-section' }
    }
    case 'triangular-prism': {
      const r = 0.6, h = 0.5
      const triPts = [[0, r * 0.85], [-r * 0.75, -r * 0.45], [r * 0.75, -r * 0.45]]
      if (axis === 'y') {
        const yNorm = (p + 1) / 2
        if (yNorm <= 0 || yNorm >= 1) return { points: [], name: 'No cross-section' }
        if (Math.abs(angle) < 5) return { points: triPts, name: 'Triangle' }
        return { points: triPts.map(([x, y]) => [x * 0.8, y * 0.8]), name: 'Triangle' }
      }
      return { points: [[-r, -h], [r, -h], [r, h], [-r, h]], name: 'Rectangle' }
    }
    default:
      return { points: [], name: 'Unknown' }
  }
}

function CrossSectionSVG({ section, size = 260 }) {
  const cx = size / 2, cy = size / 2, scale = size * 0.4
  if (!section || (!section.points && !section.type)) {
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}><text x={cx} y={cy} textAnchor="middle" fill={C.muted} fontSize={14}>No cross-section at this position</text></svg>
  }
  if (section.type === 'circle') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}>
        <circle cx={cx} cy={cy} r={section.radius * scale} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      </svg>
    )
  }
  if (section.type === 'ellipse') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}>
        <ellipse cx={cx} cy={cy} rx={section.rx * scale} ry={section.ry * scale} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} />
      </svg>
    )
  }
  if (section.points && section.points.length > 0) {
    const pathD = section.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx + p[0] * scale},${cy - p[1] * scale}`).join(' ') + ' Z'
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}>
        <path d={pathD} fill={C.accent + '33'} stroke={C.accent} strokeWidth={2} strokeLinejoin="round" />
        {section.points.map((p, i) => (
          <circle key={i} cx={cx + p[0] * scale} cy={cy - p[1] * scale} r={3} fill={C.accent} />
        ))}
      </svg>
    )
  }
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: C.surface, borderRadius: 8 }}><text x={cx} y={cy} textAnchor="middle" fill={C.muted} fontSize={14}>No cross-section</text></svg>
}

export default function ShapeSlicer3D({ onBack }) {
  const [shapeIdx, setShapeIdx] = useState(0)
  const [axis, setAxis] = useState('y')
  const [position, setPosition] = useState(0)
  const [angle, setAngle] = useState(0)
  const [showPlane, setShowPlane] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)

  const shape = SHAPES[shapeIdx]
  const cuttingPlane = useMemo(() => {
    if (!showPlane) return undefined
    const normal = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1]
    const pos = axis === 'x' ? [position * 1.2, 0, 0] : axis === 'y' ? [0, position * 1.2, 0] : [0, 0, position * 1.2]
    return { position: pos, normal, color: '#e03131' }
  }, [axis, position, showPlane])

  const section = useMemo(() => computeCrossSection(shape.id, axis, position, angle), [shape.id, axis, position, angle])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto 20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16 }}>← Back</button>
        <h2 style={{ fontSize: 20, margin: 0 }}>Shape Slicer 3D</h2>
        <span style={{ color: C.muted, fontSize: 13 }}>Interactive exploration</span>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 460px' }}>
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, marginBottom: 12 }}>
            <ThreeDViewer shapeType={shape.id} dimensions={shape.defaults} width={480} height={380} cuttingPlane={showPlane ? cuttingPlane : undefined} autoRotate={autoRotate} color="#4dabf7" opacity={0.7} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SHAPES.map((s, i) => (
              <button key={s.id} onClick={() => { setShapeIdx(i); setPosition(0); setAngle(0) }} style={{ padding: '6px 12px', borderRadius: 8, border: shapeIdx === i ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: shapeIdx === i ? C.accent + '22' : C.card, color: C.text, cursor: 'pointer', fontSize: 13, fontWeight: shapeIdx === i ? 700 : 400, transition: 'all 0.15s' }}>{s.label}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Cross-Section View</div>
            <CrossSectionSVG section={section} size={280} />
            <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, fontWeight: 600, color: C.accent }}>{section.name}</div>
          </div>
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Controls</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>Cut Axis</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['x', 'y', 'z'].map(a => (
                  <button key={a} onClick={() => setAxis(a)} style={{ padding: '6px 16px', borderRadius: 6, border: axis === a ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: axis === a ? C.accent + '22' : C.surface, color: C.text, cursor: 'pointer', fontWeight: axis === a ? 700 : 400, fontSize: 13 }}>{a.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>Position: {position.toFixed(2)}</label>
              <input type="range" min={-1} max={1} step={0.02} value={position} onChange={e => setPosition(parseFloat(e.target.value))} style={{ width: '100%', accentColor: C.accent }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>Angle: {angle}°</label>
              <input type="range" min={0} max={180} step={5} value={angle} onChange={e => setAngle(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.accent }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={showPlane} onChange={e => setShowPlane(e.target.checked)} /> Show plane
              </label>
              <label style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} /> Auto-rotate
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

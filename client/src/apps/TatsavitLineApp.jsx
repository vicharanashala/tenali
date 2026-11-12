import React, { useEffect, useRef, useState } from 'react';
import { QuizLayout } from '../components/QuizLayout';
function TatsavitLineApp({ onBack, isGoalMode = false }) {
  // `round` is just a counter that forces regeneration on Next
  const [round, setRound] = useState(0)
  // Point coordinates are stored as strings so the inputs stay editable
  // (allowing intermediate states like "", "-", "1.").
  const [p1xS, setP1xS] = useState('0')
  const [p1yS, setP1yS] = useState('0')
  const [p2xS, setP2xS] = useState('1')
  const [p2yS, setP2yS] = useState('0')
  const [mInput, setMInput] = useState('')
  const [cInput, setCInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [solvedCount, setSolvedCount] = useState(0)
  const [justSolved, setJustSolved] = useState(false)
  // Visible domain on each axis (±zoom units). Smaller = zoomed in.
  const [zoom, setZoom] = useState(10)
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);
  const svgRef = useRef(null)

  // Regenerate random points when `round` changes
  useEffect(() => {
    const mChoices = [-3, -2, -1, 0, 1, 2, 3]
    const cChoices = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
    let chosen = null
    for (let attempt = 0; attempt < 40 && !chosen; attempt++) {
      const m = mChoices[Math.floor(Math.random() * mChoices.length)]
      const c = cChoices[Math.floor(Math.random() * cChoices.length)]
      // Pick two distinct x-values in [-6, 6]
      const x1 = Math.floor(Math.random() * 13) - 6
      let x2 = Math.floor(Math.random() * 13) - 6
      while (x2 === x1) x2 = Math.floor(Math.random() * 13) - 6
      const y1 = m * x1 + c
      const y2 = m * x2 + c
      if (Math.abs(y1) <= 7 && Math.abs(y2) <= 7) {
        chosen = { m, c, p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } }
      }
    }
    if (!chosen) {
      // Ultra-safe fallback
      chosen = { m: 1, c: 0, p1: { x: -2, y: -2 }, p2: { x: 3, y: 3 } }
    }
    setP1xS(String(chosen.p1.x))
    setP1yS(String(chosen.p1.y))
    setP2xS(String(chosen.p2.x))
    setP2yS(String(chosen.p2.y))
    setMInput('')
    setCInput('')
    setShowAnswer(false)
    setJustSolved(false)
  }, [round])

  // Parse a numeric input string; returns NaN for incomplete inputs
  // ("", "-", ".", "-.") so typing does not break the plot.
  const parseNum = (s) => {
    if (s === '' || s === '-' || s === '.' || s === '-.') return NaN
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : NaN
  }

  const p1x = parseNum(p1xS)
  const p1y = parseNum(p1yS)
  const p2x = parseNum(p2xS)
  const p2y = parseNum(p2yS)
  const hasValidPoints = [p1x, p1y, p2x, p2y].every(n => !Number.isNaN(n))
  const isVertical = hasValidPoints && Math.abs(p2x - p1x) < 1e-9
  const p1 = { x: hasValidPoints ? p1x : 0, y: hasValidPoints ? p1y : 0 }
  const p2 = { x: hasValidPoints ? p2x : 0, y: hasValidPoints ? p2y : 0 }

  // Target line (y = targetM·x + targetC) computed from the *current*
  // (possibly edited) points. If the two points share an x-coordinate,
  // the line is vertical and cannot be represented as y = mx + C.
  let targetM = 0
  let targetC = 0
  let targetValid = false
  if (hasValidPoints && !isVertical) {
    targetM = (p2y - p1y) / (p2x - p1x)
    targetC = p1y - targetM * p1x
    targetValid = true
  }

  // Derived state: parsed m/C inputs and correctness
  const mVal = parseNum(mInput)
  const cVal = parseNum(cInput)
  const hasValidInputs = !Number.isNaN(mVal) && !Number.isNaN(cVal)
  // Use a tolerance that scales with the problem so integer answers feel
  // forgiving but decimal answers still require reasonable precision.
  const EPS = 1e-3
  const isCorrect =
    targetValid &&
    hasValidInputs &&
    Math.abs(mVal - targetM) < EPS &&
    Math.abs(cVal - targetC) < EPS

  // Flip `justSolved` once, when the student first hits the right answer
  // for the current round. This lets us briefly show a success banner
  // without blocking typing corrections afterwards.
  useEffect(() => {
    if (isCorrect && !justSolved) {
      setJustSolved(true)
      setSolvedCount(n => n + 1)
    }
  }, [isCorrect, justSolved])

  // If the student edits the points while a success banner is showing,
  // clear it so correctness is re-evaluated against the new target.
  useEffect(() => {
    if (justSolved) setJustSolved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p1xS, p1yS, p2xS, p2yS])

  // ── Plot geometry ───────────────────────────────────────────────
  const PLOT = 440                     // SVG viewBox size (square)
  const DOMAIN = zoom                  // ±zoom units on each axis
  const scale = PLOT / (2 * DOMAIN)    // px per unit
  const toPx = (px, py) => ({
    x: PLOT / 2 + px * scale,
    y: PLOT / 2 - py * scale,          // SVG y grows downward; flip
  })

  // Endpoints of the user's line at x = ±DOMAIN (clipped by SVG bounds)
  const userStart = hasValidInputs ? toPx(-DOMAIN, mVal * -DOMAIN + cVal) : null
  const userEnd = hasValidInputs ? toPx(DOMAIN, mVal * DOMAIN + cVal) : null
  const answerStart = toPx(-DOMAIN, targetM * -DOMAIN + targetC)
  const answerEnd = toPx(DOMAIN, targetM * DOMAIN + targetC)

  // ── Rendering helpers ───────────────────────────────────────────
  // Tick and label spacing adapt to zoom so the grid never becomes a mess.
  //   very zoomed in (DOMAIN ≤ 3): half-unit ticks, labels every 1
  //   typical (DOMAIN 4–12):       1-unit ticks, labels every 2
  //   zoomed out (DOMAIN 13–25):   1-unit ticks, labels every 4
  //   far out (DOMAIN > 25):       2-unit ticks, labels every 10
  const tickStep = DOMAIN <= 3 ? 0.5 : DOMAIN <= 25 ? 1 : 2
  const labelStep = DOMAIN <= 3 ? 1 : DOMAIN <= 12 ? 2 : DOMAIN <= 25 ? 4 : 10
  const gridTicks = []
  // Use integer arithmetic to avoid floating-point drift on half-unit ticks
  const inv = 1 / tickStep
  const lo = -Math.round(DOMAIN * inv)
  const hi = Math.round(DOMAIN * inv)
  for (let k = lo; k <= hi; k++) gridTicks.push(k * tickStep)

  // Zoom controls
  const ZOOM_MIN = 2
  const ZOOM_MAX = 40
  const zoomIn = () => setZoom(z => Math.max(ZOOM_MIN, Math.round((z - 2) * 10) / 10))
  const zoomOut = () => setZoom(z => Math.min(ZOOM_MAX, Math.round((z + 2) * 10) / 10))
  const zoomReset = () => setZoom(10)
  const zoomFit = () => {
    // Fit both target points snugly with a small margin
    const maxAbs = Math.max(Math.abs(p1.x), Math.abs(p1.y), Math.abs(p2.x), Math.abs(p2.y))
    const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.ceil(maxAbs + 1)))
    setZoom(z)
  }
  // Mouse-wheel zoom inside the SVG
  const onWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1    // down = zoom out
    setZoom(z => {
      // Step size scales with current zoom so wheel feels consistent
      const step = Math.max(0.5, z * 0.15)
      const next = z + delta * step
      return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(next * 10) / 10))
    })
  }
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Format numbers tidily: integers as-is, decimals rounded to 4 places
  // (trailing zeros trimmed), with a minus sign.
  const fmtNum = (n) => {
    if (!Number.isFinite(n)) return '?'
    if (Number.isInteger(n)) return String(n)
    return String(parseFloat(n.toFixed(4)))
  }

  const formatEq = () => {
    if (!hasValidInputs) return 'y = ?·x + ?'
    const mStr = fmtNum(mVal)
    if (cVal === 0) return `y = ${mStr}·x`
    const sign = cVal >= 0 ? '+' : '−'
    return `y = ${mStr}·x ${sign} ${fmtNum(Math.abs(cVal))}`
  }

  const handleNext = () => setRound(r => r + 1)
  const handleReset = () => { setMInput(''); setCInput(''); setShowAnswer(false) }

  return (
    <QuizLayout
      title="Tatsavit — Fit the Line"
      subtitle={`Find m and C so y = m·x + C passes through both points · solved: ${solvedCount}`}
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: 560, margin: '0 auto' }}>
        {/* Zoom controls — above the plot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={zoomIn} title="Zoom in"
            style={{
              padding: '4px 12px', background: 'transparent',
              border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)', borderRadius: 6
            }}>
            +
          </button>
          <button onClick={zoomOut} title="Zoom out"
            style={{
              padding: '4px 12px', background: 'transparent',
              border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)', borderRadius: 6
            }}>
            −
          </button>
          <button onClick={zoomReset} title="Reset zoom"
            style={{
              padding: '4px 10px', background: 'transparent',
              border: '1px solid var(--clr-text-soft)', color: 'var(--clr-text-soft)', borderRadius: 6, fontSize: '0.85rem'
            }}>
            1:1
          </button>
          <button onClick={zoomFit} title="Fit both points"
            style={{
              padding: '4px 10px', background: 'transparent',
              border: '1px solid var(--clr-text-soft)', color: 'var(--clr-text-soft)', borderRadius: 6, fontSize: '0.85rem'
            }}>
            Fit
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', marginLeft: 6 }}>
            view ±{zoom}
          </span>
        </div>

        {/* SVG plot */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${PLOT} ${PLOT}`}
          style={{
            width: 'min(92vw, 460px)',
            height: 'min(92vw, 460px)',
            background: 'var(--clr-bg-soft, rgba(128,128,128,0.06))',
            border: '1px solid var(--clr-text-soft)',
            borderRadius: 8,
            touchAction: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Grid lines */}
          {gridTicks.map(g => {
            const { x: gx } = toPx(g, 0)
            const { y: gy } = toPx(0, g)
            const axis = g === 0
            return (
              <g key={`grid-${g}`}>
                <line x1={gx} y1={0} x2={gx} y2={PLOT}
                  stroke="currentColor"
                  strokeOpacity={axis ? 0.55 : 0.12}
                  strokeWidth={axis ? 1.5 : 0.6} />
                <line x1={0} y1={gy} x2={PLOT} y2={gy}
                  stroke="currentColor"
                  strokeOpacity={axis ? 0.55 : 0.12}
                  strokeWidth={axis ? 1.5 : 0.6} />
              </g>
            )
          })}
          {/* Axis tick labels (spacing adapts to zoom) */}
          {gridTicks.filter(g => {
            if (g === 0) return false
            // Show a label when g is (close to) a multiple of labelStep
            const q = g / labelStep
            return Math.abs(q - Math.round(q)) < 1e-9
          }).map(g => {
            const { x: gx } = toPx(g, 0)
            const { y: gy } = toPx(0, g)
            const origin = toPx(0, 0)
            return (
              <g key={`lbl-${g}`} style={{ fontSize: 10, fill: 'currentColor', opacity: 0.55 }}>
                <text x={gx} y={origin.y + 13} textAnchor="middle">{g}</text>
                <text x={origin.x - 6} y={gy + 3} textAnchor="end">{g}</text>
              </g>
            )
          })}
          {/* Show-answer dashed line (only when a y = mx + C line exists) */}
          {showAnswer && !isCorrect && targetValid && (
            <line x1={answerStart.x} y1={answerStart.y} x2={answerEnd.x} y2={answerEnd.y}
              stroke="var(--clr-correct, #26de81)" strokeWidth={2}
              strokeDasharray="6 4" strokeOpacity={0.7} />
          )}
          {/* User's line */}
          {hasValidInputs && userStart && userEnd && (
            <line
              x1={userStart.x} y1={userStart.y}
              x2={userEnd.x} y2={userEnd.y}
              stroke={isCorrect ? 'var(--clr-correct, #26de81)' : 'var(--clr-accent, #4a90e2)'}
              strokeWidth={3}
              strokeOpacity={0.9}
            />
          )}
          {/* Target points — only render when coordinates parse cleanly */}
          {hasValidPoints && [p1, p2].map((p, i) => {
            const { x, y } = toPx(p.x, p.y)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={7}
                  fill="var(--clr-wrong, #ff6b6b)"
                  stroke="var(--clr-bg, #fff)"
                  strokeWidth={2} />
                <text x={x + 10} y={y - 10}
                  style={{ fontSize: 12, fill: 'currentColor', fontWeight: 600 }}>
                  ({fmtNum(p.x)}, {fmtNum(p.y)})
                </text>
              </g>
            )
          })}
        </svg>

        {/* Editable coordinates for the two target points */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto auto',
          alignItems: 'center',
          gap: '8px 10px',
          fontSize: '0.95rem',
        }}>
          <span style={{ color: 'var(--clr-text-soft)' }}>Point 1</span>
          <input
            type="number" value={p1xS} onChange={e => setP1xS(e.target.value)}
            step="0.1" aria-label="Point 1 x"
            style={{
              width: 72, padding: '6px 8px', borderRadius: 6,
              border: '1px solid var(--clr-text-soft)',
              background: 'transparent', color: 'inherit',
              textAlign: 'center', fontFamily: 'monospace',
            }}
          />
          <input
            type="number" value={p1yS} onChange={e => setP1yS(e.target.value)}
            step="0.1" aria-label="Point 1 y"
            style={{
              width: 72, padding: '6px 8px', borderRadius: 6,
              border: '1px solid var(--clr-text-soft)',
              background: 'transparent', color: 'inherit',
              textAlign: 'center', fontFamily: 'monospace',
            }}
          />
          <span style={{ color: 'var(--clr-text-soft)' }}>Point 2</span>
          <input
            type="number" value={p2xS} onChange={e => setP2xS(e.target.value)}
            step="0.1" aria-label="Point 2 x"
            style={{
              width: 72, padding: '6px 8px', borderRadius: 6,
              border: '1px solid var(--clr-text-soft)',
              background: 'transparent', color: 'inherit',
              textAlign: 'center', fontFamily: 'monospace',
            }}
          />
          <input
            type="number" value={p2yS} onChange={e => setP2yS(e.target.value)}
            step="0.1" aria-label="Point 2 y"
            style={{
              width: 72, padding: '6px 8px', borderRadius: 6,
              border: '1px solid var(--clr-text-soft)',
              background: 'transparent', color: 'inherit',
              textAlign: 'center', fontFamily: 'monospace',
            }}
          />
        </div>

        {isVertical && (
          <div style={{
            fontSize: '0.9rem', color: 'var(--clr-wrong, #ff6b6b)',
            textAlign: 'center', maxWidth: 360,
          }}>
            Point 1 and Point 2 share the same x-coordinate — a vertical line cannot be written as y = m·x + C. Change one of the x-values to continue.
          </div>
        )}

        {/* Inputs for m and C */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>slope m</span>
            <input
              type="number"
              value={mInput}
              onChange={e => setMInput(e.target.value)}
              step="0.1"
              placeholder="?"
              style={{
                width: 110, padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--clr-text-soft)',
                background: 'transparent', color: 'inherit',
                textAlign: 'center', fontSize: '1.15rem', fontFamily: 'monospace',
              }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>intercept C</span>
            <input
              type="number"
              value={cInput}
              onChange={e => setCInput(e.target.value)}
              step="0.1"
              placeholder="?"
              style={{
                width: 110, padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--clr-text-soft)',
                background: 'transparent', color: 'inherit',
                textAlign: 'center', fontSize: '1.15rem', fontFamily: 'monospace',
              }}
            />
          </label>
        </div>

        <div style={{ fontSize: '1.05rem', fontFamily: 'monospace', marginTop: 4, color: 'var(--clr-text-soft)' }}>
          {formatEq()}
        </div>

        {isCorrect && (
          <div className="feedback correct" style={{
            textAlign: 'center', fontSize: '1.05rem',
            color: 'var(--clr-correct, #26de81)', fontWeight: 600,
            padding: '8px 16px', borderRadius: 8,
            background: 'var(--clr-correct-bg, rgba(38,222,129,0.12))',
          }}>
            ✓ The line passes through both points.
          </div>
        )}
        {showAnswer && !isCorrect && targetValid && (
          <div style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', textAlign: 'center' }}>
            Answer: m = {fmtNum(targetM)}, C = {fmtNum(targetC)}
          </div>
        )}
        {showAnswer && !targetValid && (
          <div style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', textAlign: 'center' }}>
            No y = m·x + C line exists for these points yet.
          </div>
        )}

        <div className="button-row" style={{ marginTop: 6 }}>
          <button onClick={handleNext} className="submit-btn">Next →</button>
          <button onClick={handleReset}
            style={{ background: 'transparent', border: '1px solid var(--clr-text-soft)', color: 'var(--clr-text-soft)' }}>
            Reset
          </button>
          <button onClick={() => setShowAnswer(s => !s)}
            style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>
            {showAnswer ? 'Hide answer' : 'Show answer'}
          </button>
        </div>
      </div>
    </QuizLayout>
  )
}
export default TatsavitLineApp;
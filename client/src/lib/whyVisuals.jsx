/**
 * whyVisuals.jsx - the drawing kit behind every "Why learn this?" demo.
 *
 * All 66 topics get something to look at, so the demos cannot each invent
 * their own SVG. These are the shared pieces: a fixed 200-wide stage, bars,
 * a cell grid, a number line, a function plotter and a polygon helper.
 * Every demo in whyDemos.jsx is assembled from these, which is what keeps
 * one topic's visual from looking nothing like the next one's.
 *
 * Everything is drawn in theme tokens, so light and dark both work without
 * a second stylesheet. The three accent colours match the ones already used
 * by the home banners and the grid cards.
 */

export const INK = 'var(--clr-text)'
export const SOFT = 'var(--clr-text-soft)'
export const LINE = 'var(--clr-border)'
export const A = 'var(--clr-accent)'
export const P = '#9b6dca'
export const B = '#5a8fc2'
export const G = '#5aab7a'

/** Fixed-width stage so every demo lines up at the same scale. */
export function Stage({ children, label, h = 100 }) {
  return (
    <svg viewBox={`0 0 200 ${h}`} className="why-demo-svg" role="img" aria-label={label || 'diagram'}>
      {children}
    </svg>
  )
}

/** Horizontal bars. items: [{ label, value, display, colour }] */
export function Bars({ items, max, label, h }) {
  const n = items.length
  const height = h || Math.max(46, n * 26 + 10)
  const bh = Math.min(20, (height - 12) / n - 7)
  return (
    <Stage h={height} label={label || 'comparison'}>
      {items.map((it, i) => {
        const y = 8 + i * (bh + 8)
        const w = Math.max(1.5, (it.value / (max || 1)) * 108)
        return (
          <g key={i}>
            <text x="2" y={y + bh * 0.78} fontSize="8.5" fill={SOFT}>{it.label}</text>
            <rect x="56" y={y} width={w} height={bh} rx="3" fill={it.colour || A} />
            <text x={60 + w} y={y + bh * 0.78} fontSize="8.5" fill={INK}>{it.display != null ? it.display : it.value}</text>
          </g>
        )
      })}
    </Stage>
  )
}

/** rows x cols of small squares. fill(r, c) returns a colour or null. */
export function CellGrid({ rows, cols, fill, cell, label, h = 100 }) {
  const size = cell || Math.max(3, Math.min(11, 90 / Math.max(rows, cols)))
  const w = cols * size
  const gh = rows * size
  const ox = 100 - w / 2
  const oy = (h - gh) / 2
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colour = fill ? fill(r, c) : A
      if (!colour) continue
      cells.push(
        <rect key={`${r}-${c}`} x={ox + c * size} y={oy + r * size}
              width={Math.max(1.5, size - 1.1)} height={Math.max(1.5, size - 1.1)}
              rx={size > 5 ? 1.5 : 0.5} fill={colour} />
      )
    }
  }
  return <Stage h={h} label={label || `${rows} by ${cols} grid`}>{cells}</Stage>
}

/**
 * Number line. marks: [{ at, colour, label, hollow }], regions:
 * [{ from, to, colour }], ticks: how many labelled divisions.
 */
export function NumLine({ min, max, marks = [], regions = [], ticks = 0, label, h = 52 }) {
  const X = (v) => 12 + ((v - min) / (max - min)) * 176
  const y = h - 22
  const tickEls = []
  for (let i = 0; ticks && i <= ticks; i++) {
    const v = min + ((max - min) * i) / ticks
    tickEls.push(
      <g key={i}>
        <line x1={X(v)} y1={y - 4} x2={X(v)} y2={y + 4} stroke={LINE} strokeWidth="1" />
        <text x={X(v)} y={y + 15} fontSize="7.5" fill={SOFT} textAnchor="middle">
          {Math.round(v * 100) / 100}
        </text>
      </g>
    )
  }
  return (
    <Stage h={h} label={label || 'number line'}>
      {regions.map((r, i) => (
        <rect key={`r${i}`} x={X(Math.min(r.from, r.to))} y={y - 7}
              width={Math.abs(X(r.to) - X(r.from))} height="14"
              fill={r.colour || A} opacity="0.25" />
      ))}
      <line x1="12" y1={y} x2="188" y2={y} stroke={LINE} strokeWidth="1.5" />
      {tickEls}
      {marks.map((m, i) => (
        <g key={`m${i}`}>
          <circle cx={X(m.at)} cy={y} r="4.5"
                  fill={m.hollow ? 'var(--clr-surface)' : (m.colour || A)}
                  stroke={m.colour || A} strokeWidth="2" />
          {m.label != null && (
            <text x={X(m.at)} y={y - 11} fontSize="8.5" fill={m.colour || A}
                  textAnchor="middle" fontWeight="700">{m.label}</text>
          )}
        </g>
      ))}
    </Stage>
  )
}

/**
 * Plots functions on a cartesian stage.
 * fns: [{ f, colour, dashed }]  points: [{ x, y, colour, label }]
 * segs: [{ x1, y1, x2, y2, colour, dashed }]  bands: [{ from, to, f, colour }]
 */
export function FnPlot({
  fns = [], points = [], segs = [], bands = [],
  xMin = -5, xMax = 5, yMin = -5, yMax = 5, axes = true, label, h = 100,
}) {
  const X = (x) => 10 + ((x - xMin) / (xMax - xMin)) * 180
  const Y = (y) => h - 10 - ((y - yMin) / (yMax - yMin)) * (h - 20)
  const clamp = (v) => Math.max(-1e4, Math.min(1e4, v))

  const path = (f) => {
    const step = (xMax - xMin) / 120
    const pts = []
    for (let x = xMin; x <= xMax; x += step) {
      const y = f(x)
      if (!isFinite(y) || y < yMin - 50 || y > yMax + 50) { pts.push(null); continue }
      pts.push(`${X(x).toFixed(1)},${Y(clamp(y)).toFixed(1)}`)
    }
    return pts.reduce((acc, p) => {
      if (!p) { acc.push([]); return acc }
      if (!acc.length) acc.push([])
      acc[acc.length - 1].push(p)
      return acc
    }, []).filter((s) => s.length > 1)
  }

  return (
    <Stage h={h} label={label || 'graph'}>
      {axes && (
        <g>
          {yMin < 0 && yMax > 0 && <line x1={X(xMin)} y1={Y(0)} x2={X(xMax)} y2={Y(0)} stroke={LINE} strokeWidth="1" />}
          {xMin < 0 && xMax > 0 && <line x1={X(0)} y1={Y(yMin)} x2={X(0)} y2={Y(yMax)} stroke={LINE} strokeWidth="1" />}
          {yMin >= 0 && <line x1={X(xMin)} y1={Y(yMin)} x2={X(xMax)} y2={Y(yMin)} stroke={LINE} strokeWidth="1" />}
        </g>
      )}
      {bands.map((b, i) => {
        const step = (b.to - b.from) / 24
        const pts = [`${X(b.from)},${Y(0)}`]
        for (let x = b.from; x <= b.to; x += step) pts.push(`${X(x)},${Y(clamp(b.f(x)))}`)
        pts.push(`${X(b.to)},${Y(0)}`)
        return <polygon key={`b${i}`} points={pts.join(' ')} fill={b.colour || A} opacity="0.28" />
      })}
      {fns.map((fn, i) =>
        path(fn.f).map((seg, j) => (
          <polyline key={`f${i}-${j}`} points={seg.join(' ')} fill="none"
                    stroke={fn.colour || A} strokeWidth="2"
                    strokeDasharray={fn.dashed ? '4 3' : undefined} />
        ))
      )}
      {segs.map((s, i) => (
        <line key={`s${i}`} x1={X(s.x1)} y1={Y(s.y1)} x2={X(s.x2)} y2={Y(s.y2)}
              stroke={s.colour || P} strokeWidth="2"
              strokeDasharray={s.dashed ? '4 3' : undefined} />
      ))}
      {points.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="3.6" fill={p.colour || A} />
          {p.label != null && (
            <text x={X(p.x)} y={Y(p.y) - 7} fontSize="8" fill={p.colour || A}
                  textAnchor="middle" fontWeight="700">{p.label}</text>
          )}
        </g>
      ))}
    </Stage>
  )
}

/** A filled polygon plus optional vertex dots and edge labels. */
export function Poly({ pts, fill, stroke, dots = [], texts = [], label, h = 100 }) {
  return (
    <Stage h={h} label={label || 'shape'}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')}
               fill={fill || 'var(--clr-accent-soft)'} stroke={stroke || A} strokeWidth="2" />
      {dots.map((d, i) => <circle key={i} cx={d[0]} cy={d[1]} r="3.5" fill={d[2] || A} />)}
      {texts.map((t, i) => (
        <text key={i} x={t.x} y={t.y} fontSize={t.size || 8.5} fill={t.colour || SOFT}
              textAnchor={t.anchor || 'middle'} fontWeight={t.bold ? '700' : '400'}>{t.t}</text>
      ))}
    </Stage>
  )
}

/** Row of counters, wrapped. fill(i) returns a colour. */
export function Dots({ n, fill, perRow = 12, label, h = 60 }) {
  const rows = Math.ceil(n / perRow)
  const r = rows > 4 ? 3 : 4.6
  const gap = r * 2.6
  const out = []
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const inRow = Math.min(perRow, n - row * perRow)
    out.push(
      <circle key={i} cx={100 - (inRow * gap) / 2 + gap / 2 + col * gap}
              cy={h / 2 - ((rows - 1) * gap) / 2 + row * gap}
              r={r} fill={fill ? fill(i) : A} />
    )
  }
  return <Stage h={h} label={label || `${n} counters`}>{out}</Stage>
}

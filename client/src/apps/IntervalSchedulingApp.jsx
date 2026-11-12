import { useState, useEffect, useRef } from 'react'
function IntervalSchedulingApp() {
  // ─────── Interval State ──────────────────────────────────
  // Array of {id, start, end} intervals created by user
  const [intervals, setIntervals] = useState([])
  // Next ID to assign to new intervals (auto-increment)
  const [nextId, setNextId] = useState(1)
  // Algorithm result (used to lock UI during stepping)
  const [result, setResult] = useState(null)
  // Current step in algorithm: -1=not started, 0..n=stepping through, n=finished
  const [step, setStep] = useState(-1)
  // Intervals sorted by finish time (computed when algorithm runs)
  const [sorted, setSorted] = useState([])
  // Theme preference: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('tenali-theme') || 'dark' } catch { return 'dark' }
  })

  // ─────── Theme Persistence ──────────────────────────────────
  // Sync theme to DOM and localStorage when changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('tenali-theme', theme) } catch { }
  }, [theme])

  // Toggle between dark and light mode
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // ─────── Timeline Constants ──────────────────────────────────
  // Maximum time value on timeline (24 units)
  const TIMELINE_MAX = 24
  // Colors for selected intervals (cycles through these)
  const COLORS = ['#e8864a', '#5cb87a', '#4a90d9', '#d94a8a', '#9b59b6', '#e6c84a', '#2ecc71', '#e74c3c', '#1abc9c', '#f39c12']

  // ─────── Drag State (for timeline interaction) ──────────────────────────────────
  // Is user currently dragging to create interval?
  const [dragging, setDragging] = useState(false)
  // Drag start time (in timeline units)
  const [dragStart, setDragStart] = useState(null)
  // Drag end time (in timeline units)
  const [dragEnd, setDragEnd] = useState(null)
  // Ref to timeline container DOM element
  const timelineRef = useRef(null)

  /**
   * getTimeFromX(clientX): Convert client X coordinate to timeline time unit
   * Maps pixel position within timeline to 0..TIMELINE_MAX range
   * Clamps result to valid range
   */
  const getTimeFromX = (clientX) => {
    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const t = Math.round((x / rect.width) * TIMELINE_MAX)
    return Math.max(0, Math.min(TIMELINE_MAX, t))
  }

  /**
   * handleMouseDown(e): Start dragging interval on timeline
   * Disabled if algorithm result is showing (UI locked during visualization)
   * Sets dragging state and initial drag time
   */
  const handleMouseDown = (e) => {
    if (result) return
    const t = getTimeFromX(e.clientX)
    setDragging(true)
    setDragStart(t)
    setDragEnd(t)
  }

  /**
   * handleMouseMove(e): Update drag end time while dragging
   * Called continuously during mouse movement
   */
  const handleMouseMove = (e) => {
    if (!dragging) return
    setDragEnd(getTimeFromX(e.clientX))
  }

  /**
   * handleMouseUp(): Complete interval creation
   * Creates interval if drag distance > 0 (start != end)
   * Adds to intervals array with next available ID
   * Resets drag state
   */
  const handleMouseUp = () => {
    if (!dragging) return
    setDragging(false)
    const s = Math.min(dragStart, dragEnd)
    const e = Math.max(dragStart, dragEnd)
    if (e > s) {
      setIntervals(prev => [...prev, { id: nextId, start: s, end: e }])
      setNextId(n => n + 1)
    }
    setDragStart(null)
    setDragEnd(null)
  }

  // ─────── Touch Support ──────────────────────────────────
  /**
   * handleTouchStart(e): Start dragging on touch device
   */
  const handleTouchStart = (e) => {
    if (result) return
    const touch = e.touches[0]
    const t = getTimeFromX(touch.clientX)
    setDragging(true)
    setDragStart(t)
    setDragEnd(t)
  }

  /**
   * handleTouchMove(e): Update drag during touch movement
   */
  const handleTouchMove = (e) => {
    if (!dragging) return
    const touch = e.touches[0]
    setDragEnd(getTimeFromX(touch.clientX))
  }

  /**
   * handleTouchEnd(): Complete touch drag (reuses mouse up logic)
   */
  const handleTouchEnd = () => {
    handleMouseUp()
  }

  /**
   * removeInterval(id): Delete interval from list
   * Disabled if algorithm result is showing
   */
  const removeInterval = (id) => {
    if (result) return
    setIntervals(prev => prev.filter(i => i.id !== id))
  }

  /**
   * runGreedy(): Start greedy algorithm visualization
   * Sorts intervals by finish time (then start time as tiebreaker)
   * Initializes step=0 (ready to process first interval)
   */
  const runGreedy = () => {
    const sortedByEnd = [...intervals].sort((a, b) => a.end - b.end || a.start - b.start)
    setSorted(sortedByEnd)
    setStep(0)
    setResult(null)
  }

  /**
   * stepForward(): Advance to next step in algorithm
   * No-op if already at end (step >= sorted.length)
   */
  const stepForward = () => {
    if (step >= sorted.length) return
    setStep(s => s + 1)
  }

  /**
   * runFullAlgorithm(): Skip to end (step = sorted.length)
   * Shows final result immediately without stepping through
   */
  const runFullAlgorithm = () => {
    setStep(sorted.length)
  }

  /**
   * getSelectedAtStep(upToStep): Compute selected intervals up to given step
   * Uses greedy strategy:
   *   - Iterate through sorted intervals (by finish time)
   *   - Include interval if start >= lastEnd (no overlap with previous)
   *   - Skip otherwise
   * Returns: Array of selected {id, start, end} intervals
   */
  const getSelectedAtStep = (upToStep) => {
    const selected = []
    let lastEnd = -Infinity
    for (let i = 0; i < Math.min(upToStep, sorted.length); i++) {
      if (sorted[i].start >= lastEnd) {
        selected.push(sorted[i])
        lastEnd = sorted[i].end
      }
    }
    return selected
  }

  // ─────── Derived State ──────────────────────────────────
  // Set of selected interval IDs at current step
  const selectedIntervals = step >= 0 ? getSelectedAtStep(step) : []
  // Is algorithm finished? (stepped past all intervals)
  const isFinished = step >= sorted.length && step >= 0
  // Current interval being considered (null if finished or not started)
  const currentConsidering = step >= 0 && step < sorted.length ? sorted[step] : null

  /**
   * wouldBeRejected: Is current interval rejected by greedy algorithm?
   * Checks if currentConsidering.start < lastEnd of selected set
   * If true, interval overlaps with last selected interval
   */
  const wouldBeRejected = (() => {
    if (!currentConsidering) return false
    const sel = getSelectedAtStep(step)
    const lastEnd = sel.length > 0 ? sel[sel.length - 1].end : -Infinity
    return currentConsidering.start < lastEnd
  })()

  /**
   * reset(): Reset algorithm state (go back to "before run")
   * Clears step, sorted intervals, and result
   */
  const reset = () => {
    setResult(null)
    setStep(-1)
    setSorted([])
  }

  /**
   * clearAll(): Reset everything (intervals, step, sorted)
   * Prepares for new scenario
   */
  const clearAll = () => {
    setIntervals([])
    setNextId(1)
    reset()
  }

  /**
   * loadExample(): Load predefined example intervals for demonstration
   * Useful for testing without manual creation
   */
  const loadExample = () => {
    clearAll()
    const examples = [
      { id: 1, start: 0, end: 6 },
      { id: 2, start: 1, end: 4 },
      { id: 3, start: 3, end: 5 },
      { id: 4, start: 5, end: 7 },
      { id: 5, start: 3, end: 9 },
      { id: 6, start: 5, end: 9 },
      { id: 7, start: 6, end: 10 },
      { id: 8, start: 8, end: 11 },
      { id: 9, start: 8, end: 12 },
      { id: 10, start: 2, end: 14 },
      { id: 11, start: 12, end: 16 },
    ]
    setIntervals(examples)
    setNextId(12)
  }

  // Set of selected interval IDs for quick lookup in render
  const selectedSet = new Set(selectedIntervals.map(i => i.id))

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="app-shell">
        <div className="card is-wide">
          <h1>Interval Scheduling</h1>
          <p className="subtitle">
            Drag on the timeline to create intervals, then step through the greedy algorithm
          </p>

          {/* Algorithm explanation */}
          <div className="is-algo-explain">
            <strong>Greedy strategy:</strong> Sort all intervals by finish time. Then, scan left to right — accept an interval if it doesn't overlap the last accepted one, otherwise skip it. This always gives the maximum number of non-overlapping intervals.
          </div>

          {/* Timeline */}
          <div className="is-timeline-container">
            <div className="is-timeline-labels">
              {Array.from({ length: TIMELINE_MAX + 1 }, (_, i) => (
                <span key={i} className="is-timeline-label">{i}</span>
              ))}
            </div>
            <div
              className="is-timeline"
              ref={timelineRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Grid lines */}
              {Array.from({ length: TIMELINE_MAX + 1 }, (_, i) => (
                <div key={i} className="is-grid-line" style={{ left: `${(i / TIMELINE_MAX) * 100}%` }} />
              ))}

              {/* Existing intervals */}
              {intervals.map((intv, idx) => {
                const isSelected = selectedSet.has(intv.id)
                const isConsidering = currentConsidering && currentConsidering.id === intv.id
                const isRejected = isConsidering && wouldBeRejected
                const wasProcessed = step >= 0 && sorted.findIndex(s => s.id === intv.id) < step && !isSelected

                let className = 'is-interval'
                if (isConsidering && !isRejected) className += ' is-considering'
                if (isConsidering && isRejected) className += ' is-rejected'
                if (isSelected) className += ' is-selected'
                if (wasProcessed && !isSelected) className += ' is-skipped'

                return (
                  <div
                    key={intv.id}
                    className={className}
                    style={{
                      left: `${(intv.start / TIMELINE_MAX) * 100}%`,
                      width: `${((intv.end - intv.start) / TIMELINE_MAX) * 100}%`,
                      top: `${(idx % 6) * 34 + 4}px`,
                      backgroundColor: isSelected ? COLORS[idx % COLORS.length] : undefined,
                    }}
                    title={`[${intv.start}, ${intv.end})`}
                  >
                    <span className="is-interval-label">{intv.start}–{intv.end}</span>
                    {step < 0 && (
                      <button className="is-interval-remove" onClick={(e) => { e.stopPropagation(); removeInterval(intv.id) }} aria-label="Remove interval">×</button>
                    )}
                  </div>
                )
              })}

              {/* Drag preview */}
              {dragging && dragStart !== null && dragEnd !== null && (
                <div
                  className="is-interval is-preview"
                  style={{
                    left: `${(Math.min(dragStart, dragEnd) / TIMELINE_MAX) * 100}%`,
                    width: `${((Math.abs(dragEnd - dragStart)) / TIMELINE_MAX) * 100}%`,
                    top: `${(intervals.length % 6) * 34 + 4}px`,
                  }}
                >
                  <span className="is-interval-label">{Math.min(dragStart, dragEnd)}–{Math.max(dragStart, dragEnd)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="is-controls">
            {step < 0 ? (
              <>
                <button className="is-btn" onClick={loadExample}>Load Example</button>
                <button className="is-btn" onClick={clearAll} disabled={intervals.length === 0}>Clear All</button>
                <button className="is-btn is-btn-primary" onClick={runGreedy} disabled={intervals.length === 0}>
                  Run Greedy Algorithm
                </button>
              </>
            ) : (
              <>
                <button className="is-btn" onClick={reset}>Reset</button>
                {!isFinished && (
                  <>
                    <button className="is-btn is-btn-primary" onClick={stepForward}>
                      Next Step
                    </button>
                    <button className="is-btn" onClick={runFullAlgorithm}>Skip to End</button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Step-by-step log */}
          {step >= 0 && (
            <div className="is-log">
              <h3>Algorithm Trace</h3>
              <div className="is-log-header">
                Sorted by finish time: [{sorted.map(s => `[${s.start},${s.end})`).join(', ')}]
              </div>
              <div className="is-log-entries">
                {sorted.slice(0, step).map((intv, i) => {
                  const selUpTo = getSelectedAtStep(i + 1)
                  const wasSelected = selUpTo.some(s => s.id === intv.id) && !getSelectedAtStep(i).some(s => s.id === intv.id)
                  const lastAccepted = getSelectedAtStep(i)
                  const lastEnd = lastAccepted.length > 0 ? lastAccepted[lastAccepted.length - 1].end : 0

                  return (
                    <div key={i} className={`is-log-entry ${wasSelected ? 'is-log-accept' : 'is-log-reject'}`}>
                      <span className="is-log-step">Step {i + 1}:</span>
                      <span>Consider [{intv.start}, {intv.end})</span>
                      {wasSelected ? (
                        <span className="is-log-verdict is-accept">
                          Accept (start {intv.start} {'>'}= last end {lastEnd})
                        </span>
                      ) : (
                        <span className="is-log-verdict is-reject">
                          Reject (start {intv.start} {'<'} last end {lastEnd})
                        </span>
                      )}
                    </div>
                  )
                })}
                {currentConsidering && (
                  <div className={`is-log-entry is-log-current ${wouldBeRejected ? 'is-log-reject-pending' : 'is-log-accept-pending'}`}>
                    <span className="is-log-step">Step {step + 1}:</span>
                    <span>Considering [{currentConsidering.start}, {currentConsidering.end})…</span>
                    <span className="is-log-verdict is-pending">press Next Step</span>
                  </div>
                )}
              </div>

              {isFinished && (
                <div className="is-result">
                  <strong>Result:</strong> {selectedIntervals.length} interval{selectedIntervals.length !== 1 ? 's' : ''} selected
                  — [{selectedIntervals.map(s => `[${s.start},${s.end})`).join(', ')}]
                  <br />
                  <span className="is-result-note">This is the maximum possible set of non-overlapping intervals.</span>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="is-legend">
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-default" /> Unprocessed</div>
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-considering" /> Considering</div>
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-selected" /> Accepted</div>
            <div className="is-legend-item"><span className="is-legend-swatch is-swatch-rejected" /> Rejected</div>
          </div>
        </div>
      </div>
    </>
  )
}
export default IntervalSchedulingApp
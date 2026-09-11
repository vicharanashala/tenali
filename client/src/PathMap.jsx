import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ─── PathMap Styles ─── */
const PM_STYLES = `
.pm-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px 64px;
  color: var(--clr-text, #fff);
  font-family: var(--font-body, system-ui, sans-serif);
}
.pm-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pm-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pm-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--clr-text, #fff);
}
.pm-icon-btn {
  background: var(--clr-card, rgba(255, 255, 255, 0.08));
  border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.15));
  border-radius: 8px;
  color: var(--clr-text, #fff);
  font-size: 1.2rem;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.pm-icon-btn:hover {
  background: var(--clr-hover-strong, rgba(255, 255, 255, 0.15));
}
.pm-intro {
  margin-bottom: 24px;
  color: var(--clr-text-soft, #a89e94);
  font-size: 0.95rem;
  line-height: 1.5;
}
.pm-empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--clr-text-soft, #a89e94);
  font-size: 0.95rem;
  background: var(--clr-card, rgba(255, 255, 255, 0.03));
  border: 1px dashed var(--clr-border, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  margin: 20px 0;
}
.pm-stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 20px 0;
}
.pm-stat {
  background: var(--clr-card, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--clr-border, rgba(255, 255, 255, 0.1));
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.pm-stat-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--clr-text, #fff);
}
.pm-stat-label {
  font-size: 0.75rem;
  color: var(--clr-text-soft, #a89e94);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
.pm-goal-card {
  background: var(--clr-card, rgba(255, 255, 255, 0.05));
  border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 24px;
}
.pm-goal-label {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--clr-text, #fff);
}
.pm-path-section {
  margin: 32px 0;
}
.pm-section-heading {
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--clr-text, #fff);
}
.pm-grid-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 36px;
  margin-bottom: 8px;
}
.pm-grid-filter {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.15));
  background: var(--clr-card, rgba(255, 255, 255, 0.05));
  color: var(--clr-text, #fff);
  font-size: 0.85rem;
  outline: none;
}
.pm-hint {
  font-size: 0.8rem;
  color: var(--clr-text-soft, #a89e94);
  margin-bottom: 16px;
}
.pm-module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.pm-card {
  position: relative;
  background: var(--clr-card, rgba(255, 255, 255, 0.05));
  border: 1.5px solid var(--clr-border, rgba(255, 255, 255, 0.12));
  border-radius: 10px;
  padding: 14px 12px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
  color: var(--clr-text, #fff);
}
.pm-card:hover {
  transform: translateY(-2px);
  border-color: var(--dot, var(--clr-accent, #e8864a));
  background: var(--clr-hover-strong, rgba(255, 255, 255, 0.08));
}
.pm-card.dimmed {
  opacity: 0.45;
}
.pm-card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
}
.pm-card-badge.goal {
  background: var(--clr-accent, #e8864a);
  color: #fff;
}
.pm-card-badge.step {
  background: #5cb87a;
  color: #fff;
}
.pm-card-label {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 4px;
  padding-right: 32px;
}
.pm-card-sub {
  font-size: 0.75rem;
  color: var(--clr-text-soft, #a89e94);
  line-height: 1.3;
}
`;

// ─── PathMap data & algorithms (unchanged) ───────────────────
// ─── PathMap graph data (fetched from graph-data.json, same file index.html/path.html use) ───
let pmNodes = []
let pmEdges = []
let pmCatColor = {}
let pmNodeById = {}
let pmPrereqMap = {}
let pmSuccessorMap = {}

let pmGraphDataPromise = null

function pmBuildDerivedMaps() {
  pmNodeById = Object.fromEntries(pmNodes.map((n) => [n.id, n]))
  pmPrereqMap = {}
  pmSuccessorMap = {}
  pmEdges.forEach(([a, b]) => {
    ;(pmPrereqMap[b] = pmPrereqMap[b] || []).push(a)
    ;(pmSuccessorMap[a] = pmSuccessorMap[a] || []).push(b)
  })
}

function pmFetchGraphData() {
  if (!pmGraphDataPromise) {
    pmGraphDataPromise = fetch('/graph-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load graph-data.json (${res.status})`)
        return res.json()
      })
      .then(({ categories, nodes, edges }) => {
        pmNodes = nodes
        pmEdges = edges
        pmCatColor = Object.fromEntries(Object.entries(categories).map(([id, c]) => [id, c.color]))
        pmBuildDerivedMaps()
      })
  }
  return pmGraphDataPromise
}

// React hook — loads the graph data once, reports 'loading' | 'ready' | 'error'
function usePmGraphData() {
  const [status, setStatus] = useState(() => (pmNodes.length ? 'ready' : 'loading'))

  useEffect(() => {
    if (status === 'ready') return
    let cancelled = false
    pmFetchGraphData()
      .then(() => { if (!cancelled) setStatus('ready') })
      .catch((err) => { if (!cancelled) { console.error(err); setStatus('error') } })
    return () => { cancelled = true }
  }, [status])

  return status
}

// ─── Module Progress Tracker (localStorage-based, easy/medium/hard per module) ───
// Simple design:
//  - Every answered question is recorded per moduleId + difficulty (correct/total).
//  - A module is "complete enough" using a Vachana-style adaptive correct streak:
//    - 3 consecutive correct answers on medium or hard difficulty, OR
//    - 5 consecutive correct answers of any difficulty (e.g. easy).
//    Any wrong answer resets the current active streak.
//  - Once complete, we look up the module's successors in the prereq graph
//    (graph-data.json edges) and suggest the first one not yet started.
const PM_TRACK_KEY = 'tenali_module_tracking'

function pmTrackLoad() {
  try { return JSON.parse(localStorage.getItem(PM_TRACK_KEY)) || {} } catch { return {} }
}
function pmTrackSave(data) {
  try { localStorage.setItem(PM_TRACK_KEY, JSON.stringify(data)) } catch { /* ignore quota errors */ }
}
function pmEmptyModuleStat() {
  return {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
    correctStreak: []
  }
}
// Listeners let any mounted <PmSuggestIcon/> re-render the instant a new answer is recorded
const pmTrackListeners = new Set()
function pmTrackNotify() { pmTrackListeners.forEach((fn) => { try { fn() } catch { } }) }

function pmTrackAnswer(moduleId, difficulty, isCorrect) {
  if (!moduleId) return
  const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium'
  const data = pmTrackLoad()
  const stat = data[moduleId] || pmEmptyModuleStat()
  if (!Array.isArray(stat.correctStreak)) {
    stat.correctStreak = []
  }
  stat[diff].total += 1
  if (isCorrect) {
    stat[diff].correct += 1
    stat.correctStreak.push(diff)
  } else {
    stat.correctStreak = []
  }
  data[moduleId] = stat
  pmTrackSave(data)
  pmTrackNotify()
}
function pmTrackGetStats(moduleId) {
  const data = pmTrackLoad()
  return data[moduleId] || pmEmptyModuleStat()
}
function pmTrackCorrectTotal(moduleId) {
  const s = pmTrackGetStats(moduleId)
  return s.easy.correct + s.medium.correct + s.hard.correct
}
function pmTrackThresholdMet(moduleId) {
  const stat = pmTrackGetStats(moduleId)
  const streak = stat.correctStreak || []
  if (streak.length >= 3) {
    const last3 = streak.slice(-3)
    if (last3.every((d) => d === 'medium' || d === 'hard')) {
      return true
    }
  }
  if (streak.length >= 5) {
    return true
  }
  return false
}
function pmTrackRemaining(moduleId) {
  if (pmTrackThresholdMet(moduleId)) return 0
  const stat = pmTrackGetStats(moduleId)
  const streak = stat.correctStreak || []
  
  // Count how many of the last elements of the streak are medium or hard
  let N = 0
  for (let i = streak.length - 1; i >= 0; i--) {
    if (streak[i] === 'medium' || streak[i] === 'hard') {
      N++
    } else {
      break
    }
  }
  N = Math.min(N, 3)
  
  const pathA = Math.max(0, 3 - N)
  const pathB = Math.max(0, 5 - streak.length)
  
  return Math.min(pathA, pathB)
}
function pmTrackDots(moduleId) {
  const stat = pmTrackGetStats(moduleId)
  const streak = stat.correctStreak || []
  const hasEasy = streak.includes('easy')
  const totalDots = hasEasy ? 5 : 3
  const filledDots = Math.min(streak.length, totalDots)
  
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', marginLeft: 6 }}>
      {Array.from({ length: totalDots }).map((_, idx) => (
        <span
          key={idx}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: idx < filledDots ? '#F08C46' : 'transparent',
            border: idx < filledDots ? '1px solid #F08C46' : '1px solid #8a8078',
            display: 'inline-block',
            transition: 'all 0.2s ease',
          }}
        />
      ))}
    </span>
  )
}
function pmGetKnownFromStorage() {
  try {
    const r = localStorage.getItem('tenali_pathmap_known')
    return new Set(r ? JSON.parse(r) : [])
  } catch {
    return new Set()
  }
}

function pmGetCurrentSuggestedModule() {
  if (!pmNodes.length) return null
  const known = pmGetKnownFromStorage()
  const isCompleted = (id) => known.has(id) || pmTrackThresholdMet(id)
  
  const allNodeIds = new Set(pmNodes.map(n => n.id))
  const sortedIds = pmTopoSort(allNodeIds)
  
  for (const id of sortedIds) {
    if (isCompleted(id)) continue
    const prereqs = pmPrereqMap[id] || []
    if (prereqs.every(p => isCompleted(p))) {
      return pmNodeById[id] || null
    }
  }
  return null
}

// Picks the next module to suggest: first successor (per graph-data.json edges)
// that hasn't been started yet, falling back to the first successor overall.
// AFTER
function pmTrackNextModule(moduleId) {
  const successors = pmSuccessorMap[moduleId] || []
  if (successors.length > 0) {
    return successors.map((id) => pmNodeById[id]).filter(Boolean)
  }
  
  // Fallback: suggest the next uncompleted node in the entire graph
  const nextGlobalNode = pmGetCurrentSuggestedModule()
  if (nextGlobalNode && nextGlobalNode.id !== moduleId) {
    return [nextGlobalNode]
  }
  
  // If everything is completed, return a special virtual node
  return [{ id: 'dashboard', label: '🎉 Go to Dashboard' }]
}

// Registered by the top-level App component so any nested quiz can navigate
// to a suggested module without prop-drilling.
let pmNavigateFn = null;
export function setPmNavigateFn(fn) { pmNavigateFn = fn; }

// Hook: call from any quiz component with its moduleId (graph-data.json node id).
// Returns { record(difficulty, isCorrect), thresholdMet, nextModule }.
function usePmModuleTracking(moduleId) {
  const graphStatus = usePmGraphData()
  const [, bump] = useState(0)
  useEffect(() => {
    const fn = () => bump((n) => n + 1)
    pmTrackListeners.add(fn)
    return () => pmTrackListeners.delete(fn)
  }, [])
  const record = useCallback((difficulty, isCorrect) => {
    pmTrackAnswer(moduleId, difficulty, isCorrect)
  }, [moduleId])
  const thresholdMet = moduleId ? pmTrackThresholdMet(moduleId) : false
   const nextModules = (graphStatus === 'ready' && moduleId && thresholdMet) ? pmTrackNextModule(moduleId) : []
  return { record, thresholdMet, nextModules }
}

// ─── PmSuggestIcon: floating bottom-right "next module" button ───────────────
// Grayed out / inert until the threshold is reached for the current module,
// then lights up and, on click, navigates straight to the suggested module.

function PmSuggestIcon({ moduleId }) {
  const { thresholdMet, nextModules } = usePmModuleTracking(moduleId)
  if (!moduleId) return null

  const active = thresholdMet && nextModules.length > 0
  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 80, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end'
    }}>
      {active ? nextModules.map((mod) => (
        <button
          key={mod.id}
          onClick={() => pmNavigateFn && pmNavigateFn(mod.id)}
          title={`Next up: ${mod.label}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px 6px 10px', borderRadius: 999,
            border: '1.5px solid #F08C46', background: '#F08C46',
            color: '#FFF', fontFamily: 'Inter, sans-serif',
            fontWeight: 700, fontSize: '0.75rem',
            boxShadow: '0 4px 12px rgba(240,140,70,0.3)',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e07c36'}
          onMouseLeave={e => e.currentTarget.style.background = '#F08C46'}
        >
          <span style={{ fontSize: '0.8rem' }}>🚀</span>
          {mod.label}
        </button>
      )) : (
        <button disabled style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', borderRadius: 999,
          border: '1.5px solid #5B5048', background: 'rgba(60,56,52,0.6)',
          color: '#8a8078', fontFamily: 'Inter, sans-serif',
          fontWeight: 700, fontSize: '0.75rem',
          cursor: 'not-allowed', opacity: 0.45,
        }}>
          <span style={{ fontSize: '0.8rem' }}>🔒</span>
          {(() => {
            if (!pmNodeById[moduleId]) return 'Next module'
            return (
              <>
                Unlock next
                {pmTrackDots(moduleId)}
              </>
            )
          })()}
        </button>
      )}
    </div>
  )
}

function pmGetSubgraphNodes(goalIdList) {
  const visited = new Set()
  const stack = [...goalIdList]
  while (stack.length) {
    const cur = stack.pop()
    if (visited.has(cur)) continue
    visited.add(cur)
    ;(pmPrereqMap[cur] || []).forEach((p) => { if (!visited.has(p)) stack.push(p) })
  }
  return visited
}

function pmTopoSort(nodeSet) {
  const inDeg = {}
  const adj = {}
  nodeSet.forEach((n) => { inDeg[n] = 0; adj[n] = [] })
  pmEdges.forEach(([a, b]) => {
    if (nodeSet.has(a) && nodeSet.has(b)) { adj[a].push(b); inDeg[b]++ }
  })
  const queue = [...nodeSet].filter((n) => inDeg[n] === 0).sort()
  const order = []
  while (queue.length) {
    queue.sort()
    const n = queue.shift()
    order.push(n)
    ;(adj[n] || []).forEach((m) => { inDeg[m]--; if (inDeg[m] === 0) queue.push(m) })
  }
  return order
}

function pmComputePath(goalIds) {
  if (!goalIds || !goalIds.length) return []
  return pmTopoSort(pmGetSubgraphNodes(goalIds))
}

// ─── PathMap svg utils ────────────────────────────────────────
function pmStarPoints(cx, cy, r) {
  const points = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const ang = (Math.PI / 5) * i - Math.PI / 2
    points.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`)
  }
  return points.join(' ')
}

// ─── PathMap hooks ────────────────────────────────────────────
function usePathmapState() {
  const pmStatus = usePmGraphData()
  const [goalIds, setGoalIds] = useState(() => {
    try { const r = localStorage.getItem('tenali_pathmap_goal'); return r ? JSON.parse(r) : [] }
    catch { return [] }
  })
  const [known, setKnown] = useState(() => {
    try { const r = localStorage.getItem('tenali_pathmap_known'); return new Set(r ? JSON.parse(r) : []) }
    catch { return new Set() }
  })

  useEffect(() => { localStorage.setItem('tenali_pathmap_goal', JSON.stringify(goalIds)) }, [goalIds])
  useEffect(() => { localStorage.setItem('tenali_pathmap_known', JSON.stringify([...known])) }, [known])

  const path = useMemo(() => (pmStatus === 'ready' ? pmComputePath(goalIds) : []), [goalIds, pmStatus])
  const setGoal    = useCallback((ids) => setGoalIds(ids), [])
  const clearGoal  = useCallback(() => setGoalIds([]), [])
  const toggleKnown = useCallback((id) => {
    setKnown((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }, [])

  return { goalIds, known, path, setGoal, clearGoal, toggleKnown, pmStatus }
}

// ─── PathMap StatsBar ─────────────────────────────────────────
function PmStatsBar({ path, known }) {
  if (!path.length) return null
  const doneCount = path.filter((id) => known.has(id)).length
  const remaining = path.length - doneCount
  return (
    <div className="pm-stats-bar">
      <div className="pm-stat">
        <div className="pm-stat-num">{path.length}</div>
        <div className="pm-stat-label">Total steps</div>
      </div>
      <div className="pm-stat">
        <div className="pm-stat-num" style={{ color: 'var(--clr-correct, #5cb87a)' }}>{doneCount}</div>
        <div className="pm-stat-label">Already known</div>
      </div>
      <div className="pm-stat">
        <div className="pm-stat-num" style={{ color: 'var(--clr-accent, #e8864a)' }}>{remaining}</div>
        <div className="pm-stat-label">Steps to go</div>
      </div>
    </div>
  )
}

// ─── PathMap GoalPicker ───────────────────────────────────────
function PmGoalPicker({ goalIds, onSetGoal, onClear }) {
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  const matches = query.trim().length > 0
    ? pmNodes.filter((n) => n.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : []

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setQuery('')
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const currentGoal = goalIds.length > 0 ? pmNodes.find(n => n.id === goalIds[0]) : null

  return (
    <div className="pm-goal-card">
      <div className="pm-goal-label">What do you want to learn?</div>
      <div className="pm-goal-search-wrap" ref={wrapRef}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search a topic, e.g. Differentiation, Trigonometry..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--clr-border)',
              background: 'var(--clr-card)',
              color: 'var(--clr-text)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
        {matches.length > 0 && (
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {matches.map((n, i) => (
              <div
                key={n.id}
                onClick={() => { onSetGoal([n.id]); setQuery('') }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: i !== matches.length - 1 ? '1px solid var(--clr-border)' : 'none',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: pmCatColor[n.cat] }} />
                <span>{n.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--clr-text-soft)' }}>{n.sub}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {currentGoal && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Goal:</span>
          <span style={{ fontWeight: 700, color: 'var(--clr-accent, #e8864a)' }}>{currentGoal.label}</span>
          <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-soft)', fontSize: '0.85rem' }}>✕ Clear</button>
        </div>
      )}
    </div>
  )
}

// ─── PathMap SnakePath ────────────────────────────────────────
const PM_GAP_Y = 108
const PM_AMP   = 150
const PM_WIDTH = 520
const PM_PAD_TOP = 50

function PmSnakePath({ path, known, goalIds, onToggleNode }) {
  const centerX = PM_WIDTH / 2

  const pts = path.map((id, i) => ({
    id,
    x: centerX + PM_AMP * Math.sin(i * 0.9),
    y: PM_PAD_TOP + i * PM_GAP_Y,
  }))
  const height = PM_PAD_TOP * 2 + PM_GAP_Y * Math.max(path.length - 1, 0)
  const currentIdx = path.findIndex((id) => !known.has(id))

  if (!path.length) return null

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${PM_WIDTH} ${height}`}
        width="100%"
        height={height}
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="pmGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {pts.slice(0, -1).map((p, i) => {
          const next = pts[i + 1]
          const bothDone = known.has(p.id) && known.has(next.id)
          const dx = next.x - p.x, dy = next.y - p.y
          const len = Math.hypot(dx, dy)
          const ux = dx / len, uy = dy / len
          const x1 = p.x + ux * 26, y1 = p.y + uy * 26
          const x2 = next.x - ux * 26, y2 = next.y - uy * 26
          return (
            <line key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={bothDone ? '#5cb87a' : 'rgba(255,255,255,0.22)'}
              strokeWidth={bothDone ? 4 : 3}
              strokeLinecap="round"
              strokeDasharray={bothDone ? undefined : '5 10'}
            />
          )
        })}

        {pts.map((p, i) => {
          const node = pmNodeById[p.id]
          const isGoal = goalIds.includes(p.id)
          const isDone = known.has(p.id)
          const isCurrent = i === currentIdx
          const color = pmCatColor[node.cat] || pmCatColor.other
          const fill = isDone ? '#5cb87a' : color
          const labelSide = p.x >= PM_WIDTH / 2 ? 1 : -1
          return (
            <g key={p.id}
              transform={`translate(${p.x},${p.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onToggleNode(p.id)}
            >
              {isCurrent && (
                <circle r={27} fill="none" stroke="var(--clr-accent, #e8864a)" strokeWidth={2.5} opacity={0.8} />
              )}
              <circle r={22} fill={fill} stroke={isDone ? '#fff' : 'rgba(255,255,255,0.2)'} strokeWidth={1.5} />
              {isDone ? (
                <path d="M -8,0 L -2,7 L 9,-8" stroke="#fff" strokeWidth={3} fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
              ) : isGoal ? (
                <polygon points={pmStarPoints(0, 0, 10)} fill="#fff" />
              ) : (
                <text textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={700} fill="#fff"
                  fontFamily="var(--font-body)">{i + 1}</text>
              )}
              <text x={30 * labelSide} y={5} fontSize={12} fontWeight={600}
                fill="var(--clr-text, #ede8e3)" textAnchor={labelSide > 0 ? 'start' : 'end'}
                fontFamily="var(--font-body)">{node.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── PathMap ModuleGrid ───────────────────────────────────────
function PmModuleGrid({ path, known, goalIds, onToggleKnown, onSetGoal }) {
  const [filter, setFilter] = useState('')
  const pathIndex = useMemo(() => Object.fromEntries(path.map((id, i) => [id, i + 1])), [path])
  const sorted = useMemo(() => [...pmNodes].sort((a, b) => a.label.localeCompare(b.label)), [])
  const filtered = filter.trim()
    ? sorted.filter((n) => n.label.toLowerCase().includes(filter.trim().toLowerCase()))
    : sorted

  function handleCardClick(e, id) {
    if (e.shiftKey || e.metaKey || e.ctrlKey) onSetGoal([id])
  }

  return (
    <div>
      <div className="pm-grid-heading">
        <div className="pm-section-heading">All topics</div>
        <input className="pm-grid-filter" type="text" placeholder="Filter topics…"
          value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <p className="pm-hint">Click any card to mark it known / not known. Shift-click to set as goal.</p>
      <div className="pm-module-grid">
        {filtered.map((n) => {
          const onPath = pathIndex[n.id] !== undefined
          const isKnown = known.has(n.id)
          const isGoal = goalIds.includes(n.id)
          const dimmed = goalIds.length > 0 && !onPath
          let badge = null
          if (isGoal) badge = <span className="pm-card-badge goal">GOAL</span>
          else if (onPath) badge = <span className="pm-card-badge step">{pathIndex[n.id]}</span>
          return (
            <button key={n.id} className={`pm-card${dimmed ? ' dimmed' : ''}`}
              style={{ '--dot': pmCatColor[n.cat] }} onClick={(e) => handleCardClick(e, n.id)}>
              {badge}
              <div className="pm-card-label">{n.label}</div>
              <div className="pm-card-sub">{n.sub}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── PathMap main component ───────────────────────────────────
function PathMap({ onBack }) {
  const { goalIds, known, path, setGoal, clearGoal, toggleKnown, pmStatus } = usePathmapState()

  if (pmStatus === 'loading') {
    return (
      <div className="pm-shell">
        <div className="pm-topbar">
          <div className="pm-brand">
            {onBack && (
              <button className="pm-icon-btn" onClick={onBack} title="Back" aria-label="Back">←</button>
            )}
            <h1>Your Learning Path</h1>
          </div>
        </div>
        <div className="pm-empty">Loading topics…</div>
      </div>
    )
  }

  if (pmStatus === 'error') {
    return (
      <div className="pm-shell">
        <div className="pm-topbar">
          <div className="pm-brand">
            {onBack && (
              <button className="pm-icon-btn" onClick={onBack} title="Back" aria-label="Back">←</button>
            )}
            <h1>Your Learning Path</h1>
          </div>
        </div>
        <div className="pm-empty">Couldn't load topic data. Please refresh and try again.</div>
      </div>
    )
  }

  return (
    <div className="pm-shell">
      <div className="pm-topbar">
        <div className="pm-brand">
          {onBack && (
            <button className="pm-icon-btn" onClick={onBack} title="Back" aria-label="Back">←</button>
          )}
          <h1>Your Learning Path</h1>
        </div>
      </div>
      <div className="pm-intro">
        <p>
          Pick a goal topic and we&rsquo;ll lay out every prerequisite in order. Mark what you
          already know to skip it — the path updates instantly, and stays saved on this device.
        </p>
      </div>
      <PmGoalPicker goalIds={goalIds} onSetGoal={setGoal} onClear={clearGoal} />
      <PmStatsBar path={path} known={known} />
      {path.length === 0 ? (
        <div className="pm-empty">Set a goal above to see your personalised prerequisite path.</div>
      ) : (
        <div className="pm-path-section">
          <div className="pm-section-heading">Your path</div>
          <PmSnakePath path={path} known={known} goalIds={goalIds} onToggleNode={toggleKnown} />
        </div>
      )}
      <PmModuleGrid path={path} known={known} goalIds={goalIds} onToggleKnown={toggleKnown} onSetGoal={setGoal} />
    </div>
  )
}

// ─── END PATHMAP ─────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// PmCongratsModal — shown when every node in the path is marked known.
// Uses only app-native CSS variables so it blends with the rest of the UI.
// ═══════════════════════════════════════════════════════════════
function PmCongratsModal({ goalIds, path, onClose, onNewGoal, onSetGoal }) {
  const goalNode = goalIds.length > 0 ? pmNodeById[goalIds[0]] : null
  if (!goalNode) return null

  // Topics that succeed the goal in the graph but are NOT already in the path
  const pathSet = new Set(path)
  const furtherNodes = (pmSuccessorMap[goalIds[0]] || [])
    .filter((id) => !pathSet.has(id))
    .slice(0, 4)
    .map((id) => pmNodeById[id])
    .filter(Boolean)

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{
        background: 'var(--clr-bg)',
        border: '1.5px solid var(--clr-border)',
        borderRadius: 18,
        width: '100%',
        maxWidth: 400,
        padding: '32px 26px 26px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
      }}>
        {/* close button — same pattern as every other modal in the app */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none',
            fontSize: '1.3rem', lineHeight: 1,
            cursor: 'pointer',
            color: 'var(--clr-text-soft)',
          }}
        >✕</button>

        {/* Trophy row */}
        <div style={{ fontSize: 38, marginBottom: 16, letterSpacing: 4 }}>🎉 🏆 🎉</div>

        {/* Headline */}
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--clr-text)',
          fontFamily: 'var(--font-body)',
          marginBottom: 6,
        }}>
          Path complete!
        </div>

        {/* Goal name — accent colour, same as used elsewhere in the path panel */}
        <div style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--clr-accent, #e8864a)',
          fontFamily: 'var(--font-body)',
          marginBottom: 10,
        }}>
          {goalNode.label}
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--clr-text-soft)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          marginBottom: 22,
        }}>
          You've mastered all {path.length} steps on your path. Brilliant work!
        </p>

        {/* Divider — same border colour as the rest of the UI */}
        <div style={{ borderTop: '1px solid var(--clr-border)', marginBottom: 18 }} />

        {furtherNodes.length > 0 ? (
          <>
            {/* Section label — same micro-label style used in the path panel header */}
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.55px',
              textTransform: 'uppercase',
              color: 'var(--clr-text-soft)',
              fontFamily: 'var(--font-body)',
              marginBottom: 12,
            }}>
              What to study next
            </div>

            {/* Suggestion cards — same card background / border as pm-card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: furtherNodes.length === 1 ? '1fr' : '1fr 1fr',
              gap: 8,
              marginBottom: 24,
            }}>
              {furtherNodes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { onSetGoal([n.id]); onClose() }}
                  style={{
                    background: 'var(--clr-card)',
                    border: '1.5px solid var(--clr-border)',
                    borderRadius: 'var(--radius-sm, 10px)',
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = pmCatColor[n.cat]
                    e.currentTarget.style.background = 'var(--clr-hover-strong, rgba(255,255,255,0.06))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--clr-border)'
                    e.currentTarget.style.background = 'var(--clr-card)'
                  }}
                >
                  {/* category dot — same dot used on pm-cards */}
                  <div style={{
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: pmCatColor[n.cat],
                    marginBottom: 7,
                  }} />
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--clr-text)',
                    marginBottom: 3,
                  }}>
                    {n.label}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--clr-text-soft)',
                    lineHeight: 1.4,
                  }}>
                    {n.sub}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* No successors — just a warm wrap-up line */
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--clr-text-soft)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
            marginBottom: 24,
          }}>
            You've reached the top of this topic's tree. Pick a new goal to keep building!
          </p>
        )}

        {/* Action row — ghost + accent, same pattern as modal "Show my path" button */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: '1.5px solid var(--clr-border)',
              borderRadius: 10,
              color: 'var(--clr-text-soft)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={onNewGoal}
            style={{
              flex: 2,
              padding: '10px',
              background: 'var(--clr-accent, #e8864a)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Pick a new goal →
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PmHomePath — gamified winding trail shown on the Home screen
// ═══════════════════════════════════════════════════════════════
const PMH_WIDTH   = 620
const PMH_AMP     = 190
const PMH_GAP_Y   = 152
const PMH_PAD_TOP = 64
const PMH_R       = 34

function PmHomePath({ path, known, goalIds, onToggleKnown, onSelect }) {
  const centerX = PMH_WIDTH / 2

  const pts = path.map((id, i) => ({
    id,
    x: centerX + PMH_AMP * Math.sin(i * 0.85),
    y: PMH_PAD_TOP + i * PMH_GAP_Y,
  }))
  const height = PMH_PAD_TOP * 2 + PMH_GAP_Y * Math.max(path.length - 1, 0)
  const currentIdx = path.findIndex((id) => !known.has(id))

  if (!path.length) return null

  return (
    <div className="pmh-wrap" style={{ width: '100%', overflowX: 'auto' }}>
      <style>{`
        @keyframes pmhPulseRing {
          0%   { r: ${PMH_R + 6}px; opacity: 0.65; }
          70%  { r: ${PMH_R + 20}px; opacity: 0; }
          100% { r: ${PMH_R + 20}px; opacity: 0; }
        }
        .pmh-pulse { animation: pmhPulseRing 1.8s ease-out infinite; transform-origin: center; }
        .pmh-node { transition: opacity 0.2s; }
        .pmh-node:hover { opacity: 0.85; }
      `}</style>
      <svg
        viewBox={`0 0 ${PMH_WIDTH} ${height}`}
        width="100%"
        height={height}
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="pmhGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {pts.slice(0, -1).map((p, i) => {
          const next = pts[i + 1]
          const bothDone = known.has(p.id) && known.has(next.id)
          const midY = (p.y + next.y) / 2
          const d = `M ${p.x} ${p.y} C ${p.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`
          return (
            <path key={i} d={d} fill="none"
              stroke={bothDone ? '#5cb87a' : 'rgba(255,255,255,0.18)'}
              strokeWidth={bothDone ? 8 : 7}
              strokeLinecap="round"
              strokeDasharray={bothDone ? undefined : '2 16'}
            />
          )
        })}

        {pts.map((p, i) => {
          const node = pmNodeById[p.id]
          const isDone = known.has(p.id)
          const isGoal = goalIds.includes(p.id)
          const isCurrent = i === currentIdx
          const isFuture = !isDone && !isCurrent && i > currentIdx
          const color = pmCatColor[node.cat] || pmCatColor.other
          const fill = isDone ? '#5cb87a' : color
          const labelSide = p.x >= centerX ? 1 : -1
          const nodeOpacity = isFuture ? 0.4 : 1

          return (
            <g key={p.id} transform={`translate(${p.x},${p.y})`}>
              {isCurrent && (
                <circle className="pmh-pulse" r={PMH_R + 6} fill="none"
                  stroke={color} strokeWidth={3} />
              )}

              <g
                className="pmh-node"
                style={{ cursor: 'pointer' }}
                opacity={nodeOpacity}
                onClick={() => onSelect(p.id)}
              >
                <circle r={PMH_R} fill={fill}
                  stroke={isDone ? '#fff' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={2}
                  filter={isCurrent ? 'url(#pmhGlow)' : undefined}
                />
                {isDone ? (
                  <path d="M -12,0 L -3,10 L 13,-11" stroke="#fff" strokeWidth={4.5}
                    fill="none" strokeLinecap="round" strokeLinejoin="round" />
                ) : isGoal ? (
                  <polygon points={pmStarPoints(0, 0, 16)} fill="#fff" />
                ) : (
                  <text textAnchor="middle" dy="0.35em" fontSize={17} fontWeight={800}
                    fill="#fff" fontFamily="var(--font-body)">{i + 1}</text>
                )}
              </g>

              {/* small "mark as known" toggle badge */}
              <g
                transform={`translate(${PMH_R - 8},${-PMH_R + 8})`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); onToggleKnown(p.id) }}
              >
                <circle r={12} fill={isDone ? '#5cb87a' : 'var(--clr-card, #2a2420)'}
                  stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
                <path d="M -4.5,0 L -1,3.5 L 4.5,-4.5" stroke="#fff" strokeWidth={2.2}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  opacity={isDone ? 1 : 0.55} />
              </g>

              {isCurrent && (
                <text x={0} y={-PMH_R - 18} textAnchor="middle" fontSize={11.5} fontWeight={800}
                  fill={color} fontFamily="var(--font-body)" letterSpacing="0.6">
                  ▶ START HERE
                </text>
              )}
              {isGoal && !isCurrent && (
                <text x={0} y={-PMH_R - 18} textAnchor="middle" fontSize={11} fontWeight={800}
                  fill="var(--clr-accent, #e8864a)" fontFamily="var(--font-body)" letterSpacing="0.6">
                  🏁 GOAL
                </text>
              )}

              <text x={(PMH_R + 18) * labelSide} y={-6} fontSize={14.5} fontWeight={700}
                fill="var(--clr-text, #ede8e3)" textAnchor={labelSide > 0 ? 'start' : 'end'}
                fontFamily="var(--font-body)" opacity={nodeOpacity}>
                {node.label}
              </text>
              <text x={(PMH_R + 18) * labelSide} y={13} fontSize={11.5}
                fill="var(--clr-text-soft, #a89e94)" textAnchor={labelSide > 0 ? 'start' : 'end'}
                fontFamily="var(--font-body)" opacity={nodeOpacity}>
                {node.sub}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default PathMap;
export {
  pmTrackAnswer,
  PmSuggestIcon,
  usePmGraphData,
  pmComputePath,
  pmNodeById,
  pmSuccessorMap,
  pmCatColor,
  pmStarPoints,
  PmCongratsModal,
  PmHomePath,
  PmGoalPicker,
  PmStatsBar,
  PmSnakePath,
  usePathmapState,
  pmGetCurrentSuggestedModule
};

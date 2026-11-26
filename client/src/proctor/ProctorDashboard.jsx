/**
 * ProctorDashboard — Interactive instructor view with flashcard-style anomaly evidence cards.
 *
 * Performance:
 *   - React.memo on session + anomaly cards
 *   - Throttled localStorage writes (1s debounce)
 *   - Lazy-loaded screenshots (loading="lazy")
 *   - Polling via ref (no stale closures)
 *   - 10s session polling (was 5s), 5s detail polling (was 3s)
 *
 * Interactive features:
 *   - Search by username/quiz type
 *   - Filter by status (active/completed/ejected)
 *   - Sort by newest / highest penalty / most events
 *   - Summary stats bar
 *   - Expand/collapse anomaly cards
 *   - Filter events by type and severity
 *   - Real-time live pulse indicator
 *   - Export session as JSON
 *   - Severity distribution bar
 */

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'

const API = import.meta.env?.VITE_API_BASE_URL || ''
const STORAGE_KEY_SESSIONS = 'tenali_proctor_sessions_cache'
const STORAGE_KEY_DETAIL = 'tenali_proctor_detail_cache'
const POLL_SESSIONS_MS = 10000
const POLL_DETAIL_MS = 5000
const CACHE_DEBOUNCE_MS = 1000

const TYPE_ICONS = {
  tab_switch: '🔄', tab_blur: '👁️', no_face: '👤',
  multiple_faces: '👥', face_mismatch: '🎭', blur_detected: '🌫️',
  voice_detected: '🎤', virtual_camera: '💻', security_challenge_failed: '🔒',
  right_click: '🖱️', copy_paste: '📋', devtools: '🛠️',
  ejected: '🚫', idle: '😴', motion_detected: '🏃',
  camera_covered: '🙈', camera_overexposed: '☀️',
}

const TYPE_LABELS = {
  tab_switch: 'Tab Switched', tab_blur: 'Window Lost Focus', no_face: 'No Face Detected',
  multiple_faces: 'Multiple Faces', face_mismatch: 'Identity Mismatch',
  blur_detected: 'Camera Obscured', voice_detected: 'Speaking Detected',
  virtual_camera: 'Virtual Camera', security_challenge_failed: 'Challenge Failed',
  right_click: 'Right Click', copy_paste: 'Copy/Paste', devtools: 'DevTools Opened',
  ejected: 'Session Ejected', idle: 'Inactivity', motion_detected: 'Scene Change',
  camera_covered: 'Camera Covered', camera_overexposed: 'Overexposed',
}

const SEVERITY_STYLES = {
  1: { bg: 'rgba(234,179,8,0.15)', border: '#eab308', label: 'Low', color: '#fde68a' },
  2: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', label: 'Medium', color: '#fcd34d' },
  3: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', label: 'High', color: '#fca5a5' },
}

const STATUS_OPTIONS = ['all', 'active', 'completed', 'ejected']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'penalty', label: 'Highest Penalty' },
  { value: 'events', label: 'Most Events' },
]

function loadCache(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}

function makeHeaders() {
  const token = localStorage.getItem('tenali-auth-token') || '';
  return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch { return '—' }
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch { return '—' }
}

function timeAgo(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const secs = Math.floor((Date.now() - d.getTime()) / 1000)
    if (secs < 10) return 'just now'
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  } catch { return '' }
}

// ── Throttled cache writer ───────────────────────────────────────────────
let _cacheTimer = null
let _pendingCache = {}
function throttledSave(key, data) {
  _pendingCache[key] = data
  if (_cacheTimer) return
  _cacheTimer = setTimeout(() => {
    _cacheTimer = null
    for (const k in _pendingCache) {
      try { localStorage.setItem(k, JSON.stringify(_pendingCache[k])) } catch { /* quota */ }
    }
    _pendingCache = {}
  }, CACHE_DEBOUNCE_MS)
}

// ── Screenshot Modal ─────────────────────────────────────────────────────
function ScreenshotModal({ src, onClose }) {
  if (!src) return null
  return (
    <div className="proctor-screenshot-modal-overlay" onClick={onClose}>
      <div className="proctor-screenshot-modal" onClick={e => e.stopPropagation()}>
        <div className="proctor-screenshot-modal-header">
          <span>Evidence Screenshot</span>
          <button onClick={onClose}>✕</button>
        </div>
        <img src={src} alt="Anomaly evidence" />
      </div>
    </div>
  )
}

// ── Summary Stats Bar ────────────────────────────────────────────────────
function StatsBar({ sessions }) {
  const stats = useMemo(() => {
    let active = 0, totalPenalty = 0
    for (const s of sessions) {
      if (s.status === 'active') active++
      totalPenalty += s.totalPenalty || 0
    }
    return { total: sessions.length, active, totalPenalty }
  }, [sessions])

  return (
    <div className="proctor-stats-bar">
      <div className="proctor-stat-pill">
        <span className="proctor-stat-pill-value">{stats.total}</span>
        <span className="proctor-stat-pill-label">Sessions</span>
      </div>
      <div className="proctor-stat-pill live">
        <span className="proctor-stat-pill-dot" />
        <span className="proctor-stat-pill-value">{stats.active}</span>
        <span className="proctor-stat-pill-label">Live</span>
      </div>
      <div className="proctor-stat-pill">
        <span className="proctor-stat-pill-value">{stats.totalPenalty}</span>
        <span className="proctor-stat-pill-label">Total Penalty</span>
      </div>
    </div>
  )
}

// ── Severity Distribution Bar ────────────────────────────────────────────
function SeverityBar({ events }) {
  const counts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0 }
    for (const e of (events || [])) {
      c[e.severity] = (c[e.severity] || 0) + 1
    }
    return c
  }, [events])

  const total = counts[1] + counts[2] + counts[3]
  if (total === 0) return null

  return (
    <div className="proctor-severity-bar-wrap">
      <div className="proctor-severity-bar">
        {counts[3] > 0 && (
          <div
            className="proctor-severity-seg high"
            style={{ flex: counts[3] }}
            title={`High: ${counts[3]}`}
          />
        )}
        {counts[2] > 0 && (
          <div
            className="proctor-severity-seg med"
            style={{ flex: counts[2] }}
            title={`Medium: ${counts[2]}`}
          />
        )}
        {counts[1] > 0 && (
          <div
            className="proctor-severity-seg low"
            style={{ flex: counts[1] }}
            title={`Low: ${counts[1]}`}
          />
        )}
      </div>
      <div className="proctor-severity-legend">
        <span className="proctor-sev-leg-item"><span className="proctor-sev-dot high" /> High {counts[3]}</span>
        <span className="proctor-sev-leg-item"><span className="proctor-sev-dot med" /> Med {counts[2]}</span>
        <span className="proctor-sev-leg-item"><span className="proctor-sev-dot low" /> Low {counts[1]}</span>
      </div>
    </div>
  )
}

// ── Session Card (memoized) ──────────────────────────────────────────────
const SessionCard = memo(function SessionCard({ s, isSelected, eventCount, onClick }) {
  return (
    <div
      className={`proctor-session-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="proctor-session-card-header">
        <span className="proctor-session-quiz">{s.quizType}</span>
        <span className={`proctor-session-status status-${s.status}`}>{s.status}</span>
      </div>
      <div className="proctor-session-meta">
        <span>{s.username}</span>
        <span className={s.totalPenalty >= 10 ? 'proctor-penalty-high' : ''}>
          Penalty: {s.totalPenalty}
        </span>
      </div>
      {eventCount > 0 && (
        <div className="proctor-session-event-count">
          {eventCount} event{eventCount !== 1 ? 's' : ''}
        </div>
      )}
      <div className="proctor-session-date">
        {formatDateTime(s.startedAt)}
      </div>
    </div>
  )
})

// ── Anomaly Card (memoized) ──────────────────────────────────────────────
const AnomalyCard = memo(function AnomalyCard({ ev, onScreenshot, isExpanded, onToggle }) {
  const sev = SEVERITY_STYLES[ev.severity] || SEVERITY_STYLES[1]

  return (
    <div
      className={`proctor-anomaly-card ${ev.evidence ? 'screenshot-available' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={{ borderLeftColor: sev.border }}
    >
      <div className="proctor-anomaly-card-screenshot">
        {ev.evidence ? (
          <img
            src={ev.evidence}
            alt="Evidence"
            loading="lazy"
            onClick={() => onScreenshot(ev.evidence)}
            title="Click to enlarge"
          />
        ) : (
          <div className="proctor-anomaly-card-no-screenshot">No Screenshot</div>
        )}
      </div>
      <div className="proctor-anomaly-card-body">
        <div className="proctor-anomaly-card-top">
          <span className="proctor-anomaly-card-icon">{TYPE_ICONS[ev.type] || '⚠️'}</span>
          <span className="proctor-anomaly-card-type">
            {TYPE_LABELS[ev.type] || ev.type.replace(/_/g, ' ')}
          </span>
          <span
            className="proctor-anomaly-card-severity"
            style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}
          >
            {sev.label}
          </span>
          <button
            className="proctor-anomaly-expand-btn"
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        </div>
        <div className="proctor-anomaly-card-meta">
          <span className="proctor-anomaly-card-time">
            {formatTime(ev.timestamp)}
          </span>
          <span className="proctor-anomaly-card-ago">
            {timeAgo(ev.timestamp)}
          </span>
        </div>
        {isExpanded && (
          <div className="proctor-anomaly-card-expanded-meta">
            {ev.transcript || ev.metadata?.transcript ? (
              <div className="proctor-transcript-block">
                <strong>Transcript:</strong>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic' }}>"{ev.transcript || ev.metadata.transcript}"</p>
              </div>
            ) : null}
            {ev.metadata && (
              <pre>{JSON.stringify(ev.metadata, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

// ── Main Dashboard ───────────────────────────────────────────────────────
export default function ProctorDashboard({ onBack }) {
  const [sessions, setSessions] = useState(() => loadCache(STORAGE_KEY_SESSIONS, []))
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(() => loadCache(STORAGE_KEY_DETAIL, null))
  const [error, setError] = useState(null)
  const [screenshotModal, setScreenshotModal] = useState(null)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const loadedOnceRef = useRef(false)

  // ── Interactive state ──
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [expandedCards, setExpandedCards] = useState({})
  const [eventCounts, setEventCounts] = useState({})

  // Refs for stable polling
  const selectedRef = useRef(selected)

  // Keep ref in sync via effect
  useEffect(() => {
    selectedRef.current = selected
  })

  // ── Data fetching ──
  const fetchSessions = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const r = await fetch(`${API}/api/proctor/sessions`, { headers: makeHeaders() })
      if (r.status === 401 || r.status === 403) {
        setError('Admin login required. Please log in with an admin account.')
        setRefreshing(false)
        return
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      const sessionsData = d.sessions || []
      setSessions(sessionsData)
      throttledSave(STORAGE_KEY_SESSIONS, sessionsData)

      // Build event counts per session
      const counts = {}
      for (const s of sessionsData) {
        counts[s._id] = s.totalPenalty > 0 ? Math.max(1, Math.round(s.totalPenalty / 2)) : 0
      }
      setEventCounts(counts)
      setError(null)
      setLastRefreshed(Date.now())
      loadedOnceRef.current = true
    } catch (err) {
      setError(err.message || 'Failed to load sessions')
      loadedOnceRef.current = true
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [])

  const fetchDetail = useCallback(async (id) => {
    if (!id) return
    try {
      const r = await fetch(`${API}/api/proctor/session/${id}`, { headers: makeHeaders() })
      if (r.ok) {
        const d = await r.json()
        setDetail(d)
        throttledSave(STORAGE_KEY_DETAIL, d)
        // Update event count from actual data
        if (d.events) {
          setEventCounts(prev => ({ ...prev, [id]: d.events.length }))
        }
      }
    } catch { /* silent */ }
  }, [])

  // ── Polling ──
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchSessions()
    const id = setInterval(() => fetchSessions(true), POLL_SESSIONS_MS)
    return () => clearInterval(id)
  }, [fetchSessions])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const current = selectedRef.current
    if (!current) return
    fetchDetail(current)
    const id = setInterval(() => {
      if (selectedRef.current) fetchDetail(selectedRef.current)
    }, POLL_DETAIL_MS)
    return () => clearInterval(id)
  }, [selected, fetchDetail])

  // ── Expand/collapse ──
  const toggleExpand = useCallback((evId) => {
    setExpandedCards(prev => ({ ...prev, [evId]: !prev[evId] }))
  }, [])

  // ── Export ──
  const exportSession = useCallback(() => {
    if (!detail?.session) return
    const blob = new Blob([JSON.stringify(detail, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proctor-${detail.session._id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [detail])

  // ── Selection ──
  const handleSelect = useCallback((id) => {
    setSelected(prev => prev === id ? null : id)
    setExpandedCards({})
    setEventTypeFilter('all')
    setSeverityFilter('all')
  }, [])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('.proctor-search-input')?.focus()
      }
      if (e.key === 'Escape') {
        if (search) setSearch('')
        else if (selected) setSelected(null)
      }
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        fetchSessions()
      }
      if (e.key === 'e' && !e.metaKey && !e.ctrlKey && detail?.session) {
        exportSession()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [search, selected, detail, fetchSessions, exportSession])

  // ── Derived data ──
  const filteredSessions = useMemo(() => {
    let result = sessions
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.username.toLowerCase().includes(q) ||
        s.quizType.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter)
    }
    if (sortBy === 'penalty') {
      result = [...result].sort((a, b) => (b.totalPenalty || 0) - (a.totalPenalty || 0))
    } else if (sortBy === 'events') {
      result = [...result].sort((a, b) => (eventCounts[b._id] || 0) - (eventCounts[a._id] || 0))
    } else {
      result = [...result].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    }
    return result
  }, [sessions, search, statusFilter, sortBy, eventCounts])

  const filteredEvents = useMemo(() => {
    if (!detail || !detail.events) return []
    let events = detail.events
    if (eventTypeFilter !== 'all') {
      events = events.filter(e => e.type === eventTypeFilter)
    }
    if (severityFilter !== 'all') {
      events = events.filter(e => e.severity === Number(severityFilter))
    }
    return events
  }, [detail, eventTypeFilter, severityFilter])

  const availableEventTypes = useMemo(() => {
    if (!detail || !detail.events) return []
    const types = new Set(detail.events.map(e => e.type))
    return Array.from(types).sort()
  }, [detail])

  const hasHighSeverity = detail?.events?.some(e => e.severity >= 3)

  return (
    <div className="proctor-dashboard">
      {/* ── Header ── */}
      <div className="proctor-dashboard-header">
        <button className="proctor-btn proctor-btn-skip" onClick={onBack}>← Back</button>
        <h2>Proctor Dashboard</h2>
        <div className="proctor-header-live">
          <span className="proctor-live-dot" />
          <span>Live</span>
        </div>
        <button
          className="proctor-btn proctor-btn-skip"
          onClick={() => fetchSessions()}
          title="Refresh now"
        >
          {refreshing ? '⟳ Refreshing…' : '⟳ Refresh'}
        </button>
        {lastRefreshed && (
          <span className="proctor-header-time">
            Updated {timeAgo(lastRefreshed)}
          </span>
        )}
      </div>

      {/* ── Stats Bar ── */}
      {lastRefreshed && sessions.length > 0 && <StatsBar sessions={sessions} />}

      {/* ── Controls Bar ── */}
      {lastRefreshed && sessions.length > 0 && (
        <div className="proctor-controls-bar">
          <input
            className="proctor-search-input"
            type="text"
            placeholder="Search username or quiz… (⌘K)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="proctor-filter-group">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`proctor-filter-chip ${statusFilter === opt ? 'active' : ''}`}
                onClick={() => setStatusFilter(opt)}
              >
                {opt === 'all' ? 'All' : opt}
              </button>
            ))}
          </div>
          <select
            className="proctor-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Keyboard Shortcuts Hint ── */}
      {lastRefreshed && sessions.length > 0 && (
        <div className="proctor-kbd-hints">
          <span><kbd>⌘K</kbd> Search</span>
          <span><kbd>R</kbd> Refresh</span>
          <span><kbd>E</kbd> Export</span>
          <span><kbd>Esc</kbd> Clear</span>
        </div>
      )}

      {/* ── Content ── */}
      {!lastRefreshed && !error ? (
        <div className="proctor-dashboard-loading">
          <div className="proctor-skeleton-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="proctor-skeleton-card">
                <div className="proctor-skeleton-bar" style={{ width: '60%', height: 14 }} />
                <div className="proctor-skeleton-bar" style={{ width: '80%', height: 10 }} />
                <div className="proctor-skeleton-bar" style={{ width: '40%', height: 10 }} />
              </div>
            ))}
          </div>
          <p>Loading sessions…</p>
        </div>
      ) : error ? (
        <div className="proctor-dashboard-error">
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <h3>Failed to Load Sessions</h3>
          <p>{error}</p>
          <button className="proctor-btn proctor-btn-skip" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="proctor-dashboard-empty">
          No proctoring sessions found. Sessions are created when students take proctored quizzes.
        </div>
      ) : (
        <div className="proctor-dashboard-content">
          {/* ── Session List ── */}
          <div className="proctor-dashboard-list">
            {filteredSessions.length === 0 ? (
              <div className="proctor-dashboard-empty" style={{ padding: '20px' }}>
                No sessions match your filters.
              </div>
            ) : (
              filteredSessions.map(s => (
                <SessionCard
                  key={s._id}
                  s={s}
                  isSelected={selected === s._id}
                  eventCount={eventCounts[s._id] || 0}
                  onClick={() => handleSelect(s._id)}
                />
              ))
            )}
          </div>

          {/* ── Detail Panel ── */}
          {detail?.session && (
            <div className="proctor-dashboard-detail">
              {hasHighSeverity && (
                <div className="proctor-detail-warning-banner">
                  <span>⚠️</span>
                  <span>High-severity anomalies detected — review required</span>
                </div>
              )}

              <div className="proctor-detail-header-row">
                <h3>{detail.session.quizType} — {detail.session.username}</h3>
                <button
                  className="proctor-btn proctor-btn-skip proctor-export-btn"
                  onClick={exportSession}
                  title="Export session as JSON"
                >
                  ↓ Export
                </button>
              </div>

              <div className="proctor-detail-stats">
                <div className="proctor-detail-stat">
                  <span className="proctor-detail-stat-label">Started</span>
                  <span>{formatDateTime(detail.session.startedAt)}</span>
                </div>
                <div className="proctor-detail-stat">
                  <span className="proctor-detail-stat-label">Ended</span>
                  <span>{detail.session.endedAt ? formatDateTime(detail.session.endedAt) : '—'}</span>
                </div>
                <div className="proctor-detail-stat">
                  <span className="proctor-detail-stat-label">Total Penalty</span>
                  <span className={detail.session.totalPenalty >= 10 ? 'proctor-penalty-high' : ''}>
                    {detail.session.totalPenalty}
                  </span>
                </div>
                <div className="proctor-detail-stat">
                  <span className="proctor-detail-stat-label">Status</span>
                  <span className={`proctor-session-status status-${detail.session.status}`}>
                    {detail.session.status}
                  </span>
                </div>
              </div>

              <SeverityBar events={detail.events} />

              {detail.events && detail.events.length > 0 ? (
                <div className="proctor-anomaly-cards">
                  <div className="proctor-anomaly-cards-header">
                    <h4>Anomaly Evidence</h4>
                    <span>{filteredEvents.length}{eventTypeFilter !== 'all' || severityFilter !== 'all' ? ` of ${detail.events.length}` : ''} events</span>
                  </div>

                  {/* ── Event Filters ── */}
                  <div className="proctor-event-filters">
                    <select
                      className="proctor-event-filter-select"
                      value={eventTypeFilter}
                      onChange={e => setEventTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {availableEventTypes.map(t => (
                        <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
                      ))}
                    </select>
                    <div className="proctor-severity-filter-group">
                      <button
                        className={`proctor-filter-chip sm ${severityFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setSeverityFilter('all')}
                      >All</button>
                      <button
                        className={`proctor-filter-chip sm ${severityFilter === '1' ? 'active' : ''}`}
                        onClick={() => setSeverityFilter('1')}
                      >Low</button>
                      <button
                        className={`proctor-filter-chip sm ${severityFilter === '2' ? 'active' : ''}`}
                        onClick={() => setSeverityFilter('2')}
                      >Med</button>
                      <button
                        className={`proctor-filter-chip sm ${severityFilter === '3' ? 'active' : ''}`}
                        onClick={() => setSeverityFilter('3')}
                      >High</button>
                    </div>
                  </div>

                  {filteredEvents.map((ev) => (
                    <AnomalyCard
                      key={ev._id || ev.timestamp}
                      ev={ev}
                      onScreenshot={setScreenshotModal}
                      isExpanded={!!expandedCards[ev._id || ev.timestamp]}
                      onToggle={() => toggleExpand(ev._id || ev.timestamp)}
                    />
                  ))}
                </div>
              ) : (
                <p className="proctor-dashboard-no-events">No events recorded — clean session.</p>
              )}
            </div>
          )}
        </div>
      )}

      {screenshotModal && (
        <ScreenshotModal src={screenshotModal} onClose={() => setScreenshotModal(null)} />
      )}
    </div>
  )
}

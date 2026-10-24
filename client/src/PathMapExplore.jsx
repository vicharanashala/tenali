/**
 * PathMapExplore.jsx — the "Explore" view of the Learning Path (PathMap).
 *
 * PathMap's Goal view answers "how do I get to X?". This view answers the
 * question before it: "what is there, and how does it all connect?". It
 * draws every topic from the same graph PathMap uses (graph/graph-data.json,
 * loaded by pathMapHelpers), laid out by prerequisite depth, so everything
 * reads left to right from Basic Arithmetic.
 *
 * - Hover or select a topic: its prerequisite chain lights up gold, what it
 *   leads to lights up blue, everything else dims.
 * - Click, tap or press Enter on a topic to open its card (big idea, what to
 *   learn first, what it leads to, Practise / Make this my goal). Selecting
 *   rather than jumping straight in is what makes the map work on touch
 *   screens, which have no hover. Double-click still practises on desktop.
 * - "Make this my goal" sets PathMap's own goal and hands back to the Goal
 *   view, so there is one goal and one path, not two.
 * - Search, zoom, fit-to-screen and drag-to-pan.
 *
 * Progress: signed in, topics are coloured by GET /api/mastery (what the
 * student has actually proven). Signed out, or if that read fails, it uses
 * what PathMap already counts as done (topics marked known, plus PathMap's
 * own answer streaks), and says so, rather than showing zero progress.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { pmCatColor } from './pathMapHelpers';
import {
  NODE_W,
  NODE_H,
  labelOf,
  catOf,
  prereqsOf,
  unlocksOf,
  allPrerequisites,
  allUnlocks,
  buildLayout,
  completedTopics,
} from './lib/pathMapExplore';
import { fetchMasterySet, isMockMasteryActive, logEvent } from './lib/masteryClient';
import topicMotivation from './data/topicMotivation.json';
import './PathMapExplore.css';

const CAT_NAMES = { arith: 'Arithmetic', numth: 'Number Theory', alg: 'Algebra', geom: 'Geometry', calc: 'Calculus', stats: 'Stats & Prob', vecmat: 'Vectors & Matrices' };

const ROOT_ID = 'basicarith';
const TOUR_SEEN_KEY = 'tenali-graph-tour-seen';
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.6;
const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
const emojiOf = (id) => topicMotivation[id]?.emoji || '';
// On phones the topic card is a bottom sheet of up to 55% of the screen
// (see .lm-card in the CSS); this is how much of the map stays visible
// above it, in viewport pixels.
const SHEET_SHARE = 0.55;
const phoneFreeHeight = (el) => Math.max(90, window.innerHeight * (1 - SHEET_SHARE) - el.getBoundingClientRect().top);

export default function PathMapExplore({ known, goalId, onSetGoal, onShowGoalView, onPractise, onBack }) {
  const layout = useMemo(() => buildLayout(), []);
  const [hovered, setHovered] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  // Phones start zoomed out so more than two columns fit on screen.
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 0.72 : 1));
  const [query, setQuery] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [ready, setReady] = useState(false);
  const viewportRef = useRef(null);
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  // Centre the viewport on a node, at the current zoom. With the topic card
  // open, centre it in the space the card leaves free: left of the card on
  // wide screens, above the bottom sheet on phones.
  const scrollToNode = (id, { behavior = 'smooth', forCard = false } = {}) => {
    const el = viewportRef.current;
    const p = layout.pos[id];
    if (!el || !p) return;
    const z = zoomRef.current;
    const wide = el.clientWidth > 640;
    const freeW = forCard && wide ? el.clientWidth - 400 : el.clientWidth;
    const freeH = forCard && !wide ? phoneFreeHeight(el) : el.clientHeight;
    el.scrollTo({
      left: Math.max(0, (p.x + NODE_W / 2) * z - freeW / 2),
      top: Math.max(0, (p.y + NODE_H / 2) * z - freeH / 2),
      behavior,
    });
  };

  // Open where every path begins (Basic Arithmetic), or on the current goal.
  useEffect(() => {
    const el = viewportRef.current;
    const p = layout.pos[goalId] || layout.pos[ROOT_ID];
    if (!el || !p) return;
    el.scrollTo({ left: Math.max(0, (p.x + NODE_W / 2) * zoomRef.current - el.clientWidth / 2), top: Math.max(0, (p.y + NODE_H / 2) * zoomRef.current - el.clientHeight / 2) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Progress ─────────────────────────────────────────────────────────
  // 'loading' | 'server' | 'signedOut' | 'error'
  const [masterySource, setMasterySource] = useState('loading');
  const [serverMastery, setServerMastery] = useState(null);
  const [masteryAttempt, setMasteryAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchMasterySet()
      .then((set) => {
        if (cancelled) return;
        setServerMastery(set);
        setMasterySource(set ? 'server' : 'signedOut');
      })
      .catch(() => {
        if (cancelled) return;
        setServerMastery(null);
        setMasterySource('error');
      });
    return () => { cancelled = true; };
  }, [masteryAttempt]);
  // Logging in or out from the global menu while the map is open.
  useEffect(() => {
    const refetch = () => setMasteryAttempt((n) => n + 1);
    window.addEventListener('tenali-auth-change', refetch);
    return () => window.removeEventListener('tenali-auth-change', refetch);
  }, []);

  const done = useMemo(
    () => (masterySource === 'loading' ? null : completedTopics({ serverMastery, known, ids: layout.ids })),
    [masterySource, serverMastery, known, layout]
  );

  // First-visit nudge: point new students at the one topic everything else
  // traces back to, instead of dropping them into 60+ choices.
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (goalId) return;
    try {
      if (window.localStorage.getItem(TOUR_SEEN_KEY)) return;
    } catch { /* localStorage unavailable: just skip the nudge */ }
    const t = window.setTimeout(() => {
      setShowTour(true);
      scrollToNode(ROOT_ID);
    }, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dismissTour = () => {
    setShowTour(false);
    try { window.localStorage.setItem(TOUR_SEEN_KEY, '1'); } catch { /* non-fatal */ }
  };

  // Hover previews; otherwise the selected topic's connections stay lit.
  const traceId = hovered || selectedId;
  const { ancestors, descendants } = useMemo(() => {
    if (!traceId) return { ancestors: new Set(), descendants: new Set() };
    return { ancestors: allPrerequisites(traceId), descendants: allUnlocks(traceId) };
  }, [traceId]);

  const nodeState = (id) => {
    if (!done) return 'unknown';
    if (done.has(id)) return 'mastered';
    const prereqs = prereqsOf(id);
    if (prereqs.length === 0 || prereqs.every((p) => done.has(p))) return 'ready';
    return 'building';
  };

  // Second line on each node. Without progress it still says something
  // true about the topic itself.
  const nodeCaption = (id, state) => {
    if (id === goalId) return '🎯 Your goal';
    const prereqs = prereqsOf(id);
    if (state === 'mastered') return '✓ Done';
    if (state === 'ready') return prereqs.length === 0 ? 'Ready · a starting point' : 'Ready to start';
    if (state === 'building') {
      const missing = prereqs.filter((p) => !done.has(p)).length;
      return `Needs ${missing} more first`;
    }
    return prereqs.length === 0 ? 'A starting point' : `Builds on ${prereqs.length}`;
  };

  const doneCount = done ? layout.ids.filter((id) => done.has(id)).length : 0;
  const totalCount = layout.ids.length;
  const donePct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const isDimmed = (id) => !!traceId && traceId !== id && !ancestors.has(id) && !descendants.has(id);
  const isDimmedEdge = (e) => {
    if (!traceId) return false;
    if (e.tgt === traceId || e.src === traceId) return false;
    const inAncestorChain = ancestors.has(e.src) && ancestors.has(e.tgt);
    const inDescChain = descendants.has(e.src) && descendants.has(e.tgt);
    return !inAncestorChain && !inDescChain;
  };
  const edgeKind = (e) => {
    if (e.tgt === traceId || (ancestors.has(e.src) && (ancestors.has(e.tgt) || e.tgt === traceId))) return 'ancestor';
    if (e.src === traceId || (descendants.has(e.tgt) && (descendants.has(e.src) || e.src === traceId))) return 'descendant';
    return 'plain';
  };

  const select = (id, { scroll = false } = {}) => {
    if (showTour) dismissTour();
    setSelectedId(id);
    if (!id) return;
    logEvent('explore_node_clicked', id, { state: nodeState(id), source: masterySource });
    // Also slide the map if the topic would end up under the card.
    const el = viewportRef.current;
    const pos = layout.pos[id];
    let hidden = false;
    if (el && pos) {
      const z = zoomRef.current;
      const wide = el.clientWidth > 640;
      const right = (pos.x + NODE_W) * z - el.scrollLeft;
      const bottom = (pos.y + NODE_H) * z - el.scrollTop;
      hidden = wide ? right > el.clientWidth - 400 : bottom > phoneFreeHeight(el);
    }
    if (scroll || hidden) scrollToNode(id, { forCard: true });
  };
  const practise = (id) => {
    logEvent('explore_practise_clicked', id);
    onPractise(id);
  };
  const makeGoal = (id) => {
    logEvent('explore_goal_set', id, { alreadyDone: done ? done.has(id) : false });
    onSetGoal(id);
    onShowGoalView();
  };

  // Search: label match, starts-with first.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return layout.ids
      .map((id) => ({ id, label: labelOf(id), at: labelOf(id).toLowerCase().indexOf(q) }))
      .filter((m) => m.at >= 0)
      .sort((a, b) => (a.at === 0 ? 0 : 1) - (b.at === 0 ? 0 : 1) || a.label.localeCompare(b.label))
      .slice(0, 6);
  }, [query, layout]);
  const pickSearch = (id) => {
    setQuery('');
    select(id, { scroll: true });
  };

  const fitToScreen = () => {
    const el = viewportRef.current;
    if (!el) return;
    setZoom(clampZoom(Math.min((el.clientWidth - 16) / layout.width, (el.clientHeight - 16) / layout.height)));
    el.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  };

  // Drag the empty background to pan, with a mouse. Touch screens already
  // pan by scrolling.
  const dragRef = useRef(null);
  const onViewportPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('.learning-map-node')) return;
    const el = viewportRef.current;
    dragRef.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
    el.classList.add('is-panning');
  };
  const onViewportPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    viewportRef.current.scrollLeft = d.left - dx;
    viewportRef.current.scrollTop = d.top - dy;
  };
  const endPan = () => {
    const d = dragRef.current;
    dragRef.current = null;
    viewportRef.current?.classList.remove('is-panning');
    // A click on empty background (not a drag) clears the selection.
    if (d && !d.moved) setSelectedId(null);
  };

  // Esc closes the card (or the hover trace).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setSelectedId(null);
      setHovered(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selected = selectedId ? {
    id: selectedId,
    state: nodeState(selectedId),
    prereqs: prereqsOf(selectedId),
    unlocks: unlocksOf(selectedId),
    motivation: topicMotivation[selectedId] || null,
  } : null;
  const stateLine = (id, state) => {
    const n = prereqsOf(id).length;
    if (state === 'mastered') return masterySource === 'server' ? '✓ You have mastered this' : '✓ You marked this as done';
    if (state === 'ready') return n === 0 ? 'Ready: a great place to start' : 'Ready: you know everything it needs';
    if (state === 'building') {
      const missing = prereqsOf(id).filter((p) => !done.has(p)).length;
      return `Learn ${missing} more topic${missing === 1 ? '' : 's'} first`;
    }
    return n === 0 ? 'A starting point' : `Builds on ${n} topic${n === 1 ? '' : 's'}`;
  };

  const edgePath = (e) => {
    const a = layout.pos[e.src];
    const b = layout.pos[e.tgt];
    const x1 = a.x + NODE_W;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x;
    const y2 = b.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  const chip = (id, kind) => {
    const isDone = done ? done.has(id) : false;
    return (
      <button
        key={id}
        type="button"
        className={'lm-card-chip' + (isDone ? ' is-done' : '') + ` is-${kind}`}
        onClick={() => select(id, { scroll: true })}
      >
        <span aria-hidden="true">{emojiOf(id)}</span> {labelOf(id)}{isDone ? ' ✓' : ''}
      </button>
    );
  };

  return (
    <div className="learning-map-overlay">
      <div className="learning-map-shell">
        <div className="learning-map-header">
          <button className="learning-map-back" onClick={onBack}>← Learning Path</button>
          <div className="learning-map-title-block">
            <h2>🗺️ Explore all topics</h2>
            <p>Tap a topic to see what it needs and what it leads to.</p>
          </div>

          <div className="lm-search" role="search">
            <input
              type="search"
              className="lm-search-input"
              placeholder="🔍 Find a topic…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches[0]) pickSearch(matches[0].id);
                if (e.key === 'Escape') setQuery('');
              }}
              aria-label="Find a topic on the map"
            />
            {query.trim() && (
              <ul className="lm-search-results">
                {matches.length === 0 && <li className="lm-search-empty">No topic called “{query.trim()}”</li>}
                {matches.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => pickSearch(m.id)}>
                      <span aria-hidden="true">{emojiOf(m.id)}</span> {m.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="learning-map-header-stats">
            {done && (
              <div className="learning-map-progress-stat" title={`${doneCount} of ${totalCount} topics done`}>
                <div className="learning-map-progress-bar">
                  <div className="learning-map-progress-fill" style={{ width: `${donePct}%` }} />
                </div>
                <span>{doneCount}/{totalCount} {masterySource === 'server' ? 'mastered' : 'marked done'}</span>
              </div>
            )}
            {masterySource === 'signedOut' && (
              <span className="learning-map-load-error" role="status">Showing topics you marked as known. Sign in to use your real progress.</span>
            )}
            {masterySource === 'error' && (
              <span className="learning-map-load-error" role="status">
                Couldn't load your progress, so this shows topics you marked as known.
                <button type="button" onClick={() => { setMasterySource('loading'); setMasteryAttempt((n) => n + 1); }}>Retry</button>
              </span>
            )}
            {isMockMasteryActive() && <span className="dev-mock-badge" title="Mastery data is mocked via ?mockMastery= for local review, not real">🧪 mock</span>}
            <div className="learning-map-zoom" role="group" aria-label="Zoom">
              <button type="button" onClick={() => setZoom((z) => clampZoom(z - 0.15))} aria-label="Zoom out">−</button>
              <button type="button" onClick={fitToScreen} title="Fit the whole map on screen">Fit</button>
              <button type="button" onClick={() => setZoom((z) => clampZoom(z + 0.15))} aria-label="Zoom in">+</button>
            </div>
            <button
              type="button"
              className="lm-key-toggle"
              aria-expanded={showKey}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? 'Hide key' : 'Key'}
            </button>
          </div>
        </div>

        <div className={'lm-key-panel' + (showKey ? ' is-open' : '')}>
          <div className="learning-map-legend">
            {Object.keys(CAT_NAMES).map((cat) => (
              <span key={cat} className="learning-map-legend-item">
                <span className="learning-map-legend-dot" style={{ background: pmCatColor[cat] }} />
                {CAT_NAMES[cat]}
              </span>
            ))}
            <span className="learning-map-legend-item"><span className="learning-map-legend-glow" /> Done</span>
            <span className="learning-map-legend-item"><span className="lm-legend-dashed" /> Needs more first</span>
          </div>
        </div>

        <div
          className="learning-map-viewport"
          ref={viewportRef}
          onPointerDown={onViewportPointerDown}
          onPointerMove={onViewportPointerMove}
          onPointerUp={endPan}
          onPointerLeave={() => { if (dragRef.current) { dragRef.current.moved = true; endPan(); } }}
        >
          <div
            className="learning-map-canvas"
            style={{ width: layout.width * zoom, height: layout.height * zoom }}
          >
            <svg
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              role="group"
              aria-label="Map of maths topics"
            >
              <g className="learning-map-edges">
                {layout.edges.map((e) => {
                  const kind = edgeKind(e);
                  const delayCol = Math.max(layout.pos[e.src].depth, layout.pos[e.tgt].depth);
                  return (
                    <path
                      key={`${e.src}>${e.tgt}`}
                      d={edgePath(e)}
                      className={
                        'learning-map-edge' +
                        (kind !== 'plain' ? ' is-' + kind : '') +
                        (isDimmedEdge(e) ? ' is-dimmed' : '') +
                        (ready ? ' is-drawn' : '')
                      }
                      style={{ '--edge-delay': `${300 + delayCol * 140}ms` }}
                    />
                  );
                })}
              </g>

              <g className="learning-map-nodes">
                {layout.ids.map((id) => {
                  const p = layout.pos[id];
                  const state = nodeState(id);
                  const caption = nodeCaption(id, state);
                  return (
                    // Outer <g> holds ONLY the layout position. SVG's `transform`
                    // attribute and a CSS `transform` (from the entrance animation)
                    // don't compose (CSS silently wins), so the animated transform
                    // lives on a nested inner <g> instead.
                    <g key={id} transform={`translate(${p.x}, ${p.y})`}>
                      <g
                        className={
                          'learning-map-node' +
                          ` is-${state}` +
                          (isDimmed(id) ? ' is-dimmed' : '') +
                          (hovered === id ? ' is-hovered' : '') +
                          (selectedId === id ? ' is-selected' : '') +
                          (ready ? ' is-in' : '') +
                          (id === goalId ? ' is-goal-node' : '') +
                          (showTour && id === ROOT_ID ? ' is-tour-target' : '')
                        }
                        style={{ '--node-delay': `${p.depth * 110}ms`, '--cat-color': pmCatColor[catOf(id)] }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${labelOf(id)}. ${caption}. Press Enter for details.`}
                        aria-pressed={selectedId === id}
                        onMouseEnter={() => setHovered(id)}
                        onMouseLeave={() => setHovered((h) => (h === id ? null : h))}
                        onClick={() => select(id)}
                        onDoubleClick={() => practise(id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); }
                        }}
                      >
                        <rect width={NODE_W} height={NODE_H} rx="12" className="learning-map-node-rect" />
                        <text x="12" y="27" className="learning-map-node-emoji" fontFamily={EMOJI_FONT}>{emojiOf(id)}</text>
                        <text x="38" y="25" className="learning-map-node-label">{labelOf(id)}</text>
                        <text x="38" y="42" className="learning-map-node-sub">{caption}</text>
                        {state === 'mastered' && (
                          <g className="learning-map-node-badge" transform={`translate(${NODE_W - 4}, 4)`}>
                            <circle r="9" />
                            <text y="3.5" textAnchor="middle">✓</text>
                          </g>
                        )}
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {showTour && !selected && (
          <div className="learning-map-tour-nudge">
            <p>👋 New here? Every path starts at <strong>Basic Arithmetic</strong>, glowing on the left. Tap it to see where it leads!</p>
            <button className="learning-map-tour-dismiss" onClick={dismissTour}>Got it →</button>
          </div>
        )}

        {selected && (
          <aside key={selected.id} className={`lm-card is-${selected.state}`} aria-label={`${labelOf(selected.id)} details`}>
            <button type="button" className="lm-card-close" onClick={() => setSelectedId(null)} aria-label="Close">✕</button>
            <div className="lm-card-head">
              <span className="lm-card-emoji" aria-hidden="true">{emojiOf(selected.id)}</span>
              <div>
                <p className="lm-card-cat" style={{ color: pmCatColor[catOf(selected.id)] }}>{CAT_NAMES[catOf(selected.id)]}</p>
                <h3 className="lm-card-title">{labelOf(selected.id)}</h3>
              </div>
            </div>
            <p className={`lm-card-state is-${selected.state}`}>{stateLine(selected.id, selected.state)}</p>
            {selected.motivation?.bigIdea && <p className="lm-card-idea">{selected.motivation.bigIdea}</p>}

            {selected.prereqs.length > 0 && (
              <div className="lm-card-row">
                <span className="lm-card-row-label">🧱 Learn these first</span>
                <div className="lm-card-chips">{selected.prereqs.map((id) => chip(id, 'before'))}</div>
              </div>
            )}
            {selected.unlocks.length > 0 && (
              <div className="lm-card-row">
                <span className="lm-card-row-label">🔓 Leads to</span>
                <div className="lm-card-chips">{selected.unlocks.map((id) => chip(id, 'after'))}</div>
              </div>
            )}

            <div className="lm-card-actions">
              <button type="button" className="lm-card-btn is-primary" onClick={() => practise(selected.id)}>
                ▶ Practise now
              </button>
              {goalId === selected.id ? (
                <button type="button" className="lm-card-btn" onClick={onShowGoalView}>🎯 See my path</button>
              ) : (
                <button type="button" className="lm-card-btn" onClick={() => makeGoal(selected.id)}>🎯 Make this my goal</button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

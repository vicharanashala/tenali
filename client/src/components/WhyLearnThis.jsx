/**
 * WhyLearnThis.jsx — optional, skippable "why does this topic matter" link
 * for the quiz setup screen.
 *
 * Renders a small toggle link ("Why learn this?"). Clicking it expands a
 * panel written for a young reader, in this order:
 *   1. An emoji and a one-line big idea, then a short "why" with an
 *      everyday example (../data/topicMotivation.json, keyed by topic id).
 *   2. "You use it for…": three picture cards from everyday life.
 *   3. "Try it!": the topic's slider demo, shown straight away, because
 *      moving a number and watching what happens persuades a child far
 *      better than another sentence.
 *   4. "How does it work?": the mechanism as numbered steps, revealed one
 *      at a time.
 *   5. "Learn these first" / "Leads to": the topic's direct prerequisites
 *      (ticked if mastered) and what it unlocks (with a live "n/m ready"
 *      count), from the prerequisite graph and GET /api/mastery, the same
 *      signal the Learning Journey uses.
 *
 * Chips are clickable and jump straight into that topic's quiz. By default
 * they switch mode through the app-level `tenali-change-mode` event; pass
 * `onNavigate` to override, or `onNavigate={null}` for plain labels.
 *
 * Mastery is fetched lazily, only once the panel is actually opened —
 * this component lives on 63 quiz screens, most never opened in a given
 * session, so there's no reason to fire a fetch on every mount.
 *
 * Never blocks the Start button. A topic with no `why` entry renders
 * nothing at all — same fail-safe behavior as KeyTerms.jsx.
 */

import { useState, useEffect } from 'react'
import topicMotivation from '../data/topicMotivation.json'
import { getPrerequisites, getUnlocks, getTopicLabel } from '../lib/prerequisiteGraph'
import { fetchMasterySet, unlockReadiness, isMockMasteryActive, logEvent } from '../lib/masteryClient'
import WhyDemo from '../lib/whyDemos.jsx'

const MAX_CHIPS = 5

function PrereqChips({ ids, mastered, onNavigate }) {
  if (!ids || ids.length === 0) return null
  const shown = ids.slice(0, MAX_CHIPS)
  const overflow = ids.length - shown.length
  return (
    <div className="why-panel-chip-row">
      <span className="why-panel-chip-label"><span aria-hidden="true">🧱</span> Learn these first</span>
      <div className="why-panel-chips">
        {shown.map(id => {
          const isMastered = mastered && mastered.has(id)
          const label = (isMastered ? '✓ ' : '') + getTopicLabel(id)
          return onNavigate ? (
            <button
              key={id}
              type="button"
              className={'why-chip why-chip-clickable' + (isMastered ? ' why-chip-mastered' : '')}
              onClick={() => { logEvent('prereq_chip_clicked', id, { mastered: !!isMastered }); onNavigate(id) }}
              title={isMastered ? `Already mastered` : `Go to ${getTopicLabel(id)}`}
            >
              {label}
            </button>
          ) : (
            <span key={id} className={'why-chip' + (isMastered ? ' why-chip-mastered' : '')}>{label}</span>
          )
        })}
        {overflow > 0 && <span className="why-chip why-chip-more">+{overflow} more</span>}
      </div>
    </div>
  )
}

function UnlockChips({ ids, mastered, onNavigate }) {
  if (!ids || ids.length === 0) return null
  const targets = ids
    .map(id => ({ id, label: getTopicLabel(id), ...unlockReadiness(id, mastered) }))
    .sort((a, b) => (b.ready / b.total) - (a.ready / a.total))
  const shown = targets.slice(0, MAX_CHIPS)
  const overflow = targets.length - shown.length
  return (
    <div className="why-panel-chip-row">
      <span className="why-panel-chip-label"><span aria-hidden="true">🔓</span> Leads to</span>
      <div className="why-panel-chips">
        {shown.map(t => {
          const ready = mastered ? ` · ${t.ready}/${t.total} ready` : ''
          return onNavigate ? (
            <button
              key={t.id}
              type="button"
              className={'why-chip why-chip-clickable' + (t.ready >= t.total && mastered ? ' why-chip-mastered' : '')}
              onClick={() => { logEvent('unlock_chip_clicked', t.id, { ready: t.ready, total: t.total }); onNavigate(t.id) }}
              title={`Go to ${t.label}`}
            >
              {t.label}{ready}
            </button>
          ) : (
            <span key={t.id} className="why-chip">{t.label}{ready}</span>
          )
        })}
        {overflow > 0 && <span className="why-chip why-chip-more">+{overflow} more</span>}
      </div>
    </div>
  )
}

/** "You use it for…": three everyday places this topic turns up. */
function UsesRow({ uses }) {
  if (!Array.isArray(uses) || uses.length === 0) return null
  return (
    <div className="why-uses">
      <span className="why-section-label">You use it for…</span>
      <ul className="why-uses-list">
        {uses.map((u, i) => (
          <li key={u.text} className="why-use-card" style={{ '--i': i }}>
            <span className="why-use-icon" aria-hidden="true">{u.icon}</span>
            <span className="why-use-text">{u.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * "How does it work?": the mechanism as numbered steps. Collapsed at
 * first, then one step at a time, so a young reader gets one idea per
 * tap instead of a paragraph.
 */
function HowSteps({ topicId, steps }) {
  const [shown, setShown] = useState(0) // 0 = collapsed
  if (!Array.isArray(steps) || steps.length === 0) return null
  const open = shown > 0
  const allShown = shown >= steps.length

  return (
    <div className="why-how">
      <button
        type="button"
        className={'why-how-toggle' + (open ? ' is-open' : '')}
        aria-expanded={open}
        onClick={() => {
          setShown(open ? 0 : 1)
          if (!open) logEvent('why_deeper_opened', topicId, { steps: steps.length })
        }}
      >
        <span aria-hidden="true">🔍</span> How does it work?
        <span className="why-link-caret" aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <>
          <ol className="why-steps">
            {steps.slice(0, shown).map((step, i) => (
              <li key={i} className="why-step">
                <span className="why-step-num" aria-hidden="true">{i + 1}</span>
                <span className="why-step-text">{step}</span>
              </li>
            ))}
          </ol>
          {allShown ? (
            <p className="why-steps-done"><span aria-hidden="true">🎉</span> That's the whole trick!</p>
          ) : (
            <button type="button" className="why-step-next" onClick={() => setShown((n) => n + 1)}>
              Next step <span aria-hidden="true">→</span>
              <span className="why-step-count">{shown}/{steps.length}</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}

// Quiz screens are rendered deep inside <App> and have no handle on its
// setMode, so by default chips go through the app-level mode-change event
// (the same one ContrastChallengeApp uses). A screen can still pass its own.
function changeMode(topicId) {
  window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: topicId }))
}

export default function WhyLearnThis({ topicId, onNavigate = changeMode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mastered, setMastered] = useState(null) // null = not loaded or unavailable

  useEffect(() => {
    if (!isOpen || mastered !== null) return
    let cancelled = false
    // On failure `mastered` stays null, so chips render without ticks or
    // "n/m ready" counts rather than claiming nothing is mastered.
    fetchMasterySet()
      .then((set) => { if (!cancelled) setMastered(set) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [isOpen, mastered])

  // Every bail-out below has to sit *after* the hooks above — the data read
  // can return null, and doing that before useEffect changes hook order
  // between renders.
  let why = null
  let entry = null
  let demoKind = null
  let readFailed = false
  try {
    if (topicId && typeof topicId === 'string' && topicMotivation && typeof topicMotivation === 'object') {
      entry = topicMotivation[topicId] || null
      why = entry?.why || null
      demoKind = entry?.demo?.kind || null
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('WhyLearnThis: failed to read data, hiding.', err)
    }
    readFailed = true
  }
  if (readFailed) return null

  if (!why) return null

  let prereqIds = []
  let unlockIds = []
  try {
    prereqIds = getPrerequisites(topicId)
    unlockIds = getUnlocks(topicId)
  } catch { /* graph lookup is best-effort; panel still works with just `why` */ }

  const panelId = `why-learn-this-panel-${topicId}`

  return (
    <div className="why-learn-this">
      <button
        type="button"
        className="why-link"
        onClick={() => {
          const next = !isOpen
          setIsOpen(next)
          if (next) logEvent('why_panel_opened', topicId)
        }}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="why-link-bulb" aria-hidden="true">💡</span> Why learn this?
        <span className="why-link-caret" aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
        {isOpen && isMockMasteryActive() && <span className="dev-mock-badge" style={{ marginLeft: 8 }}>🧪 mock</span>}
      </button>
      {isOpen && (
        <div id={panelId} className="why-panel" role="region" aria-live="polite">
          {entry.bigIdea && (
            <div className="why-hero">
              {entry.emoji && <span className="why-hero-emoji" aria-hidden="true">{entry.emoji}</span>}
              <p className="why-hero-idea">{entry.bigIdea}</p>
            </div>
          )}
          <p className="why-panel-text">{why}</p>
          <UsesRow uses={entry.uses} />
          {demoKind && (
            <div className="why-try">
              <span className="why-section-label"><span aria-hidden="true">🎮</span> Try it!</span>
              <WhyDemo kind={demoKind} />
            </div>
          )}
          <HowSteps topicId={topicId} steps={entry.steps} />
          <PrereqChips ids={prereqIds} mastered={mastered} onNavigate={onNavigate} />
          <UnlockChips ids={unlockIds} mastered={mastered} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  )
}

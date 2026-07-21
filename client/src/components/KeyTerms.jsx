/**
 * KeyTerms.jsx - "Word Explorer" split-panel mini dictionary for the topic
 * setup page.
 *
 * Renders a small toggle button "Word Explorer (N)" that, when clicked,
 * expands a 2-column anchored panel below it:
 *   - LEFT:  vertical list of the curated glossary terms for the topic
 *            (each row is a navigation button).
 *   - RIGHT: the explanation viewer, showing for the selected word:
 *              1. Title
 *              2. In Simple Words  (child-friendly rewrite)
 *              3. Visual           (small inline SVG)
 *              4. Real-life Example
 *              5. Remember         (memory tip)
 *              6. Differs from     (when defined)
 *
 * Only ONE glossary system exists: KeyTerms reads from the same
 * `glossaryTerms.json` and `topicGlossaryMap.json` that the in-question
 * `<GlossaryText>` reads from. Definitions are never duplicated.
 *
 * Behaviour:
 *   - Click "Word Explorer" button   panel toggles open/closed
 *   - Panel opens                    first curated term auto-selected
 *   - Click a word on the left       right pane updates; panel stays open
 *   - Click the already-selected word no-op (stays selected)
 *   - Click outside the panel        panel closes
 *   - Press Escape                   panel closes
 *   - Window resize (mobile <-> desktop)  CSS Grid handles layout swap
 *
 * Edge cases:
 *   - Topic has no curated terms, or all terms are missing from the
 *     glossary, or the data files are malformed  the whole component
 *     returns `null` (no button rendered). Quizzes still work.
 *   - Selected term somehow has no simpleMeaning  falls back to
 *     `definition` so the right pane is never empty.
 *   - Missing visualId / realLifeExample / memoryTip / differentiates
 *     those sections are simply not rendered (clean gap, no placeholder).
 *
 * Internal component name and CSS classes are unchanged from earlier
 * versions of this feature.
 */

import { useState, useEffect, useRef } from 'react'
import topicGlossaryMap from '../data/topicGlossaryMap.json'
import glossaryTerms from '../data/glossaryTerms.json'
import GlossaryVisual from '../data/glossaryVisuals'

export default function KeyTerms({ topicKey }) {
  // -------------------------------------------------------------------
  // Data resolution - fail-safe try/catch around the entire read.
  // -------------------------------------------------------------------
  let validEntries = []
  try {
    if (
      topicKey && typeof topicKey === 'string' &&
      topicGlossaryMap && typeof topicGlossaryMap === 'object' &&
      Array.isArray(glossaryTerms)
    ) {
      const termKeys = topicGlossaryMap[topicKey] || []
      // Build a lowercase -> full-entry lookup once.
      const lookup = new Map()
      for (const e of glossaryTerms) {
        if (e && typeof e.term === 'string') {
          lookup.set(e.term.toLowerCase(), e)
        }
      }
      const seen = new Set()
      for (const key of termKeys) {
        if (!key || typeof key !== 'string') continue
        const entry = lookup.get(String(key).toLowerCase())
        if (!entry) continue
        const dedupeKey = entry.term && entry.term.toLowerCase()
        if (!dedupeKey || seen.has(dedupeKey)) continue
        seen.add(dedupeKey)
        validEntries.push(entry)
      }
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Word Explorer: failed to read data, hiding.', err)
    }
    return null
  }

  if (validEntries.length === 0) return null

  // -------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false)
  // selectedKey stores the canonical term name (e.g. "Midpoint") of the
  // currently selected word. null means "nothing selected yet" (only briefly,
  // before the auto-select effect runs on first open).
  const [selectedKey, setSelectedKey] = useState(null)
  const wrapperRef = useRef(null)

  // Auto-select the first curated term whenever the panel opens. Cleared
  // on close so we always reset to the default selection next time.
  useEffect(() => {
    if (isOpen) {
      setSelectedKey(validEntries[0].term)
    } else {
      setSelectedKey(null)
    }
    // We intentionally depend only on isOpen - switching word is the
    // user's action via the dedicated handler below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Outside-click closes panel (mirrors the GlossaryTooltip pattern).
  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  // Escape closes the panel.
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const handleToggle = () => setIsOpen(o => !o)

  const handleSelectWord = (term) => {
    // Idempotent: clicking the already-selected word is a no-op.
    setSelectedKey(prev => (prev === term ? prev : term))
  }

  // Resolves the selected entry by canonical term name. Falls back to the
  // first curated term so the right pane is never empty while the panel
  // is open (the auto-select effect guarantees this on every open, but
  // the fallback is defensive in case of unexpected state).
  const selectedEntry =
    validEntries.find(e => e.term === selectedKey) || validEntries[0]

  const panelId = `word-explorer-panel-${topicKey}`

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <div className="word-explorer" ref={wrapperRef}>
      <button
        type="button"
        className="word-explorer-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        Word Explorer ({validEntries.length})
        <span className="word-explorer-caret" aria-hidden="true">&#9662;</span>
      </button>
      {isOpen && (
        <div
          id={panelId}
          className="word-explorer-panel"
          role="region"
          aria-label={`Word explorer for ${validEntries.length} glossary words`}
        >
          <div className="word-explorer-list" role="listbox" aria-label="Glossary words">
            {validEntries.map(entry => {
              const isSelected = entry.term === selectedEntry.term
              return (
                <button
                  key={entry.term}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={
                    'word-explorer-item' + (isSelected ? ' is-selected' : '')
                  }
                  onClick={() => handleSelectWord(entry.term)}
                >
                  {entry.term}
                </button>
              )
            })}
          </div>
          <div className="word-explorer-reader" aria-live="polite">
            <h4 className="word-explorer-reader-term">{selectedEntry.term}</h4>

            <p className="word-explorer-reader-simple">
              {selectedEntry.simpleMeaning || selectedEntry.definition || 'Definition unavailable.'}
            </p>

            {selectedEntry.visualId ? (
              <div className="word-explorer-reader-visual" aria-hidden="true">
                <GlossaryVisual id={selectedEntry.visualId} />
              </div>
            ) : null}

            {selectedEntry.realLifeExample ? (
              <div className="word-explorer-reader-example">
                <span className="word-explorer-reader-icon" aria-hidden="true">Eg.</span>
                <span className="word-explorer-reader-body">{selectedEntry.realLifeExample}</span>
              </div>
            ) : null}

            {selectedEntry.memoryTip ? (
              <div className="word-explorer-reader-tip">
                <span className="word-explorer-reader-icon" aria-hidden="true">Tip.</span>
                <span className="word-explorer-reader-body">{selectedEntry.memoryTip}</span>
              </div>
            ) : null}

            {selectedEntry.differentiates && Object.keys(selectedEntry.differentiates).length > 0 ? (
              <div className="word-explorer-reader-difference">
                <div className="word-explorer-reader-section-label">Differs from</div>
                {Object.entries(selectedEntry.differentiates).map(([otherTerm, explanation]) => (
                  <div key={otherTerm} className="word-explorer-diff-row">
                    <span className="word-explorer-diff-term">{otherTerm}</span>
                    <span className="word-explorer-diff-body">{explanation}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

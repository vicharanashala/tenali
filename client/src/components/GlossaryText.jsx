/**
 * GlossaryText.jsx — Feature AQ: Tap-to-Define Word Glossary
 *
 * Exports:
 *   GlossaryText  — takes a plain-text question prompt and renders it with
 *                   recognized mathematical terms underlined and tappable.
 *
 * Internal:
 *   GlossaryTooltip — renders one underlined term + its inline definition popover.
 *
 * Design decisions:
 *   - Matching is built once at module load (outside components) for performance.
 *   - Longest-match-first prevents "prime" from matching inside "prime number".
 *   - Only the first occurrence of each base term is made interactive (no duplicates).
 *   - One popover open at a time — managed by a single openId state in GlossaryText.
 *   - Auto-dismiss after 6 seconds of being open.
 *   - Click outside closes; Escape key closes; tapping the same term toggles.
 *   - No hover — tap/click only (mobile-first, see Feature AQ spec Section 9).
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import rawTerms from '../data/glossaryTerms.json'

// ─── Build match map once at module load ────────────────────────────────────
// matchMap: lowercase form → { term (canonical), definition }
export const matchMap = {}

try {
  rawTerms.forEach(entry => {
    const canonical = entry.term.toLowerCase()
    matchMap[canonical] = { term: entry.term, definition: entry.definition }

    // Register every explicit alias
    ;(entry.aliases || []).forEach(alias => {
      matchMap[alias.toLowerCase()] = { term: entry.term, definition: entry.definition }
    })

    // Auto-register a simple trailing-s plural for single-word terms that don't
    // already end in 's' and whose plural isn't already in aliases.
    const words = canonical.split(/\s+/)
    if (words.length === 1 && !canonical.endsWith('s')) {
      const plural = canonical + 's'
      if (!matchMap[plural]) {
        matchMap[plural] = { term: entry.term, definition: entry.definition }
      }
    }
  })
} catch {
  // Fail safe — if JSON is malformed, matchMap stays empty and no highlighting occurs.
}

// Build a single regex from all known match strings, sorted longest-first
// so multi-word terms like "prime number" are matched before "prime" alone.
const glossaryRegex = (() => {
  const forms = Object.keys(matchMap).sort((a, b) => b.length - a.length)
  if (forms.length === 0) return null
  const escaped = forms.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
})()

// ─── GlossaryTooltip ────────────────────────────────────────────────────────
/**
 * Renders a single underlined interactive term and its inline popover.
 * @param {string} displayText  — the matched text as it appeared in the prompt
 * @param {string} term         — canonical term name (for popover title)
 * @param {string} definition   — plain-language definition string
 * @param {boolean} isOpen      — controlled open state from parent
 * @param {function} onToggle   — parent callback: () => void
 * @param {string} wrapperClassName — optional extra class on the outer wrapper
 *                                     (e.g. 'glossary-term-wrapper--above' to
 *                                     flip the popover above the term)
 */
export function GlossaryTooltip({ displayText, term, definition, isOpen, onToggle, wrapperClassName = '' }) {
  const wrapperRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        onToggle()
      }
    }
    // Small delay so the click that opened the popover doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen, onToggle])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onToggle() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onToggle])

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => onToggle(), 6000)
    return () => clearTimeout(timer)
  }, [isOpen, onToggle])

  return (
    <span ref={wrapperRef} className={`glossary-term-wrapper${wrapperClassName ? ' ' + wrapperClassName : ''}`}>
      <span
        className={`glossary-term${isOpen ? ' glossary-term--open' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`${displayText} — tap to see definition`}
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        {displayText}
        <span className="glossary-term-icon" aria-hidden="true"></span>
      </span>
      {isOpen && (
        <span className="glossary-popover" role="tooltip">
          <span className="glossary-popover-term">{term}</span>
          <span className="glossary-popover-def">{definition}</span>
        </span>
      )}
    </span>
  )
}

// ─── GlossaryText ───────────────────────────────────────────────────────────
/**
 * Public component. Renders a question prompt string with recognized glossary
 * terms highlighted as tappable spans.
 *
 * Usage:
 *   <GlossaryText text={question.question} />
 *
 * @param {string} text — the raw question prompt string to render
 */
export default function GlossaryText({ text }) {
  // Which unique id (index-based) currently has its popover open — null = none
  const [openId, setOpenId] = useState(null)

  // Reset open state when the question text changes (new question loaded)
  useEffect(() => { setOpenId(null) }, [text])

  const segments = useMemo(() => {
    if (!text || typeof text !== 'string' || !glossaryRegex) return null

    // Reset regex lastIndex before each use
    glossaryRegex.lastIndex = 0

    const result = []
    let lastIndex = 0
    let match
    // Track which base terms have already been made interactive (first occurrence only)
    const seen = new Set()

    while ((match = glossaryRegex.exec(text)) !== null) {
      const matchedText = match[0]
      const entry = matchMap[matchedText.toLowerCase()]
      if (!entry) continue

      // Text before this match
      if (match.index > lastIndex) {
        result.push({ type: 'text', value: text.slice(lastIndex, match.index) })
      }

      const baseKey = entry.term.toLowerCase()
      if (!seen.has(baseKey)) {
        seen.add(baseKey)
        result.push({
          type: 'term',
          id: result.length, // stable id for this instance
          displayText: matchedText,
          term: entry.term,
          definition: entry.definition,
        })
      } else {
        // Subsequent occurrences: plain text only
        result.push({ type: 'text', value: matchedText })
      }

      lastIndex = match.index + matchedText.length
    }

    // Remaining text after last match
    if (lastIndex < text.length) {
      result.push({ type: 'text', value: text.slice(lastIndex) })
    }

    return result
  }, [text])

  // If no glossary matches, render plain text as-is
  if (!segments || segments.every(s => s.type === 'text')) {
    return <>{text}</>
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') return seg.value || null
        return (
          <GlossaryTooltip
            key={`${seg.term}-${seg.id}`}
            displayText={seg.displayText}
            term={seg.term}
            definition={seg.definition}
            isOpen={openId === seg.id}
            onToggle={() => setOpenId(prev => prev === seg.id ? null : seg.id)}
          />
        )
      })}
    </>
  )
}

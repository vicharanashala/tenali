/**
 * studyMode.js — the single source of truth for Explore vs. Focus mode.
 *
 * Focus Mode exists for one situation: a student with an exam coming up who
 * opens Tenali to revise three topics and instead meets a map, a motivation
 * banner, a guided journey, a search bar and sixty puzzle cards. Everything
 * that's good for a browsing learner is noise for a revising one.
 *
 * So this is deliberately NOT a permission system. There's no lock, no
 * gate, no route bouncing, no confirmation to leave. A student turns it on
 * for themselves and turns it off the same way — the only thing it does is
 * take the distractions off the screen. Building enforcement here would
 * mean designing against the student, when the student is the one asking
 * for the help.
 *
 * Two things persist, both in localStorage, both independent:
 *   - the mode itself ('explore' | 'focus')
 *   - the chosen focus topics (an array of prerequisiteGraph topic ids)
 * Keeping the topic list around after leaving Focus Mode is intentional:
 * coming back mid-revision should resume, not re-ask.
 *
 * Cross-component sync uses a `tenali-study-mode-change` CustomEvent, the
 * same pattern already used by `tenali-auth-change` and
 * `tenali-mastery-celebration` — the toggle lives in the app shell but the
 * screens that react to it are several layers down, and they are not
 * connected by props.
 */

import { useCallback, useEffect, useState } from 'react'
import { getAllTopicKeys } from './prerequisiteGraph'

const MODE_KEY = 'tenali-study-mode'
const TOPICS_KEY = 'tenali-focus-topics'
const CHANGE_EVENT = 'tenali-study-mode-change'

export const EXPLORE = 'explore'
export const FOCUS = 'focus'

/** Current mode. Defaults to Explore — Focus is always an opt-in. */
export function getStudyMode() {
  try {
    return window.localStorage.getItem(MODE_KEY) === FOCUS ? FOCUS : EXPLORE
  } catch {
    // localStorage can throw in private mode / when quota'd. Explore is the
    // safe fallback: worst case a student sees the normal app.
    return EXPLORE
  }
}

const KNOWN_TOPICS = new Set(getAllTopicKeys())

/**
 * The topics being revised in Focus Mode, in the order they were picked.
 * The list lives in the student's browser, so it can outlive a topic being
 * renamed or removed; unknown ids and repeats are dropped rather than shown
 * as a card that opens a blank screen.
 */
export function getFocusTopics() {
  try {
    const raw = window.localStorage.getItem(TOPICS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((t) => typeof t === 'string' && KNOWN_TOPICS.has(t)))]
  } catch {
    return []
  }
}

function write(mode, topics) {
  try {
    window.localStorage.setItem(MODE_KEY, mode)
    if (topics) window.localStorage.setItem(TOPICS_KEY, JSON.stringify(topics))
  } catch {
    /* non-fatal — the mode just won't survive a reload */
  }
  // Dispatch regardless of whether the write landed, so the current page
  // still reflects the change even when storage is unavailable.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
    detail: { mode, topics: topics || getFocusTopics() },
  }))
}

export function setStudyMode(mode) {
  write(mode === FOCUS ? FOCUS : EXPLORE, null)
}

export function setFocusTopics(topics) {
  write(getStudyMode(), Array.isArray(topics) ? topics : [])
}

/** Enter Focus Mode, optionally setting the topic list in the same step. */
export function enterFocusMode(topics) {
  write(FOCUS, Array.isArray(topics) ? topics : null)
}

export function exitFocusMode() {
  // Topics are deliberately kept — see the file header.
  write(EXPLORE, null)
}

/**
 * Subscribe to mode + topic changes.
 *
 * Also listens to the native `storage` event so two tabs open on Tenali
 * stay consistent; `storage` only fires in *other* tabs, which is exactly
 * why the CustomEvent above is needed for the tab making the change.
 */
export function useStudyMode() {
  const [state, setState] = useState(() => ({
    mode: getStudyMode(),
    topics: getFocusTopics(),
  }))

  useEffect(() => {
    const sync = () => setState({ mode: getStudyMode(), topics: getFocusTopics() })
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const enter = useCallback((topics) => enterFocusMode(topics), [])
  const exit = useCallback(() => exitFocusMode(), [])
  const setTopics = useCallback((topics) => setFocusTopics(topics), [])

  return {
    studyMode: state.mode,
    focusTopics: state.topics,
    isFocus: state.mode === FOCUS,
    // True only once they're actually revising something — Focus Mode with
    // an empty topic list means "show the picker", not "show a blank page".
    isFocusActive: state.mode === FOCUS && state.topics.length > 0,
    enterFocusMode: enter,
    exitFocusMode: exit,
    setFocusTopics: setTopics,
  }
}

/**
 * Non-hook read for components that only need to know "should I render at
 * all" and don't want a subscription — e.g. WhyLearnThis, which mounts on
 * 63 quiz screens and is cheap to leave stale until the next navigation.
 */
export function isFocusModeActive() {
  return getStudyMode() === FOCUS && getFocusTopics().length > 0
}

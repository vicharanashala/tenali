/**
 * focusTimer.js — the Focus Mode study timer.
 *
 * A short timed session, then a short break: the rhythm most revision
 * advice recommends, and the thing a student switching on "Focus" most
 * likely wants next after hiding the distractions.
 *
 * State lives in localStorage so it survives moving between quiz screens
 * and reloads, and it stores an end time (not a countdown), so a closed tab
 * or a sleeping phone cannot make the timer drift:
 *
 *   { phase: 'focus' | 'break', endsAt: ms, minutes }   running
 *   { phase: 'focus-done' | 'break-done', minutes }       finished, waiting
 *   null                                                  idle
 *
 * Every screen showing the timer ticks on its own and calls completeIfDue;
 * that transition is idempotent, so two of them finishing at the same
 * moment still count one session.
 *
 * Changes are broadcast with a `tenali-focus-timer-change` CustomEvent,
 * the same pattern as studyMode.js.
 */

import { useCallback, useEffect, useState } from 'react'

const TIMER_KEY = 'tenali-focus-timer'
const SESSIONS_KEY = 'tenali-focus-sessions'
const CHANGE_EVENT = 'tenali-focus-timer-change'

export const FOCUS_LENGTHS = [15, 25, 40]
export const BREAK_MINUTES = 5

const RUNNING = new Set(['focus', 'break'])
const FINISHED = new Set(['focus-done', 'break-done'])

/* ── storage ─────────────────────────────────────────────────────────── */

export function readTimer() {
  try {
    const raw = window.localStorage.getItem(TIMER_KEY)
    if (!raw) return null
    const t = JSON.parse(raw)
    if (!t || typeof t !== 'object') return null
    if (RUNNING.has(t.phase) && Number.isFinite(t.endsAt) && Number.isFinite(t.minutes)) return t
    if (FINISHED.has(t.phase) && Number.isFinite(t.minutes)) return t
    return null
  } catch {
    return null
  }
}

function writeTimer(t) {
  try {
    if (t) window.localStorage.setItem(TIMER_KEY, JSON.stringify(t))
    else window.localStorage.removeItem(TIMER_KEY)
  } catch {
    /* storage unavailable: the timer just will not survive a reload */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: t }))
}

const dayKey = (now) => {
  const d = new Date(now)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** How many focus sessions were finished today (local time). */
export function sessionsToday(now = Date.now()) {
  try {
    const s = JSON.parse(window.localStorage.getItem(SESSIONS_KEY) || 'null')
    return s && s.day === dayKey(now) && Number.isFinite(s.count) ? s.count : 0
  } catch {
    return 0
  }
}

function addSession(now) {
  const count = sessionsToday(now) + 1
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify({ day: dayKey(now), count }))
  } catch { /* non-fatal */ }
  return count
}

/* ── actions ─────────────────────────────────────────────────────────── */

export function startFocus(minutes, now = Date.now()) {
  const m = FOCUS_LENGTHS.includes(minutes) ? minutes : 25
  writeTimer({ phase: 'focus', endsAt: now + m * 60000, minutes: m })
}

export function startBreak(now = Date.now()) {
  writeTimer({ phase: 'break', endsAt: now + BREAK_MINUTES * 60000, minutes: BREAK_MINUTES })
}

export function stopTimer() {
  writeTimer(null)
}

/** Milliseconds left on a running timer (0 when due or not running). */
export function remainingMs(t, now = Date.now()) {
  if (!t || !RUNNING.has(t.phase)) return 0
  return Math.max(0, t.endsAt - now)
}

/**
 * Move a running timer to its finished state once its time is up. Safe to
 * call from any number of places: it re-reads storage and only acts on a
 * timer that is still running and actually due.
 */
export function completeIfDue(now = Date.now()) {
  const t = readTimer()
  if (!t || !RUNNING.has(t.phase) || now < t.endsAt) return t
  const next = { phase: t.phase === 'focus' ? 'focus-done' : 'break-done', minutes: t.minutes }
  if (t.phase === 'focus') addSession(now)
  writeTimer(next)
  return next
}

/** "18:42" style countdown. */
export function formatClock(ms) {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ── hook ────────────────────────────────────────────────────────────── */

export function useFocusTimer() {
  const [timer, setTimer] = useState(readTimer)
  const [now, setNow] = useState(() => Date.now())
  const [today, setToday] = useState(() => sessionsToday())

  useEffect(() => {
    const sync = () => { setTimer(readTimer()); setToday(sessionsToday()); setNow(Date.now()) }
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const running = !!timer && RUNNING.has(timer.phase)
  useEffect(() => {
    if (!running) return undefined
    const tick = () => {
      const t = Date.now()
      setNow(t)
      completeIfDue(t)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [running])

  return {
    timer,
    running,
    remaining: remainingMs(timer, now),
    sessionsToday: today,
    startFocus: useCallback((m) => startFocus(m), []),
    startBreak: useCallback(() => startBreak(), []),
    stop: useCallback(() => stopTimer(), []),
  }
}

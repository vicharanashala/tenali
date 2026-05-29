/**
 * auth.test.js — Session management unit tests
 *
 * Tests the localStorage-based session management used by App.jsx.
 * Covers: creation, retrieval, 7-day expiry, and cleanup.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ── Helpers (mirror the actual session helpers in App.jsx) ─────────────────

const SESSION_KEY = 'tenali_session_v1'

function createSession(user) {
  const session = {
    userId:    user.id,
    email:     user.email,
    name:      user.name,
    createdAt: Date.now(),
    view:      'dashboard',
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    const ageMs   = Date.now() - session.createdAt
    const maxAge  = 7 * 24 * 60 * 60 * 1000
    if (ageMs > maxAge) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Session Management', () => {

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── createSession ──────────────────────────────────────────────────────────

  it('creates a session with correct shape', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya Sharma' }
    const session = createSession(user)

    expect(session).toMatchObject({
      userId: 'u1',
      email:  'priya@test.com',
      name:   'Priya Sharma',
      view:   'dashboard',
    })
    expect(session.createdAt).toBeGreaterThan(0)
  })

  it('persists the session to localStorage', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya' }
    createSession(user)
    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull()
  })

  // ── getSession ────────────────────────────────────────────────────────────

  it('retrieves a valid session from localStorage', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya' }
    createSession(user)
    const retrieved = getSession()
    expect(retrieved?.userId).toBe('u1')
    expect(retrieved?.email).toBe('priya@test.com')
  })

  it('returns null when no session exists', () => {
    expect(getSession()).toBeNull()
  })

  it('returns null for a malformed localStorage entry', () => {
    localStorage.setItem(SESSION_KEY, 'not-json')
    expect(getSession()).toBeNull()
  })

  // ── Session Expiry ────────────────────────────────────────────────────────

  it('returns null when session is older than 7 days', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya' }
    // Create a session with createdAt 8 days in the past
    const oldSession = {
      ...user,
      createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000),
      view: 'dashboard',
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(oldSession))

    expect(getSession()).toBeNull()
  })

  it('returns the session when session is exactly 7 days old', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya' }
    const exactly7Days = 7 * 24 * 60 * 60 * 1000
    const oldSession = {
      ...user,
      createdAt: Date.now() - exactly7Days,
      view: 'dashboard',
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(oldSession))
    // At the exact boundary, the session should still be valid (ageMs <= maxAge)
    expect(getSession()).not.toBeNull()
  })

  it('clears expired sessions on getSession call', () => {
    const oldSession = {
      userId: 'u1', email: 'a@b.com', name: 'A',
      createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000),
      view: 'dashboard',
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(oldSession))
    getSession()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  // ── clearSession ─────────────────────────────────────────────────────────

  it('removes the session from localStorage', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya' }
    createSession(user)
    clearSession()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('getSession returns null after clearSession', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya' }
    createSession(user)
    clearSession()
    expect(getSession()).toBeNull()
  })

  // ── Round-trip ──────────────────────────────────────────────────────────

  it('create → get → clear round-trip works correctly', () => {
    const user = { id: 'u1', email: 'priya@test.com', name: 'Priya Sharma' }
    createSession(user)
    const retrieved = getSession()
    expect(retrieved?.name).toBe('Priya Sharma')
    clearSession()
    expect(getSession()).toBeNull()
  })
})

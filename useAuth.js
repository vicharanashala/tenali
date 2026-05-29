/**
 * useAuth.js — React hook for Supabase authentication state
 *
 * Provides a reactive user object and loading flag by subscribing to
 * Supabase's auth state change events. Also exports helper functions
 * for OTP session management and user profile read/write.
 *
 * Note: The main authentication flow in App.jsx does NOT use this hook —
 * it manages its own session via localStorage + the /api/auth endpoints.
 * This hook is available for components that need direct Supabase auth
 * access (e.g., future profile settings page).
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Auth state hook ───────────────────────────────────────────────────────────

/**
 * Returns the current authenticated user (or null) and a loading flag.
 * Automatically updates when the user's auth state changes (sign in, sign out,
 * token refresh).
 *
 * @returns {{ user: User | null, loading: boolean }}
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the current session immediately (synchronous, no async needed here)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Clean up subscription on unmount
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ── OTP session management ────────────────────────────────────────────────────
// These manage OTP resend throttling in memory.
// OTP_SESSIONS[email] holds { otp_ref, resendCount, createdAt }
// Note: In a cold-started serverless function, this in-memory store resets.
// For production, replace with a Redis or DB-backed session store.

/** @type {Record<string, { otp_ref: string|null, resendCount: number, createdAt: number }>} */
const OTP_SESSIONS = {}

/**
 * Get or create an OTP session record for the given email.
 * Used to track resend count and enforce throttling rules.
 */
export function createOTPSession(email) {
  if (!OTP_SESSIONS[email]) {
    OTP_SESSIONS[email] = { otp_ref: null, resendCount: 0, createdAt: Date.now() }
  }
  return OTP_SESSIONS[email]
}

/** Get the existing OTP session for an email, or null if none exists. */
export function getOTPSession(email) {
  return OTP_SESSIONS[email] || null
}

/** Increment the resend counter for an email's OTP session. */
export function incrementResendCount(email) {
  if (OTP_SESSIONS[email]) {
    OTP_SESSIONS[email].resendCount++
  }
}

/** Remove an OTP session (called after successful verification). */
export function clearOTPSession(email) {
  delete OTP_SESSIONS[email]
}

// ── Auth helper functions ────────────────────────────────────────────────────

/**
 * Send a one-time password to the given email.
 * Enforces max 3 resends per session and a 10-minute session expiry.
 *
 * @param {string} email
 * @returns {Promise<{ data } | { error }>}
 */
export async function sendOTP(email) {
  const session = createOTPSession(email)

  // Throttle: max 3 OTP resends per session
  if (session.resendCount >= 3) {
    return { error: { message: 'Maximum resend attempts reached. Please try again later.' } }
  }

  // Throttle: session expires after 10 minutes
  const elapsed = (Date.now() - session.createdAt) / 1000 / 60
  if (elapsed > 10) {
    clearOTPSession(email)
    return { error: { message: 'Session expired. Please request a new code.' } }
  }

  incrementResendCount(email)

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })

  if (error) return { error }
  return { data: { ...data, session } }
}

/**
 * Verify an OTP code and establish an authenticated session.
 * Supabase handles JWT refresh after this — 7-day expiry.
 *
 * @param {string} email
 * @param {string} token — 6-digit OTP code
 * @returns {Promise<{ data } | { error }>}
 */
export async function verifyOTP(email, token) {
  const { data, error } = await supabase.auth.verifyOTP(email, token)
  if (error) return { error }

  // OTP verified — clear session so it can't be reused
  clearOTPSession(email)
  return { data }
}

/** Sign out the current authenticated user. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ── User profile helpers ─────────────────────────────────────────────────────

/**
 * Fetch a user's profile row from the `users` table.
 *
 * @param {string} userId
 * @returns {Promise<{ data: UserProfile | null, error }>}
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

/**
 * Insert or update a user profile row.
 * onConflict: 'id' means inserts silently update if the ID already exists.
 *
 * @param {string} userId
 * @param {string} name
 * @param {string} email
 * @returns {Promise<{ data, error }>}
 */
export async function upsertUserProfile(userId, name, email) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, name, email }, { onConflict: 'id' })
  return { data, error }
}

/**
 * Increment a user's XP total via a Supabase RPC function.
 * The RPC `increment_xp(delta)` must be defined in the Supabase project.
 *
 * @param {string} userId
 * @param {number} xpDelta — positive to add, negative to subtract
 * @returns {Promise<{ data, error }>}
 */
export async function updateUserXP(userId, xpDelta) {
  const { data, error } = await supabase.rpc('increment_xp', { delta: xpDelta })
  return { data, error }
}
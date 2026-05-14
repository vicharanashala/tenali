import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── Auth Context ──────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ─── OTP Session Manager ───────────────────────────
// Tracks OTP session state locally
const OTP_SESSIONS = {} // key: email, value: { otp_ref, resendCount, createdAt }

export function createOTPSession(email) {
  if (!OTP_SESSIONS[email]) {
    OTP_SESSIONS[email] = { otp_ref: null, resendCount: 0, createdAt: Date.now() }
  }
  return OTP_SESSIONS[email]
}

export function getOTPSession(email) {
  return OTP_SESSIONS[email] || null
}

export function incrementResendCount(email) {
  if (OTP_SESSIONS[email]) {
    OTP_SESSIONS[email].resendCount++
  }
}

export function clearOTPSession(email) {
  delete OTP_SESSIONS[email]
}

// ─── Auth Functions ─────────────────────────────────
export async function sendOTP(email) {
  const session = createOTPSession(email)
  
  // Enforce max 3 resends per session
  if (session.resendCount >= 3) {
    return { error: { message: 'Maximum resend attempts reached. Please try again later.' } }
  }
  
  // Enforce 10-minute expiry check
  const elapsed = (Date.now() - session.createdAt) / 1000 / 60
  if (elapsed > 10) {
    clearOTPSession(email)
    return { error: { message: 'Session expired. Please request a new code.' } }
  }

  incrementResendCount(email)

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) return { error }

  return { data: { ...data, session } }
}

export async function verifyOTP(email, token) {
  const { data, error } = await supabase.auth.verifyOTP(email, token)

  if (error) return { error }

  // Session created successfully — 7-day JWT expiry handled by Supabase
  clearOTPSession(email)
  return { data }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ─── User Profile Helpers ───────────────────────────
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function upsertUserProfile(userId, name, email) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: userId, name, email }, { onConflict: 'id' })
  return { data, error }
}

export async function updateUserXP(userId, xpDelta) {
  const { data, error } = await supabase.rpc('increment_xp', { delta: xpDelta })
  return { data, error }
}
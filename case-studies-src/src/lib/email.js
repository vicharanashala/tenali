/**
 * email.js — Auth API client (OTP + password-based authentication)
 *
 * Calls the Vercel serverless /api/auth endpoints (send-otp, verify-otp,
 * register, login, reset-password) rather than calling Supabase directly
 * from the browser. This keeps auth logic server-side so secrets (bcrypt,
 * Supabase key) are never exposed in the client bundle.
 *
 * All functions return { data } on success or { error: { message } } on failure,
 * allowing callers to handle errors consistently with a single `if (result.error)`
 * check.
 */

const API_BASE_URL = '/api/auth'

/**
 * Send a one-time password (OTP) to the given email address.
 * The backend generates a 6-digit code and emails it via Resend.
 *
 * @param {string} email
 * @returns {Promise<{data}|{error: {message}}>}
 */
export async function sendOTP(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Failed to send OTP' }
    return { data }
  } catch {
    return { error: 'Network error. Is the backend server running?' }
  }
}

/**
 * Verify the 6-digit OTP code sent to the user's email.
 * Returns a short-lived verification token on success.
 *
 * @param {string} email
 * @param {string} code — 6-digit OTP
 * @returns {Promise<{data: {token}}|{error: {message}}>}
 */
export async function verifyOTP(email, code) {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    })
    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Verification failed' }
    return { data }  // data.token is the verification token
  } catch {
    return { error: 'Network error. Is the backend server running?' }
  }
}

/**
 * Register a new account with name, email, password, and verification token.
 *
 * @param {{ email, name, password, token }} param
 * @returns {Promise<{data: {user}}|{error: {message}}>}
 */
export async function registerUser({ email, name, password, token }) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, token }),
    })
    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Registration failed' }
    return { data }
  } catch {
    return { error: 'Network error. Is the backend server running?' }
  }
}

/**
 * Log in with email + password.
 *
 * @param {{ email, password }} param
 * @returns {Promise<{data: {user}}|{error: {message}}>}
 */
export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Login failed' }
    return { data }
  } catch {
    return { error: 'Network error. Is the backend server running?' }
  }
}

/**
 * Reset the account password using the token from the OTP verification flow.
 *
 * @param {{ email, password, token }} param
 * @returns {Promise<{data}|{error: {message}}>}
 */
export async function resetPassword({ email, password, token }) {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, token }),
    })
    const data = await response.json()
    if (!response.ok) return { error: data.message || 'Password reset failed' }
    return { data }
  } catch {
    return { error: 'Network error. Is the backend server running?' }
  }
}

/**
 * Stub for OTP status polling. Currently always returns empty values —
 * the actual resend cooldown is managed in App.jsx Register component state.
 * Exists here so auth functions are cohesive in one file.
 *
 * @returns {{ canResend: boolean, resendCount: number, secondsLeft: number }}
 */
export function getOTPStatus() {
  return { canResend: true, resendCount: 0, secondsLeft: 0 }
}
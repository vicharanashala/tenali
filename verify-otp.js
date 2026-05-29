/**
 * verify-otp.js — Vercel serverless function: verify OTP and issue session token
 *
 * POST /api/auth/verify-otp
 * Body: { email: string, otp: string }
 *
 * Checks the OTP from otpStore (5-min expiry). On success, issues a short-lived
 * verification token (UUID) stored in verifiedTokens (15-min expiry), which
 * the registration endpoint validates instead of re-checking the OTP.
 *
 * Rate limiting: max 10 verification attempts per IP per 15-minute window.
 * On failure (wrong code, expired, not found), returns 400.
 */

import crypto from 'crypto'
import { otpStore, verifiedTokens, TOKEN_EXPIRY_MS } from './store.js'

const verifyRateLimits = {} // { [ip]: { count, windowStart } }
const VERIFY_RATE_WINDOW = 15 * 60 * 1000
const MAX_VERIFY_PER_WINDOW = 10

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

function checkVerifyRateLimit(ip) {
  const now = Date.now()
  if (!verifyRateLimits[ip] || now - verifyRateLimits[ip].windowStart > VERIFY_RATE_WINDOW) {
    verifyRateLimits[ip] = { count: 0, windowStart: now }
  }
  if (verifyRateLimits[ip].count >= MAX_VERIFY_PER_WINDOW) {
    return false
  }
  verifyRateLimits[ip].count++
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const ip = getClientIP(req)

  if (!checkVerifyRateLimit(ip)) {
    return res.status(429).json({ message: 'Too many attempts. Please try again later.' })
  }

  const { email, otp } = req.body
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  // Validate: exists, not expired, code matches
  const record = otpStore[email]
  if (!record || Date.now() > record.expiry || record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  // OTP verified — remove from store (one-time use)
  delete otpStore[email]

  // Issue a UUID verification token with 15-min expiry
  const token = crypto.randomUUID()
  verifiedTokens[token] = { email, expiresAt: Date.now() + TOKEN_EXPIRY_MS }

  return res.json({ message: 'OTP verified', token })
}
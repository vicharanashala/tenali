/**
 * send-otp.js — Vercel serverless function: send OTP via Resend
 *
 * POST /api/auth/send-otp
 * Body: { email: string }
 *
 * Generates a 6-digit numeric OTP, stores it in otpStore with a 5-minute
 * expiry, and emails it to the user via Resend's API.
 *
 * Rate limiting (per-IP):
 *   - Max 5 OTP requests per IP per 15-minute window
 *   - Max 3 distinct email addresses per IP per 15-minute window
 *   - Duplicate OTP within 60 seconds for the same email (cooldown)
 *
 * In production: replace the in-memory otpStore with a Redis or DB-backed
 * store so OTPs survive cold-start resets.
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_b8ERV4vB_PckH1dFUdXwovxJuqztCVF18')

// In-memory OTP store — resets on cold start
// Shape: { [email]: { otp, expiry, lastSentAt } }
const otpStore = {}

// Rate limit tracking
// Shape: { [ip]: { emailCount: Set, totalCount: number, windowStart: number } }
const ipRateLimits = {}

// Window: 15 minutes in ms
const RATE_WINDOW = 15 * 60 * 1000
const MAX_OTPS_PER_IP = 5      // max OTP requests per IP per window
const MAX_EMAILS_PER_IP = 3    // max distinct emails per IP per window
const OTP_COOLDOWN_MS = 60_000 // must wait 60s before resending to same email

/** Generate a random 6-digit OTP (e.g. "482917"). */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

/** Extract client IP from request headers (Vercel provides x-forwarded-for). */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

/** Check rate limits for a given IP + email. Returns { allowed: boolean, reason?: string }. */
function checkRateLimit(ip, email) {
  const now = Date.now()

  if (!ipRateLimits[ip]) {
    ipRateLimits[ip] = { emailCount: new Set(), totalCount: 0, windowStart: now }
  }

  const record = ipRateLimits[ip]

  // Reset window if expired
  if (now - record.windowStart > RATE_WINDOW) {
    record.emailCount = new Set()
    record.totalCount = 0
    record.windowStart = now
  }

  // Check total OTP cap
  if (record.totalCount >= MAX_OTPS_PER_IP) {
    return { allowed: false, reason: 'Too many requests. Please try again later.' }
  }

  // Check distinct email cap
  if (!record.emailCount.has(email) && record.emailCount.size >= MAX_EMAILS_PER_IP) {
    return { allowed: false, reason: 'Too many email addresses. Please try again later.' }
  }

  return { allowed: true }
}

/** Record an OTP send event for rate limiting. */
function recordOTP(ip, email) {
  if (!ipRateLimits[ip]) {
    ipRateLimits[ip] = { emailCount: new Set(), totalCount: 0, windowStart: Date.now() }
  }
  const record = ipRateLimits[ip]
  record.emailCount.add(email)
  record.totalCount++
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' }
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }

  const ip = getClientIP(req)

  // ── Rate limit check ────────────────────────────────────────────────────────
  const rateCheck = checkRateLimit(ip, email)
  if (!rateCheck.allowed) {
    return res.status(429).json({ message: rateCheck.reason })
  }

  // ── Cooldown check: don't resend to same email within 60 seconds ───────────
  const existing = otpStore[email]
  if (existing && Date.now() - existing.lastSentAt < OTP_COOLDOWN_MS) {
    const waitSec = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000)
    return res.status(429).json({
      message: `Please wait ${waitSec}s before requesting a new code.`,
    })
  }

  // ── Generate and store OTP ─────────────────────────────────────────────────
  const otp = generateOTP()
  const expiry = Date.now() + 5 * 60 * 1000
  otpStore[email] = { otp, expiry, lastSentAt: Date.now() }

  // Record for rate limiting
  recordOTP(ip, email)

  // ── Send email via Resend ───────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from: 'Tenali Math <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP Code',
      html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">Your code</h2>
        <p style="font-size:16px;color:#333;">Use the code below to verify your email:</p>
        <div style="background:#f0f4ff;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#2dd4bf;margin:20px 0;border-radius:8px;">${otp}</div>
        <p style="font-size:12px;color:#888;">This code expires in 5 minutes.</p>
      </div>`,
    })
    return res.json({ message: 'OTP sent successfully' })
  } catch (error) {
    // Log error server-side only — never expose internal details to the client
    console.error('Error sending OTP email:', error?.message || error)
    return res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
  }
}
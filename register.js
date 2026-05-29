/**
 * register.js — Vercel serverless function: create new user account
 *
 * POST /api/auth/register
 * Body: { email, name, password, token }
 *
 * Validates the verification token (or bypasses for special emails),
 * hashes the password with bcrypt (cost 10), and inserts a new row
 * into the Supabase `users` table.
 *
 * Special email bypass: accounts in BYPASS_EMAILS skip token verification
 * (they use a simplified OTP-free flow for trusted researchers).
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { verifiedTokens, TOKEN_EXPIRY_MS } from './store.js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Emails that bypass OTP token verification (researcher accounts)
const BYPASS_EMAILS = [
  'sudarshan.iyengar@vicharanashala.ai',
  'meenakshi.v@vicharanashala.ai',
  'harshdeep.r@vicharanashala.ai',
  'rohit.sharma@vicharanashala.ai',
  'sakshi.sharma@vicharanashala.ai',
  'pavani.a@vicharanashala.ai',
  'prakash.hegade@vicharanashala.ai',
]

/** Returns true if the email is in the bypass list (case-insensitive). */
function isBypassEmail(email) {
  return BYPASS_EMAILS.includes(email.toLowerCase())
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, name, password, token } = req.body

  // Validate verification token unless email is on the bypass list
  if (!isBypassEmail(email)) {
    const tokenRecord = verifiedTokens[token]
    if (!tokenRecord || tokenRecord.email !== email || Date.now() > tokenRecord.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired verification session' })
    }
  }

  try {
    // Hash password with bcrypt (cost factor 10)
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('users')
      .insert({ email, name, password: hashedPassword })
      .select()
      .single()

    if (error) throw error

    // Consume the verification token (unless bypass)
    if (!isBypassEmail(email)) {
      delete verifiedTokens[token]
    }

    return res.json({
      message: 'Registration successful',
      user: { id: data.id, email: data.email, name: data.name },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
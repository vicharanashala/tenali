/**
 * google-login.js — Vercel serverless: authenticate via Google OAuth JWT
 *
 * POST /api/auth/google-login
 * Body: { credential: "<google JWT>", role: "student" | "teacher" }
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

function decodeCredential(credential) {
  try {
    const base64Url = credential.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { credential, role = 'student' } = req.body
  if (!credential) {
    return res.status(400).json({ message: 'Missing credential' })
  }

  const userInfo = decodeCredential(credential)
  if (!userInfo || !userInfo.sub || !userInfo.email) {
    return res.status(400).json({ message: 'Invalid credential token' })
  }

  try {
    const clientIP   = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'
    const userAgent  = req.headers['user-agent'] || 'unknown'
    const ip = clientIP.split(',')[0].trim()

    let user = null

    // ── Step 1: Find existing user by google_id ─────────────────────────
    const { data: byGoogleId, error: googleIdErr } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('google_id', userInfo.sub)
      .maybeSingle()

    if (!googleIdErr && byGoogleId) {
      user = byGoogleId
      // Update role if changed
      if (byGoogleId.role !== role) {
        await supabase.from('users').update({ role }).eq('id', byGoogleId.id)
        user = { ...byGoogleId, role }
      }
    }

    // ── Step 2: If not found by google_id, find by email ───────────────
    if (!user) {
      const { data: byEmail, error: emailErr } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('email', userInfo.email)
        .maybeSingle()

      if (!emailErr && byEmail) {
        // Email exists — update it with this user's google_id
        const { data: updated, error: updateErr } = await supabase
          .from('users')
          .update({
            google_id: userInfo.sub,
            name:      userInfo.name || byEmail.name,
          })
          .eq('email', userInfo.email)
          .select('id, email, name, role')
          .single()

        if (!updateErr && updated) {
          user = updated
          // Also update role if changed
          if (byEmail.role !== role) {
            await supabase.from('users').update({ role }).eq('id', byEmail.id)
            user = { ...updated, role }
          }
        }
      }
    }

    // ── Step 3: If still not found, create new user ─────────────────────
    if (!user) {
      const { data: created, error: createErr } = await supabase
        .from('users')
        .insert({
          google_id: userInfo.sub,
          email:     userInfo.email,
          name:      userInfo.name || userInfo.given_name || 'User',
          role:      role,
        })
        .select('id, email, name, role')
        .single()

      if (createErr) {
        console.error('[google-login] Create error:', createErr)
        return res.status(500).json({ message: 'Failed to create user', detail: createErr.message })
      }
      user = created
    }

    // ── Step 4: Log to audit_log (non-critical — fail silently) ─────────
    try {
      await supabase.from('audit_log').insert([{
        event:      'google_login',
        email:      userInfo.email,
        role:       role,
        ip_address: ip,
        user_agent: userAgent,
        metadata:   { google_id: userInfo.sub, user_id: user.id },
      }])
    } catch {}

    return res.json({
      message: 'Login successful',
      user:    { id: user.id, email: user.email, name: user.name, role: user.role },
    })

  } catch (error) {
    console.error('[google-login] Unexpected error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
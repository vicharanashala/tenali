/**
 * login.js — Vercel serverless function: authenticate user with email + password
 *
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Looks up the user in the Supabase `users` table by email, then
 * uses bcrypt.compare to verify the password. On success, returns
 * the user object (id, email, name) to the client.
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error
    if (!user) return res.status(400).json({ message: 'User not found' })

    // Verify password against stored bcrypt hash
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(400).json({ message: 'Invalid password' })

    return res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
/**
 * admin/reset-passwords.js — Bulk password reset for accounts affected by RLS
 *
 * POST /api/admin/reset-passwords
 * Body: { emails: string[], newPassword: string }
 *
 * Uses Supabase service_role key to bypass RLS and update password hashes
 * directly in the users table. Only accessible server-side (not from browser).
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
// Service role key — bypasses RLS, never exposed to client
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1MDg3NCwiZXhwIjoyMDk0MzI2ODc0fQ.XFogKtW0vWwmS0d0Xm5Zj6Q4pLqJ1nR8vK9yB2cM3sA'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { emails, newPassword } = req.body

  if (!emails || !Array.isArray(emails) || !newPassword) {
    return res.status(400).json({ message: 'Body must contain { emails: string[], newPassword: string }' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const results = []

    for (const email of emails) {
      const { data, error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', email)
        .select('id, email')

      if (error) {
        results.push({ email, success: false, error: error.message })
      } else {
        results.push({ email, success: true, data })
      }
    }

    return res.json({ message: 'Password reset complete', results })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
/**
 * record.js — Vercel serverless function: log an individual answer attempt
 *
 * POST /api/attempts/record
 * Body: { user_id, case_study_id, stage_number, answer_given, is_correct, xp_earned }
 *
 * Inserts a new row into `user_attempts`. Every answer (correct or wrong)
 * is logged for analytics, future leaderboards, and the revision history feature.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { user_id, case_study_id, stage_number, answer_given, is_correct, xp_earned } = req.body

  if (!user_id || !case_study_id) {
    return res.status(400).json({ message: 'user_id and case_study_id are required' })
  }

  try {
    const payload = {
      user_id,
      case_study_id,
      stage_number: stage_number ?? 0,
      answer_given: answer_given ?? '',
      is_correct: is_correct ?? false,
      xp_earned: xp_earned ?? 0,
      attempted_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_attempts')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return res.json(data)
  } catch (error) {
    console.error('[POST /api/attempts]', error)
    return res.status(500).json({ message: error.message })
  }
}
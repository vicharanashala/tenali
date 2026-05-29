/**
 * save.js — Vercel serverless function: upsert user progress for a case study
 *
 * POST /api/progress/save
 * Body: { user_id, case_study_id, stage_number, status, xp_earned, completed_at? }
 *
 * Creates or updates a row in `user_progress` (conflict on user_id + case_study_id).
 * Called on stage completion, stage advance, and session exit.
 *
 * status values: 'in_progress' | 'mastered'
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { user_id, case_study_id, stage_number, status, xp_earned, completed_at } = req.body

  if (!user_id || !case_study_id) {
    return res.status(400).json({ message: 'user_id and case_study_id are required' })
  }

  try {
    const payload = {
      user_id,
      case_study_id,
      current_stage: stage_number ?? 0,
      status: status || 'in_progress',
      xp_earned: xp_earned || 0,
      last_updated: new Date().toISOString(),
    }

    if (completed_at) {
      payload.completed_at = completed_at
    }

    // Upsert: update if exists (user_id + case_study_id conflict), insert if not
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(payload, { onConflict: 'user_id,case_study_id' })
      .select()
      .single()

    if (error) throw error
    return res.json(data)
  } catch (error) {
    console.error('[POST /api/progress]', error)
    return res.status(500).json({ message: error.message })
  }
}
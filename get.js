/**
 * get.js — Vercel serverless function: fetch all case studies + user progress
 *
 * GET /api/progress/get?user_id=xxx
 *
 * Returns an array of all case studies, each enriched with:
 *   - progress: { current_stage, status, xp_earned, completed_at } or null
 *   - total_stages: highest stage_number for this case study
 *
 * Merges data from `case_studies`, `user_progress`, and `stages` tables.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { user_id } = req.query
  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' })
  }

  try {
    // Fetch all case studies
    const { data: caseStudies, error: csError } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at')

    if (csError) throw csError

    // Fetch all progress records for this user
    const { data: progress, error: progError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user_id)

    if (progError) throw progError

    // Fetch all stage records (to derive total stage count per case study)
    const { data: allStages } = await supabase
      .from('stages')
      .select('case_study_id, stage_number')

    // Build lookup map: case_study_id → progress record
    const progressMap = {}
    if (progress) {
      for (const p of progress) {
        progressMap[p.case_study_id] = p
      }
    }

    // Count stages per case study (highest stage_number = total)
    const stageCountMap = {}
    if (allStages) {
      for (const s of allStages) {
        if (!stageCountMap[s.case_study_id]) {
          stageCountMap[s.case_study_id] = 0
        }
        if (s.stage_number > stageCountMap[s.case_study_id]) {
          stageCountMap[s.case_study_id] = s.stage_number
        }
      }
    }

    // Merge everything into the response shape
    const result = (caseStudies || []).map(cs => ({
      ...cs,
      progress: progressMap[cs.id]
        ? {
            current_stage: progressMap[cs.id].current_stage,
            status:         progressMap[cs.id].status,
            xp_earned:      progressMap[cs.id].xp_earned,
            completed_at:    progressMap[cs.id].completed_at,
          }
        : null,
      total_stages: stageCountMap[cs.id] || 0,
    }))

    return res.json(result)
  } catch (error) {
    console.error('[GET /api/progress]', error)
    return res.status(500).json({ message: error.message })
  }
}
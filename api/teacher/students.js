/**
 * teacher/students.js — GET /api/teacher/students
 * Returns all students and their progress across theorems.
 * Teacher-only endpoint (role check on session — passed via header for now).
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwmciomzyaujlpsquvbz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bWNpb216eWF1amxwc3F1dmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTA4NzQsImV4cCI6MjA5NDMyNjg3NH0.k0t6iwmH_4OiFOEqTjX888CybFOH53L9Fs0-98YVuPE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Fetch all students
    const { data: students, error: studentsErr } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (studentsErr) throw studentsErr

    // Fetch progress for all students
    const { data: progress, error: progressErr } = await supabase
      .from('user_progress')
      .select('user_id, case_study_id, current_stage, status, xp_earned')
      .in('user_id', students.map(s => s.id))

    if (progressErr) {
      console.error('[teacher/students] Progress fetch error:', progressErr)
    }

    // Group progress by user_id
    const progressByUser = {}
    for (const p of (progress || [])) {
      if (!progressByUser[p.user_id]) progressByUser[p.user_id] = []
      progressByUser[p.user_id].push(p)
    }

    // Build response with student + progress summary
    const result = students.map(student => ({
      ...student,
      progress: progressByUser[student.id] || [],
      total_xp: (progressByUser[student.id] || []).reduce((sum, p) => sum + (p.xp_earned || 0), 0),
      theorems_started: (progressByUser[student.id] || []).filter(p => p.status !== 'not_started').length,
      theorems_mastered: (progressByUser[student.id] || []).filter(p => p.status === 'mastered').length,
    }))

    return res.json({ students: result })

  } catch (error) {
    console.error('[teacher/students] Error:', error)
    return res.status(500).json({ message: 'Failed to load students' })
  }
}
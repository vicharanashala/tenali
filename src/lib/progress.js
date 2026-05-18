/**
 * progress.js — Client-side progress and XP tracking API
 *
 * All functions call Vercel serverless API endpoints that proxy
 * to the Supabase backend. The API_BASE path is relative (/api)
 * so it works identically in dev (local server) and production.
 *
 * XP values are also exported as constants so components that
 * award XP don't hardcode numbers.
 */

const API_BASE = '/api'

// XP reward constants — update here to change XP economy globally
const XP_FIRST_ATTEMPT  = 10   // Correct answer with no hint used
const XP_AFTER_HINT     = 5    // Correct answer after requesting a hint
const XP_STAGE_COMPLETE = 20   // Bonus XP when advancing to the next stage
const XP_MASTERY        = 100  // Bonus XP when all stages are completed

/**
 * Fetch all case study progress records for a given user.
 *
 * @param {string} userId — authenticated user ID
 * @returns {Promise<Array>} Array of { id, title, progress: { current_stage, status, xp_earned }, total_stages }
 */
async function fetchProgress(userId) {
  try {
    const res = await fetch(`${API_BASE}/progress/get?user_id=${userId}`)
    if (!res.ok) throw new Error('Failed to fetch progress')
    return await res.json()
  } catch (error) {
    console.error('[fetchProgress]', error)
    return []  // Return empty array on failure — components handle gracefully
  }
}

/**
 * Persist (upsert) a progress record for a given user + theorem.
 * Called on stage completion and on session exit.
 *
 * @param {object} data — { user_id, case_study_id, stage_number, status, xp_earned, completed_at? }
 */
async function saveProgress(data) {
  try {
    const res = await fetch(`${API_BASE}/progress/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to save progress')
    return await res.json()
  } catch (error) {
    console.error('[saveProgress]', error)
    return null
  }
}

/**
 * Log an individual answer attempt (correct or wrong).
 * Used for analytics, leaderboards, and revision history.
 *
 * @param {object} data — { user_id, case_study_id, stage_number, answer_given, is_correct, xp_earned }
 */
async function recordAttempt(data) {
  try {
    const res = await fetch(`${API_BASE}/attempts/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to record attempt')
    return await res.json()
  } catch (error) {
    console.error('[recordAttempt]', error)
    return null
  }
}

export {
  fetchProgress,
  saveProgress,
  recordAttempt,
  XP_FIRST_ATTEMPT,
  XP_AFTER_HINT,
  XP_STAGE_COMPLETE,
  XP_MASTERY,
}
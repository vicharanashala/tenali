/**
 * Dashboard.jsx — Main landing page after user signs in.
 *
 * Displays all available theorem cards in a responsive grid, showing each
 * card's progress (status, current stage, XP earned). Includes an XP summary
 * bar at the top that reflects the user's total earned XP and rank.
 *
 * When a user clicks a theorem card, this component passes control to
 * <LearningLoop> which handles the interactive learning session. On session
 * completion or exit, <LearningLoop> calls onComplete / onExit and this
 * component re-fetches progress and returns to the grid view.
 *
 * @props session   — { userId, name } object from the parent auth context
 * @props onSignOut — callback to trigger sign-out in the parent
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CaseStudyCard from '../../components/dashboard/CaseStudyCard'
import XPBar from '../../components/dashboard/XPBar'
import theorems from '../../data/theorems.json'
import { theoremIllustrations } from '../../data/illustrations'
import LearningLoop from './LearningLoop'
import { fetchProgress } from '../../lib/progress'

// ---------------------------------------------------------------------------
// DashboardHeader
// ---------------------------------------------------------------------------
/**
 * Sticky header bar shown at the top of every dashboard view.
 *
 * Renders the Tenali logo on the left, a theorem count badge, and on the
 * right: user avatar (initials), name, and a sign-out button.
 *
 * @props session    — user object to display name / derive initials
 * @props onSignOut  — called when the sign-out button is clicked
 */
function DashboardHeader({ session, onSignOut }) {
  // Derive user initials from the full name.
  // e.g. "Jinal Gupta" -> "JG". Falls back to "U" if no name is present.
  const initials = session?.name
    ? session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-navy-900/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl">
        {/* Logo: teal "T" monogram + "Tenali" wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-teal-400/20">
            <span className="text-navy-950 font-bold text-lg font-display">T</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-cream-100">Tenali</span>
        </div>

        {/* Right side: theorem count, separator, user info, sign-out */}
        <div className="flex items-center gap-4">
          {/* Total theorems badge (hidden on very small screens) */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-mono text-cream-400">{theorems.length} Theorems</span>
          </div>

          {/* Vertical divider between badge section and user section */}
          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* User avatar + name (hidden on mobile) */}
          <div className="flex items-center gap-3">
            {/* Gradient avatar circle displaying initials */}
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-navy-950 font-bold text-sm">{initials}</span>
            </div>
            {/* Name label (hidden below medium breakpoint) */}
            <div className="hidden md:block text-right">
              <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">Welcome</p>
              <p className="text-sm text-cream-100 font-medium leading-tight">{session?.name}</p>
            </div>
          </div>

          {/* Sign-out button */}
          <button
            onClick={onSignOut}
            className="p-2 hover:bg-coral-400/10 text-coral-400 rounded-xl transition-all group"
            aria-label="Sign out of Tenali"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Dashboard (default export)
// ---------------------------------------------------------------------------
/**
 * Root dashboard view. Renders the header, XP bar, section header, and a
 * responsive grid of theorem cards. Manages the "active theorem" flow that
 * hands off to <LearningLoop> for an interactive session.
 *
 * @prop session    — { userId, name } from the parent auth context
 * @prop onSignOut  — callback to sign out the user
 */
export default function Dashboard({ session, onSignOut }) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  /** ID of the theorem the user has clicked to study. null = show grid. */
  const [activeTheorem, setActiveTheorem] = useState(null)

  /** Raw progress array fetched from the backend for the current user. */
  const [progressData, setProgressData] = useState([])

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------
  // Enrich every theorem with its illustration icon (or null if none).
  const theoremsWithIcons = theorems.map(t => ({
    ...t,
    icon: theoremIllustrations[t.illustration] || null,
  }))

  // Shortcut to the userId so we can use it in dependency arrays safely.
  const userId = session?.userId

  // -------------------------------------------------------------------------
  // Fetch user progress from the backend whenever userId or activeTheorem
  // changes. activeTheorem is in the deps so we re-fetch after completing a
  // session (when activeTheorem is set back to null the effect re-runs, giving
  // us fresh post-session progress data).
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!userId) return
    fetchProgress(userId).then(data => {
      setProgressData(data || [])
    }).catch(() => {
      // Silently swallow errors — progress is non-critical.
    })
  }, [userId, activeTheorem])

  // Build a lookup map: caseStudyId -> progress details.
  // This makes it O(1) to look up a given theorem's progress while mapping.
  const progressMap = {}
  for (const p of progressData) {
    progressMap[p.id] = {
      status: p.progress?.status || 'not_started',
      current_stage: p.progress?.current_stage || 0,
      xp_earned: p.progress?.xp_earned || 0,
      total_stages: p.total_stages || 0,
    }
  }

  // Total XP is the sum of xp_earned across all theorem progress records.
  const totalXP = progressData.reduce((sum, p) => sum + (p.progress?.xp_earned || 0), 0)

  // -------------------------------------------------------------------------
  // Active learning session view
  // -------------------------------------------------------------------------
  // If a theorem is active, render the LearningLoop and hand off all controls.
  // onComplete / onExit both clear activeTheorem AND trigger a progress re-fetch
  // by resetting progressData to [] (the useEffect above will re-populate it).
  if (activeTheorem) {
    return (
      <LearningLoop
        theoremId={activeTheorem}
        onComplete={() => { setProgressData([]); setActiveTheorem(null) }}
        onExit={() => { setProgressData([]); setActiveTheorem(null) }}
        userId={userId}
      />
    )
  }

  // -------------------------------------------------------------------------
  // Main dashboard grid view
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Sticky top bar with logo, theorem count, user info, sign-out */}
      <DashboardHeader session={session} onSignOut={onSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-100 mb-2">
            Case Studies
          </h1>
          <p className="text-cream-400 text-sm sm:text-base">
            Explore foundational theorems through interactive visualizations and problem-solving.
          </p>
        </div>

        {/* XP summary bar: shows total XP earned, current rank, next milestone */}
        <div className="mb-8">
          <XPBar
            totalXP={totalXP}
            rank={totalXP >= 500 ? 'Scholar' : totalXP >= 200 ? 'Apprentice' : 'Novice'}
            nextMilestone={(Math.floor(totalXP / 100) + 1) * 100}
          />
        </div>

        {/* "The Theorems" section header with theorem count badge */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-cream-100 font-semibold">The Theorems</h2>
            <p className="text-xs text-cream-400 mt-0.5">Choose a theorem to begin your journey</p>
          </div>
          {/* Live count badge with pulsing green dot to suggest availability */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-900/60 border border-white/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-mono text-cream-400">{theorems.length} available</span>
          </div>
        </div>

        {/* Responsive grid of theorem cards with staggered entrance animation.
            Layout: 1 col (mobile) → 2 col (small) → 3 col (large) → 4 col (xl) */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {theoremsWithIcons.map(theorem => {
            // Look up this theorem's progress from the map (empty obj if never started).
            const prog = progressMap[theorem.id] || {}
            return (
              <motion.div
                key={theorem.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                }}
              >
                <CaseStudyCard
                  theorem={theorem}
                  illustration={theoremIllustrations[theorem.id] || null}
                  progress={prog}
                  onClick={() => setActiveTheorem(theorem.id)}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </main>
    </div>
  )
}
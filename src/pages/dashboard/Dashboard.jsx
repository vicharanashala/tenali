import { useState, useEffect } from 'react'
import CaseStudyCard from '../../components/dashboard/CaseStudyCard'
import XPBar from '../../components/dashboard/XPBar'
import theorems from '../../data/theorems.json'
import { theoremIllustrations } from '../../data/illustrations'
import LearningLoop from './LearningLoop'
import { fetchProgress } from '../../lib/progress'

function DashboardHeader({ session, onSignOut }) {
  const initials = session?.name
    ? session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-navy-900/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-teal-400/20">
            <span className="text-navy-950 font-bold text-lg font-display">T</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-cream-100">Tenali</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-mono text-cream-400">{theorems.length} Theorems</span>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-navy-950 font-bold text-sm">{initials}</span>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">Welcome</p>
              <p className="text-sm text-cream-100 font-medium leading-tight">{session?.name}</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="p-2 hover:bg-coral-400/10 text-coral-400 rounded-xl transition-all group"
            title="Sign out"
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

export default function Dashboard({ session, onSignOut }) {
  const [activeTheorem, setActiveTheorem] = useState(null)
  const [progressData, setProgressData] = useState([])
  const theoremsWithIcons = theorems.map(t => ({
    ...t,
    icon: theoremIllustrations[t.illustration] || null,
  }))

  const userId = session?.userId

  useEffect(() => {
    if (!userId) return
    fetchProgress(userId).then(data => {
      setProgressData(data || [])
    }).catch(() => {})
  }, [userId])

  // Build progress map: caseStudyId -> { status, current_stage, xp_earned, total_stages }
  const progressMap = {}
  for (const p of progressData) {
    progressMap[p.id] = {
      status: p.progress?.status || 'not_started',
      current_stage: p.progress?.current_stage || 0,
      xp_earned: p.progress?.xp_earned || 0,
      total_stages: p.total_stages || 0,
    }
  }

  const totalXP = progressData.reduce((sum, p) => sum + (p.progress?.xp_earned || 0), 0)

  if (activeTheorem) {
    return (
      <LearningLoop
        theoremId={activeTheorem}
        onComplete={() => setActiveTheorem(null)}
        onExit={() => setActiveTheorem(null)}
        userId={userId}
      />
    )
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <DashboardHeader session={session} onSignOut={onSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream-100 mb-2">
            Case Studies
          </h1>
          <p className="text-cream-400 text-sm sm:text-base">
            Explore foundational theorems through interactive visualizations and problem-solving.
          </p>
        </div>

        {/* XP Summary Bar */}
        <div className="mb-8">
          <XPBar totalXP={totalXP} rank={totalXP >= 500 ? 'Scholar' : totalXP >= 200 ? 'Apprentice' : 'Novice'} nextMilestone={(Math.floor(totalXP / 100) + 1) * 100} />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-cream-100 font-semibold">The Theorems</h2>
            <p className="text-xs text-cream-400 mt-0.5">Choose a theorem to begin your journey</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-900/60 border border-white/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-mono text-cream-400">{theorems.length} available</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {theoremsWithIcons.map(theorem => {
            const prog = progressMap[theorem.id] || {}
            return (
              <CaseStudyCard
                key={theorem.id}
                theorem={theorem}
                progress={prog}
                onClick={() => setActiveTheorem(theorem.id)}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
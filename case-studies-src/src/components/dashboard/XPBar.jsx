/**
 * XPBar.jsx — XP progress summary bar shown at the top of the dashboard
 *
 * Displays:
 *   - Current level badge (L1, L2, …) with rank name (Novice / Apprentice / Scholar)
 *   - A progress bar showing XP progress toward the next milestone (0–1000 XP per level)
 *   - The next milestone XP target and a checkmark icon
 *
 * XP wraps every 1000 points — earning 1050 XP shows as Level 2 with 50 XP toward the next tier.
 *
 * @prop totalXP      — user's total accumulated XP (all levels combined)
 * @prop rank         — display label for the current rank tier
 * @prop nextMilestone — XP target for the next reward/level
 */

export default function XPBar({ totalXP = 0, rank = 'Novice', nextMilestone = 1000 }) {
  // Progress within the current 1000-XP level: 0.0 → 1.0
  const progress = Math.min((totalXP % 1000) / 1000, 1) * 100

  // Level = how many full 1000-XP cycles the user has completed, + 1 for the current level
  const currentLevel = Math.floor(totalXP / 1000) + 1

  return (
    <div className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">

        {/* ── Level badge: circle with L# + rank label ── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
            <span className="text-navy-950 font-bold font-display text-sm">L{currentLevel}</span>
          </div>
          <div>
            <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">Level {currentLevel}</p>
            <p className="text-sm text-cream-100 font-medium">{rank}</p>
          </div>
        </div>

        {/* ── XP progress bar ── */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-cream-400 font-medium">{totalXP} XP</span>
            <span className="text-xs text-cream-400 font-medium">{nextMilestone} XP to next reward</span>
          </div>
          <div className="h-2.5 bg-navy-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-300 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Next milestone indicator ── */}
        <div className="flex items-center gap-2 text-right">
          <div className="text-right">
            <p className="text-xs text-cream-400">Next milestone</p>
            <p className="text-sm text-amber-400 font-bold font-mono">{nextMilestone} XP</p>
          </div>
          {/* Checkmark icon in a dark square */}
          <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  )
}
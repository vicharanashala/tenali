// ============================================================
// CaseStudyCard.jsx — Individual theorem card for the dashboard
// Displays theorem name, illustration, progress status, XP earned,
// and a hover "Start/Continue" CTA. Clicking opens the LearningLoop.
// Hover state includes a subtle elevation (scale + shadow) via framer-motion.
// ============================================================

import { motion } from 'framer-motion'

export default function CaseStudyCard({ theorem, onClick, progress = {}, illustration = null }) {
  // Unpack progress props with sensible defaults for new/not-started cards
  const { status = 'not_started', current_stage = 0, xp_earned = 0, total_stages = 0 } = progress;

  // STATUS_CONFIG maps backend status strings to UI label/bg/text/border classes
  const STATUS_CONFIG = {
    'not_started': {
      label: 'Not Started',
      bg: 'bg-navy-800',
      text: 'text-cream-400',
      border: 'border-navy-700',
    },
    'in_progress': {
      label: `Step ${current_stage} of ${total_stages}`,
      bg: 'bg-teal-400/10',
      text: 'text-teal-400',
      border: 'border-teal-400/30',
    },
    'mastered': {
      label: 'Mastered',
      bg: 'bg-teal-400/20',
      text: 'text-teal-400',
      border: 'border-teal-400/50',
    },
  };

  // Fallback to not_started config if unknown status value
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG['not_started'];

  return (
    <motion.article
      onClick={onClick}
      className="group relative bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 cursor-pointer"
      whileHover={{
        scale: 1.03,
        boxShadow: '0 20px 60px rgba(45, 212, 191, 0.08), 0 8px 24px rgba(0,0,0,0.4)',
        borderColor: 'rgba(45, 212, 191, 0.35)',
      }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      layout
    >
      {/* Illustration: custom SVG if provided, else shows theorem's first letter as placeholder */}
      <div className="w-full aspect-square mb-5 rounded-2xl overflow-hidden bg-navy-950 border border-white/5 flex items-center justify-center p-4 group-hover:border-teal-400/20 transition-colors">
        {illustration || <div className="text-cream-300/30 text-4xl">{theorem.theorem.charAt(0)}</div>}
      </div>

      {/* Status badge: top-right corner — shows "Not Started" / "Step N of M" / "Mastered" */}
      <div className="absolute top-4 right-4">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* XP earned badge: top-left corner — only visible when xp_earned > 0 */}
      {xp_earned > 0 && (
        <div className="absolute top-4 left-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400">
            {xp_earned} XP
          </span>
        </div>
      )}

      {/* Card body: theorem title + one-line description */}
      <div className="space-y-2">
        <h3 className="font-display text-xl text-cream-100 font-bold leading-tight group-hover:text-teal-400 transition-colors">
          {theorem.theorem}
        </h3>
        <p className="text-sm text-cream-300 leading-relaxed line-clamp-2">
          {theorem.coreIdea}
        </p>
      </div>

      {/* Footer: illustration label (e.g. theorem ID) + hover CTA arrow */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-xs font-mono text-cream-400">{theorem.illustration}</span>
        </div>
        {/* "Start" for new cards, "Continue" for in-progress/mastered — fades in on hover */}
        <div className="flex items-center gap-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold">{status === 'not_started' ? 'Start' : 'Continue'}</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.article>
  )
}
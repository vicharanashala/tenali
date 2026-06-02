/**
 * TeacherDashboard.jsx — Teacher view: all students and their progress.
 * Route: /teacher/dashboard
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard({ onSignOut }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/teacher/students')
      .then(r => r.json())
      .then(data => {
        if (data.students) setStudents(data.students)
        else setError(data.message || 'Failed to load')
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (status) => {
    if (status === 'mastered') return 'bg-emerald-400/20 text-emerald-400'
    if (status === 'in_progress') return 'bg-teal-400/20 text-teal-400'
    return 'bg-navy-700 text-cream-400'
  }

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Teacher Dashboard</p>
            <h1 className="font-display text-4xl text-cream-100 font-bold">Your Students</h1>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-amber-400/30 text-amber-400 rounded-xl hover:bg-amber-400/10 transition-all text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72m8.162 0a9.094 9.094 0 003.741.479m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-cream-100 mb-2">No Students Yet</h2>
            <p className="text-cream-400 text-sm max-w-sm mx-auto">
              Share Tenali with your students and they will appear here once they sign up and start learning.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {students.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-amber-400/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  {/* Student info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-navy-950 font-bold text-lg">
                      {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-cream-100 font-semibold text-base">{student.name || 'Unnamed Student'}</p>
                      <p className="text-cream-500 text-xs">{student.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="text-cream-100 font-display text-2xl font-bold">{student.total_xp}</p>
                      <p className="text-cream-500 text-xs">Total XP</p>
                    </div>
                    <div>
                      <p className="text-cream-100 font-display text-2xl font-bold">{student.theorems_started}</p>
                      <p className="text-cream-500 text-xs">Started</p>
                    </div>
                    <div>
                      <p className="text-cream-100 font-display text-2xl font-bold">{student.theorems_mastered}</p>
                      <p className="text-cream-500 text-xs">Mastered</p>
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                {student.progress.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {student.progress.slice(0, 4).map(p => (
                      <div key={p.case_study_id} className="bg-navy-800/50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cream-300 text-xs capitalize">{p.case_study_id?.replace(/-/g, ' ')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(p.status)}`}>
                            {p.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="w-full bg-navy-700 rounded-full h-1.5">
                          <div
                            className="bg-amber-400 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (p.current_stage / 7) * 100)}%` }}
                          />
                        </div>
                        <p className="text-cream-500 text-xs mt-1">Stage {p.current_stage || 0} / 7</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
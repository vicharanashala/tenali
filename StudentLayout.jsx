/**
 * StudentLayout.jsx
 *
 * Layout wrapper for all student-specific pages.
 * Features a sticky header with student navigation,
 * session validation, and a slot for child routes.
 *
 * Mirrors the header pattern from Dashboard.jsx but as a reusable layout.
 * Routes wrapped by this layout:
 *   /dashboard         — Main dashboard
 *   /case-study/:id    — Learning session
 *   /profile           — Student profile
 */

import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'

const SESSION_KEY = 'math_session'

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    const ageMs = Date.now() - session.createdAt
    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (ageMs > maxAge) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export default function StudentLayout() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const s = getSession()
    if (!s) {
      navigate('/login')
      return
    }
    setSession(s)
    setLoading(false)
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = session?.name
    ? session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'S'

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-navy-900/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-teal-400/20">
              <span className="text-navy-950 font-bold text-lg font-display">T</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-cream-100">Tenali</span>
          </div>

          {/* Navigation */}
          <nav aria-label="Student navigation" className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/dashboard/leaderboard">Leaderboard</NavLink>
            <NavLink to="/dashboard/profile">Profile</NavLink>
          </nav>

          {/* Right side: user info + sign-out */}
          <div className="flex items-center gap-3">
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
              onClick={() => {
                localStorage.removeItem(SESSION_KEY)
                navigate('/')
              }}
              className="p-2 hover:bg-coral-400/10 text-coral-400 rounded-xl transition-all group"
              aria-label="Sign out"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 text-sm font-medium text-cream-300 hover:text-teal-400 hover:bg-teal-400/10 rounded-xl transition-all"
    >
      {children}
    </Link>
  )
}
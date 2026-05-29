/**
 * App.jsx — Root React component with React Router v7 routes + session state
 *
 * v0.3 adds:
 *   /register → RegisterPage (3-step OTP student registration)
 *   /login    → LoginPage    (2-step OTP student login)
 *   /dashboard → Dashboard  (protected, redirects to /login if no session)
 *
 * Legacy view-based rendering (home/login/register/forgot) is preserved
 * for the old landing-page CTA buttons that still call setCurrentView().
 */

import { useState, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

// ── Auth pages (v0.3 – new OTP-based student auth pages) ─────────────────────
import RegisterPage from './pages/auth/Register'
import LoginPage    from './pages/auth/Login'

// ── Legacy auth sub-components (still used by old view-based rendering) ──────
import OTPInput      from './components/auth/OTPInput'
import StepIndicator from './components/auth/StepIndicator'
import PasswordField from './components/auth/PasswordField'

// ── Auth API functions ─────────────────────────────────────────────────────────
import { sendOTP, verifyOTP, registerUser, loginUser } from './lib/email'

// ── Pages ────────────────────────────────────────────────────────────────────
import Dashboard from './pages/dashboard/Dashboard'

// ─────────────────────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'math_session'

function createSession(user) {
  const session = {
    userId:    user.id,
    email:     user.email,
    name:      user.name,
    createdAt: Date.now(),
    view:      'dashboard',
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    const ageMs   = Date.now() - session.createdAt
    const maxAge  = 7 * 24 * 60 * 60 * 1000
    if (ageMs > maxAge) {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem('math_view')
      return null
    }
    return session
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('math_view')
}

function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Header({ session, onSignOut }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-navy-900/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-teal-400/20">
            <span className="text-navy-950 font-bold text-xl font-display">T</span>
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-cream-100">Tenali</span>
        </div>
        {session ? (
          <div className="flex items-center gap-6">
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-cream-300">
              <a href="#" className="hover:text-teal-400 transition-colors">Courses</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Puzzles</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Leaderboard</a>
            </nav>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">Welcome</p>
                <p className="text-sm text-cream-100 font-medium">{session.name}</p>
              </div>
              <button onClick={onSignOut} className="p-2.5 hover:bg-coral-400/10 text-coral-400 rounded-xl transition-all group" aria-label="Sign out">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-cream-300 hover:text-teal-400 transition-colors">About</a>
            <div className="h-6 w-px bg-white/10" />
            <button className="text-sm font-semibold text-teal-400 px-4 py-2 hover:bg-teal-400/10 rounded-lg transition-all">Support</button>
          </div>
        )}
      </div>
    </header>
  )
}

function FeatureCard({ title, icon, description, color }) {
  return (
    <div className="bg-navy-900/40 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:border-teal-400/30 transition-all hover:scale-[1.02] group">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-display text-2xl text-cream-100 mb-3 font-semibold">{title}</h3>
      <p className="text-cream-300 leading-relaxed text-sm">{description}</p>
      <button className="mt-6 flex items-center gap-2 text-teal-400 font-semibold text-sm hover:gap-3 transition-all">
        Explore more <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY AUTH FORMS (still used when setCurrentView('login') is called)
// These are wrappers that inject the old view-based auth flow.
// ─────────────────────────────────────────────────────────────────────────────

/** Wraps the old Register component so it can render as a legacy view */
function LegacyRegisterWrapper({ onSwitch, onSuccess }) {
  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Create Account</h2>
        <StepIndicator steps={['Info', 'Verify', 'Security']} currentStep={1} />
      </div>
      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <p className="text-cream-300 text-sm text-center">
          Please use the{' '}
          <a href="/register" className="text-teal-400 font-semibold hover:underline">new registration page</a>
          {' '}for OTP-based sign-up.
        </p>
      </div>
      <p className="text-center text-cream-300 text-sm mt-6">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-teal-400 font-semibold hover:underline">Sign in</button>
      </p>
    </div>
  )
}

/** Wraps the old Login component */
function LegacyLoginWrapper({ onSwitch, onForgot }) {
  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Sign In</h2>
      </div>
      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <p className="text-cream-300 text-sm text-center">
          Please use the{' '}
          <a href="/login" className="text-teal-400 font-semibold hover:underline">new login page</a>
          {' '}for OTP-based sign-in.
        </p>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={onForgot} className="text-sm text-cream-300 hover:text-teal-400 transition-colors">Forgot password?</button>
        <button onClick={onSwitch} className="text-sm text-teal-400 font-semibold hover:underline">Create account</button>
      </div>
    </div>
  )
}

function ForgotPassword({ onBack }) {
  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Reset Password</h2>
        <p className="text-cream-300 text-sm">Contact support to reset your password.</p>
      </div>
      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <button onClick={onBack} className="w-full py-3.5 bg-navy-800 border border-white/10 text-cream-100 rounded-xl font-semibold hover:bg-navy-700 transition-all">
          ← Back to Sign In
        </button>
      </div>
    </div>
  )
}

function Home({ session, onExplore }) {
  return (
    <div className="text-center pt-40 px-6">
      <h1 className="font-display text-5xl text-cream-100 mb-6">Welcome back, {session?.name}!</h1>
      <button onClick={onExplore} className="px-12 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20">
        Go to Dashboard
      </button>
    </div>
  )
}

/**
 * HomeOrDashboard — handles the "/" route.
 * If session exists, redirects to /dashboard.
 * If no session, shows the guest landing page.
 */
function HomeOrDashboard({ session }) {
  if (session) {
    return <Navigate to="/dashboard" replace />
  }
  return <GuestLanding />
}

/** Guest landing page (shown at "/" when not authenticated) */
function GuestLanding() {
  const navigate = useNavigate()
  return (
    <div className="text-center pt-40 px-6">
      <div className="inline-block px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8">Now in Private Beta</div>
      <h1 className="font-display text-7xl md:text-8xl text-cream-100 mb-8 font-bold tracking-tight">
        Hello <span className="text-teal-400">Tenali</span>
      </h1>
      <p className="text-cream-300 text-lg md:text-xl max-w-xl mx-auto mb-12 font-sans font-light leading-relaxed">
        Where mathematics meets beauty. Join the exclusive circle of visual learners today.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/register')}
          className="px-12 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20"
        >
          Create Account
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-12 py-4 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 hover:scale-105 transition-all"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null)
  const [view, setView]       = useState('home')
  const [loading, setLoading] = useState(true)
  const [appError, setAppError] = useState(null)

  useEffect(() => {
    const s = getSession()
    if (s) { setSession(s); setView(s.view || 'home') }
    setLoading(false)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.message && !e.message.includes('sharebx') && !e.message.includes('cssjs') && !e.message.includes('Extension')) {
        console.error('[Window Error]', e.message)
        setAppError(e.message)
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  const handleAuthSuccess = () => {
    const fresh = getSession()
    if (fresh) setSession(fresh)
  }

  const handleSignOut = () => {
    clearSession()
    setSession(null)
    setView('home')
  }

  const setCurrentView = (newView) => {
    localStorage.setItem('math_view', newView)
    setView(newView)
  }

  if (appError) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
        <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-red-400 font-bold text-lg mb-4">Something went wrong</h2>
          <p className="text-cream-300 text-sm mb-6">{appError}</p>
          <button onClick={() => { setAppError(null); clearSession(); setSession(null) }} className="px-6 py-3 bg-teal-400 text-navy-950 font-bold rounded-xl">
            Reload App
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <div className="min-h-screen bg-navy-950 flex flex-col items-center relative overflow-x-hidden">

          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-teal-400 focus:text-navy-950 focus:font-bold focus:rounded-xl focus:shadow-lg">
            Skip to main content
          </a>

          <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-400/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-coral-400/5 blur-[120px] rounded-full pointer-events-none" />

          <Header session={session} onSignOut={handleSignOut} />

          <main id="main-content" aria-label="Tenali main content" className="w-full">

            {/* ── React Router routes (v0.3+) ── */}
            <Routes>
              <Route path="/"                   element={<HomeOrDashboard session={session} />} />
              <Route path="/register"          element={<RegisterPage />} />
              <Route path="/login"              element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={session
                  ? <Dashboard session={session} onSignOut={handleSignOut} />
                  : <Navigate to="/login" replace />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* ── Legacy view-based rendering (old landing page CTAs) ── */}
            {view === 'home' && !session && (
              <div className="text-center pt-40 px-6">
                <div className="inline-block px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8">Now in Private Beta</div>
                <h1 className="font-display text-7xl md:text-8xl text-cream-100 mb-8 font-bold tracking-tight">
                  Hello <span className="text-teal-400">Tenali</span>
                </h1>
                <p className="text-cream-300 text-lg md:text-xl max-w-xl mx-auto mb-12 font-sans font-light leading-relaxed">
                  Where mathematics meets beauty. Join the exclusive circle of visual learners today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setCurrentView('register')} className="px-12 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20">
                    Create Account
                  </button>
                  <button onClick={() => setCurrentView('login')} className="px-12 py-4 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 hover:scale-105 transition-all">
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {view === 'home' && session && (
              <Home session={session} onExplore={() => setCurrentView('dashboard')} />
            )}

            {view === 'dashboard' && session && (
              <Dashboard session={session} onSignOut={handleSignOut} />
            )}

            {view === 'login' && <LegacyLoginWrapper onSwitch={() => setCurrentView('register')} onForgot={() => setCurrentView('forgot')} />}
            {view === 'register' && <LegacyRegisterWrapper onSwitch={() => setCurrentView('login')} onSuccess={() => { handleAuthSuccess(); setCurrentView('dashboard') }} />}
            {view === 'forgot' && <ForgotPassword onBack={() => setCurrentView('login')} />}

          </main>
        </div>
      </BrowserRouter>
    </MotionConfig>
  )
}
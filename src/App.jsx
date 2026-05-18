/**
 * App.jsx — Root React component: handles auth state, session persistence, and view routing
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SESSION ARCHITECTURE                                                     │
 * │                                                                          │
 * │  Session lives in localStorage as a single JSON object:                  │
 * │  { userId, email, name, createdAt, view }                               │
 * │                                                                          │
 * │  SESSION_KEY = 'math_session' (see line ~20)                             │
 * │                                                                          │
 * │  Session is valid for 7 days from creationAt.                           │
 * │  On sign-out: localStorage cleared, view resets to 'home'.              │
 * │                                                                          │
 * │  The 'view' field tracks which screen to show even across page reloads. │
 * │  view values: 'home' | 'dashboard' | 'login' | 'register' | 'forgot'    │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ VIEW ROUTING LOGIC                                                       │
 * │                                                                          │
 * │  view + session together determine what renders:                        │
 * │                                                                          │
 * │  session  │ view          │ renders                                     │
 * │  ────────┼───────────────┼─────────────────────────────                 │
 * │  null     │ 'home'        │ Guest landing page (hero + CTA buttons)     │
 * │  null     │ 'login'       │ Login form                                   │
 * │  null     │ 'register'    │ 3-step Register form                         │
 * │  null     │ 'forgot'      │ ForgotPassword form                          │
 * │  {user}   │ 'home'        │ Home component (redirects to dashboard)     │
 * │  {user}   │ 'dashboard'   │ Dashboard with theorem cards                │
 * │  {user}   │ 'login'       │ Redirected to dashboard                      │
 * │  {user}   │ 'register'    │ Redirected to dashboard                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ AUTH FLOW (OTP-based registration)                                       │
 * │                                                                          │
 * │  Register (3 steps):                                                     │
 * │  Step 1: name + email → sendOTP() → API /api/auth/send-otp             │
 * │  Step 2: 6-digit code    → verifyOTP() → API /api/auth/verify-otp      │
 * │           On success: receives { token } (15-min expiry)                │
 * │  Step 3: password        → registerUser() → API /api/auth/register     │
 * │           Token validated server-side; user inserted into Supabase      │
 * │                                                                          │
 * │  Login: email + password → API /api/auth/login → createSession()        │
 * │  Sign-out: clearSession() → setSession(null) → view='home'              │
 * │                                                                          │
 * │  Bypass accounts: sudarshan.iyengar@vicharanashala.ai etc.             │
 * │  Skip OTP step entirely — go straight to password registration         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @component
 */

import { useState, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'

// ── Auth sub-components ──────────────────────────────────────────────────────
import OTPInput    from './components/auth/OTPInput'
import StepIndicator from './components/auth/StepIndicator'
import PasswordField from './components/auth/PasswordField'

// ── Auth API functions (calls /api/auth/* serverless endpoints) ───────────────
import { sendOTP, verifyOTP, registerUser, loginUser } from './lib/email'

// ── Pages ────────────────────────────────────────────────────────────────────
import Dashboard from './pages/dashboard/Dashboard'

// ─────────────────────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/** localStorage key for the session object */
const SESSION_KEY = 'math_session'

/**
 * Persist a new session to localStorage.
 * Called immediately after a successful login or registration.
 *
 * @param {object} user — { id, email, name } from the auth API response
 */
function createSession(user) {
  const session = {
    userId:    user.id,
    email:     user.email,
    name:      user.name,
    createdAt: Date.now(),   // Used to enforce 7-day session expiry
    view:      'dashboard',  // New sessions always land on the dashboard
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

/**
 * Retrieve and validate the current session from localStorage.
 * Returns null if no session exists or if it is older than 7 days.
 */
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const session = JSON.parse(raw)
    const ageMs   = Date.now() - session.createdAt
    const maxAge  = 7 * 24 * 60 * 60 * 1000

    if (ageMs > maxAge) {
      // Session expired — clean up and return null
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem('math_view')
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Clear all session data from localStorage.
 * Called on sign-out and on app error recovery.
 */
function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('math_view')
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate an email address format.
 * @returns {string|null} error message, or null if valid
 */
function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Header — sticky top navigation bar.
 *
 * Unauthenticated: shows "About" link + Support button (teal).
 * Authenticated:   shows nav links + user name + sign-out button.
 */
function Header({ session, onSignOut }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-navy-900/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-teal-400/20">
            <span className="text-navy-950 font-bold text-xl font-display">T</span>
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-cream-100">Tenali</span>
        </div>

        {session ? (
          /* ── Authenticated nav ── */
          <div className="flex items-center gap-6">
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-cream-300">
              <a href="#" aria-label="Courses" className="hover:text-teal-400 transition-colors">Courses</a>
              <a href="#" aria-label="Puzzles" className="hover:text-teal-400 transition-colors">Puzzles</a>
              <a href="#" aria-label="Leaderboard" className="hover:text-teal-400 transition-colors">Leaderboard</a>
            </nav>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-cream-400 uppercase tracking-widest font-semibold">Welcome</p>
                <p className="text-sm text-cream-100 font-medium">{session.name}</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-2.5 hover:bg-coral-400/10 text-coral-400 rounded-xl transition-all group"
                aria-label="Sign out of Tenali"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* ── Guest nav ── */
          <div className="flex items-center gap-4">
            <a href="#" aria-label="About Tenali" className="text-sm font-medium text-cream-300 hover:text-teal-400 transition-colors">About</a>
            <div className="h-6 w-px bg-white/10" />
            <button aria-label="Get support" className="text-sm font-semibold text-teal-400 px-4 py-2 hover:bg-teal-400/10 rounded-lg transition-all">Support</button>
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * FeatureCard — reusable card for the guest landing page feature section.
 * Props: title, icon (JSX), description, color (CSS class string).
 */
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
// AUTH FORMS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register — 3-step registration form.
 *
 * Step 1: Collect name + email → sendOTP()
 * Step 2: Verify 6-digit code → verifyOTP() → receives { token }
 * Step 3: Set password        → registerUser() → createSession()
 *
 * @prop onSwitch  — called to switch to the Login view
 * @prop onSuccess — called after session is created, parent navigates to dashboard
 */
function Register({ onSwitch, onSuccess }) {
  // current step: 1 = info, 2 = OTP, 3 = password
  const [step, setStep] = useState(1)

  // formData.name, formData.email, formData.password
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  // 6-digit OTP string
  const [otp, setOtp] = useState('')

  // Verification token received from Step 2 (15-min expiry)
  const [verifyToken, setVerifyToken] = useState('')

  // Field-level error messages { name?, email?, otp?, password? }
  const [errors, setErrors] = useState({})

  // UI state: 'idle' | 'loading' | 'error' | 'success'
  const [status, setStatus] = useState('idle')

  // Server error / success message displayed below the form
  const [message, setMessage] = useState('')

  // OTP resend cooldown counter (seconds remaining)
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for the resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // ── Step 1: validate inputs → send OTP via email ────────────────────────
  const handleSendOTP = async () => {
    const nameErr  = !formData.name.trim() ? 'Full name is required' : null
    const emailErr = validateEmail(formData.email)
    if (nameErr || emailErr) { setErrors({ name: nameErr, email: emailErr }); return }

    setStatus('loading')
    const result = await sendOTP(formData.email)
    if (result.error) { setStatus('error'); setMessage(result.error.message) }
    else {
      setStatus('idle')
      setStep(2)
      setCooldown(30)  // Start 30-second cooldown before resend is allowed
      setOtp('')
      setErrors({})
    }
  }

  // ── Step 2: verify OTP → receive short-lived token ─────────────────────
  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter the complete code' }); return }
    setStatus('loading')
    const result = await verifyOTP(formData.email, otp)
    if (result.error) { setStatus('error'); setErrors({ otp: result.error.message }) }
    else { setVerifyToken(result.data.token); setStep(3); setStatus('idle'); setErrors({}) }
  }

  // ── Step 3: create account with password ─────────────────────────────────
  const handleRegister = async () => {
    if (formData.password.length < 6) { setErrors({ password: 'Password must be at least 6 characters' }); return }
    setStatus('loading')
    const result = await registerUser({ ...formData, token: verifyToken })
    if (result.error) { setStatus('error'); setMessage(result.error.message) }
    else {
      createSession(result.data.user)
      setStatus('success')
      setTimeout(() => onSuccess(), 1500)  // Brief success state before redirect
    }
  }

  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Create Account</h2>
        <StepIndicator steps={['Info', 'Verify', 'Security']} currentStep={step} />
      </div>

      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

        {/* Step 1: Name + email */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="register-name" className="font-sans text-sm text-cream-200">Full Name <span aria-hidden="true">*</span></label>
              <input
                id="register-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Priya Sharma"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'register-name-error' : undefined}
                className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.name ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`}
              />
              {errors.name && <p id="register-name-error" role="alert" className="text-coral-400 text-xs">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="register-email" className="font-sans text-sm text-cream-200">Email Address <span aria-hidden="true">*</span></label>
              <input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@example.com"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.email ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`}
              />
              {errors.email && <p id="register-email-error" role="alert" className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button
              onClick={handleSendOTP}
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold transition-all shadow-lg shadow-teal-400/20"
            >
              {status === 'loading' ? 'Sending...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 2: OTP verification */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <button onClick={() => setStep(1)} aria-label="Go back to previous step" className="text-cream-300 text-sm hover:text-teal-400 self-start">← Back</button>
            <div className="text-center">
              <p className="text-cream-300 text-sm">Code sent to {formData.email}</p>
            </div>
            <OTPInput
              value={otp}
              onChange={v => { setOtp(v); setErrors({}) }}
              error={errors.otp}
            />
            <button
              onClick={handleVerify}
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20"
            >
              {status === 'loading' ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-cream-100 text-lg font-medium text-center">Set Your Password</h3>
            <PasswordField
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              label="New Password"
            />
            <button
              onClick={handleRegister}
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20"
            >
              {status === 'loading' ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        )}

        {status === 'error' && message && (
          <p className="text-coral-400 text-sm text-center mt-4">{message}</p>
        )}
      </div>

      <p className="text-center text-cream-300 text-sm mt-6">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-teal-400 font-semibold hover:underline">Sign in</button>
      </p>
    </div>
  )
}

/**
 * Login — email + password authentication form.
 *
 * @prop onSwitch  — switch to Register view
 * @prop onSuccess — called with no args after session is created; parent re-reads session
 * @prop onForgot  — switch to ForgotPassword view
 */
function Login({ onSwitch, onSuccess, onForgot }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const emailErr = validateEmail(formData.email)
    if (emailErr) { setErrors({ email: emailErr }); return }

    setStatus('loading')
    const result = await loginUser(formData)
    if (result.error) { setStatus('error'); setMessage(result.error.message) }
    else { createSession(result.data.user); onSuccess() }
  }

  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Sign In</h2>
      </div>
      <form onSubmit={handleSubmit} className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="font-sans text-sm text-cream-200">Email Address <span aria-hidden="true">*</span></label>
          <input
            id="login-email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="priya@example.com"
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.email ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`}
          />
          {errors.email && <p id="login-email-error" role="alert" className="text-coral-400 text-xs">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="font-sans text-sm text-cream-200">Password <span aria-hidden="true">*</span></label>
          <input
            id="login-password"
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-required="true"
            className="w-full px-4 py-3 bg-navy-800/50 border-2 border-navy-700 focus:border-teal-400 rounded-lg font-sans text-cream-100 outline-none transition-all focus:ring-2 focus:ring-teal-400/30"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold transition-all shadow-lg shadow-teal-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
        {status === 'error' && message && (
          <p role="alert" className="text-coral-400 text-sm text-center">{message}</p>
        )}
      </form>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onForgot} className="text-sm text-cream-300 hover:text-teal-400 transition-colors">Forgot password?</button>
        <button type="button" onClick={onSwitch} className="text-sm text-teal-400 font-semibold hover:underline">Create account</button>
      </div>
    </div>
  )
}

/**
 * ForgotPassword — placeholder for password reset flow.
 * Currently shows a simple back button. Integration needed for real password reset.
 */
function ForgotPassword({ onBack }) {
  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Reset Password</h2>
        <p className="text-cream-300 text-sm">Contact support to reset your password.</p>
      </div>
      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-navy-800 border border-white/10 text-cream-100 rounded-xl font-semibold hover:bg-navy-700 transition-all"
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  )
}

/**
 * Home — post-auth landing page shown when session exists but view='home'.
 * Currently just bounces the user to the dashboard.
 */
function Home({ session, onExplore }) {
  return (
    <div className="text-center pt-40 px-6">
      <h1 className="font-display text-5xl text-cream-100 mb-6">Welcome back, {session?.name}!</h1>
      <button
        onClick={onExplore}
        className="px-12 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null)    // null = not authenticated
  const [view, setView]       = useState('home')  // routing state
  const [loading, setLoading]  = useState(true)   // true while session is being read
  const [appError, setAppError] = useState(null)   // caught errors to show in error boundary

  // ── Initialize: read session from localStorage on mount ───────────────────
  useEffect(() => {
    const s = getSession()
    if (s) {
      setSession(s)
      setView(s.view || 'home')
    }
    setLoading(false)
  }, [])

  // ── Global error handler (captures uncaught JS errors) ────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Filter out known benign errors from browser extensions
      if (e.message && !e.message.includes('sharebx') && !e.message.includes('cssjs') && !e.message.includes('Extension')) {
        console.error('[Window Error]', e.message)
        setAppError(e.message)
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  // ── Auth callbacks ─────────────────────────────────────────────────────────

  /** Re-read session from localStorage after login/register completes */
  const handleAuthSuccess = () => {
    const fresh = getSession()
    if (fresh) setSession(fresh)
  }

  /** Sign out: clear session, reset to home view */
  const handleSignOut = () => {
    clearSession()
    setSession(null)
    setView('home')
  }

  // ── Error boundary ──────────────────────────────────────────────────────────
  if (appError) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
        <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-red-400 font-bold text-lg mb-4">Something went wrong</h2>
          <p className="text-cream-300 text-sm mb-6">{appError}</p>
          <button
            onClick={() => { setAppError(null); clearSession(); setSession(null) }}
            className="px-6 py-3 bg-teal-400 text-navy-950 font-bold rounded-xl"
          >
            Reload App
          </button>
        </div>
      </div>
    )
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Convenience alias: setCurrentView writes both localStorage + state ─────
  const setCurrentView = (newView) => {
    localStorage.setItem('math_view', newView)
    setView(newView)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-navy-950 flex flex-col items-center relative overflow-x-hidden">

      {/* Skip-to-main-content link — visible on focus only, WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-teal-400 focus:text-navy-950 focus:font-bold focus:rounded-xl focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Ambient background glow blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-coral-400/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sticky header */}
      <Header session={session} onSignOut={handleSignOut} />

      {/* ── View routing — all content outlets — aria-label for landmarks ── */}
      <main id="main-content" aria-label="Tenali main content" className="w-full">

      {/* Guest landing page */}
      {view === 'home' && !session && (
        <div className="text-center pt-40 px-6" role="main">
          <div className="inline-block px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8">Now in Private Beta</div>
          <h1 className="font-display text-7xl md:text-8xl text-cream-100 mb-8 font-bold tracking-tight">
            Hello <span className="text-teal-400">Tenali</span>
          </h1>
          <p className="text-cream-300 text-lg md:text-xl max-w-xl mx-auto mb-12 font-sans font-light leading-relaxed">
            Where mathematics meets beauty. Join the exclusive circle of visual learners today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView('register')}
              className="px-12 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20"
            >
              Create Account
            </button>
            <button
              onClick={() => setCurrentView('login')}
              className="px-12 py-4 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 hover:scale-105 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Authenticated home redirect */}
      {view === 'home' && session && (
        <Home session={session} onExplore={() => setCurrentView('dashboard')} />
      )}

      {/* Dashboard */}
      {view === 'dashboard' && session && (
        <Dashboard session={session} onSignOut={handleSignOut} />
      )}

      {/* Login */}
      {view === 'login' && (
        <Login
          onSwitch={() => setCurrentView('register')}
          onSuccess={handleAuthSuccess}
          onForgot={() => setCurrentView('forgot')}
        />
      )}

      {/* Register */}
      {view === 'register' && (
        <Register
          onSwitch={() => setCurrentView('login')}
          onSuccess={() => { handleAuthSuccess(); setCurrentView('dashboard') }}
        />
      )}

      {/* Forgot password */}
      {view === 'forgot' && (
        <ForgotPassword onBack={() => setCurrentView('login')} />
      )}

      </main>
    </div>
    </MotionConfig>
  )
}
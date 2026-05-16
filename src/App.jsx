// ============================================================
// App.jsx — Root application component
// Manages authentication state, session persistence, and
// routing between Home, Login, Register, ForgotPassword, and
// Dashboard views based on user session.
// ============================================================

import { useState, useEffect } from 'react'
import OTPInput from './components/auth/OTPInput'
import StepIndicator from './components/auth/StepIndicator'
import PasswordField from './components/auth/PasswordField'
import { sendOTP, verifyOTP, registerUser, loginUser, resetPassword } from './lib/email'
import Dashboard from './pages/dashboard/Dashboard'

// ─── SESSION MANAGEMENT ─────────────────────────────
// Session stores user identity + current view in a single
// localStorage key. This ensures view and user data are
// always in sync (atomic persistence).
// Session expires after 7 days.

const SESSION_KEY = 'math_session'

function createSession(user) {
  // Initialize session with user data and default view = dashboard
  const session = { userId: user.id, email: user.email, name: user.name, createdAt: Date.now(), view: 'dashboard' }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function getSession() {
  // Retrieve and validate session from localStorage.
  // Returns null if missing or older than 7 days.
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch { return null }
}

function clearSession() {
  // Remove all session data on sign out
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('math_view')
}

// ─── VALIDATION ─────────────────────────────────────
// Email format validator used across login and registration
function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

// ─── COMPONENTS ─────────────────────────────────────

// Header: fixed top bar with logo, navigation, and sign-out
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

        {/* Signed-in view: show user name + sign out */}
        {session ? (
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-cream-300">
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
              <button onClick={onSignOut} className="p-2.5 hover:bg-coral-400/10 text-coral-400 rounded-xl transition-all group" title="Sign out">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Not signed in: show About + Support links */
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-cream-300 hover:text-teal-400 transition-colors">About</a>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex gap-2">
              <button className="text-sm font-semibold text-teal-400 px-4 py-2 hover:bg-teal-400/10 rounded-lg transition-all">Support</button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// FeatureCard: reusable card for home page feature highlights
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

// ─── AUTH VIEWS ─────────────────────────────────────
// Three-step registration: 1) name+email → 2) OTP verify → 3) password set

function Register({ onSwitch, onSuccess }) {
  const [step, setStep] = useState(1)           // 1=info, 2=OTP, 3=password
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [verifyToken, setVerifyToken] = useState('')  // Token from OTP verification
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')  // idle | loading | error | success
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)    // Resend OTP cooldown countdown

  // Countdown timer for OTP resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    const nameErr = !formData.name.trim() ? 'Full name is required' : null
    const emailErr = validateEmail(formData.email)
    if (nameErr || emailErr) { setErrors({ name: nameErr, email: emailErr }); return }
    setStatus('loading')
    const result = await sendOTP(formData.email)
    if (result.error) { setStatus('error'); setMessage(result.error) }
    else { setStatus('idle'); setStep(2); setCooldown(30); setOtp('') }
  }

  // Step 2: Verify OTP code
  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter complete code' }); return }
    setStatus('loading')
    const result = await verifyOTP(formData.email, otp)
    if (result.error) { setStatus('error'); setErrors({ otp: result.error }) }
    else { setVerifyToken(result.data.token); setStep(3); setStatus('idle') }
  }

  // Step 3: Create account with password
  const handleRegister = async () => {
    if (formData.password.length < 6) { setErrors({ password: 'Password must be at least 6 characters' }); return }
    setStatus('loading')
    const result = await registerUser({ ...formData, token: verifyToken })
    if (result.error) { setStatus('error'); setMessage(result.error) }
    else { createSession(result.data.user); setStatus('success'); setTimeout(() => onSuccess(), 1500) }
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
              <label className="font-sans text-sm text-cream-200">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Priya Sharma"
                className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.name ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`} />
              {errors.name && <p className="text-coral-400 text-xs">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm text-cream-200">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="priya@example.com"
                className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.email ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`} />
              {errors.email && <p className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button onClick={handleSendOTP} disabled={status === 'loading'}
              className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold transition-all shadow-lg shadow-teal-400/20">
              {status === 'loading' ? 'Sending...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 2: OTP verification */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <button onClick={() => setStep(1)} className="text-cream-300 text-sm hover:text-teal-400 self-start">← Back</button>
            <div className="text-center"><p className="text-cream-300 text-sm">Code sent to {formData.email}</p></div>
            <OTPInput value={otp} onChange={v => { setOtp(v); setErrors({}) }} error={errors.otp} />
            <button onClick={handleVerify} disabled={status === 'loading'}
              className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20">
              {status === 'loading' ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        )}

        {/* Step 3: Set password */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-cream-100 text-lg font-medium text-center">Set Your Password</h3>
            <PasswordField value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} error={errors.password} label="New Password" />
            <button onClick={handleRegister} disabled={status === 'loading'}
              className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20">
              {status === 'loading' ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        )}

        {status === 'error' && message && <p className="text-coral-400 text-sm text-center mt-4">{message}</p>}
        {status === 'success' && <p className="text-teal-400 text-sm text-center mt-4">Welcome aboard!</p>}
      </div>
      <p className="text-center text-cream-300/60 text-sm mt-6 font-sans">
        Already have an account? <button onClick={onSwitch} className="text-teal-400 font-semibold hover:underline">Sign in</button>
      </p>
    </div>
  )
}

// Login: email + password sign-in
function Login({ onSwitch, onSuccess, onForgot }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const emailErr = validateEmail(formData.email)
    if (emailErr) { setErrors({ email: emailErr }); return }
    if (!formData.password) { setErrors({ password: 'Password is required' }); return }
    setStatus('loading')
    const result = await loginUser(formData)
    if (result.error) { setStatus('error'); setMessage(result.error) }
    else { createSession(result.data.user); setStatus('success'); setTimeout(() => onSuccess(), 1000) }
  }

  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl text-cream-100 mb-2 font-bold">Welcome Back</h2>
        <p className="text-cream-300 font-sans">Sign in to your learning dashboard</p>
      </div>
      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm text-cream-200">Email Address</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="priya@example.com"
            className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.email ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`} />
          {errors.email && <p className="text-coral-400 text-xs">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-sans text-sm text-cream-200">Password</label>
            <button onClick={onForgot} className="text-teal-400/60 text-xs hover:text-teal-400">Forgot?</button>
          </div>
          <PasswordField value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} error={errors.password} />
        </div>
        <button onClick={handleLogin} disabled={status === 'loading'}
          className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-xl font-bold transition-all shadow-lg shadow-teal-400/20">
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
        {status === 'error' && message && <p className="text-coral-400 text-sm text-center">{message}</p>}
      </div>
      <p className="text-center text-cream-300/60 text-sm mt-6 font-sans">
        Don't have an account? <button onClick={onSwitch} className="text-teal-400 font-semibold hover:underline">Create one</button>
      </p>
    </div>
  )
}

// ForgotPassword: 3-step reset — email → OTP → new password
function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')   // OTP verification token
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    const err = validateEmail(email); if (err) return
    setStatus('loading')
    const res = await sendOTP(email)
    if (res.error) { setStatus('error'); setMessage(res.error) }
    else { setStep(2); setStatus('idle') }
  }

  const handleVerify = async () => {
    setStatus('loading')
    const res = await verifyOTP(email, otp)
    if (res.error) { setStatus('error'); setMessage(res.error) }
    else { setToken(res.data.token); setStep(3); setStatus('idle') }
  }

  const handleReset = async () => {
    setStatus('loading')
    const res = await resetPassword({ email, password, token })
    if (res.error) { setStatus('error'); setMessage(res.error) }
    else { setStatus('success'); setTimeout(() => onBack(), 1500) }
  }

  return (
    <div className="w-full max-w-md pt-24">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Reset Password</h2>
        <StepIndicator steps={['Email', 'Verify', 'New Pass']} currentStep={step} />
      </div>
      <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              className="w-full px-4 py-3 bg-navy-800/50 border-2 border-navy-700 rounded-lg text-cream-100 outline-none focus:border-teal-400" />
            <button onClick={handleSendOTP} className="w-full py-3.5 bg-teal-400 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20">Send OTP</button>
            <button onClick={onBack} className="text-cream-300 text-sm mt-2 font-medium hover:text-teal-400">← Back to Login</button>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <OTPInput value={otp} onChange={setOtp} />
            <button onClick={handleVerify} className="w-full py-3.5 bg-teal-400 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20">Verify Code</button>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <PasswordField value={password} onChange={e => setPassword(e.target.value)} label="New Password" />
            <button onClick={handleReset} className="w-full py-3.5 bg-teal-400 text-navy-950 rounded-xl font-bold shadow-lg shadow-teal-400/20">Update Password</button>
          </div>
        )}
        {status === 'error' && message && <p className="text-coral-400 text-sm text-center mt-4">{message}</p>}
        {status === 'success' && <p className="text-teal-400 text-sm text-center mt-4">Password updated! Redirecting...</p>}
      </div>
    </div>
  )
}

// ─── HOME ──────────────────────────────────────────
// Landing page shown to authenticated users (not guests)
// Displays progress summary and quick-resume button

function Home({ session }) {
  return (
    <div className="w-full pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Hero section with animated headline */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400/5 blur-[120px] -z-10 rounded-full" />
          <h1 className="font-display text-7xl md:text-8xl text-cream-100 mb-6 font-bold tracking-tight leading-none">
            Master the <span className="text-teal-400">Beauty</span> <br /> of Mathematics
          </h1>
          <p className="text-cream-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-sans font-light">
            Tenali is an interactive learning platform where logic meets aesthetics.
            Solve puzzles, explore theorems, and visualize complex concepts.
          </p>
        </div>

        {/* Feature cards row */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard title="Logic Puzzles" color="bg-amber-400/20 text-amber-400"
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4v14a2 2 0 002 2h12a2 2 0 002-2v-5M9 20l-2-2V6l2-2m4.5 2.5l5 5L13 16" /></svg>}
            description="Challenge your mind with curated mathematical enigmas designed to test your critical thinking." />
          <FeatureCard title="Interactive Theory" color="bg-teal-400/20 text-teal-400"
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            description="Don't just read about theorems—experience them through dynamic visualizations." />
          <FeatureCard title="Peer Review" color="bg-coral-400/20 text-coral-400"
            icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            description="Collaborate with other learners and get feedback on your mathematical proofs." />
        </div>

        {/* Progress summary banner */}
        <div className="bg-navy-900/20 backdrop-blur-md border border-white/5 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
              <span className="text-2xl font-bold text-teal-400">{session.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-cream-400 text-xs uppercase tracking-widest font-bold mb-1">Your Progress</p>
              <h4 className="text-cream-100 text-xl font-semibold">Keep going, {session.name.split(' ')[0]}!</h4>
              <p className="text-cream-300 text-sm opacity-60">You've completed 12% of the logic core.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-bold rounded-xl transition-all border border-white/10">My Notebook</button>
            <button className="px-8 py-3.5 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 transition-all shadow-lg shadow-teal-400/20">Resume Learning</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ──────────────────────────────────────
// App orchestrates: session loading, view routing, error boundary,
// and global window error listener for uncaught exceptions.

export default function App() {
  // Session initialized from localStorage on first render
  const [session, setSession] = useState(() => getSession())
  const [loading] = useState(false)
  const [appError, setAppError] = useState(null)

  // View state: 'home' | 'login' | 'register' | 'forgot' | 'dashboard'
  // Derived from session.view when logged in, falls back to localStorage math_view
  const [view, setView] = useState(() => {
    const stored = getSession()
    if (stored?.view) return stored.view
    return localStorage.getItem('math_view') || 'home'
  })

  // Persist view to localStorage (fallback for when no session exists)
  useEffect(() => { localStorage.setItem('math_view', view) }, [view])

  // Sync view when session changes (e.g. after login, session.view='dashboard' becomes available)
  useEffect(() => {
    if (session?.view && session.view !== view) {
      setView(session.view)
    }
  }, [session])

  // Update view by writing to session atomically
  const setCurrentView = (newView) => {
    const fresh = getSession()
    if (fresh) {
      const updated = { ...fresh, view: newView }
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
      setSession(updated)
    } else {
      // No session — update view directly (e.g. home → login/register)
      setView(newView)
    }
  }

  // Global error listener: catch uncaught exceptions and show error screen
  // Ignores errors from browser extensions and known third-party scripts
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

  // Loading screen while checking session
  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Error boundary: show friendly error message with reload button
  if (appError) return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
      <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-red-400 font-bold text-lg mb-4">Something went wrong</h2>
        <p className="text-cream-300 text-sm mb-6">{appError}</p>
        <button onClick={() => { setAppError(null); clearSession(); setSession(null) }}
          className="px-6 py-3 bg-teal-400 text-navy-950 font-bold rounded-xl">Reload App</button>
      </div>
    </div>
  )

  // Main render: background decorations + routed view
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center relative overflow-x-hidden">
      {/* Ambient background glow blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-coral-400/5 blur-[120px] rounded-full pointer-events-none" />

      <Header session={session} onSignOut={handleSignOut} />

      {/* Routes: determine which view component to show based on auth + view state */}
      {view === 'home' && session && <Home session={session} onExplore={() => setCurrentView('dashboard')} />}
      {view === 'home' && !session && (
        /* Guest landing page */
        <div className="text-center pt-40 px-6">
          <div className="inline-block px-4 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full text-teal-400 text-sm font-semibold mb-8">Now in Private Beta</div>
          <h1 className="font-display text-7xl md:text-8xl text-cream-100 mb-8 font-bold tracking-tight">Hello <span className="text-teal-400">Tenali</span></h1>
          <p className="text-cream-300 text-lg md:text-xl max-w-xl mx-auto mb-12 font-sans font-light leading-relaxed">
            Where mathematics meets beauty. Join the exclusive circle of visual learners today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setCurrentView('register')}
              className="px-12 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-xl shadow-teal-400/20">Create Account</button>
            <button onClick={() => setCurrentView('login')}
              className="px-12 py-4 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 hover:scale-105 transition-all">Sign In</button>
          </div>
        </div>
      )}
      {view === 'dashboard' && session && <Dashboard session={session} onSignOut={handleSignOut} />}
      {view === 'login' && <Login onSwitch={() => setCurrentView('register')} onSuccess={handleAuthSuccess} onForgot={() => setCurrentView('forgot')} />}
      {view === 'register' && <Register onSwitch={() => setCurrentView('login')} onSuccess={() => { handleAuthSuccess(); setCurrentView('dashboard') }} />}
      {view === 'forgot' && <ForgotPassword onBack={() => setCurrentView('login')} />}
    </div>
  )
}
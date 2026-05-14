import { useState, useEffect, useCallback } from 'react'
import OTPInput from './components/auth/OTPInput'
import StepIndicator from './components/auth/StepIndicator'
import PasswordField from './components/auth/PasswordField'
import { sendOTP, verifyOTP, registerUser, loginUser, resetPassword } from './lib/email'

// ─── SESSION MANAGEMENT ─────────────────────────────
const SESSION_KEY = 'math_session'

function createSession(user) {
  const session = { userId: user.id, email: user.email, name: user.name, createdAt: Date.now() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function getSession() {
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

function clearSession() { localStorage.removeItem(SESSION_KEY) }

// ─── VALIDATION ─────────────────────────────────────
function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

// ─── REGISTER ───────────────────────────────────────
function Register({ onSwitch, onSuccess }) {
  const [step, setStep] = useState(1) // 1: Info, 2: OTP, 3: Password
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleSendOTP = async () => {
    const nameErr = !formData.name.trim() ? 'Full name is required' : null
    const emailErr = validateEmail(formData.email)
    if (nameErr || emailErr) { setErrors({ name: nameErr, email: emailErr }); return }

    setStatus('loading')
    const result = await sendOTP(formData.email)
    if (result.error) { setStatus('error'); setMessage(result.error) }
    else { setStatus('idle'); setStep(2); setCooldown(30); setOtp('') }
  }

  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter complete code' }); return }
    setStatus('loading')
    const result = await verifyOTP(formData.email, otp)
    if (result.error) { setStatus('error'); setErrors({ otp: result.error }) }
    else { setVerifyToken(result.data.token); setStep(3); setStatus('idle') }
  }

  const handleRegister = async () => {
    if (formData.password.length < 6) { setErrors({ password: 'Password must be at least 6 characters' }); return }
    setStatus('loading')
    const result = await registerUser({ ...formData, token: verifyToken })
    if (result.error) { setStatus('error'); setMessage(result.error) }
    else {
      createSession(result.data.user)
      setStatus('success')
      setTimeout(() => onSuccess(), 1500)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Create Account</h2>
        <StepIndicator steps={['Info', 'Verify', 'Security']} currentStep={step} />
      </div>

      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm text-cream-200">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Priya Sharma" 
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.name ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`} />
              {errors.name && <p className="text-coral-400 text-xs">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm text-cream-200">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="priya@example.com" 
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.email ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`} />
              {errors.email && <p className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button onClick={handleSendOTP} disabled={status === 'loading'} className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-lg font-semibold transition-all">
              {status === 'loading' ? 'Sending...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <button onClick={() => setStep(1)} className="text-cream-300 text-sm hover:text-teal-400">← Back</button>
            <div className="text-center">
              <p className="text-cream-300 text-sm">Code sent to {formData.email}</p>
            </div>
            <OTPInput value={otp} onChange={v => { setOtp(v); setErrors({}) }} error={errors.otp} />
            <button onClick={handleVerify} disabled={status === 'loading'} className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-lg font-semibold">
              {status === 'loading' ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-cream-100 text-lg font-medium text-center">Set Your Password</h3>
            <PasswordField value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} error={errors.password} label="New Password" />
            <button onClick={handleRegister} disabled={status === 'loading'} className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-lg font-semibold">
              {status === 'loading' ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        )}
        {status === 'error' && message && <p className="text-coral-400 text-sm text-center mt-4">{message}</p>}
        {status === 'success' && <p className="text-teal-400 text-sm text-center mt-4">Welcome aboard!</p>}
      </div>
      <p className="text-center text-cream-300/60 text-sm mt-6">Already have an account? <button onClick={onSwitch} className="text-teal-400 hover:underline">Sign in</button></p>
    </div>
  )
}

// ─── LOGIN ─────────────────────────────────────────
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
    else {
      createSession(result.data.user)
      setStatus('success')
      setTimeout(() => onSuccess(), 1000)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Welcome Back</h2>
        <p className="text-cream-300">Sign in with your credentials</p>
      </div>

      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm text-cream-200">Email Address</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="priya@example.com"
            className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 outline-none ${errors.email ? 'border-coral-400' : 'border-navy-700 focus:border-teal-400'}`} />
          {errors.email && <p className="text-coral-400 text-xs">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-sans text-sm text-cream-200">Password</label>
            <button onClick={onForgot} className="text-teal-400/60 text-xs hover:text-teal-400">Forgot?</button>
          </div>
          <PasswordField value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} error={errors.password} />
        </div>
        <button onClick={handleLogin} disabled={status === 'loading'} className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 text-navy-950 rounded-lg font-semibold">
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
        {status === 'error' && message && <p className="text-coral-400 text-sm text-center">{message}</p>}
      </div>
      <p className="text-center text-cream-300/60 text-sm mt-6">Don't have an account? <button onClick={onSwitch} className="text-teal-400 hover:underline">Create one</button></p>
    </div>
  )
}

// ─── FORGOT PASSWORD ───────────────────────────────
function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    const err = validateEmail(email); if (err) return;
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Reset Password</h2>
        <StepIndicator steps={['Email', 'Verify', 'New Pass']} currentStep={step} />
      </div>
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 bg-navy-800 border-2 border-navy-700 rounded-lg text-cream-100" />
            <button onClick={handleSendOTP} className="w-full py-3.5 bg-teal-400 text-navy-950 rounded-lg font-semibold">Send OTP</button>
            <button onClick={onBack} className="text-cream-300 text-sm mt-2">← Back to Login</button>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <OTPInput value={otp} onChange={setOtp} />
            <button onClick={handleVerify} className="w-full py-3.5 bg-teal-400 text-navy-950 rounded-lg font-semibold">Verify</button>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <PasswordField value={password} onChange={e => setPassword(e.target.value)} label="New Password" />
            <button onClick={handleReset} className="w-full py-3.5 bg-teal-400 text-navy-950 rounded-lg font-semibold">Update Password</button>
          </div>
        )}
        {status === 'error' && message && <p className="text-coral-400 text-sm text-center mt-4">{message}</p>}
        {status === 'success' && <p className="text-teal-400 text-sm text-center mt-4">Password updated! Redirecting...</p>}
      </div>
    </div>
  )
}

// ─── HOME ──────────────────────────────────────────
function Home({ session, onSignOut }) {
  return (
    <div className="text-center">
      <h1 className="font-display text-5xl text-teal-400 mb-4">Hello Tenali</h1>
      <p className="text-cream-300 mb-8">Mathematics meets beauty</p>
      <div className="mb-8 p-6 bg-navy-900 rounded-2xl border border-navy-700 inline-block text-left shadow-2xl">
        <p className="text-cream-400 text-sm mb-1 uppercase tracking-widest">Account Active</p>
        <p className="text-cream-100 font-medium text-xl mb-1">{session.name}</p>
        <p className="text-teal-400/80 text-sm">{session.email}</p>
      </div>
      <div className="flex justify-center"><button onClick={onSignOut} className="px-10 py-3.5 border-2 border-coral-400 text-coral-400 font-semibold rounded-xl hover:bg-coral-400/10 transition-all">Sign Out</button></div>
    </div>
  )
}

// ─── MAIN APP ──────────────────────────────────────
export default function App() {
  const [view, setView] = useState('home') // home | register | login | forgot
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getSession()
    setSession(stored)
    setLoading(false)
  }, [])

  const handleAuthSuccess = () => {
    setSession(getSession())
    setView('home')
  }

  if (loading) return <div className="min-h-screen bg-navy-950 flex items-center justify-center text-cream-300">Loading...</div>

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      {view === 'home' && session && <Home session={session} onSignOut={() => { clearSession(); setSession(null); setView('login') }} />}
      {view === 'home' && !session && (
        <div className="text-center">
          <h1 className="font-display text-6xl text-teal-400 mb-6">Hello Tenali</h1>
          <p className="text-cream-300 text-lg mb-10">Mathematics meets beauty</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setView('register')} className="px-10 py-4 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 hover:scale-105 transition-all shadow-lg">Create Account</button>
            <button onClick={() => setView('login')} className="px-10 py-4 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 hover:scale-105 transition-all">Sign In</button>
          </div>
        </div>
      )}
      {view === 'register' && <Register onSwitch={() => setView('login')} onSuccess={handleAuthSuccess} />}
      {view === 'login' && <Login onSwitch={() => setView('register')} onSuccess={handleAuthSuccess} onForgot={() => setView('forgot')} />}
      {view === 'forgot' && <ForgotPassword onBack={() => setView('login')} />}
    </div>
  )
}
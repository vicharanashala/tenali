import { useState, useEffect } from 'react'
import OTPInput from './components/auth/OTPInput'
import ResendTimer from './components/auth/ResendTimer'
import StepIndicator from './components/auth/StepIndicator'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'

// ─── HELPERS ──────────────────────────────────────
function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

// ─── REGISTER ─────────────────────────────────────
function Register({ onSwitch }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ fullName: '', email: '' })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    const nameErr = !formData.fullName.trim() ? 'Full name is required' : null
    const emailErr = validateEmail(formData.email)
    if (nameErr || emailErr) { setErrors({ fullName: nameErr, email: emailErr }); return }

    setStatus('loading')
    setErrors({})

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('idle')
      setStep(2)
    }
  }

  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter complete 6-digit code' }); return }
    setStatus('loading')

    const { error } = await supabase.auth.verifyOTP(formData.email, otp)

    if (error) {
      setStatus('error')
      setErrors({ otp: 'Invalid code. Please try again.' })
      setOtp('')
    } else {
      setStatus('success')
      // Insert user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').upsert({ id: user.id, name: formData.fullName, email: formData.email }, { onConflict: 'id' })
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Create Account</h2>
        <p className="font-sans text-cream-300">{step === 1 ? 'Enter your details to get started' : 'We sent a code to your email'}</p>
      </div>

      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl">
        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-name" className="font-sans text-sm text-cream-200">Full Name</label>
              <input id="reg-name" type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Priya Sharma" autoComplete="name"
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.fullName ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`} />
              {errors.fullName && <p role="alert" className="text-coral-400 text-xs">{errors.fullName}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email" className="font-sans text-sm text-cream-200">Email Address</label>
              <input id="reg-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="priya@example.com" autoComplete="email"
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.email ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`} />
              {errors.email && <p role="alert" className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button type="button" onClick={handleSendOTP} disabled={status === 'loading'}
              className={`w-full py-3.5 rounded-lg font-sans font-semibold text-navy-950 transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-teal-400/50 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300'}`}>
              {status === 'loading' ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</> : 'Continue'}
            </button>
            {status === 'error' && message && <p role="alert" className="text-coral-400 text-sm text-center">{message}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <button type="button" onClick={() => { setStep(1); setOtp(''); setErrors({}) }} className="flex items-center gap-1 text-cream-300 hover:text-teal-400 font-sans text-sm self-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back
            </button>
            <div className="text-center">
              <p className="text-cream-300 text-sm mb-1">Verifying</p>
              <p className="text-cream-100 text-lg font-medium">{formData.email}</p>
            </div>
            <OTPInput value={otp} onChange={v => { setOtp(v); setErrors({}) }} error={errors.otp} disabled={status === 'loading'} />
            <ResendTimer onResend={() => { setOtp(''); setErrors({}) }} cooldownSeconds={30} />
            <button type="button" onClick={handleVerify} disabled={status === 'loading' || otp.length < 6}
              className={`w-full py-3.5 rounded-lg font-sans font-semibold text-navy-950 transition-all flex items-center justify-center gap-2 ${status === 'loading' || otp.length < 6 ? 'bg-teal-400/50 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300'}`}>
              {status === 'loading' ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying...</> : 'Verify & Continue'}
            </button>
            {status === 'success' && <div className="flex items-center justify-center gap-2 text-teal-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span className="text-sm">Account created!</span></div>}
          </div>
        )}
      </div>

      <p className="text-center text-cream-300/60 text-sm font-sans mt-6">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-teal-400 hover:text-teal-300 hover:underline">Sign in</button>
      </p>
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────
function Login({ onSwitch }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    const emailErr = validateEmail(email)
    if (emailErr) { setErrors({ email: emailErr }); return }

    setStatus('loading')
    setErrors({})

    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('idle')
      setStep(2)
    }
  }

  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter complete 6-digit code' }); return }
    setStatus('loading')

    const { error } = await supabase.auth.verifyOTP(email, otp)

    if (error) {
      setStatus('error')
      setErrors({ otp: 'Invalid code. Please try again.' })
      setOtp('')
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl text-cream-100 mb-2">Welcome Back</h2>
        <p className="font-sans text-cream-300">{step === 1 ? 'Sign in to continue' : 'Enter the code we sent'}</p>
      </div>
      <div className="mb-6"><StepIndicator steps={['Email', 'Verification']} currentStep={step} /></div>

      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl">
        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="font-sans text-sm text-cream-200">Email Address</label>
              <input id="login-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({}) }} placeholder="priya@example.com" autoComplete="email"
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.email ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`} />
              {errors.email && <p role="alert" className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button type="button" onClick={handleSendOTP} disabled={status === 'loading'}
              className={`w-full py-3.5 rounded-lg font-sans font-semibold text-navy-950 transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-teal-400/50 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300'}`}>
              {status === 'loading' ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</> : 'Continue'}
            </button>
            {status === 'error' && message && <p role="alert" className="text-coral-400 text-sm text-center">{message}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <button type="button" onClick={() => { setStep(1); setOtp(''); setErrors({}) }} className="flex items-center gap-1 text-cream-300 hover:text-teal-400 font-sans text-sm self-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back
            </button>
            <div className="text-center">
              <p className="text-cream-300 text-sm mb-1">Code sent to</p>
              <p className="text-cream-100 text-lg font-medium">{email}</p>
            </div>
            <OTPInput value={otp} onChange={v => { setOtp(v); setErrors({}) }} error={errors.otp} disabled={status === 'loading'} />
            <ResendTimer onResend={() => { setOtp(''); setErrors({}) }} cooldownSeconds={30} />
            <button type="button" onClick={handleVerify} disabled={status === 'loading' || otp.length < 6}
              className={`w-full py-3.5 rounded-lg font-sans font-semibold text-navy-950 transition-all flex items-center justify-center gap-2 ${status === 'loading' || otp.length < 6 ? 'bg-teal-400/50 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300'}`}>
              {status === 'loading' ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying...</> : 'Sign In'}
            </button>
            {status === 'success' && <div className="flex items-center justify-center gap-2 text-teal-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span className="text-sm">Signed in!</span></div>}
          </div>
        )}
      </div>

      <p className="text-center text-cream-300/60 text-sm font-sans mt-6">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-teal-400 hover:text-teal-300 hover:underline">Create one</button>
      </p>
    </div>
  )
}

// ─── HOME ─────────────────────────────────────────
function Home({ user, onSignOut }) {
  return (
    <div className="text-center">
      <h1 className="font-display text-5xl text-teal-400 mb-4">Hello Tenali</h1>
      <p className="text-cream-300 mb-2">Mathematics meets beauty</p>
      {user && <p className="text-cream-400/60 text-sm mb-4">Signed in as {user.email}</p>}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={onSignOut} className="px-8 py-3 border-2 border-coral-400 text-coral-400 font-semibold rounded-lg hover:bg-coral-400/10 transition-colors">Sign Out</button>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────
export default function App() {
  const [view, setView] = useState('home') // home | register | login
  const [authChecked, setAuthChecked] = useState(false)
  const { user, loading } = useAuth()

  // Wait for auth check on mount
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true)
      if (!user) setView('login')
    }
  }, [loading, user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setView('login')
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cream-300">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span className="font-sans">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      {view === 'home' && <Home user={user} onSignOut={handleSignOut} />}
      {view === 'register' && <Register onSwitch={() => setView('login')} />}
      {view === 'login' && <Login onSwitch={() => setView('register')} />}
    </div>
  )
}
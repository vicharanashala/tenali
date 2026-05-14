import { useState } from 'react'
import OTPInput from './components/auth/OTPInput'
import ResendTimer from './components/auth/ResendTimer'
import StepIndicator from './components/auth/StepIndicator'

const STEPS = ['Email', 'Verification']

// ─── REGISTER PAGE ───────────────────────────────
function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ fullName: '', email: '' })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateStep1()) {
      setStatus('loading')
      setTimeout(() => { setStatus('idle'); setStep(2) }, 1500)
    }
  }

  const handleVerify = () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter complete 6-digit code' }); return }
    setStatus('loading')
    setTimeout(() => {
      if (otp === '123456') { setStatus('success'); setTimeout(() => setStatus('idle'), 2000) }
      else { setStatus('error'); setErrors({ otp: 'Invalid code. Please try again.' }); setOtp('') }
    }, 1500)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-cream-100 mb-2">Create Account</h1>
        <p className="font-sans text-cream-300">{step === 1 ? 'Enter your details to get started' : 'We sent a code to your email'}</p>
      </div>
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl">
        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="font-sans text-sm text-cream-200">Full Name</label>
              <input id="fullName" type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Priya Sharma" autoComplete="name"
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.fullName ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`} />
              {errors.fullName && <p role="alert" className="text-coral-400 text-xs">{errors.fullName}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email" className="font-sans text-sm text-cream-200">Email Address</label>
              <input id="reg-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="priya@example.com" autoComplete="email"
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.email ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`} />
              {errors.email && <p role="alert" className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button type="button" onClick={handleContinue} disabled={status === 'loading'}
              className={`w-full py-3.5 rounded-lg font-sans font-semibold text-navy-950 transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-teal-400/50 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300'}`}>
              {status === 'loading' ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</> : 'Continue'}
            </button>
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
    </div>
  )
}

// ─── LOGIN PAGE ──────────────────────────────────
function Login() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setState] = useState('idle')

  const validateEmail = () => {
    if (!email.trim()) { setErrors({ email: 'Email is required' }); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: 'Please enter a valid email' }); return false }
    setErrors({}); return true
  }

  const handleSendCode = () => {
    if (!validateEmail()) return
    setState('loading')
    setTimeout(() => { setState('idle'); setStep(2) }, 1500)
  }

  const handleVerify = () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter complete 6-digit code' }); return }
    setState('loading')
    setTimeout(() => {
      if (otp === '123456') { setState('success'); setTimeout(() => setState('idle'), 2000) }
      else { setState('error'); setErrors({ otp: 'Invalid code. Please try again.' }); setOtp('') }
    }, 1500)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl text-cream-100 mb-2">Welcome Back</h1>
        <p className="font-sans text-cream-300">{step === 1 ? 'Sign in to continue' : 'Enter the code we sent'}</p>
      </div>
      <div className="mb-6"><StepIndicator steps={STEPS} currentStep={step} /></div>
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-xl">
        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="font-sans text-sm text-cream-200">Email Address</label>
              <input id="login-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({}) }} placeholder="priya@example.com" autoComplete="email"
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.email ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`} />
              {errors.email && <p role="alert" className="text-coral-400 text-xs">{errors.email}</p>}
            </div>
            <button type="button" onClick={handleSendCode} disabled={status === 'loading'}
              className={`w-full py-3.5 rounded-lg font-sans font-semibold text-navy-950 transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-teal-400/50 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300'}`}>
              {status === 'loading' ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</> : 'Continue'}
            </button>
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
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────
export default function App() {
  const [view, setView] = useState('home') // home | register | login

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      {view === 'home' && (
        <div className="text-center">
          <h1 className="font-display text-5xl text-teal-400 mb-4">Hello Tenali</h1>
          <p className="text-cream-300 mb-8">Mathematics meets beauty</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setView('register')} className="px-8 py-3 bg-teal-400 text-navy-950 font-semibold rounded-lg hover:bg-teal-300 transition-colors">Create Account</button>
            <button onClick={() => setView('login')} className="px-8 py-3 border-2 border-teal-400 text-teal-400 font-semibold rounded-lg hover:bg-teal-400/10 transition-colors">Sign In</button>
          </div>
        </div>
      )}
      {view === 'register' && (
        <div className="w-full">
          <button onClick={() => setView('home')} className="mb-6 flex items-center gap-1 text-cream-300 hover:text-teal-400 font-sans text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back to Home
          </button>
          <Register />
        </div>
      )}
      {view === 'login' && (
        <div className="w-full">
          <button onClick={() => setView('home')} className="mb-6 flex items-center gap-1 text-cream-300 hover:text-teal-400 font-sans text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back to Home
          </button>
          <Login />
        </div>
      )}
    </div>
  )
}
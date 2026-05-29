/**
 * Login.jsx — Student login page (v0.3)
 *
 * 2-step login flow:
 *   Step 1: Email input → Send OTP
 *   Step 2: 6-digit OTP → Sign In
 *
 * No backend dependency — API calls are stubbed with console.log.
 * Redirects to /dashboard on success (future: real auth session).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MotionConfig, motion } from 'framer-motion'

import OTPInput     from '../../components/auth/OTPInput'
import ResendTimer  from '../../components/auth/ResendTimer'
import StepIndicator from '../../components/auth/StepIndicator'

// ── API stubs ───────────────────────────────────────────────────────────────

/** Stub: check if email is registered, then send OTP. */
async function stubSendLoginOTP(email) {
  console.log('[Login] sendLoginOTP called for:', email)
  await new Promise(r => setTimeout(r, 900))
  if (email.includes('unknown') || email.includes('notfound')) {
    return { error: { message: 'No account found with this email. Please register first.' } }
  }
  if (email.includes('invalid')) {
    return { error: { message: 'Please enter a valid email address.' } }
  }
  return { data: { success: true } }
}

/** Stub: verify login OTP and create session. */
async function stubVerifyLoginOTP(email, code) {
  console.log('[Login] verifyLoginOTP called:', { email, code })
  await new Promise(r => setTimeout(r, 700))
  if (code === '000000') {
    return { error: { message: 'Invalid code. Please try again.' } }
  }
  if (code === 'expired') {
    return { error: { message: 'This code has expired. Request a new one.' } }
  }
  return {
    data: {
      user: { id: 'stub-user-id', email, name: 'Returning Student' }
    }
  }
}

// ── Validation ───────────────────────────────────────────────────────────────

function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

// ── Step 1: Email only ──────────────────────────────────────────────────────

function StepEmail({ email, error, onEmailChange, onSubmit, status }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="font-sans text-sm text-cream-200">
          Email Address <span aria-hidden="true" className="text-coral-400">*</span>
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="priya@example.com"
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'login-email-error' : undefined}
          className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-xl font-sans text-cream-100 placeholder:text-cream-300/30 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${error ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`}
        />
        {error && (
          <p id="login-email-error" role="alert" className="text-coral-400 text-xs">{error}</p>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={status === 'loading'}
        className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 disabled:bg-teal-400/50 disabled:cursor-not-allowed text-navy-950 rounded-xl font-bold font-sans transition-all shadow-lg shadow-teal-400/20 hover:scale-[1.01] active:scale-[0.99]"
      >
        {status === 'loading' ? 'Sending Code…' : 'Continue'}
      </button>
    </div>
  )
}

// ── Step 2: OTP ─────────────────────────────────────────────────────────────

function StepOTP({ email, otp, error, onOtpChange, onVerify, onResend, onBack, status }) {
  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="text-cream-300 text-sm hover:text-teal-400 self-start flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <div className="text-center">
        <p className="text-cream-300 font-sans text-sm">
          Code sent to{' '}
          <span className="text-teal-400 font-semibold">{email}</span>
        </p>
        <p className="text-cream-300/60 font-sans text-xs mt-1">Check your inbox and spam folder.</p>
      </div>

      <OTPInput
        value={otp}
        onChange={onOtpChange}
        error={error}
      />

      <button
        onClick={onVerify}
        disabled={status === 'loading' || otp.length < 6}
        className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 disabled:bg-teal-400/50 disabled:cursor-not-allowed text-navy-950 rounded-xl font-bold font-sans transition-all shadow-lg shadow-teal-400/20 hover:scale-[1.01] active:scale-[0.99]"
      >
        {status === 'loading' ? 'Signing In…' : 'Sign In'}
      </button>

      <ResendTimer onResend={onResend} cooldownSeconds={30} />

      {error && (
        <p role="alert" className="text-coral-400 text-sm text-center">{error}</p>
      )}
    </div>
  )
}

// ── Success ───────────────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 py-4"
    >
      <div className="w-20 h-20 bg-teal-400/20 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="font-display text-2xl text-cream-100 mb-1">Welcome back!</h3>
        <p className="text-cream-300 font-sans text-sm">Redirecting to your dashboard…</p>
      </div>
      <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </motion.div>
  )
}

// ── Login page root ─────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate()

  const [step, setStep]   = useState(1)   // 1=email, 2=OTP, 3=success
  const [email, setEmail] = useState('')
  const [otp, setOtp]     = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  // ── Step 1: send OTP ───────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const emailErr = validateEmail(email)
    if (emailErr) { setErrors({ email: emailErr }); return }

    setStatus('loading')
    setErrors({})
    const result = await stubSendLoginOTP(email)
    if (result.error) {
      setStatus('error')
      setMessage(result.error.message)
    } else {
      setStatus('idle')
      setStep(2)
      setOtp('')
      setErrors({})
    }
  }

  // ── Step 2: verify OTP ─────────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter the complete 6-digit code' }); return }
    setStatus('loading')
    const result = await stubVerifyLoginOTP(email, otp)
    if (result.error) {
      setStatus('error')
      setErrors({ otp: result.error.message })
    } else {
      const session = {
        userId:    result.data.user.id,
        email:     result.data.user.email,
        name:      result.data.user.name,
        createdAt: Date.now(),
        view:      'dashboard',
      }
      localStorage.setItem('math_session', JSON.stringify(session))
      setStep(3)
      setTimeout(() => navigate('/dashboard'), 1800)
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    setStatus('loading')
    setOtp('')
    const result = await stubSendLoginOTP(email)
    setStatus('idle')
    if (result.error) setMessage(result.error.message)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-navy-950 flex flex-col items-center relative overflow-x-hidden">

        {/* Ambient glow */}
        <div className="fixed top-[-15%] left-[-15%] w-[50%] h-[50%] bg-teal-400/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-amber-400/5 blur-[140px] rounded-full pointer-events-none" />

        {/* Skip link */}
        <a
          href="#login-form"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-teal-400 focus:text-navy-950 focus:font-bold focus:rounded-xl"
        >
          Skip to form
        </a>

        {/* Logo */}
        <div className="pt-16 pb-6 flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-teal-400/20">
            <span className="text-navy-950 font-bold text-xl font-display">T</span>
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-cream-100">Tenali</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-md px-6 pb-16" id="login-form">
          <div className="text-center mb-6">
            {step < 3 ? (
              <>
                <h1 className="font-display text-3xl text-cream-100 mb-3">Welcome Back</h1>
                <StepIndicator steps={['Email', 'Verify']} currentStep={step} />
              </>
            ) : (
              <h1 className="font-display text-3xl text-cream-100">Signed in!</h1>
            )}
          </div>

          <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {step === 1 && (
              <StepEmail
                email={email}
                error={errors.email}
                onEmailChange={v => { setEmail(v); setErrors({}) }}
                onSubmit={handleSendOTP}
                status={status}
              />
            )}

            {step === 2 && (
              <StepOTP
                email={email}
                otp={otp}
                error={errors.otp}
                onOtpChange={v => { setOtp(v); setErrors({}) }}
                onVerify={handleVerify}
                onResend={handleResend}
                onBack={() => { setStep(1); setErrors({}) }}
                status={status}
              />
            )}

            {step === 3 && <SuccessScreen />}

            {status === 'error' && message && (
              <p role="alert" className="text-coral-400 text-sm text-center mt-4">{message}</p>
            )}
          </div>

          {step < 3 && (
            <p className="text-center text-cream-300 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-400 font-semibold hover:text-teal-300 hover:underline">
                Register
              </Link>
            </p>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}
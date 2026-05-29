/**
 * Register.jsx — Student registration page (v0.3)
 *
 * 3-step registration flow:
 *   Step 1: Full name + email → Send OTP
 *   Step 2: 6-digit OTP verification
 *   Step 3: Password + confirm password → Create Account
 *
 * No backend dependency — API calls are stubbed with console.log.
 * Redirects to /dashboard on success (future: real auth session).
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MotionConfig, motion } from 'framer-motion'

import StepIndicator from '../../components/auth/StepIndicator'
import OTPInput       from '../../components/auth/OTPInput'
import ResendTimer    from '../../components/auth/ResendTimer'
import PasswordField  from '../../components/auth/PasswordField'

// ── API stubs (no backend yet) ─────────────────────────────────────────────

/** Stub: simulate sending OTP to email. */
async function stubSendOTP(email) {
  console.log('[Register] sendOTP called for:', email)
  await new Promise(r => setTimeout(r, 900))
  // Simulate: invalid email for testing
  if (email.includes('invalid')) {
    return { error: { message: 'Delivery failed. Please check your email address.' } }
  }
  return { data: { success: true } }
}

/** Stub: verify OTP code. */
async function stubVerifyOTP(email, code) {
  console.log('[Register] verifyOTP called:', { email, code })
  await new Promise(r => setTimeout(r, 700))
  if (code === '000000') {
    return { error: { message: 'Invalid code. Please try again.' } }
  }
  if (code === 'expired') {
    return { error: { message: 'This code has expired. Request a new one.' } }
  }
  return { data: { token: 'stub-token-' + Date.now() } }
}

/** Stub: create account with password. */
async function stubRegister({ name, email, password, token }) {
  console.log('[Register] registerUser called:', { name, email, token })
  await new Promise(r => setTimeout(r, 800))
  return {
    data: {
      user: { id: 'stub-user-id', email, name }
    }
  }
}

// ── Validation helpers ─────────────────────────────────────────────────────

function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

function validateName(name) {
  if (!name.trim()) return 'Full name is required'
  if (name.trim().length < 2) return 'Name must be at least 2 characters'
  return null
}

function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return null
}

// ── Fade animation wrapper ──────────────────────────────────────────────────

const FadeDiv = ({ children, show }) => (
  <motion.div
    key={show}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
)

// ── Step 1: Name + email ──────────────────────────────────────────────────

function StepInfo({ formData, errors, onChange, onSubmit, status }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Full name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="reg-name" className="font-sans text-sm text-cream-200">
          Full Name <span aria-hidden="true" className="text-coral-400">*</span>
        </label>
        <input
          id="reg-name"
          type="text"
          value={formData.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Priya Sharma"
          autoComplete="name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'reg-name-error' : undefined}
          className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-xl font-sans text-cream-100 placeholder:text-cream-300/30 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.name ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`}
        />
        {errors.name && (
          <p id="reg-name-error" role="alert" className="text-coral-400 text-xs">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="reg-email" className="font-sans text-sm text-cream-200">
          Email Address <span aria-hidden="true" className="text-coral-400">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          value={formData.email}
          onChange={e => onChange({ email: e.target.value })}
          placeholder="priya@example.com"
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'reg-email-error' : undefined}
          className={`w-full px-4 py-3 bg-navy-800/50 border-2 rounded-xl font-sans text-cream-100 placeholder:text-cream-300/30 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${errors.email ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`}
        />
        {errors.email && (
          <p id="reg-email-error" role="alert" className="text-coral-400 text-xs">{errors.email}</p>
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

// ── Step 2: OTP verification ───────────────────────────────────────────────

function StepVerify({ formData, errors, otp, onOtpChange, onVerify, onResend, onBack, status }) {
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
          We sent a code to{' '}
          <span className="text-teal-400 font-semibold">{formData.email}</span>
        </p>
        <p className="text-cream-300/60 font-sans text-xs mt-1">Check your inbox and spam folder.</p>
      </div>

      <OTPInput
        value={otp}
        onChange={onOtpChange}
        error={errors.otp}
      />

      <button
        onClick={onVerify}
        disabled={status === 'loading' || otp.length < 6}
        className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 disabled:bg-teal-400/50 disabled:cursor-not-allowed text-navy-950 rounded-xl font-bold font-sans transition-all shadow-lg shadow-teal-400/20 hover:scale-[1.01] active:scale-[0.99]"
      >
        {status === 'loading' ? 'Verifying…' : 'Verify Code'}
      </button>

      <ResendTimer onResend={onResend} cooldownSeconds={30} />

      {errors.otp && (
        <p role="alert" className="text-coral-400 text-sm text-center">{errors.otp}</p>
      )}
    </div>
  )
}

// ── Step 3: Password ───────────────────────────────────────────────────────

function StepPassword({ formData, errors, onChange, onSubmit, status }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-cream-300 font-sans text-sm">
          Almost there, <span className="text-teal-400 font-semibold">{formData.name.split(' ')[0]}</span>!
        </p>
        <p className="text-cream-300/60 font-sans text-xs mt-1">Create a password to secure your account.</p>
      </div>

      <PasswordField
        id="reg-password"
        value={formData.password}
        onChange={e => onChange({ password: e.target.value })}
        error={errors.password}
        label="Password"
        placeholder="Min. 6 characters"
      />

      <PasswordField
        id="reg-confirm"
        value={formData.confirmPassword}
        onChange={e => onChange({ confirmPassword: e.target.value })}
        error={errors.confirmPassword}
        label="Confirm Password"
        placeholder="Repeat your password"
      />

      <button
        onClick={onSubmit}
        disabled={status === 'loading'}
        className="w-full py-3.5 bg-teal-400 hover:bg-teal-300 disabled:bg-teal-400/50 disabled:cursor-not-allowed text-navy-950 rounded-xl font-bold font-sans transition-all shadow-lg shadow-teal-400/20 hover:scale-[1.01] active:scale-[0.99]"
      >
        {status === 'loading' ? 'Creating Account…' : 'Create Account'}
      </button>
    </div>
  )
}

// ── Success state ───────────────────────────────────────────────────────────

function SuccessScreen({ name }) {
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
        <h3 className="font-display text-2xl text-cream-100 mb-1">Account Created!</h3>
        <p className="text-cream-300 font-sans text-sm">
          Welcome, {name.split(' ')[0]}! Redirecting to your dashboard…
        </p>
      </div>
      <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </motion.div>
  )
}

// ── Register page root ──────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate()

  const [step, setStep]   = useState(1)   // 1=info, 2=verify, 3=password, 4=success
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [otp, setOtp]         = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [errors, setErrors]   = useState({})
  const [status, setStatus]   = useState('idle')  // idle | loading | error | success
  const [message, setMessage] = useState('')

  const updateForm = (patch) => setFormData(prev => ({ ...prev, ...patch }))

  // ── Step 1: send OTP ───────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const nameErr  = validateName(formData.name)
    const emailErr = validateEmail(formData.email)
    if (nameErr || emailErr) { setErrors({ name: nameErr, email: emailErr }); return }

    setStatus('loading')
    setErrors({})
    const result = await stubSendOTP(formData.email)
    if (result.error) {
      setStatus('error')
      setMessage(result.error.message)
    } else {
      setStatus('idle')
      setStep(2)
      setOtp('')
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length < 6) { setErrors({ otp: 'Please enter the complete 6-digit code' }); return }
    setStatus('loading')
    setErrors({})
    const result = await stubVerifyOTP(formData.email, otp)
    if (result.error) {
      setStatus('error')
      setErrors({ otp: result.error.message })
    } else {
      setVerifyToken(result.data.token)
      setStep(3)
      setStatus('idle')
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    setStatus('loading')
    setOtp('')
    const result = await stubSendOTP(formData.email)
    setStatus('idle')
    if (result.error) setMessage(result.error.message)
  }

  // ── Step 3: create account ───────────────────────────────────────────────
  const handleCreateAccount = async () => {
    const pwErr  = validatePassword(formData.password)
    const cpErr  = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (pwErr || cpErr) { setErrors({ password: pwErr, confirmPassword: cpErr }); return }

    setStatus('loading')
    const result = await stubRegister({ name: formData.name, email: formData.email, password: formData.password, token: verifyToken })
    if (result.error) {
      setStatus('error')
      setMessage(result.error.message)
    } else {
      // Stub: create a local session and redirect
      const session = {
        userId:    result.data.user.id,
        email:     result.data.user.email,
        name:      result.data.user.name,
        createdAt: Date.now(),
        view:      'dashboard',
      }
      localStorage.setItem('math_session', JSON.stringify(session))
      setStep(4)
      setTimeout(() => navigate('/dashboard'), 1800)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-navy-950 flex flex-col items-center relative overflow-x-hidden">

        {/* Ambient glow */}
        <div className="fixed top-[-15%] left-[-15%] w-[50%] h-[50%] bg-teal-400/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-amber-400/5 blur-[140px] rounded-full pointer-events-none" />

        {/* Skip link */}
        <a
          href="#register-form"
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
        <div className="w-full max-w-md px-6 pb-16" id="register-form">
          <div className="text-center mb-6">
            {step < 4 ? (
              <>
                <h1 className="font-display text-3xl text-cream-100 mb-3">Create Account</h1>
                <StepIndicator steps={['Info', 'Verify', 'Security']} currentStep={step} />
              </>
            ) : (
              <h1 className="font-display text-3xl text-cream-100">You're all set!</h1>
            )}
          </div>

          <div className="bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {step === 1 && (
              <StepInfo
                formData={formData}
                errors={errors}
                onChange={updateForm}
                onSubmit={handleSendOTP}
                status={status}
              />
            )}

            {step === 2 && (
              <StepVerify
                formData={formData}
                errors={errors}
                otp={otp}
                onOtpChange={v => { setOtp(v); setErrors({}) }}
                onVerify={handleVerify}
                onResend={handleResend}
                onBack={() => { setStep(1); setErrors({}) }}
                status={status}
              />
            )}

            {step === 3 && (
              <StepPassword
                formData={formData}
                errors={errors}
                onChange={updateForm}
                onSubmit={handleCreateAccount}
                status={status}
              />
            )}

            {step === 4 && <SuccessScreen name={formData.name} />}

            {status === 'error' && message && (
              <p role="alert" className="text-coral-400 text-sm text-center mt-4">{message}</p>
            )}
          </div>

          {step < 4 && (
            <p className="text-center text-cream-300 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-400 font-semibold hover:text-teal-300 hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}

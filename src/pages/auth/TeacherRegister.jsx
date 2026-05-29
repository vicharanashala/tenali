import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * TeacherRegister.jsx — Teacher registration page (/teacher/register)
 * FedCM-first, cookie-based fallback + debug logs.
 */
export default function TeacherRegister() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleReady, setGoogleReady] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.warn('[TeacherRegister] VITE_GOOGLE_CLIENT_ID not set')
      return
    }
    let intervalId = setInterval(() => {
      if (window.google?.accounts) { setGoogleReady(true); clearInterval(intervalId) }
    }, 200)
    setTimeout(() => clearInterval(intervalId), 5000)
    return () => clearInterval(intervalId)
  }, [])

  const retryWithCookieBased = () => {
    console.log('[TeacherRegister] FedCM blocked — retrying with cookie-based flow...')
    if (!window.google?.accounts) return
    if (initialized.current) return
    initialized.current = true
    setError('')
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        console.log('[TeacherRegister] Cookie-based callback — response:', response)
        initialized.current = false
        if (!response.credential) { setError('No credential returned. Please try again.'); setLoading(false); return }
        try {
          const res = await fetch('/api/auth/google-login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential, role: 'teacher' }),
          })
          const data = await res.json()
          console.log('[TeacherRegister] Cookie-based API response:', res.status, data)
          if (!res.ok) { setError(data.message || 'Registration failed.'); setLoading(false); return }
          const session = { userId: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role || 'teacher', createdAt: Date.now(), view: 'dashboard', method: 'google' }
          localStorage.setItem('tenali_session', JSON.stringify(session))
          console.log('[TeacherRegister] Cookie-based SUCCESS, redirect: /teacher/dashboard')
          window.location.href = '/teacher/dashboard'
        } catch { setError('Could not connect to server.'); setLoading(false) }
      },
    })
    window.google.accounts.id.prompt()
  }

  const handleGoogleSignIn = () => {
    console.log('[TeacherRegister] Button clicked')
    if (!window.google?.accounts) {
      console.error('[TeacherRegister] FAIL: Google SDK not loaded')
      setError('Google Sign-In is not ready. Please refresh the page.')
      return
    }
    if (initialized.current) { console.warn('[TeacherRegister] Blocked: already initialized'); return }
    initialized.current = true
    setLoading(true)
    setError('')

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      use_fedcm_for_prompt: true,
      callback: async (response) => {
        console.log('[TeacherRegister] Callback fired — response:', response)
        initialized.current = false
        if (!response.credential) { console.error('[TeacherRegister] FAIL: No credential'); setError('No credential returned. Please try again.'); setLoading(false); return }
        console.log('[TeacherRegister] Credential received, calling /api/auth/google-login...')
        try {
          const res = await fetch('/api/auth/google-login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential, role: 'teacher' }),
          })
          const data = await res.json()
          console.log('[TeacherRegister] API response:', res.status, data)
          if (!res.ok) { setError(data.message || 'Registration failed.'); setLoading(false); return }
          const session = { userId: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role || 'teacher', createdAt: Date.now(), view: 'dashboard', method: 'google' }
          localStorage.setItem('tenali_session', JSON.stringify(session))
          console.log('[TeacherRegister] Session stored, redirect: /teacher/dashboard')
          window.location.href = '/teacher/dashboard'
        } catch (err) { console.error('[TeacherRegister] Fetch error:', err); setError('Could not connect to server.'); setLoading(false) }
      },
    })

    window.google.accounts.id.prompt((notification) => {
      if (!notification) { console.warn('[TeacherRegister] FedCM: null notification'); return }
      const notDisplayed = notification.isNotDisplayed?.()
      const skipped = notification.isSkippedMoment?.()
      const optOut = notification.optOutIsDisplayed?.()
      console.warn('[TeacherRegister] FedCM notification:', { notDisplayed, skipped, optOut })
      if (notDisplayed || skipped || optOut) {
        console.error('[TeacherRegister] FedCM BLOCKED — triggering fallback')
        setError('Google sign-in was blocked. Trying a different method...')
        initialized.current = false
        setLoading(false)
        setTimeout(retryWithCookieBased, 500)
      }
    })
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed top-[-15%] left-[-15%] w-[50%] h-[50%] bg-amber-400/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-amber-400/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center rotate-6 shadow-lg shadow-amber-400/20">
            <span className="text-navy-950 font-bold text-3xl font-display">T</span>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-navy-900/60 backdrop-blur-xl border border-amber-400/20 rounded-3xl p-8 shadow-2xl">
          <button onClick={() => navigate('/')} className="mb-6 text-cream-400 text-sm hover:text-amber-400 flex items-center gap-1">← Back</button>
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 text-xs font-semibold mb-4">Teacher</div>
            <h1 className="font-display text-3xl text-cream-100 mb-2 font-bold">Create Teacher Account</h1>
            <p className="text-cream-400 text-sm">Join Tenali and track your students</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>}
          <button onClick={handleGoogleSignIn} disabled={loading || !googleReady}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
            {loading ? 'Signing you up...' : 'Continue with Google'}
          </button>
          <div className="mt-4 text-center text-xs text-cream-500">By continuing, you agree to our{' '}<a href="#" className="text-amber-400 hover:underline">Terms</a> and{' '}<a href="#" className="text-amber-400 hover:underline">Privacy Policy</a></div>
        </motion.div>
        <p className="text-center text-cream-400 text-sm mt-6">Already have an account?{' '}<button onClick={() => navigate('/teacher/login')} className="text-amber-400 font-semibold hover:underline">Sign in as teacher</button></p>
      </div>
    </div>
  )
}
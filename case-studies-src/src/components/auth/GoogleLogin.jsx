import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
  return null
}

export default function GoogleLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [googleInitError, setGoogleInitError] = useState(false)

  useEffect(() => {
    // Poll for Google SDK to be ready
    let attempts = 0
    const maxAttempts = 20

    const checkGoogle = () => {
      attempts++
      if (window.google && window.google.accounts) {
        setGoogleReady(true)
        return
      }
      if (attempts >= maxAttempts) {
        setGoogleInitError(true)
        return
      }
      setTimeout(checkGoogle, 200)
    }

    // Wait for Google Identity Services to load
    const checkInterval = setInterval(() => {
      if (window.google && window.google.accounts) {
        setGoogleReady(true)
        clearInterval(checkInterval)
      }
    }, 200)

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      if (!googleReady) setGoogleInitError(true)
    }, 5000)

    return () => clearInterval(checkInterval)
  }, [])

  const handleGoogleSignIn = () => {
    if (!window.google || !window.google.accounts) {
      setError('Google Sign-In is not ready yet. Please refresh the page.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Opt into FedCM to satisfy Google's mandatory FedCM migration
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        use_fedcm_for_prompt: true,
        callback: async (response) => {
          try {
            // Decode the JWT credential
            const base64Url = response.credential.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
            const userInfo = JSON.parse(jsonPayload)

            const session = {
              userId: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name || userInfo.given_name || 'Student',
              picture: userInfo.picture,
              createdAt: Date.now(),
              view: 'dashboard',
              method: 'google',
            }
            localStorage.setItem('tenali_session', JSON.stringify(session))
            navigate('/dashboard', { replace: true })
          } catch (err) {
            setError('Failed to process sign-in. Please try again.')
            setLoading(false)
          }
        },
      })

      // FedCM uses a different notification format — handle both old GIS and FedCM
      window.google.accounts.id.prompt((notification) => {
        if (!notification) return
        // Old GIS API (deprecated) — still needed for non-FedCM browsers
        if (typeof notification.isNotDisplayed === 'function' && notification.isNotDisplayed()) {
          setError('Google sign-in was not displayed. Please allow cookies or try again.')
          setLoading(false)
          return
        }
        if (typeof notification.isSkippedMoment === 'function' && notification.isSkippedMoment()) {
          setError('Sign-in was skipped. Please try again or allow third-party cookies.')
          setLoading(false)
          return
        }
        // FedCM API — credential is returned in the initialize callback above
      })
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-teal-400 rounded-2xl flex items-center justify-center rotate-6 shadow-lg shadow-teal-400/20">
            <span className="text-navy-950 font-bold text-3xl font-display">T</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="font-display text-3xl text-cream-100 text-center mb-2 font-bold">Welcome to Tenali</h1>
          <p className="text-cream-400 text-center text-sm mb-8">Sign in to continue your math journey</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {googleInitError ? (
            <div className="text-center">
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                Google Sign-In is loading slowly. Please wait or refresh the page.
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 transition-all"
              >
                Reload Page
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || !googleReady}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
          )}

          <div className="mt-6 text-center text-xs text-cream-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-teal-400 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-teal-400 hover:underline">Privacy Policy</a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
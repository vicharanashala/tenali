/**
 * ResendTimer.jsx — Countdown timer with resend OTP button
 *
 * Displays a countdown from `cooldownSeconds` down to 0.
 * When the countdown is active, shows "Resend code in Ns" with a live
 * countdown (aria-live so screen readers announce each tick).
 * When it reaches zero, shows a clickable "Resend OTP" button.
 *
 * @prop onResend         — callback fired when user clicks the resend button
 * @prop cooldownSeconds  — number of seconds to wait before resend is allowed (default 30)
 */

import { useState, useEffect } from 'react'

export default function ResendTimer({ onResend, cooldownSeconds = 30 }) {
  // Seconds remaining on the cooldown timer (0 = resend available)
  const [secondsLeft, setSecondsLeft] = useState(0)

  // Countdown tick effect — decrements once per second
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  // Called when the user clicks "Resend OTP" — resets countdown and fires callback
  const handleResend = () => {
    if (secondsLeft > 0) return  // Guard: button should be disabled when countdown is active
    setSecondsLeft(cooldownSeconds)
    onResend()
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {secondsLeft > 0 ? (
        /* Countdown message — aria-live ensures screen readers announce each tick */
        <p className="text-cream-300 text-sm font-sans">
          Resend code in{' '}
          <span className="font-mono text-amber-400" aria-live="polite">{secondsLeft}s</span>
        </p>
      ) : (
        /* Resend button — enabled once countdown reaches zero */
        <button
          type="button"
          onClick={handleResend}
          className="text-teal-400 text-sm font-sans hover:text-teal-300 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-400/50 rounded transition-colors"
          aria-label="Resend OTP code"
        >
          Resend OTP
        </button>
      )}
    </div>
  )
}
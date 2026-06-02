/**
 * OTPInput.jsx — 6-digit one-time password input component
 *
 * Renders a row of 6 individual character inputs (boxes) that behave
 * like a single logical input. Handles:
 *   - Auto-advance to next box on digit entry
 *   - Backspace navigates to previous box when current is empty
 *   - Arrow key navigation left/right
 *   - Paste a full 6-digit code at once (digits-only validation)
 *   - Visual highlight on focus and on error
 *
 * Accessibility: each box has aria-label, aria-invalid, and the error
 * message uses role="alert" so screen readers announce it.
 *
 * @prop length   — number of OTP digits (default 6)
 * @prop value    — current OTP string (e.g. "123456")
 * @prop onChange — callback(newValue: string) called whenever OTP changes
 * @prop error    — error message string to display below the inputs
 * @prop disabled — when true, all inputs are non-interactive
 */

import { useState, useRef, useEffect } from 'react'

export default function OTPInput({ length = 6, value, onChange, error, disabled }) {
  // Which input box currently has keyboard focus (-1 = none focused)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  // Refs to each individual input DOM element, stored as an array
  const inputRefs = useRef([])

  // When focusedIndex changes, auto-focus the corresponding DOM element
  useEffect(() => {
    if (focusedIndex >= 0 && inputRefs.current[focusedIndex]) {
      inputRefs.current[focusedIndex].focus()
    }
  }, [focusedIndex])

  // ── Handle digit entry ────────────────────────────────────────────────────
  const handleChange = (index, e) => {
    const val = e.target.value

    // Only accept a single character; ignore if user pasted multiple chars
    if (val.length > 1) return

    // Rebuild the OTP string with the new digit at `index`
    const newValue = value.split('')
    newValue[index] = val
    onChange(newValue.join(''))

    // Auto-advance to the next box if user typed a digit
    if (val && index < length - 1) {
      setFocusedIndex(index + 1)
    }
  }

  // ── Handle keyboard navigation ──────────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      // If current box is empty, move focus back before clearing
      if (!value[index] && index > 0) {
        setFocusedIndex(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setFocusedIndex(index + 1)
    } else if (e.key === 'Enter') {
      // Prevent form submission on Enter while in OTP field
      e.preventDefault()
    }
  }

  // ── Handle paste: accept multi-digit paste if all digits ────────────────
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').slice(0, length)
    // Only accept paste if it's purely numeric
    if (/^\d+$/.test(pasted)) {
      onChange(pasted.padEnd(length, ''))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Flex row of individual digit input boxes */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"              // type="text" (not "number") so mobile doesn't show spinner arrows
            inputMode="numeric"      // numeric keyboard on mobile
            maxLength={1}            // only one character per box
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => setFocusedIndex(i)}
            disabled={disabled}
            aria-label={`OTP digit ${i + 1}`}
            aria-invalid={!!error}
            className={`
              w-12 h-14 text-center text-2xl font-mono bg-navy-800 border-2 rounded-lg
              transition-all duration-200 outline-none
              ${error
                ? 'border-coral-400 focus:border-coral-400 focus:ring-2 focus:ring-coral-400/30'
                : focusedIndex === i
                  ? 'border-teal-400 focus:ring-2 focus:ring-teal-400/30'
                  : 'border-navy-700 hover:border-navy-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              text-cream-100
            `}
          />
        ))}
      </div>

      {/* Error message — role="alert" triggers screen reader announcement */}
      {error && (
        <p role="alert" className="text-coral-400 text-sm text-center font-sans">
          {error}
        </p>
      )}
    </div>
  )
}
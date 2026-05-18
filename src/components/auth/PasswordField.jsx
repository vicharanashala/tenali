/**
 * PasswordField.jsx — Password input with show/hide toggle
 *
 * Renders a standard password input with a eye/eye-off toggle button
 * that reveals the typed characters (useful for confirming no typos).
 *
 * @prop id          — id for the <input> and <label> (optional, auto-generated if omitted)
 * @prop value       — current input value
 * @prop onChange    — callback(e: ChangeEvent) for value changes
 * @prop placeholder — placeholder text shown when empty
 * @prop error       — error message string shown below the input
 * @prop label       — label text rendered above the input
 */

import { useState } from 'react'

export default function PasswordField({ id, value, onChange, placeholder, error, label }) {
  // When true, input type is 'text' (characters visible); otherwise 'password'
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {/* Field label (optional — only rendered when prop is provided) */}
      {label && <label htmlFor={id} className="font-sans text-sm text-cream-200">{label}</label>}

      {/* Input + show/hide button wrapped in a relative container */}
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}  // Toggle visibility
          value={value}
          onChange={onChange}
          placeholder={placeholder || '••••••••'}
          className={`w-full px-4 py-3 bg-navy-800 border-2 rounded-lg font-sans text-cream-100 placeholder:text-cream-300/40 outline-none transition-all focus:ring-2 focus:ring-teal-400/30 ${error ? 'border-coral-400' : 'border-navy-700 hover:border-navy-600 focus:border-teal-400'}`}
        />

        {/* Show/hide toggle button — positioned absolute inside the input */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-300/60 hover:text-teal-400 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            /* Eye-off icon (password hidden) */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          ) : (
            /* Eye icon (password visible) */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Error message — role="alert" for screen reader announcement */}
      {error && <p role="alert" className="text-coral-400 text-xs">{error}</p>}
    </div>
  )
}
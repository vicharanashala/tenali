/**
 * StepIndicator.jsx — Multi-step registration progress indicator
 *
 * Renders a horizontal row of numbered step circles connected by
 * divider lines. The current step is highlighted in teal, completed
 * steps show a checkmark, and future steps are dimmed.
 *
 * Uses role="progressbar" and aria-valuenow/min/max for accessibility,
 * though it is display-only (does not enforce or track actual progress).
 *
 * @prop steps       — Array of step label strings, e.g. ['Info', 'Verify', 'Security']
 * @prop currentStep — 1-indexed number of the current step
 */

export default function StepIndicator({ steps, currentStep }) {
  return (
    /* progressbar role signals to assistive tech that this is a progress indicator */
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep   // Previous step — show checkmark
        const isCurrent   = stepNum === currentStep   // Current step — highlighted ring

        return (
          <div key={i} className="flex items-center gap-2">
            {/* Step circle + label */}
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? 'bg-teal-400 text-navy-950'             // Done — solid teal fill + checkmark
                    : isCurrent
                      ? 'bg-teal-400/20 border-2 border-teal-400 text-teal-400'  // Active — teal ring, no fill
                      : 'bg-navy-800 border-2 border-navy-700 text-cream-300/50'  // Future — dimmed
                  }
                `}
                aria-hidden="true"
              >
                {isCompleted ? (
                  /* Checkmark SVG — replaces the step number */
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {/* Label — hidden on small screens to avoid crowding */}
              <span
                className={`
                  text-sm font-sans hidden sm:block
                  ${isCurrent ? 'text-teal-400' : isCompleted ? 'text-cream-100' : 'text-cream-300/50'}
                `}
              >
                {label}
              </span>
            </div>

            {/* Connector line between steps (hidden after the last step) */}
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-teal-400' : 'bg-navy-700'}`}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
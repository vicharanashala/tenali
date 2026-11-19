import React, { useState, useEffect, useRef } from 'react';

const KEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Variable-length numeric code lock with ± sign toggle, keyboard typing,
 * 3x4 mobile touch keypad, shake feedback, and inline attempt tracking.
 */
export default function CodeLockInput({
  roomId,
  onSubmit,
  shakeTrigger = false,
  lastFeedback = null,
  attempts = 0,
  wrongAttempts = 0,
  autoHintTriggered = false,
  disabled = false,
}) {
  const [digits, setDigits] = useState('');
  const [isNegative, setIsNegative] = useState(false);
  const inputRef = useRef(null);

  // Clear code input whenever moving to a new room
  useEffect(() => {
    setDigits('');
    setIsNegative(false);
  }, [roomId]);

  const formattedValue = `${isNegative ? '-' : ''}${digits}`;

  const handleToggleSign = () => {
    if (disabled) return;
    setIsNegative((prev) => !prev);
  };

  const handleAppendDigit = (digit) => {
    if (disabled) return;
    setDigits((prev) => (prev.length >= 6 ? prev : prev + digit));
  };

  const handleBackspace = () => {
    if (disabled) return;
    if (digits.length > 0) {
      setDigits((prev) => prev.slice(0, -1));
    } else if (isNegative) {
      setIsNegative(false);
    }
  };

  const handleInputChange = (event) => {
    if (disabled) return;
    const raw = event.target.value;
    if (raw === '') {
      setDigits('');
      setIsNegative(false);
      return;
    }

    const startsNegative = raw.startsWith('-') || raw.startsWith('−');
    const cleanedDigits = raw.replace(/[^0-9]/g, '').slice(0, 6);
    setIsNegative(startsNegative);
    setDigits(cleanedDigits);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      handleToggleSign();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit(formattedValue);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (disabled) return;
    onSubmit(formattedValue);
  };

  const isErrorState = lastFeedback?.type === 'error';
  const remainingUntilAutoHint = Math.max(0, 3 - wrongAttempts);

  return (
    <form className="code-lock" onSubmit={handleFormSubmit} noValidate>
      <div className="code-lock-label-row">
        <label htmlFor="escape-code-input" className="code-lock-label">
          Enter lock code (use ± for negative):
        </label>
        <span className="code-lock-type">Integer</span>
      </div>

      <div className={`code-lock-controls ${shakeTrigger ? 'is-shaking' : ''}`}>
        <button
          type="button"
          className={`code-sign-btn ${isNegative ? 'code-sign-btn--negative' : ''}`}
          onClick={handleToggleSign}
          disabled={disabled}
          aria-pressed={isNegative}
          aria-label="Toggle positive or negative sign"
          title="Toggle negative sign (±)"
        >
          <span>±</span>
          <span className="code-sign-sub">{isNegative ? 'NEG' : 'SIGN'}</span>
        </button>

        <input
          ref={inputRef}
          id="escape-code-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="?"
          value={formattedValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`code-input-field ${isErrorState ? 'code-input-field--error' : ''}`}
          aria-invalid={isErrorState}
        />

        <button
          type="button"
          className="code-clear-btn"
          onClick={handleBackspace}
          disabled={disabled}
          aria-label="Delete last digit"
          title="Backspace"
        >
          ⌫
        </button>
      </div>

      {lastFeedback && (
        <div
          className={`code-feedback ${
            lastFeedback.type === 'auto-hint'
              ? 'code-feedback--auto-hint'
              : 'code-feedback--error'
          }`}
          role="alert"
        >
          <span aria-hidden="true">
            {lastFeedback.type === 'auto-hint' ? '💡' : '✕'}
          </span>
          <span>{lastFeedback.message}</span>
        </div>
      )}

      {/* Touch-friendly 3x4 keypad shown on mobile & tablet (< 900px) */}
      <div className="touch-keypad" role="group" aria-label="Numeric keypad">
        {KEYPAD_DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            className="keypad-key"
            onClick={() => handleAppendDigit(digit)}
            disabled={disabled}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className="keypad-key"
          onClick={handleToggleSign}
          disabled={disabled}
          aria-label="Toggle negative sign"
        >
          ±
        </button>
        <button
          type="button"
          className="keypad-key"
          onClick={() => handleAppendDigit('0')}
          disabled={disabled}
        >
          0
        </button>
        <button
          type="button"
          className="keypad-key"
          onClick={handleBackspace}
          disabled={disabled}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      <button type="submit" className="btn-primary" disabled={disabled}>
        <span>Try Code</span>
        <span aria-hidden="true">🔒</span>
      </button>

      <p className="code-attempts-caption">
        {attempts === 0
          ? 'Attempt 1 • Auto-hint unlocks after 3 wrong tries'
          : autoHintTriggered
            ? `Attempts: ${attempts} • Hint 1 unlocked below`
            : `Attempts: ${attempts} • ${remainingUntilAutoHint} wrong ${
                remainingUntilAutoHint === 1 ? 'try' : 'tries'
              } until auto-hint`}
      </p>
    </form>
  );
}
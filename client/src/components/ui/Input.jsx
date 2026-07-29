import React from 'react';
import './Input.css';

/**
 * Input component for Tenali.
 * 
 * Supports statuses: 'default', 'error', 'success'
 */
export default function Input({
  className = '',
  status = 'default',
  disabled = false,
  label = '',
  id,
  type = 'text',
  errorText = '',
  ...props
}) {
  const inputClass = [
    'tenali-input',
    `tenali-input--${status}`,
    disabled ? 'tenali-input--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="tenali-input-wrapper">
      {label && id && (
        <label htmlFor={id} className="tenali-input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        disabled={disabled}
        className={inputClass}
        aria-invalid={status === 'error'}
        aria-describedby={status === 'error' && errorText && id ? `${id}-error` : undefined}
        {...props}
      />
      {status === 'error' && errorText && (
        <span id={id ? `${id}-error` : undefined} className="tenali-input-error-msg">
          {errorText}
        </span>
      )}
    </div>
  );
}

import React from 'react';
import './Button.css';

/**
 * Button component for Tenali.
 * 
 * Supports variants: 'primary' (default), 'secondary', 'danger', 'outline'
 * Supports sizes: 'sm', 'md' (default), 'lg'
 */
export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const buttonClass = [
    'tenali-btn',
    `tenali-btn--${variant}`,
    `tenali-btn--${size}`,
    disabled ? 'tenali-btn--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

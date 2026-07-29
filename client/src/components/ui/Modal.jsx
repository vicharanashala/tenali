import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Modal component for Tenali.
 * 
 * Supports isOpen, onClose, and custom header titles.
 */
export default function Modal({
  isOpen = false,
  onClose,
  title = '',
  children,
  footer = null,
  className = ''
}) {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="tenali-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`tenali-modal ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent clicking modal content from closing it
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'tenali-modal-title' : undefined}
      >
        <div className="tenali-modal-header">
          {title && (
            <h3 id="tenali-modal-title" className="tenali-modal-title">
              {title}
            </h3>
          )}
          {onClose && (
            <button
              type="button"
              className="tenali-modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          )}
        </div>
        <div className="tenali-modal-body">{children}</div>
        {footer && <div className="tenali-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

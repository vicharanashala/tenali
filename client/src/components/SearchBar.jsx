import React, { useRef } from 'react';
import './SearchBar.css';

/**
 * SearchBar
 * Reusable stadium-pill search input component with magnifying glass icon,
 * 1-click clear button, and Escape key shortcut.
 */
export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search all Puzzles across all Sections!',
  id,
  className = '',
  autoFocus = false,
  ariaLabel = 'Search puzzles',
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      handleClear();
    }
  };

  return (
    <div className={`search-bar-row ${className}`.trim()}>
      <div className="search-bar-wrapper">
        <svg
          className="search-input-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          id={id}
          ref={inputRef}
          className="search-bar"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
        />

        {value && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

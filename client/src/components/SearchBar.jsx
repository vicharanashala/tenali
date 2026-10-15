import React, { useRef } from 'react';
import './SearchBar.css';

/**
 * SearchBar
 * Reusable search input component with 1-click clear button and Escape key shortcut.
 */
export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search puzzles…',
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

import React, { useState, useEffect } from 'react';
import './SectionFilterModal.css';

/**
 * SectionFilterModal
 * Interactive dialog allowing users to select one or multiple sections to filter the Home grid.
 * Inspired by Aarsh03/Blogs/TagFilterModal.astro.
 */
export default function SectionFilterModal({
  isOpen,
  onClose,
  sections = [],
  activeSections = [],
  onApply,
  counts = {},
}) {
  const [tempSelected, setTempSelected] = useState(activeSections);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const toggleSection = (key) => {
    setTempSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleApply = () => {
    onApply(tempSelected);
    onClose();
  };

  return (
    <div className="section-modal" role="dialog" aria-modal="true" aria-label="Filter by Section">
      <div className="section-modal__backdrop" onClick={onClose} />
      <div className="section-modal__content">
        <div className="section-modal__header">
          <span className="section-modal__title">Filter by Section</span>
          <button className="section-modal__close" onClick={onClose} aria-label="Close filter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="section-modal__body">
          <p className="section-modal__subtitle">Select sections to display in the grid:</p>
          <div className="section-modal__grid">
            {sections.map(({ key, title }) => {
              const isSelected = tempSelected.includes(key);
              const count = counts[key] ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  className={`section-modal-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSection(key)}
                  aria-pressed={isSelected}
                >
                  <span className="section-modal-chip__text">{title}</span>
                  <span className="section-modal-chip__count">{count}</span>
                  <svg
                    className="section-modal-chip__icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div className="section-modal__footer">
          <button type="button" className="section-modal__btn section-modal__btn--secondary" onClick={handleClear}>
            Clear
          </button>
          <button type="button" className="section-modal__btn section-modal__btn--primary" onClick={handleApply}>
            Apply Filters {tempSelected.length > 0 && `(${tempSelected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

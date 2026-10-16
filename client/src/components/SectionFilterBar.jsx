import React, { useState } from 'react';
import SectionFilterModal from './SectionFilterModal';
import './SectionFilterBar.css';

/**
 * SectionFilterBar
 * Filter bar with a trigger button that opens SectionFilterModal, alongside active filter chips.
 * Adapted from the TagFilterModal pattern in Aarsh03/Blogs.
 */
export default function SectionFilterBar({
  sections = [],
  activeSections = [],
  onSelectSections,
  counts = {},
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeSection = (keyToRemove) => {
    onSelectSections(activeSections.filter((key) => key !== keyToRemove));
  };

  const clearAll = () => {
    onSelectSections([]);
  };

  const sectionMap = Object.fromEntries(sections.map((s) => [s.key, s.title]));

  return (
    <>
      <div className="section-filter-bar" aria-label="Filter sections">
        <button
          type="button"
          className="section-filter-trigger"
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isModalOpen}
        >
          <svg
            className="section-filter-trigger__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Filter by Section</span>
          {activeSections.length > 0 && (
            <span className="section-filter-trigger__badge">{activeSections.length}</span>
          )}
        </button>

        {activeSections.length > 0 && (
          <div className="active-sections-container">
            {activeSections.map((key) => (
              <span key={key} className="active-section-chip">
                <span>{sectionMap[key] || key}</span>
                <button
                  type="button"
                  className="active-section-chip__remove"
                  onClick={() => removeSection(key)}
                  aria-label={`Remove filter for ${sectionMap[key] || key}`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
            <button
              type="button"
              className="active-section-clear-all"
              onClick={clearAll}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SectionFilterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sections={sections}
          activeSections={activeSections}
          onApply={onSelectSections}
          counts={counts}
        />
      )}
    </>
  );
}

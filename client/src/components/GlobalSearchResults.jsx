import React from 'react';
import SectionFilterBar from './SectionFilterBar';
import './GlobalSearchResults.css';

/**
 * GlobalSearchResults
 * Renders the global search view across all sections with Option C SectionFilterBar.
 */
export default function GlobalSearchResults({
  search = '',
  filteredResults = [],
  searchCounts = {},
  activeSections = [],
  setActiveSections,
  sections = [],
  renderCard,
  onClearSearch,
  id,
}) {
  return (
    <>
      {/* Option C: Section Filter Bar displayed ONLY when searching across all sections */}
      <SectionFilterBar
        sections={sections}
        activeSections={activeSections}
        onSelectSections={setActiveSections}
        counts={searchCounts}
      />

      <div className="search-results-container" id={id}>
        {filteredResults.length > 0 && (
          <div className="search-results-summary">
            Found {filteredResults.length} {filteredResults.length === 1 ? 'puzzle' : 'puzzles'} matching &quot;{search}&quot;
            {activeSections.length > 0 && ' in selected sections'}
          </div>
        )}

        {sections.map((section) => {
          const sectionApps = filteredResults.filter(
            (app) => (app.category || 'shelf') === section.key
          );
          if (sectionApps.length === 0) return null;

          return (
            <section key={section.key} className="home-section">
              <h2 className="home-section-title">
                {section.icon && <span className="section-title-icon">{section.icon}</span>}
                {section.title}
                <span className="section-match-badge">{sectionApps.length}</span>
              </h2>
              <div className="menu-grid">
                {sectionApps.map(renderCard)}
              </div>
            </section>
          );
        })}

        {filteredResults.length === 0 && (
          <div className="search-empty-state">
            <p>
              No puzzles found matching &quot;{search}&quot;
              {activeSections.length > 0 ? ' in the selected section filter' : ' across any section'}.
            </p>
            <button
              type="button"
              className="search-clear-action-btn"
              onClick={onClearSearch}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </>
  );
}

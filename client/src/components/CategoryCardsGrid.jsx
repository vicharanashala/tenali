import React from 'react';
import './CategoryCardsGrid.css';

/**
 * CategoryCardsGrid
 * Displays the 8 main Category Cards on the Home screen outer view.
 */
export default function CategoryCardsGrid({
  sections = [],
  tiles = [],
  completedTopics = [],
  goldMastery = [],
  isStage3Completed,
  onSelectSection,
  id,
}) {
  return (
    <div className="section-cards-grid" id={id}>
      {sections.map((section) => {
        const sectionTiles = tiles.filter(
          (app) => (app.category || 'shelf') === section.key
        );
        const completedCount = sectionTiles.filter((app) =>
          isStage3Completed ? isStage3Completed(app.key, completedTopics) : false
        ).length;
        const goldCount = sectionTiles.filter(
          (app) => goldMastery && goldMastery.includes(app.key)
        ).length;

        return (
          <button
            key={section.key}
            type="button"
            className={`section-category-card ${section.color || 'blue'}`}
            onClick={() => onSelectSection && onSelectSection(section.key)}
          >
            <div className="section-card-top">
              <span className="section-card-icon">{section.icon}</span>
              <span className="section-card-badge">{sectionTiles.length} Puzzles</span>
            </div>
            <div className="section-card-main">
              <h3 className="section-card-title">{section.title}</h3>
              <p className="section-card-desc">{section.subtitle}</p>
            </div>
            <div className="section-card-footer">
              <div className="section-card-progress">
                {goldCount > 0 && (
                  <span className="progress-pill gold" title="Gold Mastery">
                    🥇 {goldCount}
                  </span>
                )}
                {completedCount > 0 && (
                  <span className="progress-pill completed" title="Completed">
                    ✓ {completedCount}
                  </span>
                )}
                {completedCount === 0 && goldCount === 0 && (
                  <span className="progress-pill muted">0 / {sectionTiles.length} done</span>
                )}
              </div>
              <span className="section-card-cta">Explore →</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

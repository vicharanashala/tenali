import React from 'react';
import './SectionDrilldownView.css';

/**
 * SectionDrilldownView
 * Displays the drilled-down view for a single section with back navigation.
 */
export default function SectionDrilldownView({
  section,
  tiles = [],
  completedTopics = [],
  goldMastery = [],
  isStage3Completed,
  renderCard,
  onBack,
  id,
}) {
  const completedCount = tiles.filter((app) =>
    isStage3Completed ? isStage3Completed(app.key, completedTopics) : false
  ).length;
  const goldCount = tiles.filter(
    (app) => goldMastery && goldMastery.includes(app.key)
  ).length;

  return (
    <div className="section-drilldown-view" id={id}>
      <div className="section-drilldown-header">
        <button
          type="button"
          className="section-back-btn"
          onClick={onBack}
          aria-label="Back to all sections"
        >
          ← All Sections
        </button>
        <div className="section-drilldown-info">
          {section?.icon && <span className="section-drilldown-icon">{section.icon}</span>}
          <div>
            <h2 className="section-drilldown-title">{section?.title}</h2>
            <span className="section-drilldown-subtitle">
              {tiles.length} puzzles
              {completedCount > 0 && ` · ${completedCount} completed`}
              {goldCount > 0 && ` · 🥇 ${goldCount} gold`}
            </span>
          </div>
        </div>
      </div>

      <div className="menu-grid">
        {tiles.map(renderCard)}
      </div>
    </div>
  );
}

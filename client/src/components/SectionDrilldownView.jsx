import React from 'react';
import { calculateSectionProgress } from '../features/progress';
import './SectionDrilldownView.css';

/**
 * SectionDrilldownView
 * Displays the drilled-down view for a single section with left-aligned category info.
 */
export default function SectionDrilldownView({
  section,
  tiles = [],
  completedTopics = [],
  goldMastery = [],
  renderCard,
  id,
}) {
  const { completedCount, goldCount } = calculateSectionProgress(
    tiles,
    completedTopics,
    goldMastery
  );

  return (
    <div className="section-drilldown-view" id={id}>
      <div className="section-drilldown-header">
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

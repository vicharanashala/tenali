import React from 'react';
import { navigate } from '../lib/router';
import './MenuCard.css';

/**
 * MenuCard
 * Renders an individual puzzle card in section drill-down or search results.
 * Follows the Section Category Card layout:
 * - Left-aligned clean title and subtitle
 * - Horizontal footer divider
 * - Number-free badge pills for Completion (✓) and Gold Mastery (🥇)
 * - Clean "Open" CTA button
 */
export default function MenuCard({ app, isCompleted = false, isGold = false, onSelect }) {
  const handleClick = () => {
    if (app.isRedirect) {
      navigate(app.path);
    } else if (onSelect) {
      onSelect(app.key);
    }
  };

  return (
    <button
      type="button"
      className={`topic-menu-card ${isGold ? 'gold-card' : app.color || 'blue'}`}
      onClick={handleClick}
    >
      <div className="topic-card-main">
        <h3 className="topic-card-title">{app.name}</h3>
        <p className="topic-card-desc">{app.subtitle}</p>
      </div>

      <div className="topic-card-footer">
        <div className="topic-card-badges">
          {isCompleted && (
            <span className="topic-badge-pill completed" title="Completed">
              ✓
            </span>
          )}
          {isGold && (
            <span className="topic-badge-pill gold" title="Gold Mastery">
              🥇
            </span>
          )}
        </div>
        <span className="topic-card-cta">Open</span>
      </div>
    </button>
  );
}

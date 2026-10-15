import React, { useState, useRef } from 'react';
import { TILES } from '../features/tiles';
import DailyWarmupCard from './DailyWarmupCard';
import AboutModal from './AboutModal';
import HomeNavMenu from './HomeNavMenu';
import SectionFilterBar from './SectionFilterBar';
import { PmQuestBanner, PmGoalModal, PmHomeSection } from '../PathMap';
import { navigate } from '../lib/router';
import './Home.css';

const API = import.meta.env.VITE_API_BASE_URL || '';

const HOME_SECTIONS = [
  {
    key: 'number-foundations',
    title: 'Number Foundations',
    icon: '🔢',
    subtitle: 'Arithmetic, Fractions, Decimals, Factors & Place Value',
    color: 'blue',
  },
  {
    key: 'everyday-maths',
    title: 'Everyday Maths',
    icon: '🛒',
    subtitle: 'Percentages, Banking, GST, Profit & Loss',
    color: 'green',
  },
  {
    key: 'algebra',
    title: 'Algebra',
    icon: '📐',
    subtitle: 'Linear Equations, Functions, Indices & Polynomials',
    color: 'purple',
  },
  {
    key: 'calculus',
    title: 'Calculus',
    icon: '📈',
    subtitle: 'Differentiation, Integration, Limits & Diff Equations',
    color: 'orange',
  },
  {
    key: 'linear-algebra',
    title: 'Linear Algebra',
    icon: '🧊',
    subtitle: 'Vectors, Matrices, Dot Products & Transformations',
    color: 'blue',
  },
  {
    key: 'shape-space',
    title: 'Shape & Space',
    icon: '⭕',
    subtitle: 'Angles, Triangles, GeoCraft, Circles & Symmetry',
    color: 'purple',
  },
  {
    key: 'data-chance',
    title: 'Data & Chance',
    icon: '🎲',
    subtitle: 'Probability, Statistics & Combinatorics',
    color: 'green',
  },
  {
    key: 'shelf',
    title: 'Puzzles & Play',
    icon: '🧩',
    subtitle: 'Detective Agency, Sudoku, GK & Word Riddles',
    color: 'orange',
  },
];

const isStage3Completed = (topicKey, completedTopics) => {
  if (!completedTopics || !Array.isArray(completedTopics)) return false;
  if (completedTopics.includes(topicKey)) return true;
  return (
    completedTopics.includes(`${topicKey}-easy`) &&
    completedTopics.includes(`${topicKey}-medium`) &&
    completedTopics.includes(`${topicKey}-hard`)
  );
};

/**
 * Home Component
 * Main menu screen displaying 8 Section Cards outer view, drill-down section puzzles, and global search.
 */
export default function Home({
  onSelect,
  onBackToLanding,
  completedTopics = [],
  goldMastery = [],
  isGoalSelection = false,
  onBack,
}) {
  const [showAbout, setShowAbout] = useState(false);
  const [search, setSearch] = useState('');
  const [pmOpen, setPmOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeSections, setActiveSections] = useState([]);
  const searchInputRef = useRef(null);

  const isSearching = search.trim() !== '';

  // Global search across all 95 tiles across all 8 sections
  const searchMatches = isSearching
    ? TILES.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const searchCounts = { all: searchMatches.length };
  HOME_SECTIONS.forEach(({ key }) => {
    searchCounts[key] = searchMatches.filter((app) => (app.category || 'shelf') === key).length;
  });

  const filteredSearchResults =
    activeSections.length > 0
      ? searchMatches.filter((app) => activeSections.includes(app.category || 'shelf'))
      : searchMatches;

  const handleClearSearch = () => {
    setSearch('');
    setActiveSections([]);
    searchInputRef.current?.focus();
  };

  const renderMenuCard = (app) => {
    const isGold = goldMastery && goldMastery.includes(app.key);
    const isCompleted = isStage3Completed(app.key, completedTopics);
    return (
      <button
        key={app.key}
        type="button"
        className={`menu-card ${isGold ? 'gold-card' : app.color}`}
        onClick={() => {
          if (app.isRedirect) {
            navigate(app.path);
          } else {
            onSelect(app.key);
          }
        }}
      >
        <span className="menu-title">
          {app.name}
          {isGold && <span className="badge-indicator">🥇</span>}
          {!isGold && isCompleted && <span className="badge-indicator">✅</span>}
        </span>
        <span className="menu-subtitle">{app.subtitle}</span>
      </button>
    );
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        {isGoalSelection && onBack && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '8px',
              left: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--clr-card)',
              border: '1.5px solid var(--clr-border)',
              color: 'var(--clr-text)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
            onMouseLeave={(e) => (e.target.style.background = 'var(--clr-card)')}
          >
            ← Back to Dashboard
          </button>
        )}

        {!isGoalSelection && onBackToLanding && (
          <button
            onClick={onBackToLanding}
            style={{
              position: 'absolute',
              top: '8px',
              left: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--clr-card)',
              border: '1.5px solid var(--clr-border)',
              color: 'var(--clr-text)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
            onMouseLeave={(e) => (e.target.style.background = 'var(--clr-card)')}
          >
            ← Overview
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '4px',
            paddingTop: isGoalSelection || onBackToLanding ? '44px' : '0',
          }}
        >
          <img src="/tenali.png" alt="Tenali Raman" style={{ width: '80px', height: 'auto', flexShrink: 0 }} />
          <div>
            <h1 style={{ margin: 0 }}>{isGoalSelection ? 'Goal Practice' : 'Tenali Puzzles & Games'}</h1>
            <p className="subtitle" style={{ margin: 0 }}>
              {isGoalSelection
                ? 'Select a topic to practice with custom goals'
                : 'Explore 90+ algorithmically generated math and reasoning games'}
            </p>
          </div>
        </div>

        {/* Hamburger navigation menu */}
        <HomeNavMenu
          onSelect={onSelect}
          onOpenAbout={() => setShowAbout(true)}
          onOpenPmGoal={() => setPmOpen(true)}
          search={search}
        />
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {!search && !isGoalSelection && !selectedSection && (
        <div className="journey-banner-row">
          <button className="journey-banner-btn" onClick={() => onSelect('learning_journey')}>
            <div className="journey-banner-content">
              <div className="journey-banner-header">
                <span>⭐</span>
                <h3 className="journey-banner-title">Guided Learning Journey</h3>
              </div>
              <p className="journey-banner-subtitle">
                Embark on a structured, sequential math learning path with checkpoints.
              </p>
            </div>
            <div className="journey-banner-arrow">➔</div>
          </button>
        </div>
      )}

      {!search && !isGoalSelection && !selectedSection && <PmQuestBanner onSelect={onSelect} />}

      {!search && !isGoalSelection && !selectedSection && (
        <DailyWarmupCard completedTopics={completedTopics} apiBase={API} onSelectTopic={onSelect} />
      )}

      <div className="search-bar-row">
        <div className="search-bar-wrapper">
          <input
            id="tour-search-bar"
            ref={searchInputRef}
            className="search-bar"
            type="text"
            placeholder="Search all 90+ puzzles across sections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClearSearch();
              }
            }}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!search && !isGoalSelection && !selectedSection && (
        <PmHomeSection onSelect={onSelect} onOpenGoalPicker={() => setPmOpen(true)} />
      )}

      {/* Option C: Section Filter Bar displayed ONLY when searching across all sections */}
      {isSearching && (
        <SectionFilterBar
          sections={HOME_SECTIONS}
          activeSections={activeSections}
          onSelectSections={setActiveSections}
          counts={searchCounts}
        />
      )}

      {/* Main Content Area */}
      <div id="tour-home-grid">
        {/* 1. Global Search Results View */}
        {isSearching && (
          <div className="search-results-container">
            {filteredSearchResults.length > 0 && (
              <div className="search-results-summary">
                Found {filteredSearchResults.length} {filteredSearchResults.length === 1 ? 'puzzle' : 'puzzles'} matching &quot;{search}&quot;
                {activeSections.length > 0 && ' in selected sections'}
              </div>
            )}

            {HOME_SECTIONS.map((section) => {
              const sectionApps = filteredSearchResults.filter(
                (app) => (app.category || 'shelf') === section.key
              );
              if (sectionApps.length === 0) return null;

              return (
                <section key={section.key} className="home-section">
                  <h2 className="home-section-title">
                    <span className="section-title-icon">{section.icon}</span>
                    {section.title}
                    <span className="section-match-badge">{sectionApps.length}</span>
                  </h2>
                  <div className="menu-grid">
                    {sectionApps.map(renderMenuCard)}
                  </div>
                </section>
              );
            })}

            {filteredSearchResults.length === 0 && (
              <div className="search-empty-state">
                <p>
                  No puzzles found matching &quot;{search}&quot;
                  {activeSections.length > 0 ? ' in the selected section filter' : ' across any section'}.
                </p>
                <button
                  type="button"
                  className="search-clear-action-btn"
                  onClick={handleClearSearch}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Section Drill-Down View */}
        {!isSearching && selectedSection && (
          <div className="section-drilldown-view">
            {(() => {
              const currentSection = HOME_SECTIONS.find((s) => s.key === selectedSection);
              const sectionTiles = TILES.filter(
                (app) => (app.category || 'shelf') === selectedSection
              );
              const sCompleted = sectionTiles.filter((app) =>
                isStage3Completed(app.key, completedTopics)
              ).length;
              const sGold = sectionTiles.filter(
                (app) => goldMastery && goldMastery.includes(app.key)
              ).length;

              return (
                <>
                  <div className="section-drilldown-header">
                    <button
                      type="button"
                      className="section-back-btn"
                      onClick={() => setSelectedSection(null)}
                      aria-label="Back to all sections"
                    >
                      ← All Sections
                    </button>
                    <div className="section-drilldown-info">
                      <span className="section-drilldown-icon">{currentSection?.icon}</span>
                      <div>
                        <h2 className="section-drilldown-title">{currentSection?.title}</h2>
                        <span className="section-drilldown-subtitle">
                          {sectionTiles.length} puzzles
                          {sCompleted > 0 && ` · ${sCompleted} completed`}
                          {sGold > 0 && ` · 🥇 ${sGold} gold`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="menu-grid">
                    {sectionTiles.map(renderMenuCard)}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 3. Outer View: Only 8 Section Cards */}
        {!isSearching && !selectedSection && (
          <div className="section-cards-grid">
            {HOME_SECTIONS.map((section) => {
              const sectionTiles = TILES.filter(
                (app) => (app.category || 'shelf') === section.key
              );
              const completedCount = sectionTiles.filter((app) =>
                isStage3Completed(app.key, completedTopics)
              ).length;
              const goldCount = sectionTiles.filter(
                (app) => goldMastery && goldMastery.includes(app.key)
              ).length;

              return (
                <button
                  key={section.key}
                  type="button"
                  className={`section-category-card ${section.color || 'blue'}`}
                  onClick={() => setSelectedSection(section.key)}
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
        )}
      </div>

      <PmGoalModal open={pmOpen} onClose={() => setPmOpen(false)} onSelect={onSelect} />
    </>
  );
}

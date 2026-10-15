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
  { key: 'number-foundations', title: 'Number Foundations' },
  { key: 'everyday-maths', title: 'Everyday Maths' },
  { key: 'algebra', title: 'Algebra' },
  { key: 'calculus', title: 'Calculus' },
  { key: 'linear-algebra', title: 'Linear Algebra' },
  { key: 'shape-space', title: 'Shape & Space' },
  { key: 'data-chance', title: 'Data & Chance' },
  { key: 'shelf', title: 'Puzzles & Play' },
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
 * Main menu screen displaying all available quizzes in categorized sections with section filtering.
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
  const [activeSections, setActiveSections] = useState([]);
  const searchInputRef = useRef(null);

  const isSearching = search.trim() !== '';
  const filteredRegular = isSearching
    ? TILES.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(search.toLowerCase())
      )
    : TILES;

  const counts = { all: filteredRegular.length };
  HOME_SECTIONS.forEach(({ key }) => {
    counts[key] = filteredRegular.filter((app) => (app.category || 'shelf') === key).length;
  });

  const visibleSections =
    activeSections.length === 0
      ? HOME_SECTIONS
      : HOME_SECTIONS.filter((s) => activeSections.includes(s.key));

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

      {!search && !isGoalSelection && (
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

      {!search && !isGoalSelection && <PmQuestBanner onSelect={onSelect} />}

      {!search && !isGoalSelection && (
        <DailyWarmupCard completedTopics={completedTopics} apiBase={API} onSelectTopic={onSelect} />
      )}

      <div className="search-bar-row">
        <div className="search-bar-wrapper">
          <input
            id="tour-search-bar"
            ref={searchInputRef}
            className="search-bar"
            type="text"
            placeholder="Search puzzles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearch('');
              }
            }}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearch('');
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!search && !isGoalSelection && (
        <PmHomeSection onSelect={onSelect} onOpenGoalPicker={() => setPmOpen(true)} />
      )}

      {/* Section Filter Bar & Modal Trigger */}
      <SectionFilterBar
        sections={HOME_SECTIONS}
        activeSections={activeSections}
        onSelectSections={setActiveSections}
        counts={counts}
      />

      {/* Categorized Sections (#201, #202, #203) */}
      <div id="tour-home-grid">
        {visibleSections.map(({ key, title }) => {
          const sectionApps = filteredRegular.filter((app) => (app.category || 'shelf') === key);
          if (sectionApps.length === 0) return null;

          return (
            <section key={key} className="home-section">
              <h2 className="home-section-title">{title}</h2>
              <div className="menu-grid">
                {sectionApps.map((app) => {
                  const isGold = goldMastery && goldMastery.includes(app.key);
                  const isCompleted = isStage3Completed(app.key, completedTopics);
                  return (
                    <button
                      key={app.key}
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
                })}
              </div>
            </section>
          );
        })}

        {activeSections.length > 0 &&
          visibleSections.every((s) => counts[s.key] === 0) && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--clr-text-soft)' }}>
              No puzzles found matching &quot;{search}&quot; in the selected section{activeSections.length > 1 ? 's' : ''}.
            </div>
          )}
      </div>

      <PmGoalModal open={pmOpen} onClose={() => setPmOpen(false)} onSelect={onSelect} />
    </>
  );
}

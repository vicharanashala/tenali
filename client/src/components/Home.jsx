import React, { useState } from 'react';
import { TILES } from '../features/tiles';
import DailyWarmupCard from './DailyWarmupCard';
import AboutModal from './AboutModal';
import HomeNavMenu from './HomeNavMenu';
import SearchBar from './SearchBar';
import CategoryCardsGrid from './CategoryCardsGrid';
import SectionDrilldownView from './SectionDrilldownView';
import GlobalSearchResults from './GlobalSearchResults';
import MenuCard from './MenuCard';
import { PmQuestBanner, PmGoalModal, PmHomeSection } from '../PathMap';
import { isStage3Completed } from '../features/progress';
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

/**
 * Home Component
 * Main menu screen displaying 8 Section Cards outer view, drill-down section puzzles, and global search.
 */
export default function Home({
  onSelect,
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

  const isSearching = search.trim() !== '';

  // Global search across all 95 tiles across all 8 sections
  const query = search.trim().toLowerCase();
  const searchMatches = isSearching
    ? TILES.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.subtitle.toLowerCase().includes(query)
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

  const handleSearchChange = (val) => {
    // If starting a search from inside a drilled-down section and no custom filter is active yet
    if (!search && val.trim() !== '' && selectedSection && activeSections.length === 0) {
      setActiveSections([selectedSection]);
    }
    setSearch(val);
  };

  const handleClearSearch = () => {
    setSearch('');
    setActiveSections([]);
  };

  const renderMenuCard = (app) => (
    <MenuCard
      key={app.key}
      app={app}
      isCompleted={isStage3Completed(app.key, completedTopics)}
      isGold={Boolean(goldMastery && goldMastery.includes(app.key))}
      onSelect={onSelect}
    />
  );

  const currentSection = selectedSection
    ? HOME_SECTIONS.find((s) => s.key === selectedSection)
    : null;
  const sectionTiles = selectedSection
    ? TILES.filter((app) => (app.category || 'shelf') === selectedSection)
    : [];

  return (
    <>
      <div className="home-top-header">
        {isGoalSelection && onBack && !selectedSection && (
          <button
            type="button"
            onClick={onBack}
            className="home-back-btn"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
        )}

        {selectedSection && (
          <button
            type="button"
            onClick={() => {
              setSelectedSection(null);
              setActiveSections([]);
            }}
            className="home-back-btn"
            aria-label="Back to all sections"
          >
            ← All Sections
          </button>
        )}

        <div
          className="home-header-center"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '4px',
            paddingTop: (isGoalSelection || selectedSection) ? '44px' : '0',
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

      <SearchBar
        id="tour-search-bar"
        placeholder={
          selectedSection && currentSection
            ? `Search in ${currentSection.title}!`
            : 'Search all Puzzles across all Sections!'
        }
        value={search}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
      />

      {!search && !isGoalSelection && !selectedSection && (
        <PmHomeSection onSelect={onSelect} onOpenGoalPicker={() => setPmOpen(true)} />
      )}

      {/* Main Content Area */}
      {isSearching && (
        <GlobalSearchResults
          id="tour-home-grid"
          search={search}
          filteredResults={filteredSearchResults}
          searchCounts={searchCounts}
          activeSections={activeSections}
          setActiveSections={setActiveSections}
          sections={HOME_SECTIONS}
          renderCard={renderMenuCard}
          onClearSearch={handleClearSearch}
        />
      )}

      {!isSearching && selectedSection && (
        <SectionDrilldownView
          id="tour-home-grid"
          section={currentSection}
          tiles={sectionTiles}
          completedTopics={completedTopics}
          goldMastery={goldMastery}
          renderCard={renderMenuCard}
        />
      )}

      {!isSearching && !selectedSection && (
        <CategoryCardsGrid
          id="tour-home-grid"
          sections={HOME_SECTIONS}
          tiles={TILES}
          completedTopics={completedTopics}
          goldMastery={goldMastery}
          onSelectSection={setSelectedSection}
        />
      )}

      <PmGoalModal open={pmOpen} onClose={() => setPmOpen(false)} onSelect={onSelect} />
    </>
  );
}

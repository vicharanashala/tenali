import React, { useState, useEffect, useRef } from 'react';
import { TILES, FEATURED_TILES, MATH_LAB_ENTRY, GEOCRAFT_ENTRY } from '../features/tiles';
import DailyWarmupCard from './DailyWarmupCard';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const withBase = (p) => BASE + p;
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
  return completedTopics.includes(`${topicKey}-easy`) &&
    completedTopics.includes(`${topicKey}-medium`) &&
    completedTopics.includes(`${topicKey}-hard`);
};

/**
 * Home Component
 * Main menu screen showing all available quizzes in categorized sections.
 * Displays quiz cards with color coding and allows filtering by name/subtitle.
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const featuredApps = FEATURED_TILES;
  const mathLabEntry = MATH_LAB_ENTRY;
  const geocraftEntry = GEOCRAFT_ENTRY;

  const hamburgerApps = [
    ...featuredApps,
    { key: 'curiosity', name: 'Curiosity Mode', subtitle: 'Explore "What if" variations', color: 'pink' },
  ];

  const regularApps = TILES;

  // Hamburger menu open state
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Filtered lists
  const isSearching = search.trim() !== '';
  const matchFilter = (a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(search.toLowerCase());

  const filteredRegular = isSearching ? regularApps.filter(matchFilter) : regularApps;
  const filteredHamburgerApps = isSearching ? hamburgerApps.filter(matchFilter) : hamburgerApps;

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
        {/* Hamburger menu — top right */}
        <div ref={menuRef} style={{ position: 'absolute', top: '8px', right: '0' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center',
            }}
            aria-label="Menu"
          >
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '2.5px',
                background: 'var(--clr-text)',
                borderRadius: '2px',
                transition: 'transform 0.2s, opacity 0.2s',
                transform: menuOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '2.5px',
                background: 'var(--clr-text)',
                borderRadius: '2px',
                transition: 'opacity 0.2s',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '2.5px',
                background: 'var(--clr-text)',
                borderRadius: '2px',
                transition: 'transform 0.2s, opacity 0.2s',
                transform: menuOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none',
              }}
            />
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 50,
                background: 'var(--clr-card)',
                border: '1.5px solid var(--clr-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-card)',
                padding: '6px 0',
                minWidth: '200px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowAbout(true);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                  borderBottom: '1px solid var(--clr-border)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>ℹ️ About Tenali</strong>
              </button>
              {/* Visual Learning Universe & GeoCraft pinned at top of hamburger menu */}
              {[mathLabEntry, geocraftEntry].map((app) => (
                <button
                  key={app.key}
                  onClick={() => {
                    setMenuOpen(false);
                    if (app.isRedirect) {
                      window.location.href = withBase(app.path);
                    } else {
                      onSelect(app.key);
                    }
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--clr-text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                  onMouseLeave={(e) => (e.target.style.background = 'none')}
                >
                  <strong style={{ color: 'var(--clr-accent)' }}>{app.name}</strong>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      color: 'var(--clr-text-soft)',
                      marginTop: '2px',
                    }}
                  >
                    {app.subtitle}
                  </span>
                </button>
              ))}
              <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

              {/* Real-World hub (Feature CR) — opens the phenomenon pathway cards */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelect('realworld');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>🌍 Real-World</strong>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                  Math pathways through real phenomena
                </span>
              </button>
              <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelect('goalpractice');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>🎯 Goal Practice</strong>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                  Practice with targets & limits
                </span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelect('riddle');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>🧩 Math Riddles</strong>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                  Find the hidden rule & solve puzzles!
                </span>
              </button>

              {filteredHamburgerApps.map((app) => (
                <button
                  key={app.key}
                  onClick={() => {
                    setMenuOpen(false);
                    onSelect(app.key);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--clr-text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                  onMouseLeave={(e) => (e.target.style.background = 'none')}
                >
                  <strong style={{ color: 'var(--clr-accent)' }}>{app.name}</strong>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      color: 'var(--clr-text-soft)',
                      marginTop: '2px',
                    }}
                  >
                    {app.subtitle}
                  </span>
                </button>
              ))}

              {featuredApps.map((app) => (
                <button
                  key={app.key}
                  onClick={() => {
                    setMenuOpen(false);
                    onSelect(app.key);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--clr-text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                  onMouseLeave={(e) => (e.target.style.background = 'none')}
                >
                  <strong style={{ color: 'var(--clr-accent)' }}>{app.name}</strong>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      color: 'var(--clr-text-soft)',
                      marginTop: '2px',
                    }}
                  >
                    {app.subtitle}
                  </span>
                </button>
              ))}

              <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.location.href = withBase('/playground');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>💻 Code Playground</strong>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                  Run code in 50+ languages
                </span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelect('language');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>Language Puzzles</strong>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                  Fill in the blanks to create new words
                </span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('tenali:openHall'));
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--clr-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--clr-hover-strong)')}
                onMouseLeave={(e) => (e.target.style.background = 'none')}
              >
                <strong style={{ color: 'var(--clr-accent)' }}>{'\uD83D\uDC7E'} Hall of Silly Mistakes</strong>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                  Review your misconception monsters
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showAbout && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 99999,
            }}
            onClick={() => setShowAbout(false)}
          />
          <div
            className="card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100000,
              width: '90%',
              maxWidth: '400px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            }}
          >
            <h2 style={{ color: 'var(--clr-accent)', marginTop: 0 }}>About Tenali</h2>
            <p style={{ lineHeight: 1.6 }}>
              Tenali is an advanced, adaptive learning platform featuring interactive puzzles in Mathematics, Logic, and
              General Knowledge.
            </p>
            <p style={{ lineHeight: 1.6 }}>
              Your progress is saved dynamically, allowing the platform to automatically adjust the difficulty of every
              question to match your skill level!
            </p>
            <button
              className="menu-card blue"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
              onClick={() => setShowAbout(false)}
            >
              <span className="menu-title">Got it!</span>
            </button>
          </div>
        </>
      )}
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
      {!search && !isGoalSelection && (
        <DailyWarmupCard completedTopics={completedTopics} apiBase={API} onSelectTopic={onSelect} />
      )}
      <div className="search-bar-row">
        <input
          id="tour-search-bar"
          className="search-bar"
          type="text"
          placeholder="Search puzzles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categorized Sections (#201, #202, #203) */}
      <div id="tour-home-grid">
        {HOME_SECTIONS.map(({ key, title }) => {
          const sectionApps = filteredRegular.filter((app) => (app.category || 'shelf') === key);
          if (sectionApps.length === 0) return null;

          return (
            <section key={key} className="home-section" style={{ marginBottom: '32px' }}>
              <h2
                className="home-section-title"
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '14px',
                  color: 'var(--clr-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h2>
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
                          window.location.href = withBase(app.path);
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
      </div>
    </>
  );
}

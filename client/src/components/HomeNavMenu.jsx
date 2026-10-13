import React, { useState, useEffect, useRef } from 'react';
import { FEATURED_TILES, MATH_LAB_ENTRY, GEOCRAFT_ENTRY } from '../features/tiles';
import { navigate } from '../lib/router';

function DropdownItem({ onClick, title, subtitle, style }) {
  return (
    <button className="home-dropdown-item" onClick={onClick} style={style}>
      <strong className="home-dropdown-item-title">{title}</strong>
      {subtitle && <span className="home-dropdown-item-subtitle">{subtitle}</span>}
    </button>
  );
}

/**
 * HomeNavMenu
 * Hamburger menu toggle and slide-down drawer with navigation shortcuts.
 */
export default function HomeNavMenu({ onSelect, onOpenAbout, search = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const featuredApps = FEATURED_TILES;
  const mathLabEntry = MATH_LAB_ENTRY;
  const geocraftEntry = GEOCRAFT_ENTRY;

  const hamburgerApps = [
    ...featuredApps,
    { key: 'curiosity', name: 'Curiosity Mode', subtitle: 'Explore "What if" variations', color: 'pink' },
  ];

  const isSearching = search.trim() !== '';
  const matchFilter = (a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(search.toLowerCase());

  const filteredHamburgerApps = isSearching ? hamburgerApps.filter(matchFilter) : hamburgerApps;

  const handleSelect = (key) => {
    setMenuOpen(false);
    onSelect(key);
  };

  const handleRedirect = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
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
          <DropdownItem
            onClick={() => {
              setMenuOpen(false);
              onOpenAbout();
            }}
            title="ℹ️ About Tenali"
            style={{ borderBottom: '1px solid var(--clr-border)' }}
          />

          {/* Visual Learning Universe & GeoCraft */}
          {[mathLabEntry, geocraftEntry].map((app) => (
            <DropdownItem
              key={app.key}
              onClick={() => {
                if (app.isRedirect) {
                  handleRedirect(app.path);
                } else {
                  handleSelect(app.key);
                }
              }}
              title={app.name}
              subtitle={app.subtitle}
            />
          ))}

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

          {/* Real-World hub */}
          <DropdownItem
            onClick={() => handleSelect('realworld')}
            title="🌍 Real-World"
            subtitle="Math pathways through real phenomena"
          />

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

          <DropdownItem
            onClick={() => handleSelect('goalpractice')}
            title="🎯 Goal Practice"
            subtitle="Practice with targets & limits"
          />

          <DropdownItem
            onClick={() => handleSelect('riddle')}
            title="🧩 Math Riddles"
            subtitle="Find the hidden rule & solve puzzles!"
          />

          {filteredHamburgerApps.map((app) => (
            <DropdownItem
              key={app.key}
              onClick={() => handleSelect(app.key)}
              title={app.name}
              subtitle={app.subtitle}
            />
          ))}

          {featuredApps.map((app) => (
            <DropdownItem
              key={app.key}
              onClick={() => handleSelect(app.key)}
              title={app.name}
              subtitle={app.subtitle}
            />
          ))}

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

          <DropdownItem
            onClick={() => handleRedirect('/playground')}
            title="💻 Code Playground"
            subtitle="Run code in 50+ languages"
          />

          <DropdownItem
            onClick={() => handleSelect('language')}
            title="Language Puzzles"
            subtitle="Fill in the blanks to create new words"
          />

          <DropdownItem
            onClick={() => {
              setMenuOpen(false);
              window.dispatchEvent(new CustomEvent('tenali:openHall'));
            }}
            title="👾 Hall of Silly Mistakes"
            subtitle="Review your misconception monsters"
          />
        </div>
      )}
    </div>
  );
}

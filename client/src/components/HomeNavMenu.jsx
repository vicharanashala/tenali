import React, { useState, useEffect, useRef } from 'react';
import { FEATURED_TILES } from '../features/tiles';
import { PmHamburgerItem } from '../PathMap';
import './HomeNavMenu.css';

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
 * Hamburger menu toggle and slide-down drawer with platform utilities and meta-modes.
 */
export default function HomeNavMenu({ onSelect, onOpenAbout, onOpenPmGoal, search = '' }) {
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

  const hamburgerApps = [
    ...featuredApps,
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
        <div className="home-nav-dropdown">
          {/* Section 1: Platform Utilities & Goals */}
          <DropdownItem
            onClick={() => {
              setMenuOpen(false);
              onOpenAbout();
            }}
            title="ℹ️ About Tenali"
            style={{ borderBottom: '1px solid var(--clr-border)' }}
          />

          {onOpenPmGoal && (
            <PmHamburgerItem
              onOpen={() => {
                setMenuOpen(false);
                onOpenPmGoal();
              }}
            />
          )}

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

          {/* Section 2: Practice Modes & Quiz Builders */}
          <DropdownItem
            onClick={() => handleSelect('goalpractice')}
            title="🎯 Goal Practice"
            subtitle="Practice with targets & limits"
          />

          {filteredHamburgerApps.map((app) => (
            <DropdownItem
              key={app.key}
              onClick={() => handleSelect(app.key)}
              title={app.name}
              subtitle={app.subtitle}
            />
          ))}

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />

          {/* Section 3: Extended Hubs & Review */}
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

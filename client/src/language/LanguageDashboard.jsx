import React, { useState } from 'react';
import WordCreatorApp from './WordCreatorApp';
import CrosswordApp from './CrosswordApp';
import WordSearchApp from './WordSearchApp';

/**
 * LanguageDashboard Component
 * Main hub for language-themed activities and puzzles.
 */
export default function LanguageDashboard({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  const activities = [
    {
      key: 'wordcreator',
      name: 'Word Creator',
      subtitle: 'Fill in the blanks to create valid words from patterns.',
      color: 'green'
    },
    {
      key: 'crossword',
      name: 'Crossword Puzzles',
      subtitle: 'Solve thematic crosswords and build your vocabulary.',
      color: 'orange'
    },
    {
      key: 'wordsearch',
      name: 'Word Search',
      subtitle: 'Find hidden words in the grid to challenge your observation.',
      color: 'orange'
    }
  ];

  const filtered = activities.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedGame === 'wordcreator') {
    return <WordCreatorApp onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'crossword') {
    return <CrosswordApp onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'wordsearch') {
    return <WordSearchApp onBack={() => setSelectedGame(null)} />;
  }

  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
      </div>
      <h1>Language Puzzles</h1>
      <p className="subtitle">Enhance your vocabulary, spelling, and grammar skills</p>

      <div className="search-bar-row">
        <input
          className="search-bar"
          type="text"
          placeholder="Search language games..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="menu-grid" style={{ marginTop: 20 }}>
        {filtered.map(act => (
          <button
            key={act.key}
            className={`menu-card ${act.color}`}
            onClick={() => setSelectedGame(act.key)}
          >
            <span className="menu-title">{act.name}</span>
            <span className="menu-subtitle">{act.subtitle}</span>
          </button>
        ))}
      </div>
    </>
  );
}

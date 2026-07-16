import React, { useState, useEffect, useRef } from 'react';
import { useTimer, QuizLayout } from '../App';
import WordCreatorApp from './WordCreatorApp';

// API base URL from environment variables (Vite)
const API = import.meta.env.VITE_API_BASE_URL || '';

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
      subtitle: 'Fill in the blanks to create new words.',
      color: 'green'
    }
  ];

  const filtered = activities.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedGame === 'wordcreator') {
    return <WordCreatorApp onBack={() => setSelectedGame(null)} />;
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



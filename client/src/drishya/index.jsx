import { useState, useEffect, useRef } from 'react';
import DrishyaIcons from './DrishyaIcons';
import { QuizLayout, useTimer } from '../App';

// Import exercise components
import McqExercise from './exercises/McqExercise';
import FillBlankExercise from './exercises/FillBlankExercise';
import OddOneOutExercise from './exercises/OddOneOutExercise';
import MatchingExercise from './exercises/MatchingExercise';
import GuidedExercise from './exercises/GuidedExercise';
import FreeExercise from './exercises/FreeExercise';

const TABS = [
  { id: 'mcq', label: 'Identify the Word', icon: DrishyaIcons.mcq, desc: 'Look at the image and pick the correct word.' },
  { id: 'fillBlank', label: 'Fill in the Blank', icon: DrishyaIcons.fillBlank, desc: 'Type or speak the missing word in the sentence.' },
  { id: 'oddOneOut', label: 'Odd One Out', icon: DrishyaIcons.oddOneOut, desc: 'Find the image that matches the given clue.' },
  { id: 'matching', label: 'Word Pairing', icon: DrishyaIcons.matching, desc: 'Connect images to their matching vocabulary words.' },
  { id: 'guided', label: 'Guided Description', icon: DrishyaIcons.guided, desc: 'Complete sentence starters describing the image.' },
  { id: 'free', label: 'Free Description', icon: DrishyaIcons.free, desc: 'Describe the image in your own words using speech or text.' }
];

const EXERCISE_COMPONENTS = {
  mcq: McqExercise,
  fillBlank: FillBlankExercise,
  oddOneOut: OddOneOutExercise,
  matching: MatchingExercise,
  guided: GuidedExercise,
  free: FreeExercise
};

const LEVELS = [
  { id: 1, name: 'Level 1: Beginner Vocabulary', desc: 'Animals & Vehicles', categories: ['animal', 'vehicle'] },
  { id: 2, name: 'Level 2: Daily Life', desc: 'Food & Emotions', categories: ['food', 'emotions'] },
  { id: 3, name: 'Level 3: Household Objects', desc: 'Objects', categories: ['objects'] },
  { id: 4, name: 'Level 4: Actions & Verbs', desc: 'Actions', categories: ['actions'] },
  { id: 5, name: 'Level 5: Scene Scenarios', desc: 'Complex Scenarios', categories: ['scenario'] }
];

function getTabFromUrl() {
  const path = window.location.pathname; // e.g. "/drishya/mcq"
  const match = path.match(/^\/drishya\/([^/]+)/);
  const id = match ? match[1] : null;
  return id && EXERCISE_COMPONENTS[id] ? id : null;
}

function pushTabUrl(tabId) {
  const url = tabId ? `/drishya/${tabId}` : '/drishya';
  window.history.pushState({ tabId }, '', url);
}

export default function Drishya({ onBack, initialTab = null }) {
  const [activeTab, setActiveTab] = useState(initialTab || getTabFromUrl);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Level System States
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelItems, setLevelItems] = useState([]);
  const [puzzleIndex, setPuzzleIndex] = useState(1);
  const [levelStats, setLevelStats] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [levelStartTime, setLevelStartTime] = useState(null);
  const [levelSearch, setLevelSearch] = useState('');

  const lastSubmittedIndex = useRef(0);
  const timer = useTimer();

  const selectTab = (id) => {
    setActiveTab(id);
    if (!initialTab) {
      pushTabUrl(id);
    }
  };

  const handleBack = () => {
    if (initialTab) {
      onBack();
    } else {
      selectTab(null);
    }
  };

  // Fetch items from server
  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('tenali-auth-token') || localStorage.getItem('tenali-token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const API = import.meta.env.VITE_API_BASE_URL || '';

      const itemsRes = await fetch(`${API}/drishya-api/items`, { headers });
      if (!itemsRes.ok) {
        throw new Error(`Server returned status ${itemsRes.status} on items fetch`);
      }
      const itemsData = await itemsRes.json();
      if (itemsData && itemsData.error) {
        throw new Error(`Server error (items): ${itemsData.error}`);
      }
      if (!Array.isArray(itemsData)) {
        throw new Error(`Expected array of items but got: ${typeof itemsData}`);
      }

      setItems(itemsData);
    } catch (err) {
      console.error('Error fetching Drishya data:', err);
      setError(err.message || String(err));
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    const onPopState = () => setActiveTab(getTabFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Timer Control
  useEffect(() => {
    if (activeTab && selectedLevel !== null && !showResults) {
      timer.start();
    } else {
      timer.reset();
    }
  }, [activeTab, selectedLevel, showResults]);

  const startLevel = (lvl) => {
    // Filter items matching level's categories
    let filtered = items.filter(item => lvl.categories.includes(item.category));

    // Fallback if matching category items are not found
    if (filtered.length === 0) {
      filtered = items;
    }

    // Shuffle and pick exactly 5 items
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, 5);

    setSelectedLevel(lvl.id);
    setLevelItems(selectedItems);
    setPuzzleIndex(1);
    lastSubmittedIndex.current = 0;
    setLevelStats([]);
    setShowResults(false);
    setLevelStartTime(Date.now());
  };

  const handleNextQuestion = (isCorrect, feedback, userAnswer) => {
    if (lastSubmittedIndex.current === puzzleIndex) {
      console.warn("Preventing duplicate submission");
      return;
    }
    lastSubmittedIndex.current = puzzleIndex;

    const currentItem = levelItems[puzzleIndex - 1];
    const statDetail = {
      item: currentItem,
      isCorrect,
      feedback: feedback || '',
      userAnswer: userAnswer || ''
    };

    setLevelStats(prev => [...prev, statDetail]);

    if (puzzleIndex < 5) {
      setPuzzleIndex(prevIdx => prevIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-soft)' }}>
        Loading Drishya Module...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text)' }}>
        <h3 style={{ color: 'var(--clr-incorrect, #ef5350)' }}>Error Loading Drishya</h3>
        <p style={{ color: 'var(--clr-text-soft)', margin: '12px 0 24px 0' }}>{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={fetchData}
            style={{
              background: 'var(--clr-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Retry
          </button>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid var(--clr-border)',
              color: 'var(--clr-text-soft)',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Render Results Screen
  if (showResults) {
    const correctCount = levelStats.filter(s => s.isCorrect).length;
    const accuracy = Math.round((correctCount / 5) * 100);
    const totalLevelTime = Math.round((Date.now() - levelStartTime) / 1000);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const activeTabObj = TABS.find(t => t.id === activeTab);
    const activeTabLabel = activeTabObj?.label || 'Image Lab';

    return (
      <QuizLayout
        title={`Results · Level ${selectedLevel}`}
        subtitle={`${activeTabLabel} level completion report`}
        onBack={() => {
          setSelectedLevel(null);
          setShowResults(false);
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: '800px', margin: '0 auto', color: 'var(--clr-text)' }}>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Time</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffc107' }}>{formatTime(totalLevelTime)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Correct</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a90e2' }}>{correctCount} / 5</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Accuracy</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: accuracy >= 70 ? '#26de81' : '#f85149' }}>{accuracy}%</div>
            </div>
          </div>

          {/* Details Section */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--clr-accent, #05c46b)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 16 }}>
              Level Question Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '500px', overflowY: 'auto', paddingRight: 8 }}>
              {levelStats.map((stat, idx) => {
                if (!stat.item) return null;
                const imgUrl = `/${stat.item.image}`;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={stat.item.primaryWord || 'Image'}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--clr-border)' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                          Question {idx + 1} {stat.item.primaryWord ? `(${stat.item.primaryWord})` : ''}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: stat.isCorrect ? '#26de81' : '#ff6b6b',
                          background: stat.isCorrect ? 'rgba(38,222,129,0.12)' : 'rgba(248,81,73,0.12)',
                          padding: '2px 8px',
                          borderRadius: 4
                        }}>
                          {stat.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                      </div>
                      {stat.userAnswer && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                          <strong>Your Answer:</strong> <span style={{ fontFamily: 'monospace' }}>{String(stat.userAnswer)}</span>
                        </div>
                      )}
                      {stat.feedback && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontStyle: 'italic' }}>
                          <strong>Feedback:</strong> {stat.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedLevel(null);
              setShowResults(false);
            }}
            style={{
              alignSelf: 'center',
              padding: '12px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'var(--clr-accent, #05c46b)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,196,107,0.3)',
              transition: 'all 0.2s'
            }}
          >
            Back to Levels
          </button>
        </div>
      </QuizLayout>
    );
  }

  // Render Level Selection Screen
  if (activeTab && selectedLevel === null) {
    const activeTabObj = TABS.find(t => t.id === activeTab);
    const activeTabLabel = activeTabObj?.label || 'Image Lab';

    // Scenario-based questions should only be in guided and free description labs
    const isDescriptionLab = activeTab === 'guided' || activeTab === 'free';
    const displayedLevels = isDescriptionLab ? LEVELS : LEVELS.filter(l => l.id !== 5);

    return (
      <QuizLayout title={activeTabLabel} subtitle="Select difficulty level to start playing" onBack={handleBack}>

        <div className="search-bar-row" style={{ marginBottom: 20 }}>
          <input
            className="search-bar"
            type="text"
            placeholder="Search levels..."
            value={levelSearch}
            onChange={e => setLevelSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--clr-border)',
              color: 'var(--clr-text)',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div className="menu-grid" style={{ marginTop: 20 }}>
          {displayedLevels.filter(l => l.name.toLowerCase().includes(levelSearch.toLowerCase()) || l.desc.toLowerCase().includes(levelSearch.toLowerCase())).map(lvl => (
            <button
              key={lvl.id}
              className="menu-card blue"
              onClick={() => startLevel(lvl)}
            >
              <span className="menu-title">Level {lvl.id}</span>
              <span className="menu-subtitle">{lvl.name.split(': ')[1] || lvl.name}</span>
            </button>
          ))}
        </div>
      </QuizLayout>
    );
  }

  const ExerciseComponent = activeTab ? EXERCISE_COMPONENTS[activeTab] : null;
  const activeLevelObj = LEVELS.find(l => l.id === selectedLevel);
  const progressPercent = Math.round(((puzzleIndex - 1) / 5) * 100);

  return (
    <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '1rem', color: 'var(--clr-text)' }}>
      {/* Dashboard View if loaded directly (activeTab is null) */}
      {activeTab === null ? (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--clr-border)',
            paddingBottom: '12px'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {DrishyaIcons.header} Drishya Image Lab
              </h1>
              <p className="subtitle" style={{ margin: '4px 0 0 0', color: 'var(--clr-text-soft)' }}>
                Describe images using vocabulary words and build expressive language skills
              </p>
            </div>
            <button className="back-button" onClick={onBack}>← Back to Home</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '10px' }}>
            {TABS.map(tab => (
              <div
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                style={{
                  background: 'var(--clr-surface)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  minHeight: '180px',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--clr-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--clr-border)';
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--clr-accent-bg, rgba(108,206,255,0.08))',
                  color: 'var(--clr-accent)', marginBottom: '14px'
                }}>
                  {tab.icon}
                </div>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 600, color: 'var(--clr-accent)', textAlign: 'center' }}>
                  {tab.label}
                </h3>

                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--clr-text-soft)', textAlign: 'center', lineHeight: '1.4' }}>
                  {tab.desc}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Active Level Play Mode */
        <QuizLayout
          title={TABS.find(t => t.id === activeTab)?.label || 'Image Lab'}
          subtitle={`${activeLevelObj?.name} (${activeLevelObj?.desc})`}
          onBack={() => {
            setSelectedLevel(null);
            setPuzzleIndex(1);
          }}
          timer={timer}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div className="progress-pill center">
              Puzzle {puzzleIndex} of 5
            </div>
            <div style={{ flex: 1, minWidth: 80, padding: '0 12px' }}>
              <div className="cw-progress-bar-track" style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div className="cw-progress-bar-fill" style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--clr-accent, #05c46b)', transition: 'width 0.2s' }} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--clr-card, #1e1e24)',
            border: '1px solid var(--clr-border)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {ExerciseComponent && (
              <ExerciseComponent
                items={levelItems}
                currentItem={levelItems[puzzleIndex - 1]}
                isLevelMode={true}
                puzzleIndex={puzzleIndex}
                totalPuzzles={5}
                onNext={handleNextQuestion}
                allItems={items}
                onBack={() => {
                  setSelectedLevel(null);
                  setPuzzleIndex(1);
                }}
              />
            )}
          </div>
        </QuizLayout>
      )}
    </div>
  );
}

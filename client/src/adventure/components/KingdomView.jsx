import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function KingdomView() {
  const { state, selectWorld, setView } = useAdventure();
  const { worlds } = state;

  return (
    <div className="adv-kingdom-container">
      <div className="adv-top-nav">
        <button 
          className="adv-back-btn" 
          onClick={() => setView('HOME')}
          aria-label="Back to Home"
        >
          ← Home
        </button>
        <h2 className="adv-view-title">Mathematical Kingdoms</h2>
      </div>

      <div className="adv-kingdom-grid">
        {worlds.map((world) => (
          <div 
            key={world.id} 
            className={`adv-card adv-kingdom-card ${!world.isUnlocked ? 'locked' : ''}`}
            onClick={() => world.isUnlocked && selectWorld(world.id)}
            role="button"
            tabIndex={world.isUnlocked ? 0 : -1}
            onKeyDown={(e) => {
              if (world.isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                selectWorld(world.id);
              }
            }}
            aria-disabled={!world.isUnlocked}
          >
            <div className="adv-kingdom-header">
              <span className="adv-kingdom-icon">{world.icon}</span>
              {world.isUnlocked ? (
                <span className="adv-badge adv-badge-unlocked">Unlocked</span>
              ) : (
                <span className="adv-badge adv-badge-locked">🔒 Locked</span>
              )}
            </div>

            <h3 className="adv-kingdom-name">{world.name}</h3>
            <p className="adv-kingdom-desc">{world.description}</p>

            {world.isUnlocked ? (
              <div className="adv-progress-bar-container">
                <div className="adv-progress-bar-label">
                  <span>Progress</span>
                  <span>{world.completedLevelsCount} / {world.totalLevels} Levels</span>
                </div>
                <div className="adv-progress-track">
                  <div 
                    className="adv-progress-fill" 
                    style={{ width: `${world.progressPercent}%`, backgroundColor: world.themeColor }}
                  />
                </div>
              </div>
            ) : (
              <div className="adv-lock-req">
                <small>{world.unlockRequirements}</small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

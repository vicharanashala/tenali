import React, { useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function LevelPathView() {
  const { state, startLevel, setView } = useAdventure();
  const { currentWorldId, worlds, levels, concepts, progress, loading } = state;

  const currentWorld = worlds.find(w => w.id === currentWorldId) || worlds[0];
  const worldLevels  = levels.filter(l => l.worldId === currentWorldId);

  // Build a quick lookup map: conceptId → concept name
  const conceptNameMap = useMemo(() => {
    const map = {};
    for (const c of (concepts || [])) map[c.id] = c.name;
    return map;
  }, [concepts]);

  // A level is unlocked when it is first in its world, or the previous level is completed.
  const isLevelUnlocked = (level) => {
    if (level.levelNumber === 1) return true;
    const prev = worldLevels.find(l => l.levelNumber === level.levelNumber - 1);
    return prev ? progress.completedLevels.includes(prev.id) : false;
  };

  return (
    <div className="adv-level-container">
      <div className="adv-top-nav">
        <button
          className="adv-back-btn"
          onClick={() => setView('KINGDOM_SELECT')}
          aria-label="Back to Kingdoms"
        >
          ← Kingdoms
        </button>
        <h2 className="adv-view-title">
          {currentWorld ? currentWorld.name : 'Level Journey'}
        </h2>
      </div>

      <div className="adv-level-path">
        {worldLevels.map((lvl, index) => {
          const unlocked  = isLevelUnlocked(lvl);
          const completed = progress.completedLevels.includes(lvl.id);
          const stars     = progress.levelStars[lvl.id] || 0;

          // Use the proper concept name from the concepts list
          const conceptLabel = conceptNameMap[lvl.conceptId] || lvl.conceptId;

          return (
            <div key={lvl.id} className="adv-level-node-wrapper">
              {index > 0 && (
                <div className={`adv-path-line ${completed ? 'active' : ''}`} />
              )}

              <div
                className={[
                  'adv-level-node',
                  lvl.isBoss  ? 'boss-node' : '',
                  completed   ? 'completed' : '',
                  !completed && unlocked ? 'unlocked' : '',
                  !unlocked   ? 'locked'   : ''
                ].filter(Boolean).join(' ')}
                onClick={() => { if (unlocked && !loading) { console.log('[DEBUG Step 1] Level clicked - lvl.id:', lvl.id); startLevel(lvl.id); } }}
                role="button"
                tabIndex={unlocked ? 0 : -1}
                onKeyDown={e => {
                  if (unlocked && !loading && (e.key === 'Enter' || e.key === ' ')) {
                    startLevel(lvl.id);
                  }
                }}
                aria-label={`Level ${lvl.levelNumber}: ${conceptLabel}${lvl.isBoss ? ' — Boss' : ''}`}
                aria-disabled={!unlocked}
              >
                {/* Circle */}
                <div className="adv-node-circle">
                  {lvl.isBoss ? (
                    <span className="adv-boss-icon">⚔️</span>
                  ) : completed ? (
                    <span className="adv-check-icon">✓</span>
                  ) : (
                    <span className="adv-node-num">{lvl.levelNumber}</span>
                  )}
                </div>

                {/* Details */}
                <div className="adv-node-details">
                  <div className="adv-node-header">
                    <span className="adv-node-title">{conceptLabel}</span>
                    {lvl.isBoss && <span className="adv-boss-tag">BOSS</span>}
                  </div>

                  {unlocked ? (
                    <div className="adv-node-stars" aria-label={`${stars} of 3 stars`}>
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className={`adv-star ${i < stars ? 'filled' : 'empty'}`}
                          aria-hidden="true"
                        >★</span>
                      ))}
                    </div>
                  ) : (
                    <span className="adv-node-locked-label">
                      🔒 Complete previous level
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

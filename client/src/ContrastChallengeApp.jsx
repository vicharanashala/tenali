/**
 * ContrastChallengeApp - Help students distinguish between commonly confused concepts
 * 
 * A component that presents interactive activities followed by
 * side-by-side comparison of concept pairs.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Hardcoded list of all contrast pairs (replaces server JSON + API)
const CONTRAST_PAIRS = [
  { id: 'area-perimeter', title: 'Area vs Perimeter' },
  { id: 'congruence-similarity', title: 'Congruence vs Similarity' },
  { id: 'decimals-fractions', title: 'Decimals vs Fractions' },
  { id: 'differentiation-integration', title: 'Differentiation vs Integration' },
  { id: 'factors-multiples', title: 'Factors vs Multiples' },
  { id: 'hcf-lcm', title: 'HCF vs LCM' },
  { id: 'interior-exterior', title: 'Interior vs Exterior Angles' },
  { id: 'limits-differentiation', title: 'Limits vs Differentiation' },
  { id: 'linear-simultaneous', title: 'Linear vs Simultaneous Equations' },
  { id: 'matrices-determinants', title: 'Matrices vs Determinants' },
  { id: 'mean-median-mode', title: 'Mean vs Median vs Mode' },
  { id: 'permutation-combination', title: 'Permutation vs Combination' },
  { id: 'prime-composite', title: 'Prime vs Composite Numbers' },
  { id: 'radius-diameter', title: 'Radius vs Diameter' },
  { id: 'trig-inverse-trig', title: 'Trigonometry vs Inverse Trig' },
];

export function getUsernameNamespace() {
  try {
    const authUserStr = localStorage.getItem('tenali-auth-user');
    if (authUserStr) {
      const authUser = JSON.parse(authUserStr);
      if (authUser && authUser.username) {
        return authUser.username;
      }
    }
  } catch (e) { }
  return 'guest';
}

export function getStorageKeys() {
  const ns = getUsernameNamespace();
  return {
    seen: `tenali-contrast-seen-${ns}`,
    unlocked: `tenali-contrast-unlocked-${ns}`,
    completedModules: `tenali-completed-modules-${ns}`
  };
}

// Load progress from localStorage
function loadProgress() {
  try {
    const keys = getStorageKeys();
    const data = localStorage.getItem(keys.seen);
    return data ? JSON.parse(data) : { seenPairs: [], completedPairs: [] };
  } catch {
    return { seenPairs: [], completedPairs: [] };
  }
}

// Save progress to localStorage
function saveProgress(progress) {
  try {
    const keys = getStorageKeys();
    localStorage.setItem(keys.seen, JSON.stringify(progress));
  } catch { }
}

// Bidirectional progress sync with the server database
export async function syncContrastProgress(token) {
  if (!token) return;
  try {
    const API = import.meta.env.VITE_API_BASE_URL || '';

    // Get current logged in username to identify user switches
    const authUserStr = localStorage.getItem('tenali-auth-user');
    let currentUsername = null;
    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        currentUsername = authUser ? authUser.username : null;
      } catch { }
    }
    if (!currentUsername) return;

    const userKeys = {
      completedModules: `tenali-completed-modules-${currentUsername}`,
      unlocked: `tenali-contrast-unlocked-${currentUsername}`,
      seen: `tenali-contrast-seen-${currentUsername}`
    };

    // 1. Get current namespaced localStorage values
    const localCompletedModules = JSON.parse(localStorage.getItem(userKeys.completedModules) || '[]');
    const localUnlocked = JSON.parse(localStorage.getItem(userKeys.unlocked) || '[]');
    const localSeen = JSON.parse(localStorage.getItem(userKeys.seen) || '{"seenPairs":[],"completedPairs":[]}');

    // 2. Fetch server values
    const res = await fetch(`${API}/contrast-api/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch server progress');
    const data = await res.json();
    const serverProgress = data.progress || {};

    // 3. Merge states: Local User + Server Progress
    const mergedCompletedModules = Array.from(new Set([
      ...localCompletedModules,
      ...(serverProgress.completedModules || [])
    ]));
    const mergedUnlocked = Array.from(new Set([
      ...localUnlocked,
      ...(serverProgress.unlockedPairs || [])
    ]));
    const mergedSeenPairs = Array.from(new Set([
      ...(localSeen.seenPairs || []),
      ...(serverProgress.seenPairs || [])
    ]));
    const mergedCompletedPairs = Array.from(new Set([
      ...(localSeen.completedPairs || []),
      ...(serverProgress.completedPairs || [])
    ]));

    // 4. Save merged states back to user localStorage
    localStorage.setItem(userKeys.completedModules, JSON.stringify(mergedCompletedModules));
    localStorage.setItem(userKeys.unlocked, JSON.stringify(mergedUnlocked));
    localStorage.setItem(userKeys.seen, JSON.stringify({
      seenPairs: mergedSeenPairs,
      completedPairs: mergedCompletedPairs
    }));

    // 7. Send merged states back to server
    await fetch(`${API}/contrast-api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        completedModules: mergedCompletedModules,
        unlockedPairs: mergedUnlocked,
        seenPairs: mergedSeenPairs,
        completedPairs: mergedCompletedPairs
      })
    });
  } catch (err) {
    console.error('[contrast] Error syncing progress with server:', err);
  }
}











export const CONTRAST_MAPPING = {
  'area-perimeter': ['mensur'],
  'congruence-similarity': ['congruence', 'similarity'],
  'decimals-fractions': ['decimals', 'fractionadd'],
  'differentiation-integration': ['diff', 'integ'],
  'factors-multiples': ['hcflcm'],
  'hcf-lcm': ['hcflcm'],
  'interior-exterior': ['polygons'],
  'limits-differentiation': ['limits', 'diff'],
  'linear-simultaneous': ['lineareq', 'simul'],
  'matrices-determinants': ['matrix'],
  'mean-median-mode': ['stats'],
  'permutation-combination': ['permcomb'],
  'prime-composite': ['primefactor', 'basicarith'],
  'radius-diameter': ['circleth', 'circmeasure', 'mensur'],
  'trig-inverse-trig': ['trig', 'invtrig']
};

export const MODULE_NAMES = {
  primefactor: "Prime Factorization",
  basicarith: "Arithmetic",
  hcflcm: "HCF & LCM",
  decimals: "Decimals",
  fractionadd: "Fraction Addition",
  congruence: "Congruence",
  similarity: "Similarity",
  mensur: "Mensuration",
  circleth: "Circle Theorems",
  circmeasure: "Circular Measure",
  trig: "Trigonometry",
  invtrig: "Inverse Trigonometry",
  permcomb: "Permutations & Combinations",
  diff: "Differentiation",
  integ: "Integration",
  limits: "Limits",
  lineareq: "Linear Equations",
  simul: "Simultaneous Equations",
  matrix: "Matrices",
  stats: "Statistics",
  polygons: "Polygons"
};

export const CHALLENGE_TITLES = {
  'area-perimeter': "Area vs Perimeter",
  'congruence-similarity': "Congruence vs Similarity",
  'decimals-fractions': "Decimals vs Fractions",
  'differentiation-integration': "Diff vs Integration",
  'factors-multiples': "Factors vs Multiples",
  'hcf-lcm': "HCF vs LCM",
  'interior-exterior': "Interior vs Exterior Angles",
  'limits-differentiation': "Limits vs Diff",
  'linear-simultaneous': "Linear vs Sim Equations",
  'matrices-determinants': "Matrices vs Determinants",
  'mean-median-mode': "Mean, Median, Mode",
  'permutation-combination': "Permutation vs Combination",
  'prime-composite': "Prime vs Composite",
  'radius-diameter': "Radius vs Diameter",
  'trig-inverse-trig': "Trig vs Inverse Trig"
};



const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--clr-correct)" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default function ContrastChallengeApp({ studentName, onBack }) {
  const [phase, setPhase] = useState('list'); // list, activity
  const [currentPair, setCurrentPair] = useState(null);
  const [progress, setProgress] = useState(loadProgress());
  const [unlockedPairs, setUnlockedPairs] = useState(() => {
    try {
      const keys = getStorageKeys();
      const data = localStorage.getItem(keys.unlocked);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // On mount, sync progress with server if authenticated
  useEffect(() => {
    const token = localStorage.getItem('tenali-auth-token');
    if (token) {
      syncContrastProgress(token).then(() => {
        setProgress(loadProgress());
        try {
          const keys = getStorageKeys();
          const data = localStorage.getItem(keys.unlocked);
          setUnlockedPairs(data ? JSON.parse(data) : []);
        } catch { }
      });
    }
  }, []);

  // Listen for login/logout changes to clean up or reset progress local state
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('tenali-auth-token');
      // Reload states from localStorage immediately for the new namespace (guest or logged-in user)
      setProgress(loadProgress());
      try {
        const keys = getStorageKeys();
        const data = localStorage.getItem(keys.unlocked);
        setUnlockedPairs(data ? JSON.parse(data) : []);
      } catch { }

      if (token) {
        // User logged in: trigger sync
        syncContrastProgress(token).then(() => {
          setProgress(loadProgress());
          try {
            const keys = getStorageKeys();
            const data = localStorage.getItem(keys.unlocked);
            setUnlockedPairs(data ? JSON.parse(data) : []);
          } catch { }
        });
      }
    };
    window.addEventListener('tenali-auth-change', handleAuthChange);
    return () => window.removeEventListener('tenali-auth-change', handleAuthChange);
  }, []);

  // All pairs are hardcoded — no API needed
  const allPairs = CONTRAST_PAIRS;

  // Open a specific pair by ID (pure local — no network call)
  const fetchPairById = useCallback((pairId) => {
    const pair = CONTRAST_PAIRS.find(p => p.id === pairId);
    if (pair) {
      setCurrentPair(pair);
      setPhase('activity');
    }
  }, []);

  // Refresh unlocked list from localStorage whenever we return to list view
  useEffect(() => {
    if (phase === 'list') {
      try {
        const keys = getStorageKeys();
        const data = localStorage.getItem(keys.unlocked);
        setUnlockedPairs(data ? JSON.parse(data) : []);
      } catch { }
    }
  }, [phase]);

  // Deep-link: start a specific pair if stored in localStorage
  useEffect(() => {
    const startId = localStorage.getItem('tenali-start-contrast-id');
    if (startId) {
      localStorage.removeItem('tenali-start-contrast-id');
      fetchPairById(startId);
    }
  }, [fetchPairById]);

  // Mark a pair as completed and return to list
  const handlePairComplete = (pairId) => {
    const newProgress = {
      seenPairs: progress.seenPairs.includes(pairId)
        ? progress.seenPairs
        : [...progress.seenPairs, pairId],
      completedPairs: progress.completedPairs.includes(pairId)
        ? progress.completedPairs
        : [...progress.completedPairs, pairId]
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    // Sync to server if authenticated
    const token = localStorage.getItem('tenali-auth-token');
    if (token) {
      syncContrastProgress(token);
    }

    setPhase('list');
  };

  // Mark a pair as completed without returning to the list phase (used when completing all questions)
  const handleMarkComplete = (pairId) => {
    const newProgress = {
      seenPairs: progress.seenPairs.includes(pairId)
        ? progress.seenPairs
        : [...progress.seenPairs, pairId],
      completedPairs: progress.completedPairs.includes(pairId)
        ? progress.completedPairs
        : [...progress.completedPairs, pairId]
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    // Sync to server if authenticated
    const token = localStorage.getItem('tenali-auth-token');
    if (token) {
      syncContrastProgress(token);
    }
  };

  // Render list view
  if (phase === 'list') {
    return (
      <>
        <div className="header-row">
          <button className="back-button" onClick={onBack}>← Home</button>
        </div>
        <h1>Contrast Challenge</h1>
        <p className="subtitle">Distinguish similar concepts</p>

        <div className="menu-grid">
          {allPairs.filter(pair => CONTRAST_MAPPING[pair.id]).map(pair => {
            const isCompleted = progress.completedPairs.includes(pair.id);

            return (
              <button
                key={pair.id}
                className="menu-card featured"
                onClick={() => fetchPairById(pair.id)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  opacity: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px 16px'
                }}
              >
                {isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(92, 184, 122, 0.15)',
                    border: '1.5px solid var(--clr-correct)',
                    color: 'var(--clr-correct)',
                    zIndex: 2
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
                <span 
                  className="menu-title" 
                  style={{ 
                    width: '90%',
                    height: 'auto',
                    minHeight: '44px',
                    background: 'var(--clr-badge)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    margin: '0 auto',
                    fontSize: '0.92rem',
                    lineHeight: '1.2',
                    fontWeight: '700',
                    color: 'var(--clr-text)',
                    boxSizing: 'border-box'
                  }}
                >
                  {pair.title}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // Render loading
  // Render custom Area vs Perimeter challenge if matched
  if (currentPair?.id === 'area-perimeter' && phase === 'activity') {
    return (
      <AreaPerimeterChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('area-perimeter')}
        onMarkComplete={() => handleMarkComplete('area-perimeter')}
      />
    );
  }

  // Render custom Radius vs Diameter challenge if matched
  if (currentPair?.id === 'radius-diameter' && phase === 'activity') {
    return (
      <RadiusDiameterChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('radius-diameter')}
        onMarkComplete={() => handleMarkComplete('radius-diameter')}
      />
    );
  }

  // Render custom HCF vs LCM challenge if matched
  if (currentPair?.id === 'hcf-lcm' && phase === 'activity') {
    return (
      <HcfLcmChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('hcf-lcm')}
        onMarkComplete={() => handleMarkComplete('hcf-lcm')}
      />
    );
  }

  // Render custom Factors vs Multiples challenge if matched
  if (currentPair?.id === 'factors-multiples' && phase === 'activity') {
    return (
      <FactorsMultiplesChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('factors-multiples')}
        onMarkComplete={() => handleMarkComplete('factors-multiples')}
      />
    );
  }

  // Render custom Congruence vs Similarity challenge if matched
  if (currentPair?.id === 'congruence-similarity' && phase === 'activity') {
    return (
      <CongruenceSimilarityChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('congruence-similarity')}
        onMarkComplete={() => handleMarkComplete('congruence-similarity')}
      />
    );
  }

  // Render custom Matrices vs Determinants challenge if matched
  if (currentPair?.id === 'matrices-determinants' && phase === 'activity') {
    return (
      <MatricesDeterminantsChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('matrices-determinants')}
        onMarkComplete={() => handleMarkComplete('matrices-determinants')}
      />
    );
  }

  // Render custom Mean vs Median vs Mode challenge if matched
  if (currentPair?.id === 'mean-median-mode' && phase === 'activity') {
    return (
      <MeanMedianModeChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('mean-median-mode')}
        onMarkComplete={() => handleMarkComplete('mean-median-mode')}
      />
    );
  }

  // Render custom Limits vs Differentiation challenge if matched
  if (currentPair?.id === 'limits-differentiation' && phase === 'activity') {
    return (
      <LimitsDifferentiationChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('limits-differentiation')}
        onMarkComplete={() => handleMarkComplete('limits-differentiation')}
      />
    );
  }

  // Render custom Differentiation vs Integration challenge if matched
  if (currentPair?.id === 'differentiation-integration' && phase === 'activity') {
    return (
      <DifferentiationIntegrationChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('differentiation-integration')}
        onMarkComplete={() => handleMarkComplete('differentiation-integration')}
      />
    );
  }

  // Render custom Decimals vs Fractions challenge if matched
  if (currentPair?.id === 'decimals-fractions' && phase === 'activity') {
    return (
      <DecimalsFractionsChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('decimals-fractions')}
        onMarkComplete={() => handleMarkComplete('decimals-fractions')}
      />
    );
  }

  // Render custom Permutation vs Combination challenge if matched
  if (currentPair?.id === 'permutation-combination' && phase === 'activity') {
    return (
      <PermutationCombinationChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('permutation-combination')}
        onMarkComplete={() => handleMarkComplete('permutation-combination')}
      />
    );
  }

  // Render custom Prime vs Composite challenge if matched
  if (currentPair?.id === 'prime-composite' && phase === 'activity') {
    return (
      <PrimeCompositeChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('prime-composite')}
        onMarkComplete={() => handleMarkComplete('prime-composite')}
      />
    );
  }

  // Render custom Trigonometry vs Inverse Trigonometry challenge if matched
  if (currentPair?.id === 'trig-inverse-trig' && phase === 'activity') {
    return (
      <TrigInverseTrigChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('trig-inverse-trig')}
        onMarkComplete={() => handlePairComplete('trig-inverse-trig', true)}
      />
    );
  }

  // Render custom Linear Equation vs Simultaneous Equations challenge if matched
  if (currentPair?.id === 'linear-simultaneous' && phase === 'activity') {
    return (
      <LinearSimultaneousChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('linear-simultaneous')}
        onMarkComplete={() => handleMarkComplete('linear-simultaneous')}
      />
    );
  }

  // Render custom Interior Angles vs Exterior Angles challenge if matched
  if (currentPair?.id === 'interior-exterior' && phase === 'activity') {
    return (
      <InteriorExteriorChallenge
        onBack={() => setPhase('list')}
        onComplete={() => handlePairComplete('interior-exterior')}
        onMarkComplete={() => handleMarkComplete('interior-exterior')}
      />
    );
  }

  // Safety fallback — should never render since all pair IDs are handled above
  return null;
}

export function QuizLayoutExtension({ children }) {
  const [currentMode, setCurrentMode] = useState(null);
  const [unlockedList, setUnlockedList] = useState([]);
  const [completedModulesList, setCompletedModulesList] = useState([]);
  const [completedPairsList, setCompletedPairsList] = useState([]);

  useEffect(() => {
    setCurrentMode(window.currentTenaliMode);
  }, []);

  const isFinished = hasFinishedBox(children);

  // Auto unlock when finished and sync states to ensure UI matches updated localStorage
  useEffect(() => {
    if (isFinished && currentMode) {
      unlockContrastChallengeForMode(currentMode);

      try {
        const keys = getStorageKeys();
        const completedStr = localStorage.getItem(keys.completedModules) || '[]';
        setCompletedModulesList(JSON.parse(completedStr));

        const unlockedStr = localStorage.getItem(keys.unlocked) || '[]';
        setUnlockedList(JSON.parse(unlockedStr));

        const seenStr = localStorage.getItem(keys.seen) || '{"seenPairs":[],"completedPairs":[]}';
        setCompletedPairsList(JSON.parse(seenStr).completedPairs || []);
      } catch (e) {
        console.error('Error reading localStorage in effect:', e);
      }
    }
  }, [isFinished, currentMode]);

  if (!isFinished || !currentMode) return null;

  // Get all associated contrast challenges for the current mode
  const associatedContrasts = Object.entries(CONTRAST_MAPPING)
    .filter(([_, modes]) => modes.includes(currentMode))
    .map(([id]) => {
      const keys = getStorageKeys();
      const completedPairs = completedPairsList.length > 0
        ? completedPairsList
        : (() => {
          try {
            const seenStr = localStorage.getItem(keys.seen) || '{"seenPairs":[],"completedPairs":[]}';
            return JSON.parse(seenStr).completedPairs || [];
          } catch { return []; }
        })();

      const isCompleted = completedPairs.includes(id);

      return {
        id,
        title: CHALLENGE_TITLES[id] || id,
        isCompleted
      };
    });

  if (associatedContrasts.length === 0) return null;

  return (
    <div style={{
      marginTop: '32px',
      padding: '24px',
      background: 'var(--clr-surface)',
      borderRadius: '12px',
      border: '1px solid var(--clr-border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <span style={{ fontSize: '1.6rem', userSelect: 'none' }}>🧩</span>
        <div>
          <h3 style={{ margin: 0, color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700' }}>
            Contrast Challenges
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.88rem', color: 'var(--clr-text-soft)' }}>
            Deepen your understanding by comparing similar concepts in this topic.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {associatedContrasts.map(challenge => {
          const { id, title, isCompleted } = challenge;

          return (
            <div
              key={id}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '8px',
                background: 'var(--clr-surface)',
                border: isCompleted ? '1.5px solid var(--clr-correct)' : '1.5px solid var(--clr-accent)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '140px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
              onClick={() => {
                localStorage.setItem('tenali-start-contrast-id', id);
                window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: 'contrastlist' }));
              }}
            >
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(92, 184, 122, 0.15)',
                  border: '1.5px solid var(--clr-correct)',
                  color: 'var(--clr-correct)',
                  zIndex: 2
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )}
              <h4 style={{ 
                margin: '0 auto', 
                fontSize: '0.92rem', 
                color: 'var(--clr-text)', 
                fontWeight: '700',
                lineHeight: '1.2',
                width: '90%',
                minHeight: '44px',
                background: 'var(--clr-badge)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}>
                {title}
              </h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to check if a welcome-box / finished screen is rendered
function hasFinishedBox(children) {
  try {
    let found = false;
    const traverse = (node) => {
      if (found || !node) return;
      if (typeof node === 'object') {
        if (node.props) {
          if (node.props.className === 'final-score') {
            found = true;
            return;
          }
          if (node.props.className === 'welcome-box') {
            if (hasFinishedText(node.props.children)) {
              found = true;
              return;
            }
          }
          if (node.props.children) {
            if (Array.isArray(node.props.children)) {
              node.props.children.forEach(traverse);
            } else {
              traverse(node.props.children);
            }
          }
        }
      }
    };

    const hasFinishedText = (childNode) => {
      if (!childNode) return false;
      if (typeof childNode === 'string') {
        const lower = childNode.toLowerCase();
        return lower.includes('score') || lower.includes('complete') || lower.includes('again');
      }
      if (typeof childNode === 'number') {
        return false;
      }
      if (typeof childNode === 'object') {
        if (Array.isArray(childNode)) {
          return childNode.some(hasFinishedText);
        }
        if (childNode.props && childNode.props.children) {
          return hasFinishedText(childNode.props.children);
        }
      }
      return false;
    };

    if (Array.isArray(children)) {
      children.forEach(traverse);
    } else {
      traverse(children);
    }
    return found;
  } catch (e) {
    console.error('Error in hasFinishedBox:', e);
    return false;
  }
}

export function unlockContrastChallengeForMode(mode) {
  try {
    const keys = getStorageKeys();
    // 1. Load and update completed modules
    const completedStr = localStorage.getItem(keys.completedModules) || '[]';
    const completed = JSON.parse(completedStr);
    let updated = false;
    if (!completed.includes(mode)) {
      completed.push(mode);
      localStorage.setItem(keys.completedModules, JSON.stringify(completed));
      updated = true;
    }

    // 2. Load current unlocked contrast challenges
    const unlockedStr = localStorage.getItem(keys.unlocked) || '[]';
    const unlocked = JSON.parse(unlockedStr);

    // 3. Find which contrast challenges can be unlocked now (all required modules must be completed)
    Object.entries(CONTRAST_MAPPING).forEach(([challengeId, requiredModules]) => {
      const allCompleted = requiredModules.every(m => completed.includes(m));
      if (allCompleted && !unlocked.includes(challengeId)) {
        unlocked.push(challengeId);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(keys.unlocked, JSON.stringify(unlocked));
    }

    // Sync to server if authenticated
    const token = localStorage.getItem('tenali-auth-token');
    if (token) {
      syncContrastProgress(token);
    }
  } catch (e) {
    console.error('Error unlocking contrast challenge:', e);
  }
}

const styles = {
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--clr-text-soft)',
    marginBottom: '4px',
  },
  conceptText: {
    margin: 0,
    fontSize: '1rem',
    lineHeight: '1.4',
  },
  conceptFormula: {
    margin: 0,
    fontSize: '1rem',
    fontFamily: 'monospace',
    color: 'var(--clr-text)',
  },
  conceptExample: {
    margin: 0,
    fontSize: '1rem',
    fontStyle: 'italic',
    color: 'var(--clr-text-soft)',
  },
  conceptSignal: {
    margin: 0,
    fontSize: '1rem',
    color: 'var(--clr-accent)',
  },
};

function AreaPerimeterChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-area'); // vd-area, vd-perimeter, intro, r1, r2, r3_1, r3_2, comparison, q1, q2, q3, q4, practice-redirect
  const [isFilled, setIsFilled] = useState(false);
  const [isBorderGlowing, setIsBorderGlowing] = useState(false);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [revealedConcept, setRevealedConcept] = useState(''); // "That's Area!" or "That's Perimeter!"



  // Helper to determine the active step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-area' || subStep === 'vd-perimeter') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'r3_1' || subStep === 'r3_2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Reset animations and states when moving to a new step
  useEffect(() => {
    setIsFilled(false);
    setIsBorderGlowing(false);
    setAnswerState('unanswered');
    setWrongAttempts(0);
    setFeedbackText('');
    setHintText('');
    setRevealedConcept('');

    // Reset Layer 3
  }, [subStep]);

  // Q1 handling

  // Q2 handling

  // Q3 handling

  // Q4 handling



  // Mark as completed immediately when Q4 is fully sorted

  const handleRegionClick = (clickedRegion) => {
    if (answerState === 'correct') return;

    // Determine target region for current step
    let targetRegion = 'inside';
    let conceptLabel = "Area";
    if (subStep === 'r1' || subStep === 'r3_1') {
      targetRegion = 'inside';
      conceptLabel = "Area";
    } else if (subStep === 'r2' || subStep === 'r3_2') {
      targetRegion = 'boundary';
      conceptLabel = "Perimeter";
    }

    if (clickedRegion === targetRegion) {
      setAnswerState('correct');
      setRevealedConcept(`That's ${conceptLabel}!`);

      if (conceptLabel === 'Area') {
        setIsFilled(true);
        setIsBorderGlowing(false);
      } else {
        setIsBorderGlowing(true);
        setIsFilled(false);
      }

      // Set feedback text based on step
      if (subStep === 'r1') {
        setFeedbackText("Correct! You selected the inside of the garden, so we're measuring Area.");
      } else if (subStep === 'r2') {
        setFeedbackText("Correct! Only the boundary is measured, so this is Perimeter.");
      } else if (subStep === 'r3_1') {
        setFeedbackText("Correct! Tiles cover the floor, which is the Area inside.");
      } else if (subStep === 'r3_2') {
        setFeedbackText("Correct! Rope surrounds the pool boundary, which is the Perimeter.");
      }
      setHintText('');
    } else {
      // Wrong click
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      // Flash wrong feedback visual cue briefly
      if (clickedRegion === 'inside') {
        setIsFilled(true);
        setTimeout(() => {
          setIsFilled(false);
        }, 1000);
      } else {
        setIsBorderGlowing(true);
        setTimeout(() => {
          setIsBorderGlowing(false);
        }, 1000);
      }

      if (newAttempts === 1) {
        setHintText("Hint 1: Are we covering the inside or surrounding it?");
      } else if (newAttempts === 2) {
        setHintText("Hint 2: Look carefully at where the work happens.");
      } else {
        // Auto reveal after 3 wrong clicks
        setAnswerState('correct');
        setRevealedConcept(`That's ${conceptLabel}!`);
        if (conceptLabel === 'Area') {
          setIsFilled(true);
          setIsBorderGlowing(false);
        } else {
          setIsBorderGlowing(true);
          setIsFilled(false);
        }
      }
    }
  };

  const handleNext = () => {
    if (subStep === 'vd-area') setSubStep('vd-perimeter');
    else if (subStep === 'vd-perimeter') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('r3_1');
    else if (subStep === 'r3_1') setSubStep('r3_2');
    else if (subStep === 'r3_2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const hoverStyles = `
    .region-inside {
      fill: transparent;
      transition: fill 0.2s ease;
      cursor: pointer;
    }
    .region-inside:hover {
      fill: rgba(92, 184, 122, 0.12) !important;
    }
    .region-boundary {
      fill: none;
      stroke: transparent;
      stroke-width: 16;
      transition: stroke 0.2s ease;
      cursor: pointer;
    }
    .region-boundary:hover {
      stroke: rgba(232, 134, 74, 0.22) !important;
    }
    /* Shape Visibility Loops (15s total loop) */
    @keyframes shape1Vis {
      0%, 30% { opacity: 1; visibility: visible; }
      33.3%, 100% { opacity: 0; visibility: hidden; }
    }
    @keyframes shape2Vis {
      0%, 33.3% { opacity: 0; visibility: hidden; }
      36.6%, 66.6% { opacity: 1; visibility: visible; }
      70%, 100% { opacity: 0; visibility: hidden; }
    }
    @keyframes shape3Vis {
      0%, 70% { opacity: 0; visibility: hidden; }
      73.3%, 96.6% { opacity: 1; visibility: visible; }
      100% { opacity: 0; visibility: hidden; }
    }

    .shape1-group {
      animation: shape1Vis 15s infinite ease-in-out;
    }
    .shape2-group {
      animation: shape2Vis 15s infinite ease-in-out;
    }
    .shape3-group {
      animation: shape3Vis 15s infinite ease-in-out;
    }

    /* Area Rising Fill Loop (5s loop) */
    @keyframes raiseFillLoop {
      0%, 12% { transform: scaleY(0); }
      48%, 82% { transform: scaleY(1); }
      92%, 100% { transform: scaleY(0); }
    }
    .area-solid-fill {
      transform-origin: 160px 290px;
      animation: raiseFillLoop 5s infinite ease-in-out;
    }

    /* Perimeter Path Drawing Loops (5s loop) */
    @keyframes drawRectStroke {
      0%, 12% { stroke-dashoffset: 1040; }
      48%, 82% { stroke-dashoffset: 0; }
      92%, 100% { stroke-dashoffset: 1040; }
    }
    @keyframes drawTriStroke {
      0%, 12% { stroke-dashoffset: 850; }
      48%, 82% { stroke-dashoffset: 0; }
      92%, 100% { stroke-dashoffset: 850; }
    }
    @keyframes drawCircleStroke {
      0%, 12% { stroke-dashoffset: 820; }
      48%, 82% { stroke-dashoffset: 0; }
      92%, 100% { stroke-dashoffset: 820; }
    }

    .perimeter-rect-draw {
      animation: drawRectStroke 5s infinite ease-in-out;
    }
    .perimeter-tri-draw {
      animation: drawTriStroke 5s infinite ease-in-out;
    }
    .perimeter-circle-draw {
      animation: drawCircleStroke 5s infinite ease-in-out;
    }
  `;

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{hoverStyles}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Area vs Perimeter
        </span>
        <div style={{ width: '70px' }} /> {/* Balance placeholder matching back-button size */}
      </div>

      {renderProgressBar()}

      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Area</strong> or <strong>Perimeter</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNext} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {subStep === 'vd-area' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            AREA
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Area measures the amount of space inside a flat shape.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/contrast/area.png"
                alt="Area illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Area is everything inside a shape.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Perimeter ➔
          </button>
        </div>
      )}

      {subStep === 'vd-perimeter' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            PERIMETER
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Perimeter measures the distance around the outer boundary of a shape.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/contrast/perimeter.png"
                alt="Perimeter illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 40px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Perimeter is everything around a shape.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Continue ➔
          </button>
        </div>
      )}

      {(subStep === 'r1' || subStep === 'r2') && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <svg width="300" height="180" viewBox="0 0 300 180" style={{ background: 'var(--clr-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: 'var(--shadow-btn)' }}>
              {/* Paint Fill Animation (Left to Right) */}
              <rect
                x="25"
                y="25"
                width={isFilled ? 250 : 0}
                height="130"
                fill="rgba(92, 184, 122, 0.4)"
                style={{ transition: 'width 1.5s ease-in-out' }}
              />
              {/* Fence Drawing Animation (strokeDashoffset) */}
              <rect
                x="25"
                y="25"
                width="250"
                height="130"
                rx="8"
                fill="none"
                stroke="var(--clr-accent)"
                strokeWidth="6"
                strokeDasharray="760"
                strokeDashoffset={isBorderGlowing ? 0 : 760}
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
              <text x="150" y="95" textAnchor="middle" fill="var(--clr-text)" fontSize="16" fontWeight="600" style={{ pointerEvents: 'none' }}>Garden</text>

              {/* Clickable regions (invisible overlays with hover effects) */}
              <rect
                className="region-inside"
                x="28"
                y="28"
                width="244"
                height="124"
                onClick={() => handleRegionClick('inside')}
              />
              <rect
                className="region-boundary"
                x="25"
                y="25"
                width="250"
                height="130"
                rx="8"
                onClick={() => handleRegionClick('boundary')}
              />
            </svg>
          </div>

          <p style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '8px' }}>
            {subStep === 'r1' ? 'The owner wants to cover the garden with green grass.' : 'The owner wants to build a fence around the garden boundary.'}
          </p>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.02rem', marginBottom: '24px' }}>
            Hover and click the part of the garden that should be measured.
          </p>

          {answerState === 'unanswered' ? (
            <div style={{ minHeight: '60px' }}>
              {hintText && (
                <p style={{ color: 'var(--clr-accent)', fontWeight: '600', margin: '0', fontSize: '1.05rem' }}>
                  {hintText}
                </p>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '18px 24px',
                background: 'var(--clr-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--clr-border)',
                borderLeft: '5px solid var(--clr-correct)',
                marginBottom: '20px'
              }}>
                <span style={{ color: 'var(--clr-accent)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {revealedConcept}
                </span>
                <span style={{ color: 'var(--clr-text)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--clr-correct)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  {feedbackText}
                </span>
              </div>
              <div>
                <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {(subStep === 'r3_1' || subStep === 'r3_2') && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <svg width="300" height="180" viewBox="0 0 300 180" style={{ background: 'var(--clr-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: 'var(--shadow-btn)' }}>
              {/* Tiles Fill Animation */}
              <rect
                x="25"
                y="25"
                width={isFilled ? 250 : 0}
                height="130"
                rx="12"
                fill="rgba(75, 163, 227, 0.4)"
                style={{ transition: 'width 1.5s ease-in-out' }}
              />
              {/* Rope Drawing Animation */}
              <rect
                x="25"
                y="25"
                width="250"
                height="130"
                rx="12"
                fill="none"
                stroke="#e05a4a"
                strokeWidth="6"
                strokeDasharray="760"
                strokeDashoffset={isBorderGlowing ? 0 : 760}
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
              <text x="150" y="95" textAnchor="middle" fill="var(--clr-text)" fontSize="16" fontWeight="600" style={{ pointerEvents: 'none' }}>Swimming Pool</text>

              {/* Clickable regions */}
              <rect
                className="region-inside"
                x="28"
                y="28"
                width="244"
                height="124"
                onClick={() => handleRegionClick('inside')}
              />
              <rect
                className="region-boundary"
                x="25"
                y="25"
                width="250"
                height="130"
                rx="12"
                onClick={() => handleRegionClick('boundary')}
              />
            </svg>
          </div>

          <p style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '8px' }}>
            {subStep === 'r3_1' ? 'The owner wants to cover the pool floor with tiles.' : 'The owner wants to put a safety rope around the pool edge.'}
          </p>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.02rem', marginBottom: '24px' }}>
            Hover and click the part of the pool that should be measured.
          </p>

          {answerState === 'unanswered' ? (
            <div style={{ minHeight: '60px' }}>
              {hintText && (
                <p style={{ color: 'var(--clr-accent)', fontWeight: '600', margin: '0', fontSize: '1.05rem' }}>
                  {hintText}
                </p>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '18px 24px',
                background: 'var(--clr-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--clr-border)',
                borderLeft: '5px solid var(--clr-correct)',
                marginBottom: '20px'
              }}>
                <span style={{ color: 'var(--clr-accent)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {revealedConcept}
                </span>
                <span style={{ color: 'var(--clr-text)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--clr-correct)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  {feedbackText}
                </span>
              </div>
              <div>
                <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {subStep === 'comparison' && (
        <div>
          {/* Premium side-by-side comparison cards */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Area Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              border: isFilled ? '2px solid var(--clr-correct)' : '2.5px solid var(--clr-border)',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                AREA
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Measures:</strong> The space inside a shape.
              </p>
              <div style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Examples:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.92rem' }}>
                  <li>Paint for a wall</li>
                  <li>Carpet for a room</li>
                </ul>
              </div>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Units:</strong> Square units (e.g. cm², m²)
              </p>
            </div>

            {/* Perimeter Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              border: isBorderGlowing ? '2px solid var(--clr-accent)' : '2.5px solid var(--clr-border)',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                PERIMETER
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Measures:</strong> The distance around a shape.
              </p>
              <div style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Examples:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.92rem' }}>
                  <li>Photo frame for a picture</li>
                  <li>Decorating the border of a table</li>
                </ul>
              </div>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Units:</strong> Linear units (e.g. cm, m)
              </p>
            </div>
          </div>

          {/* Memory / Decision Rule card */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>
              Before solving, ask yourself: Am I measuring...
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '200px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Am I covering the</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)' }}>INSIDE?</strong>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginTop: '4px' }}>Use Area</span>
              </div>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '200px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Am I going</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)' }}>AROUND?</strong>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginTop: '4px' }}>Use Perimeter</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Apply the Rule */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Area vs Perimeter challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['area-perimeter'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RadiusDiameterChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-radius'); // vd-radius, vd-diameter, intro, r1, r2, r3, comparison, q1, q2, practice-redirect
  const [firstClick, setFirstClick] = useState(null);
  const [secondClick, setSecondClick] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [revealedConcept, setRevealedConcept] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Layer 2
  const [comparisonMode, setComparisonMode] = useState('both'); // radius, diameter, both


  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-radius' || subStep === 'vd-diameter') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // R3 animation stages
  const [r3Stage, setR3Stage] = useState('stage1');

  useEffect(() => {
    if (subStep === 'r3') {
      setR3Stage('stage1');
      const t1 = setTimeout(() => setR3Stage('stage2'), 1500);
      const t2 = setTimeout(() => setR3Stage('stage3'), 3200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [subStep]);

  useEffect(() => {
    // Reset drawing state when moving to a drawing step
    setFirstClick(null);
    setSecondClick(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setRevealedConcept('');
    setWrongAttempts(0);

    // Reset Layer 3
  }, [subStep]);

  // Save progress automatically when final practice step is completed

  const svgRef = useRef(null);

  const handleSvgClick = (e) => {
    if (answerState === 'correct') return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 200;

    const distToCenter = Math.sqrt(Math.pow(x - 150, 2) + Math.pow(y - 100, 2));
    let clickedPoint = null;

    if (distToCenter <= 16) {
      clickedPoint = { x: 150, y: 100, type: 'center' };
    } else if (distToCenter >= 50 && distToCenter <= 95) {
      const angle = Math.atan2(y - 100, x - 150);
      const projX = 150 + 70 * Math.cos(angle);
      const projY = 100 + 70 * Math.sin(angle);
      clickedPoint = { x: projX, y: projY, type: 'boundary' };
    }

    if (!clickedPoint) return;

    if (!firstClick) {
      setFirstClick(clickedPoint);
    } else if (!secondClick) {
      const sameSpot = Math.sqrt(Math.pow(clickedPoint.x - firstClick.x, 2) + Math.pow(clickedPoint.y - firstClick.y, 2)) < 12;
      if (sameSpot) return;

      setSecondClick(clickedPoint);
      checkLine(firstClick, clickedPoint);
    }
  };

  const handleClear = () => {
    setFirstClick(null);
    setSecondClick(null);
    setAnswerState('unanswered');
    setHintText('');
  };

  const checkLine = (p1, p2) => {
    if (subStep === 'r1') {
      const hasCenter = p1.type === 'center' || p2.type === 'center';
      const hasBoundary = p1.type === 'boundary' || p2.type === 'boundary';

      if (hasCenter && hasBoundary) {
        setAnswerState('correct');
        setRevealedConcept("That's a Radius!");
        setFeedbackText("Great! A radius always starts from the center and ends at the circle boundary.");
        setHintText('');
      } else {
        setAnswerState('wrong');
        setWrongAttempts(prev => prev + 1);
        setHintText("Hint: Does your line begin at the center? A radius must start at the center dot.");
      }
    } else if (subStep === 'r2') {
      const bothBoundary = p1.type === 'boundary' && p2.type === 'boundary';

      const vx = p2.x - p1.x;
      const vy = p2.y - p1.y;
      const wx = 150 - p1.x;
      const wy = 100 - p1.y;

      const lensq = vx * vx + vy * vy;
      let t = (wx * vx + wy * vy) / lensq;
      t = Math.max(0, Math.min(1, t));
      const projX = p1.x + t * vx;
      const projY = p1.y + t * vy;
      const distToCenter = Math.sqrt(Math.pow(150 - projX, 2) + Math.pow(100 - projY, 2));

      const passesThroughCenter = distToCenter <= 12;

      if (bothBoundary && passesThroughCenter) {
        setAnswerState('correct');
        setRevealedConcept("That's a Diameter!");
        setFeedbackText("Great! A diameter joins two points on the circle and passes directly through the center.");
        setHintText('');
      } else {
        setAnswerState('wrong');
        setWrongAttempts(prev => prev + 1);
        if (p1.type === 'center' || p2.type === 'center') {
          setHintText("Hint: A diameter must cross the entire circle from one side to the other. Try selecting two opposite points on the boundary.");
        } else {
          setHintText("Hint: A diameter must pass through the center point. Try selecting two opposite points.");
        }
      }
    }
  };

  const handleNext = () => {
    if (subStep === 'vd-radius') setSubStep('vd-diameter');
    else if (subStep === 'vd-diameter') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };



  const drawInteractiveCircle = () => (
    <svg
      ref={svgRef}
      width="300"
      height="200"
      viewBox="0 0 300 200"
      onClick={handleSvgClick}
      style={{
        background: 'var(--clr-surface)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-btn)',
        cursor: answerState === 'correct' ? 'default' : 'crosshair'
      }}
    >
      <circle cx="150" cy="100" r="70" fill="none" stroke="var(--clr-border)" strokeWidth="3" />
      <circle cx="150" cy="100" r="6" fill="var(--clr-accent)" style={{ cursor: 'pointer' }} />
      <text x="150" y="120" textAnchor="middle" fill="var(--clr-accent)" fontSize="11" fontWeight="600" style={{ pointerEvents: 'none' }}>Center</text>

      {firstClick && (
        <circle cx={firstClick.x} cy={firstClick.y} r="6" fill="var(--clr-accent)" />
      )}
      {secondClick && (
        <circle cx={secondClick.x} cy={secondClick.y} r="6" fill="var(--clr-accent)" />
      )}
      {firstClick && secondClick && (
        <line
          x1={firstClick.x}
          y1={firstClick.y}
          x2={secondClick.x}
          y2={secondClick.y}
          stroke={answerState === 'correct' ? 'var(--clr-correct)' : answerState === 'wrong' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}
          strokeWidth="4"
        />
      )}
    </svg>
  );

  const circleStyles = `
    @keyframes circleReveal {
      0%, 10% { opacity: 0; transform: scale(0.95); }
      15%, 85% { opacity: 1; transform: scale(1); }
      90%, 100% { opacity: 0; }
    }
    @keyframes lineRadiusGrow {
      0%, 20% { stroke-dashoffset: 70; }
      45%, 85% { stroke-dashoffset: 0; }
      90%, 100% { stroke-dashoffset: 70; }
    }
    @keyframes lineDiameterGrow {
      0%, 20% { stroke-dashoffset: 140; }
      50%, 85% { stroke-dashoffset: 0; }
      90%, 100% { stroke-dashoffset: 140; }
    }
    @keyframes lineGlow {
      0%, 50%, 85%, 100% { filter: drop-shadow(0px 0px 0px var(--clr-accent)); }
      60%, 75% { filter: drop-shadow(0px 0px 5px var(--clr-accent)); stroke-width: 4.5px; }
    }

    .circle-fade { animation: circleReveal 6s infinite ease-in-out; transform-origin: 150px 100px; }
    .radius-line-grow {
      animation: lineRadiusGrow 6s infinite ease-in-out, lineGlow 6s infinite ease-in-out;
      stroke-dasharray: 70;
      stroke-dashoffset: 70;
    }
    .diameter-line-grow {
      animation: lineDiameterGrow 6s infinite ease-in-out, lineGlow 6s infinite ease-in-out;
      stroke-dasharray: 140;
      stroke-dashoffset: 140;
    }
  `;

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        ${circleStyles}
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Radius vs Diameter
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-radius' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            RADIUS
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Observe the highlighted line segment extending from the center of the circle to its outer edge.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '300px',
              height: '200px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/radius.png"
                alt="Radius representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A radius is the distance from the center to the circle.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Diameter ➔
          </button>
        </div>
      )}

      {subStep === 'vd-diameter' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            DIAMETER
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Observe the highlighted line segment that cuts completely across the circle directly through the center.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '300px',
              height: '200px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/diameter.png"
                alt="Diameter representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A diameter is the distance across the circle through its center.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Interactive Challenge ➔
          </button>
        </div>
      )}

      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Radius</strong> or <strong>Diameter</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNext} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {(subStep === 'r1' || subStep === 'r2') && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            {drawInteractiveCircle()}
          </div>

          <p style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '8px' }}>
            {subStep === 'r1' ? 'Draw a Radius' : 'Now draw a Diameter'}
          </p>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.02rem', marginBottom: '24px' }}>
            {subStep === 'r1'
              ? 'Click the Center dot, then click any point on the outer circle boundary.'
              : 'Click a point on the circle boundary, then click a point on the opposite side passing through the center.'}
          </p>

          {answerState === 'unanswered' && (
            <div style={{ minHeight: '60px' }}>
              {firstClick && !secondClick && (
                <p style={{ color: 'var(--clr-accent)', fontWeight: '500' }}>
                  First point selected! Now click the second point to draw the line.
                </p>
              )}
            </div>
          )}

          {answerState === 'wrong' && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--clr-wrong)', fontWeight: '600', marginBottom: '12px' }}>
                {hintText}
              </p>
              <button className="secondary" onClick={handleClear} style={{ padding: '8px 16px', fontSize: '0.95rem' }}>Clear & Try Again</button>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '18px 24px',
                background: 'var(--clr-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--clr-border)',
                borderLeft: '5px solid var(--clr-correct)',
                marginBottom: '20px'
              }}>
                <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {revealedConcept}
                </span>
                <span style={{ color: 'var(--clr-text)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--clr-correct)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  {feedbackText}
                </span>
              </div>
              <div>
                <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {subStep === 'comparison' && (
        <div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Radius Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid #4ba3e3',
              flex: '1 1 300px',
              maxWidth: '340px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: '#4ba3e3', fontWeight: 'bold' }}>
                RADIUS
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The distance from the center to any point on the circle.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', margin: 0 }}>
                <strong>Formula:</strong>
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', lineHeight: '1' }}>
                  <span style={{ borderBottom: '1px solid var(--clr-text)', padding: '0 4px', fontSize: '0.95rem' }}>diameter</span>
                  <span style={{ fontSize: '0.95rem', paddingTop: '2px' }}>2</span>
                </span>
              </div>
            </div>

            {/* Diameter Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 300px',
              maxWidth: '340px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                DIAMETER
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The distance across the circle through the center.
              </p>
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong>Formula:</strong> <code style={{ fontSize: '1.1rem', background: 'var(--clr-border)', padding: '2px 6px', borderRadius: '4px' }}>radius * 2</code>
              </p>
            </div>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>
              Before solving a circular question, ask:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '8px' }}>Does the line start at center?</span>
                <strong style={{ fontSize: '1.3rem', color: '#4ba3e3' }}>RADIUS</strong>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', lineHeight: '1', marginTop: '8px' }}>

                </div>
              </div>
              <div style={{ background: 'var(--clr-card)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '8px' }}>Does it cross center completely?</span>
                <strong style={{ fontSize: '1.3rem', color: 'var(--clr-correct)' }}>DIAMETER</strong>

              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Radius vs Diameter challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['radius-diameter'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function HcfLcmChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-hcf'); // vd-hcf, vd-lcm, intro, r1, r2, comparison, q1, q2, practice-redirect
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-hcf' || subStep === 'vd-lcm') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const hcfLcmStyles = `
    @keyframes hcfItemFade {
      0% { opacity: 0; transform: translateY(8px) scale(0.9); }
      10%, 93% { opacity: 1; transform: translateY(0) scale(1); }
      96%, 100% { opacity: 0; }
    }

    @keyframes hcfLineFade {
      0%, 54% { opacity: 0; }
      57%, 93% { opacity: 1; }
      96%, 100% { opacity: 0; }
    }

    @keyframes hcfCommonAnim {
      0%, 54% { fill: var(--clr-card); stroke: var(--clr-border); }
      57%, 93% { fill: rgba(92,184,122,0.1); stroke: var(--clr-correct); }
      96%, 100% { fill: var(--clr-card); stroke: var(--clr-border); }
    }

    @keyframes hcfGreatestAnim {
      0%, 72% { transform: scale(1); fill: var(--clr-card); stroke: var(--clr-border); filter: none; }
      75%, 93% { transform: scale(1.22); fill: var(--clr-correct); stroke: var(--clr-correct); filter: drop-shadow(0 0 6px rgba(92,184,122,0.5)); }
      96%, 100% { transform: scale(1); fill: var(--clr-card); stroke: var(--clr-border); filter: none; }
    }

    @keyframes hcfGreatestText {
      0%, 72% { fill: var(--clr-text); }
      75%, 93% { fill: white; }
      96%, 100% { fill: var(--clr-text); }
    }

    .hcf-f12-item, .hcf-f18-item {
      animation: hcfItemFade 8s infinite ease-out;
      animation-fill-mode: both;
    }
    .hcf-common-high rect {
      animation: hcfCommonAnim 8s infinite ease-in-out;
    }
    .hcf-greatest-glow {
      transform-origin: 0px 0px;
      animation: hcfGreatestAnim 8s infinite ease-in-out;
    }
    .hcf-greatest-glow text {
      animation: hcfGreatestText 8s infinite ease-in-out;
    }
    .hcf-lines {
      animation: hcfLineFade 8s infinite ease-in-out;
      opacity: 0;
    }

    @keyframes lcmItemFade {
      0% { opacity: 0; transform: translateY(8px) scale(0.9); }
      10%, 93% { opacity: 1; transform: translateY(0) scale(1); }
      96%, 100% { opacity: 0; }
    }

    @keyframes lcmMatchGlow {
      0%, 65% { transform: scale(1); fill: var(--clr-card); stroke: var(--clr-border); filter: none; }
      68%, 93% { transform: scale(1.2); fill: var(--clr-correct); stroke: var(--clr-correct); filter: drop-shadow(0 0 6px rgba(92,184,122,0.5)); }
      96%, 100% { transform: scale(1); fill: var(--clr-card); stroke: var(--clr-border); filter: none; }
    }

    @keyframes lcmMatchText {
      0%, 65% { fill: var(--clr-text); }
      68%, 93% { fill: white; }
      96%, 100% { fill: var(--clr-text); }
    }

    @keyframes lcmLineFade {
      0%, 65% { opacity: 0; stroke-dashoffset: 200; }
      68%, 93% { opacity: 1; stroke-dashoffset: 0; }
      96%, 100% { opacity: 0; stroke-dashoffset: 200; }
    }

    .lcm-m12-item, .lcm-m18-item {
      animation: lcmItemFade 8s infinite ease-out;
      animation-fill-mode: both;
    }
    .lcm-match-node {
      transform-origin: 0px 0px;
      animation: lcmMatchGlow 8s infinite ease-in-out;
    }
    .lcm-match-node text {
      animation: lcmMatchText 8s infinite ease-in-out;
    }
    .lcm-match-line {
      animation: lcmLineFade 8s infinite ease-in-out;
      stroke-dasharray: 6 3;
    }

    @keyframes hcfSummaryFade {
      0%, 72% { opacity: 0; transform: translateY(5px); }
      75%, 93% { opacity: 1; transform: translateY(0); }
      96%, 100% { opacity: 0; }
    }
    .hcf-summary-overlay {
      animation: hcfSummaryFade 8s infinite ease-in-out;
      opacity: 0;
    }

    @keyframes lcmSummaryFade {
      0%, 65% { opacity: 0; transform: translateY(5px); }
      68%, 93% { opacity: 1; transform: translateY(0); }
      96%, 100% { opacity: 0; }
    }
    .lcm-summary-overlay {
      animation: lcmSummaryFade 8s infinite ease-in-out;
      opacity: 0;
    }
  `;

  // R1: LCM conveyor simulation
  const [simTime, setSimTime] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);

  // R2: HCF nuts & bolts factory
  const [numKits, setNumKits] = useState(6);
  const [leftovers, setLeftovers] = useState({ nuts: 0, bolts: 0 });


  // LCM simulation tick timer
  useEffect(() => {
    let timer = null;
    if (isSimRunning) {
      timer = setInterval(() => {
        setSimTime((prev) => {
          const next = prev + 1;
          if (next > 30) return 0; // loop back to 0 if they miss it
          return next;
        });
      }, 300); // 1 simulation second = 300ms
    }
    return () => clearInterval(timer);
  }, [isSimRunning]);

  // Recalculate HCF leftovers
  useEffect(() => {
    const nutsLeft = 36 % numKits;
    const boltsLeft = 24 % numKits;
    setLeftovers({ nuts: nutsLeft, bolts: boltsLeft });
  }, [numKits]);

  // Reset states between subSteps
  useEffect(() => {
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setSimTime(0);
    setIsSimRunning(false);
  }, [subStep]);

  const handleStartStop = () => {
    if (!isSimRunning) {
      setIsSimRunning(true);
      setAnswerState('unanswered');
      setFeedbackText('');
      setHintText('');
    } else {
      setIsSimRunning(false);
      // Check if stopped on a common multiple (where both fire together)
      const isMatch = simTime > 0 && simTime % 6 === 0 && simTime % 8 === 0;
      if (isMatch) {
        setAnswerState('correct');
        setFeedbackText(`Perfect! You stopped at ${simTime} seconds. At this moment, Machine A has fired ${simTime / 6} times and Machine B has fired ${simTime / 8} times. They match together! 24 is the Least Common Multiple (LCM) of 6 and 8.`);
      } else {
        setAnswerState('wrong');
        const firedA = simTime % 6 === 0;
        const firedB = simTime % 8 === 0;
        if (firedA && !firedB) {
          setHintText(`Not quite! At ${simTime} seconds, only Machine A fired (fired every 6 seconds). Machine B only fires on multiples of 8 (8, 16, 24...). Watch for when they both fire together!`);
        } else if (!firedA && firedB) {
          setHintText(`Not quite! At ${simTime} seconds, only Machine B fired (fired every 8 seconds). Machine A only fires on multiples of 6 (6, 12, 18, 24...). Watch for when they both fire together!`);
        } else {
          setHintText(`Neither machine fired at ${simTime} seconds! Keep watching for the moment when both tracks glow at the same time (at 24 seconds).`);
        }
      }
    }
  };

  const handleCheckHcf = () => {
    const nutsLeft = 36 % numKits;
    const boltsLeft = 24 % numKits;

    if (nutsLeft === 0 && boltsLeft === 0) {
      if (numKits === 12) {
        setAnswerState('correct');
        setFeedbackText(`Excellent! 12 is the Highest Common Factor (HCF) of 24 and 36. We can pack exactly 12 identical kits, each containing 3 nuts and 2 bolts, leaving absolutely zero leftovers!`);
        setHintText('');
      } else {
        setAnswerState('wrong');
        setHintText(`Everything fits with no leftovers! But can you split them into more boxes? Try to find a larger number of kits!`);
      }
    } else {
      setAnswerState('wrong');
      setHintText(`Not quite! With ${numKits} kits, we have leftover parts: ${nutsLeft} nuts and ${boltsLeft} bolts. Every kit must be identical with no leftovers!`);
    }
  };

  // Save progress automatically when Q2 is finished

  const handleNext = () => {
    if (subStep === 'vd-hcf') setSubStep('vd-lcm');
    else if (subStep === 'vd-lcm') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };



  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{hcfLcmStyles}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          HCF vs LCM
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-hcf' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            HIGHEST COMMON FACTOR (HCF)
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Examine the factor lines for 12 and 18 to see how they highlight the greatest common divisor.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/hcf.png"
                alt="HCF representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            HCF is the greatest factor shared by two or more numbers.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover LCM ➔
          </button>
        </div>
      )}

      {subStep === 'vd-lcm' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            LEAST COMMON MULTIPLE (LCM)
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Look at the lists of multiples for 12 and 18 to locate the smallest matching value they share.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/lcm.png"
                alt="LCM representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            LCM is the smallest multiple shared by two or more numbers.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>HCF</strong> or <strong>LCM</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNext} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* R1: LCM Two Machines Simulation */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-display)', color: 'var(--clr-accent)' }}>
              Machine Sync Mission
            </h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem', lineHeight: '1.5' }}>
              We have two production machines:
            </p>
            <ul style={{ margin: '0 0 12px 18px', padding: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              <li><strong>Machine A</strong> fires every <strong style={{ color: '#4ba3e3' }}>6 seconds</strong> (blue dots).</li>
              <li><strong>Machine B</strong> fires every <strong style={{ color: '#e8864a' }}>8 seconds</strong> (orange dots).</li>
            </ul>
            <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
              <strong>Your Task:</strong> Click <strong>Start</strong> to run the timeline, and press <strong>Stop</strong> at the exact second when both machines fire at the same time!
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: 'var(--clr-surface)', padding: '18px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              {/* Conveyor Belt Track */}
              <svg width="100%" height="110" viewBox="0 0 320 110" style={{ background: 'var(--clr-card)', borderRadius: '6px', border: '1px solid var(--clr-border)' }}>
                {/* Track A */}
                <line x1="10" y1="30" x2="310" y2="30" stroke="var(--clr-border)" strokeWidth="8" strokeLinecap="round" />
                {[6, 12, 18, 24, 30].map(sec => (
                  <circle
                    key={sec}
                    cx={10 + sec * 10}
                    cy="30"
                    r="8"
                    fill={simTime === sec ? 'var(--clr-accent)' : simTime > sec ? '#4ba3e3' : 'var(--clr-border)'}
                    stroke={simTime === sec ? '#fff' : 'none'}
                    strokeWidth="1.5"
                  />
                ))}
                <text x="315" y="34" fontSize="10" fill="var(--clr-text-soft)" textAnchor="start">6s</text>

                {/* Track B */}
                <line x1="10" y1="70" x2="310" y2="70" stroke="var(--clr-border)" strokeWidth="8" strokeLinecap="round" />
                {[8, 16, 24].map(sec => (
                  <circle
                    key={sec}
                    cx={10 + sec * 10}
                    cy="70"
                    r="8"
                    fill={simTime === sec ? 'var(--clr-accent)' : simTime > sec ? '#e8864a' : 'var(--clr-border)'}
                    stroke={simTime === sec ? '#fff' : 'none'}
                    strokeWidth="1.5"
                  />
                ))}
                <text x="315" y="74" fontSize="10" fill="var(--clr-text-soft)" textAnchor="start">8s</text>

                {/* Red Time Bar */}
                <line
                  x1={10 + simTime * 10}
                  y1="10"
                  x2={10 + simTime * 10}
                  y2="90"
                  stroke="var(--clr-accent)"
                  strokeWidth="2.5"
                />
                <circle cx={10 + simTime * 10} cy="10" r="4" fill="var(--clr-accent)" />

                {/* Current Time Label */}
                <text x={10 + simTime * 10} y="105" textAnchor="middle" fontSize="10" fill="var(--clr-accent)" fontWeight="bold">{simTime}s</text>
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ padding: '8px 16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px' }}>
              <strong>Machine A:</strong> Produces every <span style={{ color: '#4ba3e3' }}>6 sec</span>
            </div>
            <div style={{ padding: '8px 16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px' }}>
              <strong>Machine B:</strong> Produces every <span style={{ color: '#e8864a' }}>8 sec</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              onClick={handleStartStop}
              className={isSimRunning ? 'secondary' : 'primary'}
              style={{ padding: '12px 32px', fontSize: '1.1rem', minWidth: '140px' }}
            >
              {isSimRunning ? '⏸ Stop' : '▶ Start'}
            </button>
            <button
              onClick={() => { setSimTime(0); setAnswerState('unanswered'); setHintText(''); }}
              className="secondary"
              style={{ padding: '12px 24px', fontSize: '1.05rem' }}
            >
              Reset
            </button>
          </div>

          {answerState === 'wrong' && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(235, 94, 85, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-wrong)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-wrong)' }}>Try again!</strong>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{
              padding: '20px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--clr-border)',
              borderLeft: '5px solid var(--clr-correct)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-correct)', fontSize: '1.2rem' }}>
                ✅ Correct! LCM Discovered
              </strong>
              <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>{feedbackText}</p>
              <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next: Factory Challenge →</button>
            </div>
          )}
        </div>
      )}

      {/* R2: HCF Factory Kits packing */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-display)', color: 'var(--clr-accent)' }}>
              Factory Packing Mission
            </h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem', lineHeight: '1.5' }}>
              We have a pile of <strong>36 Nuts (🔩)</strong> and <strong>24 Bolts (⚙️)</strong>.
            </p>
            <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--clr-text-soft)', lineHeight: '1.5' }}>
              <strong>Your Task:</strong> Divide all parts into the <strong>largest possible</strong> number of identical kits.
              Every kit box must contain the same contents, and there must be <strong>no leftover parts</strong> outside.
              <br /><br />
              Use the <strong>+</strong> and <strong>-</strong> buttons to adjust the number of boxes!
            </p>
          </div>

          {/* Adjuster Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
            <button
              className="secondary"
              onClick={() => { setNumKits(k => Math.max(1, k - 1)); setAnswerState('unanswered'); }}
              style={{ width: '44px', height: '44px', fontSize: '1.3rem', borderRadius: '50%' }}
            >
              -
            </button>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '100px' }}>
              {numKits} Kits
            </span>
            <button
              className="secondary"
              onClick={() => { setNumKits(k => Math.min(18, k + 1)); setAnswerState('unanswered'); }}
              style={{ width: '44px', height: '44px', fontSize: '1.3rem', borderRadius: '50%' }}
            >
              +
            </button>
          </div>

          {/* Leftovers alert */}
          <div style={{
            background: leftovers.nuts === 0 && leftovers.bolts === 0 ? 'rgba(92, 184, 122, 0.1)' : 'rgba(235, 94, 85, 0.05)',
            border: `1.5px solid ${leftovers.nuts === 0 && leftovers.bolts === 0 ? 'var(--clr-correct)' : 'var(--clr-border)'}`,
            padding: '12px 18px',
            borderRadius: '6px',
            maxWidth: '360px',
            margin: '0 auto 20px auto',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--clr-text-soft)' }}>Leftovers Tray</h5>
            {leftovers.nuts === 0 && leftovers.bolts === 0 ? (
              <span style={{ color: 'var(--clr-correct)' }}>0 leftovers! Fits perfectly! ✓</span>
            ) : (
              <span style={{ color: 'var(--clr-wrong)' }}>
                🔩 Leftover Nuts: {leftovers.nuts} | ⚙️ Leftover Bolts: {leftovers.bolts}
              </span>
            )}
          </div>

          {/* Kits Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '12px',
            background: 'var(--clr-card)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--clr-border)',
            marginBottom: '24px',
            maxHeight: '320px',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            {Array.from({ length: numKits }).map((_, i) => {
              const nutsInKit = Math.floor(36 / numKits);
              const boltsInKit = Math.floor(24 / numKits);

              const renderIcons = (emoji, count) => {
                if (count <= 0) return <span style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', fontSize: '0.8rem' }}>None</span>;
                if (count > 6) return <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{emoji} × {count}</span>;
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
                    {Array.from({ length: count }).map((_, idx) => (
                      <span key={idx} style={{ fontSize: '1rem' }}>{emoji}</span>
                    ))}
                  </div>
                );
              };

              return (
                <div key={i} style={{
                  padding: '10px',
                  background: 'var(--clr-surface)',
                  border: '1.5px solid var(--clr-border)',
                  borderRadius: '6px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-btn)'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Kit #{i + 1}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '20px' }}>
                      {renderIcons('🔩', nutsInKit)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '20px' }}>
                      {renderIcons('⚙️', boltsInKit)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={handleCheckHcf} style={{ padding: '12px 28px', fontSize: '1.05rem' }}>Check Kit Packing</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(235, 94, 85, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-wrong)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-wrong)' }}>Not quite</strong>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{
              padding: '20px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--clr-border)',
              borderLeft: '5px solid var(--clr-correct)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-correct)', fontSize: '1.2rem' }}>
                ✅ Correct! HCF Discovered
              </strong>
              <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>{feedbackText}</p>
              <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Continue to Review →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison */}
      {subStep === 'comparison' && (
        <div>
          {/* Side-by-side Cards */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* HCF Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                HCF
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The greatest factor shared by two or more numbers.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> HCF of 12 and 18 = 6
              </p>
            </div>

            {/* LCM Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                LCM
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The smallest multiple shared by two or more numbers.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> LCM of 12 and 18 = 36
              </p>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>
              Before picking a formula, ask:
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Need to divide or split?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)' }}>HCF</strong>
              </div>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Need things to meet together?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)' }}>LCM</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the HCF vs LCM challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['hcf-lcm'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FactorsMultiplesChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-factors'); // vd-factors, vd-multiples, intro, r1, r2, discovery, comparison, q1, q2, practice-redirect
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [factorsFrame, setFactorsFrame] = useState(0);
  const [multiplesFrame, setMultiplesFrame] = useState(0);

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-factors' || subStep === 'vd-multiples') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'discovery') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const generateDotStyles = () => {
    let css = '';
    for (let i = 0; i < 18; i++) {
      const angle = (i * 2 * Math.PI) / 18;
      const r = 65;
      const x1 = Math.round(Math.cos(angle) * r);
      const y1 = Math.round(Math.sin(angle) * r);

      const x2 = Math.round((i - 8.5) * 13);
      const y2 = 0;

      const col2 = i % 9;
      const row2 = Math.floor(i / 9);
      const x3 = Math.round((col2 - 4) * 24);
      const y3 = Math.round((row2 - 0.5) * 32);

      const col3 = i % 6;
      const row3 = Math.floor(i / 6);
      const x4 = Math.round((col3 - 2.5) * 32);
      const y4 = Math.round((row3 - 1) * 32);

      css += `
        @keyframes moveDot${i} {
          0%, 15% { transform: translate(${x1}px, ${y1}px); }
          20%, 35% { transform: translate(${x2}px, ${y2}px); }
          40%, 55% { transform: translate(${x3}px, ${y3}px); }
          60%, 75% { transform: translate(${x4}px, ${y4}px); }
          80%, 95% { transform: translate(${x1}px, ${y1}px); }
          100% { transform: translate(${x1}px, ${y1}px); }
        }
        .factor-dot-${i} {
          animation: moveDot${i} 8s infinite ease-in-out;
        }
      `;
    }
    return css;
  };

  const factorsStyles = `
    ${generateDotStyles()}

    @keyframes showEq1 { 0%, 15% { opacity: 1; } 16%, 100% { opacity: 0; } }
    @keyframes showEq2 { 0%, 19% { opacity: 0; } 20%, 35% { opacity: 1; } 36%, 100% { opacity: 0; } }
    @keyframes showEq3 { 0%, 39% { opacity: 0; } 40%, 55% { opacity: 1; } 56%, 100% { opacity: 0; } }
    @keyframes showEq4 { 0%, 59% { opacity: 0; } 60%, 75% { opacity: 1; } 76%, 100% { opacity: 0; } }
    @keyframes showEq5 { 0%, 79% { opacity: 0; } 80%, 95% { opacity: 1; } 96%, 100% { opacity: 0; } }

    .factor-eq-1 { animation: showEq1 8s infinite ease-in-out; }
    .factor-eq-2 { animation: showEq2 8s infinite ease-in-out; }
    .factor-eq-3 { animation: showEq3 8s infinite ease-in-out; }
    .factor-eq-4 { animation: showEq4 8s infinite ease-in-out; }
    .factor-eq-5 { animation: showEq5 8s infinite ease-in-out; }

    @keyframes showMultEq1 { 0%, 15% { opacity: 1; } 16%, 100% { opacity: 0; } }
    @keyframes showMultEq2 { 0%, 19% { opacity: 0; } 20%, 35% { opacity: 1; } 36%, 100% { opacity: 0; } }
    @keyframes showMultEq3 { 0%, 39% { opacity: 0; } 40%, 55% { opacity: 1; } 56%, 100% { opacity: 0; } }
    @keyframes showMultEq4 { 0%, 59% { opacity: 0; } 60%, 75% { opacity: 1; } 76%, 100% { opacity: 0; } }
    @keyframes showMultEq5 { 0%, 79% { opacity: 0; } 80%, 95% { opacity: 1; } 96%, 100% { opacity: 0; } }

    @keyframes showNode1 { 0%, 19% { opacity: 0; transform: scale(0.5); } 20%, 95% { opacity: 1; transform: scale(1); } 96%, 100% { opacity: 0; } }
    @keyframes showArrow1 { 0%, 39% { opacity: 0; } 40%, 95% { opacity: 1; } 96%, 100% { opacity: 0; } }
    @keyframes showNode2 { 0%, 39% { opacity: 0; transform: scale(0.5); } 40%, 95% { opacity: 1; transform: scale(1); } 96%, 100% { opacity: 0; } }
    @keyframes showArrow2 { 0%, 59% { opacity: 0; } 60%, 95% { opacity: 1; } 96%, 100% { opacity: 0; } }
    @keyframes showNode3 { 0%, 59% { opacity: 0; transform: scale(0.5); } 60%, 95% { opacity: 1; transform: scale(1); } 96%, 100% { opacity: 0; } }
    @keyframes showArrow3 { 0%, 79% { opacity: 0; } 80%, 95% { opacity: 1; transform: scale(1); } 96%, 100% { opacity: 0; } }
    @keyframes showNode4 { 0%, 79% { opacity: 0; transform: scale(0.5); } 80%, 95% { opacity: 1; transform: scale(1); } 96%, 100% { opacity: 0; } }

    .mult-eq-1 { animation: showMultEq1 8s infinite ease-in-out; }
    .mult-eq-2 { animation: showMultEq2 8s infinite ease-in-out; }
    .mult-eq-3 { animation: showMultEq3 8s infinite ease-in-out; }
    .mult-eq-4 { animation: showMultEq4 8s infinite ease-in-out; }
    .mult-eq-5 { animation: showMultEq5 8s infinite ease-in-out; }

    .mult-node-1 { animation: showNode1 8s infinite ease-in-out; transform-origin: 50px 20px; }
    .mult-arrow-1 { animation: showArrow1 8s infinite ease-in-out; }
    .mult-node-2 { animation: showNode2 8s infinite ease-in-out; transform-origin: 125px 20px; }
    .mult-arrow-2 { animation: showArrow2 8s infinite ease-in-out; }
    .mult-node-3 { animation: showNode3 8s infinite ease-in-out; transform-origin: 200px 20px; }
    .mult-arrow-3 { animation: showArrow3 8s infinite ease-in-out; }
    .mult-node-4 { animation: showNode4 8s infinite ease-in-out; transform-origin: 270px 20px; }
  `;

  // R1: Factors
  const [factorsFound, setFactorsFound] = useState([]);
  const [machineShake, setMachineShake] = useState(false);
  const [show5Option, setShow5Option] = useState(true);

  // R2: Multiples
  const [multiplesFound, setMultiplesFound] = useState([]);
  const [isGeneratingMultiples, setIsGeneratingMultiples] = useState(false);

  // Discovery
  const [discoverySelection, setDiscoverySelection] = useState(null);

  const [selectedQ1Option, setSelectedQ1Option] = useState(null);

  // Q2: Sorting Game checkboxes for number 10
  const [studentSelections, setStudentSelections] = useState({
    2: { factor: false, multiple: false },
    5: { factor: false, multiple: false },
    10: { factor: false, multiple: false },
    20: { factor: false, multiple: false },
    25: { factor: false, multiple: false },
    50: { factor: false, multiple: false }
  });

  // Trigger machine shake on wrong input
  const triggerShake = () => {
    setMachineShake(true);
    setTimeout(() => setMachineShake(false), 450);
  };

  // Round 1 Factors generator
  const runFindFactors = () => {
    setAnswerState('unanswered');
    setFactorsFound([]);
    const factorsList = [1, 2, 3, 4, 6, 12];
    factorsList.forEach((fact, idx) => {
      setTimeout(() => {
        setFactorsFound(prev => [...prev, fact]);
      }, (idx + 1) * 350);
    });
  };

  // Try to add 5
  const handleTry5 = () => {
    triggerShake();
    setAnswerState('wrong');
    setHintText("5 cannot divide 12 exactly (12 ÷ 5 = 2 with a remainder of 2!). Only numbers that divide 12 with 0 leftovers can enter the machine.");
  };

  // Round 2 Multiples generator
  useEffect(() => {
    let interval = null;
    if (isGeneratingMultiples) {
      interval = setInterval(() => {
        setMultiplesFound((prev) => {
          const nextVal = (prev.length + 1) * 12;
          if (prev.length >= 10) {
            // Keep looping but slow down, or keep spawning up to a limit
            return prev;
          }
          return [...prev, nextVal];
        });
      }, 750);
    }
    return () => clearInterval(interval);
  }, [isGeneratingMultiples]);

  // Reset states between subSteps
  useEffect(() => {
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setFactorsFound([]);
    setMultiplesFound([]);
    setIsGeneratingMultiples(false);
    setShow5Option(true);
    setDiscoverySelection(null);
    setSelectedQ1Option(null);
    setStudentSelections({
      2: { factor: false, multiple: false },
      5: { factor: false, multiple: false },
      10: { factor: false, multiple: false },
      20: { factor: false, multiple: false },
      25: { factor: false, multiple: false },
      50: { factor: false, multiple: false }
    });
    setFactorsFrame(0);
    setMultiplesFrame(0);
  }, [subStep]);

  useEffect(() => {
    if (subStep !== 'vd-factors') return;

    const delay = factorsFrame === 1 ? 3000 : 1500;
    const timerId = setTimeout(() => {
      setFactorsFrame(prev => (prev + 1) % 3);
    }, delay);

    return () => clearTimeout(timerId);
  }, [subStep, factorsFrame]);

  useEffect(() => {
    if (subStep !== 'vd-multiples') return;

    const timerId = setTimeout(() => {
      setMultiplesFrame(prev => (prev + 1) % 4);
    }, 1500);

    return () => clearTimeout(timerId);
  }, [subStep, multiplesFrame]);

  // Save progress automatically when Q2 is finished

  const handleNext = () => {
    if (subStep === 'vd-factors') setSubStep('vd-multiples');
    else if (subStep === 'vd-multiples') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('discovery');
    else if (subStep === 'discovery') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleDiscoverySubmit = (val) => {
    setDiscoverySelection(val);
    if (val === 'correct') {
      setAnswerState('correct');
      setFeedbackText("Spot on! Factors are a finite set of divisors that fit inside the number. Multiples are generated by multiplying the number, extending infinitely.");
    } else {
      setAnswerState('wrong');
      setHintText("Not quite! Remember that we kept spawning multiples indefinitely, while factors fits exactly into 12.");
    }
  };




  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        .shake-machine {
          animation: shake 0.45s ease-in-out;
        }
        .factor-card {
          padding: 10px 16px;
          background: #4ba3e3;
          color: white;
          font-weight: bold;
          border-radius: 6px;
          box-shadow: var(--shadow-btn);
          animation: pop 0.3s ease-out;
        }
        .multiple-card {
          padding: 10px 16px;
          background: var(--clr-correct);
          color: white;
          font-weight: bold;
          border-radius: 6px;
          box-shadow: var(--shadow-btn);
          animation: pop 0.35s ease-out;
        }
      `}</style>
      <style>{factorsStyles}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Factors vs Multiples
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-factors' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: '#4ba3e3', fontWeight: 'bold', letterSpacing: '1px' }}>
            FACTORS
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Watch 18 dots split into equal rectangular grids with no remainder.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/factors-first.png"
                alt="Factors stage 1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: factorsFrame === 0 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/factors-middle.png"
                alt="Factors stage 2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: factorsFrame === 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/factors-end.png"
                alt="Factors stage 3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: factorsFrame === 2 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Factors divide a number exactly.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Multiples ➔
          </button>
        </div>
      )}

      {subStep === 'vd-multiples' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            MULTIPLES
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Watch how the multiples grow by multiplying 18.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/multiples-first.png"
                alt="Multiples stage 1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: multiplesFrame === 0 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/multiples-2.png"
                alt="Multiples stage 2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: multiplesFrame === 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/multiples-3.png"
                alt="Multiples stage 3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: multiplesFrame === 2 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/multiples-end.png"
                alt="Multiples stage 4"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: multiplesFrame === 3 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Multiples are made by multiplying a number.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Factors</strong> or <strong>Multiples</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNext} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* R1: Factors */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
            Find the Factors of 12
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div
              className={machineShake ? 'shake-machine' : ''}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--clr-surface)',
                border: '2.5px solid var(--clr-border)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-btn)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '6px' }}>Target Number</span>
              <div style={{
                background: 'var(--clr-card)',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                padding: '16px',
                marginBottom: '20px',
                color: 'var(--clr-accent)',
                letterSpacing: '1px'
              }}>
                12
              </div>

              {/* Factors list */}
              <div style={{ minHeight: '60px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {factorsFound.map(fact => (
                  <div key={fact} className="factor-card">
                    {fact}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              onClick={runFindFactors}
              disabled={factorsFound.length > 0}
              style={{ padding: '12px 24px', fontSize: '1.05rem' }}
            >
              🔍 Find Factors
            </button>
          </div>

          {factorsFound.length > 0 && show5Option && (
            <div style={{
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '400px',
              margin: '0 auto 20px auto'
            }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>Can we add 5 to the factors?</p>
              <button
                className="secondary"
                onClick={handleTry5}
                style={{ padding: '10px 20px', fontSize: '1rem', border: '1.5px dashed var(--clr-accent)', background: 'var(--clr-card)' }}
              >
                Insert 5 into Machine
              </button>
            </div>
          )}

          {answerState === 'wrong' && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(235, 94, 85, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-wrong)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-wrong)' }}>Incorrect entry!</strong>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>{hintText}</p>
              <button
                onClick={() => { setShow5Option(false); setAnswerState('unanswered'); }}
                style={{ padding: '8px 16px', fontSize: '0.9rem', marginTop: '12px' }}
              >
                Continue
              </button>
            </div>
          )}

          {factorsFound.length > 0 && !show5Option && (
            <div>
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '1.15rem', marginBottom: '16px' }}>
                All factors (1, 2, 3, 4, 6, 12) have been collected!
              </p>
              <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next: Generate Multiples →</button>
            </div>
          )}
        </div>
      )}

      {/* R2: Multiples */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
            Generate Multiples of 12
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--clr-surface)',
              border: '2.5px solid var(--clr-border)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: 'var(--shadow-btn)'
            }}>
              <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '6px' }}>Target Number</span>
              <div style={{
                background: 'var(--clr-card)',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                padding: '16px',
                marginBottom: '20px',
                color: 'var(--clr-correct)'
              }}>
                12
              </div>

              {/* Multiples list */}
              <div style={{ minHeight: '60px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxHeight: '120px', overflowY: 'auto', padding: '8px' }}>
                {multiplesFound.map(mult => (
                  <div key={mult} className="multiple-card">
                    {mult}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              onClick={() => setIsGeneratingMultiples(true)}
              disabled={isGeneratingMultiples}
              style={{ padding: '12px 24px', fontSize: '1.05rem' }}
            >
              ✨ Generate Multiples
            </button>
          </div>

          {isGeneratingMultiples && (
            <div style={{
              padding: '16px',
              background: 'var(--clr-surface)',
              borderRadius: '6px',
              border: '1px solid var(--clr-border)',
              maxWidth: '400px',
              margin: '0 auto 20px auto'
            }}>
              <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--clr-text-soft)' }}>
                {multiplesFound.length >= 8
                  ? "They keep generating indefinitely! Multiples never stop."
                  : "Watch the multiples pop out of the machine..."}
              </p>
            </div>
          )}

          {multiplesFound.length >= 5 && (
            <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next: Discovery →</button>
          )}
        </div>
      )}

      {/* SubStep: Discovery */}
      {subStep === 'discovery' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '20px 0' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-accent)', marginBottom: '16px' }}>What did you notice?</h3>
          <p style={{ fontSize: '1.15rem', color: 'var(--clr-text-soft)', marginBottom: '24px' }}>
            Think about the Factor or Multiple Machine activities we just ran.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
            <button
              onClick={() => handleDiscoverySubmit('correct')}
              className="option-card"
              style={{ padding: '20px', fontSize: '1.05rem', textAlign: 'left' }}
            >
              <strong>A.</strong> Factors fit exactly inside the number and are limited. Multiples are generated by multiplying and go on forever.
            </button>
            <button
              onClick={() => handleDiscoverySubmit('wrong')}
              className="option-card"
              style={{ padding: '20px', fontSize: '1.05rem', textAlign: 'left' }}
            >
              <strong>B.</strong> Factors are infinite, while multiples are a limited set.
            </button>
          </div>

          {answerState === 'wrong' && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(235, 94, 85, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-wrong)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', color: 'var(--clr-wrong)' }}>Not quite!</strong>
              <p style={{ margin: 0 }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{
              padding: '20px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--clr-border)',
              borderLeft: '5px solid var(--clr-correct)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-correct)', fontSize: '1.2rem' }}>
                Great Discovery!
              </strong>
              <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>
                {feedbackText}
                <br /><br />
                Remember this metaphor:
                <br />
                ⬢ <strong>Factors:</strong> Go <strong>INTO</strong> the number (divide exactly).
                <br />
                ⬢ <strong>Multiples:</strong> Come <strong>OUT</strong> of the number (multiply forward).
              </p>
              <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Continue to Review →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison */}
      {subStep === 'comparison' && (
        <div>
          {/* Side-by-side Cards */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Factors Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid #4ba3e3',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: '#4ba3e3', fontWeight: 'bold' }}>
                FACTORS
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Numbers that divide another number exactly.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> Factors of 18 ➔ 1, 2, 3, 6, 9, 18
              </p>
            </div>

            {/* Multiples Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                MULTIPLES
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Numbers obtained by multiplying a number by whole numbers.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> Multiples of 18 ➔ 18, 36, 54, 72,etc
              </p>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>
              Before solving, ask yourself:
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Can it divide exactly?</span>
                <strong style={{ fontSize: '1.25rem', color: '#4ba3e3' }}>FACTOR</strong>
              </div>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Do I get it by multiplying?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)' }}>MULTIPLE</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNext} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Factors vs Multiples challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['factors-multiples'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CongruenceSimilarityChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-congruence'); // vd-congruence, vd-similarity, intro, r1, r2, r3, comparison, q1, q2, practice-redirect
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [simFrame, setSimFrame] = useState(0);

  // Helper to determine the active step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-congruence' || subStep === 'vd-similarity') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'r3') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const congruenceStyles = `
    @keyframes slideCongruence {
      0%, 20% { transform: translate(0px, 0px); filter: none; }
      40% { transform: translate(-120px, 0px); filter: none; }
      45%, 75% { transform: translate(-120px, 0px); filter: drop-shadow(0 0 10px rgba(92, 184, 122, 0.8)); }
      85%, 100% { transform: translate(0px, 0px); filter: none; }
    }
    
    @keyframes slideSimilarity {
      0%, 15% { transform: translate(0px, 0px) scale(0.5); filter: none; }
      30%, 45% { transform: translate(-120px, 0px) scale(0.5); filter: none; }
      55%, 80% { transform: translate(-120px, 0px) scale(1); filter: drop-shadow(0 0 10px rgba(75, 163, 227, 0.85)); }
      90%, 100% { transform: translate(0px, 0px) scale(0.5); filter: none; }
    }

    .congruence-sliding-triangle {
      transform-origin: 160px 220px;
      animation: slideCongruence 5s infinite ease-in-out;
    }

    .similarity-growing-triangle {
      transform-origin: 160px 220px;
      animation: slideSimilarity 5.5s infinite ease-in-out;
    }
  `;

  // Interactive Inspector States
  const [rotateAngle, setRotateAngle] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [inspectorSolved, setInspectorSolved] = useState(false);
  const [discoverQAnswered, setDiscoverQAnswered] = useState(false);
  const [selectedDiscoveryOption, setSelectedDiscoveryOption] = useState(null);

  const [selectedQ1Option, setSelectedQ1Option] = useState(null);

  // Classification Grid Game
  const [classifications, setClassifications] = useState({
    'Rotated square': null,
    'Enlarged triangle': null,
    'Mirror-image rectangle': null,
    'Rectangle vs square': null,
    'Enlarged pentagon': null,
    'Triangle with different angles': null
  });

  // Reset states between subSteps
  useEffect(() => {
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setShowOverlay(false);
    setInspectorSolved(false);
    setDiscoverQAnswered(false);
    setSelectedDiscoveryOption(null);
    setSelectedQ1Option(null);
    setClassifications({
      'Rotated square': null,
      'Enlarged triangle': null,
      'Mirror-image rectangle': null,
      'Rectangle vs square': null,
      'Enlarged pentagon': null,
      'Triangle with different angles': null
    });

    setSimFrame(0);

    // Set initial offsets for candidate shape to rotate/resize
    if (subStep === 'r1') {
      setRotateAngle(90);
      setIsFlipped(false);
      setScale(1.0);
    } else if (subStep === 'r2') {
      setRotateAngle(180);
      setIsFlipped(false);
      setScale(1.4);
    } else if (subStep === 'r3') {
      setRotateAngle(90);
      setIsFlipped(true);
      setScale(1.0);
    }
  }, [subStep]);

  useEffect(() => {
    if (subStep !== 'vd-similarity') return;
    const interval = setInterval(() => {
      setSimFrame(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, [subStep]);

  // Mark as completed immediately when Q2 is successfully answered

  const handleNext = () => {
    if (subStep === 'vd-congruence') setSubStep('vd-similarity');
    else if (subStep === 'vd-similarity') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('r3');
    else if (subStep === 'r3') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleRotate = () => {
    if (showOverlay || inspectorSolved) return;
    setRotateAngle(prev => (prev + 90) % 360);
  };

  const handleFlip = () => {
    if (showOverlay || inspectorSolved) return;
    setIsFlipped(prev => !prev);
  };

  const handleResize = () => {
    if (showOverlay || inspectorSolved) return;
    if (subStep === 'r1') {
      // Cycle scales
      setScale(prev => prev === 1.0 ? 1.3 : prev === 1.3 ? 0.7 : 1.0);
    } else if (subStep === 'r2') {
      // Cycle scales
      setScale(prev => prev === 1.4 ? 1.0 : prev === 1.0 ? 0.7 : 1.4);
    } else if (subStep === 'r3') {
      setScale(prev => prev === 1.0 ? 1.4 : prev === 1.4 ? 0.7 : 1.0);
    }
  };

  const handleOverlayToggle = () => {
    if (inspectorSolved) return;
    const nextOverlay = !showOverlay;
    setShowOverlay(nextOverlay);

    if (nextOverlay) {
      // Evaluate matching condition
      if (subStep === 'r1') {
        const isMatch = (rotateAngle % 360 === 0) && scale === 1.0;
        if (isMatch) {
          setInspectorSolved(true);
          setAnswerState('correct');
        } else {
          setAnswerState('wrong');
          setHintText("Shapes do not overlap. Try rotating the candidate shape to match the vertical reference triangle!");
        }
      } else if (subStep === 'r2') {
        const isMatch = (rotateAngle % 360 === 0) && scale === 1.0;
        if (isMatch) {
          setInspectorSolved(true);
          setAnswerState('correct');
        } else {
          setAnswerState('wrong');
          setHintText("Shapes do not overlap. Adjust both the rotation and scale factor (size) of the candidate shape!");
        }
      } else if (subStep === 'r3') {
        // Different shapes, will never overlap
        setInspectorSolved(true);
        setAnswerState('correct');
      }
    } else {
      setAnswerState('unanswered');
      setHintText('');
    }
  };

  const handleDiscoverySubmit = (option) => {
    setSelectedDiscoveryOption(option);
    let isCorrect = false;
    if (subStep === 'r1') {
      isCorrect = (option === 'both');
      if (isCorrect) {
        setFeedbackText("Excellent! These congruent figures overlap perfectly without changing their size. They have both the same shape and size.");
      } else {
        setHintText("Not quite. Notice that the size and shape of both triangles are completely identical, not just the shape.");
      }
    } else if (subStep === 'r2') {
      isCorrect = (option === 'size');
      if (isCorrect) {
        setFeedbackText("Great! The shape stayed the same, but the size changed. These figures are similar but not congruent.");
      } else {
        setHintText("Not quite. Resizing the candidate shape changed its size scale factor, not just the orientation.");
      }
    } else if (subStep === 'r3') {
      isCorrect = (option === 'shape');
      if (isCorrect) {
        setFeedbackText("Correct! They cannot overlap because they are completely different shapes (a rectangle vs a trapezium). They are neither congruent nor similar.");
      } else {
        setHintText("Not quite. Flipping and resizing didn't help because they have entirely different shapes.");
      }
    }

    if (isCorrect) {
      setAnswerState('correct');
      setDiscoverQAnswered(true);
    } else {
      setAnswerState('wrong');
      setDiscoverQAnswered(true);
    }
  };




  // Helper to draw SVGs side-by-side
  const renderShapeCanvas = () => {
    // Reference points relative to (100, 90)
    // Candidate points relative to (300, 90)
    let refPath = "";
    let candidatePath = "";

    if (subStep === 'r1' || subStep === 'r2') {
      // Triangles
      refPath = "M 60,50 L 140,130 L 60,130 Z";
      candidatePath = "M 260,50 L 340,130 L 260,130 Z";
    } else {
      // Rectangle vs Trapezium
      refPath = "M 60,60 L 140,60 L 140,120 L 60,120 Z"; // Rectangle
      candidatePath = "M 270,55 L 330,55 L 345,125 L 255,125 Z"; // Trapezium
    }

    return (
      <svg
        width="100%"
        height="180"
        viewBox="0 0 400 180"
        style={{
          background: 'var(--clr-card)',
          borderRadius: '8px',
          border: '1px solid var(--clr-border)',
          overflow: 'hidden'
        }}
      >
        {/* Left Reference Area Grid */}
        <rect x="5" y="5" width="190" height="170" fill="none" stroke="var(--clr-border)" strokeWidth="1" strokeDasharray="3,3" rx="4" />
        <text x="100" y="24" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--clr-text-soft)">Reference Shape</text>

        {/* Right Candidate Area Grid */}
        {!showOverlay && (
          <>
            <rect x="205" y="5" width="190" height="170" fill="none" stroke="var(--clr-border)" strokeWidth="1" strokeDasharray="3,3" rx="4" />
            <text x="300" y="24" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--clr-text-soft)">Candidate Shape</text>
          </>
        )}

        {/* Draw Reference Shape */}
        <path d={refPath} fill="none" stroke="var(--clr-text-soft)" strokeWidth="2.5" strokeDasharray="4,4" />

        {/* Draw Candidate Shape Group with transformations */}
        <g
          style={{
            transform: `translate(${showOverlay ? -200 : 0}px, 0px) rotate(${rotateAngle}deg) scale(${scale}) scaleX(${isFlipped ? -1 : 1})`,
            transformOrigin: '300px 90px',
            transition: 'transform 0.45s ease-in-out'
          }}
        >
          <path d={candidatePath} fill="rgba(232, 134, 74, 0.6)" stroke="var(--clr-accent)" strokeWidth="2.5" />
        </g>
      </svg>
    );
  };

  const handleNextStep = () => {
    handleNext();
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{congruenceStyles}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Congruence vs Similarity
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-congruence' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            CONGRUENCE
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Congruent shapes match size and shape exactly.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/contrast/congruent.png"
                alt="Congruence illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Congruent shapes have the same shape and the same size.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Similarity ➔
          </button>
        </div>
      )}

      {subStep === 'vd-similarity' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: '#4ba3e3', fontWeight: 'bold', letterSpacing: '1px' }}>
            SIMILARITY
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Watch the shapes resize to overlap perfectly.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/similarity-first.png"
                alt="Similarity stage 1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: simFrame === 0 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/similarity-middle.png"
                alt="Similarity stage 2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: simFrame === 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/similarity-end.png"
                alt="Similarity stage 3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: simFrame === 2 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Similar shapes have the same shape but can be different sizes.
          </p>

          <button onClick={handleNext} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Congruence</strong> or <strong>Similarity</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* R1, R2, R3 Inspector loops */}
      {(subStep === 'r1' || subStep === 'r2' || subStep === 'r3') && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '500px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Shape Inspector Mission
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              {subStep === 'r1' && "The candidate triangle (orange) has been rotated. Rotate it to see if it can align and overlap the reference outline (dashed) perfectly without changing its size."}
              {subStep === 'r2' && "This candidate triangle is larger and rotated. Rotate it and adjust its size (Resize) to see if you can make it match the reference outline perfectly."}
              {subStep === 'r3' && "Here is a rectangle and a trapezium. Rotate, flip, and resize the trapezium. Can you make it match and overlap the rectangle perfectly?"}
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>
            {subStep === 'r1' && 'Round 1: Overlap the rotated shape'}
            {subStep === 'r2' && 'Round 2: Overlap the larger shape'}
            {subStep === 'r3' && 'Round 3: Overlap the different shape'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
              {renderShapeCanvas()}
            </div>
          </div>

          {/* Tool Guide Box */}
          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: '6px',
            padding: '12px 16px',
            maxWidth: '440px',
            margin: '0 auto 16px auto',
            textAlign: 'left',
            fontSize: '0.88rem',
            lineHeight: '1.4',
            color: 'var(--clr-text-soft)',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-text)' }}>Tool Guide:</strong>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              <li>🔄 <strong>Rotate:</strong> Turns the candidate shape by 90° clockwise.</li>
              <li>🪞 <strong>Flip:</strong> Mirrors the candidate shape horizontally.</li>
              <li>↔️ <strong>Resize:</strong> Cycles the size scale (0.7x, 1.0x, 1.3x/1.4x).</li>
              <li>📋 <strong>Overlay:</strong> Slides the candidate shape on top of the reference to check if they match.</li>
            </ul>
          </div>

          {/* Transformation Controls */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              className="secondary"
              onClick={handleRotate}
              disabled={showOverlay || inspectorSolved}
              style={{ padding: '8px 16px', fontSize: '0.95rem' }}
            >
              🔄 Rotate
            </button>
            <button
              className="secondary"
              onClick={handleFlip}
              disabled={showOverlay || inspectorSolved}
              style={{ padding: '8px 16px', fontSize: '0.95rem' }}
            >
              🪞 Flip
            </button>
            <button
              className="secondary"
              onClick={handleResize}
              disabled={showOverlay || inspectorSolved}
              style={{ padding: '8px 16px', fontSize: '0.95rem' }}
            >
              ↔️ Resize ({scale.toFixed(1)}x)
            </button>
            <button
              className={showOverlay ? 'primary' : 'secondary'}
              onClick={handleOverlayToggle}
              disabled={inspectorSolved}
              style={{ padding: '8px 20px', fontSize: '0.95rem', fontWeight: '600' }}
            >
              {showOverlay ? '◀ Separate' : '📋 Overlay'}
            </button>
          </div>

          {answerState === 'wrong' && !discoverQAnswered && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(235, 94, 85, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-wrong)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', color: 'var(--clr-wrong)', marginBottom: '4px' }}>No overlap</strong>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {/* Solver Discovery Question */}
          {inspectorSolved && !discoverQAnswered && (
            <div style={{
              background: 'var(--clr-surface)',
              border: '1.5px solid var(--clr-border)',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              margin: '0 auto 20px auto',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)' }}>
                {subStep === 'r1' && 'Overlay Achieved! What did you discover?'}
                {subStep === 'r2' && 'Overlay Achieved! What changed?'}
                {subStep === 'r3' && 'Overlay Complete! What do you notice?'}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {subStep === 'r1' && (
                  <>
                    <button onClick={() => handleDiscoverySubmit('shape')} className="option-card" style={{ padding: '12px 18px', textAlign: 'left' }}>
                      Same Shape Only
                    </button>
                    <button onClick={() => handleDiscoverySubmit('both')} className="option-card" style={{ padding: '12px 18px', textAlign: 'left' }}>
                      Same Shape & Same Size
                    </button>
                  </>
                )}
                {subStep === 'r2' && (
                  <>
                    <button onClick={() => handleDiscoverySubmit('orient')} className="option-card" style={{ padding: '12px 18px', textAlign: 'left' }}>
                      Only the orientation
                    </button>
                    <button onClick={() => handleDiscoverySubmit('size')} className="option-card" style={{ padding: '12px 18px', textAlign: 'left' }}>
                      The size
                    </button>
                  </>
                )}
                {subStep === 'r3' && (
                  <>
                    <button onClick={() => handleDiscoverySubmit('angle')} className="option-card" style={{ padding: '12px 18px', textAlign: 'left' }}>
                      Same shape
                    </button>
                    <button onClick={() => handleDiscoverySubmit('shape')} className="option-card" style={{ padding: '12px 18px', textAlign: 'left' }}>
                      Different shape
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {discoverQAnswered && (
            <div style={{
              padding: '20px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--clr-border)',
              borderLeft: `5px solid ${answerState === 'correct' ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`,
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: answerState === 'correct' ? 'var(--clr-correct)' : 'var(--clr-wrong)', fontSize: '1.25rem' }}>
                {answerState === 'correct' ? 'Correct Discovery!' : 'Not Quite'}
              </strong>
              <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>
                {answerState === 'correct' ? feedbackText : hintText}
              </p>

              {answerState === 'correct' ? (
                <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>
                  {subStep === 'r3' ? 'Continue to Review →' : 'Next Round'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDiscoverQAnswered(false);
                    setSelectedDiscoveryOption(null);
                    setAnswerState('unanswered');
                  }}
                  className="secondary"
                  style={{ padding: '10px 20px', fontSize: '1rem' }}
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                CONGRUENCE
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Shapes are identical in both shape and size.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> Two identical triangles.
              </p>
            </div>

            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid #4ba3e3',
              flex: '1 1 300px',
              maxWidth: '350px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: '#4ba3e3', fontWeight: 'bold' }}>
                SIMILARITY
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Shapes have the same shape but may have different sizes.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> A photo and its enlarged copy.
              </p>
            </div>
          </div>

          {/* Decision Rule - Flowchart Cards */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              <div style={{ background: 'var(--clr-card)', padding: '14px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', minWidth: '180px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>YES, without resizing</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-correct)', display: 'block', margin: '4px 0' }}>CONGRUENT</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>(And Also Similar)</span>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '14px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', minWidth: '180px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>YES, after proportional resizing</span>
                <strong style={{ fontSize: '1.2rem', color: '#4ba3e3', display: 'block', margin: '4px 0' }}>SIMILAR ONLY</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>(Not Congruent)</span>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '14px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', minWidth: '180px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>NO, shapes differ</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-wrong)', display: 'block', margin: '4px 0' }}>NEITHER</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>(Shapes mismatch)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Congruence vs Similarity challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['congruence-similarity'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MatricesDeterminantsChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-matrix'); // vd-matrix, vd-determinant, intro, detective, comparison, q1, q2, practice-redirect
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Detective States
  const [selectedCard, setSelectedCard] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [inspectedStatus, setInspectedStatus] = useState({
    A: null, // null, correct, incorrect
    B: null,
    C: null,
    '12': null
  });

  const [selectedQ1Option, setSelectedQ1Option] = useState(null);

  // Q2 dimensions tapping challenge
  const [tappedDimensions, setTappedDimensions] = useState({
    '2x2': false,
    '3x2': false,
    '4x4': false,
    '1x3': false
  });

  // Reset states between subSteps
  useEffect(() => {
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setSelectedCard(null);
    setIsScanning(false);
    setInspectedStatus({
      A: null,
      B: null,
      C: null,
      '12': null
    });
    setSelectedQ1Option(null);
    setTappedDimensions({
      '2x2': false,
      '3x2': false,
      '4x4': false,
      '1x3': false
    });
  }, [subStep]);

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-matrix' || subStep === 'vd-determinant') return 0;
    if (subStep === 'intro' || subStep === 'detective') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const matStyles = `
    @keyframes matrixBrackets {
      0%, 10% { opacity: 0; }
      15%, 90% { opacity: 1; }
      95%, 100% { opacity: 0; }
    }
    @keyframes numFill1 {
      0%, 20% { opacity: 0; transform: translateY(-5px); }
      25%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes numFill2 {
      0%, 30% { opacity: 0; transform: translateY(-5px); }
      35%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes numFill3 {
      0%, 40% { opacity: 0; transform: translateY(-5px); }
      45%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes numFill4 {
      0%, 50% { opacity: 0; transform: translateY(-5px); }
      55%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes matrixHighlight {
      0%, 60% { opacity: 0; transform: scale(0.95); }
      65%, 90% { opacity: 1; transform: scale(1); }
      95%, 100% { opacity: 0; }
    }

    .mat-brackets { animation: matrixBrackets 6s infinite ease-in-out; }
    .mat-num-1 { animation: numFill1 6s infinite ease-in-out; }
    .mat-num-2 { animation: numFill2 6s infinite ease-in-out; }
    .mat-num-3 { animation: numFill3 6s infinite ease-in-out; }
    .mat-num-4 { animation: numFill4 6s infinite ease-in-out; }
    .mat-highlight { animation: matrixHighlight 6s infinite ease-in-out; transform-origin: 160px 140px; }

    @keyframes detBars {
      0%, 5% { opacity: 0; }
      10%, 90% { opacity: 1; }
      95%, 100% { opacity: 0; }
    }
    @keyframes detLines {
      0%, 15% { opacity: 0; stroke-dashoffset: 60; }
      25%, 90% { opacity: 1; stroke-dashoffset: 0; }
      95%, 100% { opacity: 0; }
    }
    @keyframes detStep1 {
      0%, 40% { opacity: 0; transform: translateY(-5px); }
      45%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes detStep2 {
      0%, 60% { opacity: 0; transform: translateY(-5px); }
      65%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes detStep3 {
      0%, 75% { opacity: 0; transform: scale(0.8); }
      80%, 90% { opacity: 1; transform: scale(1.2); }
      95%, 100% { opacity: 0; }
    }

    .det-bars { animation: detBars 8s infinite ease-in-out; }
    .det-diag-1 { animation: detLines 8s infinite ease-in-out; stroke-dasharray: 60; }
    .det-diag-2 { animation: detLines 8s infinite ease-in-out; stroke-dasharray: 60; }
    .det-step-1 { animation: detStep1 8s infinite ease-in-out; }
    .det-step-2 { animation: detStep2 8s infinite ease-in-out; }
    .det-step-3 { animation: detStep3 8s infinite ease-in-out; transform-origin: 160px 255px; }
  `;

  // Save progress automatically when final practice step is completed

  const handleNextStep = () => {
    if (subStep === 'vd-matrix') setSubStep('vd-determinant');
    else if (subStep === 'vd-determinant') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('detective');
    else if (subStep === 'detective') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleInspectCard = (cardId) => {
    if (isScanning) return;
    setSelectedCard(cardId);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
  };

  const handleDetectiveSubmit = (canHaveDeterminant) => {
    if (isScanning || !selectedCard) return;

    const cardsConfig = {
      A: { isSquare: true, name: "Matrix A (2x2)", desc: "Square matrix of dimensions 2x2. It has determinant value = 5.", val: 5 },
      B: { isSquare: false, name: "Matrix B (3x2)", desc: "Rectangle matrix of dimensions 3x2. It is not square, so it has no determinant." },
      C: { isSquare: true, name: "Matrix C (3x3)", desc: "Square matrix of dimensions 3x3. It has determinant value = -10.", val: -10 },
      '12': { isSquare: false, name: "Number 12", desc: "Single scalar number. It is not a matrix, so it has no determinant." }
    };

    const config = cardsConfig[selectedCard];
    const isCorrectChoice = (canHaveDeterminant === config.isSquare);

    if (isCorrectChoice) {
      if (config.isSquare) {
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          setAnswerState('correct');
          setFeedbackText(`Determinant Found! det(${selectedCard}) = ${config.val}. calculated from the square coefficients.`);
          setInspectedStatus(prev => ({ ...prev, [selectedCard]: 'correct' }));
        }, 1300);
      } else {
        setAnswerState('correct');
        setFeedbackText(`Correct! ${config.name} does not have a determinant because it is not square.`);
        setInspectedStatus(prev => ({ ...prev, [selectedCard]: 'correct' }));
      }
    } else {
      setAnswerState('wrong');
      setHintText(`Incorrect. ${config.desc}`);
      setInspectedStatus(prev => ({ ...prev, [selectedCard]: 'incorrect' }));
    }
  };

  const allInspectedCorrectly =
    inspectedStatus.A === 'correct' &&
    inspectedStatus.B === 'correct' &&
    inspectedStatus.C === 'correct' &&
    inspectedStatus['12'] === 'correct';




  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        ${matStyles}
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0; }
        }
        .scan-bar {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--clr-correct);
          box-shadow: 0 0 10px var(--clr-correct);
          animation: scan 1.2s infinite linear;
        }
        .matrix-bracket {
          border-left: 2px solid var(--clr-text);
          border-right: 2px solid var(--clr-text);
          border-radius: 4px;
          padding: 4px 8px;
          font-family: monospace;
          font-size: 1.1rem;
          line-height: 1.4;
          display: inline-block;
          text-align: center;
        }
        .determinant-bars {
          border-left: 2px solid var(--clr-text);
          border-right: 2px solid var(--clr-text);
          padding: 4px 8px;
          font-family: monospace;
          font-size: 1.1rem;
          line-height: 1.4;
          display: inline-block;
          text-align: center;
        }
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Matrices vs Determinants
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-matrix' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            MATRIX
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Observe the rectangular grid layout of numbers organized into rows and columns.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/matrix.png"
                alt="Matrix representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A matrix is a rectangular arrangement of numbers.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Determinants ➔
          </button>
        </div>
      )}

      {subStep === 'vd-determinant' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            DETERMINANT
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Study the diagonal multiplication lines that show how to reduce the grid of numbers to a single value.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/determinants.png"
                alt="Determinant representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A determinant is a single value calculated from a square matrix.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Matrices</strong> or <strong>Determinants</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Layer 1: Detective Scanner */}
      {subStep === 'detective' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '520px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Detective Mission Instructions
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Select each of the cards below to test if we can extract a determinant from it. Verify all 4 objects to move to the comparison card review.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '32px', width: '100%', maxWidth: '520px' }}>
            {/* Card A (2x2) */}
            <div
              onClick={() => handleInspectCard('A')}
              className={`option-card ${selectedCard === 'A' ? 'selected' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 12px',
                border: inspectedStatus.A === 'correct' ? '2.5px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                opacity: selectedCard === 'A' ? 1 : 0.85
              }}
            >
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--clr-text)', display: 'block', fontWeight: '500' }}>Matrix A</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block' }}>(2×2)</span>
                {inspectedStatus.A === 'correct' && <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>✓ Verified</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'monospace', fontSize: '1.1rem', position: 'relative' }}>
                {isScanning && selectedCard === 'A' && <div className="scan-bar" />}
                <span style={{ fontSize: '3rem', fontWeight: '100', marginRight: '6px', color: 'var(--clr-text)', opacity: 0.85 }}>[</span>
                <div style={{ display: 'inline-block', textAlign: 'center', lineHeight: '1.4', whiteSpace: 'nowrap' }}>
                  2&nbsp;3<br />1&nbsp;4
                </div>
                <span style={{ fontSize: '3rem', fontWeight: '100', marginLeft: '6px', color: 'var(--clr-text)', opacity: 0.85 }}>]</span>
              </div>
            </div>

            {/* Card B (3x2) */}
            <div
              onClick={() => handleInspectCard('B')}
              className={`option-card ${selectedCard === 'B' ? 'selected' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 12px',
                border: inspectedStatus.B === 'correct' ? '2.5px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                opacity: selectedCard === 'B' ? 1 : 0.85
              }}
            >
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--clr-text)', display: 'block', fontWeight: '500' }}>Matrix B</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block' }}>(3×2)</span>
                {inspectedStatus.B === 'correct' && <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>✓ Verified</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'monospace', fontSize: '1.1rem', position: 'relative' }}>
                <span style={{ fontSize: '4.2rem', fontWeight: '100', marginRight: '6px', color: 'var(--clr-text)', opacity: 0.85 }}>[</span>
                <div style={{ display: 'inline-block', textAlign: 'center', lineHeight: '1.4', whiteSpace: 'nowrap' }}>
                  5&nbsp;1<br />-2&nbsp;3<br />0&nbsp;7
                </div>
                <span style={{ fontSize: '4.2rem', fontWeight: '100', marginLeft: '6px', color: 'var(--clr-text)', opacity: 0.85 }}>]</span>
              </div>
            </div>

            {/* Card C (3x3) */}
            <div
              onClick={() => handleInspectCard('C')}
              className={`option-card ${selectedCard === 'C' ? 'selected' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 12px',
                border: inspectedStatus.C === 'correct' ? '2.5px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                opacity: selectedCard === 'C' ? 1 : 0.85
              }}
            >
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--clr-text)', display: 'block', fontWeight: '500' }}>Matrix C</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block' }}>(3×3)</span>
                {inspectedStatus.C === 'correct' && <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>✓ Verified</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'monospace', fontSize: '1.1rem', position: 'relative' }}>
                {isScanning && selectedCard === 'C' && <div className="scan-bar" />}
                <span style={{ fontSize: '4.2rem', fontWeight: '100', marginRight: '6px', color: 'var(--clr-text)', opacity: 0.85 }}>[</span>
                <div style={{ display: 'inline-block', textAlign: 'center', lineHeight: '1.4', whiteSpace: 'nowrap' }}>
                  1&nbsp;0&nbsp;2<br />3&nbsp;-1&nbsp;4<br />2&nbsp;1&nbsp;0
                </div>
                <span style={{ fontSize: '4.2rem', fontWeight: '100', marginLeft: '6px', color: 'var(--clr-text)', opacity: 0.85 }}>]</span>
              </div>
            </div>

            {/* Card Scalar */}
            <div
              onClick={() => handleInspectCard('12')}
              className={`option-card ${selectedCard === '12' ? 'selected' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 12px',
                border: inspectedStatus['12'] === 'correct' ? '2.5px solid var(--clr-correct)' : '1px solid var(--clr-border)',
                opacity: selectedCard === '12' ? 1 : 0.85
              }}
            >
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--clr-text)', display: 'block', fontWeight: '500' }}>Object D</span>
                {inspectedStatus['12'] === 'correct' && <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>✓ Verified</span>}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--clr-accent)', fontFamily: 'monospace', paddingRight: '8px' }}>
                12
              </div>
            </div>
          </div>

          {/* Prompt options */}
          {selectedCard && (
            <div style={{
              background: 'var(--clr-surface)',
              border: '1.5px solid var(--clr-border)',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '480px',
              margin: '0 auto 20px auto'
            }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '500' }}>
                Can we extract a determinant from this selection?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => handleDetectiveSubmit(true)} disabled={isScanning} style={{ padding: '10px 24px', fontSize: '1rem' }}>
                  Yes, it has a determinant
                </button>
                <button onClick={() => handleDetectiveSubmit(false)} disabled={isScanning} className="secondary" style={{ padding: '10px 24px', fontSize: '1rem' }}>
                  No determinant
                </button>
              </div>
            </div>
          )}

          {isScanning && (
            <div style={{ margin: '20px auto', maxWidth: '300px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '8px' }}>Scanning matrix coefficients...</div>
              <div style={{ background: 'var(--clr-card)', height: '8px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--clr-correct)', transition: 'width 1.2s ease-out' }} />
              </div>
            </div>
          )}

          {answerState === 'wrong' && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(235, 94, 85, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-wrong)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', color: 'var(--clr-wrong)', marginBottom: '4px' }}>No determinant found</strong>
              <p style={{ margin: 0, fontSize: '0.98rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && !isScanning && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(92, 184, 122, 0.1)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '5px solid var(--clr-correct)',
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto 20px auto'
            }}>
              <strong style={{ display: 'block', color: 'var(--clr-correct)', marginBottom: '4px' }}>Success</strong>
              <p style={{ margin: 0, fontSize: '0.98rem' }}>{feedbackText}</p>
            </div>
          )}

          {allInspectedCorrectly && (
            <div style={{ marginTop: '24px' }}>
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginBottom: '12px' }}>
                Excellent detective work! All objects have been verified.
              </p>
              <button onClick={handleNextStep} style={{ padding: '12px 32px', fontSize: '1.05rem' }}>
                Next: Comparison →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Matrix Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                MATRIX
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> A rectangular arrangement of numbers in rows and columns.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Example:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '12px', borderLeft: '3px solid var(--clr-accent)', fontWeight: '600', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', whiteSpace: 'pre' }}>
                  ┌      ┐
                  <br />
                  │ 2  1 │
                  <br />
                  │ 3  4 │
                  <br />
                  └      ┘
                </span>
              </p>
            </div>

            {/* Determinant Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                DETERMINANTS
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> A single value calculated from a square matrix.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Example:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '12px', borderLeft: '3px solid var(--clr-correct)', fontWeight: '600', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', whiteSpace: 'pre' }}>
                  │ 2  1 │
                  <br />
                  │ 3  4 │  =  5
                </span>
              </p>
            </div>
          </div>

          {/* Decision Rule Flowchart Cards */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>Before calculating, ask yourself:</p>

            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>The arrangement of numbers?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)', display: 'block', marginTop: '8px' }}>MATRIX</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>The value obtained after calculation?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', display: 'block', marginTop: '8px' }}>DETERMINANT</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Matrices vs Determinants challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['matrices-determinants'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MeanMedianModeChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-mean'); // vd-mean, vd-median, vd-mode, intro, r1, r2, r3, comparison, q1, q2, practice-redirect
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Round 2 Outlier transition state
  const [r2Transitioned, setR2Transitioned] = useState(false);


  // Trigger outlier slide transition in Round 2
  useEffect(() => {
    if (subStep === 'r2') {
      const timer = setTimeout(() => {
        setR2Transitioned(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setR2Transitioned(false);
    }
  }, [subStep]);

  // Reset answer states on substep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
  }, [subStep]);

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-mean' || subStep === 'vd-median' || subStep === 'vd-mode') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'r3') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const statStyles = `
    /* Mean animations */
    @keyframes meanMove6 {
      0%, 15% { transform: translate(0, 0); opacity: 1; }
      25%, 90% { transform: translate(80px, 30px); opacity: 0; }
      95%, 100% { opacity: 0; }
    }
    @keyframes meanMove8 {
      0%, 15% { transform: translate(0, 0); opacity: 1; }
      25%, 90% { transform: translate(40px, 30px); opacity: 0; }
      95%, 100% { opacity: 0; }
    }
    @keyframes meanMove10 {
      0%, 15% { transform: translate(0, 0); opacity: 1; }
      25%, 90% { transform: translate(0, 30px); opacity: 0; }
      95%, 100% { opacity: 0; }
    }
    @keyframes meanMove12 {
      0%, 15% { transform: translate(0, 0); opacity: 1; }
      25%, 90% { transform: translate(-40px, 30px); opacity: 0; }
      95%, 100% { opacity: 0; }
    }
    @keyframes meanMove14 {
      0%, 15% { transform: translate(0, 0); opacity: 1; }
      25%, 90% { transform: translate(-80px, 30px); opacity: 0; }
      95%, 100% { opacity: 0; }
    }
    @keyframes meanTotalBox {
      0%, 25% { opacity: 0; transform: scale(0.8); }
      32%, 52% { opacity: 1; transform: scale(1); }
      58%, 100% { opacity: 0; transform: scale(0.8); }
    }
    @keyframes meanFormula {
      0%, 58% { opacity: 0; transform: translateY(10px); }
      65%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes meanResult {
      0%, 75% { opacity: 0; transform: scale(0.8); }
      82%, 92% { opacity: 1; transform: scale(1.3); }
      97%, 100% { opacity: 0; }
    }

    .mean-n6 { animation: meanMove6 9s infinite ease-in-out; transform-origin: 80px 70px; }
    .mean-n8 { animation: meanMove8 9s infinite ease-in-out; transform-origin: 120px 70px; }
    .mean-n10 { animation: meanMove10 9s infinite ease-in-out; transform-origin: 160px 70px; }
    .mean-n12 { animation: meanMove12 9s infinite ease-in-out; transform-origin: 200px 70px; }
    .mean-n14 { animation: meanMove14 9s infinite ease-in-out; transform-origin: 240px 70px; }
    .mean-total-box { animation: meanTotalBox 9s infinite ease-in-out; transform-origin: 160px 115px; }
    .mean-formula { animation: meanFormula 9s infinite ease-in-out; }
    .mean-result { animation: meanResult 9s infinite ease-in-out; transform-origin: 160px 255px; }

    /* Median animations */
    @keyframes medianOuter1 {
      0%, 22% { opacity: 1; }
      28%, 100% { opacity: 0.15; }
    }
    @keyframes medianOuter2 {
      0%, 52% { opacity: 1; }
      58%, 100% { opacity: 0.15; }
    }
    @keyframes medianCenterGlow {
      0%, 58% { opacity: 1; transform: scale(1); fill: var(--clr-text); }
      68%, 92% { opacity: 1; transform: scale(1.35); fill: var(--clr-correct); filter: drop-shadow(0 0 6px rgba(92,184,122,0.6)); }
      96%, 100% { opacity: 0; }
    }
    @keyframes medianFadeOutAll {
      0%, 92% { opacity: 1; }
      96%, 100% { opacity: 0; }
    }

    .med-o1 { animation: medianOuter1 9s infinite ease-in-out; }
    .med-o2 { animation: medianOuter2 9s infinite ease-in-out; }
    .med-center { animation: medianCenterGlow 9s infinite ease-in-out; transform-origin: 160px 140px; }
    .med-fade-all { animation: medianFadeOutAll 9s infinite ease-in-out; }

    /* Mode animations */
    @keyframes modePulse {
      0%, 15% { transform: scale(1); fill: var(--clr-text); }
      22%, 28% { transform: scale(1.3); fill: var(--clr-accent); }
      35%, 41% { transform: scale(1); fill: var(--clr-text); }
      48%, 54% { transform: scale(1.3); fill: var(--clr-accent); }
      62%, 92% { transform: scale(1); fill: var(--clr-accent); filter: drop-shadow(0 0 4px rgba(232,134,74,0.4)); }
      96%, 100% { opacity: 0; }
    }
    @keyframes modeNormal {
      0%, 92% { opacity: 1; }
      96%, 100% { opacity: 0; }
    }
    @keyframes modeResultBox {
      0%, 58% { opacity: 0; transform: translateY(10px); }
      65%, 92% { opacity: 1; transform: translateY(0); }
      96%, 100% { opacity: 0; }
    }

    .mod-pulse { animation: modePulse 8s infinite ease-in-out; }
    .mod-pulse-left { animation: modePulse 8s infinite ease-in-out; transform-origin: 130px 110px; }
    .mod-pulse-right { animation: modePulse 8s infinite ease-in-out; transform-origin: 190px 110px; }
    .mod-normal { animation: modeNormal 8s infinite ease-in-out; }
    .mod-result { animation: modeResultBox 8s infinite ease-in-out; }
  `;

  // Save progress automatically when final practice step is completed

  const handleNextStep = () => {
    if (subStep === 'vd-mean') setSubStep('vd-median');
    else if (subStep === 'vd-median') setSubStep('vd-mode');
    else if (subStep === 'vd-mode') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('r3');
    else if (subStep === 'r3') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'mean') {
      setAnswerState('correct');
      setFeedbackText("Correct! Since the scores are balanced with no extreme values (outliers), the Mean (74) provides the best overall representative average of the class.");
    } else {
      setAnswerState('wrong');
      setHintText("While Median (75) is also close, Mean is the most mathematically standard representative for symmetrical data without outliers.");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'median') {
      setAnswerState('correct');
      setFeedbackText("Correct! The outlier (100) pulls the Mean up to 78.6 (higher than 4 out of 5 students!). The Median stays at 75, which is far more representative of the typical score.");
    } else {
      setAnswerState('wrong');
      setHintText("Notice how the single outlier (100) drags the Mean up to 78.6, which is higher than almost the entire class. The Mean is distorted by outliers!");
    }
  };

  const handleR3Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'mode') {
      setAnswerState('correct');
      setFeedbackText("Correct! The Mode (size 7) represents the most common size sold. A store needs to stock what sells most frequently.");
    } else {
      setAnswerState('wrong');
      setHintText("The shop cannot restock a decimal size (like Mean = 7.4). For inventory and categories, the Mode is the only logical choice.");
    }
  };



  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        ${statStyles}
        .balance-beam {
          height: 14px;
          background: #9ca3af;
          border-radius: 8px;
          position: relative;
          width: 88%;
          margin: 50px auto 10px auto;
          transition: transform 0.4s ease;
        }
        .pivot {
          width: 0;
          height: 0;
          border-left: 26px solid transparent;
          border-right: 26px solid transparent;
          border-bottom: 36px solid var(--clr-accent);
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .score-weight {
          position: absolute;
          width: 36px;
          height: 36px;
          background: var(--clr-accent);
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 700;
          bottom: 14px;
          transform: translateX(-50%);
          box-shadow: var(--shadow-btn);
          transition: left 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .indicator-line {
          position: absolute;
          width: 4px;
          height: 40px;
          bottom: 0px;
          transform: translateX(-50%);
        }
        .stats-vertical-divider {
          position: absolute;
          left: 50%;
          border-left: 2px dashed var(--clr-border);
          width: 4px;
          height: 40px;
          bottom: 0px;
          transform: translateX(-50%);
        }
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Mean vs Median vs Mode
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-mean' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            MEAN
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Study how the individual data heights are combined and divided equally.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/mean.png"
                alt="Mean representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Mean is the average of all values.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Median ➔
          </button>
        </div>
      )}

      {subStep === 'vd-median' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            MEDIAN
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Observe how the numbers are arranged from smallest to largest, pointing directly to the center.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/median.png"
                alt="Median representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Median is the middle value in an ordered dataset.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Mode ➔
          </button>
        </div>
      )}

      {subStep === 'vd-mode' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            MODE
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Inspect the blocks to see which specific number appears with the highest frequency.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/mode.png"
                alt="Mode representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Mode is the value that appears most often.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Mean</strong>, <strong>Median</strong>, or <strong>Mode</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Balanced Scores */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '520px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: The Typical Student
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Five student scores: <strong>68, 72, 75, 77, 78</strong>.
              <br />
              If you had to describe a "typical" student's score, which representative would you choose?
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', position: 'relative', marginBottom: '24px', minHeight: '160px', overflow: 'hidden', width: '100%', maxWidth: '480px' }}>
            <div className="balance-beam" style={{
              transform: selectedOption === 'mean' ? 'rotate(0deg)' : selectedOption === 'median' ? 'rotate(-2deg)' : 'rotate(0deg)'
            }}>
              {/* Plotting points (percentages map values from 60 to 90) */}
              <div className="score-weight" style={{ left: '26%' }}>68</div>
              <div className="score-weight" style={{ left: '40%' }}>72</div>
              <div className="score-weight" style={{ left: '50%' }}>75</div>
              <div className="score-weight" style={{ left: '56%', bottom: '50px' }}>77</div>
              <div className="score-weight" style={{ left: '62%' }}>78</div>

              {/* Mean marker line (74 -> 46%) */}
              {selectedOption === 'mean' && (
                <div className="indicator-line" style={{ background: 'var(--clr-correct)', left: '46%', width: '4px', height: '65px', bottom: '-10px' }}>
                  <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--clr-correct)', background: 'var(--clr-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--clr-correct)' }}>
                    Mean (74.8)
                  </span>
                </div>
              )}
              {/* Median marker line (75 -> 50%) */}
              {selectedOption === 'median' && (
                <div className="indicator-line" style={{ background: 'var(--clr-accent)', left: '50%', width: '4px', height: '65px', bottom: '-10px' }}>
                  <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--clr-accent)', background: 'var(--clr-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--clr-accent)' }}>
                    Median (75)
                  </span>
                </div>
              )}
            </div>
            <div className="pivot" style={{
              left: selectedOption === 'median' ? '4%' : '0%'
            }} />
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
              Scores balance beam (pivot placed at balance point)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR1Submit('mean')} className={selectedOption === 'mean' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Mean (74.8)</button>
            <button onClick={() => handleR1Submit('median')} className={selectedOption === 'median' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Median (75)</button>
            <button onClick={() => handleR1Submit('mode')} className={selectedOption === 'mode' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Mode (None)</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next Round</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Outlier Animation */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '520px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: The Outlier
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              One student scored 100! The scores are now: <strong>68, 72, 75, 78, 100</strong>.
              <br />
              Has the class suddenly become much better? Which representative is now more reliable?
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', position: 'relative', marginBottom: '24px', minHeight: '160px', overflow: 'hidden', width: '100%', maxWidth: '480px' }}>
            <div className="balance-beam" style={{
              transform: selectedOption === 'mean' ? 'rotate(5deg)' : selectedOption === 'median' ? 'rotate(0deg)' : 'rotate(2deg)'
            }}>
              {/* Static weights */}
              <div className="score-weight" style={{ left: '26%' }}>68</div>
              <div className="score-weight" style={{ left: '40%' }}>72</div>
              <div className="score-weight" style={{ left: '50%' }}>75</div>
              <div className="score-weight" style={{ left: '60%' }}>78</div>

              {/* Outlier slides from original 77 (56%) to 100 (90%) */}
              <div className="score-weight" style={{
                left: r2Transitioned ? '90%' : '56%',
                background: 'var(--clr-wrong)',
                transition: 'left 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}>100</div>

              {/* Mean marker line (78.6 -> 61%) */}
              <div className="indicator-line" style={{
                background: 'var(--clr-wrong)',
                left: '61%',
                width: '4px',
                height: '65px',
                bottom: '-10px',
                opacity: selectedOption === 'mean' ? 1 : 0.45
              }}>
                <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--clr-wrong)', background: 'var(--clr-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--clr-wrong)', opacity: selectedOption === 'mean' ? 1 : 0.7 }}>
                  Mean (78.6)
                </span>
              </div>

              {/* Median marker line (75 -> 50%) */}
              <div className="indicator-line" style={{
                background: 'var(--clr-correct)',
                left: '50%',
                width: '4px',
                height: '65px',
                bottom: '-10px',
                opacity: selectedOption === 'median' ? 1 : 0.45
              }}>
                <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--clr-correct)', background: 'var(--clr-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--clr-correct)', opacity: selectedOption === 'median' ? 1 : 0.7 }}>
                  Median (75)
                </span>
              </div>
            </div>
            <div className="pivot" style={{
              left: selectedOption === 'mean' ? '11%' : '0%'
            }} />
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
              Blue marker = Median (75), Red marker = Mean (78.6). The Mean was pulled far to the right!
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR2Submit('mean')} className={selectedOption === 'mean' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Mean (78.6)</button>
            <button onClick={() => handleR2Submit('median')} className={selectedOption === 'median' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Median (75)</button>
            <button onClick={() => handleR2Submit('mode')} className={selectedOption === 'mode' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Mode (None)</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next Round</button>
            </div>
          )}
        </div>
      )}

      {/* Round 3: Category / Mode Popularity */}
      {subStep === 'r3' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '520px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 3: Most Popular
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              A shoe shop sold sizes: <strong>6, 7, 7, 7, 8, 8, 9</strong>.
              <br />
              Which size should the shop restock?
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', height: '140px' }}>
              {/* Size 6: 1 unit */}
              <div style={{ width: '60px', textAlign: 'center' }}>
                <div style={{ background: 'var(--clr-border)', height: '30px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>1</div>
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Size 6</div>
              </div>
              {/* Size 7: 3 units */}
              <div style={{ width: '60px', textAlign: 'center' }}>
                <div style={{
                  background: selectedOption === 'mode' ? 'var(--clr-correct)' : 'var(--clr-accent)',
                  height: '90px',
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: selectedOption === 'mode' ? '0 0 10px var(--clr-correct)' : 'none',
                  transition: 'all 0.3s ease'
                }}>3</div>
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Size 7</div>
              </div>
              {/* Size 8: 2 units */}
              <div style={{ width: '60px', textAlign: 'center' }}>
                <div style={{ background: 'var(--clr-border)', height: '60px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>2</div>
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Size 8</div>
              </div>
              {/* Size 9: 1 unit */}
              <div style={{ width: '60px', textAlign: 'center' }}>
                <div style={{ background: 'var(--clr-border)', height: '30px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>1</div>
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Size 9</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR3Submit('mean')} className={selectedOption === 'mean' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Mean (7.4)</button>
            <button onClick={() => handleR3Submit('median')} className={selectedOption === 'median' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Median (7)</button>
            <button onClick={() => handleR3Submit('mode')} className={selectedOption === 'mode' ? 'primary' : 'secondary'} style={{ padding: '10px 20px' }}>Mode (7)</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Mean Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 260px',
              maxWidth: '300px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                MEAN
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The average of all values.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Common Formula:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '12px', borderLeft: '3px solid var(--clr-accent)', fontWeight: '600', fontFamily: 'monospace' }}>
                  Sum of values ÷ Number of values
                </span>
              </p>
            </div>

            {/* Median Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 260px',
              maxWidth: '300px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                MEDIAN
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The middle value after arranging the data.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '12px', borderLeft: '3px solid var(--clr-correct)', fontWeight: '600', fontFamily: 'monospace' }}>
                  6, 8, 10, 12, 14
                  <br />
                  Median = 10
                </span>
              </p>
            </div>

            {/* Mode Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid #4ba3e3',
              flex: '1 1 260px',
              maxWidth: '300px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: '#4ba3e3', fontWeight: 'bold' }}>
                MODE
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> The value that occurs most frequently.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '12px', borderLeft: '3px solid #4ba3e3', fontWeight: '600', fontFamily: 'monospace' }}>
                  4, 7, 7, 9, 11
                  <br />
                  Mode = 7
                </span>
              </p>
            </div>
          </div>

          {/* Decision Rule Flowchart Cards */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>Am I looking for...</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>The overall mathematical average?</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-accent)', display: 'block', marginTop: '10px' }}>MEAN</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>The exact middle value (resistant to outliers)?</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-correct)', display: 'block', marginTop: '10px' }}>MEDIAN</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>The most common popularity selection?</span>
                <strong style={{ fontSize: '1.2rem', color: '#4ba3e3', display: 'block', marginTop: '10px' }}>MODE</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Mean vs Median vs Mode challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['mean-median-mode'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LimitsDifferentiationChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-limits'); // vd-limits, vd-differentiation, intro, r1, r2, r3, comparison, q1, q2, practice-redirect
  const [pointX, setPointX] = useState(150);
  const [selectedTool, setSelectedTool] = useState(null); // magnifying, tangent
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Round 3 sub-scenarios
  const [r3Scenario, setR3Scenario] = useState('A'); // A, B
  const [r3AAnswer, setR3AAnswer] = useState(null);
  const [r3BAnswer, setR3BAnswer] = useState(null);



  // Math function for the graph: y = 200 - 0.0018 * (x - 250)^2
  const getGraphY = (x) => {
    return 200 - 0.0018 * Math.pow(x - 250, 2);
  };

  const getGraphSlope = (x) => {
    // dy/dx = -0.0036 * (x - 250)
    return -0.0036 * (x - 250);
  };

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-limits' || subStep === 'vd-differentiation') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'r3') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const limitDiffStyles = `
    @keyframes limitSummaryFade {
      0%, 65% { opacity: 0; transform: translateY(5px); }
      75%, 93% { opacity: 1; transform: translateY(0); }
      96%, 100% { opacity: 0; }
    }
    .limit-summary-overlay {
      animation: limitSummaryFade 4s infinite ease-in-out;
      opacity: 0;
    }

    @keyframes diffSummaryFade {
      0%, 50% { opacity: 0; transform: translateY(5px); }
      60%, 93% { opacity: 1; transform: translateY(0); }
      96%, 100% { opacity: 0; }
    }
    .diff-summary-overlay {
      animation: diffSummaryFade 6s infinite ease-in-out;
      opacity: 0;
    }
    .diff-tangent-glow {
      filter: drop-shadow(0 0 3px rgba(92, 184, 122, 0.6));
    }
  `;

  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    if (subStep === 'r1') {
      setSelectedTool('magnifying');
      setPointX(150);
    } else if (subStep === 'r2') {
      setSelectedTool('tangent');
      setPointX(150);
    }
  }, [subStep]);

  // Save progress automatically when final practice step is completed

  const handleNextStep = () => {
    if (subStep === 'vd-limits') setSubStep('vd-differentiation');
    else if (subStep === 'vd-differentiation') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('r3');
    else if (subStep === 'r3') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'value') {
      setAnswerState('correct');
      setFeedbackText("Great job! Even though there is a hole at x = 250, as you move point P closer to 250, you are investigating what height (y-value) the curve approaches. This is a Limit!");
    } else {
      setAnswerState('wrong');
      setHintText("Notice how the graph zooms in on the height. We want to know where the point is heading, not how steep it is.");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'slope') {
      setAnswerState('correct');
      setFeedbackText("Correct! The Tangent Ruler measures the exact steepness or slope at that specific point. This is Differentiation!");
    } else {
      setAnswerState('wrong');
      setHintText("The tangent line tilts to match the steepness of the curve at that instant, which shows the rate of change.");
    }
  };

  const handleR3ASubmit = (tool) => {
    if (tool === 'magnifying') {
      setR3AAnswer('correct');
    } else {
      setR3AAnswer('wrong');
    }
  };

  const handleR3BSubmit = (tool) => {
    if (tool === 'tangent') {
      setR3BAnswer('correct');
    } else {
      setR3BAnswer('wrong');
    }
  };



  // Calculate dynamic camera viewBox zoom near the hole at x = 250, y = 200
  const dist = Math.abs(pointX - 250);
  let viewBoxVal = "0 0 500 300";
  if (subStep === 'r1' && dist < 80) {
    const ratio = (80 - dist) / 80; // 0 to 1
    const minX = 0 + ratio * 180;
    const minY = 0 + ratio * 130;
    const w = 500 - ratio * 360;
    const h = 300 - ratio * 210;
    viewBoxVal = `${minX} ${minY} ${w} ${h}`;
  }

  const currentY = getGraphY(pointX);
  const currentSlope = getGraphSlope(pointX);

  // Tangent line values
  const tLength = 50;
  const tx1 = pointX - tLength;
  const ty1 = currentY - tLength * currentSlope;
  const tx2 = pointX + tLength;
  const ty2 = currentY + tLength * currentSlope;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{limitDiffStyles}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Limits vs Differentiation
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-limits' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            LIMITS
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Observe the points on the curve approaching the empty hole from both the left and right sides.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/limit.png"
                alt="Limit representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Limits find the value a function approaches.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Differentiation ➔
          </button>
        </div>
      )}

      {subStep === 'vd-differentiation' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            DIFFERENTIATION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Watch the tangent line tilt and adapt as the point moves along the curve.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <svg width="320" height="320" viewBox="0 0 320 320" style={{ background: 'var(--clr-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-btn)' }}>
              <defs>
                <pattern id="grid-pattern-diff" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="var(--clr-border)" opacity="0.25" />
                </pattern>
              </defs>

              <rect x="0" y="0" width="320" height="320" fill="url(#grid-pattern-diff)" />

              {/* Curve line */}
              <path d="M 60,240 C 130,240 190,80 260,80" fill="none" stroke="var(--clr-border)" strokeWidth="3" />

              {/* Animating Point and Tangent Line */}
              <g>
                <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="M 60,240 C 130,240 190,80 260,80" />
                <line x1="-35" y1="0" x2="35" y2="0" stroke="var(--clr-correct)" strokeWidth="3" className="diff-tangent-glow" />
                <circle cx="0" cy="0" r="6" fill="var(--clr-correct)" />
              </g>

              {/* Differentiation Summary Overlay */}
              <g className="diff-summary-overlay">
                <rect x="50" y="260" width="220" height="32" rx="6" fill="rgba(92, 184, 122, 0.12)" stroke="var(--clr-correct)" strokeWidth="1.5" />
                <text x="160" y="281" textAnchor="middle" fill="var(--clr-correct)" fontSize="15" fontWeight="bold">dy/dx = f'(x) = Slope</text>
              </g>
            </svg>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Differentiation finds how fast a function changes.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Limits</strong> or <strong>Differentiation</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Magnifying Glass (Limits) */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Magnifying Glass
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Drag point <strong>P</strong> closer to <strong>x = 250</strong> using the slider.
              Observe how the magnifying lens automatically zooms in on the discontinuous gap (hole) as you approach.
            </p>
          </div>

          {/* Interactive Graph Box */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg
              width="100%"
              height="280"
              viewBox="0 0 500 300"
              style={{
                maxWidth: '500px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)'
              }}
            >
              <defs>
                <clipPath id="lens-clip">
                  <circle cx="250" cy="200" r="42" />
                </clipPath>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="0" x2="50" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="450" y1="0" x2="450" y2="300" stroke="rgba(255,255,255,0.05)" />

              <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

              {/* Curve path with a visual hole at x = 250 */}
              <path
                d={`M 100,${getGraphY(100)} Q 250,240.5 400,${getGraphY(400)}`}
                fill="none"
                stroke="var(--clr-text-soft)"
                strokeWidth="4"
              />

              {/* Target Hole at x=250 */}
              <circle cx="250" cy="200" r="6" fill="var(--clr-card)" stroke="var(--clr-wrong)" strokeWidth="3" />

              {/* Dynamic Magnifying Lens Zoom Overlay (Fades in and scales as P approaches) */}
              {dist < 80 && (
                <g style={{ opacity: (80 - dist) / 80 }}>
                  <g clipPath="url(#lens-clip)">
                    {/* Background rectangle inside lens */}
                    <rect x="200" y="150" width="100" height="100" fill="var(--clr-card)" opacity="0.95" />
                    {/* Zoomed curve path */}
                    <path
                      d={`M 100,${getGraphY(100)} Q 250,240.5 400,${getGraphY(400)}`}
                      fill="none"
                      stroke="var(--clr-accent)"
                      strokeWidth={4 + ((80 - dist) / 80) * 3}
                      transform={`translate(250, 200) scale(${1.0 + ((80 - dist) / 80) * 1.2}) translate(-250, -200)`}
                    />
                    {/* Zoomed hole */}
                    <circle
                      cx="250"
                      cy="200"
                      r={6}
                      fill="var(--clr-card)"
                      stroke="var(--clr-wrong)"
                      strokeWidth={3 + ((80 - dist) / 80) * 2}
                      transform={`translate(250, 200) scale(${1.0 + ((80 - dist) / 80) * 1.2}) translate(-250, -200)`}
                    />
                  </g>
                  {/* Lens Frame & Handle */}
                  <circle cx="250" cy="200" r="42" fill="none" stroke="var(--clr-accent)" strokeWidth="3.5" />
                  <line x1="280" y1="230" x2="305" y2="255" stroke="var(--clr-accent)" strokeWidth="6" strokeLinecap="round" />
                </g>
              )}

              {/* Label drawn below the curve to prevent overlapping with point label */}
              <text x="250" y="260" fill="var(--clr-wrong)" fontSize="12" fontWeight="bold" textAnchor="middle">Discontinuity (Hole)</text>

              {/* Normal Point P drawn on top of the lens so it stays crisp */}
              <circle cx={pointX} cy={currentY} r="8" fill="var(--clr-accent)" />
              <text x={pointX} y={currentY - 16} fill="var(--clr-accent)" fontSize="13" fontWeight="bold" textAnchor="middle">P</text>
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '20px', position: 'relative' }}>
              <div style={{ position: 'relative', height: '20px', marginBottom: '4px' }}>
                <span style={{
                  position: 'absolute',
                  left: `${((pointX - 100) / 300) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontWeight: 'bold',
                  color: 'var(--clr-accent)',
                  fontSize: '0.9rem'
                }}>
                  x = {pointX}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={pointX}
                onChange={(e) => setPointX(parseInt(e.target.value))}
                style={{ width: '100%', margin: 0 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
                <span>x = 100</span>
                <span>x = 400</span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginTop: '12px' }}>
              Point position: ({pointX}, {currentY.toFixed(0)}) | Distance to hole: {dist.toFixed(0)}px
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What is the Magnifying Glass investigating as you approach the hole?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR1Submit('value')} className={selectedOption === 'value' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The height value the function approaches</button>
            <button onClick={() => handleR1Submit('slope')} className={selectedOption === 'slope' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>How steep the graph is at that point</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Tangent Ruler →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Tangent Ruler (Differentiation) */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Tangent Ruler
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Drag point <strong>P</strong> along the curve. Observe how the tangent ruler tilts to match the slope at each instant.
            </p>
          </div>

          {/* Interactive Graph Box */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg
              width="100%"
              height="280"
              viewBox="0 0 500 300"
              style={{
                maxWidth: '500px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)'
              }}
            >
              {/* Grid Lines */}
              <line x1="50" y1="0" x2="50" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="450" y1="0" x2="450" y2="300" stroke="rgba(255,255,255,0.05)" />

              {/* Continuous curve path (no hole) */}
              <path
                d={`M 100,${getGraphY(100)} Q 250,240.5 400,${getGraphY(400)}`}
                fill="none"
                stroke="var(--clr-text-soft)"
                strokeWidth="4"
              />

              {/* Tangent Line - drawn on top of the curve for perfect visibility */}
              <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />

              {/* Current Point P */}
              <circle cx={pointX} cy={currentY} r="8" fill="var(--clr-accent)" />
              <text x={pointX} y={currentY - 16} fill="var(--clr-accent)" fontSize="14" fontWeight="bold" textAnchor="middle">P</text>
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '20px', position: 'relative' }}>
              <div style={{ position: 'relative', height: '20px', marginBottom: '4px' }}>
                <span style={{
                  position: 'absolute',
                  left: `${((pointX - 100) / 300) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontWeight: 'bold',
                  color: 'var(--clr-accent)',
                  fontSize: '0.9rem'
                }}>
                  x = {pointX}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={pointX}
                onChange={(e) => setPointX(parseInt(e.target.value))}
                style={{ width: '100%', margin: 0 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
                <span>x = 100</span>
                <span>x = 400</span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '12px' }}>
              Slope (dy/dx) = {currentSlope.toFixed(2)} | Steepness: {Math.abs(currentSlope) < 0.1 ? 'Flat (0)' : currentSlope > 0 ? 'Rising (+)' : 'Falling (-)'}
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What is the Tangent Ruler investigating as you drag it along the curve?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR2Submit('value')} className={selectedOption === 'value' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The height value the function approaches</button>
            <button onClick={() => handleR2Submit('slope')} className={selectedOption === 'slope' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The steepness (instant rate of change)</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Scenarios →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 3: Mini Scenarios */}
      {subStep === 'r3' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 24px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 3: Which Tool Would You Use?
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Select the correct tool (Magnifying Glass = Limit, Tangent Ruler = Differentiation) for each situation below.
            </p>
          </div>

          {/* Scenario A */}
          <div style={{ background: 'var(--clr-surface)', border: '1.5px solid var(--clr-border)', borderRadius: '12px', padding: '24px', marginBottom: '20px', textAlign: 'left', maxWidth: '560px', margin: '0 auto 20px auto' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scenario A</span>
            <h4 style={{ margin: '4px 0 12px 0', fontSize: '1.15rem' }}>A graph has a hole. You want to know what value the graph approaches near the hole.</h4>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => handleR3ASubmit('magnifying')}
                className={r3AAnswer === 'correct' ? 'primary' : 'secondary'}
                disabled={r3AAnswer === 'correct'}
                style={{ padding: '10px 16px', fontSize: '0.95rem' }}
              >
                🔍 Magnifying Glass (Limit)
              </button>
              <button
                onClick={() => handleR3ASubmit('tangent')}
                className={r3AAnswer === 'wrong' ? 'wrong' : 'secondary'}
                disabled={r3AAnswer === 'correct'}
                style={{ padding: '10px 16px', fontSize: '0.95rem' }}
              >
                📐 Tangent Ruler (Differentiation)
              </button>
            </div>
            {r3AAnswer === 'correct' && (
              <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', display: 'block', marginTop: '12px', fontSize: '0.9rem' }}>✓ Correct! We look near the hole to find the limit.</span>
            )}
            {r3AAnswer === 'wrong' && (
              <span style={{ color: 'var(--clr-wrong)', fontWeight: 'bold', display: 'block', marginTop: '12px', fontSize: '0.9rem' }}>Incorrect. Try again! Limits find values near discontinuities.</span>
            )}
          </div>

          {/* Scenario B */}
          {r3AAnswer === 'correct' && (
            <div style={{ background: 'var(--clr-surface)', border: '1.5px solid var(--clr-border)', borderRadius: '12px', padding: '24px', marginBottom: '20px', textAlign: 'left', maxWidth: '560px', margin: '20px auto' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scenario B</span>
              <h4 style={{ margin: '4px 0 12px 0', fontSize: '1.15rem' }}>A cyclist's distance-time graph is shown. You want to know how fast the cyclist is moving at one instant.</h4>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => handleR3BSubmit('magnifying')}
                  className={r3BAnswer === 'wrong' ? 'wrong' : 'secondary'}
                  disabled={r3BAnswer === 'correct'}
                  style={{ padding: '10px 16px', fontSize: '0.95rem' }}
                >
                  🔍 Magnifying Glass (Limit)
                </button>
                <button
                  onClick={() => handleR3BSubmit('tangent')}
                  className={r3BAnswer === 'correct' ? 'primary' : 'secondary'}
                  disabled={r3BAnswer === 'correct'}
                  style={{ padding: '10px 16px', fontSize: '0.95rem' }}
                >
                  📐 Tangent Ruler (Differentiation)
                </button>
              </div>
              {r3BAnswer === 'correct' && (
                <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold', display: 'block', marginTop: '12px', fontSize: '0.9rem' }}>✓ Correct! Instantaneous rate of speed is found via differentiation.</span>
              )}
              {r3BAnswer === 'wrong' && (
                <span style={{ color: 'var(--clr-wrong)', fontWeight: 'bold', display: 'block', marginTop: '12px', fontSize: '0.9rem' }}>Incorrect. Try again! Tangents measure instant speed rate.</span>
              )}
            </div>
          )}

          {r3AAnswer === 'correct' && r3BAnswer === 'correct' && (
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem', marginTop: '12px' }}>Next: Comparison →</button>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Limits Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                LIMITS
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Finds the value a function approaches as the input gets closer to a point.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Common Notation:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid var(--clr-accent)', fontWeight: '600', fontFamily: 'monospace' }}>
                  lim x → a f(x)
                </span>
              </p>
            </div>

            {/* Differentiation Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                DIFFERENTIATION
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Finds how fast a function changes at a point.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Common Notation:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid var(--clr-correct)', fontWeight: '600', fontFamily: 'monospace' }}>
                  dy/dx
                  <br />
                  f′(x)
                </span>
              </p>
            </div>
          </div>

          {/* Decision Rule Flowchart Cards */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>Before calculating, ask yourself:</p>

            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Where the graph height is heading?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)', display: 'block', marginTop: '8px' }}>🔍 LIMIT</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>How fast the graph is changing (steepness)?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', display: 'block', marginTop: '8px' }}>📐 DIFFERENTIATION</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Limits vs Differentiation challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['limits-differentiation'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DifferentiationIntegrationChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-differentiation'); // vd-differentiation, vd-integration, intro, r1, r2, comparison, q1, q2, q3, practice-redirect
  const [pointX, setPointX] = useState(150);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [diffFrame, setDiffFrame] = useState(0);
  const [integFrame, setIntegFrame] = useState(0);

  // Helper to determine active step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-differentiation' || subStep === 'vd-integration') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const calcStyles = `
    @keyframes waterFlow {
      0%, 15% { stroke-width: 2.5px; stroke-dashoffset: 0; }
      40%, 65% { stroke-width: 14px; stroke-dashoffset: -320px; }
      82%, 100% { stroke-width: 2.5px; stroke-dashoffset: -450px; }
    }

    @keyframes fillBucket {
      0%, 15% { transform: scaleY(0); }
      75%, 85% { transform: scaleY(1); }
      95%, 100% { transform: scaleY(0); }
    }

    .tap-water-stream {
      stroke: #4ba3e3;
      stroke-linecap: round;
      stroke-dasharray: 8 12;
      animation: waterFlow 5s infinite ease-in-out;
    }

    .water-in-bucket {
      transform-origin: 160px 275px;
      animation: fillBucket 5s infinite ease-in-out;
    }
  `;

  // Layer 3 MCQs

  // Sorting game state for Q3

  // Math curve: y = 230 - 0.0018 * (x - 100)^2 (rising from x=100 to x=400)
  const getGraphY = (x) => {
    return 230 - 0.0018 * Math.pow(x - 100, 2);
  };

  const getGraphSlope = (x) => {
    // dy/dx = -0.0036 * (x - 100) (SVG coordinates: Y goes down, so negative slope goes visually up)
    return -0.0036 * (x - 100);
  };

  const getAreaPath = () => {
    let path = 'M 100,260'; // Baseline start
    for (let x = 100; x <= pointX; x += 5) {
      path += ` L ${x},${getGraphY(x)}`;
    }
    path += ` L ${pointX},${getGraphY(pointX)}`;
    path += ` L ${pointX},260 Z`; // Close baseline
    return path;
  };

  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setPointX(150);
    setDiffFrame(0);
    setIntegFrame(0);
  }, [subStep]);

  useEffect(() => {
    if (subStep !== 'vd-differentiation') return;
    const interval = setInterval(() => {
      setDiffFrame(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, [subStep]);

  useEffect(() => {
    if (subStep !== 'vd-integration') return;
    const interval = setInterval(() => {
      setIntegFrame(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, [subStep]);

  // Save progress automatically when Q3 is finished

  const handleNextStep = () => {
    if (subStep === 'vd-differentiation') setSubStep('vd-integration');
    else if (subStep === 'vd-integration') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'slope') {
      setAnswerState('correct');
      setFeedbackText("Correct! The Slope Tool measures how steep the graph is at that point. This is Differentiation!");
    } else {
      setAnswerState('wrong');
      setHintText("The tangent line tilts to match the steepness of the curve at that specific point. It represents the rate of change.");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'area') {
      setAnswerState('correct');
      setFeedbackText("Correct! The Area Collector sums up all the region beneath the curve, which is the definition of Integration!");
    } else {
      setAnswerState('wrong');
      setHintText("The colored overlay spans the entire interval below the curve. It represents the accumulated sum, not the steepness.");
    }
  };




  const currentY = getGraphY(pointX);
  const currentSlope = getGraphSlope(pointX);

  // Tangent coordinates
  const tLen = 60;
  const tx1 = pointX - tLen;
  const ty1 = currentY - tLen * currentSlope;
  const tx2 = pointX + tLen;
  const ty2 = currentY + tLen * currentSlope;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{calcStyles}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Differentiation vs Integration
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-differentiation' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            DIFFERENTIATION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            See how the speed of the water flow changes over time.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/diff-first.png"
                alt="Differentiation stage 1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: diffFrame === 0 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/diff-middle.png"
                alt="Differentiation stage 2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: diffFrame === 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/diff-end.png"
                alt="Differentiation stage 3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: diffFrame === 2 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Differentiation measures how fast something changes.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Integration ➔
          </button>
        </div>
      )}

      {subStep === 'vd-integration' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            INTEGRATION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Watch how the water collects and fills the bucket.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/integration-first.png"
                alt="Integration stage 1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: integFrame === 0 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/integration-middle.png"
                alt="Integration stage 2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: integFrame === 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/integration-end.png"
                alt="Integration stage 3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: integFrame === 2 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Integration adds up everything over time.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Differentiation</strong> or <strong>Integration</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Slope Tool */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Slope Tool (📐)
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Drag point <strong>P</strong> along the curve. Observe how the tangent ruler tilts to match the slope at each instant.
            </p>
          </div>

          {/* Interactive Graph Box */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg
              width="100%"
              height="280"
              viewBox="0 0 500 300"
              style={{
                maxWidth: '500px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)'
              }}
            >
              {/* Grid Lines */}
              <line x1="50" y1="0" x2="50" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="450" y1="0" x2="450" y2="300" stroke="rgba(255,255,255,0.05)" />

              <line x1="100" y1="260" x2="400" y2="260" stroke="var(--clr-border)" strokeWidth="2" />

              {/* Curve path */}
              <path
                d={`M 100,${getGraphY(100)} Q 250,240.5 400,${getGraphY(400)}`}
                fill="none"
                stroke="var(--clr-text-soft)"
                strokeWidth="4"
              />

              {/* Tangent Line */}
              <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />

              {/* Current Point P */}
              <circle cx={pointX} cy={currentY} r="8" fill="var(--clr-accent)" />
              <text x={pointX} y={currentY - 16} fill="var(--clr-accent)" fontSize="13" fontWeight="bold" textAnchor="middle">P</text>
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '20px', position: 'relative' }}>
              <div style={{ position: 'relative', height: '20px', marginBottom: '4px' }}>
                <span style={{
                  position: 'absolute',
                  left: `${((pointX - 100) / 300) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontWeight: 'bold',
                  color: 'var(--clr-accent)',
                  fontSize: '0.9rem'
                }}>
                  x = {pointX}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={pointX}
                onChange={(e) => setPointX(parseInt(e.target.value))}
                style={{ width: '100%', margin: 0 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
                <span>x = 100</span>
                <span>x = 400</span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '12px' }}>
              Slope (dy/dx) = {currentSlope.toFixed(2)}
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What are you measuring using the Slope Tool?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR1Submit('slope')} className={selectedOption === 'slope' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>How steep the graph is at that point</button>
            <button onClick={() => handleR1Submit('area')} className={selectedOption === 'area' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The total accumulated area below the graph</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Area Collector →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Area Collector */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Area Collector (📦)
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Drag the slider to sweep point <strong>P</strong> from left to right.
              Watch the region below the curve fill with color as the total value accumulates.
            </p>
          </div>

          {/* Interactive Graph Box */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg
              width="100%"
              height="280"
              viewBox="0 0 500 300"
              style={{
                maxWidth: '500px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)'
              }}
            >
              {/* Grid Lines */}
              <line x1="50" y1="0" x2="50" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(255,255,255,0.05)" />
              <line x1="450" y1="0" x2="450" y2="300" stroke="rgba(255,255,255,0.05)" />

              {/* Accumulated Filled Area */}
              <path d={getAreaPath()} fill="rgba(16, 185, 129, 0.25)" />

              <line x1="100" y1="260" x2="400" y2="260" stroke="var(--clr-border)" strokeWidth="2" />

              {/* Curve path */}
              <path
                d={`M 100,${getGraphY(100)} Q 250,240.5 400,${getGraphY(400)}`}
                fill="none"
                stroke="var(--clr-text-soft)"
                strokeWidth="4"
              />

              {/* Current Point P */}
              <circle cx={pointX} cy={currentY} r="8" fill="var(--clr-accent)" />
              <text x={pointX} y={currentY - 16} fill="var(--clr-accent)" fontSize="13" fontWeight="bold" textAnchor="middle">P</text>
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '20px', position: 'relative' }}>
              <div style={{ position: 'relative', height: '20px', marginBottom: '4px' }}>
                <span style={{
                  position: 'absolute',
                  left: `${((pointX - 100) / 300) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontWeight: 'bold',
                  color: 'var(--clr-accent)',
                  fontSize: '0.9rem'
                }}>
                  x = {pointX}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={pointX}
                onChange={(e) => setPointX(parseInt(e.target.value))}
                style={{ width: '100%', margin: 0 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
                <span>x = 100</span>
                <span>x = 400</span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '12px' }}>
              Accumulated Area under Curve = {((pointX - 100) * 0.45).toFixed(0)} units²
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What is increasing as you sweep the point P and color the region?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR2Submit('area')} className={selectedOption === 'area' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Total accumulated area below the curve</button>
            <button onClick={() => handleR2Submit('slope')} className={selectedOption === 'slope' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The steepness (instant rate of change)</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Differentiation Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                DIFFERENTIATION
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Measures how fast a quantity changes at a point.
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> Finding the slope of a curve.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Common Notation:</strong> <code style={{ fontSize: '0.92rem', padding: '2px 6px', background: 'var(--clr-border)', borderRadius: '4px', fontWeight: 'bold' }}>dy/dx</code> or <code style={{ fontSize: '0.92rem', padding: '2px 6px', background: 'var(--clr-border)', borderRadius: '4px', fontWeight: 'bold' }}>f′(x)</code>
              </p>
            </div>

            {/* Integration Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                INTEGRATION (Accumulation)
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Adds up small changes to find the total.
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> Finding the area under a curve.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Common Notation:</strong> <code style={{ fontSize: '0.92rem', padding: '2px 6px', background: 'var(--clr-border)', borderRadius: '4px', fontWeight: 'bold' }}>∫ f(x) dx</code>
              </p>
            </div>
          </div>

          {/* Decision Rule Flowchart Cards */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '1.05rem' }}>Am I trying to find...</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '16px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>How fast a quantity is changing right now?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)', display: 'block', marginTop: '12px' }}>📐 Differentiation</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>How much total volume has accumulated over time?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', display: 'block', marginTop: '12px' }}> ∫  Integration</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Differentiation vs Integration challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['differentiation-integration'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DecimalsFractionsChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-fraction'); // vd-fraction, vd-decimal, intro, r1, r2, r3, comparison, q1, q2, practice-redirect
  const [activeMode, setActiveMode] = useState('fraction'); // fraction, decimal
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [decFrame, setDecFrame] = useState(0);

  // Helper to determine the active step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-fraction' || subStep === 'vd-decimal') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'r3') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const decimalStyles = `
    @keyframes highlightBarPiece {
      0%, 15% { fill: rgba(255, 255, 255, 0.02); stroke: var(--clr-border); filter: none; }
      25%, 80% { fill: rgba(92, 184, 122, 0.25); stroke: var(--clr-correct); filter: drop-shadow(0 0 6px rgba(92, 184, 122, 0.4)); }
      90%, 100% { fill: rgba(255, 255, 255, 0.02); stroke: var(--clr-border); filter: none; }
    }

    @keyframes fractionLabelShow {
      0%, 20% { opacity: 0; transform: scale(0.85); }
      30%, 80% { opacity: 1; transform: scale(1); }
      90%, 100% { opacity: 0; transform: scale(0.85); }
    }

    @keyframes textLabel1 {
      0%, 25% { opacity: 1; transform: translateY(0px) scale(1); }
      35%, 100% { opacity: 0; transform: translateY(-5px) scale(0.85); }
    }

    @keyframes textLabel2 {
      0%, 35% { opacity: 0; transform: translateY(5px) scale(0.85); }
      45%, 80% { opacity: 1; transform: translateY(0px) scale(1); }
      90%, 100% { opacity: 0; transform: translateY(0px) scale(0.85); }
    }

    .frac-pulse-piece {
      animation: highlightBarPiece 5s infinite ease-in-out;
    }

    .frac-label-fade {
      animation: fractionLabelShow 5s infinite ease-in-out;
    }

    .morph-text-1 {
      animation: textLabel1 5s infinite ease-in-out;
    }

    .morph-text-2 {
      animation: textLabel2 5s infinite ease-in-out;
    }
  `;

  // Layer 3 Q1 Connections Game
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]); // Array of strings like '1/2-0.5'
  const [q1Finished, setQ1Finished] = useState(false);

  // Layer 3 Q2 MCQ

  const leftOptions = ['1/2', '3/4', '1/5'];
  const rightOptions = ['0.75', '0.2', '0.5'];

  const matches = {
    '1/2': '0.5',
    '3/4': '0.75',
    '1/5': '0.2'
  };

  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setActiveMode('fraction');
    setSelectedLeft(null);
    setMatchedPairs([]);
    setQ1Finished(false);
    setDecFrame(0);
  }, [subStep]);

  useEffect(() => {
    if (subStep !== 'vd-decimal') return;
    const interval = setInterval(() => {
      setDecFrame(prev => (prev + 1) % 2);
    }, 1500);
    return () => clearInterval(interval);
  }, [subStep]);

  // Mark as completed immediately when Q2 is successfully answered

  const handleNextStep = () => {
    if (subStep === 'vd-fraction') setSubStep('vd-decimal');
    else if (subStep === 'vd-decimal') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('r3');
    else if (subStep === 'r3') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'no') {
      setAnswerState('correct');
      setFeedbackText("Correct! The shaded portion remained exactly half of the bar. Only the notation changed from 1/2 to 0.5!");
    } else {
      setAnswerState('wrong');
      setHintText("Look closely at the chocolate bar. Did the physical quantity of chocolate change, or just the labels?");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'representation') {
      setAnswerState('correct');
      setFeedbackText("Correct! The amount of pie remains three-quarters. Only the mathematical representation changed from 3/4 to 0.75.");
    } else {
      setAnswerState('wrong');
      setHintText("The circular pie has the exact same shaded area in both views. What changed is how we write it.");
    }
  };

  const handleR3Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'same') {
      setAnswerState('correct');
      setFeedbackText("Correct! 1/4 and 0.25 represent the exact same mathematical value, so they describe the same point on the number line.");
    } else {
      setAnswerState('wrong');
      setHintText("A number line point represents a unique quantity. If it doesn't move, what does that say about the two values?");
    }
  };

  const handleLeftSelect = (leftVal) => {
    if (q1Finished) return;
    setSelectedLeft(leftVal);
  };

  const handleRightSelect = (rightVal) => {
    if (!selectedLeft || q1Finished) return;

    // Check match
    if (matches[selectedLeft] === rightVal) {
      const newMatched = [...matchedPairs, `${selectedLeft}-${rightVal}`];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);

      if (newMatched.length === 3) {
        setQ1Finished(true);
        setAnswerState('correct');
        setFeedbackText("Excellent! All equivalent fractions and decimals matched perfectly!");
      }
    } else {
      // Incorrect match flash
      setSelectedLeft(null);
    }
  };


  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{decimalStyles}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Decimals vs Fractions
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-fraction' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            FRACTION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            See how one piece of the grid is represented as a fraction.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/contrast/fraction.png"
                alt="Fraction illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Fractions show parts of a whole.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Decimals ➔
          </button>
        </div>
      )}

      {subStep === 'vd-decimal' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            DECIMAL
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Watch the fraction notation transform into decimal form.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/fraction.png"
                alt="Fraction representation"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: decFrame === 0 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
              <img
                src="/contrast/decimal.png"
                alt="Decimal representation"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: decFrame === 1 ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Decimals show the same amount in decimal form.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Decimals</strong> or <strong>Fractions</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Chocolate Bar */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Chocolate Bar
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Switch between <strong>Fraction</strong> and <strong>Decimal</strong> representation views.
              Observe if the physical shaded quantity changes.
            </p>
          </div>

          {/* Interactive Representation Block */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Chocolate Bar SVG */}
            <svg
              width="100%"
              height="100"
              viewBox="0 0 400 100"
              style={{
                maxWidth: '400px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)',
                marginBottom: '20px'
              }}
            >
              {/* Shaded side */}
              <rect x="0" y="0" width="200" height="100" fill="var(--clr-accent)" opacity="0.85" />
              {/* Grid partition lines */}
              <line x1="100" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <line x1="200" y1="0" x2="200" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
              <line x1="300" y1="0" x2="300" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            </svg>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveMode('fraction')}
                className={activeMode === 'fraction' ? 'primary' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🍰 Fraction
              </button>
              <button
                onClick={() => setActiveMode('decimal')}
                className={activeMode === 'decimal' ? 'primary' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🔍 Decimal
              </button>
            </div>

            {/* Active Display Label */}
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--clr-accent)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {activeMode === 'fraction' ? '1/2' : '0.5'}
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            Did the shaded amount of chocolate change when switching representations?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR1Submit('yes')} className={selectedOption === 'yes' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Yes</button>
            <button onClick={() => handleR1Submit('no')} className={selectedOption === 'no' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>No</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next Round →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Circle */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Circle Pie Slice
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Switch notations and watch the circular graph representation.
            </p>
          </div>

          {/* Interactive Representation Block */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg
              width="100%"
              height="200"
              viewBox="0 0 300 200"
              style={{
                maxWidth: '300px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)',
                marginBottom: '20px'
              }}
            >
              {/* Circular Pie background */}
              <circle cx="150" cy="100" r="60" fill="none" stroke="var(--clr-border)" strokeWidth="2" />
              {/* Shaded 3/4 quadrant pie slice */}
              <path d="M 150,100 L 150,40 A 60,60 0 1,1 90,100 Z" fill="var(--clr-accent)" opacity="0.85" />
            </svg>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveMode('fraction')}
                className={activeMode === 'fraction' ? 'primary' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🍰 Fraction
              </button>
              <button
                onClick={() => setActiveMode('decimal')}
                className={activeMode === 'decimal' ? 'primary' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🔍 Decimal
              </button>
            </div>

            {/* Active Display Label */}
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--clr-accent)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {activeMode === 'fraction' ? '3/4' : '0.75'}
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What changed when you toggled the button?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR2Submit('amount')} className={selectedOption === 'amount' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The amount of shaded area</button>
            <button onClick={() => handleR2Submit('representation')} className={selectedOption === 'representation' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>The representation format</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next Round →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 3: Number Line */}
      {subStep === 'r3' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 3: Number Line Plot
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Observe the point plotted on the number line as you switch between forms.
            </p>
          </div>

          {/* Interactive Representation Block */}
          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg
              width="100%"
              height="100"
              viewBox="0 0 500 100"
              style={{
                maxWidth: '500px',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '8px',
                background: 'var(--clr-card)',
                marginBottom: '20px'
              }}
            >
              {/* Number Line Baseline */}
              <line x1="100" y1="50" x2="400" y2="50" stroke="var(--clr-text-soft)" strokeWidth="3" />
              {/* Left boundary tick */}
              <line x1="100" y1="40" x2="100" y2="60" stroke="var(--clr-text-soft)" strokeWidth="3" />
              <text x="100" y="80" fill="var(--clr-text-soft)" fontSize="14" textAnchor="middle">0</text>

              {/* Right boundary tick */}
              <line x1="400" y1="40" x2="400" y2="60" stroke="var(--clr-text-soft)" strokeWidth="3" />
              <text x="400" y="80" fill="var(--clr-text-soft)" fontSize="14" textAnchor="middle">1</text>

              {/* Middle boundary tick (0.5 / 1/2) */}
              <line x1="250" y1="45" x2="250" y2="55" stroke="var(--clr-text-soft)" strokeWidth="2" strokeDasharray="2 2" />

              {/* Plotted Point (representing 0.25 or 1/4) */}
              <circle cx="175" cy="50" r="8" fill="var(--clr-accent)" />
              <text x="175" y="32" fill="var(--clr-accent)" fontSize="15" fontWeight="bold" textAnchor="middle">
                {activeMode === 'fraction' ? '1/4' : '0.25'}
              </text>
            </svg>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveMode('fraction')}
                className={activeMode === 'fraction' ? 'primary' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🍰 Fraction
              </button>
              <button
                onClick={() => setActiveMode('decimal')}
                className={activeMode === 'decimal' ? 'primary' : 'secondary'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🔍 Decimal
              </button>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            Why didn't the point move along the number line when switching views?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR3Submit('different')} className={selectedOption === 'different' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Because they represent different values</button>
            <button onClick={() => handleR3Submit('same')} className={selectedOption === 'same' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Because they represent the same value</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Fractions Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                FRACTIONS
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Represents equal parts of a whole.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> 3/4 of a pizza.
              </p>
            </div>

            {/* Decimals Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                DECIMALS
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Represents the same value using place value.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Example:</strong> 0.75 of a pizza.
              </p>
            </div>
          </div>

          {/* Interactive Equal quantities arrow */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--clr-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <div>
              <strong style={{ display: 'block', marginBottom: '8px' }}>Fraction Representation</strong>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--clr-accent)' }}>3/4</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem', color: 'var(--clr-correct)' }}>⇄</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Same Quantity</span>
            </div>

            <div>
              <strong style={{ display: 'block', marginBottom: '8px' }}>Decimal Representation</strong>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--clr-correct)' }}>0.75</div>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '12px 0 0 0', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Ask yourself: <strong>"Did the physical quantity change?"</strong>
              <br />
              If <strong>No</strong>, then <strong>only the representation changed</strong>. They are equal!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 Connections */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Decimals vs Fractions challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['decimals-fractions'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PermutationCombinationChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-permutation'); // vd-permutation, vd-combination, intro, r1, r2, comparison, q1, q2, practice-redirect
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Round 1 state
  const [podiumOrder, setPodiumOrder] = useState([]); // Array of runner names: 'A', 'B', 'C'
  const [podiumSwapped, setPodiumSwapped] = useState(false);

  // Round 2 state
  const [selectedToppings, setSelectedToppings] = useState([]); // Array of strings: 'mushroom', 'pepper', 'cheese'
  const [toppingsSwapped, setToppingsSwapped] = useState(false);


  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setPodiumOrder([]);
    setPodiumSwapped(false);
    setSelectedToppings([]);
    setToppingsSwapped(false);
  }, [subStep]);

  // Save progress automatically when final practice step is completed

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-permutation' || subStep === 'vd-combination') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleNextStep = () => {
    if (subStep === 'vd-permutation') setSubStep('vd-combination');
    else if (subStep === 'vd-combination') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handlePlacePodium = (runner) => {
    if (podiumOrder.includes(runner) || podiumSwapped) return;
    const newOrder = [...podiumOrder, runner];
    setPodiumOrder(newOrder);

    if (newOrder.length === 3) {
      // Auto trigger swap after 1s
      setTimeout(() => {
        setPodiumSwapped(true);
      }, 1000);
    }
  };

  const handleSelectTopping = (topping) => {
    if (toppingsSwapped) return;
    let newToppings = [...selectedToppings];
    if (newToppings.includes(topping)) {
      newToppings = newToppings.filter(t => t !== topping);
    } else {
      if (newToppings.length < 2) {
        newToppings.push(topping);
      }
    }
    setSelectedToppings(newToppings);

    if (newToppings.length === 2) {
      setTimeout(() => {
        setToppingsSwapped(true);
      }, 1000);
    }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'yes') {
      setAnswerState('correct');
      setFeedbackText("Correct! Swapping first and second place winners changes who gets the gold and silver. Order matters, so this is a Permutation!");
    } else {
      setAnswerState('wrong');
      setHintText("Wait, did the specific medals change hands? If runner A had gold and now runner B has gold, is that a different race outcome?");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'no') {
      setAnswerState('correct');
      setFeedbackText("Correct! Adding Cheese then Mushroom makes the exact same pizza recipe as Mushroom then Cheese. Order doesn't matter, so this is a Combination!");
    } else {
      setAnswerState('wrong');
      setHintText("Look at the pizza. Does it have the exact same two ingredients on it, regardless of which one was chosen first?");
    }
  };



  const permCombStyles = `
    /* Permutation animations */
    @keyframes permA {
      0%, 20% { transform: translate(0, 0); }
      30%, 85% { transform: translate(80px, 0); }
      95%, 100% { transform: translate(0, 0); }
    }
    @keyframes permB {
      0%, 20% { transform: translate(0, 0); }
      30%, 85% { transform: translate(80px, 0); }
      95%, 100% { transform: translate(0, 0); }
    }
    @keyframes permC {
      0%, 20% { transform: translate(0, 0); }
      30%, 85% { transform: translate(-160px, 0); }
      95%, 100% { transform: translate(0, 0); }
    }
    @keyframes permBadge {
      0%, 35% { opacity: 0; transform: scale(0.8) translateY(10px); }
      45%, 85% { opacity: 1; transform: scale(1) translateY(0); }
      95%, 100% { opacity: 0; }
    }

    .perm-char-a { animation: permA 6s infinite ease-in-out; }
    .perm-char-b { animation: permB 6s infinite ease-in-out; }
    .perm-char-c { animation: permC 6s infinite ease-in-out; }
    .perm-badge { animation: permBadge 6s infinite ease-in-out; transform-origin: 160px 230px; }

    /* Combination animations */
    @keyframes combA {
      0%, 20% { transform: translate(0, 0); }
      30%, 45% { transform: translate(50px, 80px); }
      55%, 80% { transform: translate(110px, 80px); }
      90%, 100% { transform: translate(0, 0); }
    }
    @keyframes combB {
      0%, 20% { transform: translate(0, 0); }
      30%, 45% { transform: translate(30px, 80px); }
      55%, 80% { transform: translate(-30px, 80px); }
      90%, 100% { transform: translate(0, 0); }
    }
    @keyframes combBoxGlow {
      0%, 20% { stroke: var(--clr-border); fill: rgba(255, 255, 255, 0.02); }
      30%, 80% { stroke: var(--clr-correct); fill: rgba(92, 184, 122, 0.08); filter: drop-shadow(0 0 4px rgba(92, 184, 122, 0.3)); }
      90%, 100% { stroke: var(--clr-border); fill: rgba(255, 255, 255, 0.02); }
    }
    @keyframes combBadge {
      0%, 50% { opacity: 0; transform: scale(0.8) translateY(10px); }
      55%, 80% { opacity: 1; transform: scale(1) translateY(0); }
      85%, 100% { opacity: 0; transform: scale(0.8) translateY(10px); }
    }

    .comb-char-a { animation: combA 6s infinite ease-in-out; }
    .comb-char-b { animation: combB 6s infinite ease-in-out; }
    .comb-box { animation: combBoxGlow 6s infinite ease-in-out; }
    .comb-badge { animation: combBadge 6s infinite ease-in-out; transform-origin: 160px 245px; }
  `;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        ${permCombStyles}
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Permutation vs Combination
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-permutation' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            PERMUTATION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Three people labeled A, B, and C stand in a row. Watch them rearrange into a different sequence.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <svg width="320" height="320" viewBox="0 0 320 320" style={{ background: 'var(--clr-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-btn)' }}>
              <defs>
                <pattern id="grid-pattern-perm" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="var(--clr-border)" opacity="0.25" />
                </pattern>
              </defs>

              <rect x="0" y="0" width="320" height="320" fill="url(#grid-pattern-perm)" />

              {/* Character labels */}
              <text x="80" y="70" fill="var(--clr-text-soft)" fontSize="14" fontWeight="600" textAnchor="middle">1st</text>
              <text x="160" y="70" fill="var(--clr-text-soft)" fontSize="14" fontWeight="600" textAnchor="middle">2nd</text>
              <text x="240" y="70" fill="var(--clr-text-soft)" fontSize="14" fontWeight="600" textAnchor="middle">3rd</text>

              {/* Person A */}
              <g className="perm-char-a">
                <circle cx="80" cy="120" r="22" fill="rgba(232, 134, 74, 0.15)" stroke="var(--clr-accent)" strokeWidth="2.5" />
                <text x="80" y="127" fill="var(--clr-accent)" fontSize="20" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">A</text>
              </g>

              {/* Person B */}
              <g className="perm-char-b">
                <circle cx="160" cy="120" r="22" fill="rgba(232, 134, 74, 0.15)" stroke="var(--clr-accent)" strokeWidth="2.5" />
                <text x="160" y="127" fill="var(--clr-accent)" fontSize="20" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">B</text>
              </g>

              {/* Person C */}
              <g className="perm-char-c">
                <circle cx="240" cy="120" r="22" fill="rgba(232, 134, 74, 0.15)" stroke="var(--clr-accent)" strokeWidth="2.5" />
                <text x="240" y="127" fill="var(--clr-accent)" fontSize="20" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">C</text>
              </g>

              {/* Badge: Different arrangement */}
              <g className="perm-badge">
                <rect x="70" y="210" width="180" height="44" rx="8" fill="rgba(232, 134, 74, 0.12)" stroke="var(--clr-accent)" strokeWidth="2" />
                <text x="160" y="237" fill="var(--clr-accent)" fontSize="16" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Different arrangement</text>
              </g>
            </svg>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Permutation is an arrangement where order matters.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Combination ➔
          </button>
        </div>
      )}

      {subStep === 'vd-combination' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            COMBINATION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            A and B are selected into a group. Watch the order swap inside the group.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <svg width="320" height="320" viewBox="0 0 320 320" style={{ background: 'var(--clr-surface)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-btn)' }}>
              <defs>
                <pattern id="grid-pattern-comb" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="var(--clr-border)" opacity="0.25" />
                </pattern>
              </defs>

              <rect x="0" y="0" width="320" height="320" fill="url(#grid-pattern-comb)" />

              {/* Characters original pool label */}
              <text x="160" y="45" fill="var(--clr-text-soft)" fontSize="13" fontWeight="500" textAnchor="middle">Initial Pool</text>

              {/* Person C (not selected, muted) */}
              <g opacity="0.2">
                <circle cx="240" cy="80" r="20" fill="var(--clr-text)" />
                <text x="240" y="86" fill="var(--clr-surface)" fontSize="16" fontWeight="bold" textAnchor="middle">C</text>
              </g>

              {/* Selection box container */}
              <rect x="95" y="125" width="130" height="70" rx="8" className="comb-box" strokeWidth="2.5" fill="none" />
              <text x="160" y="117" fill="var(--clr-text-soft)" fontSize="12" fontWeight="600" textAnchor="middle">Selected Group</text>

              {/* Selected Person A */}
              <g className="comb-char-a">
                <circle cx="80" cy="80" r="22" fill="rgba(92, 184, 122, 0.15)" stroke="var(--clr-correct)" strokeWidth="2.5" />
                <text x="80" y="87" fill="var(--clr-correct)" fontSize="18" fontWeight="bold" textAnchor="middle">A</text>
              </g>

              {/* Selected Person B */}
              <g className="comb-char-b">
                <circle cx="160" cy="80" r="22" fill="rgba(92, 184, 122, 0.15)" stroke="var(--clr-correct)" strokeWidth="2.5" />
                <text x="160" y="87" fill="var(--clr-correct)" fontSize="18" fontWeight="bold" textAnchor="middle">B</text>
              </g>

              {/* Badge: Same group */}
              <g className="comb-badge">
                <rect x="90" y="225" width="140" height="40" rx="8" fill="rgba(92, 184, 122, 0.12)" stroke="var(--clr-correct)" strokeWidth="2" />
                <text x="160" y="250" fill="var(--clr-correct)" fontSize="16" fontWeight="bold" textAnchor="middle">Same group</text>
              </g>
            </svg>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Combination is a selection where order does not matter.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Permutation</strong> or <strong>Combination</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Podium Winners */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Podium Winners (🏆)
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Tap runners <strong>A</strong>, <strong>B</strong>, and <strong>C</strong> in sequence to place them onto the podium (1st, 2nd, 3rd).
              Then watch Tenali swap them.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Runner Selection buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {['A', 'B', 'C'].map(runner => {
                const isPlaced = podiumOrder.includes(runner);
                return (
                  <button
                    key={runner}
                    onClick={() => handlePlacePodium(runner)}
                    className="option-card"
                    style={{
                      width: '60px',
                      height: '60px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isPlaced ? 'var(--clr-card)' : 'var(--clr-surface)',
                      opacity: isPlaced ? 0.4 : 1,
                      cursor: (isPlaced || podiumSwapped) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isPlaced || podiumSwapped}
                  >
                    {runner}
                  </button>
                );
              })}
            </div>

            {/* Podium Visual */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '12px',
              height: '160px',
              width: '100%',
              maxWidth: '360px',
              borderBottom: '4px solid var(--clr-text-soft)',
              paddingBottom: '8px',
              marginBottom: '20px'
            }}>
              {/* 2nd Place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '8px' }}>
                  {podiumSwapped ? (podiumOrder[1] === 'A' ? 'B' : 'A') : (podiumOrder[1] || '')}
                </span>
                <div style={{ background: 'rgba(255,255,255,0.08)', height: '60px', width: '100%', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--clr-border)', borderBottom: 'none' }}>
                  🥈 2nd
                </div>
              </div>

              {/* 1st Place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '85px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '8px' }}>
                  {podiumSwapped ? (podiumOrder[0] === 'A' ? 'B' : 'A') : (podiumOrder[0] || '')}
                </span>
                <div style={{ background: 'rgba(255,255,255,0.12)', height: '90px', width: '100%', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--clr-border)', borderBottom: 'none' }}>
                  🥇 1st
                </div>
              </div>

              {/* 3rd Place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '8px' }}>
                  {podiumOrder[2] || ''}
                </span>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '40px', width: '100%', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--clr-border)', borderBottom: 'none' }}>
                  🥉 3rd
                </div>
              </div>
            </div>

            {/* Swapped Text Indicator */}
            {podiumSwapped && (
              <div style={{ color: 'var(--clr-accent)', fontWeight: '500', fontSize: '1rem', marginTop: '10px' }}>
                🔄 Tenali swapped first and second place winners!
              </div>
            )}
          </div>

          {podiumSwapped && (
            <>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                Did this swap create a different outcome for the race winners?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                <button onClick={() => handleR1Submit('yes')} className={selectedOption === 'yes' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Yes, gold and silver swapped</button>
                <button onClick={() => handleR1Submit('no')} className={selectedOption === 'no' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>No, same runners are on podium</button>
              </div>
            </>
          )}

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Pizza Toppings →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Pizza Toppings */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Pizza Toppings (🍕)
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Choose two toppings to add to the pizza recipe. Then see how selection order affects the result.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Topping selectors */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {[
                { id: 'mushroom', label: 'Mushroom 🍄' },
                { id: 'pepper', label: 'Pepper 🌶️' },
                { id: 'cheese', label: 'Cheese 🧀' }
              ].map(topping => {
                const isSelected = selectedToppings.includes(topping.id);
                return (
                  <button
                    key={topping.id}
                    onClick={() => handleSelectTopping(topping.id)}
                    className={`option-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      padding: '10px 16px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: toppingsSwapped ? 'not-allowed' : 'pointer'
                    }}
                    disabled={toppingsSwapped}
                  >
                    {topping.label}
                  </button>
                );
              })}
            </div>

            {/* Pizza Visual */}
            {selectedToppings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
                  {/* Pizza Crust */}
                  <circle cx="70" cy="70" r="65" fill="#f4c430" stroke="#d49b25" strokeWidth="4" />
                  {/* Pizza Cheese base */}
                  <circle cx="70" cy="70" r="55" fill="#ffef96" />

                  {/* Render scattered toppings */}
                  {selectedToppings.includes('mushroom') && (
                    <>
                      <text x="45" y="55" fontSize="16">🍄</text>
                      <text x="85" y="85" fontSize="16">🍄</text>
                    </>
                  )}
                  {selectedToppings.includes('pepper') && (
                    <>
                      <text x="85" y="55" fontSize="16">🌶️</text>
                      <text x="45" y="85" fontSize="16">🌶️</text>
                    </>
                  )}
                  {selectedToppings.includes('cheese') && (
                    <>
                      <text x="65" y="45" fontSize="16">🧀</text>
                      <text x="65" y="95" fontSize="16">🧀</text>
                    </>
                  )}
                </svg>
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                  Ingredients: {selectedToppings.map(t => t.toUpperCase()).join(' + ')}
                </div>
              </div>
            )}

            {/* Swapped order indicator */}
            {toppingsSwapped && (
              <div style={{ color: 'var(--clr-correct)', fontWeight: '500', fontSize: '1rem', marginTop: '10px' }}>
                🔄 Tenali swaps the choice order: {selectedToppings[1]?.toUpperCase()} first, then {selectedToppings[0]?.toUpperCase()}.
              </div>
            )}
          </div>

          {toppingsSwapped && (
            <>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                Did changing the selection order change the final pizza recipe outcome?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                <button onClick={() => handleR2Submit('yes')} className={selectedOption === 'yes' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Yes, different pizza</button>
                <button onClick={() => handleR2Submit('no')} className={selectedOption === 'no' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>No, it has the same ingredients</button>
              </div>
            </>
          )}

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Permutation Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                PERMUTATION
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Arranging objects where the order is important.
              </p>
              <div style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Common Formula:</strong>
                <div style={{ display: 'block', marginTop: '10px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', paddingLeft: '12px', borderLeft: '3px solid var(--clr-accent)', fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem' }}>
                    <span><sup>n</sup>P<sub>r</sub> = </span>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', padding: '0 4px' }}>
                      <span style={{ borderBottom: '1px solid var(--clr-text)', padding: '0 4px', paddingBottom: '2px', width: '100%', textAlign: 'center' }}>n!</span>
                      <span style={{ paddingTop: '2px' }}>(n - r)!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combination Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                COMBINATION
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Selecting objects where the order is not important.
              </p>
              <div style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Common Formula:</strong>
                <div style={{ display: 'block', marginTop: '10px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', paddingLeft: '12px', borderLeft: '3px solid var(--clr-correct)', fontFamily: 'monospace', fontWeight: '600', fontSize: '1.1rem' }}>
                    <span><sup>n</sup>C<sub>r</sub> = </span>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', padding: '0 4px' }}>
                      <span style={{ borderBottom: '1px solid var(--clr-text)', padding: '0 4px', paddingBottom: '2px', width: '100%', textAlign: 'center' }}>n!</span>
                      <span style={{ paddingTop: '2px' }}>r!(n - r)!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>If I swap the selection order...</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>Does the result change? <strong>YES</strong></span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)', display: 'block', marginTop: '10px' }}>🏆  Permutation</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>Does the result change? <strong>NO</strong></span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', display: 'block', marginTop: '10px' }}>🤝 Combination</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Permutation vs Combination challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['permutation-combination'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PrimeCompositeChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-prime'); // vd-prime, vd-composite, intro, r1, r2, r3, comparison, q1, q2, practice-redirect
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Factor detector states
  const [tappedKeys, setTappedKeys] = useState([]);
  const [shakingKey, setShakingKey] = useState(null);

  // Layer 3 Sorter

  // Layer 3 Q2 MCQ State
  const [q2Part, setQ2Part] = useState('p1'); // p1 (15), p2 (29), finished

  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setTappedKeys([]);
    setShakingKey(null);
    setQ2Part('p1');
  }, [subStep]);

  // Save progress automatically when final practice step is completed
  useEffect(() => {
    if (q2Part === 'finished') {
      onMarkComplete?.();
    }
  }, [q2Part, onMarkComplete]);

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-prime' || subStep === 'vd-composite') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2' || subStep === 'r3') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleNextStep = () => {
    if (subStep === 'vd-prime') setSubStep('vd-composite');
    else if (subStep === 'vd-composite') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('r3');
    else if (subStep === 'r3') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleTapKey = (key, target, divisors) => {
    if (tappedKeys.includes(key) || answerState === 'correct') return;

    if (divisors.includes(key)) {
      setTappedKeys([...tappedKeys, key]);
    } else {
      setShakingKey(key);
      setTimeout(() => {
        setShakingKey(null);
      }, 400);
    }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'more') {
      setAnswerState('correct');
      setFeedbackText("Correct! 12 has 6 factors: 1, 2, 3, 4, 6, and 12. Since it has more than two factors, it is a Composite Number!");
    } else {
      setAnswerState('wrong');
      setHintText("Count the unlocked factor boxes below. Are there only two factors (1 and 12), or did you find others like 2, 3, 4, and 6?");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'two') {
      setAnswerState('correct');
      setFeedbackText("Correct! 13 has exactly two factors: 1 and itself (13). This makes it a Prime Number!");
    } else {
      setAnswerState('wrong');
      setHintText("Only 1 and 13 divided the number exactly. Count how many boxes were unlocked.");
    }
  };

  const handleR3Submit = () => {
    setAnswerState('correct');
    setFeedbackText("Correct! 1 is neither prime nor composite because it has only one factor (itself). Prime numbers must have exactly 2 factors, and composite numbers must have more than 2.");
  };




  const primeCompStyles = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .shake-btn {
      animation: shake 0.3s ease-in-out;
      border-color: var(--clr-wrong) !important;
      background: rgba(235, 94, 85, 0.1) !important;
    }

    /* Prime / Composite Animations */
    @keyframes primeNum {
      0%, 10% { transform: scale(0.9); opacity: 0; }
      15%, 85% { transform: scale(1); opacity: 1; }
      90%, 100% { transform: scale(0.9); opacity: 0; }
    }
    @keyframes primeLine1 {
      0%, 20% { stroke-dashoffset: 70; opacity: 0; }
      35%, 85% { stroke-dashoffset: 0; opacity: 1; }
      90%, 100% { opacity: 0; }
    }
    @keyframes primeLine2 {
      0%, 20% { stroke-dashoffset: 70; opacity: 0; }
      35%, 85% { stroke-dashoffset: 0; opacity: 1; }
      90%, 100% { opacity: 0; }
    }
    @keyframes primeFactor1 {
      0%, 40% { transform: scale(0.8); opacity: 0; }
      50%, 85% { transform: scale(1); opacity: 1; }
      90%, 100% { transform: scale(0.8); opacity: 0; }
    }
    @keyframes primeFactor2 {
      0%, 40% { transform: scale(0.8); opacity: 0; }
      50%, 85% { transform: scale(1); opacity: 1; }
      90%, 100% { transform: scale(0.8); opacity: 0; }
    }
    @keyframes primeBadge {
      0%, 50% { opacity: 0; transform: scale(0.8) translateY(10px); }
      60%, 85% { opacity: 1; transform: scale(1) translateY(0); }
      90%, 100% { opacity: 0; }
    }

    .prime-node-num { animation: primeNum 6s infinite ease-in-out; }
    .prime-line-1 { animation: primeLine1 6s infinite ease-in-out; stroke-dasharray: 70; }
    .prime-line-2 { animation: primeLine2 6s infinite ease-in-out; stroke-dasharray: 70; }
    .prime-fac-1 { animation: primeFactor1 6s infinite ease-in-out; }
    .prime-fac-2 { animation: primeFactor2 6s infinite ease-in-out; }
    .prime-badge-glow { animation: primeBadge 6s infinite ease-in-out; transform-origin: 160px 230px; }

    /* Composite Animations */
    @keyframes compNum {
      0%, 10% { transform: scale(0.9); opacity: 0; }
      15%, 85% { transform: scale(1); opacity: 1; }
      90%, 100% { transform: scale(0.9); opacity: 0; }
    }
    @keyframes compLine {
      0%, 20% { stroke-dashoffset: 120; opacity: 0; }
      35%, 85% { stroke-dashoffset: 0; opacity: 1; }
      90%, 100% { opacity: 0; }
    }
    @keyframes compFactor {
      0%, 45% { transform: scale(0.7); opacity: 0; }
      55%, 85% { transform: scale(1); opacity: 1; }
      90%, 100% { transform: scale(0.7); opacity: 0; }
    }
    @keyframes compBadge {
      0%, 55% { opacity: 0; transform: scale(0.8) translateY(10px); }
      65%, 85% { opacity: 1; transform: scale(1) translateY(0); }
      90%, 100% { opacity: 0; }
    }

    .comp-node-num { animation: compNum 6s infinite ease-in-out; }
    .comp-branch-line { animation: compLine 6s infinite ease-in-out; stroke-dasharray: 120; }
    .comp-fac-node { animation: compFactor 6s infinite ease-in-out; }
    .comp-badge-glow { animation: compBadge 6s infinite ease-in-out; transform-origin: 160px 230px; }
  `;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        ${primeCompStyles}
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Prime vs Composite
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-prime' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            PRIME NUMBER
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Examine the factors of 11 to see why it has only two divisors.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/prime.png"
                alt="Prime representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A prime number has exactly two factors.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Composite Number ➔
          </button>
        </div>
      )}

      {subStep === 'vd-composite' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            COMPOSITE NUMBER
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Examine the factors of 18 to see why it has multiple divisors.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/composite.png"
                alt="Composite representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A composite number has more than two factors.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether a number is <strong>Prime</strong> or <strong>Composite</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Number 12 */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Find the Factors of 12
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Tap every key below that divides <strong>12</strong> exactly (no remainder).
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Number</span>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '20px' }}>12</div>

            {/* Keys */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '440px', marginBottom: '24px' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(num => {
                const isTapped = tappedKeys.includes(num);
                const isShaking = shakingKey === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleTapKey(num, 12, [1, 2, 3, 4, 6, 12])}
                    className={`option-card ${isShaking ? 'shake-btn' : ''}`}
                    style={{
                      width: '46px',
                      height: '46px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: isTapped ? 'var(--clr-correct-bg)' : 'var(--clr-surface)',
                      borderColor: isTapped ? 'var(--clr-correct)' : 'var(--clr-border)',
                      color: isTapped ? 'var(--clr-correct)' : 'var(--clr-text)',
                      cursor: (isTapped || answerState === 'correct') ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isTapped || answerState === 'correct'}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Unlocked factor boxes */}
            <div style={{ width: '100%', maxWidth: '460px', borderTop: '1px solid var(--clr-border)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '10px' }}>
                Factors Found ({tappedKeys.length} / 6)
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 6, 12].map(f => {
                  const found = tappedKeys.includes(f);
                  return (
                    <div
                      key={f}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: found ? 'var(--clr-card)' : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${found ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        color: found ? 'var(--clr-text)' : 'rgba(255,255,255,0.1)',
                        minWidth: '50px',
                        textAlign: 'center'
                      }}
                    >
                      {found ? f : '?'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {tappedKeys.length === 6 && (
            <>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                What did you discover about the factors of 12?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                <button onClick={() => handleR1Submit('two')} className={selectedOption === 'two' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>It has only two factors (1 and itself)</button>
                <button onClick={() => handleR1Submit('more')} className={selectedOption === 'more' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>It has more than two factors</button>
              </div>
            </>
          )}

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next Mystery Number →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Number 13 */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Find the Factors of 13
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Tap every key below that divides <strong>13</strong> exactly. Tapping incorrect values will shake.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Number</span>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '20px' }}>13</div>

            {/* Keys */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '440px', marginBottom: '24px' }}>
              {Array.from({ length: 13 }, (_, i) => i + 1).map(num => {
                const isTapped = tappedKeys.includes(num);
                const isShaking = shakingKey === num;
                return (
                  <button
                    key={num}
                    onClick={() => handleTapKey(num, 13, [1, 13])}
                    className={`option-card ${isShaking ? 'shake-btn' : ''}`}
                    style={{
                      width: '42px',
                      height: '42px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                      background: isTapped ? 'var(--clr-correct-bg)' : 'var(--clr-surface)',
                      borderColor: isTapped ? 'var(--clr-correct)' : 'var(--clr-border)',
                      color: isTapped ? 'var(--clr-correct)' : 'var(--clr-text)',
                      cursor: (isTapped || answerState === 'correct') ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isTapped || answerState === 'correct'}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Unlocked factor boxes */}
            <div style={{ width: '100%', maxWidth: '460px', borderTop: '1px solid var(--clr-border)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '10px' }}>
                Factors Found ({tappedKeys.length} / 2)
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 13].map(f => {
                  const found = tappedKeys.includes(f);
                  return (
                    <div
                      key={f}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: found ? 'var(--clr-card)' : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${found ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        color: found ? 'var(--clr-text)' : 'rgba(255,255,255,0.1)',
                        minWidth: '50px',
                        textAlign: 'center'
                      }}
                    >
                      {found ? f : '?'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {tappedKeys.length === 2 && (
            <>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                How many factors did you find for 13?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                <button onClick={() => handleR2Submit('two')} className={selectedOption === 'two' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Exactly two factors</button>
                <button onClick={() => handleR2Submit('more')} className={selectedOption === 'more' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>More than two factors</button>
              </div>
            </>
          )}

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Special Number →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 3: Number 1 */}
      {subStep === 'r3' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 3: Find the Factors of 1
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Tap the keys that divide <strong>1</strong> exactly.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Special Number</span>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '20px' }}>1</div>

            {/* Keys */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                onClick={() => handleTapKey(1, 1, [1])}
                className="option-card"
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  background: tappedKeys.includes(1) ? 'var(--clr-correct-bg)' : 'var(--clr-surface)',
                  borderColor: tappedKeys.includes(1) ? 'var(--clr-correct)' : 'var(--clr-border)',
                  color: tappedKeys.includes(1) ? 'var(--clr-correct)' : 'var(--clr-text)',
                  cursor: (tappedKeys.includes(1) || answerState === 'correct') ? 'not-allowed' : 'pointer'
                }}
                disabled={tappedKeys.includes(1) || answerState === 'correct'}
              >
                1
              </button>
            </div>

            {/* Unlocked factor boxes */}
            <div style={{ width: '100%', maxWidth: '460px', borderTop: '1px solid var(--clr-border)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '10px' }}>
                Factors Found ({tappedKeys.length} / 1)
              </span>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: tappedKeys.includes(1) ? 'var(--clr-card)' : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${tappedKeys.includes(1) ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    color: tappedKeys.includes(1) ? 'var(--clr-text)' : 'rgba(255,255,255,0.1)',
                    minWidth: '50px',
                    textAlign: 'center'
                  }}
                >
                  {tappedKeys.includes(1) ? '1' : '?'}
                </div>
              </div>
            </div>
          </div>

          {tappedKeys.length === 1 && answerState === 'unanswered' && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                Number 1 has only <strong>one</strong> factor. Let's reveal where it fits:
              </p>
              <button onClick={handleR3Submit} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Reveal Classification</button>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '520px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Prime Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 240px',
              maxWidth: '280px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                PRIME NUMBER
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> A number with exactly two factors.
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
                <strong>Example:</strong> 7
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
                <strong>Factors:</strong> 1, 7
              </p>
            </div>

            {/* Composite Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 240px',
              maxWidth: '280px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                COMPOSITE NUMBER
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> A number with more than two factors.
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
                <strong>Example:</strong> 12
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
                <strong>Factors:</strong> 1, 2, 3, 4, 6, 12
              </p>
            </div>

            {/* Neither Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-text-soft)',
              flex: '1 1 240px',
              maxWidth: '280px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 16px 0', color: 'var(--clr-text-soft)', fontWeight: 'bold' }}>
                NEITHER
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> A number with exactly one factor.
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
                <strong>Example:</strong> 1
              </p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
                <strong>Factors:</strong> 1
              </p>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>Count the factors of the number:</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Exactly 2 factors?</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-accent)', display: 'block', marginTop: '8px' }}>Prime</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>More than 2 factors?</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-correct)', display: 'block', marginTop: '8px' }}>Composite</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Only 1 factor?</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--clr-text-soft)', display: 'block', marginTop: '8px' }}>Neither</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 Sorter */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Prime vs Composite challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['prime-composite'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrigInverseTrigChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-trig'); // vd-trig, vd-invtrig, intro, r1, r2, comparison, q1, q2, practice-redirect
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Layer 3 Sorter

  // Layer 3 Q2

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-trig' || subStep === 'vd-invtrig') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
  }, [subStep]);

  useEffect(() => {
    if (subStep === 'practice-redirect' && onMarkComplete) {
      onMarkComplete();
    }
  }, [subStep, onMarkComplete]);

  const handleNextStep = () => {
    if (subStep === 'vd-trig') setSubStep('vd-invtrig');
    else if (subStep === 'vd-invtrig') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'side') {
      setAnswerState('correct');
      setFeedbackText("Correct! Since you know the angle (30°), you are using trigonometry to calculate the missing side length.");
    } else {
      setAnswerState('wrong');
      setHintText("Look at the diagram. The angle is already given as 30°. The question mark is on the vertical side.");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'angle') {
      setAnswerState('correct');
      setFeedbackText("Correct! Since you know the side lengths (5 and 10), you use inverse trigonometry to calculate the missing angle.");
    } else {
      setAnswerState('wrong');
      setHintText("Look at the diagram. The sides are labeled 5 and 10. The question mark is on the angle θ.");
    }
  };



  const trigStyles = `
    @keyframes trigReveal {
      0%, 10% { opacity: 0; transform: scale(0.95); }
      15%, 85% { opacity: 1; transform: scale(1); }
      90%, 100% { opacity: 0; }
    }
    @keyframes arrowTrigDown {
      0%, 25% { opacity: 0; transform: translateY(-8px); }
      35%, 85% { opacity: 1; transform: translateY(0); }
      90%, 100% { opacity: 0; }
    }
    @keyframes ratioTrigReveal {
      0%, 35% { opacity: 0; transform: scale(0.9); }
      45%, 85% { opacity: 1; transform: scale(1); }
      90%, 100% { opacity: 0; }
    }
    @keyframes textGlowTrig {
      0%, 45%, 85%, 100% { text-shadow: none; filter: none; }
      55%, 75% { text-shadow: 0 0 8px var(--clr-accent-soft); filter: drop-shadow(0 0 5px var(--clr-accent)); }
    }

    .trig-fade { animation: trigReveal 6s infinite ease-in-out; transform-origin: 150px 100px; }
    .trig-arrow { animation: arrowTrigDown 6s infinite ease-in-out; }
    .trig-ratio { animation: ratioTrigReveal 6s infinite ease-in-out; }
    .trig-glow { animation: textGlowTrig 6s infinite ease-in-out; }
  `;

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '32px',
        maxWidth: '480px',
        margin: '0 auto 32px auto',
        padding: '0 10px'
      }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '30px',
          right: '30px',
          height: '4px',
          background: 'var(--clr-border)',
          zIndex: 1
        }} />

        <div style={{
          position: 'absolute',
          top: '15px',
          left: '30px',
          width: `${(activeIndex / (steps.length - 1)) * 100}%`,
          height: '4px',
          background: 'var(--clr-correct)',
          zIndex: 2,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isCompleted ? 'var(--clr-correct)' : isActive ? 'var(--clr-surface)' : 'var(--clr-surface)',
                border: isCompleted ? '2px solid var(--clr-correct)' : isActive ? '3px solid var(--clr-accent)' : '2px solid var(--clr-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                color: isCompleted ? '#fff' : isActive ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 10px rgba(232, 134, 74, 0.4)' : 'none'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span style={{
                fontSize: '0.78rem',
                marginTop: '6px',
                fontWeight: isActive ? 'bold' : '500',
                color: isActive ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                letterSpacing: '0.3px'
              }}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{`
        ${trigStyles}
      `}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Trigonometry vs Inverse Trig
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-trig' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            TRIGONOMETRY
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Study the diagram showing how a known angle is used to determine a specific side ratio.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '440px',
              height: '330px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/trigonometry.png"
                alt="Trigonometry representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Trigonometry uses an angle to find side ratios.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Inverse Trig ➔
          </button>
        </div>
      )}

      {subStep === 'vd-invtrig' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            INVERSE TRIGONOMETRY
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Study the diagram showing how a known side ratio is used to find the missing angle.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '440px',
              height: '330px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/inv-trigonometry.png"
                alt="Inverse Trigonometry representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Inverse trigonometry uses a side ratio to find an angle.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Interactive Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Trigonometry</strong> or <strong>Inverse Trig</strong>.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Missing Side
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Study the right triangle below. The angle is 30° and the hypotenuse is 10 cm.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Triangle SVG */}
            <svg width="240" height="160" viewBox="0 0 240 160" style={{ marginBottom: '16px' }}>
              {/* Triangle path */}
              <path d="M 40 130 L 200 130 L 200 30 Z" fill="none" stroke="var(--clr-text)" strokeWidth="3" />
              {/* Right angle marker */}
              <path d="M 190 130 L 190 120 L 200 120" fill="none" stroke="var(--clr-text-soft)" strokeWidth="1.5" />

              {/* Labels */}
              <text x="32" y="146" fill="var(--clr-accent)" fontSize="0.9rem" fontWeight="bold">θ = 30°</text>
              <text x="100" y="70" fill="var(--clr-text-soft)" fontSize="0.9rem" fontWeight="500">10 cm</text>
              <text x="215" y="85" fill="var(--clr-accent)" fontSize="1.2rem" fontWeight="bold">?</text>
            </svg>

            <div style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)' }}>
              Known: <strong>Angle = 30°</strong>, <strong>Hypotenuse = 10 cm</strong>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What are you trying to find in this scenario?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR1Submit('side')} className={selectedOption === 'side' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Side Length</button>
            <button onClick={() => handleR1Submit('angle')} className={selectedOption === 'angle' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Angle</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Missing Angle →</button>
            </div>
          )}
        </div>
      )}

      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '520px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Missing Angle
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Study the triangle. The opposite side is 5 and the hypotenuse is 10.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Triangle SVG */}
            <svg width="240" height="160" viewBox="0 0 240 160" style={{ marginBottom: '16px' }}>
              {/* Triangle path */}
              <path d="M 40 130 L 200 130 L 200 30 Z" fill="none" stroke="var(--clr-text)" strokeWidth="3" />
              {/* Right angle marker */}
              <path d="M 190 130 L 190 120 L 200 120" fill="none" stroke="var(--clr-text-soft)" strokeWidth="1.5" />

              {/* Labels */}
              <text x="32" y="146" fill="var(--clr-accent)" fontSize="1.2rem" fontWeight="bold">?</text>
              <text x="100" y="70" fill="var(--clr-text-soft)" fontSize="0.9rem" fontWeight="500">10</text>
              <text x="215" y="85" fill="var(--clr-accent)" fontSize="0.9rem" fontWeight="bold">5</text>
            </svg>

            <div style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)' }}>
              Known: <strong>Opposite = 5</strong>, <strong>Hypotenuse = 10</strong>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            What are you trying to find in this scenario?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR2Submit('side')} className={selectedOption === 'side' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Side Length</button>
            <button onClick={() => handleR2Submit('angle')} className={selectedOption === 'angle' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Angle</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Trigonometry Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 12px 0', color: 'var(--clr-accent)' }}>
                📐 TRIGONOMETRY
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '1rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Uses a known angle to find side ratios or side lengths.
              </p>
              <div style={{ background: 'rgba(232, 134, 74, 0.08)', padding: '12px 16px', borderRadius: '4px', borderLeft: '3px solid var(--clr-accent)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-accent)', marginBottom: '4px' }}>Common Ratios:</strong>
                <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--clr-text)' }}>sin, cos, tan</span>
              </div>
            </div>

            {/* Inverse Trigonometry Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 12px 0', color: 'var(--clr-correct)' }}>
                📐 INVERSE TRIGONOMETRY
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '1rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Uses a known side ratio to find an angle.
              </p>
              <div style={{ background: 'rgba(92, 184, 122, 0.08)', padding: '12px 16px', borderRadius: '4px', borderLeft: '3px solid var(--clr-correct)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-correct)', marginBottom: '4px' }}>Common Functions:</strong>
                <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--clr-text)' }}>sin⁻¹, cos⁻¹, tan⁻¹</span>
              </div>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '1.05rem' }}>Ask yourself: What do I already know?</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '8px' }}>Know angle, need side?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)' }}>📐 TRIGONOMETRY</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-border)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '8px' }}>Know sides, need angle?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)' }}>📐 INVERSE TRIG</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(92, 184, 122, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            border: '2px solid var(--clr-correct)',
            animation: 'pulse 2s infinite'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--clr-correct)">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px', color: 'var(--clr-text)' }}>
            Challenge Completed!
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--clr-text-soft)', maxWidth: '560px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            You have mastered the distinction between **Trigonometry** and **Inverse Trigonometry**! Your progress has been saved.
          </p>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--clr-border)',
            maxWidth: '560px',
            margin: '0 auto 32px auto'
          }}>
            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--clr-text-soft)' }}>
              Choose your next step:
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  window.location.hash = '#/worksheets';
                  onComplete();
                }}
                style={{
                  padding: '14px 20px',
                  background: 'rgba(232, 134, 74, 0.1)',
                  border: '1.5px solid var(--clr-accent)',
                  color: 'var(--clr-accent)',
                  fontSize: '1.05rem',
                  fontWeight: '600'
                }}
              >
                Practice Trigonometry Worksheets
              </button>
              <button
                onClick={() => {
                  window.location.hash = '#/worksheets';
                  onComplete();
                }}
                style={{
                  padding: '14px 20px',
                  background: 'rgba(92, 184, 122, 0.1)',
                  border: '1.5px solid var(--clr-correct)',
                  color: 'var(--clr-correct)',
                  fontSize: '1.05rem',
                  fontWeight: '600'
                }}
              >
                Practice Inverse Trigonometry Worksheets
              </button>
              <button
                onClick={onComplete}
                className="secondary"
                style={{
                  padding: '12px 20px',
                  fontSize: '1rem',
                  color: 'var(--clr-text-soft)'
                }}
              >
                Back to Challenges List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LinearSimultaneousChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-linear'); // vd-linear, vd-simultaneous, intro, r1, r2, comparison, q1, q2, practice-redirect
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Round 1 state
  const [r1X, setR1X] = useState(80); // Slider controls X coordinate

  // Round 2 state
  const [r2X, setR2X] = useState(140); // Slider controls X coordinate
  const [r2Glow, setR2Glow] = useState(false);


  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setR1X(80);
    setR2X(140);
    setR2Glow(false);
  }, [subStep]);

  // Check intersection glow in Round 2
  useEffect(() => {
    if (subStep === 'r2' && Math.abs(r2X - 80) < 5) {
      setR2Glow(true);
    } else {
      setR2Glow(false);
    }
  }, [r2X, subStep]);

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-linear' || subStep === 'vd-simultaneous') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const eqStyles = `
    @keyframes linearStep1 {
      0%, 15% { opacity: 0; transform: translateY(-10px); }
      20%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes linearStep2 {
      0%, 40% { opacity: 0; transform: translateY(-10px); }
      45%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    @keyframes linearStep3 {
      0%, 65% { opacity: 0; transform: translateY(-10px); }
      70%, 90% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    .linear-step-1 { animation: linearStep1 8s infinite ease-in-out; transform-origin: center; }
    .linear-step-2 { animation: linearStep2 8s infinite ease-in-out; transform-origin: center; }
    .linear-step-3 { animation: linearStep3 8s infinite ease-in-out; transform-origin: center; }

    @keyframes simGroupA {
      0%, 5% { opacity: 0; transform: scale(0.95); }
      10%, 45% { opacity: 1; transform: scale(1); }
      50%, 100% { opacity: 0; }
    }
    @keyframes simGroupB {
      0%, 50% { opacity: 0; transform: scale(0.95); }
      55%, 90% { opacity: 1; transform: scale(1); }
      95%, 100% { opacity: 0; }
    }
    .sim-group-a { animation: simGroupA 8s infinite ease-in-out; transform-origin: center; }
    .sim-group-b { animation: simGroupB 8s infinite ease-in-out; transform-origin: center; }
  `;

  // Save progress automatically when final practice step is completed

  const handleNextStep = () => {
    if (subStep === 'vd-linear') setSubStep('vd-simultaneous');
    else if (subStep === 'vd-simultaneous') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleR1Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'one') {
      setAnswerState('correct');
      setFeedbackText("Correct! One line represents one linear equation. Moving the point anywhere on the line shows the infinite valid coordinates that satisfy this equation.");
    } else {
      setAnswerState('wrong');
      setHintText("Look at the graph. How many independent lines are drawn on it?");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'intersection') {
      setAnswerState('correct');
      setFeedbackText("Correct! The intersection point satisfies both linear equations simultaneously. This is the single solution to the system.");
    } else {
      setAnswerState('wrong');
      setHintText("Move the slider so the point rests exactly on the intersection of the two lines.");
    }
  };



  // Line formulas
  // Line 1: y = -0.5 * x + 130
  // Line 2: y = 0.5 * x + 50
  // Intersection is at x = 80, y = 90
  const r1Y = -0.5 * r1X + 130;
  const r2Y = -0.5 * r2X + 130;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{eqStyles}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Linear vs Simultaneous Equations
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-linear' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            LINEAR EQUATION
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Examine the step-by-step simplification of a single equation to isolate the unknown variable.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/linear.png"
                alt="Linear Equation representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            A linear equation has one equation with unknown value(s).
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Simultaneous Equations ➔
          </button>
        </div>
      )}

      {subStep === 'vd-simultaneous' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-correct)', fontWeight: 'bold', letterSpacing: '1px' }}>
            SIMULTANEOUS EQUATIONS
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Examine the bracket grouping two equations that are solved together to find a shared solution.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/simultaneous.png"
                alt="Simultaneous Equations representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Simultaneous equations solve two or more equations together.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Linear</strong> or <strong>Simultaneous</strong> Equations.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: One Line */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: One Line
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Drag the slider to move the point along the line. Watch its coordinate values change.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Grid SVG */}
            <svg width="240" height="180" viewBox="0 0 240 180" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1.5px solid var(--clr-border)', marginBottom: '16px' }}>
              {/* Grid lines */}
              <line x1="0" y1="45" x2="240" y2="45" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="90" x2="240" y2="90" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="135" x2="240" y2="135" stroke="rgba(255,255,255,0.05)" />
              <line x1="60" y1="0" x2="60" y2="180" stroke="rgba(255,255,255,0.05)" />
              <line x1="120" y1="0" x2="120" y2="180" stroke="rgba(255,255,255,0.05)" />
              <line x1="180" y1="0" x2="180" y2="180" stroke="rgba(255,255,255,0.05)" />

              {/* Line 1 */}
              <line x1="20" y1="120" x2="220" y2="20" stroke="var(--clr-accent)" strokeWidth="3" />

              {/* Draggable point */}
              <circle cx={r1X} cy={r1Y} r="8" fill="var(--clr-accent)" style={{ transition: 'cx 0.1s, cy 0.1s' }} />
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '240px', marginBottom: '16px' }}>
              <input
                type="range"
                min="20"
                max="220"
                value={r1X}
                onChange={(e) => setR1X(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
                disabled={answerState === 'correct'}
              />
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                Point Coordinate: ({r1X.toFixed(0)}, {(180 - r1Y).toFixed(0)})
              </div>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
            How many linear equations are represented by this single straight line?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => handleR1Submit('one')} className={selectedOption === 'one' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>One Equation</button>
            <button onClick={() => handleR1Submit('two')} className={selectedOption === 'two' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Two Equations</button>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Two Lines →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Two Lines */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Intersection Solution
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Drag the point using the slider to locate the exact intersection where both lines meet.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Grid SVG */}
            <svg width="240" height="180" viewBox="0 0 240 180" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1.5px solid var(--clr-border)', marginBottom: '16px' }}>
              {/* Grid lines */}
              <line x1="0" y1="45" x2="240" y2="45" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="90" x2="240" y2="90" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="135" x2="240" y2="135" stroke="rgba(255,255,255,0.05)" />
              <line x1="60" y1="0" x2="60" y2="180" stroke="rgba(255,255,255,0.05)" />
              <line x1="120" y1="0" x2="120" y2="180" stroke="rgba(255,255,255,0.05)" />
              <line x1="180" y1="0" x2="180" y2="180" stroke="rgba(255,255,255,0.05)" />

              {/* Line 1 */}
              <line x1="20" y1="120" x2="220" y2="20" stroke="var(--clr-accent)" strokeWidth="3" />

              {/* Line 2 */}
              <line x1="20" y1="60" x2="220" y2="160" stroke="var(--clr-text-soft)" strokeWidth="3" />

              {/* Intersection glow */}
              {r2Glow && (
                <circle cx="80" cy="90" r="16" fill="rgba(92, 184, 122, 0.3)" style={{ transformOrigin: '80px 90px', animation: 'pulse 1.2s infinite' }} />
              )}

              {/* Draggable point */}
              <circle cx={r2X} cy={r2Y} r="8" fill={r2Glow ? 'var(--clr-correct)' : 'var(--clr-accent)'} style={{ transition: 'cx 0.1s, cy 0.1s' }} />
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '240px', marginBottom: '16px' }}>
              <input
                type="range"
                min="20"
                max="220"
                value={r2X}
                onChange={(e) => setR2X(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
                disabled={answerState === 'correct'}
              />
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                {r2Glow ? (
                  <strong style={{ color: 'var(--clr-correct)' }}>✅ Intersection Located: (80, 90)!</strong>
                ) : (
                  <span>Searching for intersection... ({r2X.toFixed(0)}, {(180 - r2Y).toFixed(0)})</span>
                )}
              </div>
            </div>
          </div>

          {r2Glow && answerState === 'unanswered' && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                Which coordinates satisfy BOTH equations represented by the two lines?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => handleR2Submit('any')} className="secondary" style={{ padding: '12px 20px' }}>Any point on either line</button>
                <button onClick={() => handleR2Submit('intersection')} className="primary" style={{ padding: '12px 20px' }}>Only the intersection point</button>
              </div>
            </div>
          )}

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Linear Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                LINEAR EQUATION
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> An equation with variables of degree 1.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Example:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid var(--clr-accent)', fontWeight: '600', fontFamily: 'monospace' }}>
                  5x − 7 = 18
                </span>
              </p>
            </div>

            {/* Simultaneous Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                SIMULTANEOUS EQUATIONS
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Two or more equations solved together to find common values.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Example:</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid var(--clr-correct)', fontWeight: '600', fontFamily: 'monospace' }}>
                  2a + b = 9
                  <br />
                  a − b = 0
                </span>
              </p>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>Before calculating, ask yourself:</p>

            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>One individual equation?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)', display: 'block', marginTop: '8px' }}>= Linear Equation</strong>
              </div>

              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>More than one equation together?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', display: 'block', marginTop: '8px' }}>= Simultaneous</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Linear Equation vs Simultaneous Equations challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['linear-simultaneous'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

function InteriorExteriorChallenge({ onBack, onComplete, onMarkComplete }) {
  const [subStep, setSubStep] = useState('vd-interior'); // vd-interior, vd-exterior, intro, r1, r2, comparison, q1, q2, practice-redirect
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState('unanswered'); // unanswered, correct, wrong
  const [feedbackText, setFeedbackText] = useState('');
  const [hintText, setHintText] = useState('');

  // Helper to determine step index (0-3)
  const getActiveStepIndex = () => {
    if (subStep === 'vd-interior' || subStep === 'vd-exterior') return 0;
    if (subStep === 'intro' || subStep === 'r1' || subStep === 'r2') return 1;
    if (subStep === 'comparison') return 2;
    return 4; // Finished / redirect
  };

  const activeIndex = getActiveStepIndex();
  const steps = ['Learn', 'Challenge', 'Recap'];

  const renderProgressBar = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        maxWidth: '480px',
        margin: '0 auto 30px auto',
        padding: '0 10px'
      }}>
        {/* Background Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          right: '20px',
          height: '4px',
          background: 'var(--clr-border)',
          borderRadius: '2px',
          zIndex: 1
        }} />

        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: activeIndex === 4 ? 'calc(100% - 40px)' : `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 40}px)`,
          height: '4px',
          background: 'var(--clr-correct)',
          borderRadius: '2px',
          zIndex: 1,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((label, idx) => {
          const isCompleted = activeIndex > idx;
          const isActive = activeIndex === idx;

          let circleBg = 'var(--clr-card)';
          let circleBorder = '2px solid var(--clr-border)';
          let textColor = 'var(--clr-text-soft)';
          let fontWeight = 'normal';

          if (isCompleted) {
            circleBg = 'var(--clr-correct)';
            circleBorder = '2px solid var(--clr-correct)';
            textColor = 'var(--clr-correct)';
          } else if (isActive) {
            circleBg = 'var(--clr-surface)';
            circleBorder = '3px solid var(--clr-accent)';
            textColor = 'var(--clr-text)';
            fontWeight = 'bold';
          }

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              flex: 1
            }}>
              {/* Node Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#fff' : textColor,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 8px rgba(232, 134, 74, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Node Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: textColor,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const angleStyles = `
    @keyframes angleLineExtend {
      0%, 20% { stroke-dashoffset: 60; }
      40%, 92% { stroke-dashoffset: 0; }
      95%, 100% { stroke-dashoffset: 60; }
    }
    .angle-extend-line {
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
      animation: angleLineExtend 8s infinite ease-in-out;
    }

    @keyframes angleWedgeFillInterior {
      0%, 25% { fill: rgba(232, 134, 74, 0); stroke: transparent; }
      45%, 92% { fill: rgba(232, 134, 74, 0.25); stroke: var(--clr-accent); }
      95%, 100% { fill: rgba(232, 134, 74, 0); stroke: transparent; }
    }
    .angle-interior-wedge {
      animation: angleWedgeFillInterior 8s infinite ease-in-out;
      fill: rgba(232, 134, 74, 0);
      stroke: transparent;
      stroke-width: 1.5;
    }

    @keyframes angleWedgeFillExterior {
      0%, 45% { fill: rgba(92, 184, 122, 0); stroke: transparent; }
      65%, 92% { fill: rgba(92, 184, 122, 0.25); stroke: var(--clr-correct); }
      95%, 100% { fill: rgba(92, 184, 122, 0); stroke: transparent; }
    }
    .angle-exterior-wedge {
      animation: angleWedgeFillExterior 8s infinite ease-in-out;
      fill: rgba(92, 184, 122, 0);
      stroke: transparent;
      stroke-width: 1.5;
    }

    @keyframes angleVertexGlowInterior {
      0%, 15% { transform: scale(1); filter: none; fill: var(--clr-border); }
      30%, 92% { transform: scale(1.3); filter: drop-shadow(0 0 4px rgba(232,134,74,0.6)); fill: var(--clr-accent); }
      95%, 100% { transform: scale(1); filter: none; fill: var(--clr-border); }
    }
    .angle-vertex-interior {
      transform-origin: 200px 210px;
      animation: angleVertexGlowInterior 8s infinite ease-in-out;
    }

    @keyframes angleVertexGlowExterior {
      0%, 35% { transform: scale(1); filter: none; fill: var(--clr-border); }
      50%, 92% { transform: scale(1.3); filter: drop-shadow(0 0 4px rgba(92,184,122,0.6)); fill: var(--clr-correct); }
      95%, 100% { transform: scale(1); filter: none; fill: var(--clr-border); }
    }
    .angle-vertex-exterior {
      transform-origin: 200px 210px;
      animation: angleVertexGlowExterior 8s infinite ease-in-out;
    }

    @keyframes angleInteriorSummaryFade {
      0%, 40% { opacity: 0; transform: translateY(5px); }
      45%, 92% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    .angle-interior-summary-overlay {
      animation: angleInteriorSummaryFade 8s infinite ease-in-out;
      opacity: 0;
    }

    @keyframes angleExteriorSummaryFade {
      0%, 60% { opacity: 0; transform: translateY(5px); }
      65%, 92% { opacity: 1; transform: translateY(0); }
      95%, 100% { opacity: 0; }
    }
    .angle-exterior-summary-overlay {
      animation: angleExteriorSummaryFade 8s infinite ease-in-out;
      opacity: 0;
    }
  `;

  // Round 1 state
  const [r1Filled, setR1Filled] = useState(false);

  // Round 2 state
  const [extensionLength, setExtensionLength] = useState(0); // 0 to 60



  // Reset states on subStep changes
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState('unanswered');
    setFeedbackText('');
    setHintText('');
    setR1Filled(false);
    setExtensionLength(0);
  }, [subStep]);


  // Save progress automatically when final practice step is completed

  const handleNextStep = () => {
    if (subStep === 'vd-interior') setSubStep('vd-exterior');
    else if (subStep === 'vd-exterior') setSubStep('intro');
    else if (subStep === 'intro') setSubStep('r1');
    else if (subStep === 'r1') setSubStep('r2');
    else if (subStep === 'r2') setSubStep('comparison');
    else if (subStep === 'comparison') { onMarkComplete?.(); setSubStep('practice-redirect'); }
  };

  const handleTapAngle = (type) => {
    if (type === 'interior') {
      setR1Filled(true);
      setAnswerState('correct');
      setFeedbackText("Great! Interior angles are always inside the polygon.");
    } else {
      setAnswerState('wrong');
      setHintText("That is the angle on the outside of the shape. Tap the angle located within the polygon boundaries.");
    }
  };

  const handleR2Submit = (opt) => {
    setSelectedOption(opt);
    if (opt === 'exterior') {
      setAnswerState('correct');
      setFeedbackText("Excellent! Exterior angles are formed by extending a side of the polygon.");
    } else {
      setAnswerState('wrong');
      setHintText("This angle is located outside the shape and was formed by extending the side line.");
    }
  };


  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '10px 10px 30px 10px', minHeight: '660px' }}>
      <style>{angleStyles}</style>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '0 5px'
      }}>
        <button className="back-button" onClick={onBack} style={{ margin: 0 }}>← Back</button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: '600',
          color: 'var(--clr-text-soft)',
          letterSpacing: '0.5px'
        }}>
          Interior vs Exterior Angles
        </span>
        <div style={{ width: '70px' }} />
      </div>

      {renderProgressBar()}

      {subStep === 'vd-interior' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            INTERIOR ANGLES
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Look at the inner corners of the shape to locate the angles formed inside.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/interior.png"
                alt="Interior angle representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Interior angles are formed inside a polygon.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Discover Exterior Angles ➔
          </button>
        </div>
      )}

      {subStep === 'vd-exterior' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px', fontWeight: 'bold' }}>
            Discover
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--clr-accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
            EXTERIOR ANGLES
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 0 25px 0', fontStyle: 'italic' }}>
            Observe how extending a straight side outward forms a new angle with the adjacent outer edge.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '320px',
              height: '320px',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-btn)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src="/contrast/exterior.png"
                alt="Exterior angle representation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--clr-text)', margin: '0 0 35px 0', padding: '0 20px', lineHeight: '1.4' }}>
            Exterior angles are formed outside a polygon when a side is extended.
          </p>

          <button onClick={handleNextStep} style={{ padding: '12px 30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Start Challenge ➔
          </button>
        </div>
      )}

      {/* Intro SubStep */}
      {subStep === 'intro' && (
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          padding: '40px 20px',
          background: 'var(--clr-surface)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '520px',
          margin: '20px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--clr-accent)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(232, 134, 74, 0.2)'
          }}>
            <img 
              src="/contrast/mission.svg" 
              alt="Mission" 
              style={{ 
                width: '32px', 
                height: '32px', 
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--clr-accent)',
            margin: '0 0 16px 0'
          }}>
            Your Mission
          </h2>
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.6', 
            color: 'var(--clr-text)', 
            marginBottom: '24px', 
            maxWidth: '440px' 
          }}>
            You'll face situations where you must decide whether to use <strong>Interior</strong> or <strong>Exterior</strong> Angles.
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--clr-text-soft)', 
            marginBottom: '32px',
            fontWeight: '600',
            fontStyle: 'italic'
          }}>
            Think carefully before choosing!
          </p>
          <button 
            onClick={handleNextStep} 
            style={{ 
              padding: '12px 40px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '30px',
              background: 'var(--clr-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Round 1: Find the Interior */}
      {subStep === 'r1' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 1: Find the Interior Angle
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              A vertex of the pentagon is highlighted. Tap the angle that is situated inside the shape boundary.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Pentagon SVG */}
            <svg width="300" height="200" viewBox="0 0 300 200" style={{ marginBottom: '16px' }}>
              {/* Pentagon shape */}
              <polygon points="120,40 177,81.5 155,148.5 85,148.5 63,81.5" fill={r1Filled ? 'rgba(92,184,122,0.15)' : 'none'} stroke="var(--clr-text)" strokeWidth="3" />

              {/* Extended line for exterior angle */}
              <line x1="63" y1="81.5" x2="120" y2="40" stroke="var(--clr-text-soft)" strokeDasharray="4 4" strokeWidth="2" />
              <line x1="120" y1="40" x2="177" y2="-1.5" stroke="var(--clr-text-soft)" strokeDasharray="4 4" strokeWidth="2" />

              {/* Glowing vertex */}
              <circle cx="120" cy="40" r="6" fill="var(--clr-accent)" />

              {/* Clickable angle regions */}
              {/* Interior arc */}
              <path
                d="M 105 50 A 25 25 0 0 0 135 50 Z"
                fill={r1Filled ? 'var(--clr-correct)' : 'rgba(255,255,255,0.08)'}
                stroke="var(--clr-text-soft)"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTapAngle('interior')}
              />
              <text x="120" y="70" fill="var(--clr-text)" fontSize="0.75rem" textAnchor="middle" style={{ pointerEvents: 'none' }}>Inside</text>

              {/* Exterior arc */}
              <path
                d="M 135 50 A 25 25 0 0 0 135 25 Z"
                fill="rgba(255,255,255,0.08)"
                stroke="var(--clr-text-soft)"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTapAngle('exterior')}
              />
              <text x="145" y="32" fill="var(--clr-text-soft)" fontSize="0.75rem" style={{ pointerEvents: 'none' }}>Outside</text>
            </svg>
          </div>

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Extend Side →</button>
            </div>
          )}
        </div>
      )}

      {/* Round 2: Extend the Side */}
      {subStep === 'r2' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '500px', padding: '30px 0 10px 0' }}>
          <div style={{
            background: 'var(--clr-surface)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '5px solid var(--clr-accent)',
            textAlign: 'left',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
              Round 2: Extend the Side
            </strong>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.5' }}>
              Use the slider to extend the bottom edge of the pentagon to the right. Observe what angle forms outside.
            </p>
          </div>

          <div style={{ background: 'var(--clr-surface)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Pentagon SVG */}
            <svg width="300" height="200" viewBox="0 0 300 200" style={{ marginBottom: '16px' }}>
              {/* Pentagon shape */}
              <polygon points="120,40 177,81.5 155,148.5 85,148.5 63,81.5" fill="none" stroke="var(--clr-text)" strokeWidth="3" />

              {/* Extended base line */}
              {extensionLength > 0 && (
                <line x1="155" y1="148.5" x2={155 + extensionLength} y2="148.5" stroke="var(--clr-correct)" strokeWidth="3" strokeDasharray="4 3" />
              )}

              {/* Exterior Angle Arc */}
              {extensionLength >= 40 && (
                <>
                  <path d="M 175 148.5 A 20 20 0 0 0 162 127" fill="none" stroke="var(--clr-correct)" strokeWidth="2.5" />
                  <text x="180" y="122" fill="var(--clr-correct)" fontSize="0.8rem" fontWeight="bold">Created Angle</text>
                </>
              )}
            </svg>

            {/* Slider */}
            <div style={{ width: '100%', maxWidth: '240px', marginBottom: '16px' }}>
              <input
                type="range"
                min="0"
                max="60"
                value={extensionLength}
                onChange={(e) => setExtensionLength(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
                disabled={answerState === 'correct'}
              />
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                {extensionLength >= 40 ? "Side fully extended!" : "Drag slider to extend the side line"}
              </div>
            </div>
          </div>

          {extensionLength >= 40 && (
            <>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                Which angle is created outside the shape by extending the side?
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                <button onClick={() => handleR2Submit('interior')} className={selectedOption === 'interior' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Interior Angle</button>
                <button onClick={() => handleR2Submit('exterior')} className={selectedOption === 'exterior' ? 'primary' : 'secondary'} style={{ padding: '12px 20px' }}>Exterior Angle</button>
              </div>
            </>
          )}

          {answerState === 'wrong' && (
            <div style={{ padding: '16px 20px', background: 'rgba(235, 94, 85, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-wrong)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{hintText}</p>
            </div>
          )}

          {answerState === 'correct' && (
            <div style={{ padding: '16px 20px', background: 'rgba(92, 184, 122, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--clr-correct)', textAlign: 'left', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              <button onClick={handleNextStep} style={{ marginTop: '12px', padding: '8px 20px' }}>Next: Comparison →</button>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Comparison Cards */}
      {subStep === 'comparison' && (
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {/* Interior Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-accent)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-accent)', fontWeight: 'bold' }}>
                INTERIOR ANGLES
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Angles formed inside a polygon.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Key Formula(s):</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid var(--clr-accent)' }}>
                  Sum of interior angles = (n − 2) × 180°
                  <br />
                  Regular polygon: Interior angle = (n−2)×180°/n
                </span>
              </p>
            </div>

            {/* Exterior Card */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              borderTop: '6px solid var(--clr-correct)',
              flex: '1 1 340px',
              maxWidth: '380px',
              boxShadow: 'var(--shadow-btn)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 16px 0', color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                EXTERIOR ANGLES
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.98rem', lineHeight: '1.5' }}>
                <strong>Means:</strong> Angles formed outside a polygon when a side is extended.
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.6' }}>
                <strong>Key Formula(s):</strong>
                <span style={{ display: 'block', marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid var(--clr-correct)' }}>
                  Sum of exterior angles = 360°
                  <br />
                  Regular polygon: Exterior angle = 360°/n
                </span>
              </p>
            </div>
          </div>

          {/* Decision Rule */}
          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '6px solid var(--clr-accent)',
            boxShadow: 'var(--shadow-btn)',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              Decision Rule
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: '500' }}>
              Before identifying the angle, ask:
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Inside the polygon?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-accent)', display: 'block', marginTop: '8px' }}>Interior Angle</strong>
              </div>
              <div style={{ background: 'var(--clr-card)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', minWidth: '220px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Outside after extending a side?</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--clr-correct)', display: 'block', marginTop: '8px' }}>Exterior Angle</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={handleNextStep} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Layer 3: Practice Q1 */}
      {subStep === 'practice-redirect' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-correct)', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              Challenge Completed!
            </h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.05rem', margin: '0', textAlign: 'center' }}>
              You have successfully completed the Interior vs Exterior Angles challenge.
            </p>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--clr-border)',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <p style={{ margin: '0 0 16px 0', color: 'var(--clr-text)', fontSize: '1.05rem', fontWeight: '600' }}>
              Want to practice more on these standard quizzes?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {CONTRAST_MAPPING['interior-exterior'].map(mKey => (
                <button
                  key={mKey}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tenali-change-mode', { detail: mKey }));
                  }}
                  className="secondary"
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Practice {MODULE_NAMES[mKey] || mKey} ➔
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="secondary" onClick={() => setSubStep('intro')} style={{ padding: '12px 24px', fontSize: '1.05rem' }}>Try Again</button>
            <button onClick={onComplete} style={{ padding: '12px 24px', fontSize: '1.05rem', background: 'var(--clr-correct)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Finish Challenge ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

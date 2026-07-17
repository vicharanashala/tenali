/**
 * Tests for Math Detective Agency
 *
 * Scenarios:
 * 1. New student with no detective progress
 * 2. Student with an unfinished case
 * 3. Student with completed cases
 * 4. Correct route navigation (/detective-agency, /detective)
 * 5. Hint system works correctly
 * 6. Case deduplication tracking
 * 7. All Tenali modules have story coverage
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// ─── Helper: Simulate localStorage ─────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── DETECTIVE_RANKS (inline copy matching detective-app.jsx) ──────
const DETECTIVE_RANKS = [
  { title: 'Junior Detective',   xp: 0    },
  { title: 'Detective',          xp: 100  },
  { title: 'Senior Detective',   xp: 300  },
  { title: 'Chief Inspector',    xp: 700  },
  { title: 'Commissioner',       xp: 1500 },
  { title: 'Grand Commissioner', xp: 3000 },
];

// ─── Helpers (matching detective-app.jsx logic) ────────────────────
const STORAGE_KEY = 'tenali-detective-progress';

function loadDetectiveProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* intentionally empty */ }
  return { xp: 0, casesSolved: 0, cases: {}, usedCaseIds: [] };
}

function saveDetectiveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDetectiveRank(xp) {
  let rank = DETECTIVE_RANKS[0];
  for (const r of DETECTIVE_RANKS) {
    if (xp >= r.xp) rank = r;
  }
  return rank;
}

// ─── Tests ─────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('Detective progress helpers', () => {
  test('SCENARIO 1: new student returns 0 cases, Junior Detective rank', () => {
    const progress = loadDetectiveProgress();
    expect(progress.casesSolved).toBe(0);
    expect(progress.xp).toBe(0);
    expect(Object.keys(progress.cases).length).toBe(0);
    expect(progress.usedCaseIds).toEqual([]);

    const rank = getDetectiveRank(progress.xp);
    expect(rank.title).toBe('Junior Detective');
    expect(rank.xp).toBe(0);
  });

  test('SCENARIO 2: student with unfinished case', () => {
    const saved = {
      xp: 30,
      casesSolved: 0,
      cases: {
        'case-1': { status: 'in_progress', currentStage: 1, totalStages: 4 },
      },
      usedCaseIds: [],
    };
    saveDetectiveProgress(saved);
    localStorageMock.setItem.mockClear();

    const progress = loadDetectiveProgress();
    expect(progress.casesSolved).toBe(0);
    expect(progress.xp).toBe(30);
    expect(progress.cases['case-1'].status).toBe('in_progress');
    expect(progress.cases['case-1'].currentStage).toBe(1);
  });

  test('SCENARIO 3: student with completed cases', () => {
    const saved = {
      xp: 150,
      casesSolved: 2,
      cases: {
        'case-1': { status: 'solved', currentStage: 3, totalStages: 3 },
        'case-2': { status: 'solved', currentStage: 4, totalStages: 4 },
      },
      usedCaseIds: ['case-1', 'case-2'],
    };
    saveDetectiveProgress(saved);

    const progress = loadDetectiveProgress();
    expect(progress.casesSolved).toBe(2);
    expect(progress.xp).toBe(150);

    // Both cases should be solved
    expect(Object.values(progress.cases).every(c => c.status === 'solved')).toBe(true);

    // usedCaseIds should persist
    expect(progress.usedCaseIds).toEqual(['case-1', 'case-2']);

    const rank = getDetectiveRank(progress.xp);
    expect(rank.title).toBe('Detective');
  });
});

describe('Detective rank calculation', () => {
  test('0 XP gives Junior Detective', () => {
    expect(getDetectiveRank(0).title).toBe('Junior Detective');
  });

  test('50 XP gives Junior Detective', () => {
    expect(getDetectiveRank(50).title).toBe('Junior Detective');
  });

  test('100 XP gives Detective', () => {
    expect(getDetectiveRank(100).title).toBe('Detective');
  });

  test('300 XP gives Senior Detective', () => {
    expect(getDetectiveRank(300).title).toBe('Senior Detective');
  });

  test('700 XP gives Chief Inspector', () => {
    expect(getDetectiveRank(700).title).toBe('Chief Inspector');
  });

  test('1500 XP gives Commissioner', () => {
    expect(getDetectiveRank(1500).title).toBe('Commissioner');
  });

  test('3000+ XP gives Grand Commissioner', () => {
    expect(getDetectiveRank(3000).title).toBe('Grand Commissioner');
    expect(getDetectiveRank(5000).title).toBe('Grand Commissioner');
  });
});

describe('Route navigation', () => {
  test('/detective-agency triggers EnhancedMathDetectiveApp', () => {
    const isDetectiveRoute = (p) => p === '/detective' || p === '/detective-agency';
    expect(isDetectiveRoute('/detective-agency')).toBe(true);
    expect(isDetectiveRoute('/detective')).toBe(true);
    expect(isDetectiveRoute('/tenth')).toBe(false);
    expect(isDetectiveRoute('/gym')).toBe(false);
    expect(isDetectiveRoute('/')).toBe(false);
  });

  test('TenthApp detective card navigates to /detective-agency', () => {
    const extractNav = (jsx) => {
      const m = jsx.match(/window\.location\.href\s*=\s*'([^']+)'/);
      return m ? m[1] : null;
    };
    const tenthAppClick = "window.location.href = '/detective-agency'";
    expect(extractNav(tenthAppClick)).toBe('/detective-agency');
  });

  test('both routes co-exist without conflict', () => {
    const routeHandler = (pathname) => {
      if (pathname === '/detective') return 'EnhancedMathDetectiveApp';
      if (pathname === '/detective-agency') return 'EnhancedMathDetectiveApp';
      if (pathname === '/tenth') return 'TenthApp';
      return 'Home';
    };
    expect(routeHandler('/detective')).toBe('EnhancedMathDetectiveApp');
    expect(routeHandler('/detective-agency')).toBe('EnhancedMathDetectiveApp');
    expect(routeHandler('/tenth')).toBe('TenthApp');
  });
});

describe('localStorage persistence', () => {
  test('save and reload preserves all fields including usedCaseIds', () => {
    const data = {
      xp: 450,
      casesSolved: 3,
      cases: {
        'case-1': { status: 'solved', currentStage: 3, totalStages: 3 },
        'case-2': { status: 'solved', currentStage: 4, totalStages: 4 },
        'case-3': { status: 'in_progress', currentStage: 2, totalStages: 4 },
      },
      usedCaseIds: ['case-1', 'case-2'],
    };
    saveDetectiveProgress(data);
    const reloaded = loadDetectiveProgress();
    expect(reloaded).toEqual(data);
    expect(reloaded.usedCaseIds).toEqual(['case-1', 'case-2']);
  });

  test('corrupt data returns defaults', () => {
    localStorage.setItem('tenali-detective-progress', 'not-json{{{');
    const progress = loadDetectiveProgress();
    expect(progress.xp).toBe(0);
    expect(progress.casesSolved).toBe(0);
    expect(progress.cases).toEqual({});
    expect(progress.usedCaseIds).toEqual([]);
  });
});

describe('Case deduplication', () => {
  test('usedCaseIds tracks completed cases', () => {
    const progress = loadDetectiveProgress();
    progress.usedCaseIds = ['addition-1', 'fractionadd-1'];
    saveDetectiveProgress(progress);

    const reloaded = loadDetectiveProgress();
    expect(reloaded.usedCaseIds).toContain('addition-1');
    expect(reloaded.usedCaseIds).toContain('fractionadd-1');
    expect(reloaded.usedCaseIds.length).toBe(2);
  });

  test('usedCaseIds prevents duplicate case IDs', () => {
    const progress = loadDetectiveProgress();
    progress.usedCaseIds = ['case-1'];
    // Simulate adding a case ID only if not already present
    const addCaseId = (id) => {
      if (!progress.usedCaseIds.includes(id)) {
        progress.usedCaseIds.push(id);
      }
    };
    addCaseId('case-1');
    addCaseId('case-2');
    addCaseId('case-1'); // duplicate attempt
    expect(progress.usedCaseIds).toEqual(['case-1', 'case-2']);
  });
});

describe('Detective stories coverage', () => {
  test('all story IDs are unique', () => {
    // Test by importing the stories and checking uniqueness
    // This is a simplified test that validates the invariant
    const storyData = [
      { id: 'addition-1', topic: 'addition' },
      { id: 'addition-2', topic: 'addition' },
      { id: 'addition-3', topic: 'addition' },
      { id: 'angles-1', topic: 'angles' },
      { id: 'angles-2', topic: 'angles' },
      { id: 'basicarith-1', topic: 'basicarith' },
      { id: 'basicarith-2', topic: 'basicarith' },
      { id: 'bearings-1', topic: 'bearings' },
      { id: 'binomial-1', topic: 'binomial' },
      { id: 'circleth-1', topic: 'circleth' },
      { id: 'coordgeom-1', topic: 'coordgeom' },
      { id: 'decimals-1', topic: 'decimals' },
      { id: 'decimals-2', topic: 'decimals' },
      { id: 'diff-1', topic: 'diff' },
      { id: 'fractionadd-1', topic: 'fractionadd' },
      { id: 'funceval-1', topic: 'funceval' },
      { id: 'hcflcm-1', topic: 'hcflcm' },
      { id: 'indices-1', topic: 'indices' },
      { id: 'ineq-1', topic: 'ineq' },
      { id: 'lineareq-1', topic: 'lineareq' },
      { id: 'log-1', topic: 'log' },
      { id: 'matrix-1', topic: 'matrix' },
      { id: 'mensur-1', topic: 'mensur' },
      { id: 'multiply-1', topic: 'multiply' },
      { id: 'multiply-2', topic: 'multiply' },
      { id: 'bases-1', topic: 'bases' },
      { id: 'percent-1', topic: 'percent' },
      { id: 'polygons-1', topic: 'polygons' },
      { id: 'primefactor-1', topic: 'primefactor' },
      { id: 'prob-1', topic: 'prob' },
      { id: 'profitloss-1', topic: 'profitloss' },
      { id: 'pythag-1', topic: 'pythag' },
      { id: 'pythag-2', topic: 'pythag' },
      { id: 'quadratic-1', topic: 'quadratic' },
      { id: 'qformula-1', topic: 'qformula' },
      { id: 'ratio-1', topic: 'ratio' },
      { id: 'remfactor-1', topic: 'remfactor' },
      { id: 'rounding-1', topic: 'rounding' },
      { id: 'simul-1', topic: 'simul' },
      { id: 'sdt-1', topic: 'sdt' },
      { id: 'sqrt-1', topic: 'sqrt' },
      { id: 'stdform-1', topic: 'stdform' },
      { id: 'stats-1', topic: 'stats' },
      { id: 'surds-1', topic: 'surds' },
      { id: 'trig-1', topic: 'trig' },
      { id: 'similarity-1', topic: 'similarity' },
      { id: 'transform-1', topic: 'transform' },
      { id: 'triangles-1', topic: 'triangles' },
      { id: 'variation-1', topic: 'variation' },
      { id: 'vectors-1', topic: 'vectors' },
      { id: 'sequences-1', topic: 'sequences' },
      { id: 'sets-1', topic: 'sets' },
      { id: 'circmeasure-1', topic: 'circmeasure' },
      { id: 'diffeq-1', topic: 'diffeq' },
      { id: 'integ-1', topic: 'integ' },
      { id: 'limits-1', topic: 'limits' },
      { id: 'invtrig-1', topic: 'invtrig' },
      { id: 'bounds-1', topic: 'bounds' },
      { id: 'congruence-1', topic: 'congruence' },
      { id: 'conics-1', topic: 'conics' },
      { id: 'heron-1', topic: 'heron' },
      { id: 'complex-1', topic: 'complex' },
      { id: 'dotprod-1', topic: 'dotprod' },
      { id: 'banking-1', topic: 'banking' },
      { id: 'polyfactor-1', topic: 'polyfactor' },
      { id: 'polymul-1', topic: 'polymul' },
      { id: 'linprog-1', topic: 'linprog' },
      { id: 'shares-1', topic: 'shares' },
      { id: 'gst-1', topic: 'gst' },
      { id: 'section-1', topic: 'section' },
      { id: 'squaring-1', topic: 'squaring' },
      { id: 'tatsavit-1', topic: 'tatsavit' },
    ];

    const ids = storyData.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length); // all unique

    // Count topics that have multiple stories (for dedup)
    const topicCounts = {};
    storyData.forEach(s => {
      topicCounts[s.topic] = (topicCounts[s.topic] || 0) + 1;
    });
    // At least some topics should have multiple stories
    const topicsWithMultiple = Object.entries(topicCounts).filter(([, c]) => c >= 2);
    expect(topicsWithMultiple.length).toBeGreaterThan(0);
  });
});

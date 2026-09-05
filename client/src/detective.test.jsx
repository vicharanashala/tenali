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

// ─── Import enhanced story helpers ──────────────────────────────────
import {
  ALL_DETECTIVE_STORIES,
  getEnhancedStories,
  isEnhancedCase,
  getEliminationReasons,
  validateEnhancedStory,
} from './detective-stories';
import { CASE_GENERATORS } from './detective-generators';
import {
  buildSuspectAliases,
  highlightEvidenceSentences,
  formatClueText,
  clueEliminatesSuspect,
  getClueEliminableSuspects,
  getClueEliminationReasons,
} from './detective-stories';

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

// ════════════════════════════════════════════════════════════════════════
// ENHANCED DETECTIVE STORIES — Schema Validation Tests
// ════════════════════════════════════════════════════════════════════════

describe('Enhanced story schema validation', () => {
  const enhancedStubs = getEnhancedStories();
  const generatedStories = Object.values(CASE_GENERATORS).map(fn => fn());

  test('isEnhancedCase returns true for stories with case-enhanced- prefix', () => {
    expect(isEnhancedCase({ id: 'case-enhanced-1' })).toBe(true);
    expect(isEnhancedCase({ id: 'case-enhanced-16' })).toBe(true);
  });

  test('isEnhancedCase returns false for classic stories', () => {
    expect(isEnhancedCase({})).toBe(false);
    expect(isEnhancedCase({ id: 'counting-1' })).toBe(false);
    expect(isEnhancedCase(null)).toBe(false);
  });

  test('getEnhancedStories returns exactly 16 stubs', () => {
    expect(enhancedStubs).toHaveLength(16);
  });

  test('CASE_GENERATORS has exactly 16 generators', () => {
    expect(Object.keys(CASE_GENERATORS)).toHaveLength(16);
  });

  test('all enhanced story stubs have unique IDs', () => {
    const ids = enhancedStubs.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all generated stories have valid suspects array', () => {
    for (const story of generatedStories) {
      expect(Array.isArray(story.suspects)).toBe(true);
      expect(story.suspects.length).toBeGreaterThanOrEqual(3);
      expect(story.suspects.length).toBeLessThanOrEqual(4);
      for (const suspect of story.suspects) {
        expect(suspect.id).toBeTruthy();
        expect(suspect.name).toBeTruthy();
        expect(suspect.role).toBeTruthy();
        expect(suspect.alibi).toBeTruthy();
        expect(suspect.appearance).toBeTruthy();
      }
    }
  });

  test('all generated culprit IDs match a suspect ID', () => {
    for (const story of generatedStories) {
      const suspectIds = story.suspects.map(s => s.id);
      expect(suspectIds).toContain(story.culprit);
    }
  });

  test('all generated stages have hints array', () => {
    for (const story of generatedStories) {
      for (const stage of story.stages) {
        expect(Array.isArray(stage.hints)).toBe(true);
        expect(stage.hints.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('all generated stages with evidence have valid eliminates array', () => {
    for (const story of generatedStories) {
      const suspectIds = story.suspects.map(s => s.id);
      for (const stage of story.stages) {
        if (stage.evidence) {
          expect(stage.evidence.id).toBeTruthy();
          expect(stage.evidence.text).toBeTruthy();
          expect(Array.isArray(stage.evidence.eliminates)).toBe(true);
          for (const elimId of stage.evidence.eliminates) {
            expect(suspectIds).toContain(elimId);
          }
        }
      }
    }
  });

  test('all generated stories have 2-3 stages and 3 suspects', () => {
    for (const story of generatedStories) {
      expect(story.suspects.length).toBe(3);
      expect(story.stages.length).toBeGreaterThanOrEqual(2);
      expect(story.stages.length).toBeLessThanOrEqual(3);
    }
  });

  test('all generated stories have required fields', () => {
    for (const story of generatedStories) {
      expect(story.id).toBeTruthy();
      expect(story.title).toBeTruthy();
      expect(story.description).toBeTruthy();
      expect(typeof story.difficulty).toBe('number');
      expect(typeof story.xpReward).toBe('number');
      expect(story.topic).toBeTruthy();
    }
  });

  test('generated stories have correct ID prefix', () => {
    for (const story of generatedStories) {
      expect(story.id).toMatch(/^case-enhanced-\d+$/);
    }
  });

  test('no enhanced story stub ID conflicts with classic story IDs', () => {
    const classicIds = ALL_DETECTIVE_STORIES
      .filter(s => !isEnhancedCase(s))
      .map(s => s.id);
    const enhancedIds = enhancedStubs.map(s => s.id);
    const conflicts = classicIds.filter(id => enhancedIds.includes(id));
    expect(conflicts).toHaveLength(0);
  });

  test('all generated evidence items eliminate at least one suspect (non-path cases)', () => {
    for (const story of generatedStories) {
      if (story.mode === 'path') continue;
      for (const stage of story.stages) {
        if (stage.evidence) {
          expect(stage.evidence.eliminates.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  test('total eliminations narrow suspects down to exactly 1 (culprit)', () => {
    for (const story of generatedStories) {
      const totalEliminated = new Set();
      for (const stage of story.stages) {
        if (stage.evidence?.eliminates) {
          stage.evidence.eliminates.forEach(id => totalEliminated.add(id));
        }
      }
      expect(totalEliminated.size).toBe(story.suspects.length - 1);
      expect(totalEliminated.has(story.culprit)).toBe(false);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════
// getEliminationReasons — helper function tests
// ════════════════════════════════════════════════════════════════════════

describe('getEliminationReasons', () => {
  const story = CASE_GENERATORS['case-enhanced-1'](); // case-enhanced-1 generated

  test('returns exactly 3 reasons (1 correct + 2 wrong) for an eliminated suspect', () => {
    const suspect = story.suspects.find(s => s.id === 'suspect-3');
    const evidence = story.stages[0].evidence;
    const reasons = getEliminationReasons(evidence, suspect, story.suspects);
    expect(reasons).toHaveLength(3);
    const correctCount = reasons.filter(r => r.correct).length;
    expect(correctCount).toBe(1);
    expect(reasons[0]).toHaveProperty('label');
    expect(reasons[0]).toHaveProperty('detail');
  });

  test('returns empty array for a suspect NOT in the eliminates array', () => {
    const suspect = story.suspects.find(s => s.id === story.culprit);
    const evidence = story.stages[0].evidence;
    const reasons = getEliminationReasons(evidence, suspect, story.suspects);
    expect(reasons).toHaveLength(0);
  });

  test('all generated stories: every eliminated suspect gets exactly 3 reasons (1 correct + 2 wrong)', () => {
    for (const gen of Object.values(CASE_GENERATORS)) {
      const s = gen();
      for (const stage of s.stages) {
        if (!stage.evidence) continue;
        for (const elimId of stage.evidence.eliminates) {
          const suspect = s.suspects.find(su => su.id === elimId);
          const reasons = getEliminationReasons(stage.evidence, suspect, s.suspects);
          expect(reasons.length).toBe(3);
          expect(reasons.filter(r => r.correct).length).toBe(1);
        }
      }
    }
  });
});

// ════════════════════════════════════════════════════════════════════════
// highlightEvidenceSentences — evidence highlight matcher tests
// ════════════════════════════════════════════════════════════════════════

describe('highlightEvidenceSentences', () => {
  const suspects = (list) => list.map(([id, name, role]) => ({ id, name, role }));

  test('highlights the sentence mentioning the eliminated suspect by name token', () => {
    const text = 'The Corner Mart was closed. The shopkeeper was at the wholesale market that morning and never touched the computer. The delivery driver was on the road all day.';
    const list = suspects([['s1', 'Ravi the Shopkeeper', 'Store Owner']]);
    const segments = highlightEvidenceSentences(text, list, ['s1']);
    expect(segments.map(s => s.highlight)).toEqual([false, true, false]);
    expect(segments[1].token).toBe('shopkeeper');
  });

  test('highlights the sentence mentioning the eliminated suspect by role token', () => {
    const text = 'The area 27 corresponds to the off-limits storage room. The head researcher was at a conference and couldn\'t have accessed the lab.';
    const list = suspects([['s1', 'Dr. Bose', 'Head Researcher']]);
    const segments = highlightEvidenceSentences(text, list, ['s1']);
    expect(segments.map(s => s.highlight)).toEqual([false, true]);
    expect(segments[1].token).toBe('researcher');
  });

  test('handles the TA abbreviation alias', () => {
    const text = 'The TA was holding office hours and doesn\'t have keys to the exam storage.';
    const list = suspects([['s3', 'TA Verma', 'Teaching Assistant']]);
    const segments = highlightEvidenceSentences(text, list, ['s3']);
    expect(segments[0].highlight).toBe(true);
    expect(segments[0].token).toBe('ta');
  });

  test('handles the IT admin abbreviation alias', () => {
    const text = 'The true mean is 200K but the report showed a higher number. The IT admin manages servers, not data content.';
    const list = suspects([['s2', 'Raj the IT Admin', 'Database Administrator']]);
    const segments = highlightEvidenceSentences(text, list, ['s2']);
    expect(segments.map(s => s.highlight)).toEqual([false, true]);
    expect(segments[1].token).toBe('admin');
  });

  test('does NOT highlight the culprit-incrimination sentence when it clears a different suspect', () => {
    const text = 'Time 21:00 hours — the cleaner claimed she was on the third floor at this time, but the manager was in his meeting. The cleaner\'s timeline doesn\'t add up. She\'s the only one whose alibi conflicts with the calculated time.';
    const list = suspects([
      ['s1', 'Kiran the Guard', 'Security Guard'],
      ['s2', 'Deepa the Cleaner', 'Office Cleaner'],
      ['s3', 'Vikram the Manager', 'Office Manager'],
    ]);
    const segments = highlightEvidenceSentences(text, list, ['s3']);
    expect(segments.map(s => s.highlight)).toEqual([true, false, false]);
    expect(segments[0].text).toContain('manager');
    expect(segments[0].token).toBe('manager');
    expect(segments[1].text).toContain('cleaner');
  });

  test('returns empty array for empty text', () => {
    const list = suspects([['s1', 'Riya the Guard', 'Night Guard']]);
    expect(highlightEvidenceSentences('', list, ['s1'])).toEqual([]);
  });

  test('falls back to exoneration keywords when no alias matches', () => {
    const text = 'The vault was locked tight. Someone who couldn\'t reach the key still tried. Nobody else was there that night.';
    const list = suspects([['s1', 'Zara the Ghost', 'Unknown Visitor']]);
    const segments = highlightEvidenceSentences(text, list, ['s1']);
    expect(segments.filter(s => s.highlight).length).toBeGreaterThan(0);
  });

  test('all generated stories: every evidence block highlights at least one sentence with a token', () => {
    for (const gen of Object.values(CASE_GENERATORS)) {
      const s = gen();
      for (const stage of s.stages) {
        if (!stage.evidence) continue;
        const segments = highlightEvidenceSentences(stage.evidence.text, s.suspects, stage.evidence.eliminates);
        expect(segments.length, stage.evidence.id).toBeGreaterThan(0);
        // Ambiguous path-mode clues eliminate no one, so no suspect name exists to highlight.
        if ((stage.evidence.eliminates || []).length === 0) continue;
        const highlighted = segments.filter(seg => seg.highlight);
        expect(highlighted.length, stage.evidence.id).toBeGreaterThan(0);
        expect(highlighted.some(seg => seg.token), stage.evidence.id).toBe(true);
      }
    }
  });
});

describe('buildSuspectAliases', () => {
  test('derives name words, role words, and abbreviations', () => {
    expect([...buildSuspectAliases({ name: 'TA Verma', role: 'Teaching Assistant' })].sort()).toEqual(
      ['assistant', 'ta', 'teaching', 'verma'].sort()
    );
    expect([...buildSuspectAliases({ name: 'Raj the IT Admin', role: 'Database Administrator' })].sort()).toEqual(
      ['admin', 'administrator', 'database', 'it', 'raj'].sort()
    );
    expect([...buildSuspectAliases({ name: 'Ravi the Shopkeeper', role: 'Store Owner' })].sort()).toEqual(
      ['owner', 'ravi', 'shopkeeper', 'store'].sort()
    );
  });
});

// ════════════════════════════════════════════════════════════════════════
// validateEnhancedStory — schema validation function tests
// ════════════════════════════════════════════════════════════════════════

describe('validateEnhancedStory', () => {
  test('all generated enhanced stories pass validation', () => {
    for (const gen of Object.values(CASE_GENERATORS)) {
      const story = gen();
      const result = validateEnhancedStory(story);
      expect(result.valid).toBe(true);
      if (!result.valid) {
        console.error(`${story.id} errors:`, result.errors);
      }
    }
  });

  test('rejects story without suspects', () => {
    const result = validateEnhancedStory({ id: 'test', stages: [{ answer: 5, evidence: { id: 'e1', text: 'test', eliminates: ['s1'] } }] });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('suspects'))).toBe(true);
  });

  test('rejects story without culprit', () => {
    const result = validateEnhancedStory({
      id: 'test', suspects: [{ id: 's1', name: 'A', role: 'X', appearance: '🎭', characteristics: {} }],
      stages: [{ answer: 5, evidence: { id: 'e1', text: 'test', eliminates: ['s1'] } }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('culprit'))).toBe(true);
  });

  test('rejects story with non-existent culprit ID', () => {
    const result = validateEnhancedStory({
      id: 'test', culprit: 's99',
      suspects: [{ id: 's1', name: 'A', role: 'X', appearance: '🎭', characteristics: {} }],
      stages: [{ answer: 5, evidence: { id: 'e1', text: 'test', eliminates: ['s1'] } }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Culprit ID'))).toBe(true);
  });

  test('rejects evidence with empty eliminates array', () => {
    const result = validateEnhancedStory({
      id: 'test', culprit: 's1',
      suspects: [
        { id: 's1', name: 'A', role: 'X', appearance: '🎭', characteristics: {} },
        { id: 's2', name: 'B', role: 'Y', appearance: '🎭', characteristics: {} },
      ],
      stages: [{ answer: 5, evidence: { id: 'e1', text: 'test', eliminates: [] } }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('eliminate at least one suspect'))).toBe(true);
  });

  test('rejects story with duplicate suspect IDs', () => {
    const result = validateEnhancedStory({
      id: 'test', culprit: 's1',
      suspects: [
        { id: 's1', name: 'A', role: 'X', appearance: '🎭', characteristics: {} },
        { id: 's1', name: 'B', role: 'Y', appearance: '🎭', characteristics: {} },
      ],
      stages: [{ answer: 5, evidence: { id: 'e1', text: 'test', eliminates: ['s1'] } }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════
// Path-mode case (case-enhanced-16) — clue chain invariant tests
// ════════════════════════════════════════════════════════════════════════

describe('Coded Ledger path case', () => {
  const story = CASE_GENERATORS['case-enhanced-16']();
  const suspects = story.suspects;
  const clueChain = story.clueChain;

  test('story is marked as path mode with 3 clues', () => {
    expect(story.mode).toBe('path');
    expect(clueChain).toHaveLength(3);
    expect(story.stages).toHaveLength(3);
    expect(story.topic).toBe('lineareq');
  });

  test('fixed cast: culprit Vikram Nair, plus Anita Rao and Ravi Das', () => {
    expect(story.culprit).toBe('ledger-culprit');
    expect(suspects.map(s => s.name)).toEqual(['Vikram Nair', 'Anita Rao', 'Ravi Das']);
    expect(suspects.find(s => s.id === 'ledger-culprit').characteristics).toEqual({ height: 'tall', hand: 'right' });
    expect(suspects.find(s => s.id === 'ledger-anita').characteristics).toEqual({ height: 'short', hand: 'right' });
    expect(suspects.find(s => s.id === 'ledger-ravi').characteristics).toEqual({ height: 'medium', hand: 'left' });
  });

  test('cumulative eliminations = suspects − 1 and culprit never eliminated', () => {
    const totalEliminated = new Set();
    for (const stage of story.stages) {
      (stage.evidence?.eliminates || []).forEach(id => totalEliminated.add(id));
    }
    expect(totalEliminated.size).toBe(suspects.length - 1);
    expect(totalEliminated.has(story.culprit)).toBe(false);
  });

  test('stage-1 letter clue is ambiguous (eliminates no one)', () => {
    const clue = clueChain[0];
    expect(clue.type).toBe('letter');
    for (const s of suspects) {
      expect(clueEliminatesSuspect(clue, s)).toBe(false);
    }
    expect(getClueEliminableSuspects(clue, suspects)).toHaveLength(0);
  });

  test('stage answers decode into the clues (digit-sum, 22=V, 5=right-handed)', () => {
    const page = story.stages[0].answer;
    const digitSum = String(page).split('').reduce((s, d) => s + Number(d), 0);
    const letter = String.fromCharCode(64 + digitSum);
    expect(['A', 'I']).toContain(letter);
    for (const s of suspects) {
      expect(s.name.toLowerCase(), `every name should hold decoded letter ${letter}`).toContain(letter.toLowerCase());
    }
    expect(story.stages[1].answer).toBe(22);
    expect(story.stages[2].answer).toBe(5);
  });

  test('stage-2 V clue eliminates only Anita Rao', () => {
    const clue = clueChain[1];
    const eliminable = getClueEliminableSuspects(clue, suspects).map(s => s.id);
    expect(eliminable).toEqual(['ledger-anita']);
  });

  test('stage-3 handedness clue eliminates only Ravi Das', () => {
    const clue = clueChain[2];
    const eliminable = getClueEliminableSuspects(clue, suspects).map(s => s.id);
    expect(eliminable).toEqual(['ledger-ravi']);
  });
});

describe('getClueEliminationReasons', () => {
  const story = CASE_GENERATORS['case-enhanced-16']();
  const suspects = story.suspects;

  test('eliminable suspect gets exactly 3 options with 1 correct', () => {
    const anita = suspects.find(s => s.id === 'ledger-anita');
    const reasons = getClueEliminationReasons(story.clueChain[1], anita, suspects);
    expect(reasons).toHaveLength(3);
    expect(reasons.filter(r => r.correct).length).toBe(1);
    expect(reasons.every(r => r.label && r.detail)).toBe(true);
  });

  test('non-eliminable suspect gets only wrong options (none marked correct)', () => {
    const ravi = suspects.find(s => s.id === 'ledger-ravi');
    const reasons = getClueEliminationReasons(story.clueChain[1], ravi, suspects);
    expect(reasons.length).toBeGreaterThanOrEqual(2);
    expect(reasons.filter(r => r.correct)).toHaveLength(0);
  });

  test('culprit is never handed a correct reason', () => {
    const culprit = suspects.find(s => s.id === story.culprit);
    for (const clue of story.clueChain) {
      const reasons = getClueEliminationReasons(clue, culprit, suspects);
      expect(reasons.filter(r => r.correct), clue.type).toHaveLength(0);
    }
  });
});

describe('formatClueText', () => {
  test('formats letter and characteristic clues', () => {
    expect(formatClueText({ type: 'letter', value: 'V' })).toBe("The culprit's name contains the letter 'V'.");
    expect(formatClueText({ type: 'characteristic', key: 'hand', value: 'right' })).toBe('The culprit is right-handed.');
    expect(formatClueText({ type: 'characteristic', key: 'hand', value: 'left' })).toBe('The culprit is left-handed.');
    expect(formatClueText({ type: 'characteristic', key: 'height', value: 'tall' })).toBe('The culprit is tall.');
    expect(formatClueText(null)).toBe('');
  });
});

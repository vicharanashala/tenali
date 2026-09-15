/**
 * Tests for the Detective Board Cases engine + Case 1 data.
 *
 * Mirrors the existing `detective.test.jsx` suite: pure-engine and data-
 * validation coverage driven through the engine API (no DOM automation),
 * plus a mount smoke test for the BoardCasePlay shell.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import {
  BAND_LEVELS,
  checkDetectiveAnswer,
  objectAt,
  createInitialState,
  movePlayer,
  currentVariantKey,
  getMathFor,
  registerAnswer,
  recordWrong,
  consumeHint,
  handleWrong,
  collectObservation,
  evidenceEliminates,
  applyElimination,
  remainingSuspects,
  onlyCulpritRemains,
  accusedSuspect,
  shouldShowDeduction,
  getRevealedProfile,
  getNotebookLines,
  getLatestThought,
  getThoughtsForEvidence,
  getCollectedEvidence,
  getPosterSuspects,
  validateBoardSpec,
  profileUnlocks,
} from './detective-board-engine';
import { BOARD_CASES, BOARD_CASE_1, BOARD_CASE_2, BOARD_CASE_3, getBoardCase, validateBoardCase } from './detective-board-cases';
import BoardCasePlay from './detective-board-app';

// ─── Helper: Simulate localStorage (for the BoardCasePlay smoke test) ──
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

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ─── Helper: BFS path to walk the detective to a cell (skips blocked) ──
function bfsPath(spec, from, to) {
  const size = spec.gridSize;
  const blocked = new Set(spec.blocked.map(([x, y]) => `${x},${y}`));
  const key = (x, y) => `${x},${y}`;
  const queue = [[from[0], from[1]]];
  const prev = { [key(from[0], from[1])]: null };
  while (queue.length) {
    const [cx, cy] = queue.shift();
    if (cx === to[0] && cy === to[1]) break;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (blocked.has(key(nx, ny))) continue;
      if (prev[key(nx, ny)] !== undefined) continue;
      prev[key(nx, ny)] = [cx, cy];
      queue.push([nx, ny]);
    }
  }
  const moves = [];
  let cur = to;
  while (cur && prev[key(cur[0], cur[1])] !== null && prev[key(cur[0], cur[1])] !== undefined) {
    const p = prev[key(cur[0], cur[1])];
    moves.unshift([cur[0] - p[0], cur[1] - p[1]]);
    cur = p;
  }
  return moves;
}

function walkTo(state, spec, cell) {
  const moves = bfsPath(spec, state.playerPos, cell);
  let s = state;
  let lastEvent = null;
  for (const [dx, dy] of moves) {
    const r = movePlayer(s, spec, dx, dy);
    s = r.state;
    lastEvent = r.event;
  }
  return { state: s, lastEvent };
}

// ═══ Schema validation (Case 1) ══════════════════════════════════════

describe('Board case schema validation', () => {
  test('validateBoardCase(board-1) passes with zero problems', () => {
    expect(validateBoardCase(BOARD_CASE_1)).toEqual([]);
  });

  test('every investigation object has E/M/H variants whose answers all equal the evidence value', () => {
    for (const obj of BOARD_CASE_1.objects) {
      if (obj.clueType !== 'investigation') continue;
      const m = obj.investigation.math;
      expect(m.easy).toBeDefined();
      expect(m.medium).toBeDefined();
      expect(m.hard).toBeDefined();
      const answers = [m.easy.answer, m.medium.answer, m.hard.answer];
      expect(new Set(answers.map(String)).size).toBe(1);
      expect(typeof m.easy.answer).toBe('number');
    }
  });

  test('every eliminates entry targets a real non-culprit suspect', () => {
    const ids = BOARD_CASE_1.suspects.map(s => s.id);
    for (const rule of BOARD_CASE_1.eliminationRules) {
      for (const sid of rule.eliminates) {
        expect(ids).toContain(sid);
        expect(sid).not.toBe(BOARD_CASE_1.culprit);
      }
    }
    // The culprit never appears in any rule — un-eliminable by design.
    const allEliminated = BOARD_CASE_1.eliminationRules.flatMap(r => r.eliminates);
    expect(allEliminated).not.toContain(BOARD_CASE_1.culprit);
  });

  test('every suspect has at least one unlockable profile slot', () => {
    const unlockMap = {};
    for (const obj of BOARD_CASE_1.objects) {
      for (const u of profileUnlocks(obj)) {
        if (!unlockMap[u.suspectId]) unlockMap[u.suspectId] = new Set();
        unlockMap[u.suspectId].add(u.field);
      }
    }
    for (const s of BOARD_CASE_1.suspects) {
      expect(unlockMap[s.id]).toBeDefined();
      expect(unlockMap[s.id].size).toBeGreaterThan(0);
    }
  });

  test('every evidence id is unique; currentThoughts reference real evidence', () => {
    const ids = BOARD_CASE_1.objects.map(o => o.evidence.id);
    expect(new Set(ids).size).toBe(ids.length);
    const thoughtIds = BOARD_CASE_1.currentThoughts.flatMap(t => t.afterEvidenceIds);
    for (const id of thoughtIds) expect(ids).toContain(id);
  });

  test('each elimination evidence reveals a relevant field of the eliminated suspect', () => {
    const unlockIndex = {};
    for (const obj of BOARD_CASE_1.objects) {
      for (const u of profileUnlocks(obj)) {
        if (!unlockIndex[u.suspectId]) unlockIndex[u.suspectId] = new Set();
        unlockIndex[u.suspectId].add(u.field);
      }
    }
    for (const rule of BOARD_CASE_1.eliminationRules) {
      for (const sid of rule.eliminates) {
        expect(unlockIndex[sid] && unlockIndex[sid].size).toBeGreaterThan(0);
      }
    }
  });

  test('registry helpers work', () => {
    expect(getBoardCase('board-1')).toBe(BOARD_CASE_1);
    expect(getBoardCase('nope')).toBeNull();
    expect(BOARD_CASES).toContain(BOARD_CASE_1);
  });

  test('validateBoardSpec catches a culprit in an elimination rule', () => {
    const bad = JSON.parse(JSON.stringify(BOARD_CASE_1));
    bad.eliminationRules[0] = { evidenceId: 'ev-footprints', eliminates: ['riya'] };
    expect(validateBoardSpec(bad).some(p => p.includes('culprit'))).toBe(true);
  });
});

// ═══ Engine: movement ═════════════════════════════════════════════════

describe('Board engine — movement', () => {
  test('moving beyond the edge returns ok:false edge', () => {
    const s = createInitialState(BOARD_CASE_1);
    const res = movePlayer(s, BOARD_CASE_1, 0, -100);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('edge');
  });

  test('moving into a blocked cell returns ok:false blocked', () => {
    const s = createInitialState(BOARD_CASE_1);
    // [1,1] is the pond; path playerStart [6,6] -> [6,5] -> [5,5] -> ... (not needed)
    // Just force position adjacent to a blocked cell and attempt the step.
    const near = { ...s, playerPos: [4, 1] };
    const res = movePlayer(near, BOARD_CASE_1, -1, 0); // into [3,1] (pond)
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('blocked');
  });

  test('plain steps move one tile and never change other state', () => {
    const s = createInitialState(BOARD_CASE_1);
    const r = movePlayer(s, BOARD_CASE_1, 1, 0);
    expect(r.ok).toBe(true);
    expect(r.event.type).toBe('moved');
    expect(r.state.playerPos).toEqual([7, 6]);
    expect(r.state.collectedEvidenceIds).toEqual([]);
  });

  test('diagonal movement happens as two orthogonal steps', () => {
    const s = createInitialState(BOARD_CASE_1);
    const r1 = movePlayer(s, BOARD_CASE_1, 1, 0);
    const r2 = movePlayer(r1.state, BOARD_CASE_1, 0, 1);
    expect(r2.state.playerPos).toEqual([7, 7]);
  });

  test('every object is reachable from the player start', () => {
    for (const obj of BOARD_CASE_1.objects) {
      const s = createInitialState(BOARD_CASE_1);
      const { state, lastEvent } = walkTo(s, BOARD_CASE_1, obj.cell);
      expect(state.playerPos).toEqual(obj.cell);
      expect(lastEvent.type).toBe('object');
    }
  });

  test('stepping onto an object opens it; re-stepping reports already-collected', () => {
    let s = createInitialState(BOARD_CASE_1);
    let r = walkTo(s, BOARD_CASE_1, [2, 3]);
    expect(r.lastEvent.type).toBe('object');
    expect(r.lastEvent.objectId).toBe('footprints');
    s = r.state;

    // Solve it, then walk away and back.
    const solved = registerAnswer(s, BOARD_CASE_1, objectAt(BOARD_CASE_1, 2, 3), '15');
    expect(solved.correct).toBe(true);
    let away = walkTo(solved.state, BOARD_CASE_1, [6, 6]);
    const back = walkTo(away.state, BOARD_CASE_1, [2, 3]);
    expect(back.lastEvent.type).toBe('already-collected');
  });
});

// ═══ Engine: silent band & variant selection ═══════════════════════════

describe('Board engine — silent difficulty band', () => {
  const footprints = objectAt(BOARD_CASE_1, 2, 3);

  test('default band is Easy (0) and selects the easy variant', () => {
    const s = createInitialState(BOARD_CASE_1);
    expect(s.band).toBe(0);
    expect(currentVariantKey(s, footprints)).toBe('easy');
    expect(getMathFor(s, footprints).answer).toBe(15);
  });

  test('2 consecutive correct answers nudge the band up', () => {
    const s = createInitialState(BOARD_CASE_1);
    const r1 = registerAnswer(s, BOARD_CASE_1, footprints, '15');
    expect(r1.state.band).toBe(0);
    const r2 = registerAnswer(r1.state, BOARD_CASE_1, footprints, '15');
    expect(r2.state.band).toBe(1);
  });

  test('2 wrong answers nudge the band down', () => {
    const s = createInitialState(BOARD_CASE_1, { initialBand: 1 });
    const w1 = recordWrong(s);
    expect(w1.band).toBe(1);
    const w2 = recordWrong(w1);
    expect(w2.band).toBe(0);
  });

  test('band clamps at the top (2)', () => {
    const s = createInitialState(BOARD_CASE_1, { initialBand: 2 });
    const r1 = registerAnswer(s, BOARD_CASE_1, footprints, '15');
    const r2 = registerAnswer(r1.state, BOARD_CASE_1, footprints, '15');
    expect(r2.state.band).toBe(2);
  });

  test('band clamps at the bottom (0)', () => {
    const s = createInitialState(BOARD_CASE_1, { initialBand: 0 });
    const w1 = recordWrong(s);
    const w2 = recordWrong(w1);
    expect(w2.band).toBe(0);
  });

  test('band levels are easy/medium/hard', () => {
    expect(BAND_LEVELS).toEqual(['easy', 'medium', 'hard']);
  });
});

// ═══ Engine: hint ladder ══════════════════════════════════════════════

describe('Board engine — hint ladder', () => {
  const footprints = objectAt(BOARD_CASE_1, 2, 3);

  test('wrong → hint 1, wrong → hint 2, then easy variant is offered', () => {
    let s = createInitialState(BOARD_CASE_1);
    const hw1 = handleWrong(s, footprints);
    expect(hw1.hintIndex).toBe(0);
    expect(hw1.offeredEasy).toBe(false);
    expect(hw1.state.hintsUsedPerObject.footprints).toBe(1);

    const hw2 = handleWrong(hw1.state, footprints);
    expect(hw2.hintIndex).toBe(1);
    expect(hw2.offeredEasy).toBe(true);
    expect(hw2.state.hintsUsedPerObject.footprints).toBe(2);

    expect(currentVariantKey(hw2.state, footprints)).toBe('easy');
  });

  test('totalHintsUsed accumulates across objects', () => {
    let s = createInitialState(BOARD_CASE_1);
    const hw = handleWrong(s, footprints);
    expect(hw.state.totalHintsUsed).toBe(1);
    const milk = objectAt(BOARD_CASE_1, 11, 2);
    const hw2 = consumeHint(hw.state, milk.id);
    expect(hw2.state.totalHintsUsed).toBe(2);
    expect(hw2.state.hintsUsedPerObject.milk).toBe(1);
  });

  test('answer tolerance: units and numeric tolerance are accepted', () => {
    expect(checkDetectiveAnswer(15, '15 cm')).toBe(true);
    expect(checkDetectiveAnswer(15, ' 15 ')).toBe(true);
    expect(checkDetectiveAnswer(15, '15.004')).toBe(true);
    expect(checkDetectiveAnswer(15, '16')).toBe(false);
    expect(checkDetectiveAnswer('40', '40')).toBe(true);
  });
});

// ═══ Engine: gradual reveal & notebook ════════════════════════════════

describe('Board engine — notebook & suspect board', () => {
  const mila = BOARD_CASE_1.suspects.find(s => s.id === 'mila');
  const riya = BOARD_CASE_1.suspects.find(s => s.id === 'riya');

  test('profile slots show ??? until the unlocking clue is collected', () => {
    expect(getRevealedProfile(mila, BOARD_CASE_1, []).footprint).toBe('???');
    expect(getRevealedProfile(mila, BOARD_CASE_1, ['ev-footprints']).footprint).toBe('4 cm');
  });

  test('uncollected observations keep slots hidden', () => {
    expect(getRevealedProfile(riya, BOARD_CASE_1, []).colour).toBe('???');
    expect(getRevealedProfile(riya, BOARD_CASE_1, ['ev-feather']).colour).toBe('white fur');
  });

  test('currentThoughts activate only when their evidence is collected', () => {
    expect(getNotebookLines(BOARD_CASE_1, [])).toEqual([]);
    const lines = getNotebookLines(BOARD_CASE_1, ['ev-footprints']);
    expect(lines.length).toBe(1);
    expect(lines[0].kind).toBe('prompt');
    expect(lines[0].afterEvidenceIds).toContain('ev-footprints');
    expect(lines[0].question).toContain('footprint');
  });

  test('the combined aha thought appears only once all suspects are eliminated', () => {
    const evidence = ['ev-footprints', 'ev-clock', 'ev-muddy'];
    expect(getNotebookLines(BOARD_CASE_1, evidence).some(l => l.kind === 'aha')).toBe(false);
    expect(getNotebookLines(BOARD_CASE_1, evidence, ['mila', 'leo']).some(l => l.kind === 'aha')).toBe(false);
    const lines = getNotebookLines(BOARD_CASE_1, evidence, ['mila', 'leo', 'teddy']);
    expect(lines.find(l => l.kind === 'aha').text).toContain('Riya');
  });

  test('getLatestThought returns nothing before any clue and only the newest thought after', () => {
    expect(getLatestThought(BOARD_CASE_1, [])).toEqual([]);
    const two = getLatestThought(BOARD_CASE_1, ['ev-footprints', 'ev-clock']);
    expect(two).toHaveLength(1);
    expect(two[0].kind).toBe('prompt');
    expect(two[0].afterEvidenceIds).toContain('ev-clock');
    const all = getLatestThought(BOARD_CASE_1, ['ev-footprints', 'ev-clock', 'ev-muddy'], ['mila', 'leo', 'teddy']);
    expect(all).toHaveLength(1);
    expect(all[0].kind).toBe('aha');
    expect(all[0].text).toContain('Riya');
  });

  test('getThoughtsForEvidence returns only the thought unlocked by that clue', () => {
    const ft = getThoughtsForEvidence(BOARD_CASE_1, ['ev-footprints'], 'ev-footprints');
    expect(ft).toHaveLength(1);
    expect(ft[0].kind).toBe('prompt');
    expect(ft[0].afterEvidenceIds).toContain('ev-footprints');
    expect(getThoughtsForEvidence(BOARD_CASE_1, ['ev-footprints'], 'ev-clock')).toEqual([]);
  });

  test('getThoughtsForEvidence surfaces the combined aha thought once all its clues and suspects are eliminated', () => {
    const evidence = ['ev-footprints', 'ev-clock', 'ev-muddy'];
    const lines = getThoughtsForEvidence(BOARD_CASE_1, evidence, 'ev-muddy', ['mila', 'leo', 'teddy']);
    expect(lines.some(l => l.kind === 'aha')).toBe(true);
    expect(lines.find(l => l.kind === 'aha').text).toContain('Riya');
    expect(getThoughtsForEvidence(BOARD_CASE_1, evidence, 'ev-muddy').some(l => l.kind === 'aha')).toBe(false);
  });

  test('collected evidence returns in spec object order', () => {
    const ev = getCollectedEvidence(BOARD_CASE_1, ['ev-clock', 'ev-footprints']);
    expect(ev[0].id).toBe('ev-footprints');
    expect(ev[1].id).toBe('ev-clock');
  });

  test('poster suspects carry revealed profiles and eliminated flags', () => {
    const collected = collectObservation(createInitialState(BOARD_CASE_1), objectAt(BOARD_CASE_1, 2, 3));
    const eliminated = applyElimination(collected.state, BOARD_CASE_1, 'ev-footprints', 'mila');
    expect(eliminated.ok).toBe(true);
    const poster = getPosterSuspects(BOARD_CASE_1, eliminated.state);
    const milaPoster = poster.find(x => x.id === 'mila');
    expect(milaPoster.eliminated).toBe(true);
    expect(milaPoster.profile.footprint).toBe('4 cm');
    const teddyPoster = poster.find(x => x.id === 'teddy');
    expect(teddyPoster.eliminated).toBe(false);
  });
});

// ═══ Engine: elimination ══════════════════════════════════════════════

describe('Board engine — elimination', () => {
  test('valid elimination applies; invalid and repeated ones do not', () => {
    const s = createInitialState(BOARD_CASE_1);
    // Not collected yet → refused
    expect(applyElimination(s, BOARD_CASE_1, 'ev-footprints', 'mila').reason).toBe('not-collected');

    const collected = collectObservation(s, objectAt(BOARD_CASE_1, 2, 3));
    const ok = applyElimination(collected.state, BOARD_CASE_1, 'ev-footprints', 'mila');
    expect(ok.ok).toBe(true);
    expect(ok.state.eliminatedIds).toContain('mila');

    // Repeated → already
    expect(applyElimination(ok.state, BOARD_CASE_1, 'ev-footprints', 'mila').reason).toBe('already');

    // Wrong suspect for that evidence → no-contradiction
    expect(applyElimination(ok.state, BOARD_CASE_1, 'ev-footprints', 'leo').reason).toBe('no-contradiction');
  });

  test('the culprit cannot be eliminated by any evidence', () => {
    for (const rule of BOARD_CASE_1.eliminationRules) {
      expect(evidenceEliminates(BOARD_CASE_1, rule.evidenceId, BOARD_CASE_1.culprit)).toBe(false);
    }
  });

  test('only the culprit remains after all three eliminations → accusation ready', () => {
    const s = createInitialState(BOARD_CASE_1);
    let state = s;
    // Collect all three investigation clues and eliminate the innocents.
    for (const [cell, evidenceId, suspectId, answer] of [
      [[2, 3], 'ev-footprints', 'mila', '15'],
      [[9, 6], 'ev-clock', 'leo', '40'],
      [[4, 8], 'ev-muddy', 'teddy', '12'],
    ]) {
      const walked = walkTo(state, BOARD_CASE_1, cell);
      const obj = objectAt(BOARD_CASE_1, cell[0], cell[1]);
      const solved = registerAnswer(walked.state, BOARD_CASE_1, obj, answer);
      expect(solved.correct).toBe(true);
      expect(solved.state.collectedEvidenceIds).toContain(evidenceId);
      const elim = applyElimination(solved.state, BOARD_CASE_1, evidenceId, suspectId);
      expect(elim.ok).toBe(true);
      state = elim.state;
    }

    expect(remainingSuspects(BOARD_CASE_1, state).map(s => s.id)).toEqual(['riya']);
    expect(onlyCulpritRemains(BOARD_CASE_1, state)).toBe(true);
    const accusation = accusedSuspect(BOARD_CASE_1, state);
    expect(accusation.id).toBe('riya');
  });
});

// ═══ Integration: full run through the engine + shell smoke test ═══════

describe('Board case integration', () => {
  test('full detective flow: walk → solve → eliminate → accuse → onComplete', () => {
    let s = createInitialState(BOARD_CASE_1);
    const flow = [
      { cell: [2, 3], answer: '15', evidence: 'ev-footprints', eliminate: 'mila' },
      { cell: [9, 6], answer: '40', evidence: 'ev-clock', eliminate: 'leo' },
      { cell: [4, 8], answer: '12', evidence: 'ev-muddy', eliminate: 'teddy' },
    ];
    for (const step of flow) {
      const { state } = walkTo(s, BOARD_CASE_1, step.cell);
      const obj = objectAt(BOARD_CASE_1, step.cell[0], step.cell[1]);
      const solved = registerAnswer(state, BOARD_CASE_1, obj, step.answer);
      expect(solved.correct).toBe(true);
      expect(solved.state.collectedEvidenceIds).toContain(step.evidence);
      const elim = applyElimination(solved.state, BOARD_CASE_1, step.evidence, step.eliminate);
      expect(elim.ok).toBe(true);
      s = elim.state;
    }

    // The milk jug is a fourth investigation clue (no elimination rule).
    const milkWalk = walkTo(s, BOARD_CASE_1, [11, 2]);
    const milk = objectAt(BOARD_CASE_1, 11, 2);
    const milkSolved = registerAnswer(milkWalk.state, BOARD_CASE_1, milk, '25');
    expect(milkSolved.correct).toBe(true);
    s = milkSolved.state;

    // Observation clues can be collected too (they enrich the poster).
    for (const cell of [[5, 4], [7, 9], [0, 10]]) {
      const { state } = walkTo(s, BOARD_CASE_1, cell);
      const obj = objectAt(BOARD_CASE_1, cell[0], cell[1]);
      const res = collectObservation(state, obj);
      expect(res.event.type).toBe('clue-found');
      s = res.state;
    }
    expect(s.collectedEvidenceIds).toHaveLength(7);
    expect(accusedSuspect(BOARD_CASE_1, s).id).toBe('riya');

    // Completion meta mirrors what BoardCasePlay reports to onComplete.
    const meta = {
      totalHintsUsed: s.totalHintsUsed,
      correctCount: s.correctCount,
      wrongCount: s.wrongCount,
      totalQuestions: s.correctCount + s.wrongCount,
      skillFamily: BOARD_CASE_1.skillFamily,
    };
    expect(meta.skillFamily).toBe('addsub');
    expect(meta.correctCount).toBe(4);
    expect(meta.wrongCount).toBe(0);
  });

  test('BoardCasePlay mounts and shows the intro briefing', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_1} onComplete={onComplete} onBack={onBack} />
      );
    });
    expect(container.textContent).toContain('Start the Investigation');
    expect(container.textContent).toContain('Riya');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('BoardCasePlay resumes an in-progress scene from initialState', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    const snap = {
      phase: 'exploring',
      boardSnapshot: {
        playerPos: [2, 3],
        collectedEvidenceIds: ['ev-footprints'],
        eliminatedIds: ['mila'],
        band: 0,
        hintsUsedPerObject: {},
        correctCount: 1,
        wrongCount: 0,
        totalHintsUsed: 0,
      },
    };
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_1} onComplete={onComplete} onBack={onBack} initialState={snap} />
      );
    });
    expect(container.textContent).toContain('Suspects');
    expect(container.textContent).toContain('1 of 7 clues found');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  // ─── Exit dialog (leave mid-case, resume later) ────────────────────

  const renderExploring = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    const snap = {
      phase: 'exploring',
      boardSnapshot: {
        playerPos: [2, 3],
        collectedEvidenceIds: ['ev-footprints'],
        eliminatedIds: ['mila'],
        band: 0,
        hintsUsedPerObject: {},
        correctCount: 1,
        wrongCount: 0,
        totalHintsUsed: 0,
      },
    };
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_1} onComplete={onComplete} onBack={onBack} initialState={snap} />
      );
    });
    const clickText = (text) => {
      const btn = [...container.querySelectorAll('button')].find(b => (b.textContent || '').includes(text));
      expect(btn).toBeTruthy();
      act(() => { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    };
    return { container, root, onComplete, onBack, clickText };
  };

  // ─── Deduction prompts + elimination feedback (UI level) ───────────

  const renderWithSnapshot = (boardSnapshot) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_1} onComplete={onComplete} onBack={onBack} initialState={{ phase: 'exploring', boardSnapshot }} />
      );
    });
    const clickText = (text) => {
      const btn = [...container.querySelectorAll('button')].find(b => (b.textContent || '').toLowerCase().includes(text.toLowerCase()));
      expect(btn).toBeTruthy();
      act(() => { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    };
    const isPosterOpen = () => container.querySelector('.dbc-poster').classList.contains('is-open');
    return { container, root, onComplete, onBack, clickText, isPosterOpen };
  };

  const baseSnapshot = (overrides = {}) => ({
    playerPos: [2, 3],
    collectedEvidenceIds: ['ev-footprints'],
    eliminatedIds: [],
    band: 0,
    hintsUsedPerObject: {},
    correctCount: 0,
    wrongCount: 0,
    totalHintsUsed: 0,
    ...overrides,
  });

  test('a correct prompt elimination opens the suspect poster while the notebook stays open', () => {
    const { container, root, clickText, isPosterOpen } = renderWithSnapshot(baseSnapshot());
    clickText('📝');
    expect(container.querySelector('.dbc-prompt-row')).toBeTruthy();
    clickText('mila');
    expect(isPosterOpen()).toBe(true);
    expect(container.querySelector('.dbc-notebook').classList.contains('is-open')).toBe(true);
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('a non-final prompt elimination auto-closes the poster back to the notebook', () => {
    vi.useFakeTimers();
    const { container, root, clickText, isPosterOpen } = renderWithSnapshot(baseSnapshot());
    clickText('📝');
    clickText('mila');
    expect(isPosterOpen()).toBe(true);
    act(() => { vi.advanceTimersByTime(1150); });
    expect(isPosterOpen()).toBe(false);
    expect(container.querySelector('.dbc-notebook').classList.contains('is-open')).toBe(true);
    act(() => { root.unmount(); });
    vi.useRealTimers();
    document.body.removeChild(container);
  });

  test('the final prompt elimination keeps the poster open with the Accuse button', () => {
    const { container, root, clickText, isPosterOpen } = renderWithSnapshot(baseSnapshot({
      collectedEvidenceIds: ['ev-footprints', 'ev-clock', 'ev-muddy'],
      eliminatedIds: ['mila', 'leo'],
      correctCount: 3,
    }));
    clickText('📝');
    clickText('teddy');
    expect(isPosterOpen()).toBe(true);
    expect(container.textContent).toContain('Accuse Riya!');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('an answered prompt card is faded and every comparison row is disabled', () => {
    const { container, root, clickText } = renderWithSnapshot(baseSnapshot());
    clickText('📝');
    clickText('mila');
    const card = container.querySelector('.dbc-prompt-card');
    expect(card.classList.contains('is-done')).toBe(true);
    const rows = [...card.querySelectorAll('.dbc-prompt-row')];
    expect(rows).toHaveLength(4);
    expect(rows.every(r => r.disabled)).toBe(true);
    expect(card.querySelector('.dbc-prompt-row.is-answered .dbc-prompt-row-check')).toBeTruthy();
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('BoardCasePlay shows a leave button while exploring', () => {
    const { container, root } = renderExploring();
    expect(container.querySelector('.dbc-exit-btn')).toBeTruthy();
    expect(container.textContent).toContain('←');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('BoardCasePlay opens the leave dialog when the exit button is tapped', () => {
    const { container, root, clickText } = renderExploring();
    clickText('←');
    expect(container.textContent).toContain('Leave the case?');
    expect(container.textContent).toContain('Keep playing');
    expect(container.textContent).toContain('Leave for now');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('BoardCasePlay invokes onBack when leaving the case', () => {
    const { container, root, onBack, clickText } = renderExploring();
    clickText('←');
    clickText('Leave for now');
    expect(onBack).toHaveBeenCalledTimes(1);
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('BoardCasePlay keeps playing when the dialog is dismissed', () => {
    const { container, root, onBack, clickText } = renderExploring();
    clickText('←');
    clickText('Keep playing');
    expect(onBack).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Leave the case?');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  // ─── Notebook "new clue" cue (dot + pulse) ─────────────────────────

  const KEYMAP = { '0,-1': 'w', '0,1': 's', '-1,0': 'a', '1,0': 'd' };
  const pressKey = (key) => act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  });
  const walkDetective = (from, to) => {
    const moves = bfsPath(BOARD_CASE_1, from, to);
    let pos = from;
    for (const [dx, dy] of moves) {
      pressKey(KEYMAP[`${dx},${dy}`]);
      pos = [pos[0] + dx, pos[1] + dy];
    }
    return pos;
  };
  const setInput = (input, value) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    act(() => {
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const notebookBtn = (container) =>
    [...container.querySelectorAll('button')].find(b => (b.textContent || '').includes('📝'));
  const solveFootprints = (container) => {
    const input = container.querySelector('.dbc-card-input');
    expect(input).toBeTruthy();
    setInput(input, '15');
    act(() => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };
  const mountBoard = (snapshot) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_1} onComplete={onComplete} onBack={onBack}
          initialState={{ phase: 'exploring', boardSnapshot: snapshot }} />
      );
    });
    return { container, root };
  };

  test('a fresh case shows no notebook cue until a clue is solved', () => {
    vi.useFakeTimers();
    const { container, root } = mountBoard(baseSnapshot({ playerPos: [6, 6], collectedEvidenceIds: [] }));
    const btn = notebookBtn(container);
    expect(btn.querySelector('.dbc-toggle-dot')).toBeNull();
    expect(btn.getAttribute('aria-label')).not.toContain('new clues');
    expect(walkDetective([6, 6], [2, 3])).toEqual([2, 3]);
    solveFootprints(container);
    expect(notebookBtn(container).querySelector('.dbc-toggle-dot')).toBeTruthy();
    expect(notebookBtn(container).getAttribute('aria-label')).toContain('new clues');
    expect(notebookBtn(container).querySelector('.dbc-toggle-inner--nudge')).toBeTruthy();
    act(() => { root.unmount(); });
    vi.useRealTimers();
    document.body.removeChild(container);
  });

  test('opening the notebook clears the cue', () => {
    vi.useFakeTimers();
    const { container, root } = mountBoard(baseSnapshot({ playerPos: [6, 6], collectedEvidenceIds: [] }));
    walkDetective([6, 6], [2, 3]);
    solveFootprints(container);
    expect(notebookBtn(container).querySelector('.dbc-toggle-dot')).toBeTruthy();
    act(() => { notebookBtn(container).dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(notebookBtn(container).querySelector('.dbc-toggle-dot')).toBeNull();
    expect(notebookBtn(container).getAttribute('aria-label')).not.toContain('new clues');
    expect(container.querySelector('.dbc-notebook').classList.contains('is-open')).toBe(true);
    act(() => { root.unmount(); });
    vi.useRealTimers();
    document.body.removeChild(container);
  });

  test('a resumed case with collected evidence shows no phantom cue', () => {
    const { container, root } = mountBoard(baseSnapshot({ playerPos: [2, 3], collectedEvidenceIds: ['ev-footprints'] }));
    expect(notebookBtn(container).querySelector('.dbc-toggle-dot')).toBeNull();
    expect(notebookBtn(container).getAttribute('aria-label')).not.toContain('new clues');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });
});

// ═══ Case 2 — The Missing School Trophy ════════════════════════════════

describe('Board Case 2 schema validation', () => {
  test('validateBoardCase(board-2) passes with zero problems', () => {
    expect(validateBoardCase(BOARD_CASE_2)).toEqual([]);
  });

  test('every investigation object has E/M/H variants whose answers all equal the evidence value', () => {
    for (const obj of BOARD_CASE_2.objects) {
      if (obj.clueType !== 'investigation') continue;
      const m = obj.investigation.math;
      expect(m.easy).toBeDefined();
      expect(m.medium).toBeDefined();
      expect(m.hard).toBeDefined();
      const answers = [m.easy.answer, m.medium.answer, m.hard.answer];
      expect(new Set(answers.map(String)).size).toBe(1);
      expect(typeof m.easy.answer).toBe('number');
    }
  });

  test('every investigation variant with visuals has a valid type', () => {
    const validTypes = ['count-visual', 'clock', 'measure'];
    for (const obj of BOARD_CASE_2.objects) {
      if (obj.clueType !== 'investigation') continue;
      for (const key of ['easy', 'medium', 'hard']) {
        const v = obj.investigation.math[key];
        if (v.visuals) {
          expect(validTypes).toContain(v.visuals.type);
        }
      }
    }
  });

  test('culprit is never in any elimination rule', () => {
    const allEliminated = BOARD_CASE_2.eliminationRules.flatMap(r => r.eliminates);
    expect(allEliminated).not.toContain(BOARD_CASE_2.culprit);
  });

  test('every suspect has at least one unlockable profile slot', () => {
    const unlockMap = {};
    for (const obj of BOARD_CASE_2.objects) {
      for (const u of profileUnlocks(obj)) {
        if (!unlockMap[u.suspectId]) unlockMap[u.suspectId] = new Set();
        unlockMap[u.suspectId].add(u.field);
      }
    }
    for (const s of BOARD_CASE_2.suspects) {
      expect(unlockMap[s.id]).toBeDefined();
      expect(unlockMap[s.id].size).toBeGreaterThan(0);
    }
  });

  test('Case 2 uses addsub skill family for mastery continuity', () => {
    expect(BOARD_CASE_2.skillFamily).toBe('addsub');
  });

  test('Case 2 has exactly 4 suspects and 7 objects', () => {
    expect(BOARD_CASE_2.suspects).toHaveLength(4);
    expect(BOARD_CASE_2.objects).toHaveLength(7);
  });

  test('Case 2 has 5 elimination rules', () => {
    expect(BOARD_CASE_2.eliminationRules).toHaveLength(5);
  });

  test('all Case 2 objects are reachable from player start', () => {
    for (const obj of BOARD_CASE_2.objects) {
      const s = createInitialState(BOARD_CASE_2);
      const { state } = walkTo(s, BOARD_CASE_2, obj.cell);
      expect(state.playerPos).toEqual(obj.cell);
    }
  });
});

describe('Case 2 visual math renderers (UI)', () => {
  const KEYMAP = { '0,-1': 'w', '0,1': 's', '-1,0': 'a', '1,0': 'd' };
  const pressKey = (key) => act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  });
  const walkDetectiveTo = (from, targetObjId) => {
    const targetObj = BOARD_CASE_2.objects.find(o => o.id === targetObjId);
    const avoidCells = new Set(
      BOARD_CASE_2.objects
        .filter(o => o.id !== targetObjId)
        .map(o => `${o.cell[0]},${o.cell[1]}`)
    );
    const augmented = {
      ...BOARD_CASE_2,
      blocked: [...BOARD_CASE_2.blocked, ...[...avoidCells].map(s => s.split(',').map(Number))],
    };
    const moves = bfsPath(augmented, from, targetObj.cell);
    let pos = from;
    for (const [dx, dy] of moves) {
      pressKey(KEYMAP[`${dx},${dy}`]);
      pos = [pos[0] + dx, pos[1] + dy];
    }
    return pos;
  };
  const case2Snapshot = (overrides = {}) => ({
    playerPos: [6, 6],
    collectedEvidenceIds: [],
    eliminatedIds: [],
    band: 0,
    hintsUsedPerObject: {},
    correctCount: 0,
    wrongCount: 0,
    totalHintsUsed: 0,
    ...overrides,
  });
  const mountBoard2 = (snapshot) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_2} onComplete={onComplete} onBack={onBack}
          initialState={{ phase: 'exploring', boardSnapshot: snapshot || case2Snapshot() }} />
      );
    });
    return { container, root };
  };

  test('count-visual renders emoji groups in the math card', () => {
    vi.useFakeTimers();
    const { container, root } = mountBoard2();
    walkDetectiveTo([6, 6], 'backpack');
    const visual = container.querySelector('.dbc-visual--count');
    expect(visual).toBeTruthy();
    expect(visual.querySelectorAll('.dbc-visual-item').length).toBe(5);
    act(() => { root.unmount(); });
    vi.useRealTimers();
    document.body.removeChild(container);
  });

  test('clock visual renders a clock face SVG', () => {
    vi.useFakeTimers();
    const { container, root } = mountBoard2();
    walkDetectiveTo([6, 6], 'clock');
    const visual = container.querySelector('.dbc-visual--clock');
    expect(visual).toBeTruthy();
    expect(visual.querySelector('.dbc-clock-face')).toBeTruthy();
    expect(visual.querySelectorAll('.dbc-clock-hand').length).toBeGreaterThanOrEqual(1);
    act(() => { root.unmount(); });
    vi.useRealTimers();
    document.body.removeChild(container);
  });

  test('measure visual renders a ruler', () => {
    vi.useFakeTimers();
    const { container, root } = mountBoard2();
    walkDetectiveTo([6, 6], 'rope');
    const visual = container.querySelector('.dbc-visual--measure');
    expect(visual).toBeTruthy();
    expect(visual.querySelector('.dbc-ruler')).toBeTruthy();
    act(() => { root.unmount(); });
    vi.useRealTimers();
    document.body.removeChild(container);
  });
});

// ─── Case 3: The Mystery Behind Mr. B ───────────────────────────────────

describe('BOARD_CASE_3 schema validation', () => {
  test('has no validation errors', () => {
    const errors = validateBoardCase(BOARD_CASE_3);
    expect(errors).toEqual([]);
  });

  test('has 4 suspects', () => {
    expect(BOARD_CASE_3.suspects).toHaveLength(4);
  });

  test('culprit is null (no student culprit)', () => {
    expect(BOARD_CASE_3.culprit).toBeNull();
  });

  test('has 7 objects', () => {
    expect(BOARD_CASE_3.objects).toHaveLength(7);
  });

  test('has 3 elimination rules', () => {
    expect(BOARD_CASE_3.eliminationRules).toHaveLength(3);
  });

  test('has deduction field with interactive structure', () => {
    expect(BOARD_CASE_3.deduction).toBeDefined();
    expect(BOARD_CASE_3.deduction.npc.id).toBe('mr-b');
    expect(BOARD_CASE_3.deduction.opening).toHaveLength(2);
    expect(BOARD_CASE_3.deduction.cards).toHaveLength(5);
    expect(BOARD_CASE_3.deduction.connections).toHaveLength(3);
    expect(BOARD_CASE_3.deduction.connections[0].portraitRevealStage).toBe(1);
    expect(BOARD_CASE_3.deduction.connections[0].hint).toBeTruthy();
    expect(BOARD_CASE_3.deduction.connections[2].portraitRevealStage).toBe(3);
    expect(BOARD_CASE_3.deduction.blueButton.prompt).toBeTruthy();
    expect(BOARD_CASE_3.deduction.blueButton.caseSummaries).toHaveLength(3);
    expect(BOARD_CASE_3.deduction.portraitInteraction.pointer).toBe(true);
    expect(BOARD_CASE_3.deduction.blueButton.caseCards).toEqual(['listening', 'heard', 'music']);
  });

  test('all 4 suspects are referenced in elimination rules or not eliminated', () => {
    const eliminated = new Set();
    BOARD_CASE_3.eliminationRules.forEach(r => r.eliminates.forEach(id => eliminated.add(id)));
    expect(eliminated.size).toBe(3);
    expect(eliminated.has('cleo')).toBe(false);
  });

  test('has currentThoughts with note, prompt, and aha kinds', () => {
    const kinds = new Set(BOARD_CASE_3.currentThoughts.map(t => t.kind));
    expect(kinds.has('note')).toBe(true);
    expect(kinds.has('prompt')).toBe(true);
    expect(kinds.has('aha')).toBe(true);
  });

  test('has confession with mrBNote', () => {
    expect(BOARD_CASE_3.confession.mrBNote).toBeTruthy();
    expect(BOARD_CASE_3.confession.culpritNarrative).toBeTruthy();
  });
});

describe('shouldShowDeduction', () => {
  test('returns false when spec has no deduction field', () => {
    const state = createInitialState(BOARD_CASE_1);
    expect(shouldShowDeduction(BOARD_CASE_1, state)).toBe(false);
  });

  test('returns false when no suspects eliminated', () => {
    const state = createInitialState(BOARD_CASE_3);
    expect(shouldShowDeduction(BOARD_CASE_3, state)).toBe(false);
  });

  test('returns true when all eliminable suspects are eliminated (Cleo remains)', () => {
    const state = createInitialState(BOARD_CASE_3);
    state.eliminatedIds = ['pip', 'bruno', 'digby'];
    expect(shouldShowDeduction(BOARD_CASE_3, state)).toBe(true);
  });

  test('returns false when only some eliminable suspects eliminated', () => {
    const state = createInitialState(BOARD_CASE_3);
    state.eliminatedIds = ['pip', 'bruno'];
    expect(shouldShowDeduction(BOARD_CASE_3, state)).toBe(false);
  });

  test('returns false for Case 2 even with all students eliminated', () => {
    const state = createInitialState(BOARD_CASE_2);
    state.eliminatedIds = ['nora', 'ethan', 'mira', 'suki'];
    expect(shouldShowDeduction(BOARD_CASE_2, state)).toBe(false);
  });
});

// ─── Confession → Note → Reward flow (UI) ────────────────────────────

describe('Board confession flow (Confession → Note → Reward)', () => {
  const originalMatchMedia = window.matchMedia;

  const renderConfession = (story) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay
          story={story}
          onComplete={onComplete}
          onBack={onBack}
          initialState={{ phase: 'confession', boardSnapshot: {} }}
        />
      );
    });
    const clickText = (text) => {
      const btn = [...container.querySelectorAll('button')].find(b => (b.textContent || '').toLowerCase().includes(text.toLowerCase()));
      expect(btn).toBeTruthy();
      act(() => { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    };
    return { container, root, onComplete, onBack, clickText };
  };

  beforeEach(() => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test('all three cases carry the short-confession flow fields', () => {
    for (const c of [BOARD_CASE_1, BOARD_CASE_2, BOARD_CASE_3]) {
      expect(c.confession.confessionLines.length).toBeGreaterThanOrEqual(2);
      expect(c.confession.confessionLines[0]).toBeTruthy();
      expect(typeof c.confession.teacherLine).toBe('string');
      expect(typeof c.confession.rewardSubtitle).toBe('string');
      expect(typeof c.confession.giveLine).toBe('string');
      expect(c.confession.mrBNote).toBeTruthy();
    }
  });

  test('Case 2 shows Suki confession in two short speech bubbles', () => {
    const { container, root } = renderConfession(BOARD_CASE_2);
    expect(container.querySelectorAll('.dbc-speech-bubble').length).toBe(2);
    expect(container.textContent).toContain('make the trophy special');
    expect(container.textContent).toContain('worried everyone');
    expect(container.textContent).toContain('Suki');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('Continue advances from confession to the folded-note CTA', () => {
    const { container, root, clickText } = renderConfession(BOARD_CASE_2);
    expect(container.querySelector('.dbc-note-cta')).toBeNull();
    clickText('Continue');
    expect(container.querySelector('.dbc-note-cta')).toBeTruthy();
    expect(container.textContent).toContain('A NOTE FOR YOU');
    expect(container.textContent).toContain('OPEN');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('opening the note reveals Mr. B message then the reward step', () => {
    const { container, root, clickText } = renderConfession(BOARD_CASE_2);
    clickText('Continue');
    clickText('OPEN');
    expect(container.querySelector('.dbc-mrB-note--open')).toBeTruthy();
    expect(container.textContent).toContain('some clues are meant to be heard');
    expect(container.querySelector('.dbc-teacher-bubble')).toBeTruthy();
    expect(container.textContent).toContain('The trophy is safe');
    clickText('Continue');
    expect(container.textContent).toContain('CASE SOLVED');
    expect(container.textContent).toContain('The Golden Acorn is safe');
    expect(container.textContent).toContain('+60 XP');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });

  test('final Continue invokes onBack from the reward step', () => {
    const { root, onBack, clickText } = renderConfession(BOARD_CASE_2);
    clickText('Continue');
    clickText('OPEN');
    clickText('Continue');
    clickText('Continue');
    expect(onBack).toHaveBeenCalledTimes(1);
    act(() => { root.unmount(); });
  });

  test('reward stars follow hint usage', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onComplete = vi.fn();
    const onBack = vi.fn();
    let root;
    act(() => {
      root = createRoot(container);
      root.render(
        <BoardCasePlay story={BOARD_CASE_1} onComplete={onComplete} onBack={onBack}
          initialState={{ phase: 'confession', boardSnapshot: {} }} />
      );
    });
    const clickText = (t) => {
      const btn = [...container.querySelectorAll('button')].find(b => (b.textContent || '').toLowerCase().includes(t.toLowerCase()));
      act(() => { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    };
    clickText('Continue');
    clickText('OPEN');
    clickText('Continue');
    expect(container.textContent).toContain('CASE SOLVED');
    expect(container.textContent).toContain('⭐'.repeat(3));
    expect(container.textContent).toContain('+60 XP');
    act(() => { root.unmount(); });
    document.body.removeChild(container);
  });
});

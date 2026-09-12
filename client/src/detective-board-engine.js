/**
 * DETECTIVE BOARD ENGINE — pure, framework-free logic
 *
 * Investigation + Learning engines for the board-based crime-scene case
 * type (`type: 'board'`) in the Math Detective Agency. No React, no DOM,
 * no randomness: every function is a pure transform of (state, spec).
 *
 * The board spec lives in `detective-board-cases.js`; the React shell lives
 * in `detective-board-app.jsx`. Cases 2+ are pure data additions — this
 * engine is complete.
 *
 * Difficulty bands are SILENT: the story never mentions them. The band
 * simply decides which E/M/H variant of a math clue is shown next.
 */

// ─── Difficulty bands ────────────────────────────────────────────────
// Index into this array is the band number stored on state.band.
export const BAND_LEVELS = ['easy', 'medium', 'hard'];

export const CATEGORY_TAGS = {
  identity: { emoji: '🕵️', label: 'Who' },
  time: { emoji: '⏰', label: 'When' },
  location: { emoji: '📍', label: 'Where' },
  motive: { emoji: '💡', label: 'Why' },
};

// ─── Tolerant answer check (mirrors detective-app.jsx semantics) ──────
export function checkDetectiveAnswer(correctAnswer, userAnswer) {
  const trimmed = String(userAnswer).trim();
  if (trimmed === String(correctAnswer)) return true;
  const numUser = parseFloat(trimmed);
  const numCorrect = parseFloat(correctAnswer);
  if (!isNaN(numUser) && !isNaN(numCorrect)) {
    return Math.abs(numUser - numCorrect) < 0.01;
  }
  return false;
}

// ─── Board model ─────────────────────────────────────────────────────

export function isBlocked(spec, x, y) {
  const blocked = spec.blocked || [];
  return blocked.some(([bx, by]) => bx === x && by === y);
}

export function isInBounds(spec, x, y) {
  const size = spec.gridSize || 12;
  return x >= 0 && y >= 0 && x < size && y < size;
}

/** Returns the object whose cell is [x, y], or null. */
export function objectAt(spec, x, y) {
  const objects = spec.objects || [];
  return objects.find(o => o.cell[0] === x && o.cell[1] === y) || null;
}

export function objectEvidenceId(object) {
  return object && object.evidence ? object.evidence.id : null;
}

/**
 * The unlocksProfile entries of an object. Lives at the top level OR nested
 * inside the investigation/observation block (data prefers the nested form).
 */
export function profileUnlocks(object) {
  if (object && Array.isArray(object.unlocksProfile)) return object.unlocksProfile;
  if (object && object.investigation && Array.isArray(object.investigation.unlocksProfile)) {
    return object.investigation.unlocksProfile;
  }
  if (object && object.observation && Array.isArray(object.observation.unlocksProfile)) {
    return object.observation.unlocksProfile;
  }
  return [];
}

/** Validates a board spec at dev-load / test time. Returns string[] of problems. */
export function validateBoardSpec(spec) {
  const problems = [];
  if (!spec) { return ['spec is null']; }
  if (spec.type !== 'board') problems.push('type must be "board"');
  if (spec.gridSize !== 12) problems.push('gridSize must be 12');
  if (!Array.isArray(spec.playerStart) || spec.playerStart.length !== 2) problems.push('playerStart must be [x, y]');
  else {
    if (!isInBounds(spec, spec.playerStart[0], spec.playerStart[1])) problems.push('playerStart out of bounds');
    if (isBlocked(spec, spec.playerStart[0], spec.playerStart[1])) problems.push('playerStart on a blocked cell');
  }

  const suspectIds = (spec.suspects || []).map(s => s.id);
  const culprit = spec.culprit;
  if (culprit !== null && culprit !== undefined && !suspectIds.includes(culprit)) problems.push('culprit is not a suspect');

  const evidenceIds = [];
  const objectCells = [];

  (spec.objects || []).forEach(obj => {
    if (!obj.cell || obj.cell.length !== 2) { problems.push(`object "${obj.id}" has no cell`); return; }
    if (!isInBounds(spec, obj.cell[0], obj.cell[1])) problems.push(`object "${obj.id}" out of bounds`);
    if (isBlocked(spec, obj.cell[0], obj.cell[1])) problems.push(`object "${obj.id}" is on a blocked cell`);
    const cellKey = `${obj.cell[0]},${obj.cell[1]}`;
    if (objectCells.includes(cellKey)) problems.push(`two objects share cell [${cellKey}]`);
    objectCells.push(cellKey);

    const cats = Object.keys(CATEGORY_TAGS);
    if (!cats.includes(obj.category)) problems.push(`object "${obj.id}" has invalid category "${obj.category}"`);
    if (!obj.clueType || !['investigation', 'observation'].includes(obj.clueType)) {
      problems.push(`object "${obj.id}" has invalid clueType`);
    }

    if (obj.evidence) {
      if (evidenceIds.includes(obj.evidence.id)) problems.push(`duplicate evidence id "${obj.evidence.id}"`);
      evidenceIds.push(obj.evidence.id);
    }

    const unlocks = profileUnlocks(obj);
    unlocks.forEach(u => {
      if (!suspectIds.includes(u.suspectId)) problems.push(`unlocksProfile in "${obj.id}" references unknown suspect "${u.suspectId}"`);
      else {
        const suspect = spec.suspects.find(s => s.id === u.suspectId);
        if (suspect && !(u.field in suspect.profile)) problems.push(`unlocksProfile in "${obj.id}" references unknown field "${u.field}" of "${u.suspectId}"`);
      }
    });

    if (obj.clueType === 'investigation') {
      if (!obj.investigation) { problems.push(`investigation object "${obj.id}" missing investigation block`); return; }
      const m = obj.investigation.math || {};
      if (!m.easy || !m.medium || !m.hard) problems.push(`object "${obj.id}" needs easy/medium/hard variants`);
      else {
        const answers = [m.easy.answer, m.medium.answer, m.hard.answer];
        if (new Set(answers.map(String)).size !== 1) problems.push(`object "${obj.id}" variants must share one answer (evidence value)`);
      }
      if (!Array.isArray(obj.investigation.hints) || obj.investigation.hints.length !== 2) {
        problems.push(`object "${obj.id}" needs exactly 2 hints`);
      }
    } else if (obj.clueType === 'observation') {
      if (!obj.observation || !obj.observation.text) problems.push(`observation object "${obj.id}" missing observation text`);
    }
  });

  (spec.eliminationRules || []).forEach(rule => {
    if (!evidenceIds.includes(rule.evidenceId)) problems.push(`eliminationRule references unknown evidence "${rule.evidenceId}"`);
    rule.eliminates.forEach(sid => {
      if (!suspectIds.includes(sid)) problems.push(`eliminationRule "${rule.evidenceId}" references unknown suspect "${sid}"`);
      if (sid === culprit) problems.push(`eliminationRule "${rule.evidenceId}" eliminates the culprit "${sid}" — forbidden`);
    });
  });

  // Invariant 4 (relaxed): every suspect has ≥1 unlockable slot; every
  // elimination evidence reveals ≥1 relevant field of the eliminated suspect.
  const unlockMap = {}; // suspectId -> Set(field)
  (spec.objects || []).forEach(obj => {
    profileUnlocks(obj).forEach(u => {
      if (!unlockMap[u.suspectId]) unlockMap[u.suspectId] = new Set();
      unlockMap[u.suspectId].add(u.field);
    });
  });
  (spec.suspects || []).forEach(s => {
    if (!unlockMap[s.id] || unlockMap[s.id].size === 0) {
      problems.push(`suspect "${s.id}" has no unlockable profile slot`);
    }
  });
  (spec.eliminationRules || []).forEach(rule => {
    rule.eliminates.forEach(sid => {
      const revealed = (spec.objects || []).find(o => o.evidence && o.evidence.id === rule.evidenceId);
      const fields = profileUnlocks(revealed)
        .filter(u => u.suspectId === sid)
        .map(u => u.field);
      if (fields.length === 0) {
        problems.push(`elimination evidence "${rule.evidenceId}" reveals no field of eliminated suspect "${sid}"`);
      }
    });
  });

  // currentThoughts references real evidence and matches the kind shapes
  const allThoughts = spec.currentThoughts || [];
  allThoughts.forEach((t, i) => {
    (t.afterEvidenceIds || []).forEach(eid => {
      if (!evidenceIds.includes(eid)) problems.push(`currentThoughts[${i}] references unknown evidence "${eid}"`);
    });
    const kinds = ['prompt', 'note', 'aha'];
    if (!kinds.includes(t.kind)) problems.push(`currentThoughts[${i}] has invalid kind "${t.kind}"`);
    if (t.kind === 'note') {
      if (!t.emoji) problems.push(`currentThoughts[${i}] note needs an emoji`);
      if (!t.text) problems.push(`currentThoughts[${i}] note needs text`);
    }
    if (t.kind === 'prompt') {
      if (!t.question) problems.push(`currentThoughts[${i}] prompt needs a question`);
      if (!Array.isArray(t.compare) || t.compare.length < 2) {
        problems.push(`currentThoughts[${i}] prompt needs a compare list of at least 2 suspects`);
      } else {
        t.compare.forEach((row, r) => {
          if (!row || !suspectIds.includes(row.suspectId)) {
            problems.push(`currentThoughts[${i}] compare[${r}] references unknown suspect "${row && row.suspectId}"`);
          }
        });
      }
      if (!t.hint1 || !t.hint2) problems.push(`currentThoughts[${i}] prompt needs hint1 and hint2`);
      const hasRule = (spec.eliminationRules || []).some(r => (t.afterEvidenceIds || []).includes(r.evidenceId));
      if (!hasRule) problems.push(`currentThoughts[${i}] prompt evidence has no elimination rule`);
    }
    if (t.kind === 'aha' && !t.text) problems.push(`currentThoughts[${i}] aha needs text`);
    if (t.afterEliminated !== undefined && typeof t.afterEliminated !== 'boolean') {
      problems.push(`currentThoughts[${i}] afterEliminated must be a boolean`);
    }
  });

  return problems;
}

// ─── State ───────────────────────────────────────────────────────────

export function createInitialState(spec, opts = {}) {
  const initialBand = typeof opts.initialBand === 'number'
    ? Math.min(2, Math.max(0, opts.initialBand))
    : 0;
  return {
    playerPos: [...(spec.playerStart || [0, 0])],
    collectedEvidenceIds: [],
    eliminatedIds: [],
    band: initialBand,
    hintsUsedPerObject: {},
    bandCorrectStreak: 0,
    bandWrongStreak: 0,
    correctCount: 0,
    wrongCount: 0,
    totalHintsUsed: 0,
  };
}

// ─── Movement ────────────────────────────────────────────────────────

/**
 * Move the player one tile. Pure — returns a NEW state or an error.
 * Returns { ok, state, event } where event is:
 *   { type: 'object', objectId }            — stepped onto a fresh object
 *   { type: 'already-collected', objectId } — stepped onto a collected object
 *   { type: 'moved' }                       — plain step
 * or { ok: false, reason: 'edge' | 'blocked', state }.
 */
export function movePlayer(state, spec, dx, dy) {
  const [x, y] = state.playerPos;
  const nx = x + dx;
  const ny = y + dy;
  if (!isInBounds(spec, nx, ny)) {
    return { ok: false, reason: 'edge', state };
  }
  if (isBlocked(spec, nx, ny)) {
    return { ok: false, reason: 'blocked', state };
  }
  const next = { ...state, playerPos: [nx, ny] };
  const obj = objectAt(spec, nx, ny);
  if (obj) {
    const collected = next.collectedEvidenceIds.includes(objectEvidenceId(obj));
    return {
      ok: true,
      state: next,
      event: { type: collected ? 'already-collected' : 'object', objectId: obj.id },
    };
  }
  return { ok: true, state: next, event: { type: 'moved' } };
}

// ─── Learning: variant selection ─────────────────────────────────────

/** Which E/M/H key the current state selects for an object. */
export function currentVariantKey(state, object) {
  const used = state.hintsUsedPerObject[object.id] || 0;
  if (used >= 2) return 'easy'; // after 2 hints → simpler fallback
  const band = Math.min(2, Math.max(0, state.band));
  return BAND_LEVELS[band];
}

/** Returns the variant object { narrative, question, answer } to display. */
export function getMathFor(state, object) {
  const key = currentVariantKey(state, object);
  const m = (object.investigation && object.investigation.math) || {};
  return m[key] || m.easy || { narrative: '', question: '', answer: 0 };
}

// ─── Learning: hint ladder & answers ─────────────────────────────────

/**
 * Register an answer to the currently displayed variant of `object`.
 * Returns { ok, state, correct, variant, event } where event is
 *   { type: 'clue-found', evidenceId }  — evidence collected
 *   { type: 'wrong' }                   — answer incorrect, interaction stays open
 */
export function registerAnswer(state, spec, object, answer) {
  const variant = getMathFor(state, object);
  const correct = checkDetectiveAnswer(variant.answer, answer);
  if (!correct) {
    return {
      ok: true,
      state,
      correct: false,
      variant,
      event: { type: 'wrong' },
    };
  }

  const evidenceId = objectEvidenceId(object);
  const collected = state.collectedEvidenceIds.includes(evidenceId);
  let next = {
    ...state,
    correctCount: state.correctCount + 1,
    bandWrongStreak: 0,
    bandCorrectStreak: state.bandCorrectStreak + 1,
    collectedEvidenceIds: collected ? state.collectedEvidenceIds : [...state.collectedEvidenceIds, evidenceId],
  };

  // Silent band nudge: 2 consecutive correct → band up; reset streak.
  if (next.bandCorrectStreak >= 2) {
    next = { ...next, band: Math.min(2, next.band + 1), bandCorrectStreak: 0 };
  }

  return {
    ok: true,
    state: next,
    correct: true,
    variant,
    event: { type: 'clue-found', evidenceId },
  };
}

/** Record a wrong answer (band nudge down) WITHOUT consuming a hint. */
export function recordWrong(state) {
  let next = {
    ...state,
    wrongCount: state.wrongCount + 1,
    bandCorrectStreak: 0,
    bandWrongStreak: state.bandWrongStreak + 1,
  };
  if (next.bandWrongStreak >= 2) {
    next = { ...next, band: Math.max(0, next.band - 1), bandWrongStreak: 0 };
  }
  return next;
}

/** Consume the next hint for an object. Returns { state, hintIndex, offeredEasy }. */
export function consumeHint(state, objectId) {
  const used = state.hintsUsedPerObject[objectId] || 0;
  const nextUsed = used + 1;
  return {
    state: {
      ...state,
      hintsUsedPerObject: { ...state.hintsUsedPerObject, [objectId]: nextUsed },
      totalHintsUsed: state.totalHintsUsed + 1,
    },
    hintIndex: used, // the index (0-based) of the hint just shown
    offeredEasy: nextUsed >= 2,
  };
}

/** Wrong answer + consume a hint in one step (the interactive ladder). */
export function handleWrong(state, object) {
  const wrong = recordWrong(state);
  return consumeHint(wrong, object.id);
}

/**
 * Collect a pure observation clue (no math, no band nudge, no streak).
 * Returns { state, event: { type: 'clue-found', evidenceId } }.
 */
export function collectObservation(state, object) {
  const evidenceId = objectEvidenceId(object);
  const collected = state.collectedEvidenceIds.includes(evidenceId);
  return {
    state: {
      ...state,
      collectedEvidenceIds: collected ? state.collectedEvidenceIds : [...state.collectedEvidenceIds, evidenceId],
    },
    event: { type: 'clue-found', evidenceId },
  };
}

// ─── Notebook & suspect board ────────────────────────────────────────

/** True if the evidence is allowed to eliminate the suspect. */
export function evidenceEliminates(spec, evidenceId, suspectId) {
  const rules = spec.eliminationRules || [];
  return rules.some(r => r.evidenceId === evidenceId && r.eliminates.includes(suspectId));
}

/**
 * Apply an elimination attempt.
 * Returns { ok, state } with ok:false and reason when invalid:
 *   'not-collected' | 'already' | 'no-contradiction'
 */
export function applyElimination(state, spec, evidenceId, suspectId) {
  if (!state.collectedEvidenceIds.includes(evidenceId)) {
    return { ok: false, reason: 'not-collected', state };
  }
  if (state.eliminatedIds.includes(suspectId)) {
    return { ok: false, reason: 'already', state };
  }
  if (!evidenceEliminates(spec, evidenceId, suspectId)) {
    return { ok: false, reason: 'no-contradiction', state };
  }
  return {
    ok: true,
    reason: 'valid',
    state: { ...state, eliminatedIds: [...state.eliminatedIds, suspectId] },
  };
}

export function remainingSuspects(spec, state) {
  return (spec.suspects || []).filter(s => !state.eliminatedIds.includes(s.id));
}

/** True when every non-culprit suspect has been eliminated. */
export function onlyCulpritRemains(spec, state) {
  const remaining = remainingSuspects(spec, state);
  return remaining.length === 1 && remaining[0].id === spec.culprit;
}

/** The suspect to accuse, or null until only the culprit remains. */
export function accusedSuspect(spec, state) {
  if (!onlyCulpritRemains(spec, state)) return null;
  return remainingSuspects(spec, state)[0];
}

/** True when the spec has a deduction phase and every eliminable suspect (those referenced in eliminationRules) has been eliminated. */
export function shouldShowDeduction(spec, state) {
  if (!spec.deduction) return false;
  const eliminableIds = new Set();
  (spec.eliminationRules || []).forEach(r => r.eliminates.forEach(id => eliminableIds.add(id)));
  if (eliminableIds.size === 0) return false;
  return [...eliminableIds].every(id => state.eliminatedIds.includes(id));
}

/**
 * Gradual profile reveal: '???' for every slot whose unlocking clue has
 * not been collected. Builds a suspectId:field → evidenceId index from the
 * spec's unlocksProfile entries.
 */
export function getRevealedProfile(suspect, spec, collectedEvidenceIds) {
  const unlockIndex = {}; // `suspectId:field` -> evidenceId
  (spec.objects || []).forEach(obj => {
    if (!obj.evidence) return;
    profileUnlocks(obj).forEach(u => {
      unlockIndex[`${u.suspectId}:${u.field}`] = obj.evidence.id;
    });
  });

  const profile = {};
  for (const field of Object.keys(suspect.profile || {})) {
    const evidenceId = unlockIndex[`${suspect.id}:${field}`];
    profile[field] = evidenceId && collectedEvidenceIds.includes(evidenceId)
      ? suspect.profile[field]
      : '???';
  }
  return profile;
}

/**
 * Whether a currentThoughts entry is active: its afterEvidenceIds are all
 * collected, and — when the entry opts in via afterEliminated — every
 * non-culprit suspect has been eliminated (only the culprit remains).
 */
function isThoughtActive(spec, t, collectedEvidenceIds, eliminatedIds) {
  if (!(t.afterEvidenceIds || []).every(id => collectedEvidenceIds.includes(id))) return false;
  if (t.afterEliminated) {
    const nonCulprits = (spec.suspects || []).map(s => s.id).filter(id => id !== spec.culprit);
    if (nonCulprits.length === 0) return false;
    return nonCulprits.every(id => eliminatedIds.includes(id));
  }
  return true;
}

/**
 * Compute active Current Thoughts entries: each currentThoughts entry whose
 * afterEvidenceIds are all collected becomes active (in spec order).
 * Entries are structured objects ({ kind: 'prompt'|'note'|'aha', ... }).
 */
export function getNotebookLines(spec, collectedEvidenceIds, eliminatedIds = []) {
  return (spec.currentThoughts || [])
    .filter(t => isThoughtActive(spec, t, collectedEvidenceIds, eliminatedIds));
}

/**
 * The single most recent thought: the last active entry (in spec order).
 * Returns [] when nothing has been collected yet. Keeps the notebook to
 * one thought at a time by default.
 */
export function getLatestThought(spec, collectedEvidenceIds, eliminatedIds = []) {
  const active = getNotebookLines(spec, collectedEvidenceIds, eliminatedIds);
  return active.length > 0 ? [active[active.length - 1]] : [];
}

/**
 * Thoughts unlocked by one specific evidence: every active currentThoughts
 * entry whose afterEvidenceIds include the given evidence (and are all
 * collected). Returns [] when that evidence unlocks nothing active.
 */
export function getThoughtsForEvidence(spec, collectedEvidenceIds, evidenceId, eliminatedIds = []) {
  return (spec.currentThoughts || [])
    .filter(t => (t.afterEvidenceIds || []).includes(evidenceId)
      && isThoughtActive(spec, t, collectedEvidenceIds, eliminatedIds));
}

/**
 * The suspect a deduction prompt rules out, resolved from the spec's
 * eliminationRules (single source of truth — the answer is never stored on
 * the prompt itself). Returns the first eliminated suspect id for any of the
 * prompt's evidence, or null when there is none.
 */
export function promptAnswer(spec, promptEntry) {
  const rules = spec.eliminationRules || [];
  const rule = promptEntry.evidenceId
    ? rules.find(r => r.evidenceId === promptEntry.evidenceId)
    : rules.find(r => (promptEntry.afterEvidenceIds || []).includes(r.evidenceId));
  return rule && rule.eliminates.length > 0 ? rule.eliminates[0] : null;
}

/** Evidence items in collection order, for the notebook. */
export function getCollectedEvidence(spec, collectedEvidenceIds) {
  return (spec.objects || [])
    .filter(o => o.evidence && collectedEvidenceIds.includes(o.evidence.id))
    .map(o => ({
      id: o.evidence.id,
      text: o.evidence.text,
      category: o.category,
      emoji: o.emoji,
      name: o.name,
    }));
}

/** Suspects in the poster, each with revealed profile + eliminated flag. */
export function getPosterSuspects(spec, state) {
  return (spec.suspects || []).map(s => ({
    ...s,
    profile: getRevealedProfile(s, spec, state.collectedEvidenceIds),
    eliminated: state.eliminatedIds.includes(s.id),
  }));
}

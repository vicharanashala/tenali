# Plan: 2-Phase LA Quiz (Adaptive → Real-Life)

## Goal
Modify the **existing Linear Algebra module** (LinearAlgebraApp.jsx) so that
clicking the "Take Quiz (10 questions)" button drops the user straight into
the quiz with **no Easy/Medium/Hard picker**, then unlocks **5 real-life
application questions** on pass (≥ 7/10) or surfaces a **Try Again** button
on fail.

No new module, no new home-screen tile. The user already has a "Linear Algebra"
tile that routes to LinearAlgebraApp — that tile is the only entry point.

---

## What already exists (don't rebuild)

- `LinearAlgebraApp` in `client/src/LinearAlgebraApp.jsx` (~3480 lines)
- `phase` state machine: `'modules' | 'intro' | 'play' | 'quiz' | 'missionquiz'`
- `'missionquiz'` phase already has:
  - 10-question quiz (mqTotal = 10)
  - Difficulty picker (easy/medium/hard/adaptive) — **to be removed**
  - Adaptive level tracking (mqAdaptiveLevel)
  - Pass threshold 80% — **to change to 70% (≥7/10)** to match Matrix Mystics plan
  - Pass message that mentions "real-life applications" — **to be wired up**
- The "Take Quiz (10 questions)" button at line 3340 fires `startMissionQuiz`
- `linearalgebra-api` and `la-mission-quiz-api` are existing endpoints that
  generate algorithmic questions per-mission

## What was added in the previous (wrong) step

- New `MatrixMysticsApp` component (~440 lines) in `client/src/App.jsx`
- New home-screen tile `{ key: 'matrixmystics', name: 'Matrix Mystics', ... }`
- New mode entry `matrixmystics: MatrixMysticsApp` in `modeMap`
- Server endpoint `/matrixmystics-api/question` with `?phase=realapp` flag
- Bank files `linearalgebra/matrixmystics/m{1..6}.json` (1855 curated MCQs)
- 10 draft files in `linearalgebra/matrixmystics/_drafts/`

**Action on previous step:**
- Home tile → ✓ already removed
- `modeMap` entry → ✓ already removed
- `MatrixMysticsApp` component → **delete** (no longer used)
- Bank files & drafts → **keep** (richer curated content source for the new quiz)
- Server endpoint `matrixmystics-api` → **keep and adapt** (use as the new
  question source for the LA mission quiz instead of `la-mission-quiz-api`)

---

## Plan

### Phase 1: Remove MatrixMysticsApp component
- Delete the `MatrixMysticsApp` function and its `KeyboardShortcuts` helper
  from `client/src/App.jsx` (lines 54350–54800)
- Delete the `MATRIX_MYSTICS_PHASE1_LEN` etc. constants
- Verify `npx vite build` still compiles

### Phase 2: Rewrite LinearAlgebraApp mission quiz
**Target file:** `client/src/LinearAlgebraApp.jsx`

**Section 2a — remove the difficulty picker (lines 3350-3362)**
- Delete the `mqDifficulty` state and the `<div className="checkbox-group">`
  with Easy/Medium/Hard/Adaptive radio buttons
- Always run adaptive mode (`effectiveMqDifficulty` derives from
  `mqAdaptiveLevel` which already tracks score)

**Section 2b — change the question source**
- Replace `la-mission-quiz-api` URL with `matrixmystics-api` URL, scoped
  to the current module via `&module={currentModule}`
- Pass `&phase=realapp` for the Phase 2 (real-life) round
- Optional: keep `linearalgebra-api` as a fallback if matrixmystics-api
  ever returns 404 for a given module

**Section 2c — wire the pass → RLA flow**
- When `mqScore / mqTotal >= 0.7` (≥7/10) at finish:
  - Set new state `mqRlaUnlocked = true`
  - Show "Begin Real-Life Applications" button on the finished screen
  - Clicking it enters a new mini-phase `mqRla` (separate from `missionquiz`)
- New `mqRla` sub-phase: load 5 questions from
  `matrixmystics-api?difficulty=hard&phase=realapp&module={currentModule}`
- Track `mqRlaScore`, `mqRlaQuestions`, `mqRlaResults`
- After 5 questions, show RLA result screen
- "Restart Quiz" returns to the start of `missionquiz` phase

**Section 2d — wire the fail → retry**
- When `mqScore / mqTotal < 0.7`:
  - Show "Try Again" button on the finished screen
  - Clicking it calls `mqStart` again (resets score, qNum, results, but keeps
    the current mission)

**Section 2e — final result screen**
- After Phase 2 (RLA) completes, show summary:
  - Phase 1 score: N/10
  - Phase 2 score: M/5
  - Total coins earned
  - "Restart Quiz" button

### Phase 3: Server-side adjustments (if needed)
**Target file:** `server/index.js`

The `?phase=realapp` filter is already in place (added in step 2b52b38).
Verify the matrixmystics-api endpoint:
- `?difficulty=easy` → returns any mcq (adaptive start)
- `?difficulty=hard` → returns any mcq OR RLA (existing behaviour)
- `?difficulty=hard&phase=realapp` → returns RLA only (added in 2b52b38)
- `?module=N` → restricts to module N's topics (already supported)

No new server work required.

### Phase 4: Test
- Build client: `cd client && npx vite build`
- Restart server if endpoint behaviour changed
- Manual test: open Linear Algebra → any mission → answer correctly → check
  Phase 2 unlocks; intentionally fail → check retry button visible
- Lint check on changed file

### Phase 5: Commit & push
- One commit with LinearAlgebraApp changes
- One commit with MatrixMysticsApp deletion (if kept separate)
- Push to origin/new_f

---

## Estimated scope
- **Delete:** ~440 lines (MatrixMysticsApp component, constants, KeyboardShortcuts)
- **Modify:** ~80 lines in LinearAlgebraApp.jsx (remove picker, add RLA phase)
- **Add:** ~120 lines (new mqRla state, screens, server fetch glue)

**Risk areas:**
- The existing mq* state variables are heavily used; need to be careful not
  to break the existing "play phase" pre-quiz flow
- Server's `matrixmystics-api/question` currently doesn't accept
  `&missionId=` (only module); mission → module mapping needs verification
- The `phase === 'missionquiz'` rendered block has been stable — touching it
  risks regression to other parts of the LA app

---

## Open questions for the user
1. Pass threshold: ≥7/10 (70%) or stick with existing 80%?
2. After Phase 2 fail, retry just Phase 2 or restart Phase 1?
3. After Phase 1 fail, retry just Phase 1 or restart the entire mission?
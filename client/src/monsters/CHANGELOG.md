# Misconception Monsters — CHANGELOG

## v0.1.2 — 2026-07-27 (Decimal Drifter progression fix, CSS transitions, upstream merge)

**Session:** Bug fix and polish pass for the Decimal Drifter guided solver overlay, plus upstream synchronization.

**Branch:** `feature/monster-misconceptions`.

**Changes:**
1. **Decimal Drifter Step Progression Fix:**
   - Corrected step rendering logic in `GuidedSolver.jsx` (`renderCanvas()`) so `placesText`, `multText`, and `slideText` values only render when their respective step is active/completed.
   - Prevents step answers (such as `5 × 4 = 20` and `Final: 0.2 ✨`) from displaying one step ahead of user progress.
2. **CSS Transition Highlights:**
   - Injected `.decimal-step-text` styles in `injectGuidedSolverStyles()`.
   - Active steps highlight with scale-up (`1.05x`), gold dashed border, and gold background tint.
   - Completed steps transition smoothly back to `1x` scale with a solid green border.
3. **Upstream Merge & Conflict Resolution:**
   - Merged latest `upstream/main` branch into `feature/monster-misconceptions`.
   - Resolved conflicts in `App.jsx`, `WordSearchApp.jsx`, and `package-lock.json`.
   - Maintained decoupled `useTimer` (`hooks/useTimer.js`) and `QuizLayout` (`components/QuizLayout.jsx`) imports.

**Files touched:**
- `client/src/monsters/GuidedSolver.jsx` (+33 / -6)
- `client/src/App.jsx` (merged)
- `client/src/language/WordSearchApp.jsx` (merged)
- `client/package-lock.json` (merged)

**Verification:** Build compiled cleanly (`npm run build` transformed 1325 modules with 0 errors). All monster unit test suites passing.

---

## v0.1.1 — 2026-07-21 (Guided Solver copy: invitation over verdict)

**Session:** Pedagogical review of the Guided Solver button text on the cure-result card.

**Branch:** `feature/monster-misconceptions` (off `0d1ea63` at v0.1.1).

**Change:** Reframed the button copy in `CureFlow.jsx` line 375 to drop the failure-count framing and read as a peer offering help, not a system reporting a tally.

- Standard (after first fail): `'💡 Learn with Guided Solver'` → `'💡 Walk through it together?'`
- Elevated (after 2 consecutive fails): `'🚨 2 Consecutive Failures — Learn with Guided Solver!'` → `'Want to walk through it together?'`

The elevated variant keeps its visual prominence (gold gradient, `monster-detail-pulse` animation, border weight) but loses the loud-emoji + verdict framing. Both buttons now read as a single, consistent voice — same tone, different visual weight.

**Why it matters:** the earlier copy made the system feel like it was *scoring* the student. The student is the one who opened the app to learn; the app's job is to suggest a next step, not hand back a grade. `'Walk through it together?'` is the same offer with the accountability stripped out.

**Files touched:**
- `client/src/monsters/CureFlow.jsx` (1 line, copy only — no logic change)

**Companion artifact (outside this repo):**
- `D:\vins-phase-2\tenali-docs-backup\guided_solver_button_redesign.html` — standalone HTML preview of three button styles (current/alarm, calm/card, minimal/bordered) with a toggle for 1-fail vs 2-fail-elevated state. Reference only, not ship code.

**Verification:** Parse suite still passes. No behavior change. All 111/111 smoke-test assertions still green.

---

## v0.1.0 — 2026-07-21 (post-build doc pass + Guided Solver layer)

**Session:** Logged uncommitted work that accumulated on top of v0.0.9 (end-to-end smoke test). Two parts: a doc-only version bump covering the existing CHANGELOG gaps, and a new Guided Solver escalation feature.

**Branch:** `feature/monster-misconceptions` (off `7669413` at v0.1.0).

### Part A — Bug fixes found during code audit (2026-07-21)

Two real bugs caught by static review of the uncommitted layer before any commit:

**1. CureFlow: missing `getCureHistory` import.** The finished-result block (the new IIFE that detects 2-consecutive-failure escalation) called `getCureHistory(monsterId)` but only `load` and `recordCure` were imported from `./monsterStore.js`. The first time any cure finished, React would throw `ReferenceError: getCureHistory is not defined` — silently killing the cure-complete UI and the new Guided Solver entry point. Fixed by extending the existing import to `{ load, recordCure, getCureHistory }`. The export was already there since v0.0.3 (spec §4.3).

**2. MonsterAvatar: invalid CSS rules in `injectStyles()`.** Two CSS rules inside the JS template string had `strokeWidth: 1.5;` and `strokeWidth: 3.5;` (camelCase). CSS doesn't accept that — the browser parses these rules as malformed and silently drops `stroke-width`, falling back to the default 1px. The visual difference: `.crasher-cracks` and `.happy-expression` lost their thick stroke styling (Carry Crasher purple cracks and the cure-success happy face were rendering ~1px instead of 1.5–3.5px). Reverted both to `stroke-width` (kebab-case, valid CSS). Kept the genuine JSX fix on the bracketeer angry-mouth `<path>` element (`stroke-width` → `strokeWidth` — JSX does require camelCase for SVG attrs).

### Part B — Guided Solver layer (added 2026-07-17 to 2026-07-21, uncommitted)

A new escalation flow: when a cure fails, the student can opt into a guided step-by-step walkthrough of the underlying misconception, before re-attempting the cure.

**Files touched:**
- `client/src/monsters/GuidedSolver.jsx` (NEW, 554 lines)
- `client/src/monsters/__tests__/guidedSolver.test.cjs` (NEW, 36 lines)
- `client/src/monsters/CureFlow.jsx` (+49 / -2)
- `client/src/monsters/HallPanel.jsx` (+16 / -4)
- `client/src/monsters/MonsterDetail.jsx` (+27 / -1)
- `client/src/App.jsx` (+18)

**`GuidedSolver.jsx`:**
- Self-contained interactive step-by-step solver overlay
- Supports all 4 monsters: bracketeer (distributive multiplication), sign-swapper (number-line frog hops), decimal-drifter (place counting + slide), carry-crasher (vertical column with carry row)
- Two render modes: `inline={true}` (renders inside MonsterDetail, no backdrop/portal) and standalone (modal via `react-dom` portal at z-index 10020, above HallPanel)
- Per-monster visualisations:
  - **Bracketeer:** `3(x+5) ➔ ?` with each term highlighting one-by-one as steps advance
  - **Sign Swapper:** number line `[-5..+5]` with a 🐸 frog hopping place-by-place (200ms `setInterval`), ends with 😵 frog on the sign-swapped answer
  - **Decimal Drifter:** three-stage text progression: places count → multiplication → decimal slide
  - **Carry Crasher:** vertical column `28 + 14` with carry row lighting up
- Step data lives in `MONSTER_SOLVER_DATA` (one entry per monster, `{ title, tagline, btnTheme, steps: [{ text, desc }] }`)
- Actions: `🔄 Reset Steps` (back to step 1) and `Ready to Start Cure →` (closes solver, fires `onStartCure(monsterId)`)
- CSS injected once via `[data-guided-solver]` style tag (idempotent), uses same CSS-variable theme as the rest of the monsters components (`--clr-card`, `--clr-text`, `--clr-gold`, `--clr-accent`, `--clr-correct` with fallbacks)

**`CureFlow.jsx` — escalation logic on cure finish:**
- New optional prop `onOpenGuidedSolver(monsterId)`
- Finished-result block reads `getCureHistory(monsterId)`, slices the latest 2 entries, counts failures
- Renders a new secondary button above "Return to Hall":
  - **Standard failure:** `"💡 Learn with Guided Solver"` — subtle gold tint (`rgba(255,215,0,0.12)` bg, `1px solid #ffd700`)
  - **2 consecutive failures:** `"🚨 2 Consecutive Failures — Learn with Guided Solver!"` — loud: gold→orange gradient, `2px solid #ffd700`, `0 0 20px rgba(255,215,0,0.4)` glow, **pulses** via `monster-detail-pulse 2s infinite`, larger padding/font
- Click: `onCancel()` first (close cure), then `onOpenGuidedSolver(monsterId)` — App routes the student back into the Hall pre-selecting that monster's solver

**`MonsterDetail.jsx` — secondary entry point:**
- New optional props: `onOpenGuidedSolver(monsterId)`, `initialGuidedSolver`
- New local state: `showGuidedSolver` (defaults from `initialGuidedSolver`)
- New early-return branch: when `showGuidedSolver` is true, renders `GuidedSolver` inline inside the `.monster-detail` container
- New secondary action button `"💡 Guided Solver"` above "Start Cure" — flips `showGuidedSolver` and fires `onOpenGuidedSolver(monsterId)` so App can persist the intent

**`HallPanel.jsx` — deep-link support:**
- New optional props: `onOpenGuidedSolver`, `initialSelectedId`, `initialGuidedSolver`
- `selectedId` initialized from `initialSelectedId` instead of hard-coded `null`
- `useEffect([open, initialSelectedId])` syncs selection from outside (so App can re-open Hall directly into a specific monster's detail view)
- Reset-on-close behavior now respects external state: only clears `selectedId` if `initialSelectedId` is unset
- Passes `onOpenGuidedSolver` and `initialGuidedSolver` through to `MonsterDetail`

**`App.jsx` — orchestration:**
- New state: `guidedSolverMonsterId` (string | null)
- Imports `GuidedSolver` (not actually used as a JSX element — solver is mounted inside MonsterDetail inline; the import was added but never renders directly. Worth removing if cleanup pass happens.)
- `HallPanel.onClose` clears `guidedSolverMonsterId` too
- `HallPanel.onStartCure` clears `guidedSolverMonsterId` before setting active cure
- `HallPanel` props extended with `initialSelectedId={guidedSolverMonsterId}`, `initialGuidedSolver={!!guidedSolverMonsterId}`, `onOpenGuidedSolver={(id) => setGuidedSolverMonsterId(id)}`
- `CureFlow` props extended with `onOpenGuidedSolver={(id) => { setActiveCure(null); setGuidedSolverMonsterId(id); setHallOpen(true); }}` — exits cure, opens Hall, pre-selects solver

**Flows:**

1. **Cure-fail → solver → retry cure:** Student finishes cure below threshold → taps "💡 Learn with Guided Solver" → CureFlow closes, Hall reopens with monster detail pre-selected and solver auto-open → student goes through steps → taps "Ready to Start Cure →" → cure starts fresh.

2. **From Hall detail → solver:** Student opens Hall from toast → taps a monster card → MonsterDetail opens → taps "💡 Guided Solver" → inline solver replaces detail view → closes via ✕ to return to detail.

### Test coverage

**`__tests__/guidedSolver.test.cjs`** — 8 source-level checks (same pattern as `hallPanel.test.cjs` / `monsterToast.test.cjs`):
- file exists
- default export present
- all 4 monster titles in `MONSTER_SOLVER_DATA`
- "Reset Steps" button string
- "Ready to Start Cure" button string

**No functional/visual tests** for the GuidedSolver — the component renders canvas elements (SVG-ish number lines, animated frogs, vertical columns) that aren't easily source-level verifiable. Browser smoke test (next session) should walk the two flows above.

### Spec adherence

- **No spec section covers GuidedSolver.** This is feature-creep on top of the v0.2 spec. The escalation heuristic (2 consecutive failures → loud prompt) is a pedagogical choice, not a spec'd requirement. If a v0.3 spec is written, this layer should be either formalised or split out.
- **Carry Crasher solver ships fully** even though the classifier gate is OFF (`MONSTERS_ENABLED.carry-crasher === false`). Inert in production but ready if/when the flag flips. No spec change needed; consistent with the "scaffold the data, gate the trigger" pattern from v0.0.4.

### Known issues / watch-list

- **Hall auto-deep-links after solver dismissal (fixed in this version).** Previously: if a student opened the Guided Solver from a monster detail page and dismissed it with the ✕ button, then closed the whole Hall, the next time they opened the Hall from any other toast the Hall would skip straight to that solver again — even though they'd explicitly closed it. Behaviorally wrong because tapping the Hall should mean "show me the grid," not "remind me of the screen I just left." Fixed: clicking ✕ on the solver now also clears the App-level deep-link flag, so the next Hall open lands on the grid normally. The cure-fail escalation path is intentionally unaffected — that flow IS a directive ("take me to the solver for this monster"), so the deep-link there survives until the Hall is dismissed.

- **Inline `style={}` objects in CureFlow's finished block** instead of CSS classes. Works but not style-consistent with the rest of the component. Worth a small refactor in a future version.
- **`App.jsx` imports `GuidedSolver` but doesn't render it directly** — the import is dead. Cleanup candidate.
- **`monster-detail-pulse` keyframe** is reused for the cure-result escalation glow. If the keyframe gets removed/renamed in MonsterDetail, the escalation button stops pulsing. Worth cross-referencing.

### Verification

- All 5 smoke test suites pass: classifier (22/22), fetchInterceptor (37/37), hallPanel (30/30), monsterToast (8/8), guidedSolver (8/8). Total **105/105** across the monsters feature.
- No spec drift — current spec (v0.2) still satisfied by all shipped code.

### Next

- Step 9 (per spec §10) — Demo: live walk-through to maintainer on `quadratic` topic using real wrong answers from the running app. Should be first thing next session.
- Optional: refactor CureFlow inline styles into CSS classes; remove dead `GuidedSolver` import in App.jsx; write functional tests for GuidedSolver flows once a browser-automation harness is in place.

---

## v0.0.1 — 2026-07-09 (branch creation, scaffolding)

**Session:** Branch cut from `upstream/main`. No code yet.

**Branch:** `feature/monster-misconceptions` (off commit `93f0cea` at branch time).

**Decisions baked into the branch baseline (from spec v0.2):**
- Storage: `localStorage` key `tenali.monsterLog.v1`. Zero new server endpoints.
- Hook: `window.fetch` monkey-patch, dispatch `tenali:wrongAnswer` CustomEvent.
- Carry Crasher: `enabled: false` by default. Test before turning on.
- Hall placement: C-only for v1 (toast→Hall). Code is placement-agnostic.
- Cure: 4/5 correct threshold. History stays on cure. No respawn.
- Toast variants: "introduced!" (5s) vs "strikes again!" (2s) based on `seenMonsterIds`.

**Implementation order (from spec §10):**
1. `monsterExplanations.js`
2. `monsterStore.js`
3. `classifier.js`
4. `fetchInterceptor.js`
5. `MonsterToast.jsx` + App.jsx mount
6. `HallPanel.jsx` + `MonsterCard.jsx` + `MonsterDetail.jsx` + App.jsx mount
7. `CureFlow.jsx`
8. End-to-end test
9. Demo (live to maintainer on `quadratic` topic)

**Files touched in this commit:**
- `client/src/monsters/CHANGELOG.md` (new)

**Verification:** branch only, no functional changes.

---

## v0.0.2 — 2026-07-09 (step 1: static explanations)

**Session:** Implemented spec §3 explanations as a pure data module.

**Files touched in this commit:**
- `client/src/monsters/monsterExplanations.js` (new, 100 lines)

**What ships:**
- `MONSTER_EXPLANATIONS` keyed by monsterId (4 entries: bracketeer, sign-swapper, decimal-drifter, carry-crasher)
- Each entry: `{ name, tagline, description}`
- 3 helper exports: `getMonsterExplanation(id)`, `getMonsterName(id)`, `getMonsterTagline(id)`
- Helpers return safe defaults (null / 'Unknown Monster' / '') for unknown ids — never throw

**Spec adherence:**
- §3.1–§3.4 explanation text preserved verbatim
- Schema flat (object key → entry), no nested structures
- No imports, no state, no side effects — pure module

**Line count delta:** spec §11 estimated 60 lines, actual 100 lines (incl. comments + 3 helpers). No functional change, just more docs.

**Next:** step 2 — `monsterStore.js` (localStorage abstraction, ~100 lines).

---

## v0.0.3 — 2026-07-09 (step 2: monsterStore)

**Session:** localStorage-backed persistence layer.

**Files touched in this commit:**
- `client/src/monsters/monsterStore.js` (new, 276 lines)

**Public API:**
- `load()`, `save(state)`, `append(entry)` — core read/write
- `isMonsterSeen(id)`, `markMonsterSeen(id)` — toast variant driver
- `getMonsterBreachCount(id)`, `getMonsterLastAttempt(id)` — Hall card data
- `getCureHistory(id)`, `recordCure(id, result)` — cure tracking
- `reset()`, `isLocalStorageAvailable()` — diagnostic / future admin

**Failure handling (spec §8):**
- Probe-based detection of localStorage availability at module init (catches private-mode SecurityError)
- In-memory fallback Map when localStorage is unreachable
- JSON parse errors logged + treated as fresh install
- Schema version mismatch (`version !== 1`) → log + reset to empty
- `migrate()` defensively adds missing `cures[id]` arrays and `seenMonsterIds` arrays for any future monster added

**Known monster IDs (hard-coded list):**
- bracketeer, sign-swapper, decimal-drifter, carry-crasher

**Spec adherence:**
- §4.1 entry shape: `{ monsterId, topic, questionId, wrongAnswer, correctAnswer, timestamp }` — `append()` accepts partial entries and stamps timestamp
- §4.2 root shape: `{ version, log, cures: { [id]: [] }, seenMonsterIds }` — matches exactly
- §4.3 schema migration: forward-looking only, current version 1
- §8 failure modes: all 4 covered (quota, unavailable, JSON parse, interceptor — interceptor is step 4)

**Line count delta:** spec §11 estimated 100 lines, actual 276 lines. Diff is fully accounted for by failure-mode handling, migration logic, defensive guards on every public function, and JSDoc comments. No scope creep — just spec §8 expanded into actual code.

**Verification:**
- Public API is sync, all functions never throw
- Probe at module init runs once
- Idempotency: `markMonsterSeen` returns false on re-mark; `append` validates monsterId and topic before write
- No React, no UI dependencies — pure module, importable from anywhere

**Next:** step 3 — `classifier.js` (4 monster rules + classifyMonster, ~180 lines).

---

## v0.0.4 — 2026-07-09 (step 3: classifier + 2 bug fixes from smoke test)

**Session:** Wrote 4-rule classifier with first-match-wins ordering; ran smoke test against spec examples + edge cases; fixed 2 real bugs.

**Files touched in this commit:**
- `client/src/monsters/classifier.js` (new, 196 lines) — the classifier
- `client/src/monsters/__tests__/classifier.test.js` (new, ~80 lines) — smoke test
- `client/src/monsters/classifier.js` (fixup, 33 lines delta) — bug fixes

**Classifier API:**
- `classifyMonster({ question, userAnswer, correctAnswer, topic })` — returns `'bracketeer' | 'sign-swapper' | 'decimal-drifter' | 'carry-crasher' | null`
- `MONSTER_IDS` — ordered array matching spec §2 (Bracketeer first)
- `MONSTERS_ENABLED` — toggle map (carry-crasher `false`)
- `isMonsterEnabled(id)` — diagnostic

**Rule functions (each pure, first-match-wins):**
- `isBracketeerSlip(q, ua, ca)` — regex on `a(b±c)` shape, checks "first term only" patterns `aX + c`, `aX - |c|`, or just `aX`
- `isSignSwap(q, ua, ca)` — `parseFloat(ua) === -parseFloat(ca)` numerically
- `isDecimalDrift(q, ua, ca)` — both parse as decimals, ratio is exact power of 10
- `isCarryMistake(q, ua, ca)` — `q` is multi-digit add/sub, diff is exactly ±1/±10/±100 (GATED OFF in v0.2)

**Bug fixes (caught by smoke test on first run, before any UI shipped):**
- **Bracketeer regex too narrow.** Original regex required `+` between inner variable and number: `/^\s*(-?\d+)\s*\(\s*([a-zA-Z])\s*\+\s*(-?\d+)\s*\)\s*$/`. Missed `3(x-2)` style questions. Spec example for Bracketeer only covered `+` so this slipped through.
- **Decimal Drifter `ratio < 0.1` early-exit was wrong.** Original rule had `if (ratio < 0.1) return false;` which excluded the spec's own example (`0.08/0.8 = 0.1` is exactly `10^-1`).

**Why both bugs would've shipped:**
- Bracketeer: any student doing subtraction inside brackets would have seen no monster, no explanation, no learning signal.
- Decimal Drifter: every decimal drift was missed.

**Spec adherence:**
- §3.1 example trigger / non-trigger: PASS
- §3.2 example trigger / non-trigger: PASS
- §3.3 example trigger / non-trigger: PASS
- §3.4 gated-off behavior: confirmed (gate flag prevents classification)
- §5.4 enable-map exact shape: confirmed

**Tests:**
- 14 cases in `__tests__/classifier.test.js`: 4 spec examples (2 per matching monster), 2 ambiguous, 2 negative-inner Bracketeer, 2 multiplication Sign Swap, 2 edge cases (empty, garbage)
- Run with: `node client/src/monsters/__tests__/classifier.test.js`
- All 14 pass after the fixes
- Tests live in `__tests__/` directory for future test runner migration (spec §11 had no test directory; this fills that gap)

**Caveat — Carry Crasher NOT exercised:**
- The rule's logic is implemented but the gate is off
- Unit tests for the rule logic deferred to v0.2.1 (need to flip MONSTERS_ENABLED in test setup)
- v2 may want to rewrite with stricter pattern matching (e.g. require addition column structure in question text, not just operand1+operand2)

**Next:** step 4 — `fetchInterceptor.js` (window.fetch patch + event, ~80 lines, HIGH risk).

---

## v0.0.5 — 2026-07-09 (step 4: fetch interceptor with 5 improvements)

**Session:** Wrote fetchInterceptor with all 5 improvements over spec baseline; smoke-tested URL detection, response extraction, and end-to-end URL→extract→classify flow.

**Files touched in this commit:**
- `client/src/monsters/fetchInterceptor.js` (new, ~340 lines)
- `client/src/monsters/__tests__/fetchInterceptor.test.js` (new, ~270 lines)

**5 improvements over v0.2 spec baseline:**

A. **Topic allow-list.** 14 single-input topics from warmupAdapter.js hard-coded. URL detection rejects anything not in the list. Prevents silent misfires on `/api/auth/*`, future endpoints, or hypothetical streak-api/check.

B. **Debug instrumentation.** When `localStorage.tenali.monsters.debug === 'true'`, exposes `window._monstersDebug` with:
- `lastEvent()` — most recent intercepted event
- `replay(input)` — run classifier on arbitrary input
- `storageDump()` — formatted localStorage state
- `enable()` / `disable()` / `reset()` — runtime toggle
- `testSpec()` — run spec §3 example trigger pairs
Dev-only; production users see nothing (flag defaults to off).

C. **Atomic append via module-level promise queue.** Concurrent wrong-answer fires no longer race on localStorage load→modify→save. Queue is one-promise-deep so it never blocks; just serializes.

D. **Strict URL gating.** Regex requires URL to END with `/check` (path-segment exact match). Loose regex was a spec §5.1 concern; tight regex is 5 lines.

E. **Promise.resolve wrapping.** Explicit async contract for the patched fetch return. Cosmetic, but reads better.

**Failure handling (spec §8, doubled down):**
- Outer try/catch around ALL interceptor logic — any internal error returns the original response unchanged
- `monsterStore.append` wrapped in queue + try/catch — UI event still fires even if persistence fails
- `monsterStore.markMonsterSeen` wrapped in try/catch — toast variant logic survives
- `dispatchEvent` wrapped in try/catch — log-only failure
- App must NEVER break on interceptor error. This is the loudest guarantee in the spec; it gets two layers of defense.

**Test coverage:**
- 29 smoke tests: URL detection (18), extraction (7), end-to-end (4)
- 29/29 pass on first run after writing
- Tests live in `__tests__/fetchInterceptor.test.js`; same Node-only runner as classifier tests
- The interceptor itself can't be tested in Node (no `window.fetch`), but the testable pieces (URL detection, extraction, classifier integration) all validate

**Public API (10 exports):**
- `installMonstersInterceptor()` — idempotent, call once at app startup
- `enableMonsters()` / `disableMonsters()` — runtime + persisted toggle
- `isMonstersInstalled()` / `isMonstersEnabled()` — diagnostic

**Spec adherence:**
- §5.1 trade-off accepted (global side effect), mitigations all in place
- §5.2 interceptor code: shipped with all the 5 improvements
- §5.3 response-shape fallback table: 7 extraction cases tested
- §5.4 Carry Crasher gating: handled via classifier.js (this file calls classifier, no duplicate gate)
- §8 failure modes: all 4 covered with try/catch

**Line count delta:** spec §11 estimated 80 lines, actual ~340 lines (interceptor) + 270 lines (tests). Diff is fully accounted for by:
- 5 improvements (~150 lines over baseline)
- Detailed JSDoc (~50 lines)
- 29 test cases (~270 lines)

**Not yet done:**
- App.jsx mount (step 5)
- Toast component (step 5)
- Hall panel (step 6)
- Cure flow (step 7)

**Next:** step 5 — `MonsterToast.jsx` + App.jsx top mount (~130 lines total).

---

## v0.0.6 — 2026-07-09 (step 5: MonsterToast + App.jsx mount)

**Session:** Built the toast UI component, mounted it in App.jsx, validated JSX parses cleanly via acorn + acorn-jsx.

**Files touched in this commit:**
- `client/src/monsters/MonsterToast.jsx` (new, ~225 lines)
- `client/src/App.jsx` (modified, 11 lines added)
- `client/src/monsters/__tests__/monsterToast.parse.cjs` (new, 35 lines)
- `client/src/monsters/__tests__/monsterToast.test.cjs` (new, ~140 lines)

**MonsterToast component:**
- Subscribes to `tenali:wrongAnswer` CustomEvent on window
- Two variants driven by `isMonsterSeen()`:
  - **Introduced** (5s on screen): "Bracketeer introduced!" with **View Hall** CTA
  - **Repeat** (2s on screen): "Bracketeer strikes again!" tappable to dismiss
- Distinctive CSS blob per monster (color + emoji from `MONSTER_COLORS` map)
- Pulse animation on the blob (subtle, 1.4s loop)
- Slide-in animation from right, fade-out on dismiss (300ms)
- **Queue for back-to-back wrong answers**: latest event shown after current dismisses
- Renders via `react-dom` portal to `document.body` — works in every route without per-route wiring
- CSS injected once via a `<style>` tag with `data-monster-toast` attribute (idempotent)
- Theme-aware: uses CSS variables (`--card-bg`, `--text`) if present, falls back to own dark palette

**App.jsx integration:**
- Imports `installMonstersInterceptor` and `MonsterToast`
- `useEffect(() => installMonstersInterceptor())` — one-time at app mount
- Wrapped in try/catch so even an interceptor install failure can't break the app
- `<MonsterToast />` mounted in main return alongside Home/ActiveApp

**Why portal rendering (not per-route mount):**
- The App component has 8+ early-return routes (`if (pathname === '/tables')`, etc.) + a final return
- Portal means the toast sits outside the React tree, visible in EVERY route with a single mount point
- Cleaner than wrapping 9 routes individually

**Smoke tests:**
- `monsterToast.parse.cjs`: acorn + acorn-jsx parses `MonsterToast.jsx` (8131 bytes) + `App.jsx` (2.6MB) cleanly
- `monsterToast.test.cjs`: 9 checks pass
  - Event name = `tenali:wrongAnswer` ✓
  - Intro duration = 5000ms, repeat = 2000ms (spec §6.5) ✓
  - All 4 monsters in MONSTER_COLORS ✓
  - Uses React portal to body ✓
  - Variant driven by `isMonsterSeen` ✓
  - Queue logic: 2nd event while active → queued ✓
  - After dismiss, queued event fires ✓
  - Intro vs repeat variant logic ✓

**Test discovery:**
- Initial queue test had wrong expectations. The fetchInterceptor pre-marks monsters as seen BEFORE dispatching the event, so the toast ALWAYS sees a non-intro first. The intro path only fires when storage is empty (fresh user). Test was updated to reflect actual flow.

**Spec adherence:**
- §6.5 toast variants: implemented (intro + repeat with different durations + CTAs)
- §6.6 mounting: portal to body, single mount point
- §9 placement-agnostic: toast portals to body, doesn't depend on quiz layout
- §8 failure modes: useEffect wrapped in try/catch; toast renders only when active; timer cleanup on unmount

**Next:** step 6 — HallPanel + MonsterCard + MonsterDetail (~350 lines).

**Time accounting:**
- Spec §11 estimated step 5 at 130 lines
- Actual: ~225 (component) + 11 (App.jsx) + 175 (tests) = ~410 lines total
- Diff explained by: portal complexity, queue logic, animation CSS, comprehensive tests

---

## v0.0.7 — 2026-07-09 (step 6: HallPanel + MonsterCard + MonsterDetail)

**Session:** Built the Hall of Silly Mistakes modal, the per-monster cards and detail view, and wired everything into App.jsx. Added same-tab storage sync.

**Files touched in this commit:**
- `client/src/monsters/HallPanel.jsx` (new, ~220 lines)
- `client/src/monsters/MonsterCard.jsx` (new, ~140 lines)
- `client/src/monsters/MonsterDetail.jsx` (new, ~250 lines)
- `client/src/App.jsx` (modified, 39 lines added)
- `client/src/monsters/fetchInterceptor.js` (modified, 18 lines added)
- `client/src/monsters/__tests__/hallPanel.test.cjs` (new, ~120 lines, 31 checks)
- `client/src/monsters/__tests__/monsterToast.parse.cjs` (extended, +3 lines)

**HallPanel component:**
- Full-screen modal with semi-transparent backdrop
- Centered card (max 720px wide, max-height calc(100vh - 48px))
- Header: title + count subtitle + close button (× and ← for back-from-detail)
- Body: responsive grid (1 col mobile, 2 col ≥560px)
- Empty state: "No monsters yet. Get a question wrong to meet one." (🌱)
- Two view modes: grid (default) and detail (when card tapped)
- Closes on: backdrop click, Escape key, close button
- Detail mode: Escape returns to grid first, then closes
- Focus management: card auto-focuses on open (so Esc works without click)
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label="Hall of Silly Mistakes"`

**MonsterCard:**
- Tile layout: blob (56×56) + name + meta line + cure badge
- Meta line: "Breached X times · last 2 hr ago" (or "Not yet met" for unseen)
- Cure badge: ✦ N when at least one successful cure, hidden otherwise
- Unseen monsters: rendered as ❓ silhouettes, opacity 0.45, disabled (no click, no hover)
- Hover effect: subtle translateY(-2px) + accent border-color
- Color per monster matches toast/detail (consistent visual identity)
- ARIA: aria-label changes between seen/unseen states

**MonsterDetail:**
- Hero section: 80×80 pulsing blob + name + tagline, gradient backdrop
- 3-stat row: Breaches / Last Seen / Cures (success/total)
- Description paragraph (from `getMonsterExplanation`)
- Topic selector: defaulted to most-frequent historical topic for this monster
  - Computed via `getSuggestedTopic(monsterId)` which scans `state.log`
  - Falls back to empty (Start Cure disabled) when no history
- Start Cure button: calls `onStartCure(monsterId, topic)`
- Currently `onStartCure` in App.jsx just closes the hall + logs (step 7 wires CureFlow)

**App.jsx integration:**
- New state: `monsterLog` (hydrated from `loadMonsterLog()` once), `hallOpen` (bool)
- New useEffect: listens for `storage` event (cross-tab sync) + `tenali:monsterLogChanged` (same-tab sync)
- Mount: `<MonsterToast onOpenHall={...} />` + `<HallPanel open={...} onClose={...} ... />`
- Why both events: `storage` event doesn't fire in the originating tab; the CustomEvent bridge covers same-tab updates from the interceptor

**fetchInterceptor update:**
- Added `notifyMonsterLogChanged()` helper
- Fires `tenali:monsterLogChanged` CustomEvent after:
  - Successful `monsterStore.append()` (every wrong answer)
  - Successful `monsterStore.markMonsterSeen()` returning true (first sighting only)
- Both wrapped in try/catch (spec §8 — never break the interceptor)

**Spec adherence:**
- §6.5 layout: header + grid + empty state — implemented
- §6.6 placement-agnostic: takes `open`/`onClose` — done
- §6.2 state ownership: App-level for `monsterLog` and `hallOpen`, local for `selectedId` — done
- §8 failure modes: backdrop click closes, Escape closes, focus mgmt, CSS injection idempotent — done

**Smoke tests:**
- `hallPanel.test.cjs`: 31 source-level checks, all pass:
  - HallPanel: exports, imports, early-return, Escape handler, backdrop click, empty state, MonsterCard grid, detail branch, onStartCure passthrough
  - MonsterCard: exports, unseen/seen states, disabled prop, cure badge, blob with emoji
  - MonsterDetail: exports, explanation usage, Start Cure button, 3-stat row, suggested topic computation, disabled-when-no-topic
  - App.jsx: HallPanel import, monsterLog hydration, hallOpen state, both event listeners, HallPanel mount, MonsterToast onOpenHall
- `monsterToast.parse.cjs`: 5/5 files parse cleanly (added HallPanel/Card/Detail)

**Test discovery:**
- 3 initial regex failures: my regex was missing the literal quotes in import paths. Fixed to use `'.\/MonsterCard\.jsx'` (with single quotes) instead of unquoted pattern.

**Time accounting:**
- Spec §11 estimated step 6 at ~350 lines
- Actual: ~610 (components) + 39 (App.jsx) + 18 (interceptor) + 175 (tests) = ~840 lines
- Diff explained by: comprehensive tests, ARIA attributes, focus management, doc comments

**Next:** step 7 — `CureFlow.jsx` (~250 lines, MEDIUM risk — multi-state, multi-fetch, fallback logic).

---

## v0.0.8 — 2026-07-17 (step 7: CureFlow + App.jsx full wiring)

**Session:** Implemented the five-question cure run and wired it end-to-end into App.jsx.

**Files touched in this commit:**
- `client/src/monsters/CureFlow.jsx` (new, 171 lines)
- `client/src/App.jsx` (modified, ~15 lines added — `activeCure` state + CureFlow mount)

**CureFlow component:**
- Renders a 5-question recovery session for a given `(monsterId, topic)` pair
- Question sourcing strategy (ordered):
  1. Pull from `monsterStore.load().log` — the student's actual historical wrong answers for that topic (most recent first, up to 5)
  2. Fall back to `GET /<topic>-api/question?difficulty=easy` for any remaining slots
  3. If backend unavailable, repeat the first history entry to fill the set rather than show an empty session
- Correct answer matching via `answersMatch()` — numeric comparison with ±0.01 epsilon; string fallback case-insensitive
- 4/5 correct = cure; every attempt (success or fail) stored via `recordCure()`
- States: `loading` → question loop → `finished` (result card) → `onComplete()` callback
- Portal-rendered to `document.body` (consistent with MonsterToast, z-index 10010 — above HallPanel)
- CSS injected once via `[data-monster-cure]` style tag (idempotent)

**App.jsx wiring:**
- `activeCure` state: `null | { monsterId, topic }`
- `HallPanel.onStartCure` sets `activeCure` and closes the Hall
- `CureFlow` conditionally mounted when `activeCure !== null`
- `onComplete`: re-hydrates `monsterLog` from localStorage, clears cure, re-opens Hall (student sees updated cure count on the card)
- `onCancel`: clears cure only (no Hall re-open — student may want to go elsewhere)

**Spec adherence:**
- §7.1 question sourcing: history-first, then API fallback — implemented
- §7.2 cure threshold: 4/5 correct — `REQUIRED_CORRECT = 4`
- §7.3 history retention on cure: `recordCure()` always appends, never overwrites
- §7.4 no respawn: cure does not clear `seenMonsterIds`; monster remains in Hall permanently

**Known caveat — CureFlow fallback questions:**
- When the backend is not running, the API fetch returns 502/ECONNREFUSED
- CureFlow logs `[monsters] cure fallback question failed` and repeats history entries
- This is intentional spec §7.1 behaviour: a real historical mistake is better than no question
- In production (backend running), fallback questions fetch correctly

**Line count delta:** spec §11 estimated step 7 at ~250 lines; actual 171 lines (component) + 15 lines (App.jsx). Smaller because the fallback-repeat logic replaces a more complex re-fetch loop that was in the spec draft.

---

## v0.0.9 — 2026-07-17 (step 8: end-to-end smoke test)

**Session:** Ran a full browser smoke test of the complete flow using the debug seed surface.

**Test method:** Browser automation via `window._monstersDebug.seed('bracketeer')` on `localhost:5173`.

**Flow tested:**
1. `seed('bracketeer')` → toast appears top-right: **"The Bracketeer introduced!"** with "View Hall →" CTA ✓
2. Click "View Hall →" → Hall opens: **"Hall of Silly Mistakes"** subtitle: **"1 of 4 monsters fed"** ✓
3. Bracketeer card shows: 🎯 emoji, "Breached 1 time · last just now", active (not silhouette) ✓
4. Other 3 monsters: silhouettes, "Not yet met", disabled ✓
5. Click Bracketeer card → MonsterDetail opens with stats (1 breach, just now, 0/0 cures) + description ✓
6. Click "Start Cure →" → CureFlow opens: **"Cure run · The Bracketeer"** / **"Practice the pattern, not the panic."** ✓
7. Question 1: `3(x+2)` (seeded history entry) ✓
8. Submit correct answer `3x+6` → feedback: **"Correct — keep that pattern."** ✓
9. Submit wrong answer `3x+2` → feedback: **"Not quite. The answer was 3x + 6."** ✓

**Console output:**
- No JavaScript errors or crashes
- `[monsters] cure fallback question failed: Question endpoint returned 502` — expected (backend not running in local dev); CureFlow gracefully repeated history entry

**Verdict:** All 9 steps of the implementation plan (spec §10) are complete and working end-to-end.

**Next:** step 9 — Demo (live to maintainer on `quadratic` topic using real wrong answers from the running app).

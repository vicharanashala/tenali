# Contributor Onboarding — Meka Sai Sowjanya

## 1. What is Tenali?

Tenali is an open-source adaptive mathematics learning and practice platform inspired by the quick wit and problem-solving prowess of the historical scholar Tenali Raman. The platform addresses a common challenge in mathematics education: students often memorize static question banks or skip foundational concepts without developing deep algorithmic understanding.

Operating in the educational technology domain, Tenali provides an interactive environment where mathematical problems are generated dynamically on the fly rather than retrieved from a pre-set database. Because questions are computed algorithmically, practice possibilities are virtually infinite and never repeat verbatim. The platform serves learners across diverse proficiency levels, adapting problem difficulty in real time to match each student's mastery. Beyond individual practice drills, Tenali incorporates progressive concept exploration, animated visual labs, step-by-step solutions, interactive hint systems, real-time multiplayer arenas, and a misconception-tracking "Hall of Monsters" designed to make math intuitive, engaging, and rewarding.

---

## 2. What do you understand by Tenali (as a system)?

Architecturally, Tenali is structured as a decoupled client-server web application engineered for lightweight deployment and high responsiveness:

1. **Frontend Client (`client/`)**: Built with React 19 and Vite, the user interface delivers an interactive single-page application. Learners interact with modular topic drills, visual math playgrounds, gamified rewards (XP coins), and diagnostic evaluations. The client communicates with backend APIs using RESTful endpoints and Socket.IO for live multiplayer sessions.
2. **Backend Engine (`server/`)**: Built on Node.js and Express, the server houses the computational core of the platform. Rather than querying questions from persistent storage, 93 modular `*-api` route pairs algorithmically construct problems, validate student responses, and provide detailed step-by-step explanations via dedicated resolvers (`server/explanations.js` and `server/hints/hintResolvers.js`).
3. **Adaptive Logic & Knowledge Tracing**: The backend implements Bayesian Knowledge Tracing (`server/lib/bkt.js`) with unit test verification and a memory decay priority function for the daily warmup system (`server/lib/dailyWarmup.js`). While BKT is fully implemented as an isolated mathematical engine, it is not yet fully wired into the end-to-end learner session and mastery tracking pipeline (a task tracked under Issue #289 to connect BKT into `server/lil/masteryEngine.js`, which currently relies on streak-based thresholds).
4. **Misconception Detection Pipeline**: Subsystems such as the Monsters framework intercept client evaluation responses via custom `fetch` interceptors (`client/src/monsters/fetchInterceptor.js`), normalize user inputs against problem stem caches, classify specific cognitive misconceptions (e.g., Bracketeer for distribution errors, Sign Swapper for negative number operations), and dispatch UI feedback to reinforce foundational concepts.
5. **Data Layer & Fallbacks**: The system utilizes MongoDB through Mongoose for persistent learner profiles, auth tokens, and session telemetry, with in-memory fallbacks for development portability.

---

## 3. Current State of the Repository — What Has Been Done So Far

Tenali is an active repository with over 1,100 commits, 120+ merged pull requests, and contributions from dozens of developers. The codebase is organized into clean functional subsystems:

- **Topic Coverage**: The platform features 93 distinct API route pairs across 69 prerequisite topic areas (such as basic arithmetic, linear algebra, surds, quadratics, functions, geometry, probability, and sequences), surfaced on the home dashboard through more than 100 interactive tiles (`client/src/features/tiles.js`).
- **Interactive Labs and Visualizations**: Modules such as `VisualMathLabRedux`, `BearingsLabApp`, `CrossSectionApp`, and `WaterJugLab` provide dynamic SVG/Canvas-based visual manipulatives to anchor abstract formulas in spatial intuition.
- **Pedagogical Hint System**: A tiered hint architecture (`client/src/components/HintSystem/`) offers progressive scaffolding: Level 1 provides conceptual nudges, Level 2 offers partial steps, and Level 3 reveals step-by-step worked solutions backed by XP economy balances.
- **Misconception Architecture ("Monsters")**: Complete subsystem featuring automated fetch interception, real-time toast alerts (`MonsterToast`), progress tracking (`monsterStore.js`), interactive detail modals (`MonsterDetail.jsx`), and dedicated guided remediation flows (`GuidedSolver.jsx`, `CureFlow.jsx`).
- **Multiplayer Battle Arena**: Real-time room-based competition powered by Socket.IO (`server/battleSocket.js` and `client/src/BattleApp.jsx`).
- **Testing & Tooling**: Includes contract tests for API routes, BKT unit test suites, modular component checks, and an ESLint 9 flat configuration with a baseline suppressions registry (`client/eslint-suppressions.json`).

---

## 4. Gaps Observed in the Code

During my code inspection and lint investigation across the frontend client, I identified several concrete gaps and technical debt areas:

### Gap 1: Obsolete ESLint Baseline Suppressions Blocking Developer Workflows
- **Location**: `client/eslint-suppressions.json`
- **What is wrong**: When the repository baselined pre-existing lint errors via commit `364c491b`, it captured snapshot counts across multiple client files. Subsequent mechanical refactoring PRs (such as PR #304) cleaned up hundreds of unused variables and empty blocks across the codebase. However, `eslint-suppressions.json` was not synchronized. Because ESLint 9 treats unpruned suppressions as an error condition, contributors running targeted linting (e.g. `npx eslint src/monsters/fetchInterceptor.js`) encounter exit code 1 failures with:
  ```text
  There are suppressions left that do not occur anymore. Consider re-running the command with `--prune-suppressions`.
  ```
- **Why it matters**: Contributors are confused by failed checks on clean files, CI pipeline feedback is obscured, and technical debt builds up without automated pruning safeguards.

### Gap 2: Orphaned Module State Left from Refactored Promise Queue in `fetchInterceptor.js`
- **Location**: `client/src/monsters/fetchInterceptor.js` (lines 17–19, 82, 475)
- **What is wrong**: The file header comments describe Improvement C: *"Atomic append. monsterStore.append calls go through a module-level promise queue so concurrent wrong-answer fires don't race."* Originally, an `enqueueAppend()` helper updated `_appendQueue = _appendQueue.then(...)`. When storage persistence was switched to synchronous writes (`monsterStore.append(...)`) and `enqueueAppend` was deleted in PR #304, the module-level variable `let _appendQueue = Promise.resolve();` (line 82) and its reassignment in `reset()` (line 475) were left orphaned.
- **Why it matters**: Dead variables and outdated architectural comments mislead maintainers about how concurrency is handled during localStorage operations.

### Gap 3: Synchronous State Resets in `useEffect` in `HintModal.jsx`
- **Location**: `client/src/components/HintSystem/HintModal.jsx` (lines 16–22)
- **What is wrong**: Whenever `effectiveQuestionId` changes, an effect triggers synchronous state setters:
  ```javascript
  useEffect(() => {
    setPortalTarget(document.body);
    setUnlockedLevels({});
    setErrorMsg('');
    setLoadingLevel(null);
    setCooldownRemaining(0);
  }, [effectiveQuestionId]);
  ```
  This pattern triggers ESLint's `react-hooks/set-state-in-effect` rule because updating state directly in an effect body forces cascading re-renders. Furthermore, `portalTarget` does not need state storage since `document.body` is statically available in the browser runtime.
- **Why it matters**: Causes redundant render cycles during question transitions, degrading UI responsiveness on low-power devices.

### Gap 4: Test Assertion Drift in Standalone Component Tests
- **Location**: `client/src/monsters/__tests__/monsterToast.test.cjs` (lines 56–61)
- **What is wrong**: The test script validates component behavior using raw string inspection (`if (!src.includes('isMonsterSeen'))`). In earlier versions, `MonsterToast.jsx` directly queried `isMonsterSeen`. When monster state evaluation was refactored so that `fetchInterceptor.js` computes `isNew` upstream and passes it in the event payload, `MonsterToast.jsx` switched to reading `detail.isNew`. The test was not updated, causing `node src/monsters/__tests__/monsterToast.test.cjs` to fail with `FAIL | isMonsterSeen not called (variant logic missing)`.
- **Why it matters**: Outdated static-string unit tests produce false-negative test failures and undermine developer confidence in test runs.

---

## 5. Ideas for the Project

Based on the architectural gaps identified in Section 4, I propose the following targeted improvements:

### 1. CI Validation for Stale ESLint Baseline Suppressions
- **What**: Enhance the continuous integration lint job to validate suppression freshness, detecting and failing when obsolete or unused suppressions exist in `client/eslint-suppressions.json` so contributors are prompted to prune them before merging.
- **Why**: Prevents phantom suppression debt from accumulating and ensures clean source files are not shadowed by stale baseline entries that block contributors during local lint runs.
- **How**: ESLint 9's suppression system naturally exits with code 1 when unpruned suppressions remain. Ensure the `client-lint` job in `.github/workflows/test.yml` (and an accompanying local npm script such as `"lint:check-suppressions"`) runs ESLint without suppressing unpruned errors, reporting any obsolete entries so contributors can prune them locally using `npx eslint . --prune-suppressions` as specified in CONTRIBUTING.md.

### 2. Streamlining Concurrency and Cleanup in `fetchInterceptor.js`
- **What**: Remove the orphaned `_appendQueue` variable and update module documentation to reflect direct synchronous storage appending.
- **Why**: Cleans up dead memory allocations and keeps module contracts aligned with actual implementation behavior.
- **How**: Remove line 82 (`let _appendQueue = Promise.resolve();`) and line 475 in `reset()`. Update lines 17–19 of the docstring to document that `monsterStore.append()` runs synchronously so subsequent UI event dispatches immediately reflect updated storage state.

### 3. Declarative Component Lifecycle for `HintModal` via Keying
- **What**: Replace the reset `useEffect` in `HintModal.jsx` with key-based component recreation (`<HintModal key={effectiveQuestionId} ... />`).
- **Why**: Avoids cascading render cycles and eliminates the `react-hooks/set-state-in-effect` rule suppression completely.
- **How**: Remove the `[effectiveQuestionId]` reset effect and `portalTarget` state; initialize `unlockedLevels` directly in `useState({})` and reference `document.body` directly in `createPortal()`. Pass `key={question?.id}` at the call sites in `App.jsx` so React automatically resets state on question transitions.

### 4. Upgrade Legacy String-Matching Component Tests to DOM/Contract Tests
- **What**: Modernize standalone `.test.cjs` files (such as `monsterToast.test.cjs`) by testing exported component behavior rather than literal string contents of source files.
- **Why**: Decouples testing from internal variable names, preventing false-positive test breakages when components are cleanly refactored.
- **How**: Utilize JSDOM (already listed in `client/package.json` devDependencies) to mount the component or verify the public props contract (`detail.isNew`) instead of checking `src.includes(...)`.

---

## 6. Your Contribution

As part of my onboarding, I resolved three active technical debt issues in the Tenali repository:

### 1. Issue #268: Cleaned Obsolete ESLint Suppressions in `src/monsters/fetchInterceptor.js`
- **Problem**: Baseline `client/eslint-suppressions.json` recorded 8 suppressions (1 `no-empty`, 7 `no-unused-vars`) for `fetchInterceptor.js` that had already been resolved in source code, causing ESLint to fail on unpruned entries.
- **Action**: Removed the obsolete `"src/monsters/fetchInterceptor.js"` suppression block from `client/eslint-suppressions.json`.
- **Validation**:
  - Ran `npx eslint src/monsters/fetchInterceptor.js` — passed cleanly with 0 errors and 0 warnings (exit code 0).
  - Executed `node src/monsters/__tests__/fetchInterceptor.test.js` — all 37 unit and integration tests passed (18/18 URL detection, 15/15 extraction, 4/4 end-to-end).

### 2. Issue #271: Resolved Obsolete ESLint Suppressions for `src/components/HintSystem/HintModal.jsx`
- **Problem**: Baseline recorded 6 suppressions (2 `no-empty`, 3 `no-unused-vars`, 1 `react-hooks/set-state-in-effect`). The 5 mechanical errors were already resolved in source, leaving stale suppressions that broke targeted linting.
- **Action**: Cleaned the obsolete `no-empty` and `no-unused-vars` suppression entries in `client/eslint-suppressions.json` while maintaining the active suppression for `set-state-in-effect`.
- **Validation**:
  - Ran `npx eslint src/components/HintSystem/HintModal.jsx` — passed with 0 errors and 0 warnings (exit code 0).
  - Executed `node server/tests/test_hints_direct.js` — all 7 direct calculation tests passed.
  - Executed `node server/lib/bkt.test.js` — passed all assertions.

### 3. Issue #274: Resolved Obsolete ESLint Suppressions for `src/monsters/MonsterDetail.jsx`
- **Problem**: Baseline recorded 5 suppressions (4 `no-unused-vars`, 1 `react-hooks/set-state-in-effect`). The 4 unused variable errors (`getMonsterName`, `getMonsterTagline`, `load`, and unused helper methods) had already been eliminated in source, leaving phantom suppressions.
- **Action**: Pruned the obsolete `no-unused-vars` entries from `client/eslint-suppressions.json` while retaining the valid active suppression for `react-hooks/set-state-in-effect`.
- **Validation**:
  - Ran `npx eslint src/monsters/MonsterDetail.jsx` — passed with 0 errors and 0 warnings (exit code 0).
  - Executed `node src/monsters/__tests__/hallPanel.test.cjs` — all 30 component tests passed.
  - Executed `node src/monsters/__tests__/guidedSolver.test.cjs` — all 8 tests passed.
  - Executed `node src/monsters/__tests__/classifier.test.js` — all 22 classifier tests passed.
  - Executed `node src/monsters/__tests__/fetchInterceptor.test.js` — all 37 tests passed.

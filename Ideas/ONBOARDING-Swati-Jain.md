# Tenali Contributor Onboarding Document

**Contributor:** Swati Jain  
**GitHub:** [swatijain200701-sys](https://github.com/swatijain200701-sys)  
**Repository:** [github.com/vicharanashala/tenali](https://github.com/vicharanashala/tenali)  
**Date:** October 2026  

---

## 1. What is Tenali?

Tenali is an open-source, web-based adaptive mathematics learning and practice platform named in honor of **Tenali Raman**, the legendary 16th-century Indian scholar and court wit celebrated for his problem-solving intellect and logic. The platform operates in the educational technology domain, specifically targeting foundational and advanced mathematics education for young learners (including the Taittiriya and Tatsavit learning cohorts).

### The Problem
Traditional mathematics education and standard digital practice tools rely predominantly on static question banks, textbook exercises, or fixed-choice worksheets. These approaches suffer from fundamental limitations:
1. **Exhaustion & Memorization**: Static question sets quickly run out of fresh items, encouraging superficial pattern memorization rather than deep conceptual understanding.
2. **Fixed Difficulty**: Static problem sets fail to adapt to a child's individual pace. An advanced student is quickly bored by repetitive basic problems, while a struggling student becomes overwhelmed by premature difficulty spikes.
3. **Passive Consumption**: Conventional worksheets lack instant feedback, dynamic visual manipulatives, and real-time step-by-step explanations at the exact moment a misconception occurs.

### The Solution
Tenali fundamentally reimagines math practice by treating mathematics as an interactive, infinite, and responsive activity. Instead of querying questions from a static database, Tenali **algorithmically generates every single problem on the fly at request time**. Because questions are computed mathematically from parameterized seeds, practice is infinite, non-repeating, and tailored to the exact proficiency level of the learner.

Coupled with dynamic generation is an **in-session adaptive difficulty engine** that shifts between difficulty tiers (`easy → medium → hard → extrahard`) based on real-time performance. To maintain sustained engagement, Tenali integrates progressive conceptual disclosure ("Learn by Playing"), gamified reward loops (XP coins, topic streaks, bronze/silver/gold mastery badges), interactive SVG visual labs, real-time multiplayer duels in the Battle Arena, and narrative-driven mathematical mysteries in the Detective Agency.

---

## 2. What do you understand by Tenali as a system?

Beyond its educational mission, Tenali is an integrated, decoupled client-server web system engineered for high concurrency, low latency, and single-host deployment efficiency (`tenali.fun`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19 + Vite)                  │
│   Home Grid · 100+ Tiles · Guided Journey · Battle Arena · Visual Labs │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST APIs & Socket.IO
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND ENGINE (Node.js + Express 5)               │
│   Rate Limiting · JWT Auth · Solve Middleware · LIL Interceptor        │
│   93 Route Pairs: GET /<type>-api/question · POST /<type>-api/check    │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       ALGORITHMIC & DATA LAYER      │   │       PERSISTENCE LAYER      │
│ Math Generators · GK & Vocab Banks  │   │ MongoDB (Mongoose 9)         │
│ Step-by-Step Explanation Engine     │   │ + Zero-Config Memory Fallback│
└─────────────────────────────────────┘   └──────────────────────────────┘
```

### 1. Key Actors & Users
- **Learners (Students)**: Primary users who navigate through topic areas, engage in 20-question adaptive quiz loops, earn XP and mastery badges, explore visual concept labs, and participate in peer-to-peer multiplayer battles. Learners can participate freely in guest mode or authenticate for persistent cross-device progress.
- **Instructors / Proctors**: Educators and administrators who monitor exam sessions, review behavioral telemetry, and supervise student focus via webcam emotion classification and tab-switch logging in the admin dashboard (`/api/proctor/sessions`).
- **Open-Source Contributors**: Developers extending the 93 puzzle types, building standalone interactive learning labs, maintaining test suites, and refactoring modular components.

### 2. Core Entities & Architecture
- **Stateless Puzzle Contract**: Every puzzle type adheres to a clean two-route REST contract:
  - `GET /<type>-api/question?difficulty=N`: Pure computational function generating a new question with parameters, stem display, and canonical answer.
  - `POST /<type>-api/check`: Validates student input against algorithmic boundaries or tolerance thresholds.
- **Adaptive Difficulty State**: Each active quiz instance manages an `adaptScore` float (0.0 to 3.0). Correct answers increment the score (+0.15 to +0.5); mistakes deduct (−0.4 to −0.6). The score maps to difficulty bands (`easy`, `medium`, `hard`, `extrahard`) passed to subsequent question requests.
- **Solve-for-Explanation Middleware**: A centralized Express response interceptor wraps all `POST *-api/check` calls. When the client sends `{ solve: true }`, the middleware intercepts `res.json`, invokes `generateExplanation(req, data)`, and appends a step-by-step educational walkthrough without requiring redundant explanation logic inside individual route handlers.
- **Pedagogical Progression ("Monsters" & Concept Labs)**: High-level reasoning pipelines that intercept user mistakes, classify cognitive misconceptions (e.g., operator precedence or sign errors), and route students through guided remediation stages (Predict → Derivation → Guided → Independent → Review).
- **Dual Persistence Architecture**: Powered by MongoDB via Mongoose for user accounts, mastery tracking, and session telemetry, with an in-memory fallback allowing full local development and guest play even when MongoDB is offline.

### 3. End-to-End User & Data Workflow
1. **Discovery**: The student loads `tenali.fun` and browses the home grid (`client/src/features/tiles.js`) or Guided Learning Journey.
2. **Question Fetch**: The client dispatches `GET /<topic>-api/question?difficulty=<band>`. The Express router delegates to the topic generator, returning an algorithmic question object.
3. **Evaluation**: The learner submits an answer. The client validates locally for instant visual feedback and dispatches `POST /<topic>-api/check`.
4. **Interception & Logging**: The backend attempt-logger records telemetry, the LIL interceptor assesses learner mastery, and if `{ solve: true }` was set, step-by-step explanations are attached.
5. **Progression**: The client updates local XP, increments topic streaks, conditionally unlocks next-tier badges (Bronze → Silver → Gold), and updates progress via `/api/progress/update`.

---

## 3. Current State of the Repository: What Has Been Done So Far?

The Tenali codebase represents over 1,160 commits, 130+ merged PRs, and active contributions across full-stack engineering, pedagogy, and design.

### 1. Technology Stack
- **Frontend**: React 19, Vite 8, Framer Motion (micro-animations), Three.js / React Three Fiber (3D shape exploration), Mafs (interactive coordinate geometry), Chart.js (learning curves), and Face-API.js (proctor emotion detection).
- **Backend**: Node.js 20+, Express 5, Socket.IO 4 (real-time multiplayer), Mongoose 9 (MongoDB object modeling), JSON Web Tokens (JWT with bcrypt 10 rounds), and Express Rate Limit.
- **External & Static Data**: 991 General Knowledge questions (`chitragupta/questions/`) and 7,662 Vocabulary questions (`vocab/questions/`).

### 2. Implemented Features & Modules
- **93 Puzzle Types & 100+ Dashboard Tiles**: Covering Arithmetic (addition, column operations, fractions, decimals, surds), Algebra (linear equations, polynomials, quadratics, binomial theorem), Geometry & Trig (circle theorems, bearings, mensuration), Calculus (differentiation, integration, limits, differential equations), and Linear Algebra (56 interactive missions across 6 modules).
- **Interactive Visual Labs**: `GeoCraft`, `LinearAlgebraApp`, `LcmHcfApp`, `NetBuilderApp`, `ShapeSlicer3D`, `CrossSectionApp`, and `VisualMathLabRedux`.
- **Real-Time Multiplayer (Battle Arena)**: Socket.IO duel room (`BattleApp.jsx` + server battle sockets) pairing learners in fastest-finger rounds with live streak tracking.
- **Detective Agency & Board Games**: Text-driven cases and 2D chalkboard crime scenes (`detective-board-app.jsx`) combining math clues with suspect elimination.
- **Pedagogical Hint Engine**: 3-level progressive hint drawer (`client/src/components/HintSystem/`) with XP debit mechanisms.
- **Code Execution Sandbox**: Multi-language code runners via Judge0 CE (`/api/playground/run`) and local compiler isolation (`/api/playground2/run`).
- **Exam Proctoring Suite**: Webcam facial expression analysis, focus loss detection, and administrative session review dashboard (`/api/proctor/sessions`).

### 3. Architecture & Routing Evolution
- **Server Modularization (Phase 2)**: The server has transitioned from a 14,000+ line monolith to a structured 3,161-line core with domain router modules under `server/routes/` (`algebra.js`, `arithmetic.js`, `calculus.js`, `geometry.js`, `financial.js`, `stats.js`, `misc.js`, `advanced.js`, etc.).
- **Client Tile Decoupling**: Home dashboard metadata was extracted out of `App.jsx` into pure data structures within `client/src/features/tiles.js`.

### 4. Testing & Tooling Setup
- **Server Testing**: Configured with Vitest and Supertest (`npm test` in `server/`). Includes API contract testing suites (`routes/__tests__/apiContract.test.js`) and Bayesian Knowledge Tracing unit tests (`lib/bkt.test.js`).
- **Client Testing**: Vitest and Testing Library configured in `client/` covering detective logic and conceptual API clients.
- **Static Analysis**: ESLint 9 flat config with a baseline suppressions registry in `client/eslint-suppressions.json`.

---

## 4. Gaps Observed in the Code

During my code inspection, test runs, and static analysis across the repository, I uncovered several concrete bugs, architectural inconsistencies, and technical debt areas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VERIFIED REPOSITORY CODE GAPS                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. matrixmystics.js:52    -> Broken relative path crashes directory    │
│ 2. server/index.js:700     -> Unbounded Promise.all triggers EMFILE     │
│ 3. server/index.js:922     -> Dead/shadowed duplicate route definitions│
│ 4. auth.test.js:25         -> Hardcoded Mongo requirement breaks tests  │
│ 5. server/index.js:156     -> Debugging routes & logs exposed in prod   │
│ 6. client/src/App.jsx      -> 70,000+ line monolithic component file    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Gap 1: Broken Relative Path in `matrixmystics.js` Causes Runtime Crash & Failed Bank Initialization
- **Where**: [`server/routes/matrixmystics.js:52`](https://github.com/vicharanashala/tenali/blob/main/server/routes/matrixmystics.js#L52)
- **What is wrong**: The question bank loader specifies:
  ```javascript
  function loadMatrixMysticsBank() {
    const dir = path.join(__dirname, '..', 'linearalgebra', 'matrixmystics');
    ...
  ```
  Because `matrixmystics.js` resides in `server/routes/`, `path.join(__dirname, '..')` resolves to `server/`. It then looks for `server/linearalgebra/matrixmystics`. However, `linearalgebra/` is located at the **project repository root** (`../../linearalgebra/matrixmystics`), exactly as properly resolved in [`server/routes/la-mission-quiz.js:15`](https://github.com/vicharanashala/tenali/blob/main/server/routes/la-mission-quiz.js#L15).
  During server startup and test initialization, this emits:
  ```text
  [matrixmystics] Failed to read directory: ENOENT: no such file or directory, scandir 'C:\Users\Swati\TENALI FINAL\server\linearalgebra\matrixmystics'
  ```
  Consequently, `mmQuestionBank` remains completely empty, breaking question generation for all Matrix Mystics endpoints.
- **Why it matters**: Severe functional bug causing complete feature failure for Matrix Mystics learners and emitting avoidable errors into server startup logs.

---

### Gap 2: Unbounded Concurrent File Descriptors in `loadJsonDir` Triggers `EMFILE: too many open files`
- **Where**: [`server/index.js:700–706`](https://github.com/vicharanashala/tenali/blob/main/server/index.js#L700-L706) and [`server/index.js:1101–1107`](https://github.com/vicharanashala/tenali/blob/main/server/index.js#L1101-L1107)
- **What is wrong**: The helper `loadJsonDir(dir)` loads files as follows:
  ```javascript
  async function loadJsonDir(dir) {
    const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));
    const contents = await Promise.all(
      files.map((file) => fs.promises.readFile(path.join(dir, file), 'utf8'))
    );
    return contents.map((raw) => JSON.parse(raw));
  }
  ```
  When `loadVocabAsync()` calls `loadJsonDir(vocabDir)`, it passes a directory with **7,662 JSON files**. `Promise.all` immediately opens all 7,662 file handles simultaneously without concurrency chunking or pooling.
  On operating systems with default file descriptor limits (and during test runs in Vitest), this causes:
  ```text
  [ERROR] [http] POST /api/playground2/run -> Error: EMFILE: too many open files, open '.../iconv-lite/encodings/index.js'
  ```
  Because Node's file pool is exhausted, any other module loading or body-parsing task fails with `EMFILE`, which Express returns as an unexpected HTTP 400 Bad Request (causing `playground2.test.js:52` to fail with `expected 400 to be 401`).
- **Why it matters**: High risk of catastrophic startup failure, memory exhaustion, and transient request drops during concurrent file I/O operations.

---

### Gap 3: Shadowed and Unreachable Dead Route Definitions in `server/index.js`
- **Where**: [`server/index.js:922–975`](https://github.com/vicharanashala/tenali/blob/main/server/index.js#L922-L975) (`quadratic-api`) and [`server/index.js:1012–1075`](https://github.com/vicharanashala/tenali/blob/main/server/index.js#L1012-L1075) (`sqrt-api`)
- **What is wrong**: During the Phase 2 router modularization, `quadratic-api` and `sqrt-api` were migrated into `server/routes/algebra.js` and `server/routes/arithmetic.js` and mounted at lines 577 and 580:
  ```javascript
  app.use('/sqrt-api', arithmeticRouter);
  app.use('/quadratic-api', algebraRouter);
  ```
  However, over 200 lines of legacy route handlers for `app.get('/quadratic-api/question')`, `app.post('/quadratic-api/check')`, `app.get('/sqrt-api/question')`, and `app.post('/sqrt-api/check')` were left behind in `server/index.js` starting at line 922. Because Express executes middleware in registration order, the modular routers handle all requests, leaving lines 922–1075 as completely shadowed, dead code.
- **Why it matters**: Extreme developer confusion. A maintainer modifying validation, prompts, or math logic in `server/index.js` will find their changes have zero runtime effect because requests are silently consumed by `algebra.js` and `arithmetic.js`.

---

### Gap 4: Integration Test Suite Crashes Due to Hardcoded MongoDB Requirement
- **Where**: [`server/__tests__/auth.test.js:25`](https://github.com/vicharanashala/tenali/blob/main/server/__tests__/auth.test.js#L25)
- **What is wrong**: While the Tenali application runtime gracefully falls back to an in-memory seed store when MongoDB is unavailable, only `auth.test.js` (line 25) calls `connectMongo(TEST_DB)`:
  ```javascript
  beforeAll(async () => {
    await auth.connectMongo(TEST_DB);
  });
  ```
  When `npm test` runs in an environment without a running local MongoDB instance on port 27017, the test suite hangs for 10,000ms buffering and throws:
  ```text
  MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
  MongooseError: Connection operation buffering timed out after 10000ms
  ```
- **Why it matters**: Breaks out-of-the-box local testing for contributors who do not run a background Mongo service, and causes unnecessary test pipeline failures in CI.

---

### Gap 5: Leftover Debug Endpoints and Unsanitized Request Logging in Production Server
- **Where**: [`server/index.js:156–169`](https://github.com/vicharanashala/tenali/blob/main/server/index.js#L156-L169)
- **What is wrong**: The production server file contains raw debug logs and an exposed test route:
  ```javascript
  console.log("Treasure router imported");

  app.use('/treasurehunt-api/', (req, res, next) => {
      console.log("Treasure API:", req.method, req.url);
      next();
  });

  app.use('/treasurehunt-api', treasurehuntRouter);
  app.get('/test-12345', (req, res) => {
    res.json({
      ok: true,
      message: "THIS IS THE SERVER YOU ARE EDITING"
    });
  });
  ```
- **Why it matters**: Debugging endpoints such as `/test-12345` are publicly reachable in production on `tenali.fun`. Per-request console logging creates unnecessary disk I/O and clutters production log files.

---

### Gap 6: Frontend Test Deficit & Monolithic Component Scaling Bottleneck
- **Where**: [`client/src/App.jsx`](https://github.com/vicharanashala/tenali/blob/main/client/src/App.jsx) (70,926 lines) and `client/src/*.test.jsx` (only 2 test files)
- **What is wrong**:
  1. `App.jsx` has expanded to over 70,000 lines, defining dozens of quiz apps, modal controllers, and state hooks inline in one file. While tile metadata was successfully extracted into `tiles.js`, `modeMap` remains embedded inside `App.jsx`, making it the single largest driver of git merge conflicts (tracked in issue #181).
  2. Frontend testing coverage is sparse: only 2 test suites (`detective.test.jsx` and `conceptApi.test.js`) exist in `client/src/`. Key math evaluation components, user input formatters, and quiz flows currently have no automated Vitest coverage.
- **Why it matters**: Substantial maintenance friction, IDE performance degradation, and high risk of subtle UI regressions going unnoticed during pull request reviews.

---

## 5. Ideas for the Project

To directly resolve the architectural and reliability gaps identified in Section 4, I propose the following practical, high-value improvements:

---

### Idea 1: Chunked Asynchronous File Loading with P-Limit for Question Banks
- **What**: Replace the unbounded `Promise.all` in `loadJsonDir` with a pooled batching reader that limits concurrent file descriptors to a safe concurrency ceiling (e.g., 64 concurrent reads).
- **Why**: Eliminates `EMFILE: too many open files` errors permanently, preserves system file handles for HTTP body-parsing and module loading, prevents test suite crashes in `playground2.test.js`, and stabilizes server startup memory usage.
- **How**: Implement a small batch worker or helper function in `server/index.js` (or `server/lib/`):
  ```javascript
  async function loadJsonDirBatched(dir, batchSize = 64) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const results = [];
    for (let i = 0; i < files.length; i += batchSize) {
      const chunk = files.slice(i, i + batchSize);
      const contents = await Promise.all(
        chunk.map(f => fs.promises.readFile(path.join(dir, f), 'utf8'))
      );
      for (const text of contents) results.push(JSON.parse(text));
    }
    return results;
  }
  ```

---

### Idea 2: Correcting Path Resolutions and Pruning Dead Routes Across Server Modules
- **What**:
  1. Fix the relative directory path in [`server/routes/matrixmystics.js`](https://github.com/vicharanashala/tenali/blob/main/server/routes/matrixmystics.js#L52) from `'..'` to `'..', '..'`.
  2. Safely remove shadowed duplicate route blocks for `quadratic-api` and `sqrt-api` in `server/index.js` (lines 922–1075) to ensure the router modules in `server/routes/` are the unambiguous, single source of truth.
  3. Strip out the public `/test-12345` route and redundant `/treasurehunt-api/` console logging.
- **Why**: Restores the Matrix Mystics bank immediately, cleans up 250+ lines of dead code, prevents developer confusion, and maintains production hygiene.
- **How**:
  - Update line 52 of `matrixmystics.js` to:
    ```javascript
    const dir = path.join(__dirname, '..', '..', 'linearalgebra', 'matrixmystics');
    ```
  - Delete legacy definitions of `quadratic-api` and `sqrt-api` in `server/index.js`.
  - Remove debug routes and replace ad-hoc `console.log` calls with the server's structured logger.

---

### Idea 3: In-Memory MongoDB Test Harness with Automatic Skip Fallback
- **What**: Update `server/__tests__/auth.test.js` to either use `mongodb-memory-server` in testing environments or gracefully skip database-dependent tests if a live MongoDB instance is unreachable.
- **Why**: Allows new contributors to run `npm test` successfully without needing a local MongoDB service pre-installed and running on their machines.
- **How**: Check database availability before running the suite, or bind to an in-memory Mongo mock:
  ```javascript
  beforeAll(async () => {
    try {
      await auth.connectMongo(TEST_DB);
    } catch (err) {
      console.warn('[TEST] MongoDB unavailable, falling back to mock or skipping Mongo integration tests');
    }
  });
  ```

---

### Idea 4: Component Factory Extraction & Modular `modeMap` Registry
- **What**: Continue the modularization started with `client/src/features/tiles.js` by extracting standard quiz components generated by `makeQuizApp` into modular files under `client/src/features/quizzes/` and moving `modeMap` into a dedicated lookup registry (`client/src/features/modes.js`).
- **Why**: Decouples `App.jsx`, drastically reducing merge conflicts for PRs that add new quiz types, making component boundaries testable in isolation.
- **How**:
  1. Create `client/src/features/modes.js` exporting the mode mapping.
  2. Use dynamic imports (`React.lazy`) or grouped feature modules to register components cleanly.
  3. Keep `App.jsx` focused purely on application shell state, authentication context, and top-level navigation.

---

### Idea 5: Expand Automated Contract Tests for Frontend Quiz Engines
- **What**: Introduce unit and integration tests for standard quiz factories and math input parsers in `client/test/`.
- **Why**: Ensures that answer grading, tolerance checks (such as float precision comparisons), and timer lifecycle hooks operate correctly without relying solely on manual in-browser validation.
- **How**: Leverage Vitest + `@testing-library/react` (already present in `client/package.json`) to mount sample `makeQuizApp` instances and assert that correct answers increment streaks and incorrect answers trigger remediation hints.

---

## 6. Your Contribution

During my onboarding exploration, I conducted a comprehensive analysis of the Tenali codebase, examined running backend and frontend test suites, investigated build and linting pipelines, successfully shipped fixes for active issues, and prepared verified solutions for identified architectural gaps.

### 1. Merged Pull Request [PR #401](https://github.com/vicharanashala/tenali/pull/401) (Issue [#182](https://github.com/vicharanashala/tenali/issues/182))
- **Title**: `Solved issue #182 Curiosity Mode UI breakage, missing Visual Riddle images, duplicate Vachana menu entry, and quiz UI breakdown (Column Addition & Addition)`
- **Commit**: `3406e6d2`
- **What it changed**:
  1. **Curiosity Mode UI Layout & Responsiveness**:
     - Fixed broken layout constraints on `.card.card--curiosity` and `.curiosity-shell`.
     - Refactored `.curiosity-workspace` to use fluid column proportions (`1.15fr / 0.85fr`) instead of rigid pixel widths.
     - Converted `.curiosity-equation-row` from an inflexible fixed-column CSS grid to a flexible wrapping flexbox layout with centered numeric inputs.
     - Updated `.curiosity-subgrid` and `.curiosity-edit-grid` to use responsive `auto-fit` tracks.
     - Added `overflow-wrap: anywhere` and `word-break: break-word` across curiosity cards, formulas, notes, equations, and table comparison rows (`.curiosity-comparison-head`, `.curiosity-comparison-row`) to prevent text and formula overflow.
  2. **Missing Visual Riddle Assets & Subpath Image Loading**:
     - Added missing visual riddle images in `client/public/riddles/images/` (`game_puzzle_100.png`, `game_puzzle_104.png`, `game_puzzle_105.png`, `game_puzzle_112.png`, and option images `game_puzzle_112_option_a.png` through `game_puzzle_112_option_d.png`).
     - Wrapped riddle and option image paths in `client/src/App.jsx` with `withBase()` to ensure correct path resolution across sub-path deployments (such as `/summership/`), and added `onError` fallback logging for failed image loads.
  3. **Celebration Overlay & "Awesome!" Popup Styling**:
     - Added comprehensive styling in `client/src/App.css` for `.celebration-overlay`, `.celebration-card`, `.celebration-title`, `.celebration-reward`, and animated falling confetti pieces (`.confetti-piece`, `@keyframes confetti-fall`).

### 2. Root Cause Analysis and Fix for Matrix Mystics Question Bank Crash
- **Problem**: As identified in Gap 1, `server/routes/matrixmystics.js` crashed during startup when attempting to read `server/linearalgebra/matrixmystics` (`ENOENT`), causing questions to fail to load.
- **Solution Prepared**: Corrected the file path resolution in `server/routes/matrixmystics.js:52` to navigate two directory levels up:
  ```javascript
  const dir = path.join(__dirname, '..', '..', 'linearalgebra', 'matrixmystics');
  ```
- **Validation**:
  - Verified directory existence at `linearalgebra/matrixmystics`.
  - Confirmed question JSON files parse correctly across all modules.
  - Eliminated the startup `ENOENT` warning completely.

### 3. Diagnosis and Fix for `EMFILE` Descriptor Exhaustion During Startup
- **Problem**: Discovered that `loadVocabAsync()` in `server/index.js` reads 7,662 files concurrently via `Promise.all(files.map(...))`, overwhelming OS file descriptor tables and causing secondary failures (such as `playground2.test.js` failing with status 400 due to failed body-parser module loading).
- **Solution Prepared**: Formulated the batched reader `loadJsonDirBatched` (batch size 64) to safely pool file reads, eliminating handle contention and preventing test failures.

### 4. Verification of Clean Git State & Client Test Suite Health
- **Testing & Environment Validation**:
  - Cloned and initialized the complete repository into the local development workspace.
  - Installed and audited dependencies for both `server/` and `client/`.
  - Executed the client test suite: `npm test` in `client/` passed with 26/26 tests passing across `detective.test.jsx` and `conceptApi.test.js`.
  - Executed server contract tests: verified that 112 tests passed across the extracted route contracts (`routes/__tests__/apiContract.test.js`).
  - Documented full repository findings, architectural workflows, and actionable gap analysis in this onboarding document.

This onboarding document represents my verified findings and ongoing contributions to the Tenali platform.

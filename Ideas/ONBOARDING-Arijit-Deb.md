# Onboarding Document — Arijit Deb

**Project:** Tenali — Adaptive Math Quiz Platform
**Author:** Arijit Deb
**Date:** September 2026

---

## 1. What is Tenali?

Tenali is a web-based adaptive mathematics learning platform named after Tenali Raman, the legendary Indian court jester renowned for solving problems with logic and wit. Its domain is adaptive education: it serves young learners (primarily the Taittiriya and Tatsavit cohorts) who practise arithmetic, algebra, geometry, calculus, statistics, and a few non-math extras such as general knowledge and vocabulary.

The problem Tenali sets out to solve is that a child practising mathematics needs *endless, non-repeating, appropriately-levelled* practice. Traditional workbooks and static question banks run out of questions, and fixed-practice tools do not adjust to how well a child is doing. Tenali answers this by generating every question algorithmically on the server at request time. There is no question database — each problem is computed from a difficulty seed, so practice is effectively infinite and never repeats. The difficulty then adapts in real time to the learner's performance (correct answers push it up, mistakes pull it down), so the same child stays working near the edge of their ability rather than being bored or overwhelmed.

A second, important goal is to keep learning *motivating*. Tenali layers game mechanics on top: coins, experience points, streaks, per-topic bronze/silver/gold badges, a collection album, multiplayer battle rounds, and story-driven mystery cases. The idea is that a reluctant 2nd-grader will happily do arithmetic if it is framed as cracking a cupcake-theft case in the Detective Agency.

## 2. What do I understand by Tenali (as a system)?

Beyond the mission statement, I understand Tenali as a **single stateless question-generation engine behind a gamified front end**.

**Users.**
- **Learners (primary).** Young students, mostly in guest mode or authenticated. They pick a topic from the home grid, answer ~20 adaptive questions, and earn coins/XP/badges.
- **Admins / proctors.** Faculty who can see a proctor dashboard (`/api/proctor/sessions`) used for exam-mode supervision. Access is gated by a `requireAdmin` middleware on a JWT `role` claim.

**Main entities.**
- **Puzzle-type endpoint pairs.** Every puzzle family exposes the same contract: `GET /<type>-api/question` returns a generated question; `POST /<type>-api/check` validates the answer. In the current code there are **88** such pairs (not 69 as the README's list suggests — see Section 4). Question generation is pure computation driven by a `difficulty` parameter (0–3).
- **Adaptive difficulty.** Each quiz instance holds a float `adaptScore` (0–3). Correct answers add roughly +0.15 to +0.5; wrong answers subtract roughly −0.4 to −0.6. The score maps to easy/medium/hard/extrahard bands that drive `difficulty`.
- **Reply-middleware stack.** All `POST *-api/check` calls are intercepted by middleware that can optionally call `generateExplanation(req, data)` to return a step-by-step walkthrough when the client sends `{ solve: true }`. This is how the "Solve" button works without every handler writing its own explanation code.
- **Battle Arena.** A Socket.IO real-time 1-vs-1 mode where two players see the same question and the first correct answer wins the round.
- **Code playground.** A multi-language sandbox (`/api/playground2`, and a local compiler app) so learners/users can run code in 50+ languages.
- **Auth.** JWT-based login backed by MongoDB (Mongoose 9), with an in-memory fallback for seed users when the database is unreachable.

**High-level data flow.**
1. The client calls `GET /<type>-api/question?difficulty=N`; the server computes a fresh question and returns it with a canonical answer.
2. The client grades locally (against the returned answer) for immediate feedback, updates the local `adaptScore`, and reports progress via `/api/progress/*`.
3. If the learner taps **Solve**, the client calls `POST /<type>-api/check` with `{ solve: true }`, the solve middleware injects a step-by-step explanation, and the client renders it.

Because question state is not persisted server-side, the server is effectively stateless; the client holds the session state (current question, difficulty, answers) and only the user's cumulative progress is stored (MongoDB, or in-memory).

## 3. Current State of the Repository — What Has Been Done So Far

Walking through the repository is how I learnt the system, so this section reflects what exists today.

**Backend**
- `server/index.js` is a single monolithic file of **14,347 lines** (CLAUDE.md's "~9000 lines" is outdated). It contains the question/check endpoint pairs, static file serving, and the solve middleware. I counted **88** distinct `GET ...-api/question` and **88** `POST ...-api/check` routes within it.
- Supporting modules: `server/auth.js` (JWT + Mongo/memory auth), `server/explanations.js` (the ~700-line per-type explanation engine), `server/progress.js` (user progress), `server/proctorSchema.js` (exam supervision), `server/routes/` and `server/lib/` (a small in-progress extraction into routers and shared utilities, e.g. `lib/bkt.js` for Bayesian Knowledge Tracing and `lib/spacingLadder.js` for spaced repetition).
- Answer/explanation helpers live inline (e.g., `gcd`, `lcm`, `simplifyFraction`, `randomInt`).
- Two secondary datasets are loaded at startup: `chitragupta/questions/` (991 GK JSONs) and `vocab/questions/` (7,662 vocab JSONs).

**Frontend**
- `client/src/App.jsx` is likewise a very large single file (over 60,000 lines). It hosts the `makeQuizApp` factory that generates ~45 standard quiz components, the `modeMap` component registry, the home-screen `regularApps` grid, and the `useAuth`/`useTimer`/`useAutoAdvance` hooks.
- Bespoke quiz apps live as separate files: `LcmHcfApp.jsx`, `LinearAlgebraApp.jsx`, `GeometryApp.jsx`, `ProbLabApp.jsx`, `PythagLabApp.jsx`, `BattleApp.jsx`, `PlaygroundApp.jsx`, `SudokuApp.jsx`, the detective suite, and many more.
- The **Detective Agency** is split into two subsystems:
  - `detective-app.jsx` + `detective-stories.js` — the original text-driven mystery cases.
  - `detective-board-app.jsx`, `detective-board-cases.js`, `detective-board-engine.js`, `detective-board.css` — the newer **board case** type (`type: 'board'`), a 12×12 chalkboard scene a young detective walks around, collecting evidence and eliminating suspects. `detective-app.jsx` imports `BoardCasePlay` and `BOARD_CASES` from the board suite to present these cases.
- Client tests: `client/src/detective.test.jsx` (text cases) and `client/src/detective-board.test.jsx` (the board suite).

**Auth, deployment, and tooling**
- Auth: JWT (`bcryptjs`, 10 rounds) with `requireAuth`/`requireAdmin`. MongoDB via Mongoose; **in-memory fallback** when Mongo is unavailable. Seed users come from the `TENALI_SEED_USERS` env var, not hardcoded.
- Deployment: a single Express process behind nginx (TLS via Let's Encrypt) → `proxy_pass http://127.0.0.1:4000` → the `tenali.service` systemd unit running `node server/index.js`. In production the app mounts at the `/summership/` sub-path (see `SUBPATH_REDIRECT`), and the client is built with `VITE_BASE_PATH=/summership/`.
- GitHub Actions: `deploy.yml` (SSH → git pull → build → restart) and `update-readme.yml` (refresh contributor stats).

## 4. Gaps Observed in the Code

I focused on findings I could verify in the source as I worked through it, and I avoided repeating things that already work correctly. The following are the strongest observations I noted.

### 4.1 Server test suites exist on disk but cannot run, and nothing in CI gates them (High)

- **Where:** `server/routes/__tests__/apiContract.test.js`, `server/routes/__tests__/trig.test.js`, `server/lib/bkt.test.js`; `server/package.json` (lines 7–9); `.github/workflows/` (only `deploy.yml` and `update-readme.yml`).
- **What:** `apiContract.test.js` and `trig.test.js` are genuine vitest/supertest suites (`const request = require('supertest')`, `describe.each(TOPICS)`), and `bkt.test.js` says to run with `npx vitest`. However, `server/package.json` has **no `test` script** and none of `supertest`, `vitest`, or `jest` are present in `server/node_modules`. The only script is `"start": "node index.js"`.
- **Why it matters:** These tests were clearly meant to cover the 88 server endpoint pairs, but in the current dependency graph they cannot execute, and there is no CI job to run them. The platform's core grading logic therefore ships with **no runnable automated test gate**, so a regression in the answer-checking or explanation middleware could be deployed silently.

### 4.2 Documentation, code, and tests disagree about the endpoint surface; the real structure is a monolith (High)

- **Where:** `server/index.js` (14,347 lines) vs `CLAUDE.md` ("59 endpoint pairs") and the README's "69 puzzle types"; `server/routes/` already contains `__tests__`.
- **What:** I counted **88** `*-api/question` GET routes and **88** `*-api/check` POST routes in `index.js`. The local docs still say 59/69. Only a handful of routes have been extracted into `server/routes/`; most remain inline in the monolith, even though `server/routes/__tests__` was written in anticipation of a per-topic router extraction.
- **Why it matters:** A contributor who trusts CLAUDE.md's count, or who assumes `routes/` is already the modular reality, will be misled about where code lives and how much there is. It also makes the real structure (one huge file) effectively un-navigable and discourages refactor.

### 4.3 Solve middleware relies on a process-global and a fragile multi-layer `res.json` patch (Medium)

- **Where:** `server/index.js` lines 330–364 (solve middleware), 538–539 (`global.generateExplanation = generateExplanation`), 266–331 (attempt-logger interceptor), 380–451 (LIL interceptor).
- **What:** The solve middleware invokes `generateExplanation` as a bare global, and multiple interceptors each monkey-patch `res.json`. One of them restores the original `res.json` inside itself (line 419). Because each wraps the previously-patched `res.json`, the order in which these patches are applied determines which wrapper "wins" when a request carries `{ solve: true }`.
- **Why it matters:** The correctness of every Solve-button explanation depends on this subtle three-layer patch stack plus a global. Reordering the middleware or refactoring the routing could silently break explanations. It is fragile to change.

### 4.4 Leftover debug route and request logging ship to production (Medium)

- **Where:** `server/index.js` line 148 (`app.get('/test-12345', ...)` returning `"THIS IS THE SERVER YOU ARE EDITING"`), lines 140–145 (a `console.log("Treasure router imported")` and a per-request `console.log("Treasure API:", ...)` mounted as middleware on `/treasurehunt-api`), line 508.
- **What:** A developer breadcrumb HTTP route and verbose per-request logging are in the main server file run by systemd in production.
- **Why it matters:** `/test-12345` is publicly reachable and serves no purpose; the per-request `console.log` adds log noise and a small cost on every treasure-hunt call. Neither belongs in a deployed service.

### 4.5 The Mongo-down auth fallback signs real tokens from an in-memory user store with no operator signal (Medium)

- **Where:** `server/auth.js` lines 269–277 (`inMemoryUsers`, `seedUsers`), 322–345 (login fallback); `server/index.js` line 154 (`auth.seedUsers().catch(() => {})`); the `requireAuth`/`requireAdmin` token validation in `auth.js` lines 300–316.
- **What:** When MongoDB is unreachable, `/login` falls back to `inMemoryUsers` and signs a real, valid JWT. `requireAuth`/`requireAdmin` then trust the token's claims (including `role`) from the payload alone, without re-checking the store. The attempt-logger treats these fallback users as fully-fledged users and mutates in-memory `attemptLogs`.
- **Why it matters:** During any Mongo outage the site quietly downgrades to a token-only auth model that trusts a client-sent `role` claim for admin (proctor) access. There is no explicit 503 or "degraded auth" signal to operators, so a half-down deployment can silently serve proctor features to a forged-role token — amplified by the default 14-day token TTL.

### 4.6 Duplicated detective logic with no single source of truth (Medium–Low)

- **Where:** `client/src/detective-app.jsx` line 264 (`checkDetectiveAnswer`) and `client/src/detective-board-engine.js` line 28 (`checkDetectiveAnswer`), with identical bodies (trim → parseFloat → tolerance 0.01); `DETECTIVE_RANKS` in `detective-app.jsx` lines 63–70 duplicated verbatim in `detective.test.jsx` lines 47–54; the load/save progress helpers duplicated in `detective.test.jsx` lines 59–69 (their own comment says "matching detective-app.jsx logic").
- **What:** There are two detective subsystems (text and board), each defining its own copy of the answer-check function, ranks, and progress helpers, and the text-app's test file hand-writes its own copies instead of importing them.
- **Why it matters:** If the tolerance or rank thresholds are tightened in one place during difficulty tuning, the copies diverge silently: the board cases and the classic cases would grade answers differently, and the tests would keep "validating" stale logic.

### 4.7 Duplicate keys in a hand-maintained age map (Medium–Low, latent bug)

- **Where:** `client/src/detective-app.jsx` `AGE_TOPIC_MAP`, keys `'addition'`, `'multiply'`, `'triangles'` appear **twice** — lines 96–98 and again lines 105–107.
- **What:** JavaScript objects silently keep the *last* duplicate key. Currently the duplicates have identical values so nothing breaks.
- **Why it matters:** This is an editing mistake waiting to happen: if someone edits one copy of `addition`'s age and forgets the other, the case finder will behave unpredictably for the whole age filter. It also shows the map is maintained without an ESLint rule that flags object-curly-key duplication.

### 4.8 Quiz question/check endpoints are intentionally un-rate-limited (Medium–Low)

- **Where:** `server/index.js` lines 94–111; `express-rate-limit` is applied only to `/api/auth/login` and things under `/api/`.
- **What:** The comment at lines 96–97 states that all `/<type>-api/*` question *and* check endpoints are deliberately **not** limited.
- **Why it matters:** These 88 endpoints are the platform's entire traffic surface. Since question generation is pure computation, they can be hammered with `?difficulty=` calls to burn server CPU at no limit — a documented scalability/abuse trade-off with no mitigation in place.

### Also noted (lower confidence / informative)

- `server/tests/test_hints_direct.js` line 2 does `require('../hints')` but the module is a directory `server/hints/`, so this test file cannot load — supporting finding 4.1 that parts of the "tests" are aspirational, not operational.
- `client/package.json` ships `vitest` (dev) and `client/vitest.config.js` exists, but **no `test` script** is defined (only `dev`, `build`, `lint`, `preview`), so the good client test suites (`detective.test.jsx`, `detective-board.test.jsx`) have no documented one-command invocation and are not wired into the deploy workflow.

## 5. Ideas for the Project

These ideas follow from the gaps I listed in Section 4.

### 5.1 Give the server a real test runner and a CI gate
- **What:** Add a `test` script in `server/package.json`, add `supertest`/`vitest` (or `jest`) as dev dependencies, fix `server/tests/test_hints_direct.js` (and the `hints` require path), and add a GitHub Actions job that runs both the server and client test suites on every PR.
- **Why:** Directly addresses 4.1 — the grading and explanation logic currently has no runnable, gated automated test, so regressions deploy silently.
- **How:** I'd run `npm i -D vitest supertest` in `server/`, wire `apiContract.test.js`/`trig.test.js`/`bkt.test.js` into `vitest run`, and add a `test` job to `.github/workflows/` that runs before deploy.

### 5.2 Reconcile the endpoint count and document the real structure
- **What:** Update CLAUDE.md and the README to state the true count (88 endpoint pairs) and to describe `index.js` accurately as the monolith it is; keep a generated table of every endpoint pair.
- **Why:** Addresses 4.2 — contributors are currently misled about the surface area and where the code lives.
- **How:** A small script that greps `index.js` for the `*-api/question`/`*-api/check` routes and regenerates the table into the README (mirroring the existing `update-readme` bot pattern), or a one-time manual correction.

### 5.3 Extract shared detective helpers into one module
- **What:** Move `checkDetectiveAnswer`, `DETECTIVE_RANKS`, and the load/save-progress helpers into a single shared module (or the existing `detective-board-engine.js`) and have both `detective-app.jsx` and `detective.test.jsx` import them instead of copying.
- **Why:** Addresses 4.6 — removes the risk that answer-checking tolerance or rank thresholds diverge between the two detective subsystems and their tests.
- **How:** Export the shared functions from one file, update the import sites, and delete the inline copies and the "matching detective-app.jsx logic" comments in the test.

### 5.4 Strip debug surface from the production server
- **What:** Delete the `/test-12345` route and remove (or gate behind a log-level env var) the per-request `console.log` for the treasure-hunt API.
- **Why:** Addresses 4.4 — removes a public no-op endpoint and cuts production log noise.
- **How:** Remove lines 140–151 in `server/index.js` and replace unconditional `console.log`s with a tiny logger that respects `LOG_LEVEL`.

### 5.5 Surface a "degraded auth" state when MongoDB is down
- **What:** When the in-memory auth fallback activates, have the login/progress endpoints return an explicit degraded-mode marker (e.g., an `503` or a `degraded: true` body) and exclude the fallback users from any `requireAdmin`-gated route.
- **Why:** Addresses 4.5 — operators need a clear signal that auth has degraded, and admin access should not be granted from a token whose `role` claim is client-supplied during an outage.
- **How:** Track whether `connected` is true; in `requireAdmin`, short-circuit to a 503 when the store is in fallback mode; add a health endpoint that reports auth mode.

### 5.6 Add a runnable `test` script for the client
- **What:** Add `"test": "vitest run"` to `client/package.json` (and wire the existing vitest suites into CI).
- **Why:** Addresses the "Also noted" item — the detective test suites already exist and pass, but have no documented one-command invocation.
- **How:** Add the script and a CI step; optionally add `"test:watch"` for local use.

## 6. My Contribution

The part of Tenali I have been working on is the **Detective Board** form of the Math Detective Agency — a board case aimed at Grade 2 and younger learners. It sits alongside the existing text-driven cases in `detective-app.jsx`; I built it as a separate suite of files so it stays self-contained.

**What I built** (all in `client/src/`):

- `detective-board-app.jsx` (1,783 lines) — the `BoardCasePlay` presentation shell and the `BoardConfession` flow.
- `detective-board-cases.js` (1,163 lines) — authored case data for Cases 1–3.
- `detective-board-engine.js` (534 lines) — the pure investigation/learning logic (movement, evidence, elimination, and grading that I kept framework-free so it is easy to test).
- `detective-board.css` (2,419 lines) — the board, paper-scene, confession/note/reward, and confetti styling.
- `detective-board.test.jsx` (1,186 lines) — the test suite for the engine and the completion flow.

**How it took shape (my working history):**
- I started by adding Case Files with suspect elimination.
- I then worked through the case-library experience: scrolling, tighter story-narrative wording, evidence-reasoning highlights, dynamic numbers in the maths, and additional difficulty stages for older ages.
- **`feat(case-files): Added a detective board game for grade 2 and below age groups`** — the board-game foundation: a 12×12 chalkboard scene (`gridSize: 12`), move/blocked-cell rules, suspects with profiles and elimination reasons, evidence objects carrying investigation maths, and a low-cognitive-load presentation for young learners.
- **`feat(board): deduction prompts + cases 2-3 + elimination polish + UI improvement and a pointer guide included`** — notebook deduction prompts, Cases 2 and 3 (the elephant-mastermind arc), elimination-presentation polish, and an attention-pointer guide for the flow.

**What the board feature delivers:**
- **Data-driven cases.** Case specs in `detective-board-cases.js` hold suspects (with animal emoji, species, hint, profile, and an `eliminatedReason`), evidence objects carrying per-difficulty maths, and per-case narrative fields `confessionLines`, `giveLine`, `teacherLine`, and `rewardSubtitle`. Case specs are validated by `validateBoardCase`. Cases 2–3 are pure-data additions on top of an unchanged engine.
- **The game loop.** The learner walks a detective around a 12×12 scene, steps on evidence to pin tags, answers index-card maths to collect observations, and eliminates suspects one by one down to a single culprit.
- **The completion flow** (the `BoardConfession` component in `detective-board-app.jsx`): a three-step **Confession → Note → Reward** experience I designed for low cognitive load:
  1. *Confession* — the culprit's avatar with two short speech bubbles and a give-line ("hands you a folded note…").
  2. *Note* — a "Note for you / OPEN" call-to-action card that reveals a typewriter-style letter, followed by the teacher's closing bubble.
  3. *Reward* — a "CASE SOLVED" screen with a per-case subtitle, star rating, XP, and confetti (`RewardConfetti`), with reduced-motion respect.
- **Accessibility & polish.** An `AttentionPointer` guidance element (centered on its target via an `openBtnRef`), hover/pill-pointer targeting on the note CTA, a reward-subtitle colour fix for legibility on the paper background, and `prefers-reduced-motion`-aware confetti and typewriter reveal.
- **Tests.** `client/src/detective-board.test.jsx` covers the board engine and the confession→note→reward flow; the suite currently passes.

**Note on scope:** this section records work I have already completed and committed in the repository. Anything still uncommitted on the board flow will be captured here once it lands.

---

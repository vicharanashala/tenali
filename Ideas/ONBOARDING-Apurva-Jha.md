# Onboarding Document — Tenali

**Contributor:** Apurva Jha  
**Repository:** [vicharanashala/tenali](https://github.com/vicharanashala/tenali)  
**Date:** October 2026  

---

## 1. What is Tenali?

**Tenali** is an open-source, interactive mathematics learning platform. It is designed to make math concepts intuitive and engaging for students, ranging from early childhood arithmetic to high school algebra, geometry, and calculus.

### Core Problems Addressed:
1. **Passive Drill & Memorization:** Traditional platforms often rely on static textbook question banks. Tenali generates practice problems **algorithmically on the fly**, providing an endless stream of non-repeating questions computed from difficulty settings.
2. **One-Size-Fits-All Pacing:** Fixed problem sets can bore advanced students or overwhelm struggling learners. Tenali uses real-time adaptive scoring to adjust question difficulty dynamically based on student performance.
3. **Engagement & Motivation:** Math practice is paired with game-like elements—coins, experience points (XP), topic badges, and interactive visual sandboxes—to keep learners motivated.

---

## 2. What Do You Understand by Tenali as a System?

Tenali is built as a decoupled web application with a single-page React frontend and a Node.js/Express backend.

### How a Student Interacts with the System:
1. **Selecting an Activity:** The student picks a topic from the home dashboard (such as basic arithmetic, fractions, or linear equations).
2. **Receiving a Question:** The client requests a question from the server (`GET /<topic>-api/question?difficulty=...`). The server computes random numbers within that difficulty band, packages the prompt, and returns the problem to the client.
3. **Submitting an Answer:** The student enters their answer and clicks **Submit**. The frontend sends the response to the validation route (`POST /<topic>-api/check`).
4. **Grading & Feedback:** The server evaluates whether the answer is mathematically correct (`correct: true/false`). The frontend displays immediate feedback, and the adaptive score adjusts (moving difficulty up on success, down on mistakes).
5. **Step-by-Step Explanations:** If the learner gets stuck or clicks **Solve**, the server's explanation middleware (`server/explanations.js`) generates a step-by-step walkthrough of the solution.
6. **Progress Tracking:** The server asynchronously logs attempt data to MongoDB (via `server/lil/`), updating the student's earned coins, XP, and streak progress.

---

## 3. Current State of the Repository — What Has Been Done So Far

Tenali already includes a solid foundation of learning modules and server utilities:

### A. Technology Stack
- **Frontend:** React single-page application built with Vite, using Vanilla CSS, modern component layouts, and specialized libraries like Three.js and Mafs for visual sandboxes.
- **Backend:** Node.js with Express 5, providing modular REST routers under `server/routes/` for over 50 math topics.
- **Data & Auth:** MongoDB with Mongoose for user accounts, attempt history, and progress records, including a resilient in-memory fallback for local development.
- **Testing:** Automated API contract tests in `server/routes/__tests__/apiContract.test.js`, standalone unit tests for Bayesian Knowledge Tracing (BKT) in `server/lib/bkt.test.js`, and client-side Vitest tests.

### B. Existing Capabilities
- **Modular Math Routers:** Procedural question generation and answer verification across arithmetic, algebra, geometry, and calculus.
- **Solve & Explanation Engine:** A centralized explanation generator (`server/explanations.js`) that constructs step-by-step solutions when requested.
- **Attempt Telemetry:** Background logging (`server/lil/processAttempt.js`) that captures student answers, prompts, and timestamps.
- **Knowledge Tracing (BKT):** A standalone implementation of Bayesian Knowledge Tracing (`server/lib/bkt.js`) designed to model general skill acquisition.

---

## 4. Gaps Observed in the Code

### 🚨 Gap: Lack of Qualitative Misconception Detection in Wrong-Answer Feedback

- **Where:** `server/routes/misc.js` (which handles topics like fraction arithmetic), the attempt-tracking modules under `server/lil/` (`models.js`, `attemptLogger.js`, `processAttempt.js`), and the explanation generator in `server/explanations.js`.
- **What:** Tenali accurately checks whether an answer is right or wrong, and it already logs student attempts in the database. However, when an answer is incorrect, the system only returns a binary verdict (`correct: false`). It does not inspect the student's response to identify the specific mathematical reasoning mistake behind it.
- **Why It Matters:** Telling a student that their answer is wrong does not explain *why* their thinking was flawed. For example, if a child solving a fraction addition problem repeatedly adds the numerators and denominators straight across, standard feedback simply tells them to try again or shows the correct final answer. Without targeted feedback that addresses their specific mistake, learners frequently repeat the same error.

---

## 5. Ideas for the Project

### 💡 Idea: Rule-Based Misconception Detection Layer

- **Proposal:**  
  I propose adding a lightweight, rule-based misconception-detection layer to Tenali. Instead of only checking whether an answer is correct, the system will compare the student's submitted answer and the problem operands against common mathematical error patterns. Fraction addition will serve as the initial prototype topic. For example, if a student answers `1/2 + 1/3 = 2/5`, the system can recognize that the student likely added the numerators ($1+1=2$) and denominators ($2+3=5$) separately. A single wrong answer will be treated as evidence of a *possible* misconception rather than definitive proof. This layer complements Bayesian Knowledge Tracing (BKT): while BKT estimates an overall probability of topic mastery, this new layer identifies the specific qualitative nature of an error without creating a competing mastery system.

- **Why It Helps:**  
  This feature provides timely, pedagogical feedback directly tailored to the student's mistake. It helps students understand their conceptual errors on the spot, avoids generic explanation fatigue, and requires no external AI services or ongoing API costs.

- **Implementation Approach:**  

The implementation will reuse Tenali's existing question generation, answer checking, attempt tracking, and explanation systems rather than building duplicate systems.

1. Create a rule-based module containing common mathematical mistakes, initially focusing on fraction addition.
2. Connect this module to Tenali's existing fraction answer checker. It will examine the fractions in the question and the student's answer to identify whether the answer matches a known mistake, such as adding the numerators and denominators separately.
3. Use the identified mistake to provide a relevant explanation or follow-up question in the quiz interface.
4. Add automated tests to check that the rules identify the intended mistakes and do not incorrectly flag correct answers.
5. In a later stage, use the existing student attempt records to check whether the same mistakes occur repeatedly and provide more targeted practice.

  **Likely Files Involved:**
  - `server/lib/misconceptions/fractionRules.js` *(new file)*: Defines explicit math rules for common fraction mistakes (e.g., adding across, adding like denominators, forgetting to invert when dividing).
  - `server/lib/misconceptions/engine.js` *(new file)*: Compares the submitted answer against the topic rules and selects the appropriate explanation.
  - `server/routes/misc.js`: Connects the misconception engine to the existing fraction answer-checking route.
  - `server/lib/misconceptions/__tests__/fractionRules.test.js` *(new file)*: Unit tests verifying positive matches, non-matches, and edge cases.
  - `client/src/App.jsx`: Displays the targeted misconception feedback or hint in the quiz UI.
  - `server/lil/` attempt-tracking files: Extended in a future phase if misconception tags need to be stored alongside attempt records.

---

## 6. Your Contribution

I contributed solutions to three listed issues in the repository:

---

### Issue #214 — Language Puzzles Tile & Navigation Fix
- **Branch:** `fix/language-puzzles-tile`
- **Commits:** `cc0977ba`, `76477437`
- **Files Modified:**
  - [`client/src/App.jsx`](https://github.com/vicharanashala/tenali/blob/main/client/src/App.jsx)
  - [`client/src/features/tiles.js`](https://github.com/vicharanashala/tenali/blob/main/client/src/features/tiles.js)

#### The Problem
The Language Puzzles activity could not be launched properly from the navigation menu and its tile was not present on the home dashboard. In `client/src/App.jsx`, clicking the navigation bar button triggered a hard browser refresh via `window.location.href = '/language'`, which resulted in a 404 or blank view because the client does not use full server-side routing for sub-apps. Additionally, the Language Puzzles module was missing from the main tile catalog array in `client/src/features/tiles.js`.

#### The Fix
1. In `client/src/App.jsx`, replaced the hard reload `window.location.href` with the internal SPA state updater `onSelect('language')`.
2. In `client/src/features/tiles.js`, registered the `language` entry in the `TILES` array with appropriate metadata:
   ```javascript
   {
     id: 'language',
     name: 'Language Puzzles',
     desc: 'Word ladders, anagrams, cryptarithms and linguistic logic',
     category: 'puzzles',
     icon: 'BookOpen',
     accent: '#3B82F6'
   }
   ```

#### Why it Matters
It prevents unwanted full-page reloads, retains user session state, and ensures the Language Puzzles module is discoverable on the home dashboard grid.

---

### Issue #215 — Geocraft Tile & Redirect Normalization
- **Branch:** `fix/geocraft-tile`
- **Commits:** `89a441a7`
- **Files Modified:**
  - [`client/src/features/tiles.js`](https://github.com/vicharanashala/tenali/blob/main/client/src/features/tiles.js)

#### The Problem
The Geocraft 3D/geometry module had an inconsistent entry definition in `GEOCRAFT_ENTRY` within `client/src/features/tiles.js`. It contained `{ isRedirect: true, path: '/geocraft' }`, causing the dashboard to attempt an external redirection rather than rendering the embedded React component. Furthermore, it was not cleanly integrated into the primary `TILES` catalog list.

#### The Fix
1. Cleaned up `GEOCRAFT_ENTRY` by removing `isRedirect: true` and the redundant `path: '/geocraft'` property.
2. Formally added `geocraft` into the `TILES` catalog array so it renders identically to all native interactive sandboxes:
   ```javascript
   {
     id: 'geocraft',
     name: 'Geocraft',
     desc: 'Interactive 3D geometry and coordinate exploration sandbox',
     category: 'geometry',
     icon: 'Box',
     accent: '#10B981'
   }
   ```

#### Why it Matters
Normalizes all dashboard activities under a single unified rendering model and allows seamless in-app navigation without broken redirects.

---

### Issue #220 — Standalone Deployment & Subpath Routing for Matrix Mystics
- **Branch:** `matrixmystics`
- **Commits:** `73d5b682`, `aa9561c4`
- **Files Modified:**
  - [`server/index.js`](https://github.com/vicharanashala/tenali/blob/main/server/index.js)
  - [`.env.example`](https://github.com/vicharanashala/tenali/blob/main/.env.example)

#### The Problem
Matrix Mystics needed to be deployable both as an embedded module within Tenali and as an independent, standalone service running on its own dedicated port (4004) under a custom subpath (`/matrixmystics/`). Without proper subpath routing and static asset mounting, running the server in standalone mode caused static client assets (JS/CSS) to 404 when requested under `/matrixmystics/`.

#### The Fix
1. Updated `.env.example` to document the environment configuration options:
   ```env
   PORT=4004
   SUBPATH_REDIRECT=/matrixmystics
   VITE_BASE_PATH=/matrixmystics/
   ```
2. In `server/index.js`:
   - Configured Express to serve static frontend assets (`clientDistPath`) from both the root path and the `SUBPATH_REDIRECT` path (`/matrixmystics`).
   - Added a redirect rule so visits to `/matrixmystics` automatically redirect to `/matrixmystics/` to ensure relative client asset paths resolve properly.
   - Ensured the SPA catch-all fallback (`*`) serves `index.html` from the correct subpath.

#### Why it Matters
Enables Matrix Mystics to be embedded into micro-frontends, reverse proxies (e.g., Nginx), or standalone containers without broken asset links or routing collisions.

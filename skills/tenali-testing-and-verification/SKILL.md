---
name: tenali-testing-and-verification
description: Standardize testing, linting, build verification, and manual acceptance testing across the Tenali client and server.
---

# Tenali Testing & Verification Skill

## 1. Purpose & Trigger
Use this skill whenever verifying code changes, testing bug fixes, running CI checks locally, or preparing a handoff report for maintainer review.

## 2. Actual Test Architecture & Commands

Tenali does **not** have a unified root-level `npm test` command. Testing and builds are separated between `client/` and `server/`.

### 1. Server Core Unit Check (Zero-Dependency)
- **Command**: `node server/lib/bkt.test.js`
- **Scope**: Tests the Bayesian Knowledge Tracing engine using Node's built-in `assert` module.
- **Requirement**: Must ALWAYS pass instantly without running `npm install`.

### 2. Client Production Build Check
- **Command**: `cd client && npm run build`
- **Scope**: Compiles and bundles all React 19 JSX modules using Vite 8 and Rolldown.
- **Requirement**: Catches broken imports, syntax errors, and invalid JSX. Must exit 0.

### 3. Client Lint Check
- **Command**: `cd client && npm run lint`
- **Baseline**: Current main reports **0 errors and 117 warnings** (primarily `react-hooks/exhaustive-deps`).
- **Rule**: Never introduce fresh errors. Keep total warnings under the allowable baseline ceiling.

### 4. Client Unit & Component Tests (Vitest)
- **Command**: `cd client && npm test`
- **Scope**: Runs Vitest specs under JSDOM environment using Testing Library. Requires `npm ci` in `client/`.

### 5. Server Contract Tests (Vitest + Supertest)
- **Command**: `cd server && npm test`
- **Scope**: Runs Express API endpoint contract tests and topic validations. Note: full integration tests require MongoDB running on `localhost:27017`.

---

## 3. Truthful Reporting Rules
- **Record Exact Outputs**: Report the exact command executed, exit code, and runtime duration.
- **Never Claim Unexecuted Tests Passed**: If an environment dependency (such as MongoDB or a local package) prevented running a test, explicitly document it as `NOT RUN (reason)` rather than claiming success.
- **Distinguish Baseline from Introduced**: Clearly separate pre-existing warnings from newly observed errors.

---

## 4. Mandatory Manual Acceptance Checklist
Automated tests alone do not prove user experience integrity. Every substantive feature must include a step-by-step human acceptance test script covering:
1. Local server startup (`cd server && node index.js`).
2. Client dev server startup (`cd client && npm run dev`).
3. Exact UI navigation steps from Home screen.
4. User interactions (correct answer, wrong answer, Solve button, theme toggle).
5. Expected perceivable results.

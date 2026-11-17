---
name: tenali-code-review
description: Provide independent, evidence-based code reviews for Tenali PRs and changes. Evaluates modularity, security, regressions, test coverage, and governance compliance.
---

# Tenali Code Review Skill

## 1. Purpose & Trigger
Use this skill when reviewing pull requests, inspecting diffs, or evaluating proposed changes before human handoff.

## 2. Review Criteria & Verification Gates

### 1. Scope & Diff Inspection
- Run `git diff --check` to verify no whitespace errors, git conflict markers, or stray debug lines exist.
- Verify that only files directly related to the approved task were modified. Flag any unrelated refactoring or mass formatting.

### 2. Modularity & Architecture
- Confirm that new quiz modules or interactive components are placed in `client/src/apps/` or dedicated module directories, and NOT in `client/src/App.jsx`.
- Confirm that backend endpoints use modular Express routers in `server/routes/`.
- Check for circular dependencies or unsafe top-level evaluation.

### 3. Safety & Boundaries
- Verify that no credentials, tokens, or private paths are exposed.
- Verify that API calls handle failure gracefully without substituting fake hardcoded data as live server data (FLN #449).
- Confirm that lockfiles (`package-lock.json`) do not contain unexplained large deletions (Parikshak Gate 3).

### 4. Testing & Verification Evidence
- Verify that `node server/lib/bkt.test.js` passes.
- Verify that `cd client && npm run build` completes with exit code 0.
- Verify that newly added features include corresponding unit or contract tests.

### 5. Governance & Issue Linkage
- Verify that the PR description includes `Closes #N` pointing to an existing open tracker issue.
- Verify that the branch name uses an approved prefix (`feat/`, `fix/`, `docs/`, `chore/`, `refactor/`).

---

## 3. Reviewer Output Format
Classify review findings into distinct categories:
- **Blockers (Must Fix)**: Compilation breaks, security leaks, modularity violations, fake production mocks, missing issue link.
- **Suggestions (Non-Blocking)**: Style improvements, documentation clarifications, performance optimizations.
- **Verification Evidence**: Record of tests executed and manual inspection results.

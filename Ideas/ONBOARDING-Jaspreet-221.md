# Onboarding Document: Issue #221

**Revive MatrixMysticsApp as the landing view on the new branch**

Author: Jaspreet (GitHub: Jaspreet-j) | Repository: vicharanashala/tenali | Pull request: #525 | Labels: enhancement, frontend

## 1. Issue Summary

Issue #221 asks for a component that already exists but cannot be reached to become the front door of the app on the new branch. `MatrixMysticsApp` is defined in `client/src/App.jsx` through `makeMCQuizApp` with `apiPath: 'matrixmystics-api'`, but nothing references it. Its tile and its `modeMap` entry were removed earlier, and its content was folded into the Linear Algebra mission quiz.

The backend was never removed. `server/routes/matrixmystics.js` is still mounted in `server/index.js` and loads a 1.2 MB question bank from `linearalgebra/matrixmystics/`. So this is a revive, not a rebuild.

This issue is part of moving Matrix Mystics and the Linear Algebra lab onto their own branch, served at `tenali.fun/matrixmystics` from port 4004. It depends on issue #220, and issue #224 is its counterpart on the main branch.

## 2. Problem Analysis

The app is dead code for three reasons:

- It has no entry in `modeMap`, so no `?mode=` value can open it.
- The default mode is `null`, so the app opens on the home menu instead of on it.
- Browser Back and Forward navigation also falls back to `null` when the URL has no `?mode=`.

The backend needed no change. `matrixmystics-api` is live and mounted.

## 3. Open Question and My Assumption

The issue leaves one question open for the maintainers: should the app land on this standalone MCQ app, or on the mission flow that absorbed its content?

Because the issue title says "Revive MatrixMysticsApp as the landing view", I went with the standalone MatrixMysticsApp and stated this assumption at the top of the pull request. If the mission flow is preferred, the change is small and limited to `App.jsx`.

## 4. What I Changed

All changes are in `client/src/App.jsx`:

- **Registered the mode.** Added `matrixmystics: MatrixMysticsApp` to `modeMap`, replacing the comment that said the mode had been removed.
- **Changed the initial mode.** The initial `mode` state now returns `'matrixmystics'` instead of `null` when no `?mode=` is in the URL. A `?mode=` value still wins, so `?mode=gk` and `?mode=addition` open their own quizzes.
- **Changed the popstate handler.** On Back or Forward, a URL with no `?mode=` now restores `'matrixmystics'` instead of `null`, so the landing view stays consistent.

No server or backend files were touched.

## 5. Testing and Verification

- `npm run lint` in `client`: 0 errors (123 existing warnings in CI).
- `npm run build` in `client`: succeeded.
- &#91;Confirm before submitting: opened the root URL with no `?mode=` and checked that Matrix Mystics questions render.\]
- &#91;Confirm before submitting: ran `curl localhost:4004/matrixmystics-api/stats` and checked that topic and module counts came back.\]

## 6. Problems Faced and How I Solved Them

### Working on the wrong branch

My edit was first made on my old `fix/fold-guess-the-number-210` branch, whose pull request was already merged. I moved the change to a fresh branch, `fix/revive-matrixmystics-221`, created from `upstream/main`, using `git stash` and `git stash pop`.

### Client lint failed in CI

The CI check `Tests / Client lint` failed even though lint showed 0 errors, and the exit code was 2. At first I thought the 123 warnings were the cause. The real cause was the last line of the output: a stale entry in `client/eslint-suppressions.json` (`src/detective-app.jsx`, rule `react-hooks/set-state-in-effect`) that no longer matched any warning. I fixed it with `npm run lint -- --prune-suppressions`, checked that the diff removed only that one entry, and committed it as a separate change.

### Dependency audit failure

The `Dependency audit (server)` check also failed. My change touches only client code, so it is unrelated to this pull request. \[Update with the final outcome, for example whether it also fails on main.\]

### Earlier pull request

An earlier pull request for this issue, #392 by another contributor, had been rejected, so I read its feedback first to avoid the same mistakes.

## 7. Git Workflow Followed

1. Forked the repository and added the official repository as `upstream`.
2. Created a clean branch from `upstream/main`.
3. Staged only the files I changed and never used `git add .`, because the working folder also held unrelated files such as `node_modules`.
4. Pushed to my fork (`origin`) and opened the pull request against `vicharanashala/tenali` on `main`.
5. Merged `upstream/main` before opening the pull request to check for conflicts.

## 8. What I Learned

- How to read CI logs and tell a real failure from a misleading one.
- How ESLint suppressions work and why a fixed warning can fail a build.
- How to move uncommitted work to a new branch with `git stash`.
- How to keep a pull request small by staging only the intended files.
- The value of stating assumptions in the pull request when the maintainers have not answered an open question.

## 9. Links

- Issue: https://github.com/vicharanashala/tenali/issues/221
- Pull request: https://github.com/vicharanashala/tenali/pull/525
- Related issue (main-branch counterpart): #224
- Dependency: #220

## 10. Status

&#91;Fill in: pull request status (open, merged or changes requested) and the date.\]

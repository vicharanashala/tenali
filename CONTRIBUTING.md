# Contributing to Tenali

Welcome, and thank you for your interest in contributing to Tenali! 

We welcome contributions from everyone, whether it's fixing a bug, adding a new feature, improving documentation, or suggesting an idea.

## How to Contribute

### 1. Work only from issues already listed on the repo

**Do not open a PR for something you thought of yourself — every PR must close an issue that already exists on the tracker.** If you've spotted a bug or have a feature idea that isn't filed yet, open an issue describing it and wait for it to be scoped before writing any code. A PR that isn't tied to a listed issue will be rejected regardless of how good the change is — this isn't a judgment call on the code, it's a process rule everyone is held to equally.

### 2. Making Changes
- **Fork the repository** and clone it locally.
- **Create a branch** for your changes, named `<type>/<short-description>` — `feat/add-new-quiz-mode` or `fix/login-bug`, not `feature/...` (see the [README's branch table](README.md#-quick-start) for the full list of prefixes actually in use: `feat`, `fix`, `chore`, `docs`, `refactor`).
- **Make your changes**. Ensure your code is clean and readable.

### 3. Quality Checks
These are what CI actually runs on every PR (see `.github/workflows/test.yml`) — matching them locally means you're not surprised by a red check:
- **Client tests:** `cd client && npm test` (see [Frontend Testing](#frontend-testing) below).
- **Client lint:** `cd client && npm run lint` (currently non-blocking in CI until `App.jsx` is split up — but please still run it and fix what you introduce).
- **Server tests:** `cd server && npm test`.
- **BKT unit check:** `node server/lib/bkt.test.js`.
- If you fix existing lint issues, run `npx eslint . --prune-suppressions` to remove obsolete entries from `eslint-suppressions.json`.

There is no `npm run format` or root-level `npm run build`/`npm run test` in this repo — don't rely on tooling docs that assume a single unified script at the root; `client/` and `server/` are separate npm packages with their own scripts.

### 4. Submitting a Pull Request
- Push your branch to your fork.
- Open a Pull Request against the `main` branch.
- **Your PR description must include `Closes #N`**, referencing the issue this PR addresses (see §1) — a PR without this link will be rejected.
- Describe what changed and why; add screenshots if your changes affect the UI. (There is currently no `.github/PULL_REQUEST_TEMPLATE.md` in this repo, so there's no checklist to fill out — just a clear description.)
- **Keep your branch mergeable.** Any PR with a merge conflict against `main` is an automatic rejection — this is not reviewed for exceptions, resolve the conflict and push again.
- **Never render hardcoded/fallback data as if it were live production data** — if an API call fails or returns empty, show a real loading, error, or empty state instead of silently substituting placeholder records. (See [FLN #449](https://github.com/vicharanashala/fln/issues/449) for a concrete example of exactly this failure mode and why it's an automatic finding, not a style preference.)
- Wait for a maintainer to review your code. We may request some changes before merging!
- **New contributors:** submit the [Onboarding Document](README.md#-contributor-onboarding-mandatory) to `Ideas/` before your first PR — see the README for the required sections.

## Frontend Testing

The client uses **Vitest** with **Testing Library** and a **jsdom** environment. Configuration lives in `client/vitest.config.js` (which layers test settings on top of `client/vite.config.js`); global setup is `client/test/setup.js`, which registers the `@testing-library/jest-dom` matchers and clears `localStorage` after every test.

### Running tests

```bash
cd client
npm test            # single run (what CI runs)
npm run test:watch  # watch mode — re-runs on file changes
```

### Test naming and location

- Name files `*.test.js` or `*.test.jsx` (e.g. `conceptApi.test.js`).
- Colocate the test next to the code it tests unless the surrounding directory already uses a different convention — `src/lib/concept/conceptApi.test.js` sits beside `src/lib/concept/conceptApi.js`.

### What to test (and what not to)

Target extracted modules and components such as:

- `client/src/features/tiles.js`
- `client/src/lib/concept/*`
- individual React components once they are extracted out of `App.jsx`

**Testing the full `App.jsx` is explicitly out of scope** — it is a 70k-line monolith that imports most of the app, so it stays untested until the planned component-extraction work progresses. Do not refactor it as part of a test PR.

### Mocking fetch

API tests must never make real network requests. Stub the global `fetch` with `vi.stubGlobal` / `vi.fn()` and assert on the outcomes your code actually returns or throws. `client/src/lib/concept/conceptApi.test.js` is the reference example — it shows how to simulate:

- a successful JSON response
- a rejected fetch (network failure)
- an HTTP error response such as 401
- a non-JSON / malformed response body

Reset stubs between tests (`vi.unstubAllGlobals()` in `afterEach`, a fresh mock in `beforeEach`) so tests cannot affect each other.

### localStorage and authentication

Several modules read auth state (e.g. the JWT under `tenali-auth-token`) from `localStorage`. jsdom provides a real `localStorage`, so tests can seed a fake value before the call and let the setup file's global `afterEach` clear it. **Never use a real credential or depend on an actual authenticated session** — a fake token string in the test is enough, as demonstrated in `conceptApi.test.js`.

### Testing philosophy

Write React component tests with Testing Library and assert on **what a user can perceive** — text, roles, accessible names, visible state — rather than React implementation details (internal state, component instances, hook mechanics). If a test breaks when you refactor a component without changing its behaviour, it is testing the wrong thing.

## Core Maintainers & Interns
If you are joining as a dedicated intern or a core maintainer, please refer to the `docs/` directory in this repository for more in-depth guidelines, RFC templates, and project standards.

Thank you for helping make Tenali better!

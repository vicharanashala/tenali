# Contributing to Tenali

Welcome, and thank you for your interest in contributing to Tenali! 

We welcome contributions from everyone — whether fixing a bug, adding an educational feature, improving documentation, or refining developer tooling.

---

## 1. Governance & Contribution Rules

### 1.1 Work only from approved issues
**Every pull request must close an approved issue already tracked on the repository (`Closes #N`).** Do not open an unprompted PR for unsolicited changes. If you identify a bug or have an educational feature idea, open an issue using the appropriate template ([`.github/ISSUE_TEMPLATE/feature_proposal.md`](.github/ISSUE_TEMPLATE/feature_proposal.md)) and wait for maintainer triage and assignment before writing code. PRs not linked to an approved issue will be rejected.

### 1.2 Two-Stage RFC Workflow for Major Features
Major features and new learning vertical modules must follow the **Two-Stage RFC Workflow** detailed in [`docs/contributing/rfc-process.md`](docs/contributing/rfc-process.md):
1. **Stage 1:** Propose via a GitHub Issue using `.github/ISSUE_TEMPLATE/feature_proposal.md`.
2. **Stage 2:** Upon maintainer approval, draft an RFC in `docs/rfcs/<module>/000X-<feature-name>.md` using [`docs/templates/0000-rfc-template.md`](docs/templates/0000-rfc-template.md) and implement your modular code in a feature branch.

*(Bug fixes, documentation improvements, and minor chore tasks do not require an RFC document, but still require an approved issue and the standard PR checklist.)*

### 1.3 Target Branch: `demo`
**All Pull Requests must target the `demo` branch**, which serves as Tenali's canonical active development branch. PRs submitted against `main` will be asked to re-target `demo`.

### 1.4 Branch Naming Convention
Always branch off the latest `upstream/demo`. Use standardized prefixes:
- `feat/<short-description>` (e.g. `feat/fraction-number-line`)
- `fix/<short-description>` (e.g. `fix/bkt-edge-case`)
- `docs/<short-description>` (e.g. `docs/update-orientation`)
- `chore/<short-description>` (e.g. `chore/eslint-cleanup`)
- `refactor/<short-description>` (e.g. `refactor/extract-tile-helpers`)

*(Note: Use `feat/`, not `feature/`)*

### 1.5 Concurrency Lock Zones
To prevent merge conflicts across parallel contributors and AI agents:
- **Red Zone (Hard Lock):** Do **NOT** modify `client/src/App.jsx` (~67.4k lines) or `server/index.js` (~2.9k lines) without explicit architectural assignment. Develop modular components under `client/src/apps/<module>/` or routes under `server/routes/`.
- Refer to [`AGENTS.md`](AGENTS.md) and [`docs/map.md`](docs/map.md) for full concurrency rules.

---

## 2. Quality Checks & Verification

CI runs automated checks on every PR (see `.github/workflows/test.yml`). Run them locally before opening your PR:

1. **Client tests:**
   ```bash
   cd client
   npm test
   ```
2. **BKT unit verification:**
   ```bash
   node server/lib/bkt.test.js
   ```
3. **Client lint:**
   ```bash
   cd client
   npm run lint
   ```
   *Current baseline: 0 errors, 117 warnings. Ensure you introduce 0 new errors or warnings.*
4. **Production client build:**
   ```bash
   cd client
   npm run build
   ```
5. **Human Acceptance Testing (Mandatory Gate):**
   Automated tests are necessary but not sufficient. You must manually verify the feature in your browser across viewport sizes, ensure interactive mechanics behave properly, and provide step-by-step reproduction instructions in your PR.

---

## 3. Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feat/<short-description>
   ```
2. **Open a Pull Request** against upstream `demo`.
3. Complete the [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) checklist:
   - Include `Closes #N` linking your approved issue.
   - Confirm branch targets `demo`.
   - List verification commands executed.
   - Include clear manual testing instructions and UI screenshots/recordings.
4. **Keep your branch mergeable.** PRs with merge conflicts against `demo` will require local rebase/merge before review.
5. **Never substitute fake/hardcoded data for live production state.** If an API call fails or returns empty, show authentic loading, error, or empty UI states.
6. Await maintainer review. Be prepared to demo or discuss changes at standups.

---

## 4. Frontend Testing Guide

Tenali's client uses **Vitest** with **React Testing Library** and a **jsdom** environment (`client/vitest.config.js`).

### Running tests
```bash
cd client
npm test            # single run (matches CI)
npm run test:watch  # watch mode for local development
```

### Test naming and location
- Name test files `*.test.js` or `*.test.jsx`.
- Colocate tests alongside the module under test (e.g., `client/src/lib/concept/conceptApi.test.js` next to `conceptApi.js`).
- Test extracted modular components, features, and utility libraries.

### Mocking network and authentication
- API tests must never make real network requests. Stub global `fetch` with `vi.stubGlobal` / `vi.fn()` (see `client/src/lib/concept/conceptApi.test.js` as reference).
- Use mock tokens for `localStorage` authentication states (`tenali-auth-token`). Never use real credentials.

---

## 5. Contributor Onboarding & Reference

- **New Contributors & Interns:** Start with the [Orientation Guide](docs/contributing/orientation.md).
- **Core Architecture & Navigation:** See [Repository Map](docs/map.md).
- **AI Agent & Multi-Agent Workflows:** See [AGENTS.md](AGENTS.md).
- **Design Tokens & UI Styling:** See [UI Guidelines](docs/design/ui-guidelines.md).

Thank you for contributing to Tenali and helping make open math learning accessible to everyone!

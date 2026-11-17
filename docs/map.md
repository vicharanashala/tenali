# Tenali Repository Navigation & Source-of-Truth Map (`docs/map.md`)

This document is the **navigational index and source-of-truth directory** for the Tenali codebase. All human contributors and AI assistants should consult this map to locate authoritative rules, module boundaries, data sources, and test infrastructure.

---

## 1. Source-of-Truth Hierarchy

When information across the repository conflicts, resolve authority using this strict precedence:

1. **Executable Code & Manifests (Tier 1)**: `package.json`, `client/package.json`, `server/package.json`, `.github/workflows/`, and running code are always authoritative over written prose.
2. **Universal Governance (Tier 2)**: [`AGENTS.md`](../AGENTS.md) governs all AI assistants; [`CONTRIBUTING.md`](../CONTRIBUTING.md) governs human contribution workflows.
3. **Repository Navigation (Tier 3)**: [`docs/map.md`](map.md) indexes the authoritative paths across the repository.
4. **Specialized Skills & Design Specs (Tier 4)**: Rules under `skills/`, `docs/specs/`, `docs/design/`, and `docs/contributing/`.
5. **Tool Adapters (Tier 5)**: `CLAUDE.md`, `GEMINI.md`, Copilot instructions, and Cursor rules point directly to Tier 2.

---

## 2. Directory Map & Functional Responsibilities

```text
/
├── README.md                          # Project overview and topic catalog
├── CONTRIBUTING.md                    # Canonical human contributor guidelines
├── AGENTS.md                          # Canonical operating policy for all AI tools
├── CLAUDE.md, GEMINI.md               # Tool discovery adapters
├── CHANGELOG.md, CONTRIBUTORS.md      # Auto-generated commit and contributor metrics
│
├── docs/                              # Centralized documentation hierarchy
│   ├── map.md                         # This file: navigation & source-of-truth map
│   ├── contributing/                  # Contributor onboarding & RFC review process
│   ├── specs/                         # Pedagogical problem statements and learning requirements
│   ├── design/                        # UI design system and CSS tokens
│   ├── features/                      # Subsystem and feature specifications
│   └── operations/                    # Deployment topology and server configuration
│
├── archive/                           # Central repository archive & master inventory
│   ├── README.md                      # Archive policy and retention guidelines
│   ├── inventory.md                   # Canonical archive registry & maintainer decision aid
│   ├── application-snapshots/         # Historical App.jsx merge conflict copies
│   ├── generated-artifacts/           # One-time JSON conflict dumps & log files
│   ├── scripts/                       # Historical scratch tools & batch migration scripts
│   ├── docs/                          # Superseded SRS specifications, plans, and session logs
│   └── prototypes/                    # Standalone prototypes (addition, squareroot)
│
├── client/                            # Frontend Single Page Application (React 19 + Vite 8)
│   ├── src/
│   │   ├── apps/                      # Extracted standalone quiz and lab applications
│   │   ├── components/                # Shared UI components (Home, Nav, Cards, Modals, Hints)
│   │   ├── features/                  # Pure data registries (tiles.js)
│   │   ├── monsters/                  # Misconception diagnostic subsystem
│   │   ├── proctor/                   # Exam supervision and anti-cheat subsystem
│   │   ├── vachana/                   # Mathematical literacy and verbal math lab
│   │   ├── language/                  # Crosswords, Word Search, and Word Creator
│   │   ├── treasurehunt/              # Interactive treasure hunt math game
│   │   ├── lib/                       # Math value parsers, BKT client, i18n
│   │   ├── App.jsx                    # Legacy frontend monolith (~67.4k lines)
│   │   └── App.css                    # Centralized CSS design system and variables
│   ├── public/                        # Static assets (3D models, cards, badges, audio)
│   └── vite.config.js                 # Vite configuration and API proxy mounts
│
├── server/                            # Backend API & Static Host (Node.js + Express 5)
│   ├── routes/                        # Modular domain routers (arithmetic, algebra, geometry, etc.)
│   ├── lib/                           # Core engines (bkt.js, mathValueParser.js, spacingLadder.js)
│   ├── hints/                         # Stepped timeline hints and explanation generators
│   ├── models/                        # Mongoose data schemas (User, Progress, Session)
│   ├── deploy/                        # Production systemd and Nginx deployment templates
│   └── index.js                       # Server entry point (~2.9k lines)
│
├── skills/                            # Canonical agent skills and curriculum bridging guides
│   ├── tenali-repository-governance/  # Git safety, boundary enforcement, and publication rules
│   ├── tenali-modular-development/    # Component extraction and anti-monolith guidelines
│   ├── tenali-consistent-output/      # Design system, styling tokens, and code conventions
│   ├── tenali-testing-and-verification/# Local test execution and truthful verification
│   ├── tenali-documentation-maintenance/# Link validation and source-of-truth rules
│   ├── tenali-code-review/            # Evidence-based review and regression analysis
│   ├── tenali-rfc-workflow/           # Two-stage RFC feature proposal process
│   └── igcse-chapter/                 # Cambridge IGCSE chapter module conventions
│
├── supermarket/                       # Preserved topic specifications (45 topic SKILL.md specs)
│
├── [DATA BANKS]
│   ├── vocab/questions/               # 7,662 Vocabulary question JSON files
│   ├── chitragupta/questions/         # 991 General Knowledge question JSON files
│   └── conceptual/questions/          # Conceptual MCQ question datasets
│
├── .github/                           # CI/CD Workflows & Automation
│   ├── workflows/test.yml             # Primary CI pipeline (BKT, client lint, Vitest, contract)
│   ├── scripts/pr-gate-check.js       # Parikshak PR bot (issue link, mergeability, lockfiles)
│   ├── PULL_REQUEST_TEMPLATE.md       # Standard PR submission checklist
│   └── ISSUE_TEMPLATE/                # Bug report and feature proposal templates
│
├── scripts/                           # Maintenance scripts (update-readme-contributors.js)
└── Ideas/                             # Contributor onboarding records (mandatory for new devs)
```

---

## 3. High-Conflict Concurrency Lock Zones

- **Red Zone (Strictly Serialized)**:
  - `client/src/App.jsx`
  - `server/index.js`
  - `package.json`, `client/package.json`, `server/package.json`
  - `package-lock.json`
  - *Rule*: Only one developer or agent may edit at a time. All changes must be minimal (e.g. single-line imports).
- **Amber Zone (Append-Only Registries)**:
  - `client/src/features/tiles.js`
  - `client/vite.config.js`
  - *Rule*: Append-only. Never reorder existing keys.
- **Green Zone (Concurrent & Isolated)**:
  - `client/src/apps/*`
  - `server/routes/*`
  - `docs/*`
  - `skills/*`
  - *Rule*: Fully concurrent editing permitted without collision risk.

---

## 4. Test & Build Execution Matrix

There is no unified root-level `npm test` script. Run tests within their respective packages:

| Check | Exact Command | Scope & Requirements |
|---|---|---|
| **Server Core BKT** | `node server/lib/bkt.test.js` | Zero dependencies; uses Node's built-in `assert`. Runs instantly. |
| **Frontend Build** | `cd client && npm run build` | Bundles React 19 SPA via Vite 8. Verifies syntax and imports. |
| **Frontend Lint** | `cd client && npm run lint` | ESLint 9 checks. Baseline: 0 errors, 117 warnings (`continue-on-error: true`). |
| **Frontend Tests** | `cd client && npm test` | Vitest + JSDOM suite. Requires `npm ci` in `client/`. |
| **Backend Tests** | `cd server && npm test` | Vitest + Supertest suite. Contract tests require MongoDB 7 service. |

---

## 5. Development & Contribution Workflows

1. **Bug Fixes & Routine Docs**:
   - Issue filed -> Branch `fix/<short-description>` or `docs/<short-description>` -> Implement -> Verify -> PR targeting **`demo`** linking `Closes #N`.
2. **Substantial Features & Architecture Changes**:
   - Follow the **Two-Stage RFC Workflow** detailed in [`docs/contributing/rfc-process.md`](contributing/rfc-process.md):
     - Stage 1: Issue -> `docs/rfcs/<module>/000X-name.md` -> RFC-only PR -> Maintainer approval.
     - Stage 2: Feature branch `feat/<name>` -> Implementation + tests -> PR targeting **`demo`**.

---

## 6. Root Directory Classification & Inventory (44 Entries)

An exhaustive audit of all 44 immediate entries inside the repository root (24 files + 20 directories) was completed to eliminate confusion and establish clear provenance:

| Category | Type | Name | Purpose & Provenance | Status / Retention Rule |
|---|---|---|---|---|
| **Cat A: Root Essential** | File | `README.md` | Primary repo portal & topic catalog; auto-updated by bot | **Retained** at root. |
| **Cat A: Root Essential** | File | `CONTRIBUTING.md` | Canonical contributor guidelines & PR rules | **Retained** at root. |
| **Cat A: Root Essential** | File | `AGENTS.md` | Canonical universal operating policy for all AI agents | **Retained** at root. |
| **Cat A: Root Essential** | File | `CLAUDE.md`, `GEMINI.md` | Tool-specific instruction adapters pointing to `AGENTS.md` | **Retained** at root. |
| **Cat A: Root Essential** | File | `package.json`, `package-lock.json` | Bot manifest for `update-readme.yml` CI workflow | **Retained** at root (Red Zone). |
| **Cat A: Root Essential** | File | `CHANGELOG.md`, `CONTRIBUTORS.md` | Generated metrics updated every 12h by GitHub Actions | **Retained** at root (Required by CI bot). |
| **Cat A: Root Essential** | File | `.gitignore` | Git ignore specification (includes OS, logs, scratch) | **Retained** at root. |
| **Cat A: Root Essential** | File | `.env.example` | Environment variable template for server and CompreFace | **Retained** at root. |
| **Cat A: Root Essential** | File | `docker-compose.override.yml` | CompreFace facial recognition container configuration | **Retained** at root. |
| **Cat A: Root Essential** | File | `render.yaml` | Render cloud deployment blueprint | **Retained** at root. |
| **Cat A: Root Platform** | Dir | `.github/` | CI/CD workflows, PR template, issue templates, bots | **Retained** at root. |
| **Cat A: Root Platform** | Dir | `.cursor/` | Cursor IDE agent rules pointing to `AGENTS.md` | **Retained** at root. |
| **Cat A: Root Platform** | Dir | `.vscode/` | VS Code launch configurations (`launch.json`) | **Retained** at root. |
| **Cat B: Core Subsystem** | Dir | `client/` | React 19 + Vite 8 frontend SPA | **Retained** at root. |
| **Cat B: Core Subsystem** | Dir | `server/` | Express 5 backend API server & static host | **Retained** at root. |
| **Cat B: Core Subsystem** | Dir | `docs/` | Centralized documentation hierarchy | **Retained** at root. |
| **Cat B: Core Subsystem** | Dir | `skills/` | Canonical agent skills + curriculum bridging guides | **Retained** at root. |
| **Cat B: Core Subsystem** | Dir | `scripts/` | Contributor bots and maintenance utilities | **Retained** at root. |
| **Cat B: Core Subsystem** | Dir | `Ideas/` | Contributor onboarding documents | **Retained** at root. |
| **Cat B: Runtime Data** | Dir | `vocab/` | 7,662 vocabulary questions loaded by server | **Retained** at root (Runtime data bank). |
| **Cat B: Runtime Data** | Dir | `chitragupta/questions/` | 991 General Knowledge questions loaded by server | **Retained** at root (Runtime data bank; legacy client/server moved to `archive/prototypes/chitragupta/`). |
| **Cat B: Runtime Data** | Dir | `concept/` | Topic definitions for `/concept-api` | **Retained** at root (Runtime data bank). |
| **Cat B: Runtime Data** | Dir | `conceptual/` | Conceptual MCQ question banks loaded by server | **Retained** at root (Runtime data bank). |
| **Cat B: Runtime Data** | Dir | `linearalgebra/` | Matrix Mystics & LA mission quiz data bank | **Retained** at root (Runtime data bank). |
| **Cat B: Web Routes** | Dir | `graph/` | Prerequisite DAG visualization mounted at `/graph` | **Retained** at root (Dynamic route). |
| **Cat B: Web Routes** | Dir | `enhanced/` | Enhanced landing page mounted at `/enhanced` | **Retained** at root (Dynamic route). |
| **Cat B: Preserved Specs**| Dir | `supermarket/` | 45 topic specifications (mandated to preserve) | **Retained** at root. |
| **Cat D: Developer Scripts**| File | `scripts/check_errors.sh` | Syntax-checks server and builds client SPA dynamically | **Active in `scripts/`** (generalized). |
| **Cat D: Developer Scripts**| File | `scripts/setup_mongo.sh` | macOS Homebrew MongoDB install utility | **Active in `scripts/`**. |
| **Cat D: Developer Scripts**| File | `scripts/test_supertables.sh` | Sliding-window simulation for `SuperTables1` | **Active in `scripts/`**. |
| **Cat D: Developer Scripts**| File | `archive/scripts/dev/git-push.sh` | Shell auto-push script (modifies `App.jsx`, force pushes) | **Archived**: Prohibited for automated agent runs. |
| **Cat E: OS Disposable** | File | `.DS_Store` | macOS desktop metadata | **Removed** from tracking; added to `.gitignore`. |
| **Cat F: Historical Remnant**| File | `App_ours.jsx` (5.47 MB) | Merge conflict remnant from commit `091fda00` (July 2026) | **Archived** to `archive/application-snapshots/App_ours.jsx`. |
| **Cat F: Historical Remnant**| File | `git_app.jsx` (5.52 MB) | Merge conflict remnant from commit `091fda00` (July 2026) | **Archived** to `archive/application-snapshots/git_app.jsx`. |
| **Cat F: Historical Remnant**| File | `conflicts.json` (51 KB) | JSON conflict markers from commit `091fda00` (July 2026) | **Archived** to `archive/generated-artifacts/conflicts.json`. |
| **Cat F: Historical Remnant**| File | `git_log.txt` (20.7 KB) | UTF-16LE log dump from commit `091fda00` (July 2026) | **Archived** to `archive/generated-artifacts/git_log.txt`. |
| **Cat F: Historical Remnant**| File | `hints_injected.json` (842 B) | Hint injection output from commit `091fda00` (July 2026) | **Archived** to `archive/generated-artifacts/hints_injected.json`. |
| **Cat F: Historical Remnant**| File | `extracted_batches.json` (2 B)| Empty `{}` JSON from commit `0ccbd08d` (August 2026) | **Archived** to `archive/generated-artifacts/extracted_batches.json`. |
| **Cat F: Standalone Prototype**| Dir | `scratch/` | 7 developer scripts from July 2026 hint-injection work | **Archived** to `archive/scripts/scratch/`. |
| **Cat F: Standalone Prototype**| Dir | `addition/` | Legacy standalone addition prototype | **Archived** to `archive/prototypes/addition/`. |
| **Cat F: Standalone Prototype**| Dir | `squareroot/` | Legacy standalone squareroot prototype | **Archived** to `archive/prototypes/squareroot/`. |
| **Cat G: Protected User Work** | Git | `main` commits | 4 division-module commits (`bae37c0d`, `1fe1e646`, etc.) | **Strictly Preserved** on local `main`. |
| **Cat G: Protected User Work** | Git | `feat/division-fair-sharing` | Division fair-sharing feature branch | **Strictly Preserved**; zero modifications. |

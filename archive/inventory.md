# Tenali Canonical Repository Archive Inventory (`archive/inventory.md`)

This document is the **single authoritative registry and maintainer decision aid** for all archived files, directories, historical snapshots, and prototypes across the Tenali codebase.

---

## 1. Archive Lifecycle & Permanent Deletion Protocol

Material in this archive is preserved to support future engineering decisions, debugging, and auditability. Archiving an item removes it from active runtime and build paths, but retains its Git history.

### Lifecycle Status Definitions
- **Preserved for Historical Context**: Inactive code or documentation illustrating past architecture or milestones.
- **Retained for Reproducibility / Recovery**: One-time scripts, data dictionaries, or generators that can reproduce existing data if corrupted.
- **Candidate for Permanent Deletion (Pending Approval)**: Obsolete redundant copies (e.g. merge conflict dumps) that may be deleted once maintainers confirm they are no longer needed.
- **Awaiting Maintainer Approval**: Items requiring formal sign-off before any further relocation or cleanup.

### 6-Step Deletion Protocol
Before a human maintainer executes `git rm` on any archived item:
1. **Dependency Audit**: Run repository-wide text and path searches to verify zero source imports, tests, manifests, Docker configs, or workflow references exist.
2. **Context & Audit Check**: Confirm the item is not needed for legal, pedagogical, reproducibility, or regression recovery purposes.
3. **Reproducibility Verification**: Verify whether the data is reproducible from source code or Git history.
4. **Git History Inspection**: Verify that Git commit history captures the file's provenance so it can be restored if needed.
5. **Maintainer Sign-Off**: Secure explicit written human sign-off on the proposed deletion.
6. **Update Inventory**: Record the deletion date, reason, and author in this inventory.

---

## 2. Master Archive Catalog

| Archive ID | Original Path | Current Archive Path | Item Type | Description | Reason for Archiving | Dependency Status | Provenance | Reproducibility | Approval Status | Review Date |
|---|---|---|---|---|---|---|---|---|---|---|
| `ARC-SNAP-001` | `App_ours.jsx` | `archive/application-snapshots/App_ours.jsx` | Snapshot (5.47 MB, 48k L) | Local branch snapshot of `App.jsx` during July 2026 merge conflict | Inactive conflict remnant from commit `091fda00` | Confirmed none; 0 references | Commit `091fda00` by harshyy07 | Irrelevant; historical snapshot | Candidate for deletion (Pending approval) | 2026-10-24 |
| `ARC-SNAP-002` | `git_app.jsx` | `archive/application-snapshots/git_app.jsx` | Snapshot (5.52 MB, 49k L) | Remote branch snapshot of `App.jsx` during July 2026 merge conflict | Inactive conflict remnant from commit `091fda00` | Confirmed none; 0 references | Commit `091fda00` by harshyy07 | Irrelevant; historical snapshot | Candidate for deletion (Pending approval) | 2026-10-24 |
| `ARC-GEN-001` | `conflicts.json` | `archive/generated-artifacts/conflicts.json` | JSON (51 KB) | Dump of `ours`/`theirs` merge conflict blocks from July 2026 | Generated artifact from resolved conflict | Confirmed none; 0 references | Commit `091fda00` by harshyy07 | Non-reproducible (scratch dump) | Candidate for deletion (Pending approval) | 2026-10-24 |
| `ARC-GEN-002` | `git_log.txt` | `archive/generated-artifacts/git_log.txt` | Text (20.7 KB, UTF-16LE) | Git patch dump of commit `614c2a5e` | Raw git log output mistakenly committed to root | Confirmed none; 0 references | Commit `091fda00` by harshyy07 | Reproducible via `git log -p 614c2a5e` | Candidate for deletion (Pending approval) | 2026-10-24 |
| `ARC-GEN-003` | `hints_injected.json` | `archive/generated-artifacts/hints_injected.json` | JSON (842 B) | Log of injected hints from July 2026 scratch work | Scratch generation log | Confirmed none; 0 references | Commit `091fda00` by harshyy07 | Non-reproducible | Candidate for deletion (Pending approval) | 2026-10-24 |
| `ARC-GEN-004` | `extracted_batches.json` | `archive/generated-artifacts/extracted_batches.json` | JSON (2 B) | Empty JSON object `{}` | Orphaned scratch artifact from August 2026 merge | Confirmed none; 0 references | Commit `0ccbd08d` by Athira | Trivial `{}` | Candidate for deletion (Pending approval) | 2026-10-24 |
| `ARC-SCR-001` | `scratch/` (7 files) | `archive/scripts/scratch/` | Directory (7 JS scripts) | Developer scripts for hint/XP extraction & AST manipulation | One-time scratch tools used in July 2026 | Confirmed none; 0 references | Commit `091fda00` by harshyy07 | Preserved for reference | Retained for historical context | 2026-10-24 |
| `ARC-MIG-001` | `scripts/fix_batch_*.cjs` (7 files) | `archive/scripts/migrations/fix_batch_*.cjs` | Scripts (7 CJS files) | Content seeders for `client/src/data/learnContent/` (Batches A-G) | One-time migration scripts | Confirmed none; not in package.json/CI | Commits `0ccbd08d`, `a5443997` | Can regenerate learnContent JSON | Retained for reproducibility | 2026-10-24 |
| `ARC-MIG-002` | `scripts/update_batch*.cjs` (8 files) | `archive/scripts/migrations/update_batch*.cjs` | Scripts (8 CJS files) | Content updates for `client/src/data/learnContent/` (Batches 1-8) | One-time migration scripts | Confirmed none; not in package.json/CI | Commits `0ccbd08d`, `a5443997` | Can regenerate learnContent JSON | Retained for reproducibility | 2026-10-24 |
| `ARC-MIG-003` | `scripts/split.cjs`, `scripts/split.js` | `archive/scripts/migrations/split.*` | Scripts (2 JS/CJS files) | Script to split `learnContent.js` into JSON files | One-time migration helper | Confirmed none; not in package.json/CI | Commit `a5443997` | Reproducible | Retained for reproducibility | 2026-10-24 |
| `ARC-LA-001` | `linearalgebra/rewrite_m1q*.py` (3 files) | `archive/scripts/linearalgebra/rewrite_m1q*.py` | Scripts (3 Python files) | Scripts injecting explanations into Mission 1 Q1/Q2 JSON files | One-time data enrichment scripts | Confirmed none; not used at runtime | Linear algebra mission authoring | Deterministic text replacers | Retained for reproducibility | 2026-10-24 |
| `ARC-DOC-001` | `docs/archive/SRS-v4.0.md` | `archive/docs/SRS-v4.0.md` | Markdown spec | System Requirements Specification v4.0 (pre-monolith) | Superseded by current architecture & map | Confirmed none; historical only | Tenali early SRS | Non-reproducible; historical record | Preserved for historical context | 2026-10-24 |
| `ARC-DOC-002` | `docs/archive/session-2026-05-04.md` | `archive/docs/session-2026-05-04.md` | Markdown log | Meeting notes and design log from May 4, 2026 | Historical meeting minutes | Confirmed none; historical only | Contributor working session | Non-reproducible; historical record | Preserved for historical context | 2026-10-24 |
| `ARC-DOC-003` | `docs/archive/plans/2026-07-27-la-quiz-2phase.md` | `archive/docs/plans/2026-07-27-la-quiz-2phase.md` | Markdown plan | Two-phase implementation plan for Linear Algebra quiz | Completed design plan | Confirmed none; historical only | July 2026 LA mission sprint | Non-reproducible; historical record | Preserved for historical context | 2026-10-24 |
| `ARC-PROTO-001` | `addition/` (34 files) | `archive/prototypes/addition/` | Directory (React+Express SPA) | Standalone prototype addition quiz client and server | Superseded by unified `client/` and `server/routes/arithmetic.js` | Confirmed none; standalone app on port 4002 | Vendor commit `4185a9fc` | Preserved with full history | Preserved for recovery / context | 2026-10-24 |
| `ARC-PROTO-002` | `squareroot/` (33 files) | `archive/prototypes/squareroot/` | Directory (React+Express SPA) | Standalone prototype squareroot quiz client and server | Superseded by unified `client/` and `server/routes/sqrt.js` | Confirmed none; standalone app on port 4003 | Vendor commit `4185a9fc` | Preserved with full history | Preserved for recovery / context | 2026-10-24 |
| `ARC-PROTO-003` | `chitragupta/client/`, `chitragupta/server/` (15 files) | `archive/prototypes/chitragupta/` | Directory (React+Express SPA) | Standalone prototype general knowledge quiz client and server | Superseded by unified `client/` and `server/index.js` (/gk-api) | Confirmed none; questions remain active in root `chitragupta/questions/` | Vendor commit `4185a9fc` | Preserved with full history | Preserved for recovery / context | 2026-10-24 |
| `ARC-SCR-002` | `git-push.sh` | `archive/scripts/dev/git-push.sh` | Shell script (~1.5 KB) | Auto-commit and force-push shell utility modifying App.jsx | Dangerous; violates agent safety policies (runs `git add -A` and pushes) | Confirmed none; excluded from automated runs | Early developer convenience script | Preserved for historical context | Preserved for historical context | 2026-10-24 |

---

## 3. Detailed Item Records & Recovery Instructions

### ARC-SNAP-001 & ARC-SNAP-002: Historical App.jsx Merge Snapshots
- **Files**: `App_ours.jsx` (5.47 MB), `git_app.jsx` (5.52 MB)
- **Provenance**: Created July 15, 2026 during a merge conflict resolution when stepped hints were injected into `client/src/App.jsx`.
- **Why Safe to Archive**: They are not imported anywhere in `client/`, `server/`, or CI. They represent intermediate conflict states.
- **Recovery Instructions**: If ever needed for comparing AST structures from July 2026, copy the desired snapshot back to working directory.
- **Deletion Considerations**: Can be permanently deleted once maintainers confirm Git commit history (`091fda00`) is sufficient.

### ARC-GEN-001 through ARC-GEN-004: Conflict Dumps & Logs
- **Files**: `conflicts.json`, `git_log.txt`, `hints_injected.json`, `extracted_batches.json`
- **Provenance**: Created alongside the July 2026 and August 2026 merge conflict resolutions.
- **Why Safe to Archive**: They are raw debugging output files. `git_log.txt` is simply a UTF-16LE text dump of `git log -p 614c2a5e`.
- **Recovery Instructions**: Open directly as text files.
- **Deletion Considerations**: Strong candidates for permanent removal pending maintainer sign-off.

### ARC-SCR-001 & ARC-SCR-002: Developer Utilities & Legacy Push Scripts
- **ARC-SCR-001**: `archive/scripts/scratch/` (7 JS files: `cleanup.js`, `extract.js`, `extractUtils.js`, `fix_app.js`, `inject_hints.js`, `inject_xp.js`, `redesign.js`). One-time AST scripts used for hint injection in July 2026.
- **ARC-SCR-002**: `archive/scripts/dev/git-push.sh`. Early developer script that automatically cleared `.git/*.lock`, updated `App.jsx` versions using `sed`, performed `git add -A`, and force-pushed to remote. Relocated to `archive/` to prevent accidental execution by automated tooling or agents.
- **Recovery Instructions**: Can be inspected or run from `archive/scripts/dev/git-push.sh` for reference on version bump patterns.

### ARC-MIG-001 through ARC-MIG-003: Learn Content Batch Migration Scripts
- **Original Path**: `scripts/fix_batch_*.cjs` (7 files), `scripts/update_batch*.cjs` (8 files), `scripts/split.cjs`, `scripts/split.js`
- **Provenance**: Created by Athira in August 2026 (`0ccbd08d`) to populate `client/src/data/learnContent/*.json`.
- **Why Safe to Archive**: The JSON files in `client/src/data/learnContent/` are already generated, committed, and actively served by the client. The migration scripts are never called in production or CI.
- **Recovery Instructions**: If any learn content JSON file is accidentally corrupted, run `node archive/scripts/migrations/<script_name>.cjs` to regenerate the corresponding topic's content.

### ARC-LA-001: Linear Algebra Explanation Enrichment Scripts
- **Original Path**: `linearalgebra/rewrite_m1q1.py`, `linearalgebra/rewrite_m1q1_mh.py`, `linearalgebra/rewrite_m1q2.py`
- **Provenance**: Python utilities written to update the explanation fields of Mission 1 questions in `linearalgebra/questions/`.
- **Why Safe to Archive**: The explanations were committed directly into the JSON files. The scripts are not called at runtime.
- **Recovery Instructions**: Run `python archive/scripts/linearalgebra/rewrite_m1q1.py` from repository root if explanations need to be re-applied to raw question templates.

### ARC-DOC-001 through ARC-DOC-003: Superseded Specs & Plans
- **Original Path**: `docs/archive/` (relocated to central `archive/docs/`)
- **Provenance**: Historical documentation from early development sprints.
- **Why Safe to Archive**: Provides valuable historical context on early architecture and design intentions, but should not be confused with active specifications in `docs/specs/` or `docs/features/`.
- **Recovery Instructions**: Pure documentation; read directly.

### ARC-PROTO-001 & ARC-PROTO-002: Standalone Addition & Square Root Prototypes
- **Original Paths**: `addition/` (34 files), `squareroot/` (33 files)
- **Provenance**: Vendored in commit `4185a9fc` during early exploratory prototyping before Tenali was consolidated into a single client/server architecture.
- **Why Safe to Archive**: Neither prototype is imported, proxied, built, or deployed. The main Tenali application serves addition via `/addition-api` (`server/routes/arithmetic.js`) and square roots via `/sqrt-api` (`server/routes/sqrt.js`).
- **Recovery Instructions**: To run either prototype independently:
  ```powershell
  cd archive/prototypes/addition/server && npm start # runs on port 4002
  cd archive/prototypes/addition/client && npm run dev
  ```
- **Deletion Considerations**: Retained permanently in `archive/prototypes/` as reference implementations of early modular micro-apps.

### ARC-PROTO-003: Standalone Chitragupta Prototype
- **Original Paths**: `chitragupta/client/` (14 files), `chitragupta/server/` (1 file)
- **Provenance**: Vendored in commit `4185a9fc` during early exploratory prototyping of the GK quiz module.
- **Why Safe to Archive**: All 991 active question datasets remain in the root data bank `chitragupta/questions/` which `server/index.js:76` loads at startup. The standalone client and server components have been superseded by the main client SPA and unified Express server.
- **Path Resolution in Code**: `archive/prototypes/chitragupta/server/index.js` was updated to dynamically resolve question datasets from either local `../questions` or root `chitragupta/questions/`.
- **Recovery Instructions**: To run the prototype independently:
  ```powershell
  cd archive/prototypes/chitragupta/server && node index.js # runs on port 4001
  cd archive/prototypes/chitragupta/client && npm run dev
  ```
- **Deletion Considerations**: Retained permanently in `archive/prototypes/` for historical reference.

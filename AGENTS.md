# Tenali Agent Operating Policy (AGENTS.md)

This document is the **single authoritative entry point** and operating contract for all AI coding agents, assistants, and automated tooling operating in the Tenali repository (`https://github.com/vicharanashala/tenali`).

Every agent—regardless of vendor, model, or interface—must strictly follow these universal rules. Tool-specific adapters (`CLAUDE.md`, `GEMINI.md`, Copilot instructions, Cursor rules) must reference this document rather than maintaining competing rules.

---

## 1. Universal Agent Operating Contract

1. **Pre-flight State Verification**: Establish the repository root, active branch, HEAD commit, and working-tree status before inspecting or touching files. Never assume the branch or working-tree state.
2. **Consult the Repository Map**: Understand the task scope and consult [`docs/map.md`](docs/map.md) to locate authoritative documentation, module boundaries, data sources, and test scripts.
3. **Ground Truth Over Stale Prose**: Inspect real code, configuration, tests, package manifests, and CI workflows. When documentation contradicts executable code or manifests, executable code is authoritative.
4. **Preserve User Work**: Never overwrite, discard, move, rebase, or reset uncommitted user changes or commits on other branches (including the division-module commits on local `main`).
5. **Strict Scope & Branch Boundaries**: Work only within the authorized working branch and approved task scope. If an action requires switching branches or synchronizing from remotes, stop and request approval.
6. **Modular Development Requirement**: Never place new module implementations into [`client/src/App.jsx`](client/src/App.jsx). All new features must follow the modular architecture detailed in [`skills/tenali-modular-development/SKILL.md`](skills/tenali-modular-development/SKILL.md) and [`client/src/apps/README.md`](client/src/apps/README.md).
7. **Descriptive, Minimal, Logically Grouped Changes**: Keep changes cohesive and minimal. Never combine unrelated refactoring, mass reformatting, or dependency upgrades with feature work.
8. **Respect RFC and PR Workflows**:
   - Substantial product or architectural features follow a **two-stage workflow**: an RFC-only PR (under `docs/rfcs/`), formal approval, followed by a separate implementation PR.
   - Small bug fixes and routine documentation updates use the standard issue-linked PR workflow.
   - Every PR must link to an open, tracked issue (`Closes #N`). Never invent issue numbers.
   - The primary PR target for development contributions is **`demo`**.
9. **Security & Boundary Protection**:
   - Never commit credentials, private keys, API tokens, or personal environment details.
   - Never render hardcoded/mock data as if it were live production API responses (FLN #449 policy).
   - **Agents must never push to any remote branch or create pull requests without explicit human sign-off.**
10. **Test & Report Honestly**: Execute relevant local tests and builds before declaring work complete. Record exact commands and actual results. Never claim a check passed if it was not run.
11. **Documentation Integrity**: Update relevant documentation and relative links when moving or modifying files. Preserve comments and docstrings.
12. **Provide Reviewable Diff & Manual Checklist**: Summarize the diff and provide a step-by-step manual testing checklist for the human maintainer.
13. **Mandatory Acceptance Checkpoint**: Following implementation and automated checks, halt at the visible status:  
    `WAITING_FOR_HUMAN_MANUAL_TEST`  
    Wait for the human maintainer to manually verify the application before recommending any publication.
14. **Truth in Execution**: Never report a test, review, commit, push, or PR action as successful unless confirmed by tool execution output.

---

## 2. Specialized Skills Reference

Detailed domain procedures are codified in modular skill specifications under `skills/`:

| Skill | Path | Purpose |
|---|---|---|
| **Repository Governance** | [`skills/tenali-repository-governance/SKILL.md`](skills/tenali-repository-governance/SKILL.md) | Safe git operations, boundary contracts, branch safety, issue requirements |
| **Modular Development** | [`skills/tenali-modular-development/SKILL.md`](skills/tenali-modular-development/SKILL.md) | Component extraction patterns, modular file boundaries, avoiding App.jsx bloat |
| **Consistent Output** | [`skills/tenali-consistent-output/SKILL.md`](skills/tenali-consistent-output/SKILL.md) | Styling tokens, naming conventions, i18n, error handling, accessibility |
| **Testing & Verification** | [`skills/tenali-testing-and-verification/SKILL.md`](skills/tenali-testing-and-verification/SKILL.md) | BKT unit tests, Vitest suites, client build checks, lint baseline reporting |
| **Documentation Maintenance**| [`skills/tenali-documentation-maintenance/SKILL.md`](skills/tenali-documentation-maintenance/SKILL.md) | Source-of-truth rules, link validation, archival standards, map maintenance |
| **Code Review** | [`skills/tenali-code-review/SKILL.md`](skills/tenali-code-review/SKILL.md) | Evidence-based diff inspection, regression analysis, boundary verification |
| **RFC Workflow** | [`skills/tenali-rfc-workflow/SKILL.md`](skills/tenali-rfc-workflow/SKILL.md) | Two-stage feature proposal and review protocol |

---

## 3. High-Conflict Concurrency Zones

To prevent merge collision disasters (such as unmerged conflict files), observe these zone restrictions:

- **Red Zone (Serialized)**: `client/src/App.jsx`, `server/index.js`, `package.json`, `package-lock.json`.  
  *Rule*: Only one agent or task may edit these files at a time. Minimize changes to single-line import/registration calls.
- **Amber Zone (Append-Only Registries)**: `client/src/features/tiles.js`, `client/vite.config.js`.  
  *Rule*: Append-only. Never reorder existing keys.
- **Green Zone (Concurrent & Isolated)**: `client/src/apps/*`, `client/src/components/*`, `server/routes/*`, `docs/*`.  
  *Rule*: Fully concurrent edits permitted without collision risk.

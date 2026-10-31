---
name: tenali-documentation-maintenance
description: Keep Tenali documentation accurate, navigable, and synchronized with actual source code and configuration. Enforce source-of-truth rules and validate links.
---

# Tenali Documentation Maintenance Skill

## 1. Purpose & Trigger
Use this skill whenever creating, modifying, relocating, or archiving documentation in the Tenali repository.

## 2. Core Documentation Principles

### 1. Code Over Prose (Ground Truth)
- When a document contradicts package manifests, CI workflows, or running code, **the code is authoritative**.
- Documentation must be updated to reflect reality, rather than treating outdated documentation as a bug report against working code.

### 2. Single Authoritative Source
- Avoid spreading duplicate rules across multiple files.
- Universal agent rules live in [`AGENTS.md`](../../AGENTS.md).
- Human contributor policies live in [`CONTRIBUTING.md`](../../CONTRIBUTING.md).
- System map and source-of-truth index live in [`docs/map.md`](../../docs/map.md).
- Specialized adapters (`CLAUDE.md`, `GEMINI.md`) must be concise pointers to `AGENTS.md`.

### 3. Maintain Minimal Root
- Substantive documentation belongs under `docs/`:
  - `docs/architecture/`: Technical design and component blueprints
  - `docs/contributing/`: Intern orientation and RFC process guides
  - `docs/specs/`: Pedagogical problem statements and curricula
  - `docs/features/`: Feature-specific documentation (e.g. Conceptual MCQs, Reflection Journal)
  - `docs/operations/`: Deployment topology, Nginx templates, and service guides
  - `archive/docs/`: Superseded historical specifications and legacy session logs
- Central repository archive lives at root `/archive/` with canonical registry in `archive/inventory.md`.
- Keep only root entry points (`README.md`, `CONTRIBUTING.md`, `AGENTS.md`) and package manifests at root.

### 4. Link Validation & Safe Relocation
- Always check inbound links across the repository before moving a document.
- When moving a file, update all relative markdown links in the same atomic commit.
- Never delete historical records without maintainer approval; move them to the central `archive/` and label them clearly in `archive/inventory.md`.

---

## 3. Verification Checklist
- Run link checks on all modified documentation to confirm zero broken relative paths.
- Confirm `docs/map.md` is updated to reflect any newly created or relocated documents.

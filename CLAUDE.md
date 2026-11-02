# Tenali — Claude Code Instructions

> **Canonical Operating Policy**: All AI coding agents operating in this repository must comply with the universal rules defined in [`AGENTS.md`](AGENTS.md) and consult [`docs/map.md`](docs/map.md) for repository architecture, data locations, and source of truth rules.

---

## Quick Reference for Claude Code

### 1. Mandatory Pre-Flight
- Always run `git status` and `git branch -vv` to verify the working tree and active branch before editing files.
- Work only on the authorized branch; never push directly to remotes or open PRs.
- Active PR target branch for development contributions is **`demo`**.

### 2. Architecture & Modularity
- **Never append new components to `client/src/App.jsx`**.
- New interactive quiz modules belong in `client/src/apps/<Name>.jsx` or under a dedicated directory in `client/src/<feature>/`, following [`client/src/apps/README.md`](client/src/apps/README.md) and [`skills/tenali-modular-development/SKILL.md`](skills/tenali-modular-development/SKILL.md).
- Backend routes belong in `server/routes/<domain>.js` mounted via `server/index.js`.

### 3. Local Commands (Separate Client & Server)
- **Zero-Dependency Server Check**: `node server/lib/bkt.test.js`
- **Frontend Production Build**: `cd client && npm run build`
- **Frontend Lint**: `cd client && npm run lint` (baseline: 0 errors, 117 warnings)
- **Frontend Unit Tests**: `cd client && npm test`
- **Backend API Tests**: `cd server && npm test`

### 4. Specialized Skills
For detailed workflows, invoke and follow the skills under `skills/`:
- Repository safety: [`skills/tenali-repository-governance/SKILL.md`](skills/tenali-repository-governance/SKILL.md)
- Modular development: [`skills/tenali-modular-development/SKILL.md`](skills/tenali-modular-development/SKILL.md)
- UI and code consistency: [`skills/tenali-consistent-output/SKILL.md`](skills/tenali-consistent-output/SKILL.md)
- Testing and verification: [`skills/tenali-testing-and-verification/SKILL.md`](skills/tenali-testing-and-verification/SKILL.md)
- Review and verification: [`skills/tenali-code-review/SKILL.md`](skills/tenali-code-review/SKILL.md)
- RFC workflow: [`skills/tenali-rfc-workflow/SKILL.md`](skills/tenali-rfc-workflow/SKILL.md)

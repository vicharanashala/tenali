---
name: tenali-repository-governance
description: Enforce safe repository operations, branch safety, issue requirements, non-negotiable boundaries, and human publication gates in the Tenali repository.
---

# Tenali Repository Governance Skill

## 1. Purpose & Trigger
Use this skill whenever an AI coding assistant begins a new task, plans commits, handles branches, reviews permissions, or prepares handoffs. This skill guarantees that automated tooling never damages repository state or bypasses maintainer review.

## 2. Prerequisites & Relevant Files
- Root contract: [`AGENTS.md`](../../AGENTS.md)
- Navigation map: [`docs/map.md`](../../docs/map.md)
- Contributor rules: [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Parikshak bot gate check: [`.github/scripts/pr-gate-check.js`](../../.github/scripts/pr-gate-check.js)

## 3. Mandatory Workflow

### Step 1: Pre-Execution Git Verification
Before inspecting or modifying any file:
1. Run `git status` and `git branch -vv` to verify the working directory, active branch, and HEAD commit.
2. Confirm the working tree is clean. If uncommitted changes exist, stop and report them immediately.
3. Check for protected user commits (such as the division-module commits on local `main`). Never touch or alter protected commits.

### Step 2: Branch Safety & Naming Conventions
- All development work must be performed on a dedicated branch created from the verified base branch (standard base is `upstream/demo`).
- Branch prefixes must strictly use:
  - `feat/<short-description>` (new features or modules)
  - `fix/<short-description>` (bug fixes)
  - `docs/<short-description>` (documentation updates)
  - `chore/<short-description>` (maintenance or tooling)
  - `refactor/<short-description>` (restructuring without behavior changes)
- **Do not use `feature/...`** (causes linter and contribution rule violations).

### Step 3: Issue Linkage & Work Scope
- In accordance with `CONTRIBUTING.md` and Parikshak Gate 1, every PR must link to a valid open issue on the repository tracker using the exact closing keyword:  
  `Closes #N` (or `Fixes #N` / `Resolves #N`).
- Never invent issue numbers or link to closed issues or pull requests.
- If no issue exists, request the maintainer to open or authorize an issue before PR creation.

### Step 4: Prohibited Actions (Non-Negotiable Boundaries)
- **NO REMOTE PUSH**: Agents must never execute `git push`, create remote branches, or open pull requests without explicit human sign-off.
- **NO DESTRUCTIVE GIT COMMANDS**: Never run `git reset --hard`, `git clean -fd`, `git rebase -i`, or delete branches without human authorization.
- **NO MOCK PRODUCTION RESPONSES**: Never render hardcoded fallback arrays when an API fails (violates FLN #449 policy); real loading, error, or empty states must be rendered.
- **NO SECRET EXPOSURE**: Never commit passwords, tokens, API keys, or private paths.

### Step 5: Verification & Human Acceptance Gate
- After local commits, run automated verification (`node server/lib/bkt.test.js`, `npm run build`).
- Present the final report and halt execution at:  
  `WAITING_FOR_HUMAN_MANUAL_TEST`
- Wait for the human maintainer to manually verify the application.

# Tenali Contributor & Intern Orientation Guide

> Welcome to Tenali. This guide is your starting point — it outlines **what to read, in what order, and why**, linking the core reference documents every contributor and intern should understand before opening their first PR.

---

## 1. Purpose of This Guide

Tenali is built by rotating cohorts of contributors and interns. Process knowledge can easily be lost across rotations. This guide, along with the core documentation it references, standardizes our development workflow so any contributor can move efficiently from onboarding to a reviewed, merged pull request.

If you encounter an ambiguity or gap, please raise it — our documentation is a living asset maintained through continuous review.

---

## 2. Core Reference Documents

Every contribution traces back to these foundational documents:

| Document | Purpose | When to Use |
|---|---|---|
| **[`specs/problem-statements.md`](../specs/problem-statements.md)** | The core problem statements (Engagement, Adaptive Progression, Minimalist UI) grounded in pedagogical research. | **Before selecting work.** Every feature must map to a defined problem statement. |
| **[`case-studies/duolingo.md`](../case-studies/duolingo.md)** | Case study analyses evaluating mechanics, research backing, and applicability to Tenali. | **During research & ideation**, before writing proposals or RFCs. |
| **[`contributing/rfc-process.md`](rfc-process.md)** | The Two-Stage RFC workflow: Issue proposal -> RFC document -> MVP implementation. | **Before writing code for major features.** |
| **[`design/ui-guidelines.md`](../design/ui-guidelines.md)** | Design tokens, color system, typography, and UI layout rules. | **During UI design and frontend implementation.** |
| **[`AGENTS.md`](../../AGENTS.md)** | Universal rules, lock zones, and safety requirements for human-AI pair programming. | **When using AI coding assistants or working in multi-agent workflows.** |
| **[`docs/map.md`](../map.md)** | Comprehensive map of repository structure, source-of-truth hierarchy, and lock zones. | **When navigating directories or planning cross-module changes.** |

---

## 3. About Tenali (Quick Orientation)

Tenali is an open-source educational learning platform designed for all learners (from early childhood upwards). It prioritizes **zero-cost, client-side, low-bandwidth-friendly** interactive math and conceptual experiences. The active priority focus areas are:
1. **Engagement:** Low-stakes practice, clear reward cycles, and intuitive interaction.
2. **Adaptive Progression & Level Continuity:** Granular mastery models (Bayesian Knowledge Tracing / BKT).
3. **Minimalist, Cognitive-Load-Aware UI:** Reducing extraneous cognitive overhead to focus on core concepts.

---

## 4. Your Path, Step by Step

### Step 1: Pick an Approved Problem Statement
Review [`specs/problem-statements.md`](../specs/problem-statements.md). Every feature idea must address a recognized need. Never begin unassigned work or invent unapproved problems; consult maintainers on the tracker if scoping is needed.

### Step 2: Research Before You Design
Examine existing precedents in [`docs/case-studies/`](../case-studies/). For example, [`duolingo.md`](../case-studies/duolingo.md) illustrates analyzing mechanics against cognitive science research (e.g., Half-Life Regression) and determining what transfers versus what does not fit Tenali's non-commercial mission.

Cite references, papers, or platform precedents in your feature issue and standup updates.

### Step 3: Propose via the Two-Stage RFC Workflow
Follow [`contributing/rfc-process.md`](rfc-process.md):
1. **Stage 1 (Feature Proposal Issue):** Open a GitHub Issue using `.github/ISSUE_TEMPLATE/feature_proposal.md`. Discuss high-level objectives with maintainers and receive approval.
2. **Stage 2 (RFC & Implementation):** Add your detailed RFC in `docs/rfcs/<module>/000X-feature-name.md` based on `docs/templates/0000-rfc-template.md`. Implement your code in modular directories (`client/src/apps/<module>/` or `client/src/features/`).

### Step 4: Build and Test
- Review [`design/ui-guidelines.md`](../design/ui-guidelines.md) for styling tokens (`var(--clr-bg)`, `var(--clr-accent)`, etc.) and Tailwind conventions.
- Respect lock zones: **Do NOT edit `client/src/App.jsx` or `server/index.js`** unless specifically authorized. Develop self-contained modules.
- Ensure all quality checks pass locally:
  - Client tests: `cd client && npm test`
  - BKT unit tests: `node server/lib/bkt.test.js`
  - Lint: `cd client && npm run lint` (0 errors)
  - Production build: `cd client && npm run build`
- Perform thorough manual testing in a desktop and mobile viewport.

### Step 5: Standup Presentation & Feedback
Presenting at standups focuses on gathering early feedback:
- **Pre-Presentation:** Ensure your UI aligns with minimalist design principles and your end-to-end interactive flow runs cleanly.
- **During Presentation:** Give a 2–3 minute walkthrough of the problem statement and demo the interactive mechanic.
- **After Presentation:** Incorporate mentor feedback directly into your RFC and implementation branch.

---

## 5. Pull Request Guidelines

- **Target branch:** All PRs must target **`demo`** (the active upstream development branch), **not** `main`.
- **Branch naming:** Use standard prefixes:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `docs/<short-description>`
  - `chore/<short-description>`
  - `refactor/<short-description>`
  *(Do not use `feature/...`)*
- **Commits:** Small, atomic, logically scoped commits with descriptive messages following Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
- **PR Description:** Fill out `.github/PULL_REQUEST_TEMPLATE.md` completely, including `Closes #N`, test verification, and UI screenshots/recordings.
- **Mergeability:** Keep your branch up to date with `upstream/demo`. Resolve merge conflicts locally.

---

## 6. Communication & Getting Help

- Do not remain blocked for more than 24 hours without asking for guidance.
- Use standups and GitHub issue discussions to ask specific technical and pedagogical questions.

---

## 7. Quick-Reference Checklist (Your First PR)

- [ ] Read [`specs/problem-statements.md`](../specs/problem-statements.md) and identified the target problem statement.
- [ ] Checked [`docs/case-studies/`](../case-studies/) for relevant precedents.
- [ ] Created a Feature Proposal Issue (`.github/ISSUE_TEMPLATE/feature_proposal.md`) and obtained maintainer approval.
- [ ] Created feature branch `feat/<feature-name>` off latest `upstream/demo`.
- [ ] Drafted RFC in `docs/rfcs/<module>/` per `docs/templates/0000-rfc-template.md`.
- [ ] Implemented feature modularly without editing `App.jsx` or `server/index.js`.
- [ ] Verified local tests: `cd client && npm test` and `node server/lib/bkt.test.js`.
- [ ] Verified lint and build: `cd client && npm run lint` and `npm run build`.
- [ ] Manually tested flow in browser.
- [ ] Opened PR targeting `demo` with complete checklist and `Closes #N`.

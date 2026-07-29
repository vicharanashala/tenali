# Tenali Intern Ramp-Up & Orientation Guide

> Welcome to Tenali. This doc is your starting point - it doesn't repeat everything in detail, it tells you **what to read, in what order, and why**, pointing to the four core reference docs every intern should know. Read this fully before your first PR.

---

## 1. Purpose of This Doc

Tenali is built by rotating cohorts of interns, so process knowledge easily gets lost when people roll off. This guide, plus the four docs it references, is meant to fix that - so a new intern can go from "just joined" to "shipped a reviewed feature" without needing a 1:1 for every basic question.

If you hit a gap or ambiguity while ramping up, flag it - this doc (and the docs it links to) should stay living, not fixed.

---

## 2. The Four Core Docs

Everything in your workflow traces back to one of these. Bookmark all four now.

| Doc | What It's For | When You'll Use It |
|---|---|---|
| **`Tenali-core-problem-statements.md`** | The 3 priority problem statements (Engagement; Adaptive Progression & Level Continuity; Minimalistic, Cognitive-Load-Aware UI) - what Tenali is trying to solve right now, and why, with research grounding for each. | **Before picking what to work on.** Every feature should trace back to one of these. |
| **Case Study Library** (starting with `duolingo.md`) | Deep-dives on existing platforms (Duolingo, and more to come - Khan Academy, Brilliant, SuperMemo/Anki) covering their mechanics, the research behind them, and what does/doesn't transfer to Tenali. | **While researching your idea**, before writing a proposal - mine these for precedent instead of designing from a blank page. |
| **`rfc-based-proposal-review.md`** | The proposal/design-review process: RFCs live in `docs/rfcs/<module>/`, get reviewed as a docs-only PR, and are approved *before* implementation begins. | **Before you write any code.** This is how you propose a feature and get design feedback early. |
| **`ui-guidelines.md`** | The UI Guidelines and Design System — standard colors, fonts, sizing, layout rules, and component libraries. | **While designing and coding your feature.** Refer here to ensure your UI matches Tenali's look. |

---

## 3. About Tenali (Quick Orientation)

Tenali is a learning platform spanning multiple problem spaces, designed to be genuinely open for all learners (from early childhood and beyond), with an emphasis on **zero-cost, client-side, low-bandwidth-friendly** interactive experiences. Current priority focus (see `Tenali-core-problem-statements.md`) is on Engagement, Adaptive Progression & Level Continuity, and Minimalistic UI Design.

---

## 4. Your Path, Step by Step

### Step 1 - Pick a Problem to Work On
Read **`Tenali-core-problem-statements.md`**. Every feature idea should map to Problem Statement A, B, or C (or a specific facet, like Granular Level Design or Performance-Based Regression under B). If you're unsure where your idea fits, ask your mentor/reviewer before self-assigning something unscoped.

### Step 2 - Research Before You Design
Check the **Case Study Library** for existing precedent - don't reinvent a mechanic that's already been studied elsewhere. `duolingo.md` is a good example of the depth expected: not just "what a platform does" but *what research backs it*, and *what specifically transfers to Tenali versus what doesn't* (e.g., Duolingo's Half-Life Regression is a strong precedent for Mastery Tracking/Performance-Based Regression; its monetization-driven mechanics like paid league repair are not something we'd replicate).

This research also directly feeds your RFC and your standup presentation - both expect you to cite references (papers, case studies, competitor platforms).

### Step 3 - Write an RFC
Follow **`rfc-based-proposal-review.md`**:
- Add your proposal to `docs/rfcs/<module>/000X-feature-name.md`.
- Open a PR containing *only* the RFC - no code yet.
- Get it reviewed and approved in PR comments before writing any implementation.

This is a hard gate, not a suggestion - implementation should start only after the RFC is approved, so design misalignment gets caught early instead of after code is written.

### Step 4 - Build It
- Read **`ui-guidelines.md`** and use standard UI variables and components under `client/src/components/ui/` to build your feature. Follow the **Minimalistic UI** principles from Problem Statement C — one primary focus per screen, minimal text, and standardized styles.
- If your feature touches learner progress or mastery, it should integrate with the shared mastery data model referenced in Problem Statement B, not maintain its own isolated state.
- Make sure your environment is set up correctly (correct Node/npm version - check for a `.nvmrc` or `engines` field) before you start, to avoid unrelated lockfile diffs later.
- Confirm CI checks (Prettier, ESLint, Vitest) pass locally before opening a PR.

### Step 5 - Present at Standup
The goal of a presentation is not to get your feature merged ASAP, but to gather feedback and iterate. 
- **Pre-Presentation:** Ensure UI aligns with Tenali's minimalistic themes and your end-to-end flow works. Be ready to cite your research.
- **During Presentation:** Briefly explain the problem you are solving, do a 2-5 minute live demo, and openly ask for mentor feedback on specific technical or design decisions.
- **After Presentation:** Implement the feedback, push changes, and iterate.

Remember: your first few presentations are *not* expected to be the final version - the goal is fast, honest feedback, not a polished reveal.

---

## 5. Pull Request Guidelines

Beyond the RFC-then-implementation flow above:

- **Branch naming:** `feature/short-description`, `fix/short-description`, `chore/short-description`.
- **Commits:** Small, logically scoped, descriptive messages - avoid one giant "final changes" commit.
- **PR description should include:** what the PR does, a link to the approved RFC it implements, screenshots/GIFs of UI changes, and how a reviewer can test it.
- **Before requesting review:** confirm CI passes, confirm your branch is up to date with `main`, and self-review your own diff first.

---

## 6. Communication & Getting Help

- Don't stay blocked for more than a day without flagging it.
- Standups (4:00 PM) are for both demoing progress and raising blockers - come with something to show or something to ask.

---

## 7. Quick-Reference Checklist (Your First PR)

- [ ] Read `Tenali-core-problem-statements.md` and identified which problem statement your feature addresses
- [ ] Checked the Case Study Library for relevant precedent (and can cite it)
- [ ] Drafted an RFC in `docs/rfcs/<module>/` per `rfc-based-proposal-review.md` and got it approved
- [ ] Set up local environment with the correct Node/npm version
- [ ] Built the feature using standard UI variables and components per `ui-guidelines.md`
- [ ] CI checks (Prettier, ESLint, Vitest) passing locally
- [ ] PR description includes what/why, RFC link, screenshots, and test steps
- [ ] Prepared for a live demo and feedback discussion at the 4:00 PM standup

---

*This guide, and the four docs it points to, should evolve as our process matures. If something here is unclear or missing while you're ramping up, add it rather than solving it silently for yourself only.*

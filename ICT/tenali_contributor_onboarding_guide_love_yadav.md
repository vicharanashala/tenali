# Contributor Onboarding & Feature Proposal: Tenali (`vicharanashala/tenali`)

| Field | Details |
| :--- | :--- |
| **Contributor Name** | Love Yadav (`LOVE YADAV`) |
| **Entry Number** | `2024BBM1006` (`2024bbm1006`) |
| **Target Repository** | `https://github.com/vicharanashala/tenali` |
| **Onboarding Document Path** | `Ideas/ONBOARDING-LOVE-YADAV.md` |
| **Prototype Upload Path** | `Ideas/linear-equations-website-v2/` (`index.html`, `style.css`, `script.js`, `README.md`) |
| **Target Branch** | `main` (via branch `docs/onboarding-love-yadav`) |

---

## 1. Executive Summary & Vision

**Tenali** is an open-source adaptive STEM and mathematics learning platform built around algorithmically generated practice problems, interactive concept labs, real-time $1$-vs-$1$ multiplayer duels, and step-by-step explanations.

* **The Pedagogical Gap Addressed:** In Class $10$ algebra (*Pair of Linear Equations in Two Variables*), students frequently memorize the coefficient-ratio table ($\frac{a_1}{a_2}$, $\frac{b_1}{b_2}$, $\frac{c_1}{c_2}$) mechanically without connecting it to the geometry of two lines on the Cartesian plane. Learners especially struggle when equations contain fractional coefficients (e.g., $\frac{1}{2}x + \frac{1}{3}y - 2 = 0$), when negative signs flip ratio equality, or when distinguishing **Consistent** vs. **Inconsistent** and **Dependent** systems.
* **The Proposed Contribution (`LinearLab 10 – Two Lines, Three Stories: Interactive Linear Equations Studio`):** An interactive, animated Class $10$ Mathematics studio (`index.html`, `style.css`, `script.js`, `README.md`) powered by a custom **Exact Fraction Arithmetic Engine**. Learners explore **Intersecting**, **Parallel**, and **Coincident** lines using either integer/decimal sliders or stacked fraction inputs ($\frac{p}{q}$), watch lines morph smoothly on a high-DPI HTML5 Canvas, inspect a live $3$-step algebraic breakdown, and test their mastery on a $6$-question board-style quiz that deep-links directly back into the graph studio.
* **Alignment with Tenali's Learning Loop:** Every section of `LinearLab 10` maps directly onto Tenali's $5$-stage instructional framework:

$$\text{Understand} \rightarrow \text{Interact} \rightarrow \text{Discover} \rightarrow \text{Practice} \rightarrow \text{Test}$$

---

## 2. Tenali Repository Architecture & Content Scale

Tenali uses a multi-package repository layout separating the frontend (`client/`), backend (`server/`), curated question banks, and contributor proposals (`Ideas/`).

| Layer / Directory | Technologies & Key Files | Contributor Standards & Guardrails |
| :--- | :--- | :--- |
| **Frontend Client (`client/`)** | React $19$, Vite $8$, Vitest, Testing Library | Match the pinned Node.js runtime specified in `.nvmrc`. |
| **Modular Labs & Tiles** | `client/src/apps/`, `client/src/features/tiles.js`, `client/src/lib/` | Build new interactive labs as isolated modules in `client/src/apps/` rather than bloating `client/src/App.jsx`. |
| **Backend Server (`server/`)** | Node.js $20+$, Express $5$, Socket.IO, `server/lib/bkt.js` | Manages API routes, real-time multiplayer sockets, and Bayesian Knowledge Tracing (BKT). |
| **Curriculum & Content** | `chitragupta/questions/`, `vocab/questions/`, `server/riddles/riddles.json` | Separates curriculum definitions from UI rendering; never substitute fake fallback data when an API fails or returns empty. |
| **Database & Runtime** | MongoDB (`setup_mongo.sh`), Docker (`docker-compose.override.yml`) | Configure local secrets by copying `.env.example` to `.env`. |
| **Docs & Onboarding (`Ideas/`)** | `README.md`, `CONTRIBUTING.md`, `HOWTO_EXTEND.md`, `DEPLOYMENT.md` | First-time contributors commit their onboarding guide and HTML/web prototypes in `Ideas/` before opening feature PRs. |

### Repository Content Mapping

* $93$ distinct server API route pairs representing core algorithmic puzzle engines.
* $69$ prerequisite topic nodes inside the interactive `/graph` curriculum map.
* $101$ home-screen tiles registered in `client/src/features/tiles.js` (supporting multiple drill formats per route pair).

---

## 3. Deep-Dive Blueprint: `LinearLab 10` – Graph of Linear Equations Studio

### 3.1 Technical Architecture & Multi-File Engine

Your prototype (`linear-equations-website-v2/`) cleanly separates markup, theming/animations, and exact mathematical rendering across four files (`index.html`, `style.css`, `script.js`, `README.md`):

1. **Exact Fraction Arithmetic Engine (`class Fraction` in `script.js`):**
   * Performs exact rational arithmetic (`add`, `sub`, `mul`, `div`, `neg`, `abs`, `equals`) with Euclidean GCD reduction (`Fraction.gcd`) and sign normalization so ratios and intersection coordinates never suffer from floating-point rounding drift.
   * Parses integers, decimals (via $10{,}000\times$ integer scaling), and typed fractions like `3/4` or `-2/5` via `Fraction.parse()`, and renders stacked mathematical fractions using `.inline-frac`, `.f-num`, and `.f-den`.
2. **Dual-Mode Coefficient Studio (`#playground`, `.studio-shell`):**
   * Switches seamlessly between **Sliders & Decimals** (`#modeSliderBtn`, supporting direct fraction text entry) and **Exact Fraction Mode ($\frac{p}{q}$)** (`#modeFractionBtn` with stacked numerator/denominator `.frac-stack` boxes and quick-fill buttons such as $\frac{1}{2}$, $\frac{2}{3}$, $-\frac{3}{4}$, $\frac{5}{2}$).
   * Includes one-click presets (`intersect`, `parallel`, `coincident`, `fraction-demo`) plus a procedural random system generator (`applyRandomPreset()`).
3. **Animated High-DPI HTML5 Canvas Engine (`#graphCanvas`, `renderLoop` & `drawGraphFrame`):**
   * Uses exponential interpolation (`lerp = 0.16`) on `animCoefs` so lines morph smoothly whenever sliders, fractions, or presets change.
   * Features visual effect toggles: **Axis Projections** (`#opt-projections`), **Intercept Dots** (`#opt-intercepts`), and **Live Glow FX** (`#opt-effects`), alongside hover crosshairs with live $(x, y)$ HUD (`#hoverCoords`) and interactive zoom controls ($\pm 4$ to $\pm 24$).
   * Renders scenario-specific visual cues: a pulsing emerald beacon and exact-fraction coordinate badge for **Intersecting** lines, an animated perpendicular `Constant Gap` dashed connector for **Parallel** lines, and flowing dashed overlays for **Coincident** lines.
4. **Live Step-by-Step Breakdown & Interactive Quiz (`#breakdown`, `#quiz`, `#confettiCanvas`):**
   * Auto-updates three algebraic cards (Slope-Intercept form, Exact Ratio Test, and Determinant/Cramer's Rule solution) on every edit.
   * Bundles a $6$-question ratio and fraction challenge (`quizData`) with a streak counter, progress bar, instant explanations, Canvas confetti celebration (`launchConfetti()` for scores $\ge 4/6$), and a **"Visualize This in Graph Studio"** button (`plotCurrentQuizInStudio()`) that loads any quiz pair directly into `#playground`.
5. **Responsive Glassmorphic UI & Persistent Dark Mode (`style.css`, `#themeToggle`):**
   * Implements CSS custom-property theming (`[data-theme="light"]` and `[data-theme="dark"]`) persisted in `localStorage`, plus `IntersectionObserver` scroll-reveal animations (`.reveal`).

### 3.2 Module-by-Module Curriculum & Feature Matrix

| Section & Anchor ID | Key UI & Engine Components | Pedagogical Outcome |
| :--- | :--- | :--- |
| **Navbar & Hero** (`nav.navbar`, `#top`) | Sticky glassmorphic navigation (`#stories`, `#playground`, `#breakdown`, `#quiz`), Light/Dark toggle (`#themeToggle`), and animated SVG line-crossing hero. | Introduces standard two-variable linear equations $a_1x + b_1y + c_1 = 0$ and $a_2x + b_2y + c_2 = 0$ visually from the first screen. |
| **1. The 3 Possible Stories** (`#stories`) | Clickable `.story-card` cards (`card-intersect`, `card-parallel`, `card-coincident`) with animated SVGs, real-world analogies (crossroads, train tracks, overlapping path), and `jumpToPreset()`. | Anchors abstract consistency rules to concrete visual metaphors and lets learners launch each case in one click. |
| **2. Live Graph & Fraction Studio** (`#playground`) | Slider & $\frac{p}{q}$ fraction inputs, presets/randomizer, animated `#graphCanvas` with zoom/hover HUD, `.ratio-compare-bar`, and `#solution-details`. | Connects algebraic coefficient edits directly to slope changes, axis intercepts, live ratio equality (`=` vs. `≠`), and exact crossing coordinates. |
| **3. Step-by-Step Math Breakdown** (`#breakdown`) | Three live cards: `#step-slope-box` ($y = mx + k$), `#step-ratio-box` (exact rational ratios), and `#step-solution-box` (determinant & Cramer's rule). | Demystifies *why* two lines intersect, run parallel, or coincide without hiding intermediate fraction simplifications. |
| **4. 6-Question Ratio & Fraction Challenge** (`#quiz`) | Interactive quiz (`quizData`) with integer & fraction problems, streak badge, explanations, `plotCurrentQuizInStudio()`, and `#confettiCanvas`. | Reinforces exam readiness (including sign traps and fractional coefficients) and closes the loop between testing and visual discovery. |

### 3.3 Mathematical Formulation

All analysis in `LinearLab 10` (`analyzeSystem()` in `script.js`) operates on a pair of linear equations in two variables in general form:

$$a_1 x + b_1 y + c_1 = 0, \qquad a_2 x + b_2 y + c_2 = 0$$

* **Slope-Intercept Conversion (Step $1$):**
  * When $b_i \ne 0$:
    $$y = m_i x + k_i, \qquad m_i = -\frac{a_i}{b_i}, \qquad k_i = -\frac{c_i}{b_i}$$
  * When $b_i = 0$ and $a_i \ne 0$: vertical line $x = -\frac{c_i}{a_i}$ with undefined slope ($\infty$).

* **Exact Cross-Product Determinants & Cramer's Rule (Steps $2$ & $3$):**
  To handle zero coefficients safely without division-by-zero errors, `script.js` computes exact rational determinants:
  $$D = a_1 b_2 - a_2 b_1, \qquad D_x = b_1 c_2 - b_2 c_1, \qquad D_y = c_1 a_2 - c_2 a_1$$
  * When $D \ne 0$, the unique exact intersection point is:
    $$x = \frac{D_x}{D} = \frac{b_1 c_2 - b_2 c_1}{a_1 b_2 - a_2 b_1}, \qquad y = \frac{D_y}{D} = \frac{c_1 a_2 - c_2 a_1}{a_1 b_2 - a_2 b_1}$$

* **Axis Intercepts Plotted on Canvas:**
  $$\text{For } a_i \ne 0: \quad x_{\text{int}} = \left(-\frac{c_i}{a_i},\; 0\right), \qquad \text{For } b_i \ne 0: \quad y_{\text{int}} = \left(0,\; -\frac{c_i}{b_i}\right)$$

* **Canonical System Cases Covered in the Studio & Quiz:**

| Case | Ratio Condition | Determinant Condition | Geometric Representation | Algebraic Solution & Consistency |
| :--- | :--- | :--- | :--- | :--- |
| **Case $1$** | $\frac{a_1}{a_2} \ne \frac{b_1}{b_2}$ | $D \ne 0$ | **Intersecting Lines** (crossroads) | **Consistent** — Exactly $1$ unique solution $(x, y) = \left(\frac{D_x}{D}, \frac{D_y}{D}\right)$ |
| **Case $2$** | $\frac{a_1}{a_2} = \frac{b_1}{b_2} \ne \frac{c_1}{c_2}$ | $D = 0$ and $(D_x \ne 0 \text{ or } D_y \ne 0)$ | **Parallel Lines** (train tracks, constant gap) | **Inconsistent** — $0$ solutions (no common point) |
| **Case $3$** | $\frac{a_1}{a_2} = \frac{b_1}{b_2} = \frac{c_1}{c_2}$ | $D = 0,\; D_x = 0,\; D_y = 0$ | **Coincident Lines** (complete overlap) | **Consistent & Dependent** — Infinitely many solutions ($\infty$) |
| **Guardrail** | $a_i = 0$ and $b_i = 0$ | Invalid linear equation | Not plotted (`Invalid Equation` pill) | Prompts user to set $a \ne 0$ or $b \ne 0$ |

* **Parallel Distance Projection (Canvas Visual Cue):**
  For parallel lines, `drawGraphFrame()` computes the foot of the perpendicular from the origin to Line $1$, $(x_1, y_1) = \left(\frac{-a_1 c_1}{a_1^2 + b_1^2},\; \frac{-b_1 c_1}{a_1^2 + b_1^2}\right)$, and projects orthogonally onto Line $2$ to draw the animated `Constant Gap` segment.

---

## 4. Two-Phase Integration Plan for `vicharanashala/tenali`

To respect Tenali's architecture and keep pull requests clean and conflict-free, integration is organized into two phases:

### Phase 1: Onboarding & Standalone Prototype PR (`Ideas/`)

1. Commit this onboarding guide as `Ideas/ONBOARDING-LOVE-YADAV.md`.
2. Upload your standalone web prototype folder into `Ideas/linear-equations-website-v2/` (`index.html`, `style.css`, `script.js`, `README.md`) so mentors and maintainers can open and review `LinearLab 10` directly from the repository.

### Phase 2: Modular React & Vitest Integration (`client/`)

Once a feature issue is opened and approved to integrate `LinearLab 10` into the main Tenali web application:

1. **Extract Pure Fraction & Linear System Engine (`client/src/lib/algebra/linearSystemEngine.js`):**
   * Move `class Fraction` (GCD reduction, `parse`, exact arithmetic) and `analyzeSystem` (determinants $D, D_x, D_y$, slope-intercept conversion, axis intercepts, parallel-gap projection, and system classification) into a framework-agnostic ES module.
2. **Add Colocated Unit Tests (`client/src/lib/algebra/linearSystemEngine.test.js`):**
   * Write Vitest unit tests covering fraction reduction/parsing, all $3$ system classifications (intersecting, parallel, coincident), fractional quiz systems (e.g., $\frac{1}{2}x + \frac{1}{3}y - 2 = 0$), vertical/horizontal lines ($b = 0$ or $a = 0$), and invalid degenerate inputs ($a = b = 0$).
3. **Create Isolated App Component (`client/src/apps/LinearEquationsStudioApp.jsx`):**
   * Port the 3-story cards, Slider/Fraction dual-mode controls, animated Canvas graph renderer, live 3-step algebraic breakdown, and 6-question quiz into an independent React component without modifying unrelated code in `client/src/App.jsx`.
4. **Register Home-Screen Tile (`client/src/features/tiles.js`):**
   * Add a new tile entry routing learners to the Graph of Linear Equations Studio and handle loading, error, and empty states cleanly without fake fallback data.

---

## 5. Git Workflow, CI Checks & Pull Request Template

### 5.1 Local Setup & Required CI Verification

Run the exact test and lint suite executed by `.github/workflows/test.yml` before pushing any commit:

```bash
# 1. Verify Node.js version matches .nvmrc
nvm use

# 2. Configure local environment variables
cp .env.example .env

# 3. Run client unit tests, linter, and production build
cd client
npm install
npm test
npm run lint
npm run build

# 4. Run server tests and Bayesian Knowledge Tracing check
cd ../server
npm install
npm test
node lib/bkt.test.js
```

### 5.2 Branching & Upload Commands

```bash
# Create an approved docs/ branch from an up-to-date main branch
git checkout main
git pull origin main
git checkout -b docs/onboarding-love-yadav

# Copy your prototype directory into Ideas/ alongside your onboarding guide
mkdir -p Ideas/linear-equations-website-v2
cp path/to/linear-equations-website-v2/{index.html,style.css,script.js,README.md} Ideas/linear-equations-website-v2/
git add Ideas/ONBOARDING-LOVE-YADAV.md Ideas/linear-equations-website-v2/
git commit -m "docs: add onboarding guide and Graph of Linear Equations prototype (2024BBM1006)"
git push -u origin docs/onboarding-love-yadav
```

### 5.3 Ready-to-Use Pull Request Description

When opening your PR against `main` on `https://github.com/vicharanashala/tenali`, link your tracking issue (`Closes #<issue-number>`) and use the template below:

```markdown
## Summary
- Adds contributor onboarding document `Ideas/ONBOARDING-LOVE-YADAV.md` (Love Yadav, `2024BBM1006`).
- Uploads standalone interactive prototype `Ideas/linear-equations-website-v2/` (*LinearLab 10 – Two Lines, Three Stories: Interactive Linear Equations Studio* with `index.html`, `style.css`, `script.js`, and `README.md`) featuring an exact `Fraction` arithmetic engine, Slider & `p/q` Fraction modes, smooth animated HTML5 Canvas graphing with zoom/hover HUD, a live 3-step algebraic breakdown, Light/Dark mode, and a 6-question challenge quiz.

Closes #<issue-number>

## Verification
- [x] Verified branch targets `main` with zero merge conflicts.
- [x] Verified `Ideas/linear-equations-website-v2/index.html` renders cleanly across desktop/mobile viewports and both Light and Dark themes.
- [x] Included Phase 2 modularization plan (`client/src/lib/algebra/` and `client/src/apps/`) aligned with `CONTRIBUTING.md`.
```

---

## 6. Contributor Execution Checklist (`2024BBM1006`)

* [ ] Fork `https://github.com/vicharanashala/tenali`, clone locally, and align Node.js with `.nvmrc`.
* [ ] Confirm `client` (`npm test`, `npm run lint`, `npm run build`) and `server` (`npm test`, `node lib/bkt.test.js`) pass locally.
* [ ] Open an onboarding/proposal issue on GitHub to obtain issue number `#N`.
* [ ] Push `Ideas/ONBOARDING-LOVE-YADAV.md` and `Ideas/linear-equations-website-v2/` on branch `docs/onboarding-love-yadav` and open a PR against `main` with `Closes #N`.
* [ ] Follow up with Phase 2 by extracting `linearSystemEngine.js` + `linearSystemEngine.test.js` and mounting `LinearEquationsStudioApp.jsx` via `client/src/features/tiles.js`.
# Contributor Onboarding & Feature Proposal: Tenali (`vicharanashala/tenali`)

| Field | Details |
| :--- | :--- |
| **Contributor Name** | Vishal Gudesaria (`VISHAL GUDESARIA`) |
| **Entry Number** | `2024BBP1004` (`2024bbp1004`) |
| **Target Repository** | `https://github.com/vicharanashala/tenali` |
| **Onboarding Document Path** | `Ideas/ONBOARDING-VISHAL-GUDESARIA.md` |
| **Prototype Upload Path** | `Ideas/doppler_effect_lab.html` (from `gemini-code-1795840553337.html`) |
| **Target Branch** | `main` (via branch `docs/onboarding-vishal-gudesaria`) |

---

## 1. Executive Summary & Vision

**Tenali** is an open-source adaptive STEM and mathematics learning platform built around algorithmically generated practice problems, interactive concept labs, real-time $1$-vs-$1$ multiplayer duels, and step-by-step explanations.

* **The Pedagogical Gap Addressed:** In Class $11$–$12$ wave mechanics, students frequently struggle to choose the correct $\pm$ signs in the Doppler frequency equation and often treat apparent frequency shifts as abstract algebra rather than a physical consequence of wavefront compression and stretching.
* **The Proposed Contribution (`Physics Made Easy – The Doppler Effect Lab`):** An interactive, browser-based virtual acoustic laboratory and printable formula reference (`gemini-code-1795840553337.html`) that lets learners switch across every source-observer motion case, watch concentric sound wavefronts compress or stretch in real time, **hear** the live acoustic pitch shift, and master an intuitive sign-selection trick.
* **Alignment with Tenali's Learning Loop:** Every section of the Doppler Effect Lab maps directly onto Tenali's $5$-stage instructional framework:

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
| **Docs & Onboarding (`Ideas/`)** | `README.md`, `CONTRIBUTING.md`, `HOWTO_EXTEND.md`, `DEPLOYMENT.md` | First-time contributors commit their onboarding guide and HTML/design prototypes in `Ideas/` before opening feature PRs. |

### Repository Content Mapping

* $93$ distinct server API route pairs representing core algorithmic puzzle engines.
* $69$ prerequisite topic nodes inside the interactive `/graph` curriculum map.
* $101$ home-screen tiles registered in `client/src/features/tiles.js` (supporting multiple drill formats per route pair).

---

## 3. Deep-Dive Blueprint: Interactive Doppler Effect Lab & Formula Sheet

### 3.1 Technical Architecture & Audio-Visual Engine

Your attached file (`gemini-code-1795840553337.html`) is structured as a responsive, single-file interactive physics studio engineered specifically for Class $11$–$12$ learners:

1. **Multi-Case Motion Simulator (`#lab` & `.case-btn`):**
   * Provides dedicated case-selector controls (`.case-btn` with numbered badges `.case-num`) covering stationary states, moving source alone, moving observer alone, and simultaneous motion (approaching, receding, and chasing scenarios).
   * Dynamically renders expanding circular acoustic wavefronts so students immediately see why wavefronts bunch up ($\lambda' < \lambda$, higher pitch) ahead of a moving source and spread out ($\lambda' > \lambda$, lower pitch) behind it.
2. **Live Acoustic Pitch Synthesis:**
   * Pairs visual wavefront animations with real-time Web Audio frequency synthesis so learners can audibly experience the transition from a high-pitched approach (`badge-high`) to a low-pitched recession (`badge-low`) as the source passes the observer.
3. **Structured Mathematical Fraction & Print Engine (`#formula-sheet` & `@media print`):**
   * Uses custom stacked fraction components (`.frac`, `.num`, `.den`) to render clean algebraic expressions for every motion case alongside color-coded pitch-shift indicators (`badge-high`, `badge-low`, `badge-neutral`).
   * Includes dedicated `@media print` stylesheets that automatically hide navigation and interactive controls (`.no-print`) and convert dark-mode cards (`.formula-card`) into high-contrast black-on-white revision sheets for classroom printing.
4. **Intuitive Sign-Convention Guide (`#sign-rule`):**
   * Breaks down the universal direction-of-sound sign rule so students can derive any case without rote memorization.

### 3.2 Module-by-Module Curriculum & Feature Matrix

| Section & Anchor ID | Key UI & Engine Components | Pedagogical Outcome |
| :--- | :--- | :--- |
| **Hero & Navigation** (`header`, `nav`) | Glassmorphic sticky navigation (`#lab`, `#formula-sheet`, `#sign-rule`) with Class $11$–$12$ virtual classroom framing. | Orients learners quickly between hands-on simulation, revision tables, and sign-rule intuition. |
| **1. Interactive Simulation Lab** (`#lab`) | Multi-case selector (`.case-btn`), speed/frequency controls, animated wavefront canvas, and live audio pitch playback. | Connects source velocity $v_s$ and observer velocity $v_o$ with physical wavelength compression and audible frequency shifts. |
| **2. Comprehensive Formula Sheet** (`#formula-sheet`) | Printable `.formula-card` matrix with stacked `.frac` equations and `badge-high` / `badge-low` / `badge-neutral` pitch tags. | Gives students a structured, print-ready reference comparing all canonical Doppler motion cases side by side. |
| **3. Sign Trick & Mental Model** (`#sign-rule`) | Step-by-step breakdown of the numerator ($v \pm v_o$) and denominator ($v \mp v_s$) sign rules. | Eliminates sign errors during exam problem-solving by anchoring signs to whether motion brings source and observer closer or farther apart. |

### 3.3 Mathematical & Acoustic Formulation

All calculations in the Doppler Effect Lab follow standard Class $11$–$12$ acoustic wave mechanics in a stationary medium (air) with speed of sound $v$ (typically $v \approx 340\text{ m/s}$ to $343\text{ m/s}$ at room temperature):

* **Master Doppler Frequency Equation:**
  $$f' = f \left( \frac{v \pm v_o}{v \mp v_s} \right)$$
  where:
  * $f$ is the true emitted source frequency (in $\text{Hz}$),
  * $f'$ is the apparent frequency heard by the observer (in $\text{Hz}$),
  * $v$ is the speed of sound in the medium (in $\text{m/s}$),
  * $v_o$ is the speed of the observer relative to the medium ($+v_o$ when moving **toward** the source, $-v_o$ when moving **away**),
  * $v_s$ is the speed of the source relative to the medium ($-v_s$ in the denominator when moving **toward** the observer, $+v_s$ when moving **away**).

* **Apparent Wavelength Ahead & Behind a Moving Source:**
  $$\lambda_{\text{front}} = \frac{v - v_s}{f}, \qquad \lambda_{\text{back}} = \frac{v + v_s}{f}$$

* **Canonical Motion Cases Covered in the Lab:**

| Case | Physical Scenario | Apparent Frequency ($f'$) | Pitch Shift Classification |
| :--- | :--- | :--- | :--- |
| **Case $1$** | Both source and observer at rest ($v_s = 0, v_o = 0$) | $f' = f$ | **No Shift** (`badge-neutral`) |
| **Case $2$** | Source moving toward stationary observer ($v_o = 0$) | $f' = f \left( \frac{v}{v - v_s} \right)$ | **Higher Pitch** ($f' > f$, `badge-high`) |
| **Case $3$** | Source moving away from stationary observer ($v_o = 0$) | $f' = f \left( \frac{v}{v + v_s} \right)$ | **Lower Pitch** ($f' < f$, `badge-low`) |
| **Case $4$** | Observer moving toward stationary source ($v_s = 0$) | $f' = f \left( \frac{v + v_o}{v} \right)$ | **Higher Pitch** ($f' > f$, `badge-high`) |
| **Case $5$** | Observer moving away from stationary source ($v_s = 0$) | $f' = f \left( \frac{v - v_o}{v} \right)$ | **Lower Pitch** ($f' < f$, `badge-low`) |
| **Case $6$** | Both moving toward each other | $f' = f \left( \frac{v + v_o}{v - v_s} \right)$ | **Maximum Higher Pitch** ($f' > f$, `badge-high`) |
| **Case $7$** | Both moving away from each other | $f' = f \left( \frac{v - v_o}{v + v_s} \right)$ | **Maximum Lower Pitch** ($f' < f$, `badge-low`) |
| **Case $8$** | Source chasing observer ($v_s$ toward, $v_o$ away) | $f' = f \left( \frac{v - v_o}{v - v_s} \right)$ | Depends on $v_s$ vs. $v_o$ |
| **Case $9$** | Observer chasing source ($v_o$ toward, $v_s$ away) | $f' = f \left( \frac{v + v_o}{v + v_s} \right)$ | Depends on $v_o$ vs. $v_s$ |

* **Subsonic Guardrail & Sonic Boom Singularity:**
  * For subsonic acoustic Doppler shifts, the source speed must satisfy $0 \le v_s < v$. As $v_s \rightarrow v^-$, the denominator $v - v_s \rightarrow 0^+$, causing wavefronts to pile up into a Mach cone ($M = v_s / v \ge 1$).

---

## 4. Two-Phase Integration Plan for `vicharanashala/tenali`

To respect Tenali's architecture and keep pull requests clean and conflict-free, integration is organized into two phases:

### Phase 1: Onboarding & Standalone Prototype PR (`Ideas/`)

1. Commit this onboarding guide as `Ideas/ONBOARDING-VISHAL-GUDESARIA.md`.
2. Rename/upload your HTML prototype (`gemini-code-1795840553337.html`) into `Ideas/doppler_effect_lab.html` so mentors and maintainers can open and review the simulation directly from the repository.

### Phase 2: Modular React & Vitest Integration (`client/`)

Once a feature issue is opened and approved to integrate the Doppler Effect Lab into the main Tenali web application:

1. **Extract Pure Acoustic Physics Engine (`client/src/lib/acoustics/dopplerEngine.js`):**
   * Isolate apparent frequency calculation $f'$, apparent wavelength calculation $\lambda'$, pitch-shift classification (`high`, `low`, `neutral`), and subsonic boundary checks ($v_s < v$) into a framework-agnostic module.
2. **Add Colocated Unit Tests (`client/src/lib/acoustics/dopplerEngine.test.js`):**
   * Write Vitest unit tests covering all $9$ motion cases, symmetry checks when $v_s = v_o = 0$, high/low pitch classifications, and boundary conditions as $v_s \rightarrow v$.
3. **Create Isolated App Component (`client/src/apps/DopplerEffectApp.jsx`):**
   * Port the interactive wavefront canvas, Web Audio pitch synthesizer, case selector, and printable formula sheet into an independent React component without modifying unrelated code in `client/src/App.jsx`.
4. **Register Home-Screen Tile (`client/src/features/tiles.js`):**
   * Add a new tile entry routing learners to the Doppler Effect Lab and handle loading, error, and empty states cleanly without fake fallback data.

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
git checkout -b docs/onboarding-vishal-gudesaria

# Copy/rename your prototype HTML into Ideas/ alongside your onboarding guide
cp path/to/gemini-code-1795840553337.html Ideas/doppler_effect_lab.html
git add Ideas/ONBOARDING-VISHAL-GUDESARIA.md Ideas/doppler_effect_lab.html
git commit -m "docs: add onboarding guide and Doppler Effect Lab prototype (2024BBP1004)"
git push -u origin docs/onboarding-vishal-gudesaria
```

### 5.3 Ready-to-Use Pull Request Description

When opening your PR against `main` on `https://github.com/vicharanashala/tenali`, link your tracking issue (`Closes #<issue-number>`) and use the template below:

```markdown
## Summary
- Adds contributor onboarding document `Ideas/ONBOARDING-VISHAL-GUDESARIA.md` (Vishal Gudesaria, `2024BBP1004`).
- Uploads standalone interactive prototype `Ideas/doppler_effect_lab.html` (*Physics Made Easy – Interactive Doppler Effect Lab & Formula Sheet*) featuring multi-case wavefront visualization, live Web Audio pitch shifts, a printable Class $11$–$12$ formula sheet, and a sign-convention guide.

Closes #<issue-number>

## Verification
- [x] Verified branch targets `main` with zero merge conflicts.
- [x] Verified `Ideas/doppler_effect_lab.html` renders cleanly across desktop/mobile viewports and `@media print` mode.
- [x] Included Phase 2 modularization plan (`client/src/lib/acoustics/` and `client/src/apps/`) aligned with `CONTRIBUTING.md`.
```

---

## 6. Contributor Execution Checklist (`2024BBP1004`)

* [ ] Fork `https://github.com/vicharanashala/tenali`, clone locally, and align Node.js with `.nvmrc`.
* [ ] Confirm `client` (`npm test`, `npm run lint`, `npm run build`) and `server` (`npm test`, `node lib/bkt.test.js`) pass locally.
* [ ] Open an onboarding/proposal issue on GitHub to obtain issue number `#N`.
* [ ] Push `Ideas/ONBOARDING-VISHAL-GUDESARIA.md` and `Ideas/doppler_effect_lab.html` on branch `docs/onboarding-vishal-gudesaria` and open a PR against `main` with `Closes #N`.
* [ ] Follow up with Phase 2 by extracting `dopplerEngine.js` + `dopplerEngine.test.js` and mounting `DopplerEffectApp.jsx` via `client/src/features/tiles.js`.
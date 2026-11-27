# Contributor Onboarding & Feature Proposal: Tenali (`vicharanashala/tenali`)

| Field | Details |
| :--- | :--- |
| **Contributor Name** | Sourav Kumar Sharma (`SOURAV KUMAR SHARMA`) |
| **Entry Number** | `2024BBP1003` |
| **Target Repository** | `https://github.com/vicharanashala/tenali` |
| **Onboarding Document Path** | `Ideas/ONBOARDING-SOURAV-KUMAR-SHARMA.md` |
| **Prototype Upload Path** | `Ideas/lumina_interactive_mirrors_lenses_.html` (*LUMINA — Interactive Mirrors & Lenses Studio*) |
| **Target Branch** | `main` (via feature/docs branch `docs/onboarding-sourav-kumar-sharma`) |

---

## 1. Executive Summary & Vision

**Tenali** is an open-source adaptive STEM and mathematics learning platform built around algorithmically generated practice problems, interactive concept labs, real-time $1$-vs-$1$ multiplayer duels, and step-by-step explanations.

* **The Pedagogical Gap Addressed:** Students learning geometric optics often memorize ray-diagram rules and Cartesian sign conventions without developing visual intuition for *why* light converges, diverges, or flips an image.
* **The Proposed Contribution (`LUMINA`):** **LUMINA — Interactive Mirrors & Lenses Studio** (`lumina_interactive_mirrors_lenses_.html`) is a zero-dependency, gamified optical observatory that pairs real-time high-DPI ray tracing with live Cartesian equation feedback, a $5$-level laser puzzle arcade, hands-on bench quests, and a $12$-question adaptive practice arena.
* **Alignment with Tenali's Learning Loop:** Every section of LUMINA maps directly onto Tenali's $5$-stage instructional architecture:
  $$\text{Understand} \rightarrow \text{Interact} \rightarrow \text{Discover} \rightarrow \text{Practice} \rightarrow \text{Test}$$

---

## 2. Tenali Repository Architecture & Content Scale

Tenali uses a multi-package repository structure separating the frontend (`client/`), backend (`server/`), curated question banks, and design proposals (`Ideas/`).

| Layer / Directory | Technologies & Key Files | Contributor Standards & Guardrails |
| :--- | :--- | :--- |
| **Frontend Client (`client/`)** | React $19$, Vite $8$, Vitest, Testing Library | Match the pinned Node.js runtime in `.nvmrc`. |
| **Modular Labs & Tiles** | `client/src/apps/`, `client/src/features/tiles.js`, `client/src/lib/` | Build new interactive labs as isolated modules in `client/src/apps/` rather than bloating `client/src/App.jsx`. |
| **Backend Server (`server/`)** | Node.js $20+$, Express $5$, Socket.IO, `server/lib/bkt.js` | Manages API routes, multiplayer sockets, and Bayesian Knowledge Tracing (BKT). |
| **Curriculum & Content** | `chitragupta/questions/`, `vocab/questions/`, `server/riddles/riddles.json` | Separates curriculum definitions from rendering logic; never substitute fake fallback data when an API fails or returns empty. |
| **Database & Runtime** | MongoDB (`setup_mongo.sh`), Docker (`docker-compose.override.yml`) | Configure local secrets by copying `.env.example` to `.env`. |
| **Docs & Onboarding (`Ideas/`)** | `README.md`, `CONTRIBUTING.md`, `HOWTO_EXTEND.md`, `DEPLOYMENT.md` | First-time contributors commit their onboarding guide and HTML/design prototypes in `Ideas/` prior to opening feature PRs. |

### Repository Content Mapping
* **$93$** distinct server API route pairs representing core algorithmic puzzle engines.
* **$69$** prerequisite topic nodes inside the interactive `/graph` curriculum map.
* **$101$** home-screen tiles registered in `client/src/features/tiles.js` (supporting multiple drill formats per route pair).

---

## 3. Deep-Dive Blueprint: LUMINA Optics Studio

### 3.1 Technical Architecture & Engine Capabilities

`lumina_interactive_mirrors_lenses_.html` is engineered as a self-contained interactive studio requiring zero external audio, sprite, or physics assets:

1. **Multi-Canvas Rendering Pipeline (`requestAnimationFrame`):**
   * Synchronizes a continuous photon phase ($\phi \in [0, 1)$) across $7$ independent HTML5 canvases (`#motesCanvas`, `#confettiCanvas`, `#heroArrayCanvas`, `#ruleCanvas0`–`#ruleCanvas2`, `#benchCanvas`, `#puzzleCanvas`, and `#quizDiagramCanvas`).
   * Renders solid incident/reflected/refracted rays with Gaussian glow, dashed virtual backward trace lines, moving photon pulses, animated wavefront ripples, and **Solar Spark** radial caustic hotspots.
2. **Procedural Web Audio Synthesizer (`audio`):**
   * Synthesizes real-time sound effects (`tap`, `photon`, `spark`, `wave`, `win`, `miss`) via the browser's `AudioContext` API with zero external `.mp3`/`.wav` dependencies and a one-click mute toggle (`#soundToggle`).
3. **Adaptive Theme & Gamification System:**
   * Supports **Cosmic Dark Mode** and **Museum Light Mode** (`body.museum-light`) via CSS custom properties.
   * Tracks contributor/student XP across $5$ Explorer Rank tiers: **Novice** ($0\text{ XP}$), **Light Cadet** ($150\text{ XP}$), **Optics Engineer** ($400\text{ XP}$), **Photon Master** ($750\text{ XP}$), and **Cosmic Luminary** ($1200\text{ XP}$).
4. **Built-In Project Folder Exporter (`#exportModal`):**
   * Includes an interactive code-splitting modal that clones the live DOM and exports a clean three-file web project (`index.html`, `css/styles.css`, and `js/app.js`), simplifying future migration into Tenali's modular `client/` directory.

### 3.2 Module-by-Module Curriculum & Feature Matrix

| Section & DOM ID | Canvas Resolution | Interactive Mechanics | Pedagogical Outcome |
| :--- | :--- | :--- | :--- |
| **Hero Optical Cavity** (`#heroArrayCanvas`) | $640 \times 400$ | Draggable photon orb, caustic wave pulse (`#pulseWaveBtn`), and $3$ cavity presets (*Focus Cavity*, *Prism Fan*, *Twin Lens*). | Builds immediate visual intuition for converging vs. diverging optical systems. |
| **1. The 3 Golden Rules** (`#rules-section`) | $3 \times (280 \times 160)$ | $4$-device switcher (`Concave Mirror`, `Convex Mirror`, `Convex Lens`, `Concave Lens`) + `"Fire Photon!"` ray bursts + Real vs. Virtual comparison cards. | Teaches **Rule 1** (*Parallel $\rightarrow F$*), **Rule 2** (*Pole $P$ / Center $O$*), and **Rule 3** (*$F \rightarrow$ Parallel*). |
| **2. The Big Light Lab** (`#benchCanvas`) | $1280 \times 600$ | Direct canvas pointer dragging for $u$, $h$, and $F$; $6$ subject sprites; $6$ zone quick-jumps; `Rainbow Rays`, `Wavefronts`, `Slow-Mo Trace` ($1/3 \rightarrow 3/3$), `Cinema Screen`, `Save PNG`, and live **Viewfinder**. | Connects geometric ray intersections with real-time algebraic equations and human visual perception. |
| **3. Laser Core Escape** (`#puzzleCanvas`) | $900 \times 420$ | $5$-level playable arcade ($+120\text{ XP}$/level) tuning mirror/lens focal lengths, vertical offsets, and mirror tilt angles ($10^\circ$–$75^\circ$) around obstacles to charge Crystal Cores to $100\%$. | Applies reflection and refraction laws to solve spatial beam-routing challenges. |
| **4 & 5. Missions & Wonders** (`#missions-section`, `#wonders-section`) | Bench-linked | $5$ auto-verified telemetry quests ($+100\text{ XP}$ each) + $6$ one-click real-world presets (*Car Side Mirror*, *Dentist Mirror*, *Magnifying Glass*, *Movie Projector*, *Nearsighted Glasses*, *Car Headlights*). | Links abstract ray diagrams to everyday optical instruments. |
| **6. Practice & Quiz Arena** (`#quiz-section`) | $440 \times 210$ | $12$-question bank across *Visual Ray Diagrams*, *Real-World Detective*, and *Formula & Sign Sense*, plus a **$60\text{s}$ Lightning Challenge** with $1\times$/$2\times$/$3\times$ streak multipliers and `"Test in Big Bench"`. | Reinforces conceptual mastery, sign conventions, and rapid problem solving. |

### 3.3 Mathematical & Ray-Tracing Formulation

All calculations in `solveBenchOptics()` and `solveQuestionSetup()` adhere strictly to the **Cartesian Sign Convention** (incident light travels left-to-right; distances measured from Pole $P$ or Optical Center $O$):

* **Input Parameter Domains:**
  * Object distance: $u \in [-360, -26]\text{ cm}$ (or $u \rightarrow -\infty$ in *Very Far* mode)
  * Focal length magnitude: $|f| \in [60, 155]\text{ cm}$, with $f < 0$ for concave mirrors and concave lenses, and $f > 0$ for convex mirrors and convex lenses
  * Object height: $h \in [30, 115]\text{ cm}$

* **Governing Image Equations & Lateral Magnification:**
  $$\text{Spherical Mirrors: } \frac{1}{f} = \frac{1}{v} + \frac{1}{u} \implies v = \frac{u f}{u - f}, \qquad m = -\frac{v}{u} = \frac{h'}{h}$$
  $$\text{Thin Lenses: } \frac{1}{f} = \frac{1}{v} - \frac{1}{u} \implies v = \frac{u f}{u + f}, \qquad m = \frac{v}{u} = \frac{h'}{h}$$

* **Singularities & Boundary Conditions:**
  * **Parallel Solar Incidence ($u \rightarrow -\infty$):** All incoming rays focus at $v = f$, activating **Solar Spark Mode** when $v$ corresponds to a real focal point (concave mirror or convex lens).
  * **Object at Principal Focus ($|u - f| < 2.6\text{ cm}$ for mirrors, $|u + f| < 2.6\text{ cm}$ for lenses):** Outgoing rays emerge strictly parallel ($v \rightarrow \infty$, $m \rightarrow \infty$).

---

## 4. Two-Phase Integration Plan for `vicharanashala/tenali`

To follow Tenali's contribution workflow cleanly without introducing merge conflicts or monolithic bloat, integration is divided into two phases:

### Phase 1: Onboarding & Standalone Prototype PR (`Ideas/`)
1. Commit this onboarding guide as `Ideas/ONBOARDING-SOURAV-KUMAR-SHARMA.md`.
2. Upload `lumina_interactive_mirrors_lenses_.html` as `Ideas/lumina_interactive_mirrors_lenses_.html` so mentors and maintainers can run and review the interactive simulation directly from the repository.

### Phase 2: Modular React & Vitest Integration (`client/`)
Once an issue is created and approved for integrating the Optics Studio into the main Tenali web application:
1. **Extract Pure Physics & Vector Geometry (`client/src/lib/optics/opticsEngine.js`):**
   * Isolate `solveBenchOptics()`, `solveQuestionSetup()`, `projectRay()`, `distPointToSeg()`, and `clipRayToCircle()` into a framework-agnostic module.
2. **Add Colocated Unit Tests (`client/src/lib/optics/opticsEngine.test.js`):**
   * Write Vitest unit tests verifying mirror/lens image distances ($v$), magnification signs ($m > 0$ virtual/erect vs. $m < 0$ real/inverted), infinity convergence, focus-point singularities, and obstacle ray-clipping math.
3. **Create Isolated App Component (`client/src/apps/LuminaOpticsApp.jsx`):**
   * Wrap the canvas simulation, audio controller, and interactive HUD inside an independent React component without modifying unrelated logic in `client/src/App.jsx`.
4. **Register Home-Screen Tile (`client/src/features/tiles.js`):**
   * Add a new tile entry routing to the Optics Lab and ensure clean loading, empty, and error states (never using fake fallback data).

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
git checkout -b docs/onboarding-sourav-kumar-sharma

# Stage the onboarding guide and HTML prototype under Ideas/
git add Ideas/ONBOARDING-SOURAV-KUMAR-SHARMA.md Ideas/lumina_interactive_mirrors_lenses_.html
git commit -m "docs: add onboarding guide and LUMINA optics studio prototype (2024BBP1003)"
git push -u origin docs/onboarding-sourav-kumar-sharma
```

### 5.3 Ready-to-Use Pull Request Description

When opening your PR against `main` on `https://github.com/vicharanashala/tenali`, link your tracking issue (`Closes #N`) and use the template below:

```markdown
## Summary
- Adds contributor onboarding document `Ideas/ONBOARDING-SOURAV-KUMAR-SHARMA.md` (Sourav Kumar Sharma, `2024BBP1003`).
- Uploads standalone interactive prototype `Ideas/lumina_interactive_mirrors_lenses_.html` (**LUMINA — Interactive Mirrors & Lenses Studio**) covering the 3 Golden Rules of Image Formation, a $1280 \times 600$ interactive optical bench, a $5$-level laser puzzle game, hands-on missions, and a $12$-question practice arena.

Closes #<issue-number>

## Verification
- [x] Verified branch targets `main` with zero merge conflicts.
- [x] Verified `lumina_interactive_mirrors_lenses_.html` runs cleanly standalone with zero external asset dependencies.
- [x] Included Phase 2 modularization plan (`client/src/lib/optics/` and `client/src/apps/`) aligned with `CONTRIBUTING.md`.
```

---

## 6. Contributor Execution Checklist (`2024BBP1003`)

* [ ] Fork `https://github.com/vicharanashala/tenali`, clone locally, and align Node.js with `.nvmrc`.
* [ ] Confirm `client` (`npm test`, `npm run lint`, `npm run build`) and `server` (`npm test`, `node lib/bkt.test.js`) pass locally.
* [ ] Open an onboarding/proposal issue on GitHub to obtain issue number `#N`.
* [ ] Push `Ideas/ONBOARDING-SOURAV-KUMAR-SHARMA.md` and `Ideas/lumina_interactive_mirrors_lenses_.html` on branch `docs/onboarding-sourav-kumar-sharma` and open a PR against `main` with `Closes #N`.
* [ ] Follow up with Phase 2 by extracting `opticsEngine.js` + `opticsEngine.test.js` and mounting `LuminaOpticsApp.jsx` via `client/src/features/tiles.js`.
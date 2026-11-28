# Contributor Onboarding & Feature Proposal: Tenali (`vicharanashala/tenali`)

| Field | Details |
| :--- | :--- |
| **Contributor Name** | Bandhav (`BANDHAV`) |
| **Entry Number** | `2024BBM1001` (`2024bbm1001`) |
| **Topic** | Probability (*Can Mathematics Predict Luck? – Exploring Probability*) |
| **Target Repository** | `https://github.com/vicharanashala/tenali` |
| **Onboarding Document Path** | `Ideas/ONBOARDING-BANDHAV.md` |
| **Prototype Upload Path** | `Ideas/can-mathematics-predict-luck/` (`index.html`, `styles.css`, `script.js`, `README.md`) |
| **Target Branch** | `main` (via branch `docs/onboarding-bandhav`) |

---

## 1. Executive Summary & Vision

**Tenali** is an open-source adaptive STEM and mathematics learning platform built around algorithmically generated practice problems, interactive concept labs, real-time $1$-vs-$1$ multiplayer duels, and step-by-step explanations.

* **The Pedagogical Gap Addressed:** In Class $8$–$10$ mathematics (*Probability*), students often treat $P(E) = \frac{\text{Favourable Outcomes}}{\text{Total Possible Outcomes}}$ as a static counting formula without building intuition for randomness, experimental variation, or the **Law of Large Numbers**. Learners commonly fall for misconceptions such as the *gambler's fallacy* (expecting a Tails flip to be "due" after several Heads) or assuming small-sample experimental results should exactly match theoretical probabilities.
* **The Proposed Contribution (`Can Mathematics Predict Luck? – Exploring Probability`):** An interactive, visual, zero-dependency Class $8$–$10$ probability studio (`index.html`, `styles.css`, `script.js`, `README.md`) combining tactile hero toys, prediction-first misconception busters, a live $0$-to-$1$ probability scale, animated **Coin Toss** and **Dice** Monte Carlo simulation labs, a $6$-scenario prediction challenge, a $10$-question tiered practice quiz, and a **Mystery Bag Detective** inference game.
* **Alignment with Tenali's Learning Loop:** Every section of the Probability studio maps directly onto Tenali's $5$-stage instructional framework:

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

## 3. Deep-Dive Blueprint: `Can Mathematics Predict Luck?` – Probability Studio

### 3.1 Technical Architecture & Multi-File Engine

The prototype (`can-mathematics-predict-luck/`) cleanly separates semantic layout, responsive styling/animations, and interactive simulation logic across four static files (`index.html`, `styles.css`, `script.js`, `README.md`) requiring no build step:

1. **Interactive Hero Toys & Navigation (`initNavigation`, `initHeroToys` in `script.js`):**
   * Sticky responsive navigation (`#navbar`, `#navLinks`, `#navToggle`) linking all $8$ curriculum modules.
   * Three tactile hero micro-simulators right on the landing card: a flip-on-click coin (`#heroCoinBtn`, `flipHeroCoin`), a Unicode pip-animated die (`#heroDieBtn`, `rollHeroDie`, `dieUnicode`), and a rotating colour spinner (`#heroSpinner`, `spinHeroWheel`).
2. **Concept Exploration & Interactive Probability Scale (`initMysterySection`, `initProbabilityScale`, `initExampleTabs`):**
   * Renders $4$ misconception-busting prediction cards (`mysteryQuestions` inside `#mysteryGrid`) that require an intuitive guess before revealing the mathematical explanation.
   * Drives a continuous $0$–$100\%$ slider (`#probScaleSlider`, `updateScale`) that synchronously updates decimal (`#scaleDecimal`), percentage (`#scalePercent`), classification badge (`#scaleLabel` — *Impossible*, *Unlikely*, *Equally Likely*, *Likely*, *Certain*), and real-world example text (`#scaleExample`), alongside tabbed worked examples (`#ex-coin`, `#ex-dice`, `#ex-balls`).
3. **Monte Carlo Simulation Engines (`initCoinLab` & `initDiceLab`):**
   * **Coin Toss Lab (`#coin-lab`):** Animates a $3\text{D}$ coin (`#virtualCoin`), supports batch execution of $1$, $10$, or $100$ tosses (`#tossOneBtn`, `#tossTenBtn`, `#tossHundredBtn`, `#resetCoinBtn`, `tossCoin`), tracks recent sequence history (`#coinHistory`, `recentHistory`), and updates live experimental probability bars (`#barHeadsFill`, `#barTailsFill`) plotted against a $50\%$ theoretical benchmark (`updateCoinUI`).
   * **Dice Lab (`#dice-lab`):** Dynamically renders standard $1$–$6$ die pip layouts (`pipMaps`, `renderDieFace`) inside `#virtualDie`, supports batch rolls of $1$, $10$, or $60$ (`#rollOneBtn`, `#rollTenBtn`, `#rollSixtyBtn`, `#resetDiceBtn`, `rollDice`), and updates a live $6$-outcome frequency table (`#diceFreqGrid`) and bar chart (`#diceBarChart`) comparing empirical ratios to $\frac{1}{6} \approx 16.7\%$ (`updateDiceUI`).
4. **Gamified Assessment & Statistical Inference (`initChallengeGame`, `initPracticeQuiz`, `initMysteryBagChallenge`):**
   * **Predict Before You Play (`#challenge`):** $6$ themed prediction rounds (`challenges`: Coin Mystery, Dice Strategy, Coloured Balls, Everyday Life, Spinning Wheel, Calendar Chance) with instant conceptual rationale (`renderChallenge`).
   * **Practice Quiz (`#quiz`):** $10$-question assessment (`quizQuestions`: $5$ *Easy* + $5$ *Medium*) featuring a live progress bar (`#quizProgressBar`), difficulty badge (`#quizDiffBadge`), score tracker (`#quizScoreDisplay`), instant feedback (`#quizFeedback`), full post-quiz answer review (`#quizResultArea`, `#resultReview`), and reset (`#restartQuizBtn`).
   * **Mystery Bag Detective (`#summary`):** Loads one of $5$ hidden $10$-ball Red/Blue/Yellow compositions (`secretConfigs`), lets students draw $1$ or $10$ balls with replacement (`#drawOneBallBtn`, `#drawTenBallsBtn`, `drawBalls`), inspect empirical percentages (`#bagRedPct`, `#bagBluePct`, `#bagYellowPct`), and reveal the hidden bag composition (`#revealBagBtn`, `#bagRevealPanel`, `#newBagBtn`) to connect sampling with inference.
5. **Responsive Modern UI (`styles.css`):**
   * Uses CSS custom properties (`:root` palette across indigo, purple, emerald, amber, sky, and rose accents), rounded card elevation tokens, keyframe animations for coin flips and die rolls, and mobile-first responsive breakpoints.

### 3.2 Module-by-Module Curriculum & Feature Matrix

| Section & Anchor ID | Key UI & Engine Components | Pedagogical Outcome |
| :--- | :--- | :--- |
| **Navbar & Hero** (`#navbar`, `#home`) | Sticky navigation (`#navLinks`), playable `#heroCoinBtn`, `#heroDieBtn`, and `#heroSpinner`. | Builds immediate curiosity by letting learners generate random outcomes on the first screen. |
| **1. The Mystery of Chance** (`#mystery`) | $4$ interactive guess-first cards (`#mysteryGrid`, `mysteryQuestions`). | Confronts everyday intuition traps before introducing formal definitions. |
| **2. Learn the Mathematics** (`#learn`) | $6$ core concept cards, interactive $0$-to-$1$ scale (`#probScaleSlider`, `#scaleReadout`), Golden Formula callout, and tabbed worked examples (`#ex-coin`, `#ex-dice`, `#ex-balls`). | Establishes sample space, favourable outcomes, event classification, and step-by-step probability computation. |
| **3. Interactive Coin Toss Lab** (`#coin-lab`) | $3\text{D}$ `#virtualCoin`, Toss $1$ / $10$ / $100$ controls, `#coinHistory`, and live bar graph (`#barHeadsFill`, `#barTailsFill`) with $50\%$ reference line. | Demonstrates how short-run volatility smooths out toward $P(H) = P(T) = 0.5$ as trials grow. |
| **4. Interactive Dice Lab** (`#dice-lab`) | Pip-rendered `#virtualDie`, Roll $1$ / $10$ / $60$ controls, `#diceFreqGrid`, and live $6$-bar chart (`#diceBarChart`) against $16.7\%$. | Extends the Law of Large Numbers to a $6$-outcome equiprobable sample space. |
| **5. Probability Challenge** (`#challenge`) | $6$-scenario prediction game (`#challengeCard`, `challenges`) with instant explanations. | Trains learners to compare likelihoods across coins, dice, coloured balls, spinners, and everyday events. |
| **6. Interactive Practice Quiz** (`#quiz`) | $10$ Easy & Medium questions (`quizQuestions`), `#quizProgressBar`, `#quizFeedback`, and `#resultReview`. | Evaluates mastery of fractions, decimals, complementary events, and impossible/certain bounds. |
| **7. Takeaways & Mystery Bag Detective** (`#summary`) | $6$ discovery cards plus hidden-bag sampling simulator (`secretConfigs`, `#drawOneBallBtn`, `#drawTenBallsBtn`, `#revealBagBtn`). | Introduces empirical estimation: inferring hidden proportions from repeated random draws. |

### 3.3 Mathematical Formulation

All simulations, worked examples, and assessments in the Probability studio operate on finite discrete sample spaces $S$ with equally likely elementary outcomes:

* **Classical (Theoretical) Probability:**
  For an event $E \subseteq S$ in a finite equiprobable sample space $S$:
  $$P(E) = \frac{n(E)}{n(S)} = \frac{\text{Number of Favourable Outcomes}}{\text{Total Number of Possible Outcomes}}$$

* **Probability Bounds & Event Classification (Interactive Scale):**
  $$0 \le P(E) \le 1, \qquad P(\text{Impossible Event}) = 0, \qquad P(\text{Certain Event}) = 1$$

* **Complementary Event Identity:**
  $$P(E) + P(\overline{E}) = 1 \implies P(\overline{E}) = 1 - P(E)$$

* **Empirical (Experimental) Probability in the Coin, Dice & Mystery Bag Labs:**
  After $N$ independent trials in which event $E$ occurs $f(E)$ times:
  $$\hat{P}_N(E) = \frac{f(E)}{N}$$
  By the **Law of Large Numbers**, as the number of trials $N$ increases ($1 \rightarrow 10 \rightarrow 60/100+$):
  $$\lim_{N \to \infty} \hat{P}_N(E) = P(E)$$

* **Canonical Benchmarks Modeled in the Studio:**

| Lab / Module | Sample Space $S$ | Size $n(S)$ | Theoretical Target $P(E)$ | Empirical Convergence Behaviour |
| :--- | :--- | :--- | :--- | :--- |
| **Coin Toss Lab** | $\{\text{H}, \text{T}\}$ | $2$ | $P(\text{H}) = P(\text{T}) = \frac{1}{2} = 0.50$ ($50\%$) | Live bars converge toward the $50\%$ reference line across $1 / 10 / 100$-toss batches. |
| **Dice Lab** | $\{1, 2, 3, 4, 5, 6\}$ | $6$ | $P(k) = \frac{1}{6} \approx 0.1667$ ($16.7\%$) | $6$-face frequency chart levels out near $16.7\%$ across $1 / 10 / 60$-roll batches. |
| **Mystery Bag Detective** | $10$ coloured balls ($r$ Red, $b$ Blue, $y$ Yellow; $r + b + y = 10$) | $10$ | $P(\text{Red}) = \frac{r}{10},\; P(\text{Blue}) = \frac{b}{10},\; P(\text{Yellow}) = \frac{y}{10}$ | Sampling with replacement yields empirical percentages $\hat{p}_R, \hat{p}_B, \hat{p}_Y$ that estimate the hidden bag counts $(r, b, y)$. |
| **Probability Scale** | Continuous $[0, 1]$ ($0\%$–$100\%$) | — | Impossible ($0$), Unlikely ($<0.4$), Equally Likely ($\approx 0.5$), Likely ($>0.6$), Certain ($1$) | Maps numerical ratios directly onto qualitative likelihood intuition. |

---

## 4. Two-Phase Integration Plan for `vicharanashala/tenali`

To respect Tenali's architecture and keep pull requests clean and conflict-free, integration is organized into two phases:

### Phase 1: Onboarding & Standalone Prototype PR (`Ideas/`)

1. Commit this onboarding guide as `Ideas/ONBOARDING-BANDHAV.md`.
2. Update the footer credit in `index.html` from `[Your Name / Class]` to `Bandhav (2024BBM1001)`.
3. Upload the standalone web prototype folder into `Ideas/can-mathematics-predict-luck/` (`index.html`, `styles.css`, `script.js`, `README.md`) so mentors and maintainers can open and review the Probability studio directly from the repository.

### Phase 2: Modular React & Vitest Integration (`client/`)

Once a feature issue is opened and approved to integrate the Probability studio into the main Tenali web application:

1. **Extract Pure Probability & Simulation Engine (`client/src/lib/probability/probabilityEngine.js`):**
   * Move core simulation and statistical helpers—batch coin/dice trial generators, empirical frequency calculators, probability scale classifier (`classifyProbability`), and Mystery Bag sampling/estimation helpers—into a deterministic, injectable-RNG ES module (`rng = Math.random`).
2. **Add Colocated Unit Tests (`client/src/lib/probability/probabilityEngine.test.js`):**
   * Write Vitest unit tests using seeded/mocked RNG functions covering $0 \le P(E) \le 1$ invariants, scale boundary labels ($0\%$, $50\%$, $100\%$), cumulative frequency sums ($\sum f_i = N$), quiz scoring logic, and Mystery Bag draw-with-replacement distributions across all $5$ `secretConfigs`.
3. **Create Isolated App Component (`client/src/apps/ProbabilityStudioApp.jsx`):**
   * Port the interactive hero toys, Mystery cards, $0$-to-$1$ scale, Coin & Dice Monte Carlo labs, $6$-scenario challenge, $10$-question quiz, and Mystery Bag Detective into an independent React component without modifying unrelated code in `client/src/App.jsx`.
4. **Register Home-Screen Tile (`client/src/features/tiles.js`):**
   * Add a new Probability tile entry routing learners to the Probability Studio and handle loading, error, and empty states cleanly without fake fallback data.

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
git checkout -b docs/onboarding-bandhav

# Unzip your prototype into Ideas/can-mathematics-predict-luck/ alongside your onboarding guide
mkdir -p Ideas/can-mathematics-predict-luck
unzip path/to/can-mathematics-predict-luck-github-v2.zip -d Ideas/can-mathematics-predict-luck/

# Stage, commit, and push
git add Ideas/ONBOARDING-BANDHAV.md Ideas/can-mathematics-predict-luck/
git commit -m "docs: add onboarding guide and Probability studio prototype (2024BBM1001)"
git push -u origin docs/onboarding-bandhav
```

### 5.3 Ready-to-Use Pull Request Description

When opening your PR against `main` on `https://github.com/vicharanashala/tenali`, link your tracking issue (`Closes #<issue-number>`) and use the template below:

```markdown
## Summary
- Adds contributor onboarding document `Ideas/ONBOARDING-BANDHAV.md` (Bandhav, `2024BBM1001`).
- Uploads standalone interactive prototype `Ideas/can-mathematics-predict-luck/` (*Can Mathematics Predict Luck? – Exploring Probability* with `index.html`, `styles.css`, `script.js`, and `README.md`) featuring playable hero toys, 4 prediction-first mystery cards, an interactive 0-to-1 probability scale, Coin Toss & Dice Monte Carlo labs with live frequency charts, a 6-scenario prediction challenge, a 10-question Easy/Medium practice quiz, and the Mystery Bag Detective inference game.

Closes #<issue-number>

## Verification
- [x] Verified branch targets `main` with zero merge conflicts.
- [x] Verified `Ideas/can-mathematics-predict-luck/index.html` renders cleanly across desktop and mobile viewports with zero external dependencies.
- [x] Included Phase 2 modularization plan (`client/src/lib/probability/` and `client/src/apps/`) aligned with `CONTRIBUTING.md`.
```

---

## 6. Contributor Execution Checklist (`2024BBM1001`)

* [ ] Fork `https://github.com/vicharanashala/tenali`, clone locally, and align Node.js with `.nvmrc`.
* [ ] Confirm `client` (`npm test`, `npm run lint`, `npm run build`) and `server` (`npm test`, `node lib/bkt.test.js`) pass locally.
* [ ] Replace `[Your Name / Class]` in `index.html`'s footer with `Bandhav (2024BBM1001)` before committing.
* [ ] Open an onboarding/proposal issue on GitHub to obtain issue number `#N`.
* [ ] Save this guide as `Ideas/ONBOARDING-BANDHAV.md`, unzip `can-mathematics-predict-luck-github-v2.zip` into `Ideas/can-mathematics-predict-luck/`, push branch `docs/onboarding-bandhav`, and open a PR against `main` with `Closes #N`.
* [ ] Follow up with Phase 2 by extracting `probabilityEngine.js` + `probabilityEngine.test.js` and mounting `ProbabilityStudioApp.jsx` via `client/src/features/tiles.js`.
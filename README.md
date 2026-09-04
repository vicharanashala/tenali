<div align="center">

<img src="client/public/tenali.png" alt="Tenali Logo" width="120" />

# 🧠 Tenali — Adaptive Math Quiz Platform

### *An adaptive math learning platform with interactive puzzles, real-time multiplayer, and step-by-step explanations.*

<p>
  <a href="https://tenali.fun"><img src="https://img.shields.io/badge/Live-tenali.fun-FF6B6B?style=for-the-badge&logo=globe&logoColor=white" alt="Live"/></a>
  <a href="https://github.com/vicharanashala/tenali/stargazers"><img src="https://img.shields.io/github/stars/vicharanashala/tenali?style=for-the-badge&logo=github&color=FFD93D" alt="Stars"/></a>
  <a href="https://github.com/vicharanashala/tenali/network/members"><img src="https://img.shields.io/github/forks/vicharanashala/tenali?style=for-the-badge&logo=github&color=6BCB77" alt="Forks"/></a>
  <a href="https://github.com/vicharanashala/tenali/issues"><img src="https://img.shields.io/github/issues/vicharanashala/tenali?style=for-the-badge&logo=github&color=FF6B6B" alt="Issues"/></a>
  <a href="CONTRIBUTORS.md"><img src="https://img.shields.io/badge/Contributors-20-4D96FF?style=for-the-badge&logo=github" alt="Contributors"/></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Node-20%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT"/>
</p>

---

### ✨ **69 math topics · Algorithmically generated · Adaptive difficulty · Live multiplayer · Step-by-step solutions**

</div>

---

## 📑 Table of Contents

<table>
<tr>
<td width="33%" valign="top">

**🧭 Orientation**
- [🌟 What is Tenali?](#-what-is-tenali)
- [📊 At a Glance](#-at-a-glance)
- [🎯 User Workflow](#-user-workflow)

</td>
<td width="33%" valign="top">

**🧠 Capabilities**
- [🚀 Features in Depth](#-features-in-depth)
- [🛠️ The 69 Puzzle Types](#-the-69-puzzle-types)
- [🏗️ Architecture](#-architecture)

</td>
<td width="33%" valign="top">

**🤝 Community**
- [⚙️ Quick Start](#-quick-start)
- [🧩 Add a Puzzle](#-add-a-new-puzzle)
- [📝 Contributor Onboarding](#-contributor-onboarding-mandatory)
- [🏆 Contributors → CONTRIBUTORS.md](CONTRIBUTORS.md)

</td>
</tr>
</table>

---

## 🌟 What is Tenali?

Tenali (named after the legendary **Tenali Raman** — the witty Indian scholar who outwitted entire courts with logic) is an **adaptive math learning platform** featuring 69 algorithmically-generated puzzle types, real-time multiplayer battles, and step-by-step solutions for every problem. Every question is generated on the fly — there is no question database — so practice is infinite and never repeats. Difficulty adapts to each learner in real time.

It is built to run on a single VPS — `tenali.fun` — with one Node process serving the React app, the puzzle APIs, the JWT auth, the Socket.IO Battle Arena, and the multi-language code playground.

---

## 📊 At a Glance

<!-- live-at-a-glance:start -->
<p align="center">
  <table>
    <tr>
      <td align="center"><b>884</b><br/><sub>commits</sub></td>
      <td align="center"><b>81</b><br/><sub>PRs merged</sub></td>
      <td align="center"><b>26</b><br/><sub>GitHub contributors</sub></td>
      <td align="center"><b>⭐ 6</b><br/><sub>stars</sub></td>
      <td align="center"><b>🍴 69</b><br/><sub>forks</sub></td>
      <td align="center"><b>🐛 64</b><br/><sub>open issues</sub></td>
    </tr>
  </table>
</p>
<!-- live-at-a-glance:end -->

<sub>🤖 _Numbers above refresh automatically on every push to `main` via [`github-actions[bot]`](.github/workflows/update-readme.yml) — no manual edits required._</sub>

### 🧰 Tech Stack — at a glance

```
Frontend   :  React 19 + Vite 8 + framer-motion + Three.js + mafs + face-api.js
Backend    :  Node.js 20+ · Express 5 · Mongoose 9 · Socket.IO 4
Security   :  JWT (bcrypt 10 rounds) · express-rate-limit · CORS allowlist
Data       :  MongoDB with full in-memory fallback
Sandbox    :  50+ languages via /api/playground2
```

---

## 🎯 User Workflow

A learner goes through **four simple stages** every time they play:

### 1️⃣ Open → 2️⃣ Pick → 3️⃣ Play → 4️⃣ Earn

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 🌐 Open  │───▶│ 📐 Pick  │───▶│ ▶️ Play  │───▶│ 🏆 Earn  │
│tenali.fun│    │  topic   │    │ 20 Qs    │    │+ badge   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**That's it.** Everything else — login, difficulty, scoring, badges — happens automatically inside the **Play** box.

---

### 📋 What's inside each stage

#### 1️⃣ Open `tenali.fun`
- Lands on the **home grid** — 90+ colorful topic cards (blue = arithmetic, green = geometry, purple = algebra, orange = games)
- **Optional login** with JWT — guest mode works fully without an account
- Filter by search or browse the guided journey

#### 2️⃣ Pick a topic
Choose any of these modes from the home grid:

| Mode | What you do |
|------|-------------|
| 🎯 **Goal Practice** | Hit a target score on a chosen topic |
| ⚔️ **Battle Arena** | Live 1-vs-1 fastest-finger duel (Socket.IO) |
| 🔍 **Detective Agency** | Solve story-driven math mysteries |
| 🧩 **Math Riddles** | Find the hidden rule in a puzzle |
| 📚 **Guided Journey** | Linear curriculum — unlock the next concept only after mastering the current one |
| 🎲 **Random Mix** | Quiz that adapts to your weakest topics |
| 🛠️ **Custom Lesson** | Hand-pick topics and question counts |

#### 3️⃣ Play — 20 adaptive questions
- ✅ **Correct** → score goes **up** (+0.15 to +0.5)
- ❌ **Wrong** → score goes **down** (−0.4 to −0.6)
- 💡 **Tap "Solve"** at any time for a step-by-step explanation
- 📈 **Difficulty auto-adjusts** with every answer: `easy → medium → hard → extrahard`

#### 4️⃣ Earn rewards
- 🏆 **Results screen** — coins, XP, streak
- 🥇 **Badge** — bronze → silver → gold per topic
- 📊 **Progress saved** — persisted in MongoDB for next time
- ➡️ **Loop** — pick another topic and play again

---

## 🚀 Features in Depth

### 🧮 1. Adaptive Difficulty Engine
Each quiz instance maintains a float `adaptScore` (0 – 3). Correct answers add **+0.15 to +0.5**; wrong answers subtract **−0.4 to −0.6**. The score maps to bands `easy → medium → hard → extrahard`, which drives the `difficulty` query parameter for every new question.

### ⚔️ 2. Live Battle Arena
`BattleApp.jsx` delivers real-time multiplayer using **Socket.IO**. Two players see the same question; the first correct answer wins the round. Streak-based matchmaking.

### 🔍 3. Detective Agency
`detective-app.jsx` ships story-driven mystery puzzles — each case is a chain of math clues, solving one unlocks the next.

### 📐 4. Concept Lab
`conceptPlay.js` + `conceptSession.js` provide a 5-stage concept mastery loop: **Predict → Grid → Guided → Independent → Review**.

### 📚 5. Guided Learning Journey
Linear curriculum with concept checkpoints. Completing one unlocks the next. Server enforces progression via `UserTopicProgress` (locked → blue → bronze → silver → gold).

### 💡 6. Solve-for-Explanation Middleware
Wrap any `POST *-api/check` call with `{ solve: true }` and the server returns a step-by-step walkthrough from `generateExplanation()` — covers 50+ puzzle types.

### 🧠 7. Spaced Repetition
`lib/spacingLadder.js` promotes recently-missed questions back into rotation, driven by BKT (Bayesian Knowledge Tracing — `lib/bkt.js`).

### 🛡️ 8. Proctoring System
Optional exam-mode supervision with webcam + face-api.js emotion detection, focus / tab-switch event logging, and an admin-only `/api/proctor/sessions` dashboard.

### 🏆 9. Gamification
Coins for every correct answer, XP & streak tracking, pinned badges, and album-style **Collections**.

### 🎲 10. Random Mix & Custom Lesson
Random Mix pulls a question from your weakest areas. Custom Lesson lets you pick exactly which topics appear and how many of each.

### 🔤 11. Vocabulary Trainer (bonus)
**7,662** curated vocab words with definitions and contextual clues, served from `vocab/questions/`. Secondary feature — for breaks between math practice.

### 🌍 12. GK Quiz Bank (bonus)
**991** General Knowledge questions across geography, history, science, sports and culture. Secondary feature — for variety between math sessions.

### 📊 13. Progress & Profile
Per-topic mastery, public badge board, collection completion.

### 🛠️ 14. Multi-language Code Playground
Run code in **50+ languages** via `/api/playground2/run`.

### 🎨 15. 10+ Custom React Apps
`LcmHcfApp`, `LinearAlgebraApp` (56 missions × 6 modules), `GeometryApp`, `ProbLabApp`, `PythagLabApp`, `BearingsLabApp`, `NetBuilderApp`, `ShapeSlicer3D`, `ShapeTranslatorApp`, `ScribbleGuessApp`, `Curiosity.jsx`, `SudokuApp`, `VisualMathLabRedux`, `PlaygroundApp`, `LocalCompilerApp`.

### 🌐 16. i18n & RTL Support
Built-in locale switching (`/src/locales`) for multi-language classrooms.

### ♿ 17. Accessibility
Keyboard navigation, ARIA roles, reduced-motion friendly animations.

### 🔒 18. Security
JWT auth with **fail-fast** in production, `express-rate-limit`, CORS allowlist, bcrypt password hashing, env-sourced seed users.

---

## 🛠️ The 69 Puzzle Types

> Every puzzle has the same two-route contract: `GET /<type>-api/question` and `POST /<type>-api/check`. To fetch a step-by-step explanation, set `{ solve: true }` in the POST body.

<details>
<summary><b>➕ Arithmetic & Number (20 types)</b></summary>

| | Type | Endpoint |
|:-:|-------|----------|
| 1 | Addition | `/addition-api` |
| 2 | Column Addition | `/column-addition-api` |
| 3 | Column Subtraction | `/column-subtraction-api` |
| 4 | Column Multiplication | `/column-multiplication-api` |
| 5 | Column Division | `/column-division-api` |
| 6 | Multiplication Tables | `/multiply-api` |
| 7 | Decimals | `/decimals-api` |
| 8 | Gym Decimals (MCQ) | `/gymdecimals-api` |
| 9 | Fractions | `/fractionadd-api` |
| 10 | Fractions-Add Gym (MCQ) | `/fracaddgym-api` |
| 11 | Basic Arithmetic | `/basicarith-api` |
| 12 | Indices | `/indices-api` |
| 13 | Indices Gym (MCQ) | `/indicesgym-api` |
| 14 | Surds | `/surds-api` |
| 15 | Sequences | `/sequences-api` |
| 16 | Ratio & Proportion | `/ratio-api` |
| 17 | Percentages | `/percent-api` |
| 18 | Profit & Loss | `/profitloss-api` |
| 19 | Banking (RD) | `/banking-api` |
| 20 | GST | `/gst-api` |

</details>

<details>
<summary><b>💰 Commerce & Statistics (8 types)</b></summary>

| | Type | Endpoint |
|:-:|-------|----------|
| 21 | Shares & Dividends | `/shares-api` |
| 22 | Rounding | `/rounding-api` |
| 23 | Standard Form | `/stdform-api` |
| 24 | Speed, Distance, Time | `/sdt-api` |
| 25 | Number Bases | `/bases-api` |
| 26 | HCF & LCM | `/hcflcm-api` |
| 27 | Prime Factors | `/primefactor-api` |
| 28 | Bounds | `/bounds-api` |

</details>

<details>
<summary><b>📐 Algebra (15 types)</b></summary>

| | Type | Endpoint |
|:-:|-------|----------|
| 29 | Variation | `/variation-api` |
| 30 | Linear Equations (one var) | `/lineareq-api` |
| 31 | Line Equations (m, c) | `/lineq-api` |
| 32 | Linear Equations Gym (MCQ) | `/lineqgym-api` |
| 33 | Simultaneous Equations | `/simul-api` |
| 34 | Quadratic Evaluation | `/quadratic-api` |
| 35 | Quadratic Formula | `/qformula-api` |
| 36 | Polynomial Multiplication | `/polymul-api` |
| 37 | Polynomial Factorisation | `/polyfactor-api` |
| 38 | Polynomials Gym (MCQ) | `/polygym-api` |
| 39 | Remainder Theorem | `/remfactor-api` |
| 40 | Binomial Theorem | `/binomial-api` |
| 41 | Functions Evaluation | `/funceval-api` |
| 42 | Functions Gym (MCQ) | `/funcgym-api` |
| 43 | Variation Direct/Indirect | `/variation-api` |

</details>

<details>
<summary><b>📊 Geometry & Trig (14 types)</b></summary>

| | Type | Endpoint |
|:-:|-------|----------|
| 44 | Trig (SOH-CAH-TOA) | `/trig-api` |
| 45 | Inverse Trig | `/invtrig-api` |
| 46 | Circular Measure | `/circmeasure-api` |
| 47 | Inequalities | `/ineq-api` |
| 48 | Coordinate Geometry | `/coordgeom-api` |
| 49 | Section Formula | `/section-api` |
| 50 | Linear Programming | `/linprog-api` |
| 51 | Probability | `/prob-api` |
| 52 | Permutations & Combinations | `/permcomb-api` |
| 53 | Statistics | `/stats-api` |
| 54 | Sets | `/sets-api` |
| 55 | Bearings | `/bearings-api` |
| 56 | Matrices | `/matrix-api` |
| 57 | Linear Algebra (56 missions) | `/linearalgebra-api` |

</details>

<details>
<summary><b>🧮 Linear Algebra & Vectors (6 types)</b></summary>

| | Type | Endpoint |
|:-:|-------|----------|
| 58 | LA Mission Quiz | `/la-mission-quiz-api` |
| 59 | Vectors | `/vectors-api` |
| 60 | Dot Products | `/dotprod-api` |
| 61 | Dot Products Gym (MCQ) | `/dotprodgym-api` |
| 62 | Transformations | `/transform-api` |
| 63 | Mensuration | `/mensur-api` |

</details>

<details>
<summary><b>🎯 Calculus, Puzzles & Games (15+ types)</b></summary>

| | Type | Endpoint |
|:-:|-------|----------|
| 64 | Pythagoras' Theorem | `/pythag-api` |
| 65 | Heron's Formula | `/heron-api` |
| 66 | Circle Theorems | `/circleth-api` |
| 67 | Circle Geometry | `/circle-api` |
| 68 | Logarithms | `/log-api` |
| 69 | Differentiation | `/diff-api` |
| 70 | Differential Equations | `/diffeq-api` |
| 71 | Integration | `/integ-api` |
| 72 | Limits | `/limits-api` |
| 73 | Conic Sections | `/conics-api` |
| 74 | Complex Numbers | `/complex-api` |
| 75 | Angles | `/angles-api` |
| 76 | Triangles | `/triangles-api` |
| 77 | Polygons | `/polygons-api` |
| 78 | Congruence | `/congruence-api` |
| 79 | Similarity | `/similarity-api` |
| 80 | Visual Math | `/visual-math-api` |
| 81 | Conceptual | `/concept-api` |
| 82 | Vocabulary (7,662 words) | `/vocab-api` |
| 83 | GK (991 questions) | `/gk-api` |
| 84 | Tatsavit | `/tatsavit-api` |
| 85 | Sudoku | `/sudoku-api` |
| 86 | Transfer scenarios | `/transfer-api` |
| 87 | Darts | `/darts-api` |
| 88 | Riddles | `/riddle-api` |
| 89 | Square Root | `/sqrt-api` |
| 90 | Squaring | `/squaring-api` |
| 91 | Curiosity | `/curiosity-api` |

</details>

> **Frontend proxy:** every `*-api` is forwarded from Vite (port `5173`) → Express (port `4000`) — see `client/vite.config.js`.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       Browser (React 19 + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ HomeGrid │  │ QuizApps │  │ Battle   │  │ Detec-   │          │
│  │   App.jsx│  │ factory  │  │ Arena    │  │ tive     │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       └──────────────┴────────────┴─────────────┘                 │
│                          │                                       │
│                  axios / socket.io                               │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Express Server  (Node 20+, port 4000)           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Solve MW     │  │ Rate Limiter │  │ JWT Auth     │            │
│  │ (explain)    │  │ + CORS       │  │ (bcrypt)     │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         └────────────┬────┴────────────┬────┘                   │
│                      ▼                 ▼                         │
│  ┌──────────────────────────────────────────────────────┐        │
│  │   69 puzzle routers (GET ?question, POST ?check)     │        │
│  └──────┬───────────────────────────────────────────────┘        │
│         │                                                        │
│  ┌──────▼───────────────────────────────────────────────┐        │
│  │  Utility layer: gcd, lcm, simplify, randomInt, ...    │        │
│  └──────┬───────────────────────────────────────────────┘        │
│         │                                                        │
│  ┌──────▼───────────────────────────────────────────────┐        │
│  │  Data: 991 GK JSON · 7,662 vocab JSON · algorithm    │        │
│  └──────────────────────────────────────────────────────┘        │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────┐                         │
│              │  MongoDB (Mongoose 9)   │                         │
│              │  users · progress · ... │                         │
│              └─────────────────────────┘                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Quick Start

> 🔀 **Repo hierarchy:**
> ```
> vicharanashala/tenali       ← canonical main repo (PRs land here)
> ```
> If you just want to **run** Tenali locally, the commands below work fine.
> If you plan to **contribute**, please **fork `vicharanashala/tenali`** (not this repo) and open PRs back to upstream — see [🤝 Contributing](#-how-to-become-a-contributor).

### Prerequisites
- Node.js **20+**
- MongoDB (optional — falls back to in-memory mode)
- npm

### Clone

```bash
# Option A — clone the canonical upstream (recommended for fresh installs)
git clone https://github.com/vicharanashala/tenali.git
cd tenali


### Install

```bash
cd server && npm install
cd ../client && npm install
```

### Install

```bash
cd server && npm install
cd ../client && npm install
```

### Configure environment
Create `server/.env`:
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/tenali
JWT_SECRET=replace-me-with-a-long-random-string
JWT_TTL=14d
TENALI_SEED_USERS=alice:secret123,bob:secret456
```

### Run (development)

```bash
# Terminal A — backend
cd server && node index.js          # → http://localhost:4000

# Terminal B — frontend
cd client && npm run dev            # → http://localhost:5173
```

The Vite dev server proxies every `/<type>-api` and `/api` call to `:4000`.

### Production build

```bash
cd client && npm run build
cd ../server && NODE_ENV=production JWT_SECRET=... node index.js
```

The Express server serves `client/dist/` statically. See `render.yaml` for the Render deployment template.

### Lint

```bash
cd client && npm run lint
```

---

## 🧩 Add a New Puzzle

Five-step recipe:

1. **Server** — Add `GET /<type>-api/question` and `POST /<type>-api/check` in `server/index.js`. Difficulty (0 – 3) drives parameter ranges.
2. **Proxy** — Add the new prefix to `client/vite.config.js` proxy list.
3. **Component** — Build a quiz component with the `makeQuizApp({ title, apiPath, diffLabels, placeholders, answerField })` factory in `client/src/App.jsx`.
4. **Register** — Map the key in `modeMap` and add an entry to `regularApps` for the home grid.
5. **Explain** — Add a `case` to `generateExplanation()` so the Solve button works.

---

## 📝 Contributor Onboarding (Mandatory)

Every student contributing to the Tenali project is required to submit an **Onboarding Document** (`.md`) before their first pull request. The document is a record of your understanding of the project and your plan for contributing to it. Submissions that omit any of the sections below will be returned for revision.

### Purpose

The Onboarding Document exists to ensure that every contributor:

1. Has a working understanding of what Tenali is and the problem it solves.
2. Has read the existing codebase and can describe its current state in their own words.
3. Has independently identified weaknesses, gaps, and risks in the current implementation.
4. Has formed opinions and proposed ideas for improving the project.
5. Has a concrete plan for tackling at least one identified gap.
6. Has produced a tangible contribution (code, documentation, tests, or design) that advances the project.

> Reading the code without forming a view is not enough. The document is intended to surface misunderstanding early and to surface good ideas quickly.

### File Naming and Location

- **File name:** `ONBOARDING-<your-name>.md`
- **Location:** the PR must add the file to the [`Ideas/`](Ideas) folder.
- **Format:** Markdown (`.md`). PDF, `.docx`, or plain `.txt` will not be accepted.

> ⚠️ **Raise the PR for your onboarding document against the [`Ideas/`](Ideas) folder specifically** — not `docs/`, not the repo root, and not any other folder. PRs that add the onboarding document elsewhere will be closed and asked to resubmit.

### Required Sections

The document must contain the following six sections, in this order.

**1. What is Tenali?**
Describe, in your own words, what Tenali is, the domain it operates in (adaptive math learning / education), the population it serves, and the problem it aims to solve. Do not copy the project description verbatim — paraphrase it. A reader who has never heard of Tenali should be able to understand the project's purpose from this section alone.

**2. What do you understand by Tenali (as a system)?**
Go beyond the mission statement. Describe Tenali as a system: the users (students, and where relevant, maintainers/admins), the main entities (puzzle types, difficulty tiers, the Battle Arena, the code playground, auth/sessions), and the high-level flow of data through it — e.g. how a question is generated, checked, and explained. This section is about demonstrating that you understand how the pieces fit together, not just what the project is for.

**3. Current State of the Repository — What Has Been Done So Far**
Walk through the repository and describe what already exists:
- Tech stack (frontend, backend, database, auth, deployment).
- Implemented features (the 69 puzzle types, adaptive difficulty, Battle Arena multiplayer, step-by-step explanations, the code playground, auth, etc.).

**4. Gaps Observed in the Code**
This is the most important section. List concrete weaknesses, bugs, missing features, or design problems you found while reading the code. You can also pick issues stated on the Tenali GitHub repo and solve them. For each gap, include:
- **Where** — file path and line range or component.
- **What** — what is wrong or missing.
- **Why it matters** — the impact on users, maintainability, performance, or correctness.

**5. Ideas for the Project**
Propose improvements, new features, or refactors that would make Tenali better. Each idea should include:
- **What** — the proposed change in one or two sentences.
- **Why** — the problem it solves or the value it adds.
- **How** — a sketch of the implementation.

**6. Your Contribution**
Describe the actual work you have done as part of this onboarding. A contribution can be any of:
- A bug fix.
- A new feature or endpoint (e.g. a new puzzle type — see [🧩 Add a New Puzzle](#-add-a-new-puzzle)).
- A refactor.
- Tests (unit, integration, or end-to-end).
- Documentation (this onboarding document counts only if it is exceptional; the document itself is mandatory, not the contribution).
- A design document or architectural proposal.

### Review Criteria

A reviewer will check the Onboarding Document against the following:

- All six sections are present and in order.
- Section 4 cites real files and real code, not vague impressions.
- Section 5 ideas are grounded in the gaps from Section 4.
- The document is written in the contributor's own words, not generated by an AI without understanding.

> A document that reads as if it was written without reading the codebase will be sent back.

---

## 🌐 Deployment Topology

```
tenali.fun (DNS → <production IP — redacted from public docs>)
  └── Nginx (SSL via Let's Encrypt)
        └── proxy_pass http://127.0.0.1:4000
              └── tenali.service (systemd, runs as tenali user)
                    └── node /home/tenali/tenali/server/index.js
```

> 🔒 **Security note:** The droplet IP, SSH host, and admin SSH credentials live only in
> GitHub Actions secrets (`SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`) — never committed to source.

---

## 🏆 Contributors — Real Names & GitHub IDs

> All contributor data below was fetched live from the [GitHub Contributors API](https://github.com/vicharanashala/tenali/graphs/contributors). Each contributor card shows the **real name** (from their GitHub profile), their **GitHub ID**, and the **commits they contributed**.

> 🔄 **Bot refresh cadence:** Every 12 hours (UTC 00:00 & 12:00) via cron. Only repo admins/maintainers can trigger manually — see [CONTRIBUTORS.md → Bot refresh cadence](CONTRIBUTORS.md#-bot-refresh-cadence-every-12-hours-utc-0000--1200).

### 🌟 Live Wall (auto-updated)

<a href="https://github.com/vicharanashala/tenali/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vicharanashala/tenali&max=100&columns=20" alt="Contributors wall" />
</a>

### 📊 Repo at a glance

<!-- live-snapshot:start -->
| 🏆 Commits | 🔀 Merged PRs | 👥 Contributors | 🧩 Puzzles | 📚 Vocab | 🌍 GK |
|----------:|------------:|--------------:|---------:|-------:|----:|
| **884** | **81** | **26** | **69** | **7,662** | **991** |
<!-- live-snapshot:end -->

### 🥇 Leaderboard

<!-- live-rank:start -->
_Live data — last regenerated 2026-09-04 · auto-refreshed by [`github-actions[bot]`](https://github.com/features/actions) on every push to `main` and every 12h._

| # | 👤 Real Name | 🔗 GitHub ID | 📝 Commits | 🔀 PRs | 🏷️ Role |
|--:|:-------------|:-------------|----------:|-----:|:--------|
| 🥇 | **S. R. S. Iyengar**<br/><sub>↳ also commits as <b>sudarshan</b></sub> | [sudarshansudarshan](https://github.com/sudarshansudarshan) | **281** | 0  | Lead Architect · Curriculum Author · 69 puzzle families |
| 🥈 | **Mudit Agrawal** | [muditagrawal2007](https://github.com/muditagrawal2007) | **193** | 25  | Maintainer · Battle Arena · Linear Algebra · Sudoku · Playground |
| 🥉 | **Jinal Gupta** | [jgupta05072003-code](https://github.com/jgupta05072003-code) | **94** | 0  | Upstream Repo Maintainer & PR Reviewer |
| 4. | **Lakshmi Varshini Nandula ** | [varshini-nandula](https://github.com/varshini-nandula) | **43** | 1  | Profile Showcase & Offline Storage |
| 5. | **Sameer Mishra** | [24F3005086](https://github.com/24F3005086) | **36** | 4  | i18n · Accessibility · Concept Labs |
| 6. | **Vaibhav Satish**<br/><sub>↳ also commits as <b>Vaibhav</b></sub> | [Vaibhav-sa30](https://github.com/Vaibhav-sa30) | **35** | 2  | Vachana Literacy Lab & Vocabulary |
| 7. | **DIPTOSUBHRO DATTA**<br/><sub>↳ also commits as <b>Dipto Subhro</b></sub> | [diptosubhro-ctrl](https://github.com/diptosubhro-ctrl) | **33** | 1  | Tutorial System + Noise Filter Refactor |
| 8. | **Ritish Karmakar** | [Ritish007-svg](https://github.com/Ritish007-svg) | **27** | 1  | Percentages Level-wise Explanation |
| 9. | **saniyajos**<br/><sub>↳ also commits as <b>SaniyaJos</b></sub> | [saniyajos](https://github.com/saniyajos) | **22** | 0  | — |
| 10. | **K C Dharshan** | [KCDharshan9](https://github.com/KCDharshan9) | **21** | 1  | Tap-to-Define Word Glossary |
| 11. | **Ahana Banerjee** | [ahana4banerjee](https://github.com/ahana4banerjee) | **20** | 2  | Goal Practice & Learning Journey |
| 12. | **harshyy07** | [harshyy07](https://github.com/harshyy07) | **16** | 1  | — |
| 13. | **Shubh Dixit**<br/><sub>↳ also commits as <b>Shubh dixit</b></sub> | [Shubhdix9](https://github.com/Shubhdix9) | **16** | 2  | Premium UI Suite + Word Games |
| 14. | **shreejal-bangera**<br/><sub>↳ also commits as <b>Shreejal Bangera</b></sub> | [shreejal-bangera](https://github.com/shreejal-bangera) | **8** | 0  | — |
| 15. | **SemiColonSlayer** | [sharonyamita-spec](https://github.com/sharonyamita-spec) | **6** | 1  | Math Detective Agency |
| 16. | **PANDRAJU POORVI PRAVALLIKA** | [poorvipravallika06](https://github.com/poorvipravallika06) | **6** | 1  | HCF/LCM Interactive Module |
| 17. | **Rukmender T** | [RukmenderT](https://github.com/RukmenderT) | **5** | 1  | Curiosity Mode |
| 18. | **tanvish desai** | [tanvishdesai](https://github.com/tanvishdesai) | **4** | 1  | — |
| 19. | **Disha Bansal** | [disha01bansal](https://github.com/disha01bansal) | **4** | 0  | — |
| 20. | **S. Hamsalekha**<br/><sub>↳ also commits as <b>S Hamsalekha</b></sub> | [S-Hamsalekha-annamai](https://github.com/S-Hamsalekha-annamai) | **3** | 1  | Track User Progress |
| 21. | **Krishna Gelra** | [KrishnaG-101](https://github.com/KrishnaG-101) | **3** | 1  | Language Puzzles Framework |
| 22. | **Remy baastin rayappan** | [remy-baastin](https://github.com/remy-baastin) | **2** | 1  | — |
| 23. | **harsh**<br/><sub>↳ also commits as <b>Harsh</b></sub> | [harsh](https://github.com/harsh) | **2** | 0  | — |
| 24. | **Anshul Kanodia** | [AnshulKanodia](https://github.com/AnshulKanodia) | **2** | 0  | Geometry Game Restoration |
| 25. | **garv-arora**<br/><sub>↳ also commits as <b>Garv Arora</b></sub> | [garv-arora](https://github.com/garv-arora) | **1** | 0  | — |
| 26. | **Vasuki** | [vasuki-tenali](https://github.com/vasuki-tenali) | **1** | 0  | Infra contributor |
<!-- live-rank:end -->



### 🪪 Full Contributor Profiles

> 📋 The full per-contributor cards (avatars, real names, GitHub IDs, location, top features, merged-identity notes) live in a separate file:
>
> **👉 See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full profile cards**
>
> The leaderboard below stays here as the quick-at-a-glance summary — auto-refreshed by [`github-actions[bot]`](.github/workflows/update-readme.yml) on every push to `main` and every 12 hours.

---

### 📈 PR Distribution

```
 Feature       ████████████████████████████   24 PRs
 Fix / Bug     ███████████████████           16 PRs
 Chore / Infra █████                           4 PRs
 Docs          █                               1 PR
```

---

### 🤝 How to become a contributor

> ⚠️ **The canonical upstream is [`vicharanashala/tenali`](https://github.com/vicharanashala/tenali) — that's where all PRs land.**
>
> This repo (`muditagrawal2007/Tenali_123`) is a **personal fork**, not the canonical main repo. To contribute, please fork `vicharanashala/tenali` and open your PR there — direct pushes to this fork are not reviewed.

**Step-by-step fork-first workflow (upstream → your fork → PR back):**

```bash
# 1. Fork the CANONICAL upstream on GitHub
#    → click the "Fork" button on https://github.com/vicharanashala/tenali
#    → this creates https://github.com/<your-username>/tenali

# 2. Clone YOUR fork (not this one)
git clone https://github.com/<your-username>/tenali.git
cd tenali

# 3. Add the canonical upstream as the `upstream` remote
#    (so you can pull in the latest changes)
git remote add upstream https://github.com/vicharanashala/tenali.git
git remote add origin    https://github.com/<your-username>/tenali.git

# 4. Verify remotes
git remote -v
#   origin    https://github.com/<your-username>/tenali.git (fetch)
#   origin    https://github.com/<your-username>/tenali.git (push)
#   upstream  https://github.com/vicharanashala/tenali.git (fetch)
#   upstream  https://github.com/vicharanashala/tenali.git (push)

# 5. Stay synced with upstream main
git fetch upstream
git checkout main
git merge upstream/main

# 6. Create a feature branch
git checkout -b feat/amazing

# 7. Make changes, then commit
git add .
git commit -m "feat: add amazing new puzzle"

# 8. Push to YOUR fork
git push origin feat/amazing

# 9. Open a Pull Request from <your-username>/tenali:feat/amazing
#    → vicharanashala/tenali:main
```

Every merged PR bumps your spot in the leaderboard 🏅

> 💡 Already forked `muditagrawal2007/Tenali_123`? You can re-target your fork:
> `Settings → General → Redirect this repository to vicharanashala/tenali`.

---


<div align="center">

**Built with ❤️ by the Tenali community**

[🌐 tenali.fun](https://tenali.fun) ·
<sub>⭐ If Tenali helps your classroom or your kids, drop a star — it fuels the next release.</sub>

</div>

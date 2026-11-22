# 🏰 Math Escape Room — Tenali ICT Module

[![Vitest](https://img.shields.io/badge/tests-18%20passed-brightgreen.svg)](tests/generators.test.js)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Curriculum](https://img.shields.io/badge/Curriculum-CBSE%20%2F%20ICSE%20Classes%206--10-orange.svg)](https://ncert.nic.in/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An interactive, narrative-driven **Math Escape Room** puzzle module developed for [tenali.fun](https://tenali.fun) (Vicharanashala Lab for Education Design, IIT Ropar).

Unlike static drills or forward-only equation solvers, this module introduces **narrative-driven escape quests** where Indian middle and secondary school students solve algorithmically generated CBSE/ICSE curriculum problems to crack combination locks and unlock rooms.

---

## 📖 Table of Contents

- [Motivation & Pedagogical Goals](#-motivation--pedagogical-goals)
- [The Three Escape Quests](#-the-three-escape-quests)
  - [🟢 Easy: The Locked Tiffin Box](#1--easy-the-locked-tiffin-box-3-rooms)
  - [🟡 Medium: The Science Fair Secret](#2--medium-the-science-fair-secret-5-rooms)
  - [🔴 Hard: The Library's Secret Shelf](#3--hard-the-librarys-secret-shelf-7-rooms)
- [Core Gameplay & Educational Mechanics](#-core-gameplay--educational-mechanics)
- [Architecture & Sandboxed Iframe Integration](#-architecture--sandboxed-iframe-integration)
- [Directory Structure](#-directory-structure)
- [Algorithmic Problem Generation](#-algorithmic-problem-generation)
- [Verification & Automated Tests](#-verification--automated-tests)
- [Running Locally](#-running-locally)
- [Production Build for Tenali (`/ict/escape-room/`)](#-production-build-for-tenali-ictescape-room)

---

## 🎯 Motivation & Pedagogical Goals

Indian school students (Classes 6–10) frequently struggle with specific structural hurdles in mathematics:
1. **BODMAS Sign & Precedence Errors:** Forgetting that *"of"* takes precedence over division/multiplication, or mishandling negative sign rules `(−) ÷ (−) = (+)`.
2. **Word Problem Translation Gaps:** Knowing how to compute equations once written down, but freezing when translating real-world scenarios (age, digit-reversal, fractions, speed-distance) into algebra.
3. **Extraneous Root Traps:** In radical equations like $\sqrt{ax + b} + x = c$, squaring both sides introduces extraneous roots that fail the original equation. Average students accept both roots blindly without verification.
4. **Passive Drill Fatigue:** Repetitive worksheet problems create math anxiety. The escape room format introduces playful urgency, narrative immersion, and meta-cognitive self-checking.

---

## 🗺️ The Three Escape Quests

The module features **3 complete escape stories** across **15 rooms**, covering Classes 6 to 10:

### 1. 🟢 Easy: "The Locked Tiffin Box" (3 Rooms)
- **Target Audience:** Classes 6–7
- **Topic:** Basic Arithmetic & BODMAS Foundations
- **Narrative:** Your classmate locked your 3-tier stainless steel tiffin box before lunch break as a prank! Solve the clues in your notebook to crack the combination lock and get your lunch.

| Room | Room Name | Scene | CBSE Skill / Subtype | Example Problem |
| :---: | :--- | :--- | :--- | :--- |
| **1** | 📓 The Notebook Clue | Classroom Desk | `of-mixed` — "Of" operator & mixed ops | $12 + 5 \text{ of } 4 - 3 \times 6 = \mathbf{14}$ |
| **2** | 🚶 The Corridor Riddle | School Corridor | `four-level-brackets` — Nested vinculum/(), {}, [] | $30 - [26 - \{15 + (8 - 3)\}] = \mathbf{24}$ |
| **3** | 🍱 The Canteen Lock | School Canteen | `negative-integers` — Negative integer division & sign rules | $(-20) + (-8) \div (-2) \times 3 = \mathbf{-8}$ |

---

### 2. 🟡 Medium: "The Science Fair Secret" (5 Rooms)
- **Target Audience:** Classes 8–9
- **Topic:** Linear Equations in One & Two Variables (HOTS)
- **Narrative:** You need a reagent locked in the senior chemistry lab for your science fair project. Seniors left a trail of equation clues through the science wing!

| Room | Room Name | Scene | CBSE Skill / Subtype | Example Problem |
| :---: | :--- | :--- | :--- | :--- |
| **1** | 🚪 Science Wing Entrance | Entrance Door | `brackets-both-sides` — Linear brackets on both sides | $3(x + 4) = x + 20 \implies x = \mathbf{4}$ |
| **2** | 🧪 The Chemistry Store | Chemical Cabinet | `fraction-cross` — Cross-multiplication equations | $\frac{2x + 3}{5} = \frac{x + 4}{3} \implies x = \mathbf{11}$ |
| **3** | 🔬 The Biology Lab | Microscope Station | `age-word` — Two-person age relation word problem | Ravi is 6 yrs older than Priya... Priya's age $= \mathbf{2}$ |
| **4** | ⚡ The Physics Workshop | Circuit Drawer | `digit-reversal` — 2-digit number reversal problem | Sum of digits $= 9$, reversed is 27 more $\implies \mathbf{36}$ |
| **5** | 🧫 The Secret Lab | Final Lab Safe | `fraction-word` — Numerator/denominator conditions | Add 2 to num $\rightarrow 1/2$, sub 1 from den $\rightarrow 1/3 \implies \mathbf{3}$ |

---

### 3. 🔴 Hard: "The Library's Secret Shelf" (7 Rooms)
- **Target Audience:** Class 10 (Board Exam Focus)
- **Topic:** Quadratic Equations & Advanced Applications
- **Narrative:** Legend says the school library hides a secret reference shelf with handwritten exam shortcuts left by a legendary state topper. Crack 7 quadratic ciphers to unlock the hidden shelf!

| Room | Room Name | Scene | CBSE Skill / Subtype | Example Problem |
| :---: | :--- | :--- | :--- | :--- |
| **1** | 📚 Reference Section | Book Stack | `factoring-mixed-signs` — Non-obvious middle-term split | $x^2 - 3x - 28 = 0$, positive root $= \mathbf{7}$ |
| **2** | 🗄️ The Archive Room | File Cabinet | `reducible-fraction` — Fractions reducible to quadratic | $\frac{1}{x+4} - \frac{1}{x-7} = \frac{11}{30}$, sum of roots $= \mathbf{3}$ |
| **3** | 🪜 The Mezzanine | Wrought Gate | `find-k-equal-roots` — Equal roots discriminant ($D=0$) | $(k+4)x^2 + (k+1)x + 1 = 0$, positive $k = \mathbf{5}$ |
| **4** | 🗺️ The Map Alcove | Wall Map | `two-squares-word` — Geometry sum of areas & perimeters | Sum areas $= 468$, diff perim $= 24$, small side $= \mathbf{12}$ |
| **5** | 🕯️ The Reading Nook | Wooden Chest | `speed-distance-word` — Train speed-distance application | $360\text{ km}$, $5\text{ km/h}$ faster saves $1\text{ hr}$, speed $= \mathbf{40}$ |
| **6** | 🔑 The Librarian's Desk | Desk Drawer | `radical-extraneous` — Radical equation with extraneous root | $\sqrt{2x+9} + x = 13$ ($x=20$ rejected) $\implies \mathbf{8}$ |
| **7** | 📕 The Secret Shelf | Secret Bookcase | `commerce-profit-word` — Profit% equals Cost Price | Sold for ₹$24$, gain% $=$ CP, Cost Price $= \mathbf{20}$ |

---

## 🕹️ Core Gameplay & Educational Mechanics

- **Numeric Code Lock with Negative Toggle (`±`):**
  - Lock codes reflect natural mathematical solutions (positive and negative integers).
  - Includes dedicated `±` sign toggle and full 3×4 touch keypad for mobile/tablet screens.
- **Progressive 3-Level Hint System:**
  - **Level 1 (Conceptual Nudge):** Guides thinking without giving away steps (e.g., *"Isolate the square root before squaring"*).
  - **Level 2 (Partial Solution):** Shows intermediate expansions or substitutions.
  - **Level 3 (Full Step-by-Step):** Complete algebraic breakdown.
  - *Dynamic Interpolation:* Hints automatically inject the exact randomized parameters of the active problem via `{{variable}}` templates.
- **Wrong Answer Shake & Auto-Hinting:**
  - Wrong codes trigger an accessible CSS shake animation and increment the attempt counter.
  - If a student makes **3 incorrect attempts**, Hint 1 is **automatically unlocked for free** to prevent frustration and math drop-out.
  - Specific feedback is given if an extraneous root is submitted (e.g. entering 20 on Room 6).
- **Strict No-Skip Progression:**
  - Students cannot skip rooms; each door unlocks only upon entering the verified mathematical solution.
- **3-Star Mastery Rating:**
  - ⭐⭐⭐ (3 Stars): Solved on 1st attempt with 0 hints.
  - ⭐⭐☆ (2 Stars): Solved with 1 hint OR 2–3 attempts.
  - ⭐☆☆ (1 Star): Solved with 2+ hints OR 4+ attempts.
- **Zero-Overlap Responsive Design:**
  - Designed with strict vertical stacking on 390px mobile screens and clean 60/40 two-column layouts on desktop (1280px).
  - Tested against Google Stitch design tokens with complete Light and Dark theme support.

---

## 🏗️ Architecture & Sandboxed Iframe Integration

Per Tenali's architecture (`server/index.js`), student ICT contributions are served as standalone web applications at `/ict/<folder>/` inside a secure sandbox iframe with:
```http
Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups
```

To comply with this isolation policy:
1. **Self-Contained Frontend:** Built as a standalone React 19 + Vite application.
2. **Zero Backend API Dependency:** All 15 problem generators, verification logic, and hint interpolators execute 100% client-side in pure JavaScript.
3. **Zero Persistent Storage:** Compliant with iframe opaque storage restrictions; runs purely on in-memory React state per session.
4. **Relative Asset Base (`./`):** Vite is configured with `base: './'` so static bundles resolve seamlessly inside `/ict/escape-room/` or standalone deployments.

---

## 📁 Directory Structure

```text
ICT/escape-room/
├── index.html                   # HTML entry with Noto Serif, Inter, JetBrains Mono
├── package.json                 # Standalone React 19, Vite 6, Vitest dependencies
├── vite.config.js               # Relative base, build outDir: 'dist'
├── tests/
│   └── generators.test.js       # 18 Vitest unit tests (100 random iterations per subtype)
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Main app shell & theme toggle (dark/light)
    ├── data/
    │   ├── escapes.js           # Master registry of escape stories
    │   ├── tiffin-box.js        # Easy quest config (3 rooms)
    │   ├── science-fair.js      # Medium quest config (5 rooms)
    │   └── library-secret.js    # Hard quest config (7 rooms)
    ├── generators/
    │   ├── arithmeticGenerator.js  # BODMAS, brackets, negative integer generators
    │   ├── linearEqGenerator.js    # Brackets, fractions, age/digit/fraction word problems
    │   └── quadraticGenerator.js   # Factoring, fractions, k-parameter, extraneous roots, commerce
    ├── hooks/
    │   └── useEscapeGame.js     # State machine (rooms, attempts, hints, timer, validation)
    ├── components/
    │   ├── CodeLockInput.jsx    # Numeric lock input, ± toggle, touch keypad, shake animation
    │   ├── HintPanel.jsx        # Progressive 3-level hint accordion
    │   ├── RoomProgress.jsx     # Responsive progress dots (3, 5, 7 rooms)
    │   ├── RoomUnlockedModal.jsx# Success transition modal with step summary
    │   ├── StarRating.jsx       # Gold star display
    │   └── StoryNarrative.jsx   # Themed narrative callout
    ├── illustrations/
    │   └── RoomIllustration.jsx # Lightweight SVG/CSS flat-design room scenes
    ├── screens/
    │   ├── EscapeSelectionScreen.jsx   # Quest selection grid
    │   ├── EscapeGameScreen.jsx        # Room gameplay interface
    │   └── EscapeCompletionScreen.jsx  # Victory celebration & room breakdown
    └── styles/
        └── escapeRoom.css       # Complete responsive styling (CSS variables, dark/light)
```

---

## ⚙️ Algorithmic Problem Generation

Each problem generator follows an **"answer-first" reverse synthesis pattern**:
- **Integer Guarantees:** Ensures roots and intermediate division results are always integers (no non-terminating decimals).
- **Distractor Avoidance:** Ensures problems cannot be trivially solved by naive left-to-right calculation without following BODMAS precedence.
- **Algebraic Verification of Extraneous Roots:** In `radical-extraneous`, the generator constructs $s = \sqrt{ax_{\text{valid}} + b}$ and forces the quadratic second root $x_{\text{extraneous}} = x_{\text{valid}} + 2s + a$. This mathematically proves that $x_{\text{extraneous}}$ will always satisfy the squared equation while failing the original radical equation.
- **Deterministic Fallbacks:** Every generator includes a verified CBSE textbook fallback in case random sampling reaches maximum attempts.

---

## 🧪 Verification & Automated Tests

Run the test suite with:
```bash
npm test
```

### Test Suite Coverage (`tests/generators.test.js`)
- ✅ **18 / 18 tests passing** (Vitest v3)
- **100 random iterations per subtype** (1,500+ generated equations per run)
- Verifies:
  - Exact finite integer answers ($N \in \mathbb{Z}$)
  - Formatted expressions and non-empty step-by-step solutions
  - "Of" operator results strictly differ from naive left-to-right evaluation
  - Nested bracket expressions strictly differ from unbracketed sums
  - Integer BODMAS problems produce non-zero, clean integer quotients
  - Linear fraction equations cross-multiply to integer roots
  - Age and digit-reversal word problems produce positive, physically realistic values
  - Parametric $k$ equal-root problems yield valid discriminants ($D = 0$)
  - Radical equations have **exactly one valid integer root** and **one verified extraneous root**
  - Commerce problems produce exact integer cost prices (multiples of ₹10)

---

## 🚀 Running Locally

1. **Install dependencies:**
   ```bash
   cd ICT/escape-room
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

3. **Run unit tests:**
   ```bash
   npm test
   ```

---

## 📦 Production Build for Tenali (`/ict/escape-room/`)

1. **Build the static bundle:**
   ```bash
   npm run build
   ```
2. The output is placed in `ICT/escape-room/dist/`. When the main Tenali server runs (`server/index.js`), it serves static ICT applications directly from the `/ict/escape-room/` route.

---

## 👥 Credits & Attribution

- **Developer:** Contributed as part of the ICT coursework on [tenali.fun](https://github.com/2024bbm1007/tenali)
- **Institution:** Vicharanashala Lab for Education Design (VLED), IIT Ropar
- **Inspiration:** Tenali Raman — celebrating wit, logical precision, and mathematical insight

# Contributor Onboarding Document — Tenali

- **Name:** Piyush
- **Roll Number:** 2024bbm1007
- **Institution / College:** IIT Ropar / Vicharanashala Lab for Education Design
- **Idea / Focus Area:** Math Escape Room Puzzle Module (`ICT/escape-room/`)
- **Target Audience:** Indian School Students (Classes 6–10 CBSE / ICSE)
- **Target Branch:** `feat/escape-room-puzzle-module`

---

## 1. Understanding the Project (Tenali)

**Tenali** (`tenali.fun`) is an open-source, gamified mathematics practice and fluency platform developed at the **Vicharanashala Lab for Education Design (VLED) at IIT Ropar**. Named after the witty scholar Tenali Raman, the platform is designed to overcome rote memorization in Indian school mathematics through:
- **Algorithmic Problem Generation:** Dynamically synthesizing problem parameters on the fly so learners never memorize fixed question sets.
- **Immediate Step-by-Step Explanations:** Deconstructing intermediate algebraic and arithmetic steps.
- **Adaptive Drills & Mental Gyms:** Fast-paced drills for calculation fluency (Arithmetic Gym, tables, fractions).
- **Curriculum Breadth:** Covering foundational arithmetic through higher secondary algebra, geometry, trigonometry, and calculus.
- **100% Free & Open-Source:** Unrestricted, ad-free learning accessible to any student.

---

## 2. Codebase Familiarization & Architecture Observations

During exploration of the [2024bbm1007/tenali](https://github.com/2024bbm1007/tenali) repository and upstream [vicharanashala/tenali](https://github.com/vicharanashala/tenali), I observed the following architectural patterns:

1. **Client Monolith & Mode Registry:**
   - `client/src/App.jsx` uses an inline `modeMap` to route between different interactive quizzes and tools.
   - `client/src/features/tiles.js` stores decoupled metadata for tiles (`key`, `name`, `subtitle`, `color`, `category`) without importing React components directly.
   - `client/src/apps/` was introduced under epic #234 to modularize individual sub-apps away from `App.jsx`.
2. **Server & Sandboxed ICT Submissions (`server/index.js`):**
   - The Express backend statically serves student ICT submissions from `ICT/<folder>/index.html` at `/ict/<folder>/` and `/summership/ict/<folder>/`.
   - ICT apps run inside a secure `iframe` with `Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups`, meaning they have opaque origins and cannot access main app cookies or localStorage.
3. **Identified Gap in Existing Modules:**
   - Tenali currently offers 40+ topic quizzes and 7 adaptive gym drills, but **all follow the standard drill-and-practice format** (generate problem $\rightarrow$ pick/type answer $\rightarrow$ view explanation).
   - There are **no narrative-driven or multi-stage puzzle quests** where solving math problems directly advances a story or unlocks physical/digital barriers.
   - Complex CBSE pain points—such as translating word problems into equations, rejecting extraneous roots in radical equations, and multi-tier bracket resolution—are rarely experienced in an immersive, low-anxiety puzzle setting.

---

## 3. Proposed Contribution: The Math Escape Room Module

I have designed, implemented, and verified a standalone **Math Escape Room** module located in `ICT/escape-room/`.

### A. The Core Idea
Students are placed in relatable, ethical Indian school scenarios (e.g., unlocking a prank-locked tiffin box before lunch, finding a reagent in a senior chemistry lab, discovering a secret exam revision shelf in the library). Each room represents a physical barrier locked with a combination padlock. The lock code is the mathematical answer to a dynamically generated problem.

### B. Three Difficulty Quests (15 Rooms Total)

1. **🟢 Easy — "The Locked Tiffin Box" (3 Rooms | Classes 6–7 | Basic Arithmetic):**
   - *Room 1 (Classroom):* `of-mixed` — BODMAS expressions where "of" takes precedence over $\times/\div$ ($12 + 5 \text{ of } 4 - 3 \times 6$).
   - *Room 2 (Corridor):* `four-level-brackets` — Nested vinculum, parentheses, curly braces, and square brackets ($30 - [26 - \{15 + (8 - 3)\}]$).
   - *Room 3 (Canteen):* `negative-integers` — Negative integer division and sign rules with dedicated `±` code toggle ($(-20) + (-8) \div (-2) \times 3$).

2. **🟡 Medium — "The Science Fair Secret" (5 Rooms | Classes 8–9 | Linear Equations):**
   - *Room 1 (Entrance):* `brackets-both-sides` — Variable on both sides with brackets ($3(x + 4) = x + 20$).
   - *Room 2 (Chemistry Store):* `fraction-cross` — Fractions requiring cross-multiplication ($\frac{2x+3}{5} = \frac{x+4}{3}$).
   - *Room 3 (Biology Lab):* `age-word` — Two-variable age relationship word problem with Indian names.
   - *Room 4 (Physics Workshop):* `digit-reversal` — 2-digit number digit-sum and reversed difference problem.
   - *Room 5 (Secret Lab):* `fraction-word` — Numerator/denominator modification word problem.

3. **🔴 Hard — "The Library's Secret Shelf" (7 Rooms | Class 10 | Quadratic Equations):**
   - *Room 1 (Reference Section):* `factoring-mixed-signs` — Non-obvious middle-term splitting ($x^2 - 3x - 28 = 0$).
   - *Room 2 (Archive Room):* `reducible-fraction` — Rational equation reducible to quadratic ($\frac{1}{x+4} - \frac{1}{x-7} = \frac{11}{30}$).
   - *Room 3 (Mezzanine):* `find-k-equal-roots` — Finding parameter $k$ for equal roots ($D = b^2 - 4ac = 0$).
   - *Room 4 (Map Alcove):* `two-squares-word` — Geometry word problem (sum of areas & difference of perimeters).
   - *Room 5 (Reading Nook):* `speed-distance-word` — Train speed-distance time-difference application.
   - *Room 6 (Librarian's Desk):* `radical-extraneous` — Radical equation $\sqrt{2x+9} + x = 13$ with **guaranteed extraneous root trap** ($x = 20$ rejected; valid $x = 8$).
   - *Room 7 (Secret Shelf):* `commerce-profit-word` — Commercial word problem where Profit% $=$ Cost Price.

### C. Innovative Pedagogical & UX Features
- **Negative Integer Support (`±` Toggle):** Lock inputs handle both positive and negative integer answers, ensuring mathematical honesty.
- **Tiered Progressive Hints:** 3 expandable hint levels per room (Conceptual Nudge $\rightarrow$ Partial Solution $\rightarrow$ Full Step-by-Step).
- **Auto-Hint Safeguard:** If a student enters 3 incorrect attempts, Hint 1 is automatically revealed for free to prevent frustration and abandonment.
- **3-Star Mastery System:** Evaluates efficiency and independent problem-solving (3⭐ for 1st attempt with 0 hints; 2⭐ for 1 hint or 2–3 attempts; 1⭐ for 2+ hints or 4+ attempts).
- **Zero-Overlap Responsive Design:** Audited against Google Stitch design tokens with complete mobile (`390px`) and desktop (`1280px`) support, plus Dark and Light theme toggle.

---

## 4. Technical Stack & Implementation Details

- **Framework:** React 19 + Vite 6 (JavaScript/JSX).
- **Architecture:** Standalone application in `ICT/escape-room/` with relative asset base (`base: './'`), making it 100% compliant with Tenali's sandboxed iframe serving.
- **Client-Side Generation:** Zero backend API or database dependencies. All 15 problem generators use reverse-parameter synthesis to guarantee clean integer solutions and deterministic CBSE-verified fallbacks.
- **Styling:** CSS variables (`src/styles/escapeRoom.css`) matching Tenali's warm amber (`#e07a3c`), dark charcoal (`#1b1816`), and ivory (`#f5f0eb`) palette.

---

## 5. Verification & Testing

The module includes a comprehensive test suite in `ICT/escape-room/tests/generators.test.js`:
- **18 / 18 Unit Tests Passing** via Vitest.
- **100 Random Iterations per Subtype:** Stressed across 1,500+ generated problems to verify:
  1. Every answer is a finite integer ($N \in \mathbb{Z}$).
  2. BODMAS "of" operator results strictly differ from naive left-to-right evaluation.
  3. Four-level nested bracket problems cannot be evaluated flatly.
  4. Radical equations always yield exactly one valid integer root and one mathematically verified extraneous root.
  5. Age, digit-reversal, and speed-distance word problems produce realistic positive values.
- **Hint Interpolation Check:** Audited 1,350 hint strings across 30 complete simulation runs with **0 missing template placeholders**.
- **Production Build:** Passes `vite build` cleanly (`dist/index.html`, CSS `24.67 kB`, JS `300.07 kB`).

---

## 6. Contribution Plan & Next Steps

1. **Step 1 (This PR):** Submit this Onboarding Document to `Ideas/ONBOARDING-Piyush.md`.
2. **Step 2:** Open a tracking GitHub Issue on `2024bbm1007/tenali` describing the Math Escape Room ICT module.
3. **Step 3:** Submit code PR from `feat/escape-room-puzzle-module` targeting `main`, referencing `Closes #<issue-number>` with full documentation in `ICT/escape-room/README.md`.

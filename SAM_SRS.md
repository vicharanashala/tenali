# Tenali — Adaptive Learning Enhancement: Software Requirements Specification

**Version:** 1.0 | **Date:** July 2, 2026 | **Author:** Sam | **Base Platform:** Tenali v4.0 (Prof. Sudarshan Iyengar, IIT Ropar)

> This document specifies a comprehensive set of enhancements to the Tenali adaptive math quiz platform. The goal is to transform Tenali from a quiz engine into a **research-grade adaptive learning system** that maximizes learning outcomes per minute of student time — aligned with India's NCF 2022, NIPUN Bharat, and NEP 2020 frameworks.

---

## Table of Contents

1. [Motivation & Problem Statement](#1-motivation--problem-statement)
2. [Design Philosophy](#2-design-philosophy)
3. [Feature Summary](#3-feature-summary)
4. [Pillar 1 — Adaptive Intelligence](#4-pillar-1--adaptive-intelligence)
5. [Pillar 2 — Visual & Interactive Learning](#5-pillar-2--visual--interactive-learning)
6. [Pillar 3 — Accessibility & Inclusivity](#6-pillar-3--accessibility--inclusivity)
7. [Pillar 4 — Learning Efficiency & Analytics](#7-pillar-4--learning-efficiency--analytics)
8. [Pillar 5 — Gamification & Engagement](#8-pillar-5--gamification--engagement)
9. [Age-Appropriate Content Mapping](#9-age-appropriate-content-mapping)
10. [Data Persistence & Schema](#10-data-persistence--schema)
11. [Implementation Status](#11-implementation-status)
12. [Research Citations](#12-research-citations)

---

## 1. Motivation & Problem Statement

India faces a severe learning crisis in mathematics:

| Statistic | Source | Finding |
|---|---|---|
| Grade 10 students at grade level in math | NAS 2021 | **Only 32%** |
| Class 5 students who can't do basic division | ASER 2024 | **~70%** |
| Decline from Class 3 → Class 10 | NAS 2021 | **27 percentage points** (59% → 32%) |
| Children in Learning Poverty (post-COVID) | World Bank 2023 | **70% in LMICs** |
| Word problem vs computation gap | ASER 2024 | **15–20% lower** |
| Indian youth (14–18) with smartphones | ASER 2024 | **90%** |

**The core problem**: Students at vastly different skill levels are taught the same content at the same pace. Tenali v4.0 already adapts difficulty in real time. The enhancements in this SRS aim to make that adaptation **smarter** (using published algorithms), **more visual** (following CRA pedagogy), **more inclusive** (accessibility for all learners), and **more efficient** (maximizing learning in limited time).

**Key research backing**: Pratham's Teaching at the Right Level (TaRL) methodology — validated by Nobel economists Banerjee & Duflo through J-PAL RCTs — produces **1.85 years of learning gains in just 30 hours**. The Global Education Evidence Advisory Panel rates TaRL a **"Best Buy"** intervention. Tenali's adaptive engine is fundamentally a digital implementation of TaRL.

---

## 2. Design Philosophy

All features follow five principles:

| Principle | Meaning | Policy Alignment |
|---|---|---|
| **Teach at the Right Level** | Serve questions at the student's *actual* level, not grade level | TaRL (Pratham), NEP 2020 |
| **CRA Pedagogy** | Concrete → Representational → Abstract learning sequence | NCF 2022, NCF-FS 2022, Singapore Math |
| **Dual Coding** | Combine verbal + visual channels for ~60% better retention | Paivio (1986), 3Blue1Brown |
| **Formative Assessment** | Continuously measure understanding, not just answers | NCF 2023, NIPUN Bharat |
| **Universal Access** | Every student regardless of language, disability, or connectivity | NEP 2020, WCAG 2.1 AA |

---

## 3. Feature Summary

### Features Organized by Pillar

| # | Feature | Pillar | Status | Priority |
|---|---|---|---|---|
| F1 | Bayesian Knowledge Tracing (BKT) | Adaptive Intelligence | ✅ Implemented | Critical |
| F2 | Misconception-Aware Hints | Adaptive Intelligence | ✅ Implemented | Critical |
| F3 | Prerequisite Diagnostic Test | Adaptive Intelligence | ✅ Implemented | Critical |
| F4 | Interactive Math Visualizations (Mafs) | Visual & Interactive | ✅ Implemented | High |
| F5 | Manim Pre-Rendered Explainer Videos | Visual & Interactive | 🔲 Planned | High |
| F6 | Spaced Repetition (SM-2 Algorithm) | Adaptive Intelligence | 🔲 Planned | High |
| F7 | Elo Rating for Question Difficulty | Adaptive Intelligence | 🔲 Planned | High |
| F8 | Time-on-Question & Error Recovery Rate | Learning Efficiency | 🔲 Planned | High |
| F9 | KaTeX Math Rendering | Visual & Interactive | 🔲 Planned | Medium |
| F10 | Confetti & Lottie Celebrations | Gamification | 🔲 Planned | Medium |
| F11 | PWA Offline Mode | Accessibility | 🔲 Planned | High |
| F12 | Web Speech API (Text-to-Speech) | Accessibility | 🔲 Planned | High |
| F13 | Behavioral Event Logging | Learning Efficiency | 🔲 Planned | Medium |
| F14 | CPA Question Modes | Visual & Interactive | 🔲 Planned | Medium |
| F15 | Age-Adaptive Content Gating | Accessibility | 🔲 Planned | High |
| F16 | Session Time Optimizer | Learning Efficiency | 🔲 Planned | High |
| F17 | Dyslexia-Friendly & Low-Vision Mode | Accessibility | 🔲 Planned | High |
| F18 | Multi-Language Question Support (i18n) | Accessibility | 🔲 Planned | Medium |

---

## 4. Pillar 1 — Adaptive Intelligence

> *"The right question, at the right time, at the right difficulty."*

### F1: Bayesian Knowledge Tracing (BKT) ✅ Implemented

**Source:** PersonalExam (SRIBD, 2024) + Khan Academy + Carnegie Learning

**What it does:** Replaces the simple "3 correct answers = advance" rule with a probabilistic model. Uses a 4-parameter Hidden Markov Model to estimate the probability that a student truly knows a concept — accounting for lucky guesses and careless mistakes (slips).

**Parameters:**
- `P(L₀) = 0.1` — Initial knowledge probability
- `P(T) = 0.3` — Learning probability per attempt
- `P(G) = 0.2` — Guessing probability
- `P(S) = 0.1` — Slip probability
- **Mastery threshold: P(Lₙ) ≥ 0.95**

**How it works:**

After a correct answer:
```
P(Known | Correct) = P(Known) × (1 - P(Slip)) / [P(Known) × (1 - P(Slip)) + (1 - P(Known)) × P(Guess)]
```

After each observation, learning transition is applied:
```
P(Lₙ) = P(Kₙ) + (1 - P(Kₙ)) × P(Transit)
```

**Why it matters:** A student who gets 3 easy questions right by guessing should NOT be advanced. BKT estimates *true mastery* with 95% confidence before progression. This is the same algorithm used by Khan Academy and Carnegie Learning's Cognitive Tutor.

**Implementation:** `updateBKT()`, `loadBKTState()`, `saveBKTState()` functions in `App.jsx`. Mastery persists across sessions via `localStorage`. Every quiz app (69 types) now uses BKT-based adaptive scoring.

**Acceptance Criteria:**
- [x] Difficulty only advances when P(Lₙ) ≥ 0.95
- [x] A lucky guesser is not prematurely promoted
- [x] Mastery state persists across browser sessions
- [x] All 69 quiz types use BKT scoring

---

### F2: Misconception-Aware Hints ✅ Implemented

**Source:** Oppia Foundation (open-source adaptive lessons with answer-group system)

**What it does:** Instead of a generic "Wrong, try again!" message, the system classifies wrong answers into specific *misconception patterns* and provides targeted, corrective hints.

**Example — "What is GCD(48, 18)?":**

| Student Answer | Misconception Detected | Targeted Hint |
|---|---|---|
| `48` | Picked the larger number | "GCD divides BOTH numbers. 48 doesn't divide 18 evenly." |
| `18` | Picked the smaller number | "Does 18 divide 48 evenly? Try 48 ÷ 18." |
| `3` | Found a common factor, not the GREATEST | "3 does divide both! But is there a bigger number that also divides both?" |
| `864` | Multiplied instead of finding GCD | "That's 48 × 18. GCD is a DIVISOR, not a product." |

**Why it matters:** Research from Ei Mindspark (J-PAL validated) shows that addressing specific misconceptions produces 2–4x more learning than generic feedback. The Oppia Foundation's answer-group architecture is the gold standard for this approach.

**Implementation:** `misconceptions.js` exports `getMisconceptionHint()` and `getDefaultHint()`. Misconception labels and timestamps are logged to `localStorage` (`tenali-misconceptions`) to build a long-term student weakness profile.

**Acceptance Criteria:**
- [x] Wrong answers trigger targeted hints (not generic "Try again")
- [x] Misconception labels are logged for long-term tracking
- [ ] Coverage for at least 10 quiz types with topic-specific misconception maps

---

### F3: Prerequisite Diagnostic Test ✅ Implemented

**Source:** NIPUN Bharat competency framework + UNICEF Catch-up Framework + PersonalExam Knowledge Graph

**What it does:** Before starting a quiz topic, students can take a 5-question diagnostic that tests the prerequisite skills needed for that topic. The result determines the student's "readiness percentage" and seeds the BKT starting mastery level.

**Example — Before "Trigonometry":**
1. "What is the hypotenuse of a right triangle with sides 3 and 4?" → Tests Pythagoras
2. "Simplify 12/18" → Tests fraction simplification
3. "What is 45° in the first quadrant?" → Tests angle knowledge
4. "Solve: x/5 = 3" → Tests basic algebra
5. "What type of triangle has all angles less than 90°?" → Tests triangle classification

**Diagnostic → BKT Seeding:**

| Diagnostic Score | Starting Mastery | Starting Difficulty |
|---|---|---|
| 5/5 | 0.65 | Hard |
| 4/5 | 0.50 | Medium-Hard |
| 3/5 | 0.35 | Medium |
| 2/5 or below | 0.10 | Easy |

**Why it matters:** This implements Pratham's TaRL principle — teach at the student's *actual* level, not their assumed level. A student who already knows the prerequisites shouldn't waste time on trivially easy questions.

**Implementation:** `DiagnosticQuiz.jsx` in `src/lib/`. Diagnostic results are cached per topic. `loadBKTState()` checks for diagnostic scores to seed initial mastery.

**Acceptance Criteria:**
- [x] Diagnostic available before quiz topics
- [x] Diagnostic score seeds BKT starting mastery
- [x] A high-scoring student begins at higher difficulty
- [ ] Diagnostic coverage for at least 15 quiz topics

---

### F6: Spaced Repetition — SM-2 Algorithm 🔲 Planned

**Source:** SuperMemo (Wozniak, 1990) + Anki + Duolingo

**What it does:** After a student masters a topic, the system schedules review challenges at scientifically optimal intervals: Day 1 → 3 → 7 → 14 → 30 → 60. Each successful review extends the interval; failure resets it.

**The SM-2 Algorithm:**
```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
```
Where `q` = quality of response (0–5), `EF` = easiness factor (≥ 1.3).

**User-facing:** A "📅 Review Due" badge appears on the home screen next to topics needing review.

**Why it matters:** Without review, the Ebbinghaus forgetting curve means students lose ~70% of learned material within 24 hours. SM-2 spaced repetition improves long-term retention by **200–400%** (SuperMemo research). This is the algorithm powering Anki (100M+ users) and Duolingo.

**Acceptance Criteria:**
- [ ] Review badge appears on home screen for mastered topics
- [ ] Review intervals expand with each successful recall
- [ ] Failed reviews reset the interval to 1 day
- [ ] Review schedule persists across sessions

---

### F7: Elo Rating for Question Difficulty 🔲 Planned

**Source:** Duolingo "Half-Life Regression" (Settles & Meeder, 2016) + Chess.com

**What it does:** Both students AND questions get dynamic Elo ratings that update after every interaction. The system selects the next question where the student's expected probability of success is approximately **50%** — the Zone of Proximal Development (ZPD) sweet spot.

**The Elo Formula:**
```
E = 1 / (1 + 10^((Q_rating - S_rating) / 400))
```

**Why it matters:** Questions that are too easy (>80% expected success) waste time. Questions that are too hard (<20%) cause frustration. Elo keeps the student in the "productive struggle" zone where learning is maximized per minute. This is exactly how Duolingo selects exercises.

**Acceptance Criteria:**
- [ ] Student and question ratings update after each interaction
- [ ] Next question selected where expected probability ≈ 0.5
- [ ] Ratings persist across sessions

---

## 5. Pillar 2 — Visual & Interactive Learning

> *"Watch → Explore → Practice" (CRA: Concrete → Representational → Abstract)*

### F4: Interactive Math Visualizations (Mafs) ✅ Implemented

**Source:** Mathigon Polypad + NCF 2022 CRA Framework

**What it does:** Embeds interactive, draggable mathematical visualizations inside quiz screens using the Mafs React library. Students can manipulate mathematical objects (e.g., drag numbers on a number line) and see computed results update in real time.

**Current implementation:** `GCDVisualizer` component for HCF & LCM module. Parses the question's numbers, displays them as draggable points on a Cartesian plane, and dynamically computes GCD.

**Architecture:** The `makeQuizApp` factory now accepts an optional `Visualizer` prop, making it trivial to add visualizers for any other quiz type.

**Why it matters:** NCF 2022 mandates the CRA (Concrete-Representational-Abstract) progression. Mafs visualizations serve as the **Representational** phase — bridging concrete experience (stories) and abstract theorems. Research shows CRA increases test scores ~20% compared to direct instruction.

**Acceptance Criteria:**
- [x] GCDVisualizer renders in HCF & LCM quiz
- [x] Points are draggable and GCD updates in real time
- [x] `makeQuizApp` factory supports `Visualizer` prop
- [ ] Extend to at least 3 more quiz types (fractions, coordinate geometry, trigonometry)

---

### F5: Manim Pre-Rendered Explainer Videos 🔲 Planned

**Source:** 3Blue1Brown + Dual Coding Theory (Paivio, 1986)

**What it does:** Generate 30–60 second, 3Blue1Brown-quality mathematical animations using Manim (Python) and embed them in quiz intro screens. Videos are pre-rendered to WebM format and served as static assets.

**Example:** An animation showing the Euclidean Algorithm computing GCD(48, 18) step-by-step with smooth transforms between equations:
```
gcd(48, 18) → 48 = 2×18 + 12 → gcd(18, 12) → 18 = 1×12 + 6 → gcd(12, 6) → 12 = 2×6 + 0 → GCD = 6
```

**Why it matters:** Dual-coding theory (Paivio, 1986) demonstrates that combining verbal and visual channels increases retention by **~60%**. The "Watch → Explore → Practice" flow (Manim → Mafs → Quiz) creates a complete CRA learning experience that no other intern will implement.

**Acceptance Criteria:**
- [ ] At least 3 Manim-generated videos (HCF/LCM, Trigonometry, Quadratics)
- [ ] Videos embedded in quiz intro screens with autoplay
- [ ] WebM format for efficient web delivery
- [ ] Videos are accessible (captions/subtitles)

---

### F9: KaTeX Math Rendering 🔲 Planned

**Source:** Tenali's own content validation rules (testing-strategy.md §6.2)

**What it does:** Replaces plain-text mathematical notation (e.g., `a^(p-1) ≡ 1 (mod p)`) with beautifully typeset formulas using KaTeX.

**Before vs After:**
- Before: `gcd(48, 18) = 6`
- After: Rendered with proper mathematical typography using KaTeX

**Why it matters:** Professional math rendering reduces cognitive load. Students focus on the *mathematics*, not on deciphering informal notation. Tenali's own testing strategy already requires KaTeX compatibility.

**Acceptance Criteria:**
- [ ] `MathFormula` component renders KaTeX across all quiz types
- [ ] Graceful fallback if rendering fails (shows raw text)
- [ ] Both inline and display math modes supported

---

### F14: CPA Question Modes 🔲 Planned

**Source:** NIPUN Bharat + NCF 2022 (Concrete-Pictorial-Abstract) + Bruner (1966)

**What it does:** Tags each question with a representation mode: `concrete`, `pictorial`, or `abstract`. When a student fails abstract questions twice consecutively, the system automatically falls back to pictorial mode. Fail pictorial twice → fall back to concrete (interactive Mafs visualization).

**Fallback chain:** `Abstract → Pictorial → Concrete (Interactive)`

**Why it matters:** Different students need different representations. A student who can't solve "What is GCD(48, 18)?" abstractly might succeed when shown a visual factor diagram (pictorial) or an interactive number line (concrete). This is the CPA framework from NCF 2022 applied at the individual question level.

**Acceptance Criteria:**
- [ ] Questions tagged with `representation_mode`
- [ ] Automatic fallback after 2 consecutive failures
- [ ] Concrete mode triggers Mafs interactive visualization

---

## 6. Pillar 3 — Accessibility & Inclusivity

> *"Every student, regardless of language, disability, or connectivity."*

### F11: PWA Offline Mode 🔲 Planned

**Source:** NIPUN Bharat + ASER 2024 (90% have smartphones, unreliable connectivity)

**What it does:** Makes Tenali installable as a Progressive Web App on smartphones. Caches all quiz logic, question banks (991 GK + 7,662 vocabulary JSON files), and UI assets for fully offline usage. Syncs progress when connectivity returns.

**Why it matters:** ASER 2024 reports 90% of Indian youth (14–18) have smartphone access, but **70% of India's population faces inconsistent internet**. PWA offline mode ensures Tenali works in rural areas, during power outages, and on slow 2G connections. This directly aligns with NIPUN Bharat's digital accessibility goal.

**Technical approach:** `vite-plugin-pwa` with Workbox service workers. CacheFirst strategy for static assets and JSON question banks.

**Acceptance Criteria:**
- [ ] App installable via "Add to Home Screen" on Android/iOS
- [ ] All quiz types functional without internet
- [ ] Question banks cached (GK + Vocabulary + generated questions)
- [ ] Progress syncs when connectivity returns
- [ ] Compact service worker payload

---

### F12: Web Speech API — Text-to-Speech 🔲 Planned

**Source:** iDreamEducation + NCF 2022 (mother tongue instruction) + WCAG 2.1 Accessibility

**What it does:** Adds a 🔊 "Read Aloud" button next to every question. Uses the browser's built-in Web Speech API to read questions and math notation aloud. Supports Indian English (`en-IN`) and Hindi (`hi-IN`).

**Math-to-Speech conversion examples:**
- `gcd(48, 18)` → "G C D of 48 and 18"
- `15 mod 7` → "15 modulo 7"
- `2^4` → "2 to the power 4"
- `a² + b²` → "a squared plus b squared"

**Speech parameters (optimized for children):**
- Rate: `0.85` (slightly slower than default for clarity)
- Pitch: `1.05` (slightly higher — friendlier tone)
- Language: `en-IN` (Indian English accent by default)

**Why it matters:**
1. **Accessibility:** Visually impaired students can participate fully (WCAG 2.1 AA compliance)
2. **Early readers:** Ages 10–12 may struggle to read complex word problems — audio support helps
3. **NEP 2020 alignment:** Mother tongue instruction mandate — Hindi TTS enables bilingual learning
4. **Zero cost:** Web Speech API is built into all modern browsers — no API keys or external services needed

**Acceptance Criteria:**
- [ ] 🔊 button visible on every question
- [ ] Mathematical notation converted to speakable text
- [ ] Supports `en-IN` and `hi-IN` languages
- [ ] Respects `prefers-reduced-motion` for auto-read settings
- [ ] Works offline (browser-native voices)

---

### F15: Age-Adaptive Content Gating 🔲 Planned (NEW)

**Source:** NCF 2023 Stage-wise competencies + CBSE/ICSE curriculum mapping

**What it does:** During onboarding, the student selects their age group (or class). The home screen then filters quiz topics to show only age-appropriate modules — reducing overwhelm and focusing the student on relevant content.

**Age-to-Content Mapping:**

| Age Group | Class | Modules Shown | Modules Hidden |
|---|---|---|---|
| **10–12** (Middle School) | 5–7 | Addition, Multiplication, Fractions, Decimals, Percentages, HCF & LCM, Ratio, Prime Factors, Angles, Triangles, Mensuration, Statistics (basic) | Calculus, Complex Numbers, Matrices, Differential Equations, Conics |
| **13–14** (Secondary) | 8–9 | All above + Algebra, Linear Equations, Indices, Surds, Coordinate Geometry, Trigonometry, Probability, Quadratics, Sequences, Sets | Differential Equations, Conics, Complex Numbers, Linear Programming |
| **15–16** (Senior Secondary) | 10–12 | All 69 modules visible | None |
| **Open Mode** | Any | All 69 modules | None |

**Why it matters:**
1. **Reduces cognitive overwhelm:** A Class 6 student seeing "Differential Equations" and "Conic Sections" on the home screen is intimidating and confusing. Content gating shows them only what's relevant.
2. **NCF 2023 compliance:** NCF 2023 specifies stage-wise mathematical competencies (Preparatory → Middle → Secondary). Our gating mirrors these official stages.
3. **Focused learning time:** Instead of exploring randomly, students spend 100% of their time on grade-appropriate topics — **maximizing learning per minute**.
4. **Teacher utility:** A teacher can set the class for an entire group, ensuring students practice only the syllabus-relevant topics.

**Acceptance Criteria:**
- [ ] Age/class selector on first launch (persists in localStorage)
- [ ] Home screen filters topics by selected age group
- [ ] "Open Mode" bypasses all filters
- [ ] Settings screen allows changing the age group
- [ ] Topic mapping aligned with CBSE/ICSE curriculum

---

### F17: Dyslexia-Friendly & Low-Vision Mode 🔲 Planned (NEW)

**Source:** British Dyslexia Association (BDA) Style Guide + WCAG 2.1 AA + NCF 2022 Inclusive Education

**What it does:** Adds an accessibility toggle in settings that activates a dyslexia-friendly reading mode:

**Visual changes when activated:**
- Font switches to **OpenDyslexic** (free, open-source font designed for dyslexic readers)
- Line spacing increases to **1.8** (BDA recommendation)
- Letter spacing increases to **0.12em**
- Background shifts to a **soft cream (#FDF6E3)** to reduce visual stress
- Key numbers and operators in questions are **color-highlighted** for scannability
- Font size increases by **20%** globally

**Low-vision enhancements:**
- High-contrast mode option (pure black on white, or white on black)
- Minimum touch target size of **44×44px** (WCAG 2.1 AA)
- Focus indicators visible on all interactive elements

**Why it matters:**
1. **Prevalence:** 5–10% of the global population has dyslexia. In a class of 40, that's 2–4 students who struggle to read standard fonts.
2. **India context:** India's NEP 2020 and NCF 2022 mandate inclusive education. Dyslexia often goes undiagnosed, leading to students being labeled "poor at math" when the issue is reading, not reasoning.
3. **Simple implementation:** This is purely a CSS/font change — zero impact on quiz logic. Maximum accessibility gain for minimum engineering effort.
4. **Compliance:** Meets WCAG 2.1 AA standards for text readability and contrast.

**Acceptance Criteria:**
- [ ] Accessibility toggle in settings panel
- [ ] OpenDyslexic font loaded and applied when active
- [ ] Line spacing, letter spacing, and font size adjustments
- [ ] Cream background or high-contrast mode
- [ ] All touch targets ≥ 44×44px
- [ ] Preference persists across sessions

---

### F18: Multi-Language Question Support (i18n) 🔲 Planned (NEW)

**Source:** NEP 2020 (Mother Tongue Instruction) + NCF 2022 (Multilingual Education)

**What it does:** Adds Hindi translations for question prompts, hints, feedback text, and UI labels. Students can toggle between English and Hindi at any time.

**Example:**
- English: "What is the HCF of 24 and 36?"
- Hindi: "24 और 36 का म.स.प. क्या है?"

**Phase 1 scope:** UI chrome (buttons, labels, instructions) in Hindi. Question prompts for the 15 most popular quiz types.

**Why it matters:** NEP 2020 explicitly mandates instruction in the mother tongue up to at least Class 5, and recommends it through Class 8. **Hindi is spoken by 57% of India's population.** A student who struggles with English but understands fractions perfectly should not be penalized by a language barrier.

**Acceptance Criteria:**
- [ ] Language toggle (EN / हिन्दी) in header
- [ ] UI labels and instructions translated
- [ ] Question prompts for 15+ quiz types in Hindi
- [ ] Language preference persists across sessions

---

## 7. Pillar 4 — Learning Efficiency & Analytics

> *"Maximize learning in minimum time."*

### F8: Time-on-Question & Error Recovery Rate 🔲 Planned

**Source:** El Ayat et al. (2025), Springer LNSN — "Behavioral Patterns in Adaptive Math Systems"

**What it does:** Tracks three new metrics per question attempt:
- `time_spent_seconds` — How long the student spent on the question
- `hint_requested` — Whether they clicked "Hint" before answering
- `response_time_ms` — Precise response latency

**Derived metrics:**
- **Error Recovery Rate** = (correct answers after a previous wrong) / (total wrong answers). This metric is **more predictive of mastery than overall accuracy** (El Ayat et al., 2025).
- **Confusion flag:** If time > 2× average for that question type → student is likely confused, triggering a hint or easier question.

**Why it matters:** Two students with 70% accuracy can have vastly different learning trajectories. One recovers from errors quickly (strong learner); the other repeatedly makes the same mistakes (needs intervention). Error Recovery Rate distinguishes them.

**Acceptance Criteria:**
- [ ] Time-on-question tracked for every attempt
- [ ] Error recovery rate computed per topic
- [ ] Confusion flag triggers when time > 2× average
- [ ] Metrics available for behavioral profiling (F13)

---

### F13: Behavioral Event Logging 🔲 Planned

**Source:** El Ayat et al. (2025) + DreamBox Learning (fine-grained telemetry)

**What it does:** Logs every learning event (attempt, hint_request, skip, solve, review) with full context. Builds a `student_behavioral_profile` that classifies students into clusters:

| Cluster | Characteristics | Recommended Action |
|---|---|---|
| `high_achiever` | High accuracy, fast response, low hint usage | Increase difficulty, reduce repetition |
| `steady_learner` | Moderate accuracy, good error recovery | Standard adaptive flow |
| `at_risk` | Low accuracy, high hint usage, slow response, poor error recovery | Alert teacher, serve easier content, add scaffolding |

**Why it matters:** This is the foundation for a future **Teacher Dashboard** that shows at-a-glance which students need help. DreamBox Learning's success is built on exactly this kind of fine-grained telemetry — tracking *how* students solve, not just *if* they solve.

**Acceptance Criteria:**
- [ ] Every learning event logged with timestamp, duration, and correctness
- [ ] Student classified into behavioral cluster after 20+ events
- [ ] At-risk students flagged for teacher intervention
- [ ] Event log exportable for analysis

---

### F16: Session Time Optimizer 🔲 Planned (NEW)

**Source:** Pomodoro Technique + Cognitive Load Theory (Sweller, 1988) + Duolingo session design

**What it does:** When a student opens Tenali, they can optionally set a study duration: "I have 15 / 30 / 45 / 60 minutes." The system then builds an **optimal session plan** that maximizes learning:

**Session structure:**
1. **Warm-up (10%):** 2–3 review questions from previously mastered topics (spaced repetition)
2. **Core practice (75%):** New questions at the ZPD difficulty, prioritized by topics with lowest mastery
3. **Cool-down (15%):** Summary of what was learned, topics improved, and preview of next session

**Smart prioritization uses:**
- BKT mastery scores → Focus on topics with mastery < 0.5
- Spaced repetition schedule → Include topics due for review
- Error recovery rates → Revisit topics where the student struggled
- Elo ratings → Select questions at ~50% expected success

**Why it matters:**
1. **Time is scarce:** Indian students have limited study time alongside school, tuition, and homework. Wasting 30 minutes on already-mastered topics is unacceptable.
2. **Cognitive Load Theory:** Starting with easy warm-up questions activates prior knowledge (Sweller, 1988). Ending with a summary triggers the "testing effect" for better consolidation.
3. **Duolingo model:** Duolingo's 5-minute daily sessions are optimized for maximum retention — same principle, applied to math.

**Acceptance Criteria:**
- [ ] Time selector on quiz start screen (15/30/45/60 min)
- [ ] Warm-up phase with review questions
- [ ] Core phase prioritizes low-mastery topics
- [ ] Cool-down phase summarizes session progress
- [ ] Session ends gracefully when time is up (not mid-question)

---

## 8. Pillar 5 — Gamification & Engagement

> *"Make math feel rewarding, not punishing."*

### F10: Confetti & Lottie Celebrations 🔲 Planned

**Source:** TeachMaverick (2023) — Math Anxiety Reduction + Tenali research-report.md §7.3

**What it does:**
- **Correct answer:** Subtle confetti burst (100 particles, Tenali color palette: teal, amber, cream)
- **Level-up (Easy → Medium):** Larger confetti with celebratory sound effect
- **Topic mastery:** Full fireworks pattern (5 bursts from different positions) + animated Lottie trophy

**Accessibility:** `disableForReducedMotion: true` respects the `prefers-reduced-motion` OS setting.

**Why it matters:** Math anxiety affects **~30% of students globally** (TeachMaverick, 2023). Positive reinforcement through celebrations reduces anxiety and creates a positive association with mathematical problem-solving. Duolingo's entire engagement model is built on this principle.

**Acceptance Criteria:**
- [ ] Confetti on correct answers
- [ ] Enhanced celebration on difficulty level-up
- [ ] Lottie trophy animation on topic mastery
- [ ] Respects `prefers-reduced-motion`
- [ ] Celebrations do not block quiz flow

---

## 9. Age-Appropriate Content Mapping

The following table maps Tenali's 69 quiz types to age-appropriate groups based on CBSE/ICSE curriculum and NCF 2023 stage-wise competencies:

### Ages 10–12 (Classes 5–7) — Foundational

| Category | Topics |
|---|---|
| **Arithmetic** | Addition, Multiplication, Decimals, Fractions, Percentages, Ratio, Rounding, Square Roots |
| **Number Theory** | HCF & LCM, Prime Factors |
| **Geometry** | Angles, Triangles, Polygons, Mensuration, Symmetry |
| **Data** | Statistics (mean, median, mode) |
| **Applied** | Profit & Loss, Speed-Distance-Time |
| **Other** | GK, Vocabulary, Tatsavit |

### Ages 13–14 (Classes 8–9) — All above +

| Category | Topics Added |
|---|---|
| **Algebra** | Linear Equations, Indices, Surds, Quadratics, Sequences, Sets, Squaring |
| **Geometry** | Coordinate Geometry, Pythagoras, Congruence, Similarity, Circle Theorems, Bearings, Heron's Formula |
| **Trigonometry** | Basic Trigonometry, Inverse Trig |
| **Data** | Probability, Permutations & Combinations |
| **Applied** | GST, Banking, Shares & Dividends |

### Ages 15–16 (Classes 10–12) — All above +

| Category | Topics Added |
|---|---|
| **Advanced Algebra** | Binomial Theorem, Complex Numbers, Logarithms, Inequalities, Variation, Remainder Theorem, Standard Form, Bounds |
| **Calculus** | Differentiation, Integration, Limits, Differential Equations |
| **Advanced Geometry** | Conic Sections, Circular Measure, Transformations, Section Formula |
| **Vectors** | Vectors, Matrices, Dot Products |
| **Applied** | Linear Programming, Number Bases |

---

## 10. Data Persistence & Schema

### Current (localStorage)

| Key | Purpose | Feature |
|---|---|---|
| `tenali-bkt-{topic}` | BKT mastery score per topic | F1 |
| `tenali-misconceptions` | Logged misconception labels + timestamps | F2 |
| `tenali-diag-{topic}` | Diagnostic test scores | F3 |
| `tenali-theme` | Dark/light mode preference | Base |
| `tenali-age-group` | Selected age group | F15 (planned) |
| `tenali-a11y-mode` | Accessibility mode preferences | F17 (planned) |
| `tenali-lang` | Language preference | F18 (planned) |
| `tenali-review-schedule` | SM-2 review schedule | F6 (planned) |
| `tenali-elo-{topic}` | Student Elo rating per topic | F7 (planned) |
| `tenali-events` | Behavioral event log | F13 (planned) |

### Future (Supabase — if backend integration is added)

```sql
-- F6: Spaced Repetition
CREATE TABLE review_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  topic_key TEXT NOT NULL,
  interval_days INTEGER DEFAULT 1,
  repetition INTEGER DEFAULT 0,
  easiness_factor NUMERIC(4,2) DEFAULT 2.5,
  next_review TIMESTAMPTZ DEFAULT NOW()
);

-- F8: Time Tracking
ALTER TABLE user_attempts ADD COLUMN time_spent_seconds INTEGER;
ALTER TABLE user_attempts ADD COLUMN hint_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE user_attempts ADD COLUMN response_time_ms INTEGER;

-- F13: Behavioral Logging
CREATE TABLE learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  topic_key TEXT NOT NULL,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  is_correct BOOLEAN,
  attempt_number INTEGER,
  time_on_task_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_behavioral_profile (
  student_id UUID PRIMARY KEY REFERENCES users(id),
  cluster_label TEXT,
  avg_time_on_task_ms INTEGER,
  hint_usage_rate NUMERIC(4,3),
  error_recovery_rate NUMERIC(4,3),
  computed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Implementation Status

| Phase | Features | Status | Estimated Effort |
|---|---|---|---|
| **Done** | F1 (BKT), F2 (Misconceptions), F3 (Diagnostics), F4 (Mafs) | ✅ Complete | — |
| **Phase 1** | F9 (KaTeX), F10 (Celebrations) | 🔲 Ready | 3–4 hours |
| **Phase 2** | F8 (Time Tracking), F13 (Event Logging) | 🔲 Ready | 4–5 hours |
| **Phase 3** | F7 (Elo), F6 (Spaced Repetition) | 🔲 Ready | 6–8 hours |
| **Phase 4** | F12 (TTS), F11 (PWA), F15 (Age Gating), F17 (Dyslexia Mode) | 🔲 Ready | 6–8 hours |
| **Phase 5** | F5 (Manim Videos), F14 (CPA Modes), F16 (Session Optimizer), F18 (i18n) | 🔲 Ready | 8–10 hours |

**Total estimated effort for remaining features: ~28–35 hours**

---

## 12. Research Citations

| # | Feature | Research Source |
|---|---|---|
| 1 | BKT | PersonalExam (SRIBD, 2024); Corbett & Anderson (1995) "Knowledge Tracing" |
| 2 | Misconception Hints | Oppia Foundation; Ei Mindspark (J-PAL validated) |
| 3 | Diagnostic Test | NIPUN Bharat (2021); UNICEF FLN Hub (2024); TaRL (Pratham/J-PAL) |
| 4 | Mafs Visualizations | Mathigon Polypad; NCF 2022 CRA framework |
| 5 | Manim Videos | 3Blue1Brown; Paivio (1986) Dual Coding Theory |
| 6 | SM-2 Spaced Repetition | Wozniak, P.A. (1990) SuperMemo; Ebbinghaus forgetting curve |
| 7 | Elo Rating | Settles & Meeder (2016) "Half-Life Regression", Duolingo |
| 8 | Time-on-Question | El Ayat et al. (2025) Springer LNSN |
| 9 | KaTeX Rendering | Tenali testing-strategy.md §6.2 |
| 10 | Celebrations | TeachMaverick (2023) Math Anxiety Reduction |
| 11 | PWA Offline | NIPUN Bharat; ASER 2024 (90% smartphone, unreliable internet) |
| 12 | Text-to-Speech | iDreamEducation; NCF 2022; WCAG 2.1 AA |
| 13 | Behavioral Logging | El Ayat et al. (2025); DreamBox Learning telemetry |
| 14 | CPA Question Modes | NIPUN Bharat; NCF-FS 2022; Bruner (1966) |
| 15 | Age-Adaptive Gating | NCF 2023 Stage-wise competencies; CBSE/ICSE curriculum |
| 16 | Session Optimizer | Sweller (1988) Cognitive Load Theory; Duolingo session design |
| 17 | Dyslexia Mode | British Dyslexia Association Style Guide; WCAG 2.1 AA; NEP 2020 |
| 18 | Multi-Language (i18n) | NEP 2020 Mother Tongue mandate; NCF 2022 Multilingual Education |

**Total research sources synthesized:** 54+ (papers, OSS projects, policy documents, EdTech analyses)

---

> **Summary:** These 18 features transform Tenali from a quiz engine into a research-grade adaptive learning system. Every feature is backed by published research, aligned with Indian education policy (NCF 2022, NIPUN Bharat, NEP 2020), and designed to maximize learning outcomes for students aged 10–16 — regardless of their starting level, language, disability, or internet access.

# Tenali FLN Platform — Research Report

**Prepared by:** Research Agent
**Date:** May 2026
**Status:** Complete
**For use by:** Engineering Agent (v0.1–v0.68 development)

---

## 1. FLN Best Practices in India

### 1.1 Context: India's FLN Mission

India's FLN framework is governed primarily by:
- **NIPUN Bharat Mission** (National Mission for Foundational Literacy and Numeracy)
- **National Education Policy (NEP) 2020**
- **National Curriculum Framework (NCF-FS) 2022** — covers ages 3–8 foundational stage
- **NCF 2023** — for secondary stage (ages 14–18)

While formal FLN targets ages 3–8 (early primary), the Tenali target audience of **ages 10–16** falls into the "extended FLN" window where foundational gaps in secondary students are remediated.

### 1.2 Pedagogical Structure for Ages 10–16

**Key finding:** India's NAS 2021 data shows Grade 3 national averages of just 59% in language and 57% in mathematics — but the NEP 2020 recognizes that students who fall behind rarely catch up (Manjul Bhargava, as cited in iDreamEducation). This validates Tenali's adaptive regression approach for older students who may have missed earlier foundations.

**Progression model from NCF-FS 2022:**
- **Learning domains** build on each other in sequence
- Curricular goals → specific competencies → learning outcomes
- **CRA (Concrete → Representational → Abstract)** is the dominant pedagogical framework for mathematical concept teaching in India
- NCF recommends connecting mathematical concepts to everyday contexts — validating Tenali's story-based approach

**Pedagogical best practices for teaching theorems to ages 10–16:**

1. **Concrete-Pictorial-Abstract (CPA) Approach**
   - Start with physical/manipulable representations
   - Move to visual/diagrammatic representations before introducing formal notation
   - Tenali story intros should map directly to this — using narrative context (concrete scenario) before formal theorem statement (abstract)

2. **Contextual Scaffolding**
   - Math concepts should be anchored in real-world, relatable scenarios before abstract formalization
   - Research (TeachMaverick) shows story-based context increases test scores by ~20% vs. traditional instruction for Grade 3 students

3. **Narrative-Driven Concept Introduction**
   - Embed theorems within story arcs: protagonist faces a problem → mathematical reasoning → resolution
   - Dual-coding theory: combining verbal narrative + visual imagery improves retention
   - Character investment reduces math anxiety and increases persistence through difficulty

4. **Progressive Formalization**
   - Story → Guided Example → Independent Practice → Real-world Application
   - This is the standard FLN pedagogical arc and maps exactly to Tenali's Stage 1 structure

### 1.3 Implications for Tenali

- **Story Intro Screen (v0.12):** Must establish narrative context before any mathematical content. The story IS the concrete representation.
- **Stage sequence (v0.14):** Should follow: guided example (worked) → practice questions → real-world payoff. Not just question-repeat loops.
- **FLN target audience caveat:** Tenali's 10–16 age range means students may have missed CRA-based FLN instruction in early primary. Platform must handle varied starting levels gracefully — the 10-variant question pool per stage helps with this.
- **Age-appropriateness:** NCF-FS targets ages 3–8; Tenali targets 10–16. Stories must be age-appropriate (not patronizing). The "Code Vault" and "Detective" narrative frames (from research) work well for early adolescents.

---

## 2. Adaptive Learning Systems: Regression-Based Approaches

### 2.1 How Regression-Based Adaptive Engines Work

Regression-based adaptive systems adjust content difficulty based on **performance history**. Unlike AI/ML-based systems that predict future performance, regression-based systems use **simple rule-backoff**:

- **Correct answer** → maintain or advance difficulty
- **Wrong answer** → provide hint → regress if repeated failure
- **Regression = back to an easier version of the same concept**, presented with different question context

**Why regression is effective for FLN:**
- Cognitive load theory: struggling at too-high difficulty causes anxiety and disengagement
- Zone of Proximal Development (ZPD): optimal learning happens just above current mastery level
- Regression preserves dignity — student isn't "dumb," they're just at a different level
- Punitive systems (lockout, score penalty only) increase dropout rates

### 2.2 Student Struggle Indicators — Predictive Triggers

Research from adaptive learning literature identifies these **high-predictive struggle signals**:

| Indicator | Trigger Threshold | Why It Predicts Dropout |
|---|---|---|
| Repeated wrong attempts | >2 wrong on same question | Cognitive overload signal |
| Time-on-question | >2× average for that question type | Indicates confusion vs. slow thinking |
| Regressions in same session | 3+ regressions/session | Active struggle, not minor difficulty |
| Same question attempted 3+ times | Still wrong after 3 attempts | Needs concept re-explanation, not retry |
| Same stage stalled | 3+ sessions at same stage | Structural misunderstanding |
| First-attempt accuracy | <40% on first attempts | General mastery gap |
| Time since last login | >7 days | Disengagement risk |

### 2.3 Tenali's Adaptive Model (from Roadmap)

Tenali uses:
- 1 wrong answer → hint revealed (no penalty)
- Wrong on retry → hint confirmed, retry
- 3rd wrong attempt → regress to previous stage (different question variant)
- 3 correct answers in a stage → advance to next stage
- Stage 1 regression → stays at Stage 1 with new variant

**Assessment against best practices:**
✅ Hints first, regression second — good scaffold-first design
✅ 3-regression threshold before alerting teacher — aligns with research (>2 wrong = signal, but 3 gives benefit of doubt)
✅ No punitive lockouts — appropriate for FLN
⚠️ No time-based triggers — consider adding time-on-question as secondary indicator (for v0.49 alerting)
⚠️ No "stalled for 3 sessions" regression — only per-session regressions. Consider adding session-streak tracking.

**Recommended additions (for v0.49 or beyond):**
1. Time-on-question tracking: log `time_spent_seconds` and flag if >2× expected for that difficulty weight
2. Session-streak tracking: if a student regresses to the same stage 3 different sessions, trigger an alert even if they eventually pass
3. First-attempt accuracy rolling average: flag if a student's rolling first-attempt accuracy drops below 40%

### 2.4 BYJU'S / Khan Academy / Duolingo Comparison

**BYJU'S:**
- Adaptive engine uses spaced repetition + concept mapping
- Struggling indicators: time-on-task, repeated wrong answers, session frequency
- Teacher dashboard shows heat maps of concept mastery gaps
- Known issue: content can be overwhelming; pacing is aggressive

**Khan Academy:**
- Mastery-based progression (not grade-based)
- Teacher dashboard shows: **Activity tab** (minutes practiced, questions attempted), **Skills tab** (mastery % per skill), **Mastery tab** (progress toward goals)
- Key metrics: % mastery per skill, streak days, videos watched
- Student struggle: "Needs Review" badge when a previously-mastered skill drops below 80%

**Duolingo:**
- Uses spaced repetition with "strength" meter
- Lesson-level difficulty adjusts based on error rate
- League/leaderboard gamification for engagement
- Struggling indicators: hearts (lives) depleted; repeated mistakes in same lesson
- Teacher dashboard (Duolingo School): individual student progress, common errors

**Key lesson for Tenali:** All three platforms distinguish between **engagement metrics** (time spent, login frequency) and **mastery metrics** (accuracy, progression rate). Tenali's teacher dashboard (v0.46–v0.50) should do the same.

---

## 3. Teacher Dashboard & Analytics

### 3.1 Effective Teacher Dashboard Metrics (from Khan Academy + BYJU'S research)

**Tier 1 — Must-Have (Actionable Immediately):**
- Student completion rate (% of assigned content completed)
- Mastery score per algorithm/topic (0–100 scale)
- Regression count per student per session
- Last active timestamp
- Alert status (needs attention / on track)

**Tier 2 — Diagnostic (For Deep Dive):**
- Questions attempted vs. correct first-try rate
- Time spent per stage
- Stage-by-stage progression timeline
- XP history chart

**Tier 3 — Systemic (Cohort/Class level):**
- Cohort mastery heat map (algorithms × mastery bands)
- Common failure points (which stages have highest regression rate across cohort)
- Completion funnel (started vs. completed per algorithm)
- Cohort comparison (two cohorts side-by-side)

### 3.2 Struggle Indicator Design

**Khan Academy model:**
- "Needs Review" flag when previously-mastered skill decays
- Color coding: green (mastered), yellow (in progress), red (struggling)
- Per-skill drill-down: see exact questions student got wrong

**BYJU'S model:**
- Concept mastery heat map per student
- Red highlight on concepts with <50% accuracy
- Time-spent anomaly detection

**Duolingo model:**
- "Hearts" (lives) system — visual, gamified struggle indicator
- Struggling students highlighted in leaderboard with "fell behind" badge

**Tenali Teacher Alert Design (v0.49) — Recommended:**
- Visual indicators: 🔴 Alert (needs help), 🟡 Warning (slow progress), 🟢 On track
- Alert card should show: Student name, Algorithm + Case Study, Specific stage, Triggering event (e.g., "5 regressions in this session")
- Drill-down link: click → goes directly to that student's analytics at that stage

### 3.3 Alert Trigger Recommendations

| Alert Type | Trigger | Channel |
|---|---|---|
| Repeated failure | 5+ regressions in single session | In-app + email |
| Stalled progress | Same stage for 3+ sessions without advancement | In-app |
| Inactive | No login for 7+ days | In-app + email |
| Mastery drop | Accuracy on recent attempts <40% (rolling 10-question window) | In-app |

---

## 4. Question Bank & Story-Based Question Design

### 4.1 Story-Based Math Questions — Best Practices

**Core principles (from research on mathematical storytelling):**

1. **Relatable protagonist & everyday context**
   - Characters face real problems requiring math to solve
   - Example: "Elena's Bakery" — calculating ingredient costs and pricing pastries
   - Tenali's "Code Vault" frame works for cryptography theorems (ages 12+)

2. **Narrative arc mirrors problem-solving**
   - Hook → Conflict → Mathematical reasoning → Resolution
   - Student invested in character's success → motivated to solve

3. **Dual-layer decoding**
   - Narrative layer (story) + Mathematical layer (computation)
   - Teacher guides students to identify math tasks within story events

4. **Multi-step problems**
   - "Emma has 12 crayons. She wants to share them equally among 3 friends. How many crayons does each friend get? If Emma keeps 2 crayons for herself, how many crayons are left to share?"
   - Requires division + subtraction + reasoning

5. **Character dialogue**
   - Adds engagement and different perspectives on the same problem
   - Example: "Sara said she had 9 apples. Tom said he had 4 apples less than Sara. How many apples does Tom have?"

**Age-appropriateness for 10–16:**
- Ages 10–12: everyday contexts (bakery, sports, school events, nature)
- Ages 13–16: aspirational contexts (coding, investigation, design, community problems)
- Avoid patronizing tone — treat students as capable problem-solvers

### 4.2 10-Variant Question Rotation — Ensuring Distinction

**Problem:** 10 variants per stage need to feel meaningfully different, not just re-skinned with different names/numbers.

**Solution framework (3 axes of differentiation):**

| Axis | What changes | Example for "modular exponentiation" |
|---|---|---|
| **Context** | Story frame, characters, setting | Vault code / Sports score / Message decoder |
| **Difficulty weight** | Number complexity, steps required | 2-digit mod vs. 4-digit mod |
| **Presentation** | Question structure (fill-in, explain, derive) | "Find the code" vs. "Verify if this code works" |

**Best practice:** Each variant should differ on **at least 2 of 3 axes**. Pure number-swaps (same context, same structure, just different numbers) do not constitute meaningful variants for FLN purposes.

**For Tenali's implementation:**
- `question_pool` table has `difficulty_weight` per variant — use this to ensure balanced selection
- Variant selection algorithm should randomize across context types, not just within one context
- For a given stage, aim for at least 3 distinct story contexts across the 10 variants

### 4.3 Hint Design — Effective vs. Answer-Revealing

**What makes hints effective:**

1. **Scaffold, don't solve**
   - Good: "Think about what numbers multiply to give you 12..." (leads student to factor pairs)
   - Bad: "The answer is 4 because 12 ÷ 3 = 4" (reveals the division operation)

2. **Progressive reveal (3-level hints)**
   - **Hint 1:** Conceptual reframe — restate the problem in different words
   - **Hint 2:** Process clue — what operation or approach to use
   - **Hint 3:** Partial answer — a significant step toward the answer without completing it

3. **Never reveal the answer directly or through specific numbers**
   - Bad: "Try multiplying by 3" (too specific if the answer involves multiplying by 3)
   - Good: "Which operation would reverse this operation?" (conceptual guide)

4. **Connect to the concrete**
   - Good: "Remember the story — the vault opens when both sides of the equation balance. What do you need to do to both sides to isolate the variable?"
   - Uses narrative anchor from the story intro

5. **Model metacognition**
   - Good: "What is the question asking you to find? Circle that part."
   - Good: "Does your answer make sense in the story context?"

**Hint design anti-patterns (what to avoid):**
- Direct formula display: "Use the formula a^(p-1) ≡ 1 (mod p)"
- Numerical step reveal: "Now subtract 3 from both sides"
- Answer-embedded questions: "Is the answer 7?" (only valid if 7 is an option, not for integer input)
- Red herring hints: suggesting wrong operations

---

## 5. Fermat's Little Theorem Case Study — "The Secret Code Vault"

*(Reference case study reviewed — used as template for all 7 algorithms)*

### 5.1 Story Flow Assessment

**Story structure (from roadmap description):**
- Vault-themed narrative, cryptographic context
- 7 stages following Fermat's Little Theorem progression
- 10 question variants per stage

**Strengths:**
- Cryptography hook is intrinsically engaging for ages 12+ (real-world relevance, "secret agent" appeal)
- FLT is well-suited to the story frame (vault codes involve modular arithmetic naturally)
- Real-world applications are authentic (computer security, error-detecting codes)

**Improvements:**
- Stage 1 story intro should establish WHY the vault matters (backstory, stakes)
- Character motivation: student should feel they're the hero, not just a passive solver
- End-of-stage transitions should reference the story — if they get the code right, the vault opens with a narrative beat

### 5.2 Question Clarity

**Best practice (from research):**
- Every question should have ONE clear mathematical operation as the core answer
- Language should be unambiguous — no hidden tricks or double-negatives
- For FLT specifically: avoid questions that require understanding Fermat's theorem in Stage 1 (Stage 1 should be concrete modular arithmetic — what remainder is left?)

**Recommendation:**
- Stage 1 of Fermat FLT should test basic modular arithmetic (congruence, remainder computation) before introducing the theorem itself
- The theorem statement should only appear in Stage 4–5, once intuition is built
- This follows the CRA approach: Concrete (Stage 1–3: remainders) → Representational (Stage 4–5: theorem connection) → Abstract (Stage 6–7: formal FLT)

### 5.3 Hint Design Recommendations

**Progressive 3-level hint structure for Fermat stages:**

| Stage | Hint 1 (Conceptual) | Hint 2 (Process) | Hint 3 (Partial) |
|---|---|---|---|
| 1 (Basic mod) | "Think about remainders — what is left over after dividing?" | "Use the mod operator: a mod n = remainder" | "For 17 mod 5: 5 goes into 17 three times (15), remainder is ___" |
| 2 (FLT intro) | "Fermat noticed a pattern when exponents and moduli are related..." | "Check if p is prime in the expression a^(p-1) mod p" | "For a=2, p=5: 2^4 = 16; 16 mod 5 = ___" |
| 3 (Applications) | "The vault uses the theorem to verify if a code is valid..." | "Apply a^(p-1) ≡ 1 to check the received message" | "Plug in the values: does the congruence hold?" |

### 5.4 Extension: Other Algorithms Story Framing

| Algorithm | Story Frame (Recommended) | Age Suitability |
|---|---|---|
| Fermat's Little Theorem | Code vault / Secret agent decoder ring | 12+ |
| Handshake Problem | Party planning / Seating arrangements | 10+ |
| Chinese Remainder Theorem | Ancient puzzle / Temple bells / Calendar dating | 12+ |
| Coupon Collector | Treasure hunt / Collector's quest | 10+ |
| Euclidean Algorithm | Museum heist / Gem sorting / Locksmith | 12+ |
| Modular Multiplicative Inverse | Trading posts / Currency exchange / Secret sharing | 13+ |
| Binary Exponentiation | Computer circuits / Speed challenge / Kingdom messengers | 14+ |

---

## 6. Testing Pipeline — Best Practices

### 6.1 Stress Testing Educational Platforms

**Key scenarios for Tenali (from research):**

| Scenario | Load Level | What to Measure |
|---|---|---|
| OTP burst | 100 students logging in simultaneously | OTP generation latency, email delivery queue, Supabase auth rate limits |
| Case study launch | 50 students starting same case study | Question pool reads, user_progress writes, stage progression |
| Concurrent learning | 200 writes/min to user_attempts | Database connection pool, write latency |
| Teacher dashboard | 20 teachers logging in simultaneously | Session creation, cohort query performance |
| CDN edge load | All static assets served | CDN hit ratio, TTFB <50ms |

**Tools recommended:**
- **k6** (Grafana's open-source load testing tool) — scriptable in JS, excellent for CI integration
- **Artillery** — lightweight, YAML-based — good for quick smoke tests
- **BrowserStack** — for real-device cross-browser testing (not load testing, but critical for v0.61)

**Database stress testing specifics:**
- Test concurrent writes to `user_attempts` and `user_progress` (the two highest-write tables)
- Supabase Pro plan: ~60 concurrent connections, ~200 requests/second
- Verify connection pooling: pgBouncer settings, Supabase's built-in pooler
- Test read-heavy scenarios (dashboard loading with 1000+ students' data)

### 6.2 Content Validation — Essential Checks

**Automated validation pipeline (for v0.56) — must check:**

| Check | Validation Rule | Blocking? |
|---|---|---|
| Stage completeness | Every stage has ≥3 questions | Yes |
| Answer presence | Every question has non-empty `answer` field | Yes |
| Hint presence | Every question has non-empty `hint_text` field | Yes |
| Answer type match | `answer_type` matches actual answer format (integer vs. word) | Yes |
| Story intro | Every case study has non-empty `story_intro` | Yes |
| Payoff content | Every case study has theorem statement + ≥2 real-world applications | Yes |
| Variant count | Every stage has 10 variants in `question_pool` (for v0.19+) | No (warn only) |
| Orphan stages | All stages reference a valid case_study_id | Yes |
| Duplicate detection | No two questions within same stage have identical text AND same difficulty_weight | No (warn only) |
| Difficulty weighting | difficulty_weight is 1–5 for all variants | Yes |
| KaTeX compatibility | Math expressions use valid KaTeX syntax | Yes |

**Implementation:** Run as a nightly cron job against Supabase staging. Block publish of any case study that fails validation. Email admin with validation report.

### 6.3 Cross-Browser Testing Strategy

**Target browsers (v0.61):**
- Chrome (latest) — desktop
- Firefox (latest) — desktop
- Safari (latest) — desktop
- Safari iOS (latest) — mobile
- Chrome Android (latest) — mobile

**Critical test cases for low-end devices (360px viewport, 3G throttling):**
- Auth flows (OTP input behavior differs across mobile browsers)
- Math rendering (KaTeX can fail silently on older browsers)
- Animations (reduced motion is critical — test with `prefers-reduced-motion: reduce`)
- Stage transitions (horizontal slide animations can jank on low-end Android)
- Keyboard navigation (iOS Safari has known issues with focus management in modals)

**Specific known issues to check for:**
- iOS Safari: OTP 6-digit input auto-advance may conflict with iOS autofill — test with password managers
- Chrome Android: `inputmode="numeric"` for integer answers should trigger number keyboard
- Firefox: Math notation rendering with KaTeX — ensure MathJax fallback works

---

## 7. Additional Research Findings

### 7.1 Cross-Curricular Connections

Stories should connect math to other disciplines where possible:
- **History:** CRT and ancient Chinese/Greek mathematical discoveries
- **Science:** Binary exponentiation → computer science, cryptography
- **Literature:** Storytelling itself as a meta-connection

This aligns with NCF recommendations and increases engagement for students who don't see themselves as "math people."

### 7.2 Visual Representations

Research from Kappan Online (2023) emphasizes:
- Visuals should not just convey meaning TO students, but be a tool FOR students to express meaning
- Diagrams, number lines, and visual representations are especially important for English-language learners
- Universal Design for Learning (UDL) principles: multiple means of representation

**Tenali implementation recommendation:** Consider adding optional visual aids (toggle) for students who want them — especially in early stages. These should be simple SVG illustrations that match the story context, not abstract math diagrams.

### 7.3 Math Anxiety Reduction

Story-based learning reduces math anxiety (per research cited by TeachMaverick):
- Framing challenges as narrative puzzles (rather than tests) reduces fear response
- Character investment creates emotional engagement that overrides performance anxiety
- Multiple solution paths (in open-ended questions) reduce "right answer fear"

**Implication for Tenali:** The celebration/payoff screen should reinforce this. Students who struggled should feel the journey was worth it — the "journey recap" on the payoff screen (v0.15) is valuable not just for satisfaction but for reframing struggle as part of learning.

### 7.4 Memory Retention

Dual-coding theory (Paivio): combining verbal narrative + visual imagery doubles encoding channels:
- Students who learn math through stories retain ~60% more than those learning via rote memorization
- Emotional engagement (character investment) adds a third encoding channel
- **Practical implication:** Story intros and payoff screens should be vivid and emotionally engaging, not just informational

---

## 8. Citations & References

1. **iDreamEducation** — "FLN in India: Strategies for Foundational Literacy & Numeracy"
   - https://www.idreameducation.org/blog/foundational-literacy-numeracy-fln-india/

2. **TeachMaverick** — "Mathematical Storytelling: Using Narrative to Teach Abstract Concepts"
   - https://www.teachmaverick.com/mathematical-storytelling/

3. **AAKollective** — "Harnessing the Power of Story-Based Math Problems to Build Critical Thinking"
   - https://aakollective.com/resources/harnessing-the-power-of-story-based-math-problems-to-build-critical-thinking

4. **Kappan Online** — "Making Mathematics Visible Through Narrative"
   - https://kappanonline.org/making-mathematics-visible-through-narrative/

5. **Khan Academy** — Teacher Dashboard documentation
   - https://support.khanacademy.org/hc/en-us/sections/18377585839501-How-to-use-reporting-to-monitor-student-progress

6. **ScienceDirect** — "Predicting Student Performance in Online Learning Platforms"
   - Systematic review of ML approaches in adaptive learning

7. **MDPI** — "Predictive Models for Educational Purposes: A Systematic Review"
   - Compares SVM, ANN, Decision Tree approaches for predicting student performance

8. **LoadForge** — "Database Stress Testing Best Practices"
   - https://loadforge.com/guides/databases/database-stress-testing-best-practices

9. **BrowserStack** — "Concurrency Testing: Benefits, Tools, and Best Practices"
   - https://www.browserstack.com/guide/concurrency-testing

10. **UNICEF FLN Hub** — Foundational Literacy and Numeracy resources
    - https://www.unicef.org/flnhub/

11. **NEP 2020 + NCF-FS 2022** — India's national curriculum frameworks for FLN

---

## 8a. Supplementary References — FLN-research-references.md

*Full reference list with working links is maintained in `docs/FLN-research-references.md`. Categories below:*

**Category 1 — Foundational Literacy and Numeracy (FLN):**
- "Enhancing FLN in India: Key Strategies" — iDreamEducation (2024): https://www.idreameducation.org/blog/foundational-literacy-numeracy-fln-india/
- NEP 2020 — Government of India (2020): https://www.education.gov.in/en/nep
- NCF-FS 2022 — NCERT, Government of India (2022): https://ncf.ncert.gov.in/#/web/home
- NIPUN Bharat Mission — MoE India (2021): https://nipunbharat.education.gov.in/
- ASER Centre — Pratham (2024): https://asercentre.org/
- ASER 2024 Full Report — Pratham (2024): https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24.pdf
- Pratham — Every Child In School and Learning Well: https://www.pratham.org/
- UNICEF FLN Hub: https://www.unicef.org/flnhub/
- CSF — "System Reform for FLN" — Central Square Foundation (2023): https://www.centralsquarefoundation.org/articles/csfs-approach-to-system-reform-for-foundational-literacy-and-numeracy-fln
- NAS 2021 — Government of India: https://nas.gov.in/report-card/nas-2021

**Category 2 — Adaptive Learning Paths:**
- "Exploring Behavioral Patterns and Predicting Academic Success" — Springer (2025): https://link.springer.com/chapter/10.1007/978-3-031-99997-0_15
- Adaptive Python library — python-adaptive (2024): https://github.com/python-adaptive/adaptive
- "Educational Chatbot with personalized adaptive learning" — Chen et al. (2024): https://doi.org/10.1007/s10758-024-09807-5
- arXiv: "Beyond Static Question Banks via LLM-Automated Graph" (2026): https://doi.org/10.48550/arXiv.2602.00020
- GitHub Topics — adaptive-learning (307 repos): https://github.com/topics/adaptive-learning

**Category 3 — Personal Adaptive Learning Paths:**
- PersonalExam (BKT + LLM + Knowledge Graph) — SRIBD (2024): https://github.com/sribdcn/PersonalExam
- "Student Modeling and Analysis in Adaptive Instructional Systems" — IEEE (2022): https://ieeexplore.ieee.org/document/9784853
- MDPI: "Predictive Models for Educational Purposes: A Systematic Review" (2024): https://www.mdpi.com/2504-2289/8/12/187
- ResearchGate: "Predicting Student Performance in Online Learning Platforms" (2024): https://www.researchgate.net/publication/385541072_PREDICTING_STUDENT_PERFORMANCE_IN_ONLINE_LEARNING_PLATFORMS_ANALYZING_ENGAGEMENT_METRICS_WITH_MACHINE_LEARNING_MODELS

**Category 4 — Open Source Software:**
- Oppia — free online learning platform: https://github.com/oppia/oppia
- Moodle — world's open source learning platform: https://github.com/moodle/moodle
- Adaptive Python library — parallel active learning: https://github.com/python-adaptive/adaptive
- PersonalExam — AI-powered personalized exam system: https://github.com/sribdcn/PersonalExam
- education-agent-skills — 147 evidence-based education skills for AI agents: https://github.com/GarethManning/education-agent-skills
- PWPAE — concept drift detection for online learning: https://github.com/Western-OC2-Lab/PWPAE-Concept-Drift-Detection-and-Adaptation

**Category 5 — FLN Resolution Reports / Government:**
- ASER 2024 Full Report: https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24.pdf
- ASER 2024 National Findings: https://asercentre.org/wp-content/uploads/2022/12/ASER-2024-National-findings.pdf
- ASER Centre: https://asercentre.org/
- NEP 2020: https://www.education.gov.in/en/nep
- NIPUN Bharat: https://nipunbharat.education.gov.in/
- World Bank — Ending Learning Poverty (2023): https://www.worldbank.org/en/topic/education/brief/ending-learning-poverty
- World Bank Education & Skills: https://www.worldbank.org/en/topic/education
- Smile Foundation — "Reinventing Foundational Learning: FLN in India" (2024): https://www.smilefoundationindia.org/blog/reinventing-foundations-fln-in-india/

---

## 9. Summary: Key Takeaways for Engineering Agent

| Area | Top Recommendation |
|---|---|
| FLN pedagogy | Follow CRA: Concrete story → Guided example → Abstract formalization. Never introduce theorem statements before concrete intuition. |
| Adaptive engine | Add time-on-question tracking and session-streak monitoring alongside regression count for more predictive alerting. |
| Teacher dashboard | Tiered metrics: at-a-glance status indicators (🔴/🟡/🟢) → drill-down to per-student, per-stage, per-question detail. |
| Story questions | Differentiate 10 variants across 3 axes: context, difficulty, presentation. Not just number swaps. |
| Hint design | 3-level progressive reveal: conceptual reframe → process clue → partial answer. Never directly reveal. |
| Testing | Use k6 for load testing (especially OTP burst + concurrent writes). Integrate BrowserStack for cross-browser. |
| Content validation | Block publish if any stage lacks required questions/answers/hints. Run nightly. |

---

*End of Research Report*
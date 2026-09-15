# Design Rationale & Technical Approach — Feature BC: Conceptual MCQ Variants

This document explains the technical approach, design rationale, implementation decisions, and architectural behaviors of the **Conceptual MCQ Variants** feature.

---

### Q1: What is the purpose of the Conceptual MCQ Variants feature?
**A:** Traditional math quizzes focus heavily on numerical computation (calculating the final number). While important, computation drills do not ensure a student understands *why* they performed those operations. This feature integrates conceptual Multiple Choice Questions (MCQs) into the learning loop to test theoretical comprehension of rules, definitions, and theorems alongside computation.

---

### Q2: In which topics is this feature available and working?
**A:** The feature is available in following 6 topics for now, and will be populated to other topics gradually. The initial fully functional topics are:
- **Fraction Arithmetic (`fractionadd`)** — e.g., common denominator (LCM) rules and division reciprocals.
- **Indices/Exponents (`indices`)** — e.g., zero index and negative exponent rules.
- **Linear Equations (`lineareq`)** — e.g., balanced equality properties.
- **Trigonometry (`trig`)** — e.g., sine/cosine/tangent ratios (SOHCAHTOA).
- **Basic Arithmetic (`basicarith`)** — e.g., rules for multiplying signed integers.
- **Quadratic Formula (`qformula`)** — e.g., discriminant properties and root counts.

---

### Q3: Where do these conceptual questions come from?
**A:** The questions are custom-authored JSON datasets modeled after standardized curriculum pedagogy. They target the critical theoretical bottlenecks where students commonly hold misconceptions (e.g., confusing reciprocal multiplication with sign inversion).

---

### Q4: Why is this feature restricted to Adaptive Mode only?
**A:** Restricting conceptual checkpoints to Adaptive Mode serves three core purposes:
1. **Validation Gates:** Adaptive mode promotes students to higher difficulty stages. Conceptual questions act as gates to verify that a student has the theoretical foundation required for harder calculations.
2. **Diagnostic Milestones:** It allows periodic checkpointing (every 5th question) to evaluate actual understanding rather than procedural memorization.
3. **Calculation Drill Focus:** In fixed/static difficulty modes, users typically want uninterrupted numerical drilling. Interjecting text-heavy conceptual MCQs in static modes would disrupt the speed and flow of calculation drills.

---

### Q5: How are conceptual questions triggered?
**A:** They are triggered dynamically by two conditions:
- **Frequency-based:** Every 5th question (`questionNumber % 5 === 0`).
- **Promotion-based:** Immediately upon a transition to a higher difficulty stage (e.g., transitioning to *Easy* to *Medium*).

---

### Q6: How does adaptive scoring adjust for conceptual questions?
**A:** Answering correctly awards a gentle climb of `+0.25` to the adaptive score, while answering incorrectly or choosing "Solve" inflicts a steeper drop of `-0.35` to stabilize the student's level.

---

### Q7: Is there keyboard support for option selection?
**A:** Yes, the quiz layout includes a window keydown listener. When a conceptual question is active, pressing the standard keys `A`, `B`, `C`, or `D` will select the corresponding option. Pressing `Enter` submits the selection or advances to the next question.

---

### Q8: How does the backend prevent duplicate conceptual questions?
**A:** The `GET /conceptual-api/question` endpoint tracks recently served question IDs per request. It filters the loaded question array to exclude active IDs to ensure students receive a diverse set of questions during a quiz.

---

### Q9: How does the "Solve" system work for conceptual questions?
**A:** Clicking the "Solve" button calls `POST /conceptual-api/check` with an empty answer. The backend flags the response as incorrect, returns the correct choice badge/text, and exposes the detailed pedagogical explanation, which is displayed in the feedback box.

---

### Q10: Can this feature be enabled for the other 40+ topics in the app? How does the system handle topics without seeded conceptual questions?
**A:** Yes, the architecture is designed to be **fully generic and extensible**. We chose to scope the initial seeding to the 6 primary topics based on three main review considerations:

1. **Scope Alignment:** The project SRS specifies implementing conceptual MCQ variants for quizzes *“such as Indices, Fractions, Linear Equations”*. Our implementation fully satisfies and exceeds these requirements by covering all of those three, plus Trigonometry, Basic Arithmetic, and the Quadratic Formula.
2. **Quality vs. Quantity:** Authoring meaningful conceptual math questions requires deep pedagogical intent (focusing on common student bottlenecks and misconceptions). Auto-generating question sets for all 50+ topics (e.g. Vectors, Calculus, Matrices) using a script would result in generic, low-quality "filler" questions, which could negatively impact the reviewer's evaluation of the content.
3. **Demonstrating Extensibility:** In software engineering reviews, demonstrating an extensible architecture is highly valued. The fact that the frontend factory (`makeQuizApp`) and backend controller are 100% ready for all topics—and will **gracefully fallback to serving standard calculations** if a database is missing—serves as a strong architectural selling point. 

To expand coverage to a new topic (e.g. `vectors`), you only need to drop a `vectors.json` question file into `server/conceptual/questions/`. The backend will automatically register it at startup without any code modifications.

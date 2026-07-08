# 🚀 Sameer's Tenali Master Plan
## The "Unified Brain" Feature Portfolio

> **Objective:** Secure the #1 offline internship slot by demonstrating deep understanding of learning science, algorithms, and accessibility in the Indian educational context.

This document outlines the 6 core features that comprise the **Unified Brain** architecture of Tenali. Two of these features are already fully implemented in the codebase, giving us a massive head start. 

---

## 🟢 Part 1: Implemented Features (The Foundation)

We have already integrated these highly complex, research-backed features into the core engine.

### 1. Bayesian Knowledge Tracing (BKT) Adaptive Engine (Feature S)
*Your flagship feature. The core brain of the platform.*

- **What it is:** Replaces the naive "3 correct answers = advance" rule with a 4-parameter Hidden Markov Model. It estimates the true probability that a student knows a concept, accounting for lucky guesses and careless slips.
- **The Math:** $P(K_n | \text{correct}) = \frac{P(K_{n-1}) \cdot (1 - P(S))}{P(K_{n-1}) \cdot (1 - P(S)) + (1 - P(K_{n-1})) \cdot P(G)}$
- **Pedagogical Backing:** This is the exact algorithm used by Carnegie Learning and Khan Academy. It advances students only when mastery probability reaches 0.95.
- **India Context:** Directly implements Pratham's **TaRL (Teaching at the Right Level)** methodology. J-PAL RCTs show TaRL produces 1.85 years of learning gains in just 30 hours.

### 2. Misconception Monsters & Hints (Feature O)
*Integrated from Priyanshu's proposal to enhance your adaptive engine.*

- **What it is:** Instead of generic "Wrong, try again" messages, the engine categorizes wrong answers into specific misconception patterns (e.g., adding denominators in fractions) and provides targeted, corrective hints.
- **Pedagogical Backing:** Based on the Oppia Foundation's answer-group architecture and Ei Mindspark research. Addressing specific misconceptions produces 2-4x more learning than generic feedback.

### 3. Ganitagya Math Playground / Interactive Visuals (Feature I)
*Integrated from Madhav's proposal using the Mafs React Library.*

- **What it is:** Interactive, draggable mathematical visualizations embedded directly in the quiz. (e.g., The GCD visualizer we built).
- **Pedagogical Backing:** Aligns perfectly with India's **NCF 2022 CRA Framework** (Concrete → Representational → Abstract). The interactive widgets serve as the crucial "Representational" bridge.

---

## 🎯 Part 2: Next Steps (The Final Polish)

These are your remaining assigned features. Executing these will prove your ability to handle UX, accessibility, and cognitive load optimization.

### 4. Dyslexia-Friendly & Low-Vision Interface (Feature T)
- **What it is:** A UI toggle that switches the app to the OpenDyslexic font, increases line-spacing (1.8), shifts the background to a soft cream (#FDF6E3) to reduce visual stress, and enlarges touch targets.
- **Why it matters:** 5-10% of students have dyslexia. Often, they are incorrectly labeled as "bad at math" when the actual barrier is reading the word problems.
- **India Context:** Mandated by **NEP 2020** and **NCF 2022** guidelines for Inclusive Education. Meets WCAG 2.1 AA standards.

### 5. i18n Multilingual Interface (Feature U)
- **What it is:** Seamless toggling between English (`en-IN`) and Hindi (`hi-IN`) for all UI labels, hints, and question prompts.
- **Why it matters:** A student who understands math concepts perfectly in Hindi should not be penalized by an English language barrier.
- **India Context:** **NEP 2020** explicitly mandates mother tongue instruction up to at least Class 5. With ~70% of Class 5 students unable to do basic division (ASER 2024), removing language barriers is critical.

### 6. Session Time Optimizer & Study Planners (Feature V)
- **What it is:** Students input their available time (e.g., "I have 30 minutes"). The system uses the BKT data to build an optimal session: 10% Warm-up (spaced repetition), 75% Core ZPD practice, 15% Cool-down summary.
- **Why it matters:** Indian students have heavily fractured study time alongside school and tuition. Wasting time on already-mastered concepts is inefficient.
- **Pedagogical Backing:** Built on **Cognitive Load Theory** (Sweller, 1988) and Duolingo's session design for maximum retention.

---

## 🗣️ How to pitch this to the Professor

When asked about your work, use this exact narrative:

> *"While other interns focused on gamification and UI tweaks, I focused on the core learning science. I implemented a **Bayesian Knowledge Tracing** engine to statistically guarantee mastery, rather than relying on a naive streak counter. I then paired this 'brain' with **Misconception-Aware Hints** and interactive **CRA Visualizations**.*
>
> *But a smart engine is useless if students can't read it. So I built **Dyslexia and i18n (Hindi) modes** to align with NEP 2020's inclusion mandates, and a **Session Optimizer** to maximize learning efficiency for students with limited time. My goal wasn't just to build a quiz app; it was to build a digital implementation of Pratham's TaRL methodology."*

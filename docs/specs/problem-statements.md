# Tenali Core Problem Statements

> This document defines the pedagogical problem statements and research foundations guiding Tenali's development. Every educational feature or module must map directly to one or more of these problem statements.

---

## Problem Statement A: Learner Motivation & Retention (Engagement)

**Priority Rationale:** We observed students trying Tenali, enjoying it, but not returning. Solving engagement is the top priority because other features won't matter if learners don't come back.

**The Problem:** Learners drop off due to a lack of visible progress tracking, mismatched motivation/reward systems for different age groups, rigid habit structures, and shallow gamification that creates short spikes of activity instead of long-term use.

Every improvement on Tenali depends on learners coming back consistently. This problem statement is directly grounded in real observation rather than assumed gaps.

**Research References:**
- **Self-Determination Theory (Deci & Ryan, 2000):** Motivation and sustained engagement depend on satisfying three basic psychological needs: autonomy, competence, and relatedness. Extrinsic rewards like badges or points create short-term activity, but long-term retention requires visible progress and felt competence.
- **Habit Formation & Flexible Goals (Clear, 2018; Eyal, 2014):** Digital learning habits rely on predictable triggers, immediate feedback, and flexible goal structures. Rigid daily streaks punish minor lapses and accelerate churn, whereas flexible weekly targets support long-term retention.

---

## Problem Statement B: Adaptive Progression & Level Continuity

**Priority Rationale:** This forms the structural backbone for engagement. If a learner hits a sudden difficulty spike, confusing transitions, or gets stuck, they will disengage regardless of rewards.

**Vision:** Every learner moves through Tenali on a staircase tailored to them: steps small enough to feel reachable, clear transitions between levels, and built-in recovery options when someone struggles.

### Facet 1: Granular Level Design
**The Problem:** Concepts are often packed into too few, uneven levels. Some are broken down carefully while others are compressed, creating steep jumps and unexpected difficulty spikes.
**Goal:** Break each concept into a clear chain of prerequisite sub-skills, applied consistently from basic to advanced content.

### Facet 2: Consistent Progression (Continuity Between Levels)
**The Problem:** Even when individual levels are designed well, the connection between them can feel missing. Learners finishing one level may not see how it connects to the next, making levels feel like isolated checkpoints.
**Goal:** Maintain clear continuity where each level previews what comes next and builds logically on what came before.

### Facet 3: Performance-Based Regression
**The Problem:** When a learner struggles repeatedly on a level, there is no automatic system to step them back to a foundational skill, forcing them to either keep failing or restart manually.
**Goal:** Build a performance-aware system that detects struggle and offers a graceful step back to a prerequisite skill to rebuild understanding and confidence.

**Why This Matters:** Progression makes hard concepts manageable. Small steps keep the path coherent, and built-in recovery prevents learners from giving up when stuck.

**Key Design Principles:**
- Keep level structures and regression logic consistent across modules using shared mastery data.
- Frame step-backs constructively in the UI (e.g., "Let's review this concept") rather than as a penalty.
- Keep continuity cues lightweight so they don't clutter the interface.

**Research References:**
- **Zone of Proximal Development & Scaffolding (Vygotsky, 1978; Wood et al., 1976):** Optimal learning happens when tasks sit just beyond independent mastery but remain reachable with structured scaffolding. Oversized difficulty jumps push learners past their ZPD, causing frustration and disengagement.
- **Knowledge Tracing & Remediation (Corbett & Anderson, 1994; Doignon & Falmagne, 1999):** Effective educational systems rely on fine-grained skill dependencies. When a student struggles, stepping back to diagnose and reinforce the underlying prerequisite is significantly more effective than repeating a failed exercise.

---

## Problem Statement C: Minimalistic, Cognitive-Load-Aware UI Design

**Priority Rationale:** Interface clarity affects every feature. Engagement tools, progression steps, and exercises will fail if the screen is cluttered or text-heavy.

**The Problem:** Many educational apps overwhelm learners with dense instructions, competing buttons, visual noise, and unnecessary clicks before the student even begins solving a problem.

**Goal:** Present one primary interactive focus per screen, minimize decorative cognitive load, adhere to the design system tokens ([`docs/design/ui-guidelines.md`](../design/ui-guidelines.md)), and make math manipulation intuitive and immediate.

**Research References:**
- **Cognitive Load Theory (Sweller, 1988; Mayer, 2002):** Working memory is strictly limited. Extraneous cognitive load caused by confusing UI, redundant text, or disorganized visual cues directly impairs learning schema acquisition.

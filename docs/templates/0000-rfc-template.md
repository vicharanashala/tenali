# RFC [0000]: [Feature Title]

- **Author(s):** [Contributor Name] (@github-username)
- **Status:** Draft | Under Review | Approved | Implemented
- **Created Date:** YYYY-MM-DD
- **Target Module/Vertical:** [Vachana | What-If | Engagement | Language | Inclusivity | Core]
- **Related Issue / Problem Statement:** [Link to PS document, e.g., `PS/vachana-problem-statement.md`]

---

## 1. Executive Summary

Provide a 2-3 sentence high-level summary of the proposed feature, the problem it solves, and the intended user experience.

---

## 2. Problem Statement & Pedagogical Motivation

- **What problem does this solve?** Explain the learner bottleneck or technical gap.
- **Pedagogical / Learning Objective:** What will the student understand or master after interacting with this feature?
- **Research / Theoretical Basis (if applicable):** Cite relevant learning frameworks (e.g., Mayer's Cognitive Model, Frayer Model, Sweller's Cognitive Load Theory).

---

## 3. User Experience & Interactive Mechanics

Detailed walk-through of how a student or teacher interacts with the feature.

### 3.1 User Flow & Screenshots / Wireframes
1. **Entry Point:** Where does the user navigate from? (e.g., `/vachana`, `/what-if/quadratic`)
2. **Interactive Steps:** Step-by-step breakdown of user interactions (drag-and-drop, sliders, text input, multiple choice).
3. **Feedback Mechanics:** What happens on correct/incorrect attempts? (e.g., celebratory micro-animations, instant diagnostic hint, error correction modal).

### 3.2 Visual & Design System Compliance
- **Color Palette & Theme:** Adheres to Tenali design system tokens (`var(--clr-text)`, `var(--clr-accent)`, etc.).
- **Typography & Icons:** Uses standard Google Fonts and Lucide icons.
- **Responsive Layout:** Works seamlessly across mobile (`320px+`) and desktop viewports.

---

## 4. Proposed Architecture & Technical Design

### 4.1 Component Tree & File Structure
List new or modified files:
```text
client/src/
  ├── [module]/
  │   ├── [FeatureComponent].jsx   # Main React view
  │   ├── [FeatureComponent].css   # Theme-compliant styles
  │   └── [featureData].json       # Static dataset / config
```

### 4.2 State Management & Props
Outline the React state requirements:
```javascript
// Key local state fields
const [step, setStep] = useState(0);
const [userAnswers, setUserAnswers] = useState({});
const [feedback, setFeedback] = useState(null);
```

### 4.3 Data Schema (JSON / Props)
Provide the exact JSON schema for problem datasets or configuration files:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "id": "feature-id-001",
  "title": "Example Challenge",
  "data": []
}
```

---

## 5. Zero-Cost Scaling & Performance Constraints

Tenali is built for zero-cost, high-scale execution for millions of concurrent users.

- [ ] **Client-Side Deterministic Logic:** Does this feature execute 100% on the client browser without external LLM/API billing?
- [ ] **Asset Footprint:** Are SVG graphics, sounds, and datasets optimized (< 100KB gzip)?
- [ ] **No High-Frequency Server State:** Is progress persisted efficiently to `localStorage` / IndexedDB?

---

## 6. Verification & Testing Strategy

### 6.1 Automated Tests (Vitest)
- [ ] Unit tests for core calculation / logic functions added in `client/src/[feature].test.jsx`.
- [ ] Schema validation tests for static JSON datasets.

### 6.2 Quality Gates Compliance
- [ ] `npm run format:check` passes (Prettier).
- [ ] `npm run lint` passes with 0 errors (ESLint).
- [ ] `npm run build` compiles without bundle warnings.

---

## 7. Migration & Compatibility Check

- [ ] **Backward Compatibility:** Does this PR modify existing routes, state keys, or shared components?
- [ ] **Clean Git Footprint:** No temporary debug scripts, unformatted files, or orphaned components included.

---

## 8. Unresolved Questions & Discussion Points

- [ ] Open question 1 for maintainers/reviewers.
- [ ] Open question 2 regarding edge cases or design preferences.

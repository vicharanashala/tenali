# Changelog — Feature P: Prerequisite Auto-Routing & Warmups

All notable changes to this feature are documented here.
Versioning follows `v<major>.<minor>` where each minor release is a
self-contained, testable increment of the feature.

---

## [v0.1] — 2026-07-06

**Branch:** `feature/prereq-auto-routing`
**Scope:** Client-side only. No backend changes. No new API endpoints.

### What v0.1 Does

Introduces the sliding-window struggle detector and a static warmup
overlay inside `makeQuizApp`. When a student gets 3 or more wrong
answers out of their last 4 submissions (including skips and solves),
the quiz pauses and a warmup card slides in with 3 hardcoded Basic
Arithmetic questions. After completing those 3 questions, the original
quiz resumes exactly where it left off.

### Algorithm Implemented

- **Trigger:** Sliding window of last 4 results. Fire if `wrongCount >= 3`.
- **Cooldown:** After warmup completes, suppress re-trigger for next
  4 questions, giving the student's window time to fully rotate.
- **No nesting:** Warmup questions never run the struggle check.
- **State preservation:** `questionNumber`, `score`, and `results` are
  frozen before warmup and restored on resume.

### Added State (inside `makeQuizApp`)

| State variable        | Type          | Purpose                                              |
|-----------------------|---------------|------------------------------------------------------|
| `historyWindow`       | `boolean[]`   | Last 4 answer results (`true` = correct)             |
| `cooldownCounter`     | `number`      | Questions left before trigger re-enables (starts 0)  |
| `frozenQuizState`     | `object\|null` | Snapshot of quiz at moment warmup fires              |
| `warmupActive`        | `boolean`     | Whether warmup overlay is currently showing          |
| `warmupStep`          | `number`      | Current warmup question index (0–2)                  |
| `warmupAnswer`        | `string`      | Student's typed answer in the warmup input           |
| `warmupFeedback`      | `string`      | Feedback shown after each warmup answer submission   |
| `warmupRevealed`      | `boolean`     | Whether current warmup answer has been checked       |

### Hardcoded Warmup Questions (v0.1 only)

v0.1 uses 3 static single-digit addition questions to validate the
overlay and state-restore mechanism without requiring new API calls.
These will be replaced by live API calls in v0.2.

```
Q1: 6 + 7 = ?   (answer: 13)
Q2: 9 + 5 = ?   (answer: 14)
Q3: 8 + 4 = ?   (answer: 12)
```

### Files Changed

| File                      | Change        | Description                                |
|---------------------------|---------------|--------------------------------------------|
| `client/src/App.jsx`      | Modified      | Struggle logic + warmup overlay in `makeQuizApp` |
| `CHANGELOG.md`            | New           | This file                                  |

### Not Included in v0.1

- Dynamic prerequisite API lookup (→ v0.2)
- N-prerequisite selection logic (→ v0.2)
- Session history tracking across multiple warmups (→ v0.2)
- Soft intervention / hesitation popup (→ v0.3)
- Analytics logging (→ v0.3)

---

## [v0.2] — Planned

- `GET /api/prerequisites/:topic` endpoint
- `server/prerequisites.json` adjacency map for all 69 topics
- Dynamic question fetching from prerequisite topic API
- N-prerequisite selection with mastery + session-history filtering

## [v0.3] — Planned

- Soft intervention: 60-second hesitation popup
- `POST /api/logs/intervention` endpoint
- Teacher/parent dashboard analytics

---

*Author: Priyanshu | Feature Owner: Priyanshu | Reviewed by: —*

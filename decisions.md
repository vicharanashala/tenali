# Decisions — Tenali FLN Learning Platform

> **Version:** 1.0  
> **Date:** May 2026  
> **Status:** Final — all decisions locked

All decisions below were confirmed before roadmap finalisation. They are locked and should not be reopened without explicit approval from the project lead.

---

## Decision Registry

### D1 — CRT Slot Numbering
**Decision:** CRT slot numbering stays at slot 3.

**Rationale:** Slot 3 is the established convention in the existing codebase. Changing to 0-based indexing would require migration of all existing progress records and content references. The marginal clarity improvement does not justify the migration risk.

---

### D2 — Launch Content Threshold
**Decision:** Minimum 5 case studies per algorithm are live at launch.

**Rationale:** v0.19 delivers 5 case studies minimum per algorithm (Case Study 1 across all 7 algorithms, minimum 5 live). This provides enough variety for a meaningful first experience while keeping content creation on a manageable schedule. The remaining 15 per algorithm are shown as "Coming Soon."

---

### D3 — Content Creation Priority
**Decision:** Case Study 1 across all 7 algorithms is built first, then Case Study 2, and so on.

**Rationale:** Building Case Study 1 for all 7 algorithms simultaneously (rather than all 20 case studies for one algorithm) ensures balanced coverage and allows the learning engine to be tested across all 7 algorithms before content is complete for any single one. This is more aligned with an agile delivery approach.

---

### D4 — Sub-Agent Access
**Decision:** AI sub-agents write to draft tables only. All content requires teacher review and explicit approval before going live.

**Rationale:** Sub-agents have no direct write access to the live `question_pool` or `case_studies` tables. Content flows: AI draft → `case_study_drafts` staging table → teacher review queue → teacher approves/edits/rejects → approved content moves to live tables. This human-in-the-loop gate prevents hallucinated or inappropriate content from reaching students.

---

### D5 — Beta Cohort Source
**Decision:** Recruit 5–10 individual beta users; no pre-identified cohort group.

**Rationale:** The beta cohort should be real target users (students aged ~10–16 or their guardians) recruited organically. Using a pre-organized school cohort introduces coordination risk and may not represent the actual target user base. Individual recruitment allows for cleaner feedback collection.

---

### D6 — Teacher Email Alerts
**Decision:** Email alerts to teachers are opt-out by default. Teachers can disable email alerts in their settings.

**Rationale:** Teachers are busy professionals. Defaulting to opt-in means teachers must consciously enable alerts, which could result in missed important signals. Defaulting to opt-out with a simple settings toggle ensures critical alerts reach teachers while giving those who don't want email打扰 the ability to disable it.

---

### D7 — Deployment Order
**Decision:** The Foundation package (v0.1–v0.5) must be complete before any content generation begins.

**Rationale:** Content generation (v0.18 onwards) depends on a stable schema (v0.5) and a working learning engine (v0.13–v0.16). Running content generation against a moving target would create alignment problems between content and code. Foundation must be fully complete before Phase 5 begins.

---

### D8 — Wrong-Answer Regression Depth
**Decision:** A wrong answer on the retry attempt causes regression to the previous stage (back 1 stage).

**Rationale:** The adaptive logic is:
- Wrong answer → hint revealed inline, retry same question
- Wrong on retry → new question variant from the same stage
- Wrong on third attempt → regress to previous stage (different variant)

For Stage 1, regression stays within Stage 1 (new variant). For Stage N (N > 1), regression moves to Stage N−1. This is shallow enough to avoid discouragement while deep enough to signal a genuine struggle.

---

### D9 — Retry/Cooldown Policy
**Decision:** Unlimited retries, no cooldown.

**Rationale:** The target audience (FLN students aged ~10–16) benefits from a low-pressure, exploratory learning environment. Introducing cooldown timers or attempt limits adds frustration without educational benefit — the adaptive logic (hints → variant change → regression) already handles the difficulty curve. Students should feel safe to try.

---

### D10 — Alert Thresholds
**Decision:** A teacher alert is triggered when either:
- A student has 5+ regressions in a single session, OR
- A student is stalled at the same stage for 3+ consecutive sessions without completing it

**Rationale:** These thresholds are calibrated to catch genuine struggle without false positives:
- 5 regressions/session catches acute confusion (e.g., student completely misunderstanding a concept)
- 3 sessions stalled catches sustained difficulty (e.g., student keeps returning but not progressing)
- Both are easy to explain to teachers and measurable from the `user_attempts` table.

---

### D11 — Story Authoring
**Decision:** Content is authored via an AI-assisted drafting pipeline with teacher review as the quality gate.

**Rationale:** Writing 140 case studies (20 per algorithm × 7 algorithms) by hand is not scalable. The pipeline is:
1. AI sub-agent generates a draft from a structured prompt (algorithm + stage + case study number)
2. Draft is saved to a staging table (`case_study_drafts`)
3. Teacher reviews in a dedicated review queue within the teacher dashboard
4. Teacher approves, edits, or rejects
5. Approved drafts populate the live tables

This balances content volume with quality control. Teachers act as editors, not authors — a role that is faster and more scalable than manual content creation.

---

## Decision Change Log

| Date | Decision | Change |
|------|----------|--------|
| May 2026 | All D1–D11 | Initial lock |
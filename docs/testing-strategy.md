# Testing Strategy — Tenali FLN Learning Platform

**Version:** v0.1
**Status:** Designed
**For:** v0.53–v0.57, v0.62 development

---

## Overview

The testing strategy covers 5 layers:
1. Unit tests (Vitest)
2. Integration tests (Playwright)
3. Stress tests (k6)
4. Content validation pipeline
5. Manual QA protocol

---

## 1. Unit Test Suite (v0.53)

**Runner:** Vitest (already in `devDependencies`)
**Location:** `src/__tests__/`

### What to Test

**Auth Logic (`src/lib/auth.js` and session helpers):**
- Session creation: creates session with correct shape
- Session retrieval: returns null when no session
- Session expiry: returns null for sessions >7 days old
- Session cleanup: `clearSession()` removes from localStorage

**Learning Engine (`src/pages/dashboard/LearningLoop.jsx`):**
- 3 correct answers → advance to next stage
- 1 wrong → hint shown, retry same question
- Wrong on retry → retry same question
- Third wrong → regress to previous stage (Stage 1 → stays at Stage 1)
- Stage 1 regression → stays at Stage 1 with new question variant
- 3 correct → advance to next stage
- XP awards: +10 correct first attempt, +5 correct after hint, +20 stage completion

**XP Scoring:**
- +10 XP on correct first attempt
- +5 XP on correct after hint shown
- +20 XP on stage completion
- +100 XP on case study mastery

**Question Pool Rotation:**
- Variant not repeated in same session
- Fair rotation across variants
- Falls back to first variant if all exhausted

### File Structure

```
src/__tests__/
  auth.test.js              ← session management
  learningEngine.test.js    ← adaptive engine logic
  xp.test.js                ← XP scoring
  questionPool.test.js      ← variant rotation
```

### Running

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

---

## 2. Integration Test Suite (v0.54)

**Tool:** Playwright
**Location:** `e2e/`

### End-to-End Flows to Test

**Student Flow:**
1. Register (name + email → OTP → password → dashboard)
2. Login (email → OTP → dashboard)
3. Start case study → complete stage 1 → exit
4. Logout → log back in → resume from saved stage
5. Replay case study → XP awarded again

**Teacher Flow:**
1. Register as teacher → create cohort
2. View empty cohort (no students yet)
3. Login → dashboard → see cohorts
4. Create second cohort
5. Logout → log back in → cohorts persist

**Adaptive Regression Flow:**
1. Student answers 3 questions wrong in a row → hint appears
2. Answers wrong again → hint again
3. Answers wrong third time → regresses to previous stage
4. At previous stage, gets first question correct → advances

**Teacher Alert Flow:**
1. Student gets 5+ regressions in a session
2. Teacher logs in → sees alert banner
3. Clicks alert → sees student's struggle stage

**Content Editing Flow:**
1. Teacher edits a question in Case Study 1
2. Student answers that question next day
3. Student sees the updated question

### Cross-Browser Matrix

| Browser | OS | Viewport |
|---------|----|----------|
| Chrome  | Windows 11 | 1920×1080 |
| Firefox | Windows 11 | 1920×1080 |
| Safari  | macOS | 1440×900 |
| Safari iOS | iPhone 14 | 390×844 |
| Chrome Android | Android 13 | 412×915 |
| Chrome | macOS | 360×800 (small) |

### Running

```bash
npx playwright test              # Run all E2E tests
npx playwright test --project=chromium  # Specific browser
npx playwright test --debug     # Open browser inspector
```

### CI Integration (GitHub Actions)

```yaml
- name: Run Playwright
  run: npx playwright test --reporter=github
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## 3. Stress Test Suite (v0.55)

**Tool:** k6
**Location:** `stress-tests/`

### Load Scenarios

**Scenario 1 — OTP Burst (100 students):**
- 100 students sending OTP request simultaneously
- Metric: response time <2s, error rate <5%

**Scenario 2 — 50 Students Same Case Study:**
- 50 students starting Case Study 1 of Fermat's Little Theorem
- Metric: question fetch <1s, answer submission <500ms

**Scenario 3 — 20 Teachers Logging In:**
- 20 teachers logging in at 8:00 AM
- Metric: response time <2s

**Scenario 4 — Sustained DB Writes (200/min for 10 min):**
- 200 writes/min to user_progress and user_attempts tables
- Metric: p95 latency <300ms, no connection pool exhaustion

### Metrics to Measure

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| HTTP request duration (p95) | <500ms | >1000ms |
| Error rate | <1% | >5% |
| DB write latency (p95) | <300ms | >600ms |
| CDN edge latency | <50ms | >200ms |

### Running

```bash
# Install k6 first: https://k6.io/docs/getting-started/installation/
k6 run stress-tests/k6-script.js

# Against staging:
k6 run -e APP_URL=https://staging.tenali.app stress-tests/k6-script.js
```

### CI Gate

Run nightly. If degradation >20% from baseline, trigger alert:

```yaml
- name: Stress Test
  run: k6 run stress-tests/k6-script.js
  env:
    K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
```

---

## 4. Content Validation Pipeline (v0.56)

**Tool:** Node.js script
**Location:** `scripts/validateContent.js`
**Schedule:** Nightly at 02:00 UTC + pre-publish gate

### Validation Rules

| Rule | Description | Blocking? |
|------|-------------|-----------|
| Algorithm coverage | All 7 algorithms have ≥1 case study | Yes |
| Stage count | Every case study has ≥3 stages | Yes |
| Question count | Every stage has ≥3 questions | Yes |
| Answer presence | Every question has a non-empty answer | Yes |
| Hint presence | Every question has a hint | Yes |
| Empty text | No question text is empty string | Yes |
| Story intro | Every case study has a story_intro | Yes |
| Real-world apps | Every case study has real_world_applications | Yes |
| Duplicate questions | No exact duplicate question texts within same stage | No |
| Launch threshold | All 7 algorithms have ≥5 case studies | Yes |

### Running

```bash
node scripts/validateContent.js
# Exit code 0 = passed, Exit code 1 = failed
```

### Pre-publish Gate

The `is_active` flag on a case study cannot be set to `true` until `validateContent.js` passes.
This is enforced via a Supabase database function:

```sql
CREATE OR REPLACE FUNCTION set_case_study_active(id uuid, active boolean)
RETURNS void AS $$
DECLARE
  validation_passed boolean;
BEGIN
  -- Run validation (simplified check)
  -- If any stage in this case study has < 3 questions, reject
  IF active = true AND EXISTS (
    SELECT 1 FROM stages s
    LEFT JOIN question_pool q ON q.stage_id = s.id
    WHERE s.case_study_id = id
    GROUP BY s.id
    HAVING COUNT(q.id) < 3
  ) THEN
    RAISE EXCEPTION 'Case study has stages with fewer than 3 questions';
  END IF;

  UPDATE case_studies SET is_active = active WHERE id = id;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. QA Protocol (v0.57)

**Frequency:** Before every minor/major release

### Pre-Release Checklist

- [ ] Smoke test: core student flow (register → complete stage 1 → logout)
- [ ] Smoke test: core teacher flow (register → create cohort → view dashboard)
- [ ] Full regression: all 7 case studies playable from start to payoff
- [ ] Accessibility audit: keyboard-only navigation
- [ ] Accessibility audit: VoiceOver (macOS) / NVDA (Windows)
- [ ] Visual regression: screenshots compared against baseline
- [ ] Mobile: test on real iPhone (Safari) and Android (Chrome)
- [ ] Dark mode: verify all pages in dark mode
- [ ] 360px viewport: no layout breaks on small screens

### Bug Bash

At least 3 testers (can include team members) run through the full flow.
All critical and high bugs must be resolved before release.
Medium bugs tracked in GitHub Issues with milestone.

### Bug Labels

```
critical — data loss, auth bypass, security issue
high      — broken flow, regression not working, XP wrong
medium    — visual glitch, wrong copy, non-blocking
low       — cosmetic, nice-to-have
```

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] All form inputs have associated labels
- [ ] All buttons have accessible names
- [ ] Focus order is logical (Tab key)
- [ ] Focus is visible on all interactive elements
- [ ] Color contrast ≥4.5:1 for normal text (WCAG AA)
- [ ] Color contrast ≥3:1 for large text (WCAG AA)
- [ ] No information conveyed by color alone
- [ ] Skip navigation link is first focusable element
- [ ] Error messages announced by screen reader (aria-live)
- [ ] Modals trap focus correctly

---

## Cross-Browser Testing Matrix

| Browser | Version | OS | Viewport | Test Owner |
|---------|---------|----|----------|-----------|
| Chrome | Latest | Windows 11 | 1920×1080 | CI |
| Firefox | Latest | Windows 11 | 1920×1080 | CI |
| Safari | Latest | macOS | 1440×900 | Manual |
| Safari iOS | Latest | iPhone 14 | 390×844 | Manual |
| Chrome Android | Latest | Android 13 | 412×915 | Manual |

---

*Document status: Draft — expand with specific test cases in v0.53 implementation*
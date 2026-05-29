# Database Schema — Tenali FLN Learning Platform

> **Version:** 1.0  
> **Date:** May 2026  
> **Database:** Supabase (PostgreSQL)  
> **Status:** Final

---

## Entity-Relationship Overview

```
users (auth extension)
  │
  ├── cohorts ──────────────→ users (teacher_id FK)
  │
  ├── algorithms
  │     └── case_studies ──→ algorithms (algorithm_id FK)
  │           └── stages ──→ case_studies (case_study_id FK)
  │                 └── stage_questions ──→ stages (stage_id FK)
  │
  ├── user_progress ───────→ users (user_id FK), case_studies (case_study_id FK)
  │      │
  │      └── user_attempts ─→ users (user_id FK), stages (stage_id FK), question_pool (question_id FK)
  │
  ├── teacher_alerts ───────→ users (teacher_id FK, student_id FK), case_studies (case_study_id FK)
  │
  ├── student_topic_mastery → users (user_id FK), algorithms (algorithm_id FK)
  │
  └── cohort_analytics ────→ cohorts (cohort_id FK), algorithms (algorithm_id FK)
```

---

## Table Definitions

### 1. `users`

Extends Supabase `auth.users`. Stores application-level user data with role-based access.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'teacher')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_xp      INTEGER NOT NULL DEFAULT 0,
  institution   TEXT,
  cohort_id     UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  CONSTRAINT users_email_unique UNIQUE (email)
);
```

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
CREATE INDEX idx_users_cohort ON users(cohort_id);
```

**RLS Policies:**
```sql
-- Students: can read/update their own record only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_read_own" ON users
  FOR SELECT USING (auth.uid() = id AND role = 'student');

CREATE POLICY "students_update_own" ON users
  FOR UPDATE USING (auth.uid() = id AND role = 'student');

-- Teachers: can read all students in their cohorts
CREATE POLICY "teachers_read_students" ON users
  FOR SELECT USING (
    role = 'student'
    AND cohort_id IN (
      SELECT id FROM cohorts WHERE teacher_id = auth.uid()
    )
  );

-- Teachers: can update their own record
CREATE POLICY "teachers_update_own" ON users
  FOR UPDATE USING (auth.uid() = id AND role = 'teacher');
```

---

### 2. `cohorts`

Groups of students managed by a single teacher.

```sql
CREATE TABLE cohorts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_cohorts_teacher ON cohorts(teacher_id);
```

**RLS Policies:**
```sql
-- Teachers: full access to their own cohorts
CREATE POLICY "teachers_manage_cohorts" ON cohorts
  FOR ALL USING (teacher_id = auth.uid());

-- Students: read-only access to their own cohort
CREATE POLICY "students_read_cohort" ON cohorts
  FOR SELECT USING (id IN (SELECT cohort_id FROM users WHERE id = auth.uid()));
```

---

### 3. `algorithms`

Master list of the 7 FLN algorithms (theorem groups).

```sql
CREATE TABLE algorithms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  description   TEXT,
  icon_svg      TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0
);
```

**Indexes:**
```sql
CREATE INDEX idx_algorithms_order ON algorithms(order_index);
```

**RLS:** Public read for all authenticated users. Writes admin-only (no RLS for INSERT/UPDATE — managed via service role).

---

### 4. `case_studies`

Individual case studies within an algorithm. Each algorithm has up to 20 case studies.

```sql
CREATE TABLE case_studies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id        UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  story_intro         TEXT,
  real_world_applications TEXT,
  order_index         INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_case_studies_algorithm ON case_studies(algorithm_id);
CREATE INDEX idx_case_studies_active   ON case_studies(is_active) WHERE is_active = true;
```

**RLS:** Public read for all authenticated users. Writes admin-only.

---

### 5. `stages`

Stages within a case study. Each case study has 6–7 stages.

```sql
CREATE TABLE stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id   UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  stage_number    INTEGER NOT NULL,
  concept_label   TEXT,
  stage_description TEXT,
  xp_reward       INTEGER NOT NULL DEFAULT 20,
  is_locked       BOOLEAN NOT NULL DEFAULT false
);
```

**Indexes:**
```sql
CREATE INDEX idx_stages_case_study ON stages(case_study_id);
CREATE INDEX idx_stages_order      ON stages(case_study_id, stage_number);
```

---

### 6. `stage_questions`

Questions per stage with a single canonical variant (variant 1). Additional variants stored in `question_pool`.

```sql
CREATE TABLE stage_questions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id          UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  question_text     TEXT NOT NULL,
  hint_text         TEXT,
  answer_type       TEXT NOT NULL CHECK (answer_type IN ('word', 'integer', 'expression')),
  position          INTEGER NOT NULL DEFAULT 0,
  question_variant  INTEGER NOT NULL DEFAULT 1 CHECK (question_variant BETWEEN 1 AND 10),
  difficulty_weight INTEGER NOT NULL DEFAULT 1
);
```

**Indexes:**
```sql
CREATE INDEX idx_stage_questions_stage     ON stage_questions(stage_id);
CREATE INDEX idx_stage_questions_variant   ON stage_questions(stage_id, question_variant);
```

---

### 7. `question_pool`

Full question pool: 10 variants × multiple questions per stage.

```sql
CREATE TABLE question_pool (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id          UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  variant_number    INTEGER NOT NULL CHECK (variant_number BETWEEN 1 AND 10),
  question_text     TEXT NOT NULL,
  hint_text         TEXT,
  answer            TEXT NOT NULL,
  answer_type       TEXT NOT NULL CHECK (answer_type IN ('word', 'integer', 'expression')),
  position          INTEGER NOT NULL DEFAULT 0,
  difficulty_weight INTEGER NOT NULL DEFAULT 1,
  UNIQUE (stage_id, variant_number, position)
);
```

**Indexes:**
```sql
CREATE INDEX idx_question_pool_stage     ON question_pool(stage_id);
CREATE INDEX idx_question_pool_variant  ON question_pool(stage_id, variant_number);
```

---

### 8. `user_progress`

Tracks per-user, per-case-study progress.

```sql
CREATE TABLE user_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_study_id   UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  current_stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  xp_earned       INTEGER NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, case_study_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_progress_user       ON user_progress(user_id);
CREATE INDEX idx_user_progress_case      ON user_progress(case_study_id);
CREATE INDEX idx_user_progress_status    ON user_progress(user_id, status);
```

**RLS Policies:**
```sql
-- Students: read/update own progress only
CREATE POLICY "students_own_progress_read"  ON user_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "students_own_progress_write" ON user_progress FOR ALL USING (user_id = auth.uid());

-- Teachers: read progress of students in their cohorts
CREATE POLICY "teachers_read_student_progress" ON user_progress
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE cohort_id IN (
        SELECT id FROM cohorts WHERE teacher_id = auth.uid()
      )
    )
  );
```

---

### 9. `user_attempts`

Every individual question attempt logged for analytics and adaptive logic.

```sql
CREATE TABLE user_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_id            UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  question_id         UUID REFERENCES question_pool(id) ON DELETE SET NULL,
  answer_given        TEXT,
  is_correct          BOOLEAN NOT NULL DEFAULT false,
  attempt_number      INTEGER NOT NULL DEFAULT 1,
  regressed_to_stage  INTEGER,
  attempted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_seconds  INTEGER
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_attempts_user   ON user_attempts(user_id);
CREATE INDEX idx_user_attempts_stage ON user_attempts(stage_id);
CREATE INDEX idx_user_attempts_time  ON user_attempts(attempted_at);
```

**RLS Policies:**
```sql
-- Students: full access to own attempts
CREATE POLICY "students_own_attempts" ON user_attempts FOR ALL USING (user_id = auth.uid());

-- Teachers: read attempts of students in their cohorts
CREATE POLICY "teachers_read_attempts" ON user_attempts
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE cohort_id IN (
        SELECT id FROM cohorts WHERE teacher_id = auth.uid()
      )
    )
  );
```

---

### 10. `teacher_alerts`

Alerts triggered automatically when a student's learning behavior crosses a threshold.

```sql
CREATE TABLE teacher_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_study_id UUID REFERENCES case_studies(id) ON DELETE SET NULL,
  alert_type    TEXT NOT NULL CHECK (alert_type IN (
    'repeated_failure', 'regression_spike', 'stalled_progress'
  )),
  message       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_teacher_alerts_teacher  ON teacher_alerts(teacher_id);
CREATE INDEX idx_teacher_alerts_student  ON teacher_alerts(student_id);
CREATE INDEX idx_teacher_alerts_unread   ON teacher_alerts(teacher_id, is_read) WHERE is_read = false;
```

**RLS Policies:**
```sql
-- Teachers: full access to their own alerts
CREATE POLICY "teachers_manage_alerts" ON teacher_alerts FOR ALL USING (teacher_id = auth.uid());
```

---

### 11. `student_topic_mastery`

Aggregated per-user, per-algorithm mastery scores (refreshed via cron or trigger).

```sql
CREATE TABLE student_topic_mastery (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  algorithm_id          UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  mastery_score         INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  questions_attempted   INTEGER NOT NULL DEFAULT 0,
  correct_first_try_pct REAL NOT NULL DEFAULT 0,
  avg_time_per_question INTEGER,
  last_activity         TIMESTAMPTZ,
  UNIQUE (user_id, algorithm_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_topic_mastery_user      ON student_topic_mastery(user_id);
CREATE INDEX idx_topic_mastery_algorithm ON student_topic_mastery(algorithm_id);
```

**RLS Policies:**
```sql
-- Students: read own mastery
CREATE POLICY "students_read_mastery" ON student_topic_mastery FOR SELECT USING (user_id = auth.uid());

-- Teachers: read mastery of students in their cohorts
CREATE POLICY "teachers_read_cohort_mastery" ON student_topic_mastery
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE cohort_id IN (
        SELECT id FROM cohorts WHERE teacher_id = auth.uid()
      )
    )
  );
```

---

### 12. `cohort_analytics`

Aggregated per-cohort, per-algorithm analytics (refreshed via cron or trigger).

```sql
CREATE TABLE cohort_analytics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id        UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  algorithm_id     UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  avg_mastery_score REAL NOT NULL DEFAULT 0,
  students_count   INTEGER NOT NULL DEFAULT 0,
  active_students  INTEGER NOT NULL DEFAULT 0,
  completion_rate  REAL NOT NULL DEFAULT 0,
  UNIQUE (cohort_id, algorithm_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_cohort_analytics_cohort  ON cohort_analytics(cohort_id);
CREATE INDEX idx_cohort_analytics_alg     ON cohort_analytics(algorithm_id);
```

**RLS Policies:**
```sql
-- Teachers: read analytics for their own cohorts
CREATE POLICY "teachers_read_cohort_analytics" ON cohort_analytics
  FOR SELECT USING (
    cohort_id IN (SELECT id FROM cohorts WHERE teacher_id = auth.uid())
  );
```

---

## Summary of Relationships

| Parent Entity | Child Entity | Relationship |
|---|---|---|
| users | cohorts | teacher_id FK (one teacher → many cohorts) |
| users | user_progress | user_id FK (one student → many progress records) |
| users | user_attempts | user_id FK |
| users | student_topic_mastery | user_id FK |
| users | teacher_alerts | teacher_id FK, student_id FK |
| algorithms | case_studies | algorithm_id FK (one → many) |
| case_studies | stages | case_study_id FK (one → many) |
| stages | stage_questions | stage_id FK |
| stages | question_pool | stage_id FK |
| cohorts | cohort_analytics | cohort_id FK |
| cohorts | users | cohort_id FK (one cohort → many students) |

---

## Seed Data: Algorithms

The following 7 rows should be seeded into `algorithms` at setup:

```sql
INSERT INTO algorithms (id, name, display_name, description, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'fermat-little',  "Fermat's Little Theorem",  'a^(p-1) ≡ 1 (mod p) when p is prime — foundation of modern cryptography.', 1),
  ('22222222-2222-2222-2222-222222222222', 'handshake',     'The Handshake Lemma',        'n(n-1)/2 handshakes in a party of n guests each shaking once.', 2),
  ('33333333-3333-3333-3333-333333333333', 'chinese-remainder', 'Chinese Remainder Theorem', 'Compatible remainders pinpoint exactly one number modulo the product.', 3),
  ('44444444-4444-4444-4444-444444444444', 'coupon-collector','Coupon Collector Problem',  'On average, collecting n coupons requires n × H_n draws.', 4),
  ('55555555-5555-5555-5555-555555555555', 'euclidean-algorithm','The Euclidean Algorithm','Ancient GCD method by repeated remainders — backbone of modern crypto.', 5),
  ('66666666-6666-6666-6666-666666666666', 'modular-inverse', 'Modular Multiplicative Inverse','x satisfying a×x ≡ 1 (mod m) exists iff gcd(a,m)=1 — key to RSA.', 6),
  ('77777777-7777-7777-7777-777777777777', 'binary-exponentiation', 'Binary Exponentiation','Computing a^n in O(log n) — used in every secure HTTPS connection.', 7);
```

---

## Notes

- All `UUID PRIMARY KEY` columns use `gen_random_uuid()` as the default — Supabase handles this automatically.
- All `TIMESTAMPTZ` columns are stored in UTC.
- `updated_at` columns are **not auto-updated by a trigger** in this schema — application code must update them on write. A trigger can be added in a future migration if needed.
- `is_active` on `case_studies` acts as a soft publish flag — only active case studies are shown to students.
- `stage_questions` (variant 1 canonical) and `question_pool` (variants 1–10) are intentionally separate to allow per-variant storage with full answer data in the pool while keeping the canonical question in `stage_questions` for display.
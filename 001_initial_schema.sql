-- ============================================================
--  Tenali FLN Learning Platform — Initial Schema Migration
--  Migration: 001_initial_schema
--  Date: May 2026
--  Supabase (PostgreSQL)
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────
-- Extensions
-- ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. cohorts
-- ──────────────────────────────────────────────────────────────

CREATE TABLE cohorts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  teacher_id  UUID NOT NULL,  -- references auth.users(id) added after auth.users creation
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cohorts_teacher ON cohorts(teacher_id);

-- ──────────────────────────────────────────────────────────────
-- 2. users (extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────────

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
  cohort_id     UUID REFERENCES cohorts(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_cohort ON users(cohort_id);

-- Add teacher FK to cohorts now that users exists
ALTER TABLE cohorts
  ADD CONSTRAINT cohorts_teacher_fk
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────────
-- 3. algorithms
-- ──────────────────────────────────────────────────────────────

CREATE TABLE algorithms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  description   TEXT,
  icon_svg       TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_algorithms_order ON algorithms(order_index);

-- ──────────────────────────────────────────────────────────────
-- 4. case_studies
-- ──────────────────────────────────────────────────────────────

CREATE TABLE case_studies (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id           UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  story_intro            TEXT,
  real_world_applications TEXT,
  order_index            INTEGER NOT NULL DEFAULT 0,
  is_active              BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_studies_algorithm ON case_studies(algorithm_id);
CREATE INDEX idx_case_studies_active   ON case_studies(is_active) WHERE is_active = true;

-- ──────────────────────────────────────────────────────────────
-- 5. stages
-- ──────────────────────────────────────────────────────────────

CREATE TABLE stages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id     UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  stage_number      INTEGER NOT NULL,
  concept_label     TEXT,
  stage_description TEXT,
  xp_reward         INTEGER NOT NULL DEFAULT 20,
  is_locked         BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_stages_case_study ON stages(case_study_id);
CREATE INDEX idx_stages_order      ON stages(case_study_id, stage_number);

-- ──────────────────────────────────────────────────────────────
-- 6. stage_questions
-- ──────────────────────────────────────────────────────────────

CREATE TABLE stage_questions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id           UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  question_text      TEXT NOT NULL,
  hint_text          TEXT,
  answer_type        TEXT NOT NULL CHECK (answer_type IN ('word', 'integer', 'expression')),
  position           INTEGER NOT NULL DEFAULT 0,
  question_variant   INTEGER NOT NULL DEFAULT 1 CHECK (question_variant BETWEEN 1 AND 10),
  difficulty_weight  INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_stage_questions_stage   ON stage_questions(stage_id);
CREATE INDEX idx_stage_questions_variant ON stage_questions(stage_id, question_variant);

-- ──────────────────────────────────────────────────────────────
-- 7. question_pool
-- ──────────────────────────────────────────────────────────────

CREATE TABLE question_pool (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id           UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  variant_number     INTEGER NOT NULL CHECK (variant_number BETWEEN 1 AND 10),
  question_text      TEXT NOT NULL,
  hint_text          TEXT,
  answer             TEXT NOT NULL,
  answer_type        TEXT NOT NULL CHECK (answer_type IN ('word', 'integer', 'expression')),
  position           INTEGER NOT NULL DEFAULT 0,
  difficulty_weight  INTEGER NOT NULL DEFAULT 1,
  UNIQUE (stage_id, variant_number, position)
);

CREATE INDEX idx_question_pool_stage   ON question_pool(stage_id);
CREATE INDEX idx_question_pool_variant ON question_pool(stage_id, variant_number);

-- ──────────────────────────────────────────────────────────────
-- 8. user_progress
-- ──────────────────────────────────────────────────────────────

CREATE TABLE user_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_study_id     UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  current_stage_id  UUID REFERENCES stages(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  xp_earned         INTEGER NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  last_updated      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, case_study_id)
);

CREATE INDEX idx_user_progress_user    ON user_progress(user_id);
CREATE INDEX idx_user_progress_case   ON user_progress(case_study_id);
CREATE INDEX idx_user_progress_status  ON user_progress(user_id, status);

-- ──────────────────────────────────────────────────────────────
-- 9. user_attempts
-- ──────────────────────────────────────────────────────────────

CREATE TABLE user_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_id            UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  question_id         UUID REFERENCES question_pool(id) ON DELETE SET NULL,
  answer_given        TEXT,
  is_correct          BOOLEAN NOT NULL DEFAULT false,
  attempt_number     INTEGER NOT NULL DEFAULT 1,
  regressed_to_stage  INTEGER,
  attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_seconds INTEGER
);

CREATE INDEX idx_user_attempts_user   ON user_attempts(user_id);
CREATE INDEX idx_user_attempts_stage ON user_attempts(stage_id);
CREATE INDEX idx_user_attempts_time  ON user_attempts(attempted_at);

-- ──────────────────────────────────────────────────────────────
-- 10. teacher_alerts
-- ──────────────────────────────────────────────────────────────

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

CREATE INDEX idx_teacher_alerts_teacher ON teacher_alerts(teacher_id);
CREATE INDEX idx_teacher_alerts_student ON teacher_alerts(student_id);
CREATE INDEX idx_teacher_alerts_unread  ON teacher_alerts(teacher_id, is_read) WHERE is_read = false;

-- ──────────────────────────────────────────────────────────────
-- 11. student_topic_mastery
-- ──────────────────────────────────────────────────────────────

CREATE TABLE student_topic_mastery (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  algorithm_id           UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  mastery_score         INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  questions_attempted   INTEGER NOT NULL DEFAULT 0,
  correct_first_try_pct REAL NOT NULL DEFAULT 0,
  avg_time_per_question INTEGER,
  last_activity         TIMESTAMPTZ,
  UNIQUE (user_id, algorithm_id)
);

CREATE INDEX idx_topic_mastery_user      ON student_topic_mastery(user_id);
CREATE INDEX idx_topic_mastery_algorithm ON student_topic_mastery(algorithm_id);

-- ──────────────────────────────────────────────────────────────
-- 12. cohort_analytics
-- ──────────────────────────────────────────────────────────────

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

CREATE INDEX idx_cohort_analytics_cohort ON cohort_analytics(cohort_id);
CREATE INDEX idx_cohort_analytics_alg    ON cohort_analytics(algorithm_id);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE algorithms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_pool       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_analytics    ENABLE ROW LEVEL SECURITY;

-- users policies
CREATE POLICY "students_read_own" ON users
  FOR SELECT USING (auth.uid() = id AND role = 'student');

CREATE POLICY "students_update_own" ON users
  FOR UPDATE USING (auth.uid() = id AND role = 'student');

CREATE POLICY "teachers_read_students" ON users
  FOR SELECT USING (
    role = 'student'
    AND cohort_id IN (SELECT id FROM cohorts WHERE teacher_id = auth.uid())
  );

CREATE POLICY "teachers_update_own" ON users
  FOR UPDATE USING (auth.uid() = id AND role = 'teacher');

-- cohorts policies
CREATE POLICY "teachers_manage_cohorts" ON cohorts
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "students_read_cohort" ON cohorts
  FOR SELECT USING (id IN (SELECT cohort_id FROM users WHERE id = auth.uid()));

-- algorithms: public read for all authenticated
CREATE POLICY "authenticated_read_algorithms" ON algorithms
  FOR SELECT USING (auth.role() = 'authenticated');

-- case_studies: public read for all authenticated
CREATE POLICY "authenticated_read_case_studies" ON case_studies
  FOR SELECT USING (auth.role() = 'authenticated');

-- stages: public read for all authenticated
CREATE POLICY "authenticated_read_stages" ON stages
  FOR SELECT USING (auth.role() = 'authenticated');

-- stage_questions: public read for all authenticated
CREATE POLICY "authenticated_read_stage_questions" ON stage_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- question_pool: public read for all authenticated
CREATE POLICY "authenticated_read_question_pool" ON question_pool
  FOR SELECT USING (auth.role() = 'authenticated');

-- user_progress policies
CREATE POLICY "students_own_progress_read" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "students_own_progress_write" ON user_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "teachers_read_student_progress" ON user_progress
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE cohort_id IN (
        SELECT id FROM cohorts WHERE teacher_id = auth.uid()
      )
    )
  );

-- user_attempts policies
CREATE POLICY "students_own_attempts" ON user_attempts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "teachers_read_attempts" ON user_attempts
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE cohort_id IN (
        SELECT id FROM cohorts WHERE teacher_id = auth.uid()
      )
    )
  );

-- teacher_alerts policies
CREATE POLICY "teachers_manage_alerts" ON teacher_alerts
  FOR ALL USING (teacher_id = auth.uid());

-- student_topic_mastery policies
CREATE POLICY "students_read_mastery" ON student_topic_mastery
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "teachers_read_cohort_mastery" ON student_topic_mastery
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE cohort_id IN (
        SELECT id FROM cohorts WHERE teacher_id = auth.uid()
      )
    )
  );

-- cohort_analytics policies
CREATE POLICY "teachers_read_cohort_analytics" ON cohort_analytics
  FOR SELECT USING (
    cohort_id IN (SELECT id FROM cohorts WHERE teacher_id = auth.uid())
  );

-- ──────────────────────────────────────────────────────────────
-- Seed Data: 7 Algorithms
-- ──────────────────────────────────────────────────────────────

INSERT INTO algorithms (id, name, display_name, description, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'fermat-little',       "Fermat's Little Theorem",      'a^(p-1) ≡ 1 (mod p) when p is prime — foundation of modern cryptography.',         1),
  ('22222222-2222-2222-2222-222222222222', 'handshake',            'The Handshake Lemma',           'n(n-1)/2 handshakes in a party of n guests each shaking once with everyone.',    2),
  ('33333333-3333-3333-3333-333333333333', 'chinese-remainder',    'Chinese Remainder Theorem',    'Compatible remainders from different divisions pinpoint exactly one number.',     3),
  ('44444444-4444-4444-4444-444444444444', 'coupon-collector',     'Coupon Collector Problem',     'On average, collecting all n coupons requires n × H_n draws — last few are hardest.', 4),
  ('55555555-5555-5555-5555-555555555555', 'euclidean-algorithm',  'The Euclidean Algorithm',       'An ancient method to find GCD(a,b) by repeated remainders — backbone of crypto.', 5),
  ('66666666-6666-6666-6666-666666666666', 'modular-inverse',      'Modular Multiplicative Inverse','x satisfying a×x ≡ 1 (mod m) exists iff gcd(a,m)=1 — the key to RSA decryption.',  6),
  ('77777777-7777-7777-7777-777777777777', 'binary-exponentiation','Binary Exponentiation',        'Computing a^n in O(log n) multiplications instead of O(n) — used in every HTTPS connection.', 7);

COMMIT;
-- ============================================================
-- math-react v0.6 Database Schema
-- Run this in Supabase SQL Editor:
-- https://gwmciomzyaujlpsquvbz.supabase.co
-- ============================================================

-- 1. case_studies
CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  core_idea TEXT,
  story_intro TEXT,
  real_world TEXT[],
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. stages
CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY,
  case_study_id TEXT REFERENCES case_studies(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  concept_label TEXT,
  question TEXT,
  hint TEXT,
  type TEXT,
  accepted_answers TEXT[],
  concept_shown TEXT
);

-- 3. user_progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_study_id TEXT REFERENCES case_studies(id) ON DELETE CASCADE,
  current_stage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, case_study_id)
);

-- 4. user_attempts
CREATE TABLE IF NOT EXISTS user_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_study_id TEXT,
  stage_number INTEGER,
  answer_given TEXT,
  is_correct BOOLEAN,
  xp_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see/edit their own data
CREATE POLICY "users_own_progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_attempts" ON user_attempts FOR ALL USING (auth.uid() = user_id);
// ============================================================
//  Domain Types — Tenali FLN Learning Platform
//  Covers all entities described in docs/database-schema.md
// ============================================================

// ─────────────────────────────────────────────────────────────
//  Users & Auth
// ─────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'teacher'

export interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
  total_xp: number
  institution?: string
  cohort_id?: string
}

export interface Teacher extends User {
  role: 'teacher'
  // teachers have no cohort_id themselves
}

export interface Student extends User {
  role: 'student'
  cohort_id: string
}

// ─────────────────────────────────────────────────────────────
//  Algorithms & Case Studies
// ─────────────────────────────────────────────────────────────

export interface Algorithm {
  id: string
  name: string
  display_name: string
  description?: string
  icon_svg?: string
  order_index: number
}

export interface CaseStudy {
  id: string
  algorithm_id: string
  title: string
  story_intro?: string
  real_world_applications?: string
  order_index: number
  is_active: boolean
  created_at: string
}

// ─────────────────────────────────────────────────────────────
//  Stages & Questions
// ─────────────────────────────────────────────────────────────

export type AnswerType = 'word' | 'integer' | 'expression'

export interface Stage {
  id: string
  case_study_id: string
  stage_number: number
  concept_label?: string
  stage_description?: string
  xp_reward: number
  is_locked: boolean
}

/** Canonical question (variant 1) stored in stage_questions */
export interface StageQuestion {
  id: string
  stage_id: string
  question_text: string
  hint_text?: string
  answer_type: AnswerType
  position: number
  question_variant: 1 // always variant 1 in this table
  difficulty_weight: number
}

/** A single question variant from the question_pool (variants 1–10) */
export interface QuestionVariant {
  id: string
  stage_id: string
  variant_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  question_text: string
  hint_text?: string
  answer: string
  answer_type: AnswerType
  position: number
  difficulty_weight: number
}

// ─────────────────────────────────────────────────────────────
//  Progress Tracking
// ─────────────────────────────────────────────────────────────

export type ProgressStatus = 'not_started' | 'in_progress' | 'mastered'

export interface UserProgress {
  id: string
  user_id: string
  case_study_id: string
  current_stage_id?: string
  status: ProgressStatus
  xp_earned: number
  started_at: string
  completed_at?: string
  last_updated: string
}

export interface UserAttempt {
  id: string
  user_id: string
  stage_id: string
  question_id?: string
  answer_given?: string
  is_correct: boolean
  attempt_number: number
  regressed_to_stage?: number
  attempted_at: string
  time_spent_seconds?: number
}

// ─────────────────────────────────────────────────────────────
//  Cohorts
// ─────────────────────────────────────────────────────────────

export interface Cohort {
  id: string
  name: string
  teacher_id: string
  created_at: string
  updated_at: string
}

export interface CohortAnalytics {
  id: string
  cohort_id: string
  algorithm_id: string
  avg_mastery_score: number
  students_count: number
  active_students: number
  completion_rate: number
}

// ─────────────────────────────────────────────────────────────
//  Teacher Alerts
// ─────────────────────────────────────────────────────────────

export type AlertType = 'repeated_failure' | 'regression_spike' | 'stalled_progress'

export interface TeacherAlert {
  id: string
  teacher_id: string
  student_id: string
  case_study_id?: string
  alert_type: AlertType
  message: string
  is_read: boolean
  created_at: string
}

// ─────────────────────────────────────────────────────────────
//  Mastery
// ─────────────────────────────────────────────────────────────

export interface StudentTopicMastery {
  id: string
  user_id: string
  algorithm_id: string
  mastery_score: number      // 0–100
  questions_attempted: number
  correct_first_try_pct: number
  avg_time_per_question?: number
  last_activity?: string
}

// ─────────────────────────────────────────────────────────────
//  XP Award Events
//  Used internally to describe XP changes triggered by actions
// ─────────────────────────────────────────────────────────────

export type XPAwardReason =
  | 'correct_first_try'    // +10 XP: answered correctly on first attempt
  | 'correct_after_hint'   // +5  XP: answered correctly after hint revealed
  | 'stage_completion'     // +20 XP: completed a stage (3 correct in a row)
  | 'case_study_mastery'   // +100 XP: completed all 7 stages of a case study
  | 'session_bonus'        // misc session bonus awards

export interface XPAward {
  user_id: string
  amount: number
  reason: XPAwardReason
  case_study_id?: string
  stage_id?: string
  awarded_at: string
}

// ─────────────────────────────────────────────────────────────
//  Supabase Auth Extension Types
// ─────────────────────────────────────────────────────────────

/** Minimal session object stored in localStorage */
export interface Session {
  userId: string
  email: string
  name: string
  createdAt: number   // Unix ms timestamp
  view: SessionView
}

export type SessionView =
  | 'home'
  | 'dashboard'
  | 'login'
  | 'register'
  | 'forgot'

// ─────────────────────────────────────────────────────────────
//  API Response Shapes
// ─────────────────────────────────────────────────────────────

export interface APIError {
  message: string
}

export interface SendOTPResponse {
  message: string
}

export interface VerifyOTPResponse {
  message: string
  token: string
}

export interface RegisterResponse {
  message: string
  user: Pick<User, 'id' | 'email' | 'name'>
}

export interface LoginResponse {
  message: string
  user: Pick<User, 'id' | 'email' | 'name'>
}

// ─────────────────────────────────────────────────────────────
//  Dashboard Enrichment Types
//  (derived at runtime, not stored in DB)
// ─────────────────────────────────────────────────────────────

/** A theorem card enriched with runtime progress data */
export interface TheoremCardData {
  id: string
  theorem: string
  coreIdea: string
  slug: string
  illustration: string
  icon?: unknown          // SVG component from illustrations.jsx
  progress: {
    status: ProgressStatus
    current_stage: number
    xp_earned: number
    total_stages: number
  }
}

/** XP bar derived data */
export interface XPBarData {
  totalXP: number
  rank: 'Novice' | 'Apprentice' | 'Scholar' | 'Master'
  nextMilestone: number
}

// ─────────────────────────────────────────────────────────────
//  Learning Engine Types
// ─────────────────────────────────────────────────────────────

export interface ActiveQuestion {
  questionId: string
  stageId: string
  variantNumber: number
  questionText: string
  hintText?: string
  answer: string
  answerType: AnswerType
  position: number
}

export interface StageState {
  stageId: string
  stageNumber: number
  conceptLabel?: string
  questionsCorrect: number   // count of correct answers this stage
  variantIndex: number       // which variant pool we're drawing from
}

export interface LearningSessionState {
  caseStudyId: string
  algorithmId: string
  currentStage: StageState | null
  activeQuestion: ActiveQuestion | null
  attemptCount: number       // attempts on current question
  questionsSeen: Set<string> // question IDs already shown in this session
  totalXP: number
}
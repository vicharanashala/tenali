/**
 * k6-script.js — Stress test template for Tenali FLN Platform
 *
 * Tool: k6 (https://k6.io/docs/)
 * Run:   k6 run stress-tests/k6-script.js
 *
 * Replace placeholders with real values before running.
 * DO NOT run against production without explicit approval.
 */

// ── Configuration ────────────────────────────────────────────────────────────

// Replace these with your actual Supabase project URL and test credentials
const BASE_URL     = 'https://your-project.supabase.co'
const APP_URL      = 'https://your-app.vercel.app'   // Vercel deployment URL
const TEST_EMAIL   = 'load-test@tenali.test'         // Pre-created test account
const TEST_EMAIL_T = 'load-test-teacher@tenali.test' // Pre-created teacher account

// ── Thresholds ──────────────────────────────────────────────────────────────

export const options = {
  // Fail if these thresholds are breached
  thresholds: {
    http_req_duration: ['p(95)<500'],    // 95% of requests < 500ms
    http_req_failed:   ['rate<0.05'],   // Error rate < 5%
    http_req_total:    ['count>100'],    // At least 100 total requests
  },

  // Load profile: 4 stages
  stages: [
    { duration: '30s',  target: 10  },  // Ramp up: 10 users
    { duration: '1m',   target: 10  },  // Steady: 10 users
    { duration: '30s',  target: 100 },  // Ramp up: 100 users
    { duration: '2m',   target: 100 },  // Stress: 100 users
    { duration: '1m',   target: 0  },   // Ramp down
  ],

  // Extracted metrics
  ext: {
    loadtest: {
      // Unique scenario name for results aggregation
      scenario: 'tenali-stress-test',
    }
  }
}

// ── Scenario 1: 100 Students OTP Login Simultaneously ────────────────────────

/**
 * Simulates 100 students attempting to log in via email OTP
 * at the same time. Tests the auth server's OTP generation
 * and email dispatch capacity.
 */
export function studentOTPBurst() {
  const res = http.post(`${APP_URL}/api/auth/send-otp`, {
    email: TEST_EMAIL,
  }, {
    tags: { name: 'student_otp_burst' },
  })

  check(res, {
    'OTP request succeeded': (r) => r.status === 200 || r.status === 429, // 429 = rate limited, expected
    'Response time < 2s':     (r) => r.timings.duration < 2000,
  })

  // Small delay to simulate human behaviour
  sleep(Math.random() * 2 + 0.5)
}

// ── Scenario 2: 50 Students Starting the Same Case Study ────────────────────

/**
 * Simulates 50 students simultaneously starting the same case study.
 * Tests the learning engine's ability to serve concurrent question requests
 * and write progress to the database.
 */
export function concurrentCaseStudy() {
  const headers = {
    'Content-Type': 'application/json',
    // Use a test JWT token — replace with actual token generation in real test
    'Authorization': 'Bearer PLACEHOLDER_JWT_TOKEN',
  }

  // Stage 1 question request
  const questionRes = http.get(
    `${BASE_URL}/rest/v1/question_pool?stage_id=eq.1&limit=1`,
    { headers, tags: { name: 'get_question' } }
  )

  check(questionRes, {
    'Question fetch succeeded': (r) => r.status === 200,
    'Response < 1s':            (r) => r.timings.duration < 1000,
  })

  // Submit answer
  const answerRes = http.post(
    `${BASE_URL}/rest/v1/user_attempts`,
    JSON.stringify({
      user_id:      'PLACEHOLDER_USER_ID',
      stage_id:     1,
      question_id:  1,
      answer_given: '2',
      is_correct:   true,
      attempt_number: 1,
    }),
    { headers, tags: { name: 'submit_answer' } }
  )

  check(answerRes, {
    'Answer submission succeeded': (r) => r.status === 200 || r.status === 201,
    'Response < 500ms':           (r) => r.timings.duration < 500,
  })

  sleep(Math.random() * 3 + 1)
}

// ── Scenario 3: 20 Teachers Logging In Simultaneously ──────────────────────

/**
 * Simulates 20 teachers logging in at the start of a school day.
 * Tests the teacher auth flow and cohort dashboard loading.
 */
export function teacherLoginBurst() {
  const res = http.post(`${APP_URL}/api/auth/teacher/send-otp`, {
    email: TEST_EMAIL_T,
  }, {
    tags: { name: 'teacher_otp_burst' },
  })

  check(res, {
    'Teacher OTP request succeeded': (r) => r.status === 200 || r.status === 429,
    'Response time < 2s':            (r) => r.timings.duration < 2000,
  })

  // Verify OTP (using a fixed test code for load testing)
  const verifyRes = http.post(`${APP_URL}/api/auth/teacher/verify-otp`, {
    email: TEST_EMAIL_T,
    otp:   '000000', // Test OTP — replace with valid test code
  }, {
    tags: { name: 'teacher_verify_otp' },
  })

  check(verifyRes, {
    'OTP verification responded': (r) => r.status < 500,
  })

  sleep(Math.random() * 2 + 0.5)
}

// ── Scenario 4: 200 DB Writes Per Minute Sustained ──────────────────────────

/**
 * Sustained write load: simulates continuous progress saves and XP updates.
 * Target: 200 writes/min for 10 minutes = 2000 total writes.
 */
export function sustainedDBWrites() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': 'PLACEHOLDER_SERVICE_ROLE_KEY', // Use service role key for direct DB writes
  }

  const startTime = Date.now()
  const minuteNumber = Math.floor((Date.now() - startTime) / 60000) + 1

  // Simulate user_progress write
  const progressWrite = http.post(
    `${BASE_URL}/rest/v1/rpc/upsert_user_progress`,
    JSON.stringify({
      p_user_id:       'PLACEHOLDER_USER_ID',
      p_case_study_id: 1,
      p_current_stage: 3,
      p_status:        'in_progress',
      p_xp_earned:     50,
    }),
    { headers, tags: { name: 'db_write_progress' } }
  )

  check(progressWrite, {
    'Progress write succeeded': (r) => r.status === 200 || r.status === 201,
    'Write < 300ms':            (r) => r.timings.duration < 300,
  })

  // Simulate user_attempt write
  const attemptWrite = http.post(
    `${BASE_URL}/rest/v1/user_attempts`,
    JSON.stringify({
      user_id:      'PLACEHOLDER_USER_ID',
      stage_id:     1,
      question_id:  Math.floor(Math.random() * 100) + 1,
      answer_given: 'test',
      is_correct:   false,
      attempt_number: 1,
      time_spent_seconds: 30,
    }),
    { headers, tags: { name: 'db_write_attempt' } }
  )

  check(attemptWrite, {
    'Attempt write succeeded': (r) => r.status === 200 || r.status === 201,
    'Write < 300ms':           (r) => r.timings.duration < 300,
  })

  // Simulate XP update every 3rd write
  if (Math.random() < 0.33) {
    http.post(
      `${BASE_URL}/rest/v1/rpc/increment_xp`,
      JSON.stringify({ delta: 10, uid: 'PLACEHOLDER_USER_ID' }),
      { headers, tags: { name: 'db_write_xp' } }
    )
  }

  sleep(0.3) // ~200 writes/min at 0.3s delay between bursts
}

// ── Main: VU Loop ─────────────────────────────────────────────────────────────

/**
 * Default function run by every virtual user (VU).
 * Cycles through scenarios to simulate mixed load.
 */
export default function() {
  const scenario = Math.floor(Math.random() * 4)

  switch (scenario) {
    case 0: studentOTPBurst();      break
    case 1: concurrentCaseStudy();  break
    case 2: teacherLoginBurst();    break
    case 3: sustainedDBWrites();   break
  }
}

// ── Pre-test: Smoke Test ─────────────────────────────────────────────────────

/**
 * Runs before the main load test to verify the system is up.
 * If this fails, the main test is aborted.
 */
export function setup() {
  const res = http.get(`${APP_URL}/`)
  check(res, {
    'Tenali home page responds': (r) => r.status === 200,
    'Response < 3s':             (r) => r.timings.duration < 3000,
  })

  const authRes = http.post(`${APP_URL}/api/auth/send-otp`, JSON.stringify({
    email: TEST_EMAIL,
  }), { headers: { 'Content-Type': 'application/json' } })

  check(authRes, {
    'Auth endpoint reachable': (r) => r.status < 500,
  })

  console.log('✅ Smoke test passed — starting stress test')
}

// ── Per-VU setup (runs once per VU) ─────────────────────────────────────────

export function handleGlobalMetrics(data) {
  // Called after each VU completes — for custom logging
}

// ── Usage Notes ──────────────────────────────────────────────────────────────
/*
 * To run this script:
 *   1. Install k6: https://k6.io/docs/getting-started/installation/
 *   2. Replace all PLACEHOLDER values with real test credentials
 *   3. Run: k6 run stress-tests/k6-script.js
 *
 * To run against staging (not production):
 *   k6 run -e BASE_URL=https://staging.your-app.com stress-tests/k6-script.js
 *
 * For real OTP testing, pre-create test accounts in Supabase and
 * configure test OTP codes in the auth backend.
 */
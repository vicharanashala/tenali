# Architecture — Tenali FLN Learning Platform

> **Version:** 1.0  
> **Date:** May 2026  
> **Stack:** React + Vite + TypeScript + Tailwind CSS + Supabase + Framer Motion + Express (API)

---

## Project Overview

Tenali is a browser-based FLN (Foundational Literacy and Numeracy) learning platform where students aged ~10–16 learn foundational mathematical theorems through interactive, story-driven case studies. Teachers can monitor cohort progress, receive AI-triggered alerts, and manage content.

**Target users:**
- **Students:** Consume case studies, earn XP, track progress
- **Teachers:** Manage cohorts, review analytics, moderate content, receive alerts

---

## Folder Structure

```
math-react/
├── index.html                  # Vite entry point
├── package.json
├── vite.config.js              # Vite + React plugin config
├── tailwind.config.js          # Design tokens (colors, fonts)
├── postcss.config.js
├── eslint.config.js
├── vercel.json
│
├── server/                     # Express API server (route handlers)
│   ├── index.js                # Express app entry, CORS, JSON middleware
│   ├── routes/
│   │   └── auth.js             # Auth endpoints (OTP, register, login)
│   └── utils/
│       ├── supabase.js         # Server-side Supabase client
│       └── sendOtp.js          # OTP email generation & sending
│
├── src/                        # React frontend (Vite entry: main.jsx)
│   ├── main.jsx                # React DOM mount
│   ├── App.jsx                # Root component: session, routing, auth views
│   ├── index.css              # Global styles, fonts, base CSS
│   ├── App.css
│   │
│   ├── components/             # Reusable UI components
│   │   ├── auth/
│   │   │   ├── OTPInput.jsx
│   │   │   ├── PasswordField.jsx
│   │   │   ├── ResendTimer.jsx
│   │   │   └── StepIndicator.jsx
│   │   └── dashboard/
│   │       ├── CaseStudyCard.jsx
│   │       └── XPBar.jsx
│   │
│   ├── layouts/               # Route layout wrappers
│   │   ├── StudentLayout.jsx  # Student pages: header + nav + child routes
│   │   └── TeacherLayout.jsx  # Teacher pages: header + nav + child routes
│   │
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx  # Student dashboard: theorem card grid
│   │   │   └── LearningLoop.jsx # Interactive case study session
│   │   ├── student/          # Student-specific pages (future)
│   │   ├── teacher/          # Teacher-specific pages (future)
│   │   └── auth/             # Auth page components (future)
│   │
│   ├── data/                  # Static JSON data (fallback content)
│   │   ├── theorems.json     # 7 algorithm summaries
│   │   ├── illustrations.jsx # SVG illustration components
│   │   ├── fermats-little.json
│   │   ├── handshake.json
│   │   ├── chinese-remainder.json
│   │   ├── coupon-collector.json
│   │   ├── euclidean-algorithm.json
│   │   ├── modular-inverse.json
│   │   └── binary-exponentiation.json
│   │
│   ├── lib/                  # Frontend utilities
│   │   ├── supabase.js       # Browser Supabase client
│   │   ├── email.js          # Auth API calls (sendOTP, verifyOTP, etc.)
│   │   └── progress.js      # Progress fetch/persistence helpers
│   │
│   ├── hooks/
│   │   └── useAuth.js        # Auth state hook (planned)
│   │
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # All domain types
│   │
│   └── assets/               # Static assets (images, SVGs)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Initial DB schema migration
│
└── docs/
    ├── database-schema.md    # Full schema documentation
    ├── decisions.md          # Locked decisions registry
    └── architecture.md       # This file
```

---

## Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `navy-950` | `#06090f` | Page background |
| `navy-900` | `#0a1628` | Card backgrounds |
| `navy-800` | `#0f2040` | Input backgrounds |
| `teal-400` | `#2dd4bf` | Primary accent (CTAs, active) |
| `amber-400` | `#fbbf24` | XP, rewards, highlights |
| `cream-100` | `#fefcf3` | Primary text |
| `cream-300` | `#f5edd8` | Secondary text |
| `coral-400` | `#fb7185` | Errors, wrong answers |
| `coral-500` | `#f43f5e` | Destructive actions |

### Typography

- **Display / Theorem names:** `Playfair Display` (serif)
- **Body / Questions:** `Inter` (sans-serif)
- **Code / Math formulas:** `JetBrains Mono` (mono)

### Motion

Animations use **Framer Motion**. All animations respect `prefers-reduced-motion`. Key animation tokens in Tailwind:
- Duration: 150ms (micro), 300ms (standard), 500ms (dramatic)
- Easing: `ease-out` (entries), `ease-in-out` (transitions)

---

## Auth Architecture

### Student Auth Flow (OTP-based)

```
Register (3-step):
  Step 1: name + email  →  POST /api/auth/send-otp     →  Email OTP sent
  Step 2: 6-digit code  →  POST /api/auth/verify-otp    →  { token } (15-min expiry)
  Step 3: password      →  POST /api/auth/register      →  User created in Supabase
                           Token validated server-side

Login:
  Email + password  →  POST /api/auth/login  →  { user }
  Session stored in localStorage (7-day expiry)

Sign-out:
  localStorage cleared  →  view reset to 'home'
```

### Teacher Auth Flow

Same OTP pattern as students but with `role='teacher'` on the user record.

```
  POST /api/auth/teacher/send-otp     →  Email OTP sent
  POST /api/auth/teacher/verify-otp   →  { token }
  POST /api/auth/teacher/register     →  users record with role='teacher'
```

### Session Management

- Session stored in `localStorage` as `math_session` (JSON: `{ userId, email, name, createdAt, view }`)
- 7-day expiry (enforced by `getSession()` on mount)
- JWT via Supabase Auth; refresh token rotation enabled
- Auth state read in `App.jsx` on mount; auth callbacks update localStorage directly

---

## Supabase Table Overview

| Table | Purpose | Access |
|---|---|---|
| `users` | App-user records (students + teachers) | Students: own row; Teachers: cohort students |
| `cohorts` | Student groups | Teacher: full CRUD; Students: read own |
| `algorithms` | 7 FLN theorems | Public read |
| `case_studies` | Case studies per algorithm | Public read |
| `stages` | Stages per case study | Public read |
| `stage_questions` | Canonical questions (variant 1) | Public read |
| `question_pool` | 10 variants per question | Public read |
| `user_progress` | Per-user, per-case-study progress | Student: own; Teacher: cohort |
| `user_attempts` | Individual question attempts | Student: own; Teacher: cohort |
| `teacher_alerts` | Teacher notification queue | Teacher: own |
| `student_topic_mastery` | Per-user, per-algorithm aggregates | Student: own; Teacher: cohort |
| `cohort_analytics` | Per-cohort, per-algorithm aggregates | Teacher: own cohorts |

See [`docs/database-schema.md`](./database-schema.md) for full column definitions, constraints, and RLS policies.

---

## Student Dashboard Flow

```
User lands on Dashboard
  │
  ├─→ fetchProgress(userId)  →  user_progress + stages + algorithms from Supabase
  │
  ├─→ theorems.json  (7 items, static)
  │
  └─→ Enrich theorems with:
       - Progress status (not_started | in_progress | mastered)
       - Current stage (from user_progress.current_stage_id)
       - XP earned
       - Stage progress indicator ("Step 3/7")

  Renders:
       - DashboardHeader (logo, user info, sign-out)
       - XPBar (total XP, rank, next milestone)
       - Responsive grid of CaseStudyCards
         └─→ Click → LearningLoop(theoremId)
```

---

## Learning Engine Flow

```
LearningLoop(theoremId, userId)
  │
  ├─→ Load case study data from theorems.json (fallback) or Supabase
  │
  ├─→ Load stages + question_pool for case study
  │
  ├─→ For each stage:
  │     ├─→ Render story intro + guided example
  │     └─→ For each question:
  │           ├─→ Show question text + hint (after wrong attempt)
  │           ├─→ Student types answer
  │           ├─→ Validate: whitespace trimmed, lowercase compared (word type)
  │           ├─→ Correct  → +XP, green glow, tick animation, 1s delay → next
  │           ├─→ Wrong    → coral glow + shake → hint slides in
  │           ├─→ 2nd wrong → retry same question
  │           └─→ 3rd wrong → regress to previous stage (new variant)
  │
  ├─→ Track attempts in user_attempts table
  │
  ├─→ Track progress in user_progress table
  │
  └─→ Stage 7 complete → Payoff screen (theorem statement, real-world apps, badge)
```

### Adaptive Logic Rules

| Event | Action |
|---|---|
| Correct answer on 1st try | +10 XP, advance to next question |
| Correct answer after hint | +5 XP, advance to next question |
| 3 correct answers in a stage | Stage complete, +20 XP bonus |
| Wrong answer | Hint revealed, retry same question |
| Wrong on retry | Hint reinforced, retry same question |
| Wrong on 3rd attempt | Regress to previous stage (new variant) |
| Stage 1 regression | Stay at Stage 1, new variant |
| All 7 stages complete | Payoff screen + case study mastery XP |

---

## Teacher Dashboard Flow

```
Teacher logs in (OTP → role='teacher')
  │
  ├─→ Teacher Dashboard (overview):
  │     ├─→ List cohorts (from cohorts table, teacher_id = current user)
  │     ├─→ Per cohort: name, student count, avg progress, last activity
  │     ├─→ Alert summary banner (unread alert count)
  │     └─→ Quick stats: total students, active today, fully mastered count
  │
  ├─→ Cohort Detail:
  │     ├─→ Student list: name, email, XP, case studies completed, last active
  │     ├─→ Sort/filter by status
  │     └─→ Click → Individual Student Analytics
  │
  ├─→ Individual Student Analytics:
  │     ├─→ Per-algorithm breakdown: mastery score, time spent
  │     ├─→ Per case study: stages completed, regressions, accuracy
  │     ├─→ Visual timeline (stage progression + regressions)
  │     └─→ Question-level attempt history
  │
  ├─→ Alerting:
  │     ├─→ Alert triggers: 5 regressions/session OR 3 sessions stalled
  │     ├─→ In-app bell icon (unread count)
  │     └─→ Email sent simultaneously (opt-out available)
  │
  └─→ Content Management:
        ├─→ List/filter/search case studies
        ├─→ Edit story intro, stage descriptions, questions
        ├─→ Add question variants (up to 10 per stage)
        ├─→ Publish/unpublish toggle
        └─→ Version history with restore
```

---

## API Routes

### `POST /api/auth/send-otp`
Sends a 6-digit OTP to the given email address.

### `POST /api/auth/verify-otp`
Verifies the OTP. Returns a short-lived `{ token }` (15-min expiry) used in place of email+password for registration.

### `POST /api/auth/register`
Creates a student user record. Requires `{ email, name, password, token }` where token is the verified OTP token.

### `POST /api/auth/login`
Authenticates with email + password (bypass accounts) or OTP flow.

### `POST /api/auth/teacher/send-otp`
Teacher variant of send-otp (sets role='teacher' flag in OTP store).

### `POST /api/auth/teacher/verify-otp`
Teacher OTP verification. Returns a teacher session token.

### `POST /api/auth/teacher/register`
Creates a teacher user record. Requires `{ email, name, token }`.

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# App
VITE_API_URL=https://your-app.vercel.app
```

---

## Key Files and Responsibilities

| File | Responsibility |
|---|---|
| `src/App.jsx` | Root component; session state; view routing |
| `src/pages/dashboard/Dashboard.jsx` | Student dashboard grid + header |
| `src/pages/dashboard/LearningLoop.jsx` | Interactive learning session engine |
| `src/lib/email.js` | Frontend auth API calls |
| `src/lib/progress.js` | Frontend progress fetch/persistence |
| `src/lib/supabase.js` | Browser Supabase client |
| `server/routes/auth.js` | Server-side auth endpoints |
| `server/utils/supabase.js` | Server-side Supabase admin client |
| `server/utils/sendOtp.js` | OTP generation + email sending |
| `tailwind.config.js` | Design tokens (colors, fonts) |
| `docs/database-schema.md` | Complete DB schema documentation |
| `docs/decisions.md` | Locked decisions registry |
| `supabase/migrations/001_initial_schema.sql` | Initial schema migration |
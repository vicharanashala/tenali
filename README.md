# Tenali — FLN Learning Platform

> Foundational Literacy and Numeracy (FLN) adaptive learning platform for ages 10–16.
> Built with React 19, Vite, TypeScript, Tailwind CSS, Supabase, and Framer Motion.

---

## Overview

Tenali teaches mathematical theorems through story-based case studies with an adaptive regression engine:
- **7 core algorithms**: Fermat's Little Theorem, Handshake Lemma, CRT, Coupon Collector, Euclidean Algorithm, Modular Multiplicative Inverse, Binary Exponentiation
- **20 story-based case studies per algorithm**, each with 10 question variants per stage
- **Adaptive flow**: 3 correct → advance · 1 wrong → hint · 3rd wrong → regress to previous stage
- **Teacher dashboard**: per-student analytics (Model B), cohort heat maps, real-time alerts
- **XP system**: +10 first attempt, +5 after hint, +20 stage completion, +100 mastery bonus

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, React Router v7 |
| Styling | Tailwind CSS (deep navy, warm amber, soft cream palette) |
| Animations | Framer Motion |
| Backend | Express.js (Node.js) — API routes |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Email | Resend (OTP delivery) |
| Deployment | Vercel (frontend) + Railway/Render (backend) |

---

## Project Structure

```
math-react/
├── src/
│   ├── components/          # Reusable UI components (Button, Input, Badge, etc.)
│   │   ├── auth/            # OTPInput, ResendTimer, StepIndicator, PasswordField
│   │   └── dashboard/       # CaseStudyCard, XPBar
│   ├── pages/
│   │   └── dashboard/       # Dashboard.jsx, LearningLoop.jsx
│   ├── layouts/             # StudentLayout.jsx, TeacherLayout.jsx
│   ├── hooks/               # useAuth.js
│   ├── lib/                 # supabase.js, email.js, progress.js
│   ├── data/                # JSON: theorems.json, illustrations.jsx, case study data
│   ├── types/               # TypeScript types for all domain entities
│   ├── __tests__/           # Vitest unit tests
│   └── App.jsx             # Root component with auth state machine
├── server/
│   ├── index.js             # Express server entry point (PORT=5001)
│   ├── routes/
│   │   └── auth.js          # OTP auth, register, login, reset-password
│   └── utils/
│       └── sendOtp.js       # Email OTP generation and Resend delivery
├── supabase/
│   └── migrations/          # SQL migrations (version-controlled schema)
├── docs/
│   ├── architecture.md      # Folder structure, auth flows, engine flow
│   ├── database-schema.md   # Full schema: tables, RLS, relationships
│   ├── decisions.md          # All 11 locked decisions
│   ├── testing-strategy.md  # Unit/integration/stress/QA testing plan
│   ├── research-report.md   # FLN best practices, adaptive learning research
│   └── FLN-research-references.md  # Academic and government references
├── scripts/
│   └── validateContent.js   # Content quality gate (pre-publish blocking)
├── stress-tests/
│   └── k6-script.js         # k6 load test template
└── .env.example             # All required environment variables
```

---

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/sudarshansudarshan/jinal.git
cd jinal
npm install
cd server && npm install && cd ..
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side only) |
| `RESEND_API_KEY` | Resend API key for OTP email delivery |
| `EMAIL_FROM` | Sender identity (e.g., `Tenali <noreply@yourdomain.com>`) |
| `VITE_APP_URL` | Frontend URL (e.g., `http://localhost:5173`) |
| `PORT` | Backend port (default: 5001) |

### 3. Database Setup

Run the migration in Supabase:

```bash
# In your Supabase dashboard SQL editor, or via CLI:
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and run it in your Supabase SQL editor
```

This creates all tables with RLS policies, indexes, and seed data for the 7 algorithms.

### 4. Start Development

```bash
# Terminal 1 — Frontend (Vite dev server)
npm run dev

# Terminal 2 — Backend (Express server)
npm run server

# Or run both together:
npm run dev:full
```

Open `http://localhost:5173`

---

## Environment Variable Reference

See `.env.example` for the full list with descriptions. Key variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email (Resend)
RESEND_API_KEY=re_your_key
EMAIL_FROM=Tenali <noreply@yourdomain.com>

# Frontend
VITE_APP_URL=http://localhost:5173

# Backend
PORT=5001
```

---

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` = your production URL
4. Deploy

### Backend (Express)

Deploy to Railway or Render:

1. Set environment variables in the platform dashboard
2. Point to `server/index.js` as the entry point
3. Set `PORT` env var (Railway auto-detects)

### Custom Domain

- Frontend: configure in Vercel dashboard
- Backend: configure in Railway/Render dashboard
- Update `VITE_APP_URL` to match the production URL

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
```

Test files live in `src/__tests__/`:
- `auth.test.js` — session management (create, get, expiry, clear)
- `learningEngine.test.js` — adaptive regression logic, XP scoring

### Content Validation (Pre-publish Gate)

```bash
node scripts/validateContent.js
# Exit 0 = passed, Exit 1 = validation failed (blocking publish)
```

Validates all 10 rules: algorithm coverage, stage count, question count, answer presence, hint presence, story intros, real-world applications, and launch threshold (≥5 case studies per algorithm).

### Stress Tests (k6)

```bash
# Install k6: https://k6.io/docs/getting-started/installation/
k6 run stress-tests/k6-script.js

# Against staging:
k6 run -e APP_URL=https://staging.your-app.com stress-tests/k6-script.js
```

Scenarios: OTP burst (100 users), 50 concurrent case studies, 20 teacher logins, 200 DB writes/min sustained.

### Integration Tests (Playwright)

```bash
npx playwright test
npx playwright test --project=chromium
```

---

## Adding a New Algorithm

1. Add a row to the `algorithms` table (or to `src/data/theorems.json` for local development)
2. Create a JSON file in `src/data/` with the algorithm's case studies
3. For each case study: story intro → 6-7 stages → 10 variants per stage → payoff screen
4. Run `node scripts/validateContent.js` to verify completeness
5. Teacher reviews and approves content before it goes live

---

## Version History

See `Tenali-Roadmap-v2.md` in the workspace for the full version-by-version plan (v0.1 → v1.0).

| Tag | Focus |
|---|---|
| `v0.1` | Project scaffold — design system, auth, DB schema, docs |
| `v0.1-patch` | FLN research, unit tests, content validation, stress test template |

---

## Contacts

- **Student auth** — email OTP via Resend, Supabase sessions
- **Teacher auth** — same OTP flow with `role=teacher`
- **Supabase** — use service role key for server-side operations only
- **Questions** — see `docs/architecture.md` and `docs/decisions.md`
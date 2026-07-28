# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Run the server (development):**
```bash
cd server && node index.js
```
Server starts on port 4000 (or `PORT` env var). No nodemon — restart manually after changes.

**Run the client (development):**
```bash
cd client && npm run dev
```
Vite dev server on port 5173. All `*-api` and `/api` routes are proxied to `http://127.0.0.1:4000`.

**Build for production:**
```bash
cd client && npm run build
```
Output goes to `client/dist/`. The Express server serves this statically in production.

**Lint the client:**
```bash
cd client && npm run lint
```

**Deploy (production on this server):**
```bash
sudo systemctl restart tenali
```
The systemd service runs `node /home/tenali/tenali/server/index.js` as the `tenali` user. Nginx proxies `tenali.fun` → port 4000 with SSL already configured.

---

## Architecture

### Overview
Tenali is a **stateless** adaptive math quiz platform. The backend generates questions algorithmically on every request — there is no database for question storage. All 69 puzzle types have a `GET /<type>-api/question` and `POST /<type>-api/check` pair in a single file.

### Server (`server/index.js` — ~9000 lines)
One monolithic file. The structure top-to-bottom:
1. **Solve middleware** (wraps all `POST *-api/check` calls) — monkey-patches `res.json` to inject `explanation` when `req.body.solve === true`, without touching individual handlers.
2. **`generateExplanation(req, data)`** (~700 lines) — produces step-by-step educational walkthroughs for 50+ puzzle types. Called only by the solve middleware.
3. **Utility functions** — `gcd`, `lcm`, `simplifyFraction`, `randomInt`, `pick`, `digitRange`, `formatSignedTerm`, etc.
4. **Data loading** — `loadQuestions()` reads 991 GK JSONs from `chitragupta/questions/`; `loadVocab()` reads 7,662 vocab JSONs from `vocab/questions/`. Both load at startup.
5. **59 endpoint pairs** — one `GET` (question generation) and one `POST` (answer checking) per puzzle type. Difficulty (0–3) drives parameter ranges via helpers like `digitRange(difficulty)`.
6. **Auth** (`server/auth.js`) — JWT auth backed by MongoDB, with an in-memory fallback for the two seed users (`sudarshan`/`sherlockholmes`, `tatsavit`/`taittiriya`) when MongoDB is unavailable.
7. **Static serving** — serves `client/dist`, `graph/`, `enhanced/`, and a SPA catch-all.

### Client (`client/src/App.jsx` — ~47000 lines)
One monolithic React file. All components live here. Structure:
- **`useAuth()`** — login/logout hook with localStorage persistence and a custom `tenali-auth-change` window event for cross-component sync.
- **`useTimer()`** — per-question elapsed timer (250ms tick).
- **`useAutoAdvance()`** — auto-advances after a correct answer (3.5s delay).
- **`makeQuizApp({ title, apiPath, diffLabels, placeholders, answerField })`** — factory that generates ~45 standard quiz components. Each has setup → playing → finished screens with adaptive difficulty, Solve, Skip, and self-report buttons built in. Use this for new puzzle types.
- **Custom quiz apps** — `TatsavitApp`, `RandomMixApp`, `AdaptiveTablesApp`, `ScaffoldedTablesApp`, and others that need non-standard state or UI. These are not factory-generated.
- **`modeMap`** — maps string keys (e.g. `'trig'`) to React components. The URL/routing is just a `useState` in the root `App` component — no React Router.
- **`regularApps`** — array of `{ key, name, subtitle, color }` objects that drive the home screen grid.
- **`fetchQuestionForType(type, difficulty)`** — maps puzzle keys to their API paths; used by `RandomMixApp` and `CustomApp`.

### Adding a new puzzle type
1. Add `GET /<type>-api/question` and `POST /<type>-api/check` endpoints in `server/index.js`.
2. Add a proxy entry in `client/vite.config.js` for `/<type>-api`.
3. Create the component with `makeQuizApp(...)` in `App.jsx` (or custom if needed).
4. Register it in `modeMap` and add an entry to `regularApps`.
5. Add a case to `generateExplanation()` in `server/index.js` for the Solve button.

### Adaptive difficulty
Each quiz tracks `adaptScore` (float 0–3). Correct → +0.15 to +0.5; wrong → −0.4 to −0.6. The score maps to easy/medium/hard/extrahard, which drives the `difficulty` parameter sent to the question API. Difficulty is per-component instance and is not persisted across sessions.

### Deployment topology
```
tenali.fun (DNS → 143.110.241.156)
  └── Nginx (SSL via Let's Encrypt, /etc/nginx/sites-available/tenali)
        └── proxy_pass http://127.0.0.1:4000
              └── tenali.service (systemd, runs as tenali user)
                    └── node /home/tenali/tenali/server/index.js
```
The repo lives at `/home/tenali/tenali/`. Changes to server code require a service restart. Changes to client code require a production build followed by a service restart.

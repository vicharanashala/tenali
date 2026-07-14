# Tenali - Stateless Adaptive Math Quiz Platform

Tenali is a stateless, adaptive math quiz platform designed for interactive and algorithmic math learning. The application serves a variety of puzzle types, automatically generating questions on the fly and evaluating user answers in real-time.

---

## 🚀 Running the Project Locally

### 1. Backend Server
The backend is a Node.js Express server that handles route matching, user authentication, and algorithmic question generation.
```bash
# Navigate to the server directory and start the server
cd server
node index.js
```
* The backend server runs on `http://localhost:4000`.

### 2. Frontend Client
The frontend is a React application built with Vite.
```bash
# Navigate to the client directory and start the Vite dev server
cd client
npm run dev
```
* The client dev server runs on `http://localhost:5173/` and automatically proxies `/api` and `*-api` routes to the backend on port 4000.

---

## 🎵 Sound Effects (SFX) System

We recently implemented a lightweight sound effects system utilizing [Howler.js](https://howlerjs.com/) for high-quality audio playback and browser compatibility, along with a synthesis fallback script for offline generation.

### Audio Asset Size Breakdown

The following table lists the sound effects included in `client/public/sounds/` along with their file sizes:

| File Name | Description | Size (Bytes) | Size (KB) |
| :--- | :--- | :--- | :--- |
| `celebrate.mp3` | Quiz completion celebration sound | 220,544 B | ~215.4 KB |
| `click.mp3` | General button/element click sound | 2,690 B | ~2.6 KB |
| `coin.mp3` | Score/coin collection sound | 13,274 B | ~13.0 KB |
| `correct.mp3` | Correct answer feedback sound | 35,324 B | ~34.5 KB |
| `levelup.mp3` | Level/difficulty progression sound | 70,604 B | ~69.0 KB |
| `streak.mp3` | Consecutive correct answers streak sound | 44,144 B | ~43.1 KB |
| `wrong.mp3` | Incorrect answer feedback sound | 44,144 B | ~43.1 KB |
| **Total Size** | **Total SFX Assets** | **430,724 B** | **~420.6 KB** |

---

## 🛠️ Commit Details

### Commit Message
`feat: implement lightweight SFX system with Howler.js and synthesized sounds, including quiz completion celebration sound`

### Files Modified & Created
The commit introduced changes across **18 files** with **439 additions**:

* **Audio Manager & Infrastructure**
  * `[NEW]` [AudioManager.js](file:///c:/Users/aftab/Downloads/Vicharanshala-FAQ-Generation-main/tenali/tenali/client/src/audio/AudioManager.js) — Houses the core Howl playback logic, muting/unmuting preferences, and streak thresholds.
  * `[NEW]` [generate-sounds.cjs](file:///c:/Users/aftab/Downloads/Vicharanshala-FAQ-Generation-main/tenali/tenali/client/scripts/generate-sounds.cjs) — Script to synthesize sounds offline.
  * `[MODIFY]` `client/package.json` — Added Howler dependency.
  * `[MODIFY]` `client/package-lock.json` — Lockfile updates for Howler.

* **Audio Assets (New)**
  * `[NEW]` `client/public/sounds/celebrate.mp3`
  * `[NEW]` `client/public/sounds/click.mp3`
  * `[NEW]` `client/public/sounds/coin.mp3`
  * `[NEW]` `client/public/sounds/correct.mp3`
  * `[NEW]` `client/public/sounds/levelup.mp3`
  * `[NEW]` `client/public/sounds/streak.mp3`
  * `[NEW]` `client/public/sounds/wrong.mp3`

* **App Integrations**
  * `[MODIFY]` `client/src/App.jsx` — Integrated audio cues into the main Quiz app workflows, correct/incorrect screen feedbacks, and sound toggle controls.
  * `[MODIFY]` `client/src/BearingsLabApp.jsx` — Audio trigger hooks.
  * `[MODIFY]` `client/src/CoordGeomDiscoveryApp.jsx` — Audio trigger hooks.
  * `[MODIFY]` `client/src/LcmHcfApp.jsx` — Audio integration.
  * `[MODIFY]` `client/src/ProbLabApp.jsx` — Audio trigger hooks.
  * `[MODIFY]` `client/src/PythagLabApp.jsx` — Audio trigger hooks.
  * `[MODIFY]` `client/src/VisualMathLabRedux.jsx` — Audio trigger hooks.

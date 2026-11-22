# DARKCOURT — Basketball Match Tracker

A responsive, Batman-inspired black / red / white basketball match tracker. The design uses dark panels, red accents, distressed/grain texture and bold condensed typography; it is an original interface, not an official Batman or DC product.

## Features
- Home vs away scoreboard with +1, +2, +3 and score correction.
- Period selector and start/stop 10-minute game clock.
- Possession indicator and possession switching.
- Team comparisons: field goals, three-pointers, rebounds, assists, turnovers and fouls.
- Quick event logging: made/missed 2PT, 3PT and free throws, rebounds, assists, steals, blocks, turnovers and fouls.
- Player roster with individual points, rebounds, assists, steals, blocks, turnovers and fouls.
- Play-by-play event timeline.
- Save match state to browser local storage and export play log to CSV.

## Run locally
Open `index.html` in a modern browser. No build tools or package installation required.

## Deploy to GitHub Pages
1. Create a GitHub repository, e.g. `darkcourt-basketball`.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then Save.
6. Wait for deployment. The site URL will be `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Important limitations
This is a manual stat-entry tool, not an automatic live NBA feed. Match data is stored locally in the browser and is not synchronized between multiple devices or users. For shared real-time scoring, add a backend/database such as Firebase or Supabase.

# Crack the Pattern! – Exploring Sequences & Series 🔢

A bright, interactive, zero-dependency mathematics teaching website designed for **Class 10–11 students** to learn **Sequences and Series** (Arithmetic Progressions, Geometric Progressions, Fibonacci, and Series Sums) through live visual labs, games, and instant-feedback quizzes.

## ✨ Interactive Features Included
1. **Hero Section + Live "Guess the Next Number" Mini-Game** – 6 playable patterns (AP, GP, Fibonacci, Squares, Countdown, Shrinking GP) with hints and streak tracking.
2. **Pattern Detective (Intuition First)** – 4 real-world guess-before-reveal cards (Weekly Savings AP, Doubling Bacteria GP, Sunflower Fibonacci, Bouncing Ball Converging GP) plus everyday analogies.
3. **Learn the Concepts Simply** – Visual *Sequence vs. Series* comparison, color-coded AP/GP/Special sequence cards, and 4 tabbed step-by-step worked examples with zero steps skipped.
4. **Interactive AP & GP Visualizer Lab** – Toggle between AP and GP modes, adjust sliders for `a`, `d`/`r`, and `n` (or click teaching presets), view animated bars, and watch `aₙ`, `Sₙ`, and converging `S∞` update live step-by-step.
5. **Linear vs. Exponential Showdown** – Interactive 30-day salary challenge comparing *₹10,000/day (AP)* vs *₹1 doubled daily (GP)* with Day 1–30 slider, quick jump buttons, and Auto-Play animation.
6. **Interactive Practice Quiz** – 10 Easy & Medium questions with live progress bar, instant step-by-step explanations, score summary, full answer review, and restart button.
7. **Quick Formula Cheat Sheet + Classroom Teach Mode** – 30-second exam review cards plus a navbar **Teach Mode** button that enlarges text for classroom projectors.

## 📁 Project Files (Root Level)
- `index.html` – Semantic structure for all 7 interactive sections.
- `styles.css` – Modern, colourful, mobile-responsive layout and animations.
- `script.js` – Pure Vanilla JavaScript powering all games, labs, charts, and quiz logic.
- `README.md` – Setup, customization, and GitHub Pages deployment guide.

## 🚀 Run Locally in 5 Seconds
No installation, Node.js, or build step is required! Just double-click `index.html` to open the website in Chrome, Edge, Safari, or Firefox.

## 🌐 Publish Free on GitHub Pages
1. Create a new **Public** repository on GitHub (e.g., `sequences-and-series`).
2. Click **Add file → Upload files**.
3. Upload `index.html`, `styles.css`, `script.js`, and `README.md` directly into the root of your repository and click **Commit changes**.
4. Go to **Settings → Pages**.
5. Under **Build and deployment → Branch**, select **`main`** and folder **`/ (root)`**, then click **Save**.
6. Wait 1–2 minutes and refresh the page — your live GitHub Pages URL will appear at the top!

## ✏️ Easy Customization
- **Add Your Name / Entry Number:** Open `index.html`, find `[Your Name / Entry Number]` inside the `<footer>`, and replace it with your own details.
- **Edit or Add Questions:** Open `script.js` and edit `heroPatterns`, `detectiveCases`, or `quizQuestions` — each array is clearly commented.

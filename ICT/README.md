# 🧭 MATH QUEST – The Lost Kingdom of Numbers

An interactive, adventure-game-based mathematics learning web application built for **Class 6 students (ages 11–12)**, aligned with the **NCERT Class 6 Mathematics (*Ganita Prakash*)** syllabus.

Instead of textbooks, long lectures, or static worksheets, students explore a colorful mathematical kingdom, unlock worlds, complete bite-sized missions, and earn stars, coins, and badges.

---

## ✨ Features

- **🗺️ Interactive Kingdom Adventure Map:** Visual world progression with unlockable levels and a live kingdom progress bar.
- **🎮 Three Distinct Mini-Games (World 1: Temple of Patterns):**
  - **Mission 1 – Robot's Bridge:** Pattern completion puzzles covering Triangular, Square, and Odd number sequences.
  - **Mission 2 – Relic Matcher:** Interactive visual matching connecting dot arrangements to number sequences (Triangular numbers, Square numbers, Powers of 2).
  - **Mission 3 – Vault Rush:** Timed 45-second challenge testing Virahanka–Fibonacci sequences, Cube numbers, and doubling patterns.
- **💡 Visual-First Learning:** Zero walls of text—wrong answers trigger concise visual clues instead of lengthy explanations.
- **🏆 Persistent Rewards System:** Saves stars, gold coins, mission completions, and explorer badges automatically via `localStorage`.
- **📱 Fully Responsive:** Playable on laptops, tablets, and mobile phones with zero external dependencies.

---

## 📂 Project Structure

```text
math-quest/
├── index.html   # Main game layout, HUD, Adventure Map, and Arena screens
├── style.css    # Vibrant adventure theme, animations, and responsive grid
├── script.js    # Game state, NCERT puzzle logic, timers, and reward system
└── README.md    # Project documentation and deployment guide
```

---

## 🚀 How to Run Locally

1. Unzip `math-quest.zip` to your computer.
2. Open the `math-quest` folder.
3. Double-click `index.html` to launch the game in any modern web browser (Chrome, Edge, Safari, Firefox).

---

## 🌐 Deploying on GitHub Pages

1. Create a new repository on GitHub named `math-quest`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the root of the repository.
3. Open **Settings → Pages**.
4. Under **Build and deployment → Branch**, select **`main`** and **`/ (root)`**, then click **Save**.
5. Wait 1–2 minutes and open your live game URL at `https://<your-username>.github.io/math-quest/`.

---

## 📚 NCERT Syllabus Alignment (*Ganita Prakash* – Class 6)

- **World 1: Temple of Patterns** → *Chapter 1: Patterns in Mathematics* (Number sequences, visualizing number sequences with dots, relations among number sequences).
- **World 2: Canyon of Angles** *(Planned)* → *Chapter 2: Lines and Angles*
- **World 3: Prime Peak** *(Planned)* → *Chapter 5: Prime Time*
- **World 4: Symmetry Sanctuary** *(Planned)* → *Chapter 9: Symmetry*

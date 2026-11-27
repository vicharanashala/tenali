# 🌍 Changes Around Us

An interactive science project that teaches students about **changes around us**: slow and fast, reversible and irreversible, periodic and non-periodic, and physical and chemical changes. It includes puzzles and games so learning is fun instead of boring.

## ✨ Features

| Section | What it does |
|---|---|
| 📖 Learn | Simple notes, examples, 4 clues of a chemical change, and safe home experiments |
| 🧪 Sort It | Decide if 10 random changes are physical or chemical (with explanations) |
| 🔤 Word Scramble | Unscramble science words using hints |
| 🃏 Match Pairs | Memory-card game: match what we start with to what we get |
| 🔎 Word Search | Find 8 hidden words (new puzzle every time) |
| 🏆 Quiz | 8 multiple-choice questions with feedback |
| ⭐ My Progress | Best scores saved in the browser, plus a fun title to earn |

No installation, frameworks or internet connection needed. It is pure HTML, CSS and JavaScript.

## 📁 Project structure

```
changes-around-us/
├── index.html   # page structure and the Learn content
├── style.css    # colours, layout, responsive design
├── script.js    # all games + the question/word data
├── README.md
├── LICENSE
└── .gitignore
```

## ▶️ How to run

1. Download or clone this repository.
2. Double-click `index.html` to open it in any browser. That's it!

## 🚀 Publish it on GitHub

1. Create a free account at [github.com](https://github.com).
2. Click **New repository**, name it `changes-around-us`, keep it **Public**, and create it.
3. Click **Add file → Upload files**, drag in all the files from this project, and click **Commit changes**.
4. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, then **Save**.
5. After a minute your project will be live at `https://<your-username>.github.io/changes-around-us/`.

Prefer the command line?

```bash
cd changes-around-us
git init
git add .
git commit -m "Add Changes Around Us project"
git branch -M main
git remote add origin https://github.com/<your-username>/changes-around-us.git
git push -u origin main
```

## ✏️ Customise it

All the content is in the **DATA** section at the top of `script.js`:

- `CHANGES` – add more physical/chemical examples for the Sort It game
- `SCRAMBLE_WORDS` – add words and hints
- `MATCH_PAIRS` – add "start → result" pairs (the grid uses 6 pairs)
- `SEARCH_WORDS` – change the hidden words (max 10 letters per word)
- `QUIZ` – add questions. `a` is the index of the correct option, starting from 0

## 📚 Concepts covered

- Slow and fast changes
- Reversible and irreversible changes
- Periodic and non-periodic changes
- Physical changes (no new substance) vs chemical changes (new substance)
- Examples: melting, boiling, dissolving, rusting, burning, curdling, baking, photosynthesis

## 🤝 Contributing

Ideas welcome! Fork the repo, add a new puzzle or more questions, and open a pull request.

## 📄 License

MIT. See [LICENSE](LICENSE).

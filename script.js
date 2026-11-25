"use strict";

/* ============================================================
   Changes Around Us – interactive games
   All questions and words live in the DATA section below,
   so students/teachers can edit them without touching the logic.
   ============================================================ */

/* ------------------------- DATA ------------------------- */

const CHANGES = [
  { emoji: "🧊", name: "Melting of ice", type: "physical", why: "Only the state changes. It is still water." },
  { emoji: "📄", name: "Burning of paper", type: "chemical", why: "Ash, smoke and gases are new substances." },
  { emoji: "🍳", name: "Frying an egg", type: "chemical", why: "Heat changes the egg into a new substance that cannot turn back." },
  { emoji: "🍬", name: "Dissolving sugar in water", type: "physical", why: "Sugar can be recovered by evaporating the water." },
  { emoji: "🔩", name: "Rusting of an iron nail", type: "chemical", why: "Iron reacts with oxygen and water to form rust." },
  { emoji: "📃", name: "Folding a sheet of paper", type: "physical", why: "Only the shape changes. The paper is still paper." },
  { emoji: "🥛", name: "Milk turning into curd", type: "chemical", why: "Bacteria change milk into curd, a new substance." },
  { emoji: "♨️", name: "Boiling of water", type: "physical", why: "Water changes to steam, but steam is still water." },
  { emoji: "🥭", name: "Ripening of a mango", type: "chemical", why: "New substances form, changing the taste, colour and smell." },
  { emoji: "🥕", name: "Cutting a carrot", type: "physical", why: "Only the size and shape change." },
  { emoji: "🎂", name: "Baking a cake", type: "chemical", why: "Batter changes into a new substance that cannot be undone." },
  { emoji: "🥫", name: "Crushing a tin can", type: "physical", why: "Only the shape changes. It is still metal." },
  { emoji: "🍽️", name: "Digestion of food", type: "chemical", why: "Food is broken down into new substances in the body." },
  { emoji: "🧃", name: "Freezing of juice", type: "physical", why: "Liquid becomes solid but no new substance forms." },
  { emoji: "🌿", name: "Photosynthesis in leaves", type: "chemical", why: "Plants make food (glucose) and oxygen from CO₂ and water." },
  { emoji: "🧂", name: "Mixing salt and sand", type: "physical", why: "The two substances are only mixed, not changed." },
  { emoji: "🍎", name: "A cut apple turning brown", type: "chemical", why: "Oxygen reacts with the fruit and makes new substances." },
  { emoji: "🪵", name: "Sawing wood", type: "physical", why: "The wood breaks into smaller pieces, but it is still wood." }
];

const SCRAMBLE_WORDS = [
  { w: "EVAPORATION", h: "Liquid water slowly turning into vapour (how wet clothes dry)." },
  { w: "CONDENSATION", h: "Water vapour cooling into tiny droplets (dew on a cold glass)." },
  { w: "REVERSIBLE", h: "A change that can be undone." },
  { w: "IRREVERSIBLE", h: "A change that cannot be undone." },
  { w: "CHEMICAL", h: "A change in which a new substance is formed." },
  { w: "PHYSICAL", h: "A change with no new substance formed." },
  { w: "RUSTING", h: "Iron slowly turns reddish-brown in moist air." },
  { w: "MELTING", h: "Solid becoming liquid when heated." },
  { w: "FREEZING", h: "Liquid becoming solid when cooled." },
  { w: "PERIODIC", h: "Changes that repeat after a fixed time, like day and night." }
];

const MATCH_PAIRS = [
  { a: "🪵 Burning wood", b: "Ash + smoke" },
  { a: "🧊 Heating ice", b: "Liquid water" },
  { a: "🥛 Milk + bacteria", b: "Curd" },
  { a: "🔩 Iron + moist air", b: "Rust" },
  { a: "💧 Boiling water", b: "Steam" },
  { a: "🍬 Sugar + water", b: "Sugar solution" }
];

const SEARCH_WORDS = ["MELTING", "FREEZING", "RUSTING", "BURNING", "BOILING", "CURD", "STEAM", "FOLD"];

const QUIZ = [
  { q: "Which of these is a chemical change?", o: ["Melting wax", "Burning wood", "Tearing paper", "Boiling water"], a: 1, e: "Burning forms new substances like ash and gases." },
  { q: "A change that CAN be undone is called…", o: ["Reversible", "Irreversible", "Chemical", "Slow"], a: 0, e: "Reversible changes can go back to the starting material." },
  { q: "Which of these is a SLOW change?", o: ["Bursting a balloon", "Rusting of iron", "Lighting a match", "A cracker exploding"], a: 1, e: "Rust takes days or weeks to form." },
  { q: "Day and night happen again and again at fixed times. This is a…", o: ["Periodic change", "Non-periodic change", "Chemical change", "Irreversible change"], a: 0, e: "Periodic changes repeat after a fixed time." },
  { q: "Which of these is NOT a sign of a chemical change?", o: ["A new substance forms", "Only the state changes", "A gas is given out", "An unexpected colour change"], a: 1, e: "A change of state alone (like melting) is physical." },
  { q: "Rust forms when iron reacts with…", o: ["Oxygen and water", "Only nitrogen", "Only sugar", "Only light"], a: 0, e: "Iron + oxygen + water → rust." },
  { q: "Dissolving salt in water is a…", o: ["Physical change", "Chemical change", "Neither", "Both"], a: 0, e: "The salt can be recovered by evaporating the water." },
  { q: "Which change is irreversible?", o: ["Freezing water", "Boiling water", "Baking a cake", "Dissolving sugar"], a: 2, e: "You cannot turn a baked cake back into batter." }
];

/* ------------------------- HELPERS ------------------------- */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

/* ------------------------- PROGRESS ------------------------- */

const STORAGE_KEY = "changes-around-us-progress";
const GAME_INFO = {
  sort: { label: "🧪 Sort It", max: 10, unit: "correct" },
  scramble: { label: "🔤 Word Scramble", max: 6, unit: "solved" },
  match: { label: "🃏 Match Pairs", max: 3, unit: "stars" },
  search: { label: "🔎 Word Search", max: 8, unit: "words found" },
  quiz: { label: "🏆 Quiz", max: 8, unit: "correct" }
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveBest(game, score) {
  const p = loadProgress();
  if (p[game] === undefined || score > p[game]) {
    p[game] = score;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) { /* storage may be blocked; ignore */ }
  }
  renderProgress();
}

function renderProgress() {
  const p = loadProgress();
  const root = $("#progress-list");
  let stars = 0;
  const rows = Object.keys(GAME_INFO).map((key) => {
    const info = GAME_INFO[key];
    const score = p[key] || 0;
    const perfect = score >= info.max;
    if (perfect) stars++;
    return `<div class="progress-row"><span>${info.label}</span><span>${score} / ${info.max} ${info.unit} ${perfect ? "🌟" : ""}</span></div>`;
  });
  let title = "Keep exploring! 🚀";
  if (stars >= 5) title = "🏅 Change Master!";
  else if (stars >= 3) title = "🔬 Junior Scientist";
  else if (stars >= 1) title = "🧪 Curious Explorer";
  root.innerHTML = `<p class="result"><strong>Your title: ${title}</strong> (${stars}/5 perfect games)</p>` + rows.join("");
}

/* ------------------------- TABS ------------------------- */

function initTabs() {
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      $$(".tab").forEach((t) => t.classList.toggle("hidden", t.id !== "tab-" + btn.dataset.tab));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  $("#reset-progress").addEventListener("click", () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    renderProgress();
  });
}

/* ------------------------- GAME 1: SORT IT ------------------------- */

const SortGame = (() => {
  const root = $("#sort-game");
  let deck, i, score, answered;

  function start() {
    deck = shuffle(CHANGES).slice(0, 10);
    i = 0;
    score = 0;
    show();
  }

  function show() {
    if (i >= deck.length) return finish();
    answered = false;
    const c = deck[i];
    root.innerHTML = `
      <p class="muted">Card ${i + 1} of ${deck.length} · Score: ${score}</p>
      <div class="big-card">${c.emoji} ${c.name}</div>
      <div class="btn-row">
        <button class="btn physical" data-ans="physical">🧊 Physical</button>
        <button class="btn chemical" data-ans="chemical">🔥 Chemical</button>
      </div>
      <p class="feedback" aria-live="polite"></p>
      <div class="btn-row"></div>`;
  }

  function answer(choice) {
    if (answered) return;
    answered = true;
    const c = deck[i];
    const ok = choice === c.type;
    if (ok) score++;
    const fb = $(".feedback", root);
    fb.className = "feedback " + (ok ? "good" : "bad");
    fb.textContent = (ok ? "✅ Correct! " : "❌ Not quite. It is a " + c.type + " change. ") + c.why;
    $$("[data-ans]", root).forEach((b) => (b.disabled = true));
    $(".btn-row:last-child", root).innerHTML =
      `<button class="btn primary" data-next="1">${i + 1 === deck.length ? "See result" : "Next ➜"}</button>`;
  }

  function finish() {
    saveBest("sort", score);
    const msg = score === 10 ? "Perfect! You are a change expert! 🌟" : score >= 7 ? "Great job! 👏" : "Good try! Read the Learn page and play again. 📖";
    root.innerHTML = `<div class="result"><div class="big">${score}/10</div><p>${msg}</p>
      <button class="btn primary" data-restart="1">Play again 🔄</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.ans) answer(b.dataset.ans);
    else if (b.dataset.next) { i++; show(); }
    else if (b.dataset.restart) start();
  });

  return { start };
})();

/* ------------------------- GAME 2: WORD SCRAMBLE ------------------------- */

const ScrambleGame = (() => {
  const root = $("#scramble-game");
  let deck, i, score, scrambled, done;

  function scramble(word) {
    let s = word;
    let tries = 0;
    while (s === word && tries++ < 20) s = shuffle(word.split("")).join("");
    return s;
  }

  function start() {
    deck = shuffle(SCRAMBLE_WORDS).slice(0, 6);
    i = 0;
    score = 0;
    show();
  }

  function show() {
    if (i >= deck.length) return finish();
    done = false;
    const item = deck[i];
    scrambled = scramble(item.w);
    root.innerHTML = `
      <p class="muted">Word ${i + 1} of ${deck.length} · Solved: ${score}</p>
      <div class="tiles" aria-label="Scrambled letters">${scrambled.split("").map((ch) => `<span class="tile">${ch}</span>`).join("")}</div>
      <p>💡 Hint: ${item.h}</p>
      <p><input type="text" id="scr-input" maxlength="20" autocomplete="off" aria-label="Your answer" /></p>
      <div class="btn-row">
        <button class="btn primary" data-check="1">Check ✔</button>
        <button class="btn" data-first="1">First letter 🔡</button>
        <button class="btn" data-skip="1">Skip ⏭</button>
      </div>
      <p class="feedback" aria-live="polite"></p>`;
    const input = $("#scr-input", root);
    input.focus();
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
  }

  function check() {
    if (done) return;
    const item = deck[i];
    const guess = $("#scr-input", root).value.trim().toUpperCase();
    const fb = $(".feedback", root);
    if (!guess) return;
    if (guess === item.w) {
      done = true;
      score++;
      fb.className = "feedback good";
      fb.textContent = "🎉 Correct! The word is " + item.w + ".";
      nextButton();
    } else {
      fb.className = "feedback bad";
      fb.textContent = "Not yet. Try again or use the first-letter help!";
    }
  }

  function nextButton() {
    $(".btn-row", root).innerHTML = `<button class="btn primary" data-next="1">${i + 1 === deck.length ? "See result" : "Next ➜"}</button>`;
  }

  function finish() {
    saveBest("scramble", score);
    root.innerHTML = `<div class="result"><div class="big">${score}/${deck.length}</div>
      <p>${score === deck.length ? "Word wizard! 🧙" : "Nice effort! Play again for new words. 🔄"}</p>
      <button class="btn primary" data-restart="1">Play again 🔄</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const fb = $(".feedback", root);
    if (b.dataset.check) check();
    else if (b.dataset.first && !done) {
      fb.className = "feedback";
      fb.textContent = "The word starts with “" + deck[i].w[0] + "” and has " + deck[i].w.length + " letters.";
    } else if (b.dataset.skip && !done) {
      done = true;
      fb.className = "feedback bad";
      fb.textContent = "The answer was " + deck[i].w + ".";
      nextButton();
    } else if (b.dataset.next) { i++; show(); }
    else if (b.dataset.restart) start();
  });

  return { start };
})();

/* ------------------------- GAME 3: MATCH PAIRS ------------------------- */

const MatchGame = (() => {
  const root = $("#match-game");
  let cards, open, matched, moves, lock;

  function start() {
    cards = shuffle(MATCH_PAIRS.flatMap((p, idx) => [
      { id: idx, text: p.a },
      { id: idx, text: p.b }
    ]));
    open = [];
    matched = new Set();
    moves = 0;
    lock = false;
    render();
  }

  function render() {
    root.innerHTML = `<p class="muted">Moves: <span id="mv">0</span> · Pairs found: <span id="pf">0</span>/${MATCH_PAIRS.length}</p>
      <div class="match-grid">${cards.map((c, n) => `<button class="flip" data-n="${n}" aria-label="Hidden card">❓</button>`).join("")}</div>
      <p class="feedback" aria-live="polite"></p>`;
  }

  function update() {
    $("#mv", root).textContent = moves;
    $("#pf", root).textContent = matched.size;
  }

  function flip(n) {
    if (lock || open.includes(n) || matched.has(cards[n].id)) return;
    const btn = $(`[data-n="${n}"]`, root);
    btn.classList.add("open");
    btn.textContent = cards[n].text;
    btn.setAttribute("aria-label", cards[n].text);
    open.push(n);
    if (open.length < 2) return;

    moves++;
    const [a, b] = open;
    if (cards[a].id === cards[b].id) {
      matched.add(cards[a].id);
      [a, b].forEach((x) => {
        const el = $(`[data-n="${x}"]`, root);
        el.classList.remove("open");
        el.classList.add("done");
      });
      open = [];
      update();
      if (matched.size === MATCH_PAIRS.length) finish();
    } else {
      lock = true;
      setTimeout(() => {
        [a, b].forEach((x) => {
          const el = $(`[data-n="${x}"]`, root);
          el.classList.remove("open");
          el.textContent = "❓";
          el.setAttribute("aria-label", "Hidden card");
        });
        open = [];
        lock = false;
      }, 900);
      update();
    }
  }

  function finish() {
    const stars = moves <= 9 ? 3 : moves <= 13 ? 2 : 1;
    saveBest("match", stars);
    const fb = $(".feedback", root);
    fb.className = "feedback good";
    fb.innerHTML = `🎉 Done in ${moves} moves! ${"⭐".repeat(stars)}<br /><button class="btn primary" data-restart="1">Play again 🔄</button>`;
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.restart) start();
    else if (b.dataset.n !== undefined) flip(Number(b.dataset.n));
  });

  return { start };
})();

/* ------------------------- GAME 4: WORD SEARCH ------------------------- */

const SearchGame = (() => {
  const root = $("#search-game");
  const SIZE = 10;
  const DIRS = [[0, 1], [1, 0], [1, 1]]; // right, down, diagonal-down-right
  let grid, found, first;

  function build() {
    const words = SEARCH_WORDS.slice().sort((a, b) => b.length - a.length);
    for (let attempt = 0; attempt < 200; attempt++) {
      const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
      let ok = true;
      for (const w of words) {
        let placed = false;
        for (let t = 0; t < 300 && !placed; t++) {
          const [dr, dc] = DIRS[rand(DIRS.length)];
          const r = rand(SIZE);
          const c = rand(SIZE);
          const er = r + dr * (w.length - 1);
          const ec = c + dc * (w.length - 1);
          if (er >= SIZE || ec >= SIZE) continue;
          let fits = true;
          for (let k = 0; k < w.length; k++) {
            const ch = g[r + dr * k][c + dc * k];
            if (ch && ch !== w[k]) { fits = false; break; }
          }
          if (!fits) continue;
          for (let k = 0; k < w.length; k++) g[r + dr * k][c + dc * k] = w[k];
          placed = true;
        }
        if (!placed) { ok = false; break; }
      }
      if (ok) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < SIZE; r++)
          for (let c = 0; c < SIZE; c++)
            if (!g[r][c]) g[r][c] = letters[rand(26)];
        return g;
      }
    }
    return null;
  }

  function start() {
    grid = build();
    found = new Set();
    first = null;
    render();
  }

  function render() {
    const cells = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        cells.push(`<button class="cell" data-r="${r}" data-c="${c}" aria-label="Letter ${grid[r][c]}, row ${r + 1}, column ${c + 1}">${grid[r][c]}</button>`);
    root.innerHTML = `<div class="ws-wrap">
        <div class="ws-grid">${cells.join("")}</div>
        <div>
          <p><strong>Find these words:</strong></p>
          <ul class="ws-list">${SEARCH_WORDS.map((w) => `<li data-w="${w}">${w}</li>`).join("")}</ul>
          <p class="feedback" aria-live="polite"></p>
          <button class="btn small" data-restart="1">New puzzle 🔄</button>
        </div>
      </div>`;
  }

  function cellAt(r, c) {
    return $(`.cell[data-r="${r}"][data-c="${c}"]`, root);
  }

  function pick(r, c) {
    const fb = $(".feedback", root);
    if (!first) {
      first = [r, c];
      cellAt(r, c).classList.add("start");
      fb.className = "feedback";
      fb.textContent = "Now click the last letter of the word.";
      return;
    }
    const [r1, c1] = first;
    cellAt(r1, c1).classList.remove("start");
    first = null;
    if (r1 === r && c1 === c) { fb.textContent = ""; return; }

    const dr = r - r1;
    const dc = c - c1;
    if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
      fb.className = "feedback bad";
      fb.textContent = "Words only go in straight lines. Try again!";
      return;
    }
    const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const sr = Math.sign(dr);
    const sc = Math.sign(dc);
    const coords = [];
    let letters = "";
    for (let k = 0; k < len; k++) {
      coords.push([r1 + sr * k, c1 + sc * k]);
      letters += grid[r1 + sr * k][c1 + sc * k];
    }
    const reversed = letters.split("").reverse().join("");
    const word = SEARCH_WORDS.find((w) => w === letters || w === reversed);
    if (word && !found.has(word)) {
      found.add(word);
      coords.forEach(([rr, cc]) => cellAt(rr, cc).classList.add("found"));
      $(`.ws-list [data-w="${word}"]`, root).classList.add("found");
      fb.className = "feedback good";
      fb.textContent = "✅ You found " + word + "!";
      saveBest("search", found.size);
      if (found.size === SEARCH_WORDS.length) {
        fb.textContent = "🎉 Amazing! You found all the words!";
      }
    } else {
      fb.className = "feedback bad";
      fb.textContent = "That is not one of the hidden words. Try again!";
    }
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.restart) start();
    else if (b.dataset.r !== undefined) pick(Number(b.dataset.r), Number(b.dataset.c));
  });

  return { start };
})();

/* ------------------------- GAME 5: QUIZ ------------------------- */

const QuizGame = (() => {
  const root = $("#quiz-game");
  let deck, i, score, answered;

  function start() {
    deck = shuffle(QUIZ);
    i = 0;
    score = 0;
    show();
  }

  function show() {
    if (i >= deck.length) return finish();
    answered = false;
    const q = deck[i];
    root.innerHTML = `
      <p class="muted">Question ${i + 1} of ${deck.length} · Score: ${score}</p>
      <h3>${q.q}</h3>
      <div class="opts">${q.o.map((txt, n) => `<button class="opt" data-n="${n}">${txt}</button>`).join("")}</div>
      <p class="feedback" aria-live="polite"></p>
      <div class="btn-row"></div>`;
  }

  function choose(n) {
    if (answered) return;
    answered = true;
    const q = deck[i];
    const ok = n === q.a;
    if (ok) score++;
    $$(".opt", root).forEach((b, idx) => {
      b.disabled = true;
      if (idx === q.a) b.classList.add("right");
      else if (idx === n) b.classList.add("wrong");
    });
    const fb = $(".feedback", root);
    fb.className = "feedback " + (ok ? "good" : "bad");
    fb.textContent = (ok ? "✅ Correct! " : "❌ Oops! ") + q.e;
    $(".btn-row", root).innerHTML = `<button class="btn primary" data-next="1">${i + 1 === deck.length ? "See result" : "Next ➜"}</button>`;
  }

  function finish() {
    saveBest("quiz", score);
    const msg = score === deck.length ? "Perfect score! 🏆" : score >= 6 ? "Excellent! 🎉" : score >= 4 ? "Good work! Keep practising. 💪" : "Revise the Learn page and try again. 📖";
    root.innerHTML = `<div class="result"><div class="big">${score}/${deck.length}</div><p>${msg}</p>
      <button class="btn primary" data-restart="1">Try again 🔄</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.n !== undefined) choose(Number(b.dataset.n));
    else if (b.dataset.next) { i++; show(); }
    else if (b.dataset.restart) start();
  });

  return { start };
})();

/* ------------------------- START EVERYTHING ------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  SortGame.start();
  ScrambleGame.start();
  MatchGame.start();
  SearchGame.start();
  QuizGame.start();
  renderProgress();
});

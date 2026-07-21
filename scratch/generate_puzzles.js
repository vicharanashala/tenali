const fs = require('fs');
const path = require('path');

// 1. Curated list of common English words (supplement for short words not in vocab database)
const commonShortWords = {
  3: [
    "cat", "hat", "mat", "rat", "bat", "fat", "pat", "sat", "cot", "dot",
    "hot", "lot", "pot", "rot", "not", "got", "can", "fan", "man", "pan",
    "ran", "tan", "van", "ban", "pin", "tin", "win", "fin", "bin", "sin",
    "run", "sun", "fun", "gun", "bun", "pun", "nix", "mix", "six", "fix",
    "pig", "dig", "wig", "big", "fig", "jig", "car", "bar", "far", "jar",
    "tar", "war", "ear", "yet", "wet", "pet", "net", "let", "met", "set",
    "get", "bet", "jet", "day", "lay", "may", "pay", "ray", "say", "way",
    "hay", "bay", "toy", "boy", "joy", "coy", "soy", "bad", "sad", "mad",
    "had", "pad", "lad", "fad", "dad", "lid", "kid", "hid", "rid", "bid",
    "did", "zip", "lip", "rip", "tip", "sip", "dip", "hip", "nip"
  ],
  4: [
    "cake", "bake", "lake", "make", "take", "rake", "wake", "sake", "fake", "gate",
    "rate", "late", "mate", "date", "fate", "hate", "cave", "wave", "save", "pave",
    "gave", "rave", "case", "base", "vase", "ease", "came", "game", "tame", "fame",
    "same", "name", "cage", "page", "sage", "rage", "wage", "care", "bare", "dare",
    "fare", "hare", "rare", "ware", "book", "look", "cook", "hook", "took", "nook",
    "ball", "call", "fall", "hall", "tall", "wall", "mall", "pine", "line", "fine",
    "mine", "nine", "dine", "wine", "zone", "bone", "cone", "tone", "lone", "done",
    "sing", "ring", "wing", "king", "ping", "song", "long", "dong", "bong", "wind",
    "find", "mind", "kind", "bind", "fold", "cold", "bold", "gold", "hold", "told",
    "best", "west", "nest", "pest", "test", "rest", "vest", "dust", "rust", "must"
  ],
  5: [
    "house", "mouse", "louse", "rouse", "blaze", "glaze", "craze", "graze", "place",
    "plane", "plate", "slate", "crate", "grate", "share", "spare", "stare", "flare",
    "chase", "phase", "shave", "brave", "crave", "grave", "dread", "bread", "tread",
    "brick", "trick", "prick", "click", "slide", "glide", "pride", "bride", "guide",
    "clash", "flash", "trash", "smash", "crash", "beach", "peach", "reach", "teach",
    "clock", "block", "flock", "shock", "stock", "track", "black", "crack", "shack",
    "sweet", "sheet", "fleet", "greet", "drink", "think", "blink", "shrink", "clink"
  ]
};

// 2. Load vocabulary words from questions/vocab/
function loadVocabWords() {
  const vocabDir = path.join(__dirname, '..', 'questions', 'vocab');
  const words = [];
  
  if (!fs.existsSync(vocabDir)) {
    console.warn("questions/vocab directory not found.");
    return words;
  }
  
  const files = fs.readdirSync(vocabDir).filter(f => f.endsWith('.json'));
  for (let file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(vocabDir, file), 'utf8'));
      if (content.word) {
        words.push({
          word: content.word.trim().toLowerCase(),
          definition: content.answerText || content.definition || ""
        });
      }
    } catch (e) {
      // skip
    }
  }
  return words;
}

const { levelMap } = require('../server/wordCreator.js');

function run() {
  console.log("Loading vocab words...");
  const vocabWords = loadVocabWords();
  console.log(`Loaded ${vocabWords.length} vocabulary words.`);

  // Clear old pre-seeded cache files to ensure only real API definitions are used
  const cacheDir = path.join(__dirname, '..', 'server', 'dictionaryCache');
  if (fs.existsSync(cacheDir)) {
    console.log("Cleaning old dictionary cache to reset parts of speech...");
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
  fs.mkdirSync(cacheDir, { recursive: true });

  // Build combined dictionary for puzzle pattern generation
  const dictionary = {};
  for (let len in commonShortWords) {
    dictionary[len] = commonShortWords[len].map(w => ({ word: w }));
  }

  for (let item of vocabWords) {
    const len = item.word.length;
    if (len >= 3 && len <= 10) {
      if (!dictionary[len]) dictionary[len] = [];
      if (!dictionary[len].some(w => w.word === item.word)) {
        dictionary[len].push({ word: item.word });
      }
    }
  }

  const finalPuzzles = {};

  for (let lvlStr in levelMap) {
    const lvl = Number(lvlStr);
    const config = levelMap[lvl];
    const len = config.length;
    const blanks = config.blanks;
    
    console.log(`Generating unique puzzles for Level ${lvl} (length: ${len}, blanks: ${blanks})...`);

    const wordPool = dictionary[len] || [];
    if (wordPool.length === 0) {
      console.error(`No words found for length ${len}!`);
      continue;
    }

    const uniquePatterns = new Set();
    const puzzlesList = [];
    const combinationsToTry = 10;

    const sortedWords = [...wordPool];
    sortedWords.sort((a, b) => {
      let hashA = 0, hashB = 0;
      for (let i = 0; i < a.word.length; i++) hashA += a.word.charCodeAt(i);
      for (let i = 0; i < b.word.length; i++) hashB += b.word.charCodeAt(i);
      return (hashA * 31 % 100) - (hashB * 31 % 100);
    });

    for (let wordObj of sortedWords) {
      if (puzzlesList.length >= 100) break;

      const word = wordObj.word;
      
      for (let attempt = 0; attempt < combinationsToTry; attempt++) {
        if (puzzlesList.length >= 100) break;

        const indices = [];
        let seed = lvl * 1000 + word.length + attempt + word.charCodeAt(0);
        while (indices.length < blanks) {
          seed = (seed * 9301 + 49297) % 233280;
          const idx = Math.floor((seed / 233280) * len);
          if (!indices.includes(idx)) indices.push(idx);
        }
        indices.sort((a, b) => a - b);

        const patArr = word.split("");
        indices.forEach(i => patArr[i] = "_");
        const pattern = patArr.join("");

        if (uniquePatterns.has(pattern)) continue;

        const matches = [];
        const regexStr = "^" + pattern.replace(/_/g, ".") + "$";
        const regex = new RegExp(regexStr);

        for (let otherWord of wordPool) {
          if (regex.test(otherWord.word)) {
            matches.push(otherWord.word);
          }
        }

        const minMatches = (blanks <= 2 && len <= 6) ? 3 : ((len >= 8) ? 1 : 2);

        if (matches.length >= minMatches) {
          uniquePatterns.add(pattern);
          puzzlesList.push({
            pattern: pattern,
            blankIndices: indices,
            solutions: matches
          });
        }
      }
    }

    if (puzzlesList.length < 100) {
      console.log(`  Level ${lvl} got only ${puzzlesList.length} puzzles. Running fallback pass...`);
      for (let wordObj of sortedWords) {
        if (puzzlesList.length >= 100) break;

        const word = wordObj.word;
        for (let attempt = 0; attempt < combinationsToTry; attempt++) {
          if (puzzlesList.length >= 100) break;

          const indices = [];
          let seed = lvl * 5000 + word.length + attempt + word.charCodeAt(0);
          while (indices.length < blanks) {
            seed = (seed * 9301 + 49297) % 233280;
            const idx = Math.floor((seed / 233280) * len);
            if (!indices.includes(idx)) indices.push(idx);
          }
          indices.sort((a, b) => a - b);

          const patArr = word.split("");
          indices.forEach(i => patArr[i] = "_");
          const pattern = patArr.join("");

          if (uniquePatterns.has(pattern)) continue;

          const matches = [];
          const regexStr = "^" + pattern.replace(/_/g, ".") + "$";
          const regex = new RegExp(regexStr);

          for (let otherWord of wordPool) {
            if (regex.test(otherWord.word)) {
              matches.push(otherWord.word);
            }
          }

          if (matches.length >= 1) {
            uniquePatterns.add(pattern);
            puzzlesList.push({
              pattern: pattern,
              blankIndices: indices,
              solutions: matches
            });
          }
        }
      }
    }

    console.log(`  Level ${lvl} successfully generated ${puzzlesList.length} unique, verified puzzles.`);
    finalPuzzles[lvl] = puzzlesList;
  }

  const outPath = path.join(__dirname, '..', 'server', 'wordCreatorPuzzles.json');
  fs.writeFileSync(outPath, JSON.stringify(finalPuzzles, null, 2), 'utf8');
  console.log(`Puzzles database successfully saved to ${outPath}!`);
}

run();

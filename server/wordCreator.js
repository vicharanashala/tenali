const fs = require('fs');
const path = require('path');

// Curated vocabulary words of varying lengths (3 to 10 characters)
const VOCAB = [
  // 3 letters
  "cat", "dog", "sun", "run", "map", "pen", "hat", "cap", "bat", "rat", "pig", "cow", "fly", "sky", "ice", "hot", "bad", "new", "old", "red", "big", "try", "buy", "pay", "cry", "dry", "wet", "fit", "sit", "box", "toy", "joy", "boy", "key", "car", "bus", "cup", "mug", "pot", "pan", "fan", "net", "web", "sea", "air", "day", "art", "row", "win", "log", "fun", "top", "son",
  // 4 letters
  "blue", "wind", "rain", "snow", "fire", "land", "rock", "sand", "lake", "pond", "fish", "bird", "frog", "deer", "bear", "lion", "wolf", "duck", "star", "moon", "ship", "boat", "yard", "farm", "park", "road", "path", "gate", "wall", "roof", "door", "desk", "book", "page", "bell", "ring", "song", "play", "game", "ball", "card", "coin", "gold", "tree", "leaf", "root", "seed", "rose", "wood", "back", "body", "busy", "call", "care", "city", "cold", "cook", "cool", "cost", "dark", "deep", "drop", "dust", "duty", "east", "easy", "face", "fact", "fair", "fast", "fear", "find", "fine", "food", "free", "gift", "girl", "grow", "hair", "half", "hand", "hard", "head", "hear", "help", "high", "hill", "hold", "home", "hope", "hour", "hurt", "idea", "iron", "join", "jump", "keep", "kind", "king", "knew", "know", "lady", "late", "lead", "left", "life", "lift", "line", "list", "live", "long", "look", "lost", "love", "luck", "make", "many", "mark", "meat", "meet", "mind", "miss", "more", "most", "move", "much", "name", "near", "need", "news", "next", "nice", "noon", "nose", "note", "once", "open", "page", "pain", "pair", "part", "past", "path", "plan", "play", "poem", "poor", "post", "pull", "pure", "push", "race", "read", "real", "rich", "ride", "ring", "rise", "road", "rock", "roof", "room", "root", "rose", "rule", "safe", "sale", "salt", "same", "sand", "save", "seat", "seed", "seem", "self", "send", "ship", "shoe", "shop", "show", "side", "sign", "sing", "size", "skin", "slip", "slow", "snow", "soft", "song", "soon", "soul", "star", "stay", "step", "stop", "such", "sure", "swim", "take", "talk", "tall", "team", "tell", "test", "than", "that", "them", "then", "thin", "this", "time", "tiny", "tool", "town", "tree", "true", "turn", "unit", "upon", "very", "view", "wait", "walk", "wall", "want", "warm", "wash", "wave", "wear", "week", "well", "went", "west", "what", "when", "wide", "wife", "wild", "will", "wind", "wine", "wing", "wish", "with", "wood", "word", "work", "yard", "year", "zero",
  // 5 letters
  "green", "water", "earth", "stone", "grass", "plant", "fruit", "apple", "grape", "melon", "peach", "berry", "onion", "bread", "honey", "sugar", "flour", "juice", "drink", "sleep", "dream", "smile", "laugh", "happy", "brave", "smart", "quick", "clean", "fresh", "sweet", "light", "shadow", "cloud", "storm", "beach", "river", "ocean", "house", "cabin", "table", "chair", "clock", "watch", "paper", "brush", "paint", "music", "dance", "actor", "stage",
  // 6 letters
  "yellow", "forest", "jungle", "desert", "valley", "canyon", "stream", "bridge", "castle", "temple", "market", "office", "museum", "camera", "pencil", "eraser", "marker", "violin", "guitar", "singer", "writer", "doctor", "nurse", "farmer", "baker", "driver", "pilot", "worker", "player", "runner", "winner", "leader", "helper", "friend", "family", "summer", "winter", "autumn", "spring", "nature", "animal", "monkey", "orange", "purple", "silver", "golden", "shadow", "flight", "beauty",
  // 7 letters
  "rainbow", "weather", "mountain", "meadow", "pasture", "cottage", "village", "pathway", "journey", "holiday", "concert", "theatre", "gallery", "station", "airport", "kitchen", "bedroom", "hallway", "blanket", "lantern", "compass", "picture", "science", "history", "biology", "physics", "teacher", "student", "captain", "soldier", "sailor", "running", "jumping", "swimming", "singing", "dancing", "reading", "writing", "playing", "working", "helping", "sharing", "caring", "smiling", "laughing", "healthy", "wealthy", "freedom",
  // 8 letters
  "sunshine", "rainstorm", "snowfall", "blizzard", "woodland", "farmyard", "backyard", "fountain", "painting", "drawings", "musician", "composer", "director", "inventor", "designer", "engineer", "mechanic", "merchant", "traveler", "explorer", "detective", "reporter", "governor", "emperor", "monastery", "hospital", "pharmacy", "building", "elevator", "computer", "notebook", "calendar", "document", "language", "alphabet", "sentence", "learning", "teaching", "friendly", "cheerful", "peaceful", "graceful", "powerful", "creative", "artistic", "athletic", "muscular", "dramatic", "sculpture",
  // 9 letters
  "beautiful", "wonderful", "brilliant", "excellent", "delicious", "different", "difficult", "important", "necessary", "dangerous", "adventure", "discovery", "invention", "education", "classroom", "librarian", "professor", "astronaut", "scientist", "physicist", "chemist", "architect", "developer", "programmer", "conductor", "performer", "decorator", "gardener", "carpenter", "president", "character", "celebrate", "challenge", "knowledge", "structure", "substance", "community", "neighbour", "yesterday", "apartment", "treatment", "agreement", "equipment", "statement", "signature", "authority", "committee", "confusion", "operation",
  // 10 letters
  "everything", "everywhere", "understand", "experience", "experiment", "government", "university", "department", "literature", "journalism", "television", "microphone", "headphones", "dictionary", "calculator", "blackboard", "playground", "greenhouse", "wilderness", "navigation", "atmosphere", "astronomy", "successful", "thoughtful", "delightful", "incredible", "impossible", "mysterious", "historical", "electronic", "conference", "discussion", "management", "population", "technology", "production", "collection", "investment", "commercial", "particular"
];

// Linear Congruential Generator (LCG) for deterministic pseudo-random choices
function createRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Helper to generate all combinations of size k from n elements (indices 0 to n-1)
function getCombinations(n, k) {
  const result = [];
  function helper(start, path) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < n; i++) {
      path.push(i);
      helper(i + 1, path);
      path.pop();
    }
  }
  helper(0, []);
  return result;
}

// Generate the 20 unique puzzles for a specific level based on pre-generated database files
function getPuzzlesForLevel(level) {
  try {
    const puzzleFilePath = path.join(__dirname, '..', 'questions', 'language', `wordCreator_level_${level}.json`);
    if (fs.existsSync(puzzleFilePath)) {
      const fileData = fs.readFileSync(puzzleFilePath, 'utf8');
      const data = JSON.parse(fileData);
      return data.slice(0, 20);
    }
  } catch (err) {
    console.error(`Error reading level ${level} puzzles file:`, err);
  }

  // Dynamic fallback generator if database file is not found (ensure offline resilience)
  const rng = createRandom(level * 555);
  
  // Map level to length and blanksCount
  const rules = {
    1: { length: 3, blanks: 1 },
    2: { length: 3, blanks: 2 },
    3: { length: 4, blanks: 1 },
    4: { length: 4, blanks: 2 },
    5: { length: 5, blanks: 1 },
    6: { length: 5, blanks: 2 },
    7: { length: 5, blanks: 3 },
    8: { length: 6, blanks: 2 },
    9: { length: 6, blanks: 3 },
    10: { length: 6, blanks: 4 },
    11: { length: 7, blanks: 2 },
    12: { length: 7, blanks: 3 },
    13: { length: 7, blanks: 4 },
    14: { length: 8, blanks: 2 },
    15: { length: 8, blanks: 3 },
    16: { length: 8, blanks: 4 },
    17: { length: 9, blanks: 3 },
    18: { length: 9, blanks: 4 },
    19: { length: 10, blanks: 3 },
    20: { length: 10, blanks: 4 }
  };

  const rule = rules[level] || { length: 5, blanks: 2 };
  const targetLen = rule.length;
  const blanksCount = rule.blanks;

  const validWords = VOCAB.filter(w => w.length === targetLen);
  
  // Shuffle words deterministically using LCG to select a broad, unique set of words
  const shuffledWords = [...validWords];
  for (let k = shuffledWords.length - 1; k > 0; k--) {
    const j = Math.floor(rng() * (k + 1));
    [shuffledWords[k], shuffledWords[j]] = [shuffledWords[j], shuffledWords[k]];
  }

  const puzzles = [];
  const patternsSeen = new Set();
  let wordIndex = 0;

  while (puzzles.length < 20 && wordIndex < shuffledWords.length) {
    const word = shuffledWords[wordIndex];
    wordIndex++;

    // Generate all possible blank index combinations for targetLen and blanksCount
    const possibleCombinations = getCombinations(targetLen, blanksCount);
    // Shuffle the combinations deterministically to randomize blank positions
    for (let k = possibleCombinations.length - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [possibleCombinations[k], possibleCombinations[j]] = [possibleCombinations[j], possibleCombinations[k]];
    }

    let bestPattern = null;
    let bestBlankIndices = null;
    let bestSolutions = [];
    let maxMatches = -1;

    // Try combinations to find the pattern that maximizes VOCAB matches (allowing multiple word creations)
    for (const blankIndices of possibleCombinations) {
      const patternChars = word.split("");
      blankIndices.forEach(idx => {
        patternChars[idx] = "_";
      });
      const pattern = patternChars.join("");

      if (patternsSeen.has(pattern)) continue;

      // Find all vocabulary words matching this pattern
      const matches = VOCAB.filter(w => {
        if (w.length !== targetLen) return false;
        for (let i = 0; i < targetLen; i++) {
          if (pattern[i] !== '_' && pattern[i].toLowerCase() !== w[i].toLowerCase()) {
            return false;
          }
        }
        return true;
      });

      // We want to prioritize patterns that allow multiple words (at least 2 if possible, or more)
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        bestPattern = pattern;
        bestBlankIndices = blankIndices;
        bestSolutions = matches;
        
        // If we found a pattern with at least 3 matches (or 2 for longer words), that's perfect!
        const targetMin = targetLen <= 5 ? 3 : 2;
        if (matches.length >= targetMin) {
          break;
        }
      }
    }

    if (bestPattern) {
      patternsSeen.add(bestPattern);
      puzzles.push({
        id: puzzles.length + 1,
        pattern: bestPattern,
        length: targetLen,
        blanksCount: blanksCount,
        blankIndices: bestBlankIndices,
        solutions: bestSolutions
      });
    }
  }

  // Double fallback: if unique pattern limit couldn't be reached because of constraint density,
  // append non-unique entries deterministically to ensure we always have 20 playable puzzles.
  if (puzzles.length < 20) {
    let fallbackIdx = 0;
    while (puzzles.length < 20 && fallbackIdx < shuffledWords.length) {
      const word = shuffledWords[fallbackIdx];
      fallbackIdx++;
      
      const possibleCombinations = getCombinations(targetLen, blanksCount);
      const blankIndices = possibleCombinations[0] || Array.from({ length: blanksCount }, (_, k) => k);
      
      const patternChars = word.split("");
      blankIndices.forEach(idx => {
        patternChars[idx] = "_";
      });
      const pattern = patternChars.join("");

      // Find matches for solutions list
      const matches = VOCAB.filter(w => {
        if (w.length !== targetLen) return false;
        for (let i = 0; i < targetLen; i++) {
          if (pattern[i] !== '_' && pattern[i].toLowerCase() !== w[i].toLowerCase()) {
            return false;
          }
        }
        return true;
      });

      puzzles.push({
        id: puzzles.length + 1,
        pattern: pattern,
        length: targetLen,
        blanksCount: blanksCount,
        blankIndices: blankIndices,
        solutions: matches
      });
    }
  }

  return puzzles;
}

module.exports = {
  getPuzzlesForLevel
};

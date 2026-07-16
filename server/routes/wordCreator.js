const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const wordCreator = require('../wordCreator');

/**
 * GET /wordcreator-api/question
 * Fetches the pattern and blank indices for the requested level and puzzle index.
 */
router.get('/question', (req, res) => {
  const level = parseInt(req.query.level, 10) || 1;
  const index = parseInt(req.query.index, 10) || 1;
  const puzzles = wordCreator.getPuzzlesForLevel(level);
  
  // Wrap index safely between 1 and 100
  const targetIdx = Math.max(1, Math.min(100, index)) - 1;
  const puzzle = puzzles[targetIdx] || puzzles[0];
  res.json(puzzle);
});

/**
 * POST /wordcreator-api/check
 * Verifies if the user's completed word is valid using length checks and dictionaryAPI validation.
 */
router.post('/check', express.json(), async (req, res) => {
  const { word, pattern, level, index } = req.body;
  const cleanWord = (word || '').trim().toLowerCase();
  
  if (!cleanWord) {
    return res.json({ correct: false, reason: "No word submitted." });
  }

  // 1. Verify pattern matches length and character alignment
  if (pattern && pattern.length !== cleanWord.length) {
    return res.json({ correct: false, reason: `Word length must be exactly ${pattern.length} characters.` });
  }
  if (pattern) {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== '_' && pattern[i].toLowerCase() !== cleanWord[i]) {
        return res.json({ correct: false, reason: `Word does not match the puzzle pattern.` });
      }
    }
  }

  // 1.5 Check if it's a known vocab solution for this puzzle pattern (guarantees instant correct checks)
  let isKnownVocab = false;
  if (level && index) {
    try {
      const puzzles = wordCreator.getPuzzlesForLevel(parseInt(level, 10));
      const targetIdx = Math.max(1, Math.min(100, parseInt(index, 10))) - 1;
      const puzzle = puzzles[targetIdx];
      if (puzzle && puzzle.solutions) {
        isKnownVocab = puzzle.solutions.some(s => s.toLowerCase() === cleanWord);
      }
    } catch (e) {
      console.error("Failed to check puzzle solutions:", e);
    }
  }

  // 2. Offline check against cached dictionary definition
  const cacheDir = path.join(__dirname, '..', 'dictionaryCache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cacheFilePath = path.join(cacheDir, `${cleanWord}.json`);

  let dictData = null;

  if (fs.existsSync(cacheFilePath)) {
    try {
      const raw = fs.readFileSync(cacheFilePath, 'utf8');
      dictData = JSON.parse(raw);
    } catch (e) {
      console.error("Cache read error:", e);
    }
  }

  let isNetworkError = false;

  if (!dictData) {
    // Online check with a shortened 1.8-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    try {
      const apiRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const body = await apiRes.json();
        if (Array.isArray(body) && body.length > 0) {
          dictData = body;
          // Save to cache
          fs.writeFileSync(cacheFilePath, JSON.stringify(body, null, 2), 'utf8');
        }
      } else if (apiRes.status !== 404) {
        // Any error status other than 404 (Not Found) is treated as a network/server issue
        isNetworkError = true;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Dictionary API call error:", err);
      isNetworkError = true;
    }
  }

  if (dictData && dictData.length > 0) {
    const meanings = dictData[0].meanings || [];
    let partOfSpeech = '';
    let definition = 'No definition available.';
    
    if (meanings.length > 0) {
      partOfSpeech = meanings[0].partOfSpeech || '';
      const defs = meanings[0].definitions || [];
      if (defs.length > 0) {
        definition = defs[0].definition || '';
      }
    }
    
    const phonetics = dictData[0].phonetics || [];
    const phonetic = phonetics.length > 0 ? phonetics[0].text : '';

    return res.json({
      correct: true,
      word: cleanWord,
      partOfSpeech,
      definition,
      phonetic
    });
  }

  // Fallback for offline/timeout vocab check if it's a known solution
  if (isKnownVocab) {
    return res.json({
      correct: true,
      word: cleanWord,
      partOfSpeech: 'noun',
      definition: 'A valid vocabulary word matching the puzzle pattern.',
      phonetic: ''
    });
  }

  if (isNetworkError) {
    return res.json({
      correct: false,
      isNetworkError: true,
      reason: "Could not check the word due to a network error. Please try again."
    });
  }

  res.json({ correct: false, reason: `"${cleanWord.toUpperCase()}" is not registered in the dictionary.` });
});

module.exports = router;

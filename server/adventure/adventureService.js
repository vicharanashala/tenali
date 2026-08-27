/**
 * TENALI ADVENTURE GAME - SERVICE
 * ══════════════════════════════════════════════════════════════════════
 * Core service: level sessions, thoughts/clues, hints, guesses, progress.
 *
 * DATA MODEL NOTES
 * ----------------
 * concepts.json supports two clue formats:
 *   - thoughts[]  child-friendly "Tenali thinking" voice (Grades 1-3)
 *   - clues[]     standard textbook voice (older students)
 * The service prefers thoughts over clues when both are present.
 *
 * Each concept may also have:
 *   - hint        single friendly hint string  (preferred)
 *   - hints[]     older array format           (fallback: first element used)
 */

'use strict';

const config = require('./adventureConfig');
const kb = require('./adventureKB');
const sessionManager = require('./adventureSessionManager');
const progressService = require('./adventureProgressService');
const bossEngine = require('./bossEngine');
const reviewService = require('./reviewService');

class AdventureService {
  // ── Game data ────────────────────────────────────────────────────────────

  async getGameData(userContext, guestProgressPayload) {
    const progress = await progressService.getProgress(userContext, guestProgressPayload);
    const worlds   = kb.getWorlds();
    const levels   = kb.getLevels();
    const concepts = kb.getConcepts();

  


    const enrichedWorlds = worlds.map(w => {
      const worldLevels   = levels.filter(l => l.worldId === w.id);
      const completedCount = worldLevels.filter(l => progress.completedLevels.includes(l.id)).length;
      const isUnlocked    = w.id === 'number_kingdom' || w.isUnlocked || (progress.unlockedWorlds || []).includes(w.id);
      return {
        ...w,
        isUnlocked,
        totalLevels:        worldLevels.length,
        completedLevelsCount: completedCount,
        progressPercent:    worldLevels.length > 0
          ? Math.round((completedCount / worldLevels.length) * 100)
          : 0
      };
    });

    return {
      worlds:   enrichedWorlds,
      levels,
      concepts: concepts.map(c => ({ id: c.id, name: c.name, subject: c.subject })),
      progress
    };
  }

  // ── Start level ──────────────────────────────────────────────────────────

  async startLevel(userContext, levelId) {
    const level = kb.getLevelById(levelId);
    if (!level) {
      const err = new Error(`Level '${levelId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const concept = kb.getConceptById(level.conceptId);
    if (!concept) {
      const err = new Error(`Concept for level '${levelId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const session = sessionManager.createSession({
      userId:    userContext ? userContext._id : null,
      levelId:   level.id,
      conceptId: concept.id,
      isBoss:    level.isBoss
    });

    // Prefer thoughts (child-friendly), fall back to clues
    const allClues = level.isBoss
      ? bossEngine.generateBossClues(level)
      : (concept.thoughts || concept.clues || [`I am ${concept.name}.`]);

    sessionManager.updateSession(session.sessionId, {
      allClues,
      revealedClues:   [allClues[0]],
      currentClueIndex: 0
    });

    // Does this concept use the child-friendly thoughts voice?
    const useThoughts = !!(concept.thoughts && concept.thoughts.length > 0);

    return {
      sessionId:   session.sessionId,
      levelId:     level.id,
      worldId:     level.worldId,
      levelNumber: level.levelNumber,
      isBoss:      level.isBoss,
      firstClue:   allClues[0],
      clueNumber:  1,
      totalClues:  allClues.length,
      useThoughts               // tells client to show "Tenali's Thought" label
    };
  }

  // ── Next clue ────────────────────────────────────────────────────────────

  async getNextClue(sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      const err = new Error('Invalid or expired gameplay session.');
      err.statusCode = 404;
      throw err;
    }
    if (session.completed) {
      const err = new Error('This gameplay session has already ended.');
      err.statusCode = 400;
      throw err;
    }

    const nextIndex = session.currentClueIndex + 1;

    if (nextIndex >= session.allClues.length) {
      // Already on last clue — return it again with hasMoreClues:false
      return {
        hasMoreClues: false,
        clue:         session.allClues[session.currentClueIndex],
        clueNumber:   session.currentClueIndex + 1,
        totalClues:   session.allClues.length
      };
    }

    const nextClue = session.allClues[nextIndex];
    sessionManager.updateSession(sessionId, {
      currentClueIndex: nextIndex,
      revealedClues: [...session.revealedClues, nextClue]
    });

    return {
      hasMoreClues: nextIndex < session.allClues.length - 1,
      clue:         nextClue,
      clueNumber:   nextIndex + 1,
      totalClues:   session.allClues.length
    };
  }

  // ── Hint ─────────────────────────────────────────────────────────────────

  async getHint(sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      const err = new Error('Invalid or expired gameplay session.');
      err.statusCode = 404;
      throw err;
    }

    const concept = kb.getConceptById(session.conceptId);

    // Prefer single `hint` string (World 1 child-friendly format)
    const hintText = (concept && concept.hint)
      || (concept && Array.isArray(concept.hints) && concept.hints.length > 0
          ? concept.hints[0]
          : 'Think about what makes this concept special.');

    if (!session.hintsUsed.includes(hintText)) {
      sessionManager.updateSession(sessionId, {
        hintsUsed: [...session.hintsUsed, hintText]
      });
    }

    return { hint: hintText };
  }

  // ── Submit guess ─────────────────────────────────────────────────────────

  async submitGuess(sessionId, guessConceptId, userContext, guestProgressPayload) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      const err = new Error('Invalid or expired gameplay session.');
      err.statusCode = 404;
      throw err;
    }
    if (session.completed) {
      const err = new Error('This gameplay session has already concluded.');
      err.statusCode = 400;
      throw err;
    }

    const targetConcept = kb.getConceptById(session.conceptId);

    const isCorrect = session.isBoss
      ? bossEngine.validateBossGuess(session.conceptId, guessConceptId)
      : (targetConcept && (
          targetConcept.id === guessConceptId ||
          targetConcept.name.toLowerCase() === String(guessConceptId).toLowerCase()
        ));

    const currentProgress = await progressService.getProgress(userContext, guestProgressPayload);

    // ── Correct guess ──────────────────────────────────────────────────────
    if (isCorrect) {
      sessionManager.endSession(sessionId, 'win');

      // Stars & XP
      let stars    = 1;
      let xpGained = config.BASE_LEVEL_XP;

      if (session.isBoss) {
        const rewards = bossEngine.calculateBossRewards(session.currentClueIndex + 1, session.hintsUsed.length);
        stars    = rewards.stars;
        xpGained = rewards.xpGained;
      } else {
        const clueCount = session.currentClueIndex + 1;
        const hintCount = session.hintsUsed.length;
        if (clueCount <= config.STARS_RULES.THREE_STARS_MAX_CLUES && hintCount === 0) {
          stars = 3;
        } else if (clueCount <= config.STARS_RULES.TWO_STARS_MAX_CLUES) {
          stars = 2;
        }
      }

      // Update progress
      const levelId           = session.levelId;
      const completedSet      = new Set(currentProgress.completedLevels);
      completedSet.add(levelId);

      const levelStarsMap     = { ...currentProgress.levelStars };
      levelStarsMap[levelId]  = Math.max(levelStarsMap[levelId] || 0, stars);
      const newTotalStars     = Object.values(levelStarsMap).reduce((s, v) => s + v, 0);

      // Unlock next world when a boss level is cleared
      const currentLevel      = kb.getLevelById(levelId);
      const unlockedSet       = new Set(currentProgress.unlockedWorlds);
      if (currentLevel && currentLevel.isBoss) {
        const allWorlds  = kb.getWorlds();
        const worldIdx   = allWorlds.findIndex(w => w.id === currentLevel.worldId);
        if (worldIdx !== -1 && worldIdx < allWorlds.length - 1) {
          unlockedSet.add(allWorlds[worldIdx + 1].id);
        }
      }

      const updatedProgress = {
        xp:               currentProgress.xp + xpGained,
        totalStars:       newTotalStars,
        completedLevels:  Array.from(completedSet),
        unlockedWorlds:   Array.from(unlockedSet),
        levelStars:       levelStarsMap,
        highestScore:     Math.max(currentProgress.highestScore, currentProgress.xp + xpGained)
      };

      const savedProgress = await progressService.saveProgress(userContext, updatedProgress);
      const review        = reviewService.generateReview(session.conceptId);
      const nextLevel     = kb.getNextLevel(levelId);

      return {
        correct:        true,
        ended:          true,
        stars,
        xpGained,
        correctConcept: targetConcept,
        review,
        progress:       savedProgress,
        nextLevelId:    nextLevel ? nextLevel.id : null
      };
    }

    // ── Incorrect guess ────────────────────────────────────────────────────
    const isFinalClue = session.currentClueIndex >= session.allClues.length - 1;
    if (isFinalClue) {
      sessionManager.endSession(sessionId, 'loss');
      const review = reviewService.generateReview(session.conceptId);
      return {
        correct:        false,
        ended:          true,
        correctConcept: targetConcept,
        review,
        progress:       currentProgress
      };
    }

    return {
      correct: false,
      ended:   false,
      message: 'Not quite! Try the next thought.'
    };
  }

  // ── Continue adventure ───────────────────────────────────────────────────

  async getContinueLevel(userContext, guestProgressPayload) {
    const progress = await progressService.getProgress(userContext, guestProgressPayload);
    const levels   = kb.getLevels();

    for (const level of levels) {
      if (!progress.completedLevels.includes(level.id)) {
        return { levelId: level.id, worldId: level.worldId, levelNumber: level.levelNumber };
      }
    }

    const lastLevel = levels[levels.length - 1];
    return lastLevel
      ? { levelId: lastLevel.id, worldId: lastLevel.worldId, levelNumber: lastLevel.levelNumber }
      : null;
  }
}

module.exports = new AdventureService();



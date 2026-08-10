const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { LearningJourneyProgress } = require('./models');
const { JOURNEY_CURRICULUM } = require('./journeyData');

const PORT = process.env.PORT || 4000;

// ─── In-Memory Journey Progress Fallback ────────────────────────────────────
const JOURNEY_DB_FILE = path.join(__dirname, 'in_memory_journey_progress.json');
const inMemoryJourneyProgress = {};

function createInMemoryProgressObject(userId, existing = {}) {
  const latestCheckpointScoreObj = existing.latestCheckpointScore || {};
  return {
    userId,
    completedConcepts: existing.completedConcepts || [],
    completedTopics: existing.completedTopics || [],
    conceptsNeedingRevision: existing.conceptsNeedingRevision || [],
    checkpointAttempts: existing.checkpointAttempts || [],
    latestCheckpointScore: {
      get: (key) => latestCheckpointScoreObj[key] || null,
      set: (key, val) => { latestCheckpointScoreObj[key] = val; },
      keys: () => Object.keys(latestCheckpointScoreObj)
    },
    activeCheckpoint: existing.activeCheckpoint || null,
    save: async function() {
      inMemoryJourneyProgress[userId] = this;
      saveInMemoryJourney();
      return this;
    }
  };
}

function loadInMemoryJourney() {
  try {
    if (fs.existsSync(JOURNEY_DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(JOURNEY_DB_FILE, 'utf8'));
      for (const [userId, prog] of Object.entries(data)) {
        inMemoryJourneyProgress[userId] = createInMemoryProgressObject(userId, prog);
      }
    }
  } catch (err) {
    console.error('[learning-journey] Failed to load in-memory progress:', err.message);
  }
}

function saveInMemoryJourney() {
  try {
    const cleaned = {};
    for (const [userId, prog] of Object.entries(inMemoryJourneyProgress)) {
      const clone = { ...prog };
      delete clone.save;
      const scores = {};
      if (prog.latestCheckpointScore && typeof prog.latestCheckpointScore.keys === 'function') {
        for (const k of prog.latestCheckpointScore.keys()) {
          scores[k] = prog.latestCheckpointScore.get(k);
        }
      }
      clone.latestCheckpointScore = scores;
      cleaned[userId] = clone;
    }
    fs.writeFileSync(JOURNEY_DB_FILE, JSON.stringify(cleaned, null, 2), 'utf8');
  } catch (err) {
    console.error('[learning-journey] Failed to save in-memory progress:', err.message);
  }
}

loadInMemoryJourney();

// Helper to get topic index and data by ID
function getTopicData(topicId) {
  const index = JOURNEY_CURRICULUM.findIndex(t => t.id === topicId);
  return { index, topic: JOURNEY_CURRICULUM[index] };
}

// Fetch helper that runs loopback requests to reuse monolithic question generators
async function getQuestionForConcept(conceptKey) {
  // Client-side only apps: return a standard mock question
  if (conceptKey === 'spot' || conceptKey === 'guess') {
    return {
      id: `${conceptKey}-${Date.now()}-${Math.random()}`,
      prompt: conceptKey === 'spot' ? "Find the twin in: [🍎, 🍌, 🍒] and [🍒, 🍇, 🍉]" : "Think of a number between 0 and 31. What is 2^3?",
      answer: conceptKey === 'spot' ? "🍒" : "8",
      options: conceptKey === 'spot' ? ["🍎", "🍌", "🍒", "🍇"] : ["4", "8", "16", "32"]
    };
  }

  let endpoint = `${conceptKey}-api`;
  if (conceptKey === 'circleth') {
    endpoint = 'circle-api';
  } else if (conceptKey === 'gk') {
    endpoint = 'gk-api';
  } else if (conceptKey === 'vocab') {
    endpoint = 'vocab-api';
  }

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/${endpoint}/question`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();

    let ans = data.answer !== undefined ? data.answer : (data.correctAnswer !== undefined ? data.correctAnswer : (data.definition || ""));
    
    // If the generator doesn't expose the correct answer in the GET response, resolve it via the check API with solve=true
    if (ans === "") {
      try {
        const checkRes = await fetch(`http://127.0.0.1:${PORT}/${endpoint}/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, solve: true })
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          ans = checkData.correctAnswer !== undefined ? checkData.correctAnswer : (checkData.display !== undefined ? checkData.display : (checkData.answer || ""));
        }
      } catch (checkErr) {
        console.error(`[learning-journey] Failed to solve concept question for ${conceptKey}:`, checkErr.message);
      }
    }

    // Fallback if still empty to prevent schema validation failures
    if (ans === "") {
      ans = "1";
    }

    // Build default prompts if missing
    let prompt = data.prompt || data.question || data.word;
    if (!prompt) {
      if (conceptKey === 'fractionadd') {
        const opStr = data.op || '+';
        if (data.mixed) {
          prompt = `Solve: ${data.w1} ${data.n1}/${data.d1} ${opStr} ${data.w2} ${data.n2}/${data.d2}`;
        } else {
          prompt = `Solve: ${data.n1}/${data.d1} ${opStr} ${data.n2}/${data.d2}`;
        }
      } else {
        prompt = "Solve the problem";
      }
    }

    return {
      id: data.id || `${conceptKey}-${Date.now()}-${Math.random()}`,
      prompt: prompt,
      answer: String(ans),
      options: data.options || null
    };
  } catch (err) {
    console.error(`[learning-journey] Failed to fetch question for ${conceptKey}:`, err.message);
    return {
      id: `${conceptKey}-fallback-${Date.now()}-${Math.random()}`,
      prompt: `Math question for ${conceptKey}`,
      answer: "1",
      options: ["0", "1", "2", "3"]
    };
  }
}

// Get user progress, initializing if not present
async function getUserProgress(userId) {
  if (mongoose.connection.readyState !== 1) {
    if (!inMemoryJourneyProgress[userId]) {
      inMemoryJourneyProgress[userId] = createInMemoryProgressObject(userId);
      saveInMemoryJourney();
    }
    return inMemoryJourneyProgress[userId];
  }

  let progress = await LearningJourneyProgress.findOne({ userId });
  if (!progress) {
    progress = new LearningJourneyProgress({
      userId,
      completedConcepts: [],
      completedTopics: [],
      conceptsNeedingRevision: [],
      checkpointAttempts: [],
      latestCheckpointScore: {}
    });
    await progress.save();
  }
  return progress;
}

// Check if a topic is unlocked for a user
function isTopicUnlocked(progress, topicId) {
  const { index } = getTopicData(topicId);
  if (index === -1) return false;
  if (index === 0) return true; // First topic is always unlocked
  const prevTopic = JOURNEY_CURRICULUM[index - 1];
  return progress.completedTopics.includes(prevTopic.id);
}

// Get progression state details for a specific topic
function getTopicProgression(progress, topicId) {
  const { topic } = getTopicData(topicId);
  if (!topic) return null;

  const unlocked = isTopicUnlocked(progress, topicId);
  const completed = progress.completedTopics.includes(topicId);
  
  // Identify concept states
  const conceptStates = [];
  let foundFirstUncompleted = false;

  for (const concept of topic.concepts) {
    const isCompleted = progress.completedConcepts.includes(concept.key);
    const needsRevision = progress.conceptsNeedingRevision && progress.conceptsNeedingRevision.includes(concept.key);
    let state = "locked";
    
    if (unlocked) {
      if (needsRevision) {
        state = "needs_revision";
      } else if (isCompleted) {
        state = "completed";
      } else if (!foundFirstUncompleted) {
        state = "playable";
        foundFirstUncompleted = true;
      }
    }
    
    conceptStates.push({
      key: concept.key,
      name: concept.name,
      state
    });
  }

  // Checkpoint is eligible if all concepts are completed
  const checkpointEligible = topic.concepts.every(c => progress.completedConcepts.includes(c.key));

  return {
    topicId,
    unlocked,
    completed,
    concepts: conceptStates,
    checkpointEligible,
    latestScore: progress.latestCheckpointScore.get(topicId) || null
  };
}

// Complete a concept
async function completeConcept(userId, topicId, conceptKey) {
  const progress = await getUserProgress(userId);
  
  // Verify topic is unlocked
  if (!isTopicUnlocked(progress, topicId)) {
    throw new Error("Topic is locked");
  }

  const { topic } = getTopicData(topicId);
  if (!topic) throw new Error("Invalid topic ID");

  // Verify concept is part of this topic
  const concept = topic.concepts.find(c => c.key === conceptKey);
  if (!concept) throw new Error("Concept does not belong to this topic");

  // Verify sequential learning: concept must be completed, immediate next uncompleted, or needing revision
  const progression = getTopicProgression(progress, topicId);
  const conceptState = progression.concepts.find(c => c.key === conceptKey);
  if (!conceptState || (conceptState.state !== "playable" && conceptState.state !== "completed" && conceptState.state !== "needs_revision")) {
    throw new Error("Concept is locked, complete previous concepts first");
  }

  if (!progress.completedConcepts.includes(conceptKey)) {
    progress.completedConcepts.push(conceptKey);
    progress.updatedAt = new Date();
  }

  // Clear from revision list if present
  if (progress.conceptsNeedingRevision && progress.conceptsNeedingRevision.includes(conceptKey)) {
    progress.conceptsNeedingRevision = progress.conceptsNeedingRevision.filter(k => k !== conceptKey);
    progress.updatedAt = new Date();
  }

  await progress.save();
  return progress;
}

// Generate Checkpoint Quiz
async function getCheckpointQuiz(userId, topicId) {
  const progress = await getUserProgress(userId);

  // Validate topic is unlocked
  if (!isTopicUnlocked(progress, topicId)) {
    throw new Error("Topic is locked");
  }

  // Validate checkpoint eligibility
  const progression = getTopicProgression(progress, topicId);
  if (!progression.checkpointEligible) {
    throw new Error("Finish all concepts in the topic to unlock the checkpoint quiz");
  }

  const { topic } = getTopicData(topicId);
  const concepts = topic.concepts;

  // Draw 15 questions randomly from the concepts of this topic
  const questions = [];
  for (let i = 0; i < 15; i++) {
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    const q = await getQuestionForConcept(randomConcept.key);
    questions.push({
      id: `q-${i + 1}`,
      prompt: q.prompt,
      correctAnswer: q.answer,
      conceptKey: randomConcept.key
    });
  }

  // Save active checkpoint session to progress
  progress.activeCheckpoint = {
    topicId,
    questions,
    startedAt: new Date()
  };
  await progress.save();

  // Return questions with correct answers stripped out for security
  return {
    topicId,
    questions: questions.map(q => ({
      id: q.id,
      prompt: q.prompt,
      conceptKey: q.conceptKey
    }))
  };
}

// Verify Checkpoint Quiz answers
async function verifyCheckpointQuiz(userId, topicId, answers) {
  const progress = await getUserProgress(userId);

  if (!progress.activeCheckpoint || progress.activeCheckpoint.topicId !== topicId) {
    throw new Error("No active checkpoint quiz session found for this topic");
  }

  const activeQuestions = progress.activeCheckpoint.questions;
  let correctCount = 0;

  const gradingResults = activeQuestions.map(q => {
    const userAnswer = String(answers[q.id] || "").trim();
    const isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
    if (isCorrect) correctCount++;
    return {
      id: q.id,
      prompt: q.prompt,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect
    };
  });

  const scorePercent = Math.round((correctCount / activeQuestions.length) * 100 * 10) / 10;
  const passed = scorePercent >= 80;

  // Add attempt record
  progress.checkpointAttempts.push({
    topicId,
    scorePercent,
    passed,
    attemptedAt: new Date()
  });

  // Update latest score
  progress.latestCheckpointScore.set(topicId, scorePercent);

  let unlockedTopicId = null;
  const { topic } = getTopicData(topicId);

  if (passed) {
    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
    }
    
    // Clear all concepts of this topic from conceptsNeedingRevision
    if (topic && progress.conceptsNeedingRevision) {
      const topicConceptKeys = topic.concepts.map(c => c.key);
      progress.conceptsNeedingRevision = progress.conceptsNeedingRevision.filter(
        cKey => !topicConceptKeys.includes(cKey)
      );
    }

    // Unlock next topic if exists
    const { index } = getTopicData(topicId);
    if (index !== -1 && index + 1 < JOURNEY_CURRICULUM.length) {
      unlockedTopicId = JOURNEY_CURRICULUM[index + 1].id;
    }
  } else {
    // FAILED: Identify wrongly answered concepts and mark them for revision
    const wrongConcepts = activeQuestions
      .filter(q => {
        const userAnswer = String(answers[q.id] || "").trim();
        const isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
        return !isCorrect;
      })
      .map(q => q.conceptKey);

    if (wrongConcepts.length > 0) {
      const updatedRevisionSet = new Set([
        ...(progress.conceptsNeedingRevision || []),
        ...wrongConcepts
      ]);
      progress.conceptsNeedingRevision = Array.from(updatedRevisionSet);
    }
  }

  // Reset active checkpoint session
  progress.activeCheckpoint = null;
  progress.updatedAt = new Date();
  await progress.save();

  return {
    passed,
    scorePercent,
    correctCount,
    totalQuestions: activeQuestions.length,
    unlockedTopicId,
    results: gradingResults
  };
}

module.exports = {
  getUserProgress,
  getTopicProgression,
  completeConcept,
  getCheckpointQuiz,
  verifyCheckpointQuiz
};

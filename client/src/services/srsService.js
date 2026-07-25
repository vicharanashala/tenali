// client/src/services/srsService.js
const STORAGE_KEY = 'tenali_srs_prototype';

// Default interval days per stage (SM-2 simplified)
const INTERVALS = [1, 6, 15, 30, 60];

// -------------------- HELPERS --------------------
function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { records: [], nextId: 1 };
  try { return JSON.parse(raw); }
  catch { return { records: [], nextId: 1 }; }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function now() { return Date.now(); }

// -------------------- RECORD ATTEMPT --------------------
export function recordAttempt(questionData, isCorrect) {
  const store = getStore();
  const { prompt, correctAnswer, userAnswer, explanation, topic, difficulty } = questionData;

  // Find if this exact question already exists (by prompt + correctAnswer)
  let existing = store.records.find(r => r.prompt === prompt && r.correctAnswer === correctAnswer);

  if (existing) {
    // Update existing record
    if (isCorrect) {
      // SM-2: correct → increase ease, longer interval
      existing.easeFactor = Math.min(2.5, existing.easeFactor + 0.1);
      existing.stage = Math.min(5, existing.stage + 1);
      existing.interval = Math.round(existing.interval * existing.easeFactor);
      existing.dueDate = now() + existing.interval * 86400000; // days to ms
    } else {
      // SM-2: incorrect → reset, increase mistake count
      existing.easeFactor = Math.max(1.3, existing.easeFactor - 0.2);
      existing.stage = 0;
      existing.interval = 1;
      existing.dueDate = now() + 86400000; // due tomorrow
      existing.mistakes += 1;
    }
    existing.timestamp = now();
    // Update userAnswer with the most recent attempt
    existing.userAnswer = userAnswer;
  } else {
    // New record
    const newRecord = {
      id: String(store.nextId++),
      prompt,
      correctAnswer,
      userAnswer,
      explanation: explanation || null,
      topic: topic || 'general',
      difficulty: difficulty ?? 1,
      timestamp: now(),
      mistakes: isCorrect ? 0 : 1,
      stage: isCorrect ? 1 : 0,
      dueDate: now() + (isCorrect ? 6 : 1) * 86400000, // 6 days if correct, 1 if wrong
      easeFactor: 2.5,
      interval: isCorrect ? 6 : 1
    };
    store.records.push(newRecord);
  }

  saveStore(store);
  return store;
}

// -------------------- GET DUE QUESTIONS --------------------
export function getDueQuestions(topicFilter = null) {
  const store = getStore();
  const nowMs = now();
  let due = store.records.filter(r => r.dueDate <= nowMs);
  if (topicFilter && topicFilter !== 'all') {
    due = due.filter(r => r.topic === topicFilter);
  }
  return due.sort((a, b) => a.dueDate - b.dueDate);
}

// -------------------- GET MISTAKES (Notebook) --------------------
export function getMistakes({ search = '', topic = 'all', difficulty = 'all', sort = 'newest' } = {}) {
  const store = getStore();
  let list = store.records.filter(r => r.mistakes > 0);

  // Search (case-insensitive)
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(r => r.prompt.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q));
  }

  // Filter topic
  if (topic && topic !== 'all') {
    list = list.filter(r => r.topic === topic);
  }

  // Filter difficulty
  if (difficulty && difficulty !== 'all') {
    list = list.filter(r => r.difficulty === parseInt(difficulty, 10));
  }

  // Sort
  if (sort === 'newest') list.sort((a, b) => b.timestamp - a.timestamp);
  else if (sort === 'oldest') list.sort((a, b) => a.timestamp - b.timestamp);
  else if (sort === 'due') list.sort((a, b) => a.dueDate - b.dueDate);

  return list;
}

// -------------------- GET STATISTICS (Dashboard) --------------------
export function getStatistics() {
  const store = getStore();
  const records = store.records;
  const total = records.length;
  const correct = records.filter(r => r.stage >= 1 && r.mistakes === 0).length; // simplified
  const incorrect = records.filter(r => r.mistakes > 0).length;
  const mastered = records.filter(r => r.stage >= 4).length;
  const learning = records.filter(r => r.stage > 0 && r.stage < 4).length;
  const dueToday = records.filter(r => r.dueDate <= now()).length;
  // Streak: just a placeholder for prototype
  const streak = Math.min(5, Math.floor(correct / 3));

  return {
    total,
    correct,
    incorrect,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    learning,
    mastered,
    dueToday,
    streak
  };
}

// -------------------- DELETE MISTAKE --------------------
export function deleteMistake(id) {
  const store = getStore();
  store.records = store.records.filter(r => r.id !== id);
  saveStore(store);
}

// -------------------- UPDATE REVIEW RESULT --------------------
export function updateReviewResult(id, isCorrect) {
  const store = getStore();
  const record = store.records.find(r => r.id === id);
  if (!record) return;

  if (isCorrect) {
    record.easeFactor = Math.min(2.5, record.easeFactor + 0.1);
    record.stage = Math.min(5, record.stage + 1);
    record.interval = Math.round(record.interval * record.easeFactor);
    record.dueDate = now() + record.interval * 86400000;
  } else {
    record.easeFactor = Math.max(1.3, record.easeFactor - 0.2);
    record.stage = 0;
    record.interval = 1;
    record.dueDate = now() + 86400000;
    record.mistakes += 1;
  }
  record.timestamp = now();
  saveStore(store);
}

// -------------------- GET ALL TOPICS (for filters) --------------------
export function getAllTopics() {
  const store = getStore();
  const topics = [...new Set(store.records.map(r => r.topic))];
  return topics.filter(t => t).sort();
}
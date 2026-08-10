/**
 * CHITRAGUPTA SERVER
 *
 * Standalone Express server for the Chitragupta quiz module in the Tenali project.
 * This is a legacy/older version of the general knowledge (GK) quiz module.
 *
 * Named after Chitragupta, the celestial scribe in Hindu mythology who records all actions.
 * Fits the theme of recording knowledge and quiz answers.
 *
 * Architecture:
 * - Backend: Node.js/Express with file-based question storage (JSON files)
 * - Frontend: React client built with Vite, served from dist directory
 * - Communication: REST API endpoints for quiz operations
 *
 * Features:
 * - Load questions from JSON files in the questions directory
 * - Multiple-choice format (A/B/C/D options)
 * - Random question selection from loaded pool
 * - Server-side answer validation
 * - Support for question genres/categories
 *
 * API Endpoints:
 * - GET /api/health: Health check with question count
 * - GET /api/question: Fetch a random question
 * - POST /api/check: Validate an answer
 * - GET /* : Fallback to serve index.html (SPA routing support)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4001;
// Path to directory containing question JSON files
const questionsDir = path.join(__dirname, '..', 'questions');
// Path to built React frontend
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

// Middleware: Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
// Serve static frontend assets
app.use(express.static(clientDistPath));

/**
 * Load all questions from JSON files in the questions directory
 * Each file should be a single question object with structure:
 * {
 *   id: number,
 *   question: string,
 *   options: [string, string, string, string],
 *   answerOption: 'A'|'B'|'C'|'D',
 *   answerText: string,
 *   genre?: string
 * }
 *
 * @returns {Array<Object>} Array of question objects loaded from disk
 */
function loadQuestions() {
  // Read all .json files from questions directory
  const files = fs.readdirSync(questionsDir).filter((file) => file.endsWith('.json'));
  // Parse each JSON file and return array of question objects
  return files.map((file) => {
    const fullPath = path.join(questionsDir, file);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  });
}

// Load all questions on server startup
let questions = loadQuestions();

/**
 * Health check endpoint
 * Useful for monitoring and verifies question data is loaded
 *
 * @route GET /api/health
 * @returns {Object} Status with question count
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, questions: questions.length });
});

/**
 * Fetch a random question from the loaded pool
 * Questions are not tracked as "used", so repeats are possible
 *
 * @route GET /api/question
 * @returns {Object} Question object containing:
 *   - id: Question identifier
 *   - question: Question text
 *   - options: Array of 4 answer choices
 *   - genre: Category/genre of the question (default: 'mixed')
 *   NOTE: correctAnswer is NOT included - only sent after validation
 */
app.get('/api/question', (_req, res) => {
  // Guard: Return error if no questions loaded
  if (!questions.length) {
    return res.status(500).json({ error: 'No questions found' });
  }
  // Select random question from loaded pool
  const q = questions[Math.floor(Math.random() * questions.length)];
  res.json({
    id: q.id,
    question: q.question,
    options: q.options,
    genre: q.genre || 'mixed'
  });
});

/**
 * Validate an answer submission
 * Performs server-side check to prevent cheating via client-side manipulation
 *
 * @route POST /api/check
 * @body {Object} Request body containing:
 *   - id: Question ID (to lookup the question)
 *   - answerOption: User's selected answer ('A', 'B', 'C', or 'D')
 * @returns {Object} Validation result with:
 *   - correct: Boolean indicating correctness
 *   - correctAnswer: The correct answer letter ('A', 'B', 'C', 'D')
 *   - correctAnswerText: The full text of the correct answer
 *   - message: Human-readable feedback
 */
app.post('/api/check', (req, res) => {
  const { id, answerOption } = req.body || {};
  // Find the question by ID
  const q = questions.find((item) => Number(item.id) === Number(id));
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }
  // Case-insensitive comparison (normalize to uppercase for safety)
  const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
  res.json({
    correct,
    correctAnswer: q.answerOption,
    correctAnswerText: q.answerText,
    message: correct ? 'Correct! 🎉' : 'Wrong ❌'
  });
});

/**
 * Fallback route for Single Page Application (SPA)
 * Any unmapped routes serve the React index.html, allowing client-side routing
 *
 * @route GET /*
 */
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server on configured port (default 4001)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chitragupta server running on http://0.0.0.0:${PORT}`);
});

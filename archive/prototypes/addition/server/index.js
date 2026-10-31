/**
 * ARYABHATA ADDITION SERVER
 *
 * Standalone Express server for the Addition quiz module in the Tenali project.
 * This is a legacy/older version of the addition quiz module that runs independently.
 *
 * Architecture:
 * - Backend: Node.js/Express server that generates addition problems and validates answers
 * - Frontend: React client built with Vite, served from the dist directory
 * - Communication: REST API endpoints for quiz operations
 *
 * Features:
 * - Generates random addition questions with configurable difficulty (1-3 digits)
 * - Validates user answers via POST endpoint
 * - Serves static React frontend
 *
 * API Endpoints:
 * - GET /api/health: Health check endpoint
 * - GET /api/question: Fetch a new addition question
 * - POST /api/check: Verify an answer
 * - GET /* : Fallback to serve index.html (SPA routing support)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4002;
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

// Middleware: Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
// Serve static frontend assets
app.use(express.static(clientDistPath));

/**
 * Generates a random integer in the range [min, max] inclusive
 * Uses cryptographically non-secure Math.random() - acceptable for quiz randomization
 *
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Maps difficulty level (number of digits) to number ranges
 * Used to generate appropriately scaled addition problems
 *
 * @param {number} digits - Difficulty level: 1 (0-9), 2 (10-99), or 3 (100-999)
 * @returns {Object} Object with min and max properties defining the number range
 */
function digitRange(digits) {
  if (digits === 1) return { min: 0, max: 9 };
  if (digits === 2) return { min: 10, max: 99 };
  return { min: 100, max: 999 };
}

/**
 * Health check endpoint
 * Used by monitoring systems to verify server is running
 *
 * @route GET /api/health
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/**
 * Generate a new addition question
 * Accepts difficulty level via query parameter and returns two random numbers to add
 *
 * @route GET /api/question
 * @query {number} digits - Difficulty level (1, 2, or 3). Defaults to 1. Invalid values sanitized to 1.
 * @returns {Object} Question object with:
 *   - id: Unique question identifier (for answer validation)
 *   - digits: Sanitized difficulty level
 *   - a: First operand
 *   - b: Second operand
 *   - prompt: Question text (e.g., "5 + 3")
 *   - answer: Correct answer
 */
app.get('/api/question', (req, res) => {
  const digits = Number(req.query.digits || 1);
  // Sanitize input: only allow 1, 2, or 3
  const safeDigits = [1, 2, 3].includes(digits) ? digits : 1;
  const range = digitRange(safeDigits);
  const a = randomInt(range.min, range.max);
  const b = randomInt(range.min, range.max);
  res.json({ id: `${safeDigits}-${Date.now()}-${Math.random()}`, digits: safeDigits, a, b, prompt: `${a} + ${b}`, answer: a + b });
});

/**
 * Validate an answer submission
 * Performs server-side verification to prevent cheating
 *
 * @route POST /api/check
 * @body {Object} Request body containing:
 *   - a: First operand (from the question)
 *   - b: Second operand (from the question)
 *   - answer: User's submitted answer
 * @returns {Object} Validation result with:
 *   - correct: Boolean indicating if answer matches
 *   - correctAnswer: The actual correct answer (server-calculated)
 *   - message: Human-readable feedback ("Correct" or "Incorrect")
 */
app.post('/api/check', (req, res) => {
  const { a, b, answer } = req.body || {};
  // Server calculates the correct answer to prevent client-side manipulation
  const correctAnswer = Number(a) + Number(b);
  const correct = Number(answer) === correctAnswer;
  res.json({ correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' });
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

// Start server on configured port (default 4002)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aryabhata Addition server running on http://0.0.0.0:${PORT}`);
});

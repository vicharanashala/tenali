/**
 * ARYABHATA SQUARE ROOT SERVER
 *
 * Standalone Express server for the Square Root drill module in the Tenali project.
 * This is a legacy/older version of the square root estimation drill module.
 *
 * Architecture:
 * - Backend: Node.js/Express server that generates square root problems
 * - Frontend: React client built with Vite, served from dist directory
 * - Communication: REST API endpoints for quiz operations
 *
 * Features:
 * - Generates square root problems with progressive difficulty (based on step count)
 * - Difficulty increases with each step (larger numbers to estimate)
 * - Accepts both floor and ceiling of the square root as correct answers
 * - Continuous drill mode (no fixed question count, user can keep going)
 * - Difficulty bands based on step number (progressive learning)
 *
 * API Endpoints:
 * - GET /api/health: Health check endpoint
 * - GET /api/question: Fetch a new square root problem
 * - POST /api/check: Verify an answer
 * - GET /* : Fallback to serve index.html (SPA routing support)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4003;
// Path to built React frontend
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

// Middleware: Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
// Serve static frontend assets
app.use(express.static(clientDistPath));

/**
 * Generates a random integer in the range [min, max] inclusive
 * Uses cryptographically non-secure Math.random() - acceptable for drill randomization
 *
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Maps difficulty level (step count) to number ranges
 * Uses a 5-tier difficulty progression system:
 * - Steps 1-10: Small numbers (2-50)
 * - Steps 11-20: Medium numbers (51-150)
 * - Steps 21-35: Medium-large numbers (151-350)
 * - Steps 36-60: Large numbers (351-700)
 * - Steps 61+: Very large numbers (701-999)
 *
 * This creates a progressive learning curve where users
 * gradually encounter more challenging square roots.
 *
 * @param {number} step - Current step/question number
 * @returns {Object} Object with min and max properties defining the number range
 */
function bandForStep(step) {
  if (step <= 10) return { min: 2, max: 50 };
  if (step <= 20) return { min: 51, max: 150 };
  if (step <= 35) return { min: 151, max: 350 };
  if (step <= 60) return { min: 351, max: 700 };
  return { min: 701, max: 999 };
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
 * Generate a new square root problem
 * Difficulty scales with step count parameter
 *
 * @route GET /api/question
 * @query {number} step - Current step/question number (determines difficulty band). Defaults to 1.
 * @returns {Object} Question object with:
 *   - id: Unique question identifier
 *   - q: The number to find square root of
 *   - step: The step number (difficulty level)
 *   - prompt: Question text (e.g., "√144")
 *   - floorAnswer: Floor of square root (lower acceptable answer)
 *   - ceilAnswer: Ceiling of square root (upper acceptable answer)
 *   - sqrtRounded: Exact square root rounded to 2 decimal places (for feedback)
 */
app.get('/api/question', (req, res) => {
  const step = Math.max(1, Number(req.query.step || 1));
  // Get difficulty band based on step number
  const band = bandForStep(step);
  // Generate random number in the band
  const q = randomInt(band.min, band.max);
  // Calculate the actual square root
  const sqrt = Math.sqrt(q);
  // Both floor and ceiling are accepted answers (since user is estimating)
  const floorAnswer = Math.floor(sqrt);
  const ceilAnswer = Math.ceil(sqrt);

  res.json({
    id: `${step}-${Date.now()}-${Math.random()}`,
    q,
    step,
    prompt: `√${q}`,
    floorAnswer,
    ceilAnswer,
    sqrtRounded: sqrt.toFixed(2),
  });
});

/**
 * Validate an answer submission
 * Performs server-side verification to prevent cheating
 * Accepts both floor and ceiling of square root as correct
 *
 * @route POST /api/check
 * @body {Object} Request body containing:
 *   - q: The number that was asked to find square root of
 *   - answer: User's submitted answer (integer)
 * @returns {Object} Validation result with:
 *   - correct: Boolean indicating if answer matches floor or ceiling
 *   - floorAnswer: The floor value
 *   - ceilAnswer: The ceiling value
 *   - sqrtRounded: The exact square root (for reference)
 *   - message: Human-readable feedback ("Correct" or "Incorrect")
 */
app.post('/api/check', (req, res) => {
  const { q, answer } = req.body || {};
  // Server calculates the correct answer to prevent client-side manipulation
  const sqrt = Math.sqrt(Number(q));
  const floorAnswer = Math.floor(sqrt);
  const ceilAnswer = Math.ceil(sqrt);
  const numericAnswer = Number(answer);
  // Accept either floor or ceiling as correct (estimation drill allows both)
  const correct = numericAnswer === floorAnswer || numericAnswer === ceilAnswer;

  res.json({
    correct,
    floorAnswer,
    ceilAnswer,
    sqrtRounded: sqrt.toFixed(2),
    message: correct ? 'Correct' : 'Incorrect',
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

// Start server on configured port (default 4003)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aryabhata Square Root server running on http://0.0.0.0:${PORT}`);
});

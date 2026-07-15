/**
 * TENALI - Educational Quiz Platform Server
 *
 * A comprehensive Node.js/Express server that powers an educational quiz and math problem-solving platform.
 *
 * ARCHITECTURE:
 * - Framework: Express.js (RESTful API server)
 * - Static Hosting: Serves React/Vue client built to ../client/dist
 * - Port: Configurable via PORT env var, defaults to 4000
 * - Server Address: 0.0.0.0 (accessible from any interface)
 *
 * FEATURES:
 * 1. General Knowledge Quizzes: Multiple choice GK questions with difficulty levels and genres
 * 2. Math Learning Modules:
 *    - Basic Arithmetic: Addition, subtraction, multiplication with difficulty scaling
 *    - Multiplication Tables: 1-10 multiplication drills
 *    - Quadratic Evaluation: Evaluate quadratic functions (y = ax² + bx + c) at given x values
 *    - Square Root Approximation: Estimate square roots by bands/difficulty levels
 *    - Polynomial Multiplication: Expand polynomial expressions (easy to hard)
 *    - Polynomial Factorization: Factor quadratic expressions into linear factors
 *    - Prime Factorization: Decompose numbers into prime factors
 *    - Quadratic Formula: Solve quadratic equations using the quadratic formula
 *    - Simultaneous Equations: Solve 2×2 or 3×3 linear systems
 *    - Function Evaluation: Evaluate linear/multilinear functions
 *    - Line Equations: Derive line equation (y = mx + c) from two points
 * 3. Vocabulary Builder: Word definitions with difficulty levels (easy/medium/hard)
 *
 * API ENDPOINTS:
 * - /api/health: Server health check
 * - /gk-api/*: General knowledge quiz endpoints
 * - /vocab-api/*: Vocabulary builder endpoints
 * - /addition-api/*: Basic addition problems
 * - /multiply-api/*: Multiplication table drills
 * - /quadratic-api/*: Quadratic function evaluation
 * - /sqrt-api/*: Square root approximation
 * - /polymul-api/*: Polynomial multiplication
 * - /polyfactor-api/*: Polynomial factorization
 * - /primefactor-api/*: Prime factorization
 * - /qformula-api/*: Quadratic formula solver
 * - /simul-api/*: Simultaneous linear equations
 * - /funceval-api/*: General function evaluation
 * - /lineq-api/*: Line equation derivation
 * - /basicarith-api/*: Basic arithmetic (+, −, ×)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const wordCreator = require('./wordCreator');

// Initialize Express app and configure middleware
const app = express();
const PORT = process.env.PORT || 4000;
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const questionsDir = path.join(__dirname, '..', 'chitragupta', 'questions');

// CORS: Enable cross-origin requests for client communication
app.use(cors());
// JSON parsing: Handle application/json request bodies
app.use(express.json());
// Static file serving: Serve built React/Vue client
app.use(express.static(clientDistPath));

// ─── Auth (MongoDB + JWT) ────────────────────────────────────────────────────
// Adds /api/auth/login and /api/auth/me. Hardcoded users are seeded into
// MongoDB on startup. If Mongo is unreachable the rest of the server still
// serves; only the auth endpoints will return 503.
const auth = require('./auth');
const progress = require('./progress');
app.use('/api/auth', auth.router);
app.use('/api/progress', progress.router);
auth.seedUsers().catch(() => {});  // always populate in-memory fallback
auth.connectMongo()
  .then(() => auth.seedUsers())
  .catch(err => console.error('[auth] Mongo connect failed — using in-memory auth:', err));

/**
 * EXPLANATION SUPPORT MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Intercepts all check endpoint responses when solve=true is in the request body.
 * Adds an 'explanation' field with step-by-step solution guidance.
 * Also marks the response with 'solved: true' to indicate this was a solve request.
 *
 * This middleware enables explanation generation without modifying individual endpoints.
 *
 * USAGE:
 * Send a POST request to any check endpoint with solve=true in the request body:
 *
 * POST /basicarith-api/check
 * { a: 5, b: 3, op: '+', answer: 8, solve: true }
 *
 * Response will include:
 * { correct: true, correctAnswer: 8, message: '...', solved: true,
 *   explanation: 'Step 1: Write the problem: 5 + 3\nStep 2: Calculate: 5 + 3 = 8\n...' }
 */
app.use((req, res, next) => {
  // Only intercept POST requests to check endpoints
  if (req.method !== 'POST' || !req.path.includes('-api/check')) {
    return next();
  }

  // Check if solve=true is requested
  const shouldSolve = req.body && req.body.solve === true;
  if (!shouldSolve) {
    return next();
  }

  // Store the original res.json method
  const originalJson = res.json.bind(res);

  // Monkey-patch res.json to intercept the response
  res.json = function (data) {
    // Add solved flag to indicate this was a solve request
    data.solved = true;

    // Generate explanation based on the API type, request data, and response data
    const explanation = generateExplanation(req, data);
    if (explanation) {
      data.explanation = explanation;
    }

    // Call the original res.json with the modified data
    return originalJson(data);
  };

  next();
});

// ─── LIL INTERCEPTOR MIDDLEWARE ──────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const lilProcess = require('./lil/processAttempt');
const { User } = require('./auth');

// Cache the fallback 'tatsavit' user ID so we don't query MongoDB on every anonymous request
let cachedTatsavitUserId = null;
setTimeout(async () => {
  try {
    const u = await User.findOne({ username: 'tatsavit' });
    if (u) cachedTatsavitUserId = u._id.toString();
  } catch {}
}, 3000);

app.use(async (req, res, next) => {
  // Only intercept POST requests to check endpoints
  if (req.method !== 'POST' || !req.path.includes('-api/check')) {
    return next();
  }

  // Skip if it is a solve request (since we only log standard attempts)
  if (req.body && req.body.solve === true) {
    return next();
  }

  // Resolve User ID from Bearer token
  let userId = null;
  const authHeader = req.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (m) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';
      const payload = jwt.verify(m[1], JWT_SECRET);
      userId = payload.sub;
    } catch (e) {
      console.warn('[LIL] JWT verify failed:', e.message);
    }
  }

  // Fallback: Use cached tatsavit user ID (no DB query per request)
  if (!userId) {
    userId = cachedTatsavitUserId;
  }

  // Extract topicId (e.g. "/addition-api/check" -> "addition")
  const pathParts = req.path.split('/');
  const apiName = pathParts[1] || '';
  const topicId = apiName.replace('-api', '');

  // Intercept response JSON
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    // Restore res.json to avoid recursion
    res.json = originalJson;

    // Async LIL execution wrapper
    if (userId && topicId) {
      const payloadInput = {
        userId,
        topicId,
        difficulty: req.query.difficulty || req.body.difficulty || 'easy',
        userAnswer: req.body.userAnswer ?? req.body.answer ?? '',
        isCorrect: !!data.correct,
        sessionGoal: req.body.sessionGoal || 'standard',
        telemetry: req.body.telemetry || {},
        prompt: req.body.prompt || '',
        correctAnswer: req.body.correctAnswer ?? req.body.answer ?? data.correctAnswer ?? data.display ?? '',
        display: req.body.display ?? data.display ?? '',
        options: req.body.options || null,
        questionData: req.body
      };

      // Send response immediately — don't block on DB writes
      originalJson(data);

      // Fire-and-forget: try to save attempt in background
      lilProcess.processAttempt(payloadInput)
        .then(() => {})
        .catch(err => console.error('[LIL] processAttempt failed:', err.message));
    } else {
      originalJson(data);
    }
  };

  next();
});

// ─── LIL GET QUESTION REVISION INTERCEPTOR ───────────────────────────────────
app.use(async (req, res, next) => {
  // Only intercept GET requests to question endpoints when goal is revision
  if (req.method !== 'GET' || !req.path.includes('-api/question') || req.query.goal !== 'revision') {
    return next();
  }

  // Resolve User ID from Bearer token
  let userId = null;
  const authHeader = req.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (m) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';
      const payload = jwt.verify(m[1], JWT_SECRET);
      userId = payload.sub;
    } catch (e) {
      console.warn('[LIL GET] JWT verify failed:', e.message);
    }
  }

  // Fallback: Use cached tatsavit user ID (no DB query per request)
  if (!userId) {
    userId = cachedTatsavitUserId;
  }

  // Extract topicId (e.g. "/addition-api/question" -> "addition")
  const pathParts = req.path.split('/');
  const apiName = pathParts[1] || '';
  const topicId = apiName.replace('-api', '');

  if (userId && topicId) {
    try {
      const mongoose = require('mongoose');
      const { Attempt } = require('./lil/models');
      
      const unresolved = await Attempt.aggregate([
        { $match: { 
            userId: new mongoose.Types.ObjectId(userId), 
            topicId, 
            prompt: { $exists: true, $ne: null } 
          } 
        },
        { $sort: { createdAt: -1 } },
        { $group: {
            _id: "$prompt",
            latestAttempt: { $first: "$$ROOT" }
        } },
        { $match: { "latestAttempt.isCorrect": false } },
        { $sort: { "latestAttempt.createdAt": -1 } }
      ]);

      const lastFailed = unresolved.length > 0 ? unresolved[0].latestAttempt : null;

      if (lastFailed && lastFailed.prompt) {
        console.log(`[LIL GET] Serving revision question from unresolved failed attempt: ${lastFailed._id}`);
        if (lastFailed.questionData) {
          // Exclude _id if there is any to prevent conflict, but copy everything else
          const qData = { ...lastFailed.questionData };
          delete qData._id;
          return res.json({
            ...qData,
            isRevision: true
          });
        }
        return res.json({
          id: `rev-${lastFailed._id}-${Date.now()}`,
          difficulty: lastFailed.difficulty || 'easy',
          prompt: lastFailed.prompt,
          answer: lastFailed.correctAnswer,
          display: lastFailed.display || String(lastFailed.correctAnswer),
          options: lastFailed.options || undefined,
          isRevision: true
        });
      }
    } catch (err) {
      console.error('[LIL GET] Failed to fetch revision question:', err);
    }
  }

  // If no failed attempts are found, proceed to normal question generation!
  next();
});


const { generateExplanation } = require('./explanations');

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in range [min, max]
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Map number of digits to a numeric range for problem generation
 * Used for creating addition problems with appropriate difficulty
 * @param {number} digits - Number of digits (1, 2, or 3)
 * @returns {object} {min, max} range object
 */
function digitRange(digits) {
  if (digits === 1) return { min: 0, max: 9 };
  if (digits === 2) return { min: 10, max: 99 };
  if (digits === 3) return { min: 100, max: 999 };
  return { min: 1000, max: 9999 };
}

/**
 * Map square root approximation step level to a numeric band
 * Higher steps = larger numbers to approximate square roots for
 * Used for progressive difficulty in sqrt-api
 * @param {number} step - Step number (1 to 100+)
 * @returns {object} {min, max} range of numbers for sqrt estimation
 */
function bandForStep(step) {
  if (step <= 10) return { min: 2, max: 50 };
  if (step <= 20) return { min: 51, max: 150 };
  if (step <= 35) return { min: 151, max: 350 };
  if (step <= 60) return { min: 351, max: 700 };
  return { min: 701, max: 999 };
}

/**
 * Load all GK questions from JSON files in the questions directory
 * Each file should contain a question object with id, question, options, answerOption, answerText
 * @returns {Array<object>} Array of question objects
 */
function loadQuestions() {
  const files = fs.readdirSync(questionsDir).filter((file) => file.endsWith('.json'));
  return files.map((file) => {
    const fullPath = path.join(questionsDir, file);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  });
}

// Load all GK questions at server startup
const questions = loadQuestions();

const WordProblemGenerator = {
  addition: (a, b) => {
    const templates = [
      `Alice has ${a} apples and Bob gives her ${b} more. How many apples does Alice have in total?`,
      `A store sold ${a} books in the morning and ${b} books in the afternoon. What is the total number of books sold?`,
      `You have $${a} in your savings account and you deposit $${b}. What is your new balance?`,
      `A farmer planted ${a} trees in the first week and ${b} trees in the second week. How many trees were planted in total?`,
      `${a} + ${b} = ?`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  },
  percentType1: (pct, base) => {
    const templates = [
      `A new smartphone costs $${base}. It is currently on sale for ${pct}% off. What is the discount amount?`,
      `Your dinner bill is $${base} and you want to leave a ${pct}% tip. How much is the tip?`,
      `In a town of ${base} people, ${pct}% of them voted in the last election. How many people voted?`,
      `What is ${pct}% of ${base}?`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  },
  quadratic: (expression, x) => {
    const templates = [
      `A toy rocket is launched, and its height is modeled by the function h(x) = ${expression}. What is its height at x = ${x}?`,
      `The daily profit of a bakery is modeled by the function P(x) = ${expression}. Calculate the profit when x = ${x}.`,
      `Evaluate the quadratic expression ${expression} when x = ${x}.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
};

/**
 * HEALTH CHECK ENDPOINT
 * GET /api/health
 *
 * Returns server status and total question count
 * Used by clients to verify server is running and questions are loaded
 *
 * Response: { ok: boolean, questions: number }
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, questions: questions.length });
});

/**
 * GENERAL KNOWLEDGE API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /gk-api/question
 * Fetch a random general knowledge multiple-choice question
 *
 * Query Parameters:
 *   - exclude (optional): Comma-separated question IDs to skip (e.g., "1,3,5")
 *                         Allows quiz clients to avoid repeating questions
 *
 * Response:
 * {
 *   id: string,              // Unique question identifier
 *   question: string,        // Question text
 *   options: string[],       // Array of answer options
 *   genre: string            // Category (e.g., 'history', 'science', 'mixed')
 * }
 */
app.get('/gk-api/question', (req, res) => {
  const exclude = req.query.exclude ? req.query.exclude.split(',').map(Number) : [];
  if (!questions.length) {
    return res.status(500).json({ error: 'No questions found' });
  }
  // Pool: Start with all questions, then filter to unseen ones if available
  // This prevents repeating the same question until all are exhausted
  let pool = questions;
  const unseen = pool.filter((q) => !exclude.includes(q.id));
  if (unseen.length > 0) pool = unseen;
  const q = pool[Math.floor(Math.random() * pool.length)];
  res.json({
    id: q.id,
    question: q.question,
    options: q.options,
    genre: q.genre || 'mixed',
  });
});

/**
 * POST /gk-api/check
 * Verify if the user's answer to a GK question is correct
 *
 * Request Body:
 * {
 *   id: number,             // Question ID to check
 *   answerOption: string    // User's selected answer (A, B, C, or D)
 * }
 *
 * Response:
 * {
 *   correct: boolean,       // Whether the answer matches the correct option
 *   correctAnswer: string,  // Correct answer option (A, B, C, or D)
 *   correctAnswerText: string, // Full text of the correct answer
 *   message: string         // Feedback emoji message
 * }
 */
app.post('/gk-api/check', (req, res) => {
  const { id, answerOption } = req.body || {};
  const q = questions.find((item) => Number(item.id) === Number(id));
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }
  // Compare user's answer with correct answer (case-insensitive)
  const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
  res.json({
    correct,
    correctAnswer: q.answerOption,
    correctAnswerText: q.answerText,
    message: correct ? 'Correct! 🎉' : 'Wrong ❌',
  });
});

/**
 * BASIC ARITHMETIC API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /addition-api/question
 * Generate a random addition problem with configurable digit count
 *
 * Query Parameters:
 *   - digits (optional): Number of digits per operand (1, 2, or 3; default: 1)
 *                        1 = single digit (0-9), 2 = two digits (10-99), etc.
 *
 * Response:
 * {
 *   id: string,             // Unique problem ID (timestamp-based)
 *   digits: number,         // Actual digit count used (sanitized)
 *   a: number,              // First operand
 *   b: number,              // Second operand
 *   prompt: string,         // Display text (e.g., "42 + 37")
 *   answer: number          // Correct sum
 * }
 */
app.get('/addition-api/question', (req, res) => {
  const digits = Number(req.query.digits || 1);
  // Sanitize digits to valid options; default to 1 if invalid
  const safeDigits = [1, 2, 3, 4].includes(digits) ? digits : 1;
  const range = digitRange(safeDigits);

  // Optional sumMax: when set, cap each operand so a + b <= sumMax
  const sumMax = req.query.sumMax ? Number(req.query.sumMax) : null;
  const effectiveMax = sumMax ? Math.min(range.max, Math.floor(sumMax / 2)) : range.max;
  const effectiveMin = Math.min(range.min, effectiveMax);

  const a = randomInt(effectiveMin, effectiveMax);
  const b = randomInt(effectiveMin, effectiveMax);
  const prompt = WordProblemGenerator.addition(a, b);
  res.json({ id: `${safeDigits}-${Date.now()}-${Math.random()}`, digits: safeDigits, a, b, prompt, answer: a + b });
});

/**
 * POST /addition-api/check
 * Verify if the user's answer to an addition problem is correct
 *
 * Request Body:
 * {
 *   a: number,              // First operand
 *   b: number,              // Second operand
 *   answer: number          // User's submitted answer
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctAnswer: number,  // The correct sum
 *   message: string         // Feedback message
 * }
 */
app.post('/addition-api/check', (req, res) => {
  const { a, b, answer } = req.body || {};
  const correctAnswer = Number(a) + Number(b);
  const correct = Number(answer) === correctAnswer;
  res.json({ correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * QUADRATIC EVALUATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Generate a random integer from -9 to 9 (excluding 0)
 * Used internally for quadratic coefficient generation
 * @returns {number} Signed integer in range [-9, 9]
 */
function randomSignedDigit() {
  return randomInt(-9, 9);
}

/**
 * Map quadratic difficulty level to coefficient range
 * Higher difficulty = larger coefficients in the polynomial
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} coefficient range
 */
function quadraticRange(difficulty) {
  if (difficulty === 'easy') return { min: -3, max: 3 };
  if (difficulty === 'medium') return { min: -6, max: 6 };
  if (difficulty === 'hard') return { min: -9, max: 9 };
  if (difficulty === 'extrahard') return { min: -15, max: 15 };
  return { min: -3, max: 3 };
}

/**
 * Generate a random integer within a given range
 * (Wrapper for consistency in quadratic module)
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInRange(min, max) {
  return randomInt(min, max);
}

/**
 * Format a polynomial term with proper mathematical notation
 * Handles signs, coefficients, and variable exponents
 *
 * Examples:
 *   formatSignedTerm(-5, 'x²', true) → "-5x²"
 *   formatSignedTerm(3, 'x') → "+ 3x"
 *   formatSignedTerm(0, '') → "+ 0" or "0" if first
 *
 * @param {number} value - Coefficient value
 * @param {string} variablePart - Variable part (e.g., 'x', 'x²', '')
 * @param {boolean} isFirst - True if this is the first term (affects sign)
 * @returns {string} Formatted term
 */
function formatSignedTerm(value, variablePart, isFirst = false) {
  if (value === 0) {
    return isFirst ? `0${variablePart}` : `+ 0${variablePart}`;
  }

  const sign = value < 0 ? '-' : '+';
  const absValue = Math.abs(value);
  if (isFirst) {
    return `${value}${variablePart}`;
  }
  return `${sign} ${absValue}${variablePart}`;
}

/**
 * Build a human-readable prompt for quadratic evaluation
 * Formats the equation y = ax² + bx + c with proper mathematical notation
 *
 * @param {number} a - Coefficient of x²
 * @param {number} b - Coefficient of x
 * @param {number} c - Constant term
 * @param {number} x - The x value to evaluate at
 * @returns {string} Prompt text (e.g., "If x = 2, find y for y = 2x² - 3x + 5")
 */
function buildQuadraticPrompt(a, b, c, x) {
  const expression = `${formatSignedTerm(a, 'x²', true)} ${formatSignedTerm(b, 'x')} ${formatSignedTerm(c, '')}`;
  return WordProblemGenerator.quadratic(expression, x);
}

/**
 * GET /quadratic-api/question
 * Generate a quadratic function evaluation problem
 * Task: Evaluate y = ax² + bx + c at a given x value
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'hard')
 *                            Controls coefficient ranges
 *
 * Response:
 * {
 *   id: string,             // Unique problem ID
 *   a: number,              // x² coefficient
 *   b: number,              // x coefficient
 *   c: number,              // Constant term
 *   x: number,              // Value of x to evaluate at
 *   prompt: string,         // Display text (formatted equation)
 *   answer: number          // Correct y value (a*x² + b*x + c)
 * }
 */
app.get('/quadratic-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'hard';
  const range = quadraticRange(difficulty);
  // Ensure a ≠ 0 (otherwise it's not truly quadratic)
  let a = 0;
  while (a === 0) a = randomInRange(range.min, range.max);
  const b = randomInRange(range.min, range.max);
  const c = randomInRange(range.min, range.max);
  const x = randomInRange(range.min, range.max);
  const answer = a * x * x + b * x + c;

  res.json({
    id: `quadratic-${Date.now()}-${Math.random()}`,
    a,
    b,
    c,
    x,
    prompt: buildQuadraticPrompt(a, b, c, x),
    answer,
  });
});

/**
 * POST /quadratic-api/check
 * Verify if user correctly evaluated the quadratic function
 *
 * Request Body:
 * {
 *   a: number,              // x² coefficient
 *   b: number,              // x coefficient
 *   c: number,              // Constant term
 *   x: number,              // x value to evaluate at
 *   answer: number          // User's calculated y value
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctAnswer: number,
 *   message: string
 * }
 */
app.post('/quadratic-api/check', (req, res) => {
  const { a, b, c, x, answer } = req.body || {};
  const correctAnswer = Number(a) * Number(x) * Number(x) + Number(b) * Number(x) + Number(c);
  const correct = Number(answer) === correctAnswer;
  res.json({ correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * SQUARE ROOT APPROXIMATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /sqrt-api/question
 * Generate a square root approximation problem
 * Task: Estimate the integer square root (floor or ceiling) of a number
 *
 * Difficulty progression: Higher step numbers = larger radicands
 * Steps 1-10: √2 to √50
 * Steps 11-20: √51 to √150
 * Steps 21-35: √151 to √350
 * Steps 36-60: √351 to √700
 * Steps 61+: √701 to √999
 *
 * Query Parameters:
 *   - step (optional): Difficulty level (1-100+; default: 1)
 *
 * Response:
 * {
 *   id: string,             // Unique problem ID
 *   q: number,              // The number under the radical
 *   step: number,           // Difficulty level
 *   prompt: string,         // Display text (e.g., "√42")
 *   floorAnswer: number,    // Floor of the square root
 *   ceilAnswer: number,     // Ceiling of the square root
 *   sqrtRounded: string     // Exact sqrt rounded to 2 decimals (for reference)
 * }
 */
app.get('/sqrt-api/question', (req, res) => {
  // Support both 'step' (legacy) and 'difficulty' parameters
  // If difficulty is provided, map it to a step range
  let step;
  if (req.query.difficulty) {
    const difficulty = req.query.difficulty;
    if (difficulty === 'easy') step = randomInt(1, 5);
    else if (difficulty === 'medium') step = randomInt(6, 10);
    else if (difficulty === 'hard') step = randomInt(11, 20);
    else if (difficulty === 'extrahard') step = randomInt(21, 50);
    else step = randomInt(1, 5); // Default to easy
  } else {
    step = Math.max(1, Number(req.query.step || 1));
  }

  const band = bandForStep(step);
  const q = randomInt(band.min, band.max);
  const sqrt = Math.sqrt(q);
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
 * POST /sqrt-api/check
 * Verify if user's square root approximation is correct
 * Accepts either floor or ceiling as valid (since exact sqrt is non-integer)
 *
 * Request Body:
 * {
 *   q: number,              // The number that was under the radical
 *   answer: number          // User's estimated integer square root
 * }
 *
 * Response:
 * {
 *   correct: boolean,       // True if answer ∈ {floor(√q), ceil(√q)}
 *   floorAnswer: number,
 *   ceilAnswer: number,
 *   sqrtRounded: string,    // Exact value for learning
 *   message: string
 * }
 */
app.post('/sqrt-api/check', (req, res) => {
  const { q, answer } = req.body || {};
  const sqrt = Math.sqrt(Number(q));
  const floorAnswer = Math.floor(sqrt);
  const ceilAnswer = Math.ceil(sqrt);
  const numericAnswer = Number(answer);
  // Accept either floor or ceiling as correct
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
 * VOCABULARY BUILDER API
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Directory containing vocabulary question JSON files
const vocabDir = path.join(__dirname, '..', 'vocab', 'questions');
const conceptDir = path.join(__dirname, '..', 'concept', 'questions');

/**
 * Load all vocabulary questions from JSON files
 * Each file should contain question objects with id, difficulty, question, options, answerOption, answerText
 * Returns empty array if directory doesn't exist (graceful fallback)
 *
 * @returns {Array<object>} Array of vocabulary question objects
 */
function loadVocab() {
  try {
    const files = fs.readdirSync(vocabDir).filter((f) => f.endsWith('.json'));
    return files.map((f) => JSON.parse(fs.readFileSync(path.join(vocabDir, f), 'utf8')));
  } catch (e) {
    return [];
  }
}

function loadConcepts() {
  try {
    const files = fs.readdirSync(conceptDir).filter((f) => f.endsWith('.json'));
    return files.map((f) => JSON.parse(fs.readFileSync(path.join(conceptDir, f), 'utf8')));
  } catch (e) {
    return [];
  }
}

// Load all vocabulary questions at server startup
const vocabQuestions = loadVocab();
const conceptQuestions = loadConcepts();

/**
 * GET /vocab-api/question
 * Fetch a random vocabulary question at a specified difficulty level
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *   - exclude (optional): Comma-separated question IDs to skip (prevents repeats)
 *
 * Response:
 * {
 *   id: number,             // Unique question identifier
 *   question: string,       // Word definition or context question
 *   options: string[],      // Array of answer choices
 *   difficulty: string      // Difficulty level ('easy', 'medium', or 'hard')
 * }
 */
app.get('/vocab-api/question', (req, res) => {
  let difficulty = req.query.difficulty || 'easy';
  // Support both 'extrahard' and 'extra-hard' formats
  if (difficulty === 'extrahard') difficulty = 'extra-hard';

  const exclude = req.query.exclude ? req.query.exclude.split(',').map(Number) : [];
  let pool = vocabQuestions.filter((q) => q.difficulty === difficulty);
  if (!pool.length) {
    return res.status(404).json({ error: `No vocab questions for difficulty: ${difficulty}` });
  }
  // Filter to unseen questions first, allowing repeats only when exhausted
  const unseen = pool.filter((q) => !exclude.includes(q.id));
  if (unseen.length > 0) pool = unseen;
  const q = pool[Math.floor(Math.random() * pool.length)];
  res.json({
    id: q.id,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  });
});

/**
 * POST /vocab-api/check
 * Verify if user's vocabulary answer is correct
 *
 * Request Body:
 * {
 *   id: number,             // Question ID
 *   answerOption: string    // User's selected answer (A, B, C, or D)
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctAnswer: string,  // Correct option letter
 *   correctAnswerText: string, // Full text of the correct answer
 *   message: string         // Feedback
 * }
 */
app.post('/vocab-api/check', (req, res) => {
  const { id, answerOption } = req.body || {};
  const q = vocabQuestions.find((item) => Number(item.id) === Number(id));
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }
  // Case-insensitive comparison
  const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
  res.json({
    correct,
    correctAnswer: q.answerOption,
    correctAnswerText: q.answerText,
    message: correct ? 'Correct!' : 'Incorrect',
  });
});

/**
 * GET /concept-api/question
 */
app.get('/concept-api/question', (req, res) => {
  let difficulty = req.query.difficulty || 'easy';
  if (difficulty === 'extrahard') difficulty = 'extra-hard';

  const exclude = req.query.exclude ? req.query.exclude.split(',').map(Number) : [];
  let pool = conceptQuestions.filter((q) => q.difficulty === difficulty);
  if (!pool.length) {
    return res.status(404).json({ error: `No concept questions for difficulty: ${difficulty}` });
  }
  const unseen = pool.filter((q) => !exclude.includes(q.id));
  if (unseen.length > 0) pool = unseen;
  const q = pool[Math.floor(Math.random() * pool.length)];
  res.json({
    id: q.id,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  });
});

/**
 * POST /concept-api/check
 */
app.post('/concept-api/check', (req, res) => {
  const { id, answerOption } = req.body || {};
  const q = conceptQuestions.find((item) => Number(item.id) === Number(id));
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }
  const correct = String(answerOption || '').toUpperCase() === String(q.answerOption || '').toUpperCase();
  res.json({
    correct,
    correctAnswer: q.answerOption,
    correctAnswerText: q.answerText,
    message: correct ? 'Correct!' : 'Incorrect',
  });
});

/**
 * MULTIPLICATION TABLES API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /multiply-api/question
 * Generate a multiplication table problem (table × random multiplier)
 *
 * Query Parameters:
 *   - table (optional): Which multiplication table (1-10+; default: 1)
 *
 * Response:
 * {
 *   id: string,             // Unique problem ID
 *   table: number,          // Multiplication table number
 *   multiplier: number,     // Random number from 1-10
 *   prompt: string,         // Display text (e.g., "7 × 8")
 *   answer: number          // Correct product
 * }
 */
app.get('/multiply-api/question', (req, res) => {
  const table = Math.max(1, Number(req.query.table || 1));
  const multiplier = randomInt(1, 10);
  const answer = table * multiplier;

  res.json({
    id: `multiply-${Date.now()}-${Math.random()}`,
    table,
    multiplier,
    prompt: `${table} × ${multiplier}`,
    answer,
  });
});

/**
 * POST /multiply-api/check
 * Verify if user's multiplication answer is correct
 *
 * Request Body:
 * {
 *   table: number,          // Multiplication table
 *   multiplier: number,     // Multiplier
 *   answer: number          // User's product
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctAnswer: number,
 *   message: string
 * }
 */
app.post('/multiply-api/check', (req, res) => {
  const { table, multiplier, answer } = req.body || {};
  const correctAnswer = Number(table) * Number(multiplier);
  const correct = Number(answer) === correctAnswer;
  res.json({ correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * VISUAL MATH LAB API
 * ═══════════════════════════════════════════════════════════════════════════
 * Generates rich visual question data for multiplication & division:
 * modes: array | groups | skip | share | grouping | product | mystery | quotient | remainder
 */

function vmRandInt(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }

function vmPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const VM_EMOJIS = ['🍎','🍊','🍋','🍇','🍓','⭐','🌸','🦋','🐣','🍭','🧁','🎈','🦄','🐬','🍕'];

function vmEmoji() { return vmPick(VM_EMOJIS); }

// Tables by difficulty
function vmTables(difficulty) {
  if (difficulty === 'easy')   return [2,3,4,5];
  if (difficulty === 'medium') return [2,3,4,5,6,7,8,9];
  return [2,3,4,5,6,7,8,9,10,11,12];
}

app.get('/visual-math-api/question', (req, res) => {
  const type  = req.query.type  || 'multiply'; // multiply | divide
  const mode  = req.query.mode  || 'array';
  const diff  = req.query.difficulty || 'easy';
  const tables = vmTables(diff);
  const emoji  = vmEmoji();
  const id = `vm-${Date.now()}-${Math.random()}`;

  try {
    /* ── MULTIPLICATION MODES ── */

    if (type === 'multiply' && mode === 'array') {
      // "Build rows × cols by tapping empty cells"
      const rows = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxCols = diff === 'easy' ? 4 : Math.max(2, Math.floor(30 / rows));
      const cols = vmRandInt(2, Math.min(diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8, maxCols));
      return res.json({ id, type, mode, emoji, rows, cols,
        prompt: `Fill ${rows} rows of ${cols} ${emoji} each. Total = ?`,
        answer: rows * cols, a: rows, b: cols });
    }

    if (type === 'multiply' && mode === 'groups') {
      // "Put M items into each of N buckets"
      const numGroups = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxPerGroup = diff === 'easy' ? 5 : Math.max(2, Math.floor(30 / numGroups));
      const perGroup  = vmRandInt(2, Math.min(diff === 'easy' ? 5 : diff === 'medium' ? 8 : 10, maxPerGroup));
      return res.json({ id, type, mode, emoji, numGroups, perGroup,
        prompt: `Put ${perGroup} ${emoji} into each of ${numGroups} buckets. Total?`,
        answer: numGroups * perGroup, a: numGroups, b: perGroup });
    }

    if (type === 'multiply' && mode === 'skip') {
      // "Hop by step to reach target"
      const step   = vmPick(tables.filter(t => t <= 10));
      const hops   = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 8 : 10);
      const target = step * hops;
      return res.json({ id, type, mode, emoji: '🐸', step, hops, target,
        prompt: `Jump by ${step}s. How many jumps to reach ${target}?`,
        answer: hops, a: step, b: hops });
    }

    if (type === 'multiply' && mode === 'product') {
      // Balance scale: left = label "A × B", right = drag weights to match
      const a = vmPick(tables);
      const b = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 9 : 12);
      return res.json({ id, type, mode, emoji, a, b,
        prompt: `${a} × ${b} = ?  Drag weight blocks to balance the right pan!`,
        answer: a * b });
    }

    if (type === 'multiply' && mode === 'mystery') {
      // Balance scale: "? × B = total" — drag mystery number weight
      const b     = vmPick(tables.filter(t => t >= 2 && t <= (diff === 'easy' ? 5 : 10)));
      const a     = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 9 : 12);
      const total = a * b;
      return res.json({ id, type, mode, emoji, a, b, total,
        prompt: `? × ${b} = ${total}. What is the mystery factor?`,
        answer: a });
    }

    /* ── DIVISION MODES ── */

    if (type === 'divide' && mode === 'share') {
      // "Share total items equally among N plates"
      const divisor  = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxQuotient = diff === 'easy' ? 5 : Math.max(2, Math.floor(30 / divisor));
      const quotient = vmRandInt(2, Math.min(diff === 'easy' ? 5 : diff === 'medium' ? 8 : 10, maxQuotient));
      const total    = divisor * quotient;
      return res.json({ id, type, mode, emoji, total, divisor, quotient,
        prompt: `Share ${total} ${emoji} equally among ${divisor} plates. How many on each?`,
        answer: quotient, a: total, b: divisor });
    }

    if (type === 'divide' && mode === 'grouping') {
      // "Put items into groups of size B — how many groups?"
      const groupSize = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8);
      const maxGroups = diff === 'easy' ? 5 : Math.max(2, Math.floor(30 / groupSize));
      const numGroups = vmRandInt(2, Math.min(diff === 'easy' ? 5 : diff === 'medium' ? 7 : 10, maxGroups));
      const total     = groupSize * numGroups;
      return res.json({ id, type, mode, emoji, total, groupSize, numGroups,
        prompt: `Put ${total} ${emoji} into groups of ${groupSize}. How many groups?`,
        answer: numGroups, a: total, b: groupSize });
    }

    if (type === 'divide' && mode === 'quotient') {
      // Balance scale: left = total weight shown, right = drag quotient
      const divisor  = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 9);
      const quotient = vmRandInt(2, diff === 'easy' ? 5 : diff === 'medium' ? 9 : 12);
      const total    = divisor * quotient;
      return res.json({ id, type, mode, emoji, total, divisor, quotient,
        prompt: `${total} ÷ ${divisor} = ?  Drag weight blocks to show the answer!`,
        answer: quotient, a: total, b: divisor });
    }

    if (type === 'divide' && mode === 'remainder') {
      // "A ÷ B = Q remainder R" — drag quotient; remainder is shown
      const divisor  = vmRandInt(2, diff === 'easy' ? 4 : diff === 'medium' ? 6 : 9);
      const quotient = vmRandInt(1, diff === 'easy' ? 4 : diff === 'medium' ? 8 : 10);
      const remainder= vmRandInt(1, divisor - 1);
      const total    = divisor * quotient + remainder;
      return res.json({ id, type, mode, emoji, total, divisor, quotient, remainder,
        prompt: `${total} ÷ ${divisor} = ? remainder ${remainder}. What is the quotient?`,
        answer: quotient, a: total, b: divisor });
    }

    // Fallback: simple product
    const a2 = vmPick(tables);
    const b2 = vmRandInt(1, 10);
    res.json({ id, type: 'multiply', mode: 'product', emoji, a: a2, b: b2,
      prompt: `${a2} × ${b2} = ?`, answer: a2 * b2 });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/visual-math-api/check', (req, res) => {
  const { answer, correctAnswer } = req.body || {};
  const correct = Number(answer) === Number(correctAnswer);
  res.json({ correct, correctAnswer: Number(correctAnswer),
    message: correct ? 'Correct!' : 'Incorrect' });
});

/**
 * POLYNOMIAL MULTIPLICATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Map polynomial multiplication difficulty to coefficient range
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} coefficient range
 */
function polyCoeffRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 9 };
  if (difficulty === 'medium') return { min: 1, max: 10 };
  if (difficulty === 'hard') return { min: 1, max: 20 };
  if (difficulty === 'extrahard') return { min: 1, max: 30 };
  return { min: 1, max: 9 };
}

/**
 * Generate random polynomial coefficients
 * Returns coefficients array where index = power of x
 * Example: [5, -3, 2] represents 2x² - 3x + 5
 *
 * @param {number} degree - Highest power of x in the polynomial
 * @param {object} range - {min, max} for coefficient values
 * @returns {Array<number>} Coefficients array, index = power
 */
function randomPoly(degree, range) {
  const coeffs = [];
  for (let i = 0; i <= degree; i++) {
    let c = randomInt(range.min, range.max);
    // 30% chance to make it negative (except for constant term)
    if (Math.random() < 0.3 && i > 0) c = -c;
    coeffs.push(c);
  }
  // Ensure leading coefficient is non-zero (true polynomial of given degree)
  if (coeffs[degree] === 0) coeffs[degree] = 1;
  return coeffs; // index = power: [constant, x, x², ...]
}

/**
 * Multiply two polynomials using distribution
 * Implements the standard algorithm: (a₀ + a₁x + a₂x²) × (b₀ + b₁x + ...)
 *
 * Time complexity: O(n*m) where n, m are the degrees
 * Example: [1, 2] × [3, 4] = [3, 10, 8] representing (1 + 2x) × (3 + 4x) = 3 + 10x + 8x²
 *
 * @param {Array<number>} a - First polynomial coefficients (index = power)
 * @param {Array<number>} b - Second polynomial coefficients (index = power)
 * @returns {Array<number>} Product polynomial coefficients
 */
function multiplyPolys(a, b) {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j];
    }
  }
  return result;
}

/**
 * Format polynomial coefficients as human-readable mathematical notation
 * Handles signs, implicit coefficients (1 and -1), and superscript powers
 *
 * Examples:
 *   [3, -2, 1] → "x² − 2x + 3"
 *   [0, 5] → "5x"
 *   [1, 1, 1] → "x² + x + 1"
 *
 * @param {Array<number>} coeffs - Coefficients array (index = power)
 * @returns {string} Formatted polynomial expression
 */
function formatPoly(coeffs) {
  const parts = [];
  // Process coefficients from highest to lowest power
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    // Skip zero coefficients (except in special cases where polynomial is just 0)
    if (c === 0 && coeffs.length > 1) continue;
    // Convert power index to superscript (e.g., 2 → ²)
    const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
    const varPart = i === 0 ? '' : i === 1 ? 'x' : `x${sup(i)}`;
    if (parts.length === 0) {
      // First term: include explicit coefficient, or omit if coefficient is 1 for non-constant
      parts.push(c === 1 && i > 0 ? varPart : c === -1 && i > 0 ? `-${varPart}` : `${c}${varPart}`);
    } else {
      // Subsequent terms: include sign
      const sign = c > 0 ? '+' : '-';
      const abs = Math.abs(c);
      parts.push(`${sign} ${abs === 1 && i > 0 ? varPart : `${abs}${varPart}`}`);
    }
  }
  return parts.join(' ') || '0';
}

/**
 * GET /polymul-api/question
 * Generate a polynomial multiplication problem
 *
 * Difficulty levels determine the form of polynomials:
 *   - Easy: Monomial × Binomial (e.g., "3(2x+5)" or "4x(7x+8)")
 *   - Medium: Binomial × Binomial (e.g., "(2x+3)(5x-1)")
 *   - Hard: Trinomial × Trinomial (e.g., "(x²+2x+1)(x²-x+2)")
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   p1: Array<number>,      // First polynomial (coefficients, index = power)
 *   p2: Array<number>,      // Second polynomial
 *   product: Array<number>, // Correct product
 *   p1Display: string,      // Formatted p1 for display
 *   p2Display: string,      // Formatted p2 for display
 *   productDisplay: string, // Formatted product
 *   resultDegree: number    // Highest power in the product
 * }
 */
app.get('/polymul-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = polyCoeffRange(difficulty);
  let p1, p2;

  if (difficulty === 'easy') {
    // Easy: a(bx + c) form — monomial × binomial
    // Variants: plain constant like 3(2x+5), or term like 4x(7x+8)
    const usesX = Math.random() < 0.4; // 40% chance of ax(...) form
    if (usesX) {
      // ax × (bx + c) → coeffs: ax = [0, a], (bx+c) = [c, b]
      const a = randomInt(2, range.max);
      const b = randomInt(1, range.max);
      let c = randomInt(1, range.max);
      if (Math.random() < 0.3) c = -c;
      p1 = [0, a];
      p2 = [c, b];
    } else {
      // a × (bx + c) → coeffs: a = [a], (bx+c) = [c, b]
      const a = randomInt(2, range.max);
      const b = randomInt(1, range.max);
      let c = randomInt(1, range.max);
      if (Math.random() < 0.3) c = -c;
      p1 = [a];
      p2 = [c, b];
    }
  } else if (difficulty === 'medium') {
    // Medium: two degree-1 polynomials (ax+b)(cx+d)
    p1 = randomPoly(1, range);
    p2 = randomPoly(1, range);
  } else if (difficulty === 'hard') {
    // Hard: two degree-2 polynomials
    p1 = randomPoly(2, range);
    p2 = randomPoly(2, range);
  } else if (difficulty === 'extrahard') {
    // Extrahard: two degree-3 polynomials
    p1 = randomPoly(3, range);
    p2 = randomPoly(3, range);
  } else {
    // Default to easy
    const a = randomInt(2, 9);
    const b = randomInt(1, 9);
    let c = randomInt(1, 9);
    if (Math.random() < 0.3) c = -c;
    p1 = [a];
    p2 = [c, b];
  }

  const product = multiplyPolys(p1, p2);
  res.json({
    id: `polymul-${Date.now()}-${Math.random()}`,
    p1, p2, product,
    p1Display: formatPoly(p1),
    p2Display: formatPoly(p2),
    productDisplay: formatPoly(product),
    resultDegree: product.length - 1,
  });
});

/**
 * POST /polymul-api/check
 * Verify if user correctly multiplied the polynomials
 *
 * Request Body:
 * {
 *   p1: Array<number>,      // First polynomial coefficients
 *   p2: Array<number>,      // Second polynomial coefficients
 *   userCoeffs: Array<number> // User's answer (product coefficients)
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctCoeffs: Array<number>, // Correct product
 *   correctDisplay: string,  // Formatted correct answer
 *   message: string
 * }
 */
app.post('/polymul-api/check', (req, res) => {
  const { p1, p2, userCoeffs } = req.body || {};
  const product = multiplyPolys(p1, p2);
  // Check both length and values to ensure correct answer
  const correct = product.length === userCoeffs.length && product.every((c, i) => Number(userCoeffs[i]) === c);
  res.json({ correct, correctCoeffs: product, correctDisplay: formatPoly(product), message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * POLYNOMIAL FACTORIZATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Map polynomial factorization difficulty to coefficient range
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} factor coefficient range
 */
function factorCoeffRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 10 };
  if (difficulty === 'medium') return { min: 1, max: 20 };
  if (difficulty === 'hard') return { min: 1, max: 30 };
  if (difficulty === 'extrahard') return { min: 1, max: 50 };
  return { min: 1, max: 10 };
}

/**
 * GET /polyfactor-api/question
 * Generate a polynomial factorization problem (quadratic only)
 *
 * Strategy: Generate two linear factors (px + q)(rx + s) and expand to ax² + bx + c
 * Then ask user to factor back to the original linear factors
 * This guarantees a factorable quadratic with integer-coefficient factors
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   a: number,              // x² coefficient
 *   b: number,              // x coefficient
 *   c: number,              // Constant term
 *   factors: {
 *     p, q, r, s           // Coefficients of (px + q)(rx + s)
 *   },
 *   display: string         // Formatted quadratic for display
 * }
 */
/* ─── Module 39 — Polynomial Factoring ────────────────────────────────────
 * Replaces the old "easy/medium/hard/extrahard" flow with a tier × level
 * model:
 *   Tier 1: a = 1, single-digit b, |c| ≤ 20  (x² + 5x + 6)
 *   Tier 2: a = 1, b up to ±15, |c| ≤ 50     (x² + 11x + 30)
 *   Tier 3: a ∈ 2..3, double-digit b/c       (2x² + 7x + 3)
 *   Tier 4: a ∈ 2..5, larger b/c             (3x² + 10x + 8)
 *
 *   Level 1: MCQ — pick the correct factorised form from 4 options.
 *   Level 2: Fill-in-the-blank — student supplies the integer factors
 *            inside a given skeleton.
 *   Level 3: Direct answer input — student types the entire factorisation;
 *            commutative ordering is accepted at the check step.
 *
 * Generation always proceeds from the factors (px + q)(rx + s) so the
 * resulting quadratic is guaranteed to have two real integer roots — no
 * post-hoc verification required.
 */

const POLYFACTOR_TIERS = {
  1: { aChoices: [1],          qMax: 10, qMin: 1 },
  2: { aChoices: [1],          qMax: 12, qMin: 1 },
  3: { aChoices: [2, 3],       qMax: 6,  qMin: 1 },
  4: { aChoices: [2, 3, 4, 5], qMax: 6,  qMin: 1 },
};

function polyfactorPickFactors(tier) {
  const cfg = POLYFACTOR_TIERS[tier] || POLYFACTOR_TIERS[1];
  const a = cfg.aChoices[Math.floor(Math.random() * cfg.aChoices.length)];
  // Decide p, r so p*r = a. For Tier 1/2, p = r = 1. For higher tiers, split a.
  let p, r;
  if (a === 1) { p = 1; r = 1; }
  else if (a === 2) { p = 2; r = 1; }
  else if (a === 3) { p = 3; r = 1; }
  else if (a === 4) { p = Math.random() < 0.5 ? 4 : 2; r = a / p; }
  else { p = a; r = 1; } // a = 5
  // Pick q, s — non-zero. For Tier 1, |q| ≤ qMax and |s| ≤ qMax with both positive
  // bias to keep the early questions simple (positive constants give addition-style).
  const sign = () => (tier === 1 ? 1 : (Math.random() < 0.6 ? 1 : -1));
  const q = sign() * randomInt(cfg.qMin, cfg.qMax);
  const s = sign() * randomInt(cfg.qMin, cfg.qMax);
  return { p, q, r, s };
}

function polyfactorExpand(p, q, r, s) {
  return { a: p * r, b: p * s + q * r, c: q * s };
}

/** Render a single linear factor (αx + β) with proper signs and minus glyph. */
function polyfactorFormat(p, q) {
  const left = p === 1 ? 'x' : `${p}x`;
  if (q === 0) return `(${left})`;
  const sign = q > 0 ? '+' : '−';
  return `(${left} ${sign} ${Math.abs(q)})`;
}

function polyfactorFormatBoth(p, q, r, s) {
  return polyfactorFormat(p, q) + polyfactorFormat(r, s);
}

/** Build 4 MCQ options including the correct answer plus 3 distractors. */
function polyfactorMCQOptions(p, q, r, s, tier) {
  const correct = polyfactorFormatBoth(p, q, r, s);
  const seen = new Set([correct]);
  const distractors = [];

  const candidates = [
    [p, -q, r, s],            // flip q sign
    [p, q, r, -s],            // flip s sign
    [p, q + 1, r, s],         // off-by-one on q
    [p, q, r, s + 1],         // off-by-one on s
    [p, s, r, q],             // swap q and s (only different when p≠r)
    [p, -q, r, -s],           // both flipped (sometimes equals correct under sign symmetry — caught below)
  ].map(([P, Q, R, S]) => polyfactorFormatBoth(P, Q, R, S));

  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      distractors.push(c);
      if (distractors.length === 3) break;
    }
  }
  // Shuffle options
  const opts = [correct, ...distractors];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { options: opts, correct };
}

app.get('/polyfactor-api/question', (req, res) => {
  let tier = parseInt(req.query.tier, 10);
  if (!tier || isNaN(tier)) {
    const map = { easy: 1, medium: 2, hard: 3, extrahard: 4 };
    tier = map[req.query.difficulty] || 1;
  }
  tier = Math.max(1, Math.min(4, tier));
  const level = Math.max(1, Math.min(3, parseInt(req.query.level, 10) || 1));
  const seen = String(req.query.seen || '').split(',').filter(Boolean);

  let attempt = 0;
  let factors;
  let id;
  do {
    factors = polyfactorPickFactors(tier);
    id = `pf-T${tier}-L${level}-${factors.p},${factors.q},${factors.r},${factors.s}`;
    attempt++;
  } while (seen.includes(id) && attempt < 25);

  const { p, q, r, s } = factors;
  const { a, b, c } = polyfactorExpand(p, q, r, s);
  const display = formatPoly([c, b, a]);

  // Worked example (shown by client on struggle)
  const worked = {
    heading: `Worked example: ${display}`,
    lines: [
      `Find two numbers whose product is ${c} and that combine (with a=${a}) to give the middle term ${b}.`,
      `Those numbers correspond to factors ${polyfactorFormat(p, q)} and ${polyfactorFormat(r, s)}.`,
      `Check: ${polyfactorFormatBoth(p, q, r, s)} = ${display}.`,
    ],
  };

  if (level === 1) {
    const { options, correct } = polyfactorMCQOptions(p, q, r, s, tier);
    return res.json({
      id, tier, level, kind: 'mcq',
      a, b, c,
      factors: { p, q, r, s },
      display, prompt: `Factorise: ${display}`,
      options, correct,
      worked,
    });
  }

  if (level === 2) {
    // Choose a blank variant: 'both' (both factors), 'q', 's', or 'sign'
    const variants = ['both', 'q', 's'];
    if (q !== 0 && s !== 0 && Math.random() < 0.25) variants.push('sign');
    const variant = variants[Math.floor(Math.random() * variants.length)];
    return res.json({
      id, tier, level, kind: 'fill_blank',
      a, b, c,
      factors: { p, q, r, s },
      variant,                    // tells the client which blanks to render
      display, prompt: `Factorise: ${display}`,
      worked,
    });
  }

  // Level 3 — direct input. Client posts userP/Q/R/S; check accepts commutative orderings.
  return res.json({
    id, tier, level, kind: 'direct',
    a, b, c,
    factors: { p, q, r, s },
    display, prompt: `Factorise completely: ${display}`,
    worked,
  });
});

/**
 * Verify a factorisation. Accepts both orderings of factors
 * (i.e. (x+2)(x+3) and (x+3)(x+2) both pass) per Module 39 dev note.
 */
function polyfactorVerify(a, b, c, p1, q1, p2, q2) {
  const ua = p1 * p2;
  const ub = p1 * q2 + q1 * p2;
  const uc = q1 * q2;
  return ua === a && ub === b && uc === c;
}

app.post('/polyfactor-api/check', express.json(), (req, res) => {
  const { a, b, c, kind, level } = req.body || {};

  if (kind === 'mcq') {
    const { selectedOption, correct: correctOption } = req.body;
    const correct = String(selectedOption) === String(correctOption);
    return res.json({ correct, message: correct ? 'Correct' : 'Incorrect', display: correctOption });
  }

  // For fill_blank and direct we get userP/Q/R/S.
  const userP = Number(req.body.userP);
  const userQ = Number(req.body.userQ);
  const userR = Number(req.body.userR);
  const userS = Number(req.body.userS);

  // Try both orderings to support the commutative case.
  const correct =
    polyfactorVerify(Number(a), Number(b), Number(c), userP, userQ, userR, userS) ||
    polyfactorVerify(Number(a), Number(b), Number(c), userR, userS, userP, userQ);

  // Build a canonical display for feedback
  const display = req.body.display || (req.body.factors
    ? polyfactorFormatBoth(req.body.factors.p, req.body.factors.q, req.body.factors.r, req.body.factors.s)
    : '');

  res.json({ correct, message: correct ? 'Correct' : 'Incorrect', display, level });
});

/**
 * PRIME FACTORIZATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Map prime factorization difficulty to number range
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} range for numbers to factor
 */
function primeRange(difficulty) {
  if (difficulty === 'easy') return { min: 2, max: 100 };
  if (difficulty === 'medium') return { min: 2, max: 300 };
  if (difficulty === 'hard') return { min: 2, max: 1000 };
  if (difficulty === 'extrahard') return { min: 2, max: 5000 };
  return { min: 2, max: 100 };
}

/**
 * Find all prime factors of a number using trial division
 * Returns factors in ascending order (with repetition)
 *
 * Algorithm: Divide by 2, 3, 5, ... up to √n
 * Time complexity: O(√n)
 *
 * Examples:
 *   primeFactors(12) = [2, 2, 3]
 *   primeFactors(17) = [17]
 *   primeFactors(100) = [2, 2, 5, 5]
 *
 * @param {number} n - Number to factor (n > 1)
 * @returns {Array<number>} Prime factors in ascending order
 */
function primeFactors(n) {
  const factors = [];
  let d = 2;
  // Trial division: check all potential divisors up to √n
  while (d * d <= n) {
    while (n % d === 0) { factors.push(d); n /= d; }
    d++;
  }
  // If n > 1 at this point, n itself is prime
  if (n > 1) factors.push(n);
  return factors;
}

/**
 * GET /primefactor-api/question
 * Generate a prime factorization problem
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   number: number,         // Number to factor
 *   factors: Array<number>  // Correct prime factors (in ascending order, with repetition)
 * }
 */
app.get('/primefactor-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = primeRange(difficulty);
  let n = randomInt(range.min, range.max);
  // Never give a prime number — ensure at least 2 prime factors (counting multiplicity)
  while (primeFactors(n).length < 2) n = randomInt(range.min, range.max);
  res.json({
    id: `prime-${Date.now()}-${Math.random()}`,
    number: n,
    factors: primeFactors(n),
  });
});

/**
 * POST /primefactor-api/check
 * Verify if user found all prime factors of a number
 * Compares sorted arrays of factors (order-independent)
 *
 * Request Body:
 * {
 *   number: number,         // Number that was factored
 *   userFactors: Array<number> // User's list of prime factors
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctFactors: Array<number>, // The correct prime factors
 *   message: string
 * }
 */
app.post('/primefactor-api/check', (req, res) => {
  const { number, userFactors } = req.body || {};
  const correct = primeFactors(Number(number));
  const userSorted = (userFactors || []).map(Number).sort((a, b) => a - b);
  const isCorrect = correct.length === userSorted.length && correct.every((f, i) => f === userSorted[i]);
  res.json({ correct: isCorrect, correctFactors: correct, message: isCorrect ? 'Correct' : 'Incorrect' });
});

/**
 * QUADRATIC FORMULA API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Map quadratic formula difficulty to coefficient range
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} coefficient range
 */
function qfRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 10 };
  if (difficulty === 'medium') return { min: 1, max: 20 };
  if (difficulty === 'hard') return { min: 1, max: 30 };
  if (difficulty === 'extrahard') return { min: 1, max: 50 };
  return { min: 1, max: 10 };
}

/**
 * GET /qformula-api/question
 * Generate a quadratic formula problem: solve ax² + bx + c = 0
 *
 * Strategy by difficulty:
 *   - Easy: Guarantee integer roots (build from roots, then expand)
 *   - Medium: Guarantee real roots (discriminant ≥ 0)
 *   - Hard: Allow any roots (may be complex/irrational)
 *
 * Returns calculated roots using the quadratic formula
 * Discriminant determines root type: real distinct / real equal / complex
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   a, b, c: number,        // Quadratic coefficients
 *   disc: number,           // Discriminant (b² - 4ac)
 *   roots: {
 *     type: string,         // 'real_distinct', 'real_equal', or 'complex'
 *     r1, r2: number,       // For real roots (r2 omitted if equal)
 *     realPart, imagPart: number  // For complex roots
 *   }
 * }
 */
app.get('/qformula-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = qfRange(difficulty);
  let a, b, c, disc;
  if (difficulty === 'easy') {
    // Guarantee integer roots: build from roots r1, r2 -> a(x-r1)(x-r2)
    const r1 = randomInt(-range.max, range.max);
    const r2 = randomInt(-range.max, range.max);
    a = 1;
    b = -(r1 + r2);
    c = r1 * r2;
  } else {
    a = randomInt(1, Math.min(range.max, 5));
    b = randomInt(-range.max, range.max);
    if (difficulty === 'medium') {
      // Guarantee real roots (disc >= 0)
      do {
        b = randomInt(-range.max, range.max);
        c = randomInt(-range.max, range.max);
      } while (b * b - 4 * a * c < 0);
    } else {
      c = randomInt(-range.max, range.max);
    }
  }
  disc = b * b - 4 * a * c;
  const roots = {};
  if (disc > 0) {
    // Two distinct real roots
    roots.type = 'real_distinct';
    roots.r1 = parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(2));
    roots.r2 = parseFloat(((-b - Math.sqrt(disc)) / (2 * a)).toFixed(2));
  } else if (disc === 0) {
    // One repeated real root
    roots.type = 'real_equal';
    roots.r1 = parseFloat((-b / (2 * a)).toFixed(2));
  } else {
    // Complex conjugate roots: (-b ± i√|disc|) / (2a)
    roots.type = 'complex';
    roots.realPart = parseFloat((-b / (2 * a)).toFixed(2));
    roots.imagPart = parseFloat((Math.sqrt(-disc) / (2 * a)).toFixed(2));
  }
  res.json({ id: `qf-${Date.now()}-${Math.random()}`, a, b, c, disc, roots });
});

/**
 * POST /qformula-api/check
 * Verify if user correctly solved the quadratic equation
 * Allows small floating-point tolerances (±0.05) for answers
 *
 * Request Body:
 * {
 *   a, b, c: number,        // Quadratic coefficients
 *   userR1, userR2: number, // User's roots (or real/imaginary parts for complex)
 *   userType: string        // Root type (for reference, not always used)
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   roots: object,          // Calculated roots (for learning)
 *   message: string
 * }
 */
app.post('/qformula-api/check', (req, res) => {
  const { a, b, c, userR1, userR2, userType } = req.body || {};
  const A = Number(a), B = Number(b), C = Number(c);
  const disc = B * B - 4 * A * C;
  let correct = false;
  const roots = {};
  if (disc > 0) {
    // Check two distinct real roots (allows either order)
    roots.type = 'real_distinct';
    roots.r1 = parseFloat(((-B + Math.sqrt(disc)) / (2 * A)).toFixed(2));
    roots.r2 = parseFloat(((-B - Math.sqrt(disc)) / (2 * A)).toFixed(2));
    const u1 = parseFloat(Number(userR1).toFixed(2));
    const u2 = parseFloat(Number(userR2).toFixed(2));
    // Accept either order with tolerance of 0.05
    correct = (Math.abs(u1 - roots.r1) < 0.05 && Math.abs(u2 - roots.r2) < 0.05) ||
              (Math.abs(u1 - roots.r2) < 0.05 && Math.abs(u2 - roots.r1) < 0.05);
  } else if (disc === 0) {
    // Check single real root
    roots.type = 'real_equal';
    roots.r1 = parseFloat((-B / (2 * A)).toFixed(2));
    correct = Math.abs(parseFloat(Number(userR1).toFixed(2)) - roots.r1) < 0.05;
  } else {
    // Check complex roots: real part and imaginary part
    roots.type = 'complex';
    roots.realPart = parseFloat((-B / (2 * A)).toFixed(2));
    roots.imagPart = parseFloat((Math.sqrt(-disc) / (2 * A)).toFixed(2));
    correct = Math.abs(Number(userR1) - roots.realPart) < 0.05 && Math.abs(Number(userR2) - roots.imagPart) < 0.05;
  }
  res.json({ correct, roots, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * SIMULTANEOUS EQUATIONS API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Map simultaneous equations difficulty to coefficient range
 * @param {string} difficulty - 'easy' for 2×2, 'hard' for 3×3
 * @returns {object} {min, max} coefficient range
 */
function simulRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 10 };
  if (difficulty === 'medium') return { min: 1, max: 12 };
  if (difficulty === 'hard') return { min: 1, max: 15 };
  if (difficulty === 'extrahard') return { min: 1, max: 20 };
  return { min: 1, max: 10 };
}

/**
 * GET /simul-api/question
 * Generate a system of linear equations (2×2 or 3×3)
 *
 * Strategy: Generate integer solution, then create equations that have it
 * Ensures a unique solution with non-zero determinant
 *
 * 2×2 System:
 *   a₁x + b₁y = d₁
 *   a₂x + b₂y = d₂
 *
 * 3×3 System:
 *   a₁x + b₁y + c₁z = d₁
 *   a₂x + b₂y + c₂z = d₂
 *   a₃x + b₃y + c₃z = d₃
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy' (2×2) or 'hard' (3×3; default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   size: number,           // 2 or 3 (system size)
 *   eqs: Array<object>,     // Equation coefficients and RHS
 *   solution: object        // The correct solution {x, y} or {x, y, z}
 * }
 */
app.get('/simul-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = simulRange(difficulty);
  const is2x2 = difficulty === 'easy' || difficulty === 'medium';

  if (is2x2) {
    // 2×2: generate integer solutions, then build equations
    const x = randomInt(-range.max, range.max);
    const y = randomInt(-range.max, range.max);
    let a1 = randomInt(1, range.max), b1 = randomInt(1, range.max);
    let a2 = randomInt(1, range.max), b2 = randomInt(1, range.max);
    // Ensure non-singular matrix (a1*b2 ≠ a2*b1)
    while (a1 * b2 === a2 * b1) { a2 = randomInt(1, range.max); b2 = randomInt(1, range.max); }
    // Randomly make some coefficients negative
    if (Math.random() < 0.3) a1 = -a1;
    if (Math.random() < 0.3) b1 = -b1;
    if (Math.random() < 0.3) a2 = -a2;
    if (Math.random() < 0.3) b2 = -b2;
    const eqs = [
      { a: a1, b: b1, d: a1 * x + b1 * y },
      { a: a2, b: b2, d: a2 * x + b2 * y },
    ];
    res.json({
      id: `simul-${Date.now()}-${Math.random()}`,
      size: 2,
      eqs,
      solution: { x, y },
    });
  } else if (difficulty === 'hard' || difficulty === 'extrahard') {
    // 3×3: generate integer solutions, then build equations
    const x = randomInt(-8, 8), y = randomInt(-8, 8), z = randomInt(-8, 8);
    let eqs;
    let attempts = 0;
    // Generate 3×3 system with non-zero determinant (may require multiple attempts)
    do {
      eqs = [];
      for (let i = 0; i < 3; i++) {
        let a = randomInt(1, Math.min(range.max, 10));
        let b = randomInt(1, Math.min(range.max, 10));
        let c = randomInt(1, Math.min(range.max, 10));
        if (Math.random() < 0.3) a = -a;
        if (Math.random() < 0.3) b = -b;
        if (Math.random() < 0.3) c = -c;
        eqs.push({ a, b, c, d: a * x + b * y + c * z });
      }
      // Calculate 3×3 determinant using expansion
      const det = eqs[0].a * (eqs[1].b * eqs[2].c - eqs[1].c * eqs[2].b)
                - eqs[0].b * (eqs[1].a * eqs[2].c - eqs[1].c * eqs[2].a)
                + eqs[0].c * (eqs[1].a * eqs[2].b - eqs[1].b * eqs[2].a);
      if (det !== 0) break;
      attempts++;
    } while (attempts < 50);

    res.json({
      id: `simul-${Date.now()}-${Math.random()}`,
      size: 3,
      eqs,
      solution: { x, y, z },
    });
  } else {
    // Default to easy (2×2)
    const range2 = simulRange('easy');
    const x = randomInt(-range2.max, range2.max);
    const y = randomInt(-range2.max, range2.max);
    let a1 = randomInt(1, range2.max), b1 = randomInt(1, range2.max);
    let a2 = randomInt(1, range2.max), b2 = randomInt(1, range2.max);
    while (a1 * b2 === a2 * b1) { a2 = randomInt(1, range2.max); b2 = randomInt(1, range2.max); }
    if (Math.random() < 0.3) a1 = -a1;
    if (Math.random() < 0.3) b1 = -b1;
    if (Math.random() < 0.3) a2 = -a2;
    if (Math.random() < 0.3) b2 = -b2;
    const eqs = [
      { a: a1, b: b1, d: a1 * x + b1 * y },
      { a: a2, b: b2, d: a2 * x + b2 * y },
    ];
    res.json({
      id: `simul-${Date.now()}-${Math.random()}`,
      size: 2,
      eqs,
      solution: { x, y },
    });
  }
});

/**
 * POST /simul-api/check
 * Verify if user correctly solved the system of linear equations
 * Allows small floating-point tolerances (±0.1)
 *
 * Request Body:
 * {
 *   eqs: Array<object>,     // Equations with coefficients
 *   size: number,           // System size (2 or 3)
 *   userX, userY, userZ: number, // User's solution values
 *   solution: object        // Correct solution (for comparison)
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   solution: object,       // Correct solution
 *   message: string
 * }
 */
app.post('/simul-api/check', (req, res) => {
  const { eqs, size, userX, userY, userZ } = req.body || {};
  const ux = Number(userX), uy = Number(userY), uz = Number(userZ || 0);
  let correct;
  if (Number(size) === 2) {
    // Check 2×2: verify equations are satisfied with tolerance
    correct = eqs.every(e => Math.abs(e.a * ux + e.b * uy - e.d) < 0.1);
  } else {
    // Check 3×3: verify equations are satisfied with tolerance
    correct = eqs.every(e => Math.abs(e.a * ux + e.b * uy + e.c * uz - e.d) < 0.1);
  }
  const solution = req.body.solution || {};
  res.json({ correct, solution, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * Map function evaluation difficulty to coefficient/value range
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} coefficient range
 */
function linearRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 5 };
  if (difficulty === 'medium') return { min: 1, max: 10 };
  if (difficulty === 'hard') return { min: 1, max: 15 };
  if (difficulty === 'extrahard') return { min: 1, max: 25 };
  return { min: 1, max: 5 };
}

/**
 * FUNCTION EVALUATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /funceval-api/question
 * Generate a function evaluation problem
 *
 * Difficulty levels:
 *   - Easy: Single-variable linear f(x) = ax + b
 *   - Medium: Two-variable linear f(x,y) = ax + by + c
 *   - Hard: Three-variable linear f(x,y,z) = ax + by + cz + d
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   formula: string,        // Display text of the function
 *   vars: object,           // Variable values to substitute
 *   answer: number          // Correct function output (rounded to 2 decimals)
 * }
 */
app.get('/funceval-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = linearRange(difficulty);
  let formula, vars, answer;
  if (difficulty === 'easy') {
    const a = randomInt(1, range.max), b = randomInt(-range.max, range.max);
    const xVal = randomInt(-range.max, range.max);
    formula = `f(x) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    vars = { x: xVal };
    answer = parseFloat((a * xVal + b).toFixed(2));
  } else if (difficulty === 'medium') {
    const a = randomInt(1, range.max), b = randomInt(1, range.max), c = randomInt(-range.max, range.max);
    const xVal = randomInt(-10, 10), yVal = randomInt(-10, 10);
    formula = `f(x,y) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}y ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`;
    vars = { x: xVal, y: yVal };
    answer = parseFloat((a * xVal + b * yVal + c).toFixed(2));
  } else if (difficulty === 'hard' || difficulty === 'extrahard') {
    const a = randomInt(1, range.max), b = randomInt(1, range.max), cc = randomInt(1, range.max), d = randomInt(-range.max, range.max);
    const xVal = randomInt(-10, 10), yVal = randomInt(-10, 10), zVal = randomInt(-10, 10);
    formula = `f(x,y,z) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}y ${cc >= 0 ? '+' : '−'} ${Math.abs(cc)}z ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`;
    vars = { x: xVal, y: yVal, z: zVal };
    answer = parseFloat((a * xVal + b * yVal + cc * zVal + d).toFixed(2));
  } else {
    // Default to easy
    const a = randomInt(1, 5), b = randomInt(-5, 5);
    const xVal = randomInt(-5, 5);
    formula = `f(x) = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    vars = { x: xVal };
    answer = parseFloat((a * xVal + b).toFixed(2));
  }
  res.json({ id: `func-${Date.now()}-${Math.random()}`, formula, vars, answer });
});

/**
 * POST /funceval-api/check
 * Verify if user correctly evaluated the function
 * Allows floating-point tolerance (±0.05)
 *
 * Request Body:
 * {
 *   answer: number,         // Correct function output
 *   userAnswer: number      // User's calculated output
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctAnswer: number,
 *   message: string
 * }
 */
app.post('/funceval-api/check', (req, res) => {
  const { answer, userAnswer } = req.body || {};
  const correct = Math.abs(Number(userAnswer) - Number(answer)) < 0.05;
  res.json({ correct, correctAnswer: answer, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * LINE EQUATION API
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * GET /lineq-api/question
 * Generate a line equation problem: find m and c for y = mx + c given two points
 *
 * Task: Given (x₁, y₁) and (x₂, y₂), find slope m = (y₂-y₁)/(x₂-x₁) and y-intercept c
 *
 * Difficulty:
 *   - Easy: Pre-calculated m and c with small integer values
 *   - Medium: Random points with calculated m and c
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy' or 'medium' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   x1, y1, x2, y2: number, // Two points on the line
 *   m: number,              // Correct slope
 *   c: number               // Correct y-intercept
 * }
 */
app.get('/lineq-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = linearRange(difficulty);
  let x1, y1, x2, y2, m, c;
  // Ensure distinct x values and clean slope for easy
  if (difficulty === 'easy') {
    m = randomInt(-range.max, range.max);
    c = randomInt(-range.max, range.max);
    x1 = randomInt(-5, 5);
    x2 = randomInt(-5, 5);
    while (x2 === x1) x2 = randomInt(-5, 5);
    // Calculate y values using the line equation
    y1 = m * x1 + c;
    y2 = m * x2 + c;
  } else if (difficulty === 'medium' || difficulty === 'hard' || difficulty === 'extrahard') {
    // Random points: calculate m and c from them
    x1 = randomInt(-range.max, range.max);
    y1 = randomInt(-range.max, range.max);
    x2 = randomInt(-range.max, range.max);
    while (x2 === x1) x2 = randomInt(-range.max, range.max);
    y2 = randomInt(-range.max, range.max);
    m = parseFloat(((y2 - y1) / (x2 - x1)).toFixed(2));
    c = parseFloat((y1 - m * x1).toFixed(2));
  } else {
    // Default to easy
    m = randomInt(-5, 5);
    c = randomInt(-5, 5);
    x1 = randomInt(-5, 5);
    x2 = randomInt(-5, 5);
    while (x2 === x1) x2 = randomInt(-5, 5);
    y1 = m * x1 + c;
    y2 = m * x2 + c;
  }
  res.json({
    id: `lineq-${Date.now()}-${Math.random()}`,
    x1, y1, x2, y2, m, c,
  });
});

/**
 * POST /lineq-api/check
 * Verify if user correctly found the line equation parameters
 * Allows floating-point tolerance (±0.05)
 *
 * Request Body:
 * {
 *   x1, y1, x2, y2: number, // Two points
 *   userM, userC: number    // User's slope and y-intercept
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   m: number,              // Correct slope
 *   c: number,              // Correct y-intercept
 *   message: string
 * }
 */
app.post('/lineq-api/check', (req, res) => {
  const { x1, y1, x2, y2, userM, userC } = req.body || {};
  const actualM = parseFloat(((Number(y2) - Number(y1)) / (Number(x2) - Number(x1))).toFixed(2));
  const actualC = parseFloat((Number(y1) - actualM * Number(x1)).toFixed(2));
  const correct = Math.abs(Number(userM) - actualM) < 0.05 && Math.abs(Number(userC) - actualC) < 0.05;
  res.json({ correct, m: actualM, c: actualC, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * BASIC ARITHMETIC API (+, −, ×)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Map basic arithmetic difficulty to operand range
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} {min, max} operand range
 */
function arithRange(difficulty) {
  if (difficulty === 'easy') return { min: 1, max: 9 };
  if (difficulty === 'medium') return { min: 10, max: 99 };
  if (difficulty === 'hard') return { min: 100, max: 999 };
  if (difficulty === 'extrahard') return { min: 1000, max: 9999 };
  return { min: 1, max: 9 };
}

/**
 * GET /basicarith-api/question
 * Generate a basic arithmetic problem with random operation and operands
 * Operations: Addition (+), Subtraction (−), Multiplication (×), Division (÷)
 *
 * Division questions are always exact (no remainder): we generate the divisor
 * and quotient first, then compute the dividend a = b × q.
 *
 * Query Parameters:
 *   - difficulty (optional): 'easy', 'medium', or 'hard' (default: 'easy')
 *
 * Response:
 * {
 *   id: string,
 *   a, b: number,           // Two operands
 *   op: string,             // Operator (+, −, ×, or ÷)
 *   prompt: string,         // Display text with proper formatting
 *   answer: number          // Correct result
 * }
 */
app.get('/basicarith-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const range = arithRange(difficulty);
  const ops = ['+', '−', '×', '÷'];
  const op = ops[randomInt(0, 3)];
  // Generate two numbers, each randomly positive or negative
  let a = randomInt(range.min, range.max);
  let b = randomInt(range.min, range.max);
  if (Math.random() < 0.4) a = -a;
  if (Math.random() < 0.4) b = -b;
  let answer;
  if (op === '+') answer = a + b;
  else if (op === '−') answer = a - b;
  else if (op === '×') answer = a * b;
  else {
    // Division: ensure divisor != 0 and result is an integer.
    // Pick a non-zero divisor b in the same range, then a quotient q in a smaller
    // range; compute a = b * q so the answer is exact.
    if (b === 0) b = 1;
    // Reuse arithRange for the quotient but cap its magnitude to keep questions readable
    const qMag = Math.max(1, Math.min(Math.abs(range.max), 12));
    let q = randomInt(1, qMag);
    if (Math.random() < 0.4) q = -q;
    a = b * q;
    answer = q;
  }
  // Build a readable prompt with proper sign handling
  let prompt;
  if (op === '×' || op === '÷') {
    prompt = `(${a}) ${op} (${b})`;
  } else if (b < 0) {
    prompt = `${a} ${op} (${b})`;
  } else {
    prompt = `${a} ${op} ${b}`;
  }
  res.json({
    id: `arith-${Date.now()}-${Math.random()}`,
    a, b, op, prompt, answer,
  });
});

/**
 * POST /basicarith-api/check
 * Verify if user correctly solved the arithmetic problem
 *
 * Request Body:
 * {
 *   a, b: number,           // Operands
 *   op: string,             // Operator (+, −, or ×)
 *   answer: number          // User's result
 * }
 *
 * Response:
 * {
 *   correct: boolean,
 *   correctAnswer: number,
 *   message: string
 * }
 */
app.post('/basicarith-api/check', (req, res) => {
  const { a, b, op, answer } = req.body || {};
  let correctAnswer;
  if (op === '+') correctAnswer = Number(a) + Number(b);
  else if (op === '−') correctAnswer = Number(a) - Number(b);
  else if (op === '×') correctAnswer = Number(a) * Number(b);
  else if (op === '÷') {
    // Defensive: never divide by zero. Questions are generated with b != 0,
    // so this is just a safety net.
    correctAnswer = Number(b) === 0 ? NaN : Number(a) / Number(b);
  } else correctAnswer = NaN;
  const correct = Number(answer) === correctAnswer;
  res.json({ correct, correctAnswer, message: correct ? 'Correct' : 'Incorrect' });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FRACTION ADDITION QUIZ API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Generates fraction addition problems at three difficulty levels:
 *   - Easy:   Same denominators (e.g., 2/5 + 1/5), denominators 2-10
 *   - Medium: Different denominators requiring LCD (e.g., 1/3 + 1/4), denominators 2-12
 *   - Hard:   Mixed numbers (e.g., 1⅔ + 2¼), denominators 2-15
 *
 * All answers must be in simplified form. The server computes the correct
 * simplified answer using GCD for reduction.
 *
 * Utility: gcd(a, b) — Euclidean algorithm for Greatest Common Divisor
 * Used to simplify fractions to lowest terms.
 */

/**
 * gcd(a, b): Compute Greatest Common Divisor using the Euclidean algorithm.
 * Works with non-negative integers. Used to reduce fractions to lowest terms.
 *
 * @param {number} a - First non-negative integer
 * @param {number} b - Second non-negative integer
 * @returns {number} GCD of a and b
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * simplifyFraction(num, den): Reduce a fraction to lowest terms.
 * Ensures the denominator is always positive. Returns {num, den}.
 *
 * @param {number} num - Numerator (can be negative)
 * @param {number} den - Denominator (must be non-zero)
 * @returns {{num: number, den: number}} Simplified fraction
 */
function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

/**
 * toMixed(num, den): Convert an improper fraction to mixed number form.
 * Returns {whole, num, den} where the fraction part is always non-negative
 * and in simplified form. If fraction is proper, whole=0.
 *
 * @param {number} num - Numerator
 * @param {number} den - Denominator (positive)
 * @returns {{whole: number, num: number, den: number}} Mixed number representation
 */
function toMixed(num, den) {
  const s = simplifyFraction(num, den);
  const whole = Math.trunc(s.num / s.den);
  let remainder = Math.abs(s.num % s.den);
  return { whole, num: remainder, den: s.den };
}

/**
 * GET /fractionadd-api/question
 *
 * Generates a random fraction addition question at the specified difficulty.
 *
 * Query Parameters:
 *   difficulty: 'easy' | 'medium' | 'hard' (default: 'easy')
 *
 * Response (Easy/Medium): {
 *   id: number,
 *   n1: number, d1: number,   // First fraction: n1/d1
 *   n2: number, d2: number,   // Second fraction: n2/d2
 *   difficulty: string,
 *   mixed: false
 * }
 *
 * Response (Hard - mixed numbers): {
 *   id: number,
 *   w1: number, n1: number, d1: number,  // First mixed number: w1 n1/d1
 *   w2: number, n2: number, d2: number,  // Second mixed number: w2 n2/d2
 *   difficulty: 'hard',
 *   mixed: true
 * }
 */
app.get('/fractionadd-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();
  // Choose a random operation. Caller may force one via ?op=+|-|×|÷
  const opQuery = req.query.op;
  const opPool = ['+', '−', '×', '÷'];
  const op = opPool.includes(opQuery) ? opQuery : opPool[Math.floor(Math.random() * opPool.length)];

  if (difficulty === 'easy') {
    // Same denominators (for + / −) or simple proper fractions (for × / ÷),
    // denominators 2-10
    const den = Math.floor(Math.random() * 9) + 2; // 2..10
    const n1 = Math.floor(Math.random() * (den - 1)) + 1; // 1..(den-1)
    const n2 = Math.floor(Math.random() * (den - 1)) + 1;
    res.json({ id, n1, d1: den, n2, d2: den, op, difficulty, mixed: false });
  } else if (difficulty === 'medium') {
    // Different denominators, denominators 2-12
    // Ensure d1 != d2 for a meaningful LCD problem (for + / −).
    const d1 = Math.floor(Math.random() * 11) + 2; // 2..12
    let d2 = Math.floor(Math.random() * 11) + 2;
    while (d2 === d1) d2 = Math.floor(Math.random() * 11) + 2;
    const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
    const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
    res.json({ id, n1, d1, n2, d2, op, difficulty, mixed: false });
  } else {
    // Hard: Mixed numbers with different denominators 2-15
    const d1 = Math.floor(Math.random() * 14) + 2; // 2..15
    let d2 = Math.floor(Math.random() * 14) + 2;
    while (d2 === d1) d2 = Math.floor(Math.random() * 14) + 2;
    const w1 = Math.floor(Math.random() * 5) + 1; // whole part 1..5
    const w2 = Math.floor(Math.random() * 5) + 1;
    const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
    const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
    res.json({ id, w1, n1, d1: d1, w2, n2, d2: d2, op, difficulty: 'hard', mixed: true });
  }
});

/**
 * POST /fractionadd-api/check
 *
 * Validates the user's fraction addition answer. Computes the correct sum
 * and compares it (in simplified form) to the user's answer.
 *
 * Request Body (Easy/Medium): {
 *   n1: number, d1: number, n2: number, d2: number,
 *   ansNum: number, ansDen: number,
 *   mixed: false
 * }
 *
 * Request Body (Hard): {
 *   w1: number, n1: number, d1: number,
 *   w2: number, n2: number, d2: number,
 *   ansWhole: number, ansNum: number, ansDen: number,
 *   mixed: true
 * }
 *
 * Response: {
 *   correct: boolean,
 *   correctNum: number,     // Correct answer numerator (simplified)
 *   correctDen: number,     // Correct answer denominator (simplified)
 *   correctWhole?: number,  // Correct whole part (hard mode only)
 *   display: string,        // Formatted correct answer string
 *   message: string
 * }
 */
app.post('/fractionadd-api/check', (req, res) => {
  const body = req.body || {};
  // Default op is '+' for backward compatibility with older clients that
  // only supported addition.
  const op = body.op || '+';
  let totalNum, totalDen;

  // Convert each operand to an improper fraction (top/bot)
  let top1, bot1, top2, bot2;
  if (body.mixed) {
    top1 = body.w1 * body.d1 + body.n1; bot1 = body.d1;
    top2 = body.w2 * body.d2 + body.n2; bot2 = body.d2;
  } else {
    top1 = body.n1; bot1 = body.d1;
    top2 = body.n2; bot2 = body.d2;
  }

  if (op === '+') {
    totalNum = top1 * bot2 + top2 * bot1;
    totalDen = bot1 * bot2;
  } else if (op === '−' || op === '-') {
    totalNum = top1 * bot2 - top2 * bot1;
    totalDen = bot1 * bot2;
  } else if (op === '×' || op === '*') {
    totalNum = top1 * top2;
    totalDen = bot1 * bot2;
  } else if (op === '÷' || op === '/') {
    // Division: invert second operand and multiply.
    // Guard against the (extremely unlikely) zero numerator.
    if (top2 === 0) { totalNum = 0; totalDen = 1; }
    else { totalNum = top1 * bot2; totalDen = bot1 * top2; }
  } else {
    totalNum = top1 * bot2 + top2 * bot1;
    totalDen = bot1 * bot2;
  }

  // Simplify the correct answer
  const simplified = simplifyFraction(totalNum, totalDen);

  let correct, display;

  if (body.mixed) {
    // Hard: expect answer as mixed number {ansWhole, ansNum, ansDen}
    const mixed = toMixed(simplified.num, simplified.den);
    // User answer: convert to improper fraction for comparison
    const userTotal = (Number(body.ansWhole) || 0) * (Number(body.ansDen) || 1) + (Number(body.ansNum) || 0);
    const userDen = Number(body.ansDen) || 1;
    const userSimp = simplifyFraction(userTotal, userDen);
    correct = userSimp.num === simplified.num && userSimp.den === simplified.den;
    // Display format: "3 2/5" or "7/3" if no whole part
    if (mixed.num === 0) {
      display = `${mixed.whole}`;
    } else if (mixed.whole === 0) {
      display = `${simplified.num}/${simplified.den}`;
    } else {
      display = `${mixed.whole} ${mixed.num}/${mixed.den}`;
    }
  } else {
    // Easy/Medium: expect answer as fraction {ansNum, ansDen}
    const userSimp = simplifyFraction(Number(body.ansNum) || 0, Number(body.ansDen) || 1);
    correct = userSimp.num === simplified.num && userSimp.den === simplified.den;
    // Display: if denominator is 1, show as whole number
    if (simplified.den === 1) {
      display = `${simplified.num}`;
    } else {
      display = `${simplified.num}/${simplified.den}`;
    }
  }

  res.json({
    correct,
    correctNum: simplified.num,
    correctDen: simplified.den,
    ...(body.mixed ? { correctWhole: toMixed(simplified.num, simplified.den).whole } : {}),
    display,
    message: correct ? 'Correct!' : 'Incorrect'
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SURDS API — Simplify, add/subtract, multiply, rationalise denominators
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Utility: check if n is a perfect square
 */
function isPerfectSquare(n) {
  if (n < 0) return false;
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

/**
 * Utility: largest perfect-square factor of n (n>0)
 * Returns { outer, inner } such that √n = outer × √inner, inner is square-free
 */
function simpleSurd(n) {
  let outer = 1;
  let inner = n;
  for (let f = 2; f * f <= inner; f++) {
    while (inner % (f * f) === 0) {
      outer *= f;
      inner /= (f * f);
    }
  }
  return { outer, inner };
}

/**
 * Utility: list of small primes for generating radicands
 */
const SQUARE_FREE = [2,3,5,6,7,10,11,13,14,15,17,19,21,22,23,26,29,30];

function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Half-up rounding that is robust to IEEE-754 representation errors.
 *
 * Native JS toFixed/toPrecision can mis-round numbers like 6.835 (returns
 * "6.83" because the underlying double is 6.8349999...). Standard "round half
 * up" rounding requires that when the digit being dropped is 5–9 the previous
 * digit increments by 1, regardless of the parity of the preceding digit.
 *
 * Algorithm: walk the decimal *string* of the value (so we never re-enter
 * floating-point arithmetic mid-rounding) and apply a textual increment-with-
 * carry when the first dropped digit is >= 5.
 *
 * Supports negative dp (round to nearest 10^|dp|) so the same routine can be
 * reused for significant-figure rounding.
 *
 * @param {number} value  The value to round.
 * @param {number} dp     Decimal places (negative allowed for tens/hundreds).
 * @returns {number}      Rounded value.
 */
function roundHalfUp(value, dp = 0) {
  if (!isFinite(value) || value === 0) return value;
  const negative = value < 0;
  let s = Math.abs(value).toString();
  if (/e/i.test(s)) {
    // Expand scientific notation to a plain decimal with extra precision
    s = Math.abs(value).toFixed(Math.max(20, dp + 5));
  }
  let [intStr, decStr = ''] = s.split('.');
  if (dp >= 0) {
    if (decStr.length <= dp) {
      return negative ? -parseFloat(s) : parseFloat(s);
    }
    const keep = intStr + decStr.slice(0, dp);
    const checkDigit = parseInt(decStr[dp], 10);
    let resultDigits;
    if (checkDigit >= 5) {
      const incremented = (BigInt(keep) + 1n).toString();
      resultDigits = incremented.length >= keep.length
        ? incremented
        : incremented.padStart(keep.length, '0');
    } else {
      resultDigits = keep;
    }
    let resInt, resDec;
    if (dp === 0) {
      resInt = resultDigits;
      resDec = '';
    } else {
      resInt = resultDigits.slice(0, resultDigits.length - dp);
      resDec = resultDigits.slice(resultDigits.length - dp);
      if (resInt === '') resInt = '0';
    }
    return parseFloat((negative ? '-' : '') + resInt + (resDec ? '.' + resDec : ''));
  } else {
    const removeCount = -dp;
    const padded = intStr.padStart(removeCount + 1, '0');
    const keep = padded.slice(0, padded.length - removeCount);
    const dropFirst = padded[padded.length - removeCount];
    let resultInt;
    if (parseInt(dropFirst, 10) >= 5) {
      resultInt = (BigInt(keep) + 1n).toString();
    } else {
      resultInt = keep;
    }
    return parseFloat((negative ? '-' : '') + resultInt + '0'.repeat(removeCount));
  }
}

/**
 * Round to N significant figures using half-up rules. Reuses roundHalfUp by
 * computing the equivalent decimal-place count from the value's magnitude.
 */
function roundSigFigs(value, sf) {
  if (!isFinite(value) || value === 0) return value;
  const mag = Math.floor(Math.log10(Math.abs(value)));
  const dp = sf - mag - 1;
  return roundHalfUp(value, dp);
}

/**
 * GET /surds-api/question?difficulty=easy|medium|hard|extrahard
 *
 * Easy:      Simplify √n  (e.g. √72 = 6√2)
 * Medium:    Add/subtract like surds (e.g. 3√5 + 2√5 = 5√5)
 * Hard:      Multiply surds and simplify (e.g. √6 × √10 = 2√15)
 * ExtraHard: Rationalise denominators (e.g. 6/√3, or 5/(2+√3))
 */
app.get('/surds-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Simplify √n where n = a² × b, b is square-free
    const b = pick(SQUARE_FREE);
    const a = randInt(2, 9);
    const n = a * a * b;
    res.json({ id, difficulty, type: 'simplify', n });
  }
  else if (difficulty === 'medium') {
    // a√r ± b√r = ?√r
    const r = pick(SQUARE_FREE);
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    const op = pick(['+', '-']);
    // Ensure result is positive for subtraction
    const realA = op === '-' ? Math.max(a, b) + 1 : a;
    const realB = op === '-' ? Math.min(a, b) : b;
    res.json({ id, difficulty, type: 'addsub', a: realA, b: realB, r, op });
  }
  else if (difficulty === 'hard') {
    // √(a) × √(b) = simplify √(a*b)
    // Make sure a*b has a nice simplification
    const r1 = pick(SQUARE_FREE);
    const c1 = randInt(1, 5);
    const r2 = pick(SQUARE_FREE);
    const c2 = randInt(1, 5);
    // Question: (c1√r1) × (c2√r2) — simplify
    res.json({ id, difficulty, type: 'multiply', c1, r1, c2, r2 });
  }
  else {
    // Rationalise denominator
    const subtype = pick(['simple', 'conjugate']);
    if (subtype === 'simple') {
      // a / (b√r)  →  rationalise
      const r = pick(SQUARE_FREE);
      const b = randInt(1, 4);
      const a = randInt(1, 12);
      res.json({ id, difficulty, type: 'rationalise', subtype: 'simple', a, b, r });
    } else {
      // a / (p + q√r) → multiply by conjugate
      const r = pick(SQUARE_FREE);
      const p = randInt(1, 5);
      const q = pick([1, -1, 2, -2, 1, 1]);  // keep q small
      const a = randInt(1, 10);
      res.json({ id, difficulty, type: 'rationalise', subtype: 'conjugate', a, p, q, r });
    }
  }
});

/**
 * POST /surds-api/check
 * Validates user's surd answer
 *
 * Answers accepted as strings, e.g. "6√2", "5√5", "2√15", "2√3", "10-5√3", "7"
 * Server computes the correct answer and compares.
 */
app.post('/surds-api/check', express.json(), (req, res) => {
  const body = req.body;
  const { type } = body;

  /**
   * Parse a surd string like "6√2", "√3", "5", "-3√7", "10-5√3", "10+5√3"
   * Returns { rational: number, coeff: number, radicand: number }
   * where the value = rational + coeff × √radicand
   */
  function parseSurd(s) {
    if (!s || typeof s !== 'string') return null;
    s = s.replace(/\s+/g, '').replace(/−/g, '-');

    // Pure integer
    if (/^-?\d+$/.test(s)) {
      return { rational: parseInt(s), coeff: 0, radicand: 1 };
    }

    // Single surd: c√r or √r
    const singleMatch = s.match(/^(-?\d*)[√](\d+)$/);
    if (singleMatch) {
      const c = singleMatch[1] === '' || singleMatch[1] === '+' ? 1 : singleMatch[1] === '-' ? -1 : parseInt(singleMatch[1]);
      return { rational: 0, coeff: c, radicand: parseInt(singleMatch[2]) };
    }

    // Rational ± coeff√radicand: e.g. "10-5√3" or "10+5√3"
    const mixedMatch = s.match(/^(-?\d+)([+-]\d*)[√](\d+)$/);
    if (mixedMatch) {
      const rat = parseInt(mixedMatch[1]);
      let cStr = mixedMatch[2];
      const c = cStr === '+' ? 1 : cStr === '-' ? -1 : parseInt(cStr);
      return { rational: rat, coeff: c, radicand: parseInt(mixedMatch[3]) };
    }

    return null;
  }

  /**
   * Normalize a surd: simplify √radicand part so radicand is square-free
   * E.g. 2√12 → 4√3
   */
  function normalizeSurd(rational, coeff, radicand) {
    if (coeff === 0 || radicand <= 1) return { rational, coeff, radicand: radicand <= 0 ? 1 : radicand };
    const s = simpleSurd(radicand);
    return { rational, coeff: coeff * s.outer, radicand: s.inner };
  }

  let correctRational = 0, correctCoeff = 0, correctRadicand = 1;

  if (type === 'simplify') {
    // √n → outer√inner
    const s = simpleSurd(body.n);
    correctCoeff = s.outer;
    correctRadicand = s.inner;
    if (correctRadicand === 1) { correctRational = correctCoeff; correctCoeff = 0; }
  }
  else if (type === 'addsub') {
    const { a, b, r, op } = body;
    correctCoeff = op === '+' ? a + b : a - b;
    correctRadicand = r;
    if (correctCoeff === 0) { correctRational = 0; correctCoeff = 0; correctRadicand = 1; }
  }
  else if (type === 'multiply') {
    // (c1√r1) × (c2√r2) = c1*c2 * √(r1*r2), then simplify
    const { c1, r1, c2, r2 } = body;
    const prodCoeff = c1 * c2;
    const prodRad = r1 * r2;
    const s = simpleSurd(prodRad);
    correctCoeff = prodCoeff * s.outer;
    correctRadicand = s.inner;
    if (correctRadicand === 1) { correctRational = correctCoeff; correctCoeff = 0; }
  }
  else if (type === 'rationalise') {
    const { subtype, a, r } = body;
    if (subtype === 'simple') {
      // a / (b√r) = a/(b√r) × (√r/√r) = a√r / (b*r)
      const b = body.b;
      const numCoeff = a;      // a√r
      const den = b * r;       // b*r
      // Simplify: gcd of numCoeff and den
      const g = gcd(Math.abs(numCoeff), Math.abs(den));
      correctCoeff = numCoeff / g;
      correctRadicand = r;
      const finalDen = den / g;
      if (finalDen !== 1) {
        // Express as fraction: (a/g)√r / (den/g)
        // We need to represent this carefully
        // Actually: a/(b√r) = (a√r)/(b*r) — simplify fraction a/(b*r) then attach √r
        // Result coeff is the simplified numerator, but if den != 1 we have a fraction
        // For simplicity, we'll compute: numerator = a, denominator = b*r, simplify, coeff = num/den * √r
        // But user types e.g. "2√3/3" — let's handle this differently
        // We'll express answer as fraction string and parse accordingly
        correctRational = 0;
        correctCoeff = numCoeff / g;
        correctRadicand = r;
        // Store denominator for comparison
        body._correctDen = finalDen;
      } else {
        correctRational = 0;
        body._correctDen = 1;
      }
    } else {
      // a / (p + q√r) — multiply by conjugate (p - q√r)/(p - q√r)
      const { p, q } = body;
      const den = p * p - q * q * r;  // (p+q√r)(p-q√r) = p² - q²r
      const numRational = a * p;       // a*p from the numerator
      const numCoeff = -a * q;         // -a*q√r from the numerator
      // Result: (numRational + numCoeff√r) / den
      // Simplify by dividing all parts by gcd
      const g = gcd(gcd(Math.abs(numRational), Math.abs(numCoeff)), Math.abs(den));
      const sign = den < 0 ? -1 : 1;  // ensure positive denominator
      correctRational = (numRational / g) * sign;
      correctCoeff = (numCoeff / g) * sign;
      correctRadicand = r;
      body._correctDen = Math.abs(den) / g;
      if (correctCoeff === 0) correctRadicand = 1;
    }
  }

  // Parse user answer
  const userParsed = parseSurd(body.answer);

  // Build display string for correct answer
  let display = '';
  const cDen = body._correctDen || 1;

  if (cDen === 1) {
    if (correctCoeff === 0) {
      display = `${correctRational}`;
    } else if (correctRational === 0) {
      if (correctCoeff === 1) display = `√${correctRadicand}`;
      else if (correctCoeff === -1) display = `-√${correctRadicand}`;
      else display = `${correctCoeff}√${correctRadicand}`;
    } else {
      const sign = correctCoeff > 0 ? '+' : '';
      const cPart = Math.abs(correctCoeff) === 1 ? (correctCoeff > 0 ? '' : '-') : `${correctCoeff}`;
      display = `${correctRational}${sign}${cPart}√${correctRadicand}`;
    }
  } else {
    // Fractional answer
    if (correctCoeff === 0) {
      display = `${correctRational}/${cDen}`;
    } else if (correctRational === 0) {
      const cPart = Math.abs(correctCoeff) === 1 ? (correctCoeff > 0 ? '' : '-') : `${correctCoeff}`;
      display = `${cPart}√${correctRadicand}/${cDen}`;
    } else {
      const sign = correctCoeff > 0 ? '+' : '';
      const cPart = Math.abs(correctCoeff) === 1 ? (correctCoeff > 0 ? '' : '-') : `${correctCoeff}`;
      display = `(${correctRational}${sign}${cPart}√${correctRadicand})/${cDen}`;
    }
  }

  // Check correctness
  let correct = false;
  if (userParsed && cDen === 1) {
    // Normalize user's surd
    const userNorm = normalizeSurd(userParsed.rational, userParsed.coeff, userParsed.radicand);
    correct = userNorm.rational === correctRational
           && userNorm.coeff === correctCoeff
           && (correctCoeff === 0 || userNorm.radicand === correctRadicand);
  } else if (userParsed && cDen !== 1) {
    // User might type e.g. "2√3/3" — parse fraction form
    // Try parsing as "X/Y" where X is a surd expression
    const fracMatch = (body.answer || '').replace(/\s+/g, '').match(/^\(?(.+?)\)?\/?(\d+)$/);
    if (fracMatch) {
      const numParsed = parseSurd(fracMatch[1]);
      const userDen = parseInt(fracMatch[2]);
      if (numParsed) {
        const numNorm = normalizeSurd(numParsed.rational, numParsed.coeff, numParsed.radicand);
        // Compare: user's (numNorm)/userDen vs correct/cDen
        // Cross multiply to avoid floating point
        correct = numNorm.rational * cDen === correctRational * userDen
               && numNorm.coeff * cDen === correctCoeff * userDen
               && (correctCoeff === 0 || numNorm.radicand === correctRadicand);
      }
    }
  }

  res.json({
    correct,
    display,
    message: correct ? 'Correct!' : 'Incorrect'
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INDICES API — Laws of exponents (IGCSE syllabus)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Helper: pick random element
 */
function idxPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function idxRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

/**
 * Helper: format exponent for display — uses Unicode superscripts
 */
function sup(n) {
  const map = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const s = String(Math.abs(n));
  const digits = s.split('').map(d => map[Number(d)]).join('');
  if (n < 0) return '⁻' + digits;
  return digits;
}

/**
 * Helper: format a fractional exponent like 2/3, 1/2, -2/3
 */
function fmtFracExp(num, den) {
  if (den === 1) return String(num);
  return `${num}/${den}`;
}

/**
 * GET /indices-api/question?difficulty=easy|medium|hard|extrahard
 *
 * Easy:      Basic index laws — multiply (add exponents), divide (subtract), power of power
 * Medium:    Zero and negative exponents — evaluate numeric expressions
 * Hard:      Fractional exponents — evaluate e.g. 8^(1/3), 27^(2/3)
 * ExtraHard: Mixed — negative fractional exponents, combined expressions
 */
app.get('/indices-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();
  const bases = ['x', 'y', 'a', 'b', 'm', 'n', 'p'];

  if (difficulty === 'easy') {
    const subtype = idxPick(['multiply', 'divide', 'power']);
    const base = idxPick(bases);
    if (subtype === 'multiply') {
      // a^m × a^n
      const m = idxRand(2, 8);
      const n = idxRand(2, 8);
      const prompt = `${base}${sup(m)} × ${base}${sup(n)}`;
      const answerExp = m + n;
      res.json({ id, difficulty, type: 'simplify', subtype, base, m, n, prompt, answerExp });
    } else if (subtype === 'divide') {
      // a^m ÷ a^n (m > n to keep positive)
      const m = idxRand(5, 12);
      const n = idxRand(1, m - 1);
      const prompt = `${base}${sup(m)} ÷ ${base}${sup(n)}`;
      const answerExp = m - n;
      res.json({ id, difficulty, type: 'simplify', subtype, base, m, n, prompt, answerExp });
    } else {
      // (a^m)^n
      const m = idxRand(2, 5);
      const n = idxRand(2, 5);
      const prompt = `(${base}${sup(m)})${sup(n)}`;
      const answerExp = m * n;
      res.json({ id, difficulty, type: 'simplify', subtype, base, m, n, prompt, answerExp });
    }
  }
  else if (difficulty === 'medium') {
    const subtype = idxPick(['zero', 'negative_eval', 'negative_simplify']);
    if (subtype === 'zero') {
      // a^0 = 1
      const numBase = idxRand(2, 20);
      const prompt = `${numBase}⁰`;
      res.json({ id, difficulty, type: 'evaluate', subtype, prompt, answerNum: 1, answerDen: 1 });
    } else if (subtype === 'negative_eval') {
      // a^(-n) = 1/a^n — evaluate numerically
      const numBase = idxPick([2, 3, 4, 5, 10]);
      const n = idxPick([1, 2, 3]);
      // Keep answer manageable
      if (numBase === 10 && n > 3) n = 2;
      const prompt = `${numBase}${sup(-n)}`;
      const answerNum = 1;
      const answerDen = Math.pow(numBase, n);
      res.json({ id, difficulty, type: 'evaluate', subtype, numBase, n, prompt, answerNum, answerDen });
    } else {
      // Simplify: x^(-a) × x^b
      const base = idxPick(bases);
      const a = idxRand(1, 5);
      const b = idxRand(a + 1, a + 6); // ensure positive result most of the time
      const prompt = `${base}${sup(-a)} × ${base}${sup(b)}`;
      const answerExp = b - a;
      res.json({ id, difficulty, type: 'simplify', subtype, base, m: -a, n: b, prompt, answerExp });
    }
  }
  else if (difficulty === 'hard') {
    // Fractional exponents — evaluate numerically
    // Use bases that have clean roots
    const combos = [
      { base: 4, expNum: 1, expDen: 2 },    // 4^(1/2) = 2
      { base: 9, expNum: 1, expDen: 2 },    // 9^(1/2) = 3
      { base: 16, expNum: 1, expDen: 2 },   // 16^(1/2) = 4
      { base: 25, expNum: 1, expDen: 2 },   // 25^(1/2) = 5
      { base: 36, expNum: 1, expDen: 2 },   // 36^(1/2) = 6
      { base: 49, expNum: 1, expDen: 2 },   // 49^(1/2) = 7
      { base: 64, expNum: 1, expDen: 2 },   // 64^(1/2) = 8
      { base: 100, expNum: 1, expDen: 2 },  // 100^(1/2) = 10
      { base: 8, expNum: 1, expDen: 3 },    // 8^(1/3) = 2
      { base: 27, expNum: 1, expDen: 3 },   // 27^(1/3) = 3
      { base: 64, expNum: 1, expDen: 3 },   // 64^(1/3) = 4
      { base: 125, expNum: 1, expDen: 3 },  // 125^(1/3) = 5
      { base: 16, expNum: 1, expDen: 4 },   // 16^(1/4) = 2
      { base: 81, expNum: 1, expDen: 4 },   // 81^(1/4) = 3
      { base: 32, expNum: 1, expDen: 5 },   // 32^(1/5) = 2
      // m/n fractional exponents
      { base: 4, expNum: 3, expDen: 2 },    // 4^(3/2) = 8
      { base: 9, expNum: 3, expDen: 2 },    // 9^(3/2) = 27
      { base: 8, expNum: 2, expDen: 3 },    // 8^(2/3) = 4
      { base: 27, expNum: 2, expDen: 3 },   // 27^(2/3) = 9
      { base: 27, expNum: 4, expDen: 3 },   // 27^(4/3) = 81
      { base: 16, expNum: 3, expDen: 4 },   // 16^(3/4) = 8
      { base: 16, expNum: 3, expDen: 2 },   // 16^(3/2) = 64
      { base: 25, expNum: 3, expDen: 2 },   // 25^(3/2) = 125
      { base: 32, expNum: 2, expDen: 5 },   // 32^(2/5) = 4
      { base: 32, expNum: 3, expDen: 5 },   // 32^(3/5) = 8
      { base: 64, expNum: 2, expDen: 3 },   // 64^(2/3) = 16
      { base: 100, expNum: 3, expDen: 2 },  // 100^(3/2) = 1000
      { base: 81, expNum: 3, expDen: 4 },   // 81^(3/4) = 27
    ];
    const c = idxPick(combos);
    const root = Math.round(Math.pow(c.base, 1 / c.expDen));
    const answer = Math.pow(root, c.expNum);
    const prompt = `${c.base}^(${fmtFracExp(c.expNum, c.expDen)})`;
    res.json({ id, difficulty, type: 'evaluate', subtype: 'fractional', numBase: c.base, expNum: c.expNum, expDen: c.expDen, prompt, answerNum: answer, answerDen: 1 });
  }
  else {
    // ExtraHard: negative fractional exponents and fraction bases
    const subtype = idxPick(['neg_frac', 'frac_base']);
    if (subtype === 'neg_frac') {
      // a^(-m/n) = 1/a^(m/n)
      const combos = [
        { base: 4, expNum: 1, expDen: 2 },   // 4^(-1/2) = 1/2
        { base: 9, expNum: 1, expDen: 2 },   // 9^(-1/2) = 1/3
        { base: 8, expNum: 1, expDen: 3 },   // 8^(-1/3) = 1/2
        { base: 27, expNum: 1, expDen: 3 },  // 27^(-1/3) = 1/3
        { base: 27, expNum: 2, expDen: 3 },  // 27^(-2/3) = 1/9
        { base: 8, expNum: 2, expDen: 3 },   // 8^(-2/3) = 1/4
        { base: 16, expNum: 3, expDen: 4 },  // 16^(-3/4) = 1/8
        { base: 25, expNum: 3, expDen: 2 },  // 25^(-3/2) = 1/125
        { base: 32, expNum: 2, expDen: 5 },  // 32^(-2/5) = 1/4
        { base: 64, expNum: 2, expDen: 3 },  // 64^(-2/3) = 1/16
        { base: 100, expNum: 1, expDen: 2 }, // 100^(-1/2) = 1/10
        { base: 81, expNum: 3, expDen: 4 },  // 81^(-3/4) = 1/27
      ];
      const c = idxPick(combos);
      const root = Math.round(Math.pow(c.base, 1 / c.expDen));
      const val = Math.pow(root, c.expNum);
      const prompt = `${c.base}^(${fmtFracExp(-c.expNum, c.expDen)})`;
      res.json({ id, difficulty, type: 'evaluate', subtype, numBase: c.base, expNum: -c.expNum, expDen: c.expDen, prompt, answerNum: 1, answerDen: val });
    } else {
      // (a/b)^(-n) = (b/a)^n   or   (a/b)^(m/n)
      const fracBases = [
        { a: 1, b: 2, exp: -2, ansNum: 4, ansDen: 1 },      // (1/2)^(-2) = 4
        { a: 1, b: 3, exp: -2, ansNum: 9, ansDen: 1 },      // (1/3)^(-2) = 9
        { a: 2, b: 3, exp: -1, ansNum: 3, ansDen: 2 },      // (2/3)^(-1) = 3/2
        { a: 2, b: 5, exp: -2, ansNum: 25, ansDen: 4 },     // (2/5)^(-2) = 25/4
        { a: 3, b: 4, exp: -2, ansNum: 16, ansDen: 9 },     // (3/4)^(-2) = 16/9
        { a: 1, b: 5, exp: -3, ansNum: 125, ansDen: 1 },    // (1/5)^(-3) = 125
        { a: 8, b: 27, exp: -100, ansNum: -1, ansDen: -1 },  // placeholder — replaced below
        { a: 4, b: 9, exp: -100, ansNum: -1, ansDen: -1 },   // placeholder — replaced below
      ];
      // Replace placeholders with fractional-exponent fraction bases
      fracBases[6] = { a: 8, b: 27, expNum: -2, expDen: 3, ansNum: 9, ansDen: 4 };  // (8/27)^(-2/3) = 9/4
      fracBases[7] = { a: 4, b: 9, expNum: -1, expDen: 2, ansNum: 3, ansDen: 2 };   // (4/9)^(-1/2) = 3/2

      const c = idxPick(fracBases);
      let prompt, ansNum, ansDen;
      if (c.expNum !== undefined) {
        // Fractional exponent on fraction base
        prompt = `(${c.a}/${c.b})^(${fmtFracExp(c.expNum, c.expDen)})`;
        ansNum = c.ansNum; ansDen = c.ansDen;
      } else {
        prompt = `(${c.a}/${c.b})${sup(c.exp)}`;
        ansNum = c.ansNum; ansDen = c.ansDen;
      }
      res.json({ id, difficulty, type: 'evaluate', subtype, prompt, answerNum: ansNum, answerDen: ansDen });
    }
  }
});

/**
 * POST /indices-api/check
 * Validates user's answer for indices questions.
 *
 * Two modes:
 * - 'simplify': user answers with an exponent (e.g. "7" for x^7, or "-3" for x^(-3))
 * - 'evaluate': user answers with a number or fraction (e.g. "8", "1/4", "9/4")
 */
app.post('/indices-api/check', express.json(), (req, res) => {
  const { type, answerExp, answerNum, answerDen } = req.body;
  const userAnswer = (req.body.answer || '').replace(/\s+/g, '').replace(/−/g, '-');

  let correct = false;
  let display = '';

  if (type === 'simplify') {
    // User should provide the exponent as an integer
    const userExp = parseInt(userAnswer);
    correct = !isNaN(userExp) && userExp === answerExp;
    display = `${req.body.base}${sup(answerExp)}`;
  }
  else if (type === 'evaluate') {
    // Parse user answer as fraction or integer
    let uNum, uDen;
    const fracMatch = userAnswer.match(/^(-?\d+)\/(-?\d+)$/);
    if (fracMatch) {
      uNum = parseInt(fracMatch[1]);
      uDen = parseInt(fracMatch[2]);
    } else {
      const intMatch = userAnswer.match(/^(-?\d+)$/);
      if (intMatch) { uNum = parseInt(intMatch[1]); uDen = 1; }
    }

    if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
      // Simplify both fractions and compare
      const userSimp = simplifyFraction(uNum, uDen);
      const correctSimp = simplifyFraction(answerNum, answerDen);
      correct = userSimp.num === correctSimp.num && userSimp.den === correctSimp.den;
    }

    // Build display
    if (answerDen === 1) {
      display = `${answerNum}`;
    } else {
      const s = simplifyFraction(answerNum, answerDen);
      display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
    }
  }

  res.json({
    correct,
    display,
    message: correct ? 'Correct!' : 'Incorrect'
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEQUENCES & SERIES API
// ═══════════════════════════════════════════════════════════════════════════

function seqRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function seqPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/**
 * GET /sequences-api/question?difficulty=easy|medium|hard|extrahard
 *
 * Easy:      Arithmetic sequences — find the nth term
 * Medium:    Arithmetic series — find the sum of first n terms
 * Hard:      Geometric sequences — find the nth term
 * ExtraHard: Geometric series — find the sum of first n terms
 */
app.get('/sequences-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Arithmetic: a, a+d, a+2d, ... Find the nth term
    const a = seqRand(-10, 20);
    const d = seqRand(-8, 8);
    if (d === 0) d = seqPick([1, -1, 2, -2, 3, 5]);
    const n = seqRand(5, 20);
    const terms = [a, a + d, a + 2 * d, a + 3 * d];
    const answer = a + (n - 1) * d;
    const prompt = `${terms.join(', ')}, ... Find the ${n}th term`;
    res.json({ id, difficulty, type: 'arith_nth', a, d, n, terms, answer, prompt });
  }
  else if (difficulty === 'medium') {
    // Arithmetic: sum of first n terms S_n = n/2 × (2a + (n-1)d)
    const a = seqRand(1, 15);
    const d = seqRand(1, 8);
    const n = seqRand(5, 20);
    const terms = [a, a + d, a + 2 * d, a + 3 * d];
    const answer = Math.round(n / 2 * (2 * a + (n - 1) * d));  // always integer since n*(2a+(n-1)d) is always even
    const prompt = `${terms.join(', ')}, ... Find the sum of first ${n} terms`;
    res.json({ id, difficulty, type: 'arith_sum', a, d, n, terms, answer, prompt });
  }
  else if (difficulty === 'hard') {
    // Geometric: a, ar, ar², ... Find the nth term
    const a = seqPick([1, 2, 3, 4, 5, -1, -2, -3]);
    const r = seqPick([2, 3, -2, -3, 1/2, 1/3, -1/2]);
    const n = seqRand(3, 8);
    const terms = [a, a * r, a * r * r, a * r * r * r];
    const answer = a * Math.pow(r, n - 1);
    // Format terms nicely (handle fractions)
    const fmtNum = (x) => Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    const prompt = `${terms.map(fmtNum).join(', ')}, ... Find the ${n}th term`;
    // Store answer as fraction if needed
    let ansNum, ansDen;
    if (Number.isInteger(answer)) {
      ansNum = answer; ansDen = 1;
    } else {
      // Convert to fraction: a * r^(n-1) where r might be 1/2 or 1/3
      // Use rational arithmetic
      const rFrac = r === 1/2 ? { n: 1, d: 2 } : r === 1/3 ? { n: 1, d: 3 } : r === -1/2 ? { n: -1, d: 2 } : { n: r, d: 1 };
      let num = a * Math.pow(rFrac.n, n - 1);
      let den = Math.pow(rFrac.d, n - 1);
      const g = gcd(Math.abs(num), Math.abs(den));
      ansNum = num / g; ansDen = den / g;
      if (ansDen < 0) { ansNum = -ansNum; ansDen = -ansDen; }
    }
    res.json({ id, difficulty, type: 'geom_nth', a, r, n, terms: terms.map(fmtNum), ansNum, ansDen, prompt });
  }
  else {
    // Geometric sum: S_n = a(r^n - 1)/(r - 1) for r ≠ 1
    const a = seqPick([1, 2, 3, 4, 5]);
    const r = seqPick([2, 3, -2, 1/2]);
    const n = seqRand(3, 7);
    const terms = [a, a * r, a * r * r];
    const fmtNum = (x) => Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');

    // Compute sum using rational arithmetic
    let ansNum, ansDen;
    if (Number.isInteger(r)) {
      const sn = a * (Math.pow(r, n) - 1) / (r - 1);
      ansNum = Math.round(sn); ansDen = 1;
    } else {
      // r = 1/2: S_n = a(1 - (1/2)^n) / (1 - 1/2) = a * 2 * (1 - 1/2^n) = 2a * (2^n - 1)/2^n
      const rFrac = r === 1/2 ? { n: 1, d: 2 } : { n: r, d: 1 };
      const rn_num = Math.pow(rFrac.n, n);
      const rn_den = Math.pow(rFrac.d, n);
      // S = a * (1 - rn_num/rn_den) / (1 - rFrac.n/rFrac.d)
      // = a * (rn_den - rn_num) / rn_den  /  (rFrac.d - rFrac.n) / rFrac.d
      // = a * (rn_den - rn_num) * rFrac.d / (rn_den * (rFrac.d - rFrac.n))
      let num = a * (rn_den - rn_num) * rFrac.d;
      let den = rn_den * (rFrac.d - rFrac.n);
      const g = gcd(Math.abs(num), Math.abs(den));
      ansNum = num / g; ansDen = den / g;
      if (ansDen < 0) { ansNum = -ansNum; ansDen = -ansDen; }
    }

    const prompt = `${terms.map(fmtNum).join(', ')}, ... Find the sum of first ${n} terms`;
    res.json({ id, difficulty, type: 'geom_sum', a, r, n, terms: terms.map(fmtNum), ansNum, ansDen, prompt });
  }
});

/**
 * POST /sequences-api/check
 */
app.post('/sequences-api/check', express.json(), (req, res) => {
  const { type, answer: rawAns } = req.body;
  const userStr = (rawAns || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;
  let display = '';

  if (type === 'arith_nth' || type === 'arith_sum') {
    const expected = req.body.answer;
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.001;
    display = String(expected);
  }
  else {
    // Geometric: answer may be fraction
    const { ansNum, ansDen } = req.body;
    const s = simplifyFraction(ansNum, ansDen);

    // Parse user answer as fraction or integer
    let uNum, uDen;
    const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
    if (fracMatch) {
      uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]);
    } else {
      const num = parseFloat(userStr);
      if (!isNaN(num) && Number.isInteger(num)) { uNum = num; uDen = 1; }
      else if (!isNaN(num)) {
        // Allow decimal: compare values
        const expected = s.num / s.den;
        correct = Math.abs(num - expected) < 0.01;
        display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
        return res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
      }
    }

    if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
      const us = simplifyFraction(uNum, uDen);
      correct = us.num === s.num && us.den === s.den;
    }
    display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// RATIO & PROPORTION API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /ratio-api/question?difficulty=easy|medium|hard|extrahard
 *
 * Easy:      Simplify a ratio (e.g. 12:8 = 3:2)
 * Medium:    Divide an amount in a ratio (e.g. divide 120 in ratio 3:2)
 * Hard:      Direct proportion (e.g. if 5 items cost 20, how much do 8 cost?)
 * ExtraHard: Inverse proportion (e.g. 4 workers take 6 days, how long for 3 workers?)
 */
app.get('/ratio-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Simplify a:b
    const g = seqRand(2, 8);
    const a = seqRand(1, 10) * g;
    const b = seqRand(1, 10) * g;
    // Ensure they're not already simplified
    const gc = gcd(a, b);
    const prompt = `Simplify the ratio ${a} : ${b}`;
    res.json({ id, difficulty, type: 'simplify', a, b, ansA: a / gc, ansB: b / gc, prompt });
  }
  else if (difficulty === 'medium') {
    // Divide amount in ratio a:b (two parts) or a:b:c (three parts)
    const parts = seqPick([2, 2, 2, 3]); // mostly 2-part
    if (parts === 2) {
      const ra = seqRand(1, 7);
      const rb = seqRand(1, 7);
      const total = (ra + rb) * seqRand(2, 15);
      const prompt = `Divide ${total} in the ratio ${ra} : ${rb}`;
      const unit = total / (ra + rb);
      res.json({ id, difficulty, type: 'divide2', ra, rb, total, ans1: ra * unit, ans2: rb * unit, prompt });
    } else {
      const ra = seqRand(1, 5);
      const rb = seqRand(1, 5);
      const rc = seqRand(1, 5);
      const total = (ra + rb + rc) * seqRand(2, 10);
      const prompt = `Divide ${total} in the ratio ${ra} : ${rb} : ${rc}`;
      const unit = total / (ra + rb + rc);
      res.json({ id, difficulty, type: 'divide3', ra, rb, rc, total, ans1: ra * unit, ans2: rb * unit, ans3: rc * unit, prompt });
    }
  }
  else if (difficulty === 'hard') {
    // Direct proportion: if a costs/weighs x, find cost/weight for b
    const unitVal = seqRand(2, 15);
    const qtyA = seqRand(2, 10);
    const valA = unitVal * qtyA;
    const qtyB = seqRand(2, 15);
    const valB = unitVal * qtyB;
    const contexts = [
      { q: `If ${qtyA} items cost $${valA}, how much do ${qtyB} items cost?`, unit: '$' },
      { q: `If ${qtyA} kg weighs ${valA} lbs, how much do ${qtyB} kg weigh?`, unit: ' lbs' },
      { q: `A car uses ${valA} litres for ${qtyA} km. How many litres for ${qtyB} km?`, unit: ' litres' },
    ];
    const ctx = seqPick(contexts);
    res.json({ id, difficulty, type: 'direct', qtyA, valA, qtyB, answer: valB, prompt: ctx.q });
  }
  else {
    // Inverse proportion: if a workers take x days, how long for b workers?
    const workersA = seqRand(2, 10);
    const daysA = seqRand(2, 15);
    const totalWork = workersA * daysA;
    // Pick workersB that divides totalWork evenly
    const divisors = [];
    for (let i = 2; i <= 20; i++) { if (totalWork % i === 0 && i !== workersA) divisors.push(i); }
    if (divisors.length === 0) divisors.push(workersA + 1);
    const workersB = seqPick(divisors);
    const daysB = totalWork / workersB;
    const prompt = `${workersA} workers take ${daysA} days to finish a job. How many days for ${workersB} workers?`;
    // ansNum/ansDen to handle non-integer results
    const g2 = gcd(totalWork, workersB);
    res.json({ id, difficulty, type: 'inverse', workersA, daysA, workersB, ansNum: totalWork / g2, ansDen: workersB / g2, prompt });
  }
});

/**
 * POST /ratio-api/check
 */
app.post('/ratio-api/check', express.json(), (req, res) => {
  const { type } = req.body;
  const userStr = (req.body.answer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;
  let display = '';

  if (type === 'simplify') {
    // Expect "a:b"
    const { ansA, ansB } = req.body;
    const m = userStr.match(/^(\d+):(\d+)$/);
    if (m) {
      correct = parseInt(m[1]) === ansA && parseInt(m[2]) === ansB;
    }
    display = `${ansA}:${ansB}`;
  }
  else if (type === 'divide2') {
    // Expect "a, b" or "a and b"
    const { ans1, ans2 } = req.body;
    const m = userStr.match(/^(-?\d+)[,\s&]+(-?\d+)$/);
    if (m) { correct = parseInt(m[1]) === ans1 && parseInt(m[2]) === ans2; }
    // Also accept just the larger part
    display = `${ans1}, ${ans2}`;
  }
  else if (type === 'divide3') {
    const { ans1, ans2, ans3 } = req.body;
    const m = userStr.match(/^(-?\d+)[,\s&]+(-?\d+)[,\s&]+(-?\d+)$/);
    if (m) { correct = parseInt(m[1]) === ans1 && parseInt(m[2]) === ans2 && parseInt(m[3]) === ans3; }
    display = `${ans1}, ${ans2}, ${ans3}`;
  }
  else if (type === 'direct') {
    const expected = req.body.answer;
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.01;
    display = String(expected);
  }
  else if (type === 'inverse') {
    const { ansNum, ansDen } = req.body;
    const s = simplifyFraction(ansNum, ansDen);
    // Parse fraction or integer
    let uNum, uDen;
    const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
    if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
    else { const n = parseFloat(userStr); if (!isNaN(n) && Number.isInteger(n)) { uNum = n; uDen = 1; } }
    if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
      const us = simplifyFraction(uNum, uDen);
      correct = us.num === s.num && us.den === s.den;
    }
    display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERCENTAGES API
// Module 37 spec — adaptive tier+type flow.
//   No upfront theory. No question repeats within a session. Difficulty (tier)
//   moves up/down based on accuracy + speed. Five question types unlock
//   sequentially.
//
// The endpoint is now driven by `?tier=N&type=K` rather than the old
// `difficulty=easy|medium|hard|extrahard` axis. The legacy axis is retained
// as a fallback for any caller that hasn't been migrated yet.
// ═══════════════════════════════════════════════════════════════════════════

/** Tier configuration per Module 37 spec. */
const PERCENT_TIERS = {
  1: { pcts: [10, 25, 50, 100],         lo: 10,   hi: 100,   label: 'Tier 1' },
  2: { pcts: [20, 30, 75],              lo: 100,  hi: 500,   label: 'Tier 2' },
  3: { pcts: [15, 35, 60, 80],          lo: 500,  hi: 2000,  label: 'Tier 3' },
  4: { pcts: [12.5, 17.5, 22.5, 37.5, 47.5, 62.5, 87.5], lo: 2000, hi: 10000, label: 'Tier 4' },
};

/** Pick a base in the tier range that yields a "clean" answer for the given pct. */
function percentPickBase(tier, cfg, pct) {
  // For tier 4 we accept non-clean bases — calculator-style numbers are part of the challenge.
  if (tier >= 4) {
    return Math.round(randInt(cfg.lo, cfg.hi) / 10) * 10;
  }
  // For tiers 1-3, prefer bases that produce integer answers (pct * base divisible by 100).
  // Iterate a handful of candidates from the tier range.
  const candidates = [];
  const step = tier === 1 ? 10 : 50;
  for (let b = cfg.lo; b <= cfg.hi; b += step) {
    if ((Math.round(pct * b * 10) / 10) % 100 === 0) candidates.push(b);
  }
  if (candidates.length === 0) {
    return Math.round((cfg.lo + cfg.hi) / 2);
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Generate a single percent question for the given (tier, type). Returns an
 * object containing the prompt, the canonical answer, a deterministic content
 * id (so the client can dedupe via `?seen=`), and an optional `scaffold`
 * payload for the very first Type-1 questions.
 */
function generatePercentQuestion(tier, type, cfg, isFirstOfType) {
  const pct = cfg.pcts[Math.floor(Math.random() * cfg.pcts.length)];
  const base = percentPickBase(tier, cfg, pct);
  const cid = (suffix) => `t${tier}-q${type}-p${pct}-b${base}${suffix ? '-' + suffix : ''}`;
  const round2 = (v) => Math.round(v * 100) / 100;

  let prompt, answer, idSuffix = '', meta = {}, scaffold = null, expectsPercent = false;

  switch (type) {
    case 1: {
      // What is X% of N?
      answer = round2((pct * base) / 100);
      prompt = WordProblemGenerator.percentType1(pct, base);
      if (isFirstOfType && tier === 1 && pct !== 100) {
        // Visual scaffold for the very first Type-1 questions: 100% → base, 10% → base/10, X% → ___
        // When pct itself is 10, the "10% step" row IS the question — skip the duplicate.
        // When pct is 100 the first row already gives away the answer — no scaffold.
        const rows = [{ label: '100%', value: base }];
        if (pct !== 10) rows.push({ label: '10%', value: round2(base / 10) });
        rows.push({ label: `${pct}%`, value: '?' });
        scaffold = { rows };
      }
      meta = { pct, base };
      break;
    }
    case 2: {
      // N is what % of M?  (answer is a percentage)
      const result = round2((pct * base) / 100);
      answer = pct;
      prompt = `${result} is what % of ${base}?`;
      expectsPercent = true;
      meta = { pct, base, result };
      break;
    }
    case 3: {
      // X% of ? = N → find original
      const result = round2((pct * base) / 100);
      answer = base;
      prompt = `${pct}% of ? = ${result}. Find the missing number.`;
      meta = { pct, base, result };
      break;
    }
    case 4: {
      // Percentage increase / decrease
      const direction = Math.random() < 0.5 ? 'increase' : 'decrease';
      idSuffix = direction;
      const delta = round2((pct * base) / 100);
      const newVal = round2(direction === 'increase' ? base + delta : base - delta);
      answer = pct;
      expectsPercent = true;
      prompt = direction === 'increase'
        ? `A value rises from ${base} to ${newVal}. What is the percentage increase?`
        : `A value falls from ${base} to ${newVal}. What is the percentage decrease?`;
      meta = { pct, base, newVal, direction };
      break;
    }
    case 5: {
      // Discount + tax — Module 37 dev note locks order to: discount FIRST, then tax.
      const discount = pct;
      const taxRates = tier <= 2 ? [5, 10] : [12, 18];
      const taxRate = taxRates[Math.floor(Math.random() * taxRates.length)];
      idSuffix = `tax${taxRate}`;
      const afterDiscount = base * (1 - discount / 100);
      const finalPrice = round2(afterDiscount * (1 + taxRate / 100));
      answer = finalPrice;
      prompt = `A ₹${base} item has a ${discount}% discount applied first, then ${taxRate}% tax. What is the final price?`;
      meta = { pct, base, discount, taxRate };
      break;
    }
    default:
      // Should not happen — clamp at type 1
      return generatePercentQuestion(tier, 1, cfg, isFirstOfType);
  }

  return {
    id: cid(idSuffix),
    tier, type, pct, base,
    prompt, answer, scaffold, expectsPercent, meta,
  };
}

/**
 * GET /percent-api/question
 *
 * New params (Module 37):
 *   tier   — 1..4 (default 1)
 *   type   — 1..5 (default 1)
 *   first  — '1' to render scaffold for the first questions of a type
 *   seen   — comma-separated list of recently-shown question ids; the server
 *            tries up to 50 generations to return one not in this list.
 *
 * Legacy fallback: if `tier` is absent the endpoint accepts the old
 * `difficulty=easy|medium|hard|extrahard` and maps it to a tier.
 */
app.get('/percent-api/question', (req, res) => {
  let tier = parseInt(req.query.tier, 10);
  if (!tier || isNaN(tier)) {
    // Legacy difficulty mapping
    const map = { easy: 1, medium: 2, hard: 3, extrahard: 4 };
    tier = map[req.query.difficulty] || 1;
  }
  tier = Math.max(1, Math.min(4, tier));
  const type = Math.max(1, Math.min(5, parseInt(req.query.type, 10) || 1));
  const isFirstOfType = req.query.first === '1';
  const seen = String(req.query.seen || '').split(',').filter(Boolean);
  const cfg = PERCENT_TIERS[tier];

  let q;
  for (let attempt = 0; attempt < 50; attempt++) {
    q = generatePercentQuestion(tier, type, cfg, isFirstOfType);
    if (!seen.includes(q.id)) break;
  }
  res.json(q);
});

/**
 * POST /percent-api/check
 *
 * Accepts the user's answer with tolerant parsing — strips %, ₹, $, commas,
 * spaces, unicode minus. Marks correct if within 0.01 of the expected answer
 * (or 1% relative for tier-4 calculator-style answers).
 */
app.post('/percent-api/check', express.json(), (req, res) => {
  const { type, tier, answer: expected, expectsPercent } = req.body;
  const raw = String(req.body.userAnswer || '');
  const userStr = raw.replace(/\s+/g, '').replace(/[%₹$,]/g, '').replace(/−/g, '-');
  const userNum = parseFloat(userStr);
  let correct = false;
  if (!isNaN(userNum) && expected !== undefined && expected !== null) {
    const tol = (tier === 4 || type === 5) ? Math.max(0.01, Math.abs(expected) * 0.005) : 0.01;
    correct = Math.abs(userNum - expected) <= tol;
  }
  const display = Number.isInteger(expected) ? String(expected) : (expected != null ? Number(expected).toFixed(2) : '');
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect', expectsPercent: !!expectsPercent });
});

// ═══════════════════════════════════════════════════════════════════════════
// SETS API — Union, intersection, complement, Venn diagrams
// ═══════════════════════════════════════════════════════════════════════════

function setPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function setRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

/** Generate a random subset of size k from universe */
function randomSubset(universe, k) {
  const copy = [...universe];
  const result = [];
  for (let i = 0; i < Math.min(k, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
}

/** Set operations */
function setUnion(a, b) { return [...new Set([...a, ...b])].sort((x, y) => x - y); }
function setIntersect(a, b) { const s = new Set(b); return a.filter(x => s.has(x)).sort((x, y) => x - y); }
function setDiff(a, b) { const s = new Set(b); return a.filter(x => !s.has(x)).sort((x, y) => x - y); }

/**
 * GET /sets-api/question?difficulty=easy|medium|hard|extrahard
 *
 * Easy:      List elements — union, intersection, complement, difference
 * Medium:    Cardinality — n(A∪B) = n(A) + n(B) − n(A∩B)
 * Hard:      2-set Venn — given some region counts, find a missing region
 * ExtraHard: 3-set Venn — given totals, find specific region
 */
app.get('/sets-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Generate universe and two sets, ask for a set operation result
    const universe = [];
    for (let i = 1; i <= setRand(10, 15); i++) universe.push(i);
    const A = randomSubset(universe, setRand(3, 6));
    const B = randomSubset(universe, setRand(3, 6));

    const ops = [
      { op: 'A ∪ B', answer: setUnion(A, B) },
      { op: 'A ∩ B', answer: setIntersect(A, B) },
      { op: 'A − B', answer: setDiff(A, B) },
      { op: 'B − A', answer: setDiff(B, A) },
      { op: "A'", answer: setDiff(universe, A) },
    ];
    const chosen = setPick(ops);
    const prompt = `U = {${universe.join(', ')}}, A = {${A.join(', ')}}, B = {${B.join(', ')}}. Find ${chosen.op}`;
    res.json({ id, difficulty, type: 'list', prompt, answer: chosen.answer });
  }
  else if (difficulty === 'medium') {
    // Cardinality problems using inclusion-exclusion
    const nA = setRand(10, 30);
    const nB = setRand(10, 30);
    const nAB = setRand(2, Math.min(nA, nB) - 1); // intersection
    const nAuB = nA + nB - nAB;

    const subtype = setPick(['find_union', 'find_intersect', 'find_only_a']);
    let prompt, answer;
    if (subtype === 'find_union') {
      prompt = `n(A) = ${nA}, n(B) = ${nB}, n(A ∩ B) = ${nAB}. Find n(A ∪ B)`;
      answer = nAuB;
    } else if (subtype === 'find_intersect') {
      prompt = `n(A) = ${nA}, n(B) = ${nB}, n(A ∪ B) = ${nAuB}. Find n(A ∩ B)`;
      answer = nAB;
    } else {
      prompt = `n(A) = ${nA}, n(A ∩ B) = ${nAB}. How many elements are in A only?`;
      answer = nA - nAB;
    }
    res.json({ id, difficulty, type: 'cardinality', subtype, prompt, answer });
  }
  else if (difficulty === 'hard') {
    // 2-set Venn diagram: given total and some regions, find missing
    const onlyA = setRand(5, 20);
    const both = setRand(3, 15);
    const onlyB = setRand(5, 20);
    const neither = setRand(2, 10);
    const total = onlyA + both + onlyB + neither;

    const subtype = setPick(['find_neither', 'find_both', 'find_onlyA', 'find_total']);
    let prompt, answer;
    if (subtype === 'find_neither') {
      prompt = `In a group of ${total}: n(A only) = ${onlyA}, n(A ∩ B) = ${both}, n(B only) = ${onlyB}. How many are in neither A nor B?`;
      answer = neither;
    } else if (subtype === 'find_both') {
      prompt = `In a group of ${total}: n(A) = ${onlyA + both}, n(B) = ${onlyB + both}, n(neither) = ${neither}. Find n(A ∩ B).`;
      answer = both;
    } else if (subtype === 'find_onlyA') {
      prompt = `In a group of ${total}: n(A ∩ B) = ${both}, n(B only) = ${onlyB}, n(neither) = ${neither}. How many are in A only?`;
      answer = onlyA;
    } else {
      prompt = `n(A only) = ${onlyA}, n(A ∩ B) = ${both}, n(B only) = ${onlyB}, n(neither) = ${neither}. Find the total.`;
      answer = total;
    }
    res.json({ id, difficulty, type: 'venn2', subtype, prompt, answer });
  }
  else {
    // 3-set Venn diagram
    // Generate all 7 regions + neither
    const abc = setRand(1, 5);        // all three
    const abOnly = setRand(1, 8);     // A∩B only (not C)
    const acOnly = setRand(1, 8);     // A∩C only (not B)
    const bcOnly = setRand(1, 8);     // B∩C only (not A)
    const aOnly = setRand(3, 12);     // A only
    const bOnly = setRand(3, 12);     // B only
    const cOnly = setRand(3, 12);     // C only
    const neither = setRand(2, 8);

    const nA = aOnly + abOnly + acOnly + abc;
    const nB = bOnly + abOnly + bcOnly + abc;
    const nC = cOnly + acOnly + bcOnly + abc;
    const nAB = abOnly + abc;
    const nAC = acOnly + abc;
    const nBC = bcOnly + abc;
    const total = aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + abc + neither;

    const subtype = setPick(['find_abc', 'find_neither', 'find_aonly', 'find_total']);
    let prompt, answer;
    if (subtype === 'find_abc') {
      prompt = `n(A) = ${nA}, n(B) = ${nB}, n(C) = ${nC}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(B∩C) = ${nBC}, total in at least one set = ${total - neither}. Find n(A ∩ B ∩ C).`;
      // Using inclusion-exclusion: n(A∪B∪C) = nA+nB+nC - nAB-nAC-nBC + nABC
      answer = abc;
    } else if (subtype === 'find_neither') {
      prompt = `In a group of ${total}: n(A) = ${nA}, n(B) = ${nB}, n(C) = ${nC}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(B∩C) = ${nBC}, n(A∩B∩C) = ${abc}. How many in neither?`;
      const inAtLeastOne = nA + nB + nC - nAB - nAC - nBC + abc;
      answer = total - inAtLeastOne;
    } else if (subtype === 'find_aonly') {
      prompt = `n(A) = ${nA}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(A∩B∩C) = ${abc}. How many are in A only?`;
      answer = aOnly;
    } else {
      prompt = `n(A only) = ${aOnly}, n(B only) = ${bOnly}, n(C only) = ${cOnly}, n(A∩B only) = ${abOnly}, n(A∩C only) = ${acOnly}, n(B∩C only) = ${bcOnly}, n(A∩B∩C) = ${abc}, neither = ${neither}. Find total.`;
      answer = total;
    }
    res.json({ id, difficulty, type: 'venn3', subtype, prompt, answer });
  }
});

/**
 * POST /sets-api/check
 */
app.post('/sets-api/check', express.json(), (req, res) => {
  const { type, answer: expected } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;
  let display = '';

  if (type === 'list') {
    // Expected is an array of numbers. User types e.g. "{1,3,5}" or "1,3,5" or "{}" or "empty"
    const cleaned = userStr.replace(/[{}]/g, '');
    let userSet;
    if (cleaned === '' || cleaned.toLowerCase() === 'empty') {
      userSet = [];
    } else {
      userSet = cleaned.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
    }
    const expectedSorted = [...expected].sort((a, b) => a - b);
    correct = userSet.length === expectedSorted.length && userSet.every((v, i) => v === expectedSorted[i]);
    display = expectedSorted.length === 0 ? '{ } (empty set)' : `{${expectedSorted.join(', ')}}`;
  }
  else {
    // Cardinality / Venn — expect a number
    const userNum = parseInt(userStr);
    correct = !isNaN(userNum) && userNum === expected;
    display = String(expected);
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// TRIGONOMETRY API
// ═══════════════════════════════════════════════════════════════════════════

function triRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function triPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

app.get('/trig-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // SOH-CAH-TOA: find missing side in right triangle
    // Use Pythagorean triples for clean answers
    const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[10,24,26],[20,21,29]];
    const [a, b, c] = triPick(triples);
    const subtype = triPick(['find_hyp', 'find_leg']);
    let prompt, answer;
    if (subtype === 'find_hyp') {
      prompt = `Right triangle: legs = ${a} and ${b}. Find the hypotenuse.`;
      answer = c;
    } else {
      prompt = `Right triangle: hypotenuse = ${c}, one leg = ${a}. Find the other leg.`;
      answer = b;
    }
    res.json({ id, difficulty, type: 'pythagoras', prompt, answer, answerDen: 1 });
  }
  else if (difficulty === 'medium') {
    // Find angle using trig ratios (answer in degrees, rounded to 1dp)
    const angle = triRand(15, 75);
    const rad = angle * Math.PI / 180;
    const side = triRand(5, 20);
    const fn = triPick(['sin', 'cos', 'tan']);
    let opp, adj, hyp, prompt;
    if (fn === 'sin') {
      hyp = side;
      opp = Math.round(hyp * Math.sin(rad) * 10) / 10;
      prompt = `Right triangle: opposite = ${opp}, hypotenuse = ${hyp}. Find the angle (degrees).`;
    } else if (fn === 'cos') {
      hyp = side;
      adj = Math.round(hyp * Math.cos(rad) * 10) / 10;
      prompt = `Right triangle: adjacent = ${adj}, hypotenuse = ${hyp}. Find the angle (degrees).`;
    } else {
      adj = side;
      opp = Math.round(adj * Math.tan(rad) * 10) / 10;
      prompt = `Right triangle: opposite = ${opp}, adjacent = ${adj}. Find the angle (degrees).`;
    }
    res.json({ id, difficulty, type: 'find_angle', prompt, answer: angle, answerDen: 1 });
  }
  else if (difficulty === 'hard') {
    // Sine rule: a/sinA = b/sinB — find missing side or angle
    const A = triRand(30, 80);
    const B = triRand(30, 150 - A);
    const C = 180 - A - B;
    const radA = A * Math.PI / 180;
    const radB = B * Math.PI / 180;
    const a = triRand(5, 20);
    const b = Math.round(a * Math.sin(radB) / Math.sin(radA) * 10) / 10;
    const subtype = triPick(['find_side', 'find_angle']);
    let prompt, answer;
    if (subtype === 'find_side') {
      prompt = `Triangle: a = ${a}, angle A = ${A}°, angle B = ${B}°. Find side b (1 d.p.).`;
      answer = b;
    } else {
      prompt = `Triangle: a = ${a}, b = ${b}, angle A = ${A}°. Find angle B (degrees).`;
      answer = B;
    }
    res.json({ id, difficulty, type: 'sine_rule', prompt, answer, answerDen: 1 });
  }
  else {
    // Cosine rule or area = ½ab·sinC
    const subtype = triPick(['cosine', 'area']);
    if (subtype === 'cosine') {
      const a = triRand(5, 15);
      const b = triRand(5, 15);
      const C = triRand(30, 120);
      const radC = C * Math.PI / 180;
      const c2 = a*a + b*b - 2*a*b*Math.cos(radC);
      const c = Math.round(Math.sqrt(c2) * 10) / 10;
      const prompt = `Triangle: a = ${a}, b = ${b}, angle C = ${C}°. Find side c (1 d.p.).`;
      res.json({ id, difficulty, type: 'cosine_rule', prompt, answer: c, answerDen: 1 });
    } else {
      const a = triRand(5, 15);
      const b = triRand(5, 15);
      const C = triRand(30, 120);
      const radC = C * Math.PI / 180;
      const area = Math.round(0.5 * a * b * Math.sin(radC) * 10) / 10;
      const prompt = `Triangle: a = ${a}, b = ${b}, angle C = ${C}°. Find the area (1 d.p.).`;
      res.json({ id, difficulty, type: 'area', prompt, answer: area, answerDen: 1 });
    }
  }
});

app.post('/trig-api/check', express.json(), (req, res) => {
  const { answer: expected } = req.body;
  const userNum = parseFloat((req.body.userAnswer || '').replace(/[°\s]/g, ''));
  const correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.5;
  res.json({ correct, display: String(expected), message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// INEQUALITIES API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/ineq-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Linear: ax + b > c → x > (c-b)/a
    const a = triPick([1, 2, 3, 4, 5, -1, -2, -3]);
    const b = triRand(-10, 10);
    const c = triRand(-10, 10);
    const op = triPick(['>', '<', '>=', '<=']);
    const opDisplay = op.replace('>=', '≥').replace('<=', '≤');
    const prompt = `Solve: ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} ${opDisplay} ${c}`;
    const val = (c - b) / a;
    // Flip inequality if dividing by negative
    let resultOp = op;
    if (a < 0) resultOp = op === '>' ? '<' : op === '<' ? '>' : op === '>=' ? '<=' : '>=';
    const resultOpDisplay = resultOp.replace('>=', '≥').replace('<=', '≤');
    // Simplify fraction
    const g = gcd(Math.abs(c - b), Math.abs(a));
    const ansNum = (c - b) / g * (a < 0 ? -1 : 1);
    const ansDen = Math.abs(a) / g;
    const valStr = ansDen === 1 ? String(ansNum) : `${ansNum}/${ansDen}`;
    const display = `x ${resultOpDisplay} ${valStr}`;
    res.json({ id, difficulty, type: 'linear', prompt, display, ansNum, ansDen, resultOp });
  }
  else if (difficulty === 'medium') {
    // Double inequality: a < 2x + 1 < b, list integers
    const m = triRand(1, 3);
    const c = triRand(-5, 5);
    const lo = triRand(-8, 2);
    const hi = lo + triRand(4, 10);
    // lo < mx + c < hi → (lo-c)/m < x < (hi-c)/m
    const xLo = (lo - c) / m;
    const xHi = (hi - c) / m;
    const integers = [];
    for (let i = Math.ceil(xLo + 0.001); i < xHi; i++) integers.push(i);
    const prompt = `List the integers satisfying: ${lo} < ${m}x ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)} < ${hi}`;
    res.json({ id, difficulty, type: 'list_integers', prompt, answer: integers, display: integers.join(', ') || 'none' });
  }
  else if (difficulty === 'hard') {
    // Quadratic: x² − bx + c ≤ 0 or ≥ 0
    const r1 = triRand(-5, 5);
    const r2 = triRand(r1 + 1, r1 + 8);
    // (x-r1)(x-r2) = x² - (r1+r2)x + r1*r2
    const B = -(r1 + r2);
    const C = r1 * r2;
    const op = triPick(['<=', '>=']);
    const opDisplay = op === '<=' ? '≤' : '≥';
    const prompt = `Solve: x² ${B >= 0 ? '+ ' + B : '− ' + Math.abs(B)}x ${C >= 0 ? '+ ' + C : '− ' + Math.abs(C)} ${opDisplay} 0`;
    let display;
    if (op === '<=') {
      display = `${r1} ≤ x ≤ ${r2}`;
    } else {
      display = `x ≤ ${r1} or x ≥ ${r2}`;
    }
    res.json({ id, difficulty, type: 'quadratic', prompt, display, r1, r2, op });
  }
  else {
    // Represent on number line: find integer solutions to compound inequality
    const a = triRand(-3, 3); if (a === 0) a = 1;
    const b = triRand(-5, 5);
    const lo = triRand(-10, 0);
    const hi = triRand(1, 10);
    const prompt = `How many integers satisfy: ${lo} ≤ ${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} ≤ ${hi}?`;
    const xLo = (lo - b) / a;
    const xHi = (hi - b) / a;
    const realLo = Math.min(xLo, xHi);
    const realHi = Math.max(xLo, xHi);
    let count = 0;
    for (let i = Math.ceil(realLo - 0.001); i <= Math.floor(realHi + 0.001); i++) {
      const val = a * i + b;
      if (val >= lo && val <= hi) count++;
    }
    res.json({ id, difficulty, type: 'count_integers', prompt, answer: count, display: String(count) });
  }
});

app.post('/ineq-api/check', express.json(), (req, res) => {
  const { type, display } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-').replace(/>=/g, '≥').replace(/<=/g, '≤');
  let correct = false;

  if (type === 'linear') {
    // Check if user answer matches the display (normalized)
    const normDisplay = display.replace(/\s+/g, '');
    correct = userStr === normDisplay;
    // Also accept >= for ≥ etc
    if (!correct) {
      const altUser = userStr.replace(/≥/g, '>=').replace(/≤/g, '<=');
      const altDisplay = normDisplay.replace(/≥/g, '>=').replace(/≤/g, '<=');
      correct = altUser === altDisplay;
    }
  }
  else if (type === 'list_integers') {
    const expected = req.body.answer;
    const userNums = userStr === 'none' || userStr === '' ? [] :
      userStr.split(',').map(s => parseInt(s)).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const expSorted = [...expected].sort((a, b) => a - b);
    correct = userNums.length === expSorted.length && userNums.every((v, i) => v === expSorted[i]);
  }
  else if (type === 'quadratic') {
    // Accept various formats: "1<=x<=5", "x<=1 or x>=5", etc
    const normDisplay = display.replace(/\s+/g, '').replace(/>=/g, '≥').replace(/<=/g, '≤');
    const normUser = userStr.replace(/or/gi, 'or');
    correct = normUser === normDisplay;
    // Relaxed check
    if (!correct) {
      const altD = normDisplay.replace(/≥/g, '>=').replace(/≤/g, '<=');
      const altU = normUser.replace(/≥/g, '>=').replace(/≤/g, '<=');
      correct = altU === altD;
    }
  }
  else if (type === 'count_integers') {
    const userNum = parseInt(userStr);
    correct = !isNaN(userNum) && userNum === req.body.answer;
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// COORDINATE GEOMETRY API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/coordgeom-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();
  
  if (difficulty === 'easy') {
    // Foundations: midpoint, reflection, translation
    const subType = triPick(['midpoint', 'reflection', 'translation']);
    
    if (subType === 'midpoint') {
      const x1 = triRand(-8, 8); const y1 = triRand(-8, 8);
      const x2 = x1 + 2 * triRand(-4, 4); const y2 = y1 + 2 * triRand(-4, 4);
      const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
      const prompt = `Find the midpoint of (${x1}, ${y1}) and (${x2}, ${y2})`;
      res.json({ id, difficulty, type: 'coord', prompt, ansX: mx, ansY: my, display: `(${mx}, ${my})`, points: [{x:x1, y:y1}, {x:x2, y:y2}] });
    }
    else if (subType === 'reflection') {
      const axis = triPick(['x-axis', 'y-axis']);
      const x1 = triRand(-8, 8); const y1 = triRand(-8, 8);
      let ansX = x1, ansY = y1;
      if (axis === 'x-axis') ansY = -y1;
      else ansX = -x1;
      const prompt = `Reflect (${x1}, ${y1}) across the ${axis}`;
      res.json({ id, difficulty, type: 'coord', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, points: [{x:x1, y:y1}] });
    }
    else { // translation
      const x1 = triRand(-6, 6); const y1 = triRand(-6, 6);
      const dx = triRand(-4, 4); const dy = triRand(-4, 4);
      const ansX = x1 + dx; const ansY = y1 + dy;
      const vector = `<${dx}, ${dy}>`;
      const prompt = `Translate (${x1}, ${y1}) by the vector ${vector}`;
      res.json({ id, difficulty, type: 'coord', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, points: [{x:x1, y:y1}] });
    }
  }
  else if (difficulty === 'medium') {
    // Lengths: distance, distance to origin
    const subType = triPick(['distance', 'distance_origin']);
    const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15]];
    
    if (subType === 'distance_origin') {
      const [dx, dy, dist] = triPick(triples);
      const sx = triPick([1, -1]); const sy = triPick([1, -1]);
      const x1 = sx * dx; const y1 = sy * dy;
      const prompt = `Find the distance from (${x1}, ${y1}) to the origin`;
      res.json({ id, difficulty, type: 'scalar', prompt, answer: dist, display: String(dist), points: [{x:x1, y:y1}, {x:0, y:0}] });
    }
    else { // distance
      const [dx, dy, dist] = triPick(triples);
      const x1 = triRand(-5, 5); const y1 = triRand(-5, 5);
      const sx = triPick([1, -1]); const sy = triPick([1, -1]);
      const x2 = x1 + sx * dx; const y2 = y1 + sy * dy;
      const prompt = `Find the distance between (${x1}, ${y1}) and (${x2}, ${y2})`;
      res.json({ id, difficulty, type: 'scalar', prompt, answer: dist, display: String(dist), points: [{x:x1, y:y1}, {x:x2, y:y2}] });
    }
  }
  else if (difficulty === 'hard') {
    // Slopes & Eqs: gradient, equation_line
    const subType = triPick(['gradient', 'equation_line']);
    
    const x1 = triRand(-6, 6); const y1 = triRand(-6, 6);
    const dx = triRand(1, 6) * triPick([1, -1]);
    const dy = triRand(-6, 6);
    const x2 = x1 + dx; const y2 = y1 + dy;
    const g = gcd(Math.abs(dy), Math.abs(dx));
    const mNum = dy / g * (dx < 0 ? -1 : 1);
    const mDen = Math.abs(dx) / g;
    
    if (subType === 'gradient') {
      const display = mDen === 1 ? String(mNum) : `${mNum}/${mDen}`;
      const prompt = `Find the gradient (slope) of the line through (${x1}, ${y1}) and (${x2}, ${y2})`;
      res.json({ id, difficulty, type: 'fraction', prompt, ansNum: mNum, ansDen: mDen, display, points: [{x:x1, y:y1}, {x:x2, y:y2}] });
    }
    else { // equation_line
      const cNum = y1 * mDen - mNum * x1;
      const cDen = mDen; 
      const cG = gcd(Math.abs(cNum), Math.abs(cDen));
      const cN = cNum / cG * (cDen < 0 ? -1 : 1);
      const cD = Math.abs(cDen) / cG;
      
      const mStr = mDen === 1 ? String(mNum) : (mNum < 0 ? `-${Math.abs(mNum)}/${mDen}` : `${mNum}/${mDen}`);
      const cStr = cD === 1 ? String(cN) : (cN < 0 ? `-${Math.abs(cN)}/${cD}` : `${cN}/${cD}`);
      let eqStr = `y=${mStr}x`;
      if (cN > 0) eqStr += `+${cStr}`;
      else if (cN < 0) eqStr += cStr;

      const prompt = `Find the equation of the line through (${x1}, ${y1}) and (${x2}, ${y2}). Format: y=mx+c`;
      res.json({ id, difficulty, type: 'equation', prompt, ansMNum: mNum, ansMDen: mDen, ansCNum: cN, ansCDen: cD, display: eqStr, points: [{x:x1, y:y1}, {x:x2, y:y2}] });
    }
  }
  else {
    // Advanced: perp_bisector, area_triangle
    const subType = triPick(['perp_bisector', 'area_triangle']);
    
    if (subType === 'area_triangle') {
      const x1 = triRand(-8, 8); const y1 = triRand(-8, 8);
      const x2 = triRand(-8, 8); const y2 = triRand(-8, 8);
      const x3 = triRand(-8, 8); const y3 = triRand(-8, 8);
      const area = Math.abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2);
      const prompt = `Find the area of the triangle with vertices (${x1}, ${y1}), (${x2}, ${y2}), (${x3}, ${y3})`;
      res.json({ id, difficulty, type: 'scalar', prompt, answer: area, display: String(area), points: [{x:x1, y:y1}, {x:x2, y:y2}, {x:x3, y:y3}] });
    }
    else { // perp_bisector
      const x1 = triRand(-6, 6); const y1 = triRand(-6, 6);
      const dx = triRand(1, 4) * triPick([1, -1]);
      const dy = triRand(1, 4) * triPick([1, -1]);
      const x2 = x1 + 2 * dx; const y2 = y1 + 2 * dy;
      
      const perpNum = -dx;
      const perpDen = dy;
      const g = gcd(Math.abs(perpNum), Math.abs(perpDen));
      const mNum = perpNum / g * (perpDen < 0 ? -1 : 1);
      const mDen = Math.abs(perpDen) / g;
      const prompt = `Find the gradient of the perpendicular bisector of (${x1}, ${y1}) and (${x2}, ${y2})`;
      const display = mDen === 1 ? String(mNum) : `${mNum}/${mDen}`;
      res.json({ id, difficulty, type: 'fraction', prompt, ansNum: mNum, ansDen: mDen, display, points: [{x:x1, y:y1}, {x:x2, y:y2}] });
    }
  }
});

app.post('/coordgeom-api/check', express.json(), (req, res) => {
  const { type } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;

  if (type === 'coord') {
    const m = userStr.replace(/[()]/g, '').split(',');
    if (m.length === 2) {
      correct = parseFloat(m[0]) === req.body.ansX && parseFloat(m[1]) === req.body.ansY;
    }
  }
  else if (type === 'scalar') {
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && Math.abs(userNum - req.body.answer) < 0.01;
  }
  else if (type === 'fraction') {
    const { ansNum, ansDen } = req.body;
    const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
    let uNum, uDen;
    if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
    else { const n = parseFloat(userStr); if (!isNaN(n) && Number.isInteger(n)) { uNum = n; uDen = 1; } }
    if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
      const us = simplifyFraction(uNum, uDen);
      const es = simplifyFraction(ansNum, ansDen);
      correct = us.num === es.num && us.den === es.den;
    }
  }
  else if (type === 'equation') {
    const { ansMNum, ansMDen, ansCNum, ansCDen } = req.body;
    const eqMatch = userStr.match(/^y=(-?\d+(?:\/-?\d+)?)x([+-]\d+(?:\/\d+)?)?$/);
    if (eqMatch) {
      let mStr = eqMatch[1];
      let cStr = eqMatch[2] || "+0";
      
      const parseFrac = (str) => {
        const parts = str.replace('+','').split('/');
        if (parts.length === 1) return { num: parseInt(parts[0]), den: 1 };
        return simplifyFraction(parseInt(parts[0]), parseInt(parts[1]));
      };
      
      const uM = parseFrac(mStr);
      const uC = parseFrac(cStr);
      const eM = simplifyFraction(ansMNum, ansMDen);
      const eC = simplifyFraction(ansCNum, ansCDen);
      
      correct = uM.num === eM.num && uM.den === eM.den && uC.num === eC.num && uC.den === eC.den;
    }
  }

  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROBABILITY API
// Module 42 spec — context/type/level-aware adaptive flow.
//   Levels:    1 (MCQ, plain English) → 2 (fill-in, P(x) introduced) → 3 (direct, all contexts)
//   Contexts:  balls → coins → dice → cards (cards Level 3 only)
//   Types:     1 single, 2 complementary, 3 multi w/ replacement, 4 multi w/o replacement
//
// Plain English phrasing replaces P(O) shorthand at Level 1; Level 2 prompts
// show plain English alongside P(x). Level 3 uses P(x) standalone (the client
// shows the one-time deck/notation explainers).
// All answers are simplified fractions but the check endpoint also accepts
// unsimplified equivalents (and signals back the simplified form).
// ═══════════════════════════════════════════════════════════════════════════

const PROB_VALID_CONTEXTS = ['balls', 'coins', 'dice', 'cards'];

/** Pick a "favourable" event description for a given context. */
function probSampleEvent(context) {
  if (context === 'balls') {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const counts = {};
    let total = 0;
    // 2-3 colours, each 2-6 balls
    const pickedColors = [];
    while (pickedColors.length < (Math.random() < 0.5 ? 2 : 3)) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      if (!pickedColors.includes(c)) pickedColors.push(c);
    }
    for (const c of pickedColors) {
      const n = randomInt(2, 6);
      counts[c] = n; total += n;
    }
    const ask = pickedColors[Math.floor(Math.random() * pickedColors.length)];
    return { context, counts, total, ask, askLabel: `${ask} ball` };
  }
  if (context === 'coins') {
    // 1 or 2 coin tosses
    const tosses = Math.random() < 0.5 ? 1 : 2;
    const ask = tosses === 1
      ? (Math.random() < 0.5 ? 'heads' : 'tails')
      : ['two heads', 'two tails', 'one head and one tail'][Math.floor(Math.random() * 3)];
    return { context, tosses, ask, askLabel: ask };
  }
  if (context === 'dice') {
    const dice = Math.random() < 0.5 ? 1 : 2;
    const askPool = dice === 1
      ? ['a 6', 'an even number', 'a number greater than 4', 'a 1 or 2']
      : ['a sum of 7', 'a sum of 8', 'a double', 'both odd'];
    const ask = askPool[Math.floor(Math.random() * askPool.length)];
    return { context, dice, ask, askLabel: ask };
  }
  // cards
  const askPool = [
    'a heart', 'a spade', 'a red card', 'a black card',
    'a king', 'a queen', 'an ace', 'a face card',
    'the ace of spades', 'a 7',
  ];
  const ask = askPool[Math.floor(Math.random() * askPool.length)];
  return { context, ask, askLabel: ask };
}

/** Probability (numerator, denominator) of the favourable event. */
function probEventNumDen(ev) {
  if (ev.context === 'balls') return { n: ev.counts[ev.ask], d: ev.total };
  if (ev.context === 'coins') {
    if (ev.tosses === 1) return { n: 1, d: 2 };
    if (ev.ask === 'two heads' || ev.ask === 'two tails') return { n: 1, d: 4 };
    return { n: 2, d: 4 }; // one head one tail
  }
  if (ev.context === 'dice') {
    if (ev.dice === 1) {
      if (ev.ask === 'a 6') return { n: 1, d: 6 };
      if (ev.ask === 'an even number') return { n: 3, d: 6 };
      if (ev.ask === 'a number greater than 4') return { n: 2, d: 6 };
      if (ev.ask === 'a 1 or 2') return { n: 2, d: 6 };
    }
    if (ev.dice === 2) {
      if (ev.ask === 'a sum of 7') return { n: 6, d: 36 };
      if (ev.ask === 'a sum of 8') return { n: 5, d: 36 };
      if (ev.ask === 'a double') return { n: 6, d: 36 };
      if (ev.ask === 'both odd') return { n: 9, d: 36 };
    }
  }
  // cards
  const map = {
    'a heart': [13, 52], 'a spade': [13, 52],
    'a red card': [26, 52], 'a black card': [26, 52],
    'a king': [4, 52], 'a queen': [4, 52], 'an ace': [4, 52],
    'a face card': [12, 52],
    'the ace of spades': [1, 52], 'a 7': [4, 52],
  };
  const [n, d] = map[ev.ask] || [1, 52];
  return { n, d };
}

/** Build the natural-language prompt for an event description. */
function probPromptForEvent(ev, level, probType) {
  let scenario = '';
  if (ev.context === 'balls') {
    const parts = Object.entries(ev.counts).map(([k, v]) => `${v} ${k}`).join(', ');
    scenario = `A bag contains ${parts} balls (${ev.total} balls in total). One ball is drawn at random.`;
  } else if (ev.context === 'coins') {
    scenario = ev.tosses === 1
      ? 'A fair coin is tossed once.'
      : 'A fair coin is tossed twice.';
  } else if (ev.context === 'dice') {
    scenario = ev.dice === 1
      ? 'A standard six-sided die is rolled.'
      : 'Two standard six-sided dice are rolled.';
  } else {
    scenario = 'A card is drawn at random from a standard deck of 52 cards.';
  }

  const askPlain = `What is the probability of getting ${ev.ask}?`;
  const askComplement = `What is the probability of NOT getting ${ev.ask}?`;
  const ask = (probType === 2) ? askComplement : askPlain;

  if (level === 1) {
    // Plain English only
    return scenario + ' ' + ask;
  }
  if (level === 2) {
    // Plain English with P(x) notation alongside
    const px = (probType === 2) ? `P(not ${ev.ask})` : `P(${ev.ask})`;
    return `${scenario} ${ask}\nIn notation: ${px} = ?`;
  }
  // Level 3 — P(x) notation only (deck explainer rendered by client once)
  const px = (probType === 2) ? `P(not ${ev.ask})` : `P(${ev.ask})`;
  return `${scenario} Find ${px}.`;
}

/** Simplify fraction and return {num, den}. Reuses simplifyFraction from the shared utils. */
function probAnswer(numerator, denominator) {
  return simplifyFraction(numerator, denominator);
}

/** Build a question for problem type 1 (single event). */
function probTypeSingle(context, level) {
  const ev = probSampleEvent(context);
  const { n, d } = probEventNumDen(ev);
  const ans = probAnswer(n, d);
  return {
    type: 1, context, ev,
    prompt: probPromptForEvent(ev, level, 1),
    ansNum: ans.num, ansDen: ans.den,
  };
}

/** Type 2 — complementary event: P(not X) = 1 - P(X). */
function probTypeComplement(context, level) {
  const ev = probSampleEvent(context);
  const { n, d } = probEventNumDen(ev);
  const ans = probAnswer(d - n, d);
  return {
    type: 2, context, ev,
    prompt: probPromptForEvent(ev, level, 2),
    ansNum: ans.num, ansDen: ans.den,
  };
}

/** Type 3 — multiple events with replacement: P(A then A) = P(A) × P(A). */
function probTypeMultiWithRep(context, level) {
  const ev = probSampleEvent(context);
  const { n, d } = probEventNumDen(ev);
  // Two-draw with replacement
  const ans = probAnswer(n * n, d * d);
  let prompt;
  if (ev.context === 'balls') {
    const parts = Object.entries(ev.counts).map(([k, v]) => `${v} ${k}`).join(', ');
    prompt = `A bag contains ${parts} balls. A ball is drawn, its colour noted, and it is REPLACED. Then a second ball is drawn. What is the probability that BOTH balls are ${ev.ask}?`;
  } else if (ev.context === 'dice') {
    prompt = `${ev.dice === 1 ? 'A die is' : 'Two dice are'} rolled twice. What is the probability of getting ${ev.ask} on BOTH rolls?`;
  } else if (ev.context === 'coins') {
    prompt = `A coin is tossed twice (each toss independent). What is the probability of getting ${ev.ask} both times?`;
  } else {
    prompt = `A card is drawn from a deck, REPLACED, and another is drawn. What is the probability that BOTH cards are ${ev.ask}?`;
  }
  if (level === 3) prompt += ` (Express as a simplified fraction.)`;
  return { type: 3, context, ev, prompt, ansNum: ans.num, ansDen: ans.den };
}

/** Type 4 — multiple events without replacement: requires balls or cards. */
function probTypeMultiNoRep(context, level) {
  // Only meaningful for balls / cards (countable, finite). Coerce to balls if context is coins/dice.
  let ctx = (context === 'coins' || context === 'dice') ? 'balls' : context;
  if (ctx === 'cards' && level < 3) ctx = 'balls';
  const ev = probSampleEvent(ctx);
  const { n, d } = probEventNumDen(ev);
  if (n < 2 || d < 2) {
    // Not enough to draw two; fallback
    return probTypeMultiWithRep(context, level);
  }
  const ans = probAnswer(n * (n - 1), d * (d - 1));
  let prompt;
  if (ctx === 'balls') {
    const parts = Object.entries(ev.counts).map(([k, v]) => `${v} ${k}`).join(', ');
    prompt = `A bag contains ${parts} balls. Two are drawn without replacement. What is the probability that BOTH are ${ev.ask}?`;
  } else {
    prompt = `Two cards are drawn from a deck without replacement. What is the probability that BOTH are ${ev.ask}?`;
  }
  if (level === 3) prompt += ` (Express as a simplified fraction.)`;
  return { type: 4, context: ctx, ev, prompt, ansNum: ans.num, ansDen: ans.den };
}

const PROB_TYPE_BUILDERS = {
  1: probTypeSingle,
  2: probTypeComplement,
  3: probTypeMultiWithRep,
  4: probTypeMultiNoRep,
};

app.get('/prob-api/question', (req, res) => {
  let level = parseInt(req.query.level, 10);
  if (!level || isNaN(level)) {
    const map = { easy: 1, medium: 2, hard: 3, extrahard: 3 };
    level = map[req.query.difficulty] || 1;
  }
  level = Math.max(1, Math.min(3, level));

  let context = (req.query.context || '').toLowerCase();
  if (!PROB_VALID_CONTEXTS.includes(context)) context = 'balls';
  // Spec hard-rule: cards never appear before Level 3
  if (context === 'cards' && level < 3) context = 'balls';
  // Spec: dice not until Level 2+
  if (context === 'dice' && level < 2) context = 'balls';

  let probType = parseInt(req.query.probType, 10);
  if (!probType || isNaN(probType)) {
    // legacy: difficulty=hard maps to multi-with-replacement; extrahard to without
    if (req.query.difficulty === 'hard') probType = 3;
    else if (req.query.difficulty === 'extrahard') probType = 4;
    else probType = 1;
  }
  probType = Math.max(1, Math.min(4, probType));
  // Spec hard-rule: type 4 (without-replacement) gated until type 3 mastered — client enforces; server accepts.

  const seen = String(req.query.seen || '').split(',').filter(Boolean);
  const builder = PROB_TYPE_BUILDERS[probType] || probTypeSingle;

  let q, attempts = 0;
  let id;
  do {
    q = builder(context, level);
    id = `prob-L${level}-T${probType}-${context}-${q.ev.ask}-${q.ansNum}/${q.ansDen}`;
    attempts++;
  } while (seen.includes(id) && attempts < 25);

  // Worked example — shown by the client when it sees N consecutive wrongs (per spec).
  const worked = {
    heading: `Worked example: P(event) = favourable outcomes / total outcomes`,
    lines: [
      `For the event "${q.ev.askLabel}", count the favourable outcomes and divide by total.`,
      `Simplify the resulting fraction by dividing numerator and denominator by their GCD.`,
    ],
  };

  const display = q.ansDen === 1 ? String(q.ansNum) : `${q.ansNum}/${q.ansDen}`;
  res.json({
    id,
    level, context, probType,
    type: ['', 'simple', 'complement', 'multi_with_rep', 'multi_no_rep'][probType],
    prompt: q.prompt,
    ansNum: q.ansNum, ansDen: q.ansDen,
    display,
    worked,
  });
});

app.post('/prob-api/check', express.json(), (req, res) => {
  const { ansNum, ansDen } = req.body;
  // Accept "3/5", "3 / 5", or a decimal. Also accept unsimplified equivalents (e.g., 6/10 ≡ 3/5).
  const userStr = String(req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let uNum, uDen;
  const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
  if (fracMatch) {
    uNum = parseInt(fracMatch[1], 10);
    uDen = parseInt(fracMatch[2], 10);
  } else {
    const n = parseFloat(userStr);
    if (!isNaN(n)) { uNum = Math.round(n * 10000); uDen = 10000; }
  }
  const es = simplifyFraction(ansNum, ansDen);
  let correct = false, wasUnsimplified = false;
  if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
    const us = simplifyFraction(uNum, uDen);
    correct = us.num === es.num && us.den === es.den;
    if (correct && fracMatch) {
      // Detect unsimplified: user fraction wasn't already in lowest terms
      wasUnsimplified = !(uNum === es.num && uDen === es.den);
    }
  }
  const display = es.den === 1 ? String(es.num) : `${es.num}/${es.den}`;
  res.json({
    correct, display,
    message: correct
      ? (wasUnsimplified ? `Correct! In simplest form: ${display}.` : 'Correct!')
      : 'Incorrect',
    wasUnsimplified,
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICS API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/stats-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Mean of a list
    const n = triRand(5, 8);
    const data = Array.from({ length: n }, () => triRand(1, 20));
    const sum = data.reduce((s, v) => s + v, 0);
    const mean = sum / n;
    const g = gcd(Math.abs(sum), n);
    const prompt = `Find the mean of: ${data.join(', ')}`;
    res.json({ id, difficulty, type: 'mean', prompt, data, ansNum: sum / g, ansDen: n / g });
  }
  else if (difficulty === 'medium') {
    // Median of a list
    const n = triPick([5, 7, 9, 6, 8, 10]);
    const data = Array.from({ length: n }, () => triRand(1, 30));
    const sorted = [...data].sort((a, b) => a - b);
    let median, ansNum, ansDen;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
      ansNum = median; ansDen = 1;
    } else {
      const a = sorted[n / 2 - 1]; const b = sorted[n / 2];
      const g = gcd(Math.abs(a + b), 2);
      ansNum = (a + b) / g; ansDen = 2 / g;
    }
    const prompt = `Find the median of: ${data.join(', ')}`;
    res.json({ id, difficulty, type: 'median', prompt, data, ansNum, ansDen });
  }
  else if (difficulty === 'hard') {
    // Mode and range
    const subtype = triPick(['mode', 'range']);
    const n = triRand(7, 12);
    let data;
    if (subtype === 'mode') {
      const modeVal = triRand(1, 20);
      data = [modeVal, modeVal, modeVal];
      while (data.length < n) {
        const v = triRand(1, 25);
        if (v !== modeVal || data.filter(x => x === v).length < 2) data.push(v);
      }
      // Shuffle
      for (let i = data.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [data[i], data[j]] = [data[j], data[i]]; }
      const prompt = `Find the mode of: ${data.join(', ')}`;
      res.json({ id, difficulty, type: 'mode', subtype: 'mode', prompt, data, answer: modeVal, display: String(modeVal) });
    } else {
      data = Array.from({ length: n }, () => triRand(1, 50));
      const range = Math.max(...data) - Math.min(...data);
      const prompt = `Find the range of: ${data.join(', ')}`;
      res.json({ id, difficulty, type: 'range', subtype: 'range', prompt, data, answer: range, display: String(range) });
    }
  }
  else {
    // Mean from frequency table
    const values = [1, 2, 3, 4, 5];
    const freqs = values.map(() => triRand(1, 10));
    const totalF = freqs.reduce((s, v) => s + v, 0);
    const totalFx = values.reduce((s, v, i) => s + v * freqs[i], 0);
    const g = gcd(Math.abs(totalFx), totalF);
    const table = values.map((v, i) => `${v}(×${freqs[i]})`).join(', ');
    const prompt = `Frequency table: ${table}. Find the mean.`;
    res.json({ id, difficulty, type: 'freq_mean', prompt, ansNum: totalFx / g, ansDen: totalF / g });
  }
});

app.post('/stats-api/check', express.json(), (req, res) => {
  const { type } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;
  let display;

  if (type === 'mode' || type === 'range') {
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && userNum === req.body.answer;
    display = req.body.display;
  } else {
    const { ansNum, ansDen } = req.body;
    const es = simplifyFraction(ansNum, ansDen);
    const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
    let uNum, uDen;
    if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
    else { const n = parseFloat(userStr);
      if (!isNaN(n)) {
        // Convert decimal to fraction for comparison
        if (Number.isInteger(n)) { uNum = n; uDen = 1; }
        else { uNum = Math.round(n * 100); uDen = 100; }
      }
    }
    if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
      const us = simplifyFraction(uNum, uDen);
      correct = us.num === es.num && us.den === es.den;
    }
    // Also accept decimal approximation
    if (!correct && !isNaN(parseFloat(userStr))) {
      correct = Math.abs(parseFloat(userStr) - es.num / es.den) < 0.01;
    }
    display = es.den === 1 ? String(es.num) : `${es.num}/${es.den}`;
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// MATRICES API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/matrix-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Add two 2×2 matrices
    const A = [[triRand(-5,9), triRand(-5,9)], [triRand(-5,9), triRand(-5,9)]];
    const B = [[triRand(-5,9), triRand(-5,9)], [triRand(-5,9), triRand(-5,9)]];
    const R = [[A[0][0]+B[0][0], A[0][1]+B[0][1]], [A[1][0]+B[1][0], A[1][1]+B[1][1]]];
    const fmtM = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
    const prompt = `A = ${fmtM(A)}, B = ${fmtM(B)}. Find A + B.`;
    res.json({ id, difficulty, type: 'add', prompt, answer: R, display: fmtM(R) });
  }
  else if (difficulty === 'medium') {
    // Scalar multiplication
    const k = triRand(-3, 5); if (k === 0) k = 2;
    const A = [[triRand(-5,9), triRand(-5,9)], [triRand(-5,9), triRand(-5,9)]];
    const R = [[k*A[0][0], k*A[0][1]], [k*A[1][0], k*A[1][1]]];
    const fmtM = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
    const prompt = `A = ${fmtM(A)}. Find ${k}A.`;
    res.json({ id, difficulty, type: 'scalar', prompt, answer: R, display: fmtM(R) });
  }
  else if (difficulty === 'hard') {
    // Determinant of 2×2
    const a = triRand(-5,8); const b = triRand(-5,8);
    const c = triRand(-5,8); const d = triRand(-5,8);
    const det = a * d - b * c;
    const prompt = `Find the determinant of [${a},${b};${c},${d}]`;
    res.json({ id, difficulty, type: 'determinant', prompt, answer: det, display: String(det) });
  }
  else {
    // Multiply two 2×2 matrices
    const A = [[triRand(-3,5), triRand(-3,5)], [triRand(-3,5), triRand(-3,5)]];
    const B = [[triRand(-3,5), triRand(-3,5)], [triRand(-3,5), triRand(-3,5)]];
    const R = [
      [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
      [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]]
    ];
    const fmtM = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
    const prompt = `A = ${fmtM(A)}, B = ${fmtM(B)}. Find AB.`;
    res.json({ id, difficulty, type: 'multiply', prompt, answer: R, display: fmtM(R) });
  }
});

app.post('/matrix-api/check', express.json(), (req, res) => {
  const { type, answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;

  if (type === 'determinant') {
    const userNum = parseInt(userStr);
    correct = !isNaN(userNum) && userNum === answer;
  } else {
    // Parse matrix: [a,b;c,d]
    const m = userStr.replace(/[\[\]]/g, '').split(';');
    if (m.length === 2) {
      const r0 = m[0].split(',').map(Number);
      const r1 = m[1].split(',').map(Number);
      if (r0.length === 2 && r1.length === 2) {
        correct = r0[0] === answer[0][0] && r0[1] === answer[0][1] &&
                  r1[0] === answer[1][0] && r1[1] === answer[1][1];
      }
    }
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// VECTORS API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/vectors-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Add two column vectors
    const a = [triRand(-8,8), triRand(-8,8)];
    const b = [triRand(-8,8), triRand(-8,8)];
    const ans = [a[0]+b[0], a[1]+b[1]];
    const prompt = `a = (${a[0]}, ${a[1]}), b = (${b[0]}, ${b[1]}). Find a + b.`;
    res.json({ id, difficulty, type: 'add', prompt, ansX: ans[0], ansY: ans[1], display: `(${ans[0]}, ${ans[1]})` });
  }
  else if (difficulty === 'medium') {
    // Scalar multiplication
    const k = triRand(-3, 5); if (k === 0) k = 2;
    const a = [triRand(-6,6), triRand(-6,6)];
    const ans = [k*a[0], k*a[1]];
    const prompt = `a = (${a[0]}, ${a[1]}). Find ${k}a.`;
    res.json({ id, difficulty, type: 'scalar', prompt, ansX: ans[0], ansY: ans[1], display: `(${ans[0]}, ${ans[1]})` });
  }
  else if (difficulty === 'hard') {
    // Magnitude (use Pythagorean triples for clean answers)
    const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10]];
    const [x, y, mag] = triPick(triples);
    const sx = triPick([1,-1]); const sy = triPick([1,-1]);
    const prompt = `Find |v| where v = (${sx*x}, ${sy*y})`;
    res.json({ id, difficulty, type: 'magnitude', prompt, answer: mag, display: String(mag) });
  }
  else {
    // Vector between two points
    const x1 = triRand(-8,8); const y1 = triRand(-8,8);
    const x2 = triRand(-8,8); const y2 = triRand(-8,8);
    const prompt = `A = (${x1}, ${y1}), B = (${x2}, ${y2}). Find vector AB.`;
    res.json({ id, difficulty, type: 'position', prompt, ansX: x2-x1, ansY: y2-y1, display: `(${x2-x1}, ${y2-y1})` });
  }
});

app.post('/vectors-api/check', express.json(), (req, res) => {
  const { type } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;

  if (type === 'magnitude') {
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && Math.abs(userNum - req.body.answer) < 0.5;
  } else {
    const m = userStr.replace(/[()]/g, '').split(',');
    if (m.length === 2) {
      correct = parseInt(m[0]) === req.body.ansX && parseInt(m[1]) === req.body.ansY;
    }
  }

  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// DOT PRODUCTS API
// ═══════════════════════════════════════════════════════════════════════════

// Helper: random positive 1-digit integer (1–9)
function pos1d() { return 1 + Math.floor(Math.random() * 9); }

// Helper: matrix multiply (generic NxM × MxP)
function matMul(A, B) {
  const n = A.length, m = B[0].length, p = B.length;
  const C = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++)
      for (let k = 0; k < p; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

// Helper: format matrix as [a,b;c,d] or [a,b,c;d,e,f;g,h,i] etc.
function fmtMat(M) {
  return '[' + M.map(row => row.join(',')).join(';') + ']';
}

// Helper: format vector as (a, b) or (a, b, c)
function fmtVec(v) {
  return '(' + v.join(', ') + ')';
}

app.get('/dotprod-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Dot product of two 2D vectors, all positive 1-digit
    const a = [pos1d(), pos1d()];
    const b = [pos1d(), pos1d()];
    const dot = a[0]*b[0] + a[1]*b[1];
    const prompt = `Find the dot product`;
    res.json({ id, difficulty, type: 'dot2d', prompt, vecA: a, vecB: b, answer: dot, display: String(dot) });
  }
  else if (difficulty === 'medium') {
    // Randomly choose between 2D and 3D dot product
    if (Math.random() < 0.5) {
      const a = [pos1d(), pos1d()];
      const b = [pos1d(), pos1d()];
      const dot = a[0]*b[0] + a[1]*b[1];
      const prompt = `Find the dot product`;
      res.json({ id, difficulty, type: 'dot2d', prompt, vecA: a, vecB: b, answer: dot, display: String(dot) });
    } else {
      const a = [pos1d(), pos1d(), pos1d()];
      const b = [pos1d(), pos1d(), pos1d()];
      const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
      const prompt = `Find the dot product`;
      res.json({ id, difficulty, type: 'dot3d', prompt, vecA: a, vecB: b, answer: dot, display: String(dot) });
    }
  }
  else if (difficulty === 'hard') {
    // Matrix multiplication: 2×2 or 3×3
    if (Math.random() < 0.5) {
      const A = Array.from({ length: 2 }, () => [pos1d(), pos1d()]);
      const B = Array.from({ length: 2 }, () => [pos1d(), pos1d()]);
      const C = matMul(A, B);
      const prompt = `Compute the matrix product A × B`;
      res.json({ id, difficulty, type: 'matmul', size: 2, prompt, matA: A, matB: B, answer: C, display: fmtMat(C) });
    } else {
      const A = Array.from({ length: 3 }, () => [pos1d(), pos1d(), pos1d()]);
      const B = Array.from({ length: 3 }, () => [pos1d(), pos1d(), pos1d()]);
      const C = matMul(A, B);
      const prompt = `Compute the matrix product A × B`;
      res.json({ id, difficulty, type: 'matmul', size: 3, prompt, matA: A, matB: B, answer: C, display: fmtMat(C) });
    }
  }
  else {
    // Extra hard: 4×4 matrix product with missing values
    const A = Array.from({ length: 4 }, () => [pos1d(), pos1d(), pos1d(), pos1d()]);
    const B = Array.from({ length: 4 }, () => [pos1d(), pos1d(), pos1d(), pos1d()]);
    const C = matMul(A, B);

    // Pick 4 unique blank positions
    const allPos = [];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        allPos.push([i, j]);
    for (let i = allPos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPos[i], allPos[j]] = [allPos[j], allPos[i]];
    }
    const blanks = allPos.slice(0, 4).sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
    const missingValues = blanks.map(([r, c]) => C[r][c]);

    // Build display matrix with blanks marked
    const Cdisplay = C.map(row => [...row]);
    blanks.forEach(([r, c], idx) => { Cdisplay[r][c] = '?' + (idx + 1); });

    const prompt = `Find the missing values in C = A × B`;
    const display = missingValues.join(', ');

    res.json({ id, difficulty, type: 'matfill', prompt, matA: A, matB: B, matC: Cdisplay, blanks, answer: missingValues, display });
  }
});

app.post('/dotprod-api/check', express.json(), (req, res) => {
  const { type, answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  let correct = false;

  if (type === 'dot2d' || type === 'dot3d' || type === 'dotsum') {
    // Single number answer
    const userNum = parseInt(userStr);
    correct = !isNaN(userNum) && userNum === answer;
  }
  else if (type === 'matmul') {
    // Matrix answer: [a,b;c,d] or [a,b,c;d,e,f;g,h,i]
    const inner = userStr.replace(/[\[\]]/g, '');
    const rows = inner.split(';');
    if (rows.length === answer.length) {
      correct = true;
      for (let i = 0; i < rows.length; i++) {
        const vals = rows[i].split(',').map(Number);
        if (vals.length !== answer[i].length) { correct = false; break; }
        for (let j = 0; j < vals.length; j++) {
          if (vals[j] !== answer[i][j]) { correct = false; break; }
        }
        if (!correct) break;
      }
    }
  }
  else if (type === 'matfill') {
    // Comma-separated missing values
    const vals = userStr.split(',').map(s => parseInt(s.trim()));
    if (vals.length === answer.length) {
      correct = vals.every((v, i) => !isNaN(v) && v === answer[i]);
    }
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORMATIONS API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/transform-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();
  const x = triRand(-8, 8); const y = triRand(-8, 8);

  if (difficulty === 'easy') {
    // Reflection in x-axis or y-axis
    const axis = triPick(['x-axis', 'y-axis']);
    const ansX = axis === 'y-axis' ? -x : x;
    const ansY = axis === 'x-axis' ? -y : y;
    const prompt = `Reflect (${x}, ${y}) in the ${axis}`;
    res.json({ id, difficulty, type: 'reflect', prompt, ansX, ansY, display: `(${ansX}, ${ansY})` });
  }
  else if (difficulty === 'medium') {
    // Translation by vector
    const dx = triRand(-6, 6); const dy = triRand(-6, 6);
    const prompt = `Translate (${x}, ${y}) by vector (${dx}, ${dy})`;
    res.json({ id, difficulty, type: 'translate', prompt, ansX: x + dx, ansY: y + dy, display: `(${x+dx}, ${y+dy})` });
  }
  else if (difficulty === 'hard') {
    // Rotation 90° or 180° about origin
    const angle = triPick([90, 180, 270]);
    let ansX, ansY;
    if (angle === 90) { ansX = -y; ansY = x; }        // 90° anticlockwise
    else if (angle === 180) { ansX = -x; ansY = -y; }
    else { ansX = y; ansY = -x; }                       // 270° anticlockwise = 90° clockwise
    const prompt = `Rotate (${x}, ${y}) by ${angle}° anticlockwise about the origin`;
    res.json({ id, difficulty, type: 'rotate', prompt, ansX, ansY, display: `(${ansX}, ${ansY})` });
  }
  else {
    // Enlargement from origin with scale factor
    const sf = triPick([2, 3, -1, -2, 0.5]);
    const ansX = x * sf; const ansY = y * sf;
    const sfStr = sf === 0.5 ? '1/2' : String(sf);
    const prompt = `Enlarge (${x}, ${y}) by scale factor ${sfStr} from the origin`;
    res.json({ id, difficulty, type: 'enlarge', prompt, ansX, ansY, display: `(${ansX}, ${ansY})` });
  }
});

app.post('/transform-api/check', express.json(), (req, res) => {
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  const m = userStr.replace(/[()]/g, '').split(',');
  let correct = false;
  if (m.length === 2) {
    correct = parseFloat(m[0]) === req.body.ansX && parseFloat(m[1]) === req.body.ansY;
  }
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// MENSURATION API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/mensur-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Area of rectangle, triangle, or parallelogram
    const shape = triPick(['rectangle', 'triangle', 'parallelogram']);
    const a = triRand(3, 15); const b = triRand(3, 15);
    let displayEq;
    if (shape === 'rectangle') { answer = a * b; prompt = `Area of rectangle: length = ${a}, width = ${b}`; displayEq = `${a} × ${b} = ${answer}`; }
    else if (shape === 'triangle') { answer = a * b / 2; prompt = `Area of triangle: base = ${a}, height = ${b}`; displayEq = `½ × ${a} × ${b} = ${answer}`; }
    else { answer = a * b; prompt = `Area of parallelogram: base = ${a}, height = ${b}`; displayEq = `${a} × ${b} = ${answer}`; }
    res.json({ id, difficulty, type: 'area_2d', prompt, answer, display: displayEq });
  }
  else if (difficulty === 'medium') {
    // Area & circumference of circle
    const r = triRand(2, 12);
    const subtype = triPick(['area', 'circumference']);
    let displayEq;
    if (subtype === 'area') {
      answer = Math.round(Math.PI * r * r * 100) / 100;
      prompt = `Area of circle with radius ${r} (to 2 d.p., use π = 3.14159...)`;
      displayEq = `π × ${r}² = ${answer}`;
    } else {
      answer = Math.round(2 * Math.PI * r * 100) / 100;
      prompt = `Circumference of circle with radius ${r} (to 2 d.p.)`;
      displayEq = `2 × π × ${r} = ${answer}`;
    }
    res.json({ id, difficulty, type: 'circle', prompt, answer, display: displayEq });
  }
  else if (difficulty === 'hard') {
    // Volume of cylinder, cone, or sphere
    const shape = triPick(['cylinder', 'cone', 'sphere']);
    const r = triRand(2, 8);
    let displayEq;
    if (shape === 'cylinder') {
      const h = triRand(3, 12);
      answer = Math.round(Math.PI * r * r * h * 100) / 100;
      prompt = `Volume of cylinder: radius = ${r}, height = ${h} (2 d.p.)`;
      displayEq = `π × ${r}² × ${h} = ${answer}`;
    } else if (shape === 'cone') {
      const h = triRand(3, 12);
      answer = Math.round(Math.PI * r * r * h / 3 * 100) / 100;
      prompt = `Volume of cone: radius = ${r}, height = ${h} (2 d.p.)`;
      displayEq = `⅓ × π × ${r}² × ${h} = ${answer}`;
    } else {
      answer = Math.round(4/3 * Math.PI * r * r * r * 100) / 100;
      prompt = `Volume of sphere with radius ${r} (2 d.p.)`;
      displayEq = `⁴⁄₃ × π × ${r}³ = ${answer}`;
    }
    res.json({ id, difficulty, type: 'volume', prompt, answer, display: displayEq });
  }
  else {
    // Surface area of cylinder, cone, or sphere
    const shape = triPick(['cylinder', 'sphere']);
    const r = triRand(2, 8);
    let displayEq;
    if (shape === 'cylinder') {
      const h = triRand(3, 12);
      answer = Math.round(2 * Math.PI * r * (r + h) * 100) / 100;
      prompt = `Total surface area of cylinder: radius = ${r}, height = ${h} (2 d.p.)`;
      displayEq = `2 × π × ${r} × (${r} + ${h}) = ${answer}`;
    } else {
      answer = Math.round(4 * Math.PI * r * r * 100) / 100;
      prompt = `Surface area of sphere with radius ${r} (2 d.p.)`;
      displayEq = `4 × π × ${r}² = ${answer}`;
    }
    res.json({ id, difficulty, type: 'surface_area', prompt, answer, display: displayEq });
  }
});

app.post('/mensur-api/check', express.json(), (req, res) => {
  const userNum = parseFloat((req.body.userAnswer || '').replace(/\s+/g, ''));
  const correct = !isNaN(userNum) && Math.abs(userNum - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// BEARINGS API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/bearings-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Expanded compass directions + reverse questions for variety
    const dirs = [
      { name: 'North', bearing: 0 }, { name: 'East', bearing: 90 },
      { name: 'South', bearing: 180 }, { name: 'West', bearing: 270 },
      { name: 'North-East', bearing: 45 }, { name: 'South-East', bearing: 135 },
      { name: 'South-West', bearing: 225 }, { name: 'North-West', bearing: 315 },
      { name: 'North-North-East', bearing: 23 }, { name: 'East-North-East', bearing: 68 },
      { name: 'East-South-East', bearing: 113 }, { name: 'South-South-East', bearing: 158 },
      { name: 'South-South-West', bearing: 203 }, { name: 'West-South-West', bearing: 248 },
      { name: 'West-North-West', bearing: 293 }, { name: 'North-North-West', bearing: 338 },
    ];
    const d = triPick(dirs);
    const qType = Math.random();
    let prompt, answer;
    if (qType < 0.5) {
      // Forward: compass → bearing
      prompt = `What is the three-figure bearing of ${d.name}?`;
      answer = d.bearing;
    } else if (qType < 0.75) {
      // Opposite bearing
      const opp = (d.bearing + 180) % 360;
      prompt = `What is the bearing directly opposite ${d.name}?`;
      answer = opp;
    } else {
      // 90° clockwise turn
      const turned = (d.bearing + 90) % 360;
      prompt = `Face ${d.name} and turn 90° clockwise. What bearing are you now facing?`;
      answer = turned;
    }
    const display = String(answer).padStart(3, '0');
    res.json({ id, difficulty, type: 'compass', prompt, answer, display });
  }
  else if (difficulty === 'medium') {
    // Back bearing: if bearing from A to B is x, what is bearing from B to A?
    const bearing = triRand(0, 359);
    const back = (bearing + 180) % 360;
    const fmtB = (b) => String(b).padStart(3, '0');
    const prompt = `The bearing from A to B is ${fmtB(bearing)}°. Find the bearing from B to A.`;
    res.json({ id, difficulty, type: 'back_bearing', prompt, answer: back, display: fmtB(back) });
  }
  else if (difficulty === 'hard') {
    // Find bearing given coordinates
    const dx = triRand(-10, 10); const dy = triRand(-10, 10);
    if (dx === 0 && dy === 0) dx = 1;
    // Bearing = angle measured clockwise from North
    let angle = Math.atan2(dx, dy) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    const bearing = Math.round(angle);
    const fmtB = (b) => String(b).padStart(3, '0');
    const prompt = `A is at origin. B is ${Math.abs(dx)} units ${dx >= 0 ? 'East' : 'West'} and ${Math.abs(dy)} units ${dy >= 0 ? 'North' : 'South'}. Bearing of B from A?`;
    res.json({ id, difficulty, type: 'from_coords', prompt, answer: bearing, display: fmtB(bearing) });
  }
  else {
    // Distance using bearing + trig
    const bearing = triRand(0, 359);
    const distance = triRand(5, 50);
    const rad = bearing * Math.PI / 180;
    const east = Math.round(distance * Math.sin(rad) * 10) / 10;
    const north = Math.round(distance * Math.cos(rad) * 10) / 10;
    const fmtB = (b) => String(b).padStart(3, '0');
    const prompt = `Walking ${distance}m on bearing ${fmtB(bearing)}°. How far East? (to 1 decimal place)`;
    res.json({ id, difficulty, type: 'distance_component', prompt, answer: east, display: String(east) });
  }
});

app.post('/bearings-api/check', express.json(), (req, res) => {
  const userStr = (req.body.userAnswer || '').replace(/[°\s]/g, '').replace(/−/g, '-');
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - req.body.answer) < 1;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// LOGARITHMS API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/log-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Evaluate log_b(n) where n is a perfect power of b
    const combos = [
      { b: 2, n: 4, ans: 2 }, { b: 2, n: 8, ans: 3 }, { b: 2, n: 16, ans: 4 }, { b: 2, n: 32, ans: 5 },
      { b: 2, n: 64, ans: 6 }, { b: 3, n: 9, ans: 2 }, { b: 3, n: 27, ans: 3 }, { b: 3, n: 81, ans: 4 },
      { b: 5, n: 25, ans: 2 }, { b: 5, n: 125, ans: 3 }, { b: 10, n: 100, ans: 2 }, { b: 10, n: 1000, ans: 3 },
      { b: 4, n: 16, ans: 2 }, { b: 4, n: 64, ans: 3 }, { b: 7, n: 49, ans: 2 }, { b: 6, n: 36, ans: 2 },
      { b: 2, n: 1, ans: 0 }, { b: 3, n: 1, ans: 0 }, { b: 10, n: 1, ans: 0 },
      { b: 10, n: 10, ans: 1 }, { b: 2, n: 2, ans: 1 },
    ];
    const c = triPick(combos);
    const prompt = `Evaluate log${c.b === 10 ? '' : '₊'.replace('₊', String(c.b).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join(''))}(${c.n})`;
    res.json({ id, difficulty, type: 'evaluate', prompt, answer: c.ans, display: String(c.ans) });
  }
  else if (difficulty === 'medium') {
    // Laws of logs: log(a) + log(b) = log(ab), log(a) - log(b) = log(a/b)
    const base = triPick([2, 3, 10]);
    const sub = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
    const bStr = base === 10 ? '' : sub(base);
    const subtype = triPick(['add', 'subtract', 'power']);
    if (subtype === 'add') {
      const a = triRand(2, 20); const b = triRand(2, 20);
      const prompt = `Simplify: log${bStr}(${a}) + log${bStr}(${b})`;
      const product = a * b;
      // Check if product is a clean power of base
      let ans = product;
      const display = `log${bStr}(${product})`;
      res.json({ id, difficulty, type: 'simplify_log', prompt, ansProduct: product, base, display });
    } else if (subtype === 'subtract') {
      const b = triRand(2, 8); const a = b * triRand(2, 8);
      const prompt = `Simplify: log${bStr}(${a}) − log${bStr}(${b})`;
      const quotient = a / b;
      const display = `log${bStr}(${quotient})`;
      res.json({ id, difficulty, type: 'simplify_log', prompt, ansProduct: quotient, base, display });
    } else {
      const n = triRand(2, 10); const k = triRand(2, 4);
      const prompt = `Simplify: ${k} × log${bStr}(${n})`;
      const power = Math.pow(n, k);
      const display = `log${bStr}(${power})`;
      res.json({ id, difficulty, type: 'simplify_log', prompt, ansProduct: power, base, display });
    }
  }
  else if (difficulty === 'hard') {
    // Solve: b^x = n → x = log(n)/log(b)
    const combos = [
      { b: 2, n: 4, x: 2 }, { b: 2, n: 8, x: 3 }, { b: 2, n: 16, x: 4 },
      { b: 3, n: 9, x: 2 }, { b: 3, n: 27, x: 3 }, { b: 5, n: 25, x: 2 },
      { b: 5, n: 125, x: 3 }, { b: 4, n: 64, x: 3 }, { b: 10, n: 100, x: 2 },
      { b: 2, n: 32, x: 5 }, { b: 3, n: 81, x: 4 },
    ];
    const c = triPick(combos);
    const prompt = `Solve: ${c.b}ˣ = ${c.n}`;
    res.json({ id, difficulty, type: 'solve_exp', prompt, answer: c.x, display: `x = ${c.x}` });
  }
  else {
    // Solve log equations: log(x+a) = b → x+a = 10^b
    const base = triPick([2, 10]);
    const sub = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
    const bStr = base === 10 ? '' : sub(base);
    const exp = triRand(1, 4);
    const a = triRand(-10, 10);
    const val = Math.pow(base, exp);
    const x = val - a;
    const prompt = `Solve: log${bStr}(x ${a >= 0 ? '+ ' + a : '− ' + Math.abs(a)}) = ${exp}`;
    res.json({ id, difficulty, type: 'solve_log', prompt, answer: x, display: `x = ${x}` });
  }
});

app.post('/log-api/check', express.json(), (req, res) => {
  const { type } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-').replace(/^x=/i, '');
  let correct = false;

  if (type === 'simplify_log') {
    // User should enter e.g. "log(40)" or just "40" (the argument)
    const cleaned = userStr.replace(/log[₀₁₂₃₄₅₆₇₈₉]*/g, '').replace(/[()]/g, '');
    const userNum = parseInt(cleaned);
    correct = !isNaN(userNum) && userNum === req.body.ansProduct;
  } else {
    const expected = req.body.answer;
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.01;
  }

  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// DIFFERENTIATION API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/diff-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Differentiate ax^n → anx^(n-1), evaluate at a point
    const a = triRand(1, 6); const n = triRand(2, 5);
    const x = triRand(1, 5);
    const deriv = a * n * Math.pow(x, n - 1);
    const prompt = `f(x) = ${a}x${sup(n)}. Find f'(${x}).`;
    res.json({ id, difficulty, type: 'power_rule', prompt, answer: deriv, display: String(deriv) });
  }
  else if (difficulty === 'medium') {
    // Differentiate polynomial: ax² + bx + c
    const a = triRand(-5, 5); const b = triRand(-8, 8); const c = triRand(-10, 10);
    if (a === 0) a = 2;
    const x = triRand(-3, 3);
    const deriv = 2 * a * x + b;
    const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
    const prompt = `f(x) = ${a}x² ${bStr}x ${cStr}. Find f'(${x}).`;
    res.json({ id, difficulty, type: 'polynomial', prompt, answer: deriv, display: String(deriv) });
  }
  else if (difficulty === 'hard') {
    // Find gradient at a point, or find x where gradient = 0 (turning point)
    const a = triRand(1, 4); const b = triRand(-10, 10);
    const c = triRand(-10, 10);
    // f(x) = ax² + bx + c, f'(x) = 2ax + b = 0 → x = -b/(2a)
    const g = gcd(Math.abs(b), 2 * a);
    const ansNum = -b / g;
    const ansDen = (2 * a) / g;
    const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
    const prompt = `f(x) = ${a}x² ${bStr}x ${cStr}. Find x where f'(x) = 0.`;
    const display = ansDen === 1 ? String(ansNum) : `${ansNum}/${ansDen}`;
    res.json({ id, difficulty, type: 'turning_point', prompt, ansNum, ansDen, display });
  }
  else {
    // Find whether turning point is max or min, and its y-value
    const a = triPick([1, -1, 2, -2, 3]);
    const b = triRand(-8, 8);
    const c = triRand(-10, 10);
    // f'(x) = 2ax + b = 0 → x = -b/(2a)
    const xTurn = -b / (2 * a);
    const yTurn = a * xTurn * xTurn + b * xTurn + c;
    const rounded = Math.round(yTurn * 100) / 100;
    const nature = a > 0 ? 'minimum' : 'maximum';
    const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
    const prompt = `f(x) = ${a}x² ${bStr}x ${cStr}. Find the ${nature} value of f(x).`;
    res.json({ id, difficulty, type: 'min_max', prompt, answer: rounded, display: String(rounded) });
  }
});

app.post('/diff-api/check', express.json(), (req, res) => {
  const { type } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-').replace(/^x=/i, '');
  let correct = false;

  if (type === 'turning_point') {
    const { ansNum, ansDen } = req.body;
    const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
    let uNum, uDen;
    if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
    else { const n = parseFloat(userStr); if (!isNaN(n) && Number.isInteger(n)) { uNum = n; uDen = 1; }
      else if (!isNaN(n)) { correct = Math.abs(n - ansNum / ansDen) < 0.01; } }
    if (!correct && uNum !== undefined && uDen !== undefined && uDen !== 0) {
      const us = simplifyFraction(uNum, uDen);
      const es = simplifyFraction(ansNum, ansDen);
      correct = us.num === es.num && us.den === es.den;
    }
  } else {
    const userNum = parseFloat(userStr);
    correct = !isNaN(userNum) && Math.abs(userNum - req.body.answer) < 0.5;
  }

  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// NUMBER BASES API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/bases-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Convert decimal to binary
    const n = triRand(5, 63);
    const prompt = `Convert ${n} (decimal) to binary`;
    res.json({ id, difficulty, type: 'dec_to_bin', prompt, answer: n.toString(2), display: n.toString(2) });
  }
  else if (difficulty === 'medium') {
    // Convert binary to decimal
    const n = triRand(10, 127);
    const bin = n.toString(2);
    const prompt = `Convert ${bin} (binary) to decimal`;
    res.json({ id, difficulty, type: 'bin_to_dec', prompt, answer: n, display: String(n) });
  }
  else if (difficulty === 'hard') {
    // Convert decimal to hexadecimal
    const n = triRand(16, 255);
    const prompt = `Convert ${n} (decimal) to hexadecimal`;
    res.json({ id, difficulty, type: 'dec_to_hex', prompt, answer: n.toString(16).toUpperCase(), display: n.toString(16).toUpperCase() });
  }
  else {
    // Binary addition or hex to binary
    const subtype = triPick(['bin_add', 'hex_to_bin']);
    if (subtype === 'bin_add') {
      const a = triRand(5, 30); const b = triRand(5, 30);
      const sum = a + b;
      const prompt = `Add in binary: ${a.toString(2)} + ${b.toString(2)}`;
      res.json({ id, difficulty, type: 'bin_add', prompt, answer: sum.toString(2), display: sum.toString(2) });
    } else {
      const n = triRand(16, 255);
      const hex = n.toString(16).toUpperCase();
      const prompt = `Convert ${hex} (hexadecimal) to binary`;
      res.json({ id, difficulty, type: 'hex_to_bin', prompt, answer: n.toString(2), display: n.toString(2) });
    }
  }
});

app.post('/bases-api/check', express.json(), (req, res) => {
  const { type, answer } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').toUpperCase().replace(/^0+/, '') || '0';
  let correct = false;

  if (type === 'bin_to_dec') {
    correct = parseInt(userStr) === answer;
  } else {
    const expected = String(answer).toUpperCase().replace(/^0+/, '') || '0';
    correct = userStr === expected;
  }

  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// CIRCLE THEOREMS API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/circle-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();

  if (difficulty === 'easy') {
    // Angle in semicircle = 90°
    const a = triRand(20, 70);
    const b = 90 - a;
    const prompt = `Triangle inscribed in semicircle. One angle at circumference = ${a}°. Find the other angle at circumference.`;
    res.json({ id, difficulty, type: 'semicircle', prompt, answer: b, display: `${b}°` });
  }
  else if (difficulty === 'medium') {
    // Angle at centre = 2 × angle at circumference
    const circumAngle = triRand(20, 80);
    const centreAngle = 2 * circumAngle;
    const subtype = triPick(['find_centre', 'find_circum']);
    if (subtype === 'find_centre') {
      const prompt = `Angle at circumference = ${circumAngle}°. Find the angle at the centre subtended by the same arc.`;
      res.json({ id, difficulty, type: 'centre_circum', prompt, answer: centreAngle, display: `${centreAngle}°` });
    } else {
      const prompt = `Angle at centre = ${centreAngle}°. Find the angle at the circumference subtended by the same arc.`;
      res.json({ id, difficulty, type: 'centre_circum', prompt, answer: circumAngle, display: `${circumAngle}°` });
    }
  }
  else if (difficulty === 'hard') {
    // Cyclic quadrilateral: opposite angles sum to 180°
    const a = triRand(40, 140);
    const c = 180 - a;
    const b = triRand(40, 140);
    const d = 180 - b;
    const subtype = triPick(['find_opp_a', 'find_opp_b']);
    if (subtype === 'find_opp_a') {
      const prompt = `Cyclic quadrilateral ABCD. Angle A = ${a}°. Find angle C.`;
      res.json({ id, difficulty, type: 'cyclic', prompt, answer: c, display: `${c}°` });
    } else {
      const prompt = `Cyclic quadrilateral ABCD. Angle B = ${b}°. Find angle D.`;
      res.json({ id, difficulty, type: 'cyclic', prompt, answer: d, display: `${d}°` });
    }
  }
  else {
    // Tangent perpendicular to radius; alternate segment theorem
    const subtype = triPick(['tangent_radius', 'alternate_segment']);
    if (subtype === 'tangent_radius') {
      const angle = triRand(15, 75);
      const answer = 90 - angle;
      const prompt = `Tangent meets radius at point P. Angle between tangent and chord = ${angle}°. Find the angle between radius and chord.`;
      res.json({ id, difficulty, type: 'tangent', prompt, answer, display: `${answer}°` });
    } else {
      const angle = triRand(20, 80);
      const prompt = `Alternate segment theorem: angle between tangent and chord = ${angle}°. Find the angle in the alternate segment.`;
      res.json({ id, difficulty, type: 'alt_segment', prompt, answer: angle, display: `${angle}°` });
    }
  }
});

app.post('/circle-api/check', express.json(), (req, res) => {
  const userNum = parseFloat((req.body.userAnswer || '').replace(/[°\s]/g, ''));
  const correct = !isNaN(userNum) && Math.abs(userNum - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * INTEGRATION API  /integ-api
 * Reverse differentiation, definite integrals, area under curve
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/integ-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Integrate ax^n → (a/(n+1))x^(n+1) + C, ask for coefficient and power
    const a = randInt(1, 8);
    const n = randInt(1, 4);
    const newCoeffNum = a;
    const newCoeffDen = n + 1;
    const g = gcd(Math.abs(newCoeffNum), newCoeffDen);
    const cNum = newCoeffNum / g;
    const cDen = newCoeffDen / g;
    const newPow = n + 1;
    answer = cDen === 1 ? cNum : cNum + '/' + cDen;
    display = `${answer}x^${newPow} + C`;
    prompt = `Integrate ${a === 1 ? '' : a}x${n === 1 ? '' : '^' + n} dx.\nGive the coefficient of x^${newPow} (as a fraction if needed).`;
  } else if (diff === 'medium') {
    // Integrate polynomial ax^2 + bx + c between 0 and k
    const a = randInt(1, 4);
    const b = randInt(-5, 5);
    const c = randInt(0, 6);
    const k = randInt(1, 4);
    // ∫ = (a/3)k^3 + (b/2)k^2 + ck
    // Multiply through by 6 to keep integer: 2a*k^3 + 3b*k^2 + 6c*k, then /6
    const num = 2 * a * k * k * k + 3 * b * k * k + 6 * c * k;
    const den = 6;
    const g = gcd(Math.abs(num), den);
    const rn = num / g;
    const rd = den / g;
    answer = rd === 1 ? rn : rn + '/' + rd;
    display = String(answer);
    const bStr = b >= 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;
    const cStr = c > 0 ? ` + ${c}` : '';
    prompt = `Evaluate ∫₀^${k} (${a}x² ${bStr}${cStr}) dx.`;
  } else if (diff === 'hard') {
    // ∫ (ax+b)^n dx between limits — substitution style, but keep it clean
    const a = randInt(1, 3);
    const b = randInt(-3, 3);
    const n = randInt(2, 4);
    const lo = 0;
    const hi = randInt(1, 3);
    const evalAt = (x) => Math.pow(a * x + b, n + 1) / (a * (n + 1));
    const val = evalAt(hi) - evalAt(lo);
    if (Number.isInteger(val)) {
      answer = val;
    } else {
      // express as fraction
      const top = Math.pow(a * hi + b, n + 1) - Math.pow(a * lo + b, n + 1);
      const bot = a * (n + 1);
      const g2 = gcd(Math.abs(top), Math.abs(bot));
      const rn2 = top / g2;
      const rd2 = bot / g2;
      answer = rd2 === 1 ? rn2 : (rd2 < 0 ? -rn2 + '/' + -rd2 : rn2 + '/' + rd2);
    }
    display = String(answer);
    const bStr = b >= 0 ? `+${b}` : `${b}`;
    prompt = `Evaluate ∫₀^${hi} (${a}x${bStr})^${n} dx.`;
  } else {
    // Area between curve and x-axis: y = x^2 - kx, roots at 0 and k
    const k = randInt(2, 6);
    // Area = |∫₀^k (x²-kx) dx| = |k³/3 - k³/2| = k³/6
    const num = k * k * k;
    const den = 6;
    const g = gcd(num, den);
    answer = (den / g) === 1 ? num / g : (num / g) + '/' + (den / g);
    display = String(answer);
    prompt = `Find the area enclosed between y = x² − ${k}x and the x-axis.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/integ-api/check', express.json(), (req, res) => {
  const ua = (req.body.userAnswer || '').trim().replace(/\s/g, '');
  const ans = String(req.body.answer).replace(/\s/g, '');
  let correct = ua === ans;
  // Also check numeric equivalence for fractions
  if (!correct) {
    const evalFrac = (s) => { const p = String(s).split('/'); return p.length === 2 ? parseFloat(p[0]) / parseFloat(p[1]) : parseFloat(s); };
    const u = evalFrac(ua);
    const a2 = evalFrac(ans);
    if (!isNaN(u) && !isNaN(a2) && Math.abs(u - a2) < 0.001) correct = true;
  }
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * STANDARD FORM API  /stdform-api
 * Scientific notation: convert, multiply, divide, add
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/stdform-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Convert number to standard form
    const sig = randInt(11, 99) / 10; // e.g. 3.4
    const exp = randInt(2, 7) * (Math.random() < 0.5 ? 1 : -1);
    const val = sig * Math.pow(10, exp);
    prompt = `Write ${exp > 0 ? val.toLocaleString('en-US', {useGrouping: false}) : val.toFixed(Math.abs(exp) + 1)} in standard form.`;
    answer = `${sig} × 10^${exp}`;
    display = answer;
  } else if (diff === 'medium') {
    // Multiply two numbers in standard form
    const a = randInt(11, 49) / 10;
    const ea = randInt(2, 5);
    const b = randInt(11, 49) / 10;
    const eb = randInt(2, 5);
    let product = a * b;
    let expR = ea + eb;
    // Normalize
    if (product >= 10) { product /= 10; expR += 1; }
    product = Math.round(product * 100) / 100;
    answer = `${product} × 10^${expR}`;
    display = answer;
    prompt = `Calculate (${a} × 10^${ea}) × (${b} × 10^${eb}). Give answer in standard form.`;
  } else if (diff === 'hard') {
    // Divide two numbers in standard form
    const a = randInt(20, 90) / 10;
    const ea = randInt(5, 9);
    const b = randInt(11, 49) / 10;
    const eb = randInt(2, 4);
    let quotient = a / b;
    let expR = ea - eb;
    if (quotient < 1) { quotient *= 10; expR -= 1; }
    if (quotient >= 10) { quotient /= 10; expR += 1; }
    quotient = Math.round(quotient * 100) / 100;
    answer = `${quotient} × 10^${expR}`;
    display = answer;
    prompt = `Calculate (${a} × 10^${ea}) ÷ (${b} × 10^${eb}). Give answer in standard form.`;
  } else {
    // Add/subtract two numbers in standard form (same power)
    const exp = randInt(3, 7);
    const a = randInt(11, 50) / 10;
    const b = randInt(11, 40) / 10;
    const sum = a + b;
    let resCoeff = sum;
    let resExp = exp;
    if (resCoeff >= 10) { resCoeff /= 10; resExp += 1; }
    resCoeff = Math.round(resCoeff * 100) / 100;
    answer = `${resCoeff} × 10^${resExp}`;
    display = answer;
    prompt = `Calculate (${a} × 10^${exp}) + (${b} × 10^${exp}). Give answer in standard form.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/stdform-api/check', express.json(), (req, res) => {
  const normalize = (s) => String(s).replace(/\s/g, '').replace(/×10\^/gi, 'e').replace(/x10\^/gi, 'e').replace(/\*10\^/gi, 'e');
  const ua = normalize(req.body.userAnswer || '');
  const ans = normalize(String(req.body.answer));
  const correct = ua === ans;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * BOUNDS API  /bounds-api
 * Upper/lower bounds, error intervals, significant figures
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/bounds-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Round to 1 dp → give lower bound
    const val = randInt(10, 99);
    const dp1 = randInt(1, 9);
    const num = val + dp1 / 10; // e.g. 4.3
    prompt = `${num} is rounded to 1 decimal place. What is the lower bound?`;
    answer = num - 0.05;
    display = String(answer);
  } else if (diff === 'medium') {
    // Nearest 10 → give upper bound
    const base = randInt(3, 15) * 10; // e.g. 80
    prompt = `A length is ${base} cm, rounded to the nearest 10 cm. What is the upper bound?`;
    answer = base + 5;
    display = String(answer);
  } else if (diff === 'hard') {
    // Bounds of a calculation: a+b where both rounded to 1dp
    const a = randInt(20, 50) / 10; // e.g. 3.4
    const b = randInt(20, 50) / 10;
    prompt = `a = ${a} (1 d.p.) and b = ${b} (1 d.p.). Find the upper bound of a + b.`;
    answer = Math.round((a + 0.05 + b + 0.05) * 100) / 100;
    display = String(answer);
  } else {
    // Bounds of division: a/b, max = a_upper/b_lower
    const a = randInt(30, 80) / 10;
    const b = randInt(20, 40) / 10;
    const upperA = a + 0.05;
    const lowerB = b - 0.05;
    const result = Math.round((upperA / lowerB) * 1000) / 1000;
    prompt = `a = ${a} (1 d.p.) and b = ${b} (1 d.p.). Find the upper bound of a ÷ b. Give answer to 3 d.p.`;
    answer = result;
    display = String(answer);
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/bounds-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/\s/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.005;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * SPEED DISTANCE TIME API  /sdt-api
 * Rate problems, average speed, unit conversions
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/sdt-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Find distance = speed × time
    const s = randInt(20, 80); // km/h
    const t = randInt(2, 6); // hours
    answer = s * t;
    display = answer + ' km';
    prompt = `A car travels at ${s} km/h for ${t} hours. How far does it travel (in km)?`;
  } else if (diff === 'medium') {
    // Find time = distance / speed
    const s = randInt(30, 70);
    const d = s * randInt(2, 5); // ensure clean answer
    answer = d / s;
    display = answer + ' hours';
    prompt = `A train covers ${d} km at ${s} km/h. How long does the journey take (in hours)?`;
  } else if (diff === 'hard') {
    // Average speed for two-leg journey
    const d1 = randInt(30, 80);
    const s1 = randInt(20, 60);
    const d2 = randInt(30, 80);
    const s2 = randInt(20, 60);
    const totalD = d1 + d2;
    // time = d1/s1 + d2/s2 = (d1*s2 + d2*s1) / (s1*s2)
    const timeNum = d1 * s2 + d2 * s1;
    const timeDen = s1 * s2;
    // avg speed = totalD / time = totalD * timeDen / timeNum
    const ansNum = totalD * timeDen;
    const ansDen = timeNum;
    const g = gcd(Math.abs(ansNum), Math.abs(ansDen));
    const rn = ansNum / g;
    const rd = ansDen / g;
    answer = rd === 1 ? rn : Math.round((rn / rd) * 100) / 100;
    display = answer + ' km/h';
    prompt = `A cyclist rides ${d1} km at ${s1} km/h then ${d2} km at ${s2} km/h. Find the average speed (to 2 d.p. if needed).`;
  } else {
    // Convert units: m/s to km/h or vice versa
    const ms = randInt(5, 30); // m/s
    answer = Math.round(ms * 3.6 * 100) / 100;
    display = answer + ' km/h';
    prompt = `Convert ${ms} m/s to km/h.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/sdt-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[^\d.\-\/]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.05;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * VARIATION API  /variation-api
 * Direct, inverse, joint variation — find k, find unknowns
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/variation-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // y = kx, given y and x find k, then find y for new x
    const k = randInt(2, 9);
    const x1 = randInt(2, 6);
    const y1 = k * x1;
    const x2 = randInt(3, 8);
    answer = k * x2;
    display = String(answer);
    prompt = `y is directly proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
  } else if (diff === 'medium') {
    // y = k/x (inverse), given y and x find y for new x
    const k = randInt(12, 60);
    const x1 = randInt(2, 6);
    // ensure k divisible by x1 and x2
    const x2 = randInt(2, 6);
    const kUse = x1 * x2 * randInt(1, 4);
    const y1 = kUse / x1;
    answer = kUse / x2;
    display = String(answer);
    prompt = `y is inversely proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
  } else if (diff === 'hard') {
    // y = kx², given y and x find y for new x
    const k = randInt(1, 5);
    const x1 = randInt(2, 5);
    const y1 = k * x1 * x1;
    const x2 = randInt(2, 6);
    answer = k * x2 * x2;
    display = String(answer);
    prompt = `y is directly proportional to x². When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
  } else {
    // y = k/√x (inverse square root)
    const x1 = [4, 9, 16, 25][randInt(0, 3)];
    const sqrtX1 = Math.round(Math.sqrt(x1));
    const k = sqrtX1 * randInt(2, 6);
    const y1 = k / sqrtX1;
    const x2 = [4, 9, 16, 25][randInt(0, 3)];
    const sqrtX2 = Math.round(Math.sqrt(x2));
    answer = k / sqrtX2;
    display = String(answer);
    prompt = `y is inversely proportional to √x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/variation-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/\s/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.05;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * HCF & LCM API  /hcflcm-api
 * Find HCF/LCM of 2-3 numbers, word problems
 * ═══════════════════════════════════════════════════════════════════════════ */

function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

app.get('/hcflcm-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  const type = randInt(1, 4);

  if (diff === 'easy') {
    if (type === 1) {
      // HCF of two numbers
      const g = randInt(2, 8);
      const a = g * randInt(2, 5);
      const b = g * randInt(2, 5);
      answer = gcd(a, b);
      display = String(answer);
      prompt = `Find the HCF (Highest Common Factor) of ${a} and ${b}.`;
    } else if (type === 2) {
      // HCF of two coprime numbers
      const a = [9, 14, 15, 21, 25, 27][randInt(0, 5)];
      const b = [8, 11, 16, 22, 26, 29][randInt(0, 5)];
      answer = gcd(a, b);
      display = String(answer);
      prompt = `What is the Highest Common Factor (HCF) of ${a} and ${b}?`;
    } else if (type === 3) {
      // Simple word problem
      const factors = [
        { a: 12, b: 18, g: 6, fruit1: 'apples', fruit2: 'oranges' },
        { a: 16, b: 24, g: 8, fruit1: 'stickers', fruit2: 'stamps' },
        { a: 15, b: 20, g: 5, fruit1: 'pens', fruit2: 'pencils' },
        { a: 8, b: 12, g: 4, fruit1: 'blue beads', fruit2: 'red beads' }
      ][randInt(0, 3)];
      answer = factors.g;
      display = String(answer);
      prompt = `A teacher has ${factors.a} ${factors.fruit1} and ${factors.b} ${factors.fruit2}. She wants to divide them equally among her students without leftovers. What is the maximum number of students who can get an equal share?`;
    } else {
      // HCF of a and b where a divides b
      const a = randInt(3, 9);
      const b = a * randInt(2, 4);
      answer = a;
      display = String(answer);
      prompt = `Find the HCF of ${a} and ${b}.`;
    }
  } else if (diff === 'medium') {
    if (type === 1) {
      // LCM of two numbers
      const a = randInt(4, 12);
      const b = randInt(4, 12);
      answer = lcm(a, b);
      display = String(answer);
      prompt = `Find the LCM (Lowest Common Multiple) of ${a} and ${b}.`;
    } else if (type === 2) {
      // LCM of prime numbers
      const primes = [3, 5, 7, 11];
      const a = primes[randInt(0, 3)];
      let b = primes[randInt(0, 3)];
      while (a === b) { b = primes[randInt(0, 3)]; }
      answer = lcm(a, b);
      display = String(answer);
      prompt = `What is the Lowest Common Multiple (LCM) of ${a} and ${b}?`;
    } else if (type === 3) {
      // Simple LCM word problem
      const p = [
        { a: 6, b: 8, l: 24, thing: 'neon signs blink', unit: 'seconds' },
        { a: 10, b: 15, l: 30, thing: 'bus schedules align', unit: 'minutes' },
        { a: 4, b: 6, l: 12, thing: 'alarms beep', unit: 'minutes' }
      ][randInt(0, 2)];
      answer = p.l;
      display = String(answer);
      prompt = `Two ${p.thing} at intervals of ${p.a} and ${p.b} ${p.unit}. If they align now, after how many ${p.unit} will they next align?`;
    } else {
      // LCM of a and b where a divides b
      const a = randInt(3, 8);
      const b = a * randInt(2, 4);
      answer = b;
      display = String(answer);
      prompt = `Find the LCM of ${a} and ${b}.`;
    }
  } else if (diff === 'hard') {
    if (type === 1) {
      // LCM of three numbers
      const a = randInt(3, 8);
      const b = randInt(3, 8);
      const c = randInt(3, 8);
      answer = lcm(lcm(a, b), c);
      display = String(answer);
      prompt = `Find the LCM of ${a}, ${b}, and ${c}.`;
    } else if (type === 2) {
      // HCF of three numbers
      const g = randInt(2, 6);
      const a = g * randInt(2, 4);
      const b = g * randInt(2, 4);
      const c = g * randInt(2, 4);
      answer = gcd(gcd(a, b), c);
      display = String(answer);
      prompt = `Find the Highest Common Factor (HCF) of ${a}, ${b}, and ${c}.`;
    } else if (type === 3) {
      // Product formula problem
      const base = [
        { h: 4, l: 24, a: 8, b: 12 },
        { h: 6, l: 36, a: 12, b: 18 },
        { h: 5, l: 30, a: 10, b: 15 },
        { h: 3, l: 18, a: 6, b: 9 }
      ][randInt(0, 3)];
      answer = base.b;
      display = String(answer);
      prompt = `The HCF of two numbers is ${base.h} and their LCM is ${base.l}. If one of the numbers is ${base.a}, what is the other number?`;
    } else {
      // Word problem with three runners
      const a = [3, 4, 6][randInt(0, 2)];
      const b = [4, 5, 8][randInt(0, 2)];
      const c = [6, 8, 12][randInt(0, 2)];
      answer = lcm(lcm(a, b), c);
      display = String(answer);
      prompt = `Three runners start running a lap together. Runner A completes a lap in ${a} minutes, Runner B in ${b} minutes, and Runner C in ${c} minutes. After how many minutes will they next meet at the starting point?`;
    }
  } else {
    // extrahard
    if (type === 1) {
      // HCF with remainder: largest number dividing a and b with remainder r
      const r = randInt(2, 5);
      const g = randInt(4, 10);
      const f1 = randInt(2, 4);
      const f2 = randInt(2, 4);
      const a = g * f1 + r;
      const b = g * f2 + r;
      // answer is g
      answer = gcd(a - r, b - r);
      display = String(answer);
      prompt = `Find the largest number that divides ${a} and ${b} leaving a remainder of ${r} in each case.`;
    } else if (type === 2) {
      // LCM with remainder: smallest number divided by a and b leaving remainder r
      const r = randInt(2, 5);
      const a = randInt(5, 10);
      const b = randInt(5, 10);
      answer = lcm(a, b) + r;
      display = String(answer);
      prompt = `What is the smallest positive integer which when divided by ${a} and ${b} leaves a remainder of ${r} in each case?`;
    } else if (type === 3) {
      // Merchant ribbon piece division
      const lengths = [
        { a: 48, b: 72, c: 96, g: 24 },
        { a: 30, b: 45, c: 75, g: 15 },
        { a: 36, b: 54, c: 90, g: 18 },
        { a: 40, b: 60, c: 80, g: 20 }
      ][randInt(0, 3)];
      answer = lengths.g;
      display = String(answer);
      prompt = `A merchant has three pieces of ribbon of lengths ${lengths.a} cm, ${lengths.b} cm, and ${lengths.c} cm. He wants to cut them into equal pieces of the maximum possible length. What should be the length of each piece (in cm)?`;
    } else {
      // Neon lights word problem
      const a = randInt(6, 12);
      const b = randInt(8, 15);
      answer = lcm(a, b);
      display = String(answer);
      prompt = `Two neon signs blink at different rates. Sign A blinks every ${a} seconds, and Sign B blinks every ${b} seconds. If they both blink together now, after how many seconds will they next blink together?`;
    }
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/hcflcm-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[^\d.\-]/g, ''));
  const correct = !isNaN(ua) && ua === req.body.answer;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * PROFIT & LOSS API  /profitloss-api
 * Cost price, selling price, profit %, discount, markup
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/profitloss-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Find profit given CP and SP
    const cp = randInt(20, 200) * 5;
    const profit = randInt(10, 50) * 5;
    const sp = cp + profit;
    answer = profit;
    display = '$' + answer;
    prompt = `An item is bought for $${cp} and sold for $${sp}. Find the profit.`;
  } else if (diff === 'medium') {
    // Find profit %
    const cp = randInt(10, 100) * 10;
    const profitPct = randInt(5, 40);
    const profit = cp * profitPct / 100;
    const sp = cp + profit;
    answer = profitPct;
    display = answer + '%';
    prompt = `Cost price = $${cp}, selling price = $${sp}. Find the profit percentage.`;
  } else if (diff === 'hard') {
    // Discount: marked price, discount %, find SP
    const mp = randInt(20, 100) * 10;
    const discPct = [10, 15, 20, 25, 30][randInt(0, 4)];
    const sp = mp * (100 - discPct) / 100;
    answer = sp;
    display = '$' + answer;
    prompt = `A shirt has a marked price of $${mp}. A ${discPct}% discount is applied. Find the selling price.`;
  } else {
    // Two successive discounts
    const mp = randInt(20, 100) * 10;
    const d1 = [10, 20, 25][randInt(0, 2)];
    const d2 = [10, 15, 20][randInt(0, 2)];
    const after1 = mp * (100 - d1) / 100;
    const after2 = after1 * (100 - d2) / 100;
    answer = after2;
    display = '$' + answer;
    prompt = `Marked price is $${mp}. Successive discounts of ${d1}% and ${d2}% are applied. Find the final price.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/profitloss-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[$,\s%]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.05;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * ROUNDING API  /rounding-api
 * Decimal places, significant figures, estimation
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/rounding-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Round to given dp — use half-up via roundHalfUp() to fix the
    // historical IEEE-754 bug where e.g. 6.835 would round to 6.83 instead
    // of 6.84 (Module 49 spec).
    const dp = randInt(1, 2);
    const num = (randInt(100, 9999) / 1000).toFixed(4);
    answer = roundHalfUp(parseFloat(num), dp);
    display = answer.toFixed(dp);
    prompt = `Round ${num} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
  } else if (diff === 'medium') {
    // Round to N significant figures — also via half-up so that values like
    // 0.045 → 0.05, 75 → 80 round up consistently.
    const sf = randInt(1, 3);
    const num = randInt(1000, 99999) / (Math.pow(10, randInt(0, 2)));
    const rounded = roundSigFigs(num, sf);
    answer = rounded;
    display = String(rounded);
    prompt = `Round ${num} to ${sf} significant figure${sf > 1 ? 's' : ''}.`;
  } else if (diff === 'hard') {
    // Truncate (not round) to N dp — truncation is unaffected by the half-up
    // rule, leave existing logic intact.
    const dp = randInt(1, 3);
    const num = (randInt(10000, 99999) / 10000).toFixed(5);
    const factor = Math.pow(10, dp);
    answer = Math.trunc(parseFloat(num) * factor) / factor;
    display = answer.toFixed(dp);
    prompt = `Truncate ${num} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
  } else {
    // Estimation: round each to 1 sf then compute (half-up).
    const a = randInt(10, 99);
    const b = randInt(10, 99);
    const aRound = roundSigFigs(a, 1);
    const bRound = roundSigFigs(b, 1);
    answer = aRound * bRound;
    display = String(answer);
    prompt = `Estimate ${a} × ${b} by rounding each number to 1 significant figure.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/rounding-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/\s/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.005;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * BINOMIAL THEOREM API  /binomial-api
 * Expand (a+b)^n, find specific terms, coefficient extraction
 * ═══════════════════════════════════════════════════════════════════════════ */

// nCr function
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) { result = result * (n - i) / (i + 1); }
  return Math.round(result);
}

app.get('/binomial-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Find nCr
    const n = randInt(4, 10);
    const r = randInt(1, Math.min(n - 1, 5));
    answer = nCr(n, r);
    display = String(answer);
    prompt = `Evaluate ${n}C${r} (${n} choose ${r}).`;
  } else if (diff === 'medium') {
    // Find coefficient of x^r in (1+x)^n
    const n = randInt(4, 10);
    const r = randInt(2, Math.min(n - 1, 5));
    answer = nCr(n, r);
    display = String(answer);
    prompt = `Find the coefficient of x^${r} in the expansion of (1 + x)^${n}.`;
  } else if (diff === 'hard') {
    // Find coefficient of x^r in (a+bx)^n
    const a = randInt(1, 3);
    const b = randInt(1, 3);
    const n = randInt(3, 6);
    const r = randInt(1, Math.min(n, 4));
    // Term: nCr * a^(n-r) * (bx)^r = nCr * a^(n-r) * b^r * x^r
    answer = nCr(n, r) * Math.pow(a, n - r) * Math.pow(b, r);
    display = String(answer);
    prompt = `Find the coefficient of x^${r} in (${a} + ${b}x)^${n}.`;
  } else {
    // Find a specific term in (1+x)^n expansion, e.g. the 4th term
    const n = randInt(5, 10);
    const termNum = randInt(2, Math.min(n, 5)); // the termNum-th term (1-indexed)
    const r = termNum - 1;
    answer = nCr(n, r);
    display = `${answer}x^${r}`;
    prompt = `Find the ${termNum}${termNum === 2 ? 'nd' : termNum === 3 ? 'rd' : 'th'} term in the expansion of (1 + x)^${n}. Give the coefficient only.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/binomial-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[^\d.\-]/g, ''));
  const correct = !isNaN(ua) && ua === req.body.answer;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * COMPLEX NUMBERS API  /complex-api
 * Add, multiply, modulus, conjugate
 * ═══════════════════════════════════════════════════════════════════════════ */

function fmtComplex(re, im) {
  if (im === 0) return String(re);
  if (re === 0) return im === 1 ? 'i' : im === -1 ? '-i' : im + 'i';
  const imPart = im === 1 ? 'i' : im === -1 ? '-i' : (im > 0 ? '+' + im + 'i' : im + 'i');
  return re + (im > 0 && im !== 1 ? '+' : '') + (im === 1 ? '+i' : im === -1 ? '-i' : (im > 0 ? '' : '') + im + 'i');
}

app.get('/complex-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Add two complex numbers
    const a = randInt(-5, 5), b = randInt(-5, 5);
    const c = randInt(-5, 5), d = randInt(-5, 5);
    const re = a + c, im = b + d;
    answer = re + ',' + im;
    display = fmtComplex(re, im);
    const z1 = fmtComplex(a, b), z2 = fmtComplex(c, d);
    prompt = `If z₁ = ${z1} and z₂ = ${z2}, find z₁ + z₂.\nGive answer as a,b for a + bi.`;
  } else if (diff === 'medium') {
    // Multiply two complex numbers
    const a = randInt(-4, 4), b = randInt(-4, 4);
    const c = randInt(-4, 4), d = randInt(-4, 4);
    const re = a * c - b * d;
    const im = a * d + b * c;
    answer = re + ',' + im;
    display = fmtComplex(re, im);
    const z1 = fmtComplex(a, b), z2 = fmtComplex(c, d);
    prompt = `If z₁ = ${z1} and z₂ = ${z2}, find z₁ × z₂.\nGive answer as a,b for a + bi.`;
  } else if (diff === 'hard') {
    // Find modulus |z| using Pythagorean triples for clean answers
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]];
    const [a, b, c] = triples[randInt(0, triples.length - 1)];
    const signA = Math.random() < 0.5 ? -1 : 1;
    const signB = Math.random() < 0.5 ? -1 : 1;
    answer = c;
    display = String(c);
    prompt = `Find |z| where z = ${fmtComplex(signA * a, signB * b)}.`;
  } else {
    // Find z² given z = a + bi
    const a = randInt(-4, 4), b = randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
    const re = a * a - b * b;
    const im = 2 * a * b;
    answer = re + ',' + im;
    display = fmtComplex(re, im);
    prompt = `If z = ${fmtComplex(a, b)}, find z².\nGive answer as a,b for a + bi.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/complex-api/check', express.json(), (req, res) => {
  const ua = (req.body.userAnswer || '').replace(/\s/g, '').replace(/i/g, '');
  const ans = String(req.body.answer).replace(/\s/g, '');
  // For modulus: direct numeric check
  if (!ans.includes(',')) {
    const correct = parseFloat(ua) === parseFloat(ans);
    return res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
  }
  // For complex: compare a,b pairs
  const userParts = ua.split(',').map(Number);
  const ansParts = ans.split(',').map(Number);
  const correct = userParts.length === 2 && userParts[0] === ansParts[0] && userParts[1] === ansParts[1];
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * ANGLES API  /angles-api
 * Angles on a line, at a point, vertically opposite, parallel lines
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/angles-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Angles on a straight line: a + b = 180
    const a = randInt(25, 155);
    answer = 180 - a;
    display = answer + '°';
    prompt = `Two angles on a straight line are ${a}° and x°. Find x.`;
  } else if (diff === 'medium') {
    // Angles at a point: a + b + c + x = 360
    const a = randInt(40, 120);
    const b = randInt(40, 120);
    const c = randInt(40, 120);
    answer = 360 - a - b - c;
    if (answer < 10) { answer += 60; } // ensure positive and reasonable
    const cAdj = 360 - a - b - answer;
    display = answer + '°';
    prompt = `Four angles meet at a point: ${a}°, ${b}°, ${cAdj}°, and x°. Find x.`;
  } else if (diff === 'hard') {
    // Vertically opposite + angles on a line
    const a = randInt(30, 150);
    const vertOpp = a; // vertically opposite
    const adj = 180 - a; // adjacent on line
    const pick = randInt(0, 1);
    if (pick === 0) {
      prompt = `Two straight lines cross. One angle is ${a}°. Find the vertically opposite angle.`;
      answer = vertOpp;
    } else {
      prompt = `Two straight lines cross. One angle is ${a}°. Find the adjacent angle.`;
      answer = adj;
    }
    display = answer + '°';
  } else {
    // Parallel lines: alternate / corresponding / co-interior
    const angle = randInt(30, 150);
    const type = randInt(0, 2);
    if (type === 0) {
      prompt = `Two parallel lines are cut by a transversal. One alternate angle is ${angle}°. Find the other alternate angle.`;
      answer = angle;
    } else if (type === 1) {
      prompt = `Two parallel lines are cut by a transversal. One corresponding angle is ${angle}°. Find the other corresponding angle.`;
      answer = angle;
    } else {
      prompt = `Two parallel lines are cut by a transversal. One co-interior angle is ${angle}°. Find the other co-interior angle.`;
      answer = 180 - angle;
    }
    display = answer + '°';
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/angles-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[°\s]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * TRIANGLES API  /triangles-api
 * Angle sum, exterior angle theorem, isosceles/equilateral properties
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/triangles-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Angle sum: a + b + x = 180
    const a = randInt(20, 80);
    const b = randInt(20, 140 - a);
    answer = 180 - a - b;
    display = answer + '°';
    prompt = `A triangle has angles ${a}° and ${b}°. Find the third angle.`;
  } else if (diff === 'medium') {
    // Isosceles triangle: two equal angles
    const base = randInt(20, 130);
    const equal = (180 - base) / 2;
    if (equal === Math.floor(equal)) {
      answer = equal;
      display = answer + '°';
      prompt = `An isosceles triangle has a base angle of ${base}°. The two base angles are equal. Find each of the other two angles.`;
      // Actually: give one non-base angle and ask for base
    }
    // Simpler: give apex, find base angles
    const apex = randInt(20, 140);
    if ((180 - apex) % 2 !== 0) {
      answer = (180 - (apex + 1)) / 2;
      const apexUse = apex + 1;
      display = answer + '°';
      prompt = `An isosceles triangle has an apex angle of ${apexUse}°. Find each base angle.`;
    } else {
      answer = (180 - apex) / 2;
      display = answer + '°';
      prompt = `An isosceles triangle has an apex angle of ${apex}°. Find each base angle.`;
    }
  } else if (diff === 'hard') {
    // Exterior angle theorem: exterior = sum of two remote interior
    const a = randInt(25, 75);
    const b = randInt(25, 75);
    answer = a + b;
    display = answer + '°';
    prompt = `Two interior angles of a triangle are ${a}° and ${b}°. Find the exterior angle at the third vertex.`;
  } else {
    // Multi-step: equilateral inside a shape, or angle in isosceles with algebra
    // Equilateral triangle: all angles 60°; attached to another triangle
    const extraAngle = randInt(20, 70);
    // Triangle ABD where ABD shares side with equilateral ABC
    // Angle ABD = extraAngle, angle ABC = 60° (equilateral), so angle DBC = 60 + extraAngle or |60 - extraAngle|
    answer = 180 - 60 - extraAngle;
    display = answer + '°';
    prompt = `In triangle ABD, angle A = 60° (equilateral triangle ABC shares side AB). If angle ABD = ${60 + extraAngle}°, find angle ADB.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/triangles-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[°\s]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * CONGRUENCE API  /congruence-api
 * Congruent triangles: identify condition, find missing side/angle
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/congruence-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Given two congruent triangles, find a missing side
    const sides = [randInt(3, 12), randInt(3, 12), randInt(3, 12)];
    const idx = randInt(0, 2);
    answer = sides[idx];
    display = String(answer) + ' cm';
    const labels1 = ['AB', 'BC', 'CA'];
    const labels2 = ['PQ', 'QR', 'RP'];
    const known = sides.map((s, i) => i === idx ? '?' : s);
    prompt = `△ABC ≅ △PQR. ${labels1.filter((_, i) => i !== idx).map((l, i) => `${l} = ${sides.filter((_, j) => j !== idx)[i]} cm`).join(', ')}, and ${labels2[idx]} = ${sides[idx]} cm. Find ${labels1[idx]}.`;
  } else if (diff === 'medium') {
    // Given congruent triangles, find a missing angle
    const a1 = randInt(30, 80);
    const a2 = randInt(30, 130 - a1);
    const a3 = 180 - a1 - a2;
    const angles = [a1, a2, a3];
    const idx = randInt(0, 2);
    answer = angles[idx];
    display = answer + '°';
    const labels1 = ['A', 'B', 'C'];
    const labels2 = ['P', 'Q', 'R'];
    prompt = `△ABC ≅ △PQR. Angle ${labels2[idx]} = ${angles[idx]}°. Find angle ${labels1[idx]}.`;
  } else if (diff === 'hard') {
    // Identify congruence condition: give info, ask which rule
    const rules = [
      { info: 'Three sides of one triangle equal three sides of another', answer: 'SSS' },
      { info: 'Two sides and the included angle of one triangle equal those of another', answer: 'SAS' },
      { info: 'Two angles and the included side of one triangle equal those of another', answer: 'ASA' },
      { info: 'A right angle, the hypotenuse, and one other side are equal in both triangles', answer: 'RHS' },
    ];
    const pick = rules[randInt(0, rules.length - 1)];
    answer = pick.answer;
    display = answer;
    prompt = `${pick.info}. Which congruence condition is this? (SSS, SAS, ASA, or RHS)`;
  } else {
    // Use congruence to find a side in a real figure
    // Two triangles sharing a side, with given congruence
    const shared = randInt(4, 10);
    const sideA = randInt(3, 9);
    const sideB = randInt(3, 9);
    answer = sideA;
    display = answer + ' cm';
    prompt = `In the figure, △ABD ≅ △CBD (by SAS). AB = ${sideA} cm and BD = ${shared} cm. Find CB.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/congruence-api/check', express.json(), (req, res) => {
  const ua = (req.body.userAnswer || '').trim().replace(/[°\s]/g, '').toUpperCase();
  const ans = String(req.body.answer).replace(/[°\s]/g, '').toUpperCase();
  const correct = ua === ans || parseFloat(ua) === parseFloat(ans);
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * PYTHAGORAS API  /pythag-api
 * Find hypotenuse, shorter side, word problems, 3D diagonal
 * ═══════════════════════════════════════════════════════════════════════════ */

const PYTH_TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[12,16,20],[15,20,25],[9,40,41],[11,60,61],[20,21,29]];

/**
 * Module 44 spec: a Pythagoras session must never open with large numbers.
 * Sessions always begin with very small (single-digit) side lengths and
 * progress gradually to double-digit values. Squaring big numbers up-front
 * creates an unnecessary calculation burden and loses the student early.
 *
 * Tier selection is driven by the optional `?q=` query param (zero-based
 * index of the question within the session). Lower indices select smaller
 * triples; higher indices unlock the full pool. If the client doesn't pass
 * `q`, we default to 0 (smallest tier) — never to "anything goes".
 */
function pythagPoolForIndex(qIdx) {
  // Tier 0 (questions 1-3): single-digit sides only — only the (3,4,5) triple.
  if (qIdx < 3) return { triples: [[3,4,5]], maxK: 1 };
  // Tier 1 (questions 4-6): small double-digit sides, k=1.
  if (qIdx < 6) return { triples: [[3,4,5],[6,8,10],[5,12,13],[9,12,15]], maxK: 1 };
  // Tier 2 (questions 7-9): broader pool, allow k=2.
  if (qIdx < 9) return { triples: [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[7,24,25]], maxK: 2 };
  // Tier 3 (10+): full pool, larger multipliers permitted.
  return { triples: PYTH_TRIPLES.slice(0, 6), maxK: 3 };
}

app.get('/pythag-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  const qIdx = Math.max(0, parseInt(req.query.q, 10) || 0);
  let prompt, answer, display;

  if (diff === 'easy') {
    // Find hypotenuse given two legs — gradual size progression
    const pool = pythagPoolForIndex(qIdx);
    const t = pool.triples[randInt(0, pool.triples.length - 1)];
    const k = randInt(1, pool.maxK);
    const a = t[0] * k, b = t[1] * k, c = t[2] * k;
    answer = c;
    display = answer + ' cm';
    prompt = `A right-angled triangle has legs ${a} cm and ${b} cm. Find the hypotenuse.`;
  } else if (diff === 'medium') {
    // Find a leg given hypotenuse and one leg — also tiered by question index
    const pool = pythagPoolForIndex(qIdx);
    const t = pool.triples[randInt(0, pool.triples.length - 1)];
    const k = randInt(1, pool.maxK);
    const a = t[0] * k, b = t[1] * k, c = t[2] * k;
    const pick = randInt(0, 1);
    if (pick === 0) {
      answer = a;
      display = answer + ' cm';
      prompt = `A right-angled triangle has hypotenuse ${c} cm and one leg ${b} cm. Find the other leg.`;
    } else {
      answer = b;
      display = answer + ' cm';
      prompt = `A right-angled triangle has hypotenuse ${c} cm and one leg ${a} cm. Find the other leg.`;
    }
  } else if (diff === 'hard') {
    // Word problem: ladder against wall
    const t = PYTH_TRIPLES[randInt(0, 5)];
    const k = randInt(1, 2);
    const base = t[0] * k, height = t[1] * k, ladder = t[2] * k;
    const pick = randInt(0, 1);
    if (pick === 0) {
      answer = height;
      display = answer + ' m';
      prompt = `A ${ladder} m ladder leans against a wall. Its base is ${base} m from the wall. How high up the wall does it reach?`;
    } else {
      answer = base;
      display = answer + ' m';
      prompt = `A ${ladder} m ladder reaches ${height} m up a wall. How far is the base of the ladder from the wall?`;
    }
  } else {
    // 3D Pythagoras: space diagonal of cuboid
    // Use triples that nest: e.g. 3,4,5 then diagonal = √(3²+4²+5²) — not always clean
    // Instead: pick a,b,c so a²+b²+c² is a perfect square
    const combos = [[1,2,2,3],[2,3,6,7],[2,6,9,11],[1,4,8,9],[4,4,7,9],[2,4,4,6],[3,6,6,9],[6,6,7,11],[1,2,14,15]];
    // Actually simpler: use nested Pythagoras. floor diagonal d = √(a²+b²), then space = √(d²+c²)
    // Pick a triple for floor: (3,4,5), then space with c: (5,12,13) → a=3,b=4,c=12, space=13
    const nested = [
      { a: 3, b: 4, c: 12, space: 13 },
      { a: 6, b: 8, c: 24, space: 26 },
      { a: 5, b: 12, c: 84, space: 85 },
      { a: 1, b: 2, c: 2, space: 3 },
      { a: 2, b: 4, c: 4, space: 6 },
      { a: 2, b: 3, c: 6, space: 7 },
    ];
    const pick = nested[randInt(0, nested.length - 1)];
    answer = pick.space;
    display = answer + ' cm';
    prompt = `A cuboid has dimensions ${pick.a} cm × ${pick.b} cm × ${pick.c} cm. Find the length of the space diagonal.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/pythag-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[^\d.\-]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * POLYGONS API  /polygons-api
 * Interior/exterior angle sums, regular polygon angles, diagonals
 * ═══════════════════════════════════════════════════════════════════════════ */

const POLYGON_NAMES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };

app.get('/polygons-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Interior angle sum = (n-2)×180
    const n = [4, 5, 6, 7, 8, 10][randInt(0, 5)];
    answer = (n - 2) * 180;
    display = answer + '°';
    prompt = `Find the sum of interior angles of a ${POLYGON_NAMES[n] || n + '-sided polygon'}.`;
  } else if (diff === 'medium') {
    // Each interior angle of a regular polygon
    const n = [3, 4, 5, 6, 8, 9, 10, 12][randInt(0, 7)];
    answer = (n - 2) * 180 / n;
    display = answer + '°';
    prompt = `Find each interior angle of a regular ${POLYGON_NAMES[n] || n + '-sided polygon'}.`;
  } else if (diff === 'hard') {
    // Given each exterior angle, find number of sides
    const n = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 36][randInt(0, 10)];
    const ext = 360 / n;
    answer = n;
    display = String(n) + ' sides';
    prompt = `A regular polygon has each exterior angle equal to ${ext}°. How many sides does it have?`;
  } else {
    // Number of diagonals = n(n-3)/2
    const n = [5, 6, 7, 8, 9, 10, 12][randInt(0, 6)];
    answer = n * (n - 3) / 2;
    display = String(answer);
    prompt = `How many diagonals does a ${POLYGON_NAMES[n] || n + '-sided polygon'} have?`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/polygons-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[°\s]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

/* ═══════════════════════════════════════════════════════════════════════════
 * SIMILARITY API  /similarity-api
 * Similar triangles: scale factor, missing side, area/volume ratios
 * ═══════════════════════════════════════════════════════════════════════════ */

app.get('/similarity-api/question', (req, res) => {
  const diff = req.query.difficulty || 'easy';
  let prompt, answer, display;

  if (diff === 'easy') {
    // Find missing side using scale factor
    const k = randInt(2, 5);
    const a = randInt(3, 10);
    const b = randInt(3, 10);
    answer = a * k;
    display = answer + ' cm';
    prompt = `△ABC is similar to △PQR. AB = ${a} cm, BC = ${b} cm, PQ = ${a * k} cm. Find QR.`;
    // QR = b * k
    answer = b * k;
    display = answer + ' cm';
  } else if (diff === 'medium') {
    // Find scale factor and then a side (non-integer scale factor using fractions)
    const small = randInt(4, 10);
    const big = small * randInt(2, 4);
    const otherSmall = randInt(3, 8);
    // scale factor = big/small
    const ansNum = otherSmall * big;
    const ansDen = small;
    const g = gcd(Math.abs(ansNum), ansDen);
    const rn = ansNum / g;
    const rd = ansDen / g;
    answer = rd === 1 ? rn : rn / rd;
    answer = Math.round(answer * 100) / 100;
    display = answer + ' cm';
    prompt = `Two similar triangles have corresponding sides ${small} cm and ${big} cm. If another side of the smaller triangle is ${otherSmall} cm, find the corresponding side of the larger triangle.`;
  } else if (diff === 'hard') {
    // Area ratio = k²
    const k = randInt(2, 5);
    const areaSmall = randInt(5, 30);
    const areaLarge = areaSmall * k * k;
    answer = areaLarge;
    display = answer + ' cm²';
    prompt = `Two similar figures have a length ratio of 1:${k}. The smaller figure has area ${areaSmall} cm². Find the area of the larger figure.`;
  } else {
    // Volume ratio = k³
    const k = randInt(2, 4);
    const volSmall = randInt(5, 25);
    const volLarge = volSmall * k * k * k;
    answer = volLarge;
    display = answer + ' cm³';
    prompt = `Two similar solids have a length ratio of 1:${k}. The smaller solid has volume ${volSmall} cm³. Find the volume of the larger solid.`;
  }

  res.json({ prompt, answer, display, difficulty: diff });
});

app.post('/similarity-api/check', express.json(), (req, res) => {
  const ua = parseFloat((req.body.userAnswer || '').replace(/[^\d.\-]/g, ''));
  const correct = !isNaN(ua) && Math.abs(ua - req.body.answer) < 0.5;
  res.json({ correct, display: req.body.display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// SQUARING API  /squaring-api
// Identity: n² = (a+b)² = a² + 2ab + b²  where a = nearest lower ten, b = remainder
// ═══════════════════════════════════════════════════════════════════════════
app.get('/squaring-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();
  let lo, hi;
  if (difficulty === 'easy')      { lo = 11;  hi = 29; }
  else if (difficulty === 'medium') { lo = 30;  hi = 59; }
  else if (difficulty === 'hard')   { lo = 60;  hi = 79; }
  else                              { lo = 80;  hi = 99; }

  const n = randomInt(lo, hi);
  // Split: a = largest multiple of 10 ≤ n, b = remainder
  const a = Math.floor(n / 10) * 10;
  const b = n - a;
  const aSq = a * a;
  const bSq = b * b;
  const twoAB = 2 * a * b;
  const answer = n * n;

  const prompt = `Find ${n}² using (${a} + ${b})²`;
  const display = `${n}² = ${a}² + 2·${a}·${b} + ${b}² = ${aSq} + ${twoAB} + ${bSq} = ${answer}`;

  res.json({ id, difficulty, n, a, b, aSq, bSq, twoAB, answer, prompt, display });
});

app.post('/squaring-api/check', express.json(), (req, res) => {
  const { a, b, aSq, bSq, twoAB, answer, display } = req.body;
  const ua = (req.body.userAnswer || '').toString().replace(/\s/g, '');
  // Accept pipe-separated "aSq|bSq|twoAB|final" or just the final answer
  const parts = ua.split('|').map(s => parseInt(s.trim()));

  let correct = false;
  if (parts.length === 4) {
    // Full check: a², b², 2ab, final
    correct = parts[0] === aSq && parts[1] === bSq && parts[2] === twoAB && parts[3] === answer;
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    // Just the final answer
    correct = parts[0] === answer;
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// TATSAVIT API  /tatsavit-api
// 9-type progressive math drill: tables, squares, sqrt, monomials,
// percentages, addition, subtraction, negative arithmetic
// ═══════════════════════════════════════════════════════════════════════════

// difficulty → which types and ranges to use
// easy: types 1-3 simple, medium: types 1-6, hard: types 1-8, extrahard: all 9
// level param (0-8) picks specific type for adaptive mode
function tatsavitQuestion(difficulty, level) {
  const id = Date.now();
  // Pick a type based on difficulty or explicit level
  let type;
  if (level !== undefined && level !== null) {
    type = Math.max(0, Math.min(8, Number(level)));
  } else {
    const pools = {
      easy:      [0, 0, 0, 1, 2, 6, 7],       // mostly single-digit tables, some tables-20, squares, add, sub
      medium:    [0, 1, 1, 2, 3, 4, 6, 7],     // add sqrt, monomial
      hard:      [1, 2, 3, 4, 5, 6, 7, 8],     // add percentage, negative arith
      extrahard: [2, 3, 4, 5, 5, 8, 8, 8],     // heavier on harder types
    };
    const pool = pools[difficulty] || pools.easy;
    type = pool[Math.floor(Math.random() * pool.length)];
  }

  // Scale within-type difficulty based on overall difficulty
  const isHarder = (difficulty === 'hard' || difficulty === 'extrahard');
  const isMed = (difficulty === 'medium');

  switch (type) {
    case 0: { // Single-digit tables (a × b, both 2-9)
      const a = randomInt(2, 9), b = randomInt(2, 9);
      const answer = a * b;
      return { id, type: 0, typeName: 'Tables (1-digit)', prompt: `${a} × ${b}`, answer, display: String(answer) };
    }
    case 1: { // Tables up to 20
      const a = randomInt(2, 20), b = randomInt(2, isHarder ? 20 : 12);
      const answer = a * b;
      return { id, type: 1, typeName: 'Tables (up to 20)', prompt: `${a} × ${b}`, answer, display: String(answer) };
    }
    case 2: { // Squares
      const n = isHarder ? randomInt(11, 30) : isMed ? randomInt(11, 20) : randomInt(2, 15);
      const answer = n * n;
      return { id, type: 2, typeName: 'Squares', prompt: `${n}² = ?`, answer, display: String(answer) };
    }
    case 3: { // Square root (floor or ceiling accepted)
      const maxVal = isHarder ? 500 : isMed ? 200 : 100;
      let q = randomInt(2, maxVal);
      // Avoid perfect squares for more challenge
      const sr = Math.sqrt(q);
      if (sr === Math.floor(sr)) q += 1;
      const floorAns = Math.floor(Math.sqrt(q));
      const ceilAns = Math.ceil(Math.sqrt(q));
      return { id, type: 3, typeName: 'Square Root', prompt: `√${q} = ?`, answer: floorAns, ceilAnswer: ceilAns, display: `${floorAns} or ${ceilAns}` };
    }
    case 4: { // Monomial multiplication
      if (!isHarder && !isMed) {
        // Easy: constant × monomial, e.g. 3 × 4x = 12x
        const c = randomInt(2, 9), coeff = randomInt(2, 9);
        const answer = c * coeff;
        return { id, type: 4, typeName: 'Monomial ×', prompt: `${c} × ${coeff}x = ?`, answerStr: `${answer}x`, answer, answerExp: 1, display: `${answer}x`, inputHint: 'e.g. 15x^2' };
      } else if (isMed) {
        // Medium: monomial × monomial, e.g. 3x × 5x = 15x²
        const a = randomInt(2, 9), b = randomInt(2, 9);
        const answer = a * b;
        return { id, type: 4, typeName: 'Monomial ×', prompt: `${a}x × ${b}x = ?`, answerStr: `${answer}x²`, answer, answerExp: 2, display: `${answer}x²`, inputHint: 'e.g. 15x^2' };
      } else {
        // Hard: e.g. 3x² × 4x³ = 12x⁵
        const a = randomInt(2, 7), b = randomInt(2, 7);
        const p1 = randomInt(1, 3), p2 = randomInt(1, 3);
        const coeff = a * b, exp = p1 + p2;
        const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
        const t1 = p1 === 1 ? `${a}x` : `${a}x${sup(p1)}`;
        const t2 = p2 === 1 ? `${b}x` : `${b}x${sup(p2)}`;
        return { id, type: 4, typeName: 'Monomial ×', prompt: `${t1} × ${t2} = ?`, answerStr: `${coeff}x${sup(exp)}`, answer: coeff, answerExp: exp, display: `${coeff}x${sup(exp)}`, inputHint: 'e.g. 15x^2' };
      }
    }
    case 5: { // Percentage problems
      if (!isHarder && !isMed) {
        // Easy: X% of Y (nice numbers)
        const pct = triPick([10, 20, 25, 50, 75]);
        const whole = randomInt(2, 20) * (pct === 25 ? 4 : pct === 75 ? 4 : pct === 50 ? 2 : 10);
        const answer = (pct / 100) * whole;
        return { id, type: 5, typeName: 'Percentage', prompt: `${pct}% of ${whole} = ?`, answer, display: String(answer) };
      } else if (isMed) {
        // Medium: any percentage, still whole-number answer
        const pct = randomInt(1, 9) * 10;
        const whole = randomInt(10, 200);
        const answer = Math.round((pct / 100) * whole * 100) / 100;
        return { id, type: 5, typeName: 'Percentage', prompt: `${pct}% of ${whole} = ?`, answer, display: String(answer) };
      } else {
        // Hard: find original or percentage
        const variant = Math.random();
        if (variant < 0.5) {
          // "What is X% of Y?"
          const pct = randomInt(5, 95);
          const whole = randomInt(50, 500);
          const answer = Math.round((pct / 100) * whole * 100) / 100;
          return { id, type: 5, typeName: 'Percentage', prompt: `${pct}% of ${whole} = ?`, answer, display: String(answer) };
        } else {
          // "Y is X% of what number?"
          const pct = triPick([10, 20, 25, 50]);
          const original = randomInt(20, 200);
          const part = (pct / 100) * original;
          return { id, type: 5, typeName: 'Percentage', prompt: `${part} is ${pct}% of what number?`, answer: original, display: String(original) };
        }
      }
    }
    case 6: { // Addition — cap at 3 digits (100-999); no need for huge numbers
      const digits = isHarder ? 3 : isMed ? 2 : 1;
      const lo = digits === 1 ? 1 : Math.pow(10, digits - 1);
      const hi = Math.pow(10, digits) - 1;
      const a = randomInt(lo, hi), b = randomInt(lo, hi);
      const answer = a + b;
      return { id, type: 6, typeName: 'Addition', prompt: `${a} + ${b} = ?`, answer, display: String(answer) };
    }
    case 7: { // Subtraction — cap at 3 digits (100-999); mastery sufficient at this level
      const digits = isHarder ? 3 : isMed ? 2 : 1;
      const lo = digits === 1 ? 1 : Math.pow(10, digits - 1);
      const hi = Math.pow(10, digits) - 1;
      let a = randomInt(lo, hi), b = randomInt(lo, hi);
      if (a < b) [a, b] = [b, a]; // ensure non-negative result
      const answer = a - b;
      return { id, type: 7, typeName: 'Subtraction', prompt: `${a} − ${b} = ?`, answer, display: String(answer) };
    }
    case 8: { // Negative arithmetic: a − (−b), −a + (−b), −a − (−b), etc.
      const patterns = isHarder
        ? ['sub_neg', 'neg_add_neg', 'neg_sub_neg', 'neg_sub_pos', 'neg_add_pos']
        : isMed ? ['sub_neg', 'neg_add_neg', 'neg_sub_neg']
        : ['sub_neg'];
      const pat = triPick(patterns);
      const a = randomInt(2, isHarder ? 30 : 12);
      const b = randomInt(2, isHarder ? 30 : 12);
      let prompt, answer;
      switch (pat) {
        case 'sub_neg':      prompt = `${a} − (−${b})`;   answer = a + b;  break;
        case 'neg_add_neg':  prompt = `−${a} + (−${b})`;  answer = -(a + b); break;
        case 'neg_sub_neg':  prompt = `−${a} − (−${b})`;  answer = -a + b; break;
        case 'neg_sub_pos':  prompt = `−${a} − ${b}`;     answer = -(a + b); break;
        case 'neg_add_pos':  prompt = `−${a} + ${b}`;     answer = b - a;  break;
        default:             prompt = `${a} − (−${b})`;   answer = a + b;
      }
      return { id, type: 8, typeName: 'Negative Arithmetic', prompt: `${prompt} = ?`, answer, display: String(answer) };
    }
    default:
      return tatsavitQuestion(difficulty, 0); // fallback
  }
}

app.get('/tatsavit-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const level = req.query.level !== undefined ? Number(req.query.level) : null;
  const q = tatsavitQuestion(difficulty, level);
  q.difficulty = difficulty;
  res.json(q);
});

app.post('/tatsavit-api/check', express.json(), (req, res) => {
  const { type, answer, ceilAnswer, display, answerExp } = req.body;
  const userStr = (req.body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
  const userNum = parseFloat(userStr);
  let correct = false;

  if (type === 3) {
    // Square root: accept floor OR ceiling
    correct = !isNaN(userNum) && (userNum === answer || userNum === ceilAnswer);
  } else if (type === 4) {
    // Monomial multiplication: accept coefficient only (e.g. "15") OR full expression (e.g. "15x^2", "6x")
    const exprMatch = userStr.match(/^(-?\d+(?:\.\d+)?)x(?:\^(\d+))?$/);
    if (exprMatch) {
      const userCoeff = parseFloat(exprMatch[1]);
      const userExpVal = exprMatch[2] ? parseInt(exprMatch[2]) : 1;
      const expectedExp = answerExp || (display && display.includes('x²') ? 2 : display && display.includes('x') ? 1 : 0);
      correct = Math.abs(userCoeff - answer) < 0.05 && userExpVal === expectedExp;
    } else {
      // Bare coefficient still accepted
      correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.05;
    }
  } else {
    // All other types: numeric comparison with small tolerance for percentages
    correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.05;
  }

  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. LINEAR EQUATIONS (lineareq-api)
// ═══════════════════════════════════════════════════════════════════════════
function linearEqQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // ax + b = c
    const a = randomInt(2, 9);
    const b = randomInt(1, 20);
    const c = randomInt(1, 100);
    const answer = (c - b) / a;
    const prompt = `Solve for x: ${a}x + ${b} = ${c}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(2)) };
  } else if (difficulty === 'medium') {
    // ax + b = cx + d
    const a = randomInt(2, 8);
    const b = randomInt(1, 20);
    const c = randomInt(2, 8);
    if (a === c) return linearEqQuestion(difficulty);
    const d = randomInt(1, 20);
    const answer = (d - b) / (a - c);
    const prompt = `Solve for x: ${a}x + ${b} = ${c}x + ${d}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(2)) };
  } else if (difficulty === 'hard') {
    // a(bx + c) = d
    const a = randomInt(2, 5);
    const b = randomInt(2, 6);
    const c = randomInt(1, 10);
    const d = randomInt(10, 100);
    const answer = (d / a - c) / b;
    const prompt = `Solve for x: ${a}(${b}x + ${c}) = ${d}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(3)) };
  } else {
    // (ax+b)/c = d
    const a = randomInt(2, 6);
    const b = randomInt(1, 10);
    const c = randomInt(2, 5);
    const d = randomInt(2, 10);
    const answer = (d * c - b) / a;
    const prompt = `Solve for x: (${a}x + ${b})/${c} = ${d}`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(3)) };
  }
}

app.get('/lineareq-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = linearEqQuestion(difficulty);
  res.json(q);
});

app.post('/lineareq-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.1;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. DECIMALS (decimals-api)
// ═══════════════════════════════════════════════════════════════════════════
function decimalsQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // add two decimals (1 dp)
    const a = (randomInt(1, 10) * 10 + randomInt(0, 9)) / 10;
    const b = (randomInt(1, 10) * 10 + randomInt(0, 9)) / 10;
    const answer = Math.round((a + b) * 100) / 100;
    const prompt = `${a.toFixed(1)} + ${b.toFixed(1)} = ?`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(1) };
  } else if (difficulty === 'medium') {
    // subtract decimals (2 dp)
    let a = (randomInt(10, 100) + randomInt(0, 99) / 100);
    let b = (randomInt(10, 100) + randomInt(0, 99) / 100);
    if (a < b) [a, b] = [b, a];
    const answer = Math.round((a - b) * 100) / 100;
    const prompt = `${a.toFixed(2)} − ${b.toFixed(2)} = ?`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  } else if (difficulty === 'hard') {
    // multiply decimal by integer
    const dec = (randomInt(10, 50) + randomInt(0, 99) / 100);
    const int = randomInt(2, 15);
    const answer = Math.round(dec * int * 100) / 100;
    const prompt = `${dec.toFixed(2)} × ${int} = ?`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  } else {
    // divide decimal by decimal
    const a = (randomInt(20, 100) + randomInt(0, 99) / 100);
    const b = (randomInt(2, 20) + randomInt(0, 99) / 100);
    const answer = Math.round((a / b) * 100) / 100;
    const prompt = `${a.toFixed(2)} ÷ ${b.toFixed(2)} = ?`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  }
}

app.get('/decimals-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = decimalsQuestion(difficulty);
  res.json(q);
});

app.post('/decimals-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.01;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. PERMUTATIONS & COMBINATIONS (permcomb-api)
// ═══════════════════════════════════════════════════════════════════════════
function factorial(n) {
  if (n < 0) return undefined;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/* ─── Module 38 — Permutations & Combinations ─────────────────────────────
 * Two clearly separated sub-sections: Permutation (nPr) first, Combination
 * (nCr) second, plus a mixed P-vs-C decision mode that only unlocks once
 * both sub-sections have reached Level 2 (gating is enforced by the client;
 * the server simply produces whatever question shape is asked for).
 *
 * Three levels each, with progressive scaffolding:
 *   Level 1: Formula fill-in-the-blank (no full calculation, n ≤ 6).
 *   Level 2: Full numeric calculation, timed.
 *   Level 3: Word problems requiring the student to identify P vs C.
 *
 * Query params:
 *   section — 'P' | 'C' | 'mixed'  (default 'P')
 *   level   — 1 | 2 | 3           (default 1)
 *   seen    — comma-separated list of question ids the client has already shown
 */

function pcPickPair(level, section) {
  // n/r bounds tighten in Level 1 ("small values: n from 2-6, r ≤ n").
  // Level 2 starts small and expands; Level 3 word problems also stay modest.
  const nMax = level === 1 ? 6 : (level === 2 ? 8 : 9);
  const nMin = level === 1 ? 3 : 4;
  const n = randomInt(nMin, nMax);
  const r = section === 'C'
    ? randomInt(2, Math.min(n - 1, 4))
    : randomInt(2, Math.min(n - 1, 4));
  return { n, r };
}

/** Build the worked-example payload for a given (n, r, op). */
function pcWorkedExample(n, r, op) {
  if (op === 'P') {
    return {
      heading: `Worked example: ${n}P${r} = n! / (n − r)!`,
      lines: [
        `${n}P${r} = ${n}! / (${n} − ${r})!`,
        `       = ${n}! / ${n - r}!`,
        `       = ${factorial(n)} / ${factorial(n - r)}`,
        `       = ${factorial(n) / factorial(n - r)}`,
      ],
    };
  }
  return {
    heading: `Worked example: ${n}C${r} = n! / (r! × (n − r)!)`,
    lines: [
      `${n}C${r} = ${n}! / (${r}! × (${n} − ${r})!)`,
      `       = ${factorial(n)} / (${factorial(r)} × ${factorial(n - r)})`,
      `       = ${factorial(n)} / ${factorial(r) * factorial(n - r)}`,
      `       = ${factorial(n) / (factorial(r) * factorial(n - r))}`,
    ],
  };
}

const PERMCOMB_WORD_BANK_P = [
  (n, r) => ({ prompt: `In how many ways can ${r} books be arranged on a shelf chosen from ${n} different books?`, op: 'P' }),
  (n, r) => ({ prompt: `Gold, silver, and bronze medals are awarded among ${n} runners. How many ways can the medals be assigned (assume r = 3)?`, op: 'P', forceR: 3 }),
  (n, r) => ({ prompt: `How many ${r}-letter sequences (no repeated letters) can be made from ${n} distinct letters?`, op: 'P' }),
  (n, r) => ({ prompt: `${n} people line up for a photo and ${r} of them stand at the front. In how many orders can those ${r} positions be filled?`, op: 'P' }),
];
const PERMCOMB_WORD_BANK_C = [
  (n, r) => ({ prompt: `From a class of ${n} students, a committee of ${r} is to be selected. In how many ways can this be done?`, op: 'C' }),
  (n, r) => ({ prompt: `A pizza shop offers ${n} toppings. How many different ${r}-topping pizzas can be ordered (each topping used at most once)?`, op: 'C' }),
  (n, r) => ({ prompt: `How many handshakes occur if ${n} people each shake hands with ${r} of the others (pairs, order doesn't matter)?`, op: 'C', forceR: 2 }),
  (n, r) => ({ prompt: `From ${n} cards, you draw ${r} at random. How many distinct hands are possible?`, op: 'C' }),
];

function generatePermCombQuestion(section, level, seen) {
  // Decide actual section per call. For 'mixed' (Level 3 cross-section) flip a coin per question.
  const op = section === 'mixed' ? (Math.random() < 0.5 ? 'P' : 'C') : section;
  let { n, r } = pcPickPair(level, op);

  // Try a few times to dodge repeats.
  for (let attempt = 0; attempt < 25; attempt++) {
    const id = `pc-${op}-L${level}-${n}-${r}`;
    if (!seen.includes(id)) {
      return buildPermCombQuestion(op, level, n, r, id, section === 'mixed');
    }
    ({ n, r } = pcPickPair(level, op));
  }
  // Fallback: just return whatever we last rolled.
  const id = `pc-${op}-L${level}-${n}-${r}-${Math.floor(Math.random() * 1e6)}`;
  return buildPermCombQuestion(op, level, n, r, id, section === 'mixed');
}

function buildPermCombQuestion(op, level, n, r, id, isMixed) {
  if (op === 'P') {
    const answer = factorial(n) / factorial(n - r);
    if (level === 1) {
      // Fill-in: present the formula skeleton with two blanks (factorial arguments).
      return {
        id, op, level, n, r, answer,
        kind: 'formula_fill',
        prompt: `${n}P${r} = ${n}! / (${n} − ${r})!`,
        formula: { op: 'P', n, r, blanks: ['n', 'n-r'] },
        expected: { 'n': n, 'n-r': n - r },
        worked: pcWorkedExample(n, r, 'P'),
      };
    }
    if (level === 2) {
      return {
        id, op, level, n, r, answer,
        kind: 'full_calc',
        prompt: `Calculate ${n}P${r}.`,
        worked: pcWorkedExample(n, r, 'P'),
      };
    }
    // Level 3 — word problem
    const tmpl = PERMCOMB_WORD_BANK_P[Math.floor(Math.random() * PERMCOMB_WORD_BANK_P.length)];
    const built = tmpl(n, r);
    const useR = built.forceR != null ? built.forceR : r;
    const ans = factorial(n) / factorial(n - useR);
    return {
      id, op, level, n, r: useR, answer: ans,
      kind: isMixed ? 'word_pc_mixed' : 'word',
      prompt: built.prompt,
      worked: pcWorkedExample(n, useR, 'P'),
    };
  }
  // op === 'C'
  const answerC = factorial(n) / (factorial(r) * factorial(n - r));
  if (level === 1) {
    return {
      id, op, level, n, r, answer: answerC,
      kind: 'formula_fill',
      prompt: `${n}C${r} = ${n}! / (${r}! × (${n} − ${r})!)`,
      formula: { op: 'C', n, r, blanks: ['n', 'r', 'n-r'] },
      expected: { 'n': n, 'r': r, 'n-r': n - r },
      worked: pcWorkedExample(n, r, 'C'),
    };
  }
  if (level === 2) {
    return {
      id, op, level, n, r, answer: answerC,
      kind: 'full_calc',
      prompt: `Calculate ${n}C${r}.`,
      worked: pcWorkedExample(n, r, 'C'),
    };
  }
  const tmpl = PERMCOMB_WORD_BANK_C[Math.floor(Math.random() * PERMCOMB_WORD_BANK_C.length)];
  const built = tmpl(n, r);
  const useR = built.forceR != null ? built.forceR : r;
  const ansC = factorial(n) / (factorial(useR) * factorial(n - useR));
  return {
    id, op, level, n, r: useR, answer: ansC,
    kind: isMixed ? 'word_pc_mixed' : 'word',
    prompt: built.prompt,
    worked: pcWorkedExample(n, useR, 'C'),
  };
}

app.get('/permcomb-api/question', (req, res) => {
  let section = (req.query.section || '').toUpperCase();
  if (section !== 'P' && section !== 'C' && section !== 'MIXED') {
    // Legacy fallback: difficulty=easy → P/L2; medium → C/L2; hard → word; extrahard → mixed
    const legacy = req.query.difficulty;
    if (legacy === 'medium') section = 'C';
    else if (legacy === 'extrahard') section = 'MIXED';
    else section = 'P';
  }
  const sectionKey = section === 'MIXED' ? 'mixed' : section;
  const level = Math.max(1, Math.min(3, parseInt(req.query.level, 10)
    || (req.query.difficulty === 'hard' ? 3 : 2)));
  const seen = String(req.query.seen || '').split(',').filter(Boolean);
  const q = generatePermCombQuestion(sectionKey, level, seen);
  // Always include `display` for client uniformity.
  q.display = String(q.answer);
  res.json(q);
});

app.post('/permcomb-api/check', express.json(), (req, res) => {
  const { answer, display, level, kind, expected } = req.body;
  // Level-1 formula-fill: client may post a `blanks` map of student inputs.
  if (kind === 'formula_fill' && expected && req.body.blanks) {
    const blanks = req.body.blanks || {};
    let allCorrect = true;
    for (const key of Object.keys(expected)) {
      if (parseInt(blanks[key], 10) !== expected[key]) { allCorrect = false; break; }
    }
    return res.json({ correct: allCorrect, display, message: allCorrect ? 'Correct!' : 'Check the blanks.' });
  }
  // Default numeric path (Levels 2 & 3, including word problems).
  const userStr = String(req.body.userAnswer || '').replace(/[\s,]/g, '');
  const userNum = parseInt(userStr, 10);
  const correct = !isNaN(userNum) && userNum === answer;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. LIMITS (limits-api)
// ═══════════════════════════════════════════════════════════════════════════
function limitsQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // lim x→a of (bx+c) — direct substitution
    const a = randomInt(1, 5);
    const b = randomInt(2, 6);
    const c = randomInt(1, 10);
    const answer = b * a + c;
    const prompt = `Find lim(x→${a}) [${b}x + ${c}]`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else if (difficulty === 'medium') {
    // lim x→a of (x²-a²)/(x-a) = 2a (factorable)
    const a = randomInt(2, 6);
    const answer = 2 * a;
    const prompt = `Find lim(x→${a}) [(x² − ${a * a})/(x − ${a})]`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else if (difficulty === 'hard') {
    // lim x→0 of sin(ax)/bx = a/b
    const a = randomInt(1, 4);
    const b = randomInt(1, 4);
    const answer = a / b;
    const prompt = `Find lim(x→0) [sin(${a}x)/${b}x]`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(3) };
  } else {
    // lim x→∞ of (ax²+bx+c)/(dx²+ex+f) = a/d
    const a = randomInt(1, 5);
    const d = randomInt(1, 5);
    const b = randomInt(1, 10);
    const e = randomInt(1, 10);
    const c = randomInt(1, 10);
    const f = randomInt(1, 10);
    const answer = a / d;
    const prompt = `Find lim(x→∞) [(${a}x² + ${b}x + ${c})/(${d}x² + ${e}x + ${f})]`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(3) };
  }
}

app.get('/limits-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = limitsQuestion(difficulty);
  res.json(q);
});

app.post('/limits-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.05;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. INVERSE TRIGONOMETRIC (invtrig-api)
// ═══════════════════════════════════════════════════════════════════════════
function invtrigQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // standard values in degrees
    const values = [
      { val: 0, func: 'arcsin', ans: 0 },
      { val: '1/2', func: 'arcsin', ans: 30 },
      { val: 1, func: 'arcsin', ans: 90 },
      { val: 1, func: 'arccos', ans: 0 },
      { val: '1/2', func: 'arccos', ans: 60 },
      { val: 0, func: 'arccos', ans: 90 },
      { val: 0, func: 'arctan', ans: 0 },
      { val: 1, func: 'arctan', ans: 45 }
    ];
    const chosen = triPick(values);
    const prompt = `Find ${chosen.func}(${chosen.val}) in degrees`;
    return { id, difficulty, prompt, answer: chosen.ans, display: String(chosen.ans) };
  } else if (difficulty === 'medium') {
    // arcsin(√3/2), arccos(√2/2), etc.
    const values = [
      { val: '√3/2', func: 'arcsin', ans: 60 },
      { val: '√2/2', func: 'arcsin', ans: 45 },
      { val: '√2/2', func: 'arccos', ans: 45 },
      { val: '√3/2', func: 'arccos', ans: 30 }
    ];
    const chosen = triPick(values);
    const prompt = `Find ${chosen.func}(${chosen.val}) in degrees`;
    return { id, difficulty, prompt, answer: chosen.ans, display: String(chosen.ans) };
  } else if (difficulty === 'hard') {
    // sin(arccos(x)) type compositions
    const x = (randomInt(3, 9)) / 10;
    const answer = Math.sqrt(1 - x * x);
    const prompt = `Find sin(arccos(${x.toFixed(1)}))`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(3) };
  } else {
    // principal value
    const x = (randomInt(1, 9)) / 10;
    const answer = Math.atan(x) * 180 / Math.PI;
    const prompt = `Find principal value of arctan(${x.toFixed(1)}) in degrees`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  }
}

app.get('/invtrig-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = invtrigQuestion(difficulty);
  res.json(q);
});

app.post('/invtrig-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.5;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. REMAINDER & FACTOR THEOREM (remfactor-api)
// ═══════════════════════════════════════════════════════════════════════════
function remfactorQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // f(x) = ax² + bx + c, find remainder when divided by (x-a)
    const a = randomInt(2, 5);
    const b = randomInt(1, 10);
    const c = randomInt(1, 20);
    const xVal = randomInt(1, 5);
    const answer = a * xVal * xVal + b * xVal + c;
    const prompt = `Find remainder when f(x) = ${a}x² + ${b}x + ${c} is divided by (x − ${xVal})`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else if (difficulty === 'medium') {
    // factor theorem: is (x-a) a factor?
    const a = randomInt(2, 5);
    const answer_val = randomInt(1, 6);
    const b = randomInt(1, 8);
    const remainder = randomInt(1, 10);
    const isFactor = Math.random() < 0.5;
    const result = isFactor ? 0 : remainder;
    const prompt = `Is (x − ${answer_val}) a factor of f(x) = ${a}x² + ${b}x + ${result}? Answer yes or no`;
    const answerStr = isFactor ? 'yes' : 'no';
    return { id, difficulty, prompt, answer: answerStr, display: answerStr };
  } else if (difficulty === 'hard') {
    // degree 3 polynomial remainder
    const a = randomInt(1, 4);
    const b = randomInt(1, 6);
    const c = randomInt(1, 10);
    const d = randomInt(1, 15);
    const xVal = randomInt(1, 4);
    const answer = a * xVal * xVal * xVal + b * xVal * xVal + c * xVal + d;
    const prompt = `Find remainder when f(x) = ${a}x³ + ${b}x² + ${c}x + ${d} is divided by (x − ${xVal})`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else {
    // find k such that (x-a) is factor of x³+kx+b
    const a = randomInt(2, 5);
    const b = randomInt(1, 20);
    const k = randomInt(1, 20);
    const xVal = randomInt(1, 4);
    const answer = -(xVal * xVal * xVal + b) / xVal;
    const prompt = `Find k such that (x − ${xVal}) is a factor of x³ + kx + ${b}`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  }
}

app.get('/remfactor-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = remfactorQuestion(difficulty);
  res.json(q);
});

app.post('/remfactor-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  let userStr = (req.body.userAnswer || '').trim().toLowerCase();
  const correct = (typeof answer === 'string')
    ? userStr === answer.toLowerCase()
    : !isNaN(parseFloat(userStr)) && Math.abs(parseFloat(userStr) - answer) < 0.1;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. HERON'S FORMULA (heron-api)
// ═══════════════════════════════════════════════════════════════════════════
function heronQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // semi-perimeter
    const a = randomInt(3, 10);
    const b = randomInt(3, 10);
    const c = randomInt(3, 10);
    if (a + b <= c) return heronQuestion(difficulty);
    const answer = (a + b + c) / 2;
    const prompt = `Find semi-perimeter of triangle with sides ${a}, ${b}, ${c}`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(1) };
  } else if (difficulty === 'medium') {
    // Pythagorean triple: area is integer
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
    const [a, b, c] = triPick(triples);
    const s = (a + b + c) / 2;
    const answer = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const prompt = `Find area using Heron's formula: sides ${a}, ${b}, ${c}`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  } else if (difficulty === 'hard') {
    // non-integer answer, round to 1 dp
    const a = randomInt(5, 12);
    const b = randomInt(5, 12);
    const c = randomInt(5, 12);
    if (a + b <= c) return heronQuestion(difficulty);
    const s = (a + b + c) / 2;
    const answer = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const prompt = `Find area using Heron's formula: sides ${a}, ${b}, ${c}`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(1) };
  } else {
    // given area and two sides, find third
    const a = randomInt(4, 10);
    const b = randomInt(4, 10);
    const area = randomInt(10, 40);
    const s_val = (area * 2) / (a + b);
    const c = 2 * s_val - a - b;
    const answer = Math.abs(c);
    const prompt = `Triangle has sides ${a} and ${b}, area = ${area}. Find the third side`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  }
}

app.get('/heron-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = heronQuestion(difficulty);
  res.json(q);
});

app.post('/heron-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.5;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. SHARES & DIVIDENDS (shares-api)
// ═══════════════════════════════════════════════════════════════════════════
function sharesQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // dividend = shares × dividend_per_share
    const shares = randomInt(10, 100);
    const divPerShare = randomInt(2, 10);
    const answer = shares * divPerShare;
    const prompt = `Calculate dividend: ${shares} shares, dividend per share = Rs ${divPerShare}`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else if (difficulty === 'medium') {
    // income = shares × (faceValue/100) × dividend%
    const shares = randomInt(50, 200);
    const faceValue = 100;
    const divPercent = randomInt(5, 20);
    const answer = shares * (faceValue / 100) * (divPercent / 100) * 100;
    const prompt = `Income from ${shares} shares, face value Rs 100, dividend ${divPercent}%`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  } else if (difficulty === 'hard') {
    // return% = (dividend / market_value) × 100
    const marketValue = randomInt(100, 200);
    const faceValue = 100;
    const divPercent = randomInt(5, 15);
    const dividend = (faceValue * divPercent) / 100;
    const returnPct = (dividend / marketValue) * 100;
    const answer = returnPct;
    const prompt = `Find return% given market value Rs ${marketValue}, face value Rs ${faceValue}, dividend ${divPercent}%`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  } else {
    // find shares to buy for target income
    const faceValue = 100;
    const divPercent = randomInt(6, 12);
    const targetIncome = randomInt(500, 2000);
    const dividend = (faceValue * divPercent) / 100;
    const answer = targetIncome / dividend;
    const prompt = `How many shares (face value Rs 100, dividend ${divPercent}%) needed for income of Rs ${targetIncome}?`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  }
}

app.get('/shares-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = sharesQuestion(difficulty);
  res.json(q);
});

app.post('/shares-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 1;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. BANKING / RECURRING DEPOSITS (banking-api)
// ═══════════════════════════════════════════════════════════════════════════
function bankingQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // SI = (P × R × T) / 100
    const P = randomInt(1000, 10000);
    const R = randomInt(2, 10);
    const T = randomInt(1, 5);
    const answer = (P * R * T) / 100;
    const prompt = `Simple Interest: Principal Rs ${P}, Rate ${R}%, Time ${T} years`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(0)) };
  } else if (difficulty === 'medium') {
    // CI = P(1 + r/100)^n - P
    const P = randomInt(5000, 20000);
    const R = randomInt(4, 12);
    const T = randomInt(1, 4);
    const amount = P * Math.pow(1 + R / 100, T);
    const answer = amount - P;
    const prompt = `Compound Interest: Principal Rs ${P}, Rate ${R}%, Time ${T} years`;
    return { id, difficulty, prompt, answer, display: String(answer.toFixed(0)) };
  } else if (difficulty === 'hard') {
    // RD maturity: MV = P*n + P*n(n+1)/(2*12) * (r/100)
    const P = randomInt(500, 2000);
    const r = randomInt(6, 10);
    const n = randomInt(12, 36);
    const MV = P * n + (P * n * (n + 1) / (2 * 12)) * (r / 100);
    const answer = MV;
    const prompt = `RD maturity: Monthly Rs ${P}, Rate ${r}%, Months ${n}`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  } else {
    // find P given maturity value
    const MV = randomInt(10000, 50000);
    const r = randomInt(6, 10);
    const n = randomInt(12, 36);
    const P = MV / (n + (n * (n + 1) / (2 * 12)) * (r / 100));
    const answer = P;
    const prompt = `RD: Find monthly installment for maturity Rs ${MV}, Rate ${r}%, Months ${n}`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  }
}

app.get('/banking-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = bankingQuestion(difficulty);
  res.json(q);
});

app.post('/banking-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 10;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// GYM PUZZLES — shared multiple-choice helpers
// ───────────────────────────────────────────────────────────────────────────
// A handful of new puzzles (Gym Decimals, Functions Gym, DotProducts Gym,
// Fractions-add-gym, LinearEquations-Gym) share a multiple-choice format with
// distractors that are deliberately close to the correct answer. These
// helpers package up the common logic.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * shuffleArray(arr): Fisher-Yates in-place shuffle (returns a new array).
 */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * buildOptions(correctText, distractors): Produce a 4-option MC payload.
 *   - Deduplicates distractors against the correct answer.
 *   - Pads with stand-in strings if the caller didn't supply enough distinct
 *     distractors (extremely unlikely once dedup is done correctly).
 *   - Randomly assigns A/B/C/D to the four options.
 *
 * Returns: { options: [{option, text}, ...], correctOption: 'A'|'B'|'C'|'D' }
 */
function buildOptions(correctText, distractors) {
  const seen = new Set([String(correctText)]);
  const cleaned = [];
  for (const d of distractors) {
    const s = String(d);
    if (!seen.has(s)) { seen.add(s); cleaned.push(s); }
    if (cleaned.length >= 3) break;
  }
  // Pad with safe placeholders if fewer than 3 distinct distractors.
  let pad = 1;
  while (cleaned.length < 3) {
    const filler = `${correctText}_${pad++}`;
    if (!seen.has(filler)) { seen.add(filler); cleaned.push(filler); }
  }
  const all = shuffleArray([{ text: String(correctText), correct: true }, ...cleaned.slice(0, 3).map(t => ({ text: t, correct: false }))]);
  const labels = ['A', 'B', 'C', 'D'];
  const options = all.map((o, i) => ({ option: labels[i], text: o.text }));
  const correctOption = labels[all.findIndex(o => o.correct)];
  return { options, correctOption, correctDisplay: String(correctText) };
}

/**
 * mcCheck(req, res): Generic MCQ check — compares selectedOption against the
 * correctOption stored in the question payload (echoed back by the client).
 */
function mcCheck(req, res) {
  const b = req.body || {};
  const correct = !!b.selectedOption && b.selectedOption === b.correctOption;
  res.json({
    correct,
    correctOption: b.correctOption,
    correctDisplay: b.correctDisplay,
    message: correct ? 'Correct!' : 'Incorrect',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GYM DECIMALS (gymdecimals-api)
// ───────────────────────────────────────────────────────────────────────────
// Place-value drill: each operand is a single non-zero digit (1-9) shifted
// by some integer power of 10 (e.g., 0.8, 90, 0.002, 0.7, 10, 0.4, 0.008).
// Operands may be positive or negative. The student practises decimal
// multiplication, counting decimal places, and applying the sign rule.
// All four difficulty bands use 1-digit mantissas; the difficulty determines
// how far the decimal point can be shifted.
// Multiple choice with distractors that perturb only the decimal place or
// only the sign — both common student errors.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * formatScaledDigit(mantissa, exp): Render mantissa × 10^exp as a decimal
 * string (no scientific notation), with trailing zeros stripped from the
 * fractional part.
 */
function formatScaledDigit(mantissa, exp) {
  const sign = mantissa < 0 ? '-' : '';
  const m = Math.abs(mantissa);
  const ms = String(m);
  let result;
  if (exp >= 0) {
    result = ms + '0'.repeat(exp);
  } else {
    const decShift = -exp;
    if (decShift < ms.length) {
      const intPart = ms.slice(0, ms.length - decShift);
      const fracPart = ms.slice(ms.length - decShift);
      result = intPart + '.' + fracPart;
    } else {
      const zeros = decShift - ms.length;
      result = '0.' + '0'.repeat(zeros) + ms;
    }
  }
  if (result.includes('.')) {
    result = result.replace(/0+$/, '').replace(/\.$/, '');
  }
  // Don't render "-0".
  if (result === '0') return '0';
  return sign + result;
}

/**
 * gymDecimalsQuestion(difficulty): Build a signed decimal multiplication MCQ.
 * Each operand is ±d × 10^e where d ∈ 1..9 and e ∈ [-range, +range].
 * Distractors: same magnitude, off by ±1 place; correct magnitude with
 * flipped sign; one with both an off-by-one place and flipped sign.
 */
function gymDecimalsQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const range = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4;
  const d1 = randomInt(1, 9);
  const d2 = randomInt(1, 9);
  const s1 = Math.random() < 0.5 ? -1 : 1;
  const s2 = Math.random() < 0.5 ? -1 : 1;
  const e1 = randomInt(-range, range);
  const e2 = randomInt(-range, range);

  const aStr = formatScaledDigit(s1 * d1, e1);
  const bStr = formatScaledDigit(s2 * d2, e2);

  const prodMantissa = d1 * d2;          // 1..81 (always positive — sign is separate)
  const prodSign = s1 * s2;              // ±1
  const prodExp = e1 + e2;
  const correctText = formatScaledDigit(prodSign * prodMantissa, prodExp);

  // Numeric answer for downstream uses.
  const answer = prodSign * prodMantissa * Math.pow(10, prodExp);

  // Build distractors that are deliberately close — only the decimal place or
  // only the sign is wrong — so the student must think rather than skim.
  const distractors = [
    formatScaledDigit(prodSign * prodMantissa, prodExp + 1),
    formatScaledDigit(prodSign * prodMantissa, prodExp - 1),
    formatScaledDigit(-prodSign * prodMantissa, prodExp),
    formatScaledDigit(-prodSign * prodMantissa, prodExp + 1),
  ];
  const opts = buildOptions(correctText, distractors);

  // Negative operands are wrapped in parentheses for clarity.
  const fmtOperand = (s) => s.startsWith('-') ? `(${s})` : s;
  const prompt = `${fmtOperand(aStr)} × ${fmtOperand(bStr)} = ?`;
  return {
    id, difficulty, prompt, answer,
    a: aStr, b: bStr,
    d1, d2, s1, s2, e1, e2, prodMantissa, prodSign, prodExp,
    ...opts,
  };
}

app.get('/gymdecimals-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = gymDecimalsQuestion(difficulty);
  res.json(q);
});

app.post('/gymdecimals-api/check', express.json(), (req, res) => {
  // Multiple-choice check (preferred path).
  if (req.body && req.body.correctOption !== undefined) return mcCheck(req, res);
  // Backward-compatible numeric fallback (still used by older clients).
  const { display, answer } = req.body || {};
  const userStr = (req.body.userAnswer || '').trim();
  const normalise = (s) => {
    let v = s.replace(/^\+/, '').trim();
    if (v.startsWith('.')) v = '0' + v;
    if (v.endsWith('.')) v = v + '0';
    if (v.includes('.')) v = v.replace(/0+$/, '').replace(/\.$/, '');
    return v;
  };
  const userNum = parseFloat(userStr);

  let correct = false;
  if (userStr) {
    if (normalise(userStr) === normalise(String(display))) {
      correct = true;
    } else if (!isNaN(userNum)) {
      // Tolerance scales with the magnitude of the answer (1ppm relative,
      // floor of 1e-12 absolute) so very small answers like 5.6e-7 still
      // match cleanly.
      const tol = Math.max(Math.abs(answer) * 1e-6, 1e-12);
      correct = Math.abs(userNum - answer) <= tol;
    }
  }
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTIONS GYM (funcgym-api)
// ───────────────────────────────────────────────────────────────────────────
// Evaluate a polynomial of degree 1, 2, or 3 with single-digit coefficients
// at a small integer x. Also includes simple linear-in-x rational expressions
// like (3x + 4) / 2. Multiple-choice with distractors that are off by a small
// arithmetic slip — wrong sign, off-by-one in the multiplier, missed term, etc.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Stringify a polynomial in standard form. coeffs[0] is the constant term,
 * coeffs[i] is the coefficient of x^i. Skips zero coefficients and produces
 * tidy spacing/signs ("2x³ − x² + 5", not "+2x^3 +-1x^2 +5").
 */
function fmtPoly(coeffs) {
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const parts = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;
    let term;
    const abs = Math.abs(c);
    if (i === 0) term = String(abs);
    else if (i === 1) term = (abs === 1 ? 'x' : `${abs}x`);
    else term = (abs === 1 ? `x${sup(i)}` : `${abs}x${sup(i)}`);
    if (parts.length === 0) {
      parts.push((c < 0 ? '−' : '') + term);
    } else {
      parts.push(c < 0 ? `− ${term}` : `+ ${term}`);
    }
  }
  return parts.length ? parts.join(' ') : '0';
}

/**
 * evalPoly(coeffs, x): Evaluate Σ coeffs[i] · x^i exactly (integer math when
 * coeffs and x are integers).
 */
function evalPoly(coeffs, x) {
  let total = 0;
  for (let i = 0; i < coeffs.length; i++) total += coeffs[i] * Math.pow(x, i);
  return total;
}

function funcgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  // All coefficients and x stay small enough that every multiplication in
  // the evaluation involves only single-digit times-tables, so the student
  // can solve mentally. For higher-degree polynomials we shrink the range
  // of x because x² and x³ get big fast.
  const randDigit = () => randomInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);

  let coeffs, kind, x, prompt, answer, display;

  if (difficulty === 'easy') {
    // Degree 1: ax + b. x ∈ [-9, 9] is fine since a·x stays in ≤9-table range
    // when |a| ≤ 9 and |x| ≤ 9.
    x = randomInt(-9, 9);
    coeffs = [randomInt(-9, 9), randDigit()];
    kind = 'poly1';
    answer = evalPoly(coeffs, x);
    prompt = `Let f(x) = ${fmtPoly(coeffs)}. Find f(${x}).`;
  } else if (difficulty === 'medium') {
    // Degree 2: ax² + bx + c. Cap |x| ≤ 3 so x² ≤ 9 — keeps b·x and a·x² inside
    // single-digit times-tables.
    x = randomInt(-3, 3);
    coeffs = [randomInt(-9, 9), randomInt(-9, 9), randDigit()];
    kind = 'poly2';
    answer = evalPoly(coeffs, x);
    prompt = `Let f(x) = ${fmtPoly(coeffs)}. Find f(${x}).`;
  } else if (difficulty === 'hard') {
    // Degree 3: ax³ + bx² + cx + d. Cap |x| ≤ 2 so x² ≤ 4, x³ ≤ 8 — every
    // intermediate product still fits in a single-digit times-table.
    x = randomInt(-2, 2);
    coeffs = [randomInt(-9, 9), randomInt(-9, 9), randomInt(-9, 9), randDigit()];
    kind = 'poly3';
    answer = evalPoly(coeffs, x);
    prompt = `Let f(x) = ${fmtPoly(coeffs)}. Find f(${x}).`;
  } else {
    // Linear rational: (ax + b) / k. Choose target answer first, k is a
    // single-digit divisor, ax + b is then an exact multiple of k.
    x = randomInt(-9, 9);
    const k = randomInt(2, 9);
    const num = randomInt(-9, 9);   // a
    const target = randomInt(-9, 9);
    const b = target * k - num * x;
    coeffs = [b, num];
    kind = 'rational1';
    answer = target;
    prompt = `Let f(x) = (${fmtPoly(coeffs)}) ÷ ${k}. Find f(${x}).`;
  }

  display = String(answer);
  // Distractors: off by ±1 (arithmetic slip), sign flip, and a "forgot one term"
  // result. They're forced distinct by buildOptions.
  const distractors = [
    String(answer + 1),
    String(answer - 1),
    String(-answer),
    String(answer + 2),
    String(answer * -1 + 1),
  ];
  const opts = buildOptions(display, distractors);
  return { id, difficulty, prompt, x, coeffs, kind, answer, display, ...opts };
}

app.get('/funcgym-api/question', (req, res) => {
  const q = funcgymQuestion(req.query.difficulty || 'easy');
  res.json(q);
});
app.post('/funcgym-api/check', express.json(), mcCheck);

// ═══════════════════════════════════════════════════════════════════════════
// DOTPRODUCTS GYM (dotprodgym-api)
// ───────────────────────────────────────────────────────────────────────────
// Compute the dot product of two 2D or 3D vectors with single-digit signed
// integer components. Distractors are common slips: sign flip on one term,
// off-by-one in a single product, swapped components.
// ═══════════════════════════════════════════════════════════════════════════

function dotprodgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  // 2D for easy, mixed for medium, 3D for hard, larger components for extrahard.
  const dim = difficulty === 'easy' ? 2 : difficulty === 'medium' ? (Math.random() < 0.5 ? 2 : 3) : 3;
  const lim = difficulty === 'extrahard' ? 9 : 6;
  const rand = () => {
    const v = randomInt(1, lim);
    return Math.random() < 0.5 ? -v : v;
  };
  const a = Array.from({ length: dim }, rand);
  const b = Array.from({ length: dim }, rand);
  let total = 0;
  for (let i = 0; i < dim; i++) total += a[i] * b[i];

  const fmtVec = (v) => `(${v.join(', ')})`;
  const prompt = `${fmtVec(a)} · ${fmtVec(b)} = ?`;

  // Distractors:
  //  d1: flip sign of just the first component pair contribution.
  //  d2: flip sign of just the last component pair contribution.
  //  d3: off-by-one (drop one product).
  //  d4: total with all signs ignored (sum of |a_i * b_i|).
  const d1 = total - 2 * (a[0] * b[0]);
  const d2 = total - 2 * (a[dim - 1] * b[dim - 1]);
  const d3 = total - a[0] * b[0];
  const d4 = a.reduce((s, v, i) => s + Math.abs(v * b[i]), 0);
  const distractors = [String(d1), String(d2), String(d3), String(d4), String(total + 1), String(-total)];
  const correctText = String(total);
  const opts = buildOptions(correctText, distractors);
  return { id, difficulty, prompt, a, b, total, display: correctText, ...opts };
}

app.get('/dotprodgym-api/question', (req, res) => {
  const q = dotprodgymQuestion(req.query.difficulty || 'easy');
  res.json(q);
});
app.post('/dotprodgym-api/check', express.json(), mcCheck);

// ═══════════════════════════════════════════════════════════════════════════
// FRACTIONS-ADD-GYM (fracaddgym-api)
// ───────────────────────────────────────────────────────────────────────────
// Add two fractions, both with single-digit numerator and denominator.
// Multiple choice. Distractors are the kind of mistakes students make:
//   - "added across" (a+c)/(b+d)
//   - forgot to find LCD: a/b + c/d → (a+c)/d
//   - wrong sign on the answer
//   - off-by-one in the numerator
// ═══════════════════════════════════════════════════════════════════════════

function fmtFracText(num, den) {
  // Render a fraction as plain text. Negative is shown on the numerator.
  if (den === 1) return String(num);
  if (num === 0) return '0';
  // Already simplified by the caller; preserve sign on the numerator.
  return `${num}/${den}`;
}

function fracaddgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  // Numerators and denominators are single digits.
  const nMax = 9;
  const a = randomInt(1, nMax);
  let b = randomInt(2, nMax);
  let c = randomInt(1, nMax);
  let d = randomInt(2, nMax);
  // For "easy" force same denominator (no LCD needed).
  if (difficulty === 'easy') d = b;

  // Optional sign on each operand for harder bands.
  const sa = (difficulty === 'easy' || difficulty === 'medium') ? 1 : (Math.random() < 0.4 ? -1 : 1);
  const sc = (difficulty === 'easy' || difficulty === 'medium') ? 1 : (Math.random() < 0.4 ? -1 : 1);

  const aa = sa * a, cc = sc * c;
  const num = aa * d + cc * b;
  const den = b * d;
  const g = gcd(Math.abs(num), den);
  const sn = num / g, sd = den / g;
  const display = fmtFracText(sn, sd);

  const fmtA = `${aa < 0 ? '−' : ''}${a}/${b}`;
  const fmtC = `${cc < 0 ? '−' : ''}${c}/${d}`;
  const prompt = `${fmtA} + ${fmtC} = ?`;

  // Distractors:
  //  d1: "added across": (a+c) / (b+d) (raw, before simplification)
  const dn1 = aa + cc, dd1 = b + d;
  const g1 = Math.max(1, gcd(Math.abs(dn1) || 1, dd1));
  const dist1 = fmtFracText(dn1 / g1, dd1 / g1);
  //  d2: numerator added but denominator kept as one of them
  const dn2 = aa + cc, dd2 = d;
  const g2 = Math.max(1, gcd(Math.abs(dn2) || 1, dd2));
  const dist2 = fmtFracText(dn2 / g2, dd2 / g2);
  //  d3: sign flip
  const dist3 = fmtFracText(-sn, sd);
  //  d4: numerator off by one
  const g4 = Math.max(1, gcd(Math.abs(sn + 1) || 1, sd));
  const dist4 = fmtFracText((sn + 1) / g4, sd / g4);
  const distractors = [dist1, dist2, dist3, dist4];
  const opts = buildOptions(display, distractors);

  return { id, difficulty, prompt, a, b, c, d, sa, sc, sn, sd, display, ...opts };
}

app.get('/fracaddgym-api/question', (req, res) => {
  const q = fracaddgymQuestion(req.query.difficulty || 'easy');
  res.json(q);
});
app.post('/fracaddgym-api/check', express.json(), mcCheck);

// ═══════════════════════════════════════════════════════════════════════════
// LINEAREQUATIONS-GYM (lineqgym-api)
// ───────────────────────────────────────────────────────────────────────────
// Solve ax + b = 0 for x, with the constraint that a is a single-digit
// non-zero integer (1..9 in absolute value) and b is a multiple of a so the
// solution is itself a small signed integer. This guarantees that the only
// "tables knowledge" required is the table of |a| (a single-digit number).
//
// Difficulty controls how big the integer solution can be:
//   easy:      |x| ≤ 5, a ∈ ±1..5
//   medium:    |x| ≤ 9, a ∈ ±1..9
//   hard:      adds a one-step rearrangement (ax + b = c)
//   extrahard: adds a constant on each side (ax + b = cx + d) with c ≠ a
// ═══════════════════════════════════════════════════════════════════════════

function lineqgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  // Pick a-coefficient and the integer solution; everything else follows.
  const aMag = (difficulty === 'easy') ? randomInt(1, 5) : randomInt(1, 9);
  const aSign = Math.random() < 0.5 ? -1 : 1;
  const a = aSign * aMag;
  const xMag = (difficulty === 'easy') ? randomInt(1, 5) : randomInt(1, 9);
  const x = xMag * (Math.random() < 0.5 ? -1 : 1);

  let prompt, kind;
  if (difficulty === 'easy' || difficulty === 'medium') {
    // ax + b = 0  ⇒  b = -a*x  (always a multiple of a, so it's solvable
    // without going beyond a's times-table).
    const b = -a * x;
    const lhs = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    prompt = `Solve for x:  ${lhs} = 0`;
    kind = 'simple';
  } else if (difficulty === 'hard') {
    // ax + b = c  ⇒  b - c = -a*x. Build c first, then choose b = -a*x + c.
    const c = randomInt(-9, 9);
    const b = -a * x + c;
    const lhs = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    prompt = `Solve for x:  ${lhs} = ${c}`;
    kind = 'rearrange';
  } else {
    // ax + b = cx + d.
    // Constraint: the student should only ever divide by |a − c|, and that
    // divisor must stay inside single-digit times-tables (|a − c| ≤ 9).
    // We pick the difference k = a − c first (1..9 magnitude), then derive c.
    const kMag = randomInt(1, 9);
    const kSign = Math.random() < 0.5 ? -1 : 1;
    const k = kMag * kSign;
    let c = a - k;
    // If c happens to fall outside the allowed single-digit range, retry by
    // flipping the sign of k; if still bad, clamp by reducing k's magnitude.
    if (c < -9 || c > 9 || c === 0) {
      c = a + k;
    }
    if (c < -9 || c > 9 || c === 0) {
      // Last resort: fall back to the simple "ax + b = 0" form so we never
      // emit a question that violates the mental-math constraint.
      const b0 = -a * x;
      const lhs0 = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b0 >= 0 ? '+' : '−'} ${Math.abs(b0)}`;
      prompt = `Solve for x:  ${lhs0} = 0`;
      kind = 'simple';
      const display0 = String(x);
      const distractors0 = [String(-x), String(x + 1), String(x - 1), String(2 * x)];
      const opts0 = buildOptions(display0, distractors0);
      return { id, difficulty, prompt, a, x, kind, display: display0, ...opts0 };
    }
    // (a − c) x  = d − b  ⇒  pick b freely, then d = (a-c)*x + b.
    const b = randomInt(-9, 9);
    const d = (a - c) * x + b;
    const lhs = `${a === 1 ? '' : a === -1 ? '−' : a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`;
    const rhs = `${c === 1 ? '' : c === -1 ? '−' : c}x ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`;
    prompt = `Solve for x:  ${lhs} = ${rhs}`;
    kind = 'twosided';
  }

  const display = String(x);
  const distractors = [String(-x), String(x + 1), String(x - 1), String(2 * x), String(Math.round(x / 2))];
  const opts = buildOptions(display, distractors);

  return { id, difficulty, prompt, a, x, kind, display, ...opts };
}

app.get('/lineqgym-api/question', (req, res) => {
  const q = lineqgymQuestion(req.query.difficulty || 'easy');
  res.json(q);
});
app.post('/lineqgym-api/check', express.json(), mcCheck);

// ═══════════════════════════════════════════════════════════════════════════
// INDICES GYM (indicesgym-api)
// ───────────────────────────────────────────────────────────────────────────
// Apply the index laws using symbolic variables so the student doesn't have
// to do any arithmetic beyond adding/subtracting/multiplying single-digit
// integer exponents.
//
//   product:    a^k · a^l         → a^(k+l)
//   quotient:   a^k / a^l         → a^(k−l)
//   power:      (a^k)^l           → a^(k·l)
//   mixed-base: a^k · b^l · a^m   → a^(k+m) · b^l
//
// Exponents are kept small (|k|, |l|, |m| ≤ 5) so |k·l| ≤ 25 and the
// student never needs anything past the 9-times tables. All variations are
// designed to be solvable mentally in ~20 seconds.
//
// Distractors mirror the most common student errors: confusing the rule
// (multiplying instead of adding exponents, etc.), swapping order in the
// quotient, and dropping a variable.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * fmtPower(base, exp): Render base^exp as a string. base may itself be a
 * formatted base such as "(xy)". We use Unicode superscript digits when the
 * exponent is a small integer; otherwise fall back to "^(...)".
 */
function fmtPower(base, exp) {
  if (exp === 0) return '1';
  if (exp === 1) return String(base);
  const sup = (n) => {
    const s = String(n);
    return s.split('').map(ch => ch === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[ch] || ch).join('');
  };
  return `${base}${sup(exp)}`;
}

/**
 * fmtTermList(parts): join non-trivial parts with explicit "·" so the student
 * sees the multiplication clearly. Drops parts equal to "1".
 */
function fmtTermList(parts) {
  const filtered = parts.filter(p => p !== '1');
  if (filtered.length === 0) return '1';
  return filtered.join(' · ');
}

function indicesgymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  // Available variables for the question.
  const vars = ['a', 'b', 'x', 'y', 'm', 'n'];
  const pickVar = (excl = []) => {
    const choices = vars.filter(v => !excl.includes(v));
    return choices[randomInt(0, choices.length - 1)];
  };
  // Small signed exponents — keeps any product within 9-times-tables.
  const eRange = (difficulty === 'easy') ? 4 : 5;
  const rE = () => {
    let v = randomInt(1, eRange);
    if (Math.random() < 0.5) v = -v;
    return v;
  };

  // Pick the law to apply. Easy/medium = single-base laws; hard/extrahard
  // mix two bases or chain two operations.
  const laws = (difficulty === 'easy') ? ['product', 'quotient']
              : (difficulty === 'medium') ? ['product', 'quotient', 'power']
              : (difficulty === 'hard') ? ['product', 'quotient', 'power', 'mixed', 'chain']
              : ['power', 'mixed', 'chain', 'powerchain'];
  const law = laws[randomInt(0, laws.length - 1)];

  let prompt, correctText, distractors;

  if (law === 'product') {
    const a = pickVar();
    const k = rE(), l = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} · ${fmtPower(a, l)}`;
    correctText = fmtPower(a, k + l);
    distractors = [fmtPower(a, k - l), fmtPower(a, k * l), fmtPower(a, l - k), fmtPower(a, k + l + 1)];
  } else if (law === 'quotient') {
    const a = pickVar();
    const k = rE(), l = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} ÷ ${fmtPower(a, l)}`;
    correctText = fmtPower(a, k - l);
    distractors = [fmtPower(a, k + l), fmtPower(a, l - k), fmtPower(a, k * l), fmtPower(a, k - l - 1)];
  } else if (law === 'power') {
    const a = pickVar();
    // Keep |k·l| ≤ 25 (5 × 5) so it stays in single-digit-table territory.
    const k = randomInt(2, 5) * (Math.random() < 0.4 ? -1 : 1);
    const l = randomInt(2, 5) * (Math.random() < 0.4 ? -1 : 1);
    // Render as (a^k)^l with a clear caret on the outer exponent so the
    // student sees the structure unambiguously.
    prompt = `Simplify:  (${fmtPower(a, k)})^${l < 0 ? `(${l})` : l}`;
    correctText = fmtPower(a, k * l);
    distractors = [fmtPower(a, k + l), fmtPower(a, k - l), fmtPower(a, k * l + 1), fmtPower(a, l - k)];
  } else if (law === 'mixed') {
    // Two bases, both products.
    const a = pickVar();
    const b = pickVar([a]);
    const k = rE(), l = rE(), m = rE(), n = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} · ${fmtPower(b, l)} · ${fmtPower(a, m)} · ${fmtPower(b, n)}`;
    correctText = fmtTermList([fmtPower(a, k + m), fmtPower(b, l + n)]);
    distractors = [
      fmtTermList([fmtPower(a, k * m), fmtPower(b, l * n)]),
      fmtTermList([fmtPower(a, k + m), fmtPower(b, l - n)]),
      fmtTermList([fmtPower(a, k - m), fmtPower(b, l + n)]),
      fmtTermList([fmtPower(a, k + l), fmtPower(b, m + n)]),
    ];
  } else if (law === 'chain') {
    // Mix multiplication and division on a single base.
    const a = pickVar();
    const k = rE(), l = rE(), m = rE();
    prompt = `Simplify:  ${fmtPower(a, k)} · ${fmtPower(a, l)} ÷ ${fmtPower(a, m)}`;
    correctText = fmtPower(a, k + l - m);
    distractors = [
      fmtPower(a, k + l + m),
      fmtPower(a, k - l - m),
      fmtPower(a, k - l + m),
      fmtPower(a, k + l - m + 1),
    ];
  } else {
    // powerchain: (a^k)^l · a^m
    const a = pickVar();
    const k = randomInt(2, 4) * (Math.random() < 0.4 ? -1 : 1);
    const l = randomInt(2, 4) * (Math.random() < 0.4 ? -1 : 1);
    const m = rE();
    prompt = `Simplify:  (${fmtPower(a, k)})^${l < 0 ? `(${l})` : l} · ${fmtPower(a, m)}`;
    correctText = fmtPower(a, k * l + m);
    distractors = [
      fmtPower(a, k + l + m),
      fmtPower(a, k * l - m),
      fmtPower(a, k * l * m),
      fmtPower(a, (k + l) * m),
    ];
  }

  const opts = buildOptions(correctText, distractors);
  return { id, difficulty, prompt, law, display: correctText, ...opts };
}

app.get('/indicesgym-api/question', (req, res) => {
  const q = indicesgymQuestion(req.query.difficulty || 'easy');
  res.json(q);
});
app.post('/indicesgym-api/check', express.json(), mcCheck);

// ═══════════════════════════════════════════════════════════════════════════
// POLYNOMIALS GYM (polygym-api)
// ───────────────────────────────────────────────────────────────────────────
// Progressive arithmetic → algebra ladder. The student starts with signed
// single-digit multiplication and two-digit add/subtract, then climbs to
// integer × monomial, addition of like terms, monomial × monomial (same or
// different variables), and finally monomial squaring with small powers.
//
// HARD RULE: every multiplication that appears in any question reduces to
// multiplying two single-digit numbers. Coefficients in multiplication
// problems stay |c| ≤ 9. Addition-only problems are allowed two-digit
// coefficients so the arithmetic stays interesting without violating the
// single-digit-multiplication constraint.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * fmtMono(coeff, variable, power): render a single monomial term such as
 * 3x, −x, 5y², or just 4 (when power is 0). Handles the special cases of
 * unit coefficient (no leading "1") and negative sign placement.
 */
function fmtMono(coeff, variable, power) {
  if (coeff === 0) return '0';
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const sign = coeff < 0 ? '−' : '';
  const abs = Math.abs(coeff);
  if (!variable || power === 0) return `${sign}${abs}`;
  const coefPart = abs === 1 ? '' : String(abs);
  const varPart = power === 1 ? variable : `${variable}${sup(power)}`;
  return `${sign}${coefPart}${varPart}`;
}

/**
 * fmtBinomial(c1, v1, c2, v2): render "ax ± by" with proper sign handling
 * between the two terms. Used for collecting-like-terms answers when both
 * terms survive (degenerate cases collapse to a single fmtMono).
 */
function fmtBinomial(c1, v1, c2, v2) {
  if (c1 === 0 && c2 === 0) return '0';
  if (c1 === 0) return fmtMono(c2, v2, 1);
  if (c2 === 0) return fmtMono(c1, v1, 1);
  const head = fmtMono(c1, v1, 1);
  const tail = c2 < 0 ? `− ${fmtMono(-c2, v2, 1)}` : `+ ${fmtMono(c2, v2, 1)}`;
  return `${head} ${tail}`;
}

/** Format a signed integer in parentheses when negative — for prompts. */
function signedParen(n) { return n < 0 ? `(${n})` : String(n); }

function polygymQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  const vars = ['x', 'y', 'a', 'b', 'm', 'n'];
  const pickVar = () => vars[randomInt(0, vars.length - 1)];
  // Signed single-digit factor — guarantees |coeff| ∈ [1, 9] so any product
  // involving two such factors stays within the 9-times-tables.
  const sd = () => randomInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);

  // Difficulty mix. Easy is pure arithmetic (no variables yet); medium
  // introduces a single variable; hard combines two variables and lets
  // addition coefficients grow; extra-hard adds small powers (squaring)
  // and three-term collect-like-terms problems.
  const kinds = (difficulty === 'easy')
    ? ['intMul', 'twoDigAdd', 'intMul', 'twoDigAdd']
    : (difficulty === 'medium')
    ? ['intTimesMono', 'monoAdd', 'intTimesMono', 'monoAdd', 'intMul']
    : (difficulty === 'hard')
    ? ['monoTimesMono', 'monoTimesMonoXY', 'monoBigAdd', 'monoTimesMono']
    : ['monoSquare', 'monoTimesMonoXY', 'collectLikeTerms', 'monoSquare'];
  const kind = kinds[randomInt(0, kinds.length - 1)];

  let prompt, correctText, distractors;

  if (kind === 'intMul') {
    // Signed single-digit multiplication: (−7) × 4 = −28
    const a = sd(), b = sd();
    const ans = a * b;
    prompt = `${signedParen(a)} × ${signedParen(b)} = ?`;
    correctText = String(ans);
    distractors = [String(-ans), String(ans + a), String(ans - b), String(a + b)];
  } else if (kind === 'twoDigAdd') {
    // Two-digit add/subtract with mixed signs: 23 + (−45) = −22
    const a = randomInt(10, 99) * (Math.random() < 0.4 ? -1 : 1);
    const b = randomInt(10, 99) * (Math.random() < 0.5 ? -1 : 1);
    const ans = a + b;
    const opPart = b < 0 ? `− ${Math.abs(b)}` : `+ ${b}`;
    prompt = `${signedParen(a)} ${opPart} = ?`;
    correctText = String(ans);
    distractors = [String(-ans), String(ans + 1), String(ans - 1), String(a - b)];
  } else if (kind === 'intTimesMono') {
    // Integer × monomial: 3 × 4x = 12x. Both factors single-digit signed.
    const k = sd(), c = sd();
    const v = pickVar();
    const ans = k * c;
    prompt = `${signedParen(k)} × ${fmtMono(c, v, 1)} = ?`;
    correctText = fmtMono(ans, v, 1);
    distractors = [
      fmtMono(-ans, v, 1),
      fmtMono(ans, v, 2),
      String(ans),                  // forgot the variable
      fmtMono(k + c, v, 1),         // added instead of multiplied
    ];
  } else if (kind === 'monoAdd') {
    // Like terms: 3x + 4x = 7x (single-digit coefficients).
    const v = pickVar();
    const a = sd(), b = sd();
    const ans = a + b;
    const opPart = b < 0 ? `− ${Math.abs(b)}${v}` : `+ ${b}${v}`;
    prompt = `${fmtMono(a, v, 1)} ${opPart} = ?`;
    correctText = fmtMono(ans, v, 1);
    distractors = [
      fmtMono(a * b, v, 1),         // multiplied instead of added
      fmtMono(ans, v, 2),           // raised the power
      fmtMono(-ans, v, 1),
      String(ans),                  // forgot the variable
    ];
  } else if (kind === 'monoTimesMono') {
    // Same variable: 3x × −4x = −12x² (still single-digit × single-digit).
    const v = pickVar();
    const a = sd(), b = sd();
    const ans = a * b;
    prompt = `${fmtMono(a, v, 1)} × ${fmtMono(b, v, 1)} = ?`;
    correctText = fmtMono(ans, v, 2);
    distractors = [
      fmtMono(ans, v, 1),           // forgot to bump the power
      fmtMono(-ans, v, 2),
      fmtMono(a + b, v, 2),         // added coefficients
      fmtMono(ans, v, 3),
    ];
  } else if (kind === 'monoTimesMonoXY') {
    // Different variables: 3x × 4y = 12xy.
    const v1 = pickVar();
    let v2 = pickVar(); while (v2 === v1) v2 = pickVar();
    const a = sd(), b = sd();
    const ans = a * b;
    const sortedVars = [v1, v2].sort().join('');
    const sign = ans < 0 ? '−' : '';
    const abs = Math.abs(ans);
    const coefStr = abs === 1 ? '' : String(abs);
    prompt = `${fmtMono(a, v1, 1)} × ${fmtMono(b, v2, 1)} = ?`;
    correctText = `${sign}${coefStr}${sortedVars}`;
    distractors = [
      `${ans < 0 ? '' : '−'}${coefStr}${sortedVars}`,   // wrong sign
      `${sign}${coefStr}${v1}`,                          // dropped second var
      `${sign}${coefStr}${v2}`,                          // dropped first var
      fmtMono(ans, v1, 2),                               // wrongly squared
    ];
  } else if (kind === 'monoBigAdd') {
    // Pure addition with two-digit coefficients: 23x − 17x = 6x. No
    // multiplication is involved, so the single-digit rule is preserved.
    const v = pickVar();
    const a = randomInt(10, 50) * (Math.random() < 0.4 ? -1 : 1);
    const b = randomInt(10, 50) * (Math.random() < 0.5 ? -1 : 1);
    const ans = a + b;
    const opPart = b < 0 ? `− ${Math.abs(b)}${v}` : `+ ${b}${v}`;
    prompt = `${fmtMono(a, v, 1)} ${opPart} = ?`;
    correctText = fmtMono(ans, v, 1);
    distractors = [
      fmtMono(-ans, v, 1),
      fmtMono(a - b, v, 1),
      fmtMono(ans + 1, v, 1),
      fmtMono(ans, v, 2),
    ];
  } else if (kind === 'monoSquare') {
    // Small-power multiplication: 3x² × 4x = 12x³ (max total power 4).
    const v = pickVar();
    const a = sd(), b = sd();
    const p1 = randomInt(1, 2), p2 = randomInt(1, 2);
    const ans = a * b;
    prompt = `${fmtMono(a, v, p1)} × ${fmtMono(b, v, p2)} = ?`;
    correctText = fmtMono(ans, v, p1 + p2);
    distractors = [
      fmtMono(ans, v, Math.max(1, p1 * p2)),    // multiplied powers instead of adding
      fmtMono(-ans, v, p1 + p2),
      fmtMono(a + b, v, p1 + p2),
      fmtMono(ans, v, Math.max(p1, p2)),
    ];
  } else {
    // collectLikeTerms: ax + by − cx = (a − c)x + by. Three terms, only
    // two of them like — student must regroup before adding.
    const v1 = 'x', v2 = 'y';
    const a = sd(), b = sd(), c = sd();
    const xCoef = a - c;
    const yCoef = b;
    const part2 = b < 0 ? `− ${Math.abs(b)}${v2}` : `+ ${b}${v2}`;
    const part3 = c < 0 ? `+ ${Math.abs(c)}${v1}` : `− ${c}${v1}`;
    prompt = `${fmtMono(a, v1, 1)} ${part2} ${part3} = ?`;
    correctText = fmtBinomial(xCoef, v1, yCoef, v2);
    distractors = [
      fmtBinomial(a + c, v1, yCoef, v2),         // added instead of subtracted
      fmtBinomial(xCoef, v1, -yCoef, v2),
      fmtBinomial(-xCoef, v1, yCoef, v2),
      fmtBinomial(yCoef, v1, xCoef, v2),         // swapped variables
    ];
  }

  const opts = buildOptions(correctText, distractors);
  return { id, difficulty, prompt, kind, display: correctText, ...opts };
}

app.get('/polygym-api/question', (req, res) => {
  const q = polygymQuestion(req.query.difficulty || 'easy');
  res.json(q);
});
app.post('/polygym-api/check', express.json(), mcCheck);

// ═══════════════════════════════════════════════════════════════════════════
// 10. GST (gst-api)
// ═══════════════════════════════════════════════════════════════════════════
function gstQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // GST amount = price × (rate/100)
    const price = randomInt(100, 1000);
    const rate = triPick([5, 12, 18]);
    const answer = (price * rate) / 100;
    const prompt = `Find GST on price Rs ${price} at rate ${rate}%`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(0) };
  } else if (difficulty === 'medium') {
    // Total = price + GST
    const price = randomInt(500, 2000);
    const rate = triPick([5, 12, 18]);
    const gst = (price * rate) / 100;
    const answer = price + gst;
    const prompt = `Total price including ${rate}% GST on Rs ${price}`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(0) };
  } else if (difficulty === 'hard') {
    // CGST + SGST = GST
    const listPrice = randomInt(1000, 5000);
    const rate = triPick([5, 12, 18]);
    const gst = (listPrice * rate) / 100;
    const cgst = gst / 2;
    const sgst = gst / 2;
    const answer = listPrice + cgst + sgst;
    const prompt = `Intra-state: List price Rs ${listPrice}, GST ${rate}%. Find total (with CGST+SGST)`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(0) };
  } else {
    // IGST input tax credit
    const billedAmount = randomInt(5000, 20000);
    const rate = triPick([5, 12, 18]);
    const igst = (billedAmount * rate) / 100;
    const answer = igst;
    const prompt = `IGST at ${rate}% on Rs ${billedAmount}. Find input tax credit`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(0) };
  }
}

app.get('/gst-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = gstQuestion(difficulty);
  res.json(q);
});

app.post('/gst-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 1;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. SECTION FORMULA (section-api)
// ═══════════════════════════════════════════════════════════════════════════
function sectionQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // midpoint
    const x1 = randomInt(-10, 10);
    const y1 = randomInt(-10, 10);
    const x2 = randomInt(-10, 10);
    const y2 = randomInt(-10, 10);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const prompt = `Find midpoint of (${x1},${y1}) and (${x2},${y2})`;
    return { id, difficulty, prompt, answer: [midX, midY], display: `${midX.toFixed(1)},${midY.toFixed(1)}` };
  } else if (difficulty === 'medium') {
    // point dividing m:n internally
    const x1 = randomInt(-5, 5);
    const y1 = randomInt(-5, 5);
    const x2 = randomInt(-5, 5);
    const y2 = randomInt(-5, 5);
    const m = randomInt(1, 4);
    const n = randomInt(1, 4);
    const px = (m * x2 + n * x1) / (m + n);
    const py = (m * y2 + n * y1) / (m + n);
    const prompt = `Point dividing (${x1},${y1}) and (${x2},${y2}) in ratio ${m}:${n}`;
    return { id, difficulty, prompt, answer: [px, py], display: `${px.toFixed(2)},${py.toFixed(2)}` };
  } else if (difficulty === 'hard') {
    // find ratio given point
    const x1 = randomInt(-5, 5);
    const y1 = randomInt(-5, 5);
    const x2 = randomInt(-5, 5);
    const y2 = randomInt(-5, 5);
    const t = randomInt(1, 3) / (randomInt(1, 3));
    const px = (t * x2 + x1) / (t + 1);
    const py = (t * y2 + y1) / (t + 1);
    const prompt = `Point (${px.toFixed(1)},${py.toFixed(1)}) divides (${x1},${y1}) and (${x2},${y2}). Find ratio m:n`;
    return { id, difficulty, prompt, answer: t, display: `1:${(1/t).toFixed(2)}` };
  } else {
    // centroid of triangle
    const x1 = randomInt(-5, 5);
    const y1 = randomInt(-5, 5);
    const x2 = randomInt(-5, 5);
    const y2 = randomInt(-5, 5);
    const x3 = randomInt(-5, 5);
    const y3 = randomInt(-5, 5);
    const cx = (x1 + x2 + x3) / 3;
    const cy = (y1 + y2 + y3) / 3;
    const prompt = `Centroid of triangle with vertices (${x1},${y1}), (${x2},${y2}), (${x3},${y3})`;
    return { id, difficulty, prompt, answer: [cx, cy], display: `${cx.toFixed(2)},${cy.toFixed(2)}` };
  }
}

app.get('/section-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = sectionQuestion(difficulty);
  res.json(q);
});

app.post('/section-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  if (Array.isArray(answer)) {
    const parts = userStr.split(',').map(p => parseFloat(p.trim()));
    const correct = parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) &&
                    Math.abs(parts[0] - answer[0]) < 0.2 && Math.abs(parts[1] - answer[1]) < 0.2;
    res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
  } else {
    const userNum = parseFloat(userStr);
    const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.2;
    res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. LINEAR PROGRAMMING (linprog-api)
// ═══════════════════════════════════════════════════════════════════════════
function linprogQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // evaluate Z at given vertex
    const a = randomInt(2, 5);
    const b = randomInt(2, 5);
    const vx = randomInt(1, 5);
    const vy = randomInt(1, 5);
    const answer = a * vx + b * vy;
    const prompt = `Maximize Z = ${a}x + ${b}y at vertex (${vx}, ${vy})`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else if (difficulty === 'medium') {
    // max Z at given vertices
    const a = randomInt(2, 4);
    const b = randomInt(2, 4);
    const vertices = [[0, 0], [randomInt(2, 6), 0], [0, randomInt(2, 6)], [randomInt(1, 3), randomInt(1, 3)]];
    let maxVal = -Infinity;
    vertices.forEach(([x, y]) => {
      const val = a * x + b * y;
      maxVal = Math.max(maxVal, val);
    });
    const prompt = `Maximize Z = ${a}x + ${b}y at vertices ${JSON.stringify(vertices)}`;
    return { id, difficulty, prompt, answer: maxVal, display: String(maxVal) };
  } else if (difficulty === 'hard') {
    // find corner points with 2 constraints
    const a = randomInt(1, 3);
    const b = randomInt(1, 3);
    const c1 = randomInt(4, 8);
    const c2 = randomInt(4, 8);
    const prompt = `Minimize Z = ${a}x + ${b}y subject to x + y ≥ ${c1}, 2x + y ≥ ${c2}, x,y ≥ 0`;
    const corners = [[0, c1], [0, c2], [c1, 0], [c2/2, 0]].filter(p => p[0] >= 0 && p[1] >= 0);
    let minVal = Infinity;
    corners.forEach(([x, y]) => {
      if (x + y >= c1 && 2 * x + y >= c2) {
        minVal = Math.min(minVal, a * x + b * y);
      }
    });
    return { id, difficulty, prompt, answer: minVal < Infinity ? minVal : 0, display: String(minVal < Infinity ? Math.round(minVal) : 0) };
  } else {
    // 3 constraints
    const a = randomInt(1, 3);
    const b = randomInt(1, 3);
    const c1 = randomInt(3, 6);
    const c2 = randomInt(3, 6);
    const c3 = randomInt(3, 6);
    const prompt = `Maximize Z = ${a}x + ${b}y subject to: x + y ≤ ${c1}, x ≤ ${c2}, y ≤ ${c3}, x,y ≥ 0`;
    const corners = [[0, 0], [c2, 0], [0, c3], [c2, Math.min(c3, c1 - c2)]];
    let maxVal = 0;
    corners.forEach(([x, y]) => {
      if (x + y <= c1 && x <= c2 && y <= c3) {
        maxVal = Math.max(maxVal, a * x + b * y);
      }
    });
    return { id, difficulty, prompt, answer: maxVal, display: String(maxVal) };
  }
}

app.get('/linprog-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = linprogQuestion(difficulty);
  res.json(q);
});

app.post('/linprog-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 1;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. CIRCULAR MEASURE (circmeasure-api)
// ═══════════════════════════════════════════════════════════════════════════
function circmeasureQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // degrees to radians
    const angles = [30, 45, 60, 90, 180, 360];
    const deg = triPick(angles);
    const answer = (deg * Math.PI) / 180;
    const prompt = `Convert ${deg}° to radians`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  } else if (difficulty === 'medium') {
    // radians to degrees
    const radMult = triPick([0.5, 1, 1.5, 2, 3]);
    const rad = radMult;
    const answer = (rad * 180) / Math.PI;
    const prompt = `Convert ${rad}π radians to degrees`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  } else if (difficulty === 'hard') {
    // arc length = rθ
    const r = randomInt(2, 8);
    const theta = (randomInt(30, 180) * Math.PI) / 180;
    const answer = r * theta;
    const deg = Math.round((theta * 180) / Math.PI);
    const prompt = `Arc length: radius ${r}, angle ${deg}° (θ in radians)`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  } else {
    // area of sector = (1/2)r²θ
    const r = randomInt(3, 10);
    const theta = (randomInt(45, 180) * Math.PI) / 180;
    const answer = (1 / 2) * r * r * theta;
    const deg = Math.round((theta * 180) / Math.PI);
    const prompt = `Sector area: radius ${r}, angle ${deg}° (θ in radians)`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  }
}

app.get('/circmeasure-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = circmeasureQuestion(difficulty);
  res.json(q);
});

app.post('/circmeasure-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  const userStr = (req.body.userAnswer || '').trim();
  const userNum = parseFloat(userStr);
  const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.5;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. CONIC SECTIONS (conics-api)
// ═══════════════════════════════════════════════════════════════════════════
function conicsQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // identify conic type
    const types = [
      { eq: 'x² + y² = 25', type: 'circle' },
      { eq: 'y² = 8x', type: 'parabola' },
      { eq: 'x²/25 + y²/9 = 1', type: 'ellipse' },
      { eq: 'x²/16 − y²/9 = 1', type: 'hyperbola' }
    ];
    const chosen = triPick(types);
    const prompt = `Identify conic: ${chosen.eq}`;
    return { id, difficulty, prompt, answer: chosen.type, display: chosen.type };
  } else if (difficulty === 'medium') {
    // find radius of circle x²+y²+Dx+Ey+F=0
    const h = randomInt(-5, 5);
    const k = randomInt(-5, 5);
    const r = randomInt(2, 8);
    const D = -2 * h;
    const E = -2 * k;
    const F = h * h + k * k - r * r;
    const answer = r;
    const prompt = `Find radius: x² + y² + ${D}x + ${E}y + ${F} = 0`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  } else if (difficulty === 'hard') {
    // find eccentricity of ellipse
    const a = randomInt(5, 10);
    const b = randomInt(2, a - 1);
    const c = Math.sqrt(a * a - b * b);
    const ecc = c / a;
    const prompt = `Ellipse: x²/${a * a} + y²/${b * b} = 1. Find eccentricity`;
    return { id, difficulty, prompt, answer: ecc, display: ecc.toFixed(3) };
  } else {
    // find focus of parabola y²=4ax
    const a = randomInt(1, 5);
    const answer = a;
    const focus_x = a;
    const prompt = `Parabola: y² = ${4 * a}x. Find x-coordinate of focus`;
    return { id, difficulty, prompt, answer, display: String(answer) };
  }
}

app.get('/conics-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = conicsQuestion(difficulty);
  res.json(q);
});

app.post('/conics-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  let userStr = (req.body.userAnswer || '').trim().toLowerCase();
  const correct = (typeof answer === 'string')
    ? userStr === answer.toLowerCase()
    : !isNaN(parseFloat(userStr)) && Math.abs(parseFloat(userStr) - answer) < 0.1;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. DIFFERENTIAL EQUATIONS (diffeq-api)
// ═══════════════════════════════════════════════════════════════════════════
function diffeqQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // find order
    const orders = [
      { de: "dy/dx = 2x", order: 1 },
      { de: "d²y/dx² + 3dy/dx = 0", order: 2 },
      { de: "d³y/dx³ − y = x", order: 3 },
      { de: "(dy/dx)² + dy/dx = x", order: 1 }
    ];
    const chosen = triPick(orders);
    const prompt = `Find order: ${chosen.de}`;
    return { id, difficulty, prompt, answer: chosen.order, display: String(chosen.order) };
  } else if (difficulty === 'medium') {
    // find degree
    const degrees = [
      { de: "(dy/dx)² + dy/dx = x", deg: 2 },
      { de: "d²y/dx² + (dy/dx)³ = 0", deg: 3 },
      { de: "(d²y/dx²)² = 4(dy/dx)", deg: 2 },
      { de: "dy/dx + y = x", deg: 1 }
    ];
    const chosen = triPick(degrees);
    const prompt = `Find degree: ${chosen.de}`;
    return { id, difficulty, prompt, answer: chosen.deg, display: String(chosen.deg) };
  } else if (difficulty === 'hard') {
    // verify solution
    const solutions = [
      { de: "dy/dx = 2x", sol: "y = x² + C", isValid: true },
      { de: "dy/dx + y = 0", sol: "y = e^(−x)", isValid: true },
      { de: "dy/dx = y", sol: "y = e^x", isValid: true },
      { de: "d²y/dx² + y = 0", sol: "y = sin(x)", isValid: true }
    ];
    const chosen = triPick(solutions);
    const prompt = `Is y = ${chosen.sol.split('=')[1].trim()} a solution of ${chosen.de}? (yes/no)`;
    const answerStr = chosen.isValid ? 'yes' : 'no';
    return { id, difficulty, prompt, answer: answerStr, display: answerStr };
  } else {
    // solve separable dy/dx = f(x)
    const a = randomInt(1, 4);
    const b = randomInt(1, 4);
    const prompt = `Solve: dy/dx = ${a}x + ${b}`;
    const answerStr = `y = ${a}x²/2 + ${b}x + C`;
    return { id, difficulty, prompt, answer: answerStr, display: answerStr };
  }
}

app.get('/diffeq-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const q = diffeqQuestion(difficulty);
  res.json(q);
});

app.post('/diffeq-api/check', express.json(), (req, res) => {
  const { answer, display } = req.body;
  let userStr = (req.body.userAnswer || '').trim().toLowerCase();
  const correct = (typeof answer === 'string')
    ? userStr === answer.toLowerCase() || userStr === answer.toLowerCase().replace(/\s+/g, '')
    : !isNaN(parseInt(userStr, 10)) && parseInt(userStr, 10) === answer;
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING JOURNEY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════
const { JOURNEY_CURRICULUM } = require('./lil/learning_journey/journeyData');
const {
  getUserProgress,
  getTopicProgression,
  completeConcept,
  getCheckpointQuiz,
  verifyCheckpointQuiz
} = require('./lil/learning_journey/controllers');

app.get('/api/learning-journey/progress', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await getUserProgress(userId);
    
    // Map all topics to their progression state for the client
    const topicsProgress = JOURNEY_CURRICULUM.map(topic => 
      getTopicProgression(progress, topic.id)
    );

    // Calculate overall journey progress percent
    const totalConcepts = JOURNEY_CURRICULUM.reduce((sum, t) => sum + t.concepts.length, 0);
    const completedConceptsCount = progress.completedConcepts.length;
    const overallProgressPercent = totalConcepts > 0 
      ? Math.round((completedConceptsCount / totalConcepts) * 100) 
      : 0;

    res.json({
      topics: topicsProgress,
      completedConcepts: progress.completedConcepts,
      completedTopics: progress.completedTopics,
      overallProgressPercent
    });
  } catch (err) {
    console.error('[learning-journey] GET /progress error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/learning-journey/complete-concept', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId, conceptKey } = req.body || {};
    if (!topicId || !conceptKey) {
      return res.status(400).json({ error: 'Missing topicId or conceptKey' });
    }

    const progress = await completeConcept(userId, topicId, conceptKey);
    res.json({ success: true, completedConcepts: progress.completedConcepts });
  } catch (err) {
    console.error('[learning-journey] POST /complete-concept error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/learning-journey/checkpoint/quiz', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId } = req.query || {};
    if (!topicId) {
      return res.status(400).json({ error: 'Missing topicId' });
    }

    const quiz = await getCheckpointQuiz(userId, topicId);
    res.json(quiz);
  } catch (err) {
    console.error('[learning-journey] GET /checkpoint/quiz error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/learning-journey/checkpoint/verify', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId, answers } = req.body || {};
    if (!topicId || !answers) {
      return res.status(400).json({ error: 'Missing topicId or answers' });
    }

    const result = await verifyCheckpointQuiz(userId, topicId, answers);
    res.json(result);
  } catch (err) {
    console.error('[learning-journey] POST /checkpoint/verify error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// /darts-api — Visual Coordinate Geometry (Dart Board)
// ═══════════════════════════════════════════════════════════════════════════
app.get('/darts-api/question', (req, res) => {
  const level = req.query.level || 'easy';
  let x, y;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randHalf = (min, max) => randInt(min * 2, max * 2) / 2;

  if (level === 'easy') {
    // 1st quadrant only
    x = randInt(1, 5);
    y = randInt(1, 5);
  } else if (level === 'medium') {
    // Any quadrant, integer
    do {
      x = randInt(-5, 5);
      y = randInt(-5, 5);
    } while (x === 0 && y === 0);
  } else if (level === 'hard') {
    // Any quadrant, half steps allowed
    do {
      x = randHalf(-5, 5);
      y = randHalf(-5, 5);
    } while (Number.isInteger(x) && Number.isInteger(y));
  } else {
    // extrahard
    const startX = randInt(-4, 4) || 1;
    const startY = randInt(-4, 4) || 1;
    const axis = Math.random() < 0.5 ? 'x' : 'y';
    x = axis === 'y' ? -startX : startX;
    y = axis === 'x' ? -startY : startY;
    
    return res.json({
      prompt: `Plot the reflection of (${startX}, ${startY}) across the ${axis.toUpperCase()}-axis.`,
      x, y, level, startX, startY, axis, type: 'reflection'
    });
  }

  res.json({
    prompt: `Throw the dart at coordinate (${x}, ${y}).`,
    x, y, level, type: 'standard'
  });
});

app.post('/darts-api/check', express.json(), (req, res) => {
  const { userX, userY, x, y } = req.body;
  const correct = userX === x && userY === y;
  res.json({ correct, message: correct ? 'Bullseye!' : 'Missed!' });
});

// WORD CREATOR PUZZLE ROUTER (wordcreator-api)
// ═══════════════════════════════════════════════════════════════════════════
const wordCreatorRouter = require('./routes/wordCreator');
app.use('/wordcreator-api', wordCreatorRouter);

// ═══════════════════════════════════════════════════════════════════════════
// /graph — Prerequisite DAG visualisation
// ═══════════════════════════════════════════════════════════════════════════
app.get('/graph', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'graph', 'index.html'));
});

app.get('/path', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'graph', 'path.html'));
});

app.get('/enhanced', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'enhanced', 'index.html'));
});

/**
 * LINEAR ALGEBRA QUIZ - Question/Check endpoints
 * ═══════════════════════════════════════════════════════════════════════════
 * 10+ question types per difficulty level (easy / medium / hard).
 * Topics: vectors, matrices, systems, determinants, eigenvalues, projections.
 */
app.get('/linearalgebra-api/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const id = Date.now();
  const ri = (lo, hi) => randomInt(lo, hi);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fv = (...c) => `(${c.join(', ')})`;
  const fm = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
  const rnd2 = (x) => Math.round(x * 100) / 100;
  let q;

  const easyGens = [
    () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],r=[u[0]+v[0],u[1]+v[1]]; return {type:'vec_add',answerType:'vector',prompt:`Find u + v where u = ${fv(...u)} and v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{u,v}}; },
    () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],r=[u[0]-v[0],u[1]-v[1]]; return {type:'vec_sub',answerType:'vector',prompt:`Find u − v where u = ${fv(...u)} and v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{u,v}}; },
    () => { let k=ri(-5,5); if(k===0)k=2; const v=[ri(-9,9),ri(-9,9)],r=[k*v[0],k*v[1]]; return {type:'vec_scale',answerType:'vector',prompt:`Find ${k}v where v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{k,v}}; },
    () => { const v=[ri(-9,9),ri(-9,9)],r=[-v[0],-v[1]]; return {type:'vec_neg',answerType:'vector',prompt:`Find −v where v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{v}}; },
    () => { const v=[ri(1,9),ri(1,9)],m=rnd2(Math.sqrt(v[0]*v[0]+v[1]*v[1])); return {type:'vec_mag',answerType:'scalar',prompt:`Find |v| where v = ${fv(...v)} (round to 2 d.p.)`,answer:String(m),display:String(m),data:{v}}; },
    () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],d=u[0]*v[0]+u[1]*v[1]; return {type:'vec_dot',answerType:'scalar',prompt:`Find u · v where u = ${fv(...u)} and v = ${fv(...v)}`,answer:String(d),display:String(d),data:{u,v}}; },
    () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],B=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],R=[[A[0][0]+B[0][0],A[0][1]+B[0][1]],[A[1][0]+B[1][0],A[1][1]+B[1][1]]]; return {type:'mat_add',answerType:'matrix',prompt:`Find A + B where A = ${fm(A)} and B = ${fm(B)}`,answer:fm(R),display:fm(R),data:{A,B}}; },
    () => { let k=ri(-5,5); if(k===0)k=2; const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],R=[[k*A[0][0],k*A[0][1]],[k*A[1][0],k*A[1][1]]]; return {type:'mat_scale',answerType:'matrix',prompt:`Find ${k}A where A = ${fm(A)}`,answer:fm(R),display:fm(R),data:{k,A}}; },
    () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'mat_det2',answerType:'scalar',prompt:`Find det(A) where A = ${fm(A)}`,answer:String(det),display:String(det),data:{A}}; },
    () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],R=[[A[0][0],A[1][0]],[A[0][1],A[1][1]]]; return {type:'mat_transpose',answerType:'matrix',prompt:`Find Aᵀ where A = ${fm(A)}`,answer:fm(R),display:fm(R),data:{A}}; },
    () => { const A=[ri(-9,9),ri(-9,9)],B=[ri(-9,9),ri(-9,9)],r=[B[0]-A[0],B[1]-A[1]]; return {type:'vec_points',answerType:'vector',prompt:`Find vector AB where A = ${fv(...A)} and B = ${fv(...B)}`,answer:fv(...r),display:fv(...r),data:{A,B}}; },
  ];

  const mediumGens = [
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]],B=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]],R=[[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]]; return {type:'mat_mul2',answerType:'matrix',prompt:`Find AB where A = ${fm(A)} and B = ${fm(B)}`,answer:fm(R),display:fm(R),data:{A,B}}; },
    () => { const x=ri(-5,5),y=ri(-5,5); const a1=ri(1,5),b1=ri(1,5),c1=a1*x+b1*y; let a2,b2,c2; do { a2=ri(1,5); b2=ri(1,5); } while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'solve_2x2',answerType:'scalar',prompt:`Solve: ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. Find x.`,answer:String(x),display:String(x),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
    () => { const x=ri(-5,5),y=ri(-5,5); const a1=ri(1,5),b1=ri(1,5),c1=a1*x+b1*y; let a2,b2,c2; do { a2=ri(1,5); b2=ri(1,5); } while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'solve_2x2_y',answerType:'scalar',prompt:`Solve: ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. Find y.`,answer:String(y),display:String(y),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
    () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],t=A[0][0]+A[1][1]; return {type:'mat_trace',answerType:'scalar',prompt:`Find tr(A) where A = ${fm(A)}`,answer:String(t),display:String(t),data:{A}}; },
    () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],c=u[0]*v[1]-u[1]*v[0]; return {type:'vec_cross',answerType:'scalar',prompt:`Find u × v where u = ${fv(...u)} and v = ${fv(...v)} (2D cross product: u₁v₂ − u₂v₁)`,answer:String(c),display:String(c),data:{u,v}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]],v=[ri(-5,5),ri(-5,5)],r=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]; return {type:'mat_vec',answerType:'vector',prompt:`Find Av where A = ${fm(A)} and v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{A,v}}; },
    () => { const u=[ri(1,9),ri(1,9)],v=[ri(1,9),ri(1,9)]; const dot=u[0]*v[0]+u[1]*v[1]; const magU=Math.sqrt(u[0]*u[0]+u[1]*u[1]),magV=Math.sqrt(v[0]*v[0]+v[1]*v[1]); const cosA=Math.max(-1,Math.min(1,dot/(magU*magV))); const angle=Math.round(Math.acos(cosA)*180/Math.PI); return {type:'vec_angle',answerType:'scalar',prompt:`Find the angle (nearest degree) between u = ${fv(...u)} and v = ${fv(...v)}`,answer:String(angle),display:String(angle)+'°',data:{u,v}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; const rank=(det!==0)?2:((A[0][0]!==0||A[0][1]!==0||A[1][0]!==0||A[1][1]!==0)?1:0); return {type:'mat_rank',answerType:'scalar',prompt:`Find rank(A) where A = ${fm(A)}`,answer:String(rank),display:String(rank),data:{A}}; },
    () => { const u=[ri(1,9),ri(1,9)],v=[ri(1,9),ri(1,9)]; const dot=u[0]*v[0]+u[1]*v[1]; const magV=Math.sqrt(v[0]*v[0]+v[1]*v[1]); const proj=rnd2(dot/magV); return {type:'vec_proj',answerType:'scalar',prompt:`Find the scalar projection of u onto v where u = ${fv(...u)} and v = ${fv(...v)} (round to 2 d.p.)`,answer:String(proj),display:String(proj),data:{u,v}}; },
    () => { let v=[ri(1,9),ri(1,9)]; if(Math.random()<0.5)v[0]=-v[0]; if(Math.random()<0.5)v[1]=-v[1]; const mag=Math.sqrt(v[0]*v[0]+v[1]*v[1]); const u1=rnd2(v[0]/mag); return {type:'vec_unit',answerType:'scalar',prompt:`Find the x-component of the unit vector in the direction of v = ${fv(...v)} (round to 2 d.p.)`,answer:String(u1),display:String(u1),data:{v}}; },
  ];

  const hardGens = [
    () => { const M=Array.from({length:3},()=>[ri(-5,5),ri(-5,5),ri(-5,5)]); const det=M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]); const fmt=(m)=>`[${m[0].join(',')};${m[1].join(',')};${m[2].join(',')}]`; return {type:'det_3x3',answerType:'scalar',prompt:`Find det(A) where A = ${fmt(M)}`,answer:String(det),display:String(det),data:{M}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const t=A[0][0]+A[1][1]; return {type:'eigen_sum',answerType:'scalar',prompt:`Find the sum of eigenvalues of A = ${fm(A)} (hint: sum = trace)`,answer:String(t),display:String(t),data:{A}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'eigen_prod',answerType:'scalar',prompt:`Find the product of eigenvalues of A = ${fm(A)} (hint: product = det)`,answer:String(det),display:String(det),data:{A}}; },
    () => { const x=ri(-3,3),y=ri(-3,3),z=ri(-3,3); const a1=ri(1,3),b1=ri(1,3),c1=ri(1,3),d1=a1*x+b1*y+c1*z; const a2=ri(1,3),b2=ri(1,3),c2=ri(1,3),d2=a2*x+b2*y+c2*z; const a3=ri(1,3),b3=ri(1,3),c3=ri(1,3),d3=a3*x+b3*y+c3*z; return {type:'solve_3x3',answerType:'scalar',prompt:`Solve: ${a1}x+${b1}y+${c1}z=${d1}, ${a2}x+${b2}y+${c2}z=${d2}, ${a3}x+${b3}y+${c3}z=${d3}. Find x.`,answer:String(x),display:String(x),data:{a1,b1,c1,d1,a2,b2,c2,d2,a3,b3,c3,d3,x,y,z}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'char_const',answerType:'scalar',prompt:`Find the constant term of the characteristic polynomial of A = ${fm(A)} (hint: = det(A))`,answer:String(det),display:String(det),data:{A}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const A2=[[A[0][0]*A[0][0]+A[0][1]*A[1][0],A[0][0]*A[0][1]+A[0][1]*A[1][1]],[A[1][0]*A[0][0]+A[1][1]*A[1][0],A[1][0]*A[0][1]+A[1][1]*A[1][1]]]; const t=A2[0][0]+A2[1][1]; return {type:'mat_sq_trace',answerType:'scalar',prompt:`Find tr(A²) where A = ${fm(A)}`,answer:String(t),display:String(t),data:{A}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'adj_det',answerType:'scalar',prompt:`Find det(adj(A)) where A = ${fm(A)} (hint: for 2x2, det(adj(A)) = det(A))`,answer:String(det),display:String(det),data:{A}}; },
    () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; const rank=(det!==0)?2:((A[0][0]!==0||A[0][1]!==0||A[1][0]!==0||A[1][1]!==0)?1:0); const nullity=2-rank; return {type:'nullity',answerType:'scalar',prompt:`Find the nullity of A = ${fm(A)}`,answer:String(nullity),display:String(nullity),data:{A}}; },
    () => { const x=ri(-5,5),y=ri(-5,5); const a1=ri(1,5),b1=ri(1,5),c1=a1*x+b1*y; let a2,b2,c2; do{a2=ri(1,5);b2=ri(1,5);}while(a1*b2===a2*b1); c2=a2*x+b2*y; const detD=a1*b2-a2*b1; const detDx=c1*b2-c2*b1; const xC=rnd2(detDx/detD); return {type:'cramer_x',answerType:'scalar',prompt:`Use Cramer's rule to find x: ${a1}x+${b1}y=${c1}, ${a2}x+${b2}y=${c2}`,answer:String(xC),display:String(xC),data:{a1,b1,c1,a2,b2,c2}}; },
    () => { const A=[[ri(-3,3),ri(-3,3)],[ri(-3,3),ri(-3,3)]]; const A2=[[A[0][0]*A[0][0]+A[0][1]*A[1][0],A[0][0]*A[0][1]+A[0][1]*A[1][1]],[A[1][0]*A[0][0]+A[1][1]*A[1][0],A[1][0]*A[0][1]+A[1][1]*A[1][1]]]; const A3=[[A2[0][0]*A[0][0]+A2[0][1]*A[1][0],A2[0][0]*A[0][1]+A2[0][1]*A[1][1]],[A2[1][0]*A[0][0]+A2[1][1]*A[1][0],A2[1][0]*A[0][1]+A2[1][1]*A[1][1]]]; const t=A3[0][0]+A3[1][1]; return {type:'mat_cube_trace',answerType:'scalar',prompt:`Find tr(A3) where A = ${fm(A)}`,answer:String(t),display:String(t),data:{A}}; },
  ];

  if (difficulty === 'easy') {
    q = pick(easyGens)();
  } else if (difficulty === 'medium') {
    q = pick(mediumGens)();
  } else {
    q = pick(hardGens)();
  }
  res.json({ id, difficulty, ...q });
});

app.post('/linearalgebra-api/check', (req, res) => {
  const { answer: expected, answerType, type, data } = req.body;
  const raw = (req.body.userAnswer || '').trim();
  const norm = (s) => s.replace(/\s+/g, '').replace(/−/g, '-').replace(/\u2212/g, '-');
  const n = norm(raw);
  let correct = false;

  if (answerType === 'scalar') {
    const userVal = parseFloat(n);
    const expVal = parseFloat(expected);
    correct = !isNaN(userVal) && Math.abs(userVal - expVal) < 0.5;
  } else if (answerType === 'vector') {
    const m = n.match(/\(?([-\d.]+),([-\d.]+)\)?/);
    const e = norm(expected).match(/\(?([-\d.]+),([-\d.]+)\)?/);
    correct = m && e && Math.abs(parseFloat(m[1])-parseFloat(e[1])) < 0.01 && Math.abs(parseFloat(m[2])-parseFloat(e[2])) < 0.01;
  } else if (answerType === 'matrix') {
    const parseMat = (s) => {
      const cleaned = s.replace(/[\[\]]/g, '');
      const rows = cleaned.split(';');
      if (rows.length !== 2) return null;
      const r0 = rows[0].split(',').map(Number);
      const r1 = rows[1].split(',').map(Number);
      if (r0.length !== 2 || r1.length !== 2 || r0.some(isNaN) || r1.some(isNaN)) return null;
      return [r0, r1];
    };
    const um = parseMat(n);
    const em = parseMat(norm(expected));
    correct = um && em && um[0][0]===em[0][0] && um[0][1]===em[0][1] && um[1][0]===em[1][0] && um[1][1]===em[1][1];
  }
  res.json({ correct, display: expected, message: correct ? 'Correct!' : 'Incorrect' });
});


const MQ = (() => {
  const ri = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fv = (...c) => '(' + c.join(', ') + ')';
  const fm2 = (m) => '[' + m[0][0] + ',' + m[0][1] + ';' + m[1][0] + ',' + m[1][1] + ']';
  const rnd2 = (x) => Math.round(x * 100) / 100;

  const missionGens = {
    // ═══ Module 1: Linear Relations ═══
    // Mission 1: Piggy Bank Detectives (direct proportion)
    1: {
      easy: [
        () => { const m=ri(2,5),x=ri(1,8); return {type:'m1_yval',answerType:'scalar',prompt:'If y = '+m+'x, what is y when x = '+x+'?',answer:String(m*x),display:String(m*x),data:{m,x}}; },
        () => { const m=ri(2,6); return {type:'m1_ratio',answerType:'scalar',prompt:'If y = '+m+'x, what is the ratio y:x?',answer:m+':1',display:m+':1',data:{m}}; },
        () => { const k=ri(2,5),b=ri(1,8),c=k*b; return {type:'m1_findk',answerType:'scalar',prompt:'A = '+c+' when B = '+b+'. If A = kB, find k.',answer:String(k),display:String(k),data:{k,b,c}}; },
      ],
      medium: [
        () => { const m=ri(2,5),x=ri(1,6); return {type:'m1_eval',answerType:'scalar',prompt:'Ram saves '+m+'x what Lakshman saves. If Lakshman saves '+x+', what does Ram save?',answer:String(m*x),display:String(m*x),data:{m,x}}; },
        () => { const m1=ri(2,4),m2=m1*ri(2,3); return {type:'m1_compare',answerType:'scalar',prompt:'Two proportional relationships: y='+m1+'x and y='+m2+'x. What is the ratio of their slopes?',answer:String(m2/m1),display:String(m2/m1),data:{m1,m2}}; },
        () => { const m=ri(2,5),x=ri(1,10); return {type:'m1_origin',answerType:'scalar',prompt:'For y = '+m+'x, what is y when x = 0? Does it pass through origin?',answer:'0',display:'0 (yes, origin)',data:{m,x}}; },
      ],
      hard: [
        () => { const m=ri(2,4),x1=ri(1,5),x2=x1+ri(1,3); const y1=m*x1,y2=m*x2; return {type:'m1_slope',answerType:'scalar',prompt:'Points ('+x1+','+y1+') and ('+x2+','+y2+') are from y='+m+'x. What is the slope?',answer:String(m),display:String(m),data:{m,x1,x2,y1,y2}}; },
        () => { const m=ri(2,5),b=ri(1,5); return {type:'m1_notprop',answerType:'scalar',prompt:'y = '+m+'x + '+b+' is NOT proportional. What value of b makes it proportional?',answer:'0',display:'0',data:{m,b}}; },
        () => { const a=ri(1,5),x=ri(1,5),y=a*x; return {type:'m1_inverse',answerType:'scalar',prompt:'If y = '+a+'x and y = '+y+', find x.',answer:String(x),display:String(x),data:{a,x,y}}; },
      ],
    },
    // Mission 2: Treasure Map (collinearity)
    2: {
      easy: [
        () => { const y1=ri(1,5); return {type:'m2_slope',answerType:'scalar',prompt:'Slope between (1,0) and (2,'+y1+')?',answer:String(y1),display:String(y1),data:{x1:2,y1}}; },
        () => { return {type:'m2_collinear',answerType:'scalar',prompt:'Are (2,1), (3,2), (4,3) collinear? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m2_next',answerType:'scalar',prompt:'Next point in pattern (2,1), (3,2), (4,3)?',answer:'(5,4)',display:'(5,4)',data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,3),b=ri(1,5); return {type:'m2_equation',answerType:'scalar',prompt:'Line through (2,1) and (3,2): what is y when x='+(a+5)+'?',answer:String(a+4),display:String(a+4),data:{a,b}}; },
        () => { const m=ri(1,4),x1=ri(1,3),y1=m*x1-1; return {type:'m2_slope2',answerType:'scalar',prompt:'Slope through ('+x1+','+y1+') and ('+(x1+1)+','+(y1+m)+')?',answer:String(m),display:String(m),data:{m,x1,y1}}; },
        () => { const x=ri(2,6); return {type:'m2_check',answerType:'scalar',prompt:'Is point ('+x+','+(x-1)+') on line y = x - 1? (1=yes,0=no)',answer:'1',display:'Yes',data:{x}}; },
      ],
      hard: [
        () => { const x1=ri(1,3),y1=ri(1,3),x2=x1+ri(1,3),y2=y1+ri(1,3); const x3=x2+ri(1,3),y3=y2+ri(1,3); const collinear=((y2-y1)*(x3-x2)===(y3-y2)*(x2-x1)); return {type:'m2_area',answerType:'scalar',prompt:'Area of triangle with vertices ('+x1+','+y1+'), ('+x2+','+y2+'), ('+x3+','+y3+')? (if collinear, 0)',answer:String(Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2)),display:String(Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2)),data:{x1,y1,x2,y2,x3,y3}}; },
        () => { const m=ri(1,4),x0=ri(2,4); const y0=m*(x0-1); const x3=x0+1,y3=m*x0; return {type:'m2_extend',answerType:'scalar',prompt:'Points (1,0), ('+x0+','+y0+'), ('+x3+','+y3+'). Slope?',answer:String(m),display:String(m),data:{m,x0,y0,x3,y3}}; },
        () => { const m=ri(2,5); return {type:'m2_perpslope',answerType:'scalar',prompt:'Line perpendicular to y = '+m+'x - 1 has slope?',answer:String(rnd2(-1/m)),display:String(rnd2(-1/m)),data:{m}}; },
      ],
    },
    // Mission 3: Darts at the Origin (y=ax through origin)
    3: {
      easy: [
        () => { const a=ri(1,8); return {type:'m3_through',answerType:'scalar',prompt:'Does y = '+a+'x pass through origin? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { const a=ri(1,5),x=ri(1,5); return {type:'m3_yval',answerType:'scalar',prompt:'y = '+a+'x. When x = '+x+', y = ?',answer:String(a*x),display:String(a*x),data:{a,x}}; },
        () => { return {type:'m3_not',answerType:'scalar',prompt:'Does y = 2x + 1 pass through origin? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,6); return {type:'m3_neg',answerType:'scalar',prompt:'Does y = -'+a+'x pass through origin? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { const a=ri(1,5),b=ri(-3,3); return {type:'m3_intercept',answerType:'scalar',prompt:'y = '+a+'x + '+b+' passes through origin only if b = ?',answer:'0',display:'0',data:{a,b}}; },
        () => { const a=ri(2,5); return {type:'m3_scalar',answerType:'scalar',prompt:'For y='+a+'x, is (3,'+(3*a)+') a scalar multiple of (1,'+a+')? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
      ],
      hard: [
        () => { const a1=ri(1,5),a2=ri(1,5); return {type:'m3_intersect',answerType:'scalar',prompt:'y='+a1+'x and y='+a2+'x intersect at which point?',answer:'(0,0)',display:'(0,0)',data:{a1,a2}}; },
        () => { const a=ri(1,5); return {type:'m3_proportional',answerType:'scalar',prompt:'y='+a+'x is proportional. What is the constant of proportionality?',answer:String(a),display:String(a),data:{a}}; },
        () => { const x=ri(1,5),a=ri(2,5); return {type:'m3_findx',answerType:'scalar',prompt:'On y='+a+'x, a point has y='+(a*x)+'. What is x?',answer:String(x),display:String(x),data:{a,x}}; },
      ],
    },
    // Mission 4: The Brick Wall (y=mx+b intercept)
    4: {
      easy: [
        () => { const m=ri(2,5),b=ri(1,8); return {type:'m4_yint',answerType:'scalar',prompt:'What is the y-intercept of y = '+m+'x + '+b+'?',answer:String(b),display:String(b),data:{m,b}}; },
        () => { const m=ri(2,4),b=ri(1,5); return {type:'m4_atzero',answerType:'scalar',prompt:'y = '+m+'x + '+b+'. What is y when x = 0?',answer:String(b),display:String(b),data:{m,b}}; },
        () => { const m=ri(1,5); return {type:'m4_shift',answerType:'scalar',prompt:'y = '+m+'x + 3 shifts the line y = '+m+'x up by how many units?',answer:'3',display:'3',data:{m}}; },
      ],
      medium: [
        () => { const m=ri(2,5),b=ri(1,5),x=ri(1,5); return {type:'m4_eval',answerType:'scalar',prompt:'y = '+m+'x + '+b+'. What is y when x = '+x+'?',answer:String(m*x+b),display:String(m*x+b),data:{m,b,x}}; },
        () => { const b=ri(1,6); return {type:'m4_cross',answerType:'scalar',prompt:'Where does y = 3x + '+b+' cross the y-axis?',answer:'(0,'+b+')',display:'(0,'+b+')',data:{b}}; },
        () => { const m=ri(2,5); return {type:'m4_noshift',answerType:'scalar',prompt:'y = '+m+'x + 0 passes through which special point?',answer:'(0,0)',display:'(0,0) - origin',data:{m}}; },
      ],
      hard: [
        () => { const m=ri(2,4),b1=ri(1,5),b2=b1+ri(1,4); return {type:'m4_parallel',answerType:'scalar',prompt:'y='+m+'x+'+b1+' and y='+m+'x+'+b2+' are parallel. Distance between intercepts?',answer:String(b2-b1),display:String(b2-b1),data:{m,b1,b2}}; },
        () => { const m=ri(1,4),x=ri(1,5); return {type:'m4_frompts',answerType:'scalar',prompt:'Line through (0,3) and ('+x+','+(m*x+3)+'). What is the slope?',answer:String(m),display:String(m),data:{m,x}}; },
        () => { const m1=ri(2,5),b=ri(1,5); return {type:'m4_compare',answerType:'scalar',prompt:'y='+m1+'x+'+b+' vs y='+m1+'x+'+(b+1)+'. How many units higher is the second line at any x?',answer:'1',display:'1',data:{m1,b}}; },
      ],
    },
    // Mission 5: Game Controller (slope & intercept sliders)
    5: {
      easy: [
        () => { const m=ri(1,6); return {type:'m5_steep',answerType:'scalar',prompt:'Which is steeper: y='+m+'x or y='+(m+2)+'x?',answer:String(m+2),display:'y='+(m+2)+'x',data:{m}}; },
        () => { const b=ri(-5,5); return {type:'m5_intercept',answerType:'scalar',prompt:'Setting a=0, b='+b+' gives horizontal line at y = ?',answer:String(b),display:String(b),data:{b}}; },
        () => { return {type:'m5_zero',answerType:'scalar',prompt:'a=0, b=0 gives y = ? What kind of line?',answer:'0',display:'0 (x-axis)',data:{}}; },
      ],
      medium: [
        () => { const m=ri(1,5),b=ri(-3,3),x=ri(1,5); return {type:'m5_both',answerType:'scalar',prompt:'Line: slope='+m+', intercept='+b+'. What is y at x='+x+'?',answer:String(m*x+b),display:String(m*x+b),data:{m,b,x}}; },
        () => { const m1=ri(1,5),m2=m1+2; return {type:'m5_angle',answerType:'scalar',prompt:'Slope '+m1+' vs slope '+m2+': which makes a larger angle with x-axis?',answer:String(m2),display:'slope '+m2,data:{m1,m2}}; },
        () => { const m=ri(1,5); return {type:'m5_negative',answerType:'scalar',prompt:'Negative slope means the line goes _____ as x increases.',answer:'down',display:'Down',data:{m}}; },
      ],
      hard: [
        () => { const m1=ri(1,4),m2=-1/m1; return {type:'m5_perp',answerType:'scalar',prompt:'Slope perpendicular to '+rnd2(m1)+' is '+rnd2(m2)+'? Product = ?',answer:'-1',display:'-1',data:{m1,m2}}; },
        () => { const m=ri(2,5),b=ri(1,5),x=ri(1,8); return {type:'m5_model',answerType:'scalar',prompt:'Taxi: base fare = '+b+', per km = '+m+'. Total for '+x+' km?',answer:String(m*x+b),display:String(m*x+b),data:{m,b,x}}; },
        () => { const m1=ri(1,4),b1=ri(-3,3),m2=ri(1,4),b2=ri(-3,3); return {type:'m5_intersect',answerType:'scalar',prompt:'y='+m1+'x+'+b1+' and y='+m2+'x+'+b2+' have different slopes. How many intersection points?',answer:'1',display:'1',data:{m1,b1,m2,b2}}; },
      ],
    },
    // ═══ Module 1: Systems & Functions ═══
    // Mission 6: Meeting Point (systems → matrix form)
    6: {
      easy: [
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m6_verify',answerType:'scalar',prompt:'Is x='+x+', y='+y+' a solution to x+y='+(x+y)+'? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y}}; },
        () => { return {type:'m6_count',answerType:'scalar',prompt:'How many unknowns in: 2x + 3y = 7?',answer:'2',display:'2',data:{}}; },
        () => { const x=ri(1,5); return {type:'m6_easy',answerType:'scalar',prompt:'2x = '+(2*x)+'. Find x.',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { const x=ri(-3,3),y=ri(-3,3); const a=ri(1,4),b=ri(1,4),c=a*x+b*y; return {type:'m6_solve',answerType:'scalar',prompt:'Solve: '+a+'x+'+b+'y='+c+' and x+y='+(x+y)+'. Find x.',answer:String(x),display:String(x),data:{a,b,c,x,y}}; },
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m6_matrix',answerType:'scalar',prompt:'For 2x+3y=7 and x+2y=5, the coefficient matrix is [[2,3],[1,2]]. What is its determinant?',answer:'1',display:'1',data:{x,y}}; },
        () => { return {type:'m6_unique',answerType:'scalar',prompt:'For a unique solution, the determinant of the coefficient matrix must be _____.',answer:'non-zero',display:'Non-zero',data:{}}; },
      ],
      hard: [
        () => { const x=ri(-3,3),y=ri(-3,3); const a1=ri(1,3),b1=ri(1,3),c1=a1*x+b1*y; let a2,b2,c2; do{a2=ri(1,3);b2=ri(1,3);}while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'m6_2x2',answerType:'scalar',prompt:'Solve: '+a1+'x+'+b1+'y='+c1+', '+a2+'x+'+b2+'y='+c2+'. Find x.',answer:String(x),display:String(x),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
        () => { const x=ri(-3,3),y=ri(-3,3); const a1=ri(1,3),b1=ri(1,3),c1=a1*x+b1*y; let a2,b2,c2; do{a2=ri(1,3);b2=ri(1,3);}while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'m6_2x2y',answerType:'scalar',prompt:'Solve: '+a1+'x+'+b1+'y='+c1+', '+a2+'x+'+b2+'y='+c2+'. Find y.',answer:String(y),display:String(y),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m6_det',answerType:'scalar',prompt:'det('+fm2(A)+') = '+det+'. Is det≠0?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
      ],
    },
    // Mission 7: Time Machine (invertible functions)
    7: {
      easy: [
        () => { const a=ri(2,5),x=ri(1,5); return {type:'m7_invert',answerType:'scalar',prompt:'f(x)='+a+'x. What is f^-1('+(a*x)+')?',answer:String(x),display:String(x),data:{a,x}}; },
        () => { const a=ri(1,5); return {type:'m7_oneone',answerType:'scalar',prompt:'f(x)='+a+'x+2. Is it one-to-one? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
        () => { const a=ri(2,5); return {type:'m7_formula',answerType:'scalar',prompt:'f(x)='+a+'x. f^-1(y) = y/',answer:String(a),display:'y/'+a,data:{a}}; },
      ],
      medium: [
        () => { const a=ri(1,5),b=ri(-5,5),x=ri(1,5); return {type:'m7_eval',answerType:'scalar',prompt:'f(x)='+a+'x+'+b+'. f('+x+')?',answer:String(a*x+b),display:String(a*x+b),data:{a,b,x}}; },
        () => { const a=ri(2,5),b=ri(1,5); return {type:'m7_inveq',answerType:'scalar',prompt:'f(x)='+a+'x+'+b+'. f^-1('+(a*3+b)+') = ?',answer:'3',display:'3',data:{a,b}}; },
        () => { const a=ri(1,5); return {type:'m7_injective',answerType:'scalar',prompt:'f(x)='+a+'x. Injective means every y-value maps to exactly ___ x-value(s).',answer:'1',display:'1',data:{a}}; },
      ],
      hard: [
        () => { const a=ri(1,4),b=ri(-3,3); return {type:'m7_invformula',answerType:'scalar',prompt:'f(x)='+a+'x+'+b+'. f^-1(y) = (y-'+b+')/',answer:String(a),display:'(y-'+b+')/'+a,data:{a,b}}; },
        () => { const a=ri(1,5); return {type:'m7_identity',answerType:'scalar',prompt:'f(f^-1(x)) = ? for invertible function f.',answer:'x',display:'x',data:{a}}; },
        () => { const a=ri(2,5),x=ri(1,5); return {type:'m7_comp',answerType:'scalar',prompt:'f(x)='+a+'x, g(x)=x/'+a+'. f(g('+x+'))?',answer:String(x),display:String(x),data:{a,x}}; },
      ],
    },
    // Mission 8: Parabola Slide (evaluate by tracing)
    8: {
      easy: [
        () => { const x=ri(1,5); return {type:'m8_square',answerType:'scalar',prompt:'f(x) = x^2. What is f('+x+')?',answer:String(x*x),display:String(x*x),data:{x}}; },
        () => { const a=ri(1,4),x=ri(1,4); return {type:'m8_quad',answerType:'scalar',prompt:'f(x) = x^2 - '+a+'. f('+x+')?',answer:String(x*x-a),display:String(x*x-a),data:{a,x}}; },
        () => { return {type:'m8_fzero',answerType:'scalar',prompt:'f(x) = x^2 - 9. What is f(3)?',answer:'0',display:'0',data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,5); return {type:'m8_invert',answerType:'scalar',prompt:'f(x)=x^2-'+a+'. Is it invertible over all reals? (1=yes,0=no)',answer:'0',display:'No',data:{a}}; },
        () => { const x=ri(1,5); return {type:'m8_two',answerType:'scalar',prompt:'f(x)=x^2. f('+x+') = f('+(-x)+'). Two inputs give same output. Invertible? (1=yes,0=no)',answer:'0',display:'No',data:{x}}; },
        () => { const a=ri(1,4); return {type:'m8_vertex',answerType:'scalar',prompt:'f(x)=x^2-'+a+'. Where is the vertex? x = ?',answer:'0',display:'0',data:{a}}; },
      ],
      hard: [
        () => { const a=ri(1,3),b=ri(1,5); return {type:'m8_factored',answerType:'scalar',prompt:'f(x)=x^2-'+a+'x+'+b+'. How many real roots does x^2-'+a+'x+'+b+'=0 have?',answer:String((a*a-4*b>=0)?((a*a-4*b>0)?2:1):0),display:String((a*a-4*b>=0)?((a*a-4*b>0)?2:1):0),data:{a,b}}; },
        () => { const x=ri(1,5); return {type:'m8_symmetry',answerType:'scalar',prompt:'f(x)=x^2. f(a)=f(-a) means f is symmetric about which axis?',answer:'y-axis',display:'y-axis',data:{x}}; },
        () => { const a=ri(1,4); return {type:'m8_restrict',answerType:'scalar',prompt:'f(x)=x^2-'+a+'. If restricted to x>=0, is it invertible? (1=yes,0=no)',answer:'1',display:'Yes',data:{a}}; },
      ],
    },
    // Mission 9: Hit the Target (inverse not a function)
    9: {
      easy: [
        () => { const x=ri(1,5); return {type:'m9_quad',answerType:'scalar',prompt:'Can x^2 = '+(x*x)+' have two solutions? (1=yes,0=no)',answer:'1',display:'Yes',data:{x}}; },
        () => { const a=ri(1,5); return {type:'m9_intersects',answerType:'scalar',prompt:'y=x^2 and y='+(a*a)+' intersect at how many points?',answer:'2',display:'2',data:{a}}; },
        () => { const x=ri(1,5); return {type:'m9_posneg',answerType:'scalar',prompt:'x^2='+(x*x)+'. Name one positive solution.',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { const x=ri(1,5); return {type:'m9_both',answerType:'scalar',prompt:'x^2='+(x*x)+'. What are the two solutions?',answer:x+' and '+(-x),display:x+' and '+(-x),data:{x}}; },
        () => { return {type:'m9_fail',answerType:'scalar',prompt:'Why does f(x)=x^2 fail the horizontal line test?',answer:'multiple x for same y',display:'Same y for +x and -x',data:{}}; },
        () => { const a=ri(1,4); return {type:'m9_real',answerType:'scalar',prompt:'x^2+'+a+'=0. How many real solutions?',answer:'0',display:'0',data:{a}}; },
      ],
      hard: [
        () => { const a=ri(2,4); return {type:'m9_formula',answerType:'scalar',prompt:'x^2-'+(a*a)+'=0. Positive solution x = ?',answer:String(a),display:String(a),data:{a}}; },
        () => { const a=ri(1,4); return {type:'m9_shifted',answerType:'scalar',prompt:'f(x)=(x-'+a+')^2. f('+(a+3)+') = ?',answer:String(9),display:'9',data:{a}}; },
        () => { const a=ri(1,3),b=ri(1,3); const d=a*a-4*b; return {type:'m9_discrim',answerType:'scalar',prompt:'x^2-'+a+'x+'+b+'=0. Discriminant = '+d+'. Roots?',answer:d>0?'2':d===0?'1':'0',display:d>0?'2 real':d===0?'1 repeated':'0 real',data:{a,b,d}}; },
      ],
    },
    // Mission 10: Roller Coaster (cubic equations)
    10: {
      easy: [
        () => { const x=ri(1,3); return {type:'m10_cubic',answerType:'scalar',prompt:'f(x) = x^3. What is f('+x+')?',answer:String(x*x*x),display:String(x*x*x),data:{x}}; },
        () => { return {type:'m10_degree',answerType:'scalar',prompt:'A cubic polynomial has maximum how many real roots?',answer:'3',display:'3',data:{}}; },
        () => { const x=ri(1,3); return {type:'m10_cube_root',answerType:'scalar',prompt:'x^3 = '+(x*x*x)+'. What is x?',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { return {type:'m10_onesol',answerType:'scalar',prompt:'How many real solutions does x^3 = 27 have?',answer:'1',display:'1',data:{}}; },
        () => { const a=ri(1,3); return {type:'m10_positive',answerType:'scalar',prompt:'x^3 = '+(a*a*a)+'. How many positive real solutions?',answer:'1',display:'1',data:{a}}; },
        () => { return {type:'m10_odd',answerType:'scalar',prompt:'Why does every odd-degree polynomial have at least one real root?',answer:'endpoints go opposite directions',display:'Opposite signs at ±∞',data:{}}; },
      ],
      hard: [
        () => { const x=ri(1,3); return {type:'m10_factor',answerType:'scalar',prompt:'x^3-'+x+'=0. Factor: x(x-1)(x+1)=0. How many real roots?',answer:'3',display:'3',data:{x}}; },
        () => { const a=ri(1,3); return {type:'m10_complex',answerType:'scalar',prompt:'x^3=1 has 1 real root. How many complex roots total?',answer:'3',display:'3',data:{a}}; },
        () => { const x=ri(1,3); return {type:'m10_sum',answerType:'scalar',prompt:'x^3=27. x^3-27=0. Factor: (x-3)(x^2+3x+9)=0. Number of real roots?',answer:'1',display:'1',data:{x}}; },
      ],
    },
    // ═══ Module 1: Dimensions ═══
    // Mission 11: Dimensional Portal (1D, 2D, 3D)
    11: {
      easy: [
        () => { return {type:'m11_r3',answerType:'scalar',prompt:'How many coordinates does a point in R^3 need?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m11_r2',answerType:'scalar',prompt:'Point on a plane needs how many coordinates?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m11_r1',answerType:'scalar',prompt:'Point on a line needs how many coordinates?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const v=[ri(1,5),ri(1,5),ri(1,5)]; return {type:'m11_vecdim',answerType:'scalar',prompt:'Vector '+fv(...v)+' lives in which space?',answer:'R^3',display:'R^3',data:{v}}; },
        () => { return {type:'m11_notation',answerType:'scalar',prompt:'What is the notation for 2D real coordinate plane?',answer:'R^2',display:'R^2',data:{}}; },
        () => { return {type:'m11_5d',answerType:'scalar',prompt:'A data point with 5 measurements lives in R^?',answer:'5',display:'R^5',data:{}}; },
      ],
      hard: [
        () => { const n=ri(2,6); return {type:'m11_nd',answerType:'scalar',prompt:'A vector in R^n has ___ components.',answer:String(n),display:String(n),data:{n}}; },
        () => { return {type:'m11_origin',answerType:'scalar',prompt:'The origin (0,0,0) is a _-dimensional object.',answer:'0',display:'0',data:{}}; },
        () => { const d=ri(1,5); return {type:'m11_span',answerType:'scalar',prompt:'Span of one vector in R^'+(d+1)+' is _-dimensional.',answer:'1',display:'1 (a line)',data:{d}}; },
      ],
    },
    // Mission 12: Transformation Machine (matrix as function)
    12: {
      easy: [
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m12_col1',answerType:'scalar',prompt:'If phi(1,0) = ('+a+','+b+'), what is the first column of the matrix?',answer:'('+a+','+b+')',display:'('+a+','+b+')',data:{a,b}}; },
        () => { const c=ri(1,5),d=ri(1,5); return {type:'m12_col2',answerType:'scalar',prompt:'If phi(0,1) = ('+c+','+d+'), what is the second column?',answer:'('+c+','+d+')',display:'('+c+','+d+')',data:{c,d}}; },
        () => { return {type:'m12_linear',answerType:'scalar',prompt:'A matrix transformation is always _____.',answer:'linear',display:'Linear',data:{}}; },
      ],
      medium: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; return {type:'m12_apply',answerType:'scalar',prompt:'Matrix '+fm2(A)+' applied to (1,0) gives?',answer:'('+A[0][0]+','+A[1][0]+')',display:'('+A[0][0]+','+A[1][0]+')',data:{A}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m12_det',answerType:'scalar',prompt:'det('+fm2(A)+') = ? If non-zero, transformation is _____.',answer:String(det),display:String(det),data:{A,det}}; },
        () => { return {type:'m12_cols',answerType:'scalar',prompt:'The columns of a transformation matrix are the images of _____.',answer:'basis vectors',display:'Basis vectors (1,0) and (0,1)',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const x=ri(1,3),y=ri(1,3); const r=[A[0][0]*x+A[0][1]*y,A[1][0]*x+A[1][1]*y]; return {type:'m12_comp',answerType:'scalar',prompt:'A='+fm2(A)+', v=('+x+','+y+'). Av = ?',answer:fv(...r),display:fv(...r),data:{A,x,y,r}}; },
        () => { return {type:'m12_2x2',answerType:'scalar',prompt:'A 2×2 matrix transforms how many dimensions?',answer:'2',display:'2',data:{}}; },
        () => { const A=[[1,0],[0,1]]; return {type:'m12_identity',answerType:'scalar',prompt:'Identity matrix I×v = ?',answer:'v',display:'v (unchanged)',data:{A}}; },
      ],
    },
    // Mission 13: Jigsaw Puzzle (determinant & invertibility)
    13: {
      easy: [
        () => { const a=ri(1,4),d=ri(1,4); const A=[[a,0],[0,d]]; return {type:'m13_detdiag',answerType:'scalar',prompt:'det([['+a+',0],[0,'+d+']])?',answer:String(a*d),display:String(a*d),data:{a,d}}; },
        () => { return {type:'m13_zero',answerType:'scalar',prompt:'det([[1,2],[2,4]]) = ? Is it invertible?',answer:'0',display:'0 (not invertible)',data:{}}; },
        () => { const a=ri(1,5),d=ri(1,5); return {type:'m13_prod',answerType:'scalar',prompt:'For diagonal matrix, det = product of ___?',answer:'diagonal entries',display:'Diagonal entries '+a+'×'+d+'='+String(a*d),data:{a,d}}; },
      ],
      medium: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_det',answerType:'scalar',prompt:'det('+fm2(A)+')?',answer:String(det),display:String(det),data:{A,det}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_invert',answerType:'scalar',prompt:'det(A)='+det+'. Invertible? (1=yes,0=no)',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m13_formula',answerType:'scalar',prompt:'For [[a,b],[c,d]], det = ?',answer:'ad-bc',display:'ad - bc',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,3),ri(1,3)],[ri(1,3),ri(1,3)]]; return {type:'m13_singular',answerType:'scalar',prompt:'det('+fm2(A)+')=0. Rank of A?',answer:'1',display:'1',data:{A}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_inverse_det',answerType:'scalar',prompt:'det(A)='+det+'. det(A^-1) = ?',answer:det!==0?String(rnd2(1/det)):'0',display:det!==0?String(rnd2(1/det)):'undefined',data:{A,det}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m13_connection',answerType:'scalar',prompt:'det(A)='+det+'. A is invertible?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
      ],
    },
    // Mission 14: The Vanishing Act (null space / kernel)
    14: {
      easy: [
        () => { return {type:'m14_det0',answerType:'scalar',prompt:'If det(A) = 0, what does that mean?',answer:'not invertible',display:'Not invertible',data:{}}; },
        () => { return {type:'m14_kernel',answerType:'scalar',prompt:'The set of vectors mapping to origin is called the _____.',answer:'null space',display:'Null space / Kernel',data:{}}; },
        () => { return {type:'m14_zero',answerType:'scalar',prompt:'Does the zero vector always belong to the null space? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { return {type:'m14_sing',answerType:'scalar',prompt:'A singular matrix maps some non-zero vectors to _____.',answer:'zero vector',display:'(0,0)',data:{}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m14_ns_dir',answerType:'scalar',prompt:'Null space direction of [[1,2],[2,4]]?',answer:'(-2,1)',display:'(-2,1)',data:{A}}; },
        () => { return {type:'m14_many',answerType:'scalar',prompt:'How many vectors map to origin for a singular matrix?',answer:'infinite',display:'Infinitely many',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,3); const A=[[a,a*2],[a*2,a*4]]; return {type:'m14_ns_calc',answerType:'scalar',prompt:'Null space of '+fm2(A)+' has dimension?',answer:'1',display:'1',data:{A}}; },
        () => { return {type:'m14_nsr',answerType:'scalar',prompt:'nullity + rank = ? (number of columns)',answer:String(2),display:String(2),data:{}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m14_verify',answerType:'scalar',prompt:'A=(-2,1) is in null space of [[1,2],[2,4]]. Check: first row dot A = ?',answer:'0',display:'0',data:{A}}; },
      ],
    },
    // ═══ Module 2: Matrix Applications ═══
    // Mission 15: Hill Cipher (encryption via matrices)
    15: {
      easy: [
        () => { return {type:'m15_mult',answerType:'scalar',prompt:'Hill cipher encrypts using matrix _____.',answer:'multiplication',display:'Multiplication',data:{}}; },
        () => { return {type:'m15_mod',answerType:'scalar',prompt:'Hill cipher uses arithmetic mod ___',answer:'26',display:'26',data:{}}; },
        () => { return {type:'m15_decrypt',answerType:'scalar',prompt:'To decrypt Hill cipher, multiply by matrix _____.',answer:'inverse',display:'Inverse',data:{}}; },
      ],
      medium: [
        () => { const A=[[1,2],[0,1]]; const v=[ri(1,5),ri(1,5)]; const r=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]; return {type:'m15_apply',answerType:'scalar',prompt:'Encrypt '+fv(...v)+' with '+fm2(A)+'. First component?',answer:String(r[0]),display:String(r[0]),data:{A,v,r}}; },
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m15_det',answerType:'scalar',prompt:'det('+fm2(A)+')='+det+'. Can we decrypt? (1=yes,0=no)',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m15_identity',answerType:'scalar',prompt:'Hill cipher with identity matrix changes the message? (1=yes,0=no)',answer:'0',display:'No change',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m15_hill_det',answerType:'scalar',prompt:'Hill cipher matrix '+fm2(A)+'. det='+det+'. Can decrypt?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m15_2x2',answerType:'scalar',prompt:'Basic Hill cipher uses ___x___ matrices.',answer:'2x2',display:'2×2',data:{}}; },
        () => { const A=[[2,3],[3,4]]; const v=[18,20]; const r=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]; return {type:'m15_encrypt',answerType:'scalar',prompt:'Encrypt (18,20) with [[2,3],[3,4]]. Second component?',answer:String(r[1]),display:String(r[1]),data:{A,v,r}}; },
      ],
    },
    // Mission 16: Baker's Cafe (overdetermined systems)
    16: {
      easy: [
        () => { const a=ri(1,4),b=ri(1,4); return {type:'m16_count',answerType:'scalar',prompt:'How many equations: '+a+'A + '+b+'C = 100, 2A + C = 50?',answer:'2',display:'2',data:{a,b}}; },
        () => { return {type:'m16_over',answerType:'scalar',prompt:'More equations than unknowns is called _____.',answer:'overdetermined',display:'Overdetermined',data:{}}; },
        () => { const x=ri(1,5); return {type:'m16_easy',answerType:'scalar',prompt:'2A = '+(2*x)+'. Find A.',answer:String(x),display:String(x),data:{x}}; },
      ],
      medium: [
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m16_solve',answerType:'scalar',prompt:'3A+1C='+(3*x+y)+' and 1A+2C='+(x+2*y)+'. Find A.',answer:String(x),display:String(x),data:{x,y}}; },
        () => { return {type:'m16_leastsq',answerType:'scalar',prompt:'Best approximation for overdetermined systems uses _____ method.',answer:'least squares',display:'Least squares',data:{}}; },
        () => { const x=ri(1,5),y=ri(1,5); return {type:'m16_verify',answerType:'scalar',prompt:'Is A='+x+', C='+y+' a solution to A+C='+(x+y)+' and 2A-C='+(2*x-y)+'? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y}}; },
      ],
      hard: [
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m16_atb',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. A^T is ___x___.',answer:'2x3',display:'2×3',data:{A}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; const AT=[[A[0][0],A[1][0],A[2][0]],[A[0][1],A[1][1],A[2][1]]]; const ATA=[[0,0],[0,0]]; for(let i=0;i<2;i++) for(let j=0;j<2;j++) for(let k=0;k<3;k++) ATA[i][j]+=AT[i][k]*A[k][j]; return {type:'m16_ata',answerType:'scalar',prompt:'A^TA for A=[[3,1],[1,2],[1,1]]. Entry (1,1)?',answer:String(ATA[0][0]),display:String(ATA[0][0]),data:{A,ATA}}; },
        () => { const x=ri(1,3),y=ri(1,3); return {type:'m16_overdet',answerType:'scalar',prompt:'System: A+C='+(x+y)+', 2A-C='+(2*x-y)+', 3A+2C='+(3*x+2*y)+'. 3 equations, 2 unknowns. Overdetermined?',answer:'1',display:'Yes',data:{x,y}}; },
      ],
    },
    // Mission 17: Markov Chain (state transitions)
    17: {
      easy: [
        () => { return {type:'m17_steady',answerType:'scalar',prompt:'Steady state means probabilities stop _____ after many steps.',answer:'changing',display:'Changing',data:{}}; },
        () => { return {type:'m17_matrix',answerType:'scalar',prompt:'A transition matrix maps current state to _____ state.',answer:'next',display:'Next',data:{}}; },
        () => { return {type:'m17_sum',answerType:'scalar',prompt:'Each row of a transition matrix must sum to _____.',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const P=[[0.7,0.3],[0.4,0.6]]; return {type:'m17_step',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]], start=[1,0]. State after 1 step, component 1?',answer:'0.7',display:'0.7',data:{P}}; },
        () => { return {type:'m17_steady_eq',answerType:'scalar',prompt:'Steady state π satisfies which equation?',answer:'πP=π',display:'πP = π',data:{}}; },
        () => { const P=[[0.8,0.2],[0.1,0.9]]; return {type:'m17_rows',answerType:'scalar',prompt:'P=[[0.8,0.2],[0.1,0.9]]. Row 1 sums to?',answer:'1',display:'1',data:{P}}; },
      ],
      hard: [
        () => { const P=[[0.7,0.3],[0.4,0.6]]; return {type:'m17_calc',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]]. π₁+π₂ = ?',answer:'1',display:'1',data:{P}}; },
        () => { return {type:'m17_eigen',answerType:'scalar',prompt:'Dominant eigenvalue of any Markov matrix?',answer:'1',display:'1',data:{}}; },
        () => { const P=[[0.7,0.3],[0.4,0.6]]; return {type:'m17_det',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]]. det(P) = ?',answer:String(rnd2(0.7*0.6-0.3*0.4)),display:String(rnd2(0.7*0.6-0.3*0.4)),data:{P}}; },
      ],
    },
    // Mission 18: Guess the Solution (overdetermined geometry)
    18: {
      easy: [
        () => { return {type:'m18_rows',answerType:'scalar',prompt:'Matrix [[3,1],[1,2],[1,1]] has how many rows?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m18_cols',answerType:'scalar',prompt:'Matrix [[3,1],[1,2],[1,1]] has how many columns?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m18_type',answerType:'scalar',prompt:'3 equations, 2 unknowns is _____determined.',answer:'over',display:'Over',data:{}}; },
      ],
      medium: [
        () => { return {type:'m18_exact',answerType:'scalar',prompt:'Can 3 equations with 2 unknowns have an exact solution? (1=yes,0=no)',answer:'1',display:'Yes (sometimes)',data:{}}; },
        () => { return {type:'m18_intersect',answerType:'scalar',prompt:'Two lines in a plane typically intersect at ___ point(s).',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m18_3lines',answerType:'scalar',prompt:'Three random lines in a plane usually meet at ___ point(s).',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { return {type:'m18_least',answerType:'scalar',prompt:'Minimize ||b-Ax||^2. This is called _____ squares.',answer:'least',display:'Least squares',data:{}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m18_transpose',answerType:'scalar',prompt:'For A=[[3,1],[1,2],[1,1]], A^T is ___x___.',answer:'2x3',display:'2×3',data:{A}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m18_ata_det',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. A^T A = [[11,6],[6,6]]. det(A^TA)?',answer:String(11*6-6*6),display:String(11*6-6*6),data:{A}}; },
      ],
    },
    // ═══ Module 2 (cont): Why No Solution? ═══
    // Mission 19: Why No Solution? (geometric view)
    19: {
      easy: [
        () => { return {type:'m19_intersect',answerType:'scalar',prompt:'Two non-parallel lines in a plane intersect at ___ point(s).',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m19_parallel',answerType:'scalar',prompt:'Two parallel lines intersect at ___ point(s).',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m19_three',answerType:'scalar',prompt:'Three lines through the same point are called _____.',answer:'concurrent',display:'Concurrent',data:{}}; },
      ],
      medium: [
        () => { return {type:'m19_unlikely',answerType:'scalar',prompt:'A 3rd random line is ___ likely to pass through the intersection of 2 lines.',answer:'unlikely',display:'Unlikely',data:{}}; },
        () => { return {type:'m19_geometric',answerType:'scalar',prompt:'An overdetermined system with no solution: the lines do not all _____.',answer:'intersect',display:'Intersect at one point',data:{}}; },
        () => { return {type:'m19_residual',answerType:'scalar',prompt:'The closest point to b in col(A) gives the minimum _____.',answer:'residual',display:'Residual',data:{}}; },
      ],
      hard: [
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m19_atb',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. A^T A is ___x___ matrix.',answer:'2x2',display:'2×2',data:{A}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; const ATA=[[11,6],[6,6]]; const det=ATA[0][0]*ATA[1][1]-ATA[0][1]*ATA[1][0]; return {type:'m19_ata_det',answerType:'scalar',prompt:'A^T A = [[11,6],[6,6]]. det(A^T A) = ?',answer:String(det),display:String(det),data:{A,ATA,det}}; },
        () => { const A=[[3,1],[1,2],[1,1]]; return {type:'m19_rows',answerType:'scalar',prompt:'A=[[3,1],[1,2],[1,1]]. Rows of A^T = columns of A. How many rows in A^T?',answer:'2',display:'2',data:{A}}; },
      ],
    },
    // ═══ Module 2: Markov Chains ═══
    // Mission 20: Mood Markov Chain (2-state)
    20: {
      easy: [
        () => { return {type:'m20_prob',answerType:'scalar',prompt:'Transition probabilities must be between 0 and _____.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m20_rows',answerType:'scalar',prompt:'Each row of a transition matrix sums to _____.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m20_state',answerType:'scalar',prompt:'A 2-state Markov chain has a ___x___ transition matrix.',answer:'2x2',display:'2x2',data:{}}; },
      ],
      medium: [
        () => { const P=[[0.6,0.4],[0.3,0.7]]; return {type:'m20_step',answerType:'scalar',prompt:'P=[[0.6,0.4],[0.3,0.7]], start=[1,0]. Happy after 1 step?',answer:'0.6',display:'0.6',data:{P}}; },
        () => { return {type:'m20_steady',answerType:'scalar',prompt:'Steady state means πP = _____.',answer:'π',display:'π',data:{}}; },
        () => { return {type:'m20_indep',answerType:'scalar',prompt:'Does steady state depend on initial state? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      hard: [
        () => { const P=[[0.6,0.4],[0.3,0.7]]; return {type:'m20_det',answerType:'scalar',prompt:'P=[[0.6,0.4],[0.3,0.7]]. det(P) = ?',answer:String(rnd2(0.6*0.7-0.4*0.3)),display:String(rnd2(0.6*0.7-0.4*0.3)),data:{P}}; },
        () => { return {type:'m20_multi',answerType:'scalar',prompt:'Can a Markov chain have multiple steady states? (1=yes,0=no)',answer:'0',display:'No (if irreducible)',data:{}}; },
        () => { return {type:'m20_eigen',answerType:'scalar',prompt:'Steady state is the eigenvector of P with eigenvalue _____.',answer:'1',display:'1',data:{}}; },
      ],
    },
    // Mission 21: 3-State Location Chain
    21: {
      easy: [
        () => { return {type:'m21_states',answerType:'scalar',prompt:'A 3-state chain has a ___x___ transition matrix.',answer:'3x3',display:'3x3',data:{}}; },
        () => { return {type:'m21_equations',answerType:'scalar',prompt:'How many equations to find steady state of 3-state chain?',answer:'3',display:'3 (plus normalization)',data:{}}; },
        () => { return {type:'m21_norm',answerType:'scalar',prompt:'π₁ + π₂ + π₃ = ?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { return {type:'m21_power',answerType:'scalar',prompt:'Can repeated matrix multiplication find steady state? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m21_indep2',answerType:'scalar',prompt:'Does steady state of 3-state chain depend on starting state? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
        () => { const P=[[0.5,0.3,0.2],[0.1,0.6,0.3],[0.2,0.2,0.6]]; return {type:'m21_sum',answerType:'scalar',prompt:'P=[[0.5,0.3,0.2],[0.1,0.6,0.3],[0.2,0.2,0.6]]. Row 1 sums to?',answer:'1',display:'1',data:{P}}; },
      ],
      hard: [
        () => { return {type:'m21_equations',answerType:'scalar',prompt:'πP=π gives ___ independent equations for a 3-state chain.',answer:'3',display:'3',data:{}}; },
        () => { const P=[[0.5,0.3,0.2],[0.1,0.6,0.3],[0.2,0.2,0.6]]; return {type:'m21_row_sum',answerType:'scalar',prompt:'P 3×3 Markov. Row 2 sums to?',answer:'1',display:'1',data:{P}}; },
        () => { return {type:'m21_converge',answerType:'scalar',prompt:'Regular Markov chain reaches _____ state after many steps.',answer:'steady',display:'Steady',data:{}}; },
      ],
    },
    // ═══ Module 3: Spaces & Transformations ═══
    // Mission 22: Perpendicular Vectors 2D (dot product)
    22: {
      easy: [
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m22_dot',answerType:'scalar',prompt:'Dot product of ('+a+',0) and (0,'+b+')?',answer:'0',display:'0',data:{a,b}}; },
        () => { return {type:'m22_perp',answerType:'scalar',prompt:'Dot product of perpendicular vectors = ?',answer:'0',display:'0',data:{}}; },
        () => { const a=ri(1,5); return {type:'m22_self',answerType:'scalar',prompt:'Dot product of ('+a+','+a+') with itself?',answer:String(2*a*a),display:String(2*a*a),data:{a}}; },
      ],
      medium: [
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m22_eq',answerType:'scalar',prompt:'For ('+a+','+b+')·(x,y)=0, what equation describes perpendicular vectors?',answer:a+'x+'+b+'y=0',display:a+'x+'+b+'y=0',data:{a,b}}; },
        () => { const u=[ri(1,4),ri(1,4)],v=[-u[1],u[0]]; return {type:'m22_perpvec',answerType:'scalar',prompt:'A vector perpendicular to '+fv(...u)+' is '+fv(...v)+'? Check dot product.',answer:'0',display:'0 (perpendicular)',data:{u,v}}; },
        () => { return {type:'m22_zero',answerType:'scalar',prompt:'Is the zero vector perpendicular to every vector? (1=yes,0=no)',answer:'1',display:'Yes (trivially)',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,4),b=ri(1,4),c=ri(1,4),d=ri(1,4); return {type:'m22_check',answerType:'scalar',prompt:'('+a+','+b+')·('+c+','+d+') = ? Are they perpendicular?',answer:String(a*c+b*d),display:String(a*c+b*d),data:{a,b,c,d}}; },
        () => { const a=ri(1,5),b=ri(1,5); return {type:'m22_dim',answerType:'scalar',prompt:'In R^2, how many linearly independent vectors are perp to ('+a+','+b+')?',answer:'1',display:'1',data:{a,b}}; },
        () => { const u=[ri(1,3),ri(1,3)],v=[ri(1,3),ri(1,3)]; return {type:'m22_angle',answerType:'scalar',prompt:'('+u[0]+','+u[1]+')·('+v[0]+','+v[1]+') = '+String(u[0]*v[0]+u[1]*v[1])+'. Perpendicular? (1=yes,0=no)',answer:(u[0]*v[0]+u[1]*v[1]===0)?'1':'0',display:(u[0]*v[0]+u[1]*v[1]===0)?'Yes':'No',data:{u,v}}; },
      ],
    },
    // Mission 23: 3D Perpendicular & Lines
    23: {
      easy: [
        () => { return {type:'m23_plane',answerType:'scalar',prompt:'x+2y+3z=0 defines a _____ through origin in R^3.',answer:'plane',display:'Plane',data:{}}; },
        () => { return {type:'m23_3d',answerType:'scalar',prompt:'Point in R^3 needs ___ coordinates.',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m23_check',answerType:'scalar',prompt:'Does (2,7,3) satisfy x+2y+3z=0? 2+14+9=25. (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      medium: [
        () => { return {type:'m23_line',answerType:'scalar',prompt:'How many equations to define a line (not plane) in R^3?',answer:'2',display:'2',data:{}}; },
        () => { const a=ri(1,3),b=ri(1,3),c=ri(1,3); return {type:'m23_normal',answerType:'scalar',prompt:'Plane x+'+a+'y+'+b+'z=0 has normal vector?',answer:'(1,'+a+','+b+')',display:'(1,'+a+','+b+')',data:{a,b,c}}; },
        () => { return {type:'m23_perp2',answerType:'scalar',prompt:'A plane in R^3 is _____-dimensional.',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,3),b=ri(1,3),c=ri(1,3),d=ri(1,3),e=ri(1,3),f=ri(1,3); return {type:'m23_3dot',answerType:'scalar',prompt:'('+a+','+b+','+c+')·('+d+','+e+','+f+') = ?',answer:String(a*d+b*e+c*f),display:String(a*d+b*e+c*f),data:{a,b,c,d,e,f}}; },
        () => { const x=ri(1,3),y=ri(1,3),z=ri(1,3); return {type:'m23_check2',answerType:'scalar',prompt:'Does ('+x+','+y+','+z+') satisfy x+2y+3z='+(x+2*y+3*z)+'? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y,z}}; },
        () => { return {type:'m23_3planes',answerType:'scalar',prompt:'3 planes in R^3: each equation removes ___ dimension.',answer:'1',display:'1',data:{}}; },
      ],
    },
    // Mission 24: Span & Null Space (perp set of plane in 3D)
    24: {
      easy: [
        () => { return {type:'m24_free',answerType:'scalar',prompt:'2 equations, 3 unknowns: how many free variables?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m24_null',answerType:'scalar',prompt:'The null space is also called the _____.',answer:'kernel',display:'Kernel',data:{}}; },
        () => { return {type:'m24_perp',answerType:'scalar',prompt:'Null space is perpendicular to which space?',answer:'row space',display:'Row space',data:{}}; },
      ],
      medium: [
        () => { return {type:'m24_direction',answerType:'scalar',prompt:'Null space of a 2-equation system in R^3 is a _____-dimensional object.',answer:'1',display:'1 (a line)',data:{}}; },
        () => { const v=[ri(1,3),ri(1,3),ri(1,3)]; return {type:'m24_span',answerType:'scalar',prompt:'Span of '+fv(...v)+' in R^3 is a _____.',answer:'line',display:'Line',data:{v}}; },
        () => { return {type:'m24_plane',answerType:'scalar',prompt:'Span of 2 independent vectors in R^3 is a _____.',answer:'plane',display:'Plane',data:{}}; },
      ],
      hard: [
        () => { return {type:'m24_rn',answerType:'scalar',prompt:'rank + nullity = number of _____.',answer:'columns',display:'Columns',data:{}}; },
        () => { const r=ri(1,3); return {type:'m24_null_check',answerType:'scalar',prompt:'3 columns, rank '+r+'. Nullity = ?',answer:String(3-r),display:String(3-r),data:{r}}; },
        () => { const r=ri(1,3); return {type:'m24_dim',answerType:'scalar',prompt:'rank '+r+' in R^3. Null space is ___-dimensional.',answer:String(3-r),display:String(3-r)+'D',data:{r}}; },
      ],
    },
    // Mission 25: Matrix Null Space (3x3 singular)
    25: {
      easy: [
        () => { return {type:'m25_rank',answerType:'scalar',prompt:'Rank of [[1,2,3],[4,5,6],[7,8,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m25_sing',answerType:'scalar',prompt:'A 3x3 matrix with rank < 3 is _____.',answer:'singular',display:'Singular',data:{}}; },
        () => { return {type:'m25_det',answerType:'scalar',prompt:'det([[1,2,3],[4,5,6],[7,8,9]]) = ?',answer:'0',display:'0',data:{}}; },
      ],
      medium: [
        () => { return {type:'m25_ns_dir',answerType:'scalar',prompt:'Null space direction of [[1,2,3],[4,5,6],[7,8,9]]?',answer:'(1,-2,1)',display:'(1,-2,1)',data:{}}; },
        () => { return {type:'m25_nullity',answerType:'scalar',prompt:'Rank=2, n=3. Nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m25_perp',answerType:'scalar',prompt:'Null space is perpendicular to every row of the matrix? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { return {type:'m25_check',answerType:'scalar',prompt:'(1,2,3)·(1,-2,1) = 1-4+3 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m25_rank_null',answerType:'scalar',prompt:'3x3 rank-2: nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { const r=ri(1,3); return {type:'m25_null_dim',answerType:'scalar',prompt:'3 columns, rank '+r+'. Null space dim = ?',answer:String(3-r),display:String(3-r),data:{r}}; },
      ],
    },
    // Mission 26: Three Subspaces (row, column, null)
    26: {
      easy: [
        () => { const A=[[1,2,3],[4,5,6],[7,8,9]]; return {type:'m26_rank',answerType:'scalar',prompt:'Rank of '+fm2(A)+'... actually this is 3x3. Rank of [[1,2,3],[4,5,6],[7,8,9]]?',answer:'2',display:'2',data:{A}}; },
        () => { return {type:'m26_dim_row',answerType:'scalar',prompt:'Dimension of row space = _____.',answer:'rank',display:'Rank',data:{}}; },
        () => { return {type:'m26_dim_col',answerType:'scalar',prompt:'Dimension of column space = _____.',answer:'rank',display:'Rank',data:{}}; },
      ],
      medium: [
        () => { return {type:'m26_span',answerType:'scalar',prompt:'Row space and null space together span the entire _____.',answer:'input space',display:'Input space (R^n)',data:{}}; },
        () => { return {type:'m26_orthogonal',answerType:'scalar',prompt:'Row space is _____ to null space.',answer:'perpendicular',display:'Perpendicular (orthogonal)',data:{}}; },
        () => { return {type:'m26_dim_sum',answerType:'scalar',prompt:'dim(row space) + dim(null space) = number of _____.',answer:'columns',display:'Columns',data:{}}; },
      ],
      hard: [
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m26_det',answerType:'scalar',prompt:'det('+fm2(A)+') = '+det+'. Rank?',answer:det!==0?'2':'1',display:det!==0?'2':'1',data:{A,det}}; },
        () => { const r=ri(1,3),n=ri(1,3); return {type:'m26_sum',answerType:'scalar',prompt:'rank='+r+', nullity='+n+'. Number of columns = ?',answer:String(r+n),display:String(r+n),data:{r,n}}; },
        () => { return {type:'m26_dim',answerType:'scalar',prompt:'For 2×3 matrix rank 2: row space is ___D, null space is ___D.',answer:'2 and 1',display:'2D and 1D',data:{}}; },
      ],
    },
    // Mission 27: Collapsing Dimension (singular matrix effect)
    27: {
      easy: [
        () => { return {type:'m27_det',answerType:'scalar',prompt:'det([[1,2],[2,4]]) = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m27_rank',answerType:'scalar',prompt:'Rank of [[1,2],[2,4]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m27_collapse',answerType:'scalar',prompt:'A rank-1 matrix collapses 2D to ___D.',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const B=[[1,2],[2,4]]; const x=ri(1,5),y=ri(1,5); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m27_apply',answerType:'scalar',prompt:'Apply B=[[1,2],[2,4]] to ('+x+','+y+'). Result?',answer:fv(...r),display:fv(...r),data:{B,x,y,r}}; },
        () => { return {type:'m27_parallel',answerType:'scalar',prompt:'Does B=[[1,2],[2,4]] map distinct parallel lines to distinct points? (1=yes,0=no)',answer:'0',display:'No - they collapse to same point',data:{}}; },
        () => { return {type:'m27_null_dir',answerType:'scalar',prompt:'Null space direction of [[1,2],[2,4]]?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
      ],
      hard: [
        () => { const k=ri(1,6); return {type:'m27_line_k',answerType:'scalar',prompt:'All points on 2y+x='+k+' map to a single point under B=[[1,2],[2,4]]. What is that point?',answer:'('+k+','+(2*k)+')',display:'('+k+','+(2*k)+')',data:{k}}; },
        () => { const B=[[1,2],[2,4]]; const v=[ri(1,3),ri(1,3)]; const r=[B[0][0]*v[0]+B[0][1]*v[1],B[1][0]*v[0]+B[1][1]*v[1]]; return {type:'m27_result',answerType:'scalar',prompt:'B·('+v[0]+','+v[1]+') = ? where B=[[1,2],[2,4]]',answer:fv(...r),display:fv(...r),data:{B,v,r}}; },
        () => { return {type:'m27_dim_in_out',answerType:'scalar',prompt:'Rank-1 in 2D: 1D input line → ___D output point.',answer:'0',display:'0D (a point)',data:{}}; },
      ],
    },
    // Mission 28: Span Plot 3D (visualize span)
    28: {
      easy: [
        () => { return {type:'m28_plane',answerType:'scalar',prompt:'How many independent vectors span a plane in R^3?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m28_origin',answerType:'scalar',prompt:'Does the origin always belong to any span? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { const v=[ri(1,3),ri(1,3),ri(1,3)]; return {type:'m28_one',answerType:'scalar',prompt:'Span of '+fv(...v)+' in R^3 is a _____.',answer:'line',display:'Line',data:{v}}; },
      ],
      medium: [
        () => { return {type:'m28_scalar',answerType:'scalar',prompt:'If two vectors in R^3 are scalar multiples, their span is a _____.',answer:'line',display:'Line',data:{}}; },
        () => { return {type:'m28_indep',answerType:'scalar',prompt:'2 independent vectors in R^3 span a _____.',answer:'plane',display:'Plane',data:{}}; },
        () => { return {type:'m28_r3',answerType:'scalar',prompt:'To span all of R^3, you need at least ___ independent vectors.',answer:'3',display:'3',data:{}}; },
      ],
      hard: [
        () => { const a=ri(1,3),b=ri(1,3); return {type:'m28_dim_check',answerType:'scalar',prompt:'Span of '+a+' vectors in R^'+b+'. Max possible dim?',answer:String(Math.min(a,b)),display:String(Math.min(a,b)),data:{a,b}}; },
        () => { return {type:'m28_3vec',answerType:'scalar',prompt:'3 linearly independent vectors in R^3 span a ___-D object.',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m28_dim_dep',answerType:'scalar',prompt:'If 3 vectors in R^3 are dependent, span dim < ?',answer:'3',display:'3',data:{}}; },
      ],
    },
    // Mission 29: Perpendicular to Plane (null space in 3D)
    29: {
      easy: [
        () => { return {type:'m29_intersect',answerType:'scalar',prompt:'Two planes in R^3 typically intersect in a _____.',answer:'line',display:'Line',data:{}}; },
        () => { return {type:'m29_null',answerType:'scalar',prompt:'The null space is _____ to the plane it derives from.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
        () => { return {type:'m29_3d',answerType:'scalar',prompt:'A plane in R^3 is defined by how many linear equations?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const a=ri(1,3),b=ri(1,3),c=ri(1,3); return {type:'m29_normal',answerType:'scalar',prompt:'Plane: '+a+'x+'+b+'y+'+c+'z=0. Normal direction?',answer:'('+a+','+b+','+c+')',display:'('+a+','+b+','+c+')',data:{a,b,c}}; },
        () => { return {type:'m29_ns_line',answerType:'scalar',prompt:'Null space of a 2-equation system in R^3 is a _____.',answer:'line',display:'Line',data:{}}; },
        () => { return {type:'m29_perp',answerType:'scalar',prompt:'Is null space perpendicular to every vector in the plane? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { return {type:'m29_dim',answerType:'scalar',prompt:'2 equations, 3 unknowns, rank 2. Null space dim = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m29_rank_null',answerType:'scalar',prompt:'3 unknowns, nullity 1. Rank = ?',answer:'2',display:'2',data:{}}; },
        () => { const u=[ri(1,3),ri(1,3),ri(1,3)],v=[ri(1,3),ri(1,3),ri(1,3)]; const cp=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; return {type:'m29_cross',answerType:'scalar',prompt:'('+u.join(',')+')×('+v.join(',')+') first component?',answer:String(cp[0]),display:String(cp[0]),data:{u,v,cp}}; },
      ],
    },
    // Mission 30: Null Space Again (different 3x3 singular)
    30: {
      easy: [
        () => { return {type:'m30_det',answerType:'scalar',prompt:'det([[1,4,7],[2,5,8],[3,6,9]]) = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m30_rank',answerType:'scalar',prompt:'Rank of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m30_ns',answerType:'scalar',prompt:'Null space direction of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'(1,-2,1)',display:'(1,-2,1)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m30_nullity',answerType:'scalar',prompt:'3×3 matrix rank 2. Nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m30_dep',answerType:'scalar',prompt:'Row3 - 2×Row2 + Row1 = 0 means rows are _____.',answer:'linearly dependent',display:'Linearly dependent',data:{}}; },
        () => { return {type:'m30_check',answerType:'scalar',prompt:'Check: (1,4,7)·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { const A=[[1,4,7],[2,5,8],[3,6,9]]; return {type:'m30_perp',answerType:'scalar',prompt:'Row (1,4,7)·null (1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{A}}; },
        () => { return {type:'m30_indep',answerType:'scalar',prompt:'Row space of [[1,4,7],[2,5,8],[3,6,9]] is spanned by how many vectors?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m30_sum',answerType:'scalar',prompt:'rank + nullity = 2 + 1 = 3 = number of _____.',answer:'columns',display:'Columns',data:{}}; },
      ],
    },
    // Mission 31: Three Spaces Again (Row, Column, Null of A)
    31: {
      easy: [
        () => { return {type:'m31_rank',answerType:'scalar',prompt:'Rank of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m31_nullity',answerType:'scalar',prompt:'Nullity of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m31_same',answerType:'scalar',prompt:'dim(row space) = dim(column space) = ?',answer:'rank',display:'Rank = 2',data:{}}; },
      ],
      medium: [
        () => { return {type:'m31_dim_row',answerType:'scalar',prompt:'Row space of a 3×3 rank-2 matrix is a ___-dimensional subspace of R^3.',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m31_dim_null',answerType:'scalar',prompt:'Null space is ___-dimensional for 3×3 rank-2.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m31_col',answerType:'scalar',prompt:'Column space of a 3×3 rank-2 matrix is a ___-dimensional subspace of R^3.',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { const r=ri(1,3),n=ri(1,3); return {type:'m31_rank_null',answerType:'scalar',prompt:'dim(R)='+r+', dim(N)='+n+'. Number of columns = ?',answer:String(r+n),display:String(r+n),data:{r,n}}; },
        () => { return {type:'m31_count',answerType:'scalar',prompt:'How many fundamental subspaces does every matrix have?',answer:'4',display:'4',data:{}}; },
        () => { const A=[[ri(1,3),ri(1,3)],[ri(1,3),ri(1,3)]]; return {type:'m31_dim_check',answerType:'scalar',prompt:'A 2×2 rank-1 matrix: dim(R)=1, dim(C)=1, dim(N)=1, dim(N^T)=1. Sum input?',answer:'2',display:'2 (R+N)',data:{A}}; },
      ],
    },
    // Mission 32: Check Orthogonality (Fundamental Theorem)
    32: {
      easy: [
        () => { return {type:'m32_dot1',answerType:'scalar',prompt:'(1,4,7)·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m32_perp',answerType:'scalar',prompt:'If dot(r,n) = 0, then r and n are _____.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
        () => { return {type:'m32_theorem',answerType:'scalar',prompt:'The Fundamental Theorem says row space is _____ to null space.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
      ],
      medium: [
        () => { return {type:'m32_check2',answerType:'scalar',prompt:'(4,5,6)·(1,-2,1) = 4-10+6 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m32_all',answerType:'scalar',prompt:'Every row of A has dot product 0 with every null space vector? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m32_why',answerType:'scalar',prompt:'Why? Because Ax=0 means each row·x = _____.',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { return {type:'m32_dot',answerType:'scalar',prompt:'(7,8,9)·(1,-2,1) = 7-16+9 = ?',answer:'0',display:'0',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m32_sum',answerType:'scalar',prompt:n+'×'+n+' rank '+r+'. dim(R)+dim(N) = '+r+'+'+(n-r)+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { const m=ri(3,5),n=ri(3,5),r=ri(1,Math.min(m,n)); return {type:'m32_sum2',answerType:'scalar',prompt:m+'×'+n+' rank '+r+'. dim(C)+dim(N^T) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{m,n,r}}; },
      ],
    },
    // ═══ Module 3 (cont): Collapse series ═══
    // Mission 33: Line to Point (collapse)
    33: {
      easy: [
        () => { return {type:'m33_det',answerType:'scalar',prompt:'det([[1,2],[2,4]]) = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m33_line',answerType:'scalar',prompt:'All points on 2y+x=4 map to one point under B=[[1,2],[2,4]]. What point?',answer:'(4,8)',display:'(4,8)',data:{}}; },
        () => { return {type:'m33_nonsing',answerType:'scalar',prompt:'Does a non-singular matrix collapse lines? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
      ],
      medium: [
        () => { const B=[[1,2],[2,4]]; return {type:'m33_apply',answerType:'scalar',prompt:'B·(0,2) = ? (point on line 2y+x=4)',answer:'(4,8)',display:'(4,8)',data:{B}}; },
        () => { return {type:'m33_all_same',answerType:'scalar',prompt:'Why do ALL points on 2y+x=4 map to (4,8)?',answer:'null space direction is on the line',display:'Line is parallel to null space',data:{}}; },
        () => { return {type:'m33_range',answerType:'scalar',prompt:'The output (4,8) lies in the _____ of B.',answer:'range',display:'Range',data:{}}; },
      ],
      hard: [
        () => { const k=ri(1,5); const pts=[[k,0],[0,k/2]]; return {type:'m33_intercept',answerType:'scalar',prompt:'Line 2y+x='+k+'. x-intercept + y-intercept = ?',answer:String(k+Math.round(k/2*100)/100),display:String(k+k/2),data:{k}}; },
        () => { const B=[[1,2],[2,4]]; const x=ri(1,3),y=ri(1,3); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m33_apply',answerType:'scalar',prompt:'B=[[1,2],[2,4]], ('+x+','+y+'). Bv = ?',answer:fv(...r),display:fv(...r),data:{B,x,y,r}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m33_rank',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. Rank = ?',answer:'1',display:'1',data:{B}}; },
      ],
    },
    // Mission 34: Many Lines Collapse
    34: {
      easy: [
        () => { return {type:'m34_k10',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. Line 2y+x=10 maps to which point?',answer:'(10,20)',display:'(10,20)',data:{}}; },
        () => { return {type:'m34_k62',answerType:'scalar',prompt:'Line 2y+x=62 maps to which point under B=[[1,2],[2,4]]?',answer:'(62,124)',display:'(62,124)',data:{}}; },
        () => { return {type:'m34_diff',answerType:'scalar',prompt:'Do different k values give different output points? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const k=ri(1,10); return {type:'m34_formula',answerType:'scalar',prompt:'Line 2y+x='+k+' maps to point?',answer:'('+k+','+(2*k)+')',display:'('+k+','+(2*k)+')',data:{k}}; },
        () => { return {type:'m34_pattern',answerType:'scalar',prompt:'Pattern: k maps to (k, 2k). What is the range direction?',answer:'(1,2)',display:'(1,2)',data:{}}; },
        () => { return {type:'m34_parallel',answerType:'scalar',prompt:'Each parallel line maps to a _____ output point.',answer:'different',display:'Different',data:{}}; },
      ],
      hard: [
        () => { const B=[[1,2],[2,4]]; const x=ri(1,3),y=ri(1,3); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m34_apply',answerType:'scalar',prompt:'B=[[1,2],[2,4]], v=('+x+','+y+'). Bv = ?',answer:fv(...r),display:fv(...r),data:{B,x,y,r}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m34_rank',answerType:'scalar',prompt:'Range of B=[[1,2],[2,4]]: dim = ?',answer:'1',display:'1',data:{B}}; },
        () => { const x=ri(1,3),y=ri(1,3); return {type:'m34_check',answerType:'scalar',prompt:'(1,2)·('+x+','+y+') = '+(x+2*y)+'. Is this in range? (1=yes,0=no)',answer:'1',display:'Yes',data:{x,y}}; },
      ],
    },
    // Mission 35: General Collapse Formula
    35: {
      easy: [
        () => { return {type:'m35_ns',answerType:'scalar',prompt:'Null space direction of [[1,2],[2,4]]?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m35_range',answerType:'scalar',prompt:'Range direction of [[1,2],[2,4]]?',answer:'(1,2)',display:'(1,2)',data:{}}; },
        () => { return {type:'m35_perp',answerType:'scalar',prompt:'Are null space and range perpendicular? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const k=ri(1,8); return {type:'m35_formula',answerType:'scalar',prompt:'B maps 2y+x='+k+' to which point?',answer:'('+k+','+(2*k)+')',display:'('+k+','+(2*k)+')',data:{k}}; },
        () => { return {type:'m35_ns_range',answerType:'scalar',prompt:'(-2,1)·(1,2) = -2+2 = ? Confirms perpendicularity.',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m35_collapse',answerType:'scalar',prompt:'General formula: B maps 2y+x=k to (k, ___).',answer:String(2),display:'2k',data:{}}; },
      ],
      hard: [
        () => { const B=[[1,2],[2,4]]; const x=ri(1,5),y=ri(1,5); const r=[B[0][0]*x+B[0][1]*y,B[1][0]*x+B[1][1]*y]; return {type:'m35_output',answerType:'scalar',prompt:'B=[[1,2],[2,4]], v=('+x+','+y+'). Second component of Bv?',answer:String(r[1]),display:String(r[1]),data:{B,x,y,r}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m35_rank1',answerType:'scalar',prompt:'B=[[1,2],[2,4]] has rank = ?',answer:'1',display:'1',data:{B}}; },
        () => { const B=[[1,2],[2,4]]; return {type:'m35_det',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. det(B) = ?',answer:'0',display:'0',data:{B}}; },
      ],
    },
    // Mission 36: Dimension Collapse (2D → 1D)
    36: {
      easy: [
        () => { return {type:'m36_rank',answerType:'scalar',prompt:'Rank of [[1,2],[2,4]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m36_nullity',answerType:'scalar',prompt:'Nullity of [[1,2],[2,4]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m36_sum',answerType:'scalar',prompt:'rank + nullity = 1 + 1 = ?',answer:'2',display:'2 (number of columns)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m36_ftoc',answerType:'scalar',prompt:'rank + nullity always equals number of _____.',answer:'columns',display:'Columns',data:{}}; },
        () => { return {type:'m36_dim_in',answerType:'scalar',prompt:'2D input, rank 1. How many dimensions lost?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m36_dim_out',answerType:'scalar',prompt:'2D input, rank 1. Output is ___-dimensional.',answer:'1',display:'1',data:{}}; },
      ],
      hard: [
        () => { const n=ri(2,5),r=ri(1,n-1); return {type:'m36_general',answerType:'scalar',prompt:n+'×'+n+' matrix, rank '+r+'. Nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
        () => { return {type:'m36_identity',answerType:'scalar',prompt:'Identity 2×2: rank=2, nullity=0. Dimensions lost?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m36_zero',answerType:'scalar',prompt:'Zero 2×2 matrix: rank=0, nullity=2. Dimensions lost?',answer:'2',display:'2 (all collapsed)',data:{}}; },
      ],
    },
    // ═══ Module 4: Fundamental Theorem ═══
    // Mission 37: Four Subspaces Intro (rank-1 visual)
    37: {
      easy: [
        () => { return {type:'m37_rank',answerType:'scalar',prompt:'Rank of [[1,2],[3,6]]?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m37_row_dir',answerType:'scalar',prompt:'Row space direction of [[1,2],[3,6]]?',answer:'(1,2)',display:'(1,2)',data:{}}; },
        () => { return {type:'m37_col_dir',answerType:'scalar',prompt:'Column space direction of [[1,2],[3,6]]?',answer:'(1,3)',display:'(1,3)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m37_null_dir',answerType:'scalar',prompt:'Null space direction of [[1,2],[3,6]]?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m37_all_1d',answerType:'scalar',prompt:'For rank-1 2×2 matrix, are all 3 subspaces 1D lines? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m37_dim_sum',answerType:'scalar',prompt:'dim(row) + dim(null) = 1 + 1 = ?',answer:'2',display:'2 (columns)',data:{}}; },
      ],
      hard: [
        () => { return {type:'m37_verify',answerType:'scalar',prompt:'(1,2)·(-2,1) = -2+2 = ?. Row ⊥ null confirmed.',answer:'0',display:'0',data:{}}; },
        () => { const A=[[ri(1,4),ri(0,3)],[ri(0,3),ri(1,4)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'m37_det_check',answerType:'scalar',prompt:'det('+fm2(A)+')='+det+'. Is this matrix rank-2?',answer:det!==0?'1':'0',display:det!==0?'Yes':'No',data:{A,det}}; },
        () => { return {type:'m37_dim_check',answerType:'scalar',prompt:'For [[1,2],[3,6]]: rank=1, nullity=1. Sum = ?',answer:'2',display:'2 (number of columns)',data:{}}; },
      ],
    },
    // Mission 38: Row Space perp Null Space (verify)
    38: {
      easy: [
        () => { return {type:'m38_dot',answerType:'scalar',prompt:'(1,3)·(-3,1) = -3+3 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m38_perp',answerType:'scalar',prompt:'R(M) and N(M) are always _____ subspaces.',answer:'perpendicular',display:'Perpendicular',data:{}}; },
        () => { return {type:'m38_zero',answerType:'scalar',prompt:'Is zero vector in both R(M) and N(M)? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const M=[[1,2],[3,6]]; return {type:'m38_row',answerType:'scalar',prompt:'Row space of M=[[1,2],[3,6]] is span of?',answer:'(1,2)',display:'(1,2)',data:{M}}; },
        () => { return {type:'m38_null',answerType:'scalar',prompt:'Null space of M=[[1,2],[3,6]] is span of?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m38_sum',answerType:'scalar',prompt:'dim(R) + dim(N) = 1 + 1 = number of _____',answer:'columns',display:'Columns = 2',data:{}}; },
      ],
      hard: [
        () => { const M=[[1,2],[3,6]]; const x=ri(1,3),y=ri(1,3); const row=M[0]; return {type:'m38_verify_any',answerType:'scalar',prompt:'Row (1,2)·('+x+',-'+(2*x)+') = '+x+'+'+(-2*x)+' = ?',answer:'0',display:'0',data:{x,M}}; },
        () => { const n=ri(2,5),r=ri(1,n); return {type:'m38_sum_check',answerType:'scalar',prompt:n+'×'+n+' matrix rank '+r+'. dim(R)+dim(N) = '+r+'+'+(n-r)+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { return {type:'m38_which',answerType:'scalar',prompt:'Row space ⊥ null space lives in R^___ for 3×3 matrix.',answer:'3',display:'3 (input space)',data:{}}; },
      ],
    },
    // Mission 39: Null Space of M and M^T
    39: {
      easy: [
        () => { return {type:'m39_nm',answerType:'scalar',prompt:'N(M) for M=[[1,2],[3,6]] is span of?',answer:'(-2,1)',display:'(-2,1)',data:{}}; },
        () => { return {type:'m39_nmt',answerType:'scalar',prompt:'N(M^T) for M=[[1,2],[3,6]] is span of?',answer:'(-3,1)',display:'(-3,1)',data:{}}; },
        () => { return {type:'m39_diff',answerType:'scalar',prompt:'N(M) and N(M^T) live in _____ spaces.',answer:'different',display:'Different (R^n vs R^m)',data:{}}; },
      ],
      medium: [
        () => { return {type:'m39_perp_cm',answerType:'scalar',prompt:'N(M^T) is perpendicular to which space?',answer:'column space',display:'Column space C(M)',data:{}}; },
        () => { return {type:'m39_dim_nm',answerType:'scalar',prompt:'dim(N(M)) for 2×2 rank-1 matrix?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m39_dim_nmt',answerType:'scalar',prompt:'dim(N(M^T)) for 2×2 rank-1 matrix?',answer:'1',display:'1',data:{}}; },
      ],
      hard: [
        () => { const M=[[1,2],[3,6]]; const c=[M[0][0],M[1][0]]; const n=[-3,1]; return {type:'m39_verify',answerType:'scalar',prompt:'Column (1,3)·(-3,1) = '+(-3)+'+'+3+' = ?',answer:'0',display:'0 (column ⊥ left null)',data:{M,c,n}}; },
        () => { const n=ri(2,5),r=ri(1,n); const m=ri(2,5); return {type:'m39_dim_check',answerType:'scalar',prompt:n+'×'+m+' matrix rank '+r+'. dim(N^T)+dim(C) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{n,m,r}}; },
        () => { return {type:'m39_dim_nm',answerType:'scalar',prompt:'dim(N(M)) for 3×3 rank-1 matrix?',answer:'2',display:'2',data:{}}; },
      ],
    },
    // Mission 40: Orthogonal Subspaces (verify all pairs)
    40: {
      easy: [
        () => { return {type:'m40_c_perp',answerType:'scalar',prompt:'C(M) is perpendicular to _____.',answer:'N(M^T)',display:'N(M^T)',data:{}}; },
        () => { return {type:'m40_r_perp',answerType:'scalar',prompt:'R(M) is perpendicular to _____.',answer:'N(M)',display:'N(M)',data:{}}; },
        () => { return {type:'m40_pairs',answerType:'scalar',prompt:'How many orthogonal pairs do the 4 subspaces form?',answer:'2',display:'2',data:{}}; },
      ],
      medium: [
        () => { return {type:'m40_input',answerType:'scalar',prompt:'R(A) and N(A) both live in the _____ space.',answer:'input',display:'Input space R^n',data:{}}; },
        () => { return {type:'m40_output',answerType:'scalar',prompt:'C(A) and N(A^T) both live in the _____ space.',answer:'output',display:'Output space R^m',data:{}}; },
        () => { return {type:'m40_four',answerType:'scalar',prompt:'Name all 4 fundamental subspaces.',answer:'R(A),N(A),C(A),N(A^T)',display:'Row, Null, Col, Left Null',data:{}}; },
      ],
      hard: [
        () => { const m=ri(2,4),n=ri(2,4),r=ri(1,Math.min(m,n)); return {type:'m40_dim_check',answerType:'scalar',prompt:m+'×'+n+' matrix rank '+r+'. dim(R)+dim(N) = '+(n-r)+'+'+r+' = ?',answer:String(n),display:String(n),data:{m,n,r}}; },
        () => { const m=ri(2,4),n=ri(2,4),r=ri(1,Math.min(m,n)); return {type:'m40_dim_check2',answerType:'scalar',prompt:m+'×'+n+' matrix rank '+r+'. dim(C)+dim(N^T) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{m,n,r}}; },
        () => { const A=[[ri(1,3),ri(0,2)],[ri(0,2),ri(1,3)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; const r=det!==0?2:1; return {type:'m40_dim_sum',answerType:'scalar',prompt:'Rank-'+r+' 2×2 matrix: dim(R)+dim(N) = '+r+'+'+(2-r)+' = ?',answer:'2',display:'2',data:{A,r}}; },
      ],
    },
    // Mission 41: All Four of A (3×3 rank-2)
    41: {
      easy: [
        () => { return {type:'m41_rank',answerType:'scalar',prompt:'Rank of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m41_ns',answerType:'scalar',prompt:'N(A) direction of [[1,4,7],[2,5,8],[3,6,9]]?',answer:'(1,-2,1)',display:'(1,-2,1)',data:{}}; },
        () => { return {type:'m41_dim_r',answerType:'scalar',prompt:'dim(R(A)) for rank-2 3×3 matrix?',answer:'2',display:'2',data:{}}; },
      ],
      medium: [
        () => { return {type:'m41_subspaces',answerType:'scalar',prompt:'For 3×3 rank-2: R(A) is ___D, N(A) is ___D.',answer:'2 and 1',display:'2D and 1D',data:{}}; },
        () => { return {type:'m41_col',answerType:'scalar',prompt:'C(A) for rank-2 3×3 is a ___-dimensional plane in R^3.',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m41_lns',answerType:'scalar',prompt:'N(A^T) for rank-2 3×3 is ___-dimensional.',answer:'1',display:'1',data:{}}; },
      ],
      hard: [
        () => { return {type:'m41_types',answerType:'scalar',prompt:'3×3 rank-2: R=2D, N=1D. C=2D, N^T=1D. dim(R)+dim(N)=?',answer:'3',display:'3',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m41_sum',answerType:'scalar',prompt:n+'×'+n+' rank '+r+'. dim(R)+dim(N) = '+r+'+'+(n-r)+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { return {type:'m41_verify',answerType:'scalar',prompt:'(1,4,7)·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
      ],
    },
    // Mission 42: Rank by Example (4×4 matrices)
    42: {
      easy: [
        () => { return {type:'m42_i4',answerType:'scalar',prompt:'Rank of 4×4 identity matrix?',answer:'4',display:'4',data:{}}; },
        () => { return {type:'m42_zero',answerType:'scalar',prompt:'Rank of 4×4 zero matrix?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m42_max',answerType:'scalar',prompt:'Maximum rank of 4×4 matrix?',answer:'4',display:'4',data:{}}; },
      ],
      medium: [
        () => { const r=ri(0,4); return {type:'m42_range',answerType:'scalar',prompt:'Rank of a matrix equals the dimension of its _____.',answer:'range',display:'Range (column space)',data:{r}}; },
        () => { return {type:'m42_rank1',answerType:'scalar',prompt:'Rank-1 4×4 matrix: column space is ___-dimensional.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m42_rank2',answerType:'scalar',prompt:'Rank-2 4×4 matrix: nullity = ?',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { const r=ri(1,4); return {type:'m42_nullity',answerType:'scalar',prompt:'4×4 matrix rank '+r+'. Nullity = ?',answer:String(4-r),display:String(4-r),data:{r}}; },
        () => { return {type:'m42_rank3',answerType:'scalar',prompt:'Rank-3 4×4: R(A) is ___D, N(A) is ___D.',answer:'3 and 1',display:'3D and 1D',data:{}}; },
        () => { return {type:'m42_equiv',answerType:'scalar',prompt:'rank(A) = rank(A^T)? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
    },
    // Mission 43: Range Contains Line
    43: {
      easy: [
        () => { return {type:'m43_line',answerType:'scalar',prompt:'If v is in range of A, is 5v also in range? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m43_subspace',answerType:'scalar',prompt:'The range of a linear map is always a _____.',answer:'subspace',display:'Subspace',data:{}}; },
        () => { return {type:'m43_closed',answerType:'scalar',prompt:'A subspace must be closed under addition and _____.',answer:'scaling',display:'Scaling',data:{}}; },
      ],
      medium: [
        () => { return {type:'m43_prop',answerType:'scalar',prompt:'Which property guarantees A(ax) = aA(x)?',answer:'linearity',display:'Linearity (homogeneity)',data:{}}; },
        () => { return {type:'m43_line_in',answerType:'scalar',prompt:'If v is in range, the entire line tv (for all t) is in _____.',answer:'range',display:'Range',data:{}}; },
        () => { return {type:'m43_zero',answerType:'scalar',prompt:'Zero vector is always in the range of a linear map? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { const A=[[1,0],[0,1]]; return {type:'m43_rank',answerType:'scalar',prompt:'Rank of identity I_2 = ?. dim(range)?',answer:'2',display:'2',data:{A}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m43_rank_check',answerType:'scalar',prompt:'Range of [[1,2],[2,4]]: dimension = ?',answer:'1',display:'1',data:{A}}; },
        () => { return {type:'m43_prop',answerType:'scalar',prompt:'Which property: A(x+y) = A(x)+A(y)?',answer:'additivity',display:'Additivity',data:{}}; },
      ],
    },
    // Mission 44: Range Contains Span
    44: {
      easy: [
        () => { return {type:'m44_add',answerType:'scalar',prompt:'If v,w are in range of A, is v+w in range? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m44_span2',answerType:'scalar',prompt:'Span of 2 linearly independent vectors in R^3 is a _____.',answer:'plane',display:'Plane',data:{}}; },
        () => { return {type:'m44_closure',answerType:'scalar',prompt:'Range is closed under both addition and _____.',answer:'scaling',display:'Scaling',data:{}}; },
      ],
      medium: [
        () => { return {type:'m44_prop',answerType:'scalar',prompt:'Which property: A(x+y) = A(x)+A(y)?',answer:'additivity',display:'Additivity',data:{}}; },
        () => { return {type:'m44_span_range',answerType:'scalar',prompt:'The span of vectors in the range is also in the _____.',answer:'range',display:'Range',data:{}}; },
        () => { return {type:'m44_col',answerType:'scalar',prompt:'The range equals the _____ space of A.',answer:'column',display:'Column space',data:{}}; },
      ],
      hard: [
        () => { const A=[[1,2],[3,4]]; return {type:'m44_dim',answerType:'scalar',prompt:'Rank of '+fm2(A)+' = ?. dim(range)?',answer:'2',display:'2',data:{A}}; },
        () => { const A=[[1,2],[2,4]]; return {type:'m44_dim_range',answerType:'scalar',prompt:'Range of [[1,2],[2,4]] is a ___-dimensional object.',answer:'1',display:'1 (a line)',data:{A}}; },
        () => { return {type:'m44_sub',answerType:'scalar',prompt:'The range of a 3×2 matrix is a subspace of R^___',answer:'3',display:'3 (output space)',data:{}}; },
      ],
    },
    // Mission 45: Dimension Observation
    45: {
      easy: [
        () => { return {type:'m45_dep',answerType:'scalar',prompt:'Are (1,2,3) and (2,4,6) linearly independent? (1=yes,0=no)',answer:'0',display:'No (scalar multiples)',data:{}}; },
        () => { return {type:'m45_indep',answerType:'scalar',prompt:'Are (1,0,0) and (0,1,0) linearly independent? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m45_dim_dep',answerType:'scalar',prompt:'Span of 2 dependent vectors has dimension = ?',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { return {type:'m45_span',answerType:'scalar',prompt:'(1,2,3) and (2,4,6) span a ___-dimensional object.',answer:'1',display:'1 (a line)',data:{}}; },
        () => { return {type:'m45_indep2',answerType:'scalar',prompt:'(1,0,0) and (0,1,0) span a ___-dimensional object.',answer:'2',display:'2 (a plane)',data:{}}; },
        () => { return {type:'m45_dim',answerType:'scalar',prompt:'Dimension of span = number of _____ vectors.',answer:'linearly independent',display:'Linearly independent',data:{}}; },
      ],
      hard: [
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m45_rank',answerType:'scalar',prompt:n+' vectors in R^'+n+', '+r+' independent. dim(span) = ?',answer:String(r),display:String(r),data:{n,r}}; },
        () => { return {type:'m45_three',answerType:'scalar',prompt:'(1,0,0),(0,1,0),(0,0,1) span R^3. dim = ?',answer:'3',display:'3',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n-1); return {type:'m45_nullity',answerType:'scalar',prompt:n+' vectors in R^'+n+', dim(span)='+r+'. Nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
      ],
    },
    // ═══ Module 5: Capstone Review ═══
    // Mission 46: The Big Picture (complete map)
    46: {
      easy: [
        () => { return {type:'m46_rn',answerType:'scalar',prompt:'R(A) and N(A) live in R^___',answer:'n',display:'n (input space)',data:{}}; },
        () => { return {type:'m46_cm',answerType:'scalar',prompt:'C(A) and N(A^T) live in R^___',answer:'m',display:'m (output space)',data:{}}; },
        () => { return {type:'m46_four',answerType:'scalar',prompt:'A matrix defines how many fundamental subspaces?',answer:'4',display:'4',data:{}}; },
      ],
      medium: [
        () => { return {type:'m46_rn_span',answerType:'scalar',prompt:'Do R(A) and N(A) together span all of R^n? (1=yes,0=no)',answer:'1',display:'Yes (direct sum)',data:{}}; },
        () => { return {type:'m46_perp_pairs',answerType:'scalar',prompt:'Name the two orthogonal pairs.',answer:'R⊥N and C⊥N^T',display:'R(A)⊥N(A) and C(A)⊥N(A^T)',data:{}}; },
        () => { return {type:'m46_dims',answerType:'scalar',prompt:'dim(R)+dim(N) = n. dim(C)+dim(N^T) = ___',answer:'m',display:'m',data:{}}; },
      ],
      hard: [
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m46_calc',answerType:'scalar',prompt:n+'×'+n+' matrix rank '+r+'. dim(R)= '+r+', dim(N)= '+(n-r)+'. Sum?',answer:String(n),display:String(n),data:{n,r}}; },
        () => { const m=ri(2,4),n=ri(2,4),r=ri(1,Math.min(m,n)); return {type:'m46_calc2',answerType:'scalar',prompt:m+'×'+n+' matrix rank '+r+'. dim(C)+dim(N^T) = '+(m-r)+'+'+r+' = ?',answer:String(m),display:String(m),data:{m,n,r}}; },
        () => { return {type:'m46_zero',answerType:'scalar',prompt:'If rank=n (full rank), nullity = ?',answer:'0',display:'0',data:{}}; },
      ],
    },
    // Mission 47: Orthogonality Checkup
    47: {
      easy: [
        () => { return {type:'m47_dot1',answerType:'scalar',prompt:'(1,4,7)·(1,-2,1) = 1-8+7 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m47_dot2',answerType:'scalar',prompt:'(4,5,6)·(1,-2,1) = 4-10+6 = ?',answer:'0',display:'0',data:{}}; },
        () => { return {type:'m47_confirm',answerType:'scalar',prompt:'Both dot products = 0 confirms row space ⊥ _____.',answer:'null space',display:'Null space',data:{}}; },
      ],
      medium: [
        () => { return {type:'m47_always',answerType:'scalar',prompt:'Are these two orthogonal pairs always true for any matrix? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m47_rows',answerType:'scalar',prompt:'The rows of A are vectors in R^___',answer:'n',display:'n',data:{}}; },
        () => { return {type:'m47_null',answerType:'scalar',prompt:'The null space vectors satisfy Ax=0, meaning each row·x = _____.',answer:'0',display:'0',data:{}}; },
      ],
      hard: [
        () => { return {type:'m47_dim_check',answerType:'scalar',prompt:'3×3 rank-2: dim(R)=2, dim(N)=1. Sum = ?',answer:'3',display:'3 (columns)',data:{}}; },
        () => { return {type:'m47_dim_check2',answerType:'scalar',prompt:'3×3 rank-2: dim(C)=2, dim(N^T)=1. Sum = ?',answer:'3',display:'3 (rows)',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m47_check',answerType:'scalar',prompt:n+'×'+n+' rank '+r+'. Verify: dim(R)+dim(N) = '+(n-r)+'+'+r+' = ?',answer:String(n),display:String(n),data:{n,r}}; },
      ],
    },
    // Mission 48: Rank-Nullity Review
    48: {
      easy: [
        () => { return {type:'m48_fn',answerType:'scalar',prompt:'rank + nullity = number of _____',answer:'columns',display:'Columns (n)',data:{}}; },
        () => { return {type:'m48_b',answerType:'scalar',prompt:'B=[[1,2],[2,4]]. rank=1, nullity=1. rank+nullity=?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m48_check',answerType:'scalar',prompt:'Does rank+nullity always equal number of columns? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { const n=ri(2,5),r=ri(1,n); return {type:'m48_calc',answerType:'scalar',prompt:n+'×'+n+' matrix, rank='+r+'. Nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
        () => { return {type:'m48_rank2',answerType:'scalar',prompt:'4×4 matrix, rank=2. nullity=___',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m48_rank0',answerType:'scalar',prompt:'n×n zero matrix: rank=0, nullity=___',answer:String(ri(2,5)),display:'n',data:{}}; },
      ],
      hard: [
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m48_calc',answerType:'scalar',prompt:n+'×'+n+' matrix rank '+r+'. nullity = ?',answer:String(n-r),display:String(n-r),data:{n,r}}; },
        () => { const n=ri(3,5); return {type:'m48_full',answerType:'scalar',prompt:n+'×'+n+' full rank. nullity = ?',answer:'0',display:'0',data:{n}}; },
        () => { return {type:'m48_zero',answerType:'scalar',prompt:'3×3 zero matrix: rank=0, nullity = ?',answer:'3',display:'3',data:{}}; },
      ],
    },
    // Mission 49: Capstone Challenge
    49: {
      easy: [
        () => { return {type:'m49_rank',answerType:'scalar',prompt:'Rank of a 3×2 matrix with all rows collinear?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m49_rm',answerType:'scalar',prompt:'R(M) for 3×2 rank-1 lives in R^___',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m49_cm',answerType:'scalar',prompt:'C(M) for 3×2 rank-1 is a line in R^___',answer:'3',display:'3',data:{}}; },
      ],
      medium: [
        () => { return {type:'m49_dim_r',answerType:'scalar',prompt:'dim(R(M)) + dim(N(M)) = number of columns = ?',answer:'2',display:'2',data:{}}; },
        () => { return {type:'m49_dim_c',answerType:'scalar',prompt:'dim(C(M)) + dim(N(M^T)) = number of rows = ?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m49_subspaces',answerType:'scalar',prompt:'For 3×2 rank-1: R is 1D, N is 1D, C is 1D, N^T is ___D.',answer:'2',display:'2',data:{}}; },
      ],
      hard: [
        () => { return {type:'m49_perp1',answerType:'scalar',prompt:'R(M) ⊥ N(M): 1D line ⊥ 1D line in R^2. They fill R^2? (1=yes,0=no)',answer:'1',display:'Yes (direct sum)',data:{}}; },
        () => { return {type:'m49_perp2',answerType:'scalar',prompt:'C(M) ⊥ N(M^T): 1D ⊥ 2D in R^3. They fill R^3? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
        () => { return {type:'m49_summary',answerType:'scalar',prompt:'All 4 subspaces are either 1D lines or ___-dimensional.',answer:'2',display:'2',data:{}}; },
      ],
    },
    // Mission 50: Wisdom Achieved (summary)
    50: {
      easy: [
        () => { return {type:'m50_four',answerType:'scalar',prompt:'How many fundamental subspaces does a matrix define?',answer:'4',display:'4',data:{}}; },
        () => { return {type:'m50_rank',answerType:'scalar',prompt:'dim(C(A)) = _____.',answer:'rank',display:'Rank',data:{}}; },
        () => { return {type:'m50_done',answerType:'scalar',prompt:'Have you achieved Linear Algebra wisdom? (1=yes,0=no)',answer:'1',display:'Yes!',data:{}}; },
      ],
      medium: [
        () => { return {type:'m50_pairs',answerType:'scalar',prompt:'Name the two orthogonal complement pairs.',answer:'R⊥N, C⊥N^T',display:'R(A)⊥N(A) and C(A)⊥N(A^T)',data:{}}; },
        () => { return {type:'m50_ftn',answerType:'scalar',prompt:'rank + nullity = n is the _____ Theorem.',answer:'Rank-Nullity',display:'Rank-Nullity',data:{}}; },
        () => { return {type:'m50_direct',answerType:'scalar',prompt:'R ⊕ N = R^n means they form a _____ sum.',answer:'direct',display:'Direct sum',data:{}}; },
      ],
      hard: [
        () => { return {type:'m50_rank_nullity',answerType:'scalar',prompt:'3×3 matrix rank 2. nullity = ?',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m50_dim_check',answerType:'scalar',prompt:'4×4 matrix rank 3. dim(N) = ?',answer:'1',display:'1',data:{}}; },
        () => { const n=ri(3,5),r=ri(1,n); return {type:'m50_all_dims',answerType:'scalar',prompt:n+'×'+n+' rank '+r+': dim(R)='+r+', dim(N)='+(n-r)+', dim(C)='+r+', dim(N^T)='+(n-r)+'. Input dims?',answer:String(n),display:String(n),data:{n,r}}; },
      ],
    },
    // ═══ Module 6: Real-World Applications ═══
    // Mission 51: User-Item Matrix (recommendations)
    51: {
      easy: [
        () => { return {type:'m51_maxrank',answerType:'scalar',prompt:'Max rank of a 3×4 matrix?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m51_rank',answerType:'scalar',prompt:'Rank measures how many _____ patterns exist in data.',answer:'independent',display:'Independent',data:{}}; },
        () => { return {type:'m51_lowrank',answerType:'scalar',prompt:'Low rank means many users have _____ preferences.',answer:'similar',display:'Similar',data:{}}; },
      ],
      medium: [
        () => { return {type:'m51_users',answerType:'scalar',prompt:'If rank < num users, what does that mean about user preferences?',answer:'correlated',display:'Correlated / similar patterns',data:{}}; },
        () => { return {type:'m51_factor',answerType:'scalar',prompt:'Low-rank approximation is the basis of matrix _____.',answer:'factorization',display:'Factorization',data:{}}; },
        () => { return {type:'m51_compress',answerType:'scalar',prompt:'A 1000×5000 rating matrix with rank 10 can be compressed significantly? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      hard: [
        () => { const m=ri(2,5),n=ri(2,5); return {type:'m51_maxrank',answerType:'scalar',prompt:m+'×'+n+' rating matrix. Max rank?',answer:String(Math.min(m,n)),display:String(Math.min(m,n)),data:{m,n}}; },
        () => { const r=ri(1,3),m=ri(r+1,r+3),n=ri(r+1,r+3); const full=m*n; const low=r*(m+n); return {type:'m51_compress',answerType:'scalar',prompt:m+'×'+n+' rank-'+r+'. Full storage='+full+', low-rank='+low+'. Saved?',answer:String(full-low),display:String(full-low)+' entries',data:{m,n,r,full,low}}; },
        () => { return {type:'m51_rank_low',answerType:'scalar',prompt:'100×500 matrix rank 5. Elements = 50000. Low-rank needs ___ params.',answer:String(5*(100+500)),display:String(5*(100+500)),data:{}}; },
      ],
    },
    // Mission 52: Collaborative Filtering
    52: {
      easy: [
        () => { return {type:'m52_dot',answerType:'scalar',prompt:'Dot product measures _____ between two vectors.',answer:'similarity',display:'Similarity',data:{}}; },
        () => { return {type:'m52_zero',answerType:'scalar',prompt:'If dot(u,v)=0, are users similar? (1=yes,0=no)',answer:'0',display:'No',data:{}}; },
        () => { return {type:'m52_method',answerType:'scalar',prompt:'Collaborative filtering recommends based on similar _____.',answer:'users',display:'Users',data:{}}; },
      ],
      medium: [
        () => { const u=[ri(1,5),ri(1,5)],v=[ri(1,5),ri(1,5)]; return {type:'m52_calc',answerType:'scalar',prompt:'Dot product of '+fv(...u)+' and '+fv(...v)+'?',answer:String(u[0]*v[0]+u[1]*v[1]),display:String(u[0]*v[0]+u[1]*v[1]),data:{u,v}}; },
        () => { return {type:'m52_cosine',answerType:'scalar',prompt:'Cosine similarity normalizes the dot product by the product of _____.',answer:'magnitudes',display:'Magnitudes (lengths)',data:{}}; },
        () => { return {type:'m52_predict',answerType:'scalar',prompt:'To predict a missing rating, use dot product with similar _____.',answer:'users',display:'Users',data:{}}; },
      ],
      hard: [
        () => { const u=[ri(1,5),ri(1,5)],v=[ri(1,5),ri(1,5)]; const dot=u[0]*v[0]+u[1]*v[1]; const mU=Math.sqrt(u[0]*u[0]+u[1]*u[1]),mV=Math.sqrt(v[0]*v[0]+v[1]*v[1]); return {type:'m52_cos',answerType:'scalar',prompt:'Cosine sim of '+fv(...u)+' and '+fv(...v)+'?',answer:String(rnd2(dot/(mU*mV))),display:String(rnd2(dot/(mU*mV))),data:{u,v}}; },
        () => { const u=[ri(1,5),ri(1,5)],v=[ri(1,5),ri(1,5)]; const dot=u[0]*v[0]+u[1]*v[1]; return {type:'m52_dot_calc',answerType:'scalar',prompt:'Dot product of '+fv(...u)+' and '+fv(...v)+'?',answer:String(dot),display:String(dot),data:{u,v}}; },
        () => { const users=ri(3,6),items=ri(3,6); return {type:'m52_matrix',answerType:'scalar',prompt:users+' users, '+items+' items. Rating matrix size?',answer:users+'x'+items,display:users+'×'+items,data:{users,items}}; },
      ],
    },
    // Mission 53: Web as a Graph (PageRank)
    53: {
      easy: [
        () => { return {type:'m53_links',answerType:'scalar',prompt:'In PageRank, incoming links from important pages give more _____.',answer:'rank',display:'Rank / importance',data:{}}; },
        () => { return {type:'m53_eigen',answerType:'scalar',prompt:'PageRank solves the _____ eigenvector problem.',answer:'dominant',display:'Dominant',data:{}}; },
        () => { return {type:'m53_sparse',answerType:'scalar',prompt:'Web graph adjacency matrix is usually _____.',answer:'sparse',display:'Sparse',data:{}}; },
      ],
      medium: [
        () => { return {type:'m53_markov',answerType:'scalar',prompt:'PageRank models the web as a _____ chain.',answer:'Markov',display:'Markov chain',data:{}}; },
        () => { return {type:'m53_damping',answerType:'scalar',prompt:'The damping factor d represents probability of following a _____',answer:'link',display:'Link (vs random jump)',data:{}}; },
        () => { return {type:'m53_steady',answerType:'scalar',prompt:'PageRank is the steady-state _____ of the web transition matrix.',answer:'distribution',display:'Distribution',data:{}}; },
      ],
      hard: [
        () => { return {type:'m53_two_step',answerType:'scalar',prompt:'If damping factor d=0.85, probability of random jump = ?',answer:'0.15',display:'0.15',data:{}}; },
        () => { return {type:'m53_markov',answerType:'scalar',prompt:'A 4-page web: transition matrix is ___×___.',answer:'4×4',display:'4×4',data:{}}; },
        () => { return {type:'m53_eigenvalue',answerType:'scalar',prompt:'PageRank steady state: the dominant eigenvalue of P is _____.',answer:'1',display:'1',data:{}}; },
      ],
    },
    // Mission 54: Power Method
    54: {
      easy: [
        () => { return {type:'m54_converge',answerType:'scalar',prompt:'Power method converges to the _____ eigenvector.',answer:'dominant',display:'Dominant (largest eigenvalue)',data:{}}; },
        () => { return {type:'m54_iterate',answerType:'scalar',prompt:'Power method computes v_{k+1} = A·v_k, then _____.',answer:'normalize',display:'Normalize',data:{}}; },
        () => { return {type:'m54_eigen1',answerType:'scalar',prompt:'The dominant eigenvalue of a Markov matrix is _____.',answer:'1',display:'1',data:{}}; },
      ],
      medium: [
        () => { const P=[[0.8,0.2],[0.1,0.9]]; return {type:'m54_step',answerType:'scalar',prompt:'P=[[0.8,0.2],[0.1,0.9]], v=[1,0]. Pv = ?',answer:'(0.8,0.1)',display:'(0.8,0.1)',data:{P}}; },
        () => { return {type:'m54_speed',answerType:'scalar',prompt:'Convergence speed depends on the gap between top two _____.',answer:'eigenvalues',display:'Eigenvalues',data:{}}; },
        () => { return {type:'m54_norm',answerType:'scalar',prompt:'After each multiplication, we normalize to keep the vector\'s _____ at 1.',answer:'magnitude',display:'Magnitude',data:{}}; },
      ],
      hard: [
        () => { const P=[[0.7,0.3],[0.4,0.6]]; const det=P[0][0]*P[1][1]-P[0][1]*P[1][0]; return {type:'m54_det',answerType:'scalar',prompt:'P=[[0.7,0.3],[0.4,0.6]]. det(P) = '+det.toFixed(2)+'. Dominant eigenvalue?',answer:'1',display:'1',data:{P,det}}; },
        () => { return {type:'m54_markov',answerType:'scalar',prompt:'Row sums of any Markov transition matrix equal _____.',answer:'1',display:'1',data:{}}; },
        () => { return {type:'m54_converge_check',answerType:'scalar',prompt:'P=[[0.8,0.2],[0.1,0.9]]. v₂=0.9>0.8=v₁ → converges. Gap = ?',answer:'0.1',display:'0.1',data:{}}; },
      ],
    },
    // Mission 55: Dimensionality Reduction (PCA)
    55: {
      easy: [
        () => { return {type:'m55_pca',answerType:'scalar',prompt:'PCA finds directions of maximum _____.',answer:'variance',display:'Variance',data:{}}; },
        () => { return {type:'m55_eigen',answerType:'scalar',prompt:'Largest eigenvalue = direction of most _____.',answer:'variance',display:'Variance',data:{}}; },
        () => { return {type:'m55_reduce',answerType:'scalar',prompt:'Reducing dimensions always loses some information? (1=yes,0=no)',answer:'1',display:'Yes',data:{}}; },
      ],
      medium: [
        () => { return {type:'m55_components',answerType:'scalar',prompt:'Principal components are eigenvectors of the _____ matrix.',answer:'covariance',display:'Covariance',data:{}}; },
        () => { return {type:'m55_k',answerType:'scalar',prompt:'To reduce from p dims to k dims, keep top k _____.',answer:'eigenvectors',display:'Eigenvectors',data:{}}; },
        () => { return {type:'m55_explained',answerType:'scalar',prompt:'The first PC explains the most _____.',answer:'variance',display:'Variance',data:{}}; },
      ],
      hard: [
        () => { const vals=[ri(3,10),ri(1,5),ri(1,3)]; const sum=vals.reduce((a,b)=>a+b,0); return {type:'m55_ratio',answerType:'scalar',prompt:'Eigenvalues: '+vals.join(', ')+'. Explained variance of PC1?',answer:String(rnd2(vals[0]/sum*100))+'%',display:rnd2(vals[0]/sum*100)+'%',data:{vals,sum}}; },
        () => { return {type:'m55_components',answerType:'scalar',prompt:'5D data, keep 2 PCs. Remaining dimensions lost = ?',answer:'3',display:'3',data:{}}; },
        () => { return {type:'m55_eigen_rank',answerType:'scalar',prompt:'A 4×4 matrix rank 3 has ___ non-zero eigenvalues.',answer:'3',display:'3',data:{}}; },
      ],
    },
    // Mission 56: SVD & The Big Picture
    56: {
      easy: [
        () => { return {type:'m56_nz',answerType:'scalar',prompt:'Number of non-zero singular values = _____.',answer:'rank',display:'Rank',data:{}}; },
        () => { return {type:'m56_zero_sv',answerType:'scalar',prompt:'Zero singular values correspond to which subspace?',answer:'null space',display:'Null space',data:{}}; },
        () => { return {type:'m56_four',answerType:'scalar',prompt:'SVD reveals all _____ fundamental subspaces.',answer:'4',display:'4',data:{}}; },
      ],
      medium: [
        () => { return {type:'m56_decomp',answerType:'scalar',prompt:'SVD: A = U Σ V^T. U reveals which subspace?',answer:'column space',display:'Column space C(A)',data:{}}; },
        () => { return {type:'m56_v',answerType:'scalar',prompt:'In SVD, V reveals which subspace?',answer:'row space',display:'Row space R(A)',data:{}}; },
        () => { return {type:'m56_sigma',answerType:'scalar',prompt:'Σ contains the _____ values on its diagonal.',answer:'singular',display:'Singular values',data:{}}; },
      ],
      hard: [
        () => { return {type:'m56_rank1',answerType:'scalar',prompt:'Rank-1 matrix: how many non-zero singular values?',answer:'1',display:'1',data:{}}; },
        () => { const A=[[1,0],[0,1]]; return {type:'m56_identity',answerType:'scalar',prompt:'SVD of identity I_2: what are the singular values?',answer:'1,1',display:'1, 1',data:{A}}; },
        () => { return {type:'m56_sigma_count',answerType:'scalar',prompt:'A 3×3 matrix rank 2 has ___ non-zero singular values.',answer:'2',display:'2',data:{}}; },
      ],
    },
  };

  function generateChoices(correctAnswer, prompt) {
    const correct = String(correctAnswer).trim();
    const isNum = !isNaN(parseFloat(correct)) && isFinite(correct);
    const choices = [correct];
    const seen = new Set([correct]);
    let attempts = 0;

    while (choices.length < 4 && attempts < 80) {
      attempts++;
      let wrong;
      if (isNum) {
        const v = parseFloat(correct);
        const offsets = [-3,-2,-1,1,2,3,-5,5];
        wrong = String(v + pick(offsets));
      } else if (correct.match(/^\(.*\)$/)) {
        const inner = correct.replace(/^\(/, '').replace(/\)$/, '').split(',').map(Number);
        if (inner.every(n => !isNaN(n))) {
          const variants = inner.map((n,i) => { const v=[...inner]; v[i]=n+(Math.random()>0.5?1:-1); return '('+v.join(',')+')'; });
          variants.push('(0,0)');
          wrong = pick(variants);
        } else { continue; }
      } else if (correct.includes(':')) {
        const parts = correct.split(':');
        const a = parseInt(parts[0]) || 1, b = parseInt(parts[1]) || 1;
        wrong = pick([a+1+':'+b, a+':'+(b+1), (a>1?a-1:1)+':'+b, b+':'+a]);
      } else if (correct.includes('x')) {
        const m = correct.match(/(\d+)x(\d+)/);
        if (m) { const a=parseInt(m[1]),b=parseInt(m[2]); wrong = pick([a+'x'+(b+1), (a+1)+'x'+b, a+'x'+(b>1?b-1:1)]); }
        else { continue; }
      } else {
        const textPool = {
          'columns':['rows','diagonals','entries'], 'rows':['columns','diagonals','entries'],
          'rank':['nullity','dimension','determinant'], 'nullity':['rank','dimension','determinant'],
          '1':['2','3','0'], '2':['1','3','4'], '3':['2','4','1'], '0':['1','2','3'],
          '4':['3','5','2'], '5':['4','6','3'], '6':['5','7','4'],
          'yes':['no','sometimes','never'], 'no':['yes','sometimes','always'],
          'true':['false','sometimes','never'], 'false':['true','sometimes','always'],
          'plane':['line','point','space'], 'line':['plane','point','space'],
          'point':['line','plane','space'], 'space':['line','plane','point'],
          'perpendicular':['parallel','equal','skew'], 'parallel':['perpendicular','equal','skew'],
          'subspace':['matrix','vector','scalar'], 'projection':['rotation','reflection','scaling'],
          'addition':['multiplication','subtraction','division'], 'scaling':['addition','subtraction','rotation'],
          'overdetermined':['underdetermined','square','consistent'],
          'underdetermined':['overdetermined','square','inconsistent'],
          'basis':['matrix','vector','scalar'], 'invertible':['singular','diagonal','symmetric'],
          'sparse':['dense','full','empty'], 'dominant':['smallest','average','median'],
          'eigenvalues':['singular values','determinants','rank'],
          'variance':['mean','median','standard deviation'],
          'covariance':['correlation','variance','mean'],
          'transition':['adjacency','identity','diagonal'], 'steady':['random','initial','uniform'],
          'input':['output','column','row'], 'output':['input','column','row'],
          'kernel':['range','image','domain'], 'range':['kernel','image','domain'],
          'column space':['row space','null space','left null space'],
          'row space':['column space','null space','left null space'],
          'null space':['column space','row space','left null space'],
          'left null space':['column space','row space','null space'],
          'multiplication':['addition','subtraction','division'],
          'concurrent':['parallel','skew','perpendicular'],
          'intersect':['parallel','diverge','collapse'],
          'infinite':['zero','one','finite'],
          'least squares':['maximum likelihood','least absolute','regularization'],
          'least':['most','average','median'],
          'best':['worst','average','random'],
          'error':['correct','result','output'],
          'linearly dependent':['linearly independent','orthogonal','parallel'],
          'linearly independent':['linearly dependent','orthogonal','parallel'],
          'magnitude':['direction','angle','phase'],
          'Markov':['Euclidean','Gaussian','Bayesian'],
          'eigenvectors':['eigenvalues','determinants','singular values'],
          'users':['items','ratings','features'],
          'entries':['rows','columns','matrices'],
          'vectors':['scalars','matrices','tensors'],
          'singular':['invertible','diagonal','symmetric'],
          'inverse':['transpose','adjugate','cofactor'],
          'input space':['output space','column space','row space'],
          'output space':['input space','column space','row space'],
          'domain':['codomain','range','image'],
          'codomain':['domain','range','image'],
          'image':['domain','codomain','kernel'],
          'adjacency':['transition','incidence','identity'],
          'euclidean':['manhattan','cosine','hamming'],
          'cosine':['euclidean','manhattan','hamming'],
          'best':['worst','random','average'],
          'worst':['best','average','random'],
          'similar':['different','opposite','orthogonal'],
          'independent':['dependent','parallel','collinear'],
          'dependent':['independent','parallel','collinear'],
          'consistent':['inconsistent','singular','overdetermined'],
          'invertible':['singular','nilpotent','idempotent'],
          'normal':['tangent','secant','parallel'],
          'null space direction is on the line':['parallel to range','orthogonal to range','perpendicular to range'],
          'πP=π':['Pπ=π','πP=0','det(P)=1'],
          'π':['σ','λ','μ'],
          '(1,2)':['(2,1)','(1,-2)','(-1,2)'],
          '(1,3)':['(3,1)','(1,-3)','(-1,3)'],
          '(2,1)':['(1,2)','(2,-1)','(-2,1)'],
          '(3,1)':['(1,3)','(3,-1)','(-3,1)'],
          '(1,-2,1)': ['(1,2,1)','(-1,2,1)','(1,-2,-1)'],
          '(-3,1)': ['(3,1)','(-1,3)','(3,-1)'],
          '(-2,1)': ['(2,1)','(-1,2)','(2,-1)'],
          '(1,1,1)': ['(1,1,2)','(1,2,1)','(2,1,1)'],
          '(1,-2,1)': ['(1,2,-1)','(-1,2,1)','(2,1,-1)'],
          '2x2': ['3x3','2x3','3x2'],
          '3x3': ['2x2','3x2','2x3'],
          '3': ['2','4','5'],
          '2': ['1','3','4'],
          '1': ['2','3','0'],
          '0': ['1','2','3'],
          '4': ['3','5','6'],
          '5': ['4','6','7'],
          '7': ['5','6','8'],
          'R^3': ['R^2','R^4','R^1'],
          'R^2': ['R^3','R^4','R^1'],
          'R⊥N, C⊥N^T': ['R⊥C, N⊥N^T','R⊥N^T, C⊥N','R⊥N, C⊥N'],
          'least squares': ['least absolute','maximum likelihood','least cubes'],
        };
        const lower = correct.toLowerCase();
        if (textPool[lower]) {
          wrong = pick(textPool[lower]);
        } else { continue; }
      }
      if (!seen.has(wrong)) { seen.add(wrong); choices.push(wrong); }
    }
    while (choices.length < 4) {
      choices.push('—');
    }
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  return function generateMissionQuestion(missionId, difficulty, seen) {
    const mg = missionGens[missionId];
    if (!mg) return missionGens[1].easy[0]();
    const pool = mg[difficulty] || mg.easy;
    let q;
    if (seen && seen.size > 0 && pool.length > 1) {
      const unseen = pool.filter((_, i) => {
        const test = pool[i]();
        return !seen.has(test.type);
      });
      if (unseen.length > 0) {
        q = unseen[Math.floor(Math.random() * unseen.length)]();
      } else {
        q = pick(pool)();
        q.type = q.type + '_' + ri(1, 10000);
      }
    } else {
      q = pick(pool)();
    }
    if (difficulty === 'easy' || difficulty === 'medium') {
      const isYesNo = q.type && q.type.startsWith('yesno') || (q.prompt && q.prompt.includes('(1=yes,0=no)'));
      if (isYesNo) {
        q.choices = ['Yes', 'No'];
        q.prompt = q.prompt.replace(/\(1=yes,0=no\)/g, '').replace(/\s+/g, ' ').trim();
        q._yesno = true;
      } else {
        q.choices = generateChoices(q.answer, q.prompt);
      }
    }
    return q;
  };
})();

app.get('/la-mission-quiz-api/question', (req, res) => {
  const missionId = parseInt(req.query.missionId) || 1;
  const difficulty = req.query.difficulty || 'easy';
  const seenStr = req.query.seen || '';
  const seen = new Set(seenStr.split(',').filter(Boolean));
  const id = Date.now();
  try {
    const q = MQ(missionId, difficulty, seen);
    res.json({ id, missionId, difficulty, ...q });
  } catch (e) {
    console.error('Mission quiz question error:', e);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

app.post('/la-mission-quiz-api/check', (req, res) => {
  const { answer: expected, answerType, type, data, prompt } = req.body;
  const raw = (req.body.userAnswer || '').trim();
  const norm = (s) => s.replace(/\s+/g, '').replace(/\u2212/g, '-').toLowerCase();
  const n = norm(raw);
  let correct = false;

  if (answerType === 'scalar') {
    const parseNum = (s) => {
      s = s.replace(/\s+/g, '').replace(/\u2212/g, '-');
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 2) {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);
          if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
        }
      }
      return parseFloat(s);
    };
    const userVal = parseNum(n);
    const expVal = parseNum(norm(expected));
    if (!isNaN(userVal) && !isNaN(expVal)) {
      correct = Math.abs(userVal - expVal) < 0.5;
    } else {
      correct = n === norm(expected);
    }
  } else if (answerType === 'vector') {
    const m = n.match(/\(?([-\d.]+),([-\d.]+)\)?/);
    const e = norm(expected).match(/\(?([-\d.]+),([-\d.]+)\)?/);
    correct = m && e && Math.abs(parseFloat(m[1])-parseFloat(e[1])) < 0.01 && Math.abs(parseFloat(m[2])-parseFloat(e[2])) < 0.01;
  } else if (answerType === 'matrix') {
    const parseMat = (s) => {
      const cleaned = s.replace(/[\[\]]/g, '');
      const rows = cleaned.split(';');
      if (rows.length !== 2) return null;
      const r0 = rows[0].split(',').map(Number);
      const r1 = rows[1].split(',').map(Number);
      if (r0.length !== 2 || r1.length !== 2 || r0.some(isNaN) || r1.some(isNaN)) return null;
      return [r0, r1];
    };
    const um = parseMat(n);
    const em = parseMat(norm(expected));
    correct = um && em && um[0][0]===em[0][0] && um[0][1]===em[0][1] && um[1][0]===em[1][0] && um[1][1]===em[1][1];
  } else {
    const expLower = norm(expected);
    const textNorm = (s) => s.replace(/\s+/g, '').replace(/\u2212/g, '-').toLowerCase();
    correct = textNorm(raw) === expLower || textNorm(raw).includes(expLower) || expLower.includes(textNorm(raw));
  }

  if (!correct && !isNaN(parseFloat(expected)) && (n === 'yes' || n === 'no')) {
    const expNum = parseFloat(expected);
    if ((expNum === 1 && n === 'yes') || (expNum === 0 && n === 'no')) {
      correct = true;
    }
  }
  let display = expected;
  if (!isNaN(parseFloat(expected)) && req.body._yesno) {
    display = expected === '1' ? 'Yes' : 'No';
  }
  res.json({ correct, display, message: correct ? 'Correct!' : 'Incorrect' });
});

/**
 * NEW LAB ROUTES (Basic Arithmetic, Mensuration, Visual Math Redux)
 */
const labRoutes = require('./labRoutes');
app.use('/api', labRoutes);

/**
 * CATCH-ALL ROUTE
 * ═══════════════════════════════════════════════════════════════════════════
 * Serves the React/Vue SPA index.html for all unmatched routes
 * Enables client-side routing to work properly
 */
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

/**
 * START SERVER
 * ═══════════════════════════════════════════════════════════════════════════
 * Listen on all interfaces (0.0.0.0) at the configured port
 * 0.0.0.0 makes the server accessible from any network interface/IP address
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tenali app running on http://0.0.0.0:${PORT}`);
});

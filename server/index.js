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
 *    - Quadratic Evaluation: Evaluate quadratic functions (y = axÂ² + bx + c) at given x values
 *    - Square Root Approximation: Estimate square roots by bands/difficulty levels
 *    - Polynomial Multiplication: Expand polynomial expressions (easy to hard)
 *    - Polynomial Factorization: Factor quadratic expressions into linear factors
 *    - Prime Factorization: Decompose numbers into prime factors
 *    - Quadratic Formula: Solve quadratic equations using the quadratic formula
 *    - Simultaneous Equations: Solve 2Ã—2 or 3Ã—3 linear systems
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
 * - /basicarith-api/*: Basic arithmetic (+, âˆ’, Ã—)
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const http = require('http');
const wordCreator = require('./wordCreator');
const logger = require('./lib/logger');

// Catch what would otherwise be a silent crash (or, for unhandled promise
// rejections on Node 15+, a crash with no application-level record of why).
// Log first, then exit so the process manager (systemd's tenali.service)
// restarts a clean process rather than continuing in a possibly-corrupt state.
process.on('uncaughtException', (err) => {
  logger.error('process', 'uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('process', 'unhandledRejection:', reason);
  process.exit(1);
});


// Initialize Express app and configure middleware
const app = express();
const PORT = process.env.PORT || 4000;
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const questionsDir = path.join(__dirname, '..', 'chitragupta', 'questions');

// Behind nginx: trust the first proxy hop so rate limiting keys off the real
// client IP (X-Forwarded-For) instead of 127.0.0.1.
app.set('trust proxy', 1);

// CORS: allow only trusted frontend origins (the app is same-origin; extra
// origins configurable via CORS_ORIGINS, comma-separated).
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ||
  'https://tenali.fun,http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    // Allow non-browser requests (no Origin header) and allowlisted origins.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));
// JSON parsing: Handle application/json request bodies
app.use(express.json());

// Rate limiting. 'trust proxy' above makes the per-IP key correct behind nginx.
// Strict on login (anti-brute-force); looser on the rest of /api. The quiz
// question/check endpoints use the /<type>-api/* prefix, so they are NOT limited.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,                // max attempts per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  limit: 300,               // generous; app-data endpoints only
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);

// Static file serving: Serve built React/Vue client
app.use(express.static(clientDistPath));

// â”€â”€â”€ Auth (MongoDB + JWT) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Adds /api/auth/login and /api/auth/me. Hardcoded users are seeded into
// MongoDB on startup. If Mongo is unreachable the rest of the server still
// serves; only the auth endpoints will return 503.
const auth = require('./auth');
const transferScenarios = require('./transferScenarios');
const progress = require('./progress');
const hints = require('./hints');
const translate = require('./translate');

// Load static collections definitions
let collections = [];
try {
  collections = JSON.parse(fs.readFileSync(path.join(__dirname, 'collections.json'), 'utf8'));
  console.log(`[collections] loaded ${collections.length} collections`);
} catch (e) {
  logger.error(null,'[collections] failed to load collections.json:', e.message);
}
app.use('/api/auth', auth.router);
app.use('/api/progress', progress.router);
app.use('/api/hints', hints);
app.use('/api/translate', translate.router);
const treasurehuntRouter = require('./treasurehunt/routes');

console.log("Treasure router imported");

app.use('/treasurehunt-api/', (req, res, next) => {
    console.log("Treasure API:", req.method, req.url);
    next();
});

app.use('/treasurehunt-api', treasurehuntRouter);
app.get('/test-12345', (req, res) => {
  res.json({
    ok: true,
    message: "THIS IS THE SERVER YOU ARE EDITING"
  });
});
auth.seedUsers().catch(() => {});  // always populate in-memory fallback

async function connectAuthMongoWithRetry(attempt = 1) {
  const maxAttempts = Number(process.env.MONGO_CONNECT_ATTEMPTS || 10);
  const retryDelayMs = Number(process.env.MONGO_CONNECT_RETRY_MS || 2000);

  try {
    await auth.connectMongo();
    await auth.seedUsers();
  } catch (err) {
    if (attempt >= maxAttempts) {
      logger.error(null,'[auth] Mongo connect failed - using in-memory auth:', err.message);
      return;
    }

    logger.warn(null,
      `[auth] Mongo unavailable (${err.message}); retrying in ${Math.round(retryDelayMs / 1000)}s ` +
      `(${attempt}/${maxAttempts})`
    );
    setTimeout(() => connectAuthMongoWithRetry(attempt + 1), retryDelayMs);
  }
}

connectAuthMongoWithRetry();

/**
 * EXPLANATION SUPPORT MIDDLEWARE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
// Student Attempt Logger Helper
function extractAttemptDetails(req) {
  const path = req.path;
  const body = req.body || {};
  const match = /^\/([a-z0-9]+)-api\/check/i.exec(path);
  if (!match) return null;
  const topicKey = match[1];

  let questionPrompt = '';
  let userInput = '';

  // Extract user answer
  if (body.answer !== undefined) userInput = String(body.answer);
  else if (body.answerOption !== undefined) userInput = String(body.answerOption);
  else if (body.userAnswer !== undefined) userInput = String(body.userAnswer);
  else if (body.val !== undefined) userInput = String(body.val);
  else userInput = JSON.stringify(body);

  // Extract prompt based on topic
  switch (topicKey) {
    case 'gk': {
      const gkQuestions = typeof questions !== 'undefined' ? questions : [];
      const q = gkQuestions.find((item) => Number(item.id) === Number(body.id));
      questionPrompt = q ? q.question : `GK Question ID: ${body.id}`;
      break;
    }
    case 'addition':
      questionPrompt = `Addition: ${body.a} + ${body.b}`;
      break;
    case 'basicarith':
      questionPrompt = `Arithmetic: ${body.a} ${body.op} ${body.b}`;
      break;
    case 'multiply':
      questionPrompt = `Multiplication: ${body.table} x ${body.multiplier}`;
      break;
    case 'quadratic':
      questionPrompt = `Evaluate y = ${body.a}x^2 + ${body.b}x + ${body.c} at x = ${body.x}`;
      break;
    case 'sqrt':
      questionPrompt = `Approximate square root of ${body.q}`;
      break;
    case 'vocab': {
      const vQuestions = typeof vocabQuestions !== 'undefined' ? vocabQuestions : [];
      const q = vQuestions.find((item) => Number(item.id) === Number(body.id));
      questionPrompt = q ? `Vocabulary: what is the meaning of "${q.word}"?` : `Vocabulary Question ID: ${body.id}`;
      break;
    }
    default:
      if (body.prompt) {
        questionPrompt = body.prompt;
      } else if (body.question) {
        questionPrompt = body.question;
      } else {
        const params = { ...body };
        delete params.answer;
        delete params.answerOption;
        delete params.userAnswer;
        delete params.val;
        delete params.solve;
        questionPrompt = `${topicKey.toUpperCase()} Problem: ` + JSON.stringify(params);
      }
  }

  return { topicKey, questionPrompt, userInput };
}

// Global middleware to log student attempts for all quiz/check APIs
app.use((req, res, next) => {
  if (req.method !== 'POST' || !req.path.includes('-api/check')) {
    return next();
  }

  const isSolveOnly = req.body && req.body.solve === true;
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    const jsonResult = originalJson(data);

    if (isSolveOnly) return jsonResult;

    // Run async logging in the background
    (async () => {
      try {
        const user = await getUserFromReq(req);
        if (user) {
          const details = extractAttemptDetails(req);
          if (details) {
            const { topicKey, questionPrompt, userInput } = details;
            
            const isMongo = typeof user._id !== 'undefined';
            if (isMongo) {
              if (auth.StudentAttemptLog) {
                await auth.StudentAttemptLog.create({
                  studentId: user._id,
                  topicKey,
                  questionPrompt,
                  userInput,
                  correct: !!data.correct,
                  hintsClickedCount: req.body.hintsUsed || 0,
                  timeSpentSeconds: req.body.timeSpentSeconds || 0,
                  stageNumber: 3,
                  challengeType: 'standard'
                });
              }
            } else {
              if (!user.attemptLogs) {
                user.attemptLogs = [];
              }
              user.attemptLogs.push({
                topicKey,
                questionPrompt,
                userInput,
                correct: !!data.correct,
                timestamp: new Date(),
                hintsClickedCount: req.body.hintsUsed || 0,
                timeSpentSeconds: req.body.timeSpentSeconds || 0,
                stageNumber: 3,
                challengeType: 'standard'
              });
              await user.save();
            }
          }
        }
      } catch (err) {
        logger.error(null,'[attempt-logger] Failed to log student attempt:', err.message);
      }
    })();

    return jsonResult;
  };

  next();
});

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

// â”€â”€â”€ LIL INTERCEPTOR MIDDLEWARE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      const JWT_SECRET = auth.JWT_SECRET; // single source of truth (server/auth.js)
      const payload = jwt.verify(m[1], JWT_SECRET);
      userId = payload.sub;
    } catch (e) {
      logger.warn(null,'[LIL] JWT verify failed:', e.message);
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

      // Send response immediately â€” don't block on DB writes
      originalJson(data);

      // Fire-and-forget: try to save attempt in background
      lilProcess.processAttempt(payloadInput)
        .then(() => {})
        .catch(err => logger.error(null,'[LIL] processAttempt failed:', err.message));
    } else {
      originalJson(data);
    }
  };

  next();
});

// â”€â”€â”€ LIL GET QUESTION REVISION INTERCEPTOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      const JWT_SECRET = auth.JWT_SECRET; // single source of truth (server/auth.js)
      const payload = jwt.verify(m[1], JWT_SECRET);
      userId = payload.sub;
    } catch (e) {
      logger.warn(null,'[LIL GET] JWT verify failed:', e.message);
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
      logger.error(null,'[LIL GET] Failed to fetch revision question:', err);
    }
  }

  // If no failed attempts are found, proceed to normal question generation!
  next();
});


const { generateExplanation } = require('./explanations');
global.generateExplanation = generateExplanation;

// â”€â”€ Extracted topic routers (Phase 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const arithmeticRouter = require('./routes/arithmetic');
app.use('/addition-api',  arithmeticRouter);
app.use('/multiply-api',  arithmeticRouter);
app.use('/basicarith-api', arithmeticRouter);
app.use('/squaring-api',  arithmeticRouter);
app.use('/rounding-api',  arithmeticRouter);
app.use('/decimals-api',  arithmeticRouter);
app.use('/column-addition-api',       arithmeticRouter);
app.use('/column-subtraction-api',    arithmeticRouter);
app.use('/column-multiplication-api', arithmeticRouter);
app.use('/column-division-api',       arithmeticRouter);
app.use('/sqrt-api',                  arithmeticRouter);

const algebraRouter = require('./routes/algebra');
app.use('/quadratic-api', algebraRouter);
app.use('/polymul-api',     algebraRouter);
app.use('/polyfactor-api',  algebraRouter);
app.use('/primefactor-api', algebraRouter);
app.use('/qformula-api',    algebraRouter);
app.use('/simul-api',       algebraRouter);
app.use('/funceval-api',    algebraRouter);
app.use('/lineq-api',       algebraRouter);
app.use('/surds-api',       algebraRouter);
app.use('/indices-api',     algebraRouter);
app.use('/sequences-api',   algebraRouter);
app.use('/ineq-api',        algebraRouter);
app.use('/lineareq-api',    algebraRouter);

const calculusRouter = require('./routes/calculus');
app.use('/log-api',        calculusRouter);
app.use('/diff-api',       calculusRouter);
app.use('/integ-api',      calculusRouter);
app.use('/limits-api',     calculusRouter);
app.use('/diffeq-api',     calculusRouter);

const financialRouter = require('./routes/financial');
app.use('/percent-api',    financialRouter);
app.use('/profitloss-api', financialRouter);
app.use('/shares-api',     financialRouter);
app.use('/banking-api',    financialRouter);
app.use('/gst-api',        financialRouter);
app.use('/ratio-api', financialRouter);

const miscRouter = require('./routes/misc');
app.use('/sets-api',       miscRouter);
app.use('/bounds-api',     miscRouter);
app.use('/sdt-api',        miscRouter);
app.use('/variation-api',  miscRouter);
app.use('/hcflcm-api',     miscRouter);
app.use('/remfactor-api',  miscRouter);
app.use('/fractionadd-api', miscRouter);
app.use('/tatsavit-api',    miscRouter);
app.use('/gymdecimals-api', miscRouter);
app.use('/funcgym-api',     miscRouter);
app.use('/fracaddgym-api',  miscRouter);
app.use('/lineqgym-api',    miscRouter);
app.use('/indicesgym-api',  miscRouter);
app.use('/polygym-api',     miscRouter);
app.use('/gk-api',          miscRouter);
app.use('/vocab-api',       miscRouter);
app.use('/concept-api',     miscRouter);
app.use('/curiosity-api',   miscRouter);

const geometryRouter = require('./routes/geometry');
app.use('/mensur-api',     geometryRouter);
app.use('/bearings-api',   geometryRouter);
app.use('/angles-api',     geometryRouter);
app.use('/triangles-api',  geometryRouter);
app.use('/congruence-api', geometryRouter);
app.use('/polygons-api',   geometryRouter);
app.use('/similarity-api', geometryRouter);
app.use('/invtrig-api',    geometryRouter);
app.use('/trig-api',      geometryRouter);
app.use('/pythag-api',    geometryRouter);
app.use('/heron-api',     geometryRouter);
app.use('/coordgeom-api', geometryRouter);
app.use('/circle-api',    geometryRouter);

const advancedRouter = require('./routes/advanced');
app.use('/matrix-api',     advancedRouter);
app.use('/bases-api',      advancedRouter);
app.use('/stdform-api',    advancedRouter);
app.use('/binomial-api',   advancedRouter);
app.use('/complex-api',    advancedRouter);
app.use('/dotprod-api',    advancedRouter);
app.use('/section-api',    advancedRouter);
app.use('/linprog-api',    advancedRouter);
app.use('/circmeasure-api',advancedRouter);
app.use('/conics-api',     advancedRouter);
app.use('/vectors-api',       advancedRouter);
app.use('/transform-api',     advancedRouter);
app.use('/linearalgebra-api', advancedRouter);

const statsRouter = require('./routes/stats');
app.use('/permcomb-api',   statsRouter);
const riddleRouter = require('./routes/riddle');
app.use('/riddle-api', riddleRouter);
const matrixMysticsRouter = require('./routes/matrixmystics');
app.use('/matrixmystics-api', matrixMysticsRouter);
const transferRouter = require('./routes/transfer');
app.use('/transfer-api', transferRouter);
app.use('/prob-api',  statsRouter);
app.use('/stats-api', statsRouter);
const visualMathRouter = require('./routes/visual-math');
app.use('/visual-math-api', visualMathRouter);
const sudokuRouter = require('./routes/sudoku');
app.use('/sudoku-api', sudokuRouter);
const laMissionQuizRouter = require('./routes/la-mission-quiz');
app.use('/la-mission-quiz-api', laMissionQuizRouter);
app.use('/dotprodgym-api', advancedRouter);
const { sudokuIsValid, sudokuSolve, sudokuGenerate } = require('./lib/sudoku');

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in range [min, max]
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }


/**
 * Load all GK questions from JSON files in the questions directory
 * Each file should contain a question object with id, question, options, answerOption, answerText
 * @returns {Array<object>} Array of question objects
 */
// Reads all JSON files in `dir` concurrently (fs.promises.readFile lets libuv's
// thread pool overlap the I/O instead of doing 991+ sequential blocking
// syscalls) and parses each one. Order is not significant to any caller here.
async function loadJsonDir(dir) {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));
  const contents = await Promise.all(
    files.map((file) => fs.promises.readFile(path.join(dir, file), 'utf8'))
  );
  return contents.map((raw) => JSON.parse(raw));
}

// Populated by initData() before the server starts listening (see bottom of
// file) â€” declared here as `let` so the many closures throughout this file
// that reference `questions` by name see the loaded data once ready.
let questions = [];


/**
 * VOCABULARY BUILDER API
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
// Vocab is by far the largest set (~7,600 files) â€” loaded via loadJsonDir()
// (see loadQuestions above) so the reads overlap instead of running one at a
// time. Concepts is tiny (~15 files); left synchronous, not worth the churn.
async function loadVocabAsync() {
  try {
    return await loadJsonDir(vocabDir);
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

// Populated by initData() before the server starts listening, same as
// `questions` above.
let vocabQuestions = [];
const conceptQuestions = loadConcepts();
const banks = require('./lib/question-banks');
banks.concepts = conceptQuestions;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LEARNING JOURNEY ENDPOINTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
    logger.error(null,'[learning-journey] GET /progress error:', err.message);
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
    logger.error(null,'[learning-journey] POST /complete-concept error:', err.message);
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
    logger.error(null,'[learning-journey] GET /checkpoint/quiz error:', err.message);
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
    logger.error(null,'[learning-journey] POST /checkpoint/verify error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// /darts-api â€” Visual Coordinate Geometry (Dart Board)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const dartsRouter = require('./routes/darts');
app.use('/darts-api', dartsRouter);

// WORD CREATOR PUZZLE ROUTER (wordcreator-api)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const wordCreatorRouter = require('./routes/wordCreator');
app.use('/wordcreator-api', wordCreatorRouter);

// CONTRAST CHALLENGE PUZZLE ROUTER (contrast-api)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const contrastRouter = require('./routes/contrast');
app.use('/contrast-api', contrastRouter);

// PROCTOR API â€” Session management, anomaly logging, emotion tracking
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const { ProctorSession, ProctorEvent, Emotion } = require('./proctorSchema');

// Start a proctored quiz session â€” public (no login required)
app.post('/api/proctor/start', async (req, res) => {
  try {
    const { quizType, settings, consentGiven, userId, username } = req.body;
    const session = await ProctorSession.create({
      userId: userId || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      username: username || 'Anonymous',
      quizType: quizType || 'unknown',
      settings: settings || {},
      consentGiven: consentGiven || false,
    });
    res.json({ sessionId: session._id, status: 'active' });
  } catch (e) {
    logger.error(null,'[proctor] start error:', e.message);
    res.status(500).json({ error: 'failed to start proctor session' });
  }
});

// Log a proctor event (anomaly) â€” public
app.post('/api/proctor/event', async (req, res) => {
  try {
    const { sessionId, type, severity, evidence, metadata, transcript, userId, username } = req.body;
    if (!sessionId || !type) return res.status(400).json({ error: 'sessionId and type required' });
    const event = await ProctorEvent.create({
      sessionId,
      userId: userId || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      username: username || 'Anonymous',
      type,
      severity: severity || 1,
      evidence: evidence || undefined,
      metadata: metadata || undefined,
      transcript: transcript || metadata?.transcript || undefined,
    });
    await ProctorSession.findByIdAndUpdate(sessionId, {
      $inc: { totalPenalty: severity || 1 },
      $set: { status: (req.body.sessionStatus === 'ejected') ? 'ejected' : undefined },
    });
    res.json({ eventId: event._id, recorded: true });
  } catch (e) {
    logger.error(null,'[proctor] event error:', e.message);
    res.status(500).json({ error: 'failed to log proctor event' });
  }
});

// End a proctored quiz session â€” public
app.post('/api/proctor/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    const session = await ProctorSession.findByIdAndUpdate(
      sessionId,
      { endedAt: new Date(), status: 'completed' },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'session not found' });
    const events = await ProctorEvent.find({ sessionId }).sort({ timestamp: 1 });
    res.json({ session, events });
  } catch (e) {
    logger.error(null,'[proctor] end error:', e.message);
    res.status(500).json({ error: 'failed to end proctor session' });
  }
});

// Get proctor session details â€” public for dashboard view (no login)
app.get('/api/proctor/session/:id', async (req, res) => {
  try {
    const session = await ProctorSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'session not found' });
    const events = await ProctorEvent.find({ sessionId: req.params.id }).sort({ timestamp: 1 });
    res.json({ session, events });
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch session' });
  }
});

// Get all proctor sessions â€” public for instructor dashboard view (no login)
// The dashboard at /proctor is meant to be accessible to anyone monitoring the exam
app.get('/api/proctor/ping', (req, res) => { res.json({ ok: true }) });

app.get('/api/proctor/sessions', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200)
    const sessions = await ProctorSession.find({})
      .sort({ startedAt: -1 })
      .limit(limit);
    res.json({ sessions });
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch sessions' });
  }
});

// â”€â”€â”€ Face Verification Endpoints (CompreFace proxy) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COMPREFACE_URL = process.env.COMPREFACE_URL || 'http://localhost:8000';
const COMPREFACE_API_KEY = process.env.COMPREFACE_API_KEY || '';

// Register reference face for a session
app.post('/api/proctor/face/register', auth.requireAuth, async (req, res) => {
  try {
    const { sessionId, image } = req.body;
    if (!sessionId || !image) return res.status(400).json({ error: 'sessionId and image required' });
    if (!COMPREFACE_API_KEY) return res.json({ registered: false, reason: 'CompreFace not configured' });

    // Forward to CompreFace detection endpoint
    const cfRes = await fetch(`${COMPREFACE_URL}/api/v1/detection/detect`, {
      method: 'POST',
      headers: { 'x-api-key': COMPREFACE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });

    if (cfRes.ok) {
      const data = await cfRes.json();
      res.json({ registered: true, faceCount: data.result?.length || 0 });
    } else {
      res.json({ registered: false, reason: 'CompreFace detection failed' });
    }
  } catch (e) {
    logger.error(null,'[face] register error:', e.message);
    res.json({ registered: false, reason: 'CompreFace unreachable' });
  }
});

// Verify face identity against reference â€” public
app.post('/api/proctor/face/verify', async (req, res) => {
  try {
    const { sessionId, image } = req.body;
    if (!sessionId || !image) return res.status(400).json({ error: 'sessionId and image required' });
    if (!COMPREFACE_API_KEY) return res.json({ verified: true, similarity: 1, reason: 'CompreFace not configured' });

    // Forward to CompreFace verification endpoint
    const cfRes = await fetch(`${COMPREFACE_URL}/api/v1/verification/verify`, {
      method: 'POST',
      headers: { 'x-api-key': COMPREFACE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });

    if (cfRes.ok) {
      const data = await cfRes.json();
      const similarity = data.result?.face?.similarity || 0;
      res.json({ verified: similarity >= 0.88, similarity });
    } else {
      res.json({ verified: true, similarity: 1, reason: 'CompreFace verification failed' });
    }
  } catch (e) {
    logger.error(null,'[face] verify error:', e.message);
    res.json({ verified: true, similarity: 1, reason: 'CompreFace unreachable' });
  }
});

// â”€â”€â”€ Emotion endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Submit an emotion for a quiz â€” public (no login)
app.post('/api/emotions/submit', async (req, res) => {
  try {
    const { quizType, emotion, feedback, userId, username } = req.body;
    if (!quizType || !emotion) return res.status(400).json({ error: 'quizType and emotion required' });
    const valid = ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'];
    if (!valid.includes(emotion)) return res.status(400).json({ error: 'invalid emotion' });
    const doc = await Emotion.create({
      userId: userId || 'anonymous',
      username: username || 'anonymous',
      quizType,
      emotion,
      feedback: feedback || '',
    });
    res.json({ id: doc._id, recorded: true });
  } catch (e) {
    logger.error(null,'[emotion] submit error:', e.message);
    res.status(500).json({ error: 'failed to submit emotion' });
  }
});

// Get emotion stats for a quiz type
app.get('/api/emotions/stats/:quizType', async (req, res) => {
  try {
    const { quizType } = req.params;
    const stats = await Emotion.aggregate([
      { $match: { quizType } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = stats.reduce((s, r) => s + r.count, 0);
    const scores = { very_sad: -2, sad: -1, neutral: 0, happy: 1, very_happy: 2 };
    const avg = total > 0
      ? stats.reduce((s, r) => s + r.count * (scores[r._id] || 0), 0) / total
      : 0;
    res.json({ stats, total, averageScore: Math.round(avg * 100) / 100 });
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch emotion stats' });
  }
});

// Get emotion history for a user â€” public (filter by userId if provided)
app.get('/api/emotions/history', async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    const query = userId ? { userId } : {};
    const emotions = await Emotion.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json({ emotions });
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch emotion history' });
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// /playground â€” Code execution via Judge0 CE (public API, no auth)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
app.post('/api/playground/run', async (req, res) => {
  try {
    const { source_code, language_id, stdin, cpu_time_limit, memory_limit } = req.body;
    if (!source_code || !language_id) {
      return res.status(400).json({ error: 'source_code and language_id required' });
    }
    const params = new URLSearchParams({
      base64_encoded: 'false',
      wait: 'true',
    });
    const body = {
      source_code,
      language_id,
      stdin: stdin || '',
      cpu_time_limit: cpu_time_limit || 10,
      memory_limit: Math.max(Number(memory_limit) || 262144, 131072),
    };
    const r = await fetch(`https://ce.judge0.com/submissions?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text();
      logger.error(null,'[playground] Judge0 error:', r.status, text);
      return res.status(502).json({ error: 'Judge0 request failed', detail: text });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    logger.error(null,'[playground] error:', e.message);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// /playground2 â€” Code execution via local subprocess (9 languages)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const compiler = require('./compiler');

app.get('/api/playground2/languages', (req, res) => {
  try {
    const langs = compiler.listLanguages();
    res.json({ languages: langs });
  } catch (e) {
    logger.error(null,'[playground2] list error:', e.message);
    res.status(500).json({ error: 'Failed to list languages' });
  }
});

app.post('/api/playground2/run', async (req, res) => {
  try {
    const { language, code, stdin, timeout } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: 'language and code required' });
    }
    const result = await compiler.executeCode(language, code, stdin || '', timeout);
    res.json(result);
  } catch (e) {
    logger.error(null,'[playground2] run error:', e.message);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// /riddle-api â€” Math Riddles
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
app.use('/riddles/images', express.static(path.join(__dirname, 'riddles', 'images')));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// /graph â€” Prerequisite DAG visualisation
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
app.get('/graph', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'graph', 'index.html'));
});

app.get('/path', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'graph', 'path.html'));
});

app.get('/enhanced', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'enhanced', 'index.html'));
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LEARNING TRANSFER CHALLENGES & PROGRESS SYNC API
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const DB_FILE = path.join(__dirname, 'in_memory_users_db.json');
const inMemoryUserProfiles = {};

function loadInMemoryProfiles() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      for (const [username, profile] of Object.entries(data)) {
        inMemoryUserProfiles[username] = {
          ...profile,
          save: async function() {
            saveInMemoryProfiles();
            return this;
          }
        };
      }
      console.log(`[auth] Loaded ${Object.keys(inMemoryUserProfiles).length} in-memory user profiles from persistent file fallback`);
    }
  } catch (err) {
    logger.error(null,'[auth] Failed to load in-memory profiles:', err.message);
  }
}

function saveInMemoryProfiles() {
  try {
    const cleaned = {};
    for (const [username, profile] of Object.entries(inMemoryUserProfiles)) {
      const clone = { ...profile };
      delete clone.save;
      cleaned[username] = clone;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(cleaned, null, 2), 'utf8');
  } catch (err) {
    logger.error(null,'[auth] Failed to save in-memory profiles:', err.message);
  }
}

// Initialize on server start
loadInMemoryProfiles();

function getInMemoryUser(username) {
  const lowercaseUsername = username.toLowerCase();
  if (!inMemoryUserProfiles[lowercaseUsername]) {
    inMemoryUserProfiles[lowercaseUsername] = {
      username: lowercaseUsername,
      completedTopics: [],
      goldMastery: [],
      coins: 0,
      achievements: { completedCollections: [] },
      pinnedBadges: ["", "", ""],
      totalSolved: 0,
      streak: 0,
      lastActiveDate: "",
      createdAt: new Date(),
      milestones: [],
      save: async function() {
        saveInMemoryProfiles();
        return this;
      }
    };
    saveInMemoryProfiles();
  }
  return inMemoryUserProfiles[lowercaseUsername];
}

async function getUserFromReq(req) {
  const authHeader = req.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!m) return null;
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = auth.JWT_SECRET; // single source of truth (server/auth.js)
    const payload = jwt.verify(m[1], JWT_SECRET);
    if (payload && payload.username) {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        try {
          const dbUser = await auth.User.findById(payload.sub || payload.username);
          if (dbUser) return dbUser;
        } catch (dbErr) {
          logger.error(null,'[auth] Database query failed, falling back to in-memory profile:', dbErr.message);
        }
      }
      return getInMemoryUser(payload.username);
    }
  } catch (e) {
    logger.error(null,'[auth] getUserFromReq error:', e.message);
  }
  return null;
}

function compareAnswers(userStr, expected) {
  if (expected === undefined || expected === null) return false;
  
  const cleanUser = String(userStr || '').replace(/\s+/g, '').replace(/[%â‚¹$,]/g, '').replace(/âˆ’/g, '-');
  
  // If expected is a fraction string like "5/12"
  if (typeof expected === 'string' && expected.includes('/')) {
    const [eNum, eDen] = expected.split('/').map(Number);
    const expectedVal = eNum / eDen;
    
    let userVal;
    if (cleanUser.includes('/')) {
      const [uNum, uDen] = cleanUser.split('/').map(Number);
      userVal = uNum / uDen;
    } else {
      userVal = parseFloat(cleanUser);
    }
    
    return !isNaN(userVal) && Math.abs(userVal - expectedVal) <= 0.01;
  }
  
  // Standard numerical comparison
  const expectedNum = parseFloat(expected);
  const userNum = parseFloat(cleanUser);
  if (isNaN(expectedNum) || isNaN(userNum)) {
    // String fallback
    return String(userStr).trim().toLowerCase() === String(expected).trim().toLowerCase();
  }
  
  return Math.abs(userNum - expectedNum) <= 0.01;
}

// Helper to determine if a topic is completed
function isStage3CompletedServer(topicKey, completedTopics) {
  if (!completedTopics || !Array.isArray(completedTopics)) return false;
  if (completedTopics.includes(topicKey)) return true;
  return completedTopics.includes(`${topicKey}-easy`) &&
         completedTopics.includes(`${topicKey}-medium`) &&
         completedTopics.includes(`${topicKey}-hard`);
}

function getTopicBadgeLevelServer(topicKey, completedTopics) {
  if (!completedTopics || !Array.isArray(completedTopics)) return 'locked';
  const easy = completedTopics.includes(`${topicKey}-easy`);
  const medium = completedTopics.includes(`${topicKey}-medium`);
  const hard = completedTopics.includes(`${topicKey}-hard`);
  const started = completedTopics.includes(`${topicKey}-started`);

  if (easy && medium && hard) return 'gold';
  if (easy && medium) return 'silver';
  if (easy) return 'bronze';
  if (started) return 'blue';
  return 'locked';
}

// Compute daily active active practice streak
function checkDailyStreak(user) {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const todayStr = istTime.toISOString().split('T')[0];

  if (!user.streak || user.streak < 1) {
    user.streak = 1;
  }

  if (!user.lastActiveDate) {
    user.streak = 1;
  } else if (user.lastActiveDate !== todayStr) {
    const lastDate = new Date(user.lastActiveDate);
    const diffTime = Math.abs(new Date(todayStr) - new Date(user.lastActiveDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
  }
  user.lastActiveDate = todayStr;
}

// Evaluate collections completion and award rewards
function evaluateCollections(user) {
  const newlyCompleted = [];
  for (const col of collections) {
    const isCompleted = col.topics.every(topicKey => isStage3CompletedServer(topicKey, user.completedTopics));
    if (isCompleted) {
      if (!user.achievements) {
        user.achievements = { completedCollections: [] };
      }
      if (!user.achievements.completedCollections) {
        user.achievements.completedCollections = [];
      }
      const alreadySaved = user.achievements.completedCollections.some(c => c.collectionId === col.collectionId);
      if (!alreadySaved) {
        user.achievements.completedCollections.push({
          collectionId: col.collectionId,
          completedAt: new Date()
        });
        user.coins = (user.coins || 0) + col.coinReward;
        newlyCompleted.push(col.collectionId);
      }
    }
  }
  return newlyCompleted;
}

// Progress sync endpoints
app.get('/api/progress', async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json({ completedTopics: [], goldMastery: [], coins: 0, streak: 0, totalSolved: 0 });
    }
    // Do not check daily streak on GET (which runs automatically on page load).
    // We only update/compute active practice streak on POST progress (active solving).
    res.json({
      completedTopics: user.completedTopics || [],
      goldMastery: user.goldMastery || [],
      coins: user.coins || 0,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to populate and synchronize user milestones retroactively
function ensureUserMilestones(user) {
  if (!user.milestones) {
    user.milestones = [];
  }
  
  const hasJoined = user.milestones.some(m => m.event === 'Joined Tenali');
  if (!hasJoined) {
    user.milestones.push({
      event: 'Joined Tenali',
      date: user.createdAt || new Date(),
      type: 'system'
    });
  }

  if (user.achievements && user.achievements.completedCollections) {
    user.achievements.completedCollections.forEach(c => {
      const col = collections.find(colVal => colVal.collectionId === c.collectionId);
      const eventName = `Mastered ${col ? col.name : c.collectionId}`;
      const hasCol = user.milestones.some(m => m.event === eventName);
      if (!hasCol) {
        user.milestones.push({
          event: eventName,
          date: c.completedAt || new Date(),
          type: 'collection',
          badgeType: col ? col.badgeType : 'trophy'
        });
      }
    });
  }

  if (user.completedTopics) {
    user.completedTopics.forEach(topicKey => {
      let suffix = '';
      let displaySuffix = '';
      if (topicKey.endsWith('-started')) {
        suffix = '-started';
        displaySuffix = 'Started';
      } else if (topicKey.endsWith('-easy')) {
        suffix = '-easy';
        displaySuffix = 'Unlocked Bronze in';
      } else if (topicKey.endsWith('-medium')) {
        suffix = '-medium';
        displaySuffix = 'Unlocked Silver in';
      } else if (topicKey.endsWith('-hard') || topicKey.endsWith('-gold')) {
        suffix = topicKey.endsWith('-hard') ? '-hard' : '-gold';
        displaySuffix = 'Unlocked Gold in';
      }
      
      if (suffix) {
        const baseTopic = topicKey.slice(0, -suffix.length);
        const displayName = baseTopic.charAt(0).toUpperCase() + baseTopic.slice(1);
        const eventName = `${displaySuffix} ${displayName}`;
        const hasTopic = user.milestones.some(m => m.event === eventName);
        if (!hasTopic) {
          user.milestones.push({
            event: eventName,
            date: user.createdAt || new Date(),
            type: 'topic',
            badgeType: 'topic'
          });
        }
      }
    });
  }

  const streakMilestones = [3, 7, 15, 30];
  streakMilestones.forEach(days => {
    if ((user.streak || 0) >= days) {
      const eventName = `Reached a ${days}-Day Streak!`;
      const hasStreak = user.milestones.some(m => m.event === eventName);
      if (!hasStreak) {
        user.milestones.push({
          event: eventName,
          date: user.createdAt || new Date(),
          type: 'streak',
          badgeType: `streak_${days}`
        });
      }
    }
  });
}

app.post('/api/progress', express.json(), async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json({ success: true, guest: true });
    }
    const { completedTopics, goldMastery, coins, totalSolved } = req.body;
    
    const oldCompleted = user.completedTopics || [];
    const oldStreak = user.streak || 0;
    
    if (completedTopics) user.completedTopics = completedTopics;
    if (goldMastery) user.goldMastery = goldMastery;
    if (coins !== undefined) user.coins = coins;
    if (totalSolved !== undefined) user.totalSolved = totalSolved;
    
    checkDailyStreak(user);
    const newlyCompleted = evaluateCollections(user);
    
    // Manage journey milestones
    ensureUserMilestones(user);
    
    const newlyAddedTopics = (user.completedTopics || []).filter(t => !oldCompleted.includes(t));
    newlyAddedTopics.forEach(topicKey => {
      let suffix = '';
      let displaySuffix = '';
      if (topicKey.endsWith('-started')) {
        suffix = '-started';
        displaySuffix = 'Started';
      } else if (topicKey.endsWith('-easy')) {
        suffix = '-easy';
        displaySuffix = 'Unlocked Bronze in';
      } else if (topicKey.endsWith('-medium')) {
        suffix = '-medium';
        displaySuffix = 'Unlocked Silver in';
      } else if (topicKey.endsWith('-hard') || topicKey.endsWith('-gold')) {
        suffix = topicKey.endsWith('-hard') ? '-hard' : '-gold';
        displaySuffix = 'Unlocked Gold in';
      }
      
      if (suffix) {
        const baseTopic = topicKey.slice(0, -suffix.length);
        const displayName = baseTopic.charAt(0).toUpperCase() + baseTopic.slice(1);
        const eventName = `${displaySuffix} ${displayName}`;
        const hasTopic = user.milestones.some(m => m.event === eventName);
        if (!hasTopic) {
          user.milestones.push({
            event: eventName,
            date: new Date(),
            type: 'topic',
            badgeType: 'topic'
          });
        }
      }
    });

    newlyCompleted.forEach(colId => {
      const col = collections.find(colVal => colVal.collectionId === colId);
      const eventName = `Mastered ${col ? col.name : colId}`;
      const hasCol = user.milestones.some(m => m.event === eventName);
      if (!hasCol) {
        user.milestones.push({
          event: eventName,
          date: new Date(),
          type: 'collection',
          badgeType: col ? col.badgeType : 'trophy'
        });
      }
    });

    const streakMilestones = [3, 7, 15, 30];
    streakMilestones.forEach(days => {
      if (oldStreak < days && (user.streak || 0) >= days) {
        const eventName = `Reached a ${days}-Day Streak!`;
        const hasStreak = user.milestones.some(m => m.event === eventName);
        if (!hasStreak) {
          user.milestones.push({
            event: eventName,
            date: new Date(),
            type: 'streak',
            badgeType: `streak_${days}`
          });
        }
      }
    });

    await user.save();
    
    res.json({
      success: true,
      completedTopics: user.completedTopics,
      goldMastery: user.goldMastery,
      coins: user.coins,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0,
      newlyCompleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Collections progress
app.get('/api/collections/progress', async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const completedTopics = user.completedTopics || [];
    const progress = collections.map(col => {
      const topicsProgress = col.topics.map(topicKey => {
        return {
          topicKey,
          completed: isStage3CompletedServer(topicKey, completedTopics)
        };
      });
      
      let totalWeight = 0;
      col.topics.forEach(topicKey => {
        const level = getTopicBadgeLevelServer(topicKey, completedTopics);
        if (level === 'gold') totalWeight += 1.0;
        else if (level === 'silver') totalWeight += 0.6;
        else if (level === 'bronze') totalWeight += 0.3;
        else if (level === 'blue') totalWeight += 0.1;
      });

      const rawCompletedCount = Math.round(totalWeight * 10) / 10;
      const completedCount = Number(rawCompletedCount.toFixed(1));
      const percentage = Math.min(100, Math.round((totalWeight / col.topics.length) * 100));
      
      const completedLog = user.achievements && user.achievements.completedCollections
        ? user.achievements.completedCollections.find(c => c.collectionId === col.collectionId)
        : null;
      
      const nextIncomplete = topicsProgress.find(t => !t.completed);
      
      return {
        collectionId: col.collectionId,
        name: col.name,
        description: col.description,
        totalTopics: col.topics.length,
        completedCount,
        percentage,
        completed: rawCompletedCount === col.topics.length,
        topics: topicsProgress,
        nextTopic: nextIncomplete ? nextIncomplete.topicKey : null,
        coinReward: col.coinReward,
        badgeType: col.badgeType,
        completedAt: completedLog ? completedLog.completedAt : null
      };
    });
    res.json({ collections: progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST pin achievement badge
app.post('/api/profile/pin', express.json(), async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const { badgeId, slotIndex } = req.body;
    if (slotIndex === undefined || slotIndex < 0 || slotIndex > 2) {
      return res.status(400).json({ error: 'Invalid slot index' });
    }
    
    let isUnlocked = false;
    if (badgeId === "") {
      isUnlocked = true;
    } else {
      const isCollection = collections.some(c => c.collectionId === badgeId);
      if (isCollection) {
        isUnlocked = user.achievements && user.achievements.completedCollections
          ? user.achievements.completedCollections.some(c => c.collectionId === badgeId)
          : false;
      } else if (badgeId.startsWith('streak_')) {
        const days = parseInt(badgeId.split('_')[1], 10);
        isUnlocked = (user.streak || 0) >= days;
      } else {
        isUnlocked = getTopicBadgeLevelServer(badgeId, user.completedTopics) !== 'locked';
      }
    }
    
    if (!isUnlocked) {
      return res.status(403).json({ error: 'Badge is locked' });
    }
    
    let pins = user.pinnedBadges || [];
    while (pins.length < 3) pins.push("");
    
    if (badgeId !== "") {
      pins = pins.map((p, i) => (p === badgeId && i !== slotIndex) ? "" : p);
    }
    
    pins[slotIndex] = badgeId;
    user.pinnedBadges = pins;
    await user.save();
    
    res.json({ success: true, pinnedBadges: user.pinnedBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET profile showcase details
app.get('/api/profile/showcase', async (req, res) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    
    const completedTopics = user.completedTopics || [];
    const uniqueMastered = new Set();
    completedTopics.forEach(t => {
      const base = t.replace(/-(easy|medium|hard|started|adaptive|extrahard)$/, '');
      if (getTopicBadgeLevelServer(base, completedTopics) !== 'locked') {
        uniqueMastered.add(base);
      }
    });
    
    let pins = user.pinnedBadges || ["", "", ""];
    while (pins.length < 3) pins.push("");
    
    const pinnedDetails = pins.map(badgeId => {
      if (!badgeId) return null;
      
      const col = collections.find(c => c.collectionId === badgeId);
      if (col) {
        return {
          badgeId,
          name: col.name,
          type: 'collection',
          badgeType: col.badgeType,
          description: col.description
        };
      }
      
      if (badgeId.startsWith('streak_')) {
        const days = badgeId.split('_')[1];
        return {
          badgeId,
          name: `${days}-Day Streak`,
          type: 'streak',
          badgeType: badgeId,
          description: `Practiced for ${days} consecutive days!`
        };
      }
      
      return {
        badgeId,
        name: badgeId.charAt(0).toUpperCase() + badgeId.slice(1),
        type: 'topic',
        badgeType: 'topic'
      };
    });
    
    // Ensure all milestones are retroactively populated/synchronized
    ensureUserMilestones(user);
    
    const timeline = (user.milestones || []).map(m => ({
      event: m.event,
      date: m.date,
      type: m.type || 'topic',
      badgeType: m.badgeType || 'topic'
    }));
    
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      username: user.username,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0,
      masteryCount: uniqueMastered.size,
      pinnedBadges: pinnedDetails,
      unlockedBadgesCount: uniqueMastered.size + (user.achievements && user.achievements.completedCollections ? user.achievements.completedCollections.length : 0),
      timeline
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/**
 * NEW LAB ROUTES (Basic Arithmetic, Mensuration, Visual Math Redux)
 */
const labRoutes = require('./labRoutes');
app.use('/api', labRoutes);

/**
 * CATCH-ALL ROUTE â€” moved to bottom of file (after all API routes)
 * to avoid shadowing /<type>-api endpoints added later.
 */

/**
 * CATCH-ALL ROUTE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * Serves the React/Vue SPA index.html for all unmatched routes.
 * MUST be the last route â€” registered after all API endpoints so it does
 * not shadow /<type>-api routes.
 *
 * Sub-path deployments (VITE_BASE_PATH=/summership) get redirected from the
 * domain root to the sub-path so a user landing on https://tenali.fun/
 * ends up on the live, current build at https://tenali.fun/summership/
 * instead of being served a stale SPA shell that can't reach the API.
 */
const SUBPATH_REDIRECT = (process.env.SUBPATH_REDIRECT || '/summership').replace(/\/+$/, '');
if (SUBPATH_REDIRECT && SUBPATH_REDIRECT !== '/') {
  app.get('/', (_req, res) => res.redirect(302, SUBPATH_REDIRECT + '/'));
}

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

/**
 * START SERVER + BATTLE HANDLER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * Attach Socket.IO to the same HTTP server as Express.
 * Connection limit: 500 concurrent sockets (safety cap).
 * Battle: live fastest-finger duels (KBC-style).
 */
const { Server: SocketIOServer } = require('socket.io');
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 1e6,
  connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
});



// â”€â”€â”€ Connection cap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let connectionCount = 0;
const MAX_CONNECTIONS = 500;
io.use((socket, next) => {
  if (connectionCount >= MAX_CONNECTIONS) {
    return next(new Error('Server at capacity. Try again later.'));
  }
  next();
});
io.on('connection', (socket) => {
  connectionCount++;
  socket.on('disconnect', () => { connectionCount = Math.max(0, connectionCount - 1); });
});

// â”€â”€â”€ Battle logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BATTLE_ROUNDS = 5;
const ROUND_DURATION_MS = 15000;
const rooms = new Map();

function broadcastOpenRooms() {
  const openRooms = {};
  for (const topic of BATTLE_TOPICS) openRooms[topic] = [];
  for (const [code, room] of rooms) {
    if (room.state === 'waiting' && openRooms[room.topic]) {
      openRooms[room.topic].push({
        code,
        host: room.players[0]?.name || 'Player',
        numQuestions: room.numQuestions,
        players: room.players.length,
      });
    }
  }
  io.emit('openRooms', openRooms);
}

function generateRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += letters[randomInt(0, letters.length - 1)];
  return rooms.has(code) ? generateRoomCode() : code;
}

const BATTLE_QUESTION_COUNTS = [3, 5, 10, 15];

function generateBattleQ_arithmetic() {
  const ops = ['+', 'âˆ’', 'Ã—', 'Ã·'];
  const op = pick(ops);
  let a = randomInt(1, 99), b = randomInt(1, 99), answer;
  if (op === '+') answer = a + b;
  else if (op === 'âˆ’') { answer = a; a = a + b; }
  else if (op === 'Ã—') { a = randomInt(1, 12); b = randomInt(1, 12); answer = a * b; }
  else { b = randomInt(1, 12); answer = randomInt(1, 12); a = b * answer; }
  return { prompt: op === 'Ã·' ? `${a} Ã· ${b}` : `(${a}) ${op} (${b})`, answer, type: 'number' };
}
function generateBattleQ_multiply() {
  const t = randomInt(2, 15), m = randomInt(1, 10);
  return { prompt: `${t} Ã— ${m}`, answer: t * m, type: 'number' };
}
function generateBattleQ_gk() {
  if (!questions || !questions.length) return generateBattleQ_arithmetic();
  const q = pick(questions);
  const ci = q.answerOption.charCodeAt(0) - 65;
  const shuffled = [...q.options].sort(() => Math.random() - 0.5);
  return { prompt: q.question, options: shuffled, answer: shuffled.indexOf(q.options[ci]), type: 'mcq' };
}

const BATTLE_MODULES = {
  addition:    { name: 'Addition',        icon: 'âž•', color: '#4a90d9', cat: 'Arithmetic' },
  multiply:    { name: 'Tables',          icon: 'âœ–ï¸', color: '#9b59b6', cat: 'Arithmetic' },
  basicarith:  { name: 'Arithmetic',      icon: 'ðŸ”¢', color: '#7aa2f7', cat: 'Arithmetic' },
  hcflcm:      { name: 'HCF & LCM',       icon: 'ðŸ”„', color: '#4a90d9', cat: 'Arithmetic' },
  primefactor: { name: 'Prime Factors',   icon: 'ðŸ’Ž', color: '#5cb87a', cat: 'Arithmetic' },
  squaring:    { name: 'Squaring',         icon: 'ðŸ“', color: '#9b59b6', cat: 'Arithmetic' },
  sqrt:        { name: 'Square Root',      icon: 'âˆš',  color: '#5cb87a', cat: 'Arithmetic' },
  rounding:    { name: 'Rounding',         icon: 'ðŸŽ¯', color: '#4a90d9', cat: 'Arithmetic' },
  decimals:    { name: 'Decimals',         icon: 'Â·',  color: '#7aa2f7', cat: 'Arithmetic' },
  bases:       { name: 'Number Bases',     icon: 'ðŸ–¥',  color: '#5cb87a', cat: 'Arithmetic' },
  stdform:     { name: 'Standard Form',    icon: 'ðŸ”¬', color: '#9b59b6', cat: 'Arithmetic' },
  sdt:         { name: 'Speed, Dist, Time', icon: 'ðŸŽ',  color: '#4a90d9', cat: 'Arithmetic' },
  fractionadd: { name: 'Fractions',        icon: ' fractions', color: '#5cb87a', cat: 'Fractions & Ratios' },
  ratio:       { name: 'Ratio',            icon: 'âš–ï¸', color: '#4a90d9', cat: 'Fractions & Ratios' },
  percent:     { name: 'Percentages',      icon: '%',  color: '#7aa2f7', cat: 'Fractions & Ratios' },
  profitloss:  { name: 'Profit & Loss',    icon: 'ðŸ’°', color: '#9b59b6', cat: 'Fractions & Ratios' },
  banking:     { name: 'Banking',          icon: 'ðŸ¦', color: '#4a90d9', cat: 'Fractions & Ratios' },
  gst:         { name: 'GST',              icon: 'ðŸ§¾', color: '#5cb87a', cat: 'Fractions & Ratios' },
  shares:      { name: 'Shares',           icon: 'ðŸ“ˆ', color: '#9b59b6', cat: 'Fractions & Ratios' },
  variation:   { name: 'Variation',        icon: 'â†”ï¸', color: '#7aa2f7', cat: 'Algebra' },
  lineareq:    { name: 'Linear Equations', icon: 'x',  color: '#4a90d9', cat: 'Algebra' },
  simul:       { name: 'Sim. Equations',   icon: '{x}',color: '#9b59b6', cat: 'Algebra' },
  quadratic:   { name: 'Quadratic',        icon: 'xÂ²', color: '#7aa2f7', cat: 'Algebra' },
  qformula:    { name: 'Quadratic Formula', icon: 'Â±',  color: '#5cb87a', cat: 'Algebra' },
  funceval:    { name: 'Functions',        icon: 'f(x)', color: '#4a90d9', cat: 'Algebra' },
  sequences:   { name: 'Sequences',        icon: 'â€¦',  color: '#9b59b6', cat: 'Algebra' },
  indices:     { name: 'Indices',          icon: 'â¿',  color: '#5cb87a', cat: 'Algebra' },
  surds:       { name: 'Surds',            icon: 'âˆšn', color: '#7aa2f7', cat: 'Algebra' },
  log:         { name: 'Logarithms',       icon: 'log', color: '#9b59b6', cat: 'Algebra' },
  binomial:    { name: 'Binomial',         icon: 'C(n,k)', color: '#4a90d9', cat: 'Algebra' },
  complex:     { name: 'Complex Numbers',  icon: 'i',  color: '#5cb87a', cat: 'Algebra' },
  remfactor:   { name: 'Remainder Thm',    icon: 'R(x)', color: '#7aa2f7', cat: 'Algebra' },
  lineq:       { name: 'Line Equation',    icon: 'mx+c', color: '#4a90d9', cat: 'Algebra' },
  ineq:        { name: 'Inequalities',     icon: '<>',  color: '#5cb87a', cat: 'Algebra' },
  diff:        { name: 'Differentiation',  icon: "dy/dx", color: '#9b59b6', cat: 'Calculus' },
  integ:       { name: 'Integration',      icon: 'âˆ«',  color: '#4a90d9', cat: 'Calculus' },
  limits:      { name: 'Limits',           icon: 'lim', color: '#5cb87a', cat: 'Calculus' },
  angles:      { name: 'Angles',           icon: 'âˆ ',  color: '#4a90d9', cat: 'Geometry' },
  triangles:   { name: 'Triangles',        icon: 'â–³',  color: '#7aa2f7', cat: 'Geometry' },
  pythag:      { name: 'Pythagoras',       icon: 'âŠ¥',  color: '#5cb87a', cat: 'Geometry' },
  polygons:    { name: 'Polygons',         icon: 'â¬¡',  color: '#9b59b6', cat: 'Geometry' },
  circleth:    { name: 'Circle Thms',      icon: 'âŠ™',  color: '#4a90d9', cat: 'Geometry' },
  coordgeom:   { name: 'Coord. Geometry',  icon: 'ðŸ“', color: '#7aa2f7', cat: 'Geometry' },
  section:     { name: 'Section Formula',  icon: 'Ã·',  color: '#5cb87a', cat: 'Geometry' },
  bearings:    { name: 'Bearings',         icon: 'ðŸ§­', color: '#9b59b6', cat: 'Geometry' },
  mensur:      { name: 'Mensuration',      icon: 'ðŸ“', color: '#4a90d9', cat: 'Geometry' },
  circmeasure: { name: 'Circular Measure', icon: 'å¼§', color: '#5cb87a', cat: 'Geometry' },
  heron:       { name: "Heron's Formula",  icon: 'â–³',  color: '#7aa2f7', cat: 'Geometry' },
  similarity:  { name: 'Similarity',       icon: 'âˆ',  color: '#9b59b6', cat: 'Geometry' },
  congruence:  { name: 'Congruence',       icon: 'â‰…',  color: '#5cb87a', cat: 'Geometry' },
  transform:   { name: 'Transformations',  icon: 'â†—',  color: '#4a90d9', cat: 'Geometry' },
  prob:        { name: 'Probability',      icon: 'ðŸŽ²', color: '#4a90d9', cat: 'Stats & Prob' },
  stats:       { name: 'Statistics',       icon: 'ðŸ“Š', color: '#7aa2f7', cat: 'Stats & Prob' },
  permcomb:    { name: 'Perm & Comb',      icon: 'nPr', color: '#9b59b6', cat: 'Stats & Prob' },
  matrix:      { name: 'Matrices',         icon: 'â–¦',  color: '#4a90d9', cat: 'Matrices & Vectors' },
  vectors:     { name: 'Vectors',          icon: 'â†’',  color: '#7aa2f7', cat: 'Matrices & Vectors' },
  dotprod:     { name: 'Dot Products',     icon: 'Â·',  color: '#5cb87a', cat: 'Matrices & Vectors' },
  trig:        { name: 'Trigonometry',     icon: 'âˆ¡',  color: '#5cb87a', cat: 'Trig & Misc' },
  invtrig:     { name: 'Inverse Trig',     icon: 'sinâ»Â¹', color: '#9b59b6', cat: 'Trig & Misc' },
  gk:          { name: 'GK',              icon: 'ðŸ§ ', color: '#5cb87a', cat: 'Trig & Misc' },
  vocab:       { name: 'Vocabulary',       icon: 'ðŸ“–', color: '#4a90d9', cat: 'Trig & Misc' },
  sudoku:      { name: 'Sudoku',           icon: 'ðŸ”¢', color: '#1abc9c', cat: 'Trig & Misc' },
  linprog:     { name: 'Linear Prog.',     icon: 'lin', color: '#5cb87a', cat: 'Trig & Misc' },
  conics:      { name: 'Conic Sections',   icon: 'â—¯',  color: '#9b59b6', cat: 'Geometry' },
};

const BATTLE_TOPICS = ['arithmetic', 'multiply', 'gk', 'sudoku', ...Object.keys(BATTLE_MODULES).filter(k => k !== 'sudoku')];

function generateBattleQ_addition() {
  const d = pick([1, 2, 3]);
  const range = d === 1 ? [1, 9] : d === 2 ? [10, 99] : [100, 999];
  const a = randomInt(...range), b = randomInt(...range);
  return { prompt: `${a} + ${b}`, answer: a + b, type: 'number' };
}
function generateBattleQ_basicarith() {
  const ops = ['+', 'âˆ’', 'Ã—'];
  const op = pick(ops);
  let a, b, answer;
  if (op === 'Ã—') { a = randomInt(2, 12); b = randomInt(2, 12); answer = a * b; }
  else { a = randomInt(1, 99); b = randomInt(1, 99); answer = op === '+' ? a + b : a - b; }
  return { prompt: `${a} ${op} ${b}`, answer, type: 'number' };
}
function generateBattleQ_hcflcm() {
  const type = pick(['hcf', 'lcm']);
  const a = randomInt(2, 50), b = randomInt(2, 50);
  const g = gcd(a, b);
  return { prompt: type === 'hcf' ? `HCF of ${a} and ${b}` : `LCM of ${a} and ${b}`,
    answer: type === 'hcf' ? g : (a * b) / g, type: 'number' };
}
function generateBattleQ_primefactor() {
  const n = randomInt(2, 200);
  let temp = n, factors = [];
  for (let d = 2; d * d <= temp; d++) { while (temp % d === 0) { factors.push(d); temp /= d; } }
  if (temp > 1) factors.push(temp);
  return { prompt: `Prime factorize ${n}`, answer: factors.sort((a, b) => a - b).join('Ã—'), type: 'text' };
}
function generateBattleQ_squaring() {
  const a = randomInt(2, 30);
  return { prompt: `${a}Â² = ?`, answer: a * a, type: 'number' };
}
function generateBattleQ_sqrt() {
  const perfects = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
  const n = pick(perfects);
  return { prompt: `âˆš${n} = ?`, answer: Math.sqrt(n), type: 'number' };
}
function generateBattleQ_rounding() {
  const n = Math.round((randomInt(100, 9999) + Math.random()) * 100) / 100;
  const dp = pick([0, 1, 2]);
  const answer = dp === 0 ? Math.round(n) : Number(n.toFixed(dp));
  return { prompt: `Round ${n} to ${dp} d.p.`, answer, type: 'number' };
}
function generateBattleQ_decimals() {
  const op = pick(['+', 'âˆ’', 'Ã—']);
  const a = Math.round((randomInt(1, 50) + Math.random()) * 10) / 10;
  const b = Math.round((randomInt(1, 50) + Math.random()) * 10) / 10;
  let answer;
  if (op === '+') answer = Math.round((a + b) * 100) / 100;
  else if (op === 'âˆ’') answer = Math.round((a - b) * 100) / 100;
  else answer = Math.round(a * b * 100) / 100;
  return { prompt: `${a} ${op} ${b}`, answer, type: 'number' };
}
function generateBattleQ_bases() {
  const n = randomInt(10, 255);
  const base = pick([2, 8, 16]);
  const answer = n.toString(base).toUpperCase();
  const labels = { 2: 'binary', 8: 'octal', 16: 'hexadecimal' };
  return { prompt: `Convert ${n} to ${labels[base]}`, answer, type: 'text' };
}
function generateBattleQ_stdform() {
  const a = randomInt(1, 99);
  const exp = randomInt(1, 5);
  const n = a * Math.pow(10, exp);
  return { prompt: `Write ${n.toLocaleString()} in standard form (e.g. 3.5e7)`, answer: `${a}e${exp}`, type: 'text' };
}
function generateBattleQ_sdt() {
  const type = pick(['speed', 'distance', 'time']);
  if (type === 'speed') {
    const d = randomInt(10, 200), t = randomInt(2, 20);
    return { prompt: `Travel ${d}km in ${t}h. Speed?`, answer: d / t, type: 'number' };
  } else if (type === 'distance') {
    const s = randomInt(10, 100), t = randomInt(2, 15);
    return { prompt: `Speed ${s}km/h for ${t}h. Distance?`, answer: s * t, type: 'number' };
  } else {
    const d = randomInt(20, 200), s = randomInt(5, 50);
    return { prompt: `Travel ${d}km at ${s}km/h. Time (hours)?`, answer: d / s, type: 'number' };
  }
}
function generateBattleQ_fractionadd() {
  const d1 = randomInt(2, 12), d2 = randomInt(2, 12);
  const n1 = randomInt(1, d1 - 1), n2 = randomInt(1, d2 - 1);
  const op = pick(['+', 'âˆ’']);
  const rn = op === '+' ? n1 * d2 + n2 * d1 : n1 * d2 - n2 * d1;
  const rd = d1 * d2;
  const g = gcd(Math.abs(rn), rd);
  return { prompt: `${n1}/${d1} ${op} ${n2}/${d2} (as fraction a/b)`, answer: `${rn/g}/${rd/g}`, type: 'text' };
}
function generateBattleQ_ratio() {
  const a = randomInt(1, 10), b = randomInt(1, 10);
  const total = randomInt(20, 200);
  const answer = Math.round(a * total / (a + b));
  return { prompt: `Ratio ${a}:${b}, total = ${total}. Find the larger share.`, answer, type: 'number' };
}
function generateBattleQ_percent() {
  const base = randomInt(10, 500);
  const pct = pick([10, 15, 20, 25, 30, 40, 50]);
  const answer = base * pct / 100;
  return { prompt: `${pct}% of ${base} = ?`, answer, type: 'number' };
}
function generateBattleQ_profitloss() {
  const cp = randomInt(20, 200) * 5;
  const profit = randomInt(5, 40) * 5;
  return { prompt: `CP=$${cp}, SP=$${cp + profit}. Profit?`, answer: profit, type: 'number' };
}
function generateBattleQ_banking() {
  const p = randomInt(5, 50) * 1000, r = pick([5, 6, 7, 8, 10]);
  const t = pick([1, 2, 3]);
  const si = p * r * t / 100;
  return { prompt: `Simple interest on $${p} at ${r}% for ${t} year(s)?`, answer: si, type: 'number' };
}
function generateBattleQ_gst() {
  const price = randomInt(100, 5000);
  const rate = pick([5, 12, 18, 28]);
  const gst = Math.round(price * rate / 100);
  return { prompt: `GST on $${price} at ${rate}%?`, answer: gst, type: 'number' };
}
function generateBattleQ_shares() {
  const mv = randomInt(50, 200), fv = pick([10, 20, 50, 100]);
  const div = pick([5, 8, 10, 12, 15]);
  const shares = randomInt(5, 20);
  const income = shares * fv * div / 100;
  return { prompt: `${shares} shares, FV=$${fv}, dividend ${div}%. Annual income?`, answer: income, type: 'number' };
}
function generateBattleQ_variation() {
  const type = pick(['direct', 'inverse']);
  if (type === 'direct') {
    const x1 = randomInt(2, 10), y1 = randomInt(2, 20), x2 = randomInt(2, 10);
    const k = y1 / x1;
    return { prompt: `y âˆ x. When x=${x1}, y=${y1}. Find y when x=${x2}.`, answer: Math.round(k * x2 * 100) / 100, type: 'number' };
  } else {
    const x1 = randomInt(2, 10), y1 = randomInt(2, 20), x2 = randomInt(2, 10);
    const k = x1 * y1;
    return { prompt: `y âˆ 1/x. When x=${x1}, y=${y1}. Find y when x=${x2}.`, answer: Math.round(k / x2 * 100) / 100, type: 'number' };
  }
}
function generateBattleQ_lineareq() {
  const x = randomInt(-10, 10);
  const a = randomInt(1, 10), b = randomInt(-20, 20);
  const y = a * x + b;
  return { prompt: `Solve: ${a}x + ${b} = ${y}. x = ?`, answer: x, type: 'number' };
}
function generateBattleQ_simul() {
  const x = randomInt(-5, 5), y = randomInt(-5, 5);
  const a1 = randomInt(1, 5), b1 = randomInt(1, 5);
  const a2 = randomInt(1, 5), b2 = randomInt(-5, 5);
  if (a1 * b2 === a2 * b1) return generateBattleQ_lineareq();
  const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
  return { prompt: `${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. x = ?`, answer: x, type: 'number' };
}
function generateBattleQ_quadratic() {
  const a = randomInt(1, 5), b = randomInt(-10, 10), c = randomInt(-10, 10);
  const x = randomInt(-5, 5);
  const y = a * x * x + b * x + c;
  return { prompt: `y = ${a}xÂ² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}. Find y when x=${x}.`, answer: y, type: 'number' };
}
function generateBattleQ_qformula() {
  const r1 = randomInt(-8, 8), r2 = randomInt(-8, 8);
  const a = 1, b = -(r1 + r2), c = r1 * r2;
  return { prompt: `Solve xÂ² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0. Smaller root?`, answer: Math.min(r1, r2), type: 'number' };
}
function generateBattleQ_funceval() {
  const a = randomInt(1, 10), b = randomInt(-10, 10), x = randomInt(-5, 5);
  return { prompt: `f(x) = ${a}x ${b >= 0 ? '+' : ''}${b}. f(${x}) = ?`, answer: a * x + b, type: 'number' };
}
function generateBattleQ_sequences() {
  const a = randomInt(1, 20), d = pick([-5, -3, -2, -1, 1, 2, 3, 5]);
  const n = randomInt(5, 15);
  const terms = [a, a + d, a + 2 * d, a + 3 * d];
  return { prompt: `${terms.join(', ')}, ... Find ${n}th term.`, answer: a + (n - 1) * d, type: 'number' };
}
function generateBattleQ_indices() {
  const base = randomInt(2, 10), m = randomInt(2, 6), n = randomInt(2, 6);
  return { prompt: `${base}^${m} Ã— ${base}^${n} = ${base}^?`, answer: m + n, type: 'number' };
}
function generateBattleQ_surds() {
  const a = randomInt(2, 9), b = randomInt(2, 9);
  const n = a * a * b;
  return { prompt: `Simplify âˆš${n} (as aâˆšb, e.g. 3âˆš2)`, answer: `${a}âˆš${b}`, type: 'text' };
}
function generateBattleQ_log() {
  const base = pick([2, 3, 5, 10]), exp = randomInt(1, 5);
  const val = Math.pow(base, exp);
  return { prompt: `log base ${base} of ${val} = ?`, answer: exp, type: 'number' };
}
function generateBattleQ_binomial() {
  const n = randomInt(3, 8), r = randomInt(1, Math.min(n - 1, 4));
  let ans = 1;
  for (let i = 0; i < r; i++) ans = ans * (n - i) / (i + 1);
  return { prompt: `C(${n}, ${r}) = ?`, answer: ans, type: 'number' };
}
function generateBattleQ_complex() {
  const op = pick(['add', 'multiply']);
  const a1 = randomInt(-5, 5), b1 = randomInt(-5, 5), a2 = randomInt(-5, 5), b2 = randomInt(-5, 5);
  if (op === 'add') return { prompt: `(${a1}+${b1}i) + (${a2}+${b2}i) = ? (real part)`, answer: a1 + a2, type: 'number' };
  const re = a1 * a2 - b1 * b2, im = a1 * b2 + b1 * a2;
  return { prompt: `(${a1}+${b1}i) Ã— (${a2}+${b2}i) = ? (real part)`, answer: re, type: 'number' };
}
function generateBattleQ_remfactor() {
  const a = randomInt(-5, 5), b = randomInt(1, 5);
  const c = randomInt(-10, 10);
  const remainder = a * b + c;
  return { prompt: `P(x) = ${a}x + ${c >= 0 ? '+' : ''}${c}. Remainder when Ã·(x âˆ’ ${b})?`, answer: remainder, type: 'number' };
}
function generateBattleQ_lineq() {
  const m = randomInt(-5, 5), c = randomInt(-10, 10);
  const x1 = randomInt(-3, 3), x2 = randomInt(-3, 3);
  const y1 = m * x1 + c, y2 = m * x2 + c;
  return { prompt: `Line through (${x1},${y1}) and (${x2},${y2}). Slope m = ?`, answer: m, type: 'number' };
}
function generateBattleQ_ineq() {
  const x = randomInt(-5, 5);
  const a = randomInt(1, 5);
  const b = randomInt(-20, 20);
  const rhs = a * x + b;
  return { prompt: `Solve: ${a}x ${b >= 0 ? '+' : ''}${b} < ${rhs + a}. x < ?`, answer: x + 1, type: 'number' };
}
function generateBattleQ_diff() {
  const n = randomInt(2, 5), a = randomInt(1, 10);
  return { prompt: `d/dx (${a}x^${n}) = ? (coeff of x^${n - 1})`, answer: a * n, type: 'number' };
}
function generateBattleQ_integ() {
  const n = randomInt(1, 4), a = randomInt(1, 10);
  return { prompt: `âˆ«${a}x^${n} dx â†’ coeff of x^${n + 1} = ?`, answer: a / (n + 1), type: 'number' };
}
function generateBattleQ_limits() {
  const a = randomInt(1, 5), b = randomInt(1, 5);
  return { prompt: `lim(xâ†’0) (${a}x + ${b}) = ?`, answer: b, type: 'number' };
}
function generateBattleQ_angles() {
  const a1 = randomInt(20, 150), a2 = randomInt(20, 160 - a1);
  const a3 = 180 - a1 - a2;
  return { prompt: `Triangle angles: ${a1}Â°, ${a2}Â°, ?`, answer: a3, type: 'number' };
}
function generateBattleQ_triangles() {
  const a = randomInt(20, 70), b = randomInt(20, 160 - a - 10);
  return { prompt: `Triangle: two angles ${a}Â° and ${b}Â°. Third angle?`, answer: 180 - a - b, type: 'number' };
}
function generateBattleQ_pythag() {
  const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15]];
  const [a, b, c] = pick(triples);
  const type = pick(['hyp', 'leg']);
  if (type === 'hyp') return { prompt: `Right â–³ legs ${a} and ${b}. Hypotenuse?`, answer: c, type: 'number' };
  return { prompt: `Right â–³ hyp=${c}, leg=${a}. Other leg?`, answer: b, type: 'number' };
}
function generateBattleQ_polygons() {
  const n = pick([3, 4, 5, 6, 7, 8, 9, 10, 12]);
  const interior = (n - 2) * 180 / n;
  return { prompt: `Regular ${n}-gon. Each interior angle?`, answer: Math.round(interior * 100) / 100, type: 'number' };
}
function generateBattleQ_circleth() {
  const angle = randomInt(20, 150);
  return { prompt: `Angle at centre = ${angle * 2}Â°. Angle at circumference?`, answer: angle, type: 'number' };
}
function generateBattleQ_coordgeom() {
  const x1 = randomInt(-5, 5), y1 = randomInt(-5, 5), x2 = randomInt(-5, 5), y2 = randomInt(-5, 5);
  const type = pick(['mid', 'dist']);
  if (type === 'mid') return { prompt: `Midpoint of (${x1},${y1}) and (${x2},${y2}) x-coord?`, answer: (x1 + x2) / 2, type: 'number' };
  const d = Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 100) / 100;
  return { prompt: `Distance (${x1},${y1}) to (${x2},${y2}) = ?`, answer: d, type: 'number' };
}
function generateBattleQ_section() {
  const x1 = randomInt(0, 10), y1 = randomInt(0, 10), x2 = randomInt(0, 10), y2 = randomInt(0, 10);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return { prompt: `Section point of (${x1},${y1}) and (${x2},${y2}) â€” y-coord?`, answer: my, type: 'number' };
}
function generateBattleQ_bearings() {
  const angle = randomInt(10, 170);
  const bearing = (90 - angle + 360) % 360 || 360;
  return { prompt: `Bearing of point ${angle}Â° east of north = ?`, answer: bearing, type: 'number' };
}
function generateBattleQ_mensur() {
  const type = pick(['rect_area', 'circle_area', 'cyl_vol']);
  if (type === 'rect_area') {
    const l = randomInt(3, 20), w = randomInt(3, 20);
    return { prompt: `Rectangle ${l}Ã—${w}. Area?`, answer: l * w, type: 'number' };
  } else if (type === 'circle_area') {
    const r = randomInt(2, 10);
    return { prompt: `Circle r=${r}. Area? (round to 1dp)`, answer: Math.round(Math.PI * r * r * 10) / 10, type: 'number' };
  } else {
    const r = randomInt(2, 8), h = randomInt(3, 15);
    return { prompt: `Cylinder r=${r}, h=${h}. Volume? (round to 1dp)`, answer: Math.round(Math.PI * r * r * h * 10) / 10, type: 'number' };
  }
}
function generateBattleQ_circmeasure() {
  const r = randomInt(3, 15), theta = pick([30, 45, 60, 90, 120]);
  const arc = Math.round(r * theta * Math.PI / 180 * 100) / 100;
  return { prompt: `Arc length: r=${r}, Î¸=${theta}Â° = ? (round to 1dp)`, answer: Math.round(arc * 10) / 10, type: 'number' };
}
function generateBattleQ_heron() {
  const a = randomInt(3, 12), b = randomInt(3, 12), c = a + randomInt(1, 3);
  const s = (a + b + c) / 2;
  const area = Math.round(Math.sqrt(s * (s - a) * (s - b) * (s - c)) * 100) / 100;
  return { prompt: `â–³ sides ${a},${b},${c}. Area? (round to 1dp)`, answer: Math.round(area * 10) / 10, type: 'number' };
}
function generateBattleQ_similarity() {
  const a = randomInt(3, 10), b = randomInt(3, 10);
  const k = randomInt(2, 4);
  return { prompt: `Scale factor ${k}. Side ${a} becomes ?`, answer: a * k, type: 'number' };
}
function generateBattleQ_congruence() {
  const criteria = ['SSS', 'SAS', 'ASA', 'RHS', 'AAS'];
  const c = pick(criteria);
  const wrong = criteria.filter(x => x !== c);
  const options = [c, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  return { prompt: `Two triangles with two sides + included angle equal. Criterion?`, options, answer: options.indexOf(c), type: 'mcq' };
}
function generateBattleQ_transform() {
  const ops = ['Translation', 'Rotation', 'Reflection', 'Enlargement'];
  const o = pick(ops);
  const wrong = ops.filter(x => x !== o);
  const options = [o, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  return { prompt: `A shape is moved keeping size and orientation same. Type?`, options, answer: options.indexOf(o), type: 'mcq' };
}
function generateBattleQ_prob() {
  const total = randomInt(4, 20), favorable = randomInt(1, total - 1);
  const g = gcd(favorable, total);
  return { prompt: `Probability: ${favorable} red out of ${total}. Simplify.`, answer: `${favorable/g}/${total/g}`, type: 'text' };
}
function generateBattleQ_stats() {
  const nums = Array.from({ length: 5 }, () => randomInt(1, 30));
  const sorted = [...nums].sort((a, b) => a - b);
  const median = sorted[2];
  return { prompt: `Find median of: ${nums.join(', ')}`, answer: median, type: 'number' };
}
function generateBattleQ_permcomb() {
  const type = pick(['P', 'C']);
  const n = randomInt(4, 8), r = randomInt(2, 4);
  let ans = 1;
  for (let i = 0; i < r; i++) ans *= (n - i);
  if (type === 'C') { let d = 1; for (let i = 1; i <= r; i++) d *= i; ans /= d; }
  return { prompt: `${type}(${n},${r}) = ?`, answer: ans, type: 'number' };
}
function generateBattleQ_matrix() {
  const a = randomInt(1, 9), b = randomInt(1, 9), c = randomInt(1, 9), d = randomInt(1, 9);
  return { prompt: `Matrix [[${a},${b}],[${c},${d}]]. Trace = ?`, answer: a + d, type: 'number' };
}
function generateBattleQ_vectors() {
  const ax = randomInt(-5, 5), ay = randomInt(-5, 5), bx = randomInt(-5, 5), by = randomInt(-5, 5);
  return { prompt: `(${ax},${ay}) + (${bx},${by}) = (x,y). x = ?`, answer: ax + bx, type: 'number' };
}
function generateBattleQ_dotprod() {
  const ax = randomInt(-5, 5), ay = randomInt(-5, 5), bx = randomInt(-5, 5), by = randomInt(-5, 5);
  return { prompt: `(${ax},${ay})Â·(${bx},${by}) = ?`, answer: ax * bx + ay * by, type: 'number' };
}
function generateBattleQ_trig() {
  const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15]];
  const [a, b, c] = pick(triples);
  const sub = pick(['find_hyp', 'find_leg']);
  if (sub === 'find_hyp') return { prompt: `Right â–³ legs ${a} and ${b}. Hypotenuse?`, answer: c, type: 'number' };
  return { prompt: `Right â–³ hyp=${c}, leg=${a}. Other leg?`, answer: b, type: 'number' };
}
function generateBattleQ_invtrig() {
  const angles = [30, 45, 60, 90];
  const a = pick(angles);
  return { prompt: `sinâ»Â¹(sin(${a}Â°)) = ?`, answer: a, type: 'number' };
}
// generateBattleQ_gk is defined earlier (line ~12311) using hoisted declaration
function generateBattleQ_vocab() {
  if (!vocabQuestions || !vocabQuestions.length) return generateBattleQ_gk();
  const q = pick(vocabQuestions);
  const correct = q.meaning;
  const others = vocabQuestions.filter(v => v.word !== q.word).slice(0, 3).map(v => v.meaning);
  const options = [correct, ...others].sort(() => Math.random() - 0.5);
  return { prompt: `What does "${q.word}" mean?`, options, answer: options.indexOf(correct), type: 'mcq' };
}
function generateBattleQ_linprog() {
  const x = randomInt(1, 5), y = randomInt(1, 5);
  const a = randomInt(1, 5), b = randomInt(1, 5);
  return { prompt: `Max Z = ${a}x + ${b}y at (${x},${y}). Z = ?`, answer: a * x + b * y, type: 'number' };
}
function generateBattleQ_conics() {
  const types = ['Circle', 'Parabola', 'Ellipse', 'Hyperbola'];
  const t = pick(types);
  const wrong = types.filter(x => x !== t);
  const options = [t, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  return { prompt: `Which conic: xÂ² + yÂ² = 25?`, options, answer: options.indexOf('Circle'), type: 'mcq' };
}

const BATTLE_Q_GENERATORS = {
  addition: generateBattleQ_addition, multiply: generateBattleQ_multiply,
  basicarith: generateBattleQ_basicarith, hcflcm: generateBattleQ_hcflcm,
  primefactor: generateBattleQ_primefactor, squaring: generateBattleQ_squaring,
  sqrt: generateBattleQ_sqrt, rounding: generateBattleQ_rounding,
  decimals: generateBattleQ_decimals, bases: generateBattleQ_bases,
  stdform: generateBattleQ_stdform, sdt: generateBattleQ_sdt,
  fractionadd: generateBattleQ_fractionadd, ratio: generateBattleQ_ratio,
  percent: generateBattleQ_percent, profitloss: generateBattleQ_profitloss,
  banking: generateBattleQ_banking, gst: generateBattleQ_gst,
  shares: generateBattleQ_shares, variation: generateBattleQ_variation,
  lineareq: generateBattleQ_lineareq, simul: generateBattleQ_simul,
  quadratic: generateBattleQ_quadratic, qformula: generateBattleQ_qformula,
  funceval: generateBattleQ_funceval, sequences: generateBattleQ_sequences,
  indices: generateBattleQ_indices, surds: generateBattleQ_surds,
  log: generateBattleQ_log, binomial: generateBattleQ_binomial,
  complex: generateBattleQ_complex, remfactor: generateBattleQ_remfactor,
  lineq: generateBattleQ_lineq, ineq: generateBattleQ_ineq,
  diff: generateBattleQ_diff, integ: generateBattleQ_integ,
  limits: generateBattleQ_limits, angles: generateBattleQ_angles,
  triangles: generateBattleQ_triangles, pythag: generateBattleQ_pythag,
  polygons: generateBattleQ_polygons, circleth: generateBattleQ_circleth,
  coordgeom: generateBattleQ_coordgeom, section: generateBattleQ_section,
  bearings: generateBattleQ_bearings, mensur: generateBattleQ_mensur,
  circmeasure: generateBattleQ_circmeasure, heron: generateBattleQ_heron,
  similarity: generateBattleQ_similarity, congruence: generateBattleQ_congruence,
  transform: generateBattleQ_transform, prob: generateBattleQ_prob,
  stats: generateBattleQ_stats, permcomb: generateBattleQ_permcomb,
  matrix: generateBattleQ_matrix, vectors: generateBattleQ_vectors,
  dotprod: generateBattleQ_dotprod, trig: generateBattleQ_trig,
  invtrig: generateBattleQ_invtrig, gk: generateBattleQ_gk,
  vocab: generateBattleQ_vocab, linprog: generateBattleQ_linprog,
  conics: generateBattleQ_conics,
};

function generateSudokuBattleQ() {
  const { grid } = sudokuGenerate('easy');
  const hintType = pick(['row', 'col', 'box']);
  let r, c, hint;
  if (hintType === 'row') {
    r = randomInt(0, 8);
    const empties = [];
    for (let col = 0; col < 9; col++) if (grid[r][col] === 0) empties.push(col);
    if (!empties.length) return generateBattleQ_arithmetic();
    c = pick(empties);
    hint = `Row ${r + 1}`;
  } else if (hintType === 'col') {
    c = randomInt(0, 8);
    const empties = [];
    for (let row = 0; row < 9; row++) if (grid[row][c] === 0) empties.push(row);
    if (!empties.length) return generateBattleQ_arithmetic();
    r = pick(empties);
    hint = `Column ${c + 1}`;
  } else {
    const br = randomInt(0, 2) * 3, bc = randomInt(0, 2) * 3;
    const empties = [];
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) if (grid[br + dr][bc + dc] === 0) empties.push([br + dr, bc + dc]);
    if (!empties.length) return generateBattleQ_arithmetic();
    [r, c] = pick(empties);
    hint = `Box ${Math.floor(br / 3) * 3 + Math.floor(bc / 3) + 1}`;
  }
  return { prompt: 'What number fills the empty cell?', grid, row: r, col: c, answer: grid[r][c], hint, type: 'number' };
}

function startSudokuRace(room) {
  const { grid, solution } = sudokuGenerate('medium');
  room.sudokuPuzzle = grid;
  room.sudokuSolution = solution;
  room.sudokuRaceStart = Date.now();
  room.sudokuGrids = {};
  room.sudokuCompleted = {};
  for (const p of room.players) {
    room.sudokuGrids[p.socketId] = grid.map(row => [...row]);
  }
  io.to(room.code).emit('sudokuRaceStart', {
    puzzle: grid,
    raceStart: room.sudokuRaceStart,
  });
}

function endSudokuRace(room) {
  if (!room || room.state === 'ended') return;
  room.state = 'ended';
  const sol = room.sudokuSolution;
  const results = room.players.map(p => {
    const grid = room.sudokuGrids[p.socketId] || [];
    let errors = 0;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (sol[r][c] !== 0 && Number(grid[r]?.[c]) !== sol[r][c]) errors++;
    const completed = room.sudokuCompleted[p.socketId];
    return { id: p.socketId, name: p.name, errors, completed: !!completed, time: completed?.time || null };
  });
  results.sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    if (a.completed && b.completed) return a.time - b.time;
    return a.errors - b.errors;
  });
  const winner = results[0].errors === results[1].errors && results[0].time === results[1].time
    ? 'draw' : results[0].id;
  const scores = results.map(r => ({
    id: r.id, name: r.name, score: r.completed ? Math.max(100 - r.errors * 5, 10) : Math.max(50 - r.errors * 5, 0),
  }));
  io.to(room.code).emit('matchEnd', {
    winner,
    finalScores: scores,
    topic: room.topic,
    numQuestions: 1,
    history: [{
      round: 1,
      prompt: 'Sudoku Race',
      type: 'sudoku-race',
      players: results.map(r => ({
        id: r.id, name: r.name, correct: r.completed && r.errors === 0,
        time: r.time, errors: r.errors, completed: r.completed,
      })),
      winner: winner === 'draw' ? 'draw' : winner,
    }],
    players: room.players.map(p => ({ id: p.socketId, name: p.name })),
    sudokuResults: results,
  });
  rooms.delete(room.code);
}

function generateBattleQuestion(topic) {
  if (topic === 'sudoku') return generateSudokuBattleQ();
  const gen = BATTLE_Q_GENERATORS[topic];
  if (gen) return gen();
  return generateBattleQ_arithmetic();
}

function startRound(room) {
  const q = generateBattleQuestion(room.topic);
  room.currentQuestion = q;
  room.roundStartTime = Date.now();
  room.answers = {};
  room.round++;
  io.to(room.code).emit('roundStart', {
    prompt: q.prompt,
    options: q.options || null,
    type: q.type,
    round: room.round,
    total: room.numQuestions,
    duration: ROUND_DURATION_MS,
    streaks: room.streaks,
  });
  room.roundTimer = setTimeout(() => endRound(room), ROUND_DURATION_MS);
}

function endRound(room) {
  if (!room || room.state !== 'playing') return;
  clearTimeout(room.roundTimer);
  const q = room.currentQuestion;
  const results = {};
  let winner = null;
  let bestTime = Infinity;
  for (const p of room.players) {
    const ans = room.answers[p.socketId];
    if (ans !== undefined && ans.correct) {
      results[p.socketId] = { correct: true, time: ans.time };
      if (ans.time < bestTime) { bestTime = ans.time; winner = p.socketId; }
    } else {
      results[p.socketId] = { correct: false, time: room.answers[p.socketId]?.time || null };
    }
  }
  for (const p of room.players) {
    if (winner === p.socketId) p.score += 10 + Math.max(0, Math.round((ROUND_DURATION_MS - (results[p.socketId]?.time || 0)) / 1500));
    else if (results[p.socketId]?.correct) p.score += 5;
  }
  for (const p of room.players) {
    if (results[p.socketId]?.correct) {
      room.streaks[p.socketId] = (room.streaks[p.socketId] || 0) + 1;
    } else {
      room.streaks[p.socketId] = 0;
    }
  }
  const correctAnswer = q.type === 'mcq' ? q.options[q.answer] : q.answer;
  room.roundHistory.push({
    round: room.round,
    prompt: q.prompt,
    correctAnswer,
    type: q.type,
    players: room.players.map(p => ({
      id: p.socketId,
      name: p.name,
      correct: results[p.socketId]?.correct || false,
      time: results[p.socketId]?.time || null,
      answer: room.answers[p.socketId] != null ? (q.type === 'mcq' ? q.options[Number(room.answers[p.socketId].raw)] : room.answers[p.socketId].raw) : null,
    })),
    winner,
  });
  io.to(room.code).emit('roundResult', {
    winner,
    correctAnswer,
    scores: room.players.map(p => ({ id: p.socketId, name: p.name, score: p.score })),
    results,
    streaks: room.streaks,
    players: room.players.map(p => ({
      id: p.socketId,
      name: p.name,
      correct: results[p.socketId]?.correct || false,
      time: results[p.socketId]?.time || null,
    })),
  });
  room.currentQuestion = null;
  if (room.round >= room.numQuestions) {
    setTimeout(() => endMatch(room), 2500);
  } else {
    room.state = 'between_rounds';
    setTimeout(() => {
      if (room.state === 'between_rounds') { room.state = 'playing'; startRound(room); }
    }, 3000);
  }
}

function endMatch(room) {
  if (!room || room.state === 'ended') return;
  room.state = 'ended';
  const scores = room.players.map(p => ({ id: p.socketId, name: p.name, score: p.score }));
  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0].score > scores[1].score ? scores[0].id
    : scores[0].score === scores[1].score ? 'draw' : scores[1].id;
  io.to(room.code).emit('matchEnd', {
    winner,
    finalScores: scores,
    topic: room.topic,
    numQuestions: room.numQuestions,
    history: room.roundHistory,
    players: room.players.map(p => ({ id: p.socketId, name: p.name })),
    streaks: room.streaks,
  });
  rooms.delete(room.code);
}

io.on('connection', (socket) => {
  socket.on('getOpenRooms', () => {
    const openRooms = {};
    for (const topic of BATTLE_TOPICS) openRooms[topic] = [];
    for (const [code, room] of rooms) {
      if (room.state === 'waiting' && openRooms[room.topic]) {
        openRooms[room.topic].push({
          code,
          host: room.players[0]?.name || 'Player',
          numQuestions: room.numQuestions,
          players: room.players.length,
        });
      }
    }
    socket.emit('openRooms', openRooms);
  });

  socket.on('createRoom', ({ name, topic, numQuestions }, cb) => {
    const code = generateRoomCode();
    const nq = BATTLE_QUESTION_COUNTS.includes(numQuestions) ? numQuestions : 5;
    if (!BATTLE_TOPICS.includes(topic)) {
      return cb?.({ ok: false, error: `Unknown topic: ${topic}` });
    }
    const room = {
      code, topic,
      numQuestions: nq,
      players: [{ socketId: socket.id, name: (name || 'Player').slice(0, 20), score: 0, ready: false }],
      round: 0, state: 'waiting', currentQuestion: null, roundStartTime: 0, answers: {}, roundTimer: null,
      roundHistory: [], streaks: {},
    };
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    cb?.({ ok: true, code, players: room.players.map(p => ({ id: p.socketId, name: p.name })) });
    broadcastOpenRooms();
  });

  socket.on('joinRoom', ({ code, name }, cb) => {
    const room = rooms.get(code?.toUpperCase());
    if (!room) return cb?.({ ok: false, error: 'Room not found.' });
    if (room.players.length >= 2) return cb?.({ ok: false, error: 'Room is full.' });
    if (room.state !== 'waiting') return cb?.({ ok: false, error: 'Match already in progress.' });
    room.players.push({ socketId: socket.id, name: (name || 'Player').slice(0, 20), score: 0, ready: false });
    socket.join(code);
    socket.roomCode = code;
    io.to(code).emit('roomUpdate', {
      players: room.players.map(p => ({ id: p.socketId, name: p.name, ready: p.ready })),
      topic: room.topic,
    });
    cb?.({ ok: true, code, players: room.players.map(p => ({ id: p.socketId, name: p.name })) });
    broadcastOpenRooms();
  });

  socket.on('ready', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'waiting') return;
    const player = room.players.find(p => p.socketId === socket.id);
    if (player) player.ready = true;
    io.to(room.code).emit('roomUpdate', {
      players: room.players.map(p => ({ id: p.socketId, name: p.name, ready: p.ready })),
      topic: room.topic,
    });
    if (room.players.length === 2 && room.players.every(p => p.ready)) {
      room.state = 'playing';
      io.to(room.code).emit('matchStart', { topic: room.topic, rounds: room.numQuestions });
      broadcastOpenRooms();
      if (room.topic === 'sudoku') {
        setTimeout(() => startSudokuRace(room), 1500);
      } else {
        setTimeout(() => startRound(room), 1500);
      }
    }
  });

  socket.on('submitAnswer', ({ answer }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'playing' || !room.currentQuestion) return;
    if (room.answers[socket.id]) return;
    const q = room.currentQuestion;
    const time = Date.now() - room.roundStartTime;
    let correct = false;
    if (q.type === 'mcq') correct = Number(answer) === q.answer;
    else correct = Number(answer) === q.answer;
    room.answers[socket.id] = { correct, time, raw: answer };
    socket.to(room.code).emit('opponentAnswered', { playerId: socket.id, answeredCount: Object.keys(room.answers).length });
    if (Object.keys(room.answers).length >= 2) endRound(room);
  });

  socket.on('submitCell', ({ r, c, val }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'playing' || room.topic !== 'sudoku') return;
    if (!room.sudokuGrids?.[socket.id]) return;
    const num = Number(val);
    if (r < 0 || r > 8 || c < 0 || c > 8 || isNaN(num) || num < 0 || num > 9) return;
    if (room.sudokuPuzzle[r][c] !== 0) return;
    room.sudokuGrids[socket.id][r][c] = num;
    socket.to(room.code).emit('opponentCellUpdate', { r, c, val: num });
  });

  socket.on('sudokuComplete', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state !== 'playing' || room.topic !== 'sudoku') return;
    if (room.sudokuCompleted[socket.id]) return;
    const time = Date.now() - room.sudokuRaceStart;
    room.sudokuCompleted[socket.id] = { time };
    socket.to(room.code).emit('opponentFinished', { playerId: socket.id, time });
    if (Object.keys(room.sudokuCompleted).length >= 2) {
      endSudokuRace(room);
    } else {
      setTimeout(() => {
        if (room.state === 'playing' && Object.keys(room.sudokuCompleted).length < 2) {
          endSudokuRace(room);
        }
      }, 30000);
    }
  });

  socket.on('leave', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    room.players = room.players.filter(p => p.socketId !== socket.id);
    socket.leave(room.code);
    clearTimeout(room.roundTimer);
    if (room.players.length === 0) {
      rooms.delete(room.code);
    } else {
      io.to(room.code).emit('opponentLeft', { name: 'Opponent' });
      // Mark the room as ended so any leftover submit/ready events from
      // the leaving socket can't keep score flowing into a phantom match.
      room.state = 'ended';
    }
    socket.roomCode = null;
    broadcastOpenRooms();
  });

  socket.on('sendReaction', ({ emoji }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.state === 'ended') return;
    socket.to(room.code).emit('opponentReaction', { emoji, from: socket.id });
  });

  socket.on('disconnect', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socket.id);
    room.players = room.players.filter(p => p.socketId !== socket.id);
    clearTimeout(room.roundTimer);
    if (room.players.length === 0) {
      rooms.delete(room.code);
    } else {
      io.to(room.code).emit('opponentLeft', { name: player?.name || 'Opponent' });
      // Same fix as in 'leave': don't delete the room out from under the
      // remaining player. Mark it ended so any in-flight events from the
      // disconnecting socket can't continue to mutate it.
      room.state = 'ended';
    }
    broadcastOpenRooms();
  });
});

// Global error handler â€” catches anything an individual route didn't handle
// itself (thrown errors, and in Express 5, rejected async handlers too).
// Must be registered after all routes. Logs full detail server-side but
// never leaks stack traces to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('http', `${req.method} ${req.originalUrl} ->`, err);
  if (res.headersSent) return;
  // Map common client-error statuses (and Express body-parser's
  // SyntaxError â†’ 400) to a useful message instead of the misleading
  // 'Internal server error'. Anything we don't recognise still falls
  // through to 500.
  const status = err.status || 500;
  let message = 'Internal server error';
  if (status === 400) {
    message = err.type === 'entity.parse.failed' || err instanceof SyntaxError
      ? 'Invalid JSON body'
      : 'Bad request';
  } else if (status === 413) {
    message = 'Request body too large';
  } else if (status === 415) {
    message = 'Unsupported media type';
  }
  res.status(status).json({ error: message });
});

// Loads the two large question sets concurrently (Promise.all lets their
// internal per-file reads all overlap on libuv's thread pool, rather than
// finishing the ~991 GK files, then starting the ~7,600 vocab files) and
// assigns them into the module-level `questions`/`vocabQuestions` variables
// that every route closure below already references by name.
async function initData() {
  const [loadedQuestions, loadedVocab] = await Promise.all([
    loadJsonDir(questionsDir),
    loadVocabAsync(),
  ]);
  questions = loadedQuestions;
  vocabQuestions = loadedVocab;
  banks.gk = questions;
  banks.vocab = vocabQuestions;
}

if (require.main === module) {
  initData()
    .then(() => {
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Tenali app running on http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error('startup', 'Failed to load question/vocab data:', err);
      process.exit(1);
    });
} else {
  // Required as a module (e.g. by tests) rather than run directly â€” still
  // populate the data so route handlers work, without starting the listener.
  initData().catch((err) => logger.error('startup', 'Failed to load question/vocab data:', err));
}

module.exports = app;
module.exports.io = io;


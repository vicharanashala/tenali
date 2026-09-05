'use strict';
const router = require('express').Router();
const auth = require('../auth');
const transferScenarios = require('../transferScenarios');

const PORT = process.env.PORT || 4000;

// getUserFromReq — DB-backed lookup used only for best-effort attempt logging.
// ponytail: DB-only; the index.js in-memory fallback isn't replicated here to
// avoid forking the shared in-memory profile state — attempt logging already
// only persists for real DB users (StudentAttemptLog requires a connected DB).
async function getUserFromReq(req) {
  const authHeader = req.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!m) return null;
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = auth.JWT_SECRET;
    const payload = jwt.verify(m[1], JWT_SECRET);
    if (payload && payload.username) {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        try {
          const dbUser = await auth.User.findById(payload.sub || payload.username);
          if (dbUser) return dbUser;
        } catch (dbErr) {
          console.error('[auth] Database query failed:', dbErr.message);
        }
      }
    }
  } catch (e) {
    console.error('[auth] getUserFromReq error:', e.message);
  }
  return null;
}

function compareAnswers(userStr, expected) {
  if (expected === undefined || expected === null) return false;

  const cleanUser = String(userStr || '').replace(/\s+/g, '').replace(/[%₹$,]/g, '').replace(/−/g, '-');

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

function generateGenericTransfer(topic, originalQuestion) {
  const cleanPrompt = String(originalQuestion.prompt || '')
    .trim()
    .replace(/^(Calculate|Evaluate|Solve|Find|What is|Compute|Value of)\s*:?/i, '')
    .trim();

  const mathExpr = cleanPrompt || 'the given calculation';

  const contexts = [
    {
      key: 'shopping',
      name: 'Shopping',
      icon: '🛒',
      templates: [
        `Arjun is shopping at a local store. The cashier's terminal displays the transaction balance: '${mathExpr}'. What is the computed total?`,
        `Ananya is checking out items from her online shopping cart. The payment gateway requires verifying the transaction key: '${mathExpr}'. Solve it to complete the purchase.`,
        `Ravi gets a discount coupon at a store. The cashier tells him the final bill amount depends on solving: '${mathExpr}'. Find the final price.`
      ]
    },
    {
      key: 'sports',
      name: 'Sports',
      icon: '🏏',
      templates: [
        `During a cricket match, the run-rate analyzer software evaluates the team's projection equation: '${mathExpr}'. What is the correct value?`,
        `A coach is comparing running times and performance metrics. The comparison formula evaluates to: '${mathExpr}'. Compute the final value.`
      ]
    },
    {
      key: 'cooking',
      name: 'Cooking',
      icon: '🍕',
      templates: [
        `A pastry chef is scaling up recipe measurements for a large banquet. The ratio equation is written as: '${mathExpr}'. Find the scaled value.`,
        `Priya is adjusting spice levels for a pizza recipe. She needs to solve the following proportion calculation: '${mathExpr}'. What is the resulting quantity?`
      ]
    },
    {
      key: 'travel',
      name: 'Travel',
      icon: '🚂',
      templates: [
        `Priya is traveling on an express train. The digital route information system displays the estimated speed calculation: '${mathExpr}'. Calculate the speed value.`,
        `An outdoor guide maps the route distances using a dynamic scale. The trekking formula reduces to: '${mathExpr}'. Find the distance.`
      ]
    },
    {
      key: 'pocketmoney',
      name: 'Pocket Money',
      icon: '🪙',
      templates: [
        `Meena is planning her savings and weekly pocket money budget. She writes down the budget expression: '${mathExpr}'. What is the final amount?`,
        `Rohan is counting coins to purchase a science book. The price formula evaluates to: '${mathExpr}'. What is the final cost of the book?`
      ]
    }
  ];

  const selectedContext = contexts[Math.floor(Math.random() * contexts.length)];
  const selectedTemplate = selectedContext.templates[Math.floor(Math.random() * selectedContext.templates.length)];

  return {
    scenarioId: `generic-transfer-${topic}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    context: selectedContext.key,
    prompt: selectedTemplate,
    hints: [
      `This challenge requires you to solve the underlying math problem: '${mathExpr}'.`,
      `Apply the same algebraic or arithmetic methods you used in Stage 3 Practice.`,
      `Solve the calculation step-by-step to find the correct value.`
    ],
    variables: {
      originalQuestion,
      topic
    },
    icon: selectedContext.icon,
    transferLevel: 2,
    topic: topic
  };
}

function buildSubCheckBody(topic, originalQuestion, userAnswer) {
  const userStr = String(userAnswer || '').trim();
  if (['addition', 'basicarith', 'quadratic', 'sqrt', 'multiply'].includes(topic)) {
    return {
      ...originalQuestion,
      answer: userStr,
      userAnswer: userStr
    };
  }
  if (topic === 'vocab') {
    return {
      ...originalQuestion,
      answerOption: userStr,
      userAnswer: userStr
    };
  }
  return {
    ...originalQuestion,
    userAnswer: userStr
  };
}

function generateGenericExplanation(topic, originalQuestion, expectedAnswer) {
  const prompt = originalQuestion.prompt || '';
  switch (topic) {
    case 'addition': {
      const a = originalQuestion.a !== undefined ? originalQuestion.a : '';
      const b = originalQuestion.b !== undefined ? originalQuestion.b : '';
      return `Step 1: Identify the numbers to add → ${a} and ${b}\n` +
             `Step 2: Align and compute the sum → ${a} + ${b} = ${expectedAnswer}`;
    }
    case 'basicarith': {
      return `Step 1: Parse the arithmetic expression → ${prompt}\n` +
             `Step 2: Solve the calculation step-by-step → ${expectedAnswer}`;
    }
    case 'decimals': {
      return `Step 1: Align the decimal numbers → ${prompt}\n` +
             `Step 2: Perform the arithmetic operation → ${expectedAnswer}`;
    }
    case 'sqrt': {
      const q = originalQuestion.q !== undefined ? originalQuestion.q : '';
      return `Step 1: Find the square root approximation → √${q}\n` +
             `Step 2: Round to the nearest integer → ${expectedAnswer}`;
    }
    case 'quadratic': {
      const a = originalQuestion.a !== undefined ? originalQuestion.a : '';
      const b = originalQuestion.b !== undefined ? originalQuestion.b : '';
      const c = originalQuestion.c !== undefined ? originalQuestion.c : '';
      const x = originalQuestion.x !== undefined ? originalQuestion.x : '';
      return `Step 1: Identify the quadratic expression → y = ${a}x² + (${b})x + (${c})\n` +
             `Step 2: Substitute x = ${x} → ${a}(${x})² + (${b})(${x}) + (${c})\n` +
             `Step 3: Evaluate → ${expectedAnswer}`;
    }
    default: {
      return `Step 1: Parse the problem statement → ${prompt}\n` +
             `Step 2: Solve step-by-step using standard rules → ${expectedAnswer}`;
    }
  }
}

router.get('/question', async (req, res) => {
  try {
    const topic = String(req.query.topic || '').trim().toLowerCase();
    if (!topic) {
      return res.status(400).json({ error: 'Topic parameter is required' });
    }

    const scenarios = transferScenarios[topic];
    if (!scenarios || !scenarios.length) {
      // Dynamic fallback
      try {
        const response = await fetch(`http://localhost:${PORT}/${topic}-api/question?difficulty=medium`);
        if (!response.ok) {
          throw new Error(`Failed to fetch standard question for topic: ${topic}. Status: ${response.status}`);
        }
        const originalQuestion = await response.json();
        if (!originalQuestion || !originalQuestion.prompt) {
          throw new Error(`Standard question endpoint for ${topic} returned malformed data.`);
        }

        const generated = generateGenericTransfer(topic, originalQuestion);
        return res.json(generated);
      } catch (fetchErr) {
        console.error(`Generic transfer fallback failed to fetch for topic '${topic}':`, fetchErr);
        return res.status(404).json({ error: `No transfer scenarios available for topic: ${topic}. Fallback failed: ${fetchErr.message}` });
      }
    }

    // Pick a random scenario
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const generated = scenario.generate();

    res.json({
      scenarioId: generated.scenarioId,
      context: generated.context,
      prompt: generated.prompt,
      hints: generated.hints,
      variables: generated.variables,
      icon: scenario.icon,
      transferLevel: scenario.transferLevel,
      topic: topic
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check', require('express').json(), async (req, res) => {
  try {
    const { topic, scenarioId, variables, userAnswer, hintsUsed, timeSpentSeconds } = req.body;
    if (!topic || !scenarioId || !variables) {
      return res.status(400).json({ error: 'Missing required parameters (topic, scenarioId, variables)' });
    }

    let correct = false;
    let expectedAnswer = '';
    let explanation = '';
    let transferMapping = '';
    let context = 'generic';

    if (scenarioId.startsWith('generic-transfer-')) {
      const { originalQuestion, topic: varTopic } = variables;
      if (!originalQuestion || !varTopic) {
        return res.status(400).json({ error: 'Malformed generic transfer variables' });
      }

      expectedAnswer = originalQuestion.answer !== undefined ? originalQuestion.answer : '';
      explanation = generateGenericExplanation(varTopic, originalQuestion, expectedAnswer);
      transferMapping = `This real-world challenge tests the concept of ${varTopic.toUpperCase()} applied to a practical scenario.`;
      context = 'generic';

      try {
        const checkHeaders = { 'Content-Type': 'application/json' };
        if (req.headers.authorization) {
          checkHeaders['Authorization'] = req.headers.authorization;
        }

        const checkResponse = await fetch(`http://localhost:${PORT}/${varTopic}-api/check`, {
          method: 'POST',
          headers: checkHeaders,
          body: JSON.stringify(buildSubCheckBody(varTopic, originalQuestion, userAnswer))
        });

        if (checkResponse.ok) {
          const checkResult = await checkResponse.json();
          correct = checkResult.correct;
          expectedAnswer = checkResult.display || checkResult.correctAnswer || checkResult.answer || expectedAnswer;

          const hasRealExplanation = checkResult.explanation && checkResult.explanation.includes('Step');
          explanation = hasRealExplanation ? checkResult.explanation : generateGenericExplanation(varTopic, originalQuestion, expectedAnswer);
        } else {
          correct = compareAnswers(userAnswer, expectedAnswer);
          explanation = generateGenericExplanation(varTopic, originalQuestion, expectedAnswer);
        }
      } catch (checkErr) {
        console.error(`Generic check call failed for topic ${varTopic}, falling back to compareAnswers:`, checkErr);
        correct = compareAnswers(userAnswer, expectedAnswer);
        explanation = generateGenericExplanation(varTopic, originalQuestion, expectedAnswer);
      }
    } else {
      const scenarios = transferScenarios[topic];
      if (!scenarios) {
        return res.status(404).json({ error: `Topic not found: ${topic}` });
      }

      const scenario = scenarios.find(s => s.scenarioId === scenarioId);
      if (!scenario) {
        return res.status(404).json({ error: `Scenario not found: ${scenarioId}` });
      }

      expectedAnswer = scenario.evaluate(variables);
      correct = compareAnswers(userAnswer, expectedAnswer);
      explanation = scenario.explanation(variables);
      transferMapping = scenario.transferMapping;
      context = scenario.context;
    }

    let goldMasteryEarned = false;
    const user = await getUserFromReq(req);

    // Log attempt if user is authenticated and DB is connected
    if (user && auth.StudentAttemptLog) {
      const promptText = scenarioId.startsWith('generic-transfer-')
        ? `Generic transfer challenge prompt for ${topic}`
        : (transferScenarios[topic]?.find(s => s.scenarioId === scenarioId)?.generate()?.prompt || 'Transfer Challenge');

      await auth.StudentAttemptLog.create({
        studentId: user._id,
        topicKey: topic,
        questionPrompt: promptText,
        userInput: String(userAnswer || ''),
        correct,
        hintsClickedCount: hintsUsed || 0,
        timeSpentSeconds: timeSpentSeconds || 0,
        stageNumber: 3,
        challengeType: 'transfer',
        transferScenarioId: scenarioId,
        transferContext: context
      });
    }

    res.json({
      correct,
      answer: expectedAnswer,
      explanation,
      transferMapping,
      goldMasteryEarned
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

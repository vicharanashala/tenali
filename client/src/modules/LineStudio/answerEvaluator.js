/**
 * Answer Evaluator for Line Studio (Cluster 2 - The Equation of a Line)
 *
 * Implements conceptual answer verification matching the Point Studio model.
 * Evaluates whether open-ended learner responses capture the core geometric behaviors
 * of knobs "a" and "b":
 * - Knob "a": Rotation / Tilt / Steepness / Slant / Angle
 * - Knob "b": Shift / Move up & down / Slide vertically / Crossing the y-axis
 */

/**
 * Normalizes text for robust concept matching:
 * - Lowercase and trim
 * - Expands contractions
 * - Replaces punctuation (including slashes like shifts/move) with spaces
 * - Compresses repeated whitespace
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  let s = text.toLowerCase().trim();

  // Common contractions mapping
  const contractions = {
    "i'm": "i am",
    "im": "i am",
    "i've": "i have",
    "ive": "i have",
    "i'll": "i will",
    "can't": "cannot",
    "cant": "cannot",
    "won't": "will not",
    "wont": "will not",
    "it's": "it is",
    "its": "it is",
    "don't": "do not",
    "dont": "do not",
    "didn't": "did not",
    "didnt": "did not",
    "doesn't": "does not",
    "doesnt": "does not",
    "there's": "there is",
    "theres": "there is",
    "that's": "that is",
    "thats": "that is",
    "what's": "what is",
    "whats": "what is",
    "we're": "we are",
    "they're": "they are",
    "you're": "you are"
  };

  for (const [contraction, expansion] of Object.entries(contractions)) {
    const reg = new RegExp(`\\b${contraction}\\b`, 'g');
    s = s.replace(reg, expansion);
  }

  // Replace punctuation characters with spaces (including / so "shifts/move" separates cleanly)
  s = s.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'\[\]\\<>@+]/g, ' ');

  // Collapse multiple whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks whether any phrase of a concept matches in the normalized text.
 * Uses word-boundary matching so "tilt" matches "it tilts", but not "subtitled".
 */
export function matchesConcept(normalizedText, concept) {
  if (!normalizedText || !concept || !Array.isArray(concept.phrases)) {
    return false;
  }

  for (const phrase of concept.phrases) {
    const normPhrase = normalizeText(phrase);
    if (!normPhrase) continue;

    const regex = new RegExp(`(^|\\s)${escapeRegex(normPhrase)}(?=\\s|$)`, 'i');
    if (regex.test(normalizedText)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether an answer contains a misconception pattern.
 * Respects simple negation (e.g. "not blank" does not trigger "blank" misconception).
 */
export function matchesMisconception(normalizedText, misconception) {
  if (!normalizedText || !misconception || !Array.isArray(misconception.phrases)) {
    return false;
  }

  const negations = ['not', 'no', 'is not', 'cannot', 'never', 'hardly', 'barely'];

  for (const phrase of misconception.phrases) {
    const normPhrase = normalizeText(phrase);
    if (!normPhrase) continue;

    const regex = new RegExp(`(^|\\s)${escapeRegex(normPhrase)}(?=\\s|$)`, 'i');
    const match = regex.exec(normalizedText);

    if (match) {
      const index = match.index;
      const textBefore = normalizedText.slice(Math.max(0, index - 25), index).trim();
      const wordsBefore = textBefore.split(/\s+/);
      const lastWords = wordsBefore.slice(-3);

      const hasNegation = lastWords.some((w) => negations.includes(w));
      if (!hasNegation) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Question 6 Evaluation Configuration
 * Evaluates observations of sliders "a" and "b"
 */
export const Q6_SLIDER_OBSERVATION_CONFIG = {
  requiredConcepts: [
    {
      id: 'knob_a_rotation',
      label: 'Knob a: Rotation / Tilt / Steepness',
      phrases: [
        'rotate', 'rotates', 'rotating', 'rotation',
        'tilt', 'tilts', 'tilting', 'tilted',
        'steep', 'steepness', 'steeper',
        'slant', 'slants', 'slanting',
        'angle', 'angles',
        'turn', 'turns', 'turning', 'turned',
        'pivot', 'pivots', 'pivoting',
        'lean', 'leans', 'leaning',
        'slope', 'slopes', 'sloping',
        'spin', 'spins', 'spinning',
        'flatten', 'flattens', 'flat'
      ],
      missingFeedback: 'You still need to describe what knob "a" does: notice how the line tilts, rotates, or changes steepness when you change "a".'
    },
    {
      id: 'knob_b_shift',
      label: 'Knob b: Shift / Move Up & Down',
      phrases: [
        'shift', 'shifts', 'shifting', 'shifted',
        'move up and down', 'moves up and down', 'moving up and down',
        'move up or down', 'moves up or down', 'moving up or down',
        'move up', 'moves up', 'moving up',
        'move down', 'moves down', 'moving down',
        'up and down', 'up or down', 'up down',
        'slide up and down', 'slides up and down',
        'slide up', 'slides up', 'slide down', 'slides down', 'sliding',
        'go up and down', 'goes up and down',
        'go up', 'goes up', 'going up', 'go down', 'goes down', 'going down',
        'vertical shift', 'vertically', 'vertical',
        'crosses the y axis', 'crosses y axis', 'crosses the y', 'crosses y', 'crosses at',
        'crossing y', 'y axis', 'y intercept', 'intercept',
        'higher or lower', 'higher and lower', 'moves higher', 'moves lower',
        'position', 'height',
        'translate', 'translates', 'translating', 'translation'
      ],
      missingFeedback: 'You still need to describe what knob "b" does: notice how the line shifts or moves up and down when you change "b".'
    }
  ],
  misconceptions: [
    {
      id: 'nothing_changed',
      phrases: [
        'nothing happens', 'nothing changes', 'nothing', 'no change',
        'does nothing', 'does not change', 'doesnt change',
        'stays same', 'stay same', 'stays the same', 'stay the same'
      ],
      feedback: 'Move sliders "a" and "b" on the canvas: watch how changing "a" tilts the line and changing "b" shifts its position!'
    },
    {
      id: 'swapped_knobs',
      phrases: [
        'b rotates', 'b tilts', 'b turns', 'b steep', 'b slant', 'b angle',
        'a shifts', 'a moves up', 'a moves down', 'a up and down'
      ],
      feedback: 'Look closely at each slider: Knob "a" tilts/rotates the line, while knob "b" shifts it up and down.'
    },
    {
      id: 'both_same',
      phrases: [
        'both do the same', 'same thing', 'do same thing', 'no difference'
      ],
      feedback: 'Knob "a" and knob "b" do two different things: one rotates/tilts the line, while the other shifts it up and down. Try moving each one individually!'
    }
  ],
  passFeedback: 'Great observation! Changing "a" rotates or tilts the line, and changing "b" shifts it up and down.',
  emptyFeedback: 'Please type what you observe happens to the line when you change sliders "a" and "b".',
  missingAllFeedback: 'Describe what happens to the line: how does it turn or tilt when you change "a", and what happens when you change "b"?'
};

/**
 * Main evaluation function.
 *
 * @param {string} rawAnswer - The learner's text answer.
 * @param {object} config - The question's evaluation configuration.
 * @returns {object} { result: 'PASS' | 'FAIL' | 'UNCERTAIN', feedback, reason, followUpPrompt, matchedConcepts, missingConcepts }
 */
export function evaluateAnswer(rawAnswer, config = Q6_SLIDER_OBSERVATION_CONFIG) {
  if (!config) {
    return {
      result: 'PASS',
      reason: 'No evaluation config provided; passing by default.',
      feedback: 'Answer accepted.',
      followUpPrompt: null,
      matchedConcepts: [],
      missingConcepts: []
    };
  }

  const normalized = normalizeText(rawAnswer);

  // Empty or whitespace-only
  if (!normalized) {
    return {
      result: 'FAIL',
      reason: 'No response was entered.',
      feedback: config.emptyFeedback || 'Please enter a description of what you observe.',
      followUpPrompt: null,
      matchedConcepts: [],
      missingConcepts: (config.requiredConcepts || []).map((c) => c.id)
    };
  }

  // 1. Check for misconceptions
  if (Array.isArray(config.misconceptions)) {
    for (const mis of config.misconceptions) {
      if (matchesMisconception(normalized, mis)) {
        return {
          result: 'FAIL',
          reason: `Misconception detected: ${mis.id}`,
          feedback: mis.feedback || 'Look at the canvas again.',
          followUpPrompt: null,
          matchedConcepts: [],
          missingConcepts: (config.requiredConcepts || []).map((c) => c.id)
        };
      }
    }
  }

  // 2. Evaluate required concepts
  const required = Array.isArray(config.requiredConcepts) ? config.requiredConcepts : [];
  const matchedRequired = [];
  const missingRequired = [];

  for (const concept of required) {
    if (matchesConcept(normalized, concept)) {
      matchedRequired.push(concept.id);
    } else {
      missingRequired.push(concept);
    }
  }

  // Check optional concepts
  const optional = Array.isArray(config.optionalConcepts) ? config.optionalConcepts : [];
  const matchedOptional = [];
  for (const concept of optional) {
    if (matchesConcept(normalized, concept)) {
      matchedOptional.push(concept.id);
    }
  }

  // 3. Determine Result
  // All required concepts demonstrated -> PASS
  if (missingRequired.length === 0) {
    return {
      result: 'PASS',
      reason: 'All required concepts demonstrated.',
      feedback: config.passFeedback || 'Great observation! You have described the required idea.',
      followUpPrompt: null,
      matchedConcepts: [...matchedRequired, ...matchedOptional],
      missingConcepts: []
    };
  }

  // Partial evidence (one of the required concepts matched) -> UNCERTAIN
  if (matchedRequired.length > 0) {
    const primaryMissing = missingRequired[0];
    const followUp = primaryMissing.missingFeedback || config.uncertainFollowUp || 'Can you explain a bit more about what you observe?';

    return {
      result: 'UNCERTAIN',
      reason: `Demonstrated: ${matchedRequired.join(', ')}. Missing: ${missingRequired.map((c) => c.id).join(', ')}.`,
      feedback: followUp,
      followUpPrompt: config.uncertainFollowUp || followUp,
      matchedConcepts: [...matchedRequired, ...matchedOptional],
      missingConcepts: missingRequired.map((c) => c.id)
    };
  }

  // If none of the required concepts were matched -> FAIL
  const missingFeedback = config.missingAllFeedback ||
    (missingRequired[0] && missingRequired[0].missingFeedback) ||
    'Look closely at the line while changing knobs "a" and "b".';

  return {
    result: 'FAIL',
    reason: 'None of the required concepts were demonstrated.',
    feedback: missingFeedback,
    followUpPrompt: null,
    matchedConcepts: matchedOptional,
    missingConcepts: missingRequired.map((c) => c.id)
  };
}

/**
 * Evaluates equation input for Question 9.
 * Target equation: y = 3x + 2 (steepness 3, passing through 2 at y).
 *
 * Accepts flexible forms:
 * - y = 3x + 2
 * - y = 3*x + 2
 * - 3x + 2
 * - y = 2 + 3x
 * - 2 + 3x
 * - f(x) = 3x + 2
 *
 * Provides intelligent, diagnostic feedback if coefficients are swapped,
 * if constant term is wrong, or if steepness is wrong.
 */
export function evaluateEquationAnswer(rawInput, expectedA = 3, expectedB = 2) {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      status: 'FAIL',
      feedback: 'Please enter an equation (e.g. y = 5x + 4).'
    };
  }

  // Normalize: lower case
  let s = rawInput.toLowerCase().trim();

  // Strip leading "f(x)=" or "y="
  if (s.startsWith('f(x)=')) s = s.slice(5).trim();
  else if (s.startsWith('f(x) =')) s = s.slice(6).trim();
  else if (s.startsWith('y=') || s.startsWith('y =')) {
    s = s.replace(/^y\s*=\s*/, '').trim();
  }

  // Remove spaces
  s = s.replace(/\s+/g, '');

  let parsedA = null;
  let parsedB = null;

  // Pattern 1: ax + b, ax - b, or ax (where b = 0)
  // e.g. "3x+2", "+3x-2", "3*x+2", "-x+4", "x-1", "3x"
  const stdMatch = s.match(/^([+-]?(?:\d+(?:\.\d+)?)?)\*?x(?:([+-]\d+(?:\.\d+)?))?$/);
  if (stdMatch) {
    const aStr = stdMatch[1];
    const bStr = stdMatch[2];

    if (aStr === '' || aStr === '+') parsedA = 1;
    else if (aStr === '-') parsedA = -1;
    else parsedA = Number(aStr);

    parsedB = bStr !== undefined ? Number(bStr) : 0;
  } else {
    // Pattern 2: b + ax or b - ax, e.g. "2+3x", "2+3*x", "2-x"
    const constFirstMatch = s.match(/^([+-]?\d+(?:\.\d+)?)([+-](?:\d+(?:\.\d+)?)?)\*?x$/);
    if (constFirstMatch) {
      parsedB = Number(constFirstMatch[1]);
      const aStr = constFirstMatch[2];
      if (aStr === '+') parsedA = 1;
      else if (aStr === '-') parsedA = -1;
      else parsedA = Number(aStr);
    }
  }

  if (parsedA === null || isNaN(parsedA) || parsedB === null || isNaN(parsedB)) {
    return {
      status: 'FAIL',
      feedback: 'Please type the equation in the form y = ax + b (for example: y = 5x + 4).'
    };
  }

  // Target match
  if (parsedA === expectedA && parsedB === expectedB) {
    const bFormatted = parsedB >= 0 ? `+ ${parsedB}` : `- ${Math.abs(parsedB)}`;
    return {
      status: 'PASS',
      parsedA,
      parsedB,
      normalizedEquation: `y = ${parsedA}x ${bFormatted}`,
      feedback: `Correct! You built y = ${parsedA}x ${bFormatted} with steepness ${parsedA} and y-crossing ${parsedB}.`
    };
  }

  // Swapped coefficients: a = 2, b = 3
  if (parsedA === expectedB && parsedB === expectedA) {
    return {
      status: 'FAIL',
      parsedA,
      parsedB,
      feedback: `You set steepness to ${parsedA} and y-crossing to ${parsedB}. Remember: steepness is ${expectedA} and it should pass through ${expectedB} at y!`
    };
  }

  // Correct a, wrong b
  if (parsedA === expectedA && parsedB !== expectedB) {
    return {
      status: 'FAIL',
      parsedA,
      parsedB,
      feedback: `Steepness ${expectedA} is correct, but your line crosses at y = ${parsedB}. It should pass through ${expectedB} at y!`
    };
  }

  // Correct b, wrong a
  if (parsedA !== expectedA && parsedB === expectedB) {
    return {
      status: 'FAIL',
      parsedA,
      parsedB,
      feedback: `The line passes through ${expectedB} at y, but its rotation/steepness should be ${expectedA} (you wrote ${parsedA}).`
    };
  }

  return {
    status: 'FAIL',
    parsedA,
    parsedB,
    feedback: `Check your numbers: rotation/steepness should be ${expectedA} and it should pass through ${expectedB} at y.`
  };
}


/**
 * Reusable local free-text answer evaluator for Tenali.
 *
 * Evaluates whether a learner's open-ended answer demonstrates the required
 * conceptual understanding without requiring exact string matches, textbook
 * jargon, or rigid sentence structures.
 *
 * Outcomes:
 * - PASS: Required concepts clearly demonstrated.
 * - FAIL: Misconception detected or critical concepts missing.
 * - UNCERTAIN: Partial evidence present; requires follow-up clarification.
 */

/**
 * Normalizes text for robust concept matching:
 * - Lowercase and trim
 * - Expands contractions
 * - Replaces punctuation with spaces (prevents gluing words across punctuation or brackets)
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

  // Replace punctuation characters with spaces (protecting word separation)
  s = s.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'\[\]\\<>@+]/g, ' ');

  // Collapse multiple whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Checks whether any phrase of a concept matches in the normalized text.
 * Uses word-boundary matching so "dot" matches "a dot", but not "snapshot".
 */
export function matchesConcept(normalizedText, concept) {
  if (!normalizedText || !concept || !Array.isArray(concept.phrases)) {
    return false;
  }

  for (const phrase of concept.phrases) {
    const normPhrase = normalizeText(phrase);
    if (!normPhrase) continue;

    // Word boundary regex for the phrase
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
      // Check for preceding negation in the immediate leading window (up to 4 words before)
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
 * Main evaluation function.
 *
 * @param {string} rawAnswer - The learner's text answer.
 * @param {object} config - The question's evaluation configuration.
 * @returns {object} { result: 'PASS' | 'FAIL' | 'UNCERTAIN', feedback, reason, followUpPrompt, matchedConcepts, missingConcepts }
 */
export function evaluateAnswer(rawAnswer, config) {
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
      feedback: 'Please enter a description of what you see on the paper.',
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
          feedback: mis.feedback || 'Look at the paper again. What actually changed when you drew the dot?',
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

  // Check optional concepts (for contextual scoring if needed)
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

  // Partial evidence (some required concepts matched, e.g. visible_mark matched, but on_paper missing) -> UNCERTAIN
  if (matchedRequired.length > 0) {
    // Generate helpful follow-up from the missing concept
    const primaryMissing = missingRequired[0];
    const followUp = primaryMissing.missingFeedback || config.uncertainFollowUp || 'Can you explain a bit more about what you see?';

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
    'Look at the paper closely. What visible change appeared after drawing?';

  return {
    result: 'FAIL',
    reason: 'None of the required concepts were demonstrated.',
    feedback: missingFeedback,
    followUpPrompt: null,
    matchedConcepts: matchedOptional,
    missingConcepts: missingRequired.map((c) => c.id)
  };
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

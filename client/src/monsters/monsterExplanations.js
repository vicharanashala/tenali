/**
 * monsterExplanations.js
 *
 * Static, hand-written mini-lessons shown in the Hall of Silly Mistakes when a
 * student taps a monster. No LLM, no runtime generation — these are the
 * authoritative explanations for v0.2. Future versions can ship a richer set
 * or accept additions without changing the schema.
 *
 * Schema is intentionally flat: an object keyed by monsterId. Each entry has
 * the four pieces of text the Hall panel needs to render a card.
 *   - name:        Display name (e.g. "The Bracketeer")
 *   - tagline:     One-line mood (e.g. "Forgot to share with everyone inside.")
 *   - description: Three-sentence pedagogical mini-lesson.
 *
 * Keep the language second-person and concrete. The student should read it
 * once and understand the mistake. Author: P. Sole sign-off authority: P.
 */

export const MONSTER_EXPLANATIONS = {
  'bracketeer': {
    name: 'The Bracketeer',
    tagline: 'Forgot to share with everyone inside.',
    description: 'Multiply the outside number by *every* term inside!',
  },

  'sign-swapper': {
    name: 'The Sign Swapper',
    tagline: 'Mixed up your + and −.',
    description: 'Watch out! The Sign Swapper flips your positive (+) and negative (-) signs.',
  },

  'decimal-drifter': {
    name: 'The Decimal Drifter',
    tagline: 'The point jumped to the wrong spot.',
    description: 'The decimal point slid into the wrong spot, making the number too big or too small.',
  },

  'carry-crasher': {
    name: 'The Carry Crasher',
    tagline: 'The carried number got lost.',
    description: 'A carried number was dropped or forgotten during addition or subtraction.',
  },
};

/**
 * Return the explanation entry for a monsterId, or null if the id is unknown.
 * Safe consumer-facing lookup; defaults never throw.
 */
export function getMonsterExplanation(monsterId) {
  return MONSTER_EXPLANATIONS[monsterId] || null;
}

/**
 * Display name for a monsterId, or "Unknown Monster" if the id is unknown.
 * Useful for toasts where we want a single string without a shape check.
 */
export function getMonsterName(monsterId) {
  const entry = MONSTER_EXPLANATIONS[monsterId];
  return entry ? entry.name : 'Unknown Monster';
}

/**
 * Tagline for a monsterId, or empty string. Cheap accessor used in toast
 * render. Distinct from description — tagline is the one-liner.
 */
export function getMonsterTagline(monsterId) {
  const entry = MONSTER_EXPLANATIONS[monsterId];
  return entry ? entry.tagline : '';
}

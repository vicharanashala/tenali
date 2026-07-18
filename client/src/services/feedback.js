/**
 * Reusable Feedback Service
 * Provides randomized, reassuring, and child-friendly encouraging messages
 * for incorrect answers across all Tenali learning modules.
 */

let lastMessage = '';

const INCORRECT_ENCOURAGEMENTS = [
  "That's okay. Let's try another one!",
  "Good try! Let's keep going.",
  "You're getting better every time!",
  "Let's see the next one.",
  "Keep going—you can do it!",
  "Nice effort! Try this one.",
  "You're learning something new!",
  "Let's keep practicing together.",
  "Almost there! Try another one.",
  "Every question helps you learn!"
];

/**
 * Returns a random encouraging feedback string.
 * Guarantees that the same message is not returned twice consecutively.
 */
export function getRandomIncorrectFeedback() {
  const filtered = INCORRECT_ENCOURAGEMENTS.filter(msg => msg !== lastMessage);
  const selected = filtered[Math.floor(Math.random() * filtered.length)];
  lastMessage = selected;
  return selected;
}

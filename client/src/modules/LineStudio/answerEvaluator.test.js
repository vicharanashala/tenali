/**
 * Automated Test Suite for LineStudio AnswerEvaluator
 * Runs via Node.js
 */
import { evaluateAnswer, Q6_SLIDER_OBSERVATION_CONFIG, evaluateEquationAnswer } from './answerEvaluator.js';

const testCases = [
  // 1. User's exact prompt from request
  {
    answer: "Line rotates when a is being changed and shifts/move up and down when b is being changed",
    expected: "PASS",
    description: "User exact expected answer: 'rotates' for a, 'shifts/move up and down' for b"
  },
  // 2. Common natural phrasing variations
  {
    answer: "When a changes the line rotates and when b changes the line moves up and down",
    expected: "PASS",
    description: "Standard: 'rotates' and 'moves up and down'"
  },
  {
    answer: "a tilts the line and b shifts it up or down",
    expected: "PASS",
    description: "Synonyms: 'tilts' and 'shifts it up or down'"
  },
  {
    answer: "a changes the steepness of the line, while b changes where it crosses the y-axis",
    expected: "PASS",
    description: "Mathematical: 'steepness' and 'crosses the y-axis'"
  },
  {
    answer: "Changing a turns the line, changing b slides it vertically",
    expected: "PASS",
    description: "Physical: 'turns' and 'slides it vertically'"
  },
  {
    answer: "Knob a pivots the line around and knob b moves its height up and down",
    expected: "PASS",
    description: "Intuitive: 'pivots' and 'moves its height up and down'"
  },
  {
    answer: "a controls rotation, b controls translation",
    expected: "PASS",
    description: "Formal geometry: 'rotation' and 'translation'"
  },
  {
    answer: "The line slants when I move a, and goes up and down when I move b",
    expected: "PASS",
    description: "Informal: 'slants' and 'goes up and down'"
  },

  // 3. UNCERTAIN cases (only 1 concept provided)
  {
    answer: "The line rotates when I move slider a",
    expected: "UNCERTAIN",
    description: "Only describes 'a' (rotation), missing 'b'"
  },
  {
    answer: "b moves the line up and down",
    expected: "UNCERTAIN",
    description: "Only describes 'b' (moves up and down), missing 'a'"
  },
  {
    answer: "It tilts",
    expected: "UNCERTAIN",
    description: "Single word 'tilts' without explaining b"
  },

  // 4. Misconceptions
  {
    answer: "Nothing happens",
    expected: "FAIL",
    description: "Misconception: 'nothing happens'"
  },
  {
    answer: "The line stays the same",
    expected: "FAIL",
    description: "Misconception: 'stays the same'"
  },
  {
    answer: "b rotates the line and a shifts it",
    expected: "FAIL",
    description: "Misconception: swapped knobs ('b rotates' and 'a shifts')"
  },

  // 5. Invalid / Empty
  {
    answer: "asdfghjk qwerty",
    expected: "FAIL",
    description: "Gibberish"
  },
  {
    answer: "",
    expected: "FAIL",
    description: "Empty string"
  }
];

const equationTestCases = [
  { input: "y = 3x + 2", expected: "PASS", description: "Standard: y = 3x + 2" },
  { input: "y=3x+2", expected: "PASS", description: "No spaces: y=3x+2" },
  { input: "3x + 2", expected: "PASS", description: "Without 'y=' prefix: 3x + 2" },
  { input: "y = 3*x + 2", expected: "PASS", description: "With multiplication: y = 3*x + 2" },
  { input: "y = 2 + 3x", expected: "PASS", description: "Constant first: y = 2 + 3x" },
  { input: "f(x) = 3x + 2", expected: "PASS", description: "Function notation: f(x) = 3x + 2" },
  { input: "y = 2x + 3", expected: "FAIL", description: "Swapped a and b: y = 2x + 3" },
  { input: "y = 3x", expected: "FAIL", description: "Missing b (y-crossing): y = 3x" },
  { input: "y = 4x + 2", expected: "FAIL", description: "Wrong slope: y = 4x + 2" },
  { input: "y = 3x - 2", expected: "FAIL", description: "Wrong sign on b: y = 3x - 2" },
  { input: "asdfghjk", expected: "FAIL", description: "Gibberish input" },
  { input: "", expected: "FAIL", description: "Empty input" }
];

let passed = 0;
let failed = 0;

console.log("=================================================");
console.log("Running LineStudio AnswerEvaluator Test Suite");
console.log("=================================================\n");

testCases.forEach((tc, idx) => {
  const res = evaluateAnswer(tc.answer, Q6_SLIDER_OBSERVATION_CONFIG);
  const ok = res.result === tc.expected;

  if (ok) {
    passed++;
    console.log(`[PASS] Test ${idx + 1}: ${tc.description}`);
    console.log(`       Input: "${tc.answer}"`);
    console.log(`       Result: ${res.result} (Matched: ${res.matchedConcepts.join(', ') || 'none'})`);
  } else {
    failed++;
    console.error(`[FAIL] Test ${idx + 1}: ${tc.description}`);
    console.error(`       Input: "${tc.answer}"`);
    console.error(`       Expected: ${tc.expected}, Got: ${res.result}`);
    console.error(`       Feedback: ${res.feedback}`);
  }
  console.log("-------------------------------------------------");
});

console.log("\n=================================================");
console.log("Running Equation Evaluator (Q9) Test Suite");
console.log("=================================================\n");

equationTestCases.forEach((tc, idx) => {
  const res = evaluateEquationAnswer(tc.input, 3, 2);
  const ok = res.status === tc.expected;

  if (ok) {
    passed++;
    console.log(`[PASS] Eq Test ${idx + 1}: ${tc.description}`);
    console.log(`       Input: "${tc.input}"`);
    console.log(`       Result: ${res.status} | Feedback: ${res.feedback}`);
  } else {
    failed++;
    console.error(`[FAIL] Eq Test ${idx + 1}: ${tc.description}`);
    console.error(`       Input: "${tc.input}"`);
    console.error(`       Expected: ${tc.expected}, Got: ${res.status}`);
    console.error(`       Feedback: ${res.feedback}`);
  }
  console.log("-------------------------------------------------");
});

const total = testCases.length + equationTestCases.length;
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${total} tests.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All LineStudio AnswerEvaluator and Equation tests passed successfully!\n");
}


/**
 * Automated Test Suite for AnswerEvaluator
 * Runs via Node.js
 */
import { evaluateAnswer, normalizeText } from './answerEvaluator.js';

const q6Config = {
  requiredConcepts: [
    {
      id: 'visible_mark',
      label: 'Visible Mark',
      phrases: [
        'mark', 'marks', 'dot', 'dots', 'spot', 'spots', 'speck', 'specks',
        'ink', 'ink mark', 'point', 'points', 'circle', 'circles', 'blot',
        'dark mark', 'black mark', 'pen mark', 'pencil mark', 'tiny mark',
        'tiny dot', 'drawn dot', 'drawing'
      ],
      missingFeedback: 'Look closely at the paper. What did your pen or pencil leave on it?'
    },
    {
      id: 'on_paper',
      label: 'On Paper',
      phrases: [
        'paper', 'papers', 'on paper', 'on the paper', 'page', 'pages',
        'on the page', 'sheet', 'sheets', 'on the sheet', 'surface', 'pad',
        'on it', 'there', 'on there'
      ],
      missingFeedback: 'You noticed the mark. Now describe what that mark is on.'
    }
  ],
  optionalConcepts: [
    {
      id: 'small',
      phrases: ['small', 'tiny', 'little', 'single', 'one']
    },
    {
      id: 'visible',
      phrases: ['visible', 'see', 'look', 'looks', 'appears', 'contains', 'has', 'made']
    }
  ],
  misconceptions: [
    {
      id: 'nothing_changed',
      phrases: [
        'nothing changed', 'nothing', 'blank', 'empty', 'white',
        'same as before', 'no change', 'invisible', 'disappeared', 'clean', 'plain'
      ],
      feedback: 'Look at the paper again. What actually changed when you drew the dot?'
    }
  ],
  passFeedback: 'Yes. You noticed that a visible mark appears on the paper.',
  uncertainFollowUp: 'You noticed the mark! Can you describe what that mark is on in a complete thought?',
  missingAllFeedback: 'Look at the paper closely. What visible change appeared after you pressed your pen down?',
  passCondition: 'all_required'
};

const testCases = [
  // PASS cases
  {
    answer: "There is a small mark on the paper.",
    expected: "PASS",
    description: "Standard pass with 'mark' and 'on the paper'"
  },
  {
    answer: "I can see a tiny dot on the page.",
    expected: "PASS",
    description: "Synonym pass with 'dot' and 'page'"
  },
  {
    answer: "The paper now has an ink spot.",
    expected: "PASS",
    description: "Synonym pass with 'paper' and 'ink spot'"
  },
  {
    answer: "I made a little mark on the sheet.",
    expected: "PASS",
    description: "Synonym pass with 'mark' and 'sheet'"
  },
  {
    answer: "I am able to see the point on the paper after drawingonn tjte]",
    expected: "PASS",
    description: "Pass with typo and punctuation: 'point' and 'paper'"
  },
  {
    answer: "there is a speck on it",
    expected: "PASS",
    description: "Pass with 'speck' and 'on it'"
  },

  // UNCERTAIN cases
  {
    answer: "I can see a tiny black mark.",
    expected: "UNCERTAIN",
    description: "Mentions mark, but missing reference to paper/sheet"
  },
  {
    answer: "A dot.",
    expected: "UNCERTAIN",
    description: "Single-word concept mention without location"
  },

  // FAIL cases
  {
    answer: "The paper is white.",
    expected: "FAIL",
    description: "Misconception: 'white' / missing mark"
  },
  {
    answer: "nothing changed",
    expected: "FAIL",
    description: "Misconception: 'nothing changed'"
  },
  {
    answer: "asdf qwerty",
    expected: "FAIL",
    description: "Gibberish"
  },
  {
    answer: "",
    expected: "FAIL",
    description: "Empty string"
  }
];

let passed = 0;
let failed = 0;

console.log("==========================================");
console.log("Running AnswerEvaluator Test Suite");
console.log("==========================================\n");

testCases.forEach((tc, idx) => {
  const res = evaluateAnswer(tc.answer, q6Config);
  const ok = res.result === tc.expected;

  if (ok) {
    passed++;
    console.log(`[PASS] Test ${idx + 1}: ${tc.description}`);
    console.log(`       Input: "${tc.answer}"`);
    console.log(`       Result: ${res.result} (Reason: ${res.reason})`);
  } else {
    failed++;
    console.error(`[FAIL] Test ${idx + 1}: ${tc.description}`);
    console.error(`       Input: "${tc.answer}"`);
    console.error(`       Expected: ${tc.expected}, Got: ${res.result}`);
    console.error(`       Feedback: ${res.feedback}`);
  }
  console.log("------------------------------------------");
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All AnswerEvaluator tests passed successfully!");
}

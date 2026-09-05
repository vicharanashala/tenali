// Quick validation script for classifier.js. Run with: node classifier.test.js
//
// This file is NOT shipped to the browser. It's a smoke test during development.
// Delete or move to /scripts/ when a real test runner is added.

import { classifyMonster, MONSTERS_ENABLED, MONSTER_IDS } from '../classifier.js';

const cases = [
  // Bracketeer — should trigger
  { in: { question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' }, expect: 'bracketeer', label: 'Bracketeer example trigger (spec §3.1)' },
  // Bracketeer — should NOT trigger
  { in: { question: '3(x+2)', userAnswer: '9', correctAnswer: '3x + 6' }, expect: null, label: 'Bracketeer example non-trigger (spec §3.1)' },
  // Sign Swapper — should trigger
  { in: { question: '(-3) + 5', userAnswer: '-2', correctAnswer: '2' }, expect: 'sign-swapper', label: 'Sign Swapper example trigger (spec §3.2)' },
  // Sign Swapper — should NOT trigger
  { in: { question: '(-3) + 5', userAnswer: '8', correctAnswer: '2' }, expect: null, label: 'Sign Swapper example non-trigger (spec §3.2)' },
  // Decimal Drifter — should trigger
  { in: { question: '0.5 + 0.3', userAnswer: '0.08', correctAnswer: '0.8' }, expect: 'decimal-drifter', label: 'Decimal Drifter example trigger (spec §3.3)' },
  // Decimal Drifter — should NOT trigger
  { in: { question: '0.5 + 0.3', userAnswer: '0.7', correctAnswer: '0.8' }, expect: null, label: 'Decimal Drifter example non-trigger (spec §3.3)' },
  // Carry Crasher — enabled, should trigger when matching
  { in: { question: '47 + 38', userAnswer: '75', correctAnswer: '85' }, expect: 'carry-crasher', label: 'Carry Crasher enabled (triggers when matching pattern)' },
  // Order: Bracketeer and Sign Swapper both could match this; in v0.2
  // we accept either result. The "first-match-wins" rule resolves in favor
  // of Bracketeer when Bracketeer matches. Here the student's answer (-3x+-6)
  // is structurally the negation of the correct answer (3x+6), so this is
  // really a sign error caught by Sign Swapper (which fires second).
  { in: { question: '3(x+2)', userAnswer: '-3x + -6', correctAnswer: '3x + 6' }, expect: 'sign-swapper', label: 'Ambiguous case: student flipped sign of every term — Sign Swapper fires' },
  // Decimal Drifter should NOT trigger on integer answers
  { in: { question: '47 + 38', userAnswer: '8', correctAnswer: '85' }, expect: null, label: 'Decimal Drifter rejects integer answers' },
  // Negative number math — sign swap still triggers
  { in: { question: '5 - 7', userAnswer: '2', correctAnswer: '-2' }, expect: 'sign-swapper', label: 'Sign Swapper on subtraction: 5-7 student wrote 2 not -2' },
  // Bracketeer with negative inner: 3(x-2) -> 3x - 6, student: 3x - 2 (first only)
  { in: { question: '3(x-2)', userAnswer: '3x - 2', correctAnswer: '3x - 6' }, expect: 'bracketeer', label: 'Bracketeer with negative inner term (3(x-2), student 3x-2)' },
  // Decimal Drifter with multiplication: 0.6 * 0.4 = 0.24, student: 2.4 (drift right)
  { in: { question: '0.6 × 0.4', userAnswer: '2.4', correctAnswer: '0.24' }, expect: 'decimal-drifter', label: 'Decimal Drifter multiplication drift' },
  // Edge: empty input
  { in: {}, expect: null, label: 'Empty input returns null (no crash)' },
  // Edge: garbage input
  { in: { question: null, userAnswer: undefined, correctAnswer: null }, expect: null, label: 'Garbage input returns null (no crash)' },
  // Bracketeer expansion cases
  { in: { question: '6x(x+5)', userAnswer: '6x^2 + 5', correctAnswer: '6x^2 + 30x' }, expect: 'bracketeer', label: 'Bracketeer linear expansion slip A (6x^2+5)' },
  { in: { question: '6x(x+5)', userAnswer: '6x^2 + 30', correctAnswer: '6x^2 + 30x' }, expect: 'bracketeer', label: 'Bracketeer linear expansion slip B (6x^2+30)' },
  { in: { question: '6x(x+5)', userAnswer: '6x^2 + 5x', correctAnswer: '6x^2 + 30x' }, expect: 'bracketeer', label: 'Bracketeer linear expansion slip C (6x^2+5x)' },
  { in: { question: '(2x)(6x+6)', userAnswer: '12x^2 + 6x', correctAnswer: '12x^2 + 12x' }, expect: 'bracketeer', label: 'Bracketeer linear expansion parenthesized (12x^2+6x)' },
  { in: { question: '(x+3)(x+5)', userAnswer: 'x^2 + 15', correctAnswer: 'x^2 + 8x + 15' }, expect: 'bracketeer', label: 'Bracketeer double bracket FOIL slip (x^2+15)' },
  { in: { question: '(2x-3)(3x+4)', userAnswer: '6x^2 - 12', correctAnswer: '6x^2 - x - 12' }, expect: 'bracketeer', label: 'Bracketeer double bracket coefficient FOIL slip (6x^2-12)' },
  { in: { question: '(5) × (x - 3)', userAnswer: '5x - 3', correctAnswer: '5x - 15' }, expect: 'bracketeer', label: 'Bracketeer parenthesized constant multiplier with times operator' },
  { in: { question: '8 * (x + 6)', userAnswer: '8x + 6', correctAnswer: '8x + 48' }, expect: 'bracketeer', label: 'Bracketeer constant multiplier with asterisk operator' },
];

let pass = 0, fail = 0;
for (const c of cases) {
  const got = classifyMonster(c.in);
  const ok = got === c.expect;
  if (ok) pass++; else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + c.label + ' | expect=' + JSON.stringify(c.expect) + ' got=' + JSON.stringify(got));
}
console.log('---');
console.log('Total: ' + cases.length + ', Pass: ' + pass + ', Fail: ' + fail);
console.log('MONSTER_IDS:', MONSTER_IDS);
console.log('MONSTERS_ENABLED:', JSON.stringify(MONSTERS_ENABLED));

if (fail > 0) process.exit(1);

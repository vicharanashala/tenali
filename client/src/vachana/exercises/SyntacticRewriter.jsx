import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useMastery, loadMasteryProgress, saveMasteryProgress } from '../VachanaMastery';
import MasteryLevelHeader from '../MasteryLevelHeader';

// ─── Party Popper Confetti Animation ─────────────────────────────────────────
function triggerPartyPopperAnimation() {
  try {
    // Left party popper blast
    confetti({
      particleCount: 75,
      angle: 60,
      spread: 70,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']
    });

    // Right party popper blast
    confetti({
      particleCount: 75,
      angle: 120,
      spread: 70,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']
    });

    // Secondary celebratory center starburst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 110,
        origin: { x: 0.5, y: 0.45 },
        colors: ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        ticks: 200
      });
    }, 280);
  } catch (err) {
    console.error('Confetti animation error:', err);
  }
}

// ─── Question Counts Per Level Config ─────────────────────────────────────────
export const LEVEL_QUESTION_COUNTS = {
  0: 4, // Learn the idea
  1: 4, // Very easy practice
  2: 5, // Easy practice
  3: 6, // Simple combinations
  4: 7, // Grouped operations
  5: 8, // More steps
  6: 7, // Mixed practice
  7: 6, // Apply the idea
  8: 5, // Challenge
  9: 4  // Final mastery (75%+ required)
};

// ────────────────────────────────────────────────────────────────────────
// PER-LEVEL CONCEPT EXPLANATIONS
// Shown before practice begins so every level teaches its rule, not just
// Level 0. Each has a plain-English rule + one worked example.
// ────────────────────────────────────────────────────────────────────────
export const LEVEL_CONCEPTS = {
  0: {
    title: 'The Big Idea: What Happens First?',
    rule: 'Sentences describing math are often written passively, so the action can appear before the thing it acts on. Find the starting quantity first, then apply each action to it in the order the sentence implies — not necessarily the order the words appear.',
    example: {
      sentence: '"8 was added to double a number."',
      steps: ['Double the number → 2x', 'Add 8 to that result → 2x + 8'],
      answer: '2x + 8'
    }
  },
  1: {
    title: 'Multiply Before You Add or Subtract',
    rule: 'Phrases like "double a number," "triple a number," or "N times a number" describe a multiplication that must happen first. Only after that multiplication do you add or subtract the extra amount mentioned in the sentence.',
    example: {
      sentence: '"9 was added to double a number."',
      steps: ['Multiply the number by 2 → 2x', 'Add 9 → 2x + 9'],
      answer: '2x + 9'
    }
  },
  2: {
    title: 'Fractions: Halves, Thirds, and Quotients',
    rule: 'Words like "half of," "one-third of," "quotient of a number and N," or "a number divided by N" all mean division. Do that division first, then add or subtract whatever comes next in the sentence.',
    example: {
      sentence: '"5 was subtracted from half of a number."',
      steps: ['Take half of the number → x/2', 'Subtract 5 → x/2 − 5'],
      answer: 'x/2 − 5'
    }
  },
  3: {
    title: 'Chains: "The Result" Means Use Everything Before It',
    rule: 'When a sentence says "...and then the result was multiplied/divided by N," that operation applies to the ENTIRE expression built so far, not just the last number. Build the expression step by step, then apply the final operation to the whole thing.',
    example: {
      sentence: '"5 was added to twice a number, and then the result was multiplied by 3."',
      steps: ['Double the number → 2x', 'Add 5 → 2x + 5', 'Multiply the whole result by 3 → 3(2x + 5)'],
      answer: '3(2x + 5)'
    }
  },
  4: {
    title: 'Grouped Terms Need Parentheses',
    rule: 'Phrases like "the sum of a number and N" or "the difference of a number and N" describe a group that must be combined FIRST and treated as a single unit — that\'s why it goes inside parentheses before any outer multiplication or division.',
    example: {
      sentence: '"The sum of a number and 6 was multiplied by 3."',
      steps: ['Add 6 to the number to form the group → (x + 6)', 'Multiply the whole group by 3 → 3(x + 6)'],
      answer: '3(x + 6)'
    }
  },
  5: {
    title: 'Longer Chains, Same Rules',
    rule: 'These sentences combine three or four operations in a row. Read slowly and handle one action at a time, in order. Watch for "the result" or "the total," which always refers to everything built so far — not just the number by itself.',
    example: {
      sentence: '"A number was multiplied by 2, 6 was added, and the result was divided by 4."',
      steps: ['Multiply by 2 → 2x', 'Add 6 → 2x + 6', 'Divide the whole result by 4 → (2x + 6)/4'],
      answer: '(2x + 6)/4'
    }
  },
  6: {
    title: 'Mixed Review',
    rule: 'This level mixes everything so far: multiplying first, fractions, grouped terms, and multi-step chains. There\'s no new rule here — just apply whichever rule fits the sentence you\'re given.',
    example: {
      sentence: '"7 was added to a number, and the total was divided by 3."',
      steps: ['Add 7 to the number → x + 7', 'Divide the total by 3 → (x + 7)/3'],
      answer: '(x + 7)/3'
    }
  },
  7: {
    title: 'Apply the Idea to Real Situations',
    rule: 'The same ordering rules apply to word problems about money, objects, or people. First identify the starting quantity (the sentence will name it, e.g. "a bill was x dollars"), then apply each event to it in the order it happens in the story.',
    example: {
      sentence: '"A bill was x dollars. A $10 tip was added to it, and the total was split equally between 4 friends."',
      steps: ['Start with the bill → x', 'Add the $10 tip → x + 10', 'Split the total between 4 friends → (x + 10)/4'],
      answer: '(x + 10)/4'
    }
  },
  8: {
    title: 'Advanced Operations: Squaring and Square Roots',
    rule: 'Squaring ("the result was squared") and taking a square root ("the square root of the result") are just another operation applied to everything built so far — handle them last, the same way you\'d handle a final multiplication or division.',
    example: {
      sentence: '"A number was doubled, 9 was subtracted, and the final result was squared."',
      steps: ['Double the number → 2x', 'Subtract 9 → 2x − 9', 'Square the entire result → (2x − 9)²'],
      answer: '(2x − 9)²'
    }
  },
  9: {
    title: 'Final Mastery: Everything Together',
    rule: 'This final level chains four operations at once: multiplication, addition/subtraction, division, and grouping — all in a single sentence. Take it one clause at a time, keep track of "the result," and you\'ll build the correct expression piece by piece. You need 75% accuracy to pass this level.',
    example: {
      sentence: '"A number was multiplied by 3, 5 was added, the result was divided by 2, and then 4 was subtracted."',
      steps: ['Multiply by 3 → 3x', 'Add 5 → 3x + 5', 'Divide by 2 → (3x + 5)/2', 'Subtract 4 → (3x + 5)/2 − 4'],
      answer: '(3x + 5)/2 − 4'
    }
  }
};

// ────────────────────────────────────────────────────────────────────────
// LEVEL 0 — TUTORIAL QUESTIONS (4 questions, guided)
// ────────────────────────────────────────────────────────────────────────
export const TUTORIAL_QUESTIONS = [
  {
    id: 'q0_1',
    question: '"5 was added to a number."',
    options: ['Add 5', 'Start with a number'],
    correctOrder: ['Start with a number', 'Add 5'],
    correctAnswer: 'x + 5',
    hint: 'You need a starting number before you can add anything to it.',
    explanation: 'Start with the unknown number (x), then add 5 to it: x + 5.'
  },
  {
    id: 'q0_2',
    question: '"A number was multiplied by 2."',
    options: ['Multiply by 2', 'Start with a number'],
    correctOrder: ['Start with a number', 'Multiply by 2'],
    correctAnswer: '2x',
    hint: 'Start with the number, then scale it.',
    explanation: 'Start with the number (x), then multiply it by 2, giving 2x.'
  },
  {
    id: 'q0_3',
    question: '"3 was subtracted from a number."',
    options: ['Subtract 3', 'Start with a number'],
    correctOrder: ['Start with a number', 'Subtract 3'],
    correctAnswer: 'x − 3',
    hint: '"Subtracted from a number" means the number was there first, and 3 is taken away from it.',
    explanation: 'Start with the number (x), then subtract 3 from it: x − 3.'
  },
  {
    id: 'q0_4',
    question: '"8 was added to double a number."',
    options: ['Add 8', 'Double the number'],
    correctOrder: ['Double the number', 'Add 8'],
    correctAnswer: '2x + 8',
    hint: 'You can\'t add 8 to "double a number" until the number has actually been doubled.',
    explanation: 'First double the number (2x), then add 8 to that result: 2x + 8.'
  }
];

// ────────────────────────────────────────────────────────────────────────
// LEVEL 0 — CONCEPT HUB CARDS (used for the interactive walkthrough)
// ────────────────────────────────────────────────────────────────────────
export const LEVEL0_CONCEPTS = [
  {
    id: 'first',
    title: '1. What Happens First',
    tag: 'Addition / Subtraction',
    highlightEnglish: '"8 was added to double a number."',
    steps: [
      { num: '1', action: 'Double the number', math: '2x' },
      { num: '2', action: 'Add 8 to the result', math: '+ 8' }
    ],
    algebraic: '2x + 8',
    rule: 'You must double the number before you have something to add 8 to.'
  },
  {
    id: 'halves',
    title: '2. Halves & Dividing',
    tag: 'Fractions & Quotients',
    highlightEnglish: '"5 was subtracted from half of a number."',
    steps: [
      { num: '1', action: 'Take half of the number', math: 'x / 2' },
      { num: '2', action: 'Subtract 5', math: '− 5' }
    ],
    algebraic: 'x/2 − 5',
    rule: 'Calculate half of the number before taking 5 away from it.'
  },
  {
    id: 'brackets',
    title: '3. Grouped Terms (Brackets)',
    tag: 'Parentheses / Do First',
    highlightEnglish: '"The sum of a number and 6 was multiplied by 3."',
    steps: [
      { num: '1', action: 'Add 6 to the number', math: '(x + 6)' },
      { num: '2', action: 'Multiply the whole result by 3', math: '3 · (x + 6)' }
    ],
    algebraic: '3(x + 6)',
    rule: 'Group the addition inside parentheses before multiplying the whole thing by 3.'
  },
  {
    id: 'multistep',
    title: '4. Multi-Step Chains',
    tag: '3+ Step Sequences',
    highlightEnglish: '"A number was doubled, 9 was subtracted, and the result was squared."',
    steps: [
      { num: '1', action: 'Double the number', math: '2x' },
      { num: '2', action: 'Subtract 9', math: '2x − 9' },
      { num: '3', action: 'Square the result', math: '(2x − 9)²' }
    ],
    algebraic: '(2x − 9)²',
    rule: 'Chain operations strictly in order — each new operation acts on the entire expression built so far.'
  }
];

// ────────────────────────────────────────────────────────────────────────
// LEVELS 1–9 — MAIN QUESTION BANK
// ────────────────────────────────────────────────────────────────────────
export const REWRITE_BANK = {

  // LEVEL 1 — Multiply before add/subtract (4 questions)
  '1': [
    {
      id: 'q1_1',
      question: '"9 was added to double a number."',
      options: ['Add 9', 'Multiply a number', 'by 2'],
      correctOrder: ['Multiply a number', 'by 2', 'Add 9'],
      correctAnswer: '2x + 9',
      hint: '"Double a number" must happen before you add 9.',
      explanation: 'First multiply the number by 2 (2x), then add 9: 2x + 9.'
    },
    {
      id: 'q1_2',
      question: '"6 was subtracted from triple a number."',
      options: ['Subtract 6', 'Multiply a number', 'by 3'],
      correctOrder: ['Multiply a number', 'by 3', 'Subtract 6'],
      correctAnswer: '3x − 6',
      hint: '"Triple" means multiply by 3, and that happens first.',
      explanation: 'First multiply the number by 3 (3x), then subtract 6: 3x − 6.'
    },
    {
      id: 'q1_3',
      question: '"4 was added to five times a number."',
      options: ['Add 4', 'Multiply a number', 'by 5'],
      correctOrder: ['Multiply a number', 'by 5', 'Add 4'],
      correctAnswer: '5x + 4',
      hint: '"Five times a number" is the multiplication, and it happens first.',
      explanation: 'First multiply the number by 5 (5x), then add 4: 5x + 4.'
    },
    {
      id: 'q1_4',
      question: '"10 was subtracted from twice a number."',
      options: ['Subtract 10', 'Multiply a number', 'by 2'],
      correctOrder: ['Multiply a number', 'by 2', 'Subtract 10'],
      correctAnswer: '2x − 10',
      hint: '"Twice a number" means multiply by 2, and that happens first.',
      explanation: 'First multiply the number by 2 (2x), then subtract 10: 2x − 10.'
    }
  ],

  // LEVEL 2 — Fractions & division (5 questions)
  '2': [
    {
      id: 'q2_1',
      question: '"7 was added to the quotient of a number and 3."',
      options: ['Add 7', 'Divide a number', 'by 3'],
      correctOrder: ['Divide a number', 'by 3', 'Add 7'],
      correctAnswer: 'x/3 + 7',
      hint: '"Quotient" means division. Divide by 3 first.',
      explanation: 'First divide the number by 3 (x/3), then add 7: x/3 + 7.'
    },
    {
      id: 'q2_2',
      question: '"5 was subtracted from half of a number."',
      options: ['Subtract 5', 'Take half of', 'a number'],
      correctOrder: ['Take half of', 'a number', 'Subtract 5'],
      correctAnswer: 'x/2 − 5',
      hint: 'Taking half of the number comes before subtracting 5.',
      explanation: 'First take half of the number (x/2), then subtract 5: x/2 − 5.'
    },
    {
      id: 'q2_3',
      question: '"9 was added to one-fourth of a number."',
      options: ['Add 9', 'Divide a number', 'by 4'],
      correctOrder: ['Divide a number', 'by 4', 'Add 9'],
      correctAnswer: 'x/4 + 9',
      hint: '"One-fourth" means divide by 4.',
      explanation: 'First divide the number by 4 (x/4), then add 9: x/4 + 9.'
    },
    {
      id: 'q2_4',
      question: '"12 was subtracted from a number divided by 2."',
      options: ['Subtract 12', 'Divide a number', 'by 2'],
      correctOrder: ['Divide a number', 'by 2', 'Subtract 12'],
      correctAnswer: 'x/2 − 12',
      hint: 'Dividing by 2 happens before subtracting 12.',
      explanation: 'First divide the number by 2 (x/2), then subtract 12: x/2 − 12.'
    },
    {
      id: 'q2_5',
      question: '"6 was added to one-third of a number."',
      options: ['Add 6', 'Divide a number', 'by 3'],
      correctOrder: ['Divide a number', 'by 3', 'Add 6'],
      correctAnswer: 'x/3 + 6',
      hint: '"One-third" means divide by 3.',
      explanation: 'First divide the number by 3 (x/3), then add 6: x/3 + 6.'
    }
  ],

  // LEVEL 3 — 3-step chains, "the result" applies to everything so far (6 questions)
  '3': [
    {
      id: 'q3_1',
      question: '"5 was added to twice a number, and then the result was multiplied by 3."',
      options: ['Multiply the result', 'by 3', 'Double the number', 'Add 5'],
      correctOrder: ['Double the number', 'Add 5', 'Multiply the result', 'by 3'],
      correctAnswer: '3(2x + 5)',
      hint: 'Double the number first, then add 5, then multiply that whole result by 3.',
      explanation: 'Double the number (2x), add 5 (2x + 5), then multiply the whole result by 3: 3(2x + 5).'
    },
    {
      id: 'q3_2',
      question: '"4 was subtracted from a number, and the result was multiplied by 2."',
      options: ['Multiply the result', 'by 2', 'Subtract 4 from a number'],
      correctOrder: ['Subtract 4 from a number', 'Multiply the result', 'by 2'],
      correctAnswer: '2(x − 4)',
      hint: 'Subtract 4 from the number first, then multiply the whole result by 2.',
      explanation: 'First subtract 4 (x − 4), then multiply the whole result by 2: 2(x − 4).'
    },
    {
      id: 'q3_3',
      question: '"A number was doubled, 7 was added, and then the result was divided by 3."',
      options: ['Divide the result', 'by 3', 'Double the number', 'Add 7'],
      correctOrder: ['Double the number', 'Add 7', 'Divide the result', 'by 3'],
      correctAnswer: '(2x + 7)/3',
      hint: 'Double first, add 7, then divide the whole result by 3.',
      explanation: 'First double (2x), add 7 (2x + 7), then divide the whole result by 3: (2x + 7)/3.'
    },
    {
      id: 'q3_4',
      question: '"A number was tripled, 2 was subtracted, and then 5 was added."',
      options: ['Add 5', 'Triple the number', 'Subtract 2'],
      correctOrder: ['Triple the number', 'Subtract 2', 'Add 5'],
      correctAnswer: '3x − 2 + 5',
      hint: 'Triple the number first, then apply the next two steps in order.',
      explanation: 'Triple first (3x), subtract 2 (3x − 2), then add 5: 3x − 2 + 5.'
    },
    {
      id: 'q3_5',
      question: '"A number was divided by 4, 3 was added, and then the result was multiplied by 2."',
      options: ['Add 3', 'Divide the number', 'by 4', 'Multiply the result', 'by 2'],
      correctOrder: ['Divide the number', 'by 4', 'Add 3', 'Multiply the result', 'by 2'],
      correctAnswer: '2(x/4 + 3)',
      hint: 'Divide by 4 first, add 3, then multiply the whole result by 2.',
      explanation: 'First divide by 4 (x/4), add 3 (x/4 + 3), then multiply the whole result by 2: 2(x/4 + 3).'
    },
    {
      id: 'q3_6',
      question: '"A number was multiplied by 5, 6 was subtracted, and then the result was divided by 2."',
      options: ['Divide the result', 'by 2', 'Multiply the number', 'by 5', 'Subtract 6'],
      correctOrder: ['Multiply the number', 'by 5', 'Subtract 6', 'Divide the result', 'by 2'],
      correctAnswer: '(5x − 6)/2',
      hint: 'Multiply by 5 first, subtract 6, then divide the whole result by 2.',
      explanation: 'First 5x, subtract 6 (5x − 6), then divide the whole result by 2: (5x − 6)/2.'
    }
  ],

  // LEVEL 4 — Grouped terms with brackets (7 questions)
  '4': [
    {
      id: 'q4_1',
      question: '"The sum of a number and 6 was multiplied by 3."',
      options: ['Add 6 to a number', 'Multiply the result', 'by 3'],
      correctOrder: ['Add 6 to a number', 'Multiply the result', 'by 3'],
      correctAnswer: '3(x + 6)',
      hint: 'Add 6 to the number first to form the group that goes in parentheses.',
      explanation: 'First add 6 to get (x + 6), then multiply the whole group by 3: 3(x + 6).'
    },
    {
      id: 'q4_2',
      question: '"The difference of a number and 5 was divided by 2."',
      options: ['Divide the result', 'by 2', 'Subtract 5 from a number'],
      correctOrder: ['Subtract 5 from a number', 'Divide the result', 'by 2'],
      correctAnswer: '(x − 5)/2',
      hint: 'Form the difference (x − 5) first, then divide it by 2.',
      explanation: 'First subtract 5 to get (x − 5), then divide the whole result by 2: (x − 5)/2.'
    },
    {
      id: 'q4_3',
      question: '"The sum of a number and 4 was multiplied by 5."',
      options: ['Multiply the result', 'by 5', 'Add 4 to a number'],
      correctOrder: ['Add 4 to a number', 'Multiply the result', 'by 5'],
      correctAnswer: '5(x + 4)',
      hint: 'Add 4 to the number first.',
      explanation: 'First add 4 to get (x + 4), then multiply the whole result by 5: 5(x + 4).'
    },
    {
      id: 'q4_4',
      question: '"The difference of a number and 8 was multiplied by 2."',
      options: ['Multiply the result', 'by 2', 'Subtract 8 from a number'],
      correctOrder: ['Subtract 8 from a number', 'Multiply the result', 'by 2'],
      correctAnswer: '2(x − 8)',
      hint: 'Form the difference (x − 8) first.',
      explanation: 'First subtract 8 to get (x − 8), then multiply the whole result by 2: 2(x − 8).'
    },
    {
      id: 'q4_5',
      question: '"The sum of a number and 10 was divided by 5."',
      options: ['Divide the result', 'by 5', 'Add 10 to a number'],
      correctOrder: ['Add 10 to a number', 'Divide the result', 'by 5'],
      correctAnswer: '(x + 10)/5',
      hint: 'Add 10 to the number first.',
      explanation: 'First add 10 to get (x + 10), then divide the whole result by 5: (x + 10)/5.'
    },
    {
      id: 'q4_6',
      question: '"The difference of a number and 7 was multiplied by 3."',
      options: ['Subtract 7 from a number', 'Multiply the result', 'by 3'],
      correctOrder: ['Subtract 7 from a number', 'Multiply the result', 'by 3'],
      correctAnswer: '3(x − 7)',
      hint: 'Subtract 7 from the number first, before multiplying by 3.',
      explanation: 'First subtract 7 to get (x − 7), then multiply the whole result by 3: 3(x − 7).'
    },
    {
      id: 'q4_7',
      question: '"The sum of a number and 9 was multiplied by 2."',
      options: ['Add 9 to a number', 'Multiply the result', 'by 2'],
      correctOrder: ['Add 9 to a number', 'Multiply the result', 'by 2'],
      correctAnswer: '2(x + 9)',
      hint: 'Add 9 to the number first, before multiplying by 2.',
      explanation: 'First add 9 to get (x + 9), then multiply the whole result by 2: 2(x + 9).'
    }
  ],

  // LEVEL 5 — Longer 3–4 step chains (8 questions)
  '5': [
    {
      id: 'q5_1',
      question: '"A number was multiplied by 2, 6 was added, and the result was divided by 4."',
      options: ['Add 6', 'Divide the result', 'by 4', 'Multiply the number by 2'],
      correctOrder: ['Multiply the number by 2', 'Add 6', 'Divide the result', 'by 4'],
      correctAnswer: '(2x + 6)/4',
      hint: 'Multiply by 2 first, add 6, then divide the whole result by 4.',
      explanation: 'First 2x, add 6 (2x + 6), then divide the whole result by 4: (2x + 6)/4.'
    },
    {
      id: 'q5_2',
      question: '"A number was tripled, 8 was subtracted, and the result was multiplied by 2."',
      options: ['Subtract 8', 'Multiply the result', 'by 2', 'Triple the number'],
      correctOrder: ['Triple the number', 'Subtract 8', 'Multiply the result', 'by 2'],
      correctAnswer: '2(3x − 8)',
      hint: 'Triple first, subtract 8, then multiply the whole result by 2.',
      explanation: 'First 3x, subtract 8 (3x − 8), then multiply the whole result by 2: 2(3x − 8).'
    },
    {
      id: 'q5_3',
      question: '"A number was divided by 3, 5 was added, and the result was multiplied by 4."',
      options: ['Multiply the result', 'by 4', 'Divide the number by 3', 'Add 5'],
      correctOrder: ['Divide the number by 3', 'Add 5', 'Multiply the result', 'by 4'],
      correctAnswer: '4(x/3 + 5)',
      hint: 'Divide by 3 first.',
      explanation: 'First divide by 3 (x/3), add 5 (x/3 + 5), then multiply the whole result by 4: 4(x/3 + 5).'
    },
    {
      id: 'q5_4',
      question: '"A number was doubled, 4 was subtracted, and then 7 was added."',
      options: ['Add 7', 'Double the number', 'Subtract 4'],
      correctOrder: ['Double the number', 'Subtract 4', 'Add 7'],
      correctAnswer: '2x − 4 + 7',
      hint: 'Double the number first, then apply the next two steps in order.',
      explanation: 'First 2x, subtract 4 (2x − 4), then add 7: 2x − 4 + 7.'
    },
    {
      id: 'q5_5',
      question: '"A number was multiplied by 4, 3 was added, and the result was divided by 5."',
      options: ['Divide the result', 'by 5', 'Add 3', 'Multiply by 4'],
      correctOrder: ['Multiply by 4', 'Add 3', 'Divide the result', 'by 5'],
      correctAnswer: '(4x + 3)/5',
      hint: 'Multiply by 4 first.',
      explanation: 'First 4x, add 3 (4x + 3), then divide the whole result by 5: (4x + 3)/5.'
    },
    {
      id: 'q5_6',
      question: '"A number was divided by 2, 9 was subtracted, and the result was multiplied by 3."',
      options: ['Multiply the result', 'by 3', 'Subtract 9', 'Divide the number by 2'],
      correctOrder: ['Divide the number by 2', 'Subtract 9', 'Multiply the result', 'by 3'],
      correctAnswer: '3(x/2 − 9)',
      hint: 'Divide by 2 first.',
      explanation: 'First x/2, subtract 9 (x/2 − 9), then multiply the whole result by 3: 3(x/2 − 9).'
    },
    {
      id: 'q5_7',
      question: '"A number was multiplied by 3, 5 was added, and then 2 was subtracted."',
      options: ['Subtract 2', 'Multiply by 3', 'Add 5'],
      correctOrder: ['Multiply by 3', 'Add 5', 'Subtract 2'],
      correctAnswer: '3x + 5 − 2',
      hint: 'Multiply by 3 first, then apply the next two steps in order.',
      explanation: 'First 3x, add 5 (3x + 5), then subtract 2: 3x + 5 − 2.'
    },
    {
      id: 'q5_8',
      question: '"A number was divided by 5, 4 was added, and then the result was divided by 2."',
      options: ['Divide the result', 'by 2', 'Add 4', 'Divide the number by 5'],
      correctOrder: ['Divide the number by 5', 'Add 4', 'Divide the result', 'by 2'],
      correctAnswer: '(x/5 + 4)/2',
      hint: 'Divide by 5 first.',
      explanation: 'First x/5, add 4 (x/5 + 4), then divide the whole result by 2: (x/5 + 4)/2.'
    }
  ],

  // LEVEL 6 — Mixed review of levels 1–5 (7 questions)
  '6': [
    {
      id: 'q6_1',
      question: '"7 was added to a number, and the total was divided by 3."',
      options: ['Divide the total', 'by 3', 'Add 7 to a number'],
      correctOrder: ['Add 7 to a number', 'Divide the total', 'by 3'],
      correctAnswer: '(x + 7)/3',
      hint: 'Add 7 to the number first, before dividing.',
      explanation: 'First add 7 to get (x + 7), then divide the whole total by 3: (x + 7)/3.'
    },
    {
      id: 'q6_2',
      question: '"A number was multiplied by 4, 9 was subtracted, and the result was divided by 2."',
      options: ['Divide the result', 'by 2', 'Subtract 9', 'Multiply by 4'],
      correctOrder: ['Multiply by 4', 'Subtract 9', 'Divide the result', 'by 2'],
      correctAnswer: '(4x − 9)/2',
      hint: 'Multiply by 4 first.',
      explanation: 'First 4x, subtract 9 (4x − 9), then divide the whole result by 2: (4x − 9)/2.'
    },
    {
      id: 'q6_3',
      question: '"The sum of a number and 5 was multiplied by 2."',
      options: ['Multiply the result', 'by 2', 'Add 5 to a number'],
      correctOrder: ['Add 5 to a number', 'Multiply the result', 'by 2'],
      correctAnswer: '2(x + 5)',
      hint: 'Add 5 first, then multiply the whole result by 2.',
      explanation: 'First add 5 to get (x + 5), then multiply the whole result by 2: 2(x + 5).'
    },
    {
      id: 'q6_4',
      question: '"A number was tripled, and then 11 was subtracted."',
      options: ['Subtract 11', 'Triple the number'],
      correctOrder: ['Triple the number', 'Subtract 11'],
      correctAnswer: '3x − 11',
      hint: 'Triple the number first.',
      explanation: 'First triple the number (3x), then subtract 11: 3x − 11.'
    },
    {
      id: 'q6_5',
      question: '"A number was halved, and then 8 was added."',
      options: ['Add 8', 'Take half of the number'],
      correctOrder: ['Take half of the number', 'Add 8'],
      correctAnswer: 'x/2 + 8',
      hint: 'Take half of the number first.',
      explanation: 'First take half of the number (x/2), then add 8: x/2 + 8.'
    },
    {
      id: 'q6_6',
      question: '"A number was increased by 6, and then the result was multiplied by 4."',
      options: ['Multiply the result', 'by 4', 'Add 6 to the number'],
      correctOrder: ['Add 6 to the number', 'Multiply the result', 'by 4'],
      correctAnswer: '4(x + 6)',
      hint: 'Add 6 to the number first, before multiplying by 4.',
      explanation: 'First add 6 to get (x + 6), then multiply the whole result by 4: 4(x + 6).'
    },
    {
      id: 'q6_7',
      question: '"A number was multiplied by 2, 10 was subtracted, and then 3 was added."',
      options: ['Add 3', 'Multiply by 2', 'Subtract 10'],
      correctOrder: ['Multiply by 2', 'Subtract 10', 'Add 3'],
      correctAnswer: '2x − 10 + 3',
      hint: 'Multiply by 2 first, then apply the next two steps in order.',
      explanation: 'First 2x, subtract 10 (2x − 10), then add 3: 2x − 10 + 3.'
    }
  ],

  // LEVEL 7 — Real-world word problems (6 questions)
  '7': [
    {
      id: 'q7_1',
      question: '"A bill was x dollars. A $10 tip was added to it, and the total was split equally between 4 friends."',
      options: ['Split the total', 'between 4 friends', 'Start with the bill', 'Add $10'],
      correctOrder: ['Start with the bill', 'Add $10', 'Split the total', 'between 4 friends'],
      correctAnswer: '(x + 10)/4',
      hint: 'Start with the bill, add the tip, then split the total.',
      explanation: 'Start with the bill (x), add the $10 tip (x + 10), then split the total among 4 friends: (x + 10)/4.'
    },
    {
      id: 'q7_2',
      question: '"A box had x pencils. 5 broken pencils were removed, and the remaining pencils were shared equally among 3 students."',
      options: ['Share the remaining pencils', 'among 3 students', 'Start with the total pencils', 'Remove 5 broken pencils'],
      correctOrder: ['Start with the total pencils', 'Remove 5 broken pencils', 'Share the remaining pencils', 'among 3 students'],
      correctAnswer: '(x − 5)/3',
      hint: 'Remove the broken pencils before sharing the rest.',
      explanation: 'Start with the total pencils (x), remove 5 (x − 5), then share the rest among 3 students: (x − 5)/3.'
    },
    {
      id: 'q7_3',
      question: '"A price was x dollars. A 20% discount was applied, and then $5 shipping was added to the discounted price."',
      options: ['Add $5 shipping', 'Start with the price', 'Apply the discount', 'Keep 80% of the price'],
      correctOrder: ['Start with the price', 'Apply the discount', 'Keep 80% of the price', 'Add $5 shipping'],
      correctAnswer: '0.8x + 5',
      hint: 'The discount lowers the price before shipping is added.',
      explanation: 'Start with the price (x), a 20% discount leaves 80% of it (0.8x), then add $5 shipping: 0.8x + 5.'
    },
    {
      id: 'q7_4',
      question: '"A ticket price was x dollars. A $6 fee was added to it, and the total was divided equally between 2 people."',
      options: ['Divide the total', 'between 2 people', 'Start with the ticket price', 'Add $6'],
      correctOrder: ['Start with the ticket price', 'Add $6', 'Divide the total', 'between 2 people'],
      correctAnswer: '(x + 6)/2',
      hint: 'Add the fee to the ticket price first.',
      explanation: 'Start with the ticket price (x), add the $6 fee (x + 6), then divide the total between 2 people: (x + 6)/2.'
    },
    {
      id: 'q7_5',
      question: '"A student had x points, lost 8 points, and then earned 15 more points."',
      options: ['Earn 15 points', 'Start with x points', 'Lose 8 points'],
      correctOrder: ['Start with x points', 'Lose 8 points', 'Earn 15 points'],
      correctAnswer: 'x − 8 + 15',
      hint: 'Start with x points, then apply each event in the order it happens.',
      explanation: 'Start with x points, lose 8 (x − 8), then earn 15 more: x − 8 + 15.'
    },
    {
      id: 'q7_6',
      question: '"A box had x chocolates. 4 were removed, and the rest were shared equally among 5 students."',
      options: ['Share the remaining chocolates', 'among 5 students', 'Remove 4 chocolates', 'Start with x chocolates'],
      correctOrder: ['Start with x chocolates', 'Remove 4 chocolates', 'Share the remaining chocolates', 'among 5 students'],
      correctAnswer: '(x − 4)/5',
      hint: 'Remove the chocolates before sharing what\'s left.',
      explanation: 'Start with x chocolates, remove 4 (x − 4), then share the rest among 5 students: (x − 4)/5.'
    }
  ],

  // LEVEL 8 — Squares & square roots (5 questions)
  '8': [
    {
      id: 'q8_1',
      question: '"A number was doubled, 9 was subtracted, and the final result was squared."',
      options: ['Square the result', 'Subtract 9', 'Start with the number', 'Double the number'],
      correctOrder: ['Start with the number', 'Double the number', 'Subtract 9', 'Square the result'],
      correctAnswer: '(2x − 9)²',
      hint: 'Double first, subtract 9, then square the whole result.',
      explanation: 'Start with x, double it (2x), subtract 9 (2x − 9), then square the whole result: (2x − 9)².'
    },
    {
      id: 'q8_2',
      question: '"5 was added to three times a number, and the square root of the result was taken."',
      options: ['Take the square root', 'Multiply the number by 3', 'Add 5', 'Use the result'],
      correctOrder: ['Multiply the number by 3', 'Add 5', 'Use the result', 'Take the square root'],
      correctAnswer: '√(3x + 5)',
      hint: 'Multiply by 3 first, add 5, then take the square root of that whole result.',
      explanation: 'First 3x, add 5 (3x + 5), then take the square root of the whole result: √(3x + 5).'
    },
    {
      id: 'q8_3',
      question: '"A number was increased by 4, the result was multiplied by 3, and then 2 was subtracted."',
      options: ['Subtract 2', 'Multiply the result', 'by 3', 'Add 4 to the number'],
      correctOrder: ['Add 4 to the number', 'Multiply the result', 'by 3', 'Subtract 2'],
      correctAnswer: '3(x + 4) − 2',
      hint: 'Add 4 to the number first.',
      explanation: 'First add 4 (x + 4), multiply the whole result by 3 (3(x + 4)), then subtract 2: 3(x + 4) − 2.'
    },
    {
      id: 'q8_4',
      question: '"A number was divided by 2, 6 was added, and the entire result was squared."',
      options: ['Square the entire result', 'Add 6', 'Divide the number by 2'],
      correctOrder: ['Divide the number by 2', 'Add 6', 'Square the entire result'],
      correctAnswer: '(x/2 + 6)²',
      hint: 'Divide by 2 first.',
      explanation: 'First x/2, add 6 (x/2 + 6), then square the entire result: (x/2 + 6)².'
    },
    {
      id: 'q8_5',
      question: '"A number was multiplied by 4, 7 was subtracted, and the result was squared."',
      options: ['Square the result', 'Multiply the number by 4', 'Subtract 7'],
      correctOrder: ['Multiply the number by 4', 'Subtract 7', 'Square the result'],
      correctAnswer: '(4x − 7)²',
      hint: 'Multiply by 4 first.',
      explanation: 'First 4x, subtract 7 (4x − 7), then square the whole result: (4x − 7)².'
    }
  ],

  // LEVEL 9 — Final mastery, 4-step chains (4 questions, 75% required to pass)
  '9': [
    {
      id: 'q9_1',
      question: '"A number was multiplied by 3, 5 was added, the result was divided by 2, and then 4 was subtracted."',
      options: ['Subtract 4', 'Divide the result', 'by 2', 'Multiply the number by 3', 'Add 5'],
      correctOrder: ['Multiply the number by 3', 'Add 5', 'Divide the result', 'by 2', 'Subtract 4'],
      correctAnswer: '(3x + 5)/2 − 4',
      hint: 'Multiply by 3 first, add 5, divide the whole result by 2, then subtract 4.',
      explanation: 'Start 3x, add 5 (3x + 5), divide by 2 ((3x + 5)/2), then subtract 4: (3x + 5)/2 − 4.'
    },
    {
      id: 'q9_2',
      question: '"A number was doubled, 6 was added, the total was divided by 3, and the result was squared."',
      options: ['Square the result', 'Add 6', 'Divide the total', 'by 3', 'Double the number'],
      correctOrder: ['Double the number', 'Add 6', 'Divide the total', 'by 3', 'Square the result'],
      correctAnswer: '((2x + 6)/3)²',
      hint: 'Double first, add 6, divide the whole total by 3, then square the whole result.',
      explanation: 'Start 2x, add 6 (2x + 6), divide by 3 ((2x + 6)/3), then square the whole result: ((2x + 6)/3)².'
    },
    {
      id: 'q9_3',
      question: '"A number was tripled, 8 was subtracted, the result was divided by 2, and 5 was added."',
      options: ['Add 5', 'Divide the result', 'by 2', 'Triple the number', 'Subtract 8'],
      correctOrder: ['Triple the number', 'Subtract 8', 'Divide the result', 'by 2', 'Add 5'],
      correctAnswer: '(3x − 8)/2 + 5',
      hint: 'Triple first, subtract 8, divide the whole result by 2, then add 5.',
      explanation: 'Start 3x, subtract 8 (3x − 8), divide by 2 ((3x − 8)/2), then add 5: (3x − 8)/2 + 5.'
    },
    {
      id: 'q9_4',
      question: '"A number was increased by 7, the result was multiplied by 2, decreased by 4, and then divided by 3."',
      options: ['Divide the result', 'by 3', 'Add 7 to the number', 'Multiply the result', 'by 2', 'Subtract 4'],
      correctOrder: ['Add 7 to the number', 'Multiply the result', 'by 2', 'Subtract 4', 'Divide the result', 'by 3'],
      correctAnswer: '(2(x + 7) − 4)/3',
      hint: 'Add 7 first, multiply the whole result by 2, subtract 4, then divide the whole thing by 3.',
      explanation: 'Start (x + 7), multiply the whole group by 2 (2(x + 7)), subtract 4, then divide everything by 3: (2(x + 7) − 4)/3.'
    }
  ]
};

// Helper to perform a robust Fisher-Yates shuffle on an array copy
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper to pick n random distinct items from an array
function getRandomSet(array, count) {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

// Scramble card pool so cards are randomized initially and never match a static pattern
function scrambleCards(cardArray, targetOrder) {
  const pool = [...cardArray];
  if (pool.length <= 1) return pool;
  
  for (let i = 0; i < 50; i++) {
    const scrambled = shuffleArray(pool);
    if (!targetOrder || scrambled.join('|||') !== targetOrder.join('|||')) {
      return scrambled;
    }
  }
  return shuffleArray(pool);
}

// ─── Level Metadata for Level Selection Main Page ────────────────────────────
export const LEVEL_METADATA = [
  { level: 0, title: 'Learn the Basics (Foundations)', badge: 'Level 0', questions: 4, desc: 'Master the 4 core transformation rules with guided interactive examples.' },
  { level: 1, title: 'Very Easy Practice', badge: 'Level 1', questions: 4, desc: 'Simple two-step order phrases.' },
  { level: 2, title: 'Easy Practice', badge: 'Level 2', questions: 5, desc: 'Practice phrases with halves, parts, and division.' },
  { level: 3, title: 'Simple Combinations', badge: 'Level 3', questions: 6, desc: 'Put 3-step action chains in order.' },
  { level: 4, title: 'Grouped Operations', badge: 'Level 4', questions: 7, desc: 'Practice grouping with brackets: 3(x + 6).' },
  { level: 5, title: 'More Steps', badge: 'Level 5', questions: 8, desc: 'Challenge yourself with longer 3–4 step action chains.' },
  { level: 6, title: 'Mixed Practice', badge: 'Level 6', questions: 7, desc: 'Mixed practice reviewing previous topics.' },
  { level: 7, title: 'Apply the Idea', badge: 'Level 7', questions: 6, desc: 'Real-world word problems: tips, splits & fees.' },
  { level: 8, title: 'Challenge', badge: 'Level 8', questions: 5, desc: 'Advanced operations with squares & square roots.' },
  { level: 9, title: 'Final Mastery', badge: 'Level 9', questions: 4, desc: 'Comprehensive final test (75%+ required for mastery).' }
];

// ─── Interactive Door & Lock Unlocking Portal ─────────────────────────────────
function DoorUnlockPortal({ nextLevel, onAdvance, isLevel0 }) {
  const [stage, setStage] = useState('locked'); // 'locked' -> 'unlocking' -> 'opened'

  useEffect(() => {
    // 1. Shackle pops and unlocks
    const t1 = setTimeout(() => {
      setStage('unlocking');
    }, 450);

    // 2. Double doors swing open
    const t2 = setTimeout(() => {
      setStage('opened');
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto 22px auto',
      position: 'relative'
    }}>
      {/* Outer Door Frame Archway */}
      <div style={{
        position: 'relative',
        height: '175px',
        borderRadius: '20px',
        border: '2px solid var(--clr-accent)',
        background: 'var(--clr-surface)',
        boxShadow: stage === 'opened' 
          ? '0 0 30px rgba(249, 115, 22, 0.25), inset 0 0 25px rgba(249, 115, 22, 0.12)' 
          : '0 8px 24px rgba(0, 0, 0, 0.18)',
        perspective: '800px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'box-shadow 0.6s ease'
      }}>
        {/* Inner Portal Light / Destination CTA */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.18) 0%, rgba(245, 158, 11, 0.05) 50%, var(--clr-surface) 100%)',
          opacity: stage === 'opened' ? 1 : 0,
          transform: stage === 'opened' ? 'scale(1)' : 'scale(0.88)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 2,
          padding: '16px'
        }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--clr-accent)',
            background: 'var(--clr-card)',
            padding: '4px 14px',
            borderRadius: '16px',
            border: '1px solid var(--clr-border)'
          }}>
            Door Unlocked • Level {nextLevel} Ready
          </span>

          <button
            onClick={onAdvance}
            style={{
              padding: '12px 28px',
              fontSize: '0.98rem',
              fontWeight: 800,
              borderRadius: '12px',
              border: 'none',
              background: 'var(--clr-accent)',
              color: 'var(--clr-accent-text, #ffffff)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(249, 115, 22, 0.35)';
            }}
          >
            {isLevel0 ? 'Start Level 1 Practice ➔' : `Start Level ${nextLevel} ➔`}
          </button>
        </div>

        {/* Left Vault Door Panel */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(135deg, #2a221d, #1c1713)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          transformOrigin: 'left center',
          transform: stage === 'opened' ? 'rotateY(-92deg)' : 'rotateY(0deg)',
          transition: 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '12px',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
        }}>
          {/* Panel detail bar */}
          <div style={{
            width: '6px',
            height: '42px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.1)'
          }} />
        </div>

        {/* Right Vault Door Panel */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(225deg, #2a221d, #1c1713)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          transformOrigin: 'right center',
          transform: stage === 'opened' ? 'rotateY(92deg)' : 'rotateY(0deg)',
          transition: 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '12px',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
        }}>
          {/* Panel detail bar */}
          <div style={{
            width: '6px',
            height: '42px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.1)'
          }} />
        </div>

        {/* Lock Mechanism in Center */}
        <div style={{
          position: 'absolute',
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: stage === 'opened' ? 'none' : 'auto',
          opacity: stage === 'opened' ? 0 : 1,
          transform: stage === 'opened' ? 'scale(1.3) translateY(-12px)' : 'scale(1) translateY(0)',
          transition: 'all 0.5s ease'
        }}>
          {/* SVG Padlock with Animated Shackle */}
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none" style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }}>
            {/* Shackle (Arch) */}
            <path
              d="M22 28V18C22 11.3726 27.3726 6 34 6C40.6274 6 46 11.3726 46 18V28"
              stroke={stage === 'locked' ? '#e2e8f0' : '#f59e0b'}
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                transformOrigin: '46px 28px',
                transform: stage === 'locked' ? 'translateY(0)' : 'translateY(-6px) rotate(-22deg)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
            {/* Padlock Body */}
            <rect
              x="14"
              y="26"
              width="40"
              height="34"
              rx="8"
              fill="url(#lockBodyGradient)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            {/* Keyhole */}
            <circle cx="34" cy="40" r="3.5" fill="#1e293b" />
            <path d="M32.5 42L31.5 50H36.5L35.5 42H32.5Z" fill="#1e293b" />
            {/* Shackle Catch Holes */}
            <circle cx="22" cy="27" r="2.5" fill="#475569" />
            <circle cx="46" cy="27" r="2.5" fill="#475569" />
            <defs>
              <linearGradient id="lockBodyGradient" x1="14" y1="26" x2="54" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>

          <span style={{
            marginTop: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: stage === 'locked' ? '#cbd5e1' : '#fbbf24',
            background: 'rgba(0,0,0,0.65)',
            padding: '2px 8px',
            borderRadius: '6px',
            transition: 'color 0.3s ease'
          }}>
            {stage === 'locked' ? 'Unlocking...' : 'Unlocked!'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SyntacticRewriter() {
  const mastery = useMastery('rewrite', 5);

  // Main menu vs active playing mode ('menu' | 'playing')
  const [viewMode, setViewMode] = useState('menu');

  // Active level state (0 through 9)
  const [level, setLevel] = useState(0);

  // Level 0 Concept Guide Hub state
  const [conceptGuideOpen, setConceptGuideOpen] = useState(true);
  const [activeConceptTab, setActiveConceptTab] = useState('first');
  const [level0ConceptCompleted, setLevel0ConceptCompleted] = useState(false);

  // Round tracking per level
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundCorrectCount, setRoundCorrectCount] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [repeatLevelNeeded, setRepeatLevelNeeded] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(100);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Live session streak & accuracy tracking (starts fresh on every page refresh)
  const [sessionStreak, setSessionStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Points & Perfect Run Bonus (starts at 0 on every page refresh)
  const [totalPoints, setTotalPoints] = useState(0);
  const [perfectBonusEarned, setPerfectBonusEarned] = useState(false);

  // Clear all persisted storage keys on mount / refresh to start completely clean
  useEffect(() => {
    try {
      localStorage.removeItem('vachana_completed_levels_rewrite');
      localStorage.removeItem('vachana_completed_levels_rewrite_v2');
      localStorage.removeItem('vachana_unlocked_max_rewrite_v2');
      localStorage.removeItem('vachana_rewrite_completed_v3');
      localStorage.removeItem('vachana_rewrite_unlocked_v3');
      localStorage.removeItem('vachana_rewrite_points_v3');
      localStorage.removeItem('vachana_rewrite_streak_v3');
      localStorage.removeItem('vachana_rewrite_attempts_v3');
      localStorage.removeItem('vachana_rewrite_correct_v3');
    } catch {}
  }, []);

  // Level Lock & Unlock Tracking (initially only Level 0 & Level 1 unlocked on refresh)
  const [unlockedMaxLevel, setUnlockedMaxLevel] = useState(1);
  const [recentlyUnlockedLevel, setRecentlyUnlockedLevel] = useState(null);
  const [lockedToast, setLockedToast] = useState(null);

  // Completed Levels Tracking (starts empty on refresh)
  const [completedLevels, setCompletedLevels] = useState([]);

  const markLevelCompleted = (lvl) => {
    const nextLvl = lvl === 0 ? 1 : lvl + 1;
    setCompletedLevels(prev => {
      const next = prev.includes(lvl) ? prev : [...prev, lvl];
      try {
        localStorage.setItem('vachana_rewrite_completed_v3', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (nextLvl <= 9) {
      setUnlockedMaxLevel(prev => {
        const updated = Math.max(prev, nextLvl);
        try {
          localStorage.setItem('vachana_rewrite_unlocked_v3', String(updated));
        } catch {}
        return updated;
      });
      setRecentlyUnlockedLevel(nextLvl);
    }
  };

  // Drag and drop / Slot state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [cardPoolOrder, setCardPoolOrder] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [placedSlots, setPlacedSlots] = useState([]);

  // Question interaction state
  const [showHint, setShowHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  // Timer & Personal Best State
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [roundQuestionTimes, setRoundQuestionTimes] = useState([]);
  const [bestLevelTime, setBestLevelTime] = useState(null);
  const [isNewLevelRecord, setIsNewLevelRecord] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`vachana_best_level_time_rewrite_lvl_${level}`);
      setBestLevelTime(saved !== null ? parseInt(saved, 10) : null);
    } catch {
      setBestLevelTime(null);
    }
  }, [level]);

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m === 0 ? `${s}s` : `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && viewMode === 'playing' && !roundFinished) {
      interval = setInterval(() => {
        setQuestionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, viewMode, roundFinished]);

  // Initialize round whenever level changes or level is repeated
  const startLevelRound = (lvl) => {
    let qSet = [];
    const count = LEVEL_QUESTION_COUNTS[lvl] || 4;

    if (lvl === 0) {
      qSet = TUTORIAL_QUESTIONS;
      setLevel0ConceptCompleted(false);
      setActiveConceptTab('first');
    } else {
      const bank = REWRITE_BANK[String(lvl)] || REWRITE_BANK['1'];
      qSet = getRandomSet(bank, Math.min(count, bank.length));
    }

    setRoundQuestions(qSet);
    setRoundIndex(0);
    setRoundCorrectCount(0);
    setRoundFinished(false);
    setRepeatLevelNeeded(false);
    setExerciseCompleted(false);
    setRoundQuestionTimes([]);
    setIsNewLevelRecord(false);
    setPerfectBonusEarned(false);
    setLastAccuracy(0);

    if (qSet.length > 0) {
      loadQuestion(qSet[0]);
    }
  };

  useEffect(() => {
    startLevelRound(level);
  }, [level]);

  // Trigger party popper confetti animation upon successful level completion
  useEffect(() => {
    if (roundFinished && !repeatLevelNeeded) {
      triggerPartyPopperAnimation();
    }
  }, [roundFinished, repeatLevelNeeded]);

  // Load a single question
  const loadQuestion = (question) => {
    setCurrentQuestion(question);
    const cards = question.options || question.cards || [];
    const targetOrder = question.correctOrder || question.targetOrder || [];
    const scrambled = scrambleCards(cards, targetOrder);
    setCardPoolOrder(scrambled);
    setAvailableCards(scrambled);
    setPlacedSlots(new Array(targetOrder.length).fill(null));
    setShowHint(false);
    setFeedbackMsg(null);
    setIsCorrect(false);
    setIncorrectAttempts(0);
    setQuestionSeconds(0);
    setTimerActive(true);
  };

  // ── Drag & Drop Handlers ────────────────────────────────────────────────────

  const handleDragStart = (e, cardText, fromSource, fromIdx) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardText, fromSource, fromIdx }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const placeCardInSlot = (cardText, fromSource, fromIdx, targetSlotIdx) => {
    if (isCorrect) return;

    const existingCardInTarget = placedSlots[targetSlotIdx];
    const newPlaced = [...placedSlots];
    const newAvailable = [...availableCards];

    if (fromSource === 'pool') {
      newAvailable.splice(fromIdx, 1);
      if (existingCardInTarget !== null) {
        newAvailable.push(existingCardInTarget);
      }
      newPlaced[targetSlotIdx] = cardText;
    } else if (fromSource === 'slot') {
      newPlaced[fromIdx] = existingCardInTarget;
      newPlaced[targetSlotIdx] = cardText;
    }

    setPlacedSlots(newPlaced);
    setAvailableCards(newAvailable);
    setFeedbackMsg(null);
  };

  const returnCardToPool = (slotIdx) => {
    if (isCorrect) return;
    const cardText = placedSlots[slotIdx];
    if (!cardText) return;

    const newPlaced = [...placedSlots];
    newPlaced[slotIdx] = null;
    const newAvailable = [...availableCards, cardText];

    setPlacedSlots(newPlaced);
    setAvailableCards(newAvailable);
    setFeedbackMsg(null);
  };

  // Tap-to-place / Tap-to-remove
  const handleCardPoolTap = (cardText, poolIdx) => {
    if (isCorrect) return;
    const firstEmpty = placedSlots.findIndex(s => s === null);
    if (firstEmpty !== -1) {
      placeCardInSlot(cardText, 'pool', poolIdx, firstEmpty);
    }
  };

  const handleSlotTap = (slotIdx) => {
    if (isCorrect) return;
    returnCardToPool(slotIdx);
  };

  // ── Answer Verification & Progression ───────────────────────────────────────

  const handleCheckAnswer = () => {
    if (!currentQuestion || isCorrect) return;

    if (placedSlots.some(s => s === null)) {
      setFeedbackMsg({
        type: 'warning',
        text: 'Please drag cards into all numbered spaces before checking!'
      });
      return;
    }

    const targetOrder = currentQuestion.correctOrder || currentQuestion.targetOrder || [];
    const userSequence = placedSlots.join('|||');
    const targetSequence = targetOrder.join('|||');
    const correct = userSequence === targetSequence;

    setIsCorrect(correct);

    if (correct) {
      setTimerActive(false);
      setRoundCorrectCount(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);
      setSessionStreak(prev => prev + 1);

      // Record time for current question
      setRoundQuestionTimes(prev => [...prev, { qNum: roundIndex + 1, time: questionSeconds, isCorrect: true }]);

      const visualFlow = currentQuestion.visualFlow || (targetOrder.join(' → ') + ' → ' + (currentQuestion.correctAnswer || currentQuestion.algebraic || ''));
      const algebraic = currentQuestion.correctAnswer || currentQuestion.algebraic;

      setFeedbackMsg({
        type: 'success',
        text: 'Great! You got the order right.',
        visualFlow: visualFlow,
        algebraic: algebraic,
        explanation: currentQuestion.explanation
      });
    } else {
      setSessionStreak(0);
      setTotalAttempts(prev => prev + 1);
      setIncorrectAttempts(prev => prev + 1);
      setFeedbackMsg({
        type: 'error',
        text: 'Not quite. Look at what happens first.',
        hint: currentQuestion.hint
      });
    }
  };

  // Move to next question in round
  const handleNextQuestion = () => {
    const nextIdx = roundIndex + 1;

    if (nextIdx < roundQuestions.length) {
      setRoundIndex(nextIdx);
      loadQuestion(roundQuestions[nextIdx]);
    } else {
      // Finish current round
      const total = roundQuestions.length;
      const finalCorrect = roundCorrectCount;
      const accuracy = Math.round((finalCorrect / total) * 100);
      setLastAccuracy(accuracy);
      setRoundFinished(true);

      // Award bonus points for completing level without error (100% accuracy)
      if (accuracy === 100 && total > 0) {
        setPerfectBonusEarned(true);
        setTotalPoints(prev => {
          const nextPts = prev + 20;
          try {
            localStorage.setItem('vachana_rewrite_points_v3', String(nextPts));
          } catch {}
          return nextPts;
        });
      }

      const targetNext = level === 0 ? 1 : level + 1;
      if (level === 0) {
        // Level 0 completed! Award 10 pts
        setTotalPoints(prev => {
          const next = prev + 10;
          try { localStorage.setItem('vachana_rewrite_points_v3', String(next)); } catch {}
          return next;
        });
        // Level 0 completed! Mark tutorial done and unlock level 1
        markLevelCompleted(0);
        const progress = loadMasteryProgress();
        progress['rewrite'] = {
          ...(progress['rewrite'] || {}),
          level0Done: true,
          currentLevel: 1,
          highestLevel: Math.max(progress['rewrite']?.highestLevel || 1, 1)
        };
        saveMasteryProgress(progress);
        if (1 > unlockedMaxLevel) {
          setUnlockedMaxLevel(1);
          setRecentlyUnlockedLevel(1);
        }
      } else if (level === 9) {
        // Level 9 requires 75%+ accuracy for final completion
        if (accuracy < 75) {
          setRepeatLevelNeeded(true);
        } else {
          setTotalPoints(prev => {
            const next = prev + 10;
            try { localStorage.setItem('vachana_rewrite_points_v3', String(next)); } catch {}
            return next;
          });
          markLevelCompleted(9);
          setExerciseCompleted(true);
          mastery.handleAnswer(true);
        }
      } else {
        // Levels 1–8 require >= 50% accuracy to pass
        if (accuracy < 50) {
          setRepeatLevelNeeded(true);
        } else {
          setTotalPoints(prev => {
            const next = prev + 10;
            try { localStorage.setItem('vachana_rewrite_points_v3', String(next)); } catch {}
            return next;
          });
          markLevelCompleted(level);
          mastery.handleAnswer(true);
          if (targetNext > unlockedMaxLevel && targetNext <= 9) {
            setUnlockedMaxLevel(targetNext);
            setRecentlyUnlockedLevel(targetNext);
            try {
              localStorage.setItem('vachana_unlocked_max_rewrite_v2', String(targetNext));
            } catch {}
            const progress = loadMasteryProgress();
            progress['rewrite'] = {
              ...(progress['rewrite'] || {}),
              highestLevel: Math.max(progress['rewrite']?.highestLevel || 1, targetNext)
            };
            saveMasteryProgress(progress);
          }
        }
      }
    }
  };

  // Continue to next level after passing
  const handleAdvanceNextLevel = () => {
    if (level === 0) {
      setLevel(1);
    } else if (level < 9) {
      setLevel(level + 1);
    } else {
      // Completed Level 9!
      startLevelRound(9);
    }
  };

  // Repeat level with new randomized questions
  const handleRepeatLevel = () => {
    setRoundCorrectCount(0);
    setRoundIndex(0);
    setLastAccuracy(0);
    startLevelRound(level);
  };

  // Restart / Reset Accuracy and Streak stats
  const handleRestartStats = () => {
    setSessionStreak(0);
    setTotalAttempts(0);
    setTotalCorrect(0);
    setRoundCorrectCount(0);
    setRoundIndex(0);
    try {
      localStorage.removeItem('vachana_rewrite_streak_v3');
      localStorage.removeItem('vachana_rewrite_attempts_v3');
      localStorage.removeItem('vachana_rewrite_correct_v3');
    } catch {}
    startLevelRound(level);
  };

  // Retry / Reset current question cards and feedback
  const handleRetryQuestion = () => {
    if (!currentQuestion) return;
    const cards = currentQuestion.options || currentQuestion.cards || [];
    const targetOrder = currentQuestion.correctOrder || currentQuestion.targetOrder || [];
    const scrambled = scrambleCards(cards, targetOrder);
    setCardPoolOrder(scrambled);
    setAvailableCards(scrambled);
    setPlacedSlots(new Array(targetOrder.length).fill(null));
    setFeedbackMsg(null);
    setIsCorrect(false);
  };

  // Reset exercise
  const handleReset = () => {
    setSessionStreak(0);
    setTotalAttempts(0);
    setTotalCorrect(0);
    setTotalPoints(0);
    setUnlockedMaxLevel(1);
    setRecentlyUnlockedLevel(null);
    setCompletedLevels([]);
    try {
      localStorage.removeItem('vachana_completed_levels_rewrite');
      localStorage.removeItem('vachana_completed_levels_rewrite_v2');
      localStorage.removeItem('vachana_unlocked_max_rewrite_v2');
      localStorage.removeItem('vachana_rewrite_completed_v3');
      localStorage.removeItem('vachana_rewrite_unlocked_v3');
      localStorage.removeItem('vachana_rewrite_points_v3');
      localStorage.removeItem('vachana_rewrite_streak_v3');
      localStorage.removeItem('vachana_rewrite_attempts_v3');
      localStorage.removeItem('vachana_rewrite_correct_v3');
    } catch {}
    const progress = loadMasteryProgress();
    if (progress['rewrite']) {
      delete progress['rewrite'].level0Done;
      progress['rewrite'].highestLevel = 1;
      saveMasteryProgress(progress);
    }
    setLevel(0);
  };

  const handleSelectLevelFromMenu = (lvl) => {
    if (lvl > unlockedMaxLevel) {
      setLockedToast(`Level ${lvl} is locked. Complete Level ${lvl - 1} first to unlock!`);
      setTimeout(() => setLockedToast(null), 3200);
      return;
    }
    setLevel(lvl);
    if (lvl === 0) {
      setLevel0ConceptCompleted(false);
      setActiveConceptTab('first');
    }
    setViewMode('playing');
    startLevelRound(lvl);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Detached All Levels Button on Left */}
      {viewMode !== 'menu' && (
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => setViewMode('menu')}
            style={{
              background: 'transparent',
              border: '1px solid var(--clr-border)',
              color: 'var(--clr-text-soft)',
              cursor: 'pointer',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            ← All Levels
          </button>
        </div>
      )}

      {/* Header Level & Progress Bar (Spanning Full Outer Page Width) */}
      <MasteryLevelHeader
        state={{
          currentLevel: viewMode === 'menu' ? unlockedMaxLevel : level,
          mastered: exerciseCompleted,
          points: totalPoints,
          correctStreak: sessionStreak,
          totalAttempts: totalAttempts,
          totalCorrect: totalCorrect
        }}
        maxLevel={9}
        toastMsg={null}
        onClearToast={mastery.clearToast}
        elapsedTime={viewMode === 'playing' && !roundFinished ? questionSeconds : null}
        hideProgressBar={viewMode !== 'menu'}
        hideLevelTitle={viewMode !== 'menu'}
      />

      {/* Main Content Workspace */}
      <div style={{ width: '100%', marginTop: '4px' }}>
        {/* Top Status & Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--clr-border)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {viewMode === 'menu' ? (
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-text)' }}>
                Syntactic Rewriter — Select a Level
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--clr-text-soft)', marginTop: '2px' }}>
                Choose any level below to practice or learn!
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--clr-accent)',
                  background: 'var(--clr-accent-soft)',
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}>
                  {level === 0 
                    ? (!level0ConceptCompleted ? 'Level 0: Concept Learning' : 'Level 0: Practice Questions')
                    : `Level ${level} of 9`}
                </div>

                {level === 0 && !level0ConceptCompleted ? (
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                    4 Core Rules
                  </span>
                ) : !roundFinished ? (
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                    Q{roundIndex + 1} of {roundQuestions.length}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* ── VIEW MODE 1: LEVEL SELECTION MAIN PAGE ──────────────────────────── */}
        {viewMode === 'menu' ? (
          <div>
            {/* Top Showcase Banner: Level 0 Introduction & Foundations */}
            {(() => {
              const lvl0 = LEVEL_METADATA.find(l => l.level === 0);
              if (!lvl0) return null;
              const isLvl0Completed = completedLevels.includes(0);

              return (
                <div
                  onClick={() => handleSelectLevelFromMenu(0)}
                  style={{
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    borderRadius: '20px',
                    padding: '24px 28px',
                    marginBottom: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '24px',
                    boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--clr-accent)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(249, 115, 22, 0.22), 0 2px 8px rgba(249, 115, 22, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--clr-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))';
                  }}
                >
                  <div style={{ flex: '1 1 360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '16px',
                        border: '1px solid var(--clr-border)',
                        background: 'var(--clr-card)',
                        color: 'var(--clr-accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        Level 0 • Start Here
                      </span>
                      {isLvl0Completed && (
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '12px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#10b981',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ✓ Completed
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        background: 'var(--clr-card)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text-soft)'
                      }}>
                        {lvl0.questions} Guided Questions
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                        Foundations • Guided
                      </span>
                    </div>

                    <h3 style={{ margin: '0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--clr-text)' }}>
                      {lvl0.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <button
                      style={{
                        padding: '13px 30px',
                        fontSize: '0.98rem',
                        fontWeight: 800,
                        borderRadius: '12px',
                        border: 'none',
                        background: 'var(--clr-accent)',
                        color: 'var(--clr-accent-text, #ffffff)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.55)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(249, 115, 22, 0.35)';
                      }}
                    >
                      {isLvl0Completed ? 'Practice Introduction ➔' : 'Start Introduction ➔'}
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>
                      Recommended first step
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Floating Toast Notification when User Taps a Locked Level */}
            {lockedToast && (
              <div style={{
                position: 'fixed',
                bottom: '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1.5px solid var(--clr-accent)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '30px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(249, 115, 22, 0.3)',
                zIndex: 9999,
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideUp 0.25s ease'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>{lockedToast}</span>
              </div>
            )}

            {/* 3-Column Grid for Levels 1 through 9 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '18px'
            }}>
              {LEVEL_METADATA.filter(l => l.level !== 0).map((lvlMeta) => {
                const isLocked = lvlMeta.level > unlockedMaxLevel;
                const isCompleted = completedLevels.includes(lvlMeta.level);

                return (
                  <div
                    key={lvlMeta.level}
                    onClick={() => handleSelectLevelFromMenu(lvlMeta.level)}
                    style={{
                      background: isLocked ? 'rgba(15, 23, 42, 0.4)' : 'var(--clr-surface)',
                      border: isLocked 
                        ? '1.5px dashed var(--clr-border)' 
                        : '2px solid var(--clr-border)',
                      borderRadius: '18px',
                      padding: '22px 20px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '160px',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: isLocked ? 0.6 : 1,
                      boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLocked) {
                        e.currentTarget.style.borderColor = 'var(--clr-accent)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(249, 115, 22, 0.22), 0 2px 8px rgba(249, 115, 22, 0.12)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLocked) {
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))';
                      }
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '16px',
                          border: '1px solid var(--clr-border)',
                          background: 'var(--clr-card)',
                          color: isLocked ? 'var(--clr-text-soft)' : 'var(--clr-accent)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {isLocked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                          {lvlMeta.badge}
                        </span>

                        {isCompleted ? (
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✓ Completed
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                            {lvlMeta.questions} Qs
                          </span>
                        )}
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.08rem', color: isLocked ? 'var(--clr-text-soft)' : 'var(--clr-text)' }}>
                          {lvlMeta.title}
                        </h4>
                      </div>
                    </div>

                    {isLocked ? (
                      <button
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: '1px solid var(--clr-border)',
                          background: 'var(--clr-card)',
                          color: 'var(--clr-text-soft)',
                          cursor: 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Locked</span>
                      </button>
                    ) : (
                      <button
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: 'none',
                          background: 'var(--clr-accent)',
                          color: 'var(--clr-accent-text, #ffffff)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.55)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(249, 115, 22, 0.35)';
                        }}
                      >
                        {isCompleted ? 'Practice Again ➔' : 'Start ➔'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── VIEW MODE 2: ACTIVE GAMEPLAY AREA ────────────────────────────────── */
          <div>
            {/* ── LEVEL 0: ZEROTH LEVEL - INTERACTIVE CONCEPT HUB ──────────────────── */}
            {level === 0 && !level0ConceptCompleted ? (
              <div style={{
                background: 'var(--clr-surface)',
                border: '2px solid var(--clr-border)',
                borderRadius: '18px',
                padding: '22px',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0, 0, 0, 0.03))'
              }}>
                {/* Header */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-text)' }}>
                    The Big Idea — Step-by-Step Math Order
                  </h3>
                </div>

                <div>


                  {/* Active Concept Card Body */}
                  {(() => {
                    const cur = LEVEL0_CONCEPTS.find(c => c.id === activeConceptTab) || LEVEL0_CONCEPTS[0];
                    return (
                      <div style={{
                        background: 'var(--clr-card)',
                        borderRadius: '14px',
                        border: '1px solid var(--clr-border)',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        {/* Top Row: Sentence and Tag */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--clr-accent)', display: 'block', marginBottom: '4px' }}>
                              Given Sentence:
                            </span>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                              {cur.highlightEnglish}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'var(--clr-surface)',
                            border: '1px solid var(--clr-border)',
                            color: 'var(--clr-text-soft)'
                          }}>
                            {cur.tag}
                          </span>
                        </div>

                        {/* Middle Row: Step-by-Step Chronological Ordering Cards */}
                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--clr-text-soft)', display: 'block', marginBottom: '8px' }}>
                            Step-by-Step Math Order (First ➔ Next):
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {cur.steps.map((st, sIdx) => (
                              <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  padding: '10px 16px',
                                  borderRadius: '12px',
                                  background: 'var(--clr-surface)',
                                  border: '1.5px solid var(--clr-accent)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      background: 'var(--clr-accent)',
                                      color: '#fff',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      {st.num}
                                    </span>
                                    <strong style={{ fontSize: '0.92rem', color: 'var(--clr-text)' }}>{st.action}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '4px', fontSize: '0.92rem' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--clr-accent)', textAlign: 'center' }}>{st.math}</span>
                                  </div>
                                </div>
                                {sIdx < cur.steps.length - 1 && (
                                  <span style={{ color: 'var(--clr-accent)', fontWeight: 800, fontSize: '1.2rem' }}>➔</span>
                                )}
                              </div>
                            ))}

                            <span style={{ color: 'var(--clr-text-soft)', fontWeight: 700, fontSize: '1.1rem' }}>=</span>

                            {/* Algebraic Expression Pill */}
                            <div style={{
                              padding: '10px 18px',
                              borderRadius: '12px',
                              background: 'var(--clr-surface)',
                              border: '1.5px solid var(--clr-accent)',
                              color: 'var(--clr-accent)',
                              fontWeight: 800,
                              fontSize: '1.05rem',
                              fontFamily: 'monospace',
                              boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0, 0, 0, 0.03))'
                            }}>
                              {cur.algebraic}
                            </div>
                          </div>
                        </div>

                        {/* Navigation Footer Toolbar: Previous / Next Concept Buttons */}
                        {(() => {
                          const curIdx = LEVEL0_CONCEPTS.findIndex(c => c.id === cur.id);
                          const hasPrev = curIdx > 0;
                          const hasNext = curIdx < LEVEL0_CONCEPTS.length - 1;

                          return (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingTop: '14px',
                              borderTop: '1px solid var(--clr-border)',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              {/* Previous Concept Button */}
                              <button
                                onClick={() => {
                                  if (hasPrev) setActiveConceptTab(LEVEL0_CONCEPTS[curIdx - 1].id);
                                }}
                                disabled={!hasPrev}
                                style={{
                                  padding: '9px 18px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--clr-border)',
                                  background: hasPrev ? 'var(--clr-surface)' : 'transparent',
                                  color: hasPrev ? 'var(--clr-text)' : 'var(--clr-text-soft)',
                                  opacity: hasPrev ? 1 : 0.35,
                                  fontWeight: 700,
                                  fontSize: '0.88rem',
                                  cursor: hasPrev ? 'pointer' : 'not-allowed',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                ← Previous Concept
                              </button>

                              {/* Step Indicator with Interactive Dots */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '0.84rem',
                                color: 'var(--clr-text-soft)',
                                fontWeight: 700
                              }}>
                                <span>Concept {curIdx + 1} of {LEVEL0_CONCEPTS.length}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {LEVEL0_CONCEPTS.map((c, i) => (
                                    <span
                                      key={c.id}
                                      onClick={() => setActiveConceptTab(c.id)}
                                      title={c.title}
                                      style={{
                                        width: i === curIdx ? '22px' : '8px',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: i === curIdx ? 'var(--clr-accent)' : 'var(--clr-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-block'
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Next Concept or Complete & Practice Button */}
                              {hasNext ? (
                                <button
                                  onClick={() => {
                                    setActiveConceptTab(LEVEL0_CONCEPTS[curIdx + 1].id);
                                  }}
                                  style={{
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'var(--clr-accent)',
                                    color: 'var(--clr-accent-text, #ffffff)',
                                    fontWeight: 800,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  Next Concept ➔
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setLevel0ConceptCompleted(true);
                                  }}
                                  style={{
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'var(--clr-accent)',
                                    color: 'var(--clr-accent-text, #ffffff)',
                                    fontWeight: 800,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  Concepts Completed! Start Practice ➔
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div>
                {/* ── ROUND FINISHED SCREEN ────────────────────────────────────────────── */}
                {roundFinished ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                    {/* ── Questions Time Breakdown & All-Time Best ─────────────────────── */}
                <div style={{
                  maxWidth: '460px',
                  margin: '0 auto 24px auto',
                  padding: '16px 20px',
                  background: 'var(--clr-surface, rgba(255,255,255,0.03))',
                  borderRadius: '16px',
                  border: '1px solid var(--clr-border, rgba(255,255,255,0.1))',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text)' }}>
                      ⏱️ Questions Time Breakdown
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                      Total: <strong style={{ color: 'var(--clr-accent, #f97316)' }}>{formatTime(roundQuestionTimes.reduce((a, b) => a + b.time, 0))}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {roundQuestionTimes.map((q, idx) => (
                      <div key={idx} style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        background: q.isCorrect ? 'rgba(46, 160, 67, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: q.isCorrect ? '1px solid var(--clr-correct, #2ea043)' : '1px solid #ef4444',
                        color: 'var(--clr-text)'
                      }}>
                        Q{q.qNum}: {formatTime(q.time)}
                      </div>
                    ))}
                  </div>

                  {bestLevelTime !== null && (
                    <div style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--clr-border, rgba(255,255,255,0.1))',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{ color: 'var(--clr-text-soft)' }}>⚡ All-Time Best (Level {level}):</span>
                      <strong style={{ color: '#f59e0b' }}>
                        {formatTime(bestLevelTime)} {isNewLevelRecord && '🏆 New Record!'}
                      </strong>
                    </div>
                  )}
                </div>
                {repeatLevelNeeded ? (
                  /* REPEAT LEVEL (<50% ACCURACY or <75% ON LEVEL 9) */
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--clr-text, #0f172a)', margin: '0 0 10px 0' }}>
                      Let's try Level {level} again.
                    </h3>
                    <p style={{ fontSize: '0.98rem', color: 'var(--clr-text-soft, #475569)', marginBottom: '16px' }}>
                      You got <strong>{lastAccuracy}%</strong> accuracy on this round ({level === 9 ? '75%' : '50%'} required). You are learning!
                    </p>

                    <div style={{
                      maxWidth: '420px',
                      margin: '0 auto 24px auto',
                      padding: '14px 18px',
                      background: 'var(--clr-surface, #f8fafc)',
                      borderRadius: '12px',
                      border: '1px solid var(--clr-border, #e2e8f0)',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      color: 'var(--clr-text, #334155)'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--clr-accent, #f97316)' }}>
                        Friendly Tips:
                      </strong>
                      • Read the sentence slowly.<br />
                      • Find what happens first.<br />
                      • Then find what happens next.
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleRepeatLevel}
                        style={{
                          padding: '12px 24px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: 'none',
                          background: 'var(--clr-accent, #f97316)',
                          color: 'var(--clr-accent-text, #ffffff)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        Try Level {level} Again
                      </button>

                      <button
                        onClick={() => setViewMode('menu')}
                        style={{
                          padding: '12px 20px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: '1px solid var(--clr-border, #cbd5e1)',
                          background: 'var(--clr-surface, #f8fafc)',
                          color: 'var(--clr-text, #334155)',
                          cursor: 'pointer'
                        }}
                      >
                        All Levels
                      </button>
                    </div>
                  </div>
                ) : exerciseCompleted ? (
                  /* FINAL EXERCISE MASTERY COMPLETED (LEVEL 9) */
                  <div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--clr-text, #0f172a)', margin: '0 0 10px 0' }}>
                      You completed the exercise!
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft, #475569)', marginBottom: '24px' }}>
                      Congratulations! You've mastered translating passive sentences into operational order with <strong>{lastAccuracy}%</strong> accuracy!
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleRepeatLevel}
                        style={{
                          padding: '12px 24px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: 'none',
                          background: 'var(--clr-accent, #f97316)',
                          color: 'var(--clr-accent-text, #ffffff)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Retry Level 9
                      </button>

                      <button
                        onClick={() => setViewMode('menu')}
                        style={{
                          padding: '12px 28px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          border: '1px solid var(--clr-border, #cbd5e1)',
                          background: 'var(--clr-surface, #f8fafc)',
                          color: 'var(--clr-text, #334155)',
                          cursor: 'pointer'
                        }}
                      >
                        Choose Another Level
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PASSED LEVEL (≥50% ACCURACY OR LEVEL 0 TUTORIAL) */
                  <div>
                    {perfectBonusEarned && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--clr-card)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: '24px',
                        padding: '6px 20px',
                        marginBottom: '16px',
                        color: 'var(--clr-accent)',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0, 0, 0, 0.03))'
                      }}>
                        Perfect Run! +30 Points Earned!
                      </div>
                    )}

                    <h3 style={{ fontSize: '1.4rem', color: 'var(--clr-text)', margin: '0 0 10px 0', fontWeight: 800 }}>
                      {level === 0 ? 'Level 0 Complete!' : 'Level complete!'}
                    </h3>
                    <p style={{ fontSize: '0.98rem', color: 'var(--clr-text-soft)', marginBottom: '20px' }}>
                      {level === 0 ? 'You are ready for the next step.' : `Round Accuracy: ${lastAccuracy}%! You are ready for the next step.`}
                    </p>

                    {/* Lock Unlocking & Door Opening Animation Portal */}
                    <DoorUnlockPortal
                      nextLevel={level === 0 ? 1 : level + 1}
                      onAdvance={handleAdvanceNextLevel}
                      isLevel0={level === 0}
                    />

                    {/* Secondary Navigation Options */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleRepeatLevel}
                        style={{
                          padding: '11px 22px',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          border: '1px solid var(--clr-border)',
                          background: 'var(--clr-surface)',
                          color: 'var(--clr-text)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--clr-accent)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--clr-border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))';
                        }}
                      >
                        Retry Level {level}
                      </button>

                      <button
                        onClick={() => setViewMode('menu')}
                        style={{
                          padding: '11px 22px',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          border: '1px solid var(--clr-border)',
                          background: 'var(--clr-surface)',
                          color: 'var(--clr-text)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--clr-accent)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--clr-border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.03))';
                        }}
                      >
                        All Levels
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── ACTIVE QUESTION WORKSPACE ───────────────────────────────────────── */
              currentQuestion && (
                <div>
                  {/* Top Concept Review button for Level 0 */}
                  {level === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px' }}>
                      <button
                        onClick={() => setLevel0ConceptCompleted(false)}
                        style={{
                          background: 'var(--clr-surface)',
                          border: '1px solid var(--clr-border)',
                          color: 'var(--clr-accent)',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: 'var(--shadow-card, 0 2px 6px rgba(0,0,0,0.03))'
                        }}
                      >
                        ← Review 4 Concept Rules
                      </button>
                    </div>
                  )}



                  {/* Question / Sentence Display */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--clr-text-soft)' }}>
                        Sentence to Reorder:
                      </span>
                      {level === 0 && (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                          Put cards in step-by-step order
                        </span>
                      )}
                    </div>
                    <div style={{
                      padding: '18px 20px',
                      background: 'var(--clr-surface)',
                      borderRadius: '14px',
                      borderLeft: '5px solid var(--clr-accent)',
                      borderTop: '1px solid var(--clr-border)',
                      borderRight: '1px solid var(--clr-border)',
                      borderBottom: '1px solid var(--clr-border)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--clr-text)',
                      letterSpacing: '0.01em',
                      boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.04))'
                    }}>
                      {currentQuestion.question || currentQuestion.passiveText}
                    </div>
                  </div>

                  {/* Top Answer Line (Sentence Order Slots - UP) */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--clr-text-soft)' }}>
                        Your Answer Line (Step 1 ➔ Step 2):
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)' }}>
                        Tap cards to remove
                      </span>
                    </div>

                    {(() => {
                      const isError = feedbackMsg?.type === 'error';
                      const isSuccess = isCorrect || feedbackMsg?.type === 'success';

                      return (
                        <div
                          onDragOver={handleDragOver}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (isCorrect) return;
                            const dataRaw = e.dataTransfer.getData('text/plain');
                            if (!dataRaw) return;
                            const { cardText, fromSource, fromIdx } = JSON.parse(dataRaw);
                            const firstEmptyIdx = placedSlots.findIndex(s => s === null);
                            if (firstEmptyIdx !== -1) {
                              placeCardInSlot(cardText, fromSource, fromIdx, firstEmptyIdx);
                            }
                          }}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '10px',
                            minHeight: '74px',
                            padding: '16px 20px',
                            background: isError
                              ? 'var(--clr-wrong-bg)'
                              : isSuccess
                              ? 'var(--clr-correct-bg)'
                              : 'var(--clr-surface)',
                            border: isError
                              ? '2px solid var(--clr-wrong)'
                              : isSuccess
                              ? '2px solid var(--clr-correct)'
                              : '2px dashed var(--clr-border)',
                            borderRadius: '20px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {placedSlots.map((slotContent, slotIdx) => (
                            <div key={slotIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {slotContent ? (
                                <div
                                  onClick={() => handleSlotTap(slotIdx)}
                                  draggable={!isCorrect}
                                  onDragStart={(e) => handleDragStart(e, slotContent, 'slot', slotIdx)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    background: isError
                                      ? 'var(--clr-wrong-bg)'
                                      : isSuccess
                                      ? 'var(--clr-correct-bg)'
                                      : 'var(--clr-card)',
                                    border: isError
                                      ? '1.5px solid var(--clr-wrong)'
                                      : isSuccess
                                      ? '1.5px solid var(--clr-correct)'
                                      : '2px solid var(--clr-accent)',
                                    borderRadius: '24px',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    color: isError
                                      ? 'var(--clr-wrong)'
                                      : isSuccess
                                      ? 'var(--clr-text)'
                                      : 'var(--clr-text)',
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
                                    cursor: isCorrect ? 'default' : 'pointer',
                                    userSelect: 'none',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <span style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    color: isError ? 'var(--clr-wrong)' : isSuccess ? 'var(--clr-correct)' : 'var(--clr-accent)',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    background: 'var(--clr-surface)'
                                  }}>
                                    Step {slotIdx + 1}
                                  </span>
                                  <span>{slotContent}</span>
                                  {!isCorrect && <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '2px' }}>✕</span>}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 16px',
                                    borderRadius: '24px',
                                    border: '1.5px dashed var(--clr-border)',
                                    color: 'var(--clr-text-soft)',
                                    fontSize: '0.86rem',
                                    fontWeight: 600,
                                    background: 'rgba(0,0,0,0.02)',
                                    userSelect: 'none'
                                  }}
                                >
                                  Step {slotIdx + 1} (Empty)
                                </div>
                              )}

                              {/* Arrow between sequential slots */}
                              {slotIdx < placedSlots.length - 1 && (
                                <span style={{
                                  color: placedSlots[slotIdx] ? 'var(--clr-accent)' : 'var(--clr-border)',
                                  fontWeight: 800,
                                  fontSize: '1.1rem',
                                  transition: 'color 0.2s ease'
                                }}>
                                  ➔
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Horizontal Divider Line */}
                  <div style={{ borderBottom: '2px solid var(--clr-border)', marginBottom: '24px' }} />

                  {/* Word Options Bank (Options Chips - DOWN) */}
                  <div style={{ marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)', display: 'block', marginBottom: '10px' }}>
                      WORD OPTIONS BANK (DRAG OR TAP):
                    </span>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      minHeight: '60px',
                      padding: '16px',
                      background: 'var(--clr-surface)',
                      borderRadius: '20px',
                      border: '1px solid var(--clr-border)'
                    }}>
                      {(cardPoolOrder.length > 0 ? cardPoolOrder : (currentQuestion.options || currentQuestion.cards || [])).map((cardText, idx) => {
                        const isPlaced = placedSlots.includes(cardText);
                        if (isPlaced) {
                          // Render placeholder capsule bubble showing where word came from
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '10px 20px',
                                background: 'var(--clr-border)',
                                borderRadius: '24px',
                                minWidth: '80px',
                                height: '42px',
                                opacity: 0.4,
                                userSelect: 'none'
                              }}
                            />
                          );
                        }

                        const poolIdx = availableCards.indexOf(cardText);

                        return (
                          <div
                            key={idx}
                            draggable={!isCorrect}
                            onDragStart={(e) => handleDragStart(e, cardText, 'pool', poolIdx)}
                            onClick={() => handleCardPoolTap(cardText, poolIdx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 20px',
                              background: 'var(--clr-card)',
                              border: '2px solid var(--clr-border)',
                              borderRadius: '24px',
                              cursor: isCorrect ? 'default' : 'grab',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              color: 'var(--clr-text)',
                              boxShadow: 'var(--shadow-card, 0 3px 8px rgba(0,0,0,0.05))',
                              userSelect: 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ color: 'var(--clr-text-soft)', fontSize: '1.1rem' }}>⋮⋮</span>
                            <span>{cardText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hint Box (Unlocked after 3 incorrect attempts if toggled) */}
                  {showHint && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--clr-accent-soft)',
                      border: '1px solid var(--clr-accent)',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      color: 'var(--clr-text)',
                      marginBottom: '16px'
                    }}>
                      <strong>Hint:</strong> {currentQuestion.hint}
                    </div>
                  )}

                  {/* Feedback Banner */}
                  {feedbackMsg && (
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      marginBottom: '20px',
                      background: feedbackMsg.type === 'success'
                        ? 'var(--clr-correct-bg)'
                        : feedbackMsg.type === 'error'
                        ? 'var(--clr-wrong-bg)'
                        : 'var(--clr-surface)',
                      border: feedbackMsg.type === 'success'
                        ? '1px solid var(--clr-correct)'
                        : feedbackMsg.type === 'error'
                        ? '1px solid var(--clr-wrong)'
                        : '1px solid var(--clr-border)',
                      color: 'var(--clr-text)'
                    }}>
                      <div style={{
                        fontWeight: 700,
                        marginBottom: '4px',
                        fontSize: '1.05rem',
                        color: feedbackMsg.type === 'success' ? 'var(--clr-correct)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-text)'
                      }}>
                        {feedbackMsg.text}
                      </div>

                      {feedbackMsg.visualFlow && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 14px',
                          background: 'var(--clr-card)',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: 'var(--clr-accent)',
                          border: '1px solid var(--clr-border)'
                        }}>
                          {feedbackMsg.visualFlow}
                        </div>
                      )}

                      {feedbackMsg.algebraic && (
                        <div style={{ marginTop: '8px', fontSize: '0.92rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                          Algebraic Form: <span style={{ fontFamily: 'monospace' }}>{feedbackMsg.algebraic}</span>
                        </div>
                      )}

                      {feedbackMsg.explanation && (
                        <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--clr-text-soft)', lineHeight: 1.4 }}>
                          {feedbackMsg.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Control Buttons */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      {incorrectAttempts >= 3 && !isCorrect && (
                        <button
                          onClick={() => setShowHint(!showHint)}
                          style={{
                            padding: '8px 14px',
                            fontSize: '0.88rem',
                            borderRadius: '8px',
                            border: '1px solid var(--clr-border)',
                            background: 'transparent',
                            color: 'var(--clr-text-soft)',
                            cursor: 'pointer'
                          }}
                        >
                          {showHint ? 'Hide Hint' : 'Need a Hint?'}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {(placedSlots.some(s => s !== null) || feedbackMsg?.type === 'error') && !isCorrect && (
                        <button
                          onClick={handleRetryQuestion}
                          style={{
                            padding: '10px 18px',
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            borderRadius: '10px',
                            border: '1px solid var(--clr-border)',
                            background: 'var(--clr-surface)',
                            color: 'var(--clr-text)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Retry
                        </button>
                      )}

                      {!isCorrect ? (
                        <button
                          onClick={handleCheckAnswer}
                          style={{
                            padding: '10px 22px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            borderRadius: '10px',
                            border: 'none',
                            background: 'var(--clr-accent)',
                            color: 'var(--clr-accent-text, #ffffff)',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-btn, 0 4px 12px rgba(0, 0, 0, 0.15))',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Check Answer
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          style={{
                            padding: '10px 24px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            borderRadius: '10px',
                            border: 'none',
                            background: 'var(--clr-accent)',
                            color: 'var(--clr-accent-text, #ffffff)',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-btn, 0 4px 12px rgba(0, 0, 0, 0.15))',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {roundIndex < roundQuestions.length - 1 ? 'Next Question ➔' : 'Complete ➔'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

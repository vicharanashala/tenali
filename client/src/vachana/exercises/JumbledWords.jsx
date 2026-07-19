import React, { useState, useEffect } from 'react';
import { useMastery, loadMasteryProgress } from '../VachanaMastery';
import MasteryLevelHeader from '../MasteryLevelHeader';

// ─── Jumbled Words Question Bank ─────────────────────────────────────────────
// 8 levels with 10 questions each (80 total questions) for fine-grained ZPD progression.
const QUESTION_BANK = {
  '1': [ // Level 1: Match Order (2 blocks, already non-jumbled)
    { id: 'jumb_1_01', expression: 'x + 5', blocks: ['x', 'plus five'], answer: 'x plus five', explanation: '✅ "x + 5" translates directly in reading order: the variable "x" followed by "plus five".', hint: 'Select the variable first, then the addition.' },
    { id: 'jumb_1_02', expression: 'y - 4', blocks: ['y', 'minus four'], answer: 'y minus four', explanation: '✅ "y - 4" translates directly in reading order: the variable "y" followed by "minus four".', hint: 'Select y first, then the subtraction.' },
    { id: 'jumb_1_03', expression: '3z', blocks: ['three times', 'z'], answer: 'three times z', explanation: '✅ Multiplication is expressed by stating the multiplier before the variable: "three times z".', hint: 'Select the multiplier first, then the variable.' },
    { id: 'jumb_1_04', expression: 'a / 2', blocks: ['a', 'divided by two'], answer: 'a divided by two', explanation: '✅ Division is written in chronological order: the numerator "a" followed by "divided by two".', hint: 'Read the fraction from top to bottom.' },
    { id: 'jumb_1_05', expression: 'm + 8', blocks: ['m', 'plus eight'], answer: 'm plus eight', explanation: '✅ Simple addition is translated as "m plus eight".', hint: 'Use the simplest word for addition.' },
    { id: 'jumb_1_06', expression: 'p / 3', blocks: ['p', 'divided by three'], answer: 'p divided by three', explanation: '✅ Division is written in chronological order: "p divided by three".', hint: 'Translate from top to bottom.' },
    { id: 'jumb_1_07', expression: 'c - 9', blocks: ['c', 'minus nine'], answer: 'c minus nine', explanation: '✅ Subtraction is written in chronological order: "c minus nine".', hint: 'Select c first, then the subtraction.' },
    { id: 'jumb_1_08', expression: '4x', blocks: ['four times', 'x'], answer: 'four times x', explanation: '✅ "4x" represents multiplying a variable by a constant: "four times x".', hint: 'Select the multiplier first, then the variable.' },
    { id: 'jumb_1_09', expression: 'b + 10', blocks: ['b', 'plus ten'], answer: 'b plus ten', explanation: '✅ Simple addition is translated as "b plus ten".', hint: 'Select b first, then the addition.' },
    { id: 'jumb_1_10', expression: 'k / 5', blocks: ['k', 'divided by five'], answer: 'k divided by five', explanation: '✅ Division is written in chronological order: "k divided by five".', hint: 'Translate from top to bottom.' }
  ],
  '2': [ // Level 2: Shuffled Pairs (2 blocks, jumbled)
    { id: 'jumb_2_01', expression: 'x + 3', blocks: ['plus three', 'x'], answer: 'x plus three', explanation: '✅ "x + 3" means we start with x and add three.', hint: 'Reorder the blocks: variable first, then the addition.' },
    { id: 'jumb_2_02', expression: 'y - 6', blocks: ['minus six', 'y'], answer: 'y minus six', explanation: '✅ "y - 6" translates directly as "y minus six".', hint: 'Reorder the blocks: starting variable first, then the subtraction.' },
    { id: 'jumb_2_03', expression: '2z', blocks: ['z', 'twice'], answer: 'twice z', explanation: '✅ "2z" represents two times z, which is verbally stated as "twice z".', hint: 'Place the multiplier term ("twice") before the variable.' },
    { id: 'jumb_2_04', expression: 'a / 4', blocks: ['divided by four', 'a'], answer: 'a divided by four', explanation: '✅ Division is written in chronological order: "a divided by four".', hint: 'Place the numerator first.' },
    { id: 'jumb_2_05', expression: 'm + 7', blocks: ['plus seven', 'm'], answer: 'm plus seven', explanation: '✅ Simple addition is translated as "m plus seven".', hint: 'Place the variable first, then the addition.' },
    { id: 'jumb_2_06', expression: 'p - 2', blocks: ['minus two', 'p'], answer: 'p minus two', explanation: '✅ "p - 2" translates as "p minus two".', hint: 'Place the starting variable first.' },
    { id: 'jumb_2_07', expression: '5c', blocks: ['c', 'five times'], answer: 'five times c', explanation: '✅ "5c" is five times c.', hint: 'Place the multiplier first.' },
    { id: 'jumb_2_08', expression: 'k / 8', blocks: ['divided by eight', 'k'], answer: 'k divided by eight', explanation: '✅ "k / 8" means k divided by eight.', hint: 'Place the numerator first.' },
    { id: 'jumb_2_09', expression: 'n + 12', blocks: ['plus twelve', 'n'], answer: 'n plus twelve', explanation: '✅ "n + 12" is translated as n plus twelve.', hint: 'Place the variable first.' },
    { id: 'jumb_2_10', expression: 'b - 1', blocks: ['minus one', 'b'], answer: 'b minus one', explanation: '✅ "b - 1" is translated as b minus one.', hint: 'Place the starting variable first.' }
  ],
  '3': [ // Level 3: Direct matching (3 blocks, 2 misplaced)
    { id: 'jumb_3_01', expression: 'x + 2', blocks: ['x', 'plus', 'two'], answer: 'x plus two', explanation: '✅ "x + 2" translates in order: "x plus two".', hint: 'Reorder so the variable is first, plus in the middle.' },
    { id: 'jumb_3_02', expression: 'y - 5', blocks: ['y', 'minus', 'five'], answer: 'y minus five', explanation: '✅ "y - 5" translates in order: "y minus five".', hint: 'Reorder so the variable is first, minus in the middle.' },
    { id: 'jumb_3_03', expression: '3a', blocks: ['three', 'times', 'a'], answer: 'three times a', explanation: '✅ "3a" translates in order: "three times a".', hint: 'Reorder so the multiplier is first, times in the middle.' },
    { id: 'jumb_3_04', expression: 'b / 3', blocks: ['b', 'divided by', 'three'], answer: 'b divided by three', explanation: '✅ "b / 3" translates in order: "b divided by three".', hint: 'Reorder so the numerator is first.' },
    { id: 'jumb_3_05', expression: 'm + 6', blocks: ['m', 'plus', 'six'], answer: 'm plus six', explanation: '✅ "m + 6" translates in order: "m plus six".', hint: 'Reorder so the variable is first.' },
    { id: 'jumb_3_06', expression: 'p - 8', blocks: ['p', 'minus', 'eight'], answer: 'p minus eight', explanation: '✅ "p - 8" translates in order: "p minus eight".', hint: 'Reorder so the variable is first.' },
    { id: 'jumb_3_07', expression: '4z', blocks: ['four', 'times', 'z'], answer: 'four times z', explanation: '✅ "4z" translates in order: "four times z".', hint: 'Reorder so the multiplier is first.' },
    { id: 'jumb_3_08', expression: 'c / 6', blocks: ['c', 'divided by', 'six'], answer: 'c divided by six', explanation: '✅ "c / 6" translates in order: "c divided by six".', hint: 'Reorder so the numerator is first.' },
    { id: 'jumb_3_09', expression: 'k + 1', blocks: ['k', 'plus', 'one'], answer: 'k plus one', explanation: '✅ "k + 1" translates in order: "k plus one".', hint: 'Reorder so the variable is first.' },
    { id: 'jumb_3_10', expression: 'n - 10', blocks: ['n', 'minus', 'ten'], answer: 'n minus ten', explanation: '✅ "n - 10" translates in order: "n minus ten".', hint: 'Reorder so the variable is first.' }
  ],
  '4': [ // Level 4: Shuffled Triplets (3 blocks, fully jumbled)
    { id: 'jumb_4_01', expression: 'x + 4', blocks: ['x', 'increased by', 'four'], answer: 'x increased by four', explanation: '✅ "x + 4" translates to "x increased by four".', hint: 'Variable first, then the addition verb.' },
    { id: 'jumb_4_02', expression: 'y - 3', blocks: ['y', 'decreased by', 'three'], answer: 'y decreased by three', explanation: '✅ "y - 3" translates to "y decreased by three".', hint: 'Variable first, then the subtraction verb.' },
    { id: 'jumb_4_03', expression: '5z', blocks: ['five', 'times', 'z'], answer: 'five times z', explanation: '✅ "5z" translates to "five times z".', hint: 'Multiplier first, times in the middle.' },
    { id: 'jumb_4_04', expression: 'a / 7', blocks: ['a', 'divided by', 'seven'], answer: 'a divided by seven', explanation: '✅ "a / 7" translates to "a divided by seven".', hint: 'Numerator first, divided by in the middle.' },
    { id: 'jumb_4_05', expression: 'm + 9', blocks: ['m', 'increased by', 'nine'], answer: 'm increased by nine', explanation: '✅ "m + 9" translates to "m increased by nine".', hint: 'Variable first, then the addition verb.' },
    { id: 'jumb_4_06', expression: 'p - 11', blocks: ['p', 'decreased by', 'eleven'], answer: 'p decreased by eleven', explanation: '✅ "p - 11" translates to "p decreased by eleven".', hint: 'Variable first, then the subtraction verb.' },
    { id: 'jumb_4_07', expression: '6b', blocks: ['six', 'times', 'b'], answer: 'six times b', explanation: '✅ "6b" translates to "six times b".', hint: 'Multiplier first.' },
    { id: 'jumb_4_08', expression: 'c / 10', blocks: ['c', 'divided by', 'ten'], answer: 'c divided by ten', explanation: '✅ "c / 10" translates to "c divided by ten".', hint: 'Numerator first.' },
    { id: 'jumb_4_09', expression: 'k + 15', blocks: ['k', 'increased by', 'fifteen'], answer: 'k increased by fifteen', explanation: '✅ "k + 15" translates to "k increased by fifteen".', hint: 'Variable first.' },
    { id: 'jumb_4_10', expression: 'n - 20', blocks: ['n', 'decreased by', 'twenty'], answer: 'n decreased by twenty', explanation: '✅ "n - 20" translates to "n decreased by twenty".', hint: 'Variable first.' }
  ],
  '5': [ // Level 5: Two-Step Direct (4 blocks, shuffled)
    { id: 'jumb_5_01', expression: '2x + 5', blocks: ['twice', 'x', 'plus', 'five'], answer: 'twice x plus five', explanation: '✅ "2x + 5" translates chronologically: the multiplication of x by 2, plus 5.', hint: 'Start with the multiplication ("twice x") and then add the constant.' },
    { id: 'jumb_5_02', expression: '3y - 4', blocks: ['three', 'times y', 'minus', 'four'], answer: 'three times y minus four', explanation: '✅ "3y - 4" translates chronologically: "three times y" followed by "minus four".', hint: 'Translate step-by-step from left to right.' },
    { id: 'jumb_5_03', expression: 'a / 2 + 1', blocks: ['a', 'divided by two', 'plus', 'one'], answer: 'a divided by two plus one', explanation: '✅ "a/2 + 1" translates chronologically: "a divided by two" plus "one".', hint: 'Translate the fraction first, then the addition.' },
    { id: 'jumb_5_04', expression: '4z + 3', blocks: ['four', 'times z', 'plus', 'three'], answer: 'four times z plus three', explanation: '✅ "4z + 3" translates as "four times z plus three".', hint: 'Translate chronologically from left to right.' },
    { id: 'jumb_5_05', expression: '5m - 2', blocks: ['five', 'times m', 'minus', 'two'], answer: 'five times m minus two', explanation: '✅ "5m - 2" translates as "five times m minus two".', hint: 'Translate the multiplication first.' },
    { id: 'jumb_5_06', expression: 'p / 3 + 6', blocks: ['p', 'divided by three', 'plus', 'six'], answer: 'p divided by three plus six', explanation: '✅ "p/3 + 6" translates as "p divided by three plus six".', hint: 'Translate the fraction first.' },
    { id: 'jumb_5_07', expression: '7c - 1', blocks: ['seven', 'times c', 'minus', 'one'], answer: 'seven times c minus one', explanation: '✅ "7c - 1" translates as "seven times c minus one".', hint: 'Translate the multiplication first.' },
    { id: 'jumb_5_08', expression: '2k + 10', blocks: ['twice', 'k', 'plus', 'ten'], answer: 'twice k plus ten', explanation: '✅ "2k + 10" translates as "twice k plus ten".', hint: 'Translate the multiplication first.' },
    { id: 'jumb_5_09', expression: '8n + 7', blocks: ['eight', 'times n', 'plus', 'seven'], answer: 'eight times n plus seven', explanation: '✅ "8n + 7" translates as "eight times n plus seven".', hint: 'Translate chronologically.' },
    { id: 'jumb_5_10', expression: 'b / 5 - 9', blocks: ['b', 'divided by five', 'minus', 'nine'], answer: 'b divided by five minus nine', explanation: '✅ "b/5 - 9" translates as "b divided by five minus nine".', hint: 'Translate the fraction first.' }
  ],
  '6': [ // Level 6: Subtraction Inversion (3 blocks, shuffled)
    { id: 'jumb_6_01', expression: 'x - 7', blocks: ['seven', 'less than', 'x'], answer: 'seven less than x', explanation: '✅ "seven less than x" means we start with x and subtract 7 (x - 7). This is an inversion error trap!', hint: 'The phrase "less than" reverses the order of terms. Write the subtracted number first.' },
    { id: 'jumb_6_02', expression: 'y - 10', blocks: ['ten', 'subtracted from', 'y'], answer: 'ten subtracted from y', explanation: '✅ "ten subtracted from y" means we start with y and subtract 10. This is an inversion error trap!', hint: 'The phrase "subtracted from" reverses the order of terms. Write the subtracted number first.' },
    { id: 'jumb_6_03', expression: 'p - 4', blocks: ['four', 'fewer than', 'p'], answer: 'four fewer than p', explanation: '✅ "four fewer than p" means we start with p and subtract 4 (p - 4).', hint: 'The phrase "fewer than" reverses the order of terms. Write the subtracted number first.' },
    { id: 'jumb_6_04', expression: 'z - 12', blocks: ['twelve', 'less than', 'z'], answer: 'twelve less than z', explanation: '✅ "twelve less than z" means we start with z and subtract 12.', hint: 'Use the inversion phrase "less than" to reverse the order.' },
    { id: 'jumb_6_05', expression: 'm - 9', blocks: ['nine', 'subtracted from', 'm'], answer: 'nine subtracted from m', explanation: '✅ "nine subtracted from m" means we start with m and subtract 9.', hint: 'Use the inversion phrase "subtracted from" to reverse the order.' },
    { id: 'jumb_6_06', expression: 'a - 15', blocks: ['fifteen', 'fewer than', 'a'], answer: 'fifteen fewer than a', explanation: '✅ "fifteen fewer than a" means we start with a and subtract 15.', hint: 'Use the inversion phrase "fewer than" to reverse the order.' },
    { id: 'jumb_6_07', expression: 'k - 3', blocks: ['three', 'less than', 'k'], answer: 'three less than k', explanation: '✅ "three less than k" means k - 3.', hint: 'Use the inversion phrase "less than".' },
    { id: 'jumb_6_08', expression: 'b - 8', blocks: ['eight', 'subtracted from', 'b'], answer: 'eight subtracted from b', explanation: '✅ "eight subtracted from b" means b - 8.', hint: 'Use the inversion phrase "subtracted from".' },
    { id: 'jumb_6_09', expression: 'c - 1', blocks: ['one', 'fewer than', 'c'], answer: 'one fewer than c', explanation: '✅ "one fewer than c" means c - 1.', hint: 'Use the inversion phrase "fewer than".' },
    { id: 'jumb_6_10', expression: 'n - 30', blocks: ['thirty', 'less than', 'n'], answer: 'thirty less than n', explanation: '✅ "thirty less than n" means n - 30.', hint: 'Use the inversion phrase "less than".' }
  ],
  '7': [ // Level 7: Subtraction Inversion (4 blocks, jumbled)
    { id: 'jumb_7_01', expression: '3b - 2', blocks: ['two', 'less than', 'three times', 'b'], answer: 'two less than three times b', explanation: '✅ "two less than three times b" inverts the subtraction: three times b is evaluated first, then 2 is subtracted.', hint: 'Combine the multiplication (3b) and subtraction (minus 2) with the inversion phrase "less than".' },
    { id: 'jumb_7_02', expression: '2y - 5', blocks: ['five', 'subtracted from', 'twice', 'y'], answer: 'five subtracted from twice y', explanation: '✅ "five subtracted from twice y" inverts the subtraction: twice y is evaluated first, then 5 is subtracted.', hint: 'Combine the multiplication (2y) and subtraction (minus 5) with the inversion phrase "subtracted from".' },
    { id: 'jumb_7_03', expression: '5x - 4', blocks: ['four', 'fewer than', 'five times', 'x'], answer: 'four fewer than five times x', explanation: '✅ "four fewer than five times x" inverts the subtraction: five times x is evaluated first, then 4 is subtracted.', hint: 'Combine the multiplication (5x) and subtraction (minus 4) with the inversion phrase "fewer than".' },
    { id: 'jumb_7_04', expression: '4p - 9', blocks: ['nine', 'less than', 'four times', 'p'], answer: 'nine less than four times p', explanation: '✅ "nine less than four times p" inverts the subtraction: four times p is evaluated first, then 9 is subtracted.', hint: 'Use the inversion phrase "less than" at the end of the terms.' },
    { id: 'jumb_7_05', expression: '6a - 1', blocks: ['one', 'subtracted from', 'six times', 'a'], answer: 'one subtracted from six times a', explanation: '✅ "one subtracted from six times a" inverts the subtraction: six times a is evaluated first, then 1 is subtracted.', hint: 'Use the inversion phrase "subtracted from" at the end of the terms.' },
    { id: 'jumb_7_06', expression: '3m - 8', blocks: ['eight', 'fewer than', 'three times', 'm'], answer: 'eight fewer than three times m', explanation: '✅ "eight fewer than three times m" inverts the subtraction: three times m is evaluated first, then 8 is subtracted.', hint: 'Use the inversion phrase "fewer than" at the end of the terms.' },
    { id: 'jumb_7_07', expression: '2z - 11', blocks: ['eleven', 'less than', 'twice', 'z'], answer: 'eleven less than twice z', explanation: '✅ "eleven less than twice z" inverts the subtraction: twice z is evaluated first, then 11 is subtracted.', hint: 'Use the inversion phrase "less than".' },
    { id: 'jumb_7_08', expression: '7k - 3', blocks: ['three', 'subtracted from', 'seven times', 'k'], answer: 'three subtracted from seven times k', explanation: '✅ "three subtracted from seven times k" inverts the subtraction: seven times k is evaluated first, then 3 is subtracted.', hint: 'Use the inversion phrase "subtracted from".' },
    { id: 'jumb_7_09', expression: '5n - 12', blocks: ['twelve', 'fewer than', 'five times', 'n'], answer: 'twelve fewer than five times n', explanation: '✅ "twelve fewer than five times n" inverts the subtraction: five times n is evaluated first, then 12 is subtracted.', hint: 'Use the inversion phrase "fewer than".' },
    { id: 'jumb_7_10', expression: '4c - 6', blocks: ['six', 'less than', 'four times', 'c'], answer: 'six less than four times c', explanation: '✅ "six less than four times c" inverts the subtraction: four times c is evaluated first, then 6 is subtracted.', hint: 'Use the inversion phrase "less than".' }
  ],
  '8': [ // Level 8: Parentheses & Grouping (4-5 blocks, jumbled)
    { id: 'jumb_8_01', expression: '3(y + 4)', blocks: ['three times', 'the sum of', 'y', 'and four'], answer: 'three times the sum of y and four', explanation: '✅ "3(y + 4)" requires parentheses. We express this by stating "three times" followed by "the sum of" to group y and 4.', hint: 'Use "the sum of" to indicate that the addition should happen inside parentheses before multiplying.' },
    { id: 'jumb_8_02', expression: '2(x - 5)', blocks: ['twice', 'the difference of', 'x', 'and five'], answer: 'twice the difference of x and five', explanation: '✅ "2(x - 5)" uses "twice" followed by "the difference of" to show that subtraction happens first inside parentheses.', hint: '"The difference of" grouping indicates parentheses around the subtraction.' },
    { id: 'jumb_8_03', expression: '(a + 8) / 2', blocks: ['half of', 'the sum of', 'a', 'and eight'], answer: 'half of the sum of a and eight', explanation: '✅ "(a + 8) / 2" is represented by taking "half of" the grouped expression "the sum of a and eight".', hint: 'The division by 2 applies to the entire addition, so we state "half of" before "the sum".' },
    { id: 'jumb_8_04', expression: '5(2x - 3)', blocks: ['five times', 'the quantity', 'three less than', 'twice x'], answer: 'five times the quantity three less than twice x', explanation: '✅ "5(2x - 3)" uses "the quantity" to set off parentheses, enclosing the inverted subtraction "three less than twice x".', hint: 'Use "the quantity" to group the terms inside the parentheses.' },
    { id: 'jumb_8_05', expression: '(3n - 1) / 4', blocks: ['one-fourth of', 'the quantity', 'one less than', 'three times n'], answer: 'one-fourth of the quantity one less than three times n', explanation: '✅ The division by 4 applies to the entire numerator. We write "one-fourth of" followed by "the quantity" for parentheses.', hint: 'Start with the division multiplier ("one-fourth of") and use "the quantity" to group the numerator terms.' },
    { id: 'jumb_8_06', expression: '4(x + 3)', blocks: ['four times', 'the sum of', 'x', 'and three'], answer: 'four times the sum of x and three', explanation: '✅ "4(x + 3)" groups the addition in parentheses. We write "four times" followed by "the sum of".', hint: 'Group the addition using "the sum of" inside parentheses.' },
    { id: 'jumb_8_07', expression: '(y - 2) / 5', blocks: ['one-fifth of', 'the difference of', 'y', 'and two'], answer: 'one-fifth of the difference of y and two', explanation: '✅ The division by 5 covers the entire subtraction. We write "one-fifth of" followed by "the difference of".', hint: 'Start with the division fractional multiplier and use "the difference of" to group the subtraction.' },
    { id: 'jumb_8_08', expression: '3(2a + 1)', blocks: ['three times', 'the quantity', 'twice a', 'plus one'], answer: 'three times the quantity twice a plus one', explanation: '✅ "3(2a + 1)" uses "the quantity" to open parentheses enclosing the two-step expression "twice a plus one".', hint: 'Use "the quantity" to show parentheses around the terms inside.' },
    { id: 'jumb_8_09', expression: '6(p - 7)', blocks: ['six times', 'the difference of', 'p', 'and seven'], answer: 'six times the difference of p and seven', explanation: '✅ "6(p - 7)" uses "six times" followed by "the difference of" to show subtraction inside parentheses.', hint: 'Use "the difference of" grouping to open parentheses around the subtraction.' },
    { id: 'jumb_8_10', expression: '(m + 10) / 3', blocks: ['one-third of', 'the sum of', 'm', 'and ten'], answer: 'one-third of the sum of m and ten', explanation: '✅ "(m + 10) / 3" is one-third of the sum of m and ten.', hint: 'Start with the division multiplier "one-third of" and group the addition.' }
  ]
};

// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper to shuffle with a specific number of misplaced elements (ZPD Difficulty Control)
const shuffleWithMisplacedCount = (arr, targetMisplaced) => {
  let shuffled = [...arr];
  let attempts = 0;
  while (attempts < 50) {
    shuffled = shuffleArray(arr);
    let misplaced = 0;
    for (let i = 0; i < arr.length; i++) {
      if (shuffled[i] !== arr[i]) misplaced++;
    }
    if (misplaced === targetMisplaced) return shuffled;
    attempts++;
  }
  return shuffled; // fallback
};

const getMotivationalMessage = (level) => {
  const messages = {
    1: "Incredible start! You've mastered matching expressions chronologically. Your path to math literacy has officially begun! 🚀",
    2: "Awesome! Shuffled variables didn't slow you down one bit. Keep up the high energy! ⚡",
    3: "Fantastic job! Balancing three-part expressions is tricky, but you handled it like a pro. 💪",
    4: "Superb! Fully jumbled triplets are no match for your decoding skills. Let's keep this momentum! 🎓",
    5: "Wonderful work! You just conquered multi-step operations like a champion. Your logic is solid! 🌟",
    6: "Brilliant! You spotted the subtraction inversion trap perfectly. That's a huge milestone! 🧠",
    7: "Outstanding translation! Combining coefficients with inversion traps is advanced math, and you nailed it! 🏆",
    8: "Ultimate Mastery! You have conquered the complex parenthetical grouping sentences. You are a true Mathematical Literacy Wizard! 🧙‍♂️✨"
  };
  return messages[level] || "Great job mastering this level! Let's continue the journey.";
};

export default function JumbledWords() {
  const jumbledMastery = useMastery('jumbled', 8);

  // View state: 'dashboard' (Level Select) or 'play' (Interactive Exercise)
  const [viewMode, setViewMode] = useState('dashboard');
  const [playingLevel, setPlayingLevel] = useState(() => {
    const progress = loadMasteryProgress();
    return progress['jumbled']?.currentLevel || 1;
  });

  // Play session states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledPool, setShuffledPool] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [msg, setMsg] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [solveCountdown, setSolveCountdown] = useState(0);

  // Track correctly answered question IDs at the current level to avoid repeating them
  const [correctlyAnsweredIds, setCorrectlyAnsweredIds] = useState([]);
  const [levelCompletionData, setLevelCompletionData] = useState(null);
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    if (solveCountdown <= 0) return;
    const timer = setTimeout(() => {
      setSolveCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [solveCountdown]);

  // Select a question avoiding repetitions of correctly answered questions
  const selectQuestionNoRepeat = (level, lastId, activeCorrectList = correctlyAnsweredIds) => {
    const levelKey = String(level);
    const questions = QUESTION_BANK[levelKey];
    if (!questions || questions.length === 0) return null;

    // If activeCorrectList is empty, start with the first question of that level
    if (activeCorrectList.length === 0) {
      return questions[0];
    }

    // Filter out questions that have been correctly answered
    let candidates = questions.filter(q => !activeCorrectList.includes(q.id));

    // If all questions at this level have been correctly answered, reset
    if (candidates.length === 0) {
      setCorrectlyAnsweredIds([]);
      candidates = questions;
    }

    // Filter out the last question specifically if we have multiple choices left
    if (lastId && candidates.length > 1) {
      candidates = candidates.filter(q => q.id !== lastId);
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // Initialize or load next question
  const loadQuestion = (level, customCorrectList = correctlyAnsweredIds) => {
    const nextQ = selectQuestionNoRepeat(level, currentQuestion?.id || null, customCorrectList);
    setCurrentQuestion(nextQ);
    if (nextQ) {
      let shuffled = [];
      if (level === 1) {
        // Level 1: 2 blocks, already non-jumbled (chronological matching order)
        shuffled = [...nextQ.blocks];
      } else if (level === 2) {
        // Level 2: 2 blocks, misplaced
        shuffled = shuffleWithMisplacedCount(nextQ.blocks, 2);
      } else if (level === 3) {
        // Level 3: 3 blocks, 2 misplaced
        shuffled = shuffleWithMisplacedCount(nextQ.blocks, 2);
      } else if (level === 4) {
        // Level 4: 3 blocks, all 3 misplaced
        shuffled = shuffleWithMisplacedCount(nextQ.blocks, 3);
      } else {
        // Level 5+: standard shuffle with duplicate checking
        shuffled = shuffleArray(nextQ.blocks);
        let attempts = 0;
        const correctAns = nextQ.answer;
        while (shuffled.join(' ').toLowerCase() === correctAns.toLowerCase() && attempts < 10) {
          shuffled = shuffleArray(nextQ.blocks);
          attempts++;
        }
      }
      setShuffledPool(shuffled);
    }
    setSelectedIndices([]);
    setMsg('');
    setShowHint(false);
    setIsSolved(false);
    setHasAttempted(false);
    setSolveCountdown(0);
    setHasValidated(false);
  };

  const handleTileClick = (index) => {
    if (isSolved) return;
    if (selectedIndices.includes(index)) {
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      setSelectedIndices(prev => [...prev, index]);
    }
    setMsg('');
    setHasValidated(false);
  };

  const handleActiveTileClick = (pos) => {
    if (isSolved) return;
    setSelectedIndices(prev => prev.filter((_, idx) => idx !== pos));
    setMsg('');
    setHasValidated(false);
  };

  const shiftActiveTile = (pos, direction) => {
    if (isSolved) return;
    const newPos = pos + direction;
    if (newPos < 0 || newPos >= selectedIndices.length) return;

    setSelectedIndices(prev => {
      const copy = [...prev];
      const temp = copy[pos];
      copy[pos] = copy[newPos];
      copy[newPos] = temp;
      return copy;
    });
    setMsg('');
    setHasValidated(false);
  };

  const clearSelection = () => {
    if (isSolved) return;
    setSelectedIndices([]);
    setMsg('');
    setHasValidated(false);
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;
    if (selectedIndices.length === 0) {
      setMsg('⚠️ Please place some word blocks to construct the phrase first.');
      return;
    }

    const assembledPhrase = selectedIndices.map(i => shuffledPool[i]).join(' ');
    const isCorrect = assembledPhrase.toLowerCase() === currentQuestion.answer.toLowerCase();

    setHasAttempted(true);
    setHasValidated(true);

    if (isCorrect) {
      setMsg(currentQuestion.explanation);
      jumbledMastery.handleAnswer(true);
      const updatedCorrectList = [...correctlyAnsweredIds, currentQuestion.id];
      setCorrectlyAnsweredIds(updatedCorrectList);

      setTimeout(() => {
        const updatedProgress = loadMasteryProgress();
        const nextLevel = updatedProgress['jumbled']?.currentLevel || jumbledMastery.state.currentLevel;
        
        if (nextLevel > playingLevel) {
          // Finished the level! Show appreciation and motivation popup
          setLevelCompletionData({ level: playingLevel, nextLevel });
        } else {
          loadQuestion(playingLevel, updatedCorrectList);
        }
      }, 2500);
    } else {
      let errorHelp = '';
      if (currentQuestion.expression.includes('-')) {
        const lowerPhrase = assembledPhrase.toLowerCase();
        if (lowerPhrase.startsWith(currentQuestion.expression[0].toLowerCase() + ' less than') || 
            lowerPhrase.startsWith(currentQuestion.expression[0].toLowerCase() + ' subtracted from')) {
          errorHelp = ' 💡 Watch out! In English, phrases like "A less than B" or "A subtracted from B" mean B − A, not A − B. The subtracted amount must come first in the sentence.';
        }
      }
      setMsg(`❌ Incorrect phrasing order.${errorHelp} Try again or click 'Solve' to see the correct structure.`);
      jumbledMastery.handleAnswer(false);
    }
  };

  const solveQuestion = () => {
    if (!currentQuestion) return;
    setIsSolved(true);
    setSolveCountdown(3);
    const correctBlocks = currentQuestion.blocks;
    const newIndices = [];
    
    // Assemble indices matches
    correctBlocks.forEach(block => {
      const idx = shuffledPool.indexOf(block);
      if (idx !== -1 && !newIndices.includes(idx)) {
        newIndices.push(idx);
      }
    });
    setSelectedIndices(newIndices);
    setMsg(currentQuestion.explanation);
    jumbledMastery.handleAnswer(false);
  };

  const handleNext = () => {
    const nextLevel = loadMasteryProgress()['jumbled']?.currentLevel || jumbledMastery.state.currentLevel;
    loadQuestion(nextLevel);
  };

  const handleReset = () => {
    jumbledMastery.resetExercise();
    setCorrectlyAnsweredIds([]);
    setHasAttempted(false);
    setSolveCountdown(0);
    setPlayingLevel(1);
    setViewMode('dashboard');
  };

  const handleStartLevel = (level) => {
    setPlayingLevel(level);
    setViewMode('play');
    setCorrectlyAnsweredIds([]);
    // Load question for that level
    const questions = QUESTION_BANK[String(level)];
    const question = questions && questions.length > 0 ? questions[0] : null;
    setCurrentQuestion(question);
    if (question) {
      let shuffled = [];
      if (level === 1) {
        shuffled = [...question.blocks];
      } else if (level === 2) {
        shuffled = shuffleWithMisplacedCount(question.blocks, 2);
      } else if (level === 3) {
        shuffled = shuffleWithMisplacedCount(question.blocks, 2);
      } else if (level === 4) {
        shuffled = shuffleWithMisplacedCount(question.blocks, 3);
      } else {
        shuffled = shuffleArray(question.blocks);
        let attempts = 0;
        const correctAns = question.answer;
        while (shuffled.join(' ').toLowerCase() === correctAns.toLowerCase() && attempts < 10) {
          shuffled = shuffleArray(question.blocks);
          attempts++;
        }
      }
      setShuffledPool(shuffled);
    }
    setSelectedIndices([]);
    setMsg('');
    setShowHint(false);
    setIsSolved(false);
    setHasAttempted(false);
    setSolveCountdown(0);
    setHasValidated(false);
  };

  // Render Level Select Dashboard
  if (viewMode === 'dashboard') {
    const currentMaxLevel = jumbledMastery.state.currentLevel;
    const totalMastered = Object.keys(QUESTION_BANK).filter(lvl => {
      const lNum = Number(lvl);
      return lNum < currentMaxLevel || (lNum === 8 && jumbledMastery.state.mastered);
    }).length;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
        color: 'var(--clr-text, #ffffff)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: 'var(--clr-card, #1c1c1e)',
          border: '1px solid var(--clr-border, #2c2c2e)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--clr-accent, #6cceff)' }}>
                🧩 Jumbled Words
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft, #a1a1a6)' }}>
                Progress: {totalMastered} / 8 Levels Mastered
              </p>
            </div>
            <button
              onClick={handleReset}
              style={{
                background: '#d93f3f', border: 'none', color: '#ffffff',
                cursor: 'pointer', padding: '6px 14px', borderRadius: '8px',
                fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b82e2e'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#d93f3f'; }}
            >
              Reset Progress
            </button>
          </div>

          <MasteryLevelHeader
            state={jumbledMastery.state}
            maxLevel={8}
            toastMsg={jumbledMastery.toastMsg}
            onClearToast={jumbledMastery.clearToast}
          />

          {/* Level List Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
            marginTop: '8px'
          }}>
            {Object.keys(QUESTION_BANK).map(lvlStr => {
              const lvl = Number(lvlStr);
              const isLocked = false; // All levels unlocked
              const isMastered = lvl < currentMaxLevel || (lvl === 8 && jumbledMastery.state.mastered);
              const isActive = lvl === currentMaxLevel;

              let statusText = '';
              let badgeBg = 'transparent';
              let badgeColor = 'transparent';
              let borderStyle = '1px solid var(--clr-border, #2c2c2e)';
              let cardBg = 'rgba(255, 255, 255, 0.02)';

              if (isMastered) {
                statusText = 'Mastered ✅';
                badgeBg = 'rgba(46, 160, 67, 0.15)';
                badgeColor = '#2ea043';
                cardBg = 'rgba(46, 160, 67, 0.02)';
              } else if (isActive) {
                statusText = 'Active 🎮';
                badgeBg = 'rgba(108, 206, 255, 0.15)';
                badgeColor = 'var(--clr-accent, #6cceff)';
                borderStyle = '1px solid var(--clr-accent, #6cceff)';
                cardBg = 'rgba(108, 206, 255, 0.02)';
              }

              const levelDescriptions = {
                1: 'Direct Order (2 blocks, non-jumbled)',
                2: 'Shuffled Pairs (2 blocks, jumbled)',
                3: 'Direct matching (3 blocks, 2 misplaced)',
                4: 'Shuffled Triplets (3 blocks, fully jumbled)',
                5: 'Two-Step Direct (4 blocks, jumbled)',
                6: 'Subtraction Inversion (3 blocks, jumbled)',
                7: 'Subtraction Inversion (4 blocks, jumbled)',
                8: 'Parentheses & Grouping (4-5 blocks, jumbled)'
              };

              return (
                <div
                  key={lvl}
                  onClick={() => !isLocked && handleStartLevel(lvl)}
                  style={{
                    background: cardBg,
                    border: borderStyle,
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.4 : 1,
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; } }}
                  onMouseLeave={e => { if (!isLocked) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Level {lvl}</span>
                    {statusText && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: badgeBg,
                        color: badgeColor
                      }}>
                        {statusText}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft, #a1a1a6)', lineHeight: 1.4 }}>
                    {levelDescriptions[lvl]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render Play Workspace
  if (!currentQuestion) return <div style={{ color: 'var(--clr-text-soft)' }}>Loading...</div>;

  const isValidateDisabled = selectedIndices.length === 0 || hasValidated;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '75vh',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-display, "DM Sans", sans-serif)',
      color: 'var(--clr-text, #ffffff)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        background: 'var(--clr-card, #1c1c1e)',
        border: '1px solid var(--clr-border, #2c2c2e)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box'
      }}>
        {/* Play Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode('dashboard')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--clr-border, #2c2c2e)',
              color: 'var(--clr-text, #ffffff)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            ← Levels Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft, #a1a1a6)', fontWeight: 600 }}>
              Level {playingLevel} / 8
            </span>
          </div>
        </div>

        {/* Progress Bar inside Header */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(jumbledMastery.state.correctStreak / 5) * 100}%`,
            height: '100%',
            background: 'var(--clr-accent, #6cceff)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Single-line prompt question */}
        <div style={{
          background: 'var(--clr-surface, #2c2c2e)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--clr-border, #2c2c2e)',
          textAlign: 'center',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--clr-text-soft, #a1a1a6)', marginBottom: '6px' }}>
            Translate <span style={{ color: 'var(--clr-accent, #6cceff)', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', fontSize: '1.2rem' }}>{currentQuestion.expression}</span> into words:
          </div>
        </div>

        {/* Assembled Area (Dotted Box) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-soft, #a1a1a6)' }}>Your Phrase:</span>
            {selectedIndices.length > 0 && !isSolved && (
              <button
                onClick={clearSelection}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--clr-text-soft, #a1a1a6)',
                  cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline'
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{
            minHeight: '64px',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '2px dashed var(--clr-border, #2c2c2e)',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            {selectedIndices.length === 0 ? (
              <span style={{ color: 'var(--clr-text-soft, #a1a1a6)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                Click tiles below to build the sentence
              </span>
            ) : (
              selectedIndices.map((poolIndex, pos) => (
                <div
                  key={pos}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--clr-surface, #2c2c2e)',
                    border: '1px solid var(--clr-border, #2c2c2e)',
                    borderRadius: '8px',
                    color: 'var(--clr-accent, #6cceff)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Left Shift Arrow */}
                  {!isSolved && (
                    <button
                      onClick={() => shiftActiveTile(pos, -1)}
                      disabled={pos === 0}
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--clr-text-soft, #a1a1a6)',
                        cursor: pos === 0 ? 'default' : 'pointer', padding: 0, fontSize: '0.75rem',
                        opacity: pos === 0 ? 0.2 : 0.7
                      }}
                    >
                      ◀
                    </button>
                  )}

                  <span>{shuffledPool[poolIndex]}</span>

                  {/* Right Shift Arrow */}
                  {!isSolved && (
                    <button
                      onClick={() => shiftActiveTile(pos, 1)}
                      disabled={pos === selectedIndices.length - 1}
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--clr-text-soft, #a1a1a6)',
                        cursor: pos === selectedIndices.length - 1 ? 'default' : 'pointer', padding: 0, fontSize: '0.75rem',
                        opacity: pos === selectedIndices.length - 1 ? 0.2 : 0.7
                      }}
                    >
                      ▶
                    </button>
                  )}

                  {/* Remove cross */}
                  {!isSolved && (
                    <button
                      onClick={() => handleActiveTileClick(pos)}
                      style={{
                        background: 'transparent', border: 'none', color: '#ff6666',
                        cursor: 'pointer', padding: 0, fontSize: '0.85rem', marginLeft: '4px',
                        fontWeight: 700
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Word Pool Area */}
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft, #a1a1a6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>
            Word Bank
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: '12px',
            border: '1px solid var(--clr-border, #2c2c2e)',
            boxSizing: 'border-box'
          }}>
            {shuffledPool.map((word, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={isSelected || isSolved}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    border: isSelected ? '1px dashed var(--clr-border, #2c2c2e)' : '1px solid var(--clr-border, #2c2c2e)',
                    background: isSelected ? 'transparent' : 'var(--clr-surface, #2c2c2e)',
                    color: isSelected ? 'transparent' : 'var(--clr-text, #ffffff)',
                    cursor: isSelected ? 'default' : 'pointer',
                    boxShadow: isSelected ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                    pointerEvents: isSelected ? 'none' : 'auto'
                  }}
                  onMouseEnter={e => { if (!isSelected && !isSolved) { e.currentTarget.style.borderColor = 'var(--clr-accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { if (!isSelected && !isSolved) { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.transform = 'none'; } }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (Validation Option onto Right) */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isSolved ? (
            <>
              {/* Left actions */}
              <button
                onClick={() => setShowHint(prev => !prev)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--clr-border, #2c2c2e)',
                  color: 'var(--clr-text, #ffffff)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>

              {/* Right actions */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                <button
                  onClick={solveQuestion}
                  disabled={!hasAttempted}
                  style={{
                    background: 'transparent',
                    border: !hasAttempted ? '1px solid rgba(108, 206, 255, 0.15)' : '1px solid rgba(108, 206, 255, 0.4)',
                    color: !hasAttempted ? 'rgba(108, 206, 255, 0.3)' : 'var(--clr-accent, #6cceff)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: !hasAttempted ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  title={!hasAttempted ? "Please try validating an answer first before viewing the solution!" : "Reveal the correct phrase"}
                >
                  Solve
                </button>
                <button
                  className="submit-btn"
                  onClick={checkAnswer}
                  disabled={isValidateDisabled}
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    opacity: isValidateDisabled ? 0.5 : 1,
                    cursor: isValidateDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Validate Order
                </button>
              </div>
            </>
          ) : (
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="submit-btn"
                onClick={handleNext}
                disabled={solveCountdown > 0}
                style={{
                  padding: '10px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: solveCountdown > 0 ? 'var(--clr-border, #2c2c2e)' : 'var(--clr-accent, #6cceff)',
                  color: solveCountdown > 0 ? 'var(--clr-text-soft, #a1a1a6)' : 'var(--clr-bg, #000000)',
                  cursor: solveCountdown > 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {solveCountdown > 0 ? `Next Question (Wait ${solveCountdown}s)` : 'Next Question →'}
              </button>
            </div>
          )}
        </div>

        {/* Hint Box */}
        {showHint && !isSolved && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(108, 206, 255, 0.05)',
            border: '1px solid rgba(108, 206, 255, 0.2)',
            borderRadius: '10px',
            fontSize: '0.85rem',
            lineHeight: '1.4'
          }}>
            💡 <strong>Hint:</strong> {currentQuestion.hint}
          </div>
        )}

        {/* Validation Message / Explanation */}
        {msg && (
          <div style={{
            fontSize: '0.88rem',
            padding: '12px 14px',
            borderRadius: '10px',
            background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,100,100,0.08)',
            border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid rgba(255,100,100,0.3)',
            color: 'var(--clr-text)',
            lineHeight: '1.4'
          }}>
            {msg}
          </div>
        )}
      </div>

      {/* Level Completion Appreciation Modal */}
      {levelCompletionData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'var(--clr-card, #1c1c1e)',
            border: '2px solid var(--clr-accent, #6cceff)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            boxSizing: 'border-box',
            color: '#ffffff'
          }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{
              margin: '0 0 12px 0',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--clr-accent, #6cceff)',
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)'
            }}>
              Level {levelCompletionData.level} Mastered!
            </h2>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.6',
              color: '#e5e5ea',
              margin: '0 0 28px 0',
              fontFamily: 'var(--font-display, "DM Sans", sans-serif)'
            }}>
              {getMotivationalMessage(levelCompletionData.level)}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  const nextLvl = levelCompletionData.nextLevel;
                  setLevelCompletionData(null);
                  if (nextLvl <= 8) {
                    handleStartLevel(nextLvl);
                  } else {
                    setViewMode('dashboard');
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #6cceff, #3a9ad9)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(108, 206, 255, 0.3)',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-display, "DM Sans", sans-serif)'
                }}
              >
                {levelCompletionData.nextLevel <= 8 
                  ? `Continue to Level ${levelCompletionData.nextLevel} 🚀`
                  : 'Return to Dashboard 🏆'}
              </button>
              <button
                onClick={() => {
                  setLevelCompletionData(null);
                  setViewMode('dashboard');
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#a1a1a6',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-display, "DM Sans", sans-serif)'
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

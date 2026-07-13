import React, { useState, useEffect } from 'react';
import './LcmHcfApp.css';

// ==========================================================================
// CONFIGURATION & REWARDS DEFINITION
// ==========================================================================

const COLLECTIBLE_THEMES = {
  1: {
    name: 'Cute Animals',
    items: [
      { id: 'c1', name: 'Lion Cub', emoji: '🦁', desc: 'Roars with curiosity!' },
      { id: 'c2', name: 'Koala Bear', emoji: '🐨', desc: 'LOVES logic and leaves.' },
      { id: 'c3', name: 'Playful Dolphin', emoji: '🐬', desc: 'Jumps over multiples!' },
      { id: 'c4', name: 'Wise Owl', emoji: '🦉', desc: 'Hoot! HCF is a breeze.' },
      { id: 'c5', name: 'Golden Retriever', emoji: '🐶', desc: 'Always fetches the right answer!' }
    ]
  },
  2: {
    name: 'Space Tokens',
    items: [
      { id: 'c1', name: 'Cosmic Star', emoji: '⭐', desc: 'Shining prime energy!' },
      { id: 'c2', name: 'Mars Explorer', emoji: '🚀', desc: 'Mapping factors in orbit.' },
      { id: 'c3', name: 'Saturn Ring', emoji: '🪐', desc: 'Loops around multiples infinitely.' },
      { id: 'c4', name: 'Meteor Stone', emoji: '☄️', desc: 'Blasts through prime factorization!' },
      { id: 'c5', name: 'Orion Nebula', emoji: '🌌', desc: 'The birthplace of cosmic math.' }
    ]
  },
  3: {
    name: 'Magic Gems',
    items: [
      { id: 'c1', name: 'Ruby of Wisdom', emoji: '❤️', desc: 'Glows with the truth of primes.' },
      { id: 'c2', name: 'Sapphire of Logic', emoji: '💙', desc: 'Arranges factors in perfect harmony.' },
      { id: 'c3', name: 'Emerald of Curiosity', emoji: '💚', desc: 'Expands your mathematical mind.' },
      { id: 'c4', name: 'Amethyst of Reason', emoji: '💜', desc: 'Perfect alignment of LCM and HCF.' },
      { id: 'c5', name: 'Diamond of Mastery', emoji: '💎', desc: 'The ultimate symbol of math excellence.' }
    ]
  }
};

// Order of steps:
// 0: Age select
// 1: Prime Numbers
// 2: Factors
// 3: Prime Factors
// 4: LCM
// 5: HCF
// 6: How to Find LCM
// 7: How to Find HCF
// 8: Solving Methods
// 9: Confidence Meter
// 10: Quiz
// 11: Collectibles Reward Bank
const STEPS_META = [
  { id: 'start', label: 'Start' },
  { id: 'prime', label: 'Prime Numbers' },
  { id: 'factors', label: 'Factors' },
  { id: 'pfactors', label: 'Prime Factors' },
  { id: 'lcm', label: 'LCM' },
  { id: 'hcf', label: 'HCF' },
  { id: 'find_lcm', label: 'Find LCM' },
  { id: 'find_hcf', label: 'Find HCF' },
  { id: 'methods', label: 'Methods' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'bank', label: 'Rewards' }
];

export default function InteractiveLcmHcfApp({ onBack }) {
  // --- Core State ---
  const [level, setLevel] = useState(null); // 1, 2, or 3
  const [currentStep, setCurrentStep] = useState(0); // 0 to 11
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Flashcard, 1: Animation, 2: Activity, 3: Explanation/Why

  // --- Progression Locking ---
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [revealedExamples, setRevealedExamples] = useState({}); // { [stepIndex]: boolean }
  const [activityPopup, setActivityPopup] = useState(null); // { title: string, text: string, type: 'success' | 'error' }

  // --- Left Drawer (Why Panel) State ---
  const [whyOpen, setWhyOpen] = useState(false);
  const [whyAnswer, setWhyAnswer] = useState('');
  const [whyFeedback, setWhyFeedback] = useState(null); // { correct: bool, text: string }
  const [unlockedCollectibles, setUnlockedCollectibles] = useState({}); // { level_stepIndex: bool }

  // --- Confidence State & Gamified Learning Levels ---
  const [confidence, setConfidence] = useState(null); // 'very', 'mod', 'not'
  const [unlockedQuizLevels, setUnlockedQuizLevels] = useState({ explorer: true, champion: false, master: false });


  // --- Quiz State ---
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState(null); // { correct: bool, display: string }
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);


  // --- Activity State Helpers ---
  const [activityState, setActivityState] = useState({});

  // Reset slide index and initialize dynamic activity values when step or level changes
  useEffect(() => {
    setCurrentSlide(0);
    setWhyOpen(false);
    setWhyAnswer('');
    setWhyFeedback(null);
    setActivityPopup(null);
    
    // Initialize activity parameters dynamically based on currentStep and level
    const initialActivityState = {};
    if (currentStep === 1) {
      // Step 1: Prime numbers
      let numbers = [];
      let primes = [];
      if (level === 1) {
        numbers = [2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25];
        primes = [2, 3, 7, 11, 13, 17, 19, 23];
      } else if (level === 2) {
        numbers = [5, 9, 12, 13, 15, 17, 21, 23, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49];
        primes = [5, 13, 17, 23, 29, 31, 37, 41, 43, 47];
      } else {
        numbers = [47, 51, 53, 57, 59, 61, 63, 67, 69, 71, 73, 77, 79, 81, 83, 87, 89, 91, 93, 97];
        primes = [47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
      }
      initialActivityState.numbers = numbers;
      initialActivityState.primes = primes;
      initialActivityState.clickedPrimes = [];
      initialActivityState.wrongPrimes = [];
    } else if (currentStep === 2) {
      // Step 2: Factors of a target number
      let target = 12;
      let allOptions = [];
      let correctFactors = [];
      if (level === 1) {
        target = 12;
        allOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
        correctFactors = [1, 2, 3, 4, 6, 12];
      } else if (level === 2) {
        target = 24;
        allOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
        correctFactors = [1, 2, 3, 4, 6, 8, 12, 24];
      } else {
        target = 36;
        allOptions = [1, 2, 3, 4, 5, 6, 8, 9, 12, 16, 18, 24, 36];
        correctFactors = [1, 2, 3, 4, 6, 9, 12, 18, 36];
      }
      initialActivityState.target = target;
      initialActivityState.allOptions = allOptions;
      initialActivityState.correctFactors = correctFactors;
      initialActivityState.selectedFactors = [];
    } else if (currentStep === 3) {
      // Step 3: Prime Factors tree
      let target = 18;
      if (level === 1) target = 12;
      else if (level === 2) target = 18;
      else target = 30;
      initialActivityState.target = target;
      initialActivityState.treeStep = 0;
    } else if (currentStep === 4) {
      // Step 4: LCM jumps
      let jumpA = 3, jumpB = 4, maxVal = 16, lcmVal = 12;
      if (level === 1) {
        jumpA = 2; jumpB = 3; maxVal = 8; lcmVal = 6;
      } else if (level === 2) {
        jumpA = 3; jumpB = 4; maxVal = 16; lcmVal = 12;
      } else {
        jumpA = 3; jumpB = 5; maxVal = 20; lcmVal = 15;
      }
      initialActivityState.jumpA = jumpA;
      initialActivityState.jumpB = jumpB;
      initialActivityState.maxVal = maxVal;
      initialActivityState.lcmVal = lcmVal;
      initialActivityState.jumpsA = 0;
      initialActivityState.jumpsB = 0;
    } else if (currentStep === 5) {
      // Step 5: HCF Venn Diagram
      let numA = 12, numB = 18;
      let leftOnly = [4, 12];
      let rightOnly = [9, 18];
      let both = [1, 2, 3, 6];
      let allNums = [1, 2, 3, 4, 6, 9, 12, 18];
      
      if (level === 1) {
        numA = 8; numB = 12;
        leftOnly = [8];
        rightOnly = [3, 6, 12];
        both = [1, 2, 4];
        allNums = [1, 2, 3, 4, 6, 8, 12];
      } else if (level === 2) {
        numA = 12; numB = 18;
        leftOnly = [4, 12];
        rightOnly = [9, 18];
        both = [1, 2, 3, 6];
        allNums = [1, 2, 3, 4, 6, 9, 12, 18];
      } else {
        numA = 18; numB = 24;
        leftOnly = [9];
        rightOnly = [4, 8, 12, 24];
        both = [1, 2, 3, 6];
        allNums = [1, 2, 3, 4, 6, 8, 9, 12, 18, 24];
      }
      initialActivityState.numA = numA;
      initialActivityState.numB = numB;
      initialActivityState.leftOnly = leftOnly;
      initialActivityState.rightOnly = rightOnly;
      initialActivityState.both = both;
      initialActivityState.allNums = allNums;
      initialActivityState.placements = {};
      allNums.forEach(n => { initialActivityState.placements[n] = 'pool'; });
    } else if (currentStep === 6) {
      // Step 6: How to Find LCM
      let numA = 3, numB = 4;
      let listA = [3, 6, 9, 12, 15, 18, 21, 24];
      let listB = [4, 8, 12, 16, 20, 24];
      let common = [12, 24];
      let lcmVal = 12;
      
      if (level === 1) {
        numA = 2; numB = 3;
        listA = [2, 4, 6, 8, 10, 12];
        listB = [3, 6, 9, 12];
        common = [6, 12];
        lcmVal = 6;
      } else if (level === 2) {
        numA = 3; numB = 4;
        listA = [3, 6, 9, 12, 15, 18, 21, 24];
        listB = [4, 8, 12, 16, 20, 24];
        common = [12, 24];
        lcmVal = 12;
      } else {
        numA = 4; numB = 5;
        listA = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
        listB = [5, 10, 15, 20, 25, 30, 35, 40];
        common = [20, 40];
        lcmVal = 20;
      }
      initialActivityState.numA = numA;
      initialActivityState.numB = numB;
      initialActivityState.listA = listA;
      initialActivityState.listB = listB;
      initialActivityState.common = common;
      initialActivityState.lcmVal = lcmVal;
      initialActivityState.selectedLcmMults = [];
    } else if (currentStep === 7) {
      // Step 7: How to Find HCF
      let numA = 8, numB = 20;
      let factorsA = [1, 2, 4, 8];
      let factorsB = [1, 2, 4, 5, 10, 20];
      let common = [1, 2, 4];
      let hcfVal = 4;
      
      if (level === 1) {
        numA = 6; numB = 9;
        factorsA = [1, 2, 3, 6];
        factorsB = [1, 3, 9];
        common = [1, 3];
        hcfVal = 3;
      } else if (level === 2) {
        numA = 8; numB = 20;
        factorsA = [1, 2, 4, 8];
        factorsB = [1, 2, 4, 5, 10, 20];
        common = [1, 2, 4];
        hcfVal = 4;
      } else {
        numA = 12; numB = 30;
        factorsA = [1, 2, 3, 4, 6, 12];
        factorsB = [1, 2, 3, 5, 6, 10, 15, 30];
        common = [1, 2, 3, 6];
        hcfVal = 6;
      }
      initialActivityState.numA = numA;
      initialActivityState.numB = numB;
      initialActivityState.factorsA = factorsA;
      initialActivityState.factorsB = factorsB;
      initialActivityState.common = common;
      initialActivityState.hcfVal = hcfVal;
      initialActivityState.selectedHcfFacts = [];
    } else if (currentStep === 8) {
      if (level === 2) {
        initialActivityState.numA = 18;
        initialActivityState.numB = 30;
        initialActivityState.dnaA = "2 × 3 × 3";
        initialActivityState.dnaB = "2 × 3 × 5";
        initialActivityState.primePairs = [];
      } else if (level === 3) {
        initialActivityState.numA = 45;
        initialActivityState.numB = 105;
        initialActivityState.divStep = 0;
      }
    }
    setActivityState(initialActivityState);
  }, [currentStep, level]);

  // Reset progression when level changes
  useEffect(() => {
    if (level === null) {
      setMaxStepReached(1);
      setRevealedExamples({});
      setActivityPopup(null);
      setActivityState({});
      setUnlockedCollectibles({}); // RESET COLLECTIBLES!
      setConfidence(null);
      setUnlockedQuizLevels({ explorer: true, champion: false, master: false });
    }
  }, [level]);

  // Handle quiz level unlocking based on performance
  useEffect(() => {
    if (quizFinished) {
      if (confidence === 'not') {
        if (quizScore >= 4) {
          setUnlockedQuizLevels(prev => ({ ...prev, champion: true }));
        }
      } else if (confidence === 'mod') {
        if (quizScore >= 3) {
          setUnlockedQuizLevels(prev => ({ ...prev, master: true }));
        }
      }
    }
  }, [quizFinished, quizScore, confidence]);

  const saveProgress = () => {
    // Keep it as a no-op to avoid breaking downstream references if any
  };

  // Check if current concept's collectible is unlocked
  const isCurrentCollectibleUnlocked = () => {
    if (currentStep < 1 || currentStep > 8) return false;
    return !!unlockedCollectibles[`${level}_${currentStep}`];
  };

  // Helper: GCD and LCM
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  // Dynamic numbers based on age level
  const getAdaptiveNumber = (type) => {
    if (level === 1) {
      if (type === 'prime_factors') return 12;
      if (type === 'lcm_pair') return [3, 4];
      if (type === 'hcf_pair') return [6, 8];
    } else if (level === 2) {
      if (type === 'prime_factors') return 48;
      if (type === 'lcm_pair') return [12, 18];
      if (type === 'hcf_pair') return [12, 18];
    } else {
      if (type === 'prime_factors') return 180;
      if (type === 'lcm_pair') return [15, 20];
      if (type === 'hcf_pair') return [45, 60];
    }
    return null;
  };

  const isActivityCompleted = (stepIndex) => {
    switch (stepIndex) {
      case 1: {
        const clicked = activityState.clickedPrimes || [];
        const primes = activityState.primes || [2, 5, 11, 13, 17, 19, 23, 29, 31];
        return clicked.length === primes.length;
      }
      case 2: {
        const selected = activityState.selectedFactors || [];
        const correctFactors = activityState.correctFactors || [1, 2, 3, 4, 6, 12];
        return correctFactors.every(f => selected.includes(f)) && selected.every(f => correctFactors.includes(f));
      }
      case 3: {
        const step = activityState.treeStep || 0;
        return step === 3;
      }
      case 4: {
        const jumpsA = activityState.jumpsA || 0;
        const jumpsB = activityState.jumpsB || 0;
        const jumpA = activityState.jumpA || 3;
        const jumpB = activityState.jumpB || 4;
        const posA = jumpsA * jumpA;
        const posB = jumpsB * jumpB;
        const lcmVal = activityState.lcmVal || 12;
        return posA > 0 && posA === posB && posA === lcmVal;
      }
      case 5: {
        const currentPlacements = activityState.placements || {};
        const allNums = activityState.allNums || [1, 2, 3, 4, 6, 9, 12, 18];
        if (Object.keys(currentPlacements).length === 0) return false;
        const leftOnly = activityState.leftOnly || [4, 12];
        const rightOnly = activityState.rightOnly || [9, 18];
        const both = activityState.both || [1, 2, 3, 6];
        return allNums.every(n => {
          const p = currentPlacements[n];
          if (leftOnly.includes(n)) return p === 'left';
          if (rightOnly.includes(n)) return p === 'right';
          if (both.includes(n)) return p === 'both';
          return false;
        });
      }
      case 6: {
        const selected = activityState.selectedLcmMults || [];
        const common = activityState.common || [12, 24];
        return common.every(c => selected.includes(c)) && selected.length === common.length;
      }
      case 7: {
        const selected = activityState.selectedHcfFacts || [];
        const common = activityState.common || [1, 2, 4];
        return common.every(c => selected.includes(c)) && selected.length === common.length;
      }
      case 8: {
        if (level === 1) return true;
        if (level === 2) {
          const currentSelection = activityState.primePairs || [];
          return currentSelection.includes('2') && currentSelection.includes('3');
        }
        if (level === 3) {
          const divisionStep = activityState.divStep || 0;
          return divisionStep >= 1;
        }
        return false;
      }
      default:
        return true;
    }
  };

  useEffect(() => {
    if (isActivityCompleted(currentStep)) {
      setMaxStepReached(prev => Math.max(prev, currentStep + 1));
    }
  }, [activityState, currentStep]);

  // ==========================================================================
  // EXPLANATION & TRY-IT-OUT QUESTIONS DATA
  // ==========================================================================
  const getWhyData = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        if (level === 1) {
          return {
            title: 'Why Prime Numbers?',
            explanation: 'Prime numbers are the building blocks of math. Every number greater than 1 is either prime or can be made by multiplying prime numbers!',
            question: 'Which of the following is a prime number?',
            options: ['4', '6', '7', '9'],
            answer: '7',
            hint: '7 can only be divided by 1 and itself.'
          };
        } else if (level === 2) {
          return {
            title: 'Why Prime Numbers?',
            explanation: 'Prime numbers are mathematical atoms. Just like molecules are built from atoms, every composite number has a unique prime structure.',
            question: 'Which of the following is a prime number?',
            options: ['9', '15', '23', '27'],
            answer: '23',
            hint: '23 has no factors other than 1 and itself.'
          };
        } else {
          return {
            title: 'Why Prime Numbers?',
            explanation: 'Prime numbers act as the fundamental atoms of arithmetic. Under the Fundamental Theorem of Arithmetic, every integer > 1 is uniquely factored into primes.',
            question: 'Which of the following is a prime number?',
            options: ['39', '49', '51', '59'],
            answer: '59',
            hint: '59 cannot be divided by 2, 3, 5, or any other number except 1 and 59.'
          };
        }
      case 2:
        if (level === 1) {
          return {
            title: 'Why Factors?',
            explanation: 'Factors show us how to split a number into equal groups. For example, if you have 12 cookies, factors tell you all the ways you can share them evenly!',
            question: 'What are the factors of 4?',
            options: ['1, 2', '1, 2, 4', '1, 4', '2, 4'],
            answer: '1, 2, 4',
            hint: '1 × 4 = 4 and 2 × 2 = 4, so 1, 2, and 4 divide 4 perfectly.'
          };
        } else if (level === 2) {
          return {
            title: 'Why Factors?',
            explanation: 'Factors represent exact divisors. They let us partition quantities into symmetric arrangements without any remaining leftovers.',
            question: 'What is the largest factor of 15 other than 15 itself?',
            options: ['1', '3', '5', '10'],
            answer: '5',
            hint: 'Factors of 15 are 1, 3, 5, 15. The largest one smaller than 15 is 5.'
          };
        } else {
          return {
            title: 'Why Factors?',
            explanation: 'Factors define algebraic divisibility within integers. They are the divisors that partition a number into equal modular components.',
            question: 'How many factors does the number 16 have?',
            options: ['3', '4', '5', '6'],
            answer: '5',
            hint: 'Factors of 16 are 1, 2, 4, 8, and 16. Total of 5 factors.'
          };
        }
      case 3:
        if (level === 1) {
          return {
            title: 'Why Prime Factors?',
            explanation: 'Prime factors are like a number\'s unique barcode or DNA. No two numbers share the exact same prime building blocks!',
            question: 'What are the prime factors of 6?',
            options: ['1, 6', '2, 3', '2, 4', '3, 6'],
            answer: '2, 3',
            hint: '6 = 2 × 3. Both 2 and 3 are prime numbers.'
          };
        } else if (level === 2) {
          return {
            title: 'Why Prime Factors?',
            explanation: 'Prime factors provide the unique factorization signature of a number. This DNA makes breaking down large numbers extremely simple.',
            question: 'What is the largest prime factor of 20?',
            options: ['2', '4', '5', '10'],
            answer: '5',
            hint: '20 = 2 × 2 × 5. The prime factors are 2 and 5.'
          };
        } else {
          return {
            title: 'Why Prime Factors?',
            explanation: 'By the Fundamental Theorem of Arithmetic, prime factor decomposition provides a unique signature index for every composite integer.',
            question: 'What is the prime factorization of 36?',
            options: ['4 × 9', '2 × 2 × 9', '2 × 2 × 3 × 3', '2 × 3 × 6'],
            answer: '2 × 2 × 3 × 3',
            hint: 'Prime factorization must only contain prime numbers. 36 = 2 × 2 × 3 × 3.'
          };
        }
      case 4:
        if (level === 1) {
          return {
            title: 'Why LCM?',
            explanation: 'LCM stands for Lowest Common Multiple. It helps us find when two repeating events will happen at the same time, like alarms or bus schedules!',
            question: 'Find the LCM of 2 and 3.',
            inputPlaceholder: 'e.g. 6',
            answer: '6',
            hint: 'Multiples of 2: 2, 4, 6... Multiples of 3: 3, 6... They meet first at 6.'
          };
        } else if (level === 2) {
          return {
            title: 'Why LCM?',
            explanation: 'LCM is the smallest positive integer divisible by both numbers. It determines the synchronization frequency of periodic cycles.',
            question: 'Find the LCM of 4 and 6.',
            inputPlaceholder: 'e.g. 12',
            answer: '12',
            hint: 'Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... They meet first at 12.'
          };
        } else {
          return {
            title: 'Why LCM?',
            explanation: 'LCM represents the intersection of multiple ideals in ring theory. It identifies the first common period where multiple waveforms align.',
            question: 'Find the LCM of 6 and 10.',
            inputPlaceholder: 'e.g. 30',
            answer: '30',
            hint: 'Multiples of 6: 6, 12, 18, 24, 30... Multiples of 10: 10, 20, 30... They meet first at 30.'
          };
        }
      case 5:
        if (level === 1) {
          return {
            title: 'Why HCF?',
            explanation: 'HCF is the largest factor shared by numbers. It is the biggest size you can use to divide items into equal groups with nothing left over!',
            question: 'Find the HCF of 4 and 6.',
            inputPlaceholder: 'e.g. 2',
            answer: '2',
            hint: 'Factors of 4: 1, 2, 4. Factors of 6: 1, 2, 3, 6. The largest shared factor is 2.'
          };
        } else if (level === 2) {
          return {
            title: 'Why HCF?',
            explanation: 'HCF is the largest integer dividing both numbers. It defines the maximum capacity of symmetric grouping across diverse quantities.',
            question: 'Find the HCF of 12 and 18.',
            inputPlaceholder: 'e.g. 6',
            answer: '6',
            hint: 'Factors of 12: 1, 2, 3, 4, 6, 12. Factors of 18: 1, 2, 3, 6, 9, 18. The highest shared factor is 6.'
          };
        } else {
          return {
            title: 'Why HCF?',
            explanation: 'HCF is the greatest common divisor. It is algebraically computed as the generator of the ideal generated by both integers.',
            question: 'Find the HCF of 24 and 36.',
            inputPlaceholder: 'e.g. 12',
            answer: '12',
            hint: 'Factors of 24: 1..24 (highest is 12). Factors of 36: 1..36 (highest is 12). The highest shared factor is 12.'
          };
        }
      case 6:
        if (level === 1) {
          return {
            title: 'Why listing multiples is not enough?',
            explanation: 'Listing multiples works well for small numbers, but for larger numbers it is too slow and easy to make mistakes. We need a faster system!',
            question: 'What is the LCM of 3 and 5?',
            inputPlaceholder: 'e.g. 15',
            answer: '15',
            hint: 'Since both are prime, just multiply them: 3 × 5 = 15.'
          };
        } else if (level === 2) {
          return {
            title: 'Why listing multiples is not enough?',
            explanation: 'As integers scale, listing multiples grows computationally expensive. Structured prime division yields exact LCMs instantly.',
            question: 'What is the LCM of 8 and 12?',
            inputPlaceholder: 'e.g. 24',
            answer: '24',
            hint: 'Multiples of 8: 8, 16, 24... Multiples of 12: 12, 24... First match is 24.'
          };
        } else {
          return {
            title: 'Why listing multiples is not enough?',
            explanation: 'Listing multiples lacks algebraic scaling. Systematic prime decomposition computes LCM directly without infinite listing.',
            question: 'What is the LCM of 12 and 15?',
            inputPlaceholder: 'e.g. 60',
            answer: '60',
            hint: '12 = 2² × 3, 15 = 3 × 5. LCM = 2² × 3 × 5 = 60.'
          };
        }
      case 7:
        if (level === 1) {
          return {
            title: 'Why listing factors is not enough?',
            explanation: 'Listing factors for large numbers takes too long and you might miss a factor. Structured methods find the HCF directly!',
            question: 'What is the HCF of 8 and 12?',
            inputPlaceholder: 'e.g. 4',
            answer: '4',
            hint: 'Factors of 8: 1, 2, 4, 8. Factors of 12: 1, 2, 3, 4, 6, 12. Largest shared is 4.'
          };
        } else if (level === 2) {
          return {
            title: 'Why listing factors is not enough?',
            explanation: 'High composite numbers contain dozens of factors. Using prime factors lets you isolate common factors instantly without missing any.',
            question: 'What is the HCF of 15 and 25?',
            inputPlaceholder: 'e.g. 5',
            answer: '5',
            hint: 'Factors of 15: 1, 3, 5, 15. Factors of 25: 1, 5, 25. Largest shared is 5.'
          };
        } else {
          return {
            title: 'Why listing factors is not enough?',
            explanation: 'Exhaustive listing of divisors is inefficient. Euclidean algorithm or prime analysis computes HCF systematically in log-time.',
            question: 'What is the HCF of 36 and 48?',
            inputPlaceholder: 'e.g. 12',
            answer: '12',
            hint: '36 = 2² × 3², 48 = 2⁴ × 3. HCF = 2² × 3 = 12.'
          };
        }
      case 8:
        if (level === 1) {
          return null; // Level 1 skips step 8
        } else if (level === 2) {
          return {
            title: 'Why use Prime Factorization?',
            explanation: 'Prime Factorization divides any number into its prime atoms. Comparing these atoms lets you find both HCF and LCM easily!',
            question: 'Find the HCF of 18 and 30 using prime factorization.',
            inputPlaceholder: 'e.g. 6',
            answer: '6',
            hint: '18 = 2 × 3 × 3. 30 = 2 × 3 × 5. Shared primes are 2 and 3. HCF = 2 × 3 = 6.'
          };
        } else {
          return {
            title: 'Why use Long Division for HCF?',
            explanation: 'Long division (Euclidean Algorithm) is the fastest way to find HCF for massive numbers. You divide recursively until remainder is 0.',
            question: 'Find the HCF of 45 and 105 using division.',
            inputPlaceholder: 'e.g. 15',
            answer: '15',
            hint: '105 = 45 × 2 + 15. Then divide 45 by 15: 45 = 15 × 3 + 0. The last divisor 15 is HCF.'
          };
        }
      default:
        return null;
    }
  };

  // ==========================================================================
  // INTERACTIVE ACTIVITIES IMPLEMENTATION
  // ==========================================================================

  // Submit handler for Why Panel (Try-It-Out)
  const handleWhySubmit = (e) => {
    if (e) e.preventDefault();
    const data = getWhyData(currentStep);
    if (!data) return;

    const isCorrect = whyAnswer.trim().toLowerCase() === data.answer.toLowerCase();
    if (isCorrect) {
      setWhyFeedback({ correct: true, text: 'Awesome! That is correct. You unlocked a collectible!' });
      const newCollectibles = { ...unlockedCollectibles, [`${level}_${currentStep}`]: true };
      setUnlockedCollectibles(newCollectibles);
      saveProgress(newCollectibles);
    } else {
      setActivityPopup({
        title: 'Incorrect Answer',
        text: `Not quite! Hint: ${data.hint}`,
        type: 'error'
      });
      setWhyOpen(false);
      setWhyFeedback(null);
      setWhyAnswer('');
    }
  };

  // 1. Prime Numbers Activity: Click the primes
  const renderPrimeActivity = () => {
    const numbers = activityState.numbers || [2, 4, 5, 8, 9, 11, 12, 13, 15, 17, 18, 19, 21, 23, 25, 27, 29, 30, 31, 33];
    const primes = activityState.primes || [2, 5, 11, 13, 17, 19, 23, 29, 31];
    
    const clicked = activityState.clickedPrimes || [];
    const wrong = activityState.wrongPrimes || [];
    const done = clicked.length === primes.length;

    const explainWhyNotPrime = (n) => {
      // Find the smallest divisor greater than 1
      let divisor = 2;
      while (divisor < n) {
        if (n % divisor === 0) break;
        divisor++;
      }
      return `${n} is not a prime number because it is divisible by ${divisor} (${divisor} × ${n / divisor} = ${n}).`;
    };

    const handleSelect = (n) => {
      if (done) return;
      if (primes.includes(n)) {
        if (!clicked.includes(n)) {
          const next = [...clicked, n];
          setActivityState({ ...activityState, clickedPrimes: next });
        }
      } else {
        if (!wrong.includes(n)) {
          const next = [...wrong, n];
          setActivityState({ ...activityState, wrongPrimes: next });
          
          setActivityPopup({
            title: 'Not a Prime Number',
            text: explainWhyNotPrime(n),
            type: 'error'
          });

          setTimeout(() => {
            setActivityState(prev => ({
              ...prev,
              wrongPrimes: prev.wrongPrimes.filter(x => x !== n)
            }));
          }, 800);
        }
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {done ? '🎉 Congratulations! You found all the Prime Numbers!' : `Click on all the Prime Numbers (${clicked.length}/${primes.length})`}
        </p>
        <div className="prime-hunter-grid">
          {numbers.map(n => {
            let className = 'prime-hunter-cell';
            if (clicked.includes(n)) className += ' prime-correct';
            else if (wrong.includes(n)) className += ' composite-wrong';
            else if (done && !primes.includes(n)) className += ' composite-missed';
            return (
              <div key={n} className={className} onClick={() => handleSelect(n)}>
                {n}
              </div>
            );
          })}
        </div>
        {done && <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>Click "Next" to continue!</p>}
      </div>
    );
  };

  // 2. Factors Activity: Find factors of target
  const renderFactorsActivity = () => {
    const target = activityState.target || 12;
    const allOptions = activityState.allOptions || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    const correctFactors = activityState.correctFactors || [1, 2, 3, 4, 6, 12];
    
    const selected = activityState.selectedFactors || [];
    const done = correctFactors.every(f => selected.includes(f)) && selected.every(f => correctFactors.includes(f));

    const toggleFactor = (n) => {
      if (selected.includes(n)) {
        const next = selected.filter(x => x !== n);
        setActivityState({ ...activityState, selectedFactors: next });
      } else {
        if (correctFactors.includes(n)) {
          const next = [...selected, n];
          setActivityState({ ...activityState, selectedFactors: next });
        } else {
          setActivityPopup({
            title: 'Not a Factor',
            text: `${n} is not a factor of ${target}. ${target} is not perfectly divisible by ${n} (${target} ÷ ${n} leaves a remainder of ${target % n}).`,
            type: 'error'
          });
        }
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Select all the factors of <span style={{ color: 'var(--clr-accent)', fontSize: '1.2rem' }}>{target}</span>:
        </p>
        <div className="factor-rainbow-grid">
          {allOptions.map(n => {
            const isSel = selected.includes(n);
            const isFact = correctFactors.includes(n);
            let className = 'factor-bubble';
            if (done && isFact) className += ' paired';
            else if (isSel) className += ' selected';
            return (
              <div key={n} className={className} onClick={() => toggleFactor(n)}>
                {n}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '20px' }}>
          {done ? (
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
              🎉 Perfect! {correctFactors.join(', ')} are all the factors of {target}! Click "Next".
            </p>
          ) : (
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem' }}>
              Select factors: {selected.join(', ')}
            </p>
          )}
        </div>
      </div>
    );
  };

  // 3. Prime Factors Activity: Factor Tree builder
  const renderPrimeFactorsActivity = () => {
    const target = activityState.target || 18;
    const step = activityState.treeStep || 0; // 0: start, 1: split 18, 2: split 9, 3: completed
    
    return (
      <div className="activity-box" style={{ minHeight: '260px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Let's build a Factor Tree to find the prime factors of <span style={{ color: 'var(--clr-accent)' }}>{target}</span>:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Root node */}
          <div className="tree-node-circle">{target}</div>

          {step >= 1 && (
            <div className="tree-branches">
              <div className="tree-node-wrapper">
                <div className="tree-node-circle prime">2</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginTop: '4px' }}>Prime!</div>
              </div>
              <div className="tree-node-wrapper">
                <div className="tree-node-circle" style={step >= 2 ? { background: 'var(--clr-badge)' } : { borderStyle: 'dashed' }}>
                  {step >= 2 ? (target / 2) : '?'}
                </div>
                {step < 2 && (
                  <button 
                    onClick={() => setActivityState({ ...activityState, treeStep: 2 })}
                    style={{ marginTop: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {target} = 2 × ?
                  </button>
                )}
              </div>
            </div>
          )}

          {step >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
              <div className="tree-branches">
                <div className="tree-node-wrapper">
                  <div className="tree-node-circle prime">{step >= 3 ? (target === 12 ? 2 : 3) : '?'}</div>
                  {step === 2 && (
                    <button 
                      onClick={() => setActivityState({ ...activityState, treeStep: 3 })}
                      style={{ marginTop: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {target / 2} = {target === 12 ? 2 : 3} × ?
                    </button>
                  )}
                  {step >= 3 && <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginTop: '4px' }}>Prime!</div>}
                </div>
                <div className="tree-node-wrapper">
                  <div className="tree-node-circle prime">{step >= 3 ? (target === 12 ? 3 : (target === 18 ? 3 : 5)) : '?'}</div>
                  {step >= 3 && <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginTop: '4px' }}>Prime!</div>}
                </div>
              </div>
            </div>
          )}

          {step === 0 && (
            <button 
              onClick={() => setActivityState({ ...activityState, treeStep: 1 })}
              style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Start Splitting {target}
            </button>
          )}

          {step === 3 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                🎉 Completed! The Prime Factors of {target} are {target === 30 ? '2, 3, and 5' : '2 and 3'}.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
                {target} = {target === 12 ? '2 × 2 × 3 (or 2² × 3)' : (target === 18 ? '2 × 3 × 3 (or 2 × 3²)' : '2 × 3 × 5')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. LCM Activity: Jumps on number line to find LCM of jumpA and jumpB
  const renderLcmActivity = () => {
    const jumpA = activityState.jumpA || 3;
    const jumpB = activityState.jumpB || 4;
    const maxVal = activityState.maxVal || 16;
    const lcmVal = activityState.lcmVal || 12;

    const jumpsA = activityState.jumpsA || 0;
    const jumpsB = activityState.jumpsB || 0;
    
    const posA = jumpsA * jumpA;
    const posB = jumpsB * jumpB;
    
    // Check if they matched at LCM
    const matched = posA > 0 && posA === posB;
    const isLcm = matched && posA === lcmVal;

    const jump = (val) => {
      if (val === jumpA && posA < maxVal) {
        const nextPos = posA + jumpA;
        if (nextPos > lcmVal) {
          setActivityPopup({
            title: 'Crossing the Range',
            text: `Whoops! Jump to ${nextPos} crosses the Lowest Common Multiple (${lcmVal}). The LCM is ${lcmVal}, where they first meet!`,
            type: 'error'
          });
        }
        setActivityState({ ...activityState, jumpsA: jumpsA + 1 });
      } else if (val === jumpB && posB < maxVal) {
        const nextPos = posB + jumpB;
        if (nextPos > lcmVal) {
          setActivityPopup({
            title: 'Crossing the Range',
            text: `Whoops! Jump to ${nextPos} crosses the Lowest Common Multiple (${lcmVal}). The LCM is ${lcmVal}, where they first meet!`,
            type: 'error'
          });
        }
        setActivityState({ ...activityState, jumpsB: jumpsB + 1 });
      }
    };

    const reset = () => {
      setActivityState({ ...activityState, jumpsA: 0, jumpsB: 0 });
    };

    // Calculate SVG coordinates
    const getX = (val) => 20 + (val / maxVal) * (610 - 40);

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Find where jumps of <span style={{ color: '#e8864a' }}>{jumpA}</span> and <span style={{ color: '#ede8e3' }}>{jumpB}</span> meet!
        </p>

        <svg className="jump-chart-svg" viewBox="0 0 610 120">
          {/* Main line */}
          <line x1="20" y1="90" x2="590" y2="90" stroke="var(--clr-text)" strokeWidth="2" />
          
          {/* Ticks and Labels */}
          {Array.from({ length: maxVal + 1 }).map((_, i) => (
            <g key={i}>
              <line x1={getX(i)} y1="85" x2={getX(i)} y2="95" className="jump-tick" />
              <text x={getX(i)} y="110" className="jump-label">{i}</text>
            </g>
          ))}

          {/* Arcs for A */}
          {Array.from({ length: jumpsA }).map((_, i) => {
            const start = i * jumpA;
            const end = start + jumpA;
            const x1 = getX(start);
            const x2 = getX(end);
            const rx = (x2 - x1) / 2;
            const ry = Math.min(rx * 0.5, 45);
            const path = `M ${x1} 90 A ${rx} ${ry} 0 0 1 ${x2} 90`;
            return <path key={`A_${i}`} d={path} className="jump-arc" stroke="#e8864a" />;
          })}

          {/* Arcs for B */}
          {Array.from({ length: jumpsB }).map((_, i) => {
            const start = i * jumpB;
            const end = start + jumpB;
            const x1 = getX(start);
            const x2 = getX(end);
            const rx = (x2 - x1) / 2;
            const ry = Math.min(rx * 0.5, 45);
            const path = `M ${x1} 90 A ${rx} ${ry} 0 0 1 ${x2} 90`;
            return <path key={`B_${i}`} d={path} className="jump-arc" stroke="#ede8e3" style={{ strokeDasharray: '4,4' }} />;
          })}
        </svg>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
          <button 
            onClick={() => jump(jumpA)} 
            disabled={posA >= maxVal || isLcm}
            style={{ background: '#e8864a', color: '#fff', opacity: posA >= maxVal ? 0.5 : 1 }}
          >
            Jump {jumpA} (+{jumpA}) = {posA + jumpA}
          </button>
          <button 
            onClick={() => jump(jumpB)} 
            disabled={posB >= maxVal || isLcm}
            style={{ background: '#ede8e3', color: '#1a1614', opacity: posB >= maxVal ? 0.5 : 1 }}
          >
            Jump {jumpB} (+{jumpB}) = {posB + jumpB}
          </button>
          <button onClick={reset} style={{ background: 'transparent', borderColor: 'var(--clr-border)' }}>
            Reset
          </button>
        </div>

        {matched && (
          <div style={{ marginTop: '12px' }}>
            {isLcm ? (
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                🎉 Yes! They meet at {lcmVal}. This is the Lowest Common Multiple (LCM)! Click "Next".
              </p>
            ) : (
              <p style={{ color: 'var(--clr-wrong)', fontWeight: 'bold' }}>
                They met at {posA}, but is that the smallest? Keep going or reset!
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // 5. HCF Activity: Venn Diagram sorting of factors
  const renderHcfActivity = () => {
    const numA = activityState.numA || 12;
    const numB = activityState.numB || 18;
    const leftOnly = activityState.leftOnly || [4, 12];
    const rightOnly = activityState.rightOnly || [9, 18];
    const both = activityState.both || [1, 2, 3, 6];
    const allNums = activityState.allNums || [1, 2, 3, 4, 6, 9, 12, 18];

    const currentPlacements = activityState.placements || {}; // { num: 'pool' | 'left' | 'right' | 'both' }
    
    // Initialize placements if not set
    if (Object.keys(currentPlacements).length === 0) {
      const initial = {};
      allNums.forEach(n => { initial[n] = 'pool'; });
      setActivityState({ ...activityState, placements: initial });
      return null;
    }

    const setPlacement = (num, place) => {
      let correctPlace;
      if (leftOnly.includes(num)) correctPlace = 'left';
      else if (rightOnly.includes(num)) correctPlace = 'right';
      else if (both.includes(num)) correctPlace = 'both';

      if (place === 'pool') {
        const next = { ...currentPlacements, [num]: 'pool' };
        setActivityState({ ...activityState, placements: next });
        return;
      }

      if (place !== correctPlace) {
        let text = '';
        if (correctPlace === 'left') {
          text = `${num} is only a factor of ${numA}, not ${numB}, so it belongs only in the Factors of ${numA} circle.`;
        } else if (correctPlace === 'right') {
          text = `${num} is only a factor of ${numB}, not ${numA}, so it belongs only in the Factors of ${numB} circle.`;
        } else if (correctPlace === 'both') {
          text = `${num} is a factor of both ${numA} and ${numB}, so it must go in the shared 'Both' section.`;
        }
        setActivityPopup({
          title: 'Incorrect Placement',
          text: text,
          type: 'error'
        });
        return;
      }

      if (place === 'both') {
        const hcfVal = Math.max(...both);
        setActivityPopup({
          title: 'Common Factor Found!',
          text: `${num} is a factor of both ${numA} and ${numB}. All numbers in this middle section are common factors, and the highest of them (${hcfVal}) is the HCF!`,
          type: 'success'
        });
      }

      const next = { ...currentPlacements, [num]: place };
      setActivityState({ ...activityState, placements: next });
    };

    // Check if sorted correctly
    const isCorrect = allNums.every(n => {
      const p = currentPlacements[n];
      if (leftOnly.includes(n)) return p === 'left';
      if (rightOnly.includes(n)) return p === 'right';
      if (both.includes(n)) return p === 'both';
      return false;
    });

    const getItems = (place) => allNums.filter(n => currentPlacements[n] === place);
    const hcfVal = Math.max(...both);

    return (
      <div className="activity-box" style={{ minHeight: '380px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Fill the Venn Diagram:
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '16px' }}>
          Click the buttons inside each factor's box in the pool below to place it correctly.
          (Left circle: Factors of {numA} only. Right circle: Factors of {numB} only. Middle: Shared factors of both).
        </p>

        <div className="venn-container">
          <div className="venn-circle left">
            <div className="venn-title">Factors of {numA}</div>
            {getItems('left').map(n => (
              <span key={n} className="venn-placed-item" onClick={() => setPlacement(n, 'pool')}>{n}</span>
            ))}
          </div>

          <div className="venn-circle right">
            <div className="venn-title">Factors of {numB}</div>
            {getItems('right').map(n => (
              <span key={n} className="venn-placed-item" onClick={() => setPlacement(n, 'pool')}>{n}</span>
            ))}
          </div>

          <div className="venn-overlap">
            <div className="venn-title" style={{ top: '-16px', color: 'var(--clr-accent)' }}>Both</div>
            {getItems('both').map(n => (
              <span key={n} className="venn-placed-item both-item" onClick={() => setPlacement(n, 'pool')}>{n}</span>
            ))}
          </div>
        </div>

        {/* Pool of items */}
        <div className="venn-factors-pool">
          {getItems('pool').map(n => (
            <div key={n} className="venn-pool-box">
              <span className="venn-pool-number">{n}</span>
              <div className="venn-pool-actions">
                <button onClick={() => setPlacement(n, 'left')}>{numA}</button>
                <button onClick={() => setPlacement(n, 'both')}>Both</button>
                <button onClick={() => setPlacement(n, 'right')}>{numB}</button>
              </div>
            </div>
          ))}
        </div>

        {isCorrect && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
              🎉 Excellent! You sorted them perfectly. The HCF is {hcfVal} (the largest shared factor). Click "Next".
            </p>
          </div>
        )}
      </div>
    );
  };

  // 6. How to Find LCM Activity: Click common multiples
  const renderHowToFindLcmActivity = () => {
    const numA = activityState.numA || 3;
    const numB = activityState.numB || 4;
    const listA = activityState.listA || [3, 6, 9, 12, 15, 18, 21, 24];
    const listB = activityState.listB || [4, 8, 12, 16, 20, 24];
    const common = activityState.common || [12, 24];
    const lcmVal = activityState.lcmVal || 12;

    const selected = activityState.selectedLcmMults || [];
    const done = common.every(c => selected.includes(c)) && selected.length === common.length;

    const select = (val) => {
      if (done) return;
      if (common.includes(val)) {
        if (!selected.includes(val)) {
          setActivityState({ ...activityState, selectedLcmMults: [...selected, val] });
        }
      } else {
        let text = '';
        if (val % numA === 0 && val % numB !== 0) {
          text = `${val} is a multiple of ${numA}, but not of ${numB} (multiples of ${numB} are ${listB.join(', ')}...).`;
        } else if (val % numB === 0 && val % numA !== 0) {
          text = `${val} is a multiple of ${numB}, but not of ${numA} (multiples of ${numA} are ${listA.join(', ')}...).`;
        } else {
          text = `${val} is not a multiple of ${numA} or ${numB}.`;
        }
        setActivityPopup({
          title: 'Incorrect Selection',
          text: text,
          type: 'error'
        });
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Select the common multiples in these two lists:
        </p>
        <div style={{ textAlign: 'left', background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Multiples of {numA}:</strong>{' '}
            {listA.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <div>
            <strong>Multiples of {numB}:</strong>{' '}
            {listB.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        {done && (
          <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
            🎉 Yes! The shared multiples are {common.join(' and ')}. The Lowest Common Multiple is {lcmVal}. Click "Next".
          </p>
        )}
      </div>
    );
  };

  // 7. How to Find HCF Activity: Find HCF by selecting factors
  const renderHowToFindHcfActivity = () => {
    const numA = activityState.numA || 8;
    const numB = activityState.numB || 20;
    const factorsA = activityState.factorsA || [1, 2, 4, 8];
    const factorsB = activityState.factorsB || [1, 2, 4, 5, 10, 20];
    const common = activityState.common || [1, 2, 4];
    const hcfVal = activityState.hcfVal || 4;

    const selected = activityState.selectedHcfFacts || [];
    const done = common.every(c => selected.includes(c)) && selected.length === common.length;

    const select = (val) => {
      if (done) return;
      if (common.includes(val)) {
        if (!selected.includes(val)) {
          setActivityState({ ...activityState, selectedHcfFacts: [...selected, val] });
        }
      } else {
        const isFactA = numA % val === 0;
        const isFactB = numB % val === 0;
        let text = '';
        if (isFactA && !isFactB) {
          text = `${val} is a factor of ${numA}, but it does not divide ${numB} perfectly (${numB} ÷ ${val} leaves a remainder of ${numB % val}).`;
        } else if (isFactB && !isFactA) {
          text = `${val} is a factor of ${numB}, but it does not divide ${numA} perfectly (${numA} ÷ ${val} leaves a remainder of ${numA % val}).`;
        } else {
          text = `${val} is not a factor of ${numA} or ${numB}.`;
        }
        setActivityPopup({
          title: 'Incorrect Selection',
          text: text,
          type: 'error'
        });
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Select the common factors in these two lists:
        </p>
        <div style={{ textAlign: 'left', background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Factors of {numA}:</strong>{' '}
            {factorsA.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <div>
            <strong>Factors of {numB}:</strong>{' '}
            {factorsB.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        {done && (
          <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
            🎉 Great! The common factors are {common.join(', ')}. The Highest Common Factor is {hcfVal}. Click "Next".
          </p>
        )}
      </div>
    );
  };

  // 8. Solving Methods Activity (Dependent on Level)
  const renderSolvingMethodsActivity = () => {
    if (level === 1) {
      return (
        <div className="activity-box">
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '8px' }}>
            Level 1 Concept Recap
          </p>
          <p style={{ lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
            You've learned all the core definitions and visual methods. In Level 1, we learn HCF and LCM by listing factors and multiples. You're now ready for the Confidence Meter and Quiz!
          </p>
          <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '12px' }}>
            Click "Next" to rate your confidence.
          </p>
        </div>
      );
    }

    if (level === 2) {
      // Prime Factorization method simulation
      // Find HCF of 18 and 30.
      // 18 = 2 × 3 × 3
      // 30 = 2 × 3 × 5
      // Intersecting: 2, 3 -> HCF = 2 × 3 = 6
      const numA = activityState.numA || 18;
      const numB = activityState.numB || 30;
      const currentSelection = activityState.primePairs || []; // items: index of selected pairs
      const isDone = currentSelection.includes('2') && currentSelection.includes('3');

      const selectPair = (p) => {
        if (isDone) return;
        if (currentSelection.includes(p)) {
          setActivityState({ ...activityState, primePairs: currentSelection.filter(x => x !== p) });
        } else {
          setActivityState({ ...activityState, primePairs: [...currentSelection, p] });
        }
      };

      return (
        <div className="activity-box">
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Find the HCF of {numA} and {numB} using their Prime Factor DNA:
          </p>
          <div style={{ textAlign: 'left', background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>{numA} DNA:</strong> <span style={{ color: '#e8864a' }}>2</span> × <span style={{ color: '#a89e94' }}>3</span> × 3
            </div>
            <div>
              <strong>{numB} DNA:</strong> <span style={{ color: '#e8864a' }}>2</span> × <span style={{ color: '#a89e94' }}>3</span> × 5
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginTop: '8px', marginBottom: '12px' }}>
            Click the matching prime factors that BOTH numbers share:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => selectPair('2')}
              className={currentSelection.includes('2') ? 'btn-try-submit' : 'btn-back'}
            >
              Share '2' {currentSelection.includes('2') ? '✓' : ''}
            </button>
            <button 
              onClick={() => selectPair('3')}
              className={currentSelection.includes('3') ? 'btn-try-submit' : 'btn-back'}
            >
              Share '3' {currentSelection.includes('3') ? '✓' : ''}
            </button>
          </div>
          {isDone && (
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
              🎉 Perfect! They share 2 and 3. HCF = 2 × 3 = 6. Click "Next".
            </p>
          )}
        </div>
      );
    }

    if (level === 3) {
      // Long division steps simulation
      // Find HCF of 45 and 105.
      // 105 ÷ 45 = 2 rem 15
      // 45 ÷ 15 = 3 rem 0 -> HCF = 15
      const numA = activityState.numA || 45;
      const numB = activityState.numB || 105;
      const divisionStep = activityState.divStep || 0;

      return (
        <div className="activity-box">
          <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
            Find the HCF of {numA} and {numB} using Long Division (Euclidean Method):
          </p>
          <div style={{ background: 'var(--clr-input)', padding: '16px', borderRadius: '8px', textAlign: 'left', fontFamily: 'monospace' }}>
            <div>Step 1: Divide {numB} by {numA}</div>
            <div style={{ color: 'var(--clr-accent)' }}>{numB} = {numA} × 2 + Remainder 15</div>
            
            {divisionStep >= 1 && (
              <div style={{ marginTop: '10px' }}>
                <div>Step 2: Divide old divisor ({numA}) by new remainder (15)</div>
                <div style={{ color: 'var(--clr-correct)' }}>{numA} = 15 × 3 + Remainder 0!</div>
              </div>
            )}
          </div>

          {divisionStep === 0 && (
            <button 
              onClick={() => setActivityState({ ...activityState, divStep: 1 })}
              style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Divide Divisor by Remainder
            </button>
          )}

          {divisionStep === 1 && (
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
              🎉 Complete! Since the remainder is now 0, the last divisor, 15, is the HCF! Click "Next".
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  // Render current activity based on step
  const renderActivity = () => {
    switch (currentStep) {
      case 1: return renderPrimeActivity();
      case 2: return renderFactorsActivity();
      case 3: return renderPrimeFactorsActivity();
      case 4: return renderLcmActivity();
      case 5: return renderHcfActivity();
      case 6: return renderHowToFindLcmActivity();
      case 7: return renderHowToFindHcfActivity();
      case 8: return renderSolvingMethodsActivity();
      default: return null;
    }
  };

  // ==========================================================================
  // ADAPTIVE QUIZ GENERATION & HANDLERS
  // ==========================================================================

  const generateClientQuestion = (diff) => {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
    
    let prompt, answer, display;
    const type = randInt(1, 3);
    
    if (diff === 'easy') {
      if (type === 1) {
        const g = randInt(2, 8);
        const a = g * randInt(2, 5);
        const b = g * randInt(2, 5);
        answer = gcd(a, b);
        display = String(answer);
        prompt = `Find the HCF (Highest Common Factor) of ${a} and ${b}.`;
      } else if (type === 2) {
        const g = randInt(3, 10);
        const a = g * 2;
        const b = g * 3;
        answer = gcd(a, b);
        display = String(answer);
        prompt = `What is the Highest Common Factor (HCF) of ${a} and ${b}?`;
      } else {
        const a = randInt(3, 9);
        const b = a * randInt(2, 4);
        answer = a;
        display = String(answer);
        prompt = `Find the HCF of ${a} and ${b}.`;
      }
    } else if (diff === 'medium') {
      if (type === 1) {
        const a = randInt(4, 12);
        const b = randInt(4, 12);
        answer = lcm(a, b);
        display = String(answer);
        prompt = `Find the LCM (Lowest Common Multiple) of ${a} and ${b}.`;
      } else if (type === 2) {
        const primes = [3, 5, 7];
        const a = primes[randInt(0, 2)];
        const b = randInt(4, 8);
        answer = lcm(a, b);
        display = String(answer);
        prompt = `What is the Lowest Common Multiple (LCM) of ${a} and ${b}?`;
      } else {
        const g = randInt(4, 15);
        const a = g * randInt(2, 5);
        const b = g * randInt(2, 5);
        answer = gcd(a, b);
        display = String(answer);
        prompt = `Find the Highest Common Factor (HCF) of ${a} and ${b}.`;
      }
    } else if (diff === 'hard') {
      if (type === 1) {
        const a = randInt(3, 8);
        const b = randInt(3, 8);
        const c = randInt(3, 8);
        answer = lcm(lcm(a, b), c);
        display = String(answer);
        prompt = `Find the LCM of ${a}, ${b}, and ${c}.`;
      } else if (type === 2) {
        const base = [
          { h: 4, l: 24, a: 8, b: 12 },
          { h: 6, l: 36, a: 12, b: 18 },
          { h: 5, l: 30, a: 10, b: 15 },
          { h: 3, l: 18, a: 6, b: 9 }
        ][randInt(0, 3)];
        answer = base.b;
        display = String(answer);
        prompt = `The HCF of two numbers is ${base.h} and their LCM is ${base.l}. If one of the numbers is ${base.a}, what is the other number?`;
      } else {
        const g = randInt(3, 10);
        const a = g * 2;
        const b = g * 3;
        const c = g * 5;
        answer = g;
        display = String(answer);
        prompt = `Find the Highest Common Factor (HCF) of ${a}, ${b}, and ${c}.`;
      }
    } else { // extrahard
      if (type === 1) {
        const a = randInt(6, 12);
        const b = randInt(8, 15);
        answer = lcm(a, b);
        display = String(answer);
        prompt = `Two neon signs blink at different rates. Sign A blinks every ${a} seconds, and Sign B blinks every ${b} seconds. If they both blink together now, after how many seconds will they next blink together?`;
      } else if (type === 2) {
        const a = [24, 36, 48][randInt(0, 2)];
        const b = [30, 45, 60][randInt(0, 2)];
        answer = gcd(a, b);
        display = String(answer);
        prompt = `A florist has ${a} roses and ${b} tulips. She wants to create identical bouquets with the same number of flowers of each kind, using all flowers. What is the maximum number of bouquets she can make?`;
      } else {
        const a = randInt(4, 9);
        const b = randInt(5, 10);
        answer = lcm(a, b);
        display = String(answer);
        prompt = `Three bells toll at intervals of ${a}, ${b}, and ${a+b} minutes. If they toll together now, after how many minutes will they next toll together?`;
      }
    }
    
    return { q: prompt, a: String(answer), display, difficulty: diff, originalAnswer: answer };
  };

  const startQuiz = async (chosenConfidence) => {
    const activeConfidence = chosenConfidence || confidence || 'mod';
    setConfidence(activeConfidence);
    setCurrentStep(10);
    setQuizQuestions([]);
    setQuizFinished(false);
    setQuizHistory([]);
    setQuizScore(0);
    setQuizIndex(0);
    setQuizAnswer('');
    setQuizFeedback(null);
    
    let diffs = [];
    if (level === 1) {
      if (activeConfidence === 'not') {
        diffs = ['easy', 'easy', 'easy', 'easy', 'easy'];
      } else if (activeConfidence === 'mod') {
        diffs = ['easy', 'easy', 'medium', 'easy', 'medium'];
      } else {
        diffs = ['easy', 'medium', 'medium', 'medium', 'medium'];
      }
    } else if (level === 2) {
      if (activeConfidence === 'not') {
        diffs = ['easy', 'medium', 'easy', 'medium', 'medium'];
      } else if (activeConfidence === 'mod') {
        diffs = ['easy', 'medium', 'medium', 'hard', 'medium'];
      } else {
        diffs = ['medium', 'medium', 'hard', 'hard', 'hard'];
      }
    } else { // Level 3
      if (activeConfidence === 'not') {
        diffs = ['easy', 'medium', 'medium', 'hard', 'hard'];
      } else if (activeConfidence === 'mod') {
        diffs = ['medium', 'hard', 'hard', 'extrahard', 'extrahard'];
      } else {
        diffs = ['hard', 'hard', 'extrahard', 'extrahard', 'extrahard'];
      }
    }
    
    try {
      const fetchedQs = await Promise.all(diffs.map(async (diff) => {
        const res = await fetch(`/hcflcm-api/question?difficulty=${diff}`);
        if (!res.ok) throw new Error('Failed to fetch question');
        const qdata = await res.json();
        return {
          q: qdata.prompt,
          a: String(qdata.answer),
          display: qdata.display,
          difficulty: qdata.difficulty,
          originalAnswer: qdata.answer
        };
      }));

      setQuizQuestions(fetchedQs);
    } catch (e) {
      console.error("Failed to load quiz from backend, generating client-side: ", e);
      const fallbackQs = diffs.map((diff) => generateClientQuestion(diff));
      setQuizQuestions(fallbackQs);
    }
  };

  const handleQuizSubmit = async (e) => {
    if (e) e.preventDefault();
    if (quizFeedback) return;

    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return;

    try {
      const res = await fetch('/hcflcm-api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer: quizAnswer,
          answer: currentQ.originalAnswer,
          display: currentQ.display,
          prompt: currentQ.q,
          difficulty: currentQ.difficulty,
          solve: true
        })
      });
      if (!res.ok) throw new Error('Check request failed');
      const data = await res.json();
      
      const isCorrect = data.correct;
      const explanation = data.explanation || `The correct answer is: ${data.display || currentQ.display}.`;

      if (isCorrect) {
        setQuizScore(s => s + 1);
        setQuizFeedback({ correct: true, display: `Correct! ${explanation}` });
      } else {
        setQuizFeedback({ correct: false, display: `Incorrect. ${explanation}` });
      }

      setQuizHistory(prev => [...prev, {
        question: currentQ.q,
        userAnswer: quizAnswer,
        correctAnswer: data.display || currentQ.display,
        correct: isCorrect,
        difficulty: currentQ.difficulty
      }]);
    } catch (err) {
      console.error(err);
      const cleanUser = quizAnswer.trim().replace(/[^\d]/g, '');
      const cleanCorrect = currentQ.a.trim().replace(/[^\d]/g, '');
      const isCorrect = cleanUser === cleanCorrect;
      
      if (isCorrect) {
        setQuizScore(s => s + 1);
        setQuizFeedback({ correct: true, display: `Correct!` });
      } else {
        setQuizFeedback({ correct: false, display: `Incorrect. The correct answer is: ${currentQ.display}` });
      }

      setQuizHistory(prev => [...prev, {
        question: currentQ.q,
        userAnswer: quizAnswer,
        correctAnswer: currentQ.display,
        correct: isCorrect,
        difficulty: currentQ.difficulty
      }]);
    }
  };

  const nextQuizQuestion = () => {
    setQuizAnswer('');
    setQuizFeedback(null);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(idx => idx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // ==========================================================================
  // CONFIDENCE METER & MODAL LOGIC
  // ==========================================================================

  const handleConfidenceSelect = (rating) => {
    setConfidence(rating);
    startQuiz(rating);
  };

  // ==========================================================================
  // VIEW RENDERING
  // ==========================================================================

  // Step 0: Welcome and Age Group Selection
  const renderAgeSelect = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '8px' }}>
          LCM & HCF Learning Quest
        </h2>
        <p style={{ color: 'var(--clr-text-soft)', marginBottom: '24px' }}>
          Embark on an age-adaptive mathematics journey. Select your level to begin!
        </p>

        <div className="age-select-grid">
          <div className="age-card level-1" onClick={() => { setLevel(1); setCurrentStep(1); }}>
            <span className="age-emoji">🦁</span>
            <span className="age-title">Age 10–12 Years</span>
            <p className="age-desc">
              Visual flashcards, drag-and-drop games, and easy questions. Very basic illustrations.
            </p>
            <span className="age-badge">Level 1</span>
          </div>

          <div className="age-card level-2" onClick={() => { setLevel(2); setCurrentStep(1); }}>
            <span className="age-emoji">🚀</span>
            <span className="age-title">Age 12–14 Years</span>
            <p className="age-desc">
              Moderate detail, visual concepts, and introduction to the Prime Factorization Method.
            </p>
            <span className="age-badge">Level 2</span>
          </div>

          <div className="age-card level-3" onClick={() => { setLevel(3); setCurrentStep(1); }}>
            <span className="age-emoji">💎</span>
            <span className="age-title">Age 14–16+ Years</span>
            <p className="age-desc">
              Deep reasoning, visual proofs, Prime Factorization, and the Long Division Method.
            </p>
            <span className="age-badge">Level 3</span>
          </div>
        </div>

        <button 
          onClick={onBack}
          style={{ 
            background: 'transparent', 
            borderColor: 'var(--clr-border)', 
            color: 'var(--clr-text)', 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Back to Main Menu
        </button>
      </div>
    );
  };

  // Step 1 to 8: Core Concept Slides
  const renderConceptSlide = () => {
    // Concept meta mappings
    const conceptTitles = [
      '', // 0 is start
      'Prime Numbers',
      'Factors',
      'Prime Factors',
      'LCM (Lowest Common Multiple)',
      'HCF (Highest Common Factor)',
      'How to Find LCM',
      'How to Find HCF',
      'Solving Methods'
    ];

    const slideMeta = [
      { tag: 'Flashcard', label: 'Definition' },
      { tag: 'Animation', label: 'Demonstration' },
      { tag: 'Activity', label: 'Try It Yourself' },
      { tag: 'Explanation', label: 'Summary & Curiosity Check' }
    ];

    const title = conceptTitles[currentStep];

    const renderFlashcard = (title, descContent, examplesContent) => {
      const isRevealed = !!revealedExamples[currentStep];
      return (
        <div className="flashcard">
          <div className="flashcard-main-word">{title}</div>
          <p className="flashcard-desc">
            {descContent}
          </p>
          
          <div className="collapsible-example-container">
            <button 
              className="collapsible-example-header" 
              onClick={() => setRevealedExamples(prev => ({ ...prev, [currentStep]: !prev[currentStep] }))}
              aria-expanded={isRevealed}
            >
              <span>Explanation & Examples</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                className={`dropdown-arrow-icon ${isRevealed ? 'open' : ''}`}
                style={{ display: 'block' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isRevealed && (
              <div className="collapsible-example-content slide-down">
                {examplesContent}
              </div>
            )}
          </div>
        </div>
      );
    };

    // Helper slides definitions
    const getSlideContent = () => {
      if (currentSlide === 0) {
        // Slide 0: Flashcard
        switch (currentStep) {
          case 1:
            return renderFlashcard(
              'Prime Numbers',
              <span>A <strong>Prime Number</strong> is a special number greater than 1 that can <strong>only</strong> be divided by 1 and itself!</span>,
              <>Examples: 2, 3, 5, 7, 11, 13, 17...</>
            );
          case 2:
            return renderFlashcard(
              'Factors',
              <span>A <strong>Factor</strong> is a number that divides another number completely, leaving <strong>zero remainder</strong>!</span>,
              <>Factors of 6: 1, 2, 3, and 6 (since 1×6 = 6, 2×3 = 6)</>
            );
          case 3:
            return renderFlashcard(
              'Prime Factors',
              <span><strong>Prime Factors</strong> are the factors of a number that are also <strong>prime numbers</strong>. They are the building block DNA of that number!</span>,
              <>Factors of 12: 1, 2, 3, 4, 6, 12.<br/>Prime Factors of 12: 2 and 3!</>
            );
          case 4:
            return renderFlashcard(
              'LCM',
              <span><strong>Lowest Common Multiple (LCM)</strong> is the smallest multiple shared by two or more numbers. It's their first common landing point!</span>,
              <>Multiples of 3: 3, 6, 9, 12, 15...<br/>Multiples of 4: 4, 8, 12, 16...<br/>LCM of 3 and 4 = 12!</>
            );
          case 5:
            return renderFlashcard(
              'HCF',
              <span><strong>Highest Common Factor (HCF)</strong> is the largest factor shared by two or more numbers. It is the biggest equal group size you can divide things into!</span>,
              <>Factors of 8: 1, 2, 4, 8.<br/>Factors of 12: 1, 2, 3, 4, 6, 12.<br/>HCF of 8 and 12 = 4!</>
            );
          case 6:
            return renderFlashcard(
              'How to Find LCM',
              <span>To find the LCM, you list the multiples of each number until you find the first one they both share.</span>,
              <>LCM of 2 and 3:<br/>2: 2, 4, 6, 8, 10...<br/>3: 3, 6, 9, 12...<br/>They both share 6!</>
            );
          case 7:
            return renderFlashcard(
              'How to Find HCF',
              <span>To find the HCF, you list all factors of both numbers, identify the ones they share, and select the highest one.</span>,
              <>HCF of 9 and 15:<br/>9: 1, 3, 9<br/>15: 1, 3, 5, 15<br/>Shared factors: 1 and 3. Highest is 3!</>
            );
          case 8:
            return renderFlashcard(
              level === 1 ? 'Concept Summary' : level === 2 ? 'Prime Factorization' : 'Long Division & Primes',
              <span>
                {level === 1 
                  ? 'Great! You have mastered the fundamentals of HCF and LCM. Ready to test your confidence?'
                  : level === 2 
                    ? 'The Prime Factorization Method uses the prime DNA of numbers to find HCF (common powers) and LCM (highest powers) systematically!'
                    : 'The Long Division Method divides the larger number by the smaller recursively. The final non-zero remainder is the HCF!'}
              </span>,
              level === 1 
                ? <>Prime Numbers, Factors, Prime Factors, LCM, HCF.</>
                : level === 2
                  ? <>12 = 2² × 3, 18 = 2 × 3² → HCF = 2 × 3 = 6.</>
                  : <>HCF of 45 and 60: 60 ÷ 45 = 1 rem 15. 45 ÷ 15 = 3 rem 0. HCF = 15.</>
            );
          default:
            return null;
        }
      }

      if (currentSlide === 1) {
        // Slide 1: Animation / Visual Demonstration
        switch (currentStep) {
          case 1:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Divisibility Animation</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  A Prime number is like a solid block that can't be sliced into equal rows. 
                  For example, 7 blocks cannot be grouped into equal smaller blocks (e.g. groups of 2 leaves 1 left over).
                  But 6 blocks can be arranged in a perfect grid of 2 × 3!
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 24px)', gap: '4px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ width: '24px', height: '24px', background: 'var(--clr-accent)', borderRadius: '4px' }} />
                    ))}
                  </div>
                  <div style={{ borderLeft: '2px dashed var(--clr-border)', paddingLeft: '20px', marginLeft: '20px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '100px' }}>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} style={{ width: '24px', height: '24px', background: 'var(--clr-text-soft)', borderRadius: '4px' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                  Left: 6 (Composite, splits into 2x3 rows). Right: 7 (Prime, irregular, can't be split equally!)
                </p>
              </div>
            );
          case 2:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Factor Pairs Alignment</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  Think of factors as matching pairs. Multiplying a pair of factors gives the target number.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="age-badge">1 × 12 = 12</span>
                    <span className="age-badge">2 × 6 = 12</span>
                    <span className="age-badge">3 × 4 = 12</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    {[1, 2, 3, 4, 6, 12].map(n => (
                      <div key={n} style={{ width: '32px', height: '32px', border: '1px solid var(--clr-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          case 3:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Prime Factor DNA tree</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  We break composite numbers down step-by-step. If a node is a composite, it splits. If it is prime, it stops!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                  <div className="tree-node-circle">{getAdaptiveNumber('prime_factors')}</div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="tree-node-circle prime">2</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="tree-node-circle">{getAdaptiveNumber('prime_factors') / 2}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          case 4:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>LCM Cycle Alignment</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Two gears of size {getAdaptiveNumber('lcm_pair')[0]} and {getAdaptiveNumber('lcm_pair')[1]} teeth rotate. They align again when they have rotated a distance equal to the LCM!
                </p>
                <div style={{ margin: '20px 0', fontSize: '2.5rem' }}>
                  ⚙️ ⚙️
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--clr-accent)' }}>
                  LCM({getAdaptiveNumber('lcm_pair')[0]}, {getAdaptiveNumber('lcm_pair')[1]}) = {lcm(getAdaptiveNumber('lcm_pair')[0], getAdaptiveNumber('lcm_pair')[1])}
                </p>
              </div>
            );
          case 5:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>HCF Tile Division</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  If you have a grid of size {getAdaptiveNumber('hcf_pair')[0]} × {getAdaptiveNumber('hcf_pair')[1]} blocks, what is the largest square tile size that can cover the grid perfectly?
                </p>
                <p style={{ fontWeight: 'bold', color: 'var(--clr-accent)', margin: '16px 0', fontSize: '1.1rem' }}>
                  HCF({getAdaptiveNumber('hcf_pair')[0]}, {getAdaptiveNumber('hcf_pair')[1]}) = {gcd(getAdaptiveNumber('hcf_pair')[0], getAdaptiveNumber('hcf_pair')[1])}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                  Tiles of size {gcd(getAdaptiveNumber('hcf_pair')[0], getAdaptiveNumber('hcf_pair')[1])} fit perfectly across both sides!
                </p>
              </div>
            );
          case 6:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Listing Multiples Method</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Simply multiply the number by 1, 2, 3, 4, 5... and write them down. 
                </p>
                <div style={{ background: 'var(--clr-input)', padding: '12px', borderRadius: '8px', margin: '16px 0', textAlign: 'left', fontFamily: 'monospace' }}>
                  <div>Multiples of 5: 5, 10, 15, <strong>20</strong>, 25, 30...</div>
                  <div>Multiples of 4: 4, 8, 12, 16, <strong>20</strong>, 24...</div>
                </div>
                <p style={{ fontSize: '0.9rem' }}>LCM(5, 4) = 20</p>
              </div>
            );
          case 7:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Listing Factors Method</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Write down all factors of each number. Circle the ones that appear in both lists.
                </p>
                <div style={{ background: 'var(--clr-input)', padding: '12px', borderRadius: '8px', margin: '16px 0', textAlign: 'left', fontFamily: 'monospace' }}>
                  <div>Factors of 12: <strong>1</strong>, <strong>2</strong>, 3, <strong>4</strong>, 6, 12</div>
                  <div>Factors of 16: <strong>1</strong>, <strong>2</strong>, <strong>4</strong>, 8, 16</div>
                </div>
                <p style={{ fontSize: '0.9rem' }}>Common Factors: 1, 2, 4. HCF(12, 16) = 4</p>
              </div>
            );
          case 8:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Method Demonstration</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {level === 1 
                    ? 'In Level 1, we focus on listing. It is simple, concrete, and perfect for getting started!'
                    : level === 2
                      ? 'Prime factorization lets you align prime bases and find common elements instantly!'
                      : 'Division method: divide larger by smaller, then divide divisor by remainder, repeating until remainder is zero.'}
                </p>
                <div style={{ margin: '16px 0', padding: '12px', background: 'var(--clr-input)', borderRadius: '8px', fontFamily: 'monospace' }}>
                  {level === 1 
                    ? 'Listing: 2, 4, 6, 8 vs 3, 6, 9'
                    : level === 2
                      ? '24 = 2³ × 3\n36 = 2² × 3²\nHCF = 2² × 3 = 12'
                      : 'HCF(54, 96):\n96 = 54 × 1 + 42\n54 = 42 × 1 + 12\n42 = 12 × 3 + 6\n12 = 6 × 2 + 0\nHCF = 6'}
                </div>
              </div>
            );
          default:
            return null;
        }
      }

      if (currentSlide === 2) {
        // Slide 2: Interactive Activity
        return renderActivity();
      }

      if (currentSlide === 3) {
        // Slide 3: Summary + Glowing Why Button
        return (
          <div style={{ width: '100%' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '1.15rem' }}>
              Concept Checkpoint
            </p>
            <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5', marginBottom: '24px' }}>
              Awesome job! Ready for a challenge? Click the glowing bulb below to explore "Why?" this concept matters and solve a quick puzzle to earn a reward!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <button className="why-bulb-btn" onClick={() => setWhyOpen(true)}>
                <span className="why-bulb-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                  </svg>
                </span>
                <span>Why?</span>
              </button>
            </div>

            {isCurrentCollectibleUnlocked() ? (
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ★ You have unlocked the collectible for this concept!
              </p>
            ) : (
              <p style={{ color: 'var(--clr-accent)', fontWeight: '500', fontSize: '0.85rem' }}>
                Bulb is glowing! Click "Why?" to unlock your level collectible.
              </p>
            )}
          </div>
        );
      }

      return null;
    };

    return (
      <div className="concept-viewport">
        <div className="slide-wrapper">
          <div className="slide-header">
            <span className="concept-title">{title}</span>
            <span className="slide-tag">{slideMeta[currentSlide].tag}</span>
          </div>

          <div className="slide-content">
            {getSlideContent()}
          </div>
        </div>

        {currentSlide === 2 && !isActivityCompleted(currentStep) && (
          <p style={{ color: 'var(--clr-accent)', fontSize: '0.85rem', marginTop: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            🔒 Complete the activity correctly to unlock the next section!
          </p>
        )}

        {/* Navigation buttons inside concepts */}
        <div className="nav-row">
          <button 
            className="btn-back"
            onClick={() => {
              if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            ⬅ Previous
          </button>
          
          <button 
            className="btn-next"
            disabled={currentSlide === 2 && !isActivityCompleted(currentStep)}
            onClick={() => {
              if (currentSlide < 3) {
                setCurrentSlide(currentSlide + 1);
              } else {
                // If Level 1, we skip step 8 (Solving Methods). So from 7 we go to 9
                if (level === 1 && currentStep === 7) {
                  setCurrentStep(9); // go to confidence
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }
            }}
            style={currentSlide === 2 && !isActivityCompleted(currentStep) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            title={currentSlide === 2 && !isActivityCompleted(currentStep) ? "Complete the activity first!" : ""}
          >
            ➡ Next
          </button>
        </div>
      </div>
    );
  };

  // Step 9: Confidence Meter (Gamified Learning Levels selection)
  const renderConfidenceMeter = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 className="confidence-prompt">Choose your Quiz Challenge Level!</h2>
        <p style={{ color: 'var(--clr-text-soft)', marginBottom: '24px' }}>
          Complete each level to unlock the next one!
        </p>

        <div className="confidence-row">
          {/* Explorer Card */}
          <div className="confidence-card level-explorer" onClick={() => handleConfidenceSelect('not')}>
            <span className="confidence-emoji">📘</span>
            <span className="confidence-label">LCM & HCF Explorer</span>
            <span className="confidence-subtitle">"Begin the journey"</span>
          </div>

          {/* Scholar Card (Champion) */}
          <div 
            className={`confidence-card level-champion ${!unlockedQuizLevels.champion ? 'locked' : ''}`} 
            onClick={() => {
              if (unlockedQuizLevels.champion) {
                handleConfidenceSelect('mod');
              }
            }}
          >
            <span className="confidence-emoji">{unlockedQuizLevels.champion ? '📗' : '🔒'}</span>
            <span className="confidence-label">LCM & HCF Scholar</span>
            <span className="confidence-subtitle">"You've learned the concepts well"</span>
            {!unlockedQuizLevels.champion && <span className="lock-text">Score 4/5 in Explorer to Unlock</span>}
          </div>

          {/* Master Card */}
          <div 
            className={`confidence-card level-master ${!unlockedQuizLevels.master ? 'locked' : ''}`} 
            onClick={() => {
              if (unlockedQuizLevels.master) {
                handleConfidenceSelect('very');
              }
            }}
          >
            <span className="confidence-emoji">{unlockedQuizLevels.master ? '👑' : '🔒'}</span>
            <span className="confidence-label">LCM & HCF Master</span>
            <span className="confidence-subtitle">"You've mastered LCM & HCF!"</span>
            {!unlockedQuizLevels.master && <span className="lock-text">Score 3/5 in Scholar to Unlock</span>}
          </div>
        </div>

        <button 
          className="btn-back"
          onClick={() => {
            // Level 1 skips step 8 (Solving Methods), so goes back to 7
            setCurrentStep(level === 1 ? 7 : 8);
          }}
          style={{ marginTop: '24px' }}
        >
          ⬅ Back to Explanations
        </button>
      </div>
    );
  };

  // Step 10: Quiz Screen
  const getTopicForQuestion = (q, difficulty) => {
    const text = q.toLowerCase();
    if (text.includes('prime factor')) {
      return { name: 'Prime Factors (Step 3)', step: 3 };
    }
    if (text.includes('prime')) {
      return { name: 'Prime Numbers (Step 1)', step: 1 };
    }
    if (text.includes('how many factors') || text.includes('list factors')) {
      return { name: 'Factors (Step 2)', step: 2 };
    }
    if (text.includes('hcf') || text.includes('highest common factor') || text.includes('highest common divisor')) {
      return { name: 'Highest Common Factor (Step 5)', step: 5 };
    }
    if (text.includes('lcm') || text.includes('lowest common multiple') || text.includes('bus') || text.includes('bell')) {
      return { name: 'Lowest Common Multiple (Step 4)', step: 4 };
    }
    if (difficulty === 'easy') {
      return { name: 'Factors & HCF (Step 2 & 5)', step: 5 };
    } else {
      return { name: 'Multiples & LCM (Step 4 & 6)', step: 4 };
    }
  };

  // Step 10: Quiz Screen
  const renderQuiz = () => {
    if (quizFinished) {
      const incorrectTopicsMap = {};
      quizHistory.forEach((item) => {
        if (!item.correct) {
          const topic = getTopicForQuestion(item.question, item.difficulty);
          incorrectTopicsMap[topic.step] = topic.name;
        }
      });

      const isExplorer = confidence === 'not';
      const isChampion = confidence === 'mod';
      const isMaster = confidence === 'very';

      const explorerPassed = quizScore >= 4;
      const championPassed = quizScore >= 3;

      return (
        <div className="quiz-results-summary">
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
            {isMaster && quizScore === 5 ? '🏆 Mastery Achieved!' : 'Quiz Results'}
          </h2>
          
          <div className="quiz-score-circle">
            <span className="score-num">{quizScore}</span>
            <span className="score-total">/ 5 correct</span>
          </div>

          {/* Motivational Messages and Completion Status */}
          <div className="quiz-motivational-message" style={{ marginBottom: '20px', maxWidth: '450px' }}>
            {isExplorer && !explorerPassed && (
              <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--clr-accent)' }}>
                Don't worry! 🌟<br />
                Retry this module—you can do it!
              </p>
            )}
            {isExplorer && explorerPassed && (
              <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--clr-correct)' }}>
                Awesome job! 🎉 You have unlocked the LCM & HCF Scholar level!
              </p>
            )}
            {isChampion && !championPassed && (
              <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--clr-accent)' }}>
                Great effort! 🌟<br />
                Practice once more and you'll become an LCM & HCF Master!
              </p>
            )}
            {isChampion && championPassed && (
              <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--clr-correct)' }}>
                Excellent! 🎉 You're ready for the final challenge: LCM & HCF Master!
              </p>
            )}
            {isMaster && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--clr-correct)' }}>
                  🎉 Congratulations!
                </p>
                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', margin: '8px 0' }}>
                  You have successfully completed the LCM & HCF learning journey!
                </p>
                <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--clr-accent)' }}>
                  Keep practicing to become a Number Genius!
                </p>
              </div>
            )}
          </div>

          <div className="results-list">
            {quizHistory.map((item, i) => (
              <div key={i} className={`result-item ${item.correct ? 'correct' : 'incorrect'}`}>
                <div className="result-prompt">
                  <strong>Q{i+1}:</strong> {item.question}
                </div>
                <div className="result-details">
                  Your answer: <strong>{item.userAnswer}</strong><br/>
                  Correct: <strong>{item.correctAnswer}</strong>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(incorrectTopicsMap).length > 0 && (
            <div className="revision-suggestion-box" style={{ width: '100%', marginTop: '20px', padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'var(--clr-accent)', fontSize: '1.1rem' }}>Revise specific mistakes:</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '12px' }}>
                We noticed you made mistakes in the following areas. Click on a topic below to practice it again:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(incorrectTopicsMap).map(([stepStr, name]) => {
                  const stepNum = parseInt(stepStr);
                  return (
                    <button 
                      key={stepStr}
                      className="btn-revise-go" 
                      onClick={() => {
                        setCurrentStep(stepNum);
                        setCurrentSlide(0);
                      }}
                      style={{ padding: '8px 16px', background: 'var(--clr-accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Revise {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center', width: '100%' }}>
            {isExplorer ? (
              !explorerPassed ? (
                <button className="quiz-btn-submit" style={{ maxWidth: '200px' }} onClick={() => startQuiz('not')}>🔄 Retry Quiz</button>
              ) : (
                <button className="quiz-btn-submit" style={{ maxWidth: '280px', background: 'var(--clr-correct)' }} onClick={() => { setConfidence('mod'); startQuiz('mod'); }}>
                  ➡ Continue to LCM & HCF Scholar
                </button>
              )
            ) : isChampion ? (
              !championPassed ? (
                <button className="quiz-btn-submit" style={{ maxWidth: '200px' }} onClick={() => startQuiz('mod')}>🔄 Retry Quiz</button>
              ) : (
                <button className="quiz-btn-submit" style={{ maxWidth: '280px', background: 'var(--clr-correct)' }} onClick={() => { setConfidence('very'); startQuiz('very'); }}>
                  ➡ Continue to LCM & HCF Master
                </button>
              )
            ) : (
              <>
                <button className="btn-back" onClick={() => startQuiz('very')}>🔄 Retry Master Quiz</button>
                <button className="btn-next" onClick={() => setCurrentStep(11)}>View Rewards Bank ➡</button>
              </>
            )}
          </div>
        </div>
      );
    }

    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return <p>Loading quiz questions...</p>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="quiz-main-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
            <span>HCF & LCM Quiz</span>
            <span>Question {quizIndex + 1} of 5</span>
          </div>

          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((quizIndex) / 5) * 100}%` }}></div>
          </div>

          <p className="quiz-question-text">{currentQ.q}</p>

          <form onSubmit={handleQuizSubmit} className="quiz-input-row">
            <input 
              type="text" 
              className="quiz-input"
              value={quizAnswer}
              onChange={e => { if (!quizFeedback) setQuizAnswer(e.target.value); }}
              placeholder="Type your numeric answer..."
              disabled={!!quizFeedback}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !quizFeedback) handleQuizSubmit(); }}
            />
            
            {!quizFeedback ? (
              <button type="submit" className="quiz-btn-submit">Submit Answer</button>
            ) : (
              <div style={{ width: '100%' }}>
                <div className={`quiz-feedback-box ${quizFeedback.correct ? 'correct' : 'incorrect'}`}>
                  {quizFeedback.display}
                </div>
                <button type="button" className="quiz-btn-next" onClick={nextQuizQuestion}>
                  {quizIndex < 4 ? 'Next Question ➡' : 'Show Summary ➡'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  };

  // Step 11: Collectibles Reward Bank
  const renderCollectiblesBank = () => {
    const theme = COLLECTIBLE_THEMES[level];
    
    const collectiblesList = theme.items.map((item, idx) => {
      const stepMapping = idx + 1; 
      const isUnlocked = !!unlockedCollectibles[`${level}_${stepMapping}`];

      return {
        ...item,
        isUnlocked
      };
    });

    let totalWhyCompleted = 0;
    const maxWhyPossible = level === 1 ? 7 : 8;
    for (let s = 1; s <= 8; s++) {
      if (unlockedCollectibles[`${level}_${s}`]) {
        totalWhyCompleted++;
      }
    }

    const completionPercent = Math.round((totalWhyCompleted / maxWhyPossible) * 100);

    const badges = [
      { name: 'Lion Badge', icon: '🦁', threshold: 3, desc: 'Complete 3 Why challenges!' },
      { name: 'Dolphin Badge', icon: '🐬', threshold: 5, desc: 'Complete 5 Why challenges!' },
      { name: 'Koala Badge', icon: '🐨', threshold: 6, desc: 'Complete 6 Why challenges!' },
      { name: 'Owl Badge', icon: '🦉', threshold: 7, desc: 'Complete 7 Why challenges!' },
      { name: 'Cosmic Master', icon: '🏆', threshold: maxWhyPossible, desc: `Complete all ${maxWhyPossible} Why challenges!` }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="collectibles-bank">
          <div className="bank-header">
            <h2 className="bank-title">{theme.name} Reward Bank</h2>
            <div className="bank-progress-info">
              <span>Why Challenges: {totalWhyCompleted} / {maxWhyPossible} completed</span>
              <span>{completionPercent}% Complete</span>
            </div>
            <div className="quiz-progress-bar" style={{ marginTop: '8px' }}>
              <div className="quiz-progress-fill" style={{ width: `${completionPercent}%`, background: 'var(--clr-correct)' }}></div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '16px', textAlign: 'center' }}>
            Unlock level collectibles and unlock premium badges by completing the Try-It-Out questions inside the lesson "Why?" bulbs!
          </p>

          <h3 style={{ margin: '16px 0 10px 0', fontSize: '1rem', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)' }}>Collectibles Unlocked</h3>
          <div className="collectibles-grid">
            {collectiblesList.map(item => (
              <div key={item.id} className={`collectible-slot ${item.isUnlocked ? 'unlocked' : 'locked'}`} title={item.isUnlocked ? item.desc : 'Locked'}>
                <span className="collectible-emoji">{item.emoji}</span>
                <span className="collectible-name">{item.name}</span>
                {!item.isUnlocked && <span className="collectible-lock">🔒</span>}
              </div>
            ))}
          </div>

          <h3 style={{ margin: '24px 0 10px 0', fontSize: '1rem', color: 'var(--clr-accent)', fontFamily: 'var(--font-display)' }}>Badges Earned</h3>
          <div className="badges-grid">
            {badges.map((b, idx) => {
              const isUnlocked = totalWhyCompleted >= b.threshold;
              return (
                <div key={idx} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <span className="badge-icon">{b.icon}</span>
                  <span className="badge-name">{b.name}</span>
                  <span className="badge-desc">{b.desc}</span>
                  {isUnlocked ? (
                    <span className="badge-status-label unlocked">✓ Unlocked</span>
                  ) : (
                    <span className="badge-status-label locked">🔒 Locked</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button className="btn-back" onClick={() => { setLevel(null); setCurrentStep(0); }}>
              Select Another Age Group
            </button>
            <button className="btn-next" onClick={onBack}>
              Finish Module
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render navigation header
  const renderHeader = () => {
    if (currentStep === 0 || currentStep === 10 || currentStep === 11) return null;

    return (
      <div>
        <div className="lcmhcf-header">
          <div className="level-indicator">
            <span>Level {level}:</span>
            <span className="age-badge">
              {level === 1 ? 'Age 10–12' : level === 2 ? 'Age 12–14' : 'Age 14–16+'}
            </span>
          </div>
          <button 
            onClick={() => { setLevel(null); setCurrentStep(0); }}
            style={{ padding: '6px 12px', background: 'transparent', borderColor: 'var(--clr-border)', color: 'var(--clr-text)', cursor: 'pointer', borderRadius: '6px' }}
          >
            Change Level
          </button>
        </div>

        {/* Stepper circles */}
        <div className="stepper-container">
          {STEPS_META.slice(1, 11).map((step, idx) => {
            const stepNum = idx + 1;
            // Level 1 skips step 8 (Solving Methods), hide it
            if (level === 1 && step.id === 'methods') return null;

            let className = 'step-node';
            if (currentStep === stepNum) className += ' active';
            else if (currentStep > stepNum) className += ' completed';

            const isLocked = stepNum > maxStepReached;
            if (isLocked) className += ' locked';

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={className} 
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentStep(stepNum);
                      setCurrentSlide(0);
                    }
                  }} 
                  title={step.label}
                >
                  {isLocked ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : stepNum}
                </div>
                {idx < 9 && !(level === 1 && stepNum === 7) && (
                  <div className={`step-line ${(currentStep > stepNum || maxStepReached > stepNum) ? 'completed' : ''}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Sliding Why panel
  const renderWhyPanel = () => {
    const data = getWhyData(currentStep);
    if (!data) return null;

    const isUnlocked = isCurrentCollectibleUnlocked();

    return (
      <>
        <div className={`why-overlay ${whyOpen ? 'open' : ''}`} onClick={() => setWhyOpen(false)}></div>
        <div className={`why-drawer ${whyOpen ? 'open' : ''}`}>
          <div className="why-drawer-header">
            <h3 className="why-drawer-title">{data.title}</h3>
            <button className="why-drawer-close" onClick={() => setWhyOpen(false)} aria-label="Close why panel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="why-section">
            <h4 className="why-section-title">The "Why" Behind the Concept</h4>
            <p className="why-section-content">{data.explanation}</p>
          </div>

          <div className="why-section try-it-out-box">
            <h4 className="why-section-title" style={{ color: 'var(--clr-accent)', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <span>Try-It-Out Challenge</span>
            </h4>
            <p className="try-question">{data.question}</p>

            {data.options ? (
              // Multiple choice
              <div className="try-options-grid">
                {data.options.map(opt => (
                  <button 
                    key={opt}
                    type="button"
                    className={`try-option-btn ${whyAnswer === opt ? 'selected' : ''}`}
                    onClick={() => { if (!isUnlocked) setWhyAnswer(opt); }}
                    disabled={isUnlocked}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              // Number/Text Input
              <input 
                type="text"
                className="try-input"
                value={whyAnswer}
                onChange={e => { if (!isUnlocked) setWhyAnswer(e.target.value); }}
                placeholder={data.inputPlaceholder || 'Type answer...'}
                disabled={isUnlocked}
              />
            )}

            {!isUnlocked ? (
              <div className="try-actions">
                <button className="btn-try-submit" onClick={handleWhySubmit}>Submit Answer</button>
              </div>
            ) : (
              <div className="try-feedback correct">
                ★ Solved! You collected the Reward for this lesson! Check it out in the Rewards tab at the end of the module.
              </div>
            )}

            {whyFeedback && !isUnlocked && (
              <div className={`try-feedback ${whyFeedback.correct ? 'correct' : 'incorrect'}`}>
                {whyFeedback.text}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="lcmhcf-container">
      {renderHeader()}

      <div style={{ flexGrow: 1, marginTop: '20px' }}>
        {currentStep === 0 && renderAgeSelect()}
        {currentStep >= 1 && currentStep <= 8 && renderConceptSlide()}
        {currentStep === 9 && renderConfidenceMeter()}
        {currentStep === 10 && renderQuiz()}
        {currentStep === 11 && renderCollectiblesBank()}
      </div>

      {renderWhyPanel()}

      {activityPopup && (
        <div className="activity-popup-overlay" onClick={() => setActivityPopup(null)}>
          <div 
            className={`activity-popup-card ${activityPopup.type}`} 
            onClick={e => e.stopPropagation()}
          >
            <div className="activity-popup-header">
              <h3 className="activity-popup-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {activityPopup.type === 'success' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <span>{activityPopup.title}</span>
              </h3>
              <button onClick={() => setActivityPopup(null)} aria-label="Close message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="activity-popup-content">
              {activityPopup.text}
            </div>
            <div className="activity-popup-footer">
              <button 
                className="btn-ok"
                onClick={() => setActivityPopup(null)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FONT_SERIF = "'Georgia', 'Times New Roman', serif";
const FONT_SANS = "'Plus Jakarta Sans', 'Inter', sans-serif";

const C = {
  bg: '#16120F',
  card: '#2B241E',
  border: 'rgba(255, 255, 255, 0.15)',
  orange: '#FF8A2B',
  gold: '#FFC857',
  white: '#FFF7EE',
  muted: '#B7ACA0',
  dark: '#0C0A09',
  teal: '#00F5D4',
  coral: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6'
};

function triggerConfetti() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

export default function ProbLabApp({ onBack }) {
  // Flow: 'setup' | 'game' | 'results'
  const [phase, setPhase] = useState('setup');
  const [difficulty, setDifficulty] = useState('easy'); // easy | medium | hard | extra
  const [targetMissions, setTargetMissions] = useState(5); // 5 | 10 | 15

  // Game Progress
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [logs, setLogs] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [ribbonPopup, setRibbonPopup] = useState(false);
  const [timer, setTimer] = useState(0);

  // Active Interactive Trials State
  const [isTesting, setIsTesting] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState('');
  const [testTally, setTestTally] = useState({ red: 0, blue: 0, green: 0, total: 0 });

  // Easy Level 1 composition jar state
  const [jarMarbles, setJarMarbles] = useState([
    { id: 1, color: 'red' },
    { id: 2, color: 'blue' },
    { id: 3, color: 'green' }
  ]);
  // Easy Level 2 spinner section angle state
  const [spinnerRedAngle, setSpinnerRedAngle] = useState(90);
  const [spinnerRotation, setSpinnerRotation] = useState(45);

  // Die value state
  const [dieVal, setDieVal] = useState(5);

  // Medium Level 2 dice matrix selections
  const [diceMatrixSelections, setDiceMatrixSelections] = useState([]);

  // Coin state for tree diagram
  const [coinFaces, setCoinFaces] = useState(['H', 'H']);
  const [activeTreePath, setActiveTreePath] = useState(null); // 'HH' | 'HT' | 'TH' | 'TT'

  // Generic answer state for user inputs/choice buttons
  const [userAns, setUserAns] = useState('');
  const [activeChoice, setActiveChoice] = useState(null);

  // Running Game Timer
  useEffect(() => {
    let interval = null;
    if (phase === 'game') {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [phase, currentLevel]);

  // Loaded level configuration
  useEffect(() => {
    if (phase === 'game') {
      loadLevelConfig(currentLevel);
    }
  }, [phase, currentLevel, difficulty]);

  const loadLevelConfig = (lvl) => {
    setShowHint(false);
    setUserAns('');
    setActiveChoice(null);
    setTimer(0);
    setTestResultMsg('');
    setTestTally({ red: 0, blue: 0, green: 0, total: 0 });
    setIsTesting(false);
    setActiveTreePath(null);
    setSpinnerRotation(45);
    setDieVal(5);

    // Generate/Load specific hints based on level and difficulty
    if (difficulty === 'easy') {
      if (lvl === 1) setHintText("To make P(Red) = 2/5, the number of red marbles divided by the total number of marbles must equal 2/5 (or 4/10, etc.). Add or remove marbles to build exactly this ratio!");
      else if (lvl === 2) setHintText("A complete circle is 360°. To make P(Red) = 1/3, the Red sector slice needs to occupy 1/3 of the circle. Slide to reach 1/3 of 360° = 120°.");
      else if (lvl === 3) setHintText("A deck has 52 cards. There are 2 Red Queens (Queen of Hearts and Queen of Diamonds). P(Red Queen) = 2/52 = 1/26.");
      else if (lvl === 4) setHintText("A fair die has 6 outcomes: {1, 2, 3, 4, 5, 6}. The prime numbers are {2, 3, 5} (3 outcomes). P(Prime) = 3/6 = 1/2.");
      else setHintText("The word 'PROBABILITY' contains 11 letters: P, R, O, B, A, B, I, L, I, T, Y. The letter 'B' appears 2 times. P('B') = 2/11.");
    } else if (difficulty === 'medium') {
      if (lvl === 1) setHintText("When tossing two coins, the sample space is {HH, HT, TH, TT} (4 outcomes). 'At least one Head' covers HH, HT, and TH (3 outcomes). P(At least 1 H) = 3/4.");
      else if (lvl === 2) setHintText("In a double die roll, there are 36 possible outcomes. Click the coordinate grid cells where the row number + column number = 7. There are exactly 6 such cells!");
      else if (lvl === 3) setHintText("These are independent events. P(Red) = 1/4, and P(Even Die) = 3/6 = 1/2. Multiply them: 1/4 × 1/2 = 1/8.");
      else if (lvl === 4) setHintText("Jar A has 3 Red out of 5. P(Red A) = 3/5 = 0.6. Jar B has 3 Blue out of 5. P(Blue B) = 3/5 = 0.6. Independent events: multiply 0.6 × 0.6 = 0.36.");
      else setHintText("P(Heads) = 1/2. P(Die > 4) = 2/6 = 1/3. Joint probability = 1/2 × 1/3 = 1/6.");
    } else if (difficulty === 'hard') {
      if (lvl === 1) setHintText("Set A (Evens) = {2, 4, 6, 8, 10} (5 items). Set B (Primes) = {2, 3, 5, 7} (4 items). The intersection A ∩ B = {2} (1 item). Use formula P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 5/10 + 4/10 - 1/10 = 8/10 = 0.8.");
      else if (lvl === 2) setHintText("P(Heart OR King) = P(Heart) + P(King) - P(King of Hearts) = 13/52 + 4/52 - 1/52 = 16/52 = 4/13.");
      else if (lvl === 3) setHintText("P(A lands Red) = 1/3. P(B lands Red) = 1/4. P(A OR B) = P(A) + P(B) - P(A ∩ B) = 1/3 + 1/4 - (1/3 × 1/4) = 4/12 + 3/12 - 1/12 = 6/12 = 1/2.");
      else if (lvl === 4) setHintText("Multiples of 3 in 1-20 are {3,6,9,12,15,18} (6 numbers). Multiples of 5 are {5,10,15,20} (4 numbers). The overlapping multiple is {15} (1 number). Total Union = 6 + 4 - 1 = 9 numbers. P = 9/20 = 0.45.");
      else setHintText("Circles = 5. Blue shapes = 2. These sets have no overlap (mutually exclusive). Total = 5 + 2 = 7 shapes out of 10. P = 7/10 = 0.7.");
    } else {
      if (lvl === 1) setHintText("First draw: 5 Red out of 10. P(Red) = 5/10. Because we don't replace it, the second draw has 4 Red out of 9. P(Red 2nd) = 4/9. Joint probability = 5/10 × 4/9 = 2/9.");
      else if (lvl === 2) setHintText("First Jack: 4/52. Second Jack: 3/51 (no replacement). Joint probability = 4/52 × 3/51 = 12/2652 = 1/221.");
      else if (lvl === 3) setHintText("Strawberry first: 4/6. Lemon second: 2/5 (no replacement). Joint probability = 4/6 × 2/5 = 8/30 = 4/15.");
      else if (lvl === 4) setHintText("First defective: 3/10. Second defective: 2/9 (no replacement). Joint probability = 3/10 × 2/9 = 6/90 = 1/15.");
      else setHintText("Black first: 6/10. White second: 4/9 (no replacement). Joint probability = 6/10 × 4/9 = 24/90 = 4/15.");
    }
  };

  const getLevelQuestion = (lvl) => {
    if (difficulty === 'easy') {
      if (lvl === 1) return { title: "🍯 Marble Jar Composition", story: "Match a probability of drawing a Red marble of exactly 2/5. Add or remove marbles to adjust the ratio!" };
      if (lvl === 2) return { title: "🎡 Pizza Spinner Slices", story: "Adjust the size of the Red slice so the probability of landing on Red is exactly 1/3 (120 degrees)." };
      if (lvl === 3) return { title: "🃏 Red Queen Draw", story: "A deck of cards is shuffled. What is the probability that the top card drawn is a Red Queen?" };
      if (lvl === 4) return { title: "🎲 Prime Number Die", story: "You roll a standard fair 6-sided die. Find the probability that the result is a Prime Number." };
      return { title: "🔤 Probability Word Spinner", story: "If you spin a wheel labeled with the letters in P-R-O-B-A-B-I-L-I-T-Y, what is the probability of landing on B?" };
    } else if (difficulty === 'medium') {
      if (lvl === 1) return { title: "🪙 Double Coin Flip Tree", story: "Two coins are tossed. Find the probability of landing on at least one Head using the tree diagram sample space." };
      if (lvl === 2) return { title: "🏁 Two Dice Sum of 7 Grid", story: "Highlight all cells in the 6x6 dice matrix where the sum of the two dice equals 7." };
      if (lvl === 3) return { title: "🎰 Spinner & Die Joint Spin", story: "A 4-color spinner (Red, Green, Blue, Yellow) is spun, and a 6-sided die is rolled. Find the probability of landing on Red AND rolling an even number." };
      if (lvl === 4) return { title: "🏺 Two Separate Marbles Draw", story: "Jar A has 3 Red/2 Blue marbles. Jar B has 2 Red/3 Blue marbles. You draw one from each. What is the decimal probability of drawing Red from A AND Blue from B?" };
      return { title: "🌟 Double Coin & Greater Die", story: "A coin is tossed and a die is rolled. What is the probability of landing on Heads AND rolling a number greater than 4?" };
    } else if (difficulty === 'hard') {
      if (lvl === 1) return { title: "🧮 Venn Set A or Set B", story: "For numbers 1 to 10: Set A is Evens, Set B is Primes. Find the decimal probability that a random number picked is in Set A OR Set B." };
      if (lvl === 2) return { title: "🎴 King or Heart Draw", story: "You draw a single card from a deck of 52. What is the probability that you draw a Heart OR a King?" };
      if (lvl === 3) return { title: "🌀 Spinner A or Spinner B", story: "Spinner A has 3 equal colors (Red, Blue, Green). Spinner B has 4 equal colors (Red, Blue, Yellow, Purple). Calculate P(A is Red OR B is Red)." };
      if (lvl === 4) return { title: "🔢 Overlapping Number Multiples", story: "A card is selected from numbers 1 to 20. Find the decimal probability that it is a multiple of 3 OR a multiple of 5." };
      return { title: "🟢 Shape Selector Or Event", story: "A box has 5 red circles, 3 red triangles, and 2 blue triangles. What is the probability of picking a Circle OR a Blue shape?" };
    } else {
      if (lvl === 1) return { title: "⚠️ Non-Replacement Marble Jar", story: "A jar has 5 Red and 5 Blue marbles. You draw one Red and do NOT replace it. Find the probability of drawing a second Red marble next." };
      if (lvl === 2) return { title: "🃏 Consecutive Jack Drawings", story: "What is the probability of drawing two Jacks consecutively from a deck of 52 cards without replacement?" };
      if (lvl === 3) return { title: "🍬 Strawberry & Lemon Candy Draw", story: "A bag has 4 Strawberry and 2 Lemon candies. You eat two candies sequentially. What is the probability of picking Strawberry then Lemon?" };
      if (lvl === 4) return { title: "💡 Defective Lightbulb Box", story: "A box of 10 lightbulbs contains 3 defective ones. You test two bulbs without replacing the first. Find the probability both are defective." };
      return { title: "🧦 Black & White Sock Draw", story: "A drawer holds 6 black socks and 4 white socks. What is the probability of picking a black sock, then a white sock without replacement?" };
    }
  };

  const nextLevel = () => {
    setRibbonPopup(false);
    if (currentLevel < targetMissions) {
      setCurrentLevel(l => l + 1);
    } else {
      triggerConfetti();
      setPhase('results');
    }
  };

  const handleEvaluation = (isCorrect) => {
    if (isCorrect) {
      setXp(x => x + 60);
      triggerConfetti();
      setLogs(prev => [...new Set([...prev, `Completed Level ${currentLevel} (${difficulty.toUpperCase()})`])]);
      setRibbonPopup(true);
      setTimeout(nextLevel, 2500);
    } else {
      setLives(l => Math.max(0, l - 1));
      setHintText("Hmm, that composition doesn't match the target probability. Click 'Reveal Hint' for a breakdown!");
    }
  };

  // --- Actions ---
  const addMarble = (color) => {
    setJarMarbles(prev => [...prev, { id: Date.now() + Math.random(), color }]);
  };

  const removeMarble = (color) => {
    const idx = jarMarbles.findIndex(m => m.color === color);
    if (idx !== -1) {
      setJarMarbles(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const toggleDiceMatrix = (r, c) => {
    const key = `${r}-${c}`;
    if (diceMatrixSelections.includes(key)) {
      setDiceMatrixSelections(prev => prev.filter(k => k !== key));
    } else {
      setDiceMatrixSelections(prev => [...prev, key]);
    }
  };

  const checkEasyLevel1 = () => {
    const redCount = jarMarbles.filter(m => m.color === 'red').length;
    const total = jarMarbles.length;
    const isCorrect = total > 0 && Math.abs((redCount / total) - 0.4) < 0.01;
    handleEvaluation(isCorrect);
  };

  const checkEasyLevel2 = () => {
    const isCorrect = spinnerRedAngle === 120;
    handleEvaluation(isCorrect);
  };

  const checkMediumLevel2 = () => {
    const requiredKeys = ['1-6', '2-5', '3-4', '4-3', '5-2', '6-1'];
    const isCorrect = 
      diceMatrixSelections.length === requiredKeys.length && 
      requiredKeys.every(k => diceMatrixSelections.includes(k));
    handleEvaluation(isCorrect);
  };

  // --- Real-time Interactive Trials ---
  const runTestTrial = () => {
    if (isTesting) return;
    setIsTesting(true);
    setTestResultMsg('Running active test...');

    if (difficulty === 'easy' && currentLevel === 1) {
      if (jarMarbles.length === 0) {
        setTestResultMsg('Jar is empty! Add marbles to test.');
        setIsTesting(false);
        return;
      }
      setTimeout(() => {
        const randM = jarMarbles[Math.floor(Math.random() * jarMarbles.length)];
        const colorName = randM.color.toUpperCase();
        setTestResultMsg(`🧪 Test Draw Outcome: Drawn a ${colorName} marble!`);
        setTestTally(t => ({
          ...t,
          [randM.color]: t[randM.color] + 1,
          total: t.total + 1
        }));
        setIsTesting(false);
      }, 800);
    } 
    else if (difficulty === 'easy' && currentLevel === 2) {
      const spinsCount = spinnerRotation + 720 + Math.random() * 360;
      setSpinnerRotation(spinsCount);
      setTimeout(() => {
        const finalAngle = spinsCount % 360;
        const landedRed = finalAngle <= spinnerRedAngle;
        setTestResultMsg(landedRed ? '🎡 Spin Outcome: Landed on RED! 🔴' : '🎡 Spin Outcome: Landed on YELLOW! 🟡');
        setIsTesting(false);
      }, 1500);
    }
    else if (difficulty === 'easy' && currentLevel === 4) {
      setTimeout(() => {
        const face = Math.floor(Math.random() * 6) + 1;
        setDieVal(face);
        const primes = [2, 3, 5];
        const isPrime = primes.includes(face);
        setTestResultMsg(`🎲 Roll Outcome: Rolled a ${face}! (${isPrime ? 'PRIME' : 'NOT PRIME'})`);
        setIsTesting(false);
      }, 800);
    }
    else if (difficulty === 'medium' && currentLevel === 1) {
      setTimeout(() => {
        const f1 = Math.random() > 0.5 ? 'H' : 'T';
        const f2 = Math.random() > 0.5 ? 'H' : 'T';
        setCoinFaces([f1, f2]);
        const path = `${f1}${f2}`;
        setActiveTreePath(path);
        setTestResultMsg(`🪙 Coin outcome: ${f1} and ${f2}!`);
        setIsTesting(false);
      }, 850);
    }
    else if (difficulty === 'medium' && currentLevel === 3) {
      setTimeout(() => {
        const landedRed = Math.random() < 0.25;
        const dieFace = Math.floor(Math.random() * 6) + 1;
        setDieVal(dieFace);
        const isEven = dieFace % 2 === 0;
        setTestResultMsg(`🎰 Outcome: Spinner Red? ${landedRed ? 'YES' : 'NO'} | Die Even? ${isEven ? 'YES' : 'NO'}`);
        setIsTesting(false);
      }, 1000);
    }
    else if (difficulty === 'hard' && currentLevel === 3) {
      setTimeout(() => {
        const spinARed = Math.random() < (1/3);
        const spinBRed = Math.random() < (1/4);
        setTestResultMsg(`🌀 Outcome: Spinner A is Red? ${spinARed ? 'YES' : 'NO'} | Spinner B is Red? ${spinBRed ? 'YES' : 'NO'}`);
        setIsTesting(false);
      }, 1000);
    }
    else if (difficulty === 'extra' && currentLevel === 1) {
      setTimeout(() => {
        const draw1Red = Math.random() < 0.5;
        const draw2Red = draw1Red ? (Math.random() < (4/9)) : (Math.random() < (5/9));
        setTestResultMsg(`🧪 Outcomes: Draw 1? ${draw1Red ? 'RED' : 'BLUE'} | Draw 2? ${draw2Red ? 'RED' : 'BLUE'}`);
        setIsTesting(false);
      }, 1200);
    }
    else {
      setTimeout(() => {
        setTestResultMsg('🧪 Sandbox Trial Complete!');
        setIsTesting(false);
      }, 800);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#0F0B09', color: C.white, fontFamily: FONT_SANS,
      overflow: 'hidden', position: 'relative'
    }}>

      {/* SETUP SCREEN */}
      {phase === 'setup' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center',
          alignItems: 'center', background: 'rgba(22, 18, 15, 0.9)', zIndex: 100
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: '640px', background: C.card, borderRadius: '28px',
              border: `1px solid ${C.border}`, padding: '40px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
              position: 'relative'
            }}
          >
            <button 
              onClick={onBack}
              style={{
                position: 'absolute', left: '24px', top: '24px',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                color: C.muted, padding: '8px 16px', borderRadius: '16px',
                fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600
              }}
            >
              ← Home
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '24px' }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '3rem', fontWeight: 'bold', fontFamily: FONT_SERIF, color: C.white }}>Probability</h1>
              <p style={{ margin: 0, fontSize: '1.1rem', color: C.muted, fontFamily: FONT_SANS }}>Single & combined events</p>
            </div>

            <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.95rem', margin: '0 0 20px 0' }}>Practice probability!</p>

            {/* Select difficulty */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {[
                { key: 'easy', label: 'Easy — Simple' },
                { key: 'medium', label: 'Medium — Independent' },
                { key: 'hard', label: 'Hard — Or events' },
                { key: 'extra', label: 'Extra Hard — No replacement' }
              ].map(d => {
                const isSelected = difficulty === d.key;
                return (
                  <button 
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    style={{
                      padding: '12px 24px', borderRadius: '25px', 
                      border: `1px solid ${isSelected ? C.orange : 'rgba(255,255,255,0.2)'}`,
                      background: isSelected ? C.orange : 'none',
                      color: isSelected ? '#16120F' : C.white, 
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            {/* Select mission count */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.muted, marginBottom: '12px', letterSpacing: '1px' }}>How many questions?</span>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {[5, 10, 15].map(cnt => {
                  const isSelected = targetMissions === cnt;
                  return (
                    <button 
                      key={cnt}
                      onClick={() => setTargetMissions(cnt)}
                      style={{
                        padding: '12px 24px', borderRadius: '12px', 
                        border: `1px solid ${isSelected ? C.orange : 'rgba(255,255,255,0.2)'}`,
                        background: isSelected ? 'rgba(255,138,43,0.1)' : C.dark,
                        color: isSelected ? C.orange : C.white, 
                        fontWeight: 800, cursor: 'pointer', width: '100px', textAlign: 'center'
                      }}
                    >
                      {cnt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setCurrentLevel(1);
                  setPhase('game');
                }}
                style={{
                  padding: '16px 40px', borderRadius: '24px', border: 'none',
                  background: C.orange, color: '#16120F',
                  fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer',
                  boxShadow: `0 10px 25px rgba(255,138,43,0.3)`
                }}
              >
                Start Lab
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* ── PLAYING LAB ────────────────────────────────────────── */}
      {phase === 'game' && (
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          
          {/* Main game board outline card */}
          <div style={{
            width: '100%', maxWidth: '780px', background: C.card,
            borderRadius: '24px', border: `2px solid ${C.white}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '28px',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setPhase('setup')}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none', color: C.muted,
                  padding: '8px 16px', borderRadius: '16px', cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                ← Back
              </button>

              <span style={{ fontSize: '0.95rem', color: C.white, fontWeight: 700 }}>
                Question {currentLevel} of {targetMissions}
              </span>

              <div style={{
                background: '#FFF7EE', color: '#16120F',
                padding: '6px 14px', borderRadius: '16px', fontSize: '0.85rem',
                fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                ⏱️ {timer}s
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div style={{
              width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px', overflow: 'hidden'
            }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentLevel / targetMissions) * 100}%` }}
                style={{ height: '100%', background: '#4ADE80' }}
              />
            </div>

            {/* Question prompt */}
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <h2 style={{ margin: 0, fontSize: '1.45rem', color: C.white, fontWeight: 800 }}>
                {getLevelQuestion(currentLevel).title}
              </h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '1.05rem', color: C.muted, lineHeight: '1.4' }}>
                {getLevelQuestion(currentLevel).story}
              </p>
            </div>

            {/* Dark Grid Box for Visual Stage */}
            <div style={{
              background: 'rgba(0,0,0,0.3)', border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              minHeight: '280px', position: 'relative'
            }}>
              
              <svg width="100%" height="300" viewBox="0 0 500 300" style={{ zIndex: 2 }}>
                
                {/* Visual definitions for nice gradients/shadows to appeal to children */}
                <defs>
                  <radialGradient id="redSphere" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFA482" />
                    <stop offset="60%" stopColor="#FF4900" />
                    <stop offset="100%" stopColor="#A82800" />
                  </radialGradient>
                  <radialGradient id="blueSphere" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#82BEFF" />
                    <stop offset="60%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </radialGradient>
                  <radialGradient id="greenSphere" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#82FFD2" />
                    <stop offset="60%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </radialGradient>
                  <radialGradient id="goldCoin" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFF4B8" />
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#B45309" />
                  </radialGradient>
                  <radialGradient id="greySphere" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="60%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                  </radialGradient>
                  <radialGradient id="dieRedFace" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FF7D7D" />
                    <stop offset="60%" stopColor="#D32F2F" />
                    <stop offset="100%" stopColor="#8E1C1C" />
                  </radialGradient>
                  <linearGradient id="corkTexture" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C4A484" />
                    <stop offset="100%" stopColor="#8B5A2B" />
                  </linearGradient>
                  <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
                  </filter>
                </defs>
                
                {/* EASY MODE LEVEL 1: MARBLE JAR COMPOSITION */}
                {difficulty === 'easy' && currentLevel === 1 && (
                  <g>
                    {/* Clear glossy glass jar shape */}
                    <path d="M 190 40 L 190 230 Q 190 270 250 270 Q 310 270 310 230 L 310 40 Z" fill="rgba(255,255,255,0.03)" stroke={C.white} strokeWidth="5"/>
                    <ellipse cx="250" cy="40" rx="60" ry="12" fill={C.dark} stroke={C.white} strokeWidth="3"/>
                    
                    {/* Antique Cork Lid detail */}
                    <polygon points="216,22 284,22 276,40 224,40" fill="url(#corkTexture)" filter="url(#cardShadow)"/>
                    <path d="M 196 50 L 196 220" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round"/>

                    {/* Target visual ratio bar for premium NCERT feel */}
                    <rect x="20" y="250" width="120" height="24" fill={C.dark} rx="6" stroke={C.border}/>
                    <text x="80" y="266" fill={C.gold} fontSize="11" fontWeight="bold" textAnchor="middle">TARGET: 2/5 (40%)</text>

                    {jarMarbles.map((m, idx) => {
                      const px = 210 + (idx * 24) % 80;
                      const py = 170 + (idx * 20) % 80;
                      return (
                        <circle key={m.id} cx={px} cy={py} r="14" fill={m.color === 'red' ? 'url(#redSphere)' : m.color === 'blue' ? 'url(#blueSphere)' : 'url(#greenSphere)'} filter="url(#cardShadow)"/>
                      );
                    })}
                  </g>
                )}

                {/* EASY MODE LEVEL 2: PIZZA SPINNER SECTIONS */}
                {difficulty === 'easy' && currentLevel === 2 && (
                  <g>
                    {/* Black outer background shield */}
                    <circle cx="250" cy="150" r="114" fill="#0C0A09" stroke={C.white} strokeWidth="4"/>
                    {/* Pizza Crust */}
                    <circle cx="250" cy="150" r="110" fill="#E5A96E" stroke="#B37A43" strokeWidth="6"/>
                    
                    {/* Toast spots on pizza crust */}
                    <circle cx="160" cy="90" r="3" fill="#6A3B16" opacity="0.6"/>
                    <circle cx="340" cy="90" r="3" fill="#6A3B16" opacity="0.6"/>
                    <circle cx="250" cy="45" r="3" fill="#6A3B16" opacity="0.6"/>
                    <circle cx="250" cy="255" r="3" fill="#6A3B16" opacity="0.6"/>
                    <circle cx="150" cy="190" r="3" fill="#6A3B16" opacity="0.6"/>
                    <circle cx="350" cy="190" r="3" fill="#6A3B16" opacity="0.6"/>

                    {/* Mozzarella Cheese base */}
                    <circle cx="250" cy="150" r="98" fill="#FDD835"/>

                    {/* Dynamic Veggie Toppings (Olives/Peppers) on the cheesy part */}
                    {[
                      { angle: 280, r: 55, type: 'pepper' },
                      { angle: 300, r: 75, type: 'olive' },
                      { angle: 325, r: 45, type: 'pepper' },
                      { angle: 345, r: 70, type: 'olive' }
                    ].map((veg, idx) => {
                      const isShown = spinnerRedAngle < veg.angle;
                      if (!isShown) return null;
                      const rad = (veg.angle * Math.PI) / 180;
                      const cx = 250 + Math.sin(rad) * veg.r;
                      const cy = 150 - Math.cos(rad) * veg.r;
                      if (veg.type === 'pepper') {
                        return (
                          <path key={`veg-${idx}`} d={`M ${cx - 5} ${cy} Q ${cx} ${cy - 8} ${cx + 5} ${cy}`} fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
                        );
                      } else {
                        return (
                          <circle key={`veg-${idx}`} cx={cx} cy={cy} r="6" fill="#212121" stroke="#000" strokeWidth="1.5"/>
                        );
                      }
                    })}

                    {/* Red Tomato Sauce Slice (Red segment) */}
                    <path d={`M 250 150 L 250 52 A 98 98 0 ${spinnerRedAngle > 180 ? 1 : 0} 1 ${250 + Math.sin((spinnerRedAngle * Math.PI)/180)*98} ${150 - Math.cos((spinnerRedAngle * Math.PI)/180)*98} Z`} fill="#C62828" stroke="#8E0000" strokeWidth="1.5"/>
                    
                    {/* Dynamic Pepperoni Toppings inside the Red Sauce Slice */}
                    {[
                      { angle: 25, r: 40 },
                      { angle: 50, r: 70 },
                      { angle: 75, r: 45 },
                      { angle: 100, r: 75 },
                      { angle: 130, r: 50 },
                      { angle: 160, r: 70 },
                      { angle: 190, r: 45 },
                      { angle: 220, r: 75 },
                      { angle: 250, r: 55 }
                    ].map((pep, idx) => {
                      const isShown = spinnerRedAngle >= pep.angle;
                      if (!isShown) return null;
                      const rad = (pep.angle * Math.PI) / 180;
                      const cx = 250 + Math.sin(rad) * pep.r;
                      const cy = 150 - Math.cos(rad) * pep.r;
                      return (
                        <g key={`pep-${idx}`}>
                          <circle cx={cx} cy={cy} r="10" fill="#B71C1C" stroke="#7F0000" strokeWidth="1.5"/>
                          <circle cx={cx - 3} cy={cy - 3} r="3" fill="#FF8A8A" opacity="0.6"/>
                        </g>
                      );
                    })}

                    {/* Protractor angle guidelines */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                      const rad = (deg * Math.PI) / 180;
                      return (
                        <line 
                          key={deg}
                          x1={250 + Math.sin(rad)*96} y1={150 - Math.cos(rad)*96}
                          x2={250 + Math.sin(rad)*108} y2={150 - Math.cos(rad)*108}
                          stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2"
                        />
                      );
                    })}

                    <circle cx="250" cy="150" r="12" fill="url(#goldCoin)" stroke="#D49D00" strokeWidth="2"/>
                    {/* Animated spinner needle */}
                    <polygon 
                      points="250,150 250,60 244,80 256,80" 
                      fill={C.gold} 
                      transform={`rotate(${spinnerRotation}, 250, 150)`}
                      style={{ transition: isTesting ? 'transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none' }}
                    />
                  </g>
                )}

                {/* EASY MODE LEVEL 3: RED QUEEN DRAW */}
                {difficulty === 'easy' && currentLevel === 3 && (
                  <g>
                    {/* Real Queen of Hearts Card */}
                    <image href="/cards/queen_hearts.png" x="65" y="30" width="140" height="205" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
                    <text x="135" y="260" fill={C.white} fontSize="13" fontWeight="bold" textAnchor="middle">2 Red Queens</text>

                    {/* Real King of Spades Card */}
                    <image href="/cards/king_spades.png" x="295" y="30" width="140" height="205" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
                    <text x="365" y="260" fill={C.white} fontSize="13" fontWeight="bold" textAnchor="middle">26 Black Cards</text>
                  </g>
                )}

                {/* EASY MODE LEVEL 4: PRIME NUMBER DIE */}
                {difficulty === 'easy' && currentLevel === 4 && (
                  <g>
                    {/* Realistic Glossy 3D Die */}
                    <g style={{ transform: isTesting ? 'rotate(15deg) scale(0.95)' : 'none', transformOrigin: '230px 150px', transition: 'transform 0.15s ease' }}>
                      {/* Front face with sphere gradient */}
                      <rect x="165" y="85" width="130" height="130" fill="url(#dieRedFace)" rx="18" filter="url(#cardShadow)"/>
                      <polygon points="165,85 205,50 335,50 295,85" fill="#EF5350" stroke="#B71C1C"/>
                      <polygon points="295,85 335,50 335,175 295,215" fill="#990000" stroke="#7F0000"/>
                      
                      {/* Dynamic die face pips based on state */}
                      {dieVal === 1 && <circle cx="230" cy="150" r="10" fill="#FFF" filter="url(#cardShadow)"/>}
                      {dieVal === 2 && (
                        <>
                          <circle cx="200" cy="120" r="10" fill="#FFF"/>
                          <circle cx="260" cy="180" r="10" fill="#FFF"/>
                        </>
                      )}
                      {dieVal === 3 && (
                        <>
                          <circle cx="200" cy="120" r="10" fill="#FFF"/>
                          <circle cx="230" cy="150" r="10" fill="#FFF"/>
                          <circle cx="260" cy="180" r="10" fill="#FFF"/>
                        </>
                      )}
                      {dieVal === 4 && (
                        <>
                          <circle cx="200" cy="120" r="10" fill="#FFF"/>
                          <circle cx="260" cy="120" r="10" fill="#FFF"/>
                          <circle cx="200" cy="180" r="10" fill="#FFF"/>
                          <circle cx="260" cy="180" r="10" fill="#FFF"/>
                        </>
                      )}
                      {dieVal === 5 && (
                        <>
                          <circle cx="200" cy="120" r="10" fill="#FFF"/>
                          <circle cx="260" cy="120" r="10" fill="#FFF"/>
                          <circle cx="230" cy="150" r="10" fill="#FFF"/>
                          <circle cx="200" cy="180" r="10" fill="#FFF"/>
                          <circle cx="260" cy="180" r="10" fill="#FFF"/>
                        </>
                      )}
                      {dieVal === 6 && (
                        <>
                          <circle cx="200" cy="120" r="9" fill="#FFF"/>
                          <circle cx="260" cy="120" r="9" fill="#FFF"/>
                          <circle cx="200" cy="150" r="9" fill="#FFF"/>
                          <circle cx="260" cy="150" r="9" fill="#FFF"/>
                          <circle cx="200" cy="180" r="9" fill="#FFF"/>
                          <circle cx="260" cy="180" r="9" fill="#FFF"/>
                        </>
                      )}
                    </g>
                  </g>
                )}

                {/* EASY MODE LEVEL 5: PROBABILITY WORD SPINNER */}
                {difficulty === 'easy' && currentLevel === 5 && (
                  <g>
                    <circle cx="250" cy="150" r="110" fill="#0C0A09" stroke={C.white} strokeWidth="4"/>
                    {Array.from({ length: 11 }).map((_, idx) => {
                      const angle = (idx * 360) / 11;
                      const rad = (angle * Math.PI) / 180;
                      const tx = 250 + Math.sin(rad) * 75;
                      const ty = 150 - Math.cos(rad) * 75;
                      const letter = 'PROBABILITY'[idx];
                      const colors = [C.orange, C.teal, C.blue, C.purple, C.gold];
                      const fillSlice = colors[idx % colors.length];
                      return (
                        <g key={idx}>
                          <path d={`M 250 150 L ${250 + Math.sin(rad)*110} ${150 - Math.cos(rad)*110} A 110 110 0 0 1 ${250 + Math.sin(((idx+1)*360/11)*Math.PI/180)*110} ${150 - Math.cos(((idx+1)*360/11)*Math.PI/180)*110} Z`} fill={fillSlice} opacity="0.3"/>
                          <line x1="250" y1="150" x2={250 + Math.sin(rad)*110} y2={150 - Math.cos(rad)*110} stroke="rgba(255,255,255,0.2)"/>
                          <circle cx={tx} cy={ty} r="16" fill={letter === 'B' ? C.orange : C.dark} stroke={C.white} strokeWidth="1.5"/>
                          <text x={tx} y={ty+5} fill={letter === 'B' ? '#16120F' : C.white} fontSize="14" fontWeight="black" textAnchor="middle">{letter}</text>
                        </g>
                      );
                    })}
                    <circle cx="250" cy="150" r="10" fill="url(#goldCoin)"/>
                  </g>
                )}

                {/* MEDIUM MODE LEVEL 1: COIN TREE DIAGRAM */}
                {difficulty === 'medium' && currentLevel === 1 && (
                  <g>
                    <rect x="40" y="140" width="70" height="40" fill={C.dark} stroke={C.orange} strokeWidth="2" rx="10"/>
                    <text x="75" y="165" fill={C.orange} fontSize="12" fontWeight="bold" textAnchor="middle">START</text>
                    
                    {/* Branch Paths (Highlighted dynamically by coin test tosses) */}
                    <line x1="110" y1="160" x2="200" y2="90" stroke={activeTreePath && activeTreePath.startsWith('H') ? C.gold : C.white} strokeWidth={activeTreePath && activeTreePath.startsWith('H') ? 5 : 2}/>
                    <line x1="110" y1="160" x2="200" y2="230" stroke={activeTreePath && activeTreePath.startsWith('T') ? C.gold : C.white} strokeWidth={activeTreePath && activeTreePath.startsWith('T') ? 5 : 2}/>

                    {/* First Coin node Heads (Glass Sphere Gold) */}
                    <circle cx="210" cy="90" r="22" fill={coinFaces[0] === 'H' && activeTreePath ? "url(#goldCoin)" : "url(#greySphere)"} filter="url(#cardShadow)"/>
                    <text x="210" y="97" fill={coinFaces[0] === 'H' && activeTreePath ? "#5C4000" : "#FFF"} fontSize="20" fontWeight="black" textAnchor="middle">H</text>

                    {/* First Coin node Tails (Silver) */}
                    <circle cx="210" cy="230" r="22" fill={coinFaces[0] === 'T' && activeTreePath ? "url(#goldCoin)" : "url(#greySphere)"} filter="url(#cardShadow)"/>
                    <text x="210" y="237" fill={coinFaces[0] === 'T' && activeTreePath ? "#5C4000" : "#FFF"} fontSize="20" fontWeight="black" textAnchor="middle">T</text>

                    {/* Secondary Branch Paths */}
                    <line x1="232" y1="90" x2="310" y2="50" stroke={activeTreePath === 'HH' ? C.gold : C.white} strokeWidth={activeTreePath === 'HH' ? 5 : 2}/>
                    <line x1="232" y1="90" x2="310" y2="130" stroke={activeTreePath === 'HT' ? C.gold : C.white} strokeWidth={activeTreePath === 'HT' ? 5 : 2}/>
                    <line x1="232" y1="230" x2="310" y2="190" stroke={activeTreePath === 'TH' ? C.gold : C.white} strokeWidth={activeTreePath === 'TH' ? 5 : 2}/>
                    <line x1="232" y1="230" x2="310" y2="270" stroke={activeTreePath === 'TT' ? C.gold : C.white} strokeWidth={activeTreePath === 'TT' ? 5 : 2}/>

                    <text x="330" y="55" fill={activeTreePath === 'HH' ? C.gold : C.white} fontSize="12" fontWeight="bold">HH ⭐</text>
                    <text x="330" y="135" fill={activeTreePath === 'HT' ? C.gold : C.white} fontSize="12" fontWeight="bold">HT ⭐</text>
                    <text x="330" y="195" fill={activeTreePath === 'TH' ? C.gold : C.white} fontSize="12" fontWeight="bold">TH ⭐</text>
                    <text x="330" y="275" fill={activeTreePath === 'TT' ? C.gold : C.white} fontSize="12" fontWeight="bold">TT</text>
                  </g>
                )}

                {/* MEDIUM MODE LEVEL 2: TWO DICE Sum of 7 GRID */}
                {difficulty === 'medium' && currentLevel === 2 && (
                  <g transform="translate(100, 10)">
                    {Array.from({ length: 6 }).map((_, r) => {
                      return Array.from({ length: 6 }).map((_, c) => {
                        const rowVal = r + 1;
                        const colVal = c + 1;
                        const isSelected = diceMatrixSelections.includes(`${rowVal}-${colVal}`);

                        return (
                          <g key={`${r}-${c}`} onClick={() => toggleDiceMatrix(rowVal, colVal)} style={{ cursor: 'pointer' }}>
                            <rect 
                              x={c * 48} y={r * 44} width="42" height="38" rx="8"
                              fill={isSelected ? 'rgba(255,138,43,0.35)' : 'rgba(255,255,255,0.03)'}
                              stroke={isSelected ? C.orange : C.border} strokeWidth="2"
                            />
                            <text x={21 + c * 48} y={24 + r * 44} fill={isSelected ? C.orange : C.white} fontSize="10" fontWeight="bold" textAnchor="middle">{rowVal},{colVal}</text>
                          </g>
                        );
                      });
                    })}
                  </g>
                )}

                {/* MEDIUM MODE LEVEL 3: SPINNER & DIE GRID */}
                {difficulty === 'medium' && currentLevel === 3 && (
                  <g transform="translate(0, -10)">
                    <rect x="50" y="40" width="180" height="220" fill="rgba(249,115,22,0.08)" stroke={C.orange} strokeWidth="2.5" rx="14"/>
                    <text x="140" y="70" fill={C.orange} fontSize="14" fontWeight="bold" textAnchor="middle">SPINNER (4 Slices)</text>
                    <circle cx="140" cy="130" r="40" fill={C.dark} stroke={C.white} strokeWidth="3"/>
                    <path d="M 140 130 L 140 90 A 40 40 0 0 1 180 130 Z" fill="url(#redSphere)"/>
                    <line x1="140" y1="90" x2="140" y2="170" stroke={C.white}/>
                    <line x1="100" y1="130" x2="180" y2="130" stroke={C.white}/>
                    <text x="140" y="210" fill={C.orange} fontSize="15" fontWeight="black" textAnchor="middle">P(Red) = 1/4</text>

                    <rect x="270" y="40" width="180" height="220" fill="rgba(0,245,212,0.08)" stroke={C.teal} strokeWidth="2.5" rx="14"/>
                    <text x="360" y="70" fill={C.teal} fontSize="14" fontWeight="bold" textAnchor="middle">DIE (6 Sides)</text>
                    <rect x="330" y="105" width="60" height="60" fill="url(#dieRedFace)" rx="12" filter="url(#cardShadow)"/>
                    <circle cx="345" cy="120" r="5" fill="#FFF"/>
                    <circle cx="375" cy="150" r="5" fill="#FFF"/>
                    <circle cx="360" cy="135" r="5" fill="#FFF"/>
                    <text x="360" y="210" fill={C.teal} fontSize="15" fontWeight="black" textAnchor="middle">P(Even) = 3/6</text>
                  </g>
                )}

                {/* MEDIUM MODE LEVEL 4: TWO SEPARATE JARS DRAW */}
                {difficulty === 'medium' && currentLevel === 4 && (
                  <g>
                    {/* Jar A with Cork Lid */}
                    <path d="M 90 60 L 90 210 Q 90 240 140 240 Q 190 240 190 210 L 190 60 Z" fill="rgba(255,255,255,0.03)" stroke={C.white} strokeWidth="4"/>
                    <ellipse cx="140" cy="60" rx="50" ry="10" fill={C.dark} stroke={C.white} strokeWidth="2"/>
                    <polygon points="110,44 170,44 162,60 118,60" fill="url(#corkTexture)" filter="url(#cardShadow)"/>
                    
                    <circle cx="120" cy="160" r="12" fill="url(#redSphere)"/>
                    <circle cx="150" cy="170" r="12" fill="url(#redSphere)"/>
                    <circle cx="130" cy="205" r="12" fill="url(#redSphere)"/>
                    <circle cx="165" cy="195" r="12" fill="url(#blueSphere)"/>
                    <circle cx="110" cy="185" r="12" fill="url(#blueSphere)"/>
                    <text x="140" y="110" fill={C.orange} fontSize="12" fontWeight="black" textAnchor="middle">JAR A (3R, 2B)</text>

                    {/* Jar B with Cork Lid */}
                    <path d="M 310 60 L 310 210 Q 310 240 360 240 Q 410 240 410 210 L 410 60 Z" fill="rgba(255,255,255,0.03)" stroke={C.white} strokeWidth="4"/>
                    <ellipse cx="360" cy="60" rx="50" ry="10" fill={C.dark} stroke={C.white} strokeWidth="2"/>
                    <polygon points="330,44 390,44 382,60 338,60" fill="url(#corkTexture)" filter="url(#cardShadow)"/>
                    
                    <circle cx="340" cy="160" r="12" fill="url(#redSphere)"/>
                    <circle cx="380" cy="170" r="12" fill="url(#redSphere)"/>
                    <circle cx="350" cy="205" r="12" fill="url(#blueSphere)"/>
                    <circle cx="375" cy="200" r="12" fill="url(#blueSphere)"/>
                    <circle cx="330" cy="180" r="12" fill="url(#blueSphere)"/>
                    <text x="360" y="110" fill={C.blue} fontSize="12" fontWeight="black" textAnchor="middle">JAR B (2R, 3B)</text>
                  </g>
                )}

                {/* MEDIUM MODE LEVEL 5: DOUBLE COIN AND DIE */}
                {difficulty === 'medium' && currentLevel === 5 && (
                  <g>
                    <circle cx="160" cy="150" r="60" fill="url(#goldCoin)" stroke="#B45309" strokeWidth="3" filter="url(#cardShadow)"/>
                    <text x="160" y="158" fill="#5C4000" fontSize="28" fontWeight="black" textAnchor="middle">H</text>
                    <text x="160" y="235" fill={C.white} fontSize="12" fontWeight="bold" textAnchor="middle">COIN P(H) = 1/2</text>
                    
                    <rect x="280" y="90" width="120" height="120" fill="url(#dieRedFace)" rx="16" filter="url(#cardShadow)"/>
                    {/* Dots for 5 */}
                    <circle cx="310" cy="120" r="8" fill="#FFF"/>
                    <circle cx="370" cy="120" r="8" fill="#FFF"/>
                    <circle cx="340" cy="150" r="8" fill="#FFF"/>
                    <circle cx="310" cy="180" r="8" fill="#FFF"/>
                    <circle cx="370" cy="180" r="8" fill="#FFF"/>
                    <text x="340" y="235" fill={C.white} fontSize="12" fontWeight="bold" textAnchor="middle">DIE P(&gt;4) = 2/6</text>
                  </g>
                )}

                {/* HARD MODE LEVEL 1: VENN SET UNION */}
                {difficulty === 'hard' && currentLevel === 1 && (
                  <g>
                    <circle cx="210" cy="150" r="90" fill="rgba(59,130,246,0.12)" stroke={C.blue} strokeWidth="3"/>
                    <text x="150" y="50" fill={C.blue} fontSize="13" fontWeight="bold">Set A (Even)</text>
                    <circle cx="290" cy="150" r="90" fill="rgba(255,138,43,0.12)" stroke={C.orange} strokeWidth="3"/>
                    <text x="350" y="50" fill={C.orange} fontSize="13" fontWeight="bold">Set B (Prime)</text>

                    {/* Element bubble nodes */}
                    <circle cx="150" cy="120" r="12" fill={C.dark} stroke={C.white}/><text x="150" y="124" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
                    <circle cx="180" cy="180" r="12" fill={C.dark} stroke={C.white}/><text x="180" y="184" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">6</text>
                    <circle cx="140" cy="170" r="12" fill={C.dark} stroke={C.white}/><text x="140" y="174" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">8</text>
                    <circle cx="170" cy="210" r="12" fill={C.dark} stroke={C.white}/><text x="170" y="214" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">10</text>

                    <circle cx="250" cy="150" r="14" fill="url(#goldCoin)"/><text x="250" y="154" fill="#5C4000" fontSize="12" fontWeight="black" textAnchor="middle">2</text>

                    <circle cx="330" cy="120" r="12" fill={C.dark} stroke={C.white}/><text x="330" y="124" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
                    <circle cx="310" cy="180" r="12" fill={C.dark} stroke={C.white}/><text x="310" y="184" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">5</text>
                    <circle cx="350" cy="170" r="12" fill={C.dark} stroke={C.white}/><text x="350" y="174" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">7</text>

                    <circle cx="80" cy="80" r="12" fill={C.dark} stroke={C.border}/><text x="80" y="84" fill={C.muted} fontSize="10" textAnchor="middle">1</text>
                    <circle cx="420" cy="80" r="12" fill={C.dark} stroke={C.border}/><text x="420" y="84" fill={C.muted} fontSize="10" textAnchor="middle">9</text>
                  </g>
                )}

                {/* HARD MODE LEVEL 2: CARD SUIT OR FACE */}
                {difficulty === 'hard' && currentLevel === 2 && (
                  <g>
                    {/* Real King of Hearts Card */}
                    <image href="/cards/king_hearts.png" x="65" y="30" width="140" height="205" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
                    <text x="135" y="260" fill={C.orange} fontSize="13" fontWeight="bold" textAnchor="middle">Heart King</text>

                    {/* Real Ace of Hearts Card */}
                    <image href="/cards/ace_hearts.png" x="295" y="30" width="140" height="205" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
                    <text x="365" y="260" fill={C.teal} fontSize="13" fontWeight="bold" textAnchor="middle">Heart Ace</text>
                  </g>
                )}

                {/* HARD MODE LEVEL 3: SPINNER A OR SPINNER B */}
                {difficulty === 'hard' && currentLevel === 3 && (
                  <g>
                    <circle cx="160" cy="150" r="60" fill="#0C0A09" stroke={C.blue} strokeWidth="4"/>
                    <path d="M 160 150 L 160 90 A 60 60 0 0 1 212 180 Z" fill="url(#redSphere)"/>
                    <line x1="160" y1="150" x2="160" y2="90" stroke={C.white}/>
                    <line x1="160" y1="150" x2="108" y2="180" stroke={C.white}/>
                    <line x1="160" y1="150" x2="212" y2="180" stroke={C.white}/>
                    <text x="160" y="70" fill={C.blue} fontSize="12" fontWeight="black" textAnchor="middle">SPINNER A (3 Slices)</text>

                    <circle cx="340" cy="150" r="60" fill="#0C0A09" stroke={C.teal} strokeWidth="4"/>
                    <path d="M 340 150 L 340 90 A 60 60 0 0 1 400 150 Z" fill="url(#redSphere)"/>
                    <line x1="340" y1="90" x2="340" y2="210" stroke={C.white}/>
                    <line x1="280" y1="150" x2="400" y2="150" stroke={C.white}/>
                    <text x="340" y="70" fill={C.teal} fontSize="12" fontWeight="black" textAnchor="middle">SPINNER B (4 Slices)</text>
                  </g>
                )}

                {/* HARD MODE LEVEL 4: OVERLAPPING NUMBER MULTIPLES */}
                {difficulty === 'hard' && currentLevel === 4 && (
                  <g>
                    <rect x="50" y="50" width="400" height="210" fill="rgba(255,255,255,0.01)" stroke={C.border} rx="12"/>
                    <text x="250" y="80" fill={C.white} fontSize="14" fontWeight="bold" textAnchor="middle">Universal Set (1 to 20)</text>

                    <rect x="80" y="110" width="140" height="120" fill="rgba(139,92,246,0.08)" stroke={C.purple} strokeWidth="2" rx="10"/>
                    <text x="150" y="140" fill={C.purple} fontSize="11" fontWeight="bold" textAnchor="middle">MULTIPLE OF 3</text>
                    <text x="150" y="180" fill={C.white} fontSize="11" textAnchor="middle">3, 6, 9, 12, 18</text>

                    <rect x="280" y="110" width="140" height="120" fill="rgba(0,245,212,0.08)" stroke={C.teal} strokeWidth="2" rx="10"/>
                    <text x="350" y="140" fill={C.teal} fontSize="11" fontWeight="bold" textAnchor="middle">MULTIPLE OF 5</text>
                    <text x="350" y="180" fill={C.white} fontSize="11" textAnchor="middle">5, 10, 20</text>

                    <text x="250" y="248" fill={C.gold} fontSize="13" fontWeight="black" textAnchor="middle">Overlap: {15}</text>
                  </g>
                )}

                {/* HARD MODE LEVEL 5: SHAPE SELECTOR OR EVENT */}
                {difficulty === 'hard' && currentLevel === 5 && (
                  <g>
                    <rect x="60" y="60" width="380" height="200" fill="rgba(255,255,255,0.01)" stroke={C.border} rx="12"/>
                    {/* 5 red circles */}
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <circle key={`red-circ-${idx}`} cx={100 + idx * 32} cy="110" r="12" fill="url(#redSphere)" filter="url(#cardShadow)"/>
                    ))}
                    {/* 3 red triangles */}
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <polygon key={`red-tri-${idx}`} points={`${100 + idx * 45},170 ${114 + idx * 45},195 ${86 + idx * 45},195`} fill="#FF8A2B" filter="url(#cardShadow)"/>
                    ))}
                    {/* 2 blue triangles */}
                    {Array.from({ length: 2 }).map((_, idx) => (
                      <polygon key={`blue-tri-${idx}`} points={`${280 + idx * 45},170 ${294 + idx * 45},195 ${266 + idx * 45},195`} fill="#3B82F6" filter="url(#cardShadow)"/>
                    ))}
                  </g>
                )}

                {/* EXTRA HARD MODE LEVEL 1: MARBLE JAR DEPENDENT DRAW TREE */}
                {difficulty === 'extra' && currentLevel === 1 && (
                  <g>
                    {/* Left Jar representing composition with cork lid */}
                    <path d="M 60 70 L 60 170 Q 60 190 90 190 Q 120 190 120 170 L 120 70 Z" fill="rgba(255,255,255,0.03)" stroke={C.white} strokeWidth="3"/>
                    <ellipse cx="90" cy="70" rx="30" ry="8" fill={C.dark} stroke={C.white} strokeWidth="1.5"/>
                    <polygon points="72,58 108,58 102,70 78,70" fill="url(#corkTexture)" filter="url(#cardShadow)"/>
                    
                    <circle cx="80" cy="130" r="8" fill="url(#redSphere)"/>
                    <circle cx="100" cy="140" r="8" fill="url(#redSphere)"/>
                    <circle cx="90" cy="165" r="8" fill="url(#redSphere)"/>
                    <circle cx="105" cy="160" r="8" fill="url(#blueSphere)"/>
                    <circle cx="75" cy="155" r="8" fill="url(#blueSphere)"/>
                    <text x="90" y="215" fill={C.white} fontSize="11" fontWeight="bold" textAnchor="middle">Bag A: 5 Red, 5 Blue</text>

                    {/* Branch Paths */}
                    <line x1="130" y1="130" x2="210" y2="85" stroke={C.white} strokeWidth="3"/>
                    <line x1="130" y1="130" x2="210" y2="175" stroke={C.white} strokeWidth="3"/>

                    {/* First draw results */}
                    <g transform="translate(225, 85)">
                      <circle cx="0" cy="0" r="16" fill="url(#redSphere)" filter="url(#cardShadow)"/>
                      <text x="25" y="4" fill={C.orange} fontSize="12" fontWeight="bold">Draw 1: Red (5/10)</text>
                    </g>
                    <g transform="translate(225, 175)">
                      <circle cx="0" cy="0" r="16" fill="url(#blueSphere)" filter="url(#cardShadow)"/>
                      <text x="25" y="4" fill={C.blue} fontSize="12" fontWeight="bold">Draw 1: Blue (5/10)</text>
                    </g>

                    {/* Secondary Branch Paths */}
                    <line x1="340" y1="85" x2="400" y2="55" stroke={C.white} strokeWidth="2"/>
                    <line x1="340" y1="85" x2="400" y2="115" stroke={C.white} strokeWidth="2"/>

                    <g transform="translate(420, 55)">
                      <circle cx="0" cy="0" r="12" fill="url(#redSphere)" filter="url(#cardShadow)"/>
                      <text x="18" y="4" fill={C.orange} fontSize="11" fontWeight="bold">Red (4/9)</text>
                    </g>
                    <g transform="translate(420, 115)">
                      <circle cx="0" cy="0" r="12" fill="url(#blueSphere)" filter="url(#cardShadow)"/>
                      <text x="18" y="4" fill={C.blue} fontSize="11" fontWeight="bold">Blue (5/9)</text>
                    </g>
                  </g>
                )}

                {/* EXTRA HARD MODE LEVEL 2: CONSECUTIVE CARDS */}
                {difficulty === 'extra' && currentLevel === 2 && (
                  <g>
                    {/* Real J of Spades Card */}
                    <image href="/cards/jack_spades.png" x="65" y="30" width="140" height="205" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
                    <text x="135" y="260" fill={C.white} fontSize="13" fontWeight="bold" textAnchor="middle">Draw 1: 4/52</text>

                    {/* Real J of Hearts Card */}
                    <image href="/cards/jack_hearts.png" x="295" y="30" width="140" height="205" preserveAspectRatio="xMidYMid meet" filter="url(#cardShadow)"/>
                    <text x="365" y="260" fill={C.white} fontSize="13" fontWeight="bold" textAnchor="middle">Draw 2: 3/51</text>
                  </g>
                )}

                {/* EXTRA HARD MODE LEVEL 3: SWEET CANDY BAG */}
                {difficulty === 'extra' && currentLevel === 3 && (
                  <g>
                    {/* Sweet Candy Bag Illustration */}
                    <path d="M 170,90 C 170,90 200,50 250,50 C 300,50 330,90 330,90 C 330,90 380,220 250,250 C 120,220 170,90 170,90 Z" fill="rgba(255,255,255,0.03)" stroke={C.white} strokeWidth="3"/>
                    <path d="M 230,90 Q 250,105 270,90" stroke="#EF4444" strokeWidth="6" fill="none"/>
                    <circle cx="230" cy="90" r="6" fill="#EF4444"/>
                    <circle cx="270" cy="90" r="6" fill="#EF4444"/>
                    
                    {/* Visual wrapped candies */}
                    <g transform="translate(190, 130)">
                      <rect x="0" y="0" width="30" height="16" fill="url(#redSphere)" rx="4"/>
                      <polygon points="-8,-4 0,8 -8,20" fill="#EF4444"/>
                      <polygon points="38,-4 30,8 38,20" fill="#EF4444"/>
                      <text x="15" y="12" fill={C.white} fontSize="8" fontWeight="bold" textAnchor="middle">🍓</text>
                    </g>

                    <g transform="translate(260, 140)">
                      <rect x="0" y="0" width="30" height="16" fill="url(#redSphere)" rx="4"/>
                      <polygon points="-8,-4 0,8 -8,20" fill="#EF4444"/>
                      <polygon points="38,-4 30,8 38,20" fill="#EF4444"/>
                      <text x="15" y="12" fill={C.white} fontSize="8" fontWeight="bold" textAnchor="middle">🍓</text>
                    </g>

                    <g transform="translate(220, 170)">
                      <rect x="0" y="0" width="30" height="16" fill="url(#goldCoin)" rx="4"/>
                      <polygon points="-8,-4 0,8 -8,20" fill="#D49D00"/>
                      <polygon points="38,-4 30,8 38,20" fill="#D49D00"/>
                      <text x="15" y="12" fill="#5C4000" fontSize="8" fontWeight="bold" textAnchor="middle">🍋</text>
                    </g>
                  </g>
                )}

                {/* EXTRA HARD MODE LEVEL 4: DEFECTIVE LIGHTBULBS */}
                {difficulty === 'extra' && currentLevel === 4 && (
                  <g>
                    <rect x="60" y="50" width="380" height="200" fill="rgba(255,255,255,0.01)" stroke={C.white} strokeWidth="2.5" rx="14"/>
                    {/* 3 Defective Bulbs (Dimmed glass with broken filament and warning stroke) */}
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <g key={`def-${idx}`} transform={`translate(${100 + idx * 45}, 110)`}>
                        <path d="M -14 0 C -14 -12 -6 -18 0 -18 C 6 -18 14 -12 14 0 C 14 8 8 12 6 16 L -6 16 C -8 12 -14 8 -14 0 Z" fill="rgba(156,163,175,0.3)" stroke="#EF4444" strokeWidth="2" filter="url(#cardShadow)"/>
                        {/* Broken Filament */}
                        <path d="M -4 16 L -2 4 L -6 0 M 4 16 L 2 4 L 6 2" stroke="#4B5563" strokeWidth="1.5" fill="none"/>
                        {/* Metal Base */}
                        <path d="M -7 16 L 7 16 L 5 24 L -5 24 Z" fill="#9CA3AF" stroke="#4B5563" strokeWidth="1"/>
                        <path d="M -6 18 L 6 18 M -5 21 L 5 21 M -4 24 L 4 27 L -4 27" stroke="#4B5563" strokeWidth="1" fill="none"/>
                        <text x="0" y="-2" fill="#EF4444" fontSize="14" fontWeight="black" textAnchor="middle">✗</text>
                      </g>
                    ))}

                    {/* 7 Healthy Bulbs (Bright glowing yellow) */}
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <g key={`hlth-${idx}`} transform={`translate(${240 + (idx%4) * 45}, ${110 + Math.floor(idx/4)*60})`}>
                        {/* Glow Effect */}
                        <circle cx="0" cy="0" r="18" fill="#FBBF24" opacity="0.3" filter="blur(4px)"/>
                        <path d="M -14 0 C -14 -12 -6 -18 0 -18 C 6 -18 14 -12 14 0 C 14 8 8 12 6 16 L -6 16 C -8 12 -14 8 -14 0 Z" fill="url(#goldCoin)" stroke="#F59E0B" strokeWidth="1" filter="url(#cardShadow)"/>
                        {/* Glowing Filament */}
                        <path d="M -4 16 L -2 4 L 0 0 L 2 4 L 4 16" stroke="#FEF08A" strokeWidth="2" fill="none"/>
                        {/* Metal Base */}
                        <path d="M -7 16 L 7 16 L 5 24 L -5 24 Z" fill="#9CA3AF" stroke="#4B5563" strokeWidth="1"/>
                        <path d="M -6 18 L 6 18 M -5 21 L 5 21 M -4 24 L 4 27 L -4 27" stroke="#4B5563" strokeWidth="1" fill="none"/>
                        <text x="0" y="-2" fill="#78350F" fontSize="12" fontWeight="black" textAnchor="middle">✓</text>
                      </g>
                    ))}
                  </g>
                )}

                {/* EXTRA HARD MODE LEVEL 5: SOCK DRAWER CHOICE */}
                {difficulty === 'extra' && currentLevel === 5 && (
                  <g>
                    {/* Wood Chest Drawer visual graphic */}
                    <rect x="120" y="40" width="260" height="210" fill="#3E2723" rx="10" stroke="#5D4037" strokeWidth="6" filter="url(#cardShadow)"/>
                    <rect x="130" y="55" width="240" height="80" fill="#2B1B17" rx="6" stroke="#4E342E" strokeWidth="3"/>
                    <rect x="130" y="150" width="240" height="80" fill="#2B1B17" rx="6" stroke="#4E342E" strokeWidth="3"/>
                    
                    {/* Brass Handles */}
                    <circle cx="250" cy="95" r="8" fill="url(#goldCoin)"/>
                    <circle cx="250" cy="190" r="8" fill="url(#goldCoin)"/>

                    {/* Cute vector socks hanging out */}
                    <path d="M 160 115 L 160 155 Q 160 165 170 165 L 180 165 Q 185 165 185 155 L 185 115 Z" fill="#FFF" stroke="#2B241E" strokeWidth="1.5"/>
                    <path d="M 160 125 L 185 125 M 160 135 L 185 135 M 160 145 L 185 145" stroke="#3B82F6" strokeWidth="3"/>

                    <path d="M 310 115 L 310 155 Q 310 165 320 165 L 330 165 Q 335 165 335 155 L 335 115 Z" fill="#374151" stroke="#2B241E" strokeWidth="1.5"/>
                    <path d="M 310 125 L 335 125 M 310 135 L 335 135 M 310 145 L 335 145" stroke="#EF4444" strokeWidth="3"/>
                  </g>
                )}

              </svg>
            </div>

            {/* Live Interactive Simulation Output Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '12px',
              border: `1px solid ${C.border}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 800, letterSpacing: '0.5px' }}>EXPERIMENTAL TRIAL CENTER</span>
                <span style={{ fontSize: '0.95rem', color: C.gold, fontWeight: 700, marginTop: '2px' }}>
                  {testResultMsg || 'Click Test Trial to run a simulation run!'}
                </span>
              </div>

              <button
                onClick={runTestTrial}
                disabled={isTesting}
                style={{
                  background: 'none', border: `2px solid ${C.orange}`, color: C.orange,
                  padding: '8px 16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.85rem',
                  cursor: isTesting ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
                  opacity: isTesting ? 0.5 : 1
                }}
              >
                🧪 Run Test Trial
              </button>
            </div>

            {/* CHOICE BUTTONS (Centered white pills matching Image 2) */}
            {((difficulty === 'easy' && currentLevel >= 3) || 
              (difficulty === 'medium' && currentLevel !== 2 && currentLevel !== 4) || 
              (difficulty === 'hard' && currentLevel !== 1 && currentLevel !== 4) || 
              (difficulty === 'extra')) && (
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', margin: '8px 0' }}>
                {(() => {
                  let options = [];
                  let correctIndex = -1;

                  if (difficulty === 'easy') {
                    if (currentLevel === 3) { options = ['1/2', '1/13', '1/26', '1/52']; correctIndex = 2; }
                    else if (currentLevel === 4) { options = ['1/6', '1/3', '1/2', '2/3']; correctIndex = 2; }
                    else if (currentLevel === 5) { options = ['1/11', '2/11', '3/11', '4/11']; correctIndex = 1; }
                  } else if (difficulty === 'medium') {
                    if (currentLevel === 1) { options = ['1/4', '1/2', '3/4', '1']; correctIndex = 2; }
                    else if (currentLevel === 3) { options = ['1/4', '1/8', '1/12', '1/24']; correctIndex = 1; }
                    else if (currentLevel === 5) { options = ['1/3', '1/4', '1/6', '1/12']; correctIndex = 2; }
                  } else if (difficulty === 'hard') {
                    if (currentLevel === 2) { options = ['17/52', '4/13', '9/26', '5/13']; correctIndex = 1; }
                    else if (currentLevel === 3) { options = ['7/12', '1/2', '5/12', '1/3']; correctIndex = 1; }
                    else if (currentLevel === 5) { options = ['0.5', '0.6', '0.7', '0.8']; correctIndex = 2; }
                  } else if (difficulty === 'extra') {
                    if (currentLevel === 1) { options = ['1/4', '2/9', '5/18', '1/3']; correctIndex = 1; }
                    else if (currentLevel === 2) { options = ['1/169', '1/221', '1/2652', '3/676']; correctIndex = 1; }
                    else if (currentLevel === 3) { options = ['4/15', '1/3', '2/15', '8/15']; correctIndex = 0; }
                    else if (currentLevel === 4) { options = ['1/15', '3/100', '1/10', '2/15']; correctIndex = 0; }
                    else if (currentLevel === 5) { options = ['6/25', '4/15', '2/15', '3/10']; correctIndex = 1; }
                  }

                  return options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChoice(idx)}
                      style={{
                        padding: '14px 28px', borderRadius: '12px', 
                        border: activeChoice === idx ? `2px solid ${C.orange}` : '1px solid rgba(0,0,0,0.1)',
                        background: '#FFF7EE', color: '#16120F', 
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transform: activeChoice === idx ? 'scale(1.05)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt}
                    </button>
                  ));
                })()}
              </div>
            )}

            {/* EASY LEVEL 1 INTERACTION */}
            {difficulty === 'easy' && currentLevel === 1 && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => addMarble('red')} style={{ padding: '10px 18px', background: C.orange, border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', color: '#16120F' }}>+ Red</button>
                <button onClick={() => removeMarble('red')} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.white, fontWeight: 800, cursor: 'pointer' }}>- Red</button>
                <button onClick={() => addMarble('blue')} style={{ padding: '10px 18px', background: C.blue, border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', color: '#FFF' }}>+ Blue</button>
                <button onClick={() => removeMarble('blue')} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.white, fontWeight: 800, cursor: 'pointer' }}>- Blue</button>
                <button onClick={() => addMarble('green')} style={{ padding: '10px 18px', background: C.teal, border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', color: '#16120F' }}>+ Green</button>
                <button onClick={() => removeMarble('green')} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: '8px', color: C.white, fontWeight: 800, cursor: 'pointer' }}>- Green</button>
                
                <div style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, color: C.gold, margin: '8px 0' }}>
                  Total Marbles: {jarMarbles.length} (Red: {jarMarbles.filter(m => m.color === 'red').length})
                </div>
              </div>
            )}

            {/* EASY LEVEL 2 INTERACTION */}
            {difficulty === 'easy' && currentLevel === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 800 }}>RED SECTOR ANGLE</span>
                <input 
                  type="range" min="30" max="270" step="30" value={spinnerRedAngle} 
                  onChange={(e) => setSpinnerRedAngle(parseInt(e.target.value))}
                  style={{ width: '280px', accentColor: C.orange }}
                />
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: C.orange }}>
                  {spinnerRedAngle}° degrees
                </div>
              </div>
            )}

            {/* MEDIUM LEVEL 2 HIGHLIGHTS */}
            {difficulty === 'medium' && currentLevel === 2 && (
              <div style={{ textAlign: 'center', fontSize: '0.95rem', color: C.muted }}>
                Highlighted Coordinate Sums: {diceMatrixSelections.length} / 6
              </div>
            )}

            {/* DECIMAL TEXT INPUT FOR HARD/MEDIUM SPECIFIC */}
            {((difficulty === 'medium' && currentLevel === 4) || 
              (difficulty === 'hard' && currentLevel === 1) || 
              (difficulty === 'hard' && currentLevel === 4)) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 800 }}>ENTER DECIMAL PROBABILITY</span>
                <input 
                  type="number" step="0.01" value={userAns} onChange={(e) => setUserAns(e.target.value)}
                  placeholder="e.g. 0.25"
                  style={{
                    width: '180px', padding: '12px', background: C.dark, border: `2px solid ${C.border}`,
                    borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                  }}
                />
              </div>
            )}

            {/* Action buttons at bottom */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
              <button 
                onClick={() => {
                  let isCorrect = false;
                  if (difficulty === 'easy') {
                    if (currentLevel === 1) {
                      const redCount = jarMarbles.filter(m => m.color === 'red').length;
                      const total = jarMarbles.length;
                      isCorrect = total > 0 && Math.abs((redCount / total) - 0.4) < 0.01;
                    } else if (currentLevel === 2) {
                      isCorrect = spinnerRedAngle === 120;
                    } else if (currentLevel === 3) {
                      isCorrect = activeChoice === 2;
                    } else if (currentLevel === 4) {
                      isCorrect = activeChoice === 2;
                    } else if (currentLevel === 5) {
                      isCorrect = activeChoice === 1;
                    }
                  } else if (difficulty === 'medium') {
                    if (currentLevel === 1) isCorrect = activeChoice === 2;
                    else if (currentLevel === 2) {
                      const requiredKeys = ['1-6', '2-5', '3-4', '4-3', '5-2', '6-1'];
                      isCorrect = diceMatrixSelections.length === requiredKeys.length && requiredKeys.every(k => diceMatrixSelections.includes(k));
                    }
                    else if (currentLevel === 3) isCorrect = activeChoice === 1;
                    else if (currentLevel === 4) isCorrect = Math.abs(parseFloat(userAns) - 0.36) < 0.01;
                    else if (currentLevel === 5) isCorrect = activeChoice === 2;
                  } else if (difficulty === 'hard') {
                    if (currentLevel === 1) isCorrect = Math.abs(parseFloat(userAns) - 0.8) < 0.01;
                    else if (currentLevel === 2) isCorrect = activeChoice === 1;
                    else if (currentLevel === 3) isCorrect = activeChoice === 1;
                    else if (currentLevel === 4) isCorrect = Math.abs(parseFloat(userAns) - 0.45) < 0.01;
                    else if (currentLevel === 5) isCorrect = activeChoice === 2;
                  } else if (difficulty === 'extra') {
                    if (currentLevel === 1) isCorrect = activeChoice === 1;
                    else if (currentLevel === 2) isCorrect = activeChoice === 1;
                    else if (currentLevel === 3) isCorrect = activeChoice === 0;
                    else if (currentLevel === 4) isCorrect = activeChoice === 0;
                    else if (currentLevel === 5) isCorrect = activeChoice === 1;
                  }

                  handleEvaluation(isCorrect);
                }}
                style={{
                  background: C.orange, color: '#16120F',
                  padding: '12px 36px', borderRadius: '24px', border: 'none',
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                Submit
              </button>

              <button 
                onClick={() => setShowHint(h => !h)}
                style={{
                  border: `2px solid ${C.white}`, color: C.white,
                  padding: '10px 24px', borderRadius: '24px', background: 'none',
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                }}
              >
                {showHint ? "Hide Answer" : "Show Answer"}
              </button>
            </div>

            {/* Answer Hint Panel */}
            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                    borderRadius: '12px', padding: '16px', marginTop: '8px', textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: C.orange, letterSpacing: '1px' }}>💡 HINT & WORKINGS</span>
                  <p style={{ margin: '6px 0 0 0', fontSize: '1rem', color: C.white, lineHeight: '1.4' }}>
                    {hintText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Celebration Ribbon */}
          <AnimatePresence>
            {ribbonPopup && (
              <motion.div
                initial={{ y: -150, opacity: 0, x: '-50%' }}
                animate={{ y: 0, opacity: 1, x: '-50%' }}
                exit={{ y: -150, opacity: 0, x: '-50%' }}
                style={{ position: 'fixed', top: 0, left: '50%', zIndex: 9999, pointerEvents: 'none' }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #FF8A2B, #FFC857)',
                  padding: '14px 70px', borderRadius: '0 0 30px 30px',
                  boxShadow: '0 15px 40px rgba(255, 138, 43, 0.4)',
                  border: '2px solid rgba(255,255,255,0.2)', borderTop: 'none',
                  color: C.white, fontSize: '1.75rem', fontWeight: 900
                }}>
                  🎉 CORRECT REASONING!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── RESULTS SCREEN ──────────────────────────────────────── */}
      {phase === 'results' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center',
          alignItems: 'center', background: C.bg, zIndex: 100, overflowY: 'auto', padding: '40px 0'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: '600px', background: C.card, borderRadius: '24px',
              border: `1px solid ${C.border}`, padding: '40px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '28px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🏅</span>
              <h2 style={{ margin: '12px 0 4px 0', fontSize: '2.25rem', fontWeight: 900, color: C.white }}>Lab Session Complete!</h2>
              <p style={{ margin: 0, fontSize: '1rem', color: C.muted }}>You successfully completed all the Probability missions.</p>
            </div>

            {/* Discovery Logs Summary */}
            <div style={{
              background: C.dark, borderRadius: '16px', padding: '24px',
              border: `1px solid rgba(255,255,255,0.03)`, display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.orange, letterSpacing: '1px' }}>LOGGED MISSIONS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log, idx) => (
                  <div key={idx} style={{ fontSize: '0.9rem', color: C.white, display: 'flex', gap: '10px' }}>
                    <span style={{ color: C.gold }}>⭐</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: C.muted }}>TOTAL REWARD</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: C.gold }}>+{xp} XP</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: C.muted }}>ACCURACY</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: C.orange }}>100%</div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setPhase('setup')}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${C.border}`,
                  background: 'none', color: C.muted, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Replay Lab
              </button>
              <button 
                onClick={onBack}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(135deg, ${C.orange}, #E65F00)`, color: C.white,
                  fontWeight: 900, cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}

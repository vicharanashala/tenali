import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FONT = "'Plus Jakarta Sans', 'Poppins', system-ui, sans-serif";

const C = {
  bg: '#16120F',
  card: '#2B241E',
  border: 'rgba(255, 255, 255, 0.08)',
  orange: '#FF8A2B',
  gold: '#FFC857',
  white: '#FFF7EE',
  muted: '#B7ACA0',
  dark: '#0C0A09',
  teal: '#00F5D4',
  coral: '#EF4444'
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

export default function PythagLabApp({ onBack }) {
  // Flow states: 'setup' | 'game' | 'results'
  const [phase, setPhase] = useState('setup');
  const [difficulty, setDifficulty] = useState('easy'); // easy | medium | hard
  
  // Game states
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(5);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [logs, setLogs] = useState([]);
  const [ribbonPopup, setRibbonPopup] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showHint, setShowHint] = useState(false);
  
  // Interactive values
  const [easyLegA, setEasyLegA] = useState(3);
  const [easyLegB, setEasyLegB] = useState(4);
  const [showEasyBlocks, setShowEasyBlocks] = useState(false);
  const [scaleSelection, setScaleSelection] = useState(null); // chosen option for converse scale
  const [easyL5Slider, setEasyL5Slider] = useState(10);
  
  // Medium states
  const [medAns, setMedAns] = useState('');
  const [bridgeBuilt, setBridgeBuilt] = useState(false);
  const [ladderProgress, setLadderProgress] = useState(0); 
  const [ladderFired, setLadderFired] = useState(false);
  const [tvSolved, setTvSolved] = useState(false);
  const [cableCarPosition, setCableCarPosition] = useState(0);
  
  // Hard states
  const [hardRotation, setHardRotation] = useState(30); 
  const [hardAns, setHardAns] = useState('');
  const [customNodeA, setCustomNodeA] = useState({ x: 1, y: 1 });
  const [customNodeB, setCustomNodeB] = useState({ x: 9, y: 1 });
  const [customNodeC, setCustomNodeC] = useState({ x: 9, y: 7 }); 
  const [droneFlyProgress, setDroneFlyProgress] = useState(0);
  const [podDocked, setPodDocked] = useState(false);
  const [ambulanceProgress, setAmbulanceProgress] = useState(0);

  const padZero = (val) => val;

  // Set default hint for active level
  useEffect(() => {
    if (phase === 'game') {
      loadLevelHint(currentLevel);
      setShowHint(false);
    }
  }, [phase, currentLevel, difficulty]);

  const loadLevelHint = (lvl) => {
    if (difficulty === 'easy') {
      if (lvl === 1) setHintText("Leg A has 3² = 9 blocks. Leg B has 4² = 16 blocks. Click 'Merge Blocks' to see how 9 + 16 combines to fill the hypotenuse C² (25 blocks)!");
      if (lvl === 2) setHintText("Adjust the leg sliders until Leg A = 6 and Leg B = 8. This will make the hypotenuse Area C² = 6² + 8² = 36 + 64 = 100 blocks!");
      if (lvl === 3) setHintText("Test if a² + b² = c² for each option. For 3-4-5: 3² + 4² = 9 + 16 = 25 (which is 5²). Select 3-4-5 to balance the scale!");
      if (lvl === 4) setHintText("Study the triples: 3-4-5 (3² + 4² = 5²) and 6-8-10. For 5 and 12, the missing hypotenuse value is 13 since 5² + 12² = 25 + 144 = 169 = 13²!");
      if (lvl === 5) setHintText("The vertical pole is 9m and the horizontal shadow is 12m. The diagonal wire forms a right triangle: Wire² = 9² + 12² = 81 + 144 = 225. Set the slider to √225 = 15m.");
    } else if (difficulty === 'medium') {
      if (lvl === 1) setHintText("Calculate the bridge support diagonal L using: L² = 12² + 5² = 144 + 25 = 169. Take the square root of 169 to find the support length (13m).");
      if (lvl === 2) setHintText("The ladder forms a right triangle with the wall (8m) and ground (6m). Ladder² = 6² + 8² = 36 + 64 = 100. Slide to reach √100 = 10m.");
      if (lvl === 3) setHintText("Find the diagonal path: D² = 15² + 8² = 225 + 64 = 289. Take the square root of 289 to find the shortcut distance (17 miles).");
      if (lvl === 4) setHintText("Find the cable length: L² = 70² + 240² = 4900 + 57600 = 62500. Compute √62500 to find the total cable needed (250m).");
      if (lvl === 5) setHintText("The screen dimensions are 16 in by 12 in. The diagonal D² = 16² + 12² = 256 + 144 = 400. Calculate √400 to find the screen diagonal size (20 inches).");
    } else {
      if (lvl === 1) setHintText("The space diagonal of a 3D box uses: D² = width² + depth² + height² = 3² + 4² + 12² = 9 + 16 + 144 = 169. Compute √169 to get the space diagonal (13).");
      if (lvl === 2) setHintText("To create a hypotenuse of 10, the two legs must be 6 and 8. Make Node B align horizontally with A and vertically with C to form a 6-8-10 right-angled triangle.");
      if (lvl === 3) setHintText("3D vector distance formula: D² = x² + y² + z² = 2² + 6² + 9² = 4 + 36 + 81 = 121. Take the square root √121 to get 11.");
      if (lvl === 4) setHintText("The vector coordinates are (12, 5). Docking distance D² = 12² + 5² = 144 + 25 = 169. Calculate √169 to find the docking range (13 light-years).");
      if (lvl === 5) setHintText("Ambulance horizontal travel is 9 - 1 = 8 blocks, vertical travel is 17 - 2 = 15 blocks. D² = 8² + 15² = 64 + 225 = 289. Dispatch range is √289 = 17 blocks.");
    }
  };

  const getLevelQuestion = (lvl) => {
    if (difficulty === 'easy') {
      if (lvl === 1) return { title: "🌱 Square Block Fitter", story: "Can you combine the areas of side A and side B to perfectly cover the hypotenuse? Click the merge action to verify!" };
      if (lvl === 2) return { title: "📐 Growing Triangle Area", story: "Stretch the horizontal and vertical sliders until the hypotenuse square contains exactly 100 blocks (Leg A = 6, Leg B = 8)." };
      if (lvl === 3) return { title: "⚖️ Converse Balance Scale", story: "Select the only right-angled triangle from the choices. Only right triangles (a² + b² = c²) will balance the scale!" };
      if (lvl === 4) return { title: "🧮 Complete the Pattern", story: "Study the sequence of Pythagorean triples: 3-4-5, 6-8-10. Find the missing hypotenuse value for legs 5 and 12." };
      return { title: "☀️ Shadow Projection Wire", story: "A vertical pole of height 9m casts a horizontal shadow of 12m. What is the length of the diagonal wire supporting the pole?" };
    } else if (difficulty === 'medium') {
      if (lvl === 1) return { title: "🌉 Bridging the Canyon Gap", story: "A train needs to cross a canyon. The support gap has a run of 12m and a rise of 5m. Calculate the diagonal strut length." };
      if (lvl === 2) return { title: "🚒 Ladder Rescue Operation", story: "A kitty is stuck in a tower window 8m high. The rescue truck is parked 6m away. Extend the ladder to the correct hypotenuse length." };
      if (lvl === 3) return { title: "🏴‍☠️ Pirate Swamp Shortcut", story: "Leg A is 15 miles and Leg B is 8 miles. Save time by calculating the diagonal shortcut through the swamp." };
      if (lvl === 4) return { title: "🚡 Mountain Cable Car Construction", story: "Build a cableway to the peak. The peak has a vertical height of 240m and horizontal run of 70m. Calculate the cable length." };
      return { title: "💻 Laptop Screen Diagonal Size", story: "A widescreen display is 16 inches wide and 12 inches high. Determine the diagonal screen size of the laptop." };
    } else {
      if (lvl === 1) return { title: "📦 3D Chest Space Diagonal", story: "Solve for the interior space diagonal of a rectangular chest with width 3, depth 4, and height 12 to unlock the treasure." };
      if (lvl === 2) return { title: "📍 Coordinate Grid Designer", story: "Drag the grid coordinate vertices to construct a right-angled triangle that has a hypotenuse of exactly 10 units." };
      if (lvl === 3) return { title: "🛸 3D Vector Drone Flight", story: "Determine the direct straight-line line-of-sight range for a drone flying from coordinate origin (0,0,0) to target (2,6,9)." };
      if (lvl === 4) return { title: "🚀 Space Station Docking Vector", story: "A pod is at coordinate (0,0) and needs to dock at station (12,5). Calculate the direct docking vector length." };
      return { title: "🚨 Emergency Dispatch Shortest Route", story: "An ambulance at (1,2) is dispatched to an accident at (9,17). Find the shortest straight-line diagonal route." };
    }
  };

  const nextLevel = () => {
    setRibbonPopup(false);
    if (currentLevel < totalLevels) {
      setCurrentLevel(l => l + 1);
      // Reset level variables
      setMedAns('');
      setHardAns('');
      setBridgeBuilt(false);
      setLadderFired(false);
      setLadderProgress(0);
      setShowEasyBlocks(false);
      setScaleSelection(null);
      setEasyL5Slider(10);
      setTvSolved(false);
      setCableCarPosition(0);
      setDroneFlyProgress(0);
      setPodDocked(false);
      setAmbulanceProgress(0);
    } else {
      triggerConfetti();
      setPhase('results');
    }
  };

  const handleEvaluation = (isCorrect) => {
    if (isCorrect) {
      setXp(x => x + 50);
      triggerConfetti();
      setLogs(prev => [...new Set([...prev, `Completed ${difficulty.toUpperCase()} Level ${currentLevel}`])]);
      setRibbonPopup(true);
      setTimeout(nextLevel, 2500);
    } else {
      setLives(l => Math.max(0, l - 1));
      setHintText("Oops! That wasn't correct. Try checking your math or use a hint!");
    }
  };

  // Easy Level Actions
  const triggerEasyBlockMerge = () => {
    setShowEasyBlocks(true);
    setTimeout(() => {
      handleEvaluation(true);
    }, 2200);
  };

  const checkEasyLevel2 = () => {
    const isCorrect = easyLegA === 6 && easyLegB === 8;
    handleEvaluation(isCorrect);
  };

  const checkEasyLevel3 = (chosenIdx) => {
    setScaleSelection(chosenIdx);
    const isCorrect = chosenIdx === 0; // index 0 is 3-4-5 (correct right triangle)
    setTimeout(() => {
      handleEvaluation(isCorrect);
    }, 1500);
  };

  const checkEasyLevel4 = (chosenVal) => {
    const isCorrect = chosenVal === 13;
    handleEvaluation(isCorrect);
  };

  const checkEasyLevel5 = () => {
    const isCorrect = easyL5Slider === 15;
    handleEvaluation(isCorrect);
  };

  // Medium Level Actions
  const checkMedLevel1 = () => {
    const isCorrect = parseInt(medAns) === 13;
    if (isCorrect) {
      setBridgeBuilt(true);
      setTimeout(() => handleEvaluation(true), 1500);
    } else {
      handleEvaluation(false);
    }
  };

  const checkMedLevel2 = () => {
    const isCorrect = parseInt(ladderProgress) === 10;
    setLadderFired(true);
    setTimeout(() => {
      handleEvaluation(isCorrect);
      if (!isCorrect) setLadderFired(false);
    }, 1500);
  };

  const checkMedLevel3 = () => {
    const isCorrect = parseInt(medAns) === 17;
    handleEvaluation(isCorrect);
  };

  const checkMedLevel4 = () => {
    const isCorrect = parseInt(medAns) === 250;
    if (isCorrect) {
      setCableCarPosition(100);
      setTimeout(() => handleEvaluation(true), 1500);
    } else {
      handleEvaluation(false);
    }
  };

  const checkMedLevel5 = () => {
    const isCorrect = parseInt(medAns) === 20;
    if (isCorrect) {
      setTvSolved(true);
      setTimeout(() => handleEvaluation(true), 1500);
    } else {
      handleEvaluation(false);
    }
  };

  // Hard Level Actions
  const checkHardLevel1 = () => {
    const isCorrect = parseInt(hardAns) === 13;
    handleEvaluation(isCorrect);
  };

  const checkHardLevel2 = () => {
    const legX = Math.abs(customNodeB.x - customNodeA.x);
    const legY = Math.abs(customNodeC.y - customNodeB.y);
    const isRightTriangle = customNodeB.x === customNodeC.x && customNodeB.y === customNodeA.y;
    const isCorrectHypot = (legX === 6 && legY === 8) || (legX === 8 && legY === 6);
    handleEvaluation(isRightTriangle && isCorrectHypot);
  };

  const checkHardLevel3 = () => {
    const isCorrect = parseInt(hardAns) === 11;
    if (isCorrect) {
      setDroneFlyProgress(100);
      setTimeout(() => handleEvaluation(true), 1500);
    } else {
      handleEvaluation(false);
    }
  };

  const checkHardLevel4 = () => {
    const isCorrect = parseInt(hardAns) === 13;
    if (isCorrect) {
      setPodDocked(true);
      setTimeout(() => handleEvaluation(true), 1500);
    } else {
      handleEvaluation(false);
    }
  };

  const checkHardLevel5 = () => {
    const isCorrect = parseInt(hardAns) === 17;
    if (isCorrect) {
      setAmbulanceProgress(100);
      setTimeout(() => handleEvaluation(true), 1500);
    } else {
      handleEvaluation(false);
    }
  };

  // Project 3D coordinate (x,y,z) to 2D view space
  const project3D = (x, y, z) => {
    const rad = (hardRotation * Math.PI) / 180;
    const rotX = x * Math.cos(rad) - z * Math.sin(rad);
    const rotZ = x * Math.sin(rad) + z * Math.cos(rad);
    const px = 250 + rotX * 16;
    const py = 250 - y * 16 + rotZ * 8;
    return { x: px, y: py };
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: C.bg, color: C.white, fontFamily: FONT,
      overflow: 'hidden', position: 'relative'
    }}>
      
      {/* ── Background Floating Symbols ─────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.05 }}>
        {['a²+b²=c²', '3²', '4²', '5²', '√169', '3D', '📐', '📏'].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${(i * 19) % 95}%`, top: `${(i * 17) % 90}%`,
            fontSize: '2.5rem', fontWeight: 900, color: C.orange
          }}>{s}</div>
        ))}
      </div>

      {/* ── SETUP SCREEN ────────────────────────────────────────── */}
      {phase === 'setup' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center',
          alignItems: 'center', background: 'rgba(22, 18, 15, 0.85)', zIndex: 100
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: '580px', background: C.card, borderRadius: '24px',
              border: `1px solid ${C.border}`, padding: '40px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '28px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.25rem', color: C.white, fontWeight: 700 }}>Unveil the ancient math secret through grids, wireframes, and physics.</p>
            </div>

            {/* Select difficulty */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.muted, marginBottom: '8px', letterSpacing: '1px' }}>CHOOSE YOUR LAB</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
                {['easy', 'medium', 'hard'].map(d => (
                  <button 
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      padding: '14px', borderRadius: '12px', border: `2px solid ${difficulty === d ? C.orange : 'rgba(255,255,255,0.05)'}`,
                      background: difficulty === d ? 'rgba(255,138,43,0.1)' : C.bg,
                      color: difficulty === d ? C.orange : C.muted, fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem'
                    }}
                  >
                    {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', width: '100%', alignItems: 'center' }}>
              <button 
                onClick={() => {
                  setCurrentLevel(1);
                  setPhase('game');
                }}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: `linear-gradient(135deg, ${C.orange}, #E65F00)`, color: C.bg,
                  fontWeight: 900, fontSize: '1.25rem', cursor: 'pointer',
                  boxShadow: `0 10px 25px rgba(255,138,43,0.3)`
                }}
              >
                Launch Game
              </button>

              <button 
                onClick={onBack}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px', border: `1px solid ${C.border}`,
                  background: 'none', color: C.muted, fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
                }}
              >
                Back to Dashboard
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* ── PLAYING GAME ────────────────────────────────────────── */}
      {phase === 'game' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Top Panel: Sleek Back & Progress Bar */}
          <header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 32px', borderBottom: `1px solid ${C.border}`,
            background: C.card, zIndex: 10
          }}>
            <button 
              onClick={() => setPhase('setup')}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', color: C.white,
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
              }}
            >
              ← Setup Lab
            </button>

            {/* Custom Premium Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.9rem', color: C.muted, fontWeight: 700, letterSpacing: '0.5px' }}>LEVEL PROGRESS</span>
              <div style={{
                width: '240px', height: '10px', background: 'rgba(22, 18, 15, 0.6)',
                borderRadius: '5px', overflow: 'hidden', border: `1px solid ${C.border}`,
                position: 'relative'
              }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentLevel / totalLevels) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`,
                    boxShadow: `0 0 10px ${C.orange}`
                  }}
                />
              </div>
              <span style={{ fontSize: '0.9rem', color: C.orange, fontWeight: 800, fontFamily: 'monospace' }}>
                {currentLevel} / {totalLevels}
              </span>
            </div>
          </header>

          {/* Main workspace container centered */}
          <div style={{
            flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'radial-gradient(circle at center, #1C1713 0%, #0F0B09 100%)',
            padding: '24px', overflowY: 'auto'
          }}>
            
            {/* Two Column Layout Card */}
            <div style={{
              width: '100%', maxWidth: '950px', background: C.card,
              borderRadius: '24px', border: `1px solid ${C.border}`,
              boxShadow: '0 15px 40px rgba(0,0,0,0.5)', display: 'grid',
              gridTemplateColumns: '1.2fr 1fr', overflow: 'hidden'
            }}>
              
              {/* Left Column: Visual Viewport */}
              <div style={{
                padding: '32px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '20px', borderRight: `1px solid ${C.border}`
              }}>
                {/* Proper Student-Facing Question Header */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${C.border}`,
                  padding: '20px 24px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '400px',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.15)`
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', color: C.gold, fontWeight: 900, letterSpacing: '0.5px' }}>
                    {getLevelQuestion(currentLevel).title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: C.white, lineHeight: '1.5', fontWeight: 500 }}>
                    {getLevelQuestion(currentLevel).story}
                  </p>
                </div>

                {/* SVG Visual Stage */}
                <div style={{
                  position: 'relative', width: '380px', height: '380px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  {/* Outer glow ring */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    border: `1px dashed rgba(255,138,43,0.06)`, borderRadius: '50%',
                    pointerEvents: 'none'
                  }}></div>

                  <svg width="100%" height="100%" viewBox="0 0 500 500" style={{ zIndex: 2 }}>
                    
                    {/* EASY MODE LEVEL 1: SQUARE BLOCK FITTER */}
                    {difficulty === 'easy' && currentLevel === 1 && (
                      <g>
                        <polygon points="180,320 300,320 300,230" fill="none" stroke={C.white} strokeWidth="3"/>
                        <rect x="180" y="320" width="120" height="120" fill="rgba(0,245,212,0.15)" stroke={C.teal} strokeWidth="1.5"/>
                        <rect x="300" y="230" width="90" height="90" fill="rgba(255,138,43,0.15)" stroke={C.orange} strokeWidth="1.5"/>
                        
                        <g transform="translate(300,230) rotate(36.87)">
                          <rect x="-150" y="-150" width="150" height="150" fill="none" stroke={C.gold} strokeWidth="2.5" strokeDasharray="4 4"/>
                        </g>

                        {/* 9 Blocks */}
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const xOffset = (idx % 3) * 40 + 180;
                          const yOffset = Math.floor(idx / 3) * 40 + 320;
                          return (
                            <motion.rect 
                              key={`a-${idx}`} x={xOffset} y={yOffset} width="38" height="38" fill={C.teal} opacity="0.85" rx="3"
                              animate={showEasyBlocks ? {
                                x: [xOffset, 200 + (idx % 3) * 30],
                                y: [yOffset, 120 + Math.floor(idx / 3) * 30],
                                rotate: [0, 36.87]
                              } : {}}
                              transition={{ duration: 1.8, ease: 'easeInOut' }}
                            />
                          );
                        })}

                        {/* 16 Blocks */}
                        {Array.from({ length: 16 }).map((_, idx) => {
                          const xOffset = (idx % 4) * 22.5 + 300;
                          const yOffset = Math.floor(idx / 4) * 22.5 + 230;
                          return (
                            <motion.rect 
                              key={`b-${idx}`} x={xOffset} y={yOffset} width="21" height="21" fill={C.orange} opacity="0.85" rx="2"
                              animate={showEasyBlocks ? {
                                x: [xOffset, 290 + (idx % 4) * 22],
                                y: [yOffset, 180 + Math.floor(idx / 4) * 22],
                                rotate: [0, 36.87]
                              } : {}}
                              transition={{ duration: 1.8, ease: 'easeInOut' }}
                            />
                          );
                        })}

                        <text x="240" y="460" fill={C.teal} fontSize="12" fontWeight="bold" textAnchor="middle">Side A² (9 Blocks)</text>
                        <text x="345" y="340" fill={C.orange} fontSize="12" fontWeight="bold" textAnchor="middle">Side B² (16 Blocks)</text>
                      </g>
                    )}

                    {/* EASY MODE LEVEL 2: GROWING TRIANGLE */}
                    {difficulty === 'easy' && currentLevel === 2 && (
                      <g>
                        {(() => {
                          const originX = 180;
                          const originY = 320;
                          const w = easyLegA * 25;
                          const h = easyLegB * 25;

                          return (
                            <g>
                              <polygon points={`${originX},${originY} ${originX + w},${originY} ${originX + w},${originY - h}`} fill="rgba(255,255,255,0.02)" stroke={C.white} strokeWidth="3"/>
                              <rect x={originX} y={originY} width={w} height={w} fill="none" stroke={C.teal} strokeWidth="1.5" strokeDasharray="3 3"/>
                              <rect x={originX + w} y={originY - h} width={h} height={h} fill="none" stroke={C.orange} strokeWidth="1.5" strokeDasharray="3 3"/>

                              <text x={originX + w/2} y={originY + 18} fill={C.teal} fontSize="12" fontWeight="bold" textAnchor="middle">A = {easyLegA} (A² = {easyLegA*easyLegA})</text>
                              <text x={originX + w + h/2} y={originY - h/2} fill={C.orange} fontSize="12" fontWeight="bold" textAnchor="middle">B = {easyLegB} (B² = {easyLegB*easyLegB})</text>
                              <text x={originX + w/2 - 20} y={originY - h/2 - 10} fill={C.gold} fontSize="13" fontWeight="bold">C² = {easyLegA*easyLegA + easyLegB*easyLegB}</text>
                            </g>
                          );
                        })()}
                      </g>
                    )}

                    {/* EASY MODE LEVEL 3: BALANCE SCALE */}
                    {difficulty === 'easy' && currentLevel === 3 && (
                      <g>
                        <line x1="150" y1="320" x2="350" y2="320" stroke={C.white} strokeWidth="4" 
                          transform={`rotate(${scaleSelection === null ? 0 : scaleSelection === 0 ? 0 : scaleSelection === 1 ? 15 : -15}, 250, 320)`}
                        />
                        <polygon points="250,320 240,370 260,370" fill={C.gold}/>

                        <g transform={`translate(${scaleSelection === null ? 150 : scaleSelection === 0 ? 150 : scaleSelection === 1 ? 155 : 145}, ${scaleSelection === null ? 320 : scaleSelection === 0 ? 320 : scaleSelection === 1 ? 335 : 305})`}>
                          <line x1="-30" y1="0" x2="30" y2="0" stroke={C.orange} strokeWidth="3"/>
                          <text x="0" y="20" fill={C.orange} fontSize="11" fontWeight="bold" textAnchor="middle">a² + b²</text>
                        </g>

                        <g transform={`translate(${scaleSelection === null ? 350 : scaleSelection === 0 ? 350 : scaleSelection === 1 ? 345 : 355}, ${scaleSelection === null ? 320 : scaleSelection === 0 ? 320 : scaleSelection === 1 ? 305 : 335})`}>
                          <line x1="-30" y1="0" x2="30" y2="0" stroke={C.teal} strokeWidth="3"/>
                          <text x="0" y="20" fill={C.teal} fontSize="11" fontWeight="bold" textAnchor="middle">c²</text>
                        </g>
                      </g>
                    )}

                    {/* EASY MODE LEVEL 4: COMPLETE THE PATTERN */}
                    {difficulty === 'easy' && currentLevel === 4 && (
                      <g>
                        <rect x="50" y="100" width="400" height="240" fill="rgba(255,255,255,0.02)" stroke={C.border} rx="12"/>
                        <text x="250" y="150" fill={C.white} fontSize="18" fontWeight="bold" textAnchor="middle">Pythagorean Pattern</text>
                        
                        <text x="250" y="200" fill={C.teal} fontSize="20" fontWeight="bold" textAnchor="middle">3² + 4² = 5²</text>
                        <text x="250" y="240" fill={C.orange} fontSize="20" fontWeight="bold" textAnchor="middle">6² + 8² = 10²</text>
                        <text x="250" y="280" fill={C.gold} fontSize="20" fontWeight="bold" textAnchor="middle">5² + 12² = ?²</text>
                      </g>
                    )}

                    {/* EASY MODE LEVEL 5: SHADOW PROJECTION */}
                    {difficulty === 'easy' && currentLevel === 5 && (
                      <g>
                        {/* Pole */}
                        <line x1="150" y1="350" x2="150" y2="170" stroke={C.white} strokeWidth="5"/>
                        {/* Shadow */}
                        <line x1="150" y1="350" x2="390" y2="350" stroke={C.muted} strokeWidth="4"/>
                        {/* Light Source */}
                        <circle cx="150" cy="120" r="10" fill={C.gold}/>
                        <line x1="150" y1="120" x2="390" y2="350" stroke={C.orange} strokeWidth="2" strokeDasharray="3 3"/>

                        <text x="120" y="260" fill={C.white} fontSize="11" fontWeight="bold">Pole = 9m</text>
                        <text x="270" y="380" fill={C.muted} fontSize="11" fontWeight="bold">Shadow = 12m</text>
                      </g>
                    )}

                    {/* MEDIUM MODE LEVEL 1: BROKEN BRIDGE */}
                    {difficulty === 'medium' && currentLevel === 1 && (
                      <g>
                        <rect x="0" y="320" width="130" height="180" fill="#2B241E"/>
                        <rect x="370" y="230" width="130" height="270" fill="#2B241E"/>
                        <line x1="130" y1="320" x2="370" y2="320" stroke={C.muted} strokeWidth="2" strokeDasharray="5 5"/>
                        <line x1="370" y1="320" x2="370" y2="230" stroke={C.muted} strokeWidth="2" strokeDasharray="5 5"/>

                        {bridgeBuilt && (
                          <motion.line 
                            initial={{ x2: 130, y2: 320 }}
                            animate={{ x2: 370, y2: 230 }}
                            transition={{ duration: 1.2 }}
                            x1="130" y1="320" x2="370" y2="230" stroke={C.gold} strokeWidth="6"
                          />
                        )}

                        <text x="250" y="350" fill={C.teal} fontSize="12" fontWeight="bold" textAnchor="middle">Run = 12m</text>
                        <text x="410" y="280" fill={C.orange} fontSize="12" fontWeight="bold" textAnchor="middle">Rise = 5m</text>

                        <motion.g 
                          animate={bridgeBuilt ? { x: [0, 400] } : {}}
                          transition={{ duration: 3, delay: 1 }}
                          transform="translate(20, 290)"
                        >
                          <rect x="0" y="0" width="50" height="25" fill={C.orange} rx="4"/>
                          <circle cx="12" cy="27" r="6" fill={C.white}/>
                          <circle cx="38" cy="27" r="6" fill={C.white}/>
                        </motion.g>
                      </g>
                    )}

                    {/* MEDIUM MODE LEVEL 2: LADDER RESCUE */}
                    {difficulty === 'medium' && currentLevel === 2 && (
                      <g>
                        <rect x="320" y="100" width="80" height="300" fill="#2B241E"/>
                        <rect x="310" y="180" width="20" height="30" fill={C.gold} opacity="0.8"/>
                        <text x="320" y="170" fill={C.gold} fontSize="9" fontWeight="bold" textAnchor="middle">WINDOW (8m)</text>
                        <line x1="80" y1="400" x2="420" y2="400" stroke={C.muted} strokeWidth="3"/>
                        <text x="260" y="425" fill={C.teal} fontSize="12" fontWeight="bold" textAnchor="middle">Distance = 6m</text>

                        <rect x="140" y="360" width="60" height="40" fill={C.coral} rx="6"/>
                        <circle cx="155" cy="400" r="8" fill={C.white}/>
                        <circle cx="185" cy="400" r="8" fill={C.white}/>

                        {(() => {
                          const baseScale = 20;
                          const lengthPx = ladderProgress * baseScale;
                          const angle = 53.13;
                          return (
                            <line 
                              x1="200" y1="370" 
                              x2={200 + Math.cos((angle * Math.PI) / 180) * lengthPx} 
                              y2={370 - Math.sin((angle * Math.PI) / 180) * lengthPx} 
                              stroke={C.gold} 
                              strokeWidth="5" 
                              strokeLinecap="round"
                            />
                          );
                        })()}
                      </g>
                    )}

                    {/* MEDIUM MODE LEVEL 3: PIRATE SWAMP SHORTCUT */}
                    {difficulty === 'medium' && currentLevel === 3 && (
                      <g>
                        <polygon points="120,120 380,120 380,360" fill="none" stroke={C.white} strokeWidth="2.5" strokeDasharray="3 3"/>
                        <circle cx="120" cy="120" r="12" fill={C.orange}/>
                        <path d="M 140 140 Q 250 200 360 340 Z" fill="rgba(0, 245, 212, 0.08)" stroke="rgba(0, 245, 212, 0.3)" strokeDasharray="4"/>
                        <circle cx="380" cy="360" r="10" fill={C.gold}/>
                        <text x="250" y="80" fill={C.white} fontSize="12" fontWeight="bold" textAnchor="middle">Leg A = 15 miles</text>
                        <text x="430" y="250" fill={C.white} fontSize="12" fontWeight="bold" textAnchor="middle">Leg B = 8 miles</text>
                      </g>
                    )}

                    {/* MEDIUM MODE LEVEL 4: MOUNTAIN CABLE CAR */}
                    {difficulty === 'medium' && currentLevel === 4 && (
                      <g>
                        {/* Mountain Slope */}
                        <polygon points="50,400 400,400 400,160" fill="none" stroke={C.white} strokeWidth="2.5"/>
                        <circle cx="50" cy="400" r="10" fill={C.teal}/>
                        <circle cx="400" cy="160" r="10" fill={C.gold}/>
                        <line x1="50" y1="400" x2="400" y2="160" stroke={C.orange} strokeWidth="2" strokeDasharray="4 4"/>

                        <text x="220" y="420" fill={C.teal} fontSize="11" fontWeight="bold">Run = 70m</text>
                        <text x="440" y="280" fill={C.gold} fontSize="11" fontWeight="bold">Peak = 240m</text>

                        {/* Cable Car */}
                        <g transform={`translate(${50 + (cableCarPosition/100)*350}, ${400 - (cableCarPosition/100)*240})`}>
                          <rect x="-15" y="-30" width="30" height="20" fill={C.orange} rx="3"/>
                          <line x1="0" y1="-30" x2="0" y2="-10" stroke={C.white} strokeWidth="2"/>
                        </g>
                      </g>
                    )}

                    {/* MEDIUM MODE LEVEL 5: TV SCREEN SIZE */}
                    {difficulty === 'medium' && currentLevel === 5 && (
                      <g>
                        <rect x="80" y="120" width="340" height="255" fill="#1C1713" stroke={C.white} strokeWidth="6" rx="8"/>
                        {/* Diagonal arrow */}
                        <line x1="80" y1="375" x2="420" y2="120" stroke={C.orange} strokeWidth="3" strokeDasharray="5 5"/>

                        <text x="250" y="390" fill={C.teal} fontSize="12" fontWeight="bold" textAnchor="middle">Width = 16 inches</text>
                        <text x="50" y="250" fill={C.orange} fontSize="12" fontWeight="bold" textAnchor="middle" transform="rotate(-90 50 250)">Height = 12 inches</text>

                        {tvSolved && (
                          <g transform="translate(100, 140)">
                            <text x="150" y="100" fill={C.gold} fontSize="24" fontWeight="black" textAnchor="middle">📺 MOVIE PLAYING</text>
                          </g>
                        )}
                      </g>
                    )}

                    {/* HARD MODE LEVEL 1: 3D SPACE DIAGONAL */}
                    {difficulty === 'hard' && currentLevel === 1 && (
                      <g>
                        {(() => {
                          const c000 = project3D(0, 0, 0);
                          const c100 = project3D(8, 0, 0);
                          const c110 = project3D(8, 6, 0);
                          const c010 = project3D(0, 6, 0);
                          const c001 = project3D(0, 0, 6);
                          const c101 = project3D(8, 0, 6);
                          const c111 = project3D(8, 6, 6);
                          const c011 = project3D(0, 6, 6);

                          return (
                            <g>
                              <line x1={c000.x} y1={c000.y} x2={c100.x} y2={c100.y} stroke={C.muted} strokeWidth="1"/>
                              <line x1={c100.x} y1={c100.y} x2={c101.x} y2={c101.y} stroke={C.muted} strokeWidth="1"/>
                              <line x1={c101.x} y1={c101.y} x2={c001.x} y2={c001.y} stroke={C.muted} strokeWidth="1"/>
                              <line x1={c001.x} y1={c001.y} x2={c000.x} y2={c000.y} stroke={C.muted} strokeWidth="1"/>

                              <line x1={c010.x} y1={c010.y} x2={c110.x} y2={c110.y} stroke={C.muted} strokeWidth="1.5"/>
                              <line x1={c110.x} y1={c110.y} x2={c111.x} y2={c111.y} stroke={C.muted} strokeWidth="1.5"/>
                              <line x1={c111.x} y1={c111.y} x2={c011.x} y2={c011.y} stroke={C.muted} strokeWidth="1.5"/>
                              <line x1={c011.x} y1={c011.y} x2={c010.x} y2={c010.y} stroke={C.muted} strokeWidth="1.5"/>

                              <line x1={c000.x} y1={c000.y} x2={c010.x} y2={c010.y} stroke={C.muted} strokeWidth="1"/>
                              <line x1={c100.x} y1={c100.y} x2={c110.x} y2={c110.y} stroke={C.muted} strokeWidth="1"/>
                              <line x1={c101.x} y1={c101.y} x2={c111.x} y2={c111.y} stroke={C.muted} strokeWidth="1"/>
                              <line x1={c001.x} y1={c001.y} x2={c011.x} y2={c011.y} stroke={C.muted} strokeWidth="1"/>

                              <line x1={c000.x} y1={c000.y} x2={c111.x} y2={c111.y} stroke={C.gold} strokeWidth="3.5" strokeDasharray="3 3"/>
                              <text x={c000.x - 20} y={c000.y} fill={C.teal} fontSize="11" fontWeight="bold">Start (3x4x12 Chest)</text>
                            </g>
                          );
                        })()}
                      </g>
                    )}

                    {/* HARD MODE LEVEL 2: CUSTOM TRIANGLE DESIGNER */}
                    {difficulty === 'hard' && currentLevel === 2 && (
                      <g>
                        {Array.from({ length: 11 }).map((_, idx) => (
                          <g key={idx}>
                            <line x1="50" y1={50 + idx * 30} x2="350" y2={50 + idx * 30} stroke="rgba(255,255,255,0.03)"/>
                            <line x1={50 + idx * 30} y1="50" x2={50 + idx * 30} y2="350" stroke="rgba(255,255,255,0.03)"/>
                          </g>
                        ))}

                        {(() => {
                          const axPx = 50 + customNodeA.x * 30;
                          const ayPx = 350 - customNodeA.y * 30;
                          const bxPx = 50 + customNodeB.x * 30;
                          const byPx = 350 - customNodeB.y * 30;
                          const cxPx = 50 + customNodeC.x * 30;
                          const cyPx = 350 - customNodeC.y * 30;

                          return (
                            <g>
                              <polygon points={`${axPx},${ayPx} ${bxPx},${byPx} ${cxPx},${cyPx}`} fill="rgba(255,138,43,0.08)" stroke={C.orange} strokeWidth="2.5"/>
                              <circle cx={axPx} cy={ayPx} r="10" fill={C.teal}/>
                              <circle cx={bxPx} cy={byPx} r="10" fill={C.white}/>
                              <circle cx={cxPx} cy={cyPx} r="10" fill={C.gold}/>
                              
                              <text x={axPx} y={ayPx - 15} fill={C.teal} fontSize="10" fontWeight="bold" textAnchor="middle">A ({customNodeA.x},{customNodeA.y})</text>
                              <text x={bxPx} y={byPx + 20} fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">B ({customNodeB.x},{customNodeB.y})</text>
                              <text x={cxPx} y={cyPx - 15} fill={C.gold} fontSize="10" fontWeight="bold" textAnchor="middle">C ({customNodeC.x},{customNodeC.y})</text>
                            </g>
                          );
                        })()}
                      </g>
                    )}

                    {/* HARD MODE LEVEL 3: 3D DRONE NAVIGATION */}
                    {difficulty === 'hard' && currentLevel === 3 && (
                      <g>
                        {(() => {
                          const base = project3D(0, 0, 0);
                          const target = project3D(2, 6, 9);
                          const currentPos = project3D((droneFlyProgress/100)*2, (droneFlyProgress/100)*6, (droneFlyProgress/100)*9);
                          return (
                            <g>
                              <line x1={base.x} y1={base.y} x2={base.x + 100} y2={base.y} stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                              <line x1={base.x} y1={base.y} x2={base.x} y2={base.y - 100} stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                              <line x1={base.x} y1={base.y} x2={base.x - 50} y2={base.y + 50} stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>

                              <line x1={base.x} y1={base.y} x2={target.x} y2={target.y} stroke={C.gold} strokeWidth="3" strokeDasharray="3 3"/>
                              <circle cx={currentPos.x} cy={currentPos.y} r="12" fill={C.orange}/>
                              <text x={target.x} y={target.y - 20} fill={C.orange} fontSize="9" fontWeight="bold" textAnchor="middle">TARGET (2,6,9)</text>
                            </g>
                          );
                        })()}
                      </g>
                    )}

                    {/* HARD MODE LEVEL 4: SPACE STATION DOCKING */}
                    {difficulty === 'hard' && currentLevel === 4 && (
                      <g>
                        {/* Space station */}
                        <circle cx="360" cy="180" r="28" fill="rgba(255,255,255,0.05)" stroke={C.gold} strokeWidth="4"/>
                        <circle cx="360" cy="180" r="14" fill={C.gold}/>
                        <text x="360" y="225" fill={C.gold} fontSize="11" fontWeight="bold" textAnchor="middle">STATION (12, 5)</text>

                        {/* Space pod */}
                        <motion.g 
                          animate={podDocked ? { x: 260, y: 80 } : {}}
                          transition={{ duration: 2 }}
                          transform="translate(100, 300)"
                        >
                          <polygon points="0,-12 12,12 -12,12" fill={C.teal}/>
                          <text x="0" y="24" fill={C.teal} fontSize="10" fontWeight="bold" textAnchor="middle">POD (0,0)</text>
                        </motion.g>

                        <line x1="100" y1="300" x2="360" y2="180" stroke="rgba(255,138,43,0.2)" strokeWidth="2" strokeDasharray="4 4"/>
                      </g>
                    )}

                    {/* HARD MODE LEVEL 5: CITY EMERGENCY GRID */}
                    {difficulty === 'hard' && currentLevel === 5 && (
                      <g>
                        {/* City Grid overlay */}
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <g key={idx}>
                            <line x1="50" y1={80 + idx * 50} x2="400" y2={80 + idx * 50} stroke="rgba(255,255,255,0.03)"/>
                            <line x1={50 + idx * 50} y1="80" x2={50 + idx * 50} y2="330" stroke="rgba(255,255,255,0.03)"/>
                          </g>
                        ))}

                        {/* Ambulance */}
                        <g transform={`translate(${80 + (ambulanceProgress/100)*240}, ${280 - (ambulanceProgress/100)*150})`}>
                          <rect x="-18" y="-12" width="36" height="24" fill={C.coral} rx="4"/>
                          <rect x="6" y="-8" width="8" height="16" fill={C.white}/>
                          <text x="0" y="4" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">🚑</text>
                        </g>

                        {/* Accident scene */}
                        <circle cx="320" cy="130" r="14" fill={C.gold} opacity="0.3" className="pulse"/>
                        <circle cx="320" cy="130" r="8" fill={C.gold}/>
                        <text x="320" y="110" fill={C.gold} fontSize="9" fontWeight="bold" textAnchor="middle">ACCIDENT</text>

                        <line x1="80" y1="280" x2="320" y2="130" stroke={C.orange} strokeWidth="2" strokeDasharray="3 3"/>
                      </g>
                    )}

                  </svg>
                </div>
              </div>

              {/* Right Column: Console Controls */}
              <div style={{
                padding: '32px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.1)'
              }}>
                
                {/* Active helper description text */}
                {!showHint ? (
                  <button 
                    onClick={() => setShowHint(true)}
                    style={{
                      width: '100%', maxWidth: '320px', background: 'rgba(255,138,43,0.08)',
                      border: `1px solid rgba(255,138,43,0.35)`, color: C.orange,
                      padding: '16px', borderRadius: '12px', fontSize: '1rem',
                      fontWeight: 900, cursor: 'pointer', marginBottom: '24px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 15px rgba(255,138,43,0.1)'
                    }}
                  >
                    💡 Reveal Hint & Solution
                  </button>
                ) : (
                  <div style={{
                    background: 'rgba(255,138,43,0.06)',
                    border: `1px solid rgba(255,138,43,0.25)`,
                    borderRadius: '16px',
                    padding: '18px 24px',
                    marginBottom: '24px',
                    width: '100%',
                    maxWidth: '320px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: C.orange, letterSpacing: '1px', marginBottom: '8px' }}>💡 LAB HINT & FORMULA</div>
                    <p style={{ margin: 0, fontSize: '1.05rem', color: C.white, lineHeight: '1.5', fontWeight: 500 }}>
                      {hintText}
                    </p>
                  </div>
                )}

                {/* EASY LEVEL 1 INTERACTION */}
                {difficulty === 'easy' && currentLevel === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>BLOCK ACTIONS</span>
                    <button 
                      onClick={triggerEasyBlockMerge}
                      disabled={showEasyBlocks}
                      style={{
                        padding: '14px 28px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.15rem',
                        fontWeight: 900, cursor: showEasyBlocks ? 'not-allowed' : 'pointer',
                        boxShadow: `0 10px 20px rgba(255,138,43,0.15)`
                      }}
                    >
                      {showEasyBlocks ? "MERGING..." : "MERGE BLOCKS"}
                    </button>
                  </div>
                )}

                {/* EASY LEVEL 2 INTERACTION */}
                {difficulty === 'easy' && currentLevel === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>LEG A SLIDER</span>
                      <input 
                        type="range" min="3" max="8" value={easyLegA} 
                        onChange={(e) => setEasyLegA(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: C.orange }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>LEG B SLIDER</span>
                      <input 
                        type="range" min="3" max="8" value={easyLegB} 
                        onChange={(e) => setEasyLegB(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: C.orange }}
                      />
                    </div>

                    <button 
                      onClick={checkEasyLevel2}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer', marginTop: '12px'
                      }}
                    >
                      SUBMIT DIMENSIONS
                    </button>
                  </div>
                )}

                {/* EASY LEVEL 3 INTERACTION */}
                {difficulty === 'easy' && currentLevel === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>SELECT RIGHT TRIANGLE</span>
                    {[
                      { label: 'Triangle 3-4-5', idx: 0 },
                      { label: 'Triangle 4-5-7', idx: 1 },
                      { label: 'Triangle 5-6-8', idx: 2 }
                    ].map(opt => (
                      <button
                        key={opt.idx}
                        onClick={() => checkEasyLevel3(opt.idx)}
                        style={{
                          padding: '12px', borderRadius: '10px', border: `1px solid ${scaleSelection === opt.idx ? C.orange : C.border}`,
                          background: scaleSelection === opt.idx ? 'rgba(255,138,43,0.1)' : C.bg,
                          color: scaleSelection === opt.idx ? C.orange : C.white, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* EASY LEVEL 4 INTERACTION */}
                {difficulty === 'easy' && currentLevel === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>CHOOSE PATTERN VARIABLE (?)</span>
                    {[11, 13, 14, 15].map(val => (
                      <button
                        key={val}
                        onClick={() => checkEasyLevel4(val)}
                        style={{
                          padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`,
                          background: C.bg, color: C.white, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                {/* EASY LEVEL 5 INTERACTION */}
                {difficulty === 'easy' && currentLevel === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>DIAGONAL STRUT (m)</span>
                      <input 
                        type="range" min="10" max="20" value={easyL5Slider} 
                        onChange={(e) => setEasyL5Slider(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: C.orange }}
                      />
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: C.orange, textAlign: 'center', marginTop: '10px' }}>
                        {easyL5Slider} meters
                      </div>
                    </div>
                    <button 
                      onClick={checkEasyLevel5}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      LOCK WIRE ANGLE
                    </button>
                  </div>
                )}

                {/* MEDIUM LEVEL 1 INTERACTION */}
                {difficulty === 'medium' && currentLevel === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>KEY IN SUPPORT LENGTH (m)</span>
                    <input 
                      type="number" value={medAns} onChange={(e) => setMedAns(e.target.value)}
                      placeholder="e.g. 15"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkMedLevel1}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      LAUNCH BRIDGE SUPPORT
                    </button>
                  </div>
                )}

                {/* MEDIUM LEVEL 2 INTERACTION */}
                {difficulty === 'medium' && currentLevel === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>ADJUST LADDER LENGTH (m)</span>
                      <input 
                        type="range" min="1" max="15" value={ladderProgress} 
                        onChange={(e) => setLadderProgress(e.target.value)}
                        style={{ width: '100%', accentColor: C.orange }}
                      />
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: C.orange, textAlign: 'center', marginTop: '10px' }}>
                        {ladderProgress} meters
                      </div>
                    </div>

                    <button 
                      onClick={checkMedLevel2}
                      disabled={ladderFired}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      {ladderFired ? "EXTENDING LADDER..." : "DEPLOY RESCUE"}
                    </button>
                  </div>
                )}

                {/* MEDIUM LEVEL 3 INTERACTION */}
                {difficulty === 'medium' && currentLevel === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>DIAGONAL SHORTCUT (miles)</span>
                    <input 
                      type="number" value={medAns} onChange={(e) => setMedAns(e.target.value)}
                      placeholder="e.g. 10"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkMedLevel3}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      SAIL VESSEL
                    </button>
                  </div>
                )}

                {/* MEDIUM LEVEL 4 INTERACTION */}
                {difficulty === 'medium' && currentLevel === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>CABLE DIAGONAL LENGTH (m)</span>
                    <input 
                      type="number" value={medAns} onChange={(e) => setMedAns(e.target.value)}
                      placeholder="e.g. 200"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkMedLevel4}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      CONSTRUCT CABLEWAY
                    </button>
                  </div>
                )}

                {/* MEDIUM LEVEL 5 INTERACTION */}
                {difficulty === 'medium' && currentLevel === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>TV DIAGONAL SIZE (inches)</span>
                    <input 
                      type="number" value={medAns} onChange={(e) => setMedAns(e.target.value)}
                      placeholder="e.g. 24"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkMedLevel5}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      CALCULATE ASPECT RATIO
                    </button>
                  </div>
                )}

                {/* HARD LEVEL 1 INTERACTION */}
                {difficulty === 'hard' && currentLevel === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>ROTATE WIREFRAME</span>
                      <input 
                        type="range" min="0" max="360" value={hardRotation} 
                        onChange={(e) => setHardRotation(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: C.orange }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>SPACE DIAGONAL LENGTH</span>
                      <input 
                        type="number" value={hardAns} onChange={(e) => setHardAns(e.target.value)}
                        placeholder="Key in diagonal"
                        style={{
                          width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                          borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                        }}
                      />
                    </div>

                    <button 
                      onClick={checkHardLevel1}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      UNLOCK CHEST
                    </button>
                  </div>
                )}

                {/* HARD LEVEL 2 INTERACTION */}
                {difficulty === 'hard' && currentLevel === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700, textAlign: 'center' }}>ADJUST VERTEX NODES</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: C.teal }}>Node A Coordinate</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input type="range" min="0" max="10" value={customNodeA.x} onChange={(e) => setCustomNodeA(p => ({ ...p, x: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.teal }}/>
                          <span style={{ width: '40px', fontSize: '0.85rem', color: C.teal }}>X={customNodeA.x}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: C.white }}>Node B Coordinate</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input type="range" min="0" max="10" value={customNodeB.x} onChange={(e) => setCustomNodeB(p => ({ ...p, x: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.white }}/>
                          <span style={{ width: '40px', fontSize: '0.85rem', color: C.white }}>X={customNodeB.x}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: C.gold }}>Node C Coordinate</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input type="range" min="0" max="10" value={customNodeC.y} onChange={(e) => setCustomNodeC(p => ({ ...p, y: parseInt(e.target.value) }))} style={{ flex: 1, accentColor: C.gold }}/>
                          <span style={{ width: '40px', fontSize: '0.85rem', color: C.gold }}>Y={customNodeC.y}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={checkHardLevel2}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      VERIFY PYTHAGOREAN PLOT
                    </button>
                  </div>
                )}

                {/* HARD LEVEL 3 INTERACTION */}
                {difficulty === 'hard' && currentLevel === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>LINE-OF-SIGHT RANGE</span>
                    <input 
                      type="number" value={hardAns} onChange={(e) => setHardAns(e.target.value)}
                      placeholder="e.g. 10"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkHardLevel3}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      LAUNCH DRONE
                    </button>
                  </div>
                )}

                {/* HARD LEVEL 4 INTERACTION */}
                {difficulty === 'hard' && currentLevel === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>VECTOR MODULE LENGTH</span>
                    <input 
                      type="number" value={hardAns} onChange={(e) => setHardAns(e.target.value)}
                      placeholder="e.g. 12"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkHardLevel4}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      INITIATE DOCKING
                    </button>
                  </div>
                )}

                {/* HARD LEVEL 5 INTERACTION */}
                {difficulty === 'hard' && currentLevel === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>SHORTEST HYPOTENUSE ROUTE</span>
                    <input 
                      type="number" value={hardAns} onChange={(e) => setHardAns(e.target.value)}
                      placeholder="e.g. 15"
                      style={{
                        width: '100%', padding: '12px', background: C.bg, border: `2px solid ${C.border}`,
                        borderRadius: '10px', fontSize: '1.25rem', color: C.orange, textAlign: 'center', outline: 'none'
                      }}
                    />
                    <button 
                      onClick={checkHardLevel5}
                      style={{
                        width: '100%', padding: '14px', background: `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                        color: C.bg, border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                        fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      DISPATCH AMBULANCE
                    </button>
                  </div>
                )}

              </div>

            </div>

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
                  color: C.bg, fontSize: '1.75rem', fontWeight: 900
                }}>
                  🎉 EXCELLENT OBSERVATION!
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
              <h2 style={{ margin: '12px 0 4px 0', fontSize: '2.25rem', fontWeight: 900, color: C.white }}>Lab Completed!</h2>
              <p style={{ margin: 0, fontSize: '1rem', color: C.muted }}>You have successfully navigated the Pythagoras Discovery Space.</p>
            </div>

            {/* Discovery Logs Summary */}
            <div style={{
              background: '#1F1915', borderRadius: '16px', padding: '24px',
              border: `1px solid rgba(255,255,255,0.03)`, display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.orange, letterSpacing: '1px' }}>LOGGED DISCOVERIES</span>
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
                  background: `linear-gradient(135deg, ${C.orange}, #E65F00)`, color: C.bg,
                  fontWeight: 900, cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* ── XP popups CSS ────────────────────────────────────────── */}
      <style>{`
        .pulse {
          animation: pulse-glow 1.5s infinite;
        }
        @keyframes pulse-glow {
          0% { r: 8; opacity: 0.3; }
          50% { r: 16; opacity: 0.6; }
          100% { r: 8; opacity: 0.3; }
        }
      `}</style>

    </div>
  );
}

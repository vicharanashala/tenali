import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const FONT = "'Plus Jakarta Sans', 'Poppins', system-ui, sans-serif";

/* ── Colour tokens (Visual Math Lab Theme) ─────────────────────────── */
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

/* ── Confetti ──────────────────────────────────────────────────── */
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

export default function BearingsLabApp({ onBack }) {
  // Flow states: 'setup' | 'game' | 'results'
  const [phase, setPhase] = useState('setup');
  
  // Setup Modal Configurations
  const [difficulty, setDifficulty] = useState('easy'); // easy | medium | hard
  const [missionCount, setMissionCount] = useState(5); // 5 | 10 | 15 | 20
  
  // Game states
  const [currentMission, setCurrentMission] = useState(1);
  const [heading, setHeading] = useState(0); // Current degree of ship/helm
  const [isSailing, setIsSailing] = useState(false);
  const [sailProgress, setSailProgress] = useState(0);
  const [lives, setLives] = useState(3);
  const [xp, setXp] = useState(0);
  const [xpPopup, setXpPopup] = useState(false);
  const [recentXp, setRecentXp] = useState(0);
  const [ribbonPopup, setRibbonPopup] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  // Active target parameters
  const [targetAngle, setTargetAngle] = useState(0);
  const [keypadDigits, setKeypadDigits] = useState(['', '', '']);

  // Observation Logs
  const [logs, setLogs] = useState([]);

  // Tutor Dialogue / Feedback
  const [tutorText, setTutorText] = useState('');

  // Helm dragging ref
  const helmRef = useRef(null);
  const isDraggingHelm = useRef(false);

  const padZero = (val) => {
    const num = parseInt(val) || 0;
    if (num < 10) return `00${num}`;
    if (num < 100) return `0${num}`;
    return `${num % 360}`;
  };

  // ── Mission Generator based on selected difficulty & count
  const getMissions = () => {
    const list = [];
    if (difficulty === 'easy') {
      // Easy: Cardinal, semi-cardinal directions, basic concepts
      list.push({ id: 1, title: 'Mission 1: Point to North', target: 0, label: 'STEER TO NORTH (000°)', type: 'helm' });
      list.push({ id: 2, title: 'Mission 2: Turn East', target: 90, label: 'STEER TO EAST (090°)', type: 'helm' });
      list.push({ id: 3, title: 'Mission 3: Discover Clockwise', target: 180, label: 'STEER TO SOUTH (180°)', type: 'helm' });
      list.push({ id: 4, title: 'Mission 4: Turn West', target: 270, label: 'STEER TO WEST (270°)', type: 'helm' });
      list.push({ id: 5, title: 'Mission 5: Reach Coral Island', target: 45, label: 'STEER TO NORTH-EAST (045°)', type: 'helm' });
      
      // Pad up to missionCount with random easy angles
      for (let i = 6; i <= missionCount; i++) {
        const easyAngles = [45, 135, 225, 315];
        const angle = easyAngles[(i - 6) % easyAngles.length];
        list.push({
          id: i,
          title: `Mission ${i}: Sail to Checkpoint`,
          target: angle,
          label: `STEER TO BEARING (${padZero(angle)}°)`,
          type: 'helm'
        });
      }
    } else if (difficulty === 'medium') {
      // Medium: Arbitrary angles, keypad consoles, and reverse back bearings
      list.push({ id: 1, title: 'Mission 1: Lighthouse Align', target: 65, label: 'STEER TO LIGHTHOUSE (065°)', type: 'helm' });
      list.push({ id: 2, title: 'Mission 2: Submarine Console', target: 125, label: 'KEY IN BEARING (125°)', type: 'keypad' });
      list.push({ id: 3, title: 'Mission 3: Weather Buoy Align', target: 290, label: 'STEER TO WEATHER BUOY (290°)', type: 'helm' });
      list.push({ id: 4, title: 'Mission 4: Reverse Return Leg', target: 245, label: 'DEDUCE REVERSE BEARING (245°)', type: 'keypad', desc: 'Outward path was 065°' });
      
      // Pad up to missionCount with random medium angles
      for (let i = 5; i <= missionCount; i++) {
        const randomAngle = [35, 80, 140, 195, 220, 305][(i - 5) % 6];
        const isKeypad = i % 2 === 0;
        list.push({
          id: i,
          title: `Mission ${i}: Island Survey`,
          target: randomAngle,
          label: isKeypad ? `KEY IN BEARING (${padZero(randomAngle)}°)` : `STEER TO TARGET (${padZero(randomAngle)}°)`,
          type: isKeypad ? 'keypad' : 'helm'
        });
      }
    } else {
      // Hard: Wind drift, checkpoints, and sonar search / triangulation (Unique Search Question)
      list.push({ id: 1, title: 'Mission 1: Wind Drift Compass', target: 75, label: 'WIND DRIFT: STEER TO EAST (090°)', type: 'helm', desc: 'NW Wind drifts us +15° East' });
      list.push({ id: 2, title: 'Mission 2: Double Checkpoint Run', target: 135, label: 'STEER TO GATES (135°)', type: 'helm' });
      list.push({ id: 3, title: 'Mission 3: Sonar Search', target: 0, label: 'SONAR SEARCH INTERSECTION (000°)', type: 'sonar', sonarA: 45, sonarB: 315 });
      
      // Pad up to missionCount with random hard wind-drift/keypad/sonar scenarios
      for (let i = 4; i <= missionCount; i++) {
        const isSonar = i % 3 === 0;
        const isWind = i % 3 === 1;
        if (isSonar) {
          list.push({
            id: i,
            title: `Mission ${i}: Deep Sea Sonar Search`,
            target: 0,
            label: `SONAR SEARCH INTERSECTION (000°)`,
            type: 'sonar',
            sonarA: 60,
            sonarB: 300
          });
        } else if (isWind) {
          list.push({
            id: i,
            title: `Mission ${i}: Wind Drift Navigation`,
            target: 255, // target is 270, wind is +15, steer H + 15 = 270 => 255
            label: `WIND DRIFT: STEER TO WEST (270°)`,
            type: 'helm',
            wind: 15
          });
        } else {
          const randomAngle = [15, 115, 205, 345][(i - 4) % 4];
          list.push({
            id: i,
            title: `Mission ${i}: Keypad Emergency Override`,
            target: randomAngle,
            label: `KEY IN BEARING (${padZero(randomAngle)}°)`,
            type: 'keypad'
          });
        }
      }
    }
    return list;
  };

  const activeMissions = getMissions();

  // Reset/Initialize Level States
  useEffect(() => {
    if (phase === 'game') {
      initMission(1);
    }
  }, [phase]);

  const initMission = (mId) => {
    const missionsList = getMissions();
    const current = missionsList[mId - 1];
    if (!current) return;

    setCurrentMission(mId);
    setHeading(0);
    setSailProgress(0);
    setHintsUsed(0);
    setIsSailing(false);
    setTargetAngle(current.target);

    if (current.type === 'keypad') {
      setKeypadDigits(['', '', '']);
    }

    if (current.type === 'sonar') {
      setTutorText("Two sonar towers are emitting beams! Track where the lines cross and steer your ship directly to the shipwreck coordinates (000°).");
    } else if (current.wind) {
      setTutorText("NW wind shifts us +15° to the East. To go 090°, you must steer 15° to the left (075°). Adjust and launch!");
    } else {
      setTutorText(`Mission loaded: ${current.title}. Steer or input the correct bearing to proceed!`);
    }
  };

  // Handle Steering Wheel Turn Math
  const handleHelmDrag = (e) => {
    if (!helmRef.current || isSailing) return;
    const rect = helmRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angleRad = Math.atan2(dx, -dy);
    let angleDeg = Math.round(angleRad * (180 / Math.PI));
    if (angleDeg < 0) angleDeg += 360;

    setHeading(angleDeg);
  };

  const startDrag = (e) => {
    isDraggingHelm.current = true;
    handleHelmDrag(e);
    window.addEventListener('mousemove', handleHelmDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleHelmDrag);
    window.addEventListener('touchend', stopDrag);
  };

  const stopDrag = () => {
    isDraggingHelm.current = false;
    window.removeEventListener('mousemove', handleHelmDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', handleHelmDrag);
    window.removeEventListener('touchend', stopDrag);
  };

  // UI Keypad handling
  const handleKeypadPress = (num) => {
    const emptyIdx = keypadDigits.indexOf('');
    if (emptyIdx !== -1) {
      const nextDigits = [...keypadDigits];
      nextDigits[emptyIdx] = String(num);
      setKeypadDigits(nextDigits);
      
      const combined = nextDigits.filter(d => d !== '').join('');
      setHeading(parseInt(combined) || 0);
    }
  };

  const handleKeypadClear = () => {
    setKeypadDigits(['', '', '']);
    setHeading(0);
  };

  // Launch Validation and Sailing Animation
  const handleLaunch = () => {
    if (isSailing) return;
    setIsSailing(true);

    const current = activeMissions[currentMission - 1];
    const isCorrect = Math.abs(heading - current.target) <= 3 || (current.target === 0 && (heading >= 357 || heading <= 3));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setSailProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        evaluateResult(isCorrect);
      }
    }, 20);
  };

  const evaluateResult = (isCorrect) => {
    setIsSailing(false);
    setSailProgress(0);

    const current = activeMissions[currentMission - 1];

    if (isCorrect) {
      setRecentXp(30);
      setXp(x => x + 30);
      setXpPopup(true);
      setTimeout(() => setXpPopup(false), 1300);
      triggerConfetti();

      // Log discovery
      setLogs(prev => [...new Set([...prev, `${current.title}: Logged discovery angle ${padZero(current.target)}°`])]);

      setRibbonPopup(true);
      setTimeout(() => {
        setRibbonPopup(false);
        if (currentMission < activeMissions.length) {
          initMission(currentMission + 1);
        } else {
          setPhase('results');
        }
      }, 2500);
    } else {
      setLives(l => Math.max(0, l - 1));
      if (current.wind) {
        setTutorText("We drifted into reefs! To compensate for the +15° East wind drift, point your engine 15° to the left (075°).");
      } else {
        setTutorText(`Vessel drifted off path. We need to face exactly ${padZero(current.target)}°. Adjust the coordinates and relaunch!`);
      }
    }
  };

  const triggerHint = () => {
    const current = activeMissions[currentMission - 1];
    setTutorText(`Hint: Set your helm heading or keypad digital lock to exactly ${padZero(current.target)}° and press Launch.`);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: C.bg, color: C.white, fontFamily: FONT,
      overflow: 'hidden', position: 'relative'
    }}>
      
      {/* ── Background Floating Symbols ─────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.05 }}>
        {['000°', '090°', '185°', '270°', 'N', 'E', 'S', 'W', '🧭', '⚓'].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${(i * 17) % 95}%`, top: `${(i * 13) % 90}%`,
            fontSize: '2rem', fontWeight: 900, color: C.orange
          }}>{s}</div>
        ))}
      </div>

      {/* ── PHASE 1: SETUP MODAL ────────────────────────────────── */}
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
            {/* Title & Sub */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '2.25rem', fontWeight: 900, color: C.white }}>🧭 Bearings Navigation Lab</h2>
              <p style={{ margin: 0, fontSize: '1rem', color: C.muted }}>Learn bearings by steering your ship through fun adventures.</p>
            </div>

            {/* Select difficulty */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.muted, marginBottom: '8px', letterSpacing: '1px' }}>⭐ DIFFICULTY</span>
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

            {/* Select mission count */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.muted, marginBottom: '8px', letterSpacing: '1px' }}>📚 NUMBER OF MISSIONS</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '100%' }}>
                {[5, 10, 15, 20].map(count => (
                  <button 
                    key={count}
                    onClick={() => setMissionCount(count)}
                    style={{
                      padding: '12px', borderRadius: '12px', border: `2px solid ${missionCount === count ? C.orange : 'rgba(255,255,255,0.05)'}`,
                      background: missionCount === count ? 'rgba(255,138,43,0.1)' : C.bg,
                      color: missionCount === count ? C.orange : C.muted, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem'
                    }}
                  >
                    {count} Missions
                  </button>
                ))}
              </div>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', width: '100%', alignItems: 'center' }}>
              <button 
                onClick={() => setPhase('game')}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: `linear-gradient(135deg, ${C.orange}, #E65F00)`, color: C.bg,
                  fontWeight: 900, fontSize: '1.25rem', cursor: 'pointer',
                  boxShadow: `0 10px 25px rgba(255,138,43,0.3)`
                }}
              >
                Start Adventure
              </button>
              <button 
                onClick={onBack}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px', border: `1px solid ${C.border}`,
                  background: 'none', color: C.muted, fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
                }}
              >
                Back
              </button>
            </div>

            {/* Small friendly reminder info */}
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: C.gold, fontWeight: 600 }}>
              🧭 Learn while you play.
            </div>

          </motion.div>
        </div>
      )}

      {/* ── PHASE 2: GAMEPLAY CONSOLE ────────────────────────────── */}
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
              ← Leave Lab
            </button>

            {/* Custom Premium Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.9rem', color: C.muted, fontWeight: 700, letterSpacing: '0.5px' }}>MISSION PROGRESS</span>
              <div style={{
                width: '240px', height: '10px', background: 'rgba(22, 18, 15, 0.6)',
                borderRadius: '5px', overflow: 'hidden', border: `1px solid ${C.border}`,
                position: 'relative'
              }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentMission / activeMissions.length) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`,
                    boxShadow: `0 0 10px ${C.orange}`
                  }}
                />
              </div>
              <span style={{ fontSize: '0.9rem', color: C.orange, fontWeight: 800, fontFamily: 'monospace' }}>
                {currentMission} / {activeMissions.length}
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
              
              {/* Left Column: Ocean Map + Simple Instruction Target Header */}
              <div style={{
                padding: '32px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '20px', borderRight: `1px solid ${C.border}`
              }}>
                {/* Big Visual Target Directive */}
                <div style={{
                  background: 'rgba(255,138,43,0.06)', border: `1px solid rgba(255,138,43,0.15)`,
                  padding: '10px 24px', borderRadius: '30px', textAlign: 'center',
                  boxShadow: `0 0 15px rgba(255,138,43,0.05)`
                }}>
                  <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 700, letterSpacing: '1px' }}>GOAL: </span>
                  <span style={{ fontSize: '1.25rem', color: C.gold, fontWeight: 900, letterSpacing: '0.5px' }}>
                    {activeMissions[currentMission - 1]?.label}
                  </span>
                </div>

                {/* Ocean Map SVG */}
                <div style={{
                  position: 'relative', width: '380px', height: '380px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  {/* Dotted target outline */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    border: `1px dashed rgba(255,138,43,0.06)`, borderRadius: '50%',
                    pointerEvents: 'none'
                  }}></div>

                  <svg width="100%" height="100%" viewBox="0 0 500 500" style={{ zIndex: 2 }}>
                    {/* Grid Coordinates lines */}
                    <line x1="250" y1="20" x2="250" y2="480" stroke="rgba(255,255,255,0.02)" strokeDasharray="4"/>
                    <line x1="20" y1="250" x2="480" y2="250" stroke="rgba(255,255,255,0.02)" strokeDasharray="4"/>

                    {/* Compass outer dial */}
                    <circle cx="250" cy="250" r="180" stroke="rgba(255,200,87,0.15)" strokeWidth="2" fill="none"/>
                    <circle cx="250" cy="250" r="195" stroke="rgba(255,138,43,0.08)" strokeWidth="1" fill="none" strokeDasharray="3 6"/>

                    {/* Degree indicators */}
                    {[0, 90, 180, 270].map(deg => {
                      const rad = ((deg - 90) * Math.PI) / 180;
                      const tx = 250 + Math.cos(rad) * 215;
                      const ty = 250 + Math.sin(rad) * 215;
                      const label = deg === 0 ? 'N (000°)' : deg === 90 ? 'E (090°)' : deg === 180 ? 'S (180°)' : 'W (270°)';
                      return (
                        <text key={deg} x={tx} y={ty} fill={C.gold} fontSize="11" fontWeight="700" textAnchor="middle" alignmentBaseline="middle">
                          {label}
                        </text>
                      );
                    })}

                    {/* Golden Clockwise Sweep Segment */}
                    {activeMissions[currentMission - 1]?.type !== 'sonar' && (
                      <path 
                        d={`
                          M 250 250
                          L 250 70
                          A 180 180 0 ${heading > 180 ? 1 : 0} 1 
                          ${250 + Math.sin((heading * Math.PI) / 180) * 180} 
                          ${250 - Math.cos((heading * Math.PI) / 180) * 180}
                          Z
                        `}
                        fill="rgba(255, 138, 43, 0.08)"
                        stroke={C.orange}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Gold North Reference Needle */}
                    <g>
                      <line x1="250" y1="250" x2="250" y2="70" stroke={C.gold} strokeWidth="3" strokeLinecap="round"/>
                      <polygon points="250,55 244,70 256,70" fill={C.gold}/>
                    </g>

                    {/* Target island / lighthouse */}
                    {activeMissions[currentMission - 1]?.type === 'helm' && (
                      <g transform={`translate(${250 + Math.sin((targetAngle * Math.PI) / 180) * 140}, ${250 - Math.cos((targetAngle * Math.PI) / 180) * 140})`}>
                        <circle cx="0" cy="0" r="16" fill={C.orange} opacity="0.3" className="pulse"/>
                        <circle cx="0" cy="0" r="10" fill={C.gold}/>
                        <text x="0" y="-22" fill={C.gold} fontSize="10" fontWeight="bold" textAnchor="middle">TARGET ISLAND</text>
                      </g>
                    )}

                    {activeMissions[currentMission - 1]?.type === 'keypad' && (
                      <g transform={`translate(${250 + Math.sin((targetAngle * Math.PI) / 180) * 140}, ${250 - Math.cos((targetAngle * Math.PI) / 180) * 140})`}>
                        <circle cx="0" cy="0" r="12" fill={C.orange}/>
                        <text x="0" y="-18" fill={C.white} fontSize="10" fontWeight="bold" textAnchor="middle">Target ({padZero(targetAngle)}°)</text>
                      </g>
                    )}

                    {activeMissions[currentMission - 1]?.type === 'sonar' && (
                      <g>
                        {/* Sonar Tower A */}
                        <circle cx="150" cy="320" r="12" fill={C.gold} stroke={C.orange} strokeWidth="2"/>
                        <circle cx="150" cy="320" r="22" fill="none" stroke={C.orange} strokeWidth="1" strokeDasharray="3 3" className="pulse"/>
                        <text x="150" y="342" fill={C.gold} fontSize="9" fontWeight="bold" textAnchor="middle">TOWER A (045°)</text>
                        <line x1="150" y1="320" x2="250" y2="220" stroke={C.orange} strokeWidth="2.5" strokeDasharray="4 2"/>

                        {/* Sonar Tower B */}
                        <circle cx="350" cy="320" r="12" fill={C.gold} stroke={C.orange} strokeWidth="2"/>
                        <circle cx="350" cy="320" r="22" fill="none" stroke={C.orange} strokeWidth="1" strokeDasharray="3 3" className="pulse"/>
                        <text x="350" y="342" fill={C.gold} fontSize="9" fontWeight="bold" textAnchor="middle">TOWER B (315°)</text>
                        <line x1="350" y1="320" x2="250" y2="220" stroke={C.orange} strokeWidth="2.5" strokeDasharray="4 2"/>

                        {/* shipwreck target at intersection */}
                        <g transform="translate(250, 220)">
                          <circle cx="0" cy="0" r="14" fill={C.orange} opacity="0.3" className="pulse"/>
                          <text x="0" y="5" fontSize="14" textAnchor="middle">⚓</text>
                          <text x="0" y="-18" fill={C.orange} fontSize="9" fontWeight="bold" textAnchor="middle">SHIPWRECK</text>
                        </g>
                      </g>
                    )}

                    {/* Ship Indicator */}
                    {(() => {
                      const shipX = 250;
                      const shipY = 250;
                      const rad = ((heading - 90) * Math.PI) / 180;
                      // Sail path target line
                      const length = isSailing ? (sailProgress / 100) * 150 : 150;
                      const pathEndX = shipX + Math.cos(rad) * length;
                      const pathEndY = shipY + Math.sin(rad) * length;

                      return (
                        <g>
                          <line 
                            x1={shipX} y1={shipY} x2={pathEndX} y2={pathEndY} 
                            stroke={C.orange} strokeWidth="3.5" strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 6px ${C.orange})` }}
                          />

                          <g transform={`translate(${shipX}, ${shipY}) rotate(${heading})`}>
                            <path d="M 0 -18 Q 8 -6 8 8 L -8 8 Q -8 -6 0 -18 Z" fill={C.white} stroke={C.orange} strokeWidth="2.5"/>
                            <circle cx="0" cy="4" r="3" fill={C.gold}/>
                          </g>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Right Column: Keypad / Helm Steering controls */}
              <div style={{
                padding: '32px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.1)'
              }}>
                
                {/* Active helper description text */}
                <div style={{ color: C.muted, fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center', maxWidth: '240px', lineHeight: '1.4' }}>
                  {tutorText}
                </div>

                {activeMissions[currentMission - 1]?.type !== 'keypad' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, marginBottom: '16px', letterSpacing: '1px', fontWeight: 700 }}>STEERING ROSE CONTROL</span>
                    
                    <div 
                      ref={helmRef}
                      onMouseDown={startDrag}
                      onTouchStart={startDrag}
                      style={{
                        width: '180px', height: '180px', borderRadius: '50%',
                        background: 'radial-gradient(circle, #2B241E 40%, #16120F 100%)',
                        border: `4px solid ${C.border}`, position: 'relative',
                        cursor: 'grab', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        transform: `rotate(${heading}deg)`,
                        boxShadow: `0 10px 25px rgba(0,0,0,0.5)`
                      }}
                    >
                      {/* Handles */}
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                        <div key={deg} style={{
                          position: 'absolute', width: '10px', height: '10px',
                          background: C.gold, borderRadius: '50%',
                          transform: `rotate(${deg}deg) translateY(-94px)`
                        }}></div>
                      ))}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: C.bg, border: `3px solid ${C.orange}`,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: C.orange, fontSize: '1rem', fontWeight: 900
                      }}>
                        🧭
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontWeight: 700 }}>CURRENT HEADING</span>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color: C.orange, fontFamily: 'monospace' }}>
                        {padZero(heading)}°
                      </div>
                    </div>
                  </div>
                ) : (
                  // Keypad
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, marginBottom: '16px', letterSpacing: '1px', fontWeight: 700 }}>DIGITAL NAVIGATION KEYPAD</span>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      {[0, 1, 2].map(idx => (
                        <div key={idx} style={{
                          width: '54px', height: '64px', borderRadius: '8px',
                          background: C.bg, border: `2px solid ${keypadDigits[idx] !== '' ? C.orange : C.border}`,
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          fontSize: '2.25rem', fontWeight: 900, color: C.orange, fontFamily: 'monospace'
                        }}>
                          {keypadDigits[idx] === '' ? '-' : keypadDigits[idx]}
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px', width: '100%'
                    }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button 
                          key={num}
                          onClick={() => handleKeypadPress(num)}
                          style={{
                            padding: '12px', borderRadius: '8px', border: 'none',
                            background: 'rgba(255,255,255,0.05)', color: C.white,
                            fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        onClick={handleKeypadClear}
                        style={{
                          padding: '12px', borderRadius: '8px', border: 'none',
                          background: 'rgba(239, 68, 68, 0.1)', color: C.coral,
                          fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        CLR
                      </button>
                      <button 
                        onClick={() => handleKeypadPress(0)}
                        style={{
                          padding: '12px', borderRadius: '8px', border: 'none',
                          background: 'rgba(255,255,255,0.05)', color: C.white,
                          fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        0
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>🧭</div>
                    </div>
                  </div>
                )}

                {/* Launch Button / Dynamic Hint */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '240px', marginTop: '24px' }}>
                  <button 
                    onClick={handleLaunch}
                    disabled={isSailing}
                    style={{
                      width: '100%',
                      background: isSailing ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${C.orange}, #E65F00)`,
                      color: isSailing ? C.muted : C.bg, border: 'none',
                      padding: '14px 24px', borderRadius: '12px', fontSize: '1.15rem',
                      fontWeight: 900, cursor: isSailing ? 'not-allowed' : 'pointer',
                      boxShadow: isSailing ? 'none' : `0 10px 20px rgba(255,138,43,0.15)`
                    }}
                  >
                    {isSailing ? 'SAILING...' : 'LAUNCH VESSEL'}
                  </button>

                  <button 
                    onClick={triggerHint}
                    style={{
                      width: '100%', background: 'none', border: `1px solid ${C.border}`,
                      color: C.muted, padding: '8px', borderRadius: '8px', fontSize: '0.8rem',
                      cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    Get Help
                  </button>
                </div>
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

      {/* ── PHASE 3: REDESIGNED RESULT SUMMARY SCREEN ────────────── */}
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
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🏅</span>
              <h2 style={{ margin: '12px 0 4px 0', fontSize: '2.25rem', fontWeight: 900, color: C.white }}>Adventure Completed!</h2>
              <p style={{ margin: 0, fontSize: '1rem', color: C.muted }}>You are officially a certified Navigator of Aurelia!</p>
            </div>

            {/* Discovery Logs Summary */}
            <div style={{
              background: '#1F1915', borderRadius: '16px', padding: '24px',
              border: `1px solid rgba(255,255,255,0.03)`, display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.orange, letterSpacing: '1px' }}>TODAY'S DISCOVERIES</span>
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
                Replay Mission
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
          0% { r: 10; opacity: 0.3; }
          50% { r: 18; opacity: 0.6; }
          100% { r: 10; opacity: 0.3; }
        }
      `}</style>

    </div>
  );
}

function XPPopup({ show, amt }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0, opacity: 1, scale: 0.8, x: '-50%' }}
          animate={{ y: -120, opacity: 0, scale: 1.3, x: '-50%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            fontSize: '2.25rem', fontWeight: 900, color: C.orange,
            textShadow: `0 0 20px rgba(255, 138, 43, 0.8)`,
            zIndex: 100, pointerEvents: 'none', whiteSpace: 'nowrap'
          }}
        >
          +{amt} XP ⭐
        </motion.div>
      )}
    </AnimatePresence>
  );
}

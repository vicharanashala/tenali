import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizLayout } from './App';
import './WaterJugLab.css';

/**
 * WATER JUG LAB
 * ═══════════════════════════════════════════════════════════════════════════
 * Pure interactive client-side lab module with 22-step intuition journey,
 * 13-level difficulty progression (0-12), and Diophantine solvability checks.
 * Backend endpoints `/jug-api/question` and `/jug-api/check` are registered
 * in server/index.js for full API completeness and test automation.
 */

// ─────────────────────────────────────────────────────────────────────────────
// IntroJourney — visual, minimal, kid-friendly GCD discovery (5 stages)
// ─────────────────────────────────────────────────────────────────────────────
const JOURNEY_JUG_A = 4;
const JOURNEY_JUG_B = 6;
const gcdUtil = (a, b) => b === 0 ? a : gcdUtil(b, a % b);
const JOURNEY_GCD = gcdUtil(JOURNEY_JUG_A, JOURNEY_JUG_B); // 2

function IntroJourney({ onComplete }) {
  const [level, setLevel] = useState(1);

  /* Level 1-4 State */
  const [splash, setSplash] = useState(false);
  const [cupWater, setCupWater] = useState(0);

  /* Level 5-8 State */
  const [slots, setSlots] = useState(0);
  const [spill, setSpill] = useState(false);

  /* Level 11-14 State */
  const [jugA, setJugA] = useState(0);
  const [jugB, setJugB] = useState(0);

  /* Level 16 State (Puzzle) */
  const [puzzleStep, setPuzzleStep] = useState(0);

  /* Level 17 State (Impossible) */
  const [impTried, setImpTried] = useState(false);

  /* Level 20 State (Jump Sizes) */
  const [pairKey, setPairKey] = useState('4-6');

  const TOTAL_LEVELS = 22;

  const CONCEPTS = [
    { id: 1, name: 'Water', icon: '🌊', desc: 'Water is a liquid you can touch and splash!' },
    { id: 2, name: 'Container', icon: '🥛', desc: 'Containers hold water safely inside.' },
    { id: 3, name: 'Fill', icon: '🚰', desc: 'Filling adds water into the container.' },
    { id: 4, name: 'Empty', icon: '🫗', desc: 'Emptying pours water out completely.' },
    { id: 5, name: 'Capacity', icon: '📦', desc: 'Capacity is max space (e.g. 4 slots □□□□).' },
    { id: 6, name: 'Full', icon: '🌊', desc: 'Full means water reaches the maximum slot!' },
    { id: 7, name: 'Overflow', icon: '💦', desc: 'Adding more water when full makes it spill!' },
    { id: 8, name: 'Amount', icon: '📊', desc: 'Amount is how many filled slots are inside.' },
    { id: 9, name: 'Counting', icon: '🔢', desc: 'Counting filled slots: 1, 2, 3, or 4 units.' },
    { id: 10, name: 'Comparing', icon: '⚖️', desc: '4L container is smaller than 6L container.' },
    { id: 11, name: 'Two Containers', icon: '👯', desc: 'Playing with Jug A (4L) & Jug B (6L) together.' },
    { id: 12, name: 'Pouring', icon: '➡️', desc: 'Pouring moves water from Jug A into Jug B.' },
    { id: 13, name: 'Water Movement', icon: '💧🚶', desc: 'Water leaves A and enters B without losing a drop!' },
    { id: 14, name: 'Total Water', icon: '➕', desc: 'Total water = Jug A + Jug B.' },
    { id: 15, name: 'Goal', icon: '🎯', desc: 'A goal is reaching a target amount (e.g. 4L).' },
    { id: 16, name: 'Puzzle', icon: '🧩', desc: 'Multi-step pouring (Fill A ➔ Pour B ➔ Fill A ➔ 2L!).' },
    { id: 17, name: 'Impossible Goal', icon: '🔒', desc: 'Trying to make 1L, 3L, or 5L fails every time!' },
    { id: 18, name: 'Pattern Spotting', icon: '🔎', desc: 'Spotting which numbers work and which fail.' },
    { id: 19, name: 'Equal Jumps', icon: '🐰', desc: 'With 4L & 6L, reachable amounts jump by 2s.' },
    { id: 20, name: 'Different Jump Sizes', icon: '📏', desc: '(4,6) jumps by 2; (6,9) jumps by 3; (3,5) by 1.' },
    { id: 21, name: 'Hidden Rule', icon: '🔮', desc: 'Every container pair has ONE fixed hidden step size!' },
    { id: 22, name: 'Greatest Common Divisor (GCD)', icon: '🎁🏆', desc: 'The official math name for this hidden step size is GCD!' }
  ];

  const cur = CONCEPTS[level - 1];

  const navHeader = (
    <div style={{ marginBottom: '16px' }}>
      {/* Minimal Thin Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--clr-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ height: '100%', width: `${(level / TOTAL_LEVELS) * 100}%`, background: 'var(--clr-accent)', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-accent)' }}>
          Level {level} of {TOTAL_LEVELS} •
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>
          {cur.name}
        </span>
      </div>
    </div>
  );

  const nextLvlBtn = (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
      {level > 1 ? (
        <button className="journey-step-btn" style={{ margin: 0 }} onClick={() => setLevel(p => p - 1)}>
          ← Previous
        </button>
      ) : <div />}
      {level < TOTAL_LEVELS ? (
        <button className="journey-next-btn" style={{ margin: 0 }} onClick={() => setLevel(p => p + 1)}>
          Next Concept →
        </button>
      ) : (
        <button className="journey-start-btn" style={{ margin: 0 }} onClick={onComplete}>
          🎮 Play Water Jug Lab!
        </button>
      )}
    </div>
  );

  return (
    <div className="journey-stage">
      {navHeader}

      {level < 13 ? (
        <>
          <div className="journey-big-emoji" style={{ marginTop: '12px' }}>{cur.icon}</div>
          <h2 className="journey-title" style={{ margin: '8px 0 4px 0' }}>{cur.name}</h2>
          <p className="journey-hint" style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '16px' }}>
            💡 {cur.desc}
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: '4px 0 10px 0' }}>
            💡 {cur.desc}
          </p>
        </div>
      )}

      {/* Level 1: Water */}
      {level === 1 && (
        <div style={{ textAlign: 'center' }}>
          <button className="journey-start-btn" style={{ margin: '10px 0' }} onClick={() => setSplash(true)}>
            🌊 Touch the River Water!
          </button>
          {splash && <div className="journey-pop" style={{ marginTop: 12 }}>💦 Splash! Water is a fun liquid that flows!</div>}
        </div>
      )}

      {/* Level 2: Container */}
      {level === 2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 130, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 800 }}>Glass Cup</div>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--clr-text-soft)' }}>Containers hold water safely without leaking!</div>
        </div>
      )}

      {/* Level 3: Fill */}
      {level === 3 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 130, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: cupWater ? '80%' : '0%', background: 'linear-gradient(to top, #3B82F6, #93C5FD)', transition: 'height 0.6s ease' }} />
          </div>
          <button className="journey-start-btn" style={{ margin: '10px 0' }} onClick={() => setCupWater(cupWater ? 0 : 1)}>
            {cupWater ? '🫗 Tap to Reset' : '🚰 Fill Cup with Water!'}
          </button>
          {cupWater === 1 && <div className="journey-pop" style={{ marginTop: 12 }}>🚰 Filling adds water into the container!</div>}
        </div>
      )}

      {/* Level 4: Empty */}
      {level === 4 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 130, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: cupWater ? '0%' : '80%', background: 'linear-gradient(to top, #3B82F6, #93C5FD)', transition: 'height 0.6s ease' }} />
          </div>
          <button className="journey-start-btn" style={{ margin: '10px 0' }} onClick={() => setCupWater(cupWater ? 0 : 1)}>
            {cupWater ? '🚰 Tap to Fill' : '🫗 Empty the Container!'}
          </button>
          {cupWater === 1 && <div className="journey-pop" style={{ marginTop: 12 }}>🫗 Emptying pours water out completely!</div>}
        </div>
      )}

      {/* Level 5: Capacity */}
      {level === 5 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 140, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', display: 'flex', flexDirection: 'column-reverse', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ flex: 1, borderTop: '1px dashed var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                Slot {s}
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 800, color: 'var(--clr-accent)' }}>Capacity = 4 Total Slots (Max 4L)</div>
        </div>
      )}

      {/* Level 6: Full */}
      {level === 6 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 140, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #3B82F6, #93C5FD)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 900, color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>FULL! 4/4</div>
          </div>
          <div style={{ fontWeight: 800, color: '#22C55E' }}>Full means water reaches the top capacity line!</div>
        </div>
      )}

      {/* Level 7: Overflow */}
      {level === 7 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 130, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', position: 'relative', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #3B82F6, #93C5FD)', borderRadius: '0 0 10px 10px' }} />
            {spill && <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: '1.8rem', animation: 'bounce 0.5s infinite' }}>💦 Splash!</div>}
          </div>
          <button className="journey-start-btn" style={{ margin: '10px 0' }} onClick={() => setSpill(true)}>
            ➕ Try Adding More Water!
          </button>
          {spill && <div className="journey-pop" style={{ marginTop: 12, color: '#EF4444' }}>💦 Overflow! Extra water spills over the rim!</div>}
        </div>
      )}

      {/* Level 8: Amount */}
      {level === 8 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 140, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #3B82F6, #93C5FD)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 900, fontSize: '1.2rem' }}>2 Slots</div>
          </div>
          <div style={{ fontWeight: 800 }}>Amount measures how much water is inside!</div>
        </div>
      )}

      {/* Level 9: Counting */}
      {level === 9 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 140, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 14px 14px', margin: '0 auto 16px auto', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(slots / 4) * 100}%`, background: 'linear-gradient(to top, #3B82F6, #93C5FD)', transition: 'height 0.4s ease' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 900, fontSize: '1.2rem' }}>{slots} Units</div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[1, 2, 3, 4].map(n => (
              <button key={n} className="journey-step-btn" onClick={() => setSlots(n)}>
                Set {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level 10: Comparing */}
      {level === 10 && (
        <div style={{ display: 'flex', gap: 30, justifyContent: 'center', alignItems: 'flex-end', margin: '16px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 70, height: 100, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>4L</div>
            <div style={{ fontWeight: 800, marginTop: 4 }}>Jug A</div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, paddingBottom: 30 }}>&lt;</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 70, height: 140, border: '3px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>6L</div>
            <div style={{ fontWeight: 800, marginTop: 4 }}>Jug B</div>
          </div>
        </div>
      )}

      {/* Level 11: Two Containers */}
      {level === 11 && (
        <div style={{ display: 'flex', gap: 30, justifyContent: 'center', alignItems: 'flex-end', margin: '16px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 70, height: 100, border: '3px solid #3B82F6', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>Blue 4L</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 70, height: 140, border: '3px solid #F08C46', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'rgba(240,140,70,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>Red 6L</div>
          </div>
        </div>
      )}

      {/* Level 12: Pouring */}
      {level === 12 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 30, justifyContent: 'center', alignItems: 'flex-end', margin: '12px 0' }}>
            <div style={{ width: 60, height: 90, border: '2px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 8px 8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(jugA / 4) * 100}%`, background: '#3B82F6', transition: 'height 0.4s ease' }} />
            </div>
            <div style={{ width: 60, height: 120, border: '2px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 8px 8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(jugB / 6) * 100}%`, background: '#F08C46', transition: 'height 0.4s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="journey-step-btn" onClick={() => setJugA(4)}>🚰 Fill A</button>
            <button className="journey-step-btn" onClick={() => {
              const currentA = jugA === 0 ? 4 : jugA;
              const amt = Math.min(currentA, 6 - jugB);
              setJugA(currentA - amt);
              setJugB(p => Math.min(6, p + amt));
            }}>➡️ Pour A ➔ B</button>
          </div>
        </div>
      )}

      {/* Levels 13-22: Clean & Minimal Interactive Visual Jugs */}
      {level >= 13 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'flex-end', margin: '12px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>Jug A ({pairKey === '3-5' ? 3 : pairKey === '6-9' ? 6 : 4}L)</div>
              <div style={{ width: 56, height: 90, border: '2px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 8px 8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(jugA / (pairKey === '3-5' ? 3 : pairKey === '6-9' ? 6 : 4)) * 100}%`, background: '#3B82F6', transition: 'height 0.4s ease' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{jugA}L</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>Jug B ({pairKey === '3-5' ? 5 : pairKey === '6-9' ? 9 : 6}L)</div>
              <div style={{ width: 56, height: 120, border: '2px solid var(--clr-text)', borderTop: 'none', borderRadius: '0 0 8px 8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(jugB / (pairKey === '3-5' ? 5 : pairKey === '6-9' ? 9 : 6)) * 100}%`, background: '#F08C46', transition: 'height 0.4s ease' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{jugB}L</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <button className="journey-step-btn" onClick={() => setJugA(pairKey === '3-5' ? 3 : pairKey === '6-9' ? 6 : 4)}>🚰 Fill A</button>
            <button className="journey-step-btn" onClick={() => {
              const capA = pairKey === '3-5' ? 3 : pairKey === '6-9' ? 6 : 4;
              const capB = pairKey === '3-5' ? 5 : pairKey === '6-9' ? 9 : 6;
              const curA = jugA === 0 ? capA : jugA;
              const amt = Math.min(curA, capB - jugB);
              setJugA(curA - amt);
              setJugB(p => Math.min(capB, p + amt));
            }}>➡️ Pour A ➔ B</button>
          </div>

          {level === 14 && (
            <div style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '0.95rem' }}>
              Jug A ({jugA}L) + Jug B ({jugB}L) = Total {jugA + jugB}L
            </div>
          )}
          {level === 16 && (jugA === 2 || jugB === 2) && (
            <div className="journey-pop" style={{ marginTop: 8 }}>🎉 Exactly 2L isolated! Puzzle Solved!</div>
          )}
          {level === 17 && (
            <div>
              <button className="journey-start-btn" style={{ margin: '6px 0' }} onClick={() => setImpTried(true)}>
                🔒 Try Making 3L Water
              </button>
              {impTried && <div className="journey-pop" style={{ marginTop: 8, color: '#EF4444' }}>❌ Impossible! 3L can NEVER be made with 4L & 6L jugs!</div>}
            </div>
          )}
          {level === 18 && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 6 }}>
              <span style={{ fontWeight: 800, color: '#22C55E' }}>Possible: 2, 4, 6, 8, 10</span>
              <span style={{ fontWeight: 800, color: '#EF4444' }}>Impossible: 1, 3, 5, 7, 9</span>
            </div>
          )}
          {level === 19 && (
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--clr-accent)', marginTop: 6 }}>
              Jumps of 2: 2L ➔ 4L ➔ 6L ➔ 8L ➔ 10L
            </div>
          )}
          {level === 20 && (
            <div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
                <button className="journey-step-btn" onClick={() => { setPairKey('4-6'); setJugA(0); setJugB(0); }}>4 & 6</button>
                <button className="journey-step-btn" onClick={() => { setPairKey('3-5'); setJugA(0); setJugB(0); }}>3 & 5</button>
                <button className="journey-step-btn" onClick={() => { setPairKey('6-9'); setJugA(0); setJugB(0); }}>6 & 9</button>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: 6 }}>
                {pairKey === '4-6' && '4 & 6 ➔ Jumps of 2 (2, 4, 6, 8, 10)'}
                {pairKey === '3-5' && '3 & 5 ➔ Jumps of 1 (All numbers work!)'}
                {pairKey === '6-9' && '6 & 9 ➔ Jumps of 3 (3, 6, 9, 12, 15)'}
              </div>
            </div>
          )}
          {level === 21 && (
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--clr-accent)', marginTop: 6 }}>
              Every container pair has ONE fixed hidden step size!
            </div>
          )}
          {level === 22 && (
            <div className="rule-card" style={{ padding: '12px', textAlign: 'center', marginTop: 8 }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--clr-accent)', margin: '2px 0' }}>
                The Greatest Common Divisor (GCD)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: 0 }}>
                The hidden jump step is formally called the <strong>Greatest Common Divisor (GCD)</strong>!
              </p>
            </div>
          )}
        </div>
      )}

      {nextLvlBtn}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TheoryAutoDemo — Written theory paired with interactive auto-visualization demo
// ─────────────────────────────────────────────────────────────────────────────
function TheoryAutoDemo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const DEMO_JUG_A = 3;
  const DEMO_JUG_B = 5;
  const DEMO_TARGET = 4;

  const demoSteps = [
    { a: 0, b: 0, action: 'Start', desc: 'Both Jug A (3L) and Jug B (5L) start empty.' },
    { a: 0, b: 5, action: 'Fill B (🚰)', desc: 'Fill Jug B to its full capacity of 5 Liters.' },
    { a: 3, b: 2, action: 'Pour B ➡️ A', desc: 'Pour Jug B into Jug A until A is full (3L). 2L remains in Jug B.' },
    { a: 0, b: 2, action: 'Empty A (🗑️)', desc: 'Empty Jug A. Now Jug A has 0L and Jug B has 2L.' },
    { a: 2, b: 0, action: 'Pour B ➡️ A', desc: 'Transfer the 2L from Jug B into Jug A. Jug A now holds 2L.' },
    { a: 2, b: 5, action: 'Fill B (🚰)', desc: 'Fill Jug B again to 5 Liters.' },
    { a: 3, b: 4, action: 'Pour B ➡️ A', desc: 'Pour Jug B into Jug A until Jug A is full (needs 1L). Exactly 4L remains in Jug B! 🎉 TARGET REACHED!' }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % demoSteps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying, demoSteps.length]);

  const step = demoSteps[currentStep];

  return (
    <div className="theory-auto-demo-wrapper" style={{ textAlign: 'left', width: '100%' }}>
      {/* Visual Auto-Demo Game Simulator */}
      <div style={{
        background: 'var(--clr-surface)', border: '1.5px solid var(--clr-border)',
        borderRadius: '16px', padding: '20px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--clr-accent)', fontWeight: 700 }}>
              🎥 Live Auto-Visualization
            </h3>
            <span style={{ fontSize: '0.84rem', color: 'var(--clr-text-soft)', display: 'block', marginTop: '4px' }}>
              Measuring {DEMO_TARGET}L with {DEMO_JUG_A}L & {DEMO_JUG_B}L Jugs &bull; Step {currentStep + 1} of {demoSteps.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{
              background: 'var(--clr-card)', border: '1px solid var(--clr-border)',
              borderRadius: '8px', padding: '8px 14px', color: 'var(--clr-text)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button onClick={() => setCurrentStep(prev => (prev + 1) % demoSteps.length)} style={{
              background: 'var(--clr-card)', border: '1px solid var(--clr-border)',
              borderRadius: '8px', padding: '8px 14px', color: 'var(--clr-text)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              ⏭️ Next Step
            </button>
          </div>
        </div>

        {/* Demo Jugs Display */}
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', margin: '20px 0', alignItems: 'flex-end' }}>
          {/* Jug A */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>Jug A ({DEMO_JUG_A}L)</span>
            <div style={{
              width: 70, height: 140, border: '3px solid var(--clr-text)', borderTop: 'none',
              borderRadius: '0 0 10px 10px', position: 'relative', background: 'rgba(255,255,255,0.05)', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${(step.a / DEMO_JUG_A) * 100}%`,
                background: 'linear-gradient(to top, #3B82F6, #93C5FD)',
                transition: 'height 0.6s ease'
              }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1rem' }}>
                {step.a}L
              </div>
            </div>
          </div>

          {/* Jug B */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>Jug B ({DEMO_JUG_B}L)</span>
            <div style={{
              width: 70, height: 180, border: '3px solid var(--clr-text)', borderTop: 'none',
              borderRadius: '0 0 10px 10px', position: 'relative', background: 'rgba(255,255,255,0.05)', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${(step.b / DEMO_JUG_B) * 100}%`,
                background: 'linear-gradient(to top, #F08C46, #FFB873)',
                transition: 'height 0.6s ease'
              }} />
              {/* Target Line at 4L */}
              <div style={{
                position: 'absolute', bottom: `${(DEMO_TARGET / DEMO_JUG_B) * 100}%`, left: 0, right: 0,
                borderTop: '2px dashed #ffea75', zIndex: 4
              }}>
                <span style={{ position: 'absolute', right: 4, bottom: 2, fontSize: '0.65rem', color: '#ffea75', fontWeight: 'bold' }}>4L Target ⭐</span>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1rem' }}>
                {step.b}L
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div style={{
          background: 'rgba(240, 140, 70, 0.12)', border: '1px solid var(--clr-accent)',
          borderRadius: '8px', padding: '10px 14px', fontSize: '0.88rem', color: 'var(--clr-text)', textAlign: 'center'
        }}>
          💡 <strong>{step.action}:</strong> {step.desc}
        </div>
      </div>

      {/* Theory Content Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--clr-accent)', fontSize: '1rem' }}>🧩 1. The Core Secret: Greatest Common Divisor (GCD)</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--clr-text-soft)' }}>
            Every time you fill, empty, or pour water between two jugs of capacities <strong>A</strong> and <strong>B</strong>, the total amount of water in any jug changes only by integer multiples of <strong>A</strong> and <strong>B</strong> (Bézout's Identity: <code>T = x·A + y·B</code>).
            <br />
            Therefore, any volume of water you can measure is <strong>always a multiple of GCD(A, B)</strong>.
          </p>
        </div>

        <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--clr-accent)', fontSize: '1rem' }}>🎯 2. Coprime Jugs (GCD = 1)</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--clr-text-soft)' }}>
            When two jugs are <strong>coprime</strong> (meaning GCD = 1, like 3L & 5L), you can measure <strong>EVERY integer target volume</strong> from 1L up to their sum!
            In the demo above, GCD(3, 5) = 1, allowing us to reach exactly 4L in 6 steps.
          </p>
        </div>

        <div style={{ background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--clr-accent)', fontSize: '1rem' }}>🔒 3. The Insolvability Trap (GCD &gt; 1)</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--clr-text-soft)' }}>
            If two jugs share a common divisor greater than 1 (like 4L & 6L, where GCD = 2), you can <strong>ONLY</strong> measure multiples of 2 (2L, 4L, 6L, 8L...).
            Trying to measure an odd target like 3L or 5L is <strong>mathematically impossible</strong>!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WaterJugLab({ onBack, setMode }) {
  const [difficulty, setDifficulty] = useState(0); // 0: Kids Mode, 1: Coprime Basics, 2: Larger Coprimes, 3: GCD Multiples, 4: Optimization, 5: Insolvability Trap, 6: Grandmaster Challenge
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'finished'
  const [questionCount, setQuestionCount] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  // Jug and Level States
  const [jugA, setJugA] = useState(0); // Current level Jug A capacity
  const [jugB, setJugB] = useState(0); // Current level Jug B capacity
  const [jugAVal, setJugAVal] = useState(0); // Current volume in Jug A
  const [jugBVal, setJugBVal] = useState(0); // Current volume in Jug B
  const [target, setTarget] = useState(0); // Target volume
  const [maxMoves, setMaxMoves] = useState(15);
  const [movesTaken, setMovesTaken] = useState(0);
  const [solvable, setSolvable] = useState(true);
  const [gcdVal, setGcdVal] = useState(1);

  const [setupTab, setSetupTab] = useState('concepts'); // 'play' | 'concepts' | 'theory'
  const [journeyDone, setJourneyDone] = useState(false);
  const [showTheoryModal, setShowTheoryModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [results, setResults] = useState([]);

  const [history, setHistory] = useState([]);
  const [recommendedAction, setRecommendedAction] = useState(null);
  const [hoverAction, setHoverAction] = useState(null);

  const diffLabels = [
    'Level 0',
    'Level 1',
    'Level 2',
    'Level 3',
    'Level 4',
    'Level 5',
    'Level 6',
    'Level 7',
    'Level 8',
    'Level 9',
    'Level 10',
    'Level 11',
    'Level 12'
  ];

  const generateLevelData = (lvl) => {
    switch (lvl) {
      case 0:
        return { jugA: 1, jugB: 2, target: 1, maxMoves: 6, solvable: true, gcd: 1 };
      case 1:
        return { jugA: 2, jugB: 3, target: 1, maxMoves: 6, solvable: true, gcd: 1 };
      case 2:
        return { jugA: 3, jugB: 5, target: 3, maxMoves: 6, solvable: true, gcd: 1 };
      case 3:
        return { jugA: 3, jugB: 5, target: 2, maxMoves: 8, solvable: true, gcd: 1 };
      case 4:
        return { jugA: 3, jugB: 5, target: 4, maxMoves: 10, solvable: true, gcd: 1 };
      case 5:
        return { jugA: 4, jugB: 7, target: 3, maxMoves: 10, solvable: true, gcd: 1 };
      case 6:
        return { jugA: 5, jugB: 8, target: 2, maxMoves: 12, solvable: true, gcd: 1 };
      case 7:
        return { jugA: 4, jugB: 6, target: 2, maxMoves: 8, solvable: true, gcd: 2 };
      case 8:
        return { jugA: 6, jugB: 9, target: 3, maxMoves: 10, solvable: true, gcd: 3 };
      case 9:
        return { jugA: 7, jugB: 11, target: 4, maxMoves: 14, solvable: true, gcd: 1 };
      case 10:
        return { jugA: 4, jugB: 6, target: 3, maxMoves: 10, solvable: false, gcd: 2 };
      case 11:
        return { jugA: 6, jugB: 9, target: 5, maxMoves: 10, solvable: false, gcd: 3 };
      case 12:
      default:
        return { jugA: 9, jugB: 13, target: 7, maxMoves: 16, solvable: true, gcd: 1 };
    }
  };

  // Fetch a question from API with clean local generator fallback
  const fetchQuestion = async () => {
    setLoading(true);
    setRevealed(false);
    setFeedback('');
    setJugAVal(0);
    setJugBVal(0);
    setMovesTaken(0);
    setHistory([]);
    setRecommendedAction(null);
    setHoverAction(null);

    const localData = generateLevelData(difficulty);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE}/jug-api/question?difficulty=${difficulty}`);
      if (response.ok) {
        const data = await response.json();
        setJugA(data.jugA);
        setJugB(data.jugB);
        setTarget(data.target);
        setMaxMoves(data.maxMoves);
        setSolvable(data.solvable);
        setGcdVal(data.gcd);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback silently to local generator
    }

    setJugA(localData.jugA);
    setJugB(localData.jugB);
    setTarget(localData.target);
    setMaxMoves(localData.maxMoves);
    setSolvable(localData.solvable);
    setGcdVal(localData.gcd);
    setLoading(false);
  };

  // Auto-run solver for Kids Mode (difficulty === 0) to guide their steps
  useEffect(() => {
    if (phase === 'playing' && difficulty === 0 && solvable && !loading && !revealed) {
      const timer = setTimeout(() => {
        askMentorHint();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [jugAVal, jugBVal, solvable, loading, revealed, phase, difficulty]);

  const startGame = () => {
    setPhase('playing');
    setCurrentQuestion(0);
    setScore(0);
    setResults([]);
    fetchQuestion();
  };

  // Perform a move
  const handleAction = (action) => {
    if (revealed) return;

    // Save to history stack before executing move
    setHistory((prev) => [...prev, { jugAVal, jugBVal, movesTaken }]);
    setRecommendedAction(null);

    let nextA = jugAVal;
    let nextB = jugBVal;

    switch (action) {
      case 'fillA':
        nextA = jugA;
        break;
      case 'fillB':
        nextB = jugB;
        break;
      case 'emptyA':
        nextA = 0;
        break;
      case 'emptyB':
        nextB = 0;
        break;
      case 'pourAToB': {
        if (jugAVal === 0) {
          setFeedback('⚠️ Jug A is empty! Tap 🚰 Fill Jug A first before pouring.');
          return;
        }
        if (jugBVal === jugB) {
          setFeedback('⚠️ Jug B is already full! Empty Jug B before pouring more.');
          return;
        }
        const spaceInB = jugB - jugBVal;
        const amt = Math.min(jugAVal, spaceInB);
        nextA = jugAVal - amt;
        nextB = jugBVal + amt;
        break;
      }
      case 'pourBToA': {
        if (jugBVal === 0) {
          setFeedback('⚠️ Jug B is empty! Tap 🚰 Fill Jug B first before pouring.');
          return;
        }
        if (jugAVal === jugA) {
          setFeedback('⚠️ Jug A is already full! Empty Jug A before pouring more.');
          return;
        }
        const spaceInA = jugA - jugAVal;
        const amt = Math.min(jugBVal, spaceInA);
        nextB = jugBVal - amt;
        nextA = jugAVal + amt;
        break;
      }
      default:
        return;
    }

    setJugAVal(nextA);
    setJugBVal(nextB);
    const nextMoves = movesTaken + 1;
    setMovesTaken(nextMoves);

    // Auto-check if solvable target is reached
    if (solvable && (nextA === target || nextB === target)) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setFeedback(`Target reached! ${nextA === target ? 'Jug A' : 'Jug B'} holds exactly ${target}L.`);
      setRevealed(true);
      setResults((r) => [
        ...r,
        {
          qNo: currentQuestion + 1,
          jugA,
          jugB,
          target,
          moves: nextMoves,
          result: 'Correct',
          note: `Solved in ${nextMoves} moves.`
        }
      ]);
      return;
    }

    // Check move limit violation
    if (nextMoves >= maxMoves) {
      setIsCorrect(false);
      setFeedback('Move limit exceeded! Try again.');
      setRevealed(true);
      setResults((r) => [
        ...r,
        {
          qNo: currentQuestion + 1,
          jugA,
          jugB,
          target,
          moves: nextMoves,
          result: 'Failed',
          note: 'Exceeded the move limit.'
        }
      ]);
    }
  };

  // Helper to calculate preview volumes for hover action
  const getPreviewValues = (act) => {
    let nextA = jugAVal;
    let nextB = jugBVal;
    switch (act) {
      case 'fillA':
        nextA = jugA;
        break;
      case 'fillB':
        nextB = jugB;
        break;
      case 'emptyA':
        nextA = 0;
        break;
      case 'emptyB':
        nextB = 0;
        break;
      case 'pourAToB': {
        const spaceInB = jugB - jugBVal;
        const amt = Math.min(jugAVal, spaceInB);
        nextA = jugAVal - amt;
        nextB = jugBVal + amt;
        break;
      }
      case 'pourBToA': {
        const spaceInA = jugA - jugAVal;
        const amt = Math.min(jugBVal, spaceInA);
        nextB = jugBVal - amt;
        nextA = jugAVal + amt;
        break;
      }
      default:
        break;
    }
    return { a: nextA, b: nextB };
  };

  // Undo Last Move spell
  const handleUndo = () => {
    if (history.length === 0 || revealed) return;
    const previousState = history[history.length - 1];
    setJugAVal(previousState.jugAVal);
    setJugBVal(previousState.jugBVal);
    setMovesTaken(previousState.movesTaken);
    setHistory(history.slice(0, -1));
    setRecommendedAction(null);
    setFeedback('Undo Spell cast! Reverted one move.');
  };

  // BFS Shortest Path solver for Mentor Hint
  const askMentorHint = () => {
    if (revealed) return;
    if (!solvable) {
      setRecommendedAction('declareImpossible');
      return;
    }

    const queue = [[jugAVal, jugBVal, []]];
    const visited = new Set();
    visited.add(`${jugAVal},${jugBVal}`);

    const getTransitions = (a, b) => {
      const list = [];
      // Fill A
      if (a < jugA) list.push({ nextA: jugA, nextB: b, action: 'fillA' });
      // Fill B
      if (b < jugB) list.push({ nextA: a, nextB: jugB, action: 'fillB' });
      // Empty A
      if (a > 0) list.push({ nextA: 0, nextB: b, action: 'emptyA' });
      // Empty B
      if (b > 0) list.push({ nextA: a, nextB: 0, action: 'emptyB' });
      // Pour A -> B
      if (a > 0 && b < jugB) {
        const amt = Math.min(a, jugB - b);
        list.push({ nextA: a - amt, nextB: b + amt, action: 'pourAToB' });
      }
      // Pour B -> A
      if (b > 0 && a < jugA) {
        const amt = Math.min(b, jugA - a);
        list.push({ nextA: a + amt, nextB: b - amt, action: 'pourBToA' });
      }
      return list;
    };

    let solutionPath = null;
    while (queue.length > 0) {
      const [a, b, path] = queue.shift();
      if (a === target || b === target) {
        solutionPath = path;
        break;
      }

      for (const trans of getTransitions(a, b)) {
        const key = `${trans.nextA},${trans.nextB}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([trans.nextA, trans.nextB, [...path, trans.action]]);
        }
      }
    }

    if (solutionPath && solutionPath.length > 0) {
      const nextAct = solutionPath[0];
      setRecommendedAction(nextAct);
    } else {
      setRecommendedAction('undo');
    }
  };

  // Level 5: Player claims the puzzle is mathematically impossible
  const handleDeclareUnsolvable = () => {
    if (revealed) return;

    if (!solvable) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setFeedback(`Correct! It is impossible to measure ${target}L using ${jugA}L and ${jugB}L jugs because the target does not line up with any of the highlighted gold lines (multiples of their Greatest Common Divisor: ${gcdVal}).`);
      setResults((r) => [
        ...r,
        {
          qNo: currentQuestion + 1,
          jugA,
          jugB,
          target,
          moves: movesTaken,
          result: 'Correct',
          note: `Correctly identified as impossible (GCD = ${gcdVal}).`
        }
      ]);
    } else {
      setIsCorrect(false);
      setFeedback(`Incorrect! This level is actually solvable because the Greatest Common Divisor is ${gcdVal}, meaning the target volume lies exactly on one of the highlighted gold lines!`);
      setResults((r) => [
        ...r,
        {
          qNo: currentQuestion + 1,
          jugA,
          jugB,
          target,
          moves: movesTaken,
          result: 'Failed',
          note: `Incorrectly claimed solvable puzzle was impossible.`
        }
      ]);
    }
    setRevealed(true);
  };

  const handleNext = () => {
    if (currentQuestion + 1 >= questionCount) {
      setPhase('finished');
    } else {
      setCurrentQuestion((q) => q + 1);
      fetchQuestion();
    }
  };

  // Rendering setup screen
  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{
          background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '28px 36px 36px', maxWidth: '720px', width: '100%',
          textAlign: 'center', position: 'relative'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '20px', width: '100%' }}>
            {setupTab !== 'play' ? (
              <button onClick={() => setSetupTab('play')} style={{
                background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                borderRadius: '8px', padding: '8px 16px', color: 'var(--clr-text-soft)',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 6px', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>← Menu</button>
            ) : (
              <button onClick={onBack} style={{
                background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                borderRadius: '8px', padding: '8px 16px', color: 'var(--clr-text-soft)',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>← Home</button>
            )}
          </div>

          {setupTab === 'play' && (
            <>

              <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: 'var(--clr-text)', margin: '0 0 12px', lineHeight: 1.1 }}>
                Water Jug Lab
              </h1>
              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Fill, pour, and measure the exact target water!
              </p>

              {/* Tab Navigation */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setSetupTab('play')} style={{
                  background: setupTab === 'play' ? 'var(--clr-accent)' : 'transparent',
                  border: setupTab === 'play' ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                  borderRadius: '6px', padding: '8px 16px',
                  color: setupTab === 'play' ? '#FFF' : 'var(--clr-text-soft)',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>🎮 Play Lab</button>
                <button onClick={() => setSetupTab('concepts')} style={{
                  background: setupTab === 'concepts' ? 'var(--clr-accent)' : 'transparent',
                  border: setupTab === 'concepts' ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                  borderRadius: '6px', padding: '8px 16px',
                  color: setupTab === 'concepts' ? '#FFF' : 'var(--clr-text-soft)',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>🧩 Intuition Journey</button>
                <button onClick={() => setSetupTab('theory')} style={{
                  background: setupTab === 'theory' ? 'var(--clr-accent)' : 'transparent',
                  border: setupTab === 'theory' ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                  borderRadius: '6px', padding: '8px 16px',
                  color: setupTab === 'theory' ? '#FFF' : 'var(--clr-text-soft)',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>📚 Theory & Auto-Demo</button>
              </div>
            </>
          )}

          {setupTab === 'play' && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--clr-text)', fontSize: '0.9rem', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Select Difficulty:
                </h3>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {diffLabels.map((lbl, idx) => (
                    <button key={idx} onClick={() => setDifficulty(idx)} style={{
                      background: difficulty === idx ? 'var(--clr-accent)' : 'transparent',
                      border: difficulty === idx ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                      borderRadius: '50px', padding: '8px 16px',
                      color: difficulty === idx ? '#FFF' : 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                    }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', margin: '0 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  How many questions? (max 100)
                </label>
                <input type="text" value={questionCount} onChange={(e) => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) <= 100)) setQuestionCount(v === '' ? '' : Number(v)) }} style={{
                  background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px',
                  padding: '10px', color: 'var(--clr-text)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                  width: '100px', textAlign: 'center', outline: 'none'
                }} placeholder="5" />
              </div>

              <button onClick={startGame} style={{
                background: 'var(--clr-accent)',
                border: 'none', borderRadius: '6px',
                padding: '10px 24px', color: '#FFF',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                Start Lab
              </button>
            </>
          )}

          {setupTab === 'concepts' && (
            <IntroJourney onComplete={() => { setJourneyDone(true); setSetupTab('play'); }} />
          )}

          {setupTab === 'theory' && (
            <TheoryAutoDemo />
          )}
        </div>
      </div>
    );
  }

  // Rendering finished results screen
  if (phase === 'finished') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{
          background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '48px 40px', maxWidth: '720px', width: '100%',
          textAlign: 'center', position: 'relative'
        }}>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: '48px', color: 'var(--clr-text)', margin: '0 0 12px', lineHeight: 1.1 }}>
            🏆 Lab Session Completed
          </h1>
          <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
            You have successfully completed this water jug measuring session!
          </p>

          <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '20px', display: 'inline-block', marginBottom: '24px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--clr-accent)' }}>{score} / {questionCount}</div>
            <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 600 }}>Questions Correct</div>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '24px', border: '1px solid var(--clr-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--clr-text)', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }}>
                  <th style={{ padding: '10px' }}>Level</th>
                  <th style={{ padding: '10px' }}>Jug Sizes</th>
                  <th style={{ padding: '10px' }}>Target</th>
                  <th style={{ padding: '10px' }}>Result</th>
                  <th style={{ padding: '10px' }}>Performance Note</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--clr-border)', background: res.result === 'Correct' ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)' }}>
                    <td style={{ padding: '10px' }}>Level {res.qNo}</td>
                    <td style={{ padding: '10px' }}>{res.jugA}L & {res.jugB}L</td>
                    <td style={{ padding: '10px' }}>{res.target}L</td>
                    <td style={{ padding: '10px', color: res.result === 'Correct' ? 'var(--clr-correct)' : 'var(--clr-wrong)', fontWeight: 600 }}>{res.result === 'Correct' ? '✓ Correct' : '✗ Incorrect'}</td>
                    <td style={{ padding: '10px' }}>{res.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={startGame} style={{
              background: 'var(--clr-accent)', border: 'none', borderRadius: '6px',
              padding: '10px 24px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
            }}>
              Try Again
            </button>
            <button onClick={() => setPhase('setup')} style={{
              background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '6px',
              padding: '10px 24px', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
            }}>
              Change Level
            </button>
            <button onClick={onBack} style={{
              background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '6px',
              padding: '10px 24px', color: 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
            }}>
              Exit Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rendering gameplay screen
  const heightA = `${(jugAVal / jugA) * 100}%`;
  const heightB = `${(jugBVal / jugB) * 100}%`;
  const preview = hoverAction ? getPreviewValues(hoverAction) : null;

  const getJugHeight = (cap) => {
    if (cap > 20) return 280;
    if (cap > 12) return 240;
    return 200;
  };

  // Helper for tick lines: 1L if cap <= 12, 2L if 12 < cap <= 20, 5L if cap > 20
  const getTickValues = (cap) => {
    if (cap <= 1) return [];
    const step = cap > 20 ? 5 : cap > 12 ? 2 : 1;
    const vals = [];
    for (let v = step; v < cap; v += step) {
      vals.push(v);
    }
    if (target > 0 && target < cap && !vals.includes(target)) {
      vals.push(target);
      vals.sort((a, b) => a - b);
    }
    return vals;
  };

  return (
    <QuizLayout title="" onBack={() => setPhase('setup')} loading={loading} backLabel="Menu">
      <div className="gameplay-area">

        {/* Target and instruction header */}
        <div className="jug-card target-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {difficulty === 0 ? (
            <div className="kids-target-badge">
              <div className="kids-target-value">Get {target} {target === 1 ? 'Liter' : 'Liters'}!</div>
            </div>
          ) : (
            <>
              <span className="target-label">Get</span>
              <div className="target-val">{target} {target === 1 ? 'Liter' : 'Liters'}</div>
            </>
          )}

          <div style={{ marginTop: '14px', display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
            <button
              className="btn btn-outline"
              disabled={revealed}
              onClick={askMentorHint}
              style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '20px' }}
            >
              💡 Hint
            </button>
            <button
              className={`btn btn-outline ${recommendedAction === 'undo' ? 'glow-action' : ''}`}
              disabled={revealed || history.length === 0}
              onClick={handleUndo}
              style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '20px' }}
            >
              🔮 Undo Move
            </button>
          </div>


        </div>

        {/* Jugs Row visual representation */}
        <div className="jug-card">
          <div className="jugs-row" style={{ alignItems: 'center' }}>
            {/* Jug A */}
            <div className="jug-wrapper">
              <div className="jug-label">Jug A ({jugA}L)</div>

              <div className="jug-container-relative">
                {/* Physical Tap Button above Jug A */}
                <button
                  className={`physical-tap-btn ${recommendedAction === 'fillA' ? 'glow-action' : ''}`}
                  disabled={revealed || (difficulty === 0 && recommendedAction && recommendedAction !== 'fillA')}
                  onClick={() => handleAction('fillA')}
                  onMouseEnter={() => setHoverAction('fillA')}
                  onMouseLeave={() => setHoverAction(null)}
                  title="Fill Jug A (🚰)"
                >
                  🚰
                </button>

                <div className="jug-glass" style={{ height: `${getJugHeight(jugA)}px`, marginBottom: 0, overflow: 'visible' }}>
                  {/* Liquid Layer Container (Clipped) */}
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '0 0 10px 10px', pointerEvents: 'none' }}>
                    {preview && (
                      <div className="jug-liquid-preview" style={{ height: `${(preview.a / jugA) * 100}%` }} />
                    )}
                    <div className="jug-liquid" style={{ height: heightA }} />
                  </div>

                  {/* Horizontal Ticks Overlay for Jug A */}
                  {getTickValues(jugA).map((val) => {
                    const positionPercent = (val / jugA) * 100;
                    const isMultipleOfGcd = val % gcdVal === 0;
                    return (
                      <div
                        key={val}
                        style={{
                          position: 'absolute',
                          bottom: `${positionPercent}%`,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: isMultipleOfGcd ? 'rgba(255, 234, 117, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                          borderBottom: isMultipleOfGcd ? '1.5px solid #ffea75' : 'none',
                          zIndex: 3,
                          pointerEvents: 'none'
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          right: '6px',
                          bottom: positionPercent > 88 ? '-14px' : '2px',
                          fontSize: '0.68rem',
                          color: isMultipleOfGcd ? '#ffea75' : 'var(--clr-text-soft)',
                          fontWeight: isMultipleOfGcd ? 'bold' : 'normal',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '1px 3px',
                          borderRadius: '3px'
                        }}>
                          {val}L
                        </span>
                        {val === target && (
                          <span style={{
                            position: 'absolute',
                            left: '6px',
                            bottom: '-7px',
                            fontSize: '1rem',
                            filter: 'drop-shadow(0 0 4px #ffea75)',
                            zIndex: 5,
                          }}>⭐</span>
                        )}
                      </div>
                    );
                  })}

                  <div className="jug-value-overlay">
                    {jugAVal}L
                    {preview && preview.a !== jugAVal && (
                      <span style={{ fontSize: '0.75rem', display: 'block', color: '#ffea75', marginTop: '2px', fontWeight: 600 }}>
                        → {preview.a}L
                      </span>
                    )}
                  </div>
                </div>

                {/* Physical Drain Button below Jug A */}
                <button
                  className={`physical-drain-btn ${recommendedAction === 'emptyA' ? 'glow-action' : ''}`}
                  disabled={revealed || (difficulty < 11 && jugAVal === 0) || (difficulty === 0 && recommendedAction && recommendedAction !== 'emptyA')}
                  onClick={() => handleAction('emptyA')}
                  onMouseEnter={() => setHoverAction('emptyA')}
                  onMouseLeave={() => setHoverAction(null)}
                  title="Empty Jug A (🗑️)"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Middle Transfer Arrows */}
            <div className="transfer-section">
              <button
                className={`btn-pour ${recommendedAction === 'pourAToB' ? 'glow-action' : ''}`}
                disabled={revealed || (difficulty < 11 && (jugAVal === 0 || jugBVal === jugB)) || (difficulty === 0 && recommendedAction && recommendedAction !== 'pourAToB')}
                onClick={() => handleAction('pourAToB')}
                onMouseEnter={() => setHoverAction('pourAToB')}
                onMouseLeave={() => setHoverAction(null)}
              >
                A ➡️ B
              </button>
              <button
                className={`btn-pour ${recommendedAction === 'pourBToA' ? 'glow-action' : ''}`}
                disabled={revealed || (difficulty < 11 && (jugBVal === 0 || jugAVal === jugA)) || (difficulty === 0 && recommendedAction && recommendedAction !== 'pourBToA')}
                onClick={() => handleAction('pourBToA')}
                onMouseEnter={() => setHoverAction('pourBToA')}
                onMouseLeave={() => setHoverAction(null)}
              >
                A ⬅️ B
              </button>
            </div>

            {/* Jug B */}
            <div className="jug-wrapper">
              <div className="jug-label">Jug B ({jugB}L)</div>

              <div className="jug-container-relative">
                {/* Physical Tap Button above Jug B */}
                <button
                  className={`physical-tap-btn ${recommendedAction === 'fillB' ? 'glow-action' : ''}`}
                  disabled={revealed || (difficulty === 0 && recommendedAction && recommendedAction !== 'fillB')}
                  onClick={() => handleAction('fillB')}
                  onMouseEnter={() => setHoverAction('fillB')}
                  onMouseLeave={() => setHoverAction(null)}
                  title="Fill Jug B (🚰)"
                >
                  🚰
                </button>

                <div className="jug-glass" style={{ height: `${getJugHeight(jugB)}px`, marginBottom: 0, overflow: 'visible' }}>
                  {/* Liquid Layer Container (Clipped) */}
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '0 0 10px 10px', pointerEvents: 'none' }}>
                    {preview && (
                      <div className="jug-liquid-preview" style={{ height: `${(preview.b / jugB) * 100}%` }} />
                    )}
                    <div className="jug-liquid" style={{ height: heightB }} />
                  </div>

                  {/* Horizontal Ticks Overlay for Jug B */}
                  {getTickValues(jugB).map((val) => {
                    const positionPercent = (val / jugB) * 100;
                    const isMultipleOfGcd = val % gcdVal === 0;
                    return (
                      <div
                        key={val}
                        style={{
                          position: 'absolute',
                          bottom: `${positionPercent}%`,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: isMultipleOfGcd ? 'rgba(255, 234, 117, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                          borderBottom: isMultipleOfGcd ? '1.5px solid #ffea75' : 'none',
                          zIndex: 3,
                          pointerEvents: 'none'
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          right: '6px',
                          bottom: positionPercent > 88 ? '-14px' : '2px',
                          fontSize: '0.68rem',
                          color: isMultipleOfGcd ? '#ffea75' : 'var(--clr-text-soft)',
                          fontWeight: isMultipleOfGcd ? 'bold' : 'normal',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '1px 3px',
                          borderRadius: '3px'
                        }}>
                          {val}L
                        </span>
                        {val === target && (
                          <span style={{
                            position: 'absolute',
                            left: '6px',
                            bottom: '-7px',
                            fontSize: '1rem',
                            filter: 'drop-shadow(0 0 4px #ffea75)',
                            zIndex: 5,
                          }}>⭐</span>
                        )}
                      </div>
                    );
                  })}

                  <div className="jug-value-overlay">
                    {jugBVal}L
                    {preview && preview.b !== jugBVal && (
                      <span style={{ fontSize: '0.75rem', display: 'block', color: '#ffea75', marginTop: '2px', fontWeight: 600 }}>
                        → {preview.b}L
                      </span>
                    )}
                  </div>
                </div>

                {/* Physical Drain Button below Jug B */}
                <button
                  className={`physical-drain-btn ${recommendedAction === 'emptyB' ? 'glow-action' : ''}`}
                  disabled={revealed || (difficulty < 11 && jugBVal === 0) || (difficulty === 0 && recommendedAction && recommendedAction !== 'emptyB')}
                  onClick={() => handleAction('emptyB')}
                  onMouseEnter={() => setHoverAction('emptyB')}
                  onMouseLeave={() => setHoverAction(null)}
                  title="Empty Jug B (🗑️)"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <span className="move-count">
              Moves: <strong style={{ color: 'var(--clr-accent)' }}>{movesTaken}</strong> / {maxMoves}
            </span>
            {difficulty === 0 && <span className="gcd-chip">GCD <strong>{gcdVal}</strong></span>}
          </div>

          {(!solvable || difficulty === 10 || difficulty === 11) && !revealed && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                className={`btn btn-primary ${recommendedAction === 'declareImpossible' ? 'glow-action' : ''}`}
                onClick={handleDeclareUnsolvable}
              >
                🔒 Claim This is Impossible!
              </button>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {revealed && (
          <div className="jug-feedback-box">
            <span className={`feedback-badge ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? '🎉 Correct!' : '❌ Try Again!'}
            </span>
            <p className="feedback-text">{feedback}</p>
            <div className="next-action-row">
              <button className="btn btn-success" onClick={handleNext}>
                {currentQuestion + 1 >= questionCount ? 'Complete Lab' : 'Next Challenge'}
              </button>
            </div>
          </div>
        )}

        {/* In-Game Theory & Auto-Demo Modal */}
        {showTheoryModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              background: 'var(--clr-card)', border: '1.5px solid var(--clr-border)', borderRadius: '24px',
              padding: '28px 24px 24px', maxWidth: '680px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
              position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}>
              <button onClick={() => setShowTheoryModal(false)} style={{
                position: 'absolute', top: '16px', right: '16px', background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)', borderRadius: '50%', width: '32px', height: '32px',
                color: 'var(--clr-text)', fontWeight: 'bold', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
              }}>✕</button>
              <TheoryAutoDemo />
            </div>
          </div>
        )}
      </div>
    </QuizLayout>
  );
}

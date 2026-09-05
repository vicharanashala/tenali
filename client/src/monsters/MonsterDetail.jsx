/**
 * MonsterDetail.jsx
 *
 * Full explanation view rendered inside HallPanel when a MonsterCard is
 * tapped. Shows the monster's name, tagline, full description,
 * statistics (breach count, last attempt, cure history), and the
 * "Start Cure" CTA.
 *
 * Spec: §6.5 — "Tap → <MonsterDetail> overlay"
 *
 * UX:
 *   - Hero with monster blob + name + tagline
 *   - Stats row: breach count, last attempt, total cures (and successful)
 *   - Description paragraph
 *   - Two actions: "Start Cure" (calls onStartCure) and "Back to Hall" (handled
 *     by HallPanel via the back button in the header — but we also support an
 *     explicit back button for usability)
 *
 * Props:
 *   - monsterId: string
 *   - breachCount: number
 *   - lastAttempt: number | null
 *   - cureHistory: Array<{ startedAt, success, correctCount }>
 *   - onBack: () => void
 *   - onStartCure: (monsterId, topic) => void
 */

import { useEffect, useMemo, useState } from 'react';
import {
  getMonsterExplanation,
  getMonsterName,
  getMonsterTagline,
} from './monsterExplanations.js';
import { load } from './monsterStore.js';

// Color per monster (matches MonsterCard and MonsterToast)
const MONSTER_COLORS = {
  'bracketeer': { primary: '#5b8def', secondary: '#3a6fce', emoji: '🎯' },
  'sign-swapper': { primary: '#ef5b5b', secondary: '#ce3a3a', emoji: '⚡' },
  'decimal-drifter': { primary: '#f0a500', secondary: '#c78700', emoji: '🌊' },
  'carry-crasher': { primary: '#9b59b6', secondary: '#7d3fa0', emoji: '💥' },
};

function formatRelativeTime(ms) {
  if (ms == null) return 'never';
  const delta = Date.now() - ms;
  if (delta < 60_000) return 'just now';
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} min ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} hr ago`;
  if (delta < 604_800_000) return `${Math.floor(delta / 86_400_000)} days ago`;
  return new Date(ms).toLocaleDateString();
}

function injectDetailStyles() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[data-monster-detail]')) return;

  const css = `
    .monster-detail {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .monster-detail-hero {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(91, 141, 239, 0.12), rgba(91, 141, 239, 0.04));
      border-radius: 12px;
      border-left: 4px solid var(--monster-primary, #5b8def);
    }
    .monster-detail-hero.warning {
      border-left-color: var(--clr-accent, #e8864a) !important;
      background: linear-gradient(135deg, rgba(232, 134, 74, 0.12), rgba(232, 134, 74, 0.04)) !important;
    }
    .monster-detail-hero.healed {
      border-left-color: #ffd700 !important;
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 215, 0, 0.04)) !important;
    }
    .monster-detail-blob {
      width: 80px;
      height: 80px;
      border-radius: 50% 40% 60% 50%;
      background: var(--monster-primary, #5b8def);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      flex-shrink: 0;
      box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: monster-detail-pulse 2.4s ease-in-out infinite;
    }
    @keyframes monster-detail-pulse {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50%      { transform: scale(1.04) rotate(2deg); }
    }
    .monster-detail-name {
      font-family: var(--font-display, 'Source Serif 4', serif);
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .monster-detail-tagline {
      font-size: 13px;
      color: var(--clr-text-soft, #a89e94);
      font-style: italic;
      margin: 0;
    }
    .monster-detail-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .monster-detail-stat {
      text-align: center;
      padding: 10px;
      background: var(--clr-hover, rgba(255,245,230,0.04));
      border-radius: var(--radius-sm, 10px);
      border: 1px solid var(--clr-border, rgba(255,245,230,0.18));
    }
    .monster-detail-stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--clr-accent, #e8864a);
      display: block;
    }
    .monster-detail-hero.healed .monster-detail-stat-value {
      color: #ffd700;
    }
    .monster-detail-hero.warning .monster-detail-stat-value {
      color: var(--clr-accent, #e8864a);
    }
    .monster-detail-stat-label {
      font-size: 11px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .monster-detail-section h3 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--clr-accent, #e8864a);
      margin: 0 0 8px;
      font-weight: 700;
    }
    .monster-detail-description {
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }
    .monster-detail-actions {
      display: flex;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--clr-border, rgba(255,245,230,0.18));
    }
    .monster-detail-btn {
      flex: 1;
      padding: 12px 16px;
      border-radius: var(--radius-sm, 10px);
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .monster-detail-btn-primary {
      background: var(--clr-accent, #e8864a);
      color: white;
    }
    .monster-detail-hero.healed ~ .monster-detail-actions .monster-detail-btn-primary {
      background: #ffd700;
      color: #1a1614;
    }
    .monster-detail-hero.warning ~ .monster-detail-actions .monster-detail-btn-primary {
      background: var(--clr-accent, #e8864a);
      color: white;
    }
    .monster-detail-btn-primary:hover {
      filter: brightness(1.1);
    }
    .monster-detail-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .monster-detail-btn-secondary {
      background: var(--clr-hover, rgba(255,245,230,0.04));
      color: var(--clr-text, #ede8e3);
    }
    .monster-detail-btn-secondary:hover {
      background: var(--clr-hover-strong, rgba(255,245,230,0.08));
    }
    .monster-detail-topic-select {
      display: none;
    }

    /* Interactive Playgrounds for Kids */
    .monster-demo-box {
      background: rgba(0, 0, 0, 0.2);
      border: 2px dashed rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 18px;
      margin-top: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
    }
    .monster-demo-toggles {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      justify-content: center;
    }
    .monster-demo-toggle-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 30px;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.06);
      color: var(--clr-text, #ede8e3);
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .monster-demo-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
    .monster-demo-display {
      font-size: 26px;
      text-align: center;
      margin: 12px 0;
      font-family: var(--font-display), inherit;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .monster-demo-text {
      text-align: center;
      font-size: 13px;
      color: rgba(255, 245, 230, 0.85);
      line-height: 1.5;
      margin: 12px 0 0 0;
    }
    .bracketeer-visual-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 0;
    }
    .bracketeer-visual-math {
      font-size: 32px;
      font-family: var(--font-display), monospace;
      letter-spacing: 2px;
    }
    .bracketeer-multiplier {
      color: #ffd700;
      font-weight: bold;
    }
    .bracketeer-brackets {
      color: #a78bfa;
    }
    .bracketeer-term-a {
      color: #38bdf8;
    }
    .bracketeer-term-b {
      color: #fb923c;
      transition: color 0.3s ease;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px) rotate(-1deg); }
      75% { transform: translateX(2px) rotate(1deg); }
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-monster-detail', '');
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Find the most common topic this monster has been triggered on.
 * Falls back to first seen topic, or null.
 */
function getSuggestedTopic(monsterId) {
  const state = load();
  if (!state || !Array.isArray(state.log)) return null;
  const counts = {};
  for (const e of state.log) {
    if (e.monsterId === monsterId && e.topic) {
      counts[e.topic] = (counts[e.topic] || 0) + 1;
    }
  }
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Return all unique topics this monster has been triggered on,
 * sorted by frequency (most breached topic first).
 * Used to populate the cure topic selector with real choices.
 */
function getAllTopics(monsterId) {
  const state = load();
  if (!state || !Array.isArray(state.log)) return [];
  const counts = {};
  for (const e of state.log) {
    if (e.monsterId === monsterId && e.topic) {
      counts[e.topic] = (counts[e.topic] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);
}

function InteractiveMonsterDemo({ monsterId, colors }) {
  const [bracketeerMode, setBracketeerMode] = useState('correct');
  const [signSwapperStep, setSignSwapperStep] = useState(0);
  const [decimalPlace, setDecimalPlace] = useState(0);
  const [carryCrasherMode, setCarryCrasherMode] = useState('save');
  const [frogValue, setFrogValue] = useState(0);
  const [isHopping, setIsHopping] = useState(false);

  const stepPositions = useMemo(() => [0, -3, 2, -2], []);

  useEffect(() => {
    if (monsterId !== 'sign-swapper') return;

    const target = stepPositions[signSwapperStep];

    if (signSwapperStep === 3) {
      // Instant switch for the Sign Swapper ZAP!
      setFrogValue(target);
      setIsHopping(false);
      return;
    }

    setIsHopping(true);
    const interval = setInterval(() => {
      setFrogValue((prev) => {
        if (prev === target) {
          clearInterval(interval);
          setIsHopping(false);
          return prev;
        }
        const nextVal = prev < target ? prev + 1 : prev - 1;
        if (nextVal === target) {
          clearInterval(interval);
          setIsHopping(false);
        }
        return nextVal;
      });
    }, 200); // 200ms per hop for snappy but visible steps

    return () => clearInterval(interval);
  }, [signSwapperStep, monsterId, stepPositions]);

  // ─── 1. THE BRACKETEER DEMO ───
  if (monsterId === 'bracketeer') {
    return (
      <div className="monster-demo-box" style={{ borderColor: colors.primary }}>
        <div className="monster-demo-toggles">
          <button
            className="monster-demo-toggle-btn"
            onClick={() => setBracketeerMode('correct')}
            style={bracketeerMode === 'correct' ? { background: '#2ecc71', color: '#fff', borderColor: '#2ecc71' } : {}}
          >
            🌟 Correct Way
          </button>
          <button
            className="monster-demo-toggle-btn"
            onClick={() => setBracketeerMode('wrong')}
            style={bracketeerMode === 'wrong' ? { background: '#e74c3c', color: '#fff', borderColor: '#e74c3c' } : {}}
          >
            👾 Bracketeer's Way
          </button>
        </div>

        <div className="bracketeer-visual-container">
          <div className="bracketeer-visual-math">
            <span className="bracketeer-multiplier">3</span>
            <span> × </span>
            <span className="bracketeer-brackets">
              (<span className="bracketeer-term-a">x</span> + <span className="bracketeer-term-b" style={bracketeerMode === 'wrong' ? { color: '#ff6b6b', fontWeight: 'bold', textDecoration: 'underline' } : {}}>5</span>)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', height: '40px', position: 'relative', margin: '8px 0' }}>
            {bracketeerMode === 'correct' ? (
              <svg width="140" height="40" style={{ pointerEvents: 'none' }}>
                <path d="M 20,5 Q 40,25 70,5" fill="none" stroke="#2ecc71" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M 20,5 Q 60,35 120,5" fill="none" stroke="#2ecc71" strokeWidth="3" markerEnd="url(#arrow)" />
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2ecc71" />
                  </marker>
                </defs>
              </svg>
            ) : (
              <svg width="140" height="40" style={{ pointerEvents: 'none' }}>
                <path d="M 20,5 Q 40,25 70,5" fill="none" stroke="#2ecc71" strokeWidth="3" markerEnd="url(#arrow-green)" />
                <path d="M 20,5 Q 60,35 120,5" fill="none" stroke="#95a5a6" strokeWidth="2" strokeDasharray="4" />
                <defs>
                  <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2ecc71" />
                  </marker>
                </defs>
              </svg>
            )}
            {bracketeerMode === 'wrong' && (
              <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '18px', animation: 'bounce 1s infinite' }}>😴</span>
            )}
          </div>

          <div className="monster-demo-display">
            {bracketeerMode === 'correct' ? (
              <div style={{ color: '#2ecc71' }}>
                3 × x + 3 × 5 = <strong style={{ textDecoration: 'underline' }}>3x + 15</strong>
              </div>
            ) : (
              <div style={{ color: '#ff6b6b' }}>
                3 × x + 5 = <strong style={{ textDecoration: 'underline' }}>3x + 5</strong>
              </div>
            )}
          </div>

          <p className="monster-demo-text">
            {bracketeerMode === 'correct'
              ? '🎉 Correct: Both terms got multiplied!'
              : '😢 Oops: The 5 was ignored by the 3!'}
          </p>
        </div>
      </div>
    );
  }

  // ─── 2. THE SIGN SWAPPER DEMO ───
  if (monsterId === 'sign-swapper') {
    const numberLineNodes = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
    const frogIndex = numberLineNodes.indexOf(frogValue);
    const frogLeftPercent = (frogIndex / (numberLineNodes.length - 1)) * 100;

    const stepTexts = [
      'Solve -3 + 5 on the number line!',
      'Start at -3 🐸',
      'Hop 5 to the right to land on +2 🌟',
      'ZAP! +2 becomes -2! 😵'
    ];

    const nextStep = () => {
      if (isHopping) return;
      setSignSwapperStep((prev) => (prev + 1) % 4);
    };

    return (
      <div className="monster-demo-box" style={{ borderColor: colors.primary }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="monster-demo-display" style={{ margin: '8px 0', color: signSwapperStep === 3 ? '#ff6b6b' : '#ede8e3' }}>
            {signSwapperStep === 0 && <span>-3 + 5 = ?</span>}
            {signSwapperStep === 1 && <span>-3</span>}
            {signSwapperStep === 2 && <span style={{ color: '#2ecc71' }}>-3 + 5 = <strong style={{ fontSize: '30px' }}>+2</strong></span>}
            {signSwapperStep === 3 && <span style={{ color: '#ff6b6b' }}>-3 + 5 = <strong style={{ fontSize: '30px' }}>-2</strong> 😵</span>}
          </div>

          <div style={{ position: 'relative', background: 'rgba(0,0,0,0.3)', padding: '12px 6px', borderRadius: '12px', height: '40px', marginTop: '16px' }}>
            <div style={{ position: 'absolute', left: '12px', right: '12px', top: '23px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', width: '100%', height: '100%', alignItems: 'center' }}>
              {numberLineNodes.map((n) => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: n === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }}></div>
                  <span style={{ fontSize: '10px', marginTop: '6px', color: n === 0 ? '#fff' : 'rgba(255,255,255,0.6)' }}>{n}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                position: 'absolute',
                left: `calc(${frogLeftPercent}% - 14px)`,
                top: '-15px',
                fontSize: '28px',
                transition: signSwapperStep === 3 ? 'none' : 'left 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s',
                animation: signSwapperStep === 3 && !isHopping ? 'shake 0.5s infinite' : 'none'
              }}
            >
              {signSwapperStep === 3 && !isHopping ? '😵' : '🐸'}
            </div>
          </div>

          <p className="monster-demo-text" style={{ minHeight: '40px', margin: '0' }}>
            {stepTexts[signSwapperStep]}
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="monster-detail-btn monster-detail-btn-primary"
              onClick={nextStep}
              disabled={isHopping}
              style={{ flex: 1, padding: '10px', fontSize: '14px', background: colors.primary }}
            >
              {isHopping ? '🐸 Hopping...' : signSwapperStep === 3 ? '🔄 Try Again' : '🐸 Hop!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. THE DECIMAL DRIFTER DEMO ───
  if (monsterId === 'decimal-drifter') {
    const scales = [
      { text: '125.0', label: '🏢 A Giant Skyscraper! (Super Big!)', size: '90px', emoji: '🏢' },
      { text: '12.5', label: '🦒 A Tall Giraffe! (Normal/Big)', size: '60px', emoji: '🦒' },
      { text: '1.25', label: '🐈 A Little Cat! (Small)', size: '35px', emoji: '🐈' },
      { text: '0.125', label: '🐜 A Tiny Ant! (Microscopic!)', size: '15px', emoji: '🐜' }
    ];

    const currentScale = scales[decimalPlace];

    return (
      <div className="monster-demo-box" style={{ borderColor: colors.primary }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div className="monster-demo-display" style={{ letterSpacing: '4px', fontSize: '32px', height: '40px', display: 'flex', alignItems: 'center' }}>
            {currentScale.text.split('').map((char, index) => (
              <span
                key={index}
                style={char === '.' ? { color: colors.primary, fontWeight: 'bold', fontSize: '40px', transform: 'scale(1.2)', display: 'inline-block' } : {}}
              >
                {char}
              </span>
            ))}
          </div>

          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={decimalPlace}
            onChange={(e) => setDecimalPlace(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: colors.primary }}
          />

          <div style={{
            height: '110px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            margin: '12px 0',
            width: '100%',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{
              fontSize: currentScale.size,
              lineHeight: 1,
              transition: 'font-size 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {currentScale.emoji}
            </div>
          </div>

          <div style={{ width: '100%', textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>{currentScale.label}</strong>
            <p className="monster-demo-text" style={{ margin: '6px 0 0 0' }}>
              Moving the dot changes the size by 10x!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. THE CARRY CRASHER DEMO ───
  if (monsterId === 'carry-crasher') {
    return (
      <div className="monster-demo-box" style={{ borderColor: colors.primary }}>

        <div className="monster-demo-toggles">
          <button
            className="monster-demo-toggle-btn"
            onClick={() => setCarryCrasherMode('save')}
            style={carryCrasherMode === 'save' ? { background: '#2ecc71', color: '#fff', borderColor: '#2ecc71' } : {}}
          >
            🦸 Save Carry
          </button>
          <button
            className="monster-demo-toggle-btn"
            onClick={() => setCarryCrasherMode('crash')}
            style={carryCrasherMode === 'crash' ? { background: '#e74c3c', color: '#fff', borderColor: '#e74c3c' } : {}}
          >
            💥 Carry Crasher
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
          <div className="carry-crasher-sum" style={{ border: '2px solid rgba(255,255,255,0.15)', padding: '16px 24px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', width: '120px' }}>
            <div style={{ height: '24px', display: 'flex', justifyContent: 'flex-start', width: '100%', paddingLeft: '10px' }}>
              {carryCrasherMode === 'save' ? (
                <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '16px', animation: 'bounce 1s infinite' }}>¹</span>
              ) : (
                <span style={{ color: 'transparent' }}>_</span>
              )}
            </div>
            <div style={{ width: '100%', textAlign: 'right', letterSpacing: '4px' }}>2 8</div>
            <div style={{ width: '100%', textAlign: 'right', letterSpacing: '4px', borderBottom: '2px solid #ede8e3', paddingBottom: '4px' }}>+ 1 4</div>
            <div style={{ width: '100%', textAlign: 'right', letterSpacing: '4px', fontWeight: 'bold', color: carryCrasherMode === 'save' ? '#2ecc71' : '#ff6b6b' }}>
              {carryCrasherMode === 'save' ? '4 2' : '3 2'}
            </div>
          </div>

          <p className="monster-demo-text" style={{ margin: '0', minHeight: '36px' }}>
            {carryCrasherMode === 'save'
              ? '🎉 The 1 is carried to the tens column! (Answer: 42)'
              : '💥 Oops: The carry was dropped! (Answer: 32)'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

import MonsterAvatar from './MonsterAvatar.jsx';
import { getMonsterHealedState } from './monsterStore.js';
import GuidedSolver from './GuidedSolver.jsx';

export function MonsterDetail({ monsterId, breachCount, lastAttempt, cureHistory, onBack, onStartCure, onOpenGuidedSolver, onCloseSolver, initialGuidedSolver }) {
  const [showGuidedSolver, setShowGuidedSolver] = useState(initialGuidedSolver || false);

  function handleCloseSolver() {
    setShowGuidedSolver(false);
    // Clear the App-level deep-link flag so the next Hall open lands on the grid,
    // not auto-reopened into this solver. The cure-fail escalation path is a
    // directive (not state) and will set the flag again when the user takes it.
    onCloseSolver && onCloseSolver();
  }

  // Inject styles once
  if (typeof document !== 'undefined') injectDetailStyles();

  const entry = getMonsterExplanation(monsterId);
  const colors = MONSTER_COLORS[monsterId] || MONSTER_COLORS['bracketeer'];

  if (!entry) {
    return (
      <div className="monster-detail">
        <p>Unknown monster.</p>
        <button className="monster-detail-btn monster-detail-btn-secondary" onClick={onBack}>Back to Hall</button>
      </div>
    );
  }

  const curesTotal = Array.isArray(cureHistory) ? cureHistory.length : 0;
  const curesSuccessful = Array.isArray(cureHistory) ? cureHistory.filter(c => c && c.success).length : 0;
  const healedState = getMonsterHealedState(monsterId);

  function handleStart() {
    onStartCure && onStartCure(monsterId);
  }

  if (showGuidedSolver) {
    return (
      <div className="monster-detail" data-monster-id={monsterId}>
        <GuidedSolver
          inline={true}
          monsterId={monsterId}
          onClose={handleCloseSolver}
          onStartCure={onStartCure}
        />
      </div>
    );
  }

  return (
    <div className="monster-detail" data-monster-id={monsterId}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', margin: '0 0 -8px 0' }}>
        <button className="monster-hall-close" onClick={onBack} aria-label="Back to Hall">←</button>
      </div>

      <div className={`monster-detail-hero ${healedState}`} style={{ '--monster-primary': colors.primary, '--monster-secondary': colors.secondary }}>
        <MonsterAvatar monsterId={monsterId} size={80} state={healedState} />
        <div>
          <h2 className="monster-detail-name" style={{ fontFamily: 'var(--font-display)' }}>{entry.name}</h2>
          <p className="monster-detail-tagline">{entry.tagline}</p>
        </div>
      </div>

      <div className="monster-detail-stats">
        <div className="monster-detail-stat">
          <span className="monster-detail-stat-value" style={healedState === 'healed' ? { color: '#ffd700' } : healedState === 'warning' ? { color: 'var(--clr-accent)' } : {}}>{breachCount}</span>
          <span className="monster-detail-stat-label">Breaches</span>
        </div>
        <div className="monster-detail-stat">
          <span className="monster-detail-stat-value" style={healedState === 'healed' ? { color: '#ffd700' } : healedState === 'warning' ? { color: 'var(--clr-accent)' } : {}}>{formatRelativeTime(lastAttempt)}</span>
          <span className="monster-detail-stat-label">Last Seen</span>
        </div>
        <div className="monster-detail-stat">
          <span className="monster-detail-stat-value" style={healedState === 'healed' ? { color: '#ffd700' } : healedState === 'warning' ? { color: 'var(--clr-accent)' } : {}}>{curesSuccessful}/{curesTotal}</span>
          <span className="monster-detail-stat-label">Cures</span>
        </div>
      </div>


      <div className="monster-detail-section">
        <h3 style={{ fontFamily: 'var(--font-display)' }}>What it does</h3>
        <p className="monster-detail-description">{entry.description}</p>
        <InteractiveMonsterDemo monsterId={monsterId} colors={colors} />
      </div>

      <div className="monster-detail-actions">
        <button
          className="monster-detail-btn monster-detail-btn-secondary"
          onClick={() => {
            if (onOpenGuidedSolver) onOpenGuidedSolver(monsterId);
            setShowGuidedSolver(true);
          }}
        >
          Guided Solver
        </button>
        <button
          className="monster-detail-btn monster-detail-btn-primary"
          onClick={handleStart}
        >
          Start Cure →
        </button>
      </div>
    </div>
  );
}

export default MonsterDetail;
/**
 * GuidedSolver.jsx
 *
 * Interactive step-by-step solver overlay for misconception monsters.
 * Based on guided_solver_demo.html.
 *
 * Supports:
 *  - Bracketeer (distributive multiplication)
 *  - Sign Swapper (number line frog hopping)
 *  - Decimal Drifter (decimal place counting & left slide)
 *  - Carry Crasher (vertical column addition with carry digit)
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const MONSTER_SOLVER_DATA = {
  'bracketeer': {
    title: 'The Bracketeer Solver',
    tagline: 'Defeat the Bracketeer by sharing the multiplier with both terms!',
    btnTheme: '#38bdf8',
    steps: [
      { text: 'Multiply outside 3 × first term (x)', desc: 'Multiply the outside factor 3 with the first term x inside brackets to get 3x.' },
      { text: 'Multiply outside 3 × second term (5)', desc: 'Next, multiply the outside factor 3 with 5 to get 15. The final expanded form is 3x + 15!' }
    ]
  },
  'sign-swapper': {
    title: 'The Sign Swapper Solver',
    tagline: 'Avoid sign swaps by tracking your starting point and hops!',
    btnTheme: '#ef5b5b',
    steps: [
      { text: 'Find starting position (-3) on the line', desc: 'Locate the initial value -3 on the number line.' },
      { text: 'Hop 5 units in the positive direction (right)', desc: 'Since we are adding +5, hop 5 places to the right to land on +2.' },
      { text: 'Double-Check Swapper Sign Lock', desc: 'Is the Swapper trying to flip your sign to negative? Keep it locked at +2!' }
    ]
  },
  'decimal-drifter': {
    title: 'The Decimal Drifter Solver',
    tagline: 'Secure the decimal dot by counting inputs!',
    btnTheme: '#ffd700',
    steps: [
      { text: 'Count total decimal places in the problem', desc: 'Count places in 0.5 (1 place) and 0.4 (1 place) to get 2 places total!' },
      { text: 'Multiply as whole numbers (5 × 4)', desc: 'Temporarily ignore decimal points: 5 × 4 = 20.' },
      { text: 'Slide decimal dot left by 2 positions', desc: 'Take 20 and slide the decimal point back left by 2 places to get 0.20 (or 0.2).' }
    ]
  },
  'carry-crasher': {
    title: 'The Carry Crasher Solver',
    tagline: 'Write down carry values on paper so they don\'t drop!',
    btnTheme: '#9b59b6',
    steps: [
      { text: 'Add the Ones column (8 + 4)', desc: 'Add the rightmost column: 8 + 4 = 12. Write down 2, and hold the 1 carry.' },
      { text: 'Write carry digit 1 above the Tens column', desc: 'Place a carry ¹ up top so it doesn\'t crash in your head.' },
      { text: 'Add the Tens column + carry digit', desc: 'Add 1 (carry) + 2 + 1 = 4 to finalize the sum as 42!' }
    ]
  }
};

function injectGuidedSolverStyles() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[data-guided-solver]')) return;

  const css = `
    .guided-solver-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 10020;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(6px);
      animation: solver-fadein 200ms ease-out;
    }
    @keyframes solver-fadein {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .guided-solver-card {
      background: var(--clr-card, #2c2622);
      color: var(--clr-text, #ede8e3);
      border: 1.5px solid var(--clr-border, rgba(255, 245, 230, 0.18));
      border-radius: 24px;
      width: min(680px, 100%);
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      padding: 28px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
    }
    .guided-solver-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1px solid var(--clr-border, rgba(255, 245, 230, 0.18));
      padding-bottom: 14px;
    }
    .guided-solver-title {
      font-family: var(--font-display, 'Source Serif 4', serif);
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: var(--clr-gold, #ffd700);
    }
    .guided-solver-tagline {
      font-size: 13px;
      color: var(--clr-text-soft, #a89e94);
      margin-top: 4px;
    }
    .guided-solver-close {
      background: transparent;
      border: 1px solid var(--clr-border, rgba(255, 245, 230, 0.18));
      color: inherit;
      font-size: 18px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .guided-solver-close:hover {
      background: var(--clr-hover-strong, rgba(255, 245, 230, 0.08));
    }
    .guided-math-canvas {
      background: rgba(0, 0, 0, 0.35);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 160px;
      position: relative;
    }
    .bracketeer-sum {
      font-size: 34px;
      font-family: var(--font-display, monospace);
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .term-highlight {
      transition: all 0.3s ease;
      padding: 0 6px;
      border-radius: 6px;
    }
    .term-highlight.highlighted {
      background: rgba(56, 189, 248, 0.2);
      border: 1px dashed #38bdf8;
      color: #38bdf8;
      transform: scale(1.08);
    }
    .num-line-container {
      width: 100%;
      position: relative;
      height: 70px;
      margin-top: 16px;
    }
    .num-line-track {
      position: absolute;
      left: 15px;
      right: 15px;
      top: 30px;
      height: 4px;
      background: rgba(255, 255, 255, 0.18);
      border-radius: 2px;
    }
    .num-line-nodes {
      position: absolute;
      left: 15px;
      right: 15px;
      top: 0;
      bottom: 0;
    }
    .num-node {
      position: absolute;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      top: 28px;
    }
    .node-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transition: background 0.3s, box-shadow 0.3s;
    }
    .node-dot.active {
      background: #ef5b5b;
      box-shadow: 0 0 10px #ef5b5b;
    }
    .node-label {
      font-size: 11px;
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
    }
    .frog-avatar {
      position: absolute;
      top: -12px;
      font-size: 28px;
      transform: translateX(-50%);
      transition: left 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 2;
    }
    .vertical-sum {
      border: 2px solid rgba(255, 255, 255, 0.15);
      padding: 16px 24px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.3);
      width: 120px;
      font-family: var(--font-display, monospace);
      font-size: 26px;
      line-height: 1.4;
    }
    .carry-row {
      height: 24px;
      font-size: 16px;
      color: transparent;
      transition: color 0.3s;
      padding-left: 10px;
    }
    .carry-row.active {
      color: #9b59b6;
      font-weight: bold;
    }
    .guided-solver-feedback {
      font-size: 14px;
      text-align: center;
      line-height: 1.5;
      color: var(--clr-text-soft, #a89e94);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--clr-border, rgba(255, 245, 230, 0.1));
    }
    .guided-steps-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .guided-step-btn {
      background: var(--clr-hover, rgba(255, 245, 230, 0.04));
      border: 1.5px solid var(--clr-border, rgba(255, 245, 230, 0.18));
      border-radius: 12px;
      color: var(--clr-text, #ede8e3);
      padding: 12px 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: inherit;
    }
    .guided-step-btn:hover:not(:disabled) {
      background: var(--clr-hover-strong, rgba(255, 245, 230, 0.08));
      border-color: var(--clr-border, rgba(255, 245, 230, 0.25));
    }
    .guided-step-btn.completed {
      border-color: var(--clr-correct, #5cb87a);
      background: rgba(92, 184, 122, 0.08);
      color: var(--clr-correct, #5cb87a);
    }
    .guided-step-btn.active {
      border-color: var(--btn-theme-clr, #38bdf8);
      background: rgba(56, 189, 248, 0.08);
    }
    .guided-step-badge {
      font-size: 11px;
      background: var(--clr-hover-strong, rgba(255, 245, 230, 0.15));
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .guided-step-btn.completed .guided-step-badge {
      background: var(--clr-correct, #5cb87a);
      color: #fff;
    }
    .guided-solver-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .guided-solver-btn {
      flex: 1;
      padding: 12px 18px;
      border-radius: 10px;
      border: none;
      font-weight: 700;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: filter 0.2s ease;
    }
    .guided-solver-btn-primary {
      background: var(--clr-accent, #e8864a);
      color: #fff;
    }
    .guided-solver-btn-secondary {
      background: var(--clr-surface, #362f2a);
      color: var(--clr-text, #ede8e3);
      border: 1px solid var(--clr-border, rgba(255, 245, 230, 0.18));
    }
    .guided-solver-btn:hover {
      filter: brightness(1.1);
    }
    .decimal-step-text {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid transparent;
      display: inline-block;
    }
    .decimal-step-text.active {
      transform: scale(1.05);
      background: rgba(255, 215, 0, 0.1);
      border: 1px dashed var(--clr-gold, #ffd700);
    }
    .decimal-step-text.completed {
      transform: scale(1);
      background: rgba(92, 184, 122, 0.08);
      border: 1px solid var(--clr-correct, #5cb87a);
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-guided-solver', '');
  style.textContent = css;
  document.head.appendChild(style);
}

export function GuidedSolver({ monsterId = 'bracketeer', onClose, onStartCure, inline }) {
  if (typeof document !== 'undefined') injectGuidedSolverStyles();

  const data = MONSTER_SOLVER_DATA[monsterId] || MONSTER_SOLVER_DATA['bracketeer'];
  const [currentStep, setCurrentStep] = useState(1);
  const [frogVal, setFrogVal] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset solver when monsterId changes
  useEffect(() => {
    setCurrentStep(1);
    setFrogVal(0);
    setIsAnimating(false);
  }, [monsterId]);

  function handleStepClick(stepNum) {
    if (stepNum > currentStep || isAnimating) return;

    if (monsterId === 'sign-swapper') {
      if (stepNum === 1) {
        setIsAnimating(true);
        let curr = frogVal;
        const target = -3;
        const timer = setInterval(() => {
          if (curr === target) {
            clearInterval(timer);
            setIsAnimating(false);
            setCurrentStep(2);
          } else {
            curr = curr < target ? curr + 1 : curr - 1;
            setFrogVal(curr);
          }
        }, 200);
      } else if (stepNum === 2) {
        setIsAnimating(true);
        let curr = frogVal;
        const target = 2;
        const timer = setInterval(() => {
          if (curr === target) {
            clearInterval(timer);
            setIsAnimating(false);
            setCurrentStep(3);
          } else {
            curr = curr < target ? curr + 1 : curr - 1;
            setFrogVal(curr);
          }
        }, 200);
      } else if (stepNum === 3) {
        setCurrentStep(4);
      }
    } else {
      if (stepNum === currentStep) {
        setCurrentStep(stepNum + 1);
      }
    }
  }

  // Render canvas content per monster
  function renderCanvas() {
    if (monsterId === 'bracketeer') {
      const resText = currentStep === 1 ? '?' : currentStep === 2 ? '3x' : '3x + 15 ✨';
      const multClass = currentStep >= 2 ? 'highlighted' : '';
      const xClass = currentStep >= 2 ? 'highlighted' : '';
      const yClass = currentStep >= 3 ? 'highlighted' : '';

      return (
        <div className="bracketeer-sum">
          <span className={`term-highlight ${multClass}`}>3</span>
          <span>(</span>
          <span className={`term-highlight ${xClass}`}>x</span>
          <span>+</span>
          <span className={`term-highlight ${yClass}`}>5</span>
          <span>)</span>
          <span style={{ margin: '0 14px' }}>➔</span>
          <span style={{ color: 'var(--clr-gold, #ffd700)', fontWeight: 800 }}>{resText}</span>
        </div>
      );
    } else if (monsterId === 'sign-swapper') {
      const startVal = currentStep > 3 ? -2 : frogVal;
      const frogIcon = currentStep > 3 ? '😵' : '🐸';
      const nodes = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
      const idx = nodes.indexOf(startVal);
      const exprText = currentStep > 3 ? '-3 + 5 = -2 😵 (Sign Swapped!)' : '-3 + 5 = ?';

      return (
        <>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '10px' }}>
            {exprText}
          </div>
          <div className="num-line-container">
            <div className="num-line-track" />
            <div className="num-line-nodes">
              {nodes.map((n, i) => {
                let active = false;
                if (currentStep === 2 && n === -3) active = true;
                if (currentStep === 3 && (n === -3 || n === 2)) active = true;
                if (currentStep > 3 && n === -2) active = true;
                return (
                  <div key={n} className="num-node" style={{ left: `${(i / 10) * 100}%` }}>
                    <div className={`node-dot ${active ? 'active' : ''}`} />
                    <div className="node-label">{n}</div>
                  </div>
                );
              })}
            </div>
            {idx !== -1 && (
              <div className="frog-avatar" style={{ left: `${(idx / 10) * 100}%` }}>
                {frogIcon}
              </div>
            )}
          </div>
        </>
      );
    } else if (monsterId === 'decimal-drifter') {
      const placesText = currentStep === 1 ? 'Places: ?' : 'Places: 2 (0.5=1, 0.4=1)';
      const multText = currentStep <= 2 ? '5 × 4 = ?' : '5 × 4 = 20';
      const slideText = currentStep <= 3 ? 'Final: ?' : 'Final: 0.2 ✨';

      // Define CSS classes dynamically for transitions
      const placesClass = `decimal-step-text ${currentStep === 1 ? 'active' : 'completed'}`;
      const multClass = `decimal-step-text ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`;
      const slideClass = `decimal-step-text ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`;

      // Dynamic color styling for components
      const placesColor = currentStep === 1 ? 'var(--clr-accent)' : 'var(--clr-correct)';
      const multColor = currentStep === 2 ? '#38bdf8' : currentStep > 2 ? 'var(--clr-correct)' : 'inherit';
      const slideColor = currentStep === 3 ? 'var(--clr-accent)' : currentStep > 3 ? 'var(--clr-correct)' : 'inherit';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>0.5 × 0.4</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '14px', color: 'var(--clr-text-soft)' }}>
            <span className={placesClass} style={{ color: placesColor }}>{placesText}</span>
            <span>·</span>
            <span className={multClass} style={{ color: multColor }}>{multText}</span>
            <span>·</span>
            <span className={slideClass} style={{ color: slideColor }}>{slideText}</span>
          </div>
        </div>
      );
    } else if (monsterId === 'carry-crasher') {
      const carryActive = currentStep >= 2;
      const tensResult = currentStep >= 3 ? '4' : ' ';
      const onesResult = currentStep >= 1 ? '2' : ' ';

      return (
        <div className="vertical-sum">
          <div className={`carry-row ${carryActive ? 'active' : ''}`}>
            {carryActive ? '¹' : ''}
          </div>
          <div>  2 8</div>
          <div>+ 1 4</div>
          <div style={{ borderTop: '2px solid rgba(255, 255, 255, 0.4)', marginTop: '4px', paddingTop: '4px', color: 'var(--clr-gold)' }}>
            {tensResult}{onesResult}
          </div>
        </div>
      );
    }
    return null;
  }

  const cardContent = (
    <div className="guided-solver-card" style={inline ? { width: '100%', maxWidth: 'none', background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 } : undefined}>
      <div className="guided-solver-header">
        <div>
          <h2 className="guided-solver-title">💡 {data.title}</h2>
          <div className="guided-solver-tagline">{data.tagline}</div>
        </div>
        <button className="guided-solver-close" onClick={onClose} aria-label="Back to monster explanation" title="Back to Monster Explanation">
          ✕
        </button>
      </div>

      <div className="guided-math-canvas">
        {renderCanvas()}
      </div>

      <div className="guided-solver-feedback">
        {isAnimating
          ? '🐸 Frog is hopping place-by-place...'
          : data.steps[currentStep - 1]
            ? data.steps[currentStep - 1].desc
            : '🎉 Great job! You have completed the step-by-step solver guide!'}
      </div>

      <div className="guided-steps-row">
        {data.steps.map((s, idx) => {
          const stepNum = idx + 1;
          let btnClass = 'guided-step-btn';
          if (stepNum < currentStep) btnClass += ' completed';
          if (stepNum === currentStep) btnClass += ' active';

          return (
            <button
              key={stepNum}
              className={btnClass}
              onClick={() => handleStepClick(stepNum)}
              disabled={isAnimating}
              style={{ '--btn-theme-clr': data.btnTheme }}
            >
              <span>{stepNum}. {s.text}</span>
              <span className="guided-step-badge">
                {stepNum < currentStep ? '✓ Done' : stepNum === currentStep ? 'Active' : 'Locked'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="guided-solver-actions">
        <button className="guided-solver-btn guided-solver-btn-secondary" onClick={() => { setCurrentStep(1); setFrogVal(0); }}>
          Reset Steps
        </button>
        {onStartCure && (
          <button className="guided-solver-btn guided-solver-btn-primary" onClick={() => { onClose && onClose(); onStartCure(monsterId); }}>
            Ready to Start Cure →
          </button>
        )}
      </div>
    </div>
  );

  if (inline) return cardContent;

  const modalBody = (
    <div className="guided-solver-backdrop" role="dialog" aria-modal="true" aria-label="Guided Solver">
      {cardContent}
    </div>
  );

  return typeof document !== 'undefined' && document.body
    ? createPortal(modalBody, document.body)
    : modalBody;
}

export default GuidedSolver;

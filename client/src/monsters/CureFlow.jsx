/**
 * CureFlow.jsx
 *
 * A five-question recovery run for a monster/topic pair. It reuses recorded
 * mistakes first, then fetches same-topic questions to make a full set.
 * Four correct answers cure the monster; every attempt is retained in the
 * local cure history.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { load, recordCure, getCureHistory } from './monsterStore.js';
import { getMonsterName } from './monsterExplanations.js';
import MonsterAvatar from './MonsterAvatar.jsx';

const REQUIRED_CORRECT = 4;
const QUESTION_COUNT = 5;
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function normalise(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[−]/g, '-')
    .replace(/[²]/g, '^2')
    .replace(/[¹]/g, '^1')
    .replace(/[⁰]/g, '^0');
}

function answersMatch(submitted, expected) {
  const user = normalise(submitted);
  const correct = normalise(expected);
  if (!user || !correct) return false;
  const userNumber = Number(user);
  const correctNumber = Number(correct);
  if (Number.isFinite(userNumber) && Number.isFinite(correctNumber)) {
    return Math.abs(userNumber - correctNumber) < 0.01;
  }
  return user.toLowerCase() === correct.toLowerCase();
}

function historyQuestions(monsterId, topic) {
  const state = load();
  return (state.log || [])
    .filter(entry => entry.monsterId === monsterId && (!topic || entry.topic === topic))
    .filter(entry => entry.question && entry.correctAnswer != null && entry.correctAnswer !== '')
    .slice(-QUESTION_COUNT)
    .reverse()
    .map((entry, index) => ({
      id: `history-${entry.timestamp}-${index}`,
      prompt: entry.question,
      correctAnswer: entry.correctAnswer,
    }));
}

const HARDCODED_FALLBACKS = {
  'bracketeer': [
    { prompt: 'Expand: 2(x + 3)', correctAnswer: '2x + 6' },
    { prompt: 'Expand: 4(2x - 5)', correctAnswer: '8x - 20' },
    { prompt: 'Expand: 3(3y + 4)', correctAnswer: '9y + 12' },
    { prompt: 'Expand: 5(x - 2)', correctAnswer: '5x - 10' },
    { prompt: 'Expand: 6(2z + 1)', correctAnswer: '12z + 6' }
  ],
  'sign-swapper': [
    { prompt: 'Calculate: -4 * -3', correctAnswer: '12' },
    { prompt: 'Expand: -(x - 5)', correctAnswer: '-x + 5' },
    { prompt: 'Calculate: -7 * -2', correctAnswer: '14' },
    { prompt: 'Expand: -3(x - 4)', correctAnswer: '-3x + 12' },
    { prompt: 'Expand: -(2x + 1)', correctAnswer: '-2x - 1' }
  ],
  'decimal-drifter': [
    { prompt: 'Calculate: 0.3 * 0.4', correctAnswer: '0.12' },
    { prompt: 'Calculate: 0.2 * 0.5', correctAnswer: '0.1' },
    { prompt: 'Calculate: 0.06 * 10', correctAnswer: '0.6' },
    { prompt: 'Calculate: 0.8 / 0.2', correctAnswer: '4' },
    { prompt: 'Calculate: 0.7 * 0.03', correctAnswer: '0.021' }
  ],
  'carry-crasher': [
    { prompt: 'Calculate: 37 + 15', correctAnswer: '52' },
    { prompt: 'Calculate: 48 + 9', correctAnswer: '57' },
    { prompt: 'Calculate: 65 + 28', correctAnswer: '93' },
    { prompt: 'Calculate: 79 + 6', correctAnswer: '85' },
    { prompt: 'Calculate: 56 + 17', correctAnswer: '73' }
  ]
};

function getHardcodedFallbackQuestion(monsterId, index) {
  const list = HARDCODED_FALLBACKS[monsterId] || HARDCODED_FALLBACKS['bracketeer'];
  const q = list[index % list.length];
  return { id: `fallback-${monsterId}-${index}`, prompt: q.prompt, correctAnswer: q.correctAnswer };
}

function injectStyles() {
  if (typeof document === 'undefined' || document.querySelector('[data-monster-cure]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-monster-cure', '');
  style.textContent = `
    .monster-cure-backdrop {
      position: fixed; inset: 0; z-index: 10010; display: grid; place-items: center;
      padding: 16px; background: rgba(0,0,0,0.65);
    }
    .monster-cure-card {
      position: relative;
      width: min(560px,100%); border-radius: 24px; padding: 32px 24px;
      color: var(--clr-text, #ede8e3); background: var(--clr-card, #2c2622);
      box-shadow: var(--shadow-card, 0 4px 24px rgba(0,0,0,0.25));
      border: 1px solid var(--clr-border, rgba(255,245,230,0.18));
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .monster-cure-kicker {
      margin: 0 0 6px; color: var(--clr-accent, #e8864a);
      font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
    }
    .monster-cure-title {
      margin: 0 0 16px;
      font-family: var(--font-display, 'Source Serif 4', serif);
      font-size: 24px;
      font-weight: 700;
    }
    .monster-cure-progress { margin: 18px 0 8px; color: var(--clr-text-soft, #a89e94); font-size: 13px; width: 100%; text-align: left; }
    .monster-cure-track { height: 7px; overflow: hidden; border-radius: 999px; background: var(--clr-surface, #362f2a); width: 100%; }
    .monster-cure-track > span { display: block; height: 100%; background: var(--clr-accent, #e8864a); transition: width .2s ease; }
    .monster-cure-question {
      margin: 24px 0 14px; padding: 20px; border-radius: var(--radius-sm, 10px);
      text-align: center; font-size: 22px; font-weight: 700; width: 100%;
      background: var(--clr-surface, #362f2a); border: 1px solid var(--clr-border, rgba(255,245,230,0.18));
      font-family: var(--font-display, 'Source Serif 4', serif);
    }
    .monster-cure-input {
      box-sizing: border-box; width: 100%; padding: 13px 14px;
      border: 1.5px solid var(--clr-border, rgba(255,245,230,0.18));
      border-radius: var(--radius-sm, 10px); color: var(--clr-text, #ede8e3);
      background: var(--clr-input, #3e3631); font: inherit; outline: none;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .monster-cure-input:focus {
      border-color: var(--clr-accent, #e8864a);
      box-shadow: 0 0 0 3px var(--clr-accent-soft);
    }
    .monster-cure-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; width: 100%; }
    .monster-cure-actions button {
      padding: 12px 24px; border: 0; border-radius: var(--radius-sm, 10px);
      cursor: pointer; font: inherit; font-size: 14px; font-weight: 600; transition: transform var(--transition), box-shadow var(--transition), background var(--transition);
    }
    .monster-cure-primary { color: #fff; background: var(--clr-accent, #e8864a); box-shadow: var(--shadow-btn); }
    .monster-cure-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }
    .monster-cure-primary:active { transform: translateY(0); }
    .monster-cure-secondary { color: var(--clr-text-soft, #a89e94); background: var(--clr-surface, #362f2a); border: 1px solid var(--clr-border, rgba(255,245,230,0.18)) !important; }
    .monster-cure-secondary:hover { background: var(--clr-hover-strong, rgba(255,245,230,0.08)); }
    .monster-cure-feedback { min-height: 24px; margin: 12px 0 0; font-size: 14px; width: 100%; text-align: left; }
    .monster-cure-good { color: var(--clr-correct, #5cb87a); font-weight: 600; }
    .monster-cure-bad  { color: var(--clr-wrong,   #e05a4a); font-weight: 600; }
    .monster-cure-result { text-align: center; padding: 12px 0; width: 100%; }
    .monster-cure-result h3 { font-family: var(--font-display, 'Source Serif 4', serif); font-size: 24px; margin: 16px 0 8px; }
    
    /* CELEBRATION POOF */
    .cure-poof-cloud {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
      transform: scale(0);
      opacity: 0;
      pointer-events: none;
      z-index: 10;
      top: 30px;
    }
    .cure-poof-cloud.poof-animate {
      animation: cure-poof-flash 0.5s ease-out;
    }
    @keyframes cure-poof-flash {
      0% { transform: scale(0.3); opacity: 1; filter: brightness(2); }
      50% { transform: scale(1.3); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    
    /* SHIELD & HEALING PARTICLES */
    .cure-shield-ring {
      position: absolute;
      width: 90px;
      height: 90px;
      border: 3px solid #5cb87a;
      border-radius: 50%;
      top: 30px;
      transform: scale(0);
      opacity: 0;
      pointer-events: none;
      z-index: 9;
      box-shadow: 0 0 15px rgba(92, 184, 122, 0.6);
    }
    .cure-shield-ring.shield-animate {
      animation: shield-expand 1.1s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }
    @keyframes shield-expand {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
    }
    
    .cure-particle {
      position: fixed;
      pointer-events: none;
      font-size: 22px;
      z-index: 10008;
      animation: explode-particle 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }
    @keyframes explode-particle {
      to {
        opacity: 0;
        transform: translate(var(--tx), var(--ty)) rotate(270deg) scale(0.4);
      }
    }
  `;
  document.head.appendChild(style);
}

export function CureFlow({ monsterId, topic, onComplete, onCancel, onOpenGuidedSolver }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [poofActive, setPoofActive] = useState(false);
  const startedAt = useMemo(() => Date.now(), []);

  useEffect(() => {
    injectStyles();
    const prepared = historyQuestions(monsterId, topic);
    for (let i = prepared.length; i < QUESTION_COUNT; i += 1) {
      prepared.push(getHardcodedFallbackQuestion(monsterId, i));
    }
    while (prepared.length < QUESTION_COUNT && prepared.length > 0) {
      prepared.push({ ...prepared[0], id: `repeat-${prepared.length}` });
    }
    if (prepared.length < QUESTION_COUNT) {
      setError('Not enough questions are available for this cure yet.');
    } else {
      setQuestions(prepared.slice(0, QUESTION_COUNT));
    }
    setLoading(false);
  }, [monsterId, topic]);

  // Spark Celebration Trigger
  useEffect(() => {
    if (finished && correctCount >= REQUIRED_CORRECT) {
      setPoofActive(true);
      setTimeout(() => setPoofActive(false), 1100);

      // Trigger themed healing explosion
      const chars = ['❤️', '🧪', '✨', '🟢', '🟡', '🛡️'];
      const colors = ['#5cb87a', '#ffd700', '#ff6b6b', '#fff'];

      // Particle explosion from the center card
      for (let i = 0; i < 45; i++) {
        const p = document.createElement('div');
        p.className = 'cure-particle';
        p.innerText = chars[Math.floor(Math.random() * chars.length)];
        p.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 200;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        
        p.style.setProperty('--tx', `${tx}px`);
        p.style.setProperty('--ty', `${ty}px`);
        
        // Spawn around the screen center
        p.style.left = '50%';
        p.style.top = '30%';

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
      }
    }
  }, [finished, correctCount]);

  function submit() {
    if (!answer.trim() || feedback || !questions[index]) return;
    const isCorrect = answersMatch(answer, questions[index].correctAnswer);
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nextCorrectCount);
    setFeedback({ isCorrect, nextCorrectCount });
  }

  function advance() {
    if (!feedback) return;
    if (index + 1 < QUESTION_COUNT) {
      setIndex(current => current + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }
    const success = correctCount >= REQUIRED_CORRECT;
    recordCure(monsterId, { startedAt: Date.now(), success, correctCount });
    setFinished(true);
  }


  function closeResult() {
    onComplete && onComplete({ success: correctCount >= REQUIRED_CORRECT, correctCount });
  }

  const body = (
    <div className="monster-cure-backdrop" role="dialog" aria-modal="true" aria-label="Monster cure">
      <div className="monster-cure-card">
        <div className={`cure-poof-cloud ${poofActive ? 'poof-animate' : ''}`} />
        <div className={`cure-shield-ring ${poofActive ? 'shield-animate' : ''}`} />
        
        {/* Render Monster Avatar. Turns healed only on successful finished view */}
        <MonsterAvatar
          monsterId={monsterId}
          size={90}
          state={finished && correctCount >= REQUIRED_CORRECT ? 'healed' : 'breached'}
          style={{ marginBottom: '16px' }}
        />

        <p className="monster-cure-kicker">Cure run · {getMonsterName(monsterId)}</p>
        <h2 className="monster-cure-title">Practice the pattern, not the panic.</h2>
        {loading && <p>Preparing five questions…</p>}
        {!loading && error && <><p>{error}</p><div className="monster-cure-actions"><button className="monster-cure-secondary" onClick={onCancel}>Back to Hall</button></div></>}
        {!loading && !error && !finished && questions[index] && <>
          <div className="monster-cure-progress">Question {index + 1} of {QUESTION_COUNT} · {correctCount} correct</div>
          <div className="monster-cure-track"><span style={{ width: `${((index + 1) / QUESTION_COUNT) * 100}%` }} /></div>
          <div className="monster-cure-question">{questions[index].prompt}</div>
          <input className="monster-cure-input" autoFocus value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') feedback ? advance() : submit(); }} placeholder="Your answer" aria-label="Your answer" />
          {feedback && <p className={`monster-cure-feedback ${feedback.isCorrect ? 'monster-cure-good' : 'monster-cure-bad'}`}>{feedback.isCorrect ? 'Correct — keep that pattern.' : `Not quite. The answer was ${questions[index].correctAnswer}.`}</p>}
          <div className="monster-cure-actions">
            <button className="monster-cure-secondary" onClick={onCancel}>Cancel</button>
            <button className="monster-cure-primary" onClick={feedback ? advance : submit}>{feedback ? (index + 1 === QUESTION_COUNT ? 'See result' : 'Next question') : 'Check answer'}</button>
          </div>
        </>}
        {finished && (() => {
          const history = getCureHistory(monsterId);
          const isSuccess = correctCount >= REQUIRED_CORRECT;
          // Check if latest 2 attempts (including current recorded one) were failures
          const recentFailures = history.slice(-2).filter(h => h && !h.success).length;
          const isRepeatedFailure = !isSuccess && recentFailures >= 2;

          return (
            <div className="monster-cure-result">
              <h3>{isSuccess ? 'Monster cured!' : 'The monster held on—for now.'}</h3>
              <p>You got {correctCount} of {QUESTION_COUNT}; you need {REQUIRED_CORRECT} to cure it.</p>
              <div className="monster-cure-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                {!isSuccess && onOpenGuidedSolver && (
                  <button
                    className="monster-cure-secondary"
                    style={
                      isRepeatedFailure
                        ? {
                            background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(232,134,74,0.25))',
                            border: '2px solid #ffd700',
                            color: '#ffd700',
                            fontWeight: '700',
                            fontSize: '15px',
                            boxShadow: '0 0 20px rgba(255,215,0,0.4)',
                            padding: '14px 20px',
                            animation: 'monster-detail-pulse 2s infinite'
                          }
                        : {
                            background: 'rgba(255, 215, 0, 0.12)',
                            border: '1px solid #ffd700',
                            color: '#ffd700'
                          }
                    }
                    onClick={() => {
                      onCancel && onCancel();
                      onOpenGuidedSolver(monsterId);
                    }}
                  >
                    {isRepeatedFailure ? 'Want to walk through it together?' : '💡 Walk through it together?'}
                  </button>
                )}
                <button className="monster-cure-primary" onClick={closeResult}>Return to Hall</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
  return typeof document !== 'undefined' && document.body ? createPortal(body, document.body) : body;
}

export default CureFlow;

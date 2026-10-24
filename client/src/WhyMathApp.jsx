/**
 * WhyMathApp.jsx - the app-level "Why Mathematics?" story, for children.
 *
 * Telling a child "maths is important" persuades nobody. So this never
 * claims anything. It shows four surprises, and each one runs:
 *
 *   Guess    - a question with three answers. The child commits first.
 *   Find out - a slider and a live picture. Reaching the right spot
 *              reveals the answer (or "Show me" jumps straight there).
 *   Why      - two short sentences on what just happened.
 *
 * Guessing first matters: a result only surprises you if you predicted
 * something else. The finish screen counts the right guesses and recaps
 * what they discovered.
 *
 * Fresh on every open: four beats are drawn from a pool of twelve, and the
 * answer choices are shuffled, so the right answer is not always first.
 * Content lives in lib/whyMathBeats.jsx; visuals reuse lib/whyVisuals.jsx,
 * the same kit as the topic demos.
 */

import { useState } from 'react';
import { BEATS, HOOKS, closeLine } from './lib/whyMathBeats.jsx';
import './WhyMathApp.css';

/* -- helpers --------------------------------------------------------- */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const BEATS_PER_STORY = 4;

function buildStory() {
  return {
    hook: pick(HOOKS),
    beats: shuffle(BEATS).slice(0, BEATS_PER_STORY).map((b) => ({
      ...b,
      start: b.initial(),
      options: shuffle(b.guess.options),
    })),
  };
}

const reachedAim = (beat, v) => (beat.aim >= beat.start ? v >= beat.aim : v <= beat.aim);

/* -- little pieces --------------------------------------------------- */

function Tenali({ children, mood }) {
  return (
    <div className={'wm-tenali' + (mood ? ` is-${mood}` : '')}>
      <img src="/tenali.png" alt="" className="wm-tenali-img" />
      <p className="wm-bubble" aria-live="polite">{children}</p>
    </div>
  );
}

/** A short burst of emoji confetti for a right guess. The scatter comes
 *  from the index, not Math.random, so rendering stays pure. */
const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  icon: ['🎉', '⭐', '✨', '🌟'][i % 4],
  angle: (360 / 14) * i + ((i * 37) % 20),
  dist: 70 + ((i * 53) % 60),
}));
function Confetti() {
  const bits = CONFETTI;
  return (
    <span className="wm-confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} style={{ '--a': `${b.angle}deg`, '--d': `${b.dist}px`, '--i': i }}>{b.icon}</span>
      ))}
    </span>
  );
}

/* -- one surprise ---------------------------------------------------- */

function Surprise({ beat, state, onChange }) {
  const { choice, value, revealed } = state;
  const v = value ?? beat.start;
  const right = choice === beat.guess.answer;

  const setValue = (next) => {
    const nowRevealed = revealed || reachedAim(beat, next);
    onChange({ ...state, value: next, touched: true, revealed: nowRevealed });
  };

  return (
    <div className="wm-surprise">
      <div className="wm-question">
        <span className="wm-question-emoji" aria-hidden="true">{beat.emoji}</span>
        <h2 className="wm-question-text">{beat.question}</h2>
      </div>

      <div className="wm-choices" role="group" aria-label="Your guess">
        {beat.options.map((opt, i) => {
          const picked = choice === opt;
          const isAnswer = revealed && opt === beat.guess.answer;
          return (
            <button
              key={opt}
              type="button"
              className={'wm-choice' + (picked ? ' is-picked' : '') + (isAnswer ? ' is-answer' : '') + (revealed && picked && !isAnswer ? ' is-wrong' : '')}
              style={{ '--i': i }}
              aria-pressed={picked}
              disabled={revealed}
              onClick={() => onChange({ ...state, choice: opt })}
            >
              <span className="wm-choice-letter" aria-hidden="true">{'ABC'[i]}</span>
              {opt}
              {isAnswer && <span className="wm-choice-tick" aria-hidden="true"> ✓</span>}
            </button>
          );
        })}
      </div>

      {choice && (
        <div className={'wm-explore' + (state.touched ? '' : ' is-inviting')}>
          {beat.visual(v)}
          <label className="wm-slider-label">
            {beat.label}: <strong key={v} className="wm-slider-value">{v}{beat.suffix || ''}</strong>
          </label>
          <span className={'wm-drag-hint' + (state.touched ? ' is-done' : '')} aria-hidden="true">👆 Drag me!</span>
          <input
            className="why-demo-slider wm-slider"
            type="range"
            min={beat.min}
            max={beat.max}
            step={beat.step || 1}
            value={v}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label={beat.label}
          />
          <p key={beat.read(v).big} className="wm-live">{beat.read(v).big}</p>
          {!revealed && (
            <button type="button" className="wm-show-me" onClick={() => setValue(beat.aim)}>
              I'm stuck, show me
            </button>
          )}
        </div>
      )}

      {revealed && (
        <div className={'wm-reveal' + (right ? ' is-right' : ' is-surprised')} role="status">
          {right && <Confetti />}
          <p className="wm-reveal-badge">{right ? '🎉 You got it!' : '😮 Surprise!'}</p>
          <p className="wm-reveal-head">{beat.reveal}</p>
          <p className="wm-reveal-why"><strong>Why? </strong>{beat.why}</p>
        </div>
      )}
    </div>
  );
}

/* -- the story ------------------------------------------------------- */

export default function WhyMathApp({ onBack, onNavigate }) {
  const [story, setStory] = useState(buildStory);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState({}); // beat key -> { choice, value, touched, revealed }

  const total = story.beats.length + 2;
  const isIntro = i === 0;
  const isFinish = i === total - 1;
  const beat = !isIntro && !isFinish ? story.beats[i - 1] : null;
  const state = beat ? answers[beat.key] || {} : null;

  const goTo = (n) => { setDir(n >= i ? 1 : -1); setI(n); };
  const go = (mode) => (typeof onNavigate === 'function' ? onNavigate(mode) : onBack());
  const right = story.beats.filter((b) => answers[b.key]?.choice === b.guess.answer).length;

  const restart = () => {
    setStory(buildStory());
    setAnswers({});
    setDir(1);
    setI(1);
  };

  let tenaliLine = story.hook;
  let mood = null;
  if (beat) {
    if (!state.choice) tenaliLine = 'What do you think? Pick a guess!';
    else if (!state.revealed) tenaliLine = 'Now drag the slider to find out!';
    else if (state.choice === beat.guess.answer) { tenaliLine = 'Brilliant guess!'; mood = 'happy'; }
    else { tenaliLine = 'Did that surprise you? It surprises most grown-ups too!'; mood = 'wow'; }
  } else if (isFinish) {
    tenaliLine = closeLine(right, story.beats.length);
    mood = 'happy';
  }

  return (
    <div className="why-math-overlay">
      <div className="why-math-card">
        <div className="wm-top">
          <div className="wm-progress" aria-label={`Step ${i + 1} of ${total}`}>
            {Array.from({ length: total }).map((_, n) => {
              const b = n > 0 && n < total - 1 ? story.beats[n - 1] : null;
              const done = b && answers[b.key]?.revealed;
              return (
                <button
                  key={n}
                  type="button"
                  className={'wm-dot' + (n === i ? ' is-current' : '') + (n < i || done ? ' is-done' : '')}
                  onClick={() => goTo(n)}
                  aria-label={n === 0 ? 'Start' : n === total - 1 ? 'Finish' : `Surprise ${n}`}
                >
                  {b ? b.emoji : n === 0 ? '👋' : '🏁'}
                </button>
              );
            })}
          </div>
          <button type="button" className="wm-close" onClick={onBack} aria-label="Close">✕</button>
        </div>

        <div key={i} className={'wm-stage ' + (dir > 0 ? 'is-forward' : 'is-back')}>
          <Tenali mood={mood}>{tenaliLine}</Tenali>

          {isIntro && (
            <div className="wm-intro">
              <h1 className="wm-title">Why learn maths?</h1>
              <ul className="wm-how">
                <li><span aria-hidden="true">🤔</span> Guess the answer</li>
                <li><span aria-hidden="true">👆</span> Drag to find out</li>
                <li><span aria-hidden="true">💡</span> See why it works</li>
              </ul>
              <div className="wm-preview" aria-hidden="true">
                {story.beats.map((b, n) => <span key={b.key} style={{ '--i': n }}>{b.emoji}</span>)}
              </div>
              <button type="button" className="wm-cta wm-cta-primary wm-start" onClick={() => goTo(1)}>
                Let's go! <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {beat && (
            <Surprise
              key={beat.key}
              beat={beat}
              state={state}
              onChange={(next) => setAnswers((a) => ({ ...a, [beat.key]: next }))}
            />
          )}

          {isFinish && (
            <div className="wm-finish">
              <p className="wm-score">
                You guessed <strong>{right}</strong> of {story.beats.length} right
              </p>
              <p className="wm-stars" aria-hidden="true">
                {story.beats.map((b, n) => <span key={b.key} style={{ '--i': n }}>{n < right ? '⭐' : '☆'}</span>)}
              </p>
              <ul className="wm-recap">
                {story.beats.map((b, n) => (
                  <li key={b.key} style={{ '--i': n }}>
                    <span className="wm-recap-emoji" aria-hidden="true">{b.emoji}</span>
                    <span>{answers[b.key]?.revealed ? b.reveal : <em>Not tried yet</em>}</span>
                  </li>
                ))}
              </ul>
              <div className="wm-finish-actions">
                <button type="button" className="wm-cta wm-cta-primary" onClick={() => go('gym')}>
                  <span aria-hidden="true">🏋️</span> Start today's Gym
                </button>
                <button type="button" className="wm-cta wm-cta-primary" onClick={() => go('topic_map')}>
                  <span aria-hidden="true">🔗</span> See how topics connect
                </button>
                <button type="button" className="wm-cta wm-cta-ghost" onClick={restart}>
                  <span aria-hidden="true">🔄</span> Four new surprises
                </button>
                <button type="button" className="wm-cta wm-cta-ghost" onClick={onBack}>
                  <span aria-hidden="true">🏠</span> Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {!isIntro && !isFinish && (
          <div className="wm-nav">
            <button type="button" className="wm-btn wm-btn-secondary" onClick={() => goTo(i - 1)}>
              <span aria-hidden="true">←</span> Back
            </button>
            <button
              type="button"
              className={'wm-btn' + (state.revealed ? ' is-ready' : '')}
              onClick={() => goTo(i + 1)}
            >
              {state.revealed ? (i === total - 2 ? 'See my score' : 'Next surprise') : 'Skip'} <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

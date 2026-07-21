/**
 * IDLI–VADA–SAMBHAR GAME
 *
 * An educational game that teaches Multiples, Common Multiples and the
 * Least Common Multiple (LCM) through a "fizz-buzz" style counting circle.
 *
 * Three children — User, Tenali and Birbal — sit in a circle and take turns
 * counting up from 1. On each turn the number is replaced by a food word when
 * it is a multiple of one of the chosen numbers:
 *   a -> Idli, b -> Vada, c -> Sambhar (optional third number).
 * Combined multiples produce compound phrases, always ordered Idli -> Vada -> Sambhar.
 *
 * The first number that is a multiple of ALL chosen numbers is their LCM — that
 * is where the round of discovery ends ("Idli Vada" for two numbers,
 * "Idli Vada Sambhar" for three).
 *
 * Pure React 19 + hooks, no backend. Rendered as a Tenali module via the
 * modeMap registry; receives an `onBack` prop to return to the home menu.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import './IdliVadaSambharApp.css';
import { useI18n } from './lib/i18n.jsx';

const PLAYERS = ['User', 'Tenali', 'Birbal'];
const PLAYER_EMOJI = { User: '🧒', Tenali: '👦', Birbal: '👳' };

const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
const lcm2 = (x, y) => (x / gcd(x, y)) * y;

export default function IdliVadaSambharApp({ onBack }) {
  const { t } = useI18n();
  // ---- Setup / inputs ----
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing'
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [inputC, setInputC] = useState('');
  const [setupError, setSetupError] = useState('');

  // ---- Game config (locked in once the game starts) ----
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [c, setC] = useState(null);
  const [mode, setMode] = useState(2); // 2 or 3 numbers
  const [targetLcm, setTargetLcm] = useState(null);

  // ---- Game runtime ----
  const [count, setCount] = useState(1); // never resets across rounds
  const [order, setOrder] = useState([0, 1, 2]); // player indices for the current round
  const [turnIdx, setTurnIdx] = useState(0); // position within the round (0..2)
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ correct: 0, mistakes: 0, retries: 0 });
  const [hasWon, setHasWon] = useState(false); // LCM already discovered once
  const [winInfo, setWinInfo] = useState(null); // { lcm } while the overlay is shown

  // ---- User's answer controls ----
  const [numberMode, setNumberMode] = useState(false);
  const [sel, setSel] = useState({ Idli: false, Vada: false, Sambhar: false });
  const [numberInput, setNumberInput] = useState('');
  const [attempt, setAttempt] = useState(0); // wrong tries used this turn (0 or 1)
  const [feedback, setFeedback] = useState(null); // { type, text }

  const autoTimer = useRef(null);
  const revealTimer = useRef(null);

  const currentPlayer = PLAYERS[order[turnIdx]];

  // ---- Answer helpers (based on the true value of a count) ----
  const truePhraseArr = useCallback((n) => {
    const arr = [];
    if (n % a === 0) arr.push('Idli');
    if (n % b === 0) arr.push('Vada');
    if (mode === 3 && n % c === 0) arr.push('Sambhar');
    return arr;
  }, [a, b, c, mode]);

  const trueDisplay = useCallback((n) => {
    const arr = truePhraseArr(n);
    return arr.length ? arr.join(' ') : String(n);
  }, [truePhraseArr]);

  // ---- Reset the per-turn answer controls ----
  const resetControls = useCallback(() => {
    setNumberMode(false);
    setSel({ Idli: false, Vada: false, Sambhar: false });
    setNumberInput('');
    setAttempt(0);
    setFeedback(null);
  }, []);

  // ---- Advance to the next count / turn / round ----
  const advance = useCallback(() => {
    setTurnIdx((prevIdx) => {
      const next = prevIdx + 1;
      if (next < PLAYERS.length) return next;
      // New round: pick a random starting player, then go round the circle.
      const start = Math.floor(Math.random() * PLAYERS.length);
      setOrder([start, (start + 1) % 3, (start + 2) % 3]);
      return 0;
    });
    setCount((n) => n + 1);
    resetControls();
  }, [resetControls]);

  // ---- Record a completed turn, then either celebrate the LCM or advance ----
  const finishTurn = useCallback((n, player, answerText, correct) => {
    setHistory((h) => [...h, { n, player, answer: answerText, correct }]);
    if (n === targetLcm && !hasWon) {
      setHasWon(true);
      setWinInfo({ lcm: n });
      return; // pause on the celebration overlay; advance happens on "Continue"
    }
    advance();
  }, [targetLcm, hasWon, advance]);

  // ---- Computer players (Tenali & Birbal) always answer correctly ----
  useEffect(() => {
    if (phase !== 'playing' || winInfo) return;
    if (currentPlayer === 'User') return;
    const delay = 600 + Math.random() * 300; // 600–900 ms
    autoTimer.current = setTimeout(() => {
      finishTurn(count, currentPlayer, trueDisplay(count), true);
    }, delay);
    return () => clearTimeout(autoTimer.current);
  }, [phase, winInfo, currentPlayer, count, trueDisplay, finishTurn]);

  useEffect(() => () => {
    clearTimeout(autoTimer.current);
    clearTimeout(revealTimer.current);
  }, []);

  // ---- Start the game after validating inputs ----
  const startGame = () => {
    const nums = [inputA, inputB];
    const hasThird = inputC.trim() !== '';
    if (hasThird) nums.push(inputC);

    const parsed = [];
    for (const raw of nums) {
      const t = raw.trim();
      if (!/^\d+$/.test(t)) { setSetupError('Enter whole numbers only.'); return; }
      const v = parseInt(t, 10);
      if (v < 2 || v > 100) { setSetupError('Numbers must be between 2 and 100.'); return; }
      parsed.push(v);
    }
    if (parsed.length < 2) { setSetupError('Enter at least two numbers.'); return; }
    if (new Set(parsed).size !== parsed.length) { setSetupError('Numbers must be different — no duplicates.'); return; }

    const [na, nb, nc] = parsed;
    const m = parsed.length === 3 ? 3 : 2;
    const lcm = m === 3 ? lcm2(lcm2(na, nb), nc) : lcm2(na, nb);

    setA(na); setB(nb); setC(m === 3 ? nc : null); setMode(m); setTargetLcm(lcm);

    // Fresh game state — random starting player for the first round too.
    const start = Math.floor(Math.random() * PLAYERS.length);
    setOrder([start, (start + 1) % 3, (start + 2) % 3]);
    setTurnIdx(0);
    setCount(1);
    setHistory([]);
    setStats({ correct: 0, mistakes: 0, retries: 0 });
    setHasWon(false);
    setWinInfo(null);
    setSetupError('');
    resetControls();
    setPhase('playing');
  };

  // ---- Toggle handlers for the answer controls ----
  const pickNumberMode = () => {
    setNumberMode(true);
    setSel({ Idli: false, Vada: false, Sambhar: false });
    setFeedback(null);
  };
  const togglePhrase = (word) => {
    setNumberMode(false);
    setNumberInput('');
    setFeedback(null);
    setSel((s) => ({ ...s, [word]: !s[word] }));
  };

  const buildUserAnswer = () => {
    if (numberMode) return { text: numberInput.trim(), isPhrase: false };
    const words = ['Idli', 'Vada', 'Sambhar'].filter((w) => sel[w]);
    return { text: words.join(' '), isPhrase: true, words };
  };

  const revealing = feedback?.type === 'reveal';

  const canSubmit = () => {
    if (revealing) return false; // answer is being revealed; wait for auto-advance
    if (numberMode) return numberInput.trim() !== '';
    return sel.Idli || sel.Vada || sel.Sambhar;
  };

  // ---- User submits an answer for the current count ----
  const handleSubmit = () => {
    if (!canSubmit() || winInfo) return;
    const n = count;
    const correctText = trueDisplay(n);
    const correctIsNumber = truePhraseArr(n).length === 0;

    const ua = buildUserAnswer();
    let right;
    if (ua.isPhrase) {
      right = !correctIsNumber && ua.text === correctText;
    } else {
      right = correctIsNumber && ua.text === String(n);
    }

    if (right) {
      setStats((s) => ({ ...s, correct: s.correct + 1 }));
      finishTurn(n, 'User', ua.text, true);
      return;
    }

    // Wrong answer.
    if (attempt === 0) {
      setStats((s) => ({ ...s, mistakes: s.mistakes + 1, retries: s.retries + 1 }));
      setAttempt(1);
      setFeedback({ type: 'retry', text: 'Not quite — have one more go!' });
    } else {
      // Second miss: reveal the answer, then continue.
      setStats((s) => ({ ...s, mistakes: s.mistakes + 1 }));
      setFeedback({ type: 'reveal', text: `The answer was “${correctText}”.` });
      revealTimer.current = setTimeout(() => {
        finishTurn(n, 'User', correctText, false);
      }, 1500);
    }
  };

  // ---- Overlay actions ----
  const handleContinue = () => { setWinInfo(null); advance(); };
  const handlePlayAgain = () => {
    clearTimeout(autoTimer.current);
    clearTimeout(revealTimer.current);
    setPhase('setup');
    setWinInfo(null);
  };

  const accuracy = (() => {
    const total = stats.correct + stats.mistakes;
    return total === 0 ? 100 : Math.round((stats.correct / total) * 100);
  })();

  // ================= RENDER =================
  if (phase === 'setup') {
    return (
      <div className="ivs-app">
        <button className="ivs-back" onClick={onBack}>{t('back_short', {}, '← Back')}</button>
        <h1 className="ivs-title">Idli · Vada · Sambhar</h1>
        <p className="ivs-tagline">Count in a circle and discover the LCM! 🍚 🍩 🍲</p>

        <div className="ivs-setup-card">
          <div className="ivs-setup-row">
            <label>
              <span className="ivs-word idli">Idli</span> = multiples of
              <input type="number" min="2" max="100" value={inputA}
                onChange={(e) => setInputA(e.target.value)} placeholder="a" />
            </label>
            <label>
              <span className="ivs-word vada">Vada</span> = multiples of
              <input type="number" min="2" max="100" value={inputB}
                onChange={(e) => setInputB(e.target.value)} placeholder="b" />
            </label>
            <label>
              <span className="ivs-word sambhar">Sambhar</span> = multiples of
              <input type="number" min="2" max="100" value={inputC}
                onChange={(e) => setInputC(e.target.value)} placeholder="c (optional)" />
            </label>
          </div>
          <p className="ivs-hint">Whole numbers 2–100, all different. Leave the third blank for a two-number game.</p>
          {setupError && <p className="ivs-error">{setupError}</p>}
          <button className="ivs-start" onClick={startGame}>Start Game</button>
        </div>
      </div>
    );
  }

  const correctIsNumber = truePhraseArr(count).length === 0;
  const recent = history.slice(-8).reverse();

  return (
    <div className="ivs-app">
      <button className="ivs-back" onClick={onBack}>{t('back_short', {}, '← Back')}</button>
      <h1 className="ivs-title">Idli · Vada · Sambhar</h1>

      <div className="ivs-legend">
        <span className="ivs-word idli">Idli = {a}</span>
        <span className="ivs-word vada">Vada = {b}</span>
        {mode === 3 && <span className="ivs-word sambhar">Sambhar = {c}</span>}
        <span className="ivs-goal">Goal: reach {mode === 3 ? 'Idli Vada Sambhar' : 'Idli Vada'} (LCM)</span>
      </div>

      {/* Circle of players */}
      <div className="ivs-circle">
        {order.map((pIdx) => {
          const name = PLAYERS[pIdx];
          const active = name === currentPlayer && !winInfo;
          return (
            <div key={name} className={`ivs-player ${active ? 'active' : ''}`}>
              <div className="ivs-avatar">{PLAYER_EMOJI[name]}</div>
              <div className="ivs-pname">{name}</div>
              {active && <div className="ivs-turn-badge">their turn</div>}
            </div>
          );
        })}
      </div>

      {/* Current turn */}
      <div className="ivs-current">
        <div className="ivs-count">Number <strong>{count}</strong></div>
        <div className="ivs-who">
          {currentPlayer === 'User' ? 'Your turn!' : `${currentPlayer} is thinking…`}
        </div>
      </div>

      {/* Answer controls — only for the User */}
      {currentPlayer === 'User' && !winInfo && (
        <div className="ivs-controls">
          <div className="ivs-btn-row">
            <button className={`ivs-choice ${numberMode ? 'on' : ''}`} onClick={pickNumberMode}>Number</button>
            <button className={`ivs-choice idli ${sel.Idli ? 'on' : ''}`} onClick={() => togglePhrase('Idli')}>Idli</button>
            <button className={`ivs-choice vada ${sel.Vada ? 'on' : ''}`} onClick={() => togglePhrase('Vada')}>Vada</button>
            {mode === 3 && (
              <button className={`ivs-choice sambhar ${sel.Sambhar ? 'on' : ''}`} onClick={() => togglePhrase('Sambhar')}>Sambhar</button>
            )}
          </div>

          {numberMode && (
            <input className="ivs-number-input" type="number" autoFocus value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type the number" />
          )}

          {!numberMode && (sel.Idli || sel.Vada || sel.Sambhar) && (
            <div className="ivs-preview">You’ll say: <strong>{buildUserAnswer().text}</strong></div>
          )}

          <button className="ivs-submit" disabled={!canSubmit()} onClick={handleSubmit}>Submit</button>

          {feedback && (
            <div className={`ivs-feedback ${feedback.type}`}>{feedback.text}</div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="ivs-stats">
        <span>✅ Correct: {stats.correct}</span>
        <span>❌ Mistakes: {stats.mistakes}</span>
        <span>🔁 Retries: {stats.retries}</span>
        <span>🎯 Accuracy: {accuracy}%</span>
      </div>

      {/* History */}
      <div className="ivs-history">
        <h3>Recent turns</h3>
        <ul>
          {recent.map((h, i) => (
            <li key={history.length - i} className={h.correct ? 'ok' : 'bad'}>
              <span className="ivs-h-num">{h.n}</span>
              <span className="ivs-h-arrow">→</span>
              <span className="ivs-h-ans">{h.answer}</span>
              <span className="ivs-h-player">({h.player})</span>
              <span className="ivs-h-mark">{h.correct ? '✓' : '✗'}</span>
            </li>
          ))}
          {recent.length === 0 && <li className="ivs-empty">No turns yet — go!</li>}
        </ul>
      </div>

      {/* Win overlay */}
      {winInfo && (
        <div className="ivs-overlay">
          <div className="ivs-overlay-card">
            <div className="ivs-confetti">🎉</div>
            <h2>Congratulations!</h2>
            <p>You reached <strong>{mode === 3 ? 'Idli Vada Sambhar' : 'Idli Vada'}</strong>.</p>
            <p className="ivs-lcm">LCM({[a, b, mode === 3 ? c : null].filter(Boolean).join(', ')}) = <strong>{winInfo.lcm}</strong></p>
            <div className="ivs-overlay-actions">
              <button className="ivs-continue" onClick={handleContinue}>Continue counting</button>
              <button className="ivs-again" onClick={handlePlayAgain}>Play Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

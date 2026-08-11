import { useState, useEffect, useRef, useMemo } from "react";

// ─── Utility helpers ────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateTable(n) {
  return Array.from({ length: 10 }, (_, i) => ({
    multiplier: i + 1,
    expression: `${n} × ${i + 1}`,
    answer: n * (i + 1),
  }));
}

function generateDistractors(correct, tableNum) {
  const tableAnswers = Array.from({ length: 10 }, (_, i) => tableNum * (i + 1));
  const distractorSet = new Set();
  tableAnswers.forEach((a) => { if (a !== correct) distractorSet.add(a); });
  [correct - 1, correct + 1, correct - tableNum, correct + tableNum, correct - 10, correct + 10].forEach((v) => {
    if (v > 0 && v !== correct) distractorSet.add(v);
  });
  const pool = shuffle([...distractorSet]).slice(0, 10);
  const picked = shuffle(pool).slice(0, 3);
  while (picked.length < 3) picked.push(correct + picked.length + 1);
  return shuffle([correct, ...picked]);
}

function maskDigit(answer) {
  const s = String(answer);
  if (s.length === 1) return { masked: "*", pos: 0 };
  const pos = Math.floor(Math.random() * s.length);
  return { masked: s.slice(0, pos) + "*" + s.slice(pos + 1), pos };
}

// ─── Cookie helpers (session-based adaptive tracking) ────────────────
function getAdaptiveData() {
  try {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("st_adaptive="));
    if (raw) return JSON.parse(decodeURIComponent(raw.split("=")[1]));
  } catch {}
  return {};
}
function setAdaptiveData(data) {
  document.cookie = `st_adaptive=${encodeURIComponent(JSON.stringify(data))}; path=/; SameSite=Lax`;
}
function recordAttempt(tableNum, multiplier, correct, timeTaken) {
  const d = getAdaptiveData();
  const key = `${tableNum}x${multiplier}`;
  if (!d[key]) d[key] = { wrong: 0, totalTime: 0, attempts: 0 };
  d[key].attempts++;
  d[key].totalTime += timeTaken;
  if (!correct) d[key].wrong++;
  setAdaptiveData(d);
}
function getWeakQuestions(tableNum) {
  const d = getAdaptiveData();
  const weak = [];
  for (let m = 1; m <= 10; m++) {
    const key = `${tableNum}x${m}`;
    const info = d[key];
    if (info && (info.wrong > 0 || info.totalTime / info.attempts > 5000)) {
      weak.push({ multiplier: m, score: info.wrong * 2 + info.totalTime / info.attempts / 1000 });
    }
  }
  weak.sort((a, b) => b.score - a.score);
  return weak.map((w) => w.multiplier);
}

// ─── High-contrast color tokens ─────────────────────────────────────
const C = {
  bg: "#f0f4ff",
  card: "#ffffff",
  cardHover: "#eef2ff",
  primary: "#4338ca",
  primaryLight: "#6366f1",
  primaryBg: "#e0e7ff",
  text: "#1e293b",
  textMedium: "#334155",
  textLight: "#64748b",
  success: "#15803d",
  successBg: "#dcfce7",
  successBorder: "#86efac",
  error: "#b91c1c",
  errorBg: "#fee2e2",
  errorBorder: "#fca5a5",
  accent: "#7c3aed",
  accentBg: "#ede9fe",
  gold: "#b45309",
  border: "#cbd5e1",
  tableHeader: "#312e81",
  tableHeaderBg: "#e0e7ff",
  tableCellBg: "#ffffff",
  tableCell: "#1e293b",
  inputBorder: "#6366f1",
  buttonText: "#ffffff",
};

// ─── Shared Components ──────────────────────────────────────────────
function TableDisplay({ tableNum, entries, horizontal = true, hideMultiplier = null }) {
  const filtered = hideMultiplier != null ? entries.filter((e) => e.multiplier !== hideMultiplier) : entries;
  if (horizontal) {
    return (
      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <table style={{ borderCollapse: "collapse", margin: "0 auto", fontSize: 15 }}>
          <thead>
            <tr>
              {filtered.map((e, i) => (
                <th key={i} style={{
                  padding: "10px 16px", fontWeight: 700, textAlign: "center",
                  color: C.tableHeader, background: C.tableHeaderBg,
                  border: `2px solid ${C.border}`, whiteSpace: "nowrap", fontSize: 14,
                }}>
                  {tableNum} × {e.multiplier}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {filtered.map((e, i) => (
                <td key={i} style={{
                  padding: "10px 16px", textAlign: "center", fontWeight: 800,
                  fontSize: 18, color: C.text, background: C.tableCellBg,
                  border: `2px solid ${C.border}`,
                }}>
                  {e.answer}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {filtered.map((e, i) => (
            <tr key={i}>
              <td style={{ padding: "6px 16px", textAlign: "right", fontWeight: 700, color: C.tableHeader, background: C.tableHeaderBg, border: `2px solid ${C.border}` }}>{e.expression}</td>
              <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: C.textMedium, background: C.tableCellBg, border: `2px solid ${C.border}` }}>=</td>
              <td style={{ padding: "6px 16px", textAlign: "left", fontWeight: 800, fontSize: 17, color: C.text, background: C.tableCellBg, border: `2px solid ${C.border}` }}>{e.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestionCard({ question, children, current, total }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 32, maxWidth: 540, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: C.textLight, fontWeight: 600 }}>Question {current} of {total}</span>
        <ProgressDots current={current} total={total} />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", color: C.text, marginBottom: 24, fontFamily: "monospace", letterSpacing: 1 }}>{question}</h2>
      {children}
    </div>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: Math.min(total, 20) }, (_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < current ? C.primaryLight : "#ddd" }} />
      ))}
    </div>
  );
}

function InputAnswer({ onSubmit, autoFocus = true }) {
  const [val, setVal] = useState("");
  const ref = useRef(null);
  useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  const handle = (e) => {
    e.preventDefault();
    if (val.trim()) { onSubmit(parseInt(val, 10)); setVal(""); }
  };
  return (
    <form onSubmit={handle} style={{ display: "flex", justifyContent: "center", gap: 12 }}>
      <input ref={ref} type="number" value={val} onChange={(e) => setVal(e.target.value)}
        style={{
          width: 130, textAlign: "center", fontSize: 24, fontWeight: 700,
          border: `3px solid ${C.inputBorder}`, borderRadius: 12, padding: "10px 16px",
          color: C.text, background: "#fff", outline: "none",
        }}
        placeholder="?" />
      <button type="submit" style={{
        background: C.primary, color: C.buttonText, fontWeight: 700, fontSize: 16,
        padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer",
      }}>
        Submit
      </button>
    </form>
  );
}

function Feedback({ correct, correctAnswer, onNext }) {
  return (
    <div style={{
      marginTop: 16, padding: 16, borderRadius: 12, textAlign: "center",
      background: correct ? C.successBg : C.errorBg,
      border: `2px solid ${correct ? C.successBorder : C.errorBorder}`,
    }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: correct ? C.success : C.error }}>
        {correct ? "Correct!" : `Not quite — the answer is ${correctAnswer}`}
      </p>
      <button onClick={onNext} style={{
        marginTop: 12, background: C.text, color: "#fff", fontWeight: 600,
        padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14,
      }}>
        Next →
      </button>
    </div>
  );
}

// ─── Level Completion Screen (between levels) ───────────────────────
function LevelCompleteScreen({ levelId, levelName, score, total, isLastLevel, onContinue, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 50 ? "👍" : "💪";
  const stars = pct >= 95 ? 5 : pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;

  return (
    <div style={{ background: C.card, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", padding: 40, maxWidth: 440, margin: "40px auto", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>
        Level {levelId} Complete!
      </h2>
      <p style={{ fontSize: 14, color: C.textLight, marginBottom: 16 }}>{levelName}</p>

      {/* Stars */}
      <div style={{ marginBottom: 16, fontSize: 24 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < stars ? "#f59e0b" : "#e2e8f0", marginRight: 2 }}>★</span>
        ))}
      </div>

      <div style={{ fontSize: 48, fontWeight: 900, color: C.primary, marginBottom: 4 }}>{pct}%</div>
      <p style={{ color: C.textMedium, fontSize: 16, marginBottom: 28, fontWeight: 600 }}>{score} / {total} correct</p>

      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button onClick={onRetry} style={{
          padding: "12px 24px", borderRadius: 12, border: `2px solid ${C.border}`,
          background: "#fff", color: C.textMedium, fontWeight: 700, cursor: "pointer", fontSize: 15,
        }}>
          Retry
        </button>
        <button onClick={onContinue} style={{
          padding: "12px 28px", borderRadius: 12, border: "none",
          background: C.primary, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
        }}>
          {isLastLevel ? "Finish" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

// ─── Final Completion Screen ────────────────────────────────────────
function FinalScreen({ tableNum, levelScores, onRestart }) {
  const totalCorrect = levelScores.reduce((s, l) => s + l.score, 0);
  const totalQuestions = levelScores.reduce((s, l) => s + l.total, 0);
  const overallPct = Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 24, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", paddingTop: 40 }}>
        <div style={{ background: C.card, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 4 }}>All 10 Levels Complete!</h1>
          <p style={{ color: C.textLight, fontSize: 16, marginBottom: 24 }}>Table of {tableNum}</p>

          <div style={{ fontSize: 56, fontWeight: 900, color: C.primary, marginBottom: 4 }}>{overallPct}%</div>
          <p style={{ color: C.textMedium, fontSize: 15, marginBottom: 24 }}>{totalCorrect} / {totalQuestions} total correct</p>

          {/* Per-level breakdown */}
          <div style={{ textAlign: "left", marginBottom: 24 }}>
            {levelScores.map((ls) => {
              const pct = Math.round((ls.score / ls.total) * 100);
              return (
                <div key={ls.levelId} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textMedium }}>
                    Level {ls.levelId}: {ls.levelName}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: pct >= 80 ? C.success : pct >= 50 ? C.gold : C.error,
                  }}>
                    {pct}% ({ls.score}/{ls.total})
                  </span>
                </div>
              );
            })}
          </div>

          <button onClick={onRestart} style={{
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: C.primary, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 16,
          }}>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Level Components (logic unchanged) ─────────────────────────────

// LEVEL 1 — Sequential Table Recall (horizontal, 5+5 split)
function Level1({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const firstHalf = table.slice(0, 5);
  const secondHalf = table.slice(5);
  const questions = useMemo(() => [
    ...firstHalf, ...firstHalf,
    ...secondHalf, ...secondHalf,
  ], [firstHalf, secondHalf]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const done = idx >= 20 && fb === null;
  const half = idx < 10 ? 0 : 1;
  const displayEntries = half === 0 ? firstHalf : secondHalf;
  const current = questions[Math.min(idx, questions.length - 1)];

  const handleSubmit = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 20); return null; }
  return (
    <div>
      <TableDisplay tableNum={tableNum} entries={displayEntries} horizontal />
      <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={20}>
        {fb ? <Feedback {...fb} onNext={next} /> : <InputAnswer onSubmit={handleSubmit} />}
      </QuestionCard>
    </div>
  );
}

// LEVEL 2 — Random Recall (horizontal, 5+5 split)
function Level2({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const firstHalf = table.slice(0, 5);
  const secondHalf = table.slice(5);
  const questions = useMemo(() => [
    ...shuffle([...firstHalf, ...firstHalf]),
    ...shuffle([...secondHalf, ...secondHalf]),
  ], [firstHalf, secondHalf]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const done = idx >= 20 && fb === null;
  const half = idx < 10 ? 0 : 1;
  const displayEntries = half === 0 ? firstHalf : secondHalf;
  const current = questions[Math.min(idx, questions.length - 1)];

  const handleSubmit = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 20); return null; }
  return (
    <div>
      <TableDisplay tableNum={tableNum} entries={displayEntries} horizontal />
      <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={20}>
        {fb ? <Feedback {...fb} onNext={next} /> : <InputAnswer onSubmit={handleSubmit} />}
      </QuestionCard>
    </div>
  );
}

// LEVEL 3 — Timed Answer Visibility
function Level3({ tableNum, onFinish }) {
  const questions = useMemo(() => shuffle(generateTable(tableNum)), [tableNum]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("show");
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const current = questions[Math.min(idx, questions.length - 1)];
  const done = idx >= 10 && fb === null;

  useEffect(() => {
    if (phase === "show") {
      const t = setTimeout(() => setPhase("fading"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "fading") {
      const t = setTimeout(() => setPhase("ask"), 800);
      return () => clearTimeout(t);
    }
  }, [phase, idx]);

  const handleSubmit = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setPhase("show"); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 10); return null; }

  return (
    <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={10}>
      {phase !== "ask" && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{
            fontSize: 48, fontWeight: 900, color: C.primary,
            transition: "opacity 0.7s", opacity: phase === "fading" ? 0 : 1,
          }}>
            {current.answer}
          </span>
        </div>
      )}
      {phase === "ask" && !fb && <InputAnswer onSubmit={handleSubmit} />}
      {fb && <Feedback {...fb} onNext={next} />}
    </QuestionCard>
  );
}

// LEVEL 4 — Partial Shuffled Table (5 visible)
function Level4({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const visible = useMemo(() => shuffle(table).slice(0, 5), [table]);
  const questions = useMemo(() => shuffle(visible), [visible]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const current = questions[Math.min(idx, questions.length - 1)];
  const done = idx >= 5 && fb === null;

  const handleSubmit = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 5); return null; }
  return (
    <div>
      <TableDisplay tableNum={tableNum} entries={visible} horizontal />
      <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={5}>
        {fb ? <Feedback {...fb} onNext={next} /> : <InputAnswer onSubmit={handleSubmit} />}
      </QuestionCard>
    </div>
  );
}

// LEVEL 5 — Missing Digit Identification
function Level5({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const questions = useMemo(() => shuffle(table).map((e) => {
    const { masked } = maskDigit(e.answer);
    return { ...e, masked };
  }), [table]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const current = questions[Math.min(idx, questions.length - 1)];
  const done = idx >= 10 && fb === null;

  const handleSubmit = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 10); return null; }
  return (
    <QuestionCard question={`${current.expression} = ${current.masked}`} current={idx + 1} total={10}>
      <p style={{ textAlign: "center", color: C.textLight, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>Type the complete answer</p>
      {fb ? <Feedback {...fb} onNext={next} /> : <InputAnswer onSubmit={handleSubmit} />}
    </QuestionCard>
  );
}

// LEVEL 6 — Multiple Choice Questions
function Level6({ tableNum, onFinish }) {
  const questions = useMemo(() => shuffle(generateTable(tableNum)), [tableNum]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const current = questions[Math.min(idx, questions.length - 1)];
  const options = useMemo(() => generateDistractors(current.answer, tableNum), [current, tableNum]);
  const done = idx >= 10 && fb === null;

  const handlePick = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 10); return null; }
  return (
    <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={10}>
      {!fb ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 340, margin: "0 auto" }}>
          {options.map((o, i) => (
            <button key={i} onClick={() => handlePick(o)} style={{
              padding: "14px 10px", fontSize: 20, fontWeight: 700, borderRadius: 12,
              border: `2px solid ${C.border}`, background: C.primaryBg, color: C.text,
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.color = C.text; }}
            >
              {o}
            </button>
          ))}
        </div>
      ) : <Feedback {...fb} onNext={next} />}
    </QuestionCard>
  );
}

// LEVEL 7 — Match the Following (3 pairs per round)
function Level7({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const rounds = useMemo(() => {
    const shuffled = shuffle(table);
    const r = [];
    for (let i = 0; i < shuffled.length; i += 3) {
      const group = shuffled.slice(i, i + 3);
      if (group.length === 3) r.push(group);
    }
    return r.length > 0 ? r : [shuffled.slice(0, 3)];
  }, [table]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentRound = rounds[Math.min(roundIdx, rounds.length - 1)];
  const shuffledAnswers = useMemo(() => shuffle(currentRound.map((e) => e.answer)), [currentRound, roundIdx]);

  const handleSelect = (qIdx) => { setSelected(qIdx); setWrong(false); };
  const handleAnswer = (ans) => {
    if (selected === null) return;
    setTotalAttempts((t) => t + 1);
    if (currentRound[selected].answer === ans) {
      setMatched((m) => [...m, selected]);
      setScore((s) => s + 1);
      setSelected(null);
    } else {
      setWrong(true);
    }
  };

  useEffect(() => {
    if (matched.length === 3 && !finished) {
      const t = setTimeout(() => {
        if (roundIdx + 1 >= rounds.length) {
          setFinished(true);
        } else {
          setRoundIdx((r) => r + 1);
          setMatched([]);
          setSelected(null);
          setWrong(false);
        }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [matched, finished, roundIdx, rounds.length]);

  useEffect(() => {
    if (finished) onFinish(score, totalAttempts);
  }, [finished]);

  if (finished) return null;

  return (
    <div style={{ background: C.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 32, maxWidth: 540, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: C.textLight, fontWeight: 600 }}>Round {roundIdx + 1} of {rounds.length}</span>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", color: C.text, marginBottom: 20 }}>Match each question to its answer</h2>
      {wrong && <p style={{ textAlign: "center", color: C.error, fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Not a match — try again!</p>}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {currentRound.map((e, i) => {
            const isMatched = matched.includes(i);
            const isSelected = selected === i;
            return (
              <button key={i} disabled={isMatched} onClick={() => handleSelect(i)} style={{
                padding: "12px 16px", fontSize: 17, fontWeight: 700, borderRadius: 12,
                border: `2px solid ${isMatched ? C.successBorder : isSelected ? C.primaryLight : C.border}`,
                background: isMatched ? C.successBg : isSelected ? C.primaryBg : "#fff",
                color: isMatched ? C.success : C.text,
                cursor: isMatched ? "default" : "pointer", transition: "all 0.15s",
                opacity: isMatched ? 0.6 : 1,
              }}>
                {e.expression}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", color: C.textLight, fontSize: 24, fontWeight: 700 }}>→</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {shuffledAnswers.map((ans, i) => {
            const isMatched = matched.some((mi) => currentRound[mi].answer === ans);
            return (
              <button key={i} disabled={isMatched || selected === null} onClick={() => handleAnswer(ans)} style={{
                padding: "12px 16px", fontSize: 17, fontWeight: 700, borderRadius: 12,
                border: `2px solid ${isMatched ? C.successBorder : C.border}`,
                background: isMatched ? C.successBg : selected !== null ? C.accentBg : "#fff",
                color: isMatched ? C.success : selected !== null ? C.accent : C.textLight,
                cursor: isMatched || selected === null ? "default" : "pointer",
                transition: "all 0.15s", opacity: isMatched ? 0.6 : 1,
              }}>
                {ans}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// LEVEL 8 — Adaptive MCQ
function Level8({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const questions = useMemo(() => {
    const weak = getWeakQuestions(tableNum);
    const weakEntries = weak.slice(0, 5).map((m) => table.find((e) => e.multiplier === m)).filter(Boolean);
    const others = shuffle(table.filter((e) => !weak.includes(e.multiplier)));
    const mixed = [...weakEntries];
    for (const o of others) { if (mixed.length >= 10) break; if (!mixed.find((m) => m.multiplier === o.multiplier)) mixed.push(o); }
    while (mixed.length < 10) mixed.push(table[mixed.length % 10]);
    return shuffle(mixed);
  }, [tableNum, table]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const current = questions[Math.min(idx, questions.length - 1)];

  const options = useMemo(() => {
    const tableAnswers = Array.from({ length: 10 }, (_, i) => tableNum * (i + 1)).filter((a) => a !== current.answer);
    const fromTable = shuffle(tableAnswers).slice(0, 2);
    const close = [current.answer + Math.ceil(Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1)].filter((v) => v > 0 && v !== current.answer && !fromTable.includes(v));
    const distractors = [...fromTable, ...close];
    while (distractors.length < 3) distractors.push(current.answer + distractors.length + 1);
    return shuffle([current.answer, ...distractors.slice(0, 3)]);
  }, [current, tableNum]);

  const done = idx >= 10 && fb === null;

  useEffect(() => { setStartTime(Date.now()); }, [idx]);

  const handlePick = (ans) => {
    const timeTaken = Date.now() - startTime;
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    recordAttempt(tableNum, current.multiplier, correct, timeTaken);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 10); return null; }

  return (
    <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={10}>
      <p style={{ textAlign: "center", fontSize: 12, color: C.textLight, marginBottom: 12, fontWeight: 600 }}>Adaptive — focuses on your weak spots</p>
      {!fb ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 340, margin: "0 auto" }}>
          {options.map((o, i) => (
            <button key={i} onClick={() => handlePick(o)} style={{
              padding: "14px 10px", fontSize: 20, fontWeight: 700, borderRadius: 12,
              border: `2px solid ${C.border}`, background: C.primaryBg, color: C.text,
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.color = C.text; }}
            >
              {o}
            </button>
          ))}
        </div>
      ) : <Feedback {...fb} onNext={next} />}
    </QuestionCard>
  );
}

// LEVEL 9 — Direct Input (No Assistance)
function Level9({ tableNum, onFinish }) {
  const questions = useMemo(() => shuffle(generateTable(tableNum)), [tableNum]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const current = questions[Math.min(idx, questions.length - 1)];
  const done = idx >= 10 && fb === null;

  const handleSubmit = (ans) => {
    const correct = ans === current.answer;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: current.answer });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 10); return null; }
  return (
    <QuestionCard question={`${current.expression} = ?`} current={idx + 1} total={10}>
      {fb ? <Feedback {...fb} onNext={next} /> : <InputAnswer onSubmit={handleSubmit} />}
    </QuestionCard>
  );
}

// LEVEL 10 — Fill in the Blank
function Level10({ tableNum, onFinish }) {
  const table = useMemo(() => generateTable(tableNum), [tableNum]);
  const questions = useMemo(() => shuffle(table).map((e) => {
    const type = Math.random() > 0.5 ? "multiplier" : "answer";
    return { ...e, blankType: type };
  }), [table]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const current = questions[Math.min(idx, questions.length - 1)];
  const done = idx >= 10 && fb === null;

  const questionText = current.blankType === "multiplier"
    ? `${tableNum} × ___ = ${current.answer}`
    : `${tableNum} × ${current.multiplier} = ___`;
  const correctAns = current.blankType === "multiplier" ? current.multiplier : current.answer;

  const handleSubmit = (ans) => {
    const correct = ans === correctAns;
    if (correct) setScore((s) => s + 1);
    setFb({ correct, correctAnswer: correctAns });
  };
  const next = () => { setFb(null); setIdx((i) => i + 1); };

  if (done) { onFinish(score, 10); return null; }
  return (
    <QuestionCard question={questionText} current={idx + 1} total={10}>
      {fb ? <Feedback {...fb} onNext={next} /> : <InputAnswer onSubmit={handleSubmit} />}
    </QuestionCard>
  );
}

// ─── Level metadata ─────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: "Sequential Recall", desc: "Answer questions in order with the table visible", component: Level1 },
  { id: 2, name: "Random Recall", desc: "Random questions with the table visible", component: Level2 },
  { id: 3, name: "Timed Visibility", desc: "See the answer briefly, then recall it", component: Level3 },
  { id: 4, name: "Partial Table", desc: "Only 5 entries visible, answer from those", component: Level4 },
  { id: 5, name: "Missing Digit", desc: "One digit is hidden — type the full answer", component: Level5 },
  { id: 6, name: "Multiple Choice", desc: "Pick the correct answer from 4 options", component: Level6 },
  { id: 7, name: "Match Pairs", desc: "Match 3 questions to their answers", component: Level7 },
  { id: 8, name: "Adaptive MCQ", desc: "Focuses on your weak spots", component: Level8 },
  { id: 9, name: "Direct Input", desc: "No help — type the answer from memory", component: Level9 },
  { id: 10, name: "Fill in the Blank", desc: "Find the missing multiplier or answer", component: Level10 },
];

// ─── Main App — Sequential Progression ──────────────────────────────
export default function SuperTables() {
  const [screen, setScreen] = useState("home");         // home | playing | levelComplete | final
  const [tableNum, setTableNum] = useState(12);
  const [tableInput, setTableInput] = useState("12");
  const [currentLevel, setCurrentLevel] = useState(1);  // 1–10
  const [levelScores, setLevelScores] = useState([]);    // {levelId, levelName, score, total}[]
  const [lastScore, setLastScore] = useState(null);      // {score, total} for current level complete screen

  // Key to force remount of level component on retry/advance
  const [levelKey, setLevelKey] = useState(0);

  const handleTableChange = () => {
    const n = parseInt(tableInput, 10);
    if (n >= 1 && n <= 99) setTableNum(n);
    else setTableInput(String(tableNum));
  };

  const handleStart = () => {
    setCurrentLevel(1);
    setLevelScores([]);
    setLastScore(null);
    setLevelKey((k) => k + 1);
    setScreen("playing");
  };

  const handleLevelFinish = (score, total) => {
    const lvl = LEVELS[currentLevel - 1];
    setLastScore({ score, total });
    setLevelScores((prev) => [...prev, { levelId: lvl.id, levelName: lvl.name, score, total }]);
    setScreen("levelComplete");
  };

  const handleContinue = () => {
    if (currentLevel >= 10) {
      setScreen("final");
    } else {
      setCurrentLevel((l) => l + 1);
      setLastScore(null);
      setLevelKey((k) => k + 1);
      setScreen("playing");
    }
  };

  const handleRetry = () => {
    // Remove last score entry
    setLevelScores((prev) => prev.slice(0, -1));
    setLastScore(null);
    setLevelKey((k) => k + 1);
    setScreen("playing");
  };

  const handleRestart = () => {
    setScreen("home");
    setCurrentLevel(1);
    setLevelScores([]);
    setLastScore(null);
  };

  const pageStyle = {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: 24,
  };

  // ── HOME: Table selector + Start ──
  if (screen === "home") {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 48 }}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{
              fontSize: 52, fontWeight: 900, marginBottom: 8,
              background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              SuperTables
            </h1>
            <p style={{ color: C.textMedium, fontSize: 17 }}>Master multiplication through 10 progressive levels</p>
          </div>

          {/* Table selector */}
          <div style={{
            background: C.card, borderRadius: 20, padding: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center", marginBottom: 24,
          }}>
            <p style={{ color: C.textMedium, fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Choose your multiplication table</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => { const n = Math.max(1, tableNum - 1); setTableNum(n); setTableInput(String(n)); }}
                style={{
                  width: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.border}`,
                  background: "#fff", color: C.text, fontSize: 24, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                −
              </button>
              <input
                type="number"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                onBlur={handleTableChange}
                onKeyDown={(e) => e.key === "Enter" && handleTableChange()}
                style={{
                  width: 100, textAlign: "center", fontSize: 48, fontWeight: 900,
                  background: "transparent", border: "none", color: C.primary, outline: "none",
                }}
              />
              <button
                onClick={() => { const n = Math.min(99, tableNum + 1); setTableNum(n); setTableInput(String(n)); }}
                style={{
                  width: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.border}`,
                  background: "#fff", color: C.text, fontSize: 24, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                +
              </button>
            </div>
            <p style={{ color: C.textMedium, fontSize: 15, marginTop: 12 }}>
              Table of <strong style={{ color: C.primary, fontSize: 18 }}>{tableNum}</strong>
            </p>
          </div>

          {/* Start button */}
          <div style={{ textAlign: "center" }}>
            <button onClick={handleStart} style={{
              padding: "16px 48px", borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              color: "#fff", fontWeight: 800, fontSize: 20, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.3)"; }}
            >
              Start Learning
            </button>
          </div>

          {/* Level overview */}
          <div style={{ marginTop: 32 }}>
            <p style={{ textAlign: "center", color: C.textLight, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>YOUR LEARNING PATH</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
              {LEVELS.map((l) => (
                <div key={l.id} style={{
                  display: "flex", alignItems: "center", gap: 6, background: C.card,
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textMedium, fontWeight: 600,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: C.primaryBg,
                    color: C.primary, fontWeight: 800, fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{l.id}</span>
                  {l.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  if (screen === "playing") {
    const lvl = LEVELS[currentLevel - 1];
    const LevelComponent = lvl.component;

    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button onClick={handleRestart} style={{
              background: C.card, border: `1px solid ${C.border}`, color: C.textMedium,
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
            }}>
              ← Home
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.textLight, fontWeight: 600 }}>Table of {tableNum}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>Level {currentLevel} of 10</div>
            </div>
            <div style={{ width: 72 }} />
          </div>

          {/* Level name */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{
              display: "inline-block", background: C.primaryBg, color: C.primary,
              padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
            }}>
              {lvl.name}
            </span>
            <p style={{ color: C.textLight, fontSize: 13, marginTop: 6 }}>{lvl.desc}</p>
          </div>

          {/* Level progress bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, justifyContent: "center" }}>
            {LEVELS.map((l) => (
              <div key={l.id} style={{
                height: 6, flex: 1, maxWidth: 40, borderRadius: 3,
                background: l.id < currentLevel ? C.success
                  : l.id === currentLevel ? C.primaryLight
                  : "#ddd",
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          {/* Level component */}
          <LevelComponent key={levelKey} tableNum={tableNum} onFinish={handleLevelFinish} />
        </div>
      </div>
    );
  }

  // ── LEVEL COMPLETE ──
  if (screen === "levelComplete" && lastScore) {
    const lvl = LEVELS[currentLevel - 1];
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Level progress bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, justifyContent: "center", paddingTop: 20 }}>
            {LEVELS.map((l) => (
              <div key={l.id} style={{
                height: 6, flex: 1, maxWidth: 40, borderRadius: 3,
                background: l.id <= currentLevel ? C.success : "#ddd",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textLight, fontWeight: 600, marginBottom: 8 }}>
            Table of {tableNum}
          </p>
          <LevelCompleteScreen
            levelId={lvl.id}
            levelName={lvl.name}
            score={lastScore.score}
            total={lastScore.total}
            isLastLevel={currentLevel >= 10}
            onContinue={handleContinue}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // ── FINAL COMPLETION ──
  if (screen === "final") {
    return <FinalScreen tableNum={tableNum} levelScores={levelScores} onRestart={handleRestart} />;
  }

  return null;
}

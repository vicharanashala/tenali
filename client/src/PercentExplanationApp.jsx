import React, { useEffect, useState } from 'react';
import './PercentExplanationApp.css';
import { playSound } from './audioContext';

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function gcd(a, b) {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function randInt(lo, hi) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function pickFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Replace any distractor that collides with `correct` or with a prior distractor.
 * Falls back to a pool of mathematically-plausible alternatives (×2, ×1.5, ÷2 …).
 */
function avoidCollisions(correct, rawDistractors) {
  const used = new Set([correct]);
  const fallbacks = [
    Math.round(correct * 2),
    Math.round(correct * 3),
    Math.round(correct * 1.5),
    Math.round(correct / 2),
    Math.round(correct * 4),
    correct + 10,
    correct - 10,
    correct + 5,
    correct - 5,
    correct + 1,
  ].filter(v => v > 0 && Number.isFinite(v) && Number.isInteger(v));

  let fbIdx = 0;
  return rawDistractors.map(d => {
    if (Number.isFinite(d) && d > 0 && !used.has(d)) {
      used.add(d);
      return d;
    }
    while (fbIdx < fallbacks.length && used.has(fallbacks[fbIdx])) fbIdx++;
    const rep = fbIdx < fallbacks.length ? fallbacks[fbIdx] : correct + 100 + fbIdx;
    used.add(rep);
    fbIdx++;
    return rep;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION TEMPLATES  (20 real-life scenarios)
//
// Per-template:
//   percents   – plausible percent values for this context  (no 75% restaurant tip!)
//   totalRange – [lo, hi] for the "whole" quantity          (realistic for the scenario)
//   generate(percent, total) → { question, correct, d1, d2, d3, fmt }
//     d1  = "just write the percent number" mistake
//     d2  = context-specific distractor (leftover, bill+tip, etc.)
//     d3  = 10%-benchmark mistake  (total / 10)
//     fmt = v → display string shown in option button
//
// Whole-number guarantee:  total = step × k,  step = 100 / gcd(percent, 100)
// → (percent × total) / 100 is always an exact integer.
// ─────────────────────────────────────────────────────────────────────────────

const TEMPLATES = [
  /* 0 ── DISCOUNT ─────────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 35, 40, 50],
    totalRange: [100, 2000],
    generate(percent, total) {
      const item = pickFrom(['shirt', 'bag', 'watch', 'book', 'jacket', 'shoes', 'cap', 'belt']);
      const correct = (percent * total) / 100;
      return {
        question: `A ${item} costs ₹${total}. There's a ${percent}% discount. How much is the discount in ₹?`,
        correct,
        d1: percent,            // "the answer is just the % number"
        d2: total - correct,    // final price after discount (wrong: confusing discount with final price)
        d3: total / 10,         // 10% benchmark
        fmt: v => `₹${v}`,
      };
    },
  },

  /* 1 ── EXAM MARKS ────────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75],
    totalRange: [20, 500],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `A test is out of ${total} marks. You need ${percent}% to pass. How many marks is that?`,
        correct,
        d1: percent,
        d2: total - correct,    // marks above pass threshold (wrong: "remaining" marks)
        d3: total / 10,
        fmt: v => `${v} marks`,
      };
    },
  },

  /* 2 ── SPORTS STAT ───────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 35, 40, 45, 50],
    totalRange: [40, 600],
    generate(percent, total) {
      const name = pickFrom(['Priya', 'Arjun', 'Ravi', 'Meera', 'Kiran', 'Sahil', 'Ananya', 'Dev']);
      const sport = pickFrom(['runs', 'points', 'goals']);
      const correct = (percent * total) / 100;
      return {
        question: `${name} scored ${percent}% of the team's total of ${total} ${sport}. How many ${sport} did ${name} score?`,
        correct,
        d1: percent,
        d2: total - correct,    // rest of team's contribution
        d3: total / 10,
        fmt: v => `${v} ${sport}`,
      };
    },
  },

  /* 3 ── RESTAURANT TIP  (percents capped at 25% — realistic tip range) ───── */
  {
    percents: [5, 10, 12, 15, 18, 20, 25],
    totalRange: [80, 3000],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `A restaurant bill is ₹${total}. You leave a ${percent}% tip. How much is the tip in ₹?`,
        correct,
        d1: percent,
        d2: total + correct,    // bill + tip (wrong: confusing tip with total paid)
        d3: total / 10,
        fmt: v => `₹${v}`,
      };
    },
  },

  /* 4 ── RECIPE (ingredient scaling) ──────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50],
    totalRange: [100, 2000],
    generate(percent, total) {
      const ingredient = pickFrom(['flour', 'rice', 'sugar', 'oats', 'lentils', 'wheat']);
      const correct = (percent * total) / 100;
      return {
        question: `A full recipe uses ${total}g of ${ingredient}. You want to make only ${percent}% of the full batch. How many grams of ${ingredient} do you need?`,
        correct,
        d1: percent,
        d2: total - correct,    // remaining ingredient (wrong: confusing portion with remainder)
        d3: total / 10,
        fmt: v => `${v}g`,
      };
    },
  },

  /* 5 ── LIBRARY ───────────────────────────────────────────────────────────── */
  {
    percents: [5, 10, 15, 20, 25, 30, 40, 50],
    totalRange: [50, 1000],
    generate(percent, total) {
      const genre = pickFrom(['fiction', 'science', 'history', 'biography', "children's"]);
      const correct = (percent * total) / 100;
      return {
        question: `A library has ${total} books. ${percent}% of them are ${genre} books. How many ${genre} books are there?`,
        correct,
        d1: percent,
        d2: total - correct,    // non-genre books
        d3: total / 10,
        fmt: v => `${v} books`,
      };
    },
  },

  /* 6 ── ELECTION ──────────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60],
    totalRange: [200, 5000],
    generate(percent, total) {
      const name = pickFrom(['Candidate A', 'Candidate B', 'Party X', 'Party Y', 'Candidate C']);
      const correct = (percent * total) / 100;
      return {
        question: `There are ${total} votes cast in total. ${name} receives ${percent}% of the votes. How many votes did ${name} get?`,
        correct,
        d1: percent,
        d2: total - correct,    // votes for all other candidates combined
        d3: total / 10,
        fmt: v => `${v} votes`,
      };
    },
  },

  /* 7 ── INTERNET DATA (MB per day)  (percents ≤ 75%, realistic usage) ────── */
  {
    percents: [10, 20, 25, 30, 40, 50, 60, 75],
    totalRange: [100, 2000],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `Your daily internet plan gives you ${total} MB of data. You have used ${percent}% of it. How many MB have you used?`,
        correct,
        d1: percent,
        d2: total - correct,    // remaining data
        d3: total / 10,
        fmt: v => `${v} MB`,
      };
    },
  },

  /* 8 ── PHONE BATTERY (mAh)  (percents across full 5–75% range) ──────────── */
  {
    percents: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75],
    totalRange: [1000, 6000],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `A phone battery has a full capacity of ${total} mAh. It is currently charged to ${percent}%. How many mAh is that?`,
        correct,
        d1: percent,
        d2: total - correct,    // remaining charge
        d3: total / 10,
        fmt: v => `${v} mAh`,
      };
    },
  },

  /* 9 ── GARDEN AREA (sq m) ────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50],
    totalRange: [40, 800],
    generate(percent, total) {
      const plant = pickFrom(['flowers', 'vegetables', 'herbs', 'grass', 'fruit trees']);
      const correct = (percent * total) / 100;
      return {
        question: `A garden covers ${total} square metres. ${percent}% of it is used for ${plant}. How many square metres is used for ${plant}?`,
        correct,
        d1: percent,
        d2: total - correct,    // rest of the garden
        d3: total / 10,
        fmt: v => `${v} sq m`,
      };
    },
  },

  /* 10 ── TRAIN SEATS ──────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50, 60],
    totalRange: [50, 500],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `A train has ${total} seats in total. ${percent}% of the seats are occupied. How many seats are taken?`,
        correct,
        d1: percent,
        d2: total - correct,    // empty seats
        d3: total / 10,
        fmt: v => `${v} seats`,
      };
    },
  },

  /* 11 ── EXAM PASS RATE (students) ────────────────────────────────────────── */
  {
    percents: [10, 20, 25, 30, 40, 50, 60, 75],
    totalRange: [20, 200],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `${total} students sat an exam. ${percent}% of them passed. How many students passed?`,
        correct,
        d1: percent,
        d2: total - correct,    // students who failed
        d3: total / 10,
        fmt: v => `${v} students`,
      };
    },
  },

  /* 12 ── CRICKET RUNS ─────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 35, 40, 45, 50],
    totalRange: [50, 400],
    generate(percent, total) {
      const name = pickFrom(['Rohit', 'Virat', 'Dhoni', 'Jadeja', 'Rahul', 'Hardik', 'Shami']);
      const correct = (percent * total) / 100;
      return {
        question: `India scored ${total} runs in total. ${name} scored ${percent}% of those runs. How many runs did ${name} score?`,
        correct,
        d1: percent,
        d2: total - correct,    // runs scored by the rest of the team
        d3: total / 10,
        fmt: v => `${v} runs`,
      };
    },
  },

  /* 13 ── SHOPPING CART COUPON  (discount ≤ 30% — realistic) ──────────────── */
  {
    percents: [5, 10, 12, 15, 20, 25, 30],
    totalRange: [200, 5000],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `Your shopping cart total is ₹${total}. You apply a ${percent}% coupon. How much do you save in ₹?`,
        correct,
        d1: percent,
        d2: total - correct,    // price after coupon (wrong: confusing discount with final price)
        d3: total / 10,
        fmt: v => `₹${v}`,
      };
    },
  },

  /* 14 ── PLAYLIST ─────────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50],
    totalRange: [20, 200],
    generate(percent, total) {
      const genre = pickFrom(['pop', 'rock', 'classical', 'jazz', 'hip-hop', 'folk']);
      const correct = (percent * total) / 100;
      return {
        question: `A playlist has ${total} songs. ${percent}% of them are ${genre}. How many ${genre} songs are there?`,
        correct,
        d1: percent,
        d2: total - correct,    // songs of other genres
        d3: total / 10,
        fmt: v => `${v} songs`,
      };
    },
  },

  /* 15 ── EVENT ATTENDANCE ─────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50, 60, 75],
    totalRange: [100, 2000],
    generate(percent, total) {
      const event = pickFrom(['concert', 'sports match', 'conference', 'festival', 'theatre show']);
      const correct = (percent * total) / 100;
      return {
        question: `A ${event} venue has a capacity of ${total} people. ${percent}% of the seats are filled. How many people attended?`,
        correct,
        d1: percent,
        d2: total - correct,    // empty seats
        d3: total / 10,
        fmt: v => `${v} people`,
      };
    },
  },

  /* 16 ── MONTHLY DATA PLAN (GB)  (realistic 10–100 GB plan range) ─────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50, 60, 75],
    totalRange: [10, 100],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `Your monthly data plan is ${total} GB. You have already used ${percent}% of it. How many GB have you used?`,
        correct,
        d1: percent,
        d2: total - correct,    // remaining data
        d3: total / 10,
        fmt: v => `${v} GB`,
      };
    },
  },

  /* 17 ── SCHOOL CLUB ──────────────────────────────────────────────────────── */
  {
    percents: [10, 15, 20, 25, 30, 40, 50],
    totalRange: [20, 400],
    generate(percent, total) {
      const activity = pickFrom(['football', 'basketball', 'chess', 'debate', 'swimming', 'art', 'coding']);
      const correct = (percent * total) / 100;
      return {
        question: `A school has ${total} students. ${percent}% of them joined the ${activity} club. How many students is that?`,
        correct,
        d1: percent,
        d2: total - correct,    // students not in the club
        d3: total / 10,
        fmt: v => `${v} students`,
      };
    },
  },

  /* 18 ── FUEL TANK (litres)  (realistic 20–100 L tank range) ─────────────── */
  {
    percents: [10, 20, 25, 30, 40, 50, 60, 75],
    totalRange: [20, 100],
    generate(percent, total) {
      const correct = (percent * total) / 100;
      return {
        question: `A car's fuel tank holds ${total} litres when full. The tank is currently ${percent}% full. How many litres of fuel are in the tank?`,
        correct,
        d1: percent,
        d2: total - correct,    // empty portion of the tank
        d3: total / 10,
        fmt: v => `${v} litres`,
      };
    },
  },

  /* 19 ── POCKET MONEY  (savings ≤ 50% — believable range) ────────────────── */
  {
    percents: [5, 10, 15, 20, 25, 30, 40, 50],
    totalRange: [50, 2000],
    generate(percent, total) {
      const name = pickFrom(['Priya', 'Ravi', 'Meera', 'Arjun', 'Sahil', 'Neha', 'Dev']);
      const action = pickFrom(['saved', 'spent on snacks', 'donated to charity', 'used for stationery', 'spent at the bookstore']);
      const correct = (percent * total) / 100;
      return {
        question: `${name} gets ₹${total} as pocket money each week. ${name} ${action} ${percent}% of it. How much is that in ₹?`,
        correct,
        d1: percent,
        d2: total - correct,    // remaining pocket money
        d3: total / 10,
        fmt: v => `₹${v}`,
      };
    },
  },
];

/**
 * Generate a fresh question, excluding the template used last time.
 * Uses GCD-based step to guarantee a whole-number answer.
 * Applies collision avoidance so no distractor equals the correct answer.
 *
 * @param {number} lastTemplateIdx  index of the previous template (-1 = none)
 * @param {number} attempt          recursion-depth guard
 */
function generateQuestion(lastTemplateIdx = -1, attempt = 0) {
  if (attempt > 30) lastTemplateIdx = -1; // safety: stop excluding after many retries

  const available = TEMPLATES.reduce((acc, _, i) => {
    if (i !== lastTemplateIdx) acc.push(i);
    return acc;
  }, []);

  const templateIdx = pickFrom(available);
  const template = TEMPLATES[templateIdx];

  const percent = pickFrom(template.percents);
  const step = 100 / gcd(percent, 100); // smallest total that gives whole answer

  const [lo, hi] = template.totalRange;
  const kLo = Math.ceil(lo / step);
  const kHi = Math.floor(hi / step);

  if (kLo > kHi) {
    // This percent × range combo has no valid integer multiple — try again
    return generateQuestion(lastTemplateIdx, attempt + 1);
  }

  const total = step * randInt(kLo, kHi);
  const { question, correct, d1, d2, d3, fmt } = template.generate(percent, total);

  // Collision avoidance: replace any distractor that equals `correct` or a sibling
  const [safe1, safe2, safe3] = avoidCollisions(correct, [d1, d2, d3]);

  const options = shuffle([correct, safe1, safe2, safe3]).map(v => ({
    value: v,
    label: fmt(v),
  }));

  return { templateIdx, question, correct, options };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function PercentExplanationApp({ onBack, PercentApp }) {
  // Views: 'LEVELS' | 'EXPLANATION_L1' | 'QUIZ'
  const [view, setView] = useState('LEVELS');
  const [initialStep, setInitialStep] = useState(null);
  const [percentQuizSession, setPercentQuizSession] = useState(null);
  const [pendingEscalationSkill, setPendingEscalationSkill] = useState(null);
  const [mistakeHistory, setMistakeHistory] = useState({
    convert_percent_to_decimal: { questionIds: [], escalatedQuestionIds: [] },
    multiply_by_whole: { questionIds: [], escalatedQuestionIds: [] },
  });

  if (view === 'QUIZ') {
    return (
      <PercentApp
        onBack={() => setView('LEVELS')}
        onRedirectToExplanation={(step) => {
          setInitialStep(step);
          setView('EXPLANATION_L1');
        }}
        quizSession={percentQuizSession}
        setQuizSession={setPercentQuizSession}
        mistakeHistory={mistakeHistory}
        setMistakeHistory={setMistakeHistory}
        pendingEscalationSkill={pendingEscalationSkill}
        setPendingEscalationSkill={setPendingEscalationSkill}
      />
    );
  }

  return (
    <div className="percent-exp-container">
      {view === 'LEVELS' ? (
        <LevelsSelectView
          onBack={onBack}
          onSelectLevel={(lvl) => setView(`EXPLANATION_L${lvl}`)}
        />
      ) : (
        <Level1ExplanationView
          onBack={() => setView('LEVELS')}
          onContinueToQuiz={() => setView('QUIZ')}
          initialStep={initialStep}
          clearInitialStep={() => setInitialStep(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LEVELS SELECTION VIEW  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function LevelsSelectView({ onBack, onSelectLevel }) {
  const levels = [
    { id: 1, title: 'Level 1: Find a Percentage',   desc: 'Learn how to calculate a basic part of a whole (e.g., 20% of 80).', active: true },
    { id: 2, title: 'Level 2: Increase / Decrease', desc: 'Understand percentages as markups, discounts, or growth.',           active: false },
    { id: 3, title: 'Level 3: Reverse Percentage',  desc: 'Find the original quantity when given the percentage result.',        active: false },
    { id: 4, title: 'Level 4: Compound Percentage', desc: 'Apply successive percentage changes over multiple intervals.',        active: false },
  ];

  return (
    <div className="levels-layout">
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Home</button>
      </div>

      <h1 className="title-serif">Percentages</h1>
      <p className="subtitle-body">Master percentage concepts step-by-step through interactive explanations.</p>

      <div className="levels-grid">
        {levels.map((lvl) => (
          <div
            key={lvl.id}
            className={`level-card ${lvl.active ? 'active' : 'locked'}`}
            onClick={() => lvl.active && onSelectLevel(lvl.id)}
          >
            <div className="level-badge">{lvl.active ? 'Ready' : 'Locked'}</div>
            <h3>{lvl.title}</h3>
            <p>{lvl.desc}</p>
            {lvl.active
              ? <button className="learn-btn">Start Learning →</button>
              : <span className="coming-soon">Coming Soon</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LEVEL 1 EXPLANATION VIEW
// ─────────────────────────────────────────────────────────────────────────────

function Level1ExplanationView({ onBack, onContinueToQuiz, initialStep, clearInitialStep }) {
  const [activeSection, setActiveSection] = useState(1); // 1 to 5
  const [infoOpen, setInfoOpen] = useState(false);
  const isTouchRef = React.useRef(false);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.level-info-anchor')) {
        setInfoOpen(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('touchstart', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('touchstart', handleGlobalClick);
    };
  }, []);

  React.useEffect(() => {
    if (initialStep) {
      if (initialStep === 'convert') {
        setActiveSection(2);
      } else if (initialStep === 'multiply') {
        setActiveSection(3);
      }
      setTimeout(() => {
        let el = null;
        if (initialStep === 'convert') {
          el = document.querySelector('.theory-card');
        } else if (initialStep === 'multiply') {
          el = document.querySelector('.example-card');
        }
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = 'background-color 0.5s ease, border-color 0.5s ease';
          el.style.backgroundColor = 'rgba(232, 134, 74, 0.25)';
          el.style.borderColor = 'var(--clr-accent)';
          setTimeout(() => {
            el.style.backgroundColor = '';
            el.style.borderColor = '';
          }, 2500);
        }
        if (clearInitialStep) clearInitialStep();
      }, 300);
    }
  }, [initialStep, clearInitialStep]);

  // ── Interactive visual ──
  const [percent, setPercent]         = useState(25);
  const [whole, setWhole]             = useState(200);
  const [customWhole, setCustomWhole] = useState('200');

  // ── Theory reveal ──
  const [theoryStep, setTheoryStep]   = useState(1);
  const totalTheorySteps              = 4;

  // ── Worked example reveal ──
  const [exampleStep, setExampleStep] = useState(1);
  const totalExampleSteps             = 5;

  // ── Story completion gate (section 4 → 5) ──
  const [storyFinished, setStoryFinished] = useState(false);

  // ── Quiz gate ──
  const [quizPassed, setQuizPassed]   = useState(false);

  const handleWholeChange = (e) => {
    const val = e.target.value;
    setCustomWhole(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 10000) setWhole(parsed);
  };

  const setWholePreset = (val) => {
    setWhole(val);
    setCustomWhole(String(val));
  };

  const calculatedPart = ((percent / 100) * whole).toFixed(1).replace(/\.0$/, '');

  // Both theory AND example must be fully revealed before the quiz gate appears
  const isExplanationFinished =
    theoryStep === totalTheorySteps && exampleStep === totalExampleSteps;

  return (
    <div className="explanation-layout">
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Levels</button>
      </div>

      {/* Title + info icon */}
      <div className="level-title-row">
        <h1 className="title-serif" style={{ margin: 0 }}>Level 1: Find a Percentage</h1>
        <div className="level-info-anchor">
          <button
            className="level-info-btn"
            aria-label="About this level"
            onTouchStart={() => {
              isTouchRef.current = true;
            }}
            onMouseEnter={() => {
              if (!isTouchRef.current) {
                setInfoOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (!isTouchRef.current) {
                setInfoOpen(false);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isTouchRef.current) {
                setInfoOpen(prev => !prev);
                setTimeout(() => {
                  isTouchRef.current = false;
                }, 50);
              }
            }}
          >
            ⓘ
          </button>
          <div className={`level-info-popup${infoOpen ? ' is-open' : ''}`}>
            <p>Learn how to find any percentage of a number. Practice with sliders, see the math, then finish with a story and quiz.</p>
          </div>
        </div>
      </div>

      {/* Persistent progress bar indicator */}
      <div className="explanation-progress-bar-container" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '0 auto', maxWidth: '600px' }}>
          {/* Background Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            right: '5%',
            height: '4px',
            backgroundColor: '#CFD8DC',
            zIndex: 1
          }} />
          {/* Active Line Fill */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            width: `${((activeSection - 1) / 4) * 90}%`,
            height: '4px',
            backgroundColor: 'var(--clr-accent)',
            zIndex: 2,
            transition: 'width 0.3s ease'
          }} />

          {/* Step Circles — plain numbered buttons, no tooltip */}
          {[
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 }
          ].map((step) => {
            const isCompleted = step.id < activeSection;
            const isActive    = step.id === activeSection;
            const isDisabled  = (step.id === 4 && !isExplanationFinished) || (step.id === 5 && (!isExplanationFinished || !storyFinished));

            let bgColor     = 'var(--clr-card)';
            let borderColor = 'var(--clr-border)';
            let textColor   = 'var(--clr-text-soft)';
            if (isCompleted) {
              bgColor     = 'var(--clr-correct-bg)';
              borderColor = 'var(--clr-correct)';
              textColor   = 'var(--clr-correct)';
            } else if (isActive) {
              bgColor     = 'var(--clr-accent-soft)';
              borderColor = 'var(--clr-accent)';
              textColor   = 'var(--clr-accent)';
            }

            return (
              <div key={step.id} style={{ position: 'relative', zIndex: 3 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDisabled) return;
                    setActiveSection(step.id);
                  }}
                  disabled={isDisabled}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: bgColor,
                    border: `3px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    color: textColor,
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 0 10px rgba(232, 134, 74, 0.4)' : 'none',
                  }}>
                    {isCompleted ? '✓' : step.id}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: '800', color: 'var(--clr-dim)' }}>
          {`Section ${activeSection} of 5`}
        </div>
      </div>

      {/* Card swap transitions wrapper */}
      <div key={activeSection} className="explanation-card-transition-wrapper">
        {/* ── SECTION A: INTERACTIVE VISUAL ── */}
        {activeSection === 1 && (
          <div className="explanation-card interactive-card">
            <h2 className="section-title">1. Interactive Visual Model</h2>

            <div className="equation-banner">
              <div className="math-display">
                Find <span className="highlight-accent">{percent}%</span> of{' '}
                <span className="highlight-purple">{whole}</span>
                <span className="equals"> = </span>
                <span className="highlight-green">{calculatedPart}</span>
              </div>
              <div className="math-breakdown">
                ({percent} / 100) × {whole} = {(percent / 100).toFixed(2)} × {whole} = {calculatedPart}
              </div>
            </div>

            <div className="percent-bar-wrapper">
              <div className="percent-bar-labels">
                <span>0</span>
                <span>{whole / 4}</span>
                <span>{whole / 2}</span>
                <span>{(3 * whole) / 4}</span>
                <span>{whole}</span>
              </div>
              <div className="percent-bar-container">
                <div className="percent-bar-track"></div>
                <div className="percent-bar-fill" style={{ width: `${percent}%` }}>
                  <span className="percent-fill-label">{percent}%</span>
                </div>
              </div>
            </div>

            <div className="controls-row">
              <div className="control-group slider-group">
                <label>Percentage: <strong>{percent}%</strong></label>
                <input
                  type="range" min="0" max="100" step="1" value={percent}
                  onChange={(e) => setPercent(parseInt(e.target.value, 10))}
                  className="accent-slider"
                />
              </div>

              <div className="control-group whole-group">
                <label>Whole Amount: <strong>{whole}</strong></label>
                <div className="presets-row">
                  {[50, 100, 200, 500].map((preset) => (
                    <button
                      key={preset}
                      className={`preset-btn ${whole === preset ? 'active' : ''}`}
                      onClick={() => setWholePreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="custom-input-wrapper">
                  <span className="input-prefix">Custom:</span>
                  <input
                    type="text"
                    value={customWhole}
                    onChange={handleWholeChange}
                    placeholder="E.g., 80"
                    className="whole-text-input"
                  />
                </div>
              </div>
            </div>

            <div className="explanation-nav-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button className="percentages-btn" onClick={() => setActiveSection(2)}>
                Next: Theory ➡️
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION B: CONCEPT THEORY ── */}
        {activeSection === 2 && (
          <div className="explanation-card theory-card">
            {/* Section title + progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 className="section-title" style={{ margin: 0, border: 'none', paddingBottom: 0 }}>2. Concept Theory</h2>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)', border: '1px solid var(--clr-border)', borderRadius: '999px', padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {theoryStep} of {totalTheorySteps}
              </span>
            </div>
            <div style={{ borderBottom: '1px solid var(--clr-border)', marginBottom: '20px' }} />

            {/* One card at a time — key triggers fade-in on every swap */}
            <div key={`theory-${theoryStep}`} className="theory-steps-list" style={{ marginBottom: 0 }}>
              {theoryStep === 1 && (
                <div className="step-item fade-in">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <strong>Use the formula!</strong><br />This is the shortcut for finding a part of a whole:
                    <div className="formula-block">Part = (Percent ÷ 100) × Whole</div>
                  </div>
                </div>
              )}
              {theoryStep === 2 && (
                <div className="step-item fade-in">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <strong>What is a percentage?</strong><br />A percentage tells you "how many out of 100" — which is the idea behind the formula.
                  </div>
                </div>
              )}
              {theoryStep === 3 && (
                <div className="step-item fade-in">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <strong>Think of 100 pieces:</strong><br />Imagine cutting the whole into 100 equal slices, so the percent tells you how many slices to take.
                  </div>
                </div>
              )}
              {theoryStep === 4 && (
                <div className="step-item fade-in">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <strong>Turn the percent into a decimal:</strong><br />Divide it by 100 — so {percent}% becomes {(percent / 100).toFixed(2)}. Then multiply by the whole.
                  </div>
                </div>
              )}
            </div>

            {/* Outer nav row: outer-Back always visible; inner-Back hidden on card 1; inner-Next or outer-Next at final card */}
            <div className="explanation-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', gap: '15px' }}>
              {/* Left side: outer Back to Section 1, or inner Back within section */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="percentages-btn percentages-btn-secondary" onClick={() => setActiveSection(1)}>
                  ⬅️ Back
                </button>
                {theoryStep > 1 && (
                  <button
                    className="next-reveal-btn"
                    style={{ margin: 0 }}
                    onClick={() => setTheoryStep(prev => prev - 1)}
                  >
                    ← Prev
                  </button>
                )}
              </div>
              {/* Right side: inner Next, or completion badge + outer Next at final card */}
              {theoryStep < totalTheorySteps ? (
                <button
                  className="next-reveal-btn"
                  style={{ margin: 0 }}
                  onClick={() => setTheoryStep(prev => prev + 1)}
                >
                  Next →
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="completion-badge" style={{ margin: 0, position: 'static', transform: 'none' }}>✓ Theory Completed</div>
                  <button className="percentages-btn" onClick={() => setActiveSection(3)}>
                    Next: Example ➡️
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION C: WORKED EXAMPLE ── */}
        {activeSection === 3 && (
          <div className="explanation-card example-card">
            {/* Section title + progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 className="section-title" style={{ margin: 0, border: 'none', paddingBottom: 0 }}>3. Step-by-Step Worked Example</h2>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)', border: '1px solid var(--clr-border)', borderRadius: '999px', padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {exampleStep} of {totalExampleSteps}
              </span>
            </div>
            <div style={{ borderBottom: '1px solid var(--clr-border)', marginBottom: '8px' }} />
            <p className="section-subtitle">Problem: Find 15% of 80.</p>

            {/* One card at a time — key triggers fade-in on every swap */}
            <div key={`example-${exampleStep}`} className="example-steps-list" style={{ marginBottom: 0 }}>
              {exampleStep === 1 && (
                <div className="step-item fade-in">
                  <div className="step-indicator">Step 1</div>
                  <div className="step-content">
                    Write the percent as a fraction over 100:<br />
                    <div className="math-equation">15% = 15 / 100</div>
                  </div>
                </div>
              )}
              {exampleStep === 2 && (
                <div className="step-item fade-in">
                  <div className="step-indicator">Step 2</div>
                  <div className="step-content">
                    Multiply the fraction by the whole amount:<br />
                    <div className="math-equation">(15 / 100) × 80</div>
                  </div>
                </div>
              )}
              {exampleStep === 3 && (
                <div className="step-item fade-in">
                  <div className="step-indicator">Step 3</div>
                  <div className="step-content">
                    Change the fraction to a decimal:<br />
                    <div className="math-equation">0.15 × 80</div>
                  </div>
                </div>
              )}
              {exampleStep === 4 && (
                <div className="step-item fade-in">
                  <div className="step-indicator">Step 4</div>
                  <div className="step-content">
                    Multiply to get the answer:<br />
                    <div className="math-equation">0.15 × 80 = 12</div>
                  </div>
                </div>
              )}
              {exampleStep === 5 && (
                <div className="example-conclusion-box fade-in">
                  So, <strong>15% of 80 is 12</strong>! <span className="pop-emoji">🎉</span>
                </div>
              )}
            </div>

            {/* Outer nav row: outer-Back always visible; inner-Back hidden on card 1; inner-Next or outer-Next at final card */}
            <div className="explanation-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', gap: '15px' }}>
              {/* Left side: outer Back to Section 2, or inner Back within section */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="percentages-btn percentages-btn-secondary" onClick={() => setActiveSection(2)}>
                  ⬅️ Back
                </button>
                {exampleStep > 1 && (
                  <button
                    className="next-reveal-btn"
                    style={{ margin: 0 }}
                    onClick={() => setExampleStep(prev => prev - 1)}
                  >
                    ← Prev
                  </button>
                )}
              </div>
              {/* Right side: inner Next, or completion badge + outer Next at final card */}
              {exampleStep < totalExampleSteps ? (
                <button
                  className="next-reveal-btn"
                  style={{ margin: 0 }}
                  onClick={() => setExampleStep(prev => prev + 1)}
                >
                  Next →
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="completion-badge" style={{ margin: 0, position: 'static', transform: 'none' }}>✓ Example Completed</div>
                  <button className="percentages-btn" onClick={() => setActiveSection(4)}>
                    Next: Percent Story ➡️
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION D: PERCENT STORY ── */}
        {activeSection === 4 && isExplanationFinished && (
          <PercentStory
            onAdvance={() => setStoryFinished(true)}
            onBack={() => setActiveSection(3)}
            onContinue={() => {
              setStoryFinished(true);
              setActiveSection(5);
            }}
          />
        )}

        {activeSection === 5 && isExplanationFinished && storyFinished && (
          <div>
            <div className="explanation-card quiz-gate-card">
              <h2 className="section-title">
                5. Quick Check Quiz
                <span className="ungraded-badge">Ungraded</span>
              </h2>
              <p className="section-subtitle">
                Answer <strong>3 out of 4</strong> questions correctly to unlock
                "Continue to Practice". Questions are freshly generated every
                time — no two will ever be the same.
              </p>

              <MicroQuiz onPass={() => setQuizPassed(true)} />
              
              <div className="explanation-nav-row" style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
                <button className="percentages-btn percentages-btn-secondary" onClick={() => setActiveSection(4)}>
                  ⬅️ Back
                </button>
              </div>
            </div>

            {/* ── FINISH BLOCK ── */}
            <div
              className={`finish-action-block fade-in ${
                quizPassed ? 'quiz-unlocked' : 'quiz-locked'
              }`}
              style={{ marginTop: '20px' }}
            >
              {quizPassed ? (
                <p>🎉 Well done! You have passed the quiz and are ready to practise.</p>
              ) : (
                <p>Complete the Quick Check Quiz above to unlock practice.</p>
              )}
              <button
                className="continue-practice-btn"
                onClick={onContinueToQuiz}
                disabled={!quizPassed}
                aria-disabled={!quizPassed}
              >
                {quizPassed ? 'Continue to Practice Quiz →' : '🔒 Complete Quiz to Unlock'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MICRO QUIZ COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function MicroQuiz({ onPass }) {
  // phase: 'question' | 'feedback' | 'passed'
  const [phase,        setPhase]        = useState('question');
  const [currentQ,     setCurrentQ]     = useState(() => generateQuestion(-1));
  const [roundResults, setRoundResults] = useState([]); // booleans for current 4-question round
  const [failedRounds, setFailedRounds] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null); // 'correct' | 'wrong'

  const questionNumInRound = roundResults.length + 1; // 1–4

  const handleSelect = (optionValue) => {
    if (phase !== 'question') return;

    const isCorrect     = optionValue === currentQ.correct;
    const newResults    = [...roundResults, isCorrect];

    setLastFeedback(isCorrect ? 'correct' : 'wrong');
    playSound(isCorrect ? 'correct' : 'wrong', true);
    setPhase('feedback');

    setTimeout(() => {
      if (newResults.length === 4) {
        // End of round — evaluate pass threshold
        const correctCount = newResults.filter(Boolean).length;
        if (correctCount >= 3) {
          setPhase('passed');
          onPass();
        } else {
          // Failed round → start a new one
          setFailedRounds(prev => prev + 1);
          setRoundResults([]);
          setCurrentQ(generateQuestion(currentQ.templateIdx));
          setLastFeedback(null);
          setPhase('question');
        }
      } else {
        // Continue this round with next question from a different template
        setRoundResults(newResults);
        setCurrentQ(generateQuestion(currentQ.templateIdx));
        setLastFeedback(null);
        setPhase('question');
      }
    }, 1400);
  };

  /* ── PASSED STATE ─────────────────────────────────────────────────── */
  if (phase === 'passed') {
    return (
      <div className="quiz-success-state fade-in">
        <div className="quiz-success-icon">🎉</div>
        <h3 className="quiz-success-title">Quiz Passed!</h3>
        <p className="quiz-success-body">
          You answered at least 3 out of 4 correctly — you're ready to practise!
        </p>
      </div>
    );
  }

  /* ── ACTIVE QUIZ ──────────────────────────────────────────────────── */
  return (
    <div className="micro-quiz-inner">

      {/* Round label + 4 progress dots */}
      <div className="quiz-round-header">
        <span className="quiz-round-label">
          Round {failedRounds + 1} · Question {questionNumInRound} of 4
        </span>
        <div className="quiz-dots">
          {[0, 1, 2, 3].map(i => {
            const cls =
              i < roundResults.length
                ? roundResults[i] ? 'correct' : 'wrong'
                : i === roundResults.length
                ? 'current'
                : 'pending';
            return <span key={i} className={`quiz-dot ${cls}`} />;
          })}
        </div>
      </div>

      {/* Question */}
      <p className="quiz-question-text">{currentQ.question}</p>

      {/* 2 × 2 options grid */}
      <div className="quiz-options-grid">
        {currentQ.options.map((opt, i) => (
          <button
            key={i}
            className="quiz-option-btn"
            onClick={() => handleSelect(opt.value)}
            disabled={phase === 'feedback'}
          >
            <span className="opt-letter">{['A', 'B', 'C', 'D'][i]}</span>
            <span className="opt-label">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Inline feedback (disappears with next question load) */}
      {phase === 'feedback' && (
        <div className={`quiz-feedback-msg ${lastFeedback} fade-in`}>
          {lastFeedback === 'correct'
            ? '✓ Correct! Loading next question…'
            : 'Not quite — revisit the theory above and try the next one.'}
        </div>
      )}

      {/* Nudge banner: shown permanently after 2 failed rounds */}
      {failedRounds >= 2 && (
        <div className="quiz-nudge fade-in">
          <span className="nudge-icon">💡</span>
          <span>
            Still finding this tricky? Try the copy-paste prompt above in any
            AI chat tool for more real-life examples.
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERCENT STORY  (Section 4 — animated visual narrative, NOT a quiz)
//
// A 4-panel narrative about a jar of 100 candies. Pure tap-through. No drag,
// no evaluation, no fine motor skill required. Every Next tap advances the
// visual state with smooth, staggered animation:
//
//   Panel 1 — Full jar (100 candies, glow-in)
//   Panel 2 — 25 candies given away (stagger grey-out + live counter tick 0→25)
//   Panel 3 — "25 / 100 = 25%" reveal (remaining 75 pulse-glow, big label)
//   Panel 4 — Tie-back to the lesson (single row, full-grid bounce, caption slide-in)
// ─────────────────────────────────────────────────────────────────────────────

/* Legacy candy-tapping story retained for diff safety.
function PercentStory({ onAdvance, onBack, onContinue }) {
  const STORY_BEATS = 5;
  const [currentBeat, setCurrentBeat] = useState(0);
  const [givenAway, setGivenAway] = useState([]);
  const [guess, setGuess] = useState(null);
  const isSelectionBeat = currentBeat === 1;
  const isGuessBeat = currentBeat === 2;
  const isLastBeat = currentBeat === STORY_BEATS - 1;
  const hasGivenAway25 = givenAway.length === 25;
  const fadedCandies = givenAway;

  const beats = [
    { title: 'Meet Percy, keeper of the candy jar', expression: 'neutral', eyebrow: 'Comic 1 of 5' },
    { title: 'You choose the part', expression: hasGivenAway25 ? 'excited' : 'thinking', eyebrow: 'Comic 2 of 5' },
    { title: 'Make your best guess', expression: 'thinking', eyebrow: 'Comic 3 of 5' },
    { title: 'Here is the percent connection', expression: 'excited', eyebrow: 'Comic 4 of 5' },
    { title: 'Previously on: Percy’s candy jar', expression: 'neutral', eyebrow: 'Comic 5 of 5' },
  ][currentBeat];

  const toggleCandy = (index) => {
    if (!isSelectionBeat) return;
    setGivenAway((selected) => {
      if (selected.includes(index)) return selected.filter((candy) => candy !== index);
      return selected.length < 25 ? [...selected, index] : selected;
    });
  };

  const nextBeat = () => {
    if (isLastBeat) {
      onAdvance();
      onContinue();
      return;
    }
    setCurrentBeat((beat) => beat + 1);
  };

  const nextDisabled = (isSelectionBeat && !hasGivenAway25) || (isGuessBeat && guess === null);
  const guessFeedback = guess === 25
    ? 'Nice prediction! You spotted the “out of 100” clue.'
    : 'Good thinking — now let’s translate the fraction together.';

  return (
    <section className={`explanation-card percent-story-card story-beat-${currentBeat}`}>
      <div className="percent-story-header">
        <span className="percent-story-eyebrow">{beats.eyebrow}</span>
        <h2 className="section-title">{beats.title}</h2>
      </div>

      <div className="percent-story-progress" aria-label={`Story beat ${currentBeat + 1} of ${STORY_BEATS}`}>
        {Array.from({ length: STORY_BEATS }, (_, index) => <span key={index} className={index <= currentBeat ? 'is-current' : ''} />)}
      </div>

      <div className="percent-story-stage">
        {currentBeat === 0 && (
          <div className="percent-story-comic-strip">
            <ComicPanel expression="neutral" line="Hi! I’m Percy. My jar is completely full." />
            <ComicPanel expression="excited" line="Count the whole with me: there are 100 candies in this jar!" />
          </div>
        )}

        {currentBeat === 1 && (
          <div className="percent-story-comic-strip">
            <ComicPanel expression="thinking" line="A friend needs 25 candies. Tap 25 candies to give them away." />
            <ComicPanel expression={hasGivenAway25 ? 'excited' : 'neutral'} line={hasGivenAway25 ? 'Exactly 25! Those are the part of the whole.' : `${givenAway.length} selected — keep going until you reach 25.`} />
          </div>
        )}

        {currentBeat === 2 && (
          <div className="percent-story-comic-strip">
            <ComicPanel expression="thinking" line="We gave away 25 out of 100. What percent do you think that is?" />
            <div className="percent-story-guess" role="group" aria-label="Choose a percent guess">
              {[20, 25, 75].map((option) => (
                <button key={option} type="button" className={`percent-story-guess-option${guess === option ? ' is-selected' : ''}`} onClick={() => setGuess(option)}>{option}%</button>
              ))}
            </div>
            {guess !== null && <ComicPanel expression={guess === 25 ? 'excited' : 'neutral'} line={guessFeedback} />}
          </div>
        )}

        {currentBeat === 3 && (
          <div className="percent-story-comic-strip">
            <ComicPanel expression="excited" line="Percent literally means “per hundred.” Our whole is already 100!" />
            <div className="percent-story-formula" aria-label="25 out of 100 equals 25 percent"><strong>25</strong><span>out of 100</span><b>=</b><strong>25%</strong></div>
            <ComicPanel expression="neutral" line="So 25 candies is 25% of the jar. The part becomes the percent." />
          </div>
        )}

        {currentBeat === 4 && (
          <div className="percent-story-recap" aria-label="Recap of the candy jar story">
            <ComicPanel expression="neutral" mini line="Whole: 100 candies." />
            <ComicPanel expression="thinking" mini line="Part: 25 given away." />
            <ComicPanel expression="excited" mini line="25 ÷ 100 = 25%." />
          </div>
        )}

        <div className="percent-story-counter" aria-live="polite">
          {currentBeat === 0 && <><strong>100</strong><span>candies = the whole</span></>}
          {currentBeat === 1 && <><strong>{givenAway.length} / 25</strong><span>candies given away</span></>}
          {currentBeat >= 2 && <><strong>25 / 100 = 25%</strong><span>part out of whole = percent</span></>}
        </div>

        <div className={`percent-story-jar${isSelectionBeat ? ' is-interactive' : ''}`} aria-label="A jar containing 100 candies">
          <div className="percent-story-grid">
            {Array.from({ length: 100 }, (_, index) => {
              const isFaded = fadedCandies.includes(index);
              return isSelectionBeat ? (
                <button key={index} type="button" aria-label={`${isFaded ? 'Return' : 'Give away'} candy ${index + 1}`} aria-pressed={isFaded} onClick={() => toggleCandy(index)} className={`percent-story-candy${isFaded ? ' is-faded' : ''}`} />
              ) : <span key={index} aria-hidden="true" className={`percent-story-candy${isFaded ? ' is-faded' : ''}${currentBeat >= 3 && !isFaded ? ' is-glowing' : ''}`} />;
            })}
          </div>
        </div>
      </div>

      <div className="explanation-nav-row percent-story-nav">
        <button className="percentages-btn percentages-btn-secondary" onClick={onBack}>← Back</button>
        <button className="percentages-btn" onClick={nextBeat} disabled={nextDisabled}>
          {isLastBeat ? 'Next: Quick Quiz →' : 'Next comic →'}
        </button>
      </div>
    </section>
  );
}

function ComicPanel({ expression, line, mini = false }) {
  return (
    <article className={`percent-story-comic-panel${mini ? ' is-mini' : ''}`}>
      <PercyAvatar expression={expression} />
      <p className="percent-story-speech">{line}</p>
    </article>
  );
}

function PercyAvatar({ expression }) {
  const eyes = expression === 'excited' ? '★ ★' : expression === 'thinking' ? '• ◔' : '• •';
  const mouth = expression === 'excited' ? '⌣' : expression === 'thinking' ? '⌒' : '﹀';
  return <span className={`percent-story-avatar is-${expression}`} role="img" aria-label={`Percy looks ${expression}`}><span className="avatar-lid">⌒</span><span className="avatar-face"><i>{eyes}</i><b>{mouth}</b></span><span className="avatar-candy">●</span></span>;
}
*/

const SCENARIOS = [
  { theme: 'Candy Jar', icon: '🍬', whole: 100, part: 25, unit: 'candies', gridColumns: 10, intro: 'I filled this jar with 100 candies. That whole jar is our total.', taken: 'Then I gave away 25 candies. Watch those 25 fade out.', guess: 'What percent of the jar did I give away?', formula: 'Percentage means “out of 100.” We gave away 25 out of 100: 25 ÷ 100 × 100 = 25%.', recap: 'So 25 candies out of 100 candies is 25%. You’ve got it!', guesses: [20, 25, 75] },
  { theme: 'Pizza Party', icon: '🍕', whole: 8, part: 2, unit: 'slices', gridColumns: 8, intro: 'This pizza was cut into 8 equal slices. All 8 slices make the whole pizza.', taken: 'Two slices were eaten. Let’s take away those 2 slices.', guess: 'What percent of the pizza was eaten?', formula: 'We ate 2 out of 8 slices. 2 ÷ 8 × 100 = 25%.', recap: 'Two of eight equal slices is 25% of the pizza.', guesses: [20, 25, 50] },
  { theme: 'Classroom Helpers', icon: '🧑‍🎓', whole: 20, part: 5, unit: 'students', gridColumns: 5, intro: 'There are 20 students in this class. That is the whole group.', taken: 'Five students volunteered to help. Let’s highlight those 5.', guess: 'What percent of the class volunteered?', formula: 'That is 5 out of 20 students. 5 ÷ 20 × 100 = 25%.', recap: 'Five out of twenty students is 25% of the class.', guesses: [20, 25, 50] },
  { theme: 'Piggy Bank', icon: '🪙', whole: 40, part: 10, unit: 'coins', gridColumns: 8, intro: 'This piggy bank has 40 coins in it. That is the whole amount.', taken: '10 coins are spent on a notebook. Let’s move those 10 away.', guess: 'What percent of the coins were spent?', formula: 'We spent 10 out of 40 coins. 10 ÷ 40 × 100 = 25%.', recap: 'Ten out of forty coins is 25% spent.', guesses: [20, 25, 40] },
  { theme: 'Football Match', icon: '⚽', whole: 90, part: 45, unit: 'minutes', gridColumns: 10, intro: 'A football match lasts 90 minutes. That is the whole match.', taken: 'The first 45 minutes have been played. Let’s mark that time as complete.', guess: 'What percent of the match is finished?', formula: 'That is 45 out of 90 minutes. 45 ÷ 90 × 100 = 50%.', recap: 'When 45 of 90 minutes are complete, the match is 50% finished—halfway!', guesses: [25, 50, 75] },
];

function PercentStory({ onAdvance, onBack, onContinue }) {
  const scenario = useState(() => SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)])[0];
  const [currentBeat, setCurrentBeat] = useState(0);
  const [guess, setGuess] = useState(null);
  const [revealState, setRevealState] = useState('idle');
  const percent = (scenario.part / scenario.whole) * 100;
  const isLastBeat = currentBeat === 4;
  const isRevealBeat = currentBeat === 1;
  const isGuessBeat = currentBeat === 2;

  useEffect(() => {
    if (!isRevealBeat) {
      setRevealState('idle');
      return undefined;
    }
    setRevealState('animating');
    const revealTimer = window.setTimeout(() => setRevealState('complete'), 1500);
    return () => window.clearTimeout(revealTimer);
  }, [isRevealBeat]);

  const nextBeat = () => {
    if (isLastBeat) {
      onAdvance();
      onContinue();
      return;
    }
    setCurrentBeat((beat) => beat + 1);
  };

  const guessFeedback = guess === percent
    ? 'Nice prediction! You found the correct percent.'
    : 'Good thinking—now let’s translate the part and whole together.';
  const panelCopy = [
    scenario.intro,
    revealState === 'complete' ? 'Done! ' + scenario.part + ' ' + scenario.unit + ' are the part of the whole.' : scenario.taken,
    guess !== null ? guessFeedback : scenario.guess,
    scenario.formula,
    scenario.recap,
  ][currentBeat];
  const expression = currentBeat === 2 ? 'thinking' : currentBeat >= 3 || revealState === 'complete' ? 'excited' : 'neutral';
  const actionLabel = isLastBeat ? 'Next: Quick Quiz →' : isRevealBeat ? 'Got it' : 'Next comic →';
  const nextDisabled = (isRevealBeat && revealState !== 'complete') || (isGuessBeat && guess === null);

  return (
    <section className={'explanation-card percent-story-card story-beat-' + currentBeat} data-scenario={scenario.theme}>
      <div className="percent-story-header">
        <span className="percent-story-eyebrow">Percent story · {scenario.theme}</span>
        <h2 className="section-title">{currentBeat === 0 ? 'Explore the ' + scenario.theme : 'Comic ' + (currentBeat + 1) + ' of 5'}</h2>
      </div>
      <div className="percent-story-progress" aria-label={'Story beat ' + (currentBeat + 1) + ' of 5'}>
        {Array.from({ length: 5 }, (_, index) => <span key={index} className={index <= currentBeat ? 'is-current' : ''} />)}
      </div>
      <div className="percent-story-stage">
        {/* STATIC PREVIEW FOR USER APPROVAL - WILL BE REMOVED AFTER APPROVAL */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          padding: '16px',
          marginBottom: '20px',
          border: '2px dashed var(--clr-accent)',
          borderRadius: '16px',
          backgroundColor: 'var(--clr-card)',
          width: '100%',
          maxWidth: '560px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Percy expression="neutral" />
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '6px', color: 'var(--clr-text)' }}>Neutral / Explaining</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Percy expression="excited" />
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '6px', color: 'var(--clr-text)' }}>Happy / Excited</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Percy expression="thinking" />
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '6px', color: 'var(--clr-text)' }}>Thinking</div>
          </div>
        </div>

        <article className="percent-story-comic-panel">
          <Percy expression={expression} />
          <p className="percent-story-speech">{panelCopy}</p>
        </article>
        {isGuessBeat && <div className="percent-story-guess" role="group" aria-label="Choose a percent guess">{scenario.guesses.map((option) => <button key={option} type="button" className={'percent-story-guess-option' + (guess === option ? ' is-selected' : '')} onClick={() => setGuess(option)}>{option}%</button>)}</div>}
        {currentBeat === 3 && <div className="percent-story-formula" aria-label={scenario.part + ' out of ' + scenario.whole + ' equals ' + percent + ' percent'}><strong>{scenario.part}</strong><span>out of {scenario.whole}</span><b>=</b><strong>{percent}%</strong></div>}
        {currentBeat === 4 && <div className="percent-story-recap" aria-label={'Recap of the ' + scenario.theme + ' story'}><span>Whole: {scenario.whole} {scenario.unit}</span><span>Part: {scenario.part} {scenario.theme === 'Football Match' ? 'completed' : 'taken'}</span><strong>{scenario.part} ÷ {scenario.whole} = {percent}%</strong></div>}
        <div className="percent-story-counter" aria-live="polite">
          {currentBeat === 0 && <><strong>{scenario.whole}</strong><span>{scenario.unit} = the whole</span></>}
          {isRevealBeat && <><strong>{revealState === 'complete' ? scenario.part : 0} / {scenario.part}</strong><span>{revealState === 'complete' ? scenario.unit + ' revealed' : 'revealing the part...'}</span></>}
          {currentBeat >= 2 && <><strong>{scenario.part} / {scenario.whole} = {percent}%</strong><span>part out of whole = percent</span></>}
        </div>
        <div className="percent-story-jar" aria-label={scenario.whole + ' ' + scenario.unit + ' in the ' + scenario.theme + ' story'}>
          <div className="percent-story-grid" style={{ '--grid-columns': scenario.gridColumns }}>
            {Array.from({ length: scenario.whole }, (_, index) => {
              const isFaded = isRevealBeat && index < scenario.part && revealState !== 'idle';
              return <span key={index} aria-hidden="true" className={'percent-story-item' + (isFaded ? ' is-faded' : '')} style={isFaded ? { '--item-delay': (index / scenario.part * 1100) + 'ms' } : undefined}>{scenario.icon}</span>;
            })}
          </div>
        </div>
      </div>
      <div className="explanation-nav-row percent-story-nav">
        <button className="percentages-btn percentages-btn-secondary" onClick={onBack}>← Back</button>
        <button className="percentages-btn" onClick={nextBeat} disabled={nextDisabled}>{actionLabel}</button>
      </div>
    </section>
  );
}

function Percy({ expression }) {
  return (
    <svg
      className={'percent-story-avatar is-' + expression}
      viewBox="0 0 100 92"
      overflow="visible"
      role="img"
      aria-label={'Percy looks ' + expression}
    >
      {/* Outer Hood (behind head/body) */}
      <circle cx="40" cy="36" r="24" fill="#FFD000" />

      {/* Inner Hood lining (depth shadow) */}
      <circle cx="40" cy="36" r="21" fill="#2D3748" />

      {/* Hoodie Body (shoulders and torso) */}
      <path
        d="M 12 92 V 76 C 12 64, 22 60, 40 60 C 58 60, 68 64, 68 76 V 92 Z"
        fill="#FFD000"
      />

      {/* Hoodie collar drawstrings */}
      <path d="M 36 63 L 36 73" fill="none" stroke="#2D3748" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="36" cy="74.5" r="1.5" fill="#2D3748" />
      <path d="M 44 63 L 44 75" fill="none" stroke="#2D3748" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="44" cy="76.5" r="1.5" fill="#2D3748" />

      {/* Face/Skin (peach) */}
      <circle cx="40" cy="42" r="19" fill="#FFD5B4" />

      {/* Rosy Cheek Circles */}
      <circle cx="28" cy="47" r="3" fill="#FF8A8A" fillOpacity="0.4" />
      <circle cx="52" cy="47" r="3" fill="#FF8A8A" fillOpacity="0.4" />

      {/* Hair: Short tousled dark hair */}
      <path
        d="M 19 38 C 17 22, 28 14, 34 20 C 38 12, 48 12, 51 20 C 58 16, 63 24, 61 38 C 57 34, 51 34, 48 38 C 44 32, 36 32, 33 39 C 28 34, 23 34, 19 38 Z"
        fill="#2D3748"
      />

      {/* ── NEUTRAL: relaxed open-palm gesture at chest/waist height ── */}
      {expression === 'neutral' && (
        <>
          <circle cx="31" cy="43" r="2.2" fill="#2D3748" />
          <circle cx="49" cy="43" r="2.2" fill="#2D3748" />
          <path d="M 27 37 Q 31 35 35 37" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <path d="M 45 37 Q 49 35 53 37" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <path d="M 35 50 Q 40 53 45 50" fill="none" stroke="#2D3748" strokeWidth="2.2" strokeLinecap="round" />
          {/* Arm: bent elbow — upper arm drops from shoulder, forearm turns right at mid-chest */}
          <path d="M 60 74 Q 62 80 65 76 Q 70 70 76 72" fill="none" stroke="#FFD000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Cuff */}
          <path d="M 73 69 L 77 74" fill="none" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
          {/* Open palm — rounded mitten, palm facing viewer */}
          <ellipse cx="80" cy="73" rx="5" ry="4" fill="#FFD5B4" />
          <path d="M 79 70 Q 82 68 84 71" fill="none" stroke="#FFD5B4" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* ── EXCITED: arm raised high, bent, cheering fist ── */}
      {expression === 'excited' && (
        <>
          <path d="M 28 44 Q 31.5 40.5 35 44" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 45 44 Q 48.5 40.5 52 44" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 27 35 Q 31.5 31.5 36 35" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <path d="M 44 35 Q 48.5 31.5 53 35" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <path d="M 33 49 C 33 58, 47 58, 47 49 Z" fill="#2D3748" />
          {/* Arm: shoots up from shoulder, bends at elbow near head */}
          <path d="M 58 78 Q 66 66 66 52" fill="none" stroke="#FFD000" strokeWidth="8" strokeLinecap="round" />
          <path d="M 62 54 L 67 52" fill="none" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="66" cy="47" r="5.5" fill="#FFD5B4" />
          <path d="M 63 47 Q 60 47 62 50" fill="none" stroke="#FFD5B4" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}

      {/* ── THINKING: hand up to chin, asymmetric face ── */}
      {expression === 'thinking' && (
        <>
          <circle cx="31" cy="43" r="2.2" fill="#2D3748" />
          <path d="M 45 44 Q 48.5 41.5 52 44" fill="none" stroke="#2D3748" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 27 38 Q 31 39 35 38" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <path d="M 44 32 Q 48.5 29 53 32" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <path d="M 35 51 Q 37.5 49 40 51 Q 42.5 53 45 51" fill="none" stroke="#2D3748" strokeWidth="2.2" strokeLinecap="round" />
          {/* Arm: bends inward, hand touches chin */}
          <path d="M 58 78 Q 52 72 45 62" fill="none" stroke="#FFD000" strokeWidth="8" strokeLinecap="round" />
          <path d="M 43 64 L 48 61" fill="none" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="43" cy="57" r="4.5" fill="#FFD5B4" />
          <path d="M 42 57 Q 39 53 43 53" fill="none" stroke="#FFD5B4" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

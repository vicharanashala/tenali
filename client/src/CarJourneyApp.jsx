/**
 * THE CAR JOURNEY (Feature CR — Curated Real-World Phenomenon Pathways)
 *
 * One long mathematical road trip, ages 6–16: sixteen stops from counting
 * wheels (addition) to reading the suspension's equation (differential
 * equations). Every stop teaches PURE MATH — the car is packaging and
 * motivation, never physics homework. Formulas are given; math is assessed.
 *
 * Design record: Remy_inputs/cr-phenomenon-pathways.md (+ 16 stop files).
 * Content calibrated against the live server generators so hand-authored
 * bands 1→3 match each topic's easy/medium/hard calibre.
 *
 * 100% client-side: questions are instantiated from parameterized templates
 * with fresh values every time; answers are computed and checked locally.
 * No server changes. Progress persists in localStorage.
 *
 * Rendered as a Tenali module via the modeMap registry; receives `onBack`
 * (and `setMode`, used by the Road License to open a Tenali card).
 */
import { useRef, useState } from 'react';
import './CarJourneyApp.css';
import { CjLicense, CjChallengeSet } from './CjChallenge';

/* ── Small helpers (cj-prefixed to stay collision-free) ────────────────── */

const cjRand = (min, max, step = 1) =>
  min + step * Math.floor(Math.random() * (Math.floor((max - min) / step) + 1));
const cjPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cjR2 = (x) => Math.round(x * 100) / 100;
const cjGcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };

/** Simplified fraction as a display string, e.g. 6/8 → "3/4", 8/4 → "2". */
function cjFracStr(num, den) {
  const g = cjGcd(num, den);
  const n = num / g, d = den / g;
  return d === 1 ? String(n) : `${n}/${d}`;
}

/** Mixed-number display string from an improper fraction, e.g. 11/4 → "2 3/4". */
function cjMixedStr(num, den) {
  const g = cjGcd(num, den);
  const n = num / g, d = den / g;
  const whole = Math.floor(n / d), rem = n % d;
  if (rem === 0) return String(whole);
  return whole === 0 ? `${rem}/${d}` : `${whole} ${rem}/${d}`;
}

/**
 * Check one answer part against the user's raw input.
 * Types: 'int' (exact), 'num' (tolerance), 'frac' (accepts n/d, mixed or
 * decimal), 'ratio' (accepts "a:b", must be simplified), 'text' (normalized
 * match against a list).
 */
function cjCheckPart(part, raw) {
  const s = String(raw ?? '').trim();
  if (!s) return false;
  if (part.type === 'text') {
    const norm = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return part.answers.includes(norm);
  }
  if (part.type === 'ratio') {
    const m = s.replace(/\s+/g, '').match(/^(\d+):(\d+)$/);
    return !!m && Number(m[1]) === part.a && Number(m[2]) === part.b;
  }
  const cleaned = s.replace(/[₹,$%]/g, '').replace(/−/g, '-').trim();
  let val = NaN;
  const mixed = cleaned.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  const frac = cleaned.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (mixed) {
    const w = Number(mixed[1]);
    val = w + (w < 0 ? -1 : 1) * (Number(mixed[2]) / Number(mixed[3]));
  } else if (frac && Number(frac[2]) !== 0) {
    val = Number(frac[1]) / Number(frac[2]);
  } else {
    val = parseFloat(cleaned);
  }
  if (isNaN(val)) return false;
  const tol = part.type === 'int' ? 1e-9 : (part.tol ?? 0.01);
  return Math.abs(val - part.answer) <= tol;
}

/* ── Content: 16 stops, hand-authored templates ────────────────────────────
 * Each template: { id, band (1–3), gen() → { prompt, parts, hint, explanation } }
 * Each part: { label?, unit?, type, answer | a/b | answers, tol?, display }
 * Fresh parameters on every gen() call — the same numbers never recur.
 * ─────────────────────────────────────────────────────────────────────── */

const CJ_TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25]];
const CJ_TRIPLES_BIG = [[6, 8, 10], [9, 12, 15], [5, 12, 13], [8, 15, 17]];

const CJ_STOPS = [
  /* ── Stop 1 · Addition · ages 6–8 ── */
  {
    key: 'addition', emoji: '🚗', age: '6–8',
    title: 'Counting up the journey',
    carQuestion: 'How many are we taking along?',
    skill: 'Multi-digit addition',
    bridge: "Every trip starts with counting. Cars joining the convoy, people hopping in, kilometres piling up on the odometer. Before the car can teach you anything else, you have to be able to add up what's in front of you.",
    role: 'You can now add up whatever the journey throws at you.',
    finale: 'How many are we taking along? You counted it all — seats, wheels, kilometres — and every count was an addition. The odometer even made you a promise: it adds today\'s trip on top of every trip ever. Hold that thought; it pays off at the very last stops.',
    templates: [
      { id: 'add-01', band: 1, gen() {
        const a = cjRand(2, 6), b = cjRand(1, 5), ans = a + b;
        return { prompt: `${a} cars are parked outside the school. ${b} more cars arrive. How many cars are there now?`,
          parts: [{ unit: 'cars', type: 'int', answer: ans, display: String(ans) }],
          hint: `Start at ${a} and count up ${b} more, one at a time.`,
          explanation: `${a} + ${b} = ${ans} cars. The car park just got busier!`,
          vis: { kind: 'count', op: '+', groups: [{ n: a, emoji: '🚗' }, { n: b, emoji: '🚗' }] } };
      } },
      { id: 'add-02', band: 1, gen() {
        const a = cjRand(1, 4), b = cjRand(1, 3), ans = a + b;
        return { prompt: `${a} people are sitting in the big car. ${b} more get in. How many people are in the car?`,
          parts: [{ unit: 'people', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Count the people already inside, then add the ones getting in.',
          explanation: `${a} + ${b} = ${ans} people. Everyone buckle up!`,
          vis: { kind: 'count', op: '+', groups: [{ n: a, emoji: '🧍' }, { n: b, emoji: '🧍' }] } };
      } },
      { id: 'add-03', band: 2, gen() {
        const a = cjRand(12, 48), b = cjRand(11, 39), ans = a + b;
        return { prompt: `Level 1 of the car park has ${a} cars. Level 2 has ${b} cars. How many cars in the whole car park?`,
          parts: [{ unit: 'cars', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Add the tens first, then the ones.',
          explanation: `${a} + ${b} = ${ans} cars. That's why the car park has so many floors!`,
          vis: { kind: 'blocks', op: '+', items: [{ label: 'Level 1', value: a }, { label: 'Level 2', value: b }] } };
      } },
      { id: 'add-04', band: 2, gen() {
        const a = cjRand(25, 75, 5), b = cjRand(20, 60, 5), ans = a + b;
        return { prompt: `The family drives ${a} km before lunch and ${b} km after lunch. How many km did they drive in all?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'The whole trip = the part before lunch + the part after lunch.',
          explanation: `${a} + ${b} = ${ans} km for the whole day's drive. Long trip — good thing they stopped for lunch!`,
          vis: { kind: 'blocks', op: '+', items: [{ label: 'Before lunch', value: a }, { label: 'After lunch', value: b }] } };
      } },
      { id: 'add-05', band: 3, gen() {
        const a = cjRand(45, 95, 5), b = cjRand(40, 90, 5), c = cjRand(35, 85, 5), ans = a + b + c;
        return { prompt: `A road trip takes three days. Day 1: ${a} km. Day 2: ${b} km. Day 3: ${c} km. How many km was the whole trip?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Add the first two days, then add the third day to that.',
          explanation: `${a} + ${b} + ${c} = ${ans} km over three days. Adding works the same no matter how many numbers line up.`,
          vis: { kind: 'blocks', op: '+', items: [{ label: 'Day 1', value: a }, { label: 'Day 2', value: b }, { label: 'Day 3', value: c }] } };
      } },
      { id: 'add-06', band: 3, gen() {
        const a = cjRand(120, 880, 10), b = cjRand(25, 95, 5), ans = a + b;
        return { prompt: `The odometer counts every km the car has ever driven. It shows ${a} km. Today's trip adds ${b} km. What will it show after the trip?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'The odometer never starts over — it just adds the new km on top.',
          explanation: `${a} + ${b} = ${ans} km. Remember the odometer — it comes back much later in the journey with a big secret.`,
          vis: { kind: 'blocks', op: '+', items: [{ label: 'Odometer now', value: a }, { label: "Today's trip", value: b }] } };
      } },
    ],
  },

  /* ── Stop 2 · Basic Arithmetic · ages 7–9 ── */
  {
    key: 'basicarith', emoji: '🅿️', age: '7–9',
    title: 'Filling up, counting down',
    carQuestion: "Who's in, who's out, and how far to go?",
    skill: '+, −, ×, ÷ fluency',
    bridge: 'A journey is not just adding. Seats empty out, kilometres count down, and snacks get shared in the back seat. Take away, share out — the car needs all four moves.',
    role: "You can take away, share out, and count what's left — all four moves.",
    finale: "Who's in, who's out, and how far to go? The journey breathes: people leave seats, cars leave the car park, kilometres fall away toward the beach. Addition alone couldn't track that — subtraction, multiplication and division finish the toolkit.",
    templates: [
      { id: 'bar-01', band: 1, gen() {
        const a = cjRand(5, 9), b = cjRand(1, 4), ans = a - b;
        return { prompt: `The big car has ${a} seats. ${b} people are sitting in it. How many seats are empty?`,
          parts: [{ unit: 'seats', type: 'int', answer: ans, display: String(ans) }],
          hint: "Take the people away from the seats. What's left over?",
          explanation: `${a} − ${b} = ${ans} empty seats. Room for more friends.`,
          vis: { kind: 'count', caption: `${a} seats — ${b} taken`, groups: [{ n: b, emoji: '🧍', label: 'taken' }, { n: a - b, emoji: '💺', label: 'empty' }] } };
      } },
      { id: 'bar-02', band: 1, gen() {
        const b = cjRand(2, 4), q = cjRand(2, 6), total = b * q;
        return { prompt: `${total} toy cars are shared equally between ${b} friends. How many cars does each friend get?`,
          parts: [{ unit: 'toy cars', type: 'int', answer: q, display: String(q) }],
          hint: 'Deal them out one at a time, like cards, until the pile is gone.',
          explanation: `${total} ÷ ${b} = ${q} each. Fair is fair.`,
          vis: { kind: 'share', total, people: b, emoji: '🚗', personEmoji: '🧑' } };
      } },
      { id: 'bar-03', band: 2, gen() {
        const a = cjRand(45, 99), b = cjRand(12, 40), ans = a - b;
        return { prompt: `The beach is ${a} km away. The car has already driven ${b} km. How many km are left?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Whole trip take away the part already done.',
          explanation: `${a} − ${b} = ${ans} km to go. The classic back-seat question, answered.`,
          vis: { kind: 'bars', unit: 'km', items: [{ label: 'Whole trip', value: a }, { label: 'Already driven', value: b }] } };
      } },
      { id: 'bar-04', band: 2, gen() {
        const a = cjRand(30, 90), b = cjRand(11, 29), ans = a - b;
        return { prompt: `The car park has ${a} cars in the morning. By lunch, ${b} cars have left. How many cars are still parked?`,
          parts: [{ unit: 'cars', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Start from the morning number and take away the leavers.',
          explanation: `${a} − ${b} = ${ans} cars still parked. The car park breathes in and out all day.`,
          vis: { kind: 'blocks', op: '−', items: [{ label: 'Morning', value: a }, { label: 'Left by lunch', value: b }] } };
      } },
      { id: 'bar-05', band: 3, gen() {
        const a = cjRand(40, 80), b = cjRand(15, 35), c = cjRand(10, 30), ans = a - b + c;
        return { prompt: `The car park had ${a} cars. Then ${b} cars left and ${c} new cars arrived. How many cars are there now?`,
          parts: [{ unit: 'cars', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Do it in two moves: first the leavers, then the arrivals.',
          explanation: `${a} − ${b} = ${a - b}, then ${a - b} + ${c} = ${ans} cars. Two small moves beat one big muddle.`,
          vis: { kind: 'blocks', caption: 'take away the leavers, then add the arrivals', items: [{ label: 'Start', value: a }, { label: '− left', value: b }, { label: '+ arrived', value: c }] } };
      } },
      { id: 'bar-06', band: 3, gen() {
        const b = cjRand(2, 5), q = cjRand(20, 90, 5), total = b * q;
        return { prompt: `A ${total} km trip is split equally over ${b} days. How many km does the car drive each day?`,
          parts: [{ unit: 'km', type: 'int', answer: q, display: String(q) }],
          hint: 'Share the whole trip fairly between the days.',
          explanation: `${total} ÷ ${b} = ${q} km a day. Long trips feel shorter when you cut them up.`,
          vis: { kind: 'sharebar', total, unit: 'km', shares: Array.from({ length: b }).map(() => 1) } };
      } },
    ],
  },

  /* ── Stop 3 · Multiplication · ages 8–10 ── */
  {
    key: 'multiply', emoji: '🛞', age: '8–10',
    title: 'Wheels come in fours',
    carQuestion: 'Why count one by one when the car counts in groups?',
    skill: 'Times tables 2–12',
    bridge: 'Cars are multiplication machines. Four wheels each. Rows of parking. Tolls that charge the same every time. Spot the group, count the groups — that\'s the whole trick.',
    role: 'You can count in groups — wheels, rows and tolls at a glance.',
    finale: 'Why count one by one when the car counts in groups? Because wheels come in 4s, parking comes in rows, and tolls charge the same every time. Spot the group, count the groups, multiply — you\'ll never count wheels one at a time again.',
    templates: [
      { id: 'mul-01', band: 1, gen() {
        const n = cjRand(2, 5), ans = 4 * n;
        return { prompt: `Every car has 4 wheels. There are ${n} cars in the driveway. How many wheels is that?`,
          parts: [{ unit: 'wheels', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Count in fours: 4, 8, 12… one jump per car.',
          explanation: `4 × ${n} = ${ans} wheels. Four at a time is faster than one at a time.`,
          vis: { kind: 'array', rows: n, rowLabel: '🚗', pattern: ['🛞', '🛞', '🛞', '🛞'], caption: 'one row of wheels per car' } };
      } },
      { id: 'mul-02', band: 1, gen() {
        const n = cjRand(2, 5), ans = 3 * n;
        return { prompt: `An auto-rickshaw has 3 wheels. ${n} autos are waiting at the stand. How many wheels in all?`,
          parts: [{ unit: 'wheels', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Count in threes, one jump per auto.',
          explanation: `3 × ${n} = ${ans} wheels. Different vehicle, same trick.`,
          vis: { kind: 'array', rows: n, rowLabel: '🛺', pattern: ['🛞', '🛞', '🛞'], caption: 'one row of wheels per auto' } };
      } },
      { id: 'mul-03', band: 2, gen() {
        const a = cjRand(6, 9), b = cjRand(4, 9), ans = a * b;
        return { prompt: `Each row of the car park holds ${a} cars. The car park has ${b} full rows. How many cars are parked?`,
          parts: [{ unit: 'cars', type: 'int', answer: ans, display: String(ans) }],
          hint: `One row has ${a}. Now count that ${b} times.`,
          explanation: `${a} × ${b} = ${ans} cars. Rows × row-size — the car park is a times table drawn on the ground.`,
          vis: { kind: 'array', rows: b, pattern: Array.from({ length: a }).map(() => '🚗'), caption: `${b} rows × ${a} cars per row` } };
      } },
      { id: 'mul-04', band: 2, gen() {
        const a = cjRand(6, 9), b = cjRand(3, 8), ans = a * b;
        return { prompt: `Every toll booth on the highway charges ₹${a}. The trip passes ${b} toll booths. How much toll money is that?`,
          parts: [{ unit: '₹', type: 'int', answer: ans, display: String(ans) }],
          hint: `Same charge, ${b} times over.`,
          explanation: `₹${a} × ${b} = ₹${ans}. Same-thing-again-and-again is exactly what × was invented for.`,
          vis: { kind: 'array', rows: b, pattern: ['🚧', `₹${a}`], caption: 'the same charge at every booth' } };
      } },
      { id: 'mul-05', band: 3, gen() {
        const a = cjRand(6, 12), b = cjRand(7, 10), ans = a * b;
        return { prompt: `A delivery van makes ${a} trips a day. Each trip is ${b} km. How many km does the van drive in a day?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: `One trip is ${b} km — the day is ${a} of those trips.`,
          explanation: `${a} × ${b} = ${ans} km a day. That van's odometer is climbing fast.`,
          vis: { kind: 'bars', unit: 'km', items: Array.from({ length: a }).map((_, i) => ({ label: `Trip ${i + 1}`, value: b })), caption: 'every trip is the same length' } };
      } },
      { id: 'mul-06', band: 3, gen() {
        const n = cjRand(6, 12), ans = n * 5;
        return { prompt: `${n} cars are going on a rally. Each car has 4 wheels on the road and 1 spare in the boot. How many wheels are going on the rally?`,
          parts: [{ unit: 'wheels', type: 'int', answer: ans, display: String(ans) }],
          hint: 'First work out how many wheels one car brings — road wheels and the spare together.',
          explanation: `Each car brings 4 + 1 = 5 wheels, so ${n} × 5 = ${ans} wheels. Group first, then multiply.`,
          vis: { kind: 'array', rows: n, rowLabel: '🚗', pattern: ['🛞', '🛞', '🛞', '🛞', '➕', '🔘'], caption: '4 road wheels + 1 spare per car' } };
      } },
    ],
  },

  /* ── Stop 4 · Decimals · ages 8–11 ── */
  {
    key: 'decimals', emoji: '⛽', age: '8–11',
    title: "The petrol pump's numbers",
    carQuestion: 'Why does the fuel pump never show whole numbers?',
    skill: 'Decimal +, −, ×',
    bridge: "Look at a petrol pump: 12.7 litres, ₹104.50 a litre. The car's money world lives between the whole numbers. Decimals are how you read it.",
    role: "You can read the petrol pump's decimal numbers and check its bill.",
    finale: 'Why does the pump never show whole numbers? Because fuel doesn\'t flow in whole litres and money doesn\'t stop at whole rupees — the car\'s world lives between the whole numbers. Decimals are how you read that world, and now the pump can\'t overcharge you.',
    templates: [
      { id: 'dec-01', band: 1, gen() {
        const a = cjRand(45, 95, 5) / 10, b = cjRand(25, 85, 5) / 10, ans = cjR2(a + b);
        return { prompt: `The car took ${a.toFixed(1)} litres of petrol in the morning and ${b.toFixed(1)} litres in the evening. How many litres in total?`,
          parts: [{ unit: 'litres', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(1) }],
          hint: 'Line up the decimal points, then add like normal.',
          explanation: `${a.toFixed(1)} + ${b.toFixed(1)} = ${ans.toFixed(1)} litres. The pump counts in halves and tenths — so do we.`,
          vis: { kind: 'bars', unit: 'L', items: [{ label: 'Morning', value: a }, { label: 'Evening', value: b }] } };
      } },
      { id: 'dec-02', band: 1, gen() {
        const a = cjRand(12, 48, 2) / 10, b = cjRand(4, 26, 2) / 10, ans = cjR2(a + b);
        return { prompt: `The engine oil bottle had ${a.toFixed(1)} litres. The mechanic poured in ${b.toFixed(1)} litres more. How much oil is that altogether?`,
          parts: [{ unit: 'litres', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(1) }],
          hint: 'Decimal points under each other, then add column by column.',
          explanation: `${a.toFixed(1)} + ${b.toFixed(1)} = ${ans.toFixed(1)} litres of oil. Small numbers matter to an engine.`,
          vis: { kind: 'bars', unit: 'L', items: [{ label: 'In the bottle', value: a }, { label: 'Poured in', value: b }] } };
      } },
      { id: 'dec-03', band: 2, gen() {
        const a = cjRand(32025, 48975, 25) / 100, ans = cjR2(500 - a);
        return { prompt: `The petrol bill is ₹${a.toFixed(2)}. You hand over a ₹500 note. How much change should you get?`,
          parts: [{ unit: '₹', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(2) }],
          hint: 'Change = what you paid with, minus the bill.',
          explanation: `500 − ${a.toFixed(2)} = ₹${ans.toFixed(2)}. Count your change before the car pulls away.`,
          vis: { kind: 'bars', unit: '₹', items: [{ label: 'You paid', value: 500 }, { label: 'The bill', value: a }], caption: 'the gap between the bars is your change' } };
      } },
      { id: 'dec-04', band: 2, gen() {
        const b = cjRand(10250, 11290, 10) / 100, a = cjRand(9610, 10190, 10) / 100, ans = cjR2(b - a);
        return { prompt: `Petrol costs ₹${a.toFixed(2)} per litre in the city and ₹${b.toFixed(2)} per litre on the highway. How much more does the highway pump charge per litre?`,
          parts: [{ unit: '₹ per litre', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(2) }],
          hint: 'Bigger price minus smaller price gives the gap.',
          explanation: `${b.toFixed(2)} − ${a.toFixed(2)} = ₹${ans.toFixed(2)} more per litre. That's why drivers fill up in the city.`,
          vis: { kind: 'bars', unit: '₹/L', max: Math.max(a, b), items: [{ label: 'City pump', value: a }, { label: 'Highway pump', value: b }], caption: 'look closely — the bars are nearly the same' } };
      } },
      { id: 'dec-05', band: 3, gen() {
        const p = cjRand(985, 1105, 5) / 10, n = cjRand(4, 12), ans = cjR2(p * n);
        return { prompt: `Petrol costs ₹${p.toFixed(1)} per litre. The car takes exactly ${n} litres. What is the bill?`,
          parts: [{ unit: '₹', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(2) }],
          hint: `Same price, ${n} times — multiply, then place the decimal point.`,
          explanation: `${p.toFixed(1)} × ${n} = ₹${ans}. One litre's price, scaled up to the whole tank — that's the pump's own arithmetic.`,
          vis: { kind: 'chips', n, emoji: '⛽', caption: `${n} litres — each one costs ₹${p.toFixed(1)}` } };
      } },
      { id: 'dec-06', band: 3, gen() {
        const a = cjRand(55, 95, 5) / 10, b = cjRand(45, 85, 5) / 10, p = cjRand(100, 110), ans = cjR2((a + b) * p);
        return { prompt: `On the trip the car fills up twice: ${a.toFixed(1)} litres, then ${b.toFixed(1)} litres. Petrol costs ₹${p} per litre. What did the fuel for the trip cost?`,
          parts: [{ unit: '₹', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(1) }],
          hint: 'First find the total litres, then multiply by the price of one litre.',
          explanation: `(${a.toFixed(1)} + ${b.toFixed(1)}) = ${(a + b).toFixed(1)} litres, × ₹${p} = ₹${ans}. Two small steps — add first, multiply second.`,
          vis: { kind: 'bars', unit: 'L', items: [{ label: 'Fill 1', value: a }, { label: 'Fill 2', value: b }], caption: `every litre costs ₹${p}` } };
      } },
    ],
  },

  /* ── Stop 5 · Fractions · ages 9–11 ── */
  {
    key: 'fractionadd', emoji: '🛢️', age: '9–11',
    title: 'Reading the fuel gauge',
    carQuestion: 'The gauge never says 37 litres — it says half a tank. Why?',
    skill: 'Fractions: add, subtract, LCD, mixed numbers',
    bridge: "The fuel gauge is a fraction, drawn as a dial. Quarter tank, half tank, three-quarters. To know if you'll make it home, you have to add and take away fractions — the gauge won't do it for you.",
    role: 'You can read the fuel gauge and add what it shows.',
    finale: 'Why does the gauge say half a tank instead of 37 litres? Because a driver needs proportion, not a litre count — half means the same thing in every car ever built. The gauge speaks in quarters and eighths, and you can now add and subtract what the needle says.',
    templates: [
      { id: 'fra-01', band: 1, gen() {
        const d = cjPick([4, 8]), n1 = cjRand(1, d - 2), n2 = cjRand(1, d - n1 - 1);
        const disp = cjFracStr(n1 + n2, d);
        return { prompt: `The tank was ${n1}/${d} full. At the pump you add another ${n2}/${d} of a tank. How full is the tank now? (Give a simplified fraction.)`,
          parts: [{ unit: 'of a tank', type: 'frac', tol: 0.001, answer: (n1 + n2) / d, display: disp }],
          hint: 'Same-size pieces — just add how many pieces you have. Then simplify if you can.',
          explanation: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d} = ${disp}. The gauge needle swings up by ${n2} marks.`,
          vis: { kind: 'tanks', tanks: [{ den: d, fills: [{ n: n1, cls: 'a' }, { n: n2, cls: 'b' }], label: `${n1}/${d} + ${n2}/${d}` }], caption: 'orange = already in the tank, blue = what you add' } };
      } },
      { id: 'fra-02', band: 1, gen() {
        const d = cjPick([4, 8]), n1 = cjRand(3, d - 1), n2 = cjRand(1, n1 - 1);
        const disp = cjFracStr(n1 - n2, d);
        return { prompt: `The tank was ${n1}/${d} full when the trip began. Now the gauge shows ${n2}/${d}. What fraction of a tank has the car used?`,
          parts: [{ unit: 'of a tank', type: 'frac', tol: 0.001, answer: (n1 - n2) / d, display: disp }],
          hint: 'Start reading minus end reading — same-size pieces again.',
          explanation: `${n1}/${d} − ${n2}/${d} = ${disp} of a tank burned on the road.`,
          vis: { kind: 'tanks', tanks: [{ den: d, fills: [{ n: n2, cls: 'a' }, { n: n1 - n2, cls: 'dim' }], label: `was ${n1}/${d}, now ${n2}/${d}` }], caption: 'orange = still in the tank, faded = burned on the road' } };
      } },
      { id: 'fra-03', band: 2, gen() {
        const [d1, d2] = cjPick([[2, 3], [3, 4], [4, 6], [2, 8], [4, 8]]);
        const num = d2 + d1, den = d1 * d2, disp = cjFracStr(num, den);
        return { prompt: `The morning drive used 1/${d1} of a tank. The afternoon drive used 1/${d2}. What fraction of a tank did the whole day use?`,
          parts: [{ unit: 'of a tank', type: 'frac', tol: 0.001, answer: num / den, display: disp }],
          hint: 'The pieces are different sizes. Find a size both fit into first (the LCD), then add.',
          explanation: `1/${d1} + 1/${d2} = ${disp} of a tank. Different marks on the gauge only add up after you make the pieces match.`,
          vis: { kind: 'tanks', tanks: [{ den: d1, fills: [{ n: 1, cls: 'a' }], label: `morning 1/${d1}` }, { den: d2, fills: [{ n: 1, cls: 'b' }], label: `afternoon 1/${d2}` }], caption: 'same tank, cut into different-sized pieces — that is the whole difficulty' } };
      } },
      { id: 'fra-04', band: 2, gen() {
        const [d1, d2] = cjPick([[3, 4], [4, 6], [2, 8], [3, 6]]);
        const n1 = d1 >= 4 ? cjRand(1, 2) : 1;
        const num = n1 * d2 + d1, den = d1 * d2, disp = cjFracStr(num, den);
        return { prompt: `Reaching the hill station needs ${n1}/${d1} of a tank. Coming back needs 1/${d2}. What fraction of a tank does the whole trip need?`,
          parts: [{ unit: 'of a tank', type: 'frac', tol: 0.001, answer: num / den, display: disp }],
          hint: 'Make the pieces the same size before adding — then you can compare it to a full tank.',
          explanation: `${n1}/${d1} + 1/${d2} = ${disp}. Less than 1 means one tank gets you there and back.`,
          vis: { kind: 'tanks', tanks: [{ den: d1, fills: [{ n: n1, cls: 'a' }], label: `there: ${n1}/${d1}` }, { den: d2, fills: [{ n: 1, cls: 'b' }], label: `back: 1/${d2}` }], caption: 'will both trips fit inside one full tank?' } };
      } },
      { id: 'fra-05', band: 3, gen() {
        const d1 = cjPick([2, 4, 8]);
        const d2 = cjPick([3, 4, 6].filter((d) => d !== d1));
        const w1 = cjRand(1, 3), w2 = cjRand(1, 3);
        const n1 = cjRand(1, d1 - 1), n2 = cjRand(1, d2 - 1);
        const num = (w1 + w2) * d1 * d2 + n1 * d2 + n2 * d1, den = d1 * d2;
        const disp = cjMixedStr(num, den);
        return { prompt: `For the desert rally, the crew packs ${w1} ${n1}/${d1} cans of fuel in the truck and ${w2} ${n2}/${d2} cans in the car. How many cans of fuel are they carrying in total? (Mixed number, e.g. "3 1/2".)`,
          parts: [{ unit: 'cans', type: 'frac', tol: 0.001, answer: num / den, display: disp }],
          hint: 'Add the whole cans first, then the part-cans — carry over if the parts make more than one can.',
          explanation: `Wholes: ${w1} + ${w2}; parts: ${n1}/${d1} + ${n2}/${d2}. Together: ${disp} cans strapped down for the rally.`,
          vis: { kind: 'cans', groups: [{ whole: w1, num: n1, den: d1, label: 'truck' }, { whole: w2, num: n2, den: d2, label: 'car' }] } };
      } },
      { id: 'fra-06', band: 3, gen() {
        const d1 = cjPick([2, 4]);
        const d2 = cjPick([3, 6, 8].filter((d) => d !== d1));
        const w1 = cjRand(3, 5), w2 = cjRand(1, w1 - 1);
        const n1 = cjRand(1, d1 - 1), n2 = cjRand(1, d2 - 1);
        const num = (w1 - w2) * d1 * d2 + n1 * d2 - n2 * d1, den = d1 * d2;
        const disp = cjMixedStr(num, den);
        return { prompt: `The crew started with ${w1} ${n1}/${d1} cans of fuel. The first rally leg used ${w2} ${n2}/${d2} cans. How much fuel is left? (Mixed number or fraction.)`,
          parts: [{ unit: 'cans', type: 'frac', tol: 0.001, answer: num / den, display: disp }],
          hint: 'Turn both into improper fractions over the LCD, subtract, then bring back the wholes.',
          explanation: `${w1} ${n1}/${d1} − ${w2} ${n2}/${d2} = ${disp} cans left. Enough for the next leg? That's tomorrow's question.`,
          vis: { kind: 'cans', groups: [{ whole: w1, num: n1, den: d1, label: 'started with' }, { whole: w2, num: n2, den: d2, label: 'used' }] } };
      } },
    ],
  },

  /* ── Stop 6 · Ratio · ages 10–12 ── */
  {
    key: 'ratio', emoji: '⚙️', age: '10–12',
    title: 'Gears are just ratios you can touch',
    carQuestion: 'Why does first gear roar and fifth gear whisper?',
    skill: 'Ratio: simplify, divide, direct proportion',
    bridge: 'Open a gearbox and you find mathematics made of metal: one gear with 36 teeth turning one with 12. Three turns in, one turn out — 3:1. Every gear change is the driver picking a new ratio.',
    role: 'You can read gears and fuel economy as ratios.',
    finale: 'Why does first gear roar and fifth gear whisper? First gear trades speed for force — around 3 engine turns for 1 wheel turn, a 3:1 ratio. Fifth runs near 1:1 and cruises. Every gear change is the driver choosing a new ratio, in metal.',
    templates: [
      { id: 'rat-01', band: 1, gen() {
        const g = cjRand(2, 8), m = cjRand(2, 9);
        let n = cjRand(1, 5);
        while (cjGcd(m, n) !== 1) n = cjRand(1, 5);
        const a = g * m, b = g * n;
        return { prompt: `The engine gear has ${a} teeth. The wheel gear has ${b} teeth. Write the gear ratio ${a} : ${b} in its simplest form (like "3:2").`,
          parts: [{ type: 'ratio', a: m, b: n, display: `${m}:${n}` }],
          hint: 'Find the biggest number that divides into both teeth-counts.',
          explanation: `${a} : ${b} = ${m} : ${n} (divide both by ${g}). The engine turns ${m} times for every ${n} turns of the wheel.`,
          vis: { kind: 'gears', a, b } };
      } },
      { id: 'rat-02', band: 1, gen() {
        const g = cjRand(2, 6), m = cjRand(3, 10), a = g * m, b = g;
        return { prompt: `Grandpa's two-stroke scooter needs petrol and oil mixed ${a} : ${b}. Simplify this mixing ratio.`,
          parts: [{ type: 'ratio', a: m, b: 1, display: `${m}:1` }],
          hint: "Divide both sides by the same number until you can't any more.",
          explanation: `${a} : ${b} = ${m} : 1. For every ${m} cups of petrol, exactly one cup of oil — the engine's recipe.`,
          vis: { kind: 'bars', items: [{ label: 'Petrol', value: a }, { label: 'Oil', value: b }], caption: 'how many times does the oil bar fit into the petrol bar?' } };
      } },
      { id: 'rat-03', band: 2, gen() {
        const ra = cjRand(1, 7);
        let rb = cjRand(1, 7);
        while (rb === ra) rb = cjRand(1, 7);
        const u = cjRand(20, 90, 10), total = (ra + rb) * u;
        return { prompt: `Two families share a road trip. They agree to split the ₹${total} fuel bill in the ratio ${ra} : ${rb} (by how far each family rode). How much does each family pay?`,
          parts: [
            { label: `Family A (${ra} shares)`, unit: '₹', type: 'int', answer: ra * u, display: String(ra * u) },
            { label: `Family B (${rb} shares)`, unit: '₹', type: 'int', answer: rb * u, display: String(rb * u) },
          ],
          hint: 'First find what one share is worth: divide the bill by the total number of shares.',
          explanation: `${ra} + ${rb} = ${ra + rb} shares; ₹${total} ÷ ${ra + rb} = ₹${u} a share. So ₹${ra * u} and ₹${rb * u}. Fair by the kilometre.`,
          vis: { kind: 'sharebar', total, unit: '₹', shares: [ra, rb] } };
      } },
      { id: 'rat-04', band: 2, gen() {
        const ra = cjRand(1, 5), rb = cjRand(1, 5), rc = cjRand(1, 5);
        const u = cjRand(10, 60, 5), total = (ra + rb + rc) * u;
        return { prompt: `Three friends drive ${total} km in one day, taking turns in the ratio ${ra} : ${rb} : ${rc}. How many km does each friend drive?`,
          parts: [
            { label: `Friend 1 (${ra} shares)`, unit: 'km', type: 'int', answer: ra * u, display: String(ra * u) },
            { label: `Friend 2 (${rb} shares)`, unit: 'km', type: 'int', answer: rb * u, display: String(rb * u) },
            { label: `Friend 3 (${rc} shares)`, unit: 'km', type: 'int', answer: rc * u, display: String(rc * u) },
          ],
          hint: 'Count the total shares first, then work out one share, then hand the shares out.',
          explanation: `${ra + rb + rc} shares → ${u} km each share → ${ra * u} / ${rb * u} / ${rc * u} km. Everyone drove their share.`,
          vis: { kind: 'sharebar', total, unit: 'km', shares: [ra, rb, rc] } };
      } },
      { id: 'rat-05', band: 3, gen() {
        const u = cjRand(1, 2), q1 = cjRand(40, 120, 20);
        let q2 = cjRand(60, 200, 20);
        while (q2 === q1) q2 = cjRand(60, 200, 20);
        const v = (u * q1) / 10, ans = (u * q2) / 10;
        return { prompt: `The car uses ${v} litres of petrol for ${q1} km. At the same rate, how many litres does it need for ${q2} km?`,
          parts: [{ unit: 'litres', type: 'num', tol: 0.01, answer: ans, display: String(ans) }],
          hint: `First find the litres for 10 km (or for 1 km) — then scale up to ${q2}.`,
          explanation: `${v} L ÷ ${q1} km = ${u / 10} L per km → × ${q2} = ${ans} litres. This is the sum every driver does before a long trip.`,
          vis: { kind: 'bars', unit: 'km', items: [{ label: `${v} L gets you`, value: q1 }, { label: '? L gets you', value: q2 }], caption: 'same car, same rate — scale the litres the way the km scale' } };
      } },
      { id: 'rat-06', band: 3, gen() {
        const u = cjRand(10, 20, 2), v = cjRand(3, 8);
        let v2 = cjRand(4, 10);
        while (v2 === v) v2 = cjRand(4, 10);
        const q1 = u * v, temp = cjRand(82, 96, 2), ans = u * v2;
        return { prompt: `The trip meter shows the car has done ${q1} km using ${v} litres. The dashboard also shows the engine at ${temp}°C. How far can the car go on ${v2} litres at the same rate?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Find the km one litre gives. The engine temperature is on the dashboard — but is it in the question?',
          explanation: `${q1} ÷ ${v} = ${u} km per litre → × ${v2} = ${ans} km. The temperature gauge was watching you, not helping you.`,
          vis: { kind: 'bars', unit: '', items: [{ label: 'km driven', value: q1 }, { label: 'litres used', value: v }], caption: 'notice: the engine temperature is not in this picture — it was never part of the math' } };
      } },
    ],
  },

  /* ── Stop 7 · Percentages · ages 10–13 ── */
  {
    key: 'percent', emoji: '🔋', age: '10–13',
    title: 'The battery speaks in percent',
    carQuestion: 'The electric car says 40% — but 40% of what?',
    skill: 'Percent: find, increase/decrease, reverse',
    bridge: 'The fuel gauge from Stop 5 spoke in fractions. The new electric car speaks in percent — same idea, out of 100 instead. Batteries, discounts, price rises: the car\'s world runs on %.',
    role: "You can speak the battery's language — percent.",
    finale: '40% of what? Of every 100 parts the battery could hold — that\'s all percent means. It\'s the fuel gauge\'s fraction wearing a new uniform: 25% and ¼ are the same needle position. You now read both dials, and reverse a discount besides.',
    templates: [
      { id: 'pct-01', band: 1, gen() {
        const base = cjRand(120, 320, 20), ans = base / 2;
        return { prompt: `The electric car's battery holds ${base} km of driving when full. It is at 50%. How many km can it drive right now?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: '50% is exactly half.',
          explanation: `50% of ${base} = ${ans} km. Half the battery, half the range.`,
          vis: { kind: 'battery', segs: [{ pct: 50, cls: 'a' }], caption: `the full battery = ${base} km of driving` } };
      } },
      { id: 'pct-02', band: 1, gen() {
        const base = cjRand(32, 60, 4), ans = base / 4;
        return { prompt: `The tank holds ${base} litres when full. The gauge shows 25%. How many litres are in the tank?`,
          parts: [{ unit: 'litres', type: 'int', answer: ans, display: String(ans) }],
          hint: '25% is a quarter — the same quarter the old gauge showed as ¼.',
          explanation: `25% of ${base} = ${ans} litres. 25% and ¼ are the same needle position, two languages.`,
          vis: { kind: 'tanks', tanks: [{ den: 4, fills: [{ n: 1, cls: 'a' }], label: '25% = 1/4' }], caption: `the full tank = ${base} litres — 25% is Stop 5's ¼ in new clothes` } };
      } },
      { id: 'pct-03', band: 2, gen() {
        const p = cjPick([20, 30]), base = cjRand(1200, 4800, 100), ans = (base * (100 - p)) / 100;
        return { prompt: `A tyre costs ₹${base}. The shop announces a ${p}% discount. What is the new price of the tyre?`,
          parts: [{ unit: '₹', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Work out the discount amount first, then take it off the price.',
          explanation: `${p}% of ${base} = ${(base * p) / 100} off → ₹${ans}. Always do the pump-side math before the shop does it for you.`,
          vis: { kind: 'bars', unit: '₹', items: [{ label: 'Full price', value: base }, { label: `${p}% discount`, value: (base * p) / 100 }], caption: 'take the small bar off the big one' } };
      } },
      { id: 'pct-04', band: 2, gen() {
        const p = cjPick([5, 10]), base = cjRand(100, 110, 2), ans = cjR2((base * (100 + p)) / 100);
        return { prompt: `Petrol costs ₹${base} per litre. The price rises by ${p}%. What is the new price per litre?`,
          parts: [{ unit: '₹ per litre', type: 'num', tol: 0.01, answer: ans, display: ans.toFixed(2) }],
          hint: 'Find the rise, then add it on top of the old price.',
          explanation: `${base} + ${p}% = ₹${ans}. A few percent per litre becomes real money over a year of driving.`,
          vis: { kind: 'bars', unit: '₹', items: [{ label: 'Old price', value: base }, { label: `The rise (${p}%)`, value: cjR2((base * p) / 100) }], caption: 'the rise goes ON TOP of the old price' } };
      } },
      { id: 'pct-05', band: 3, gen() {
        const p1 = cjPick([90, 100]), p2 = cjRand(15, 35, 5), p3 = cjRand(10, 30, 5), base = cjRand(200, 400, 20);
        const left = p1 - p2 - p3, ans = (left * base) / 100;
        return { prompt: `The battery was at ${p1}%. The morning drive used ${p2} percentage points, and the afternoon used ${p3} more. The full battery gives ${base} km. How many km of range are left?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'First find what % is left, then take that % of the full range.',
          explanation: `${p1} − ${p2} − ${p3} = ${left}% left → of ${base} km = ${ans} km. Every EV driver runs this exact sum at 4 pm.`,
          vis: { kind: 'battery', segs: [{ pct: left, cls: 'a' }, { pct: p2, cls: 'dim' }, { pct: p3, cls: 'dim' }], caption: `orange = still charged, faded = used · full battery = ${base} km` } };
      } },
      { id: 'pct-06', band: 3, gen() {
        const orig = cjRand(1500, 4500, 250), sale = (orig * 80) / 100;
        return { prompt: `After a 20% discount, a tyre costs ₹${sale}. What was the price before the discount?`,
          parts: [{ unit: '₹', type: 'int', answer: orig, display: String(orig) }],
          hint: 'The sale price is 80% of the original — so one percent is sale ÷ 80.',
          explanation: `₹${sale} is 80% → 1% = ₹${sale / 80} → 100% = ₹${orig}. Reverse percentage: walking the discount backwards.`,
          vis: { kind: 'battery', segs: [{ pct: 80, cls: 'a' }, { pct: 20, cls: 'q' }], caption: `the orange 80% = ₹${sale} · the WHOLE bar (100%) is the price you want` } };
      } },
    ],
  },

  /* ── Stop 8 · Speed, Distance, Time · ages 10–13 ── */
  {
    key: 'sdt', emoji: '⏱️', age: '10–13',
    title: 'The triangle on the dashboard',
    carQuestion: '"Are we there yet?" has a formula.',
    skill: 'd = s × t in all three directions; average speed',
    bridge: 'Speed, distance, time — the car lives inside this triangle. Know any two and the third is yours. This is the single most useful piece of math a driver owns.',
    role: 'You own the speed–distance–time triangle, all three corners.',
    finale: '"Are we there yet?" has a formula: time left = distance left ÷ speed. Know any two corners of the d = s × t triangle and the third is yours — including the trap: average speed is total distance over total time, never the average of the speeds.',
    templates: [
      { id: 'sdt-01', band: 1, gen() {
        const s = cjRand(40, 80, 10), t = cjRand(2, 5), ans = s * t;
        return { prompt: `The car cruises at ${s} km/h for ${t} hours on the highway. How far does it travel?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Distance = speed × time.',
          explanation: `${s} × ${t} = ${ans} km. Every hour adds another ${s} km — that's all "speed" means.`,
          vis: { kind: 'dst', s: `${s} km/h`, t: `${t} h`, unknown: 'd' } };
      } },
      { id: 'sdt-02', band: 1, gen() {
        const s = cjRand(40, 70, 10), t = cjRand(2, 5), d = s * t;
        return { prompt: `Grandma's house is ${d} km away. The car holds a steady ${s} km/h. How many hours will the trip take?`,
          parts: [{ unit: 'hours', type: 'int', answer: t, display: String(t) }],
          hint: 'Time = distance ÷ speed.',
          explanation: `${d} ÷ ${s} = ${t} hours. Now you can answer from the back seat before the driver does.`,
          vis: { kind: 'dst', d: `${d} km`, s: `${s} km/h`, unknown: 't' } };
      } },
      { id: 'sdt-03', band: 2, gen() {
        const s = cjRand(35, 85, 5), t = cjRand(2, 6), d = s * t;
        return { prompt: `The car covers ${d} km in ${t} hours. What was its average speed?`,
          parts: [{ unit: 'km/h', type: 'int', answer: s, display: String(s) }],
          hint: 'Speed = distance ÷ time.',
          explanation: `${d} ÷ ${t} = ${s} km/h. The third corner of the triangle — you now own all three.`,
          vis: { kind: 'dst', d: `${d} km`, t: `${t} h`, unknown: 's' } };
      } },
      { id: 'sdt-04', band: 2, gen() {
        const s = cjPick([24, 36, 48, 60]), m = cjPick([10, 15, 20, 30]), ans = (s * m) / 60;
        return { prompt: `The school run takes ${m} minutes at a steady ${s} km/h. How far away is the school?`,
          parts: [{ unit: 'km', type: 'int', answer: ans, display: String(ans) }],
          hint: `Minutes must become hours first: ${m} minutes = ${m}/60 of an hour.`,
          explanation: `${s} × ${m}/60 = ${ans} km. Real trips are in minutes — the formula still works once the units agree.`,
          vis: { kind: 'dst', s: `${s} km/h`, t: `${m} min`, unknown: 'd', caption: 'trap: the units disagree — minutes must become hours first' } };
      } },
      { id: 'sdt-05', band: 3, gen() {
        const s1 = cjRand(60, 80, 10), t1 = cjRand(1, 3), s2 = cjRand(20, 40, 10), t2 = cjRand(1, 3);
        const d1 = s1 * t1, d2 = s2 * t2, ans = cjR2((d1 + d2) / (t1 + t2));
        return { prompt: `The car does ${d1} km in ${t1} hour${t1 > 1 ? 's' : ''} on the highway, then ${d2} km in ${t2} hour${t2 > 1 ? 's' : ''} through town. What was its average speed for the whole trip? (2 d.p. if needed.)`,
          parts: [{ unit: 'km/h', type: 'num', tol: 0.05, answer: ans, display: String(ans) }],
          hint: 'Average speed = total distance ÷ total time — NOT the average of the two speeds.',
          explanation: `(${d1} + ${d2}) ÷ (${t1} + ${t2}) = ${ans} km/h. Notice it's closer to the slower leg — the town leg ate more of the clock per km.`,
          vis: { kind: 'bars', unit: 'km', items: [{ label: `Highway (${t1} h)`, value: d1 }, { label: `Town (${t2} h)`, value: d2 }], caption: 'average speed = ALL the km ÷ ALL the hours — never the average of the two speeds' } };
      } },
      { id: 'sdt-06', band: 3, gen() {
        const s1 = cjPick([40, 50, 60]), s2 = 2 * s1, g = cjRand(1, 3);
        return { prompt: `A truck passes the milestone at ${s1} km/h. A car passes the same milestone at ${s2} km/h, ${g} hour${g > 1 ? 's' : ''} later. How many hours after passing the milestone does the car catch the truck? (The truck's speed stays steady.)`,
          parts: [{ unit: 'hours', type: 'int', answer: g, display: String(g) }],
          hint: `When the car starts, the truck is already ${g} × ${s1} km ahead. The car closes the gap at (car speed − truck speed) km every hour.`,
          explanation: `Head start: ${g * s1} km. Closing speed: ${s2} − ${s1} = ${s1} km/h. Catch-up time: ${g} hours. Chasing is just division.`,
          vis: { kind: 'meet', mode: 'chase', aLabel: `car ${s2} km/h`, bLabel: `truck ${s1} km/h`, gapLabel: `head start: ${g * s1} km`, caption: `the gap closes at ${s2} − ${s1} = ${s1} km every hour` } };
      } },
    ],
  },

  /* ── Stop 9 · Circles & Circular Measure · ages 11–14 ── */
  {
    key: 'mensur', alsoTopics: ['circmeasure'], emoji: '⭕', age: '11–14',
    title: 'How the car measures the road',
    carQuestion: 'No ruler touches the road — so how does the car know how far it went?',
    skill: 'Circumference, arc length, sector area',
    bridge: 'The car measures distance with a circle: every turn of the wheel lays one circumference on the road. The odometer is literally counting wheel-turns. Circles are the car\'s ruler.',
    role: 'You can turn wheel-turns into kilometres — you know how the odometer counts.',
    finale: 'How does the car know how far it went, with no ruler touching the road? It counts wheel-turns: every full turn lays exactly one circumference of rubber on the tarmac. Distance = circumference × turns — the odometer is a circle doing multiplication, all day long.',
    templates: [
      { id: 'cir-01', band: 1, gen() {
        const r = cjRand(28, 40, 2), ans = cjR2(2 * Math.PI * r);
        return { prompt: `A car wheel has a radius of ${r} cm. How far does the car move in ONE full turn of the wheel? (2 d.p., π ≈ 3.14159)`,
          parts: [{ unit: 'cm', type: 'num', tol: 0.5, answer: ans, display: ans.toFixed(2) }],
          hint: 'One full turn lays one circumference on the road: C = 2πr.',
          explanation: `2π × ${r} = ${ans.toFixed(2)} cm per turn. The wheel prints its own circumference onto the road, turn after turn.`,
          vis: { kind: 'circle', label: `r = ${r} cm`, caption: 'C = 2πr — the dashed line is one full turn laid on the road' } };
      } },
      { id: 'cir-02', band: 1, gen() {
        const d = cjRand(80, 110, 5), ans = cjR2(Math.PI * d);
        return { prompt: `A lorry wheel is ${d} cm across (its diameter). What is its circumference? (2 d.p.)`,
          parts: [{ unit: 'cm', type: 'num', tol: 0.5, answer: ans, display: ans.toFixed(2) }],
          hint: "With the diameter, it's even shorter: C = πd.",
          explanation: `π × ${d} = ${ans.toFixed(2)} cm. Lorry wheels are taller than most students — one turn is over 2½ metres.`,
          vis: { kind: 'circle', d: true, label: `d = ${d} cm`, caption: 'the line runs all the way across — that is the diameter: C = πd' } };
      } },
      { id: 'cir-03', band: 2, gen() {
        const c = cjPick([1.8, 2.0, 2.2]), n = cjRand(500, 2000, 100), ans = cjR2(c * n);
        return { prompt: `A wheel's circumference is ${c} metres. On the way to school it turns ${n} times. How far is the school?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: `Each turn = ${c} m of road. Multiply by the number of turns.`,
          explanation: `${c} × ${n} = ${ans} m. This multiplication IS the odometer — it does this sum all day long.`,
          vis: { kind: 'circle', label: `C = ${c} m`, caption: `every turn prints ${c} m of road — and the wheel turns ${n} times` } };
      } },
      { id: 'cir-04', band: 2, gen() {
        const c = cjPick([1.8, 2.0, 2.2]), n = cjRand(400, 1500, 100), d = cjR2(c * n);
        return { prompt: `A wheel's circumference is ${c} metres. The trip meter shows the car moved ${d} metres. How many times did the wheel turn?`,
          parts: [{ unit: 'turns', type: 'int', answer: n, display: String(n) }],
          hint: "Turns = distance ÷ one turn's worth of road.",
          explanation: `${d} ÷ ${c} = ${n} turns. Reading the odometer backwards — division undoes the wheel's multiplication.`,
          vis: { kind: 'circle', label: `C = ${c} m`, caption: `${d} m of road ÷ ${c} m per turn = ? turns` } };
      } },
      { id: 'cir-05', band: 3, gen() {
        const r = cjRand(40, 60, 5), deg = cjPick([90, 120, 150, 180]);
        const ans = cjR2(0.5 * r * r * ((deg * Math.PI) / 180));
        return { prompt: `A windscreen wiper blade reaches ${r} cm from its pivot and sweeps through ${deg}°. What area of windscreen does it wipe? (2 d.p. — remember θ must be in radians for A = ½r²θ)`,
          parts: [{ unit: 'cm²', type: 'num', tol: 0.5, answer: ans, display: ans.toFixed(2) }],
          hint: `Two steps: turn ${deg}° into radians first, then use A = ½r²θ.`,
          explanation: `θ = ${deg}π/180 rad → ½ × ${r}² × θ = ${ans.toFixed(2)} cm². Every rainy day, the wiper draws this sector for you.`,
          vis: { kind: 'sector', r, deg, caption: 'the wiper sweeps the shaded sector: A = ½r²θ (θ in radians!)' } };
      } },
      { id: 'cir-06', band: 3, gen() {
        const r = cjRand(18, 22), deg = cjPick([90, 180, 270]);
        const ans = cjR2(r * ((deg * Math.PI) / 180));
        return { prompt: `A steering wheel has radius ${r} cm. For a sharp turn the driver's hand rotates it through ${deg}°. How far does the hand travel along the wheel's rim? (2 d.p.)`,
          parts: [{ unit: 'cm', type: 'num', tol: 0.5, answer: ans, display: ans.toFixed(2) }],
          hint: 'Arc length = rθ, with θ in radians. Convert the degrees first.',
          explanation: `${r} × ${deg}π/180 = ${ans.toFixed(2)} cm of rim under the hand. A "quarter turn" of the wheel is a real, measurable arc.`,
          vis: { kind: 'sector', r, deg, arcOnly: true, caption: 'the hand travels along the thick arc: length = rθ (θ in radians)' } };
      } },
    ],
  },

  /* ── Stop 10 · Pythagoras · ages 12–14 ── */
  {
    key: 'pythag', emoji: '📐', age: '12–14',
    title: 'Ramps, diagonals, and the shortest way',
    carQuestion: 'The car park sign says the ramp is longer than the floor it climbs. Why?',
    skill: "Pythagoras' theorem, incl. 3D",
    bridge: 'A ramp is a triangle you can drive on: the floor it crosses, the height it climbs, and the ramp itself. Pythagoras is the 2,500-year-old rule that ties the three together.',
    role: 'You can find the third side of any right triangle the road builds.',
    finale: 'Why is the ramp longer than the floor it climbs? Because it spans the floor AND the climb at once — it\'s the hypotenuse, and a² + b² = c² says the hypotenuse always wins. The car park sign was quoting Pythagoras the whole time.',
    templates: [
      { id: 'pyt-01', band: 1, gen() {
        const t = cjPick(CJ_TRIPLES), k = cjRand(1, 2);
        const a = t[1] * k, b = t[0] * k, ans = t[2] * k;
        return { prompt: `A car-park ramp climbs ${b} m while crossing ${a} m of floor. How long is the ramp itself?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Ramp² = floor² + climb². Square, add, square-root.',
          explanation: `√(${a}² + ${b}²) = ${ans} m. The ramp is always the longest side — you drive the hypotenuse.`,
          vis: { kind: 'rtri', base: a, rise: b, baseLabel: `floor ${a} m`, riseLabel: `climb ${b} m`, hypLabel: 'ramp = ?' } };
      } },
      { id: 'pyt-02', band: 1, gen() {
        const t = cjPick(CJ_TRIPLES_BIG), k = cjRand(1, 2);
        const a = t[0] * k, b = t[1] * k, ans = t[2] * k;
        return { prompt: `The car park is a rectangle, ${a} m by ${b} m. You walk from one corner straight to the opposite corner. How far do you walk?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: "The diagonal is the hypotenuse of the rectangle's triangle.",
          explanation: `√(${a}² + ${b}²) = ${ans} m. Corner-to-corner beats walking two sides.`,
          vis: { kind: 'rtri', base: a, rise: b, baseLabel: `${a} m`, riseLabel: `${b} m`, hypLabel: 'diagonal = ?', caption: 'the rectangle cut corner-to-corner is a right triangle' } };
      } },
      { id: 'pyt-03', band: 2, gen() {
        const t = cjPick(CJ_TRIPLES);
        const c = t[2], a = t[1], ans = t[0];
        return { prompt: `A loading ramp is ${c} m long and its foot is ${a} m from the truck. How high is the truck's deck?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Rearrange: climb² = ramp² − floor². Subtract before you square-root.',
          explanation: `√(${c}² − ${a}²) = ${ans} m up to the deck. Same rule, run backwards.`,
          vis: { kind: 'rtri', base: a, rise: ans, baseLabel: `floor ${a} m`, riseLabel: 'deck = ?', hypLabel: `ramp ${c} m`, caption: 'this time the hypotenuse is KNOWN — subtract before you square-root' } };
      } },
      { id: 'pyt-04', band: 2, gen() {
        const t = cjPick([CJ_TRIPLES[0], CJ_TRIPLES[1], CJ_TRIPLES[2]]);
        const c = t[2], b = t[1], ans = t[0];
        return { prompt: `A ${c} m tow rope runs from a breakdown truck's crane top down to a car's tow hook. The car sits ${b} m behind the truck. How high is the crane top above the hook?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'The rope is the hypotenuse. You have it and one leg — find the other.',
          explanation: `√(${c}² − ${b}²) = ${ans} m. Every taut rope over a distance is a hypotenuse in disguise.`,
          vis: { kind: 'rtri', base: b, rise: ans, baseLabel: `${b} m behind`, riseLabel: 'height = ?', hypLabel: `rope ${c} m` } };
      } },
      { id: 'pyt-05', band: 3, gen() {
        const n = cjPick([{ a: 3, b: 4, c: 12, space: 13 }, { a: 6, b: 8, c: 24, space: 26 }, { a: 2, b: 3, c: 6, space: 7 }]);
        return { prompt: `A car park floor is ${n.a} m × ${n.b} m, and the next level is ${n.c} m above it. A cable runs from a ground-floor corner to the opposite corner of the level above. How long is the cable?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: n.space, display: String(n.space) }],
          hint: 'Two triangles, one after the other: floor diagonal first, then diagonal + height.',
          explanation: `Floor: √(${n.a}² + ${n.b}²); then √(diag² + ${n.c}²) = ${n.space} m. Pythagoras stacked on Pythagoras — 3D is just 2D twice.`,
          vis: { kind: 'rtri', tris: [
            { base: n.a, rise: n.b, baseLabel: `${n.a} m`, riseLabel: `${n.b} m`, hypLabel: 'floor diag = ?' },
            { base: Math.hypot(n.a, n.b), rise: n.c, baseLabel: 'floor diag', riseLabel: `up ${n.c} m`, hypLabel: 'cable = ?' },
          ], caption: '3D is 2D twice: triangle 1 finds the floor diagonal, triangle 2 stands on it' } };
      } },
      { id: 'pyt-06', band: 3, gen() {
        const t = cjPick(CJ_TRIPLES_BIG), k = cjRand(1, 2);
        const a = t[0] * k, b = t[1] * k, c = t[2] * k, ans = a + b - c;
        return { prompt: `The car park is ${a} m × ${b} m. Dad walks two sides to the exit; you cut across the diagonal. How many metres shorter is your path?`,
          parts: [{ unit: 'm', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Find the diagonal first, then compare it with the two sides added together.',
          explanation: `(${a} + ${b}) − ${c} = ${ans} m saved. The triangle inequality, measured in footsteps.`,
          vis: { kind: 'rtri', base: a, rise: b, baseLabel: `${a} m`, riseLabel: `${b} m`, hypLabel: 'your shortcut', caption: `Dad walks the two sides (${a} + ${b} m); you cut the diagonal — how much shorter?` } };
      } },
    ],
  },

  /* ── Stop 11 · Quadratics · ages 12–15 ── */
  {
    key: 'quadratic', emoji: '🛑', age: '12–15',
    title: "Why the car can't stop on a coin",
    carQuestion: 'Double your speed — do you need double the road to stop? (No. Much worse.)',
    skill: 'Evaluating ax² + bx + c',
    bridge: 'Braking distance doesn\'t grow with speed — it grows with speed SQUARED. That little ² is the difference between a scare and an accident. This stop is about learning to read it.',
    role: 'You know why double the speed means four times the braking.',
    finale: 'Can a car stop on a coin? Never — and the reason is one small ². Braking distance rides on v², so doubling your speed quadruples the road you need, and rain doubles it again. Every speed limit ever posted is that little exponent, written in law.',
    templates: [
      { id: 'qua-01', band: 1, gen() {
        const v = cjRand(30, 110, 10), ans = (v * v) / 100;
        return { prompt: `On a dry road, braking distance in metres is given by d = v²/100, where v is speed in km/h. Find d for a car doing ${v} km/h.`,
          parts: [{ unit: 'm', type: 'num', tol: 0.05, answer: ans, display: String(ans) }],
          hint: 'Square the speed first, then divide by 100.',
          explanation: `${v}²/100 = ${ans} m of road just to stop. Keep this number in mind next time you're doing ${v} km/h.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => (x * x) / 100, 0, 110) }], marks: [{ x: v, y: ans, label: `${v} km/h` }], xLabel: 'v (km/h)', yLabel: 'd (m)', caption: 'the curve bends UP — that is the ² at work' } };
      } },
      { id: 'qua-02', band: 1, gen() {
        const v = cjRand(30, 100, 10), ans = v / 5 + (v * v) / 100;
        return { prompt: `Total stopping distance is d = v/5 + v²/100 (thinking distance + braking distance), v in km/h. Find d at ${v} km/h.`,
          parts: [{ unit: 'm', type: 'num', tol: 0.05, answer: ans, display: String(ans) }],
          hint: 'Two terms, two steps: the linear part v/5, then the squared part v²/100. Add them.',
          explanation: `${v}/5 + ${v}²/100 = ${v / 5} + ${(v * v) / 100} = ${ans} m. The first term is your reaction; the second is your brakes. Only one of them grows with the square.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => x / 5 + (x * x) / 100, 0, 100), label: 'total' }, { pts: cjPts((x) => x / 5, 0, 100), label: 'thinking' }], marks: [{ x: v, y: ans, label: `${v} km/h` }], xLabel: 'v (km/h)', yLabel: 'd (m)', caption: 'the straight line is your reaction; the gap above it is your brakes' } };
      } },
      { id: 'qua-03', band: 2, gen() {
        const v = cjRand(40, 90, 10), ref = (v * v) / 100, ans = (v * v) / 50;
        return { prompt: `Rain doubles braking distance: on a wet road d = v²/50. A car is doing ${v} km/h (its dry-road braking distance would be ${ref} m). How many metres does it need on the wet road?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.05, answer: ans, display: String(ans) }],
          hint: 'Same recipe as the dry road, but divide by 50 instead of 100.',
          explanation: `${v}²/50 = ${ans} m — double the dry-road ${ref} m. Same car, same brakes; the road changed the equation.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => (x * x) / 50, 0, 90), label: 'wet' }, { pts: cjPts((x) => (x * x) / 100, 0, 90), label: 'dry' }], marks: [{ x: v, y: ref, label: 'dry' }], xLabel: 'v (km/h)', yLabel: 'd (m)', caption: 'same speed, twice the road when it rains' } };
      } },
      { id: 'qua-04', band: 2, gen() {
        const u = cjRand(15, 30, 5), t = cjRand(1, 2), ans = u * t - 5 * t * t;
        return { prompt: `A stunt car leaves a ramp going straight up at ${u} m/s. Its height after t seconds is h = ${u}t − 5t². Find its height at t = ${t} s.`,
          parts: [{ unit: 'm', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Substitute t into both terms. Watch the minus sign on the 5t².',
          explanation: `${u} × ${t} − 5 × ${t}² = ${ans} m up. The −5t² term is gravity's signature — it always wins in the end.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => u * x - 5 * x * x, 0, u / 5) }], marks: [{ x: t, y: ans, label: `t = ${t}` }], xLabel: 't (s)', yLabel: 'h (m)', caption: 'up, over, down — the −5t² term always wins in the end' } };
      } },
      { id: 'qua-05', band: 3, gen() {
        const v = cjRand(30, 60, 10), k = cjPick([2, 3]), ans = k * k;
        return { prompt: `Braking distance is d = v²/100. Car A brakes from ${v} km/h. Car B brakes from ${k} times that speed. How many times longer is Car B's braking distance?`,
          parts: [{ unit: 'times', type: 'int', answer: ans, display: String(ans) }],
          hint: 'Write both distances, then divide. Watch what happens to the k when it goes through the square.',
          explanation: `(${k}v)²/v² = ${k}² = ${ans}×. Double the speed = 4× the road; triple = 9×. This one line is why speed limits exist.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => (x * x) / 100, 0, k * v) }], marks: [{ x: v, y: (v * v) / 100, label: 'A' }, { x: k * v, y: (k * v * k * v) / 100, label: 'B' }], xLabel: 'v (km/h)', yLabel: 'd (m)', caption: `B goes ${k}× as fast — compare the heights of the two dots on the curve` } };
      } },
      { id: 'qua-06', band: 3, gen() {
        const v = cjRand(40, 80, 10), d = v / 5 + (v * v) / 100;
        const off = cjPick([-6, -4, 4, 6, 10]), gap = d + off;
        return { prompt: `A dog walks onto the road ${gap} m ahead of a car doing ${v} km/h. Stopping distance is d = v/5 + v²/100. By how many metres does the car stop clear of the dog? (Negative if it can't stop in time.)`,
          parts: [{ unit: 'm', type: 'int', answer: off, display: String(off) }],
          hint: 'First find the stopping distance, then compare it with the gap. The sign of the difference is the whole story.',
          explanation: `Needs ${d} m, has ${gap} m → ${off} m ${off >= 0 ? 'to spare' : 'short'}. A quadratic, a comparison, and a dog — all in one glance at the road.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => x / 5 + (x * x) / 100, 0, v + 15) }], marks: [{ x: v, y: gap, label: `🐕 at ${gap} m` }], xLabel: 'v (km/h)', yLabel: 'd (m)', caption: 'the dot is the dog; the curve is what the car needs — is the dot above or below the curve?' } };
      } },
    ],
  },

  /* ── Stop 12 · Trigonometry · ages 13–15 ── */
  {
    key: 'trig', emoji: '⛰️', age: '13–15',
    title: 'How steep is too steep?',
    carQuestion: 'The yellow sign says 12% — the mountain road is speaking trigonometry.',
    skill: 'SOH-CAH-TOA: angles and sides',
    bridge: 'Every hill is a triangle: the road you drive, the height you gain, the map-distance you cover. Trigonometry is the language that connects the slope you feel to the angle it really is.',
    role: 'You can turn a slope you feel into an angle you can name.',
    finale: 'How steep is too steep? The yellow 12% sign compresses a whole triangle into one number: rise 12 for every 100 across — tan θ = 0.12, about 7°. You can now unfold any slope back into its angle, and split a mountain road into the height it truly gains.',
    templates: [
      { id: 'trg-01', band: 1, gen() {
        const rise = cjRand(5, 25, 5), ans = rise / 100;
        return { prompt: `A ramp rises ${rise} m over a horizontal run of 100 m. Find tan θ for the ramp's angle θ (as a decimal).`,
          parts: [{ type: 'num', tol: 0.005, answer: ans, display: String(ans) }],
          hint: 'tan θ = opposite ÷ adjacent = rise ÷ run.',
          explanation: `tan θ = ${rise}/100 = ${ans}. You've already met this number — it's just a ratio (Stop 6) wearing an angle's name.`,
          vis: { kind: 'rtri', base: 100, rise, angle: 'θ = ?', baseLabel: 'run 100 m', riseLabel: `rise ${rise} m`, caption: 'tan θ = rise ÷ run (opposite ÷ adjacent)' } };
      } },
      { id: 'trg-02', band: 1, gen() {
        const th = cjRand(5, 20);
        const opp = Math.round(100 * Math.tan((th * Math.PI) / 180) * 10) / 10;
        return { prompt: `A hill road rises ${opp} m for every 100 m of horizontal distance. Find the angle of the hill (nearest degree).`,
          parts: [{ unit: '°', type: 'num', tol: 0.5, answer: th, display: String(th) }],
          hint: "You have opposite and adjacent — that's tan. Use inverse tan to get back to the angle.",
          explanation: `tan θ = ${opp}/100 → θ = tan⁻¹(${opp / 100}) = ${th}°. Real hills feel steep at angles that sound tiny.`,
          vis: { kind: 'rtri', base: 100, rise: opp, angle: 'θ = ?', baseLabel: '100 m across', riseLabel: `${opp} m up`, caption: 'opposite and adjacent known — tan, then invert to reach the angle' } };
      } },
      { id: 'trg-03', band: 2, gen() {
        const [th, sv] = cjPick([[10, 0.17], [15, 0.26], [20, 0.34], [30, 0.5]]);
        const L = cjRand(200, 800, 100), ans = cjR2(L * sv);
        return { prompt: `A mountain road is ${L} m long and climbs at ${th}° (sin ${th}° ≈ ${sv}). How much height does the car gain over the whole road?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'The road is the hypotenuse; height is opposite. Opposite = hypotenuse × sin θ.',
          explanation: `${L} × sin ${th}° = ${ans} m gained. The road odometer reads ${L}, but the mountain only counts ${ans}.`,
          vis: { kind: 'rtri', base: Math.sqrt(Math.max(L * L - ans * ans, 1)), rise: ans, angle: `${th}°`, riseLabel: 'height = ?', hypLabel: `road ${L} m`, caption: 'the road is the hypotenuse; height = road × sin θ' } };
      } },
      { id: 'trg-04', band: 2, gen() {
        const [th, cv] = cjPick([[10, 0.98], [20, 0.94], [30, 0.87]]);
        const L = cjRand(200, 700, 100), ans = cjR2(L * cv);
        return { prompt: `The car drives ${L} m up a road angled at ${th}° (cos ${th}° ≈ ${cv}). How far does the car move on the MAP (the horizontal distance)?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Map distance is the adjacent side: adjacent = hypotenuse × cos θ.',
          explanation: `${L} × cos ${th}° = ${ans} m on the map. GPS apps do this sum constantly — maps are flat, roads are not.`,
          vis: { kind: 'rtri', base: ans, rise: Math.sqrt(Math.max(L * L - ans * ans, 1)), angle: `${th}°`, baseLabel: 'map distance = ?', hypLabel: `road ${L} m`, caption: 'map distance is the adjacent side: road × cos θ' } };
      } },
      { id: 'trg-05', band: 3, gen() {
        const th = cjRand(3, 17);
        const grade = Math.round(100 * Math.tan((th * Math.PI) / 180));
        return { prompt: `A yellow road sign warns of a ${grade}% grade — the road rises ${grade} m for every 100 m of horizontal distance. What angle is that? (nearest degree)`,
          parts: [{ unit: '°', type: 'num', tol: 0.5, answer: th, display: String(th) }],
          hint: 'The grade is 100 × tan θ. Turn the percentage back into a ratio, then invert the tan.',
          explanation: `${grade}% → tan θ = ${grade}/100 → θ = ${th}°. Percent (Stop 7), ratio (Stop 6) and trig — one road sign, three stops of the journey.`,
          vis: { kind: 'rtri', base: 100, rise: grade, angle: 'θ = ?', baseLabel: '100 across', riseLabel: `${grade} up`, caption: `the yellow sign compressed this whole triangle into one number: ${grade}%` } };
      } },
      { id: 'trg-06', band: 3, gen() {
        const [t1, s1] = cjPick([[10, 0.17], [15, 0.26]]);
        const [t2, s2] = cjPick([[20, 0.34], [30, 0.5]]);
        const L1 = cjRand(200, 500, 100), L2 = cjRand(200, 400, 100);
        const ans = cjR2(L1 * s1 + L2 * s2);
        return { prompt: `The climb to the pass has two parts: ${L1} m of road at ${t1}° (sin ≈ ${s1}), then ${L2} m at ${t2}° (sin ≈ ${s2}). What is the total height gained?`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Each part is its own triangle. Find each height, then add.',
          explanation: `${L1} × ${s1} + ${L2} × ${s2} = ${ans} m to the top. Big problems are just small triangles added up.`,
          vis: { kind: 'rtri', tris: [
            { base: Math.sqrt(Math.max(L1 * L1 - L1 * s1 * L1 * s1, 1)), rise: L1 * s1, angle: `${t1}°`, riseLabel: '? m', hypLabel: `${L1} m` },
            { base: Math.sqrt(Math.max(L2 * L2 - L2 * s2 * L2 * s2, 1)), rise: L2 * s2, angle: `${t2}°`, riseLabel: '? m', hypLabel: `${L2} m` },
          ], caption: 'two triangles, one climb — find each height, then add' } };
      } },
    ],
  },

  /* ── Stop 13 · Linear & Simultaneous Equations · ages 13–15 ── */
  {
    key: 'lineareq', alsoTopics: ['simul'], emoji: '🚦', age: '13–15',
    title: 'When do the two cars meet?',
    carQuestion: 'Two cars, two roads, one question — where and when?',
    skill: 'Solve ax+b=c, ax+b=cx+d, 2×2 systems',
    bridge: '"When will we catch the truck?" is an equation wearing traffic. Set the two journeys equal, solve for the moment they agree — that moment is x.',
    role: 'You can find the moment two journeys agree — with equations.',
    finale: 'When do the two cars meet? Write each journey as an equation and set them equal — the solution is the exact hour their positions agree, and substituting back gives the kilometre. Two receipts, two unknowns, one system: algebra reads traffic like a timetable.',
    templates: [
      { id: 'equ-01', band: 1, gen() {
        const a = cjRand(10, 20, 2), b = cjRand(25, 60, 5), x = cjRand(3, 15), c = a * x + b;
        return { prompt: `A taxi charges ₹${b} to start, plus ₹${a} per km. The final bill is ₹${c}. How many km was the ride?`,
          parts: [{ unit: 'km', type: 'int', answer: x, display: String(x) }],
          hint: "Take the starting charge off the bill first — what's left is all per-km money.",
          explanation: `(${c} − ${b}) ÷ ${a} = ${x} km. The meter is a linear equation running in real time.`,
          vis: { kind: 'bars', unit: '₹', items: [{ label: 'Final bill', value: c }, { label: 'Start charge', value: b }], caption: `the difference between the bars is pure per-km money at ₹${a}/km` } };
      } },
      { id: 'equ-02', band: 1, gen() {
        const a = cjRand(2, 6), x = cjRand(2, 8), c = cjRand(3, 10), b = a * x + c;
        return { prompt: `The tank holds ${b} litres. The engine burns ${a} litres every hour. After how many hours will exactly ${c} litres remain?`,
          parts: [{ unit: 'hours', type: 'int', answer: x, display: String(x) }],
          hint: 'Fuel used so far = start − now. Divide by the burn rate.',
          explanation: `(${b} − ${c}) ÷ ${a} = ${x} hours. Same equation as the taxi — money out, fuel down, x is always "how long."`,
          vis: { kind: 'bars', unit: 'L', items: [{ label: 'Tank now', value: b }, { label: 'Must remain', value: c }], caption: `the engine burns the gap between the bars at ${a} L every hour` } };
      } },
      { id: 'equ-03', band: 2, gen() {
        const s2 = cjRand(40, 60, 10), dv = cjPick([10, 20, 30]), s1 = s2 + dv, t = cjRand(2, 5), g = dv * t;
        return { prompt: `A truck is ${g} km ahead of a car on the highway. The truck does ${s2} km/h; the car does ${s1} km/h. After how many hours does the car catch the truck?`,
          parts: [{ unit: 'hours', type: 'int', answer: t, display: String(t) }],
          hint: `Set the two positions equal: ${s1}t = ${s2}t + ${g}. The speeds' difference does all the work.`,
          explanation: `${s1}t = ${s2}t + ${g} → t = ${g}/${dv} = ${t} h. Stop 8 solved this with arithmetic; now you own the equation behind it.`,
          vis: { kind: 'meet', mode: 'chase', aLabel: `car ${s1} km/h`, bLabel: `truck ${s2} km/h`, gapLabel: `gap: ${g} km`, caption: `set the positions equal: ${s1}t = ${s2}t + ${g}` } };
      } },
      { id: 'equ-04', band: 2, gen() {
        const a = cjRand(400, 700, 50), dc = cjPick([50, 100]), c = a + dc, x = cjRand(2, 6), d = cjRand(200, 500, 50), b = d + dc * x;
        return { prompt: `CarRent A: ₹${a} per day plus ₹${b} fixed fee. CarRent B: ₹${c} per day plus ₹${d} fixed fee. For how many days do the two deals cost exactly the same?`,
          parts: [{ unit: 'days', type: 'int', answer: x, display: String(x) }],
          hint: 'Set the two total costs equal and let the fixed fees fight the daily rates.',
          explanation: `${a}x + ${b} = ${c}x + ${d} → x = ${x} days. Shorter trip: pick the low fixed fee. Longer: the low daily rate. The equation finds the crossover.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((z) => a * z + b, 0, x + 3, 2), label: 'A' }, { pts: cjPts((z) => c * z + d, 0, x + 3, 2), label: 'B' }], marks: [{ x, y: a * x + b, label: '?' }], xLabel: 'days', yLabel: '₹', caption: 'two cost lines — the crossover day is where they meet' } };
      } },
      { id: 'equ-05', band: 3, gen() {
        const s1 = cjRand(40, 70, 10), s2 = cjRand(30, 60, 10), t = cjRand(2, 4), D = (s1 + s2) * t;
        return { prompt: `Two cars start at the same time from towns ${D} km apart and drive toward each other, one at ${s1} km/h and the other at ${s2} km/h. After how many hours do they meet, and how far from the first car's town?`,
          parts: [
            { label: 'Meeting time', unit: 'hours', type: 'int', answer: t, display: String(t) },
            { label: "Distance from first car's town", unit: 'km', type: 'int', answer: s1 * t, display: String(s1 * t) },
          ],
          hint: `Two unknowns, two facts: their distances add to ${D}, and their times are equal. That's a system.`,
          explanation: `(${s1} + ${s2})t = ${D} → t = ${t} h; the first car covers ${s1} × ${t} = ${s1 * t} km. Two equations shook hands — right where the cars do.`,
          vis: { kind: 'meet', mode: 'toward', aLabel: `${s1} km/h`, bLabel: `${s2} km/h`, gapLabel: `${D} km apart`, caption: `together they close ${s1} + ${s2} km every hour` } };
      } },
      { id: 'equ-06', band: 3, gen() {
        const p = cjRand(30, 80, 10), q = cjRand(20, 60, 10);
        let a1 = cjRand(1, 4), b1 = cjRand(1, 4), a2 = cjRand(1, 4), b2 = cjRand(1, 4);
        while (a1 * b2 === a2 * b1) { a2 = cjRand(1, 4); b2 = cjRand(1, 4); }
        const m = a1 * p + b1 * q, n = a2 * p + b2 * q;
        return { prompt: `On Monday the trip cost ₹${m}: ${a1} toll${a1 > 1 ? 's' : ''} and ${b1} hour${b1 > 1 ? 's' : ''} of parking. On Tuesday it cost ₹${n}: ${a2} toll${a2 > 1 ? 's' : ''} and ${b2} hour${b2 > 1 ? 's' : ''} of parking. Prices didn't change. Find the toll price and the hourly parking rate.`,
          parts: [
            { label: 'Toll price', unit: '₹', type: 'int', answer: p, display: String(p) },
            { label: 'Parking rate', unit: '₹/hour', type: 'int', answer: q, display: String(q) },
          ],
          hint: 'Two days, two equations. Scale one so the tolls match, subtract, and parking stands alone.',
          explanation: `Solving the pair gives toll = ₹${p}, parking = ₹${q}/h. Two receipts were enough to reveal both prices — that's the power of a system.`,
          vis: { kind: 'bars', unit: '₹', items: [{ label: `Mon: ${a1} toll + ${b1} h parking`, value: m }, { label: `Tue: ${a2} toll + ${b2} h parking`, value: n }], caption: 'two receipts, two hidden prices — a system of two equations' } };
      } },
    ],
  },

  /* ── Stop 14 · Differentiation · ages 14–16 ── */
  {
    key: 'diff', emoji: '🏎️', age: '14–16',
    title: 'The speedometer is a derivative',
    carQuestion: 'The odometer counts kilometres. The speedometer reads THIS instant. How does it know?',
    skill: "Power rule, f′(x), turning points",
    bridge: 'Speed is how fast position changes — the derivative of where you are. The speedometer needle is doing calculus at every moment you drive. This stop teaches you to do what the needle does.',
    role: 'You can do what the speedometer does — differentiate.',
    finale: 'How does the speedometer know THIS instant\'s speed? It reads the rate at which position is changing right now — the derivative of where you are. That\'s calculus on a dashboard, and with the power rule you just did the needle\'s job by hand.',
    templates: [
      { id: 'dif-01', band: 1, gen() {
        const a = cjRand(2, 6), t = cjRand(1, 5), ans = 2 * a * t;
        return { prompt: `A car accelerating from rest has position s(t) = ${a}t² metres after t seconds. Its speedometer reads s′(t). Find the speed at t = ${t} s.`,
          parts: [{ unit: 'm/s', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Power rule: bring the 2 down, drop the power by one. Then substitute t.',
          explanation: `s′(t) = 2 × ${a}t → at t = ${t}: ${ans} m/s. You just computed what the needle shows.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => a * x * x, 0, t + 2) }], marks: [{ x: t, y: a * t * t, label: `t = ${t}` }], xLabel: 't (s)', yLabel: 's (m)', caption: 'the speed is how STEEPLY the curve climbs at the red dot' } };
      } },
      { id: 'dif-02', band: 1, gen() {
        const a = cjRand(1, 3), t = cjRand(1, 3), ans = 3 * a * t * t;
        return { prompt: `A drag racer's position is s(t) = ${a}t³ metres. Find its speed s′(t) at t = ${t} s.`,
          parts: [{ unit: 'm/s', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Same rule, bigger power: 3 comes down, t³ becomes t².',
          explanation: `s′(t) = 3 × ${a}t² → ${ans} m/s at t = ${t}. A cubic position means speed grows with t² — that's why drag racing is short.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => a * x * x * x, 0, t + 1) }], marks: [{ x: t, y: a * t * t * t, label: `t = ${t}` }], xLabel: 't (s)', yLabel: 's (m)', caption: 'a cubic climbs even harder — its slope grows with t²' } };
      } },
      { id: 'dif-03', band: 2, gen() {
        const a = cjRand(1, 4), b = cjRand(5, 15), t = cjRand(1, 4), ans = 2 * a * t + b;
        return { prompt: `A car joins the highway with position s(t) = ${a}t² + ${b}t metres (it entered already moving at ${b} m/s). Find its speed at t = ${t} s.`,
          parts: [{ unit: 'm/s', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Differentiate each term on its own: t² by the power rule, and the bt term becomes just b.',
          explanation: `s′(t) = 2 × ${a}t + ${b} → ${ans} m/s. The +${b} never dies in the derivative — the rolling start is with the car forever.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => a * x * x + b * x, 0, t + 2) }], marks: [{ x: t, y: a * t * t + b * t, label: `t = ${t}` }], xLabel: 't (s)', yLabel: 's (m)', caption: `even at t = 0 the curve is already climbing — that is the rolling start (${b} m/s)` } };
      } },
      { id: 'dif-04', band: 2, gen() {
        const a = cjRand(1, 3), b = cjRand(2, 8), t = cjRand(1, 3), ans = 2 * a * t + b;
        return { prompt: `A car's speed is v(t) = ${a}t² + ${b}t m/s during an overtake. Acceleration is v′(t). Find the acceleration at t = ${t} s.`,
          parts: [{ unit: 'm/s²', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: "Same power rule — you're just one storey higher: speed's derivative is acceleration.",
          explanation: `v′(t) = 2 × ${a}t + ${b} → ${ans} m/s². Position → speed → acceleration: the same staircase, climbed twice.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => a * x * x + b * x, 0, t + 2) }], marks: [{ x: t, y: a * t * t + b * t, label: `t = ${t}` }], xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'careful: this curve is already SPEED — its slope is acceleration' } };
      } },
      { id: 'dif-05', band: 3, gen() {
        const b = cjRand(40, 80, 4), c = cjRand(100, 300, 50), ans = b / 2;
        return { prompt: `A car's fuel economy (km per litre) at speed v is E(v) = −v² + ${b}v + ${c} (in test units). At what speed v is the economy at its best?`,
          parts: [{ unit: 'km/h', type: 'int', answer: ans, display: String(ans) }],
          hint: "Best = top of the curve = where E′(v) = 0. Differentiate, set to zero, solve.",
          explanation: `E′(v) = −2v + ${b} = 0 → v = ${ans} km/h. There really is a sweet-spot speed — your fuel bill knows calculus even if the driver doesn't.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => -x * x + b * x + c, 0, b) }], marks: [{ x: ans, y: -ans * ans + b * ans + c, label: 'v = ?' }], xLabel: 'v (km/h)', yLabel: 'economy', caption: 'best economy = the very top of the curve, where the slope is exactly zero' } };
      } },
      { id: 'dif-06', band: 3, gen() {
        const u = cjRand(20, 60, 10), ans = (u * u) / 20;
        return { prompt: `The stunt car from Stop 11 is back: height h(t) = ${u}t − 5t². Find the maximum height it reaches.`,
          parts: [{ unit: 'm', type: 'num', tol: 0.5, answer: ans, display: String(ans) }],
          hint: 'Peak = where h′(t) = 0. Find that t first, then put it back into h.',
          explanation: `h′ = ${u} − 10t = 0 → t = ${u / 10} s → h = ${ans} m. In Stop 11 you could only evaluate this curve; now you command its peak.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => u * x - 5 * x * x, 0, u / 5) }], marks: [{ x: u / 10, y: ans, label: 'peak = ?' }], xLabel: 't (s)', yLabel: 'h (m)', caption: 'the peak is exactly where h′(t) = 0 — the curve stops climbing for one instant' } };
      } },
    ],
  },

  /* ── Stop 15 · Integration · ages 15–16 ── */
  {
    key: 'integ', emoji: '🔢', age: '15–16',
    title: "The odometer's secret",
    carQuestion: 'Way back at Stop 1, the odometer promised a secret. Here it is: the odometer integrates the speedometer.',
    skill: 'Antiderivatives, definite integrals, area under a curve',
    bridge: 'The speedometer knows only "now." The odometer adds every now together — that adding-up of a changing speed is integration. Stop 14 turned position into speed; this stop turns speed back into distance.',
    role: 'You can do what the odometer does — integrate. The secret is yours.',
    finale: 'Stop 1\'s promise, kept: the odometer adds up every instant of speed — it integrates the speedometer. Differentiate position and you get speed; integrate speed and you come home to position. One dashboard, one function, read in both directions.',
    templates: [
      { id: 'int-01', band: 1, gen() {
        const c = cjPick([4, 6, 8, 10]), ans = c / 2;
        return { prompt: `A car's speed is v(t) = ${c}t m/s. Its distance function has the form s(t) = A·t². Find A (the coefficient).`,
          parts: [{ type: 'int', answer: ans, display: String(ans) }],
          hint: 'Integrate: raise the power to t², divide by the new power 2.',
          explanation: `∫${c}t dt = (${c}/2)t² → A = ${ans}. Check it by differentiating back — you get ${c}t again. The two gauges agree.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => c * x, 0, 4, 2) }], xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'distance = the shaded area under the speed line — that is what integrating means' } };
      } },
      { id: 'int-02', band: 1, gen() {
        const a = cjPick([3, 6, 9, 12]), ans = a / 3;
        return { prompt: `A rocket-sled test car has speed v(t) = ${a}t². Its distance is s(t) = B·t³. Find B.`,
          parts: [{ type: 'int', answer: ans, display: String(ans) }],
          hint: 'Power up to t³, divide by 3.',
          explanation: `∫${a}t² dt = (${a}/3)t³ → B = ${ans}. Speed with a square in it means distance with a cube — growth stacked on growth.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => a * x * x, 0, 3) }], xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'the area under a curving speed graph — integration adds up every sliver' } };
      } },
      { id: 'int-03', band: 2, gen() {
        const a = cjPick([2, 4, 6]), b = cjRand(5, 15), k = cjRand(2, 4);
        const ans = (a * k * k) / 2 + b * k;
        return { prompt: `Pulling away from the lights, a car's speed is v(t) = ${a}t + ${b} m/s. How far does it travel in the first ${k} seconds?`,
          parts: [{ unit: 'm', type: 'int', answer: ans, display: String(ans) }],
          hint: `Distance = ∫₀^${k} v dt. Integrate each term, then evaluate at ${k} (the 0 end vanishes).`,
          explanation: `(${a}/2) × ${k}² + ${b} × ${k} = ${ans} m. The odometer just did this integral without telling you.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => a * x + b, 0, k, 2) }], xLabel: 't (s)', yLabel: 'v (m/s)', caption: `distance for the first ${k} s = the shaded area (a rectangle + a triangle, if you look closely)` } };
      } },
      { id: 'int-04', band: 2, gen() {
        const a = cjPick([3, 6]), b = cjRand(10, 20, 2), k = cjRand(2, 3);
        const ans = (a * k * k * k) / 3 + b * k;
        return { prompt: `During a hard overtake the car's speed is v(t) = ${a}t² + ${b} m/s. How far does it cover between t = 0 and t = ${k} s?`,
          parts: [{ unit: 'm', type: 'int', answer: ans, display: String(ans) }],
          hint: `Two terms, two integrals: at³/3 and bt. Evaluate both at ${k}.`,
          explanation: `(${a}/3) × ${k}³ + ${b} × ${k} = ${ans} m of road used. Overtakes cost distance — the integral is the bill.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => a * x * x + b, 0, k) }], xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'the overtake, drawn: its area is the road it used' } };
      } },
      { id: 'int-05', band: 3, gen() {
        const k = cjRand(2, 6), num = k * k * k, disp = cjFracStr(num, 6), ans = num / 6;
        return { prompt: `During an overtake lasting ${k} seconds, the car's EXTRA speed (above cruise) is v(t) = t(${k} − t) m/s — zero at the start, zero at the end, biggest in the middle. How much extra distance does the overtake add? (Fraction allowed.)`,
          parts: [{ unit: 'm', type: 'frac', tol: 0.001, answer: ans, display: disp }],
          hint: `Extra distance = area under the extra-speed curve = ∫₀^${k} (${k}t − t²) dt.`,
          explanation: `${k}³/2 − ${k}³/3 = ${disp} m extra. The area under a speed hump IS the distance it buys you — geometry and motion in one picture.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => x * (k - x), 0, k) }], xLabel: 't (s)', yLabel: 'extra v (m/s)', caption: 'the speed hump: zero at both ends, biggest in the middle — its area is the extra distance' } };
      } },
      { id: 'int-06', band: 3, gen() {
        const a = cjRand(1, 3), b = cjRand(4, 10, 2), t = cjRand(2, 4);
        const v = 2 * a * t + b, s = a * t * t + b * t;
        return { prompt: `A car's position is s(t) = ${a}t² + ${b}t. (1) Differentiate to get the speedometer's reading v(t) at t = ${t}. (2) Now integrate that v(t) expression from 0 to ${t} — what distance do you get back?`,
          parts: [
            { label: 'Speed at t (part 1)', unit: 'm/s', type: 'int', answer: v, display: String(v) },
            { label: 'Distance from the integral (part 2)', unit: 'm', type: 'int', answer: s, display: String(s) },
          ],
          hint: 'Part 2 should look familiar — you started there.',
          explanation: `v(${t}) = ${v} m/s; ∫₀^${t} v dt = ${s} m = s(${t}). Differentiate then integrate and you come home. The odometer and speedometer were the same function all along — Stop 1's secret, kept.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => 2 * a * x + b, 0, t, 2) }], xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'this line is the speedometer (the derivative you found) — its shaded area walks you back to the odometer' } };
      } },
    ],
  },

  /* ── Stop 16 · Differential Equations · ages 15–16 (capstone) ── */
  {
    key: 'diffeq', emoji: '🌀', age: '15–16',
    title: 'Why the car bounces exactly once',
    carQuestion: 'Hit a speed bump: the car dips, rises once, and settles. Who decided "once"?',
    skill: 'Order & degree, verify solutions, solve dy/dx = f(x)',
    bridge: 'The suspension obeys an equation about change: how position, speed of bounce, and damping fight each other. Equations whose unknowns are functions — differential equations — are the last stop, and the doorway to all of physics and ML.',
    role: 'You can read the equations that run the whole car. Journey complete.',
    finale: 'Who decided the car bounces exactly once? Engineers did — by tuning the suspension\'s second-order equation so spring and damper fight to a draw after a single dip. You can now read that equation\'s order and degree, verify its solutions, and solve its simplest cousins. The road behind you was mathematics the whole way.',
    templates: [
      { id: 'deq-01', band: 1, gen() {
        const v = cjPick([
          { eq: 'd²y/dt² + 3·dy/dt + 2y = 0  (the suspension)', ans: 2 },
          { eq: 'dv/dt = k(40 − v)  (cruise control)', ans: 1 },
          { eq: 'd²s/dt² = −10  (free fall off the ramp)', ans: 2 },
          { eq: '(dy/dt)² + y = t  (careful: that square!)', ans: 1 },
        ]);
        return { prompt: `The equation ${v.eq} describes part of the car. What is the ORDER of this differential equation (the highest derivative present)?`,
          parts: [{ type: 'int', answer: v.ans, display: String(v.ans) }],
          hint: 'Order = the tallest derivative in the room. A squared FIRST derivative is still first-order.',
          explanation: `Highest derivative: order ${v.ans}. The suspension needs order 2 — position AND how fast it's bouncing both matter.`,
          vis: { kind: 'eqmap', eq: v.eq, note: 'find the TALLEST derivative in the equation — its height is the order (a squared FIRST derivative is still first-order)' } };
      } },
      { id: 'deq-02', band: 1, gen() {
        const k = cjRand(1, 3), vs = cjPick([60, 80, 100]);
        return { prompt: `Cruise control adjusts speed v by dv/dt = ${k}(${vs} − v), with the set speed at ${vs} km/h. (1) What is the order of this equation? (2) What value does dv/dt approach as v gets close to ${vs}?`,
          parts: [
            { label: 'Order (part 1)', type: 'int', answer: 1, display: '1' },
            { label: 'dv/dt approaches (part 2)', type: 'int', answer: 0, display: '0' },
          ],
          hint: `Look at the gap (${vs} − v). What is it worth when v is nearly ${vs}?`,
          explanation: `Order 1; as v → ${vs}, the gap → 0, so dv/dt → 0 — the car stops accelerating exactly when it arrives. That's the whole design, in one equation.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => vs - (vs - 20) * Math.exp(-k * x), 0, 5) }], xLabel: 't', yLabel: 'v (km/h)', caption: `the speed glides up to ${vs} and levels off — the closer it gets, the smaller dv/dt becomes` } };
      } },
      { id: 'deq-03', band: 2, gen() {
        const v = cjPick([
          { eq: '(dy/dt)² + y = t', ans: 2 },
          { eq: 'd²y/dt² + (dy/dt)³ = 0', ans: 1 },
          { eq: '(d²y/dt²)² = 4·dy/dt', ans: 2 },
          { eq: 'dy/dt + y = t', ans: 1 },
        ]);
        return { prompt: `For the equation ${v.eq}, state its DEGREE (the power of the highest-order derivative).`,
          parts: [{ type: 'int', answer: v.ans, display: String(v.ans) }],
          hint: 'First find the highest-order derivative — the degree is ITS power, nobody else\'s.',
          explanation: `Degree = ${v.ans}. Order asks "how tall"; degree asks "how strong is the tallest one."`,
          vis: { kind: 'eqmap', eq: v.eq, note: "step 1: find the highest-order derivative · step 2: the degree is ITS power — nobody else's" } };
      } },
      { id: 'deq-04', band: 2, gen() {
        const v = cjPick([
          { de: 'dv/dt = −v', sol: 'v = e^(−t)', yes: true },
          { de: 'dv/dt = v', sol: 'v = e^t', yes: true },
          { de: 'd²y/dt² + y = 0', sol: 'y = sin t', yes: true },
          { de: 'dv/dt = −v', sol: 'v = t·e^(−t)', yes: false },
        ]);
        const ansTxt = v.yes ? 'yes' : 'no';
        return { prompt: `A coasting car slows by ${v.de}. A student claims ${v.sol} is a solution. Are they right? (yes/no)`,
          parts: [{ type: 'text', answers: ['yes', 'no'].filter((x) => x === ansTxt), answer: 0, display: ansTxt }],
          hint: "Don't solve — CHECK. Differentiate the claim and see if both sides agree.",
          explanation: `Substituting: ${ansTxt}. Verifying is the engineer's move — you rarely solve the suspension's equation, but you always check the proposed answer.`,
          vis: { kind: 'eqmap', eq: `${v.de}   |   claim: ${v.sol}`, note: "don't solve — CHECK: differentiate the claim, substitute it into the left side, and see if both sides agree" } };
      } },
      { id: 'deq-05', band: 3, gen() {
        const a = cjRand(1, 4), b = cjRand(1, 4);
        const coefDisp = cjFracStr(a, 2);
        return { prompt: `Rolling downhill with the brakes warming up, a car's acceleration is dv/dt = ${a}t + ${b} m/s². The speed function is v(t) = (coefficient)·t² + (coefficient)·t + C. Find the two coefficients.`,
          parts: [
            { label: 'Coefficient of t²', type: 'frac', tol: 0.001, answer: a / 2, display: coefDisp },
            { label: 'Coefficient of t', type: 'int', answer: b, display: String(b) },
          ],
          hint: "Integrate the right side term by term — and never forget the +C: it's the speed you started with.",
          explanation: `v(t) = ${coefDisp}t² + ${b}t + C. The +C is not decoration — it's Stop 15's lesson wearing initial-condition clothes.`,
          vis: { kind: 'plot', area: true, series: [{ pts: cjPts((x) => a * x + b, 0, 4, 2) }], xLabel: 't (s)', yLabel: 'dv/dt (m/s²)', caption: 'this line is the ACCELERATION — integrating it (the area) builds the speed function, plus the +C you started with' } };
      } },
      { id: 'deq-06', band: 3, gen() {
        const u = cjRand(20, 50, 10);
        return { prompt: `The ramp-jump height h(t) = ${u}t − 5t² (from Stops 11 and 14) satisfies a differential equation: d²h/dt² = ?  Differentiate h twice and state the constant the stunt car has obeyed all along.`,
          parts: [{ unit: 'm/s²', type: 'int', answer: -10, display: '−10' }],
          hint: `h′ = ${u} − 10t. Now differentiate once more — what's left?`,
          explanation: `h″ = −10, every time, for every launch speed. One differential equation stood behind every stunt-jump question since Stop 11 — you've been solving it all journey without knowing its name.`,
          vis: { kind: 'plot', series: [{ pts: cjPts((x) => u * x - 5 * x * x, 0, u / 5) }], xLabel: 't (s)', yLabel: 'h (m)', caption: 'the stunt-jump curve one last time — differentiate it twice and every point gives the same constant' } };
      } },
    ],
  },
];

/* ── Progress persistence ──────────────────────────────────────────────── */

const CJ_LS_KEY = 'tenali-car-journey';

/** Empty per-topic outcome record — the shape a future global mastery store can ingest untransformed. */
function cjEmptyOutcome() { return { attempts: 0, correct: 0, checkPassed: false, lastSeen: 0 }; }

function cjLoadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(CJ_LS_KEY));
    if (p && typeof p === 'object' && p.topicOutcomes) return p;
    if (p && typeof p === 'object' && p.done) {
      // migrate the earlier stop-index shape { done: { i: true } } → topicOutcomes
      const topicOutcomes = {};
      Object.keys(p.done).forEach((i) => {
        const s = CJ_STOPS[Number(i)];
        if (s && p.done[i]) {
          [s.key, ...(s.alsoTopics || [])].forEach((k) => {
            topicOutcomes[k] = { ...cjEmptyOutcome(), checkPassed: true, lastSeen: Date.now() };
          });
        }
      });
      return { topicOutcomes };
    }
  } catch { /* corrupt value — start fresh */ }
  return { topicOutcomes: {} };
}

function cjSaveProgress(p) {
  try { localStorage.setItem(CJ_LS_KEY, JSON.stringify(p)); } catch { /* storage full/blocked — progress just won't persist */ }
}

/** Record one resolved practice/check question under the stop's canonical topic key(s). */
function cjRecord(progress, stop, correct) {
  const next = { ...progress, topicOutcomes: { ...progress.topicOutcomes } };
  [stop.key, ...(stop.alsoTopics || [])].forEach((k) => {
    const o = { ...(next.topicOutcomes[k] || cjEmptyOutcome()) };
    o.attempts += 1;
    if (correct) o.correct += 1;
    o.lastSeen = Date.now();
    next.topicOutcomes[k] = o;
  });
  return next;
}

/** Mark the stop's mastery check as passed (does not add an attempt). */
function cjMarkPassed(progress, stop) {
  const next = { ...progress, topicOutcomes: { ...progress.topicOutcomes } };
  [stop.key, ...(stop.alsoTopics || [])].forEach((k) => {
    const o = { ...(next.topicOutcomes[k] || cjEmptyOutcome()) };
    o.checkPassed = true;
    o.lastSeen = Date.now();
    next.topicOutcomes[k] = o;
  });
  return next;
}

/* ── Band-level resume (per stop) ────────────────────────────────────────
 * Question order is random, so we never save question-level state. Instead a
 * checkpoint { served, correct, remedial, checkReady } is written at every
 * BAND boundary (and when the check unlocks). Leaving mid-band rewinds only
 * to the start of that band; the checkpoint is cleared when the stop passes. */

function cjGetResume(progress, stop) {
  return (progress.stopResume || {})[stop.key] || null;
}

function cjSaveResumePoint(progress, stop, resume) {
  return { ...progress, stopResume: { ...(progress.stopResume || {}), [stop.key]: resume } };
}

function cjClearResume(progress, stop) {
  const stopResume = { ...(progress.stopResume || {}) };
  delete stopResume[stop.key];
  return { ...progress, stopResume };
}

function cjStopDone(progress, i) {
  const o = progress.topicOutcomes[CJ_STOPS[i].key];
  return !!(o && o.checkPassed);
}

/* ── Tier-3 remediation: decontextualized drills from the real server generators ──
 * Deliberate (Cognitive Load Theory): a struggling student solves plain mechanics,
 * not narrative + mechanics at once. Context is the motivation layer; remediation
 * is the mechanics layer. Drills never count toward the gate.
 * Set CJ_TIER3_DRILLS = false to revert to the explanation-only v1 behaviour.
 * Every fetch/parse failure falls back to v1 silently — the journey never blocks
 * on the backend being up.
 * ─────────────────────────────────────────────────────────────────────── */

const CJ_TIER3_DRILLS = true;
const CJ_DRILL_COUNT = 3;

/* Tester unlock: `npm run dev:remy` loads .env.remy.local (gitignored) which sets
 * VITE_CJ_UNLOCK — all stops open on that machine only. Plain `npm run dev`,
 * production builds, and fresh clones never have the flag: stops stay locked. */
const CJ_ALL_OPEN = import.meta.env.VITE_CJ_UNLOCK === 'open-roads';

const cjBandDiff = (b) => (b === 1 ? 'easy' : b === 2 ? 'medium' : 'hard');

async function cjFetchDrill(url, normalize) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('drill fetch failed');
  return normalize(await res.json());
}

const cjIntPart = (ans) => [{ type: 'int', answer: ans, display: String(ans) }];
const cjNumPart = (ans, tol, display) => [{ type: 'num', tol, answer: Number(ans), display: display != null ? String(display) : String(ans) }];

/** Per-topic adapters: fetch a raw generator question and normalize it to { prompt, parts }.
 *  The platform is stateless — every GET response carries its own answer — so drills are
 *  checked client-side with the same cjCheckPart used for authored templates. */
const CJ_DRILL_ADAPTERS = {
  addition: (b) => cjFetchDrill(`/addition-api/question?digits=${Math.min(b, 3)}`,
    (j) => ({ prompt: j.prompt, parts: cjIntPart(j.answer) })),
  basicarith: (b) => cjFetchDrill(`/basicarith-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: `Work out: ${j.prompt}`, parts: cjIntPart(j.answer) })),
  multiply: (b) => cjFetchDrill(`/multiply-api/question?table=${b === 1 ? cjRand(2, 5) : b === 2 ? cjRand(6, 9) : cjRand(7, 12)}`,
    (j) => ({ prompt: `Work out: ${j.prompt}`, parts: cjIntPart(j.answer) })),
  decimals: (b) => cjFetchDrill(`/decimals-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.01, j.display) })),
  fractionadd: (b) => cjFetchDrill(`/fractionadd-api/question?difficulty=${b === 1 ? 'easy' : 'medium'}`, (j) => {
    const { n1, d1, n2, d2, op } = j;
    let num, den;
    if (op === '+') { num = n1 * d2 + n2 * d1; den = d1 * d2; }
    else if (op === '−' || op === '-') { num = n1 * d2 - n2 * d1; den = d1 * d2; }
    else if (op === '×' || op === '*') { num = n1 * n2; den = d1 * d2; }
    else { num = n1 * d2; den = d1 * n2; }
    return { prompt: `Work out ${n1}/${d1} ${op} ${n2}/${d2} (give a simplified fraction).`,
      parts: [{ type: 'frac', tol: 0.001, answer: num / den, display: cjFracStr(num, den) }] };
  }),
  ratio: () => cjFetchDrill('/ratio-api/question?difficulty=easy',
    (j) => ({ prompt: j.prompt, parts: [{ type: 'ratio', a: j.ansA, b: j.ansB, display: `${j.ansA}:${j.ansB}` }] })),
  percent: (b) => cjFetchDrill(`/percent-api/question?tier=${b}&type=1`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.01) })),
  sdt: (b) => cjFetchDrill(`/sdt-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.05, j.display) })),
  mensur: (b) => cjFetchDrill(`/mensur-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.5) })),
  pythag: (b) => cjFetchDrill(`/pythag-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.5, j.display) })),
  quadratic: (b) => cjFetchDrill(`/quadratic-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: j.prompt, parts: cjIntPart(j.answer) })),
  trig: (b) => cjFetchDrill(`/trig-api/question?difficulty=${b === 1 ? 'easy' : 'medium'}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.5) })),
  lineareq: (b) => cjFetchDrill(`/lineareq-api/question?difficulty=${cjBandDiff(b)}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.1, j.display) })),
  diff: (b) => cjFetchDrill(`/diff-api/question?difficulty=${b === 1 ? 'easy' : 'medium'}`,
    (j) => ({ prompt: j.prompt, parts: cjNumPart(j.answer, 0.5, j.display) })),
  integ: () => cjFetchDrill('/integ-api/question?difficulty=easy', (j) => {
    const s = String(j.answer);
    const val = s.includes('/') ? Number(s.split('/')[0]) / Number(s.split('/')[1]) : Number(s);
    return { prompt: j.prompt, parts: [{ type: 'frac', tol: 0.001, answer: val, display: s }] };
  }),
  diffeq: (b) => cjFetchDrill(`/diffeq-api/question?difficulty=${b === 1 ? 'easy' : 'medium'}`,
    (j) => ({ prompt: j.prompt, parts: cjIntPart(j.answer) })),
};

/* ── Visuals (v1: Stops 1–6) ───────────────────────────────────────────────
 * Each template's gen() may attach a `vis` spec; CjVisual renders it. The
 * representation adapts to the quantity: literal emoji rows for small counts,
 * place-value blocks for big numbers, proportional bars for measures, segment
 * bars for fractions, tick-mark gears for ratios. Pure client-side rendering.
 * ─────────────────────────────────────────────────────────────────────── */

function cjEmojiRow(n, emoji) {
  return Array.from({ length: n }).fill(emoji).join(' ');
}

/** Sample a function into [x, f(x)] points for the 'plot' visual. */
const cjPts = (f, x0, x1, n = 24) =>
  Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, f(x)]; });

function cjBlocksStr(v) {
  const h = Math.floor(v / 100), t = Math.floor((v % 100) / 10), o = v % 10;
  return `${'💯 '.repeat(h)}${'🔟 '.repeat(t)}${'▪️'.repeat(o)}`.trim() || '0';
}

function CjGear({ teeth }) {
  const ticks = Array.from({ length: teeth }).map((_, i) => {
    const ang = (i / teeth) * 2 * Math.PI;
    return <line key={i} x1={34 * Math.cos(ang)} y1={34 * Math.sin(ang)} x2={44 * Math.cos(ang)} y2={44 * Math.sin(ang)} stroke="currentColor" strokeWidth="2.5" />;
  });
  return (
    <svg viewBox="-50 -50 100 100" className="cj-vis-gear" aria-hidden="true">
      <circle r="34" fill="none" stroke="currentColor" strokeWidth="2" />
      {ticks}
      <text textAnchor="middle" dy="5" fontSize="16" fill="currentColor">{teeth}</text>
    </svg>
  );
}

function CjVisual({ spec }) {
  if (!spec) return null;
  if (spec.kind === 'count') {
    return (
      <div className="cj-visual">
        <div className="cj-vis-row">
          {spec.groups.map((g, i) => (
            <span key={i} className={`cj-vis-group ${g.dim ? 'dim' : ''}`}>
              {i > 0 && spec.op && <span className="cj-vis-op">{spec.op}</span>}
              <span className="cj-vis-emojis">{cjEmojiRow(g.n, g.emoji)}</span>
              {g.label && <span className="cj-vis-glabel">{g.label}</span>}
            </span>
          ))}
        </div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'blocks') {
    return (
      <div className="cj-visual">
        {spec.items.map((it, i) => (
          <div key={i} className="cj-vis-blockrow">
            <span className="cj-vis-barlabel">{i > 0 && spec.op ? `${spec.op} ` : ''}{it.label}</span>
            <span className="cj-vis-emojis">{cjBlocksStr(it.value)}</span>
            <span className="cj-vis-barval">{it.value}</span>
          </div>
        ))}
        <p className="cj-vis-caption">💯 = 100 · 🔟 = 10 · ▪️ = 1{spec.caption ? ` — ${spec.caption}` : ''}</p>
      </div>
    );
  }
  if (spec.kind === 'share') {
    const each = spec.total / spec.people;
    return (
      <div className="cj-visual">
        <div className="cj-vis-row"><span className="cj-vis-emojis">{cjEmojiRow(spec.total, spec.emoji)}</span></div>
        <div className="cj-vis-op">↓ shared between {spec.people}</div>
        {Array.from({ length: spec.people }).map((_, i) => (
          <div key={i} className="cj-vis-row">{spec.personEmoji} <span className="cj-vis-emojis">{cjEmojiRow(each, spec.emoji)}</span></div>
        ))}
      </div>
    );
  }
  if (spec.kind === 'array') {
    return (
      <div className="cj-visual">
        {Array.from({ length: spec.rows }).map((_, r) => (
          <div key={r} className="cj-vis-row">
            {spec.rowLabel && <span className="cj-vis-glabel">{spec.rowLabel}</span>}
            <span className="cj-vis-emojis">{spec.pattern.join(' ')}</span>
          </div>
        ))}
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'bars') {
    const max = spec.max ?? Math.max(...spec.items.map((it) => it.value));
    return (
      <div className="cj-visual">
        {spec.items.map((it, i) => (
          <div key={i} className="cj-vis-barrow">
            <span className="cj-vis-barlabel">{it.label}</span>
            <span className="cj-vis-bartrack"><span className={`cj-vis-barfill f${i % 3}`} style={{ width: `${(it.value / max) * 100}%` }} /></span>
            <span className="cj-vis-barval">{it.value}{spec.unit ? ` ${spec.unit}` : ''}</span>
          </div>
        ))}
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'chips') {
    return (
      <div className="cj-visual">
        <div className="cj-vis-row"><span className="cj-vis-emojis">{cjEmojiRow(spec.n, spec.emoji)}</span></div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'tanks') {
    return (
      <div className="cj-visual">
        {spec.tanks.map((t, ti) => {
          const cells = [];
          t.fills.forEach((f) => { for (let k = 0; k < f.n; k++) cells.push(f.cls); });
          while (cells.length < t.den) cells.push('');
          return (
            <div key={ti} className="cj-vis-barrow">
              <span className="cj-vis-barlabel">{t.label}</span>
              <span className="cj-vis-tank">
                {cells.map((c, i) => <span key={i} className={`cj-vis-cell ${c}`} />)}
              </span>
            </div>
          );
        })}
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'cans') {
    return (
      <div className="cj-visual">
        {spec.groups.map((g, i) => (
          <div key={i} className="cj-vis-barrow">
            <span className="cj-vis-barlabel">{g.label}</span>
            <span className="cj-vis-emojis">{cjEmojiRow(g.whole, '🛢️')}</span>
            <span className="cj-vis-tank small">
              {Array.from({ length: g.den }).map((_, k) => <span key={k} className={`cj-vis-cell ${k < g.num ? 'a' : ''}`} />)}
            </span>
            <span className="cj-vis-barval">{g.whole} {g.num}/{g.den}</span>
          </div>
        ))}
        <p className="cj-vis-caption">🛢️ = one full can · the small bar is the part-can</p>
      </div>
    );
  }
  if (spec.kind === 'sharebar') {
    const sum = spec.shares.reduce((a, b) => a + b, 0);
    return (
      <div className="cj-visual">
        <span className="cj-vis-bartrack tall">
          {spec.shares.map((sh, i) => (
            <span key={i} className={`cj-vis-barfill f${i % 3}`} style={{ width: `${(sh / sum) * 100}%` }}>{sh} {sh === 1 ? 'share' : 'shares'}</span>
          ))}
        </span>
        <p className="cj-vis-caption">the whole bar = {spec.total} {spec.unit || ''} = {sum} equal shares</p>
      </div>
    );
  }
  if (spec.kind === 'gears') {
    return (
      <div className="cj-visual">
        <div className="cj-vis-row gears">
          <span className="cj-vis-glabel">engine</span>
          <CjGear teeth={spec.a} />
          <span className="cj-vis-op">:</span>
          <CjGear teeth={spec.b} />
          <span className="cj-vis-glabel">wheel</span>
        </div>
        <p className="cj-vis-caption">count the teeth marks on each gear</p>
      </div>
    );
  }
  if (spec.kind === 'battery') {
    // Battery/percent bar: segments fill left→right; anything unfilled stays empty.
    return (
      <div className="cj-visual">
        <div className="cj-vis-row">
          <span className="cj-vis-batt">
            {spec.segs.map((s, i) => (
              <span key={i} className={`cj-vis-battfill ${s.cls}`} style={{ width: `${s.pct}%` }}>{s.pct >= 12 ? `${s.pct}%` : ''}</span>
            ))}
          </span>
          <span className="cj-vis-battcap" />
        </div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'dst') {
    // The classic D / S×T dashboard triangle; the unknown corner shows "?".
    const txt = (key, val) => (spec.unknown === key ? '= ?' : `= ${val}`);
    return (
      <div className="cj-visual">
        <div className="cj-vis-row gears">
          <svg viewBox="0 0 200 122" className="cj-vis-dst" aria-hidden="true">
            <polygon points="100,8 12,112 188,112" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="47" y1="72" x2="153" y2="72" stroke="currentColor" strokeWidth="1.5" />
            <line x1="100" y1="72" x2="100" y2="112" stroke="currentColor" strokeWidth="1.5" />
            <text x="100" y="56" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight={spec.unknown === 'd' ? 700 : 400}>D {txt('d', spec.d)}</text>
            <text x="70" y="98" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight={spec.unknown === 's' ? 700 : 400}>S {txt('s', spec.s)}</text>
            <text x="132" y="98" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight={spec.unknown === 't' ? 700 : 400}>T {txt('t', spec.t)}</text>
          </svg>
        </div>
        <p className="cj-vis-caption">D = S × T · S = D ÷ T · T = D ÷ S{spec.caption ? ` — ${spec.caption}` : ''}</p>
      </div>
    );
  }
  if (spec.kind === 'circle') {
    return (
      <div className="cj-visual">
        <div className="cj-vis-row gears">
          <svg viewBox="0 0 120 122" className="cj-vis-circle" aria-hidden="true">
            <circle cx="60" cy="52" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            {spec.d
              ? <line x1="20" y1="52" x2="100" y2="52" stroke="var(--clr-accent)" strokeWidth="2" />
              : <line x1="60" y1="52" x2="100" y2="52" stroke="var(--clr-accent)" strokeWidth="2" />}
            <text x="60" y="44" textAnchor="middle" fontSize="11" fill="currentColor">{spec.label}</text>
            <line x1="8" y1="112" x2="112" y2="112" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
            <text x="60" y="106" textAnchor="middle" fontSize="9" fill="currentColor">one turn = one circumference</text>
          </svg>
        </div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'sector') {
    const rad = (spec.deg * Math.PI) / 180;
    const x = 60 + 44 * Math.sin(rad), y = 60 - 44 * Math.cos(rad);
    const large = spec.deg > 180 ? 1 : 0;
    return (
      <div className="cj-visual">
        <div className="cj-vis-row gears">
          <svg viewBox="0 0 120 132" className="cj-vis-circle" aria-hidden="true">
            <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
            <path d={`M 60 60 L 60 16 A 44 44 0 ${large} 1 ${x} ${y} Z`}
              fill={spec.arcOnly ? 'none' : 'var(--clr-accent)'} fillOpacity="0.45"
              stroke="var(--clr-accent)" strokeWidth={spec.arcOnly ? 3 : 1.5} />
            <text x="60" y="128" textAnchor="middle" fontSize="11" fill="currentColor">r = {spec.r} cm · {spec.deg}°</text>
          </svg>
        </div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'rtri') {
    const tris = spec.tris || [spec];
    return (
      <div className="cj-visual">
        <div className="cj-vis-row gears">
          {tris.map((t, i) => {
            const b = Math.max(Number(t.base) || 100, 0.001), r = Math.max(Number(t.rise) || 55, 0.001);
            const W = 240, H = 118, pad = 14;
            const sc = Math.min(150 / b, (H - 2 * pad) / r);
            const bw = Math.max(70, b * sc), rh = Math.max(36, r * sc);
            const x0 = pad, y0 = H - pad;
            const ang = Math.atan2(rh, bw);
            return (
              <svg key={i} viewBox={`0 0 ${W} ${H + 16}`} className="cj-vis-rtri" aria-hidden="true">
                <polygon points={`${x0},${y0} ${x0 + bw},${y0} ${x0 + bw},${y0 - rh}`} fill="var(--clr-accent)" opacity="0.18" />
                <polyline points={`${x0},${y0} ${x0 + bw},${y0} ${x0 + bw},${y0 - rh} ${x0},${y0}`} fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x={x0 + bw - 11} y={y0 - 11} width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1" />
                {t.angle != null && <path d={`M ${x0 + 30} ${y0} A 30 30 0 0 0 ${x0 + 30 * Math.cos(ang)} ${y0 - 30 * Math.sin(ang)}`} fill="none" stroke="var(--clr-accent)" strokeWidth="2" />}
                {t.angle != null && <text x={x0 + 36} y={y0 - 6} fontSize="11" fill="currentColor">{t.angle}</text>}
                {t.baseLabel && <text x={x0 + bw / 2} y={y0 + 14} textAnchor="middle" fontSize="11" fill="currentColor">{t.baseLabel}</text>}
                {t.riseLabel && <text x={x0 + bw + 5} y={y0 - rh / 2} fontSize="11" fill="currentColor">{t.riseLabel}</text>}
                {t.hypLabel && <text x={x0 + bw / 2 - 8} y={y0 - rh / 2 - 10} textAnchor="end" fontSize="11" fill="currentColor">{t.hypLabel}</text>}
              </svg>
            );
          })}
        </div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'plot') {
    const W = 260, H = 150, pad = 26;
    const all = spec.series.flatMap((s) => s.pts).concat((spec.marks || []).map((m) => [m.x, m.y]));
    const xMin = Math.min(0, ...all.map((p) => p[0])), xMax = Math.max(...all.map((p) => p[0]));
    const yMin = Math.min(0, ...all.map((p) => p[1])), yMax = Math.max(...all.map((p) => p[1]));
    const px = (x) => pad + ((x - xMin) / (xMax - xMin || 1)) * (W - 2 * pad);
    const py = (y) => H - pad - ((y - yMin) / (yMax - yMin || 1)) * (H - 2 * pad);
    return (
      <div className="cj-visual">
        <svg viewBox={`0 0 ${W} ${H}`} className="cj-vis-plot" aria-hidden="true">
          <line x1={pad} y1={py(0)} x2={W - pad + 8} y2={py(0)} stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1={px(0)} y1={pad - 8} x2={px(0)} y2={H - pad} stroke="currentColor" strokeWidth="1" opacity="0.6" />
          {spec.series.map((s, i) => (
            <g key={i}>
              {spec.area && (
                <polygon
                  points={`${px(s.pts[0][0])},${py(0)} ${s.pts.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} ${px(s.pts[s.pts.length - 1][0])},${py(0)}`}
                  fill="var(--clr-accent)" opacity="0.3"
                />
              )}
              <polyline points={s.pts.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={i === 0 ? 'var(--clr-accent)' : '#3b82c4'} strokeWidth="2.5" />
              {s.label && <text x={px(s.pts[s.pts.length - 1][0]) - 4} y={py(s.pts[s.pts.length - 1][1]) - 6} textAnchor="end" fontSize="11" fill="currentColor">{s.label}</text>}
            </g>
          ))}
          {(spec.marks || []).map((m, i) => (
            <g key={i}>
              <circle cx={px(m.x)} cy={py(m.y)} r="4" fill="var(--clr-wrong, #c0392b)" />
              <text x={px(m.x) + 6} y={py(m.y) - 7} fontSize="11" fill="currentColor">{m.label}</text>
            </g>
          ))}
          <text x={W - pad + 6} y={H - 8} textAnchor="end" fontSize="10" fill="currentColor">{spec.xLabel}</text>
          <text x={4} y={pad - 12} fontSize="10" fill="currentColor">{spec.yLabel}</text>
        </svg>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'meet') {
    return (
      <div className="cj-visual">
        <div className="cj-vis-meet">
          <span className="cj-vis-meetcar">{spec.mode === 'toward' ? '🚗' : '🚗'}<br /><small>{spec.aLabel}</small></span>
          <span className="cj-vis-road">{spec.mode === 'toward' ? '⟶' : '⟶'} {spec.gapLabel} {spec.mode === 'toward' ? '⟵' : '⟶'}</span>
          <span className="cj-vis-meetcar">{spec.mode === 'toward' ? '🚙' : '🚚'}<br /><small>{spec.bLabel}</small></span>
        </div>
        {spec.caption && <p className="cj-vis-caption">{spec.caption}</p>}
      </div>
    );
  }
  if (spec.kind === 'eqmap') {
    return (
      <div className="cj-visual">
        <div className="cj-vis-eq">{spec.eq}</div>
        {spec.note && <p className="cj-vis-caption">{spec.note}</p>}
      </div>
    );
  }
  return null;
}

/* ── Question sourcing ─────────────────────────────────────────────────── */

const CJ_PRACTICE_BANDS = [1, 1, 2, 2, 3, 3]; // the 6 scored practice questions
const CJ_PRACTICE_NEED = 4;                   // correct needed to unlock the check
const CJ_CHECK_TOTAL = 4;                     // mastery check length (band 3 only)
const CJ_CHECK_NEED = 3;                      // correct needed to pass

/* After a FAILED mastery check the student shouldn't redo the full 6-question
 * ladder: the remedial run is shorter (1 × band 1, 2 × band 2, 2 × band 3)
 * with a proportional gate, and overflow practice serves band 3 only. */
const CJ_REMEDIAL_BANDS = [1, 2, 2, 3, 3];
const CJ_REMEDIAL_NEED = 3;

/** Pick a template of the given band, avoiding templates this session has
 *  already served (`seen` = tplIds) as far as the pool allows: unseen first,
 *  then least-served. Numbers are fresh on every gen() regardless. */
function cjNewQuestion(stop, band, seen = []) {
  const pool = stop.templates.filter((t) => t.band === band);
  const timesSeen = (id) => seen.filter((s) => s === id).length;
  const min = Math.min(...pool.map((t) => timesSeen(t.id)));
  const freshest = pool.filter((t) => timesSeen(t.id) === min);
  const tpl = cjPick(freshest);
  return { tplId: tpl.id, band, ...tpl.gen() };
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function CarJourneyApp({ onBack, setMode }) {
  const [screen, setScreen] = useState('roadmap'); // roadmap | bridge | practice | check | review | stagedone | finale
  const [stopIdx, setStopIdx] = useState(0);
  const [progress, setProgress] = useState(cjLoadProgress);

  // Practice / check runtime state
  const [qNum, setQNum] = useState(0);          // questions served so far in this phase
  const [nCorrect, setNCorrect] = useState(0);  // correct so far in this phase
  const [question, setQuestion] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [misses, setMisses] = useState(0);      // misses on the current question
  const [feedback, setFeedback] = useState(null); // { correct: bool, final: bool }
  const [checkResults, setCheckResults] = useState([]);
  const [pit, setPit] = useState(null); // { idx, band } while Tier-3 pit-stop drills run
  const [remedial, setRemedial] = useState(false); // true after a failed check → shorter band ladder
  const seenRef = useRef([]); // tplIds served this visit (practice + check) — template-repeat avoidance

  // Roadmap: one stop card at a time (maintainer feedback: 16 at once overwhelms).
  const [cardIdx, setCardIdx] = useState(null); // null → first uncompleted stop
  const [journeyOpen, setJourneyOpen] = useState(false); // read-only list of all 16 mysteries
  const [showVis, setShowVis] = useState(false); // Visualize panel toggle (persists across questions)
  const [challengeIdx, setChallengeIdx] = useState(null); // stop index whose license+challenges overlay is open (from a done card)

  const stop = CJ_STOPS[stopIdx];
  const doneCount = CJ_STOPS.reduce((n, _, i) => n + (cjStopDone(progress, i) ? 1 : 0), 0);
  const pitAvailable = CJ_TIER3_DRILLS && !!CJ_DRILL_ADAPTERS[stop.key];

  const persist = (next) => { setProgress(next); cjSaveProgress(next); };

  function startStop(i) {
    setStopIdx(i);
    seenRef.current = []; // fresh visit: template-repeat avoidance starts over
    setRemedial(cjGetResume(progress, CJ_STOPS[i])?.remedial ?? false);
    setScreen('bridge');
  }

  /* The band ladder in force: the full 6 normally, the shorter remedial run
   * after a failed mastery check. Overflow practice past the ladder cycles
   * 1→2→3 normally, but stays on band 3 in remedial mode. */
  const ladder = (rem) => (rem ? CJ_REMEDIAL_BANDS : CJ_PRACTICE_BANDS);
  const ladderNeed = (rem) => (rem ? CJ_REMEDIAL_NEED : CJ_PRACTICE_NEED);
  const bandAt = (served, rem) => {
    const L = ladder(rem);
    if (served < L.length) return L[served];
    return rem ? 3 : [1, 2, 3][(served - L.length) % 3];
  };

  function serveQuestion(band) {
    const q = cjNewQuestion(stop, band, seenRef.current);
    seenRef.current = [...seenRef.current, q.tplId];
    setQuestion(q); setInputs(q.parts.map(() => '')); setMisses(0); setFeedback(null);
  }

  /** Start (or resume) practice. A band-boundary checkpoint restores the
   *  served/correct counts, so only the current band's progress is ever lost. */
  function beginPractice(resume = null) {
    setCheckResults([]); setPit(null);
    const rem = resume?.remedial ?? false;
    setRemedial(rem);
    const served = resume?.served ?? 0;
    setQNum(served); setNCorrect(resume?.correct ?? 0);
    serveQuestion(bandAt(served, rem));
    setScreen('practice');
  }

  function beginCheck() {
    setQNum(0); setNCorrect(0); setCheckResults([]); setPit(null);
    serveQuestion(3);
    setScreen('check');
  }

  function nextPracticeQuestion(justCorrect) {
    const served = qNum + 1;
    const correct = nCorrect + (justCorrect ? 1 : 0);
    setQNum(served); setNCorrect(correct);
    const L = ladder(remedial);
    if (served >= L.length && correct >= ladderNeed(remedial)) {
      persist(cjSaveResumePoint(progress, stop, { served, correct, remedial, checkReady: true }));
      beginCheck();
      return;
    }
    // Band-level checkpoint: save whenever the next question starts a new band.
    if (served < L.length && L[served] !== L[served - 1]) {
      persist(cjSaveResumePoint(progress, stop, { served, correct, remedial, checkReady: false }));
    }
    serveQuestion(bandAt(served, remedial));
  }

  function submitPractice() {
    const allRight = question.parts.every((p, i) => cjCheckPart(p, inputs[i]));
    if (allRight) {
      setFeedback({ correct: true, final: true });
      if (!question.retry) persist(cjRecord(progress, stop, true)); // retry was already recorded as the original miss
    } else if (question.retry) {
      // Post-pit-stop retry: never reveals, never re-triggers a pit stop —
      // the same question simply repeats until it's answered correctly.
      setMisses(misses + 1);
      setFeedback({ correct: false, final: false });
    } else {
      const m = misses + 1;
      setMisses(m);
      setFeedback({ correct: false, final: m >= 3 });
      if (m >= 3) persist(cjRecord(progress, stop, false));
    }
  }

  function submitCheck() {
    const allRight = question.parts.every((p, i) => cjCheckPart(p, inputs[i]));
    const results = [...checkResults, { q: question, userInputs: [...inputs], correct: allRight }];
    const served = qNum + 1;
    const correct = nCorrect + (allRight ? 1 : 0);
    setCheckResults(results);
    setQNum(served); setNCorrect(correct);
    let next = cjRecord(progress, stop, allRight);
    if (served >= CJ_CHECK_TOTAL) {
      if (correct >= CJ_CHECK_NEED) {
        next = cjClearResume(cjMarkPassed(next, stop), stop); // stop is done — no checkpoint to keep
        persist(next);
        setScreen('stagedone');
      } else {
        // Failed: the re-run is the SHORTER remedial ladder, from the start.
        setRemedial(true);
        next = cjSaveResumePoint(next, stop, { served: 0, correct: 0, remedial: true, checkReady: false });
        persist(next);
        setScreen('review');
      }
      return;
    }
    persist(next);
    serveQuestion(3);
  }

  /* ── Tier-3 pit stop: fetch raw drills from the topic's real server generator.
     Drills never count toward the gate; any failure falls back to normal flow. ── */

  function serveDrill(band, idx, returnQ) {
    const adapter = CJ_DRILL_ADAPTERS[stop.key];
    setPit({ idx, band, returnQ }); // returnQ: the exact question instance that sent us here
    adapter(band)
      .then((q) => {
        setQuestion({ ...q, drill: true, band });
        setInputs(q.parts.map(() => ''));
        setMisses(0); setFeedback(null);
      })
      .catch(() => { setPit(null); nextPracticeQuestion(false); });
  }

  function startPitStop(band) {
    if (!pitAvailable) { nextPracticeQuestion(false); return; }
    serveDrill(band, 0, question);
  }

  function submitDrill() {
    const allRight = question.parts.every((p, i) => cjCheckPart(p, inputs[i]));
    setFeedback({ correct: allRight, final: true });
  }

  /** Wrong drill → the same drill again, until it's right. */
  function retryDrill() {
    setInputs(question.parts.map(() => ''));
    setFeedback(null);
  }

  function nextDrill() {
    const nextIdx = pit.idx + 1;
    if (nextIdx >= CJ_DRILL_COUNT) {
      // Pit stop complete → back to the exact question that caused it,
      // same numbers, repeating until answered correctly.
      const rq = { ...pit.returnQ, retry: true };
      setPit(null);
      setQuestion(rq); setInputs(rq.parts.map(() => ''));
      setMisses(2); // a wrong answer surfaces the hint immediately
      setFeedback(null);
      return;
    }
    serveDrill(pit.band, nextIdx, pit.returnQ);
  }

  /* ── Screens ── */

  // A stop is open when the one before it is completed (or it's the first) —
  // CJ_ALL_OPEN (tester build) opens everything.
  const isUnlocked = (i) => CJ_ALL_OPEN || i === 0 || cjStopDone(progress, i - 1);

  if (screen === 'roadmap') {
    const firstOpen = CJ_STOPS.findIndex((_, i) => !cjStopDone(progress, i));
    const shownIdx = cardIdx ?? (firstOpen === -1 ? CJ_STOPS.length - 1 : firstOpen);
    const s = CJ_STOPS[shownIdx];
    const done = cjStopDone(progress, shownIdx);
    const unlocked = isUnlocked(shownIdx);
    return (
      <div className="cj-app">
        <button className="cj-back" onClick={onBack}>← Back to menu</button>
        <h1 className="cj-title">🚗 The Car Journey</h1>
        <div className="cj-progressbar" aria-label={`${doneCount} of ${CJ_STOPS.length} stops complete`}>
          <div className="cj-progressbar-fill" style={{ width: `${(doneCount / CJ_STOPS.length) * 100}%` }} />
          <span className="cj-progressbar-label">{doneCount} / {CJ_STOPS.length} stops</span>
        </div>
        {doneCount === CJ_STOPS.length && (
          <button className="cj-primary cj-finale-btn" onClick={() => setScreen('finale')}>🏁 See your completed journey</button>
        )}
        <div className="cj-carousel">
          <button className="cj-card-nav" disabled={shownIdx === 0} onClick={() => setCardIdx(shownIdx - 1)} aria-label="Previous stop">◀</button>
          {unlocked || done ? (
            <div className={`cj-stop cj-stop-card ${done ? 'done' : 'open'}`}>
              <span className="cj-stop-emoji" aria-hidden="true">{s.emoji}</span>
              <span className="cj-stop-body">
                <span className="cj-stop-name">{shownIdx + 1}. {s.title}</span>
                <span className="cj-stop-q">{s.carQuestion}</span>
              </span>
              {done ? (
                <span className="cj-stop-done-actions">
                  <button className="cj-stop-action done" onClick={() => startStop(shownIdx)}>✓ Replay</button>
                  <button className="cj-stop-action license" onClick={() => setChallengeIdx(shownIdx)}>🪪 License</button>
                </span>
              ) : (
                <button className="cj-stop-action" onClick={() => startStop(shownIdx)}>Drive ▶</button>
              )}
            </div>
          ) : (
            <div className="cj-stop cj-stop-card locked">
              <span className="cj-stop-emoji" aria-hidden="true">{s.emoji}</span>
              <span className="cj-stop-body">
                <span className="cj-stop-name">Stop {shownIdx + 1} · 🔒</span>
                <span className="cj-stop-q">{s.carQuestion}</span>
                <span className="cj-stop-meta">Finish the previous stop to unlock this mystery.</span>
              </span>
            </div>
          )}
          <button className="cj-card-nav" disabled={shownIdx === CJ_STOPS.length - 1} onClick={() => setCardIdx(shownIdx + 1)} aria-label="Next stop">▶</button>
        </div>
        <div className="cj-actions">
          <button className="cj-secondary" onClick={() => setJourneyOpen(true)}>🗺️ The journey — all 16 mysteries</button>
        </div>
        {challengeIdx !== null && (
          <div className="cj-journey-overlay" onClick={() => setChallengeIdx(null)}>
            <div className="cj-journey-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cj-journey-head">
                <h3 className="cj-journey-title">{CJ_STOPS[challengeIdx].emoji} Stop {challengeIdx + 1}: {CJ_STOPS[challengeIdx].title}</h3>
                <button className="cj-journey-close" onClick={() => setChallengeIdx(null)}>✕</button>
              </div>
              <CjLicense stopKey={CJ_STOPS[challengeIdx].key} onGo={setMode ? (m) => setMode(m) : null} />
              <CjChallengeSet stopKey={CJ_STOPS[challengeIdx].key} />
            </div>
          </div>
        )}
        {journeyOpen && (
          <div className="cj-journey-overlay" onClick={() => setJourneyOpen(false)}>
            <div className="cj-journey-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cj-journey-head">
                <h3 className="cj-journey-title">🗺️ The journey ahead</h3>
                <button className="cj-journey-close" onClick={() => setJourneyOpen(false)}>✕</button>
              </div>
              <p className="cj-journey-sub">Sixteen questions the car will teach you to answer.</p>
              <ol className="cj-journey-list">
                {CJ_STOPS.map((st, i) => {
                  const d = cjStopDone(progress, i);
                  const u = isUnlocked(i);
                  return (
                    <li key={st.key} className={`cj-journey-item ${d ? 'done' : u ? 'open' : 'locked'}`}>
                      <span className="cj-journey-status">{d ? '✓' : u ? st.emoji : '🔒'}</span>
                      <span>{st.carQuestion}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'bridge') {
    const resume = cjGetResume(progress, stop);
    const resumeLadder = ladder(resume?.remedial ?? false);
    return (
      <div className="cj-app">
        <button className="cj-back" onClick={() => setScreen('roadmap')}>← Roadmap</button>
        <div className="cj-bridge">
          <div className="cj-bridge-emoji" aria-hidden="true">{stop.emoji}</div>
          <div className="cj-bridge-stopno">Stop {stopIdx + 1} of {CJ_STOPS.length}</div>
          <h2 className="cj-bridge-q">{stop.carQuestion}</h2>
          {resume && (resume.served > 0 || resume.checkReady) ? (
            <>
              <p className="cj-resume-note">
                {resume.checkReady
                  ? '🚩 You already cleared the practice here — the mastery check is waiting.'
                  : `🚩 Picking up where you parked: ${resume.correct} correct from ${resume.served} of ${resumeLadder.length} questions.`}
              </p>
              <button className="cj-primary" onClick={() => (resume.checkReady ? beginCheck() : beginPractice(resume))}>
                {resume.checkReady ? 'Take the mastery check' : 'Resume the drive'}
              </button>
              <button className="cj-secondary" onClick={() => { persist(cjClearResume(progress, stop)); beginPractice(); }}>
                Start this stop over
              </button>
            </>
          ) : (
            <button className="cj-primary" onClick={() => beginPractice(resume)}>I'm ready — let's drive</button>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'practice' || screen === 'check') {
    const isCheck = screen === 'check';
    const total = isCheck ? CJ_CHECK_TOTAL : ladder(remedial).length;
    return (
      <div className="cj-app">
        <button className="cj-back" onClick={() => setScreen('roadmap')}>
          {isCheck ? '← Roadmap (this check is lost)' : '← Roadmap (only this band\'s progress is lost)'}
        </button>
        <div className="cj-quiz-header">
          <span>{stop.emoji} Stop {stopIdx + 1}: {stop.title}</span>
          <span className={`cj-phase-tag ${isCheck ? 'check' : ''}`}>
            {pit ? `🔧 Pit stop · drill ${pit.idx + 1}/${CJ_DRILL_COUNT}` : isCheck ? '⭐ Mastery check' : `Practice · band ${question.band}`}
          </span>
        </div>
        {!pit && (
          <div className="cj-pips">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`cj-pip ${i < qNum ? 'seen' : ''} ${i === Math.min(qNum, total - 1) && qNum < total ? 'now' : ''}`} />
            ))}
            <span className="cj-pip-label">{nCorrect} correct{isCheck ? ` (need ${CJ_CHECK_NEED})` : ` (need ${ladderNeed(remedial)})`}</span>
          </div>
        )}

        <div className="cj-question">
          <p className="cj-prompt">{question.prompt}</p>
          {question.parts.map((p, i) => (
            <label key={i} className="cj-input-row">
              {p.label && <span className="cj-input-label">{p.label}</span>}
              <input
                className="cj-input"
                value={inputs[i]}
                disabled={!!feedback?.final || (feedback?.correct === true)}
                placeholder={p.type === 'ratio' ? 'e.g. 3:2' : p.type === 'frac' ? 'e.g. 3/4 or 1 1/2' : p.type === 'text' ? 'yes / no' : 'Your answer'}
                onChange={(e) => setInputs(inputs.map((v, j) => (j === i ? e.target.value : v)))}
                onKeyDown={(e) => { if (e.key === 'Enter') (pit ? submitDrill : isCheck ? submitCheck : submitPractice)(); }}
              />
              {p.unit && <span className="cj-unit">{p.unit}</span>}
            </label>
          ))}

          {question.vis && showVis && (
            <div className="cj-visual-panel"><CjVisual spec={question.vis} /></div>
          )}

          {!isCheck && feedback && !feedback.correct && !feedback.final && (
            <div className="cj-feedback wrong">Not yet — try again. {misses >= 2 && <span className="cj-hint">💡 {question.hint}</span>}</div>
          )}
          {!isCheck && feedback && !feedback.correct && feedback.final && (
            pit ? (
              <div className="cj-feedback wrong">Not this time — the same drill comes again. You've got this.</div>
            ) : pitAvailable && !question.drill ? (
              <div className="cj-feedback wrong">Three tries — the car needs a pit stop! Fix the basics with 3 quick drills; this exact question will be waiting for you after.</div>
            ) : (
              <div className="cj-feedback wrong">
                The answer was <strong>{question.parts.map((p) => p.display).join(' , ')}</strong>.
                {question.explanation && <div className="cj-expl">{question.explanation}</div>}
              </div>
            )
          )}
          {!isCheck && feedback?.correct && (
            <div className="cj-feedback right">
              ✅ Correct!
              {question.explanation && <div className="cj-expl">{question.explanation}</div>}
            </div>
          )}

          <div className="cj-actions">
            {question.vis && (
              <button className="cj-secondary" onClick={() => setShowVis(!showVis)}>{showVis ? '🙈 Hide visual' : '👁 Visualize'}</button>
            )}
            {feedback?.correct || feedback?.final ? (!isCheck && (
              pit ? (
                feedback.correct ? (
                  <button className="cj-primary" onClick={nextDrill}>
                    {pit.idx + 1 >= CJ_DRILL_COUNT ? '🚗 Back to your question →' : 'Next drill →'}
                  </button>
                ) : (
                  <button className="cj-primary" onClick={retryDrill}>Try again</button>
                )
              ) : !feedback.correct && pitAvailable && !question.drill ? (
                <button className="cj-primary" onClick={() => startPitStop(question.band)}>🔧 Pit stop: {CJ_DRILL_COUNT} quick drills</button>
              ) : (
                <button className="cj-primary" onClick={() => nextPracticeQuestion(feedback.correct && !question.retry)}>Next →</button>
              )
            )) : (
              <button className="cj-primary" onClick={pit ? submitDrill : isCheck ? submitCheck : submitPractice}>Submit</button>
            )}
          </div>
          {isCheck && <p className="cj-check-note">One try per question. Results at the end — drive carefully.</p>}
          {pit && <p className="cj-check-note">Plain numbers, no story — pit stops fix the mechanics. Drills don't count toward the gate.</p>}
          {!pit && question.retry && <p className="cj-check-note">🔧 Pit stop done. This is the question that sent you there — same numbers. Take it again.</p>}
        </div>
      </div>
    );
  }

  if (screen === 'review') {
    const missed = checkResults.filter((r) => !r.correct);
    return (
      <div className="cj-app">
        <h2 className="cj-title">Almost — {nCorrect} of {CJ_CHECK_TOTAL}</h2>
        <p className="cj-tagline">
          You need {CJ_CHECK_NEED}. Study the ones that got away, then take a fresh check — new numbers, same ideas.
          If you'd rather warm up first, the practice run is a short one now ({CJ_REMEDIAL_BANDS.length} questions, not {CJ_PRACTICE_BANDS.length}) —
          you've already proved the easy end.
        </p>
        {missed.map((r, i) => (
          <div key={i} className="cj-review-card">
            <p className="cj-prompt">{r.q.prompt}</p>
            <p>Answer: <strong>{r.q.parts.map((p) => p.display).join(' , ')}</strong></p>
            <div className="cj-expl">{r.q.explanation}</div>
          </div>
        ))}
        <div className="cj-actions">
          <button className="cj-primary" onClick={() => beginCheck()}>Take a fresh check</button>
          <button
            className="cj-secondary"
            onClick={() => beginPractice({ served: 0, correct: 0, remedial: true, checkReady: false })}
          >
            More practice first ({CJ_REMEDIAL_BANDS.length} questions)
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'stagedone') {
    const isLast = stopIdx === CJ_STOPS.length - 1;
    return (
      <div className="cj-app">
        <div className="cj-stagedone">
          <div className="cj-bridge-emoji" aria-hidden="true">{stop.emoji}</div>
          <h2 className="cj-title">Stop {stopIdx + 1} complete!</h2>
          <p className="cj-role">🏆 {stop.role}</p>
          <CjLicense stopKey={stop.key} onGo={setMode ? (m) => setMode(m) : null} />
          <CjChallengeSet stopKey={stop.key} />
          <div className="cj-actions">
            {isLast ? (
              <button className="cj-primary" onClick={() => setScreen('finale')}>🏁 Finish the journey</button>
            ) : (
              <button className="cj-primary" onClick={() => startStop(stopIdx + 1)}>Next stop: {CJ_STOPS[stopIdx + 1].emoji} {CJ_STOPS[stopIdx + 1].title} →</button>
            )}
            <button className="cj-secondary" onClick={() => setScreen('roadmap')}>Back to the roadmap</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'finale') {
    return (
      <div className="cj-app">
        <button className="cj-back" onClick={() => setScreen('roadmap')}>← Roadmap</button>
        <h1 className="cj-title">🏁 Journey complete</h1>
        <p className="cj-tagline">
          Sixteen stops ago you were counting cars in a school car park. Today you differentiated the speedometer,
          integrated the odometer, and read the suspension's own equation. It was one road the whole time — every stop
          used the ones before it, exactly the way mathematics does.
        </p>
        <table className="cj-recap">
          <thead><tr><th>Stop</th><th>What the car asked</th><th>Math you earned</th></tr></thead>
          <tbody>
            {CJ_STOPS.map((s, i) => (
              <tr key={s.key} className={cjStopDone(progress, i) ? 'done' : ''}>
                <td>{s.emoji} {i + 1}</td>
                <td>{s.carQuestion}</td>
                <td>{s.skill}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="cj-tagline">The odometer's secret, one last time: <em>the speedometer differentiates, the odometer integrates — they were the same function all along.</em></p>
      </div>
    );
  }

  return null;
}

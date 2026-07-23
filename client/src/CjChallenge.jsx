/**
 * CAR JOURNEY — ROAD LICENSE + "NOW CAN YOU SOLVE?" (Feature CR handoff layer)
 *
 * Two things live here, both shown after a stop's mastery check is passed:
 *
 * 1. CJ_HANDOFF + <CjLicense> — the "Road License": tells the student the exact
 *    Tenali difficulty they have EARNED on this stop's topic(s), with one tap to
 *    open the matching Tenali card. Levels are calibrated per stop (a stop's
 *    band-3 mastery check sits at a specific tier of the host generator, minus
 *    any shapes the stop never taught) — that's why some stops earn Hard and
 *    others only Medium or Easy. The student always chooses; nothing is forced.
 *
 * 2. CJ_CHALLENGES + <CjChallengeSet> — "🔧 Now can you solve…": 6 ungraded,
 *    untimed higher-order questions per stop, in progressive-overload order
 *    (each question demands a little more than the one before). A mix of
 *    same-theme real-world questions and raw academic ones (the
 *    decontextualization bridge), fusing the stop's topic ONLY with topics from
 *    earlier stops. No submission anywhere — every question carries its own
 *    "Show solution" walkthrough. Further reading, not another gate.
 *
 * Self-contained: own tiny helpers, no imports from CarJourneyApp.jsx.
 * Styles live in CarJourneyApp.css under .cj-license / .cj-challenge.
 */
import { useMemo, useState } from 'react';
import { cjSetReco } from './cjReco';

/* ── tiny local helpers (answer-first generation, house style) ── */
const czRand = (lo, hi, step = 1) => lo + step * Math.floor(Math.random() * ((hi - lo) / step + 1));
const czPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. THE ROAD LICENSE — earned Tenali start level per stop
 * `mode` is the Tenali modeMap key (used for one-tap navigation).
 * ──────────────────────────────────────────────────────────────────────────── */
const CJ_HANDOFF = {
  addition:    [{ mode: 'addition',    name: 'Addition',             level: '3-digit numbers', diff: 'hard' }],
  basicarith:  [{ mode: 'basicarith',  name: 'Arithmetic',           level: 'Medium',  diff: 'medium' }],
  multiply:    [{ mode: 'multiply',    name: 'Multiplication',       level: 'Hard — tables up to 12', diff: 'hard' }],
  decimals:    [{ mode: 'decimals',    name: 'Decimals',             level: 'Hard',    diff: 'hard' }],
  fractionadd: [{ mode: 'fractionadd', name: 'Fractions',            level: 'Medium',  diff: 'medium' }],
  ratio:       [{ mode: 'ratio',       name: 'Ratio',                level: 'Hard',    diff: 'hard' }],
  percent:     [{ mode: 'percent',     name: 'Percentages',          level: 'Hard',    diff: 'hard' }],
  sdt:         [{ mode: 'sdt',         name: 'Speed, Distance, Time', level: 'Hard',   diff: 'hard' }],
  mensur:      [{ mode: 'mensur',      name: 'Mensuration',          level: 'Easy',    diff: 'easy' },
                { mode: 'circmeasure', name: 'Circular Measure',     level: 'Hard',    diff: 'hard' }],
  pythag:      [{ mode: 'pythag',      name: "Pythagoras' Theorem",  level: 'Hard',    diff: 'hard' }],
  quadratic:   [{ mode: 'quadratic',   name: 'Quadratic',            level: 'Medium',  diff: 'medium' }],
  trig:        [{ mode: 'trig',        name: 'Trigonometry',         level: 'Medium',  diff: 'medium' }],
  lineareq:    [{ mode: 'lineareq',    name: 'Linear Equations',     level: 'Medium',  diff: 'medium' },
                { mode: 'simul',       name: 'Sim. Equations',       level: 'Easy',    diff: 'easy' }],
  diff:        [{ mode: 'diff',        name: 'Differentiation',      level: 'Hard',    diff: 'hard' }],
  integ:       [{ mode: 'integ',       name: 'Integration',          level: 'Hard',    diff: 'hard' }],
  diffeq:      [{ mode: 'diffeq',      name: 'Differential Eq.',     level: 'Hard',    diff: 'hard' }],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. "NOW CAN YOU SOLVE?" — 6 higher-order questions per stop.
 * Array order IS the progressive-overload order: q1 warms up the stop's own
 * skill at full stretch, q6 is the heaviest fusion with earlier stops.
 * Fusion rule: current stop's topic × EARLIER stops' topics only.
 * Roughly alternating: same-theme real-world ↔ raw academic.
 * Every gen() returns { prompt, solution } — fresh numbers each time.
 * ──────────────────────────────────────────────────────────────────────────── */
const CJ_CHALLENGES = {

  addition: [
    { gen() { const a = czRand(140, 380), b = czRand(120, 340), c = czRand(110, 290);
      return { prompt: `A three-day road trip: Day 1 covers ${a} km, Day 2 covers ${b} km, Day 3 covers ${c} km. Which single day was the longest drive — and how long was the whole trip?`,
        solution: `Longest day: compare ${a}, ${b}, ${c} → ${Math.max(a, b, c)} km. Whole trip: ${a} + ${b} + ${c} = ${a + b + c} km.` }; } },
    { gen() { const b = czRand(120, 480), ans = czRand(150, 500); const c = b + ans;
      return { prompt: `Find the missing number:  ${b} + ____ = ${c}`,
        solution: `The missing number is what fills the gap from ${b} up to ${c}. Count up: ${c} − is subtraction language, so think "what do I ADD to ${b} to reach ${c}?" → ${ans}, because ${b} + ${ans} = ${c}.` }; } },
    { gen() { const start = czRand(12000, 45000), t1 = czRand(180, 420), t2 = czRand(150, 380);
      return { prompt: `The odometer reads ${start} km. The car then makes two trips: ${t1} km and ${t2} km. What will the odometer read after both — and what did it add in total?`,
        solution: `Total added: ${t1} + ${t2} = ${t1 + t2} km. New reading: ${start} + ${t1 + t2} = ${start + t1 + t2} km. The odometer only ever adds.` }; } },
    { gen() { const a = czRand(160, 390), b = czRand(140, 360); const bigger = czPick(['A', 'B']); const extra = czRand(15, 45);
      const pa = bigger === 'A' ? b + extra : a, pb = bigger === 'A' ? b : pa + extra;
      const A = bigger === 'A' ? pa : a, B = bigger === 'A' ? b : pb;
      return { prompt: `Car park A holds ${A} cars, car park B holds ${B} cars. A festival needs space for ${A + B - czRand(5, 20)} cars using both. Is there room? Show it with one addition.`,
        solution: `Total space: ${A} + ${B} = ${A + B} cars. The festival needs fewer than that, so yes — there is room. One addition answers a yes/no question.` }; } },
    { gen() { const x = czRand(110, 320), y = czRand(130, 340), z = czRand(120, 330);
      return { prompt: `Three numbers add to ${x + y + z}. Two of them are ${x} and ${z}. What is the third? (Answer using addition thinking: build up, don't "take away".)`,
        solution: `The two known ones make ${x} + ${z} = ${x + z}. Ask: ${x + z} + ____ = ${x + y + z}. Counting up gives ${y}. Check: ${x} + ${y} + ${z} = ${x + y + z} ✓` }; } },
    { gen() { const d1 = czRand(210, 480), d2 = czRand(190, 450); const goal = d1 + d2 + czRand(60, 140);
      return { prompt: `A rally team wants to cross ${goal} km in two days. Day 1 they manage ${d1} km, Day 2 they manage ${d2} km. Do they make it? If not, how many km short are they? (Build up from what they drove.)`,
        solution: `Driven: ${d1} + ${d2} = ${d1 + d2} km — short of ${goal}. Build up: ${d1 + d2} + ____ = ${goal} → ${goal - d1 - d2} km short. Even the "how short" question was solved by an addition sentence.` }; } },
  ],

  basicarith: [
    { gen() { const rows = czPick([5, 6, 7]), per = czPick([6, 7, 8]);
      const seats = rows * per, inCar = czRand(Math.floor(seats / 2), seats - 8), out = czRand(3, 8), on = out + czRand(2, 6);
      const aboard = inCar - out + on;
      return { prompt: `A tour bus has ${rows} rows of ${per} seats. ${inCar} people are aboard; at the next stop ${out} get off and ${on} get on. How many EMPTY seats now?`,
        solution: `Seats: ${rows} × ${per} = ${seats}. Aboard after the stop: ${inCar} − ${out} + ${on} = ${aboard}. Empty: ${seats} − ${aboard} = ${seats - aboard}. Multiplication builds the total; + and − track the flow.` }; } },
    { gen() { const q = czRand(6, 12), d = czRand(6, 12); const prod = q * d;
      return { prompt: `Find the missing number:  ${prod} ÷ ____ = ${q}`,
        solution: `Division undoes multiplication: if ${prod} ÷ x = ${q}, then x × ${q} = ${prod}, so x = ${prod} ÷ ${q} = ${d}. Check: ${prod} ÷ ${d} = ${q} ✓` }; } },
    { gen() { const rate = czRand(30, 60, 5), days = czRand(4, 9); const budget = rate * days + czRand(10, 25);
      return { prompt: `Airport parking costs ₹${rate} per day. You have ₹${budget}. For how many FULL days can you park — and how much money is left over?`,
        solution: `${budget} ÷ ${rate} = ${Math.floor(budget / rate)} full days (${Math.floor(budget / rate)} × ${rate} = ${Math.floor(budget / rate) * rate}), leaving ₹${budget - Math.floor(budget / rate) * rate}. The leftover is the remainder — division with a story attached.` }; } },
    { gen() { const a = czRand(4, 9), b = czRand(3, 8), c = czRand(2, 6);
      return { prompt: `Work out ${a} × ${b} − ${a} × ${c}, then explain the shortcut: why does ${a} × (${b} − ${c}) give the same answer?`,
        solution: `Long way: ${a * b} − ${a * c} = ${a * b - a * c}. Shortcut: ${a} × (${b} − ${c}) = ${a} × ${b - c} = ${a * (b - c)}. Same! Taking ${a} groups of ${b} and removing ${a} groups of ${c} leaves ${a} groups of the difference.` }; } },
    { gen() { const price = czRand(90, 120, 5), n = czRand(3, 6), note = 1000;
      const cost = price * n;
      return { prompt: `Petrol costs about ₹${price} per litre. You buy ${n} litres and pay with a ₹${note} note. Estimate FIRST whether the change is more or less than ₹500, then compute it exactly.`,
        solution: `Estimate: ${n} × ${price} ≈ ${cost}, and ${note} − ${cost} is ${note - cost > 500 ? 'more' : 'less'} than 500. Exact: ${note} − ${n} × ${price} = ${note} − ${cost} = ₹${note - cost}. Estimating before computing catches keying mistakes at real pumps.` }; } },
    { gen() { const x = czRand(6, 15), m = czPick([3, 4, 5]), s = czRand(4, 20); const res = m * x - s;
      return { prompt: `I think of a number, multiply it by ${m}, subtract ${s}, and get ${res}. What was my number? (Undo the operations in reverse.)`,
        solution: `Undo backwards: ${res} + ${s} = ${m * x} (undoes the subtraction), then ${m * x} ÷ ${m} = ${x} (undoes the ×${m}). The number was ${x}. Working backwards is the seed of algebra — Stop 13 grows it.` }; } },
  ],

  multiply: [
    { gen() { const n = czRand(6, 12);
      return { prompt: `A rally convoy has ${n} cars. Each car has 4 road wheels AND 1 spare in the boot. How many wheels travel with the convoy — and why is ${n} × 5 faster than ${n} × 4 + ${n}?`,
        solution: `Each car carries 4 + 1 = 5 wheels, so ${n} × 5 = ${n * 5}. The long way ${n} × 4 + ${n} = ${n * 4} + ${n} = ${n * 5} agrees — grouping first (4+1=5) turns two operations into one.` }; } },
    { gen() { const f = czRand(6, 12), q = czRand(6, 12);
      return { prompt: `Find the missing number:  ____ × ${f} = ${f * q}`,
        solution: `Ask "${f} times WHAT makes ${f * q}?" — run the ${f} table: ${f} × ${q} = ${f * q}. Missing number: ${q}. (Division states the same fact: ${f * q} ÷ ${f} = ${q}.)` }; } },
    { gen() { const booths = czRand(4, 8), fee = czRand(35, 65, 5), park = czRand(40, 90, 10);
      return { prompt: `A highway trip passes ${booths} toll booths at ₹${fee} each, plus one ₹${park} parking charge at the end. What does the whole trip cost in tolls and parking?`,
        solution: `Tolls: ${booths} × ${fee} = ₹${booths * fee}. Add parking: ${booths * fee} + ${park} = ₹${booths * fee + park}. Multiplication handles the repeated charge; addition handles the one-off.` }; } },
    { gen() { const a = czRand(6, 9), b = czRand(13, 19);
      return { prompt: `Compute ${a} × ${b} WITHOUT long multiplication, by splitting ${b} into ${b - 10} + 10. Show the two easy products you used.`,
        solution: `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = ${a * b}. Splitting into tens-and-a-bit turns a hard fact into two table facts — the distributive law, working for you.` }; } },
    { gen() { const rows = czRand(6, 9), per = czRand(8, 12), late = czRand(5, 15);
      return { prompt: `A car park has ${rows} rows of ${per} spaces. On match day every space fills and ${late} more cars queue outside. How many cars came to the match?`,
        solution: `Parked: ${rows} × ${per} = ${rows * per}. Total arrivals: ${rows * per} + ${late} = ${rows * per + late} cars. The array (rows × columns) is multiplication you can see from the air.` }; } },
    { gen() { const n1 = czRand(6, 9), p1 = czRand(8, 12), n2 = czRand(6, 9), p2 = czRand(8, 12);
      return { prompt: `Garage A services ${n1} cars a day at ₹${p1 * 100} each. Garage B services ${n2} cars a day at ₹${p2 * 100} each. Which garage earns more per day, and by how much?`,
        solution: `A: ${n1} × ${p1 * 100} = ₹${n1 * p1 * 100}. B: ${n2} × ${p2 * 100} = ₹${n2 * p2 * 100}. ${n1 * p1 >= n2 * p2 ? 'A' : 'B'} earns more, by ₹${Math.abs(n1 * p1 - n2 * p2) * 100}. Two multiplications, one subtraction — a real business comparison.` }; } },
  ],

  decimals: [
    { gen() { const a = (czRand(180, 340) / 10), b = (czRand(150, 320) / 10);
      return { prompt: `Morning fill: ${a.toFixed(1)} litres. Evening fill: ${b.toFixed(1)} litres. The tank holds 45.0 litres. Could BOTH fills have fitted in one empty tank at once? Show the addition that decides it.`,
        solution: `${a.toFixed(1)} + ${b.toFixed(1)} = ${(a + b).toFixed(1)} litres — ${(a + b) <= 45 ? 'yes, under 45.0 L, it fits' : 'no, over 45.0 L, it would overflow'}. Line up the decimal points and the question answers itself.` }; } },
    { gen() { const b = czRand(125, 385) / 10, ans = czRand(115, 345) / 10; const c = +(b + ans).toFixed(1);
      return { prompt: `Find the missing decimal:  ${b.toFixed(1)} + ____ = ${c.toFixed(1)}`,
        solution: `Count up from ${b.toFixed(1)} to ${c.toFixed(1)}: the gap is ${(c - b).toFixed(1)}. Check: ${b.toFixed(1)} + ${(c - b).toFixed(1)} = ${c.toFixed(1)} ✓ Same missing-addend thinking as Stop 1 — decimals change nothing.` }; } },
    { gen() { const p = czRand(1040, 1120) / 10, n = czRand(3, 8);
      const bill = +(p * n).toFixed(2); const note = Math.ceil(bill / 100) * 100 + 100;
      return { prompt: `Petrol is ₹${p.toFixed(1)} per litre. You buy ${n} litres and hand over ₹${note}. Work out the bill, then the change.`,
        solution: `Bill: ${n} × ${p.toFixed(1)} = ₹${bill.toFixed(2)}. Change: ${note} − ${bill.toFixed(2)} = ₹${(note - bill).toFixed(2)}. One multiplication, one subtraction — every pump visit, ever.` }; } },
    { gen() { const base = czRand(90, 110); const a = +(base + 0.5).toFixed(2), b = +(base + 0.45).toFixed(2), c = +(base + 0.09).toFixed(2);
      return { prompt: `Three pumps price petrol at ₹${a.toFixed(2)}, ₹${b.toFixed(2)} and ₹${c.toFixed(2)} per litre. Order them cheapest → dearest, and explain why "${c.toFixed(2)} looks longest so it's biggest" is a trap.`,
        solution: `Compare place by place: all share ${base}; then tenths — 0.5 vs 0.4 vs 0.0 — give ${c.toFixed(2)} < ${b.toFixed(2)} < ${a.toFixed(2)}. Digit COUNT means nothing; digit PLACE means everything.` }; } },
    { gen() { const pc = czRand(1090, 1150) / 10, ph = +(pc - czRand(15, 40) / 10).toFixed(1), n = czRand(20, 35);
      return { prompt: `City petrol: ₹${pc.toFixed(1)}/L. Highway petrol: ₹${ph.toFixed(1)}/L. You need ${n} litres. How much do you SAVE by filling on the highway?`,
        solution: `Saving per litre: ${pc.toFixed(1)} − ${ph.toFixed(1)} = ₹${(pc - ph).toFixed(1)}. For ${n} litres: ${n} × ${(pc - ph).toFixed(1)} = ₹${(n * (pc - ph)).toFixed(1)}. Subtract first, THEN multiply — one clean route beats two messy ones.` }; } },
    { gen() { const t1 = czRand(85, 145) / 10, t2 = czRand(95, 155) / 10, price = czRand(1040, 1100) / 10;
      const total = +(t1 + t2).toFixed(1);
      return { prompt: `Trip log: two fills of ${t1.toFixed(1)} L and ${t2.toFixed(1)} L, all at ₹${price.toFixed(1)}/L. Find the total fuel cost — and say which order of operations keeps the arithmetic shortest.`,
        solution: `Add litres first: ${t1.toFixed(1)} + ${t2.toFixed(1)} = ${total.toFixed(1)} L, then one multiply: ${total.toFixed(1)} × ${price.toFixed(1)} = ₹${(total * price).toFixed(2)}. Two multiplies then an add gives the same — but doubles the decimal work.` }; } },
  ],

  fractionadd: [
    { gen() { const d = czPick([8, 8, 4]), n1 = czRand(1, 3), n2 = czRand(1, Math.max(1, d - n1 - 1));
      return { prompt: `The gauge shows ${n1}/${d} of a tank. You add ${n2}/${d} of a tank at the pump. How full is the tank now — and how much of a tank is still EMPTY?`,
        solution: `Full: ${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}. Empty: the whole is ${d}/${d}, so ${d}/${d} − ${n1 + n2}/${d} = ${d - n1 - n2}/${d}. Same denominators — just add or subtract the tops.` }; } },
    { gen() { const d2 = czPick([6, 8, 10]), n = czRand(1, 2); const half = d2 / 2;
      return { prompt: `Find the missing fraction:  ____ + ${n}/${d2} = 1/2`,
        solution: `Write ½ with denominator ${d2}: ½ = ${half}/${d2}. Missing = ${half}/${d2} − ${n}/${d2} = ${half - n}/${d2}${(half - n) % 2 === 0 || (half - n) === d2 / 2 ? ` = simplify if you can` : ''}. Matching denominators first is the whole game.` }; } },
    { gen() { const d1 = 3, d2 = 4;
      return { prompt: `Monday's drive uses 1/${d1} of a tank; Tuesday's uses 1/${d2}. The needle started on FULL. What fraction of the tank is left for Wednesday?`,
        solution: `Used: 1/${d1} + 1/${d2} = ${d2}/${d1 * d2} + ${d1}/${d1 * d2} = ${d1 + d2}/${d1 * d2}. Left: 1 − ${d1 + d2}/${d1 * d2} = ${d1 * d2 - d1 - d2}/${d1 * d2}. LCD turns different-sized pieces into same-sized pieces — then it's Stop-1 addition.` }; } },
    { gen() { const pair = czPick([[5, 8, 2, 3], [3, 8, 1, 3], [5, 8, 3, 5], [2, 3, 3, 5]]); const [a, b, c, d] = pair;
      const left = a * d, right = c * b;
      return { prompt: `Two cars finish a rally leg. Car A has ${a}/${b} of a tank left; Car B has ${c}/${d}. Which car has MORE fuel? Prove it with a common denominator — no decimals allowed.`,
        solution: `LCD of ${b} and ${d} is ${b * d}: A = ${left}/${b * d}, B = ${right}/${b * d}. ${left > right ? 'Car A' : 'Car B'} has more (${Math.max(left, right)} > ${Math.min(left, right)} pieces of the same size). Comparing fractions IS adding's sibling: same denominators, then compare tops.` }; } },
    { gen() { const w1 = czRand(1, 2), w2 = czRand(1, 2), d = 4, n1 = 1, n2 = 3;
      return { prompt: `The rally truck carries ${w1} ${n1}/${d} cans of fuel; the support jeep carries ${w2} ${n2}/${d} cans. How much fuel is that altogether? (Answer as a mixed number.)`,
        solution: `Wholes: ${w1} + ${w2} = ${w1 + w2}. Parts: ${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d} = 1 whole. Total: ${w1 + w2} + 1 = ${w1 + w2 + 1} cans. When the parts fill a whole, promote them — that's carrying, fraction-style.` }; } },
    { gen() { const w = 2, n1 = 1, d1 = 4, n2 = 3, d2 = 4;
      return { prompt: `The tank held ${w} ${n1}/${d1} cans' worth at dawn. The morning leg used ${n2}/${d2} of a can MORE than the evening leg, and the two legs together used exactly 1 ${n2}/${d2} cans. How much is left? (Two steps — find the legs first if you like, or just subtract the total.)`,
        solution: `Shortcut: left = ${w} ${n1}/${d1} − 1 ${n2}/${d2}. Borrow a whole: ${w} ${n1}/${d1} = 1 ${n1 + d1}/${d1}. Then 1 ${n1 + d1}/${d1} − 1 ${n2}/${d2} = ${(n1 + d1 - n2)}/${d1} of a can. The distractor (how the two legs split) never enters the answer — spotting that is the real skill.` }; } },
  ],

  ratio: [
    { gen() { const g = czRand(2, 6), small = czRand(10, 16); const big = small * g;
      return { prompt: `A gearbox pairs a ${big}-tooth engine gear with a ${small}-tooth wheel gear. Simplify the ratio ${big} : ${small} — and say what the simplified ratio MEANS for one turn of the engine.`,
        solution: `Divide both sides by ${small}: ${big} : ${small} = ${g} : 1. Meaning: the engine turns ${g} times for every 1 wheel turn — the ratio is a physical fact you could film, not just tidy numbers.` }; } },
    { gen() { const a = czRand(2, 5), b = czRand(3, 7), k = czRand(3, 8);
      return { prompt: `Find the missing number:  ${a} : ${b} = ${a * k} : ____`,
        solution: `${a} was multiplied by ${k} (${a} × ${k} = ${a * k}), so ${b} must be too: ${b} × ${k} = ${b * k}. Equivalent ratios scale BOTH sides by the same factor — like equivalent fractions.` }; } },
    { gen() { const pa = czRand(1, 2), pb = pa + czRand(1, 3), unit = czRand(40, 120, 10); const total = (pa + pb) * unit;
      return { prompt: `Two families split a ₹${total} fuel bill in the ratio ${pa} : ${pb} (by seats used). How much does each family pay — and what's the built-in check that you split it right?`,
        solution: `${pa + pb} parts → 1 part = ${total} ÷ ${pa + pb} = ₹${unit}. Family A: ${pa} × ${unit} = ₹${pa * unit}; Family B: ${pb} × ${unit} = ₹${pb * unit}. Check: ${pa * unit} + ${pb * unit} = ₹${total} ✓ — the shares must rebuild the whole.` }; } },
    { gen() { const r = [czRand(1, 2), czRand(2, 3), czRand(3, 5)]; const unit = czRand(30, 70, 10); const total = (r[0] + r[1] + r[2]) * unit;
      return { prompt: `Three friends drive ${total} km, sharing the wheel in the ratio ${r[0]} : ${r[1]} : ${r[2]}. How far does EACH drive — and what fraction of the trip does the middle share represent?`,
        solution: `${r[0] + r[1] + r[2]} parts → 1 part = ${unit} km. Shares: ${r[0] * unit}, ${r[1] * unit}, ${r[2] * unit} km. The middle share as a fraction: ${r[1]}/${r[0] + r[1] + r[2]} of the whole trip — ratios and fractions are the same information, worn differently.` }; } },
    { gen() { const v = czRand(4, 8), q1 = czRand(50, 90, 10); const q2 = q1 * czRand(2, 3);
      return { prompt: `The car burns ${v} litres of petrol over ${q1} km. At the same rate, how many litres for a ${q2} km trip? The dashboard also shows the engine at 92°C — does that number matter?`,
        solution: `Rate scales: ${q2} ÷ ${q1} = ${q2 / q1}, so fuel = ${v} × ${q2 / q1} = ${v * q2 / q1} litres. The 92°C is a distractor — it appears on the dashboard but in no line of the working. Real dashboards are full of numbers you must IGNORE.` }; } },
    { gen() { const mix = czPick([[25, 1], [20, 1], [50, 1]]); const [pet, oil] = mix; const oilMl = czRand(2, 5) * 100; const petMl = oilMl * pet;
      return { prompt: `A two-stroke scooter needs petrol and oil mixed ${pet} : ${oil}. Grandpa pours in ${oilMl} ml of oil. How many LITRES of petrol complete the mix? (Careful — the units change mid-problem.)`,
        solution: `Petrol = ${pet} × ${oilMl} = ${petMl} ml. Convert: ${petMl} ml = ${petMl / 1000} litres. The ratio work was one multiply; the real trap was ml → L. Units are part of the answer, not decoration.` }; } },
  ],

  percent: [
    { gen() { const base = czRand(200, 400, 20); const p = czPick([25, 50, 75]);
      return { prompt: `A full battery gives ${base} km of driving. The dash shows ${p}%. How many km are left — and how many km have been USED?`,
        solution: `Left: ${p}% of ${base} = ${base * p / 100} km. Used: the other ${100 - p}% = ${base * (100 - p) / 100} km. The two answers must add to ${base} — percent always splits one whole into two parts that rebuild it.` }; } },
    { gen() { const f = czPick([[3, 8], [5, 8], [3, 4], [7, 10]]); const [n, d] = f;
      return { prompt: `The fuel gauge needle sits exactly on ${n}/${d}. The trip computer shows the same level as a percentage. What number does it show?`,
        solution: `${n}/${d} = ${n}/${d} × 100% = ${(n * 100 / d)}%. Fractions and percents are the same needle position in two languages — Stop 5's gauge and Stop 7's battery agree.` }; } },
    { gen() { const base = czRand(2000, 4000, 500); const up = czPick([10, 20]), down = czPick([10, 20]);
      const after = base * (100 + up) / 100 * (100 - down) / 100;
      return { prompt: `A tyre priced ₹${base} goes UP ${up}% in March, then the new price is discounted ${down}% in a sale. Is the final price back to ₹${base}? Compute it and explain the surprise.`,
        solution: `After rise: ${base} × ${(100 + up) / 100} = ₹${base * (100 + up) / 100}. After discount: × ${(100 - down) / 100} = ₹${after}. ${after === base ? 'Exactly back (only because the numbers conspired!)' : `NOT ₹${base} — the ${down}% acts on a BIGGER number than the ${up}% did`}. Percent changes never simply cancel.` }; } },
    { gen() { const orig = czRand(1500, 4000, 250); const off = czPick([20, 25]); const sale = orig * (100 - off) / 100;
      return { prompt: `After a ${off}% discount, a car battery costs ₹${sale}. What was the original price? (Reverse percentage — the ₹${sale} is NOT 100%.)`,
        solution: `₹${sale} is ${100 - off}% of the original. 1% = ${sale} ÷ ${100 - off} = ₹${sale / (100 - off)}. Original = 100 × ${sale / (100 - off)} = ₹${orig}. Dividing by the WRONG percent (taking ${off}% of ${sale} and adding it back) gives ₹${sale * (100 + off) / 100} — close, and wrong.` }; } },
    { gen() { const p1 = czRand(80, 95, 5), use1 = czRand(25, 35, 5), use2 = czRand(20, 30, 5);
      return { prompt: `The EV battery starts the day at ${p1}%. The morning run uses ${use1} percentage points; the afternoon uses ${use2} more. Evening charge adds back exactly half of what the whole day used. Where does the battery end?`,
        solution: `After driving: ${p1} − ${use1} − ${use2} = ${p1 - use1 - use2}%. Day's use: ${use1 + use2} points; half back = ${(use1 + use2) / 2}. End: ${p1 - use1 - use2} + ${(use1 + use2) / 2} = ${p1 - use1 - use2 + (use1 + use2) / 2}%. Percentage POINTS subtract like plain numbers — that's why this stays clean.` }; } },
    { gen() { const total = czRand(1200, 2400, 200); const ra = 2, rb = 3;
      const shareB = total * rb / (ra + rb);
      return { prompt: `Two drivers split a ₹${total} trip cost in the ratio ${ra} : ${rb}. What PERCENT of the total does the bigger share pay? (Ratio in, percent out.)`,
        solution: `Bigger share: ${rb}/${ra + rb} of the total = ₹${shareB}. As a percent: ${rb}/${ra + rb} × 100 = ${(rb * 100 / (ra + rb))}%. Ratio → fraction → percent is one idea passing through three costumes — Stops 5, 6 and 7 in a single question.` }; } },
  ],

  sdt: [
    { gen() { const s = czRand(40, 80, 10), m = czPick([90, 150, 210]);
      return { prompt: `The school run takes ${m} minutes at a steady ${s} km/h. How far away is the school? (The minutes are the trap.)`,
        solution: `Convert first: ${m} min = ${m / 60} h. Then d = s × t = ${s} × ${m / 60} = ${s * m / 60} km. Feeding minutes straight into d = s × t gives an answer ${60}× too big — units before formulas, always.` }; } },
    { gen() { const t = czRand(2, 5), d = czRand(40, 70, 5) * t;
      return { prompt: `A delivery van covers ${d} km in ${t} hours. Find its average speed — then say how far it would go in ${t + 2} hours AT that speed.`,
        solution: `s = d ÷ t = ${d} ÷ ${t} = ${d / t} km/h. Then d = ${d / t} × ${t + 2} = ${d / t * (t + 2)} km. One triangle (d = s × t), read in two directions.` }; } },
    { gen() { const s1 = czRand(40, 60, 10), s2 = czRand(70, 90, 10), t1 = 1, t2 = 3;
      const d = s1 * t1 + s2 * t2, t = t1 + t2;
      return { prompt: `Leg 1: ${t1} h at ${s1} km/h. Leg 2: ${t2} h at ${s2} km/h. Show that the trip's average speed is NOT ${(s1 + s2) / 2} km/h — then find the real value.`,
        solution: `Total d = ${s1 * t1} + ${s2 * t2} = ${d} km; total t = ${t} h. Average = ${d} ÷ ${t} = ${d / t} km/h — higher than ${(s1 + s2) / 2}, because the car spent MORE hours at the faster speed. Average speed = total distance ÷ total time; averaging the speeds ignores how long each one lasted.` }; } },
    { gen() { const s1 = 60, s2 = 90, dHead = czRand(30, 60, 15);
      const t = dHead / (s2 - s1);
      return { prompt: `A truck is ${dHead} km ahead of a police car. Truck: ${s1} km/h. Police: ${s2} km/h. In how many hours does the police car catch the truck — and how far does it drive to do it?`,
        solution: `The gap closes at ${s2} − ${s1} = ${s2 - s1} km/h. Time = ${dHead} ÷ ${s2 - s1} = ${t} h. Police distance: ${s2} × ${t} = ${s2 * t} km. Working with the CLOSING speed turns a two-car chase into a one-number division.` }; } },
    { gen() { const range = czRand(400, 600, 50), s = czRand(60, 90, 10), t = czRand(2, 4);
      const used = s * t, pct = Math.round(used / range * 100);
      return { prompt: `A full tank is good for about ${range} km. You cruise at ${s} km/h for ${t} hours. Roughly what PERCENT of the tank did the drive use?`,
        solution: `Distance: ${s} × ${t} = ${used} km. Fraction of range: ${used}/${range} ≈ ${pct}%. Stop 8's triangle feeds Stop 7's percent — most real dashboard questions are two stops working together.` }; } },
    { gen() { const d = czRand(120, 240, 40), s1 = 40, s2 = 60;
      const t1 = d / s1, t2 = d / s2, avg = 2 * d / (t1 + t2);
      return { prompt: `A car drives ${d} km to the coast at ${s1} km/h and the same ${d} km back at ${s2} km/h. Explain why the trip's average speed is LESS than ${(s1 + s2) / 2} km/h, then compute it (1 d.p.).`,
        solution: `Times: out ${t1} h, back ${t2} h — the SLOW leg eats more clock. Average = total d ÷ total t = ${2 * d} ÷ ${(t1 + t2).toFixed(2)} = ${avg.toFixed(1)} km/h < ${(s1 + s2) / 2}. Equal DISTANCES ≠ equal TIMES: the classic trap, now defused.` }; } },
  ],

  mensur: [
    { gen() { const r = czRand(30, 40);
      return { prompt: `A hatchback wheel has radius ${r} cm. How far does the car travel in ONE full wheel turn, in METRES (2 d.p., π ≈ 3.14)? Watch the units.`,
        solution: `C = 2πr = 2 × 3.14 × ${r} = ${(2 * 3.14 * r).toFixed(1)} cm. Convert: ÷100 → ${(2 * 3.14 * r / 100).toFixed(2)} m. One turn = one circumference laid on the road — and the cm→m step is half the question.` }; } },
    { gen() { const d1 = 60, d2 = 70;
      return { prompt: `Two wheels: diameter ${d1} cm and ${d2} cm. Over the SAME 1 km, which wheel turns MORE times, and why? (No exact count needed — argue with circumference.)`,
        solution: `Turns = distance ÷ circumference, and C = πd. The ${d1} cm wheel has the smaller circumference, so it needs MORE turns to cover the same km. Bigger wheel, fewer turns — inverse relationship, argued without computing either count.` }; } },
    { gen() { const c = czPick([1.8, 2.0, 2.2]), n = czRand(400, 900, 100);
      return { prompt: `A wheel's circumference is ${c.toFixed(1)} m. On the way to school it makes ${n} full turns. How far is school — and what is the odometer secretly doing with these two numbers?`,
        solution: `d = ${c.toFixed(1)} × ${n} = ${(c * n).toFixed(0)} m = ${(c * n / 1000).toFixed(2)} km. The odometer multiplies circumference × turns, all day — a circle doing multiplication (Stop 3 inside Stop 9).` }; } },
    { gen() { const r = czRand(4, 8), deg = czPick([60, 90, 120]);
      return { prompt: `An arc of a circle with radius ${r} m subtends ${deg}° at the centre. Find the arc length as a fraction of the full circumference first, then in metres (2 d.p., π ≈ 3.14).`,
        solution: `Fraction: ${deg}/360 = ${deg / 360 === 1 / 6 ? '1/6' : deg / 360 === 1 / 4 ? '1/4' : '1/3'}. Full C = 2π × ${r} = ${(2 * 3.14 * r).toFixed(2)} m. Arc = ${(2 * 3.14 * r * deg / 360).toFixed(2)} m. Every arc problem is "what fraction of the whole circle?" — Stop 5 thinking on a bent road.` }; } },
    { gen() { const r = czRand(40, 60, 5), deg = czPick([90, 120, 150]);
      return { prompt: `A windscreen wiper reaches ${r} cm from its pivot and sweeps ${deg}°. What AREA of glass does it clean (nearest cm², π ≈ 3.14)?`,
        solution: `Sector area = (${deg}/360) × πr² = ${(deg / 360).toFixed(3)} × 3.14 × ${r}² = ${Math.round(deg / 360 * 3.14 * r * r)} cm². Arc length measures the rim; sector area measures the sweep — same fraction, different formula.` }; } },
    { gen() { const r = 35, rpm = czRand(300, 500, 50);
      const kmh = (2 * 3.14 * r / 100) * rpm * 60 / 1000;
      return { prompt: `A wheel of radius ${r} cm turns ${rpm} times per MINUTE. What speed is the car doing in km/h (1 d.p.)? (Circumference → metres per minute → km/h: three conversions in a row.)`,
        solution: `C = 2π × ${r} = ${(2 * 3.14 * r).toFixed(0)} cm = ${(2 * 3.14 * r / 100).toFixed(2)} m. Per minute: × ${rpm} = ${(2 * 3.14 * r / 100 * rpm).toFixed(0)} m/min. Per hour: × 60 ÷ 1000 = ${kmh.toFixed(1)} km/h. The circle (Stop 9) drives the speedometer (Stop 8) — literally.` }; } },
  ],

  pythag: [
    { gen() { const tr = czPick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]); const [a, b, c] = tr;
      return { prompt: `A car-park ramp climbs ${b} m of height while crossing ${a} m of floor. How long is the ramp itself — and why must the answer beat BOTH given numbers?`,
        solution: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, so c = ${c} m. The ramp is the hypotenuse — it spans the floor AND the climb at once, so it must be the triangle's longest side.` }; } },
    { gen() { const tr = czPick([[5, 12, 13], [8, 15, 17], [7, 24, 25]]); const [a, b, c] = tr;
      return { prompt: `A ${c} m tow-rope runs taut from a crane's top straight down to a car's hook, and the car sits ${a} m out from the base. How high is the crane's attachment point?`,
        solution: `Rearrange: b² = c² − a² = ${c * c} − ${a * a} = ${b * b}, so b = ${b} m. Finding a LEG means subtracting squares — the hypotenuse is only ever built, never given away.` }; } },
    { gen() { const tr = czPick([[6, 8, 10], [9, 12, 15], [12, 16, 20]]); const [a, b, c] = tr;
      return { prompt: `A car park is a ${a} m × ${b} m rectangle. Dad walks two sides to the exit; you cut the diagonal. How many metres do you SAVE — and what fraction of Dad's walk did you skip?`,
        solution: `Diagonal: √(${a}² + ${b}²) = ${c} m. Dad: ${a} + ${b} = ${a + b} m. Saved: ${a + b} − ${c} = ${a + b - c} m — which is ${a + b - c}/${a + b} of his walk. Pythagoras plus a fraction: two stops, one shortcut.` }; } },
    { gen() { const k = czRand(2, 4); const [a, b, c] = [3 * k, 4 * k, 5 * k];
      return { prompt: `A ramp design uses a 3-4-5 triangle scaled up by ${k}: floor ${a} m, height ${b} m. WITHOUT squaring anything, write down the ramp length — then justify the shortcut.`,
        solution: `Scaling a right triangle by ${k} scales every side by ${k}: 5 × ${k} = ${c} m. Justification: (${a})² + (${b})² = ${k}²(3² + 4²) = ${k}² × 25 = (${c})². Recognising a scaled triple replaces arithmetic with insight.` }; } },
    { gen() { const [a, b, h] = czPick([[6, 8, 24], [9, 12, 20], [12, 16, 15]]); const d1 = Math.sqrt(a * a + b * b);
      const d3 = Math.sqrt(a * a + b * b + h * h);
      return { prompt: `A parking structure floor is ${a} m × ${b} m, and the next level is ${h} m above. A cable runs from a ground-floor corner to the OPPOSITE corner one level up. How long is the cable? (Two right triangles, used in sequence.)`,
        solution: `Floor diagonal: √(${a}² + ${b}²) = ${d1.toFixed(0)} m. Then stand the height on it: √(${d1.toFixed(0)}² + ${h}²) = √${d1 * d1 + h * h} = ${d3.toFixed(0)} m. 3D Pythagoras is just 2D Pythagoras twice.` }; } },
    { gen() { const [a, b, c] = czPick([[5, 12, 13], [8, 15, 17]]); const s = czRand(40, 60, 10);
      return { prompt: `Two service roads meet at a right angle: ${a} km and ${b} km. A shortcut track runs straight between their far ends. At ${s} km/h, how many MINUTES does the shortcut save over driving both roads?`,
        solution: `Shortcut: √(${a}² + ${b}²) = ${c} km. Saved distance: ${a + b} − ${c} = ${a + b - c} km. Time saved: ${a + b - c} ÷ ${s} h = ${(60 * (a + b - c) / s).toFixed(0)} min. Pythagoras finds the km; Stop 8's triangle converts them to minutes.` }; } },
  ],

  quadratic: [
    { gen() { const v = czRand(40, 90, 10);
      return { prompt: `Dry-road braking distance: d = v²/100 (v in km/h, d in metres). Find d at ${v} km/h — then at ${v + 10} km/h. Why did d grow by MORE than the speed did?`,
        solution: `d(${v}) = ${v * v / 100} m; d(${v + 10}) = ${(v + 10) * (v + 10) / 100} m. Speed rose ${((v + 10) / v * 100 - 100).toFixed(0)}%, but d rose ${(((v + 10) ** 2 - v ** 2) / v ** 2 * 100).toFixed(0)}% — squaring amplifies. That ² is why speed limits exist.` }; } },
    { gen() { const a = czRand(2, 5), b = czRand(-6, 6), c = czRand(-9, 9), x = czRand(2, 5);
      const val = a * x * x + b * x + c;
      return { prompt: `Evaluate y = ${a}x² ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)} at x = ${x}, showing the substitution in full before any arithmetic.`,
        solution: `y = ${a}(${x})² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}(${x}) ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${a * x * x} ${b * x >= 0 ? '+' : '−'} ${Math.abs(b * x)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${val}. Substitute first, simplify second — the order that never betrays you.` }; } },
    { gen() { const v = czRand(30, 60, 10);
      const d = v / 5 + v * v / 100;
      return { prompt: `Total stopping distance = thinking + braking: d = v/5 + v²/100. Compute d at ${v} km/h, then say which of the two parts grows faster as v climbs — and how you can tell WITHOUT computing again.`,
        solution: `d = ${v}/5 + ${v}²/100 = ${v / 5} + ${v * v / 100} = ${d} m. The v²/100 part grows faster: it's quadratic (×4 when v doubles) while v/5 is linear (×2). The exponent tells you the future without arithmetic.` }; } },
    { gen() { const a2 = czRand(2, 4), x = czRand(2, 4), val = czRand(30, 60, 5); const c = val - a2 * x * x;
      return { prompt: `The curve y = ${a2}x² + c passes through the point (${x}, ${val}). Find c. (One substitution, one rearrangement.)`,
        solution: `Substitute: ${val} = ${a2}(${x})² + c = ${a2 * x * x} + c. So c = ${val} − ${a2 * x * x} = ${c}. Evaluating forwards (Stop 11's skill) run BACKWARDS gives your first taste of solving — Stop 13 makes it official.` }; } },
    { gen() { const v = czRand(30, 50, 10), k = 2;
      return { prompt: `Rain doubles braking distance: wet d = v²/50 instead of v²/100. Car A drives at ${v} km/h in rain; Car B drives at ${v * k} km/h on dry road. Which needs more road to brake — and by what factor does B's own DRY distance exceed A's WET one?`,
        solution: `A (wet): ${v}²/50 = ${v * v / 50} m. B (dry): (${v * k})²/100 = ${(v * k) ** 2 / 100} m. Factor: ${((v * k) ** 2 / 100 / (v * v / 50)).toFixed(1)}×. Doubling speed quadruples distance; rain only doubles it — SPEED beats weather as the danger.` }; } },
    { gen() { const u = czPick([20, 30, 40]); const t1 = 1, t2 = u / 5 - 1;
      return { prompt: `A stunt car leaves a ramp at ${u} m/s; its height is h = ${u}t − 5t². Compute h at t = ${t1} and at t = ${t2}. Explain what the matching answers tell you about the flight — no solving allowed, just evaluation and thought.`,
        solution: `h(${t1}) = ${u * t1 - 5 * t1 * t1} m; h(${t2}) = ${u * t2 - 5 * t2 * t2} m — equal! The car passes the same height going up and coming down; the flight is symmetric around its peak at t = ${u / 10}. Stop 14 will find that peak with a derivative; today, evaluation alone revealed it.` }; } },
  ],

  trig: [
    { gen() { const grade = czPick([8, 10, 12, 15]);
      return { prompt: `A road sign warns of a ${grade}% grade — the road rises ${grade} m per 100 m horizontal. Write tan θ for the road's angle θ, then estimate θ using: tan 5° ≈ 0.09, tan 7° ≈ 0.12, tan 9° ≈ 0.16.`,
        solution: `tan θ = ${grade}/100 = ${grade / 100}. Nearest table value: θ ≈ ${grade <= 9 ? '5°' : grade <= 13 ? '7°' : '9°'}. A percent grade IS a tangent in disguise — the sign compresses a whole triangle into one number.` }; } },
    { gen() { const th = czPick([30, 45, 60]); const opp = czRand(20, 60, 10);
      const tv = { 30: 0.577, 45: 1.0, 60: 1.732 }[th];
      return { prompt: `In a right triangle the angle is ${th}° and the OPPOSITE side is ${opp} m. Find the ADJACENT side (1 d.p., tan ${th}° ≈ ${tv}). First decide: divide or multiply?`,
        solution: `tan θ = opp/adj → adj = opp/tan θ = ${opp}/${tv} = ${(opp / tv).toFixed(1)} m. Divide — because the unknown sits UNDER the fraction. Deciding the operation from the formula's shape is the actual skill; the arithmetic is one keystroke.` }; } },
    { gen() { const L = czRand(200, 500, 50); const th = czPick([10, 15, 20]);
      const sv = { 10: 0.17, 15: 0.26, 20: 0.34 }[th];
      return { prompt: `A mountain road is ${L} m long and climbs at ${th}° (sin ${th}° ≈ ${sv}). How much HEIGHT does the car gain — and why is the answer less than ${L} m however steep the road?`,
        solution: `height = L × sin θ = ${L} × ${sv} = ${(L * sv).toFixed(0)} m. It's always less than ${L} because sin θ < 1 for any real hill — the road length is the hypotenuse, and no leg beats the hypotenuse (Stop 10's law, wearing Stop 12's clothes).` }; } },
    { gen() { const tr = czPick([[3, 4, 5], [6, 8, 10]]); const [a, b, c] = tr;
      return { prompt: `A ramp's floor run is ${a} m and its height is ${b} m. Find the ramp length by Pythagoras, THEN write sin θ, cos θ and tan θ for the ramp angle as fractions. (One triangle, four facts.)`,
        solution: `Ramp: √(${a}² + ${b}²) = ${c} m. Then sin θ = ${b}/${c}, cos θ = ${a}/${c}, tan θ = ${b}/${a}. Pythagoras completes the triangle; trig reads the completed triangle. They're a two-tool kit, used in that order.` }; } },
    { gen() { const L1 = czRand(200, 400, 50), L2 = czRand(150, 350, 50);
      const s1 = 0.26, s2 = 0.17;
      return { prompt: `A climb has two legs: ${L1} m of road at 15° (sin ≈ 0.26), then ${L2} m at 10° (sin ≈ 0.17). What TOTAL height does the car gain? Why can you add the two heights but NOT the two angles?`,
        solution: `h₁ = ${L1} × 0.26 = ${(L1 * s1).toFixed(0)} m; h₂ = ${L2} × 0.17 = ${(L2 * s2).toFixed(0)} m. Total: ${(L1 * s1 + L2 * s2).toFixed(0)} m. Heights are lengths — they stack. Angles describe steepness, not amount: a 15° + 10° "sum" describes no part of this journey.` }; } },
    { gen() { const grade = czPick([10, 12]); const L = czRand(2, 4);
      return { prompt: `A hill road is signed ${grade}% and runs ${L} km. Estimate the height gained (nearest 10 m). Hint: for small angles the road length ≈ the horizontal run — say why that's a fair cheat here before using it.`,
        solution: `At ${grade}%, the angle is ≈ ${grade <= 10 ? '6' : '7'}°, where cos θ ≈ 0.99 — road and horizontal differ by ~1%, so treat ${L} km as the run. Height ≈ ${grade}% × ${L * 1000} = ${grade * L * 10} m. Knowing when an approximation is safe IS higher mathematics — engineers do exactly this.` }; } },
  ],

  lineareq: [
    { gen() { const b = czRand(30, 60, 10), a = czRand(12, 20), km = czRand(6, 15); const c = b + a * km;
      return { prompt: `A taxi charges ₹${b} to start plus ₹${a} per km. The final bill is ₹${c}. Write the equation for the ride length x, then solve it.`,
        solution: `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${km} km. Writing the equation is the real work: the fare STRUCTURE becomes algebra, then two undo-steps (Stop 2's backwards thinking, formalised) finish it.` }; } },
    { gen() { const x = czRand(3, 9), c2 = czRand(1, 4), a = c2 + czRand(1, 3), b = czRand(2, 15);
      const d = (a - c2) * x + b; // constant on the right so both sides agree at x
      return { prompt: `Solve ${a}x + ${b} = ${c2}x + ${d}. Collect the x's on ONE side first, and say why you chose that side.`,
        solution: `Move ${c2}x left: ${a - c2}x + ${b} = ${d}. Then ${a - c2}x = ${d - b} → x = ${x}. Collect x's on the side with MORE of them — the coefficient stays positive and sign errors starve.` }; } },
    { gen() { const s1 = 60, s2 = 40, gap = czRand(20, 60, 20); const t = gap / (s1 - s2);
      return { prompt: `Car B is ${gap} km ahead, doing ${s2} km/h. Car A does ${s1} km/h. Write each car's distance-from-A's-start as an expression in t, set them equal, and find when A draws level.`,
        solution: `A: ${s1}t. B: ${gap} + ${s2}t. Equal: ${s1}t = ${gap} + ${s2}t → ${s1 - s2}t = ${gap} → t = ${t} h. The catch-up chase (Stop 8) was secretly an equation in disguise — now you've written it down.` }; } },
    { gen() { const xx = czRand(2, 6), yy = czRand(2, 6); const a2 = czRand(2, 3);
      const c1 = xx + yy, c2v = a2 * xx + yy;
      return { prompt: `Solve the system:  x + y = ${c1}  and  ${a2}x + y = ${c2v}. (One subtraction makes y vanish — do it, then explain what that subtraction MEANS.)`,
        solution: `Subtract eq1 from eq2: ${a2 - 1}x = ${c2v - c1} → x = ${xx}, then y = ${c1} − ${xx} = ${yy}. The subtraction cancels the shared y — removing what two situations have in common exposes how they differ. That idea, not the mechanics, is elimination.` }; } },
    { gen() { const D = czRand(150, 300, 50), s1 = czRand(40, 60, 10), s2 = czRand(60, 90, 10);
      const t = D / (s1 + s2);
      return { prompt: `Two cars start at the same moment from towns ${D} km apart, driving toward each other at ${s1} km/h and ${s2} km/h. When do they meet, and how far from the first town? (Write the equation before touching numbers.)`,
        solution: `Closing speed: ${s1} + ${s2} = ${s1 + s2} km/h, so ${s1 + s2}t = ${D} → t = ${(t).toFixed(2)} h. From town 1: ${s1} × ${t.toFixed(2)} = ${(s1 * t).toFixed(0)} km. Approaching speeds ADD (the chase subtracted them) — one sign flips and the whole story changes.` }; } },
    { gen() { const toll = czRand(40, 70, 10), park = czRand(30, 60, 10);
      const m = 2 * toll + 3 * park, tu = 3 * toll + 2 * park;
      return { prompt: `Monday's trip: 2 tolls + 3 hours parking = ₹${m}. Tuesday: 3 tolls + 2 hours parking = ₹${tu}. Find the toll price and the parking rate. (Two receipts, two unknowns — a 2×2 system.)`,
        solution: `2T + 3P = ${m}; 3T + 2P = ${tu}. Multiply and eliminate: ×3 and ×2 → 6T + 9P = ${3 * m}, 6T + 4P = ${2 * tu}; subtract: 5P = ${3 * m - 2 * tu} → P = ₹${park}, then T = ₹${toll}. Two ordinary receipts held enough information to reveal both prices — that's the quiet power of simultaneous equations.` }; } },
  ],

  diff: [
    { gen() { const a = czRand(2, 5), t = czRand(2, 5);
      return { prompt: `A car pulls away with position s(t) = ${a}t² metres. Differentiate to get the speedometer reading v(t), then evaluate it at t = ${t} s. What does the UNITS change from s to v tell you?`,
        solution: `v(t) = s′(t) = ${2 * a}t; v(${t}) = ${2 * a * t} m/s. Units went metres → metres per second: differentiation turns an amount into a RATE — that's its whole job, and the speedometer does it live.` }; } },
    { gen() { const a = czRand(2, 4), n = czPick([3, 4]), x = czRand(2, 3);
      return { prompt: `For f(x) = ${a}x^${n}, find f′(x) and evaluate f′(${x}). State the power rule in one sentence before you use it.`,
        solution: `Power rule: bring the exponent down as a factor, drop the exponent by one. f′(x) = ${a * n}x^${n - 1}; f′(${x}) = ${a * n} × ${x ** (n - 1)} = ${a * n * x ** (n - 1)}. One sentence, one rule, all polynomials.` }; } },
    { gen() { const a = czRand(2, 4), b = czRand(3, 8), t = czRand(2, 4);
      return { prompt: `During an overtake a car's SPEED is v(t) = ${a}t² + ${b}t m/s. Differentiate again to find the acceleration at t = ${t} s — and say what differentiating twice means on the dashboard.`,
        solution: `a(t) = v′(t) = ${2 * a}t + ${b}; a(${t}) = ${2 * a * t + b} m/s². First derivative of position = speedometer; second = how hard you're pressed into the seat. Each differentiation climbs one level of "rate of change of…".` }; } },
    { gen() { const b = czPick([40, 60, 80]), a = czPick([2, 4, 5]);
      const vx = b / (2 * a);
      return { prompt: `A test car's fuel economy is E(v) = −${a}v² + ${b}v (test units). Find the speed v where economy peaks, and PROVE it's a peak (not a valley) without drawing anything.`,
        solution: `E′(v) = −${2 * a}v + ${b} = 0 → v = ${vx}. Proof it's a max: E′ changes + → − through ${vx}${''} (or: the v² coefficient is negative, so the parabola opens downward). The derivative doesn't just find the point — it certifies it.` }; } },
    { gen() { const u = czPick([20, 30, 40]);
      return { prompt: `The stunt car from Stop 11: h(t) = ${u}t − 5t². Use the derivative to find WHEN the car peaks and HOW HIGH — then compare with what Stop 11's symmetry argument told you.`,
        solution: `h′(t) = ${u} − 10t = 0 → t = ${u / 10} s. Height: h(${u / 10}) = ${u * u / 10 - 5 * (u / 10) ** 2} m. Stop 11 saw matching heights either side and guessed the middle; the derivative computes the same instant exactly. Evaluation suspected — calculus confirmed.` }; } },
    { gen() { const a = czRand(2, 3), b = czRand(4, 8), t = czRand(2, 4);
      return { prompt: `A car's position is s(t) = ${a}t² + ${b}t metres. In ONE working: find v(t), find v(${t}), and find the average speed over the first ${t} seconds. Why is the average less than v(${t})?`,
        solution: `v(t) = ${2 * a}t + ${b}; v(${t}) = ${2 * a * t + b} m/s. Average = s(${t})/${t} = ${(a * t * t + b * t)}/${t} = ${a * t + b} m/s — less than v(${t}) because the car was SLOWER earlier and the average remembers the whole history. Instantaneous vs average: the derivative vs Stop 8's division.` }; } },
  ],

  integ: [
    { gen() { const c = czPick([4, 6, 8]);
      return { prompt: `A car's speed grows as v(t) = ${c}t m/s. Its distance has the form s(t) = A·t². Find A by "un-differentiating" — then check your answer BY differentiating.`,
        solution: `∫${c}t dt = ${c / 2}t², so A = ${c / 2}. Check: d/dt(${c / 2}t²) = ${c}t = v(t) ✓ Integration proposes; differentiation verifies. Always run the check — it's free.` }; } },
    { gen() { const a = czRand(2, 6), n = czPick([2, 3]);
      return { prompt: `Find ∫ ${a}x^${n} dx, and explain in one line why the "+ C" is not optional.`,
        solution: `∫${a}x^${n} dx = ${a}/${n + 1} x^${n + 1} + C = ${(a / (n + 1)) % 1 === 0 ? a / (n + 1) : `${a}/${n + 1}`}x^${n + 1} + C. The +C: every curve shifted vertically has the SAME derivative, so un-differentiating recovers a family, not one curve — C names the family member.` }; } },
    { gen() { const a = czRand(2, 4), b = czRand(2, 6), k = czRand(2, 4);
      const dist = a * k * k / 2 + b * k;
      return { prompt: `Pulling away from the lights: v(t) = ${a}t + ${b} m/s. How far does the car travel in the first ${k} seconds? (A definite integral — say what the limits 0 and ${k} MEAN before computing.)`,
        solution: `Limits = the clock interval we care about. ∫₀^${k}(${a}t + ${b})dt = [${a / 2}t² + ${b}t]₀^${k} = ${a / 2 * k * k} + ${b * k} = ${dist} m. The odometer ran from t = 0 to t = ${k} and added up every instant of speed.` }; } },
    { gen() { const a = czPick([2, 3]), k = czPick([2, 3]);
      const dist = a * k ** 3 / 3;
      return { prompt: `A drag car's speed is v(t) = ${a}t². Find the distance covered between t = 0 and t = ${k} s — then explain why this "area under the speed graph" IS a distance, using units.`,
        solution: `∫₀^${k}${a}t² dt = [${a}/3 t³]₀^${k} = ${dist % 1 === 0 ? dist : dist.toFixed(2)} m. Units: the graph's height is m/s, its width is s — area = m/s × s = m. Area under a rate graph always carries the units of the accumulated thing.` }; } },
    { gen() { const b = czPick([4, 6]), k = czPick([4, 6]);
      const tri = 0.5 * k * (b * k / 2);
      return { prompt: `A car's extra speed during a ${k}-second overtake is v(t) = ${b / 2}t m/s. Compute the extra distance twice: (1) as the area of the triangle under the graph, (2) by integration. What do the matching answers demonstrate?`,
        solution: `Triangle: ½ × ${k} × ${b / 2 * k} = ${tri} m. Integral: ∫₀^${k}${b / 2}t dt = ${b / 4}t²|₀^${k} = ${b / 4 * k * k} m. They match — integration IS area-finding, generalised to curves no triangle formula can touch. Geometry checks calculus.` }; } },
    { gen() { const a = czRand(2, 4), b = czRand(2, 6), t = czRand(2, 4);
      return { prompt: `Round trip: s(t) = ${a}t² + ${b}t. (1) Differentiate s to get v(t). (2) Now integrate your v(t) from 0 to ${t} and compare with s(${t}). Write the one sentence this round trip proves.`,
        solution: `v(t) = ${2 * a}t + ${b}. ∫₀^${t} v = ${a}t² + ${b}t |₀^${t} = ${a * t * t + b * t} = s(${t}) ✓ Sentence: differentiation and integration undo each other — the speedometer and the odometer are the same function read in opposite directions (Stop 1's promise, kept).` }; } },
  ],

  diffeq: [
    { gen() { const eq = czPick([
      { txt: 'd²h/dt² + 4·dh/dt + 3h = 0', ord: 2, why: 'the highest derivative present is the SECOND (d²h/dt²)' },
      { txt: 'dv/dt + 5v = 20', ord: 1, why: 'only a FIRST derivative appears (dv/dt)' },
      { txt: 'd²s/dt² = −10', ord: 2, why: 'the highest derivative is the second (d²s/dt²)' }]);
      return { prompt: `State the ORDER of this equation from the car's engineering file, and justify in one line:  ${eq.txt}`,
        solution: `Order ${eq.ord} — ${eq.why}. Order asks "how many layers of rate-of-change deep does this equation reach?" Nothing else about the equation matters for that question.` }; } },
    { gen() { const p = czPick([[2, 1], [3, 1], [2, 3]]); const [ord, deg] = p;
      const eq = ord === 2 ? `(d²y/dt²)${deg > 1 ? `^${deg}` : ''} + dy/dt = t` : `(dy/dt)${deg > 1 ? `^${deg}` : ''} + y = t²`;
      return { prompt: `For the equation  ${eq}  state the order AND the degree — and explain which of the two you must find FIRST, and why.`,
        solution: `Order first: highest derivative = ${ord === 2 ? 'd²y/dt²' : 'dy/dt'} → order ${ord}. THEN degree = the power on that highest derivative → ${deg}. Degree is defined relative to the highest derivative, so you cannot know what to read the power off until order is settled.` }; } },
    { gen() { const kk = czPick([2, 3]);
      return { prompt: `A coasting car obeys dv/dt = −${kk}v. A student claims v(t) = 5e^(−${kk}t) is a solution. Verify or refute by substitution — no solving.`,
        solution: `Left side: dv/dt = 5 × (−${kk})e^(−${kk}t) = −${kk} · 5e^(−${kk}t) = −${kk}v. Right side: −${kk}v. Equal — the claim is TRUE. Verifying needs only differentiation (Stop 14) and honesty; solving was never required.` }; } },
    { gen() { const a = czRand(2, 4), b = czRand(3, 7);
      return { prompt: `Rolling downhill, a car's speed changes at dv/dt = ${a}t + ${b} (m/s²). Find the speed function v(t), given the car started from REST. What did the rest condition buy you?`,
        solution: `Integrate: v(t) = ${a / 2 % 1 === 0 ? a / 2 : `${a}/2`}t² + ${b}t + C. Rest: v(0) = 0 → C = 0, so v(t) = ${a / 2 % 1 === 0 ? a / 2 : `${a}/2`}t² + ${b}t. The condition pinned down C — turning a FAMILY of solutions into this car's actual speed. Every real problem needs its starting fact.` }; } },
    { gen() { const vs = czPick([60, 80, 100]), k = czPick([2, 3]);
      return { prompt: `Cruise control: dv/dt = ${k}(${vs} − v), set speed ${vs} km/h. WITHOUT solving: what is dv/dt when v = ${vs - 20}? When v = ${vs}? When v = ${vs + 10}? What is the controller doing?`,
        solution: `v = ${vs - 20}: dv/dt = ${k} × 20 = +${20 * k} (speeding up). v = ${vs}: dv/dt = 0 (holding). v = ${vs + 10}: dv/dt = −${10 * k} (easing off). The equation steers v toward ${vs} from either side — reading a differential equation's SIGN tells you the system's behaviour before any solution exists.` }; } },
    { gen() { const u = czPick([20, 30, 40]);
      return { prompt: `The stunt jump one last time: h(t) = ${u}t − 5t². Differentiate TWICE and show that h satisfies d²h/dt² = −10, whatever the launch speed ${u} was. What does that constant −10 physically mean?`,
        solution: `h′(t) = ${u} − 10t; h″(t) = −10 ✓ — the ${u} vanished at the second derivative, so EVERY jump obeys d²h/dt² = −10. That constant is gravity's acceleration (≈10 m/s² down): three stops of algebra and calculus, resolving into one law of nature. The road behind you was mathematics the whole way.` }; } },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * UI components
 * ──────────────────────────────────────────────────────────────────────────── */

/** The Road License stamp — shown above the challenge set once a stop is passed.
 *  onGo(modeKey) navigates to the Tenali card (App passes setMode to CR). */
export function CjLicense({ stopKey, onGo }) {
  const grants = CJ_HANDOFF[stopKey];
  if (!grants) return null;
  return (
    <div className="cj-license">
      <div className="cj-license-head">🪪 Road License earned</div>
      {grants.map((g) => (
        <div key={g.mode} className="cj-license-row">
          <span className="cj-license-text">
            {g.name} — you're cleared to start at <strong>{g.level}</strong> in Tenali
          </span>
          {onGo && (
            <button
              className="cj-license-go"
              onClick={() => { cjSetReco(g.mode, g.diff); onGo(g.mode); }}
            >
              Open {g.name} →
            </button>
          )}
        </div>
      ))}
      <p className="cj-license-note">Your call — the license says where you <em>can</em> start, not where you must.</p>
    </div>
  );
}

/** "🔧 Now can you solve…" — 6 ungraded HOT questions, progressive order,
 *  each with its own Show-solution toggle. Fresh numbers per open. */
export function CjChallengeSet({ stopKey }) {
  const items = useMemo(
    () => (CJ_CHALLENGES[stopKey] || []).map((t) => t.gen()),
    [stopKey],
  );
  const [openSet, setOpenSet] = useState(false);
  const [shown, setShown] = useState({}); // idx → bool (solution visible)

  if (!items.length) return null;
  return (
    <div className="cj-challenge">
      <button className="cj-challenge-toggle" onClick={() => setOpenSet((o) => !o)}>
        🔧 Now can you solve… {openSet ? '▴' : '▾'}
      </button>
      {openSet && (
        <div className="cj-challenge-body">
          <ol className="cj-challenge-list">
            {items.map((q, i) => (
              <li key={i} className="cj-challenge-item">
                <p className="cj-challenge-prompt">{q.prompt}</p>
                {shown[i] ? (
                  <p className="cj-challenge-solution">{q.solution}</p>
                ) : (
                  <button
                    className="cj-challenge-reveal"
                    onClick={() => setShown((s) => ({ ...s, [i]: true }))}
                  >
                    Show solution
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

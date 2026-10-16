/**
 * DAILY WARMUP & WEEKLY HABIT ENGINE (RFC 0001)
 *
 * Implements:
 * 1. Multi-scenario Narrative Storyline Question Generators with Character Contexts
 * 2. Story-Based Conceptual Rules & Strategies (General guidance without spoiling answers)
 * 3. Topic to App-Key Mappings for Direct In-App Practice Routing
 * 4. Spaced Memory Decay Priority Function:
 *    Decay Priority = (1 - P(L)) * ln(1 + delta_t_days)
 * 5. Flexible 3-Day Weekly Habit System
 */

const { bktUpdate, clamp } = require('./bkt');
const { INTERVAL_DAYS, nextInterval } = require('./spacingLadder');
const { randomInt, pick } = require('./mathHelpers');
const randInt = randomInt;

// ─── Constants & Configurations ─────────────────────────────────────────────

const DEFAULT_TARGET_DAYS_PER_WEEK = 3;
const DEFAULT_WARMUP_QUESTIONS_COUNT = 3;

const FOUNDATIONAL_TOPICS = ['addition', 'multiplication', 'arithmetic', 'fractions', 'subtraction', 'lineq'];

// ─── Topic to Tenali App-Key Mapping ─────────────────────────────────────────

const TOPIC_APP_KEYS = {
  addition: 'basicarith',
  subtraction: 'basicarith',
  arithmetic: 'basicarith',
  multiplication: 'multiply',
  tables: 'multiply',
  division: 'basicarith',
  fractions: 'fractionadd',
  fractionadd: 'fractionadd',
  decimals: 'decimals',
  percentages: 'percent',
  percent: 'percent',
  hcf_lcm: 'hcflcm',
  hcflcm: 'hcflcm',
  lineq: 'lineareq',
  lineareq: 'lineareq',
  quadratics: 'quadratic',
  quadratic: 'quadratic',
  monomials: 'polymul',
  indices: 'indices',
  squares: 'squaring',
  squaring: 'squaring',
  sqrt: 'sqrt',
  pythag: 'pythag',
  angles: 'triangles',
  triangles: 'triangles',
  trig: 'trig',
  coordgeom: 'coordgeom',
  stats: 'stats',
  prob: 'prob',
  ratio: 'ratio',
  profitloss: 'profitloss',
  sdt: 'sdt'
};

// ─── ISO Week Utilities ─────────────────────────────────────────────────────

function getIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getTodayDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── Memory Decay & Spaced Ladder Calculator ───────────────────────────────

function calculateDecayPriority(pMastery = 0.5, lastPracticedAt = null, ladderRung = 0) {
  const now = Date.now();
  const lastTime = lastPracticedAt ? new Date(lastPracticedAt).getTime() : (now - 3 * 86400000);
  const daysElapsed = Math.max(0, (now - lastTime) / (1000 * 60 * 60 * 24));
  
  const rung = Math.max(0, Math.min(INTERVAL_DAYS.length - 1, Number(ladderRung) || 0));
  const intervalDays = INTERVAL_DAYS[rung] || 1;
  
  const pL = clamp(pMastery);
  // Scale decay priority by elapsed time relative to the scheduled ladder interval
  const overdueRatio = daysElapsed / intervalDays;
  const decayPriority = (1 - pL) * Math.log(1 + overdueRatio);
  return Number(decayPriority.toFixed(4));
}

function selectWarmupTopics(practicedTopics = [], count = DEFAULT_WARMUP_QUESTIONS_COUNT, spacingLadder = {}) {
  const scored = (practicedTopics || [])
    .filter(t => t && t.topic)
    .map(t => {
      const topicKey = t.topic.toLowerCase().trim().replace(/-api$/, '');
      const ladderEntry = spacingLadder && spacingLadder[topicKey];
      const ladderRung = ladderEntry?.rung ?? t.ladderRung ?? 0;
      return {
        topic: topicKey,
        ladderRung,
        decayPriority: calculateDecayPriority(
          t.pMastery !== undefined ? t.pMastery : 0.4,
          ladderEntry?.lastReviewedAt || t.lastPracticedAt || null,
          ladderRung
        ),
        isFallback: false
      };
    })
    .sort((a, b) => b.decayPriority - a.decayPriority);

  const selected = [];
  const chosenTopicKeys = new Set();

  for (const item of scored) {
    if (!chosenTopicKeys.has(item.topic)) {
      chosenTopicKeys.add(item.topic);
      selected.push(item);
      if (selected.length >= count) break;
    }
  }

  if (selected.length < count) {
    for (const fallback of FOUNDATIONAL_TOPICS) {
      if (!chosenTopicKeys.has(fallback)) {
        chosenTopicKeys.add(fallback);
        selected.push({
          topic: fallback,
          ladderRung: 0,
          decayPriority: 0,
          isFallback: true
        });
        if (selected.length >= count) break;
      }
    }
  }

  return selected;
}

function updateTopicSpacingLadder(currentLadder = {}, topic, isCorrect) {
  const ladder = { ...(currentLadder || {}) };
  const topicKey = (topic || '').toLowerCase().trim().replace(/-api$/, '');
  
  const currentEntry = ladder[topicKey] || { rung: 0, intervalDays: INTERVAL_DAYS[0] };
  const currentRung = typeof currentEntry.rung === 'number' ? currentEntry.rung : 0;
  
  const newRung = nextInterval(currentRung, !!isCorrect);
  const intervalDays = INTERVAL_DAYS[newRung] || 1;
  const now = new Date();
  const nextDue = new Date(now.getTime() + intervalDays * 86400000);
  
  ladder[topicKey] = {
    rung: newRung,
    intervalDays,
    lastReviewedAt: now,
    nextReviewDueAt: nextDue
  };
  
  return {
    ladder,
    updatedTopic: topicKey,
    previousRung: currentRung,
    rung: newRung,
    intervalDays,
    nextReviewDueAt: nextDue,
    wentUp: newRung > currentRung
  };
}

// ─── Story Randomizers ──────────────────────────────────────────────────────



const CHARACTERS = ['Maya', 'Rohan', 'Aria', 'Tenali', 'Liam', 'Zara', 'Priya', 'Kavya', 'Arjun', 'Ananya', 'Vikram', 'Leo', 'Meera'];

// ─── Narrative Storyline Question Generators ────────────────────────────────

/**
 * Generates an immersive scenario-based question with character contexts and general concept guidance.
 */
function generateWarmupQuestion(topic = 'addition', difficulty = 'easy') {
  const id = `warmup-${topic}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const t = (topic || '').toLowerCase().trim().replace(/-api$/, '');
  const hero = pick(CHARACTERS);
  const friend = pick(CHARACTERS.filter(c => c !== hero));
  const appKey = TOPIC_APP_KEYS[t] || 'basicarith';

  switch (t) {
    // ── 1. Addition ──────────────────────────────────────────────────────────
    case 'addition': {
      const scenario = randInt(1, 3);
      if (scenario === 1) {
        const a = randInt(18, 55);
        const b = randInt(15, 48);
        const sum = a + b;
        const fruit = pick(['juicy organic mangoes', 'fresh red pomegranates', 'sweet orchard apples', 'crisp golden guavas']);
        return {
          id,
          topic: 'addition',
          appKey,
          conceptName: 'Mental Addition: Place Value Partitioning',
          storyContext: `${hero}'s Sunday Orchard Market`,
          conceptTip: 'Concept Tip: Add the tens columns first, then add the units separately and combine (e.g. 20 + 30 = 50, then 4 + 5 = 9, so total is 59).',
          prompt: `At the community farmer's market, ${hero} packed ${a} baskets of ${fruit} in the morning. By afternoon, ${friend} arrived with ${b} more baskets. How many baskets of ${fruit} did they have in total?`,
          answer: String(sum),
          acceptableAnswers: [String(sum)],
          inputPlaceholder: 'Total baskets',
          difficulty
        };
      } else if (scenario === 2) {
        const a = randInt(25, 65);
        const b = randInt(20, 50);
        const sum = a + b;
        return {
          id,
          topic: 'addition',
          appKey,
          conceptName: 'Mental Addition: Round & Adjust',
          storyContext: `${hero}'s Robotics Lab Assembly`,
          conceptTip: 'Concept Tip: Round one number up to the nearest friendly ten, add the other number, and then subtract the difference.',
          prompt: `In the robotics club, ${hero} sorted ${a} micro-LED diodes into tray A, and ${friend} sorted ${b} micro-LED diodes into tray B for the autonomous rover. How many diodes are sorted in total?`,
          answer: String(sum),
          acceptableAnswers: [String(sum)],
          inputPlaceholder: 'Total diodes',
          difficulty
        };
      } else {
        const a = randInt(35, 75);
        const b = randInt(22, 45);
        const sum = a + b;
        return {
          id,
          topic: 'addition',
          appKey,
          conceptName: 'Addition: Place Value Stacking',
          storyContext: `${hero}'s Ancient Manuscript Archive`,
          conceptTip: 'Concept Tip: Sum column by column from right to left, carrying over 10 units to the tens place if the sum exceeds 9.',
          prompt: `${hero} is cataloging historical palm-leaf scrolls in the royal library. ${hero} archived ${a} scrolls in the east wing and ${b} scrolls in the west wing. What is the total count of archived scrolls?`,
          answer: String(sum),
          acceptableAnswers: [String(sum)],
          inputPlaceholder: 'Total scrolls',
          difficulty
        };
      }
    }

    // ── 2. Subtraction ───────────────────────────────────────────────────────
    case 'subtraction': {
      const scenario = randInt(1, 2);
      if (scenario === 1) {
        const a = randInt(60, 98);
        const b = randInt(18, a - 15);
        const diff = a - b;
        return {
          id,
          topic: 'subtraction',
          appKey,
          conceptName: 'Subtraction: Decomposition Strategy',
          storyContext: `${hero}'s Carnival Arcade Token Quest`,
          conceptTip: 'Concept Tip: Subtract down to the nearest benchmark ten first, then subtract the remaining units in a second step.',
          prompt: `${hero} entered the grand carnival arcade holding ${a} silver prize tokens. After playing the air hockey tournament and bowling alley, ${hero} had spent ${b} tokens. How many tokens does ${hero} have left?`,
          answer: String(diff),
          acceptableAnswers: [String(diff)],
          inputPlaceholder: 'Remaining tokens',
          difficulty
        };
      } else {
        const a = randInt(70, 100);
        const b = randInt(25, a - 10);
        const diff = a - b;
        return {
          id,
          topic: 'subtraction',
          appKey,
          conceptName: 'Subtraction: Difference as Distance',
          storyContext: `${hero}'s Botanical Greenhouse Nursery`,
          conceptTip: 'Concept Tip: Think of subtraction as the distance on a number line — count back the tens first, then count back the units.',
          prompt: `${hero} started the morning with ${a} rare heirloom tomato seedlings in the greenhouse nursery. During the school plant sale, students adopted ${b} seedlings. How many seedlings remain in the greenhouse?`,
          answer: String(diff),
          acceptableAnswers: [String(diff)],
          inputPlaceholder: 'Seedlings remaining',
          difficulty
        };
      }
    }

    // ── 3. Multiplication & Tables ───────────────────────────────────────────
    case 'multiplication':
    case 'tables': {
      const scenario = randInt(1, 2);
      if (scenario === 1) {
        const rows = randInt(6, 12);
        const perRow = randInt(4, 9);
        const prod = rows * perRow;
        return {
          id,
          topic: 'multiplication',
          appKey,
          conceptName: 'Multiplication: Equal Array Scaling',
          storyContext: `${hero}'s Solar Energy Farm`,
          conceptTip: 'Concept Tip: In any rectangular grid or array, Total = (number of rows) × (items per row).',
          prompt: `${hero} is inspecting a green energy solar farm. The rooftop photovoltaic array has ${rows} equal rows of solar panels, with exactly ${perRow} panels in each row. How many solar panels are generating clean electricity?`,
          answer: String(prod),
          acceptableAnswers: [String(prod)],
          inputPlaceholder: 'Total panels',
          difficulty
        };
      } else {
        const trays = randInt(7, 12);
        const perTray = randInt(6, 9);
        const prod = trays * perTray;
        return {
          id,
          topic: 'multiplication',
          appKey,
          conceptName: 'Multiplication: Equal Groups',
          storyContext: `${hero} & ${friend}'s Morning Bakery`,
          conceptTip: 'Concept Tip: Repeated equal groups — multiply the number of groups by the quantity inside each group.',
          prompt: `${hero} and ${friend} prepared ${trays} baking trays for the dawn bakery rush. Each tray holds exactly ${perTray} fresh blueberry tarts. How many tarts did they bake in total?`,
          answer: String(prod),
          acceptableAnswers: [String(prod)],
          inputPlaceholder: 'Total tarts',
          difficulty
        };
      }
    }

    // ── 4. Division ──────────────────────────────────────────────────────────
    case 'division': {
      const groups = randInt(3, 8);
      const perGroup = randInt(4, 9);
      const total = groups * perGroup;
      return {
        id,
        topic: 'division',
        appKey,
        conceptName: 'Division: Equal Sharing (Fair Share)',
        storyContext: `${hero}'s STEM Workshop Distribution`,
        conceptTip: 'Concept Tip: Fair sharing — divide the total quantity equally by the number of recipient groups (Total ÷ Groups = Share).',
        prompt: `${hero} received a shipment of ${total} programmable microcontrollers to divide equally among ${groups} student engineering teams. How many microcontrollers does each team receive?`,
        answer: String(perGroup),
        acceptableAnswers: [String(perGroup)],
        inputPlaceholder: 'Controllers per team',
        difficulty
      };
    }

    // ── 5. Fractions ─────────────────────────────────────────────────────────
    case 'fractions':
    case 'fractionadd': {
      const denom = randInt(6, 12);
      const num1 = randInt(1, Math.floor(denom / 2) - 1);
      const num2 = randInt(1, denom - num1 - 1);
      const totalNum = num1 + num2;
      return {
        id,
        topic: 'fractions',
        appKey,
        conceptName: 'Fractions: Common Denominator Addition',
        storyContext: `${hero} & ${friend}'s Artisan Pizza Kitchen`,
        conceptTip: 'Concept Tip: When parts are the same size (identical denominator), keep the denominator unchanged and add only the numerators.',
        prompt: `${hero} and ${friend} baked a large rectangular focaccia sliced into ${denom} equal pieces. ${hero} served ${num1}/${denom} of the bread, and ${friend} served ${num2}/${denom}. What fraction of the focaccia was served altogether?`,
        answer: `${totalNum}/${denom}`,
        acceptableAnswers: [`${totalNum}/${denom}`, `${totalNum} / ${denom}`],
        inputPlaceholder: 'e.g. 5/12',
        difficulty
      };
    }

    // ── 6. Decimals ──────────────────────────────────────────────────────────
    case 'decimals': {
      const d1 = (randInt(2, 7) + randInt(1, 9) / 10).toFixed(1);
      const d2 = (randInt(1, 5) + randInt(1, 9) / 10).toFixed(1);
      const total = (parseFloat(d1) + parseFloat(d2)).toFixed(1);
      return {
        id,
        topic: 'decimals',
        appKey,
        conceptName: 'Decimals: Tenths Alignment & Addition',
        storyContext: `${hero}'s Coastal Trail Run`,
        conceptTip: 'Concept Tip: Line up numbers by the decimal point so tenths add to tenths and whole numbers add to whole numbers.',
        prompt: `${hero} is training for a cross-country race. In the morning, ${hero} ran ${d1} km along the ocean cliffs, rested, and then ran another ${d2} km to the lighthouse overlook. What was ${hero}'s total distance in kilometers?`,
        answer: String(total),
        acceptableAnswers: [String(total), `${total}km`, `${total} km`],
        inputPlaceholder: 'e.g. 7.4',
        difficulty
      };
    }

    // ── 7. Percentages ───────────────────────────────────────────────────────
    case 'percentages':
    case 'percent': {
      const pct = pick([10, 20, 25, 50]);
      const baseMultiple = randInt(2, 6);
      const price = baseMultiple * (100 / pct) * 5;
      const savings = Math.round((pct / 100) * price);
      return {
        id,
        topic: 'percentages',
        appKey,
        conceptName: 'Percentages: Proportional Part of a Whole',
        storyContext: `${hero}'s Science Book Fair Discount`,
        conceptTip: 'Concept Tip: To find a percentage of an amount, multiply the price by (percentage ÷ 100). For example, 10% is dividing by 10; 25% is dividing by 4.',
        prompt: `At the academy scientific exhibition, a rare astronomy telescope handbook is priced at $${price}. Because ${hero} volunteered at the event, the bookshop gave a ${pct}% discount. How many dollars does ${hero} save on the handbook?`,
        answer: String(savings),
        acceptableAnswers: [String(savings), `$${savings}`],
        inputPlaceholder: 'Savings in dollars',
        difficulty
      };
    }

    // ── 8. HCF & LCM ─────────────────────────────────────────────────────────
    case 'hcf_lcm':
    case 'hcflcm': {
      const a = pick([6, 8, 12, 18]);
      const b = pick([12, 16, 24, 30]);
      const gcd = (x, y) => (!y ? x : gcd(y, x % y));
      const ans = gcd(a, b);
      return {
        id,
        topic: 'hcf_lcm',
        appKey,
        conceptName: 'HCF: Greatest Common Divisor',
        storyContext: `${hero}'s Science Exploration Kits`,
        conceptTip: 'Concept Tip: The Highest Common Factor (HCF) is the largest integer that divides each quantity evenly with zero remainder.',
        prompt: `${hero} is preparing identical science exploration kits using ${a} precision magnifying glasses and ${b} specimen sample containers. What is the greatest number of identical kits ${hero} can assemble without leaving any items out?`,
        answer: String(ans),
        acceptableAnswers: [String(ans)],
        inputPlaceholder: 'Greatest number of kits',
        difficulty
      };
    }

    // ── 9. Linear Equations ──────────────────────────────────────────────────
    case 'lineq':
    case 'lineareq': {
      const rate = randInt(3, 7);
      const hours = randInt(3, 6);
      const baseFee = randInt(10, 20);
      const total = rate * hours + baseFee;
      return {
        id,
        topic: 'lineq',
        appKey,
        conceptName: 'Linear Equations: Isolating the Variable',
        storyContext: `${hero}'s Mountain Bike Adventure`,
        conceptTip: 'Concept Tip: For a cost equation rate·x + fee = total: subtract the fixed fee first from the total, then divide by the hourly rate.',
        prompt: `A mountain bike rental lodge charges an upfront equipment deposit of $${baseFee}, plus $${rate} for every hour rented. ${hero}'s total rental invoice was $${total}. For how many hours (x) did ${hero} rent the bike?`,
        answer: String(hours),
        acceptableAnswers: [String(hours), `${hours} hours`, `${hours}hrs`],
        inputPlaceholder: 'Number of hours',
        difficulty
      };
    }

    // ── 10. Quadratics ───────────────────────────────────────────────────────
    case 'quadratics':
    case 'quadratic': {
      const root1 = randInt(2, 4);
      const root2 = root1 + randInt(2, 4);
      const b = -(root1 + root2);
      const c = root1 * root2;
      return {
        id,
        topic: 'quadratics',
        appKey,
        conceptName: 'Quadratics: Factoring & Ground Intercepts',
        storyContext: `${hero}'s Arch Footbridge Engineering`,
        conceptTip: 'Concept Tip: To solve x² - bx + c = 0, find two numbers that multiply to c and add up to the middle coefficient.',
        prompt: `Civil engineer ${hero} designed a parabolic pedestrian footbridge spanning a canal. The support curve touches the embankment at ground height when x² ${b}x + ${c} = 0. What is the coordinate of the farther ground anchor point (the larger root)?`,
        answer: String(root2),
        acceptableAnswers: [String(root2)],
        inputPlaceholder: 'Larger root',
        difficulty
      };
    }

    // ── 11. Monomials & Exponent Laws ────────────────────────────────────────
    case 'monomials':
    case 'indices': {
      const c1 = randInt(2, 5);
      const c2 = randInt(2, 4);
      const p1 = randInt(1, 3);
      const p2 = randInt(1, 3);
      const ansCoeff = c1 * c2;
      const ansPow = p1 + p2;
      return {
        id,
        topic: 'monomials',
        appKey,
        conceptName: 'Exponents: Product of Powers Rule',
        storyContext: `${hero}'s Satellite Signal Amplifier`,
        conceptTip: 'Concept Tip: Product of powers — multiply the numerical coefficients and add the variable exponents (e.g. ax^m · bx^n = (a·b)x^(m+n)).',
        prompt: `In ${hero}'s satellite telemetry transceiver, the power output of two amplifiers is combined: (${c1}x^${p1}) · (${c2}x^${p2}). Write the simplified single monomial expression:`,
        answer: `${ansCoeff}x^${ansPow}`,
        acceptableAnswers: [`${ansCoeff}x^${ansPow}`, `${ansCoeff}*x^${ansPow}`],
        inputPlaceholder: 'e.g. 12x^4',
        difficulty
      };
    }

    // ── 12. Squares ──────────────────────────────────────────────────────────
    case 'squares':
    case 'squaring': {
      const side = randInt(7, 14);
      const sq = side * side;
      return {
        id,
        topic: 'squares',
        appKey,
        conceptName: 'Geometry: Square Area Calculation',
        storyContext: `${hero}'s Botanical Pavilion Patio`,
        conceptTip: 'Concept Tip: The area of a square is calculated by squaring its side length: Area = side × side.',
        prompt: `${hero} is laying polished limestone paving stones for a square observation patio in the university botanical garden. Each side of the patio is ${side} meters long. What is the total area of the patio in square meters?`,
        answer: String(sq),
        acceptableAnswers: [String(sq), `${sq} sq m`, `${sq}m2`],
        inputPlaceholder: 'Area in square meters',
        difficulty
      };
    }

    // ── 13. Square Roots ─────────────────────────────────────────────────────
    case 'sqrt': {
      const side = randInt(6, 15);
      const area = side * side;
      return {
        id,
        topic: 'sqrt',
        appKey,
        conceptName: 'Square Roots: Determining Side Length from Area',
        storyContext: `${hero}'s Rooftop Solar Array`,
        conceptTip: 'Concept Tip: Given the area of a square, the side length is the square root of the area (Side = √Area).',
        prompt: `${hero} is constructing a square solar collector array that covers an exact area of ${area} square meters on the flat roof of the science center. What is the length of each side of the square array in meters?`,
        answer: String(side),
        acceptableAnswers: [String(side), `${side}m`, `${side} meters`],
        inputPlaceholder: 'Side length in meters',
        difficulty
      };
    }

    // ── 14. Pythagoras' Theorem ──────────────────────────────────────────────
    case 'pythag': {
      const triples = [
        { a: 3, b: 4, c: 5 },
        { a: 6, b: 8, c: 10 },
        { a: 5, b: 12, c: 13 },
        { a: 9, b: 12, c: 15 },
        { a: 8, b: 15, c: 17 }
      ];
      const tPick = pick(triples);
      return {
        id,
        topic: 'pythag',
        appKey,
        conceptName: "Pythagoras' Theorem: Hypotenuse Calculation",
        storyContext: `${hero}'s Radio Tower Guy-Wire Anchor`,
        conceptTip: 'Concept Tip: In any right-angled triangle, a² + b² = c². Square both legs, sum them, and take the square root to find hypotenuse c.',
        prompt: `${hero} is anchoring a vertical radio transmitter tower that stands ${tPick.b} meters high. A heavy-duty steel guy-wire runs from the top of the tower straight to a secure ground anchor staked ${tPick.a} meters from the tower base. How long is the support wire (c) in meters?`,
        answer: String(tPick.c),
        acceptableAnswers: [String(tPick.c), `${tPick.c}m`, `${tPick.c} meters`],
        inputPlaceholder: 'Wire length in meters',
        difficulty
      };
    }

    // ── 15. Angles & Triangles ───────────────────────────────────────────────
    case 'angles':
    case 'triangles': {
      const known = randInt(40, 135);
      const sup = 180 - known;
      return {
        id,
        topic: 'angles',
        appKey,
        conceptName: 'Angles: Supplementary Angles on a Straight Line',
        storyContext: `${hero}'s Solar Collector Tilt Angle`,
        conceptTip: 'Concept Tip: Adjacent angles along a straight line are supplementary and always sum to 180° (Missing Angle = 180° - Known Angle).',
        prompt: `${hero} is calibrating the tilt mechanism of a flat-roof solar thermal panel. The front elevation angle between the collector and the roof deck is ${known}°. Because the roofline forms a straight angle of 180°, what is the supplementary angle on the back side in degrees?`,
        answer: String(sup),
        acceptableAnswers: [String(sup), `${sup}°`, `${sup} deg`],
        inputPlaceholder: 'Angle in degrees',
        difficulty
      };
    }

    // ── 16. Trigonometry ─────────────────────────────────────────────────────
    case 'trig': {
      const trigAngles = [
        { func: 'sin(30°)', val: '1/2', dec: '0.5' },
        { func: 'cos(60°)', val: '1/2', dec: '0.5' },
        { func: 'tan(45°)', val: '1', dec: '1' }
      ];
      const tPick = pick(trigAngles);
      return {
        id,
        topic: 'trig',
        appKey,
        conceptName: 'Trigonometric Ratios: Exact Special Angles',
        storyContext: `${hero}'s Accessibility Ramp Blueprint`,
        conceptTip: 'Concept Tip: Recall special right triangles: In a 30°-60°-90° triangle, opposite/hypotenuse = 1/2. In a 45°-45°-90° triangle, opposite = adjacent.',
        prompt: `${hero} is drafting the blueprint for an accessibility ramp. Municipal building codes require verifying the exact trigonometric ratio of ${tPick.func}. What is the exact value?`,
        answer: tPick.val,
        acceptableAnswers: [tPick.val, tPick.dec, `${tPick.val.replace('/', ' / ')}`],
        inputPlaceholder: 'e.g. 1/2',
        difficulty
      };
    }

    // ── 17. Coordinate Geometry ──────────────────────────────────────────────
    case 'coordgeom': {
      const x1 = randInt(1, 4);
      const y1 = randInt(1, 4);
      const slope = randInt(2, 4);
      const dx = randInt(1, 3);
      const x2 = x1 + dx;
      const y2 = y1 + slope * dx;
      return {
        id,
        topic: 'coordgeom',
        appKey,
        conceptName: 'Coordinate Geometry: Gradient (Rise over Run)',
        storyContext: `${hero}'s Mountain Trail GPS Navigation`,
        conceptTip: 'Concept Tip: Gradient m represents steepness: m = (change in y) / (change in x) = (y₂ - y₁) / (x₂ - x₁).',
        prompt: `On ${hero}'s topographic trail GPS, Ranger Post Alpha is located at coordinates (${x1}, ${y1}) and Lookout Summit Beta is at coordinates (${x2}, ${y2}). What is the slope (gradient m) of the straight ridge path connecting them?`,
        answer: String(slope),
        acceptableAnswers: [String(slope)],
        inputPlaceholder: 'Gradient slope (m)',
        difficulty
      };
    }

    // ── 18. Statistics ───────────────────────────────────────────────────────
    case 'stats': {
      const s1 = randInt(12, 18);
      const s2 = randInt(14, 22);
      const s3 = randInt(10, 20);
      const avg = randInt(15, 20);
      const s4 = 4 * avg - (s1 + s2 + s3);
      return {
        id,
        topic: 'stats',
        appKey,
        conceptName: 'Statistics: Calculating the Arithmetic Mean',
        storyContext: `${hero}'s Basketball Championship Scoring`,
        conceptTip: 'Concept Tip: The mean (average) is calculated by taking the sum of all values divided by the total number of items.',
        prompt: `During the four playoff matches of the regional championship, ${hero}'s basketball squad scored ${s1}, ${s2}, ${s3}, and ${s4} points. What was the squad's average (mean) points scored per game?`,
        answer: String(avg),
        acceptableAnswers: [String(avg), `${avg} points`],
        inputPlaceholder: 'Average points',
        difficulty
      };
    }

    // ── 19. Probability ──────────────────────────────────────────────────────
    case 'prob': {
      const favorable = pick([2, 3, 4]);
      const multiplier = pick([3, 4, 5]);
      const total = favorable * multiplier;
      return {
        id,
        topic: 'prob',
        appKey,
        conceptName: 'Probability: Ratio of Favorable Outcomes',
        storyContext: `${hero}'s University Robotics Raffle`,
        conceptTip: 'Concept Tip: Theoretical probability is the ratio of favorable outcomes over total possible outcomes: P = Favorable / Total.',
        prompt: `At the annual university engineering showcase, ${hero} placed ${favorable} golden access passes into a raffle drum with ${total} total tickets. If one ticket is chosen at random, what is the probability of drawing a golden access pass? (Write as fraction)`,
        answer: `${favorable}/${total}`,
        acceptableAnswers: [`${favorable}/${total}`, `${favorable} / ${total}`, `1/${multiplier}`, `1 / ${multiplier}`],
        inputPlaceholder: 'e.g. 1/4',
        difficulty
      };
    }

    // ── 20. Ratio ────────────────────────────────────────────────────────────
    case 'ratio': {
      const partA = randInt(2, 4);
      const partB = randInt(3, 5);
      const multiplier = randInt(3, 8);
      const actualA = partA * multiplier;
      const actualB = partB * multiplier;
      return {
        id,
        topic: 'ratio',
        appKey,
        conceptName: 'Ratio: Scaling Proportional Quantities',
        storyContext: `${hero}'s Artisan Pottery Studio`,
        conceptTip: 'Concept Tip: Proportions scale by a constant factor. Divide the actual quantity by its ratio part to find the multiplier, then multiply the other part.',
        prompt: `In an artisan ceramic studio, ${hero} mixes a special glaze recipe with a ratio of ${partA} parts cobalt oxide to ${partB} parts silica powder. If ${hero} uses ${actualA} grams of cobalt oxide, how many grams of silica powder are required?`,
        answer: String(actualB),
        acceptableAnswers: [String(actualB), `${actualB}g`, `${actualB} grams`],
        inputPlaceholder: 'Grams of silica',
        difficulty
      };
    }

    // ── 21. Speed, Distance, Time ────────────────────────────────────────────
    case 'sdt': {
      const speed = pick([40, 50, 60, 80]);
      const time = randInt(2, 4);
      const dist = speed * time;
      return {
        id,
        topic: 'sdt',
        appKey,
        conceptName: 'Rate Problems: Distance = Speed × Time',
        storyContext: `${hero}'s High-Speed Electric Express`,
        conceptTip: 'Concept Tip: When traveling at a constant rate, total distance covered is calculated as Speed multiplied by Time (Distance = Speed × Time).',
        prompt: `${hero} is traveling on the regional electric express train, which cruises smoothly at a steady speed of ${speed} km/h. How many kilometers will the train travel in ${time} hours?`,
        answer: String(dist),
        acceptableAnswers: [String(dist), `${dist}km`, `${dist} km`],
        inputPlaceholder: 'Distance in kilometers',
        difficulty
      };
    }

    // ── 22. Profit & Loss ────────────────────────────────────────────────────
    case 'profitloss': {
      const cost = randInt(20, 50) * 5;
      const profit = randInt(15, 35);
      const sp = cost + profit;
      return {
        id,
        topic: 'profitloss',
        appKey,
        conceptName: 'Business Math: Profit = Selling Price - Cost Price',
        storyContext: `${hero}'s Student Enterprise Pop-Up`,
        conceptTip: 'Concept Tip: Profit is the positive difference between the final selling price and the initial cost price: Profit = Selling Price - Cost Price.',
        prompt: `At the student startup weekend, ${hero} crafted handmade cedarwood desktop organizers at a material cost of $${cost} each. ${hero} sold an organizer at the exhibition for $${sp}. What was ${hero}'s profit in dollars?`,
        answer: String(profit),
        acceptableAnswers: [String(profit), `$${profit}`],
        inputPlaceholder: 'Profit in dollars',
        difficulty
      };
    }

    // ── Default / Fallback Arithmetic ────────────────────────────────────────
    default: {
      const a = randInt(18, 48);
      const b = randInt(15, 39);
      const sum = a + b;
      return {
        id,
        topic: 'arithmetic',
        appKey,
        conceptName: 'Mental Arithmetic: Combining Whole Quantities',
        storyContext: `${hero}'s Artisan Craft Supplies`,
        conceptTip: 'Concept Tip: Group quantities into tens and units to compute sums rapidly in your head.',
        prompt: `${hero} has ${a} azure glass craft tiles in workshop bin A, and ${b} golden amber tiles in bin B. How many decorative tiles are there in total?`,
        answer: String(sum),
        acceptableAnswers: [String(sum)],
        inputPlaceholder: 'Total tiles',
        difficulty: 'easy'
      };
    }
  }
}

// ─── Weekly Habit Management ────────────────────────────────────────────────

function normalizeWeeklyHabit(userHabit = {}) {
  const currentWeek = getIsoWeek();
  const habit = {
    targetDaysPerWeek: userHabit?.targetDaysPerWeek || DEFAULT_TARGET_DAYS_PER_WEEK,
    currentWeekYear: userHabit?.currentWeekYear || currentWeek,
    activeDaysThisWeek: Array.isArray(userHabit?.activeDaysThisWeek) ? [...userHabit.activeDaysThisWeek] : [],
    weeklyStreak: Number(userHabit?.weeklyStreak) || 0,
    lastWarmupCompletedAt: userHabit?.lastWarmupCompletedAt || null
  };

  if (habit.currentWeekYear !== currentWeek) {
    const metLastWeekTarget = habit.activeDaysThisWeek.length >= habit.targetDaysPerWeek;
    if (!metLastWeekTarget) {
      habit.weeklyStreak = 0;
    }
    habit.currentWeekYear = currentWeek;
    habit.activeDaysThisWeek = [];
  }

  return habit;
}

function isWarmupCompletedToday(habit) {
  if (!habit || !habit.lastWarmupCompletedAt) return false;
  const today = getTodayDateString();
  const lastDate = getTodayDateString(new Date(habit.lastWarmupCompletedAt));
  return today === lastDate;
}

function recordWarmupCompletion(existingHabit = {}) {
  const habit = normalizeWeeklyHabit(existingHabit);
  const today = getTodayDateString();

  let justAchievedTarget = false;

  if (!habit.activeDaysThisWeek.includes(today)) {
    habit.activeDaysThisWeek.push(today);

    if (habit.activeDaysThisWeek.length === habit.targetDaysPerWeek) {
      habit.weeklyStreak += 1;
      justAchievedTarget = true;
    }
  }

  habit.lastWarmupCompletedAt = new Date();

  return {
    habit,
    justAchievedTarget,
    daysCompletedThisWeek: habit.activeDaysThisWeek.length,
    targetDaysPerWeek: habit.targetDaysPerWeek,
    targetMet: habit.activeDaysThisWeek.length >= habit.targetDaysPerWeek,
    weeklyStreak: habit.weeklyStreak
  };
}

module.exports = {
  calculateDecayPriority,
  selectWarmupTopics,
  generateWarmupQuestion,
  normalizeWeeklyHabit,
  isWarmupCompletedToday,
  recordWarmupCompletion,
  updateTopicSpacingLadder,
  getIsoWeek,
  getTodayDateString,
  TOPIC_APP_KEYS,
  INTERVAL_DAYS,
  nextInterval,
  DEFAULT_TARGET_DAYS_PER_WEEK,
  DEFAULT_WARMUP_QUESTIONS_COUNT
};

/**
 * server/transferScenarios.js
 *
 * Parametric template-based learning transfer scenarios for:
 *   - Percentages ('percent')
 *   - Ratio & Proportion ('ratio')
 *   - Fraction Addition ('fractionadd')
 */

function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}

function simplifyFraction(num, den) {
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  if (sDen === 1) return String(sNum);
  return `${sNum}/${sDen}`;
}

const percentScenarios = [
  {
    scenarioId: 'pct-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const names = ['Arjun', 'Priya', 'Meena', 'Ravi', 'Ananya'];
      const items = ['shirt', 'laptop bag', 'pair of shoes', 'watch', 'schoolbag'];
      const prices = [500, 800, 1200, 1500, 2000, 2500, 3000];
      const discounts = [10, 15, 20, 25, 30];
      const gsts = [5, 12, 18];

      const name = names[Math.floor(Math.random() * names.length)];
      const item = items[Math.floor(Math.random() * items.length)];
      const price = prices[Math.floor(Math.random() * prices.length)];
      const discount = discounts[Math.floor(Math.random() * discounts.length)];
      const gst = gsts[Math.floor(Math.random() * gsts.length)];

      const vars = { name, item, price, discount, gst };
      const res = evaluatePct001(vars);

      return {
        scenarioId: 'pct-transfer-001',
        context: 'shopping',
        prompt: `${name} wants to buy a ${item} that costs ₹${price}. The shop offers a ${discount}% discount. A sales tax of ${gst}% is added after the discount. What is the final price?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Think about the starting price first. What is the discount percent and the tax percent?`,
          `Hint 2 - Strategy: Find the price after the discount is subtracted, then find the new price after the tax is added.`,
          `Hint 3 - Gentle Nudge: Start by calculating the discount amount on the original price.`
        ]
      };
    },
    evaluate: (vars) => evaluatePct001(vars).answer,
    explanation: (vars) => {
      const res = evaluatePct001(vars);
      return `Step 1: Find ${vars.discount}% discount on ₹${vars.price} → ₹${res.discountAmt}\n` +
        `Step 2: Subtract discount → ₹${vars.price} - ₹${res.discountAmt} = ₹${res.discountedDisplay}\n` +
        `Step 3: Find ${vars.gst}% GST on ₹${res.discountedDisplay} → ₹${res.gstAmt}\n` +
        `Step 4: Add GST → ₹${res.discountedDisplay} + ₹${res.gstAmt} = ₹${res.answer}`;
    },
    transferMapping: "The word 'discount' means computing a percentage and subtracting. 'GST' (Goods & Services Tax) means computing a percentage and adding to the discounted price."
  },
  {
    scenarioId: 'pct-transfer-002',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const teams = ['India', 'Australia', 'England', 'South Africa', 'New Zealand'];
      const targets = [200, 240, 250, 300, 320];
      const oversList = [10, 20, 30];
      const rates = [4.5, 5, 5.5, 6, 6.5];

      const team = teams[Math.floor(Math.random() * teams.length)];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const overs = oversList[Math.floor(Math.random() * oversList.length)];
      const rate = rates[Math.floor(Math.random() * rates.length)];

      const vars = { team, target, overs, rate };
      const res = evaluatePct002(vars);

      return {
        scenarioId: 'pct-transfer-002',
        context: 'sports',
        prompt: `A sports team needs to score ${target} runs to win. In the first ${overs} overs, they score ${rate} runs per over. What percentage of the target runs have they scored so far?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Think about the whole target amount first. How many runs have they scored in each over, and for how many overs?`,
          `Hint 2 - Strategy: First find the total runs scored, then find what percentage that is of the target.`,
          `Hint 3 - Gentle Nudge: Try finding the runs scored in the first few overs by combining the overs and runs per over.`
        ]
      };
    },
    evaluate: (vars) => evaluatePct002(vars).answer,
    explanation: (vars) => {
      const res = evaluatePct002(vars);
      return `Step 1: Calculate runs scored → ${vars.overs} overs × ${vars.rate} runs/over = ${res.runs} runs\n` +
        `Step 2: Find percentage of target runs → (${res.runs} / ${vars.target}) × 100 = ${res.answer}%`;
    },
    transferMapping: "A 'run rate' is the average number of runs scored per over. To find what percentage 'a' is of 'b', compute (a / b) × 100."
  },
  {
    scenarioId: 'pct-transfer-003',
    context: 'cooking',
    transferLevel: 3,
    icon: '🍕',
    generate: () => {
      const dishes = ['Kheer', 'Halwa', 'Gulab Jamun', 'Biryani'];
      const servingsList = [4, 5, 8];
      const scalingOptions = {
        4: [6, 8, 10],
        5: [8, 10, 12],
        8: [10, 12, 16]
      };
      const sugars = [100, 150, 200, 250, 300];

      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const servings = servingsList[Math.floor(Math.random() * servingsList.length)];
      const nextServingsList = scalingOptions[servings];
      const newServings = nextServingsList[Math.floor(Math.random() * nextServingsList.length)];
      const sugar = sugars[Math.floor(Math.random() * sugars.length)];

      const vars = { dish, servings, newServings, sugar };
      const res = evaluatePct003(vars);

      return {
        scenarioId: 'pct-transfer-003',
        context: 'cooking',
        prompt: `A sweet recipe for ${dish} serves ${servings} friends and uses ${sugar}g of sugar. If you want to make it for ${newServings} friends, by what percentage must you increase the sugar?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Look at the original number of friends and the new number of friends. Does the exact weight of sugar change the percentage increase?`,
          `Hint 2 - Strategy: The percentage increase in sugar is the same as the percentage increase in guests. How do we find percentage increase?`,
          `Hint 3 - Gentle Nudge: Find how many extra friends you are serving first, and compare that to the starting number of friends.`
        ]
      };
    },
    evaluate: (vars) => evaluatePct003(vars).answer,
    explanation: (vars) => {
      const res = evaluatePct003(vars);
      return `Step 1: Identify that the sugar amount (${vars.sugar}g) is scaled proportionally with servings, so the percentage increase of sugar matches the servings increase.\n` +
        `Step 2: Servings increase = ${vars.newServings} - ${vars.servings} = ${res.diff}\n` +
        `Step 3: Percentage increase = (${res.diff} / ${vars.servings}) × 100 = ${res.answer}%`;
    },
    transferMapping: "When scaling quantities proportionally, the percentage change of any single ingredient (like sugar) is equal to the percentage change of the scale (servings). The formula for percentage change is: (change / original) × 100."
  }
];

const ratioScenarios = [
  {
    scenarioId: 'ratio-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const scales = [1, 2, 5];
      const distances = [10, 50, 100, 150, 200];
      const mapDists = [3, 5, 8, 12, 15];

      const scale = scales[Math.floor(Math.random() * scales.length)];
      const distance = distances[Math.floor(Math.random() * distances.length)];
      const mapDist = mapDists[Math.floor(Math.random() * mapDists.length)];

      const vars = { scale, distance, mapDist };
      const res = evaluateRatio001(vars);

      return {
        scenarioId: 'ratio-transfer-001',
        context: 'travel',
        prompt: `On a map, ${scale} cm represents ${distance} km in real life. If two parks are ${mapDist} cm apart on the map, what is the actual distance between them in km?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Which two things are being compared? Each centimeter on the map represents a certain real distance.`,
          `Hint 2 - Strategy: The comparison should stay the same. Find how many real kilometers 1 cm represents.`,
          `Hint 3 - Gentle Nudge: Find how many times the map distance has grown from the scale.`
        ]
      };
    },
    evaluate: (vars) => evaluateRatio001(vars).answer,
    explanation: (vars) => {
      const res = evaluateRatio001(vars);
      return `Step 1: Establish the scale ratio → ${vars.scale} cm : ${vars.distance} km\n` +
        `Step 2: Find the distance represented by 1 cm → ${vars.distance} / ${vars.scale} = ${res.unitDist} km\n` +
        `Step 3: Multiply by the map distance → ${vars.mapDist} cm × ${res.unitDist} km/cm = ${res.answer} km`;
    },
    transferMapping: "A map scale is a ratio of map distance to real-world distance. If a:b represents the scale, and you have map distance c, the real-world distance is c × (b / a)."
  },
  {
    scenarioId: 'ratio-transfer-002',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const lemonWaterPairs = [
        { juice: 1, water: 4 },
        { juice: 1, water: 5 },
        { juice: 1, water: 6 },
        { juice: 2, water: 5 },
        { juice: 2, water: 7 }
      ];
      const juiceUseds = [50, 100, 150, 200, 250];

      const pair = lemonWaterPairs[Math.floor(Math.random() * lemonWaterPairs.length)];
      const juiceUsed = juiceUseds[Math.floor(Math.random() * juiceUseds.length)];
      const { juice, water } = pair;

      const vars = { juice, water, juiceUsed };
      const res = evaluateRatio002(vars);

      return {
        scenarioId: 'ratio-transfer-002',
        context: 'cooking',
        prompt: `To mix a fruit drink, the ratio of juice to water is ${juice}:${water}. If you use ${juiceUsed} ml of juice, how much water in ml should you add to keep the comparison the same?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Which two things are being compared? Identify the parts of juice and water.`,
          `Hint 2 - Strategy: The ratio of juice to water must stay the same. How many times larger is the juice used compared to its ratio part?`,
          `Hint 3 - Gentle Nudge: Find the growth factor of the juice, and apply it to the water part.`
        ]
      };
    },
    evaluate: (vars) => evaluateRatio002(vars).answer,
    explanation: (vars) => {
      const res = evaluateRatio002(vars);
      return `Step 1: Set up the proportion → juice / water = ${vars.juice} / ${vars.water}\n` +
        `Step 2: Find the scaling multiplier → ${vars.juiceUsed} ml / ${vars.juice} = ${res.scale}\n` +
        `Step 3: Calculate water required → ${vars.water} parts × ${res.scale} ml/part = ${res.answer} ml`;
    },
    transferMapping: "Ratios define proportional relationships. If the ratio is a:b, then juice/water = a/b. When juice becomes J, water becomes J × (b / a) to preserve the ratio."
  },
  {
    scenarioId: 'ratio-transfer-003',
    context: 'shopping',
    transferLevel: 3,
    icon: '🛒',
    generate: () => {
      const totals = [500, 600, 800, 1000, 1200, 1500];
      const ratios = [
        { r1: 2, r2: 3 }, // sum 5
        { r1: 1, r2: 4 }, // sum 5
        { r1: 3, r2: 5 }, // sum 8
        { r1: 1, r2: 5 }  // sum 6
      ];

      // Pick a total and find a ratio that divides it perfectly
      let total, r1, r2;
      for (let attempt = 0; attempt < 50; attempt++) {
        total = totals[Math.floor(Math.random() * totals.length)];
        const pair = ratios[Math.floor(Math.random() * ratios.length)];
        if (total % (pair.r1 + pair.r2) === 0) {
          r1 = pair.r1;
          r2 = pair.r2;
          break;
        }
      }
      if (!r1) { total = 1000; r1 = 2; r2 = 3; } // Fallback

      const vars = { total, r1, r2 };
      const res = evaluateRatio003(vars);

      return {
        scenarioId: 'ratio-transfer-003',
        context: 'shopping',
        prompt: `Two friends, Ravi and Priya, share pocket money of ₹${total} in the ratio ${r1}:${r2}. How much more money does Priya get than Ravi?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What is the total money to share, and how many parts does each friend get?`,
          `Hint 2 - Strategy: Find the value of one part first by splitting the total money equally among all parts.`,
          `Hint 3 - Gentle Nudge: Combine the ratio parts to find the total number of parts first.`
        ]
      };
    },
    evaluate: (vars) => evaluateRatio003(vars).answer,
    explanation: (vars) => {
      const res = evaluateRatio003(vars);
      return `Step 1: Find total ratio parts → ${vars.r1} + ${vars.r2} = ${res.partsSum}\n` +
        `Step 2: Find the value of 1 ratio part → ₹${vars.total} / ${res.partsSum} = ₹${res.unitValue}\n` +
        `Step 3: Find Ravi's share → ${vars.r1} parts × ₹${res.unitValue} = ₹${res.share1}\n` +
        `Step 4: Find Priya's share → ${vars.r2} parts × ₹${res.unitValue} = ₹${res.share2}\n` +
        `Step 5: Find the difference → ₹${res.share2} - ₹${res.share1} = ₹${res.answer}`;
    },
    transferMapping: "To divide an amount in ratio a:b, calculate the sum of parts (a + b). Each part is worth Total / (a + b). The difference between the shares is (b - a) × part value."
  }
];

const fractionaddScenarios = [
  {
    scenarioId: 'frac-transfer-001',
    context: 'pocketmoney',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const options = [
        { f1n: 1, f1d: 3, f2n: 1, f2d: 4 }, // sum 7/12, rem 5/12
        { f1n: 1, f1d: 4, f2n: 1, f2d: 5 }, // sum 9/20, rem 11/20
        { f1n: 1, f1d: 3, f2n: 2, f2d: 5 }, // sum 11/15, rem 4/15
        { f1n: 1, f1d: 4, f2n: 1, f2d: 3 }, // sum 7/12, rem 5/12
        { f1n: 1, f1d: 2, f2n: 1, f2d: 5 }  // sum 7/10, rem 3/10
      ];
      const opt = options[Math.floor(Math.random() * options.length)];
      const { f1n, f1d, f2n, f2d } = opt;
      const vars = { f1n, f1d, f2n, f2d };
      const res = evaluateFrac001(vars);

      return {
        scenarioId: 'frac-transfer-001',
        context: 'pocketmoney',
        prompt: `Arjun spends ${f1n}/${f1d} of his pocket money on books and ${f2n}/${f2d} on snacks. What fraction of his money does he have left?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Are the pieces or parts of the pocket money the same size? Identify the fractions spent.`,
          `Hint 2 - Strategy: To add fractions with different sizes, we must first make the parts the same size.`,
          `Hint 3 - Gentle Nudge: Find a common denominator to rewrite both fractions before combining them.`
        ]
      };
    },
    evaluate: (vars) => evaluateFrac001(vars).answer,
    explanation: (vars) => {
      const res = evaluateFrac001(vars);
      return `Step 1: Find the fraction spent in total → ${vars.f1n}/${vars.f1d} + ${vars.f2n}/${vars.f2d}\n` +
        `        = ${res.spentNum}/${res.lcm}\n` +
        `Step 2: Subtract from the whole (1) → 1 - ${res.spentNum}/${res.lcm} = ${res.lcm}/${res.lcm} - ${res.spentNum}/${res.lcm} = ${res.answer}`;
    },
    transferMapping: "Fraction addition allows you to find a combined share of a whole. Subtracting a fraction from 1 represents finding the remaining fraction of a whole resource."
  },
  {
    scenarioId: 'frac-transfer-002',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const options = [
        { f1n: 1, f1d: 4, f2n: 1, f2d: 3 }, // sum 7/12
        { f1n: 1, f1d: 4, f2n: 2, f2d: 5 }, // sum 13/20
        { f1n: 1, f1d: 3, f2n: 2, f2d: 5 }, // sum 11/15
        { f1n: 2, f1d: 5, f2n: 1, f2d: 3 }, // sum 11/15
        { f1n: 1, f1d: 6, f2n: 1, f2d: 4 }  // sum 5/12
      ];
      const opt = options[Math.floor(Math.random() * options.length)];
      const { f1n, f1d, f2n, f2d } = opt;
      const vars = { f1n, f1d, f2n, f2d };
      const res = evaluateFrac002(vars);

      return {
        scenarioId: 'frac-transfer-002',
        context: 'cooking',
        prompt: `Meena ate ${f1n}/${f1d} of a pizza, and Rahul ate ${f2n}/${f2d} of the same pizza. What fraction of the pizza did they eat altogether?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Are the pizza pieces the same size? Look at the bottom number of both fractions.`,
          `Hint 2 - Strategy: If the pieces are different sizes, find a way to cut the pizza so the parts are equal.`,
          `Hint 3 - Gentle Nudge: Find the least common multiple of the two bottom numbers to make the pieces equal.`
        ]
      };
    },
    evaluate: (vars) => evaluateFrac002(vars).answer,
    explanation: (vars) => {
      const res = evaluateFrac002(vars);
      return `Step 1: Add Meena and Rahul's fractions → ${vars.f1n}/${vars.f1d} + ${vars.f2n}/${vars.f2d}\n` +
        `Step 2: Find common denominator → LCM of ${vars.f1d} and ${vars.f2d} is ${res.lcm}\n` +
        `Step 3: Convert and sum → ${res.v1n}/${res.lcm} + ${res.v2n}/${res.lcm} = ${res.answer}`;
    },
    transferMapping: "Adding fractions finds the combined total when sharing a resource. Always convert the fractions to a common denominator before adding."
  }
];

// Helper evaluation functions to ensure correct values and steps are computed
function evaluatePct001(vars) {
  const discountAmt = Math.round(vars.price * (vars.discount / 100) * 100) / 100;
  const discounted = vars.price - discountAmt;
  const discountedDisplay = Math.round(discounted * 100) / 100;
  const gstAmt = Math.round(discounted * (vars.gst / 100) * 100) / 100;
  const final = discounted + gstAmt;
  const answer = Math.round(final * 100) / 100;

  return { discountAmt, discountedDisplay, gstAmt, answer };
}

function evaluatePct002(vars) {
  const runs = vars.overs * vars.rate;
  const answer = Math.round(((runs / vars.target) * 100) * 100) / 100;
  return { runs, answer };
}

function evaluatePct003(vars) {
  const diff = vars.newServings - vars.servings;
  const answer = Math.round(((diff / vars.servings) * 100) * 100) / 100;
  return { diff, answer };
}

function evaluateRatio001(vars) {
  const unitDist = vars.distance / vars.scale;
  const answer = Math.round((vars.mapDist * unitDist) * 100) / 100;
  return { unitDist, answer };
}

function evaluateRatio002(vars) {
  const scale = vars.juiceUsed / vars.juice;
  const answer = Math.round((vars.water * scale) * 100) / 100;
  return { scale, answer };
}

function evaluateRatio003(vars) {
  const partsSum = vars.r1 + vars.r2;
  const unitValue = vars.total / partsSum;
  const share1 = vars.r1 * unitValue;
  const share2 = vars.r2 * unitValue;
  const answer = share2 - share1;
  return { partsSum, unitValue, share1, share2, answer };
}

function evaluateFrac001(vars) {
  const lcm = (vars.f1d * vars.f2d) / gcd(vars.f1d, vars.f2d);
  const spentNum = vars.f1n * (lcm / vars.f1d) + vars.f2n * (lcm / vars.f2d);
  const answerNum = lcm - spentNum;
  const answer = simplifyFraction(answerNum, lcm);
  return { lcm, spentNum, answerNum, answer };
}

function evaluateFrac002(vars) {
  const lcm = (vars.f1d * vars.f2d) / gcd(vars.f1d, vars.f2d);
  const v1n = vars.f1n * (lcm / vars.f1d);
  const v2n = vars.f2n * (lcm / vars.f2d);
  const answerNum = v1n + v2n;
  const answer = simplifyFraction(answerNum, lcm);
  return { lcm, v1n, v2n, answerNum, answer };
}

const additionScenarios = [
  {
    scenarioId: 'add-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const initial = [120, 150, 180, 200, 220, 250][Math.floor(Math.random() * 6)];
      const off = [15, 20, 25, 30, 35][Math.floor(Math.random() * 5)];
      const on = [25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 6)];
      const vars = { initial, off, on };
      return {
        scenarioId: 'add-transfer-001',
        context: 'travel',
        prompt: `A school bus starts with ${initial} children. At the first stop, ${off} children get off, and ${on} children get on. How many children are on the bus now?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Is the total number of children increasing or decreasing at each step?`,
          `Hint 2 - Strategy: Think about which numbers should be subtracted and which should be added.`,
          `Hint 3 - Gentle Nudge: Calculate how many children were left on the bus after the first stop.`
        ]
      };
    },
    evaluate: (vars) => vars.initial - vars.off + vars.on,
    explanation: (vars) => {
      const remaining = vars.initial - vars.off;
      const ans = remaining + vars.on;
      return `Step 1: Subtract passengers who got off → ${vars.initial} - ${vars.off} = ${remaining}\n` +
        `Step 2: Add passengers who got on → ${remaining} + ${vars.on} = ${ans}`;
    },
    transferMapping: "Adding and subtracting whole numbers maps directly to real-world volume changes, such as passengers on a train."
  },
  {
    scenarioId: 'add-transfer-002',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const budget = [1000, 1500, 2000, 2500][Math.floor(Math.random() * 4)];
      const s1 = [350, 450, 550][Math.floor(Math.random() * 3)];
      const s2 = [200, 300, 400][Math.floor(Math.random() * 3)];
      const refund = [50, 80, 100][Math.floor(Math.random() * 3)];
      const vars = { budget, s1, s2, refund };
      return {
        scenarioId: 'add-transfer-002',
        context: 'shopping',
        prompt: `Karan goes to a toy store with ₹${budget}. He buys a toy train for ₹${s1} and a book for ₹${s2}. Then, he returns a card and gets ₹${refund} back. How much money does he have now?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What is the starting amount of money? Note which actions make the money go down and which make it go up.`,
          `Hint 2 - Strategy: Find the total amount spent first, then subtract it and add the returned amount.`,
          `Hint 3 - Gentle Nudge: Combine the cost of the toy train and the book first.`
        ]
      };
    },
    evaluate: (vars) => vars.budget - (vars.s1 + vars.s2) + vars.refund,
    explanation: (vars) => {
      const spent = vars.s1 + vars.s2;
      const left = vars.budget - spent;
      const ans = left + vars.refund;
      return `Step 1: Find total amount spent → ₹${vars.s1} + ₹${vars.s2} = ₹${spent}\n` +
        `Step 2: Subtract from budget → ₹${vars.budget} - ₹${spent} = ₹${left}\n` +
        `Step 3: Add the refund → ₹${left} + ₹${vars.refund} = ₹${ans}`;
    },
    transferMapping: "A budget decreases by the sum of expenses and increases when a cash refund is returned."
  }
];

const decimalsScenarios = [
  {
    scenarioId: 'dec-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const t1 = [9.58, 9.63, 9.69, 9.72, 9.81][Math.floor(Math.random() * 5)];
      const gap = [0.12, 0.15, 0.18, 0.22, 0.25][Math.floor(Math.random() * 5)];
      const vars = { t1, gap };
      return {
        scenarioId: 'dec-transfer-001',
        context: 'sports',
        prompt: `During a race, the winner finishes in ${t1} seconds. The next runner finishes ${gap} seconds after the winner. How many seconds did the next runner take?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Notice where the decimal point is. Does finishing after the winner mean taking more or less time?`,
          `Hint 2 - Strategy: Digits in the same place value should line up. How do we add two decimal numbers?`,
          `Hint 3 - Gentle Nudge: Place the numbers vertically so the decimal points line up perfectly.`
        ]
      };
    },
    evaluate: (vars) => Math.round((vars.t1 + vars.gap) * 100) / 100,
    explanation: (vars) => {
      const ans = Math.round((vars.t1 + vars.gap) * 100) / 100;
      return `Step 1: Set up the decimal sum → ${vars.t1} + ${vars.gap}\n` +
        `Step 2: Align decimal places and add → ${ans} seconds`;
    },
    transferMapping: "Adding a trailing delay gap in time results in a larger decimal finish time value."
  },
  {
    scenarioId: 'dec-transfer-002',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const target = [1.5, 1.8, 2.0, 2.5][Math.floor(Math.random() * 4)];
      const c1 = [0.45, 0.65, 0.75, 0.85][Math.floor(Math.random() * 4)];
      const c2 = [0.35, 0.40, 0.55, 0.60][Math.floor(Math.random() * 4)];
      const vars = { target, c1, c2 };
      return {
        scenarioId: 'dec-transfer-002',
        context: 'cooking',
        prompt: `A chef needs ${target} kg of flour for a cake. They put ${c1} kg of wheat flour and ${c2} kg of corn flour in a bowl. How much more flour do they need to add?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What is the target weight? Look at the decimal values of the flour already in the bowl.`,
          `Hint 2 - Strategy: Digits in the same place value should line up. Find the total weight of the two flours in the bowl first.`,
          `Hint 3 - Gentle Nudge: Line up the decimal points of the weighed flours to add them.`
        ]
      };
    },
    evaluate: (vars) => Math.round((vars.target - (vars.c1 + vars.c2)) * 100) / 100,
    explanation: (vars) => {
      const sum = Math.round((vars.c1 + vars.c2) * 100) / 100;
      const ans = Math.round((vars.target - sum) * 100) / 100;
      return `Step 1: Find total weighed flour → ${vars.c1} kg + ${vars.c2} kg = ${sum} kg\n` +
        `Step 2: Subtract from target weight → ${vars.target} kg - ${sum} kg = ${ans} kg`;
    },
    transferMapping: "Finding a remaining decimal fraction is solved by subtracting the sum of known decimal parts from the target whole."
  }
];

const hcflcmScenarios = [
  {
    scenarioId: 'hcflcm-transfer-001',
    context: 'pocketmoney',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const a = [24, 36, 48, 60][Math.floor(Math.random() * 4)];
      const b = [30, 45, 60, 75][Math.floor(Math.random() * 4)];
      const vars = { a, b };
      return {
        scenarioId: 'hcflcm-transfer-001',
        context: 'pocketmoney',
        prompt: `Meena has ${a} crayons and ${b} sketch pens. She wants to package them into identical coloring kits to distribute to children in a park. What is the maximum number of kits she can prepare without any leftover items?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: The number of kits must divide both the crayons and sketch pens evenly so that nothing is left over.`,
          `Hint 2 - Strategy: What mathematical tool helps you find the greatest number that can divide two integers perfectly?`,
          `Hint 3 - Gentle Nudge: Think of finding the highest common factor of the two quantities.`
        ]
      };
    },
    evaluate: (vars) => gcd(vars.a, vars.b),
    explanation: (vars) => {
      const ans = gcd(vars.a, vars.b);
      return `Step 1: Identify HCF is needed to share resources equally with maximum bags.\n` +
        `Step 2: Find HCF of ${vars.a} and ${vars.b} → ${ans}`;
    },
    transferMapping: "The maximum identical packages that can be split without remainders is equivalent to the Greatest Common Divisor (GCD/HCF)."
  },
  {
    scenarioId: 'hcflcm-transfer-002',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const l1 = [45, 60, 75][Math.floor(Math.random() * 3)];
      const l2 = [30, 40, 50][Math.floor(Math.random() * 3)];
      const vars = { l1, l2 };
      return {
        scenarioId: 'hcflcm-transfer-002',
        context: 'sports',
        prompt: `Two toy train sets start side-by-side on parallel concentric tracks. Train A completes a full circuit every ${l1} seconds, while Train B completes a circuit every ${l2} seconds. After how many seconds will they align side-by-side at the starting line again for the first time?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: The trains pass the line at intervals that are multiples of their loop times. How do these intervals repeat?`,
          `Hint 2 - Strategy: To find when they line up for the very first time, what mathematical concept helps you find the smallest common multiple of two times?`,
          `Hint 3 - Gentle Nudge: Look for the least common multiple of the two loop durations.`
        ]
      };
    },
    evaluate: (vars) => (vars.l1 * vars.l2) / gcd(vars.l1, vars.l2),
    explanation: (vars) => {
      const ans = (vars.l1 * vars.l2) / gcd(vars.l1, vars.l2);
      return `Step 1: Identify that synchronization cycles match multiples.\n` +
        `Step 2: Find the LCM of ${vars.l1} and ${vars.l2} → ${ans} seconds`;
    },
    transferMapping: "Recurring synchronized intervals are determined by evaluating the Least Common Multiple (LCM)."
  }
];

const lineareqScenarios = [
  {
    scenarioId: 'lineq-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const f = [40, 50, 60][Math.floor(Math.random() * 3)];
      const c = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
      const n = [5, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
      const total = f + c * n;
      const vars = { f, c, total };
      return {
        scenarioId: 'lineq-transfer-001',
        context: 'shopping',
        prompt: `An online book distributor charges a flat delivery fee of ₹${f} per box, plus ₹${c} for every sketchbook purchased. If Ananya's total invoice is ₹${total}, how many sketchbooks did she order?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the fixed cost that Ananya pays regardless of the sketchbooks, and check the total amount of the invoice.`,
          `Hint 2 - Strategy: Subtract the fixed delivery fee from the total invoice, then find how many sketchbooks fit into the remaining cost.`,
          `Hint 3 - Gentle Nudge: Isolate the total cost of the sketchbooks first before dividing by the price of a single sketchbook.`
        ]
      };
    },
    evaluate: (vars) => (vars.total - vars.f) / vars.c,
    explanation: (vars) => {
      const net = vars.total - vars.f;
      const ans = net / vars.c;
      return `Step 1: Set up shipping cost equation → ${vars.f} + ${vars.c}x = ${vars.total}\n` +
        `Step 2: Subtract shipping cost → ${vars.c}x = ${net}\n` +
        `Step 3: Solve for x → x = ${net} / ${vars.c} = ${ans} notebooks`;
    },
    transferMapping: "Solving for variable item counts from mixed fixed/variable pricing maps directly to single-variable linear equations."
  },
  {
    scenarioId: 'lineq-transfer-002',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const base = [50, 70, 100][Math.floor(Math.random() * 3)];
      const rate = [12, 15, 18, 20][Math.floor(Math.random() * 4)];
      const dist = [5, 8, 10, 12, 15][Math.floor(Math.random() * 5)];
      const total = base + rate * dist;
      const vars = { base, rate, total };
      return {
        scenarioId: 'lineq-transfer-002',
        context: 'travel',
        prompt: `A family rents an auto-rickshaw that charges a base hire fare of ₹${base} plus ₹${rate} per kilometer traveled. If their total fare is ₹${total}, how many kilometers did they travel?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What is the constant starting cost of the rickshaw hire, and how much did they pay in total?`,
          `Hint 2 - Strategy: Deduct the starting hire fare from the total amount paid, then determine the distance based on the rate per kilometer.`,
          `Hint 3 - Gentle Nudge: Find the cost associated only with the distance traveled, and then divide it by the price per kilometer.`
        ]
      };
    },
    evaluate: (vars) => (vars.total - vars.base) / vars.rate,
    explanation: (vars) => {
      const net = vars.total - vars.base;
      const ans = net / vars.rate;
      return `Step 1: Set up taxi fare equation → ${vars.base} + ${vars.rate}d = ${vars.total}\n` +
        `Step 2: Subtract base fare → ${vars.rate}d = ${net}\n` +
        `Step 3: Solve for d → d = ${net} / ${vars.rate} = ${ans} km`;
    },
    transferMapping: "Variable distance fares with fixed hire elements require isolating variables in a linear relationship."
  }
];

const sdtScenarios = [
  {
    scenarioId: 'sdt-transfer-001',
    context: 'travel',
    transferLevel: 3,
    icon: '🚂',
    generate: () => {
      const s1 = [60, 80][Math.floor(Math.random() * 2)];
      const s2 = [100, 120][Math.floor(Math.random() * 2)];
      const delay = [1, 2][Math.floor(Math.random() * 2)];
      const vars = { s1, s2, delay };
      return {
        scenarioId: 'sdt-transfer-001',
        context: 'travel',
        prompt: `A slower freight train departs Chennai station traveling at ${s1} km/h. Exactly ${delay} hours later, a fast express train leaves the same station in the same direction on a parallel track at ${s2} km/h. How many hours will it take the express train to catch up to the freight train?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: How much head start distance does the freight train gain before the express train leaves the station?`,
          `Hint 2 - Strategy: Calculate that head start distance. Then, find the difference in speed between the two trains to see how fast the gap closes.`,
          `Hint 3 - Gentle Nudge: Divide the head start distance by the difference in speed of the two trains to find the time needed.`
        ]
      };
    },
    evaluate: (vars) => Math.round(((vars.s1 * vars.delay) / (vars.s2 - vars.s1)) * 100) / 100,
    explanation: (vars) => {
      const lead = vars.s1 * vars.delay;
      const relSpeed = vars.s2 - vars.s1;
      const ans = Math.round((lead / relSpeed) * 100) / 100;
      return `Step 1: Calculate lead distance → ${vars.s1} km/h × ${vars.delay} hours = ${lead} km\n` +
        `Step 2: Calculate relative speed difference → ${vars.s2} - ${vars.s1} = ${relSpeed} km/h\n` +
        `Step 3: Calculate catch-up time → ${lead} km / ${relSpeed} km/h = ${ans} hours`;
    },
    transferMapping: "The time to close a spatial gap is equal to the initial lead distance divided by the relative speed difference of the objects."
  },
  {
    scenarioId: 'sdt-transfer-002',
    context: 'travel',
    transferLevel: 3,
    icon: '🚂',
    generate: () => {
      const s1 = [40, 60, 80][Math.floor(Math.random() * 3)];
      const s2 = [60, 80, 120][Math.floor(Math.random() * 3)];
      const vars = { s1, s2 };
      return {
        scenarioId: 'sdt-transfer-002',
        context: 'travel',
        prompt: `A school bus travels to a museum at an average speed of ${s1} km/h, and returns along the exact same highway at an average speed of ${s2} km/h. What is the average speed for the entire round trip in km/h?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Remember that the bus spends different amounts of time traveling at each speed because the speeds are different.`,
          `Hint 2 - Strategy: The average speed is the total round-trip distance divided by the total time. You can use the harmonic mean formula since the distance is identical in both directions.`,
          `Hint 3 - Gentle Nudge: Set up the formula that takes twice the product of the two speeds and divides it by their sum.`
        ]
      };
    },
    evaluate: (vars) => Math.round(((2 * vars.s1 * vars.s2) / (vars.s1 + vars.s2)) * 100) / 100,
    explanation: (vars) => {
      const num = 2 * vars.s1 * vars.s2;
      const den = vars.s1 + vars.s2;
      const ans = Math.round((num / den) * 100) / 100;
      return `Step 1: Set up the harmonic mean formula → 2 × S1 × S2 / (S1 + S2)\n` +
        `Step 2: Multiply speeds → 2 × ${vars.s1} × ${vars.s2} = ${num}\n` +
        `Step 3: Divide by sum of speeds → ${num} / (${vars.s1} + ${vars.s2}) = ${ans} km/h`;
    },
    transferMapping: "The average speed over equal segments of a round trip is calculated using the harmonic mean, not the arithmetic mean."
  }
];

const probScenarios = [
  {
    scenarioId: 'prob-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const w = [12, 15, 18, 20][Math.floor(Math.random() * 4)];
      const d = [3, 4, 5][Math.floor(Math.random() * 3)];
      const l = [5, 6, 7][Math.floor(Math.random() * 3)];
      const vars = { w, d, l };
      return {
        scenarioId: 'prob-transfer-001',
        context: 'sports',
        prompt: `In a school chess tournament, a player won ${w} games, drew ${d} games, and lost ${l} games. If one game is reviewed at random, what is the probability (as a simplified fraction) that the player did not lose this game?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: How many total games did the player participate in, and which outcomes count as not losing?`,
          `Hint 2 - Strategy: Calculate the total number of games played, and count the wins and draws together. Express this as a fraction of the total.`,
          `Hint 3 - Gentle Nudge: Find the total number of outcomes first, then write the fraction and simplify it by dividing the numerator and denominator by their greatest common divisor.`
        ]
      };
    },
    evaluate: (vars) => {
      const total = vars.w + vars.d + vars.l;
      const favorable = vars.w + vars.d;
      return simplifyFraction(favorable, total);
    },
    explanation: (vars) => {
      const total = vars.w + vars.d + vars.l;
      const favorable = vars.w + vars.d;
      const ans = simplifyFraction(favorable, total);
      return `Step 1: Find total matches → ${vars.w} + ${vars.d} + ${vars.l} = ${total}\n` +
        `Step 2: Find matches not lost → ${vars.w} + ${vars.d} = ${favorable}\n` +
        `Step 3: Write and simplify fraction → ${favorable}/${total} = ${ans}`;
    },
    transferMapping: "Probability of an event is the ratio of favorable outcomes to the total outcomes in the sample space."
  },
  {
    scenarioId: 'prob-transfer-002',
    context: 'pocketmoney',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const r = [5, 6, 8][Math.floor(Math.random() * 3)];
      const b = [4, 5, 6][Math.floor(Math.random() * 3)];
      const g = [3, 4, 5][Math.floor(Math.random() * 3)];
      const vars = { r, b, g };
      return {
        scenarioId: 'prob-transfer-002',
        context: 'pocketmoney',
        prompt: `A pouch contains ${r} red tokens, ${b} blue tokens, and ${g} green tokens for a board game. If you draw one token without looking, what is the probability (as a simplified fraction) of drawing a red token?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Look at how many tokens of each color are in the pouch. What is the total count of all tokens combined?`,
          `Hint 2 - Strategy: Find the total number of items to define the denominator, and use the count of red tokens as the numerator. Simplify the fraction.`,
          `Hint 3 - Gentle Nudge: Start by adding up all the colored tokens to see how many total outcomes are possible.`
        ]
      };
    },
    evaluate: (vars) => {
      const total = vars.r + vars.b + vars.g;
      return simplifyFraction(vars.r, total);
    },
    explanation: (vars) => {
      const total = vars.r + vars.b + vars.g;
      const ans = simplifyFraction(vars.r, total);
      return `Step 1: Find total marbles → ${vars.r} + ${vars.b} + ${vars.g} = ${total}\n` +
        `Step 2: Favorable red outcomes → ${vars.r}\n` +
        `Step 3: Write and simplify fraction → ${vars.r}/${total} = ${ans}`;
    },
    transferMapping: "Calculating target color ratios represents fractional probability of picking a single item from a colored set."
  }
];

const mensurScenarios = [
  {
    scenarioId: 'mens-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const l = [20, 25, 30][Math.floor(Math.random() * 3)];
      const w = [15, 20, 25][Math.floor(Math.random() * 3)];
      const h = [5, 6, 8][Math.floor(Math.random() * 3)];
      const vars = { l, w, h };
      return {
        scenarioId: 'mens-transfer-001',
        context: 'cooking',
        prompt: `A rectangular baking tin is ${l} cm long, ${w} cm wide, and ${h} cm deep. A chef wants to line the inside bottom and all four side walls with baking paper. What is the total area of paper needed in cm²?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the five faces of the baking tin that need paper (the bottom base and the four vertical sides). Note that there is no top lid.`,
          `Hint 2 - Strategy: Calculate the area of the bottom rectangular face, and find the combined area of the four side walls, then add these areas together.`,
          `Hint 3 - Gentle Nudge: Find the area of the base first, then use the height and perimeter of the base to find the side wall areas.`
        ]
      };
    },
    evaluate: (vars) => vars.l * vars.w + 2 * vars.h * (vars.l + vars.w),
    explanation: (vars) => {
      const base = vars.l * vars.w;
      const walls = 2 * vars.h * (vars.l + vars.w);
      const ans = base + walls;
      return `Step 1: Find base area → ${vars.l} × ${vars.w} = ${base} cm²\n` +
        `Step 2: Find side wall areas → 2 × ${vars.h} × (${vars.l} + ${vars.w}) = ${walls} cm²\n` +
        `Step 3: Combine areas → ${base} + ${walls} = ${ans} cm²`;
    },
    transferMapping: "The surface area of an open rectangular prism is evaluated by omitting the top face: base + 2 × height × (length + width)."
  },
  {
    scenarioId: 'mens-transfer-002',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const r = [7, 14, 21][Math.floor(Math.random() * 3)];
      const h = [10, 15, 20][Math.floor(Math.random() * 3)];
      const vars = { r, h };
      return {
        scenarioId: 'mens-transfer-002',
        context: 'travel',
        prompt: `A cylindrical water storage tank at a railway station has a base radius of ${r} meters and a height of ${h} meters. What is the total volume of water in cubic meters it can hold? (Use π = 22/7)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the radius of the circular base and the height of the cylindrical tank.`,
          `Hint 2 - Strategy: Use the volume formula for a cylinder: multiply the area of the circular base by the height.`,
          `Hint 3 - Gentle Nudge: Calculate the base area first by squaring the radius and multiplying it by the given value of π.`
        ]
      };
    },
    evaluate: (vars) => Math.round((22 / 7) * vars.r * vars.r * vars.h),
    explanation: (vars) => {
      const ans = Math.round((22 / 7) * vars.r * vars.r * vars.h);
      return `Step 1: Set up cylinder volume formula → V = πr²h\n` +
        `Step 2: Substitute values → (22/7) × ${vars.r} × ${vars.r} × ${vars.h}\n` +
        `Step 3: Compute volume → ${ans} cubic meters`;
    },
    transferMapping: "Calculating liquid holding capacity of standard tankers maps directly to evaluating cylinder volumes."
  }
];

const quadraticScenarios = [
  {
    scenarioId: 'quad-transfer-001',
    context: 'cooking',
    transferLevel: 3,
    icon: '🍕',
    generate: () => {
      const diff = [2, 4][Math.floor(Math.random() * 2)];
      const x = [6, 8, 10][Math.floor(Math.random() * 3)];
      const total = x * (x + diff);
      const vars = { diff, total };
      return {
        scenarioId: 'quad-transfer-001',
        context: 'cooking',
        prompt: `A gardener is planting flower bulbs in rows and columns on a rectangular plot. The number of rows is ${diff} more than the number of columns. If the plot has space for exactly ${total} bulbs in total, how many rows are there?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Express the relationship between the rows and columns using a variable. Let columns be x.`,
          `Hint 2 - Strategy: Write an equation for the total capacity by multiplying the rows by the columns. This will form a quadratic equation.`,
          `Hint 3 - Gentle Nudge: Expand the equation into standard quadratic form and solve for the positive value of the columns first.`
        ]
      };
    },
    evaluate: (vars) => {
      const a = 1, b = vars.diff, c = -vars.total;
      const x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      return x + vars.diff;
    },
    explanation: (vars) => {
      const a = 1, b = vars.diff, c = -vars.total;
      const x = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      const rows = x + vars.diff;
      return `Step 1: Model layout as quadratic equation → x(x + ${vars.diff}) = ${vars.total}\n` +
        `Step 2: Expand to standard form → x² + ${vars.diff}x - ${vars.total} = 0\n` +
        `Step 3: Factor or solve roots → (x - ${x})(x + ${x + vars.diff}) = 0 → x = ${x} (columns)\n` +
        `Step 4: Find rows → columns + ${vars.diff} = ${rows} rows`;
    },
    transferMapping: "Grid-based surface constraints require forming and resolving quadratic formulas."
  },
  {
    scenarioId: 'quad-transfer-002',
    context: 'sports',
    transferLevel: 3,
    icon: '🏏',
    generate: () => {
      const v = [30, 40, 50][Math.floor(Math.random() * 3)];
      const vars = { v };
      return {
        scenarioId: 'quad-transfer-002',
        context: 'sports',
        prompt: `A soccer ball is kicked straight up into the air. Its height in meters after t seconds is modeled by the height function: h = ${v}t - 5t². How many seconds will it take for the ball to return and touch the ground?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What is the altitude or height value of the soccer ball at the exact moment it touches the ground?`,
          `Hint 2 - Strategy: Set the height variable h to zero, which gives you a quadratic equation. What algebraic methods can you use to solve for t?`,
          `Hint 3 - Gentle Nudge: Try factoring out the common time variable t from the terms to find the non-zero solution.`
        ]
      };
    },
    evaluate: (vars) => vars.v / 5,
    explanation: (vars) => {
      const ans = vars.v / 5;
      return `Step 1: Set height h to 0 → ${vars.v}t - 5t² = 0\n` +
        `Step 2: Factor out the variable t → t(${vars.v} - 5t) = 0\n` +
        `Step 3: Solve for non-zero time → 5t = ${vars.v} → t = ${ans} seconds`;
    },
    transferMapping: "Evaluating projectile flight durations maps to solving the roots of a quadratic equation when the vertical coordinate equals zero."
  }
];

const matrixScenarios = [
  {
    scenarioId: 'mat-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const pa = [250, 300][Math.floor(Math.random() * 2)];
      const pc = [150, 200][Math.floor(Math.random() * 2)];
      const ta = [80, 100][Math.floor(Math.random() * 2)];
      const tc = [120, 150][Math.floor(Math.random() * 2)];
      const vars = { pa, pc, ta, tc };
      return {
        scenarioId: 'mat-transfer-001',
        context: 'shopping',
        prompt: `A school concert charges ₹${pa} for an adult ticket and ₹${pc} for a student ticket. They sell ${ta} adult tickets and ${tc} student tickets. Write this as a matrix multiplication of a Row matrix of prices and a Column matrix of quantities, and find the total revenue in rupees.`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the two sets of values: the price categories (adult and student) and the quantities of tickets sold.`,
          `Hint 2 - Strategy: Form a 1x2 row matrix for the prices and a 2x1 column matrix for the quantities. Multiply corresponding elements and add.`,
          `Hint 3 - Gentle Nudge: Multiply the first price by the first quantity, then add it to the product of the second price and quantity.`
        ]
      };
    },
    evaluate: (vars) => vars.pa * vars.ta + vars.pc * vars.tc,
    explanation: (vars) => {
      const rev = vars.pa * vars.ta + vars.pc * vars.tc;
      return `Step 1: Form Row and Column matrices → [${vars.pa}, ${vars.pc}] × [${vars.ta}, ${vars.tc}]ᵀ\n` +
        `Step 2: Multiply corresponding entries → (${vars.pa} × ${vars.ta}) + (${vars.pc} × ${vars.tc})\n` +
        `Step 3: Sum up to get total revenue → ₹${rev}`;
    },
    transferMapping: "Multi-product business sales and costing operations are modeled mathematically as vector dot products or Row-by-Column matrix multiplications."
  },
  {
    scenarioId: 'mat-transfer-002',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const a1 = [10, 15][Math.floor(Math.random() * 2)];
      const a2 = [8, 12][Math.floor(Math.random() * 2)];
      const b1 = [5, 10][Math.floor(Math.random() * 2)];
      const b2 = [12, 14][Math.floor(Math.random() * 2)];
      const vars = { a1, a2, b1, b2 };
      return {
        scenarioId: 'mat-transfer-002',
        context: 'sports',
        prompt: `A sports shop has two branches. Branch A has ${a1} cricket bats and ${a2} footballs. Branch B has ${b1} cricket bats and ${b2} footballs. Represent each branch's stock as a 1x2 row matrix, and find the combined inventory matrix. (Submit as "bats, footballs")`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the stock numbers of bats and footballs for each of the two branches.`,
          `Hint 2 - Strategy: Form the matrices for both branches. To find the combined inventory, add the corresponding elements of the matrices.`,
          `Hint 3 - Gentle Nudge: Combine the number of bats from both branches first, then combine the number of footballs.`
        ]
      };
    },
    evaluate: (vars) => `${vars.a1 + vars.b1}, ${vars.a2 + vars.b2}`,
    explanation: (vars) => {
      const sum1 = vars.a1 + vars.b1;
      const sum2 = vars.a2 + vars.b2;
      return `Step 1: Set up matrix sum → [${vars.a1}, ${vars.a2}] + [${vars.b1}, ${vars.b2}]\n` +
        `Step 2: Add matching indices → [${vars.a1} + ${vars.b1}, ${vars.a2} + ${vars.b2}]\n` +
        `Step 3: Find combined matrix → [${sum1}, ${sum2}]`;
    },
    transferMapping: "Aggregating inventory across multiple business divisions is modeled as standard matrix addition."
  }
];

const anglesScenarios = [
  {
    scenarioId: 'ang-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const a = [30, 45, 60, 120, 135, 150][Math.floor(Math.random() * 6)];
      const vars = { a };
      return {
        scenarioId: 'ang-transfer-001',
        context: 'travel',
        prompt: `Two paths intersect in a public garden. If one of the angles at the crossing is ${a} degrees, what is the size of the adjacent angle that lies on the same straight path?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Check how the two adjacent angles relate to each other along a straight path.`,
          `Hint 2 - Strategy: Remember that angles forming a straight line are supplementary and always sum to a specific straight-angle value.`,
          `Hint 3 - Gentle Nudge: Think of finding the difference between a straight line's total angle (180 degrees) and the given angle.`
        ]
      };
    },
    evaluate: (vars) => 180 - vars.a,
    explanation: (vars) => `Step 1: Set up the supplementary angle equation → ${vars.a} + x = 180\nStep 2: Solve for x → 180 - ${vars.a} = ${180 - vars.a} degrees`,
    transferMapping: "Intersecting railways form straight-line angles that add up to 180 degrees (supplementary angles)."
  }
];

const basicarithScenarios = [
  {
    scenarioId: 'arith-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const a = [3, 4, 5][Math.floor(Math.random() * 3)];
      const b = [20, 30, 40][Math.floor(Math.random() * 3)];
      const c = [2, 3][Math.floor(Math.random() * 2)];
      const d = [50, 60, 70][Math.floor(Math.random() * 3)];
      const vars = { a, b, c, d };
      return {
        scenarioId: 'arith-transfer-001',
        context: 'shopping',
        prompt: `Arjun buys ${a} notebooks at ₹${b} each, and ${c} binders at ₹${d} each for the school year. What is the total cost in rupees?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the quantities and unit prices for both types of school supplies purchased.`,
          `Hint 2 - Strategy: Find the cost of each item type separately by multiplying the quantity by its price, then combine the two costs.`,
          `Hint 3 - Gentle Nudge: Start by calculating the total cost of the notebooks first.`
        ]
      };
    },
    evaluate: (vars) => vars.a * vars.b + vars.c * vars.d,
    explanation: (vars) => `Step 1: Notebook cost → ${vars.a} × ₹${vars.b} = ₹${vars.a * vars.b}\nStep 2: Binder cost → ${vars.c} × ₹${vars.d} = ₹${vars.c * vars.d}\nStep 3: Total bill → ₹${vars.a * vars.b} + ₹${vars.c * vars.d} = ₹${vars.a * vars.b + vars.c * vars.d}`,
    transferMapping: "Compound purchases map directly to simple multiplication and addition operations."
  }
];

const bankingScenarios = [
  {
    scenarioId: 'bank-transfer-001',
    context: 'pocketmoney',
    transferLevel: 3,
    icon: '🪙',
    generate: () => {
      const p = [500, 1000][Math.floor(Math.random() * 2)];
      const r = [6, 12][Math.floor(Math.random() * 2)];
      const n = [12, 24][Math.floor(Math.random() * 2)];
      const vars = { p, r, n };
      return {
        scenarioId: 'bank-transfer-001',
        context: 'pocketmoney',
        prompt: `Meena sets up a recurring savings deposit, putting aside ₹${p} in her piggy bank at the start of every month for ${n} months. A reward scheme offers simple interest of ${r}% per annum on her recurring savings. What is the total maturity value (her total deposits plus the interest earned) at the end?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the monthly amount deposited, the total number of months, and the annual interest rate.`,
          `Hint 2 - Strategy: Calculate the total principal deposited first. Then, use the recurring deposit interest formula to calculate the accumulated interest before combining them.`,
          `Hint 3 - Gentle Nudge: Recall that the interest calculation involves the sum of the months from 1 to ${n}.`
        ]
      };
    },
    evaluate: (vars) => {
      const dep = vars.p * vars.n;
      const interest = vars.p * (vars.n * (vars.n + 1) / 2) * (1 / 12) * (vars.r / 100);
      return Math.round(dep + interest);
    },
    explanation: (vars) => {
      const dep = vars.p * vars.n;
      const interest = vars.p * (vars.n * (vars.n + 1) / 2) * (1 / 12) * (vars.r / 100);
      return `Step 1: Total Principal deposited → ${vars.p} × ${vars.n} = ₹${dep}\n` +
        `Step 2: Calculate Simple Interest → ₹${Math.round(interest)}\n` +
        `Step 3: Maturity value → ₹${dep} + ₹${Math.round(interest)} = ₹${Math.round(dep + interest)}`;
    },
    transferMapping: "Recurring Deposit interest calculations map to summation series and simple interest formulas."
  }
];

const bearingsScenarios = [
  {
    scenarioId: 'bear-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const b = [60, 120, 240, 300][Math.floor(Math.random() * 4)];
      const vars = { b };
      return {
        scenarioId: 'bear-transfer-001',
        context: 'travel',
        prompt: `A hiker walks from a campsite to a waterfall on a compass bearing of ${String(b).padStart(3, '0')}°. What compass bearing should the hiker follow to return directly from the waterfall to the campsite?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: The return direction is directly opposite to the path taken. What is the angle difference between two opposite directions?`,
          `Hint 2 - Strategy: To find the back bearing, add or subtract 180 degrees to keep the final bearing value within the valid 0° to 360° circle.`,
          `Hint 3 - Gentle Nudge: Check if the given bearing is smaller than 180 degrees to decide whether to add or subtract.`
        ]
      };
    },
    evaluate: (vars) => (vars.b < 180 ? vars.b + 180 : vars.b - 180),
    explanation: (vars) => {
      const ans = vars.b < 180 ? vars.b + 180 : vars.b - 180;
      return `Step 1: Identify if bearing ${vars.b}° is < or >= 180°\n` +
        `Step 2: Calculate back bearing → ${vars.b}° ${vars.b < 180 ? '+' : '-'} 180° = ${String(ans).padStart(3, '0')}°`;
    },
    transferMapping: "Back bearings in navigation represent a 180-degree rotation of the bearing vector."
  }
];

const binomialScenarios = [
  {
    scenarioId: 'binom-transfer-001',
    context: 'sports',
    transferLevel: 3,
    icon: '🏏',
    generate: () => {
      const n = [4, 5, 6][Math.floor(Math.random() * 3)];
      const k = [2, 3][Math.floor(Math.random() * 2)];
      const vars = { n, k };
      return {
        scenarioId: 'binom-transfer-001',
        context: 'sports',
        prompt: `A student plays a ring-toss game at a school carnival. In a turn of ${n} tosses, what is the binomial coefficient C(${n}, ${k}), representing the number of different ways to get exactly ${k} successful ring lands?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the total number of tosses and the target number of successes in this combinations problem.`,
          `Hint 2 - Strategy: Use the combination formula that divides the total factorials by the product of success and failure factorials.`,
          `Hint 3 - Gentle Nudge: Calculate the factorial of the total tosses, and divide it by the product of the factorials of successes and the remaining tosses.`
        ]
      };
    },
    evaluate: (vars) => {
      const fact = (num) => num <= 1 ? 1 : num * fact(num - 1);
      return fact(vars.n) / (fact(vars.k) * fact(vars.n - vars.k));
    },
    explanation: (vars) => {
      const fact = (num) => num <= 1 ? 1 : num * fact(num - 1);
      const ans = fact(vars.n) / (fact(vars.k) * fact(vars.n - vars.k));
      return `Step 1: Combinations formula → C(n, k) = n! / (k! (n-k)!)\n` +
        `Step 2: Solve C(${vars.n}, ${vars.k}) → ${vars.n}! / (${vars.k}! × ${vars.n - vars.k}!) = ${ans}`;
    },
    transferMapping: "Binomial coefficient expansions calculate counts of favorable permutations in multi-stage trials."
  }
];

const boundsScenarios = [
  {
    scenarioId: 'bounds-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const val = [12, 15, 20][Math.floor(Math.random() * 3)];
      const vars = { val };
      return {
        scenarioId: 'bounds-transfer-001',
        context: 'cooking',
        prompt: `A recipe calls for a flour sack labeled as weighing ${val} kg, rounded to the nearest whole kilogram. What is the lower bound, or the minimum possible actual weight, of the flour sack?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Since the weight is rounded to the nearest whole kilogram, what is the size of the rounding interval?`,
          `Hint 2 - Strategy: Find the maximum possible rounding error, which is half of the rounding unit, and subtract it to find the smallest value that rounds to this number.`,
          `Hint 3 - Gentle Nudge: Subtract half of a kilogram from the rounded label weight.`
        ]
      };
    },
    evaluate: (vars) => vars.val - 0.5,
    explanation: (vars) => `Step 1: Identify margin of accuracy → 1 kg / 2 = 0.5 kg\nStep 2: Subtract margin for lower bound → ${vars.val} - 0.5 = ${vars.val - 0.5} kg`,
    transferMapping: "Measurement bounds represent limits of continuous intervals created by rounding errors."
  }
];

const circmeasureScenarios = [
  {
    scenarioId: 'circ-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const r = [10, 14, 20][Math.floor(Math.random() * 3)];
      const theta = [0.5, 1.2, 1.5][Math.floor(Math.random() * 3)];
      const vars = { r, theta };
      return {
        scenarioId: 'circ-transfer-001',
        context: 'travel',
        prompt: `A walking path in a circular botanical garden curves along an arc of radius ${r} meters. If the path subtends an angle of ${theta} radians at the center of the garden, what is the length of the path in meters?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the radius of the circular path and the central angle. Note that the angle is already given in radians.`,
          `Hint 2 - Strategy: Recall how arc length is related to the radius and radian angle. Which multiplication formula gives the curved distance directly?`,
          `Hint 3 - Gentle Nudge: Multiply the radius directly by the radian angle measure.`
        ]
      };
    },
    evaluate: (vars) => Math.round((vars.r * vars.theta) * 100) / 100,
    explanation: (vars) => `Step 1: Arc length formula → s = r × θ\nStep 2: Multiply values → ${vars.r} × ${vars.theta} = ${Math.round((vars.r * vars.theta) * 100) / 100} meters`,
    transferMapping: "The curved distance of circular sectors is evaluated directly using the radian definition: arc = radius × angle."
  }
];

const circlethScenarios = [
  {
    scenarioId: 'circleth-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const angle = 90;
      const vars = { angle };
      return {
        scenarioId: 'circleth-transfer-001',
        context: 'travel',
        prompt: `A semi-circular greenhouse frame has a straight support beam spanning the diameter. Two straight cables connect a point on the curved roof to the two ends of the diameter beam. What is the angle in degrees formed where the two cables meet on the roof?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Observe that the vertex of the angle lies on the boundary of the semicircle, and its arms end at the endpoints of the diameter.`,
          `Hint 2 - Strategy: Apply the circle theorem regarding the angle subtended by a diameter inside a semicircle.`,
          `Hint 3 - Gentle Nudge: Remember that any angle subtended by a diameter at the circle's boundary is always a right angle.`
        ]
      };
    },
    evaluate: (vars) => 90,
    explanation: (vars) => `Step 1: Apply circle theorem → Angle subtended by a diameter at any point on a semicircle is 90°.\nStep 2: Output the constant angle → 90°`,
    transferMapping: "Geometric symmetry in circular structures guarantees constant right angles for points subtending diameters."
  }
];

const complexScenarios = [
  {
    scenarioId: 'comp-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const r1 = [3, 4, 5][Math.floor(Math.random() * 3)];
      const x1 = [2, 3, 4][Math.floor(Math.random() * 3)];
      const r2 = [2, 3, 6][Math.floor(Math.random() * 3)];
      const x2 = [1, 5, 6][Math.floor(Math.random() * 3)];
      const vars = { r1, x1, r2, x2 };
      return {
        scenarioId: 'comp-transfer-001',
        context: 'sports',
        prompt: `An AC electrical system has two components connected in series. The first impedance is Z1 = ${r1} + ${x1}i ohms, and the second is Z2 = ${r2} + ${x2}i ohms. Find the total impedance (sum Z1 + Z2) in standard complex form.`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the real parts (resistance) and imaginary parts (reactance) of both complex numbers.`,
          `Hint 2 - Strategy: Combine the real parts together, and separately combine the imaginary parts to form the new complex number.`,
          `Hint 3 - Gentle Nudge: Find the sum of the two real coefficients first, then find the sum of the imaginary coefficients.`
        ]
      };
    },
    evaluate: (vars) => `${vars.r1 + vars.r2}+${vars.x1 + vars.x2}i`,
    explanation: (vars) => {
      const real = vars.r1 + vars.r2;
      const imag = vars.x1 + vars.x2;
      return `Step 1: Add real parts → ${vars.r1} + ${vars.r2} = ${real}\n` +
        `Step 2: Add imaginary parts → (${vars.x1} + ${vars.x2})i = ${imag}i\n` +
        `Step 3: Combine → ${real} + ${imag}i`;
    },
    transferMapping: "Complex addition combines independent real components (resistances) and imaginary components (reactances)."
  }
];

const congruenceScenarios = [
  {
    scenarioId: 'cong-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const ans = 'SSS';
      const vars = { ans };
      return {
        scenarioId: 'cong-transfer-001',
        context: 'cooking',
        prompt: `A pastry chef cuts triangular cookies. They verify that two cookies have three pairs of matching side lengths: 6 cm, 8 cm, and 10 cm. Which congruence criterion guarantees they are identical? (Enter SSS, SAS, ASA, or RHS)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Observe which matching properties (sides or angles) are verified between the two shapes.`,
          `Hint 2 - Strategy: Choose the criterion that corresponds to comparing three sets of corresponding sides.`,
          `Hint 3 - Gentle Nudge: The acronym represents Side-Side-Side comparison.`
        ]
      };
    },
    evaluate: (vars) => 'SSS',
    explanation: (vars) => `Step 1: Check match → Three sides of one triangle match three sides of another.\nStep 2: Congruence Criterion → SSS`,
    transferMapping: "Congruence criteria define sets of minimal constraints ensuring geometric equivalence."
  }
];

const conicsScenarios = [
  {
    scenarioId: 'conics-transfer-001',
    context: 'travel',
    transferLevel: 3,
    icon: '🚂',
    generate: () => {
      const width = [8, 12, 16][Math.floor(Math.random() * 3)];
      const vars = { width };
      return {
        scenarioId: 'conics-transfer-001',
        context: 'travel',
        prompt: `A parabolic sound collector dish has a cross-section modeled by y = x² / (4f). If the dish spans a diameter of ${width} meters and has a depth of 2 meters, what is its focal distance f in meters?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Find the coordinates of the edge of the dish. What is the distance from the center line (x) and the depth (y)?`,
          `Hint 2 - Strategy: Substitute the edge coordinates (half the width, depth) into the parabolic equation and solve for the variable f.`,
          `Hint 3 - Gentle Nudge: Use the value of half the diameter as your x-value and the depth as your y-value in the formula.`
        ]
      };
    },
    evaluate: (vars) => (vars.width * vars.width) / 32,
    explanation: (vars) => {
      const x = vars.width / 2;
      const ans = (vars.width * vars.width) / 32;
      return `Step 1: Find boundary point → (x, y) = (${x}, 2)\n` +
        `Step 2: Set up equation → 2 = ${x}² / (4f) → 8f = ${x * x}\n` +
        `Step 3: Solve for f → f = ${x * x} / 8 = ${ans} meters`;
    },
    transferMapping: "Parabolic surfaces focus radiation to points defined by the focal variable equation: y = x^2 / (4f)."
  }
];

const coordgeomScenarios = [
  {
    scenarioId: 'coord-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const x1 = [2, 4, 6][Math.floor(Math.random() * 3)];
      const y1 = [3, 5, 7][Math.floor(Math.random() * 3)];
      const x2 = [8, 10, 12][Math.floor(Math.random() * 3)];
      const y2 = [9, 11, 13][Math.floor(Math.random() * 3)];
      const vars = { x1, y1, x2, y2 };
      return {
        scenarioId: 'coord-transfer-001',
        context: 'travel',
        prompt: `A straight walking trail connects Ranger Station A at coordinates (${x1}, ${y1}) and Ranger Station B at (${x2}, ${y2}). What are the coordinates of the midpoint where a water fountain should be built? (Submit as x, y)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the starting and ending coordinates of the path.`,
          `Hint 2 - Strategy: Find the average of the x-coordinates and the average of the y-coordinates to determine the central coordinates.`,
          `Hint 3 - Gentle Nudge: Add the two x-values and divide by 2, then do the same for the two y-values.`
        ]
      };
    },
    evaluate: (vars) => `${(vars.x1 + vars.x2) / 2}, ${(vars.y1 + vars.y2) / 2}`,
    explanation: (vars) => {
      const mx = (vars.x1 + vars.x2) / 2;
      const my = (vars.y1 + vars.y2) / 2;
      return `Step 1: Midpoint X → (${vars.x1} + ${vars.x2}) / 2 = ${mx}\n` +
        `Step 2: Midpoint Y → (${vars.y1} + ${vars.y2}) / 2 = ${my}\n` +
        `Step 3: Midpoint coordinates → ${mx}, ${my}`;
    },
    transferMapping: "Finding the center of linear installations translates directly to coordinate midpoint formulas."
  }
];

const diffScenarios = [
  {
    scenarioId: 'diff-transfer-001',
    context: 'shopping',
    transferLevel: 3,
    icon: '🛒',
    generate: () => {
      const a = [2, 3][Math.floor(Math.random() * 2)];
      const b = [40, 50][Math.floor(Math.random() * 2)];
      const x = [5, 10][Math.floor(Math.random() * 2)];
      const vars = { a, b, x };
      return {
        scenarioId: 'diff-transfer-001',
        context: 'shopping',
        prompt: `A local workshop's revenue in rupees is modeled by the function R(x) = -${a}x² + ${b}x + 500. What is the marginal revenue (the derivative or rate of change dR/dx) when they produce and sell exactly ${x} items?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the revenue function R(x) and the specific production level x.`,
          `Hint 2 - Strategy: Find the derivative function R'(x) first using the power rule, then evaluate it at the given number of items.`,
          `Hint 3 - Gentle Nudge: Differentiate the quadratic terms to get a linear expression, then plug in the value of x.`
        ]
      };
    },
    evaluate: (vars) => -2 * vars.a * vars.x + vars.b,
    explanation: (vars) => {
      const derivCoeff = -2 * vars.a;
      const ans = derivCoeff * vars.x + vars.b;
      return `Step 1: Differentiate R(x) → R'(x) = ${derivCoeff}x + ${vars.b}\n` +
        `Step 2: Substitute x = ${vars.x} → ${derivCoeff}(${vars.x}) + ${vars.b} = ${ans}`;
    },
    transferMapping: "Marginal revenue represents the derivative (rate of change) of a pricing function."
  }
];

const diffeqScenarios = [
  {
    scenarioId: 'diffeq-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const vars = {};
      return {
        scenarioId: 'diffeq-transfer-001',
        context: 'sports',
        prompt: `A physical model for the temperature change of a cooling engine is described by the differential equation: (d²T/dt²)³ - 5(dT/dt) + 2T = 0. What is the order of this differential equation?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Look at all the derivative terms in the equation. Which one represents the highest rate of rate of change?`,
          `Hint 2 - Strategy: Recall that the order of a differential equation is determined by the highest derivative present, regardless of the power it is raised to.`,
          `Hint 3 - Gentle Nudge: Find whether a first derivative or a second derivative is the highest level derivative in this formula.`
        ]
      };
    },
    evaluate: (vars) => 2,
    explanation: (vars) => `Step 1: Find highest derivative order present → d²T/dt² represents second order.\nStep 2: Order is 2.`,
    transferMapping: "The order of differential models matches the order of their highest derivative element."
  }
];

const funcevalScenarios = [
  {
    scenarioId: 'func-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const a = [5, 8, 10][Math.floor(Math.random() * 3)];
      const b = [3, 4, 6][Math.floor(Math.random() * 3)];
      const x = [5, 10, 15][Math.floor(Math.random() * 3)];
      const y = [10, 20][Math.floor(Math.random() * 2)];
      const vars = { a, b, x, y };
      return {
        scenarioId: 'func-transfer-001',
        context: 'shopping',
        prompt: `A school craft workshop calculates its budget in rupees using the cost function C(x, y) = ${a}x + ${b}y + 120. Find the total workshop cost if they make x = ${x} clay pots and y = ${y} wooden toys.`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the two input variables, x and y, and their corresponding given counts for clay pots and wooden toys.`,
          `Hint 2 - Strategy: Substitute the given values of x and y directly into the variables in the cost function formula.`,
          `Hint 3 - Gentle Nudge: Multiply the pot count by its cost coefficient, multiply the toy count by its cost coefficient, then add these products to the fixed cost.`
        ]
      };
    },
    evaluate: (vars) => vars.a * vars.x + vars.b * vars.y + 120,
    explanation: (vars) => {
      const term1 = vars.a * vars.x;
      const term2 = vars.b * vars.y;
      const ans = term1 + term2 + 120;
      return `Step 1: Substitute variables → C(${vars.x}, ${vars.y}) = ${vars.a}(${vars.x}) + ${vars.b}(${vars.y}) + 120\n` +
        `Step 2: Compute terms → ${term1} + ${term2} + 120 = ₹${ans}`;
    },
    transferMapping: "Evaluating factory costing functions involves substituting independent quantities into multi-variable functions."
  }
];

const gstScenarios = [
  {
    scenarioId: 'gst-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const price = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
      const rate = [5, 12, 18][Math.floor(Math.random() * 3)];
      const vars = { price, rate };
      return {
        scenarioId: 'gst-transfer-001',
        context: 'shopping',
        prompt: `A merchant sells a schoolbag for ₹${price} before taxes. If the government GST rate is ${rate}%, what is the tax amount charged on this sale in rupees?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the pre-tax price of the schoolbag and the percentage rate of the sales tax.`,
          `Hint 2 - Strategy: The sales tax is a percentage of the original price. What operation helps you calculate a percentage of a total amount?`,
          `Hint 3 - Gentle Nudge: Express the tax percentage as a fraction out of 100, then multiply this fraction by the base price.`
        ]
      };
    },
    evaluate: (vars) => Math.round((vars.price * (vars.rate / 100)) * 100) / 100,
    explanation: (vars) => {
      const ans = Math.round((vars.price * (vars.rate / 100)) * 100) / 100;
      return `Step 1: Calculate GST fraction → ${vars.rate} / 100 = ${vars.rate / 100}\n` +
        `Step 2: Multiply by base price → ₹${vars.price} × ${vars.rate / 100} = ₹${ans}`;
    },
    transferMapping: "GST calculations apply percentage rates to base transaction values."
  }
];

const indicesScenarios = [
  {
    scenarioId: 'ind-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const initial = [100, 200, 500][Math.floor(Math.random() * 3)];
      const hours = [3, 4, 5][Math.floor(Math.random() * 3)];
      const vars = { initial, hours };
      return {
        scenarioId: 'ind-transfer-001',
        context: 'cooking',
        prompt: `A biology experiment starts with a yeast cell count of ${initial}. If the cell population doubles every hour, what will be the total yeast cell count after ${hours} hours?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What is the starting quantity of yeast cells, and what does doubling every hour mean for the growth factor?`,
          `Hint 2 - Strategy: The population grows exponentially. You need to multiply the starting count by 2 raised to the power of the number of hours.`,
          `Hint 3 - Gentle Nudge: First find the doubling multiplier by raising 2 to the power of the elapsed hours, then scale the starting count.`
        ]
      };
    },
    evaluate: (vars) => vars.initial * Math.pow(2, vars.hours),
    explanation: (vars) => {
      const factor = Math.pow(2, vars.hours);
      const ans = vars.initial * factor;
      return `Step 1: Compute exponential growth factor → 2^${vars.hours} = ${factor}\n` +
        `Step 2: Multiply by initial count → ${vars.initial} × ${factor} = ${ans}`;
    },
    transferMapping: "Growth double steps correspond directly to base-2 exponential functions (2^t)."
  }
];

const multiplyScenarios = [
  {
    scenarioId: 'mul-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const rows = [12, 15, 18, 20][Math.floor(Math.random() * 4)];
      const seats = [6, 8, 10][Math.floor(Math.random() * 3)];
      const vars = { rows, seats };
      return {
        scenarioId: 'mul-transfer-001',
        context: 'travel',
        prompt: `A school assembly hall has ${rows} rows of chairs, with exactly ${seats} chairs set up in each row. What is the total seating capacity of the hall?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Think of the seats arranged in a grid or array. How many rows and how many items are in each row?`,
          `Hint 2 - Strategy: When you have equal groups, what mathematical operation helps you combine them to find the total sum?`,
          `Hint 3 - Gentle Nudge: Multiply the row count by the seat count per row.`
        ]
      };
    },
    evaluate: (vars) => vars.rows * vars.seats,
    explanation: (vars) => `Step 1: Set up product → ${vars.rows} rows × ${vars.seats} seats/row\nStep 2: Multiply → ${vars.rows * vars.seats} seats`,
    transferMapping: "Grid-based capacity aggregates correspond to standard multiplication."
  }
];

const primefactorScenarios = [
  {
    scenarioId: 'prime-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const val = [30, 42, 60, 70][Math.floor(Math.random() * 4)];
      const vars = { val };
      return {
        scenarioId: 'prime-transfer-001',
        context: 'cooking',
        prompt: `A teacher wants to organize ${val} unit blocks into identical sets of prime numbers. What is the prime factorization of ${val}? (Submit your answer as prime factors in ascending order, separated by ' * ', e.g., 2 * 3 * 5)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: You need to break the number down into a product of numbers that are prime (only divisible by 1 and themselves).`,
          `Hint 2 - Strategy: Start dividing the number by the smallest prime number (2) as many times as possible, then move to the next prime numbers.`,
          `Hint 3 - Gentle Nudge: Find the smallest prime number that divides the total value, divide it, and repeat the process with the quotient.`
        ]
      };
    },
    evaluate: (vars) => {
      let n = vars.val;
      const factors = [];
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
      }
      return factors.join(' * ');
    },
    explanation: (vars) => {
      let n = vars.val;
      const factors = [];
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
      }
      return `Step 1: Divide by smallest prime factors → ${vars.val} = ${factors.join(' × ')}`;
    },
    transferMapping: "Decomposing numbers into indivisible factors matches prime factorization."
  }
];

const profitlossScenarios = [
  {
    scenarioId: 'pl-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const cp = [200, 400, 500, 800][Math.floor(Math.random() * 4)];
      const profit = [50, 100, 200][Math.floor(Math.random() * 3)];
      const sp = cp + profit;
      const vars = { cp, sp };
      return {
        scenarioId: 'pl-transfer-001',
        context: 'shopping',
        prompt: `A school store buys a box of pencil cases for ₹${cp} and sells it to students for ₹${sp}. What is the profit percentage earned by the school store?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Compare the purchase price (cost price) with the selling price. Did the store earn a profit?`,
          `Hint 2 - Strategy: Find the difference between the selling price and cost price to get the absolute profit, then express it as a fraction of the cost price.`,
          `Hint 3 - Gentle Nudge: Calculate the profit amount first, then find what percentage that profit amount is of the cost price.`
        ]
      };
    },
    evaluate: (vars) => Math.round(((vars.sp - vars.cp) / vars.cp) * 100 * 100) / 100,
    explanation: (vars) => {
      const diff = vars.sp - vars.cp;
      const ans = Math.round((diff / vars.cp) * 100 * 100) / 100;
      return `Step 1: Find profit amount → ₹${vars.sp} - ₹${vars.cp} = ₹${diff}\n` +
        `Step 2: Find profit percentage → (₹${diff} / ₹${vars.cp}) × 100 = ${ans}%`;
    },
    transferMapping: "Profit percentages express absolute profits relative to the initial cost price."
  }
];

const pythagScenarios = [
  {
    scenarioId: 'pythag-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const base = [6, 8, 12][Math.floor(Math.random() * 3)];
      const height = [8, 15, 16][Math.floor(Math.random() * 3)];
      const vars = { base, height };
      return {
        scenarioId: 'pythag-transfer-001',
        context: 'travel',
        prompt: `A runner starts at a park gate, runs ${base} km due East, then turns and runs ${height} km due North. What is the direct, straight-line distance back to the starting gate in km?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Sketching the East and North paths reveals a right-angled corner. What geometric shape is formed?`,
          `Hint 2 - Strategy: Use the Pythagorean theorem to calculate the length of the straight-line shortcut (the hypotenuse).`,
          `Hint 3 - Gentle Nudge: Find the sum of the squares of the two walking distances, then find the square root of that sum.`
        ]
      };
    },
    evaluate: (vars) => Math.round(Math.sqrt(vars.base * vars.base + vars.height * vars.height) * 100) / 100,
    explanation: (vars) => {
      const sum = vars.base * vars.base + vars.height * vars.height;
      const ans = Math.round(Math.sqrt(sum) * 100) / 100;
      return `Step 1: Set up Pythagoras → D² = ${vars.base}² + ${vars.height}²\n` +
        `Step 2: Add square values → D² = ${vars.base * vars.base} + ${vars.height * vars.height} = ${sum}\n` +
        `Step 3: Solve square root → D = √${sum} = ${ans} km`;
    },
    transferMapping: "Right-angle spatial displacement maps directly to Pythagoras' theorem hypotenuse formulas."
  }
];

const remfactorScenarios = [
  {
    scenarioId: 'rem-transfer-001',
    context: 'sports',
    transferLevel: 3,
    icon: '🏏',
    generate: () => {
      const k = [2, 3][Math.floor(Math.random() * 2)];
      const vars = { k };
      return {
        scenarioId: 'rem-transfer-001',
        context: 'sports',
        prompt: `A school field day distributes participants using the polynomial function P(x) = x³ - 4x² + 5x - 2. If the total number of divisions is grouped in blocks of (x - ${k}), what is the remainder of this polynomial division?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: The divisor is of the linear form (x - k). What theorem relates divisor roots to polynomial remainders?`,
          `Hint 2 - Strategy: According to the Remainder Theorem, dividing P(x) by (x - k) yields a remainder equal to evaluating the polynomial at x = k.`,
          `Hint 3 - Gentle Nudge: Substitute the value of ${k} into the polynomial expression for x and compute the result.`
        ]
      };
    },
    evaluate: (vars) => {
      const k = vars.k;
      return k * k * k - 4 * k * k + 5 * k - 2;
    },
    explanation: (vars) => {
      const k = vars.k;
      const ans = k * k * k - 4 * k * k + 5 * k - 2;
      return `Step 1: Remainder theorem → Remainder = P(${k})\n` +
        `Step 2: Substitute and compute → (${k}³) - 4(${k}²) + 5(${k}) - 2 = ${ans}`;
    },
    transferMapping: "Remainder values of polynomial divisions are determined by evaluating functions at the divisor roots."
  }
];

const roundingScenarios = [
  {
    scenarioId: 'round-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const price = [45.67, 123.45, 89.95][Math.floor(Math.random() * 3)];
      const vars = { price };
      return {
        scenarioId: 'round-transfer-001',
        context: 'shopping',
        prompt: `A textbook at a school book fair is priced at ₹${price}. If a student rounds this price to the nearest whole rupee, what is the estimated cost?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Examine the decimal digits after the decimal point in the price.`,
          `Hint 2 - Strategy: When rounding to the nearest whole unit, check if the decimal value is halfway (0.50) or more. If so, round up; otherwise, round down.`,
          `Hint 3 - Gentle Nudge: Check the decimal value of the price to see if it is 50 paise or more.`
        ]
      };
    },
    evaluate: (vars) => Math.round(vars.price),
    explanation: (vars) => `Step 1: Check fractional decimal part → ${vars.price}\nStep 2: Round to nearest whole integer → ₹${Math.round(vars.price)}`,
    transferMapping: "Estimated transaction values map directly to integer rounding operations."
  }
];

const sectionScenarios = [
  {
    scenarioId: 'sec-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const x1 = 0, y1 = 0;
      const x2 = 10, y2 = 20;
      const m1 = 1, m2 = 1;
      const vars = { x1, y1, x2, y2, m1, m2 };
      return {
        scenarioId: 'sec-transfer-001',
        context: 'travel',
        prompt: `A long straight railway track connects Gate A at coordinates (${x1}, ${y1}) and Gate B at (${x2}, ${y2}). A signal tower divides the line segment between them in a 1:1 ratio. What are the coordinates of the signal tower? (Submit as x, y)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Observe that the signal tower divides the segment in a 1:1 ratio. What does this tell you about its position?`,
          `Hint 2 - Strategy: A 1:1 division means the tower is located exactly at the midpoint of the line. Use the midpoint formula for the coordinates.`,
          `Hint 3 - Gentle Nudge: Find the average of the two x-coordinates and the average of the two y-coordinates.`
        ]
      };
    },
    evaluate: (vars) => '5, 10',
    explanation: (vars) => `Step 1: Apply section formula with ratio 1:1 → ((0+10)/2, (0+20)/2)\nStep 2: Midpoint is 5, 10`,
    transferMapping: "Proportional coordinate divisions utilize standard section formulas."
  }
];

const sequencesScenarios = [
  {
    scenarioId: 'seq-transfer-001',
    context: 'pocketmoney',
    transferLevel: 2,
    icon: '🪙',
    generate: () => {
      const a = [50, 100][Math.floor(Math.random() * 2)];
      const d = [10, 20, 50][Math.floor(Math.random() * 3)];
      const n = [5, 10][Math.floor(Math.random() * 2)];
      const vars = { a, d, n };
      return {
        scenarioId: 'seq-transfer-001',
        context: 'pocketmoney',
        prompt: `Ananya decides to save money to buy a microscope. She puts ₹${a} in her piggy bank in the first week, and increases her weekly savings by ₹${d} each week after that. How much money does she add to her piggy bank in week ${n}?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Check how much Ananya saves in the first week, and note the fixed amount by which her savings increase each week.`,
          `Hint 2 - Strategy: This increasing pattern is an Arithmetic Progression. What formula allows you to find the value of any specific week's savings directly?`,
          `Hint 3 - Gentle Nudge: Multiply the weekly increase by one less than the week number, then add this to the first week's savings.`
        ]
      };
    },
    evaluate: (vars) => vars.a + (vars.n - 1) * vars.d,
    explanation: (vars) => {
      const term = vars.a + (vars.n - 1) * vars.d;
      return `Step 1: Identify AP variables → a = ₹${vars.a}, d = ₹${vars.d}, n = ${vars.n}\n` +
        `Step 2: Apply term formula → ${vars.a} + (${vars.n} - 1) × ${vars.d} = ₹${term}`;
    },
    transferMapping: "Incremental periodic growth profiles represent arithmetic progressions (AP)."
  }
];

const sharesScenarios = [
  {
    scenarioId: 'shares-transfer-001',
    context: 'shopping',
    transferLevel: 3,
    icon: '🛒',
    generate: () => {
      const n = [100, 200, 500][Math.floor(Math.random() * 3)];
      const nv = 10;
      const divRate = [5, 8, 10][Math.floor(Math.random() * 3)];
      const vars = { n, nv, divRate };
      return {
        scenarioId: 'shares-transfer-001',
        context: 'shopping',
        prompt: `An investor holds ${n} shares of stock in a sustainable energy company. Each share has a registered face value of ₹${nv}. If the company announces a dividend payout of ${divRate}%, what is the total dividend payout received in rupees?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the number of shares owned, the nominal face value of a single share, and the declared percentage payout.`,
          `Hint 2 - Strategy: Find the total face value of all the shares first by multiplying the number of shares by their face value, then apply the dividend percentage to this total.`,
          `Hint 3 - Gentle Nudge: Multiply the total nominal value of the shares by the dividend rate fraction.`
        ]
      };
    },
    evaluate: (vars) => vars.n * vars.nv * (vars.divRate / 100),
    explanation: (vars) => {
      const totalFaceVal = vars.n * vars.nv;
      const ans = totalFaceVal * (vars.divRate / 100);
      return `Step 1: Total Face Value → ${vars.n} shares × ₹${vars.nv} = ₹${totalFaceVal}\n` +
        `Step 2: Calculate dividend → ₹${totalFaceVal} × ${vars.divRate}% = ₹${ans}`;
    },
    transferMapping: "Corporate dividends represent percentage returns computed exclusively on nominal face values."
  }
];

const setsScenarios = [
  {
    scenarioId: 'sets-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const total = 50;
      const c = 30;
      const f = 25;
      const both = 10;
      const vars = { total, c, f, both };
      return {
        scenarioId: 'sets-transfer-001',
        context: 'sports',
        prompt: `In a class of ${total} students, ${c} participate in the science club, ${f} join the art club, and ${both} are in both clubs. How many students are not in either club?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: How many total students are in the class? Notice that some students are counted twice because they are in both clubs.`,
          `Hint 2 - Strategy: Use the set union concept to find the number of unique students who are in at least one club, then subtract this from the class total.`,
          `Hint 3 - Gentle Nudge: Find the number of students who are in either club by adding the two club totals and subtracting the double-counted students who are in both.`
        ]
      };
    },
    evaluate: (vars) => vars.total - (vars.c + vars.f - vars.both),
    explanation: (vars) => {
      const union = vars.c + vars.f - vars.both;
      const ans = vars.total - union;
      return `Step 1: Find union of sports players → ${vars.c} + ${vars.f} - ${vars.both} = ${union}\n` +
        `Step 2: Subtract union from total → ${vars.total} - ${union} = ${ans}`;
    },
    transferMapping: "Overlap counts in grouping surveys utilize set intersection and union algebra."
  }
];

const similarityScenarios = [
  {
    scenarioId: 'sim-transfer-001',
    context: 'shopping',
    transferLevel: 3,
    icon: '🛒',
    generate: () => {
      const ratio = 2;
      const v1 = [50, 100, 200][Math.floor(Math.random() * 3)];
      const vars = { ratio, v1 };
      return {
        scenarioId: 'sim-transfer-001',
        context: 'shopping',
        prompt: `A scale model of a classroom storage bin is geometrically similar to the actual bin. If the actual bin has length, width, and height dimensions exactly ${ratio} times larger than the model, and the model has a volume of ${v1} cm³, what is the volume of the actual bin in cm³?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Check the linear scale multiplier. When side dimensions scale up, how does the three-dimensional volume scale?`,
          `Hint 2 - Strategy: Volume scales proportionally to the cube of the linear scale factor. Find the volume scaling factor by cubing the linear factor.`,
          `Hint 3 - Gentle Nudge: Raise the linear dimension multiplier to the third power to find the volume multiplier, then scale up the model's volume.`
        ]
      };
    },
    evaluate: (vars) => vars.v1 * Math.pow(vars.ratio, 3),
    explanation: (vars) => {
      const scaleVol = Math.pow(vars.ratio, 3);
      const ans = vars.v1 * scaleVol;
      return `Step 1: Calculate volume scale factor → ${vars.ratio}³ = ${scaleVol}\n` +
        `Step 2: Scale prototype volume → ${vars.v1} cm³ × ${scaleVol} = ${ans} cm³`;
    },
    transferMapping: "Volume changes in similar physical models scale proportionally to the cube of their linear dimensions."
  }
];

const squaringScenarios = [
  {
    scenarioId: 'sq-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const side = [95, 105][Math.floor(Math.random() * 2)];
      const vars = { side };
      return {
        scenarioId: 'sq-transfer-001',
        context: 'cooking',
        prompt: `A square sandbox in a children's park has side lengths of ${side} cm. What is the total area of the sandbox base in cm²?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the shape of the sandbox and the length of one of its sides.`,
          `Hint 2 - Strategy: What mathematical formula gives the area of a square using the length of a side?`,
          `Hint 3 - Gentle Nudge: Multiply the side length by itself.`
        ]
      };
    },
    evaluate: (vars) => vars.side * vars.side,
    explanation: (vars) => `Step 1: Set up squaring formula → ${vars.side}²\nStep 2: Multiply → ${vars.side * vars.side} cm²`,
    transferMapping: "Determining square geometric surfaces corresponds directly to mathematical squaring."
  }
];

const simulScenarios = [
  {
    scenarioId: 'simul-transfer-001',
    context: 'shopping',
    transferLevel: 3,
    icon: '🛒',
    generate: () => {
      const vars = { a: 110, c: 160 };
      return {
        scenarioId: 'simul-transfer-001',
        context: 'shopping',
        prompt: `At a school fair, 2 adult tickets and 3 student tickets cost a total of ₹700. If 1 adult ticket and 1 student ticket cost ₹270, what is the cost of a single adult ticket in rupees?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Write down variables to represent the cost of an adult ticket and a student ticket. Identify the two purchase scenarios.`,
          `Hint 2 - Strategy: Form a system of two linear equations with two variables. Use elimination or substitution to isolate the adult ticket cost.`,
          `Hint 3 - Gentle Nudge: Try multiplying the second equation by 3 to match the number of student tickets, then subtract the first equation to eliminate the student ticket variable.`
        ]
      };
    },
    evaluate: (vars) => 110,
    explanation: (vars) => `Step 1: Set up system:\n  2A + 3C = 700\n  A + C = 270\nStep 2: Multiply Eq 2 by 3 → 3A + 3C = 810\nStep 3: Subtract Eq 1 → A = 110 rupees`,
    transferMapping: "Multi-parameter cost systems are resolved using simultaneous algebraic equations."
  }
];

const stdformScenarios = [
  {
    scenarioId: 'std-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const vars = {};
      return {
        scenarioId: 'std-transfer-001',
        context: 'travel',
        prompt: `A distant star is located 3.0 × 10^13 kilometers from Earth. If a science probe travels at a speed of 1.5 × 10^4 kilometers per hour, how many hours will it take to reach the star? (Submit in format: e.g. 2e9)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the distance and speed given in scientific notation. Which division relates distance and speed to find the duration?`,
          `Hint 2 - Strategy: To divide numbers in scientific notation, divide the coefficients and subtract the exponent of the divisor from the exponent of the dividend.`,
          `Hint 3 - Gentle Nudge: Divide the first decimal number by the second decimal number, then subtract the exponent of 10 in the speed from the exponent of 10 in the distance.`
        ]
      };
    },
    evaluate: (vars) => '2e9',
    explanation: (vars) => `Step 1: Divide distance by speed → (3.0e13) / (1.5e4)\nStep 2: Divide coefficients and exponents → 2.0e9 hours`,
    transferMapping: "Large-scale division calculations utilize rules of scientific notation exponent subtraction."
  }
];

const statsScenarios = [
  {
    scenarioId: 'stat-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const s1 = 40, s2 = 50, s3 = 60;
      const vars = { s1, s2, s3 };
      return {
        scenarioId: 'stat-transfer-001',
        context: 'sports',
        prompt: `A student scores ${s1}, ${s2}, and ${s3} points on three weekly spelling quizzes. What is their mean quiz score?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the quiz scores from the three weeks. How many scores are there in total?`,
          `Hint 2 - Strategy: The mean is the average value. Add all the individual scores together, then divide by the total number of quizzes.`,
          `Hint 3 - Gentle Nudge: Start by calculating the sum of the three quiz scores first.`
        ]
      };
    },
    evaluate: (vars) => (vars.s1 + vars.s2 + vars.s3) / 3,
    explanation: (vars) => `Step 1: Sum observations → ${vars.s1} + ${vars.s2} + ${vars.s3} = ${vars.s1 + vars.s2 + vars.s3}\nStep 2: Divide by sample count → ${vars.s1 + vars.s2 + vars.s3} / 3 = 50`,
    transferMapping: "Mean parameters represent central averages calculated across discrete sample lists."
  }
];

const surdsScenarios = [
  {
    scenarioId: 'surd-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const vars = {};
      return {
        scenarioId: 'surd-transfer-001',
        context: 'travel',
        prompt: `A design for a square flowerbed has a diagonal length modeled by the expression √18 + √8 meters. What is this length in fully simplified surd form? (Submit as a√b)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Note that you cannot add surds directly unless they have the same number under the square root symbol.`,
          `Hint 2 - Strategy: Simplify both square root terms by factoring out perfect squares, then add the resulting coefficients.`,
          `Hint 3 - Gentle Nudge: Simplify the first root by writing it as a multiple of √2, then do the same for the second root.`
        ]
      };
    },
    evaluate: (vars) => '5√2',
    explanation: (vars) => `Step 1: Simplify components → √18 = 3√2 and √8 = 2√2\nStep 2: Sum terms → 3√2 + 2√2 = 5√2`,
    transferMapping: "Adding irrational surds requires expressing terms under a common radical."
  }
];

const transformScenarios = [
  {
    scenarioId: 'trans-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const x = 3, y = 4;
      const dx = 2, dy = 5;
      const vars = { x, y, dx, dy };
      return {
        scenarioId: 'trans-transfer-001',
        context: 'shopping',
        prompt: `A graphic design element at coordinate (${x}, ${y}) on a screen is shifted by the translation vector [${dx}, ${dy}]. What are the coordinates of the new vertex? (Submit as x, y)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: What are the initial coordinates of the design element, and what are the horizontal and vertical shifts of the translation vector?`,
          `Hint 2 - Strategy: A translation shifts the points on a plane. Add the horizontal vector value to the x-coordinate, and add the vertical vector value to the y-coordinate.`,
          `Hint 3 - Gentle Nudge: Add the first number of the vector to the initial x-value, and the second number of the vector to the initial y-value.`
        ]
      };
    },
    evaluate: (vars) => `${vars.x + vars.dx}, ${vars.y + vars.dy}`,
    explanation: (vars) => `Step 1: Shift X coordinate → ${vars.x} + ${vars.dx} = ${vars.x + vars.dx}\nStep 2: Shift Y coordinate → ${vars.y} + ${vars.dy} = ${vars.y + vars.dy}`,
    transferMapping: "Coordinate translations shift indices linearly according to vector offsets."
  }
];

const trianglesScenarios = [
  {
    scenarioId: 'tri-transfer-001',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const a1 = 50, a2 = 60;
      const vars = { a1, a2 };
      return {
        scenarioId: 'tri-transfer-001',
        context: 'cooking',
        prompt: `A triangular sail on a model boat has two angles measuring ${a1}° and ${a2}°. What is the measure of the third angle in degrees?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the measures of the two given angles of the triangular sail.`,
          `Hint 2 - Strategy: The sum of all three internal angles of any triangle is a constant value. Add the two known angles, and find what is needed to reach that total.`,
          `Hint 3 - Gentle Nudge: Subtract the combined total of the two given angles from 180 degrees.`
        ]
      };
    },
    evaluate: (vars) => 180 - (vars.a1 + vars.a2),
    explanation: (vars) => `Step 1: Find sum of angles → ${vars.a1} + ${vars.a2} = ${vars.a1 + vars.a2}°\nStep 2: Subtract from 180° → 180 - ${vars.a1 + vars.a2} = ${180 - (vars.a1 + vars.a2)}°`,
    transferMapping: "Triangle angle sum properties are constrained by a constant sum of 180 degrees."
  }
];

const trigScenarios = [
  {
    scenarioId: 'trig-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const opp = 10, adj = 10;
      const vars = { opp, adj };
      return {
        scenarioId: 'trig-transfer-001',
        context: 'travel',
        prompt: `A model rocket launcher tower is ${opp} meters tall. If a student stands ${adj} meters away from the base of the tower, what is the angle of elevation of the top of the tower in degrees from the student's position?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the height of the tower (opposite side) and the distance from the tower (adjacent side) in the right-angled triangle.`,
          `Hint 2 - Strategy: Use the tangent trigonometric function, which is the ratio of the opposite side to the adjacent side, to solve for the angle.`,
          `Hint 3 - Gentle Nudge: Find the ratio of the opposite height to the adjacent distance, and then find the angle whose tangent is equal to this ratio.`
        ]
      };
    },
    evaluate: (vars) => 45,
    explanation: (vars) => `Step 1: Set up tangent ratio → tan(θ) = ${vars.opp} / ${vars.adj} = 1\nStep 2: Solve inverse tangent → θ = arctan(1) = 45°`,
    transferMapping: "Elevation angle vectors are calculated using standard inverse tangent trigonometric ratios."
  }
];

const variationScenarios = [
  {
    scenarioId: 'var-transfer-001',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const force1 = 10, ext1 = 5;
      const force2 = 20;
      const vars = { force1, ext1, force2 };
      return {
        scenarioId: 'var-transfer-001',
        context: 'sports',
        prompt: `The stretch distance of a gym spring band varies directly with the pulling force applied to it. If a force of ${force1} N stretches the band by ${ext1} cm, how many cm will a pulling force of ${force2} N stretch it?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the initial force and its corresponding stretch distance, as well as the new target force.`,
          `Hint 2 - Strategy: Since this is a direct variation relationship, the ratio of stretch to force remains constant. Calculate the constant of variation (ratio) first.`,
          `Hint 3 - Gentle Nudge: Find the stretch distance per 1 Newton of force, then multiply this constant rate by the new force value.`
        ]
      };
    },
    evaluate: (vars) => (vars.ext1 / vars.force1) * vars.force2,
    explanation: (vars) => `Step 1: Calculate direct variation constant k → ${vars.ext1} / ${vars.force1} = ${vars.ext1 / vars.force1}\nStep 2: Solve new extension → ${vars.ext1 / vars.force1} × ${vars.force2} = ${(vars.ext1 / vars.force1) * vars.force2} cm`,
    transferMapping: "Proportional variations map directly to constant coefficients in linear direct relations."
  }
];

const vectorsScenarios = [
  {
    scenarioId: 'vec-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const x1 = 2, y1 = 3, x2 = 4, y2 = 5;
      const vars = { x1, y1, x2, y2 };
      return {
        scenarioId: 'vec-transfer-001',
        context: 'travel',
        prompt: `A hiker walks on a trail and completes a first displacement vector A = [${x1}, ${y1}] relative to a basecamp. They then walk a second displacement vector B = [${x2}, ${y2}]. What are the coordinates of their final position relative to the basecamp? (Submit as x, y)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Identify the horizontal (x) and vertical (y) shift components for both parts of the journey.`,
          `Hint 2 - Strategy: To find the final position, add the two independent displacement vectors. Combine the x-coordinates together and the y-coordinates together.`,
          `Hint 3 - Gentle Nudge: Add the first coordinate of vector A to the first coordinate of vector B, then do the same for the second coordinates.`
        ]
      };
    },
    evaluate: (vars) => `${vars.x1 + vars.x2}, ${vars.y1 + vars.y2}`,
    explanation: (vars) => `Step 1: Sum matching vector coordinates → [${vars.x1}+${vars.x2}, ${vars.y1}+${vars.y2}]\nStep 2: Find total displacement → ${vars.x1 + vars.x2}, ${vars.y1 + vars.y2}`,
    transferMapping: "Iterated physical displacements correspond to vector sum operations."
  }
];

const vocabScenarios = [
  {
    scenarioId: 'voc-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const vars = {};
      return {
        scenarioId: 'voc-transfer-001',
        context: 'travel',
        prompt: `In mapmaking, the balance point or geometric center of a triangular reserve is referred to as which term? (Enter Centroid, Circumcenter, or Incenter)`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Think of the point where the three medians of a triangle intersect.`,
          `Hint 2 - Strategy: The term represents the average position of all points in the geometric figure, often called the center of mass.`,
          `Hint 3 - Gentle Nudge: It starts with the prefix 'Cent-' and refers to the balance point of a triangular shape.`
        ]
      };
    },
    evaluate: (vars) => 'Centroid',
    explanation: (vars) => `Step 1: Check description → Average geometric center is the Centroid.\nStep 2: Centroid`,
    transferMapping: "Spatial centering vocabulary maps directly to geometric centroid terminology."
  }
];

const guessScenarios = [
  {
    scenarioId: 'guess-transfer-001',
    context: 'pocketmoney',
    transferLevel: 2,
    icon: '🪙',
    generate: () => {
      const vars = {};
      return {
        scenarioId: 'guess-transfer-001',
        context: 'pocketmoney',
        prompt: `In a card sorting game with 100 cards numbered in order, what is the maximum number of card checks needed to guarantee finding a specific card using binary search?`,
        variables: vars,
        hints: [
          `Hint 1 - Observation: Recall how binary search divides the search space. How much of the remaining cards are eliminated at each step?`,
          `Hint 2 - Strategy: Each search step halves the number of remaining options. You need to find the smallest exponent n such that 2 raised to the power of n is greater than or equal to the total card count.`,
          `Hint 3 - Gentle Nudge: Think of finding the smallest power of 2 that is at least 100.`
        ]
      };
    },
    evaluate: (vars) => 7,
    explanation: (vars) => `Step 1: Model range using binary search → 2^n >= 100\nStep 2: Evaluate exponent → n = 7`,
    transferMapping: "Optimal search boundaries in ordered sets are calculated using base-2 logarithm bounds."
  }
];

module.exports = {
  percent: percentScenarios,
  ratio: ratioScenarios,
  fractionadd: fractionaddScenarios,
  addition: additionScenarios,
  decimals: decimalsScenarios,
  hcflcm: hcflcmScenarios,
  lineareq: lineareqScenarios,
  sdt: sdtScenarios,
  prob: probScenarios,
  mensur: mensurScenarios,
  quadratic: quadraticScenarios,
  matrix: matrixScenarios,
  angles: anglesScenarios,
  basicarith: basicarithScenarios,
  banking: bankingScenarios,
  bearings: bearingsScenarios,
  binomial: binomialScenarios,
  bounds: boundsScenarios,
  circmeasure: circmeasureScenarios,
  circleth: circlethScenarios,
  complex: complexScenarios,
  congruence: congruenceScenarios,
  conics: conicsScenarios,
  coordgeom: coordgeomScenarios,
  diff: diffScenarios,
  diffeq: diffeqScenarios,
  funceval: funcevalScenarios,
  gst: gstScenarios,
  indices: indicesScenarios,
  multiply: multiplyScenarios,
  primefactor: primefactorScenarios,
  profitloss: profitlossScenarios,
  pythag: pythagScenarios,
  remfactor: remfactorScenarios,
  rounding: roundingScenarios,
  section: sectionScenarios,
  sequences: sequencesScenarios,
  shares: sharesScenarios,
  sets: setsScenarios,
  similarity: similarityScenarios,
  squaring: squaringScenarios,
  simul: simulScenarios,
  stdform: stdformScenarios,
  stats: statsScenarios,
  surds: surdsScenarios,
  transform: transformScenarios,
  triangles: trianglesScenarios,
  trig: trigScenarios,
  variation: variationScenarios,
  vectors: vectorsScenarios,
  vocab: vocabScenarios,
  guess: guessScenarios,
  // Gym mappings for compatibility
  gymdecimals: decimalsScenarios,
  funcgym: funcevalScenarios,
  dotprodgym: matrixScenarios,
  fracaddgym: fractionaddScenarios,
  lineqgym: lineareqScenarios,
  indicesgym: indicesScenarios,
  polygym: quadraticScenarios,
  simplifyFraction
};

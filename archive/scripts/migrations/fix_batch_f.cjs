const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'learnContent');

const files = {
  polygym: {
    title: "Polynomials Gym: Algebra Workout",
    blocks: [
      { icon: "\ud83c\udfcb\ufe0f", title: "1. The Core Concept: Algebraic Fitness", content: "The Polynomials Gym tests your ability to perform basic algebraic operations with monomials and polynomials under time pressure. You'll practice adding, subtracting, and multiplying terms with variables. This builds the fundamental algebra muscle needed for every advanced topic." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Like Terms", content: "\u2022 You can only add/subtract **like terms** (same variable, same power).\n\u2022 3x^2 + 5x^2 = 8x^2 (like terms, add coefficients).\n\u2022 3x^2 + 5x = cannot be simplified (different powers).\n\u2022 When multiplying: multiply coefficients AND add powers. 2x^3 * 3x^2 = 6x^5." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Speed Tips", content: "For fast polynomial arithmetic:\n\n1. Group like terms together first.\n2. Add coefficients of like terms.\n3. When multiplying, use the law of indices: x^a * x^b = x^(a+b).\n4. Keep terms in order of descending power for neatness.\n5. Double-check signs, especially with subtraction." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Simplify 3x^2 + 5x - 2x^2 + 7", content: "**Step 1:** Group like terms: (3x^2 - 2x^2) + 5x + 7.\n**Step 2:** Combine: x^2 + 5x + 7.\n\n**Final Answer: x^2 + 5x + 7.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common gym mistake: treating 2x and 2x^2 as like terms. They are NOT! 2x is degree 1, 2x^2 is degree 2. You can only combine terms with the exact same variable AND the exact same power. Also, don't confuse adding coefficients (for addition) with multiplying coefficients (for multiplication). 2x + 3x = 5x, but 2x * 3x = 6x^2." }
    ]
  },
  polymul: {
    title: "Polynomial Multiplication: The FOIL Master",
    blocks: [
      { icon: "\u2716\ufe0f", title: "1. The Core Concept: Expanding Brackets", content: "When you multiply two brackets like **(x + 3)(x + 5)**, every term in the first bracket must be multiplied by every term in the second bracket. This process is called **expansion** or **distribution**. For two binomials, the popular shortcut is **FOIL**: First, Outer, Inner, Last. It's the gateway to quadratics, factoring, and all of algebra." },
      { icon: "\ud83d\udcda", title: "2. The Rules: FOIL Method", content: "For (a + b)(c + d):\n\n\u2022 **F**irst: a * c\n\u2022 **O**uter: a * d\n\u2022 **I**nner: b * c\n\u2022 **L**ast: b * d\n\u2022 Then add all four results together and simplify by combining like terms." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Expanding Double Brackets", content: "To expand (2x + 3)(x - 4):\n\n1. **F:** 2x * x = 2x^2\n2. **O:** 2x * (-4) = -8x\n3. **I:** 3 * x = 3x\n4. **L:** 3 * (-4) = -12\n5. **Combine:** 2x^2 - 8x + 3x - 12 = **2x^2 - 5x - 12**" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Perfect Square", content: "Expand **(x + 5)^2** = (x + 5)(x + 5).\n\n**F:** x * x = x^2\n**O:** x * 5 = 5x\n**I:** 5 * x = 5x\n**L:** 5 * 5 = 25\n\n**Combine:** x^2 + 5x + 5x + 25 = **x^2 + 10x + 25**\n\nNotice: the middle term is always 2 x first x last!" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The absolute classic mistake: saying (x+5)^2 = x^2 + 25. Students just square each term separately and forget the middle term (2 * x * 5 = 10x). (x+5)^2 = x^2 + 10x + 25, NOT x^2 + 25. The middle term is ALWAYS there. If you write (a+b)^2 = a^2 + b^2, you have committed the most common algebra sin in existence." }
    ]
  },
  prob: {
    title: "Probability: Predicting the Future",
    blocks: [
      { icon: "\ud83c\udfb2", title: "1. The Core Concept: Measuring Chance", content: "Will it rain tomorrow? Will you roll a 6? Will your team win? **Probability** assigns a number between 0 and 1 to every possible event. 0 means impossible, 1 means certain, and 0.5 means a coin-flip chance. It's the math behind gambling, weather forecasting, insurance, and even medical diagnosis." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Basic Formula", content: "\u2022 **P(event) = favorable outcomes / total outcomes.**\n\u2022 All probabilities must be between 0 and 1 (inclusive).\n\u2022 **P(not A)** = 1 - P(A). The probability of something NOT happening.\n\u2022 **Independent events (AND):** P(A and B) = P(A) x P(B).\n\u2022 **Mutually exclusive events (OR):** P(A or B) = P(A) + P(B)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Tree Diagrams", content: "For multi-stage experiments (like flipping a coin twice):\n\n1. Draw branches for each outcome of stage 1.\n2. From each branch, draw branches for each outcome of stage 2.\n3. Multiply probabilities along each path to get the probability of that combination.\n4. Add probabilities of all desired paths to get the final answer." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Drawing Cards", content: "A bag has 3 red and 7 blue balls. You pick one ball. What's P(red)?\n\n**Step 1:** Total balls = 3 + 7 = 10.\n**Step 2:** Favorable (red) = 3.\n**Step 3:** P(red) = 3/10 = 0.3.\n**Step 4:** P(NOT red) = 1 - 0.3 = 0.7.\n\n**Final Answer: P(red) = 3/10 or 0.3 (30%).**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest probability trap: confusing AND with OR. 'What's the probability of rolling a 3 AND then a 5?' = multiply. 'What's the probability of rolling a 3 OR a 5 in one roll?' = add. Also, students often forget to check if events are independent or dependent. If you draw a card and don't replace it, the second draw has different probabilities!" }
    ]
  },
  profitloss: {
    title: "Profit & Loss: The Business Math",
    blocks: [
      { icon: "\ud83d\udcb5", title: "1. The Core Concept: Buy Low, Sell High", content: "Every business operates on one simple principle: buy something at a low price (Cost Price) and sell it at a higher price (Selling Price). The difference is your **Profit**. If you sell for LESS than you paid, you make a **Loss**. Understanding profit and loss percentages is essential for business, shopping, and economics." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Formulas", content: "\u2022 **Profit** = Selling Price (SP) - Cost Price (CP).\n\u2022 **Loss** = CP - SP.\n\u2022 **Profit %** = (Profit / CP) x 100.\n\u2022 **Loss %** = (Loss / CP) x 100.\n\u2022 Critical: percentage is ALWAYS calculated on the **Cost Price**, not the selling price!\n\u2022 **Discount %** = (Discount / Marked Price) x 100." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the Cost Price", content: "If you know the selling price and profit percentage:\n\n1. SP = CP + Profit.\n2. SP = CP + (Profit% / 100) x CP.\n3. SP = CP x (1 + Profit%/100).\n4. So CP = SP / (1 + Profit%/100).\n\nFor loss: CP = SP / (1 - Loss%/100)." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Finding Profit %", content: "A shopkeeper buys a toy for Rs. 200 and sells it for Rs. 250.\n\n**Step 1:** Profit = SP - CP = 250 - 200 = Rs. 50.\n**Step 2:** Profit % = (50/200) x 100 = 25%.\n\n**Final Answer: The profit percentage is 25%.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The deadliest mistake: calculating profit/loss percentage on the SELLING PRICE instead of the COST PRICE. If CP = 200 and SP = 250, Profit% = (50/200) x 100 = 25%. But if you mistakenly use SP: (50/250) x 100 = 20%. That's the wrong answer! Profit and loss percentages are ALWAYS based on Cost Price." }
    ]
  },
  pythag: {
    title: "Pythagoras' Theorem: The Right-Angle Ruler",
    blocks: [
      { icon: "\ud83d\udcd0", title: "1. The Core Concept: The Most Famous Equation in Geometry", content: "Over 2,500 years ago, Pythagoras discovered something magical about right-angled triangles: if you square the two shorter sides and add them together, you get the square of the longest side (the hypotenuse). **a^2 + b^2 = c^2**, where c is always the hypotenuse. This single equation lets you find unknown distances in everything from construction to GPS navigation." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Identifying the Hypotenuse", content: "\u2022 The **hypotenuse** is ALWAYS the longest side.\n\u2022 It ALWAYS sits opposite the right angle (the 90-degree angle).\n\u2022 In the formula a^2 + b^2 = c^2, **c is always the hypotenuse**.\n\u2022 The two shorter sides (a and b) are called the 'legs'.\n\u2022 This theorem ONLY works for right-angled triangles!" },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding a Missing Side", content: "Finding the hypotenuse: c = sqrt(a^2 + b^2).\nFinding a leg: a = sqrt(c^2 - b^2).\n\n1. Identify which side is the hypotenuse (longest, opposite the right angle).\n2. If finding the hypotenuse: ADD the squares, then square root.\n3. If finding a shorter side: SUBTRACT the squares, then square root.\n4. Always square root at the end!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Finding the Hypotenuse", content: "A right triangle has legs of 6cm and 8cm. Find the hypotenuse.\n\n**Step 1:** c^2 = a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100.\n**Step 2:** c = sqrt(100) = 10.\n\n**Final Answer: The hypotenuse is 10cm.**\n(This is the famous 3-4-5 triple scaled by 2!)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Two deadly traps: (1) Students add the squares when they should subtract (or vice versa). If you're finding the HYPOTENUSE, you ADD. If you're finding a SHORTER side, you SUBTRACT. (2) Forgetting to square root at the end! If c^2 = 100, the answer is c = 10, NOT c = 100. Always finish with the square root step." }
    ]
  },
  qformula: {
    title: "The Quadratic Formula: The Ultimate Weapon",
    blocks: [
      { icon: "\ud83d\ude80", title: "1. The Core Concept: The Unbreakable Equation", content: "A quadratic equation is any equation where the highest power of 'x' is 2, like **ax^2 + bx + c = 0**. When graphed, it creates a beautiful U-shaped curve called a parabola. Sometimes, these equations are easy to solve by factoring. But what happens when the numbers are ugly decimals or fractions? That's where the **Quadratic Formula** comes in. It is the ultimate weapon that can solve ANY quadratic equation in the universe." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Memorizing the Magic", content: "To use the weapon, you must first memorize it:\n\n**x = [-b +/- sqrt(b^2 - 4ac)] / 2a**\n\n\u2022 **a** is the number attached to x^2\n\u2022 **b** is the number attached to x\n\u2022 **c** is the lonely number at the end\n\u2022 The **+/-** symbol means you will actually get TWO answers (one using +, one using -)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: The Discriminant Trick", content: "The chunk of math sitting inside the square root, **(b^2 - 4ac)**, is incredibly special. It's called the **Discriminant**, and it acts like a crystal ball predicting the future of your graph:\n\n1. Calculate (b^2 - 4ac) first before doing the whole formula.\n2. If it's a **positive number**, the curve crosses the x-axis twice. You will have 2 real answers.\n3. If it's **exactly zero**, the curve just kisses the x-axis once. You will have exactly 1 answer.\n4. If it's a **negative number**, stop! You can't take the square root of a negative. There are 0 real answers." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Solving the Puzzle", content: "Let's solve: **2x^2 - 5x - 3 = 0**\n\n\u2022 **Step 1:** Identify a = 2, b = -5, c = -3.\n\u2022 **Step 2:** Plug into the formula: x = [-(-5) +/- sqrt((-5)^2 - 4(2)(-3))] / 2(2)\n\u2022 **Step 3:** -(-5) becomes 5. Bottom = 4. Inside root: 25 + 24 = 49.\n\u2022 **Step 4:** x = [5 +/- sqrt(49)] / 4 = [5 +/- 7] / 4.\n\u2022 **Step 5 (Split):**\n   Path 1 (+): (5 + 7)/4 = 12/4 = **3**\n   Path 2 (-): (5 - 7)/4 = -2/4 = **-0.5**\n\n**Final Answers: x = 3, and x = -0.5**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Negative signs are the silent assassins of the Quadratic Formula. \nFirst, if 'b' is already negative (like -5), the formula asks for '-b', which flips it to a positive 5. Don't write -5! \nSecond, when calculating b^2, remember that squaring a negative number ALWAYS makes it positive. (-5)^2 is +25, never -25. Keep your signs organized and you'll never fail." }
    ]
  },
  ratio: {
    title: "Ratio & Proportion: Fair Sharing",
    blocks: [
      { icon: "\u2696\ufe0f", title: "1. The Core Concept: Comparing Quantities", content: "A **ratio** compares two or more quantities using the same units. If a recipe needs 2 cups of flour and 3 cups of sugar, the ratio is 2:3. **Proportion** means two ratios are equal. Ratios are everywhere: map scales (1:50000), screen resolutions (16:9), and even mixing paint colors." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Simplifying and Scaling", content: "\u2022 **Simplify** ratios like fractions: 10:15 = 2:3 (divide both by GCD of 5).\n\u2022 **Scaling:** To share Rs. 100 in ratio 2:3, find total parts (2+3=5), then each part = 100/5 = 20.\n\u2022 **Equivalent ratios:** 2:3 = 4:6 = 6:9 (multiply both sides by the same number).\n\u2022 **Units must match!** You can't have a ratio of 2km : 500m without converting first." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Sharing in a Given Ratio", content: "To divide an amount in a ratio (e.g., divide Rs. 350 in ratio 3:4):\n\n1. Add the ratio parts: 3 + 4 = 7 total parts.\n2. Find the value of one part: 350 / 7 = Rs. 50.\n3. First share: 3 x 50 = Rs. 150.\n4. Second share: 4 x 50 = Rs. 200.\n5. Check: 150 + 200 = 350. Correct!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Three-Way Split", content: "Divide Rs. 1200 among A, B, and C in the ratio 2:3:5.\n\n**Step 1:** Total parts = 2 + 3 + 5 = 10.\n**Step 2:** One part = 1200 / 10 = Rs. 120.\n**Step 3:** A = 2 x 120 = Rs. 240.\n**Step 4:** B = 3 x 120 = Rs. 360.\n**Step 5:** C = 5 x 120 = Rs. 600.\n\n**Check:** 240 + 360 + 600 = 1200. Correct!" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest ratio mistake: dividing by the ratio numbers instead of the TOTAL parts. To share Rs. 100 in ratio 2:3, students divide 100 by 2 to get 50 and by 3 to get 33.33. But 50 + 33.33 = 83.33, which isn't 100! The correct method: total parts = 5, each part = 20, shares are 40 and 60. Always find the total parts first!" }
    ]
  },
  sequences: {
    title: "Sequences & Series: Spotting the Pattern",
    blocks: [
      { icon: "\ud83d\udd22", title: "1. The Core Concept: Numbers with a Hidden Rule", content: "A **sequence** is a list of numbers that follows a hidden pattern: 2, 5, 8, 11, 14... Can you spot the rule? Each number is 3 more than the previous one! A **series** is what you get when you ADD all the terms together. Sequences are the math of prediction: if you know the pattern, you can find the 100th term without listing all 100 numbers." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Arithmetic vs Geometric", content: "\u2022 **Arithmetic Sequence:** Constant ADDITION between terms. Formula: a_n = a + (n-1)d, where a = first term, d = common difference.\n\u2022 **Geometric Sequence:** Constant MULTIPLICATION between terms. Formula: a_n = a * r^(n-1), where r = common ratio.\n\u2022 **Sum of Arithmetic Series:** S_n = n/2 * (2a + (n-1)d) or S_n = n/2 * (first + last)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the nth Term", content: "For the arithmetic sequence 3, 7, 11, 15...:\n\n1. Find the common difference: d = 7 - 3 = 4.\n2. Identify the first term: a = 3.\n3. Use the formula: a_n = a + (n-1)d.\n4. For the 50th term: a_50 = 3 + (49)(4) = 3 + 196 = 199." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Sum of First 20 Terms", content: "Find the sum of the first 20 terms of 5, 8, 11, 14...\n\n**Step 1:** a = 5, d = 3, n = 20.\n**Step 2:** Last term: a_20 = 5 + 19(3) = 5 + 57 = 62.\n**Step 3:** Sum = n/2 * (first + last) = 20/2 * (5 + 62) = 10 * 67 = 670.\n\n**Final Answer: S_20 = 670.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common sequence mistake: using 'n' instead of '(n-1)' in the formula. For the 50th term, you multiply d by 49 (which is n-1), not by 50. If d = 4, using 50 gives 200 instead of 196. You're always one step off! Remember: the first term has ZERO d's added to it, the second has ONE d, the third has TWO d's... so the nth has (n-1) d's." }
    ]
  },
  shares: {
    title: "Shares & Dividends: Owning a Piece",
    blocks: [
      { icon: "\ud83d\udcc8", title: "1. The Core Concept: Tiny Pieces of Big Companies", content: "When a company needs money to grow, it divides itself into thousands of tiny pieces called **shares**. Anyone can buy these pieces. If you own shares in a company, you own a small part of it! The company may pay you a portion of its profits each year, called a **dividend**. Understanding shares is essential for personal finance and investing." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Key Terms", content: "\u2022 **Nominal/Face Value:** The original stated value of the share (e.g., Rs. 100).\n\u2022 **Market Value:** The actual price you buy/sell it for (could be Rs. 120 or Rs. 80).\n\u2022 **At Premium:** Market Value > Face Value.\n\u2022 **At Discount:** Market Value < Face Value.\n\u2022 **Dividend** is ALWAYS calculated as a percentage of the FACE VALUE, not market value." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Calculating Returns", content: "1. **Number of shares** = Total Investment / Market Value per share.\n2. **Annual income (dividend)** = Number of shares x Dividend% x Face Value / 100.\n3. **Return on investment %** = (Annual income / Total Investment) x 100.\n\nThe return% tells you how good your investment actually is." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Buying Shares", content: "You invest Rs. 9000 in Rs. 100 shares at Rs. 150 each. Dividend is 8%.\n\n**Step 1:** Number of shares = 9000 / 150 = 60 shares.\n**Step 2:** Annual dividend per share = 8% of 100 = Rs. 8.\n**Step 3:** Total dividend = 60 x 8 = Rs. 480.\n**Step 4:** Return % = (480/9000) x 100 = 5.33%.\n\n**Final Answer: Annual income = Rs. 480, Return = 5.33%.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The absolute deadliest mistake: calculating dividend on the MARKET VALUE instead of the FACE VALUE! If a Rs. 100 share is bought at Rs. 150 with 8% dividend, the dividend is 8% of Rs. 100 (= Rs. 8), NOT 8% of Rs. 150. The company doesn't know or care what price you bought the share for; it pays based on the face value only." }
    ]
  },
  simul: {
    title: "Simultaneous Equations: Two Unknowns, Two Equations",
    blocks: [
      { icon: "\ud83d\udd00", title: "1. The Core Concept: Two Mysteries at Once", content: "One equation with one unknown gives you one answer. But what if you have TWO unknowns (x AND y)? You need TWO equations to find them both. **Simultaneous equations** are a pair of equations that are both true at the same time. Solving them gives you the ONE pair of values (x, y) that satisfies both equations perfectly." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Two Methods", content: "\u2022 **Elimination Method:** Make the coefficients of one variable the same in both equations, then add or subtract to eliminate it.\n\u2022 **Substitution Method:** Rearrange one equation to express x in terms of y (or vice versa), then substitute into the other.\n\u2022 Both methods give the same answer. Use whichever feels more natural for the given problem." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Elimination Method", content: "To solve: 2x + 3y = 13 and 4x - 3y = 11:\n\n1. Look at the y-coefficients: +3y and -3y. They're already matched!\n2. ADD the equations: (2x + 4x) + (3y - 3y) = 13 + 11.\n3. This gives 6x = 24, so x = 4.\n4. Substitute x = 4 into equation 1: 2(4) + 3y = 13, so 3y = 5, y = 5/3.\n5. Check in equation 2: 4(4) - 3(5/3) = 16 - 5 = 11. Correct!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Substitution Method", content: "Solve: y = 2x + 1 and 3x + y = 11.\n\n**Step 1:** Equation 1 already gives y in terms of x: y = 2x + 1.\n**Step 2:** Substitute into equation 2: 3x + (2x + 1) = 11.\n**Step 3:** 5x + 1 = 11, so 5x = 10, x = 2.\n**Step 4:** y = 2(2) + 1 = 5.\n\n**Final Answer: x = 2, y = 5.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The classic elimination mistake: adding when you should subtract (or vice versa). If both equations have +3y, you need to SUBTRACT to eliminate y (3y - 3y = 0). If one has +3y and the other has -3y, you ADD (3y + (-3y) = 0). Also, students often solve for x but forget to find y! Both unknowns must be found for full marks." }
    ]
  }
};

for (const [key, data] of Object.entries(files)) {
  const filePath = path.join(dir, key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed: ' + key);
}
console.log('Batch F done! Fixed', Object.keys(files).length, 'files.');

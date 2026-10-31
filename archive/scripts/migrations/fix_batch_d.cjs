const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'learnContent');

const files = {
  hcflcm: {
    title: "HCF & LCM: The Number Matchmakers",
    blocks: [
      { icon: "\ud83d\udd17", title: "1. The Core Concept: Finding Common Ground", content: "**HCF (Highest Common Factor)** finds the BIGGEST number that divides evenly into two or more numbers. **LCM (Lowest Common Multiple)** finds the SMALLEST number that both numbers divide into evenly. HCF is like finding the biggest tile that perfectly covers two different floors. LCM is like finding when two buses with different schedules will both arrive at the station at the same time." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Prime Factor Method", content: "The most reliable method uses Prime Factorization:\n\n\u2022 Break each number into its prime factors.\n\u2022 **For HCF:** Take the COMMON primes, each to the LOWEST power they appear.\n\u2022 **For LCM:** Take ALL primes, each to the HIGHEST power they appear.\n\u2022 Shortcut: HCF x LCM = Product of the two original numbers." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding HCF and LCM of 12 and 18", content: "1. Prime factorize: 12 = 2^2 x 3, and 18 = 2 x 3^2.\n2. **HCF:** Common primes are 2 and 3. Lowest powers: 2^1 and 3^1. HCF = 2 x 3 = **6**.\n3. **LCM:** All primes are 2 and 3. Highest powers: 2^2 and 3^2. LCM = 4 x 9 = **36**.\n4. Check: HCF x LCM = 6 x 36 = 216 = 12 x 18. Correct!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Word Problem", content: "Two traffic lights flash every 12 seconds and 18 seconds respectively. They just flashed together. When will they next flash together?\n\n**Step 1:** This is an LCM problem (we want the first time both events happen together).\n**Step 2:** LCM of 12 and 18 = 36.\n\n**Final Answer: They'll flash together again in 36 seconds.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common mistake: mixing up HCF and LCM in word problems! If a question says 'the BIGGEST tile that fits perfectly' = HCF. If it says 'when will they BOTH happen together' = LCM. Also, students often forget to use the LOWEST power for HCF and HIGHEST for LCM, getting them exactly backwards!" }
    ]
  },
  heron: {
    title: "Heron's Formula: Area Without Height",
    blocks: [
      { icon: "\ud83d\udcd0", title: "1. The Core Concept: When You Don't Know the Height", content: "The standard triangle area formula (1/2 x base x height) is great, but what if you don't know the height? **Heron's Formula** is an incredible tool that calculates the area of ANY triangle using only the three side lengths. No height, no angles, no problem. Just three sides and you're done." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Semi-Perimeter", content: "Heron's Formula uses a helper value called the **Semi-Perimeter (s)**:\n\n\u2022 First, find s = (a + b + c) / 2 where a, b, c are the three sides.\n\u2022 Then: **Area = sqrt[s(s-a)(s-b)(s-c)]**\n\u2022 That's it! Just plug in the three sides, compute s, and evaluate." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Using Heron's Formula", content: "1. Write down the three side lengths: a, b, c.\n2. Calculate s = (a + b + c) / 2.\n3. Calculate each bracket: (s-a), (s-b), (s-c).\n4. Multiply them all: s x (s-a) x (s-b) x (s-c).\n5. Take the square root of the result.\n6. That's your area!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Triangle with sides 7, 8, 9", content: "Find the area of a triangle with sides 7cm, 8cm, 9cm.\n\n**Step 1:** s = (7 + 8 + 9) / 2 = 24 / 2 = 12.\n**Step 2:** (s-a) = 12-7 = 5, (s-b) = 12-8 = 4, (s-c) = 12-9 = 3.\n**Step 3:** Product = 12 x 5 x 4 x 3 = 720.\n**Step 4:** Area = sqrt(720) = 26.83 cm^2.\n\n**Final Answer: Area = 26.83 cm^2 (2 d.p.)**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common mistake is forgetting to divide the perimeter by 2! Students add a+b+c and use the full perimeter instead of the SEMI-perimeter. If s is wrong, every subsequent calculation is wrong. Also, don't forget the final square root! The product s(s-a)(s-b)(s-c) gives you the area SQUARED, not the area itself." }
    ]
  },
  indices: {
    title: "Indices: The Power of Powers",
    blocks: [
      { icon: "\u26a1", title: "1. The Core Concept: Repeated Multiplication", content: "Writing 2 x 2 x 2 x 2 x 2 is tedious. **Indices** (also called exponents or powers) give us a shortcut: **2^5** means '2 multiplied by itself 5 times'. The small raised number is the **index** (power), and the big number is the **base**. Indices are essential for science (atoms are 10^-10 meters), computing (gigabytes = 2^30), and algebra." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Six Laws of Indices", content: "\u2022 **Multiply:** a^m x a^n = a^(m+n) (add the powers).\n\u2022 **Divide:** a^m / a^n = a^(m-n) (subtract the powers).\n\u2022 **Power of a power:** (a^m)^n = a^(mn) (multiply the powers).\n\u2022 **Zero power:** a^0 = 1 (anything to the power 0 is 1!).\n\u2022 **Negative power:** a^(-n) = 1/a^n (flip it under 1).\n\u2022 **Fractional power:** a^(1/n) = nth root of a." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Simplifying Index Expressions", content: "To simplify 2^3 x 2^4 / 2^2:\n\n1. Same base (2) throughout, so we can use the laws.\n2. Multiply: 2^3 x 2^4 = 2^(3+4) = 2^7.\n3. Divide: 2^7 / 2^2 = 2^(7-2) = 2^5.\n4. Calculate: 2^5 = 32.\n\nAlways check: are the bases the same? If yes, use the laws. If not, you can't combine them." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Negative and Fractional Indices", content: "Simplify: **8^(-2/3)**\n\n**Step 1:** The negative sign means 'flip': 1 / 8^(2/3).\n**Step 2:** The fraction 2/3 means 'cube root first, then square'. The cube root of 8 is 2.\n**Step 3:** Square the result: 2^2 = 4.\n**Step 4:** Put it back: 1/4.\n\n**Final Answer: 8^(-2/3) = 1/4.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Two deadly traps: (1) Students think a^0 = 0. WRONG! Anything to the power 0 equals 1 (except 0^0 which is undefined). (2) With fractional powers like x^(2/3), students don't know whether to square first or cube-root first. The denominator is the ROOT, and the numerator is the POWER. You can do them in either order, but cube-rooting first usually gives smaller numbers that are easier to work with." }
    ]
  },
  indicesgym: {
    title: "Indices Gym: Index Laws Workout",
    blocks: [
      { icon: "\ud83d\udcaa", title: "1. The Core Concept: Mastering the Laws", content: "The Indices Gym drills you on applying the six laws of indices quickly and accurately. You'll face expressions that require you to add, subtract, and multiply powers under time pressure. The goal is to make the laws so automatic that you apply them without thinking." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Quick Reference", content: "\u2022 Same base, multiplying: ADD powers.\n\u2022 Same base, dividing: SUBTRACT powers.\n\u2022 Power of a power: MULTIPLY powers.\n\u2022 Anything^0 = 1.\n\u2022 Negative power = reciprocal.\n\u2022 Fractional power = root." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Pattern Recognition", content: "Speed tips for the gym:\n\n1. Always identify the base first. Can you combine the terms?\n2. If bases are different but related (like 4 and 2), rewrite: 4 = 2^2.\n3. For negative indices, immediately think 'flip'.\n4. For fractional indices, immediately think 'root'.\n5. Check: does your answer have the simplest form?" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Simplify 3^5 x 3^(-2) / 3^2", content: "**Step 1:** 3^5 x 3^(-2) = 3^(5 + (-2)) = 3^3.\n**Step 2:** 3^3 / 3^2 = 3^(3-2) = 3^1 = 3.\n\n**Final Answer: 3.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "In the gym, speed causes careless sign errors. When subtracting powers like 3^5 / 3^(-2), students write 3^(5-(-2)) = 3^3. WRONG! Subtracting a negative means adding: 5 - (-2) = 5 + 2 = 7. So the answer is 3^7, not 3^3. Always be extra careful with double negatives in index operations." }
    ]
  },
  ineq: {
    title: "Inequalities: The Flexible Equation",
    blocks: [
      { icon: "\u2696\ufe0f", title: "1. The Core Concept: Not Always Equal", content: "Equations (=) demand perfection: x MUST be exactly 5. But **Inequalities** are flexible. They say things like 'x must be MORE than 3' (x > 3) or 'x can be anything up to 10' (x <= 10). In real life, inequalities are everywhere: speed limits (v <= 60), minimum ages (age >= 18), and budget constraints (cost < 500)." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Four Symbols", content: "Master these four:\n\n\u2022 **>** means 'greater than' (strict, not equal).\n\u2022 **<** means 'less than' (strict, not equal).\n\u2022 **>=** means 'greater than or equal to'.\n\u2022 **<=** means 'less than or equal to'.\n\nThe critical rule: if you MULTIPLY or DIVIDE both sides by a NEGATIVE number, you must FLIP the inequality sign! (e.g., > becomes <)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Solving Inequalities", content: "Solve inequalities exactly like equations, with one extra rule:\n\n1. Use inverse operations to isolate x (same as equations).\n2. If you multiply or divide by a POSITIVE number, the sign stays the same.\n3. If you multiply or divide by a NEGATIVE number, FLIP the sign!\n4. Express the solution as a range (e.g., x > 3) or on a number line." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Solve -2x + 4 > 10", content: "**Step 1:** Subtract 4 from both sides: -2x > 6.\n**Step 2:** Divide both sides by -2. Since we're dividing by a NEGATIVE, FLIP the sign!\n**Step 3:** x < -3.\n\n**Final Answer: x < -3.** (All numbers less than -3 satisfy this inequality.)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The absolute number one mistake: forgetting to FLIP the inequality sign when dividing by a negative! If -2x > 6, dividing by -2 gives x < -3, NOT x > -3. This single rule is responsible for more lost marks than any other concept in inequalities. Write 'FLIP!' in big letters next to any step where you divide by a negative number." }
    ]
  },
  integ: {
    title: "Integration: The Reverse Calculus",
    blocks: [
      { icon: "\ud83d\udd04", title: "1. The Core Concept: Undoing Differentiation", content: "If differentiation finds the gradient (slope) of a curve, **Integration** does the exact opposite: it takes the gradient formula and works backwards to find the original curve. It's also the tool for finding the area under a curve. Think of differentiation as taking a photo apart pixel by pixel; integration is putting those pixels back together to rebuild the picture." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Power Rule (Reversed)", content: "The reverse of the differentiation power rule:\n\n\u2022 If dy/dx = x^n, then y = x^(n+1) / (n+1) + C.\n\u2022 **Raise the power by 1**, then **divide by the new power**.\n\u2022 ALWAYS add the constant of integration **+ C** at the end!\n\u2022 The integral of a constant k is kx + C." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Integrating a Polynomial", content: "To integrate f(x) = 6x^2 + 4x - 3:\n\n1. Take each term separately.\n2. For 6x^2: raise power (2+1=3), divide by new power: 6x^3/3 = 2x^3.\n3. For 4x: raise power (1+1=2), divide: 4x^2/2 = 2x^2.\n4. For -3: integrate as -3x.\n5. Combine and add C: **2x^3 + 2x^2 - 3x + C**." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Definite Integration", content: "Find the area under y = x^2 from x = 1 to x = 3.\n\n**Step 1:** Integrate: x^3/3.\n**Step 2:** Evaluate at limits: [3^3/3] - [1^3/3] = 27/3 - 1/3 = 9 - 1/3 = 26/3.\n\n**Final Answer: Area = 26/3 = 8.67 square units (2 d.p.).**\n(Note: No + C needed for definite integrals!)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Two massive traps: (1) Forgetting the + C in indefinite integrals. This is worth a mark in every exam and students throw it away constantly. (2) Getting the power rule backwards. In integration, you ADD 1 to the power and DIVIDE. In differentiation, you SUBTRACT 1 and MULTIPLY. Mixing them up gives you the derivative, not the integral!" }
    ]
  },
  invtrig: {
    title: "Inverse Trigonometry: Working Backwards",
    blocks: [
      { icon: "\ud83d\udd04", title: "1. The Core Concept: Finding the Angle from the Ratio", content: "Normal trigonometry says: 'Here's an angle, what's the ratio?' sin(30) = 0.5. **Inverse trigonometry** asks the opposite: 'Here's a ratio, what's the angle?' arcsin(0.5) = 30 degrees. It's like having a dictionary that works both ways: English to French, AND French to English." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Three Inverse Functions", content: "\u2022 **arcsin (or sin^(-1)):** Input a ratio between -1 and 1, get an angle.\n\u2022 **arccos (or cos^(-1)):** Same input range, different output range.\n\u2022 **arctan (or tan^(-1)):** Input any real number, get an angle.\n\nCritical: sin^(-1) does NOT mean 1/sin! The -1 means 'inverse function', not 'reciprocal'." },
      { icon: "\ud83d\udcf1", title: "3. Step-by-Step: Using Your Calculator", content: "To find an angle using inverse trig:\n\n1. Identify which trig ratio you have (opposite/hypotenuse = sin, etc.).\n2. Press SHIFT (or 2nd) then the trig button on your calculator.\n3. Enter the ratio value.\n4. Make sure your calculator is in the correct mode (degrees or radians).\n5. The output is your angle." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Finding an Angle", content: "In a right triangle, the opposite side is 5 and the hypotenuse is 10. Find the angle.\n\n**Step 1:** sin(angle) = opposite/hypotenuse = 5/10 = 0.5.\n**Step 2:** angle = arcsin(0.5).\n**Step 3:** angle = 30 degrees.\n\n**Final Answer: The angle is 30 degrees.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common mistake: confusing sin^(-1)(x) with 1/sin(x). They are COMPLETELY different! sin^(-1)(0.5) = 30 degrees (inverse function), but 1/sin(0.5) = 1/0.479 = 2.09 (reciprocal). On a calculator, the inverse trig functions are usually accessed by pressing SHIFT + sin/cos/tan. Make sure you're pressing the right button!" }
    ]
  },
  limits: {
    title: "Limits: Approaching the Edge",
    blocks: [
      { icon: "\ud83c\udfaf", title: "1. The Core Concept: Getting Infinitely Close", content: "What happens to 1/x as x gets bigger and bigger? It gets closer to 0 but never actually reaches it. This 'approaching' behavior is called a **Limit**. Limits are the foundation of all calculus. They answer the question: 'What value does this function get closer to as x approaches a certain number?' without actually reaching that number." },
      { icon: "\ud83d\udcda", title: "2. The Rules: How to Evaluate Limits", content: "\u2022 **Direct substitution:** Just plug in the value. If you get a real number, that's the limit!\n\u2022 **0/0 form (Indeterminate):** You can't use direct substitution. Try factoring, simplifying, or L'Hopital's Rule.\n\u2022 **Infinity:** If x goes to infinity, divide top and bottom by the highest power of x.\n\u2022 The limit might not exist if the function approaches different values from the left and right." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Solving 0/0 Limits", content: "If plugging in gives 0/0:\n\n1. Try to factor the numerator and denominator.\n2. Cancel any common factors.\n3. Try substitution again with the simplified expression.\n4. If factoring doesn't work, try multiplying by the conjugate (for expressions with square roots).\n5. L'Hopital's Rule: differentiate the top and bottom separately, then try again." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Factoring a 0/0 Limit", content: "Find the limit of (x^2 - 4)/(x - 2) as x approaches 2.\n\n**Step 1:** Direct substitution: (4 - 4)/(2 - 2) = 0/0. Indeterminate!\n**Step 2:** Factor top: (x+2)(x-2) / (x-2).\n**Step 3:** Cancel (x-2): left with (x+2).\n**Step 4:** Now substitute x = 2: 2 + 2 = 4.\n\n**Final Answer: The limit is 4.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest mistake: seeing 0/0 and writing 'the limit is 0' or 'the limit is undefined'. 0/0 is INDETERMINATE, not zero and not undefined! It means you need to do more work (factoring, L'Hopital's) to find the true answer. Many 0/0 limits turn out to be perfectly normal numbers like 4 or -3. Never give up when you see 0/0!" }
    ]
  },
  lineareq: {
    title: "Linear Equations: The Straight Line Solver",
    blocks: [
      { icon: "\ud83d\udccf", title: "1. The Core Concept: One Unknown, One Answer", content: "A **linear equation** has just one variable (like x) raised to the first power. No x^2, no x^3, no square roots of x. Just simple, clean, first-power equations like **3x + 7 = 22**. Because the variable is to the first power, the equation always has exactly ONE solution. Your job is to isolate x by undoing all the operations around it." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Unwinding Process", content: "Think of a linear equation as a wrapped present. To get to x, you 'unwrap' the operations in reverse order:\n\n\u2022 If x was added to, you subtract.\n\u2022 If x was multiplied by, you divide.\n\u2022 If x was subtracted from, you add.\n\u2022 If x was divided by, you multiply.\n\nAlways do the SAME operation to BOTH sides of the equation." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Solving Multi-Step Equations", content: "To solve 5(x - 3) + 2 = 22:\n\n1. Expand brackets first: 5x - 15 + 2 = 22.\n2. Simplify: 5x - 13 = 22.\n3. Add 13 to both sides: 5x = 35.\n4. Divide both sides by 5: x = 7.\n5. Check: 5(7-3) + 2 = 5(4) + 2 = 22. Correct!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Variables on Both Sides", content: "Solve: **7x - 4 = 3x + 12**.\n\n**Step 1:** Get all x terms on one side. Subtract 3x from both sides: 4x - 4 = 12.\n**Step 2:** Add 4 to both sides: 4x = 16.\n**Step 3:** Divide by 4: x = 4.\n**Step 4 (Check):** Left: 7(4) - 4 = 24. Right: 3(4) + 12 = 24. Both equal!\n\n**Final Answer: x = 4.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "When there are variables on BOTH sides, students often subtract from the wrong side and end up with a negative coefficient. This isn't wrong, but it leads to messy arithmetic. Pro tip: always move the SMALLER x-term to the other side. In 7x = 3x + 16, move the 3x (smaller) to the left side. This keeps the coefficient positive and reduces sign errors." }
    ]
  },
  lineq: {
    title: "Line Equations: Drawing with Algebra",
    blocks: [
      { icon: "\ud83d\udcc9", title: "1. The Core Concept: Every Line Has an Equation", content: "Every straight line on a graph can be described by an equation of the form **y = mx + c**, where **m** is the gradient (steepness) and **c** is the y-intercept (where the line crosses the y-axis). If you know two points on a line, you can find its exact equation. If you know the equation, you can draw the exact line. Algebra and geometry become one." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Gradient and Y-Intercept", content: "\u2022 **Gradient (m):** m = (y2 - y1) / (x2 - x1). It measures the steepness and direction.\n\u2022 Positive m = line goes uphill (left to right). Negative m = downhill.\n\u2022 **Y-intercept (c):** The value of y when x = 0. It's where the line hits the y-axis.\n\u2022 **Parallel lines** have the same gradient. **Perpendicular lines** have gradients that multiply to -1." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the Equation from Two Points", content: "Given two points (x1, y1) and (x2, y2):\n\n1. Calculate m = (y2 - y1) / (x2 - x1).\n2. Substitute m and one point into y = mx + c.\n3. Solve for c.\n4. Write the final equation y = mx + c." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Points (1, 5) and (3, 9)", content: "**Step 1:** m = (9 - 5) / (3 - 1) = 4 / 2 = 2.\n**Step 2:** Use point (1, 5): 5 = 2(1) + c.\n**Step 3:** 5 = 2 + c, so c = 3.\n**Step 4:** y = 2x + 3.\n\n**Final Answer: y = 2x + 3.** (Gradient 2, y-intercept 3.)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The classic gradient error: putting the x-difference on top instead of the y-difference. The gradient formula is RISE (y-change) over RUN (x-change), not the other way around. Also, be careful with negative gradients: (3-7)/(2-1) = -4/1 = -4. Don't lose the negative sign, or your line will slope in the wrong direction!" }
    ]
  }
};

for (const [key, data] of Object.entries(files)) {
  const filePath = path.join(dir, key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed: ' + key);
}
console.log('Batch D done! Fixed', Object.keys(files).length, 'files.');

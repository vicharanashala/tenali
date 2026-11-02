const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'learnContent');

const files = {
  lineqgym: {
    title: "Linear Equations Gym: Solve for x",
    blocks: [
      { icon: "\ud83c\udfaf", title: "1. The Core Concept: Speed Solving", content: "This gym throws rapid-fire linear equations at you. Each one has a single unknown 'x', and your job is to isolate it as fast as possible. The faster you can solve basic equations, the more time you'll have for harder problems in exams." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Inverse Operations", content: "\u2022 Addition is undone by subtraction.\n\u2022 Subtraction is undone by addition.\n\u2022 Multiplication is undone by division.\n\u2022 Division is undone by multiplication.\n\u2022 Always perform the same operation on BOTH sides." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Two-Step Strategy", content: "Most gym equations are two-step:\n\n1. Undo the addition/subtraction first (move the constant to the other side).\n2. Undo the multiplication/division second (isolate x).\n3. Example: 3x + 5 = 20 becomes 3x = 15 becomes x = 5.\n4. Always check by substituting back!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Solve 4x - 7 = 13", content: "**Step 1:** Add 7 to both sides: 4x = 20.\n**Step 2:** Divide by 4: x = 5.\n**Check:** 4(5) - 7 = 20 - 7 = 13. Correct!\n\n**Final Answer: x = 5.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "In speed-solving mode, the most common mistake is doing the operations in the wrong order. If you have 3x + 5 = 20, don't divide by 3 first! That gives you x + 5/3 = 20/3, which is a mess. Always undo addition/subtraction FIRST, then multiplication/division. Work from the outside in." }
    ]
  },
  linprog: {
    title: "Linear Programming: Optimizing Life",
    blocks: [
      { icon: "\ud83d\udcc8", title: "1. The Core Concept: Making the Best Decision", content: "You own a factory that makes chairs and tables. Each uses different amounts of wood and labor. You want to maximize profit. But you have limited wood and workers! **Linear Programming** is the mathematical tool that finds the BEST possible answer (maximum profit or minimum cost) when you have constraints (limitations). It's used by airlines, armies, and Amazon every single day." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Components", content: "\u2022 **Decision Variables:** The things you can control (e.g., x = number of chairs, y = number of tables).\n\u2022 **Objective Function:** What you want to maximize or minimize (e.g., Profit = 40x + 60y).\n\u2022 **Constraints:** The limitations written as inequalities (e.g., 2x + 3y <= 120).\n\u2022 **Non-negativity:** x >= 0, y >= 0 (you can't make negative chairs!)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: The Graphical Method", content: "1. Graph each constraint as a line (turn <= into =).\n2. Shade the region that satisfies ALL constraints. This is the **Feasible Region**.\n3. Identify the **corner points** (vertices) of the feasible region.\n4. Substitute each corner point into the objective function.\n5. The corner point that gives the maximum (or minimum) value is your optimal solution!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Maximizing Profit", content: "Maximize P = 5x + 4y subject to: x + y <= 10, 2x + y <= 14, x >= 0, y >= 0.\n\n**Step 1:** Graph the lines x + y = 10 and 2x + y = 14.\n**Step 2:** Corner points of feasible region: (0,0), (7,0), (4,6), (0,10).\n**Step 3:** Evaluate P at each:\n  P(0,0) = 0, P(7,0) = 35, P(4,6) = 44, P(0,10) = 40.\n**Step 4:** Maximum is at (4, 6).\n\n**Final Answer: Make 4 of x and 6 of y for maximum profit of 44.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest mistake: testing random points inside the feasible region instead of just the corner points! The **optimal solution always occurs at a corner point** (vertex) of the feasible region. You never need to test interior points. Also, students often forget to check ALL corners, including (0,0). Don't skip any vertex!" }
    ]
  },
  log: {
    title: "Logarithms: The Power Inverter",
    blocks: [
      { icon: "\ud83d\udd0d", title: "1. The Core Concept: Asking the Reverse Question", content: "Exponents ask: '2 raised to what power gives 8?' The answer is 3 because 2^3 = 8. A **Logarithm** is just a fancy way of writing this question: **log base 2 of 8 = 3**. Logarithms reverse exponents. They're essential in science (earthquake scales, sound decibels, pH levels) because they compress enormous number ranges into manageable scales." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Three Log Laws", content: "\u2022 **Product Rule:** log(AB) = log(A) + log(B). Multiplication becomes addition!\n\u2022 **Quotient Rule:** log(A/B) = log(A) - log(B). Division becomes subtraction!\n\u2022 **Power Rule:** log(A^n) = n * log(A). Powers become multipliers!\n\u2022 Also: log(1) = 0 (always), and log base a of a = 1 (always)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Solving Log Equations", content: "To solve log equations:\n\n1. Use the log laws to combine or simplify.\n2. If log base a of x = b, then x = a^b (convert to exponential form).\n3. If you have logs on both sides, the arguments must be equal: log(A) = log(B) means A = B.\n4. Always check that your answer doesn't make you take the log of a negative number or zero!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Simplify log2(32)", content: "What is log base 2 of 32?\n\n**Step 1:** Ask: '2 to what power gives 32?'\n**Step 2:** 2^1 = 2, 2^2 = 4, 2^3 = 8, 2^4 = 16, 2^5 = 32.\n**Step 3:** The answer is 5.\n\n**Final Answer: log base 2 of 32 = 5.**\n(Because 2^5 = 32.)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most devastating log mistake: thinking log(A + B) = log(A) + log(B). WRONG! The product rule says log(A * B) = log(A) + log(B). There is NO rule for log(A + B). You cannot split a log of a SUM. This mistake is so common that teachers call it 'The Log Trap'. Never break apart log(x + 5) into log(x) + log(5)!" }
    ]
  },
  matrix: {
    title: "Matrices: The Number Grid",
    blocks: [
      { icon: "\ud83d\udcca", title: "1. The Core Concept: Arrays of Numbers with Superpowers", content: "A **Matrix** is a rectangular grid of numbers arranged in rows and columns. They might look simple, but matrices can solve systems of equations, transform 3D graphics in video games, encrypt data, and even power Google's search algorithm. A 2x2 matrix has 2 rows and 2 columns. A 3x1 matrix has 3 rows and 1 column." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Matrix Operations", content: "\u2022 **Addition:** Add corresponding elements (matrices must be same size).\n\u2022 **Scalar multiplication:** Multiply every element by the scalar.\n\u2022 **Matrix multiplication:** Row-by-column dot products. The number of columns in the first MUST equal the number of rows in the second.\n\u2022 **Determinant (2x2):** For [[a,b],[c,d]], det = ad - bc.\n\u2022 Matrix multiplication is NOT commutative: A*B does not equal B*A!" },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Multiplying 2x2 Matrices", content: "To multiply matrix A by matrix B:\n\n1. Take the first ROW of A and the first COLUMN of B.\n2. Multiply corresponding elements and add: this gives you position (1,1) of the answer.\n3. First row of A x second column of B = position (1,2).\n4. Second row of A x first column of B = position (2,1).\n5. Second row of A x second column of B = position (2,2)." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: 2x2 Multiplication", content: "Multiply [[1,2],[3,4]] x [[5,6],[7,8]].\n\n**Position (1,1):** 1*5 + 2*7 = 5 + 14 = **19**\n**Position (1,2):** 1*6 + 2*8 = 6 + 16 = **22**\n**Position (2,1):** 3*5 + 4*7 = 15 + 28 = **43**\n**Position (2,2):** 3*6 + 4*8 = 18 + 32 = **50**\n\n**Final Answer: [[19,22],[43,50]]**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The absolute deadliest matrix mistake: trying to multiply matrices of incompatible sizes. You can only multiply an (m x n) matrix by an (n x p) matrix. The 'inner dimensions' (n) must match! If you try to multiply a 2x3 by a 2x3, it's impossible. Also, remember: matrix multiplication is NOT commutative. A*B usually gives a completely different result from B*A." }
    ]
  },
  mensur: {
    title: "Mensuration: Measuring Shapes",
    blocks: [
      { icon: "\ud83d\udcd0", title: "1. The Core Concept: Area, Volume, and Surface Area", content: "**Mensuration** is the branch of math concerned with measuring geometric shapes. How much paint do you need to cover a wall (area)? How much water can a tank hold (volume)? How much wrapping paper to cover a gift box (surface area)? Mensuration gives you the formulas to answer all these practical questions." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Essential Formulas", content: "\u2022 **Circle:** Area = pi * r^2, Circumference = 2 * pi * r.\n\u2022 **Cylinder:** Volume = pi * r^2 * h, Surface Area = 2*pi*r*(r+h).\n\u2022 **Sphere:** Volume = (4/3)*pi*r^3, Surface Area = 4*pi*r^2.\n\u2022 **Cone:** Volume = (1/3)*pi*r^2*h, Slant Surface = pi*r*l.\n\u2022 **Prism:** Volume = Base Area x Height." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Composite Shapes", content: "Many exam questions combine shapes. For composite shapes:\n\n1. Break the shape into simpler components (rectangles, triangles, semicircles).\n2. Calculate the area/volume of each component separately.\n3. Add them together (if the shape is a combination) or subtract (if there's a cutout).\n4. Always double-check your units: cm^2 for area, cm^3 for volume." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Volume of a Cylinder", content: "Find the volume of a cylinder with radius 5cm and height 12cm.\n\n**Step 1:** Formula: V = pi * r^2 * h.\n**Step 2:** V = pi * 25 * 12.\n**Step 3:** V = 300 * pi.\n**Step 4:** V = 942.48 cm^3 (2 d.p.).\n\n**Final Answer: Volume = 300*pi = 942.48 cm^3.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most brutal mensuration mistake: confusing radius with diameter! If a question says 'the diameter is 10cm', the radius is 5cm. Using 10 in place of r in pi*r^2 gives you 100*pi instead of 25*pi. Your answer will be 4 times too large! Always check: are they giving you the radius (r) or the diameter (d = 2r)?" }
    ]
  },
  multiply: {
    title: "Multiplication: The Times Table Master",
    blocks: [
      { icon: "\u2716\ufe0f", title: "1. The Core Concept: Rapid Repeated Addition", content: "Multiplication is just a shortcut for adding the same number over and over. 4 x 6 means '4 added together 6 times' (4+4+4+4+4+4 = 24). But doing repeated addition for 13 x 17 would be insane. **Times tables** are the shortcut to the shortcut: pre-memorized answers that let you multiply instantly. They are the foundation of speed in all future math." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Key Patterns", content: "Times tables have hidden patterns:\n\n\u2022 **x2:** Just double the number.\n\u2022 **x5:** Always ends in 0 or 5.\n\u2022 **x9:** The digits always add up to 9 (18, 27, 36, 45...).\n\u2022 **x10:** Just add a zero.\n\u2022 **x11:** For single digits, repeat the digit (11, 22, 33...).\n\u2022 **Commutative:** 7 x 8 = 8 x 7. Learn it once, know it both ways." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: The Grid Method", content: "For multiplying larger numbers (e.g., 23 x 15):\n\n1. Break each number into tens and ones: 23 = 20 + 3, 15 = 10 + 5.\n2. Draw a grid and multiply each pair: 20x10=200, 20x5=100, 3x10=30, 3x5=15.\n3. Add all four results: 200 + 100 + 30 + 15 = 345.\n4. This method eliminates carry errors!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Grid Method for 34 x 12", content: "**Step 1:** Break apart: 34 = 30 + 4, 12 = 10 + 2.\n**Step 2:** Grid:\n  30 x 10 = 300\n  30 x 2 = 60\n  4 x 10 = 40\n  4 x 2 = 8\n**Step 3:** Add: 300 + 60 + 40 + 8 = 408.\n\n**Final Answer: 34 x 12 = 408.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common multiplication error: mishandling zeros in long multiplication. When multiplying by the tens digit (like the '1' in 12), students forget to add the placeholder zero. In 34 x 12, the second row should be 340 (not 34). Missing that zero makes your answer exactly 10 times too small!" }
    ]
  },
  percent: {
    title: "Percentages: The Universal Comparison Tool",
    blocks: [
      { icon: "\ud83d\udcca", title: "1. The Core Concept: Parts Per Hundred", content: "**Percent** literally means 'per hundred'. So 45% means '45 out of every 100'. Percentages are the universal language for comparing things fairly. If one school has 50 A-students out of 200, and another has 80 out of 400, which is better? Both are 25%! Percentages let you compare things that have different totals." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Three Types of Percentage Problems", content: "\u2022 **Finding a percentage of a number:** 20% of 150 = 0.20 x 150 = 30.\n\u2022 **Finding what percentage one number is of another:** (30/150) x 100 = 20%.\n\u2022 **Finding the original after a percentage change:** If something increased by 20% to 60, the original = 60 / 1.20 = 50.\n\nThe decimal multiplier is key: 25% = 0.25, 130% = 1.30, 85% = 0.85." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Percentage Increase and Decrease", content: "To increase by a percentage:\n\n1. Convert the percentage to a decimal multiplier: increase by 15% = multiply by 1.15.\n2. Multiply the original by this multiplier.\n\nTo decrease by a percentage:\n1. Subtract from 1: decrease by 15% = multiply by 0.85.\n2. Multiply the original by this multiplier.\n\nThis is MUCH faster than calculating the percentage separately and adding/subtracting!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Reverse Percentage", content: "A shirt costs Rs. 680 after a 15% discount. What was the original price?\n\n**Step 1:** 15% discount means the sale price is 85% of the original.\n**Step 2:** 85% as a multiplier = 0.85.\n**Step 3:** Original x 0.85 = 680.\n**Step 4:** Original = 680 / 0.85 = Rs. 800.\n\n**Final Answer: The original price was Rs. 800.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The deadliest percentage trap: assuming you can reverse a percentage change by applying the same percentage. If a price INCREASES by 20% (from 100 to 120), then DECREASING by 20% gives 120 x 0.80 = 96, NOT 100! This is because 20% of 120 is bigger than 20% of 100. You must use the multiplier method to reverse percentage changes correctly." }
    ]
  },
  permcomb: {
    title: "Permutations & Combinations: Counting Without Listing",
    blocks: [
      { icon: "\ud83c\udfb0", title: "1. The Core Concept: How Many Ways?", content: "If you have 5 books and want to arrange 3 on a shelf, how many different arrangements are possible? You could list them all, but that takes forever. **Permutations** count arrangements where ORDER MATTERS (like race positions: 1st, 2nd, 3rd). **Combinations** count selections where order DOESN'T matter (like choosing 3 teammates from 5 people)." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Formulas", content: "\u2022 **Permutation (order matters):** nPr = n! / (n-r)!\n\u2022 **Combination (order doesn't matter):** nCr = n! / [r! x (n-r)!]\n\u2022 **Factorial:** n! = n x (n-1) x (n-2) x ... x 1. (e.g., 5! = 120)\n\u2022 Key relationship: nPr = nCr x r! (permutation = combination x arrangements within each group)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Deciding Which to Use", content: "Ask yourself ONE question:\n\n1. Does the ORDER of selection matter?\n2. If rearranging the selected items creates a DIFFERENT outcome: use **Permutation**.\n   (e.g., passwords, race positions, seating arrangements)\n3. If rearranging creates the SAME outcome: use **Combination**.\n   (e.g., choosing a committee, selecting lottery numbers, picking a hand of cards)" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: 5 Choose 3", content: "A committee of 3 must be chosen from 5 candidates. How many possible committees?\n\n**Step 1:** Order doesn't matter (committee {A,B,C} = {C,B,A}). Use Combination.\n**Step 2:** 5C3 = 5! / (3! x 2!) = 120 / (6 x 2) = 120 / 12 = 10.\n\n**Final Answer: 10 possible committees.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common mistake: using permutation when you should use combination (or vice versa). If a question asks 'how many WAYS to ARRANGE' or 'how many DIFFERENT ORDERS', it's a permutation. If it asks 'how many GROUPS' or 'how many SELECTIONS', it's a combination. The word 'arrange' = permutation. The word 'choose/select' = combination." }
    ]
  },
  polyfactor: {
    title: "Polynomial Factoring: Cracking the Code",
    blocks: [
      { icon: "\ud83d\udd13", title: "1. The Core Concept: Reverse Engineering", content: "Expanding brackets is easy: (x+2)(x+3) = x^2 + 5x + 6. But **Factoring** is the reverse: given x^2 + 5x + 6, can you figure out it came from (x+2)(x+3)? Factoring is like reverse-engineering a product back into its ingredients. It's essential for solving quadratic equations, simplifying expressions, and finding roots." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Factor Hunt", content: "For a quadratic x^2 + bx + c, you need two numbers that:\n\n\u2022 **MULTIPLY** to give c (the constant at the end).\n\u2022 **ADD** to give b (the coefficient of x).\n\nFor x^2 + 5x + 6: find two numbers that multiply to 6 and add to 5. That's 2 and 3!\nSo x^2 + 5x + 6 = (x + 2)(x + 3)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Factoring with Negatives", content: "For x^2 - 7x + 12:\n\n1. We need two numbers that multiply to +12 and add to -7.\n2. Since they multiply to positive but add to negative, BOTH must be negative.\n3. Factors of 12: (1,12), (2,6), (3,4). Which pair adds to -7? That's -3 and -4.\n4. Answer: (x - 3)(x - 4).\n\nCheck: -3 x -4 = 12, -3 + (-4) = -7. Correct!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Difference of Two Squares", content: "Factorise: **x^2 - 25**.\n\n**Step 1:** Recognize the pattern: x^2 - something^2.\n**Step 2:** 25 = 5^2. So this is x^2 - 5^2.\n**Step 3:** Apply the formula: a^2 - b^2 = (a+b)(a-b).\n**Step 4:** x^2 - 25 = (x + 5)(x - 5).\n\n**Final Answer: (x + 5)(x - 5).**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Students constantly mix up the MULTIPLY and ADD conditions. For x^2 + 5x + 6, you need numbers that MULTIPLY to 6 and ADD to 5. Students often reverse this: they look for numbers that multiply to 5 and add to 6, getting completely wrong factors. Write down 'M = c, A = b' at the top of every factoring problem to keep yourself on track." }
    ]
  },
  polygons: {
    title: "Polygons: Many-Sided Wonders",
    blocks: [
      { icon: "\u2b23", title: "1. The Core Concept: Shapes with Many Sides", content: "A **Polygon** is any closed 2D shape made of straight lines. Triangles (3 sides), quadrilaterals (4), pentagons (5), hexagons (6), and so on. Regular polygons have all sides equal and all angles equal. Polygons are everywhere: stop signs (octagon), soccer balls (pentagons and hexagons), and honeycomb (hexagons)." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Angle Formulas", content: "\u2022 **Sum of interior angles:** (n - 2) x 180 degrees, where n = number of sides.\n\u2022 **Each interior angle (regular polygon):** (n - 2) x 180 / n.\n\u2022 **Sum of exterior angles:** ALWAYS 360 degrees (for any polygon!).\n\u2022 **Each exterior angle (regular polygon):** 360 / n.\n\u2022 Interior + Exterior = 180 degrees (they're supplementary)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the Number of Sides", content: "If each interior angle of a regular polygon is 144 degrees:\n\n1. Each exterior angle = 180 - 144 = 36 degrees.\n2. Number of sides = 360 / exterior angle = 360 / 36 = 10.\n3. It's a regular decagon!\n\nThe exterior angle shortcut is almost always faster than using the interior angle formula." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Interior Angle Sum", content: "Find the sum of interior angles of a heptagon (7 sides).\n\n**Step 1:** Formula: (n - 2) x 180.\n**Step 2:** n = 7.\n**Step 3:** (7 - 2) x 180 = 5 x 180 = 900 degrees.\n\n**Final Answer: The sum of interior angles is 900 degrees.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Two classic mistakes: (1) Using n x 180 instead of (n-2) x 180. The '-2' is critical! Without it, you get an answer that's 360 degrees too large. (2) Confusing interior and exterior angles. If a question asks for the exterior angle but you calculate the interior angle (or vice versa), your answer will be 180 minus what it should be. Always read the question carefully." }
    ]
  }
};

for (const [key, data] of Object.entries(files)) {
  const filePath = path.join(dir, key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed: ' + key);
}
console.log('Batch E done! Fixed', Object.keys(files).length, 'files.');

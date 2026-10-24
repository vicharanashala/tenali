const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'learnContent');

const files = {
  circmeasure: {
    title: "Circular Measure: Radians and Arcs",
    blocks: [
      { icon: "\ud83c\udf00", title: "1. The Core Concept: A New Way to Measure Angles", content: "Degrees are great for everyday life, but in advanced math and physics, there's a more natural unit called the **Radian**. One radian is the angle you get when you wrap the radius of a circle along its circumference. A full circle is 2*pi radians (about 6.28 radians), which equals 360 degrees." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Converting Between Degrees and Radians", content: "The key conversion factors:\n\n\u2022 **Degrees to Radians:** Multiply by pi/180.\n\u2022 **Radians to Degrees:** Multiply by 180/pi.\n\u2022 **Arc Length** = r * theta (where theta is in radians).\n\u2022 **Sector Area** = (1/2) * r^2 * theta (where theta is in radians).\n\nRemember: pi radians = 180 degrees. This single fact unlocks everything." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding Arc Length", content: "To find the arc length of a sector:\n\n1. Make sure the angle is in RADIANS. If it's in degrees, convert it first.\n2. Use the formula: Arc Length = r * theta.\n3. Multiply the radius by the angle in radians.\n4. That's it! The formula is beautifully simple when you use radians." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Sector Area", content: "Find the area of a sector with radius 6cm and angle pi/3 radians.\n\n**Step 1:** r = 6, theta = pi/3.\n**Step 2:** Area = (1/2) * r^2 * theta = (1/2) * 36 * (pi/3).\n**Step 3:** = (1/2) * 36 * 1.047 = 18.85 cm^2.\n\n**Final Answer: Area = 6*pi = 18.85 cm^2 (2 d.p.)**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The absolute deadliest mistake: using the arc length or sector area formula with an angle in DEGREES instead of RADIANS. If the question gives you 60 degrees, you MUST convert to pi/3 radians before plugging into r*theta or (1/2)*r^2*theta. If you use 60 directly, your answer will be catastrophically wrong." }
    ]
  },
  complex: {
    title: "Complex Numbers: Beyond Reality",
    blocks: [
      { icon: "\ud83c\udf0c", title: "1. The Core Concept: The Imaginary Dimension", content: "What's the square root of -1? In the real number world, it doesn't exist. But mathematicians invented a magical number called **i** (imaginary unit) where i^2 = -1. A **Complex Number** combines a real part and an imaginary part: **z = a + bi**. It's like adding a second dimension to the number line, creating a whole number PLANE instead of just a line." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Arithmetic with Complex Numbers", content: "\u2022 **Addition:** Add real parts together, add imaginary parts together. (3+2i) + (1+4i) = 4+6i.\n\u2022 **Subtraction:** Same idea but subtract. (3+2i) - (1+4i) = 2-2i.\n\u2022 **Multiplication:** Use FOIL, remembering i^2 = -1. (2+3i)(1+i) = 2+2i+3i+3i^2 = 2+5i-3 = -1+5i.\n\u2022 **Conjugate:** The conjugate of a+bi is a-bi. You flip the sign of the imaginary part." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the Modulus", content: "The **Modulus** of a complex number z = a + bi is its distance from the origin.\n\n1. Use the formula: |z| = sqrt(a^2 + b^2).\n2. Square the real part.\n3. Square the imaginary part (just the coefficient, not the i).\n4. Add them together.\n5. Take the square root.\n\nThis is essentially Pythagoras' Theorem on the complex plane!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Multiplying Complex Numbers", content: "Calculate (3 + 2i)(4 - i).\n\n**Step 1 (FOIL):**\nFirst: 3 * 4 = 12\nOuter: 3 * (-i) = -3i\nInner: 2i * 4 = 8i\nLast: 2i * (-i) = -2i^2\n\n**Step 2:** Combine: 12 - 3i + 8i - 2i^2\n**Step 3:** Since i^2 = -1: -2(-1) = +2\n**Step 4:** 12 + 2 + 5i = **14 + 5i**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The single most common error: forgetting that i^2 = -1, not +1! When you multiply 2i * 3i, you get 6i^2 = 6(-1) = -6, NOT +6. Every time you see i^2 in your working, immediately replace it with -1. If you miss this step, your real and imaginary parts will both be wrong." }
    ]
  },
  congruence: {
    title: "Congruence: The Perfect Clone",
    blocks: [
      { icon: "\ud83e\udde9", title: "1. The Core Concept: Identical Twins in Geometry", content: "Two shapes are **Congruent** if they are exactly the same shape AND size. If you could cut one out and place it perfectly on top of the other (maybe after flipping or rotating it), with no gaps and no overlaps, they are congruent. Unlike similarity (same shape, different size), congruence means they are perfect clones." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Four Proofs (SSS, SAS, ASA, RHS)", content: "To PROVE two triangles are congruent, you need one of these four sets of evidence:\n\n\u2022 **SSS:** All 3 sides of one triangle match all 3 sides of the other.\n\u2022 **SAS:** 2 sides and the INCLUDED angle (the angle between them) match.\n\u2022 **ASA:** 2 angles and the INCLUDED side (the side between them) match.\n\u2022 **RHS:** Both triangles are right-angled, and they share the same Hypotenuse and one other Side." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Writing a Congruence Proof", content: "1. List the matching parts from both triangles (e.g., AB = PQ, angle B = angle Q, BC = QR).\n2. Identify which rule applies (SSS, SAS, ASA, or RHS).\n3. State the conclusion: 'Triangle ABC is congruent to Triangle PQR by SAS.'\n4. **Critical:** The order of the letters matters! If A matches P, B matches Q, and C matches R, write ABC = PQR, NOT ACB = PQR." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: SAS Proof", content: "In triangles ABC and DEF: AB = DE = 5cm, BC = EF = 8cm, and angle B = angle E = 60 degrees.\n\n**Step 1:** AB = DE (Side)\n**Step 2:** Angle B = Angle E (Angle) -- this angle is BETWEEN the two sides.\n**Step 3:** BC = EF (Side)\n**Step 4:** The angle is included between the two sides.\n\n**Final Answer: Triangle ABC is congruent to Triangle DEF by SAS.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most dangerous trap is **SSA (or ASS)**. Having two sides and a NON-included angle does NOT prove congruence! This is called the Ambiguous Case because two different triangles can have the same SSA measurements. Only the INCLUDED angle (between the two sides) counts for SAS. If the angle is at the wrong vertex, your proof is invalid." }
    ]
  },
  conics: {
    title: "Conic Sections: Slicing the Cone",
    blocks: [
      { icon: "\ud83c\udf66", title: "1. The Core Concept: Four Shapes from One Cone", content: "Take an ice cream cone and slice through it with a flat knife at different angles. Depending on the angle of your cut, you'll get four different shapes: a **Circle** (horizontal cut), an **Ellipse** (tilted cut), a **Parabola** (cut parallel to the cone's side), or a **Hyperbola** (vertical cut through both cones). These are the **Conic Sections**, and they describe everything from planetary orbits to satellite dishes." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Standard Equations", content: "\u2022 **Circle:** x^2 + y^2 = r^2 (centered at origin, radius r).\n\u2022 **Ellipse:** x^2/a^2 + y^2/b^2 = 1 (a and b are the semi-axes).\n\u2022 **Parabola:** y = ax^2 (or x = ay^2 for sideways opening).\n\u2022 **Hyperbola:** x^2/a^2 - y^2/b^2 = 1 (note the MINUS sign!).\n\nThe key identifier: if both x^2 and y^2 have the SAME sign, it's an ellipse/circle. If they have OPPOSITE signs, it's a hyperbola." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Identifying a Conic", content: "Given a general equation Ax^2 + By^2 + Cx + Dy + E = 0:\n\n1. If A = B (same coefficient): It's a **Circle**.\n2. If A and B are different but same sign: It's an **Ellipse**.\n3. If A and B have opposite signs: It's a **Hyperbola**.\n4. If only one of A or B exists (the other is 0): It's a **Parabola**." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Identify the Conic", content: "Identify: **4x^2 + 9y^2 = 36**\n\n**Step 1:** Divide everything by 36: x^2/9 + y^2/4 = 1.\n**Step 2:** Both x^2 and y^2 are present with + sign.\n**Step 3:** The denominators are different (9 and 4).\n**Step 4:** Same sign but different denominators = Ellipse.\n\n**Final Answer: This is an Ellipse with a = 3 and b = 2.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The classic mistake is confusing an ellipse with a circle. If both squared terms have the SAME coefficient (like 4x^2 + 4y^2 = 16), it's a circle, not an ellipse. But if the coefficients are different (4x^2 + 9y^2 = 36), it's an ellipse. Students also frequently forget that a parabola only has ONE squared variable, not two." }
    ]
  },
  coordgeom: {
    title: "Coordinate Geometry: GPS Mathematics",
    blocks: [
      { icon: "\ud83d\uddfa\ufe0f", title: "1. The Core Concept: Math on a Map", content: "Coordinate Geometry is like giving every point on a piece of paper a unique address using two numbers: (x, y). Just like GPS coordinates can pinpoint any location on Earth, the (x, y) system lets you describe the exact position of any point, the slope of any line, and the distance between any two points using pure algebra. It bridges the gap between shapes and equations." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Big Three Formulas", content: "\u2022 **Distance:** d = sqrt[(x2-x1)^2 + (y2-y1)^2]. This is Pythagoras in disguise!\n\u2022 **Midpoint:** M = ((x1+x2)/2, (y1+y2)/2). Just average the x's and average the y's.\n\u2022 **Gradient (Slope):** m = (y2-y1) / (x2-x1). Rise over Run.\n\nParallel lines have EQUAL gradients. Perpendicular lines have gradients that multiply to -1." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the Equation of a Line", content: "Given two points, find the line equation:\n\n1. Calculate the gradient: m = (y2-y1)/(x2-x1).\n2. Use point-slope form: y - y1 = m(x - x1).\n3. Substitute one of your points and the gradient.\n4. Simplify to y = mx + c form.\n5. 'c' is the y-intercept (where the line crosses the y-axis)." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Line Through Two Points", content: "Find the equation of the line through (2, 3) and (6, 11).\n\n**Step 1:** m = (11-3)/(6-2) = 8/4 = 2.\n**Step 2:** y - 3 = 2(x - 2).\n**Step 3:** y - 3 = 2x - 4.\n**Step 4:** y = 2x - 1.\n\n**Final Answer: y = 2x - 1** (gradient 2, y-intercept -1)." },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common error is getting the gradient fraction upside down. It's (y2-y1) on TOP and (x2-x1) on BOTTOM. Students often write (x2-x1)/(y2-y1) by mistake. Remember: Rise (y-difference) is always on top, Run (x-difference) is always on the bottom. Rise over Run, not Run over Rise!" }
    ]
  },
  custom: {
    title: "Custom Lesson: Your Own Challenge",
    blocks: [
      { icon: "\ud83c\udfaf", title: "1. The Core Concept: Design Your Own Drill", content: "The **Custom Lesson** mode puts YOU in the teacher's seat. Instead of following a preset quiz, you get to design your own practice session by choosing which topics to include, how many questions to attempt, and what difficulty level suits you. This is perfect for targeted revision before exams." },
      { icon: "\ud83d\udcda", title: "2. The Strategy: Focus on Weaknesses", content: "Don't just pick the topics you're already good at! The whole point of Custom Lessons is to identify and attack your weak spots.\n\n\u2022 Check your past quiz scores.\n\u2022 Find the topics where you scored below 70%.\n\u2022 Build a custom session focused entirely on those problem areas." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Building an Effective Session", content: "For maximum learning:\n\n1. Pick 2-3 related topics (not 10 random ones).\n2. Start with easier questions to build confidence.\n3. Gradually increase difficulty.\n4. Take notes on any question you get wrong.\n5. Repeat the custom session until you can score 90%+." },
      { icon: "\ud83d\udcdd", title: "4. Pro Tip: Spaced Repetition", content: "Don't cram all your practice into one day. Research shows that spreading practice over multiple days (spaced repetition) makes your brain remember things 3x longer than cramming. Do your custom lesson today, then again in 3 days, then again in a week." },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest trap is making your custom lesson too easy or too comfortable. If you're scoring 100% every time, you're not learning anything new. Push yourself into uncomfortable territory. Also, don't skip the review phase. Looking at your mistakes is where the real learning happens!" }
    ]
  },
  decimals: {
    title: "Decimals: The Space Between Whole Numbers",
    blocks: [
      { icon: "\ud83d\udd22", title: "1. The Core Concept: Dividing the Whole", content: "Whole numbers are like stepping stones: 1, 2, 3, 4... But what about the mud between the stones? **Decimals** fill in those gaps. The number 3.7 sits between 3 and 4, exactly 7 tenths of the way across. Every digit after the decimal point represents a smaller and smaller fraction: tenths, hundredths, thousandths. They let you measure things with razor-sharp precision." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Place Value After the Point", content: "After the decimal point, each column is 10x smaller:\n\n\u2022 1st place: **Tenths** (0.1)\n\u2022 2nd place: **Hundredths** (0.01)\n\u2022 3rd place: **Thousandths** (0.001)\n\nSo 0.253 means 2 tenths + 5 hundredths + 3 thousandths.\n\n**Key Rule:** When comparing decimals, pad with trailing zeros first! 0.5 is the SAME as 0.500." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Multiplying Decimals", content: "To multiply decimals (e.g., 2.4 x 1.3):\n\n1. **Ignore the decimal points** and multiply as whole numbers: 24 x 13 = 312.\n2. **Count decimal places** in the original numbers: 2.4 has 1, and 1.3 has 1. Total = 2.\n3. **Place the decimal point** in your answer 2 places from the right: 3.12.\n\nThis trick works every single time!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Dividing Decimals", content: "Calculate 7.2 / 0.4.\n\n**Step 1:** Make the divisor a whole number. Multiply both by 10: 72 / 4.\n**Step 2:** Now it's a simple division: 72 / 4 = 18.\n\n**Final Answer: 7.2 / 0.4 = 18.**\n\n(The trick: always multiply both numbers by 10 or 100 until the divisor has no decimal point.)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most devastating mistake: when multiplying 0.2 x 0.3, students often write 0.6 instead of 0.06. Count the decimal places: 0.2 has 1 place, 0.3 has 1 place. Total = 2 places. So 2 x 3 = 6, and you need 2 decimal places: 0.06. If you don't count places correctly, your answer will be 10x or 100x off!" }
    ]
  },
  diff: {
    title: "Differentiation: The Calculus of Change",
    blocks: [
      { icon: "\ud83d\udcc8", title: "1. The Core Concept: Finding the Slope at a Point", content: "Imagine driving a car. Your speedometer doesn't show your average speed over the whole trip; it shows your speed RIGHT NOW, at this exact instant. **Differentiation** is the mathematical speedometer. Given any curved line (function), differentiation tells you the exact slope (gradient) at any single point on that curve. It's the math of instantaneous change." },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Power Rule", content: "The most important rule in differentiation is beautifully simple:\n\n\u2022 If y = x^n, then dy/dx = n * x^(n-1).\n\u2022 **Bring the power down** as a multiplier, then **reduce the power by 1**.\n\u2022 The derivative of a constant (like 5) is always 0.\n\u2022 The derivative of x (which is x^1) is just 1.\n\nExample: y = x^3 becomes dy/dx = 3x^2." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Differentiating a Polynomial", content: "To differentiate y = 4x^3 - 2x^2 + 7x - 5:\n\n1. Take each term separately.\n2. Apply the power rule to each: 4x^3 becomes 12x^2, -2x^2 becomes -4x, 7x becomes 7.\n3. Constants (like -5) vanish to 0.\n4. Combine: dy/dx = 12x^2 - 4x + 7." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Finding a Gradient", content: "Find the gradient of y = x^3 - 6x + 2 at the point where x = 2.\n\n**Step 1:** Differentiate: dy/dx = 3x^2 - 6.\n**Step 2:** Substitute x = 2: dy/dx = 3(4) - 6 = 12 - 6 = 6.\n\n**Final Answer: The gradient at x = 2 is 6.**\n(This means the curve is climbing steeply upward at that point.)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The classic error: forgetting to reduce the power by 1! Students will correctly bring the power down as a multiplier (so x^3 becomes 3x...) but then leave the power as 3 instead of reducing it to 2. The final answer should be 3x^2, not 3x^3. Always remember: bring down, then subtract one from the power." }
    ]
  },
  diffeq: {
    title: "Differential Equations: The Language of Nature",
    blocks: [
      { icon: "\ud83c\udf0d", title: "1. The Core Concept: Equations with Derivatives", content: "A regular equation gives you a number: x + 3 = 7, so x = 4. A **Differential Equation** gives you a function! It contains derivatives (like dy/dx) and your job is to find the original function y. Differential equations describe how things change: population growth, radioactive decay, electrical circuits, even the spread of diseases." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Order and Degree", content: "\u2022 The **Order** of a DE is the highest derivative present. If it contains dy/dx, it's 1st order. If it contains d^2y/dx^2, it's 2nd order.\n\u2022 The **Degree** is the power of the highest derivative (after removing fractions and roots).\n\u2022 A **General Solution** contains an arbitrary constant C.\n\u2022 A **Particular Solution** uses initial conditions to find the exact value of C." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Solving by Separation of Variables", content: "For equations where you can separate x and y:\n\n1. Move all y terms and dy to one side.\n2. Move all x terms and dx to the other side.\n3. Integrate both sides.\n4. Don't forget to add the constant of integration C!\n5. If given initial conditions (like y=2 when x=0), substitute to find C." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Separable DE", content: "Solve dy/dx = 2x, given y = 3 when x = 0.\n\n**Step 1:** Separate: dy = 2x dx.\n**Step 2:** Integrate both sides: integral of dy = integral of 2x dx.\n**Step 3:** y = x^2 + C.\n**Step 4:** Use initial condition: 3 = 0^2 + C, so C = 3.\n\n**Final Answer: y = x^2 + 3.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common mistake is forgetting the constant of integration C. Every time you integrate, you MUST add + C. Without it, your general solution is incomplete and you'll lose marks. Also, when separating variables, make sure dy goes with the y terms and dx goes with the x terms. Mixing them up makes the equation unsolvable." }
    ]
  },
  dotprod: {
    title: "Dot Product: The Angle Finder",
    blocks: [
      { icon: "\u2734\ufe0f", title: "1. The Core Concept: Multiplying Vectors", content: "When you multiply two numbers, you get a number. But what happens when you multiply two vectors? There are two ways. The **Dot Product** (scalar product) takes two vectors and produces a single number. This magical number tells you how much the two vectors point in the same direction. If the dot product is 0, the vectors are perpendicular (at 90 degrees)!" },
      { icon: "\ud83d\udcda", title: "2. The Rules: The Calculation", content: "For 2D vectors a = (a1, a2) and b = (b1, b2):\n\n\u2022 **a . b = a1*b1 + a2*b2** (multiply corresponding components, then add).\n\u2022 For 3D: a . b = a1*b1 + a2*b2 + a3*b3.\n\u2022 **a . b = |a| * |b| * cos(theta)** where theta is the angle between them.\n\u2022 If a . b = 0, the vectors are **perpendicular**." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Finding the Angle Between Vectors", content: "1. Calculate a . b using the component formula.\n2. Calculate |a| = sqrt(a1^2 + a2^2) and |b| = sqrt(b1^2 + b2^2).\n3. Use cos(theta) = (a . b) / (|a| * |b|).\n4. Use inverse cosine to find theta.\n5. Make sure your calculator is in the correct mode (degrees or radians)!" },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Computing a Dot Product", content: "Find the dot product of a = (3, 4) and b = (2, -1).\n\n**Step 1:** a . b = (3)(2) + (4)(-1) = 6 + (-4) = 2.\n\nSince the result is positive (2), the angle between them is acute (less than 90 degrees).\n\n**Final Answer: a . b = 2.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The number one mistake: adding the vectors before multiplying. The dot product requires you to multiply corresponding components FIRST, then add the products together. Students often add (3+4) and (2+(-1)) first, getting 7 * 1 = 7. That's completely wrong! It's (3*2) + (4*(-1)) = 6 - 4 = 2." }
    ]
  }
};

for (const [key, data] of Object.entries(files)) {
  const filePath = path.join(dir, key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed: ' + key);
}
console.log('Batch B done! Fixed', Object.keys(files).length, 'files.');

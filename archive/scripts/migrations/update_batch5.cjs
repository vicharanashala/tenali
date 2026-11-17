const fs = require('fs');
const path = require('path');

const batch5 = {
  bases: {
    title: "Number Bases: The Alien Math",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Counting with Fewer Fingers", 
        content: "Humans count in Base 10 because we have 10 fingers. Our columns are Ones, Tens, Hundreds, and Thousands. But what if we were aliens with only 2 fingers? We would use Base 2 (Binary)! Computers use Binary because they only have two 'fingers': electricity ON (1) or electricity OFF (0). Number bases are just different ways of packing items into boxes when you run out of digits." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Magic Columns", 
        content: "In Base 10, each column is 10 times bigger than the last (1, 10, 100, 1000). \n• In **Base 2 (Binary)**, each column is 2 times bigger than the last (1, 2, 4, 8, 16). The only digits you are allowed to write are 0 and 1.\n• In **Base 8 (Octal)**, each column is 8 times bigger (1, 8, 64). You can only use digits 0 through 7.\n• **The Golden Rule:** The 'Base' tells you the multiplier for the columns, and it tells you the absolute maximum limit for digits!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Converting Base 2 to Base 10", 
        content: "How do you translate an alien number like **1101** (Base 2) into human numbers (Base 10)?\n\n1. **Draw the Columns:** From right to left, write the Base 2 column values: 8, 4, 2, 1.\n2. **Drop the alien number:** Write 1 1 0 1 directly underneath those column headers.\n3. **Add the active columns:** Everywhere you see a '1', add that column's value. Everywhere you see a '0', ignore it.\n4. **Calculate:** We have one 8, one 4, zero 2s, and one 1. Add them up: 8 + 4 + 1 = 13." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Human to Alien", 
        content: "Convert the human number **23** into Base 2 (Binary).\n\n• **Step 1 (Find the biggest box):** The binary columns are 1, 2, 4, 8, 16, 32. The number 32 is too big, so we start at the 16 column.\n• **Step 2:** Does a 16 fit inside 23? Yes! Put a **1** in the 16 column. (We have 23 - 16 = 7 left over).\n• **Step 3:** Does an 8 fit into our leftover 7? No! Put a **0** in the 8 column.\n• **Step 4:** Does a 4 fit into 7? Yes! Put a **1** in the 4 column. (7 - 4 = 3 left).\n• **Step 5:** Does a 2 fit into 3? Yes! Put a **1** in the 2 column. (3 - 2 = 1 left).\n• **Step 6:** Does a 1 fit into 1? Yes! Put a **1** in the 1 column.\n\n**Final Answer: 10111**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When converting from human Base 10 into an alien base using the 'division' method, students often write the final answer completely backwards! If you are dividing by 2 repeatedly and writing down the remainders, you MUST read the remainders from the BOTTOM up to the TOP to form your binary number. If you read them from top to bottom, your number is completely reversed and mathematically wrong." 
      }
    ]
  },
  bearings: {
    title: "Bearings: Navigating the Seas",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Pirate's Map", 
        content: "If you are flying a plane or sailing a ship in the middle of a blank ocean, you can't just say 'turn left at the traffic light'. You need a universal system that everyone understands. **Bearings** are the exact mathematical angles used by pilots and sailors to navigate the globe. They tell you precisely what direction you are facing, based entirely on a compass pointing strictly to True North." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Three Golden Rules of Bearings", 
        content: "A bearing is not a normal geometry angle. It MUST obey three strict rules:\n\n• **Rule 1 (North):** You must ALWAYS measure starting from the North line (000°).\n• **Rule 2 (Clockwise):** You must ALWAYS measure the angle turning clockwise (to the right).\n• **Rule 3 (Three Digits):** You must ALWAYS write the answer using exactly 3 digits. An angle of 45° is completely wrong. It must be written as **045°**." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Reverse Bearing", 
        content: "If a ship sails from Island A to Island B on a bearing of 100°, what bearing must it sail to get BACK home? This is the most common exam question.\n\n1. **The 180° Trick:** A reverse bearing is just turning completely around, which is a half-circle (180°).\n2. **If the original bearing is LESS than 180°:** Add 180 to it. (e.g., 100° + 180° = 280°).\n3. **If the original bearing is MORE than 180°:** Subtract 180 from it. (e.g., if you sailed out at 300°, you sail back at 300 - 180 = 120°).\n*(Why? Because you can't have an angle bigger than 360!)*" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Home Path", 
        content: "You walk from the Camp to the Lake on a bearing of **065°**. What is the bearing of the Camp FROM the Lake?\n\n• **Step 1:** The word 'FROM' is critical. We are now standing at the Lake, looking backwards at the Camp.\n• **Step 2:** We need a reverse bearing. Look at the original number (065°).\n• **Step 3:** Since 65 is less than 180, we must ADD 180 to it to turn completely around.\n• **Step 4:** 65 + 180 = 245.\n\n**Final Answer: The bearing is 245°.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The deadliest trap in Bearings is failing to read the word **'FROM'**. The question will say: 'Find the bearing of Town A FROM Town B.' Students will instantly draw a North line at Town A, measure the angle to B, and write it down. **WRONG!** The word 'FROM' tells you exactly where you are standing. You are standing at Town B! You must draw the North line at Town B and measure the angle looking toward Town A. Always stand at 'FROM'!" 
      }
    ]
  },
  binomial: {
    title: "Binomial Expansion: Exploding the Brackets",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Mathematical Explosion", 
        content: "Expanding (x+2)² is easy using FOIL. But what happens if you have to expand (x+2)¹°? Writing out ten brackets and multiplying them all together would take you three hours and fill an entire notebook. **The Binomial Theorem** is a magical shortcut discovered centuries ago. It acts like a controlled explosion, instantly unpacking a massive bracket into a perfect polynomial in a matter of seconds." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Pascal's Triangle", 
        content: "The secret code to the Binomial explosion is hidden in a famous number pyramid called **Pascal's Triangle**.\n\n• Row 0: 1\n• Row 1: 1, 1\n• Row 2: 1, 2, 1\n• Row 3: 1, 3, 3, 1\n• Row 4: 1, 4, 6, 4, 1\nThese numbers give you the exact 'coefficients' (the multipliers at the front) for every term when you expand a bracket. If you are doing (a+b)³, you use Row 3: 1, 3, 3, 1." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Power Slide", 
        content: "How to use Pascal's Triangle to expand (a+b)³:\n\n1. **Write the coefficients:** From Row 3, write out 1, 3, 3, 1 with lots of space between them.\n2. **The First Term (a):** Start at the left with a³. As you move right, 'slide' the power down: a³, a², a¹, and then 'a' vanishes entirely at the end.\n3. **The Second Term (b):** Start at the right with b³. As you move left, 'slide' the power down: b³, b², b¹, and it vanishes at the front.\n4. **Combine:** Multiply them all together. (1a³) + (3a²b) + (3ab²) + (1b³)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Expanding (x+2)³", 
        content: "Expand **(x+2)³** using the rules.\n\n• **Step 1 (Coefficients):** The power is 3, so use 1, 3, 3, 1.\n• **Step 2 (The 'x'):** Slide x down: 1(x³) ... 3(x²) ... 3(x¹) ... 1(gone)\n• **Step 3 (The '2'):** Slide 2 up from the right: 1(x³)(2°) ... 3(x²)(2¹) ... 3(x¹)(2²) ... 1(gone)(2³)\n• **Step 4 (Calculate):** \n   Term 1: 1 × x³ × 1 = **x³**\n   Term 2: 3 × x² × 2 = **6x²**\n   Term 3: 3 × x × 4 = **12x**\n   Term 4: 1 × 1 × 8 = **8**\n\n**Final Answer: x³ + 6x² + 12x + 8**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The absolute biggest trap happens when the second term in the bracket is NEGATIVE, like (x - 3)4. When you slide the powers for the (-3), you must put the -3 in brackets! (-3)¹ is -3, so the term becomes negative. But (-3)² is POSITIVE 9! So the next term becomes positive. **The signs will always alternate: +, -, +, -, +.** If you forget to bracket your negatives, your entire expansion will be completely ruined." 
      }
    ]
  },
  circmeasure: {
    title: "Circular Measure: Radians and Arcs",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Natural Angle", 
        content: "Why are there 360 degrees in a circle? Because ancient Babylonians loved the number 60. It's completely made up! In advanced mathematics and physics, using 360° breaks down. We need a 'natural' way to measure angles based on the circle itself. Enter the **Radian**. One Radian is the exact angle created when you take a piece of the circle's edge (the arc) that is exactly the same length as the circle's radius. It is the purest way to measure a spin." 
      },
      { 
        icon: "p", 
        title: "2. The Rules: The Pi Connection", 
        content: "• A full circle is 360°. In radians, a full circle is exactly **2p**.\n• A half-circle is 180°. In radians, a half-circle is exactly **p**.\n• **Conversion Rule:** To turn Degrees into Radians, multiply by (p / 180). \n• **Conversion Rule:** To turn Radians into Degrees, multiply by (180 / p).\nCalculus only works if you use Radians. If you try to integrate Sine or Cosine using degrees, the math literally explodes." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Arc Length and Sector Area", 
        content: "The beautiful thing about radians is that it makes formulas incredibly simple and clean. (No more messy 'angle / 360' fractions!).\n\n1. **Arc Length (The Crust):** If the angle ? is in radians, the formula for the length of the crust is simply **s = r?** (Radius × Angle).\n2. **Sector Area (The Pizza Slice):** If ? is in radians, the formula for the area of the slice is simply **Area = ½r²?**.\n3. **Warning:** If your angle is in degrees, you CANNOT use these clean formulas. You must convert to radians first!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Perfect Slice", 
        content: "A pizza has a radius of 10cm. A slice has an angle of 1.5 radians. Find the area of the slice, and the length of its crust.\n\n• **Step 1 (The Crust):** Use s = r?. \n• **Step 2:** s = 10 × 1.5 = **15cm**. The crust is 15cm long.\n• **Step 3 (The Area):** Use Area = ½r²?.\n• **Step 4:** Area = 0.5 × (10)² × 1.5\n• **Step 5:** Area = 0.5 × 100 × 1.5 = 50 × 1.5 = **75cm²**.\n\n**Final Answer: Crust is 15cm, Area is 75cm².**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The calculator trap claims thousands of victims every year. If you are solving a trig equation like Sin(1.2) = x, and 1.2 is an angle in RADIANS, you must physically change your calculator mode from 'D' (Degrees) to 'R' (Radians). If you leave it in Degrees, your calculator will assume you mean a tiny 1.2 degrees, and give you a wildly incorrect answer. **Always check the tiny letter at the top of your calculator screen!**" 
      }
    ]
  },
  congruence: {
    title: "Congruence: Perfect Clones",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Exact Twin", 
        content: "In normal English, we say things are 'the same'. In geometry, 'the same' isn't precise enough. **Congruence** is the mathematical term for an absolute, perfect, 100% identical clone. If two shapes are congruent, they have the exact same side lengths, exact same angles, and exact same area. You could pick one up, rotate it, flip it over, and drop it perfectly on top of the other one without a single millimeter sticking out." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Four Triangle Proofs", 
        content: "You can't just look at two triangles and say 'Yeah, they look identical.' You must PROVE it using one of the four golden codes:\n\n• **SSS (Side, Side, Side):** All three side lengths perfectly match.\n• **SAS (Side, Angle, Side):** Two sides match, AND the 'trapped' angle right between them matches.\n• **ASA (Angle, Side, Angle):** Two angles match, AND the side directly between them matches.\n• **RHS (Right-angle, Hypotenuse, Side):** They are both 90° triangles, the longest sides match, and one other short side matches." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Writing a Formal Proof", 
        content: "To prove congruence in an exam, you must argue like a lawyer in a courtroom:\n\n1. **State a Fact:** Write down one matching feature (e.g., Line AB = Line XY).\n2. **Give the Reason:** Why? (e.g., 'Given in the question', or 'They are both radii of the circle', or 'Vertically opposite angles').\n3. **Repeat:** Do this three times until you have three solid facts with reasons.\n4. **The Verdict:** Write your final conclusion using the three-line congruence symbol (?) and state which code you used (e.g., 'Therefore, ?ABC ? ?XYZ by SAS')." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Shared Wall", 
        content: "Two triangles share a central wall (Line BD). Triangle ABD is on the left, CBD is on the right. Side AB = Side CB. Angle ABD = Angle CBD. Prove they are congruent.\n\n• **Fact 1 (Side):** AB = CB (Given in the question).\n• **Fact 2 (Angle):** Angle ABD = Angle CBD (Given in the question).\n• **Fact 3 (Side):** Line BD = Line BD (It is a **Common Side** shared by both triangles!).\n• **Verdict:** We have a side, an angle trapped in the middle, and a side.\n\n**Final Answer: Therefore, ?ABD ? ?CBD by the SAS rule.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most dangerous trap is the **ASS (Angle, Side, Side) trap**. If you have two matching sides, and a matching angle that is NOT trapped between them, it does NOT prove the triangles are clones! The loose angle allows the third side to swing like a hinge and create two completely different triangles. (There is a reason the acronym spells a bad word—don't use it!). The angle must be trapped in the middle (SAS)." 
      }
    ]
  },
  coordgeom: {
    title: "Coordinate Geometry: Math on a Grid",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Cartesian Map", 
        content: "If you draw a triangle on a blank piece of paper, it's just a drawing. But if you pin that triangle to a grid with an x-axis and a y-axis, it suddenly becomes a powerful mathematical machine! **Coordinate Geometry** fuses algebra and geometry together. By giving every point an address (like x=3, y=4), we can calculate exact lengths, precise midpoints, and perfect slopes without ever needing a ruler." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Midpoints and Distances", 
        content: "There are two massive formulas you must master to navigate the grid:\n\n• **The Midpoint Formula:** To find the exact halfway point between two dots, you just find the average! Add the two x-coordinates together and divide by 2. Add the two y-coordinates and divide by 2.\n• **The Distance Formula:** To find the exact distance between two dots, you actually just use Pythagoras! The formula is **v[ (x2 - x1)² + (y2 - y1)² ]**." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Parallel and Perpendicular", 
        content: "Lines on a grid are judged by their 'm' (Gradient or Slope).\n\n1. **Parallel Lines:** These are lines that never touch, like train tracks. Their rule is simple: **They have the exact same gradient.** (If Line A has m=3, Line B has m=3).\n2. **Perpendicular Lines:** These lines smash into each other at a perfect 90° right angle. Their rule is tricky: **Their gradients are Negative Reciprocals.**\n3. **The Flip Trick:** To find a perpendicular gradient, take the fraction, flip it upside down (reciprocal), and change the sign (positive to negative). (e.g., 2/3 becomes -3/2)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the 90° Line", 
        content: "Line A has the equation **y = 4x - 2**. Line B is completely perpendicular to Line A, and passes through the point (0, 5). Find the equation of Line B.\n\n• **Step 1 (Find original slope):** The slope of Line A is 4 (which is 4/1).\n• **Step 2 (The Flip Trick):** To make it perpendicular, flip 4/1 upside down to get 1/4. Change the sign to negative. The new slope is **-1/4**.\n• **Step 3 (The Intercept):** Line B passes through (0, 5), which is directly on the y-axis. So the y-intercept 'c' is 5.\n• **Step 4 (Build equation):** Put the new 'm' and 'c' into y = mx + c.\n\n**Final Answer: y = -¼x + 5**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When using the Distance Formula, the negative signs are absolutely brutal. If your coordinate has a negative (like x = -5), and the formula asks you to subtract it (x2 - x1), you end up with a double negative (like 3 - - 5). Students constantly forget that this transforms into a PLUS! (3 + 5 = 8). Always put negative coordinates inside small brackets when you substitute them into formulas to protect yourself from the minus-sign traps!" 
      }
    ]
  },
  diff: {
    title: "Differentiation: The Calculus of Change",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Capturing the Freeze-Frame", 
        content: "If you drive a car for 100 miles in 2 hours, your *average* speed is 50 mph. But were you doing exactly 50 mph when you passed the school? Probably not! To find your exact, instantaneous speed at a specific millisecond in time, you need a mathematical freeze-frame. **Differentiation (Calculus)** was invented by Isaac Newton to do exactly this. It finds the exact steepness (gradient/speed) of a curving line at one single microscopic point." 
      },
      { 
        icon: "?", 
        title: "2. The Rules: The Power Rule", 
        content: "To 'differentiate' a formula, you apply a magical shortcut called the Power Rule. If your formula is y = xn, the derivative (written as **dy/dx**) is found in two steps:\n\n1. **Multiply to the front:** Take the floating power 'n' and pull it down to multiply whatever number is at the front.\n2. **Subtract from the power:** Subtract exactly 1 from the floating power.\nExample: For y = x³, pull the 3 down (3x), then subtract 1 from the power (2). The derivative is 3x²!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Finding Maximums and Minimums", 
        content: "Calculus is the ultimate tool for finding the peak of a mountain or the bottom of a valley on a graph (called Stationary Points or Turning Points).\n\n1. **Differentiate:** Find the dy/dx formula.\n2. **Set to Zero:** At the exact top of a mountain, the ground is perfectly flat for a millisecond. A flat line has zero steepness. So, force your dy/dx equation to equal 0.\n3. **Solve for x:** Solve the equation to find the x-coordinate of the peak.\n4. **Find y:** Plug that x-coordinate back into the ORIGINAL 'y=' equation to find the actual height (y-coordinate) of the peak." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Valley", 
        content: "Find the turning point of the curve: **y = 2x² - 12x + 5**\n\n• **Step 1 (Differentiate):** For 2x², pull the 2 down (4x), subtract 1 from power (1). For -12x, the x disappears (-12). Constants like +5 vanish entirely. \n   Result: **dy/dx = 4x - 12**\n• **Step 2 (Set to Zero):** 4x - 12 = 0\n• **Step 3 (Solve for x):** 4x = 12, so **x = 3**.\n• **Step 4 (Find y):** Plug x=3 back into the original curve: y = 2(3)² - 12(3) + 5. \n   y = 2(9) - 36 + 5 = 18 - 36 + 5 = -13.\n\n**Final Answer: The turning point is at (3, -13).**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When differentiating, students often panic when they see a loose number at the end, like the '+ 5' in the example above. They try to keep it, writing dy/dx = 4x - 12 + 5. **WRONG!** A constant number has no 'x' attached, which means it doesn't change! Calculus measures *change*. If a number doesn't change, its rate of change is ZERO. It completely vanishes into thin air when you differentiate. Never keep loose numbers in your dy/dx!" 
      }
    ]
  },
  dotprod: {
    title: "Dot Product: Vector Collisions",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Shadow Cast", 
        content: "When two vectors (arrows) point in different directions, how much do they actually agree with each other? If you push a box North, and your friend pushes it East, your forces are completely independent. But if you both push North-East, your forces combine! The **Dot Product** (or Scalar Product) is a calculation that measures exactly how much one vector 'shadows' or overlaps another. It takes two directional arrows and crushes them down into a single, normal number." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Two Formulas", 
        content: "There are two ways to calculate the Dot Product (A • B):\n\n• **The Component Way:** If you have the coordinates like A=[2, 3] and B=[4, 1], simply multiply the x's together, multiply the y's together, and add the results. (2×4) + (3×1) = 8 + 3 = 11.\n• **The Angle Way:** If you know their lengths and the angle (?) between them, use: **|A| × |B| × Cos(?)**. \nBoth formulas give you the exact same number! We often set them equal to each other to solve for the missing angle." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Perpendicular Test", 
        content: "The greatest superpower of the Dot Product is its ability to instantly test if two lines are perfectly perpendicular (90° right angles) in 3D space.\n\n1. Calculate the Dot Product using the Component way (x1x2 + y1y2 + z1z2).\n2. Look at your final answer.\n3. **If the answer is exactly ZERO (0), the vectors are perpendicular!**\n4. Why? Because the Cosine of 90° is 0. So if the angle is 90°, the entire 'Angle Way' formula turns into zero. They cast no shadow on each other!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Angle", 
        content: "Vector A is [3, 4] (Length = 5). Vector B is [12, 5] (Length = 13). Find the angle between them.\n\n• **Step 1 (Component Way):** (3 × 12) + (4 × 5) = 36 + 20 = **56**.\n• **Step 2 (Set up the Angle Way):** We know Length A = 5, Length B = 13. \n   Formula: 5 × 13 × Cos(?) = 65 × Cos(?).\n• **Step 3 (Equate them):** The two formulas must equal each other! \n   65 × Cos(?) = 56.\n• **Step 4 (Solve):** Cos(?) = 56 / 65 = 0.8615.\n• **Step 5:** Use Inverse Cosine (Cos?¹) on 0.8615.\n\n**Final Answer: The angle is roughly 30.5°.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest mistake in the Dot Product is writing the answer as a vector with brackets (e.g., [11, 4]). **The Dot Product DESTROYS direction!** The word 'Product' here means 'Scalar Product'. The output must be a single, plain, normal number (a scalar). If you add the x-multiplication and the y-multiplication together and put brackets around them, you have completely misunderstood the physics of what you are calculating!" 
      }
    ]
  },
  hcflcm: {
    title: "HCF and LCM: The Building Blocks",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The DNA of Numbers", 
        content: "Every single whole number in the universe (except 1) can be broken down into a unique recipe of Prime Numbers. Primes (2, 3, 5, 7, 11...) are the unbreakable atoms of mathematics. By smashing numbers down into their prime DNA, we can easily find their **Highest Common Factor (HCF)** (the biggest number that divides perfectly into both) and their **Lowest Common Multiple (LCM)** (the smallest future number they will both meet at)." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Prime Factor Trees", 
        content: "Before finding HCF or LCM, you must build a factor tree:\n\n• Take a number like 60, and split it into any two numbers that multiply to make it (e.g., 6 and 10).\n• Keep splitting those branches down (6 becomes 2 and 3. 10 becomes 2 and 5).\n• When you hit a Prime number, circle it! It's a dead end. It cannot be split further.\n• Write the final recipe: 60 = 2 × 2 × 3 × 5 (or 2² × 3 × 5)." 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: The Venn Diagram Method", 
        content: "The absolute safest way to find HCF and LCM is using a Venn Diagram:\n\n1. Draw two overlapping circles, one for Number A, one for Number B.\n2. Look at their Prime DNA recipes. Any prime numbers they BOTH share go straight into the middle intersection.\n3. Put the leftover primes for Number A in its left circle, and the leftovers for Number B in its right circle.\n4. **For the HCF:** Simply multiply all the numbers in the MIDDLE intersection together.\n5. **For the LCM:** Simply multiply EVERY SINGLE NUMBER you can see inside the entire Venn diagram together!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: 24 and 36", 
        content: "Find the HCF and LCM of 24 and 36.\n\n• **Step 1 (DNA):** 24 = 2 × 2 × 2 × 3.  And 36 = 2 × 2 × 3 × 3.\n• **Step 2 (The Overlap):** What do they share? They both have a '2', another '2', and a '3'. Put (2, 2, 3) in the middle.\n• **Step 3 (Leftovers):** 24 has one '2' left over. 36 has one '3' left over.\n• **Step 4 (Find HCF):** Multiply the middle. 2 × 2 × 3 = **12**. (12 is the biggest number that divides into both).\n• **Step 5 (Find LCM):** Multiply everything. (Leftover 2) × (Middle 12) × (Leftover 3) = **72**. (72 is the first number they both fit into).\n\n**Final Answer: HCF = 12, LCM = 72.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When building a Venn diagram, students often see 2² in one number and 2³ in another, and they put a '2' in the middle. But they forget to put the *other* shared '2' in the middle! It is much safer to write the DNA out fully (2 × 2 × 2 instead of 2³) so you can physically cross off pairs of matching numbers one-by-one. If you mess up the Venn diagram, both your HCF and LCM will be completely wrong!" 
      }
    ]
  },
  indices: {
    title: "Indices (Exponents): The Power Laws",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Mathematical Steroids", 
        content: "When a number wants to multiply by itself over and over again, it uses **Indices** (also called Powers or Exponents). A tiny little '5' floating above a '2' (25) doesn't mean 2 × 5. It is a powerful command telling the 2 to clone itself five times and multiply them all together: 2 × 2 × 2 × 2 × 2. Indices allow us to write massive calculations in microscopic, efficient code." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Three Core Laws", 
        content: "As long as the 'Base' number is exactly the same (e.g., they are both 'x', or both '3'), you can use these shortcuts:\n\n• **The Multiplication Law:** When multiplying, ADD the powers. (x³ × x4 = x7). Why? Because 3 clones plus 4 clones makes a line of 7 clones!\n• **The Division Law:** When dividing, SUBTRACT the powers. (x8 ÷ x² = x6). The clones cancel each other out.\n• **The Bracket Law:** When a power has a power outside its bracket, MULTIPLY them. (x³)4 = x¹²." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Weird Powers", 
        content: "What happens when powers aren't normal numbers?\n\n1. **The Power of Zero:** ANYTHING to the power of 0 is exactly **1**. (100° = 1. x° = 1. Elephant° = 1). \n2. **Negative Powers:** A negative sign in the power means 'Flip it into a fraction'. It does NOT make the number negative! x?³ becomes **1 / x³**. It sends the number to the basement.\n3. **Fractional Powers:** The denominator (bottom) of the fraction is the Root. The numerator (top) is the normal Power. So x^(1/2) is just the **Square Root of x**. x^(1/3) is the Cube Root!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Evaluating a Monster", 
        content: "Calculate the exact value of **16^(-3/4)** without a calculator.\n\n• **Step 1 (The Negative):** The negative power means 'flip it'. This becomes **1 / 16^(3/4)**.\n• **Step 2 (The Root):** The bottom of the fraction power is 4. This means we must find the 4th root of 16. (What number times itself 4 times makes 16? It's 2!).\n• **Step 3:** Replace the 16 with 2. The fraction power (3/4) has used its bottom, leaving only the top power of 3. Our number is now **2³**.\n• **Step 4 (The Power):** Calculate 2³ (2 × 2 × 2). This equals 8.\n• **Step 5:** Put it back in the basement fraction.\n\n**Final Answer: 1/8.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most common failure in algebra is forgetting the **Hidden 1**. If a question asks you to simplify (x³ × x), students will see the 3, see no power on the other x, and write x³. **WRONG!** A lonely 'x' actually has a hidden power of 1 (x¹). You must add the powers! 3 + 1 = 4. The correct answer is x4. If a letter is standing there, it is cloned at least once, so it always counts as a power of 1!" 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch5)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 5 successfully written!');

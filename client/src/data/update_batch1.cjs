const fs = require('fs');
const path = require('path');

const batch1 = {
  addition: {
    title: "Mastering Addition",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Bringing Things Together", 
        content: "Imagine you're organizing a massive school festival. You have 450 tickets sold by Class A, and 325 tickets sold by Class B. To find out the total number of people coming, you need to combine them. **Addition** is exactly that—the mathematical superpower of bringing separate groups together to find the grand total. The numbers you are adding are called **addends**, and your final grand total is called the **sum**." 
      },
      { 
        icon: "??", 
        title: "2. The Rules of the Game", 
        content: "Addition is incredibly flexible thanks to three powerful rules:\n\n• **The Commutative Property (Order doesn't matter):** If you eat 3 apples and then 2 oranges, you ate 5 fruits. If you eat 2 oranges then 3 apples, it's still 5! So, **5 + 3 = 3 + 5**.\n\n• **The Associative Property (Grouping doesn't matter):** When adding three numbers, you can group them however you like. **(2 + 3) + 4** gives 9, and **2 + (3 + 4)** also gives 9.\n\n• **The Identity Property:** Adding zero is like adding nothing at all. **7 + 0 = 7**. It keeps the number's 'identity' exactly the same." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Column Addition", 
        content: "When numbers get too big to add in your head, we use the **Column Method**:\n\n1. **Stack them up:** Write the numbers vertically, making sure the ones digits line up, the tens line up, and so on.\n2. **Start on the right:** Always begin adding from the ones column (the far right) and move left.\n3. **The 'Carry Over' secret:** If a column adds up to 10 or more, you can't fit two digits in one space! Write down the ones digit of your answer, and **carry over** the tens digit to the top of the next column to the left." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: A Real Problem", 
        content: "Let's find the total of **487 + 256**.\n\n• **Step 1 (Stack):** Put 487 on top of 256, lined up perfectly.\n• **Step 2 (Ones):** Add 7 + 6. That's 13. Write down **3** and carry over the **1** to the tens column.\n• **Step 3 (Tens):** Add 8 + 5. That's 13. But wait! Add the carried **1** to get 14. Write down **4** and carry over the **1** to the hundreds column.\n• **Step 4 (Hundreds):** Add 4 + 2. That's 6. Add the carried **1** to get **7**.\n\n**Final Answer: 743.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls to Avoid", 
        content: "The number one mistake students make is **forgetting to add the carried-over number**. You might do all the hard work correctly, but if you ignore that tiny '1' sitting at the top of your column, your whole answer will be wrong. Always write your carried numbers clearly, and cross them out once you've added them so you don't forget!" 
      }
    ]
  },
  fractionadd: {
    title: "Mastering Fractions: Adding the Pieces",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Pieces of a Puzzle", 
        content: "Think of a fraction as a slice of a pizza. The bottom number (**denominator**) tells you how many slices the whole pizza was cut into. The top number (**numerator**) tells you how many of those slices you actually have on your plate. Fractions are just a way of talking about things that are smaller than one whole item, but bigger than zero." 
      },
      { 
        icon: "??", 
        title: "2. The Golden Rule of Fractions", 
        content: "Here is the most important rule you will ever learn about adding fractions: **You CANNOT add them unless the denominators (the bottom numbers) are exactly the same!**\n\nWhy? Imagine adding 1 slice of a pizza cut into 4 pieces (1/4) to 1 slice of a pizza cut into 8 pieces (1/8). The slices are different sizes! You can't just say you have '2 slices' because the sizes don't match. You must make the slices the same size first." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step Method", 
        content: "1. **Find a Common Denominator:** You need to make the bottom numbers match. The easiest way is to multiply the two denominators together.\n2. **Adjust the Numerators:** Whatever you multiplied the bottom by, you MUST multiply the top by the exact same number. (This keeps the fraction fair and balanced).\n3. **Add the Tops:** Once the bottoms match, simply add the top numbers together.\n4. **Keep the Bottom:** Do NOT add the bottom numbers! Just slide the common denominator over to your final answer.\n5. **Simplify:** If both top and bottom can be divided by the same number, shrink them down to their simplest form." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: 1/4 + 2/3", 
        content: "Let's solve **1/4 + 2/3**.\n\n• **Step 1 (Common Denominator):** The bottoms are 4 and 3. Multiply them: 4 × 3 = **12**.\n• **Step 2 (Adjust 1/4):** To turn the 4 into a 12, we multiplied by 3. So, multiply the top by 3 as well. 1 × 3 = 3. Our new fraction is **3/12**.\n• **Step 3 (Adjust 2/3):** To turn the 3 into a 12, we multiplied by 4. So, multiply the top by 4. 2 × 4 = 8. Our new fraction is **8/12**.\n• **Step 4 (Add):** Now we have 3/12 + 8/12. Add the tops: 3 + 8 = **11**. Keep the bottom: **12**.\n\n**Final Answer: 11/12.**" 
      },
      { 
        icon: "??", 
        title: "5. The Ultimate Pitfall", 
        content: "The most disastrous mistake you can make is adding the numerators AND adding the denominators. **1/2 + 1/2 does NOT equal 2/4!** Think about it: if you eat half a pizza, and then eat another half, you've eaten ONE WHOLE pizza (2/2 = 1). You haven't eaten 2/4 (which is just another half). Never, ever add the bottom numbers!" 
      }
    ]
  },
  trig: {
    title: "Mastering Trigonometry: The Triangle Magic",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Skyscraper Secret", 
        content: "Imagine you're standing on the ground looking up at the top of a massive skyscraper. How tall is it? You can't use a measuring tape! But if you know how far you are from the building, and the *angle* you're looking up, **Trigonometry** acts like a mathematical superpower that lets you calculate the exact height without ever leaving the ground. It is the study of how the angles and sides of right-angled triangles are forever linked together." 
      },
      { 
        icon: "???", 
        title: "2. The Rules: Naming the Sides", 
        content: "Before doing any math, you must label the triangle based on your target angle (we'll call it ?, pronounced 'theta'):\n\n• **Hypotenuse (H):** The longest side of the triangle. It is ALWAYS directly opposite the 90° right angle.\n• **Opposite (O):** The side that is completely opposite your target angle ?. If ? was an eye, it would be looking directly at the Opposite side.\n• **Adjacent (A):** The side that is right next to your target angle ? (but isn't the hypotenuse). It 'touches' the angle." 
      },
      { 
        icon: "???", 
        title: "3. Step-by-Step: SOH CAH TOA", 
        content: "To solve any basic trig problem, follow these steps and use the magic word **SOH-CAH-TOA**:\n\n1. Label your triangle: H, O, and A.\n2. Look at what you *know* and what you *want to find*. (e.g., I know the Hypotenuse, I want the Opposite).\n3. Choose your weapon based on those two letters:\n   • **SOH:** Sine(?) = Opposite ÷ Hypotenuse\n   • **CAH:** Cosine(?) = Adjacent ÷ Hypotenuse\n   • **TOA:** Tangent(?) = Opposite ÷ Adjacent\n4. Write the equation, plug in your numbers, and solve for the unknown." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding a Missing Side", 
        content: "A ladder leans against a wall. The ladder is 10m long (Hypotenuse). The angle it makes with the ground is 30°. How high up the wall does it reach (Opposite)?\n\n• **Step 1:** We have H = 10, and we want O. Angle ? = 30°.\n• **Step 2:** We have O and H. Looking at SOH CAH TOA, we must use **Sine (SOH)**.\n• **Step 3:** Write it out: Sin(30°) = O / H\n• **Step 4:** Plug in numbers: Sin(30°) = O / 10\n• **Step 5:** Multiply both sides by 10 to get O by itself: 10 × Sin(30°) = O\n• **Step 6:** Since Sin(30°) is 0.5, 10 × 0.5 = 5.\n\n**Final Answer: The ladder reaches 5m high.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "There are two massive traps in Trigonometry. First, **labeling the sides wrong**. If you mix up Opposite and Adjacent, your whole calculation is doomed. Always double-check your labels! Second, **calculator modes**. If your calculator is set to Radians (RAD) instead of Degrees (DEG), it will give you completely wild answers. Always look for the tiny 'D' or 'DEG' at the top of your calculator screen before an exam!" 
      }
    ]
  },
  qformula: {
    title: "The Quadratic Formula: The Ultimate Weapon",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Unbreakable Equation", 
        content: "A quadratic equation is any equation where the highest power of 'x' is 2, like **ax² + bx + c = 0**. When graphed, it creates a beautiful U-shaped curve called a parabola. Sometimes, these equations are easy to solve by factoring (finding two numbers that multiply and add to certain values). But what happens when the numbers are ugly decimals or fractions? That's where the **Quadratic Formula** comes in. It is the ultimate weapon—a master key that can solve *any* quadratic equation in the universe, no matter how nasty the numbers are." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Memorizing the Magic", 
        content: "To use the weapon, you must first memorize it. Say it out loud to the tune of 'Pop Goes the Weasel':\n\n**x = [ -b ± v(b² - 4ac) ] / 2a**\n\n• **a** is the number attached to x²\n• **b** is the number attached to x\n• **c** is the lonely number at the end\n• The **±** symbol means you will actually get TWO answers (one using +, one using -)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Discriminant Trick", 
        content: "The chunk of math sitting inside the square root, **(b² - 4ac)**, is incredibly special. It's called the **Discriminant**, and it acts like a crystal ball predicting the future of your graph:\n\n1. Calculate (b² - 4ac) first before doing the whole formula.\n2. If it's a **positive number**, the curve crosses the x-axis twice. You will have 2 real answers.\n3. If it's **exactly zero**, the curve just kisses the x-axis once. You will have exactly 1 answer.\n4. If it's a **negative number**, stop! You can't take the square root of a negative. The curve never touches the x-axis, meaning there are 0 real answers." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Solving the Puzzle", 
        content: "Let's solve: **2x² - 5x - 3 = 0**\n\n• **Step 1:** Identify a = 2, b = -5, c = -3.\n• **Step 2:** Plug into the formula: x = [ -(-5) ± v((-5)² - 4(2)(-3)) ] / 2(2)\n• **Step 3 (Clean it up):** -(-5) becomes positive 5. The bottom becomes 4.\n• **Step 4 (The root):** (-5)² is 25. And -4(2)(-3) is +24. So inside the root is 25 + 24 = 49.\n• **Step 5:** We now have: x = [ 5 ± v49 ] / 4. Since v49 is 7, we have: x = [ 5 ± 7 ] / 4\n• **Step 6 (Split the ±):** \n   Path 1 (+): (5 + 7)/4 = 12/4 = **3**\n   Path 2 (-): (5 - 7)/4 = -2/4 = **-0.5**\n\n**Final Answers: x = 3, and x = -0.5**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Negative signs are the silent assassins of the Quadratic Formula. \nFirst, if 'b' is already negative (like -5), the formula asks for '-b', which flips it to a positive 5. Don't write -5! \nSecond, when calculating b², remember that squaring a negative number ALWAYS makes it positive. (-5)² is +25, never -25. Keep your signs organized and you'll never fail." 
      }
    ]
  },
  matrix: {
    title: "Mastering Matrices: The Number Grids",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Organizing Data", 
        content: "Imagine you are running three different stores, and each store sells apples, bananas, and cherries. Writing all those inventory numbers in sentences would be confusing. A **Matrix** (plural: matrices) solves this by organizing numbers into a neat, rectangular grid of rows and columns. It's essentially a spreadsheet for mathematics! Computer graphics, encryption, and physics all rely heavily on matrices to process massive amounts of data instantly." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Size Matters", 
        content: "Before you do anything with a matrix, you must know its size (also called its **order**). We always state the size by counting the **Rows first (horizontal), then the Columns (vertical)**.\n\n• Think 'RC Cola' or 'Roman Catholic' to remember Rows then Columns.\n• A matrix with 2 rows and 3 columns is a **2×3 matrix**.\n• You can ONLY add or subtract matrices if they are the exact same size. A 2×3 can only be added to another 2×3!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Matrix Multiplication", 
        content: "Adding is easy (just add the numbers in matching positions), but multiplication is tricky. You do NOT just multiply matching positions. You must multiply the **Rows** of the first matrix by the **Columns** of the second matrix.\n\n1. Check if it's possible: The number of columns in Matrix A MUST equal the number of rows in Matrix B.\n2. Take the first row of A, and lay it over the first column of B.\n3. Multiply the first numbers together, multiply the second numbers together, and add those results up. This single sum becomes the top-left number of your new matrix.\n4. Repeat for every row-and-column combination." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Dive", 
        content: "Let's multiply a 1×2 matrix by a 2×1 matrix.\nMatrix A (Row): [ 2,  3 ]\nMatrix B (Col): \n[ 4 ]\n[ 5 ]\n\n• **Step 1:** Take Row 1 of A and multiply it by Column 1 of B.\n• **Step 2:** Multiply the first numbers: 2 × 4 = 8.\n• **Step 3:** Multiply the second numbers: 3 × 5 = 15.\n• **Step 4:** Add them together: 8 + 15 = 23.\n\n**Final Answer:** You get a tiny 1×1 matrix containing just **[ 23 ]**." 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest trap in matrix math is assuming it acts like normal numbers. With regular numbers, 3 × 4 is the same as 4 × 3 (commutative property). **Matrix multiplication is NOT commutative!** Matrix A × Matrix B is almost always completely different from Matrix B × Matrix A. In fact, if you swap the order, the multiplication might not even be possible due to the sizing rules. Never swap the order!" 
      }
    ]
  },
  simul: {
    title: "Simultaneous Equations: The Intersection",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Crossing Paths", 
        content: "If you draw a straight line on a graph, it represents an equation with infinite possible answers (every point on the line). If you draw a second line, it also has infinite answers. But where do the two lines cross? That single point of intersection is the ONE magical coordinate (x, y) that works perfectly for BOTH equations at the same time. Solving **Simultaneous Equations** is the mathematical art of finding that exact intersection point without needing to draw the graph." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Two Paths to Victory", 
        content: "There are two main ways to solve these puzzles algebraically:\n\n• **Substitution Method:** Best used when one equation already has x or y completely alone (like y = 2x + 1). You take that expression and 'substitute' it into the other equation, trapping it down to just one variable.\n• **Elimination Method:** Best used when the equations are stacked neatly (like 3x + 2y = 10). You manipulate the equations so that when you add or subtract them vertically, one of the variables gets completely destroyed (eliminated)!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Elimination Method", 
        content: "1. **Stack 'em up:** Write the equations one above the other, aligning the x's, y's, and numbers.\n2. **Match the coefficients:** Multiply one (or both) equations by a number so that the x's OR the y's have the exact same number in front of them (ignoring the sign).\n3. **Eliminate:** If the matched signs are the SAME (both +, or both -), SUBTRACT the equations. If the signs are DIFFERENT (+ and -), ADD the equations. The variable will vanish!\n4. **Solve:** Solve the simple equation left behind for the remaining variable.\n5. **Tag Team:** Take your answer and plug it back into EITHER original equation to find the other variable." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Elimination in Action", 
        content: "Solve: \n1) 3x + y = 11\n2) 2x - y = 4\n\n• **Step 1:** Look at the y's. We have a +y and a -y. The coefficients already match (they are both 1), and the signs are different.\n• **Step 2:** Because the signs are different, we ADD the two equations vertically.\n• **Step 3:** (3x + 2x) = 5x. (+y + -y) = 0. (11 + 4) = 15. We are left with **5x = 15**.\n• **Step 4:** Divide by 5. **x = 3**.\n• **Step 5 (Tag Team):** Plug x=3 into the first equation: 3(3) + y = 11. Which means 9 + y = 11. So, **y = 2**.\n\n**Final Answer: x = 3, y = 2 (Coordinate: 3,2)**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When using the Elimination method and deciding to SUBTRACT the equations, students often make a fatal error: they subtract the first term, but forget to distribute the minus sign to the rest of the bottom equation. If you are subtracting an equation like (2x - 3y = 4), that minus sign changes the -3y into a +3y. Pro tip: Put big brackets around the entire bottom equation with a minus sign outside to remind your brain to flip EVERY sign!" 
      }
    ]
  },
  polymul: {
    title: "Polynomial Multiplication: Expanding Horizons",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Meeting Everyone at the Party", 
        content: "Imagine a party where two families arrive. Every member of the first family MUST shake hands with every member of the second family. No one can be left out! **Multiplying polynomials** is exactly the same. A polynomial is an expression with multiple terms (like x + 3). When you multiply two of them together, every single term in the first bracket must be multiplied by every single term in the second bracket." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: FOIL for Binomials", 
        content: "When you have two binomials (brackets with exactly two terms each, like (a+b)(c+d)), there is a famous acronym to ensure no handshakes are missed: **FOIL**.\n\n• **F (First):** Multiply the FIRST terms in each bracket (a × c)\n• **O (Outer):** Multiply the OUTER terms on the far ends (a × d)\n• **I (Inner):** Multiply the two INNER terms in the middle (b × c)\n• **L (Last):** Multiply the LAST terms in each bracket (b × d)\n\nOnce you have your four pieces, you add them all together!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Box Method (For Larger Parties)", 
        content: "If you have larger polynomials (like 3 terms × 3 terms), FOIL gets too messy. Use the **Box Method** instead:\n\n1. Draw a grid (like a tic-tac-toe board).\n2. Write the terms of the first polynomial along the top, one per column.\n3. Write the terms of the second polynomial down the left side, one per row.\n4. Multiply the row term by the column term to fill in each inner box.\n5. Write out all the terms inside the boxes, and combine the 'like terms' (terms that have the exact same letters and powers, like 3x and 5x)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Using FOIL", 
        content: "Expand and simplify: **(2x + 3)(x - 5)**\n\n• **First:** 2x × x = **2x²**\n• **Outer:** 2x × -5 = **-10x**\n• **Inner:** 3 × x = **3x**\n• **Last:** 3 × -5 = **-15**\n\nNow, write it out: 2x² - 10x + 3x - 15\nFinally, combine the middle 'x' terms (-10x + 3x = -7x).\n\n**Final Answer: 2x² - 7x - 15**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "There are two major traps here. First, **forgetting the laws of indices**. When you multiply an 'x' by an 'x', it becomes **x²**, not 2x! (x + x is 2x, x * x is x²). \nSecond, **messing up the signs**. When you multiply a positive number by a negative number, the result is negative. Always take the plus or minus sign immediately to the left of the term with you into the multiplication!" 
      }
    ]
  },
  vectors: {
    title: "Mastering Vectors: Direction with Purpose",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: More Than Just a Number", 
        content: "In normal math, a number just tells you 'how much' (like 5 kilograms, or 10 meters). These are called *scalars*. But what if you need to tell a pilot how to fly? Saying 'fly 500 km/h' isn't enough; they need to know WHICH WAY. A **Vector** is a mathematical tool that has both a **size (magnitude)** AND a **direction**. It's an instruction manual: 'Go 10 meters, North-East'." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Column Vectors", 
        content: "To make vectors easy to use in algebra, we write them as a vertical stack of numbers, called a **Column Vector**, like [x, y] written vertically.\n\n• The top number is the **x-movement**: Positive means move RIGHT. Negative means move LEFT.\n• The bottom number is the **y-movement**: Positive means move UP. Negative means move DOWN.\n• A vector of [3, -2] means 'Start here, go 3 steps right, and 2 steps down'." 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: Adding Vectors", 
        content: "You can add vectors visually or algebraically:\n\n• **Visually (Nose to Tail):** Draw the first vector as an arrow. Then, take the second arrow and place its starting point (tail) exactly on the tip (nose) of the first arrow. The final answer is a new straight arrow drawn from your very first starting point to your final ending point.\n• **Algebraically:** This is much easier! Just add the top numbers together, and add the bottom numbers together. That's it!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Vector Journey", 
        content: "Vector A is [4, 2] (4 right, 2 up). Vector B is [-1, 5] (1 left, 5 up). Find Vector A + Vector B.\n\n• **Step 1 (Add the tops):** 4 + (-1) = 3\n• **Step 2 (Add the bottoms):** 2 + 5 = 7\n• **Step 3 (Combine):** The new vector is **[3, 7]**.\n\nThis means if you walked the path of Vector A, and then walked the path of Vector B, you would end up exactly 3 steps right and 7 steps up from where you originally started." 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest mistake students make is confusing vector addition with scalar addition. If you walk 3 meters North, and then 4 meters East, your total distance walked is 7 meters. But your vector displacement (how far you are from the start) is NOT 7 meters! Because you turned a corner, you formed a triangle, and your displacement is only 5 meters (using Pythagoras). **Vectors must respect direction—they don't add like normal numbers!**" 
      }
    ]
  },
  lineq: {
    title: "Linear Equations & Graphs: The Perfect Straight Line",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Code of the Line", 
        content: "Every straight line you draw on a graph isn't just a random scribble—it has a mathematical 'DNA code' that perfectly describes how it moves. That code is a **Linear Equation**. It guarantees that the line is perfectly straight, with no bends or curves. If you know the equation, you can predict exactly where the line will be a million miles away without having to draw it." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The y = mx + c Formula", 
        content: "The DNA of almost every straight line can be written in the famous format: **y = mx + c** (in some countries, it's y = mx + b).\n\n• **'m' is the Gradient (Slope):** It tells you how steep the line is. A big number means a steep cliff. A positive 'm' goes uphill. A negative 'm' goes downhill.\n• **'c' is the Y-Intercept:** It tells you the exact coordinate where the line crashes through the vertical y-axis. It's your 'starting point' on the graph." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Calculating Gradient (m)", 
        content: "To find the gradient 'm' from any two points on a line, use the **Rise over Run** method:\n\n1. Pick two clear coordinates on the line: Point 1 (x1, y1) and Point 2 (x2, y2).\n2. Calculate the **Rise**: How far UP or DOWN did you go? Subtract the y-values (y2 - y1).\n3. Calculate the **Run**: How far ACROSS did you go? Subtract the x-values (x2 - x1).\n4. Divide the Rise by the Run. That fraction is your gradient!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Graphing the Equation", 
        content: "Graph the line: **y = 2x - 3**\n\n• **Step 1 (Find the start):** Look at 'c', which is -3. This means our line crosses the y-axis at -3. Put a big dot at (0, -3).\n• **Step 2 (Use the slope):** Look at 'm', which is 2. This means the gradient is 2 (or 2/1). For every 1 step we Run to the right, we must Rise 2 steps up.\n• **Step 3 (Find the next point):** From our starting dot at (0, -3), go RIGHT 1, and UP 2. Put a second dot at (1, -1).\n• **Step 4 (Draw):** Take a ruler and draw a long straight line passing through both dots!" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When calculating the gradient using (y2 - y1) / (x2 - x1), the absolute most common mistake is putting the x's on top and the y's on the bottom. **Always remember: Rise (y) over Run (x).** The 'y's must be in the numerator. Also, make sure you subtract the coordinates in the exact same order for both top and bottom!" 
      }
    ]
  },
  angles: {
    title: "Mastering Angles: The Measure of a Turn",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: It's All About the Spin", 
        content: "An angle isn't a measurement of length or distance; it's a measurement of a **turn** or a **spin**. Imagine standing still and turning your body to look in a new direction. The amount you rotated is an angle! We measure this spin in **degrees (°)**, where a complete, full-circle spin (like a skateboarder doing a 360) is exactly 360°." 
      },
      { 
        icon: "???", 
        title: "2. The Rules: Naming the Angles", 
        content: "Just like people, angles have different names depending on their size:\n\n• **Acute Angle (0° to 89°):** Small, sharp, and narrow. (Think 'a-cute' little angle).\n• **Right Angle (Exactly 90°):** A perfect 'L' shape, like the corner of a book or a room.\n• **Obtuse Angle (91° to 179°):** Wide, open, and blunt.\n• **Straight Angle (Exactly 180°):** A perfectly straight line (a half-turn).\n• **Reflex Angle (181° to 359°):** Bent so far backward it looks like Pac-Man's mouth opening." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Three Golden Rules of Geometry", 
        content: "When solving geometry puzzles to find missing angles, you only need to remember three golden rules:\n\n1. **Angles on a Straight Line:** Any angles that sit side-by-side on a flat, straight line will ALWAYS add up to exactly **180°**.\n2. **Angles Around a Point:** All the angles circling a single central dot will ALWAYS add up to a full circle, which is **360°**.\n3. **Vertically Opposite Angles:** When two straight lines cross like an 'X', the angles directly across from each other are identical mirror images. They are ALWAYS **equal**." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Straight Line Puzzle", 
        content: "You are given a straight horizontal line. Two angles are sitting on it side-by-side. One angle is 115°. The other angle is unknown, labeled 'x'. Find x.\n\n• **Step 1 (Identify the rule):** They sit on a straight line, so we know they must add up to 180°.\n• **Step 2 (Set up the math):** x + 115° = 180°\n• **Step 3 (Solve):** To find x, subtract 115 from 180.\n• **Step 4 (Calculate):** 180 - 115 = 65.\n\n**Final Answer: x = 65°**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A major trap in exams is assuming an angle is 90° just because it *looks* like a perfect 'L' shape in the drawing. Geometry diagrams are often drawn 'not to scale' on purpose to trick you! **Never assume an angle is a right angle unless you see the little square symbol in the corner**, or unless the math proves it is exactly 90°." 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch1)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 1 successfully written!');

const fs = require('fs');
const path = require('path');

const batch2 = {
  sequences: {
    title: "Number Sequences: Finding the Pattern",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Train of Numbers", 
        content: "A number sequence is like a train with an infinite number of carriages. Inside each carriage is a number. The most important rule of the train is that it must follow a strict mathematical pattern to move from one carriage to the next. If you can figure out the 'rule' of the train (like 'add 4 every time' or 'multiply by 2'), you can predict exactly what number will be in the 100th or even the 1,000th carriage!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Arithmetic vs. Geometric", 
        content: "There are two main types of sequences you must know:\n\n• **Arithmetic Sequence (The Walker):** This sequence moves forward by ADDING or SUBTRACTING the exact same amount every time. Example: 3, 7, 11, 15... (The rule is +4). It grows at a steady, walking pace.\n• **Geometric Sequence (The Runner):** This sequence moves forward by MULTIPLYING or DIVIDING by the exact same amount every time. Example: 2, 6, 18, 54... (The rule is x3). It explodes in size very quickly!" 
      },
      { 
        icon: " nth", 
        title: "3. Step-by-Step: Finding the 'nth' Term Formula", 
        content: "For Arithmetic sequences, we use the magic formula **U? = dn + c** to predict the future:\n\n1. **Find 'd' (The Difference):** Look at the gap between the numbers. If the sequence is 5, 8, 11... the gap is +3. So, d = 3.\n2. **Start your formula:** Write down **3n**.\n3. **Find 'c' (The Zero Term):** What number would come *before* the first number in the sequence? If the first number is 5, and we are going up by 3, the 'zero term' would be 2. So, c = +2.\n4. **Combine:** Your magic formula is **3n + 2**." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Predicting the Future", 
        content: "Given the sequence: **7, 12, 17, 22...** Find the 50th term.\n\n• **Step 1 (Find d):** The numbers go up by 5 every time. d = 5.\n• **Step 2:** Start with **5n**.\n• **Step 3 (Find c):** The number before the first '7' would be 2 (because 7 - 5 = 2). c = +2.\n• **Step 4 (The Formula):** Our formula is **5n + 2**.\n• **Step 5 (Predict):** To find the 50th term, replace 'n' with 50. \n  Calculation: 5(50) + 2 = 250 + 2 = **252**.\n\n**Final Answer: The 50th term is 252.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When finding the 'nth term' formula for a sequence that is going *down* (e.g., 20, 16, 12...), the difference 'd' is NEGATIVE! The biggest mistake students make is writing '4n' instead of '-4n'. If the numbers are dropping, your 'n' MUST have a negative sign in front of it!" 
      }
    ]
  },
  pythag: {
    title: "Pythagoras' Theorem: The Right-Angled Secret",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Square Geometry", 
        content: "Over 2,500 years ago, a Greek mathematician named Pythagoras discovered a magical relationship hiding inside every single right-angled triangle in the universe. He realized that if you built a square on the two shorter sides of the triangle, the total area of those two small squares perfectly matched the area of a massive square built on the longest side. This theorem allows us to find the exact length of a missing side, as long as we know the other two!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: a² + b² = c²", 
        content: "The famous formula is **a² + b² = c²**.\n\n• **'c' is the Hypotenuse:** This is the absolute most important rule. 'c' MUST be the longest side of the triangle. It is always located directly opposite the 90° right angle. It never touches the right angle.\n• **'a' and 'b' are the Legs:** These are the two shorter sides that touch the 90° corner. It doesn't matter which one you call 'a' and which one you call 'b'." 
      },
      { 
        icon: "???", 
        title: "3. Step-by-Step: Solving the Puzzle", 
        content: "1. **Identify the Hypotenuse ('c'):** Find the longest side across from the right angle. Label it 'c'. Label the other two 'a' and 'b'.\n2. **Write the formula:** a² + b² = c²\n3. **Plug in your numbers:** Square the numbers you know.\n4. **Add or Subtract:** If you are finding the longest side ('c'), ADD the two squares together. If you are finding a shorter side ('a' or 'b'), SUBTRACT the smaller square from the bigger square.\n5. **The Final Key (Square Root):** Your answer right now is just a massive square. To find the actual length of the side, you MUST take the square root of your final number!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Hypotenuse", 
        content: "You have a right-angled triangle. One short side is 6cm, the other short side is 8cm. Find the longest side.\n\n• **Step 1:** The missing side is the hypotenuse ('c'). We know a = 6 and b = 8.\n• **Step 2:** Write it out: 6² + 8² = c²\n• **Step 3 (Square them):** 36 + 64 = c²\n• **Step 4 (Add):** 100 = c²\n• **Step 5 (Square Root):** If c² is 100, then 'c' is the square root of 100.\n\n**Final Answer: The longest side is 10cm.**" 
      },
      { 
        icon: "??", 
        title: "5. The Ultimate Pitfall", 
        content: "The most disastrous mistake students make is stopping at Step 4. They add 36 and 64, get 100, and say 'The longest side is 100cm!' Stop and use common sense: if the two short sides are 6cm and 8cm, how could the long side be 100cm? That would be a freakishly long, broken triangle! **ALWAYS remember to take the Square Root at the very end.**" 
      }
    ]
  },
  polygons: {
    title: "Polygons: The World of Many Sides",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Shapes with Rules", 
        content: "A polygon is any flat, 2D shape that is completely closed and made entirely of straight lines. A circle is not a polygon (it has curves). A shape with an open door is not a polygon (it's not closed). The word comes from Greek: 'poly' means 'many' and 'gon' means 'angles'. Triangles, squares, pentagons, and octagons are all members of the polygon family!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Regular vs. Irregular", 
        content: "• **Regular Polygons:** The perfectionists. Every single side is the exact same length, and every single interior angle is the exact same size. (e.g., a perfect Stop sign).\n• **Irregular Polygons:** The rebels. The sides are different lengths and the angles are all over the place. They might look squished or stretched out.\n• **The Exterior Angle Rule:** No matter how many sides a polygon has—whether it's 3 sides or 3,000 sides—all of its outer 'exterior' angles will ALWAYS add up to exactly **360°**." 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: The Interior Angle Formula", 
        content: "How do you find what all the inside angles of a polygon add up to? You split it into triangles!\n\n1. **The Formula:** Sum of Interior Angles = **(n - 2) × 180°**\n2. **What is 'n'?** 'n' is simply the number of sides the shape has.\n3. **Why (n-2)?** Because any polygon can be split into exactly 2 fewer triangles than it has sides. (A 5-sided pentagon can be split into 3 triangles).\n4. **Regular Polygons only:** If you want to find just ONE interior angle of a perfectly regular shape, take your total sum and divide it by 'n'." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Inside an Octagon", 
        content: "Find the sum of the interior angles of an Octagon, and then find the size of just ONE angle if the Octagon is regular.\n\n• **Step 1:** An Octagon has 8 sides. So, n = 8.\n• **Step 2:** Use the formula: (8 - 2) × 180°\n• **Step 3 (Calculate sum):** 6 × 180° = **1080°**.\n• **Step 4 (Find one angle):** Since it's a regular shape, all 8 angles share that 1080° equally. Divide 1080 by 8.\n\n**Final Answer: The total sum is 1080°. One interior angle is 135°.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Students often confuse the **Interior sum formula** with the **Exterior sum rule**. Remember: Exterior angles ALWAYS add up to 360°, no formulas needed! Only use the (n-2)×180 formula for the INSIDE angles. Also, if a question asks for the sum of the interior angles of a 12-sided shape, do NOT multiply 12 by 180. You must subtract 2 first! It's 10 × 180." 
      }
    ]
  },
  ratio: {
    title: "Mastering Ratios: The Art of Sharing",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Perfect Recipe", 
        content: "A ratio is simply a way of comparing parts of a whole to each other. Imagine making a smoothie: for every 2 cups of strawberries, you need 3 cups of milk. We write this as a ratio: **2:3**. It doesn't mean you only have 5 cups in total! It means no matter how massive the smoothie batch is, the *balance* between strawberries and milk must stay exactly the same. Ratios are the secret to keeping recipes, paint colors, and financial shares perfectly balanced." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Simplification and Order", 
        content: "• **Order is Everything:** If the question says 'the ratio of cats to dogs is 4:1', the 4 belongs to the cats, and the 1 belongs to the dogs. Never swap them!\n• **Simplifying:** Ratios behave exactly like fractions. If you have a ratio of 10:15, you can divide both numbers by 5 to simplify it down to a much cleaner **2:3**. Always give your final answer in its simplest form." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Sharing an Amount", 
        content: "The most common ratio puzzle is splitting a large amount of money or items into a specific ratio. Use the **ADAM** method:\n\n1. **A (Add):** Add the parts of the ratio together to find the TOTAL number of 'shares'. (e.g., for a 3:2 ratio, 3+2 = 5 total shares).\n2. **D (Divide):** Divide the big total amount (like ) by the number of shares. This tells you the value of exactly ONE share.\n3. **M (Multiply):** Multiply the value of one share by each number in the original ratio to find out how much each person actually gets!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Splitting the Treasure", 
        content: "Alex and Bella share  in the ratio 4:3. How much money does Alex get?\n\n• **Step 1 (Add):** Find total shares. 4 + 3 = 7 total shares.\n• **Step 2 (Divide):** Find the value of one share.  ÷ 7 = . (One share is worth ).\n• **Step 3 (Multiply):** Alex has 4 shares. So, Alex gets 4 ×  = ****.\n\n*(Bonus check: Bella gets 3 ×  = . And  +  = . Perfect!)*" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A devastating mistake happens when students are given the value of just ONE person's share, rather than the total. For example: 'Alex and Bella share money 4:3. Bella gets .' Students will blindly divide  by 7 (the total shares). **WRONG!** The  only belongs to Bella's 3 shares. You should divide  by 3 to find the value of one share (). Always read carefully: were you given the TOTAL amount, or just a PART?" 
      }
    ]
  },
  vocab: {
    title: "Math Vocabulary: Speaking the Language",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Secret Code of Math", 
        content: "Mathematics is quite literally a foreign language. When a question asks you for the 'product' of two numbers, it's not asking you to build something in a factory! It's a secret code asking you to multiply them. If you don't know the vocabulary, you can't even begin to solve the puzzle, no matter how good you are at calculating. Mastering math vocab is like being handed the translation dictionary for the entire universe." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Big Four", 
        content: "You must memorize the special names for the answers to the four basic operations:\n\n• **Sum:** The answer when you ADD things together. (The sum of 4 and 2 is 6).\n• **Difference:** The answer when you SUBTRACT. (The difference between 10 and 3 is 7).\n• **Product:** The answer when you MULTIPLY. (The product of 5 and 4 is 20).\n• **Quotient:** The answer when you DIVIDE. (The quotient of 20 and 5 is 4)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Translating Word Problems", 
        content: "When faced with a massive, terrifying paragraph of text, follow these steps to translate it into simple math:\n\n1. **Highlight the numbers:** Circle every number you see.\n2. **Hunt for trigger words:** Look for words like 'more than' (+), 'less than' (-), 'of' (usually multiply), or 'per' (usually divide).\n3. **Identify the unknown:** Find the word 'what' or 'find' to figure out what your variable 'x' should represent.\n4. **Write the equation:** Translate the English sentence directly into a math equation before doing any calculating." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Translation", 
        content: "Translate this sentence into math: 'Five less than the product of a number and three is exactly sixteen.'\n\n• **Step 1:** Let 'a number' be represented by the letter **x**.\n• **Step 2:** 'The product of a number and three' means multiply them: **3x**.\n• **Step 3:** 'Five less than' that product means we must subtract 5 from it: **3x - 5**.\n• **Step 4:** 'Is exactly sixteen' means equals 16.\n\n**Final Translation: 3x - 5 = 16.** (Now it's easy to solve!)" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The phrase **'less than'** is the deadliest trap in word problems. If I say 'What is 2 less than 10?', the answer is obviously 8. You did 10 - 2. Notice that the order FLIPPED! The 2 was mentioned first in English, but went SECOND in the math. When translating '5 less than x', students often write '5 - x'. This is completely wrong! It must be **x - 5**. Always flip the order when you see 'less than'." 
      }
    ]
  },
  diffeq: {
    title: "Differential Equations: Modeling Change",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Math of Motion", 
        content: "Most algebraic equations (like x + 5 = 10) are like taking a single photograph—they capture a static, frozen moment in time. But the real world is constantly moving, flowing, and changing! **Differential Equations** are the mathematics of video cameras. They are equations that describe how things *change* over time. From a cup of coffee cooling down, to a rocket accelerating into space, to a virus spreading through a population—if it changes, a differential equation can model it." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Derivatives as Rates", 
        content: "The defining feature of a differential equation is that it contains a **Derivative** (like dy/dx or y').\n\n• **dy/dx** simply means 'the rate of change of y, with respect to x'. \n• If y is distance and x is time, then dy/dx is exactly equal to your Speed!\n• Unlike normal algebra where the answer is a single number (x = 3), the answer to a differential equation is an entire **Function** (a curve on a graph, like y = 3x² + 2) that describes the entire journey." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Separation of Variables", 
        content: "The easiest way to solve basic differential equations is a trick called 'Separation of Variables':\n\n1. **Quarantine the variables:** Use algebra to push all the 'y' terms (and dy) to the left side of the equals sign, and all the 'x' terms (and dx) to the right side.\n2. **Integrate both sides:** Once separated, put a giant Integration symbol (?) in front of both sides.\n3. **Perform the integration:** Solve both integrals normally.\n4. **Don't forget the +C:** You only need to add one Constant of Integration (+C) to the right side.\n5. **Isolate y:** Rearrange the final equation to get 'y =' by itself." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Solving a Model", 
        content: "Solve the differential equation: **dy/dx = 2x / y**\n\n• **Step 1 (Separate):** Multiply both sides by y, and multiply both sides by dx. We get: **y dy = 2x dx**.\n• **Step 2 (Integrate):** Add the symbols: **? y dy = ? 2x dx**\n• **Step 3 (Solve integrals):** The integral of y is **½y²**. The integral of 2x is **x²**.\n• **Step 4 (Add C):** ½y² = x² + C\n• **Step 5 (Isolate y):** Multiply everything by 2. We get y² = 2x² + 2C. (Since 2C is still just an unknown constant, we can just call it K). Then take the square root.\n\n**Final Answer: y = ±v(2x² + K)**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A lethal mistake during 'Separation of Variables' is trying to move terms using addition or subtraction. **You can ONLY separate variables using multiplication or division!** If your equation is dy/dx = x + y, you CANNOT just subtract y to the other side to get dy/dx - y = x. That ruins the integration step. If you can't separate them using pure multiplication/division, you have to use a much more advanced technique!" 
      }
    ]
  },
  complex: {
    title: "Complex Numbers: Unlocking the Imaginary",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Impossible Number", 
        content: "For years, mathematicians hit a brick wall: what is the square root of -9? You can't multiply a positive by a positive to get a negative, and a negative times a negative is ALSO positive. It seemed impossible. So, mathematicians simply invented a new dimension! They defined the square root of -1 as a new, 'imaginary' number called **i**. By combining real numbers (like 4) with imaginary numbers (like 3i), we create a **Complex Number** (4 + 3i). These aren't just fantasy—they are absolutely essential for quantum physics and designing electrical circuits!" 
      },
      { 
        icon: "?", 
        title: "2. The Rules: The Power of 'i'", 
        content: "Every complex number has a standard form: **z = a + bi**\n• 'a' is the real part (normal numbers).\n• 'bi' is the imaginary part.\n\nThe single most important rule to memorize in this entire topic is the core definition of i:\n**i = v-1**, which means that **i² = -1**.\nWhenever you are doing math and you see an i², you must instantly erase it and replace it with a -1. It is the magic key that turns imaginary math back into real math!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Division and the Conjugate", 
        content: "Adding and multiplying complex numbers is just like normal algebra. But DIVISION is weird. You aren't allowed to leave an 'i' in the denominator of a fraction. To destroy it, we use the **Complex Conjugate**:\n\n1. Look at the bottom of the fraction (e.g., 3 + 2i).\n2. Find its conjugate by flipping the sign of the middle imaginary part (it becomes 3 - 2i).\n3. Multiply BOTH the top and the bottom of the fraction by this conjugate.\n4. When you FOIL the bottom, the middle 'i' terms will beautifully cancel out, and the i² will turn into a -1, leaving you with a perfectly real number on the bottom!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Multiplying Complex Numbers", 
        content: "Expand and simplify: **(2 + 3i)(4 - i)**\n\n• **First:** 2 × 4 = **8**\n• **Outer:** 2 × -i = **-2i**\n• **Inner:** 3i × 4 = **+12i**\n• **Last:** 3i × -i = **-3i²**\n• **Combine:** We have 8 + 10i - 3i².\n• **The Magic Trick:** We know i² is actually -1! So -3(-1) becomes +3.\n• **Final Step:** 8 + 10i + 3. Add the real numbers together.\n\n**Final Answer: 11 + 10i**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The classic mistake happens when finding the 'Modulus' (length) of a complex number, written as |z|. The formula is v(a² + b²). Notice there is NO 'i' in that formula! If z = 3 - 4i, students often plug in (-4i) and square it, resulting in 16i², which becomes -16, ruining the whole calculation. **'b' is just the coefficient!** It is just the -4. You square -4 to get 16. Never put the 'i' into the modulus formula!" 
      }
    ]
  },
  stats: {
    title: "Statistics: Making Sense of Data",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Story in the Numbers", 
        content: "Imagine trying to understand the test scores of an entire country—millions of numbers staring back at you. It's impossible for a human brain to process. **Statistics** is the science of crushing mountains of raw data down into a few, powerful summary numbers that tell a clear story. It helps us find the 'average' experience, spot wild anomalies (outliers), and predict future trends. It is the math of reality." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Three Averages", 
        content: "When people say 'average', they usually mean the Mean. But there are actually three distinct types of averages, and choosing the right one is crucial:\n\n• **The Mean:** Add all numbers together and divide by how many there are. (Best for normal data, easily ruined by extreme outliers).\n• **The Median:** Line all the numbers up in order from smallest to largest, and pick the one exactly in the middle. (Best when dealing with wildly unfair data, like house prices).\n• **The Mode:** The number that appears the MOST often. (Best for non-numerical data, like finding the most popular shoe size in a store)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Measuring the Spread (Range & IQR)", 
        content: "Knowing the 'average' isn't enough. You need to know how scattered the data is! If the average temperature is 20°C, is it 20°C every day, or is it 40°C in summer and 0°C in winter? \n\n1. **The Range:** Simply subtract the lowest value from the highest value. This gives the total spread, but it's easily skewed by one crazy outlier.\n2. **The Interquartile Range (IQR):** This is much better. It measures the spread of the middle 50% of the data, ignoring the extreme highs and lows. \n3. **Find IQR:** Find the Median (Q2). Find the median of the lower half (Q1). Find the median of the upper half (Q3). Then do Q3 - Q1!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Median", 
        content: "Find the Median of this dataset: **12, 5, 20, 8, 15**\n\n• **Step 1 (The Trap):** Do NOT pick the middle number yet! You MUST put them in order first.\n• **Step 2 (Sort):** 5, 8, 12, 15, 20.\n• **Step 3 (Find the middle):** Cross one off each end until you hit the center. The number left perfectly in the middle is 12.\n*(Note: If there are TWO numbers left in the middle, you must add them together and divide by 2 to find the halfway point between them).*\n\n**Final Answer: The Median is 12.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When calculating the Mean from a **Frequency Table** (a table that says, for example, a score of 5 happened 4 times), students always make a massive error. They just add up the score column (1+2+3+4+5) and divide it. **WRONG!** You have to multiply the score by its frequency first! If a score of 5 happened 4 times, that's worth 20 points in total. You must create an 'f × x' column, add that up, and divide by the total frequency." 
      }
    ]
  },
  integ: {
    title: "Integration: The Art of Accumulation",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Slicing the Universe", 
        content: "Imagine trying to find the area of an awkwardly shaped pond. You can't use length × width because the edges are curvy! **Integration** solves this by slicing the pond into millions of infinitely thin, perfectly straight rectangles. It calculates the area of each microscopic rectangle, and then adds them all up to give you the perfect, exact area of the curvy shape. It is the mathematical art of accumulation—adding up an infinite amount of tiny things to find the whole." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Anti-Derivative", 
        content: "Integration is the exact opposite of Differentiation. If differentiation breaks a function apart to find its speed (gradient), integration glues it back together to find its distance (area).\n\n• **The Power Rule for Integration:** Instead of multiplying and subtracting from the power, you do the reverse! **Add 1 to the power, then divide by that new power.**\n• Example: To integrate x², the power becomes 3, and you divide by 3. The answer is (x³)/3." 
      },
      { 
        icon: " boundaries", 
        title: "3. Step-by-Step: Definite Integrals (Finding Area)", 
        content: "To find the exact physical area under a curve between two specific points on the x-axis (called the upper limit 'b' and lower limit 'a'):\n\n1. **Integrate:** Perform the integration rule on the function. Put the result in square brackets [ ].\n2. **Plug in Upper (b):** Take the top boundary number and substitute it into your new integrated equation. Get a value.\n3. **Plug in Lower (a):** Take the bottom boundary number and substitute it into the same integrated equation. Get a second value.\n4. **Subtract:** Subtract the lower value from the upper value (Upper - Lower). That's your exact area!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Indefinite Integration", 
        content: "Integrate the expression: **? (6x² + 4x - 5) dx**\n\n• **Step 1 (First term):** For 6x², add 1 to the power (becomes 3). Divide the big 6 by 3 to get 2. Result: **2x³**.\n• **Step 2 (Second term):** For 4x (which is 4x¹), add 1 to the power (becomes 2). Divide the 4 by 2 to get 2. Result: **2x²**.\n• **Step 3 (Third term):** For -5 (a constant), just slap an 'x' onto it. Result: **-5x**.\n• **Step 4 (The Plus C):** Because there are no boundaries, we MUST add a constant of integration at the end.\n\n**Final Answer: 2x³ + 2x² - 5x + C**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The absolute most common way to lose marks in a calculus exam is **forgetting the '+ C'** on an indefinite integral. When you differentiate a constant number (like +7), it vanishes to zero. So when you integrate back in reverse, you have no idea if there was originally a +7, a -40, or nothing there at all! You MUST write + C to represent that unknown vanished number. Without boundaries to anchor it, the +C is mandatory." 
      }
    ]
  },
  guess: {
    title: "Trial and Improvement: Closing the Gap",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Mathematical Sniper", 
        content: "Some equations are so incredibly complicated (like x³ + 5x = 42) that normal algebraic rules like factoring or using formulas completely break down. There is no magic key to solve them! Instead, we use a brute-force method called **Trial and Improvement**. You act like an artillery sniper: you fire a mathematical 'guess' at the target, see if your shot lands too high or too low, adjust your aim, and fire again until you hit the bullseye with absolute precision." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Bracket System", 
        content: "Trial and improvement isn't just randomly guessing numbers in your head; it is a highly structured, organized process.\n\n• You must ALWAYS set up a clear table with three columns: **'x' (Your Guess)**, **'Calculation'**, and **'Comment (Too Big/Too Small)'**.\n• Once you find one number that is 'Too Big' and one that is 'Too Small', you know your answer is trapped somewhere in the middle! You have bracketed your target." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Zeroing In", 
        content: "Let's say we know the answer is trapped between x=3 (too small) and x=4 (too big).\n\n1. **Go down the middle:** Your next guess MUST be exactly halfway between them. Guess x = 3.5.\n2. **Assess the shot:** If 3.5 is 'Too Small', the answer is trapped between 3.5 and 4. If 3.5 is 'Too Big', it's trapped between 3.0 and 3.5.\n3. **Increase precision:** Go halfway again. (e.g., 3.6, 3.7...). Keep narrowing the bracket.\n4. **The Final Check:** If a question asks for '1 decimal place', you MUST do one final calculation at the 2-decimal-place halfway mark (like 3.65) to prove whether the true answer rounds up or rounds down." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Root", 
        content: "Solve **x³ - x = 20** to 1 decimal place. We know the answer is between 2 and 3.\n\n• **Guess 2:** (2)³ - 2 = 6. (Target is 20). **Too Small.**\n• **Guess 3:** (3)³ - 3 = 24. **Too Big.**\n• *(We are bracketed! Go halfway)*\n• **Guess 2.5:** (2.5)³ - 2.5 = 13.125. **Too Small.**\n• **Guess 2.8:** (2.8)³ - 2.8 = 19.152. **Too Small.**\n• **Guess 2.9:** (2.9)³ - 2.9 = 21.489. **Too Big.**\n• *(Answer is between 2.8 and 2.9. We must test 2.85 to see which one it's closer to!)*\n• **Guess 2.85:** (2.85)³ - 2.85 = 20.29. **Too Big.**\nSince 2.85 is too big, the true answer must be lower than 2.85. Therefore, it rounds DOWN to 2.8.\n\n**Final Answer: x = 2.8 (to 1 d.p.)**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The classic examiner's trap is skipping that final halfway check (like the 2.85 in the example above). Students often just look at 2.8 (which gave 19.1) and 2.9 (which gave 21.4), say to themselves '19.1 is closer to 20', and confidently write down 2.8. While that might work sometimes, you will score ZERO marks for your final answer without explicitly showing the calculation for that 5-digit halfway marker (2.85). Prove it rounds down!" 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch2)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 2 successfully written!');

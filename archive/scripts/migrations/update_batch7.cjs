const fs = require('fs');
const path = require('path');

const batch7 = {
  ineq: {
    title: "Inequalities: The Boundaries of Math",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: More Than One Answer", 
        content: "An equation like x = 5 is a sniper rifle; it has exactly one perfect target. An **Inequality** like x > 5 is a shotgun; it covers a massive, infinite area! It means x can be 6, 7, 100, or a million. Inequalities are used when we have limits, like a rollercoaster sign saying 'You must be taller than 120cm to ride' (Height > 120)." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Crocodile Mouth", 
        content: "• **> (Greater Than):** The mouth is open to the left. The left side is bigger. (e.g., 10 > 5).\n• **< (Less Than):** The mouth points to the left. The left side is smaller. (e.g., 2 < 8).\n• **= or =:** If there is a line underneath, it means 'or equal to'. You are allowed to be exactly that number.\n*(Trick: The crocodile always eats the bigger number!)*" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Solving like Equations", 
        content: "You solve inequalities almost exactly the same way you solve normal algebra equations. You use inverse operations to get 'x' by itself.\n\n1. Move the loose numbers first by adding or subtracting to both sides.\n2. Move the attached numbers by multiplying or dividing both sides.\n3. Keep the inequality symbol exactly where it is... **UNLESS you trigger the Golden Trap!**" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Golden Trap", 
        content: "Solve: **-3x > 12**\n\n• **Step 1:** The -3 is attached to the x by multiplication. To get x alone, we must divide both sides by -3.\n• **Step 2 (The Trap):** We are dividing by a NEGATIVE number. The Golden Rule of Inequalities states that whenever you multiply or divide by a negative number, the entire universe flips upside down! You MUST flip the symbol to face the other way!\n• **Step 3:** 12 ÷ -3 = -4. \n• **Step 4 (Flip):** The > becomes a <.\n\n**Final Answer: x < -4**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Forgetting to flip the symbol when dividing by a negative is the number one reason students fail this topic. Let's prove why it's necessary: We know that 10 > 5. If we divide both sides by -1, we get -10 and -5. If we don't flip the symbol, it says -10 > -5. That is completely false! -10 is colder and smaller than -5. We MUST flip the symbol to make it true: -10 < -5. Always flip the mouth when crossing over to the negative side!" 
      }
    ]
  },
  invtrig: {
    title: "Inverse Trigonometry: Finding the Angle",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Backward Spell", 
        content: "Normal trigonometry (Sin, Cos, Tan) is a machine where you input an angle, and it spits out the ratio of two sides. But what if you have a triangle where you know the lengths of the sides, but the angle is a complete mystery? You need to run the machine in reverse! **Inverse Trigonometry** (Sin?¹, Cos?¹, Tan?¹) takes the ratio of the sides and magically spits out the missing angle." 
      },
      { 
        icon: "???", 
        title: "2. The Rules: SOH CAH TOA Returns", 
        content: "You still must label your triangle correctly relative to the missing angle ?:\n\n• **H (Hypotenuse):** The longest side, opposite the 90° corner.\n• **O (Opposite):** The side looking directly at the missing angle ?.\n• **A (Adjacent):** The side touching the missing angle ?.\nIdentify which two sides you actually have numbers for, and pick S, C, or T!" 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: The Calculator Shift", 
        content: "1. Label H, O, A.\n2. Look at the two sides you know. (e.g., I know O and A).\n3. Pick the rule. (O and A means TOA: Tangent).\n4. Write the fraction: Tan(?) = Opposite ÷ Adjacent.\n5. To get ? by itself, move 'Tan' to the other side. It transforms into its evil twin, **Tan?¹** (Inverse Tan).\n6. Hit 'Shift' or '2nd' on your calculator, press Tan, and type the fraction in the brackets." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Incline", 
        content: "A ramp is 5 meters long (Hypotenuse). The height of the ramp is 3 meters (Opposite). Find the angle of the ramp (?).\n\n• **Step 1:** We have H (5) and O (3). This means we must use Sine (SOH).\n• **Step 2 (The Equation):** Sin(?) = O / H = 3 / 5.\n• **Step 3 (The Decimal):** 3 ÷ 5 = 0.6. So, Sin(?) = 0.6.\n• **Step 4 (The Inverse):** To find ?, we do Sin?¹(0.6).\n• **Step 5 (Calculate):** Press Shift + Sin on the calculator, type 0.6, hit equals.\n\n**Final Answer: The angle ? is 36.87°.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Students often see Sin?¹ on their calculator and assume the '-1' power means they should calculate 1 ÷ Sin(?). **NO!** In trigonometry, the -1 is just a symbol that means 'Inverse function'. (1 ÷ Sin is a completely different advanced math concept called Cosecant). Never try to do inverse trig manually with fractions. You MUST use the Shift/2nd button on your calculator to activate the inverse spell." 
      }
    ]
  },
  limits: {
    title: "Limits: The Edge of Infinity",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Approaching the Void", 
        content: "What happens if you try to calculate the speed of a car at an exact freeze-frame of 0 seconds? You end up doing 0 divided by 0, and the math literally breaks down into a black hole. **Limits** are a clever trick to peek into that black hole. Instead of asking 'What is the answer EXACTLY at zero?', a Limit asks 'What answer are we getting closer and closer to as we *approach* zero?' It is the foundation of all advanced Calculus." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Danger Zone", 
        content: "When evaluating a limit (written as 'lim x?a'), your first instinct should always be to just plug the number 'a' directly into the 'x'.\n\n• If you get a normal number (like 5), you're done! That's the answer.\n• If you get **0 / 0** (called an Indeterminate Form), you have hit the danger zone! The math is broken. You cannot stop here; you must use algebra to fix the equation before trying again." 
      },
      { 
        icon: "???", 
        title: "3. Step-by-Step: The Factoring Rescue", 
        content: "If direct substitution gives you 0/0, the most common rescue method is Factoring:\n\n1. Look at the top and bottom of the fraction.\n2. Factorise the quadratics or pull out common terms. (Usually, the top is a 'Difference of Two Squares' like x² - 9, which becomes (x+3)(x-3)).\n3. Look for matching brackets on the top and bottom, and brutally cancel them out!\n4. Now that the problematic chunk is destroyed, try plugging your limit number in again." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Fixing the Black Hole", 
        content: "Evaluate: **lim (x?3) [ (x² - 9) / (x - 3) ]**\n\n• **Step 1 (The Trap):** If we plug in 3 right now, we get (9-9)/(3-3) = 0/0. Broken!\n• **Step 2 (Factor the top):** x² - 9 is a Difference of Two Squares. It factors perfectly into (x + 3)(x - 3).\n• **Step 3 (Cancel):** The equation is now [ (x+3)(x-3) / (x-3) ]. The (x-3) on top cancels out the (x-3) on the bottom!\n• **Step 4 (The Survivor):** We are left with just **(x + 3)**.\n• **Step 5 (Retry):** Now plug the limit (x=3) into the survivor. 3 + 3 = 6.\n\n**Final Answer: The limit is 6.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest mistake in limits is assuming that getting '0/0' means the answer is 0. Or assuming it means the answer is 'Undefined' or 'Infinity'. **0/0 means absolutely nothing!** It is a mathematical error sign telling you 'Try harder, use algebra'. Never write 0/0 as your final answer on a test. You must factor, cancel, or rationalize to reveal the true hidden number." 
      }
    ]
  },
  lineareq: {
    title: "Linear Equations: Solving the Mystery",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Balance Scale", 
        content: "A linear equation is a puzzle where an unknown number (called 'x') is hiding behind a bunch of arithmetic operations. Your job is to strip away those operations one by one until 'x' stands completely naked and alone. Think of the equals sign (=) as the pivot point of a perfectly balanced scale. Whatever you do to one side of the scale, you MUST do to the exact same thing to the other side to keep it from crashing down." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Inverse Operations", 
        content: "To strip away the operations, you must use their magical opposites (Inverse Operations):\n\n• To destroy an Addition (+), you must Subtract (-).\n• To destroy a Subtraction (-), you must Add (+).\n• To destroy a Multiplication (×), you must Divide (÷).\n• To destroy a Division (÷), you must Multiply (×)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Peeling the Onion", 
        content: "Always peel an equation from the outside in!\n\n1. **Expand Brackets:** If there are any brackets, multiply the outside number by everything inside to destroy them.\n2. **Gather the x's:** If there are 'x's on both sides of the equals sign, move the smaller pile of 'x's over to the larger pile by subtracting them.\n3. **Remove loose numbers:** Add or subtract away any normal numbers sitting next to your 'x' pile.\n4. **The Final Strike:** Divide by the number directly attached to 'x' to find your answer." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Two-Sided Battle", 
        content: "Solve: **5x - 4 = 2x + 11**\n\n• **Step 1 (Gather x's):** We have 5x on the left and 2x on the right. 2x is smaller. Subtract 2x from BOTH sides.\n   *(5x - 2x) = 3x. The equation is now 3x - 4 = 11.*\n• **Step 2 (Loose numbers):** The -4 is annoying. Add 4 to BOTH sides.\n   *(11 + 4) = 15. The equation is now 3x = 15.*\n• **Step 3 (Final Strike):** Divide both sides by 3.\n   *(15 ÷ 3) = 5.*\n\n**Final Answer: x = 5.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most common and frustrating mistake is dealing with a fraction like **(x + 5) / 3 = 7**. Students will immediately try to subtract 5. **WRONG!** The divide-by-3 is acting like a giant prison bar trapping the entire (x + 5) together. You cannot touch the 5 until you break the prison! You must multiply BOTH sides by 3 first (getting x + 5 = 21), and THEN you can safely subtract the 5." 
      }
    ]
  },
  lineqgym: {
    title: "Linear Equations Gym: Speed Solving",
    blocks: [
      { 
        icon: "??????", 
        title: "1. The Core Concept: The Flow State", 
        content: "In the Linear Equations Gym, knowing the theory isn't enough; you must execute the steps flawlessly without pausing to think. It's about building a 'flow state' where moving numbers across the equals sign and flipping their operations becomes pure muscle memory." 
      },
      { 
        icon: "?", 
        title: "2. The Strategy: The Mental Hop", 
        content: "Instead of writing '- 4' under both sides of the equation (which takes time), train yourself to visually 'hop' the number across the equals sign. When a number hops the fence, its sign magically flips. A +4 on the left instantly lands as a -4 on the right. This mental hop saves massive amounts of time during high-speed tests." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Two-Step Rhythm", 
        content: "Almost all basic linear equations (like 4x + 7 = 31) follow a perfect two-step rhythm: \n1. **Hop and Flip:** Hop the +7 over. It becomes -7. Calculate (31 - 7 = 24).\n2. **The Drop:** Drop the 4 underneath the 24 to divide. Calculate (24 ÷ 4 = 6).\nHop, Drop, Done." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Mental Execution", 
        content: "Quickly solve **6x - 5 = 19** in your head.\n\n• **Mental Step 1 (The Hop):** Hop the -5 to the right. It flips to +5.\n• **Mental Step 2 (Calculate):** 19 + 5 = 24.\n• **Mental Step 3 (The Drop):** Drop the 6 underneath the 24.\n• **Mental Step 4 (Calculate):** 24 ÷ 6 = 4.\n\n**Final Answer: x = 4.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Under pressure, students often mess up the 'Drop' step if the answer is going to be a fraction or a decimal. If they get to 5x = 2, they panic, because 2 doesn't divide nicely by 5. In their panic, they reverse the division and do 5 ÷ 2 to get 2.5. **FATAL ERROR!** The number attached to the x ALWAYS drops to the BOTTOM of the fraction. The answer is 2 ÷ 5 (or just the fraction 2/5). Never flip the division just because the math looks ugly!" 
      }
    ]
  },
  log: {
    title: "Logarithms: The Power Hunters",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Finding the Missing Power", 
        content: "If I ask '10 to what power equals 100?', you instantly know the answer is 2 (because 10² = 100). But what if I ask '10 to what power equals 50?' That's incredibly hard! The answer is a messy decimal. A **Logarithm (Log)** is a magical mathematical tool designed specifically to hunt down missing powers. A Logarithm literally *is* a power." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Circle of Life", 
        content: "Every Logarithm equation can be translated into a normal Exponent equation using the 'Circle of Life' motion:\n\n• The equation **Log2(8) = 3** means 'The Base 2, raised to the Power of 3, equals 8'.\n• Start at the tiny base (2), circle around to the answer (3), and point back to the big number (8).\n• **2³ = 8.** They are the exact same statement written in two different languages!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Three Log Laws", 
        content: "Because Logs ARE powers, they follow the exact same rules as Indices (exponents):\n\n1. **The Addition Law:** Log(A) + Log(B) = Log(A × B). (Adding logs means you multiply the insides).\n2. **The Subtraction Law:** Log(A) - Log(B) = Log(A ÷ B). (Subtracting logs means you divide the insides).\n3. **The Power Drop:** Log(A³) = 3 × Log(A). If the inside number has a power, you are allowed to take that power and drop it to the very front of the log to multiply it!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Expanding Logs", 
        content: "Expand and simplify the expression: **Log(100x³)** (Assume Base 10).\n\n• **Step 1 (The Multiply Split):** The inside is 100 MULTIPLIED by x³. Using the Addition Law, we can split them apart: Log(100) + Log(x³).\n• **Step 2 (The Power Drop):** On the second term, drop the little 3 to the front: + 3Log(x).\n• **Step 3 (Solve the number):** What is Log10(100)? It asks '10 to what power is 100?'. The answer is 2!\n\n**Final Answer: 2 + 3Log(x)**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "A catastrophic mistake is thinking that Log(A + B) is equal to Log(A) + Log(B). **THIS IS COMPLETELY FALSE!** You cannot distribute a Log like a normal algebraic bracket! Log(10 + 10) does NOT equal Log(10) + Log(10). The Log laws ONLY work when you are multiplying or dividing inside the bracket, or adding/subtracting completely separate Logs. Never distribute a Log over addition!" 
      }
    ]
  },
  percent: {
    title: "Percentages: The Hundredth Rule",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Universal Standard", 
        content: "If one student gets 14/20 on a test, and another gets 38/50, who did better? It's hard to compare them because the total marks are different! **Percentages** fix this by forcing every single test in the world to be graded out of 100. 'Percent' translates to 'per 100'. By translating fractions into a standard out of 100, we can instantly compare any two things fairly." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Decimal Conversion", 
        content: "Percentages are useless for actual calculations; they must be transformed into Decimals first.\n\n• **Percentage to Decimal:** Divide by 100. (Move the decimal point two spots to the left). 45% becomes 0.45. \n• **The Danger Zone:** Single-digit percentages! 7% does NOT become 0.7. It becomes **0.07**. (0.7 is 70%!).\n• The word 'OF' in math means MULTIPLY. To find 20% OF 80, you calculate 0.20 × 80." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Percentage Increase / Decrease", 
        content: "If a  shirt increases in price by 15%, use the Multiplier Method:\n\n1. Start at 100%.\n2. If it's an INCREASE, add the percentage. (100 + 15 = 115%).\n3. If it's a DECREASE, subtract the percentage. (e.g., 20% off sale: 100 - 20 = 80%).\n4. Turn your new total into a decimal multiplier. (115% = 1.15).\n5. Multiply the original price by the multiplier! ( × 1.15)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Finding the Change", 
        content: "A town's population was 8,000. It grew to 9,600. What was the percentage increase?\n\n• **Step 1 (Find the Change):** How much did it grow? 9,600 - 8,000 = 1,600 people.\n• **Step 2 (The Fraction):** Create a fraction: (Change ÷ ORIGINAL Amount).\n• **Step 3 (Plug in):** 1600 ÷ 8000.\n• **Step 4 (Calculate Decimal):** 1600 ÷ 8000 = 0.20.\n• **Step 5 (Convert to %):** Multiply by 100. 0.20 × 100 = 20.\n\n**Final Answer: The population increased by 20%.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When calculating percentage change (like the town population above), the absolute most common mistake is putting the NEW number on the bottom of the fraction (1600 ÷ 9600). This will give you 16.6%, which is completely wrong! **The bottom of the fraction MUST always be the ORIGINAL starting number.** Percentages are always a measure of how much the *original* thing changed." 
      }
    ]
  },
  permcomb: {
    title: "Permutations & Combinations: The Math of Choice",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Counting the Possibilities", 
        content: "If you have 10 friends, but you can only invite 3 to your party, how many different groups of friends could you possibly make? What if you are choosing a President, Vice President, and Secretary out of 10 people? This is Combinatorics! It is the mathematics of counting massive numbers of possibilities without actually having to write them all down and count them one by one." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Order vs. Chaos", 
        content: "The entire topic rests on one massive question: **Does the order matter?**\n\n• **Permutations (The Lock):** ORDER MATTERS! Think of a combination lock. The code '1-2-3' is completely different from '3-2-1'. They are two separate permutations. (President, VP, Secretary roles mean order matters).\n• **Combinations (The Salad):** ORDER DOES NOT MATTER! If you make a salad with lettuce, tomatoes, and carrots, it's the exact same salad as carrots, tomatoes, and lettuce. The order is irrelevant. (Just picking 3 friends for a party is a combination)." 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: The Factorial Trick (!)", 
        content: "To solve these, we use **Factorials**, written as an exclamation mark (!). \n5! means 5 × 4 × 3 × 2 × 1 = 120.\n\n• **Permutation Formula (nPr):** n! / (n-r)!\n• **Combination Formula (nCr):** n! / [ r! × (n-r)! ]\n• 'n' is the TOTAL number of items you have to choose from.\n• 'r' is how many items you are actually choosing.\n*(The nCr formula divides by an extra r! to 'delete' all the duplicate mixed-up orders!)*" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Committee", 
        content: "You have 6 students. You must select a random committee of 2 students to organize a dance. How many possible committees are there?\n\n• **Step 1 (Order test):** Does order matter? No. John & Sarah is the same committee as Sarah & John. We must use Combinations (nCr).\n• **Step 2 (Identify n and r):** n = 6 (total students). r = 2 (students chosen).\n• **Step 3 (The Formula):** 6! / [ 2! × (6-2)! ]\n• **Step 4 (Simplify):** 6! / [ 2! × 4! ].\n• **Step 5 (Cancel out):** The 6! (6×5×4×3×2×1) divided by 4! (4×3×2×1) perfectly cancels out everything from 4 downwards! We are left with just (6 × 5) on top, and 2! (2 × 1) on the bottom.\n• **Step 6 (Calculate):** 30 ÷ 2 = 15.\n\n**Final Answer: There are 15 possible committees.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The name 'Combination Lock' is a total lie! It is mathematically wrong! A padlock requires a very specific ORDER (1-2-3 won't open a lock set to 3-2-1). Therefore, it should be called a **Permutation Lock**! Remembering this fun fact is the best way to ensure you never mix up the definitions of Permutations (Order matters) and Combinations (Order doesn't matter) on a test." 
      }
    ]
  },
  polyfactor: {
    title: "Factoring Polynomials: The Reverse Explosion",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Un-baking the Cake", 
        content: "When you multiply (x+2)(x+3), it explodes into a polynomial: x² + 5x + 6. But what if you are given the messy x² + 5x + 6 and asked to put it back into its original neat brackets? That reverse process is called **Factoring**. Factoring is the ultimate mathematical superpower because once an equation is neatly boxed up in brackets, it becomes incredibly easy to solve and graph!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The Golden Question (Add/Multiply)", 
        content: "When factoring a standard quadratic like **x² + bx + c**, you don't need complicated math. You just need to solve a mental riddle. Ask yourself this one golden question:\n\n**'What two numbers MULTIPLY to make the last number (c), but ADD together to make the middle number (b)?'**\n\nOnce you find those two magic numbers, you just drop them into the two brackets: (x + number1)(x + number2)!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Cracking the Code", 
        content: "Factorise: x² - 2x - 15\n\n1. **The Target:** We need two numbers that MULTIPLY to make -15, and ADD to make -2.\n2. **List Factors:** What multiplies to 15? (1 and 15) or (3 and 5).\n3. **Test the Gap:** Which pair has a gap of 2 between them? The 3 and 5!\n4. **Fix the Signs:** We need them to add up to NEGATIVE 2. So the negative sign must go on the bigger number! We need -5 and +3.\n5. **Check it:** (-5) × (3) = -15. (-5) + (3) = -2. Perfect!\n6. **Build Brackets:** Write (x - 5)(x + 3)." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Difference of Two Squares", 
        content: "Factorise: **x² - 49**\n\n• **Step 1 (Spot the Pattern):** There is no middle 'x' term! And 49 is a perfect square (7×7). This is a famous pattern called the Difference of Two Squares.\n• **Step 2 (The Rule):** A² - B² ALWAYS factors into (A + B)(A - B).\n• **Step 3 (Find A and B):** The square root of x² is x. The square root of 49 is 7.\n• **Step 4 (Build Brackets):** One bracket gets a plus, the other gets a minus.\n\n**Final Answer: (x + 7)(x - 7).**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The absolute biggest mistake students make is diving straight into the double brackets without looking for a **Common Factor** first! If you see 2x² + 10x + 12, don't try to guess numbers that multiply to 12 and add to 10. Notice that ALL the numbers are even! Pull a massive 2 out of the whole thing first: 2(x² + 5x + 6). Now the inside is incredibly easy to factor into 2(x+2)(x+3). Always, always look to pull out common numbers before building brackets!" 
      }
    ]
  },
  polygym: {
    title: "Polynomials Gym: Rapid Factoring",
    blocks: [
      { 
        icon: "??????", 
        title: "1. The Core Concept: The Number Ninja", 
        content: "In advanced exams, factoring quadratics isn't the main question; it's just step 1 of a massive 5-step calculus problem. You cannot afford to spend 3 minutes thinking about what numbers multiply to 24 and add to 10. The **Polynomials Gym** forces your brain to memorize these common number pairs so you can factorise instantly." 
      },
      { 
        icon: "?", 
        title: "2. The Strategy: Sign Recognition", 
        content: "Before you even think about the numbers, look at the SIGNS (+ and -). They tell you everything you need to know about the brackets!\n\n• If the last number is POSITIVE (e.g., x² + 5x **+ 6**), the two brackets MUST have the exact SAME sign. (Look at the middle term to see if they are both + or both -).\n• If the last number is NEGATIVE (e.g., x² + x **- 12**), the two brackets MUST have DIFFERENT signs (one +, one -). No exceptions!" 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Mental Scan", 
        content: "1. Scan the last sign: is it + or -?\n2. Mentally load up the bracket templates: (x + )(x + ) or (x + )(x - ).\n3. Look at the last number and rapidly cycle its factors in your head (24 is 12&2, 8&3, 6&4).\n4. Pick the pair that hits the middle target number.\n5. Slap them into the brackets." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: High Speed Factoring", 
        content: "Mentally factorise **x² - 8x + 15** in 3 seconds.\n\n• **Mental Step 1 (Signs):** Last sign is +, so they match. Middle sign is -, so they are BOTH negative. Template: (x - )(x - ).\n• **Mental Step 2 (Factors):** Factors of 15 are 1&15 or 3&5.\n• **Mental Step 3 (Target):** We need to make -8. -3 and -5 makes -8!\n• **Mental Step 4 (Execute):** Write down (x - 3)(x - 5)." 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The trap of the number 12! When students see **x² - x - 12**, they panic and pick 6 & 2. (6 - 2 = 4, not 1!). Then they try 12 & 1. They forget about 4 & 3! When dealing with numbers like 12, 24, and 36, students often forget the factors sitting right in the middle of the times tables. Always check the 'middle' factors first!" 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch7)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 7 successfully written!');

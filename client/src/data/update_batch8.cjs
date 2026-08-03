const fs = require('fs');
const path = require('path');

const batch8 = {
  primefactor: {
    title: "Prime Factorization: The DNA of Math",
    blocks: [
      { 
        icon: "🧬", 
        title: "1. The Core Concept: The Atomic Breakdown", 
        content: "In chemistry, everything is made of atoms. You can break a water molecule down into Hydrogen and Oxygen, but you can't break those atoms down any further. In mathematics, **Prime Numbers** (2, 3, 5, 7, 11...) are the unbreakable atoms. Every single whole number in the universe is just a unique recipe of prime numbers multiplied together. Finding that secret recipe is called Prime Factorization." 
      },
      { 
        icon: "🌳", 
        title: "2. The Rules: The Factor Tree", 
        content: "To find the DNA of a large number, we build a Factor Tree.\n\n• Start with your massive number at the top.\n• Split it into ANY two numbers that multiply to make it.\n• Every time a branch hits a Prime Number, circle it! It is a dead end. That branch cannot grow anymore.\n• If a number is not prime (like 10), split it again (into 2 and 5).\n• Keep splitting until every single branch ends in a circled prime number." 
      },
      { 
        icon: "🔋", 
        title: "3. Step-by-Step: Writing the Recipe (Index Form)", 
        content: "Once the tree is finished, you must write the final answer properly.\n\n1. Gather all the circled prime numbers from the ends of the branches.\n2. Write them in order from smallest to largest with multiplication signs between them. (e.g., 2 × 2 × 2 × 3 × 5).\n3. **Index Form:** Mathematicians are lazy! Instead of writing 2 × 2 × 2, use indices (powers) to compress it! Write it as **2³ × 3 × 5**." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Breaking down 120", 
        content: "Find the prime factorization of 120 and write it in index form.\n\n• **Step 1 (First split):** 120 ends in 0, so 10 is an easy factor. Split it into 10 and 12.\n• **Step 2 (The 10):** Split 10 into 2 and 5. Both are prime! Circle them.\n• **Step 3 (The 12):** Split 12 into 3 and 4. 3 is prime! Circle it. \n• **Step 4 (The 4):** 4 is not prime! Split it into 2 and 2. Circle them both.\n• **Step 5 (Gather):** We have three 2s, one 3, and one 5.\n\n**Final Answer: 2³ × 3 × 5**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The most humiliating mistake is writing your final answer using Addition signs! Students will do all the hard work on the tree, find 2, 2, and 3, and then write the answer as 2 + 2 + 3. **WRONG!** Prime factorization is about what numbers MULTIPLY to make the target. (2+2+3 = 7, not 12!). Always use multiplication (×) signs between your prime atoms!" 
      }
    ]
  },
  quadratic: {
    title: "Quadratics: The U-Turn Curve",
    blocks: [
      { 
        icon: "🎢", 
        title: "1. The Core Concept: What Goes Up Must Come Down", 
        content: "Linear equations (y = 2x) make perfectly straight lines that shoot off into space forever. But if you throw a baseball, it doesn't fly straight forever; gravity pulls it back down in a perfect, symmetrical arc. That curving path is a **Quadratic Equation**! Any equation where the highest power of 'x' is 2 (like y = x²) creates this beautiful 'U-shaped' curve called a Parabola." 
      },
      { 
        icon: "🎯", 
        title: "2. The Rules: The Magic Roots", 
        content: "The most important parts of a parabola are the places where it crashes through the flat ground (the x-axis). These impact points are called the **Roots** or **Solutions**.\n\n• Because the curve is U-shaped, it usually hits the ground TWICE (2 solutions).\n• To find these roots algebraically, you MUST force the 'y' to equal ZERO. (e.g., x² + 5x + 6 = 0). Why? Because on the flat ground, the height (y) is exactly zero!" 
      },
      { 
        icon: "🗝️", 
        title: "3. Step-by-Step: Solving by Factoring", 
        content: "How to find the impact points without graphing:\n\n1. Ensure the equation equals 0. (If it equals 5, subtract 5 to bring it over to the left side!).\n2. Factorise the quadratic into double brackets (e.g., (x + 2)(x + 3) = 0).\n3. **The Zero Trick:** If two brackets multiply to make ZERO, one of the brackets MUST be zero! \n4. Split them up: Either (x + 2) = 0, or (x + 3) = 0.\n5. Solve the mini-equations to find your two roots: x = -2, or x = -3." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Finding the Roots", 
        content: "Solve: **x² - 8x + 12 = 0**\n\n• **Step 1:** It already equals zero. Ready to go.\n• **Step 2 (Factorise):** We need two numbers that multiply to +12 and add to -8. Those numbers are -6 and -2.\n• **Step 3 (Brackets):** Rewrite as (x - 6)(x - 2) = 0.\n• **Step 4 (Split):** Either (x - 6) = 0, OR (x - 2) = 0.\n• **Step 5 (Solve):** Move the numbers over.\n\n**Final Answer: The curve hits the ground at x = 6 and x = 2.**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The deadliest mistake is trying to factorise a quadratic BEFORE setting it equal to zero. If you have x² + 5x = 6, students will often factorise the left side to get x(x + 5) = 6. They then say 'x = 6' or 'x+5 = 6'. **THIS IS MATHEMATICALLY ILLEGAL!** The 'split' trick only works for ZERO. If A × B = 6, A could be 2, 3, 1, 6, 12, 0.5... it's infinite! You MUST move the 6 over to make it x² + 5x - 6 = 0 before building any brackets." 
      }
    ]
  },
  randommix: {
    title: "Random Mix: The Ultimate Test",
    blocks: [
      { 
        icon: "🌪️", 
        title: "1. The Core Concept: Chaos Training", 
        content: "In a normal math class, you do 20 algebra questions in a row. By question 3, your brain goes on autopilot. But in a real exam, Question 1 is geometry, Question 2 is statistics, and Question 3 is trigonometry! The **Random Mix** mode disables your autopilot. It throws completely unrelated topics at you back-to-back, training you for the chaos of a real exam." 
      },
      { 
        icon: "🧠", 
        title: "2. The Strategy: Context Switching", 
        content: "The hardest part of a Random Mix isn't the math; it's the 'Context Switch'. Your brain has to dump the geometry rules from its RAM and instantly load up the algebra rules. \n\nBefore you start calculating, take a 2-second pause. Ask yourself: 'What topic is this? What are the three golden rules of this topic?' Load the correct software into your brain before you press any buttons." 
      },
      { 
        icon: "🛡️", 
        title: "3. The Method: The Flagging System", 
        content: "When faced with 50 random questions, you will hit mental brick walls. If a question looks like an alien language, DO NOT spend 10 minutes staring at it! This causes panic. Flag it, skip it, and move on. Getting 10 easy questions right builds momentum and confidence, which actually makes the hard question easier when you circle back to it." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Mental Flexibility", 
        content: "Question 1: Find 20% of 50. (You instantly multiply 0.2 × 50 = 10).\nQuestion 2: Factorise x² - 9. (Your brain must snap from Percentages to Algebra: Difference of two squares! Answer: (x+3)(x-3)).\n\nThis rapid switching is exhausting, but it builds incredible neurological strength." 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The biggest pitfall in Random Mix is 'Rule Bleed'. Because you just did an algebra question, you might accidentally try to apply algebra rules to a geometry question. (Like trying to solve a side length using x instead of using Pythagoras). Always mentally wipe the whiteboard clean between questions!" 
      }
    ]
  },
  remfactor: {
    title: "Remainder & Factor Theorem: The Polynomial Hacker",
    blocks: [
      { 
        icon: "💻", 
        title: "1. The Core Concept: Skipping the Hard Work", 
        content: "If I ask you to divide a massive polynomial like (x³ + 4x² - 5x + 7) by (x - 2), you could use grueling Algebraic Long Division, which takes forever and is full of traps. But what if you only care about the *remainder*? The **Remainder Theorem** is a hacker's shortcut. It lets you find the exact remainder in 10 seconds flat, without doing any actual division at all!" 
      },
      { 
        icon: "🗝️", 
        title: "2. The Rules: The Magic Number", 
        content: "The trick relies on finding the 'magic root' of the bracket you are dividing by.\n\n• If you are dividing by **(x - 2)**, the magic number is **+2**.\n• If you are dividing by **(x + 5)**, the magic number is **-5**.\n• Whatever makes that bracket equal zero is your magic number! Take that number, plug it into the massive polynomial as 'x', and whatever number spits out the end is your Remainder!" 
      },
      { 
        icon: "🧩", 
        title: "3. Step-by-Step: The Factor Theorem", 
        content: "The **Factor Theorem** is just the Remainder Theorem's cooler brother. \n\n1. Use the Remainder Theorem (plug in the magic number).\n2. If the answer that spits out is exactly **ZERO**, congratulations! You just proved that the bracket is a perfect factor! (It divides cleanly with no leftover pieces).\n3. If it spits out anything other than zero, it is NOT a factor." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Hacking the Polynomial", 
        content: "Find the remainder when **f(x) = x³ - 2x² + 4** is divided by **(x - 3)**.\n\n• **Step 1 (Find the magic number):** We are dividing by (x - 3). The magic number is **+3**.\n• **Step 2 (The Substitution):** Evaluate f(3). Plug 3 into the polynomial.\n• **Step 3 (Calculate):** f(3) = (3)³ - 2(3)² + 4\n• **Step 4:** 27 - 2(9) + 4 = 27 - 18 + 4 = 13.\n\n**Final Answer: The remainder is 13.** *(No long division required!)*" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The classic trap is forgetting to FLIP THE SIGN when finding the magic number! If the question says 'Divide by (x + 4)', students will often plug in positive 4. **WRONG!** You must solve x + 4 = 0 to find the root. The magic number is -4. If you plug in the wrong sign, your entire calculation will explode." 
      }
    ]
  },
  rounding: {
    title: "Rounding & Estimating: The Art of the 'Good Enough'",
    blocks: [
      { 
        icon: "✂️", 
        title: "1. The Core Concept: Trimming the Fat", 
        content: "If someone asks how far you live from the city, you don't say '14.28574 kilometers'. You say 'About 14 kilometers'. **Rounding** is the mathematical art of throwing away useless, microscopic details to make numbers easier to read and communicate. However, you can't just hack numbers off randomly; there are strict rules to ensure the new number is as close to the truth as possible." 
      },
      { 
        icon: "⚖️", 
        title: "2. The Rules: The 'High Five' Rule", 
        content: "When rounding to a specific place (like 2 decimal places), look at the very next digit to the right (the 'decider').\n\n• If the decider is **0, 1, 2, 3, or 4**, the target number stays exactly the same (Round Down).\n• If the decider is **5, 6, 7, 8, or 9**, the target number is bumped up by one (Round Up).\n• Why does 5 round up? Because it's exactly halfway! Mathematicians agreed long ago that ties go to the winner (up)." 
      },
      { 
        icon: "🎯", 
        title: "3. Step-by-Step: Significant Figures (Sig Figs)", 
        content: "Rounding to 'Significant Figures' is for scientists dealing with massive or microscopic numbers.\n\n1. Start reading the number from the left. Skip any zeros until you hit the first real number (1-9). That is your **1st Significant Figure**.\n2. From there, count to the right (including zeros now!) until you hit the target number of figures.\n3. Look at the next digit to decide whether to round up or keep it the same.\n4. **CRITICAL:** If you are rounding a big number (like 4,872 to 1 sig fig = 5,000), you MUST fill the rest of the spaces with zeros to keep the number's massive size!" 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Scientific Rounding", 
        content: "Round **0.003482** to exactly 2 Significant Figures.\n\n• **Step 1 (Find the 1st):** Reading from left to right, skip the 0s. The first real number is **3**. That is the 1st sig fig.\n• **Step 2 (Find the 2nd):** The next digit is **4**. This is our target 2nd sig fig.\n• **Step 3 (The Decider):** Look at the digit immediately after the 4. It's an **8**.\n• **Step 4 (Round):** Because 8 is '5 or higher', we bump the 4 up to a 5.\n\n**Final Answer: 0.0035**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "When rounding massive whole numbers to significant figures, students often throw the zeros in the trash! If asked to round **87,421** to 2 sig figs, they look at the 8 and 7, use the 4 to round down (keep it 7), and write down the answer **87**. **WRONG!** You just turned an eighty-seven-thousand dollar car into an eighty-seven dollar toy! You MUST put placeholder zeros in the empty spaces to maintain the size. The answer is 87,000." 
      }
    ]
  },
  sdt: {
    title: "Speed, Distance, Time: The Travel Triangle",
    blocks: [
      { 
        icon: "🏎️", 
        title: "1. The Core Concept: The Physics of Motion", 
        content: "How long will a road trip take? How fast must a rocket fly to reach the moon in 3 days? All of these massive physics problems boil down to one beautiful, unbreakable relationship between three variables: **Speed, Distance, and Time (SDT)**. If you know any two of them, you can instantly find the third!" 
      },
      { 
        icon: "🔺", 
        title: "2. The Rules: The Magic Triangle", 
        content: "You don't need to memorize three different formulas; you just need to draw the Magic Triangle!\n\n• Draw a triangle. Put **D (Distance)** at the very top point.\n• Put **S (Speed)** and **T (Time)** next to each other at the bottom.\n• cover up the letter you want to find with your thumb.\n• If the two remaining letters are one over the other (D over T), you DIVIDE.\n• If the two remaining letters are next to each other (S next to T), you MULTIPLY." 
      },
      { 
        icon: "⏳", 
        title: "3. Step-by-Step: The Decimal Time Trap", 
        content: "The math is easy, but the TIME units are deadly!\n\n1. If you calculate a time and get **2.5 hours**, this does NOT mean 2 hours and 50 minutes!\n2. There are 60 minutes in an hour, not 100. So 0.5 hours means *half* an hour (30 minutes).\n3. **To convert decimal hours into minutes:** Always multiply the decimal part by 60! (e.g., 0.2 hours × 60 = 12 minutes)." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Finding the Speed", 
        content: "A train travels 240 kilometers. The journey takes 3 hours and 15 minutes. Find the average speed in km/h.\n\n• **Step 1 (Fix the Time):** We cannot use 3.15! 15 minutes is a quarter of an hour (15/60 = 0.25). So the time is actually **3.25 hours**.\n• **Step 2 (The Triangle):** We want Speed. Cover 'S'. We are left with D over T. (Distance ÷ Time).\n• **Step 3 (Plug in):** Speed = 240 ÷ 3.25\n• **Step 4 (Calculate):** 240 ÷ 3.25 = 73.846...\n\n**Final Answer: 73.8 km/h (1 d.p.)**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The most brutal trap is calculating **Average Speed** for a multi-part journey. If you drive to a city at 100km/h and drive back at 50km/h, your average speed is NOT 75km/h! (You spent way more time driving slowly on the way back, so the average drops lower). You CANNOT just average the two speeds. You MUST calculate the **Total Distance** of the whole trip, and divide it by the **Total Time** of the whole trip. Always!" 
      }
    ]
  },
  section: {
    title: "Section Formula: Slicing the Line",
    blocks: [
      { 
        icon: "🔪", 
        title: "1. The Core Concept: The Uneven Cut", 
        content: "The Midpoint formula is great if you want to slice a line exactly in half (a 1:1 ratio). But what if you want to place a dot on a line exactly one-third of the way across? Or split it in a 3:2 ratio? The **Section Formula** is an advanced coordinate geometry tool that lets you perfectly slice any line on a grid in any ratio you choose." 
      },
      { 
        icon: "⚖️", 
        title: "2. The Rules: The Cross-Multiply Magic", 
        content: "The formula looks terrifying: **x = (m₁x₂ + m₂x₁) / (m₁ + m₂)**. But it's actually incredibly simple if you look at the pattern.\n\n• The ratio is m₁ : m₂. (e.g., 3:2).\n• You take the left ratio number (m₁) and multiply it by the RIGHT coordinate (x₂).\n• You take the right ratio number (m₂) and multiply it by the LEFT coordinate (x₁).\n• You 'cross the streams'! Then divide the whole thing by the total parts of the ratio added together." 
      },
      { 
        icon: "🗺️", 
        title: "3. Step-by-Step: Finding the Cut Point", 
        content: "How to split the line between Point A(x₁, y₁) and Point B(x₂, y₂) in the ratio m₁:m₂.\n\n1. **Set up the X:** Cross multiply the ratio numbers with the X coordinates. Add them up. Divide by the total ratio (m₁ + m₂).\n2. **Set up the Y:** Do the exact same cross-multiplication, but this time use the Y coordinates.\n3. **Combine:** Put your new X and new Y together in brackets (x, y). You have found the exact coordinate of the cut!" 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: The 2:1 Split", 
        content: "Find the point P that splits the line from A(2, 4) to B(5, 10) in the ratio 2:1.\n\n• **Step 1 (The Ratio):** m₁ = 2, m₂ = 1. Total ratio = 3.\n• **Step 2 (The X cut):** Cross multiply: (2 × 5) + (1 × 2). That's 10 + 2 = 12. Divide by total ratio: 12 ÷ 3 = **4**.\n• **Step 3 (The Y cut):** Cross multiply: (2 × 10) + (1 × 4). That's 20 + 4 = 24. Divide by total ratio: 24 ÷ 3 = **8**.\n\n**Final Answer: Point P is at (4, 8).**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "A lethal mistake is mixing up the order of the ratio. The formula only works if Point A is the start, Point B is the end, and the ratio matches that direction. If you swap x₁ and x₂ but don't swap the ratio numbers, you will find the point that is 2:1 starting from the WRONG end of the line! Always draw a quick sketch to ensure the 'm₁' matches the starting point!" 
      }
    ]
  },
  sets: {
    title: "Sets and Venn Diagrams: The Sorting Hat",
    blocks: [
      { 
        icon: "🗂️", 
        title: "1. The Core Concept: Organizing the Chaos", 
        content: "Imagine dumping 1,000 random items on the floor. To make sense of them, you start sorting them into boxes: a box for 'Red things', a box for 'Round things'. **Set Theory** is the mathematical language of organizing data into groups. It allows computers to instantly search databases (like finding all movies that are 'Action' AND 'Comedy' but NOT 'Horror')." 
      },
      { 
        icon: "⭕", 
        title: "2. The Rules: The Secret Symbols", 
        content: "You must memorize the secret code of sets:\n\n• **∩ (Intersection / AND):** This looks like an 'n' for iNtersection. It means you only want the items that are in BOTH groups (the overlapping middle of the Venn Diagram).\n• **∪ (Union / OR):** This looks like a 'U'. It means you want EVERYTHING in group A, plus EVERYTHING in group B, joined together in one massive super-group.\n• **' (Complement / NOT):** A tiny little tick mark (like A') means 'Everything outside of A'. It's the rebel symbol. Reject group A!" 
      },
      { 
        icon: "🎨", 
        title: "3. Step-by-Step: Shading the Venn", 
        content: "When asked to shade a region like **(A ∪ B)'**:\n\n1. Work from the inside out, just like BODMAS brackets.\n2. First, figure out what (A ∪ B) is. The Union means EVERYTHING in A and B combined. So the two circles form a giant figure-8 shape.\n3. Next, apply the ' (NOT) symbol outside the brackets.\n4. The NOT symbol means shade the exact OPPOSITE of what you just found. \n5. So, shade the entire blank rectangle background, completely ignoring the two circles!" 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: The Probability Overlap", 
        content: "In a class of 30 students, 20 play Soccer, 15 play Tennis, and 5 play neither. How many play BOTH?\n\n• **Step 1 (The Outsiders):** 5 play neither, so they sit in the background rectangle. This leaves 25 students inside the circles (30 - 5 = 25).\n• **Step 2 (The Impossible Total):** If you add the Soccer kids and Tennis kids (20 + 15), you get 35. But there are only 25 kids available!\n• **Step 3 (Find the overlap):** Why do we have 10 extra kids? Because we counted the kids who play BOTH sports twice! \n• **Step 4 (The math):** 35 - 25 = 10.\n\n**Final Answer: 10 kids play both (Intersection).**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The biggest trap in Venn Diagram word problems is the word **'ONLY'**. If a question says '20 students play Soccer', that means the ENTIRE Soccer circle adds up to 20 (including the intersection in the middle!). But if it says '20 students play ONLY Soccer', that 20 goes purely in the left crescent moon shape, completely avoiding the middle overlap. Read the question carefully: is it the whole circle, or just the 'Only' crescent?" 
      }
    ]
  },
  similarity: {
    title: "Similarity: The Shrink Ray",
    blocks: [
      { 
        icon: "🔍", 
        title: "1. The Core Concept: The Perfect Mini-Me", 
        content: "If you take a photo of a car and zoom in on your phone, the car gets bigger, but its proportions remain identical. It doesn't stretch into a weird limo! In math, two shapes are **Similar** if one is a perfect, proportional enlargement (or shrinkage) of the other. They have the exact same angles, but different side lengths. (Unlike Congruence, where they must be the exact same size)." 
      },
      { 
        icon: "📏", 
        title: "2. The Rules: The Scale Factor (k)", 
        content: "The bridge between two similar shapes is the **Scale Factor (k)**.\n\n• To find 'k', find two sides that match up perfectly (e.g., the bottom base of the small triangle, and the bottom base of the big triangle).\n• Divide the Big side by the Small side. This gives you 'k' (e.g., 10 / 5 = 2. The big shape is 2x larger).\n• To find a missing Big side: Multiply the small side by k.\n• To find a missing Small side: Divide the big side by k." 
      },
      { 
        icon: "📦", 
        title: "3. Step-by-Step: The 2D and 3D Traps", 
        content: "This is where 90% of students fail: The Scale Factor (k) ONLY works for straight 1D lines (lengths, heights, perimeters)!\n\n1. **1D (Lengths):** Multiply by **k**.\n2. **2D (Areas):** If you double the length and width of a square, the area doesn't double; it gets 4 times bigger! You MUST multiply the small area by **k²**.\n3. **3D (Volumes):** If you double the length, width, and depth of a box, the volume gets 8 times bigger! You MUST multiply the small volume by **k³**." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: The Giant's Bucket", 
        content: "Two buckets are mathematically similar. The small bucket is 10cm tall and holds 2 Liters (Volume). The big bucket is 30cm tall. What is the volume of the big bucket?\n\n• **Step 1 (Find 1D k):** Compare the heights (lengths). Big/Small = 30 / 10 = **3**. (k = 3).\n• **Step 2 (The Volume Trap):** We want to find Volume (3D space). We CANNOT just multiply the 2 Liters by 3! We must use **k³**.\n• **Step 3 (Calculate k³):** 3³ = 3 × 3 × 3 = **27**.\n• **Step 4 (Find Volume):** Multiply the small volume by 27. (2 Liters × 27).\n\n**Final Answer: The big bucket holds 54 Liters.**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The classic exam trick is giving you the two AREAS, and asking you to find a missing Length. Students will divide the Big Area by the Small Area to find 'k', and then try to multiply the length by it. **WRONG!** Dividing the areas gives you **k²**, not k! If Big Area is 100 and Small is 25, then k² = 4. You must SQUARE ROOT it to find the true 1D scale factor! (k = 2). Only then can you multiply the lengths by 2." 
      }
    ]
  },
  spot: {
    title: "Spot the Error: The Code Review",
    blocks: [
      { 
        icon: "🕵️", 
        title: "1. The Core Concept: The Teacher's Perspective", 
        content: "The highest level of mathematical mastery is not just solving a problem, but being able to read someone else's messy work, spot the invisible mistake, and explain exactly why they failed. This is called 'Code Review' in the software industry! The **Spot the Error** mode forces you to become the teacher, diagnosing diseases in broken algebraic logic." 
      },
      { 
        icon: "🔍", 
        title: "2. The Strategy: Line by Line Execution", 
        content: "Do not just look at the final answer and say 'It's wrong'. The error happens in the journey.\n\nRead the working out Line by Line. Treat each line transition as an independent step. \nDid they expand the bracket correctly? (Line 1 to 2).\nDid they move the numbers correctly? (Line 2 to 3).\nWhen the logic breaks, you've found the bug." 
      },
      { 
        icon: "🚨", 
        title: "3. The Method: The Big Three Suspects", 
        content: "95% of all mathematical errors fall into three specific categories. Hunt for these first:\n\n1. **The Minus Sign Drop:** They expanded -2(x - 4) and wrote -2x - 8 instead of +8.\n2. **The Order of Operations Crash:** They calculated 5 + 2 × 3 as 21 instead of 11.\n3. **The Invisible One Trap:** They divided (2x² + 2) by 2 and wrote x² instead of x² + 1." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Finding the Bug", 
        content: "Spot the error in this student's work:\nLine 1: 3(x + 2) = 15\nLine 2: 3x + 2 = 15\nLine 3: 3x = 13\nLine 4: x = 13/3\n\n• **Analysis:** Look at Line 1 to Line 2. The student expanded the bracket. 3 times x is 3x. 3 times 2 is 6. But they wrote 2!\n• **The Bug:** The student failed to distribute the 3 to the second term inside the bracket. Line 2 should be 3x + 6 = 15." 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The biggest pitfall when spotting errors is 'Correction Bias'. Because you are a good math student, your brain will often autocorrect a mistake when reading someone else's work, making you completely blind to it! You will read '3x + 2' but your brain processes it as '3x + 6' because you know that's what it *should* be. You must read the math literally character-by-character to beat your own autocorrect!" 
      }
    ]
  },
  triangles: {
    title: "Triangles: The Strongest Shape",
    blocks: [
      { 
        icon: "📐", 
        title: "1. The Core Concept: The Unbreakable Foundation", 
        content: "Why are bridges and cranes built using thousands of steel triangles? Because a triangle is the only polygon in the universe that cannot be deformed without breaking its sides! If you push on a square, it collapses into a slanted rhombus. But a triangle's rigid geometry makes it mathematically unbreakable. Mastering the rules of the triangle unlocks the secrets of architecture, engineering, and trigonometry." 
      },
      { 
        icon: "🏷️", 
        title: "2. The Rules: The Family Tree", 
        content: "You must know the three brothers of the triangle family:\n\n• **Equilateral (The Perfect One):** All 3 sides are equal. All 3 angles are exactly 60°.\n• **Isosceles (The Twins):** 2 sides are equal. The 2 angles at the bottom of those equal sides are also perfectly equal! (This is the most heavily tested triangle in exams).\n• **Scalene (The Rebel):** No sides are equal. No angles are equal. Pure chaos." 
      },
      { 
        icon: "➕", 
        title: "3. Step-by-Step: The 180° Law", 
        content: "The absolute unbreakable law of Euclidean geometry: **The three interior angles of ANY flat triangle will always add up to exactly 180°.**\n\n1. If you know two angles, simply add them together and subtract the total from 180 to find the missing third angle.\n2. **The Exterior Angle Trick:** If you extend one side of a triangle out to make a straight line, the 'exterior' angle on the outside is EXACTLY EQUAL to the sum of the two interior angles on the opposite side! (This saves huge amounts of time on tests)." 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: The Isosceles Puzzle", 
        content: "You have an Isosceles triangle. The single 'top' angle is 40°. Find the size of the two bottom angles.\n\n• **Step 1 (The Total):** We know the whole triangle must hold 180°.\n• **Step 2 (Remove the top):** Subtract the 40° top angle from the total. 180 - 40 = 140°.\n• **Step 3 (The Twin Rule):** The remaining 140° belongs to the two bottom angles. Because it's Isosceles, we know those two angles must be identical twins!\n• **Step 4 (Split it):** Divide 140 by 2. 140 ÷ 2 = 70.\n\n**Final Answer: The bottom angles are both 70°.**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "In an exam drawing, an Isosceles triangle isn't always sitting perfectly upright. It might be rotated on its side, making it incredibly hard to spot the 'bottom' twin angles. **The Trick:** Look for the two little dash marks on the sides (which mean they are equal length). The 'twin' angles are ALWAYS the two angles that are sitting directly opposite those dashed sides! Never trust orientation; trust the dash marks." 
      }
    ]
  },
  variation: {
    title: "Variation & Proportion: The Dance of Variables",
    blocks: [
      { 
        icon: "🔗", 
        title: "1. The Core Concept: The Invisible Strings", 
        content: "In physics and economics, variables are tied together by invisible strings. If you push the gas pedal harder (more fuel), the car goes faster (more speed). This is **Direct Variation**; they grow together. But if you increase the speed of the car, the time it takes to get to the destination drops! This is **Inverse Variation**; as one goes up, the other is forced down. Variation is the math of figuring out exactly how tightly these strings are pulled." 
      },
      { 
        icon: "k", 
        title: "2. The Rules: The Constant 'k'", 
        content: "The tightness of the string is represented by the Constant of Proportionality, called **'k'**.\n\n• **Direct Proportion (y ∝ x):** The formula is **y = kx**. (If x doubles, y doubles).\n• **Inverse Proportion (y ∝ 1/x):** The formula is **y = k/x**. (If x doubles, y gets cut in half!).\n• Your ONLY mission in a variation problem is to hunt down the value of 'k'. Once you have 'k', you unlock the master equation." 
      },
      { 
        icon: "🛠️", 
        title: "3. Step-by-Step: Finding the Master Equation", 
        content: "Every variation problem follows the exact same 4-step rhythm:\n\n1. **Write the Template:** Read the words. If it's direct, write y = kx. If it's inverse, write y = k/x. (Careful: If it says 'proportional to the SQUARE of x', write y = kx²).\n2. **Plug in the pair:** The question will always give you one perfect matching pair of numbers (e.g., y=20 when x=4). Plug them in!\n3. **Solve for k:** Use algebra to find what 'k' is. (e.g., 20 = k × 4, so k = 5).\n4. **Write the Master:** Rewrite your template using the real 'k' (y = 5x). Now you can solve any future question they throw at you!" 
      },
      { 
        icon: "📝", 
        title: "4. Worked Example: Inverse Gravity", 
        content: "Variable 'y' is inversely proportional to 'x'. When x = 2, y = 10. Find 'y' when x = 5.\n\n• **Step 1 (Template):** It says inverse! So the template is **y = k / x**.\n• **Step 2 (Plug in pair):** We know y=10 when x=2. Plug them in: 10 = k / 2.\n• **Step 3 (Solve for k):** Multiply both sides by 2 to get k alone. 10 × 2 = 20. **k = 20**.\n• **Step 4 (Master Equation):** Our master code is **y = 20 / x**.\n• **Step 5 (Answer the question):** Find y when x=5. y = 20 / 5.\n\n**Final Answer: y = 4.**" 
      },
      { 
        icon: "⚠️", 
        title: "5. Common Pitfalls", 
        content: "The absolute most devastating trap is failing to read the word **SQUARE** or **ROOT** in the first sentence. A question will say 'y is directly proportional to the square of x'. Students will robotically write down y = kx, solve for k, and fail the entire question. If it says 'square', you MUST write y = kx²! If it says 'cube', you MUST write y = kx³! Read the first sentence like your life depends on it." 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch8)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 8 successfully written!');

const fs = require('fs');
const path = require('path');

const batch6 = {
  custom: {
    title: "Custom Mode: Forging Your Own Path",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Architect", 
        content: "Learning math isn't always a straight line created by a teacher. Sometimes, you know exactly what your weaknesses are! **Custom Mode** is your personal training ground. It allows you to become the architect of your own education by mixing and matching specific topics that you know you need to practice, completely ignoring the things you've already mastered." 
      },
      { 
        icon: "??", 
        title: "2. The Strategy: Targeted Weaknesses", 
        content: "Don't just pick the topics you are good at! It feels nice to get 100%, but it doesn't make you stronger. The best way to use Custom Mode is to select the 2 or 3 topics that absolutely terrify you in an exam. Force yourself into the uncomfortable zone. That is where real, rapid improvement happens." 
      },
      { 
        icon: "??", 
        title: "3. The Method: Spaced Repetition", 
        content: "When building a custom quiz, use the scientific principle of 'Spaced Repetition'. Don't just cram one topic for 3 hours. Mix a topic you learned today with a topic you learned last week, and one you learned a month ago. Forcing your brain to switch gears and dig up old memories makes those memories permanent." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Ultimate Exam Prep", 
        content: "If you have a test on Algebra and Geometry on Friday, don't just study Algebra on Wednesday and Geometry on Thursday. \n\n• Go into Custom Mode.\n• Select 'Simultaneous Equations' (Algebra) and 'Circle Theorems' (Geometry).\n• By forcing your brain to rapidly switch between algebra logic and geometric visual rules on the same quiz, you are training exactly how you will have to perform in the real exam!" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest mistake students make in Custom Mode is setting the difficulty too high, too fast, and picking 15 different topics at once. It becomes overwhelming, your brain panics, and you learn nothing. Start small: pick exactly 2 related topics on a medium difficulty. Build your confidence, and then scale up." 
      }
    ]
  },
  dotprodgym: {
    title: "Dot Product Gym: Mental Vectors",
    blocks: [
      { 
        icon: "??????", 
        title: "1. The Core Concept: The Calculation Sprint", 
        content: "You already know how the Dot Product works (multiplying the x's, multiplying the y's, and adding them). But knowing the theory isn't enough in a high-pressure exam; you need speed and flawless execution. The **Dot Product Gym** is designed to build your mental arithmetic muscles specifically for vector calculations until it becomes an automatic reflex." 
      },
      { 
        icon: "?", 
        title: "2. The Rules: Speed vs Accuracy", 
        content: "In the Gym, speed is important, but accuracy is king. A single dropped negative sign will destroy your entire scalar product. When you multiply a positive by a negative, the result is negative! When adding the final products together, treat them like a bank account (deposits and withdrawals) to ensure you don't mess up the final number." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Mental Check", 
        content: "When doing dot products in your head:\n\n1. Look at the x-components. Multiply them. Hold that number in your short-term memory (or quickly jot it down).\n2. Look at the y-components. Multiply them. Hold that number.\n3. Add them together. \n4. **Pro-tip:** If the two original vectors have opposite signs in the x-position but same signs in the y-position, you will be doing a subtraction in the final step! Prepare your brain for it." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Mental Execution", 
        content: "Quickly calculate the dot product of [-4, 3] and [2, -5].\n\n• **Mental Step 1:** -4 × 2 = -8. (Store -8 in your head).\n• **Mental Step 2:** 3 × -5 = -15. (Store -15 in your head).\n• **Mental Step 3:** Add them: -8 + -15.\n• **Execution:** Two negatives combining means we go deeper into the negative! 8 + 15 = 23, so the answer is **-23**." 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Under pressure in the Gym, students will accidentally 'cross-multiply' (multiplying the x of the first vector by the y of the second vector). This is a completely different mathematical operation (related to the Cross Product)! Always remember: Top goes with Top, Bottom goes with Bottom. Never cross the streams!" 
      }
    ]
  },
  fracaddgym: {
    title: "Fraction Addition Gym: Common Denominators Fast",
    blocks: [
      { 
        icon: "??????", 
        title: "1. The Core Concept: The Fraction Reflex", 
        content: "Adding fractions is slow and painful if you have to write out every single step. The **Fraction Addition Gym** trains your brain to instantly spot common denominators and execute the numerators in your head. It's about turning a 5-step process into a 2-step mental reflex." 
      },
      { 
        icon: "??", 
        title: "2. The Strategy: The Lowest Common Multiple (LCM)", 
        content: "Don't just blindly multiply the two bottom numbers together! If you are adding 1/6 and 1/8, multiplying them gives a denominator of 48, forcing you to deal with massive numbers. Instead, train your brain to spot the **LCM**. Both 6 and 8 fit perfectly into 24! Using 24 makes the mental math infinitely easier and faster." 
      },
      { 
        icon: "?", 
        title: "3. Step-by-Step: The Cross-Multiply Hack", 
        content: "If the denominators are small prime numbers (like 3 and 5), use the rapid Cross-Multiply hack:\n\n1. Multiply the bottoms to get the new bottom (3 × 5 = 15).\n2. Cross-multiply the bottom-right by the top-left to get the first numerator.\n3. Cross-multiply the bottom-left by the top-right to get the second numerator.\n4. Add those two new numerators together!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Rapid Hack", 
        content: "Quickly calculate **2/3 + 4/5**.\n\n• **Step 1 (Bottom):** 3 × 5 = 15. The denominator is 15.\n• **Step 2 (Top Left):** 5 × 2 = 10.\n• **Step 3 (Top Right):** 3 × 4 = 12.\n• **Step 4 (Add Tops):** 10 + 12 = 22.\n\n**Final Answer: 22/15.** (Done in 5 seconds flat!)" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest mistake in the Gym is forgetting to **Simplify** at the very end. The system will often mark 10/20 as wrong because it's not in its simplest form (1/2). Always take a one-second pause before hitting submit to ask yourself: 'Are both of these numbers even? Can I divide them by 2, 3, or 5?'" 
      }
    ]
  },
  funceval: {
    title: "Function Evaluation: The Math Machine",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Vending Machine", 
        content: "Think of a mathematical function (like **f(x) = 2x + 3**) as a vending machine. The 'x' is the coin slot. You drop a number into the machine, the gears turn, it does the math, and it spits out a completely new number at the bottom. **Function Evaluation** is simply the process of dropping different numbers into the machine and seeing what comes out!" 
      },
      { 
        icon: "??", 
        title: "2. The Rules: Exact Substitution", 
        content: "When a question asks you to find **f(5)**, it is giving you a strict command: 'Erase every single letter 'x' in the equation, and replace it with the number 5 in brackets.'\n\n• If f(x) = x², then f(5) = (5)² = 25.\n• The brackets are CRITICAL! If you are substituting a negative number, failing to use brackets will completely destroy the calculation." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Evaluating Complex Functions", 
        content: "1. Write the original function out on paper.\n2. Wherever you see an 'x', draw empty brackets ( ).\n3. Write the requested number inside EVERY set of brackets.\n4. Use BODMAS (Order of Operations) to calculate the final result. Remember to do powers and brackets before multiplication!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Negative Drop", 
        content: "Given the function **f(x) = x² - 4x + 1**, calculate the value of **f(-3)**.\n\n• **Step 1 (The Brackets):** f(-3) = (-3)² - 4(-3) + 1\n• **Step 2 (The Square):** What is (-3)²? A negative times a negative is positive! It becomes +9.\n• **Step 3 (The Multiply):** What is -4 multiplied by -3? Again, double negative! It becomes +12.\n• **Step 4 (Combine):** We now have 9 + 12 + 1.\n\n**Final Answer: 22.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most brutal trap is evaluating a function like **f(x) = -x²**. What is f(4)? Students often say 'Well, -4 squared is positive 16!' **WRONG!** The minus sign is NOT attached to the x, it is outside! The correct substitution is -(4)². You square the 4 first (getting 16), and THEN apply the minus sign. The true answer is -16. This is why using brackets when substituting is mandatory." 
      }
    ]
  },
  funcgym: {
    title: "Functions Gym: Mental Substitution",
    blocks: [
      { 
        icon: "???", 
        title: "1. The Core Concept: The Speed Calculator", 
        content: "In advanced calculus and graph plotting, you will need to evaluate functions dozens of times to find coordinates. You don't have time to write every step down. The **Functions Gym** trains your working memory to hold numbers, apply BEDMAS/BODMAS mentally, and spit out the correct coordinate instantly." 
      },
      { 
        icon: "?", 
        title: "2. The Strategy: Chunking", 
        content: "When evaluating a long function like f(x) = 2x³ - 5x + 10 in your head, use a psychological trick called 'Chunking'. Break the equation into separate 'chunks' separated by plus/minus signs. Calculate chunk 1, memorize it. Calculate chunk 2, combine it with chunk 1. Then add the +10 at the very end." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Mental Flow", 
        content: "For a mental calculation of f(x) = x² - 3x:\n1. If evaluating f(4): First, find x² (16). Hold it.\n2. Find 3x (12). Hold it.\n3. Perform the subtraction: 16 - 12.\n4. Spit out 4." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Mental Gymnastics", 
        content: "Mentally evaluate **f(-2)** for the function **f(x) = 5x - x²**.\n\n• **Chunk 1:** 5(-2) = -10. (Hold -10 in memory).\n• **Chunk 2:** (-2)². That's +4. But there is a minus sign in front of it in the formula! So the chunk is actually -4.\n• **Combine:** -10 - 4.\n\n**Final Answer: -14.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "Under the time pressure of the Gym, your brain will try to skip the Order of Operations. If evaluating f(x) = 3x² for x=2, your stressed brain might do 3×2 = 6, and then square the 6 to get 36. This is fatally wrong! Powers ALWAYS come before multiplication. Square the 2 first (4), then multiply by 3 (12)." 
      }
    ]
  },
  gk: {
    title: "General Knowledge: The Big Picture",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Connecting the Dots", 
        content: "Math isn't just floating in a vacuum; it is the underlying code of the entire universe! General Knowledge (GK) in math means understanding *why* these formulas exist, who discovered them, and how they apply to physics, engineering, and everyday life. Knowing the history and context of math makes it 100x easier to remember the formulas." 
      },
      { 
        icon: "???", 
        title: "2. The Rules: The Giants of Math", 
        content: "You should know the names of the giants whose shoulders we stand on:\n• **Pythagoras:** Ancient Greek who linked the sides of right triangles.\n• **Isaac Newton & Gottfried Leibniz:** The bitter rivals who both invented Calculus independently.\n• **Al-Khwarizmi:** The Persian scholar who literally invented Algebra (the word algebra comes from his book 'Al-Jabr')." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Real World Application", 
        content: "Whenever you learn a new math topic, ask yourself: 'Where is this used?'\n\n1. **Trigonometry:** Used in video game graphics (rendering 3D worlds on a 2D screen) and architecture.\n2. **Calculus:** Used in aerospace engineering to calculate rocket trajectories and fuel burn rates.\n3. **Matrices:** The absolute foundation of AI, Machine Learning, and Google's search algorithms!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Golden Ratio", 
        content: "You've likely heard of the Fibonacci sequence (1, 1, 2, 3, 5, 8...), where you add the previous two numbers. But did you know if you divide a Fibonacci number by the one before it (e.g., 8/5 = 1.6), it gets closer and closer to a magical number called the **Golden Ratio (1.618...)**? This ratio appears in sunflower seeds, hurricane spirals, the Mona Lisa, and galaxy formations! Math is nature's DNA." 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest pitfall in math education is believing 'I'm never going to use this in real life.' While you might not use the Quadratic Formula to buy groceries, the *process* of learning it rewires your brain. Math teaches you how to break massive, impossible problems down into small, logical steps. It teaches resilience. You are literally upgrading your brain's processing power!" 
      }
    ]
  },
  gst: {
    title: "GST and Taxes: Real World Finance",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Government's Cut", 
        content: "Nothing in life is certain except death and taxes! GST (Goods and Services Tax) or VAT (Value Added Tax) is a percentage fee added by the government to almost everything you buy. If you want to run a business, or just not get ripped off when buying a laptop, you must master how to add taxes to a price, and more importantly, how to strip a tax OUT of a final price." 
      },
      { 
        icon: "??", 
        title: "2. The Rules: The 100% Base", 
        content: "The absolute unbreakable rule of taxes is that **the original price of the item BEFORE tax is always exactly 100%**.\n\n• If GST is 15%, the final price you pay at the register is 115% of the original cost.\n• Never, ever calculate the tax based on the final price! The tax is only calculated on the original base price." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: Extracting the Tax", 
        content: "If a store receipt says 'Total:  (Includes 15% GST)', how much was the tax?\n\n1. Recognize that  represents **115%** of the original price.\n2. **Find 1%:** Divide the total price by 115. ( ÷ 115 = ). This means 1% of the original cost is exactly .\n3. **Find the Tax:** The tax was 15%. So multiply that 1% value by 15! ( × 15 = ).\n4. **Find the Original:** The original was 100%. So multiply the 1% value by 100. ( × 100 = )." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Adding GST", 
        content: "You are a plumber. You charge  for your labor, plus 10% GST. What is the total bill for the customer?\n\n• **Step 1:** The base price is 100%. We are adding 10%.\n• **Step 2:** The total bill will be 110% of the base price.\n• **Step 3:** Use a decimal multiplier! 110% as a decimal is 1.10.\n• **Step 4:** Multiply the base price by the multiplier:  × 1.10 = ****.\n\n**Final Answer: The customer pays .**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most common and devastating error in finance math is trying to 'subtract the tax'. If an item costs  including a 10% tax, students will calculate 10% of 110 (), and subtract it to say the original price was . **WRONG!** If the original was , a 10% tax is .90, making the final price .90! You CANNOT take a percentage of the final price. You must use the 'divide by 110 to find 1%' method!" 
      }
    ]
  },
  gym: {
    title: "Math Gym: The Training Ground",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: Repetition is Mastery", 
        content: "You can read a hundred books about how to ride a bicycle, but until you actually get on one and pedal, you will fall over. Mathematics is exactly the same. Reading the theory (this Learn section) is only 20% of the battle. The other 80% is pure, relentless practice. The **Math Gym** is where you build the muscle memory required to survive high-pressure exams without panicking." 
      },
      { 
        icon: "??", 
        title: "2. The Strategy: Time vs Perfection", 
        content: "In the Gym, you have a timer. This mimics the stress of an exam room. Your goal is not just to get the answer right, but to get it right *efficiently*.\n\n• Don't guess just to be fast. A wrong answer wastes more time than a slow, correct answer.\n• Write down your working! Trying to hold 4 different numbers in your head is a guaranteed way to drop a negative sign and fail." 
      },
      { 
        icon: "??", 
        title: "3. The Method: Analyzing Mistakes", 
        content: "When you get an answer wrong in the Gym, DO NOT instantly skip to the next question! That is a wasted opportunity.\n\n1. Look at the correct answer provided.\n2. Look at your scribbled working.\n3. Find the exact line where your math went wrong (e.g., 'Ah, I added 3 instead of subtracting 3!').\n4. If you don't know why you got it wrong, come back to this Learn section immediately!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Building Stamina", 
        content: "Just like lifting weights, don't start with the 100kg bar. \n\n• **Session 1:** Start with the topics you are confident in, just to get used to the timer and the interface.\n• **Session 2:** Pick one 'safe' topic, and one 'scary' topic.\n• **Session 3:** Full random mode. This forces your brain to instantly switch contexts, which is the exact skill required for a final exam." 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The biggest danger in the Gym is 'Tilt' (a gaming term for getting angry and making worse mistakes). If you get 3 questions wrong in a row, your brain releases stress hormones that literally block your logical thinking pathways. If you are frustrated, **stop**. Close the gym. Breathe. Go do a different topic, or walk away for 5 minutes. You cannot learn math when you are angry." 
      }
    ]
  },
  gymdecimals: {
    title: "Decimals Gym: Precision Under Pressure",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Moving Target", 
        content: "The Decimals Gym tests your ability to track the decimal point without losing your mind. In the real world, misplacing a decimal point by one spot means giving a patient 10x the dose of medicine, or building a bridge that is 10x too short! This gym trains absolute precision." 
      },
      { 
        icon: "??", 
        title: "2. The Strategy: The Multiplication Hop", 
        content: "When multiplying decimals (e.g., 0.05 × 0.4), do NOT try to do the decimal math in your head. \n\n1. Strip the decimals away: Just see '5 × 4'.\n2. Calculate the whole numbers: 5 × 4 = 20.\n3. Count the total invisible hops: 0.05 has 2 hops. 0.4 has 1 hop. Total = 3 hops.\n4. Take your '20' and hop the decimal point 3 spaces LEFT. \n5. Answer: 0.020 (which is 0.02)." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Division Trick", 
        content: "Dividing by a decimal (like 12 ÷ 0.2) is horrifying. The trick? Eliminate the decimal entirely!\n\n1. You are allowed to multiply BOTH numbers by 10, and the answer will remain exactly the same!\n2. Multiply 0.2 by 10 to turn it into a normal '2'.\n3. You MUST multiply the 12 by 10 as well, making it 120.\n4. The new question is 120 ÷ 2. That's incredibly easy: 60!" 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: Mental Division", 
        content: "Mentally calculate: **4.5 ÷ 0.09**\n\n• **Step 1:** The enemy is 0.09. To turn it into a normal '9', we must hop the decimal two spaces (multiply by 100).\n• **Step 2:** We MUST multiply 4.5 by 100 as well to keep it fair. Hop its decimal two spaces right: 4.5 becomes 450.\n• **Step 3:** The new equation is 450 ÷ 9.\n• **Step 4:** Since 45 ÷ 9 = 5, then 450 ÷ 9 = 50.\n\n**Final Answer: 50.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "When ADDING decimals under time pressure, students often right-align the numbers instead of aligning the decimal points! If you add 4.2 and 1.35, and you right-align them so the 2 is above the 5, you will get 5.55. **WRONG!** You MUST stack the decimal dots perfectly vertically. 4.20 + 1.35 = 5.55 is correct. (Wait, let me fix that: 4.2 + 1.35. Right aligned makes the 2 and 5 touch, 1 and 3 touch, getting 1.77. The correct answer is 4.20 + 1.35 = 5.55! Always line up the dots!)" 
      }
    ]
  },
  indicesgym: {
    title: "Indices Gym: The Power Workout",
    blocks: [
      { 
        icon: "??", 
        title: "1. The Core Concept: The Exponent Reflex", 
        content: "The Indices Gym forces you to recognize the three laws of exponents (Multiply=Add, Divide=Subtract, Bracket=Multiply) instantly. In higher-level math, you won't have time to stop and think about these rules; they need to be as natural to you as breathing." 
      },
      { 
        icon: "??", 
        title: "2. The Strategy: Separate the Numbers and Letters", 
        content: "When faced with an ugly expression like (4x³y)², the best strategy is segregation. \n\nDeal with the normal big numbers first! 4² = 16. \nThen deal with the x's. (x³)² = x6. \nThen deal with the y's. (y¹)² = y².\nIf you try to do it all at once, your brain will crash." 
      },
      { 
        icon: "??", 
        title: "3. Step-by-Step: The Negative Flip", 
        content: "When dealing with negative powers in a fraction, use the 'Elevator Trick'.\n\n1. If a term has a negative power on the TOP of a fraction, send it down the elevator to the BOTTOM, and its power becomes positive!\n2. If a term has a negative power on the BOTTOM, send it up the elevator to the TOP, and it becomes positive!\n3. Once everything is positive, use the normal division rule (subtract) to clean it up." 
      },
      { 
        icon: "??", 
        title: "4. Worked Example: The Mixed Division", 
        content: "Simplify: **(15x5) ÷ (3x?²)**\n\n• **Step 1 (The Numbers):** Normal math! 15 ÷ 3 = **5**.\n• **Step 2 (The Letters):** We have x5 ÷ x?².\n• **Step 3 (The Rule):** Division means we SUBTRACT the powers. We have 5 minus -2.\n• **Step 4 (The Trap):** 5 - (-2) creates a double negative! It becomes 5 + 2 = 7.\n\n**Final Answer: 5x7.**" 
      },
      { 
        icon: "??", 
        title: "5. Common Pitfalls", 
        content: "The most frequent error in the Gym is applying the index laws to the BIG normal numbers. If a question asks to simplify **2x³ × 4x²**, students will correctly add the powers (3+2=5) to get x5, but they will ALSO add the big numbers (2+4=6) and write 6x5! **NO!** The big numbers are normal numbers; they are multiplying! 2 × 4 = 8. The correct answer is 8x5. Never use index laws on big numbers!" 
      }
    ]
  }
};

for (const [key, data] of Object.entries(batch6)) {
  const filePath = path.join(__dirname, 'learnContent', key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Batch 6 successfully written!');

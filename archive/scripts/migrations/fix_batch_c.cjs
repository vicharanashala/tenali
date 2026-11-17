const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'learnContent');

const files = {
  dotprodgym: {
    title: "Dot Products Gym: Vector Workout",
    blocks: [
      { icon: "\ud83c\udfaf", title: "1. The Core Concept: Speed-Drilling Dot Products", content: "The Dot Products Gym throws rapid-fire vector multiplication problems at you. You'll practice computing dot products of 2D and 3D vectors under time pressure. The goal is to make the multiply-and-add process so automatic that you don't even think about it." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Quick Component Multiply", content: "\u2022 For 2D vectors (a, b) and (c, d): dot product = ac + bd.\n\u2022 For 3D vectors (a, b, c) and (d, e, f): dot product = ad + be + cf.\n\u2022 Always multiply matching components, then add all products together.\n\u2022 Be extra careful with negative signs during multiplication!" },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Speed Tips", content: "To calculate dot products fast:\n\n1. Write the components vertically aligned.\n2. Multiply each pair mentally.\n3. Keep a running total as you go.\n4. Double-check signs: negative times negative = positive, negative times positive = negative." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: 3D Dot Product", content: "Find (2, -3, 1) . (4, 1, -5).\n\n**Step 1:** 2 * 4 = 8\n**Step 2:** (-3) * 1 = -3\n**Step 3:** 1 * (-5) = -5\n**Step 4:** 8 + (-3) + (-5) = 0\n\n**Final Answer: 0** (These vectors are perpendicular!)" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "In 3D dot products, the most common error is forgetting the third component! Students calculate the first two products and write the answer, completely ignoring the z-components. Always count your components: if the vectors are 3D, you need exactly 3 multiplications before adding." }
    ]
  },
  fracaddgym: {
    title: "Fractions Gym: Adding Fractions Workout",
    blocks: [
      { icon: "\ud83c\udfcb\ufe0f", title: "1. The Core Concept: Fraction Fitness", content: "Adding fractions is one of the most fundamental skills in math, yet it trips up students at every level. This gym drills you on rapid-fire fraction addition until finding common denominators becomes second nature." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Same Denominator Required", content: "You can ONLY add fractions when they have the same denominator.\n\n\u2022 If denominators match: just add the numerators. 3/7 + 2/7 = 5/7.\n\u2022 If denominators differ: find the LCM of both denominators first.\n\u2022 Convert both fractions to equivalent fractions with that LCM.\n\u2022 Then add the numerators." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Quick LCM Trick", content: "For two fractions a/b + c/d where b and d are different:\n\n1. Cross multiply: new numerator 1 = a * d, new numerator 2 = c * b.\n2. New denominator = b * d.\n3. Add: (ad + cb) / (bd).\n4. Simplify the result by dividing top and bottom by their GCD." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Adding Unlike Fractions", content: "Calculate 2/3 + 3/4.\n\n**Step 1:** Cross multiply: 2*4 = 8, 3*3 = 9.\n**Step 2:** Common denominator: 3*4 = 12.\n**Step 3:** 8/12 + 9/12 = 17/12.\n**Step 4:** Convert: 17/12 = 1 and 5/12.\n\n**Final Answer: 1 5/12.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "NEVER add the denominators! 2/3 + 3/4 is NOT 5/7. This is the most common fraction mistake in all of mathematics. You need a COMMON denominator first, then only the numerators get added. The denominator stays the same after addition." }
    ]
  },
  fractionadd: {
    title: "Fractions: The Art of Parts",
    blocks: [
      { icon: "\ud83c\udf55", title: "1. The Core Concept: Slicing the Pizza", content: "A fraction represents a **part of a whole**. When you cut a pizza into 8 equal slices and eat 3, you've eaten 3/8 of the pizza. The top number (numerator) counts how many pieces you have. The bottom number (denominator) tells you how many equal pieces the whole was cut into. Fractions are everywhere: time (quarter past), money (half price), and cooking (3/4 cup)." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Adding and Subtracting", content: "The golden rule: you can ONLY add fractions when the denominators are the same!\n\n\u2022 **Same denominator:** Just add/subtract the tops. 3/8 + 2/8 = 5/8.\n\u2022 **Different denominators:** Find the LCM, convert both fractions, then add.\n\u2022 **Mixed numbers:** Convert to improper fractions first (e.g., 2 1/3 = 7/3), then add.\n\u2022 Always simplify your final answer!" },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Multiplying and Dividing", content: "Multiplication is actually easier than addition!\n\n1. **To multiply:** Multiply the tops together, multiply the bottoms together. (2/3) * (4/5) = 8/15.\n2. **To divide:** FLIP the second fraction and multiply! (2/3) / (4/5) = (2/3) * (5/4) = 10/12 = 5/6.\n3. Always simplify by dividing top and bottom by their GCD." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Mixed Number Subtraction", content: "Calculate 3 1/4 - 1 2/3.\n\n**Step 1:** Convert to improper: 13/4 - 5/3.\n**Step 2:** Find LCM of 4 and 3 = 12.\n**Step 3:** Convert: 39/12 - 20/12.\n**Step 4:** Subtract numerators: 19/12.\n**Step 5:** Convert back: 1 7/12.\n\n**Final Answer: 1 7/12.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most devastating fraction mistake: adding the denominators! When students see 1/3 + 1/4, they write 2/7. **COMPLETELY WRONG!** The denominators must be made the same (LCM = 12), giving 4/12 + 3/12 = 7/12. Also, when dividing fractions, students forget to flip the SECOND fraction. You flip the one you're dividing BY, not the first one!" }
    ]
  },
  funceval: {
    title: "Functions: The Math Machine",
    blocks: [
      { icon: "\u2699\ufe0f", title: "1. The Core Concept: Input Goes In, Output Comes Out", content: "A **function** is like a machine. You feed it a number (input), it processes it according to a rule, and spits out a result (output). If f(x) = 2x + 3, then feeding in x = 4 gives f(4) = 2(4) + 3 = 11. The function is the rule book that tells the machine what to do with whatever you give it." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Function Notation", content: "\u2022 **f(x)** means 'the function f, applied to x'. It does NOT mean f times x!\n\u2022 **f(3)** means 'substitute x = 3 into the function'.\n\u2022 **f(a+1)** means 'everywhere you see x, replace it with (a+1)'.\n\u2022 **Composite functions:** f(g(x)) means 'first apply g, then apply f to the result'." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Evaluating Composite Functions", content: "To find f(g(2)) when f(x) = x^2 and g(x) = 3x + 1:\n\n1. Start from the INSIDE: calculate g(2) first.\n2. g(2) = 3(2) + 1 = 7.\n3. Now use this result as the input for f: f(7) = 7^2 = 49.\n4. Always work inside-out, like peeling an onion." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Multi-Variable Function", content: "If f(x, y) = 3x^2 - 2y + 1, find f(2, 5).\n\n**Step 1:** Replace x with 2 and y with 5.\n**Step 2:** f(2, 5) = 3(2)^2 - 2(5) + 1.\n**Step 3:** = 3(4) - 10 + 1.\n**Step 4:** = 12 - 10 + 1 = 3.\n\n**Final Answer: f(2, 5) = 3.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The deadliest mistake with composite functions is doing them in the WRONG ORDER. f(g(x)) means 'g first, then f'. But students often apply f first. Also, when substituting expressions like f(x+1), students will replace only the first 'x' but not others. If f(x) = x^2 + x, then f(x+1) = (x+1)^2 + (x+1), NOT (x+1)^2 + x!" }
    ]
  },
  funcgym: {
    title: "Functions Gym: Polynomial Evaluation",
    blocks: [
      { icon: "\ud83e\udde0", title: "1. The Core Concept: Speed Substitution", content: "The Functions Gym tests your ability to evaluate polynomial functions quickly. You'll be given a function like f(x) = 2x^3 - x + 4 and asked to compute f(3) as fast as possible. Speed and accuracy with substitution is crucial for every future math topic." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Order of Operations", content: "\u2022 Always compute powers FIRST (x^2, x^3, etc.).\n\u2022 Then multiply by coefficients.\n\u2022 Then add/subtract all terms.\n\u2022 Be extra careful with negative inputs: (-2)^2 = 4, but -2^2 = -4!" },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Horner's Method Shortcut", content: "For speed, rewrite polynomials in nested form:\n\n1. f(x) = 2x^3 - 3x^2 + x - 5 becomes f(x) = ((2x - 3)x + 1)x - 5.\n2. Work from inside out: start with 2, multiply by x, subtract 3, multiply by x, add 1, multiply by x, subtract 5.\n3. This reduces errors because you never compute large powers directly." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Evaluating f(-2)", content: "Find f(-2) where f(x) = x^3 + 2x^2 - 5.\n\n**Step 1:** (-2)^3 = -8.\n**Step 2:** 2(-2)^2 = 2(4) = 8.\n**Step 3:** Combine: -8 + 8 - 5 = -5.\n\n**Final Answer: f(-2) = -5.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The number one error: computing (-2)^3 as +8 instead of -8! An odd power of a negative number stays negative. An even power of a negative number becomes positive. Know this rule cold: (-2)^2 = +4, (-2)^3 = -8, (-2)^4 = +16, (-2)^5 = -32. The sign alternates with odd/even powers." }
    ]
  },
  gk: {
    title: "General Knowledge: The Genius Warm-Up",
    blocks: [
      { icon: "\ud83c\udf0d", title: "1. The Core Concept: Beyond Mathematics", content: "**General Knowledge** isn't just trivia; it's the fuel for a curious mind. This section tests your awareness of the world: science, history, geography, current affairs, and logic. A well-rounded student doesn't just know formulas; they understand the world those formulas describe. GK questions sharpen your brain and improve your ability to think critically across subjects." },
      { icon: "\ud83d\udcda", title: "2. The Strategy: Read Widely, Think Deeply", content: "GK can't be crammed overnight. Build it gradually:\n\n\u2022 Read newspapers or news apps for 10 minutes daily.\n\u2022 Watch educational videos on science and history.\n\u2022 Play quiz games with friends.\n\u2022 Keep a 'fact journal' where you write one interesting thing you learned each day." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Elimination Strategy", content: "When faced with a multiple-choice GK question you don't know:\n\n1. Eliminate obviously wrong options first.\n2. Look for clues in the question itself.\n3. Use logic and common sense.\n4. If two options are very similar, the answer is usually one of them.\n5. Never leave a question blank. An educated guess is better than nothing." },
      { icon: "\ud83d\udcdd", title: "4. Key Areas to Focus On", content: "The most commonly tested GK areas:\n\n\u2022 **Science:** Planets, elements, inventions, human body.\n\u2022 **Geography:** Countries, capitals, rivers, mountains.\n\u2022 **History:** Major events, famous leaders, dates.\n\u2022 **Current Affairs:** Recent discoveries, awards, sports.\n\u2022 **Logic:** Patterns, analogies, odd-one-out." },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest GK trap: overconfidence! Students often rush through GK questions because they 'feel easy'. But the details matter. Confusing Mercury (planet) with Mercury (element), or mixing up 'latitude' and 'longitude' can cost you marks. Read every option carefully before selecting your answer." }
    ]
  },
  gst: {
    title: "GST: Goods and Services Tax",
    blocks: [
      { icon: "\ud83d\udcb0", title: "1. The Core Concept: Tax on Everything", content: "When you buy a phone for Rs. 10,000, the actual price of the phone might only be Rs. 8,475. The rest is **GST** - a tax collected by the government on almost every product and service. GST replaced dozens of older, confusing taxes with one unified system. Understanding GST is not just exam knowledge; it's life knowledge for every purchase you'll ever make." },
      { icon: "\ud83d\udcda", title: "2. The Rules: CGST and SGST", content: "\u2022 GST is split into two equal halves: **CGST** (Central) and **SGST** (State).\n\u2022 If GST is 18%, then CGST = 9% and SGST = 9%.\n\u2022 **Selling Price = Marked Price - Discount + GST**.\n\u2022 GST is always calculated on the price AFTER discount, never on the original marked price.\n\u2022 For inter-state transactions, it's called **IGST** (combined rate)." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. Step-by-Step: Calculating GST", content: "To find the total cost of an item:\n\n1. Start with the Listed/Marked Price.\n2. If there's a discount, subtract it to get the discounted price.\n3. Calculate GST on the DISCOUNTED price (not the original!).\n4. Add the GST amount to the discounted price.\n5. This gives you the final amount the customer pays." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Shopping with GST", content: "A jacket costs Rs. 2000 with 20% discount and 12% GST.\n\n**Step 1:** Discount = 20% of 2000 = Rs. 400.\n**Step 2:** Discounted price = 2000 - 400 = Rs. 1600.\n**Step 3:** GST = 12% of 1600 = Rs. 192.\n**Step 4:** CGST = Rs. 96, SGST = Rs. 96.\n**Step 5:** Total = 1600 + 192 = **Rs. 1792.**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The DEADLIEST mistake: calculating GST on the marked price instead of the discounted price! If an item is Rs. 2000 with 20% discount, the GST must be calculated on Rs. 1600 (the discounted price), NOT on Rs. 2000. Calculating GST on the wrong base amount will make every number in your answer wrong." }
    ]
  },
  guess: {
    title: "Guess the Number: Binary Magic",
    blocks: [
      { icon: "\ud83c\udfb2", title: "1. The Core Concept: The Power of Halving", content: "In this game, the computer thinks of a number between 0 and 31, and you must guess it. The secret is that this game is actually teaching you **Binary Search** - the most important algorithm in computer science. By asking yes/no questions that eliminate HALF the possibilities each time, you can find any number in just 5 guesses." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Binary Card Trick", content: "The game uses magic cards based on powers of 2:\n\n\u2022 Card 1 contains all numbers with a 1 in the ones place (binary).\n\u2022 Card 2 contains all numbers with a 1 in the twos place.\n\u2022 Card 3 contains numbers with a 1 in the fours place.\n\u2022 And so on for 8s and 16s.\n\nBy checking which cards contain your number, you're actually reading its binary representation!" },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Systematic Elimination", content: "Instead of random guessing:\n\n1. Start with the middle of the range.\n2. Is the number higher or lower? This eliminates half the possibilities.\n3. Go to the middle of the remaining range.\n4. Repeat until you find it.\n5. With 32 numbers (0-31), you need at most 5 guesses: 32 > 16 > 8 > 4 > 2 > 1." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: Finding 19", content: "Range: 0 to 31.\n\n**Guess 1:** Is it >= 16? Yes. (Range: 16-31)\n**Guess 2:** Is it >= 24? No. (Range: 16-23)\n**Guess 3:** Is it >= 20? No. (Range: 16-19)\n**Guess 4:** Is it >= 18? Yes. (Range: 18-19)\n**Guess 5:** Is it >= 19? Yes. Found it!\n\nIn binary: 19 = **10011**. Just 5 guesses!" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The biggest mistake is random guessing instead of systematic halving. If you guess 1, then 2, then 3... it could take up to 32 guesses! But with binary search (always guessing the middle), you'll NEVER need more than 5. This is the difference between linear search (slow) and binary search (fast)." }
    ]
  },
  gym: {
    title: "The Gym: Adaptive Math Workout",
    blocks: [
      { icon: "\ud83c\udfcb\ufe0f", title: "1. The Core Concept: Cross-Training for Your Brain", content: "Just like a gym workout targets different muscle groups, the Math Gym targets different mathematical skills. It bundles together 7 different mini-games covering decimals, functions, dot products, fractions, linear equations, indices, and polynomials. The gym adapts to your level, making problems harder when you're succeeding and easier when you're struggling." },
      { icon: "\ud83d\udcda", title: "2. The Strategy: Warm Up Then Push Hard", content: "Like any workout:\n\n\u2022 Start with topics you're comfortable with (warm-up).\n\u2022 Gradually move to harder challenges.\n\u2022 Don't skip topics you find difficult! That's where the growth happens.\n\u2022 Track your accuracy rates. Aim for 80%+ on each topic before moving on." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Rotation System", content: "The Gym cycles through different exercise types:\n\n1. **Decimals:** Signed decimal multiplication.\n2. **Functions:** Polynomial evaluation.\n3. **Dot Products:** 2D and 3D vector products.\n4. **Fractions:** Adding fractions with different denominators.\n5. **Linear Equations:** Solving for x.\n6. **Indices:** Applying index laws.\n7. **Polynomials:** Monomial algebra." },
      { icon: "\ud83d\udcdd", title: "4. Pro Tip: Use It as Exam Prep", content: "The Gym is the perfect exam preparation tool because it:\n\n\u2022 Forces context switching between topics (just like a real exam).\n\u2022 Keeps you sharp on fundamentals.\n\u2022 Identifies weak areas automatically.\n\u2022 Builds speed and confidence under pressure." },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "Don't treat the Gym as a one-time activity! Mathematical fitness, like physical fitness, requires regular practice. Doing the gym once won't help. Aim for 15-20 minutes per day, 3-4 days per week. Consistency beats intensity. Also, don't just rush through problems. Quality matters more than quantity." }
    ]
  },
  gymdecimals: {
    title: "Gym Decimals: Signed Multiplication",
    blocks: [
      { icon: "\u2796", title: "1. The Core Concept: Positive and Negative Decimals", content: "This gym drills you on multiplying decimals that can be positive OR negative. It's not just about the decimal arithmetic; it's about keeping track of signs. In real-world applications (like temperatures, bank balances, and coordinates), you constantly deal with signed numbers. This workout makes you bulletproof." },
      { icon: "\ud83d\udcda", title: "2. The Rules: Sign Rules for Multiplication", content: "The sign rules are simple but students constantly mess them up:\n\n\u2022 **Positive x Positive = Positive** (+2.5 x +3 = +7.5)\n\u2022 **Negative x Negative = Positive** (-2.5 x -3 = +7.5)\n\u2022 **Positive x Negative = Negative** (+2.5 x -3 = -7.5)\n\u2022 **Negative x Positive = Negative** (-2.5 x +3 = -7.5)\n\nSame signs = positive. Different signs = negative." },
      { icon: "\ud83d\udee0\ufe0f", title: "3. The Method: Separate Sign from Value", content: "To multiply signed decimals:\n\n1. First, determine the sign of the answer (same signs = +, different = -).\n2. Then ignore the signs and multiply the absolute values as normal decimals.\n3. Apply the sign you determined in step 1.\n4. Count decimal places to position the decimal point correctly." },
      { icon: "\ud83d\udcdd", title: "4. Worked Example: -0.6 x -0.8", content: "**Step 1 (Sign):** Both negative, so answer is POSITIVE.\n**Step 2 (Values):** 6 x 8 = 48.\n**Step 3 (Decimal places):** 0.6 has 1 place, 0.8 has 1 place. Total = 2 places.\n**Step 4:** Place decimal: 0.48.\n**Step 5:** Apply sign: +0.48.\n\n**Final Answer: -0.6 x -0.8 = 0.48**" },
      { icon: "\u26a0\ufe0f", title: "5. Common Pitfalls", content: "The most common error: getting the sign wrong on negative x negative. Students see two negatives and think the answer must be negative. But negative x negative = POSITIVE! Think of it as: 'I owe you a debt, and I'm taking that debt away from you, so you gain money.' Double negatives cancel out." }
    ]
  }
};

for (const [key, data] of Object.entries(files)) {
  const filePath = path.join(dir, key + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed: ' + key);
}
console.log('Batch C done! Fixed', Object.keys(files).length, 'files.');
